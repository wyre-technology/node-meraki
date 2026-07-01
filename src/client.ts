import type { MerakiClientConfig } from './types/index.js';
import { HttpClient, type HttpMethod } from './http.js';
import { OrganizationsResource } from './resources/organizations.js';
import { NetworksResource } from './resources/networks.js';
import { DevicesResource } from './resources/devices.js';
import { ClientsResource } from './resources/clients.js';
import { WirelessResource } from './resources/wireless.js';
import { SwitchResource } from './resources/switch.js';
import { ApplianceResource } from './resources/appliance.js';

const DEFAULT_BASE_URL = 'https://api.meraki.com/api/v1';

/** Options for the generic {@link MerakiClient.request} passthrough. */
export interface RequestOptions {
  query?: Record<string, unknown>;
  body?: unknown;
}

export class MerakiClient {
  /** Default organization ID supplied at construction, if any. */
  readonly orgId?: string;

  private readonly http: HttpClient;

  private _organizations?: OrganizationsResource;
  private _networks?: NetworksResource;
  private _devices?: DevicesResource;
  private _clients?: ClientsResource;
  private _wireless?: WirelessResource;
  private _switch?: SwitchResource;
  private _appliance?: ApplianceResource;

  constructor(config: MerakiClientConfig) {
    if (!config?.apiKey) {
      throw new Error('MerakiClient requires an `apiKey`.');
    }

    this.orgId = config.orgId;

    // Do not coerce trailing slashes onto paths — Meraki paths already begin
    // with `/`. We only strip a trailing slash from the base URL so that
    // `baseUrl + path` never produces a double slash.
    const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

    this.http = new HttpClient({
      baseUrl,
      apiKey: config.apiKey,
      timeout: config.timeout ?? 30_000,
      maxRetries: config.maxRetries ?? 3,
      requestsPerSecond: config.requestsPerSecond ?? 10,
      fetchImpl: config.fetchImpl ?? globalThis.fetch,
    });
  }

  get organizations(): OrganizationsResource {
    return (this._organizations ??= new OrganizationsResource(this.http));
  }

  get networks(): NetworksResource {
    return (this._networks ??= new NetworksResource(this.http));
  }

  get devices(): DevicesResource {
    return (this._devices ??= new DevicesResource(this.http));
  }

  get clients(): ClientsResource {
    return (this._clients ??= new ClientsResource(this.http));
  }

  get wireless(): WirelessResource {
    return (this._wireless ??= new WirelessResource(this.http));
  }

  get switch(): SwitchResource {
    return (this._switch ??= new SwitchResource(this.http));
  }

  get appliance(): ApplianceResource {
    return (this._appliance ??= new ApplianceResource(this.http));
  }

  /**
   * Generic passthrough for endpoints the typed resources don't cover yet.
   * `path` is relative to the base URL (e.g. `/organizations`); absolute URLs
   * are also accepted. Reuses this client's auth, rate limiting, retry/backoff
   * and error mapping, and returns the parsed JSON response.
   */
  async request<T>(method: HttpMethod, path: string, opts: RequestOptions = {}): Promise<T> {
    return this.http.request<T>(method, path, opts);
  }
}
