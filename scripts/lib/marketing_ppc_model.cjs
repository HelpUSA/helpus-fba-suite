'use strict';

// Pure, read-only decision support. No API clients, persistence or paid actions.
function requireNumber(name, value, { min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(name + ' must be a finite number between ' + min + ' and ' + max);
  }
  return value;
}
function round(value, decimals = 4) {
  const power = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * power) / power;
}
function simulatePpc({
  price = 12.99,
  referralRate = 0.15,
  fbaFee = 4.11,
  prepFee = 1.50,
  inboundFee = 0.80,
  cogs = 1.25,
  conversionRate = 0.10,
  cpc = 0.25,
  couponDiscount = 0,
  couponFixedFee = 0,
  couponVariableRate = 0,
  couponRedemptions = 0,
  couponVariableFeeCap = null,
  adAttributedUnitShare = 1
} = {}) {
  for (const [name, value] of Object.entries({price,referralRate,fbaFee,prepFee,inboundFee,cogs,conversionRate,cpc,couponDiscount,couponFixedFee,couponVariableRate,couponRedemptions,adAttributedUnitShare})) {
    requireNumber(name, value);
  }
  if (price <= 0 || couponDiscount >= price) throw new RangeError('invalid price or discount');
  if (referralRate > 1 || conversionRate <= 0 || conversionRate > 1 || couponVariableRate > 1 || adAttributedUnitShare > 1) throw new RangeError('invalid proportion');
  if (!Number.isInteger(couponRedemptions)) throw new RangeError('couponRedemptions must be an integer');
  if (couponVariableFeeCap !== null) requireNumber('couponVariableFeeCap', couponVariableFeeCap);
  if (couponDiscount > 0 && couponRedemptions === 0) throw new RangeError('couponRedemptions required to amortize coupon fixed fee');
  if (couponDiscount === 0 && (couponFixedFee !== 0 || couponVariableRate !== 0)) throw new RangeError('coupon fees require a coupon');
  const consumerPrice = price - couponDiscount;
  const referralFee = consumerPrice * referralRate;
  const saleCost = referralFee + fbaFee + prepFee + inboundFee + cogs;
  // Coupon fee model effective Jun 2, 2025 in US: $5 upfront + 2.5% of redeemed sales.
  // Cap is applied across the entire coupon, not per unit. Caller provides current cap.
  const variableTotal = couponVariableFeeCap === null
    ? consumerPrice * couponVariableRate * couponRedemptions
    : Math.min(consumerPrice * couponVariableRate * couponRedemptions, couponVariableFeeCap);
  const couponPlatformFeeUnit = couponRedemptions ? (couponFixedFee + variableTotal) / couponRedemptions : 0;
  const marginBeforeAds = consumerPrice - saleCost - couponPlatformFeeUnit;
  const adCostPerAttributedOrder = cpc / conversionRate;
  const marginAfterAds = marginBeforeAds - adCostPerAttributedOrder;
  const breakevenAcos = marginBeforeAds / consumerPrice;
  const breakevenCpc = marginBeforeAds * conversionRate;
  return {
    consumerPrice: round(consumerPrice),
    referralFee: round(referralFee),
    couponPlatformFeeUnit: round(couponPlatformFeeUnit),
    marginBeforeAds: round(marginBeforeAds),
    marginAfterAds: round(marginAfterAds),
    breakevenAcos: round(breakevenAcos),
    breakevenCpc: round(breakevenCpc),
    modeledAcos: round(adCostPerAttributedOrder / consumerPrice),
    modeledTacos: adAttributedUnitShare === 0 ? null : round((adCostPerAttributedOrder * adAttributedUnitShare) / consumerPrice),
    classification: 'SIMULATION_ONLY'
  };
}
module.exports = { simulatePpc };
