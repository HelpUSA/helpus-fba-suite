import { NextRequest, NextResponse } from 'next/server';
import { calculateDre } from '@/lib/erpStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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
