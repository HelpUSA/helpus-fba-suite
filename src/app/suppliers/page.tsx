'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_SUPPLIERS } from '@/data/mockProducts';
import { Building2, ExternalLink, Star, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'US' | 'BR' | 'CN'>('ALL');

  const filteredSuppliers = INITIAL_SUPPLIERS.filter((s) => {
    if (selectedCountry === 'ALL') return true;
    return s.country === selectedCountry;
  });

  const getCountryBadge = (country: 'US' | 'BR' | 'CN') => {
    switch (country) {
      case 'US': return '🇺🇸 EUA';
      case 'BR': return '🇧🇷 Brasil';
      case 'CN': return '🇨🇳 China';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-400" />
              <span>{t.supTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {t.supSubtitle}
            </p>
          </div>

          {/* Country Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedCountry('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCountry === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabAllSuppliers} ({INITIAL_SUPPLIERS.length})
            </button>
            <button
              onClick={() => setSelectedCountry('US')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'US'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabUsa}</span>
            </button>
            <button
              onClick={() => setSelectedCountry('BR')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'BR'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabBrasil}</span>
            </button>
            <button
              onClick={() => setSelectedCountry('CN')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'CN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabChina}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredSuppliers.map((s) => (
          <div key={s.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md font-mono text-slate-300">
                      {getCountryBadge(s.country)}
                    </span>
                    {s.cnpjOrEin && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-mono">
                        CNPJ: {s.cnpjOrEin}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-white flex items-center gap-2 mt-2">
                    <span>{s.name}</span>
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{s.category}</div>
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-xl shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{s.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 font-sans">
                {s.notes}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="font-mono text-slate-400">
                {t.supMoq} <strong className="text-white">{s.moq}</strong>
              </div>

              <a
                href={s.website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center space-x-1.5 transition text-xs shadow"
              >
                <span>{t.supVisitCatalog}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
