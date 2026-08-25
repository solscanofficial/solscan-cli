# NFT Response Fields — Items

Field-by-field description of the JSON the `nft items` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../nft.md](../nft.md) for flags/params). Shared envelope/error shape: [nft.md](nft.md#common-envelope).

This covers **the individual NFTs inside one collection**, each with its last-trade info attached — as opposed to collection-level aggregate stats ([nft-collections.md](nft-collections.md)) or a cross-collection activity feed ([nft-activities.md](nft-activities.md)).

## `items`

`solscan nft items --collection <id> [--sort-by last_trade|listing_price] [--page <n>] [--page-size <n>]`

`data` is an **array**; each row splits into two objects: `stats` (the item's most recent market event — a trade or an active listing) and `info` (identity + metadata — same on-chain/off-chain split as [`nft news`](nft-news.md#infodata)).

### `stats`

Shape depends on `--sort-by` / the row's `type`, because "stats" covers two different kinds of market event, not just completed trades:

| Field | Type | Description |
|-------|------|--------------|
| `trade_time` | number | Unix timestamp (seconds) of the trade. **Present only when `type` is a completed trade (e.g. `"Buy"`)** — absent on active listings. |
| `signature` | string | Transaction signature of the event. |
| `market_id` | string | Marketplace program address the event happened on. |
| `type` | string | Event type — observed values include `"Buy"` (a completed trade; seen when sorting `--sort-by last_trade`) and `"Listing"` (an active ask with no counterparty yet; seen when sorting `--sort-by listing_price`). |
| `price` | string | Price in the smallest unit of `currency_token` — **a string here**, unlike [`nft activities`](nft-activities.md)'s numeric `price`; parse it before dividing by `10 ** currency_decimals`. |
| `currency_token` | string | Mint address of the currency the price is denominated in. |
| `currency_decimals` | number | Decimals for `currency_token`. |
| `seller` | string | Seller's (or lister's) wallet address. |
| `buyer` | string | Buyer's wallet address. **Present only on completed trades** — omitted entirely on `"Listing"` rows, since there's no buyer yet. |

### `info`

Same shape as [`nft news`'s `info`](nft-news.md#info) (`address`, `data`, `meta`, etc. — see that file for the full on-chain-vs-off-chain field tables and their casing overlaps), plus extra top-level fields on `items`, and **snake_case** instead of `nft news`'s camelCase on the shared ones:

| Field | Type | Description |
|-------|------|--------------|
| `token_name` | string | Convenience copy of the NFT's name (same value as `info.data.name`/`info.meta.name`). |
| `token_symbol` | string | Convenience copy of the NFT's symbol. |
| `collection_id` | string | Same collection hash ID as `nft news`'s `collectionId` and `nft collections`'s `collection_id` — snake_case here vs. camelCase (`collectionId`) in `nft news`. |
| `mint_tx` | string | Same as `nft news`'s `mintTx` — snake_case here vs. camelCase there. |
| `created_time` | number \| null | Same as `nft news`'s `createdTime`, but **frequently `null`** on this action in practice — off-chain indexing for older/less-active mints doesn't always backfill it. Don't treat `null` here as an error. |

One more divergence buried inside `info.meta.properties`: `properties.creators[]` entries (when present) generally carry only `address` and `share` — **no `verified` key at all** in most live responses, despite Solscan's published example showing a boolean `verified: true`. Treat `properties.creators[].verified` as optional and possibly boolean when it does appear; don't confuse it with the always-present, numeric `info.data.creators[].verified` (`0`/`1`).

**Example** (`solscan nft items --collection 379049a2aa989f41301850d2a826413e02c728350d21e79721aacd6bbd4aca84`, live response, default `--sort-by last_trade`):

```json
{
  "success": true,
  "data": [
    {
      "info": {
        "address": "GtpQmrawpvJuQKbudjyiWw9EWDTQ94PmAHRuWsmXkzV6",
        "token_name": "Boryoku Dragonz #494",
        "token_symbol": "BORYOKU",
        "collection_id": "379049a2aa989f41301850d2a826413e02c728350d21e79721aacd6bbd4aca84",
        "data": {
          "name": "Boryoku Dragonz #494",
          "symbol": "BORYOKU",
          "uri": "https://arweave.net/tJrvNdarXJD1L9qyB0MWt0INZ2UQ2kLYDS2eRea-tpw",
          "sellerFeeBasisPoints": 500,
          "creators": [
            { "address": "DRGnhq8axWdQqehZmj3tiLuCkuHeUvkS66dPmH7jA9QT", "verified": 1, "share": 100 }
          ],
          "id": 494
        },
        "meta": {
          "name": "Boryoku Dragonz #494",
          "symbol": "BORYOKU",
          "description": "Bōryoku Dragonz is an exclusive collection of 1,111 Dragon NFTs on the Solana blockchain.",
          "seller_fee_basis_points": 500,
          "image": "https://arweave.net/QujYMy6A_Mak2M_klQ9_MiUGyW52MaWa4YuuUFmkfz8?ext=png",
          "external_url": "https://boryokudragonz.io",
          "attributes": [
            { "trait_type": "Generation", "value": "Genesis" },
            { "trait_type": "Type", "value": "Zombie Golden" }
          ],
          "collection": { "name": "Genesis", "family": "Boryoku Dragonz" },
          "properties": {
            "files": [{ "uri": "https://arweave.net/QujYMy6A_Mak2M_klQ9_MiUGyW52MaWa4YuuUFmkfz8?ext=png", "type": "image/png" }],
            "category": "image",
            "creators": [
              { "address": "DRGNjvBvnXNiQz9dTppGktAsVxtJsvhEmojEfBU3ezf", "share": 100 }
            ]
          }
        },
        "mint_tx": "vX3UTkQjsA1a2vbq2HtaK51PRxsv6kuQfCD6AMgj75gC8RinvfEvxqJt3GhDwdZyzgKvh6DqRzS9sZdQR8vgMT7",
        "created_time": 1672673131
      },
      "stats": {
        "trade_time": 1787622573,
        "signature": "5fZd4SxEoP74bhupPrspeu74LhqBaQb6X2fcBjAr5wYBV3tYifWUd1GupqYPfh33FXsJ5L4B7zFGKxyjECFQE4zt",
        "market_id": "mmm3XBJg5gk8XJxEKBvdgptZz6SgK4tXvn36sodowMc",
        "type": "Buy",
        "price": "1178200000",
        "currency_token": "So11111111111111111111111111111111111111112",
        "currency_decimals": 9,
        "seller": "GXp8twzs23KMmdsihwnctvZUhx1mSbKUVZZoWAXzTURn",
        "buyer": "HqAuyFZ5SG7ECLcbTbUwC1pF5Pu7Yy5EsrMuyG1sdNLG"
      }
    }
  ],
  "metadata": {}
}
```

`--sort-by listing_price` returns the same `info` shape but a trimmed `stats` — `type: "Listing"`, no `trade_time`/`buyer`:

```json
{
  "signature": "zggH6CzinVMbChnwu9dWV3oJXvN1vhY8dSR2FX64Yc9RdvM5Na8Rpiop36D517J6SUThXCzXGd1AaphXELqWbjG",
  "market_id": "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
  "type": "Listing",
  "price": "9900000000",
  "currency_token": "So11111111111111111111111111111111111111112",
  "currency_decimals": 9,
  "seller": "9JQ4DcTEuBykk6p7cPD6kSkinkP5NjCwisQwEAtnoxTu"
}
```

## Interpretation tips

- `stats` reflects the **most recent market event only** (a completed trade, or an active listing) — for an NFT's full trade/activity history, use [`nft activities --token <address>`](nft-activities.md) instead.
- Check `stats.type` before assuming `trade_time`/`buyer` exist — they're only populated on completed trades (`"Buy"`), not on active listings (`"Listing"`).
- `stats.price` is a string; every other price-like field across the NFT actions (`nft activities`'s `price`, `nft collections`'s `floor_price`/`volumes`) is a number — cast it before doing arithmetic.
- `info.created_time` shows up `null` often enough in practice that you should treat it as optional, not as a sign of a bad response.
