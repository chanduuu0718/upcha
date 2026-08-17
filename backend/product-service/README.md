# Product service

V1 responsibilities:

- Accept a Myntra product URL.
- Validate that the URL belongs to Myntra.
- Normalize the product URL by removing tracking/query parameters for storage.
- Retrieve supported product metadata.
- Store a normalized product record.
- Expose an adapter boundary for supported image/metadata retrieval.

The product model supports brand, name, category, imageUrl, price, mrp, discountPercent, rating and ratingCount. Missing fields remain null; the service must not invent them.

A real product fixture is included under `fixtures/force-41247582.json` for development/testing.

The adapter is intentionally separated so V3 automatic product discovery can later reuse the same product model and selection pipeline without redesigning the UI.
