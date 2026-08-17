import { renderCreative } from './creative.js';

const form = document.querySelector('#product-form');
const input = document.querySelector('#myntra-url');
const error = document.querySelector('#error');
const preview = document.querySelector('#preview');
const selected = document.querySelector('#selected');
const selectButton = document.querySelector('#select-product');
const creative = document.querySelector('#creative');

let currentProduct = null;

const demoProducts = {
  '41247582': {
    productId: '41247582',
    brand: 'Force',
    name: 'Men Printed High Neck T-shirt',
    category: "Men's T-shirts",
    color: 'Pink',
    price: 499,
    mrp: 1999,
    discountPercent: 75,
    rating: 3.6,
    ratingCount: 86,
    fit: 'Relaxed Fit',
    material: 'Knitted Cotton',
    imageUrl: null,
  },
};

function isMyntraUrl(value) {
  try {
    const url = new URL(value);
    return /(^|\.)myntra\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function productIdFromUrl(value) {
  const match = value.match(/\/(\d+)\/buy(?:\?|$)/i);
  return match?.[1] || null;
}

function showProduct(product, url) {
  currentProduct = { ...product, url };
  document.querySelector('#product-name').textContent = `${product.brand} — ${product.name}`;
  document.querySelector('#product-url').textContent = url;
  document.querySelector('#product-price').textContent = `₹${product.price} · ${product.discountPercent}% OFF`;
  document.querySelector('#product-category').textContent = `${product.category} · ${product.color}`;
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

  const id = productIdFromUrl(url);
  const product = demoProducts[id];

  if (!product) {
    error.textContent = 'Product URL is valid, but live product metadata is not connected yet.';
    return;
  }

  showProduct(product, url);
});

selectButton.addEventListener('click', () => {
  if (!currentProduct) return;
  document.querySelector('#selected-message').textContent = currentProduct.url;
  selected.classList.remove('hidden');
  creative.classList.remove('hidden');
  renderCreative(currentProduct);
});
