# Account Response Fields — Info & Holdings Lookup

Field-by-field description of the JSON these `account <action>` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../account.md](../account.md) for flags/params). Shared envelope/error shape: [account.md](account.md#common-envelope).

These actions describe **what an address is and what it directly holds right now** — no transaction history, no time filters. For activity/history actions (`transactions`, `transfers`, `defi`, `balance-change`, ...) see [account-activity.md](account-activity.md). For priced/aggregate holdings (`portfolio`, `stake`) see [account-holdings.md](account-holdings.md).

## Contents

- [`detail`](#detail)
- [`data-decoded`](#data-decoded)
- [`tokens`](#tokens)
- [`metadata`](#metadata)
- [`metadata-multi`](#metadata-multi)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `detail`

`solscan account detail --address <ADDRESS>`

`data` is a single object:

| Field | Type | Description |
|-------|------|--------------|
| `account` | string | The queried address, echoed back. |
| `lamports` | number | Balance in lamports (1 SOL = 1,000,000,000 lamports). |
| `type` | string | Account type, e.g. `system_account`. Distinguishes wallets from program-owned data accounts. |
| `executable` | boolean | `true` if this account holds executable program code rather than data. |
| `owner_program` | string | Address of the program that owns this account — `11111111111111111111111111111111` (System Program) for a plain wallet, a token/PDA program address otherwise. |
| `rent_epoch` | number | Epoch at which rent is next due. In practice almost always the u64 sentinel `18446744073709552000` (`2^64`, rounded by JS float precision) — Solana no longer collects rent from rent-exempt accounts, so this value doesn't mean "rent owed soon"; treat it as a legacy/inactive field rather than an actionable epoch number. |
| `is_oncurve` | boolean | `true` if the address is a valid ed25519 curve point (a real wallet keypair); `false` for off-curve addresses like PDAs (Program Derived Addresses) and some token accounts. Useful to tell "user wallet" apart from "program-derived account" without extra calls. |

**Example**

```json
{
  "success": true,
  "data": {
    "account": "2YcwVbKx9L25Jpaj2vfWSXD5UKugZumWjzEe6suBUJi2",
    "lamports": 11934280,
    "type": "system_account",
    "executable": false,
    "owner_program": "11111111111111111111111111111111",
    "rent_epoch": 18446744073709552000,
    "is_oncurve": true
  }
}
```

**Interpretation tips**

- To show a human balance, divide `lamports` by `1e9` for SOL.
- `executable: true` means you're looking at a deployed program, not a wallet — `owner_program` will typically be `BPFLoaderUpgradeab1e11111111111111111111111` or similar loader address.
- `is_oncurve: false` + `executable: false` is the signature of a PDA or token account — cross-check with `account tokens` or `token meta` rather than treating it as a user-controlled wallet.

## `data-decoded`

`solscan account data-decoded --address <ADDRESS>`

`data` is a single object:

| Field | Type | Description |
|-------|------|--------------|
| `account` | string | The queried address, echoed back. |
| `data_decoded` | object | The account's raw bytes parsed into a structured field tree, using the IDL (Interface Definition Language — the schema a Solana program publishes describing its account layouts) that matches the account's owner program. Absent or minimal if Solscan has no IDL for that program. |
| `data_base64` | string | The account's raw, undecoded bytes, base64-encoded. Use this as a fallback when `data_decoded` is missing/unhelpful, or when you need to decode with a different/newer IDL than the one Solscan matched. |

`data_decoded` itself has a fixed outer shape, but a fully program-specific inner shape:

| Field | Type | Description |
|-------|------|--------------|
| `name` | string | The account struct's name per the IDL, e.g. `"LbPair"`. |
| `idl_source` | string | Where the matched IDL came from, e.g. `"inner_parser"` (Solscan's own parser heuristics — not a verified on-chain/registry IDL, so treat field names as best-effort rather than guaranteed-authoritative). |
| `idl_standard` | string | Which IDL spec version was used to decode, e.g. `"anchorV30"` (Anchor IDL spec v0.30). |
| `data` | object | The decoded field tree — program-specific.

**Example** (truncated — real accounts can have dozens of fields; this shows one of each wrapper kind)

```json
{
  "success": true,
  "data": {
    "account": "4LACwj7JYQmHVX4UTrg17saEAgcKwX3Fk8sVUhnp1o6f",
    "data_decoded": {
      "name": "LbPair",
      "idl_source": "inner_parser",
      "idl_standard": "anchorV30",
      "data": {
        "parameters": {
          "type": { "defined": { "name": "StaticParameters" } },
          "data": {
            "base_factor": { "type": "u16", "data": "10000" },
            "protocol_share": { "type": "u16", "data": "500" },
            "min_bin_id": { "type": "i32", "data": "-2183" },
            "_padding": { "type": { "array": ["u8", 5] }, "data": [0, 0, 0, 0, 0] }
          }
        },
        "pair_type": { "type": "u8", "data": 3 },
        "token_x_mint": { "type": "pubkey", "data": "9tqjeRS1swj36Ee5C1iGiwAxjQJNGAVCzaTLwFY8bonk" },
        "protocol_fee": {
          "type": { "defined": { "name": "ProtocolFee" } },
          "data": {
            "amount_x": { "type": "u64", "data": "21956533917" },
            "amount_y": { "type": "u64", "data": "4559957617" }
          }
        }
      }
    },
    "data_base64": "IQsxYrVlsQ0QJywBsASIE0wdAADwSQIAeff//4cIAAD0AQAAAAAAAAAA..."
  }
}
```

**Interpretation tips**

- Read `data_decoded.name` first to know what kind of account you're looking at (a DEX pool, a stake pool, a lending position, ...) — that determines which fields under `data` are actually meaningful for the question being asked.
- Don't hardcode field paths across different accounts: the tree under `data` comes entirely from whichever program owns the account, so a token-swap pool and a staking account decode into completely different shapes.
- If a walk through `data` seems oddly shallow or `data_decoded` is missing, Solscan likely had no matching IDL for the owner program (common for newer or niche protocols) — fall back to `data_base64` or `account detail`'s `owner_program` to at least identify the program, then look it up externally.

## `tokens`

`solscan account tokens --address <ADDRESS> --type <token|nft> [--page <n>] [--page-size <10|20|30|40>] [--hide-zero]`

`data` is an **array** — one object per token/NFT account owned by the address, filtered by `--type`. No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows. This is the token-**account** level (SPL associated token accounts), not a priced portfolio view — for USD-valued holdings use [`portfolio`](account-holdings.md#portfolio) instead.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `token_account` | string | The associated token account (ATA) address itself — distinct from the mint. |
| `token_address` | string | Mint address of the token/NFT held in this account. |
| `amount` | number | Raw balance in base units. |
| `amount_str` | string | Same value as `amount`, string-encoded — prefer this for very large balances where JS number precision could lose digits. |
| `token_decimals` | number | Decimals for `token_address` — divide `amount` by `10^token_decimals` for the human-readable amount. For most NFTs (`--type nft`) this is `0`. |
| `owner` | string | Owner wallet of this token account — normally the queried `--address`. |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "token_account": "BW4bvMP129TtQkMKFebCqMA7ZC4jBop4yW8PHgTr6u8Z",
      "token_address": "9LbdhSersRjbkcWWdd4Xpgr8ADi16dwzMU1tM1Ddsq79",
      "amount": 12000000000000,
      "amount_str": "12000000000000",
      "token_decimals": 4,
      "owner": "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ"
    }
  ]
}
```

**Interpretation tips**

- `--type` is required and has exactly two values: `token` (fungible SPL tokens) or `nft` (non-fungible). There's no combined call — query both separately if you need a full picture of an address's holdings.
- This endpoint has no USD pricing — it's raw on-chain balances only. Use [`portfolio`](account-holdings.md#portfolio) when the user wants dollar values, or `token meta`/`token meta-multi` on `token_address` to enrich individual rows with name/symbol/price.
- `--hide-zero` filters out token accounts with `amount: 0` — useful since a wallet can accumulate many empty/closed-out ATAs over time that are otherwise noise in this list.
- `token_account` (the ATA) and `token_address` (the mint) are easy to confuse — `token_account` is unique per owner+mint pair, while `token_address` is the same across every holder of that token/NFT.
- `--page-size` only accepts `10`/`20`/`30`/`40` — other values will be rejected by the API, not silently clamped.

## `metadata`

`solscan account metadata --address <ADDRESS>`

`data` is a single object — Solscan's curated identity info for the address (label, icon, tags, domain), not on-chain account state. Unlike `detail`, this is best-effort enrichment: most addresses (an ordinary wallet with no known label) get back an object where every field beyond `account_address` is empty/absent, not an error.

| Field | Type | Description |
|-------|------|--------------|
| `account_address` | string | The queried address, echoed back. |
| `account_label` | string | Solscan's curated display name for the address, e.g. `"Raydium Authority V4"`. Empty/absent for unlabeled addresses (most wallets). |
| `account_icon` | string | URL to a logo/icon image for the label. Empty/absent alongside `account_label`. |
| `account_tags` | array of string | Category tags, e.g. `["dex_wallet"]`. The API's own schema mislabels this as `type: string`; the actual field, per the example response, is an array — treat a bare string here as unexpected rather than the documented shape. |
| `account_type` | string | Broad account classification, e.g. `"address"`. |
| `account_domain` | string | The address's favorite/primary domain name (e.g. a `.sol` domain), if one is set. Absent for addresses with no registered domain — don't treat a missing field as an error. |
| `funded_by` | object | **Deprecated.** Who funded this account's first-ever transaction. See sub-fields below. Prefer `account funded-by` (batch, up to 50 addresses) for new code — this field is kept for backward compatibility and may be removed. |
| `active_age` | number | Days since the address was first funded (i.e. wallet age in days). |

`funded_by` sub-fields (deprecated container):

| Field | Type | Description |
|-------|------|--------------|
| `funded_by` | string | Address that sent the funding transaction. |
| `tx_hash` | string | Signature of the funding transaction. |
| `block_time` | number | Unix timestamp (seconds) the funding transaction landed. |

**Example**

```json
{
  "success": true,
  "data": {
    "account_address": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    "account_label": "Raydium Authority V4",
    "account_icon": "https://statics.solscan.io/ex-img/RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr.png",
    "account_tags": ["dex_wallet"],
    "account_type": "address",
    "funded_by": {
      "funded_by": "ZULqpmXtGPdhqkPx2bT9B9eWr5ML67nqUEhCKyaJTo4",
      "tx_hash": "4pZV3cZazCNYU7oJCWduQ7PeZEf5SVbePSKrNQqR8wzZnxZbgXpfRfYvPg6fg7J7KZbj5QK5iaVmZzuDBKnNwnQT",
      "block_time": 1634848401
    },
    "active_age": 1402
  }
}
```

**Interpretation tips**

- Most wallets are "boring" here: expect `account_label`/`account_icon`/`account_tags`/`account_domain` to be empty or absent for addresses that aren't a known exchange/protocol/DEX account. Don't treat a mostly-empty response as an error — check `account_address` came back to confirm the call succeeded.
- `funded_by` is explicitly deprecated in the API schema — for new lookups, or when funder info is needed for multiple addresses at once, use `account funded-by --addresses <...>` (max 50) instead of relying on this nested field.
- `active_age` counts from the account's **first funding transaction**, not from when it was first labeled/tagged — a freshly-labeled well-known address can still show a large `active_age` if the underlying wallet is old.
- For batch identity lookups (many addresses at once), use `account metadata-multi` instead of calling `metadata` in a loop — same field shape, one object per address in `data`.

## `metadata-multi`

`solscan account metadata-multi --addresses <addr1,addr2,...>` (max 50)

Batch form of [`metadata`](#metadata): `data` is an **array**, one entry per address in `--addresses`, using the exact same per-item field shape as `metadata`'s single object (`account_address`, `account_label`, `account_icon`, `account_tags`, `account_type`, `account_domain`, `funded_by` (deprecated), `active_age` — see [`metadata`](#metadata) for the full field table). Order of `data` is not documented as matching input order — match rows back to input addresses via each item's own `account_address`, don't assume positional alignment.

**Example**

```json
{
  "success": true,
  "data": [
    {
      "account_address": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      "account_label": "Raydium Authority V4",
      "account_icon": "https://statics.solscan.io/ex-img/RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr.png",
      "account_tags": ["dex_wallet"],
      "account_type": "address",
      "funded_by": {
        "funded_by": "ZULqpmXtGPdhqkPx2bT9B9eWr5ML67nqUEhCKyaJTo4",
        "tx_hash": "4pZV3cZazCNYU7oJCWduQ7PeZEf5SVbePSKrNQqR8wzZnxZbgXpfRfYvPg6fg7J7KZbj5QK5iaVmZzuDBKnNwnQT",
        "block_time": 1634848401
      },
      "active_age": 1402
    }
  ]
}
```

**Interpretation tips**

- Same "mostly empty for ordinary wallets" caveat as `metadata` applies per-item here — most rows will only have `account_address` populated, plus whatever `active_age` the wallet's funding history gives it.
- Hard cap of 50 addresses per call (same limit as `account funded-by`) — split larger address lists into batches of ≤50 rather than expecting the API to reject or silently truncate a longer list.
- `--addresses` is comma-separated on the CLI side; the underlying API param is a repeated/array `address` query param (max 50 values), not a single comma-joined string — the CLI handles that translation for you.
