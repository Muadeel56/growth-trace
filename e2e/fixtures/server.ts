/**
 * Stub backend for Playwright. Serves `routes/<path>.json` for GET `/<path>` and answers
 * 501 for anything else, so a page that calls a new endpoint without a fixture fails
 * loudly instead of reaching a real backend. Next reaches it through API_BASE_URL (server
 * fetches) and NEXT_PUBLIC_API_BASE_URL (browser fetches); see playwright.config.ts.
 *
 * Run with plain Node (it strips TypeScript types): `node e2e/fixtures/server.ts`.
 */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const port = Number(process.env.FIXTURE_PORT ?? 3101);
const root = path.join(import.meta.dirname, 'routes');

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://fixture');
  const file = path.join(root, `${pathname.replace(/\/$/, '') || '/index'}.json`);
  const known = req.method === 'GET' && file.startsWith(root + path.sep);
  try {
    if (!known) throw new Error('unknown');
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(501, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: `No fixture for ${req.method} ${pathname}` }));
  }
}).listen(port, () => {
  console.log(`fixture API on http://localhost:${port}`);
});
