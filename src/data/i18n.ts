export type Language = 'pt' | 'en' | 'es';

export interface TranslationDictionary {
  // Header
  activeAccount: string;
  marketLabel: string;
  fbaPartner: string;
  searchPlaceholder: string;
  saasModeBtn: string;
  mobileMenuToggle: string;

  // Sidebar & Navigation
  mainNav: string;
  operationsNav: string;
  toolsNav: string;
  navOverview: string;
  navUSA: string;
  navBrasil: string;
  navNfe: string;
  navEstoque: string;
  navDre: string;
  navDevolucoes: string;
  navCalculator: string;
  navPrepTracker: string;
  navSuppliers: string;
  navDealFinder: string;
  navPitch: string;
  connectedTools: string;
  sidebarFooter: string;
  statusOnline: string;

  // Executive Overview (Dashboard)
  execTitle: string;
  execSubtitle: string;
  dashTitle: string;
  dashSubtitle: string;
  mineBtn: string;
  potentialProfit: string;
  grossRevenue: string;
  chartTitle: string;
  chartCosts: string;
  chartRevenue: string;
  chartNetProfit: string;
  globalSummaryTitle: string;
  globalSummarySub: string;
  cardUsaTitle: string;
  cardUsaDesc: string;
  cardUsaAction: string;
  cardBrTitle: string;
  cardBrDesc: string;
  cardBrAction: string;
  kpiTotalSkus: string;
  kpiTotalUnits: string;
  kpiUsProfit: string;
  kpiBrProfit: string;
  quickToolsTitle: string;

  // USA Page
  usaPageTitle: string;
  usaPageSubtitle: string;
  usaPartnerTitle: string;
  usaPartnerDesc: string;
  usaProductCardTitle: string;
  usaProductCardSub: string;
  usaAsinLabel: string;
  usaSkuLabel: string;
  usaBatchLabel: string;
  usaDestinationLabel: string;
  usaUnitCost: string;
  usaSalePrice: string;
  usaAmazonFees: string;
  usaPrepFee: string;
  usaNetMargin: string;
  usaLogisticsFlowTitle: string;
  usaComplianceTitle: string;
  usaPolybagRule: string;
  usaOriginStampRule: string;

  // Brasil Page
  brPageTitle: string;
  brPageSubtitle: string;
  brPartnerTitle: string;
  brPartnerDesc: string;
  brInvoiceTitle: string;
  brInvoiceKeyLabel: string;
  brTotalInvoiceLabel: string;
  brLogisticsPartner: string;
  brDeliveryForecast: string;
  brDeliveryAddress: string;
  brProductsTableTitle: string;
  brProductsTableSub: string;
  brColProduct: string;
  brColQty: string;
  brColUnitCost: string;
  brColEstSale: string;
  brColNetProfit: string;
  brColRoi: string;

  // Calculator
  calcTitle: string;
  calcSubtitle: string;
  calcCurrencySwitch: string;
  calcPresetsTitle: string;
  calcPresetCableTies: string;
  calcPresetResveratrol: string;
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
  braspressBtn: string;
  tabAllShipments: string;
  tabUsaFba: string;
  tabBrasilLogistics: string;
  unitsInTransit: string;
  statusOrdered: string;
  statusInTransit: string;
  statusAtPrep: string;
  statusPrepped: string;
  statusEnRouteFba: string;
  statusReceivedFba: string;
  stepDeliveryEst: string;

  // Suppliers
  supTitle: string;
  supSubtitle: string;
  tabAllSuppliers: string;
  tabUsa: string;
  tabBrasil: string;
  tabChina: string;
  supShipsToPrep: string;
  supMoq: string;
  supVisitCatalog: string;

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
    activeAccount: 'HelpUS Global',
    marketLabel: 'Ecossistema Integrado EUA & Brasil',
    fbaPartner: 'Prep Center EUA: Prep Ninjas (UT)',
    searchPlaceholder: 'Buscar ASIN, SKU, NF-e, Produto...',
    saasModeBtn: 'Modo SaaS',
    mobileMenuToggle: 'Menu Principal',

    // Sidebar & Navigation
    mainNav: 'Navegação Principal',
    operationsNav: 'Operações Ativas',
    toolsNav: 'Ferramentas de Gestão',
    navOverview: 'Visão Executiva',
    navUSA: '🇺🇸 Operação EUA (FBA)',
    navBrasil: '🇧🇷 Operação Brasil (NF-e)',
    navNfe: 'Entrada de Notas (XML)',
    navEstoque: 'Estoque Multi-Armazém',
    navDre: 'DRE & P&L Financeiro',
    navDevolucoes: 'Devoluções & Avarias',
    navCalculator: 'Calculadora FBA & Prep',
    navPrepTracker: 'Rastreio & Logística',
    navSuppliers: 'Fornecedores Homologados',
    navDealFinder: 'Prospecção de Produtos',
    navPitch: 'Apresentação Comercial',
    connectedTools: 'Conexões Ativas',
    sidebarFooter: 'Plataforma HelpUS Multi-Armazém • EUA & Brasil',
    statusOnline: 'Operacional',

