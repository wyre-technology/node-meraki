import type { HttpClient } from '../http.js';
import type { SwitchPort, SwitchPortUpdate, SwitchPortStatus } from '../types/switch.js';

export class SwitchResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /devices/{serial}/switch/ports */
  async listPorts(serial: string): Promise<SwitchPort[]> {
    return this.client.request<SwitchPort[]>('GET', `/devices/${serial}/switch/ports`);
  }

  /**
   * PUT /devices/{serial}/switch/ports/{portId}
   * // Verified against Meraki OpenAPI spec3 (operationId updateDeviceSwitchPort)
   */
  async updatePort(serial: string, portId: string, body: SwitchPortUpdate): Promise<SwitchPort> {
    return this.client.request<SwitchPort>(
      'PUT',
      `/devices/${serial}/switch/ports/${portId}`,
      { body }
    );
  }

  /**
   * GET /devices/{serial}/switch/ports/statuses
   * `timespan` (seconds) optionally narrows the reporting window.
   */
  async listPortStatuses(
    serial: string,
    options: { timespan?: number } = {}
  ): Promise<SwitchPortStatus[]> {
    return this.client.request<SwitchPortStatus[]>(
      'GET',
      `/devices/${serial}/switch/ports/statuses`,
      { query: { ...options } }
    );
  }
}
