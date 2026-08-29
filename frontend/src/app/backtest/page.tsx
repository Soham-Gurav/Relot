"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchBacktestMatrix, BacktestMatrixItem } from "@/lib/api";
import { Database, Filter, ArrowUpRight, ShieldCheck, Clock, Sparkles } from "lucide-react";

export default function BacktestPage() {
  const [matrix, setMatrix] = useState<BacktestMatrixItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchBacktestMatrix().then((data) => setMatrix(data));
  }, []);

  const filteredMatrix = filterCategory === "ALL"
    ? matrix
    : matrix.filter((item) => item.category.toLowerCase().includes(filterCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans cyber-grid selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-10 z-10 relative">
        
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800 bg-neutral-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-black text-xs font-mono font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <Database className="w-3.5 h-3.5" />
              1,416 Trading Days Backtest Dataset (2021 – 2026)
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading uppercase">
              2021–2026 Backtest Matrix & Lag Discovery
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-3xl leading-relaxed">
              Empirical evidence proving the <strong>Microclimate Lag Gap</strong>: Commodities (`CORN`, `UNG`) react immediately on <strong>Lag 0</strong>, while Logistics & Aviation (`FDX`, `JBHT`, `AAL`) exhibit maximum price volatility <strong>3 to 5 days AFTER</strong> FortyGuard microclimate heat waves.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-xl border border-neutral-800 shrink-0 shadow-inner">
            <Filter className="w-4 h-4 text-white ml-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white outline-none pr-4 cursor-pointer uppercase tracking-wider"
            >
              <option value="ALL" className="bg-neutral-900">All Sectors</option>
              <option value="Aviation" className="bg-neutral-900">Aviation & Logistics</option>
              <option value="Agri" className="bg-neutral-900">Agri-Commodities</option>
              <option value="Energy" className="bg-neutral-900">Energy & Power Grid</option>
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="glass-panel rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Economic Node</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Sector</th>
                  <th className="p-4 text-white font-black">Optimal Lag</th>
                  <th className="p-4 text-neutral-300">Max |r| Corr</th>
                  <th className="p-4">Lag 0</th>
                  <th className="p-4">Lag 1</th>
                  <th className="p-4">Lag 3</th>
                  <th className="p-4">Lag 5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filteredMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/80 transition-colors">
                    <td className="p-4 font-bold text-white">{item.node_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-white text-black font-extrabold shadow-sm">
                        {item.ticker}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">{item.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-neutral-800 text-white font-extrabold border border-neutral-700">
                        {item.optimal_lag}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-neutral-100">{item.max_corr}</td>
                    <td className="p-4 text-neutral-500">{item.lag_0}</td>
                    <td className="p-4 text-neutral-500">{item.lag_1}</td>
                    <td className="p-4 text-neutral-400">{item.lag_3}</td>
                    <td className="p-4 text-neutral-400">{item.lag_5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Insights List */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3 font-heading uppercase">
            <Sparkles className="w-5 h-5 text-white" />
            Key Empirical Findings & Economic Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matrix.map((item, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-3 hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-base font-heading uppercase tracking-wider">{item.ticker}</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 font-bold border border-neutral-700 uppercase tracking-widest">
                    Optimal: {item.optimal_lag}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-neutral-300 font-sans">{item.node_name}</h4>
                <div className="w-full h-px bg-neutral-800 my-2" />
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

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
                  <li><Link href="/stocks" className="hover:text-white transition-colors">Stocks Analytics</Link></li>
                  <li><Link href="/backtest" className="hover:text-white transition-colors text-white font-bold">Backtest</Link></li>
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
