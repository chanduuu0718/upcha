# ExtraPe adapter

The ExtraPe integration accepts a validated Myntra URL and returns an affiliate destination URL.

Expected interface:

```text
convert(url) -> {
  status,
  originalUrl,
  affiliateUrl,
  provider: "extrape"
}
```

Credentials/configuration belong in environment variables. The adapter must not hard-code tokens or credentials.

Until a supported ExtraPe API/automation interface is configured, the workflow should expose a manual conversion fallback rather than pretending conversion succeeded.
