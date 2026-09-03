const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');

let products = [];

async function loadProducts() {
  try {
    const response = await fetch('./products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product catalog.');
    products = await response.json();
  } catch (error) {
    results.innerHTML = `<div class="no-results"><strong>Catalog unavailable.</strong><p>${error.message}</p></div>`;
  }
}

function matches(product, query) {
  const value = query.toLowerCase();
  const searchable = [
    product.id,
    product.name,
    product.category,
    product.description,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
  ].filter(Boolean).join(' ').toLowerCase();
  return searchable.includes(value);
}

function render(items) {
  results.replaceChildren();
  emptyState.hidden = items.length > 0;

  if (!items.length) {
    results.innerHTML = '<div class="no-results"><strong>No product found.</strong><p>Try the Product ID or a different keyword.</p></div>';
    return;
  }

  items.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const poster = document.createElement('img');
    poster.className = 'poster';
    poster.src = product.posterUrl;
    poster.alt = `${product.name || 'Product'} poster`;
    poster.loading = 'lazy';
    poster.onerror = () => { poster.alt = 'Product poster unavailable'; };

    const info = document.createElement('div');
    info.className = 'product-info';
    info.innerHTML = `
      <span class="product-id">PRODUCT ID · ${escapeHtml(product.id)}</span>
      <h2 class="product-name">${escapeHtml(product.name || 'Product')}</h2>
      ${product.price ? `<div class="price">${escapeHtml(product.price)}</div>` : ''}
      ${product.description ? `<p class="description">${escapeHtml(product.description)}</p>` : ''}
      <div class="keywords">${(product.keywords || []).slice(0, 8).map((k) => `<span class="keyword">${escapeHtml(k)}</span>`).join('')}</div>
    `;

    const buy = document.createElement('a');
    buy.className = 'buy-button';
    buy.href = product.affiliateUrl || '#';
    buy.target = '_blank';
    buy.rel = 'noopener noreferrer sponsored';
    buy.textContent = 'View & Shop';
    if (!product.affiliateUrl) {
      buy.removeAttribute('target');
      buy.textContent = 'Link coming soon';
      buy.style.opacity = '.55';
      buy.style.pointerEvents = 'none';
    }
    info.appendChild(buy);

    card.append(poster, info);
    results.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) {
    render([]);
    return;
  }
  render(products.filter((product) => matches(product, query)));
});

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('id') || params.get('q');

await loadProducts();
if (initialQuery) {
  input.value = initialQuery;
  render(products.filter((product) => matches(product, initialQuery)));
}
