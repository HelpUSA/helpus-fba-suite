# Marketing PPC — Cable Ties B0HLTXWCV7 (simulation only)

Status: **DRAFT / NO-GO**. Base branch: `master` P0. This branch contains only a pure cost model, tests and a runbook; it cannot purchase ads, activate coupons or mutate NeonDB.

## Inputs

ASIN B0HLTXWCV7 / SKU HU-SIL-CABLE-FBA-2026. Price $12.99, referral rate 15%, FBA $4.11, inbound $0.80, COGS $1.25. **Scenario A:** outsourced prep $1.50; computed pre-ad margin $3.3815. **Scenario B:** projected in-house/manufacturer prep $0.25, pre-ad margin $4.6315. Prices, costs, and target conversion 10–12% are scenario inputs, **not evidence of actual realized cash flows**.

## Important coupon correction

The November 2026 US coupon model **must not use historical $0.60 per redemption** without case-specific substantiation. Amazon announced that, starting June 2, 2025, US seller coupons cost **$5 upfront per coupon plus 2.5% of coupon sales**. Amazon later announced a $2,000 variable-fee cap effective November 5, 2025. Verify category/account/marketplace applicability and current Seller Central rate card before action.

Examples with $1 coupon, 100 redemptions: final consumer price $11.99; coupon platform fee $0.05 fixed allocation + $0.29975 variable = $0.34975 per unit, BEFORE PPC. The referral fee is modeled on promotional sale price at the assumed constant rate, subject to Seller Central verification. 10 redemptions incurs a $0.50 fixed allocation per unit. Other fees, tax treatment, storage, returns, and advertising attribution may affect profitability.

Formula: margin before PPC = discounted consumer price - cost of goods - fulfillment - inbound - prep - (discounted consumer price * referral rate) - allocated coupon fees. Break-even ACoS = pre-ad margin / attributed revenue; break-even CPC = pre-ad margin * conversion rate. Modeled TACoS requires verified total sales and ad spend; using an assumed attributed unit share is illustrative and **not an actual KPI**.

## ROI reconciliation — Antigravity local audit, 15 Nov 2026

The originally reported **122% ROI is withdrawn** because it mixed Scenario B profit with a Scenario A cash-capital denominator. The local audit proposes two scenario-specific **cash-capital ROI illustrations**:

- **Scenario A:** $3.38 / ($1.25 COGS + $0.80 inbound + $1.50 outsourced prep + $0.25 packaging) = **88.9%** (rounded). **Unresolved**: packaging $0.25 is not a separate line in the $9.61 total operational-cost stack used to derive the $3.38 profit. Check the source invoice and allocate this cost once, not twice. If it is truly an incremental uncounted operating expense, profit changes and the advertised 88.9% must be recalculated.
- **Scenario B:** $4.63 / ($1.25 COGS + $0.80 inbound + $0.25 projected prep) = **201.3%** (rounded). This is a **projected cash-capital return**, not a realized investment return. Document what the lower prep price includes (labor, labels, packaging, manufacturer handling, duties, transport) and evidence of actual execution before treating it as verified.

**Do not equate cash-capital ROI with return on total cost.** Total-cost ROIs using the unadjusted input stack are $3.38/$9.61 = 35.2% (A) and $4.63/$8.36 = 55.4% (B). Both calculations exclude ad spend, coupon fees and other unmodeled charges. No ROI should be called *realized* on the basis of this source-only model. Ledger/receipt and cost-allocation evidence are mandatory before release.

## Governance gates

- Evidence for actual prep invoices, actual cost allocation and FBA fee verification.
- Current coupon fee schedule confirmed for this seller/marketplace, with per-campaign fixed fee, redemption volume, cap, and potential changes.
- Historical and projected margins distinguished. Never auto-classify scenario B as realized.
- PPC budget, bid and sales attribution are planning parameters only; no Seller Central connection or credentials.
- Vine/Brand Registry remains blocked pending verifiable eligibility.
- P1 FX/documentary release gate remains independent and blocked.
- No merge, production deployment, ad spend, coupons or inventory/DB mutations without separate authorization.

Sources:
- https://sellercentral.amazon.com/seller-forums/discussions/t/05d936ee-b79d-451d-b03c-827df41df300
- https://sellercentral.amazon.com/seller-forums/discussions/t/c71e49a4-8f57-42ea-8d6a-accec5de1ebe
- https://sellercentral.amazon.com/help/hub/reference/external/G201411300
- https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales/


## 100-unit pilot reconciliation — Antigravity Order 005 (15 Nov 2026)

**Simulation only; not a sales, advertising or cash-collection ledger.**

| Sales cohort | Units | Customer price | Subtotal |
| --- | ---: | ---: | ---: |
| PPC-attributed, no coupon | 30 | $12.99 | $389.70 |
| Organic, no coupon | 30 | $12.99 | $389.70 |
| Organic, redeemed $1 coupon | 40 | $11.99 | $479.60 |
| **Total** | **100** | | **$1,259.00** |

Modeled totals: fulfillment $411, referral fees $189 (rounded $1.95 and $1.80 per unit), COGS $125, inbound $80, coupon variable fee ~$12 (exact 2.5% * $479.60 = **$11.99**), coupon fixed $5 and PPC $96 (300 clicks * $0.32). Prep A $150; prep B $25. **Reported rounded** projected profit is A $191, B $316; using unrounded coupon fees and referral rates changes these totals by pennies. CAC $96 / 30 attributed orders = $3.20, an assumed modeled conversion rate 30/300 = 10%. Ads attributed sales are a distinct cohort; PPC cost is included only once.

**Budget wording correction:** $96/14 days = **$6.86/day**. This is **not within** an advertised $7–10/day execution band; it is a sub-$7 daily average that respects the independent $100 overall cap. A daily cap is distinct from realized daily spend, and Amazon may distribute spend unevenly.

**Cost reconciliation hold:** Scenario A's proposed direct-cash denominator $380 includes $25 packaging (100 * $0.25), whereas the profit/cost schedule above does **not** separately charge $25 packaging. Evidence must establish whether the packaging cost is already included in $1.50 prep (cash item, avoid double count) or incremental (then reduce projected A profit accordingly). **Do not certify A 50.3% cash-capital ROI as realized or finalized.** Scenario B's $230 cash denominator omits packaging and assumes $0.25 optimized prep is feasible; $316/$230 = 137.4% remains illustrative. The reported A $191/$380 = 50.3% is an arithmetic ratio only, pending reconciliation.

**Policy:** Commercial price, budget, CPC, coupon and profitability inputs are estimates. No campaigns, coupons, Amazon Vine, payments, merges, deployments or NeonDB writes are authorized. Any direct integration into DRE must preserve `SIMULATION_ONLY` vs posted/realized financial entries.
