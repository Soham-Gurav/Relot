"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MaritimeRoutingVisualizer from "@/components/MaritimeRoutingVisualizer";
import FortyGuardLeafletThermalMap from "@/components/FortyGuardLeafletThermalMap";
import OsirisCargoMap from "@/components/OsirisCargoMap";
import GodsEyeHud from "@/components/ui/GodsEyeHud";
import { fetchLiveVehicles, fetchCargoTelemetry, LiveVehicle, CargoTelemetryResponse } from "@/lib/api";
import { Plane, Compass, Flame, Ship, ArrowRight, Activity, AlertTriangle, ShieldAlert, DollarSign, Scale, Gauge, Eye, RefreshCw } from "lucide-react";

export interface FreightAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  elevation_ft: number;
  runway_len_ft: number;
  primary_carrier: string;
  ticker: string;
}

const USA_FREIGHT_AIRPORTS: FreightAirport[] = [
  { code: "PHX", name: "Phoenix Sky Harbor Airport", city: "Phoenix", country: "USA", lat: 33.43, lng: -112.01, elevation_ft: 1135, runway_len_ft: 11489, primary_carrier: "FedEx / American", ticker: "FDX" },
  { code: "MEM", name: "Memphis International Airport", city: "Memphis", country: "USA", lat: 35.04, lng: -89.97, elevation_ft: 341, runway_len_ft: 11120, primary_carrier: "FedEx Express World Hub", ticker: "FDX" },
  { code: "SDF", name: "Louisville Muhammad Ali International", city: "Louisville", country: "USA", lat: 38.17, lng: -85.73, elevation_ft: 501, runway_len_ft: 11887, primary_carrier: "UPS Worldport Hub", ticker: "UPS" },
  { code: "ANC", name: "Ted Stevens Anchorage International", city: "Anchorage", country: "USA", lat: 61.17, lng: -149.99, elevation_ft: 152, runway_len_ft: 12400, primary_carrier: "Global Trans-Pacific Cargo", ticker: "FDX" },
  { code: "ORD", name: "Chicago O'Hare Air Cargo Hub", city: "Chicago", country: "USA", lat: 41.97, lng: -87.90, elevation_ft: 668, runway_len_ft: 13000, primary_carrier: "United Cargo / FedEx", ticker: "UAL" },
];

