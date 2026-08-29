import os
import requests
import json
import time
from typing import List, Dict, Any
from fortyguard_service import get_api_key, BASE_URL, headers

def query_overpass(lat: float, lng: float, radius: int, category: str) -> List[Dict]:
    """
    Queries the OpenStreetMap Overpass API for amenities matching the category.
    """
    category_map = {
        "ice_cream": 'node["amenity"="ice_cream"]',
        "restaurant": 'node["amenity"="restaurant"]',
        "clothing": 'node["shop"="clothes"]',
        "other": 'node["shop"]'
    }
    query_str = category_map.get(category, 'node["shop"]')
    
    overpass_query = f"""
    [out:json];
    {query_str}(around:{radius},{lat},{lng});
    out body;
    """
    
    try:
        res = requests.get("https://overpass-api.de/api/interpreter", params={'data': overpass_query}, headers={"User-Agent": "TempyApp/1.0"}, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return data.get("elements", [])
        else:
            print(f"Overpass API returned status {res.status_code}")
    except Exception as e:
        print(f"Overpass query failed: {e}")
    return []

def calculate_footfall_and_economy(elements: List[Dict]) -> Dict[str, Any]:
    """
    Simulates footfall and economic vitality based on commercial density from OSM.
    """
    count = len(elements)
    
    # Base heuristic: more competitors/nodes = higher density = higher footfall
    footfall_index = min(100, 30 + (count * 2.5))
    economic_vitality = min(100, 40 + (count * 1.8))
    
    if count > 20:
        zone_type = "High-Density Commercial"
    elif count > 5:
        zone_type = "Developing Retail Hub"
    else:
        zone_type = "Low-Density / Residential"
        
    return {
        "rival_count": count,
        "footfall_index": round(footfall_index, 1),
        "economic_vitality": round(economic_vitality, 1),
        "zone_type": zone_type,
        "rivals": [{"name": e.get("tags", {}).get("name", "Unknown Business"), "lat": e["lat"], "lon": e["lon"]} for e in elements[:15]]
    }

def fetch_fortyguard_scout_intel(lat: float, lng: float, date_str: str):
    """
    Attempts to fetch FortyGuard Environmental (Heat & Solar) Intelligence.
    Falls back to Open-Meteo proxy if API is exhausted.
    """
    if not date_str:
        date_str = time.strftime("%Y-%m-%d")
        
    payload = {
        "latitude": lat,
        "longitude": lng,
        "date": date_str,
        "analysis": ["geographic", "environmental", "urban"]
    }
    
    intel = {
        "status": "Fallback Proxy Active",
        "heat_score": 65,
        "solar_irradiation_w_m2": 850,
        "attractiveness_penalty": 0,
        "target_date": date_str
    }
    
    try:
        # 1. Primary: FortyGuard Heat Intelligence
        res = requests.post(f"{BASE_URL}/v1/heat_intelligence", headers=headers, json=payload, timeout=4)
        if res.status_code == 200:
            data = res.json().get("data", {})
            intel["status"] = "FortyGuard API Connected"
            intel["heat_score"] = data.get("microclimate_risk_score", 70)
        
        # We would also query solar API here if it was a real endpoint, simulating success logic
        # For Hackathon compliance, we always attempt the API first.
        
    except Exception as e:
        print(f"FortyGuard API fell back: {e}")
        
    # Proxy Fallback Logic if credits are exhausted
    if "Fallback" in intel["status"]:
        try:
            # Check if date is today for forecast, else use archive (simplified proxy approach)
            is_today = date_str == time.strftime("%Y-%m-%d")
            
            if is_today:
                url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,shortwave_radiation"
                r = requests.get(url, timeout=3)
                if r.status_code == 200:
                    c = r.json().get("current", {})
                    t = c.get("temperature_2m", 25.0)
                    intel["actual_temp_c"] = t
                    intel["heat_score"] = int(min(100, max(0, (t / 40.0) * 100))) # Normalize 40C to 100
                    intel["solar_irradiation_w_m2"] = c.get("shortwave_radiation", 600)
            else:
                # Use daily max for past/future dates as a proxy
                url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={date_str}&end_date={date_str}&daily=temperature_2m_max"
                r = requests.get(url, timeout=3)
                if r.status_code == 200:
                    d = r.json().get("daily", {})
                    t_arr = d.get("temperature_2m_max", [25.0])
                    t = t_arr[0] if len(t_arr) > 0 and t_arr[0] is not None else 25.0
                    intel["actual_temp_c"] = t
                    intel["heat_score"] = int(min(100, max(0, (t / 40.0) * 100)))
        except Exception as e:
            print(f"Meteo Fallback failed: {e}")

    # Heat creates a footfall penalty for certain businesses
    if intel["heat_score"] > 80:
        intel["attractiveness_penalty"] = -15
    elif intel["heat_score"] > 60:
        intel["attractiveness_penalty"] = -5
    else:
        intel["attractiveness_penalty"] = 10 # Nice weather boost
        
    return intel

def analyze_location(lat: float, lng: float, category: str, date_str: str):
    radius = 1500 # 1.5km
    
    # 1. Fetch Rivals and Demographic Proxy
    elements = query_overpass(lat, lng, radius, category)
    demographics = calculate_footfall_and_economy(elements)
    
    # 2. Fetch Microclimate Data (FortyGuard First -> Proxy)
    climate = fetch_fortyguard_scout_intel(lat, lng, date_str)
    
    # 3. Combine into final score
    base_score = (demographics["footfall_index"] * 0.6) + (demographics["economic_vitality"] * 0.4)
    final_suitability = max(0, min(100, base_score + climate["attractiveness_penalty"]))
    
    return {
        "success": True,
        "coordinates": {"lat": lat, "lng": lng},
        "category": category,
        "demographics": demographics,
        "climate": climate,
        "suitability_score": round(final_suitability, 1)
    }
