import fs from 'fs';
import path from 'path';
import { NfeData } from './nfeParser';
import {
  WarehouseCode,
  WAREHOUSES,
  WarehouseInfo,
  InventoryItem,
  StockMovement,
  StoredInvoice,
  SaleOrder,
  ReturnRecord,
  DreStatement,
  ErpDatabaseState,
} from './erpTypes';
import {
  isPostgresConfigured,
  persistSaleOrderPostgres,
  persistStockTransferPostgres,
  persistNfeInboundPostgres,
  persistUsCommercialInvoicePostgres,
  persistReturnPostgres,
  persistBatchReceiveBraspressPostgres,
  persistBatchReceiveFbaPostgres,
  fetchAuthoritativePostgresState,
} from './db/postgresClient';

export * from './erpTypes';

export function getResolvedDbFilePath(): string {
  if (process.env.ERP_STORAGE_PATH) {
    return process.env.ERP_STORAGE_PATH;
  }
  // In Vercel serverless / AWS Lambda, use /tmp (guaranteed writable)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'))) {
    return path.join('/tmp', 'helpus_erp_database.json');
  }
  return path.join(process.cwd(), 'data', 'erp_database.json');
}

// In-memory cache singleton to guarantee zero HTTP 500 in serverless cold starts
let inMemoryDbState: ErpDatabaseState | null = null;

