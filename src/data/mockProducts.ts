export interface ProductDeal {
  id: string;
  asin: string;
  sku?: string;
  ncm?: string;
  title: string;
  category: string;
  imageUrl: string;
  supplierName: string;
  supplierUrl: string;
  supplierPrice: number; // in local currency (USD or BRL)
  amazonPrice: number; // in local currency
  amazonReferralFee: number; // in local currency (~15%)
  fbaFee: number; // in local currency
  prepFee: number; // in local currency
  inboundShipping: number; // in local currency
  netProfit: number; // in local currency
  roiPercent: number; // %
  isUngated: boolean;
  estMonthlySales: number;
  bsrRank: number;
  status: 'Candidate' | 'In Review' | 'Purchased' | 'At Prep' | 'Live on Amazon';
  marketplace: 'Amazon US' | 'Amazon BR';
  currency: 'USD' | 'BRL';
  currentStock: number;
  warehouseLocation: string;
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
  country: 'US' | 'BR' | 'CN';
  cnpjOrEin?: string;
}

export interface PrepShipment {
  id: string;
  trackingNumber: string;
  supplierName: string;
  productTitle: string;
  unitsCount: number;
  status: 'Ordered' | 'In Transit to Prep' | 'At Prep Ninjas' | 'Prepped & Labeled' | 'En Route to FBA' | 'Received by Amazon';
  estDeliveryDate: string;
  origin?: string;
  destination?: string;
  carrier?: string;
  marketplace?: 'US' | 'BR';
}

