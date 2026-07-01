/**
 * Base error thrown for any failed Meraki Dashboard API request.
 * Carries the HTTP `statusCode` and the parsed `response` body when available.
 */
export class MerakiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

/** HTTP 401 — the API key is missing, invalid or revoked. */
export class AuthenticationError extends MerakiError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response);
  }
}

/** HTTP 403 — the API key is valid but not permitted for this resource. */
export class ForbiddenError extends MerakiError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
  }
}

/** HTTP 404 — the requested resource does not exist. */
export class NotFoundError extends MerakiError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
  }
}

/** HTTP 400 — the request was malformed or failed validation. */
export class ValidationError extends MerakiError {
  constructor(message: string, response?: unknown) {
    super(message, 400, response);
  }
}

/**
 * HTTP 429 — the Meraki rate limit (~10 requests/second per organization) was
 * exceeded. `retryAfter` is the number of seconds from the `Retry-After`
 * response header, when present.
 */
export class RateLimitError extends MerakiError {
  constructor(
    message: string,
    public retryAfter?: number,
    response?: unknown
  ) {
    super(message, 429, response);
  }
}

/** HTTP 5xx — an upstream/server error from the Meraki cloud. */
export class ServerError extends MerakiError {
  constructor(message: string, statusCode: number, response?: unknown) {
    super(message, statusCode, response);
  }
}
