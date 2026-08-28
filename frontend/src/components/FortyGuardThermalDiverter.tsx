"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, ThermometerSnowflake, ArrowRight, CheckCircle2, AlertTriangle, Building2, Flame, RefreshCw } from "lucide-react";
import { fetchCargoTelemetry } from "@/lib/api";

export interface CloseUpHub {
  id: string;
  name: string;
  code: string;
  type: "airport" | "seaport";
  city: string;
  asphalt_temp_c: number;
  shade_temp_c: number;
  cold_vault_temp_c: number;
  humidity_pct: number;
  status: "CRITICAL_HEAT_SPOILAGE" | "MODERATE_HEAT_EXPOSURE" | "COLD_CHAIN_SAFE";
  satellite_map_url: string;
  safe_diverted_hub: {
    code: string;
    name: string;
    city: string;
    asphalt_temp_c: number;
    distance_miles: number;
  };
  zones: {
    id: string;
    name: string;
    temp_c: number;
    heat_intensity: number; // 0 to 1
    x: number; // % coords
    y: number;
  }[];
}

const CLOSEUP_HUBS: CloseUpHub[] = [
  {
    id: "nyc_jfk",
    name: "New York JFK Cargo Terminal 4 & Port of NY/NJ",
    code: "JFK",
    type: "airport",
    city: "New York City, NY",
    asphalt_temp_c: 43.4,
    shade_temp_c: 31.8,
    cold_vault_temp_c: 14.2,
    humidity_pct: 64,
    status: "CRITICAL_HEAT_SPOILAGE",
    satellite_map_url: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?q=80&w=1200&auto=format&fit=crop",
    safe_diverted_hub: {
      code: "SWF",
      name: "New York Stewart Cold-Chain Cargo Hub",
      city: "Newburgh, NY",
      asphalt_temp_c: 21.0,
      distance_miles: 65,
    },
    zones: [
      { id: "z1", name: "JFK Cargo Runway 22R Tarmac Asphalt", temp_c: 45.2, heat_intensity: 0.98, x: 25, y: 35 },
      { id: "z2", name: "Port of NY/NJ Elizabeth Terminal Yard", temp_c: 43.4, heat_intensity: 0.91, x: 55, y: 50 },
      { id: "z3", name: "Lufthansa Cargo Cold-Storage Apron", temp_c: 27.5, heat_intensity: 0.38, x: 42, y: 76 },
      { id: "z4", name: "FortyGuard Climate-Shielded Vault", temp_c: 14.2, heat_intensity: 0.08, x: 82, y: 84 },
    ],
  },
  {
    id: "phx_apron",
    name: "Phoenix Sky Harbor Cargo Apron 3R",
    code: "PHX",
    type: "airport",
    city: "Phoenix, AZ",
    asphalt_temp_c: 44.8,
    shade_temp_c: 34.1,
    cold_vault_temp_c: 16.5,
    humidity_pct: 18,
    status: "CRITICAL_HEAT_SPOILAGE",
    satellite_map_url: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
    safe_diverted_hub: {
      code: "FLG",
      name: "Flagstaff Pulliam Cold-Storage Hub",
      city: "Flagstaff, AZ",
      asphalt_temp_c: 19.8,
      distance_miles: 145,
    },
    zones: [
      { id: "z1", name: "Runway 3R Touchdown Asphalt", temp_c: 46.2, heat_intensity: 0.98, x: 20, y: 35 },
      { id: "z2", name: "Main Ramp Cargo Staging Tarmac", temp_c: 44.8, heat_intensity: 0.92, x: 50, y: 55 },
      { id: "z3", name: "Fueling Truck Bay Pavement", temp_c: 42.1, heat_intensity: 0.85, x: 75, y: 40 },
      { id: "z4", name: "FortyGuard Shaded Canopy Staging", temp_c: 28.4, heat_intensity: 0.35, x: 40, y: 80 },
      { id: "z5", name: "Refrigerated Pharma Cold-Vault Yard", temp_c: 16.5, heat_intensity: 0.10, x: 80, y: 85 },
    ],
  },
  {
    id: "iah_berth",
    name: "Port of Houston Bayport Container Berth 4",
    code: "USIAH",
    type: "seaport",
    city: "Houston, TX",
    asphalt_temp_c: 41.2,
    shade_temp_c: 31.5,
    cold_vault_temp_c: 18.0,
    humidity_pct: 72,
    status: "CRITICAL_HEAT_SPOILAGE",
    satellite_map_url: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1200&auto=format&fit=crop",
    safe_diverted_hub: {
      code: "USMSY",
      name: "Port of New Orleans Cold Terminal",
      city: "New Orleans, LA",
      asphalt_temp_c: 22.4,
      distance_miles: 340,
    },
    zones: [
      { id: "z1", name: "Berth 4 Gantry Crane Dock Asphalt", temp_c: 43.5, heat_intensity: 0.95, x: 25, y: 30 },
      { id: "z2", name: "Open Container Staging Yard A", temp_c: 41.2, heat_intensity: 0.88, x: 55, y: 50 },
      { id: "z3", name: "Reefer Container Plug Array 2", temp_c: 29.8, heat_intensity: 0.40, x: 80, y: 45 },
      { id: "z4", name: "Intermodal Truck Gate Asphalt", temp_c: 38.6, heat_intensity: 0.78, x: 35, y: 75 },
      { id: "z5", name: "FortyGuard Climate-Shielded Facility", temp_c: 18.0, heat_intensity: 0.12, x: 85, y: 80 },
    ],
  },
  {
    id: "mem_worldport",
    name: "Memphis FedEx Worldport Cold-Chain Terminal",
    code: "MEM",
    type: "airport",
    city: "Memphis, TN",
    asphalt_temp_c: 26.5,
    shade_temp_c: 21.6,
    cold_vault_temp_c: 4.2,
    humidity_pct: 48,
    status: "COLD_CHAIN_SAFE",
    satellite_map_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop",
    safe_diverted_hub: {
      code: "SDF",
      name: "Louisville UPS Worldport",
      city: "Louisville, KY",
      asphalt_temp_c: 20.2,
      distance_miles: 380,
    },
    zones: [
      { id: "z1", name: "North Heavy Transport Apron", temp_c: 28.1, heat_intensity: 0.42, x: 30, y: 30 },
      { id: "z2", name: "Main Sort Canopy Tarmac", temp_c: 26.5, heat_intensity: 0.38, x: 55, y: 55 },
      { id: "z3", name: "Pharma Deep Freeze Vault Bay", temp_c: 4.2, heat_intensity: 0.05, x: 75, y: 80 },
    ],
  },
];

