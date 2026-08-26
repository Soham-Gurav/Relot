"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TickerMarquee from "@/components/TickerMarquee";
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans cyber-grid">
      <Navbar />
      <TickerMarquee />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/80 bg-slate-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              <Database className="w-3.5 h-3.5" />
              1,416 Trading Days Backtest Dataset (2021 – 2026)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              2021–2026 Backtest Matrix & Lag Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-3xl">
              Empirical evidence proving the <strong>Microclimate Lag Gap</strong>: Commodities (`CORN`, `UNG`) react immediately on <strong>Lag 0</strong>, while Logistics & Aviation (`FDX`, `JBHT`, `AAL`) exhibit maximum price volatility <strong>3 to 5 days AFTER</strong> FortyGuard microclimate heat waves.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <Filter className="w-4 h-4 text-cyan-400 ml-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 outline-none pr-4 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Sectors</option>
              <option value="Aviation" className="bg-slate-900">Aviation & Logistics</option>
              <option value="Agri" className="bg-slate-900">Agri-Commodities</option>
              <option value="Energy" className="bg-slate-900">Energy & Power Grid</option>
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Economic Node</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Sector</th>
                  <th className="p-4 text-cyan-400">Optimal Lag</th>
                  <th className="p-4 text-rose-400">Max |r| Corr</th>
                  <th className="p-4">Lag 0</th>
                  <th className="p-4">Lag 1</th>
                  <th className="p-4">Lag 3</th>
                  <th className="p-4">Lag 5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{item.node_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 font-extrabold text-cyan-400">
                        {item.ticker}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{item.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-cyan-950/80 text-cyan-300 font-extrabold border border-cyan-500/40">
                        {item.optimal_lag}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-rose-400">{item.max_corr}</td>
                    <td className="p-4">{item.lag_0}</td>
                    <td className="p-4">{item.lag_1}</td>
                    <td className="p-4">{item.lag_3}</td>
                    <td className="p-4">{item.lag_5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Insights List */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Key Empirical Findings & Economic Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matrix.map((item, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-400 text-sm">{item.ticker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                    Optimal: {item.optimal_lag}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-200">{item.node_name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <p>MacroHeat 360 Backtest Engine • 2021–2026 FortyGuard Telemetry Analysis</p>
      </footer>
    </div>
  );
}
