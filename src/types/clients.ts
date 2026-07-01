import type { PaginationParams } from './common.js';

export interface Client {
  id: string;
  mac?: string;
  description?: string;
  ip?: string;
  ip6?: string;
  user?: string;
  vlan?: string | number;
  manufacturer?: string;
  os?: string;
  ssid?: string;
  status?: string;
  lastSeen?: number | string;
  [key: string]: unknown;
}

/**
 * Request body for `PUT /networks/{networkId}/clients/{clientId}/policy`
 * (also the shape returned by the matching GET).
 * Verified against Meraki OpenAPI spec3 (operationId updateNetworkClientPolicy):
 * `devicePolicy` is required; `groupPolicyId` is only used when
 * `devicePolicy` is 'Group policy'.
 */
export interface ClientPolicy {
  mac?: string;
  /** Required. 'Whitelisted', 'Blocked', 'Normal' or 'Group policy'. */
  devicePolicy?: 'Whitelisted' | 'Blocked' | 'Normal' | 'Group policy' | string;
  groupPolicyId?: string;
  [key: string]: unknown;
}

/**
 * Query options for `GET /networks/{networkId}/clients`.
 * Verified against Meraki OpenAPI spec3 (operationId getNetworkClients).
 */
export interface ClientListOptions extends PaginationParams {
  /** ISO 8601 timestamp for the start of the reporting window (max 31 days lookback). */
  t0?: string;
  /** Timespan in seconds for which clients will be fetched (max 31 days). Do not combine with t0. */
  timespan?: number;
  /** Filter clients by connection status. */
  statuses?: Array<'Online' | 'Offline'>;
}
