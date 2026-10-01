/**
 * Optional backend. The app is fully functional without it: it exists only so a
 * visitor can use Gemini without pasting a key into the browser, by holding the
 * key in an environment variable on a machine they control.
 *
 * The deployed GitHub Pages site never runs this. See README "AI setup".
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

const send = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

const readBody = (req) =>
  new Promise((done, fail) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1_000_000) fail(new Error('body too large'));
    });
    req.on('end', () => done(data));
    req.on('error', fail);
  });

/**
 * Builds the server. Exported so tests can start it on an ephemeral port with a
 * stubbed key instead of shelling out to a child process.
 */
export function createNeibourlyServer({ apiKey = '', model = 'gemini-2.5-flash', staticDir = dist } = {}) {
  async function proxyGemini(req, res) {
    // Validate the request before the key, so a caller always gets the real
    // reason it failed.
    let prompt;
    try {
      ({ prompt } = JSON.parse(await readBody(req)));
    } catch {
      return send(res, 400, JSON.stringify({ error: 'Body must be JSON: { "prompt": "..." }' }));
    }
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return send(res, 400, JSON.stringify({ error: 'prompt is required' }));
    }
    if (!apiKey) {
      return send(res, 503, JSON.stringify({ error: 'GEMINI_API_KEY is not set on the server.' }));
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are a careful assistant. Never invent a phone number, fee, opening time or procedure.' }],
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      },
    );

    const data = await upstream.json();
    if (!upstream.ok) return send(res, upstream.status, JSON.stringify(data));
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    send(res, 200, JSON.stringify({ text }));
  }

  return createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, JSON.stringify({ ok: true, keyConfigured: Boolean(apiKey), model }));
    }
    if (req.method === 'POST' && url.pathname === '/api/gemini') {
      return proxyGemini(req, res).catch((e) => send(res, 500, JSON.stringify({ error: String(e.message ?? e) })));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
    }

    // Static files, then index.html for any client-side route.
    if (!existsSync(staticDir)) {
      return send(res, 404, 'dist/ not found. Run npm run build first.', 'text/plain; charset=utf-8');
    }
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    const file = join(staticDir, rel);
    if (rel && file.startsWith(staticDir) && existsSync(file) && extname(file)) {
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      return res.end(readFileSync(file));
    }
    res.writeHead(200, { 'content-type': MIME['.html'] });
    res.end(readFileSync(join(staticDir, 'index.html')));
  });
}

// Only listen when run directly, so importing this file has no side effects.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const apiKey = process.env.GEMINI_API_KEY ?? '';
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  const port = Number(process.env.PORT ?? 8787);
  const server = createNeibourlyServer({ apiKey, model });
  server.listen(port, () => {
    console.log(`NEIBOURLY dev server on http://localhost:${port}`);
    console.log(apiKey ? `Gemini proxy enabled (${model})` : 'No GEMINI_API_KEY set - static app only');
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}
