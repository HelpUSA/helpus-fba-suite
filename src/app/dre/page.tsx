'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AuditedDreStatement } from '@/lib/erpTypes';
import {
  TrendingUp,
  Percent,
  Calendar,
  Globe2,
  Download,
  RefreshCw,
  HelpCircle,
  Building,
  ShieldCheck,
  Scale,
  Lock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function DrePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CONSOLIDATED' | 'US' | 'BR'>('CONSOLIDATED');
  const [ptaxRate, setPtaxRate] = useState<number>(5.75);
  const [period, setPeriod] = useState<string>('2026-10');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<{ status: number; message: string } | null>(null);
  const [statements, setStatements] = useState<{
    us: AuditedDreStatement;
    br: AuditedDreStatement;
    consolidated: AuditedDreStatement;
  } | null>(null);

  const fetchDre = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const res = await fetch(`/api/finance/dre?period=${period}&ptax=${ptaxRate}`, {
        headers,
      });

      if (res.status === 403) {
        setErrorStatus({
          status: 403,
          message: 'Acesso restrito: Esta visão financeira exige credencial de Operador ou Master SuperAdmin.',
        });
        setStatements(null);
        return;
      }

      if (res.status === 503) {
        const data = await res.json();
        setErrorStatus({
          status: 503,
          message: data.message || 'DRE financeira em fase de homologação controlada P1 no ambiente de staging.',
        });
        setStatements(null);
        return;
      }

      if (res.ok) {
        const json = await res.json();
        setStatements(json.statements);
        if (json.statements?.consolidated?.fxRateApplied) {
          setPtaxRate(json.statements.consolidated.fxRateApplied);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorStatus({
          status: res.status,
          message: data.error || 'Falha ao carregar demonstrativo financeiro.',
        });
      }
    } catch (e: any) {
      console.error('Error fetching DRE:', e);
      setErrorStatus({
        status: 500,
        message: e.message || 'Erro de conexão com o servidor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDre();
  }, [period]);

  const currentStatement: AuditedDreStatement | null = statements
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
      ['Rubrica', 'Realizado (' + s.currency + ')', 'Estimado (' + s.currency + ')', 'Total (' + s.currency + ')', '% Receita Bruta'],
      ['Receita Operacional Bruta', s.grossRevenue.realizado.toFixed(2), s.grossRevenue.estimado.toFixed(2), s.grossRevenue.total.toFixed(2), '100.0%'],
      ['(-) Deduções e Taxas de Marketplace', s.deductions.marketplaceFees.realizado.toFixed(2), s.deductions.marketplaceFees.estimado.toFixed(2), s.deductions.marketplaceFees.total.toFixed(2), ((s.deductions.marketplaceFees.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(-) Taxas de Fulfillment / Frete', s.deductions.fulfillmentFees.realizado.toFixed(2), s.deductions.fulfillmentFees.estimado.toFixed(2), s.deductions.fulfillmentFees.total.toFixed(2), ((s.deductions.fulfillmentFees.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(-) Impostos sobre Vendas (DAS)', s.deductions.taxes.realizado.toFixed(2), s.deductions.taxes.estimado.toFixed(2), s.deductions.taxes.total.toFixed(2), ((s.deductions.taxes.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(=) Receita Operacional Líquida', s.netRevenue.realizado.toFixed(2), s.netRevenue.estimado.toFixed(2), s.netRevenue.total.toFixed(2), ((s.netRevenue.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(-) Custo das Mercadorias Vendidas (CMV/COGS)', s.cogs.realizado.toFixed(2), s.cogs.estimado.toFixed(2), s.cogs.total.toFixed(2), ((s.cogs.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(=) Lucro Bruto', s.grossProfit.realizado.toFixed(2), s.grossProfit.estimado.toFixed(2), s.grossProfit.total.toFixed(2), s.grossMarginPercent.toFixed(1) + '%'],
      ['(-) Despesas Operacionais (Prep Ninjas 3PL)', s.operatingExpenses.prepFees.realizado.toFixed(2), s.operatingExpenses.prepFees.estimado.toFixed(2), s.operatingExpenses.prepFees.total.toFixed(2), ((s.operatingExpenses.prepFees.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(-) Armazenagem / Storage FBA', s.operatingExpenses.storageFees.realizado.toFixed(2), s.operatingExpenses.storageFees.estimado.toFixed(2), s.operatingExpenses.storageFees.total.toFixed(2), ((s.operatingExpenses.storageFees.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(-) Frete Inbound & Transferência', s.operatingExpenses.inboundFreight.realizado.toFixed(2), s.operatingExpenses.inboundFreight.estimado.toFixed(2), s.operatingExpenses.inboundFreight.total.toFixed(2), ((s.operatingExpenses.inboundFreight.total / (s.grossRevenue.total || 1)) * 100).toFixed(1) + '%'],
      ['(=) Lucro Operacional Líquido (EBIT)', s.netOperatingIncome.realizado.toFixed(2), s.netOperatingIncome.estimado.toFixed(2), s.netOperatingIncome.total.toFixed(2), s.netMarginPercent.toFixed(1) + '%'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DRE_AUDITADA_${activeTab}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
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
                  FASE P1 — POSTGRESQL LEDGER
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Demonstrativo contábil com dupla segregação: <strong className="text-emerald-400">REALIZADO</strong> (transações confirmadas) e <strong className="text-amber-400">ESTIMADO</strong> (provisões operacionais).
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Competência:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent font-mono text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="2026-10" className="bg-slate-900 text-white">Outubro/2026</option>
              <option value="2026-11" className="bg-slate-900 text-white">Novembro/2026</option>
              <option value="ALL" className="bg-slate-900 text-white">Acumulado Total</option>
            </select>
          </div>

          <button
            onClick={exportCsv}
            disabled={!currentStatement}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition font-medium border border-slate-700 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={fetchDre}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fail-closed / Protected state notifications */}
      {errorStatus && (
        <div className={`p-6 rounded-2xl border ${
          errorStatus.status === 503
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            : errorStatus.status === 403
            ? 'bg-slate-900/90 border-slate-700 text-slate-200'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-start space-x-4">
            {errorStatus.status === 503 ? (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            ) : errorStatus.status === 403 ? (
              <Lock className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-base text-white">
                {errorStatus.status === 503
                  ? 'Ambiente de Produção Protegido (Ordem 045 — Fail-Closed)'
                  : errorStatus.status === 403
                  ? 'Autenticação Necessária para Acesso Contábil'
                  : 'Falha na Operação'}
              </h3>
              <p className="text-sm opacity-90">{errorStatus.message}</p>

              {errorStatus.status === 403 && (
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="password"
                    placeholder="Chave de API / Token Operador"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={fetchDre}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Autenticar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CONSOLIDATED')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'CONSOLIDATED'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Consolidado Global (BRL)</span>
        </button>

        <button
          onClick={() => setActiveTab('US')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'US'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>🇺🇸</span>
          <span>Amazon USA (USD)</span>
        </button>

        <button
          onClick={() => setActiveTab('BR')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'BR'
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>🇧🇷</span>
          <span>Brasil Multicanal (BRL)</span>
        </button>
      </div>

      {/* Statement Table */}
      {currentStatement && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Estrutura Analítica de Resultados (DRE P1)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {currentStatement.currency}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span>FX PTAX: <strong>{currentStatement.fxRateApplied.toFixed(4)}</strong> ({currentStatement.fxSource})</span>
              <span>Lançamentos: <strong>{currentStatement.auditSummary.totalEntries}</strong> ({currentStatement.auditSummary.realizadoEntries} Realizados, {currentStatement.auditSummary.estimadoEntries} Estimados)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Rubrica / Linha Contábil</th>
                  <th className="py-3 px-4 text-right">Realizado</th>
                  <th className="py-3 px-4 text-right">Estimado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">% Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {/* 1. Receita Operacional Bruta */}
                <tr className="bg-slate-950/30 text-white font-semibold">
                  <td className="py-3 px-4 text-emerald-400">1. RECEITA OPERACIONAL BRUTA</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                    {currencySymbol} {currentStatement.grossRevenue.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {currencySymbol} {currentStatement.grossRevenue.estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    {currencySymbol} {currentStatement.grossRevenue.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">100.0%</td>
                </tr>

                {/* Deduções */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">(-) Tarifas de Marketplace (Comissão)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    - {currencySymbol} {currentStatement.deductions.marketplaceFees.realizado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.deductions.marketplaceFees.estimado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.marketplaceFees.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.marketplaceFees.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">(-) Taxas de Fulfillment (FBA)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    - {currencySymbol} {currentStatement.deductions.fulfillmentFees.realizado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.deductions.fulfillmentFees.estimado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.fulfillmentFees.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.fulfillmentFees.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">(-) Impostos sobre Faturamento (Simples Nacional DAS)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    - {currencySymbol} {currentStatement.deductions.taxes.realizado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.deductions.taxes.estimado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.deductions.taxes.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.deductions.taxes.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                {/* 2. Receita Operacional Líquida */}
                <tr className="bg-slate-950/20 text-white font-semibold border-t border-slate-800">
                  <td className="py-3 px-4">2. RECEITA OPERACIONAL LÍQUIDA</td>
                  <td className="py-3 px-4 text-right font-mono text-white">
                    {currencySymbol} {currentStatement.netRevenue.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {currencySymbol} {currentStatement.netRevenue.estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white font-bold">
                    {currencySymbol} {currentStatement.netRevenue.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.netRevenue.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                {/* CMV */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">(-) Custo das Mercadorias Vendidas (CMV)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    - {currencySymbol} {currentStatement.cogs.realizado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.cogs.estimado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.cogs.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.cogs.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                {/* 3. Lucro Bruto */}
                <tr className="bg-emerald-950/10 text-emerald-300 font-semibold border-t border-slate-800">
                  <td className="py-3 px-4">3. LUCRO BRUTO</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                    {currencySymbol} {currentStatement.grossProfit.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {currencySymbol} {currentStatement.grossProfit.estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-300 font-bold">
                    {currencySymbol} {currentStatement.grossProfit.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    {currentStatement.grossMarginPercent}%
                  </td>
                </tr>

                {/* OpEx */}
                <tr className="text-slate-300">
                  <td className="py-2.5 px-4 pl-8 text-slate-400">(-) Despesas Prep Ninjas (3PL Hub)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.prepFees.realizado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.prepFees.estimado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                    - {currencySymbol} {currentStatement.operatingExpenses.prepFees.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {((currentStatement.operatingExpenses.prepFees.total / (currentStatement.grossRevenue.total || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                {/* 4. Lucro Operacional Líquido */}
                <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-bold text-white text-sm">
                  <td className="py-3.5 px-4 text-emerald-300">4. LUCRO OPERACIONAL LÍQUIDO (EBIT)</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                    {currencySymbol} {currentStatement.netOperatingIncome.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                    {currencySymbol} {currentStatement.netOperatingIncome.estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base">
                    {currencySymbol} {currentStatement.netOperatingIncome.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base">
                    {currentStatement.netMarginPercent}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Critérios de Auditoria e Imutabilidade (P1)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Tabela PostgreSQL Authoritative:</strong> Todos os lançamentos são lidos diretamente do <code className="text-emerald-400">financial_ledger</code> com garantia de idempotência.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Segregação Estrita:</strong> Lançamentos estimados não se misturam aos realizados. Correções operacionais são feitas exclusivamente via estornos compensatórios (<code className="text-emerald-400">COMPENSATION_REVERSAL</code>).</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Políticas de Câmbio e Segurança</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Histórico PTAX:</strong> Taxas cambiais oficiais do Banco Central persistidas na tabela <code className="text-blue-400">fx_rates</code> por data de competência.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Proteção Fail-Closed:</strong> Endpoint <code className="text-blue-400">/api/finance/dre</code> bloqueado contra acessos anônimos (HTTP 403) e fail-closed em produção (HTTP 503).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