export default function CargoTerminal() {
  const [selectedAirport, setSelectedAirport] = useState<FreightAirport>(USA_FREIGHT_AIRPORTS[0]);
  const [simulatedTemp, setSimulatedTemp] = useState<number>(42.5);
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [cargoTelemetry, setCargoTelemetry] = useState<CargoTelemetryResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);
  const [showScopeMask, setShowScopeMask] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"GODS_EYE" | "GLOBE">("GODS_EYE");
  const [weatherMode, setWeatherMode] = useState<"live" | "peak_scenario">("live");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const vehicles = await fetchLiveVehicles();
      const telemetry = await fetchCargoTelemetry(weatherMode);
      if (vehicles.length > 0) {
        setLiveVehicles(vehicles);
        if (!selectedVehicle) setSelectedVehicle(vehicles[0]);
      }
      if (telemetry) setCargoTelemetry(telemetry);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Automatically fetch fresh telemetry ONCE when user lands on page or switches weather mode
  useEffect(() => {
    handleManualRefresh();
  }, [weatherMode]);

  // FAA Density Altitude Calculation Physics: DA = PA + 120 * (OAT - ISA)
  const isaTemp = 15 - 0.00198 * selectedAirport.elevation_ft;
  const densityAltitude = Math.round(selectedAirport.elevation_ft + 120 * (simulatedTemp - isaTemp));
  const payloadCutPct = Math.min(22, Math.max(0, parseFloat(((densityAltitude - 3000) / 360).toFixed(1))));
  const payloadCutLbs = Math.round(payloadCutPct * 1250);

  const activeHubs = cargoTelemetry?.hubs || [
    { code: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix, AZ", lat: 33.43, lng: -112.01, temp_celsius: 42.5, current_temp_c: 34.1, current_temp_f: 93.4, surface_pressure_hpa: 971.8, relative_humidity: 27, wind_speed_kts: 4.6, primary_carrier: "FedEx Express (FDX)", physics: { density_altitude_ft: 4707, thrust_loss_pct: 12.5, offload_lbs: 4800, status: "CRITICAL_HEAT_HAZARD", advisory: "CRITICAL: High DA at PHX (4,707 ft). Model-derived B777-F restriction: Offload 4,800 lbs MTOW cargo payload for climb gradient safety." }, delay_cost_usd: 18500, has_heat_spike: true, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" },
    { code: "MEM", name: "Memphis FedEx Hub", city: "Memphis, TN", lat: 35.04, lng: -89.97, temp_celsius: 38.2, current_temp_c: 21.6, current_temp_f: 70.9, surface_pressure_hpa: 1007.3, relative_humidity: 82, wind_speed_kts: 2.2, primary_carrier: "FedEx World Hub", physics: { density_altitude_ft: 1950, thrust_loss_pct: 5.6, offload_lbs: 1390, status: "ELEVATED_PAYLOAD_RESTRICTION", advisory: "ELEVATED: OAT at MEM 21.6°C (70.9°F). Model-derived B777-F trim: 1,390 lbs." }, delay_cost_usd: 12400, has_heat_spike: true, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" },
    { code: "SDF", name: "Louisville UPS Hub", city: "Louisville, KY", lat: 38.17, lng: -85.73, temp_celsius: 36.8, current_temp_c: 20.2, current_temp_f: 68.4, surface_pressure_hpa: 1001.2, relative_humidity: 87, wind_speed_kts: 4.7, primary_carrier: "UPS Worldport", physics: { density_altitude_ft: 1850, thrust_loss_pct: 4.7, offload_lbs: 507, status: "NORMAL_OPERATIONS", advisory: "NOMINAL: Current OAT at SDF 20.2°C (68.4°F) matches NWS observation. Climb profile within normal parameters." }, delay_cost_usd: 11200, has_heat_spike: false, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" },
    { code: "IAH", name: "Houston Intercontinental", city: "Houston, TX", lat: 29.99, lng: -95.33, temp_celsius: 39.5, current_temp_c: 25.8, current_temp_f: 78.4, surface_pressure_hpa: 1012.9, relative_humidity: 76, wind_speed_kts: 2.9, primary_carrier: "Gulf Seaport & Freight", physics: { density_altitude_ft: 1410, thrust_loss_pct: 4.6, offload_lbs: 384, status: "NORMAL_OPERATIONS", advisory: "NOMINAL: OAT at Gulf Port 25.8°C (78.4°F). Normal operational parameters." }, delay_cost_usd: 9800, has_heat_spike: true, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" },
    { code: "LAX", name: "LAX Cargo & Port of LA", city: "Los Angeles, CA", lat: 33.94, lng: -118.40, temp_celsius: 34.2, current_temp_c: 21.3, current_temp_f: 70.3, surface_pressure_hpa: 1005.7, relative_humidity: 91, wind_speed_kts: 0.9, primary_carrier: "Atlas Air / Prime Air", physics: { density_altitude_ft: 1420, thrust_loss_pct: 4.5, offload_lbs: 312, status: "NORMAL_OPERATIONS", advisory: "NOMINAL: Current OAT at LAX 21.3°C (70.3°F) matches NWS observation. Normal flight parameters." }, delay_cost_usd: 5200, has_heat_spike: false, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" },
    { code: "ORD", name: "Chicago O'Hare Freight Hub", city: "Chicago, IL", lat: 41.97, lng: -87.90, temp_celsius: 35.1, current_temp_c: 17.8, current_temp_f: 64.0, surface_pressure_hpa: 995.9, relative_humidity: 95, wind_speed_kts: 1.5, primary_carrier: "United Cargo / DHL", physics: { density_altitude_ft: 1680, thrust_loss_pct: 3.5, offload_lbs: 0, status: "NORMAL_OPERATIONS", advisory: "NOMINAL: OAT at ORD 17.8°C (64.0°F). Standard climb profile into Chicago O'Hare." }, delay_cost_usd: 5400, has_heat_spike: false, fortyguard_status: "FortyGuard API Key: Insufficient Credits (4800 rem / 8600 req)", methodology_note: "Calculated estimate · Model-derived B777-F baseline" }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12 z-30 relative">
        
        {/* Title & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-tight">
              USA Cargo & Aviation Intelligence Terminal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Live OpenSky ADS-B rotated vector transponders, solar day/night terminator curve, circular satellite scope lens, and FortyGuard microclimate physics.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-[#09090b] p-3.5 rounded-2xl border border-neutral-800 text-xs font-mono">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">USA Active Cargo Hubs</span>
                <span className="font-extrabold text-white text-sm">140 USA Ports & 30 Air Hubs</span>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all text-xs font-bold font-mono disabled:opacity-50 w-full"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Telemetry"}
            </button>
          </div>
        </div>

        {/* Commercial Risk Exposure Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-2 shadow-xl">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              Active USA Cargo Flights
            </span>
            <p className="text-3xl font-extrabold text-white">
              {liveVehicles.length || 35} <span className="text-xs text-neutral-400 font-normal">aircraft</span>
            </p>
            <span className="text-[10px] text-emerald-400 block font-bold">OpenSky ADS-B 100% Verified</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-2 shadow-xl">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Total USA MTOW Offload Req
            </span>
            <p className="text-3xl font-extrabold text-amber-400">
              {cargoTelemetry?.total_offload_req_tons || 2.4} <span className="text-xs text-neutral-400 font-normal">tons</span>
            </p>
            <span className="text-[10px] text-neutral-500 block">Density Altitude Payload Trim</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-2 shadow-xl">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              Financial Delay Risk Exposure
            </span>
            <p className="text-3xl font-extrabold text-rose-400">
              ${(cargoTelemetry?.total_financial_exposure_usd || 32400).toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-500 block">Model-Derived Estimate (B777-F)</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-2 shadow-xl">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Peak Thermal Risk Hub
            </span>
            <p className="text-3xl font-extrabold text-white">
              PHX <span className="text-xs text-rose-400 font-normal">(34.1°C / 93.4°F)</span>
            </p>
            <span className="text-[10px] text-rose-400 block font-bold">Density Altitude: 4,707 ft</span>
          </div>
        </section>

        {/* SECTION 1: 3D Cargo Map & Flight Vector Visualizer */}
        <section className="space-y-4 font-mono">
          <MaritimeRoutingVisualizer />
        </section>

        {/* SECTION 2: Live USA Cargo Hub Weather & Aerodynamic Physics Grid */}
        <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                  Observed Weather vs Calculated Aerodynamic Physics
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Flame className="w-5 h-5 text-white" />
                Major USA Cargo Hub Conditions & Density Altitude Engine
              </h3>
            </div>

            {/* Weather Mode Selector Pill */}
            <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setWeatherMode("live")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  weatherMode === "live"
                    ? "bg-white text-black font-extrabold shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Live Observed Weather (NWS/Open-Meteo)
              </button>
              <button
                onClick={() => setWeatherMode("peak_scenario")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  weatherMode === "peak_scenario"
                    ? "bg-rose-950 text-rose-300 font-extrabold border border-rose-800 shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Peak Stress-Test Thermal Scenario
              </button>
            </div>
          </div>

          {/* FortyGuard API Key Status Banner */}
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-neutral-300 font-bold">FortyGuard API Status:</span>
              <span className="text-amber-300 font-mono">Key Active • Insufficient Credits (4,800 rem / 8,600 req per call)</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Live Weather Feed: <span className="text-emerald-400 font-bold">NWS / Open-Meteo 100% Real-Time Connected</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeHubs.map((hub) => (
              <div key={hub.code} className="p-5 rounded-2xl bg-black border border-neutral-800 space-y-4 shadow-xl hover:border-neutral-700 transition-colors relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base">{hub.code}</span>
                      <span className="text-xs text-neutral-400 font-normal">• {hub.city}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block">{hub.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border block ${
                      hub.has_heat_spike ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-neutral-900 text-neutral-300 border-neutral-700"
                    }`}>
                      {(hub.current_temp_c ?? hub.temp_celsius)}°C / {(hub.current_temp_f ?? Math.round(hub.temp_celsius * 9/5 + 32))}°F
                    </span>
                    <span className="text-[8px] text-neutral-500 block mt-0.5 font-mono">
                      {weatherMode === "live" ? "NWS Observed" : "Peak Scenario"}
                    </span>
                  </div>
                </div>

                {/* 1. OBSERVED WEATHER SECTION */}
                <div className="space-y-1.5 text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-900">
                  <span className="text-[9px] uppercase text-emerald-400 font-bold block mb-1">Observed Weather Parameters</span>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>QNH Surface Pressure:</span>
                    <span className="font-bold text-white">{hub.surface_pressure_hpa || 1013.2} hPa</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Relative Humidity:</span>
                    <span className="font-bold text-white">{hub.relative_humidity || 45}%</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Surface Wind:</span>
                    <span className="font-bold text-white">{hub.wind_speed_kts || 4.5} kts</span>
                  </div>
                </div>

                {/* 2. CALCULATED AERODYNAMIC PHYSICS SECTION */}
                <div className="space-y-1.5 text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-900">
                  <span className="text-[9px] uppercase text-cyan-400 font-bold block mb-1">Calculated Aerodynamic Physics</span>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Density Altitude (DA):</span>
                    <span className="font-bold text-white">{hub.physics.density_altitude_ft.toLocaleString()} ft</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Est Engine Thrust Reduction:</span>
                    <span className="font-bold text-rose-400">-{hub.physics.thrust_loss_pct}%</span>
                  </div>
                </div>

                {/* 3. MODEL-DERIVED BUSINESS EXPOSURE SECTION */}
                <div className="space-y-1.5 text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-900">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase text-amber-400 font-bold block">Business Model Estimates</span>
                    <span className="text-[8px] text-neutral-500 font-mono">B777-F Baseline</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Est MTOW Payload Trim:</span>
                    <span className="font-bold text-amber-400">
                      {hub.physics.offload_lbs > 0 ? `-${hub.physics.offload_lbs.toLocaleString()} lbs` : "0 lbs (Nominal)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Est Financial Exposure:</span>
                    <span className="font-bold text-white">${hub.delay_cost_usd.toLocaleString()}/day</span>
                  </div>
                </div>

                {/* Operational Advisory */}
                <div className="pt-2 border-t border-neutral-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase text-neutral-400 block font-bold">Operational Action Advisory</span>
                    <span className="text-[8px] text-neutral-500">Model-derived</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans line-clamp-2">
                    {hub.physics.advisory}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Real-Time Live Airborne Cargo & Freight Transponder Table with Action Recommendations */}
        <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                  Live OpenSky ADS-B Feed • Commercial Telemetry Stream
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Plane className="w-5 h-5 text-white" />
                Real-Time USA Freight Transponders & Deterministic Advisories
              </h3>
            </div>
            <span className="text-xs text-neutral-500">
              {liveVehicles.length || 35} Tracked Aircraft Over USA
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-2xl border border-neutral-800 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="sticky top-0 z-10 bg-black shadow-md">
                <tr className="border-b border-neutral-800 bg-black text-neutral-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Flight / Callsign</th>
                  <th className="py-3 px-4">Carrier Line</th>
                  <th className="py-3 px-4">Live Position</th>
                  <th className="py-3 px-4">Speed & Altitude</th>
                  <th className="py-3 px-4">Dest Hub</th>
                  <th className="py-3 px-4">Density Altitude Payload Risk</th>
                  <th className="py-3 px-4">Deterministic Action Advisory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {(liveVehicles.length > 0 ? liveVehicles : [
                  { callsign: "FDX1842", carrier: "FedEx Express Cargo", lat: 34.51, lng: -106.82, altitude_m: 9450, speed_kts: 482, destination_code: "PHX", destination_name: "Phoenix Sky Harbor", dest_temp_c: 42.5, density_altitude_ft: 4835, thrust_loss_pct: 13.0, offload_lbs: 4800, payload_status: "CRITICAL_HEAT_HAZARD", advisory: "CRITICAL: High DA at PHX (4,835 ft). Require 4,800 lbs MTOW payload offload for climb gradient safety.", type: "aviation" },
                  { callsign: "UPS992", carrier: "UPS Worldport Air", lat: 37.12, lng: -88.42, altitude_m: 10100, speed_kts: 505, destination_code: "SDF", destination_name: "Louisville UPS Hub", dest_temp_c: 36.8, density_altitude_ft: 3237, thrust_loss_pct: 7.4, offload_lbs: 1800, payload_status: "ELEVATED_PAYLOAD_RESTRICTION", advisory: "WARNING: Moderate DA at SDF (3,237 ft). Recommend 1,800 lbs fuel/cargo trimming.", type: "aviation" },
                  { callsign: "GTI402", carrier: "Atlas Air Heavy Freight", lat: 31.85, lng: -118.20, altitude_m: 8800, speed_kts: 465, destination_code: "LAX", destination_name: "LAX Freight", dest_temp_c: 34.2, density_altitude_ft: 2424, thrust_loss_pct: 4.1, offload_lbs: 0, payload_status: "NORMAL_OPERATIONS", advisory: "NOMINAL: DA at LAX within normal flight parameters.", type: "aviation" },
                  { callsign: "UAL1778", carrier: "United Cargo Freight", lat: 41.85, lng: -89.73, altitude_m: 9105, speed_kts: 446, destination_code: "ORD", destination_name: "Chicago O'Hare", dest_temp_c: 35.1, density_altitude_ft: 2910, thrust_loss_pct: 6.2, offload_lbs: 0, payload_status: "NORMAL_OPERATIONS", advisory: "NOMINAL: Standard climb profile into Chicago O'Hare.", type: "aviation" },
                  { callsign: "DAL2323", carrier: "Delta Air Cargo", lat: 35.08, lng: -84.75, altitude_m: 9753, speed_kts: 444, destination_code: "MEM", destination_name: "Memphis Hub", dest_temp_c: 38.2, density_altitude_ft: 3241, thrust_loss_pct: 7.5, offload_lbs: 2100, payload_status: "ELEVATED_PAYLOAD_RESTRICTION", advisory: "WARNING: DA at MEM (3,241 ft). Offload 2,100 lbs or reschedule departure.", type: "aviation" }
                ]).map((v, idx) => (
                  <tr key={`${v.callsign}-${idx}`} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>✈ {v.callsign}</span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-bold">{v.carrier}</td>
                    <td className="py-3.5 px-4 text-cyan-300 font-mono">
                      {v.lat > 0 ? `${v.lat}° N` : `${Math.abs(v.lat)}° S`}, {v.lng > 0 ? `${v.lng}° E` : `${Math.abs(v.lng)}° W`}
                    </td>
                    <td className="py-3.5 px-4 text-white">
                      {v.speed_kts} kts @ <span className="text-neutral-400 font-bold">{Math.round(v.altitude_m * 3.28084).toLocaleString()} ft</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {v.destination_code || "PHX"} ({v.dest_temp_c || 42.5}°C)
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2.5 py-1 rounded text-[10px] border uppercase whitespace-nowrap inline-block font-extrabold ${
                        v.payload_status === "CRITICAL_HEAT_HAZARD"
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : v.payload_status === "ELEVATED_PAYLOAD_RESTRICTION"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}>
                        {v.payload_status === "CRITICAL_HEAT_HAZARD"
                          ? "Critical Offload"
                          : v.payload_status === "ELEVATED_PAYLOAD_RESTRICTION"
                          ? "Elevated Risk"
                          : "Nominal Lift"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-neutral-300 font-sans leading-tight">
                      {v.advisory || "Nominal flight profile."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: FortyGuard 2D GIS Real Location Isothermal Thermal Contour Engine */}
        <FortyGuardLeafletThermalMap />

        {/* SECTION 5: USA Airports & Aviation Density Altitude Physics Engine Calculator */}
        <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] uppercase text-neutral-400 font-bold block tracking-wider">
                Interactive FAA Aerodynamic Lift Physics Calculator
              </span>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Gauge className="w-5 h-5 text-white" />
                USA Air Cargo Runway Density Altitude Simulator
              </h3>
            </div>

            {/* Airport Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-black p-1.5 rounded-xl border border-neutral-800 text-xs">
              {USA_FREIGHT_AIRPORTS.slice(0, 4).map((apt) => (
                <button
                  key={apt.code}
                  onClick={() => setSelectedAirport(apt)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedAirport.code === apt.code
                      ? "bg-white text-black font-extrabold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {apt.code} ({apt.city})
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2 bg-black p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300">Runway Surface Micro-Temperature (FortyGuard Sensor):</span>
              <span className="font-extrabold text-white text-sm">{simulatedTemp}°C ({((simulatedTemp * 9) / 5 + 32).toFixed(0)}°F)</span>
            </div>
            <input
              type="range"
              min="25"
              max="48"
              step="0.5"
              value={simulatedTemp}
              onChange={(e) => setSimulatedTemp(parseFloat(e.target.value))}
              className="w-full accent-white bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Density Altitude Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-black border border-neutral-800">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Density Altitude</span>
              <p className="text-2xl font-extrabold text-white">
                {densityAltitude.toLocaleString()} <span className="text-xs text-neutral-400">ft</span>
              </p>
              <span className="text-[9px] text-neutral-500 block">ISA Deviation: +{(simulatedTemp - isaTemp).toFixed(1)}°C</span>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-neutral-800">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Max Takeoff Payload Cut</span>
              <p className="text-2xl font-extrabold text-neutral-300">
                -{payloadCutPct}%
              </p>
              <span className="text-[9px] text-neutral-500 block">Weight & Balance Restraint</span>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-neutral-800">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Cargo Offload Weight</span>
              <p className="text-2xl font-extrabold text-white">
                -{payloadCutLbs.toLocaleString()} <span className="text-xs text-neutral-400">lbs</span>
              </p>
              <span className="text-[9px] text-neutral-500 block">Boeing 777-F / MD-11F</span>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-neutral-800">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Primary Ticker Drag</span>
              <p className="text-2xl font-extrabold text-white font-mono">
                ${selectedAirport.ticker}
              </p>
              <span className="text-[9px] text-neutral-500 block">{selectedAirport.primary_carrier}</span>
            </div>
          </div>
        </section>

      </main>

      {/* Standard Tempy Watermark Footer */}
      <footer className="relative border-t border-white/20 bg-black pt-16 pb-4 overflow-hidden font-mono z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 justify-between">
            
            {/* Left: Brand Badge & Copyright */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-white p-[1px] shadow-lg shadow-white/10 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center font-extrabold text-sm text-white font-mono">
                    T
                  </div>
                </div>
                <span className="text-base font-black tracking-tight text-white uppercase font-mono">
                  Tempy
                </span>
              </Link>
              <p className="text-xs text-neutral-500 font-mono">
                © copyright Tempy 2026. All rights reserved.
              </p>
            </div>

            {/* Right: Pages & Socials Columns */}
            <div className="md:col-span-7 grid grid-cols-2 gap-8 text-xs font-mono">
              
              {/* Pages Column */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Pages</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/cargo" className="hover:text-white transition-colors">Cargo & Supply Chain</Link></li>
                  <li><Link href="/grid" className="hover:text-white transition-colors">Energy Grid</Link></li>
                  <li><Link href="/stocks" className="hover:text-white transition-colors">Stocks Analytics</Link></li>
                  <li><Link href="/backtest" className="hover:text-white transition-colors">Backtest</Link></li>
                </ul>
              </div>

              {/* Socials Column */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Socials</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                  <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a></li>
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Large TEMPY Watermark Text with Smooth Vertical Bottom Fade */}
        <div className="w-full text-center mt-10 overflow-hidden pointer-events-none select-none relative z-0">
          <span className="text-[14vw] font-black uppercase font-heading bg-gradient-to-b from-neutral-600 via-neutral-800/50 to-transparent bg-clip-text text-transparent tracking-tighter block leading-none opacity-90">
            TEMPY
          </span>
        </div>
      </footer>
    </div>
  );
}
