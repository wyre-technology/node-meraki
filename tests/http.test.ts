import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from '../src/http.js';
import {
  MerakiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from '../src/errors.js';

function makeClient(mockFetch: ReturnType<typeof vi.fn>): HttpClient {
  return new HttpClient({
    baseUrl: 'https://api.meraki.com/api/v1',
    apiKey: 'test-key',
    timeout: 5000,
    // No retries keeps the error-mapping assertions fast (no backoff sleeps).
    maxRetries: 0,
    fetchImpl: mockFetch as unknown as typeof fetch,
    requestsPerSecond: 1000,
  });
}

function errorResponse(status: number, body = 'error') {
  return {
    ok: false,
    status,
    headers: new Headers(),
    text: async () => body,
  };
}

describe('HttpClient error mapping', () => {
  it.each([
    [400, ValidationError],
    [401, AuthenticationError],
    [403, ForbiddenError],
    [404, NotFoundError],
    [429, RateLimitError],
    [500, ServerError],
    [503, ServerError],
  ] as const)('maps HTTP %i to the correct error class', async (status, ErrorClass) => {
    const mockFetch = vi.fn().mockResolvedValue(errorResponse(status));
    const client = makeClient(mockFetch);

    await expect(client.request('GET', '/organizations')).rejects.toBeInstanceOf(ErrorClass);
    // Every typed error also extends the base MerakiError.
    await expect(client.request('GET', '/organizations')).rejects.toBeInstanceOf(MerakiError);
  });

  it('sends a Bearer auth header and parses the JSON body (read once)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify([{ id: '1', name: 'Org' }]),
    });
    const client = makeClient(mockFetch);

    const data = await client.request('GET', '/organizations');

    expect(data).toEqual([{ id: '1', name: 'Org' }]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.meraki.com/api/v1/organizations',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('captures Retry-After (seconds) on a 429 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '2' }),
      text: async () => 'rate limit exceeded',
    });
    const client = makeClient(mockFetch);

    await expect(client.request('GET', '/organizations')).rejects.toMatchObject({
      retryAfter: 2,
      statusCode: 429,
    });
  });

  it('returns an empty object for 204 No Content', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      text: async () => '',
    });
    const client = makeClient(mockFetch);

    const result = await client.request('DELETE', '/networks/N_1');
    expect(result).toEqual({});
  });
});
