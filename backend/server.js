import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '127.0.0.1';
const MYNTRA_TIMEOUT_MS = Number(process.env.MYNTRA_TIMEOUT_MS || 12000);

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function clean(value = '') {
  return decodeHtml(value.replace(/<[^>]+>/g, '').trim());
}

function firstMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i');
  return decodeHtml(html.match(pattern)?.[1] || html.match(reverse)?.[1] || '');
}

function jsonLdProducts(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const values = [];
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim());
      values.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }
  return values;
}

function findProductData(html, productId) {
  const jsonLd = jsonLdProducts(html);
  const product = jsonLd.find((item) => item?.['@type'] === 'Product') || jsonLd.find((item) => item?.name && item?.image);
  const offers = product?.offers;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  const image = Array.isArray(product?.image) ? product.image[0] : product?.image;

  return {
    productId,
    name: clean(product?.name || firstMeta(html, 'og:title')),
    description: clean(product?.description || firstMeta(html, 'description')),
    imageUrl: decodeHtml(image || firstMeta(html, 'og:image')) || null,
    price: offer?.price ? Number(offer.price) : null,
    currency: offer?.priceCurrency || 'INR',
    category: clean(product?.category || ''),
    source: 'public-page-metadata',
  };
}

async function fetchMyntraProduct(rawUrl) {
  const url = new URL(rawUrl);
  if (!/(^|\.)myntra\.com$/i.test(url.hostname)) {
    throw new Error('Only Myntra product URLs are supported.');
  }

  const match = url.pathname.match(/\/(\d+)\/buy(?:\/?$)/i);
  const productId = match?.[1] || null;
  if (!productId) throw new Error('Could not identify a Myntra product ID from this URL.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MYNTRA_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Myntra did not respond within ${MYNTRA_TIMEOUT_MS / 1000} seconds. Try again or use the product's supported catalog/API source.`);
    }
    throw new Error(`Could not reach Myntra: ${error?.message || 'network error'}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`Myntra returned HTTP ${response.status}.`);
  const html = await response.text();
  const product = findProductData(html, productId);

  if (!product.name && !product.imageUrl) {
    throw new Error('Myntra did not expose usable public product metadata.');
  }

  return { ...product, url: response.url };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'upcha-backend' });
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/products/from-url') {
      const productUrl = requestUrl.searchParams.get('url');
      if (!productUrl) return sendJson(res, 400, { error: 'Missing url query parameter.' });
      const product = await fetchMyntraProduct(productUrl);
      return sendJson(res, 200, product);
    }

    return sendJson(res, 404, { error: 'Route not found.' });
  } catch (error) {
    return sendJson(res, 502, { error: error instanceof Error ? error.message : 'Unexpected error.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Upcha backend running at http://${HOST}:${PORT}`);
});
