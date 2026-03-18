import Conf from 'conf';
import { homedir } from 'os';
import { join } from 'path';

const store = new Conf({
  projectName: 'solscan-cli',
  cwd: join(homedir(), '.config', 'solscan-cli'),
  schema: {
    apiKey: { type: 'string', default: '' }
  }
});

/**
 * Resolve API key with priority: flag > env > stored config.
 */
export function resolveApiKey(flagValue) {
  if (flagValue) return flagValue;
  if (process.env.SOLSCAN_API_KEY) return process.env.SOLSCAN_API_KEY;
  const stored = store.get('apiKey');
  if (stored) return stored;
  return null;
}

export function setApiKey(key) {
  store.set('apiKey', key);
}

export function getStoredApiKey() {
  return store.get('apiKey') || null;
}

export function getConfigPath() {
  return store.path;
}

export function registerConfigCommand(program) {
  const config = program.command('config').description('Manage CLI configuration');

  config
    .command('set-api-key <key>')
    .description('Store your Solscan API key')
    .action((key) => {
      setApiKey(key);
      console.log('API key saved successfully.');
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const key = getStoredApiKey();
      const envKey = process.env.SOLSCAN_API_KEY;
      console.log(`Config file : ${getConfigPath()}`);
      console.log(`Stored key  : ${key ? key.slice(0, 8) + '...' : '(not set)'}`);
      console.log(`Env var     : ${envKey ? envKey.slice(0, 8) + '...' : '(not set)'}`);
    });
}
