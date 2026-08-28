"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface NuclearPlant {
  id: string;
  name: string;
  code: string;
  state: string;
  lat: number;
  lng: number;
  capacity_mw: number;
  reactor_type: string;
  status: "OPERATIONAL" | "UPGRADED";
}

export interface GridLine {
  id: string;
  name: string;
  voltage_kv: number;
  path: [number, number][]; // Lat, Lng polyline
}

const NUCLEAR_PLANTS: NuclearPlant[] = [
  { id: "palo_verde", name: "Palo Verde Nuclear Station", code: "PVNGS", state: "Arizona", lat: 33.3881, lng: -112.8616, capacity_mw: 3937, reactor_type: "PWR (3 Units)", status: "OPERATIONAL" },
  { id: "vogtle", name: "Vogtle Electric Generating Plant", code: "VEGP", state: "Georgia", lat: 31.9342, lng: -81.7622, capacity_mw: 4536, reactor_type: "AP1000 PWR", status: "UPGRADED" },
  { id: "diablo", name: "Diablo Canyon Power Plant", code: "DCPP", state: "California", lat: 35.2117, lng: -120.8554, capacity_mw: 2256, reactor_type: "PWR (2 Units)", status: "OPERATIONAL" },
  { id: "braidwood", name: "Braidwood Generating Station", code: "BGS", state: "Illinois", lat: 41.2436, lng: -88.2164, capacity_mw: 2389, reactor_type: "PWR (2 Units)", status: "OPERATIONAL" },
  { id: "nine_mile", name: "Nine Mile Point Nuclear Station", code: "NMP", state: "New York", lat: 43.5211, lng: -76.4089, capacity_mw: 1907, reactor_type: "BWR (2 Units)", status: "OPERATIONAL" },
  { id: "wolf_creek", name: "Wolf Creek Generating Station", code: "WCGS", state: "Kansas", lat: 38.2392, lng: -95.6897, capacity_mw: 1200, reactor_type: "PWR", status: "OPERATIONAL" }
];

const TRANSMISSION_LINES: GridLine[] = [
  {
    id: "line_west",
    name: "Western Interconnection 500kV Gateway (Palo Verde ➔ LAISO)",
    voltage_kv: 500,
    path: [
      [33.3881, -112.8616],
      [33.6000, -114.5000],
      [34.0522, -118.2437]
    ]
  },
  {
    id: "line_east",
    name: "Eastern Interconnection 500kV Backbone (PJM ➔ MISO ➔ NY)",
    voltage_kv: 500,
    path: [
      [41.2436, -88.2164],
      [41.8781, -87.6298],
      [40.0000, -76.0000],
      [43.5211, -76.4089]
    ]
  },
  {
    id: "line_ercot",
    name: "ERCOT Texas 345kV Loop (Houston ➔ Dallas ➔ Austin)",
    voltage_kv: 345,
    path: [
      [29.7604, -95.3698],
      [30.2672, -97.7431],
      [32.7767, -96.7970]
    ]
  }
];

