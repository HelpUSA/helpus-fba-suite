'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DreStatement } from '@/lib/erpTypes';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  Globe2,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Building,
  ShieldCheck,
  Receipt,
  Scale
} from 'lucide-react';

export default function DrePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CONSOLIDATED' | 'US' | 'BR'>('CONSOLIDATED');
  const [ptaxRate, setPtaxRate] = useState<number>(5.75);
  const [isEditingPtax, setIsEditingPtax] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>('2026-10');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statements, setStatements] = useState<{
    us: DreStatement;
    br: DreStatement;
    consolidated: DreStatement;
  } | null>(null);

  useEffect(() => {
    fetchDre();
  }, [ptaxRate, period]);

  const fetchDre = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/finance/dre?period=${period}&ptax=${ptaxRate}`);
      if (res.ok) {
        const json = await res.json();
        setStatements(json.statements);
      }
    } catch (e) {
      console.error('Error fetching DRE:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatement = statements
    ? activeTab === 'CONSOLIDATED'
      ? statements.consolidated
      : activeTab === 'US'
      ? statements.us
      : statements.br
    : null;

  const currencySymbol = activeTab === 'US' ? '$' : 'R$';

  const exportCsv = () => {
    if (!currentStatement) return;
    const s = currentStatement;
    const rows = [
      ['Rubrica', 'Valor (' + s.currency + ')', '% Receita Bruta'],
      ['Receita Operacional Bruta', s.grossRevenue.toFixed(2), '100.0%'],
      ['(-) Deduções e Taxas de Marketplace', s.deductions.marketplaceFees.toFixed(2), ((s.deductions.marketplaceFees / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(-) Taxas de Fulfillment / Frete', s.deductions.fulfillmentFees.toFixed(2), ((s.deductions.fulfillmentFees / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(-) Impostos sobre Vendas', s.deductions.taxes.toFixed(2), ((s.deductions.taxes / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(=) Receita Operacional Líquida', s.netRevenue.toFixed(2), ((s.netRevenue / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(-) Custo das Mercadorias Vendidas (CMV/COGS)', s.cogs.toFixed(2), ((s.cogs / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(=) Lucro Bruto', s.grossProfit.toFixed(2), s.grossMarginPercent.toFixed(1) + '%'],
      ['(-) Despesas Operacionais (Prep/3PL)', s.operatingExpenses.prepFees.toFixed(2), ((s.operatingExpenses.prepFees / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(-) Armazenagem / Storage', s.operatingExpenses.storageFees.toFixed(2), ((s.operatingExpenses.storageFees / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(-) Frete Inbound / Transferência', s.operatingExpenses.inboundFreight.toFixed(2), ((s.operatingExpenses.inboundFreight / (s.grossRevenue || 1)) * 100).toFixed(1) + '%'],
      ['(=) Lucro Operacional Líquido (EBIT)', s.netOperatingIncome.toFixed(2), s.netMarginPercent.toFixed(1) + '%'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DRE_${activeTab}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Scale className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                DRE Financeiro & P&L Consolidado
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  FASE P1
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Demonstrativo de Resultado do Exercício com consolidação cambial PTAX e margens reais por país.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* PTAX Customizer */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400 mr-2 font-mono">PTAX USD/BRL:</span>
            {isEditingPtax ? (
              <input
                type="number"
                step="0.01"
                value={ptaxRate}
                onChange={(e) => setPtaxRate(parseFloat(e.target.value) || 5.75)}
                onBlur={() => setIsEditingPtax(false)}
                className="w-16 bg-slate-800 text-white font-mono rounded px-1.5 py-0.5 border border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingPtax(true)}
                className="font-mono font-bold text-blue-400 hover:text-blue-300 hover:underline"
                title="Clique para editar taxa de câmbio"
              >
                R$ {ptaxRate.toFixed(2)}
              </button>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-slate-200 cursor-pointer"
            >
              <option value="2026-10" className="bg-slate-900">Outubro 2026 (Competência Vigente)</option>
              <option value="2026-09" className="bg-slate-900">Setembro 2026</option>
              <option value="2026-YTD" className="bg-slate-900">Ano 2026 (YTD)</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchDre}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
            title="Recalcular DRE"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Country / Currency Tabs */}
      <div className="flex space-x-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('CONSOLIDATED')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'CONSOLIDATED'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Consolidado Global (BRL @ PTAX)</span>
        </button>
        <button
          onClick={() => setActiveTab('US')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'US'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🇺🇸</span>
          <span>Operação EUA (USD)</span>
        </button>
        <button
          onClick={() => setActiveTab('BR')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'BR'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🇧🇷</span>
          <span>Operação Brasil (BRL)</span>
        </button>
      </div>

      {/* KPI Cards */}
      {currentStatement && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Receita Bruta Total</span>
              <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white font-mono">
                {currencySymbol} {currentStatement.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Faturamento bruto registrado</p>
            </div>
          </div>

          {/* Gross Profit & Margin */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Lucro Bruto (Margem)</span>
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {currencySymbol} {currentStatement.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-500/90 mt-1 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {currentStatement.grossMarginPercent}% de margem bruta
              </p>
            </div>
          </div>

          {/* Deductions & COGS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Deduções + CMV</span>
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {currencySymbol} {(currentStatement.deductions.totalDeductions + currentStatement.cogs).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Custos diretos + taxas marketplace</p>
            </div>
          </div>

          {/* Net Operating Income */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Resultado Líquido (EBIT)</span>
              <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {currencySymbol} {currentStatement.netOperatingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-purple-400/90 mt-1 font-semibold">
                Margem Líquida Final: {currentStatement.netMarginPercent}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed DRE Table */}
      {currentStatement && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Demonstrativo Detalhado de Linhas do DRE</h2>
              <p className="text-xs text-slate-400">
                Padrão gerencial HelpUS com segregação de taxas de marketplace, custos logísticos 3PL e impostos.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Moeda: <span className="text-white font-bold">{currentStatement.currency}</span> | Câmbio PTAX:{' '}
              <span className="text-white font-bold">{currentStatement.ptaxRate.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Estrutura de Conta / Rubrica</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Valor ({currentStatement.currency})</th>
                  <th className="py-3.5 px-4 text-right font-semibold">% s/ Receita Bruta</th>
                  <th className="py-3.5 px-4 font-semibold">Classificação Contábil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {/* 1. Receita Operacional Bruta */}
                <tr className="bg-slate-900/30 font-semibold text-white">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>1. RECEITA OPERACIONAL BRUTA</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-blue-400">
                    {currencySymbol} {currentStatement.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">100.0%</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">Faturamento Comercial</td>
                </tr>

                {/* Deduções */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Taxas da Plataforma (Comissão Amazon 15% / ML 16%)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.marketplaceFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.marketplaceFees / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Dedução Comercial Direta</td>
                </tr>
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Logística e Fulfillment (FBA Pick & Pack / Braspress)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.fulfillmentFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.fulfillmentFees / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Frete de Expedição</td>
                </tr>
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Tributos Diretos s/ Venda (Simples Nacional / Sales Tax)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.taxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.taxes / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Impostos s/ Faturamento</td>
                </tr>

                {/* 2. Receita Operacional Líquida */}
                <tr className="bg-slate-900/50 font-semibold text-white">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span>2. RECEITA OPERACIONAL LÍQUIDA</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-cyan-400">
                    {currencySymbol} {currentStatement.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {((currentStatement.netRevenue / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">Subtotal Líquido</td>
                </tr>

                {/* 3. CMV / COGS */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Custo das Mercadorias Vendidas (CMV / Inbound Cost)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.cogs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.cogs / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Custo do Produto (NF-e/Invoice)</td>
                </tr>

                {/* 4. Lucro Bruto */}
                <tr className="bg-slate-900/50 font-semibold text-white">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>3. LUCRO BRUTO GERENCIAL</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-emerald-400">
                    {currencySymbol} {currentStatement.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {currentStatement.grossMarginPercent}%
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">Margem Bruta Industrial</td>
                </tr>

                {/* 5. Despesas Operacionais */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Taxas de Preparação e Etiquetagem (Prep Ninjas / Hub JPA)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.prepFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.operatingExpenses.prepFees / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">3PL Handling</td>
                </tr>
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Armazenagem Mensal e Estoque (FBA Storage)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.storageFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.operatingExpenses.storageFees / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Storage Fee</td>
                </tr>
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">
                    (-) Frete Inbound & Transferência Entre Armazéns
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.inboundFreight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.operatingExpenses.inboundFreight / (currentStatement.grossRevenue || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">Frete de Entrada Prorrateado</td>
                </tr>

                {/* 6. Lucro Operacional Líquido */}
                <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-bold text-white text-sm">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-emerald-300">4. LUCRO OPERACIONAL LÍQUIDO (EBIT)</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base">
                    {currencySymbol} {currentStatement.netOperatingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-base">
                    {currentStatement.netMarginPercent}%
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400/90 font-mono">Resultado Operacional Final</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Highlights Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria e Regras Fiscais Aplicadas</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Operação EUA (FBA):</strong> Sales Tax é retido e recolhido diretamente pela Amazon como Marketplace Facilitator, sem bitributação na fonte.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Operação Brasil (NF-e):</strong> Tributação parametrizada com Simples Nacional Anexo I (6% nominal) com crédito presumido e ICMS interestadual 12% via Braspress.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Consolidação Cambial:</strong> Conversão calculada ponta-a-ponta utilizando cotação PTAX homologada do Banco Central.</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm mb-3">
            <TrendingUp className="w-4 h-4" />
            <span>Resumo de Eficiência Logística HelpUS</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Hub 3PL Prep Ninjas (UT):</strong> Custo unitário de etiquetagem FNSKU amortizado a \$0.35/unidade em lotes mínimos de 50 caixas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Distribuição Local Bessa (PB):</strong> Triagem rápida no CD JPA viabiliza margem líquida superior a 40% nos produtos de alta rotatividade.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Rastreamento Transacional:</strong> Todas as ordens de venda refletem baixa instantânea nos estoques FBA e Braspress.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
