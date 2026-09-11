'use client';

import React, { useState } from 'react';
import { Language, i18n } from '@/data/i18n';
import { Calculator, DollarSign, CheckCircle2 } from 'lucide-react';

interface CalculatorViewProps {
  language: Language;
}

export default function CalculatorView({ language }: CalculatorViewProps) {
  const t = i18n[language];
  const [supplierCost, setSupplierCost] = useState<number>(3.80);
  const [amazonPrice, setAmazonPrice] = useState<number>(16.99);
  const [prepNinjasFee, setPrepNinjasFee] = useState<number>(1.50);
  const [inboundFreight, setInboundFreight] = useState<number>(0.80);
  const [itemWeightLbs, setItemWeightLbs] = useState<number>(0.6);
  const [batchQuantity, setBatchQuantity] = useState<number>(50);

  // Math Calculations
  const referralRate = 0.15; // 15% standard category referral fee
  const amazonReferralFee = amazonPrice * referralRate;

  // FBA Fee Tier Estimation
  let fbaFee = 4.35;
  if (itemWeightLbs <= 0.25) fbaFee = 3.22;
  else if (itemWeightLbs <= 0.50) fbaFee = 3.77;
  else if (itemWeightLbs <= 0.75) fbaFee = 4.10;
  else if (itemWeightLbs <= 1.00) fbaFee = 4.55;
  else fbaFee = 5.40;

  const totalLogisticsAndFees = amazonReferralFee + fbaFee + prepNinjasFee + inboundFreight;
  const netProfitUnit = amazonPrice - supplierCost - totalLogisticsAndFees;
  const roiPercent = supplierCost > 0 ? (netProfitUnit / supplierCost) * 100 : 0;

  const totalBatchInvestment = (supplierCost + inboundFreight) * batchQuantity;
  const totalBatchRevenue = amazonPrice * batchQuantity;
  const totalBatchNetProfit = netProfitUnit * batchQuantity;

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <span>{t.calcTitle}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {t.calcSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{t.dataSectionTitle}</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.sellPriceLabel}</label>
              <input
                type="number"
                step="0.01"
                value={amazonPrice}
                onChange={(e) => setAmazonPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-blue-400 font-bold text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.buyPriceLabel}</label>
              <input
                type="number"
                step="0.01"
                value={supplierCost}
                onChange={(e) => setSupplierCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.preppingFeeLabel}</label>
              <input
                type="number"
                step="0.01"
                value={prepNinjasFee}
                onChange={(e) => setPrepNinjasFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.freightLabel}</label>
              <input
                type="number"
                step="0.01"
                value={inboundFreight}
                onChange={(e) => setInboundFreight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.weightLabel}</label>
              <input
                type="number"
                step="0.1"
                value={itemWeightLbs}
                onChange={(e) => setItemWeightLbs(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.batchQtyLabel}</label>
              <select
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value={25}>25 units</option>
                <option value={50}>50 units</option>
                <option value={100}>100 units</option>
                <option value={200}>200 units</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Output & Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Profit Box */}
          <div className={`p-6 border rounded-2xl space-y-4 ${netProfitUnit > 0 ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{t.resultUnitTitle}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${netProfitUnit > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {netProfitUnit > 0 ? t.badgeProfitable : t.badgeLoss}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">{t.unitNetProfitLabel}</div>
                <div className={`text-3xl font-black tracking-tight ${netProfitUnit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${netProfitUnit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{t.unitRoiLabel}</div>
                <div className={`text-3xl font-black tracking-tight ${roiPercent > 50 ? 'text-indigo-400' : 'text-slate-200'}`}>
                  +{roiPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-2">{t.breakdownTitle}</h4>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>{t.sellPriceLabel}:</span>
                <span className="text-blue-400 font-bold">${amazonPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t.refFeeLabel}</span>
                <span className="text-rose-400">-${amazonReferralFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t.fbaFeeLabel}</span>
                <span className="text-rose-400">-${fbaFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t.prepFeeLabel}</span>
                <span className="text-rose-400">-${prepNinjasFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t.freightInboundLabel}</span>
                <span className="text-rose-400">-${inboundFreight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t.supplierProductCostLabel}</span>
                <span className="text-rose-400">-${supplierCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-emerald-400">
                <span>{t.cleanNetProfitLabel}</span>
                <span>${netProfitUnit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Batch Projection Box */}
          <div className="p-5 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>{t.batchProjectionTitle.replace('{qty}', batchQuantity.toString())}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block">{t.investmentLabel}</span>
                <span className="text-white font-bold">${totalBatchInvestment.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.revenueLabel}</span>
                <span className="text-blue-400 font-bold">${totalBatchRevenue.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.profitLabel}</span>
                <span className="text-emerald-400 font-bold">${totalBatchNetProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
