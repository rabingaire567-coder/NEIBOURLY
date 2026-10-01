import { describe, expect, it } from 'vitest';
import { SEED_POSTS } from '@/data/seed';
import { SERVICES, OFFICIAL_LINKS } from '@/data/services';
import { getDistrict, getLocalLevel, labelFor } from '@/lib/geo';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import type { CategoryId } from '@/types';

describe('seed content', () => {
  it('is not empty and covers all three kinds', () => {
    expect(SEED_POSTS.length).toBeGreaterThan(0);
    expect(new Set(SEED_POSTS.map((p) => p.kind))).toEqual(new Set(['ask', 'offer', 'post']));
  });

  it('marks every post as demo so it can never look real', () => {
    for (const p of SEED_POSTS) {
      expect(p.demo).toBe(true);
      for (const r of p.replies ?? []) expect(r.demo).toBe(true);
    }
  });

  it('uses unique ids', () => {
    expect(new Set(SEED_POSTS.map((p) => p.id)).size).toBe(SEED_POSTS.length);
  });

  it('points every post at a real local level', () => {
    for (const p of SEED_POSTS) {
      const lg = getLocalLevel(p.place.lgId);
      expect(lg, p.id).toBeDefined();
      expect(getDistrict(p.place.districtId)?.provinceId).toBe(p.place.provinceId);
    }
  });

  it('uses known categories and has a Nepali title where one is required', () => {
    for (const p of SEED_POSTS) {
      expect(CATEGORY_MAP[p.category as CategoryId], p.id).toBeDefined();
      if (p.titleNp) expect(p.titleNp.length).toBeGreaterThan(0);
    }
  });

  it('leaves contact details to in-app replies', () => {
    for (const p of SEED_POSTS) {
      expect(p.contact ?? '').not.toMatch(/\d{6,}/);
    }
  });
});

describe('categories', () => {
  it('has a bilingual label and a lookup map covering every id', () => {
    for (const c of CATEGORIES) {
      expect(c.label).toBeTruthy();
      expect(c.labelNp).toBeTruthy();
      expect(CATEGORY_MAP[c.id]).toBe(c);
    }
  });
});

describe('services and official links', () => {
  it('uses only https urls', () => {
    for (const s of SERVICES) {
      if (s.sourceUrl) expect(s.sourceUrl, s.name).toMatch(/^https:\/\//);
    }
    for (const l of OFFICIAL_LINKS) expect(l.url, l.label).toMatch(/^https:\/\//);
  });

  it('uses only the real emergency shortcodes', () => {
    const known = new Set(['100', '101', '102', '103', '104', '1098', '1145', '1114', '1147']);
    for (const s of SERVICES) {
      if (!s.national) continue;
      const digits = s.national.replace(/\D/g, '');
      expect(known.has(digits), `${s.name}: ${s.national}`).toBe(true);
    }
  });

  it('names the source behind every service', () => {
    for (const s of SERVICES) expect(s.source, s.name).toBeTruthy();
  });
});

describe('labels render for seeded places', () => {
  it('produces a non-empty label for every seed post', () => {
    for (const p of SEED_POSTS) {
      expect(labelFor(p.place, 'en', true).full).not.toBe('Nepal');
    }
  });
});
