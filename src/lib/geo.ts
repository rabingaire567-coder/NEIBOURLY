import type { District, LocalLevel, Province } from '../data/nepal-geo';
import { provinces } from '../data/nepal-geo';

/** Resolved Nepal location, from the coarsest useful unit down to a ward. */
export interface Place {
  provinceId: number;
  districtId: number;
  lgId: number;
  ward?: number;
}

/** A place where a search box accepts only whole units; ward is chosen later. */
export type PlaceInput = Pick<Place, 'provinceId' | 'districtId' | 'lgId'>;

export interface LocalLevelRef extends LocalLevel {
  district: District;
  province: Province;
}

export interface DistrictRef extends District {
  provinceId: number;
  province: Province;
}

export const provinceList: Province[] = provinces;
export const districtList: DistrictRef[] = provinces.flatMap((p) =>
  p.districts.map((d) => ({ ...d, provinceId: p.id, province: p })),
);
export const lgList: LocalLevelRef[] = districtList.flatMap((d) =>
  d.lg.map((l) => ({ ...l, district: d, province: d.province })),
);

const provinceIndex = new Map<number, Province>(provinces.map((p) => [p.id, p]));
const districtIndex = new Map<number, DistrictRef>(districtList.map((d) => [d.id, d]));
const lgIndex = new Map<number, LocalLevelRef>(lgList.map((l) => [l.id, l]));

export const getProvince = (id: number): Province | undefined => provinceIndex.get(id);
export const getDistrict = (id: number): DistrictRef | undefined => districtIndex.get(id);
export const getLocalLevel = (id: number): LocalLevelRef | undefined => lgIndex.get(id);

export const districtsOf = (provinceId: number): DistrictRef[] =>
  districtList.filter((d) => d.provinceId === provinceId);
export const localLevelsOf = (districtId: number): LocalLevel[] =>
  districtIndex.get(districtId)?.lg ?? [];

/** Highest-level breakdown published by the Ministry of Local Government. */
export const LG_TYPE_COUNTS = {
  metro: 6,
  submetro: 11,
  municipal: 276,
  rural: 460,
} as const;

export const LOCAL_TYPE_LABEL: Record<LocalLevel['type'], string> = {
  metro: 'Metropolitan City',
  submetro: 'Sub-Metropolitan City',
  municipal: 'Municipality',
  rural: 'Rural Municipality',
};

export const LOCAL_TYPE_LABEL_NP: Record<LocalLevel['type'], string> = {
  metro: 'महानगरपालिका',
  submetro: 'उपमहानगरपालिका',
  municipal: 'नगरपालिका',
  rural: 'गाउँपालिका',
};

export const TYPE_TONE: Record<LocalLevel['type'], string> = {
  metro: 'var(--clay-600)',
  submetro: 'var(--info)',
  municipal: 'var(--pine-600)',
  rural: 'var(--ink-600)',
};

/** Great-circle distance in km. Used only to rank "nearby", never as an address. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface Point {
  lat: number;
  lng: number;
}

const point = (lat: number | null, lng: number | null): Point | null =>
  lat === null || lng === null ? null : { lat, lng };

/**
 * Representative point for a place, falling back up the hierarchy when a unit
 * has no derivable centroid (one local level does).
 */
export function centroidOf(place?: Partial<Place> | null): Point | null {
  if (!place) return null;
  if (place.lgId) {
    const lg = getLocalLevel(place.lgId);
    const p = lg && point(lg.lat, lg.lng);
    if (p) return p;
  }
  if (place.districtId) {
    const d = getDistrict(place.districtId);
    const p = d && point(d.lat, d.lng);
    if (p) return p;
  }
  if (place.provinceId) {
    const prov = getProvince(place.provinceId);
    if (prov) return point(prov.lat, prov.lng);
  }
  return null;
}

/**
 * Ranked "near me" ordering: the same local level always wins, then distance.
 * Returns `km: null` when either side has no representative point.
 */
export function nearbySort(
  origin: Partial<Place> | null | undefined,
  target: PlaceInput,
): { same: boolean; km: number | null } {
  const from = centroidOf(origin);
  const to = centroidOf(target);
  return {
    same: origin?.lgId === target.lgId,
    km: from && to ? haversineKm(from, to) : null,
  };
}

/** Inclusive-ancestor test: is `child` inside `parent` at any depth? */
export function isWithin(child: PlaceInput, parent: Partial<PlaceInput>): boolean {
  if (parent.lgId && child.lgId !== parent.lgId) return false;
  if (parent.districtId && child.districtId !== parent.districtId) return false;
  if (parent.provinceId && child.provinceId !== parent.provinceId) return false;
  return Boolean(parent.lgId || parent.districtId || parent.provinceId);
}

/** Complete place objects for each unit in a parent, for feed scoping. */
export const localLevelsAsPlaces = (districtId: number): PlaceInput[] =>
  localLevelsOf(districtId).map((l) => ({ provinceId: getDistrict(districtId)!.provinceId, districtId, lgId: l.id }));

export const stripTypeSuffix = (s?: string): string =>
  (s ?? '')
    .replace(/ (Sub-)?Metropolitan City$/i, '')
    .replace(/ (Rural )?Municipality$/i, '')
    .trim();

