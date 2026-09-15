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
    .option('--in-range <boolean>', 'Filter positions: true (in range) | false (out of range)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
      };
      if (opts.sortOrder) params.sort_order = opts.sortOrder;
      if (opts.inRange !== undefined) params.in_range = opts.inRange === 'true';
      const data = await makeRequest('/market/positions', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('price-ohlcv')
    .description('Get market pool price OHLCV (Open, High, Low, Close, Volume) candle data')
    .requiredOption('--address <address>', 'Pool market address to fetch OHLCV data for')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--res <resolution>', 'Candle resolution: 1m|5m|15m|30m|1h|4h|8h|1d|1W|1M|1Y', '1m')
    .option('--candles <number>', 'Number of candles returned (max 1000)', '600')
    .option('--cursor <number>', 'Pagination cursor from a previous response to fetch the next page')
    .option('--direction <direction>', 'Direction of calculation, by base or quote token on the pool', 'quote')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.res) params.res = opts.res;
      if (opts.candles) params.candles = parseInt(opts.candles);
      if (opts.cursor) params.cursor = parseInt(opts.cursor);
      if (opts.direction) params.direction = opts.direction;
      const data = await makeRequest('/market/price-ohlcv', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
