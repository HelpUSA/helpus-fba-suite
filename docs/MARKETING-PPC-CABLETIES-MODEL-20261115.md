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


## Current physical lot: 50 units — Master factual clarification (16 Nov 2026)

**Operational basis for the current inventory is Scenario A ONLY** (Prep Ninjas outsourced preparation). The Master has informed Antigravity that 50 Cable Ties units have already been labeled, shipped and physically received/available at Amazon FBA. This is an **owner-reported operational fact**; the connected Seller Central inventory ledger and proof of receipt have not been independently inspected in this PR. Confirm sellable/available versus reserved units in the official settlement and inventory reports before reliance.

**Scenario B is not a valid choice for these 50 units.** In-house/manufacturer preparation at $0.25 applies **only to hypothetical future replenishment purchase orders** and must never inflate the profitability of already-prepared stock.

### Simulated Amazon settlement versus operational profit — current 50-unit Scenario A

| Component | Projected USD |
| --- | ---: |
| Gross customer receipts if all 50 sell (30 * $12.99 + 20 * $11.99) | +629.50 |
| Amazon fulfillment fees | -205.50 |
| Amazon referral fees, displayed rounded-unit assumptions | -94.50 |
| Assumed PPC spend (not activated) | -48.00 |
| Assumed coupon platform fees (not activated) | -11.00 |
| **Illustrative Amazon disbursement before unmodeled adjustments** | **+270.50** |
| Already-incurred COGS (reported) | -62.50 |
| Already-incurred outsourced prep (reported) | -75.00 |
| Already-incurred inbound freight (reported) | -40.00 |
| **Illustrative operational profit after listed costs** | **+93.00** |

**Critical classification:** “already-incurred” above is based on the Master's reported operational history, **not independent proof of payment or ledger reconciliation**. The $270.50 value is a conditional future settlement estimate, **not an actual payout**, and is not itself profit. Amazon might debit ad spend to a separate card rather than net it from settlement; therefore payment-channel reconciliation must use the actual Amazon statement, avoiding omission or double-counting. Neither Amazon bank disbursement nor profit may be posted as REALIZADO on the basis of this forecast. Model excludes possible account reserves, refunds, storage, insurance, sales tax, advertising billing arrangements and other adjustments.

The earlier packaging fork remains subject to the Prep Ninjas invoice: if the standard polybag is already included in $1.50, Scenario A modeled profit stays $93; if an incremental $0.25/unit charge exists and is not in the listed costs, modeled profit reduces to **$80.50**. Final cash-capital denominator must match whichever cost allocation the paid invoice substantiates.

**Activation gates unchanged:** no Amazon PPC campaign, coupon, Vine enrollment, merge, deployment, NeonDB writes or money commitments are approved. The 100-unit test case is historical only, and Scenario B is future-restocking simulation only.

## Current operational pilot: **50 acquired units** — Antigravity recalibration (15 Nov 2026)

**Authoritative planning quantity: 50 units**, as explicitly confirmed by Master SuperAdmin. The 100-unit illustration below is **superseded for operational planning** and retained strictly as historical mathematical test data. The inventory quantity is *reported by Antigravity*, not independently reconciled to current Seller Central inventory.

| Cohort | Qty | Modeled unit sale price | Gross revenue |
| --- | ---: | ---: | ---: |
| PPC attributed (undiscounted) | 15 | $12.99 | $194.85 |
| Organic (undiscounted) | 15 | $12.99 | $194.85 |
| Organic coupon redeemed | 20 | $11.99 | $239.80 |
| **Total** | **50** | | **$629.50** |

PPC: 150 hypothetical clicks * $0.32 = **$48.00** (maximum proposed budget **$50.00**), hypothetical conversion = 15/150 = 10%, modeled CAC = $48/15 = **$3.20 per attributed sale**. Average modeled spend is **$4.80/day for 10 days** or **$6.86/day for 7 days**; neither implies a guaranteed daily delivery schedule. Inventory depletion/returns/reconciliation require separate validation.

Coupon: 20 redemptions, **$5** campaign fixed fee plus **2.5% of $239.80 = $5.995** variable fee, approximately **$11.00** total. Per couponed unit: $0.25 fixed allocation + $0.29975 variable; $1.00 face discount and $0.15 referral-fee saving yield a ~$1.39975 reduction relative to an undiscounted sale before PPC, **not** $1.275. The $1.275 figure in Antigravity's commentary omits part of the charge (the exact net reduction is $1.39975). Actual Seller Central policy/account applicability remains a separate release gate.

Modeled expense totals using *rounded input line items*: fulfillment $205.50, referral $94.50, COGS $62.50, inbound $40.00, PPC $48.00, coupon fixed/variable $11.00; prep A $75.00, prep B $12.50. Total modeled expenses A **$536.50**, B **$474.00**; projected profit A **$93.00**, B **$155.50** before missing expenses and tax. If rates are calculated without per-unit display rounding, the cents differ slightly, and the ledger must establish rounding policy.

**Packaging reconciliation, Order 006 local attestation (15 Nov 2026):** Antigravity reports that the standard Prep Ninjas FNSKU/polybag/suffocation-warning package is included in the $1.50 unit prep charge. The invoice/contract was not independently inspected in this PR; retain both treatments until the first actual invoice is reconciled:

| Scenario A packaging treatment | Total direct cash per 50 | Modeled total profit | Illustrative return on direct cash |
| --- | ---: | ---: | ---: |
| Polybag **included** in $1.50 Prep Ninjas | $177.50 (50 * $3.55) | $93.00 | 52.39% |
| **Additional** $0.25 packaging per unit, not in $1.50 prep | $190.00 (50 * $3.80) | $80.50 | 42.37% |

**Do not double-count** packaging. The previous A figure $93/$190 = 48.95% mixed an additional packaging cash denominator with a profit numerator that did not expense packaging; it is **superseded**. Scenario B uses $115.00 direct-cash denominator and $155.50 modeled profit (135.22% illustrative return), still contingent on actual optimized prep costs. Actual seller invoice, terms and packaging itemization remain a documentary gate. Customer sales taxes, returns, storage, removal fees, actual Amazon Ads costs, coupon redemption rules and accounting settlement may affect realized performance.

No ad campaigns, coupons, Vine enrollments, payments, DB writes or deployments authorized; status **SIMULATION_ONLY / DRAFT / NO-GO**.

## Superseded 100-unit illustration — Order 005 (not current inventory)

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
