import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/20 bg-black pt-16 pb-4 overflow-hidden font-mono z-30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 justify-between">
          
          {/* Left: Brand Badge & Copyright */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-white/10 group-hover:scale-105 transition-transform flex items-center justify-center bg-black border border-white/20">
                <img src="/Tempy.png" alt="Tempy Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-black tracking-tight text-white uppercase font-mono">
                Tempy
              </span>
            </Link>
            <p className="text-xs text-neutral-500 font-mono">
              © copyright Tempy 2026. All rights reserved.
            </p>
          </div>

          {/* Right: Pages & Socials Columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-8 text-xs font-mono">
            
            {/* Pages Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Pages</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/cargo" className="hover:text-white transition-colors">Cargo & Supply Chain</Link></li>
                <li><Link href="/grid" className="hover:text-white transition-colors">Energy Grid</Link></li>
                <li><Link href="/stocks" className="hover:text-white transition-colors">Stocks Analytics</Link></li>
                <li><Link href="/scout" className="hover:text-white transition-colors">Scout</Link></li>
                <li><Link href="/backtest" className="hover:text-white transition-colors">Backtest</Link></li>
              </ul>
            </div>

            {/* Socials Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Socials</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="https://github.com/Soham-Gurav" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Large TEMPY Watermark Text with Smooth Vertical Bottom Fade */}
      <div className="w-full text-center mt-10 overflow-hidden pointer-events-none select-none relative z-0">
        <span className="text-[14vw] font-black uppercase font-heading bg-gradient-to-b from-neutral-600 via-neutral-800/50 to-transparent bg-clip-text text-transparent tracking-tighter block leading-none opacity-90">
          TEMPY
        </span>
      </div>
    </footer>
  );
}
