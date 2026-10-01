import { SERVICES, SERVICE_TIPS, OFFICIAL_LINKS } from '@/data/services';
import { GEO_TOTALS, addressLine, labelFor, getLocalLevel } from '@/lib/geo';
import { answerOffline } from '@/lib/knowledge';
import type { KnowledgeContext } from '@/lib/knowledge';
import { readJson, writeJson } from '@/lib/storage';
import type { AssistantMessage, AssistantSource } from '@/types';

/**
 * BYOK (bring your own key) assistant.
 *
 * The visitor supplies a free Google AI Studio key in Settings. It is kept in
 * this browser's localStorage and sent only to Google's own Generative Language
 * API endpoint from the visitor's browser. Nothing is proxied through us, no key
 * is bundled in the repository, and the app is fully usable - for the assistant
 * included - without a key, because `answerOffline` handles the same intents
 * from local reference data.
 */

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash';
const KEY_STORE = 'assistant-key';

export const apiKeyStored = (): string => readJson<string>(KEY_STORE, '').trim();

export function saveApiKey(key: string): void {
  const clean = key.trim();
  if (clean) writeJson(KEY_STORE, clean);
  else writeJson(KEY_STORE, '');
}

export function clearApiKey(): void {
  writeJson(KEY_STORE, '');
}

const SYSTEM_PROMPT = `You are the in-app assistant for NEIBOURLY, a notice board for Nepal's 753 local levels (7 provinces, 77 districts).

Rules you must follow:
1. Answer only from the CONTEXT given. If the context does not contain the answer, say so plainly and point to the official source or the ward office. Never invent a phone number, an address, a fee, an office opening time, or a government procedure.
2. Nepal-specific: procedures are decided locally. Always tell the user that the ward office and its published citizen charter (वडापत्र) are the authority, and that they should confirm before acting.
3. Be concise and practical. Short paragraphs and bullet lists. No preamble, no restating the question.
4. Match the user's language. If they write in Nepali (Devanagari), answer in Nepali.
5. If someone describes an emergency, the first line must tell them to dial the relevant number (police 100, fire 101, ambulance 102, traffic 103) and not to wait for a chat reply.
6. Never ask for or repeat a national ID number, passport number, bank details, or a precise home address. If a volunteer offers to publish contact details publicly, advise them to keep it vague and use the in-app messaging.
7. Do not present yourself as a government official. NEIBOURLY is a community project and is not affiliated with any government body.`;

export interface AskOptions {
  question: string;
  history: AssistantMessage[];
  ctx: KnowledgeContext;
  signal?: AbortSignal;
}

/** Everything the model is allowed to know, assembled locally. */
function buildContext(ctx: KnowledgeContext): string {
  const place = ctx.place ?? null;
  const near = ctx.posts.slice(0, 12).map(
    (p) =>
      `- [${p.kind}] ${p.title} | ${labelFor(p.place).full}${p.place.ward ? `, ward ${p.place.ward}` : ''} | category: ${p.category} | contact: ${p.contact ?? 'ask in the app'}`,
  );

  return [
    place ? `VISITOR AREA: ${addressLine(place)}` : 'VISITOR AREA: not set',
    `NEPAL STRUCTURE: ${GEO_TOTALS.provinces} provinces, ${GEO_TOTALS.districts} districts, ${GEO_TOTALS.localLevels} local levels, ${GEO_TOTALS.wards} wards.`,
    '',
    'OFFICIAL SERVICES (national shortcodes, from Nepal Police and the Ministry of Local Government):',
    SERVICES.map((s) => `- ${s.name}${s.national ? ` (${s.national})` : ''} [${s.category}]: ${s.note} — ${s.sourceUrl ?? ''}`).join('\n'),
    '',
    'OFFICIAL PORTALS:',
    OFFICIAL_LINKS.map((l) => `- ${l.label}: ${l.url} — ${l.note}`).join('\n'),
    '',
    'LOCAL PROCEDURE GUIDANCE (general, not office-specific):',
    ...Object.entries(SERVICE_TIPS).map(([k, v]) => `- ${k}: ${v}`),
    '',
    `POSTS NEAR THE VISITOR (${ctx.posts.length} shown):`,
    near.length ? near.join('\n') : '- none in the selected area',
    '',
    'The visitor asks about their own daily life: local services, paperwork, help and offers nearby, neighbours.',
  ].join('\n');
}

interface GeminiPart {
  text: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  error?: { message?: string };
}

