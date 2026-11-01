'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { WarehouseCode, WAREHOUSES, SaleOrder } from '@/lib/erpTypes';
import {
  Boxes,
  Truck,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building,
  RefreshCw,
  PlusCircle,
  PackageCheck,
  TrendingUp,
  Clock,
  ShieldCheck,
  X,
  ShoppingCart,
  DollarSign,
  Sparkles,
  Layers,
  ArchiveRestore
} from 'lucide-react';

export default function EstoqueMultiArmazemPage() {
  const { t } = useLanguage();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'US' | 'BR'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Single Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [fromWh, setFromWh] = useState<WarehouseCode>('WH-BR-TRANSIT-BRASPRESS');
  const [toWh, setToWh] = useState<WarehouseCode>('WH-BR-LOCAL-JPA');
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferNotes, setTransferNotes] = useState<string>('');
  
  // Sale Order Modal State
  const [isSaleModalOpen, setIsSaleModalOpen] = useState<boolean>(false);
  const [saleSku, setSaleSku] = useState<string>('');
  const [saleMarketplace, setSaleMarketplace] = useState<'Amazon US' | 'Amazon BR' | 'Mercado Livre'>('Amazon BR');
  const [saleQty, setSaleQty] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(79.90);
  const [customerCity, setCustomerCity] = useState<string>('João Pessoa / PB');
  
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.ok) {
        setInventoryItems(data.items || []);
        setWarehouses(data.warehouseSummary || []);
        setMovements(data.recentMovements || []);
        setOrders(data.orders || []);
        if (data.items?.length > 0 && !selectedSku) {
          setSelectedSku(data.items[0].sku);
          setSaleSku(data.items[0].sku);
        }
      }
    } catch (e) {
      console.error('Error loading inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          sku: selectedSku,
          fromWarehouse: fromWh,
          toWarehouse: toWh,
          quantity: transferQty,
          notes: transferNotes || 'Transferência realizada pelo operador ERP.',
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setActionMessage({ text: data.message || 'Transferência efetuada com sucesso!', type: 'success' });
        setIsTransferModalOpen(false);
        fetchInventory();
      } else {
        setActionMessage({ text: data.message || 'Erro ao realizar transferência.', type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: 'Falha na comunicação com a API: ' + err?.message, type: 'error' });
    }
  };

  const handleBatchReceiveBraspress = async () => {
    if (!confirm('Deseja confirmar o descarregamento de todos os itens em trânsito da Braspress na Base Bessa?')) return;
    try {
      setIsLoading(true);
      setActionMessage(null);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_receive_braspress' }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ text: data.message, type: 'success' });
        fetchInventory();
      } else {
        setActionMessage({ text: data.message, type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: 'Erro ao descarregar Braspress: ' + err?.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchReceiveFba = async () => {
    try {
      setIsLoading(true);
      setActionMessage(null);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_receive_fba' }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ text: data.message, type: 'success' });
        fetchInventory();
      } else {
        setActionMessage({ text: data.message, type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: 'Erro ao auditar FBA: ' + err?.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: saleSku,
          quantity: saleQty,
          marketplace: saleMarketplace,
          customerCity,
          salePrice: salePrice,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setActionMessage({ text: data.message || 'Pedido faturado e estoque baixado!', type: 'success' });
        setIsSaleModalOpen(false);
        fetchInventory();
      } else {
        setActionMessage({ text: data.message || 'Erro ao faturar venda.', type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: 'Erro de comunicação: ' + err?.message, type: 'error' });
    }
  };

  const openTransferForProduct = (sku: string, defaultFrom: WarehouseCode, defaultTo: WarehouseCode) => {
    setSelectedSku(sku);
    setFromWh(defaultFrom);
    setToWh(defaultTo);
    setIsTransferModalOpen(true);
  };

  const openSaleForProduct = (item: any) => {
    setSaleSku(item.sku);
    setSaleMarketplace(item.marketplace === 'Amazon US' ? 'Amazon US' : 'Amazon BR');
    setSalePrice(item.salePrice);
    setCustomerCity(item.marketplace === 'Amazon US' ? 'Orlando, FL' : 'Recife / PE');
    setSaleQty(1);
    setIsSaleModalOpen(true);
  };

  // Filter items by selected country
  const filteredItems = inventoryItems.filter((it) => {
    if (activeFilter === 'US') return it.marketplace === 'Amazon US';
    if (activeFilter === 'BR') return it.marketplace === 'Amazon BR';
    return true;
  });

  // Calculate pending transit units in Braspress
  const braspressTransitUnits = inventoryItems
    .filter((it) => it.marketplace === 'Amazon BR')
    .reduce((sum, it) => sum + (it.balances['WH-BR-TRANSIT-BRASPRESS'] || 0), 0);

  // Calculate ready units in JPA base
  const jpaBaseUnits = inventoryItems
    .filter((it) => it.marketplace === 'Amazon BR')
    .reduce((sum, it) => sum + (it.balances['WH-BR-LOCAL-JPA'] || 0), 0);

  // Calculate ready units in Amazon FBA
  const fbaActiveUnits = inventoryItems
    .filter((it) => it.marketplace === 'Amazon US')
    .reduce((sum, it) => sum + (it.balances['WH-USA-FBA-RYY2'] || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" />
                Controle de Estoque & WMS Multi-Armazém
              </span>
              <span className="text-xs text-slate-400 font-mono">• EUA (Prep Ninjas / RYY2) & Brasil (Braspress / Bessa)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Gestão & Conciliação de Estoque Multi-Armazém</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Monitore e movimente o saldo físico em tempo real entre os 4 armazéns operacionais. Realize recebimento em lote de carretas rodoviárias e audite a disponibilidade Prime nos EUA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={fetchInventory}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/25 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Simular Venda Outbound</span>
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transferir Unidades</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Message Feedback */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-mono ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 1-Click Operational Conciliation Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Ações Rápidas de Conciliação em Lote (1-Click WMS)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dê entrada definitiva de cargas em trânsito ou audite centros FBA diretamente com um clique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Receive Braspress Batch */}
          <button
            onClick={handleBatchReceiveBraspress}
            disabled={isLoading || braspressTransitUnits === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition ${
              braspressTransitUnits > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-200" />
            <span>🇧🇷 Receber Carga Braspress na Base Bessa</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono">
              {braspressTransitUnits} un
            </span>
          </button>

          {/* FBA Audit / Check-in */}
          <button
            onClick={handleBatchReceiveFba}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/25 border border-blue-500/30 transition"
          >
            <ShieldCheck className="w-4 h-4 text-blue-200" />
            <span>🇺🇸 Auditar / Confirmar Amazon FBA (RYY2)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 font-mono">
              {fbaActiveUnits} un ativas
            </span>
          </button>
        </div>
      </div>

      {/* 4 Warehouse Nodes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(WAREHOUSES).map(([code, wh]) => {
          const summary = warehouses.find((w) => w.code === code);
          const totalUnits = summary?.totalUnits || 0;
          const totalValue = summary?.totalValue || 0;
          const isUS = wh.country === 'US';

          return (
            <div
              key={code}
              className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{isUS ? '🇺🇸' : '🇧🇷'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {code}
                  </span>
                </div>
                <div className="font-bold text-white text-sm">{wh.name}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{wh.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Saldo Físico</span>
                  <span className="text-lg font-extrabold text-white">
                    {totalUnits} <span className="text-xs text-slate-500 font-normal">un</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Custo Imobilizado</span>
                  <span className="text-xs font-bold text-slate-300">
                    {isUS ? '$' : 'R$'} {totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Items by Warehouse Table */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-400" />
              <span>Posição Consolidada de Estoque por Produto</span>
            </h2>
            <p className="text-xs text-slate-400">Distribuição quantitativa de cada SKU nos 4 centros de armazenamento</p>
          </div>

          {/* Operational Country Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({inventoryItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('US')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeFilter === 'US' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸 EUA</span>
            </button>
            <button
              onClick={() => setActiveFilter('BR')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeFilter === 'BR' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇧🇷 Brasil</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Produto & SKU</th>
                <th className="py-3 px-4 text-center">Prep Ninjas (UT)</th>
                <th className="py-3 px-4 text-center">Amazon RYY2 (GA)</th>
                <th className="py-3 px-4 text-center">Braspress (Trânsito)</th>
                <th className="py-3 px-4 text-center">Base Bessa (PB)</th>
                <th className="py-3 px-4 text-center">Total Geral</th>
                <th className="py-3 px-4 text-right">Ações WMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredItems.map((item) => {
                const isUS = item.marketplace === 'Amazon US';
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white font-sans text-xs truncate max-w-xs">{item.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span>{isUS ? '🇺🇸' : '🇧🇷'} SKU: {item.sku}</span>
                            <span>• Custo: {item.currency === 'USD' ? '$' : 'R$'} {item.unitCost?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Prep Ninjas */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded ${item.balances['WH-USA-PREP'] > 0 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-600'}`}>
                        {item.balances['WH-USA-PREP'] || 0}
                      </span>
                    </td>

                    {/* Amazon RYY2 */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded ${item.balances['WH-USA-FBA-RYY2'] > 0 ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-600'}`}>
                        {item.balances['WH-USA-FBA-RYY2'] || 0}
                      </span>
                    </td>

                    {/* Braspress */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded ${item.balances['WH-BR-TRANSIT-BRASPRESS'] > 0 ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-600'}`}>
                        {item.balances['WH-BR-TRANSIT-BRASPRESS'] || 0}
                      </span>
                    </td>

                    {/* Base Bessa */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded ${item.balances['WH-BR-LOCAL-JPA'] > 0 ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-600'}`}>
                        {item.balances['WH-BR-LOCAL-JPA'] || 0}
                      </span>
                    </td>

                    {/* Total Stock */}
                    <td className="py-3.5 px-4 text-center font-bold text-white text-sm">
                      {item.totalStock} un
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => openSaleForProduct(item)}
                          className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 rounded-lg text-[11px] font-semibold border border-emerald-500/30 transition flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Vender</span>
                        </button>
                        {isUS ? (
                          <button
                            onClick={() => openTransferForProduct(item.sku, 'WH-USA-PREP', 'WH-USA-FBA-RYY2')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition"
                          >
                            Mover FBA
                          </button>
                        ) : (
                          <button
                            onClick={() => openTransferForProduct(item.sku, 'WH-BR-TRANSIT-BRASPRESS', 'WH-BR-LOCAL-JPA')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition"
                          >
                            Entrada JPA
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales Outbound Table */}
      {orders.length > 0 && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <span>Histórico de Pedidos de Venda Faturados (Outbound)</span>
              </h2>
              <p className="text-xs text-slate-400">Vendas que geraram baixa automática no inventário e apuração de lucro líquido</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-emerald-300 font-bold">
              {orders.length} pedidos registrados
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Pedido / Marketplace</th>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4 text-center">Qtd Baixada</th>
                  <th className="py-3 px-4">Armazém Origem</th>
                  <th className="py-3 px-4">Destino / Cliente</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-right">Margem Líquida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{ord.marketplace}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 font-sans truncate max-w-xs">{ord.productTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {ord.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {ord.quantity} un
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {ord.warehouseSource}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {ord.customerCity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {ord.marketplace === 'Amazon US' ? '$' : 'R$'} {ord.salePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      +{ord.marketplace === 'Amazon US' ? '$' : 'R$'} {ord.grossProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movements Log */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Livro Razão de Movimentações (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-400">Registro transacional de todas as entradas fiscais, transferências WMS e saídas por venda</p>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {movements.map((mov) => {
            const isSale = mov.type === 'SALE';
            const isTransfer = mov.type === 'TRANSFER';
            return (
              <div
                key={mov.id}
                className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white font-sans">{mov.productTitle}</span>
                    <span className="text-slate-500">({mov.sku})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSale
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isTransfer
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {mov.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {mov.fromWarehouse && <span>De: <strong className="text-slate-300">{mov.fromWarehouse}</strong> &rarr; </span>}
                    {mov.toWarehouse && <span>Para: <strong className="text-emerald-400">{mov.toWarehouse}</strong> • </span>}
                    <span>{mov.notes}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span
                    className={`text-sm font-extrabold ${
                      isSale ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isSale ? `-${mov.quantity}` : `+${mov.quantity}`} un
                  </span>
                  <div className="text-[10px] text-slate-500">{mov.timestamp?.slice(0, 16).replace('T', ' ')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Transfer Stock between Warehouses */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <span>Transferência de Estoque Manual</span>
              </h2>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Produto (SKU)</label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.title} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Armazém Origem</label>
                  <select
                    value={fromWh}
                    onChange={(e) => setFromWh(e.target.value as WarehouseCode)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 text-[11px]"
                  >
                    {Object.entries(WAREHOUSES).map(([code, wh]) => (
                      <option key={code} value={code}>{wh.name.split(' ')[0]} ({code.split('-')[1]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Armazém Destino</label>
                  <select
                    value={toWh}
                    onChange={(e) => setToWh(e.target.value as WarehouseCode)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 text-[11px]"
                  >
                    {Object.entries(WAREHOUSES).map(([code, wh]) => (
                      <option key={code} value={code}>{wh.name.split(' ')[0]} ({code.split('-')[1]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Quantidade a Transferir</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Justificativa / Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Entrega Braspress confirmada na filial JPA"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 text-xs font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow transition"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sale Outbound Simulator */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <span>Simulador de Venda & Baixa Automática</span>
              </h2>
              <button
                onClick={() => setIsSaleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSale} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Produto a Faturar</label>
                <select
                  value={saleSku}
                  onChange={(e) => {
                    setSaleSku(e.target.value);
                    const prod = inventoryItems.find((p) => p.sku === e.target.value);
                    if (prod) {
                      setSalePrice(prod.salePrice);
                      setSaleMarketplace(prod.marketplace === 'Amazon US' ? 'Amazon US' : 'Amazon BR');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.title} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Canal de Venda</label>
                  <select
                    value={saleMarketplace}
                    onChange={(e) => setSaleMarketplace(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 text-[11px]"
                  >
                    <option value="Amazon US">Amazon US (FBA)</option>
                    <option value="Amazon BR">Amazon BR (DBA)</option>
                    <option value="Mercado Livre">Mercado Livre (Envios)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={saleQty}
                    onChange={(e) => setSaleQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Preço Venda Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-sans font-medium mb-1">Cidade Destino</label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                <span className="text-slate-300 font-bold block mb-1">Armazém de Baixa:</span>
                {saleMarketplace === 'Amazon US' ? (
                  <span>🇺🇸 Dedução imediata do Fulfillment Center <strong>WH-USA-FBA-RYY2</strong>.</span>
                ) : (
                  <span>🇧🇷 Dedução física do polo logístico <strong>WH-BR-LOCAL-JPA (Base Bessa)</strong>.</span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow transition"
                >
                  Faturar & Despachar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
