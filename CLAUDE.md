# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

- **Run the CLI**: `npm start` or `node bin/solscan.js <command>`
- **Run tests**: `npm test` (runs vitest in run mode)
- **Install dependencies**: `npm install`
- **Link globally**: `npm link` (installs `solscan` command system-wide)

## Project Overview

**solscan-cli** is a professional-grade Node.js CLI tool for querying Solana blockchain data via the Solscan Pro API v2.0. It supports 55+ actions across accounts, tokens, transactions, NFTs, blocks, markets, programs, and API monitoring — with both JSON and human-readable output modes.

**Requirements**: Node.js >= 18

## Architecture

### Core Components

1. **Entry Point** (`bin/solscan.js`)
   - Imports and executes the CLI program

2. **CLI Setup** (`src/cli.js`)
   - Uses `Commander.js` to define the CLI structure
   - Exports `createProgram()` which sets up global options and registers all command modules:
     - `--json` / `--no-json`: Output format control
     - `--api-key`: Override API key for single invocation
   - Registers command groups: config, account, token, transaction, nft, block, market, program, monitor

3. **API Layer** (`src/api.js`)
   - Centralized request handler via `makeRequest(endpoint, params, opts)`
   - Uses axios with Base URL: `https://pro-api.solscan.io/v2.0`
   - Handles API key resolution (flag > env var > stored config)
   - Strips undefined/null parameters before sending
   - Maps HTTP error codes to user-friendly messages

4. **Configuration** (`src/config.js`)
   - Uses `conf` package to persist config in `~/.config/solscan-cli/`
   - Exports `resolveApiKey()`: resolves from flag → env var `SOLSCAN_API_KEY` → stored config
   - Registers `config` command group with subcommands:
     - `config set-api-key <key>`: Store API key
     - `config show`: Display current configuration sources

5. **Output Formatting** (`src/formatter.js`)
   - `formatOutput(data, useJson)`: Converts data to JSON or human-readable format
   - `printOutput(data, useJson)`: Logs formatted output
   - `saveToCsv(filePath, csvStr)`: Writes CSV files
   - Handles arrays, nested objects, and metadata-plus-data structures (e.g., pagination info + results)

### Command Pattern

Each command file (`src/commands/*.js`) follows this structure:
```javascript
export function register<Name>Command(program) {
  const <name> = program.command('<name>').description('...');
  
  <name>
    .command('<subcommand>')
    .description('...')
    .requiredOption('--option <value>', 'Description')
    .option('--flag', 'Optional flag', 'default-value')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals(); // Includes global options like --json
      const data = await makeRequest('/endpoint', { /* params */ }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
```

Key patterns:
- Use `cmd.optsWithGlobals()` to access global options from parent program
- Parameters use camelCase; API parameters convert to snake_case (e.g., `opts.pageSize` → `page_size`)
- Always pass `root.apiKey` and `root.json` to API calls and output

## Testing

- Uses Vitest 2.0 (configured but test files not yet created)
- Run with: `npm test`
- Test file pattern: `*.test.js` or `*.spec.js`

## Dependencies

- **axios** (^1.7.0): HTTP client
- **chalk** (^5.3.0): CLI colors and styling (imported but not heavily used)
- **commander** (^12.1.0): CLI argument parsing and routing
- **conf** (^13.0.0): Persistent config storage
- **vitest** (^2.0.0): Testing framework (dev only)

## Key Implementation Details

1. **API Key Resolution**: Three-tier priority (flag > env > config). Check `resolveApiKey()` in config.js.
2. **Error Handling**: HTTP errors are caught in api.js and printed with friendly messages. Exit code is 1 on failure.
3. **Output Modes**: Global `--json` flag controls output across all commands. Default is JSON; use `--no-json` for human-readable.
4. **Parameter Filtering**: `stripEmpty()` in api.js removes undefined/null values before sending to API.
5. **Config Path**: Resolves to `~/.config/solscan-cli/` via the `conf` package (OS-aware paths).

## Common Development Tasks

- **Add a new command**: Create `src/commands/<name>.js` with a `register<Name>Command()` export, then import and call it in `createProgram()` (cli.js).
- **Add a subcommand**: Use `.command()` chaining in the existing command file (e.g., `account.command('new-action')`).
- **Modify output formatting**: Edit `formatOutput()` in formatter.js or add a specialized formatter function.
- **Change API endpoint**: Update the endpoint string in the `makeRequest()` call within the command's `.action()` handler.

## Notes

- No build step required (plain ES modules, Node.js 18+).
- No linter configured; consider adding ESLint for consistency.
- Chalk is imported but underutilized; consider expanding for better CLI styling.
- Testing infrastructure exists but tests are not yet implemented.
