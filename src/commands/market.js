import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerMarketCommand(program) {
  const market = program.command('market').description('Market operations');

  market
    .command('list')
    .description('List all markets')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/market/list', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('info')
    .description('Get market info')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/market/info', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  market
    .command('volume')
    .description('Get market volume')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/market/volume', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
