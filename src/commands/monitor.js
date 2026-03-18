import { makeRequest } from '../api.js';
import { printOutput } from '../formatter.js';

export function registerMonitorCommand(program) {
  const monitor = program.command('monitor').description('Monitor operations');

  monitor
    .command('usage')
    .description('Get API usage stats')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeRequest('/monitor/usage', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });
}
