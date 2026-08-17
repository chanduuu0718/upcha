# Product selection roadmap

## V1 — Manual URL selection

1. User finds a product on Myntra.
2. User pastes the product URL into Upcha.
3. Upcha validates the URL.
4. Upcha creates a product record and shows a preview.
5. User selects the product.
6. The selected product enters the ExtraPe conversion workflow.

## V3 — Automatic product discovery

The V1 product model is designed so automatic discovery can be added later. V3 can feed candidate products into the same preview, filtering, selection, affiliate conversion, creative, and publishing pipeline.

Potential V3 stages:

```text
Discovery source
    ↓
Candidate products
    ↓
Filters / ranking
    ↓
Product selection
    ↓
ExtraPe conversion
    ↓
Creative generation
    ↓
Pinterest publishing
```

V3 should use supported access methods and must not bypass CAPTCHA, anti-bot controls, authentication protections, or platform restrictions.
