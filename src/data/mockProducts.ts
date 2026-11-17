export interface ProductDeal {
  id: string;
  asin: string;
  sku?: string;
  ncm?: string;
  title: string;
  category: string;
  imageUrl: string;
  fichaUrl?: string;
  secondaryImages?: string[];
  bulletPoints?: string[];
  logisticsModel?: 'FBA' | 'DBA';
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
  contactEmail?: string;
  contactPhone?: string;
  cityState?: string;
  relationshipStatus?: 'Active Supplier' | 'Contract Homologated' | 'RFQ Quoted' | 'Pipeline';
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
    imageUrl: '/images/marketing/cable-ties/1.jpg',
    secondaryImages: [
      '/images/marketing/cable-ties/2.jpg',
      '/images/marketing/cable-ties/3.jpg',
      '/images/marketing/cable-ties/4.jpg',
      '/images/marketing/cable-ties/5.jpg',
      '/images/marketing/cable-ties/6.jpg',
      '/images/marketing/cable-ties/7.jpg'
    ],
    bulletPoints: [
      'Reusable High-Elasticity Silicone: Eco-friendly, durable, and weather resistant.',
      '20-Pack Multicolor Kit: Multiple vibrant colors for visual wire coding and cable organization.',
      'Compact & Lightweight: Pack weight 0.16 lb (2.5 oz), reduced FBA standard tier tiering.',
      'Multipurpose Utility: Perfect for home, office, kitchen appliance cords, and travel cable management.'
    ],
    logisticsModel: 'FBA',
    supplierName: 'Teshuai Silicone / Shandsome',
    supplierUrl: 'https://www.amazon.com/dp/B0HLTXWCV7',
    supplierPrice: 1.25,
    amazonPrice: 12.99,
    amazonReferralFee: 1.95,
    fbaFee: 4.11, // Tarifa reclassificada após ajuste de peso para 0.16 lb no FBA Revenue Calculator
    prepFee: 1.50,
    inboundShipping: 0.80,
    netProfit: 3.38,
    roiPercent: 95,
    isUngated: true,
    estMonthlySales: 450,
    bsrRank: 14200,
    status: 'Live on Amazon',
    marketplace: 'Amazon US',
    currency: 'USD',
    currentStock: 50,
    warehouseLocation: 'Prep Ninjas (UT) -> Amazon FC RYY2 (White, GA)'
  },

  // 🇧🇷 PRODUTOS PILOTO OFICIAIS BRASIL (Nativos do Brasil - NF-e Nº 00002509 - Modalidade DBA João Pessoa/PB)
  {
    id: 'prod-br-nativos-01',
    asin: 'BR-RESVERATROL-60C',
    sku: 'NAT-RESV-60CAPS-01',
    ncm: '21069030',
    title: 'Resveratrol Puro Concentrado 60 Cápsulas Softgel Nativos do Brasil - Poderoso Antioxidante e Longevidade Celular',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/01_Resveratrol_60caps_Amazon.png',
    fichaUrl: '/images/nativos/01_resveratrol_ficha.jpg',
    secondaryImages: [
      '/images/prontas_amazon/01_Resveratrol_Completo_Amazon.png',
      '/images/nativos/01_resveratrol_beneficios.jpg'
    ],
    bulletPoints: [
      'Poderoso Antioxidante Natural: Auxilia na proteção contra o estresse oxidativo e radicais livres.',
      'Ação Antienvelhecimento: Contribui para a vitalidade da pele e saúde cardiovascular celular.',
      'Absorção Rápida: Apresentação em cápsulas softgel de alta biodisponibilidade.',
      'Fórmula Pura e Segura: Frasco lacrado de fábrica com 60 cápsulas.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 25.76,
    amazonPrice: 69.90,
    amazonReferralFee: 10.49,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 16.91,
    roiPercent: 56,
    isUngated: true,
    estMonthlySales: 180,
    bsrRank: 4200,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },
  {
    id: 'prod-br-nativos-02',
    asin: 'BR-MAGNESIO-TREONATO-60C',
    sku: 'NAT-MAGTREON-60CAPS-01',
    ncm: '21069030',
    title: 'Magnésio L-Treonato 60 Cápsulas Nativos do Brasil - Foco, Memória e Clareza Mental',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/02_Magnesio_L_Treonato_60caps_Amazon.png',
    fichaUrl: '/images/nativos/02_magnesio_treonato_completo.jpg',
    secondaryImages: [
      '/images/prontas_amazon/02_Magnesio_L_Treonato_Completo_Amazon.png',
      '/images/nativos/02_magnesio_treonato_criativo.jpg'
    ],
    bulletPoints: [
      'Suporte Cognitivo Avançado: O Magnésio L-Treonato atravessa a barreira hematoencefálica.',
      'Memória e Concentração: Auxilia na retenção de memória, foco diário e clareza mental.',
      'Qualidade do Sono: Favorece o relaxamento neural e um descanso reparador.',
      '60 Cápsulas: Suplementação prática diária com máxima tolerância gástrica.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 15.80,
    amazonPrice: 59.90,
    amazonReferralFee: 8.99,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 18.37,
    roiPercent: 92,
    isUngated: true,
    estMonthlySales: 220,
    bsrRank: 3100,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },
  {
    id: 'prod-br-nativos-03',
    asin: 'BR-COQ10-VIT-E-60C',
    sku: 'NAT-COQ10-60CAPS-01',
    ncm: '21069030',
    title: 'Coenzima Q10 Co-Q10 com Vitamina E 60 Cápsulas Nativos do Brasil - Energia Celular e Saúde do Coração',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/03_Co_Q10_VitaE_60caps_Amazon.png',
    fichaUrl: '/images/nativos/03_co_q10_ficha.jpg',
    secondaryImages: [
      '/images/prontas_amazon/03_Co_Q10_Completo_Amazon.png'
    ],
    bulletPoints: [
      'Produção de Energia Mitocondrial (ATP): Vital para níveis de disposição física diária.',
      'Saúde Cardiovascular: Essencial para o bom funcionamento do músculo cardíaco e circulação.',
      'Enriquecida com Vitamina E: Sinergia antioxidante que potencializa a absorção celular.',
      'Tratamento Completo: Frasco lacrado com 60 cápsulas para 30 a 60 dias.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 21.26,
    amazonPrice: 64.90,
    amazonReferralFee: 9.74,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 17.16,
    roiPercent: 67,
    isUngated: true,
    estMonthlySales: 160,
    bsrRank: 5120,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },
  {
    id: 'prod-br-nativos-04',
    asin: 'BR-COLAGENO-VITC-60C',
    sku: 'NAT-COLAG-60CAPS-01',
    ncm: '21069030',
    title: 'Colágeno Hidrolisado com Vitamina C 60 Cápsulas Nativos do Brasil - Firmeza da Pele, Unhas e Cabelos',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/04_Colageno_Hidrolisado_60caps_Amazon.png',
    fichaUrl: '/images/nativos/04_colageno_completo.jpg',
    secondaryImages: [
      '/images/prontas_amazon/04_Colageno_Hidrolisado_Completo_Amazon.png'
    ],
    bulletPoints: [
      'Elasticidade e Firmeza da Pele: Estimula a reposição natural do colágeno.',
      'Fortalecimento de Cabelos e Unhas: Reduz a fragilidade e quebra.',
      'Com Vitamina C: Cofator essencial e obrigatório para a síntese biológica de colágeno.',
      'Cápsulas Práticas: Sem sabor residual, facilitando o consumo no dia a dia.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 17.93,
    amazonPrice: 49.90,
    amazonReferralFee: 7.49,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 7.74,
    roiPercent: 35,
    isUngated: true,
    estMonthlySales: 240,
    bsrRank: 2890,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },
  {
    id: 'prod-br-nativos-05',
    asin: 'BR-6-MAGNESIOS-60C',
    sku: 'NAT-6MAG-60CAPS-01',
    ncm: '21069030',
    title: 'Complexo 6 Magnésios 60 Cápsulas Nativos do Brasil - Dimalato, Taurato, Bisglicinato, Treonato, Citrato e Óxido',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/05_6_Magnesios_60caps_Amazon.png',
    fichaUrl: '/images/nativos/05_6_magnesios_ficha.jpg',
    secondaryImages: [
      '/images/prontas_amazon/05_6_Magnesios_Completo_Amazon.png'
    ],
    bulletPoints: [
      'Fórmula Multi-Ação 6 em 1: Reúne 6 das melhores formas biodisponíveis de magnésio.',
      'Alívio Muscular e Menos Câimbras: Suporte completo para contração muscular e articulações.',
      'Redução do Estresse e Tensão: Auxilia no equilíbrio do sistema nervoso e relaxamento físico.',
      'Biodisponibilidade Máxima: Absorção gradual e eficiente em diferentes tecidos.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 18.41,
    amazonPrice: 54.90,
    amazonReferralFee: 8.24,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 11.51,
    roiPercent: 51,
    isUngated: true,
    estMonthlySales: 310,
    bsrRank: 1950,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },
  {
    id: 'prod-br-nativos-06',
    asin: 'BR-NAC-ACETILCISTEINA-60C',
    sku: 'NAT-NAC-60CAPS-01',
    ncm: '21069030',
    title: 'NAC N-Acetilcisteína 60 Cápsulas Nativos do Brasil - Imunidade, Saúde Pulmonar e Precursor de Glutationa',
    category: 'Suplementos & Vitaminas',
    imageUrl: '/images/prontas_amazon/06_NAC_Acetilcisteina_60caps_Amazon.png',
    fichaUrl: '/images/nativos/06_nac_ficha.jpg',
    secondaryImages: [
      '/images/prontas_amazon/06_NAC_Acetilcisteina_Completo_Amazon.png'
    ],
    bulletPoints: [
      'Precursor da Glutationa: Estimula a produção do antioxidante mestre do organismo humano.',
      'Saúde Respiratória e Pulmonar: Auxilia na fluidez e eliminação de secreções das vias aéreas.',
      'Desintoxicação Celular e Hepática: Suporte vital para o fígado na neutralização de toxinas.',
      'Defesa Imunológica Reforçada: Fortalece o sistema imune contra agressões externas.'
    ],
    logisticsModel: 'DBA',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    supplierUrl: 'https://www.nativosdobrasil.com.br',
    supplierPrice: 17.57,
    amazonPrice: 59.90,
    amazonReferralFee: 8.99,
    fbaFee: 12.50,
    prepFee: 2.00,
    inboundShipping: 4.24,
    netProfit: 16.60,
    roiPercent: 76,
    isUngated: true,
    estMonthlySales: 190,
    bsrRank: 3840,
    status: 'In Review',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 5,
    warehouseLocation: 'HelpUS Bessa (João Pessoa/PB) - Coleta DBA'
  },

  // 🇧🇷 NOVOS PRODUTOS EM HOMOLOGAÇÃO: OPERAÇÃO BRASIL SKINCARE REMOTO (FBA Cajamar/SP)
  {
    id: 'prod-br-skincare-kit-01',
    asin: 'BR-SKINCARE-KIT4-SP',
    sku: 'HU-SKIN-KIT4-FBA-SP',
    title: 'Kit Skincare Facial Completo 4 Itens - Sérum Vitamina C, Ácido Hialurônico, Gel Esfoliante & Sabonete Limpeza Profunda',
    category: 'Beleza & Cuidados Pessoais (Skincare)',
    imageUrl: '/images/skincare/kit_skincare_derma.jpg',
    bulletPoints: [
      'Rotina Completa 4 em 1: Limpeza profunda, esfoliação suave, hidratação hialurônica e ação antioxidante com Vitamina C.',
      'Marcas Homologadas de São Paulo: Fornecimento direto do polo do Brás/Pari (Distribuidora JCF / RosaGiro).',
      'Operação 100% Remota FBA: Prep Center GrinStore/PrepTag em SP prepara o kitting e despacha ao CD Cajamar.',
      'Alta Demanda no Brasil: Categoria campeã de recorrência de compra e ticket médio saudável na Amazon Brasil.'
    ],
    logisticsModel: 'FBA',
    supplierName: 'Distribuidora JCF (Brás/SP) & GrinStore Prep',
    supplierUrl: 'https://www.jcfvariedades.com.br',
    supplierPrice: 36.00,
    amazonPrice: 89.90,
    amazonReferralFee: 13.49,
    fbaFee: 16.95,
    prepFee: 3.50,
    inboundShipping: 1.50,
    netProfit: 18.46,
    roiPercent: 45,
    isUngated: true,
    estMonthlySales: 380,
    bsrRank: 1420,
    status: 'Candidate',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 0,
    warehouseLocation: 'Prep Center GrinStore (SP) -> Amazon FBA Cajamar/Betim'
  },
  {
    id: 'prod-br-dyusar-kit-02',
    asin: 'BR-DYUSAR-CRONO-3P',
    sku: 'HU-DYUSAR-HAIR3-SP',
    title: 'Kit Cronograma Capilar Profissional 3 Passos Dyusar - Hidratação, Nutrição & Reconstrução Intensiva',
    category: 'Beleza & Cuidados Pessoais (Skincare)',
    imageUrl: '/images/skincare/kit_dyusar_hair.jpg',
    bulletPoints: [
      'Tratamento Profissional Salon Grade: Três máscaras concentradas para cronograma capilar de alto impacto.',
      'Frascos de Alta Densidade: Formulações ricas em aminoácidos, óleos nobres e queratina hidrolisada.',
      'Faturamento Direto CNPJ HelpUS: Parceria B2B com a Dyusar Professional Hair para atacado e fulfillment.',
      'Embalagem Segura com Selagem: Kitting e shrink wrap especializado executado por Prep Center parceiro em SP.'
    ],
    logisticsModel: 'FBA',
    supplierName: 'Dyusar Professional Hair & PrepTag SP',
    supplierUrl: 'https://www.dyusar.com.br',
    supplierPrice: 48.00,
    amazonPrice: 119.90,
    amazonReferralFee: 17.99,
    fbaFee: 18.50,
    prepFee: 3.50,
    inboundShipping: 2.00,
    netProfit: 29.91,
    roiPercent: 56,
    isUngated: true,
    estMonthlySales: 260,
    bsrRank: 2150,
    status: 'Candidate',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    currentStock: 0,
    warehouseLocation: 'Prep Center PrepTag (Mooca/SP) -> Amazon FBA Cajamar'
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
  // --- ESTADOS UNIDOS (3PL, DISTRIBUIDORES & ATACADO) ---
  {
    id: 'sup-prep-ninjas',
    name: 'Prep Ninjas LLC (US 3PL & Prep Center)',
    category: 'FBA Prep, FNSKU Labeling & Logistics Hub',
    website: 'https://prepninjas.com',
    moq: 'Sem mínimo (On-demand)',
    rating: 5.0,
    shipToPrep: true,
    country: 'US',
    cityState: 'Springfield, OR / Salt Lake City, UT',
    relationshipStatus: 'Active Supplier',
    contactEmail: 'support@prepninjas.com',
    notes: 'Prep center oficial da HelpUS LLC nos EUA (5250 Highbanks Rd Ste 350, Springfield, OR 97478). Recebeu o lote piloto de 50 packs da China, executou inspeção, etiquetagem FNSKU ($1.50/un) e expedição UPS Ground direto para o CD Amazon RYY2 (White, GA). Fatura #1998 quitada.'
  },
  {
    id: 'sup-electriduct',
    name: 'Electriduct Cable Management',
    category: 'Distribuidor Atacadista B2B & Acessórios',
    website: 'https://www.electriduct.com',
    moq: '25 a 50 packs (Pronta Entrega)',
    rating: 4.9,
    shipToPrep: true,
    country: 'US',
    cityState: 'Fort Myers, FL',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'sales@electriduct.com',
    notes: 'Grande distribuidor de cabeamento e amarres nos EUA. Cotação formal disparada (Ticket #211234) para fornecimento de tiras de silicone reutilizáveis com frete rápido UPS Ground (2 a 5 dias) para o galpão da Prep Ninjas.'
  },
  {
    id: 'sup-cableorganizer',
    name: 'CableOrganizer.com Wholesale',
    category: 'Distribuidor Nacional de Cabos & Tiras',
    website: 'https://www.cableorganizer.com',
    moq: '50 unidades',
    rating: 4.8,
    shipToPrep: true,
    country: 'US',
    cityState: 'Flórida, EUA',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'sales@cableorganizer.com',
    notes: 'Distribuidor líder de organizadores e tiras de amarração nos EUA. Fornecimento nacional para reposição emergencial de estoque FBA com entrega expressa.'
  },
  {
    id: 'sup-kablekontrol',
    name: 'Kable Kontrol Wholesale USA',
    category: 'Atacadista Industrial & B2B Cable Ties',
    website: 'https://www.kablekontrol.com',
    moq: '100 unidades',
    rating: 4.8,
    shipToPrep: true,
    country: 'US',
    cityState: 'EUA',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'info@kablekontrol.com',
    notes: 'Fornecedor de linha pesada de tiras e presilhas reutilizáveis. Cotação de teste enviada pela HelpUS para expansão da linha de utilidades FBA.'
  },
  {
    id: 'sup-cabletiesupply',
    name: 'Cable Tie Supply USA',
    category: 'Distribuidor Especializado de Presilhas',
    website: 'https://www.cabletiesupply.com',
    moq: '50 packs',
    rating: 4.7,
    shipToPrep: true,
    country: 'US',
    cityState: 'EUA',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'support@cabletiesupply.com',
    notes: 'Catálogo completo de presilhas plásticas e de silicone com envio Ground para todos os estados americanos.'
  },
  {
    id: 'sup-wirecare',
    name: 'Wirecare USA',
    category: 'Acessórios & Fios Reutilizáveis',
    website: 'https://www.wirecare.com',
    moq: 'Variável',
    rating: 4.8,
    shipToPrep: true,
    country: 'US',
    cityState: 'EUA',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'info@wirecare.com',
    notes: 'Distribuidor de tiras e organizadores de alta durabilidade com pronta entrega para reabastecimento FBA.'
  },
  {
    id: 'sup-qualityimprint',
    name: 'QualityImprint Wholesale USA',
    category: 'Importador & Atacadista B2B em Lote',
    website: 'https://www.qualityimprint.com',
    moq: '100 packs',
    rating: 4.7,
    shipToPrep: true,
    country: 'US',
    cityState: 'EUA',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'care@qualityimprint.com',
    notes: 'Importador de utilidades e brindes promocionais em grande escala para varejo americano.'
  },
  {
    id: 'sup-kole',
    name: 'Kole Imports & Closeouts',
    category: 'Distribuidor Atacadista de General Merchandise',
    website: 'https://www.koleimports.com',
    moq: '$100 min order',
    rating: 4.8,
    shipToPrep: true,
    country: 'US',
    cityState: 'Carson, CA',
    relationshipStatus: 'Active Supplier',
    notes: 'Parceiro atacadista nos EUA para novos testes de produtos em Home & Kitchen com envio direto para a Prep Ninjas.'
  },

  // --- CHINA (FABRICANTES OEM & SOURCING DIRETO) ---
  {
    id: 'sup-teshuai',
    name: 'Dongguan HuiXie Hardware / Teshuai Electric Co., Ltd.',
    category: 'Fabricante OEM Direto de Silicone (Carolyn Zhuo)',
    website: 'https://teshuai.en.alibaba.com',
    moq: '50 packs (Lote Piloto) / 2.500 packs (Escala)',
    rating: 5.0,
    shipToPrep: true,
    country: 'CN',
    cityState: 'Dongguan, Guangdong',
    relationshipStatus: 'Active Supplier',
    contactEmail: 'carolyn@shandsome.com',
    contactPhone: '+86 18218406024',
    notes: 'Fabricante oficial do lote piloto de 50 packs (1.000 tiras) S-215 (21.5cm, 10 cores) com aviso de sufocação em polybag. Pedido Alibaba Trade Assurance #318233495001023698 ($419.00 USD quitado via DDP Air para Prep Ninjas no Oregon). Contato direto: Carolyn Zhuo / Lam Deng.'
  },
  {
    id: 'sup-kean-silicone',
    name: 'Shenzhen Kean Silicone Product Co., Ltd.',
    category: 'Moldagem de Silicone OEM/ODM & Food-Grade',
    website: 'https://keansilicone.en.alibaba.com',
    moq: '500 packs',
    rating: 4.9,
    shipToPrep: true,
    country: 'CN',
    cityState: 'Shenzhen, Guangdong',
    relationshipStatus: 'Contract Homologated',
    contactEmail: 'lydia@keansilicone.com',
    notes: 'Fabricante certificado ISO/FDA de silicone líquido. Negociação conduzida com Lydia Luo; homologado como fornecedor de backup e desenvolvimento de moldes customizados exclusivos HelpUS.'
  },
  {
    id: 'sup-hct-silicone',
    name: 'HCT Silicone Cable Tie Co., Ltd.',
    category: 'Fabricante Especializado em Tiras de Silicone',
    website: 'https://www.hcabletie.com',
    moq: '1.000 packs',
    rating: 4.8,
    shipToPrep: true,
    country: 'CN',
    cityState: 'Guangdong',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'info@hcabletie.com',
    notes: 'Fabricante direto de organizadores em silicone alimentício. Cotação técnica entregue para futura expansão de catálogo.'
  },
  {
    id: 'sup-shangbo',
    name: 'Shangbo Plastics Co., Ltd. (Wenzhou Difvan)',
    category: 'Indústria B2B de Amarres há 20+ Anos',
    website: 'https://www.cabletiesmanufacturer.com',
    moq: '2.000 packs',
    rating: 4.8,
    shipToPrep: true,
    country: 'CN',
    cityState: 'Wenzhou / Anhui',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'info@cabletiesmanufacturer.com',
    notes: 'Grande planta industrial na China representada por Riley Fang. Mantido para negociações de containers fechados e grandes tiragens.'
  },
  {
    id: 'sup-taimei',
    name: 'Dongguan Taimei Silicone Product Co.',
    category: 'Artefatos de Silicone & Injeção',
    website: 'https://taimeiwatch.en.alibaba.com',
    moq: '100 pcs',
    rating: 4.5,
    shipToPrep: true,
    country: 'CN',
    cityState: 'Dongguan, Guangdong',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'bin@taimeiwatch.com',
    notes: 'Cotação recebida de Bin ($60/100pcs + $50 DHL). Custo unitário superior para revenda, mantido no banco como fornecedor alternativo.'
  },

  // --- BRASIL (PREP CENTERS, DOMICÍLIO FISCAL & LOGÍSTICA) ---
  {
    id: 'sup-grinstore',
    name: 'GrinStore Prep Center & Domicílio Fiscal',
    category: 'Prep Center FBA/Full & Domicílio Fiscal SEFAZ-SP',
    website: 'https://www.grinstore.com.br',
    moq: 'Sem mínimo para parceiros FBA',
    rating: 5.0,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Vargem Grande Paulista / SP',
    relationshipStatus: 'Active Supplier',
    contactEmail: 'contato@grinstore.com.br',
    notes: 'Galpão em Vargem Grande Paulista/SP gerido por Rafoul Marcos. Jurídico autorizou formalmente a transferência do MEI HelpUS (CNPJ 67.813.719/0001-12) para emissão de Inscrição Estadual SEFAZ-SP. Executa kitting, montagem de kits e envio consolidado aos galpões FBA da Amazon em Cajamar/SP.'
  },
  {
    id: 'sup-preptag',
    name: 'PrepTag Logística (Mooca - SP)',
    category: 'Prep Center, Kitting & Endereço Fiscal',
    website: 'https://www.preptag.com.br',
    moq: 'Sem mínimo',
    rating: 4.9,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Mooca, São Paulo / SP',
    relationshipStatus: 'Contract Homologated',
    contactEmail: 'comercial@preptag.com.br',
    notes: 'Prep center na Mooca especializado em cosméticos e kitting para e-commerce. Endereço fiscal cotado (R$ 839,16/ano) e expedição diária para os centros de distribuição da Amazon.'
  },
  {
    id: 'sup-loghouse',
    name: 'LogHouse Prep & Fulfillment',
    category: 'Parceiro Oficial SPN Amazon SP (Kitting & FBA)',
    website: 'https://www.loghouse.com.br',
    moq: 'Sem mínimo',
    rating: 4.8,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'comercial@loghouse.com.br',
    notes: 'Membro oficial da rede de prestadores de serviços da Amazon (SPN). Cotação enviada para serviços de armazenagem e preparação.'
  },
  {
    id: 'sup-rwfull',
    name: 'RW Full Fulfillment & Prep',
    category: 'Prep Center Especializado em Full & FBA',
    website: 'https://rwfull.com.br',
    moq: 'Sem mínimo',
    rating: 4.7,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactPhone: '(11) 99481-1464',
    notes: 'Estrutura logística dedicada para montagem de kits, etiquetagem e despacho rápido para marketplaces.'
  },
  {
    id: 'sup-braspress',
    name: 'Braspress Transportes Urgentes',
    category: 'Operador Logístico Rodoviário & Coletas DBA',
    website: 'https://www.braspress.com',
    moq: 'Cargas Fracionadas',
    rating: 4.9,
    shipToPrep: true,
    country: 'BR',
    cityState: 'João Pessoa / PB & Nacional',
    relationshipStatus: 'Active Supplier',
    notes: 'Transportadora oficial responsável pelo frete do lote #3404 de 30 frascos (NF-e 00002509) até a filial de Bessa (João Pessoa/PB), com coletas integradas ao Delivery by Amazon (DBA).'
  },

  // --- BRASIL (INDÚSTRIAS & DISTRIBUIDORAS DE PRODUTOS) ---
  {
    id: 'sup-nativos',
    name: 'Nativos do Brasil Indústria e Comércio Ltda',
    category: 'Indústria & Atacado de Suplementos Naturais',
    website: 'https://www.nativosdobrasil.com.br',
    moq: '30 frascos (Atacado B2B)',
    rating: 5.0,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Vila Velha / ES',
    relationshipStatus: 'Active Supplier',
    cnpjOrEin: '47.693.854/0001-64',
    contactEmail: 'naturaisnativos@gmail.com',
    notes: 'Fabricante de nutracêuticos. Lote piloto #3404 de 30 frascos recebido em João Pessoa/PB via Braspress (NF-e 00002509, R$ 710,82 pago via PIX). Forneceu as tabelas nutricionais e fotos oficiais de estúdio para o cadastro no Delivery by Amazon (DBA).'
  },
  {
    id: 'sup-jcf',
    name: 'Distribuidora JCF Variedades (Brás - SP)',
    category: 'Distribuidora Atacadista de Skincare & Cosméticos',
    website: 'https://www.jcfvariedades.com.br',
    moq: 'R$ 200,00 (Frete Grátis SP > R$ 350)',
    rating: 4.9,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Brás, São Paulo / SP',
    relationshipStatus: 'Active Supplier',
    contactEmail: 'jcfvariedades@gmail.com',
    contactPhone: '(11) 98244-3988 / (11) 98692-0388',
    notes: 'Polo comercial do Brás. Distribuição de marcas líderes de giro rápido: Max Love, Ruby Rose, Phállebeauty, Porán e Vivai. Pronta entrega com faturamento para o CNPJ HelpUS e entrega expressa no galpão da GrinStore.'
  },
  {
    id: 'sup-rosagiro',
    name: 'RosaGiro Atacado de Maquiagens & Skincare',
    category: 'Distribuidora Atacadista (Pari - SP)',
    website: 'https://www.rosagiro.com.br',
    moq: 'R$ 300,00',
    rating: 4.8,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Pari, São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'rosagiroatacado@gmail.com',
    notes: 'Atacadista tradicional no Pari/SP com linhas completas de sabonetes faciais, séruns e cremes hidratantes para montagem de kits.'
  },
  {
    id: 'sup-atacadao-cosmeticos',
    name: 'Atacadão dos Cosméticos SP',
    category: 'Atacado de Cosméticos & Perfumaria',
    website: 'https://www.atacadaodoscosmeticos.net.br',
    moq: 'R$ 250,00',
    rating: 4.8,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'contato@atacadaodoscosmeticos.net.br',
    contactPhone: '(11) 97878-3787',
    notes: 'Distribuidor multimarcas com ampla oferta de produtos de higiene e cosméticos corporais.'
  },
  {
    id: 'sup-ciabeauty',
    name: 'Cia Beauty Atacado de Cosméticos',
    category: 'Distribuidora Especializada em Beleza & Skincare',
    website: 'https://www.ciabeauty.com.br',
    moq: 'R$ 200,00',
    rating: 4.7,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'sac@ciabeauty.com.br',
    contactPhone: '(11) 93369-9852',
    notes: 'Parceiro para cotação de produtos faciais e corporais com frete direto para prep centers na capital paulista.'
  },
  {
    id: 'sup-revenda-cosmeticos',
    name: 'Revenda de Cosméticos (Bom Retiro - SP)',
    category: 'Atacadista de Cosméticos & Acessórios',
    website: 'https://www.revendadecosmeticos.com.br',
    moq: 'R$ 300,00',
    rating: 4.7,
    shipToPrep: true,
    country: 'BR',
    cityState: 'Bom Retiro, São Paulo / SP',
    relationshipStatus: 'RFQ Quoted',
    contactEmail: 'contato@revendadecosmeticos.com.br',
    contactPhone: '(11) 97197-5967',
    notes: 'Distribuidora no Bom Retiro com foco em produtos de beleza, máscaras e séruns de alta rotação.'
  },
  {
    id: 'sup-dyusar',
    name: 'Dyusar Professional Hair',
    category: 'Fabricante de Cosméticos Capilares Profissionais',
    website: 'https://www.dyusar.com.br',
    moq: 'Tabela Atacado B2B',
    rating: 4.9,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'Contract Homologated',
    contactEmail: 'contato@dyusar.com.br',
    notes: 'Linha profissional de cronograma capilar e tratamento intensivo. Cotação disparada para fornecimento direto no CNPJ HelpUS com entrega programada nos prep centers de SP.'
  },
  {
    id: 'sup-oficialderma',
    name: 'Oficial Derma & Nutri (Oficial Farma)',
    category: 'Dermocosméticos & Farmácia de Manipulação/Linha Estética',
    website: 'https://www.oficialfarma.com.br',
    moq: 'Atacado B2B',
    rating: 4.9,
    shipToPrep: true,
    country: 'BR',
    cityState: 'São Paulo / SP',
    relationshipStatus: 'Contract Homologated',
    contactEmail: 'atendimento1@oficialfarma.com.br',
    notes: 'Catálogo de dermocosméticos e nutracêuticos de alta performance. Cotação oficial solicitada para faturamento direto com entrega em Prep Center homologado.'
  }
];

export const INITIAL_SHIPMENTS: PrepShipment[] = [
  {
    id: 'ship-fba-us-01',
    trackingNumber: '1Z03K4F16623668549',
    supplierName: 'Teshuai / Prep Ninjas',
    productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack (ASIN B0HLTXWCV7)',
    unitsCount: 50,
    status: 'Received by Amazon',
    estDeliveryDate: '2026-11-04',
    origin: 'Prep Ninjas (Springfield, OR)',
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
    status: 'Received by Amazon',
    estDeliveryDate: '2026-11-11',
    origin: 'Vila Velha / ES',
    destination: 'HelpUS Filial Bessa (João Pessoa / PB) - Estoque Local DBA',
    carrier: 'Braspress Cargas Expressas',
    marketplace: 'BR'
  },
  {
    id: 'ship-br-skincare-sp',
    trackingNumber: 'REMESSA-PILOTO-SP-01',
    supplierName: 'Distribuidora JCF (Brás/SP)',
    productTitle: 'Lote Piloto Kits Skincare Facial 4-em-1',
    unitsCount: 100,
    status: 'In Transit to Prep',
    estDeliveryDate: '2026-11-20',
    origin: 'Brás / São Paulo (SP)',
    destination: 'GrinStore Prep Center (Vargem Grande Paulista / SP) -> FBA Cajamar',
    carrier: 'Logística Própria Fornecedor SP',
    marketplace: 'BR'
  }
];
