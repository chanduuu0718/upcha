function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawCover(ctx, image, box) {
  if (!image) return;
  const scale = Math.max(box.w / image.width, box.h / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
}

function drawContain(ctx, image, box) {
  if (!image) return;
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
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
  lines.slice(0, maxLines).forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

export async function renderCreative(product) {
  const canvas = document.querySelector('#creative-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const name = product.name || 'Featured product';
  const price = product.price != null ? `₹${product.price}` : '';
  const originalPrice = product.originalPrice != null ? `₹${product.originalPrice}` : '';
  const discount = product.discountPercent != null ? `${product.discountPercent}% OFF` : '';
  const retailer = product.retailer || 'Online Store';
  const urls = [...new Set((product.selectedImageUrls?.length ? product.selectedImageUrls : product.imageUrls || [product.imageUrl]).filter(Boolean))].slice(0, 4);
  const images = await Promise.all(urls.map(loadImage));
  const usableImages = images.filter(Boolean);

  ctx.fillStyle = '#111111';
  ctx.font = '800 42px Arial';
  ctx.fillText(retailer.toUpperCase(), 70, 82);

  ctx.fillStyle = '#737373';
  ctx.font = '500 26px Arial';
  ctx.fillText('SHOP THE LOOK', 70, 122);

  const gallery = { x: 60, y: 155, w: 880, h: 930, gap: 14 };
  const count = Math.max(1, Math.min(4, usableImages.length));
  const boxes = count === 1
    ? [{ x: gallery.x, y: gallery.y, w: gallery.w, h: gallery.h }]
    : count === 2
      ? [
          { x: gallery.x, y: gallery.y, w: (gallery.w - gallery.gap) / 2, h: gallery.h },
          { x: gallery.x + (gallery.w + gallery.gap) / 2, y: gallery.y, w: (gallery.w - gallery.gap) / 2, h: gallery.h },
        ]
      : [
          { x: gallery.x, y: gallery.y, w: (gallery.w - gallery.gap) / 2, h: (gallery.h - gallery.gap) / 2 },
          { x: gallery.x + (gallery.w + gallery.gap) / 2, y: gallery.y, w: (gallery.w - gallery.gap) / 2, h: (gallery.h - gallery.gap) / 2 },
          { x: gallery.x, y: gallery.y + (gallery.h + gallery.gap) / 2, w: (gallery.w - gallery.gap) / 2, h: (gallery.h - gallery.gap) / 2 },
          { x: gallery.x + (gallery.w + gallery.gap) / 2, y: gallery.y + (gallery.h + gallery.gap) / 2, w: (gallery.w - gallery.gap) / 2, h: (gallery.h - gallery.gap) / 2 },
        ];

  boxes.forEach((box, index) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 20);
    ctx.clip();
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(box.x, box.y, box.w, box.h);
    drawContain(ctx, usableImages[index], box);
    ctx.restore();
  });

  ctx.fillStyle = '#111111';
  ctx.font = '800 42px Arial';
  drawWrappedText(ctx, name, 70, 1160, 860, 52, 2);

  let y = 1285;
  if (price) {
    ctx.fillStyle = '#111111';
    ctx.font = '800 64px Arial';
    ctx.fillText(price, 70, y);
  }
  if (originalPrice) {
    const priceX = price ? 70 + ctx.measureText(price).width + 26 : 70;
    ctx.fillStyle = '#888888';
    ctx.font = '400 34px Arial';
    ctx.fillText(originalPrice, priceX, y);
  }
  if (discount) {
    const discountX = 70;
    ctx.fillStyle = '#111111';
    ctx.font = '800 30px Arial';
    ctx.fillText(discount, discountX, y + 52);
  }

  const ctaY = 1400;
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(70, ctaY, 860, 70, 18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SHOP NOW  →', width / 2, ctaY + 46);
  ctx.textAlign = 'start';

  try { return canvas.toDataURL('image/png'); } catch { return null; }
}
