import { NextRequest, NextResponse } from 'next/server';
import { getErpState, registerUsCommercialInvoice } from '@/lib/erpStore';
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
      invoices: state.invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao carregar notas fiscais' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, true);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason || 'Não autorizado para importar invoices.' }, { status: 403 });
    }

    const body = await req.json();
    const { invoiceNumber, vendorName, vendorDoc, items, shippingCost, prepCost, date } = body;

    if (!invoiceNumber || !vendorName || !items || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Dados da Commercial Invoice incompletos. Informe número, fornecedor e ao menos um item.' },
        { status: 400 }
      );
    }

    const result = registerUsCommercialInvoice({
      invoiceNumber,
      vendorName,
      vendorDoc,
      items,
      shippingCost,
      prepCost,
      date,
    });

    return NextResponse.json({
      ok: result.success,
      invoiceId: result.invoiceId,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Erro ao importar Commercial Invoice' },
      { status: 500 }
    );
  }
}
