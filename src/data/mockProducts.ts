export interface ProductDeal {
  id: string;
  asin: string;
  title: string;
  category: string;
  imageUrl: string;
  supplierName: string;
  supplierUrl: string;
  supplierPrice: number; // USD
  amazonPrice: number; // USD
  amazonReferralFee: number; // USD (~15%)
  fbaFee: number; // USD
  prepFee: number; // USD ($1.50)
  inboundShipping: number; // USD (~$0.80)
  netProfit: number; // USD
  roiPercent: number; // %
  isUngated: boolean;
  estMonthlySales: number;
  bsrRank: number;
  status: 'Candidate' | 'In Review' | 'Purchased' | 'At Prep' | 'Live on Amazon';
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  website: string;
  moq: string;
  rating: number;
  shipToPrep: boolean;
  notes: string;
}

export interface PrepShipment {
  id: string;
  trackingNumber: string;
  supplierName: string;
  productTitle: string;
  unitsCount: number;
  status: 'Ordered' | 'In Transit to Prep' | 'At Prep Ninjas' | 'Prepped & Labeled' | 'En Route to FBA' | 'Received by Amazon';
  estDeliveryDate: string;
}

export const INITIAL_PRODUCTS: ProductDeal[] = [
  {
    id: 'deal-1',
    asin: 'B08X1Q9Z88',
    title: 'Silicone Trivet Mats Pack of 4 - Heat Resistant Hot Pads for Kitchen',
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Kole Imports & Wholesale',
    supplierUrl: 'https://www.koleimports.com',
    supplierPrice: 3.80,
    amazonPrice: 16.99,
    amazonReferralFee: 2.55,
    fbaFee: 4.35,
    prepFee: 1.50,
    inboundShipping: 0.80,
    netProfit: 3.99,
    roiPercent: 105,
    isUngated: true,
    estMonthlySales: 420,
    bsrRank: 12450,
    status: 'Candidate',
  },
  {
    id: 'deal-2',
    asin: 'B09J8K7L6M',
    title: 'Silicone Chair Leg Protectors for Hardwood Floors - 16 Pack Transparent',
    category: 'Tools & Home Improvement',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
    supplierName: 'WebstaurantStore B2B',
    supplierUrl: 'https://www.webstaurantstore.com',
    supplierPrice: 2.90,
    amazonPrice: 14.49,
    amazonReferralFee: 2.17,
    fbaFee: 3.85,
    prepFee: 1.50,
    inboundShipping: 0.70,
    netProfit: 3.37,
    roiPercent: 116,
    isUngated: true,
    estMonthlySales: 680,
    bsrRank: 8320,
    status: 'In Review',
  },
  {
    id: 'deal-3',
    asin: 'B07V2C4N5P',
    title: 'Collapsible Dog Bowls Silicone 2-Pack with Carabiners for Travel',
    category: 'Pet Supplies',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80',
    supplierName: 'DollarDays Wholesale',
    supplierUrl: 'https://www.dollardays.com',
    supplierPrice: 2.45,
    amazonPrice: 13.99,
    amazonReferralFee: 2.10,
    fbaFee: 3.90,
    prepFee: 1.50,
    inboundShipping: 0.65,
    netProfit: 3.39,
    roiPercent: 138,
    isUngated: true,
    estMonthlySales: 310,
    bsrRank: 18900,
    status: 'Purchased',
  },
  {
    id: 'deal-4',
    asin: 'B08N3M9K2L',
    title: 'Desktop Cable Organizer Clips Silicone - Pack of 10 Black',
    category: 'Office Products',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Staples Business Advantage',
    supplierUrl: 'https://www.staples.com',
    supplierPrice: 1.95,
    amazonPrice: 11.99,
    amazonReferralFee: 1.80,
    fbaFee: 3.50,
    prepFee: 1.50,
    inboundShipping: 0.50,
    netProfit: 2.74,
    roiPercent: 140,
    isUngated: true,
    estMonthlySales: 890,
    bsrRank: 5410,
    status: 'At Prep',
  },
  {
    id: 'deal-5',
    asin: 'B09R4T6Y7U',
    title: 'Microfiber Cleaning Cloths 12-Pack Heavy Duty Multi-Surface',
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Walmart Business Wholesale',
    supplierUrl: 'https://www.walmart.com',
    supplierPrice: 4.50,
    amazonPrice: 18.99,
    amazonReferralFee: 2.85,
    fbaFee: 4.80,
    prepFee: 1.50,
    inboundShipping: 0.90,
    netProfit: 4.44,
    roiPercent: 98,
    isUngated: true,
    estMonthlySales: 540,
    bsrRank: 11200,
    status: 'Live on Amazon',
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Kole Imports & Closeouts',
    category: 'General Merchandise / Kitchenware',
    website: 'https://www.koleimports.com',
    moq: '$100 min order',
    rating: 4.8,
    shipToPrep: true,
    notes: 'Excelente para utensílios de silicone, itens de casa e embalagens no atacado.',
  },
  {
    id: 'sup-2',
    name: 'WebstaurantStore B2B',
    category: 'Commercial Kitchen & Supplies',
    website: 'https://www.webstaurantstore.com',
    moq: 'Sem mínimo',
    rating: 4.9,
    shipToPrep: true,
    notes: 'Fornecedor industrial com descontos volumétricos e envio direto via UPS.',
  },
  {
    id: 'sup-3',
    name: 'DollarDays Wholesale',
    category: 'Bulk Consumer Goods / Pets / Office',
    website: 'https://www.dollardays.com',
    moq: '1 caixa master',
    rating: 4.6,
    shipToPrep: true,
    notes: 'Ótimo fornecedor para produtos de pets e organização de escritório.',
  },
  {
    id: 'sup-4',
    name: 'Faire Wholesale Marketplace',
    category: 'US Brand Wholesalers',
    website: 'https://www.faire.com',
    moq: 'Varia por marca ($150-$250)',
    rating: 4.9,
    shipToPrep: true,
    notes: 'Plataforma oficial B2B com termos de pagamento Net-60 para LLCs.',
  }
];

export const INITIAL_SHIPMENTS: PrepShipment[] = [
  {
    id: 'ship-101',
    trackingNumber: '1Z9999999999999991',
    supplierName: 'Kole Imports',
    productTitle: 'Silicone Trivet Mats Pack of 4',
    unitsCount: 50,
    status: 'In Transit to Prep',
    estDeliveryDate: '2026-09-14',
  },
  {
    id: 'ship-102',
    trackingNumber: '1Z9999999999999992',
    supplierName: 'DollarDays Wholesale',
    productTitle: 'Collapsible Dog Bowls Silicone 2-Pack',
    unitsCount: 50,
    status: 'At Prep Ninjas',
    estDeliveryDate: '2026-09-11',
  },
  {
    id: 'ship-103',
    trackingNumber: '1Z9999999999999993',
    supplierName: 'Staples Business Advantage',
    productTitle: 'Desktop Cable Organizer Clips Silicone 10-Pack',
    unitsCount: 100,
    status: 'Prepped & Labeled',
    estDeliveryDate: '2026-09-10',
  }
];