export interface AskResult {
  text: string;
  sources: AssistantSource[];
  origin: 'cloud' | 'offline';
  warning?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Ask Gemini. Falls back to the offline knowledge base on any failure. */
export async function ask(question: string, opts: AskOptions): Promise<AskResult> {
  const offline = answerOffline(question, opts.ctx);
  const key = apiKeyStored();

  if (!key) {
    return {
      text: offline.text,
      sources: offline.sources,
      origin: 'offline',
      warning: 'No API key set, so this answer comes from the built-in offline reference.',
    };
  }

  const history = opts.history
    .filter((m) => m.origin !== 'offline')
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`)
    .join('\n');

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `CONTEXT\n${buildContext(opts.ctx)}\n\nCONVERSATION SO FAR\n${history || '(none)'}\n\nVISITOR QUESTION\n${question}` }],
      },
    ],
    generationConfig: { temperature: 0.3, maxOutputTokens: 900 },
  };

  let lastError = '';
  // Two attempts: transient network failures are common on mobile connections.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_URL}/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: opts.signal,
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        lastError = res.status === 400 || res.status === 401 || res.status === 403
          ? 'Your API key was rejected by Google. Check it in Settings, or clear it to use the offline answers.'
          : res.status === 429
            ? 'Google rate-limited this key. Wait a moment, or clear the key to use the offline answers.'
            : `Google returned ${res.status}.`;
        if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 429) {
          return { text: offline.text, sources: offline.sources, origin: 'offline', warning: lastError };
        }
        throw new Error(detail || lastError);
      }

      const json = (await res.json()) as GeminiResponse;
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
      if (!text) throw new Error('Empty response from Gemini');

      return { text, sources: collectSources(text, opts.ctx), origin: 'cloud' };
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === 0) await sleep(600);
    }
  }

  return {
    text: offline.text,
    sources: offline.sources,
    origin: 'offline',
    warning: `${lastError} Falling back to the offline reference.`,
  };
}

/** Pull official URLs the model actually cited, so links are never invented. */
function collectSources(text: string, ctx: KnowledgeContext): AssistantSource[] {
  const urls = text.match(/https?:\/\/[^\s)>\]]+/g) ?? [];
  const allowed = new Map<string, AssistantSource>();
  for (const s of SERVICES) {
    if (s.sourceUrl) allowed.set(s.sourceUrl, { label: `${s.name} (${s.source})`, href: s.sourceUrl });
  }
  for (const l of OFFICIAL_LINKS) allowed.set(l.url, { label: `${l.label} — ${l.note}`, href: l.url });
  allowed.set('https://aistudio.google.com/apikey', { label: 'Google AI Studio keys', href: 'https://aistudio.google.com/apikey' });
  if (ctx.place) {
    const lg = getLocalLevel(ctx.place.lgId);
    if (lg?.site) allowed.set(lg.site, { label: `${lg.name} official website`, href: lg.site });
    allowed.set('https://lgrms.gov.np/', { label: 'Local government directory', href: 'https://lgrms.gov.np/' });
  }

  const out: AssistantSource[] = [];
  for (const url of urls) {
    const clean = url.replace(/[.,]$/, '');
    const hit = allowed.get(clean);
    if (hit && !out.some((o) => o.href === hit.href)) out.push(hit);
    else if (clean.startsWith('https://') && /gov\.np/.test(clean) && !out.some((o) => o.href === clean)) {
      out.push({ label: clean.replace(/^https?:\/\//, ''), href: clean });
    }
    if (out.length >= 4) break;
  }
  return out;
}

/** Minimal Markdown → HTML for assistant bubbles. Input is model output. */
export function renderMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const out: string[] = [];
  let list: string[] | null = null;

  const flush = () => {
    if (list) {
      out.push(`<ul>${list.map((i) => `<li>${i}</li>`).join('')}</ul>`);
      list = null;
    }
  };

  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      list ??= [];
      list.push(inline(bullet[1]));
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    flush();
    if (/^###\s+/.test(line)) out.push(`<h4>${inline(line.replace(/^###\s+/, ''))}</h4>`);
    else if (/^##\s+/.test(line)) out.push(`<h3>${inline(line.replace(/^##\s+/, ''))}</h3>`);
    else if (/^\d+[.)]\s+/.test(line)) out.push(`<p>${inline(line.replace(/^\d+[.)]\s+/, ''))}</p>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  flush();

  return out.join('');
}
