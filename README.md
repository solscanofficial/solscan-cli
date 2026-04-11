# Solscan CLI

Command-line tool for querying Solana blockchain data via the [Solscan Pro API v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0).

Supports 56+ actions across accounts, tokens, transactions, NFTs, blocks, markets, programs, and API monitoring — with JSON and human-readable output modes.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Global Options](#global-options)
  - [Account](#account)
  - [Token](#token)
  - [Transaction](#transaction)
  - [NFT](#nft)
  - [Block](#block)
  - [Market](#market)
  - [Program](#program)
  - [Monitor](#monitor)
- [Output Modes](#output-modes)
- [Error Handling](#error-handling)
- [Examples](#examples)
  - [Wallet Research Workflow](#wallet-research-workflow)
  - [Token Analysis Workflow](#token-analysis-workflow)
  - [Transaction Inspection](#transaction-inspection)
- [Project Structure](#project-structure)
- [License](#license)

---

## Requirements

- **Node.js** >= 18
- A **Solscan Pro API key** — obtain one at [Solscan User Profile's Api Management](https://solscan.io/user/profile#api_management)

---

## Installation

### Install globally

```bash
npm install -g solscan-cli
```

### From source (local development)

```bash
git clone <repo-url>
cd solscan-cli
npm install
```

Run commands directly:

```bash
node bin/solscan.js <command>
```

### Link globally

```bash
npm link
```

After linking, the `solscan` command becomes available system-wide:

```bash
solscan <command>
```

### Via npx (no install)

```bash
npx solscan-cli <command>
```

---

## Configuration

All API requests require a Solscan Pro API key. The CLI resolves the key in this priority order:

| Priority | Source | How to set |
|----------|--------|------------|
| 1 (highest) | `--api-key` flag | `solscan --api-key <KEY> token trending` |
| 2 | Environment variable | `export SOLSCAN_API_KEY=<KEY>` |
| 3 (lowest) | Stored config file | `solscan config set-api-key <KEY>` |

### Save your API key (recommended)

```bash
solscan config set-api-key YOUR_API_KEY_HERE
```

The key is persisted in `config.json` at the following location:

| OS | Config file path |
|----|------------------|
| macOS / Linux | `~/.config/solscan-cli/config.json` |
| Windows | `C:\Users\<username>\.config\solscan-cli\config.json` |

> **Tip:** Run `solscan config show` to see the exact path on your machine.

### View current configuration

```bash
solscan config show
```

Output (macOS / Linux):

```
Config file : /Users/you/.config/solscan-cli/config.json
Stored key  : abcd1234...
Env var     : (not set)
```

Output (Windows):

```
Config file : C:\Users\you\.config\solscan-cli\config.json
Stored key  : abcd1234...
Env var     : (not set)
```

### Use environment variable

```bash
export SOLSCAN_API_KEY=YOUR_API_KEY_HERE
solscan token trending
```

### One-time override

```bash
solscan --api-key YOUR_KEY token trending
```

---

## Usage

```
solscan [global-options] <resource> <action> [action-options]
```

### Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--json` | Output as formatted JSON | `true` |
| `--no-json` | Output as human-readable table/text | — |
| `--api-key <key>` | Override API key for this invocation | — |
| `-V, --version` | Show version number | — |
| `-h, --help` | Show help | — |

---

### Account

Operations on Solana wallet accounts.

```bash
solscan account <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `detail` | Get lamports, owner, and executable flag of an account | `--address` | — |
| `data-decoded` | Get account data with decoded information | `--address` | — |
| `tokens` | Get associated token and NFT accounts of an address | `--address`, `--type` | `--page`, `--page-size`, `--hide-zero` |
| `transactions` | Get recent transactions for an address (cursor-based pagination) | `--address` | `--before`, `--limit` |
| `transfers` | Get SPL and SOL transfer history of an account | `--address` | `--activity-type`, `--token-account`, `--from`, `--exclude-from`, `--to`, `--exclude-to`, `--token`, `--amount`, `--value`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--flow`, `--sort-order`, `--page`, `--page-size` |
| `stake` | Get active stake accounts of an address | `--address` | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `portfolio` | Get token holdings with USD value for an address | `--address` | `--exclude-low-score-tokens` |
| `defi` | Get DeFi protocol interactions of an account | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi-export` | Export DeFi activity history as CSV (max 5000 rows, max 1 req/min) | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--output` |
| `balance-change` | Get historical balance changes for an account | `--address` | `--token-account`, `--token`, `--from-time`, `--to-time`, `--remove-spam`, `--amount`, `--flow`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `reward-export` | Export staking reward history as CSV (max 5000 rows, max 1 req/min) | `--address` | `--time-from`, `--time-to`, `--output` |
| `transfer-export` | Export transfer history as CSV (max 5000 rows, max 1 req/min) | `--address` | `--activity-type`, `--token-account`, `--from`, `--to`, `--token`, `--amount`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--flow`, `--output` |
| `metadata` | Get label, icon, tags, domain, and funder of an account | `--address` | — |
| `metadata-multi` | Get metadata of multiple accounts (max 50) | `--addresses` | — |
| `funded-by` | Get funder accounts for multiple accounts (max 50) | `--addresses` | — |
| `leaderboard` | Get top accounts ranked by portfolio value | — | `--sort-by`, `--sort-order`, `--page`, `--page-size` |

**Option details for `tokens`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--type <type>` | Type of token (required) | — | `token`, `nft` |
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40` |
| `--hide-zero` | Hide accounts with zero balance | off | — |

**Option details for `transactions`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--before <signature>` | Signature of last tx from previous page | — | Transaction signature |
| `--limit <number>` | Number of transactions to return | `10` | `10`, `20`, `30`, `40` |

**Option details for `transfers`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--activity-type <types>` | Comma-separated activity types | — |
| `--token-account <account>` | Filter by specific token account in wallet | — |
| `--from <addresses>` | Source addresses, comma-separated (max 5) | — |
| `--exclude-from <addresses>` | Exclude source addresses, comma-separated (max 5) | — |
| `--to <addresses>` | Destination addresses, comma-separated (max 5) | — |
| `--exclude-to <addresses>` | Exclude destination addresses, comma-separated (max 5) | — |
| `--token <tokens>` | Token addresses, comma-separated (max 5) | — |
| `--amount <min>,<max>` | Filter by amount range | — |
| `--value <min>,<max>` | Filter by USD value range | — |
| `--from-time <timestamp>` | Start time (unix seconds) | — |
| `--to-time <timestamp>` | End time (unix seconds) | — |
| `--exclude-amount-zero` | Exclude zero amount transfers | off |
| `--flow <direction>` | Transfer direction: `in` \| `out` | — |
| `--sort-order <order>` | Sort order: `asc` \| `desc` | `desc` |
| `--page <number>` | Page number | `1` |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40`, `60`, `100` |

**Transfer activity types:**

```
ACTIVITY_SPL_TRANSFER         ACTIVITY_SPL_BURN
ACTIVITY_SPL_MINT             ACTIVITY_SPL_CREATE_ACCOUNT
ACTIVITY_SPL_CLOSE_ACCOUNT    ACTIVITY_SPL_TOKEN_WITHDRAW_STAKE
ACTIVITY_SPL_TOKEN_SPLIT_STAKE  ACTIVITY_SPL_TOKEN_MERGE_STAKE
ACTIVITY_SPL_VOTE_WITHDRAW    ACTIVITY_SPL_SET_OWNER_AUTHORITY
```

**Option details for `stake`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40` |
| `--sort-by <field>` | Sort field | `active_stake` | `active_stake`, `delegated_stake` |
| `--sort-order <order>` | Sort order | — | `asc`, `desc` |

**Option details for `defi`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--activity-type <types>` | Comma-separated DeFi activity types | — |
| `--from <address>` | Filter activities from an address | — |
| `--platform <addresses>` | Comma-separated platform addresses (max 5) | — |
| `--source <addresses>` | Comma-separated source addresses (max 5) | — |
| `--token <address>` | Filter by token address | — |
| `--from-time <timestamp>` | Start time (unix seconds) | — |
| `--to-time <timestamp>` | End time (unix seconds) | — |
| `--sort-by <field>` | Sort field | `block_time` |
| `--sort-order <order>` | Sort order: `asc` \| `desc` | `desc` |
| `--page / --page-size` | Pagination | `1` / `10` (page_size: 10, 20, 30, 40, 60, 100) |

**DeFi activity types:**

```
ACTIVITY_TOKEN_SWAP           ACTIVITY_AGG_TOKEN_SWAP
ACTIVITY_TOKEN_ADD_LIQ        ACTIVITY_TOKEN_REMOVE_LIQ
ACTIVITY_POOL_CREATE          ACTIVITY_SPL_TOKEN_STAKE
ACTIVITY_LST_STAKE            ACTIVITY_SPL_TOKEN_UNSTAKE
ACTIVITY_LST_UNSTAKE          ACTIVITY_TOKEN_DEPOSIT_VAULT
ACTIVITY_TOKEN_WITHDRAW_VAULT ACTIVITY_SPL_INIT_MINT
ACTIVITY_ORDERBOOK_ORDER_PLACE ACTIVITY_BORROWING
ACTIVITY_REPAY_BORROWING      ACTIVITY_LIQUIDATE_BORROWING
ACTIVITY_BRIDGE_ORDER_IN      ACTIVITY_BRIDGE_ORDER_OUT
```

**Option details for `defi-export`, `reward-export`, `transfer-export`:**

All export commands accept an additional option:

| Option | Description |
|--------|-------------|
| `--output <file>` | Save the CSV response to a file (e.g. `out.csv`). Without this flag the raw CSV is printed to stdout. |

**Option details for `balance-change`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--token-account <account>` | Filter by specific token account | — |
| `--token <address>` | Filter by token address | — |
| `--from-time <timestamp>` | Start time (unix seconds) | — |
| `--to-time <timestamp>` | End time (unix seconds) | — |
| `--remove-spam` | Remove spam activities | off |
| `--amount <min>,<max>` | Filter by amount range | — |
| `--flow <direction>` | Change direction: `in` \| `out` | — |
| `--sort-by <field>` | Sort field | `block_time` |
| `--sort-order <order>` | Sort order: `asc` \| `desc` | `desc` |
| `--page / --page-size` | Pagination | `1` / `10` (page_size: 10, 20, 30, 40, 60, 100) |
| `--page / --page-size` | Pagination (page_size: 10, 20, 30, 40, 60, 100) |

**Option details for `leaderboard`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--sort-by <field>` | Sort field | `total_values` | `sol_values`, `stake_values`, `token_values`, `total_values` |
| `--sort-order <order>` | Sort order | — | `asc`, `desc` |
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40`, `60`, `100` |

**Examples:**

```bash
# Get account details
solscan account detail --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# List SPL token accounts
solscan account tokens --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --page 1 --page-size 20

# List NFT accounts only
solscan account tokens --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --type nft --hide-zero

# Portfolio with low-score tokens excluded
solscan account portfolio --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --exclude-low-score-tokens

# Incoming transfers of USDC
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --flow in --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Transfers with USD value > $100 and USD value < $999,999 (only SPL transfers)
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --value 100,999999 --activity-type ACTIVITY_SPL_TRANSFER

# DeFi activities filtered by swap type
solscan account defi --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --activity-type ACTIVITY_TOKEN_SWAP,ACTIVITY_AGG_TOKEN_SWAP

# Balance changes for a specific token, no spam
solscan account balance-change --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --remove-spam

# Export rewards for last month (default) — prints raw CSV
solscan account reward-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Export rewards for a specific time range
solscan account reward-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --time-from 1700000000 --time-to 1702678400

# Export rewards and save to CSV file
solscan account reward-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --output rewards.csv

# Export DeFi activities and save to CSV file
solscan account defi-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --output defi.csv

# Export transfer history and save to CSV file
solscan account transfer-export --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --output transfers.csv

# Stake accounts sorted by delegated stake
solscan account stake --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --sort-by delegated_stake --sort-order desc

# Leaderboard sorted by total portfolio value
solscan account leaderboard --sort-by total_values --sort-order desc --page-size 20

# Batch metadata for multiple accounts (max 50)
solscan account metadata-multi --addresses addr1,addr2,addr3

# Get funders for multiple accounts (max 50)
solscan account funded-by --addresses addr1,addr2,addr3
```

---

### Token

Operations on SPL tokens.

```bash
solscan token <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `meta` | Get name, symbol, decimals, and supply of a token | `--address` | — |
| `meta-multi` | Get metadata of multiple tokens (max 50) | `--addresses` | — |
| `holders` | Get top holder list with amounts for a token | `--address` | `--page`, `--page-size`, `--from-amount`, `--to-amount`, `--from-value`, `--to-value` |
| `price` | Get current USD price of a token *(deprecated)* | `--address` | `--from-time`, `--to-time` |
| `price-multi` | Get current USD prices for multiple tokens *(deprecated)* | `--addresses` | `--from-time`, `--to-time` |
| `price-latest` | Get latest price of multiple tokens (max 50) | `--addresses` | — |
| `price-history` | Get historical price of multiple tokens (max 50) | `--addresses` | `--from-time`, `--to-time` |
| `markets` | Get DEX markets for one or two token addresses | `--token` | `--sort-by`, `--program`, `--page`, `--page-size` |
| `trending` | Get currently trending tokens | — | `--limit` |
| `list` | Get full token list sortable by holder, market cap, or creation time | — | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `top` | Get top tokens by market cap | — | — |
| `latest` | Get newly listed tokens, filterable by launch platform | — | `--platform-id`, `--page`, `--page-size` |
| `transfers` | Get transfer history for a token | `--address` | `--activity-type`, `--from`, `--exclude-from`, `--to`, `--exclude-to`, `--amount`, `--value`, `--exclude-amount-zero`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi` | Get DeFi activity involving a token | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |
| `defi-export` | Export DeFi activity history of a token as CSV | `--address` | `--activity-type`, `--from`, `--platform`, `--source`, `--token`, `--from-time`, `--to-time`, `--sort-by`, `--sort-order`, `--page`, `--page-size`, `--output` |
| `historical` | Get historical data (price, supply, volume, holder, trader,...) for a token (range: 7 or 30 days) | `--address` | `--range` |
| `search` | Search tokens by keyword, address, name, or symbol | `--keyword` | `--search-mode`, `--search-by`, `--exclude-unverified`, `--sort-by`, `--sort-order`, `--page`, `--page-size` |

**Option details for `holders`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40` |
| `--from-amount <amount>` | Minimum token holding amount (string format) | — | — |
| `--to-amount <amount>` | Maximum token holding amount (string format) | — | — |
| `--from-value <value>` | Minimum token holding value (USD) | — | — |
| `--to-value <value>` | Maximum token holding value (USD) | — | — |

**Option details for `markets`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--token <tokens>` | 1 token address (all markets) or 2 addresses comma-separated (pair) | required | — |
| `--sort-by <field>` | Sort field | — | `volume`, `trade`, `tvl`, `trader` |
| `--program <addresses>` | Filter by program addresses, comma-separated (max 5) | — | — |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40`, `60`, `100` |

**Option details for `list`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--sort-by <field>` | Sort field | `market_cap` | `holder`, `market_cap`, `created_time` |
| `--sort-order <order>` | Sort order | `desc` | `asc`, `desc` |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40`, `60`, `100` |

**Option details for `latest`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--platform-id <platform>` | Filter by launch platform | — | `jupiter`, `raydium`, `orca`, `pumpfun`, `meteora`, `lifinity`, `sanctum`, `kamino`, `phoenix`, `openbook`, `apepro`, `stabble`, `jupiterdca`, `jupiter_limit_order`, `solfi`, `zerofi`, `letsbonkfun_launchpad`, `raydium_launchlab`, `believe_launchpad`, `moonshot_launchpad`, `jup_studio_launchpad`, `bags_launchpad` |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40`, `60`, `100` |

**Option details for `price-history`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--addresses <addresses>` | Comma-separated token addresses (max 50) | required | — |
| `--from-time <date>` | Start date for historical data | — | YYYYMMDD format |
| `--to-time <date>` | End date for historical data | — | YYYYMMDD format |

**Option details for `transfers` (token):**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--sort-by <field>` | Sort field | `block_time` | `block_time` |

**Option details for `defi` (token):**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--sort-by <field>` | Sort field | `block_time` | `block_time` |

**Option details for `defi-export` (token):**

| Option | Description |
|--------|-------------|
| `--sort-by <field>` | Sort field (default: `block_time`) |
| `--sort-order <order>` | Sort order: `asc` \| `desc` (default: `desc`) |
| `--page <number>` | Page number (default: `1`) |
| `--page-size <number>` | Items per page (default: `10`) |
| `--output <file>` | Save the CSV response to a file (e.g. `out.csv`). Without this flag the raw CSV is printed to stdout. |

**Option details for `historical`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--range <days>` | Time range in days | `7` | `7`, `30` |

**Option details for `search`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--keyword <keyword>` | Search by name, symbol, or address | required | — |
| `--search-mode <mode>` | Match mode | `exact` | `exact`, `fuzzy` |
| `--search-by <field>` | Search field | `combination` | `combination`, `address`, `name`, `symbol` |
| `--exclude-unverified` | Exclude unverified tokens | off | — |
| `--sort-by <field>` | Sort field | `reputation` | `reputation`, `market_cap`, `volume_24h` |
| `--sort-order <order>` | Sort order | `desc` | `asc`, `desc` |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40` |

**Examples:**

```bash
# Get trending tokens
solscan token trending

# Get token metadata
solscan token meta --address So11111111111111111111111111111111111111112

# Get latest price for multiple tokens
solscan token price-latest --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Get historical price for multiple tokens
solscan token price-history --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --from-time 20240701 --to-time 20240715

# Find all markets for a single token
solscan token markets --token So11111111111111111111111111111111111111112

# Find market for a token pair
solscan token markets --token So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# List tokens sorted by holders, descending
solscan token list --sort-by holder --sort-order desc --page-size 20

# Recently created tokens on Raydium
solscan token latest --platform-id raydium

# Recently created tokens on PumpFun
solscan token latest --platform-id pumpfun --page-size 20

# Historical data for last 30 days
solscan token historical --address So11111111111111111111111111111111111111112 --range 30

# Search tokens by name (fuzzy match, sort by market cap)
solscan token search --keyword "bonk" --search-mode fuzzy --sort-by market_cap

# Search by symbol, exact match, only verified tokens
solscan token search --keyword "USDC" --search-by symbol --exclude-unverified

# Token holders filtered by amount range
solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --from-amount 1000 --to-amount 1000000

# Top tokens (no parameters)
solscan token top

# Export token DeFi activities and save to CSV file
solscan token defi-export --address So11111111111111111111111111111111111111112 \
  --output sol-defi.csv
```

---

### Transaction

Operations on Solana transactions.

```bash
solscan transaction <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `detail` | Get full transaction details including balance changes, IDL data, and DeFi activities | `--signature` | — |
| `detail-multi` | Get details of multiple transactions (max 50) | `--signatures` | — |
| `last` | Get the list of the latest transactions | — | `--limit`, `--filter` |
| `actions` | Get human-readable decoded actions of a transaction (transfers, swaps, NFT activities) | `--signature` | — |
| `actions-multi` | Get decoded actions of multiple transactions (max 50) | `--signatures` | — |
| `fees` | Get network fee statistics (no parameters) | — | — |

**Option details for `last`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--limit <number>` | Number of results | `10` | `10`, `20`, `30`, `40`, `60`, `100` |
| `--filter <filter>` | Exclude vote transactions | `exceptVote` | `exceptVote`, `all` |

**Examples:**

```bash
# Get last 10 transactions (excluding vote transactions)
solscan transaction last

# Get last 20 transactions including vote transactions
solscan transaction last --limit 20 --filter all

# Get full transaction details
solscan transaction detail --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

# Get decoded actions (swaps, transfers, NFT activities)
solscan transaction actions --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

# Batch lookup up to 50 transactions
solscan transaction detail-multi --signatures sig1,sig2,sig3

# Batch decode actions for multiple transactions
solscan transaction actions-multi --signatures sig1,sig2,sig3

# Get current network fee statistics
solscan transaction fees
```

---

### NFT

Operations on Solana NFTs and collections.

```bash
solscan nft <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `news` | Get latest NFT activity feed | — | `--filter`, `--page`, `--page-size` |
| `activities` | Get NFT activities across sales, listings, bids, and transfers | — | `--token`, `--collection`, `--from`, `--to`, `--source`, `--activity-type`, `--currency-token`, `--price`, `--from-time`, `--to-time`, `--page`, `--page-size` |
| `collections` | Get top NFT collections ranked by volume, items, or floor price | — | `--range`, `--sort-by`, `--sort-order`, `--collection`, `--page`, `--page-size` |
| `items` | Get items in an NFT collection | `--collection` | `--sort-by`, `--page`, `--page-size` |

**Option details for `news`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--filter <filter>` | Filter type | `created_time` | `created_time` |
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `12` | `12`, `24`, `36` |

**Option details for `activities`:**

| Option | Description |
|--------|-------------|
| `--token <address>` | Filter by NFT token address |
| `--collection <address>` | Filter by collection address |
| `--from <address>` | Filter activities from an address |
| `--to <address>` | Filter activities to an address |
| `--source <addresses>` | Comma-separated source addresses (max 5) |
| `--activity-type <types>` | Comma-separated NFT activity types |
| `--currency-token <address>` | Currency token for price filter |
| `--price <min>,<max>` | Filter by price range (requires `--currency-token`) |
| `--from-time / --to-time` | Time range (unix seconds) |
| `--page / --page-size` | Pagination (page_size: 10, 20, 30, 40, 60, 100) |

**NFT activity types:**

```
ACTIVITY_NFT_SOLD         ACTIVITY_NFT_LISTING
ACTIVITY_NFT_BIDDING      ACTIVITY_NFT_CANCEL_BID
ACTIVITY_NFT_CANCEL_LIST  ACTIVITY_NFT_REJECT_BID
ACTIVITY_NFT_UPDATE_PRICE ACTIVITY_NFT_LIST_AUCTION
```

**Option details for `collections`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--range <days>` | Days range | `1` | `1`, `7`, `30` |
| `--sort-by <field>` | Sort field | `volumes` | `items`, `floor_price`, `volumes` |
| `--sort-order <order>` | Sort order | `desc` | `asc`, `desc` |
| `--collection <id>` | Filter by collection ID | — | — |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40` |

**Option details for `items`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--collection <id>` | Collection ID | required | — |
| `--sort-by <field>` | Sort field | `last_trade` | `last_trade`, `listing_price` |
| `--page / --page-size` | Pagination | `1` / `12` | page_size: `12`, `24`, `36` |

**Examples:**

```bash
# New NFTs
solscan nft news --page-size 24

# NFT activities for a specific token
solscan nft activities --token DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x

# NFT sales only, with SOL price filter
solscan nft activities \
  --activity-type ACTIVITY_NFT_SOLD \
  --currency-token So11111111111111111111111111111111111111112 \
  --price 1,10

# NFT activities for a collection
solscan nft activities --collection DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x

# Top collections by volume, last 7 days
solscan nft collections --range 7 --sort-by volumes --sort-order desc

# Collections sorted by floor price
solscan nft collections --sort-by floor_price --sort-order asc

# Items in a collection sorted by listing price
solscan nft items --collection DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x \
  --sort-by listing_price --page-size 24
```

---

### Block

Operations on Solana blocks (slots).

```bash
solscan block <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `last` | Get the list of the latest blocks | — | `--limit` |
| `detail` | Get block metadata by slot number | `--block` | — |
| `transactions` | Get paginated transactions for a block | `--block` | `--page`, `--page-size`, `--exclude-vote`, `--program` |

**Option details for `last`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--limit <number>` | Number of blocks to return | `10` | `10`, `20`, `30`, `40`, `60`, `100` |

**Option details for `detail`:**

| Option | Description | Valid Values |
|--------|-------------|--------------|
| `--block <slot>` | The slot index of a block (required) | — |

**Option details for `transactions`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--block <slot>` | The slot index of a block | required | — |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40`, `60`, `100` |
| `--exclude-vote` | Exclude vote transactions | off | — |
| `--program <address>` | Filter by program address | — | — |

**Examples:**

```bash
# Get last 20 blocks
solscan block last --limit 20

# Get block detail by slot number
solscan block detail --block 250000000

# List non-vote transactions in a block
solscan block transactions --block 250000000 --exclude-vote --page-size 40

# Filter transactions by program
solscan block transactions --block 250000000 \
  --program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
```

---

### Market

Operations on DEX trading pools and markets.

```bash
solscan market <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `list` | Get the list of all trading pools and markets | — | `--page`, `--page-size`, `--program`, `--token-address`, `--sort-by`, `--sort-order` |
| `info` | Get pool and market details by market address | `--address` | — |
| `volume` | Get historical volume data for a market | `--address` | `--time` |

**Option details for `list`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40`, `60`, `100` |
| `--program <address>` | Filter by program owner address | — | — |
| `--token-address <address>` | Filter by token address | — | — |
| `--sort-by <field>` | Sort field | `volumes_24h` | `created_time`, `volumes_24h`, `trades_24h` |
| `--sort-order <order>` | Sort order | `desc` | `asc`, `desc` |

**Option details for `volume`:**

| Option | Description |
|--------|-------------|
| `--address <address>` | Market ID (required) |
| `--time <start>,<end>` | Time range in YYYYMMDD format (e.g. `20240701,20240715`) |

**Examples:**

```bash
# List all markets sorted by 24h volume
solscan market list --sort-by volumes_24h --sort-order desc

# Find markets for a specific token
solscan market list --token-address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Get market info by market ID
solscan market info --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh

# Get historical volume for a market
solscan market volume --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh

# Get volume for a specific date range
solscan market volume --address 8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh \
  --time 20240701,20240715
```

---

### Program

Operations on Solana programs (smart contracts).

```bash
solscan program <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|---------|
| `list` | Get programs active in the last 90 days | — | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `popular` | Get the most-used DeFi programs and platforms | — | — |
| `analytics` | Get comprehensive on-chain analytics for a Solana program | `--address`, `--range` | — |

**Option details for `list`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--sort-by <field>` | Sort field | `num_txs` | `num_txs`, `num_txs_success`, `interaction_volume`, `success_rate`, `active_users_24h` |
| `--sort-order <order>` | Sort order | — | `asc`, `desc` |
| `--page / --page-size` | Pagination | `1` / `10` | page_size: `10`, `20`, `30`, `40` |

**Option details for `analytics`:**

| Option | Description | Valid Values |
|--------|-------------|--------------|
| `--address <address>` | Program address (required) | — |
| `--range <days>` | Time range in days (required) | `7`, `30` |

**Examples:**

```bash
# Programs sorted by total transactions (descending)
solscan program list --sort-by num_txs --sort-order desc

# Programs sorted by success rate
solscan program list --sort-by success_rate --sort-order desc

# Popular DeFi platforms
solscan program popular

# Analytics for the Token Program, last 7 days
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 7

# Analytics for last 30 days
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 30
```

---

### Monitor

Monitor your API key usage and rate limits.

```bash
solscan monitor <action>
```

| Action | Description |
|--------|-------------|
| `usage` | Get used Compute Units of your subscription |

**Example:**

```bash
solscan monitor usage
```

---

## Output Modes

### JSON (default)

All commands output formatted JSON by default:

```bash
solscan token trending
```

```json
{
  "success": true,
  "data": [
    {
      "address": "So11111111111111111111111111111111111111112",
      "symbol": "SOL",
      "name": "Wrapped SOL",
      "price": 175.42
    }
  ]
}
```

### Human-readable table

Use `--no-json` for a table/text view:

```bash
solscan token trending --no-json
```

```
address                                             symbol  name         price
--------------------------------------------------  ------  -----------  ------
So11111111111111111111111111111111111111112          SOL     Wrapped SOL  175.42
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v         USDC    USD Coin     1.00
```

---

## Error Handling

The CLI provides clear error messages for common API issues:

| HTTP Code | Message | Suggested Action |
|-----------|---------|------------------|
| `400` | Bad request — check your parameters | Verify address format, enum values (type, page_size, range, etc.) |
| `401` | Authentication failed — check your API key | Run `solscan config set-api-key <KEY>` |
| `403` | Forbidden — insufficient permissions | Upgrade your API plan |
| `429` | Rate limit exceeded — wait and retry | Wait a moment and try again |
| `500` | Internal server error — try again later | Retry; report if persistent |

**No API key configured:**

```
Error: No API key found.
Set one via: solscan config set-api-key <KEY>
Or set the SOLSCAN_API_KEY environment variable.
```

---

## Examples

### Wallet Research Workflow

Research a Solana wallet step-by-step:

```bash
# Step 1: Check if it's a known/labeled wallet
solscan account metadata --address <WALLET>

# Step 2: View wallet's portfolio with USD values
solscan account portfolio --address <WALLET> --exclude-low-score-tokens

# Step 3: Review incoming transfers
solscan account transfers --address <WALLET> --flow in --page-size 20

# Step 3b: Filter to large-value outgoing transfers
solscan account transfers --address <WALLET> --flow out --value 100,999999

# Step 4: Check DeFi swap history
solscan account defi --address <WALLET> \
  --activity-type ACTIVITY_TOKEN_SWAP,ACTIVITY_AGG_TOKEN_SWAP

# Step 5: View staking positions
solscan account stake --address <WALLET> --sort-by active_stake --sort-order desc
```

### Token Analysis Workflow

Analyze a token before trading:

```bash
# Step 1: Confirm token identity
solscan token meta --address <MINT>

# Step 2: Get current price (latest endpoint)
solscan token price-latest --addresses <MINT>

# Step 3: Check holder concentration (filter by large holders)
solscan token holders --address <MINT> --from-amount 1000000 --page-size 20

# Step 3b: Filter holders by USD value (e.g., holders with $10k-$100k worth)
solscan token holders --address <MINT> --from-value 10000 --to-value 100000

# Step 4: Find best liquidity pools
solscan token markets --token <MINT> --sort-by tvl

# Step 5: View historical data for last 30 days
solscan token historical --address <MINT> --range 30

# Step 6: Check recent transfers
solscan token transfers --address <MINT> --exclude-amount-zero --page-size 20
```

### Transaction Inspection

Debug or verify a transaction:

```bash
# Get full transaction details (balance changes, IDL, instructions)
solscan transaction detail --signature <SIG>

# Decode into human-readable actions (swaps, transfers, DeFi/NFT activities)
solscan transaction actions --signature <SIG>
```

### Quick Market Overview

```bash
# Top trending tokens
solscan token trending --limit 20 --no-json

# Recently created PumpFun tokens
solscan token latest --platform-id pumpfun --page-size 20

# Top DEX pools by 24h volume
solscan market list --sort-by volumes_24h --sort-order desc --page-size 10

# Most active programs today
solscan program list --sort-by num_txs --sort-order desc

# Monitor API usage
solscan monitor usage
```

---

## Project Structure

```
solscan-cli/
├── bin/
│   └── solscan.js              # Entry point (#!/usr/bin/env node)
├── src/
│   ├── cli.js                  # Commander program setup & global options
│   ├── config.js               # API key management (flag > env > stored)
│   ├── api.js                  # Axios HTTP client & error handling
│   ├── formatter.js            # JSON / human-readable output formatter
│   └── commands/
│       ├── account.js          # 16 account actions
│       ├── token.js            # 16 token actions
│       ├── transaction.js      # 6 transaction actions
│       ├── nft.js              # 4 NFT actions
│       ├── block.js            # 3 block actions
│       ├── market.js           # 3 market actions
│       ├── program.js          # 3 program actions
│       └── monitor.js          # 1 monitor action
├── package.json
├── implementation_plan.md
└── README.md
```

---

## Pagination

Commands that return lists support these common options:

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number (1-based) | `1` |
| `--page-size <number>` | Results per page | `10` |

Valid `page_size` values vary by endpoint:
- Most endpoints: `10`, `20`, `30`, `40`, `60`, `100`
- Some endpoints (stake, holders): `10`, `20`, `30`, `40`
- NFT items/news: `12`, `24`, `36`

Some commands use `--limit` instead:

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--limit <number>` | Maximum results to return | `10` | `10`, `20`, `30`, `40`, `60`, `100` |

---

## Help

Every command and sub-command supports `--help`:

```bash
solscan --help
solscan account --help
solscan token search --help
solscan nft activities --help
```

---

## API Reference

This CLI wraps the **Solscan Pro API v2.0**.

- API Documentation: [pro-api.solscan.io/pro-api-docs/v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0)
- API FAQs: [pro-api.solscan.io/pro-api-docs/v2.0/faq.md](https://pro-api.solscan.io/pro-api-docs/v2.0/faq.md)

---

## License

MIT
