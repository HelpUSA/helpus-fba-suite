import { Pool, PoolClient } from 'pg';
import {
  InventoryItem,
  StockMovement,
  StoredInvoice,
  SaleOrder,
  ReturnRecord,
  WarehouseCode,
  ErpDatabaseState,
  NATIVOS_SKU_CATALOG,
  FinancialLedgerEntry,
  FxRateRecord,
  AuditedDreStatement,
  FinancialMarketplace,
  AuditedDreMetric,
  FinancialCategory,
  FinancialStatus,
} from '../erpTypes';
import { NfeData } from '../nfeParser';

let globalPool: Pool | null = null;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function getPostgresPool(): Pool {
  if (globalPool) {
    return globalPool;
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('[PostgresClient] Nenhuma variável de conexão (DATABASE_URL ou POSTGRES_URL) configurada.');
  }

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;
  if (!isLocalhost) {
    if (isProduction) {
      // In production, TLS verification is STRICT and NON-BYPASSABLE (Order 028)
      sslConfig = process.env.PG_SSL_CA
        ? { rejectUnauthorized: true, ca: process.env.PG_SSL_CA }
        : { rejectUnauthorized: true };
    } else {
      // Development / local test only
      if (process.env.PG_SSL_CA) {
        sslConfig = { rejectUnauthorized: true, ca: process.env.PG_SSL_CA };
      } else if (process.env.PG_SSL_ALLOW_INSECURE === 'true') {
        sslConfig = { rejectUnauthorized: false };
      } else {
        sslConfig = { rejectUnauthorized: true };
      }
    }
  }

  globalPool = new Pool({
    connectionString,
    ssl: sslConfig,
    max: isProduction ? 10 : 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  globalPool.on('error', (err) => {
    console.error('[PostgresClient] Erro no pool de conexões:', err);
  });

  return globalPool;
}

export async function closePostgresPool(): Promise<void> {
  if (globalPool) {
    await globalPool.end();
    globalPool = null;
  }
}

/**
 * Executes a callback within a managed PostgreSQL transaction with ACID guarantees.
 * If any query fails, ROLLBACK is issued automatically and the error is re-thrown.
 */
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Checks PostgreSQL health.
 */
export async function checkPostgresHealth(): Promise<{ ok: boolean; timestamp?: string; error?: string }> {
  if (!isPostgresConfigured()) {
    return { ok: false, error: 'DATABASE_URL_NOT_CONFIGURED' };
  }

  try {
    const pool = getPostgresPool();
    const res = await pool.query('SELECT NOW() as db_time');
    return { ok: true, timestamp: res.rows[0]?.db_time };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Falha ao conectar no PostgreSQL' };
  }
}

/**
 * Fetch full authoritative state from PostgreSQL.
 */
export async function fetchAuthoritativePostgresState(): Promise<ErpDatabaseState | null> {
  if (!isPostgresConfigured()) return null;

  const pool = getPostgresPool();

  // 1. Fetch Warehouses
  const whRes = await pool.query('SELECT code, name, country, description FROM warehouses ORDER BY code ASC');
  const warehousesList = whRes.rows;

  // 2. Fetch Products
  const prodRes = await pool.query(
    'SELECT id, sku, asin, ncm, title, marketplace, currency, unit_cost, sale_price, image_url, supplier_name, reorder_point FROM products ORDER BY sku ASC'
  );

  // 3. Fetch Balances
  const balRes = await pool.query('SELECT product_sku, warehouse_code, quantity FROM inventory_balances');
  const balancesBySku: Record<string, Record<WarehouseCode, number>> = {};
  for (const row of balRes.rows) {
    if (!balancesBySku[row.product_sku]) {
      balancesBySku[row.product_sku] = {
        'WH-USA-PREP': 0,
        'WH-USA-FBA-RYY2': 0,
        'WH-BR-TRANSIT-BRASPRESS': 0,
        'WH-BR-LOCAL-JPA': 0,
      };
    }
    balancesBySku[row.product_sku][row.warehouse_code as WarehouseCode] = Number(row.quantity);
  }

  const items: InventoryItem[] = prodRes.rows.map((p) => {
    const balances = balancesBySku[p.sku] || {
      'WH-USA-PREP': 0,
      'WH-USA-FBA-RYY2': 0,
      'WH-BR-TRANSIT-BRASPRESS': 0,
      'WH-BR-LOCAL-JPA': 0,
    };
    const totalStock = Object.values(balances).reduce((a, b) => a + b, 0);
    return {
      id: p.id,
      sku: p.sku,
      asin: p.asin || undefined,
      ncm: p.ncm || undefined,
      title: p.title,
      marketplace: p.marketplace,
      currency: p.currency,
      unitCost: parseFloat(p.unit_cost),
      salePrice: parseFloat(p.sale_price),
      imageUrl: p.image_url || '/images/placeholder.svg',
      supplierName: p.supplier_name || 'Nativos do Brasil',
      balances,
      totalStock,
      reorderPoint: p.reorder_point || 10,
    };
  });

  // 4. Fetch Stock Movements
  const movRes = await pool.query(
    'SELECT id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, unit_cost, document_ref, notes FROM stock_movements ORDER BY timestamp DESC LIMIT 100'
  );
  const movements: StockMovement[] = movRes.rows.map((m) => ({
    id: m.id,
    timestamp: m.timestamp.toISOString ? m.timestamp.toISOString() : String(m.timestamp),
    sku: m.sku,
    productTitle: m.product_title,
    type: m.movement_type,
    fromWarehouse: m.from_warehouse || undefined,
    toWarehouse: m.to_warehouse || undefined,
    quantity: Number(m.quantity),
    unitCost: m.unit_cost ? parseFloat(m.unit_cost) : undefined,
    documentRef: m.document_ref || undefined,
    notes: m.notes || undefined,
  }));

  // 5. Fetch Invoices and Items
  const invRes = await pool.query(
    'SELECT id, tipo, numero, serie, chave, data_emissao, data_importacao, fornecedor_nome, fornecedor_doc, valor_total, moeda, status, itens_count FROM invoices ORDER BY data_emissao DESC'
  );
  const itemRes = await pool.query(
    'SELECT invoice_id, sku, descricao, quantidade, valor_unitario, custo_efetivo_unitario FROM invoice_items'
  );

  const itemsByInvoice: Record<string, any[]> = {};
  for (const it of itemRes.rows) {
    if (!itemsByInvoice[it.invoice_id]) itemsByInvoice[it.invoice_id] = [];
    itemsByInvoice[it.invoice_id].push({
      sku: it.sku,
      descricao: it.descricao,
      quantidade: Number(it.quantidade),
      valorUnitario: parseFloat(it.valor_unitario),
      custoEfetivoUnitario: parseFloat(it.custo_efetivo_unitario),
    });
  }

  const invoices: StoredInvoice[] = invRes.rows.map((inv) => ({
    id: inv.id,
    tipo: inv.tipo,
    numero: inv.numero,
    serie: inv.serie || undefined,
    chave: inv.chave || undefined,
    dataEmissao: inv.data_emissao.toISOString ? inv.data_emissao.toISOString() : String(inv.data_emissao),
    dataImportacao: inv.data_importacao.toISOString ? inv.data_importacao.toISOString() : String(inv.data_importacao),
    fornecedorNome: inv.fornecedor_nome,
    fornecedorDoc: inv.fornecedor_doc,
    valorTotal: parseFloat(inv.valor_total),
    moeda: inv.moeda,
    status: inv.status,
    itensCount: Number(inv.itens_count),
    detalhesItens: itemsByInvoice[inv.id] || [],
  }));

  // 6. Fetch Orders
  const ordRes = await pool.query(
    'SELECT id, order_number, marketplace, order_date, sku, product_title, quantity, sale_price, unit_cost, gross_profit, customer_city, warehouse_source, status FROM sale_orders ORDER BY order_date DESC LIMIT 100'
  );
  const orders: SaleOrder[] = ordRes.rows.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    marketplace: o.marketplace,
    date: o.order_date.toISOString ? o.order_date.toISOString() : String(o.order_date),
    sku: o.sku,
    productTitle: o.product_title,
    quantity: Number(o.quantity),
    salePrice: parseFloat(o.sale_price),
    unitCost: parseFloat(o.unit_cost),
    grossProfit: parseFloat(o.gross_profit),
    customerCity: o.customer_city || '',
    warehouseSource: o.warehouse_source as WarehouseCode,
    status: o.status,
  }));

  // 7. Fetch Returns
  const retRes = await pool.query(
    'SELECT id, return_date, order_number, sku, product_title, quantity, reason, disposition, warehouse, status, reimbursement_amount, currency, notes FROM returns ORDER BY return_date DESC LIMIT 100'
  );
  const returns: ReturnRecord[] = retRes.rows.map((r) => ({
    id: r.id,
    returnDate: r.return_date.toISOString ? r.return_date.toISOString() : String(r.return_date),
    orderNumber: r.order_number || undefined,
    sku: r.sku,
    productTitle: r.product_title,
    quantity: Number(r.quantity),
    reason: r.reason,
    disposition: r.disposition,
    warehouse: r.warehouse as WarehouseCode,
    status: r.status,
    reimbursementAmount: r.reimbursement_amount ? parseFloat(r.reimbursement_amount) : 0,
    currency: r.currency,
    notes: r.notes || undefined,
  }));

  return {
    version: '2.0.0-POSTGRES',
    lastUpdated: new Date().toISOString(),
    items,
    movements,
    invoices,
    orders,
    returns,
    storageEngine: 'POSTGRES',
  };
}

