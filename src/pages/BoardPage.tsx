import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { PageHead } from '@/components/Route';
import { Empty, Badge, Button, Notice } from '@/components/ui';
import { FilterBar, ScopeHint } from '@/components/FilterBar';
import { PostCard } from '@/components/PostCard';
import { SERVICES } from '@/data/services';
import { formatDistance } from '@/lib/format';
import { nearbySort, labelFor } from '@/lib/geo';
import type { CategoryId, PostKind } from '@/types';

const PAGE_SIZE = 6;

const COPY: Record<PostKind, { eyebrow: string; title: string; lede: string; cta: string; ctaTo: string }> = {
  ask: {
    eyebrow: 'Needs help',
    title: 'Ask',
    lede: 'Things your neighbours can help with. The closer the post, the more likely someone can actually help.',
    cta: 'Post an ask',
    ctaTo: '/new?kind=ask',
  },
  offer: {
    eyebrow: 'Can help',
    title: 'Offer',
    lede: 'Skills, time, goods and free help. Offer what you can genuinely do, and say when you are free.',
    cta: 'Post an offer',
    ctaTo: '/new?kind=offer',
  },
  post: {
    eyebrow: 'Local updates',
    title: 'Community',
    lede: 'Notices and updates for your local level.',
    cta: 'Post a notice',
    ctaTo: '/new?kind=post',
  },
};

export function BoardPage({ kind }: { kind: PostKind }) {
  const { settings, filterPosts, counts, setScope } = useStore();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryId[]>([]);
  const [radiusKm, setRadiusKm] = useState(settings.radiusKm);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const copy = COPY[kind];
  const lang = settings.lang;

  useEffect(() => {
    document.title = `${copy.title} · NEIBOURLY`;
  }, [copy.title]);

  const posts = useMemo(
    () => filterPosts({ kind, query, categories: categories.length ? categories : undefined, radiusKm }),
    [filterPosts, kind, query, categories, radiusKm],
  );

  const emergencies = useMemo(() => posts.filter((p) => /urgent/i.test(p.title)), [posts]);
  const ordered = useMemo(
    () => (kind === 'ask' ? [...emergencies, ...posts.filter((p) => !emergencies.includes(p))] : posts),
    [kind, emergencies, posts],
  );

  const police = SERVICES.find((s) => s.id === 'police')?.national;
  const ambulance = SERVICES.find((s) => s.id === 'ambulance')?.national;

  const reset = () => {
    setQuery('');
    setCategories([]);
    setVisible(PAGE_SIZE);
  };

  const toggleCategory = (id: CategoryId) => {
    setVisible(PAGE_SIZE);
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const freeOffers = posts.filter((p) => /free|no charge/i.test(p.body)).length;
  const nearest = settings.scope && posts.length ? nearbySort(settings.scope, posts[0].place).km : null;

  return (
    <div className="wrap">
      <PageHead
        eyebrow={copy.eyebrow}
        title={copy.title}
        lede={copy.lede}
        actions={
          <>
            <Link to={copy.ctaTo}>
              <Button>{copy.cta}</Button>
            </Link>
            {settings.scope && (
              <Button variant="secondary" onClick={() => setScope(null)}>
                Clear area
              </Button>
            )}
          </>
        }
      />

      {!settings.scope && <ScopeHint />}

      {kind === 'ask' && emergencies.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <Notice tone="danger" title="Urgent in your area">
            {emergencies.length} urgent {emergencies.length === 1 ? 'post needs' : 'posts need'} help right now. In a
            real emergency dial {police} for police or {ambulance} for an ambulance rather than waiting for a
            reply here.
          </Notice>
        </div>
      )}

      <FilterBar
        query={query}
        onQuery={(q) => {
          setQuery(q);
          setVisible(PAGE_SIZE);
        }}
        kind={kind}
        onKind={() => undefined}
        categories={categories}
        onCategory={toggleCategory}
        radiusKm={radiusKm}
        onRadius={setRadiusKm}
        scope={settings.scope}
        showRadius={Boolean(settings.scope)}
        resultCount={posts.length}
        onClear={reset}
      />

      <div className="grid grid--4" style={{ marginBlock: 'var(--sp-5)' }}>
        <div className="stat">
          <span className="stat__value">{counts[kind]}</span>
          <span className="stat__label">{copy.title} here</span>
        </div>
        {kind === 'ask' && (
          <>
            <StatBox value={emergencies.length} label="Urgent" />
            <StatBox value={new Set(posts.map((p) => p.place.lgId)).size} label="Local levels" />
            <StatBox value={formatDistance(nearest) || '—'} label="Nearest" />
          </>
        )}
        {kind === 'offer' && (
          <>
            <StatBox value={freeOffers} label="Free offers" />
            <StatBox value={new Set(posts.map((p) => p.category)).size} label="Categories" />
            <StatBox value={posts.reduce((n, p) => n + p.votes, 0)} label="Helpful votes" />
          </>
        )}
        {kind === 'post' && (
          <>
            <StatBox value={new Set(posts.map((p) => p.category)).size} label="Topics" />
            <StatBox value={posts.filter((p) => p.replies?.length).length} label="With discussion" />
            <StatBox value={posts.filter((p) => p.category === 'civic').length} label="Civic notices" />
          </>
        )}
      </div>

      {posts.length === 0 ? (
        <Empty
          title={`No ${copy.title.toLowerCase()} yet`}
          children={
            settings.scope
              ? `Nothing posted in ${labelFor(settings.scope, lang).full} yet. Widen the distance or post the first one.`
              : 'Set your area so results are ranked by distance, then post the first one.'
          }
          action={
            <Link to={copy.ctaTo}>
              <Button>{copy.cta}</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="stack">
            {ordered.slice(0, visible).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {visible < ordered.length && (
            <div className="row" style={{ justifyContent: 'center', marginTop: 'var(--sp-6)' }}>
              <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more ({ordered.length - visible} left)
              </Button>
            </div>
          )}
        </>
      )}

      <aside className="panel" style={{ marginTop: 'var(--sp-8)' }}>
        <p className="row row--between row--wrap" style={{ gap: 'var(--sp-2)' }}>
          <strong>Tip for a good post</strong>
          <Badge tone="cat">Local, specific, honest</Badge>
        </p>
        <ul style={{ paddingLeft: '1.1rem', marginTop: 'var(--sp-3)', display: 'grid', gap: 'var(--sp-2)', color: 'var(--ink-600)' }}>
          <li>Say which ward or nearest landmark applies, not a house number.</li>
          <li>Include when you are free, or when you need the help.</li>
          <li>Never post a national ID number, passport number or bank detail.</li>
          <li>Keep phone numbers out of the title; use in-app responses instead.</li>
        </ul>
      </aside>
    </div>
  );
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
