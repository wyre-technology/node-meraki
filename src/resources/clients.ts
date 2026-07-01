import type { HttpClient } from '../http.js';
import type { Client, ClientPolicy, ClientListOptions } from '../types/clients.js';

export class ClientsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * GET /networks/{networkId}/clients — clients seen on a network. Supports
   * `timespan` (seconds) / `t0`, `statuses`, and cursor pagination.
   * // Verified against Meraki OpenAPI spec3 (operationId getNetworkClients)
   */
  async listByNetwork(networkId: string, options: ClientListOptions = {}): Promise<Client[]> {
    return this.client.request<Client[]>('GET', `/networks/${networkId}/clients`, {
      query: { ...options },
    });
  }

  /** GET /networks/{networkId}/clients/{clientId} */
  async get(networkId: string, clientId: string): Promise<Client> {
    return this.client.request<Client>('GET', `/networks/${networkId}/clients/${clientId}`);
  }

  /** GET /networks/{networkId}/clients/{clientId}/policy */
  async getPolicy(networkId: string, clientId: string): Promise<ClientPolicy> {
    return this.client.request<ClientPolicy>(
      'GET',
      `/networks/${networkId}/clients/${clientId}/policy`
    );
  }

  /**
   * PUT /networks/{networkId}/clients/{clientId}/policy
   * // Verified against Meraki OpenAPI spec3 (operationId updateNetworkClientPolicy)
   */
  async updatePolicy(
    networkId: string,
    clientId: string,
    body: ClientPolicy
  ): Promise<ClientPolicy> {
    return this.client.request<ClientPolicy>(
      'PUT',
      `/networks/${networkId}/clients/${clientId}/policy`,
      { body }
    );
  }
}