/**
 * Persist an outbound sale order in PostgreSQL within an ACID transaction.
 */
export async function persistSaleOrderPostgres(order: SaleOrder): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Idempotency check: verify order_number
    const checkOrder = await client.query('SELECT id FROM sale_orders WHERE order_number = $1', [order.orderNumber]);
    if (checkOrder.rows.length > 0) {
      throw new Error(`Pedido ${order.orderNumber} já processado anteriormente.`);
    }

    // 2. Concurrency & Balance check: SELECT FOR UPDATE on inventory balance
    const balCheck = await client.query(
      'SELECT quantity FROM inventory_balances WHERE product_sku = $1 AND warehouse_code = $2 FOR UPDATE',
      [order.sku, order.warehouseSource]
    );

    const currentQty = balCheck.rows.length > 0 ? Number(balCheck.rows[0].quantity) : 0;
    if (currentQty < order.quantity) {
      throw new Error(
        `Saldo insuficiente no armazém ${order.warehouseSource} para o SKU ${order.sku}. Disponível: ${currentQty}, Solicitado: ${order.quantity}`
      );
    }

    // 3. Insert into sale_orders
    await client.query(
      `INSERT INTO sale_orders (id, order_number, marketplace, order_date, sku, product_title, quantity, sale_price, unit_cost, gross_profit, customer_city, warehouse_source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        order.id,
        order.orderNumber,
        order.marketplace,
        order.date,
        order.sku,
        order.productTitle,
        order.quantity,
        order.salePrice,
        order.unitCost,
        order.grossProfit,
        order.customerCity,
        order.warehouseSource,
        order.status,
      ]
    );

    // 4. Update inventory_balances
    await client.query(
      'UPDATE inventory_balances SET quantity = quantity - $1, updated_at = NOW() WHERE product_sku = $2 AND warehouse_code = $3',
      [order.quantity, order.sku, order.warehouseSource]
    );

    // 5. Insert audit trail movement
    const movId = `mov-sale-${Date.now()}`;
    await client.query(
      `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, from_warehouse, quantity, unit_cost, document_ref, notes)
       VALUES ($1, NOW(), $2, $3, 'SALE', $4, $5, $6, $7, $8)`,
      [
        movId,
        order.sku,
        order.productTitle,
        order.warehouseSource,
        order.quantity,
        order.unitCost,
        `Order ${order.orderNumber}`,
        `Venda confirmada no marketplace ${order.marketplace}.`,
      ]
    );
  });
}

/**
 * Persist an internal stock transfer in PostgreSQL within an ACID transaction.
 */
export async function persistStockTransferPostgres(params: {
  sku: string;
  fromWh: WarehouseCode;
  toWh: WarehouseCode;
  quantity: number;
  notes?: string;
}): Promise<void> {
  const { sku, fromWh, toWh, quantity, notes } = params;

  await withTransaction(async (client) => {
    // 1. Lock and check source balance
    const srcBal = await client.query(
      'SELECT quantity FROM inventory_balances WHERE product_sku = $1 AND warehouse_code = $2 FOR UPDATE',
      [sku, fromWh]
    );

    const available = srcBal.rows.length > 0 ? Number(srcBal.rows[0].quantity) : 0;
    if (available < quantity) {
      throw new Error(`Saldo insuficiente na origem ${fromWh}. Disponível: ${available}, Requisitado: ${quantity}`);
    }

    // 2. Fetch product title
    const prodRes = await client.query('SELECT title, unit_cost FROM products WHERE sku = $1', [sku]);
    const title = prodRes.rows.length > 0 ? prodRes.rows[0].title : sku;
    const unitCost = prodRes.rows.length > 0 ? parseFloat(prodRes.rows[0].unit_cost) : 0;

    // 3. Decrement source
    await client.query(
      'UPDATE inventory_balances SET quantity = quantity - $1, updated_at = NOW() WHERE product_sku = $2 AND warehouse_code = $3',
      [quantity, sku, fromWh]
    );

    // 4. Increment destination (UPSERT)
    await client.query(
      `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (product_sku, warehouse_code)
       DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
      [sku, toWh, quantity]
    );

    // 5. Insert audit movement
    const movId = `mov-trf-${Date.now()}`;
    await client.query(
      `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, unit_cost, notes)
       VALUES ($1, NOW(), $2, $3, 'TRANSFER', $4, $5, $6, $7, $8)`,
      [movId, sku, title, fromWh, toWh, quantity, unitCost, notes || `Transferência de ${fromWh} para ${toWh}.`]
    );
  });
}

