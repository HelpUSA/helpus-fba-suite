import { NextRequest, NextResponse } from 'next/server';
import { getErpState, recordSaleOrder } from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';

export async function GET(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, false);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason }, { status: 403 });
    }

    const state = getErpState();
    return NextResponse.json({
      ok: true,
      orders: state.orders || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao carregar pedidos de venda' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, true);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason || 'Não autorizado para faturar pedidos.' }, { status: 403 });
    }

    const body = await req.json();
    const { sku, quantity, marketplace, customerCity, orderNumber, salePrice } = body;

    if (!sku || !quantity || quantity <= 0 || !marketplace) {
      return NextResponse.json(
        { ok: false, message: 'Dados do pedido inválidos. Informe SKU, quantidade e marketplace.' },
        { status: 400 }
      );
    }

    const result = recordSaleOrder({
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
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao registrar pedido de venda' },
      { status: 500 }
    );
  }
}
