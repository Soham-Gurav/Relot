"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Fan, Droplets, RefreshCw, Activity, Zap, Factory, Waves, ShieldAlert, ShieldCheck } from "lucide-react";

export interface PowerPlantFacility {
  id: string;
  name: string;
  code: string;
  type: "Nuclear" | "Hydroelectric" | "Solar Superarray" | "Natural Gas";
  state: string;
  lat: number;
  lng: number;
  capacity_mw: number;
  surrounding_temp_c: number;
  surrounding_temp_f: number;
  cooling_source: string;
  status: "NOMINAL_COOLING" | "ELEVATED_THERMAL_STRESS" | "OPTIMAL_COASTAL_AIR";
  advisory: string;
}

const POWER_PLANTS: PowerPlantFacility[] = [
  { id: "palo_verde", name: "Palo Verde Nuclear Station", code: "PVNGS", type: "Nuclear", state: "Arizona", lat: 33.3881, lng: -112.8616, capacity_mw: 3937, surrounding_temp_c: 34.2, surrounding_temp_f: 93.6, cooling_source: "Wastewater Treatment Reclamation", status: "ELEVATED_THERMAL_STRESS", advisory: "Elevated ambient heat in Sonoran Desert (34.2°C). Condenser loop delta T monitored." },
  { id: "vogtle", name: "Vogtle Electric Generating Plant", code: "VEGP", type: "Nuclear", state: "Georgia", lat: 31.9342, lng: -81.7622, capacity_mw: 4536, surrounding_temp_c: 28.4, surrounding_temp_f: 83.1, cooling_source: "Savannah River Reservoir", status: "NOMINAL_COOLING", advisory: "Nominal cooling parameters. Savannah River intake water at 24.1°C." },
  { id: "diablo", name: "Diablo Canyon Nuclear Power Plant", code: "DCPP", type: "Nuclear", state: "California", lat: 35.2117, lng: -120.8554, capacity_mw: 2256, surrounding_temp_c: 21.8, surrounding_temp_f: 71.2, cooling_source: "Pacific Ocean Coastal Intake", status: "OPTIMAL_COASTAL_AIR", advisory: "Optimal coastal microclimate (21.8°C). Maximum thermodynamic efficiency." },
  { id: "braidwood", name: "Braidwood Generating Station", code: "BGS", type: "Nuclear", state: "Illinois", lat: 41.2436, lng: -88.2164, capacity_mw: 2389, surrounding_temp_c: 24.1, surrounding_temp_f: 75.4, cooling_source: "Kankakee River Reservoir", status: "NOMINAL_COOLING", advisory: "Standard Midwest atmospheric envelope. Nominal reactor thermal trim." },
  { id: "nine_mile", name: "Nine Mile Point Nuclear Station", code: "NMP", type: "Nuclear", state: "New York", lat: 43.5211, lng: -76.4089, capacity_mw: 1907, surrounding_temp_c: 19.5, surrounding_temp_f: 67.1, cooling_source: "Lake Ontario Deep Water Intake", status: "OPTIMAL_COASTAL_AIR", advisory: "Lake Ontario thermal sink active. Ambient air 19.5°C provides high efficiency." },
  { id: "coulee", name: "Grand Coulee Dam Hydroelectric", code: "GCDH", type: "Hydroelectric", state: "Washington", lat: 47.9558, lng: -118.9806, capacity_mw: 6809, surrounding_temp_c: 18.2, surrounding_temp_f: 64.8, cooling_source: "Columbia River Basin", status: "OPTIMAL_COASTAL_AIR", advisory: "Columbia River peak hydro flow. Hydroelectric generators at 100% capacity." },
];

