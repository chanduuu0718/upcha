# Upcha V1 public deployment plan

Upcha V1 is now structured as a public-facing creator workspace with a browser frontend and a separate Node API.

## Production shape

- Frontend: static Vite site from `frontend/product-selector`
- API: Node 20+ service from `backend/`
- Product source integrations remain server-side.
- Cuelinks credentials remain server-side.
- Browser origins are controlled with `ALLOWED_ORIGINS`.

## Required production environment

Copy `.env.example` and configure:

```
NODE_ENV=production
PORT=3002
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-public-domain.example
CUELINKS_API_KEY=your-server-side-key
CUELINKS_SHORTEN_LINKS=true
PRODUCT_TIMEOUT_MS=12000
RATE_WINDOW_MS=60000
RATE_LIMIT=60
```

Never commit the real `.env` file or API keys.

## Before launch

1. Deploy the API to a Node-compatible HTTPS host.
2. Set `ALLOWED_ORIGINS` to the exact public frontend origin.
3. Confirm `GET /api/health` returns `ok: true`.
4. Deploy the contents of `frontend/product-selector` as the static frontend.
5. Set the frontend API base to the public API URL using `window.UPCHA_API_BASE` before loading `app.js`, or place the frontend and API behind one origin with an `/api` reverse proxy.
6. Test a Myntra URL and a Nykaa Fashion URL.
7. Test Cuelinks conversion without exposing the Cuelinks key in browser developer tools.
8. Confirm HTTPS, rate limiting and error handling.
9. Add a production support/contact page and verify the privacy policy before opening the service to general users.

## Important V1 limitations

Upcha currently extracts publicly exposed product metadata from retailer pages. Retailer page changes, anti-bot controls or unavailable metadata can cause a product lookup to fail. The public launch should present this as a supported-source workflow, not as a guaranteed retailer API.

Pinterest publishing is not part of the basic public creator flow yet; keep that integration behind its own configuration and permissions.

## Local verification

From the repository:

```
cd backend
npm install
npm start
```

Then serve `frontend/product-selector` with its Vite workflow and point `window.UPCHA_API_BASE` at the local API.

## Security

- Keep Cuelinks and Pinterest credentials on the server.
- Use HTTPS in production.
- Restrict CORS with `ALLOWED_ORIGINS`.
- Do not expose API keys in frontend source.
- Keep rate limiting enabled.
- Monitor API errors and retailer failures.
