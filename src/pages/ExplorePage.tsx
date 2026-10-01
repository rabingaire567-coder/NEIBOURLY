import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Button, Badge } from '@/components/ui';
import { PageHead, Breadcrumbs } from '@/components/Route';
import {
  GEO_TOTALS,
  LOCAL_TYPE_LABEL,
  LG_TYPE_COUNTS,
  districtList,
  getDistrict,
  getLocalLevel,
  getProvince,
  lgList,
  provinceList,
  searchGeo,
  labelFor,
} from '@/lib/geo';
import { IconChevronLeft, IconLayers, IconPinFilled, IconSearch } from '@/components/Icons';

const TYPE_ROWS = [
  { type: 'metro' as const, label: 'Metropolitan cities', np: 'महानगरपालिका', expected: LG_TYPE_COUNTS.metro },
  { type: 'submetro' as const, label: 'Sub-metropolitan cities', np: 'उपमहानगरपालिका', expected: LG_TYPE_COUNTS.submetro },
  { type: 'municipal' as const, label: 'Municipalities', np: 'नगरपालिका', expected: LG_TYPE_COUNTS.municipal },
  { type: 'rural' as const, label: 'Rural municipalities', np: 'गाउँपालिका', expected: LG_TYPE_COUNTS.rural },
];

