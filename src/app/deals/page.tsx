'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_PRODUCTS, ProductDeal } from '@/data/mockProducts';
import {
  Search,
  Plus,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Calculator
} from 'lucide-react';

export default function DealsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductDeal[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRoi, setMinRoi] = useState(40);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product candidate form state
  const [newTitle, setNewTitle] = useState('');
  const [newAsin, setNewAsin] = useState('');
  const [newCategory, setNewCategory] = useState('Tools & Home Improvement');
  const [newSupplier, setNewSupplier] = useState('');
  const [newSupplierPrice, setNewSupplierPrice] = useState('3.50');
  const [newAmazonPrice, setNewAmazonPrice] = useState('16.99');

  const categories = [
    'All',
    'Tools & Home Improvement',
    'Suplementos & Vitaminas',
    'Home & Kitchen',
    'Pet Supplies',
    'Office Products'
  ];

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
      imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
      supplierName: newSupplier || 'Wholesale Supplier',
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
      marketplace: 'Amazon US',
      currency: 'USD',
      currentStock: 0,
      warehouseLocation: 'Sourcing Pipeline'
    };

    setProducts((prev) => [newDeal, ...prev]);
    setIsModalOpen(false);

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
    link.setAttribute('download', `helpus_deal_finder_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Search className="w-7 h-7 text-indigo-400" />
              <span>{t.finderTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {t.finderSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addCandidate}</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase mb-1 block">{t.searchLabel}</label>
            <input
              type="text"
              placeholder={t.searchPlaceholderInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase mb-1 block">{t.categoryLabel}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
              <span>{t.minRoiLabel}</span>
              <span className="text-emerald-400 font-bold">{minRoi}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={minRoi}
              onChange={(e) => setMinRoi(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Main Deals Table */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">{t.colProduct}</th>
                <th className="py-3 px-4">{t.colSupplier}</th>
                <th className="py-3 px-4">{t.colPricing}</th>
                <th className="py-3 px-4">{t.colFees}</th>
                <th className="py-3 px-4">{t.colProfitRoi}</th>
                <th className="py-3 px-4">{t.colUngated}</th>
                <th className="py-3 px-4 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredProducts.map((p) => {
                const currency = p.currency === 'BRL' ? 'R$' : '$';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0" />
                        <div>
                          <div className="font-semibold text-white font-sans text-xs truncate max-w-xs">{p.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            <span>{p.marketplace === 'Amazon BR' ? '🇧🇷 BR' : '🇺🇸 US'}</span> • <span>{p.sku ? `SKU: ${p.sku}` : `ASIN: ${p.asin}`}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <a href={p.supplierUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center gap-1">
                        <span className="truncate max-w-[130px]">{p.supplierName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>Buy: <strong className="text-white">{currency} {p.supplierPrice.toFixed(2)}</strong></div>
                      <div>Sell: <strong className="text-blue-400">{currency} {p.amazonPrice.toFixed(2)}</strong></div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>FBA/Envio: {currency} {p.fbaFee.toFixed(2)}</div>
                      <div>Prep: {currency} {p.prepFee.toFixed(2)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-400 font-bold">+{currency} {p.netProfit.toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-500">+{p.roiPercent}% ROI</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.ungatedApproved}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/calc"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-sans font-semibold border border-slate-700 transition inline-flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3 text-blue-400" />
                        <span>{t.btnSimulateFees}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Product Candidate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>{t.modalTitle}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{t.modalProductTitle}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Silicone Trivet Mats Pack of 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.modalAsin}</label>
                  <input
                    type="text"
                    placeholder="Ex: B08X1Q9Z88"
                    value={newAsin}
                    onChange={(e) => setNewAsin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.modalCategory}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {categories.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{t.modalSupplier}</label>
                <input
                  type="text"
                  placeholder="Ex: Kole Imports Wholesale"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.modalBuyPrice}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newSupplierPrice}
                    onChange={(e) => setNewSupplierPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.modalSellPrice}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmazonPrice}
                    onChange={(e) => setNewAmazonPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  {t.modalCancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow transition"
                >
                  {t.modalSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
