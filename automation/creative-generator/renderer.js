export const CANVAS = { width: 1000, height: 1500 };

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

export function buildCreativeSvg(product, template = 'clean-product') {
  const name = product.name || 'Featured product';
  const category = product.category || 'Fashion';
  const image = product.imageUrl;
  if (!image) throw new Error('A product image URL is required to render a creative.');

  const headline = template === 'deal-alert' ? 'DEAL ALERT' : template === 'style-inspiration' ? 'YOUR NEXT LOOK' : 'TRENDING STYLE';
  const cta = template === 'deal-alert' ? 'DISCOVER DEAL →' : template === 'style-inspiration' ? 'DISCOVER MORE →' : 'SHOP THE LOOK →';
  const price = product.price ? `<text x="500" y="1260" text-anchor="middle" class="price">${esc(product.price)}</text>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}">
  <defs><clipPath id="card"><rect x="70" y="250" width="860" height="780" rx="34"/></clipPath></defs>
  <rect width="1000" height="1500" fill="#ffffff"/>
  <text x="70" y="115" class="eyebrow">${esc(category.toUpperCase())}</text>
  <text x="70" y="190" class="headline">${esc(headline)}</text>
  <rect x="70" y="250" width="860" height="780" rx="34" fill="#f4f4f5"/>
  <image href="${esc(image)}" x="70" y="250" width="860" height="780" preserveAspectRatio="xMidYMid meet" clip-path="url(#card)"/>
  <text x="500" y="1150" text-anchor="middle" class="name">${esc(name)}</text>
  ${price}
  <rect x="250" y="1320" width="500" height="90" rx="45" fill="#111111"/>
  <text x="500" y="1378" text-anchor="middle" class="cta">${esc(cta)}</text>
  <style>.eyebrow{font:700 24px system-ui;letter-spacing:4px;fill:#6b21a8}.headline{font:800 62px system-ui;fill:#111}.name{font:700 34px system-ui;fill:#111}.price{font:800 46px system-ui;fill:#111}.cta{font:700 28px system-ui;fill:#fff}</style>
</svg>`;
}
