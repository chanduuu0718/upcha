# Pinterest adapter

Pinterest publishing boundary.

Expected interface:

```text
publish({
  boardId,
  imageUrl,
  title,
  description,
  destinationUrl
}) -> {
  status,
  pinId,
  url
}
```

Use Pinterest's supported API/authentication flow. OAuth credentials must be stored in environment variables or a secret manager and never committed.

The V1 workflow keeps publishing behind an approval step so the user can review the creative and destination URL before publication.
