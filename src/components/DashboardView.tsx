'use client';

import React, { useState } from 'react';
import { ProductDeal, PrepShipment } from '@/data/mockProducts';
import { Language, i18n } from '@/data/i18n';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  Truck,
  ExternalLink,
  Layers,
  Globe2,
  PackageCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  products: ProductDeal[];
  shipments: PrepShipment[];
  setActiveView: (view: string) => void;
  language: Language;
}

export default function DashboardView({ products, shipments, setActiveView, language }: DashboardViewProps) {
  const t = i18n[language];
  const [selectedOperation, setSelectedOperation] = useState<'ALL' | 'US' | 'BR'>('ALL');

  // Filter products by operation
  const filteredProducts = products.filter((p) => {
    if (selectedOperation === 'US') return p.marketplace === 'Amazon US';
    if (selectedOperation === 'BR') return p.marketplace === 'Amazon BR';
    return true;
  });

  // Financial calculations
  const usProducts = products.filter((p) => p.currency === 'USD');
  const brProducts = products.filter((p) => p.currency === 'BRL');

  const totalUsProfit = usProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 50)), 0);
  const totalBrProfit = brProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 5)), 0);

  const totalUsRevenue = usProducts.reduce((acc, p) => acc + (p.amazonPrice * (p.currentStock || 50)), 0);
  const totalBrRevenue = brProducts.reduce((acc, p) => acc + (p.amazonPrice * (p.currentStock || 5)), 0);

  const totalPhysicalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const avgRoi = Math.round(filteredProducts.reduce((acc, p) => acc + p.roiPercent, 0) / (filteredProducts.length || 1));
  const activeShipmentsCount = shipments.length;

  const chartData = filteredProducts.slice(0, 7).map((p) => {
    const qty = p.currentStock || (p.currency === 'USD' ? 50 : 5);
    const currencyPrefix = p.currency === 'BRL' ? 'R$' : '$';
    return {
      name: p.title.substring(0, 14) + '...',
      fullName: p.title,
      currency: p.currency,
      Faturamento: Number((p.amazonPrice * qty).toFixed(2)),
      Custos: Number(((p.supplierPrice + p.amazonReferralFee + p.fbaFee + p.prepFee + p.inboundShipping) * qty).toFixed(2)),
      LucroLiquido: Number((p.netProfit * qty).toFixed(2)),
      unitProfit: p.netProfit,
      currencyPrefix
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 p-6 rounded-2xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              HelpUS FBA Suite & ERP
            </span>
            <span className="text-xs text-slate-400">• Operações Unificadas EUA & Brasil</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t.dashTitle}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {t.dashSubtitle}
          </p>

          {/* Operation Selector Filter Tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setSelectedOperation('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                selectedOperation === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visão Global ({products.length})</span>
            </button>

            <button
              onClick={() => setSelectedOperation('US')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                selectedOperation === 'US'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇺🇸</span>
              <span>HelpUS LLC (EUA FBA)</span>
            </button>

            <button
              onClick={() => setSelectedOperation('BR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                selectedOperation === 'BR'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🇧🇷</span>
              <span>HelpUS Brasil (Nativos)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('deal-finder')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.mineBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lucro Líquido */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.potentialProfit}</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            {selectedOperation === 'ALL' && (
              <div className="space-y-1">
                <div className="text-xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span>${totalUsProfit.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-normal">USD</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 tracking-tight flex items-baseline gap-2">
                  <span>+ R$ {totalBrProfit.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">BRL</span>
                </div>
              </div>
            )}
            {selectedOperation === 'US' && (
              <div className="text-2xl font-extrabold text-white tracking-tight">
                ${totalUsProfit.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
            )}
            {selectedOperation === 'BR' && (
              <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                R$ {totalBrProfit.toFixed(2)} <span className="text-xs text-slate-400 font-normal">BRL</span>
              </div>
            )}
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>Margem líquida real de estoque</span>
            </div>
          </div>
        </div>

        {/* Card 2: Faturamento Estimado */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.grossRevenue}</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            {selectedOperation === 'ALL' && (
              <div className="space-y-1">
                <div className="text-xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span>${totalUsRevenue.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-normal">USD</span>
                </div>
                <div className="text-sm font-bold text-blue-400 tracking-tight flex items-baseline gap-2">
                  <span>R$ {totalBrRevenue.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">BRL</span>
                </div>
              </div>
            )}
            {selectedOperation === 'US' && (
              <div className="text-2xl font-extrabold text-white tracking-tight">
                ${totalUsRevenue.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
            )}
            {selectedOperation === 'BR' && (
              <div className="text-2xl font-extrabold text-blue-400 tracking-tight">
                R$ {totalBrRevenue.toFixed(2)} <span className="text-xs text-slate-400 font-normal">BRL</span>
              </div>
            )}
            <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-2 font-mono">
              <span>{filteredProducts.length} Produtos Cadastrados</span>
            </div>
          </div>
        </div>

        {/* Card 3: Unidades em Estoque Físico */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Estoque Operacional Ativo</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-300 tracking-tight">
              {totalPhysicalUnits} Unidades
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
              <span>50 un (EUA FBA) • 30 un (Brasil JPA)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Remessas & Hubs */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Remessas em Trânsito</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {activeShipmentsCount} Lotes Ativos
            </div>
            <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1 font-mono">
              <span>UPS Ground (RYY2) + Braspress (JPA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{t.chartTitle}</h3>
              <p className="text-xs text-slate-400">Valores em moeda original de cada lote cadastrado</p>
            </div>
            <button
              onClick={() => setActiveView('calculator')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>{t.navCalculator}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${item.payload.currencyPrefix} ${value}`,
                    name
                  ]}
                />
                <Bar dataKey="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.chartRevenue} />
                <Bar dataKey="Custos" fill="#64748b" radius={[4, 4, 0, 0]} name={t.chartCosts} />
                <Bar dataKey="LucroLiquido" fill="#10b981" radius={[4, 4, 0, 0]} name={t.chartNetProfit} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations & Status Box */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Status Operacional Conectado</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">Amazon US Seller Central</div>
                  <div className="text-[10px] text-slate-500 font-mono">ASIN B0HLTXWCV7 Catalogado</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono font-medium">Ativo</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">Prep Ninjas (Salt Lake City)</div>
                  <div className="text-[10px] text-slate-500 font-mono">50 un despachadas para RYY2</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded font-mono font-medium">En Route</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">Nativos do Brasil (NF-e 2509)</div>
                  <div className="text-[10px] text-slate-500 font-mono">30 frascos / R$ 710,82 pago</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono font-medium">Faturado</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-medium">Braspress Logística</div>
                  <div className="text-[10px] text-slate-500 font-mono">Prev. 11/11 JPA (Bessa/PB)</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded font-mono font-medium">Em Trânsito</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setActiveView('prep-tracker')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              Ver Rastreio de Cargas (EUA & BR)
            </button>
            <button
              onClick={() => setActiveView('suppliers')}
              className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Gestão de Fornecedores Homologados
            </button>
          </div>
        </div>
      </div>

      {/* Real Inventory & Products Table */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Inventário de Produtos & SKUs Mapeados</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {filteredProducts.length} itens
              </span>
            </h3>
            <p className="text-xs text-slate-400">Listagem de produtos das operações HelpUS LLC e HelpUS Brasil</p>
          </div>
          <button
            onClick={() => setActiveView('deal-finder')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>Ver Todos ({products.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Produto & Identificador</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Preço Compra / Venda</th>
                <th className="py-3 px-4">Taxas & Frete</th>
                <th className="py-3 px-4">Lucro Líq. / ROI</th>
                <th className="py-3 px-4">Estoque</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredProducts.map((p) => {
                const currency = p.currency === 'BRL' ? 'R$' : '$';
                const isBR = p.marketplace === 'Amazon BR';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="text-base" title={p.marketplace}>
                        {isBR ? '🇧🇷' : '🇺🇸'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img src={p.imageUrl} alt={p.title} className="w-9 h-9 rounded object-cover border border-slate-800 shrink-0" />
                        <div>
                          <div className="font-semibold text-white truncate max-w-xs font-sans">{p.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.sku ? `SKU: ${p.sku}` : `ASIN: ${p.asin}`} {p.ncm ? `• NCM: ${p.ncm}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <a href={p.supplierUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center gap-1">
                        <span className="truncate max-w-[140px]">{p.supplierName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <div>Custo: <strong className="text-white">{currency} {p.supplierPrice.toFixed(2)}</strong></div>
                      <div>Venda: <strong className="text-blue-400">{currency} {p.amazonPrice.toFixed(2)}</strong></div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>Logística: {currency} {p.fbaFee.toFixed(2)}</div>
                      <div>Frete/Inbound: {currency} {p.inboundShipping.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-emerald-400 font-bold">+{currency} {p.netProfit.toFixed(2)} / un</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">+{p.roiPercent}% ROI</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        {p.currentStock} un
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
