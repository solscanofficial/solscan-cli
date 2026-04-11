import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerMarketCommand(program) {
  const market = program.command('market').description('Market operations');

  market
    .command('list')
    .description('Get the list of pool markets')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .option('--program <address>', 'Filter by program owner address')
    .option('--token-address <address>', 'Filter by token address')
    .option('--sort-by <field>', 'Sort field: created_time | volumes_24h | trades_24h', 'volumes_24h')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
        sort_order: opts.sortOrder,
      };
      if (opts.program) params.program = opts.program;
      if (opts.tokenAddress) params.token_address = opts.tokenAddress;
      const data = await makeRequest('/market/list', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('info')
    .description('Get token market info')
    .requiredOption('--address <address>', 'Market ID')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/market/info', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('volume')
    .description('Get historical market volume data')
    .requiredOption('--address <address>', 'Market ID')
    .option('--time <start>,<end>', 'Time range in YYYYMMDD format (e.g. 20240701,20240715)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };
      if (opts.time) {
        const parts = opts.time.split(',');
        params.time = parts.map(t => parseInt(t.trim()));
      }
      const data = await makeRequest('/market/volume', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('positions')
    .description('Get market positions')
    .requiredOption('--address <address>', 'Market ID')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--sort-by <field>', 'Sort field: position_value | created_time', 'position_value')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--in-range', 'Filter positions that are in range')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
      };
      if (opts.sortOrder) params.sort_order = opts.sortOrder;
      if (opts.inRange) params.in_range = true;
      const data = await makeRequest('/market/positions', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
