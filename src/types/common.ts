/** Cursor-pagination query parameters shared across Meraki list endpoints. */
export interface PaginationParams {
  /** Number of entries per page (Meraki caps this per-endpoint). */
  perPage?: number;
  /** Return items after this cursor value (forward pagination). */
  startingAfter?: string;
  /** Return items before this cursor value (backward pagination). */
  endingBefore?: string;
}

/** URLs parsed from the RFC 5988 `Link` response header. */
export interface PageLinks {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

/** A single page of results plus the pagination links from the `Link` header. */
export interface Page<T> {
  data: T[];
  links: PageLinks;
}
