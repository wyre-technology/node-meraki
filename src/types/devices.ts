export interface Device {
  serial: string;
  name?: string;
  mac?: string;
  model?: string;
  networkId?: string;
  productType?: string;
  lanIp?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  tags?: string[];
  firmware?: string;
  [key: string]: unknown;
}

/**
 * Request body for `POST /networks/{networkId}/devices/remove`.
 * Verified against Meraki OpenAPI spec3 (operationId removeNetworkDevices):
 * `serial` is required.
 */
export interface NetworkDeviceRemove {
  serial: string;
  [key: string]: unknown;
}