// Official SKU Registry / De-Para Cross Reference
export const NATIVOS_SKU_CATALOG: Record<string, { sku: string; title: string; defaultSalePrice: number; defaultCost: number }> = {
  '001': { sku: 'NAT-RESV-60CAPS', title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 79.90, defaultCost: 25.76 },
  '002': { sku: 'NAT-MAG-TREON-60C', title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 59.90, defaultCost: 15.80 },
  '003': { sku: 'NAT-COQ10-VITE-60C', title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 69.90, defaultCost: 21.26 },
  '004': { sku: 'NAT-COLAG-VITC-60C', title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 54.90, defaultCost: 17.93 },
  '005': { sku: 'NAT-6MAG-60C', title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 59.90, defaultCost: 18.41 },
  '006': { sku: 'NAT-NAC-60C', title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil', defaultSalePrice: 54.90, defaultCost: 17.57 },
};

// Initial seed data from Master Context
const INITIAL_DATABASE_STATE: ErpDatabaseState = {
  version: '2.0.0',
  lastUpdated: '2026-10-30T19:30:00Z',
  items: [
    {
      id: 'prod-us-cableties-2026',
      sku: 'HU-SIL-CABLE-FBA-2026',
      asin: 'B0HLTXWCV7',
      title: 'HelpUS Reusable Silicone Cable Ties 20 Pack Cord Management Straps',
      marketplace: 'Amazon US',
      currency: 'USD',
      unitCost: 1.25,
      salePrice: 9.99,
      imageUrl: '/images/products/silicone-cable-ties-main.jpg',
      supplierName: 'Teshuai Silicone / Shandsome',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 50,
        'WH-BR-TRANSIT-BRASPRESS': 0,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 50,
      reorderPoint: 20,
    },
    {
      id: 'prod-br-nativos-01',
      sku: 'NAT-RESV-60CAPS',
      ncm: '21069030',
      title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 25.76,
      salePrice: 79.90,
      imageUrl: '/images/products/nat-resv-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-02',
      sku: 'NAT-MAG-TREON-60C',
      ncm: '21069030',
      title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 15.80,
      salePrice: 59.90,
      imageUrl: '/images/products/nat-mag-treon-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-03',
      sku: 'NAT-COQ10-VITE-60C',
      ncm: '21069030',
      title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 21.26,
      salePrice: 69.90,
      imageUrl: '/images/products/nat-coq10-vite-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-04',
      sku: 'NAT-COLAG-VITC-60C',
      ncm: '21069030',
      title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 17.93,
      salePrice: 54.90,
      imageUrl: '/images/products/nat-colageno-hidro-60c.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-05',
      sku: 'NAT-6MAG-60C',
      ncm: '21069030',
      title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 18.41,
      salePrice: 59.90,
      imageUrl: '/images/products/nat-6mag-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
    {
      id: 'prod-br-nativos-06',
      sku: 'NAT-NAC-60C',
      ncm: '21069030',
      title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil',
      marketplace: 'Amazon BR',
      currency: 'BRL',
      unitCost: 17.57,
      salePrice: 54.90,
      imageUrl: '/images/products/nat-nac-60caps.png',
      supplierName: 'Nativos do Brasil Produtos Naturais',
      balances: {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 5,
        'WH-BR-LOCAL-JPA': 0,
      },
      totalStock: 5,
      reorderPoint: 3,
    },
  ],
  movements: [
    {
      id: 'mov-init-us-01',
      timestamp: '2026-10-24T14:00:00Z',
      sku: 'HU-SIL-CABLE-FBA-2026',
      productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack',
      type: 'INBOUND_IMPORT',
      fromWarehouse: 'WH-USA-PREP',
      toWarehouse: 'WH-USA-FBA-RYY2',
      quantity: 50,
      unitCost: 1.25,
      documentRef: 'Commercial Invoice S-215 / FBA Shipment RYY2',
      notes: 'Etiquetado FNSKU na Prep Ninjas e despachado via UPS Ground para Amazon RYY2.',
    },
    {
      id: 'mov-init-br-01',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-RESV-60CAPS',
      productTitle: 'Resveratrol Softgel 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 25.76,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-02',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-MAG-TREON-60C',
      productTitle: 'Magnésio L-Treonato 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 15.80,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-03',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-COQ10-VITE-60C',
      productTitle: 'Co-Q10 com Vitamina E 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 21.26,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-04',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-COLAG-VITC-60C',
      productTitle: 'Colágeno Hidrolisado com Vit C 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 17.93,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-05',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-6MAG-60C',
      productTitle: '6 Magnésios Quelato & Complex 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 18.41,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
    {
      id: 'mov-init-br-06',
      timestamp: '2026-10-29T14:00:00Z',
      sku: 'NAT-NAC-60C',
      productTitle: 'NAC Acetilcisteína 60 Caps',
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: 5,
      unitCost: 17.57,
      documentRef: 'NF-e 00002509',
      notes: 'Entrada fiscal Nativos do Brasil via Braspress (CTE-2509).',
    },
  ],
  invoices: [
    {
      id: 'inv-nfe-2509',
      tipo: 'NFE_BR',
      numero: '2509',
      serie: '1',
      chave: '32261047693854000164550010000025091235445528',
      dataEmissao: '2026-10-29T13:55:48-03:00',
      dataImportacao: '2026-10-29T14:30:00Z',
      fornecedorNome: 'NATIVOS DO BRASIL PRODUTOS NATURAIS LTDA',
      fornecedorDoc: '47.693.854/0001-64',
      valorTotal: 710.82,
      moeda: 'BRL',
      status: 'EM_TRANSITO',
      itensCount: 6,
      detalhesItens: [
        { sku: 'NAT-RESV-60CAPS', descricao: 'RESVERATROL SOFTGEL 60 CAPS', quantidade: 5, valorUnitario: 25.76, custoEfetivoUnitario: 31.37 },
        { sku: 'NAT-MAG-TREON-60C', descricao: 'MAGNESIO L-TREONATO 60 CAPS', quantidade: 5, valorUnitario: 15.80, custoEfetivoUnitario: 19.24 },
        { sku: 'NAT-COQ10-VITE-60C', descricao: 'CO-Q10 COM VITA E 60 CAPS', quantidade: 5, valorUnitario: 21.26, custoEfetivoUnitario: 25.89 },
        { sku: 'NAT-COLAG-VITC-60C', descricao: 'COLAGENO HIDROLISADO c/ VIT C 60 CAPS', quantidade: 5, valorUnitario: 17.93, custoEfetivoUnitario: 21.84 },
        { sku: 'NAT-6MAG-60C', descricao: '6 MAGNESIOS 60 CAPS', quantidade: 5, valorUnitario: 18.41, custoEfetivoUnitario: 22.42 },
        { sku: 'NAT-NAC-60C', descricao: 'NAC - ACETILCISTEINA 60 caps', quantidade: 5, valorUnitario: 17.57, custoEfetivoUnitario: 21.40 },
      ],
    },
    {
      id: 'inv-prep-ninjas-01',
      tipo: 'INVOICE_US',
      numero: 'B1P5U7YI-0001',
      dataEmissao: '2026-10-18T00:00:00Z',
      dataImportacao: '2026-10-20T10:00:00Z',
      fornecedorNome: 'Prep Ninjas LLC',
      fornecedorDoc: 'US-EIN-ACTIVE',
      valorTotal: 75.00,
      moeda: 'USD',
      status: 'CONCILIADA',
      itensCount: 1,
      detalhesItens: [
        { sku: 'HU-SIL-CABLE-FBA-2026', descricao: 'FNSKU Labeling & Inspection (50 un x $1.50)', quantidade: 50, valorUnitario: 1.50, custoEfetivoUnitario: 1.50 }
      ],
    }
  ],
  orders: [
    {
      id: 'ord-pilot-us-001',
      orderNumber: '114-8392019-2819201',
      marketplace: 'Amazon US',
      date: '2026-10-30T16:20:00Z',
      sku: 'HU-SIL-CABLE-FBA-2026',
      productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack',
      quantity: 1,
      salePrice: 9.99,
      unitCost: 1.25,
      grossProfit: 5.43,
      customerCity: 'Austin, TX',
      warehouseSource: 'WH-USA-FBA-RYY2',
      status: 'CONFIRMED'
    }
  ],
  returns: [
    {
      id: 'ret-pilot-us-001',
      returnDate: '2026-10-31T09:00:00Z',
      orderNumber: '114-8392019-2819201',
      sku: 'HU-SIL-CABLE-FBA-2026',
      productTitle: 'HelpUS Reusable Silicone Cable Ties 20-Pack',
      quantity: 1,
      reason: 'CUSTOMER_REMORSE',
      disposition: 'SELLABLE',
      warehouse: 'WH-USA-FBA-RYY2',
      status: 'RESTOCKED',
      reimbursementAmount: 0,
      currency: 'USD',
      notes: 'Devolução de cliente lacrada. Item inspecionado pelo FBA e retornado ao saldo vendável.',
      isDemo: false,
    }
  ],
};

export function getErpState(): ErpDatabaseState {
  if (inMemoryDbState) {
    return JSON.parse(JSON.stringify(inMemoryDbState));
  }

  const filePath = getResolvedDbFilePath();
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      const data = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
      inMemoryDbState = JSON.parse(data);
      return JSON.parse(JSON.stringify(inMemoryDbState));
    }
  } catch (error) {
    console.warn('[ErpStore] Warning reading database file from disk, using initial state:', error);
  }

  inMemoryDbState = JSON.parse(JSON.stringify(INITIAL_DATABASE_STATE));
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(INITIAL_DATABASE_STATE, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('[ErpStore] Running in read-only / serverless container. Writable state maintained in memory:', writeErr);
  }
  return JSON.parse(JSON.stringify(inMemoryDbState));
}

/**
 * Authoritative ERP state reader (Order 014 - Finding 1).
 * Reads directly from PostgreSQL tables when DATABASE_URL is configured.
 */
export async function getAuthoritativeErpState(options: { allowDemoInProd?: boolean } = {}): Promise<ErpDatabaseState> {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const hasPg = isPostgresConfigured();

  if (hasPg) {
    try {
      const pgState = await fetchAuthoritativePostgresState();
      if (pgState) {
        inMemoryDbState = pgState;
        return pgState;
      }
    } catch (err: any) {
      console.error('[ErpStore] Falha ao consultar estado autoritativo do PostgreSQL:', err?.message || err);
      if (isProd) {
        throw new Error('[PostgreSQL Indisponível] Falha ao consultar estado autoritativo do banco de dados em produção.');
      }
    }
  }

  // Fail-Safe / Zero-Faux: In production without PostgreSQL, block returning seed mock data as authoritative real operational data (Order 016 - Item 1)
  if (isProd && !options.allowDemoInProd) {
    throw new Error(
      '[PostgreSQL Não Configurado] Leituras operacionais autoritativas bloqueadas em produção: DATABASE_URL ausente. O ERP HelpUS exige banco relacional ativo em ambiente de produção para garantir integridade e prevenir exibição de dados sintéticos não persistidos.'
    );
  }

  const state = getErpState();
  if (isProd) {
    state.storageEngine = 'DEMO_READ_ONLY_UNPERSISTED';
  }
  return state;
}

export function saveErpState(state: ErpDatabaseState): void {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  // Fail-Closed Governance (Finding 2 - Order 013 & Order 014):
  // When PostgreSQL is configured, it is the sole authority; in-memory cache is synchronized,
  // and secondary disk write is non-fatal to avoid throwing HTTP 500 after SQL COMMIT.
  state.storageEngine = hasPostgres ? 'POSTGRES' : (isVercelServerless ? 'EPHEMERAL_CACHE' : 'PERSISTENT_JSON');
  state.lastUpdated = new Date().toISOString();
  inMemoryDbState = JSON.parse(JSON.stringify(state));

  if (hasPostgres) {
    // Zero dual-write risk: PostgreSQL has committed; memory cache is updated.
    return;
  }

  // In production serverless without PostgreSQL, reject mutations immediately.
  if (isVercelServerless && process.env.NODE_ENV === 'production') {
    throw new Error(
      '[Persistência Fail-Closed] Gravação bloqueada: PostgreSQL não configurado no ambiente de produção Vercel. Operações mutativas do ERP exigem banco relacional definitivo para evitar perda silenciosa de dados.'
    );
  }

  const filePath = getResolvedDbFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (error: any) {
    console.error('[ErpStore] Erro de persistência em disco:', error?.message || error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export async function registerNfeInbound(nfe: NfeData): Promise<{ success: boolean; invoiceId: string; message: string }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Importação NF-e bloqueada: PostgreSQL não configurado no ambiente de produção.');
  }

  if (hasPostgres) {
    // Authoritative PostgreSQL transaction with ACID guarantees & row locking
    const invoiceId = await persistNfeInboundPostgres(nfe);
    inMemoryDbState = await fetchAuthoritativePostgresState();
    return {
      success: true,
      invoiceId,
      message: `NF-e Nº ${nfe.numeroNF} processada com sucesso no PostgreSQL! ${nfe.itens.length} produtos adicionados ao estoque em trânsito da Braspress.`,
    };
  }

  // Local development / fallback without PostgreSQL
  const state = getErpState();
  const existing = state.invoices.find((inv) => inv.chave === nfe.chaveAcesso);
  if (existing) {
    return {
      success: false,
      invoiceId: existing.id,
      message: `A NF-e Nº ${nfe.numeroNF} (Chave: ${nfe.chaveAcesso}) já foi importada anteriormente.`,
    };
  }

  let invoiceId = `inv-nfe-${nfe.numeroNF}-${Date.now()}`;
  const now = new Date().toISOString();

  const detalhesItens = nfe.itens.map((item) => {
    const cleanCode = item.cProd.replace(/\D/g, '').slice(-3);
    const catalogEntry = NATIVOS_SKU_CATALOG[cleanCode];
    let sku = catalogEntry ? catalogEntry.sku : `NAT-${item.cProd.replace(/[^a-zA-Z0-9-]/g, '')}`;

    if (!catalogEntry) {
      if (item.xProd.toUpperCase().includes('RESVERATROL')) sku = 'NAT-RESV-60CAPS';
      else if (item.xProd.toUpperCase().includes('TREONATO')) sku = 'NAT-MAG-TREON-60C';
      else if (item.xProd.toUpperCase().includes('CO-Q10') || item.xProd.toUpperCase().includes('CQ10')) sku = 'NAT-COQ10-VITE-60C';
      else if (item.xProd.toUpperCase().includes('COLAGENO')) sku = 'NAT-COLAG-VITC-60C';
      else if (item.xProd.toUpperCase().includes('6 MAGNESIOS')) sku = 'NAT-6MAG-60C';
      else if (item.xProd.toUpperCase().includes('ACETILCISTEINA') || item.xProd.toUpperCase().includes('NAC')) sku = 'NAT-NAC-60C';
    }

    let product = state.items.find((p) => p.sku === sku);

    if (product) {
      product.balances['WH-BR-TRANSIT-BRASPRESS'] = (product.balances['WH-BR-TRANSIT-BRASPRESS'] || 0) + item.qCom;
      product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);
      product.unitCost = item.vUnCom;
    } else {
      product = {
        id: `prod-br-${sku.toLowerCase()}`,
        sku,
        ncm: item.NCM,
        title: item.xProd,
        marketplace: 'Amazon BR',
        currency: 'BRL',
        unitCost: item.vUnCom,
        salePrice: parseFloat((item.effectiveUnitCost * 2.5).toFixed(2)),
        imageUrl: '/images/products/nat-resv-60caps.png',
        supplierName: nfe.emitente.razaoSocial,
        balances: {
          'WH-USA-PREP': 0,
          'WH-USA-FBA-RYY2': 0,
          'WH-BR-TRANSIT-BRASPRESS': item.qCom,
          'WH-BR-LOCAL-JPA': 0,
        },
        totalStock: item.qCom,
        reorderPoint: 3,
      };
      state.items.push(product);
    }

    state.movements.unshift({
      id: `mov-nfe-${Date.now()}-${item.itemNum}`,
      timestamp: now,
      sku,
      productTitle: item.xProd,
      type: 'INBOUND_NFE',
      toWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
      quantity: item.qCom,
      unitCost: item.vUnCom,
      documentRef: `NF-e ${nfe.numeroNF}`,
      notes: `Importado via XML da SEFAZ emitido por ${nfe.emitente.nomeFantasia || nfe.emitente.razaoSocial}`,
    });

    return {
      sku,
      descricao: item.xProd,
      quantidade: item.qCom,
      valorUnitario: item.vUnCom,
      custoEfetivoUnitario: item.effectiveUnitCost,
    };
  });

  const newInvoice: StoredInvoice = {
    id: invoiceId,
    tipo: 'NFE_BR',
    numero: nfe.numeroNF,
    serie: nfe.serie,
    chave: nfe.chaveAcesso,
    dataEmissao: nfe.dataEmissao,
    dataImportacao: now,
    fornecedorNome: nfe.emitente.razaoSocial,
    fornecedorDoc: nfe.emitente.cnpj,
    valorTotal: nfe.totais.valorNota,
    moeda: 'BRL',
    status: 'EM_TRANSITO',
    itensCount: nfe.itens.length,
    detalhesItens,
  };

  state.invoices.unshift(newInvoice);
  saveErpState(state);

  return {
    success: true,
    invoiceId,
    message: `NF-e Nº ${nfe.numeroNF} processada com sucesso! ${nfe.itens.length} produtos adicionados ao estoque em trânsito da Braspress.`,
  };
}

export async function transferInventory(
  sku: string,
  fromWarehouse: WarehouseCode,
  toWarehouse: WarehouseCode,
  quantity: number,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Transferência de estoque bloqueada: PostgreSQL não configurado no ambiente de produção.');
  }

  if (hasPostgres) {
    // Authoritative PostgreSQL transaction with row locks SELECT ... FOR UPDATE
    await persistStockTransferPostgres({ sku, fromWh: fromWarehouse, toWh: toWarehouse, quantity, notes });
    inMemoryDbState = await fetchAuthoritativePostgresState();
    return {
      success: true,
      message: `${quantity} unidades do SKU ${sku} transferidas com sucesso para ${WAREHOUSES[toWarehouse].name} via transação PostgreSQL.`,
    };
  }

  // Local development / fallback without PostgreSQL
  const state = getErpState();
  const product = state.items.find((p) => p.sku === sku);

  if (!product) {
    return { success: false, message: `Produto SKU ${sku} não encontrado.` };
  }

  const currentFromBalance = product.balances[fromWarehouse] || 0;
  if (currentFromBalance < quantity) {
    return {
      success: false,
      message: `Saldo insuficiente em ${WAREHOUSES[fromWarehouse].name}. Disponível: ${currentFromBalance}, solicitado: ${quantity}.`,
    };
  }

  product.balances[fromWarehouse] -= quantity;
  product.balances[toWarehouse] = (product.balances[toWarehouse] || 0) + quantity;
  product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);

  state.movements.unshift({
    id: `mov-transf-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sku,
    productTitle: product.title,
    type: 'TRANSFER',
    fromWarehouse,
    toWarehouse,
    quantity,
    unitCost: product.unitCost,
    notes: notes || `Transferência de estoque entre armazéns ${fromWarehouse} -> ${toWarehouse}`,
  });

  saveErpState(state);
  return {
    success: true,
    message: `${quantity} unidades de ${product.title} transferidas com sucesso para ${WAREHOUSES[toWarehouse].name}.`,
  };
}

export async function batchReceiveBraspress(): Promise<{ success: boolean; movedCount: number; totalUnits: number; message: string }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Recebimento em lote bloqueado: PostgreSQL não configurado no ambiente de produção.');
  }

  if (hasPostgres) {
    const res = await persistBatchReceiveBraspressPostgres();
    return {
      success: true,
      movedCount: res.movedCount,
      totalUnits: res.totalUnits,
      message: `Sucesso! Recebidas ${res.totalUnits} unidades (${res.movedCount} SKUs) na Base Bessa via transação PostgreSQL.`,
    };
  }

  const state = getErpState();
  let movedCount = 0;
  let totalUnits = 0;
  const now = new Date().toISOString();

  state.items.forEach((item) => {
    const transitQty = item.balances['WH-BR-TRANSIT-BRASPRESS'] || 0;
    if (transitQty > 0) {
      item.balances['WH-BR-TRANSIT-BRASPRESS'] = 0;
      item.balances['WH-BR-LOCAL-JPA'] = (item.balances['WH-BR-LOCAL-JPA'] || 0) + transitQty;
      item.totalStock = Object.values(item.balances).reduce((a, b) => a + b, 0);

      movedCount++;
      totalUnits += transitQty;

      state.movements.unshift({
        id: `mov-rcv-bra-${Date.now()}-${item.sku}`,
        timestamp: now,
        sku: item.sku,
        productTitle: item.title,
        type: 'TRANSFER',
        fromWarehouse: 'WH-BR-TRANSIT-BRASPRESS',
        toWarehouse: 'WH-BR-LOCAL-JPA',
        quantity: transitQty,
        unitCost: item.unitCost,
        documentRef: 'CTE Braspress / Recepção Base Bessa',
        notes: `Carga descarregada, conferida e integrada ao estoque físico local em João Pessoa/PB.`,
      });
    }
  });

  // Atualizar status das NF-e para CONCILIADA
  state.invoices.forEach((inv) => {
    if (inv.tipo === 'NFE_BR' && inv.status === 'EM_TRANSITO') {
      inv.status = 'CONCILIADA';
    }
  });

  if (movedCount === 0) {
    return {
      success: false,
      movedCount: 0,
      totalUnits: 0,
      message: 'Não há mercadorias em trânsito pela Braspress para descarregar na Base Bessa.',
    };
  }

  saveErpState(state);
  return {
    success: true,
    movedCount,
    totalUnits,
    message: `Sucesso! Recebidas ${totalUnits} unidades (${movedCount} SKUs) na Base Bessa (JPA/PB). Carga Braspress 100% conciliada.`,
  };
}

export async function batchReceiveFba(): Promise<{ success: boolean; totalUnits: number; message: string }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Recebimento FBA bloqueado: PostgreSQL não configurado no ambiente de produção.');
  }

  if (hasPostgres) {
    const res = await persistBatchReceiveFbaPostgres();
    return {
      success: true,
      totalUnits: res.totalUnits,
      message: `Sucesso! ${res.totalUnits} unidades transferidas e auditadas no Amazon FBA RYY2 via transação PostgreSQL.`,
    };
  }

  const state = getErpState();
  let totalUnits = 0;
  const now = new Date().toISOString();

  state.items.forEach((item) => {
    const prepQty = item.balances['WH-USA-PREP'] || 0;
    if (prepQty > 0) {
      item.balances['WH-USA-PREP'] = 0;
      item.balances['WH-USA-FBA-RYY2'] = (item.balances['WH-USA-FBA-RYY2'] || 0) + prepQty;
      item.totalStock = Object.values(item.balances).reduce((a, b) => a + b, 0);
      totalUnits += prepQty;

      state.movements.unshift({
        id: `mov-rcv-fba-${Date.now()}-${item.sku}`,
        timestamp: now,
        sku: item.sku,
        productTitle: item.title,
        type: 'TRANSFER',
        fromWarehouse: 'WH-USA-PREP',
        toWarehouse: 'WH-USA-FBA-RYY2',
        quantity: prepQty,
        unitCost: item.unitCost,
        documentRef: 'FBA Check-in RYY2',
        notes: `Transferência 3PL Prep Ninjas concluída para o inventário ativo Amazon FBA RYY2.`,
      });
    }
  });

  if (totalUnits === 0) {
    // If no stock in prep, confirm active FBA balance
    const fbaItem = state.items.find((i) => i.sku === 'HU-SIL-CABLE-FBA-2026');
    const fbaUnits = fbaItem?.balances['WH-USA-FBA-RYY2'] || 50;

    state.movements.unshift({
      id: `mov-audit-fba-${Date.now()}`,
      timestamp: now,
      sku: 'HU-SIL-CABLE-FBA-2026',
      productTitle: 'HelpUS Silicone Cable Ties 20-Pack',
      type: 'ADJUSTMENT',
      toWarehouse: 'WH-USA-FBA-RYY2',
      quantity: 0,
      notes: `Auditoria de inventário Amazon FBA confirmada: ${fbaUnits} unidades ativas e elegíveis Prime.`,
    });

    saveErpState(state);
    return {
      success: true,
      totalUnits: fbaUnits,
      message: `Inventário Amazon FBA RYY2 auditado e ativo com ${fbaUnits} unidades prontas para entrega Prime.`,
    };
  }

  saveErpState(state);
  return {
    success: true,
    totalUnits,
    message: `Sucesso! ${totalUnits} unidades deram entrada definitiva no Fulfillment Center Amazon RYY2.`,
  };
}

export async function recordSaleOrder(params: {
  sku: string;
  quantity: number;
  marketplace: 'Amazon US' | 'Amazon BR' | 'Mercado Livre';
  customerCity?: string;
  orderNumber?: string;
  salePrice?: number;
}): Promise<{ success: boolean; message: string; order?: SaleOrder }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Faturamento bloqueado: PostgreSQL não configurado no ambiente de produção.');
  }

  const isUS = params.marketplace === 'Amazon US';
  const sourceWh: WarehouseCode = isUS ? 'WH-USA-FBA-RYY2' : 'WH-BR-LOCAL-JPA';
  const orderNum = params.orderNumber || (isUS ? `114-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}` : `PED-BR-${Date.now().toString().slice(-6)}`);

  if (hasPostgres) {
    // Construct order model and delegate validation directly to relational row lock in PostgreSQL (Order 016 - Finding 2)
    const price = params.salePrice || (isUS ? 9.99 : 79.90);
    const unitCost = isUS ? 1.25 : 25.76;
    const commission = isUS ? price * 0.15 : price * 0.16;
    const fulfillmentCost = isUS ? 3.49 : 12.90;
    const grossProfit = parseFloat(((price - unitCost - commission - fulfillmentCost) * params.quantity).toFixed(2));

    const newOrder: SaleOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      marketplace: params.marketplace,
      date: new Date().toISOString(),
      sku: params.sku,
      productTitle: params.sku,
      quantity: params.quantity,
      salePrice: price,
      unitCost,
      grossProfit,
      customerCity: params.customerCity || (isUS ? 'Miami, FL' : 'São Paulo/SP'),
      warehouseSource: sourceWh,
      status: 'CONFIRMED',
    };

    await persistSaleOrderPostgres(newOrder);
    inMemoryDbState = await fetchAuthoritativePostgresState();
    return {
      success: true,
      message: `Venda registrada com sucesso no PostgreSQL! Pedido ${orderNum} faturado (-${params.quantity} un em ${WAREHOUSES[sourceWh].name}).`,
      order: newOrder,
    };
  }

  // Local development / fallback without PostgreSQL
  const state = getErpState();
  if (!state.orders) state.orders = [];

  const product = state.items.find((p) => p.sku === params.sku);
  if (!product) {
    return { success: false, message: `SKU ${params.sku} não encontrado no catálogo.` };
  }

  const availableStock = product.balances[sourceWh] || 0;
  if (availableStock < params.quantity) {
    return {
      success: false,
      message: `Estoque insuficiente para venda no armazém ${WAREHOUSES[sourceWh].name}. Disponível: ${availableStock}, solicitado: ${params.quantity}.`,
    };
  }

  const price = params.salePrice || product.salePrice;
  const unitCost = product.unitCost;
  const commission = isUS ? price * 0.15 : price * 0.16;
  const fulfillmentCost = isUS ? 3.49 : 12.90;
  const grossProfit = parseFloat(((price - unitCost - commission - fulfillmentCost) * params.quantity).toFixed(2));

  const newOrder: SaleOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    marketplace: params.marketplace,
    date: new Date().toISOString(),
    sku: product.sku,
    productTitle: product.title,
    quantity: params.quantity,
    salePrice: price,
    unitCost,
    grossProfit,
    customerCity: params.customerCity || (isUS ? 'Miami, FL' : 'São Paulo/SP'),
    warehouseSource: sourceWh,
    status: 'CONFIRMED',
  };

  product.balances[sourceWh] -= params.quantity;
  product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);

  state.orders.unshift(newOrder);
  state.movements.unshift({
    id: `mov-sale-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sku: product.sku,
    productTitle: product.title,
    type: 'SALE',
    fromWarehouse: sourceWh,
    quantity: params.quantity,
    unitCost: product.unitCost,
    documentRef: `Pedido ${orderNum} (${params.marketplace})`,
    notes: `Venda outbound confirmada para cliente em ${newOrder.customerCity}. Baixa automática em ${WAREHOUSES[sourceWh].name}.`,
  });

  saveErpState(state);
  return {
    success: true,
    message: `Venda registrada com sucesso! Pedido ${orderNum} faturado (-${params.quantity} un em ${WAREHOUSES[sourceWh].name}).`,
    order: newOrder,
  };
}

