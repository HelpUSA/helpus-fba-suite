import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const tinyToken = process.env.TINY_API_TOKEN;
  const blingToken = process.env.BLING_API_KEY;

  const connectors = [
    {
      name: 'Tiny ERP (Olist)',
      type: 'NFE_EMISSION_AND_SYNC',
      status: tinyToken ? 'CONFIGURED' : 'READY_FOR_CREDENTIALS',
      features: ['Importação de Pedidos', 'Emissão de NF-e 55/65', 'Baixa de Estoque Automática'],
      lastSync: new Date().toISOString(),
    },
    {
      name: 'Bling ERP',
      type: 'CATALOG_AND_STOCK_SYNC',
      status: blingToken ? 'CONFIGURED' : 'STANDBY',
      features: ['Sincronização de Anúncios Mercado Livre/Amazon BR', 'Etiquetas Braspress'],
      lastSync: new Date().toISOString(),
    },
    {
      name: 'HelpUS Native XML Gateway',
      type: 'DIRECT_SEFAZ_PARSER',
      status: 'ONLINE',
      features: ['Processamento de NF-e Mod 55', 'De-Para de SKU Automático', 'Lançamento Contábil'],
      lastSync: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    connectors,
    durationMs: Date.now() - startTime,
    activeFiscalIssuer: 'HelpUS Native XML Gateway',
  });
}
