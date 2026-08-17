const form = document.querySelector('#product-form');
const input = document.querySelector('#myntra-url');
const error = document.querySelector('#error');
const preview = document.querySelector('#preview');
const selected = document.querySelector('#selected');
const selectButton = document.querySelector('#select-product');

let currentProduct = null;

function isMyntraUrl(value) {
  try {
    const url = new URL(value);
    return /(^|\.)myntra\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function showProduct(product) {
  currentProduct = product;
  document.querySelector('#product-name').textContent = product.name;
  document.querySelector('#product-url').textContent = product.url;
  document.querySelector('#product-price').textContent = product.price ?? 'Not available';
  document.querySelector('#product-category').textContent = product.category ?? 'Myntra product';
  preview.classList.remove('hidden');
  selected.classList.add('hidden');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const url = input.value.trim();

  if (!isMyntraUrl(url)) {
    error.textContent = 'Please paste a valid Myntra product URL.';
    return;
  }

  // V1 keeps extraction intentionally small and safe. The backend adapter can
  // replace this mock preview with official/supported metadata retrieval later.
  showProduct({
    name: 'Myntra product',
    url,
    price: 'Pending metadata fetch',
    category: 'Myntra',
  });
});

selectButton.addEventListener('click', () => {
  if (!currentProduct) return;
  document.querySelector('#selected-message').textContent = currentProduct.url;
  selected.classList.remove('hidden');
});
