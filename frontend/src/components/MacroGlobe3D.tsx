"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EconomicNode } from "@/lib/api";
import { Thermometer, ShieldAlert, Sparkles, Navigation } from "lucide-react";

interface Props {
  nodes: EconomicNode[];
  selectedNode: EconomicNode | null;
  onSelectNode: (node: EconomicNode) => void;
}

// Procedural Earth Texture (0 CORS / 0 Network Dependencies)
function createPhotorealisticEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep Cyber Oceanic Blue
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, "#050e21");
  oceanGrad.addColorStop(0.3, "#071a3d");
  oceanGrad.addColorStop(0.5, "#0b2654");
  oceanGrad.addColorStop(0.7, "#071a3d");
  oceanGrad.addColorStop(1, "#050e21");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Helper to draw continent paths
  const drawContinent = (path: [number, number][], color: string) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    path.forEach(([x, y], i) => {
      const px = (x / 360) * 2048;
      const py = ((90 - y) / 180) * 1024;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  };

  const forestGreen = "#13381a";
  const landGreen = "#1e4726";
  const desertTan = "#595033";

  // North America
  drawContinent([
    [-160, 70], [-100, 75], [-60, 60], [-55, 45], [-80, 25], [-100, 20], [-120, 30], [-130, 50], [-160, 60]
  ], forestGreen);
  drawContinent([
    [-115, 42], [-95, 45], [-80, 30], [-100, 25], [-115, 32]
  ], desertTan);

  // South America
  drawContinent([
    [-80, 10], [-50, -5], [-35, -10], [-45, -30], [-70, -50], [-75, -40], [-80, -15]
  ], landGreen);

  // Europe & Asia
  drawContinent([
    [-10, 36], [10, 45], [30, 60], [120, 75], [170, 65], [140, 40], [100, 35], [-5, 50]
  ], forestGreen);

  // Africa
  drawContinent([
    [-15, 35], [35, 35], [50, 12], [40, -10], [30, -34], [15, -34], [-15, 12]
  ], desertTan);

  // Polar Caps
  ctx.fillStyle = "#d0f4ff";
  ctx.fillRect(0, 0, 2048, 65);
  ctx.fillRect(0, 959, 2048, 65);

  // Photorealistic Cloud Swirls
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * 2048;
    const cy = Math.random() * 800 + 100;
    const rx = Math.random() * 140 + 40;
    const ry = Math.random() * 25 + 10;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Convert Lat/Lng to 3D Sphere Vector
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function MacroGlobe3D({ nodes, selectedNode, onSelectNode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<EconomicNode | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // Focus camera initially over North America (US Node Cluster)
    camera.position.set(-1.8, 2.2, 4.2);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Photorealistic 3D Earth Mesh
    const earthRadius = 2.0;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTexture = createPhotorealisticEarthTexture();
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 30,
      specular: new THREE.Color(0x38bdf8),
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // 4. Atmosphere Cyan Halo Ring
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.06, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    cyanLight.position.set(-5, 2, -3);
    scene.add(cyanLight);

    // 6. Add 3D Pin Pins for 4 Economic Choke Point Nodes
    const pinsGroup = new THREE.Group();
    earthMesh.add(pinsGroup);

    nodes.forEach((node) => {
      const pos = latLngToVector3(node.lat, node.lng, earthRadius * 1.01);
      const isSelected = selectedNode?.id === node.id;

      // Pin Line
      const topPos = latLngToVector3(node.lat, node.lng, earthRadius * 1.12);
      const lineGeom = new THREE.BufferGeometry().setFromPoints([pos, topPos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0xf43f5e : 0x38bdf8,
        linewidth: 2,
      });
      const pinLine = new THREE.Line(lineGeom, lineMat);
      pinsGroup.add(pinLine);

      // Pin Head Mesh
      const headGeom = new THREE.SphereGeometry(0.04, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf43f5e : 0x38bdf8,
      });
      const headMesh = new THREE.Mesh(headGeom, headMat);
      headMesh.position.copy(topPos);
      pinsGroup.add(headMesh);
    });

    // 7. Smooth 60 FPS Rotation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.0015; // Slow continuous 3D Earth rotation
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nodes, selectedNode]);

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 uppercase font-mono tracking-wider">
              MacroHeat 360° Photorealistic Globe
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live FortyGuard Microclimate Radar & Infrastructure Choke Points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Navigation className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          Active Node: <strong className="text-white">{selectedNode?.name}</strong>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-[420px] relative flex items-center justify-center cursor-grab active:cursor-grabbing">
        
        {/* Floating HTML Callout Badges over the 4 Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute z-30 cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                node.id === "airport_phoenix"
                  ? "top-[25%] left-[25%]"
                  : node.id === "port_houston"
                  ? "top-[48%] left-[38%]"
                  : node.id === "iowa_agri"
                  ? "top-[22%] left-[45%]"
                  : "top-[45%] left-[30%]"
              }`}
            >
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 border transition-all ${
                  isSelected
                    ? "bg-rose-950/90 border-rose-500 text-white shadow-rose-500/30 scale-110 ring-2 ring-rose-500/50"
                    : "bg-slate-950/90 border-slate-700 text-slate-200 hover:border-cyan-400 hover:scale-105"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-rose-500 animate-ping" : "bg-cyan-400"}`} />
                <span>{node.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                  {node.primary_ticker}
                </span>
              </div>
            </div>
          );
        })}

        {/* Selected Node Telemetry HUD Overlay at bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-30 glass-panel-glow bg-slate-950/90 p-3 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-500" />
            <span>Target: <strong className="text-white">{selectedNode?.name}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <span>Primary Ticker: <strong className="text-cyan-400">{selectedNode?.primary_ticker}</strong></span>
            <span>Optimal Lag: <strong className="text-amber-400">+{selectedNode?.lag_days} Days</strong></span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Risk Index: 88/100
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
