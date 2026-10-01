import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button, Badge, Notice } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { LocationPicker } from '@/components/LocationPicker';
import { apiKeyStored, clearApiKey, saveApiKey } from '@/lib/ai';
import { CATEGORIES } from '@/data/categories';
import { hasUserData } from '@/lib/storage';
import { addressLine, labelFor } from '@/lib/geo';
import { IconAlert, IconCheck, IconKey, IconMoon, IconShield, IconSun, IconTrash } from '@/components/Icons';
import type { CategoryId } from '@/types';

export function SettingsPage() {
  const { settings, dispatch, profile, clearData, saved, myPosts, notify } = useStore();
  const [tab, setTab] = useState<'area' | 'assistant' | 'appearance' | 'privacy'>('area');
  const [name, setName] = useState(profile.name);
  const [area, setArea] = useState(profile.area);
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    document.title = 'Settings · NEIBOURLY';
  }, []);

  useEffect(() => setHasKey(Boolean(apiKeyStored())), []);

  const patch = (p: Partial<typeof settings>) => dispatch({ type: 'settings/patch', patch: p });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'profile/patch', patch: { name: name.trim(), area: area.trim() } });
    notify('Your details updated on this device', 'ok');
  };

  const toggleInterest = (id: CategoryId) =>
    dispatch({
      type: 'profile/patch',
      patch: {
        interests: profile.interests.includes(id)
          ? profile.interests.filter((i) => i !== id)
          : [...profile.interests, id],
      },
    });

  return (
    <div className="wrap wrap--narrow">
      <PageHead eyebrow="This device only" title="Settings" lede="Everything NEIBOURLY stores lives in this browser. There is no account and no server database." />

      <div className="seg" role="tablist" aria-label="Settings sections" style={{ marginBottom: 'var(--sp-6)' }}>
        {(
          [
            ['area', 'My area'],
            ['assistant', 'Assistant'],
            ['appearance', 'Appearance'],
            ['privacy', 'Privacy'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" className="seg__btn" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'area' && (
        <div className="stack stack--lg">
          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Your area</h2>
            <p style={{ color: 'var(--ink-600)' }}>
              This decides what "near you" means. Posts are ranked by distance between local level centres, and
              every post under this local level is shown first.
            </p>
            {settings.scope && (
              <p className="row row--wrap" style={{ gap: 'var(--sp-2)' }}>
                <Badge tone="help">{addressLine(settings.scope, settings.lang)}</Badge>
                <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
                  Ward {settings.scope.ward ?? 'not set'}
                </span>
              </p>
            )}
            <LocationPicker onPicked={() => setTab('area')} />
            <div className="field" style={{ maxWidth: 260 }}>
              <label htmlFor="radius" className="field__label">
                Show posts within
              </label>
              <select
                id="radius"
                className="select"
                value={settings.radiusKm}
                onChange={(e) => patch({ radiusKm: Number(e.target.value) })}
              >
                {[2, 5, 10, 25, 50, 100].map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
              <span className="field__hint">
                Measured between local level centres, so it is an approximation. Neighbouring local levels are usually
                well within {settings.radiusKm} km of each other in dense areas.
              </span>
            </div>
          </section>

          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>About you</h2>
            <form className="stack" onSubmit={saveProfile}>
              <div className="field">
                <label htmlFor="pname" className="field__label">
                  Display name
                </label>
                <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="How neighbours see you" maxLength={40} />
                <span className="field__hint">First name or a nickname is enough. Never post a national ID number.</span>
              </div>
              <div className="field">
                <label htmlFor="parea" className="field__label">
                  Area or landmark
                </label>
                <input id="parea" className="input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Tamsikhel" maxLength={40} />
                <span className="field__hint">A neighbourhood, not a house number. Helps neighbours know you are real.</span>
              </div>
              <div>
                <Button type="submit">Save details</Button>
              </div>
            </form>
            <div className="field">
              <span className="field__label">Interests</span>
              <div className="chip-row">
                {CATEGORIES.map((c) => (
                  <button key={c.id} type="button" className="chip" aria-pressed={profile.interests.includes(c.id)} onClick={() => toggleInterest(c.id)}>
                    {settings.lang === 'ne' ? c.labelNp : c.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {tab === 'assistant' && (
        <div className="stack stack--lg">
          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Gemini API key</h2>
            <p style={{ color: 'var(--ink-600)' }}>
              NEIBOURLY has no AI backend of its own. You bring a free Google AI Studio key, it is kept in this
              browser, and your question goes straight from your browser to Google's endpoint.
            </p>

            {hasKey ? (
              <>
                <Notice tone="ok" icon={<IconCheck size={16} />}>
                  A key is saved in this browser. Questions are answered by Gemini, grounded in your area and the
                  official sources NEIBOURLY links to.
                </Notice>
                <div className="row row--wrap">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      clearApiKey();
                      setHasKey(false);
                      notify('API key removed', 'ok');
                    }}
                  >
                    Remove key
                  </Button>
                </div>
              </>
            ) : (
              <div className="stack">
                <Notice tone="info" icon={<IconKey size={16} />}>
                  Without a key the assistant still answers from a built-in offline reference: emergency numbers,
                  paperwork, water and roads, what is near you, and how to post. Nothing is sent anywhere.
                </Notice>
                <div className="field">
                  <label htmlFor="key" className="field__label">
                    Paste your key
                  </label>
                  <input
                    id="key"
                    className="input"
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="AIza…"
                    autoComplete="off"
                  />
                </div>
                <div className="row row--wrap">
                  <Button
                    disabled={key.trim().length < 10}
                    onClick={() => {
                      saveApiKey(key);
                      setKey('');
                      setHasKey(true);
                      notify('API key saved in this browser only', 'ok');
                    }}
                  >
                    Save key
                  </Button>
                  <a className="btn btn--secondary" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                    Get a free key
                  </a>
                </div>
              </div>
            )}
          </section>

          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>How the assistant is constrained</h2>
            <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 'var(--sp-2)', color: 'var(--ink-600)' }}>
              <li>It is given only NEIBOURLY's reference data, your selected area, and your nearby posts. It cannot browse.</li>
              <li>It is instructed never to invent a phone number, fee, opening time or procedure.</li>
              <li>It is instructed to point you to your ward office and its published citizen charter for anything local.</li>
              <li>It is instructed never to request or repeat national ID numbers, passport numbers, bank details or a precise address.</li>
              <li>If the key is invalid or rate-limited, the offline answer is shown instead of a failure.</li>
            </ul>
          </section>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="stack stack--lg">
          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Language</h2>
            <div className="seg" role="group" aria-label="Language">
              <button type="button" className="seg__btn" aria-pressed={settings.lang === 'en'} onClick={() => patch({ lang: 'en' })}>
                English
              </button>
              <button type="button" className="seg__btn" aria-pressed={settings.lang === 'ne'} onClick={() => patch({ lang: 'ne' })}>
                नेपाली
              </button>
            </div>
            <p style={{ color: 'var(--ink-600)' }}>
              Interface text switches. Every post keeps the language it was written in, because you should be able to
              read what your neighbour actually wrote.
            </p>
          </section>

          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Theme</h2>
            <div className="seg" role="group" aria-label="Theme">
              <button type="button" className="seg__btn" aria-pressed={settings.theme === 'light'} onClick={() => patch({ theme: 'light' })}>
                <IconSun size={14} /> Light
              </button>
              <button type="button" className="seg__btn" aria-pressed={settings.theme === 'dark'} onClick={() => patch({ theme: 'dark' })}>
                <IconMoon size={14} /> Dark
              </button>
            </div>
            <label className="check">
              <input type="checkbox" checked={settings.reduceMotion} onChange={(e) => patch({ reduceMotion: e.target.checked })} />
              <span>
                Reduce motion
                <span className="field__hint" style={{ display: 'block' }}>
                  Turns off transitions and the live indicator. Your system setting is respected automatically too.
                </span>
              </span>
            </label>
            <label className="check">
              <input type="checkbox" checked={settings.denseCards} onChange={(e) => patch({ denseCards: e.target.checked })} />
              <span>
                Compact cards
                <span className="field__hint" style={{ display: 'block' }}>
                  Show one line of detail per post instead of two.
                </span>
              </span>
            </label>
          </section>
        </div>
      )}

      {tab === 'privacy' && (
        <div className="stack stack--lg">
          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>What is stored on this device</h2>
            <dl className="kv">
              <dt>Posts</dt>
              <dd>{myPosts.length} created here, plus the bundled demo content</dd>
              <dt>Saved items</dt>
              <dd>{saved.length}</dd>
              <dt>Your area</dt>
              <dd>{settings.scope ? labelFor(settings.scope, settings.lang, true).full : 'Not set'}</dd>
              <dt>API key</dt>
              <dd>{hasKey ? 'Saved in this browser' : 'Not set'}</dd>
            </dl>
            <Notice tone="info" icon={<IconShield size={16} />}>
              NEIBOURLY is a static app. There is no backend, no analytics and no tracking. Posts stay in this browser
              until you clear them, which also means they do not sync to another device unless you share the link.
            </Notice>
          </section>

          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Safety</h2>
            <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 'var(--sp-2)', color: 'var(--ink-600)' }}>
              <li>Never post a national ID number, passport number, bank detail or full home address.</li>
              <li>Keep phone numbers out of titles; use in-app responses so they are not scraped.</li>
              <li>Meet at a public place, and take someone with you when you can.</li>
              <li>For blood, always go through the district Red Cross blood bank as well as an individual donor.</li>
              <li>Report anything illegal to the police control room, 100.</li>
            </ul>
          </section>

          <section className="card card--pad stack">
            <h2 style={{ fontSize: 'var(--step-1)' }}>Clear local data</h2>
            {confirmClear ? (
              <>
                <Notice tone="danger" icon={<IconAlert size={16} />}>
                  This deletes every post you created, your saved items, your area, your profile and your API key from
                  this browser. The bundled demo content comes back. It cannot be undone.
                </Notice>
                <div className="row row--wrap">
                  <Button
                    variant="danger"
                    onClick={() => {
                      clearData();
                      setConfirmClear(false);
                    }}
                  >
                    Yes, clear everything
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--ink-600)' }}>
                  {hasUserData() ? 'You have local data on this device.' : 'There is nothing stored yet.'}
                </p>
                <div>
                  <Button variant="secondary" onClick={() => setConfirmClear(true)} disabled={!hasUserData()}>
                    <IconTrash size={15} /> Clear local data
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
