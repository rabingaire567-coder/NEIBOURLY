import { GEO_TOTALS, LG_TYPE_COUNTS, lgList } from '@/lib/geo';
import { Badge } from './ui';
import { IconCheck, IconLayers } from './Icons';

/**
 * The dataset audited against the totals published by the Ministry of Local
 * Government. Showing the check in the product, not only in the README, is
 * deliberate: anyone can confirm the geography is real.
 */
export function GeoTotalsSection() {
  const rows = [
    { label: 'Provinces', np: 'प्रदेश', counted: GEO_TOTALS.provinces, official: 7 },
    { label: 'Districts', np: 'जिल्ला', counted: GEO_TOTALS.districts, official: 77 },
    { label: 'Local levels', np: 'स्थानीय तह', counted: GEO_TOTALS.localLevels, official: 753 },
    { label: 'Metropolitan cities', np: 'महानगरपालिका', counted: lgList.filter((l) => l.type === 'metro').length, official: LG_TYPE_COUNTS.metro },
    { label: 'Sub-metropolitan cities', np: 'उपमहानगरपालिका', counted: lgList.filter((l) => l.type === 'submetro').length, official: LG_TYPE_COUNTS.submetro },
    { label: 'Municipalities', np: 'नगरपालिका', counted: lgList.filter((l) => l.type === 'municipal').length, official: LG_TYPE_COUNTS.municipal },
    { label: 'Rural municipalities', np: 'गाउँपालिका', counted: lgList.filter((l) => l.type === 'rural').length, official: LG_TYPE_COUNTS.rural },
    { label: 'Wards', np: 'वडा', counted: GEO_TOTALS.wards, official: 6743 },
  ];

  const allMatch = rows.every((r) => r.counted === r.official);

  return (
    <section className="card card--pad">
      <p className="row row--between row--wrap" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
        <span className="row" style={{ gap: '0.4rem', fontWeight: 650 }}>
          <IconLayers size={17} /> Geography check
        </span>
        <Badge tone={allMatch ? 'open' : 'urgent'}>
          {allMatch ? (
            <>
              <IconCheck size={12} /> Matches official totals
            </>
          ) : (
            'Mismatch'
          )}
        </Badge>
      </p>

      <div className="table-scroll">
        <table className="data-table">
          <caption className="sr-only">Counted administrative units against published totals</caption>
          <thead>
            <tr>
              <th scope="col">Unit</th>
              <th scope="col">Nepali</th>
              <th scope="col">In this app</th>
              <th scope="col">Official</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>{r.np}</td>
                <td>{r.counted.toLocaleString()}</td>
                <td>{r.official.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: 'var(--ink-500)', fontSize: 'var(--step--1)', marginTop: 'var(--sp-3)' }}>
        Names, ward counts and official websites come from the Ministry of Local Government listing. Coordinates are
        area-weighted centroids of real DDGN boundary polygons, used only to rank distance — never as an address.
      </p>
    </section>
  );
}
