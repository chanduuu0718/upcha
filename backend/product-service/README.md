# Product service

V1 responsibilities:

- Accept a Myntra product URL.
- Validate that the URL belongs to Myntra.
- Store a normalized product record.
- Expose a clean adapter boundary for supported metadata retrieval.

The adapter is intentionally separated so V3 automatic product discovery can later reuse the same product model and selection pipeline without redesigning the UI.