/**
 * Persist an inbound NF-e in PostgreSQL within an ACID transaction.
 */
export async function persistNfeInboundPostgres(nfe: NfeData): Promise<string> {
  const invoiceId = `inv-nfe-${nfe.numeroNF}-${Date.now()}`;

  await withTransaction(async (client) => {
    // 1. Idempotency check: chave de acesso
    const checkInv = await client.query('SELECT id FROM invoices WHERE chave = $1', [nfe.chaveAcesso]);
    if (checkInv.rows.length > 0) {
      throw new Error(`A NF-e Nº ${nfe.numeroNF} (Chave: ${nfe.chaveAcesso}) já foi importada anteriormente.`);
    }

    // 2. Insert Invoice header
    await client.query(
      `INSERT INTO invoices (id, tipo, numero, serie, chave, data_emissao, data_importacao, fornecedor_nome, fornecedor_doc, valor_total, moeda, status, itens_count)
       VALUES ($1, 'NFE_BR', $2, $3, $4, $5, NOW(), $6, $7, $8, 'BRL', 'EM_TRANSITO', $9)`,
      [
        invoiceId,
        nfe.numeroNF,
        nfe.serie || '1',
        nfe.chaveAcesso,
        nfe.dataEmissao,
        nfe.emitente.razaoSocial,
        nfe.emitente.cnpj,
        nfe.totais.valorNota,
        nfe.itens.length,
      ]
    );

    // 3. Process items and balances with deterministic De-Para catalog resolution
    for (const it of nfe.itens) {
      const unitCost = it.vUnCom;

      // Deterministic catalog mapping (Finding 4 - Order 014)
      const cleanCode = it.cProd.replace(/\D/g, '').slice(-3);
      const catalogEntry = NATIVOS_SKU_CATALOG[cleanCode];
      let resolvedSku = catalogEntry ? catalogEntry.sku : `NAT-${it.cProd.replace(/[^a-zA-Z0-9-]/g, '')}`;

      if (!catalogEntry) {
        const descUpper = it.xProd.toUpperCase();
        if (descUpper.includes('RESVERATROL')) resolvedSku = 'NAT-RESV-60CAPS';
        else if (descUpper.includes('TREONATO')) resolvedSku = 'NAT-MAG-TREON-60C';
        else if (descUpper.includes('CO-Q10') || descUpper.includes('CQ10')) resolvedSku = 'NAT-COQ10-VITE-60C';
        else if (descUpper.includes('COLAGENO')) resolvedSku = 'NAT-COLAG-VITC-60C';
        else if (descUpper.includes('6 MAGNESIOS')) resolvedSku = 'NAT-6MAG-60C';
        else if (descUpper.includes('ACETILCISTEINA') || descUpper.includes('NAC')) resolvedSku = 'NAT-NAC-60C';
      }

      // Ensure product exists in products table to maintain FK integrity
      await client.query(
        `INSERT INTO products (sku, title, marketplace, currency, unit_cost, sale_price, supplier_name)
         VALUES ($1, $2, 'Amazon BR', 'BRL', $3, $4, $5)
         ON CONFLICT (sku) DO UPDATE SET unit_cost = EXCLUDED.unit_cost, updated_at = NOW()`,
        [
          resolvedSku,
          catalogEntry?.title || it.xProd,
          unitCost,
          catalogEntry?.defaultSalePrice || parseFloat((unitCost * 2.5).toFixed(2)),
          nfe.emitente.razaoSocial,
        ]
      );

      // Insert invoice item with resolved SKU
      await client.query(
        `INSERT INTO invoice_items (invoice_id, sku, descricao, quantidade, valor_unitario, custo_efetivo_unitario)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoiceId, resolvedSku, it.xProd, it.qCom, it.vUnCom, unitCost]
      );

      // Increment inventory balance in WH-BR-TRANSIT-BRASPRESS using resolved SKU
      await client.query(
        `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
         VALUES ($1, 'WH-BR-TRANSIT-BRASPRESS', $2, NOW())
         ON CONFLICT (product_sku, warehouse_code)
         DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [resolvedSku, it.qCom]
      );

      // Insert stock movement with resolved SKU
      const movId = `mov-nfe-${Date.now()}-${resolvedSku}`;
      await client.query(
        `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, to_warehouse, quantity, unit_cost, document_ref, notes)
         VALUES ($1, NOW(), $2, $3, 'INBOUND_NFE', 'WH-BR-TRANSIT-BRASPRESS', $4, $5, $6, $7)`,
        [
          movId,
          resolvedSku,
          catalogEntry?.title || it.xProd,
          it.qCom,
          unitCost,
          `NF-e ${nfe.numeroNF}`,
          `Entrada fiscal NF-e ${nfe.numeroNF} de ${nfe.emitente.razaoSocial} (cProd: ${it.cProd} -> SKU: ${resolvedSku}).`,
        ]
      );
    }
  });

  return invoiceId;
}

/**
 * Persist a return / damage record in PostgreSQL within an ACID transaction.
 */
