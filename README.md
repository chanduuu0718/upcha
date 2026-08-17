# Upcha

Myntra → ExtraPe → Pinterest automation platform.

## Goal

Upcha helps turn selected Myntra products into Pinterest-ready affiliate content:

1. Select a Myntra product.
2. Capture the product URL.
3. Convert the URL through ExtraPe.
4. Prepare product media and Pinterest copy.
5. Publish or schedule the Pin through supported Pinterest publishing methods.

## Project structure

- `backend/` — API and integrations
- `frontend/` — dashboard UI
- `automation/` — workflow orchestration
- `generated/` — local generated artifacts (not committed)
- `docs/` — architecture and implementation notes

## Important

Credentials and affiliate tokens must be stored in environment variables and never committed to Git.
