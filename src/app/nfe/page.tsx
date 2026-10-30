'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { NfeData, parseNfeXml } from '@/lib/nfeParser';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Truck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function NfeImportPage() {
  const { t } = useLanguage();
  const [xmlContent, setXmlContent] = useState<string>('');
  const [parsedNfe, setParsedNfe] = useState<NfeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [storedInvoices, setStoredInvoices] = useState<any[]>([]);

  // Load existing invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.ok) {
        setStoredInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error('Error fetching invoices:', e);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processXmlText(text);
    };
    reader.readAsText(file);
  };

  const processXmlText = async (text: string) => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Client-side quick parse to display preview
      const parsed = parseNfeXml(text);
      if (!parsed.chaveAcesso) {
        throw new Error('Chave de acesso da NF-e não identificada no arquivo XML.');
      }
      setParsedNfe(parsed);

      // Send to server API to store and update inventory
      const res = await fetch('/api/nfe/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xmlContent: text }),
      });

      const result = await res.json();
      if (result.ok) {
        setMessage({
          text: result.result?.message || 'NF-e importada com sucesso no ERP e integrada ao estoque!',
          type: 'success',
        });
        fetchInvoices();
      } else {
        setMessage({
          text: result.message || 'Erro ao gravar NF-e no sistema.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setMessage({
        text: `Falha ao processar arquivo XML: ${err?.message || 'Formato inválido'}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      const res = await fetch('/api/nfe/sample');
      const data = await res.json();

      if (data.ok && data.xmlContent) {
        processXmlText(data.xmlContent);
      } else {
        setMessage({
          text: 'Arquivo modelo não localizado.',
          type: 'error',
        });
      }
    } catch (e: any) {
      setMessage({
        text: 'Erro ao carregar NF-e modelo: ' + e?.message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyChave = () => {
    if (parsedNfe?.chaveAcesso) {
      navigator.clipboard.writeText(parsedNfe.chaveAcesso);
      alert('Chave copiada para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Módulo de Compras & Entrada Fiscal
              </span>
              <span className="text-xs text-slate-400 font-mono">• SEFAZ Modelo 55</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-400" />
              <span>Importador de XML da NF-e & Invoices</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Dê entrada automática de mercadorias no ERP a partir do XML oficial da SEFAZ. O sistema calcula automaticamente o frete rateado e o custo efetivo unitário de cada item.
            </p>
          </div>

          {/* Quick Pilot Sample Button */}
          <button
            onClick={handleLoadSample}
            disabled={isLoading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>⚡ Carregar NF-e Nativos (#00002509)</span>
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        className="p-8 border-2 border-dashed border-slate-700/80 hover:border-blue-500/80 bg-slate-900/60 rounded-3xl text-center space-y-3 transition flex flex-col items-center justify-center cursor-pointer group"
      >
        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">Arraste seu arquivo XML da NF-e aqui</div>
          <div className="text-xs text-slate-400">ou clique para selecionar do seu computador (.xml da SEFAZ)</div>
        </div>

        <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition border border-slate-700">
          <span>Escolher Arquivo XML</span>
          <input
            type="file"
            accept=".xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </label>
      </div>

      {/* Status / Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* DANFE Visual Preview */}
      {parsedNfe && (
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <h2 className="text-lg font-bold text-white">
                  DANFE Simplificada — NF-e Nº {parsedNfe.numeroNF} (Série {parsedNfe.serie})
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono text-[10px]">
                  Autorizada
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Data de Emissão: {parsedNfe.dataEmissao} • Natureza: {parsedNfe.naturezaOperacao}
              </p>
            </div>

            <button
              onClick={copyChave}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg flex items-center gap-1.5 transition border border-slate-700 w-fit"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Chave SEFAZ</span>
            </button>
          </div>

          {/* Access Key Strip */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono break-all text-slate-300 flex items-center justify-between gap-2">
            <div>
              <span className="text-slate-500">Chave de Acesso: </span>
              <strong className="text-blue-400">{parsedNfe.chaveAcesso}</strong>
            </div>
          </div>

          {/* Parties: Emitente & Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Emitente */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-slate-400">
              <div className="text-slate-200 font-bold text-sm flex items-center gap-1.5 font-sans">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Emitente / Fabricante</span>
              </div>
              <div className="text-white font-semibold">{parsedNfe.emitente.razaoSocial}</div>
              <div>CNPJ: <strong className="text-slate-300">{parsedNfe.emitente.cnpj}</strong></div>
              <div>{parsedNfe.emitente.logradouro}, {parsedNfe.emitente.numero} - {parsedNfe.emitente.bairro}</div>
              <div>{parsedNfe.emitente.municipio}/{parsedNfe.emitente.uf} • CEP {parsedNfe.emitente.cep}</div>
            </div>

            {/* Destinatario */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-slate-400">
              <div className="text-slate-200 font-bold text-sm flex items-center gap-1.5 font-sans">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Destinatário / HelpUS</span>
              </div>
              <div className="text-white font-semibold">{parsedNfe.destinatario.razaoSocial}</div>
              <div>CNPJ/CPF: <strong className="text-slate-300">{parsedNfe.destinatario.cnpjCpf}</strong></div>
              <div>{parsedNfe.destinatario.logradouro}, {parsedNfe.destinatario.numero} - {parsedNfe.destinatario.bairro}</div>
              <div>{parsedNfe.destinatario.municipio}/{parsedNfe.destinatario.uf} • CEP {parsedNfe.destinatario.cep}</div>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-sans">Valor dos Produtos</span>
              <span className="text-xl font-bold text-white">R$ {parsedNfe.totais.valorProdutos.toFixed(2)}</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-sans">Frete Destacado</span>
              <span className="text-xl font-bold text-blue-400">R$ {parsedNfe.totais.valorFrete.toFixed(2)}</span>
              <div className="text-[10px] text-slate-500">{parsedNfe.transporte.transportadora}</div>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
              <span className="text-[11px] text-emerald-400 block font-sans font-bold">Valor Total da NF-e</span>
              <span className="text-xl font-extrabold text-emerald-400">R$ {parsedNfe.totais.valorNota.toFixed(2)}</span>
              <div className="text-[10px] text-emerald-500">Pago à vista</div>
            </div>
          </div>

          {/* Analytical Items Table with Effective Unit Cost */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              Itens da Nota Fiscal ({parsedNfe.itens.length} produtos adicionados ao estoque)
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Descrição do Produto</th>
                    <th className="py-3 px-4">NCM</th>
                    <th className="py-3 px-4 text-center">Qtd</th>
                    <th className="py-3 px-4">Custo Fab. (un)</th>
                    <th className="py-3 px-4">Frete Rateado (un)</th>
                    <th className="py-3 px-4 text-right">Custo Efetivo Final (un)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {parsedNfe.itens.map((item) => (
                    <tr key={item.itemNum} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500">{item.itemNum}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {item.xProd}
                        <div className="text-[10px] text-slate-500 font-mono">Cód: {item.cProd}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.NCM}</td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {item.qCom} {item.uCom}
                      </td>
                      <td className="py-3 px-4 text-slate-300">R$ {item.vUnCom.toFixed(2)}</td>
                      <td className="py-3 px-4 text-blue-400">
                        +R$ {(item.vFrete / item.qCom).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        R$ {item.effectiveUnitCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History of Processed Invoices */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Documentos Fiscais & Invoices no Banco de Dados</span>
            </h2>
            <p className="text-xs text-slate-400">Histórico de entradas registradas na persistência do ERP</p>
          </div>
          <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            {storedInvoices.length} registros
          </span>
        </div>

        <div className="space-y-3">
          {storedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{inv.moeda === 'BRL' ? '🇧🇷' : '🇺🇸'}</span>
                  <span className="font-bold text-white font-sans">
                    {inv.tipo === 'NFE_BR' ? `NF-e Nº ${inv.numero}` : `Invoice ${inv.numero}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {inv.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span>Fornecedor: <strong className="text-slate-200">{inv.fornecedorNome}</strong></span>
                  <span> • </span>
                  <span>Data: {inv.dataEmissao?.slice(0, 10)}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-sm font-extrabold text-white">
                  {inv.moeda === 'BRL' ? 'R$' : '$'} {inv.valorTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  {inv.itensCount} itens faturados
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
