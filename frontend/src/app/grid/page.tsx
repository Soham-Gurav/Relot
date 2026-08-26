"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Zap, Sun, Sliders, AlertTriangle, ShieldCheck, MapPin, Activity, Flame, ArrowRight, Gauge, Layers } from "lucide-react";

export interface PowerGridRegion {
  id: string;
  name: string;
  code: string;
  state: string;
  lat: number;
  lng: number;
  base_temp: number;
  baseline_peak_mw: number;
  transformer_load_pct: number;
  peaker_spot_price: number;
  primary_ticker: string;
  solar_ghi: number; // Global Horizontal Irradiance W/m^2
  solar_dni: number; // Direct Normal Irradiance W/m^2
}

const US_POWER_GRIDS: PowerGridRegion[] = [
  { id: "grid_ercot", name: "ERCOT Texas Power Grid", code: "ERCOT", state: "Texas", lat: 31.96, lng: -99.90, base_temp: 41.2, baseline_peak_mw: 85000, transformer_load_pct: 94.5, peaker_spot_price: 68.50, primary_ticker: "UNG", solar_ghi: 945, solar_dni: 890 },
  { id: "grid_caiso", name: "CAISO California ISO", code: "CAISO", state: "California", lat: 36.77, lng: -119.41, base_temp: 39.8, baseline_peak_mw: 52000, transformer_load_pct: 88.2, peaker_spot_price: 54.20, primary_ticker: "XLU", solar_ghi: 1020, solar_dni: 960 },
  { id: "grid_pjm", name: "PJM Interconnection", code: "PJM", state: "Mid-Atlantic", lat: 40.00, lng: -76.00, base_temp: 36.5, baseline_peak_mw: 154000, transformer_load_pct: 82.4, peaker_spot_price: 42.10, primary_ticker: "NRG", solar_ghi: 780, solar_dni: 710 },
  { id: "grid_miso", name: "MISO Midwest ISO", code: "MISO", state: "Midwest", lat: 41.87, lng: -87.62, base_temp: 35.8, baseline_peak_mw: 121000, transformer_load_pct: 79.8, peaker_spot_price: 38.60, primary_ticker: "VST", solar_ghi: 740, solar_dni: 680 }
];

