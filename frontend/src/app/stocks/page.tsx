"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchMarketQuotes, MarketQuote } from "@/lib/api";
import { BarChart3, TrendingUp, TrendingDown, Flame, ShieldCheck, Search, ArrowRight, Layers, Sparkles } from "lucide-react";

export default function StockMatrixPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [query, setQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  useEffect(() => {
    fetchMarketQuotes().then(setQuotes);
  }, []);

  const sectors = ["ALL", "Aviation & Logistics", "Energy & Power Utilities", "Agricultural Commodities", "Intermodal Freight & Rail"];

  const filteredQuotes = quotes.filter((q) => {
    const matchesQuery = q.symbol.toLowerCase().includes(query.toLowerCase()) || q.name.toLowerCase().includes(query.toLowerCase());
    const matchesSector = selectedSector === "ALL" || q.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesQuery && matchesSector;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12 z-30 relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-widest">
              <BarChart3 className="w-4 h-4 text-white" />
              Enterprise Telemetry Terminal 03
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-tight">
              Stock Dependency & Seasonality Radar
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              16 Heat-Dependent Assets across Aviation, Energy, Agriculture, and Freight with FortyGuard Thermal Alpha vectors and 3-Year Technical Seasonality.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-white/10 text-xs">
            <Flame className="w-5 h-5 text-white animate-pulse" />
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Active Asset Coverage</span>
              <span className="font-extrabold text-white">16 Sector Equities & ETFs</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-neutral-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          
          {/* Sector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedSector === sec
                    ? "bg-white text-black font-extrabold"
                    : "bg-black text-neutral-400 border border-white/10 hover:text-white"
                }`}
              >
                {sec === "ALL" ? "All 16 Assets" : sec.split(" & ")[0]}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or asset..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
            />
          </div>

        </div>

        {/* 16-Asset Stock Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredQuotes.map((stock) => {
            const isPos = stock.change_pct >= 0;
            return (
              <Link
                key={stock.symbol}
                href={`/stocks/${stock.symbol}`}
                className="group glass-panel rounded-2xl p-5 border border-white/10 bg-neutral-950/80 hover:bg-neutral-900 hover:border-white/30 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-2">
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
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Price</span>
                    <span className="text-base font-extrabold text-white">${stock.price.toFixed(2)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block uppercase">Daily Change</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPos ? `+${stock.change_pct}%` : `${stock.change_pct}%`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-400 group-hover:text-white transition-colors">
                  <span>Inspect Thermal Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

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
