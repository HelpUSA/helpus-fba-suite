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
  assert.equal(r.marginBeforeAds,2.1818);
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
