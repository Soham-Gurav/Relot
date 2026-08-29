"use client";

import { useState, useEffect } from "react";
import { Plane, Ship, Compass, ArrowRight, Anchor } from "lucide-react";
import { Globe3D, GlobeMarker, GlobeArc } from "@/components/ui/3d-globe";
import { fetchLiveVehicles, LiveVehicle } from "@/lib/api";

export interface MaritimeRoute {
  id: string;
  name: string;
  type: "maritime" | "aviation";
  origin: string;
  originLat: number;
  originLng: number;
  destination: string;
  destLat: number;
  destLng: number;
  baseline_days: number;
  rerouted_days: number;
  choke_point: string;
  weather_event: string;
  delay_cost: string;
  exposure_tickers: { ticker: string; impact: string; is_positive: boolean }[];
}

export default function MaritimeRoutingVisualizer() {
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>("ALL");
  const [logisticsFilter, setLogisticsFilter] = useState<"ALL" | "AIR" | "SEA">("ALL");
  const [selectedPlane, setSelectedPlane] = useState<LiveVehicle | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadLiveVehicles = async () => {
      const data = await fetchLiveVehicles();
      if (isMounted && data.length > 0) {
        setLiveVehicles(data);
      }
    };
    loadLiveVehicles();
  }, []);

  // Live Maritime Freight Vessels Data
  const MARITIME_VESSELS: LiveVehicle[] = [];

  const allVehicles = [...liveVehicles, ...MARITIME_VESSELS];

  const filteredVehicles = allVehicles.filter((v) => {
    const matchesCarrier = selectedCarrier === "ALL" || v.carrier.toLowerCase().includes(selectedCarrier.toLowerCase());
    const matchesMode = logisticsFilter === "ALL" ||
      (logisticsFilter === "AIR" && v.type !== "maritime") ||
      (logisticsFilter === "SEA" && v.type === "maritime");
    return matchesCarrier && matchesMode;
  });

  // 1. Air Cargo Aircraft 3D Globe Markers
  const airVehicleMarkers: GlobeMarker[] = filteredVehicles
    .filter((v) => v.type !== "maritime")
    .map((v) => ({
      lat: v.lat,
      lng: v.lng,
      label: `✈ ${v.callsign} • ${v.carrier} (${v.speed_kts} kts @ ${Math.round(v.altitude_m * 3.28084)} ft)`,
      ticker: v.callsign,
      nodeId: `veh-${v.callsign}`,
      isFlightMarker: true,
      hasHeatSpike: v.payload_status === "CRITICAL_HEAT_HAZARD",
    }));

  // 2. Maritime Cargo Vessels 3D Globe Markers
  const maritimeVehicleMarkers: GlobeMarker[] = filteredVehicles
    .filter((v) => v.type === "maritime")
    .map((v) => ({
      lat: v.lat,
      lng: v.lng,
      label: `🚢 ${v.callsign} • ${v.carrier} (${v.speed_kts} kts ➔ ${v.destination_code})`,
      ticker: v.callsign,
      nodeId: `sea-${v.callsign}`,
      isFlightMarker: true,
      hasHeatSpike: v.payload_status === "MARITIME_THERMAL_DELAY",
    }));

  // 3. USA Air Hub Globe Markers with Thermal Microclimate Heatmap Rings
  const hubGlobeMarkers: GlobeMarker[] = (logisticsFilter === "SEA" ? [] : [
    { lat: 33.4352, lng: -112.0101, label: "Phoenix Sky Harbor (PHX) • 34.1°C • DA 4,707 ft • Offload 4,800 lbs", nodeId: "PHX", hasHeatSpike: true },
    { lat: 35.0424, lng: -89.9767, label: "Memphis FedEx World Hub (MEM) • 21.6°C • DA 1,950 ft", nodeId: "MEM", hasHeatSpike: false },
    { lat: 38.1744, lng: -85.7360, label: "Louisville UPS Worldport (SDF) • 20.2°C • DA 1,850 ft", nodeId: "SDF", hasHeatSpike: false },
    { lat: 29.9902, lng: -95.3368, label: "Houston Intercontinental (IAH) • 25.8°C • DA 1,410 ft", nodeId: "IAH", hasHeatSpike: true },
    { lat: 41.9742, lng: -87.9073, label: "Chicago O'Hare Freight Hub (ORD) • 17.8°C • DA 1,680 ft", nodeId: "ORD", hasHeatSpike: false },
    { lat: 33.9416, lng: -118.4085, label: "LAX Cargo Hub (LAX) • 21.3°C • DA 1,420 ft", nodeId: "LAX", hasHeatSpike: false },
  ]);

  // 4. Major Global Sea Ports 3D Globe Markers
  const seaPortGlobeMarkers: GlobeMarker[] = (logisticsFilter === "AIR" ? [] : [
    { lat: 33.74, lng: -118.27, label: "⚓ Port of Los Angeles / Long Beach (USLAX) • 21.3°C • Berth Queue: Nominal", nodeId: "USLAX", hasHeatSpike: false },
    { lat: 29.72, lng: -95.26, label: "⚓ Port of Houston (USIAH) • 25.8°C • Berth Asphalt Heat Spike • Delay +1.8 days", nodeId: "USIAH", hasHeatSpike: true },
    { lat: 40.66, lng: -74.12, label: "⚓ Port of New York & New Jersey (USNYC) • 22.1°C • Terminal Gate Flow: Normal", nodeId: "USNYC", hasHeatSpike: false },
    { lat: 32.08, lng: -81.09, label: "⚓ Port of Savannah (USSAV) • 24.5°C • Container Yard Thermal Exposure", nodeId: "USSAV", hasHeatSpike: true },
    { lat: 51.95, lng: 4.14, label: "⚓ Port of Rotterdam (NLRTM) • 18.2°C • Major Trans-Atlantic Shipping Gateway", nodeId: "NLRTM", hasHeatSpike: false },
    { lat: 31.23, lng: 121.47, label: "⚓ Port of Shanghai (CNSHG) • 28.4°C • World's Largest Container Terminal", nodeId: "CNSHG", hasHeatSpike: true },
    { lat: 35.65, lng: 139.77, label: "⚓ Port of Tokyo (JPTYO) • 23.0°C • Trans-Pacific Freight Hub", nodeId: "JPTYO", hasHeatSpike: false },
  ]);

  // 5. 3D Maritime Shipping Arcs & Flight Trajectory Corridors
  const seaShippingArcs: GlobeArc[] = (logisticsFilter === "AIR" ? [] : [
    { startLat: 31.23, startLng: 121.47, endLat: 33.74, endLng: -118.27, color: "#00e5ff", label: "Trans-Pacific Sea Lane (Shanghai ➔ LA)" },
    { startLat: 35.65, startLng: 139.77, endLat: 33.74, endLng: -118.27, color: "#38bdf8", label: "Trans-Pacific North Lane (Tokyo ➔ LA)" },
    { startLat: 18.50, startLng: -75.00, endLat: 29.72, endLng: -95.26, color: "#f43f5e", label: "Gulf Coast Oil/Container Corridor (Caribbean ➔ Houston)" },
    { startLat: 51.95, startLng: 4.14, endLat: 40.66, endLng: -74.12, color: "#00e5ff", label: "Trans-Atlantic Cargo Corridor (Rotterdam ➔ NY)" },
    { startLat: 40.66, startLng: -74.12, endLat: 32.08, endLng: -81.09, color: "#38bdf8", label: "US East Coast Coastal Highway (NY ➔ Savannah)" },
  ]);

  const allGlobeMarkers = [...hubGlobeMarkers, ...seaPortGlobeMarkers, ...airVehicleMarkers, ...maritimeVehicleMarkers];

  const handleMarkerClick = (marker: GlobeMarker) => {
    if (marker.isFlightMarker) {
      const match = allVehicles.find((v) => v.callsign === marker.ticker);
      if (match) setSelectedPlane(match);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 text-white font-mono shadow-2xl overflow-hidden relative">
      
      {/* Logistics & Carrier Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase text-emerald-400 font-extrabold tracking-wider">
              Live ADS-B & AIS Maritime Radar
            </span>
          </div>
          <h3 className="font-extrabold text-base text-white uppercase font-heading flex items-center gap-2">
            <Compass className="w-5 h-5 text-white" />
            Air Freight & Maritime Sea Port 3D Trajectory Radar
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              onClick={() => setLogisticsFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${logisticsFilter === "ALL" ? "bg-cyan-500 text-black" : "text-neutral-400 hover:text-white"}`}
            >
              All (Air + Sea)
            </button>
            <button
              onClick={() => setLogisticsFilter("AIR")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${logisticsFilter === "AIR" ? "bg-cyan-500 text-black" : "text-neutral-400 hover:text-white"}`}
            >
              <Plane className="w-3.5 h-3.5" /> Air Cargo
            </button>
            <button
              onClick={() => setLogisticsFilter("SEA")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${logisticsFilter === "SEA" ? "bg-cyan-500 text-black" : "text-neutral-400 hover:text-white"}`}
            >
              <Ship className="w-3.5 h-3.5" /> Sea Ports
            </button>
          </div>

          {/* Carrier Select Dropdown */}
          <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <span className="text-neutral-400 font-bold">Carrier:</span>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="bg-neutral-900 text-white font-extrabold rounded-lg px-2.5 py-1 border border-neutral-800 focus:outline-none focus:border-cyan-500 cursor-pointer text-xs"
            >
              <option value="ALL">All Carriers</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="Atlas">Atlas Air</option>
              <option value="Maersk">Maersk Line</option>
              <option value="Evergreen">Evergreen</option>
              <option value="COSCO">COSCO Shipping</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photorealistic 3D Earth Globe with 3D Sea Routes & Air Trajectories */}
      <div className="relative w-full h-[540px] rounded-2xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center">
        <Globe3D
          markers={allGlobeMarkers}
          arcs={seaShippingArcs}
          onMarkerClick={handleMarkerClick}
          config={{
            radius: 2,
            autoRotateSpeed: 0,
            showAtmosphere: false,
          }}
          className="w-full h-full relative z-10"
        />

        {/* Floating Legend Badge */}
        <div className="absolute top-4 left-4 z-20 bg-black/90 border border-neutral-800 p-3.5 rounded-xl backdrop-blur-md space-y-1 text-xs">
          <span className="text-[10px] text-neutral-400 block uppercase font-bold">Global Freight Corridors</span>
          <div className="flex items-center gap-2 font-bold text-white text-[11px]">
            <span className="text-cyan-400">✈ Aircraft Vector</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-400">🚢 Cargo Ship</span>
            <span className="text-neutral-600">•</span>
            <span className="text-rose-400">⚓ Sea Port</span>
          </div>
          <span className="text-[9px] text-neutral-500 block">Cyan lines = Trans-Pacific & Trans-Atlantic Sea Routes</span>
        </div>

        {/* Selected Plane Inspector Overlay Card */}
        {selectedPlane && (
          <div className="absolute bottom-4 right-4 z-30 w-80 bg-black/95 border border-cyan-500/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md space-y-3 text-xs animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Plane className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-extrabold text-white text-sm block">{selectedPlane.callsign}</span>
                  <span className="text-[10px] text-neutral-400 block">{selectedPlane.carrier}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlane(null)}
                className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-400 block uppercase">Ground Speed</span>
                <span className="font-bold text-white">{selectedPlane.speed_kts} kts</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-400 block uppercase">Altitude</span>
                <span className="font-bold text-white">{Math.round(selectedPlane.altitude_m * 3.28084).toLocaleString()} ft</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-400 block uppercase">Dest Airport</span>
                <span className="font-bold text-cyan-400">{selectedPlane.destination_code}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-400 block uppercase">Dest Temp</span>
                <span className="font-bold text-white">{selectedPlane.dest_temp_c}°C</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400 uppercase font-bold">Density Altitude (DA)</span>
                <span className="text-white font-bold">{(selectedPlane.density_altitude_ft ?? 1850).toLocaleString()} ft</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400 uppercase font-bold">Thrust Reduction</span>
                <span className="text-rose-400 font-bold">-{selectedPlane.thrust_loss_pct ?? 4.5}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400 uppercase font-bold">MTOW Payload Trim</span>
                <span className="text-amber-400 font-bold">
                  {(selectedPlane.offload_lbs ?? 0) > 0 ? `-${(selectedPlane.offload_lbs ?? 0).toLocaleString()} lbs` : "0 lbs"}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-neutral-800">
              <span className="text-[9px] uppercase text-neutral-400 block font-bold mb-1">Operational Action Advisory</span>
              <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                {selectedPlane.advisory}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
