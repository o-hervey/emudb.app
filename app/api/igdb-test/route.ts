import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      step: 'env',
      ok: false,
      error: `Missing: ${!clientId ? 'IGDB_CLIENT_ID' : ''}${!clientId && !clientSecret ? ' and ' : ''}${!clientSecret ? 'IGDB_CLIENT_SECRET' : ''}`,
    });
  }

  // Step 1: token
  let token: string;
  try {
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    if (!tokenRes.ok) {
      return NextResponse.json({ step: 'token', ok: false, status: tokenRes.status, body: await tokenRes.text() });
    }
    const tokenData = await tokenRes.json();
    token = tokenData.access_token;
    if (!token) {
      return NextResponse.json({ step: 'token', ok: false, error: 'No access_token in response', body: tokenData });
    }
  } catch (e) {
    return NextResponse.json({ step: 'token', ok: false, error: String(e) });
  }

  // Step 2: IGDB platforms query
  try {
    const igdbRes = await fetch('https://api.igdb.com/v4/platforms', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: 'fields id, name, platform_logo.url; limit 10;',
    });
    if (!igdbRes.ok) {
      return NextResponse.json({ step: 'igdb', ok: false, status: igdbRes.status, body: await igdbRes.text() });
    }
    const platforms = await igdbRes.json();
    return NextResponse.json({
      ok: true,
      envVarsPresent: true,
      tokenLength: token.length,
      platformCount: platforms.length,
      samplePlatforms: platforms.slice(0, 5).map((p: { id: number; name: string; platform_logo?: { url: string } }) => ({
        id: p.id,
        name: p.name,
        hasLogo: !!p.platform_logo?.url,
      })),
    });
  } catch (e) {
    return NextResponse.json({ step: 'igdb', ok: false, error: String(e) });
  }
}
