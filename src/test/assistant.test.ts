import { describe, expect, it } from 'vitest';
import { answerOffline, SUGGESTIONS } from '@/lib/knowledge';
import { apiKeyStored, clearApiKey, saveApiKey } from '@/lib/ai';
import { SERVICES } from '@/data/services';
import { lgList } from '@/lib/geo';

const ctx = { place: null, posts: [] as never[] };
const ktm = lgList.find((l) => l.name === 'Kathmandu Metropolitan City')!;
const ctxWithPlace = {
  place: { provinceId: ktm.province.id, districtId: ktm.district.id, lgId: ktm.id },
  posts: [] as never[],
};

describe('offline assistant', () => {
  it('handles an empty question', () => {
    expect(answerOffline('', ctx).text).toBeTruthy();
  });

  it('answers emergency numbers from reference data', () => {
    const a = answerOffline('What are the emergency numbers?', ctx);
    expect(a.text).toContain('100');
    expect(a.sources.length).toBeGreaterThan(0);
  });

  it('recognises a Nepali question and still returns grounded sources', () => {
    const a = answerOffline('आपतकालीन नम्बर कति हुन्?', ctx);
    expect(a.text).toContain('100');
    expect(a.sources.length).toBeGreaterThan(0);
  });

  it('uses the selected area when one is set', () => {
    const withPlace = answerOffline('What is my local level?', ctxWithPlace);
    const withoutPlace = answerOffline('What is my local level?', ctx);
    expect(withPlace.text).not.toBe(withoutPlace.text);
    expect(withPlace.text.toLowerCase()).toContain('kathmandu');
  });

  it('never quotes a number as a phone number unless it exists in the services data', () => {
    const real = new Set(SERVICES.map((s) => s.national?.replace(/\D/g, '') ?? '').filter(Boolean));
    // Only numbers presented as contact details are checked, so ward counts and
    // other figures cannot produce false failures.
    const phoneContext = /\b(dial|call|number|contact|emergency|helpline|hotline)\b[^\n]{0,40}?\b(\d{3,4})\b|\b(\d{3,4})\b[^\n]{0,40}?\b(dial|call)\b/gi;
    for (const q of SUGGESTIONS) {
      const text = answerOffline(q, ctxWithPlace).text;
      for (const m of text.matchAll(phoneContext)) {
        const num = m[2] ?? m[3];
        expect(real.has(num ?? ''), `${q} → ${num}`).toBe(true);
      }
    }
  });

  it('always suggests a follow-up', () => {
    for (const q of [...SUGGESTIONS, 'zzzz nonsense']) {
      expect(answerOffline(q, ctx).followUp.length).toBeGreaterThan(0);
    }
  });

  it('returns plain text that never contains raw HTML', () => {
    for (const q of SUGGESTIONS) {
      expect(answerOffline(q, ctx).text).not.toMatch(/<[a-z]/i);
    }
  });
});

describe('api key handling', () => {
  it('stores, reads and clears the key', () => {
    expect(apiKeyStored()).toBe('');
    saveApiKey('AIza-test-key-123');
    expect(apiKeyStored()).toBe('AIza-test-key-123');
    clearApiKey();
    expect(apiKeyStored()).toBe('');
  });

  it('ignores an empty key', () => {
    saveApiKey('AIza-test-key-123');
    saveApiKey('');
    expect(apiKeyStored()).toBe('');
  });
});
