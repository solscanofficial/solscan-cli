# Token Response Fields

Field-by-field description of the JSON each `token <action>` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../token.md](../token.md) for flags/params).

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## Common envelope

Every action wraps its payload the same way:

| Field | Type | Description |
|-------|------|--------------|
| `success` | boolean | `true` on `200 OK`. |
| `data` | object \| array | The actual payload, shaped per action (see below). |

On failure (`400`/`401`/`403`/`429`/`500`), `success` is `false` and `data` is replaced by:

| Field | Type | Description |
|-------|------|--------------|
| `errors.code` | number | API error code (distinct from the HTTP status). |
| `errors.message` | string | Human-readable error description, e.g. `"Validation Error: Address [...] is invalid"`. |

## Contents

- [`transfers`](#transfers)

## `transfers`

`solscan token transfers --address <TOKEN_ADDRESS> [filters...]`

`data` is an **array** — one object per transfer of this token, ordered by `--sort-by` (default and currently only `block_time`) / `--sort-order` (default `desc`, newest first). No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `block_id` | number | Slot number the transfer's transaction landed in. |
| `trans_id` | string | Transaction signature — feed into `transaction detail`/`transaction actions` for the full transaction. |
| `block_time` | number | Unix timestamp (seconds) of the slot. |
| `time` | string | Same instant as `block_time`, as an ISO-8601 string. |
| `activity_type` | string | One of the `ACTIVITY_SPL_*` enum values (full list in [../token.md](../token.md)) — the specific kind of transfer (plain transfer, burn, mint, stake move, etc.). |
| `from_address` | string | Source wallet/owner address. |
| `to_address` | string | Destination wallet/owner address. |
| `token_address` | string | Mint address of the transferred token — always equal to the queried `--address` for this endpoint (unlike `account transfers`, where the queried address is a wallet and `token_address` varies per row). |
| `token_decimals` | number | Decimals for `token_address` — divide `amount` by `10^token_decimals` for the human-readable amount. |
| `amount` | number | Raw transfer amount in the token's base units (not yet decimal-adjusted). |

**Example**

```json
{
  "success": true,
  "data": [
    {
      "block_id": 276312035,
      "trans_id": "4x6jxJFCgbjLACvXgqb3aRTsrSk6RSccfgreJLgF3wL4xmZ9897ZyPTxvVV7sbukGeNeMqLb12EtQpzrxzhEkeMC",
      "block_time": 1720408627,
      "time": "2024-07-08T03:17:07.000Z",
      "activity_type": "ACTIVITY_SPL_TRANSFER",
      "from_address": "J6vHZDKghn3dbTG7pcBLzHMnXFoqUEiHVaFfZxojMjXs",
      "to_address": "7rhxnLV8C77o6d8oz26AgK8x8m5ePsdeRawjqvojbjnQ",
      "token_address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "token_decimals": 5,
      "amount": 500000000
    }
  ]
}
```

**Interpretation tips**

- Always divide `amount` by `10 ** token_decimals` before displaying — the example row is `5000` tokens (`500000000 / 10^5`), not 500 million.
- `token_address` will always equal the `--address` you queried — unlike `account transfers` (a wallet-scoped equivalent that can return several different `token_address` values for one wallet), this endpoint is scoped to one token from the start.
- There's no `flow` field here (present on `account transfers`) — since the query is scoped to a token rather than a wallet, there's no single "queried address" for direction to be relative to. Use `--from`/`--to` to filter by direction, and read `from_address`/`to_address` directly per row.
- No `value` (USD) field is returned per row despite `--value` being a valid filter — you can filter by a USD range, but there's no field in the response to read the USD amount back from. If you need the per-row USD value, the wallet-scoped `account transfer-export`'s `Value` CSV column is the closest equivalent (when the counterpart wallet is known).
- The API doc's description for `--amount` mentions needing to "pass token address first" — that phrasing is boilerplate carried over from the wallet-scoped `account transfers` endpoint (where `--address` is a wallet and a separate `--token` filter scopes the amount range to one token). Here `--address` already is the token, so `--amount <min>,<max>` applies directly with no extra qualifier needed.
