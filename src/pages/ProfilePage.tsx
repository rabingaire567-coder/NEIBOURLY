import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Button, Badge, Empty, Notice } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { relativeTime } from '@/lib/format';
import { labelFor } from '@/lib/geo';
import { GeoTotalsSection } from '@/components/GeoTotals';
import { IconBookmark, IconCheck, IconHeart, IconShield, IconTrash } from '@/components/Icons';

export function ProfilePage() {
  const { profile, settings, dispatch, myPosts, saved, deletePost, toggleVote, notify } = useStore();

  useEffect(() => {
    document.title = 'Profile · NEIBOURLY';
  }, []);

  const initials = (profile.name.trim() || 'N')[0].toUpperCase();

  return (
    <div className="wrap wrap--narrow">
      <PageHead
        eyebrow="Local, not global"
        title={profile.name.trim() || 'Your profile'}
        lede="This is your board presence. It is stored on this device, so nothing is shared until you share a link."
        actions={
          <>
            <Link to="/new">
              <Button>Post something</Button>
            </Link>
            <Link to="/settings">
              <Button variant="secondary">Settings</Button>
            </Link>
          </>
        }
      />

      <section className="card card--pad stack" style={{ marginBottom: 'var(--sp-8)' }}>
        <div className="row" style={{ gap: 'var(--sp-4)' }}>
          <div
            className="post__avatar"
            style={{ width: 56, height: 56, fontSize: 'var(--step-1)', background: 'var(--pine-600)' }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="grow">
            <p style={{ fontWeight: 650, fontSize: 'var(--step-1)' }}>{profile.name.trim() || 'Not set'}</p>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
              {profile.area.trim() || 'No area set'} · stored in this browser
            </p>
          </div>
          {profile.place && (
            <Badge tone="help">
              {profile.place.ward ? `Ward ${profile.place.ward}` : 'Local level set'}
            </Badge>
          )}
        </div>

        {profile.place ? (
          <p className="row row--wrap" style={{ gap: 'var(--sp-2)' }}>
            <span style={{ color: 'var(--ink-600)' }}>Your area:</span>
            <Badge tone="help">{labelFor(profile.place, settings.lang, true).full}</Badge>
            <Link to="/settings" className="btn btn--ghost btn--sm">
              Change
            </Link>
          </p>
        ) : (
          <Notice tone="warn" title="Set your area to get ranked by distance">
            <Link to="/settings">Pick your local level in Settings</Link>.
          </Notice>
        )}

        {profile.interests.length > 0 && (
          <div className="chip-row">
            {profile.interests.map((i) => (
              <span key={i} className="chip chip--static">
                {i}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="stack" style={{ marginBottom: 'var(--sp-10)' }}>
        <div className="row row--between">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Your posts</h2>
          <Badge tone="cat">{myPosts.length}</Badge>
        </div>
        {myPosts.length === 0 ? (
          <Empty title="You have not posted yet" children="Your first ask or offer takes under a minute." action={<Link to="/new"><Button>Post something</Button></Link>} />
        ) : (
          <div className="stack">
            {myPosts.map((p) => (
              <article key={p.id} className="post">
                <div className="post__avatar" style={{ background: 'var(--pine-600)' }}>{initials}</div>
                <div className="grow">
                  <div className="post__top">
                    <span className="post__author">{p.kind === 'ask' ? 'Ask' : p.kind === 'offer' ? 'Offer' : 'Notice'}</span>
                    <span>· {relativeTime(p.createdAt)}</span>
                    <Badge tone={p.kind === 'ask' ? 'ask' : p.kind === 'offer' ? 'offer' : 'notice'}>{p.category}</Badge>
                  </div>
                  <h3 className="post__title" style={{ fontSize: 'var(--step-0)' }}>
                    <Link to={`/post/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.title}</Link>
                  </h3>
                  <div className="row" style={{ marginTop: 'var(--sp-3)', gap: 'var(--sp-2)' }}>
                    <Link className="btn btn--secondary btn--sm" to={`/post/${p.id}`}>Open</Link>
                    <Button variant="ghost" size="sm" onClick={() => toggleVote(p.id)}>
                      <IconHeart size={14} /> {p.votes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { deletePost(p.id); notify('Removed', 'ok'); }}>
                      <IconTrash size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="stack" style={{ marginBottom: 'var(--sp-10)' }}>
        <div className="row row--between">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Saved</h2>
          <Badge tone="cat">{saved.length}</Badge>
        </div>
        {saved.length === 0 ? (
          <Empty title="Nothing saved" children="Save a post from Discover to find it again later." />
        ) : (
          <div className="stack">
            {saved.map((s) => (
              <div key={s.key} className="row row--between card card--pad" style={{ gap: 'var(--sp-3)' }}>
                <div className="grow">
                  <Link to={s.href} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>{s.label}</Link>
                  <p style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>Saved {relativeTime(s.createdAt)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'saved/remove', key: s.key })}>
                  <IconBookmark size={14} /> Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack" style={{ marginBottom: 'var(--sp-10)' }}>
        <h2 style={{ fontSize: 'var(--step-2)' }}>Keeping it safe</h2>
        <div className="grid grid--2">
          <div className="card card--pad">
            <p className="row" style={{ gap: '0.4rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
              <IconShield size={16} /> Never share these
            </p>
            <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 'var(--sp-1)', color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
              <li>National ID or citizenship number</li>
              <li>Passport number</li>
              <li>Bank or account details</li>
              <li>Your full home address</li>
            </ul>
          </div>
          <div className="card card--pad">
            <p className="row" style={{ gap: '0.4rem', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
              <IconCheck size={16} /> Safe habits
            </p>
            <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 'var(--sp-1)', color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>
              <li>Use a ward or landmark instead of a house number</li>
              <li>Meet in public, ideally with company</li>
              <li>Keep phone numbers out of titles</li>
              <li>Use the Red Cross blood bank as well for blood</li>
            </ul>
          </div>
        </div>
      </section>

      <GeoTotalsSection />
    </div>
  );
}

/** Static project page, kept beside the profile because it shares the framing. */
export function AboutPage() {
  useEffect(() => {
    document.title = 'About · NEIBOURLY';
  }, []);
  return (
    <div className="wrap wrap--narrow">
      <PageHead eyebrow="The project" title="About NEIBOURLY" lede="A Nepal-first community board for reciprocal ask and offer, built to be useful with no connection and no account." />
      <div className="prose">
        <p>
          NEIBOURLY exists because practical help in Nepal is real and plentiful, but it is fragmented. A tutor
          three streets away, a blood donor on the same bus route, a mason looking for daily-wage work this week -
          all of it exists, but most of it lives in private messaging groups that only reach one circle.
        </p>
        <h2>What it does</h2>
        <ul>
          <li>Ask for something your neighbours can help with.</li>
          <li>Offer skills, time, goods or free help.</li>
          <li>Discover both, ranked by how close they are to you.</li>
          <li>Reference official services and the real local government for your ward.</li>
        </ul>
        <h2>How it is built</h2>
        <ul>
          <li>React, TypeScript and Vite, deployed as a static site.</li>
          <li>All 7 provinces, 77 districts, 753 local levels and 6,743 wards, from official listings.</li>
          <li>Coordinates from real boundary polygons, used only for distance ranking.</li>
          <li>A bilingual interface with Nepali content kept exactly as written.</li>
          <li>An assistant that works offline and uses your own Gemini key only when you give it one.</li>
        </ul>
        <h2>What it is not</h2>
        <p>
          NEIBOURLY is not a government body, not a bank, not an ambulance service and not a legal adviser. It is a
          community project. Where it points you to an office, that office is the authority.
        </p>
      </div>
      <Notice tone="info" style={{ marginTop: 'var(--sp-6)' }}>
        <Link to="/explore">Explore the Nepal data behind the boards →</Link>
      </Notice>
    </div>
  );
}
