import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const sku = searchParams.get('sku') || 'HU-SIL-CABLE-FBA-2026';
  const asin = searchParams.get('asin') || 'B0HLTXWCV7';

  const clientId = process.env.AMAZON_SP_CLIENT_ID;
  const clientSecret = process.env.AMAZON_SP_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_SP_REFRESH_TOKEN;

  // Audit Finding 3 (Order 013):
  // Never present synthetic or mock values as real stock when live SP-API is offline.
  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      {
        success: false,
        status: 'CREDENTIALS_MISSING',
        connectionMode: 'OFFLINE',
        targetMarketplace: 'Amazon US (ATVPDKIKX0DER)',
        asin,
        sku,
        durationMs: Date.now() - startTime,
        error: 'Credenciais de integração Amazon SP-API (AMAZON_SP_CLIENT_ID / REFRESH_TOKEN) não configuradas no ambiente.',
        data: null,
      },
      { status: 503 }
    );
  }

  try {
    // Step 1: LWA Access Token
    const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json(
        {
          success: false,
          status: 'LWA_AUTH_FAILED',
          connectionMode: 'OFFLINE',
          targetMarketplace: 'Amazon US (ATVPDKIKX0DER)',
          asin,
          sku,
          durationMs: Date.now() - startTime,
          error: `Falha na autenticação LWA (HTTP ${tokenRes.status}): ${errText.slice(0, 300)}`,
          data: null,
        },
        { status: 502 }
      );
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // Step 2: Query SP-API FBA Inventory Summaries
    const spRes = await fetch(
      `https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=ATVPDKIKX0DER&sellerSkus=${encodeURIComponent(
        sku
      )}`,
      {
        headers: {
          'x-amz-access-token': accessToken,
          'User-Agent': 'HelpUS-FBA-Suite/1.0 (Language=NodeJS)',
        },
      }
    );

    if (!spRes.ok) {
      const errText = await spRes.text();
      return NextResponse.json(
        {
          success: false,
          status: 'SP_API_ERROR',
          connectionMode: 'OFFLINE',
          targetMarketplace: 'Amazon US (ATVPDKIKX0DER)',
          asin,
          sku,
          durationMs: Date.now() - startTime,
          error: `Falha ao consultar SP-API FBA Inventory (HTTP ${spRes.status}): ${errText.slice(0, 300)}`,
          data: null,
        },
        { status: 502 }
      );
    }

    const apiResponseData = await spRes.json();

    return NextResponse.json({
      success: true,
      status: 'ONLINE',
      connectionMode: 'LIVE_SP_API',
      targetMarketplace: 'Amazon US (ATVPDKIKX0DER)',
      asin,
      sku,
      durationMs: Date.now() - startTime,
      data: apiResponseData,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'CONNECTION_EXCEPTION',
        connectionMode: 'OFFLINE',
        targetMarketplace: 'Amazon US (ATVPDKIKX0DER)',
        asin,
        sku,
        durationMs: Date.now() - startTime,
        error: `Exceção de rede ao contatar Amazon SP-API: ${err.message || String(err)}`,
        data: null,
      },
      { status: 500 }
    );
  }
}
