'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PRODUCTS, INITIAL_SHIPMENTS } from '@/data/mockProducts';
import {
  FileText,
  Truck,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Package
} from 'lucide-react';

export default function BrasilOperationPage() {
  const { t } = useLanguage();

  const brProducts = INITIAL_PRODUCTS.filter((p) => p.marketplace === 'Amazon BR');
  const shipment = INITIAL_SHIPMENTS.find((s) => s.marketplace === 'BR') || INITIAL_SHIPMENTS[1];

  const totalCost = brProducts.reduce((acc, p) => acc + (p.supplierPrice * (p.currentStock || 5)), 0) + 127.17; // includes frete Braspress
  const totalRevenue = brProducts.reduce((acc, p) => acc + (p.amazonPrice * (p.currentStock || 5)), 0);
  const totalProfit = brProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 5)), 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🇧🇷</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
            HelpUS Brasil • CNPJ MEI Operação Nacional
          </span>
          <span className="text-xs text-slate-400 font-mono">• Mercado Nacional & Marketplaces</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.brPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t.brPageSubtitle}
        </p>
      </div>

      {/* Grid: Partner & Inbound Invoice NF-e */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Supplier Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>{t.brPartnerTitle}</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] rounded-full font-mono font-bold">
              Homologado
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {t.brPartnerDesc}
          </p>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono space-y-1.5 text-slate-400">
            <div className="text-slate-300">CNPJ: <strong>47.693.854/0001-64</strong></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Vila Velha / ES - Polo Industrial</span>
            </div>
            <div>Pedido Piloto #3404 pago via PIX à vista</div>
          </div>

          <div className="pt-2">
            <a
              href="https://www.nativosdobrasil.com.br"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1.5 font-semibold"
            >
              <span>Acessar Portal do Fornecedor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Invoice & Braspress Freight Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>{t.brInvoiceTitle}</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] rounded-full font-mono font-bold">
                SEFAZ Válida
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-slate-400">
                <div className="break-all text-[11px]">
                  {t.brInvoiceKeyLabel} <strong className="text-slate-200">32261047693854000164550010000025091235445528</strong>
                </div>
                <div>{t.brTotalInvoiceLabel} <strong className="text-emerald-400">R$ 710,82</strong> (Mercadorias + Frete)</div>
                <div>{t.brLogisticsPartner} <strong className="text-blue-400">Braspress Cargas (CTE-2509)</strong></div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.brDeliveryForecast} 11/11/2026 (Filial JPA)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Volume: <strong className="text-white">30 frascos (6 SKUs)</strong></span>
            <span className="text-emerald-400 font-bold">Destino: Bessa, João Pessoa/PB</span>
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Investimento Total do Lote</span>
          <div className="text-2xl font-bold text-white">R$ {totalCost.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">R$ 583,65 prod + R$ 127,17 frete</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Faturamento Bruto Projetado</span>
          <div className="text-2xl font-bold text-blue-400">R$ {totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-blue-500/80">30 frascos vendidos</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Lucro Líquido Real</span>
          <div className="text-2xl font-bold text-emerald-400">+R$ {totalProfit.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-500/80">Margem média no Brasil</div>
        </div>
      </div>

      {/* Products Table (6 SKUs from NF-e) */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>{t.brProductsTableTitle}</span>
          </h2>
          <p className="text-xs text-slate-400">{t.brProductsTableSub}</p>
        </div>

        {/* Responsive Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">{t.brColProduct}</th>
                <th className="py-3 px-4 text-center">{t.brColQty}</th>
                <th className="py-3 px-4">{t.brColUnitCost}</th>
                <th className="py-3 px-4">{t.brColEstSale}</th>
                <th className="py-3 px-4">Frete Rateado</th>
                <th className="py-3 px-4">{t.brColNetProfit}</th>
                <th className="py-3 px-4 text-right">{t.brColRoi}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {brProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700 shrink-0 shadow-sm" />
                      <div>
                        <div className="font-semibold text-white font-sans text-xs truncate max-w-xs">{p.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku} • NCM: {p.ncm}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-200 font-bold">
                      {p.currentStock} un
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-bold">
                    R$ {p.supplierPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-blue-400 font-bold">
                    R$ {p.amazonPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    R$ {p.inboundShipping.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    +R$ {p.netProfit.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[11px]">
                      +{p.roiPercent}%
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
