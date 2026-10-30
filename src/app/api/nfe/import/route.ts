import { NextRequest, NextResponse } from 'next/server';
import { parseNfeXml } from '@/lib/nfeParser';
import { registerNfeInbound } from '@/lib/erpStore';

export async function POST(req: NextRequest) {
  try {
    let xmlContent = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      xmlContent = body.xmlContent || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        xmlContent = await file.text();
      }
    } else {
      xmlContent = await req.text();
    }

    if (!xmlContent || xmlContent.trim().length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Conteúdo do XML não fornecido.' },
        { status: 400 }
      );
    }

    // Parse XML
    const parsedData = parseNfeXml(xmlContent);

    if (!parsedData.chaveAcesso || !parsedData.numeroNF) {
      return NextResponse.json(
        { ok: false, message: 'Arquivo XML inválido ou não compatível com o padrão SEFAZ NF-e (modelo 55).' },
        { status: 422 }
      );
    }

    // Register inbound into ERP store
    const result = registerNfeInbound(parsedData);

    return NextResponse.json({
      ok: true,
      nfe: parsedData,
      result,
    });
  } catch (error: any) {
    console.error('Error importing NF-e:', error);
    return NextResponse.json(
      { ok: false, message: `Erro ao processar NF-e: ${error?.message || 'Erro interno'}` },
      { status: 500 }
    );
  }
}
