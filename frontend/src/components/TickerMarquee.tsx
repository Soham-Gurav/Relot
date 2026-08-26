"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMarketQuotes, MarketQuote } from "@/lib/api";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

export default function TickerMarquee() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    fetchMarketQuotes().then((data) => setQuotes(data));
  }, []);

  const marqueeItems = [...quotes, ...quotes];

  return (
    <div className="w-full bg-black/90 border-b border-neutral-800/80 overflow-hidden py-2.5 relative">
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee items-center gap-6">
        {marqueeItems.map((q, idx) => (
          <Link
            key={`${q.symbol}-${idx}`}
            href={`/stocks/${q.symbol}`}
            className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-cyan-500/50 transition-all whitespace-nowrap cursor-pointer group"
          >
            <span className="font-extrabold text-xs text-white group-hover:text-cyan-400 transition-colors">
              {q.symbol}
            </span>
            <span className="text-xs font-mono text-slate-300">${q.price.toFixed(2)}</span>
            
            <span
              className={`flex items-center text-[11px] font-mono font-semibold ${
                q.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {q.change_pct >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              )}
              {q.change_pct >= 0 ? `+${q.change_pct}%` : `${q.change_pct}%`}
            </span>

            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black text-cyan-400 border border-cyan-500/30">
              <Clock className="w-2.5 h-2.5" />
              Lag +{q.lag_days}d
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
