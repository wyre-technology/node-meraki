# @wyre-technology/node-meraki

Node.js client library for the [Cisco Meraki Dashboard API v1](https://developer.cisco.com/meraki/api-v1/).

## Features

- **Zero runtime dependencies** — native `fetch` only, dual ESM + CommonJS build.
- **Typed resource accessors** for organizations, networks, devices, clients, wireless, switch and appliance.
- **Bearer-token auth** (`Authorization: Bearer <apiKey>`).
- **Built-in resilience** — token-bucket rate limiting (~10 req/s per org) and retry with exponential backoff that honors the `Retry-After` header on HTTP 429.
- **Cursor pagination** driven by the RFC 5988 `Link` header, with both single-page and auto-paginate helpers.
- **Typed error hierarchy** so callers can branch on failure kind.
- **Generic `request()` passthrough** for the long tail of endpoints not yet wrapped.

## Installation

```bash
npm install @wyre-technology/node-meraki
```

## Quick Start

```typescript
import { MerakiClient } from '@wyre-technology/node-meraki';

const client = new MerakiClient({
  apiKey: process.env.MERAKI_API_KEY!,
  // Optional: default organization ID for convenience
  orgId: '123456',
  // Optional: override for regional clouds, e.g. 'https://api.meraki.cn/api/v1'
  // baseUrl: 'https://api.meraki.com/api/v1',
});

// List organizations
const orgs = await client.organizations.list();

// List networks in an organization
const networks = await client.networks.listByOrg('123456');

// Get a device by serial
const device = await client.devices.get('Q2XX-XXXX-XXXX');

// List SSIDs on a network
const ssids = await client.wireless.listSsids('N_24329156');
```

## Pagination

Meraki paginates large collections with a cursor in the `Link` response header.
List methods return a single page. To walk every page automatically, use the
auto-paginating variants (or the exported `paginate` helper):

```typescript
// Auto-paginate every network in an org
for await (const network of client.networks.listAllByOrg('123456')) {
  console.log(network.name);
}

// Or drive any cursor endpoint yourself with the helpers
import { fetchPage, paginate } from '@wyre-technology/node-meraki';
```

## Raw requests

For endpoints or query params the typed resources don't cover yet, use
`client.request()`. It reuses the client's auth, rate limiting, retry/backoff
and error mapping, and returns the parsed JSON response. `path` is relative to
the base URL (absolute URLs are also accepted).

```typescript
// GET with query params
const statuses = await client.request('GET', '/organizations/123456/devices/statuses', {
  query: { perPage: 100 },
});

// PUT with a JSON body
await client.request('PUT', '/networks/N_1/appliance/firewall/l3FirewallRules', {
  body: { rules: [] },
});
```

## Error handling

Every failed request throws a subclass of `MerakiError`, each carrying
`statusCode` and the parsed `response` body:

```typescript
import {
  MerakiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from '@wyre-technology/node-meraki';

try {
  await client.networks.get('N_missing');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.warn(`Rate limited; retry after ${err.retryAfter}s`);
  } else if (err instanceof NotFoundError) {
    console.warn('Network not found');
  } else if (err instanceof MerakiError) {
    console.error(`Meraki API error ${err.statusCode}:`, err.response);
  }
}
```

| Class | HTTP status |
| --- | --- |
| `AuthenticationError` | 401 |
| `ForbiddenError` | 403 |
| `ValidationError` | 400 |
| `NotFoundError` | 404 |
| `RateLimitError` (`retryAfter`) | 429 |
| `ServerError` | 5xx |
| `MerakiError` (base) | any other |

## Documentation

For complete API documentation, see the [Cisco Meraki Dashboard API v1 reference](https://developer.cisco.com/meraki/api-v1/).

## License

Apache-2.0

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
