"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { LiveVehicle, CargoHubCondition } from "@/lib/api";

interface OsirisCargoMapProps {
  vehicles: LiveVehicle[];
  hubs: CargoHubCondition[];
  selectedVehicle: LiveVehicle | null;
  onSelectVehicle: (v: LiveVehicle | null) => void;
  showSatScope?: boolean;
}

// Calculate Day/Night Solar Terminator Shadow Polygon
function computeSolarTerminator(): [number, number][] {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const decRad = (declination * Math.PI) / 180;
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const subsolarLng = (12 - utcHours) * 15;
  const points: [number, number][] = [];
  for (let lng = -180; lng <= 180; lng += 3) {
    const lngRad = ((lng - subsolarLng) * Math.PI) / 180;
    const lat = (Math.atan(-Math.cos(lngRad) / Math.tan(decRad)) * 180) / Math.PI;
    points.push([lng, lat]);
  }
  const darkSide = declination >= 0 ? -90 : 90;
  points.push([180, darkSide]);
  points.push([-180, darkSide]);
  points.push(points[0]);
  return points;
}

// Submarine & Maritime Vector Cable Lanes
const MARITIME_SHIPPING_LANES = [
  // Trans-Pacific Shipping Corridor
  [[-125, 33.7], [-135, 30.0], [-150, 25.0], [-170, 20.0]],
  [[-122.4, 37.8], [-132, 35.0], [-145, 30.0], [-165, 22.0]],
  [[-118.2, 33.7], [-125, 28.0], [-140, 22.0], [-155, 19.5]],
  // Gulf Coast Energy Lines
  [[-95.3, 29.7], [-90.0, 27.5], [-85.0, 25.0], [-80.0, 24.5]],
  [[-89.9, 29.0], [-88.0, 26.0], [-84.0, 23.5]],
  // Atlantic Shipping Lanes
  [[-74.0, 40.7], [-65.0, 38.0], [-50.0, 35.0]],
  [[-80.1, 25.8], [-75.0, 28.0], [-65.0, 32.0]],
];

export default function OsirisCargoMap({
  vehicles,
  hubs,
  selectedVehicle,
  onSelectVehicle,
  showSatScope = true,
}: OsirisCargoMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<LiveVehicle | null>(null);
  const [viewport, setViewport] = useState({
    centerLng: -96.0,
    centerLat: 38.5,
    zoom: 3.8,
  });

  // Convert GPS (Lng, Lat) to Canvas (x, y) coordinates
  const project = useCallback(
    (lng: number, lat: number, width: number, height: number) => {
      const scale = Math.pow(2, viewport.zoom) * 22;
      const x = width / 2 + (lng - viewport.centerLng) * (scale / 360) * (width / 400);
      const y = height / 2 - (lat - viewport.centerLat) * (scale / 180) * (height / 300);
      return { x, y };
    },
    [viewport]
  );

  // Render Canvas Map with Osiris Vector Icons & Day/Night Terminator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear & Background
    ctx.fillStyle = "#06070a";
    ctx.fillRect(0, 0, width, height);

    // 2. Draw US Landmass Contour Outline Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let lng = -130; lng <= -60; lng += 10) {
      const p1 = project(lng, 20, width, height);
      const p2 = project(lng, 52, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let lat = 20; lat <= 50; lat += 5) {
      const p1 = project(-135, lat, width, height);
      const p2 = project(-60, lat, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 3. Draw Maritime Vector Lines (Blue/Cyan Cables)
    MARITIME_SHIPPING_LANES.forEach((lane) => {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      lane.forEach((pt, idx) => {
        const p = project(pt[0], pt[1], width, height);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 4. Draw Solar Day/Night Terminator Curve (Shadow Mask)
    const terminatorPoints = computeSolarTerminator();
    ctx.beginPath();
    ctx.fillStyle = "rgba(10, 15, 35, 0.45)";
    terminatorPoints.forEach(([lng, lat], idx) => {
      const p = project(lng, lat, width, height);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();

    // 5. Draw FortyGuard Cargo Hub Thermal Microclimate Heatmap Circles
    hubs.forEach((hub) => {
      const p = project(hub.lng, hub.lat, width, height);
      
      // Outer Thermal Microclimate Radial Heatmap Gradient
      const heatRadius = hub.has_heat_spike ? 38 : 22;
      const gradient = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, heatRadius);
      if (hub.has_heat_spike) {
        gradient.addColorStop(0, "rgba(244, 63, 94, 0.7)");
        gradient.addColorStop(0.4, "rgba(244, 63, 94, 0.3)");
        gradient.addColorStop(1, "rgba(244, 63, 94, 0.0)");
      } else {
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.5)");
        gradient.addColorStop(0.4, "rgba(56, 189, 248, 0.2)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, heatRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner Airport Node Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = hub.has_heat_spike ? "#f43f5e" : "#38bdf8";
      ctx.fill();

      // Hub Code & Temperature Label
      ctx.fillStyle = hub.has_heat_spike ? "#fda4af" : "#93c5fd";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`${hub.code} (${hub.temp_celsius}°C)`, p.x + 8, p.y + 3);
    });

    // 6. Draw Rotated Vector Aircraft Icons with Heading Angle (θ)
    vehicles.forEach((v) => {
      const p = project(v.lng, v.lat, width, height);
      const isSelected = selectedVehicle?.callsign === v.callsign;
      const isHovered = hoveredVehicle?.callsign === v.callsign;
      const heading = (v.heading || 0) * (Math.PI / 180);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(heading);

      // Icon Color matching Osiris Palette
      const color = v.payload_status === "CRITICAL_HEAT_HAZARD" ? "#f43f5e" :
                    v.payload_status === "ELEVATED_PAYLOAD_RESTRICTION" ? "#fbbf24" : "#00e5ff";
      
      const size = isSelected || isHovered ? 18 : 14;

      // Draw OSIRIS Rotated Aircraft Vector Shape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(-size * 0.15, size * 0.1);
      ctx.lineTo(-size * 0.45, size * 0.25);
      ctx.lineTo(-size * 0.45, size * 0.35);
      ctx.lineTo(-size * 0.15, size * 0.2);
      ctx.lineTo(0, size * 0.4);
      ctx.lineTo(size * 0.15, size * 0.2);
      ctx.lineTo(size * 0.45, size * 0.35);
      ctx.lineTo(size * 0.45, size * 0.25);
      ctx.lineTo(size * 0.15, size * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Transponder Callsign Tag
      if (isSelected || isHovered) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`✈ ${v.callsign}`, p.x + 10, p.y - 10);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px monospace";
        ctx.fillText(`${v.speed_kts} kts • ${Math.round(v.altitude_m * 3.28084)} ft`, p.x + 10, p.y + 2);
      }
    });

  }, [vehicles, hubs, viewport, selectedVehicle, hoveredVehicle, project]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[520px] bg-[#06070a] rounded-2xl overflow-hidden border border-neutral-800">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={(e) => {
          if (!canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;

          const match = vehicles.find((v) => {
            const p = project(v.lng, v.lat, width, height);
            const dist = Math.hypot(p.x - mx, p.y - my);
            return dist < 16;
          });
          setHoveredVehicle(match || null);
        }}
        onClick={() => {
          if (hoveredVehicle) onSelectVehicle(hoveredVehicle);
        }}
      />
    </div>
  );
}
