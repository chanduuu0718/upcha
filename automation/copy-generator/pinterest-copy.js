export function generatePinterestCopy(product) {
  const name = product.name?.trim() || 'Featured find';
  const category = product.category?.trim() || 'Fashion';

  return {
    title: `${name} | ${category}`.slice(0, 100),
    description: `Discover this ${category.toLowerCase()} pick and explore the details. Save this idea for later and shop through the provided link.`,
    keywords: [category, 'fashion', 'style', 'shopping', 'outfit ideas'],
  };
}
