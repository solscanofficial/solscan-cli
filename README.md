# Solscan CLI

Command-line tool for querying Solana blockchain data via the [Solscan Pro API v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0) — accounts, tokens, transactions, NFTs, blocks, markets, programs, and API monitoring. 59+ actions, JSON and human-readable output.

Ships with a bundled [Agent Skill](#agent-skills) so AI coding assistants (Claude Code and others) query Solana data through this CLI instead of scraping solscan.io or guessing at the API.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [CLI Reference](#cli-reference)
- [Usage Examples](#usage-examples)
- [Typical Workflows](#typical-workflows)
- [Output Modes](#output-modes)
- [Error Handling](#error-handling)
- [Agent Skills](#agent-skills)
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
node bin/solscan.js <command>
```

### Link globally (from a local clone)

```bash
npm link
```

After linking, `solscan` becomes available system-wide.

### Via npx (no install)

```bash
npx solscan-cli <command>
```

---

## Configuration

All requests need a Solscan Pro API key, resolved in this priority order:

| Priority | Source | How to set |
|----------|--------|------------|
| 1 (highest) | `--api-key` flag | `solscan --api-key <KEY> token trending` |
| 2 | Environment variable | `export SOLSCAN_API_KEY=<KEY>` |
| 3 (lowest) | Stored config file | `solscan config set-api-key <KEY>` |

```bash
# Save your key once — persisted to ~/.config/solscan-cli/config.json
solscan config set-api-key YOUR_API_KEY_HERE

# Check what's currently configured and from where
solscan config show
```

---

## Usage

```
solscan [global-options] <resource> <action> [action-options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--json` | Output as formatted JSON | `true` |
| `--no-json` | Output as human-readable table/text | — |
| `--api-key <key>` | Override API key for this invocation | — |
| `-V, --version` | Show version number | — |
| `-h, --help` | Show help — works on every command and subcommand | — |

---

## CLI Reference

Every action's full option table, default values, valid enums, and pagination rules live in [`skills/solscan-cli/references/`](skills/solscan-cli/references/) — one file per resource, kept in sync with the actual `src/commands/*.js` implementations. This README only covers the shape of things and a handful of common examples; treat the reference files as the source of truth for exact flags.

| Resource | Actions | Full reference |
|----------|---------|-----------------|
| `account` | `detail`, `data-decoded`, `metadata`, `metadata-multi`, `funded-by`, `tokens`, `transactions`, `transactions-enhanced`, `transfers`, `transfer-total`, `transfer-export`, `defi`, `defi-export`, `balance-change`, `portfolio`, `stake`, `stake-rewards`, `reward-export`, `leaderboard` | [references/account.md](skills/solscan-cli/references/account.md) |
| `token` | `meta`, `meta-multi`, `price-latest`, `price-history`, `holders`, `markets`, `transfers`, `defi`, `defi-export`, `historical`, `search`, `trending`, `list`, `top`, `latest` | [references/token.md](skills/solscan-cli/references/token.md) |
| `transaction` | `detail`, `detail-multi`, `actions`, `actions-multi`, `last`, `fees` | [references/transaction.md](skills/solscan-cli/references/transaction.md) |
| `nft` | `news`, `activities`, `collections`, `items` | [references/nft.md](skills/solscan-cli/references/nft.md) |
| `block` | `last`, `detail`, `transactions` | [references/block.md](skills/solscan-cli/references/block.md) |
| `market` | `list`, `info`, `volume`, `positions` | [references/market.md](skills/solscan-cli/references/market.md) |
| `program` | `list`, `popular`, `analytics` | [references/program.md](skills/solscan-cli/references/program.md) |
| `monitor` | `usage` | — (no options) |

**Pagination**: most list endpoints take `--page` (default `1`) and `--page-size` (default `10`; valid values vary by endpoint — `10/20/30/40/60/100` is most common). `account transactions` uses cursor-based `--before` instead. Some actions use `--limit` in place of page/page-size. See the reference file for exact valid values per action.

**Range filters** (`--amount`, `--value`, `--price`, market `--time`) take a single comma-separated flag value, e.g. `--value 100,999999` — not two separate arguments.

---

## Usage Examples

```bash
# Account: wallet detail + portfolio
solscan account detail --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
solscan account portfolio --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --exclude-low-score-tokens

# Account: incoming USDC transfers
solscan account transfers --address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
  --flow in --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Token: identity, price, holders
solscan token meta --address So11111111111111111111111111111111111111112
solscan token price-latest --addresses So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
solscan token holders --address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --from-value 10000 --to-value 100000

# Token: discovery
solscan token trending --limit 20 --no-json
solscan token latest --platform-id pumpfun --page-size 20

# Transaction: full detail vs. decoded human-readable actions
solscan transaction detail --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU
solscan transaction actions --signature 5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU

# NFT: collections and activity
solscan nft collections --range 7 --sort-by volumes --sort-order desc
solscan nft activities --collection DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x

# Block
solscan block last --limit 20
solscan block transactions --block 250000000 --exclude-vote --page-size 40

# Market: top pools, program analytics
solscan market list --sort-by volumes_24h --sort-order desc
solscan program analytics --address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --range 7

# Monitor your own API usage
solscan monitor usage
```

More examples — including CSV export (`*-export --output file.csv`), activity-type filters, and batch lookups (`*-multi`) — are in the per-resource reference files linked above.

---

## Typical Workflows

**Wallet research**: `account metadata` (known label?) → `account portfolio` (holdings) → `account transfers` (recent movement) → `account defi` (swap history)

**Token analysis**: `token meta` (confirm identity) → `token price-latest` → `token holders` (concentration) → `token markets` (liquidity) → `token historical`

**Transaction inspection**: `transaction actions` for a decoded human-readable summary, or `transaction detail` for raw balance-change/IDL data

---

## Output Modes

JSON is the default and best for piping into other tools; `--no-json` renders a readable table for direct terminal use:

```bash
solscan token trending --no-json
```
```
address                                             symbol  name         price
--------------------------------------------------  ------  -----------  ------
So11111111111111111111111111111111111111112        SOL     Wrapped SOL  175.42
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v         USDC    USD Coin     1.00
```

---

## Error Handling

| HTTP Code | Message | Suggested Action |
|-----------|---------|-------------------|
| `400` | Bad request — check your parameters | Verify address format, enum values (type, page_size, range, etc.) |
| `401` | Authentication failed | Run `solscan config set-api-key <KEY>` |
| `403` | Forbidden — insufficient permissions | Upgrade your API plan |
| `429` | Rate limit exceeded | Wait a moment and try again |
| `500` | Internal server error | Retry; report if persistent |

---

## Agent Skills

This repo ships [`skills/solscan-cli/SKILL.md`](skills/solscan-cli/SKILL.md) — an [Agent Skill](https://agentskills.io/) that teaches AI coding assistants how to drive this CLI directly: command shape, pagination/time-filter conventions, an action index, common workflows, and error-handling guidance, with the full per-resource parameter tables split into [`skills/solscan-cli/references/`](skills/solscan-cli/references/).

It's published inside the `solscan-cli` npm package, so any tool that discovers skills from an installed package's `skills/` folder picks it up automatically. For Claude Code, point it at the file directly or add the package's skill directory:

```bash
echo "$(npm root -g)/solscan-cli/skills/solscan-cli/SKILL.md"
```

If your AI agent tries to scrape solscan.io or call the Pro API directly instead of using this CLI, tell it: "Use the `solscan` CLI for all Solscan/Solana data lookups."

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
│   └── commands/                # account, token, transaction, nft, block, market, program, monitor
├── skills/
│   └── solscan-cli/
│       ├── SKILL.md              # Agent-facing usage guide
│       └── references/           # Full per-resource parameter reference
├── package.json
└── README.md
```

---

## API Reference

This CLI wraps the **Solscan Pro API v2.0**.

- API Documentation: [pro-api.solscan.io/pro-api-docs/v2.0](https://pro-api.solscan.io/pro-api-docs/v2.0)
- API FAQs: [pro-api.solscan.io/pro-api-docs/v2.0/faq.md](https://pro-api.solscan.io/pro-api-docs/v2.0/faq.md)

---

## License

MIT