    // Executive Overview (Dashboard)
    execTitle: 'Painel Executivo HelpUS',
    execSubtitle: 'Visão clara, consolidada e descomplicada das duas operações comerciais ativas da HelpUS.',
    dashTitle: 'Painel Executivo HelpUS',
    dashSubtitle: 'Visão clara, consolidada e descomplicada das duas operações comerciais ativas da HelpUS.',
    mineBtn: 'Minerar Novos Produtos',
    potentialProfit: 'Lucro Líquido Real',
    grossRevenue: 'Faturamento Projetado',
    chartTitle: 'Projeção de Lotes (Moeda Local)',
    chartCosts: 'Custos Totais',
    chartRevenue: 'Faturamento',
    chartNetProfit: 'Lucro Líquido',
    globalSummaryTitle: 'Resumo Geral das Operações',
    globalSummarySub: 'Acesse cada operação de forma independente para ver métricas detalhadas.',
    cardUsaTitle: 'Operação Estados Unidos (HelpUS LLC)',
    cardUsaDesc: 'Vendas via Amazon US FBA com recebimento e preparação no Prep Ninjas (Salt Lake City, UT). Lote piloto com tiras de silicone reutilizáveis.',
    cardUsaAction: 'Entrar na Operação EUA &rarr;',
    cardBrTitle: 'Operação Brasil (HelpUS Brasil)',
    cardBrDesc: 'Distribuição nacional em parceria com a Nativos do Brasil. Pedido Piloto #3404 faturado com NF-e 00002509 e rastreio rodoviário Braspress até João Pessoa/PB.',
    cardBrAction: 'Entrar na Operação Brasil &rarr;',
    kpiTotalSkus: 'SKUs Ativos',
    kpiTotalUnits: 'Unidades em Trânsito',
    kpiUsProfit: 'Lucro Previsto EUA',
    kpiBrProfit: 'Lucro Previsto Brasil',
    quickToolsTitle: 'Acesso Rápido a Ferramentas',

    // USA Page
    usaPageTitle: 'Operação Estados Unidos (HelpUS LLC)',
    usaPageSubtitle: 'Controle dedicado da conta Amazon US FBA, taxas em Dólar (USD) e logística no Prep Ninjas.',
    usaPartnerTitle: 'Centro de Preparação Homologado',
    usaPartnerDesc: 'Prep Ninjas LLC (869 E 4500 S, Salt Lake City, UT 84107). Inspeção, colocação de etiquetas FNSKU ($1.50/un) e envio para centros FBA da Amazon via UPS Ground.',
    usaProductCardTitle: 'Produto Piloto Ativo',
    usaProductCardSub: 'Item catalogado e aprovado com Isenção de GTIN oficial na Amazon.com.',
    usaAsinLabel: 'Código ASIN:',
    usaSkuLabel: 'Código SKU:',
    usaBatchLabel: 'Lote Atual:',
    usaDestinationLabel: 'Destino Amazon:',
    usaUnitCost: 'Custo de Aquisição:',
    usaSalePrice: 'Preço de Venda:',
    usaAmazonFees: 'Tarifas Amazon FBA:',
    usaPrepFee: 'Taxa Prep Center:',
    usaNetMargin: 'Lucro Líquido / Margem:',
    usaLogisticsFlowTitle: 'Fluxo Logístico EUA',
    usaComplianceTitle: 'Normas de Conformidade e Embalagem',
    usaPolybagRule: 'Polybag individual com aviso de sufocação impresso em inglês obrigatório.',
    usaOriginStampRule: 'Marcação visível "Made in China" impressa na caixa master externa.',

    // Brasil Page
    brPageTitle: 'Operação Brasil (HelpUS Brasil / MEI)',
    brPageSubtitle: 'Gestão de compras, estoque nacional e vendas locais em Reais (BRL) via Nativos do Brasil.',
    brPartnerTitle: 'Fornecedor Principal Homologado',
    brPartnerDesc: 'Nativos do Brasil Produtos Naturais Ltda (CNPJ: 47.693.854/0001-64, Vila Velha/ES). Fabricante direto de nutracêuticos e fitoterápicos em cápsulas.',
    brInvoiceTitle: 'Nota Fiscal de Entrada (NF-e Nº 00002509)',
    brInvoiceKeyLabel: 'Chave de Acesso SEFAZ:',
    brTotalInvoiceLabel: 'Valor Total com Frete:',
    brLogisticsPartner: 'Transportadora Oficial:',
    brDeliveryForecast: 'Previsão de Entrega:',
    brDeliveryAddress: 'Endereço de Entrega:',
    brProductsTableTitle: '6 SKUs Campeões Adquiridos no Pedido Piloto #3404',
    brProductsTableSub: 'Produtos inspecionados para venda em canais próprios e marketplaces nacionais.',
    brColProduct: 'Produto / Suplemento',
    brColQty: 'Qtd.',
    brColUnitCost: 'Custo Unit.',
    brColEstSale: 'Venda Est.',
    brColNetProfit: 'Lucro Unit.',
    brColRoi: 'ROI Est.',

