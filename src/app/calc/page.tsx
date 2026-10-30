'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator, DollarSign, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

export default function CalculatorPage() {
  const { t } = useLanguage();

  const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD');
  const [supplierCost, setSupplierCost] = useState<number>(1.25);
  const [amazonPrice, setAmazonPrice] = useState<number>(9.99);
  const [prepFee, setPrepFee] = useState<number>(1.50);
  const [inboundFreight, setInboundFreight] = useState<number>(0.80);
  const [itemWeightLbs, setItemWeightLbs] = useState<number>(0.3);
  const [batchQuantity, setBatchQuantity] = useState<number>(50);

  // Apply Quick Preset
  const handleApplyPreset = (preset: 'cable-ties' | 'resveratrol') => {
    if (preset === 'cable-ties') {
      setCurrency('USD');
      setSupplierCost(1.25);
      setAmazonPrice(9.99);
      setPrepFee(1.50);
      setInboundFreight(0.80);
      setItemWeightLbs(0.3);
      setBatchQuantity(50);
    } else {
      setCurrency('BRL');
      setSupplierCost(25.76);
      setAmazonPrice(79.90);
      setPrepFee(2.00);
      setInboundFreight(4.24);
      setItemWeightLbs(0.4);
      setBatchQuantity(30);
    }
  };

  const currencySymbol = currency === 'BRL' ? 'R$' : '$';
  const referralRate = 0.15; // 15% standard category referral fee
  const referralFee = amazonPrice * referralRate;

  // FBA / Shipping Fee Tier Estimation
  let fbaFee = 4.35;
  if (currency === 'BRL') {
    fbaFee = 14.50; // taxa média logística BR
  } else {
    if (itemWeightLbs <= 0.25) fbaFee = 3.22;
    else if (itemWeightLbs <= 0.50) fbaFee = 3.77;
    else if (itemWeightLbs <= 0.75) fbaFee = 4.10;
    else if (itemWeightLbs <= 1.00) fbaFee = 4.55;
    else fbaFee = 6.05;
  }

  const totalLogisticsAndFees = referralFee + fbaFee + prepFee + inboundFreight;
  const netProfitUnit = amazonPrice - supplierCost - totalLogisticsAndFees;
  const roiPercent = supplierCost > 0 ? (netProfitUnit / supplierCost) * 100 : 0;

  const totalBatchInvestment = (supplierCost + inboundFreight) * batchQuantity;
  const totalBatchRevenue = amazonPrice * batchQuantity;
  const totalBatchNetProfit = netProfitUnit * batchQuantity;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-7 h-7 text-blue-400" />
              <span>{t.calcTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {t.calcSubtitle}
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
            <span className="text-slate-400 px-2 font-sans">{t.calcCurrencySwitch}</span>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇺🇸</span>
              <span>USD ($)</span>
            </button>
            <button
              onClick={() => setCurrency('BRL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                currency === 'BRL'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇧🇷</span>
              <span>BRL (R$)</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">{t.calcPresetsTitle}</span>
          <button
            onClick={() => handleApplyPreset('cable-ties')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl font-mono text-[11px] font-semibold transition border border-slate-700/60"
          >
            🇺🇸 {t.calcPresetCableTies}
          </button>
          <button
            onClick={() => handleApplyPreset('resveratrol')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl font-mono text-[11px] font-semibold transition border border-slate-700/60"
          >
            🇧🇷 {t.calcPresetResveratrol}
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{t.dataSectionTitle}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.sellPriceLabel} ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={amazonPrice}
                onChange={(e) => setAmazonPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-blue-400 font-bold text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.buyPriceLabel} ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={supplierCost}
                onChange={(e) => setSupplierCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.preppingFeeLabel} ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={prepFee}
                onChange={(e) => setPrepFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.freightLabel} ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={inboundFreight}
                onChange={(e) => setInboundFreight(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.weightLabel} (lbs/kg)</label>
              <input
                type="number"
                step="0.1"
                value={itemWeightLbs}
                onChange={(e) => setItemWeightLbs(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-sans font-medium mb-1.5">{t.batchQtyLabel}</label>
              <input
                type="number"
                step="1"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">{t.resultUnitTitle}</h2>
              {netProfitUnit > 0 ? (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.badgeProfitable}</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-mono font-bold">
                  {t.badgeLoss}
                </span>
              )}
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block font-sans">{t.unitNetProfitLabel}</span>
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${netProfitUnit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netProfitUnit >= 0 ? '+' : ''}{currencySymbol} {netProfitUnit.toFixed(2)}
                </span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block font-sans">{t.unitRoiLabel}</span>
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roiPercent >= 0 ? '+' : ''}{roiPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Fee Breakdown List */}
            <div className="space-y-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>{t.refFeeLabel}</span>
                <span className="text-slate-200">-{currencySymbol} {referralFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.fbaFeeLabel}</span>
                <span className="text-slate-200">-{currencySymbol} {fbaFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.prepFeeLabel}</span>
                <span className="text-slate-200">-{currencySymbol} {prepFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.freightInboundLabel}</span>
                <span className="text-slate-200">-{currencySymbol} {inboundFreight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.supplierProductCostLabel}</span>
                <span className="text-slate-200">-{currencySymbol} {supplierCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>{t.cleanNetProfitLabel}</span>
                <span className="text-emerald-400">+{currencySymbol} {netProfitUnit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Batch Projections */}
          <div className="p-4 bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-900/40 rounded-2xl text-xs font-mono space-y-2">
            <div className="font-bold text-slate-300 font-sans">
              {t.batchProjectionTitle.replace('{qty}', batchQuantity.toString())}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">{t.investmentLabel}</span>
                <strong className="text-white text-xs">{currencySymbol} {totalBatchInvestment.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{t.revenueLabel}</span>
                <strong className="text-blue-400 text-xs">{currencySymbol} {totalBatchRevenue.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{t.profitLabel}</span>
                <strong className="text-emerald-400 text-xs">+{currencySymbol} {totalBatchNetProfit.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
