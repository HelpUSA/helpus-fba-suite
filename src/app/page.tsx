'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import DealFinderView from '@/components/DealFinderView';
import CalculatorView from '@/components/CalculatorView';
import PrepTrackerView from '@/components/PrepTrackerView';
import SuppliersView from '@/components/SuppliersView';
import SaaSPitchView from '@/components/SaaSPitchView';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_SHIPMENTS, ProductDeal } from '@/data/mockProducts';
import { Language } from '@/data/i18n';

export default function Home() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>('pt');
  const [products, setProducts] = useState<ProductDeal[]>(INITIAL_PRODUCTS);
  const [suppliers] = useState(INITIAL_SUPPLIERS);
  const [shipments] = useState(INITIAL_SHIPMENTS);

  const handleAddProduct = (newProduct: ProductDeal) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          productsCount={products.length}
          language={language}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {activeView === 'dashboard' && (
            <DashboardView
              products={products}
              shipments={shipments}
              setActiveView={setActiveView}
              language={language}
            />
          )}

          {activeView === 'deal-finder' && (
            <DealFinderView
              products={products}
              onAddProduct={handleAddProduct}
              setActiveView={setActiveView}
              language={language}
            />
          )}

          {activeView === 'calculator' && (
            <CalculatorView language={language} />
          )}

          {activeView === 'prep-tracker' && (
            <PrepTrackerView shipments={shipments} language={language} />
          )}

          {activeView === 'suppliers' && (
            <SuppliersView suppliers={suppliers} language={language} />
          )}

          {activeView === 'pitch' && (
            <SaaSPitchView language={language} />
          )}
        </main>
      </div>
    </div>
  );
}