    // Calculator
    calcTitle: 'Calculadora de Unit Economics & FBA',
    calcSubtitle: 'Simule com precisão o retorno financeiro de qualquer produto antes de efetuar compras.',
    calcCurrencySwitch: 'Moeda da Simulação:',
    calcPresetsTitle: 'Carregar Predefinições Rápidas:',
    calcPresetCableTies: 'Silicone Cable Ties (EUA - USD)',
    calcPresetResveratrol: 'Resveratrol Softgel (BR - BRL)',
    dataSectionTitle: 'Dados de Compra e Custos',
    sellPriceLabel: 'Preço de Venda Estimado',
    buyPriceLabel: 'Custo de Aquisição no Fornecedor',
    preppingFeeLabel: 'Taxa de Prep / Etiquetagem',
    freightLabel: 'Frete Unitário / Rateado',
    weightLabel: 'Peso Unitário Estimado',
    batchQtyLabel: 'Quantidade do Lote',
    resultUnitTitle: 'Resultado por Unidade',
    badgeProfitable: 'PRODUTO LUCRATIVO',
    badgeLoss: 'PREJUÍZO',
    unitNetProfitLabel: 'Lucro Líquido Unitário',
    unitRoiLabel: 'ROI Estimado',
    breakdownTitle: 'Detalhamento de Custos e Deduções',
    refFeeLabel: '(-) Taxa de Comissão / Marketplace (~15%):',
    fbaFeeLabel: '(-) Tarifa Logística / Fulfillment:',
    prepFeeLabel: '(-) Taxa de Manuseio / Prep Center:',
    freightInboundLabel: '(-) Frete de Entrada (Inbound):',
    supplierProductCostLabel: '(-) Custo do Produto no Fornecedor:',
    cleanNetProfitLabel: '(=) Lucro Líquido Real no Caixa:',
    batchProjectionTitle: 'Projeção Total do Lote ({qty} un):',
    investmentLabel: 'Investimento:',
    revenueLabel: 'Faturamento:',
    profitLabel: 'Lucro Líquido:',

    // Prep Tracker
    trackerTitle: 'Rastreio Logístico Multi-Armazém',
    trackerSubtitle: 'Acompanhe as remessas em trânsito com separação clara entre os centros dos EUA e Brasil.',
    prepDashboardBtn: 'Portal Prep Ninjas',
    braspressBtn: 'Rastreio Braspress',
    tabAllShipments: 'Todas as Remessas',
    tabUsaFba: '🇺🇸 Lotes EUA (Prep Ninjas / Amazon)',
    tabBrasilLogistics: '🇧🇷 Lotes Brasil (Braspress / JPA)',
    unitsInTransit: 'unidades em transporte',
    statusOrdered: 'Pedido Criado',
    statusInTransit: 'Em Transporte',
    statusAtPrep: 'No Armazém / Coleta',
    statusPrepped: 'Etiquetado & Pronto',
    statusEnRouteFba: 'Em Rota Final',
    statusReceivedFba: 'Recebido / Disponível',
    stepDeliveryEst: 'Previsão de Entrega:',

    // Suppliers
    supTitle: 'Fornecedores, Fabricantes & 3PL',
    supSubtitle: 'Catálogo homologado de parceiros comerciais categorizados por país de atuação.',
    tabAllSuppliers: 'Todos os Parceiros',
    tabUsa: '🇺🇸 Estados Unidos',
    tabBrasil: '🇧🇷 Brasil',
    tabChina: '🇨🇳 China',
    supShipsToPrep: 'Envia Direto para o Prep Center',
    supMoq: 'Pedido Mínimo:',
    supVisitCatalog: 'Acessar Catálogo',

    // Deal Finder
    finderTitle: 'Prospecção de Oportunidades (Deal Finder)',
    finderSubtitle: 'Filtre produtos viáveis, analise a margem descontando tarifas e verifique aprovação de marca.',
    exportCsv: 'Exportar CSV',
    addCandidate: 'Adicionar Candidato',
    searchLabel: 'Buscar',
    searchPlaceholderInput: 'Buscar por ASIN, SKU, Produto ou Fornecedor...',
    categoryLabel: 'Categoria',
    minRoiLabel: 'ROI Mínimo:',
    colProduct: 'Produto & Identificador',
    colSupplier: 'Fornecedor',
    colPricing: 'Custo / Venda',
    colFees: 'Taxas & Logística',
    colProfitRoi: 'Lucro Líq. / ROI',
    colUngated: 'Status da Marca',
    colAction: 'Simulação',
    ungatedApproved: 'LIBERADO (Ungated)',
    ungatedRequires: 'Requer Autorização',
    btnSimulateFees: 'Simular na Calculadora',

    // Add Modal
    modalTitle: 'Cadastrar Novo Produto para Análise',
    modalProductTitle: 'Título do Produto',
    modalAsin: 'Código ASIN ou SKU',
    modalCategory: 'Categoria',
    modalSupplier: 'Nome do Fornecedor',
    modalBuyPrice: 'Preço de Compra',
    modalSellPrice: 'Preço de Venda Estimado',
    modalCancel: 'Cancelar',
    modalSave: 'Salvar no Radar',

    // SaaS Pitch
    pitchHeroTag: 'Módulo Comercial B2B',
    pitchHeroTitle1: 'A Plataforma Completa de Gestão para',
    pitchHeroTitle2: 'Operações Amazon FBA & Cross-Border',
    pitchHeroSub: 'Automatize compras, controle unit economics e sincronize estoques internacionais e nacionais em uma única interface inteligente.',
    pitchFeature1Title: 'Unit Economics Exato',
    pitchFeature1Desc: 'Descontos automáticos de referral fees, taxas de fulfillment da Amazon e custo de etiquetagem 3PL.',
    pitchFeature2Title: 'Logística Multi-Hub',
    pitchFeature2Desc: 'Monitore remessas internacionais na Prep Ninjas e entregas nacionais com rastreamento integrado.',
    pitchFeature3Title: 'Multi-Moeda Nativo',
    pitchFeature3Desc: 'Gerencie operações em USD ($) e BRL (R$) com relatórios claros e sem misturar balanços.',
    pitchPricingTitle: 'Planos de Acesso ao Sistema',
    pitchPricingSub: 'Desenvolvido sob medida para operações em escala na Amazon',
    planStarter: 'Starter',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Iniciar Demonstração',
    btnSubscribePro: 'Contratar Versão Pro',
    btnContactSales: 'Falar com Consultores',

