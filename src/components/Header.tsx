'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Globe, Menu, X, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t, isMobileMenuOpen, toggleMobileMenu } = useLanguage();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Hamburger (mobile) + Branding */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          aria-label={t.mobileMenuToggle}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link
          href="/"
          className="flex items-center space-x-2.5 sm:space-x-3 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition"
        >
          <img
            src="/images/helpus_logo.png"
            alt="HelpUS Logo"
            className="w-7 h-7 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{t.activeAccount}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">{t.marketLabel}</span>
              <span className="sm:hidden">EUA & BR</span>
            </div>
          </div>
        </Link>

        {/* FBA Partner Pill (Desktop only) */}
        <div className="hidden xl:flex items-center space-x-2 text-xs bg-slate-800/40 border border-slate-700/40 px-3 py-1.5 rounded-lg text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.fbaPartner}</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:flex items-center w-64 xl:w-80 relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Right: Language Switcher */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
              language === 'pt'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Português (Brasil)"
          >
            <span>🇧🇷</span>
            <span className="text-[11px]">PT</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
              language === 'en'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="English (US)"
          >
            <span>🇺🇸</span>
            <span className="text-[11px]">EN</span>
          </button>

          <button
            onClick={() => setLanguage('es')}
            className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
              language === 'es'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Español"
          >
            <span>🇪🇸</span>
            <span className="text-[11px]">ES</span>
          </button>
        </div>
      </div>
    </header>
  );
}
