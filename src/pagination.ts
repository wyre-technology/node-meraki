import type { HttpClient, HttpMethod, RequestOptions } from './http.js';
import type { Page, PageLinks } from './types/common.js';

/**
 * Parse an RFC 5988 `Link` header (as returned by the Meraki Dashboard API)
 * into a map of rel -> URL. Meraki uses the `first`, `prev`, `next` and `last`
 * rels for cursor-based pagination.
 */
export function parseLinkHeader(header: string | null | undefined): PageLinks {
  const links: PageLinks = {};
  if (!header) return links;

  for (const part of header.split(',')) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="?([^",\s]+)"?/);
    if (!match) continue;
    const [, url, rel] = match;
    if (rel === 'first' || rel === 'prev' || rel === 'next' || rel === 'last') {
      links[rel] = url;
    }
  }

  return links;
}

/**
 * Fetch a single page from a cursor-paginated endpoint. Returns the page data
 * plus the parsed `Link` header so callers can decide whether to continue.
 */
export async function fetchPage<T>(
  client: HttpClient,
  path: string,
  options: RequestOptions = {},
  method: HttpMethod = 'GET'
): Promise<Page<T>> {
  const { data, headers } = await client.requestRaw<T[]>(method, path, options);
  return {
    data: Array.isArray(data) ? data : [],
    links: parseLinkHeader(headers.get('link')),
  };
}

/**
 * Auto-paginate a cursor-paginated endpoint by following the
 * `Link: rel="next"` URL until it is exhausted, yielding each item across all
 * pages. The `next` URL is absolute with the cursor baked in, so subsequent
 * requests pass it straight through.
 */
export async function* paginate<T>(
  client: HttpClient,
  path: string,
  options: RequestOptions = {}
): AsyncIterable<T> {
  let page = await fetchPage<T>(client, path, options);
  for (const item of page.data) yield item;

  let next = page.links.next;
  while (next) {
    page = await fetchPage<T>(client, next);
    for (const item of page.data) yield item;
    next = page.links.next;
  }
}
