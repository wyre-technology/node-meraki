/**
 * Build the Meraki Dashboard API authorization header.
 *
 * Meraki v1 authenticates with a bearer token: `Authorization: Bearer <apiKey>`.
 */
export function buildAuthHeader(apiKey: string): string {
  return `Bearer ${apiKey}`;
}
