export function renderCreative(product) {
  return new Promise((resolve) => {
    const canvas = document.querySelector('#creative-canvas');
    if (!canvas) return resolve(null);

    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    const width = canvas.width;
    const height = canvas.height;
    const imageBox = { x: 70, y: 330, w: 860, h: 720 };

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
    ctx.fillText("MEN'S STYLE", 70, 260);

    ctx.fillStyle = '#ebe6df';
    ctx.fillRect(imageBox.x, imageBox.y, imageBox.w, imageBox.h);

    const drawDetails = () => {
      ctx.fillStyle = '#111111';
      ctx.font = '700 42px Arial';
      const name = product.name || 'Featured product';
      const maxWidth = 860;
      let title = name;
      while (ctx.measureText(title).width > maxWidth && title.length > 10) title = `${title.slice(0, -4)}...`;
      ctx.fillText(title, 70, 1150);

      ctx.font = '700 48px Arial';
      if (product.price != null) ctx.fillText(`₹${product.price}`, 70, 1230);

      ctx.fillStyle = '#111111';
      ctx.font = '800 34px Arial';
      ctx.fillText('SHOP THE LOOK →', 70, 1380);

      try {
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
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