export async function persistReturnPostgres(record: ReturnRecord): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Insert into returns table
    await client.query(
      `INSERT INTO returns (id, return_date, order_number, sku, product_title, quantity, reason, disposition, warehouse, status, reimbursement_amount, currency, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        record.id,
        record.returnDate,
        record.orderNumber || null,
        record.sku,
        record.productTitle,
        record.quantity,
        record.reason,
        record.disposition,
        record.warehouse,
        record.status,
        record.reimbursementAmount || 0,
        record.currency,
        record.notes || null,
      ]
    );

    // 2. If status is RESTOCKED, increment inventory balance
    if (record.status === 'RESTOCKED') {
      await client.query(
        `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (product_sku, warehouse_code)
         DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [record.sku, record.warehouse, record.quantity]
      );

      const movId = `mov-ret-${Date.now()}`;
      await client.query(
        `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, to_warehouse, quantity, document_ref, notes)
         VALUES ($1, NOW(), $2, $3, 'ADJUSTMENT', $4, $5, $6, $7)`,
        [
          movId,
          record.sku,
          record.productTitle,
          record.warehouse,
          record.quantity,
          `Return ${record.id}`,
          `Estoque reposto por devolução inspecionada (${record.reason}).`,
        ]
      );
    }
  });
}

/**
 * Persist bulk Braspress freight transfer to JPA Base in PostgreSQL within an ACID transaction.
 */
export async function persistBatchReceiveBraspressPostgres(): Promise<{ movedCount: number; totalUnits: number }> {
  return await withTransaction(async (client) => {
    // 1. Lock rows in WH-BR-TRANSIT-BRASPRESS FOR UPDATE
    const rowsRes = await client.query(
      `SELECT b.product_sku, b.quantity, p.title, p.unit_cost
       FROM inventory_balances b
       JOIN products p ON p.sku = b.product_sku
       WHERE b.warehouse_code = 'WH-BR-TRANSIT-BRASPRESS' AND b.quantity > 0
       FOR UPDATE`
    );

    let movedCount = 0;
    let totalUnits = 0;

    for (const row of rowsRes.rows) {
      const sku = row.product_sku;
      const qty = Number(row.quantity);
      const title = row.title;
      const unitCost = parseFloat(row.unit_cost);

      if (qty <= 0) continue;

      // Decrement source transit
      await client.query(
        `UPDATE inventory_balances SET quantity = quantity - $1, updated_at = NOW()
         WHERE product_sku = $2 AND warehouse_code = 'WH-BR-TRANSIT-BRASPRESS'`,
        [qty, sku]
      );

      // Increment destination JPA Base (UPSERT)
      await client.query(
        `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
         VALUES ($1, 'WH-BR-LOCAL-JPA', $2, NOW())
         ON CONFLICT (product_sku, warehouse_code)
         DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [sku, qty]
      );

      // Insert stock movement
      const movId = `mov-batch-br-${Date.now()}-${sku}`;
      await client.query(
        `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, unit_cost, notes)
         VALUES ($1, NOW(), $2, $3, 'TRANSFER', 'WH-BR-TRANSIT-BRASPRESS', 'WH-BR-LOCAL-JPA', $4, $5, $6)`,
        [movId, sku, title, qty, unitCost, 'Recebimento e conferência física em lote da carga Braspress no CD HelpUS Bessa (JPA).']
      );

      movedCount++;
      totalUnits += qty;
    }

    return { movedCount, totalUnits };
  });
}

/**
 * Persist bulk Prep Ninjas transfer to Amazon FBA RYY2 in PostgreSQL within an ACID transaction.
 */
export async function persistBatchReceiveFbaPostgres(): Promise<{ totalUnits: number }> {
  return await withTransaction(async (client) => {
    // 1. Lock rows in WH-USA-PREP FOR UPDATE
    const rowsRes = await client.query(
      `SELECT b.product_sku, b.quantity, p.title, p.unit_cost
       FROM inventory_balances b
       JOIN products p ON p.sku = b.product_sku
       WHERE b.warehouse_code = 'WH-USA-PREP' AND b.quantity > 0
       FOR UPDATE`
    );

    let totalUnits = 0;

    for (const row of rowsRes.rows) {
      const sku = row.product_sku;
      const qty = Number(row.quantity);
      const title = row.title;
      const unitCost = parseFloat(row.unit_cost);

      if (qty <= 0) continue;

      // Decrement source WH-USA-PREP
      await client.query(
        `UPDATE inventory_balances SET quantity = quantity - $1, updated_at = NOW()
         WHERE product_sku = $2 AND warehouse_code = 'WH-USA-PREP'`,
        [qty, sku]
      );

      // Increment destination WH-USA-FBA-RYY2
      await client.query(
        `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
         VALUES ($1, 'WH-USA-FBA-RYY2', $2, NOW())
         ON CONFLICT (product_sku, warehouse_code)
         DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [sku, qty]
      );

      // Insert stock movement
      const movId = `mov-batch-fba-${Date.now()}-${sku}`;
      await client.query(
        `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, unit_cost, notes)
         VALUES ($1, NOW(), $2, $3, 'TRANSFER', 'WH-USA-PREP', 'WH-USA-FBA-RYY2', $4, $5, $6)`,
        [movId, sku, title, qty, unitCost, 'Transferência e recepção física em lote de Prep Ninjas para o centro FBA RYY2 (White, GA).']
      );

      totalUnits += qty;
    }

    return { totalUnits };
  });
}

/**
 * Persist a US Commercial Invoice in PostgreSQL within an ACID transaction (Order 016 - Finding 3).
 */
