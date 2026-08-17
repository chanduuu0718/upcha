export function renderCreative(product) {
  const canvas = document.querySelector('#creative-canvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f7f4ef';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111111';
  ctx.font = '800 34px Arial';
  ctx.fillText('UPCHA STYLE FIND', 70, 90);

  ctx.fillStyle = '#7a1f2b';
  ctx.font = '800 72px Arial';
  ctx.fillText('TRENDING', 70, 180);
  ctx.fillStyle = '#111111';
  ctx.fillText('MEN\'S STYLE', 70, 260);

  const imageBox = { x: 70, y: 330, w: 860, h: 720 };
  ctx.fillStyle = '#ebe6df';
  ctx.fillRect(imageBox.x, imageBox.y, imageBox.w, imageBox.h);

  if (product.imageUrl) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const scale = Math.min(imageBox.w / image.width, imageBox.h / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, imageBox.x + (imageBox.w - w) / 2, imageBox.y + (imageBox.h - h) / 2, w, h);
      drawDetails();
    };
    image.src = product.imageUrl;
  }

  function drawDetails() {
    ctx.fillStyle = '#111111';
    ctx.font = '700 42px Arial';
    ctx.fillText(product.name || 'Featured product', 70, 1150, 860);
    ctx.font = '700 48px Arial';
    if (product.price != null) ctx.fillText(`₹${product.price}`, 70, 1230);
    if (product.discountPercent != null) {
      ctx.fillStyle = '#7a1f2b';
      ctx.font = '700 36px Arial';
      ctx.fillText(`${product.discountPercent}% OFF`, 250, 1230);
    }
    ctx.fillStyle = '#111111';
    ctx.font = '800 34px Arial';
    ctx.fillText('SHOP THE LOOK →', 70, 1380);
  }

  drawDetails();
  return canvas.toDataURL('image/png');
}
