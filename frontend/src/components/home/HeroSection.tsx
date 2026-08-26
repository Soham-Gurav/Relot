"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";
import { EconomicNode } from "@/lib/api";

interface Props {
  nodes: EconomicNode[];
  selectedNode: EconomicNode | null;
  onSelectNode: (node: EconomicNode) => void;
}

const FALLBACK_NODES: EconomicNode[] = [
  { id: "airport_phoenix", name: "Phoenix Sky Harbor Airport", category: "Aviation", lat: 33.4352, lng: -112.0101, primary_ticker: "FDX", related_tickers: ["FDX"], lag_days: 4, physics_metric: "Density Altitude", description: "", current_temp: 42.5, has_heat_spike: true },
  { id: "texas_grid", name: "ERCOT Texas Energy Grid", category: "Energy Grid", lat: 29.7604, lng: -95.3698, primary_ticker: "UNG", related_tickers: ["UNG"], lag_days: 0, physics_metric: "Thermal Load", description: "", current_temp: 41.2, has_heat_spike: true },
  { id: "port_houston", name: "Port of Houston & Gulf Coast", category: "Cargo", lat: 29.7268, lng: -95.2655, primary_ticker: "XLE", related_tickers: ["XLE"], lag_days: 5, physics_metric: "Container Thermal Expansion", description: "", current_temp: 39.2, has_heat_spike: false }
];

export const HeroSection: React.FC<Props> = ({ nodes, selectedNode, onSelectNode }) => {
  const displayNodes = nodes.length > 0 ? nodes : FALLBACK_NODES;
  const heatSpikeNodes = displayNodes.filter(
    (node) => node.has_heat_spike === true || node.id === "airport_phoenix" || node.id === "grid_ercot" || node.id === "texas_grid"
  );

  const globeMarkers: GlobeMarker[] = heatSpikeNodes.map((node) => ({
    lat: node.lat,
    lng: node.lng,
    label: `${node.name} (${node.current_temp || node.temp || 42.5}°C)`,
    ticker: node.primary_ticker,
    nodeId: node.id,
    hasHeatSpike: true,
  }));

  return (
    <section className="relative min-h-screen w-full pt-20 pb-0 overflow-hidden bg-black text-white flex flex-col justify-between items-center transition-colors duration-300">
      {/* Background Radial Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Grid Pattern Layer matching AutoAI */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 max-w-7xl mx-auto px-4 text-center mt-4 mb-2"
      >
        <h1 className="text-6xl sm:text-9xl lg:text-[8.5rem] font-black tracking-tighter uppercase font-heading leading-[0.82] select-none bg-gradient-to-b from-white via-neutral-300/40 to-transparent bg-clip-text text-transparent drop-shadow-2xl">
          TEMPY BRINGS <br />
          IN THE HEAT
        </h1>
      </motion.div>

      {/* Globe Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 w-full max-w-[900px] sm:max-w-[1050px] h-[480px] sm:h-[580px] mx-auto -mt-6 sm:-mt-10 -mb-36 sm:-mb-52 pointer-events-auto"
      >
        {/* Soft Red Thermal Glow Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-rose-500/20 rounded-full blur-[100px] pointer-events-none z-0" />

        <Globe3D
          className="w-full h-full relative z-10"
          markers={globeMarkers}
          selectedNodeId={selectedNode?.id}
          onMarkerClick={(marker) => {
            const found = nodes.find((n) => n.id === marker.nodeId);
            if (found) onSelectNode(found);
          }}
          config={{
            showAtmosphere: false,
            autoRotateSpeed: 0,
          }}
        />

        {/* Bottom Fade Mask */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-20" />
      </motion.div>
    </section>
  );
};
