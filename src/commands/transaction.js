import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerTransactionCommand(program) {
  const tx = program.command('transaction').description('Transaction operations');

  tx
    .command('detail')
    .description('Get the detail of a transaction, including balance changes, IDL data, defi and transfer activities')
    .requiredOption('--signature <sig>', 'The signature of the transaction')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/detail', { tx: opts.signature }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('detail-multi')
    .description('Get the detail of multiple transactions (max 50)')
    .requiredOption('--signatures <sigs>', 'Comma-separated transaction signatures (max 50)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const txArray = opts.signatures.split(',').map(s => s.trim());
      const data = await makeRequest('/transaction/detail/multi', { tx: txArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('last')
    .description('Get the list of the latest transactions')
    .option('--limit <number>', 'Number of results (10, 20, 30, 40, 60, 100)', '10')
    .option('--filter <filter>', 'Filter transactions: exceptVote | all', 'exceptVote')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/last', {
        limit: parseInt(opts.limit),
        filter: opts.filter,
      }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('actions')
    .description('Get the actions of a transaction (transfers, swaps, NFT activities, etc.)')
    .requiredOption('--signature <sig>', 'The signature of the transaction')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/actions', { tx: opts.signature }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('actions-multi')
    .description('Get the actions of multiple transactions (max 50)')
    .requiredOption('--signatures <sigs>', 'Comma-separated transaction signatures (max 50)')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const txArray = opts.signatures.split(',').map(s => s.trim());
      const data = await makeRequest('/transaction/actions/multi', { tx: txArray }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('fees')
    .description('Get transaction fees')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/fees', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
