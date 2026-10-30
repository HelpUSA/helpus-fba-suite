'use client';

import React, { useState } from 'react';
import { Supplier } from '@/data/mockProducts';
import { Language, i18n } from '@/data/i18n';
import { Building2, ExternalLink, Star, CheckCircle2, ShieldCheck, Globe, MapPin } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  language: Language;
}

export default function SuppliersView({ suppliers, language }: SuppliersViewProps) {
  const t = i18n[language];
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'US' | 'BR' | 'CN'>('ALL');

  const filteredSuppliers = suppliers.filter((s) => {
    if (selectedCountry === 'ALL') return true;
    return s.country === selectedCountry;
  });

  const getCountryFlag = (country: 'US' | 'BR' | 'CN') => {
    switch (country) {
      case 'US': return '🇺🇸 EUA';
      case 'BR': return '🇧🇷 Brasil';
      case 'CN': return '🇨🇳 China';
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Gestão de Fabricantes, 3PL & Fornecedores Homologados</span>
          </h2>
          <p className="text-xs text-slate-400">
            Diretório de parceiros industriais, centros de preparação FBA e atacado
          </p>
        </div>

        {/* Country Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedCountry('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedCountry === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({suppliers.length})
          </button>
          <button
            onClick={() => setSelectedCountry('US')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition ${
              selectedCountry === 'US'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇺🇸</span> <span>EUA</span>
          </button>
          <button
            onClick={() => setSelectedCountry('BR')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition ${
              selectedCountry === 'BR'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇧🇷</span> <span>Brasil</span>
          </button>
          <button
            onClick={() => setSelectedCountry('CN')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition ${
              selectedCountry === 'CN'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇨🇳</span> <span>China</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map((s) => (
          <div key={s.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded font-mono text-slate-300">
                      {getCountryFlag(s.country)}
                    </span>
                    {s.cnpjOrEin && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                        CNPJ: {s.cnpjOrEin}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2 mt-1.5">
                    <span>{s.name}</span>
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{s.category}</div>
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-lg shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{s.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans">
                {s.notes}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="font-mono text-slate-400">
                Pedido Mínimo: <strong className="text-white">{s.moq}</strong>
              </div>

              <a
                href={s.website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition text-xs shadow"
              >
                <span>Acessar Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