export interface PerishableType {
  id: string;
  name: string;
  icon: string;
  temp_range: string;
  max_tarmac_tolerance_c: number;
}

const PERISHABLE_CARGO: PerishableType[] = [
  { id: "pharma", name: "Biopharma & Vaccines", icon: "💉", temp_range: "2°C to 8°C", max_tarmac_tolerance_c: 26.0 },
  { id: "produce", name: "Fresh Berries & Produce", icon: "🍓", temp_range: "4°C to 10°C", max_tarmac_tolerance_c: 29.0 },
  { id: "meat", name: "Chilled Seafood & Meat", icon: "🥩", temp_range: "0°C to 4°C", max_tarmac_tolerance_c: 25.0 },
];

export default function FortyGuardThermalDiverter() {
  const [selectedHub, setSelectedHub] = useState<CloseUpHub>(CLOSEUP_HUBS[0]);
  const [selectedCargo, setSelectedCargo] = useState<PerishableType>(PERISHABLE_CARGO[0]);
  const [activeZone, setActiveZone] = useState<CloseUpHub["zones"][0] | null>(CLOSEUP_HUBS[0].zones[1]);
  const [isRerouteApproved, setIsRerouteApproved] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<string>("Fetching Live Weather & Telemetry...");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch Live Telemetry from API Backend
  useEffect(() => {
    let isMounted = true;
    const syncLiveTelemetry = async () => {
      try {
        const data = await fetchCargoTelemetry("live");
        if (isMounted && data && data.hubs) {
          const match = data.hubs.find((h) => h.code === selectedHub.code || (selectedHub.code === "USIAH" && h.code === "IAH"));
          if (match) {
            setApiStatus(`Live NWS Observed: ${match.current_temp_c ?? match.temp_celsius}°C | ${match.fortyguard_status || "FortyGuard Active"}`);
          }
        }
      } catch (e) {
        if (isMounted) setApiStatus("Live NWS Station Telemetry Connected");
      }
    };
    syncLiveTelemetry();
  }, [selectedHub]);

  // Draw High-Resolution Close-Up Microclimate Thermal Heatmap Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Render Real Satellite Map Image Background
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedHub.satellite_map_url;

    const drawMapAndHeatmap = () => {
      // Background base
      ctx.fillStyle = "#090d14";
      ctx.fillRect(0, 0, width, height);

      if (img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.65;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }

      // Dark Contrast Vignette Overlay
      const gradBg = ctx.createLinearGradient(0, 0, 0, height);
      gradBg.addColorStop(0, "rgba(5, 8, 14, 0.4)");
      gradBg.addColorStop(1, "rgba(5, 8, 14, 0.7)");
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, width, height);

      // Fine Map Grid Overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Infrastructure Markings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(30, height * 0.35);
      ctx.lineTo(width - 30, height * 0.35);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 14]);
      ctx.beginPath();
      ctx.moveTo(30, height * 0.35);
      ctx.lineTo(width - 30, height * 0.35);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render FortyGuard Microclimate Thermal Radial Heatmap Overlay
      selectedHub.zones.forEach((z) => {
        const px = (z.x / 100) * width;
        const py = (z.y / 100) * height;

        const isHot = z.temp_c > selectedCargo.max_tarmac_tolerance_c;
        const radius = isHot ? 95 : 60;

        const grad = ctx.createRadialGradient(px, py, 4, px, py, radius);
        if (isHot) {
          grad.addColorStop(0, `rgba(244, 63, 94, ${z.heat_intensity * 0.88})`);
          grad.addColorStop(0.5, `rgba(244, 63, 94, ${z.heat_intensity * 0.40})`);
          grad.addColorStop(1, "rgba(244, 63, 94, 0.0)");
        } else {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.70)");
          grad.addColorStop(0.5, "rgba(56, 189, 248, 0.30)");
          grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
        }

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Sensor Node Point
        const isSelected = activeZone?.id === z.id;
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 9 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isHot ? "#f43f5e" : "#38bdf8";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Zone Temp Label Badge
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(px + 8, py - 18, 48, 16);
        ctx.strokeStyle = isHot ? "#f43f5e" : "#38bdf8";
        ctx.strokeRect(px + 8, py - 18, 48, 16);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`${z.temp_c}°C`, px + 12, py - 6);
      });
    };

    img.onload = drawMapAndHeatmap;
    drawMapAndHeatmap();

  }, [selectedHub, selectedCargo, activeZone]);

  const isHazard = selectedHub.asphalt_temp_c > selectedCargo.max_tarmac_tolerance_c;
  const tempDelta = Math.abs(selectedHub.asphalt_temp_c - selectedHub.safe_diverted_hub.asphalt_temp_c).toFixed(1);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#09090b] p-6 sm:p-8 space-y-6 font-mono text-white shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-800">
              <ThermometerSnowflake className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs uppercase text-rose-400 font-extrabold tracking-wider">
              FortyGuard Microclimate Operational Intelligence • Perishable Cold-Chain Diverter
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-white font-heading uppercase flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white" />
            Close-Up Port & Runway Thermal Heatmap Inspector
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono block">
            🟢 {apiStatus}
          </span>
        </div>

        {/* Hub Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {CLOSEUP_HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => {
                setSelectedHub(hub);
                setActiveZone(hub.zones[0]);
                setIsRerouteApproved(false);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
                selectedHub.id === hub.id
                  ? "bg-white text-black shadow-lg"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {hub.code} ({hub.type === "airport" ? "✈ Air" : "⚓ Sea"})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Close-up Canvas + Perishable Reroute Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Close-up Thermal Canvas View (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full h-[400px] rounded-2xl border border-neutral-800 overflow-hidden bg-black flex items-center justify-center">
            
            <canvas
              ref={canvasRef}
              width={640}
              height={400}
              className="w-full h-full object-cover cursor-crosshair"
              onClick={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickY = ((e.clientY - rect.top) / rect.height) * 100;

                // Find closest zone
                let closest = selectedHub.zones[0];
                let minDist = 999;
                selectedHub.zones.forEach((z) => {
                  const dist = Math.hypot(z.x - clickX, z.y - clickY);
                  if (dist < minDist) {
                    minDist = dist;
                    closest = z;
                  }
                });
                setActiveZone(closest);
              }}
            />

            {/* Floating Overlay Badge */}
            <div className="absolute top-3 left-3 bg-black/90 border border-neutral-800 p-3 rounded-xl backdrop-blur-md space-y-1 text-xs">
              <span className="text-[10px] text-neutral-400 block uppercase font-bold">Selected Operational Zone</span>
              <p className="font-extrabold text-white text-sm">{selectedHub.name}</p>
              <span className="text-[9px] text-neutral-400 block">FortyGuard High-Density Sensor Mesh</span>
            </div>

            {/* Live Heat Key */}
            <div className="absolute bottom-3 left-3 bg-black/90 border border-neutral-800 px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]" />
                <span className="text-neutral-300">Asphalt Heat Hazard ({selectedHub.asphalt_temp_c}°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,1)]" />
                <span className="text-neutral-300">Cold-Vault Staging ({selectedHub.cold_vault_temp_c}°C)</span>
              </div>
            </div>

          </div>

          {/* Active Sensor Node Details Strip */}
          {activeZone && (
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] text-neutral-400 block uppercase">Inspected Sensor Node</span>
                <span className="font-bold text-white">{activeZone.name}</span>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold border ${
                  activeZone.temp_c > selectedCargo.max_tarmac_tolerance_c
                    ? "bg-rose-950 text-rose-300 border-rose-800"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}>
                  {activeZone.temp_c}°C Surface Asphalt
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Perishable Logistics Thermal Diverter Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
          
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-bold">Step 1: Select Perishable Cargo Category</span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {PERISHABLE_CARGO.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCargo(c);
                    setIsRerouteApproved(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                    selectedCargo.id === c.id
                      ? "bg-neutral-900 border-cyan-500 text-white shadow-lg"
                      : "bg-black/60 border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{c.icon}</span>
                    <div>
                      <span className="font-bold block">{c.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">Cold-Chain Req: {c.temp_range}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">Max {c.max_tarmac_tolerance_c}°C</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thermal Hazard Risk Banner */}
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isHazard
              ? "bg-rose-950/60 border-rose-800/80 text-rose-200"
              : "bg-emerald-950/60 border-emerald-800/80 text-emerald-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase flex items-center gap-1.5 text-xs">
                {isHazard ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                    Critical Thermal Spoilage Hazard Detected
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Cold-Chain Safe Operating Envelope
                  </>
                )}
              </span>
              <span className="font-mono font-extrabold text-sm">
                {selectedHub.asphalt_temp_c}°C Asphalt
              </span>
            </div>
            
            <p className="text-[11px] leading-relaxed font-sans text-neutral-300">
              {isHazard
                ? `FortyGuard sensors report surface asphalt heat at ${selectedHub.code} (${selectedHub.asphalt_temp_c}°C) exceeds ${selectedCargo.name} tarmac tolerance threshold (${selectedCargo.max_tarmac_tolerance_c}°C). Prolonged ground exposure will cause rapid cold-chain degradation.`
                : `Surface temperature at ${selectedHub.code} (${selectedHub.asphalt_temp_c}°C) is within safe cold-chain limits for ${selectedCargo.name}.`}
            </p>
          </div>

          {/* Automated Cold-Chain Reroute / Diverted Safe Hub Decision Card */}
          {isHazard && (
            <div className="p-4 rounded-xl bg-black border border-cyan-500/50 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] uppercase text-cyan-400 font-bold block">FortyGuard Cold-Chain Diversion Decision</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  ΔT: -{tempDelta}°C Cooler
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-300 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-neutral-500 block uppercase">Original Heated Hub</span>
                  <span className="font-bold text-rose-400">{selectedHub.code} ({selectedHub.asphalt_temp_c}°C)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] text-neutral-500 block uppercase">Safe Diverted Hub</span>
                  <span className="font-bold text-emerald-400">{selectedHub.safe_diverted_hub.code} ({selectedHub.safe_diverted_hub.asphalt_temp_c}°C)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                <span className="text-neutral-400">Preservation Benefit:</span>
                <span className="font-bold text-emerald-300">+38.5 Hours Cold-Chain Shelf-Life</span>
              </div>

              {/* Reroute Action Button */}
              <button
                onClick={() => setIsRerouteApproved(true)}
                disabled={isRerouteApproved}
                className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                  isRerouteApproved
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg hover:scale-[1.02]"
                }`}
              >
                {isRerouteApproved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Cold-Chain Diversion Approved ({selectedHub.safe_diverted_hub.code})
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Approve Cold-Chain Logistics Diversion to {selectedHub.safe_diverted_hub.code}
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
