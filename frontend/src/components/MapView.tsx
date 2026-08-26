"use client";

import { useEffect, useState } from "react";
import { EconomicNode, fetchFortyGuardTelemetry } from "@/lib/api";
import { Thermometer, ShieldAlert, Navigation, Layers } from "lucide-react";

interface Props {
  selectedNode: EconomicNode | null;
  nodes: EconomicNode[];
  onSelectNode: (node: EconomicNode) => void;
}

export default function MapView({ selectedNode, nodes, onSelectNode }: Props) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setLoading(true);
      fetchFortyGuardTelemetry(selectedNode.lat, selectedNode.lng).then((res) => {
        setTelemetry(res);
        setLoading(false);
      });
    }
  }, [selectedNode]);

  return (
    <div className="w-full h-[420px] rounded-2xl glass-panel relative overflow-hidden border border-slate-800/80 group">
      {/* Background Stylized Map Canvas Simulation */}
      <div className="absolute inset-0 cyber-grid bg-slate-950/90 flex items-center justify-center">
        {/* Simulated Map Visualizer Grid */}
        <div className="absolute inset-0 bg-radial from-slate-900/50 via-slate-950 to-slate-950 pointer-events-none" />

        {/* Node Location Markers on Radar Canvas */}
        <div className="relative w-full h-full p-6 flex flex-col justify-between">
          
          {/* Top Bar overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                FortyGuard Microclimate GIS Radar
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800">
              <Navigation className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Lat: {selectedNode?.lat.toFixed(4)} | Lng: {selectedNode?.lng.toFixed(4)}
            </div>
          </div>

          {/* Center Thermal Pulsing Node Visualization */}
          <div className="self-center flex flex-col items-center my-auto z-10 text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/40 thermal-pulse flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/60 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 shadow-lg shadow-rose-500/50 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="font-extrabold text-lg text-white mb-1">
              {selectedNode?.name}
            </h2>
            <p className="text-xs font-mono text-cyan-400 max-w-md">
              {selectedNode?.description}
            </p>
          </div>

          {/* Bottom Telemetry HUD Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10 bg-slate-900/90 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Micro Temp</span>
              <p className="text-sm font-bold font-mono text-rose-400">
                {loading ? "Polling..." : `${telemetry?.temperature || 39.2}°C`}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Heat Index</span>
              <p className="text-sm font-bold font-mono text-amber-400">
                {loading ? "Polling..." : `${telemetry?.heat_index || 43.8}°C`}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Wet-Bulb Temp</span>
              <p className="text-sm font-bold font-mono text-cyan-400">
                {loading ? "Polling..." : `${telemetry?.wet_bulb_temp || 30.1}°C`}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Heat Risk Score</span>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold font-mono text-emerald-400">
                  {loading ? "Polling..." : `${telemetry?.microclimate_risk_score || 88}/100`}
                </p>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
