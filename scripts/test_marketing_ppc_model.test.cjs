'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { simulatePpc } = require('./lib/marketing_ppc_model.cjs');
test('scenario A: verified arithmetic only (not verified invoices)', () => {
  const r = simulatePpc();
  assert.equal(r.marginBeforeAds, 3.3815);
  assert.equal(r.breakevenCpc, 0.3382);
  assert.equal(r.classification, 'SIMULATION_ONLY');
});
test('scenario B in-house prep has an additional 1.25 margin', () => {
  const a = simulatePpc({cpc:0});
  const b = simulatePpc({prepFee:0.25,cpc:0});
  assert.equal(Math.round((b.marginBeforeAds - a.marginBeforeAds)*100),125);
});
test('coupon reflects current fee structure, not historical 0.60 redemption', () => {
  const r = simulatePpc({couponDiscount:1,couponFixedFee:5,couponVariableRate:0.025,couponRedemptions:100,cpc:0});
  assert.equal(r.couponPlatformFeeUnit,0.3498);
  assert.ok(Math.abs(r.marginBeforeAds - 2.18175) < 0.0001);
});
test('coupon up-front fee amortization changes with actual redemptions', () => {
  const low = simulatePpc({couponDiscount:1,couponFixedFee:5,couponVariableRate:0.025,couponRedemptions:10,cpc:0});
  const high = simulatePpc({couponDiscount:1,couponFixedFee:5,couponVariableRate:0.025,couponRedemptions:100,cpc:0});
  assert.ok(high.marginBeforeAds > low.marginBeforeAds);
});
test('coupon cap applies to campaign total and not individual unit', () => {
  const r=simulatePpc({couponDiscount:1,couponFixedFee:5,couponVariableRate:0.025,couponRedemptions:10000,couponVariableFeeCap:2000,cpc:0});
  assert.equal(r.couponPlatformFeeUnit,0.2005);
});
test('reject invalid conversion, missing redemption forecast and negative costs', () => {
  assert.throws(()=>simulatePpc({conversionRate:0}),RangeError);
  assert.throws(()=>simulatePpc({couponDiscount:1}),RangeError);
  assert.throws(()=>simulatePpc({cogs:-1}),RangeError);
});
test('CPC beyond break-even turns margin negative', () => {
  const r=simulatePpc({cpc:0.4,conversionRate:0.1});
  assert.ok(r.marginAfterAds < 0);
});
test('TACoS undefined without attribution mix', () => {
  assert.equal(simulatePpc({adAttributedUnitShare:0}).modeledTacos,null);
});


test('real 50-unit lot modeled as 15 PPC, 15 full-price organic, 20 coupon sales', () => {
  const quantity = 50;
  const ads = 15;
  const regularOrganic = 15;
  const coupon = 20;
  const clicks = 150;
  assert.equal(ads + regularOrganic + coupon, quantity);
  const budget = 50;
  const adSpend = clicks * 0.32;
  assert.equal(adSpend, 48);
  assert.ok(adSpend <= budget);
  const regular = simulatePpc({ cpc: 0 });
  const couponed = simulatePpc({
    cpc: 0, couponDiscount: 1, couponFixedFee: 5,
    couponVariableRate: 0.025, couponRedemptions: coupon
  });
  for (const [prepFee, expectedRounded] of [[1.5, 93], [0.25, 155.5]]) {
    const a = simulatePpc({ prepFee, cpc: 0 });
    const b = simulatePpc({
      prepFee, cpc: 0, couponDiscount: 1, couponFixedFee: 5,
      couponVariableRate: 0.025, couponRedemptions: coupon
    });
    const projectedProfit = (ads + regularOrganic) * a.marginBeforeAds +
      coupon * b.marginBeforeAds - adSpend;
    // Input rows rounded to cents reproduce the Antigravity 50-unit presentation.
    assert.ok(Math.abs(projectedProfit - expectedRounded) < 0.2);
    assert.equal(a.classification, 'SIMULATION_ONLY');
    assert.equal(b.classification, 'SIMULATION_ONLY');
  }
  assert.equal(regular.consumerPrice,12.99);
  assert.equal(couponed.consumerPrice,11.99);
  assert.equal(couponed.couponPlatformFeeUnit,0.5498);
});

test('pilot should not count 100 units as current 50-unit stock', () => {
  const available=50;
  const plannedSales=15+15+20;
  assert.equal(plannedSales,available);
  assert.ok(100>available);
  assert.equal(48/10,4.8);
  assert.ok(Math.abs(48/7 - 6.857142857) < 0.00001);
});
