import { NextRequest, NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/authGuard';
import { calculateAuditedDre } from '@/lib/db/postgresClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Strict RBAC: Confidential financial data requires Operator or Master SuperAdmin
    const auth = validateApiRequest(request, false, true);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.reason || 'Acesso negado: Informações financeiras confidenciais exigem autenticação.',
        },
        { status: 403 }
      );
    }

    // 2. Production Protection Guard (Patch 6212468 compliance)
    // Production Vercel serverless fails closed with 503 until Master SuperAdmin authorizes live release
    const isProductionVercel = (process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)) &&
      process.env.P1_HOMOLOGATED_PRODUCTION !== 'true';

    if (isProductionVercel) {
      return NextResponse.json(
        {
          success: false,
          status: 'P1_NOT_HOMOLOGATED',
          message: 'DRE financeira aguardando homologação formal e autorização de release em produção (Ordem 045).',
        },
        { status: 503 }
      );
    }

    // 3. Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '2026-10';
    const ptaxParam = searchParams.get('ptax');
    const customPtax = ptaxParam ? parseFloat(ptaxParam) : undefined;

    // 4. Calculate authoritative DRE from PostgreSQL
    const dreResult = await calculateAuditedDre(period, customPtax);

    return NextResponse.json({
      success: true,
      period,
      actorRole: auth.actorRole,
      fxRateApplied: dreResult.consolidated.fxRateApplied,
      fxSource: dreResult.consolidated.fxSource,
      isFxFallback: dreResult.consolidated.isFxFallback,
      statements: dreResult,
    });
  } catch (error: any) {
    console.error('[API DRE] Erro ao calcular DRE auditada:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno ao processar DRE auditada.',
      },
      { status: 500 }
    );
  }
}
