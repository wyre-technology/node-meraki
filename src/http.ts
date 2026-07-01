import { buildAuthHeader } from './auth.js';
import {
  MerakiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './errors.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  fetchImpl: typeof fetch;
  requestsPerSecond: number;
}

export interface RequestOptions {
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface RawResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Token-bucket limiter. Meraki enforces roughly 10 requests/second per
 * organization; the bucket smooths bursts so callers stay under that ceiling
 * without having to think about it.
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async take(): Promise<void> {
    for (;;) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      const deficit = 1 - this.tokens;
      await sleep((deficit / this.refillPerSecond) * 1000);
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds <= 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.lastRefill = now;
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly limiter: TokenBucket;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.authHeader = buildAuthHeader(config.apiKey);
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
    this.fetchImpl = config.fetchImpl;
    this.limiter = new TokenBucket(config.requestsPerSecond, config.requestsPerSecond);
  }

  /** Perform a request and return the parsed response body. */
  async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const { data } = await this.requestRaw<T>(method, path, options);
    return data;
  }

  /**
   * Perform a request and return the parsed body along with the raw status and
   * response headers. Pagination uses this to read the RFC 5988 `Link` header.
   */
  async requestRaw<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<RawResponse<T>> {
    const url = this.buildUrl(path, options.query);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      await this.limiter.take();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers: Record<string, string> = {
        Authorization: this.authHeader,
        Accept: 'application/json',
        ...options.headers,
      };
      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err as Error;
        if (lastError.name === 'AbortError') {
          lastError = new MerakiError(`Request timeout after ${this.timeout}ms`);
        }
        if (attempt < this.maxRetries) {
          await sleep(this.backoff(attempt));
          continue;
        }
        throw lastError;
      }

      if (response.ok) {
        return this.parseSuccess<T>(response);
      }

      const { message, body } = await this.readErrorBody(response);

      if (response.status === 429) {
        const retryAfter = this.parseRetryAfter(response.headers);
        if (attempt < this.maxRetries) {
          const waitMs = retryAfter !== undefined ? retryAfter * 1000 : this.backoff(attempt);
          await sleep(waitMs);
          continue;
        }
        throw new RateLimitError(message, retryAfter, body);
      }

      switch (response.status) {
        case 400:
          throw new ValidationError(message, body);
        case 401:
          throw new AuthenticationError(message, body);
        case 403:
          throw new ForbiddenError(message, body);
        case 404:
          throw new NotFoundError(message, body);
        default:
          if (response.status >= 500) {
            lastError = new ServerError(message, response.status, body);
            if (attempt < this.maxRetries) {
              await sleep(this.backoff(attempt));
              continue;
            }
            throw lastError;
          }
          throw new MerakiError(message, response.status, body);
      }
    }

    throw lastError ?? new MerakiError('Request failed after retries');
  }

  private async parseSuccess<T>(response: Response): Promise<RawResponse<T>> {
    // 204 No Content — nothing to parse.
    if (response.status === 204) {
      return { data: {} as T, status: response.status, headers: response.headers };
    }

    // Read the body exactly ONCE, then attempt JSON.parse. Calling both
    // response.json() and response.text() throws "Body already read", so every
    // path goes through text() + JSON.parse guarded by try/catch.
    const raw = await response.text();
    if (!raw) {
      return { data: {} as T, status: response.status, headers: response.headers };
    }
    try {
      return { data: JSON.parse(raw) as T, status: response.status, headers: response.headers };
    } catch {
      return { data: raw as unknown as T, status: response.status, headers: response.headers };
    }
  }

  private async readErrorBody(response: Response): Promise<{ message: string; body: unknown }> {
    const raw = await response.text().catch(() => '');
    let body: unknown = raw || undefined;
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
    return { message: this.buildErrorMessage(response.status, body), body };
  }

  private buildErrorMessage(status: number, body: unknown): string {
    let message = `HTTP ${status}`;

    // Meraki error bodies look like `{ "errors": ["message", ...] }`.
    if (body && typeof body === 'object' && Array.isArray((body as { errors?: unknown }).errors)) {
      const errors = (body as { errors: unknown[] }).errors;
      if (errors.length) message += `: ${errors.map(String).join('; ')}`;
    } else if (typeof body === 'string' && body) {
      message += `: ${body.substring(0, 200)}`;
    } else if (body && typeof body === 'object') {
      message += `: ${JSON.stringify(body).substring(0, 200)}`;
    }

    return message;
  }

  private parseRetryAfter(headers: Headers): number | undefined {
    const value = headers.get('retry-after');
    if (!value) return undefined;
    const seconds = Number(value);
    return Number.isFinite(seconds) ? seconds : undefined;
  }

  private backoff(attempt: number): number {
    return Math.min(1000 * 2 ** attempt + Math.random() * 1000, 60_000);
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    // Absolute URLs (e.g. a `Link: rel="next"` cursor) pass straight through;
    // otherwise the path is appended to the base URL as-is (no trailing-slash
    // coercion — Meraki paths already begin with `/`).
    const base = /^https?:\/\//i.test(path) ? path : `${this.baseUrl}${path}`;
    if (!query) return base;

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) search.append(`${key}[]`, String(v));
      } else {
        search.set(key, String(value));
      }
    }

    const qs = search.toString();
    if (!qs) return base;
    return base.includes('?') ? `${base}&${qs}` : `${base}?${qs}`;
  }
}
