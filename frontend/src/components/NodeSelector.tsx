"use client";

import { EconomicNode } from "@/lib/api";
import { Plane, Anchor, Wheat, Zap, ChevronRight } from "lucide-react";

interface Props {
  nodes: EconomicNode[];
  selectedNode: EconomicNode | null;
  onSelectNode: (node: EconomicNode) => void;
}

export default function NodeSelector({ nodes, selectedNode, onSelectNode }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case "airport_phoenix":
        return <Plane className="w-5 h-5 text-amber-400" />;
      case "port_houston":
        return <Anchor className="w-5 h-5 text-cyan-400" />;
      case "iowa_agri":
        return <Wheat className="w-5 h-5 text-emerald-400" />;
      case "texas_grid":
        return <Zap className="w-5 h-5 text-rose-400" />;
      default:
        return <Plane className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {nodes.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        return (
          <button
            key={node.id}
            onClick={() => onSelectNode(node)}
            className={`text-left p-4 rounded-xl transition-all relative overflow-hidden group ${
              isSelected
                ? "glass-panel-glow bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-[1.02]"
                : "glass-panel bg-slate-950/60 hover:bg-slate-900/60 border-slate-800/80"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">
                {getIcon(node.id)}
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
                Ticker: {node.primary_ticker}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
              {node.name}
            </h3>
            
            <p className="text-[11px] text-slate-400 font-mono mb-3 line-clamp-1">
              {node.category}
            </p>

            <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
              <span>Optimal Lag: <strong className="text-cyan-400">+{node.lag_days}d</strong></span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "translate-x-1 text-cyan-400" : ""}`} />
            </div>

            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
