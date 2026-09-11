'use client';

import React from 'react';
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
  ExternalLink
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

  // Financial calculations
  const totalPotentialProfit = products.reduce((acc, p) => acc + (p.netProfit * 50), 0); // Based on 50 units test batch
  const totalEstSales = products.reduce((acc, p) => acc + (p.amazonPrice * 50), 0);
  const avgRoi = Math.round(products.reduce((acc, p) => acc + p.roiPercent, 0) / (products.length || 1));
  const activeShipmentsCount = shipments.length;

  const chartData = products.slice(0, 5).map((p) => ({
    name: p.title.substring(0, 15) + '...',
    Faturamento: p.amazonPrice * 50,
    Custos: (p.supplierPrice + p.amazonReferralFee + p.fbaFee + p.prepFee + p.inboundShipping) * 50,
    LucroLiquido: p.netProfit * 50,
  }));

  return (
    <div className="space-y-6">
      {/* Banner / Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-900/40 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
              HelpUS LLC • US Operation
            </span>
            <span className="text-xs text-slate-400">• Amazon FBA + Prep Ninjas</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t.dashTitle}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {t.dashSubtitle}
          </p>
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
        {/* Card 1 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.potentialProfit}</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${totalPotentialProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>50 un/product</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.grossRevenue}</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${totalEstSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-1 font-mono">
              <span>{products.length} Products</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.avgRoi}</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-300 tracking-tight">
              +{avgRoi}%
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
              <span>Net ROI</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.prepStatus}</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {activeShipmentsCount} Batches
            </div>
            <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1 font-mono">
              <span>FNSKU Labeling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{t.chartTitle}</h3>
              <p className="text-xs text-slate-400">{t.chartSubtitle}</p>
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
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`$${value}`, '']}
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
              <span>{t.opStatusTitle}</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-300">Amazon Seller Central (US)</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono font-medium">Verified</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-300">Prep Ninjas (3PL Warehouse)</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded font-mono font-medium">Connected</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-300">Passkey / Auth</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded font-mono font-medium">Recommended</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setActiveView('deal-finder')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              {t.navDealFinder}
            </button>
            <button
              onClick={() => setActiveView('prep-tracker')}
              className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg transition"
            >
              {t.navPrepTracker}
            </button>
          </div>
        </div>
      </div>

      {/* Top Ungated Deals Preview Table */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{t.featuredDealsTitle}</h3>
            <p className="text-xs text-slate-400">{t.featuredDealsSubtitle}</p>
          </div>
          <button
            onClick={() => setActiveView('deal-finder')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>{t.viewAll} ({products.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">{t.colProduct}</th>
                <th className="py-3 px-4">{t.colSupplier}</th>
                <th className="py-3 px-4">{t.colPricing}</th>
                <th className="py-3 px-4">{t.colFees}</th>
                <th className="py-3 px-4">{t.colProfitRoi}</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.slice(0, 4).map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={p.imageUrl} alt={p.title} className="w-9 h-9 rounded object-cover border border-slate-800 shrink-0" />
                      <div>
                        <div className="font-semibold text-white truncate max-w-xs">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ASIN: {p.asin} • {p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">
                    <a href={p.supplierUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center gap-1">
                      <span>{p.supplierName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div>Buy: <strong className="text-white">${p.supplierPrice.toFixed(2)}</strong></div>
                    <div>Amazon: <strong className="text-blue-400">${p.amazonPrice.toFixed(2)}</strong></div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    <div>FBA: ${p.fbaFee.toFixed(2)}</div>
                    <div>Prep: ${p.prepFee.toFixed(2)}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-emerald-400 font-bold">+${p.netProfit.toFixed(2)} / un</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">+{p.roiPercent}% ROI</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
