# Creative service

API boundary for turning a selected product into one or more Pinterest-ready images.

## Planned endpoint

`POST /api/creatives/preview`

Input:

```json
{
  "productId": "product-id",
  "template": "clean-product"
}
```

Output should contain a generated asset reference and the exact copy used by the creative.

The implementation should support deterministic template rendering first. AI-assisted copy/image generation can be added behind the same service interface later.
