import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerProgramCommand(program) {
  const prog = program.command('program').description('Program operations');

  prog
    .command('list')
    .description('List programs')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .option('--sort-by <field>', 'Sort field', 'tx_count_24h')
    .option('--direction <dir>', 'Sort direction (asc/desc)', 'desc')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/program/list', {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
        sort_by: opts.sortBy,
        direction: opts.direction,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  prog
    .command('popular')
    .description('Get popular platforms')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/program/popular/platforms', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  prog
    .command('analytics')
    .description('Get program analytics')
    .requiredOption('--address <address>', 'Program address')
    .option('--type <type>', 'Time range (e.g. 24h)', '24h')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/program/analytics', {
        program_address: opts.address,
        type: opts.type,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
