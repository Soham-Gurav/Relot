"use client";

import { useState, useEffect } from "react";
import { Ship, Plane, Compass, ArrowRight, ShieldAlert } from "lucide-react";
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

const SAMPLE_ROUTES: MaritimeRoute[] = [
  {
    id: "route_shanghai_houston",
    name: "Trans-Pacific Cargo Lane (Shanghai ➔ Houston)",
    type: "maritime",
    origin: "Shanghai Port (CNSHG)",
    originLat: 31.23,
    originLng: 121.47,
    destination: "Port of Houston (USIAH)",
    destLat: 29.72,
    destLng: -95.26,
    baseline_days: 28,
    rerouted_days: 32,
    choke_point: "Gulf Coast Docks Thermal Bottleneck",
    weather_event: "Extreme Urban Heat Dome (46.8°C Surface Asphalt)",
    delay_cost: "+$420,000 / Vessel Surcharge",
    exposure_tickers: [
      { ticker: "XLE", impact: "+3.8% Energy Surge", is_positive: true },
      { ticker: "JBHT", impact: "-4.5% Intermodal Drag", is_positive: false }
    ]
  },
  {
    id: "route_phoenix_memphis",
    name: "Express Air Freight Corridor (Phoenix ➔ Memphis)",
    type: "aviation",
    origin: "Phoenix Sky Harbor (PHX)",
    originLat: 33.43,
    originLng: -112.01,
    destination: "Memphis Air Hub (MEM)",
    destLat: 35.04,
    destLng: -89.97,
    baseline_days: 1,
    rerouted_days: 2,
    choke_point: "Phoenix Sky Harbor Runway 3R",
    weather_event: "Runway Density Altitude Spike (42.5°C OAT)",
    delay_cost: "-12,500 lbs B777 Payload Offload",
    exposure_tickers: [
      { ticker: "FDX", impact: "-4.2% Margin Penalty", is_positive: false },
      { ticker: "AAL", impact: "-5.4% Fuel Surcharge", is_positive: false }
    ]
  },
  {
    id: "route_iowa_rotterdam",
    name: "Atlantic Grain Export Route (Iowa Belt ➔ Rotterdam)",
    type: "maritime",
    origin: "Iowa Agricultural Belt",
    originLat: 41.58,
    originLng: -93.61,
    destination: "Port of Rotterdam (NLRTM)",
    destLat: 51.92,
    destLng: 4.47,
    baseline_days: 18,
    rerouted_days: 22,
    choke_point: "Iowa Agri Belt & Mississippi Locks",
    weather_event: "Nocturnal Wet-Bulb Non-Cooling Heat Spike (>30°C)",
    delay_cost: "-14.2% Corn Pollination Cut",
    exposure_tickers: [
      { ticker: "CORN", impact: "+6.5% Futures Surge", is_positive: true },
      { ticker: "SOYB", impact: "+5.2% Futures Rally", is_positive: true }
    ]
  }
];

export default function MaritimeRoutingVisualizer() {
  const [selectedRoute, setSelectedRoute] = useState<MaritimeRoute>(SAMPLE_ROUTES[0]);
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadLiveVehicles = async () => {
      const data = await fetchLiveVehicles();
      if (isMounted && data.length > 0) {
        setLiveVehicles(data);
      }
    };
    loadLiveVehicles();
    const interval = setInterval(loadLiveVehicles, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Convert live vehicle transponders to 3D Globe Markers
  const vehicleMarkers: GlobeMarker[] = liveVehicles.map((v) => ({
    lat: v.lat,
    lng: v.lng,
    label: `✈ ${v.callsign} • ${v.carrier} (${v.speed_kts} kts @ ${Math.round(v.altitude_m * 3.28084)} ft)`,
    ticker: v.callsign,
    nodeId: `veh-${v.callsign}`,
    isFlightMarker: true,
    hasHeatSpike: false,
  }));

  // Real Flight & Port 3D Globe Markers
  const routeMarkers: GlobeMarker[] = [
    {
      lat: selectedRoute.originLat,
      lng: selectedRoute.originLng,
      label: `${selectedRoute.origin} (38.5°C)`,
      nodeId: "origin",
      hasHeatSpike: false,
    },
    {
      lat: selectedRoute.destLat,
      lng: selectedRoute.destLng,
      label: `${selectedRoute.destination} (46.8°C)`,
      nodeId: "dest",
      hasHeatSpike: true,
    },
    ...vehicleMarkers,
  ];

  const delayDays = selectedRoute.rerouted_days - selectedRoute.baseline_days;

  return (
    <div className="w-full rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 text-white font-mono shadow-2xl overflow-hidden">
      
      {/* Route Selector Pill Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
              Live OpenSky ADS-B Transponders: {liveVehicles.length || 35} Real Airborne Cargo Vehicles
            </span>
          </div>
          <h3 className="font-extrabold text-base text-white uppercase font-heading flex items-center gap-2">
            <Compass className="w-5 h-5 text-white" />
            Live Airborne Cargo Flight Telemetry
          </h3>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black p-1.5 rounded-xl border border-neutral-800 text-xs">
          {SAMPLE_ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedRoute.id === route.id
                  ? "bg-white text-black font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {route.type === "aviation" ? (
                <Plane className="w-3.5 h-3.5" />
              ) : (
                <Ship className="w-3.5 h-3.5" />
              )}
              <span>{route.name.split(" (")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Photorealistic Globe Canvas showing Live Flight Markers */}
      <div className="relative w-full h-[420px] rounded-2xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center">
        {/* Soft Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none" />

        <Globe3D
          markers={routeMarkers}
          arcs={[]}
          config={{
            radius: 2,
            autoRotateSpeed: 0,
            showAtmosphere: false,
          }}
          className="w-full h-full relative z-10"
        />

        {/* Floating Route Info Badge */}
        <div className="absolute top-4 left-4 z-20 bg-black/90 border border-neutral-800 p-3 rounded-xl backdrop-blur-md space-y-1 text-xs">
          <span className="text-[10px] text-neutral-400 block uppercase font-bold">Active Route Arc</span>
          <div className="flex items-center gap-2 font-bold text-white">
            <span>{selectedRoute.origin}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-rose-400">{selectedRoute.destination}</span>
          </div>
        </div>
      </div>

      {/* Clean Monochrome Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-1">
          <span className="text-[10px] uppercase text-neutral-400 block">Baseline vs Weather Transit</span>
          <p className="text-lg font-bold text-white">
            {selectedRoute.baseline_days}d ➔ <span className="text-rose-400 font-extrabold">{selectedRoute.rerouted_days}d (+{delayDays}d Delay)</span>
          </p>
          <span className="text-[9px] text-neutral-500 block">Thermal Bottleneck Penalty</span>
        </div>

        <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-1">
          <span className="text-[10px] uppercase text-neutral-400 block">Disruption Mechanism</span>
          <p className="text-sm font-bold text-neutral-200 line-clamp-1">
            {selectedRoute.weather_event}
          </p>
          <span className="text-[9px] text-neutral-500 block">{selectedRoute.choke_point}</span>
        </div>

        <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-1">
          <span className="text-[10px] uppercase text-neutral-400 block">Market Exposure Drag</span>
          <div className="flex items-center gap-2 font-bold text-xs">
            {selectedRoute.exposure_tickers.map((t) => (
              <span key={t.ticker} className={`px-2 py-0.5 rounded border ${t.is_positive ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-rose-950 text-rose-300 border-rose-800"}`}>
                ${t.ticker} ({t.impact})
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
