import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthoritativeErpState,
  transferInventory,
  batchReceiveBraspress,
  batchReceiveFba,
  recordSaleOrder,
  WAREHOUSES,
  WarehouseCode,
} from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';
import { isPostgresConfigured } from '@/lib/db/postgresClient';

export async function GET(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, false);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason }, { status: 403 });
    }

    const state = await getAuthoritativeErpState();
    const isPrivileged = auth.actorRole === 'MASTER_SUPERADMIN' || auth.actorRole === 'OPERATOR';

    // Compute warehouse summary (redacting total monetary valuation if unauthenticated)
    const warehouseSummary = Object.keys(WAREHOUSES).map((code) => {
      const whCode = code as WarehouseCode;
      const whInfo = WAREHOUSES[whCode];
      const totalUnits = state.items.reduce((sum, item) => sum + (item.balances[whCode] || 0), 0);
      const rawTotalValue = state.items.reduce((sum, item) => sum + ((item.balances[whCode] || 0) * (item.unitCost || 0)), 0);

      return {
        ...whInfo,
        totalUnits,
        totalValue: isPrivileged ? parseFloat(rawTotalValue.toFixed(2)) : null,
      };
    });

    // Sanitize item catalog: redact unitCost and confidential supplier if anonymous
    const sanitizedItems = state.items.map((item) => {
      if (isPrivileged) return item;
      const { unitCost, supplierName, ...publicFields } = item;
      return {
        ...publicFields,
        unitCost: undefined,
        supplierName: 'Confidencial (Requer Autenticação)',
      };
    });

    return NextResponse.json({
      ok: true,
      authenticated: isPrivileged,
      actorRole: auth.actorRole,
      lastUpdated: state.lastUpdated,
      items: sanitizedItems,
      warehouseSummary,
      // Operational ledger and customer orders are confidential: returned only to authenticated callers
      recentMovements: isPrivileged ? state.movements.slice(0, 20) : [],
      orders: isPrivileged ? (state.orders || []) : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao carregar estoque' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, true);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason || 'Não autorizado para mutação de estoque.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, sku, fromWarehouse, toWarehouse, quantity, notes, orderNumber, marketplace, customerCity, salePrice } = body;

    if (action === 'transfer') {
      if (!sku || !fromWarehouse || !toWarehouse || !quantity || quantity <= 0) {
        return NextResponse.json(
          { ok: false, message: 'Parâmetros de transferência incompletos ou inválidos.' },
          { status: 400 }
        );
      }

      const result = await transferInventory(sku, fromWarehouse, toWarehouse, quantity, notes);
      return NextResponse.json({
        ok: result.success,
        message: result.message,
      });
    }

    // Until both batch-receive paths use authoritative PostgreSQL transactions,
    // never allow these JSON-only mutations in serverless production.
    if (
      process.env.NODE_ENV === 'production' &&
      (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) &&
      (action === 'batch_receive_braspress' || action === 'batch_receive_fba')
    ) {
      return NextResponse.json(
        { ok: false, message: 'Recebimento em lote temporariamente indisponível: operação requer persistência transacional PostgreSQL.' },
        { status: 503 }
      );
    }

    if (action === 'batch_receive_braspress') {
      const result = await batchReceiveBraspress();
      return NextResponse.json({
        ok: result.success,
        message: result.message,
        movedCount: result.movedCount,
        totalUnits: result.totalUnits,
      });
    }

    if (action === 'batch_receive_fba') {
      const result = await batchReceiveFba();
      return NextResponse.json({
        ok: result.success,
        message: result.message,
        totalUnits: result.totalUnits,
      });
    }

    if (action === 'record_sale') {
      if (!sku || !quantity || quantity <= 0 || !marketplace) {
        return NextResponse.json(
          { ok: false, message: 'Informe SKU, quantidade válida e marketplace de venda.' },
          { status: 400 }
        );
      }

      const result = await recordSaleOrder({
        sku,
        quantity,
        marketplace,
        customerCity,
        orderNumber,
        salePrice,
      });

      return NextResponse.json({
        ok: result.success,
        message: result.message,
        order: result.order,
      });
    }

    return NextResponse.json(
      { ok: false, message: 'Ação não suportada.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao processar estoque' },
      { status: 500 }
    );
  }
}
