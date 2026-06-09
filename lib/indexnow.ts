export async function pingIndexNow(urls: string[]) {
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "emudb.app",
        key: process.env.INDEXNOW_KEY,
        keyLocation: `https://emudb.app/${process.env.INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    // best-effort — never block the caller
  }
}
