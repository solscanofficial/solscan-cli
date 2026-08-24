# Market Response Fields — Info

Field-by-field description of the JSON the `market info` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../market.md](../market.md) for flags/params).

This covers a **single pool's static details** — its token reserves and creation metadata — as opposed to the bulk listing ([market-list.md](market-list.md)) or its volume/TVL time series ([market-volume.md](market-volume.md)).

## `info`

`solscan market info --address <POOL_ADDRESS>`

`data` is a single **object**, not an array. `--address` is the pool/market address (not a token mint).

| Field | Type | Description |
|-------|------|--------------|
| `pool_address` | string | The pool address (echoes `--address`). |
| `program_id` | string | Address of the DEX/AMM program that owns the pool. |
| `tokens_info` | array | The pool's token reserves — see below. |
| `tokens_info[].token` | string | Mint address of this side of the pool. |
| `tokens_info[].token_account` | string | The pool's vault token account holding this side's reserves. |
| `tokens_info[].amount` | number | Current reserve amount, in the token's native (human-readable) units. |
| `create_tx_hash` | string | Signature of the transaction that created the pool. |
| `create_block_time` | number | Unix epoch time the pool was created. |
| `creator` | string | Address that created the pool. |
| `lp_token` | string | Mint address of the pool's LP token, if the pool issues one (some CLMM-style pools don't — see interpretation tips). |

**Example** (`solscan market info --address Gf7sXMoP8iRw4iiXmJ1nq4vxcRycbGXy5RL8a8LnTd3v`)

```json
{
  "success": true,
  "data": {
    "pool_address": "Gf7sXMoP8iRw4iiXmJ1nq4vxcRycbGXy5RL8a8LnTd3v",
    "program_id": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
    "tokens_info": [
      {
        "token": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "token_account": "nML7msD1MiJHxFvhv4po1u6C4KpWr64ugKqc75DMuD2",
        "amount": 1569498.559462
      },
      {
        "token": "So11111111111111111111111111111111111111112",
        "token_account": "EjHirXt2bQd2DDNveagHHCWYzUwtY1iwNbBrV5j84e6j",
        "amount": 12415.326311216
      }
    ],
    "create_tx_hash": "4WAGxnmaLfhTm1LdqqLwWscZ8RSuHzGpzyzHMmms3Fh7npb2yAdxDHhGmgfYKPJV5PoeLaVZN3Sow6MGYRVMfP4J",
    "create_block_time": 1742550586,
    "creator": "H7FytKZiPXofaCWyAgPJH7RojeNLroYQyzWuACX5RfQJ",
    "lp_token": "97w26BXNbjXmigPaaRPcRbuPRnnPV49PFyD3oLiwryg4"
  }
}
```

**Interpretation tips**

- `tokens_info` order is not guaranteed to match any particular token — check each entry's `token` field rather than assuming index 0/1 maps to a specific side.
- `amount` is already in human-readable units (decimals applied), not raw base units.
- `lp_token` may be absent or a placeholder for concentrated-liquidity (CLMM) pools that mint per-position NFTs instead of a fungible LP token — don't assume every pool has one.
- To get this same pool's activity/volume trend, follow up with `market volume --address <pool_address>` using the `pool_address` returned here.
