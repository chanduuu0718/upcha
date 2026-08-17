import { renderCreative } from './creative.js';

const API_BASE = window.UPCHA_API_BASE || 'http://localhost:3001';
const form = document.querySelector('#product-form');
const input = document.querySelector('#myntra-url');
const error = document.querySelector('#error');
const preview = document.querySelector('#preview');
const selected = document.querySelector('#selected');
const selectButton = document.querySelector('#select-product');
const creative = document.querySelector('#creative');
const imagePlaceholder = document.querySelector('#image-placeholder');

let currentProduct = null;

function isMyntraUrl(value) {
  try {
    const url = new URL(value);
    return /(^|\.)myntra\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function showProduct(product, url) {
  currentProduct = { ...product, url };
  document.querySelector('#product-name').textContent = product.name || 'Myntra product';
  document.querySelector('#product-url').textContent = url;
  document.querySelector('#product-price').textContent = product.price ? `₹${product.price}` : 'Not available';
  document.querySelector('#product-category').textContent = product.category || 'Myntra product';

  imagePlaceholder.replaceChildren();
  if (product.imageUrl) {
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.name || 'Product image';
    image.referrerPolicy = 'no-referrer';
    image.className = 'product-image';
    imagePlaceholder.appendChild(image);
  } else {
    imagePlaceholder.textContent = 'Product image unavailable';
  }

  preview.classList.remove('hidden');
  selected.classList.add('hidden');
  creative.classList.add('hidden');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const url = input.value.trim();

  if (!isMyntraUrl(url)) {
    error.textContent = 'Please paste a valid Myntra product URL.';
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Fetching…';

  try {
    const response = await fetch(`${API_BASE}/api/products/from-url?url=${encodeURIComponent(url)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Product retrieval failed.');
    showProduct(payload, url);
  } catch (err) {
    error.textContent = err.message || 'Could not retrieve the product.';
  } finally {
    button.disabled = false;
    button.textContent = 'Fetch product';
  }
});

selectButton.addEventListener('click', () => {
  if (!currentProduct) return;
  document.querySelector('#selected-message').textContent = currentProduct.url;
  selected.classList.remove('hidden');
  creative.classList.remove('hidden');
  renderCreative(currentProduct);
});
