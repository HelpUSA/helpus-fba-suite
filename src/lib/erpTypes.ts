export type WarehouseCode =
  | 'WH-USA-PREP'           // Prep Ninjas (Salt Lake City, UT)
  | 'WH-USA-FBA-RYY2'       // Amazon Fulfillment Center RYY2 (White, GA)
  | 'WH-BR-TRANSIT-BRASPRESS' // Braspress Em Trânsito (ES -> JPA)
  | 'WH-BR-LOCAL-JPA';      // HelpUS Filial Bessa (João Pessoa/PB)

export interface WarehouseInfo {
  code: WarehouseCode;
  name: string;
  country: 'US' | 'BR';
  description: string;
}

export const WAREHOUSES: Record<WarehouseCode, WarehouseInfo> = {
  'WH-USA-PREP': {
    code: 'WH-USA-PREP',
    name: 'Prep Ninjas Hub (Salt Lake City, UT)',
    country: 'US',
    description: 'Armazém 3PL para recepção, inspeção e etiquetagem FNSKU nos EUA.',
  },
  'WH-USA-FBA-RYY2': {
    code: 'WH-USA-FBA-RYY2',
    name: 'Amazon FBA RYY2 (White, GA)',
    country: 'US',
    description: 'Centro de Distribuição FBA da Amazon pronto para despacho Prime.',
  },
  'WH-BR-TRANSIT-BRASPRESS': {
    code: 'WH-BR-TRANSIT-BRASPRESS',
    name: 'Braspress Logística (Em Trânsito)',
    country: 'BR',
    description: 'Carga rodoviária interestadual em transferência para a filial JPA.',
  },
  'WH-BR-LOCAL-JPA': {
    code: 'WH-BR-LOCAL-JPA',
    name: 'HelpUS Base Bessa (João Pessoa/PB)',
    country: 'BR',
    description: 'Polo logístico para separação, conferência e expedição Mercado Envios / DBA.',
  },
};

export const NATIVOS_SKU_CATALOG: Record<
  string,
  { sku: string; title: string; defaultSalePrice: number; defaultCost: number }
> = {
  '001': {
    sku: 'NAT-RESV-60CAPS',
    title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 79.9,
    defaultCost: 25.76,
  },
  '002': {
    sku: 'NAT-MAG-TREON-60C',
    title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 59.9,
    defaultCost: 15.8,
  },
  '003': {
    sku: 'NAT-COQ10-VITE-60C',
    title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 69.9,
    defaultCost: 21.26,
  },
  '004': {
    sku: 'NAT-COLAG-VITC-60C',
    title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 54.9,
    defaultCost: 17.93,
  },
  '005': {
    sku: 'NAT-6MAG-60C',
    title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 59.9,
    defaultCost: 18.41,
  },
  '006': {
    sku: 'NAT-NAC-60C',
    title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil',
    defaultSalePrice: 54.9,
    defaultCost: 17.57,
  },
};

export interface InventoryItem {
  id: string;
  sku: string;
  asin?: string;
  ncm?: string;
  title: string;
  marketplace: 'Amazon US' | 'Amazon BR';
  currency: 'USD' | 'BRL';
  unitCost: number;
  salePrice: number;
  imageUrl: string;
  supplierName: string;
  balances: Record<WarehouseCode, number>;
  totalStock: number;
  reorderPoint: number;
  isDemo?: boolean;
  environment?: 'production' | 'sandbox';
}

export interface StockMovement {
  id: string;
  timestamp: string;
  sku: string;
  productTitle: string;
  type: 'INBOUND_NFE' | 'INBOUND_IMPORT' | 'TRANSFER' | 'SALE' | 'ADJUSTMENT';
  fromWarehouse?: WarehouseCode;
  toWarehouse?: WarehouseCode;
  quantity: number;
  unitCost?: number;
  documentRef?: string;
  notes?: string;
  isDemo?: boolean;
}

export interface StoredInvoice {
  id: string;
  tipo: 'NFE_BR' | 'INVOICE_US';
  numero: string;
  serie?: string;
  chave?: string;
  dataEmissao: string;
  dataImportacao: string;
  fornecedorNome: string;
  fornecedorDoc: string;
  valorTotal: number;
  moeda: 'BRL' | 'USD';
  status: 'PROCESSADA' | 'EM_TRANSITO' | 'CONCILIADA';
  itensCount: number;
  isDemo?: boolean;
  detalhesItens: Array<{
    sku: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    custoEfetivoUnitario: number;
  }>;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  marketplace: 'Amazon US' | 'Amazon BR' | 'Mercado Livre';
  date: string;
  sku: string;
  productTitle: string;
  quantity: number;
  salePrice: number;
  unitCost: number;
  grossProfit: number;
  customerCity: string;
  warehouseSource: WarehouseCode;
  status: 'CONFIRMED' | 'DELIVERED';
  isDemo?: boolean;
}

