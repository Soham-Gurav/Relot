"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPredictiveSignals, PredictiveSignal } from "@/lib/api";
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function SignalRadar() {
  const [signals, setSignals] = useState<PredictiveSignal[]>([]);

  useEffect(() => {
    fetchPredictiveSignals().then((data) => setSignals(data));
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="font-extrabold text-base text-slate-100 tracking-tight font-heading">
            Real-Time Predictive Lag Signals
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
          Updated Live (2026-08-26)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="glass-card-orange rounded-xl p-5 border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Header: Node & Ticker */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                    {sig.node_name}
                  </span>
                  <Link href={`/stocks/${sig.ticker}`} className="group/link flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-100 group-hover/link:text-cyan-400 transition-colors">
                      {sig.ticker}
                    </h3>
                    <span className="text-xs font-normal text-slate-400">({sig.ticker_name})</span>
                  </Link>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-slate-100">
                    ${sig.ticker_price.toFixed(2)}
                  </span>
                  <span
                    className={`block text-[11px] font-mono font-semibold ${
                      sig.ticker_change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {sig.ticker_change >= 0 ? `+${sig.ticker_change}%` : `${sig.ticker_change}%`}
                  </span>
                </div>
              </div>

              {/* Microclimate Parameter & Lag Alert Badge */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/80 border border-neutral-800 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono text-slate-300 line-clamp-1">
                    {sig.heat_parameter}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-xs font-mono font-extrabold px-2.5 py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-500/40 shrink-0">
                  <Clock className="w-3 h-3" />
                  {sig.optimal_lag}
                </span>
              </div>

              {/* AI Predictive Insight */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                {sig.prediction}
              </p>
            </div>

            {/* Footer Risk Score & Link */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                Risk: {sig.risk_score}/100
              </span>

              <Link
                href={`/stocks/${sig.ticker}`}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-all group/btn"
              >
                <span>3-Year History</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
