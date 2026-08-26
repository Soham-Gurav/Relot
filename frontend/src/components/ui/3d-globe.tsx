"use client";

import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// Suppress THREE.Clock deprecation warning in browser console
if (typeof window !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) {
      return;
    }
    origWarn.apply(console, args);
  };
}

// ============================================================================
// Types & Interfaces matching AutoAI 3D Globe
// ============================================================================

export interface GlobeMarker {
  lat: number;
  lng: number;
  label?: string;
  ticker?: string;
  nodeId?: string;
  size?: number;
  hasHeatSpike?: boolean;
  isFlightMarker?: boolean;
  details?: string;
}

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: string;
  label?: string;
}

export interface Globe3DConfig {
  radius?: number;
  globeColor?: string;
  textureUrl?: string;
  bumpMapUrl?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereIntensity?: number;
  atmosphereBlur?: number;
  bumpScale?: number;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  markerSize?: number;
  ambientIntensity?: number;
  pointLightIntensity?: number;
  backgroundColor?: string | null;
}

interface Globe3DProps {
  markers?: GlobeMarker[];
  arcs?: GlobeArc[];
  config?: Globe3DConfig;
  className?: string;
  selectedNodeId?: string;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

// ============================================================================
// Earth Texture URLs from AutoAI
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

// Helper: Convert Lat/Lng to Vector3
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// Marker Pin Component
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker;
  radius: number;
  isSelected?: boolean;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}

function Marker({ marker, radius, isSelected, onClick, onHover }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  const imageGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const surfacePosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.001);
  }, [marker.lat, marker.lng, radius]);

  const topPosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.12);
  }, [marker.lat, marker.lng, radius]);

  const lineHeight = topPosition.distanceTo(surfacePosition);

  useFrame(() => {
    if (!imageGroupRef.current) return;
    const worldPos = new THREE.Vector3();
    imageGroupRef.current.getWorldPosition(worldPos);
    const markerDirection = worldPos.clone().normalize();
    const cameraDirection = camera.position.clone().normalize();
    const dot = markerDirection.dot(cameraDirection);
    setIsVisible(dot > 0.05);
  });

  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5);
    const direction = topPosition.clone().sub(surfacePosition).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return { lineCenter: center, lineQuaternion: quaternion };
  }, [surfacePosition, topPosition]);

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Fine Cyan/Rose pin line */}
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
        <meshBasicMaterial
          color={isSelected || hovered ? "#f43f5e" : "#38bdf8"}
          transparent
          opacity={isSelected || hovered ? 0.95 : 0.7}
        />
      </mesh>

      {/* Surface pin cone head */}
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.035, 8]} />
        <meshBasicMaterial color={isSelected || hovered ? "#f43f5e" : "#0284c7"} />
      </mesh>

      {/* HTML Location Badge */}
      <group ref={imageGroupRef} position={topPosition}>
        <Html
          sprite
          center
          style={{
            pointerEvents: isVisible ? "auto" : "none",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.15s ease-out",
          }}
        >
          <div
            className={cn(
              "cursor-pointer px-2.5 py-1 rounded-full font-mono text-[11px] font-bold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap border",
              hovered
                ? "bg-rose-950/95 border-rose-500 text-rose-200 ring-2 ring-rose-500/50 scale-110 z-50 px-3 py-1.5"
                : marker.hasHeatSpike || isSelected
                ? "bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/40"
                : "bg-black/90 border-neutral-700 text-white"
            )}
            onMouseEnter={() => {
              setHovered(true);
              onHover?.(marker);
            }}
            onMouseLeave={() => {
              setHovered(false);
              onHover?.(null);
            }}
            onClick={() => onClick?.(marker)}
          >
            <span className={cn("w-2 h-2 rounded-full", marker.hasHeatSpike || isSelected || hovered ? "bg-rose-500 animate-ping" : "bg-cyan-400")} />
            
            {/* Show ONLY Plane Icon + Callsign by default, expand on hover */}
            <span>
              {marker.isFlightMarker
                ? hovered
                  ? marker.label
                  : `✈ ${marker.ticker || "FLIGHT"}`
                : marker.label}
            </span>

            {marker.ticker && !marker.isFlightMarker && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", marker.hasHeatSpike ? "bg-rose-900 text-rose-200 border-rose-700" : "bg-slate-900 text-cyan-300 border-slate-700")}>
                {marker.ticker}
              </span>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}

