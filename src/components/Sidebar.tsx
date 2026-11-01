'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  Calculator,
  Truck,
  Building2,
  Search,
  X,
  FileText,
  Boxes,
  Scale
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, isMobileMenuOpen, setIsMobileMenuOpen } = useLanguage();

  const operationsItems = [
    {
      href: '/',
      label: t.navOverview,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/usa',
      label: t.navUSA,
      flag: '🇺🇸',
      badge: 'FBA',
      highlight: true,
    },
    {
      href: '/brasil',
      label: t.navBrasil,
      flag: '🇧🇷',
      badge: 'NF-e',
      highlight: true,
    },
  ];

  const toolsItems = [
    {
      href: '/dre',
      label: 'DRE Financeiro & P&L',
      icon: Scale,
      badge: 'P1',
      highlight: true,
    },
    {
      href: '/nfe',
      label: t.navNfe,
      icon: FileText,
      badge: 'XML',
      highlight: true,
    },
    {
      href: '/estoque',
      label: t.navEstoque,
      icon: Boxes,
      badge: 'MULTI',
      highlight: true,
    },
    {
      href: '/calc',
      label: t.navCalculator,
      icon: Calculator,
      badge: 'PRO',
    },
    {
      href: '/prep',
      label: t.navPrepTracker,
      icon: Truck,
      badge: '2',
    },
    {
      href: '/suppliers',
      label: t.navSuppliers,
      icon: Building2,
      badge: 'B2B',
    },
    {
      href: '/deals',
      label: t.navDealFinder,
      icon: Search,
      badge: null,
    },
  ];

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full select-none">
      <div className="p-4 space-y-6">
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              {t.mainNav}
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Section 1: Active Operations */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            {t.operationsNav}
          </div>
          {operationsItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {Icon ? (
                    <Icon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-sm">{item.flag}</span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      item.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section 2: Management Tools */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            {t.toolsNav}
          </div>
          {toolsItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      item.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Status FBA</span>
            <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% OPERACIONAL</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Base HelpUS</span>
            <span className="text-slate-200 font-mono font-medium">Bessa / JPA</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0 min-h-[calc(100vh-4rem)]">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Visible when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
