'use client';

import React from 'react';
import { Sparkles, Zap, ShieldCheck, CheckCircle2, ArrowRight, Globe, Layers, BarChart3, Lock } from 'lucide-react';

export default function SaaSPitchView() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Commercial SaaS Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>HelpUS FBA Suite • Enterprise SaaS Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Automate Product Sourcing & Logistics for <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Amazon Sellers & US LLCs
          </span>
        </h1>

        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          The ultimate all-in-one software engine connecting US Wholesale Suppliers, 3PL Prep Centers (Prep Ninjas), and Amazon Seller Central.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Automated Deal Mining</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scans wholesale price sheets and liquidators to extract high-ROI products with zero brand ungating barriers.
          </p>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">3PL Prep Center Sync</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct tracking integration with Prep Ninjas and US warehouses for automated FNSKU labeling and bundling.
          </p>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Real-Time Margin Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exact net profit calculations accounting for Amazon Referral, FBA Fulfillment, Prep Fees, and Inbound Freight.
          </p>
        </div>
      </div>

      {/* Commercial Pricing Plans */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">Planos Comerciais (SaaS Ready)</h2>
          <p className="text-xs text-slate-400">Pronto para ser comercializado para marcas e vendedores da Amazon nos EUA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Starter */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase">Starter Plan</div>
              <div className="text-3xl font-bold text-white">$49 <span className="text-xs font-normal text-slate-400">/mês</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Até 100 análises/mês</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Calculadora FBA Básica</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rastreio Prep Ninjas</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl">Começar Teste</button>
          </div>

          {/* Pro */}
          <div className="p-6 bg-blue-950/40 border-2 border-blue-500/60 rounded-2xl space-y-4 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
            <span className="absolute -top-3 right-6 bg-blue-500 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">RECOMENDADO</span>
            <div className="space-y-3">
              <div className="text-xs font-mono text-blue-400 uppercase font-bold">Pro Suite</div>
              <div className="text-3xl font-bold text-white">$149 <span className="text-xs font-normal text-slate-400">/mês</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mineração Automática Ilimitada</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Integração Direct SP-API</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Exportação Flat Files CSV</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suporte Multi-LLC</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30">Assinar Pro Suite</button>
          </div>

          {/* Enterprise */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase">Enterprise</div>
              <div className="text-3xl font-bold text-white">$299 <span className="text-xs font-normal text-slate-400">/mês</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Robôs Scrapers Customizados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suporte 24/7 Dedicado</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Marca Branca (White Label)</li>
              </ul>
            </div>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl">Falar com Vendas</button>
          </div>
        </div>
      </div>
    </div>
  );
}