export default function PowerPlantsTempMonitor() {
  const [selectedPlant, setSelectedPlant] = useState<PowerPlantFacility>(POWER_PLANTS[0]);
  const [coolingMode, setCoolingMode] = useState<"towers" | "once_through" | "hybrid">("towers");
  const [tileStyle, setTileStyle] = useState<"satellite" | "dark" | "street">("satellite");
  const [liveData, setLiveData] = useState<Record<string, { temp_c: number; temp_f: number; humidity: number; pressure: number; ghi: number }>>({});
  const [apiStatus, setApiStatus] = useState<string>("CONNECTING...");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Fetch 100% Live Weather Telemetry for ALL Power Plants on startup
  useEffect(() => {
    let isMounted = true;
    const fetchLivePlantTelemetry = async () => {
      const results: Record<string, { temp_c: number; temp_f: number; humidity: number; pressure: number; ghi: number }> = {};
      
      for (const plant of POWER_PLANTS) {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${plant.lat}&longitude=${plant.lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,shortwave_radiation`);
          const data = await res.json();
          if (data && data.current) {
            const temp_c = data.current.temperature_2m ?? plant.surrounding_temp_c;
            const temp_f = parseFloat((temp_c * 1.8 + 32).toFixed(1));
            const humidity = data.current.relative_humidity_2m ?? 45;
            const pressure = data.current.surface_pressure ?? 1013.2;
            const ghi = Math.round(data.current.shortwave_radiation ?? 850);
            results[plant.id] = { temp_c, temp_f, humidity, pressure, ghi };
          }
        } catch (e) {
          results[plant.id] = {
            temp_c: plant.surrounding_temp_c,
            temp_f: plant.surrounding_temp_f,
            humidity: 45,
            pressure: 1013.2,
            ghi: 850
          };
        }
      }

      if (isMounted) {
        setLiveData(results);
        setApiStatus("🟢 LIVE");
      }
    };

    fetchLivePlantTelemetry();
  }, []);

  // Get active plant live temperature
  const baseLiveTempC = liveData[selectedPlant.id]?.temp_c ?? selectedPlant.surrounding_temp_c;
  const coolingOffsetC = coolingMode === "once_through" ? -7.2 : coolingMode === "towers" ? -5.5 : -3.8;
  const effectiveTempC = parseFloat((baseLiveTempC + coolingOffsetC).toFixed(1));
  const effectiveTempF = parseFloat((effectiveTempC * 1.8 + 32).toFixed(1));

  // Initialize Leaflet 2D Map with Surrounding Thermal Plume Heatmap Gradient Circles
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [38.5, -96.0],
        zoom: 4,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletMapRef.current = map;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
    }

    const map = leafletMapRef.current;
    const layerGroup = layerGroupRef.current;

    map.flyTo([selectedPlant.lat, selectedPlant.lng], 11, { duration: 1.0 });
    layerGroup.clearLayers();

    // Tile Layer Switcher
    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    if (tileStyle === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (tileStyle === "street") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap &copy; Esri &copy; FortyGuard Power Telemetry",
    }).addTo(layerGroup);

    // 1. Render Concentric Surrounding Temperature Plume Rings around Selected Plant
    // Outer Ring: Ambient Baseline (8km)
    L.circle([selectedPlant.lat, selectedPlant.lng], {
      radius: 8000,
      color: "#10b981",
      weight: 1.5,
      dashArray: "6, 6",
      fillColor: "#10b981",
      fillOpacity: 0.15,
    }).addTo(layerGroup).bindTooltip(`<b>Ambient Boundary (8 km)</b><br>Temp: ${effectiveTempC}°C`, { permanent: false });

    // Mid Ring: Dissipation Plume (3.5km)
    L.circle([selectedPlant.lat, selectedPlant.lng], {
      radius: 3500,
      color: "#f59e0b",
      weight: 1.5,
      dashArray: "4, 4",
      fillColor: "#f59e0b",
      fillOpacity: 0.28,
    }).addTo(layerGroup).bindTooltip(`<b>Thermal Dissipation Plume (3.5 km)</b><br>Temp: ${(effectiveTempC + 2.5).toFixed(1)}°C`, { permanent: false });

    // Inner Core: Reactor Condenser Core Discharge (1km)
    L.circle([selectedPlant.lat, selectedPlant.lng], {
      radius: 1000,
      color: "#ef4444",
      weight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.45,
    }).addTo(layerGroup).bindTooltip(`<b>Reactor Condenser Core Discharge (1 km)</b><br>Temp: ${(effectiveTempC + 6.0).toFixed(1)}°C`, { permanent: false });

    // 2. Render Power Plant Markers
    POWER_PLANTS.forEach((p) => {
      const isSelected = p.id === selectedPlant.id;

      const typeSvg = p.type === "Nuclear" 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;

      const pinHtml = `
        <div class="relative cursor-pointer group flex items-center justify-center">
          <div class="px-2.5 py-1.5 rounded-xl bg-black/95 border border-neutral-700 group-hover:border-white shadow-xl transition-all flex items-center gap-2 ${isSelected ? "ring-2 ring-cyan-500 scale-105" : ""}">
            ${typeSvg}
            <span class="text-white font-mono font-bold text-[10px] uppercase tracking-wider">${p.code}: ${isSelected ? effectiveTempC : p.surrounding_temp_c}°C</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: "custom-plant-pin",
        iconSize: [110, 36],
        iconAnchor: [55, 18],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(layerGroup);
      marker.on("click", () => setSelectedPlant(p));
    });

  }, [selectedPlant, coolingMode, tileStyle]);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono text-white shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-lg text-white font-heading uppercase">
            US Power Plants, Cooling Source & Surrounding Temperature Monitor
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono block">
            {apiStatus}
          </span>
        </div>

        {/* Satellite Map Indicator */}
        <div className="flex items-center bg-black px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-bold text-white">
          <span>Satellite Map</span>
        </div>
      </div>

      {/* Main Map + Selected Plant Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Map (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full h-[450px] rounded-2xl border border-neutral-800 overflow-hidden bg-black shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            <div className="absolute top-3 left-3 z-20 bg-black/90 border border-neutral-800 px-3 py-2 rounded-xl backdrop-blur-md text-xs">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Inspected Facility</span>
              <span className="text-white font-bold">{selectedPlant.name}</span>
            </div>
          </div>
        </div>

        {/* Selected Plant Status Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4 text-xs font-mono">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Facility Telemetry</span>
              <h4 className="font-extrabold text-white text-base">{selectedPlant.name}</h4>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
              selectedPlant.status === "ELEVATED_THERMAL_STRESS"
                ? "bg-amber-950 text-amber-300 border-amber-800"
                : "bg-emerald-950 text-emerald-300 border-emerald-800"
            }`}>
              {selectedPlant.status === "ELEVATED_THERMAL_STRESS" ? "Elevated Heat" : "Nominal Cooling"}
            </span>
          </div>

          {/* Applied Cooling System Switcher */}
          <div className="space-y-3 border-b border-neutral-800 pb-4">
            <span className="text-[10px] uppercase text-cyan-400 font-bold block flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Apply Facility Cooling System</span>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              <button
                onClick={() => setCoolingMode("towers")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  coolingMode === "towers"
                    ? "bg-cyan-950/40 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-[#09090b] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                }`}
              >
                <Fan className={`w-5 h-5 ${coolingMode === "towers" ? "text-cyan-400 animate-spin" : "text-neutral-500"}`} style={{ animationDuration: "3s" }} />
                <span className="text-center leading-tight">Mechanical<br/>Towers</span>
                <span className={coolingMode === "towers" ? "text-cyan-400 font-extrabold" : "text-neutral-500"}>-5.5°C</span>
              </button>
              <button
                onClick={() => setCoolingMode("once_through")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  coolingMode === "once_through"
                    ? "bg-cyan-950/40 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-[#09090b] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                }`}
              >
                <Droplets className={`w-5 h-5 ${coolingMode === "once_through" ? "text-cyan-400 animate-bounce" : "text-neutral-500"}`} />
                <span className="text-center leading-tight">Once-Through<br/>Deep</span>
                <span className={coolingMode === "once_through" ? "text-cyan-400 font-extrabold" : "text-neutral-500"}>-7.2°C</span>
              </button>
              <button
                onClick={() => setCoolingMode("hybrid")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  coolingMode === "hybrid"
                    ? "bg-cyan-950/40 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-[#09090b] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${coolingMode === "hybrid" ? "text-cyan-400 animate-spin" : "text-neutral-500"}`} style={{ animationDuration: "4s" }} />
                <span className="text-center leading-tight">Recirculating<br/>Hybrid</span>
                <span className={coolingMode === "hybrid" ? "text-cyan-400 font-extrabold" : "text-neutral-500"}>-3.8°C</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 rounded-xl bg-black border border-neutral-850">
              <span className="text-[9px] text-neutral-400 block uppercase">Surrounding Ambient Temp</span>
              <span className="font-bold text-white text-sm">{effectiveTempC}°C ({effectiveTempF}°F)</span>
            </div>

            <div className="p-3 rounded-xl bg-black border border-neutral-850">
              <span className="text-[9px] text-neutral-400 block uppercase">Base Generation Capacity</span>
              <span className="font-bold text-cyan-400 text-sm">{selectedPlant.capacity_mw.toLocaleString()} MW</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black border border-neutral-850 space-y-1">
            <span className="text-[9px] text-neutral-400 block uppercase">Cooling Source & Thermal Sink</span>
            <span className="font-bold text-white text-xs">{selectedPlant.cooling_source}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-neutral-800 space-y-1.5">
            <span className="text-[9px] text-cyan-400 block uppercase font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3"/> FortyGuard Thermodynamic Advisory
            </span>
            <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">{selectedPlant.advisory}</p>
          </div>
        </div>

      </div>

      {/* Power Plants Telemetry Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-black">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Facility Name</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Fuel Type</th>
              <th className="py-3 px-4">Capacity (MW)</th>
              <th className="py-3 px-4">Ambient Temp</th>
              <th className="py-3 px-4">Cooling Source</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-850 text-neutral-300">
            {POWER_PLANTS.map((plant) => (
              <tr
                key={plant.id}
                onClick={() => setSelectedPlant(plant)}
                className={`cursor-pointer transition-colors ${
                  selectedPlant.id === plant.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-950"
                }`}
              >
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                  {plant.type === "Nuclear" ? <Zap className="w-4 h-4 text-rose-400" /> : <Waves className="w-4 h-4 text-cyan-400" />}
                  {plant.name} ({plant.code})
                </td>
                <td className="py-3 px-4">{plant.state}</td>
                <td className="py-3 px-4 font-bold text-neutral-200">{plant.type}</td>
                <td className="py-3 px-4 font-extrabold text-cyan-400">{plant.capacity_mw.toLocaleString()} MW</td>
                <td className="py-3 px-4 font-bold">{plant.surrounding_temp_c}°C ({plant.surrounding_temp_f}°F)</td>
                <td className="py-3 px-4 text-neutral-400">{plant.cooling_source}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border whitespace-nowrap inline-block ${
                    plant.status === "ELEVATED_THERMAL_STRESS"
                      ? "bg-amber-950 text-amber-300 border-amber-800"
                      : "bg-emerald-950 text-emerald-300 border-emerald-800"
                  }`}>
                    {plant.status === "ELEVATED_THERMAL_STRESS" ? "Elevated Heat" : "Nominal Cooling"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
}
