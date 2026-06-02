async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(`IGDB auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function queryIGDB<T>(endpoint: string, body: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });
  if (!res.ok) throw new Error(`IGDB query failed: ${res.status}`);
  return res.json() as Promise<T>;
}
