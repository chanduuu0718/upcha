/**
 * V1 Myntra product metadata/image retriever.
 *
 * This adapter reads publicly exposed page metadata (og:image / JSON-LD)
 * from the supplied product URL. It does not bypass login, CAPTCHA,
 * bot protection, or other access controls.
 */

const MYNTRA_HOSTS = new Set(['myntra.com', 'www.myntra.com']);

export function validateMyntraUrl(input) {
  const url = new URL(input);
  if (!MYNTRA_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('URL must be a Myntra product URL');
  }
  return url;
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'");
}

function getMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'));
  return match ? decodeHtml(match[1]) : null;
}

function getJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\\s\\S]*?)<\/script>/gi)];
  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const product = items.find((item) => item?.['@type'] === 'Product');
      if (product) return product;
    } catch {
      // Ignore malformed/irrelevant JSON-LD and continue with meta tags.
    }
  }
  return null;
}

export async function retrieveMyntraProduct(input) {
  const url = validateMyntraUrl(input);
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Upcha/1.0 product-metadata-retriever',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Myntra page request failed: HTTP ${response.status}`);
  }

  const html = await response.text();
  const jsonLd = getJsonLd(html);
  const imageUrl = jsonLd?.image?.[0] || jsonLd?.image || getMeta(html, 'og:image');
  const name = jsonLd?.name || getMeta(html, 'og:title');
  const description = jsonLd?.description || getMeta(html, 'og:description');

  return {
    sourceUrl: url.toString(),
    productId: url.pathname.match(/\/(\d+)\/buy/)?.[1] || null,
    name: name || null,
    description: description || null,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : null,
    imageSource: imageUrl ? (jsonLd?.image ? 'json-ld' : 'og:image') : null,
  };
}