/** Data browser for all 837 units, with the counts shown against the official totals. */
export function ExplorePage() {
  const { settings, setScope, notify } = useStore();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const lang = settings.lang;

  useEffect(() => {
    document.title = 'Explore Nepal · NEIBOURLY';
  }, []);

  const matches = useMemo(() => (query.trim() ? searchGeo(query, 12) : []), [query]);

  const province = provinceId ? getProvince(provinceId) : null;
  const district = districtId ? getDistrict(districtId) : null;

  const select = (kind: 'province' | 'district' | 'local', id: number) => {
    setScope(
      kind === 'local'
        ? (() => {
            const l = getLocalLevel(id);
            return l ? { provinceId: l.province.id, districtId: l.district.id, lgId: l.id } : null;
          })()
        : kind === 'district'
          ? (() => {
              const d = getDistrict(id);
              return d ? { provinceId: d.provinceId, districtId: d.id, lgId: d.lg[0].id } : null;
            })()
          : (() => {
              const p = getProvince(id);
              return p ? { provinceId: p.id, districtId: p.districts[0].id, lgId: p.districts[0].lg[0].id } : null;
            })(),
    );
    if (kind !== 'province') notify(`Area set to ${labelFor(
      kind === 'local'
        ? (() => {
            const l = getLocalLevel(id);
            return l ? { provinceId: l.province.id, districtId: l.district.id, lgId: l.id } : null;
          })()
        : null,
      lang,
    ).short}`, 'ok');
  };

  const largest = useMemo(() => [...lgList].sort((a, b) => b.area - a.area).slice(0, 8), []);
  const mostWards = useMemo(() => [...lgList].sort((a, b) => b.wards - a.wards).slice(0, 8), []);

  return (
    <div className="wrap">
      <PageHead
        eyebrow="7 provinces · 77 districts · 753 local levels"
        title="Explore Nepal"
        lede="Every unit in the country, with its ward count, area and official website. This is the same data the Ask, Offer and Discover boards use to place a post."
        actions={
          <Link to="/settings">
            <Button variant="secondary">Set my area</Button>
          </Link>
        }
      />

      <div className="grid grid--4" style={{ marginBottom: 'var(--sp-8)' }}>
        {[
          { v: GEO_TOTALS.provinces, l: 'Provinces' },
          { v: GEO_TOTALS.districts, l: 'Districts' },
          { v: GEO_TOTALS.localLevels, l: 'Local levels' },
          { v: GEO_TOTALS.wards.toLocaleString('en-IN'), l: 'Wards' },
        ].map((s) => (
          <div key={s.l} className="stat">
            <span className="stat__value">{s.v}</span>
            <span className="stat__label">{s.l}</span>
          </div>
        ))}
      </div>

      <section className="card card--pad" style={{ marginBottom: 'var(--sp-8)' }}>
        <div className="stack">
          <div className="field">
            <label htmlFor="explore-q" className="field__label">
              Search any of the {provinceList.length * 1 + districtList.length + lgList.length} named units
            </label>
            <div className="nav__search" style={{ maxWidth: 'none' }}>
              <IconSearch size={15} className="nav__search-icon" />
              <input
                id="explore-q"
                className="input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rupandehi, रुपन्देही, Illam, or Ilambu"
              />
            </div>
          </div>

          {query.trim() ? (
            <div className="locate__list">
              {matches.length === 0 && <p className="field__hint">Nothing matches “{query}”.</p>}
              {matches.map((m) => (
                <button key={`${m.kind}-${m.id}-${m.label}`} type="button" className="locate__result" onClick={() => select(m.kind, m.id)}>
                  <span className="grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>{m.label}</span>
                    <span className="locate__kind">{m.kind}</span>
                    {m.sub && (
                      <span style={{ display: 'block', color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>{m.sub}</span>
                    )}
                  </span>
                  <span className="badge badge--help">Set area</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <Breadcrumbs
                items={[
                  { label: 'Nepal', to: undefined },
                  ...(province ? [{ label: province.name, to: provinceId ? '/explore' : undefined }] : []),
                  ...(district ? [{ label: district.name }] : []),
                ]}
              />
              <div className="row row--wrap" style={{ gap: 'var(--sp-2)' }}>
                {!provinceId && (
                  <Button variant="secondary" size="sm" onClick={() => setProvinceId(0)}>
                    Browse all provinces
                  </Button>
                )}
                {provinceId && !districtId && (
                  <Button variant="secondary" size="sm" onClick={() => setDistrictId(0)}>
                    Browse districts of {province?.name}
                  </Button>
                )}
                {districtId && (
                  <Button variant="secondary" size="sm" onClick={() => setDistrictId(0)}>
                    Local levels of {district?.name}
                  </Button>
                )}
                {(provinceId !== null || districtId !== null) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProvinceId(null);
                      setDistrictId(null);
                    }}
                  >
                    <IconChevronLeft size={14} /> Reset
                  </Button>
                )}
              </div>
              <div className="locate__list">
                {!provinceId &&
                  provinceList.map((p) => (
                    <button key={p.id} type="button" className="locate__result" onClick={() => select('province', p.id)}>
                      <span className="grow">
                        <span style={{ display: 'block', fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                          {p.nameNp} · capital {p.hq} · {p.districts.length} districts · {p.area.toLocaleString()} km²
                        </span>
                      </span>
                      <span className="badge badge--help">Set area</span>
                    </button>
                  ))}
                {provinceId && !districtId &&
                  province?.districts.map((d) => (
                    <button key={d.id} type="button" className="locate__result" onClick={() => select('district', d.id)}>
                      <span className="grow">
                        <span style={{ display: 'block', fontWeight: 600 }}>{d.name}</span>
                        <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                          {d.nameNp} · HQ {d.hq} · {d.lg.length} local levels
                        </span>
                      </span>
                      <span className="badge badge--help">Set area</span>
                    </button>
                  ))}
                {districtId &&
                  district?.lg.map((l) => (
                    <button key={l.id} type="button" className="locate__result" onClick={() => select('local', l.id)}>
                      <span className="grow">
                        <span style={{ display: 'block', fontWeight: 600 }}>{l.name}</span>
                        <span style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
                          {l.nameNp} · {LOCAL_TYPE_LABEL[l.type]} · {l.wards} wards · {l.area} km²
                        </span>
                      </span>
                      <a
                        className="btn btn--secondary btn--sm"
                        href={l.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Official site
                      </a>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="split">
        <div className="stack">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Local levels by type</h2>
          <p style={{ color: 'var(--ink-600)' }}>
            The Ministry of Local Government recognises four kinds of local level. Each figure below is counted from
            the dataset itself and checked against the published total.
          </p>
          <div className="table-scroll">
            <table className="data-table">
              <caption className="sr-only">Local levels by type</caption>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Nepali</th>
                  <th scope="col">Counted</th>
                  <th scope="col">Official</th>
                  <th scope="col">Check</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_ROWS.map((row) => {
                  const counted = lgList.filter((l) => l.type === row.type).length;
                  const ok = counted === row.expected;
                  return (
                    <tr key={row.type}>
                      <td>{row.label}</td>
                      <td>{row.np}</td>
                      <td>{counted}</td>
                      <td>{row.expected}</td>
                      <td>
                        <Badge tone={ok ? 'open' : 'urgent'}>{ok ? 'Matches' : 'Mismatch'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: 'var(--step-2)', marginTop: 'var(--sp-6)' }}>Largest local levels by area</h2>
          <div className="bar-list">
            {largest.map((l) => (
              <div key={l.id} className="bar-row">
                <button type="button" className="btn btn--ghost btn--sm" style={{ justifyContent: 'flex-start' }} onClick={() => select('local', l.id)}>
                  {l.name}
                </button>
                <div className="bar-row__track">
                  <div className="bar-row__fill" style={{ width: `${(l.area / largest[0].area) * 100}%` }} />
                </div>
                <span className="bar-row__value">{l.area} km²</span>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 'var(--step-2)', marginTop: 'var(--sp-6)' }}>Most wards</h2>
          <div className="bar-list">
            {mostWards.map((l) => (
              <div key={l.id} className="bar-row">
                <button type="button" className="btn btn--ghost btn--sm" style={{ justifyContent: 'flex-start' }} onClick={() => select('local', l.id)}>
                  {l.name}
                </button>
                <div className="bar-row__track">
                  <div className="bar-row__fill" style={{ width: `${(l.wards / mostWards[0].wards) * 100}%` }} />
                </div>
                <span className="bar-row__value">{l.wards}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="sticky-side">
          <div className="card card--pad">
            <p className="row" style={{ gap: '0.4rem', fontWeight: 600 }}>
              <IconLayers size={16} /> Data and provenance
            </p>
            <p style={{ color: 'var(--ink-600)', marginTop: 'var(--sp-2)' }}>
              Names, ward counts and official websites come from the Ministry of Local Government listing mirrored by
              the <code>data-de-nepal</code> package. Coordinates are area-weighted centroids of real DDGN boundary
              polygons from <code>nepal-geojson</code>.
            </p>
            <p style={{ color: 'var(--ink-600)', marginTop: 'var(--sp-2)' }}>
              A centroid is a representative point for ranking distance only. It is never an address and is never
              shown as one.
            </p>
            <p className="row row--wrap" style={{ gap: '0.4rem', marginTop: 'var(--sp-3)' }}>
              <Badge tone="help">{GEO_TOTALS.withCentroid} of {GEO_TOTALS.localLevels} have centroids</Badge>
            </p>
          </div>

          <div className="card card--pad">
            <p style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Representative point</p>
            {settings.scope ? (
              <div className="map-placeholder" style={{ aspectRatio: '4 / 3' }}>
                <span className="compass">N</span>
                <span className="map-placeholder__pin" style={{ left: '50%', top: '55%' }}>
                  <IconPinFilled />
                </span>
                <p style={{ maxWidth: '28ch', color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
                  {labelFor(settings.scope, lang, true).full}
                </p>
              </div>
            ) : (
              <div className="map-placeholder" style={{ aspectRatio: '4 / 3' }}>
                <p style={{ color: 'var(--ink-500)' }}>
                  Set your area to see its approximate centre on the grid.
                </p>
              </div>
            )}
            <p style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)', marginTop: 'var(--sp-3)' }}>
              Deliberately not a street map. NEIBOURLY ranks by distance between local level centres, which is enough
              to say "closest" without pretending to be a navigation tool.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
