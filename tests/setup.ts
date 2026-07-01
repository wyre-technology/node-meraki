import { vi } from 'vitest';

// Mock fetch globally so tests never hit the network unless they inject their
// own fetch implementation via the client config.
globalThis.fetch = vi.fn();
