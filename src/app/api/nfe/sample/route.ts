import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const samplePath = 'D:\\AntiG\\Amazon Seller\\docs\\01_Operacao_Brasil_Nativos\\NF_00002509_Nativos.xml';

  try {
    if (fs.existsSync(samplePath)) {
      const xmlContent = fs.readFileSync(samplePath, 'utf-8');
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
