import { NextRequest, NextResponse } from 'next/server';
import { getReturnsState, addReturnRecord } from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const returns = getReturnsState();
    return NextResponse.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar devoluções' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate authentication and CSRF headers
  const authValidation = validateApiRequest(request, true);
  if (!authValidation.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: authValidation.reason || 'Não autorizado',
        hint: 'Defina x-helpus-auth-token com HELPUS_MASTER_SECRET para chamadas externas.',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body.sku || !body.productTitle || !body.quantity || !body.reason || !body.warehouse) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes: sku, productTitle, quantity, reason, warehouse' },
        { status: 400 }
      );
    }

    const newRecord = addReturnRecord({
      returnDate: body.returnDate || new Date().toISOString(),
      orderNumber: body.orderNumber,
      sku: body.sku,
      productTitle: body.productTitle,
      quantity: Number(body.quantity),
      reason: body.reason,
      disposition: body.disposition || 'SELLABLE',
      warehouse: body.warehouse,
      status: body.status || 'RECEIVED',
      reimbursementAmount: body.reimbursementAmount ? Number(body.reimbursementAmount) : 0,
      currency: body.currency || 'USD',
      notes: body.notes,
      isDemo: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Devolução/avaria registrada e conciliada com sucesso',
      record: newRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar devolução' },
      { status: 500 }
    );
  }
}
