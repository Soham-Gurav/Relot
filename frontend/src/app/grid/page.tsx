"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import PowerPlantsTempMonitor from "@/components/PowerPlantsTempMonitor";
import SolarGridSuitabilityEvaluator from "@/components/SolarGridSuitabilityEvaluator";
import { Zap, Sun } from "lucide-react";

export default function GridTerminal() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12 z-30 relative">

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-tight">
            Whole-of-America Energy Grid & Solar Placement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Real-time monitoring of US nuclear/hydro power plants & surrounding temperatures, custom location 10–20km circular search radius, FortyGuard environmental solar telemetry, and grid placement suitability evaluation.
          </p>
        </div>

        {/* SECTION 1: Power Plants & Surrounding Temperature Telemetry Monitor */}
        <PowerPlantsTempMonitor />

        {/* SECTION 2: Custom Location Search, 10-20km Circular Radius & Solar Grid Placement Suitability Evaluator */}
        <SolarGridSuitabilityEvaluator />

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
