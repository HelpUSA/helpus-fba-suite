'use client';

import React from 'react';
import { Language, i18n } from '@/data/i18n';
import { MapPin, Phone, Mail, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  const t = i18n[language];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 px-6 text-slate-400 text-xs select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
        {/* Col 1: Branding & Description */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <img
              src="/images/helpus_logo.png"
              alt="HelpUS LLC"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="font-bold text-white text-base tracking-tight">
              HelpUS <span className="text-blue-400">LLC</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            {t.footerDesc}
          </p>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>US Registered Entity • EIN Active</span>
          </div>
        </div>

        {/* Col 2: Registered Business Address */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.footerAddressTitle}</span>
          </h4>
          <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
            {t.footerAddress}
          </p>
          <div className="text-[10px] text-slate-500 font-mono">
            State of Alabama • Gulf Shores, AL 36542
          </div>
        </div>

        {/* Col 3: Official Contact */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.footerContactTitle}</span>
          </h4>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center space-x-2 text-slate-300">
              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{t.footerPhone}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
              <a href="mailto:contact@helpusllc.com" className="hover:text-blue-400 transition">
                {t.footerEmail}
              </a>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Globe className="w-3 h-3 text-slate-500 shrink-0" />
              <a href="https://fba.helpusbr.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                https://fba.helpusbr.com
              </a>
            </div>
          </div>
        </div>

        {/* Col 4: Ecosystem & Partners */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
            Ecosystem Partners
          </h4>
          <ul className="space-y-2 font-mono text-[11px]">
            <li>
              <a
                href="https://sellercentral.amazon.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 transition flex items-center space-x-1"
              >
                <span>Amazon Seller Central US</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://dashboard.prepninjas.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition flex items-center space-x-1"
              >
                <span>Prep Ninjas Logistics</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
        <div>
          {t.footerRights}
        </div>
        <div className="flex items-center space-x-4">
          <span>Terms of Service</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>FBA Intelligence Suite v1.0</span>
        </div>
      </div>
    </footer>
  );
}
