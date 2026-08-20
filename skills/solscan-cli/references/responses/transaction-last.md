# Transaction Response Fields — Last

Field-by-field description of the JSON the `transaction last` command returns. Read this when you need to interpret or extract specific fields from a response, not when you're just building the command (see [../transaction.md](../transaction.md) for flags/params). Shared envelope/error shape: [transaction.md](transaction.md#common-envelope).

This covers **the most recent transactions network-wide** — a lightweight, unpaginated summary feed — as opposed to full single-transaction detail (`transaction detail`, not yet documented at field level) which returns balance changes, IDL-decoded data, and per-instruction accounts.

## Contents

- [`last`](#last)
- [Item fields](#item-fields)
- [`parsed_instructions` item fields](#parsed_instructions-item-fields)
- [Interpretation tips](#interpretation-tips)

## `last`

`solscan transaction last [--limit 10|20|30|40|60|100] [--filter exceptVote|all]`

`data` is a **flat array** of transaction summary objects, most recent first. No pagination — `--limit` (default `10`) directly caps the array length, and `--filter` (default `exceptVote`) controls whether consensus vote transactions are included.

## Item fields

| Field | Type | Description |
|-------|------|--------------|
| `slot` | number | The slot number the transaction was confirmed in. |
| `fee` | number | Transaction fee, in **lamports** (not SOL) — divide by `1e9` for a human-readable SOL amount. |
| `status` | string | `"Success"` or `"Fail"` — no partial/unknown state is documented. |
| `signer` | array of string | The transaction's signer address(es). Despite the singular field name, this is an array — multisig or multi-signer transactions carry more than one entry. |
| `block_time` | number | Unix timestamp (seconds) of the slot. Same instant as `time`, different encoding — use whichever your code already parses. |
| `tx_hash` | string | The transaction signature. Pass this straight into `transaction detail --signature <tx_hash>` or `transaction actions --signature <tx_hash>` for a full breakdown. |
| `parsed_instructions` | array of object | The transaction's instructions, in execution order — see [below](#parsed_instructions-item-fields). Can contain many entries for a single transaction (e.g. batched/looped instructions), including duplicates. |
| `program_ids` | array of string | Deduplicated list of every program address touched by the transaction — a superset view of the `program_id`s appearing in `parsed_instructions` (also includes programs invoked without a decodable instruction, e.g. via CPI). |
| `time` | string | ISO 8601 timestamp of the slot (e.g. `"2024-08-09T09:01:24.000Z"`) — same instant as `block_time`, formatted for display rather than arithmetic. |

## `parsed_instructions` item fields

| Field | Type | Description |
|-------|------|--------------|
| `type` | string | The decoded instruction name (e.g. `"addProduct"`, `"transfer"`) — specific to the owning `program`, not a global enum. |
| `program` | string | Human-readable name of the program that owns the instruction (e.g. `"Pyth"`), when Solscan recognizes it. |
| `program_id` | string | The on-chain address of the program that owns the instruction. |

**Example** (per [Solscan's published reference](https://pro-api.solscan.io/v2.0/transaction/last), trimmed to 2 of 10 `parsed_instructions`):

```json
{
  "success": true,
  "data": [
    {
      "slot": 282493339,
      "fee": 5400,
      "status": "Success",
      "signer": ["28FBsXoAH8BPy8RT7RZtb8SMoJUVCPWVtZMeskxe6sPg"],
      "block_time": 1723194084,
      "tx_hash": "61zYZzrAR5HAdXyg41QpjoaZxL79aunWUhfxBtcSNGC6s11eHyTKCb3au6wNad1JddMAbATKTgoWPnooqeebc7KV",
      "parsed_instructions": [
        { "type": "addProduct", "program": "Pyth", "program_id": "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH" },
        { "type": "addProduct", "program": "Pyth", "program_id": "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH" }
      ],
      "program_ids": [
        "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH",
        "ComputeBudget111111111111111111111111111111"
      ],
      "time": "2024-08-09T09:01:24.000Z"
    }
  ]
}
```

## Interpretation tips

- `--filter` defaults to `exceptVote` because raw vote transactions (validator consensus votes) dominate network traffic and are rarely what a caller wants — pass `--filter all` explicitly if you need them included.
- `program_ids` is not guaranteed to be a superset union of *only* `parsed_instructions[].program_id` values re-deduplicated — it can include programs invoked via cross-program invocation (CPI) that Solscan didn't surface as a top-level parsed instruction (e.g. `ComputeBudget111111111111111111111111111111` in the example above never appears in `parsed_instructions`).
- This is a **summary/feed shape**, not full transaction detail — there's no balance-change, account-list, or raw-instruction-data field here. Follow up with `transaction detail --signature <tx_hash>` (or `transaction actions` for a decoded human-readable view) once you've picked a `tx_hash` of interest.
- There's no cursor, `total`, or next-page token in the response — `last` is a "most recent N" snapshot (max `--limit 100`), not built for exhaustive backfill/pagination. For historical or address-scoped transaction history, use `account transactions` / `account transactions-enhanced` instead.
- `fee` is in lamports, matching Solana RPC convention, while `block_time`/`time` both describe the same slot timestamp in two formats — don't treat them as independent data points.
