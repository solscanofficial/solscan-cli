import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerTokenCommand(program) {
  const token = program.command('token').description('Token operations');

  token
    .command('meta')
    .description('Get token metadata')
    .requiredOption('--address <address>', 'Token mint address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/meta', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('meta-multi')
    .description('Get multiple token metadata')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/meta/multi', { address: opts.addresses }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('holders')
    .description('Get token holders')
    .requiredOption('--address <address>', 'Token mint address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/holders', {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price')
    .description('Get token price')
    .requiredOption('--address <address>', 'Token mint address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/price', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price-multi')
    .description('Get multiple token prices')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/price/multi', { address: opts.addresses }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('markets')
    .description('Get token markets')
    .requiredOption('--address <address>', 'Token mint address')
    .option('--page <number>', 'Page number', '1')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/markets', {
        address: opts.address,
        page: parseInt(opts.page),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('trending')
    .description('Get trending tokens')
    .option('--limit <number>', 'Number of results', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/trending', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('list')
    .description('List tokens')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .option('--sort-by <field>', 'Sort field', 'market_cap_rank')
    .option('--direction <dir>', 'Sort direction (asc/desc)', 'asc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/list', {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
        direction: opts.direction,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('top')
    .description('Get top tokens')
    .option('--filter <filter>', 'Filter type', 'all')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/top', { filter: opts.filter }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('latest')
    .description('Get latest tokens')
    .option('--limit <number>', 'Number of results', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/latest', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('transfers')
    .description('Get token transfers')
    .requiredOption('--address <address>', 'Token mint address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/transfer', {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('defi')
    .description('Get DeFi activities for token')
    .requiredOption('--address <address>', 'Token mint address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/defi/activities', {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('defi-export')
    .description('Export DeFi activities for token')
    .requiredOption('--address <address>', 'Token mint address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/defi/activities/export', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('historical')
    .description('Get historical price data')
    .requiredOption('--address <address>', 'Token mint address')
    .option('--type <type>', 'Chart type', 'line')
    .option('--time-from <timestamp>', 'Start timestamp (unix)')
    .option('--time-to <timestamp>', 'End timestamp (unix)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/historical-data', {
        address: opts.address,
        type: opts.type,
        time_from: opts.timeFrom ? parseInt(opts.timeFrom) : undefined,
        time_to: opts.timeTo ? parseInt(opts.timeTo) : undefined,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('search')
    .description('Search tokens by keyword')
    .requiredOption('--query <query>', 'Search query')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/search', { q: opts.query }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
