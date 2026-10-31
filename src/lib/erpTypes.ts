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

export interface ErpDatabaseState {
  version: string;
  lastUpdated: string;
  items: InventoryItem[];
  movements: StockMovement[];
  invoices: StoredInvoice[];
  orders?: SaleOrder[];
  returns?: ReturnRecord[];
  storageEngine?: 'POSTGRES' | 'PERSISTENT_JSON' | 'EPHEMERAL_CACHE';
}
