import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Empty, Badge, Button } from '@/components/ui';
import { IconHeart, IconMegaphone, IconUsers } from '@/components/Icons';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types';
import { relativeTime, categoryEmoji } from '@/lib/format';
import { colorFor } from '@/lib/storage';
import { labelFor } from '@/lib/geo';

export function CommunityPage() {
  const { settings } = useStore();
  const lang = settings.lang;
  const feed = useStore();

  const [category, setCategory] = useState<CategoryId | 'all'>('all');

  const posts = useMemo(
    () => feed.filterPosts({ kind: 'post', categories: category === 'all' ? undefined : [category] }),
    [feed, category],
  );

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="grow">
          <p className="page-head__eyebrow">Community notices</p>
          <h1>Community</h1>
          <p className="page-head__lede">
            Updates, notices and information your neighbours should know. Verified contacts and
            official sources for peace of mind.
          </p>
        </div>
      </header>

      <div className="chip-scroll" style={{ marginBottom: 'var(--sp-5)' }}>
        <button
          type="button"
          className="chip"
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {CATEGORIES.filter((c) => ['civic', 'events', 'volunteer', 'education', 'emergency'].includes(c.id)).map(
          (c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {lang === 'ne' ? c.labelNp : c.label}
            </button>
          ),
        )}
      </div>

      <div className="grid grid--4" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="stat">
          <span className="stat__value">{posts.length}</span>
          <span className="stat__label">Notices here</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            <IconMegaphone size={16} />
          </span>
          <span className="stat__label">Community updates</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            <IconUsers size={16} />
          </span>
          <span className="stat__label">Local voices</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            <IconHeart size={16} />
          </span>
          <span className="stat__label">Good intent</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <Empty
          title="No community posts yet"
          children="Be the first to share a local notice with your neighbours."
          action={
            <Link to="/new?kind=post">
              <Button>Post a notice</Button>
            </Link>
          }
        />
      ) : (
        <div className="stack">
          {posts.map((p) => (
            <article key={p.id} className="post">
              <div className="post__avatar" style={{ background: colorFor(p.author.name) }}>
                {categoryEmoji(p.category)}
              </div>
              <div className="grow">
                <div className="post__top">
                  <span className="post__author">{p.author.name}</span>
                  <span>·</span>
                  <span>{relativeTime(p.createdAt)}</span>
                  {p.demo && <Badge tone="neutral">Demo</Badge>}
                </div>
                <h3 className="post__title" style={{ fontSize: 'var(--step-0)' }}>
                  {lang === 'ne' && p.titleNp ? p.titleNp : p.title}
                </h3>
                <p className="post__excerpt">{p.body}</p>
                <div className="post__meta">
                  <span className="post__meta-item">
                    <IconUsers size={13} /> {labelFor(p.place, lang, true).full}
                  </span>
                  <span className="post__meta-item">
                    <IconHeart size={13} /> {p.votes} helpful
                  </span>
                </div>
                <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
                  <Link
                    to={`/community/${p.id}`}
                    className="btn btn--secondary btn--sm"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
