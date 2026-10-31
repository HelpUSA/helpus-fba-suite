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

export async function GET(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, false);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason }, { status: 403 });
    }

    const state = await getAuthoritativeErpState();

    // Compute warehouse summary
    const warehouseSummary = Object.keys(WAREHOUSES).map((code) => {
      const whCode = code as WarehouseCode;
      const whInfo = WAREHOUSES[whCode];
      const totalUnits = state.items.reduce((sum, item) => sum + (item.balances[whCode] || 0), 0);
      const totalValue = state.items.reduce((sum, item) => sum + ((item.balances[whCode] || 0) * item.unitCost), 0);

      return {
        ...whInfo,
        totalUnits,
        totalValue: parseFloat(totalValue.toFixed(2)),
      };
    });

    return NextResponse.json({
      ok: true,
      lastUpdated: state.lastUpdated,
      items: state.items,
      warehouseSummary,
      recentMovements: state.movements.slice(0, 20),
      orders: state.orders || [],
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