export interface ReturnRecord {
  id: string;
  returnDate: string;
  orderNumber?: string;
  sku: string;
  productTitle: string;
  quantity: number;
  reason: 'CUSTOMER_DEFECT' | 'DAMAGED_CARRIER' | 'WRONG_ITEM' | 'CUSTOMER_REMORSE' | 'LOST_IN_TRANSIT';
  disposition: 'SELLABLE' | 'DEFECTIVE' | 'CARRIER_DAMAGED' | 'CUSTOMER_DAMAGED';
  warehouse: WarehouseCode;
  status: 'RECEIVED' | 'INSPECTION' | 'RESTOCKED' | 'REIMBURSEMENT_CLAIMED' | 'REIMBURSED' | 'DISPOSED';
  reimbursementAmount?: number;
  currency: 'USD' | 'BRL';
  notes?: string;
  isDemo?: boolean;
}

export interface DreStatement {
  period: string;
  country: 'US' | 'BR' | 'CONSOLIDATED';
  currency: 'USD' | 'BRL';
  ptaxRate: number;
  grossRevenue: number;
  deductions: {
    marketplaceFees: number;
    fulfillmentFees: number;
    taxes: number;
    totalDeductions: number;
  };
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: {
    prepFees: number;
    storageFees: number;
    inboundFreight: number;
    totalOpEx: number;
  };
  netOperatingIncome: number;
  netMarginPercent: number;
}

// ============================================================================
// Phase P1: Authoritative Financial Ledger & DRE Types (Order 045)
// ============================================================================

export type FinancialLedgerSourceEventType =
  | 'ORDER_SALE'
  | 'INVOICE_PURCHASE'
  | 'MARKETPLACE_FEE'
  | 'FULFILLMENT_FBA'
  | 'PREP_SERVICE'
  | 'INBOUND_FREIGHT'
  | 'STORAGE_FEE'
  | 'TAX_SIMPLES'
  | 'CUSTOMER_RETURN'
  | 'REIMBURSEMENT'
  | 'COMPENSATION_REVERSAL'
  | 'ADJUSTMENT';

export type FinancialMarketplace =
  | 'Amazon US'
  | 'Amazon BR'
  | 'Mercado Livre'
  | 'CONSOLIDATED'
  | 'DIRECT_PURCHASE';

export type FinancialCategory =
  | 'RECEITA_BRUTA'
  | 'CMV'
  | 'TAXA_MARKETPLACE'
  | 'FULFILLMENT_FBA'
  | 'PREP'
  | 'FRETE'
  | 'ARMAZENAGEM'
  | 'IMPOSTO_DAS'
  | 'REEMBOLSO'
  | 'ESTORNO'
  | 'OUTRAS_DESPESAS';

export type FinancialStatus = 'REALIZADO' | 'ESTIMADO' | 'PROJETADO';

export interface FxRateRecord {
  id?: string;
  rateDate: string; // YYYY-MM-DD
  currencyFrom: string;
  currencyTo: string;
  rate: number;
  source: string;
  isFallback: boolean;
  createdAt?: string;
}

export interface FinancialLedgerEntry {
  id?: string;
  entryNumber: string;
  idempotencyKey: string;
  sourceEventType: FinancialLedgerSourceEventType;
  sourceId: string;
  marketplace: FinancialMarketplace;
  competenceDate: string; // YYYY-MM-DD
  currency: 'USD' | 'BRL';
  amountOriginal: number;
  entryDirection: 'CREDIT' | 'DEBIT';
  amountBrl: number;
  fxRate: number;
  fxSource: string;
  category: FinancialCategory;
  status: FinancialStatus;
  reversalOfId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  createdBy?: string;
  environment?: 'staging' | 'production' | 'sandbox';
}

export interface AuditedDreMetric {
  realizado: number;
  estimado: number;
  projetado: number;
  total: number;
}

export interface AuditedDreStatement {
  period: string; // e.g. '2026-10' or 'ALL'
  marketplace: FinancialMarketplace;
  currency: 'USD' | 'BRL';
  fxRateApplied: number;
  fxSource: string;
  isFxFallback: boolean;
  grossRevenue: AuditedDreMetric;
  deductions: {
    marketplaceFees: AuditedDreMetric;
    fulfillmentFees: AuditedDreMetric;
    taxes: AuditedDreMetric;
    reimbursements: AuditedDreMetric;
    reversals: AuditedDreMetric;
    totalDeductions: AuditedDreMetric;
  };
  netRevenue: AuditedDreMetric;
  cogs: AuditedDreMetric;
  grossProfit: AuditedDreMetric;
  grossMarginPercent: number;
  operatingExpenses: {
    prepFees: AuditedDreMetric;
    storageFees: AuditedDreMetric;
    inboundFreight: AuditedDreMetric;
    otherExpenses: AuditedDreMetric;
    totalOpEx: AuditedDreMetric;
  };
  netOperatingIncome: AuditedDreMetric;
  netMarginPercent: number;
  auditSummary: {
    totalEntries: number;
    realizadoEntries: number;
    estimadoEntries: number;
    reversalEntries?: number;
    lastCompetenceDate?: string;
  };
}

export interface ErpDatabaseState {
  version: string;
  lastUpdated: string;
  items: InventoryItem[];
  movements: StockMovement[];
  invoices: StoredInvoice[];
  orders?: SaleOrder[];
  returns?: ReturnRecord[];
  storageEngine?: 'POSTGRES' | 'PERSISTENT_JSON' | 'EPHEMERAL_CACHE' | 'DEMO_READ_ONLY_UNPERSISTED';
}
