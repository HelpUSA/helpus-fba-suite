'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDictionary, i18n } from '@/data/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('helpus_fba_language') as Language;
      if (saved && (saved === 'pt' || saved === 'en' || saved === 'es')) {
        setLanguageState(saved);
      }
    } catch {
      // ignore localstorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('helpus_fba_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const t = i18n[language] || i18n.pt;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
