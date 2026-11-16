'use client';

import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Tag,
  Image as ImageIcon,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PackageCheck,
  Sparkles,
  CheckCircle2,
  Download,
  Target,
  Ban,
} from 'lucide-react';

interface KeywordItem {
  term: string;
  matchType: 'EXACT' | 'PHRASE';
  suggestedBid: number;
  intent: string;
}

const HIGH_INTENT_KEYWORDS: KeywordItem[] = [
  { term: 'reusable silicone cable ties', matchType: 'EXACT', suggestedBid: 0.34, intent: 'Altíssima conversão (busca exata do produto)' },
  { term: 'silicone cord organizer straps', matchType: 'EXACT', suggestedBid: 0.32, intent: 'Comprador buscando organização de cabos' },
  { term: 'rubber twist ties for cords', matchType: 'EXACT', suggestedBid: 0.32, intent: 'Substituto direto de velcro/plástico' },
  { term: 'cable management straps 20 pack', matchType: 'EXACT', suggestedBid: 0.32, intent: 'Busca específica pelo kit de 20 unidades' },
  { term: 'silicone wire ties reusable', matchType: 'EXACT', suggestedBid: 0.30, intent: 'Alta intenção técnica e doméstica' },
  { term: 'charger cord organizer ties', matchType: 'PHRASE', suggestedBid: 0.30, intent: 'Organizador de cabos de celular/USB' },
  { term: 'silicone cable straps', matchType: 'PHRASE', suggestedBid: 0.28, intent: 'Descoberta qualificada de médio alcance' },
  { term: 'cord wraps for appliances', matchType: 'PHRASE', suggestedBid: 0.28, intent: 'Uso em eletrodomésticos e escritório' },
];

const NEGATIVE_KEYWORDS = [
  'plastic zip ties',
  'nylon cable ties 1000 pack',
  'stainless steel zip ties',
  'metal cable ties',
  'velcro roll bulk',
  'adhesive cord clips',
  'wall mount cable raceway',
  'heavy duty industrial',
];

