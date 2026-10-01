import type { Lang } from '@/types';

/** "just now", "12m", "3h", "2d", "12 Mar". English unless Nepali is asked. */
export function relativeTime(iso: string, lang: Lang = 'en'): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60_000);

  if (mins < 1) return lang === 'ne' ? 'अहिले' : 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;

  const d = new Date(then);
  if (lang === 'ne') {
    const months = ['जन', 'फेब', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अग', 'सेप्ट', 'अक्टो', 'नोभ', 'डिस'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Absolute date, used on post detail and in print. */
export function fullDate(iso: string, lang: Lang = 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const EMOJI: Record<string, string> = {
  education: '📚',
  health: '🩺',
  documents: '📄',
  emergency: '🚨',
  lostfound: '🔍',
  transport: '🚌',
  jobs: '💼',
  skills: '🔧',
  volunteer: '🤝',
  civic: '🏛️',
  events: '🎉',
  market: '🛒',
};

export const categoryEmoji = (id: string): string => EMOJI[id] ?? '📌';

/** Distance for "near me" labels. Null when no representative point exists. */
export function formatDistance(km: number | null): string {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const toNepaliDigits = (s: string | number): string =>
  String(s).replace(/\d/g, (d) => NEPALI_DIGITS[Number(d)]);

/** Distance with Nepali numerals, for the few places that show Nepali digits. */
export const distanceNp = (km: number | null): string =>
  km === null ? '' : toNepaliDigits(formatDistance(km)).replace(/\s*km$/, ' किमी');

/** Truncate on a word boundary so cards do not cut mid-word. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
}

export const plural = (n: number, one: string, many = `${one}s`): string =>
  `${n} ${n === 1 ? one : many}`;
