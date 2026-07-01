import type { HttpClient } from '../http.js';
import type { Device, NetworkDeviceRemove } from '../types/devices.js';

export class DevicesResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /networks/{networkId}/devices */
  async listByNetwork(networkId: string): Promise<Device[]> {
    return this.client.request<Device[]>('GET', `/networks/${networkId}/devices`);
  }

  /** GET /devices/{serial} */
  async get(serial: string): Promise<Device> {
    return this.client.request<Device>('GET', `/devices/${serial}`);
  }

  /** POST /devices/{serial}/reboot */
  async reboot(serial: string): Promise<{ success: boolean }> {
    return this.client.request<{ success: boolean }>('POST', `/devices/${serial}/reboot`);
  }

  /**
   * POST /networks/{networkId}/devices/remove — remove a device from a network.
   * // Verified against Meraki OpenAPI spec3 (operationId removeNetworkDevices)
   */
  async removeFromNetwork(networkId: string, serial: string): Promise<void> {
    const body: NetworkDeviceRemove = { serial };
    await this.client.request<void>('POST', `/networks/${networkId}/devices/remove`, {
      body,
    });
  }
}
