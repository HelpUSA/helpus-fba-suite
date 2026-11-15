'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_SUPPLIERS } from '@/data/mockProducts';
import {
  Building2,
  ExternalLink,
  Star,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Search,
  Truck,
  Filter
} from 'lucide-react';

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'US' | 'BR' | 'CN'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = INITIAL_SUPPLIERS.filter((s) => {
    if (selectedCountry !== 'ALL' && s.country !== selectedCountry) return false;
    if (selectedStatus !== 'ALL' && s.relationshipStatus !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      const matchNotes = s.notes.toLowerCase().includes(q);
      const matchCity = s.cityState?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchNotes && !matchCity) return false;
    }
    return true;
  });

  const getCountryBadge = (country: 'US' | 'BR' | 'CN') => {
    switch (country) {
      case 'US': return '🇺🇸 EUA';
      case 'BR': return '🇧🇷 Brasil';
      case 'CN': return '🇨🇳 China';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active Supplier':
        return (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ativo / Compras Realizadas
          </span>
        );
      case 'Contract Homologated':
        return (
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md font-mono font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            Contrato Homologado
          </span>
        );
      case 'RFQ Quoted':
        return (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono font-medium">
            Cotação RFQ Disparada
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
            Pipeline B2B
          </span>
        );
    }
  };

  const usCount = INITIAL_SUPPLIERS.filter(s => s.country === 'US').length;
  const brCount = INITIAL_SUPPLIERS.filter(s => s.country === 'BR').length;
  const cnCount = INITIAL_SUPPLIERS.filter(s => s.country === 'CN').length;
  const activeCount = INITIAL_SUPPLIERS.filter(s => s.relationshipStatus === 'Active Supplier').length;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-400" />
              <span>Gestão de Fornecedores & Parceiros B2B</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Catálogo oficial de indústrias, atacadistas, distribuidoras de cosméticos e operadores 3PL / Prep Centers homologados na China, Estados Unidos e Brasil.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-slate-400 text-[10px]">Cadastrados</div>
              <div className="text-lg font-bold text-white">{INITIAL_SUPPLIERS.length}</div>
            </div>
            <div className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-slate-400 text-[10px]">Ativos/Pedidos</div>
              <div className="text-lg font-bold text-emerald-400">{activeCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, marca, categoria ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
            />
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
              Todos ({INITIAL_SUPPLIERS.length})
            </button>
            <button
              onClick={() => setSelectedCountry('US')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'US'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇺🇸 EUA ({usCount})</span>
            </button>
            <button
              onClick={() => setSelectedCountry('BR')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'BR'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇧🇷 Brasil ({brCount})</span>
            </button>
            <button
              onClick={() => setSelectedCountry('CN')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                selectedCountry === 'CN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇨🇳 China ({cnCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredSuppliers.map((s) => (
          <div
            key={s.id}
            className="p-6 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-3xl space-y-4 flex flex-col justify-between transition shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md font-mono text-slate-300 font-semibold">
                      {getCountryBadge(s.country)}
                    </span>
                    {getStatusBadge(s.relationshipStatus)}
                    {s.cnpjOrEin && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-mono">
                        CNPJ: {s.cnpjOrEin}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                    <span>{s.name}</span>
                  </h2>
                  <div className="text-xs text-blue-400 font-mono font-medium">{s.category}</div>

                  {s.cityState && (
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{s.cityState}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-xl shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{s.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 font-sans">
                {s.notes}
              </p>

              {/* Direct Contacts Row if available */}
              {(s.contactEmail || s.contactPhone) && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
                  {s.contactEmail && (
                    <a
                      href={`mailto:${s.contactEmail}`}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5 transition text-[11px]"
                      title="Enviar e-mail para fornecedor"
                    >
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span>{s.contactEmail}</span>
                    </a>
                  )}
                  {s.contactPhone && (
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{s.contactPhone}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="font-mono text-slate-400">
                MOQ / Pedido Mínimo: <strong className="text-white">{s.moq}</strong>
              </div>

              <a
                href={s.website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center space-x-1.5 transition text-xs shadow shadow-blue-900/30"
              >
                <span>Acessar Portal / Catálogo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
