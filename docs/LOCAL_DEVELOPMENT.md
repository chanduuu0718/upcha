# Run Upcha V1 locally

## Requirements

- Node.js 18 or newer
- npm

## Windows

Double-click `start-v1.bat`, or run it from Command Prompt. It starts the backend on `http://127.0.0.1:3001` and the frontend on `http://127.0.0.1:5173`.

## macOS / Linux

Run:

```bash
chmod +x start-v1.sh
./start-v1.sh
```

Then open `http://127.0.0.1:5173`.

## Test URL

Use this Myntra product URL:

`https://www.myntra.com/mailers/topwear/force/force-men-printed-high-neck-t-shirt/41247582/buy?utm_source=social_share&utm_medium=social_share_pdp&utm_campaign=eUoaQ4bzuONKOE0M&shared=true`

The backend retrieves only publicly exposed page metadata. If Myntra blocks the request or does not expose metadata, the UI reports that instead of pretending the product was retrieved.

## Current V1 boundary

Working locally:

- URL validation
- Myntra metadata/image retrieval when publicly available
- Product preview
- Creative preview

Not yet connected:

- Live ExtraPe conversion
- Pinterest OAuth/publishing

Those integrations require their supported access credentials/configuration.
