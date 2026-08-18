# NFT Reference

```bash
solscan nft <action> [options]
```

| Action | Description | Required | Optional |
|--------|-------------|----------|----------|
| `news` | Latest NFT activity feed | — | `--filter`, `--page`, `--page-size` |
| `activities` | Sales, listings, bids, transfers | — | `--token`, `--collection`, `--from`, `--to`, `--source`, `--activity-type`, `--currency-token`, `--price`, `--from-time`, `--to-time`, `--page`, `--page-size` |
| `collections` | Top collections by volume/items/floor price | — | `--range`, `--sort-by`, `--sort-order`, `--collection`, `--page`, `--page-size` |
| `items` | Items inside a collection | `--collection` | `--sort-by`, `--page`, `--page-size` |

## Option details

**`news`**: `--filter` `created_time` (only value currently) · `--page-size` `12/24/36` (default `12`).

**`activities`**: `--source` comma-separated max 5 · `--price <min>,<max>` (single comma-separated value) and **requires `--currency-token`** to be set · `--page-size` `10/20/30/40/60/100`.

Activity types:
```
ACTIVITY_NFT_SOLD ACTIVITY_NFT_LISTING ACTIVITY_NFT_BIDDING ACTIVITY_NFT_CANCEL_BID
ACTIVITY_NFT_CANCEL_LIST ACTIVITY_NFT_REJECT_BID ACTIVITY_NFT_UPDATE_PRICE ACTIVITY_NFT_LIST_AUCTION
```

**`collections`**: `--range` `1`(default)\|`7`\|`30` days · `--sort-by` `items`\|`floor_price`\|`volumes`(default) · `--page-size` `10/20/30/40`.

**`items`**: `--collection` required · `--sort-by` `last_trade`(default)\|`listing_price` · `--page-size` `12/24/36` (default `12`).

## Examples

```bash
solscan nft news --page-size 24
solscan nft activities --token DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x

# NFT sales only, priced in SOL, 1-10 SOL range
solscan nft activities --activity-type ACTIVITY_NFT_SOLD \
  --currency-token So11111111111111111111111111111111111111112 --price 1,10

solscan nft activities --collection DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x
solscan nft collections --range 7 --sort-by volumes --sort-order desc
solscan nft collections --sort-by floor_price --sort-order asc

solscan nft items --collection DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6WK3GChEySUpHSS4x --sort-by listing_price --page-size 24
```
