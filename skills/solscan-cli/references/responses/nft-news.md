# NFT Response Fields — News

Field-by-field description of the JSON the `nft news` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../nft.md](../nft.md) for flags/params). Shared envelope/error shape: [nft.md](nft.md#common-envelope).

This covers **newly minted NFTs** — a feed of recent mints with both on-chain (Metaplex) and off-chain (URI-fetched) metadata attached, as opposed to marketplace activity ([nft-activities.md](nft-activities.md)) or collection-level stats ([nft-collections.md](nft-collections.md)).

## `news`

`solscan nft news [--filter created_time] [--page <n>] [--page-size <n>]`

`data` is an **array**, each row wrapped in a single `info` object — there's no sibling key at the top level, just `data[].info`.

### `info`

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The NFT's own mint address. |
| `collection` | string | Collection display name. |
| `collectionId` | string | Collection identifier — a hash, not a Solana address (distinct from `collectionKey`). Matches `nft collections`' `collection_id`. |
| `collectionKey` | string | Collection's on-chain address (a Solana pubkey, distinct from `collectionId`). |
| `createdTime` | number | Unix timestamp (seconds) the NFT was minted. |
| `data` | object | On-chain Metaplex metadata — see [`info.data`](#infodata) below. |
| `meta` | object | Off-chain metadata fetched from the token's `uri` (e.g. Arweave/IPFS JSON) — see [`info.meta`](#infometa) below. |
| `mintTx` | string | Transaction signature of the mint. |

### `info.data`

On-chain fields straight off the Metaplex metadata account:

| Field | Type | Description |
|-------|------|--------------|
| `name` | string | On-chain name. |
| `symbol` | string | On-chain symbol. |
| `uri` | string | URI pointing to the off-chain JSON metadata (the source `info.meta` below was fetched from). |
| `sellerFeeBasisPoints` | number | Royalty, in basis points, as recorded on-chain — **camelCase**. |
| `creators` | array of object | Each has `address`, `verified` (`0`/`1`, not boolean), `share` (percentage). |
| `id` | number | Edition/token number parsed out of the name (e.g. `51` for "...#51"). |

### `info.meta`

Off-chain fields fetched from `info.data.uri` — the same JSON a wallet or marketplace fetches to render the NFT. It reuses a few field *names* from `info.data` with independent values and different casing — don't assume the two always agree:

| Field | Type | Description |
|-------|------|--------------|
| `image` | string | Direct image/media URL. |
| `tokenId` | number | Same edition number as `info.data.id`. |
| `name` | string | Off-chain name — usually matches `info.data.name`, but sourced independently. |
| `symbol` | string | Off-chain symbol — same caveat as `name`. |
| `description` | string | Free-text description. |
| `seller_fee_basis_points` | number | Royalty in basis points — **snake_case here**, vs. `sellerFeeBasisPoints` (camelCase) in `info.data`. Nothing enforces the two stay equal (see example: `690` on-chain vs. `1000` off-chain for the same NFT). |
| `edition` | number | Edition number as recorded in the off-chain JSON. |
| `attributes` | array of object | Each has `trait_type` and `value` — the NFT's trait/rarity attributes. |
| `properties` | object | `files` (array of `{ uri, type }`, the media asset(s)) and `category` (e.g. `"image"`). |
| `retried` | number | Internal retry counter from Solscan's off-chain metadata fetcher — not NFT data, safe to ignore. |

**Example** (`solscan nft news --page-size 12`):

```json
{
  "success": true,
  "data": [
    {
      "info": {
        "address": "778ijZKhjvD4ePsBMRsnhk4qSJqikjwS6sBgAeij348Y",
        "collection": "Time Travelling Benji",
        "collectionId": "13d27abddf2b05c498551454c7bde30067a5ec38243ea99ea79607c73abb5e41",
        "collectionKey": "67e49cZfNVbBncyAjR4AKCfVSFF36ApKTC1kcJhPoZjx",
        "createdTime": 1720414991,
        "data": {
          "name": "Time Travelling Benji #51",
          "symbol": "TTB",
          "uri": "https://gateway.pinit.io/ipfs/QmTkNJ6ham4BL1Hi6L8hpkjQJsH19qapprvr8CGQDsuDKs/51.json",
          "sellerFeeBasisPoints": 690,
          "creators": [
            { "address": "4hmD2FWxwVfmizaJjbx32UV6hmTfWwUgTUjXbJ9KNsKy", "verified": 1, "share": 0 },
            { "address": "4xxPpyKJAFaJHAYvYavUsrF59rPMCc2kUp7r5zVifzYF", "verified": 0, "share": 100 }
          ],
          "id": 51
        },
        "meta": {
          "image": "https://na-assets.pinit.io/4xxPpyKJAFaJHAYvYavUsrF59rPMCc2kUp7r5zVifzYF/af6a50f5-214b-4078-931a-198631f92db6/51",
          "tokenId": 51,
          "name": "Time Travelling Benji #51",
          "symbol": "TTB",
          "description": "1137 Benjis are noble travelers of both time and space on a quest to seek the « Everything Answer », the ultimate truth that underpinned the cosmos.",
          "seller_fee_basis_points": 1000,
          "edition": 0,
          "attributes": [
            { "trait_type": "benji", "value": "Benji" },
            { "trait_type": "biome", "value": "Ice Era" }
          ],
          "properties": {
            "files": [{ "uri": "https://na-assets.pinit.io/4xxPpyKJAFaJHAYvYavUsrF59rPMCc2kUp7r5zVifzYF/af6a50f5-214b-4078-931a-198631f92db6/51", "type": "image/gif" }],
            "category": "image"
          },
          "retried": 0
        },
        "mintTx": "5GPCPy3Fk6ZGqBPPhjdRRacXrktdrDJkU3edvANjc8MmdBTwXGVRpTeGvh1NkHE5FF2NGxbT95D3Bk3NaRoGL8Dm"
      }
    }
  ],
  "metadata": {}
}
```

## Interpretation tips

- Read `info.meta` for display purposes (image, description, attributes) — `info.data` is the raw on-chain record and has no image/description/attributes at all.
- `collectionId` (hash) and `collectionKey` (pubkey) are both "collection identifiers" but not interchangeable: use `collectionKey` if you need a Solana address to look up directly, `collectionId` when cross-referencing `nft collections`' `collection_id` ([nft-collections.md](nft-collections.md)) or `nft activities`' `collection_address` ([nft-activities.md](nft-activities.md)).
- `nft items` ([nft-items.md](nft-items.md)) returns this same `info` shape per NFT, but with snake_case top-level key names (`collection_id`, `created_time`, `mint_tx`) instead of this action's camelCase (`collectionId`, `createdTime`, `mintTx`) — same data, different casing depending which action you called.
