import { makeRequest } from '../api.js';
import { printOutput, saveToCsv } from '../formatter.js';

export function registerTokenCommand(program) {
  const token = program.command('token').description('Token operations');

  token
    .command('meta')
    .description('Get the metadata of a token')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/meta', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('meta-multi')
    .description('Get the metadata of multiple tokens (max 50)')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses (max 50)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const data = await makeRequest('/token/meta/multi', { address: addressArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('holders')
    .description('Get the list of token holders')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--from-amount <amount>', 'Filter holders by minimum token holding amount')
    .option('--to-amount <amount>', 'Filter holders by maximum token holding amount')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.fromAmount) params.from_amount = opts.fromAmount;
      if (opts.toAmount) params.to_amount = opts.toAmount;
      const data = await makeRequest('/token/holders', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price')
    .description('Get price of a token (deprecated: use token price-latest instead)')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .option('--from-time <date>', 'Start date (YYYYMMDD format)')
    .option('--to-time <date>', 'End date (YYYYMMDD format)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      const data = await makeRequest('/token/price', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price-multi')
    .description('Get the token price of multiple tokens (max 50) (deprecated: use token price-latest instead)')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses (max 50)')
    .option('--from-time <date>', 'Start date (YYYYMMDD format)')
    .option('--to-time <date>', 'End date (YYYYMMDD format)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const params = { address: addressArray };
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      const data = await makeRequest('/token/price/multi', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price-latest')
    .description('Get the latest price of multiple tokens (max 50)')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses (max 50)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const data = await makeRequest('/token/price/latest', { address: addressArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('price-history')
    .description('Get the historical price of multiple tokens (max 50)')
    .requiredOption('--addresses <addresses>', 'Comma-separated token addresses (max 50)')
    .option('--from-time <date>', 'Start date (YYYYMMDD format)')
    .option('--to-time <date>', 'End date (YYYYMMDD format)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const params = { address: addressArray };
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      const data = await makeRequest('/token/price/history', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('markets')
    .description('Get token markets. Pass 1 token to search all markets; pass 2 tokens to search by pair')
    .requiredOption('--token <tokens>', 'Token address(es), comma-separated (1 or 2)')
    .option('--sort-by <field>', 'Sort field: volume | trade | tvl | trader')
    .option('--program <addresses>', 'Comma-separated program addresses (max 5)')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const tokenArray = opts.token.split(',').map(a => a.trim());
      const params = {
        token: tokenArray,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.sortBy) params.sort_by = opts.sortBy;
      if (opts.program) params.program = opts.program.split(',').map(a => a.trim());
      const data = await makeRequest('/token/markets', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('trending')
    .description('Get the list of trending tokens')
    .option('--limit <number>', 'Number of results (max 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/trending', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('list')
    .description('Get the list of tokens. Supports up to 50,000 items per query.')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .option('--sort-by <field>', 'Sort field: holder | market_cap | created_time', 'market_cap')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/list', {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
        sort_order: opts.sortOrder,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('top')
    .description('Get the list of top tokens')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/top', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('latest')
    .description('Get the list of recently created tokens')
    .option('--platform-id <platform>', 'Filter by platform: jupiter | raydium | orca | pumpfun | meteora | ...')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.platformId) params.platform_id = opts.platformId;
      const data = await makeRequest('/token/latest', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('transfers')
    .description('Get transfer data of a token')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .option('--activity-type <types>', 'Comma-separated activity types (e.g. ACTIVITY_SPL_TRANSFER,ACTIVITY_SPL_BURN)')
    .option('--from <addresses>', 'Source addresses, comma-separated (max 5)')
    .option('--exclude-from <addresses>', 'Exclude source addresses, comma-separated (max 5)')
    .option('--to <addresses>', 'Destination addresses, comma-separated (max 5)')
    .option('--exclude-to <addresses>', 'Exclude destination addresses, comma-separated (max 5)')
    .option('--amount <min>,<max>', 'Filter by amount range (e.g. 1,100)')
    .option('--value <min>,<max>', 'Filter by USD value range (e.g. 1,1000)')
    .option('--exclude-amount-zero', 'Excludes transfers that have amount is zero')
    .option('--sort-by <field>', 'Sort field: block_time', 'block_time')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };

      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.from) params.from = opts.from;
      if (opts.excludeFrom) params.exclude_from = opts.excludeFrom;
      if (opts.to) params.to = opts.to;
      if (opts.excludeTo) params.exclude_to = opts.excludeTo;
      if (opts.amount) {
        const [min, max] = opts.amount.split(',');
        params.amount = [parseFloat(min), parseFloat(max)];
      }
      if (opts.value) {
        const [min, max] = opts.value.split(',');
        params.value = [parseFloat(min), parseFloat(max)];
      }
      if (opts.excludeAmountZero) params.exclude_amount_zero = true;
      if (opts.sortBy) params.sort_by = opts.sortBy;
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/token/transfer', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('defi')
    .description('Get defi activities involving a token')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .option('--activity-type <types>', 'Comma-separated DeFi activity types (e.g. ACTIVITY_TOKEN_SWAP,ACTIVITY_TOKEN_ADD_LIQ)')
    .option('--from <address>', 'Filter activities from an address')
    .option('--platform <addresses>', 'Comma-separated platform addresses (max 5)')
    .option('--source <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--sort-by <field>', 'Sort field: block_time', 'block_time')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };

      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.from) params.from = opts.from;
      if (opts.platform) params.platform = opts.platform.split(',');
      if (opts.source) params.source = opts.source.split(',');
      if (opts.token) params.token = opts.token;
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.sortBy) params.sort_by = opts.sortBy;
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/token/defi/activities', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('defi-export')
    .description('Export defi activities of a token')
    .requiredOption('--address <address>', 'A token address on solana blockchain')
    .option('--activity-type <types>', 'Comma-separated DeFi activity types')
    .option('--from <address>', 'Filter activities from an address')
    .option('--platform <addresses>', 'Comma-separated platform addresses (max 5)')
    .option('--source <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--sort-by <field>', 'Sort field: block_time', 'block_time')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .option('--output <file>', 'Save result to a csv file (e.g. out.csv)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };

      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.from) params.from = opts.from;
      if (opts.platform) params.platform = opts.platform.split(',');
      if (opts.source) params.source = opts.source.split(',');
      if (opts.token) params.token = opts.token;
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.sortBy) params.sort_by = opts.sortBy;
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/token/defi/activities/export', params, { apiKey: root.apiKey });
      if (opts.output) {
        saveToCsv(opts.output, data);
      } else {
        printOutput(data, root.json);
      }
    });

  token
    .command('historical')
    .description('Get token historical data')
    .requiredOption('--address <address>', 'The token address')
    .option('--range <days>', 'Time range in days: 7 | 30', '7')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/token/historical-data', {
        address: opts.address,
        range: parseInt(opts.range),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  token
    .command('search')
    .description('Search for tokens by name, symbol or token address')
    .requiredOption('--keyword <keyword>', 'Search keyword (name, symbol, or address)')
    .option('--search-mode <mode>', 'Search mode: exact | fuzzy', 'exact')
    .option('--search-by <field>', 'Search by: combination | address | name | symbol', 'combination')
    .option('--exclude-unverified', 'Exclude unverified tokens')
    .option('--sort-by <field>', 'Sort field: reputation | market_cap | volume_24h', 'reputation')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        keyword: opts.keyword,
        search_mode: opts.searchMode,
        search_by: opts.searchBy,
        sort_by: opts.sortBy,
        sort_order: opts.sortOrder,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.excludeUnverified) params.exclude_unverified_token = true;
      const data = await makeRequest('/token/search', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
