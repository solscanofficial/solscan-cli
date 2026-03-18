import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerBlockCommand(program) {
  const block = program.command('block').description('Block operations');

  block
    .command('last')
    .description('Get last blocks')
    .option('--limit <number>', 'Limit (10, 20, 30, 40, 60, 100)', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/block/last', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  block
    .command('detail')
    .description('Get block detail')
    .requiredOption('--block <slot>', 'Block slot number')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/block/detail', { block: opts.block }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  block
    .command('transactions')
    .description('Get block transactions')
    .requiredOption('--block <slot>', 'Block slot number')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/block/transactions', {
        block: opts.block,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
