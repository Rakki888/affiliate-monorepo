const ASIN_IN_PATH = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:\/|[?#]|$)/i;

/** 10桁ASIN または Amazon商品URL から ASIN を取り出す */
export function parseAmazonAsinInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[A-Z0-9]{10}$/i.test(s)) return s.toUpperCase();
  try {
    const urlStr = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(urlStr);
    const m = u.pathname.match(ASIN_IN_PATH);
    return m ? m[1].toUpperCase() : null;
  } catch {
    return null;
  }
}
