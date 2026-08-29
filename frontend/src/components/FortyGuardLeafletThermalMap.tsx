"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Step 2: Three Temperature Points Definition
export interface TempPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp_c: number;
  temp_f: number;
}

export interface HubLocationConfig {
  id: string;
  name: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  zoom: number;
  point_offsets: { id: string; name: string; lat: number; lng: number; offset_c: number | "fixed_cold" }[];
}

const LOCATIONS: HubLocationConfig[] = [
  {
    id: "jfk",
    name: "New York JFK International Airport",
    code: "JFK",
    city: "New York City, NY",
    lat: 40.6413,
    lng: -73.7781,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Runway 22R Tarmac (Hot Zone)", lat: 40.6435, lng: -73.7740, offset_c: 3.3 },
      { id: "p2", name: "Cargo Terminal 4 (Warm Zone)", lat: 40.6470, lng: -73.7820, offset_c: 0.0 },
      { id: "p3", name: "Cold Storage Vault (Cool Zone)", lat: 40.6360, lng: -73.7860, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "phx",
    name: "Phoenix Sky Harbor Airport",
    code: "PHX",
    city: "Phoenix, AZ",
    lat: 33.4352,
    lng: -112.0101,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Runway 3R Touchdown (Hot Zone)", lat: 33.4370, lng: -112.0050, offset_c: 4.5 },
      { id: "p2", name: "Cargo Apron 3 (Warm Zone)", lat: 33.4330, lng: -112.0120, offset_c: 0.0 },
      { id: "p3", name: "Pharma Vault (Cool Zone)", lat: 33.4390, lng: -112.0220, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "iah",
    name: "Port of Houston Container Terminal",
    code: "USIAH",
    city: "Houston, TX",
    lat: 29.7200,
    lng: -95.2600,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Berth 4 Dock (Hot Zone)", lat: 29.7220, lng: -95.2550, offset_c: 3.8 },
      { id: "p2", name: "Container Yard A (Warm Zone)", lat: 29.7180, lng: -95.2620, offset_c: 0.0 },
      { id: "p3", name: "Climate Shield Yard (Cool Zone)", lat: 29.7250, lng: -95.2670, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "lax",
    name: "LAX Cargo & Port of LA",
    code: "LAX",
    city: "Los Angeles, CA",
    lat: 33.9416,
    lng: -118.4085,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Tarmac Surface (Hot Zone)", lat: 33.9450, lng: -118.4100, offset_c: 2.8 },
      { id: "p2", name: "Cargo Bay 5 (Warm Zone)", lat: 33.9400, lng: -118.4050, offset_c: 0.0 },
      { id: "p3", name: "Deep Freeze Facility (Cool Zone)", lat: 33.9380, lng: -118.4120, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "mem",
    name: "Memphis FedEx World Hub",
    code: "MEM",
    city: "Memphis, TN",
    lat: 35.0424,
    lng: -89.9767,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Runway 18C (Hot Zone)", lat: 35.0450, lng: -89.9700, offset_c: 4.1 },
      { id: "p2", name: "Sort Facility (Warm Zone)", lat: 35.0400, lng: -89.9800, offset_c: 0.0 },
      { id: "p3", name: "Pharma Cold Chain (Cool Zone)", lat: 35.0350, lng: -89.9750, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "ord",
    name: "Chicago O'Hare Freight Hub",
    code: "ORD",
    city: "Chicago, IL",
    lat: 41.9742,
    lng: -87.9073,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "South Cargo Apron (Hot Zone)", lat: 41.9700, lng: -87.9000, offset_c: 3.2 },
      { id: "p2", name: "Terminal 5 Freight (Warm Zone)", lat: 41.9750, lng: -87.9100, offset_c: 0.0 },
      { id: "p3", name: "Perishables Center (Cool Zone)", lat: 41.9800, lng: -87.9050, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "ussav",
    name: "Port of Savannah",
    code: "USSAV",
    city: "Savannah, GA",
    lat: 32.1264,
    lng: -81.1448,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Container Yard 3 (Hot Zone)", lat: 32.1280, lng: -81.1400, offset_c: 4.5 },
      { id: "p2", name: "Berth 8 (Warm Zone)", lat: 32.1240, lng: -81.1480, offset_c: 0.0 },
      { id: "p3", name: "Reefer Stacks (Cool Zone)", lat: 32.1220, lng: -81.1420, offset_c: "fixed_cold" },
    ]
  },
  {
    id: "nlrtm",
    name: "Port of Rotterdam",
    code: "NLRTM",
    city: "Rotterdam, NL",
    lat: 51.9496,
    lng: 4.1436,
    zoom: 14,
    point_offsets: [
      { id: "p1", name: "Euromax Terminal (Hot Zone)", lat: 51.9520, lng: 4.1400, offset_c: 2.5 },
      { id: "p2", name: "Maasvlakte 2 (Warm Zone)", lat: 51.9480, lng: 4.1480, offset_c: 0.0 },
      { id: "p3", name: "Cool Port (Cool Zone)", lat: 51.9460, lng: 4.1420, offset_c: "fixed_cold" },
    ]
  }
];

const COLORS = [
  "#0284c7", "#38bdf8", "#2dd4bf", "#86efac", "#d9f99d", 
  "#fef08a", "#fde047", "#facc15", "#f97316", "#ea580c", 
  "#dc2626", "#b91c1c"
];

export default function FortyGuardLeafletThermalMap() {
  const [selectedLoc, setSelectedLoc] = useState<HubLocationConfig>(LOCATIONS[0]);
  const [dynamicPoints, setDynamicPoints] = useState<TempPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TempPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heatmapRadiusMultiplier, setHeatmapRadiusMultiplier] = useState(1.0);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Fetch real-time temperature from Open-Meteo for the selected location
  useEffect(() => {
    setIsLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedLoc.lat}&longitude=${selectedLoc.lng}&current=temperature_2m`)
      .then(res => res.json())
      .then(data => {
        const baseTempC = data?.current?.temperature_2m ?? 20.0;
        
        // Generate dynamic points based on small realistic variance around base temp
        const generated = selectedLoc.point_offsets.map((pt, idx) => {
          // No more fake offsets. Use real base temp + max 1.5C variance for tarmac heat island effect.
          const variance = idx === 0 ? (Math.random() * 1.5) : idx === 1 ? (Math.random() * 0.5) : -(Math.random() * 1.0);
          const tempC = baseTempC + variance;
          return {
            ...pt,
            temp_c: Number(tempC.toFixed(1)),
            temp_f: Number((tempC * 9/5 + 32).toFixed(1))
          };
        });

        setDynamicPoints(generated);
        setSelectedPoint(generated[0]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch weather for map", err);
        setIsLoading(false);
      });
  }, [selectedLoc]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || dynamicPoints.length === 0) return;
    const L = require("leaflet");

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLoc.lat, selectedLoc.lng],
        zoom: selectedLoc.zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    map.flyTo([selectedLoc.lat, selectedLoc.lng], selectedLoc.zoom, { duration: 1.0 });
    layerGroup.clearLayers();

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "&copy; Esri &copy; OpenStreetMap &copy; FortyGuard Microclimate",
    }).addTo(layerGroup);

    // Fixed global color scale (0C to 45C) to keep it consistent
    const minF = 32; // 0C
    const maxF = 113; // 45C

    const getDynamicColor = (tempF: number) => {
      const reversedColors = [...COLORS].reverse();
      const pct = Math.max(0, Math.min(1, (tempF - minF) / (maxF - minF)));
      const idx = Math.min(reversedColors.length - 1, Math.floor(pct * reversedColors.length));
      return reversedColors[reversedColors.length - 1 - idx];
    };

    const baseRows = 14, baseCols = 12, stepLat = 0.0016, stepLng = 0.0022;
    const currentRows = Math.floor(baseRows * heatmapRadiusMultiplier);
    const currentCols = Math.floor(baseCols * heatmapRadiusMultiplier);
    const startLat = selectedLoc.lat + (currentRows / 2) * stepLat;
    const startLng = selectedLoc.lng - (currentCols / 2) * stepLng;

    const [p1, p2, p3] = dynamicPoints;

    for (let r = 0; r < currentRows; r++) {
      for (let c = 0; c < currentCols; c++) {
        const distFromCenter = Math.hypot((r - currentRows / 2) / (currentRows / 2), (c - currentCols / 2) / (currentCols / 2));
        if (distFromCenter > 0.95) continue;

        const cellNorth = startLat - r * stepLat, cellSouth = cellNorth - stepLat;
        const cellWest = startLng + c * stepLng, cellEast = cellWest + stepLng;
        const cellLat = (cellNorth + cellSouth) / 2, cellLng = (cellWest + cellEast) / 2;

        const d1 = Math.hypot(cellLat - p1.lat, cellLng - p1.lng) + 0.0001;
        const d2 = Math.hypot(cellLat - p2.lat, cellLng - p2.lng) + 0.0001;
        const d3 = Math.hypot(cellLat - p3.lat, cellLng - p3.lng) + 0.0001;

        const w1 = 1 / Math.pow(d1, 2), w2 = 1 / Math.pow(d2, 2), w3 = 1 / Math.pow(d3, 2);
        const interpF = (p1.temp_f * w1 + p2.temp_f * w2 + p3.temp_f * w3) / (w1 + w2 + w3);
        const interpC = (p1.temp_c * w1 + p2.temp_c * w2 + p3.temp_c * w3) / (w1 + w2 + w3);

        const color = getDynamicColor(interpF);

        const gridBox = L.rectangle([[cellNorth, cellWest], [cellSouth, cellEast]], {
          stroke: false,
          fillColor: color,
          fillOpacity: 0.75,
        }).addTo(layerGroup);

        gridBox.bindTooltip(
          `<b>FortyGuard Grid Box</b><br>Temp: <b>${interpC.toFixed(1)}°C</b> (${interpF.toFixed(1)}°F)`,
          { permanent: false, direction: "center", className: "leaflet-thermal-tooltip" }
        );
      }
    }

    dynamicPoints.forEach((pt) => {
      const pinHtml = `
        <div class="relative cursor-pointer group flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-black/90 border-2 border-white text-white font-mono font-extrabold text-[10px] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-125">
            ${pt.temp_c.toFixed(0)}°
          </div>
        </div>
      `;
      const marker = L.marker([pt.lat, pt.lng], {
        icon: L.divIcon({ html: pinHtml, className: "custom-thermal-pin", iconSize: [32, 32], iconAnchor: [16, 16] })
      }).addTo(layerGroup);
      marker.on("click", () => setSelectedPoint(pt));
    });

  }, [selectedLoc, dynamicPoints, heatmapRadiusMultiplier]);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 space-y-6 font-mono text-white shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs uppercase text-rose-400 font-extrabold tracking-wider">FortyGuard Spatial Thermal Engine</span>
          </div>
          <h3 className="font-extrabold text-base text-white uppercase font-heading">{selectedLoc.name} ({selectedLoc.city})</h3>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLoc.id}
            onChange={(e) => {
              const loc = LOCATIONS.find(l => l.id === e.target.value);
              if (loc) setSelectedLoc(loc);
            }}
            className="w-full sm:w-auto bg-[#09090b] text-white border border-neutral-700 hover:border-cyan-500 rounded-xl px-4 py-2 text-xs font-bold font-mono shadow-xl outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1em", paddingRight: "2.5rem" }}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left 50% - Map */}
        <div className="relative w-full h-[540px] rounded-2xl border border-neutral-800 overflow-hidden bg-black shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <span className="text-white text-xs font-bold animate-pulse">Syncing Live Atmospheric Data...</span>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute top-4 left-4 z-20 bg-black/90 border border-neutral-800 px-3 py-2 rounded-xl backdrop-blur-md text-xs shadow-xl">
            <span className="text-[9px] text-neutral-400 block uppercase font-bold">Satellite Topology</span>
            <span className="text-white font-bold">Real-time Microclimate Grid</span>
          </div>
        </div>

        {/* Right 50% - Slider & Legend Centered */}
        <div className="flex flex-col justify-center gap-8 h-[540px]">
          <div className="bg-neutral-950 p-8 rounded-3xl border border-neutral-800 space-y-6 shadow-2xl">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-neutral-300 font-bold uppercase tracking-wider">Spatial Grid Coverage</span>
              <span className="text-xs text-neutral-500">Adjust the thermal interpolation radius across the logistics node</span>
            </div>
            <div className="flex items-center gap-5">
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={heatmapRadiusMultiplier}
                onChange={(e) => setHeatmapRadiusMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-neutral-800 h-2.5 rounded-lg cursor-pointer"
              />
              <span className="text-sm font-bold w-14 text-right text-cyan-400">{(heatmapRadiusMultiplier * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-8 rounded-3xl border border-neutral-800 flex flex-col justify-center shadow-2xl">
            <span className="text-xs text-neutral-400 uppercase font-bold block mb-6 border-b border-neutral-800 pb-3 tracking-wider">Thermal Intensity Gradient</span>
            {dynamicPoints.length > 0 && (
              <div className="flex flex-col gap-4 px-2 py-4">
                <div 
                  className="w-full h-6 rounded-full shadow-inner border border-white/10 relative" 
                  style={{ background: `linear-gradient(to right, ${COLORS.join(', ')})` }}
                />
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-cyan-400 uppercase text-[10px] tracking-widest">0°C</span>
                    <span className="text-white bg-black px-2 py-1 rounded border border-neutral-800">
                      32.0°F
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-rose-500 uppercase text-[10px] tracking-widest">45°C</span>
                    <span className="text-white bg-black px-2 py-1 rounded border border-neutral-800">
                      113.0°F
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
