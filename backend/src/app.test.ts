import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Value } from 'typebox/value';
import { describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { HealthResponse } from './routes/health.js';

describe('GET /health', () => {
  it('answers ok from the real API', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', source: 'api' });
    expect(Value.Check(HealthResponse, response.json())).toBe(true);
  });

  it('agrees with the Playwright stub fixture', async () => {
    const fixture = path.resolve(import.meta.dirname, '../../e2e/fixtures/routes/health.json');
    const body: unknown = JSON.parse(await readFile(fixture, 'utf8'));
    expect(Value.Check(HealthResponse, body)).toBe(true);
  });
});

describe('route schemas', () => {
  it('every documented operation has a response schema', async () => {
    const app = await buildApp();
    await app.ready();
    const paths: Record<string, object | undefined> = app.swagger().paths ?? {};
    expect(Object.keys(paths)).toContain('/health');
    for (const [url, item] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(item ?? {})) {
        expect(operation, `${method} ${url}`).toHaveProperty('responses.200');
      }
    }
  });

  it('rejects a route without a response schema', async () => {
    const app = await buildApp();
    expect(() => app.get('/undocumented', () => 'nope')).toThrow(/no schema.response/);
  });
});
