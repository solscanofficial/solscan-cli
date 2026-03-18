import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerNftCommand(program) {
  const nft = program.command('nft').description('NFT operations');

  nft
    .command('news')
    .description('Get latest NFT news')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/news', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('activities')
    .description('Get NFT activities')
    .requiredOption('--address <address>', 'NFT token address')
    .option('--page <number>', 'Page number', '1')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/activities', {
        token_address: opts.address,
        page: parseInt(opts.page),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('collections')
    .description('Get NFT collections')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/collection/lists', {
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  nft
    .command('items')
    .description('Get collection items')
    .requiredOption('--address <address>', 'Collection address')
    .option('--page <number>', 'Page number', '1')
    .option('--page-size <number>', 'Page size', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/nft/collection/items', {
        collection: opts.address,
        page: parseInt(opts.page),
        page_size: parseInt(opts.pageSize),
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
