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
              {/* Top Visual Graphic: USA Coastline + Dotted Ocean Route + Approaching Cargo Circle */}
              <div className="h-44 w-full rounded-2xl bg-black/70 border border-neutral-800/80 p-3 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* USA Continental Map Border SVG Outline */}
                  <path
                    d="M 25,32 L 55,30 L 85,28 L 115,30 L 135,32 L 150,30 L 165,28 L 180,30 L 205,25 L 210,38 L 195,48 L 190,62 L 182,78 L 185,98 L 178,118 L 170,118 L 168,95 L 155,95 L 140,102 L 125,108 L 110,118 L 98,110 L 85,112 L 72,105 L 52,98 L 32,85 L 22,65 L 25,48 Z"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeOpacity="0.45"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="rgba(255, 255, 255, 0.04)"
                  />
                  {/* State Grid Internal Lines for realistic GIS look */}
                  <path
                    d="M 110,30 L 110,118 M 85,28 L 85,112 M 150,30 L 150,95 M 52,30 L 52,98"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    strokeOpacity="0.12"
                    strokeDasharray="2 2"
                  />

                  {/* US Gulf Coast / Houston Destination Node */}
                  <circle cx="110" cy="118" r="4.5" fill="#38bdf8" />
                  <circle cx="110" cy="118" r="9" fill="#38bdf8" opacity="0.25" className="animate-ping" />
                  
                  {/* Dotted Ocean Route Trajectory approaching from Ocean */}
                  <path
                    d="M 225,135 C 185,138 150,132 110,118"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeOpacity="0.85"
                  />

                  {/* Approaching Cargo Vessel Circle */}
                  <g transform="translate(165, 128)">
                    <circle cx="0" cy="0" r="6" fill="#38bdf8" />
                    <circle cx="0" cy="0" r="11" fill="#38bdf8" opacity="0.35" className="animate-ping" />
                  </g>
                  
                  {/* Route Callout Badge */}
                  <rect x="135" y="60" width="88" height="22" rx="11" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.6" />
                  <text x="179" y="74.5" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    CNSHG ➔ USIAH
                  </text>
                </svg>
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
              {/* Top Visual Graphic: Central Power Grid + Curved Wires Spanning Outwards */}
              <div className="h-44 w-full rounded-2xl bg-black/70 border border-neutral-800/80 p-3 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Curved Wires Spanning Outwards from Center */}
                  <path d="M 120,70 Q 70,30 25,25" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="3 3" />
                  <path d="M 120,70 Q 170,30 215,25" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="3 3" />
                  <path d="M 120,70 Q 50,70 20,80" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />
                  <path d="M 120,70 Q 190,70 220,80" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />
                  <path d="M 120,70 Q 70,110 30,120" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="3 3" />
                  <path d="M 120,70 Q 170,110 210,120" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />

                  {/* Outer Substation Nodes */}
                  <circle cx="25" cy="25" r="4" fill="#f59e0b" />
                  <circle cx="215" cy="25" r="4" fill="#f59e0b" />
                  <circle cx="20" cy="80" r="4" fill="#f59e0b" />
                  <circle cx="220" cy="80" r="4" fill="#f59e0b" />
                  <circle cx="30" cy="120" r="4" fill="#f59e0b" />
                  <circle cx="210" cy="120" r="4" fill="#f59e0b" />

                  {/* Central Main Power Grid Node */}
                  <circle cx="120" cy="70" r="22" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="120" cy="70" r="14" fill="#f59e0b" opacity="0.9" />
                  
                  {/* Central Zap Bolt Symbol */}
                  <path d="M 121,61 L 114,71 L 119,71 L 118,79 L 126,69 L 121,69 Z" fill="#000000" />
                </svg>
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
              {/* Top Visual Graphic: Stock Price Chart with Alpha Spikes */}
              <div className="h-44 w-full rounded-2xl bg-black/70 border border-neutral-800/80 p-3 flex items-center justify-center relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                <svg className="w-full h-full" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="stock-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Background Grid Lines */}
                  <line x1="20" y1="30" x2="220" y2="30" stroke="#ffffff" strokeOpacity="0.06" />
                  <line x1="20" y1="65" x2="220" y2="65" stroke="#ffffff" strokeOpacity="0.06" />
                  <line x1="20" y1="100" x2="220" y2="100" stroke="#ffffff" strokeOpacity="0.06" />

                  {/* Stock Area Fill */}
                  <path
                    d="M 20,95 L 50,85 L 80,105 L 110,60 L 140,75 L 170,35 L 200,45 L 220,25 L 220,120 L 20,120 Z"
                    fill="url(#stock-area)"
                  />

                  {/* Glowing Stock Line */}
                  <path
                    d="M 20,95 L 50,85 L 80,105 L 110,60 L 140,75 L 170,35 L 200,45 L 220,25"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Heat Event Spike Dots */}
                  <circle cx="110" cy="60" r="4" fill="#f43f5e" />
                  <circle cx="170" cy="35" r="4" fill="#10b981" />
                  <circle cx="220" cy="25" r="4" fill="#10b981" />
                  <circle cx="220" cy="25" r="8" fill="#10b981" opacity="0.3" className="animate-ping" />

                  {/* Floating Mini Ticker Pills */}
                  <rect x="25" y="45" width="55" height="18" rx="9" fill="#09090b" stroke="#f43f5e" strokeOpacity="0.6" />
                  <text x="52.5" y="57" fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    $FDX -4.2%
                  </text>

                  <rect x="145" y="15" width="60" height="18" rx="9" fill="#09090b" stroke="#10b981" strokeOpacity="0.6" />
                  <text x="175" y="27" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    $CORN +6.5%
                  </text>
                </svg>
              </div>

              {/* Bottom Title & Concise Subtitle */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight group-hover:text-rose-300 transition-colors">
                  Stock Analytics & Seasonality
                </h3>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Heat dependency alpha radar across 16 sector equities and ETFs.
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
