import axios from 'axios';
import { resolveApiKey } from './config.js';

const BASE_URL = 'https://pro-api.solscan.io/v2.0';
// Network Analytics endpoints (src/commands/network.js) live on this host instead of
// pro-api.solscan.io/v2.0, but still require the same Pro API key via the `token` header.
const NETWORK_ANALYTICS_BASE_URL = 'https://public-api.solscan.io';

const ERROR_MESSAGES = {
  400: 'Bad request — check your parameters (e.g. invalid address format, type, page_size,...)',
  401: 'Authentication failed — check your API key',
  403: 'Forbidden — your API key may lack the required permissions',
  429: 'Rate limit exceeded — wait and retry',
  500: 'Internal server error — try again later',
};

function stripEmpty(params) {
  if (!params) return undefined;
  const cleaned = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      cleaned[k] = v;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export async function makeRequest(endpoint, params, opts = {}) {
  const apiKey = resolveApiKey(opts.apiKey);
  if (!apiKey) {
    console.error(
      'Error: No API key found.\n' +
      'Set one via: solscan config set-api-key <KEY>\n' +
      'Or set the SOLSCAN_API_KEY environment variable.'
    );
    process.exit(1);
  }

  const url = `${opts.baseUrl || BASE_URL}${endpoint}`;

  try {
    const response = await axios.get(url, {
      headers: {
        token: apiKey,
        'User-Agent': 'solscan-cli/1.0',
      },
      params: stripEmpty(params),
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const msg = ERROR_MESSAGES[status] || `HTTP ${status}`;
      const body = err.response.data;
      console.error(`API Error (${status}): ${msg}`);
      const serverMessage = body && (body.errors?.message || body.error_message || body.message);
      if (serverMessage) {
        console.error(`Server message: ${serverMessage}`);
      }
    } else if (err.request) {
      console.error('Network error: no response received from Solscan API.');
    } else {
      console.error(`Request error: ${err.message}`);
    }
    process.exit(1);
  }
}

/**
 * Request against a Network Analytics endpoint (src/commands/network.js) — same
 * Pro API key/header as makeRequest, but on the public-api.solscan.io host.
 */
export async function makeNetworkAnalyticsRequest(endpoint, params, opts = {}) {
  return makeRequest(endpoint, params, { ...opts, baseUrl: NETWORK_ANALYTICS_BASE_URL });
}
