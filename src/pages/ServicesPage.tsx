import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Badge, Notice } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { SERVICES, OFFICIAL_LINKS, SERVICE_TIPS } from '@/data/services';
import { IconExternal, IconPhone, IconShield } from '@/components/Icons';

const GROUPS = ['Emergency', 'Documents', 'Civic'] as const;

export function ServicesPage() {
  const { settings } = useStore();
  const [open, setOpen] = useState<string>('Emergency');
  const lang = settings.lang;

  useEffect(() => {
    document.title = 'Public services · NEIBOURLY';
  }, []);

  const grouped = useMemo(
    () => GROUPS.map((g) => ({ group: g, items: SERVICES.filter((s) => s.category === g) })).filter((g) => g.items.length),
    [],
  );

  return (
    <div className="wrap">
      <PageHead
        eyebrow="Reference, not advice"
        title="Public services"
        lede="Nationwide shortcodes and official portals, with the source next to every entry. Confirm anything that involves a fee or a procedure at the ward office."
      />

      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <Notice tone="warn" title="In an emergency, call first">
          Do not read this page while something is happening. Police {SERVICES.find((s) => s.id === 'police')?.national},
          fire {SERVICES.find((s) => s.id === 'fire')?.national}, ambulance{' '}
          {SERVICES.find((s) => s.id === 'ambulance')?.national}. These are free nationwide.
        </Notice>
      </div>

      <div className="grid grid--4" style={{ marginBottom: 'var(--sp-8)' }}>
        {SERVICES.filter((s) => s.national).map((s) => (
          <a
            key={s.id}
            className="tile"
            href={`tel:${s.national}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label={`Call ${s.name} on ${s.national}`}
          >
            <div className={`tile__icon${s.category === 'Emergency' ? ' tile__icon--clay' : ''}`}>
              <IconPhone size={17} />
            </div>
            <p className="tile__title" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {s.national}
            </p>
            <p className="tile__text">
              {lang === 'ne' && s.nameNp ? s.nameNp : s.name}
            </p>
          </a>
        ))}
      </div>

      <div className="seg" role="tablist" aria-label="Service groups" style={{ marginBottom: 'var(--sp-5)' }}>
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            className="seg__btn"
            aria-pressed={open === g}
            aria-selected={open === g}
            onClick={() => setOpen(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {grouped
        .filter((g) => g.group === open)
        .map((g) => (
          <div key={g.group} className="stack">
            {g.items.map((s) => (
              <div key={s.id} className={`service${s.category === 'Emergency' ? ' service--emergency' : ''}`}>
                <div>
                  {s.national ? (
                    <span className="service__num">
                      <a href={`tel:${s.national}`}>{s.national}</a>
                    </span>
                  ) : (
                    <span className="badge badge--notice">{s.category}</span>
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{lang === 'ne' && s.nameNp ? s.nameNp : s.name}</p>
                  <p style={{ color: 'var(--ink-600)', fontSize: 'var(--step--1)' }}>{s.note}</p>
                  <p style={{ marginTop: '0.3rem', fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
                    Source: {s.source}
                    {s.sourceUrl && (
                      <>
                        {' · '}
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {new URL(s.sourceUrl).hostname}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  {s.sourceUrl && (
                    <a
                      className="btn btn--secondary btn--sm"
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${s.name} official source`}
                    >
                      <IconExternal size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      <section className="section" style={{ paddingBottom: 0 }}>
        <h2 style={{ fontSize: 'var(--step-2)', marginBottom: 'var(--sp-4)' }}>Where procedures actually start</h2>
        <div className="grid grid--2">
          {Object.entries(SERVICE_TIPS).map(([k, v]) => (
            <div key={k} className="card card--pad">
              <p className="row row--between" style={{ marginBottom: 'var(--sp-2)' }}>
                <strong style={{ textTransform: 'capitalize' }}>{k}</strong>
                <Badge tone="cat">Guidance</Badge>
              </p>
              <p style={{ color: 'var(--ink-600)' }}>{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <h2 style={{ fontSize: 'var(--step-2)', marginBottom: 'var(--sp-4)' }}>Official portals</h2>
        <div className="grid grid--2">
          {OFFICIAL_LINKS.map((l) => (
            <a key={l.url} className="tile" href={l.url} target="_blank" rel="noopener noreferrer">
              <span className="row row--between" style={{ width: '100%' }}>
                <span className="tile__title">{l.label}</span>
                <IconExternal size={15} />
              </span>
              <span className="tile__text">{l.note}</span>
              <code style={{ marginTop: '0.3rem' }}>{l.url.replace(/^https?:\/\//, '')}</code>
            </a>
          ))}
        </div>
      </section>

      <aside className="panel" style={{ marginTop: 'var(--sp-10)' }}>
        <p className="row" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <IconShield size={16} /> Why NEIBOURLY links out instead of explaining
        </p>
        <p style={{ color: 'var(--ink-600)', marginTop: 'var(--sp-2)' }}>
          Fees, forms and office hours change and they are decided by your own local level. A page written by a
          community app would go stale and quietly mislead people. So every entry above links to the publishing
          institution, and your local level's own website is one click away on any post in your area.
        </p>
        <p style={{ marginTop: 'var(--sp-3)' }}>
          <Link to="/explore">Find your local level website →</Link>
        </p>
      </aside>
    </div>
  );
}
