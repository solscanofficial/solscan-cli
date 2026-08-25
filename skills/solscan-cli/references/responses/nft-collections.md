# NFT Response Fields — Collections

Field-by-field description of the JSON the `nft collections` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../nft.md](../nft.md) for flags/params). Shared envelope/error shape: [nft.md](nft.md#common-envelope).

This covers **collection-level statistics** — floor price, item count, trading volume, ranked/paginated across all collections (or filtered to one via `--collection`) — as opposed to a single collection's individual NFTs ([nft-items.md](nft-items.md)).

## `collections`

`solscan nft collections [--range 1|7|30] [--sort-by items|floor_price|volumes] [--sort-order asc|desc] [--collection <id>] [--page <n>] [--page-size <n>]`

`data` is a **flat array**, one row per collection. `--range` controls the window `volumes`/`total_vol_prev_24h` are computed over (default `1` day); `--collection` filters to a single collection ID instead of returning all.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `collection_id` | string | Collection identifier — hash format, matches `nft news`'s `collectionId` and `nft activities`'s `collection_address`, and is the value to pass as `--collection` to [`nft items`](nft-items.md). |
| `name` | string | Collection display name. |
| `symbol` | string | Collection symbol/ticker. |
| `floor_price` | number | Lowest current listing price, in SOL. |
| `items` | number | Total item count in the collection. |
| `marketplaces` | array of string | Program addresses of the marketplaces this collection trades on. |
| `volumes` | number | Trading volume over the `--range` window, in SOL. |
| `volumes_change_24h` | string | Percentage change in volume over the last 24h, e.g. `"22.36"` means +22.36% — a **string**, not a number, and already a percentage (don't divide by 100). Can be negative (e.g. `"-15.02"`) when volume dropped. |

**Example** (`solscan nft collections --sort-by volumes --sort-order desc`):

```json
{
  "success": true,
  "data": [
    {
      "collection_id": "067a2d18770c3d13eb9ce9342cbf1fa00fe155efe29c8074f7148ab72b54722e",
      "name": "Collector Crypt",
      "symbol": null,
      "floor_price": 0.35444286,
      "items": 129146,
      "marketplaces": [
        "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
        "mmm3XBJg5gk8XJxEKBvdgptZz6SgK4tXvn36sodowMc",
        "CcmRKTuZCGJBWQwMHvDYApBRvSZNHqGJXkznqpDTSQUr"
      ],
      "volumes": 302.29244023169025,
      "volumes_change_24h": "22.36"
    }
  ],
  "metadata": {}
}
```

## Interpretation tips

- `floor_price` and `volumes` are already denominated in SOL (not lamports/base units) — no decimals conversion needed, unlike `nft activities`'s `price` field.
- `volumes_change_24h` is always relative to the trailing 24h regardless of `--range` — with `--range 7`/`--range 30` it does **not** mean "change over the 7/30-day window", it's still a 24h delta; parse it (`parseFloat`) before doing arithmetic since it arrives as a string.
- Use `collection_id` (not `symbol` or `name`, which aren't guaranteed unique) as the `--collection` value when following up with [`nft items`](nft-items.md) to list a collection's individual NFTs.
