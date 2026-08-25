import { makeNetworkAnalyticsRequest } from '../api.js';
import { printOutput } from '../formatter.js';

function timeSeriesParams(opts) {
  const params = {};
  if (opts.range) params.range = parseInt(opts.range);
  if (opts.fromTime) params.from_time = parseInt(opts.fromTime);
  if (opts.toTime) params.to_time = parseInt(opts.toTime);
  return params;
}

function addRangeOptions(cmd) {
  return cmd
    .option('--range <days>', 'Time range in days, counting back from today: 30 | 90 | 180 | 365 (default 90). Overridden by --from-time/--to-time', '90')
    .option('--from-time <YYYYMMDD>', 'Start date filter, e.g. 20240701. Pass together with --to-time')
    .option('--to-time <YYYYMMDD>', 'End date filter, e.g. 20240715. Pass together with --from-time');
}

export function registerNetworkCommand(program) {
  const network = program.command('network').description('Network-wide Solana analytics (public-api.solscan.io host, still requires a Solscan Pro API key)');

  network
    .command('chain-info')
    .description('Get current Solana chain state: block height, epoch, absolute slot, total transaction count')
    .action(async (_opts, cmd) => {
      const root = cmd.optsWithGlobals();
      const data = await makeNetworkAnalyticsRequest('/chaininfo', {}, { apiKey: root.apiKey });
      printOutput(data, root.json);
    });

  addRangeOptions(
    network
      .command('transactions')
      .description('Daily network transaction counts (total, vote, non-vote success/fail)')
      .option('--filter <metric>', 'Metric to return: all | total | vote | nonvote_success | nonvote_fail (default all)', 'all')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const params = { filter: opts.filter, ...timeSeriesParams(opts) };
    const data = await makeNetworkAnalyticsRequest('/analytics/transactions', params, { apiKey: root.apiKey });
    printOutput(data, root.json);
  });

  addRangeOptions(
    network
      .command('stake')
      .description('Daily network total active stake, in SOL and USD')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const data = await makeNetworkAnalyticsRequest('/analytics/stake', timeSeriesParams(opts), { apiKey: root.apiKey });
    printOutput(data, root.json);
  });

  addRangeOptions(
    network
      .command('fees')
      .description('Daily network transaction fees, split into base/priority, in SOL and USD')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const data = await makeNetworkAnalyticsRequest('/analytics/fees', timeSeriesParams(opts), { apiKey: root.apiKey });
    printOutput(data, root.json);
  });

  addRangeOptions(
    network
      .command('slots')
      .description('Daily count of blocks produced on the network')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const data = await makeNetworkAnalyticsRequest('/analytics/slots', timeSeriesParams(opts), { apiKey: root.apiKey });
    printOutput(data, root.json);
  });

  addRangeOptions(
    network
      .command('defi-activity')
      .description('Daily network DEX activity: trade count, trader count, volume, active DEX count')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const data = await makeNetworkAnalyticsRequest('/analytics/dex/activity', timeSeriesParams(opts), { apiKey: root.apiKey });
    printOutput(data, root.json);
  });

  addRangeOptions(
    network
      .command('compute-units')
      .description('Daily network compute unit consumption by transactions')
  ).action(async (opts, cmd) => {
    const root = cmd.optsWithGlobals();
    const data = await makeNetworkAnalyticsRequest('/analytics/compute-units', timeSeriesParams(opts), { apiKey: root.apiKey });
    printOutput(data, root.json);
  });
}
