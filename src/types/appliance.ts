/**
 * A single L3 firewall rule.
 * Verified against Meraki OpenAPI spec3 (operationId
 * updateNetworkApplianceFirewallL3FirewallRules): `policy`, `protocol`,
 * `srcCidr` and `destCidr` are required.
 */
export interface L3FirewallRule {
  comment?: string;
  policy: 'allow' | 'deny' | string;
  protocol: 'tcp' | 'udp' | 'icmp' | 'icmp6' | 'any' | string;
  srcPort?: string;
  srcCidr: string;
  destPort?: string;
  destCidr: string;
  syslogEnabled?: boolean;
  [key: string]: unknown;
}

/**
 * Request/response shape for the L3 firewall rules endpoints.
 * Verified against Meraki OpenAPI spec3 (operationId
 * updateNetworkApplianceFirewallL3FirewallRules).
 */
export interface L3FirewallRules {
  rules: L3FirewallRule[];
  /** Log the special default rule (boolean value, `false` if absent). */
  syslogDefaultRule?: boolean;
  [key: string]: unknown;
}

export interface SiteToSiteVpn {
  mode?: 'none' | 'spoke' | 'hub' | string;
  hubs?: Array<{ hubId: string; useDefaultRoute?: boolean }>;
  subnets?: Array<{ localSubnet: string; useVpn: boolean }>;
  [key: string]: unknown;
}