export default function GridTerminal() {
  const [selectedGrid, setSelectedGrid] = useState<PowerGridRegion>(US_POWER_GRIDS[0]);
  const [testRadiusMiles, setTestRadiusMiles] = useState<number>(35); // 10 to 100 miles
  const [addedSolarCapMW, setAddedSolarCapMW] = useState<number>(3500); // Simulated Solar MW
  const [ambientHeatBonus, setAmbientHeatBonus] = useState<number>(3.0); // +0°C to +8°C

  const currentTemp = parseFloat((selectedGrid.base_temp + ambientHeatBonus).toFixed(1));
  
  // Calculate FortyGuard Environmental Solar Load Reduction Physics
  // Effective solar output within radius (W/m^2 to MW conversion)
  const solarGenMW = Math.round(addedSolarCapMW * (selectedGrid.solar_ghi / 1000) * (1 - (ambientHeatBonus * 0.004)));
  
  // Net Grid Load = Baseline AC Surge - Solar Offset
  const acSurgeMW = Math.round(selectedGrid.baseline_peak_mw + (ambientHeatBonus * 2250));
  const netGridLoadMW = Math.max(20000, acSurgeMW - solarGenMW);
  const loadReductionPct = parseFloat(((solarGenMW / acSurgeMW) * 100).toFixed(1));

  // Adjusted Transformer Load %
  const netTransformerLoad = Math.max(45, parseFloat((selectedGrid.transformer_load_pct + (ambientHeatBonus * 2.2) - (loadReductionPct * 0.4)).toFixed(1)));
  const spotPriceAdjusted = Math.max(20, Math.round(selectedGrid.peaker_spot_price + Math.pow(ambientHeatBonus, 1.8) * 6 - (loadReductionPct * 0.8)));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12 z-30 relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4 text-white" />
              Enterprise Telemetry Terminal 02
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-tight">
              Whole-of-America Energy Grid & Solar Relief
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Live power grid mapping (ERCOT, CAISO, PJM, MISO), FortyGuard Environmental Solar API (GHI W/m²), and interactive radius load relief testing.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-white/10 text-xs">
            <Sun className="w-5 h-5 text-white animate-spin-slow" />
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">FortyGuard Solar API</span>
              <span className="font-extrabold text-white">GHI: {selectedGrid.solar_ghi} W/m²</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Regional Grid Selection Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Select US Regional Transmission Operator (RTO)</span>
            <span className="text-xs text-neutral-500">4 Major Power Interconnections</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {US_POWER_GRIDS.map((grid) => (
              <button
                key={grid.id}
                onClick={() => setSelectedGrid(grid)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 space-y-2 ${
                  selectedGrid.id === grid.id
                    ? "bg-white text-black border-white shadow-2xl scale-[1.02]"
                    : "bg-neutral-950 text-white border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-extrabold uppercase">
                  <span>{grid.code}</span>
                  <span className={selectedGrid.id === grid.id ? "text-black" : "text-neutral-400"}>{grid.state}</span>
                </div>
                <p className="text-sm font-extrabold font-heading">{grid.name.split(" ")[0]}</p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span>Temp: {grid.base_temp}°C</span>
                  <span>{grid.primary_ticker}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 2: Interactive FortyGuard Solar Radius Load Relief Simulator */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 bg-neutral-950/90 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase text-neutral-400 font-bold block tracking-wider">
                FortyGuard Environmental Solar API Simulator
              </span>
              <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
                <Sun className="w-5 h-5 text-white" />
                Interactive Solar Radius Testing Circle ({selectedGrid.name})
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Flame className="w-4 h-4 text-white animate-pulse" />
              <span>Simulated Temp: <strong className="text-white">{currentTemp}°C</strong></span>
            </div>
          </div>

          {/* Interactive Dual Slider Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black p-5 rounded-2xl border border-white/10">
            
            {/* Slider 1: Testing Radius (Miles) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300">Testing Circle Radius:</span>
                <span className="font-bold text-white">{testRadiusMiles} Miles</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={testRadiusMiles}
                onChange={(e) => setTestRadiusMiles(parseInt(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">Coverage Area: ~{Math.round(Math.PI * Math.pow(testRadiusMiles, 2))} sq miles</span>
            </div>

            {/* Slider 2: Solar Generation Addition (MW) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300">Simulated Solar Addition:</span>
                <span className="font-bold text-white">{addedSolarCapMW.toLocaleString()} MW</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={addedSolarCapMW}
                onChange={(e) => setAddedSolarCapMW(parseInt(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">Photovoltaic Capacity in Radius</span>
            </div>

            {/* Slider 3: Ambient Heatwave Bonus (°C) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300">Heatwave Surge (+0°C to +8°C):</span>
                <span className="font-bold text-white">+{ambientHeatBonus}°C Surge</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={ambientHeatBonus}
                onChange={(e) => setAmbientHeatBonus(parseFloat(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">Urban Heat Island Intensity</span>
            </div>

          </div>

          {/* SIMULATED GRID IMPACT RESULTS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            
            <div className="p-4 rounded-xl bg-black border border-white/10">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Gross AC Surge Load</span>
              <p className="text-2xl font-extrabold text-white">
                {acSurgeMW.toLocaleString()} <span className="text-xs text-neutral-400">MW</span>
              </p>
              <span className="text-[9px] text-neutral-500 block">Peak Summer Demand</span>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Solar Radius Generation</span>
              <p className="text-2xl font-extrabold text-white">
                +{solarGenMW.toLocaleString()} <span className="text-xs text-neutral-400">MW</span>
              </p>
              <span className="text-[9px] text-neutral-500 block">Effective Irradiance Output</span>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Net Grid Demand Peak</span>
              <p className="text-2xl font-extrabold text-white">
                {netGridLoadMW.toLocaleString()} <span className="text-xs text-neutral-400">MW</span>
              </p>
              <span className="text-[9px] text-neutral-500 block">After Solar Relief Offset</span>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10">
              <span className="text-[10px] uppercase text-neutral-400 block mb-1">Grid AC Load Relief</span>
              <p className="text-2xl font-extrabold text-white">
                -{loadReductionPct}%
              </p>
              <span className="text-[9px] text-neutral-500 block">Peak Demand Reduction</span>
            </div>

          </div>

          {/* Environmental Telemetry Card */}
          <div className="p-4 rounded-xl bg-black border border-white/10 text-xs flex items-center justify-between flex-wrap gap-4 font-mono">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-white" />
              <span>FortyGuard Solar Telemetry in {testRadiusMiles}-Mile Radius:</span>
            </div>
            <div className="flex items-center gap-4 text-neutral-300">
              <span>GHI: <strong className="text-white">{selectedGrid.solar_ghi} W/m²</strong></span>
              <span>DNI: <strong className="text-white">{selectedGrid.solar_dni} W/m²</strong></span>
              <span>Peaker Natural Gas Spot: <strong className="text-white">${spotPriceAdjusted}/MWh</strong></span>
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
