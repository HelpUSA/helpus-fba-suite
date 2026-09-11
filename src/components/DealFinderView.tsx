'use client';

import React, { useState } from 'react';
import { ProductDeal } from '@/data/mockProducts';
import {
  Search,
  Filter,
  Plus,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Calculator
} from 'lucide-react';

interface DealFinderViewProps {
  products: ProductDeal[];
  onAddProduct: (product: ProductDeal) => void;
  setActiveView: (view: string) => void;
}

export default function DealFinderView({ products, onAddProduct, setActiveView }: DealFinderViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRoi, setMinRoi] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product modal state
  const [newTitle, setNewTitle] = useState('');
  const [newAsin, setNewAsin] = useState('');
  const [newCategory, setNewCategory] = useState('Home & Kitchen');
  const [newSupplier, setNewSupplier] = useState('');
  const [newSupplierPrice, setNewSupplierPrice] = useState('3.50');
  const [newAmazonPrice, setNewAmazonPrice] = useState('16.99');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80');

  const categories = ['All', 'Home & Kitchen', 'Pet Supplies', 'Tools & Home Improvement', 'Office Products'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.asin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesRoi = p.roiPercent >= minRoi;
    return matchesSearch && matchesCategory && matchesRoi;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supPrice = parseFloat(newSupplierPrice) || 0;
    const amzPrice = parseFloat(newAmazonPrice) || 0;
    const refFee = amzPrice * 0.15;
    const fba = 4.20;
    const prep = 1.50;
    const inbound = 0.80;
    const net = amzPrice - refFee - fba - prep - inbound - supPrice;
    const roi = Math.round((net / (supPrice || 1)) * 100);

    const newDeal: ProductDeal = {
      id: `deal-${Date.now()}`,
      asin: newAsin || `B0${Math.floor(10000000 + Math.random() * 90000000)}`,
      title: newTitle || 'Novo Produto Minerado',
      category: newCategory,
      imageUrl: newImageUrl,
      supplierName: newSupplier || 'Fornecedor Atacadista EUA',
      supplierUrl: 'https://www.koleimports.com',
      supplierPrice: supPrice,
      amazonPrice: amzPrice,
      amazonReferralFee: parseFloat(refFee.toFixed(2)),
      fbaFee: fba,
      prepFee: prep,
      inboundShipping: inbound,
      netProfit: parseFloat(net.toFixed(2)),
      roiPercent: roi,
      isUngated: true,
      estMonthlySales: 350,
      bsrRank: 15200,
      status: 'Candidate',
    };

    onAddProduct(newDeal);
    setIsModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewAsin('');
    setNewSupplier('');
  };

  const exportToCSV = () => {
    const headers = ['ASIN,Title,Category,Supplier,BuyPrice,AmazonPrice,NetProfit,ROI%,Ungated'];
    const rows = filteredProducts.map(p =>
      `"${p.asin}","${p.title.replace(/"/g, '""')}","${p.category}","${p.supplierName}",${p.supplierPrice},${p.amazonPrice},${p.netProfit},${p.roiPercent}%,${p.isUngated}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `helpus_fba_deals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Deal Finder (Central de Mineração de Produtos)</span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono">
              {filteredProducts.length} Produtos
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Filtre fornecedores dos EUA, verifique a margem líquida descontando FBA + Prep Ninjas e veja a liberação (Ungated).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Produto Candidato</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="text-[10px] font-mono text-slate-400 uppercase mb-1 block">Buscar</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por ASIN, Nome ou Fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase mb-1 block">Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Min ROI */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
            <span>ROI Mínimo:</span>
            <span className="text-emerald-400 font-bold">{minRoi}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="10"
            value={minRoi}
            onChange={(e) => setMinRoi(Number(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Info summary */}
        <div className="flex items-center justify-end">
          <div className="text-right text-[11px] text-slate-400 font-mono">
            <div>Taxa Prep Ninjas: <strong className="text-white">$1.50/un</strong></div>
            <div>Taxa Ref. Amazon: <strong className="text-white">15%</strong></div>
          </div>
        </div>
      </div>

      {/* Main Deals Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3.5 px-4">Produto & ASIN</th>
                <th className="py-3.5 px-4">Fornecedor EUA</th>
                <th className="py-3.5 px-4">Custo / Venda</th>
                <th className="py-3.5 px-4">FBA + Prep Fees</th>
                <th className="py-3.5 px-4">Lucro Líq. / ROI</th>
                <th className="py-3.5 px-4">Liberação (Ungated)</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  {/* Product Details */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" />
                      <div className="space-y-1">
                        <div className="font-semibold text-white truncate max-w-xs">{p.title}</div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">ASIN: {p.asin}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                          <span>•</span>
                          <span>Est. {p.estMonthlySales} vds/mês</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="py-4 px-4 font-medium">
                    <a
                      href={p.supplierUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-200 hover:text-blue-400 flex items-center space-x-1"
                    >
                      <span>{p.supplierName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>

                  {/* Pricing */}
                  <td className="py-4 px-4 font-mono">
                    <div className="text-slate-300">Compra: <strong className="text-white">${p.supplierPrice.toFixed(2)}</strong></div>
                    <div className="text-slate-400">Venda: <strong className="text-blue-400">${p.amazonPrice.toFixed(2)}</strong></div>
                  </td>

                  {/* Fee Breakdown */}
                  <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                    <div>FBA: ${p.fbaFee.toFixed(2)}</div>
                    <div>Ref (15%): ${p.amazonReferralFee.toFixed(2)}</div>
                    <div>Prep: ${p.prepFee.toFixed(2)}</div>
                  </td>

                  {/* Net Profit & ROI */}
                  <td className="py-4 px-4 font-mono">
                    <div className="text-emerald-400 font-bold text-sm">+${p.netProfit.toFixed(2)}</div>
                    <div className="text-emerald-500 font-semibold text-[11px]">+{p.roiPercent}% ROI</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Lucro p/ lote (50un): <span className="text-emerald-400 font-bold">${(p.netProfit * 50).toFixed(0)}</span></div>
                  </td>

                  {/* Ungated status */}
                  <td className="py-4 px-4">
                    {p.isUngated ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>UNGATED (Liberado)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Requer Aprovação</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setActiveView('calculator')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium border border-slate-700 transition"
                    >
                      Simular Taxas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Product Candidate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Adicionar Produto Candidato</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Título do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Silicone Trivet Mats Pack of 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código ASIN</label>
                  <input
                    type="text"
                    required
                    placeholder="B08X1Q9Z88"
                    value={newAsin}
                    onChange={(e) => setNewAsin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Pet Supplies">Pet Supplies</option>
                    <option value="Tools & Home Improvement">Tools & Home Improvement</option>
                    <option value="Office Products">Office Products</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Fornecedor EUA</label>
                <input
                  type="text"
                  placeholder="Kole Imports / WebstaurantStore / Walmart"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preço de Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3.80"
                    value={newSupplierPrice}
                    onChange={(e) => setNewSupplierPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preço Venda Amazon ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="16.99"
                    value={newAmazonPrice}
                    onChange={(e) => setNewAmazonPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20"
                >
                  Salvar Produto no Deal Finder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
