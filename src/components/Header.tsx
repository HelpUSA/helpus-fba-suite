'use client';

import React from 'react';
import { Building2, Search, Bell, ShieldCheck, Zap, Globe } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Header({ activeView, setActiveView }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Branding & Organization */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer transition">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            HU
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>HelpUS LLC</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Amazon US (sellercentral.amazon.com)</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/40 border border-slate-700/40 px-3 py-1.5 rounded-lg text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>FBA Prep Partner: <strong className="text-white font-semibold">Prep Ninjas (USA)</strong></span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:flex items-center w-80 relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search ASIN, Product, Supplier..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveView('pitch')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Modo Comercial SaaS</span>
        </button>

        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 transition relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
          WS
        </div>
      </div>
    </header>
  );
}
