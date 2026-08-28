"use client";

import React, { useState } from "react";
import { LiveVehicle, CargoHubCondition } from "@/lib/api";
import { Compass, Crosshair, Radio, Shield, Eye, Layers, Search, Plane, Activity, Flame, ChevronRight } from "lucide-react";

interface GodsEyeHudProps {
  vehicles: LiveVehicle[];
  hubs: CargoHubCondition[];
  selectedVehicle: LiveVehicle | null;
  onSelectVehicle: (v: LiveVehicle | null) => void;
  showScopeMask: boolean;
  onToggleScopeMask: () => void;
  children: React.ReactNode;
}

export default function GodsEyeHud({
  vehicles,
  hubs,
  selectedVehicle,
  onSelectVehicle,
  showScopeMask,
  onToggleScopeMask,
  children,
}: GodsEyeHudProps) {
  const [activeTab, setActiveTab] = useState<"CONTACTS" | "COCKPIT" | "FLIGHTS">("CONTACTS");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.carrier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full rounded-3xl border border-neutral-800 bg-[#06070a] overflow-hidden shadow-2xl font-mono text-white selection:bg-cyan-500 selection:text-black">
      
      {/* Scope Mask Circular Viewport SVG Overlay */}
      {showScopeMask && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          {/* Feathered Radial Mask Overlay */}
          <div
            className="w-full h-full"
            style={{
              background: "radial-gradient(circle at center, transparent 40%, rgba(5, 5, 8, 0.75) 65%, rgba(5, 5, 8, 0.98) 85%)",
            }}
          />

          {/* Center Targeting Scope Ring & Crosshair Reticle */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-500/30 flex items-center justify-center pointer-events-none">
            <div className="absolute w-[340px] h-[340px] rounded-full border border-cyan-500/15 border-dashed" />
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            <Crosshair className="w-8 h-8 text-cyan-400/40 animate-pulse" />
          </div>
        </div>
      )}

      {/* TOP LEFT: God's Eye View Classified HUD Banner */}
      <div className="absolute top-4 left-4 z-30 space-y-1 text-xs backdrop-blur-md bg-black/80 p-3.5 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-widest">
            TOP SECRET // SI-TK // NOFORN
          </span>
        </div>
        <div className="text-white font-extrabold text-sm tracking-tight flex items-center gap-2 font-heading">
          <span>GOD'S EYE VIEW</span>
          <span className="text-[10px] text-neutral-400 font-mono font-normal">KH11-4096 OPS-4120</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">NORMAL</span>
          <span>USA CARGO LIVE AIRBORNE TRANSIST</span>
        </div>
      </div>

      {/* TOP RIGHT: Satellite Scope Viewport Toggle */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={onToggleScopeMask}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            showScopeMask
              ? "bg-cyan-950 text-cyan-300 border-cyan-700 shadow-lg shadow-cyan-950/50"
              : "bg-black/80 text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showScopeMask ? "SCOPE MASK: ON" : "SCOPE MASK: OFF"}</span>
        </button>
      </div>

      {/* MAIN CANVAS / MAP CONTAINER */}
      <div className="relative w-full h-[540px] z-10">{children}</div>

      {/* RIGHT SIDE DRAWER: OSINT Intelligence Telemetry Panel */}
      <div className="absolute top-16 right-4 bottom-14 w-80 z-30 bg-black/90 border border-neutral-800 rounded-2xl backdrop-blur-xl p-4 flex flex-col space-y-4 shadow-2xl overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[10px] uppercase font-bold">
          {(["CONTACTS", "COCKPIT", "FLIGHTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-white text-black font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search Callsign / Carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
          {activeTab === "CONTACTS" && (
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Active Transponders ({filteredVehicles.length})</span>
              {filteredVehicles.slice(0, 15).map((v) => (
                <div
                  key={v.callsign}
                  onClick={() => onSelectVehicle(v)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    selectedVehicle?.callsign === v.callsign
                      ? "bg-cyan-950/60 border-cyan-700 text-white"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Plane className="w-3 h-3 text-cyan-400" />
                      {v.callsign}
                    </span>
                    <span className="text-[9px] text-neutral-400">{v.speed_kts} kts</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{v.carrier.split(" ")[0]}</span>
                    <span>Alt: {Math.round(v.altitude_m * 3.28084).toLocaleString()} ft</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "COCKPIT" && selectedVehicle && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">Selected Aircraft Cockpit</span>
                <p className="text-sm font-extrabold text-white">{selectedVehicle.callsign}</p>
                <p className="text-xs text-neutral-300">{selectedVehicle.carrier}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Destination:</span>
                  <span className="font-bold text-white">{selectedVehicle.destination_code || "PHX"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Density Altitude:</span>
                  <span className="font-bold text-rose-400">{(selectedVehicle.density_altitude_ft || 4835).toLocaleString()} ft</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Engine Thrust Loss:</span>
                  <span className="font-bold text-rose-400">-{selectedVehicle.thrust_loss_pct || 13.0}%</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Cargo Offload Req:</span>
                  <span className="font-bold text-amber-400">-{selectedVehicle.offload_lbs || 4800} lbs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1">
                <span className="text-[9px] uppercase text-neutral-400 block font-bold">Action Recommendation</span>
                <p className="text-[10px] text-neutral-300 font-sans leading-relaxed">
                  {selectedVehicle.advisory || "Nominal flight profile."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "FLIGHTS" && (
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Major USA Cargo Hubs</span>
              {hubs.map((hub) => (
                <div key={hub.code} className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">{hub.code} • {hub.city}</span>
                    <span className={hub.has_heat_spike ? "text-rose-400" : "text-cyan-400"}>{hub.temp_celsius}°C</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">DA: {hub.physics.density_altitude_ft.toLocaleString()} ft • -{hub.physics.thrust_loss_pct}% Thrust</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM HUD STATUS BAR */}
      <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between p-3 rounded-xl bg-black/80 border border-neutral-800 backdrop-blur-md text-xs">
        <div className="flex items-center gap-4 text-neutral-400 text-[10px]">
          <span>MGRS: 12S VB 6750 0539</span>
          <span>LAT: 33°43'52"N</span>
          <span>LNG: 112°01'01"W</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OPEN SKY ADS-B TELEMETRY STREAM ACTIVE</span>
        </div>
      </div>

    </div>
  );
}
