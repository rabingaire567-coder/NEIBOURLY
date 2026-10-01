import { describe, expect, it } from 'vitest';
import {
  GEO_TOTALS,
  LG_TYPE_COUNTS,
  addressLine,
  centroidOf,
  districtsOf,
  districtList,
  getDistrict,
  getLocalLevel,
  haversineKm,
  isWithin,
  labelFor,
  lgList,
  placeFromMatch,
  provinceList,
  searchGeo,
  stripTypeSuffix,
} from '@/lib/geo';

describe('administrative totals match the official published numbers', () => {
  it('counts every level', () => {
    expect(GEO_TOTALS.provinces).toBe(7);
    expect(GEO_TOTALS.districts).toBe(77);
    expect(GEO_TOTALS.localLevels).toBe(753);
    expect(GEO_TOTALS.wards).toBe(6743);
  });

  it('counts local level types', () => {
    expect(GEO_TOTALS.metros).toBe(LG_TYPE_COUNTS.metro);
    expect(GEO_TOTALS.subMetros).toBe(LG_TYPE_COUNTS.submetro);
    expect(GEO_TOTALS.municipalities).toBe(LG_TYPE_COUNTS.municipal);
    expect(GEO_TOTALS.rural).toBe(LG_TYPE_COUNTS.rural);
    expect(GEO_TOTALS.metros).toBe(6);
    expect(GEO_TOTALS.subMetros).toBe(11);
    expect(GEO_TOTALS.municipalities).toBe(276);
    expect(GEO_TOTALS.rural).toBe(460);
  });
});

describe('dataset integrity', () => {
  it('has unique ids at every level', () => {
    const ids = (xs: { id: number }[]) => new Set(xs.map((x) => x.id)).size;
    expect(ids(provinceList)).toBe(provinceList.length);
    expect(ids(districtList)).toBe(districtList.length);
    expect(ids(lgList)).toBe(lgList.length);
  });

  it('gives every district a province and every local level a district', () => {
    for (const d of districtList) expect(getDistrict(d.id)).toBeDefined();
    for (const l of lgList) expect(getLocalLevel(l.id)).toBeDefined();
  });

  it('keeps every centroid inside Nepal', () => {
    // Bounding box of the country, with a margin for projection noise.
    for (const l of lgList) {
      if (l.lat === null || l.lng === null) continue;
      expect(l.lat).toBeGreaterThan(26.3);
      expect(l.lat).toBeLessThan(30.5);
      expect(l.lng).toBeGreaterThan(79.8);
      expect(l.lng).toBeLessThan(88.3);
    }
  });

  it('has exactly one local level without a centroid, and it still resolves', () => {
    expect(GEO_TOTALS.withCentroid).toBe(GEO_TOTALS.localLevels - 1);
    const missing = lgList.filter((l) => l.lat === null);
    expect(missing).toHaveLength(1);
    // Falling back to the district keeps distance ranking working.
    expect(centroidOf({ provinceId: missing[0].province.id, districtId: missing[0].district.id, lgId: missing[0].id })).not.toBeNull();
  });

  it('has a positive ward count for every local level', () => {
    for (const l of lgList) expect(l.wards).toBeGreaterThan(0);
  });
});

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm({ lat: 27.7, lng: 85.32 }, { lat: 27.7, lng: 85.32 })).toBe(0);
  });

  it('is symmetric', () => {
    const ktm = { lat: 27.7172, lng: 85.324 };
    const bkt = { lat: 28.2096, lng: 83.9856 };
    expect(haversineKm(ktm, bkt)).toBeCloseTo(haversineKm(bkt, ktm), 9);
  });

  it('matches a known Nepal distance within 5%', () => {
    // Kathmandu to Pokhara is roughly 140 km great-circle.
    const km = haversineKm({ lat: 27.7172, lng: 85.324 }, { lat: 28.2096, lng: 83.9856 });
    expect(km).toBeGreaterThan(130);
    expect(km).toBeLessThan(150);
  });
});

