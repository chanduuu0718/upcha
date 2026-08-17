# Creative Generator

Generates Pinterest-ready promotional creatives from a selected product record.

## Pipeline

```text
Selected product
    ↓
Product metadata
    ↓
Template selection
    ↓
Creative rendering
    ↓
Pinterest vertical image
```

## V1 templates

- `clean-product` — minimal product-first layout
- `deal-alert` — discount/deal-focused layout
- `style-inspiration` — lifestyle/fashion-focused layout

The generator must not invent prices, discounts, ratings, or product claims. Missing fields should be omitted or marked as unavailable.

## Future V3

Automatic product discovery can feed candidates into this same generator. The creative layer stays independent of how the product was selected.
