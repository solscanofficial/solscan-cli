import { Command } from 'commander';
import { registerConfigCommand } from './config.js';
import { registerAccountCommand } from './commands/account.js';
import { registerTokenCommand } from './commands/token.js';
import { registerTransactionCommand } from './commands/transaction.js';
import { registerNftCommand } from './commands/nft.js';
import { registerBlockCommand } from './commands/block.js';
import { registerMarketCommand } from './commands/market.js';
import { registerProgramCommand } from './commands/program.js';
import { registerMonitorCommand } from './commands/monitor.js';

export function createProgram() {
  const program = new Command();

  program
    .name('solscan')
    .description('CLI tool for querying Solana blockchain data via Solscan Pro API v2.0')
    .version('1.0.0')
    .option('--json', 'Output as formatted JSON (default)', true)
    .option('--no-json', 'Output as human-readable table/text')
    .option('--api-key <key>', 'Override API key for this invocation');

  registerConfigCommand(program);
  registerAccountCommand(program);
  registerTokenCommand(program);
  registerTransactionCommand(program);
  registerNftCommand(program);
  registerBlockCommand(program);
  registerMarketCommand(program);
  registerProgramCommand(program);
  registerMonitorCommand(program);

  return program;
}