export async function persistUsCommercialInvoicePostgres(data: {
  invoiceNumber: string;
  vendorName: string;
  vendorDoc?: string;
  items: Array<{ sku: string; title: string; quantity: number; unitPrice: number }>;
  shippingCost?: number;
  prepCost?: number;
  date?: string;
}): Promise<string> {
  const invoiceId = `inv-us-${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
  const totalItemsVal = data.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const totalInvoice = totalItemsVal + (data.shippingCost || 0) + (data.prepCost || 0);

  await withTransaction(async (client) => {
    // 1. Idempotency check: numero and tipo = 'INVOICE_US'
    const checkInv = await client.query(
      `SELECT id FROM invoices WHERE numero = $1 AND tipo = 'INVOICE_US'`,
      [data.invoiceNumber]
    );
    if (checkInv.rows.length > 0) {
      throw new Error(`Commercial Invoice US Nº ${data.invoiceNumber} já foi registrada anteriormente.`);
    }

    // 2. Insert Invoice header
    await client.query(
      `INSERT INTO invoices (id, tipo, numero, data_emissao, data_importacao, fornecedor_nome, fornecedor_doc, valor_total, moeda, status, itens_count)
       VALUES ($1, 'INVOICE_US', $2, $3, NOW(), $4, $5, $6, 'USD', 'EM_TRANSITO', $7)`,
      [
        invoiceId,
        data.invoiceNumber,
        data.date || new Date().toISOString(),
        data.vendorName,
        data.vendorDoc || 'US-CORP-VALID',
        parseFloat(totalInvoice.toFixed(2)),
        data.items.length,
      ]
    );

    // 3. Process items and balances in WH-USA-PREP
    for (const it of data.items) {
      const itemTotal = it.quantity * it.unitPrice;
      const share = totalItemsVal > 0 ? itemTotal / totalItemsVal : 1;
      const itemExtra = ((data.shippingCost || 0) + (data.prepCost || 0)) * share;
      const effectiveCost = parseFloat(((itemTotal + itemExtra) / it.quantity).toFixed(2));

      // Ensure product exists
      await client.query(
        `INSERT INTO products (sku, title, marketplace, currency, unit_cost, sale_price, supplier_name)
         VALUES ($1, $2, 'Amazon US', 'USD', $3, $4, $5)
         ON CONFLICT (sku) DO UPDATE SET unit_cost = EXCLUDED.unit_cost, updated_at = NOW()`,
        [
          it.sku,
          it.title,
          effectiveCost,
          parseFloat((effectiveCost * 3.5).toFixed(2)),
          data.vendorName,
        ]
      );

      // Insert invoice item
      await client.query(
        `INSERT INTO invoice_items (invoice_id, sku, descricao, quantidade, valor_unitario, custo_efetivo_unitario)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoiceId, it.sku, it.title, it.quantity, it.unitPrice, effectiveCost]
      );

      // Increment inventory balance in WH-USA-PREP
      await client.query(
        `INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
         VALUES ($1, 'WH-USA-PREP', $2, NOW())
         ON CONFLICT (product_sku, warehouse_code)
         DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [it.sku, it.quantity]
      );

      // Log movement INBOUND_IMPORT
      const movId = `mov-inv-us-${Date.now()}-${it.sku.toLowerCase()}`;
      await client.query(
        `INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, to_warehouse, quantity, unit_cost, document_ref, notes)
         VALUES ($1, NOW(), $2, $3, 'INBOUND_IMPORT', 'WH-USA-PREP', $4, $5, $6, $7)`,
        [
          movId,
          it.sku,
          it.title,
          it.quantity,
          effectiveCost,
          `Invoice ${data.invoiceNumber}`,
          `Entrada internacional faturada por ${data.vendorName} recebida no hub 3PL Prep Ninjas.`,
        ]
      );
    }
  });

  return invoiceId;
}


// ============================================================================
// Phase P1: Authoritative Financial Ledger & DRE Engine (Order 045)
// ============================================================================

function mapLedgerRowToEntry(row: any): FinancialLedgerEntry {
  return {
    id: row.id,
    entryNumber: row.entry_number,
    idempotencyKey: row.idempotency_key,
    sourceEventType: row.source_event_type,
    sourceId: row.source_id,
    marketplace: row.marketplace,
    competenceDate: row.competence_date instanceof Date ? row.competence_date.toISOString().split('T')[0] : String(row.competence_date),
    currency: row.currency,
    amountOriginal: Number(row.amount_original),
    entryDirection: row.entry_direction,
    amountBrl: Number(row.amount_brl),
    fxRate: Number(row.fx_rate),
    fxSource: row.fx_source,
    category: row.category,
    status: row.status,
    reversalOfId: row.reversal_of_id || undefined,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    createdAt: row.created_at,
    createdBy: row.created_by,
    environment: row.environment,
  };
}

export async function recordFxRate(
  fx: FxRateRecord,
  client?: PoolClient
): Promise<FxRateRecord> {
  const runner = async (c: PoolClient) => {
    const res = await c.query(
      `INSERT INTO fx_rates (rate_date, currency_from, currency_to, rate, source, is_fallback)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (rate_date, currency_from, currency_to)
       DO UPDATE SET rate = EXCLUDED.rate, source = EXCLUDED.source, is_fallback = EXCLUDED.is_fallback
       RETURNING id, rate_date, currency_from, currency_to, rate, source, is_fallback, created_at;`,
      [fx.rateDate, fx.currencyFrom, fx.currencyTo, fx.rate, fx.source, fx.isFallback]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      rateDate: row.rate_date instanceof Date ? row.rate_date.toISOString().split('T')[0] : String(row.rate_date),
      currencyFrom: row.currency_from,
      currencyTo: row.currency_to,
      rate: Number(row.rate),
      source: row.source,
      isFallback: row.is_fallback,
      createdAt: row.created_at,
    };
  };

  if (client) return runner(client);
  return withTransaction(runner);
}

export async function getFxRate(date: string, fromCurr: string, toCurr: string, client?: Pool | PoolClient): Promise<{ rate: number; source: string; isFallback: boolean }> {
  if (fromCurr === toCurr) {
    return { rate: 1.0, source: 'PARITY', isFallback: false };
  }

  const pool = client || getPostgresPool();
  // 1. Exact match on date
  const exactRes = await pool.query(
    `SELECT rate, source, is_fallback FROM fx_rates
     WHERE rate_date = $1 AND currency_from = $2 AND currency_to = $3;`,
    [date, fromCurr, toCurr]
  );
  if (exactRes.rows.length > 0) {
    return {
      rate: Number(exactRes.rows[0].rate),
      source: exactRes.rows[0].source,
      isFallback: exactRes.rows[0].is_fallback,
    };
  }

  // 2. Nearest previous date within historical records
  const nearestRes = await pool.query(
    `SELECT rate, source FROM fx_rates
     WHERE rate_date <= $1 AND currency_from = $2 AND currency_to = $3
     ORDER BY rate_date DESC LIMIT 1;`,
    [date, fromCurr, toCurr]
  );
  if (nearestRes.rows.length > 0) {
    return {
      rate: Number(nearestRes.rows[0].rate),
      source: `${nearestRes.rows[0].source}_PRIOR_CLOSE`,
      isFallback: true,
    };
  }

  // 3. Fallback policy (e.g. 5.50 for USD -> BRL)
  const defaultFallbackRate = fromCurr === 'USD' && toCurr === 'BRL' ? 5.50 : 1.0;
  return {
    rate: defaultFallbackRate,
    source: 'CONSERVATIVE_FALLBACK_POLICY',
    isFallback: true,
  };
}

export async function recordFinancialLedgerEntry(
  entry: FinancialLedgerEntry,
  client?: PoolClient
): Promise<FinancialLedgerEntry> {
  const runner = async (c: PoolClient) => {
    // 1. Idempotency Check
    const checkRes = await c.query(
      `SELECT * FROM financial_ledger WHERE idempotency_key = $1;`,
      [entry.idempotencyKey]
    );
    if (checkRes.rows.length > 0) {
      return mapLedgerRowToEntry(checkRes.rows[0]);
    }

    // 2. Compute BRL and FX if not explicitly passed
    let fxRate = entry.fxRate;
    let fxSource = entry.fxSource;
    if (entry.currency === 'USD') {
      if (!fxRate || fxRate <= 0) {
        const fxInfo = await getFxRate(entry.competenceDate, 'USD', 'BRL', c);
        fxRate = fxInfo.rate;
        fxSource = fxInfo.source;
      }
    } else {
      fxRate = 1.0;
      fxSource = 'PARITY_BRL';
    }

    const amountBrl = entry.currency === 'USD'
      ? parseFloat((entry.amountOriginal * fxRate).toFixed(2))
      : entry.amountOriginal;

    // 3. Insert into financial_ledger
    const insertRes = await c.query(
      `INSERT INTO financial_ledger (
        entry_number, idempotency_key, source_event_type, source_id,
        marketplace, competence_date, currency, amount_original,
        entry_direction, amount_brl, fx_rate, fx_source, category,
        status, reversal_of_id, metadata, created_by, environment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;`,
      [
        entry.entryNumber,
        entry.idempotencyKey,
        entry.sourceEventType,
        entry.sourceId,
        entry.marketplace,
        entry.competenceDate,
        entry.currency,
        entry.amountOriginal,
        entry.entryDirection,
        amountBrl,
        fxRate,
        fxSource,
        entry.category,
        entry.status,
        entry.reversalOfId || null,
        JSON.stringify(entry.metadata || {}),
        entry.createdBy || 'SYSTEM',
        entry.environment || 'staging',
      ]
    );

    return mapLedgerRowToEntry(insertRes.rows[0]);
  };

  if (client) return runner(client);
  return withTransaction(runner);
}

export async function recordCompensatoryReversal(
  targetEntryNumberOrId: string,
  reason: string,
  createdBy = 'SUPERADMIN_AUDITOR',
  client?: PoolClient
): Promise<FinancialLedgerEntry> {
  const runner = async (c: PoolClient) => {
    const findRes = await c.query(
      `SELECT * FROM financial_ledger WHERE id::text = $1 OR entry_number = $1;`,
      [targetEntryNumberOrId]
    );
    if (findRes.rows.length === 0) {
      throw new Error(`Ledger entry ${targetEntryNumberOrId} not found for compensatory reversal.`);
    }
    const orig = findRes.rows[0];

    const reversedDirection = orig.entry_direction === 'CREDIT' ? 'DEBIT' : 'CREDIT';
    const reversalNumber = `REV-${orig.entry_number}-${Date.now().toString().slice(-6)}`;
    const idempotencyKey = `idemp-rev-${orig.idempotency_key}`;

    const reversalEntry: FinancialLedgerEntry = {
      entryNumber: reversalNumber,
      idempotencyKey,
      sourceEventType: 'COMPENSATION_REVERSAL',
      sourceId: orig.source_id,
      marketplace: orig.marketplace,
      competenceDate: new Date().toISOString().split('T')[0],
      currency: orig.currency,
      amountOriginal: Number(orig.amount_original),
      entryDirection: reversedDirection,
      amountBrl: Number(orig.amount_brl),
      fxRate: Number(orig.fx_rate),
      fxSource: orig.fx_source,
      category: 'ESTORNO',
      status: 'REALIZADO',
      reversalOfId: orig.id,
      metadata: {
        reason,
        originalEntryNumber: orig.entry_number,
        reversedAt: new Date().toISOString(),
      },
      createdBy,
      environment: orig.environment,
    };

    return recordFinancialLedgerEntry(reversalEntry, c);
  };

  if (client) return runner(client);
  return withTransaction(runner);
}

/**
 * Synchronizes confirmed sale orders and invoices from PostgreSQL tables into the financial ledger.
 * This is 100% idempotent through unique idempotency keys.
 */
export async function syncPostgresOrdersToFinancialLedger(client?: PoolClient): Promise<{
  ordersPosted: number;
  invoicesPosted: number;
}> {
  const runner = async (c: PoolClient) => {
    let ordersPosted = 0;
    let invoicesPosted = 0;

    // 1. Process Sale Orders
    const ordersRes = await c.query(`SELECT * FROM sale_orders ORDER BY order_date ASC;`);
    for (const order of ordersRes.rows) {
      const orderDate = order.order_date instanceof Date ? order.order_date.toISOString().split('T')[0] : String(order.order_date).split('T')[0];
      const isUs = order.marketplace === 'Amazon US';
      const currency = isUs ? 'USD' : 'BRL';
      const saleTotal = Number((order.sale_price * order.quantity).toFixed(2));
      const cogsTotal = Number((order.unit_cost * order.quantity).toFixed(2));

      // 1.1 Gross Revenue (REALIZADO)
      await recordFinancialLedgerEntry({
        entryNumber: `LEDGER-REV-${order.order_number}`,
        idempotencyKey: `idemp-sale-rev-${order.order_number}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: order.order_number,
        marketplace: order.marketplace,
        competenceDate: orderDate,
        currency,
        amountOriginal: saleTotal,
        entryDirection: 'CREDIT',
        amountBrl: 0, // auto computed
        fxRate: 0,
        fxSource: '',
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: order.sku, quantity: order.quantity, unitPrice: order.sale_price },
        environment: order.environment || 'staging',
      }, c);

      // 1.2 COGS / CMV (REALIZADO)
      await recordFinancialLedgerEntry({
        entryNumber: `LEDGER-CMV-${order.order_number}`,
        idempotencyKey: `idemp-sale-cmv-${order.order_number}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: order.order_number,
        marketplace: order.marketplace,
        competenceDate: orderDate,
        currency,
        amountOriginal: cogsTotal,
        entryDirection: 'DEBIT',
        amountBrl: 0,
        fxRate: 0,
        fxSource: '',
        category: 'CMV',
        status: 'REALIZADO',
        metadata: { sku: order.sku, quantity: order.quantity, unitCost: order.unit_cost },
        environment: order.environment || 'staging',
      }, c);

      // 1.3 Marketplace Fee (ESTIMADO until settlement report import)
      const mktRate = isUs ? 0.15 : 0.16;
      const mktFee = Number((saleTotal * mktRate).toFixed(2));
      await recordFinancialLedgerEntry({
        entryNumber: `LEDGER-MKTFEE-${order.order_number}`,
        idempotencyKey: `idemp-sale-mktfee-${order.order_number}`,
        sourceEventType: 'MARKETPLACE_FEE',
        sourceId: order.order_number,
        marketplace: order.marketplace,
        competenceDate: orderDate,
        currency,
        amountOriginal: mktFee,
        entryDirection: 'DEBIT',
        amountBrl: 0,
        fxRate: 0,
        fxSource: '',
        category: 'TAXA_MARKETPLACE',
        status: 'ESTIMADO',
        metadata: { feeRate: mktRate, estimated: true },
        environment: order.environment || 'staging',
      }, c);

      // 1.4 Fulfillment Fee (ESTIMADO)
      if (isUs) {
        const fbaFee = Number((order.quantity * 3.25).toFixed(2));
        await recordFinancialLedgerEntry({
          entryNumber: `LEDGER-FBA-${order.order_number}`,
          idempotencyKey: `idemp-sale-fba-${order.order_number}`,
          sourceEventType: 'FULFILLMENT_FBA',
          sourceId: order.order_number,
          marketplace: order.marketplace,
          competenceDate: orderDate,
          currency: 'USD',
          amountOriginal: fbaFee,
          entryDirection: 'DEBIT',
          amountBrl: 0,
          fxRate: 0,
          fxSource: '',
          category: 'FULFILLMENT_FBA',
          status: 'ESTIMADO',
          metadata: { perUnitFee: 3.25, quantity: order.quantity },
          environment: order.environment || 'staging',
        }, c);

        // Prep Ninjas 3PL Fee ($0.35/unit)
        const prepFee = Number((order.quantity * 0.35).toFixed(2));
        await recordFinancialLedgerEntry({
          entryNumber: `LEDGER-PREP-${order.order_number}`,
          idempotencyKey: `idemp-sale-prep-${order.order_number}`,
          sourceEventType: 'PREP_SERVICE',
          sourceId: order.order_number,
          marketplace: order.marketplace,
          competenceDate: orderDate,
          currency: 'USD',
          amountOriginal: prepFee,
          entryDirection: 'DEBIT',
          amountBrl: 0,
          fxRate: 0,
          fxSource: '',
          category: 'PREP',
          status: 'ESTIMADO',
          metadata: { perUnitFee: 0.35, quantity: order.quantity },
          environment: order.environment || 'staging',
        }, c);
      } else {
        // Brazil Tax Simples Nacional DAS (6% ESTIMADO)
        const taxSimples = Number((saleTotal * 0.06).toFixed(2));
        await recordFinancialLedgerEntry({
          entryNumber: `LEDGER-TAXDAS-${order.order_number}`,
          idempotencyKey: `idemp-sale-taxdas-${order.order_number}`,
          sourceEventType: 'TAX_SIMPLES',
          sourceId: order.order_number,
          marketplace: order.marketplace,
          competenceDate: orderDate,
          currency: 'BRL',
          amountOriginal: taxSimples,
          entryDirection: 'DEBIT',
          amountBrl: taxSimples,
          fxRate: 1.0,
          fxSource: 'PARITY_BRL',
          category: 'IMPOSTO_DAS',
          status: 'ESTIMADO',
          metadata: { estimatedRate: 0.06 },
          environment: order.environment || 'staging',
        }, c);
      }

      ordersPosted++;
    }

    return { ordersPosted, invoicesPosted };
  };

  if (client) return runner(client);
  return withTransaction(runner);
}

function emptyMetric(): AuditedDreMetric {
  return { realizado: 0, estimado: 0, projetado: 0, total: 0 };
}

function roundVal(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function addMetric(metric: AuditedDreMetric, amount: number, status: FinancialStatus, isNegative = false) {
  const signed = isNegative ? -amount : amount;
  if (status === 'REALIZADO') metric.realizado = roundVal(metric.realizado + signed);
  else if (status === 'ESTIMADO') metric.estimado = roundVal(metric.estimado + signed);
  else if (status === 'PROJETADO') metric.projetado = roundVal(metric.projetado + signed);
  metric.total = roundVal(metric.total + signed);
}

function subtractMetric(a: AuditedDreMetric, b: AuditedDreMetric): AuditedDreMetric {
  return {
    realizado: roundVal(a.realizado - b.realizado),
    estimado: roundVal(a.estimado - b.estimado),
    projetado: roundVal(a.projetado - b.projetado),
    total: roundVal(a.total - b.total),
  };
}

function sumMetrics(list: AuditedDreMetric[]): AuditedDreMetric {
  const res = emptyMetric();
  for (const m of list) {
    res.realizado = roundVal(res.realizado + m.realizado);
    res.estimado = roundVal(res.estimado + m.estimado);
    res.projetado = roundVal(res.projetado + m.projetado);
    res.total = roundVal(res.total + m.total);
  }
  return res;
}

/**
 * Authoritative PostgreSQL DRE Engine (Order 045 Phase P1).
 * Computes audit-proof DRE by period and marketplace from PostgreSQL financial_ledger.
 * Strictly segregates REALIZADO from ESTIMADO/PROJETADO metrics.
 */
export async function calculateAuditedDre(
  period = 'ALL',
  customPtax?: number,
  client?: PoolClient
): Promise<{
  us: AuditedDreStatement;
  br: AuditedDreStatement;
  consolidated: AuditedDreStatement;
}> {
  const pool = client || getPostgresPool();

  // 1. Fetch ledger entries matching period filter
  let periodQuery = '';
  const queryParams: any[] = [];
  if (period && period !== 'ALL') {
    queryParams.push(period + '%');
    periodQuery = `WHERE competence_date::text LIKE $1`;
  }

  const sql = `
    SELECT
      id, entry_number, source_event_type, source_id,
      marketplace, competence_date, currency,
      amount_original, entry_direction, amount_brl,
      fx_rate, fx_source, category, status,
      reversal_of_id, created_at
    FROM financial_ledger
    ${periodQuery}
    ORDER BY competence_date ASC, created_at ASC;
  `;

  const rowsRes = await pool.query(sql, queryParams);
  const rows = rowsRes.rows;

  // Build raw metric accumulators per target statement
  const initStatementMetrics = () => ({
    grossRevenue: emptyMetric(),
    marketplaceFees: emptyMetric(),
    fulfillmentFees: emptyMetric(),
    taxes: emptyMetric(),
    reimbursements: emptyMetric(),
    reversals: emptyMetric(),
    cogs: emptyMetric(),
    prepFees: emptyMetric(),
    storageFees: emptyMetric(),
    inboundFreight: emptyMetric(),
    otherExpenses: emptyMetric(),
    totalEntries: 0,
    realizadoEntries: 0,
    estimadoEntries: 0,
    lastDate: undefined as string | undefined,
  });

  const usData = initStatementMetrics();
  const brData = initStatementMetrics();
  const consData = initStatementMetrics();

  // Get active FX rate for period
  const todayStr = new Date().toISOString().split('T')[0];
  const activeFx = customPtax
    ? { rate: customPtax, source: 'SIMULATED_CUSTOM_PTAX', isFallback: false }
    : await getFxRate(period && period !== 'ALL' ? `${period}-15` : todayStr, 'USD', 'BRL', pool);

  for (const r of rows) {
    const isUs = r.marketplace === 'Amazon US';
    const amountOrig = Number(r.amount_original);
    let amountBrl = Number(r.amount_brl);
    if (customPtax && isUs) {
      amountBrl = roundVal(amountOrig * customPtax);
    }
    const cat: FinancialCategory = r.category;
    const status: FinancialStatus = r.status;
    const isCredit = r.entry_direction === 'CREDIT';

    // Helper to bucket into statement metrics
    const processEntry = (target: ReturnType<typeof initStatementMetrics>, amount: number) => {
      target.totalEntries++;
      if (status === 'REALIZADO') target.realizadoEntries++;
      else if (status === 'ESTIMADO') target.estimadoEntries++;

      const dateStr = r.competence_date instanceof Date ? r.competence_date.toISOString().split('T')[0] : String(r.competence_date);
      if (!target.lastDate || dateStr > target.lastDate) target.lastDate = dateStr;

      switch (cat) {
        case 'RECEITA_BRUTA':
          addMetric(target.grossRevenue, amount, status, !isCredit);
          break;
        case 'TAXA_MARKETPLACE':
          addMetric(target.marketplaceFees, amount, status, !isCredit ? false : true);
          break;
        case 'FULFILLMENT_FBA':
          addMetric(target.fulfillmentFees, amount, status, !isCredit ? false : true);
          break;
        case 'IMPOSTO_DAS':
          addMetric(target.taxes, amount, status, !isCredit ? false : true);
          break;
        case 'REEMBOLSO':
          addMetric(target.reimbursements, amount, status, false);
          break;
        case 'ESTORNO':
          addMetric(target.reversals, amount, status, false);
          break;
        case 'CMV':
          addMetric(target.cogs, amount, status, !isCredit ? false : true);
          break;
        case 'PREP':
          addMetric(target.prepFees, amount, status, !isCredit ? false : true);
          break;
        case 'ARMAZENAGEM':
          addMetric(target.storageFees, amount, status, !isCredit ? false : true);
          break;
        case 'FRETE':
          addMetric(target.inboundFreight, amount, status, !isCredit ? false : true);
          break;
        default:
          addMetric(target.otherExpenses, amount, status, !isCredit ? false : true);
          break;
      }
    };

    if (isUs) {
      processEntry(usData, amountOrig);
    } else {
      processEntry(brData, amountOrig);
    }
    processEntry(consData, amountBrl);
  }

  // Finalize Statement calculation
  const buildStatement = (
    m: ReturnType<typeof initStatementMetrics>,
    mkt: FinancialMarketplace,
    curr: 'USD' | 'BRL'
  ): AuditedDreStatement => {
    const totalDeductions = sumMetrics([
      m.marketplaceFees,
      m.fulfillmentFees,
      m.taxes,
      m.reversals,
    ]);
    // Deduct reimbursements from deductions
    totalDeductions.realizado = roundVal(totalDeductions.realizado - m.reimbursements.realizado);
    totalDeductions.estimado = roundVal(totalDeductions.estimado - m.reimbursements.estimado);
    totalDeductions.projetado = roundVal(totalDeductions.projetado - m.reimbursements.projetado);
    totalDeductions.total = roundVal(totalDeductions.total - m.reimbursements.total);

    const netRevenue = subtractMetric(m.grossRevenue, totalDeductions);
    const grossProfit = subtractMetric(netRevenue, m.cogs);

    const totalOpEx = sumMetrics([
      m.prepFees,
      m.storageFees,
      m.inboundFreight,
      m.otherExpenses,
    ]);

    const netOperatingIncome = subtractMetric(grossProfit, totalOpEx);

    const grossMarginPercent = m.grossRevenue.total > 0
      ? roundVal((grossProfit.total / m.grossRevenue.total) * 100)
      : 0;
    const netMarginPercent = m.grossRevenue.total > 0
      ? roundVal((netOperatingIncome.total / m.grossRevenue.total) * 100)
      : 0;

    return {
      period,
      marketplace: mkt,
      currency: curr,
      fxRateApplied: activeFx.rate,
      fxSource: activeFx.source,
      isFxFallback: activeFx.isFallback,
      grossRevenue: m.grossRevenue,
      deductions: {
        marketplaceFees: m.marketplaceFees,
        fulfillmentFees: m.fulfillmentFees,
        taxes: m.taxes,
        reimbursements: m.reimbursements,
        reversals: m.reversals,
        totalDeductions,
      },
      netRevenue,
      cogs: m.cogs,
      grossProfit,
      grossMarginPercent,
      operatingExpenses: {
        prepFees: m.prepFees,
        storageFees: m.storageFees,
        inboundFreight: m.inboundFreight,
        otherExpenses: m.otherExpenses,
        totalOpEx,
      },
      netOperatingIncome,
      netMarginPercent,
      auditSummary: {
        totalEntries: m.totalEntries,
        realizadoEntries: m.realizadoEntries,
        estimadoEntries: m.estimadoEntries,
        lastCompetenceDate: m.lastDate,
      },
    };
  };

  return {
    us: buildStatement(usData, 'Amazon US', 'USD'),
    br: buildStatement(brData, 'Amazon BR', 'BRL'),
    consolidated: buildStatement(consData, 'CONSOLIDATED', 'BRL'),
  };
}
