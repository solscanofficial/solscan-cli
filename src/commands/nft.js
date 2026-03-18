import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerNftCommand(program) {
  const nft = program.command('nft').description('NFT operations');

  nft
    .command('news')
    .description('Get the list of new NFTs')
    .option('--filter <filter>', 'Filter type (created_time)', 'created_time')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (12, 24, 36)', '12')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/news', {
        filter: opts.filter,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('activities')
    .description('Get NFT activities')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--collection <address>', 'Filter by collection address')
    .option('--from <address>', 'Filter activities from an address')
    .option('--to <address>', 'Filter activities to an address')
    .option('--source <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--activity-type <types>', 'Comma-separated NFT activity types (e.g. ACTIVITY_NFT_SOLD,ACTIVITY_NFT_LISTING)')
    .option('--currency-token <address>', 'Filter by currency token address (needed for price filter)')
    .option('--price <min>,<max>', 'Filter by price range. Requires --currency-token (e.g. 1,2)')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };

      if (opts.token) params.token = opts.token;
      if (opts.collection) params.collection = opts.collection;
      if (opts.from) params.from = opts.from;
      if (opts.to) params.to = opts.to;
      if (opts.source) params.source = opts.source.split(',').map(a => a.trim());
      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.currencyToken) params.currency_token = opts.currencyToken;
      if (opts.price) {
        const [min, max] = opts.price.split(',');
        params.price = [parseFloat(min), parseFloat(max)];
      }
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);

      const data = await makeRequest('/nft/activities', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('collections')
    .description('Get the list of NFT collections')
    .option('--range <days>', 'Days range: 1 | 7 | 30', '1')
    .option('--sort-by <field>', 'Sort field: items | floor_price | volumes', 'volumes')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--collection <id>', 'Collection ID to filter')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        range: parseInt(opts.range),
        sort_by: opts.sortBy,
        sort_order: opts.sortOrder,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.collection) params.collection = opts.collection;
      const data = await makeRequest('/nft/collection/lists', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('items')
    .description('Get the list of items of a NFT collection')
    .requiredOption('--collection <id>', 'Collection ID')
    .option('--sort-by <field>', 'Sort field: last_trade | listing_price', 'last_trade')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (12, 24, 36)', '12')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/collection/items', {
        collection: opts.collection,
        sort_by: opts.sortBy,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
