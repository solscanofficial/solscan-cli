import { makeRequest } from '../api.js';
import { printOutput, saveToCsv } from '../formatter.js';

export function registerAccountCommand(program) {
  const account = program.command('account').description('Account operations');

  account
    .command('detail')
    .description('Get the details of an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/detail', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('data-decoded')
    .description('Get data of account with decoded information')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/data-decoded', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('tokens')
    .description('Get token accounts of an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--type <type>', 'Type of token: token | nft', 'token')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40)', '10')
    .option('--hide-zero', 'Filter tokens that have amount is zero')
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
    .description('Get the list of transactions of an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--before <signature>', 'The signature of the latest transaction of previous page')
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
    .description('Get transfer data of an account')
    .requiredOption('--address <address>', 'Solana wallet address')
    .option('--activity-type <types>', 'Comma-separated activity types (e.g. ACTIVITY_SPL_TRANSFER,ACTIVITY_SPL_BURN)')
    .option('--token-account <account>', 'Filter transfers for a specific token account in the wallet')
    .option('--from <addresses>', 'Source addresses, comma-separated (max 5)')
    .option('--exclude-from <addresses>', 'Exclude source addresses, comma-separated (max 5)')
    .option('--to <addresses>', 'Destination addresses, comma-separated (max 5)')
    .option('--exclude-to <addresses>', 'Exclude destination addresses, comma-separated (max 5)')
    .option('--token <tokens>', 'Token addresses, comma-separated (max 5). Use So11111111111111111111111111111111111111111 for native SOL')
    .option('--amount <min>,<max>', 'Filter by amount range (e.g. 1,100)')
    .option('--value <min>,<max>', 'Filter by USD value range (e.g. 1,1000)')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--exclude-amount-zero', 'Exclude transfers with zero amount')
    .option('--flow <direction>', 'Filter by transfer direction: in | out')
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
      if (opts.value) {
        const [min, max] = opts.value.split(',');
        params.value = [parseFloat(min), parseFloat(max)];
      }
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.excludeAmountZero) params.exclude_amount_zero = true;
      if (opts.flow) params.flow = opts.flow;
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/transfer', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('stake')
    .description('Get the list of stake accounts of an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
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
    .description('Get the portfolio for a given address')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--exclude-low-score-tokens', 'Excludes tokens with low reputation scores')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };
      if (opts.excludeLowScoreTokens) params.exclude_low_score_tokens = true;
      const data = await makeRequest('/account/portfolio', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('defi')
    .description('Get defi activities involving an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--activity-type <types>', 'Comma-separated DeFi activity types (e.g. ACTIVITY_TOKEN_SWAP,ACTIVITY_TOKEN_ADD_LIQ)')
    .option('--from <address>', 'Filter activities from an address')
    .option('--platform <addresses>', 'Comma-separated platform addresses (max 5)')
    .option('--source <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
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
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/defi/activities', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('defi-export')
    .description('Export defi activities data of an account. Max 5000 items. Max 1 request per minute.')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--activity-type <types>', 'Comma-separated DeFi activity types')
    .option('--from <address>', 'Filter activities from an address')
    .option('--platform <addresses>', 'Comma-separated platform addresses (max 5)')
    .option('--source <addresses>', 'Comma-separated source addresses (max 5)')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--sort-order <order>', 'Sort order: asc | desc', 'desc')
    .option('--output <file>', 'Save result as JSON to a file (e.g. out.json)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };

      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.from) params.from = opts.from;
      if (opts.platform) params.platform = opts.platform.split(',');
      if (opts.source) params.source = opts.source.split(',');
      if (opts.token) params.token = opts.token;
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/defi/activities/export', params, { apiKey: root.apiKey });
      if (opts.output) {
        saveToCsv(opts.output, data);
      } else {
        printOutput(data, root.json);
      }
    });

  account
    .command('balance-change')
    .description('Get balance change activities involving an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--token-account <account>', 'A token account of wallet on solana blockchain')
    .option('--token <address>', 'Filter activities data by token address')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--remove-spam', 'Remove spam activities from the result')
    .option('--amount <min>,<max>', 'Filter by amount range (e.g. 1,100)')
    .option('--flow <direction>', 'Filter by change direction: in | out')
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

      if (opts.tokenAccount) params.token_account = opts.tokenAccount;
      if (opts.token) params.token = opts.token;
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.removeSpam) params.remove_spam = 'true';
      if (opts.amount) {
        const [min, max] = opts.amount.split(',');
        params.amount = [parseFloat(min), parseFloat(max)];
      }
      if (opts.flow) params.flow = opts.flow;
      if (opts.sortOrder) params.sort_order = opts.sortOrder;

      const data = await makeRequest('/account/balance_change', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('reward-export')
    .description('Export stake rewards for an account. Max 5000 items. Default: last 1 month. Max 1 request per minute.')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .option('--time-from <timestamp>', 'Start time (unix seconds). Default: 1 month before time-to')
    .option('--time-to <timestamp>', 'End time (unix seconds). Default: current time')
    .option('--output <file>', 'Save result to a csv file (e.g. out.csv)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };
      if (opts.timeFrom) params.time_from = parseInt(opts.timeFrom);
      if (opts.timeTo) params.time_to = parseInt(opts.timeTo);
      const data = await makeRequest('/account/reward/export', params, { apiKey: root.apiKey });
      if (opts.output) {
        saveToCsv(opts.output, data);
      } else {
        printOutput(data, root.json);
      }
    });

  account
    .command('transfer-export')
    .description('Export transfer data of an account. Max 5000 items. Max 1 request per minute.')
    .requiredOption('--address <address>', 'Solana wallet address')
    .option('--activity-type <types>', 'Comma-separated activity types')
    .option('--token-account <account>', 'Filter transfers for a specific token account in the wallet')
    .option('--from <address>', 'Filter transfers from an address')
    .option('--to <address>', 'Filter transfers to an address')
    .option('--token <address>', 'Filter by token address. Use So11111111111111111111111111111111111111111 for native SOL')
    .option('--amount <min>,<max>', 'Filter by amount range (e.g. 1,100)')
    .option('--from-time <timestamp>', 'Start time (unix seconds)')
    .option('--to-time <timestamp>', 'End time (unix seconds)')
    .option('--exclude-amount-zero', 'Exclude transfers with zero amount')
    .option('--flow <direction>', 'Filter by transfer direction: in | out')
    .option('--output <file>', 'Save result to a csv file (e.g. out.csv)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = { address: opts.address };

      if (opts.activityType) params.activity_type = opts.activityType.split(',');
      if (opts.tokenAccount) params.token_account = opts.tokenAccount;
      if (opts.from) params.from = opts.from;
      if (opts.to) params.to = opts.to;
      if (opts.token) params.token = opts.token;
      if (opts.amount) {
        const [min, max] = opts.amount.split(',');
        params.amount = [parseFloat(min), parseFloat(max)];
      }
      if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
      if (opts.toTime) params.to_time = parseInt(opts.toTime);
      if (opts.excludeAmountZero) params.exclude_amount_zero = true;
      if (opts.flow) params.flow = opts.flow;

      const data = await makeRequest('/account/transfer/export', params, { apiKey: root.apiKey });
      if (opts.output) {
        saveToCsv(opts.output, data);
      } else {
        printOutput(data, root.json);
      }
    });

  account
    .command('metadata')
    .description('Get the metadata of an account')
    .requiredOption('--address <address>', 'A wallet address on solana blockchain')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/account/metadata', { address: opts.address }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('metadata-multi')
    .description('Get the metadata of multiple accounts (max 50)')
    .requiredOption('--addresses <addresses>', 'Comma-separated wallet addresses (max 50)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const addressArray = opts.addresses.split(',').map(a => a.trim());
      const data = await makeRequest('/account/metadata/multi', { address: addressArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  account
    .command('leaderboard')
    .description('Get the account leaderboard')
    .option('--sort-by <field>', 'Sort field: sol_values | stake_values | token_values | total_values', 'total_values')
    .option('--sort-order <order>', 'Sort order: asc | desc')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        sort_by: opts.sortBy,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.sortOrder) params.sort_order = opts.sortOrder;
      const data = await makeRequest('/account/leaderboard', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
