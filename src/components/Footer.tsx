'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-10 pb-8 px-4 sm:px-6 text-slate-400 text-xs select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
        {/* Col 1: Branding & Description */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src="/images/helpus_logo.png"
              alt="HelpUS LLC"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="font-bold text-white text-base tracking-tight">
              HelpUS <span className="text-blue-400">Global</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            {t.footerDesc}
          </p>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>HelpUS LLC (US) • HelpUS Brasil (MEI)</span>
          </div>
        </div>

        {/* Col 2: Registered Business Address (US) */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{t.footerAddressTitle}</span>
          </h4>
          <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
            {t.footerAddress}
          </p>
          <div className="text-[10px] text-slate-500 font-mono">
            Filial BR: Bessa, João Pessoa/PB (CEP 58035-360)
          </div>
        </div>

        {/* Col 3: Official Contact */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.footerContactTitle}</span>
          </h4>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">Tel:</span>
              <span>{t.footerPhone}</span>
            </div>
            <div className="text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">E-mail:</span>
              <a href={`mailto:${t.footerEmail}`} className="text-blue-400 hover:underline">
                {t.footerEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Col 4: Quick Portals */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Hubs Conectados</span>
          </h4>
          <div className="space-y-2 text-[11px]">
            <a
              href="https://sellercentral.amazon.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Amazon Seller Central (US)</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>
            <a
              href="https://dashboard.prepninjas.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Prep Ninjas Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>
            <a
              href="https://www.braspress.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Braspress Cargas</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] font-mono">
        <div>{t.footerRights}</div>
        <div className="flex items-center space-x-4">
          <span>Amazon SP-API Connected</span>
          <span>•</span>
          <span>Prep Ninjas Hub</span>
        </div>
      </div>
    </footer>
  );
}
