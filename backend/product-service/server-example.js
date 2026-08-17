import { retrieveMyntraProduct } from './myntra-image-retriever.js';

/**
 * Framework-neutral handler example. Wire this into the backend framework
 * selected for Upcha and expose it as POST /api/products/myntra.
 */
export async function handleMyntraProduct(request) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'url is required' }, { status: 400 });

    const product = await retrieveMyntraProduct(url);
    return Response.json({ product });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 422 });
  }
}
