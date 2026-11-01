import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiRequest } from '@/lib/authGuard';

export async function GET(req: NextRequest) {
  // Fiscal documents contain confidential supplier tax IDs (CNPJ, IE, values)
  const auth = validateApiRequest(req, false, true);
  if (!auth.authorized) {
    return NextResponse.json({ ok: false, message: auth.reason }, { status: 403 });
  }
  const samplePath = 'D:\\AntiG\\Amazon Seller\\docs\\01_Operacao_Brasil_Nativos\\NF_00002509_Nativos.xml';

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ samplePath)) {
      const xmlContent = fs.readFileSync(/*turbopackIgnore: true*/ samplePath, 'utf-8');
      return NextResponse.json({
        ok: true,
        filename: 'NF_00002509_Nativos.xml',
        xmlContent,
      });
    }
  } catch (error) {
    console.error('Error reading sample NF-e:', error);
  }

  return NextResponse.json(
    { ok: false, message: 'Arquivo XML da NF-e 00002509 não encontrado no caminho padrão.' },
    { status: 404 }
  );
}
