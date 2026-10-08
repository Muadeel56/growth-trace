const DEFAULT_API_BASE_URL = 'http://localhost:4000';

/**
 * Backend origin. Server code (Server Components, route handlers) reads `API_BASE_URL`;
 * browser code can only see `NEXT_PUBLIC_*` variables. Playwright points both at its
 * fixture server (e2e/fixtures/server.ts), so tests never need the real backend.
 */
export function apiBaseUrl(): string {
  const url =
    typeof window === 'undefined'
      ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL)
      : process.env.NEXT_PUBLIC_API_BASE_URL;
  return (url ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

/** Fetches JSON from the backend. Throws on a non-2xx response. */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, init);
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}
