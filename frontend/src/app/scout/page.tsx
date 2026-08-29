"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Activity, Flame, Store, BarChart3, AlertCircle } from "lucide-react";

// Dynamically import Leaflet map to avoid SSR issues
const ScoutMap = dynamic(() => import("@/components/ScoutMap"), { ssr: false });

export default function ScoutPage() {
  const [locationName, setLocationName] = useState("");
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("restaurant");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const debounceTimerRef = useRef<any>(null);
  const skipNextSearchRef = useRef<boolean>(false);

  // Live Autocomplete Suggestions Engine
  useEffect(() => {
    const query = locationName.trim();
    if (!query || query.length < 2) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    let isCurrent = true;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const data = await res.json();
        if (isCurrent) {
          if (data && Array.isArray(data) && data.length > 0 && locationName.trim().length >= 2) {
            setSuggestions(data);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (e) {
        if (isCurrent) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [locationName]);

  const handleSelectSuggestion = (item: any) => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    skipNextSearchRef.current = true;
    
    const mainTitle = item.display_name.split(",")[0];
    setLocationName(mainTitle);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";
      const res = await fetch(`${API_BASE}/api/scout/analyze`, {
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
                  <div className="space-y-1.5 col-span-2 relative">
                    <label className="text-[10px] font-mono text-neutral-500 font-bold uppercase">City or Neighborhood</label>
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={locationName} 
                        onChange={(e) => setLocationName(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0 && locationName.trim().length >= 2) setShowSuggestions(true); }}
                        placeholder="e.g. Austin, TX"
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-white transition-colors"
                      />
                      {locationName && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationName("");
                            setSuggestions([]);
                            setShowSuggestions(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full bg-neutral-900"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-[60px] left-0 right-0 z-50 bg-[#09090b] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden font-mono divide-y divide-neutral-850">
                        <div className="px-3 py-1.5 bg-neutral-950 text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
                          <span>📍 Suggested Locations</span>
                        </div>
                        {suggestions.map((item, idx) => {
                          const mainName = item.display_name.split(",")[0];
                          const subAddress = item.display_name.split(",").slice(1, 4).join(",");
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSuggestion(item)}
                              className="w-full text-left px-4 py-2 hover:bg-neutral-900 transition-colors flex items-center gap-3 text-xs group"
                            >
                              <span className="text-sm shrink-0 group-hover:scale-125 transition-transform">📍</span>
                              <div className="truncate">
                                <span className="font-extrabold text-white block group-hover:text-cyan-400 transition-colors">{mainName}</span>
                                <span className="text-[10px] text-neutral-400 truncate block">{subAddress}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
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
      <Footer />
    </div>
  );
}
