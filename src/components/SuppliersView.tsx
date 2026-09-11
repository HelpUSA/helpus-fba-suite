'use client';

import React from 'react';
import { Supplier } from '@/data/mockProducts';
import { Language, i18n } from '@/data/i18n';
import { Building2, ExternalLink, Star, CheckCircle2 } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  language: Language;
}

export default function SuppliersView({ suppliers, language }: SuppliersViewProps) {
  const t = i18n[language];

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>{t.supTitle}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {t.supSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((s) => (
          <div key={s.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{s.name}</span>
                    {s.shipToPrep && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t.supShipsToPrep}
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{s.category}</div>
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{s.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
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
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition text-xs"
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
