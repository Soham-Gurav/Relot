"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { fetchEconomicNodes, EconomicNode } from "@/lib/api";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { Sparkles, Ship, Zap, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  const [nodes, setNodes] = useState<EconomicNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<EconomicNode | null>(null);

  useEffect(() => {
    fetchEconomicNodes().then((data) => {
      setNodes(data);
      if (data.length > 0) {
        setSelectedNode(data[0]);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      {/* AutoAI Photorealistic 3D Earth Globe Hero Section */}
      <HeroSection
        nodes={nodes}
        selectedNode={selectedNode}
        onSelectNode={setSelectedNode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 z-30 relative">
        
        {/* Bento Grid Domain Terminals Section (Exact Match to Image 1) */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-neutral-800 bg-[#09090b] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80">
            
            {/* Column 1: Cargo & Supply Chain */}
            <Link
              href="/cargo"
              className="group p-8 flex flex-col justify-between space-y-8 hover:bg-neutral-900/60 transition-all duration-300 relative"
            >
              {/* Top Visual Graphic: User Provided Cargo USA Map Image */}
              <div className="h-48 w-full rounded-2xl bg-black border border-neutral-800/80 p-1 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <img
                  src="/images/bento/bento_cargo.png"
                  alt="Cargo & Supply Chain USA Network Map"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Bottom Title & Concise Subtitle */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  Cargo & Supply Chain
                </h3>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Live maritime shipping lanes, 510+ ports, and Density Altitude payload physics.
                </p>
              </div>
            </Link>

            {/* Column 2: Energy Grid & Solar Relief */}
            <Link
              href="/grid"
              className="group p-8 flex flex-col justify-between space-y-8 hover:bg-neutral-900/60 transition-all duration-300 relative"
            >
              {/* Top Visual Graphic: User Provided Solar Energy Grid Image */}
              <div className="h-48 w-full rounded-2xl bg-black border border-neutral-800/80 p-1 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <img
                  src="/images/bento/bento_energy.png"
                  alt="Energy Grid Solar Peaker Plant Network"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Bottom Title & Concise Subtitle */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  Energy Grid & Solar Relief
                </h3>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Whole-of-America power grid telemetry and solar load relief radius testing.
                </p>
              </div>
            </Link>

            {/* Column 3: Stock Analytics & Seasonality */}
            <Link
              href="/stocks"
              className="group p-8 flex flex-col justify-between space-y-8 hover:bg-neutral-900/60 transition-all duration-300 relative"
            >
              {/* Top Visual Graphic: User Provided Stock Performance & Seasonality Image */}
              <div className="h-48 w-full rounded-2xl bg-black border border-neutral-800/80 p-1 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <img
                  src="/images/bento/bento_stocks.png"
                  alt="Stock Performance & Microclimate Seasonality Chart"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Bottom Title & Concise Subtitle */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  Stock Analytics & Seasonality
                </h3>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Heat-driven equity signals, lag cascades, and historical backtest matrices.
                </p>
              </div>
            </Link>

          </div>
        </section>
      </main>

      {/* SECTION 2: What Tempy Is - Full Screen Width Edge-to-Edge with Animated Grid (Increased Height) */}
      <section className="w-full relative bg-[#060608] border-t border-neutral-800/80 border-b border-white/20 py-36 sm:py-52 min-h-[550px] flex flex-col justify-center items-center overflow-hidden mt-12 mb-0 text-center">
        {/* Magic UI Animated Grid Pattern spanning full screen width */}
        <AnimatedGridPattern
          numSquares={60}
          maxOpacity={0.25}
          duration={3.5}
          repeatDelay={0.5}
          className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest font-bold block">
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-6xl font-extrabold font-heading text-white tracking-tight uppercase">
            Microclimate Intelligence Engine
          </h2>
          <p className="text-xs sm:text-lg text-neutral-300 font-mono leading-relaxed max-w-3xl mx-auto">
            Tempy offers an enterprise microclimate intelligence terminal built to predict physical infrastructure disruptions and financial market lag vectors. By fusing FortyGuard thermal telemetry with aerodynamic, agronomic, and electrical grid physics, Tempy quantifies how urban heat domes impact global assets in real time.
          </p>
        </div>
      </section>

      {/* Footer matching User Reference Image - Connected Flush with White Border Divider */}
      <footer className="relative bg-black pt-16 pb-4 overflow-hidden font-mono z-30">
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
