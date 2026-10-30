import { NextRequest, NextResponse } from 'next/server';
import { getErpState, transferInventory, WAREHOUSES, WarehouseCode } from '@/lib/erpStore';

export async function GET() {
  try {
    const state = getErpState();

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
      recentMovements: state.movements.slice(0, 15),
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
    const body = await req.json();
    const { action, sku, fromWarehouse, toWarehouse, quantity, notes } = body;

    if (action === 'transfer') {
      if (!sku || !fromWarehouse || !toWarehouse || !quantity || quantity <= 0) {
        return NextResponse.json(
          { ok: false, message: 'Parâmetros de transferência incompletos ou inválidos.' },
          { status: 400 }
        );
      }

      const result = transferInventory(sku, fromWarehouse, toWarehouse, quantity, notes);
      return NextResponse.json({
        ok: result.success,
        message: result.message,
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
