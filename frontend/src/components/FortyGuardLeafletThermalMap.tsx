"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Step 2: Three Temperature Points Definition
export interface TempPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp_f: number;
  temp_c: number;
}

export interface HubLocationConfig {
  id: string;
  name: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  zoom: number;
  // Three temperature anchor points
  temp_points: TempPoint[];
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
    temp_points: [
      { id: "p1", name: "Runway 22R Tarmac (Hot Zone)", lat: 40.6435, lng: -73.7740, temp_f: 72.85, temp_c: 45.4 },
      { id: "p2", name: "Cargo Terminal 4 (Warm Zone)", lat: 40.6470, lng: -73.7820, temp_f: 72.05, temp_c: 42.1 },
      { id: "p3", name: "Cold Storage Vault (Cool Zone)", lat: 40.6360, lng: -73.7860, temp_f: 71.50, temp_c: 14.2 },
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
    temp_points: [
      { id: "p1", name: "Runway 3R Touchdown (Hot Zone)", lat: 33.4370, lng: -112.0050, temp_f: 116.2, temp_c: 46.8 },
      { id: "p2", name: "Cargo Apron 3 (Warm Zone)", lat: 33.4330, lng: -112.0120, temp_f: 111.5, temp_c: 44.2 },
      { id: "p3", name: "Pharma Vault (Cool Zone)", lat: 33.4390, lng: -112.0220, temp_f: 61.7, temp_c: 16.5 },
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
    temp_points: [
      { id: "p1", name: "Berth 4 Dock (Hot Zone)", lat: 29.7220, lng: -95.2550, temp_f: 109.5, temp_c: 43.1 },
      { id: "p2", name: "Container Yard A (Warm Zone)", lat: 29.7180, lng: -95.2620, temp_f: 106.7, temp_c: 41.5 },
      { id: "p3", name: "Climate Shield Yard (Cool Zone)", lat: 29.7250, lng: -95.2670, temp_f: 64.4, temp_c: 18.0 },
    ]
  }
];

// FortyGuard Legend Scale (12 Color Tiers)
const LEGEND_ITEMS = [
  { label: "72.39°F – 72.93°F", color: "#b91c1c", minF: 72.39 },
  { label: "72.05°F – 72.38°F", color: "#dc2626", minF: 72.05 },
  { label: "71.81°F – 72.04°F", color: "#ea580c", minF: 71.81 },
  { label: "71.76°F – 71.81°F", color: "#f97316", minF: 71.76 },
  { label: "71.75°F – 71.76°F", color: "#facc15", minF: 71.75 },
  { label: "71.74°F – 71.75°F", color: "#fde047", minF: 71.74 },
  { label: "71.73°F – 71.74°F", color: "#fef08a", minF: 71.73 },
  { label: "71.71°F – 71.73°F", color: "#d9f99d", minF: 71.71 },
  { label: "71.67°F – 71.71°F", color: "#86efac", minF: 71.67 },
  { label: "71.64°F – 71.67°F", color: "#2dd4bf", minF: 71.64 },
  { label: "71.60°F – 71.63°F", color: "#38bdf8", minF: 71.60 },
  { label: "71.50°F – 71.60°F", color: "#0284c7", minF: 71.50 },
];

function getFortyGuardColor(tempF: number): string {
  if (tempF >= 72.39) return "#b91c1c";
  if (tempF >= 72.05) return "#dc2626";
  if (tempF >= 71.81) return "#ea580c";
  if (tempF >= 71.76) return "#f97316";
  if (tempF >= 71.75) return "#facc15";
  if (tempF >= 71.74) return "#fde047";
  if (tempF >= 71.73) return "#fef08a";
  if (tempF >= 71.71) return "#d9f99d";
  if (tempF >= 71.67) return "#86efac";
  if (tempF >= 71.64) return "#2dd4bf";
  if (tempF >= 71.60) return "#38bdf8";
  return "#0284c7";
}

export default function FortyGuardLeafletThermalMap() {
  const [selectedLoc, setSelectedLoc] = useState<HubLocationConfig>(LOCATIONS[0]);
  const [selectedPoint, setSelectedPoint] = useState<TempPoint | null>(LOCATIONS[0].temp_points[0]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    // Initialize Leaflet Map once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLoc.lat, selectedLoc.lng],
        zoom: selectedLoc.zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    // Fly smoothly to location
    map.flyTo([selectedLoc.lat, selectedLoc.lng], selectedLoc.zoom, { duration: 1.0 });
    layerGroup.clearLayers();

    // Step 1: Fetch Open Source Satellite Tiles (Esri World Imagery)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "&copy; Esri &copy; OpenStreetMap &copy; FortyGuard Microclimate",
    }).addTo(layerGroup);

    // Step 3 & 4: Make Grid Overlay & Fill Grids Replicating FortyGuard Heatmap
    const p1 = selectedLoc.temp_points[0];
    const p2 = selectedLoc.temp_points[1];
    const p3 = selectedLoc.temp_points[2];

