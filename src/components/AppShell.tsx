'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/context/LanguageContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
