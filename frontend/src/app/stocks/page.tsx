"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchMarketQuotes, MarketQuote } from "@/lib/api";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Search, ArrowRight } from "lucide-react";

export default function StockMatrixPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [query, setQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

  useEffect(() => {
    fetchMarketQuotes().then(setQuotes);
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    const matchesQuery = q.symbol.toLowerCase().includes(query.toLowerCase()) || q.name.toLowerCase().includes(query.toLowerCase());
    const matchesRegion = selectedRegion === "ALL" || q.sector.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchesQuery && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section - Full Height */}
      <section className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center pt-20">
        
        {/* Background Grid Pattern (Optional) */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

        {/* Floating 3D Asset Images */}
        <div className="absolute inset-0 max-w-[100vw] overflow-hidden">
          {/* Logistics: Left Corner */}
          <img 
            src="/assets/logistics_nobg.png" 
            alt="Logistics Asset" 
            className="absolute -left-10 bottom-10 md:left-10 md:bottom-20 w-[60%] md:w-[30%] max-w-[400px] object-contain drop-shadow-[0_20px_30px_rgba(168,85,247,0.3)] animate-float-delayed z-10 opacity-80" 
          />
          {/* Aviation: Right Corner */}
          <img 
            src="/assets/aviation_nobg.png" 
            alt="Aviation Asset" 
            className="absolute -right-10 bottom-20 md:right-10 md:bottom-32 w-[60%] md:w-[30%] max-w-[450px] object-contain drop-shadow-[0_20px_30px_rgba(168,85,247,0.3)] animate-float z-20 opacity-90" 
          />
          {/* Energy: Mid Top Left Back */}
          <img 
            src="/assets/energy_nobg.png" 
            alt="Energy Asset" 
            className="absolute top-10 left-1/4 md:top-16 md:left-[30%] w-[50%] md:w-[25%] max-w-[350px] object-contain drop-shadow-[0_20px_40px_rgba(132,204,22,0.3)] animate-float-slow z-0 opacity-60" 
          />
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-6xl sm:text-7xl md:text-[9rem] font-black text-white font-heading uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.6)] text-center leading-[0.9] mt-32">
            Stock &<br />Analytics
          </h2>
          <p className="text-sm md:text-lg text-neutral-300 font-mono mt-8 max-w-2xl text-center drop-shadow-md">
            Powered by FortyGuard Thermal Alpha vectors and technical seasonality.
          </p>
        </div>

        {/* Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent z-40 pointer-events-none"></div>
      </section>

      {/* Stocks Matrix Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10 z-30 relative">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-black text-white font-heading uppercase">
              Stocks
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button 
                onClick={() => setSelectedRegion("ALL")}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border uppercase transition-colors backdrop-blur-md ${selectedRegion === "ALL" ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800"}`}
              >
                All Assets
              </button>
              <button 
                onClick={() => setSelectedRegion("Energy")}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border uppercase transition-colors backdrop-blur-md ${selectedRegion === "Energy" ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800"}`}
              >
                Energy
              </button>
              <button 
                onClick={() => setSelectedRegion("Aviation")}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border uppercase transition-colors backdrop-blur-md ${selectedRegion === "Aviation" ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800"}`}
              >
                Aviation
              </button>
              <button 
                onClick={() => setSelectedRegion("Freight")}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border uppercase transition-colors backdrop-blur-md ${selectedRegion === "Freight" ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800"}`}
              >
                Freight & Logistics
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or asset..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 shadow-inner transition-colors"
            />
          </div>
        </div>

        {/* 16-Asset Stock Matrix Grid with Shadcn Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredQuotes.map((stock) => {
            const isPos = stock.change_pct >= 0;
            const gradientId = `fill-${stock.symbol}`;
            const strokeColor = isPos ? "#10b981" : "#f43f5e";
            
            // Format sparkline data for Recharts
            const chartData = stock.sparkline?.map((price, i) => ({ index: i, price })) || [];
            
            // Calculate yAxis domain safely
            const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
            const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 100;
            const domainPadding = (maxPrice - minPrice) * 0.1;

            return (
              <Link
                key={stock.symbol}
                href={`/stocks/${stock.symbol}`}
                className="group glass-panel rounded-2xl border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900 hover:border-neutral-600 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl relative"
              >
                {/* Top Half: Stock Info */}
                <div className="p-5 space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-heading text-white px-2 py-0.5 rounded bg-white/10 border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
                      ${stock.symbol}
                    </span>
                    <span className="text-[10px] text-neutral-400">Lag: +{stock.lag_days}d</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white font-heading truncate">{stock.name}</h3>
                    <span className="text-[10px] text-neutral-500 block truncate">{stock.sector}</span>
                  </div>
                  
                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <span className="text-base font-extrabold text-white block leading-none">${stock.price.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold flex items-center gap-1 leading-none ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? `+${stock.change_pct}%` : `${stock.change_pct}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Half: Shadcn-Style Sparkline AreaChart */}
                <div className="w-full h-[70px] mt-auto relative z-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <YAxis domain={[minPrice - domainPadding, maxPrice + domainPadding]} hide />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={strokeColor} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#${gradientId})`} 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Inspect Overlay Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors z-20">
                  <span>Inspect Thermal Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </section>

      {/* Standard Tempy Watermark Footer */}
      <footer className="relative border-t border-neutral-900 bg-black pt-16 pb-4 overflow-hidden font-mono z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 justify-between">
            
            {/* Left: Brand Badge & Copyright */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-white/10 group-hover:scale-105 transition-transform flex items-center justify-center bg-black border border-white/20">
                  <img src="/logo.png" alt="Tempy Logo" className="w-full h-full object-cover" />
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
                  <li><Link href="/stocks" className="hover:text-white transition-colors text-white font-bold">Stocks Analytics</Link></li>
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
          <span className="text-[14vw] font-black uppercase font-heading bg-gradient-to-b from-neutral-600 via-neutral-800 to-transparent bg-clip-text text-transparent tracking-tighter block leading-none opacity-80">
            TEMPY
          </span>
        </div>
      </footer>
    </div>
  );
}
