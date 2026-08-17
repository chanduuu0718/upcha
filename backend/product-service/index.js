import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3001);

function isMyntraUrl(value) {
  try {
    const url = new URL(value);
    return /(^|\.)myntra\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function clean(value) {
  return value?.replace(/\\u0026/g, '&').replace(/&amp;/g, '&').trim() || null;
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return null;
}

function extractProduct(html, sourceUrl) {
  const imageUrl = firstMatch(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /["']image["']\s*:\s*["']([^"']+)["']/i,
  ]);

  const name = firstMatch(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = firstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  const productId = sourceUrl.match(/\/(\d+)\/buy(?:\?|$)/i)?.[1] || null;
  return { productId, name, description, imageUrl, url: sourceUrl };
}

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  if (requestUrl.pathname !== '/api/products/from-url' || req.method !== 'GET') return send(res, 404, { error: 'Not found' });

  const productUrl = requestUrl.searchParams.get('url');
  if (!productUrl || !isMyntraUrl(productUrl)) return send(res, 400, { error: 'A valid Myntra product URL is required.' });

  try {
    const response = await fetch(productUrl, { redirect: 'follow', headers: { 'user-agent': 'Upcha product metadata client/1.0' } });
    if (!response.ok) return send(res, 502, { error: `Myntra returned HTTP ${response.status}.` });
    const html = await response.text();
    const product = extractProduct(html, productUrl);
    if (!product.imageUrl) return send(res, 422, { error: 'Product page was reached, but no publicly exposed product image metadata was found.', product });
    return send(res, 200, product);
  } catch (error) {
    return send(res, 502, { error: 'Could not retrieve the product page.', detail: error.message });
  }
});

server.listen(PORT, () => console.log(`Upcha product service listening on http://localhost:${PORT}`));
