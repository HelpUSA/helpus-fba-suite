export type Language = 'pt' | 'en' | 'es';

export interface TranslationDictionary {
  // Header
  activeAccount: string;
  marketLabel: string;
  fbaPartner: string;
  searchPlaceholder: string;
  saasModeBtn: string;

  // Sidebar
  mainNav: string;
  navOverview: string;
  navDealFinder: string;
  navCalculator: string;
  navPrepTracker: string;
  navSuppliers: string;
  navPitch: string;
  connectedTools: string;
  sidebarFooter: string;
  statusOnline: string;

  // Dashboard
  dashTitle: string;
  dashSubtitle: string;
  mineBtn: string;
  potentialProfit: string;
  grossRevenue: string;
  avgRoi: string;
  prepStatus: string;
  chartTitle: string;
  chartSubtitle: string;
  chartRevenue: string;
  chartCosts: string;
  chartNetProfit: string;
  opStatusTitle: string;
  featuredDealsTitle: string;
  featuredDealsSubtitle: string;
  viewAll: string;

  // Deal Finder
  finderTitle: string;
  finderSubtitle: string;
  exportCsv: string;
  addCandidate: string;
  searchLabel: string;
  searchPlaceholderInput: string;
  categoryLabel: string;
  minRoiLabel: string;
  colProduct: string;
  colSupplier: string;
  colPricing: string;
  colFees: string;
  colProfitRoi: string;
  colUngated: string;
  colAction: string;
  ungatedApproved: string;
  ungatedRequires: string;
  btnSimulateFees: string;

  // Add Modal
  modalTitle: string;
  modalProductTitle: string;
  modalAsin: string;
  modalCategory: string;
  modalSupplier: string;
  modalBuyPrice: string;
  modalSellPrice: string;
  modalCancel: string;
  modalSave: string;

  // Calculator
  calcTitle: string;
  calcSubtitle: string;
  dataSectionTitle: string;
  sellPriceLabel: string;
  buyPriceLabel: string;
  preppingFeeLabel: string;
  freightLabel: string;
  weightLabel: string;
  batchQtyLabel: string;
  resultUnitTitle: string;
  badgeProfitable: string;
  badgeLoss: string;
  unitNetProfitLabel: string;
  unitRoiLabel: string;
  breakdownTitle: string;
  refFeeLabel: string;
  fbaFeeLabel: string;
  prepFeeLabel: string;
  freightInboundLabel: string;
  supplierProductCostLabel: string;
  cleanNetProfitLabel: string;
  batchProjectionTitle: string;
  investmentLabel: string;
  revenueLabel: string;
  profitLabel: string;

  // Prep Tracker
  trackerTitle: string;
  trackerSubtitle: string;
  prepDashboardBtn: string;
  warehouseAddr: string;
  unitsInTransit: string;
  prepService: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;

  // Suppliers
  supTitle: string;
  supSubtitle: string;
  supShipsToPrep: string;
  supMoq: string;
  supVisitCatalog: string;

  // SaaS Pitch
  pitchHeroTag: string;
  pitchHeroTitle1: string;
  pitchHeroTitle2: string;
  pitchHeroSub: string;
  pitchFeature1Title: string;
  pitchFeature1Desc: string;
  pitchFeature2Title: string;
  pitchFeature2Desc: string;
  pitchFeature3Title: string;
  pitchFeature3Desc: string;
  pitchPricingTitle: string;
  pitchPricingSub: string;
  planStarter: string;
  planPro: string;
  planEnterprise: string;
  btnStartTrial: string;
  btnSubscribePro: string;
  btnContactSales: string;

  // Footer
  footerDesc: string;
  footerAddressTitle: string;
  footerAddress: string;
  footerContactTitle: string;
  footerPhone: string;
  footerEmail: string;
  footerRights: string;
}

