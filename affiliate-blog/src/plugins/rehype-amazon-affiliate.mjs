import { visit } from 'unist-util-visit';

const ASIN_IN_PATH = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:\/|[?#]|$)/i;

function isAmazonJpHost(hostname) {
  const h = String(hostname).toLowerCase();
  return h === 'amazon.co.jp' || h === 'www.amazon.co.jp' || h.endsWith('.amazon.co.jp');
}

function mergeRel(existing) {
  const need = ['nofollow', 'sponsored', 'noopener', 'noreferrer'];
  if (!existing) return need;
  if (Array.isArray(existing)) {
    return [...new Set([...existing.map(String), ...need])];
  }
  return [...new Set([String(existing), ...need])];
}

/**
 * MDX/Markdown 本文中の amazon.co.jp の商品リンクを、指定タグ付きの正規 URL に揃える
 */
export function rehypeAmazonAffiliate(options = {}) {
  const tag = options.associateTag ?? '';
  const marketplace = options.marketplace ?? 'www.amazon.co.jp';

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const hrefProp = node.properties?.href;
      if (typeof hrefProp !== 'string' || !hrefProp) return;

      let url;
      try {
        url = new URL(hrefProp, 'https://www.amazon.co.jp/');
      } catch {
        return;
      }
      if (!isAmazonJpHost(url.hostname)) return;

      const m = url.pathname.match(ASIN_IN_PATH);
      if (!m) return;

      const asin = m[1].toUpperCase();
      const out = new URL(`https://${marketplace}/dp/${asin}`);
      if (tag) out.searchParams.set('tag', tag);

      node.properties.href = out.toString();
      node.properties.rel = mergeRel(node.properties.rel);
    });
  };
}
