import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'samples', 'NF_00002509_Nativos.xml'),
    path.join(process.cwd(), 'data', 'samples', 'NF_00002509_Nativos.xml'),
    'D:\\AntiG\\Amazon Seller\\docs\\01_Operacao_Brasil_Nativos\\NF_00002509_Nativos.xml',
  ];

  for (const samplePath of candidatePaths) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ samplePath)) {
        const xmlContent = fs.readFileSync(/*turbopackIgnore: true*/ samplePath, 'utf-8');
        return NextResponse.json({
          ok: true,
          filename: 'NF_00002509_Nativos.xml',
          xmlContent,
          resolvedPath: path.basename(samplePath),
        });
      }
    } catch (error) {
      console.warn(`Could not read sample NF-e at ${samplePath}:`, error);
    }
  }

  return NextResponse.json(
    { ok: false, message: 'Arquivo XML da NF-e 00002509 não encontrado no caminho padrão.' },
    { status: 404 }
  );
}