export const i18n: Record<Language, TranslationDictionary> = {
  pt: {
    // Header
    activeAccount: 'HelpUS LLC',
    marketLabel: 'Amazon US (sellercentral.amazon.com)',
    fbaPartner: 'FBA Prep Partner: Prep Ninjas (EUA)',
    searchPlaceholder: 'Buscar ASIN, Produto, Fornecedor...',
    saasModeBtn: 'Modo Comercial SaaS',

    // Sidebar
    mainNav: 'Navegação Principal',
    navOverview: 'Visão Geral',
    navDealFinder: 'Deal Finder (Minerador)',
    navCalculator: 'Calculadora FBA & Prep',
    navPrepTracker: 'Rastreio Prep Ninjas',
    navSuppliers: 'Fornecedores EUA',
    navPitch: 'Apresentação SaaS',
    connectedTools: 'Ferramentas Conectadas',
    sidebarFooter: 'Plataforma configurada para os ecossistemas da Amazon US e Prep Ninjas',
    statusOnline: 'Online',

    // Dashboard
    dashTitle: 'Painel Executivo de Inteligência FBA',
    dashSubtitle: 'Acompanhe o potencial de faturamento, margens de lucro líquido, mineração de fornecedores dos EUA e status logístico no Prep Ninjas.',
    mineBtn: 'Minerar Novos Produtos',
    potentialProfit: 'Lucro Potencial (Lotes Teste)',
    grossRevenue: 'Faturamento Bruto Projetado',
    avgRoi: 'ROI Médio dos Produtos',
    prepStatus: 'Status no Prep Ninjas',
    chartTitle: 'Projeção Financeira de Lotes (Em Dólar)',
    chartSubtitle: 'Comparativo de Faturamento, Custos Totais e Lucro Líquido por Produto',
    chartRevenue: 'Faturamento',
    chartCosts: 'Custos Logísticos + Produto',
    chartNetProfit: 'Lucro Líquido',
    opStatusTitle: 'Status Operacional HelpUS',
    featuredDealsTitle: 'Produtos Candidatos em Destaque (Ungated)',
    featuredDealsSubtitle: 'Produtos sem restrição de marca prontos para o primeiro lote de teste',
    viewAll: 'Ver Todos',

    // Deal Finder
    finderTitle: 'Deal Finder (Central de Mineração de Produtos)',
    finderSubtitle: 'Filtre fornecedores dos EUA, verifique a margem líquida descontando FBA + Prep Ninjas e veja a liberação (Ungated).',
    exportCsv: 'Exportar CSV',
    addCandidate: 'Adicionar Produto Candidato',
    searchLabel: 'Buscar',
    searchPlaceholderInput: 'Buscar por ASIN, Nome ou Fornecedor...',
    categoryLabel: 'Categoria',
    minRoiLabel: 'ROI Mínimo:',
    colProduct: 'Produto & ASIN',
    colSupplier: 'Fornecedor EUA',
    colPricing: 'Custo / Venda',
    colFees: 'FBA + Prep Fees',
    colProfitRoi: 'Lucro Líq. / ROI',
    colUngated: 'Liberação (Ungated)',
    colAction: 'Ação',
    ungatedApproved: 'UNGATED (Liberado)',
    ungatedRequires: 'Requer Aprovação',
    btnSimulateFees: 'Simular Taxas',

    // Add Modal
    modalTitle: 'Adicionar Produto Candidato',
    modalProductTitle: 'Título do Produto',
    modalAsin: 'Código ASIN',
    modalCategory: 'Categoria',
    modalSupplier: 'Nome do Fornecedor EUA',
    modalBuyPrice: 'Preço de Compra ($)',
    modalSellPrice: 'Preço Venda Amazon ($)',
    modalCancel: 'Cancelar',
    modalSave: 'Salvar Produto no Deal Finder',

    // Calculator
    calcTitle: 'Calculadora de Margem FBA & Prep Ninjas',
    calcSubtitle: 'Simulação matemática exata em tempo real descontando todas as taxas da Amazon EUA e custos de manuseio no Prep Ninjas.',
    dataSectionTitle: 'Dados de Compra e Venda',
    sellPriceLabel: 'Preço de Venda na Amazon ($)',
    buyPriceLabel: 'Preço no Fornecedor ($)',
    preppingFeeLabel: 'Taxa Prep Ninjas ($/un)',
    freightLabel: 'Frete Interno / Inbound ($/un)',
    weightLabel: 'Peso do Produto (lbs)',
    batchQtyLabel: 'Lote de Teste (Quantidade)',
    resultUnitTitle: 'Resultado por Unidade Vendida',
    badgeProfitable: 'PRODUTO LUCRATIVO',
    badgeLoss: 'PREJUÍZO',
    unitNetProfitLabel: 'Lucro Líquido Unitário',
    unitRoiLabel: 'ROI Líquido',
    breakdownTitle: 'Detalhamento de Taxas & Custos (1 Unidade)',
    refFeeLabel: '(-) Comissão Amazon (Referral 15%):',
    fbaFeeLabel: '(-) Taxa Logística FBA (Fulfillment):',
    prepFeeLabel: '(-) Taxa Prep Ninjas (3PL):',
    freightInboundLabel: '(-) Frete Interno (Estimado):',
    supplierProductCostLabel: '(-) Custo do Produto no Fornecedor:',
    cleanNetProfitLabel: '(=) Lucro Limpo no Banco:',
    batchProjectionTitle: 'Projeção para Lote de {qty} Unidades:',
    investmentLabel: 'Investimento:',
    revenueLabel: 'Faturamento:',
    profitLabel: 'Lucro Líquido:',

    // Prep Tracker
    trackerTitle: 'Rastreamento Logístico Prep Ninjas (3PL)',
    trackerSubtitle: 'Acompanhamento em tempo real do fluxo do fornecedor até o galpão da Amazon FBA nos EUA.',
    prepDashboardBtn: 'Acessar Painel Prep Ninjas',
    warehouseAddr: 'Gulf Shores / US Warehouse',
    unitsInTransit: '200 Unidades (3 Lotes)',
    prepService: 'Inspeção + FNSKU Label',
    step1: 'Pedido Fornecedor',
    step2: 'Em Trânsito Prep',
    step3: 'No Prep Ninjas',
    step4: 'Etiquetado FNSKU',
    step5: 'Enviado p/ FBA',
    step6: 'Recebido Amazon',

    // Suppliers
    supTitle: 'Fornecedores Verificados dos EUA (Wholesale / B2B)',
    supSubtitle: 'Catálogo de distribuidores e atacadistas que vendem com invoice legal para LLCs e entregam no Prep Ninjas.',
    supShipsToPrep: 'Envio Prep Ninjas',
    supMoq: 'MOQ Mínimo:',
    supVisitCatalog: 'Visitar Catálogo',

    // SaaS Pitch
    pitchHeroTag: 'HelpUS FBA Suite • Plataforma Enterprise SaaS',
    pitchHeroTitle1: 'Automate Product Sourcing & Logistics for',
    pitchHeroTitle2: 'Amazon Sellers & US LLCs',
    pitchHeroSub: 'The ultimate all-in-one software engine connecting US Wholesale Suppliers, 3PL Prep Centers (Prep Ninjas), and Amazon Seller Central.',
    pitchFeature1Title: 'Automated Deal Mining',
    pitchFeature1Desc: 'Scans wholesale price sheets and liquidators to extract high-ROI products with zero brand ungating barriers.',
    pitchFeature2Title: '3PL Prep Center Sync',
    pitchFeature2Desc: 'Direct tracking integration with Prep Ninjas and US warehouses for automated FNSKU labeling and bundling.',
    pitchFeature3Title: 'Real-Time Margin Engine',
    pitchFeature3Desc: 'Exact net profit calculations accounting for Amazon Referral, FBA Fulfillment, Prep Fees, and Inbound Freight.',
    pitchPricingTitle: 'Planos Comerciais (SaaS Ready)',
    pitchPricingSub: 'Pronto para ser comercializado para marcas e vendedores da Amazon nos EUA',
    planStarter: 'Starter Plan',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Começar Teste',
    btnSubscribePro: 'Assinar Pro Suite',
    btnContactSales: 'Falar com Vendas',

    // Footer
    footerDesc: 'Plataforma oficial de automação de e-commerce, mineração de produtos e inteligência de vendas para Amazon FBA.',
    footerAddressTitle: 'Endereço Comercial Registrado',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, Estados Unidos',
    footerContactTitle: 'Contato Oficial HelpUS LLC',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS LLC. Todos os direitos reservados.',
  },

  en: {
    // Header
    activeAccount: 'HelpUS LLC',
    marketLabel: 'Amazon US (sellercentral.amazon.com)',
    fbaPartner: 'FBA Prep Partner: Prep Ninjas (USA)',
    searchPlaceholder: 'Search ASIN, Product, Supplier...',
    saasModeBtn: 'SaaS Commercial Mode',

    // Sidebar
    mainNav: 'Main Navigation',
    navOverview: 'Overview',
    navDealFinder: 'Deal Finder (Mining)',
    navCalculator: 'FBA & Prep Calculator',
    navPrepTracker: 'Prep Ninjas Tracker',
    navSuppliers: 'US Suppliers',
    navPitch: 'SaaS Presentation',
    connectedTools: 'Connected Tools',
    sidebarFooter: 'Platform configured for Amazon US & Prep Ninjas ecosystems',
    statusOnline: 'Online',

    // Dashboard
    dashTitle: 'FBA Executive Intelligence Dashboard',
    dashSubtitle: 'Track revenue potential, net profit margins, US supplier sourcing, and Prep Ninjas logistics status.',
    mineBtn: 'Mine New Products',
    potentialProfit: 'Potential Profit (Test Batches)',
    grossRevenue: 'Projected Gross Revenue',
    avgRoi: 'Average Product ROI',
    prepStatus: 'Prep Ninjas Status',
    chartTitle: 'Batch Financial Projection (in USD)',
    chartSubtitle: 'Revenue, Total Costs, and Net Profit comparison per product',
    chartRevenue: 'Revenue',
    chartCosts: 'Logistics + Product Costs',
    chartNetProfit: 'Net Profit',
    opStatusTitle: 'HelpUS Operational Status',
    featuredDealsTitle: 'Featured Candidate Products (Ungated)',
    featuredDealsSubtitle: 'Brand-unrestricted products ready for initial test batch',
    viewAll: 'View All',

    // Deal Finder
    finderTitle: 'Deal Finder (Product Sourcing Hub)',
    finderSubtitle: 'Filter US suppliers, check net margin deducting FBA + Prep Ninjas, and verify Ungated approval status.',
    exportCsv: 'Export CSV',
    addCandidate: 'Add Candidate Product',
    searchLabel: 'Search',
    searchPlaceholderInput: 'Search by ASIN, Name or Supplier...',
    categoryLabel: 'Category',
    minRoiLabel: 'Minimum ROI:',
    colProduct: 'Product & ASIN',
    colSupplier: 'US Supplier',
    colPricing: 'Buy / Sell Price',
    colFees: 'FBA + Prep Fees',
    colProfitRoi: 'Net Profit / ROI',
    colUngated: 'Approval (Ungated)',
    colAction: 'Action',
    ungatedApproved: 'UNGATED (Approved)',
    ungatedRequires: 'Requires Ungating',
    btnSimulateFees: 'Simulate Fees',

    // Add Modal
    modalTitle: 'Add Candidate Product',
    modalProductTitle: 'Product Title',
    modalAsin: 'ASIN Code',
    modalCategory: 'Category',
    modalSupplier: 'US Supplier Name',
    modalBuyPrice: 'Buy Price ($)',
    modalSellPrice: 'Amazon Sell Price ($)',
    modalCancel: 'Cancel',
    modalSave: 'Save Product in Deal Finder',

    // Calculator
    calcTitle: 'FBA & Prep Ninjas Margin Calculator',
    calcSubtitle: 'Exact real-time mathematical simulation deducting all Amazon US fees and Prep Ninjas handling costs.',
    dataSectionTitle: 'Buy & Sell Financial Inputs',
    sellPriceLabel: 'Amazon Selling Price ($)',
    buyPriceLabel: 'Supplier Buy Price ($)',
    preppingFeeLabel: 'Prep Ninjas Fee ($/unit)',
    freightLabel: 'Inbound Freight ($/unit)',
    weightLabel: 'Product Weight (lbs)',
    batchQtyLabel: 'Test Batch (Quantity)',
    resultUnitTitle: 'Result Per Sold Unit',
    badgeProfitable: 'PROFITABLE PRODUCT',
    badgeLoss: 'NET LOSS',
    unitNetProfitLabel: 'Unit Net Profit',
    unitRoiLabel: 'Net ROI',
    breakdownTitle: 'Fee & Cost Breakdown (1 Unit)',
    refFeeLabel: '(-) Amazon Referral Fee (15%):',
    fbaFeeLabel: '(-) FBA Fulfillment Fee:',
    prepFeeLabel: '(-) Prep Ninjas Fee (3PL):',
    freightInboundLabel: '(-) Inbound Freight (Est.):',
    supplierProductCostLabel: '(-) Supplier Product Cost:',
    cleanNetProfitLabel: '(=) Net Profit in Bank:',
    batchProjectionTitle: 'Projection for {qty} Units Batch:',
    investmentLabel: 'Investment:',
    revenueLabel: 'Revenue:',
    profitLabel: 'Net Profit:',

    // Prep Tracker
    trackerTitle: 'Prep Ninjas Logistics Tracker (3PL)',
    trackerSubtitle: 'Real-time tracking of shipment flow from supplier to Amazon FBA warehouse in the US.',
    prepDashboardBtn: 'Access Prep Ninjas Dashboard',
    warehouseAddr: 'Gulf Shores / US Warehouse',
    unitsInTransit: '200 Units (3 Batches)',
    prepService: 'Inspection + FNSKU Labeling',
    step1: 'Supplier Order',
    step2: 'In Transit to Prep',
    step3: 'At Prep Ninjas',
    step4: 'FNSKU Labeled',
    step5: 'En Route to FBA',
    step6: 'Received by Amazon',

    // Suppliers
    supTitle: 'Verified US Wholesale Suppliers (B2B)',
    supSubtitle: 'Catalog of wholesalers selling with legal invoices for LLCs and shipping to Prep Ninjas.',
    supShipsToPrep: 'Ships to Prep Ninjas',
    supMoq: 'Minimum MOQ:',
    supVisitCatalog: 'Visit Catalog',

    // SaaS Pitch
    pitchHeroTag: 'HelpUS FBA Suite • Enterprise SaaS Platform',
    pitchHeroTitle1: 'Automate Product Sourcing & Logistics for',
    pitchHeroTitle2: 'Amazon Sellers & US LLCs',
    pitchHeroSub: 'The ultimate all-in-one software engine connecting US Wholesale Suppliers, 3PL Prep Centers (Prep Ninjas), and Amazon Seller Central.',
    pitchFeature1Title: 'Automated Deal Mining',
    pitchFeature1Desc: 'Scans wholesale price sheets and liquidators to extract high-ROI products with zero brand ungating barriers.',
    pitchFeature2Title: '3PL Prep Center Sync',
    pitchFeature2Desc: 'Direct tracking integration with Prep Ninjas and US warehouses for automated FNSKU labeling and bundling.',
    pitchFeature3Title: 'Real-Time Margin Engine',
    pitchFeature3Desc: 'Exact net profit calculations accounting for Amazon Referral, FBA Fulfillment, Prep Fees, and Inbound Freight.',
    pitchPricingTitle: 'Commercial SaaS Plans',
    pitchPricingSub: 'Ready to market for Amazon sellers and brands in the US',
    planStarter: 'Starter Plan',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Start Free Trial',
    btnSubscribePro: 'Subscribe Pro Suite',
    btnContactSales: 'Contact Sales',

    // Footer
    footerDesc: 'Official e-commerce automation, product sourcing, and sales intelligence platform for Amazon FBA.',
    footerAddressTitle: 'Registered Business Address',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, United States',
    footerContactTitle: 'HelpUS LLC Official Contact',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS LLC. All rights reserved.',
  },

  es: {
    // Header
    activeAccount: 'HelpUS LLC',
    marketLabel: 'Amazon EE.UU. (sellercentral.amazon.com)',
    fbaPartner: 'Socio de Prep FBA: Prep Ninjas (EE.UU.)',
    searchPlaceholder: 'Buscar ASIN, Producto, Proveedor...',
    saasModeBtn: 'Modo Comercial SaaS',

    // Sidebar
    mainNav: 'Navegación Principal',
    navOverview: 'Visión General',
    navDealFinder: 'Deal Finder (Buscador)',
    navCalculator: 'Calculadora FBA y Prep',
    navPrepTracker: 'Rastreo Prep Ninjas',
    navSuppliers: 'Proveedores EE.UU.',
    navPitch: 'Presentación SaaS',
    connectedTools: 'Herramientas Conectadas',
    sidebarFooter: 'Plataforma configurada para los ecosistemas de Amazon US y Prep Ninjas',
    statusOnline: 'En línea',

    // Dashboard
    dashTitle: 'Panel Ejecutivo de Inteligencia FBA',
    dashSubtitle: 'Rastree el potencial de ingresos, márgenes de beneficio neto, minería de proveedores de EE. UU. y estado logístico de Prep Ninjas.',
    mineBtn: 'Buscar Nuevos Productos',
    potentialProfit: 'Beneficio Potencial (Lotes de Prueba)',
    grossRevenue: 'Ingresos Brutos Proyectados',
    avgRoi: 'ROI Promedio de Productos',
    prepStatus: 'Estado en Prep Ninjas',
    chartTitle: 'Proyección Financiera de Lotes (en USD)',
    chartSubtitle: 'Comparación de Ingresos, Costos Totales y Beneficio Neto por Producto',
    chartRevenue: 'Ingresos',
    chartCosts: 'Costos Logísticos + Producto',
    chartNetProfit: 'Beneficio Neto',
    opStatusTitle: 'Estado Operativo de HelpUS',
    featuredDealsTitle: 'Productos Candidatos Destacados (Ungated)',
    featuredDealsSubtitle: 'Productos sin restricción de marca listos para el lote de prueba inicial',
    viewAll: 'Ver Todos',

    // Deal Finder
    finderTitle: 'Deal Finder (Centro de Búsqueda de Productos)',
    finderSubtitle: 'Filtre proveedores de EE. UU., verifique el margen neto descontando FBA + Prep Ninjas y vea la liberación (Ungated).',
    exportCsv: 'Exportar CSV',
    addCandidate: 'Añadir Producto Candidato',
    searchLabel: 'Buscar',
    searchPlaceholderInput: 'Buscar por ASIN, Nombre o Proveedor...',
    categoryLabel: 'Categoría',
    minRoiLabel: 'ROI Mínimo:',
    colProduct: 'Producto y ASIN',
    colSupplier: 'Proveedor EE.UU.',
    colPricing: 'Costo / Venta',
    colFees: 'Tarifas FBA + Prep',
    colProfitRoi: 'Beneficio Neto / ROI',
    colUngated: 'Liberación (Ungated)',
    colAction: 'Acción',
    ungatedApproved: 'UNGATED (Aprobado)',
    ungatedRequires: 'Requiere Aprobación',
    btnSimulateFees: 'Simular Tarifas',

    // Add Modal
    modalTitle: 'Añadir Producto Candidato',
    modalProductTitle: 'Título del Producto',
    modalAsin: 'Código ASIN',
    modalCategory: 'Categoría',
    modalSupplier: 'Nombre del Proveedor EE.UU.',
    modalBuyPrice: 'Precio de Compra ($)',
    modalSellPrice: 'Precio Venta Amazon ($)',
    modalCancel: 'Cancelar',
    modalSave: 'Guardar Producto en Deal Finder',

    // Calculator
    calcTitle: 'Calculadora de Margen FBA y Prep Ninjas',
    calcSubtitle: 'Simulación matemática exacta en tiempo real descontando todas las tarifas de Amazon EE. UU. y costos de manejo en Prep Ninjas.',
    dataSectionTitle: 'Datos de Compra y Venta',
    sellPriceLabel: 'Precio de Venta en Amazon ($)',
    buyPriceLabel: 'Precio en el Proveedor ($)',
    preppingFeeLabel: 'Tarifa Prep Ninjas ($/unid)',
    freightLabel: 'Flete Interno ($/unid)',
    weightLabel: 'Peso del Producto (lbs)',
    batchQtyLabel: 'Lote de Prueba (Cantidad)',
    resultUnitTitle: 'Resultado por Unidad Vendida',
    badgeProfitable: 'PRODUCTO RENTABLE',
    badgeLoss: 'PÉRDIDA',
    unitNetProfitLabel: 'Beneficio Neto Unitario',
    unitRoiLabel: 'ROI Neto',
    breakdownTitle: 'Desglose de Tarifas y Costos (1 Unidad)',
    refFeeLabel: '(-) Comisión Amazon (Referral 15%):',
    fbaFeeLabel: '(-) Tarifa Logística FBA:',
    prepFeeLabel: '(-) Tarifa Prep Ninjas (3PL):',
    freightInboundLabel: '(-) Flete Interno (Est.):',
    supplierProductCostLabel: '(-) Costo del Producto en Proveedor:',
    cleanNetProfitLabel: '(=) Beneficio Neto en Banco:',
    batchProjectionTitle: 'Proyección para Lote de {qty} Unidades:',
    investmentLabel: 'Inversión:',
    revenueLabel: 'Ingresos:',
    profitLabel: 'Beneficio Neto:',

    // Prep Tracker
    trackerTitle: 'Rastreo Logístico Prep Ninjas (3PL)',
    trackerSubtitle: 'Seguimiento en tiempo real del flujo desde el proveedor hasta el almacén de Amazon FBA en EE. UU.',
    prepDashboardBtn: 'Acceder a Panel Prep Ninjas',
    warehouseAddr: 'Gulf Shores / Almacén EE.UU.',
    unitsInTransit: '200 Unidades (3 Lotes)',
    prepService: 'Inspección + Etiquetado FNSKU',
    step1: 'Pedido Proveedor',
    step2: 'En Tránsito a Prep',
    step3: 'En Prep Ninjas',
    step4: 'Etiquetado FNSKU',
    step5: 'Enviado a FBA',
    step6: 'Recibido por Amazon',

    // Suppliers
    supTitle: 'Proveedores Verificados de EE. UU. (Wholesale / B2B)',
    supSubtitle: 'Catálogo de mayoristas que venden con factura legal para LLCs y entregan en Prep Ninjas.',
    supShipsToPrep: 'Envío a Prep Ninjas',
    supMoq: 'MOQ Mínimo:',
    supVisitCatalog: 'Visitar Catálogo',

    // SaaS Pitch
    pitchHeroTag: 'HelpUS FBA Suite • Plataforma Enterprise SaaS',
    pitchHeroTitle1: 'Automatice la Búsqueda y Logística para',
    pitchHeroTitle2: 'Vendedores de Amazon y LLCs en EE.UU.',
    pitchHeroSub: 'El motor de software todo en uno definitivo que conecta proveedores mayoristas de EE. UU., centros Prep 3PL (Prep Ninjas) y Amazon Seller Central.',
    pitchFeature1Title: 'Búsqueda Automatizada de Deals',
    pitchFeature1Desc: 'Escanea listas de precios al por mayor y liquidadores para extraer productos de alto ROI sin barreras de marca.',
    pitchFeature2Title: 'Sincronización 3PL Prep Center',
    pitchFeature2Desc: 'Integración de seguimiento directo con Prep Ninjas y almacenes de EE. UU. para etiquetado FNSKU y empaquetado.',
    pitchFeature3Title: 'Motor de Márgenes en Tiempo Real',
    pitchFeature3Desc: 'Cálculos exactos de beneficio neto descontando la comisión de Amazon, logística FBA, tarifas Prep y flete.',
    pitchPricingTitle: 'Planes Comerciales SaaS',
    pitchPricingSub: 'Listo para comercializar a marcas y vendedores de Amazon en EE. UU.',
    planStarter: 'Plan Starter',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Iniciar Prueba',
    btnSubscribePro: 'Suscribir Pro Suite',
    btnContactSales: 'Contactar Ventas',

    // Footer
    footerDesc: 'Plataforma oficial de automatización de comercio electrónico, minería de productos e inteligencia de ventas para Amazon FBA.',
    footerAddressTitle: 'Dirección Comercial Registrada',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, Estados Unidos',
    footerContactTitle: 'Contacto Oficial HelpUS LLC',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS LLC. Todos los derechos reservados.',
  }
};
