export interface Network {
  id: string;
  organizationId?: string;
  name: string;
  productTypes?: string[];
  timeZone?: string;
  tags?: string[];
  notes?: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * Mutable fields accepted by `PUT /networks/{networkId}`.
 * Verified against Meraki OpenAPI spec3 (operationId updateNetwork).
 */
export interface NetworkUpdate {
  name?: string;
  timeZone?: string;
  tags?: string[];
  /** Unique identifier used for device enrollment / Self Service Portal access. */
  enrollmentString?: string;
  notes?: string;
  [key: string]: unknown;
}