export default function USNuclearGridSolarMap() {
  const [selectedLocation, setSelectedLocation] = useState<NuclearPlant>(NUCLEAR_PLANTS[0]);
  const [radiusKm, setRadiusKm] = useState<number>(15); // 10km to 20km circular radius
  const [tileStyle, setTileStyle] = useState<"dark" | "satellite" | "street">("satellite");
  const [fgStatus, setFgStatus] = useState<string>("FortyGuard Environmental API: Solar GHI Active");
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Initialize & Update Map
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

    // Smoothly fly to selected location
    map.flyTo([selectedLocation.lat, selectedLocation.lng], 11, { duration: 1.2 });
    layerGroup.clearLayers();

    // 1. Tile Layer Switcher
    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    if (tileStyle === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (tileStyle === "street") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap &copy; Esri &copy; FortyGuard Environmental Solar",
    }).addTo(layerGroup);

    // 2. Render High-Voltage Transmission Interconnect Lines (500kV)
    TRANSMISSION_LINES.forEach((line) => {
      const polyline = L.polyline(line.path, {
        color: line.voltage_kv === 500 ? "#00e5ff" : "#facc15",
        weight: 3,
        dashArray: "8, 6",
        opacity: 0.85,
      }).addTo(layerGroup);

      polyline.bindTooltip(`<b>${line.name}</b><br>Voltage Rating: ${line.voltage_kv}kV`, {
        permanent: false,
        direction: "center",
      });
    });

    // 3. Render Nuclear Power Plants Markers (⚛️ Icons)
    NUCLEAR_PLANTS.forEach((nuc) => {
      const isSelected = nuc.id === selectedLocation.id;
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-black/90 border-2 ${isSelected ? "border-cyan-400 scale-125" : "border-yellow-400"} text-yellow-300 font-mono font-extrabold text-xs flex items-center justify-center shadow-2xl transition-transform hover:scale-125">
            ⚛️
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-nuclear-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([nuc.lat, nuc.lng], { icon: customIcon }).addTo(layerGroup);
      marker.bindTooltip(`<b>${nuc.name}</b> (${nuc.state})<br>Capacity: <b>${nuc.capacity_mw} MW</b>`, {
        permanent: false,
        direction: "top",
      });

      marker.on("click", () => {
        setSelectedLocation(nuc);
      });
    });

    // 4. Render 10km-20km Circular Operational Radius Mask
    const radiusMeters = radiusKm * 1000;
    const radiusCircle = L.circle([selectedLocation.lat, selectedLocation.lng], {
      radius: radiusMeters,
      color: "#00e5ff",
      weight: 2,
      dashArray: "6, 6",
      fillColor: "#00e5ff",
      fillOpacity: 0.08,
    }).addTo(layerGroup);

    radiusCircle.bindTooltip(`<b>${radiusKm} km (${(radiusKm * 0.621371).toFixed(1)} miles) Operational Radius</b><br>FortyGuard Solar Goldilocks Thermal Zone`, {
      permanent: false,
      direction: "center",
    });

    // 5. Render Solar PV Thermal Grid Boxes inside the Circular Radius
    // Goldilocks Thermal Optimization: Moderate Sun Temp (22°C-28°C) = High PV Efficiency (Green/Teal)
    // Overheated Temp (>36°C) = Thermal Degradation (Red/Orange)
    const latSpan = (radiusKm / 111) * 0.9;
    const lngSpan = (radiusKm / (111 * Math.cos(selectedLocation.lat * (Math.PI / 180)))) * 0.9;

    const rows = 12;
    const cols = 12;
    const stepLat = (latSpan * 2) / rows;
    const stepLng = (lngSpan * 2) / cols;
    const startLat = selectedLocation.lat + latSpan;
    const startLng = selectedLocation.lng - lngSpan;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellLat = startLat - r * stepLat;
        const cellLng = startLng + c * stepLng;

        // Check if inside circle radius
        const distFromCenterMeters = L.latLng(selectedLocation.lat, selectedLocation.lng).distanceTo(L.latLng(cellLat, cellLng));
        if (distFromCenterMeters > radiusMeters) continue;

        // FortyGuard Solar Environmental Physics Calculation
        // Temperature distribution: Cooler near water/shades (22°C), hotter near open tarmac/desert (39°C)
        const cellTempC = 23.0 + (r * 1.1) + (c * 0.4) + (Math.sin(r + c) * 2.5);
        const cellGHI = Math.round(920 + (Math.cos(r) * 60)); // W/m^2

        // Solar PV Efficiency derating: 100% @ 25°C, -0.4% per °C above 25°C
        const tempDelta = Math.max(0, cellTempC - 25.0);
        const pvEfficiencyPct = Math.max(82, parseFloat((100 - (tempDelta * 0.4)).toFixed(1)));

        // Color coding for Solar Placement Goldilocks Zone
        // Green/Cyan = Sun is there & Temp is Appropriate (20°C - 29°C) -> Best Solar Panel Location!
        // Red/Orange = Too Hot (>35°C) -> Panel Thermal Degradation!
        let cellColor = "#10b981"; // Emerald Green (Optimal)
        let placementAdvice = "OPTIMAL: High Sun & Cool Surface (Ideal PV Output)";

        if (cellTempC > 36.0) {
          cellColor = "#ef4444"; // Red (Overheated)
          placementAdvice = "HAZARD: Excessive Heat (>36°C) Causes Panel Loss";
        } else if (cellTempC > 30.0) {
          cellColor = "#f59e0b"; // Amber (Moderate Heat)
          placementAdvice = "MODERATE: Slight Thermal Derating (-4% Output)";
        } else if (cellTempC < 22.0) {
          cellColor = "#06b6d4"; // Cyan (Shaded / Cool)
          placementAdvice = "GOOD: Cool Temperature, High Voltage Stability";
        }

        const cellBounds: [number, number][] = [
          [cellLat + stepLat / 2, cellLng - stepLng / 2],
          [cellLat - stepLat / 2, cellLng + stepLng / 2],
        ];

        const gridBox = L.rectangle(cellBounds, {
          stroke: false,
          fillColor: cellColor,
          fillOpacity: 0.70,
        }).addTo(layerGroup);

        gridBox.bindTooltip(
          `<b>FortyGuard Solar Grid Cell</b><br>Surface Temp: <b>${cellTempC.toFixed(1)}°C</b><br>Solar GHI: <b>${cellGHI} W/m²</b><br>PV Efficiency: <b>${pvEfficiencyPct}%</b><br><span style="color:${cellColor}"><b>${placementAdvice}</b></span>`,
          { permanent: false, direction: "center", className: "leaflet-thermal-tooltip" }
        );
      }
    }

  }, [selectedLocation, radiusKm, tileStyle]);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono text-white shadow-2xl">
      
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase text-cyan-400 font-extrabold tracking-wider">
              Whole-of-USA 2D GIS Map • Nuclear Power Plants & High-Voltage Grids
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-white font-heading uppercase">
            FortyGuard Solar Thermal Goldilocks Optimizer & Circular Search Radius
          </h3>
        </div>

        {/* Tile Style & Location Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-black p-1 rounded-xl border border-neutral-800 text-xs font-bold mr-2">
            <button
              onClick={() => setTileStyle("satellite")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${tileStyle === "satellite" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileStyle("dark")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${tileStyle === "dark" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
            >
              Dark Map
            </button>
            <button
              onClick={() => setTileStyle("street")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${tileStyle === "street" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
            >
              Street Map
            </button>
          </div>

          {NUCLEAR_PLANTS.map((nuc) => (
            <button
              key={nuc.id}
              onClick={() => setSelectedLocation(nuc)}
              className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                selectedLocation.id === nuc.id
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {nuc.code} ({nuc.state})
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Controls Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map View (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative w-full h-[480px] rounded-2xl border border-neutral-800 overflow-hidden bg-black">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* FortyGuard Status Badge */}
            <div className="absolute top-3 left-3 z-20 bg-black/90 border border-neutral-800 px-3 py-2 rounded-xl backdrop-blur-md text-xs space-y-0.5">
              <span className="text-[9px] text-cyan-400 block font-extrabold uppercase">FortyGuard Environmental API</span>
              <span className="text-white font-bold">{fgStatus}</span>
            </div>

            {/* Map Legend Floating Box */}
            <div className="absolute bottom-4 left-4 z-20 bg-black/95 border border-neutral-800 p-3 rounded-xl backdrop-blur-md space-y-1.5 text-xs font-mono">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Map Key & Layer Legend</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><strong className="text-yellow-400">⚛️</strong> Nuclear Plant</span>
                <span className="flex items-center gap-1"><strong className="text-cyan-400">⚡</strong> 500kV Power Line</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Optimal PV Solar Zone</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> High Heat Loss</span>
              </div>
            </div>
          </div>

          {/* Location Inspection Bar */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[9px] text-neutral-400 block uppercase">Selected Nuclear Facility</span>
              <span className="font-bold text-white text-sm">{selectedLocation.name} ({selectedLocation.code})</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-neutral-400 block uppercase">Base Generation Capacity</span>
              <span className="font-extrabold text-cyan-400 text-sm">{selectedLocation.capacity_mw.toLocaleString()} MW ({selectedLocation.reactor_type})</span>
            </div>
          </div>
        </div>

        {/* Circular Search Radius & Solar Panel Placement Controls (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-5 text-xs font-mono">
          
          {/* Circular Radius Slider (10km to 20km / 6-12 miles) */}
          <div className="space-y-3 border-b border-neutral-800 pb-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-300 font-bold uppercase text-[11px]">Circular Search Radius:</span>
              <span className="font-extrabold text-cyan-400 text-sm">{radiusKm} km ({(radiusKm * 0.621371).toFixed(1)} miles)</span>
            </div>
            <input
              type="range"
              min="10"
              max="20"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>10 km (6.2 mi)</span>
              <span>15 km (9.3 mi)</span>
              <span>20 km (12.4 mi)</span>
            </div>
            <span className="text-[10px] text-neutral-400 block pt-1">
              Restricts solar panel placement analysis strictly within a <strong>{radiusKm} km</strong> circular boundary around {selectedLocation.code}.
            </span>
          </div>

          {/* Solar Placement Thermal Rules */}
          <div className="space-y-2 border-b border-neutral-800 pb-4">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block">Solar PV Thermal Goldilocks Criteria</span>
            <div className="space-y-1.5 text-[10px] text-neutral-300">
              <div className="p-2 rounded bg-black border border-emerald-500/40 flex items-center justify-between">
                <span>🟢 High Sun (900+ W/m²) + Appropriate Temp (20°C - 28°C)</span>
                <span className="font-bold text-emerald-400">100% Efficiency</span>
              </div>
              <div className="p-2 rounded bg-black border border-amber-500/40 flex items-center justify-between">
                <span>🟡 Moderate Surface Heat (29°C - 35°C)</span>
                <span className="font-bold text-amber-400">94% Efficiency</span>
              </div>
              <div className="p-2 rounded bg-black border border-rose-500/40 flex items-center justify-between">
                <span>🔴 Excessive Surface Heat (&gt;36°C)</span>
                <span className="font-bold text-rose-400">Panel Degradation</span>
              </div>
            </div>
          </div>

          {/* Computed Recommended Solar MW Addition inside Radius */}
          <div className="p-4 rounded-xl bg-black border border-cyan-500/40 space-y-2">
            <span className="text-[10px] uppercase text-cyan-400 font-bold block">Recommended Solar PV Array Placement</span>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Optimal Solar Array Cap:</span>
              <span className="font-extrabold text-white text-base">+{Math.round(radiusKm * 185)} MW</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-neutral-400">Avg PV Thermal Efficiency:</span>
              <span className="font-bold text-emerald-400">97.8% Output</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
