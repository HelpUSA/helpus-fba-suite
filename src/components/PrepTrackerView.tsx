'use client';

import React from 'react';
import { PrepShipment } from '@/data/mockProducts';
import { Truck, Package, CheckCircle2, Clock, ExternalLink, ShieldCheck, Box } from 'lucide-react';

interface PrepTrackerViewProps {
  shipments: PrepShipment[];
}

export default function PrepTrackerView({ shipments }: PrepTrackerViewProps) {
  const steps = [
    { label: 'Pedido Fornecedor', key: 'Ordered' },
    { label: 'Em Trânsito Prep', key: 'In Transit to Prep' },
    { label: 'No Prep Ninjas', key: 'At Prep Ninjas' },
    { label: 'Etiquetado FNSKU', key: 'Prepped & Labeled' },
    { label: 'Enviado p/ FBA', key: 'En Route to FBA' },
    { label: 'Recebido Amazon', key: 'Received by Amazon' },
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
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Rastreamento Logístico Prep Ninjas (3PL)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real do fluxo do fornecedor até o galpão da Amazon FBA nos EUA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dashboard.prepninjas.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <span>Acessar Painel Prep Ninjas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Info Header Banner */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Endereço do Galpão Prep:</div>
            <div className="font-bold text-white">Gulf Shores / US Warehouse</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Total de Unidades em Trânsito:</div>
            <div className="font-bold text-white">200 Unidades (3 Lotes)</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400">Serviço de Preparo:</div>
            <div className="font-bold text-emerald-400">Inspeção + FNSKU Label</div>
          </div>
        </div>
      </div>

      {/* Shipment List Cards */}
      <div className="space-y-4">
        {shipments.map((shipment) => {
          const currentStepIdx = getStepIndex(shipment.status);
          return (
            <div key={shipment.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{shipment.productTitle}</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                      {shipment.unitsCount} unidades
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-3 font-mono">
                    <span>Fornecedor: <strong className="text-slate-200">{shipment.supplierName}</strong></span>
                    <span>•</span>
                    <span>Rastreio UPS: <strong className="text-blue-400">{shipment.trackingNumber}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Previsão Entrega:</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">{shipment.estDeliveryDate}</span>
                </div>
              </div>

              {/* Step Progress Tracker Bar */}
              <div className="pt-2">
                <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-mono">
                  {steps.map((step, idx) => {
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
