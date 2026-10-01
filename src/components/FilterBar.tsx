import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import type { FeedFilters } from '@/lib/store';
import { CATEGORIES } from '@/data/categories';
import { labelFor } from '@/lib/geo';
import { IconClose, IconFilter, IconSearch } from './Icons';
import { Button, Badge } from './ui';
import type { CategoryId } from '@/types';

const KINDS: { value: NonNullable<FeedFilters['kind']>; en: string; ne: string }[] = [
  { value: 'all', en: 'All', ne: 'सबै' },
  { value: 'ask', en: 'Asks', ne: 'मागेका' },
  { value: 'offer', en: 'Offers', ne: 'दिइएका' },
  { value: 'post', en: 'Notices', ne: 'सूचना' },
];

const RADII = [2, 5, 10, 25, 50, 100];

export function FilterBar({
  query,
  onQuery,
  kind,
  onKind,
  categories,
  onCategory,
  radiusKm,
  onRadius,
  scope,
  showRadius,
  resultCount,
  onClear,
}: {
  query: string;
  onQuery: (q: string) => void;
  kind: NonNullable<FeedFilters['kind']>;
  onKind: (k: NonNullable<FeedFilters['kind']>) => void;
  categories: CategoryId[];
  onCategory: (id: CategoryId) => void;
  radiusKm: number;
  onRadius: (km: number) => void;
  scope: { provinceId: number; districtId: number; lgId: number } | null;
  showRadius: boolean;
  resultCount: number;
  onClear: () => void;
}) {
  const { settings } = useStore();
  const lang = settings.lang;

  return (
    <section className="card" aria-label="Filters">
      <div className="card__body stack">
        <div className="row row--wrap" style={{ gap: 'var(--sp-3)' }}>
          <div className="nav__search grow" style={{ maxWidth: 'none', flexBasis: '260px' }}>
            <IconSearch size={15} className="nav__search-icon" />
            <label htmlFor="feed-q" className="sr-only">
              Search
            </label>
            <input
              id="feed-q"
              className="input"
              type="search"
              value={query}
              placeholder="Search titles, text and neighbours"
              onChange={(e) => onQuery(e.target.value)}
            />
          </div>

          <div className="seg" role="group" aria-label="Post type">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                className="seg__btn"
                aria-pressed={kind === k.value}
                onClick={() => onKind(k.value)}
              >
                {lang === 'ne' ? k.ne : k.en}
              </button>
            ))}
          </div>
        </div>

        <div className="row row--wrap" style={{ gap: 'var(--sp-3)' }}>
          <span className="row" style={{ gap: '0.35rem', color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
            <IconFilter size={14} /> Categories
          </span>
          <div className="chip-scroll">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={categories.includes(c.id)}
                onClick={() => onCategory(c.id)}
                title={c.hint}
              >
                {lang === 'ne' ? c.labelNp : c.label}
              </button>
            ))}
          </div>
        </div>

        {showRadius && (
          <div className="row row--wrap" style={{ gap: 'var(--sp-3)' }}>
            <span className="row" style={{ gap: '0.35rem', color: 'var(--ink-500)', fontSize: 'var(--step--1)' }}>
              Within
            </span>
            <div className="seg" role="group" aria-label="Distance">
              {RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="seg__btn"
                  aria-pressed={radiusKm === r}
                  onClick={() => onRadius(r)}
                >
                  {r} km
                </button>
              ))}
            </div>
            <span className="row" style={{ gap: '0.35rem', fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
              of {scope ? labelFor(scope, lang).short : 'your area'}
            </span>
          </div>
        )}

        <div className="row row--between row--wrap">
          <p className="row" style={{ gap: 'var(--sp-2)' }}>
            <Badge tone="help">{resultCount} results</Badge>
            {categories.length > 0 && <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>{categories.length} categories</span>}
          </p>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <IconClose size={14} /> Clear
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ScopeHint() {
  const { settings } = useStore();
  if (settings.scope) return null;
  return (
    <div className="notice notice--info" style={{ marginBottom: 'var(--sp-5)' }}>
      <div className="stack stack--sm">
        <strong>Set your area to rank by distance</strong>
        <span>
          NEIBOURLY uses your local level to put the closest posts first.{' '}
          <Link to="/settings">Choose your area in Settings</Link>.
        </span>
      </div>
    </div>
  );
}
