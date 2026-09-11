'use client';

import React from 'react';
import { Language, i18n } from '@/data/i18n';
import { Sparkles, Zap, CheckCircle2, Layers, BarChart3 } from 'lucide-react';

interface SaaSPitchViewProps {
  language: Language;
}

export default function SaaSPitchView({ language }: SaaSPitchViewProps) {
  const t = i18n[language];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 select-none">
      {/* Commercial SaaS Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.pitchHeroTag}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {t.pitchHeroTitle1} <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            {t.pitchHeroTitle2}
          </span>
        </h1>

        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          {t.pitchHeroSub}
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.pitchFeature1Title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.pitchFeature1Desc}
          </p>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.pitchFeature2Title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.pitchFeature2Desc}
          </p>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.pitchFeature3Title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.pitchFeature3Desc}
          </p>
        </div>
      </div>

      {/* Commercial Pricing Plans */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">{t.pitchPricingTitle}</h2>
          <p className="text-xs text-slate-400">{t.pitchPricingSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Starter */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase">{t.planStarter}</div>
              <div className="text-3xl font-bold text-white">$49 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100 Scans / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Basic FBA Calculator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Prep Ninjas Tracker</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl">{t.btnStartTrial}</button>
          </div>

          {/* Pro */}
          <div className="p-6 bg-blue-950/40 border-2 border-blue-500/60 rounded-2xl space-y-4 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
            <span className="absolute -top-3 right-6 bg-blue-500 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
            <div className="space-y-3">
              <div className="text-xs font-mono text-blue-400 uppercase font-bold">{t.planPro}</div>
              <div className="text-3xl font-bold text-white">$149 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Mining</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct SP-API Integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Flat File CSV Exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-LLC Support</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30">{t.btnSubscribePro}</button>
          </div>

          {/* Enterprise */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase">{t.planEnterprise}</div>
              <div className="text-3xl font-bold text-white">$299 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Custom Scrapers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Dedicated Support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> White Label Portal</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl">{t.btnContactSales}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
