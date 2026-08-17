const canvas = document.querySelector('#creative');
const ctx = canvas.getContext('2d');
const generateButton = document.querySelector('#generate');
const downloadButton = document.querySelector('#download');
const status = document.querySelector('#status');
const templateSelect = document.querySelector('#template');

const field = (id) => document.querySelector(`#${id}`);

function wrapText(text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 1000, 1500);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#f3f4f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 1500);
}

function drawImage(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(false);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const box = { x: 90, y: 240, w: 820, h: 820 };
      const scale = Math.min(box.w / image.width, box.h / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = imageUrl;
  });
}

function drawPlaceholder() {
  ctx.fillStyle = '#e5e7eb';
  ctx.roundRect(90, 240, 820, 820, 28);
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.font = '600 34px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('PRODUCT IMAGE', 500, 650);
}

function drawText(template, name, category, price) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = '800 30px system-ui';
  ctx.fillText(template === 'deal-alert' ? 'DEAL ALERT' : template === 'style-inspiration' ? 'YOUR NEXT LOOK' : category.toUpperCase(), 90, 105);

  const headline = template === 'deal-alert' ? 'A look worth discovering' : template === 'style-inspiration' ? name : 'Trending style, made simple';
  const lines = wrapText(headline, 820, '800 64px system-ui');
  ctx.font = '800 64px system-ui';
  lines.forEach((line, i) => ctx.fillText(line, 90, 1160 + i * 72));

  if (price) {
    ctx.fillStyle = '#374151';
    ctx.font = '700 38px system-ui';
    ctx.fillText(price, 90, 1380);
  }

  ctx.fillStyle = '#111827';
  ctx.font = '800 30px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText(template === 'clean-product' ? 'SHOP THE LOOK →' : template === 'deal-alert' ? 'DISCOVER DEAL →' : 'DISCOVER MORE →', 910, 1435);
}

async function render() {
  status.textContent = 'Creating your creative…';
  drawBackground();
  const imageLoaded = await drawImage(field('imageUrl').value.trim());
  if (!imageLoaded) drawPlaceholder();
  drawText(templateSelect.value, field('productName').value.trim() || 'Trending Style', field('category').value.trim() || 'Fashion', field('price').value.trim());
  downloadButton.disabled = false;
  status.textContent = imageLoaded ? 'Creative ready ✓' : 'Creative ready. Add a product image URL for the real product photo.';
}

generateButton.addEventListener('click', render);
templateSelect.addEventListener('change', render);
document.querySelectorAll('[data-template]').forEach((button) => {
  button.addEventListener('click', () => {
    templateSelect.value = button.dataset.template;
    render();
  });
});

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `upcha-${templateSelect.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

render();
