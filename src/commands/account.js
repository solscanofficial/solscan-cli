import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerAccountCommand(program) {
  const account = program.command('account').description('Account operations');

  account
    .command('detail')
    .description('Get account details')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/detail', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('data-decoded')
    .description('Get decoded account data')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/data-decoded', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('tokens')
    .description('Get token accounts')
    .requiredOption('--address <address>', 'Account address')
    .option('--type <type>', 'Token type: token | nft', 'token')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--hide-zero', 'Hide accounts with zero balance')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/token-accounts', {
        address: opts.address,
        type: opts.type,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        hide_zero: opts.hideZero ? true : undefined,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('transactions')
    .description('Get transactions')
    .requiredOption('--address <address>', 'Account address')
    .option('--before <signature>', 'Transaction signature for pagination')
    .option('--limit <number>', 'Number of transactions (10, 20, 30, 40)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/transactions', {
        address: opts.address,
        before: opts.before,
        limit: opts.limit ? parseInt(opts.limit) : undefined,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('transfers')
    .description('Get transfers')
    .requiredOption('--address <address>', 'Account address')
    .option('--activity-type <types>', 'Comma-separated activity types (e.g. ACTIVITY_SPL_TRANSFER,ACTIVITY_SPL_BURN)')
    .option('--token-account <account>', 'Filter by specific token account')
    .option('--from <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--exclude-from <addresses>', 'Exclude source addresses (max 5)')
    .option('--to <addresses>', 'Comma-separated destination addresses (max 5)')
    .option('--exclude-to <addresses>', 'Exclude destination addresses (max 5)')
    .option('--token <tokens>', 'Comma-separated token addresses (max 5)')
    .option('--amount <min>,<max>', 'Amount range (e.g. 0,100)')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--exclude-amount-zero', 'Exclude zero amount transfers')
    .option('--flow <direction>', 'Transfer direction: in | out')
    .option('--value <min>,<max>', 'USD value range (e.g. 1,1000)')
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

      // Add optional filters
      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.tokenAccount) params.token_account = opts.tokenAccount;
      if (opts.from) params.from = opts.from;
      if (opts.excludeFrom) params.exclude_from = opts.excludeFrom;
      if (opts.to) params.to = opts.to;
      if (opts.excludeTo) params.exclude_to = opts.excludeTo;
      if (opts.token) params.token = opts.token;
      if (opts.amount) {
        const [min, max] = opts.amount.split(',');
        params.amount = [parseFloat(min), parseFloat(max)];
      }
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.excludeAmountZero) params.exclude_amount_zero = true;
      if (opts.flow) params.flow = opts.flow;
      if (opts.value) {
        const [min, max] = opts.value.split(',');
        params.value = [parseFloat(min), parseFloat(max)];
      }
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/transfer', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('stake')
    .description('Get stake accounts')
    .requiredOption('--address <address>', 'Account address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--sort-by <field>', 'Sort field: active_stake | delegated_stake', 'active_stake')
    .option('--sort-order <order>', 'Sort order: asc | desc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
      };
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/stake', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('portfolio')
    .description('Get portfolio')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/portfolio', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('defi')
    .description('Get DeFi activities')
    .requiredOption('--address <address>', 'Account address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/defi/activities', {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('defi-export')
    .description('Export DeFi activities')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/defi/activities/export', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('balance-change')
    .description('Get balance changes')
    .requiredOption('--address <address>', 'Account address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/balance_change', {
        address: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('reward-export')
    .description('Export rewards')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/reward/export', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('transfer-export')
    .description('Export transfers')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/transfer/export', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('metadata')
    .description('Get account metadata')
    .requiredOption('--address <address>', 'Account address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/metadata', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('metadata-multi')
    .description('Get multiple account metadata')
    .requiredOption('--addresses <addresses>', 'Comma-separated addresses')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const data = await makeRequest('/account/metadata/multi', { address: addressArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('leaderboard')
    .description('Get account leaderboard')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/leaderboard', {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
