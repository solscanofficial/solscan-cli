# NFT Response Fields

Field-by-field description of the JSON each `nft <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../nft.md](../nft.md) for flags/params).

This index only holds the envelope shared by every action. Field-level docs live in one file per action:

| File | Covers | Action |
|------|--------|--------|
| [nft-news.md](nft-news.md) | Newly minted NFTs, with on-chain + off-chain metadata | `news` |
| [nft-activities.md](nft-activities.md) | Marketplace activity — sales, listings, bids, price updates | `activities` |
| [nft-collections.md](nft-collections.md) | Collection-level stats — floor price, volume, item count | `collections` |
| [nft-items.md](nft-items.md) | Individual items inside one collection, with last-trade info | `items` |

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | array | The actual payload — always an array for every NFT action, one object per NFT/collection/activity row. |
| `metadata` | object | Present on every NFT action's live response but observed empty (`{}`) in practice — not documented in Solscan's published API reference. Likely reserved for future use (e.g. pagination totals); don't rely on it carrying any fields today. |

On failure (`400`/`401`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |
