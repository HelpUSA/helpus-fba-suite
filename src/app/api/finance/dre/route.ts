import { NextRequest, NextResponse } from 'next/server';
import { calculateDre } from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Confidential financial information must never be readable anonymously.
    const auth = validateApiRequest(request, false, true);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.reason || 'Acesso financeiro não autorizado' }, { status: 403 });
    }

    // P1 financial calculations remain provisional until an auditable SQL ledger is homologated.
    // The route is fail-closed in production, rather than presenting in-memory estimates as actual accounting data.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return NextResponse.json({
        success: false,
        status: 'P1_NOT_HOMOLOGATED',
        message: 'DRE financeira aguardando ledger auditável e homologação da fase P1.'
      }, { status: 503 });
    }
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '2026-10';
    const ptaxParam = searchParams.get('ptax');
    const ptax = ptaxParam ? parseFloat(ptaxParam) : 5.75;

    const dre = calculateDre(period, isNaN(ptax) ? 5.75 : ptax);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      period,
      ptaxRate: ptax,
      isEstimated: true,
      accountingClassification: 'PROVISIONAL_MANAGEMENT_ESTIMATE',
      auditNotice:
        'Aviso de Governança (Ordem 013): Este demonstrativo reflete projeções gerenciais estimadas com base em parâmetros operacionais padrão (comissões médias de marketplace, tarifas 3PL estimadas e Simples Nacional). Não substitui a DRE contábil/fiscal auditada definitiva.',
      statements: dre,
    });
  } catch (error: any) {
    console.error('Error calculating DRE:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao calcular DRE financeiro' },
      { status: 500 }
    );
  }
}
