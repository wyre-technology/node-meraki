import type { HttpClient } from '../http.js';
import type { WirelessSsid, WirelessSsidUpdate, RfProfile } from '../types/wireless.js';

export class WirelessResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /networks/{networkId}/wireless/ssids */
  async listSsids(networkId: string): Promise<WirelessSsid[]> {
    return this.client.request<WirelessSsid[]>('GET', `/networks/${networkId}/wireless/ssids`);
  }

  /**
   * PUT /networks/{networkId}/wireless/ssids/{number}
   * // Verified against Meraki OpenAPI spec3 (operationId updateNetworkWirelessSsid)
   */
  async updateSsid(
    networkId: string,
    number: number,
    body: WirelessSsidUpdate
  ): Promise<WirelessSsid> {
    return this.client.request<WirelessSsid>(
      'PUT',
      `/networks/${networkId}/wireless/ssids/${number}`,
      { body }
    );
  }

  /** GET /networks/{networkId}/wireless/rfProfiles */
  async listRfProfiles(networkId: string): Promise<RfProfile[]> {
    return this.client.request<RfProfile[]>(
      'GET',
      `/networks/${networkId}/wireless/rfProfiles`
    );
  }
}
