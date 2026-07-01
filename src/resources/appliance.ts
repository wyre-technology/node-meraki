import type { HttpClient } from '../http.js';
import type { L3FirewallRules, SiteToSiteVpn } from '../types/appliance.js';

export class ApplianceResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /networks/{networkId}/appliance/firewall/l3FirewallRules */
  async getL3FirewallRules(networkId: string): Promise<L3FirewallRules> {
    return this.client.request<L3FirewallRules>(
      'GET',
      `/networks/${networkId}/appliance/firewall/l3FirewallRules`
    );
  }

  /**
   * PUT /networks/{networkId}/appliance/firewall/l3FirewallRules
   * // Verified against Meraki OpenAPI spec3 (operationId updateNetworkApplianceFirewallL3FirewallRules)
   */
  async updateL3FirewallRules(networkId: string, body: L3FirewallRules): Promise<L3FirewallRules> {
    return this.client.request<L3FirewallRules>(
      'PUT',
      `/networks/${networkId}/appliance/firewall/l3FirewallRules`,
      { body }
    );
  }

  /** GET /networks/{networkId}/appliance/vpn/siteToSiteVpn */
  async getSiteToSiteVpn(networkId: string): Promise<SiteToSiteVpn> {
    return this.client.request<SiteToSiteVpn>(
      'GET',
      `/networks/${networkId}/appliance/vpn/siteToSiteVpn`
    );
  }
}
