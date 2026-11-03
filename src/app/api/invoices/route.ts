import { NextRequest, NextResponse } from 'next/server';
import { getAuthoritativeErpState, registerUsCommercialInvoice } from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';

export async function GET(req: NextRequest) {
  try {
    // Protected read: invoices contain supplier identifiers and confidential tax/cost data (Order 016 - Item 4)
    const auth = validateApiRequest(req, false, true);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason }, { status: 403 });
    }

    const state = await getAuthoritativeErpState();
    return NextResponse.json({
      ok: true,
      storageEngine: state.storageEngine || 'UNKNOWN',
      invoices: state.invoices || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: 'Erro ao carregar notas fiscais' },
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

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      return NextResponse.json({ ok: false, status: 'P2_NOT_HOMOLOGATED' }, { status: 503 });
    }
    const body = await req.json();
    const { invoiceNumber, vendorName, vendorDoc, items, shippingCost, prepCost, date } = body;

    if (typeof invoiceNumber !== 'string' || invoiceNumber.length > 100 ||
        typeof vendorName !== 'string' || vendorName.length > 200 ||
        !Array.isArray(items) || items.length === 0 || items.length > 500 ||
        !Number.isFinite(Number(shippingCost ?? 0)) || Number(shippingCost ?? 0) < 0 ||
        !Number.isFinite(Number(prepCost ?? 0)) || Number(prepCost ?? 0) < 0) {
      return NextResponse.json(
        { ok: false, message: 'Dados da Commercial Invoice incompletos. Informe número, fornecedor e ao menos um item.' },
        { status: 400 }
      );
    }

    const result = await registerUsCommercialInvoice({
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
      { ok: false, message: 'Erro ao importar Commercial Invoice' },
      { status: 500 }
    );
  }
}
