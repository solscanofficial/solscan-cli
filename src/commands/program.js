import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerProgramCommand(program) {
  const prog = program.command('program').description('Program operations');

  prog
    .command('list')
    .description('Get list of programs active in 90 days')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--sort-by <field>', 'Sort field: num_txs | num_txs_success | interaction_volume | success_rate | active_users_24h', 'num_txs')
    .option('--sort-order <order>', 'Sort order: asc | desc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
      };
      if (opts.sortOrder) params.sort_order = opts.sortOrder;
      const data = await makeRequest('/program/list', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  prog
    .command('popular')
    .description('Get the list of popular defi platforms')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/program/popular/platforms', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  prog
    .command('analytics')
    .description('Get comprehensive on-chain analytics for a Solana program')
    .requiredOption('--address <address>', 'A program address on solana blockchain')
    .requiredOption('--range <days>', 'Time range in days: 7 | 30')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/program/analytics', {
        address: opts.address,
        range: parseInt(opts.range),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