export interface PlaceLabel {
  short: string;
  full: string;
  ward?: number;
}

/** Short human label for a place, e.g. "Kageshwori Manohara". */
export function labelFor(
  place: (PlaceInput & Partial<Place>) | null,
  lang: 'en' | 'ne' = 'en',
  withWard = false,
): PlaceLabel {
  if (!place) return { short: 'Nepal', full: 'Nepal' };
  const lg = getLocalLevel(place.lgId);
  const district = getDistrict(place.districtId);
  const province = getProvince(place.provinceId);
  const pick = (en?: string, np?: string) => (lang === 'ne' ? (np ?? en) : en);
  const name = stripTypeSuffix(pick(lg?.name, lg?.nameNp));
  const dist = pick(district?.name, district?.nameNp) ?? '';
  const prov = pick(province?.name, province?.nameNp) ?? '';
  const ward = withWard && place.ward ? place.ward : undefined;
  const full = [name, dist, prov].filter(Boolean).join(', ') || 'Nepal';
  const short = name || dist || prov || 'Nepal';
  return { short, full, ...(ward ? { ward } : {}) };
}

/** Province → District → Local level → Ward, as a compact address line. */
export function addressLine(place: (PlaceInput & Partial<Place>) | null, lang: 'en' | 'ne' = 'en'): string {
  if (!place) return lang === 'ne' ? 'नेपाल' : 'Nepal';
  const lg = getLocalLevel(place.lgId);
  const district = getDistrict(place.districtId);
  const province = getProvince(place.provinceId);
  const pick = (en?: string, np?: string) => (lang === 'ne' ? (np ?? en) : en);
  const parts = [
    place.ward ? (lang === 'ne' ? `वडा ${place.ward}` : `Ward ${place.ward}`) : null,
    stripTypeSuffix(pick(lg?.name, lg?.nameNp)),
    pick(district?.name, district?.nameNp),
    pick(province?.name, province?.nameNp),
  ];
  return parts.filter(Boolean).join(', ');
}

export interface GeoMatch {
  kind: 'province' | 'district' | 'local';
  id: number;
  label: string;
  sub?: string;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Prefix matches first, then substring matches; both languages searched. */
export function searchGeo(query: string, limit = 8): GeoMatch[] {
  const q = normalise(query);
  if (!q) return [];
  const hits: { m: GeoMatch; score: number }[] = [];

  const add = (m: GeoMatch, en: string, np: string | undefined, base: number) => {
    if (normalise(en).startsWith(q)) hits.push({ m, score: base + 3 });
    else if (normalise(en).includes(q)) hits.push({ m, score: base });
    if (np && normalise(np).includes(q)) hits.push({ m, score: base + 1 });
  };

  for (const p of provinceList) {
    add({ kind: 'province', id: p.id, label: p.name, sub: p.nameNp }, p.name, p.nameNp, 3);
    add({ kind: 'province', id: p.id, label: p.hq, sub: p.name }, p.hq, undefined, 2);
    for (const d of p.districts) {
      const sub = `${p.name} · ${d.nameNp}`;
      add({ kind: 'district', id: d.id, label: d.name, sub }, d.name, d.nameNp, 5);
      add({ kind: 'district', id: d.id, label: d.hq, sub: `${p.name} · ${d.name}` }, d.hq, d.hqNp, 3);
      for (const l of d.lg) {
        const lgSub = `${d.name} · ${l.nameNp}`;
        add({ kind: 'local', id: l.id, label: l.name, sub: lgSub }, l.name, l.nameNp, 6);
        add({ kind: 'local', id: l.id, label: l.nameNp, sub: `${d.name} · ${l.name}` }, l.nameNp, undefined, 4);
      }
    }
  }

  const seen = new Set<string>();
  return hits
    .sort((a, b) => b.score - a.score)
    .filter((h) => {
      const k = `${h.m.kind}:${h.m.id}:${h.m.label}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit)
    .map((h) => h.m);
}

/** Expand a coarse match into a concrete province → district → local level. */
export function placeFromMatch(match: GeoMatch): PlaceInput | null {
  if (match.kind === 'province') {
    const p = getProvince(match.id);
    if (!p) return null;
    const d = p.districts[0];
    return { provinceId: p.id, districtId: d.id, lgId: d.lg[0].id };
  }
  if (match.kind === 'district') {
    const d = getDistrict(match.id);
    if (!d) return null;
    return { provinceId: d.provinceId, districtId: d.id, lgId: d.lg[0].id };
  }
  const lg = getLocalLevel(match.id);
  if (!lg) return null;
  return { provinceId: lg.province.id, districtId: lg.district.id, lgId: lg.id };
}

/** Totals shown in the explorer and on the landing page. */
export const GEO_TOTALS = {
  provinces: provinceList.length,
  districts: districtList.length,
  localLevels: lgList.length,
  wards: lgList.reduce((n, l) => n + l.wards, 0),
  withCentroid: lgList.filter((l) => l.lat !== null).length,
  metros: lgList.filter((l) => l.type === 'metro').length,
  subMetros: lgList.filter((l) => l.type === 'submetro').length,
  municipalities: lgList.filter((l) => l.type === 'municipal').length,
  rural: lgList.filter((l) => l.type === 'rural').length,
} as const;
