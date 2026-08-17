# Upcha end-to-end flow

```text
1. User pastes Myntra product URL
                 ↓
2. Validate + normalize URL
                 ↓
3. Retrieve supported product metadata
                 ↓
4. User confirms product
                 ↓
5. Convert original URL through ExtraPe
                 ↓
6. Verify affiliate URL exists
                 ↓
7. Generate Pinterest title + description + keywords
                 ↓
8. Render a new 1000×1500 promotional creative
                 ↓
9. User previews and approves
                 ↓
10. Publish through supported Pinterest API/auth flow
```

## Failure handling

- Invalid Myntra URL → stop at validation.
- Metadata unavailable → ask for required product information rather than inventing it.
- ExtraPe conversion unavailable → show manual conversion fallback; do not mark success.
- Creative rendering fails → allow retry/template change.
- Pinterest publish fails → keep the approved asset and destination URL for retry.

## V3 compatibility

Automatic product discovery will produce the same normalized product object used by step 4. Therefore V3 can plug into the existing pipeline without changing affiliate conversion, creative generation, copy generation, approval, or publishing contracts.
