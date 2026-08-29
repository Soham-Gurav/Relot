"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, MapPin, Activity, Flame, Store, BarChart3, AlertCircle } from "lucide-react";

// Dynamically import Leaflet map to avoid SSR issues
const ScoutMap = dynamic(() => import("@/components/ScoutMap"), { ssr: false });

export default function ScoutPage() {
  const [locationName, setLocationName] = useState("New York");
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("restaurant");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/scout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: locationName,
          date: targetDate,
          category: category
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 z-10 relative">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
            <MapPin className="w-3.5 h-3.5 text-white" />
            Location Intelligence Scout
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white font-heading uppercase leading-none">
            Geospatial Scout
          </h1>
          <p className="text-sm text-neutral-400 font-mono leading-relaxed">
            Determine the optimal location for your business. We aggregate FortyGuard microclimate heat vectors, OpenStreetMap competitor density (Rivals), and synthetic footfall estimation to generate a definitive suitability score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Control Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-5 bg-neutral-950/80 shadow-2xl">
              <h3 className="font-bold text-white text-sm font-heading uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Search className="w-4 h-4" /> Targeting Parameters
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono text-neutral-500 font-bold uppercase">City or Neighborhood</label>
                    <input 
                      type="text" 
                      value={locationName} 
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono text-neutral-500 font-bold uppercase">Target Date</label>
                    <input 
                      type="date" 
                      value={targetDate} 
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-500 font-bold uppercase">Business Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-white outline-none cursor-pointer uppercase tracking-wide appearance-none"
                  >
                    <option value="clothing">Clothing / Apparel</option>
                    <option value="ice_cream">Ice Cream / Gelato</option>
                    <option value="restaurant">Restaurant / Dining</option>
                    <option value="other">Other Commercial</option>
                  </select>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full py-3 mt-2 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-pulse flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Analyzing Node...
                    </span>
                  ) : (
                    "Deploy Scout"
                  )}
                </button>
              </div>
            </div>

            {/* Results HUD */}
            {result && (
              <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-6 bg-neutral-950/80 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex items-end justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h4 className="text-[10px] font-mono text-neutral-500 font-bold uppercase">Suitability Score</h4>
                    <span className="text-4xl font-black text-white">{result.suitability_score}<span className="text-xl text-neutral-600">/100</span></span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase ${result.suitability_score > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : result.suitability_score > 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {result.suitability_score > 70 ? 'Optimal' : result.suitability_score > 40 ? 'Marginal' : 'High Risk'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <Flame className="w-4 h-4 text-rose-500" /> Thermal Penalty
                    </div>
                    <span className="font-bold text-white text-sm">{result.climate.attractiveness_penalty > 0 ? '+' : ''}{result.climate.attractiveness_penalty} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <BarChart3 className="w-4 h-4 text-emerald-500" /> Footfall Index
                    </div>
                    <span className="font-bold text-white text-sm">{result.demographics.footfall_index}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <Store className="w-4 h-4 text-cyan-500" /> Known Rivals
                    </div>
                    <span className="font-bold text-white text-sm">{result.demographics.rival_count} nodes</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                      <strong>FortyGuard Status:</strong> {result.climate.status}. <br/>
                      <strong>Economic Zone:</strong> {result.demographics.zone_type}.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-8 min-h-[500px] lg:min-h-0 bg-neutral-900 rounded-2xl border border-neutral-800 relative">
            {result ? (
              <ScoutMap 
                center={[result.coordinates.lat, result.coordinates.lng]} 
                rivals={result.demographics.rivals}
                heatScore={result.climate.heat_score}
                actualTempC={result.climate.actual_temp_c}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 font-mono text-xs space-y-3">
                <MapPin className="w-8 h-8 opacity-50" />
                <span>Awaiting Coordinates...</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
