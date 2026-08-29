"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Rival {
  name: string;
  lat: number;
  lon: number;
}

interface ScoutMapProps {
  center: [number, number];
  rivals: Rival[];
  heatScore: number;
  actualTempC?: number;
}

export default function ScoutMap({ center, rivals, heatScore, actualTempC }: ScoutMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [showHeatmap, setShowHeatmap] = useState(true);

  // Determine heat color based on score (higher = red, lower = green)
  const getHeatColor = (score: number) => {
    if (score > 80) return "#ef4444"; // rose-500
    if (score > 60) return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
  };

  const prevCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, 14);
      prevCenter.current = center;

      // OpenStreetMap Tiles inverted for dark mode
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          className: 'map-tiles'
        }
      ).addTo(mapRef.current);
    } else {
      // Only reset view if the target coordinate actually changed (prevents zoom reset on toggle)
      if (prevCenter.current?.[0] !== center[0] || prevCenter.current?.[1] !== center[1]) {
        mapRef.current.setView(center, 14);
        prevCenter.current = center;
      }
    }

    // Clear existing layers (except tile layer)
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const heatColor = getHeatColor(heatScore);

    // 1. FortyGuard / Proxy Heatmap Overlay (Grid Map)
    if (showHeatmap) {
      const GRID_SIZE = 12;
      const LAT_SPAN = 0.02; // ~2km
      const LNG_SPAN = 0.025; 
      
      const minLat = center[0] - LAT_SPAN / 2;
      const minLng = center[1] - LNG_SPAN / 2;
      const latStep = LAT_SPAN / GRID_SIZE;
      const lngStep = LNG_SPAN / GRID_SIZE;
      
      // Use the ACTUAL temperature from the proxy, or fallback to derivation
      const baseTemp = actualTempC !== undefined ? actualTempC : Math.round((heatScore / 100) * 40);
      const hotCenter = [center[0] + LAT_SPAN * 0.15, center[1] + LNG_SPAN * 0.1];
      
      let maxTempNode: any = null;
      let minTempNode: any = null;
      let midTempNode: any = null;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const cellLat = minLat + (i * latStep);
          const cellLng = minLng + (j * lngStep);
          
          // Calculate temp variance (urban heat island effect is typically +1 to +4 degrees over base)
          const dist = Math.sqrt(Math.pow(cellLat - hotCenter[0], 2) + Math.pow(cellLng - hotCenter[1], 2));
          // Reduce the variance multiplier so the grid stays realistic to the actual temperature
          let cellTemp = baseTemp + (1.5 - (dist * 100)) + (Math.random() * 0.8 - 0.4);
          cellTemp = Math.max(-10, Math.min(50, cellTemp)); // Hard caps
          
          // HSL Color mapping (Blue=240 to Red=0) based on temp 10C to 40C
          const normalized = Math.max(0, Math.min(1, (cellTemp - 10) / 30));
          const hue = 240 - (normalized * 240);
          const color = `hsl(${hue}, 100%, 50%)`;
          
          const bounds: L.LatLngBoundsLiteral = [
            [cellLat, cellLng],
            [cellLat + latStep, cellLng + lngStep]
          ];
          
          L.rectangle(bounds, {
            color: 'transparent',
            fillColor: color,
            fillOpacity: 0.65,
            interactive: false
          }).addTo(mapRef.current!);

          // Pick some specific cells for the temperature markers
          if (i === 9 && j === 8) maxTempNode = { lat: cellLat, lng: cellLng, temp: Math.round(cellTemp) };
          if (i === 3 && j === 3) minTempNode = { lat: cellLat, lng: cellLng, temp: Math.round(cellTemp) };
          if (i === 6 && j === 2) midTempNode = { lat: cellLat, lng: cellLng, temp: Math.round(cellTemp) };
        }
      }
      
      // Render the temperature node markers
      const createTempMarker = (node: any) => {
        if (!node) return;
        const icon = L.divIcon({
          className: "temp-marker-icon",
          html: `<div style="
            background: #111; 
            color: white; 
            font-family: monospace;
            font-weight: bold; 
            font-size: 11px; 
            border: 2px solid white; 
            border-radius: 50%; 
            width: 32px; 
            height: 32px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          ">${node.temp}°</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([node.lat + latStep/2, node.lng + lngStep/2], { icon, interactive: false }).addTo(mapRef.current!);
      };
      
      createTempMarker(maxTempNode);
      createTempMarker(minTempNode);
      createTempMarker(midTempNode);
    }

    // Pulse core
    const heatPulseIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="
          position: absolute;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, ${heatColor}88 0%, ${heatColor}00 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: pulse 3s infinite alternate;
        "></div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    L.marker(center, { icon: heatPulseIcon }).addTo(mapRef.current);

    // 2. Primary Location Marker
    const targetIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #06b6d4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 20px #06b6d4;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(center, { icon: targetIcon })
      .bindPopup("<b>Selected Target Zone</b>")
      .addTo(mapRef.current);

    // 3. Competitor Rival Markers
    const rivalIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="
          width: 14px;
          height: 14px;
          background-color: #f43f5e;
          border: 2px solid #171717;
          border-radius: 50%;
          box-shadow: 0 0 10px #f43f5e;
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    rivals.forEach((r) => {
      L.marker([r.lat, r.lon], { icon: rivalIcon })
        .bindPopup(`<b>Rival:</b> ${r.name}`)
        .addTo(mapRef.current!);
    });

  }, [center, rivals, heatScore, showHeatmap]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
        .map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}} />
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ background: '#0a0a0a' }} />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex flex-col gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-neutral-800 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            FortyGuard Sentinel v2
          </span>
        </div>
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-white uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xl text-left flex items-center justify-between"
        >
          <span>Urban Heat Island</span>
          <span className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-neutral-600'}`}></span>
        </button>
      </div>
      {/* Legend */}
      {showHeatmap && (
        <div className="absolute bottom-6 right-6 z-10 glass-panel p-3 rounded-xl border border-neutral-800 shadow-2xl backdrop-blur-md">
          <div className="text-[10px] font-mono text-neutral-400 font-bold uppercase mb-2">Microclimate Temp</div>
          <div className="h-3 w-48 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"></div>
          <div className="flex justify-between text-[10px] font-mono text-white font-bold mt-1.5">
            <span>10°C</span>
            <span>25°C</span>
            <span>40°C+</span>
          </div>
        </div>
      )}
    </div>
  );
}
