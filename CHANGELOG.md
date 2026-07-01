# 1.0.0 (2026-07-01)


### Features

* initial node-meraki SDK for the Cisco Meraki Dashboard API v1 ([3d8371f](https://github.com/wyre-technology/node-meraki/commit/3d8371f7f8e6b916cdd337b74a0626fabb76f0af))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial scaffold of `@wyre-technology/node-meraki`, a zero-dependency TypeScript
  client for the Cisco Meraki Dashboard API v1.
- `MerakiClient` constructed with `{ apiKey, orgId?, baseUrl? }` and lazily
  instantiated resource accessors: `organizations`, `networks`, `devices`,
  `clients`, `wireless`, `switch`, `appliance`.
- Generic `request<T>(method, path, opts?)` passthrough for endpoints not yet
  wrapped by the typed resources.
- Bearer-token authentication (`Authorization: Bearer <apiKey>`).
- Token-bucket rate limiting (~10 req/s per organization) and retry with
  exponential backoff that honors `Retry-After` on HTTP 429.
- Cursor-based pagination helpers (`fetchPage`, `paginate`, `parseLinkHeader`)
  driven by the RFC 5988 `Link` response header, plus auto-paginating resource
  variants (`networks.listAllByOrg`, `organizations.inventoryDevicesAll`).
- Typed error hierarchy: `MerakiError`, `AuthenticationError`, `ForbiddenError`,
  `NotFoundError`, `ValidationError`, `RateLimitError`, `ServerError`.
- Dual ESM + CommonJS build via tsup and a vitest smoke test covering
  error-status to error-class mapping.

### Changed
- Hardened write-body types for 7 endpoints against the authoritative Cisco
  Meraki OpenAPI spec3, replacing the placeholder `TODO: verify` comments with
  `Verified against Meraki OpenAPI spec3 (operationId ...)` notes:
  - `NetworkUpdate` (updateNetwork): added `enrollmentString`.
  - `NetworkDeviceRemove` (removeNetworkDevices): new body type `{ serial }`.
  - `ClientListOptions` (getNetworkClients): documented `t0`/`timespan` and added
    `statuses?: Array<'Online' | 'Offline'>`.
  - `ClientPolicy` (updateNetworkClientPolicy): corrected `devicePolicy` enum to
    `'Whitelisted' | 'Blocked' | 'Normal' | 'Group policy'`.
  - `WirelessSsidUpdate` (updateNetworkWirelessSsid): added ~15 common fields
    (encryptionMode, wpaEncryptionMode, splashPage, ipAssignmentMode, vlanId,
    walledGarden*, per-client bandwidth limits, visible, ...).
  - `SwitchPortUpdate` (updateDeviceSwitchPort): added type/stpGuard/udld/
    accessPolicyType enums plus isolationEnabled, rstpEnabled, linkNegotiation,
    portScheduleId, accessPolicyNumber.
  - `L3FirewallRule` (updateNetworkApplianceFirewallL3FirewallRules): tightened
    `protocol` enum; `L3FirewallRules` gained `syslogDefaultRule`.
  - All request-body interfaces retain their `[key: string]: unknown` index
    signature so free-form JSON still passes through.
