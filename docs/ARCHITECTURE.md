# Upcha Architecture

## Core workflow

```text
Myntra product
    ↓
Product URL capture
    ↓
ExtraPe link conversion
    ↓
Product metadata + image
    ↓
Pinterest creative generation
    ↓
Pin title + description + destination URL
    ↓
Pinterest publish/schedule
```

## Planned modules

### Product source
- Product URL input
- Myntra product metadata extraction
- Product validation and deduplication

### Affiliate conversion
- ExtraPe adapter
- Conversion status tracking
- Retry and error handling

### Creative engine
- Pinterest vertical image templates
- Product image handling
- SEO title/description/keyword generation

### Pinterest publisher
- OAuth/token management
- Board selection
- Pin creation
- Scheduling queue
- Publish status and retries

## Security

Never store API keys, OAuth tokens, cookies, or passwords in source control. Use environment variables or a production secret manager.

## Compliance

Use official APIs or supported integrations wherever available. Do not build around bypassing CAPTCHA, anti-bot controls, authentication protections, or platform restrictions.
