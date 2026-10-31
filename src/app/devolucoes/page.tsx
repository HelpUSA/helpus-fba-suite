'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ReturnRecord, WarehouseCode, WAREHOUSES } from '@/lib/erpTypes';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  PackageX,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Boxes,
  DollarSign,
  X
} from 'lucide-react';

export default function DevolucoesPage() {
  const { t } = useLanguage();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RESTOCKED' | 'CLAIMED' | 'DISPOSED'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sku, setSku] = useState<string>('HU-SIL-CABLE-FBA-2026');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<ReturnRecord['reason']>('CUSTOMER_REMORSE');
  const [disposition, setDisposition] = useState<ReturnRecord['disposition']>('SELLABLE');
  const [warehouse, setWarehouse] = useState<WarehouseCode>('WH-USA-FBA-RYY2');
  const [status, setStatus] = useState<ReturnRecord['status']>('RESTOCKED');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [reimbursementAmount, setReimbursementAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [retRes, invRes] = await Promise.all([
        fetch('/api/returns'),
        fetch('/api/inventory'),
      ]);

      if (retRes.ok) {
        const retData = await retRes.json();
        setReturns(retData.returns || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventoryItems(invData.items || []);
        if (invData.items?.length > 0 && !sku) {
          setSku(invData.items[0].sku);
        }
      }
    } catch (e) {
      console.error('Error loading returns data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const selectedProduct = inventoryItems.find((p) => p.sku === sku);
    const productTitle = selectedProduct ? selectedProduct.title : sku;
    const currency = warehouse.startsWith('WH-USA') ? 'USD' : 'BRL';

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          productTitle,
          quantity: Number(quantity),
          reason,
          disposition,
          warehouse,
          status,
          orderNumber: orderNumber || undefined,
          reimbursementAmount: Number(reimbursementAmount),
          currency,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Devolução / Avaria registrada e processada no ERP!' });
        setIsModalOpen(false);
        setNotes('');
        setOrderNumber('');
        setReimbursementAmount(0);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao registrar devolução' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha de comunicação' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered returns
  const filteredReturns = returns.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.orderNumber && item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'RESTOCKED') return item.status === 'RESTOCKED';
    if (activeFilter === 'CLAIMED') return item.status === 'REIMBURSEMENT_CLAIMED' || item.status === 'REIMBURSED';
    if (activeFilter === 'DISPOSED') return item.status === 'DISPOSED';
    return true;
  });

  // KPI calculations
  const totalReturnsCount = returns.reduce((sum, r) => sum + r.quantity, 0);
  const restockedCount = returns.filter((r) => r.status === 'RESTOCKED').reduce((sum, r) => sum + r.quantity, 0);
  const totalReimbursedUsd = returns
    .filter((r) => r.currency === 'USD' && r.reimbursementAmount)
    .reduce((sum, r) => sum + (r.reimbursementAmount || 0), 0);
  const damagesCount = returns
    .filter((r) => r.disposition === 'DEFECTIVE' || r.disposition === 'CARRIER_DAMAGED')
    .reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <RotateCcw className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Gestão de Devoluções & Logística Reversa
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  FASE P3
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Controle de devoluções de clientes, avarias por transportadora, sinistros e reembolsos FBA/3PL.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Devolução / Avaria</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Devoluções</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">{totalReturnsCount} un</div>
            <p className="text-xs text-slate-500 mt-1">Registros de retorno totalizados</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reintegrados ao Estoque</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{restockedCount} un</div>
            <p className="text-xs text-emerald-500/90 mt-1 font-semibold">Itens vendáveis restabelecidos</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avarias & Sinistros</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-amber-400 font-mono">{damagesCount} un</div>
            <p className="text-xs text-slate-500 mt-1">Itens danificados ou defeituosos</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reembolsos Amazon FBA</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-purple-400 font-mono">
              ${totalReimbursedUsd.toFixed(2)}
            </div>
            <p className="text-xs text-purple-400/90 mt-1 font-semibold">Recuperado via FBA Reimbursements</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex space-x-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas as Ocorrências
          </button>
          <button
            onClick={() => setActiveFilter('RESTOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'RESTOCKED' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reintegrados ao Estoque
          </button>
          <button
            onClick={() => setActiveFilter('CLAIMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'CLAIMED' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reivindicação FBA
          </button>
          <button
            onClick={() => setActiveFilter('DISPOSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'DISPOSED' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Descarte / Sucata
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, pedido ou título..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
                <th className="py-3 px-4 font-semibold">Data / ID</th>
                <th className="py-3 px-4 font-semibold">Produto / SKU</th>
                <th className="py-3 px-4 font-semibold">Armazém</th>
                <th className="py-3 px-4 font-semibold">Motivo</th>
                <th className="py-3 px-4 font-semibold">Condição</th>
                <th className="py-3 px-4 text-center font-semibold">Qtd</th>
                <th className="py-3 px-4 font-semibold">Status / Ação</th>
                <th className="py-3 px-4 text-right font-semibold">Reembolso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum registro de devolução ou avaria encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-200">{r.returnDate.slice(0, 10)}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[100px]">{r.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[200px]" title={r.productTitle}>
                        {r.productTitle}
                      </div>
                      <div className="font-mono text-[10px] text-blue-400">{r.sku}</div>
                      {r.orderNumber && (
                        <div className="text-[10px] text-slate-500">Pedido: {r.orderNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-slate-300">
                        {WAREHOUSES[r.warehouse]?.name || r.warehouse}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300">
                        {r.reason === 'CUSTOMER_REMORSE'
                          ? 'Arrependimento'
                          : r.reason === 'CUSTOMER_DEFECT'
                          ? 'Defeito Declarado'
                          : r.reason === 'DAMAGED_CARRIER'
                          ? 'Avaria Transporte'
                          : r.reason === 'WRONG_ITEM'
                          ? 'Item Divergente'
                          : 'Extraviado em Trânsito'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          r.disposition === 'SELLABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.disposition === 'SELLABLE' ? 'VENDÁVEL (LACRADO)' : 'DANIFICADO / AVARIA'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">{r.quantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          r.status === 'RESTOCKED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : r.status === 'REIMBURSED'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : r.status === 'REIMBURSEMENT_CLAIMED'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {r.status === 'RESTOCKED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {r.status === 'REIMBURSEMENT_CLAIMED' && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {r.reimbursementAmount && r.reimbursementAmount > 0
                        ? `${r.currency === 'USD' ? '$' : 'R$'} ${r.reimbursementAmount.toFixed(2)}`
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                Registrar Devolução / Avaria de Estoque
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Produto / SKU Alvo</label>
                <select
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {inventoryItems.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Armazém de Recepção</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value as WarehouseCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.values(WAREHOUSES).map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} ({w.name.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quantidade Devolvida</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Motivo do Retorno</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CUSTOMER_REMORSE">Arrependimento de Compra</option>
                    <option value="CUSTOMER_DEFECT">Defeito Informado pelo Cliente</option>
                    <option value="DAMAGED_CARRIER">Avaria no Transporte / Sinistro</option>
                    <option value="WRONG_ITEM">Item Divergente / Erro Envio</option>
                    <option value="LOST_IN_TRANSIT">Extraviado pela Transportadora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condição Física</label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SELLABLE">Vendável (Item intacto/lacrado)</option>
                    <option value="DEFECTIVE">Defeituoso (Não vendável)</option>
                    <option value="CARRIER_DAMAGED">Danificado pela Transportadora</option>
                    <option value="CUSTOMER_DAMAGED">Danificado pelo Cliente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status da Tratativa</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="RESTOCKED">Restocado ao Inventário Vendável</option>
                    <option value="RECEIVED">Recebido p/ Inspeção</option>
                    <option value="REIMBURSEMENT_CLAIMED">Reivindicação de Reembolso FBA Aberta</option>
                    <option value="REIMBURSED">Reembolsado pela Plataforma</option>
                    <option value="DISPOSED">Descartado / Sucata</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor Reembolsado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={reimbursementAmount}
                    onChange={(e) => setReimbursementAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nº do Pedido de Origem</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ex: 114-8392019-2819201"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações da Inspeção</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes da conferência visual, LPN ou protocolo de sinistro..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Gravando...' : 'Confirmar e Atualizar Estoque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
