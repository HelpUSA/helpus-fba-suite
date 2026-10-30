import { NextResponse } from 'next/server';
import { getErpState } from '@/lib/erpStore';

export async function GET() {
  try {
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
