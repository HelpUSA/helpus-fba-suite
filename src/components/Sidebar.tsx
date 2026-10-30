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
  Sparkles,
  ExternalLink,
  X,
  FileText,
  Boxes
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  {item.flag ? (
                    <span className="text-sm shrink-0">{item.flag}</span>
                  ) : Icon ? (
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-800/80 text-blue-100 font-bold'
                        : 'bg-slate-800 text-slate-400'
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
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-800/80 text-blue-100 font-bold'
                        : 'bg-slate-800 text-slate-400'
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
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-white">{t.connectedTools}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {t.sidebarFooter}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 bg-slate-950 flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-slate-800 h-full z-10 shadow-2xl">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
