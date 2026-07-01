import type { HttpClient } from '../http.js';
import { paginate } from '../pagination.js';
import type { PaginationParams } from '../types/common.js';
import type { Network, NetworkUpdate } from '../types/networks.js';

export class NetworksResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /organizations/{orgId}/networks — networks in an organization. */
  async listByOrg(orgId: string, params: PaginationParams = {}): Promise<Network[]> {
    return this.client.request<Network[]>('GET', `/organizations/${orgId}/networks`, {
      query: { ...params },
    });
  }

  /** Auto-paginating variant of {@link listByOrg} (follows `Link` next). */
  listAllByOrg(orgId: string, params: PaginationParams = {}): AsyncIterable<Network> {
    return paginate<Network>(this.client, `/organizations/${orgId}/networks`, {
      query: { ...params },
    });
  }

  /** GET /networks/{networkId} */
  async get(networkId: string): Promise<Network> {
    return this.client.request<Network>('GET', `/networks/${networkId}`);
  }

  /**
   * PUT /networks/{networkId}
   * // Verified against Meraki OpenAPI spec3 (operationId updateNetwork)
   */
  async update(networkId: string, body: NetworkUpdate): Promise<Network> {
    return this.client.request<Network>('PUT', `/networks/${networkId}`, { body });
  }

  /** DELETE /networks/{networkId} */
  async delete(networkId: string): Promise<void> {
    await this.client.request<void>('DELETE', `/networks/${networkId}`);
  }
}