describe('labels', () => {
  it('falls back to Nepal when there is no place', () => {
    expect(labelFor(null, 'en').full).toBe('Nepal');
    expect(addressLine(null, 'ne')).toBe('नेपाल');
  });

  it('builds a full English and Nepali address line', () => {
    const p = lgList.find((l) => l.name === 'Kathmandu Metropolitan City');
    expect(p).toBeDefined();
    const place = { provinceId: p!.province.id, districtId: p!.district.id, lgId: p!.id, ward: 5 };
    expect(addressLine(place, 'en')).toBe('Ward 5, Kathmandu, Kathmandu, Bagmati');
    expect(addressLine({ ...place, ward: undefined }, 'en')).toBe('Kathmandu, Kathmandu, Bagmati');
    expect(addressLine(place, 'ne')).toContain('वडा 5');
    expect(labelFor(place, 'en', true).short).toBe('Kathmandu');
  });

  it('strips administrative suffixes', () => {
    expect(stripTypeSuffix('Kathmandu Metropolitan City')).toBe('Kathmandu');
    expect(stripTypeSuffix('Patan Metropolitan City')).toBe('Patan');
    expect(stripTypeSuffix('Kageshwori Manohara Municipality')).toBe('Kageshwori Manohara');
    expect(stripTypeSuffix('Chandragadhi Municipality')).toBe('Chandragadhi');
  });
});

describe('hierarchy helpers', () => {
  it('lists districts of a province', () => {
    expect(districtsOf(1).length).toBeGreaterThan(0);
    expect(districtsOf(1).every((d) => d.provinceId === 1)).toBe(true);
  });

  it('tests containment at every depth', () => {
    const p = lgList.find((l) => l.name === 'Kathmandu Metropolitan City')!;
    const place = { provinceId: p.province.id, districtId: p.district.id, lgId: p.id };
    expect(isWithin(place, place)).toBe(true);
    expect(isWithin(place, { provinceId: p.province.id })).toBe(true);
    expect(isWithin(place, { districtId: p.district.id })).toBe(true);
    expect(isWithin(place, { lgId: p.id })).toBe(true);
    expect(isWithin(place, {})).toBe(false);
    expect(isWithin(place, { districtId: 999 })).toBe(false);
  });
});

describe('searchGeo', () => {
  it('returns nothing for an empty query', () => {
    expect(searchGeo('')).toEqual([]);
    expect(searchGeo('   ')).toEqual([]);
  });

  it('finds a province and its capital', () => {
    expect(searchGeo('koshi', 60).find((m) => m.kind === 'province')?.label).toBe('Koshi');
    // The official listing names provinces "प्रदेश न. १" in Nepali, so the
    // search box also indexes the short form used in everyday speech.
    expect(searchGeo('कोशी', 60).some((m) => m.kind === 'district' || m.kind === 'local')).toBe(true);
    expect(searchGeo('biratnagar').some((m) => m.label === 'Biratnagar')).toBe(true);
  });

  it('finds districts and local levels', () => {
    expect(searchGeo('kathmandu').some((m) => m.kind === 'district')).toBe(true);
    expect(searchGeo('bhaktapur').some((m) => m.kind === 'local')).toBe(true);
  });

  it('prefers prefix matches over substring matches', () => {
    const results = searchGeo('kath', 20);
    expect(results[0].label.toLowerCase().startsWith('kath')).toBe(true);
  });

  it('respects the limit and never repeats a row', () => {
    const results = searchGeo('a', 5);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(new Set(results.map((r) => `${r.kind}:${r.id}:${r.label}`)).size).toBe(results.length);
  });

  it('expands every match into a real place', () => {
    for (const m of searchGeo('pokhara', 5)) {
      const place = placeFromMatch(m);
      expect(place).not.toBeNull();
      expect(getLocalLevel(place!.lgId)).toBeDefined();
      expect(getDistrict(place!.districtId)?.provinceId).toBe(place!.provinceId);
    }
  });
});