    const rows = 14;
    const cols = 12;
    const stepLat = 0.0016;
    const stepLng = 0.0022;
    const startLat = selectedLoc.lat + (rows / 2) * stepLat;
    const startLng = selectedLoc.lng - (cols / 2) * stepLng;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Octagonal Grid Mask
        const distFromCenter = Math.hypot((r - rows / 2) / (rows / 2), (c - cols / 2) / (cols / 2));
        if (distFromCenter > 0.95) continue;

        const cellNorth = startLat - r * stepLat;
        const cellSouth = cellNorth - stepLat;
        const cellWest = startLng + c * stepLng;
        const cellEast = cellWest + stepLng;
        const cellLat = (cellNorth + cellSouth) / 2;
        const cellLng = (cellWest + cellEast) / 2;

        // Step 2 Interpolation: Calculate temperature from 3 anchor points
        const d1 = Math.hypot(cellLat - p1.lat, cellLng - p1.lng) + 0.0001;
        const d2 = Math.hypot(cellLat - p2.lat, cellLng - p2.lng) + 0.0001;
        const d3 = Math.hypot(cellLat - p3.lat, cellLng - p3.lng) + 0.0001;

        const w1 = 1 / Math.pow(d1, 2);
        const w2 = 1 / Math.pow(d2, 2);
        const w3 = 1 / Math.pow(d3, 2);

        const interpF = (p1.temp_f * w1 + p2.temp_f * w2 + p3.temp_f * w3) / (w1 + w2 + w3);
        const interpC = (p1.temp_c * w1 + p2.temp_c * w2 + p3.temp_c * w3) / (w1 + w2 + w3);

        const color = getFortyGuardColor(interpF);

        // Step 4: Fill Grid Box
        const gridBox = L.rectangle([[cellNorth, cellWest], [cellSouth, cellEast]], {
          stroke: false,
          fillColor: color,
          fillOpacity: 0.75,
        }).addTo(layerGroup);

        gridBox.bindTooltip(
          `<b>FortyGuard Grid Box</b><br>Temp: <b>${interpF.toFixed(2)}°F</b> (${interpC.toFixed(1)}°C)`,
          { permanent: false, direction: "center", className: "leaflet-thermal-tooltip" }
        );
      }
    }

    // Step 2: Draw the 3 Temperature Anchor Pins
    selectedLoc.temp_points.forEach((pt) => {
      const pinHtml = `
        <div class="relative cursor-pointer group flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-black/90 border-2 border-white text-white font-mono font-extrabold text-[10px] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-125">
            ${pt.temp_c.toFixed(0)}°
          </div>
        </div>
      `;
      const customIcon = L.divIcon({
        html: pinHtml,
        className: "custom-thermal-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(layerGroup);
      marker.on("click", () => setSelectedPoint(pt));
    });

  }, [selectedLoc]);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 space-y-4 font-mono text-white shadow-2xl">
      
      {/* Header & Location Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs uppercase text-rose-400 font-extrabold tracking-wider">
              FortyGuard Microclimate Heatmap Engine
            </span>
          </div>
          <h3 className="font-extrabold text-base text-white uppercase font-heading">
            {selectedLoc.name} ({selectedLoc.city})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                setSelectedLoc(loc);
                setSelectedPoint(loc.temp_points[0]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLoc.id === loc.id
                  ? "bg-white text-black shadow-lg"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {loc.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Step 5: Legend Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Step 1 & 3 & 4: Map Container (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative w-full h-[460px] rounded-2xl border border-neutral-800 overflow-hidden bg-black">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            <div className="absolute top-3 left-3 z-20 bg-black/90 border border-neutral-800 px-3 py-2 rounded-xl backdrop-blur-md text-xs">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">OpenSource Satellite Base Map</span>
              <span className="text-white font-bold">Esri World Imagery + FortyGuard Grid</span>
            </div>
          </div>

          {/* Selected Point Status Bar */}
          {selectedPoint && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">Selected Temperature Point</span>
                <span className="font-bold text-white">{selectedPoint.name}</span>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-extrabold text-xs">
                  {selectedPoint.temp_f}°F ({selectedPoint.temp_c}°C)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Legend (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 text-xs">
          
          {/* Step 2: Three Temp Points Legend Card */}
          <div className="border-b border-neutral-800 pb-3 space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Step 2: Three Temperature Points</span>
            <div className="space-y-1.5">
              {selectedLoc.temp_points.map((pt, idx) => (
                <div
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-[11px] ${
                    selectedPoint?.id === pt.id
                      ? "bg-neutral-900 border-cyan-500 text-white"
                      : "bg-black/60 border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>P{idx + 1}: {pt.name}</span>
                  <span className="font-bold text-white">{pt.temp_f}°F</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: Official FortyGuard Heatmap Legend */}
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-2">Step 5: FortyGuard Legend (°F)</span>
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {LEGEND_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-black/60 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded border border-white/20" style={{ backgroundColor: item.color }} />
                    <span className="text-white font-bold">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
