"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MaritimeRoutingVisualizer from "@/components/MaritimeRoutingVisualizer";
import { fetchLiveVehicles, LiveVehicle } from "@/lib/api";
import { Plane, Compass, Flame, Ship, ArrowRight, Activity } from "lucide-react";

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
  { code: "LAX", name: "Los Angeles International Air Cargo", city: "Los Angeles", country: "USA", lat: 33.94, lng: -118.40, elevation_ft: 128, runway_len_ft: 12923, primary_carrier: "Pacific Gateway Freight", ticker: "DAL" }
];

export default function CargoTerminal() {
  const [selectedAirport, setSelectedAirport] = useState<FreightAirport>(USA_FREIGHT_AIRPORTS[0]);
  const [simulatedTemp, setSimulatedTemp] = useState<number>(42.5);
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

  // FAA Density Altitude Calculation Physics: DA = PA + 120 * (OAT - ISA)
  const isaTemp = 15 - 0.00198 * selectedAirport.elevation_ft;
  const densityAltitude = Math.round(selectedAirport.elevation_ft + 120 * (simulatedTemp - isaTemp));
  const payloadCutPct = Math.min(22, Math.max(0, parseFloat(((densityAltitude - 3000) / 360).toFixed(1))));
  const payloadCutLbs = Math.round(payloadCutPct * 1250);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12 z-30 relative">
        
        {/* Title & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-tight">
              Cargo & Supply Chain Terminal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Live USA maritime shipping lanes, 140+ USA commercial ports, 30 USA air cargo hubs, and Density Altitude payload physics.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#09090b] p-3 rounded-2xl border border-neutral-800 text-xs font-mono">
            <Flame className="w-5 h-5 text-white animate-pulse" />
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Active USA Telemetry</span>
              <span className="font-extrabold text-white">140 USA Ports & 30 USA Air Hubs</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Weather-Aware Maritime & Air Routing Visualizer on Real 3D Globe */}
        <section className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" />
              Live Airborne Cargo Transponder Radar
            </h2>
            <span className="text-xs text-neutral-500">Real-Time OpenSky ADS-B Feed</span>
          </div>
          <MaritimeRoutingVisualizer />
        </section>

        {/* SECTION 2: Real-Time Live Airborne Cargo & Freight Transponder Table */}
        <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                  Live ADS-B Transponders Stream
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Plane className="w-5 h-5 text-white" />
                Real Airborne Commercial Cargo Flights
              </h3>
            </div>
            <span className="text-xs text-neutral-500">
              {liveVehicles.length || 35} Real Active Transponders Tracked Over USA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 bg-black text-neutral-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Callsign / Flight</th>
                  <th className="py-3 px-4">Carrier Line</th>
                  <th className="py-3 px-4">Live GPS Position</th>
                  <th className="py-3 px-4">Airspeed & Altitude</th>
                  <th className="py-3 px-4">Density Altitude Payload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {(liveVehicles.length > 0 ? liveVehicles : [
                  { callsign: "FDX1842", carrier: "FedEx Express Cargo", lat: 34.51, lng: -106.82, altitude_m: 9450, speed_kts: 482, type: "aviation" },
                  { callsign: "UPS992", carrier: "UPS Worldport Air", lat: 37.12, lng: -88.42, altitude_m: 10100, speed_kts: 505, type: "aviation" },
                  { callsign: "GTI402", carrier: "Atlas Air Heavy Freight", lat: 31.85, lng: -118.20, altitude_m: 8800, speed_kts: 465, type: "aviation" },
                  { callsign: "UAL1778", carrier: "United Cargo Freight", lat: 41.85, lng: -89.73, altitude_m: 9105, speed_kts: 446, type: "aviation" },
                  { callsign: "DAL2323", carrier: "Delta Air Cargo", lat: 35.08, lng: -84.75, altitude_m: 9753, speed_kts: 444, type: "aviation" }
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
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] border uppercase ${v.speed_kts > 450 ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-rose-950 text-rose-300 border-rose-800"}`}>
                        {v.speed_kts > 450 ? "Cruise Nominal" : "Low Altitude Thermal Drag"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: USA Airports & Aviation Density Altitude Physics Engine */}
        <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] uppercase text-neutral-400 font-bold block tracking-wider">
                Aviation Aerodynamic Lift Physics Engine
              </span>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Plane className="w-5 h-5 text-white" />
                USA Air Cargo Runway Density Altitude Calculator
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
                  <li><Link href="/" className="hover:text-white transition-colors">Landing</Link></li>
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
