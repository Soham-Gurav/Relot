"use client";
import Footer from '@/components/Footer';

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

      <Footer />
    </div>
  );
}