// 3D Route Arc Component (Dotted & Elevated Above Globe)
function GlobeRouteArc({ arc, radius }: { arc: GlobeArc; radius: number }) {
  const lineMesh = useMemo(() => {
    const p1 = latLngToVector3(arc.startLat, arc.startLng, radius * 1.02);
    const p2 = latLngToVector3(arc.endLat, arc.endLng, radius * 1.02);

    const distance = p1.distanceTo(p2);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    // Elevate midpoint arc high above globe surface so it floats above without passing through
    const arcApex = radius + Math.max(0.65, distance * 0.45);
    mid.normalize().multiplyScalar(arcApex);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(100);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: arc.color || "#38bdf8",
      linewidth: 3,
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.95,
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }, [arc.startLat, arc.startLng, arc.endLat, arc.endLng, arc.color, radius]);

  return <primitive object={lineMesh} />;
}

// Rotating Globe Component
function RotatingGlobe({ config, markers, arcs = [], selectedNodeId, onMarkerClick, onMarkerHover }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [earthTexture, bumpTexture] = useTexture([config.textureUrl, config.bumpMapUrl]);

  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8;
    }
  }, [earthTexture, bumpTexture]);

  const geometry = useMemo(() => new THREE.SphereGeometry(config.radius, 64, 64), [config.radius]);

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={config.bumpScale * 0.04}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Render 3D Route Arcs */}
      {arcs.map((arc: GlobeArc, idx: number) => (
        <GlobeRouteArc key={`arc-${idx}`} arc={arc} radius={config.radius} />
      ))}

      {/* Render Markers */}
      {markers.map((marker: GlobeMarker, index: number) => (
        <Marker
          key={`marker-${index}`}
          marker={marker}
          radius={config.radius}
          isSelected={selectedNodeId === marker.nodeId}
          onClick={onMarkerClick}
          onHover={onMarkerHover}
        />
      ))}
    </group>
  );
}

// Scene Component
function Scene({ markers, arcs = [], config, selectedNodeId, onMarkerClick, onMarkerHover }: any) {
  const { camera } = useThree();

  React.useEffect(() => {
    // Fixed camera position focusing directly on North America / USA
    camera.position.set(-1.4, 1.3, config.radius * 2.5);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[config.radius * 5, config.radius * 2, config.radius * 5]}
        intensity={config.pointLightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-config.radius * 3, config.radius, -config.radius * 2]}
        intensity={config.pointLightIntensity * 0.4}
        color="#38bdf8"
      />

      <RotatingGlobe
        config={config}
        markers={markers}
        arcs={arcs}
        selectedNodeId={selectedNodeId}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={true}
        minDistance={2.2}
        maxDistance={12}
        rotateSpeed={0.3}
        autoRotate={false}
        autoRotateSpeed={0}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-[10px] font-mono text-neutral-400">Loading Photorealistic Earth...</span>
      </div>
    </Html>
  );
}

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  globeColor: "#091c38",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: false,
  atmosphereColor: "#38bdf8",
  atmosphereIntensity: 0.5,
  atmosphereBlur: 3,
  bumpScale: 2,
  autoRotateSpeed: 0.12,
  enableZoom: true,
  enablePan: false,
  minDistance: 3,
  maxDistance: 15,
  markerSize: 0.06,
  ambientIntensity: 0.85,
  pointLightIntensity: 1.8,
  backgroundColor: null,
};

export function Globe3D({ markers = [], arcs = [], config = {}, className, selectedNodeId, onMarkerClick, onMarkerHover }: Globe3DProps) {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  return (
    <div className={cn("relative h-[480px] sm:h-[580px] w-full", className)}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, mergedConfig.radius * 2.75] }}
        style={{ background: mergedConfig.backgroundColor || "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            arcs={arcs}
            config={mergedConfig}
            selectedNodeId={selectedNodeId}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
