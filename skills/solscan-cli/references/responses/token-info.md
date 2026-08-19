# Token Response Fields — Info

Field-by-field description of the JSON these `token <action>` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params). Shared envelope/error shape: [token.md](token.md#common-envelope).

This covers **what a token is** — identity, supply, authorities, and current market snapshot — as opposed to a time-ordered activity log ([token-activity.md](token-activity.md)) or DEX pool/market listings ([token-market.md](token-market.md)).

## Contents

- [`meta`](#meta--meta-multi)
- [`meta-multi`](#meta--meta-multi)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `meta` / `meta-multi`

`solscan token meta --address <TOKEN_ADDRESS>`
`solscan token meta-multi --addresses <TOKEN_ADDRESS,...>` (max 50)

Both return the same object shape — `meta` wraps one in `data` (an **object**), `meta-multi` wraps several in `data` (an **array**, one entry per address, in the order requested). No pagination.

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The token's mint address (same as the queried `--address`/entry in `--addresses`). |
| `name` | string | Token name. |
| `symbol` | string | Token ticker symbol. |
| `icon` | string | URL to the token's icon image. |
| `decimals` | number | Decimals used to convert any raw base-unit amount for this token into a human-readable one, across every other `token`/`account` endpoint. |
| `supply` | string | Total supply in raw base units, **string-encoded** — parse with a bignum-safe method for large-supply tokens; divide by `10 ** decimals` for the human-readable total. |
| `holder` | number | Total number of holder accounts. |
| `creator` | string | Address that created the mint. **Absent** for tokens with no on-chain creation record Solscan can attribute (e.g. `So111...112` Wrapped SOL — see interpretation tips). |
| `create_tx` | string | Transaction signature that created the mint. Same absence caveat as `creator`. |
| `created_time` | number | Unix timestamp (seconds) the mint was created. Same absence caveat as `creator`. |
| `first_mint_tx` | string | Transaction signature of the token's first mint (first supply issuance) instruction — distinct from `create_tx` (mint account creation) since the two can happen in separate transactions. Not shown in Solscan's own example response but present on live data. |
| `first_mint_time` | number | Unix timestamp (seconds) of `first_mint_tx`. |
| `metadata` | object \| null | The token's off-chain/on-chain metadata blob — shape varies by token (typically `name`/`symbol`/`image`/`description` plus optional `website`/`twitter`/`showName`/`createdOn`, etc., mirroring whatever the metadata URI/on-chain metadata account actually contains). **`null`** when Solscan has no metadata for the token (e.g. `USDC`, `WSOL` — see interpretation tips). Unrelated to the envelope-level `metadata` field described in [token.md](token.md#common-envelope). |
| `metadata_uri` | string | URI the `metadata` object was fetched from (Metaplex/Token-2022 metadata pointer). Empty string `""` when `metadata` is `null`. |
| `mint_authority` | string \| null | Address still authorized to mint new supply, or `null` if the mint authority has been revoked/renounced. |
| `freeze_authority` | string \| null | Address still authorized to freeze token accounts, or `null` if revoked. |
| `price` | number | Current price in USD. |
| `volume_24h` | number | Trading volume in USD over the last 24h (aggregated across all venues Solscan tracks, not just Solana DEXs — compare with `total_dex_vol_24h`). |
| `market_cap` | number | Market capitalization in USD (`price * circulating-equivalent supply`, per Solscan's methodology). |
| `market_cap_rank` | number | Rank by market cap among tokens Solscan ranks. **Absent** on tokens outside Solscan's ranked set (e.g. long-tail/low-cap tokens) rather than `null` — don't assume the field always exists. |
| `price_change_24h` | number | Percentage price change over the last 24h (e.g. `2.77` means +2.77%, not a 2.77x multiple). |
| `total_dex_vol_24h` | number | Trading volume in USD over the last 24h specifically on Solana DEXs. Often equal to `volume_24h` when Solana DEXs are the token's only liquidity venue. |
| `dex_vol_change_24h` | number | Percentage change in `total_dex_vol_24h` vs. the prior 24h window. |
| `onchain_extensions` | array of object | Token-2022 (Token Extensions program) extension data — e.g. `metadataPointer`, `tokenMetadata`, transfer fees, etc. Each entry has an `extension` name and an extension-specific `state` object. **Absent entirely** for plain SPL Token (non-2022) mints — do not assume an empty array; the key itself may not be present. |

**Example** (`solscan token meta --address 2JHrkVb5NwQEKRgLbBu9CyrG7F7SmvJyLW1NkpdP8WWR`, a Token-2022 pump.fun token — captured 2026-08-19)

```json
{
  "success": true,
  "data": {
    "address": "2JHrkVb5NwQEKRgLbBu9CyrG7F7SmvJyLW1NkpdP8WWR",
    "name": "World Water Reserve",
    "symbol": "WWR",
    "icon": "https://ipfs.io/ipfs/bafybeiaeyn7ec3zj7wabekbzxfk77hwyp2hryixjrzg2vwocmovv7b6a2i",
    "decimals": 6,
    "supply": "999427092463809",
    "holder": 347,
    "creator": "28hT2xzSBTneQf1AxJcpJuaabJbwdWJbXvR5UopsM6nF",
    "create_tx": "5ueV3RbjTiryPAhR1uWpPckVxuz5VWssbqEqPVp6wFkfTwZchXi8VSxSdutgCGv4dnFMqwefZgyVLVK7Tv1k23WT",
    "created_time": 1786752762,
    "first_mint_tx": "5ueV3RbjTiryPAhR1uWpPckVxuz5VWssbqEqPVp6wFkfTwZchXi8VSxSdutgCGv4dnFMqwefZgyVLVK7Tv1k23WT",
    "first_mint_time": 1786752762,
    "metadata": {
      "name": "World Water Reserve",
      "symbol": "WWR",
      "description": "Water is the world's most essential resource...",
      "image": "https://ipfs.io/ipfs/bafybeiaeyn7ec3zj7wabekbzxfk77hwyp2hryixjrzg2vwocmovv7b6a2i",
      "showName": true,
      "createdOn": "https://pump.fun",
      "website": "https://wwr.global/"
    },
    "metadata_uri": "https://ipfs.io/ipfs/bafkreibqt4xjhzqpq73mhqee5uhufd5dqkxbmdseltvz4yh6a6viu62u2e",
    "price": 0.0026961531314885928,
    "volume_24h": 138318.81862612162,
    "market_cap": 2694608.485040838,
    "price_change_24h": 2.776895,
    "total_dex_vol_24h": 138318.81862612162,
    "dex_vol_change_24h": 58.2611,
    "mint_authority": null,
    "freeze_authority": null,
    "onchain_extensions": [
      {
        "extension": "metadataPointer",
        "state": { "authority": null, "metadataAddress": "2JHrkVb5NwQEKRgLbBu9CyrG7F7SmvJyLW1NkpdP8WWR" }
      },
      {
        "extension": "tokenMetadata",
        "state": {
          "additionalMetadata": [],
          "mint": "2JHrkVb5NwQEKRgLbBu9CyrG7F7SmvJyLW1NkpdP8WWR",
          "name": "World Water Reserve",
          "symbol": "WWR",
          "updateAuthority": null,
          "uri": "https://ipfs.io/ipfs/bafkreibqt4xjhzqpq73mhqee5uhufd5dqkxbmdseltvz4yh6a6viu62u2e"
        }
      }
    ]
  },
  "metadata": {}
}
```

Note this token has no `market_cap_rank` field at all despite having a `market_cap` — confirming the field is omitted, not nulled, when unranked.

**`meta-multi` example** (`--addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, trimmed — captured 2026-08-19):

```json
{
  "success": true,
  "data": [
    {
      "address": "So11111111111111111111111111111111111111112",
      "name": "Wrapped SOL",
      "symbol": "WSOL",
      "decimals": 9,
      "supply": "12816987508451606",
      "holder": 7789123,
      "metadata": null,
      "metadata_uri": "",
      "price": 76.95635775196757,
      "market_cap_rank": 7,
      "mint_authority": null,
      "freeze_authority": null
    },
    {
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "USDC",
      "symbol": "USDC",
      "decimals": 6,
      "supply": "7521286762876240",
      "holder": 8090955,
      "creator": "5TYZChz7APFopR5QirD5of4rQj1p9AXxeSAg6JndBdGj",
      "create_tx": "3J3ijbvsdedojbptNNm57mfB9gMeH6y5vF73bx5seGT8CS54fVUgRhvhZALfxXWuj6hRt3JXNP73caJVkTzVFPV5",
      "created_time": 1602610673,
      "first_mint_tx": "5bLgbFhs1tugs4YHFHxmoBWdanG8N7sqjAYT9FWPkXpmPhtr2haifoLg65uLBLzdc1sh4FuEfRG6VZ82T1u2xvLX",
      "first_mint_time": 1721427641,
      "metadata": null,
      "metadata_uri": "",
      "price": 1,
      "market_cap_rank": 5,
      "mint_authority": "BJE5MMbqXjVwjAF7oxwPYXnTXDyspzZyt4vwenNw5ruG",
      "freeze_authority": "7dGbd2QZcCKcTndnHcTL8q7SMVXAkp688NTQYwrRCrar"
    }
  ],
  "metadata": {}
}
```

Note `So111...112` (WSOL) has no `creator`/`create_tx`/`created_time`/`first_mint_tx`/`first_mint_time` at all — the wrapped-SOL mint predates the indexing Solscan uses to attribute those fields, and USDC still has non-`null` `mint_authority`/`freeze_authority` (Circle retains both) whereas most other tokens show `null` once authorities are renounced.

**Interpretation tips**

- `creator`/`create_tx`/`created_time`/`first_mint_tx`/`first_mint_time` are all-or-nothing on a per-token basis, not independently absent — either the token has full creation provenance or none of these five fields appear.
- `metadata` (inside `data`) and `metadata_uri` go together: `null`/`""` when Solscan couldn't resolve on-chain/off-chain metadata for the mint, populated together otherwise. Don't treat a `null` `metadata` as an error — it's common for early/legacy SPL tokens (USDC, WSOL) that predate the Metaplex/Token-2022 metadata standards.
- `mint_authority`/`freeze_authority` being non-`null` is not inherently suspicious — reputable centralized-issuance stablecoins (USDC) intentionally keep both live for compliance (e.g. freezing sanctioned addresses, minting to match reserves). For meme/community tokens, a non-`null` `mint_authority` is a bigger red flag (issuer can inflate supply at will) — use `creator` and `metadata.createdOn` alongside these fields to judge intent rather than reading the field in isolation.
- `onchain_extensions` only appears for Token-2022 mints; a plain SPL Token mint (the vast majority, including USDC/WSOL) simply omits the key. Check with `'onchain_extensions' in data` / `Array.isArray(data.onchain_extensions)` rather than checking length.
- `price`/`volume_24h`/`market_cap`/`market_cap_rank`/`price_change_24h`/`total_dex_vol_24h`/`dex_vol_change_24h` all come from the same market-data snapshot Solscan uses elsewhere (`token trending`, `token list`) — a brand-new token with no tracked liquidity may have some of these fields (notably `market_cap_rank`) missing rather than zeroed.
- The envelope-level `metadata` field (a sibling of `data`, see [token.md](token.md#common-envelope)) is unrelated to `data.metadata` documented above — don't confuse the two when parsing.
- Solscan's own published schema for `meta-multi` omits `total_dex_vol_24h`/`dex_vol_change_24h` from its property list (unlike `meta`'s schema, which lists both) — live traffic shows `meta-multi` returns them identically to `meta` (trimmed from the examples above only for brevity). Treat `meta` and `meta-multi` as the same field set per entry; don't assume `meta-multi` is missing fields just because one endpoint's doc under-lists them.
