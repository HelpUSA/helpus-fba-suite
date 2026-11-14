'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PRODUCTS } from '@/data/mockProducts';
import {
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Package,
  Sparkles,
  Eye,
  X,
  CheckCircle2
} from 'lucide-react';

export default function BrasilOperationPage() {
  const { t } = useLanguage();
  const [selectedFicha, setSelectedFicha] = useState<{ title: string; url: string } | null>(null);

  // Produtos Nativos do Brasil (Operação em João Pessoa - DBA)
  const nativosProducts = INITIAL_PRODUCTS.filter(
    (p) => p.marketplace === 'Amazon BR' && p.supplierName.includes('Nativos')
  );

  // Novos Produtos da Operação Skincare Remoto SP (FBA Cajamar)
  const skincareProducts = INITIAL_PRODUCTS.filter(
    (p) => p.marketplace === 'Amazon BR' && !p.supplierName.includes('Nativos')
  );

  const totalCost = nativosProducts.reduce((acc, p) => acc + (p.supplierPrice * (p.currentStock || 5)), 0) + 127.17; // produtos + frete Braspress
  const totalRevenue = nativosProducts.reduce((acc, p) => acc + (p.amazonPrice * (p.currentStock || 5)), 0);
  const totalProfit = nativosProducts.reduce((acc, p) => acc + (p.netProfit * (p.currentStock || 5)), 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl">🇧🇷</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
            HelpUS Brasil • CNPJ: 67.813.719/0001-12
          </span>
          <span className="text-xs text-slate-400 font-mono">• Mercado Nacional (DBA João Pessoa & FBA Cajamar/SP)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.brPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t.brPageSubtitle} Operação multicanal contemplando a linha própria de nutracêuticos em João Pessoa/PB e a nova infraestrutura remota de Skincare em São Paulo.
        </p>
      </div>

      {/* Grid: Partner & Inbound Invoice NF-e */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Supplier Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>{t.brPartnerTitle}</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] rounded-full font-mono font-bold">
              Homologado
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {t.brPartnerDesc}
          </p>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono space-y-1.5 text-slate-400">
            <div className="text-slate-300">CNPJ: <strong>47.693.854/0001-64</strong></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Vila Velha / ES - Polo Industrial</span>
            </div>
            <div>Pedido Piloto #3404 pago via PIX à vista (R$ 710,82 autenticado)</div>
          </div>

          <div className="pt-2">
            <a
              href="https://www.nativosdobrasil.com.br"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1.5 font-semibold"
            >
              <span>Acessar Portal do Fornecedor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Invoice & Braspress Freight Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>{t.brInvoiceTitle}</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[11px] rounded-full font-mono font-bold">
                Recebido & Em Estoque
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-slate-400">
                <div className="break-all text-[11px]">
                  {t.brInvoiceKeyLabel} <strong className="text-slate-200">32261047693854000164550010000025091235445528</strong>
                </div>
                <div>{t.brTotalInvoiceLabel} <strong className="text-emerald-400">R$ 710,82</strong> (Mercadorias + Frete)</div>
                <div>{t.brLogisticsPartner} <strong className="text-blue-400">Braspress Cargas (CTE-2509)</strong></div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Carga recebida íntegra em João Pessoa/PB (30 frascos)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Volume: <strong className="text-white">30 frascos (6 SKUs)</strong></span>
            <span className="text-emerald-400 font-bold">Modalidade: DBA (Delivery by Amazon)</span>
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Investimento Total do Lote Piloto</span>
          <div className="text-2xl font-bold text-white">R$ {totalCost.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">R$ 583,65 prod + R$ 127,17 frete Braspress</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Faturamento Bruto Projetado (DBA)</span>
          <div className="text-2xl font-bold text-blue-400">R$ {totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-blue-500/80">30 frascos nos novos preços oficiais</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-sans">Lucro Líquido Real</span>
          <div className="text-2xl font-bold text-emerald-400">+R$ {totalProfit.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-500/80">Margem média líquida de 48% a 92%</div>
        </div>
      </div>

      {/* Products Table (6 SKUs from NF-e & Amazon DBA Fichas) */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>{t.brProductsTableTitle} (Fichas Oficiais DBA João Pessoa)</span>
            </h2>
            <p className="text-xs text-slate-400">{t.brProductsTableSub} Com fotos em estúdio de alta definição e fichas técnicas nutricionais homologadas.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono font-bold">
            30 un Prontas para Expedição
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">{t.brColProduct}</th>
                <th className="py-3 px-4 text-center">{t.brColQty}</th>
                <th className="py-3 px-4">{t.brColUnitCost}</th>
                <th className="py-3 px-4">{t.brColEstSale}</th>
                <th className="py-3 px-4">Frete Rateado</th>
                <th className="py-3 px-4">{t.brColNetProfit}</th>
                <th className="py-3 px-4 text-center">Ficha Nutricional</th>
                <th className="py-3 px-4 text-right">{t.brColRoi}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {nativosProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-700 shrink-0 shadow-sm"
                      />
                      <div>
                        <div className="font-semibold text-white font-sans text-xs max-w-sm line-clamp-2">{p.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku} • NCM: {p.ncm} • DBA PB</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-200 font-bold">
                      {p.currentStock} un
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-bold">
                    R$ {p.supplierPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-blue-400 font-bold">
                    R$ {p.amazonPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    R$ {p.inboundShipping.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    +R$ {p.netProfit.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.fichaUrl ? (
                      <button
                        onClick={() => setSelectedFicha({ title: p.title, url: p.fichaUrl! })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-sans font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Tabela</span>
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px]">Em breve</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[11px]">
                      +{p.roiPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SECTION: Operação Brasil Skincare Remoto (São Paulo FBA Pipeline) */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Nova Expansão 100% Remota
              </span>
              <span className="text-xs text-slate-400 font-mono">• FBA Cajamar / São Paulo</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Operação Skincare & Cosméticos FBA Brasil (Hub SP)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Arquitetura logística remota: Fornecedor (Brás/Pari/SP) ➔ Prep Center Parceiro (GrinStore / PrepTag SP) ➔ Amazon FBA (Cajamar/Betim).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Domicílio Fiscal SP Homologado
            </span>
          </div>
        </div>

        {/* 3 Steps Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5 text-sm">
              <span>1. Fornecimento Pronta Entrega</span>
            </div>
            <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
              Compra faturada no CNPJ HelpUS na <strong>Distribuidora JCF</strong> (Brás) e <strong>RosaGiro</strong> com frete grátis em SP acima de R$ 350. Marcas campeãs: Max Love, Ruby Rose, Phállebeauty e Porán.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-blue-400 font-bold flex items-center gap-1.5 text-sm">
              <span>2. Prep Center & Kitting SP</span>
            </div>
            <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
              <strong>GrinStore</strong> (Vargem Grande Paulista) e <strong>PrepTag</strong> (Mooca): conferência cega, selagem térmica shrink wrap dos frascos, etiquetas FNSKU e consolidação em caixa master padronizada.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
              <span>3. Amazon FBA Prime Brasil</span>
            </div>
            <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
              Remessas enviadas direto para o CD da Amazon em Cajamar/SP. Venda com selo <strong>Prime</strong>, frete grátis nacional, atendimento ao cliente 24/7 e Buy Box prioritária.
            </p>
          </div>
        </div>

        {/* Products in Skincare Pipeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-slate-300">
            Kits e Produtos em Homologação de Lote Piloto:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skincareProducts.map((p) => (
              <div key={p.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded font-mono font-bold">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-white text-xs leading-snug font-sans">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Fornecedor: {p.supplierName}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Custo Kit (CMV)</span>
                    <span className="text-white font-bold">R$ {p.supplierPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Preço FBA</span>
                    <span className="text-blue-400 font-bold">R$ {p.amazonPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-sans font-bold">Lucro Líquido</span>
                    <span className="text-emerald-400 font-bold">+R$ {p.netProfit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Logística: <strong className="text-slate-300">FBA Cajamar</strong></span>
                  <span className="text-emerald-400 font-bold">ROI Estimado: +{p.roiPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Visualizador da Ficha Nutricional */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm truncate max-w-md">
                Tabela Nutricional: {selectedFicha.title}
              </h3>
              <button
                onClick={() => setSelectedFicha(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={selectedFicha.url}
                alt={selectedFicha.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>Artes oficiais fornecidas por Nativos do Brasil Ltda</span>
              <button
                onClick={() => setSelectedFicha(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-sans font-bold transition text-xs"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
