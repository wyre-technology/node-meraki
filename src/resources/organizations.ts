import type { HttpClient } from '../http.js';
import { paginate } from '../pagination.js';
import type { PaginationParams } from '../types/common.js';
import type {
  Organization,
  OrganizationInventoryDevice,
  OrganizationAdmin,
} from '../types/organizations.js';

export class OrganizationsResource {
  constructor(private readonly client: HttpClient) {}

  /** GET /organizations — organizations the API key can access. */
  async list(): Promise<Organization[]> {
    return this.client.request<Organization[]>('GET', '/organizations');
  }

  /** GET /organizations/{orgId} */
  async get(orgId: string): Promise<Organization> {
    return this.client.request<Organization>('GET', `/organizations/${orgId}`);
  }

  /**
   * GET /organizations/{orgId}/inventory/devices — the organization device
   * inventory. Cursor-paginated; returns a single page.
   */
  async inventoryDevices(
    orgId: string,
    params: PaginationParams = {}
  ): Promise<OrganizationInventoryDevice[]> {
    return this.client.request<OrganizationInventoryDevice[]>(
      'GET',
      `/organizations/${orgId}/inventory/devices`,
      { query: { ...params } }
    );
  }

  /** Auto-paginating variant of {@link inventoryDevices} (follows `Link` next). */
  inventoryDevicesAll(
    orgId: string,
    params: PaginationParams = {}
  ): AsyncIterable<OrganizationInventoryDevice> {
    return paginate<OrganizationInventoryDevice>(
      this.client,
      `/organizations/${orgId}/inventory/devices`,
      { query: { ...params } }
    );
  }

  /** GET /organizations/{orgId}/admins */
  async admins(orgId: string): Promise<OrganizationAdmin[]> {
    return this.client.request<OrganizationAdmin[]>('GET', `/organizations/${orgId}/admins`);
  }
}
