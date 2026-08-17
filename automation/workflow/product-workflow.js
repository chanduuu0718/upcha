import { generatePinterestCopy } from '../copy-generator/pinterest-copy.js';

export function buildWorkflow(product, affiliateUrl) {
  if (!product?.url) throw new Error('Product URL is required');
  if (!affiliateUrl) throw new Error('Affiliate URL is required before publishing');

  return {
    product,
    affiliateUrl,
    pinterest: generatePinterestCopy(product),
    creative: {
      template: 'clean-product',
      width: 1000,
      height: 1500,
      imageUrl: product.imageUrl || null,
    },
    approvalRequired: true,
    status: 'ready-for-preview',
  };
}
