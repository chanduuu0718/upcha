export function renderCreative(product) {
  return new Promise((resolve) => {
    const canvas = document.querySelector('#creative-canvas');
    if (!canvas) return resolve(null);

    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    const width = canvas.width;
    const height = canvas.height;
    const imageBox = { x: 80, y: 130, w: 840, h: 980 };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const name = product.name || 'Featured product';
    const price = product.price != null ? `₹${product.price}` : '';
    const originalPrice = product.originalPrice != null ? `₹${product.originalPrice}` : '';
    const discount = product.discountPercent != null ? `${product.discountPercent}% OFF` : '';
    const retailer = product.retailer || 'Online Store';

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(imageBox.x, imageBox.y, imageBox.w, imageBox.h);

    const drawDetails = () => {
      ctx.fillStyle = '#111111';
      ctx.font = '800 46px Arial';
      const maxWidth = 840;
      const words = name.split(/\s+/);
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
      lines.slice(0, 3).forEach((text, index) => ctx.fillText(text, 80, 1190 + index * 58));

      let y = 1375;
      if (price) {
        ctx.fillStyle = '#111111';
        ctx.font = '800 58px Arial';
        ctx.fillText(price, 80, y);
      }
      if (originalPrice) {
        const priceX = price ? 80 + ctx.measureText(price).width + 28 : 80;
        ctx.fillStyle = '#777777';
        ctx.font = '400 34px Arial';
        ctx.fillText(originalPrice, priceX, y);
      }
      if (discount) {
        ctx.fillStyle = '#111111';
        ctx.font = '800 32px Arial';
        ctx.fillText(discount, 80, y + 55);
      }

      ctx.fillStyle = '#111111';
      ctx.font = '700 34px Arial';
      ctx.fillText(`${retailer}  •  SHOP NOW →`, 80, 1470);

      try { resolve(canvas.toDataURL('image/png')); } catch { resolve(null); }
    };

    if (!product.imageUrl) {
      drawDetails();
      return;
    }

    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    image.onload = () => {
      const scale = Math.min(imageBox.w / image.width, imageBox.h / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, imageBox.x + (imageBox.w - w) / 2, imageBox.y + (imageBox.h - h) / 2, w, h);
      drawDetails();
    };
    image.onerror = () => drawDetails();
    image.src = product.imageUrl;
  });
}
