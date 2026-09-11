'use client';

import React from 'react';
import { Search, Bell, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Language, i18n } from '@/data/i18n';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Header({ activeView, setActiveView, language, setLanguage }: HeaderProps) {
  const t = i18n[language];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Branding & Organization */}
      <div className="flex items-center space-x-4">
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center space-x-3 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer transition"
        >
          <img
            src="/images/helpus_logo.png"
            alt="HelpUS LLC Logo"
            className="w-7 h-7 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>{t.activeAccount}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{t.marketLabel}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/40 border border-slate-700/40 px-3 py-1.5 rounded-lg text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.fbaPartner}</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center w-72 relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Right: Actions, Language Switcher & Profile */}
      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              language === 'pt'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇧🇷</span>
            <span>PT</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              language === 'en'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>

          <button
            onClick={() => setLanguage('es')}
            className={`px-2 py-1 rounded transition flex items-center gap-1 ${
              language === 'es'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇪🇸</span>
            <span>ES</span>
          </button>
        </div>

        {/* Commercial Pitch Mode Button */}
        <button
          onClick={() => setActiveView('pitch')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.saasModeBtn}</span>
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
