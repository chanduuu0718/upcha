# Upcha Public Product Page

This is the public-facing product search page for Upcha.

## Flow

1. Upcha creates a product poster and affiliate link.
2. Add the product record to `products.json` with a unique Product ID.
3. The customer receives the public Upcha page URL.
4. The customer searches by Product ID or keyword.
5. Upcha displays the poster and product details.
6. **View & Shop** opens the stored affiliate URL.

## Product record

Each product uses:

- `id`: unique Product ID, such as `UP001`
- `name`: product name
- `category`: product category
- `price`: displayed price text
- `description`: short product description
- `keywords`: search terms
- `posterUrl`: public poster/image URL
- `affiliateUrl`: Cuelinks affiliate/tracking URL

Do not put private API keys or access tokens in this folder. `products.json` is public and must contain only URLs/data that are safe for public users to see.
