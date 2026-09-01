import { renderCreative } from './creative.js';

const API_BASE = window.UPCHA_API_BASE || 'http://127.0.0.1:3001';
const form = document.querySelector('#product-form');
const input = document.querySelector('#product-url-input');
const error = document.querySelector('#error');
const preview = document.querySelector('#preview');
const selected = document.querySelector('#selected');
const selectButton = document.querySelector('#select-product');
const creative = document.querySelector('#creative');
const affiliate = document.querySelector('#affiliate');
const convertButton = document.querySelector('#convert-affiliate');
const affiliateError = document.querySelector('#affiliate-error');
const affiliateResult = document.querySelector('#affiliate-result');
const affiliateLink = document.querySelector('#affiliate-link');
const affiliateCampaign = document.querySelector('#affiliate-campaign');
const imagePlaceholder = document.querySelector('#image-placeholder');
const selectedMessage = document.querySelector('#selected-message');
const retailerSelect = document.querySelector('#retailer');

let currentProduct = null;

function supportedRetailer(value) {
  try {
    const hostname = new URL(value).hostname;
    if (/(^|\.)myntra\.com$/i.test(hostname)) return 'Myntra';
    if (/(^|\.)nykaafashion\.com$/i.test(hostname)) return 'Nykaa Fashion';
  } catch {}
  return null;
}

function showProduct(product, url) {
  currentProduct = { ...product, url };
  document.querySelector('#product-name').textContent = product.name || 'Product';
  document.querySelector('#product-url').textContent = url;
  document.querySelector('#product-price').textContent = product.price != null ? `₹${product.price}` : 'Not available';
  document.querySelector('#product-category').textContent = product.category || product.retailer || 'Product';
  document.querySelector('#product-retailer').textContent = product.retailer || '—';
  imagePlaceholder.replaceChildren();
  if (product.imageUrl) {
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.name || 'Product image';
    image.referrerPolicy = 'no-referrer';
    image.className = 'product-image';
    image.onerror = () => { imagePlaceholder.textContent = 'Product image could not be displayed.'; };
    imagePlaceholder.appendChild(image);
  } else imagePlaceholder.textContent = 'Product image unavailable';
  preview.classList.remove('hidden');
  selected.classList.add('hidden');
  creative.classList.add('hidden');
  affiliate.classList.add('hidden');
  affiliateResult.classList.add('hidden');
  affiliateError.textContent = '';
}

async function selectProduct() {
  if (!currentProduct) { error.textContent = 'Fetch a product first.'; return; }
  selectButton.disabled = true;
  selectButton.textContent = 'Creating…';
  error.textContent = '';
  try {
    selectedMessage.textContent = `Selected: ${currentProduct.name || 'Product'}`;
    selected.classList.remove('hidden');
    creative.classList.remove('hidden');
    affiliate.classList.remove('hidden');
    await renderCreative(currentProduct);
    creative.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    creative.classList.add('hidden');
    affiliate.classList.add('hidden');
    error.textContent = `Creative generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
  } finally {
    selectButton.disabled = false;
    selectButton.textContent = 'Select product';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const url = input.value.trim();
  const detected = supportedRetailer(url);
  if (!detected) { error.textContent = 'Please paste a valid Myntra or Nykaa Fashion product URL.'; return; }
  if (retailerSelect) retailerSelect.value = detected;

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Fetching…';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${API_BASE}/api/products/from-url?url=${encodeURIComponent(url)}`, { signal: controller.signal });
    clearTimeout(timeout);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Product retrieval failed.');
    showProduct(payload, url);
  } catch (err) {
    error.textContent = err.name === 'AbortError' ? 'Product retrieval timed out. Please try again.' : (err.message || 'Could not retrieve the product.');
  } finally {
    button.disabled = false;
    button.textContent = 'Fetch product';
  }
});

selectButton.addEventListener('click', selectProduct);

convertButton.addEventListener('click', async () => {
  if (!currentProduct) return;
  affiliateError.textContent = '';
  affiliateResult.classList.add('hidden');
  convertButton.disabled = true;
  convertButton.textContent = 'Converting…';
  try {
    const response = await fetch(`${API_BASE}/api/affiliate/convert`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: currentProduct.url }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Cuelinks conversion failed.');
    const destination = payload.shortUrl || payload.trackingUrl;
    affiliateLink.href = destination;
    affiliateLink.textContent = destination;
    affiliateCampaign.textContent = payload.campaign ? `Campaign: ${payload.campaign.name}` : 'No campaign matched this URL.';
    document.querySelector('#affiliate-status').textContent = payload.affiliated ? 'Affiliate link ready ✓' : 'Tracking link created — commission eligibility not confirmed';
    affiliateResult.classList.remove('hidden');
  } catch (err) { affiliateError.textContent = err.message || 'Could not convert the URL.'; }
  finally { convertButton.disabled = false; convertButton.textContent = 'Convert with Cuelinks'; }
});
