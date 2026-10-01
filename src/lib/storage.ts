/**
 * Namespaced, versioned localStorage helpers.
 *
 * Everything a visitor creates lives in this browser only. NEIBOURLY has no
 * account system and no server database, so this module is the boundary that
 * keeps private data local: nothing is sent anywhere unless the visitor
 * explicitly types a Gemini API key and asks the assistant a question.
 */

const NS = 'neibourly:v1';

export const storageKey = (name: string) => `${NS}:${name}`;

export function readJson<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt or unavailable storage must never break the app.
    return fallback;
  }
}

export function writeJson(name: string, value: unknown): boolean {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(name: string): void {
  try {
    localStorage.removeItem(storageKey(name));
  } catch {
    /* ignore */
  }
}

/** Every key this app owns, so "clear local data" can be exact. */
export const OWNED_KEYS = [
  'posts',
  'reactions',
  'saved',
  'settings',
  'profile',
  'assistant-key',
  'assistant-log',
  'seen-intro',
] as const;

export function clearAll(): void {
  for (const k of OWNED_KEYS) removeKey(k);
}

/** True when the visitor has already created anything of their own. */
export function hasUserData(): boolean {
  try {
    return OWNED_KEYS.some((k) => k !== 'seen-intro' && localStorage.getItem(storageKey(k)));
  } catch {
    return false;
  }
}

export const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Stable avatar colour from a name, so the same person always looks the same. */
const AVATAR_COLORS = [
  'var(--pine-500)',
  'var(--clay-500)',
  'var(--info)',
  'var(--pine-700)',
  'var(--clay-600)',
  'var(--warn)',
  'var(--ok)',
];

export function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
