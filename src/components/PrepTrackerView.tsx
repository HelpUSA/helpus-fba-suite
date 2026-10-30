'use client';

import React from 'react';
import { PrepShipment } from '@/data/mockProducts';
import { Language, i18n } from '@/data/i18n';
import { Truck, Package, CheckCircle2, ExternalLink, ShieldCheck, Box, MapPin, Building, Clock } from 'lucide-react';

interface PrepTrackerViewProps {
  shipments: PrepShipment[];
  language: Language;
}

export default function PrepTrackerView({ shipments, language }: PrepTrackerViewProps) {
  const t = i18n[language];

  const usSteps = [
    { label: 'Pedido Criado', key: 'Ordered' },
    { label: 'Envio ao Prep', key: 'In Transit to Prep' },
    { label: 'Na Prep Ninjas', key: 'At Prep Ninjas' },
    { label: 'Etiquetado FNSKU', key: 'Prepped & Labeled' },
    { label: 'Em Rota FBA (UPS)', key: 'En Route to FBA' },
    { label: 'Recebido na Amazon', key: 'Received by Amazon' },
  ];

  const brSteps = [
    { label: 'Pedido #3404 (PIX)', key: 'Ordered' },
    { label: 'NF-e 2509 Emitida', key: 'In Transit to Prep' },
    { label: 'Coleta Braspress', key: 'At Prep Ninjas' },
    { label: 'Transferência JPA', key: 'Prepped & Labeled' },
    { label: 'Chegada Base Bessa', key: 'En Route to FBA' },
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
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Rastreamento Logístico Multi-Armazém (EUA & Brasil)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real das remessas em trânsito internacional e nacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dashboard.prepninjas.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <span>Prep Ninjas Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.braspress.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <span>Braspress Rastreio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Info Header Banner */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Hubs Ativos:</div>
            <div className="font-bold text-white">Prep Ninjas (UT) & Filial JPA (PB)</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Total Unidades em Trânsito:</div>
            <div className="font-bold text-white">80 unidades (50 EUA / 30 BR)</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Conformidade Fiscal:</div>
            <div className="font-bold text-emerald-400">FNSKU Aprovado + NF-e 2509 Válida</div>
          </div>
        </div>
      </div>

      {/* Shipment List Cards */}
      <div className="space-y-4">
        {shipments.map((shipment) => {
          const isUS = shipment.marketplace === 'US' || !shipment.marketplace;
          const currentStepIdx = isUS
            ? getStepIndex(shipment.status)
            : 1; // 1 for BR in transit
          const currentSteps = isUS ? usSteps : brSteps;

          return (
            <div key={shipment.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{isUS ? '🇺🇸' : '🇧🇷'}</span>
                    <span className="font-bold text-white text-sm">{shipment.productTitle}</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                      {shipment.unitsCount} unidades
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                      {shipment.carrier || (isUS ? 'UPS Ground' : 'Braspress')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono pt-0.5">
                    <span>Fornecedor: <strong className="text-slate-200">{shipment.supplierName}</strong></span>
                    <span>•</span>
                    <span>Rastreio: <strong className="text-blue-400">{shipment.trackingNumber}</strong></span>
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

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-mono flex items-center sm:justify-end gap-1">
                    <Clock className="w-3 h-3" /> Previsão de Entrega:
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">{shipment.estDeliveryDate}</span>
                </div>
              </div>

              {/* Step Progress Tracker Bar */}
              <div className="pt-2">
                <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-mono">
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