    // Footer
    footerDesc: 'Plataforma oficial de automação de e-commerce, inteligência FBA e gestão cross-border HelpUS.',
    footerAddressTitle: 'Endereço Comercial Oficial',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, Estados Unidos',
    footerContactTitle: 'Atendimento & Operações',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS Global. Todos os direitos reservados.',
  },

  en: {
    // Header
    activeAccount: 'HelpUS Global',
    marketLabel: 'Integrated US & Brazil Ecosystem',
    fbaPartner: 'US Prep Center: Prep Ninjas (UT)',
    searchPlaceholder: 'Search ASIN, SKU, Invoice, Product...',
    saasModeBtn: 'SaaS Mode',
    mobileMenuToggle: 'Main Menu',

    // Sidebar & Navigation
    mainNav: 'Main Navigation',
    operationsNav: 'Active Operations',
    toolsNav: 'Management Tools',
    navOverview: 'Executive Overview',
    navUSA: '🇺🇸 US Operation (FBA)',
    navBrasil: '🇧🇷 Brazil Operation (NF-e)',
    navNfe: 'Inbound Invoices (XML)',
    navEstoque: 'Multi-Warehouse Stock',
    navDre: 'Financial P&L & DRE',
    navDevolucoes: 'Returns & Damages',
    navCalculator: 'FBA & Prep Calculator',
    navPrepTracker: 'Logistics & Tracking',
    navSuppliers: 'Verified Suppliers',
    navDealFinder: 'Product Deal Finder',
    navPitch: 'Commercial Overview',
    connectedTools: 'Active Integrations',
    sidebarFooter: 'HelpUS Multi-Warehouse Platform • US & Brazil',
    statusOnline: 'Operational',

    // Executive Overview (Dashboard)
    execTitle: 'HelpUS Executive Dashboard',
    execSubtitle: 'Clear, consolidated, and straightforward overview of both active commercial operations of HelpUS.',
    dashTitle: 'HelpUS Executive Dashboard',
    dashSubtitle: 'Clear, consolidated, and straightforward overview of both active commercial operations of HelpUS.',
    mineBtn: 'Mine New Deals',
    potentialProfit: 'Net Profit Potential',
    grossRevenue: 'Projected Gross Revenue',
    chartTitle: 'Batch Projections (Local Currency)',
    chartCosts: 'Total Costs',
    chartRevenue: 'Gross Revenue',
    chartNetProfit: 'Net Profit',
    globalSummaryTitle: 'Overall Operations Summary',
    globalSummarySub: 'Access each operation independently to review dedicated metrics without clutter.',
    cardUsaTitle: 'United States Operation (HelpUS LLC)',
    cardUsaDesc: 'Amazon US FBA sales powered by Prep Ninjas warehouse inspection and labeling (Salt Lake City, UT). Active pilot with reusable silicone cable ties.',
    cardUsaAction: 'Enter US Operation &rarr;',
    cardBrTitle: 'Brazil Operation (HelpUS Brasil)',
    cardBrDesc: 'Domestic distribution partnering with Nativos do Brasil. Pilot Order #3404 billed under NF-e 00002509, shipped via Braspress to João Pessoa/PB.',
    cardBrAction: 'Enter Brazil Operation &rarr;',
    kpiTotalSkus: 'Active SKUs',
    kpiTotalUnits: 'Units in Transit',
    kpiUsProfit: 'Expected US Profit',
    kpiBrProfit: 'Expected Brazil Profit',
    quickToolsTitle: 'Quick Tool Access',

    // USA Page
    usaPageTitle: 'United States Operation (HelpUS LLC)',
    usaPageSubtitle: 'Dedicated monitoring of Amazon US FBA account, fees in US Dollars (USD), and Prep Ninjas logistics.',
    usaPartnerTitle: 'Verified 3PL Preparation Center',
    usaPartnerDesc: 'Prep Ninjas LLC (869 E 4500 S, Salt Lake City, UT 84107). Receives batches, inspects, applies FNSKU barcodes ($1.50/unit), and dispatches via UPS Ground to Amazon fulfillment centers.',
    usaProductCardTitle: 'Active Pilot Product',
    usaProductCardSub: 'Item listed and approved under official GTIN Exemption on Amazon.com.',
    usaAsinLabel: 'ASIN Code:',
    usaSkuLabel: 'SKU Code:',
    usaBatchLabel: 'Current Batch:',
    usaDestinationLabel: 'Amazon Destination:',
    usaUnitCost: 'Unit Acquisition Cost:',
    usaSalePrice: 'Listing Sale Price:',
    usaAmazonFees: 'Amazon FBA & Referral Fees:',
    usaPrepFee: 'Prep Center Fee:',
    usaNetMargin: 'Net Profit / Margin:',
    usaLogisticsFlowTitle: 'US Logistics Workflow',
    usaComplianceTitle: 'Compliance & Packaging Standards',
    usaPolybagRule: 'Individual polybag with clear English suffocation warning required on each unit.',
    usaOriginStampRule: 'Visible "Made in China" origin mark clearly printed on master carton.',

    // Brasil Page
    brPageTitle: 'Brazil Operation (HelpUS Brasil / MEI)',
    brPageSubtitle: 'Procurement, domestic inventory, and local sales managed in Brazilian Reais (BRL) via Nativos do Brasil.',
    brPartnerTitle: 'Primary Verified Supplier',
    brPartnerDesc: 'Nativos do Brasil Produtos Naturais Ltda (CNPJ: 47.693.854/0001-64, Vila Velha/ES). Direct manufacturer of premium dietary supplements in 60-capsule bottles.',
    brInvoiceTitle: 'Inbound Tax Invoice (NF-e Nº 00002509)',
    brInvoiceKeyLabel: 'SEFAZ Access Key:',
    brTotalInvoiceLabel: 'Total Invoice with Shipping:',
    brLogisticsPartner: 'Freight Carrier:',
    brDeliveryForecast: 'Estimated Delivery:',
    brDeliveryAddress: 'Delivery Address:',
    brProductsTableTitle: '6 Best-Selling SKUs Purchased in Pilot Order #3404',
    brProductsTableSub: 'Inspected items prepared for domestic marketplace fulfillment.',
    brColProduct: 'Product / Supplement',
    brColQty: 'Qty',
    brColUnitCost: 'Unit Cost',
    brColEstSale: 'Est. Sale',
    brColNetProfit: 'Unit Profit',
    brColRoi: 'Est. ROI',

    // Calculator
    calcTitle: 'FBA & Unit Economics Calculator',
    calcSubtitle: 'Accurately simulate the net return of any product before committing purchase capital.',
    calcCurrencySwitch: 'Simulation Currency:',
    calcPresetsTitle: 'Load Quick Presets:',
    calcPresetCableTies: 'Silicone Cable Ties (US - USD)',
    calcPresetResveratrol: 'Resveratrol Softgel (BR - BRL)',
    dataSectionTitle: 'Procurement & Cost Inputs',
    sellPriceLabel: 'Estimated Amazon Sale Price',
    buyPriceLabel: 'Supplier Purchase Cost',
    preppingFeeLabel: 'Prep & Labeling Fee',
    freightLabel: 'Unit Inbound Freight',
    weightLabel: 'Item Weight',
    batchQtyLabel: 'Batch Test Quantity',
    resultUnitTitle: 'Unit Economics Result',
    badgeProfitable: 'PROFITABLE DEAL',
    badgeLoss: 'NET LOSS',
    unitNetProfitLabel: 'Net Profit per Unit',
    unitRoiLabel: 'Estimated ROI',
    breakdownTitle: 'Cost & Fee Deductions Breakdown',
    refFeeLabel: '(-) Referral / Marketplace Fee (~15%):',
    fbaFeeLabel: '(-) FBA Fulfillment Fee:',
    prepFeeLabel: '(-) 3PL Prep Fee:',
    freightInboundLabel: '(-) Inbound Freight (Estimated):',
    supplierProductCostLabel: '(-) Supplier Product Cost:',
    cleanNetProfitLabel: '(=) Net Profit in Bank:',
    batchProjectionTitle: 'Full Batch Projection ({qty} units):',
    investmentLabel: 'Investment:',
    revenueLabel: 'Revenue:',
    profitLabel: 'Net Profit:',

    // Prep Tracker
    trackerTitle: 'Multi-Warehouse Logistics Tracker',
    trackerSubtitle: 'Track inbound shipments with clean visual separation between US and Brazil hubs.',
    prepDashboardBtn: 'Prep Ninjas Portal',
    braspressBtn: 'Braspress Tracking',
    tabAllShipments: 'All Shipments',
    tabUsaFba: '🇺🇸 US Shipments (Prep Ninjas / Amazon)',
    tabBrasilLogistics: '🇧🇷 Brazil Shipments (Braspress / JPA)',
    unitsInTransit: 'units in transit',
    statusOrdered: 'Order Placed',
    statusInTransit: 'In Transit',
    statusAtPrep: 'At Warehouse / Picked Up',
    statusPrepped: 'Prepped & Labeled',
    statusEnRouteFba: 'En Route to Amazon',
    statusReceivedFba: 'Received / Available',
    stepDeliveryEst: 'Estimated Delivery:',

    // Suppliers
    supTitle: 'Verified Suppliers, Manufacturers & 3PL',
    supSubtitle: 'Approved partner directory cleanly organized by operational country.',
    tabAllSuppliers: 'All Partners',
    tabUsa: '🇺🇸 United States',
    tabBrasil: '🇧🇷 Brazil',
    tabChina: '🇨🇳 China',
    supShipsToPrep: 'Ships Directly to Prep Center',
    supMoq: 'Minimum Order (MOQ):',
    supVisitCatalog: 'Open Portal / Catalog',

    // Deal Finder
    finderTitle: 'Product Deal Finder & Mining',
    finderSubtitle: 'Screen wholesale suppliers, compute net margin after FBA + Prep deductions, and verify ungating.',
    exportCsv: 'Export CSV',
    addCandidate: 'Add Candidate',
    searchLabel: 'Search',
    searchPlaceholderInput: 'Search by ASIN, SKU, Product, or Supplier...',
    categoryLabel: 'Category',
    minRoiLabel: 'Minimum ROI:',
    colProduct: 'Product & Identifier',
    colSupplier: 'Supplier',
    colPricing: 'Cost / Price',
    colFees: 'Fees & Logistics',
    colProfitRoi: 'Net Profit / ROI',
    colUngated: 'Brand Ungating',
    colAction: 'Simulate',
    ungatedApproved: 'UNGATED (Approved)',
    ungatedRequires: 'Requires Approval',
    btnSimulateFees: 'Simulate in Calculator',

    // Add Modal
    modalTitle: 'Add New Candidate Product',
    modalProductTitle: 'Product Title',
    modalAsin: 'ASIN or SKU Code',
    modalCategory: 'Category',
    modalSupplier: 'Supplier Name',
    modalBuyPrice: 'Purchase Price',
    modalSellPrice: 'Estimated Sale Price',
    modalCancel: 'Cancel',
    modalSave: 'Save to Radar',

    // SaaS Pitch
    pitchHeroTag: 'B2B Commercial Platform',
    pitchHeroTitle1: 'The Complete Management Suite for',
    pitchHeroTitle2: 'Amazon FBA & Cross-Border Operations',
    pitchHeroSub: 'Automate purchases, control unit economics, and sync domestic and international inventory on a single intelligent platform.',
    pitchFeature1Title: 'Precise Unit Economics',
    pitchFeature1Desc: 'Automated deductions for Amazon referral fees, FBA fulfillment rates, and 3PL prep charges.',
    pitchFeature2Title: 'Multi-Hub Logistics',
    pitchFeature2Desc: 'Monitor international shipments at Prep Ninjas and national road freight with unified tracking.',
    pitchFeature3Title: 'Native Multi-Currency',
    pitchFeature3Desc: 'Manage operations in USD ($) and BRL (R$) with distinct accounting and zero confusion.',
    pitchPricingTitle: 'Software Access Plans',
    pitchPricingSub: 'Engineered specifically for scaling Amazon commercial sellers',
    planStarter: 'Starter',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Start Free Trial',
    btnSubscribePro: 'Subscribe to Pro Suite',
    btnContactSales: 'Contact Sales',

    // Footer
    footerDesc: 'Official e-commerce automation, FBA intelligence, and cross-border management platform by HelpUS.',
    footerAddressTitle: 'Official Registered Address',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, United States',
    footerContactTitle: 'Contact & Operations',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS Global. All rights reserved.',
  },

  es: {
    // Header
    activeAccount: 'HelpUS Global',
    marketLabel: 'Ecosistema Integrado EE.UU. y Brasil',
    fbaPartner: 'Prep Center EE.UU.: Prep Ninjas (UT)',
    searchPlaceholder: 'Buscar ASIN, SKU, Factura, Producto...',
    saasModeBtn: 'Modo SaaS',
    mobileMenuToggle: 'Menú Principal',

    // Sidebar & Navigation
    mainNav: 'Navegación Principal',
    operationsNav: 'Operaciones Activas',
    toolsNav: 'Herramientas de Gestión',
    navOverview: 'Visión Ejecutiva',
    navUSA: '🇺🇸 Operación EE.UU. (FBA)',
    navBrasil: '🇧🇷 Operación Brasil (NF-e)',
    navNfe: 'Entrada de Facturas (XML)',
    navEstoque: 'Inventario Multi-Almacén',
    navDre: 'P&L y DRE Financiero',
    navDevolucoes: 'Devoluciones y Averías',
    navCalculator: 'Calculadora FBA y Prep',
    navPrepTracker: 'Seguimiento y Logística',
    navSuppliers: 'Proveedores Homologados',
    navDealFinder: 'Búsqueda de Productos',
    navPitch: 'Presentación Comercial',
    connectedTools: 'Conexiones Activas',
    sidebarFooter: 'Plataforma HelpUS Multi-Almacén • EE.UU. y Brasil',
    statusOnline: 'Operativo',

    // Executive Overview (Dashboard)
    execTitle: 'Panel Ejecutivo HelpUS',
    execSubtitle: 'Visión clara, consolidada y sencilla de las dos operaciones comerciales activas de HelpUS.',
    dashTitle: 'Panel Ejecutivo HelpUS',
    dashSubtitle: 'Visión clara, consolidada y sencilla de las dos operaciones comerciales activas de HelpUS.',
    mineBtn: 'Buscar Nuevos Productos',
    potentialProfit: 'Beneficio Neto Real',
    grossRevenue: 'Facturación Proyectada',
    chartTitle: 'Proyección de Lotes (Moneda Local)',
    chartCosts: 'Costos Totales',
    chartRevenue: 'Facturación',
    chartNetProfit: 'Beneficio Neto',
    globalSummaryTitle: 'Resumen General de Operaciones',
    globalSummarySub: 'Acceda a cada operación de forma independiente para ver métricas dedicadas sin confusión.',
    cardUsaTitle: 'Operación Estados Unidos (HelpUS LLC)',
    cardUsaDesc: 'Ventas en Amazon US FBA con recepción y preparación en Prep Ninjas (Salt Lake City, UT). Lote piloto de bridas de silicona reutilizables.',
    cardUsaAction: 'Entrar a Operación EE.UU. &rarr;',
    cardBrTitle: 'Operación Brasil (HelpUS Brasil)',
    cardBrDesc: 'Distribución nacional en alianza con Nativos do Brasil. Pedido Piloto #3404 facturado con NF-e 00002509 y flete terrestre Braspress hacia João Pessoa/PB.',
    cardBrAction: 'Entrar a Operación Brasil &rarr;',
    kpiTotalSkus: 'SKUs Activos',
    kpiTotalUnits: 'Unidades en Tránsito',
    kpiUsProfit: 'Beneficio Previsto EE.UU.',
    kpiBrProfit: 'Beneficio Previsto Brasil',
    quickToolsTitle: 'Acceso Rápido a Herramientas',

    // USA Page
    usaPageTitle: 'Operación Estados Unidos (HelpUS LLC)',
    usaPageSubtitle: 'Control dedicado de la cuenta Amazon US FBA, tarifas en Dólares (USD) y logística en Prep Ninjas.',
    usaPartnerTitle: 'Centro de Preparación Homologado',
    usaPartnerDesc: 'Prep Ninjas LLC (869 E 4500 S, Salt Lake City, UT 84107). Inspección, etiquetado de códigos FNSKU ($1.50/un) y despacho a centros FBA de Amazon mediante UPS Ground.',
    usaProductCardTitle: 'Producto Piloto Activo',
    usaProductCardSub: 'Artículo catalogado y aprobado con Exención de GTIN oficial en Amazon.com.',
    usaAsinLabel: 'Código ASIN:',
    usaSkuLabel: 'Código SKU:',
    usaBatchLabel: 'Lote Actual:',
    usaDestinationLabel: 'Destino Amazon:',
    usaUnitCost: 'Costo de Adquisición:',
    usaSalePrice: 'Precio de Venta:',
    usaAmazonFees: 'Tarifas Amazon FBA:',
    usaPrepFee: 'Tarifa Prep Center:',
    usaNetMargin: 'Beneficio Neto / Margen:',
    usaLogisticsFlowTitle: 'Flujo Logístico EE.UU.',
    usaComplianceTitle: 'Normas de Cumplimiento y Embalaje',
    usaPolybagRule: 'Bolsa de polietileno individual con aviso de asfixia en inglés obligatorio.',
    usaOriginStampRule: 'Marca visible "Made in China" impresa en la caja master exterior.',

    // Brasil Page
    brPageTitle: 'Operación Brasil (HelpUS Brasil / MEI)',
    brPageSubtitle: 'Gestión de compras, inventario nacional y ventas locales en Reales (BRL) mediante Nativos do Brasil.',
    brPartnerTitle: 'Proveedor Principal Homologado',
    brPartnerDesc: 'Nativos do Brasil Produtos Naturais Ltda (CNPJ: 47.693.854/0001-64, Vila Velha/ES). Fabricante directo de nutracéuticos y fitoterápicos en frascos de 60 cápsulas.',
    brInvoiceTitle: 'Factura Fiscal de Entrada (NF-e Nº 00002509)',
    brInvoiceKeyLabel: 'Clave de Acceso SEFAZ:',
    brTotalInvoiceLabel: 'Valor Total con Flete:',
    brLogisticsPartner: 'Transportista Oficial:',
    brDeliveryForecast: 'Previsión de Entrega:',
    brDeliveryAddress: 'Dirección de Entrega:',
    brProductsTableTitle: '6 SKUs Líderes Adquiridos en el Pedido Piloto #3404',
    brProductsTableSub: 'Productos inspeccionados para distribución en canales propios y marketplaces de Brasil.',
    brColProduct: 'Producto / Suplemento',
    brColQty: 'Cant.',
    brColUnitCost: 'Costo Unit.',
    brColEstSale: 'Venta Est.',
    brColNetProfit: 'Beneficio Unit.',
    brColRoi: 'ROI Est.',

    // Calculator
    calcTitle: 'Calculadora de Unit Economics y FBA',
    calcSubtitle: 'Simule con precisión el retorno financiero de cualquier producto antes de comprar.',
    calcCurrencySwitch: 'Moneda de la Simulación:',
    calcPresetsTitle: 'Cargar Ajustes Rápidos:',
    calcPresetCableTies: 'Silicone Cable Ties (EE.UU. - USD)',
    calcPresetResveratrol: 'Resveratrol Softgel (BR - BRL)',
    dataSectionTitle: 'Datos de Compra y Costos',
    sellPriceLabel: 'Precio de Venta Estimado',
    buyPriceLabel: 'Costo de Adquisición en Proveedor',
    preppingFeeLabel: 'Tarifa de Prep / Etiquetado',
    freightLabel: 'Flete Unitario Estimado',
    weightLabel: 'Peso Unitario Estimado',
    batchQtyLabel: 'Cantidad del Lote',
    resultUnitTitle: 'Resultado por Unidad',
    badgeProfitable: 'PRODUCTO RENTABLE',
    badgeLoss: 'PÉRDIDA',
    unitNetProfitLabel: 'Beneficio Neto Unitario',
    unitRoiLabel: 'ROI Estimado',
    breakdownTitle: 'Desglose de Costos y Deducciones',
    refFeeLabel: '(-) Comisión Marketplace (~15%):',
    fbaFeeLabel: '(-) Tarifa Logística FBA:',
    prepFeeLabel: '(-) Tarifa de Manejo Prep Center:',
    freightInboundLabel: '(-) Flete de Entrada (Estimado):',
    supplierProductCostLabel: '(-) Costo del Producto en Proveedor:',
    cleanNetProfitLabel: '(=) Beneficio Neto Real en Caja:',
    batchProjectionTitle: 'Proyección Total del Lote ({qty} un):',
    investmentLabel: 'Inversión:',
    revenueLabel: 'Facturación:',
    profitLabel: 'Beneficio Neto:',

    // Prep Tracker
    trackerTitle: 'Seguimiento Logístico Multi-Almacén',
    trackerSubtitle: 'Monitoree los envíos en tránsito con separación clara entre los centros de EE.UU. y Brasil.',
    prepDashboardBtn: 'Portal Prep Ninjas',
    braspressBtn: 'Rastreo Braspress',
    tabAllShipments: 'Todos los Envíos',
    tabUsaFba: '🇺🇸 Lotes EE.UU. (Prep Ninjas / Amazon)',
    tabBrasilLogistics: '🇧🇷 Lotes Brasil (Braspress / JPA)',
    unitsInTransit: 'unidades en transporte',
    statusOrdered: 'Pedido Creado',
    statusInTransit: 'En Transporte',
    statusAtPrep: 'En Almacén / Colecta',
    statusPrepped: 'Etiquetado y Listo',
    statusEnRouteFba: 'En Ruta hacia Amazon',
    statusReceivedFba: 'Recibido / Disponible',
    stepDeliveryEst: 'Previsión de Entrega:',

    // Suppliers
    supTitle: 'Proveedores, Fabricantes y 3PL',
    supSubtitle: 'Catálogo homologado de socios comerciales categorizados por país de operación.',
    tabAllSuppliers: 'Todos los Proveedores',
    tabUsa: '🇺🇸 Estados Unidos',
    tabBrasil: '🇧🇷 Brasil',
    tabChina: '🇨🇳 China',
    supShipsToPrep: 'Envía Directo al Prep Center',
    supMoq: 'Pedido Mínimo (MOQ):',
    supVisitCatalog: 'Ver Catálogo',

    // Deal Finder
    finderTitle: 'Búsqueda de Oportunidades (Deal Finder)',
    finderSubtitle: 'Filtre productos viables, analice el margen descontando tarifas y verifique la marca.',
    exportCsv: 'Exportar CSV',
    addCandidate: 'Agregar Candidato',
    searchLabel: 'Buscar',
    searchPlaceholderInput: 'Buscar por ASIN, SKU, Producto o Proveedor...',
    categoryLabel: 'Categoría',
    minRoiLabel: 'ROI Mínimo:',
    colProduct: 'Producto e Identificador',
    colSupplier: 'Proveedor',
    colPricing: 'Costo / Venta',
    colFees: 'Tarifas y Logística',
    colProfitRoi: 'Beneficio Neto / ROI',
    colUngated: 'Estado de Marca',
    colAction: 'Simulación',
    ungatedApproved: 'APROBADO (Ungated)',
    ungatedRequires: 'Requiere Autorización',
    btnSimulateFees: 'Simular en Calculadora',

    // Add Modal
    modalTitle: 'Registrar Nuevo Producto para Análisis',
    modalProductTitle: 'Título del Producto',
    modalAsin: 'Código ASIN o SKU',
    modalCategory: 'Categoría',
    modalSupplier: 'Nombre del Proveedor',
    modalBuyPrice: 'Precio de Compra',
    modalSellPrice: 'Precio de Venta Estimado',
    modalCancel: 'Cancelar',
    modalSave: 'Guardar en Radar',

    // SaaS Pitch
    pitchHeroTag: 'Módulo Comercial B2B',
    pitchHeroTitle1: 'La Plataforma Completa de Gestión para',
    pitchHeroTitle2: 'Operaciones Amazon FBA y Cross-Border',
    pitchHeroSub: 'Automatice compras, controle el unit economics y sincronice inventarios internacionales y nacionales en un solo lugar.',
    pitchFeature1Title: 'Unit Economics Exacto',
    pitchFeature1Desc: 'Descuentos automáticos de comisiones de Amazon, tarifas de entrega y etiquetado 3PL.',
    pitchFeature2Title: 'Logística Multi-Hub',
    pitchFeature2Desc: 'Monitoree envíos en Prep Ninjas y logística terrestre nacional con seguimiento unificado.',
    pitchFeature3Title: 'Multi-Moneda Nativo',
    pitchFeature3Desc: 'Gestione operaciones en USD ($) y BRL (R$) de forma separada y sin confusiones.',
    pitchPricingTitle: 'Planes de Acceso',
    pitchPricingSub: 'Diseñado a medida para vendedores en crecimiento en Amazon',
    planStarter: 'Starter',
    planPro: 'Pro Suite',
    planEnterprise: 'Enterprise',
    btnStartTrial: 'Iniciar Prueba',
    btnSubscribePro: 'Contratar Versión Pro',
    btnContactSales: 'Contactar Asesores',

    // Footer
    footerDesc: 'Plataforma oficial de automatización de comercio electrónico y gestión FBA HelpUS.',
    footerAddressTitle: 'Dirección Comercial Oficial',
    footerAddress: '241 E 16st STE B4, Gulf Shores, AL 36542, Estados Unidos',
    footerContactTitle: 'Atención y Operaciones',
    footerPhone: '+1 (334) 219-3221 / +55 (83) 99872-1848',
    footerEmail: 'contact@helpusllc.com',
    footerRights: '© 2026 HelpUS Global. Todos los derechos reservados.',
  },
};