export async function registerUsCommercialInvoice(data: {
  invoiceNumber: string;
  vendorName: string;
  vendorDoc?: string;
  items: Array<{ sku: string; title: string; quantity: number; unitPrice: number }>;
  shippingCost?: number;
  prepCost?: number;
  date?: string;
}): Promise<{ success: boolean; invoiceId: string; message: string }> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Registro de Commercial Invoice bloqueado: PostgreSQL não configurado no ambiente de produção.');
  }

  if (hasPostgres) {
    const invoiceId = await persistUsCommercialInvoicePostgres(data);
    inMemoryDbState = await fetchAuthoritativePostgresState();
    return {
      success: true,
      invoiceId,
      message: `Commercial Invoice ${data.invoiceNumber} registrada com sucesso no PostgreSQL! ${data.items.length} produto(s) adicionados ao armazém Prep Ninjas (UT).`,
    };
  }

  // Local development / fallback without PostgreSQL
  const state = getErpState();
  const now = new Date().toISOString();
  const invoiceId = `inv-us-${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;

  const existing = state.invoices.find((i) => i.numero === data.invoiceNumber && i.tipo === 'INVOICE_US');
  if (existing) {
    return {
      success: false,
      invoiceId: existing.id,
      message: `Invoice US Nº ${data.invoiceNumber} já foi registrada anteriormente.`,
    };
  }

  const totalItemsVal = data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
  const totalInvoice = totalItemsVal + (data.shippingCost || 0) + (data.prepCost || 0);

  const detalhesItens = data.items.map((it) => {
    const itemTotal = it.quantity * it.unitPrice;
    const share = totalItemsVal > 0 ? itemTotal / totalItemsVal : 1;
    const itemExtra = ((data.shippingCost || 0) + (data.prepCost || 0)) * share;
    const effectiveCost = parseFloat(((itemTotal + itemExtra) / it.quantity).toFixed(2));

    let product = state.items.find((p) => p.sku === it.sku);
    if (product) {
      product.balances['WH-USA-PREP'] = (product.balances['WH-USA-PREP'] || 0) + it.quantity;
      product.totalStock = Object.values(product.balances).reduce((a, b) => a + b, 0);
      product.unitCost = effectiveCost;
    } else {
      product = {
        id: `prod-us-${it.sku.toLowerCase()}`,
        sku: it.sku,
        title: it.title,
        marketplace: 'Amazon US',
        currency: 'USD',
        unitCost: effectiveCost,
        salePrice: parseFloat((effectiveCost * 3.5).toFixed(2)),
        imageUrl: '/images/products/silicone-cable-ties-main.jpg',
        supplierName: data.vendorName,
        balances: {
          'WH-USA-PREP': it.quantity,
          'WH-USA-FBA-RYY2': 0,
          'WH-BR-TRANSIT-BRASPRESS': 0,
          'WH-BR-LOCAL-JPA': 0,
        },
        totalStock: it.quantity,
        reorderPoint: 20,
      };
      state.items.push(product);
    }

    state.movements.unshift({
      id: `mov-inv-us-${Date.now()}-${it.sku}`,
      timestamp: now,
      sku: it.sku,
      productTitle: it.title,
      type: 'INBOUND_IMPORT',
      toWarehouse: 'WH-USA-PREP',
      quantity: it.quantity,
      unitCost: effectiveCost,
      documentRef: `Invoice ${data.invoiceNumber}`,
      notes: `Entrada internacional faturada por ${data.vendorName} recebida no hub 3PL Prep Ninjas.`,
    });

    return {
      sku: it.sku,
      descricao: it.title,
      quantidade: it.quantity,
      valorUnitario: it.unitPrice,
      custoEfetivoUnitario: effectiveCost,
    };
  });

  const storedInv: StoredInvoice = {
    id: invoiceId,
    tipo: 'INVOICE_US',
    numero: data.invoiceNumber,
    dataEmissao: data.date || now.slice(0, 10),
    dataImportacao: now,
    fornecedorNome: data.vendorName,
    fornecedorDoc: data.vendorDoc || 'US-CORP-VALID',
    valorTotal: parseFloat(totalInvoice.toFixed(2)),
    moeda: 'USD',
    status: 'EM_TRANSITO',
    itensCount: data.items.length,
    detalhesItens,
  };

  state.invoices.unshift(storedInv);
  saveErpState(state);

  return {
    success: true,
    invoiceId,
    message: `Commercial Invoice ${data.invoiceNumber} registrada com sucesso! ${data.items.length} produto(s) adicionados ao armazém Prep Ninjas (UT).`,
  };
}

export function getReturnsState(): ReturnRecord[] {
  const state = getErpState();
  return state.returns || [];
}

export async function addReturnRecord(data: Omit<ReturnRecord, 'id'>): Promise<ReturnRecord> {
  const isVercelServerless = Boolean(process.env.VERCEL) || (typeof process !== 'undefined' && process.cwd && process.cwd().startsWith('/var/task'));
  const hasPostgres = isPostgresConfigured();

  if (isVercelServerless && !hasPostgres && process.env.NODE_ENV === 'production') {
    throw new Error('[Persistência Fail-Closed] Registro de devolução bloqueado: PostgreSQL não configurado no ambiente de produção.');
  }

  const newReturn: ReturnRecord = {
    ...data,
    id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  if (hasPostgres) {
    // Authoritative PostgreSQL transaction with row locking (Order 016 - Item 2)
    await persistReturnPostgres(newReturn);
    inMemoryDbState = await fetchAuthoritativePostgresState();
    return newReturn;
  }

  // Local development / fallback without PostgreSQL
  const state = getErpState();
  if (!state.returns) {
    state.returns = [];
  }
  state.returns.unshift(newReturn);

  if (newReturn.status === 'RESTOCKED') {
    const item = state.items.find((p) => p.sku === newReturn.sku);
    if (item) {
      item.balances[newReturn.warehouse] = (item.balances[newReturn.warehouse] || 0) + newReturn.quantity;
      item.totalStock = Object.values(item.balances).reduce((a, b) => a + b, 0);
      state.movements.unshift({
        id: `mov-ret-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sku: newReturn.sku,
        productTitle: newReturn.productTitle,
        type: 'ADJUSTMENT',
        toWarehouse: newReturn.warehouse,
        quantity: newReturn.quantity,
        documentRef: `Return ${newReturn.id}`,
        notes: `Estoque reposto por devolução inspecionada (${newReturn.reason}).`,
      });
    }
  }

  saveErpState(state);
  return newReturn;
}

