import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createNeibourlyServer } from '../../server/index.js';

/**
 * The suite builds its own fixture directory instead of reading `dist/`, so it
 * does not depend on build order and never fails on a clean checkout.
 */
function makeFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'neibourly-test-'));
  mkdirSync(join(dir, 'assets'));
  writeFileSync(join(dir, 'index.html'), '<!doctype html><html><body><div id="root"></div></body></html>');
  writeFileSync(join(dir, 'assets', 'index-test123.js'), 'export const ok = 1;\n');
  return dir;
}

let server: Server;
let base: string;

beforeAll(async () => {
  server = createNeibourlyServer({ apiKey: '', staticDir: makeFixture() });
  await new Promise<void>((done) => server.listen(0, () => done()));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

afterAll(async () => {
  await new Promise<void>((done) => server.close(() => done()));
});

describe('optional host', () => {
  it('reports its health and that no key is configured', async () => {
    const r = await fetch(`${base}/api/health`);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.ok).toBe(true);
    expect(body.keyConfigured).toBe(false);
  });

  it('serves index.html for a deep link so the SPA can boot', async () => {
    const r = await fetch(`${base}/ask/seed-ask-1`);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/html');
    expect(await r.text()).toContain('<div id="root">');
  });

  it('serves a built asset with the right content type', async () => {
    const r = await fetch(`${base}/assets/index-test123.js`);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('javascript');
  });

  it('refuses to serve files outside the static directory', async () => {
    const r = await fetch(`${base}/../package.json`);
    expect(await r.text()).not.toContain('devDependencies');
  });

  it('rejects a malformed request body before checking the key', async () => {
    const r = await fetch(`${base}/api/gemini`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    expect(r.status).toBe(400);
  });

  it('reports 503 for a valid request when no key is configured', async () => {
    const r = await fetch(`${base}/api/gemini`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello' }),
    });
    expect(r.status).toBe(503);
    expect((await r.json()).error).toContain('GEMINI_API_KEY');
  });

  it('rejects an empty prompt', async () => {
    const r = await fetch(`${base}/api/gemini`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });
    expect(r.status).toBe(400);
  });

  it('rejects a non-GET method that is not the proxy', async () => {
    const r = await fetch(`${base}/anything`, { method: 'POST' });
    expect(r.status).toBe(405);
  });
});
