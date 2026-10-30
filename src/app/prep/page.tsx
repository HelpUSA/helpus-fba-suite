'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_SHIPMENTS } from '@/data/mockProducts';
import {
  Truck,
  Package,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

export default function PrepTrackerPage() {
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<'ALL' | 'US' | 'BR'>('ALL');

  const filteredShipments = INITIAL_SHIPMENTS.filter((s) => {
    if (filterTab === 'US') return s.marketplace === 'US';
    if (filterTab === 'BR') return s.marketplace === 'BR';
    return true;
  });

  const usSteps = [
    { label: t.statusOrdered, key: 'Ordered' },
    { label: t.statusInTransit, key: 'In Transit to Prep' },
    { label: t.statusAtPrep, key: 'At Prep Ninjas' },
    { label: t.statusPrepped, key: 'Prepped & Labeled' },
    { label: t.statusEnRouteFba, key: 'En Route to FBA' },
    { label: t.statusReceivedFba, key: 'Received by Amazon' },
  ];

  const brSteps = [
    { label: 'Pedido #3404 (PIX)', key: 'Ordered' },
    { label: 'NF-e 2509 Emitida', key: 'In Transit to Prep' },
    { label: 'Coleta Braspress', key: 'At Prep Ninjas' },
    { label: 'Transferência JPA', key: 'Prepped & Labeled' },
    { label: 'Entrega Base Bessa', key: 'En Route to FBA' },
    { label: 'Estoque Disponível', key: 'Received by Amazon' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Ordered': return 0;
      case 'In Transit to Prep': return 1;
      case 'At Prep Ninjas': return 2;
      case 'Prepped & Labeled': return 3;
      case 'En Route to FBA': return 4;
      case 'Received by Amazon': return 5;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-7 h-7 text-amber-400" />
              <span>{t.trackerTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {t.trackerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://dashboard.prepninjas.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <span>{t.prepDashboardBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.braspress.com"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <span>{t.braspressBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              filterTab === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.tabAllShipments} ({INITIAL_SHIPMENTS.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('US')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              filterTab === 'US'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.tabUsaFba}</span>
          </button>

          <button
            onClick={() => setFilterTab('BR')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              filterTab === 'BR'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.tabBrasilLogistics}</span>
          </button>
        </div>
      </div>

      {/* Shipment List Cards */}
      <div className="space-y-4">
        {filteredShipments.map((shipment) => {
          const isUS = shipment.marketplace === 'US';
          const currentStepIdx = isUS
            ? getStepIndex(shipment.status)
            : 1; // 1 for BR in transit
          const currentSteps = isUS ? usSteps : brSteps;

          return (
            <div key={shipment.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{isUS ? '🇺🇸' : '🇧🇷'}</span>
                    <span className="font-bold text-white text-sm sm:text-base">{shipment.productTitle}</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                      {shipment.unitsCount} un
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                      {shipment.carrier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 sm:gap-3 font-mono pt-1">
                    <span>Fornecedor: <strong className="text-slate-200">{shipment.supplierName}</strong></span>
                    <span>•</span>
                    <span>Código: <strong className="text-blue-400">{shipment.trackingNumber}</strong></span>
                    {shipment.origin && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{shipment.origin} &rarr; <strong className="text-amber-300">{shipment.destination}</strong></span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <span className="text-xs text-slate-400 block flex items-center sm:justify-end gap-1 font-sans">
                    <Clock className="w-3 h-3" /> {t.stepDeliveryEst}
                  </span>
                  <span className="text-sm font-bold text-amber-400">{shipment.estDeliveryDate}</span>
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div className="pt-2 overflow-x-auto">
                <div className="min-w-[500px] grid grid-cols-6 gap-2 text-center text-[10px] font-mono">
                  {currentSteps.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="space-y-2">
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition ${
                              isPassed
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : (idx + 1)}
                          </div>
                        </div>
                        <div className={`leading-tight ${isCurrent ? 'text-emerald-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-600'}`}>
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
