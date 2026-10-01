import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  LOCAL_TYPE_LABEL,
  districtList,
  getLocalLevel,
  labelFor,
  localLevelsOf,
  placeFromMatch,
  provinceList,
  searchGeo,
} from '@/lib/geo';
import type { GeoMatch } from '@/lib/geo';
import { Button } from './ui';
import { IconPin, IconSearch } from './Icons';

interface Props {
  /** Called after a place is chosen, so the caller can scroll or submit. */
  onPicked?: () => void;
  label?: string;
  /** Ward input is shown by the caller, not here. */
  compact?: boolean;
}

const KIND_LABEL: Record<GeoMatch['kind'], string> = {
  province: 'Province',
  district: 'District',
  local: 'Local level',
};

/**
 * Two ways to choose an area, both real:
 * 1. Typeahead over all 837 named units, English or Nepali.
 * 2. Browse province → district → local level with breadcrumbs.
 *
 * Selecting a province or district selects its first local level so the
 * stored place is always a concrete unit, never a half-finished step.
 */
export function LocationPicker({ onPicked, label, compact }: Props) {
  const { settings, setScope, profile } = useStore();
  const [query, setQuery] = useState('');
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matches = useMemo(() => (query.trim() ? searchGeo(query, 10) : []), [query]);

  const choose = (m: GeoMatch) => {
    const place = placeFromMatch(m);
    if (!place) return;
    setScope(place);
    setQuery('');
    setProvinceId(null);
    setDistrictId(null);
    onPicked?.();
  };

  const chooseDistrict = (id: number) => {
    const d = districtList.find((x) => x.id === id);
    if (!d) return;
    setDistrictId(id);
    setProvinceId(d.provinceId);
    choose({ kind: 'local', id: d.lg[0].id, label: d.lg[0].name });
  };

  const chooseLocal = (id: number) => choose({ kind: 'local', id, label: getLocalLevel(id)?.name ?? '' });

  const province = provinceId ? provinceList.find((p) => p.id === provinceId) : null;
  const district = districtId ? districtList.find((d) => d.id === districtId) : null;

  return (
    <div className="locate">
      <div className="field">
        <label htmlFor="locate-q" className="field__label">
          {label ?? 'Search for a place'}
        </label>
        <div className="nav__search" style={{ maxWidth: 'none' }}>
          <IconSearch size={15} className="nav__search-icon" />
          <input
            id="locate-q"
            ref={inputRef}
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pokhara, पोखरा, or Boudha"
            autoComplete="off"
          />
        </div>
        <span className="field__hint">
          Search in English or Nepali. All {provinceList.length} provinces, {districtList.length} districts and
          local levels are covered.
        </span>
      </div>

      {query.trim() ? (
        <div className="locate__list" role="listbox" aria-label="Place results">
          {matches.length === 0 && <p className="field__hint">No place matches “{query}”.</p>}
          {matches.map((m) => (
            <button
              key={`${m.kind}-${m.id}-${m.label}`}
              type="button"
              className="locate__result"
              role="option"
              aria-selected={false}
              onClick={() => choose(m)}
            >
              <IconPin size={16} />
              <span className="grow">
                <span style={{ display: 'block', fontWeight: 600 }}>{m.label}</span>
                <span className="locate__kind">{KIND_LABEL[m.kind]}</span>
                {m.sub && (
                  <span style={{ display: 'block', color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                    {m.sub}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="stack stack--sm">
          {!compact && (
            <div className="breadcrumb">
              {province ? (
                <>
                  <button type="button" onClick={() => { setProvinceId(null); setDistrictId(null); }}>
                    All provinces
                  </button>
                  <span aria-hidden> / </span>
                  <span>{province.name}</span>
                </>
              ) : (
                <span>All provinces</span>
              )}
              {district && (
                <>
                  <span aria-hidden> / </span>
                  <span>{district.name}</span>
                </>
              )}
            </div>
          )}

          <div className="locate__list" role="listbox" aria-label={province ? `${province.name} districts` : 'Provinces'}>
            {!province &&
              provinceList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="locate__result"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setProvinceId(p.id);
                    setDistrictId(p.districts[0].id);
                  }}
                >
                  <span className="grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                      {p.nameNp} · capital {p.hq} · {p.districts.length} districts
                    </span>
                  </span>
                  <span aria-hidden>›</span>
                </button>
              ))}

            {province && !district &&
              province.districts.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="locate__result"
                  role="option"
                  aria-selected={false}
                  onClick={() => setDistrictId(d.id)}
                >
                  <span className="grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>{d.name}</span>
                    <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                      {d.nameNp} · HQ {d.hq} · {d.lg.length} local levels
                    </span>
                  </span>
                  <span aria-hidden>›</span>
                </button>
              ))}

            {province && district &&
              localLevelsOf(district.id).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className="locate__result"
                  role="option"
                  aria-selected={false}
                  onClick={() => chooseLocal(l.id)}
                >
                  <span className="grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>{l.name}</span>
                    <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                      {l.nameNp} · {LOCAL_TYPE_LABEL[l.type]} · {l.wards} wards
                    </span>
                  </span>
                  <span className="badge badge--help">Select</span>
                </button>
              ))}
          </div>

          {district && (
            <Button variant="secondary" size="sm" onClick={() => chooseDistrict(district.id)}>
              Use all of {district.name} ({district.lg.length} local levels)
            </Button>
          )}
        </div>
      )}

      {profile.place && (
        <p className="row row--wrap" style={{ gap: '0.4rem', color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
          <IconPin size={13} /> Current area: {labelFor(profile.place, settings.lang, true).full}
          <Button variant="ghost" size="sm" onClick={() => setScope(null)}>
            Clear
          </Button>
        </p>
      )}
    </div>
  );
}
