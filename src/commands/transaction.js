import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerTransactionCommand(program) {
  const tx = program.command('transaction').description('Transaction operations');

  tx
    .command('detail')
    .description('Get transaction details')
    .requiredOption('--signature <sig>', 'Transaction signature')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/detail', { tx: opts.signature }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('detail-multi')
    .description('Get multiple transaction details')
    .requiredOption('--signatures <sigs>', 'Comma-separated signatures')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/detail/multi', { txs: opts.signatures }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('last')
    .description('Get last transactions')
    .option('--limit <number>', 'Number of results', '10')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/last', { limit: parseInt(opts.limit) }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('actions')
    .description('Get transaction actions')
    .requiredOption('--signature <sig>', 'Transaction signature')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/actions', { tx: opts.signature }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('actions-multi')
    .description('Get multiple transaction actions')
    .requiredOption('--signatures <sigs>', 'Comma-separated signatures')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/actions/multi', { txs: opts.signatures }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  tx
    .command('fees')
    .description('Get transaction fees')
    .requiredOption('--signature <sig>', 'Transaction signature')
    .action(async (opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/transaction/fees', { tx: opts.signature }, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
