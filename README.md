# Solscan CLI

Command-line tool for querying Solana blockchain data via the [Solscan Pro API v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0).

Supports 50+ actions across accounts, tokens, transactions, NFTs, blocks, markets, programs, and API monitoring — with JSON and human-readable output modes.

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
npm install -g @solscan/cli
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
npx @solscan/cli <command>
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

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `detail` | Get account details (lamports, owner, executable) | `--address <addr>` | — |
| `data-decoded` | Get decoded account data | `--address <addr>` | — |
| `tokens` | List associated token accounts | `--address <addr>` | `--type`, `--page`, `--page-size`, `--hide-zero` |
| `transactions` | List recent transactions | `--address <addr>` | `--before`, `--limit` |
| `transfers` | List SPL + SOL transfer history | `--address <addr>` | `--activity-type`, `--token`, `--flow`, `--from-time`, `--to-time`, `--exclude-amount-zero`, `--page`, `--page-size` |
| `stake` | Get stake accounts with details | `--address <addr>` | `--page`, `--page-size`, `--sort-by`, `--sort-order` |
| `portfolio` | Get token holdings with USD values | `--address <addr>` | — |
| `defi` | Get DeFi protocol interactions | `--address <addr>` | `--page`, `--page-size` |
| `defi-export` | Export DeFi activities (CSV) | `--address <addr>` | — |
| `balance-change` | Historical SOL balance changes | `--address <addr>` | `--page`, `--page-size` |
| `reward-export` | Export staking reward history (CSV) | `--address <addr>` | — |
| `transfer-export` | Export transfer history (CSV) | `--address <addr>` | — |
| `metadata` | Get label, icon, tags, domain, funder | `--address <addr>` | — |
| `metadata-multi` | Batch metadata lookup | `--addresses <addr1,addr2,...>` | — |
| `leaderboard` | Top accounts by activity | — | `--page`, `--page-size` |

**Option details for `tokens`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--type <type>` | Type of token to list | `token` | `token`, `nft` |
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40` |
| `--hide-zero` | Hide accounts with zero balance | off | — |

**Option details for `transactions`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--before <signature>` | Start from this signature | — | Transaction signature |
| `--limit <number>` | Items to return | `10` | `10`, `20`, `30`, `40` |

**Option details for `stake`:**

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `--page <number>` | Page number | `1` | — |
| `--page-size <number>` | Items per page | `10` | `10`, `20`, `30`, `40` |
| `--sort-by <field>` | Sort field | `active_stake` | `active_stake`, `delegated_stake` |
| `--sort-order <order>` | Sort order | — | `asc`, `desc` |

**Option details for `transfers`:**

| Option | Description | Example |
|--------|-------------|---------|
| `--activity-type <types>` | Comma-separated activity types | `ACTIVITY_SPL_TRANSFER,ACTIVITY_SPL_BURN` |
| `--token-account <account>` | Filter by specific token account | `TokenAddress...` |
| `--from <addresses>` | Comma-separated source addresses (max 5) | `addr1,addr2` |
| `--exclude-from <addresses>` | Exclude source addresses (max 5) | `addr1,addr2` |
| `--to <addresses>` | Comma-separated destination addresses (max 5) | `addr1,addr2` |
| `--exclude-to <addresses>` | Exclude destination addresses (max 5) | `addr1,addr2` |
| `--token <tokens>` | Comma-separated token addresses (max 5) | `So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `--amount <min>,<max>` | Amount range | `100,1000` |
| `--value <min>,<max>` | USD value range | `1,100` |
| `--from-time <timestamp>` | Start time (unix seconds) | `1720153259` |
| `--to-time <timestamp>` | End time (unix seconds) | `1720153276` |
| `--exclude-amount-zero` | Exclude zero amount transfers | — |
| `--flow <direction>` | Transfer direction | `in` or `out` |
| `--sort-order <order>` | Sort order | `asc` or `desc` (default: `desc`) |
| `--page <number>` | Page number | `1` |
| `--page-size <number>` | Items per page | `10`, `20`, `30`, `40`, `60`, `100` |

**Activity types:**

```
ACTIVITY_SPL_TRANSFER
ACTIVITY_SPL_BURN
ACTIVITY_SPL_MINT
ACTIVITY_SPL_CREATE_ACCOUNT
ACTIVITY_SPL_CLOSE_ACCOUNT
ACTIVITY_SPL_TOKEN_WITHDRAW_STAKE
ACTIVITY_SPL_TOKEN_SPLIT_STAKE
ACTIVITY_SPL_TOKEN_MERGE_STAKE
ACTIVITY_SPL_VOTE_WITHDRAW
ACTIVITY_SPL_SET_OWNER_AUTHORITY
```

**Examples:**

