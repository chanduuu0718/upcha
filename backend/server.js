import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3002);
const HOST = process.env.HOST || '127.0.0.1';
const PRODUCT_TIMEOUT_MS = Number(process.env.PRODUCT_TIMEOUT_MS || 12000);
const CUELINKS_API_URL = 'https://developers.cuelinks.com/pub_api/v3/links/convert';

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function decodeHtml(value = '') {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
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
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) values.push(item, ...(Array.isArray(item?.['@graph']) ? item['@graph'] : []));
    } catch {}
  }
  return values;
}

function normalizeImages(image) {
  const values = Array.isArray(image) ? image : [image];
  return [...new Set(values.flatMap((item) => {
    if (typeof item === 'string') return [decodeHtml(item)];
    if (item?.url) return [decodeHtml(item.url)];
    if (item?.contentUrl) return [decodeHtml(item.contentUrl)];
    return [];
  }).filter(Boolean))].slice(0, 12);
}

function findProductData(html, productId, retailer) {
  const jsonLd = jsonLdProducts(html);
  const product = jsonLd.find((item) => item?.['@type'] === 'Product') || jsonLd.find((item) => item?.name && item?.image);
  const offers = product?.offers;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  const imageUrls = normalizeImages(product?.image);
  const fallbackImage = firstMeta(html, 'og:image');
  if (fallbackImage && !imageUrls.includes(fallbackImage)) imageUrls.push(fallbackImage);
  const image = imageUrls[0] || null;
  const rawPrice = offer?.price ?? offer?.lowPrice;
  const price = rawPrice != null && !Number.isNaN(Number(rawPrice)) ? Number(rawPrice) : null;

  let originalPrice = null;
  const priceSpec = Array.isArray(offer?.priceSpecification) ? offer.priceSpecification : [offer?.priceSpecification];
  for (const spec of priceSpec) {
    const candidate = Number(spec?.price);
    if (Number.isFinite(candidate) && candidate > (price || 0)) originalPrice = candidate;
  }
  if (!originalPrice) {
    const mrpMatch = html.match(/(?:MRP|mrp)[^₹\d]{0,30}₹?\s*([\d,]+)/i);
    if (mrpMatch) originalPrice = Number(mrpMatch[1].replaceAll(',', ''));
  }
  const discountPercent = price && originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return {
    productId,
    name: clean(product?.name || firstMeta(html, 'og:title')),
    description: clean(product?.description || firstMeta(html, 'description')),
    imageUrl: image,
    imageUrls,
    price,
    originalPrice,
    discountPercent,
    currency: offer?.priceCurrency || 'INR',
    category: clean(product?.category || ''),
    retailer,
    source: 'public-page-metadata',
  };
}

const RETAILERS = {
  myntra: { label: 'Myntra', hosts: /(^|\.)myntra\.com$/i },
  nykaaFashion: { label: 'Nykaa Fashion', hosts: /(^|\.)nykaafashion\.com$/i },
};

function retailerForUrl(rawUrl) {
  const url = new URL(rawUrl);
  const entry = Object.values(RETAILERS).find((item) => item.hosts.test(url.hostname));
  if (!entry) throw new Error('Supported stores in V1: Myntra and Nykaa Fashion.');
  return { url, ...entry };
}

async function fetchProduct(rawUrl) {
  const { url, label: retailer } = retailerForUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRODUCT_TIMEOUT_MS);
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
    if (error?.name === 'AbortError') throw new Error(`${retailer} did not respond within ${PRODUCT_TIMEOUT_MS / 1000} seconds. Try again or use a supported catalog/API source.`);
    throw new Error(`Could not reach ${retailer}: ${error?.message || 'network error'}`);
  } finally { clearTimeout(timeout); }
  if (!response.ok) throw new Error(`${retailer} returned HTTP ${response.status}.`);
  const html = await response.text();
  const productId = url.pathname.match(/(?:\/|-)(\d{4,})(?:\/|$)/)?.[1] || null;
  const product = findProductData(html, productId, retailer);
  if (!product.name && !product.imageUrl) throw new Error(`${retailer} did not expose usable public product metadata.`);
  return { ...product, url: response.url };
}

async function convertWithCuelinks(rawUrl) {
  const apiKey = process.env.CUELINKS_API_KEY;
  if (!apiKey) throw new Error('Cuelinks API key is not configured. Add CUELINKS_API_KEY to your local .env file.');
  const { label: retailer } = retailerForUrl(rawUrl);
  const body = { url: rawUrl, shorten: String(process.env.CUELINKS_SHORTEN_LINKS || 'true').toLowerCase() === 'true', subid: 'upcha', subid3: retailer === 'Nykaa Fashion' ? 'instagram' : 'upcha' };
  const response = await fetch(CUELINKS_API_URL, {
    method: 'POST',
    headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) throw new Error('Cuelinks rejected the API key. Check your local CUELINKS_API_KEY.');
    if (response.status === 403) throw new Error('Cuelinks API key does not have the write:links scope.');
    throw new Error(payload?.error || `Cuelinks returned HTTP ${response.status}.`);
  }
  const data = payload?.data;
  if (!data?.tracking_url) throw new Error('Cuelinks returned no tracking URL.');
  return { trackingUrl: data.tracking_url, shortUrl: data.short_url || null, affiliated: data.affiliated === true, campaign: data.campaign || null, originalUrl: data.original_url || rawUrl };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': 'http://127.0.0.1:5173', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') return sendJson(res, 200, { ok: true, service: 'upcha-backend', cuelinksConfigured: Boolean(process.env.CUELINKS_API_KEY), supportedRetailers: Object.values(RETAILERS).map((item) => item.label) });
    if (req.method === 'GET' && requestUrl.pathname === '/api/products/from-url') {
      const productUrl = requestUrl.searchParams.get('url');
      if (!productUrl) return sendJson(res, 400, { error: 'Missing url query parameter.' });
      return sendJson(res, 200, await fetchProduct(productUrl));
    }
    if (req.method === 'POST' && requestUrl.pathname === '/api/affiliate/convert') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw || '{}');
      if (!body.url) return sendJson(res, 400, { error: 'Missing url in request body.' });
      retailerForUrl(body.url);
      return sendJson(res, 200, await convertWithCuelinks(body.url));
    }
    return sendJson(res, 404, { error: 'Route not found.' });
  } catch (error) { return sendJson(res, 502, { error: error instanceof Error ? error.message : 'Unexpected error.' }); }
});

server.listen(PORT, HOST, () => console.log(`Upcha backend running at http://${HOST}:${PORT}`));