export const INITIAL_PRODUCTS: ProductDeal[] = [
  // 🇺🇸 PRODUTO PILOTO OFICIAL EUA (HelpUS LLC)
  {
    id: 'prod-us-cableties-2026',
    asin: 'B0HLTXWCV7',
    sku: 'HU-SIL-CABLE-FBA-2026',
    title: 'HelpUS Reusable Silicone Cable Ties 20 Pack Cord Management Straps',
    category: 'Tools & Home Improvement',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Teshuai Silicone / Shandsome',
    supplierUrl: 'https://www.amazon.com/dp/B0HLTXWCV7',
    supplierPrice: 1.25,
    amazonPrice: 9.99,
    amazonReferralFee: 1.50,
    fbaFee: 6.05,
    prepFee: 1.50,
    inboundShipping: 0.80,
    netProfit: 1.87,
    roiPercent: 150,
    isUngated: true,
    estMonthlySales: 450,
    bsrRank: 14200,
    status: 'At Prep',
    marketplace: 'Amazon US',
    currency: 'USD',
    currentStock: 50,
    warehouseLocation: 'Prep Ninjas (UT) -> Amazon RYY2 (GA)'
  },

  // 🇧🇷 PRODUTOS PILOTO OFICIAIS BRASIL (Nativos do Brasil - NF-e Nº 00002509)
  {
    id: 'prod-br-nativos-01',
    asin: 'BR-RESVERATROL-60C',
    sku: 'NAT-RESV-60CAPS',
    ncm: '21069030',
    title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 25.76,
    amazonPrice: 79.90,
    amazonReferralFee: 11.98,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 21.42,
    roiPercent: 83,
    isUngated: true,
    estMonthlySales: 180,
    bsrRank: 4200,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },
  {
    id: 'prod-br-nativos-02',
    asin: 'BR-MAGNESIO-TREONATO-60C',
    sku: 'NAT-MAG-TREON-60C',
    ncm: '21069030',
    title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 15.80,
    amazonPrice: 59.90,
    amazonReferralFee: 8.98,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 14.38,
    roiPercent: 91,
    isUngated: true,
    estMonthlySales: 220,
    bsrRank: 3100,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },
  {
    id: 'prod-br-nativos-03',
    asin: 'BR-COQ10-VIT-E-60C',
    sku: 'NAT-COQ10-VITE-60C',
    ncm: '21069030',
    title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 21.26,
    amazonPrice: 69.90,
    amazonReferralFee: 10.48,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 17.42,
    roiPercent: 82,
    isUngated: true,
    estMonthlySales: 160,
    bsrRank: 5120,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },
  {
    id: 'prod-br-nativos-04',
    asin: 'BR-COLAGENO-VITC-60C',
    sku: 'NAT-COLAG-VITC-60C',
    ncm: '21069030',
    title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 17.93,
    amazonPrice: 54.90,
    amazonReferralFee: 8.23,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 8.00,
    roiPercent: 45,
    isUngated: true,
    estMonthlySales: 240,
    bsrRank: 2890,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },
  {
    id: 'prod-br-nativos-05',
    asin: 'BR-6-MAGNESIOS-60C',
    sku: 'NAT-6MAG-60C',
    ncm: '21069030',
    title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 18.41,
    amazonPrice: 59.90,
    amazonReferralFee: 8.98,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 13.77,
    roiPercent: 75,
    isUngated: true,
    estMonthlySales: 310,
    bsrRank: 1950,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },
  {
    id: 'prod-br-nativos-06',
    asin: 'BR-NAC-ACETILCISTEINA-60C',
    sku: 'NAT-NAC-60C',
    ncm: '21069030',
    title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil',
    category: 'Suplementos & Vitaminas',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&auto=format&fit=crop&q=80',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 17.57,
    amazonPrice: 54.90,
    amazonReferralFee: 8.23,
    fbaFee: 14.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 8.36,
    roiPercent: 48,
    isUngated: true,
    estMonthlySales: 190,
    bsrRank: 3840,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'Braspress em trânsito -> Bessa (PB)'
  },

  // 🇺🇸 CANDIDATOS ADICIONAIS DE SOURCING (EUA Wholesale)
  {
    id: 'deal-candidate-01',
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
    marketplace: 'Amazon US',
    currency: 'USD',
    currentStock: 0,
    warehouseLocation: 'Sourcing Pipeline'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-prep-ninjas',
    name: 'Prep Ninjas LLC (US 3PL & Prep Center)',
    category: 'FBA Prep, FNSKU Labeling & Logistics Hub',
    website: 'https://prepninjas.com',
    moq: 'Sem mínimo (On-demand)',
    rating: 5.0,
    shipToPrep: true,
    notes: 'Centro de preparação oficial nos EUA (Salt Lake City, UT / Springfield, OR). Responsável por receber lotes da China/EUA, inspeção de qualidade, aplicação de etiquetas FNSKU ($1.50) e despacho UPS Ground direto para os galpões FBA da Amazon.',
    country: 'US'
  },
  {
    id: 'sup-nativos',
    name: 'Nativos do Brasil Produtos Naturais Ltda',
    category: 'Indústria & Atacado de Suplementos Naturais',
    website: 'https://www.nativosdobrasil.com.br',
    moq: '30 frascos (Atacado B2B)',
    rating: 4.9,
    shipToPrep: true,
    notes: 'Fornecedor principal no Brasil (Vila Velha/ES). Fabricante dos 6 SKUs de suplementos de alta rotatividade. Pedido Piloto #3404 pago via PIX (R$ 710,82), com NF-e Nº 00002509 emitida e envio via Braspress para João Pessoa.',
    country: 'BR',
    cnpjOrEin: '47.693.854/0001-64'
  },
  {
    id: 'sup-teshuai',
    name: 'Teshuai Silicone Manufacturing Co.',
    category: 'Fabricante OEM de Silicone & Utensílios',
    website: 'https://teshuai.en.alibaba.com',
    moq: '500 unidades',
    rating: 4.8,
    shipToPrep: true,
    notes: 'Fabricante do produto piloto Reusable Silicone Cable Ties 20-Pack. Em conformidade com normas de aviso de sufocação em polybag e marcação Made in China (Commercial Invoice S-215).',
    country: 'CN'
  },
  {
    id: 'sup-carolyn',
    name: 'Carolyn (Shandsome Packaging & Sourcing)',
    category: 'Embalagens, Acessórios & Insumos Retail',
    website: 'https://shandsome.com',
    moq: 'Variável',
    rating: 4.7,
    shipToPrep: true,
    notes: 'Fornecedora parceira de insumos de acabamento, cartões informativos e embalagens para a HelpUS LLC (Invoice 2026.10.16).',
    country: 'CN'
  },
  {
    id: 'sup-kole',
    name: 'Kole Imports & Closeouts',
    category: 'Distribuidor Atacadista EUA',
    website: 'https://www.koleimports.com',
    moq: '$100 min order',
    rating: 4.8,
    shipToPrep: true,
    notes: 'Excelente parceiro atacadista nos EUA para novos testes de produtos em Home & Kitchen com envio rápido para Prep Ninjas.',
    country: 'US'
  }
];

export const INITIAL_SHIPMENTS: PrepShipment[] = [
  {
    id: 'ship-fba-us-01',
    trackingNumber: '1Z999999999999RYY2',
    supplierName: 'Teshuai / Prep Ninjas',
    productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack (ASIN B0HLTXWCV7)',
    unitsCount: 50,
    status: 'En Route to FBA',
    estDeliveryDate: '2026-11-04',
    origin: 'Prep Ninjas (Salt Lake City, UT)',
    destination: 'Amazon Fulfillment Center RYY2 (White, GA)',
    carrier: 'UPS Ground',
    marketplace: 'US'
  },
  {
    id: 'ship-br-braspress-01',
    trackingNumber: 'BRASPRESS-CTE-2509',
    supplierName: 'Nativos do Brasil (NF-e Nº 00002509)',
    productTitle: 'Lote 30 Frascos Suplementos (6 SKUs Campeões)',
    unitsCount: 30,
    status: 'In Transit to Prep',
    estDeliveryDate: '2026-11-11',
    origin: 'Vila Velha / ES',
    destination: 'HelpUS Filial Bessa (João Pessoa / PB)',
    carrier: 'Braspress Cargas Expressas',
    marketplace: 'BR'
  }
];
