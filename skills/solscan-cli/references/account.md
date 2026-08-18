# Account Reference

```bash
solscan account <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `detail` | Lamports, account type, executable flag, owner program, rent epoch, on-curve check | `--address` | — |
| `data-decoded` | IDL-decoded account data (parsed field tree, shape depends on owner program) | `--address` | — |
| `metadata` | Label, icon, tags, domain, funder (deprecated field), active age | `--address` | — |
| `metadata-multi` | Batch metadata (max 50) | `--addresses` | — |
| `funded-by` | Funder accounts for multiple accounts (max 50) | `--addresses` | — |
| `tokens` | Associated token/NFT accounts | `--address`, `--type` | `--page`, `--page-size`, `--hide-zero` |
| `transactions` | Recent transactions, cursor-based pagination | `--address` | `--before`, `--limit` |
| `transactions-enhanced` | Raw `getTransaction`-shaped objects with full server-side filtering | `--address` | `--cursor`, `--from-time`, `--to-time`, `--from-signature`, `--to-signature`, `--from-slot`, `--to-slot`, `--limit`, `--status`, `--program`, `--instruction`, `--token`, `--signer`, `--token-account`, `--encoding` |
| `transfers` | SPL + SOL transfer history | `--address` | `--activity-type`, `--token-account`, `--from`, `--exclude-from`, `--to`, `--exclude-to`, `--token`, `--amount`, `--value`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--flow`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `transfer-total` | Total transfer count (hard-capped 10M records) | `--address` | same filters as `transfers` minus pagination |
| `transfer-export` | Transfer history CSV (max 5000 rows, 10 req/min; no default time window) | `--address` | same core filters as `transfers` (`--from`/`--to`/`--token` comma-separated) minus `--exclude-from`/`--exclude-to`/`--value`/sort/pagination, + `--output` |
| `defi` | DeFi protocol interactions | `--address` | `--activity-type`, `--from`, `--source`, `--token`, `--value`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi-export` | DeFi activity CSV (max 5000 rows, 10 req/min) | `--address` | same as `defi` + `--platform`, `--output` |
| `balance-change` | Historical balance changes | `--address` | `--token-account`, `--token`, `--from-time`, `--to-time`, `--remove-spam`, `--amount`, `--flow`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `portfolio` | Full holdings snapshot: native SOL, SPL tokens, and LP positions, each priced in USD | `--address` | `--exclude-low-score-tokens` |
| `stake` | Active stake accounts | `--address` | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `stake-rewards` | Stake rewards for a stake account (`--address` = stake account, not owner wallet) | `--address` | `--from-time`, `--to-time`, `--page`, `--page-size` |
| `reward-export` | Staking reward CSV for a stake account (`--address` = stake account, not owner wallet; max 5000 rows, 10 req/min; default: past 1 month; data from epoch 132) | `--address` | `--from-time`, `--to-time`, `--output` |
| `leaderboard` | Top accounts by portfolio value | — | `--sort-by`, `--sort-order`, `--page`, `--page-size` |

## Option details

**`tokens`**: `--type` required (`token` \| `nft`) · `--page-size` `10/20/30/40` (default `10`) · `--hide-zero` hides zero-balance accounts.

**`transactions`**: `--before <signature>` (cursor from previous page) · `--limit` `10/20/30/40` (default `10`). No `--page`/`--page-size`.

**`transactions-enhanced`**: `--encoding` `json`\|`jsonParsed` (default)\|`base64`\|`base58` · `--status true|false` filters success/failure · `--instruction` value = program address + first 2 bytes (Shank IDL) or 8 bytes (Anchor IDL) of the instruction discriminator, hex, concatenated, e.g. `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA66063d1201daebea`.

**`transfers` / `transfer-total` / `transfer-export`**: `--from`/`--to`/`--token` are comma-separated, max 5 (`transfers`/`transfer-total` additionally support `--exclude-from`/`--exclude-to`) · `--amount`/`--value` are single flags in `min,max` comma-separated form (e.g. `--value 100,999999`) — `transfer-export` has `--amount` but not `--value` · `--flow` `in`\|`out` · `transfers` `--sort-by` currently only supports `block_time` (default) · `transfers` `--page-size` `10/20/30/40/60/100` (default `10`) · `transfer-total` defaults to last 3 weeks if no time filter given · `transfer-export` has no `--sort-by`/`--sort-order`/`--page`/`--page-size` and no default time window (an unfiltered call attempts to export the entire history, capped at 5000 rows); its response is a raw CSV string, not JSON — use `--output <file>` to save it, otherwise it prints to stdout.

Transfer `--activity-type` values (comma-separated):
```
ACTIVITY_SPL_TRANSFER ACTIVITY_SPL_BURN ACTIVITY_SPL_MINT ACTIVITY_SPL_CREATE_ACCOUNT
ACTIVITY_SPL_CLOSE_ACCOUNT ACTIVITY_SPL_TOKEN_WITHDRAW_STAKE ACTIVITY_SPL_TOKEN_SPLIT_STAKE
ACTIVITY_SPL_TOKEN_MERGE_STAKE ACTIVITY_SPL_VOTE_WITHDRAW ACTIVITY_SPL_SET_OWNER_AUTHORITY
ACTIVITY_SPL_WITHDRAW_FROM_NONCE ACTIVITY_SPL_WITHDRAW_EXCESS_LAMPORTS ACTIVITY_SPL_UNWRAP_LAMPORTS
ACTIVITY_SPL_STAKE_MOVE_LAMPORTS ACTIVITY_SPL_STAKE_MOVE_STAKE
```

**`defi` / `defi-export`**: `--source` comma-separated max 5 · `--value <min>,<max>` comma-separated USD range · `defi-export` adds `--platform` (comma-separated, max 5) and drops `--page`/`--page-size` (use time filters to bound results instead). `--sort-by` currently only supports `block_time`.

DeFi `--activity-type` values:
```
ACTIVITY_TOKEN_SWAP ACTIVITY_AGG_TOKEN_SWAP ACTIVITY_TOKEN_ADD_LIQ ACTIVITY_TOKEN_REMOVE_LIQ
ACTIVITY_POOL_CREATE ACTIVITY_SPL_TOKEN_STAKE ACTIVITY_LST_STAKE ACTIVITY_SPL_TOKEN_UNSTAKE
ACTIVITY_LST_UNSTAKE ACTIVITY_TOKEN_DEPOSIT_VAULT ACTIVITY_TOKEN_WITHDRAW_VAULT ACTIVITY_SPL_INIT_MINT
ACTIVITY_ORDERBOOK_ORDER_PLACE ACTIVITY_BORROWING ACTIVITY_REPAY_BORROWING ACTIVITY_LIQUIDATE_BORROWING
ACTIVITY_BRIDGE_ORDER_IN ACTIVITY_BRIDGE_ORDER_OUT
```

**`balance-change`**: `--remove-spam` filters spam token noise · `--flow` `in`\|`out` · `--sort-by` `block_time` (default) · `--page-size` `10/20/30/40/60/100`.

**`stake`**: `--sort-by` `active_stake`(default)\|`delegated_stake` · `--page-size` `10/20/30/40`.

**`stake-rewards`** / **`reward-export`**: `--address` must be a **stake account** (e.g. `stake_account` from `account stake`), not the owner wallet — an owner address doesn't error, it silently returns empty (`data: []` for `stake-rewards`, header-only CSV for `reward-export`). `stake-rewards` `--page-size` `10/20/30/40/60/100`. `reward-export` defaults to past 1 month if no time filter.

**`leaderboard`**: `--sort-by` `sol_values`\|`stake_values`\|`token_values`\|`total_values`(default) · `--page-size` `10/20/30/40/60/100`.

**`metadata` response fields**: `account_address`, `account_label`, `account_icon`, `account_tags` (e.g. `dex_wallet`), `account_type`, `account_domain`, `funded_by` (deprecated: `funded_by` address + `tx_hash` + `block_time`), `active_age` (days since first funded).

**`funded-by` response fields**: `address`, `funded_by`, `tx_hash`, `block_time`.

## Response Fields

Field-by-field description of each action's JSON response (types, meaning, edge cases), split by topic: [responses/account.md](responses/account.md) (index + shared envelope), [responses/account-info.md](responses/account-info.md) (`detail`/`data-decoded`/`tokens`/`metadata`/`metadata-multi`), [responses/account-activity.md](responses/account-activity.md) (`transactions*`/`transfers*`/`defi`/`balance-change`), [responses/account-holdings.md](responses/account-holdings.md) (`portfolio`/`stake`/`stake-rewards`/`reward-export`).

## Examples

```bash
solscan account detail --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
solscan account tokens --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --type nft --hide-zero
solscan account portfolio --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --exclude-low-score-tokens

# Raw tx objects filtered by program + success only
solscan account transactions-enhanced --address JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \
  --program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 --status true --limit 20

# Incoming USDC transfers only
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --flow in --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# DeFi swap history
solscan account defi --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --activity-type ACTIVITY_TOKEN_SWAP,ACTIVITY_AGG_TOKEN_SWAP

# Balance changes for one token, spam removed
solscan account balance-change --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --remove-spam

# Export transfer history to file
solscan account transfer-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --output transfers.csv

solscan account leaderboard --sort-by total_values --sort-order desc --page-size 20
solscan account metadata-multi --addresses addr1,addr2,addr3
solscan account funded-by --addresses addr1,addr2,addr3
```
