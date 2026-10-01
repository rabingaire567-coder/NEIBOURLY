import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui';
import { categoryEmoji, relativeTime, formatDistance } from '@/lib/format';
import { colorFor } from '@/lib/storage';
import { nearbySort, labelFor } from '@/lib/geo';
import { CATEGORY_MAP } from '@/data/categories';
import { IconBookmark, IconClock, IconHeart, IconPin, IconUsers } from './Icons';
import type { Post } from '@/types';

const KIND_TONE = { ask: 'ask', offer: 'offer', post: 'notice' } as const;
const KIND_LABEL = { ask: 'Ask', offer: 'Offer', post: 'Notice' } as const;

export function PostCard({ post, compact }: { post: Post; compact?: boolean }) {
  const { settings, toggleVote, toggleSaved, isSaved, myPosts } = useStore();
  const lang = settings.lang;
  const title = lang === 'ne' && post.titleNp ? post.titleNp : post.title;
  const cat = CATEGORY_MAP[post.category];
  const isMine = myPosts.some((p) => p.id === post.id);
  const { same, km } = nearbySort(settings.scope, post.place);
  const savedKey = `post:${post.id}`;

  return (
    <article className={`post${/urgent/i.test(post.title) ? ' post--urgent' : ''}`}>
      <div className="post__avatar" style={{ background: colorFor(post.author.name) }}>
        {post.author.initials || categoryEmoji(post.category)}
      </div>

      <div className="grow">
        <div className="post__top">
          <Link to={`/${post.kind === 'post' ? 'community' : post.kind}/${post.id}`} className="post__author">
            {post.author.name}
          </Link>
          {post.author.ward && <span>· ward {post.author.ward}</span>}
          {post.author.area && <span>· {post.author.area}</span>}
          <span>· {relativeTime(post.createdAt, lang)}</span>
          {post.demo && <Badge tone="neutral">Demo</Badge>}
          {isMine && <Badge tone="help">Yours</Badge>}
        </div>

        <h3 className="post__title">
          <Link to={`/${post.kind === 'post' ? 'community' : post.kind}/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {title}
          </Link>
        </h3>

        {!compact && <p className="post__excerpt">{post.body}</p>}

        <div className="row row--wrap" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
          <Badge tone={KIND_TONE[post.kind]}>{KIND_LABEL[post.kind]}</Badge>
          <Badge tone="cat" title={cat.hint}>
            {categoryEmoji(post.category)} {lang === 'ne' ? cat.labelNp : cat.label}
          </Badge>
          {same && <Badge tone="help">Same local level</Badge>}
        </div>

        <div className="post__meta">
          <span className="post__meta-item" title={labelFor(post.place, lang, true).full}>
            <IconPin size={13} />
            {same ? 'Your area' : labelFor(post.place, lang, true).full}
            {!same && km !== null && ` · ${formatDistance(km)}`}
          </span>
          <span className="post__meta-item">
            <IconUsers size={13} />
            {post.votes} helpful
          </span>
          {post.replies && post.replies.length > 0 && (
            <span className="post__meta-item">
              <IconClock size={13} />
              {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        <div className="row" style={{ marginTop: 'var(--sp-3)', gap: 'var(--sp-2)' }}>
          <button
            type="button"
            className={`btn btn--sm ${post.reacted ? '' : 'btn--secondary'}`}
            onClick={() => toggleVote(post.id)}
            aria-pressed={Boolean(post.reacted)}
          >
            <IconHeart size={14} />
            {post.reacted ? 'Marked helpful' : 'Helpful'}
          </button>
          <Link className="btn btn--secondary btn--sm" to={`/${post.kind === 'post' ? 'community' : post.kind}/${post.id}`}>
            {post.kind === 'ask' ? 'I can help' : 'Open'}
          </Link>
          <button
            type="button"
            className={`icon-btn${isSaved(savedKey) ? ' is-active' : ''}`}
            onClick={() => toggleSaved({ key: savedKey, label: title, href: `/${post.kind === 'post' ? 'community' : post.kind}/${post.id}`, createdAt: new Date().toISOString() })}
            aria-pressed={isSaved(savedKey)}
            aria-label={isSaved(savedKey) ? 'Remove from saved' : 'Save for later'}
          >
            <IconBookmark />
          </button>
        </div>
      </div>
    </article>
  );
}