```bash
# Get account details
solscan account detail --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# List SPL token accounts (default type=token)
solscan account tokens --address 2Ugqbvmp7A6iv87R39TNbWy6SDpQ6Usrzqh44hwGCbCx --page 1 --page-size 20

# List NFT accounts
solscan account tokens --address 2Ugqbvmp7A6iv87R39TNbWy6SDpQ6Usrzqh44hwGCbCx --type nft

# List token accounts, hide zero-balance entries
solscan account tokens --address 2Ugqbvmp7A6iv87R39TNbWy6SDpQ6Usrzqh44hwGCbCx --hide-zero

# List token holdings with USD values
solscan account portfolio --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Get metadata (label, tags, domain)
solscan account metadata --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Paginated transfers
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --page 2 --page-size 20

# Only incoming transfers
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --flow in

# Only outgoing transfers
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --flow out

# Only SPL transfers (no other activity types)
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --activity-type ACTIVITY_SPL_TRANSFER

# Transfers of a specific token
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Transfers in a specific time range
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --from-time 1700000000 --to-time 1700100000

# Transfers in USD value range
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --value 1,1000

# Incoming transfers from specific addresses
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --flow in --from addr1,addr2

# Get stake accounts sorted by active stake (descending)
solscan account stake --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --sort-by active_stake --sort-order desc

# Get stake accounts sorted by delegated stake (ascending)
solscan account stake --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --sort-by delegated_stake --sort-order asc

# Paginated stake accounts (page 2, 30 items per page)
solscan account stake --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --page 2 --page-size 30

# Batch metadata for multiple accounts
solscan account metadata-multi --addresses addr1,addr2,addr3

# Leaderboard
solscan account leaderboard --page 1 --page-size 20
```

---

### Token

Operations on SPL tokens.

```bash
solscan token <action> [options]
```

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `meta` | Get name, symbol, decimals, supply | `--address <mint>` | — |
| `meta-multi` | Batch token metadata | `--addresses <mint1,mint2,...>` | — |
| `holders` | Top holders with amounts | `--address <mint>` | `--page`, `--page-size` |
| `price` | Current USD price | `--address <mint>` | — |
| `price-multi` | Batch prices | `--addresses <mint1,mint2,...>` | — |
| `markets` | DEX markets trading this token | `--address <mint>` | `--page` |
| `trending` | Currently trending tokens | — | `--limit` |
| `list` | Full token list | — | `--page`, `--page-size`, `--sort-by`, `--direction` |
| `top` | Top tokens by market cap | — | `--filter` |
| `latest` | Newly listed tokens | — | `--limit` |
| `transfers` | Token transfer history | `--address <mint>` | `--page`, `--page-size` |
| `defi` | DeFi activity for token | `--address <mint>` | `--page`, `--page-size` |
| `defi-export` | Export DeFi activities (CSV) | `--address <mint>` | — |
| `historical` | Historical price chart data | `--address <mint>` | `--type`, `--time-from`, `--time-to` |
| `search` | Search tokens by keyword | `--query <keyword>` | — |

**Option details for `list`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--sort-by <field>` | Sort field (e.g. `market_cap_rank`, `volume`) | `market_cap_rank` |
| `--direction <dir>` | `asc` or `desc` | `asc` |

**Option details for `historical`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--type <type>` | Chart type (e.g. `line`) | `line` |
| `--time-from <ts>` | Start timestamp (unix seconds) | — |
| `--time-to <ts>` | End timestamp (unix seconds) | — |

**Examples:**

```bash
# Get trending tokens
solscan token trending

# Get token metadata
solscan token meta --address So11111111111111111111111111111111111111112

# Check price of multiple tokens at once
solscan token price-multi --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Search for a token by name
solscan token search --query "bonk"

# List tokens sorted by volume, descending
solscan token list --sort-by volume --direction desc --page-size 20

# Get historical price data for a date range
solscan token historical --address So11111111111111111111111111111111111111112 --time-from 1700000000 --time-to 1700100000

# Top 5 trending tokens in table format
solscan token trending --limit 5 --no-json
```

---

### Transaction

Operations on Solana transactions.

```bash
solscan transaction <action> [options]
```

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `detail` | Full transaction details | `--signature <sig>` | — |
| `detail-multi` | Batch transaction details | `--signatures <sig1,sig2,...>` | — |
| `last` | Most recent transactions on-chain | — | `--limit` |
| `actions` | Human-readable decoded actions | `--signature <sig>` | — |
| `actions-multi` | Batch decoded actions | `--signatures <sig1,sig2,...>` | — |
| `fees` | Fee breakdown | `--signature <sig>` | — |

**Examples:**

```bash
# Get last 5 transactions
solscan transaction last --limit 5

# Decode a transaction's actions
solscan transaction actions --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

# Get fee breakdown
solscan transaction fees --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

# Batch lookup multiple transactions
solscan transaction detail-multi --signatures sig1,sig2,sig3
```

---

### NFT

Operations on Solana NFTs and collections.

```bash
solscan nft <action> [options]
```

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `news` | Latest NFT activity feed | — | — |
| `activities` | NFT transfer/sale history | `--address <addr>` | `--page` |
| `collections` | Top NFT collections | — | `--page`, `--page-size` |
| `items` | Items inside a collection | `--address <collection>` | `--page`, `--page-size` |

**Examples:**

