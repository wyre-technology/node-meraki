export interface WirelessSsid {
  number: number;
  name?: string;
  enabled?: boolean;
  splashPage?: string;
  authMode?: string;
  ssidAdminAccessible?: boolean;
  visible?: boolean;
  [key: string]: unknown;
}

/**
 * Mutable fields accepted by `PUT /networks/{networkId}/wireless/ssids/{number}`.
 * Verified against Meraki OpenAPI spec3 (operationId updateNetworkWirelessSsid).
 * The SSID body carries 60+ optional fields; the ~15 most common are named
 * below and the index signature preserves the rest.
 */
export interface WirelessSsidUpdate {
  name?: string;
  enabled?: boolean;
  /** Association control method (e.g. 'open', 'psk', '8021x-radius', 'ipsk-with-radius'). */
  authMode?: string;
  encryptionMode?: 'open' | 'wep' | 'wpa' | 'wpa-eap' | string;
  psk?: string;
  wpaEncryptionMode?:
    | 'WPA1 and WPA2'
    | 'WPA2 only'
    | 'WPA3 Transition Mode'
    | 'WPA3 only'
    | 'WPA3 192-bit Security'
    | string;
  /** Splash page type (e.g. 'None', 'Click-through splash page', 'Sponsored guest'). */
  splashPage?: string;
  /** Client IP assignment ('NAT mode', 'Bridge mode', 'Layer 3 roaming', 'VPN', ...). */
  ipAssignmentMode?: string;
  useVlanTagging?: boolean;
  vlanId?: number;
  defaultVlanId?: number;
  walledGardenEnabled?: boolean;
  walledGardenRanges?: string[];
  perClientBandwidthLimitUp?: number;
  perClientBandwidthLimitDown?: number;
  minBitrate?: number;
  bandSelection?: string;
  lanIsolationEnabled?: boolean;
  visible?: boolean;
  availableOnAllAps?: boolean;
  [key: string]: unknown;
}

export interface RfProfile {
  id: string;
  name?: string;
  networkId?: string;
  bandSelectionType?: string;
  minBitrateType?: string;
  [key: string]: unknown;
}
