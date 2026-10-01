import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Section, Stat, Button } from '@/components/ui';
import {
  IconArrowRight,
  IconBook,
  IconCompass,
  IconGift,
  IconHand,
  IconMegaphone,
  IconPin,
  IconSparkle,
} from '@/components/Icons';
import { GEO_TOTALS } from '@/lib/geo';

export function HomePage() {
  const { counts, allPosts } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'NEIBOURLY';
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap hero__inner">
          <div>
            <span className="hero__eyebrow">
              <IconPin size={14} /> Nepal-first community
            </span>
            <h1>
              Help your neighbours. <em>Ask and offer</em> where you live.
            </h1>
            <p className="hero__lede">
              NEIBOURLY connects you with neighbours in your own local level. Asks and offers stay
              near home, so help stays practical and local.
            </p>
            <div className="hero__cta">
              <Button size="lg" onClick={() => navigate('/ask')}>
                Post an ask <IconArrowRight size={16} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/offer')}>
                Share an offer
              </Button>
            </div>
            <div className="hero__stats">
              <Stat value={counts.ask} label="Active asks" />
              <Stat value={counts.offer} label="Active offers" />
              <Stat value={allPosts.length} label="Posts nearby" />
              <Stat value={GEO_TOTALS.localLevels} label="Local levels" />
            </div>
          </div>

          <aside className="board">
            <div className="board__head">
              <span className="live-dot" />
              Live board
            </div>
            <div className="board__body">
              {allPosts.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/${p.kind === 'post' ? 'community' : p.kind}/${p.id}`} className="board__item">
                  <span className="board__bar" style={{ background: 'var(--pine-500)' }} />
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.title}</p>
                    <p style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
                      {p.kind === 'ask' ? 'Ask' : p.kind === 'offer' ? 'Offer' : 'Community'} • {p.author.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="board__foot">
              <span>Updated as you post</span>
              <Link to="/discover">See all</Link>
            </div>
          </aside>
        </div>
      </section>

      <Section title="What you can do" eyebrow="How it helps" tint>
        <div className="grid grid--3">
          <Link to="/ask" className="tile">
            <div className="tile__icon tile__icon--clay">
              <IconHand size={18} />
            </div>
            <p className="tile__title">Ask for help</p>
            <p className="tile__text">
              Tuition, blood donors, rides, documents or urgent help - post in your local level.
            </p>
          </Link>
          <Link to="/offer" className="tile">
            <div className="tile__icon">
              <IconGift size={18} />
            </div>
            <p className="tile__title">Offer your skills</p>
            <p className="tile__text">
              Share time, skills or space. Free or fair, neighbour to neighbour.
            </p>
          </Link>
          <Link to="/discover" className="tile">
            <div className="tile__icon tile__icon--info">
              <IconCompass size={18} />
            </div>
            <p className="tile__title">Discover near you</p>
            <p className="tile__text">
              Filter by category, distance or your ward. Search in Nepali or English.
            </p>
          </Link>
        </div>
      </Section>

      <Section title="Built for Nepal" text="Grounded in official sources, bilingual and private by design.">
        <div className="grid grid--3">
          <div className="tile">
            <div className="tile__icon">
              <IconBook size={18} />
            </div>
            <p className="tile__title">Official references</p>
            <p className="tile__text">
              Links to nepalpolice.gov.np, nagarikapp.gov.np and lgrms.gov.np. Emergency shortcodes are accurate.
            </p>
          </div>
          <div className="tile">
            <div className="tile__icon tile__icon--clay">
              <IconSparkle size={18} />
            </div>
            <p className="tile__title">BYOK assistant</p>
            <p className="tile__text">
              Add your own free Google AI Studio key, or use the built-in offline knowledge base. No key bundled.
            </p>
          </div>
          <div className="tile">
            <div className="tile__icon tile__icon--info">
              <IconMegaphone size={18} />
            </div>
            <p className="tile__title">No accounts required</p>
            <p className="tile__text">
              Data lives in your browser only. No server database, no tracking.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
