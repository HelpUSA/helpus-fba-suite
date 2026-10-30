'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PRODUCTS, INITIAL_SHIPMENTS } from '@/data/mockProducts';
import {
  Globe2,
  Package,
  Truck,
  ArrowRight,
  Calculator,
  Building2,
  Search,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  FileText,
  Boxes
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

  const usProducts = INITIAL_PRODUCTS.filter((p) => p.marketplace === 'Amazon US');
  const brProducts = INITIAL_PRODUCTS.filter((p) => p.marketplace === 'Amazon BR');

  const totalUsUnits = usProducts.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalBrUnits = brProducts.reduce((acc, p) => acc + (p.currentStock || 0), 0);

  const totalUsProfit = usProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 0)), 0);
  const totalBrProfit = brProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 0)), 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" />
            HelpUS FBA Suite & ERP
          </span>
          <span className="text-xs text-slate-400 font-mono">• 2026 Live Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.execTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t.execSubtitle}
        </p>
      </div>

      {/* KPI Cards: Consolidated High-Level */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">{t.kpiTotalSkus}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {INITIAL_PRODUCTS.length}
          </div>
          <div className="text-[11px] text-blue-400">1 EUA • 6 Brasil</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">{t.kpiTotalUnits}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
            {totalUsUnits + totalBrUnits}
          </div>
          <div className="text-[11px] text-slate-400">{totalUsUnits} EUA • {totalBrUnits} BR</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">{t.kpiUsProfit}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            ${totalUsProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-500">USD • 50 un Silicone</div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 text-xs block font-sans">{t.kpiBrProfit}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            R$ {totalBrProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-500">BRL • 30 un Nativos</div>
        </div>
      </div>

      {/* Two Noble Operational Gateway Cards (USA vs Brasil) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t.globalSummaryTitle}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {t.globalSummarySub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: USA Operation */}
          <Link
            href="/usa"
            className="group p-6 sm:p-7 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl space-y-5 transition shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition"></div>
            <div className="flex items-center justify-between">
              <span className="text-4xl">🇺🇸</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-mono font-bold">
                Amazon US FBA
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                {t.cardUsaTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {t.cardUsaDesc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">50 un • RYY2 Amazon</span>
              <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>{t.cardUsaAction}</span>
              </span>
            </div>
          </Link>

          {/* Card 2: Brasil Operation */}
          <Link
            href="/brasil"
            className="group p-6 sm:p-7 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl space-y-5 transition shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition"></div>
            <div className="flex items-center justify-between">
              <span className="text-4xl">🇧🇷</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
                NF-e 00002509
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
                {t.cardBrTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {t.cardBrDesc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">30 frascos • Braspress JPA</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>{t.cardBrAction}</span>
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-slate-400">
          {t.quickToolsTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/nfe"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl w-fit group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navNfe}</div>
              <div className="text-[10px] text-slate-400">SEFAZ XML & Custos</div>
            </div>
          </Link>

          <Link
            href="/estoque"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navEstoque}</div>
              <div className="text-[10px] text-slate-400">4 Nós Logísticos</div>
            </div>
          </Link>

          <Link
            href="/calc"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navCalculator}</div>
              <div className="text-[10px] text-slate-400">Simule USD & BRL</div>
            </div>
          </Link>

          <Link
            href="/prep"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navPrepTracker}</div>
              <div className="text-[10px] text-slate-400">UPS + Braspress</div>
            </div>
          </Link>

          <Link
            href="/suppliers"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navSuppliers}</div>
              <div className="text-[10px] text-slate-400">EUA, BR & China</div>
            </div>
          </Link>

          <Link
            href="/deals"
            className="p-4 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 transition group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit group-hover:scale-110 transition">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.navDealFinder}</div>
              <div className="text-[10px] text-slate-400">Mineração de Deals</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
