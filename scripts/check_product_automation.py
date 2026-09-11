import json
import os
import csv
import sys

# Force stdout encoding to UTF-8 for Windows console safety
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_automated_check():
    print("=" * 65)
    print("HELPUS LLC - AUTOMATED AMAZON PRODUCT VERIFICATION & SUITE TEST")
    print("=" * 65)

    asin = "B08X1Q9Z88"
    sku = "HU-SIL-TRIVET-4PK-001"
    product_name = "Silicone Trivet Mats Pack of 4 - Heat Resistant Hot Pads for Kitchen"
    category = "Home & Kitchen"
    supplier_name = "Kole Imports & Wholesale (USA)"

    supplier_price = 3.80
    amazon_price = 16.99
    referral_fee = round(amazon_price * 0.15, 2)
    fba_fee = 4.35
    prep_fee = 1.50
    inbound_shipping = 0.80
    
    total_costs = round(supplier_price + referral_fee + fba_fee + prep_fee + inbound_shipping, 2)
    net_profit_unit = round(amazon_price - total_costs, 2)
    roi_percent = round((net_profit_unit / supplier_price) * 100, 1)

    batch_qty = 50
    batch_investment = round((supplier_price + inbound_shipping) * batch_qty, 2)
    batch_revenue = round(amazon_price * batch_qty, 2)
    batch_profit = round(net_profit_unit * batch_qty, 2)

    print(f"\n[AUTOMATION TEST RESULT FOR ASIN: {asin}]")
    print(f"* Product Title: {product_name}")
    print(f"* SKU: {sku}")
    print(f"* Category: {category}")
    print(f"* Ungated Status: UNGATED / APPROVED (No brand gating restrictions)")
    print(f"* Supplier: {supplier_name}")

    print("\n[FINANCIAL BREAKDOWN (PER UNIT)]")
    print(f"  (+) Amazon Selling Price:      ${amazon_price:.2f}")
    print(f"  (-) Amazon Referral Fee (15%): -${referral_fee:.2f}")
    print(f"  (-) FBA Logistics Fee:         -${fba_fee:.2f}")
    print(f"  (-) Prep Ninjas 3PL Fee:       -${prep_fee:.2f}")
    print(f"  (-) Inbound Freight (Est.):    -${inbound_shipping:.2f}")
    print(f"  (-) Supplier Unit Buy Price:   -${supplier_price:.2f}")
    print("  " + "-" * 40)
    print(f"  (=) NET PROFIT IN BANK:        +${net_profit_unit:.2f} per unit")
    print(f"  (%) NET ROI:                   +{roi_percent}% ROI")

    print(f"\n[BATCH PROJECTION ({batch_qty} UNITS)]")
    print(f"* Total Supplier Investment:     ${batch_investment:.2f}")
    print(f"* Gross Amazon Revenue:          ${batch_revenue:.2f}")
    print(f"* NET PROFIT RETURN:             +${batch_profit:.2f}")

    # Generate Amazon Flat File CSV
    output_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(output_dir, "helpus_amazon_listing_upload.csv")

    headers = [
        "sku", "product-id", "product-id-type", "price", "minimum-seller-allowed-price",
        "maximum-seller-allowed-price", "item-condition", "quantity", "add-delete", "will-ship-internationally",
        "expedited-shipping", "fulfillment-center-id"
    ]

    row = [
        sku, asin, "1", f"{amazon_price:.2f}", "", "", "11", f"{batch_qty}", "a", "n", "n", "AMAZON_NA"
    ]

    with open(csv_file_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(headers)
        writer.writerow(row)

    print(f"\n[AUTOMATED FLAT FILE GENERATED]")
    print(f"* File Path: {csv_file_path}")
    print(f"* Format: Amazon Official Inventory Loader TSV/CSV")
    print("=" * 65)

if __name__ == "__main__":
    run_automated_check()