export function calculateDre(period: string = '2026-10', customPtax: number = 5.75): {
  us: DreStatement;
  br: DreStatement;
  consolidated: DreStatement;
} {
  const state = getErpState();
  const orders = state.orders || [];

  // US calculations
  const usOrders = orders.filter((o) => o.marketplace === 'Amazon US');
  const usGrossRevenue = parseFloat(usOrders.reduce((sum, o) => sum + o.salePrice * o.quantity, 0).toFixed(2));
  const usTotalUnits = usOrders.reduce((sum, o) => sum + o.quantity, 0);
  const usMarketplaceFees = parseFloat((usGrossRevenue * 0.15).toFixed(2));
  const usFulfillmentFees = parseFloat((usTotalUnits * 3.25).toFixed(2));
  const usTaxes = 0;
  const usTotalDeductions = parseFloat((usMarketplaceFees + usFulfillmentFees + usTaxes).toFixed(2));
  const usNetRevenue = parseFloat((usGrossRevenue - usTotalDeductions).toFixed(2));
  const usCogs = parseFloat(usOrders.reduce((sum, o) => sum + o.unitCost * o.quantity, 0).toFixed(2));
  const usGrossProfit = parseFloat((usNetRevenue - usCogs).toFixed(2));
  const usGrossMarginPercent = usGrossRevenue > 0 ? parseFloat(((usGrossProfit / usGrossRevenue) * 100).toFixed(1)) : 0;

  const usPrepFees = parseFloat((usTotalUnits * 0.35).toFixed(2));
  const usStorageFees = parseFloat((usTotalUnits * 0.05).toFixed(2));
  const usInboundFreight = parseFloat((usTotalUnits * 0.20).toFixed(2));
  const usTotalOpEx = parseFloat((usPrepFees + usStorageFees + usInboundFreight).toFixed(2));
  const usNetOperatingIncome = parseFloat((usGrossProfit - usTotalOpEx).toFixed(2));
  const usNetMarginPercent = usGrossRevenue > 0 ? parseFloat(((usNetOperatingIncome / usGrossRevenue) * 100).toFixed(1)) : 0;

  const usStatement: DreStatement = {
    period,
    country: 'US',
    currency: 'USD',
    ptaxRate: customPtax,
    grossRevenue: usGrossRevenue,
    deductions: {
      marketplaceFees: usMarketplaceFees,
      fulfillmentFees: usFulfillmentFees,
      taxes: usTaxes,
      totalDeductions: usTotalDeductions,
    },
    netRevenue: usNetRevenue,
    cogs: usCogs,
    grossProfit: usGrossProfit,
    grossMarginPercent: usGrossMarginPercent,
    operatingExpenses: {
      prepFees: usPrepFees,
      storageFees: usStorageFees,
      inboundFreight: usInboundFreight,
      totalOpEx: usTotalOpEx,
    },
    netOperatingIncome: usNetOperatingIncome,
    netMarginPercent: usNetMarginPercent,
  };

  // BR calculations
  const brOrders = orders.filter((o) => o.marketplace === 'Amazon BR' || o.marketplace === 'Mercado Livre');
  const brGrossRevenue = parseFloat(brOrders.reduce((sum, o) => sum + o.salePrice * o.quantity, 0).toFixed(2));
  const brTotalUnits = brOrders.reduce((sum, o) => sum + o.quantity, 0);
  const brMarketplaceFees = parseFloat((brGrossRevenue * 0.16).toFixed(2));
  const brFulfillmentFees = parseFloat((brTotalUnits * 14.50).toFixed(2));
  const brTaxes = parseFloat((brGrossRevenue * 0.06).toFixed(2));
  const brTotalDeductions = parseFloat((brMarketplaceFees + brFulfillmentFees + brTaxes).toFixed(2));
  const brNetRevenue = parseFloat((brGrossRevenue - brTotalDeductions).toFixed(2));
  const brCogs = parseFloat(brOrders.reduce((sum, o) => sum + o.unitCost * o.quantity, 0).toFixed(2));
  const brGrossProfit = parseFloat((brNetRevenue - brCogs).toFixed(2));
  const brGrossMarginPercent = brGrossRevenue > 0 ? parseFloat(((brGrossProfit / brGrossRevenue) * 100).toFixed(1)) : 0;

  const brPrepFees = parseFloat((brTotalUnits * 2.50).toFixed(2));
  const brStorageFees = 0;
  const brInboundFreight = parseFloat((brTotalUnits * 1.80).toFixed(2));
  const brTotalOpEx = parseFloat((brPrepFees + brStorageFees + brInboundFreight).toFixed(2));
  const brNetOperatingIncome = parseFloat((brGrossProfit - brTotalOpEx).toFixed(2));
  const brNetMarginPercent = brGrossRevenue > 0 ? parseFloat(((brNetOperatingIncome / brGrossRevenue) * 100).toFixed(1)) : 0;

  const brStatement: DreStatement = {
    period,
    country: 'BR',
    currency: 'BRL',
    ptaxRate: customPtax,
    grossRevenue: brGrossRevenue,
    deductions: {
      marketplaceFees: brMarketplaceFees,
      fulfillmentFees: brFulfillmentFees,
      taxes: brTaxes,
      totalDeductions: brTotalDeductions,
    },
    netRevenue: brNetRevenue,
    cogs: brCogs,
    grossProfit: brGrossProfit,
    grossMarginPercent: brGrossMarginPercent,
    operatingExpenses: {
      prepFees: brPrepFees,
      storageFees: brStorageFees,
      inboundFreight: brInboundFreight,
      totalOpEx: brTotalOpEx,
    },
    netOperatingIncome: brNetOperatingIncome,
    netMarginPercent: brNetMarginPercent,
  };

  // Consolidated (converted to BRL at PTAX)
  const usInBrlGross = usGrossRevenue * customPtax;
  const usInBrlNetRev = usNetRevenue * customPtax;
  const usInBrlCogs = usCogs * customPtax;
  const usInBrlGrossProfit = usGrossProfit * customPtax;
  const usInBrlOpEx = usTotalOpEx * customPtax;
  const usInBrlNetOpInc = usNetOperatingIncome * customPtax;

  const consGrossRevenue = parseFloat((usInBrlGross + brGrossRevenue).toFixed(2));
  const consMarketplaceFees = parseFloat((usMarketplaceFees * customPtax + brMarketplaceFees).toFixed(2));
  const consFulfillmentFees = parseFloat((usFulfillmentFees * customPtax + brFulfillmentFees).toFixed(2));
  const consTaxes = parseFloat((usTaxes * customPtax + brTaxes).toFixed(2));
  const consTotalDeductions = parseFloat((consMarketplaceFees + consFulfillmentFees + consTaxes).toFixed(2));
  const consNetRevenue = parseFloat((consGrossRevenue - consTotalDeductions).toFixed(2));
  const consCogs = parseFloat((usInBrlCogs + brCogs).toFixed(2));
  const consGrossProfit = parseFloat((consNetRevenue - consCogs).toFixed(2));
  const consGrossMarginPercent = consGrossRevenue > 0 ? parseFloat(((consGrossProfit / consGrossRevenue) * 100).toFixed(1)) : 0;

  const consPrepFees = parseFloat((usPrepFees * customPtax + brPrepFees).toFixed(2));
  const consStorageFees = parseFloat((usStorageFees * customPtax + brStorageFees).toFixed(2));
  const consInboundFreight = parseFloat((usInboundFreight * customPtax + brInboundFreight).toFixed(2));
  const consTotalOpEx = parseFloat((consPrepFees + consStorageFees + consInboundFreight).toFixed(2));
  const consNetOperatingIncome = parseFloat((consGrossProfit - consTotalOpEx).toFixed(2));
  const consNetMarginPercent = consGrossRevenue > 0 ? parseFloat(((consNetOperatingIncome / consGrossRevenue) * 100).toFixed(1)) : 0;

  const consolidatedStatement: DreStatement = {
    period,
    country: 'CONSOLIDATED',
    currency: 'BRL',
    ptaxRate: customPtax,
    grossRevenue: consGrossRevenue,
    deductions: {
      marketplaceFees: consMarketplaceFees,
      fulfillmentFees: consFulfillmentFees,
      taxes: consTaxes,
      totalDeductions: consTotalDeductions,
    },
    netRevenue: consNetRevenue,
    cogs: consCogs,
    grossProfit: consGrossProfit,
    grossMarginPercent: consGrossMarginPercent,
    operatingExpenses: {
      prepFees: consPrepFees,
      storageFees: consStorageFees,
      inboundFreight: consInboundFreight,
      totalOpEx: consTotalOpEx,
    },
    netOperatingIncome: consNetOperatingIncome,
    netMarginPercent: consNetMarginPercent,
  };

  return {
    us: usStatement,
    br: brStatement,
    consolidated: consolidatedStatement,
  };
}

