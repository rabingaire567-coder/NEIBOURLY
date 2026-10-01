import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Badge, Button, Notice, Empty } from '@/components/ui';
import { Breadcrumbs } from '@/components/Route';
import { categoryEmoji, fullDate, relativeTime, formatDistance } from '@/lib/format';
import { colorFor } from '@/lib/storage';
import { nearbySort, labelFor, getLocalLevel } from '@/lib/geo';
import { CATEGORY_MAP } from '@/data/categories';
import { SERVICES } from '@/data/services';
import {
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconHeart,
  IconHome,
  IconInfo,
  IconPin,
  IconShare,
  IconShield,
} from '@/components/Icons';

const KIND_PATH = { ask: 'ask', offer: 'offer', post: 'community' } as const;

export function PostDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const {
    findPost,
    settings,
    toggleVote,
    reply,
    toggleSaved,
    isSaved,
    deletePost,
    myPosts,
    notify,
  } = useStore();

  const post = findPost(id);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) document.title = `${post.title} · NEIBOURLY`;
  }, [post]);

  if (!post) {
    return (
      <div className="wrap wrap--narrow">
        <Empty
          title="Post not found"
          children="It may have been deleted from this browser, or the link is wrong."
          action={
            <Link to="/discover">
              <Button>Back to Discover</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const lang = settings.lang;
  const cat = CATEGORY_MAP[post.category];
  const lg = getLocalLevel(post.place.lgId);
  const { same, km } = nearbySort(settings.scope, post.place);
  const isMine = myPosts.some((p) => p.id === post.id);
  const savedKey = `post:${post.id}`;
  const isEmergency = post.kind === 'ask' && post.category === 'emergency';
  const police = SERVICES.find((s) => s.id === 'police')?.national;
  const ambulance = SERVICES.find((s) => s.id === 'ambulance')?.national;

  const share = async () => {
    const url = window.location.href;
    const payload = { title: post.title, text: post.body.slice(0, 200), url };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
      notify('Link ready to share', 'ok');
    } catch {
      /* the visitor dismissed the share sheet */
    }
  };

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) return;
    reply(post.id, text);
    setText('');
  };

  return (
    <div className="wrap wrap--narrow">
      <div style={{ marginBottom: 'var(--sp-5)' }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          <IconChevronLeft size={15} /> Back
        </button>
      </div>

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: KIND_PATH[post.kind], to: `/${KIND_PATH[post.kind]}` },
          { label: post.title.slice(0, 32) + (post.title.length > 32 ? '…' : '') },
        ]}
      />

      {isEmergency && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <Notice tone="danger" title="If this is happening right now" icon={<IconShield size={16} />}>
            Do not wait for an online reply. Dial <strong>{police}</strong> for police or <strong>{ambulance}</strong>{' '}
            for an ambulance. Keep the person still and note when the problem started.
          </Notice>
        </div>
      )}

      <article className="detail" style={{ marginTop: 'var(--sp-5)' }}>
        <header className="detail__hero">
          <div className="row row--wrap" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
            <Badge tone={post.kind === 'ask' ? 'ask' : post.kind === 'offer' ? 'offer' : 'notice'}>
              {post.kind === 'ask' ? 'Ask' : post.kind === 'offer' ? 'Offer' : 'Notice'}
            </Badge>
            <Badge tone="cat">
              {categoryEmoji(post.category)} {lang === 'ne' ? cat.labelNp : cat.label}
            </Badge>
            {post.demo && <Badge tone="neutral">Demo content</Badge>}
            {same && <Badge tone="help">Your local level</Badge>}
            {post.urgent && <Badge tone="urgent">Urgent</Badge>}
          </div>

          <h1 style={{ fontSize: 'var(--step-3)' }}>
            {lang === 'ne' && post.titleNp ? post.titleNp : post.title}
          </h1>

          <div className="row row--wrap" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-4)', color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
            <span className="row" style={{ gap: '0.4rem' }}>
              <span className="post__avatar" style={{ background: colorFor(post.author.name), width: 28, height: 28, fontSize: '0.7rem' }}>
                {post.author.initials}
              </span>
              {post.author.name}
            </span>
            <span className="row" style={{ gap: '0.3rem' }}>
              <IconClock size={13} /> {relativeTime(post.createdAt, lang)} · {fullDate(post.createdAt, lang)}
            </span>
          </div>
        </header>

        <div className="card card--pad">
          <p className="detail__body">{post.body}</p>

          {post.lookingFor && (
            <div className="panel" style={{ marginTop: 'var(--sp-5)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                {post.kind === 'ask' ? 'Looking for' : 'Offering'}
              </p>
              <p style={{ color: 'var(--ink-600)' }}>{post.lookingFor}</p>
            </div>
          )}

          <div className="detail__meta" style={{ marginTop: 'var(--sp-5)' }}>
            <span className="post__meta-item">
              <IconPin size={14} /> {labelFor(post.place, lang, true).full}
              {!same && km !== null && ` · ${formatDistance(km)} away`}
            </span>
            {lg && (
              <span className="post__meta-item">
                <IconHome size={14} /> {lg.type === 'rural' ? 'Rural municipality' : lg.type === 'metro' ? 'Metropolitan city' : lg.type === 'submetro' ? 'Sub-metropolitan city' : 'Municipality'} · {lg.wards} wards
              </span>
            )}
          </div>

          <div className="row row--wrap" style={{ marginTop: 'var(--sp-5)', gap: 'var(--sp-2)' }}>
            <Button
              variant={post.reacted ? 'primary' : 'secondary'}
              onClick={() => toggleVote(post.id)}
              aria-pressed={Boolean(post.reacted)}
            >
              <IconHeart size={15} />
              {post.reacted ? 'Marked helpful' : 'Mark helpful'} ({post.votes})
            </Button>
            <Button variant="secondary" onClick={share}>
              <IconShare size={15} /> {copied ? 'Link copied' : 'Share'}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toggleSaved({ key: savedKey, label: post.title, href: `/post/${post.id}`, createdAt: new Date().toISOString() })
              }
              aria-pressed={isSaved(savedKey)}
            >
              <IconBookmark size={15} /> {isSaved(savedKey) ? 'Saved' : 'Save'}
            </Button>
            {isMine && (
              <Button variant="danger" onClick={() => navigate('/profile')}>
                Manage in profile
              </Button>
            )}
          </div>

          {post.contact && (
            <p className="row" style={{ marginTop: 'var(--sp-4)', gap: '0.4rem', color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
              <IconInfo size={14} /> Contact: {post.contact}
            </p>
          )}
        </div>

        {lg?.site && (
          <div className="card card--pad">
            <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Official local level website</p>
            <p style={{ color: 'var(--ink-600)', marginBottom: 'var(--sp-3)' }}>
              Published by {lg.name} for citizen services, ward contacts and its citizen charter.
            </p>
            <a className="btn btn--secondary btn--sm" href={lg.site} target="_blank" rel="noopener noreferrer">
              Visit {new URL(lg.site).hostname}
            </a>
          </div>
        )}

        <section className="card card--pad">
          <h2 style={{ fontSize: 'var(--step-1)', marginBottom: 'var(--sp-4)' }}>
            {post.replies?.length ? `${post.replies.length} responses` : 'No responses yet'}
          </h2>

          {post.replies && post.replies.length > 0 && (
            <div className="stack" style={{ marginBottom: 'var(--sp-5)' }}>
              {post.replies.map((r) => (
                <div key={r.id} className="panel">
                  <div className="row" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                    <span className="post__avatar" style={{ background: colorFor(r.author.name), width: 28, height: 28, fontSize: '0.7rem' }}>
                      {r.author.initials}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 'var(--step--1)' }}>{r.author.name}</span>
                    {r.author.ward && <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>· ward {r.author.ward}</span>}
                    <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>· {relativeTime(r.createdAt, lang)}</span>
                    {r.demo && <Badge tone="neutral">Demo</Badge>}
                  </div>
                  <p style={{ color: 'var(--ink-700)' }}>{r.body}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submitReply} className="stack">
            <div className="field">
              <label htmlFor="reply" className="field__label">
                {post.kind === 'ask' ? 'Say you can help' : 'Add a response'}
              </label>
              <textarea
                id="reply"
                className="textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Introduce yourself, say where you are roughly, and what you can offer. No phone numbers or ID numbers."
                maxLength={600}
                required
              />
              <div className="row row--between">
                <span className="field__hint">Keep it specific. Never post ID numbers or bank details.</span>
                <span className="char-count">{text.length}/600</span>
              </div>
            </div>
            <div>
              <Button type="submit" disabled={text.trim().length < 3}>
                <IconCheck size={15} /> Post response
              </Button>
            </div>
          </form>
        </section>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => deletePost(post.id)}
          disabled={!isMine}
          title={isMine ? undefined : 'Only posts you created on this device can be deleted'}
        >
          {isMine ? 'Delete this post' : 'Only your own posts can be deleted'}
        </button>
      </article>
    </div>
  );
}
