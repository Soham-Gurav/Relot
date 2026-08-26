"use client";

import { useEffect, useState } from "react";
import { fetchTickerHistory, StockHistoryItem } from "@/lib/api";
import Link from "next/link";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from "recharts";
import { BarChart3, Calendar, ArrowRight, Flame } from "lucide-react";

interface Props {
  symbol: string;
  nodeName: string;
}

export default function MarketChart({ symbol, nodeName }: Props) {
  const [data, setData] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpikeAnalysis, setShowSpikeAnalysis] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTickerHistory(symbol, "1y").then((history) => {
      setData(history);
      setLoading(false);
    });
  }, [symbol]);

  const heatSpikeCount = data.filter((item) => item.is_heat_spike).length;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
            FortyGuard Telemetry vs Financial Return
          </span>
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rose-500" />
            {symbol} Stock/Commodity Correlation ({nodeName})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Heat Spike Toggle Button */}
          <button
            onClick={() => setShowSpikeAnalysis(!showSpikeAnalysis)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              showSpikeAnalysis
                ? "bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-md shadow-rose-500/20"
                : "bg-neutral-900 text-slate-400 border-neutral-800 hover:text-white"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showSpikeAnalysis ? "text-rose-400 animate-pulse" : ""}`} />
            <span>Spike Analysis</span>
            <span className="text-[10px] bg-rose-900/80 text-white px-1.5 py-0.2 rounded">
              {showSpikeAnalysis ? "ON" : "OFF"}
            </span>
          </button>

          <Link
            href={`/stocks/${symbol}`}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>Full Stock Profile & 3-Year Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] flex items-center justify-center text-sm font-mono text-slate-500">
          Loading market historical telemetry...
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 11 }} domain={[15, 52]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar yAxisId="right" dataKey="temperature" name="FortyGuard Micro Temp (°C)" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={showSpikeAnalysis && entry.is_heat_spike ? "#f43f5e" : "#991b1b"}
                    opacity={showSpikeAnalysis && entry.is_heat_spike ? 0.95 : 0.45}
                  />
                ))}
              </Bar>
              <Line yAxisId="left" type="monotone" dataKey="close" name={`${symbol} Price ($)`} stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
