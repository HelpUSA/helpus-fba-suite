import { NextRequest, NextResponse } from 'next/server';
import { parseNfeXml } from '@/lib/nfeParser';
import { registerNfeInbound } from '@/lib/erpStore';
import { validateApiRequest } from '@/lib/authGuard';

export async function POST(req: NextRequest) {
  try {
    const auth = validateApiRequest(req, true);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, message: auth.reason || 'Não autorizado para importar NF-e.' }, { status: 403 });
    }

    // Keep unhomologated fiscal ingestion off production regardless of credentials.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      return NextResponse.json({ ok: false, status: 'P2_NOT_HOMOLOGATED' }, { status: 503 });
    }
    const maxXmlBytes = 1024 * 1024;
    const declaredSize = Number(req.headers.get('content-length') || '0');
    if (Number.isFinite(declaredSize) && declaredSize > maxXmlBytes) {
      return NextResponse.json({ ok: false, message: 'XML excede o limite permitido.' }, { status: 413 });
    }
    let xmlContent = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      xmlContent = body.xmlContent || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        if (file.size > maxXmlBytes) {
          return NextResponse.json({ ok: false, message: 'XML excede o limite permitido.' }, { status: 413 });
        }
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

    if (Buffer.byteLength(xmlContent, 'utf8') > maxXmlBytes) {
      return NextResponse.json({ ok: false, message: 'XML excede o limite permitido.' }, { status: 413 });
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
    const result = await registerNfeInbound(parsedData);

    return NextResponse.json({
      ok: true,
      nfe: parsedData,
      result,
    });
  } catch (error: any) {
    console.error('Error importing NF-e:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro interno ao processar NF-e.' },
      { status: 500 }
    );
  }
}
