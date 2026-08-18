# Account Response Fields — Priced Holdings & Staking

Field-by-field description of the JSON these `account <action>` commands return. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../account.md](../account.md) for flags/params). Shared envelope/error shape: [account.md](account.md#common-envelope).

These actions return **aggregate, valued snapshots** of an address — USD-priced holdings and staking positions — rather than raw token-account rows ([account-info.md](account-info.md)) or a chronological activity log ([account-activity.md](account-activity.md)).

## Contents

- [`portfolio`](#portfolio)
- [`stake`](#stake)
- [`stake-rewards`](#stake-rewards)
- [`reward-export`](#reward-export)
- [`leaderboard`](#leaderboard)

> Only actions with a confirmed field-level source are documented here. If the action you need isn't listed yet, fall back to the `--no-json` output or `--help`, and treat unlabeled fields at face value rather than guessing their meaning.

## `portfolio`

`solscan account portfolio --address <ADDRESS> [--exclude-low-score-tokens]`

Unlike the array-shaped list actions above, `data` is a **single object** — a point-in-time snapshot of everything the address holds: native SOL, SPL tokens, and open DeFi liquidity positions, each already converted to a USD `value` using Solscan's current price feed. There's no pagination and no time filter — this is "right now," not a history.

| Field | Type | Description |
|-------|------|--------------|
| `total_value` | number | Sum of `native_balance.value` + every `tokens[].value`, in USD. Does **not** include `positions[].position_value` — LP position value is reported separately and isn't folded into this total. |
| `native_balance` | object | The address's native SOL balance, priced. Same field shape as one entry of `tokens` (see below), minus `token_address`/`balance_str`. |
| `tokens` | array of object | One entry per SPL token held (nonzero balance), each priced in USD. |
| `positions` | array of object | Open liquidity/LP positions across supported DEX programs (e.g. Whirlpool). Not the same as a `tokens` entry — an LP position is a derivative claim on a pool, not a plain token balance. |

`native_balance` / each `tokens[]` entry:

| Field | Type | Description |
|-------|------|--------------|
| `token_address` | string | Mint address. **Absent on `native_balance`** (SOL has no SPL mint here). |
| `amount` | number | Raw balance in base units. |
| `amount_str` | string | Same value as `amount`, string-encoded — use this instead of `amount` for very large balances where JS number precision could lose digits. |
| `balance` | number | Human-readable balance: `amount / 10^token_decimals`. |
| `balance_str` | string | Same as `balance`, string-encoded. **Absent on `native_balance`** — use `balance` there. |
| `token_price` | number | Current USD price per token. |
| `token_decimals` | number | Decimals used to derive `balance` from `amount`. |
| `token_name` | string | Token's display name, e.g. `"USD Coin"`. |
| `token_symbol` | string | Token's ticker, e.g. `"USDC"`. |
| `token_icon` | string | URL to the token's icon image. |
| `value` | number | USD value of this holding: `balance * token_price` (small rounding differences are expected). |

Each `positions[]` entry:

| Field | Type | Description |
|-------|------|--------------|
| `position_id` | string | Unique address/identifier of the liquidity position account. |
| `created_time` | number | Unix timestamp (seconds) the position was opened. |
| `token_address` | string | Mint address of the LP token representing this position. |
| `position_owner` | string | Wallet that owns the position — normally the queried `--address`. |
| `position_value` | number | Current USD value of the position. **Not** included in `total_value`. |
| `pool_id` | string | Address of the underlying liquidity pool/market. |
| `program` | string | Program ID managing the position (e.g. a Whirlpool/CLMM program). |
| `position_type` | string | Position style — currently only `spot` is documented. |
| `is_position_in_range` | boolean | Whether the pool's current price is inside this position's set range. `false` means the position is currently earning no fees / one-sided (fully converted to a single asset) until price re-enters range. |

**Example**

```json
{
  "success": true,
  "data": {
    "total_value": 21172.229635678654,
    "native_balance": {
      "amount": 2039280,
      "amount_str": "2039280",
      "balance": 0.00203928,
      "token_price": 142.81,
      "token_decimals": 9,
      "token_name": "SOL",
      "token_symbol": "SOL",
      "token_icon": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      "value": 0.2912295768
    },
    "tokens": [
      {
        "token_address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "amount": 21176025379,
        "amount_str": "21176025379",
        "balance": 21176.025379,
        "balance_str": "21176.025379",
        "token_price": 0.999807,
        "token_decimals": 6,
        "token_name": "USD Coin",
        "token_symbol": "USDC",
        "token_icon": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        "value": 21171.938406101854
      }
    ],
    "positions": [
      {
        "position_id": "31d8LfAxqo8QSvbtEcdDV73uJBiXsHtoYnaCe5dECsmj",
        "created_time": 1762338454,
        "token_address": "BPowkUngLTJeVdjMCJuusY655786dCaysmVUszFcMF4J",
        "position_owner": "BgaKshAaCd2bZf6EgwCiwQooDqncxGUbt58Tosu43Z9Z",
        "position_value": 208.23610361549095,
        "pool_id": "3y9xVpRETKsUt4cfgj4WBqj2SmVB8R8qs5z3kKAcizHN",
        "program": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
        "position_type": "spot",
        "is_position_in_range": true
      }
    ]
  },
  "metadata": {}
}
```

**Interpretation tips**

- `total_value` covers `native_balance` + `tokens` + `positions[].position_value`.
- `--exclude-low-score-tokens` filters out low-reputation/likely-spam tokens from `tokens` (and their value from `total_value`) — useful for a clean "real holdings" view, but means `total_value` with the flag on can legitimately be lower than without it for the same wallet.
- `tokens` only lists **held** balances — a token the wallet has traded before but currently holds zero of won't appear; check `account transfers`/`account balance-change` for historical activity instead.
- Prefer `amount_str`/`balance_str` over `amount`/`balance` when precision matters (e.g. re-deriving raw amounts for another API call) — the numeric fields can lose precision for very large raw amounts under JS's float representation.
- `positions` is specifically **liquidity pool positions** (spot LP so far), not staking positions — for native SOL staking, use [`stake`](#stake) instead.
- This is a live snapshot at request time, not a historical/point-in-time-in-the-past query — there's no `--from-time`/`--to-time` on this action.

## `stake`

`solscan account stake --address <ADDRESS> [--page <n>] [--page-size <10|20|30|40>] [--sort-by <active_stake|delegated_stake>] [--sort-order <asc|desc>]`

`data` is an **array** — one object per stake account where the queried address holds a staker/withdrawer role, ordered by `--sort-by` (default `active_stake`) / `--sort-order`. No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows. All amount fields are raw **lamports** (1 SOL = 1,000,000,000 lamports), not decimal-adjusted SOL.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `amount` | number | The stake account's lamport amount, as reported by the API. In practice this tracks `active_stake_amount`/`delegated_stake_amount` for a fully-active stake — treat `sol_balance` as the authoritative full account balance if the figures ever diverge. |
| `role` | array of string | The queried address's relationship to this stake account — `staker` (can delegate/deactivate), `withdrawer` (can withdraw funds), or both. |
| `status` | string | Lifecycle status of the stake account, e.g. `active`. Other Solana stake states (`activating`, `deactivating`, `inactive`) are expected but not yet confirmed against a live example. |
| `type` | string | Stake account type/category as reported by the API; in the current example it duplicates `status` (`"active"`) — don't assume it always will. |
| `voter` | string | Vote account address this stake is delegated to — identifies which validator is receiving the delegation. |
| `active_stake_amount` | number | Portion of `amount` that is currently active and earning rewards, in lamports. |
| `delegated_stake_amount` | number | Total amount delegated to `voter`, in lamports — may include stake still activating/deactivating alongside the active portion. |
| `sol_balance` | number | Full lamport balance held in the stake account itself, in lamports. Can exceed `active_stake_amount`/`delegated_stake_amount` (e.g. rent-exempt reserve, or lamports not yet delegated) — use this as the account's true balance rather than the stake-specific fields when reconciling totals. |
| `total_reward` | string | Cumulative staking rewards earned by this account to date, in lamports, string-encoded (guards against precision loss on very large validators/long-lived accounts). |
| `stake_account` | string | Address of the stake account itself — the on-chain account holding the stake, distinct from both the owning wallet and `voter`. |
| `activation_epoch` | number | Epoch in which this stake began activating. |
| `stake_type` | number | Numeric type code for the stake account per the API. Coincides with `activation_epoch` in Solscan's own example (`642`) — likely happenstance rather than a documented relationship; treat as an opaque enum until Solscan documents its values. |

**Example** (reproduced from Solscan's own `account/stake` reference)

```json
{
  "success": true,
  "data": [
    {
      "amount": 3051482512086273,
      "role": ["staker", "withdrawer"],
      "status": "active",
      "type": "active",
      "voter": "he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk",
      "deactivationEpoch": -1,
      "active_stake_amount": 3051482512086273,
      "delegated_stake_amount": 3051482512086273,
      "sol_balance": 3061059171416726,
      "total_reward": "181621059220579",
      "stake_account": "52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD",
      "activation_epoch": 642,
      "stake_type": 642
    }
  ],
  "metadata": {}
}
```

**Interpretation tips**

- Divide any lamport field (`amount`, `active_stake_amount`, `delegated_stake_amount`, `sol_balance`, `total_reward`) by `1e9` to display SOL — the huge numbers in the example (`3051482512086273` lamports ≈ 3,051,482.5 SOL) are typical for a validator's own stake account, not a data error.
- `role` determines what the queried address can actually do with this stake: `staker` alone can delegate/redelegate/deactivate, `withdrawer` alone can pull funds out once deactivated, and most personal stake accounts hold both.
- `sol_balance` vs. `active_stake_amount`/`delegated_stake_amount`/`amount`: these can differ (the example shows `sol_balance` about 9,576,659,330,453 lamports higher than the others) — the gap represents lamports sitting in the account beyond what's actively delegated (e.g. rewards not yet compounded in, or an un-delegated portion). Use `sol_balance` for "how much SOL is locked in this account," and the stake-amount fields for "how much is actively earning rewards right now."
- `total_reward` is a **running cumulative total**, not a per-epoch figure — for a reward history broken out over time, use `account stake-rewards` instead.
- `--sort-by` only accepts `active_stake` or `delegated_stake` — there's no sort by `sol_balance` or `total_reward`.

## `stake-rewards`

`solscan account stake-rewards --address <STAKE_ACCOUNT> [--from-time <unix>] [--to-time <unix>] [--page <n>] [--page-size <10|20|30|40|60|100>]`

`data` is an **array** — one entry per epoch in which the stake account earned a reward, newest first. `--address` here is the **stake account** itself (e.g. `stake_account` from [`stake`](#stake)), not the owning wallet. Default window is the trailing 1 month (`--to-time` defaults to now, `--from-time` defaults to 1 month before `--to-time`); staking reward data only goes back to epoch 132. No `total`/`has_next` metadata — page by incrementing `--page` until a response comes back with fewer than `--page-size` rows.

Each item in `data`:

| Field | Type | Description |
|-------|------|--------------|
| `address` | string | The stake account address (echoes `--address`). |
| `epoch` | number | The epoch this reward was paid for. |
| `effective_slot` | number | Slot at which the reward became effective. |
| `effective_time` | number | Unix timestamp (seconds) corresponding to `effective_slot`. |
| `amount` | number | Reward amount paid this epoch, in raw base units (lamports — divide by `10^decimals`). |
| `decimals` | number | Decimals for `amount`/`post_balance`; `9` for SOL/lamports. |
| `post_balance` | number | The stake account's total lamport balance immediately after this reward was applied. |
| `commission` | number | Validator commission rate (percent, e.g. `7` = 7%) in effect for this epoch. |
| `change_percent` | number | This reward's size relative to `post_balance`, as a fraction (e.g. `0.0288` ≈ 2.88% growth that epoch). |

**Example** (reproduced from Solscan's own `account/stake/reward` reference)

```json
{
  "success": true,
  "data": [
    {
      "address": "4uEX6TQgZ3Zn4iXcjMDSnvEgEHpERa2YsguvCUNajx2B",
      "change_percent": 0.028764210605431415,
      "epoch": 970,
      "effective_slot": 419472239,
      "effective_time": 1778676071,
      "decimals": 9,
      "amount": 796872229049,
      "commission": 7,
      "post_balance": 2771157025615390
    }
  ]
}
```

**Interpretation tips**

- Divide `amount` and `post_balance` by `10^decimals` (typically `1e9`) to get SOL — e.g. `796872229049` lamports ≈ `0.796872229` SOL earned that epoch.
- `--address` must be a **stake account**, not the owner wallet — passing an owner/wallet address does not error, it silently returns `data: []`. Get stake account addresses from `account stake --address <WALLET>` (`stake_account` field) first.
- One epoch is roughly 2-3 days on mainnet, so a 1-month default window yields on the order of 10-15 rows; widen `--from-time`/`--to-time` for a longer history.
- `commission` reflects the validator's rate **at that epoch** — it can change over time for the same stake account if the validator adjusts commission or the delegation moves to a different validator.
- For an aggregate/cumulative reward figure instead of a per-epoch breakdown, see `total_reward` on [`stake`](#stake); for a bulk CSV export across many epochs, use `account reward-export`.

## `reward-export`

`solscan account reward-export --address <STAKE_ACCOUNT> [--from-time <unix>] [--to-time <unix>] [--output <file>]`

Same `--address` semantics as [`stake-rewards`](#stake-rewards): it must be a **stake account**, not the owning wallet — passing an owner/wallet address doesn't error, it silently exports an empty CSV (header row only, no data rows). This is the CSV/export twin of `stake-rewards` for the same stake account, not a per-wallet rollup across multiple stake accounts. The response is not JSON: it's a **raw CSV string** (`success`/`data` envelope does not apply). Without `--output`, the CLI prints the CSV text as-is to stdout; with `--output <file>`, it's written verbatim to disk via `saveToCsv()`. Capped at 5000 rows per request, rate-limited to 10 requests/minute, and defaults to the trailing 1 month if no `--from-time`/`--to-time` is given (staking reward data starts at epoch 132).

CSV columns (header row is included in the output):

| Column | Type | Description |
|--------|------|--------------|
| `Epoch` | number | The epoch this reward was paid for. |
| `Effective Slot` | number | Slot at which the reward became effective. |
| `Effective Time Unix` | number | Unix timestamp (seconds) corresponding to `Effective Slot`. |
| `Effective Time` | string | Same instant as `Effective Time Unix`, as an ISO 8601 date-time (e.g. `2026-05-17T19:26:05`). |
| `Reward Amount` | number | Reward paid this epoch, **already decimal-adjusted to SOL** — unlike `amount` on [`stake-rewards`](#stake-rewards), which is raw lamports. |
| `Change Percentage` | number | This reward's size relative to `Post Balance`, as a fraction — same meaning as `change_percent` on `stake-rewards`. |
| `Post Balance` | number | Stake account balance after this reward, **already decimal-adjusted to SOL** — unlike `post_balance` on `stake-rewards`, which is raw lamports. |
| `Commission` | number | Validator commission rate (percent) in effect for this epoch. |

**Example**

```
Epoch, Effective Slot, Effective Time Unix, Effective Time, Reward Amount, Change Percentage, Post Balance, Commission
972,420336000,1779020765,2026-05-17T19:26:05,0,0,0.777802943,0
```

**Interpretation tips**

- `Reward Amount` and `Post Balance` are already in SOL here — do **not** divide by `1e9` again, unlike the equivalent `amount`/`post_balance` fields on the JSON `stake-rewards` action.
- If a wallet holds multiple stake accounts and you need each one's export, call `reward-export` once per `stake_account` (from `account stake --address <WALLET>`) — there's no single `--address` value that rolls up multiple stake accounts into one export.
- On failure (invalid/malformed address, auth, rate limit) the API falls back to the standard JSON error envelope (`success: false`, `errors.code`/`errors.message`) instead of CSV text — code that always expects a CSV string back should check for a leading `{` before parsing. A syntactically valid but wrong-kind address (e.g. an owner wallet instead of a stake account) does not trigger this — it returns an empty CSV instead.
- The two deprecated aliases `time_from`/`time_to` (documented as deprecated, superseded by `from_time`/`to_time`) are intentionally **not** exposed as CLI flags — use `--from-time`/`--to-time`.

## `leaderboard`

`solscan account leaderboard [--sort-by <sol_values|stake_values|token_values|total_values>] [--sort-order <asc|desc>] [--page <n>] [--page-size <10|20|30|40|60|100>]`

No `--address` — this ranks accounts **across the whole chain** by USD-valued holdings, not a lookup for one address. Unlike the array-shaped list actions elsewhere in this file, `data` here is a **wrapper object** containing the ranked list plus a total count, not a bare array — don't treat `data` itself as iterable.

| Field | Type | Description |
|-------|------|--------------|
| `data.data` | array of object | The ranked page of accounts, ordered per `--sort-by`/`--sort-order` (default: `total_values` descending is typical, but `--sort-order` is not required — omit it and the API picks its own default direction). |
| `data.total` | number | Total number of accounts in the full leaderboard (not just this page) — use with `--page`/`--page-size` to compute total pages. |

Each item in `data.data`:

| Field | Type | Description |
|-------|------|--------------|
| `account` | string | The ranked address. |
| `sol_values` | number | USD value of native SOL holdings. |
| `token_values` | number | USD value of SPL token holdings. |
| `stake_values` | number | USD value of staked SOL. |
| `total_values` | number | Sum of the three above — the ranking figure when `--sort-by total_values` (the default). |

**Example**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "account": "2RH6rUTPBJ9rUDPpuV9b8z1YL56k1tYU6Uk5ZoaEFFSK",
        "sol_values": 832.15,
        "token_values": 11542680679.8,
        "stake_values": 0,
        "total_values": 11542681511.95
      },
      {
        "account": "4ZJhPQAgUseCsWhKvJLTmmRRUV74fdoTpQLNfKoekbPY",
        "sol_values": 11173984.7,
        "token_values": 0.04,
        "stake_values": 10905679993.31,
        "total_values": 10916853978.05
      }
    ],
    "total": 9570
  }
}
```

**Interpretation tips**

- Double-nested `data.data` is unique to this action among `account` commands — every other list action in this skill returns a bare `data: [...]` array. Reach for `data.data` here, not `data`, when extracting rows.
- `data.total` is the only action in the `account` group that reports a total count for pagination — combine it with `--page-size` to know how many pages exist (`Math.ceil(total / page_size)`), unlike `tokens`/`stake`/`stake-rewards`, which require paging until a short page comes back.
- `total_values` is not guaranteed to exactly equal `sol_values + token_values + stake_values` in every row due to independent rounding at the source — treat small discrepancies as expected, not a data bug.
- A single high-`token_values` outlier (like the first example row, ~$11.5B in token value) is typically a large token's own mint/treasury/liquidity-pool authority account showing up as a "wallet" — the leaderboard ranks addresses by raw on-chain value, with no filtering for whether the address is a real end-user wallet vs. a program-controlled account.
- `--sort-by` accepts `sol_values`/`stake_values`/`token_values`/`total_values` (default `total_values`); there's no `--address` filter on this action — to check where one specific address ranks, cross-reference its `account portfolio`/`account stake` totals manually rather than searching this endpoint.
