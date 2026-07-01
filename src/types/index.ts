export * from './common.js';
export * from './organizations.js';
export * from './networks.js';
export * from './devices.js';
export * from './clients.js';
export * from './wireless.js';
export * from './switch.js';
export * from './appliance.js';

export interface MerakiClientConfig {
  /** Meraki Dashboard API key. Sent as `Authorization: Bearer <apiKey>`. */
  apiKey: string;
  /** Optional default organization ID for convenience. */
  orgId?: string;
  /**
   * Override the API base URL. Defaults to `https://api.meraki.com/api/v1`.
   * Point at a regional cloud (e.g. `https://api.meraki.cn/api/v1`) when needed.
   */
  baseUrl?: string;
  /** Per-request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
  /** Maximum retry attempts for 429/5xx/network errors. Defaults to 3. */
  maxRetries?: number;
  /** Token-bucket ceiling in requests/second. Defaults to 10 (Meraki's limit). */
  requestsPerSecond?: number;
  /** Custom fetch implementation (defaults to the global `fetch`). */
  fetchImpl?: typeof fetch;
}
