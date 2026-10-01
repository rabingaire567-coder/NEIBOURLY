import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import type { FeedFilters } from '@/lib/store';
import { Empty, Badge, Button } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { PostCard } from '@/components/PostCard';
import { FilterBar } from '@/components/FilterBar';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';

const PAGE_SIZE = 6;

export function DiscoverPage() {
  const { t, settings, filterPosts, counts, allPosts, setScope, notify } = useStore();
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [categories, setCategories] = useState<CategoryId[]>(() => {
    const c = params.get('cat');
    return c && c !== 'all' ? [c as CategoryId] : [];
  });
  const [radiusKm, setRadiusKm] = useState(settings.radiusKm);

  const query = params.get('q') ?? '';
  const kind = (params.get('kind') as FeedFilters['kind']) ?? 'all';

  useEffect(() => {
    document.title = query ? `${query} · Discover · NEIBOURLY` : 'Discover · NEIBOURLY';
  }, [query]);

  const results = useMemo(
    () => filterPosts({ query, kind, categories: categories.length ? categories : undefined, radiusKm }),
    [filterPosts, query, kind, categories, radiusKm],
  );

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  };

  const toggleCategory = (id: CategoryId) => {
    setVisible(PAGE_SIZE);
    setCategories((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      setParam('cat', next.length === 1 ? next[0] : null);
      return next;
    });
  };

  const shown = results.slice(0, visible);
  const hasFilters = Boolean(query) || kind !== 'all' || categories.length > 0;

  const clearAll = () => {
    setCategories([]);
    setParams(new URLSearchParams(), { replace: true });
    setVisible(PAGE_SIZE);
    notify('Filters cleared', 'ok');
  };

  return (
    <div className="wrap">
      <PageHead
        eyebrow="Find it nearby"
        title="Discover"
        lede={
          settings.scope
            ? `Ranked by how close each post is to ${'your selected area'}, then by recency.`
            : 'Set your area in Settings to rank results by distance. Without an area, results are ordered by recency.'
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setScope(null)} disabled={!settings.scope}>
              Clear area
            </Button>
            <Link to="/new">
              <Button>Post something</Button>
            </Link>
          </>
        }
      />

      <FilterBar
        query={query}
        onQuery={(q) => setParam('q', q || null)}
        kind={kind}
        onKind={(k) => setParam('kind', k)}
        categories={categories}
        onCategory={toggleCategory}
        radiusKm={radiusKm}
        onRadius={(r) => {
          setRadiusKm(r);
          setVisible(PAGE_SIZE);
        }}
        scope={settings.scope}
        showRadius={Boolean(settings.scope)}
        resultCount={results.length}
        onClear={clearAll}
      />

      <div className="chip-row" style={{ marginBlock: 'var(--sp-5)' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={categories.includes(c.id)}
            onClick={() => toggleCategory(c.id)}
          >
            {settings.lang === 'ne' ? c.labelNp : c.label}
          </button>
        ))}
      </div>

      <div className="row row--between" style={{ marginBottom: 'var(--sp-4)' }}>
        <p className="row" style={{ gap: 'var(--sp-2)', color: 'var(--ink-600)' }}>
          <Badge tone="help">{results.length} results</Badge>
          {query && <span>for “{query}”</span>}
        </p>
        {hasFilters && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <Empty
          title={hasFilters ? 'No results match your filters' : 'Nothing posted yet'}
          children={
            hasFilters
              ? 'Try a different word, widen the distance, or clear the filters.'
              : 'Be the first to post in your area.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearAll}>
                Clear filters
              </Button>
            ) : (
              <Link to="/new">
                <Button>Post something</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="stack">
            {shown.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {visible < results.length && (
            <div className="row" style={{ justifyContent: 'center', marginTop: 'var(--sp-6)' }}>
              <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more ({results.length - visible} left)
              </Button>
            </div>
          )}
        </>
      )}

      <aside className="panel" style={{ marginTop: 'var(--sp-8)' }}>
        <p className="row row--between">
          <strong>In your area right now</strong>
          <span className="badge badge--ask">{counts.ask} asks</span>
        </p>
        <p style={{ color: 'var(--ink-600)', marginTop: 'var(--sp-2)' }}>
          {allPosts.length} posts are stored on this device, including the {t('post.demo').toLowerCase()} seed
          content that ships with the app.
        </p>
      </aside>
    </div>
  );
}
