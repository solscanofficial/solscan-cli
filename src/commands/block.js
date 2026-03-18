import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerBlockCommand(program) {
  const block = program.command('block').description('Block operations');

  block
    .command('last')
    .description('Get the list of the latest blocks')
    .option('--limit <number>', 'Number of blocks (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/block/last', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  block
    .command('detail')
    .description('Get the details of a block')
    .requiredOption('--block <slot>', 'The slot index of a block')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/block/detail', { block: opts.block }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  block
    .command('transactions')
    .description('Get the list of transactions of a block')
    .requiredOption('--block <slot>', 'The slot index of a block')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Items per page (10, 20, 30, 40, 60, 100)', '10')
    .option('--exclude-vote', 'Excludes vote transactions from the results')
    .option('--program <address>', 'Filter by program address')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const params = {
        block: opts.block,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      };
      if (opts.excludeVote) params.exclude_vote = true;
      if (opts.program) params.program = opts.program;
      const data = await makeRequest('/block/transactions', params, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
