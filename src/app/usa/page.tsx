'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PRODUCTS, INITIAL_SHIPMENTS } from '@/data/mockProducts';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Box,
  MapPin,
  DollarSign,
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export default function UsaOperationPage() {
  const { t } = useLanguage();

  const product = INITIAL_PRODUCTS.find((p) => p.asin === 'B0HLTXWCV7') || INITIAL_PRODUCTS[0];
  const shipment = INITIAL_SHIPMENTS.find((s) => s.marketplace === 'US') || INITIAL_SHIPMENTS[0];

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🇺🇸</span>
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
            HelpUS LLC • Delaware/Alabama Entity
          </span>
          <span className="text-xs text-slate-400 font-mono">• Amazon US Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.usaPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t.usaPageSubtitle}
        </p>
      </div>

      {/* Grid: 3PL Partner & Current Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Prep Center Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-400" />
              <span>{t.usaPartnerTitle}</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] rounded-full font-mono font-bold">
              Ativo
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {t.usaPartnerDesc}
          </p>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>869 E 4500 S, Salt Lake City, UT 84107</span>
            </div>
            <div>Serviços: Inspeção, FNSKU, Polybag, Box Labels, UPS Inbound</div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://dashboard.prepninjas.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1.5 font-semibold"
            >
              <span>{t.prepDashboardBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Current Active Shipment Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Remessa Ativa em Trânsito</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] rounded-full font-mono font-bold">
                {shipment.carrier}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="text-slate-400">Rastreio UPS: <strong className="text-blue-400">{shipment.trackingNumber}</strong></div>
                <div className="text-slate-400">Origem: <strong className="text-slate-200">{shipment.origin}</strong></div>
                <div className="text-slate-400">Destino: <strong className="text-amber-300">{shipment.destination}</strong></div>
                <div className="text-slate-400">Previsão: <strong className="text-emerald-400">{shipment.estDeliveryDate}</strong></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Volume: <strong className="text-white">{shipment.unitsCount} unidades</strong></span>
            <span className="text-emerald-400 font-bold">Em rota para galpão FBA</span>
          </div>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.usaProductCardTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">{t.usaProductCardSub}</p>
          </div>

          <a
            href="https://www.amazon.com/dp/B0HLTXWCV7"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition w-fit shadow"
          >
            <span>Ver Anúncio na Amazon</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Image & Main Identifiers */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-48 h-48 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain bg-white rounded-2xl p-2 border border-slate-800 shadow-md shrink-0"
            />
            <div className="space-y-1.5 text-xs font-mono w-full text-center sm:text-left lg:text-center">
              <div className="text-sm font-bold text-white font-sans">{product.title}</div>
              <div className="text-slate-400">{t.usaAsinLabel} <strong className="text-blue-400">{product.asin}</strong></div>
              <div className="text-slate-400">{t.usaSkuLabel} <strong className="text-slate-200">{product.sku}</strong></div>
              <div className="text-slate-400">{t.usaBatchLabel} <strong className="text-emerald-400">{product.currentStock} unidades</strong></div>
            </div>
          </div>

          {/* Unit Economics Breakdown Table (100% in USD) */}
          <div className="lg:col-span-8 p-5 sm:p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-300">
              Unit Economics Real do Lote (USD $)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[11px]">{t.usaUnitCost}</span>
                <span className="text-base font-extrabold text-white">${product.supplierPrice.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[11px]">{t.usaSalePrice}</span>
                <span className="text-base font-extrabold text-blue-400">${product.amazonPrice.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[11px]">{t.usaAmazonFees}</span>
                <span className="text-base font-extrabold text-amber-400">${(product.fbaFee + product.amazonReferralFee).toFixed(2)}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[11px]">{t.usaPrepFee}</span>
                <span className="text-base font-extrabold text-slate-300">${product.prepFee.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Frete Inbound:</span>
                <span className="text-base font-extrabold text-slate-300">${product.inboundShipping.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <span className="text-emerald-400 block text-[11px] font-bold">{t.usaNetMargin}</span>
                <span className="text-base font-extrabold text-emerald-400">+${product.netProfit.toFixed(2)} / un</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800">
              <span>Projeção para 50 unidades: <strong className="text-white">${(product.amazonPrice * 50).toFixed(2)} faturamento</strong></span>
              <span className="text-emerald-400 font-bold">+${(product.netProfit * 50).toFixed(2)} lucro líquido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance & Sourcing Rules */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.usaComplianceTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Embalagem Polybag Individual</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
              {t.usaPolybagRule}
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Marcação de Origem na Caixa Master</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
              {t.usaOriginStampRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
