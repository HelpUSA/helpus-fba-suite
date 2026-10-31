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

  globalPool = new Pool({
    connectionString,
    ssl:
      connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
    max: isProduction ? 10 : 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  globalPool.on('error', (err) => {
    console.error('[PostgresClient] Erro no pool de conexões:', err);
  });

  return globalPool;
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
