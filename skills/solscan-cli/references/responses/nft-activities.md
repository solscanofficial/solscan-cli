# NFT Response Fields — Activities

Field-by-field description of the JSON the `nft activities` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../nft.md](../nft.md) for flags/params). Shared envelope/error shape: [nft.md](nft.md#common-envelope).

This covers **marketplace activity** — sales, listings, bids, and price changes — as opposed to newly minted NFTs ([nft-news.md](nft-news.md)) or collection-level stats ([nft-collections.md](nft-collections.md)).

## `activities`

`solscan nft activities [--token <mint>] [--collection <id>] [--from <addr>] [--to <addr>] [--source <addrs>] [--activity-type <types>] [--currency-token <mint>] [--price <min>,<max>] [--from-time <unix>] [--to-time <unix>] [--page <n>] [--page-size <n>]`

`data` is a **flat array** of activity rows — one per marketplace event.

## Fields

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the activity occurred in. |
| `trans_id` | string | Transaction signature. |
| `block_time` | number | Unix timestamp (seconds). |
| `time` | string | ISO 8601 timestamp — same instant as `block_time`, formatted for display. |
| `activity_type` | string | One of `ACTIVITY_NFT_SOLD`, `ACTIVITY_NFT_LISTING`, `ACTIVITY_NFT_BIDDING`, `ACTIVITY_NFT_CANCEL_BID`, `ACTIVITY_NFT_CANCEL_LIST`, `ACTIVITY_NFT_REJECT_BID`, `ACTIVITY_NFT_UPDATE_PRICE`, `ACTIVITY_NFT_LIST_AUCTION` — same enum as the `--activity-type` filter in [../nft.md](../nft.md). |
| `from_address` | string | Address the activity originated from (e.g. the lister/bidder/seller). Empty string when not applicable to the activity type. |
| `to_address` | string | Address the activity is directed to (e.g. the buyer). Empty string when not applicable. |
| `token_address` | string | The NFT's mint address. |
| `marketplace_address` | string | Program/market address the activity happened on. |
| `collection_address` | string | Collection identifier — hash format, matches `nft news`'s `collectionId` (not a Solana pubkey). |
| `amount` | number | NFT amount (normally `1`). |
| `price` | number | Price **in the smallest unit of `currency_token`** — divide by `10 ** currency_decimals` for a human-readable amount (e.g. `1316000000` lamports ÷ `10^9` = `1.316` SOL). |
| `currency_token` | string | Mint address of the currency the price is denominated in (e.g. wrapped SOL `So11111111111111111111111111111111111111112`). |
| `currency_decimals` | number | Decimals for `currency_token` — required to convert `price` into a human-readable amount. |

**Example** (`solscan nft activities --activity-type ACTIVITY_NFT_UPDATE_PRICE`):

```json
{
  "success": true,
  "data": [
    {
      "block_id": 276338494,
      "trans_id": "2BFpcL7MYfuAPGwXWX5YWghHJtJHpq5A62pZT5qfQrsQSU2ja5okLiWiSHDUSTzFxsgDcox6TdbjkvXjncgFXZwP",
      "block_time": 1720420818,
      "time": "2024-07-08T06:40:18.000Z",
      "activity_type": "ACTIVITY_NFT_UPDATE_PRICE",
      "from_address": "sorpyYr8gyreU9s8fPxxu3Erm7XZz4JE7ynTRMFNKTg",
      "to_address": "",
      "token_address": "2Y8WGuu5FuT2xAL92UPUCVbBTHt1fVrNcL6tbpnCn7zf",
      "marketplace_address": "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
      "collection_address": "9eccb05f1b5fc4ca5ad9f54dbbc4b481ec2c8016493c76be94cfbd060dbcefc9",
      "amount": 1,
      "price": 1316000000,
      "currency_token": "So11111111111111111111111111111111111111112",
      "currency_decimals": 9
    }
  ],
  "metadata": {}
}
```

## Interpretation tips

- `price` is always in `currency_token`'s base units, never USD — if the user wants a USD figure, resolve `currency_token`'s price separately via `token price-latest`.
- `to_address` is empty on non-transfer activity types like `ACTIVITY_NFT_UPDATE_PRICE`/`ACTIVITY_NFT_LISTING` — only sales (`ACTIVITY_NFT_SOLD`) reliably populate both `from_address` and `to_address`.
- The `--block-time` query parameter (a start/stop pair; deprecated in favor of `--from-time`/`--to-time`) is unrelated to this response's `block_time` field (a single per-row timestamp) — same name, different shape, don't confuse the two.
- `collection_address` is the hash-style ID (matches `nft news`'s `collectionId`), not the pubkey-style `collectionKey` — use it to cross-reference `nft collections`' `collection_id` ([nft-collections.md](nft-collections.md)), not as a direct Solana address lookup.