```bash
# Get latest NFT news
solscan nft news

# List top NFT collections
solscan nft collections --page-size 20

# Get items in a collection
solscan nft items --address DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x --page 1

# NFT activity history
solscan nft activities --address DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x
```

---

### Block

Operations on Solana blocks (slots).

```bash
solscan block <action> [options]
```

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `last` | Most recent blocks | — | `--limit` (10, 20, 30, 40, 60, 100) |
| `detail` | Block metadata by slot number | `--block <slot>` | — |
| `transactions` | All transactions in a block | `--block <slot>` | `--page`, `--page-size` |

**Examples:**

```bash
# Get last 20 blocks
solscan block last --limit 20

# Get block detail by slot number
solscan block detail --block 250000000

# List transactions in a block
solscan block transactions --block 250000000 --page 1 --page-size 20
```

---

### Market

Market overview and volume data.

```bash
solscan market <action>
```

| Action | Description |
|--------|-------------|
| `list` | All trading pools/markets |
| `info` | General market overview |
| `volume` | 24h volume data |

**Examples:**

```bash
solscan market list
solscan market info
solscan market volume
```

---

### Program

Operations on Solana programs (smart contracts).

```bash
solscan program <action> [options]
```

| Action | Description | Required Options | Optional Options |
|--------|-------------|------------------|------------------|
| `list` | All indexed programs | — | `--page`, `--page-size`, `--sort-by`, `--direction` |
| `popular` | Most-used programs/platforms | — | — |
| `analytics` | Usage stats for a program | `--address <addr>` | `--type` |

**Option details for `list`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--sort-by <field>` | Sort field (e.g. `tx_count_24h`) | `tx_count_24h` |
| `--direction <dir>` | `asc` or `desc` | `desc` |

**Option details for `analytics`:**

| Option | Description | Default |
|--------|-------------|---------|
| `--type <range>` | Time range (e.g. `24h`) | `24h` |

**Examples:**

```bash
# List programs sorted by 24h transaction count
solscan program list --sort-by tx_count_24h --direction desc

# Get popular platforms
solscan program popular

# Get analytics for a specific program
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --type 24h
```

---

### Monitor

Monitor your API key usage and rate limits.

```bash
solscan monitor <action>
```

| Action | Description |
|--------|-------------|
| `usage` | API key usage & rate limit stats |

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
So11111111111111111111111111111111111111111111112     SOL     Wrapped SOL  175.42
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v      USDC    USD Coin     1.00
```

---

## Error Handling

The CLI provides clear error messages for common API issues:

| HTTP Code | Message | Suggested Action |
|-----------|---------|------------------|
| `400` | Bad request — check your parameters | Verify address format and parameter values |
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

# Step 2: View token holdings with USD values
solscan account portfolio --address <WALLET>

# Step 3: Review recent transfer activity
solscan account transfers --address <WALLET> --page-size 20

# Step 3b (optional): Filter transfers - incoming only
solscan account transfers --address <WALLET> --flow in --page-size 20

# Step 3c (optional): Filter transfers - by token
solscan account transfers --address <WALLET> --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --flow out

# Step 3d (optional): Filter transfers - large value only
solscan account transfers --address <WALLET> --value 100,999999 --exclude-amount-zero

# Step 4: Check DeFi protocol interactions
solscan account defi --address <WALLET>

# Step 5: View staking positions (sorted by active stake)
solscan account stake --address <WALLET> --sort-by active_stake --sort-order desc
```

### Token Analysis Workflow

Analyze a token before trading:

```bash
# Step 1: Confirm token identity
solscan token meta --address <MINT>

# Step 2: Get current price
solscan token price --address <MINT>

# Step 3: Check holder concentration
solscan token holders --address <MINT> --page-size 20

# Step 4: Find best liquidity pools
solscan token markets --address <MINT>

# Step 5: View historical price data
solscan token historical --address <MINT> --type line
```

### Transaction Inspection

Debug or verify a transaction:

```bash
# Get full transaction details
solscan transaction detail --signature <SIG>

# Decode into human-readable actions
solscan transaction actions --signature <SIG>

# Check fees paid
solscan transaction fees --signature <SIG>
```

### Quick Market Overview

```bash
# See what's trending right now
solscan token trending --limit 20 --no-json

# Get market-wide stats
solscan market info

# Check 24h volume
solscan market volume

# Monitor your API usage
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
│       ├── account.js          # 15 account actions
│       ├── token.js            # 15 token actions
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

Many commands support pagination with these common options:

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number (1-based) | `1` |
| `--page-size <number>` | Results per page | `10` |

Some commands use `--limit` instead of pagination:

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Maximum number of results to return | `10` |

---

## Help

Every command and sub-command supports `--help`:

```bash
solscan --help
solscan account --help
solscan token meta --help
```

---

## API Reference

This CLI wraps the **Solscan Pro API v2.0**.

- API Documentation: [pro-api.solscan.io/pro-api-docs/v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0)
- API FAQs: [pro-api.solscan.io/pro-api-docs/v2.0/faq.md](https://pro-api.solscan.io/pro-api-docs/v2.0/faq.md)

---

## License

MIT
