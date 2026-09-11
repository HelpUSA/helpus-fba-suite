'use client';

import React from 'react';
import {
  LayoutDashboard,
  Search,
  Calculator,
  Truck,
  Building2,
  Presentation,
  TrendingUp,
  Boxes,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  productsCount: number;
}

export default function Sidebar({ activeView, setActiveView, productsCount }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'deal-finder',
      label: 'Deal Finder (Minerador)',
      icon: Search,
      badge: productsCount.toString(),
      highlight: true,
    },
    {
      id: 'calculator',
      label: 'Calculadora FBA & Prep',
      icon: Calculator,
      badge: 'Calculador',
    },
    {
      id: 'prep-tracker',
      label: 'Rastreio Prep Ninjas',
      icon: Truck,
      badge: '3 Ativos',
    },
    {
      id: 'suppliers',
      label: 'Fornecedores EUA',
      icon: Building2,
      badge: 'Verificados',
    },
    {
      id: 'pitch',
      label: 'Apresentação SaaS',
      icon: Presentation,
      badge: 'Comercial',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      <div className="p-4 space-y-6">
        {/* App Title */}
        <div className="px-3 py-2 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
              HelpUS <span className="text-blue-400">FBA</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Suite v1.0 • US Market</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Navegação Principal
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Links Card */}
        <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ferramentas Conectadas</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Plataforma configurada para os ecossistemas da Amazon US e Prep Ninjas.
          </p>
          <div className="pt-1 flex flex-col space-y-1">
            <a
              href="https://sellercentral.amazon.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Seller Central US</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://dashboard.prepninjas.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Prep Ninjas Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>System Status</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Online</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