const CATALOG_PHOTOS = [
  { file: '1.jpg', title: 'Slot 1 — Imagem Principal (Fundo Branco Puro)', role: 'MAIN IMAGE (Obrigatória no topo)', recommended: true },
  { file: '2.jpg', title: 'Slot 2 — Infográfico de Benefícios & Flexibilidade', role: 'Carrossel Principal #2', recommended: true },
  { file: '3.jpg', title: 'Slot 3 — Close-up de Textura e Trava Dupla', role: 'Carrossel Principal #3', recommended: true },
  { file: '4.jpg', title: 'Slot 4 — Dimensões Exatas e Elasticidade', role: 'Carrossel Principal #4', recommended: true },
  { file: '5.jpg', title: 'Slot 5 — Aplicação em Cabos USB e Escritório', role: 'Carrossel Principal #5', recommended: true },
  { file: '6.jpg', title: 'Slot 6 — Resistência Térmica e Lavabilidade', role: 'Carrossel Principal #6', recommended: true },
  { file: '7.jpg', title: 'Slot 7 — Kit Completo 20 Unidades Multi-Uso', role: 'Carrossel Principal #7', recommended: true },
  { file: '8.jpg', title: 'Foto 8 — Organização de Cabos de Cozinha/Eletros', role: 'Ativo Extra / Teste A/B', recommended: false },
  { file: '9.jpg', title: 'Foto 9 — Comparativo Silicone vs Velcro Comum', role: 'Ativo Extra / Teste A/B', recommended: false },
  { file: '10.jpg', title: 'Foto 10 — Uso em Viagem e Mochila Tech', role: 'Ativo Extra / Teste A/B', recommended: false },
  { file: '11.jpg', title: 'Foto 11 — Visão Geral da Cartela de Cores', role: 'Ativo Extra / Catálogo', recommended: false },
  { file: '11-1.jpg', title: 'Foto 11-1 — Detalhe Variação Ângulo A', role: 'Ativo Complementar', recommended: false },
  { file: '11-2.jpg', title: 'Foto 11-2 — Detalhe Variação Ângulo B', role: 'Ativo Complementar', recommended: false },
  { file: '11-3.jpg', title: 'Foto 11-3 — Detalhe Variação Ângulo C', role: 'Ativo Complementar', recommended: false },
  { file: '11-4.jpg', title: 'Foto 11-4 — Detalhe Variação Ângulo D', role: 'Ativo Complementar', recommended: false },
  { file: '12.jpg', title: 'Foto 12 — Cenário Lifestyle Home Office', role: 'Ativo Lifestyle', recommended: false },
  { file: '13.jpg', title: 'Foto 13 — Selo Compacto de Especificação', role: 'Miniatura / Detalhe', recommended: false },
  { file: '14.jpg', title: 'Foto 14 — Demonstração de Fechamento Seguro', role: 'Ativo Explicativo', recommended: false },
  { file: '15.jpg', title: 'Foto 15 — Uso Doméstico e Fechamento de Sacos', role: 'Ativo Multiuso', recommended: false },
  { file: '16.jpg', title: 'Foto 16 — Composição Final Kit 20-Pack', role: 'Ativo de Fechamento', recommended: false },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'ppc' | 'coupon' | 'photos' | 'simulator'>('ppc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  // Interactive Simulator States (defaulting to the audited 50-unit pilot)
  const [simPpcUnits, setSimPpcUnits] = useState<number>(15);
  const [simCouponUnits, setSimCouponUnits] = useState<number>(20);
  const [simCpc, setSimCpc] = useState<number>(0.32);
  const [simCr, setSimCr] = useState<number>(10);
  const [simCouponDiscount, setSimCouponDiscount] = useState<number>(1.0);
  const [includeExtraPackaging, setIncludeExtraPackaging] = useState<boolean>(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Audited deterministic calculation for the 50-unit lot already at Amazon via Prep Ninjas
  const simResult = useMemo(() => {
    const totalUnits = 50;
    const clampedPpc = Math.min(totalUnits, Math.max(0, simPpcUnits));
    const clampedCoupon = Math.min(totalUnits - clampedPpc, Math.max(0, simCouponUnits));
    const organicFullUnits = totalUnits - clampedPpc - clampedCoupon;

    const fullPrice = 12.99;
    const promoPrice = Math.max(1, fullPrice - simCouponDiscount);

    const grossRevenue = (clampedPpc + organicFullUnits) * fullPrice + clampedCoupon * promoPrice;

    // Amazon Fees
    const fbaFeeTotal = totalUnits * 4.11; // $205.50
    const referralFullUnit = Number((fullPrice * 0.15).toFixed(2)); // $1.95
    const referralPromoUnit = Number((promoPrice * 0.15).toFixed(2)); // $1.80
    const referralTotal = (clampedPpc + organicFullUnits) * referralFullUnit + clampedCoupon * referralPromoUnit;

    // Marketing Costs inside Seller Central
    const clicks = simCr > 0 ? Math.round(clampedPpc / (simCr / 100)) : 0;
    const ppcSpend = clicks * simCpc;
    const couponFixedFee = clampedCoupon > 0 ? 5.0 : 0;
    const couponVariableFee = clampedCoupon > 0 ? clampedCoupon * (promoPrice * 0.025) : 0;
    const couponFeesTotal = Number((couponFixedFee + couponVariableFee).toFixed(2));

    // Net Payout deposited by Amazon into HelpUS LLC Bank Account
    const amazonNetPayout = grossRevenue - fbaFeeTotal - referralTotal - ppcSpend - couponFeesTotal;

    // Already paid costs (Sunk/Historical cash deployed for this 50-unit batch)
    const cogsTotal = totalUnits * 1.25; // $62.50
    const prepNinjasTotal = totalUnits * 1.50; // $75.00
    const inboundTotal = totalUnits * 0.80; // $40.00
    const extraPackagingTotal = includeExtraPackaging ? totalUnits * 0.25 : 0; // $12.50 optional hold
    const alreadyPaidTotal = cogsTotal + prepNinjasTotal + inboundTotal + extraPackagingTotal;

    const projectedOperatingProfit = amazonNetPayout - alreadyPaidTotal;

    return {
      totalUnits,
      clampedPpc,
      clampedCoupon,
      organicFullUnits,
      fullPrice,
      promoPrice,
      grossRevenue,
      fbaFeeTotal,
      referralTotal,
      clicks,
      ppcSpend,
      couponFeesTotal,
      amazonNetPayout,
      alreadyPaidTotal,
      projectedOperatingProfit,
    };
  }, [simPpcUnits, simCouponUnits, simCpc, simCr, simCouponDiscount, includeExtraPackaging]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Banner: Product & Real Inventory Status */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <PackageCheck className="w-3.5 h-3.5" />
                50 UNIDADES NO GALPÃO FBA AMAZON (ETIQUETADAS PELA PREP NINJAS)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ASIN: B0HLTXWCV7
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                SKU: HU-SIL-CABLE-FBA-2026
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Megaphone className="w-7 h-7 text-emerald-400 shrink-0" />
              Central de Configuracão de Marketing & PPC — Lote Piloto (50 Un.)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Painel de simulação e parametrização (<code>SIMULATION_ONLY</code>) para o <strong>Amazon Seller Central</strong> do produto{' '}
              <span className="text-emerald-400 font-semibold">
                Reusable Silicone Cable Ties 20-Pack Cord Management Straps
              </span>
              . Lote atual fixado exclusivamente no <strong>Cenário A (Prep Ninjas, 50 unidades)</strong>; o Cenário B aplica-se somente a cotações de reposições futuras. A cobrança de anúncios PPC e cupons depende do perfil e método de faturamento configurado no Seller Central (dedução em saldo ou cartão cadastrado).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <a
              href="https://sellercentral.amazon.com/advertising/campaign-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              <span>Abrir Campaign Manager</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://sellercentral.amazon.com/coupons"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <span>Abrir Painel de Cupons</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 4 Summary Financial Cards for the 50-Unit Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>VENDAS BRUTAS (50 UN.)</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">USD 629.50</div>
            <div className="text-[11px] text-slate-400 mt-1">
              30 un. × $12.99 + 20 un. c/ cupom × $11.99
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
              <span>ORÇAMENTO MARKETING (INTERNO)</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">USD 59.00</div>
            <div className="text-[11px] text-slate-400 mt-1">
              PPC: $48.00 (Teto $50) + Taxas Cupom: $11.00
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
              <span>REPASSE AMAZON ESTIMADO / NÃO RECEBIDO</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">+USD 270.50</div>
            <div className="text-[11px] text-emerald-200/80 mt-1">
              SIMULATION_ONLY • Antes de liquidação e faturamento real
            </div>
          </div>

          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
              <span>LUCRO OPERACIONAL PROJETADO</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">+USD 93.00</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Após repor os $177.50 já pagos (Produto + Prep Ninjas + Frete)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ppc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'ppc'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>1. Configurar Anúncios PPC ($48 / Teto $50)</span>
        </button>

        <button
          onClick={() => setActiveTab('coupon')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'coupon'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>2. Configurar Cupom $1.00 OFF (20 Resgates)</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'photos'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>3. Galeria das 20 Fotos Prontas (Catálogo)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'simulator'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>4. Simulador Interativo & Auditoria (50 Un.)</span>
        </button>
      </div>

      {/* TAB 1: PPC CONFIGURATION */}
      {activeTab === 'ppc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign 1: Automatic Discovery */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  CAMPANHA 1 DE 2 — AUTOMÁTICA
                </span>
                <span className="text-xs font-mono text-slate-400">Orçamento: USD 2.50 / dia</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Sponsored Products — Auto Discovery (Descoberta)
              </h2>
              <p className="text-xs text-slate-300">
                Não exige marca registrada. O algoritmo da Amazon exibe seu produto automaticamente para buscas equivalentes e páginas de concorrentes mais caros.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nome da Campanha:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-400 font-mono font-bold">
                      HU-SP-AUTO-B0HLTXWCV7-PILOT50
                    </code>
                    <button
                      onClick={() => handleCopy('HU-SP-AUTO-B0HLTXWCV7-PILOT50', 'camp1')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Copiar nome"
                    >
                      {copiedId === 'camp1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Produto / ASIN:</span>
                  <span className="font-mono text-white font-semibold">B0HLTXWCV7 (SKU: HU-SIL-CABLE-FBA-2026)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Targeting (Segmentação):</span>
                  <span className="font-semibold text-white">Automatic Targeting</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Bidding Strategy (Estratégia):</span>
                  <span className="font-semibold text-emerald-400">Dynamic bids - down only (Apenas reduzir)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Lances por Grupo Automático:</span>
                  <span className="font-mono text-white">
                    Close: <b>$0.32</b> | Loose: <b>$0.24</b> | Subst: <b>$0.28</b> | Compl: <b>$0.20</b>
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Orçamento Diário (Daily Budget):</span>
                  <span className="font-mono font-bold text-emerald-400">USD 2.50 / dia (10 dias = USD 25.00)</span>
                </div>
              </div>
            </div>

            {/* Campaign 2: Manual High-Intent Keywords */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  CAMPANHA 2 DE 2 — MANUAL ALTA INTENÇÃO
                </span>
                <span className="text-xs font-mono text-slate-400">Orçamento: USD 2.50 / dia</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Sponsored Products — Exact & Phrase High-Intent
              </h2>
              <p className="text-xs text-slate-300">
                Focada exclusivamente em termos de compradores prontos para fechar pedido de organizadores de cabos de silicone reutilizáveis.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nome da Campanha:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-400 font-mono font-bold">
                      HU-SP-EXACT-B0HLTXWCV7-PILOT50
                    </code>
                    <button
                      onClick={() => handleCopy('HU-SP-EXACT-B0HLTXWCV7-PILOT50', 'camp2')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Copiar nome"
                    >
                      {copiedId === 'camp2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Targeting (Segmentação):</span>
                  <span className="font-semibold text-white">Manual Targeting &rarr; Keyword Targeting</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Bidding Strategy (Estratégia):</span>
                  <span className="font-semibold text-emerald-400">Dynamic bids - down only (Apenas reduzir)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Lance Máximo de Segurança (CPC):</span>
                  <span className="font-mono text-white font-bold">USD 0.28 a USD 0.34 (Abaixo do Break-even de $0.338)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Orçamento Diário (Daily Budget):</span>
                  <span className="font-mono font-bold text-emerald-400">USD 2.50 / dia (Total 2 Campanhas = USD 5.00/dia)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Table + Negative Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Banco de Palavras-Chave de Alta Conversão (Campanha Manual)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Copie e cole no campo &ldquo;Enter List&rdquo; de Keywords na criação da Campanha 2.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      HIGH_INTENT_KEYWORDS.map((k) => k.term).join('\n'),
                      'all-kw'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition"
                >
                  {copiedId === 'all-kw' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>8 Keywords Copiadas!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Todas as Keywords</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Keyword (Termo de Busca)</th>
                      <th className="py-2.5 px-3">Match Type</th>
                      <th className="py-2.5 px-3">Lance (Bid)</th>
                      <th className="py-2.5 px-3">Justificativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {HIGH_INTENT_KEYWORDS.map((kw) => (
                      <tr key={kw.term} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-semibold text-white">{kw.term}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              kw.matchType === 'EXACT'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {kw.matchType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          ${kw.suggestedBid.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{kw.intent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Negative Keywords Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span>Negative Keywords</span>
                </h3>
                <button
                  onClick={() => handleCopy(NEGATIVE_KEYWORDS.join('\n'), 'neg-kw')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition"
                >
                  {copiedId === 'neg-kw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'neg-kw' ? 'Copiado!' : 'Copiar Lista'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Cole em <strong>Negative Keyword Targeting (Negative Phrase)</strong> nas duas campanhas para evitar cliques de quem procura lacre plástico descartável ou fita metálica:
              </p>
              <div className="space-y-1.5">
                {NEGATIVE_KEYWORDS.map((neg) => (
                  <div
                    key={neg}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300"
                  >
                    <span>{neg}</span>
                    <span className="text-[10px] text-slate-500">NEGATIVE PHRASE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Execution Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Checklist Rápido de Ativação no Amazon Seller Central
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { id: 'step1', label: '1. Subir as 7 fotos recomendadas no ASIN B0HLTXWCV7' },
                { id: 'step2', label: '2. Criar o Cupom de $1.00 OFF (Aba 2 ao lado)' },
                { id: 'step3', label: '3. Criar Campanha 1 (Auto Discovery — $2.50/dia)' },
                { id: 'step4', label: '4. Criar Campanha 2 (Manual Exact — $2.50/dia)' },
                { id: 'step5', label: '5. Inserir Lista de Negative Keywords nas 2 campanhas' },
              ].map((step) => (
                <button
                  key={step.id}
                  onClick={() => toggleCheck(step.id)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition flex items-start gap-2.5 ${
                    checklist[step.id]
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checklist[step.id]}
                    readOnly
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>{step.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COUPON CONFIGURATION */}
      {activeTab === 'coupon' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SELO VERDE &ldquo;SAVE $1.00&rdquo; NA BUSCA DA AMAZON
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Configuração Exata do Cupom Promocional (Regra Amazon US Pós-Jun/2025)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Acesse no Seller Central: <strong>Advertising &rarr; Coupons &rarr; Create a new coupon</strong> e preencha exatamente com os dados abaixo:
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center shrink-0">
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Prévia na Busca da Amazon</div>
              <div className="mt-1 inline-block bg-emerald-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded">
                Save $1.00
              </div>
              <div className="text-[11px] text-slate-300 mt-1">with coupon (Preço final: $11.99)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-white">Campos do Formulário no Seller Central</h3>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">1. Buscar Produto (ASIN / SKU):</span>
                <div className="flex items-center gap-2">
                  <code className="text-emerald-400 font-mono font-bold">B0HLTXWCV7</code>
                  <button
                    onClick={() => handleCopy('B0HLTXWCV7', 'cp-asin')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {copiedId === 'cp-asin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">2. Tipo de Desconto (Discount Type):</span>
                <span className="font-bold text-white">Money Off (Desconto em Dólar)</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">3. Valor do Desconto (Discount Amount):</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">USD 1.00</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">4. Limite por Cliente (Redemption Limit):</span>
                <span className="font-semibold text-white">Yes — Limit to one per customer</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">5. Título do Cupom (Coupon Title):</span>
                <div className="flex items-center gap-2">
                  <code className="text-emerald-400 font-mono">
                    Save $1.00 on Reusable Silicone Cable Ties 20-Pack
                  </code>
                  <button
                    onClick={() =>
                      handleCopy('Save $1.00 on Reusable Silicone Cable Ties 20-Pack', 'cp-title')
                    }
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {copiedId === 'cp-title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">6. Duração Recomendada:</span>
                <span className="font-semibold text-white">14 dias (Desativar ao completar 20 resgates)</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Auditoria de Custos do Cupom (20 Unidades)</h3>
              <p className="text-slate-400 leading-relaxed">
                Conforme a tabela vigente da Amazon US (atualizada em junho/2025), a plataforma cobra uma taxa fixa única de <strong>USD 5.00</strong> por campanha de cupom + <strong>2.5%</strong> sobre o valor das vendas com cupom:
              </p>

              <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço Cheio de Catálogo:</span>
                  <span className="text-white">USD 12.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Desconto Concedido ao Cliente:</span>
                  <span className="text-amber-400">-USD 1.00 (Cliente paga USD 11.99)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxa Fixa da Campanha (20 resgates):</span>
                  <span className="text-slate-300">USD 5.00 ($0.25 / un.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxa Variável 2.5% (20 × $11.99):</span>
                  <span className="text-slate-300">USD 6.00 ($0.30 / un.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Economia na Comissão 15% da Amazon:</span>
                  <span className="text-emerald-400">+USD 3.00 (+$0.15 / un.)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-white">Total Taxas da Plataforma de Cupom:</span>
                  <span className="text-emerald-400">USD 11.00 no lote</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 20 PHOTOS GALLERY */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Galeria Oficial de Fotos de Marketing & Catálogo (20 Imagens Prontas)
                </h2>
                <p className="text-xs text-slate-400">
                  As 7 primeiras fotos marcadas em verde compõem o carrossel principal recomendado em{' '}
                  <strong>Inventory &rarr; Manage All Inventory &rarr; B0HLTXWCV7 &rarr; Edit &rarr; Images</strong>.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Custo de Produção: USD 0.00 (Ativo Próprio)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATALOG_PHOTOS.map((photo) => (
                <div
                  key={photo.file}
                  className={`rounded-xl overflow-hidden border flex flex-col justify-between transition ${
                    photo.recommended
                      ? 'bg-slate-950 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={`/images/marketing/cable-ties/${photo.file}`}
                        alt={photo.title}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      {photo.recommended && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow">
                          RECOMENDADA
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {photo.role}
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">{photo.title}</div>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <a
                      href={`/images/marketing/cable-ties/${photo.file}`}
                      download={`B0HLTXWCV7_${photo.file}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar ({photo.file})</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE 50-UNIT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">
                Parâmetros de Simulação (Lote Fixo: 50 Un.)
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste os controles abaixo para simular variações de cliques, vendas com cupom e CPC nas 50 unidades já estocadas na Amazon.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Vendas via Anúncio PPC (Sem Cupom):</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.clampedPpc} un.</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={simPpcUnits}
                  onChange={(e) => setSimPpcUnits(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Vendas com Cupom ($1.00 OFF):</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.clampedCoupon} un.</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50 - simResult.clampedPpc}
                  value={simResult.clampedCoupon}
                  onChange={(e) => setSimCouponUnits(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Vendas Orgânicas a Preço Cheio ($12.99): <strong>{simResult.organicFullUnits} unidades</strong>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Custo Médio por Clique (CPC):</span>
                  <span className="font-mono font-bold text-emerald-400">${simCpc.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={0.60}
                  step={0.01}
                  value={simCpc}
                  onChange={(e) => setSimCpc(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Taxa de Conversão Esperada (CR %):</span>
                  <span className="font-mono font-bold text-emerald-400">{simCr}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={simCr}
                  onChange={(e) => setSimCr(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeExtraPackaging}
                    onChange={(e) => setIncludeExtraPackaging(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                  <span className="text-slate-300">
                    Incluir provisão extra de embalagem ($0.25/un = $12.50) além da fatura Prep Ninjas ($1.50/un)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Demonstrativo Simulado das 50 Unidades (Prep Ninjas Realizado)
              </h2>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                SIMULATION_ONLY
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Faturamento Bruto ({simResult.clampedPpc + simResult.organicFullUnits}×$12.99 + {simResult.clampedCoupon}×$11.99):</span>
                <span className="font-bold text-white">+USD {simResult.grossRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Taxas Logísticas Amazon FBA (50 un. × $4.11):</span>
                <span>-USD {simResult.fbaFeeTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Comissão Amazon Referral Fee (15%):</span>
                <span>-USD {simResult.referralTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>(-) Gasto com Anúncios PPC ({simResult.clicks} cliques × ${simCpc.toFixed(2)}):</span>
                <span>-USD {simResult.ppcSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>(-) Taxas Plataforma de Cupons ($5 fixo + 2.5% variável):</span>
                <span>-USD {simResult.couponFeesTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-800 text-sm font-bold text-emerald-400">
                <span>= REPASSE AMAZON ESTIMADO / NÃO RECEBIDO (SIMULATION_ONLY):</span>
                <span>+USD {simResult.amazonNetPayout.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2 text-slate-400">
                <span>(-) Custos Já Pagos (Produto $62.50 + Prep Ninjas $75 + Frete $40{includeExtraPackaging ? ' + Emb. $12.50' : ''}):</span>
                <span>-USD {simResult.alreadyPaidTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-extrabold text-white">
                <span>= LUCRO OPERACIONAL PROJETADO (ANTES DE AJUSTES NÃO MODELADOS):</span>
                <span className={simResult.projectedOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {simResult.projectedOperatingProfit >= 0 ? '+' : ''}USD {simResult.projectedOperatingProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Nota de Governança e Transparência Técnica:</strong> Este painel opera em modo determinístico <code>SIMULATION_ONLY</code>. A aplicação web não executa cobranças automáticas nem altera o banco de dados contábil NeonDB. As ativações de campanhas e cupons ocorrem exclusivamente sob seu comando no portal Amazon Seller Central.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
