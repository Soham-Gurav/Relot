"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Cargo & Supply Chain", link: "/cargo" },
    { name: "Energy Grid", link: "/grid" },
    { name: "Stocks Analytics", link: "/stocks" },
    { name: "Scout", link: "/scout" },
    { name: "Backtest", link: "/backtest" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
      <nav className="pointer-events-auto w-[96%] max-w-5xl h-14 rounded-full px-6 sm:px-8 flex items-center justify-between backdrop-blur-2xl bg-black/95 border border-white/10 text-white shadow-2xl transition-all">
        
        {/* Left: Minimal Black & White Brand Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-white/10 group-hover:scale-105 transition-transform flex items-center justify-center bg-black border border-white/20">
            <img src="/logo.png" alt="Tempy Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-black tracking-tight text-white uppercase font-mono">
            Tempy
          </span>
        </Link>

        {/* Center: Nav Items with Smooth Floating Hover Pill (Text Only) */}
        <div
          onMouseLeave={() => setHoveredIndex(null)}
          className="hidden md:flex items-center gap-1 relative"
        >
          {navItems.map((item, idx) => {
            const isActive = pathname === item.link;
            const isHovered = hoveredIndex === idx;

            return (
              <Link
                key={`nav-item-${idx}`}
                href={item.link}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={cn(
                  "relative text-xs font-mono transition-colors py-1.5 px-3.5 z-10 font-bold rounded-full flex items-center justify-center",
                  isActive ? "text-white bg-white/10 border border-white/20" : "text-neutral-400 hover:text-white"
                )}
              >
                {isHovered && !isActive && (
                  <motion.span
                    layoutId="navbar-hover-pill"
                    className="absolute inset-0 bg-neutral-900 rounded-full -z-10 border border-white/10"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side status */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider">
          v1.0
        </div>

      </nav>
    </header>
  );
}
