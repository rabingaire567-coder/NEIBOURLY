import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Button, Notice, Badge } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { LocationPicker } from '@/components/LocationPicker';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { SERVICES } from '@/data/services';
import { labelFor, getLocalLevel } from '@/lib/geo';
import { IconAlert, IconCheck, IconShield } from '@/components/Icons';
import type { CategoryId, PostKind } from '@/types';

const KIND_TABS: { value: PostKind; label: string; hint: string }[] = [
  { value: 'ask', label: 'I need help', hint: 'Something you need from a neighbour.' },
  { value: 'offer', label: 'I can help', hint: 'Something you can offer a neighbour.' },
  { value: 'post', label: 'Notice', hint: 'Information you want your neighbours to read.' },
];

const LIMITS = { title: 110, body: 1600, lookingFor: 160, contact: 80 };

/** Words that must never appear in a public post. */
const SENSITIVE = [
  /\b\d{1,5}[-/]\d{1,7}[-/]\d{1,7}\b/, // a date that looks like an ID
  /\b0?9(?:7|8)\d{8}\b/, // mobile number
  /\b\d{17}\b/, // citizen number
  /\b(?:account|a\/c)\s*(?:no|number)?\s*[:#]?\s*\d{6,}/i,
  /\b[A-Z]{2}\d{2}[A-Z]{0,2}\d{7}\b/, // passport style
];

export function NewPostPage() {
  const { settings, createPost, profile, notify } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [kind, setKind] = useState<PostKind>(
    (params.get('kind') as PostKind) ?? (profile.interests.length ? 'offer' : 'ask'),
  );
  const [category, setCategory] = useState<CategoryId>('education');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [contact, setContact] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [ward, setWard] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = 'Post · NEIBOURLY';
  }, []);

  const place = profile.place ?? settings.scope;
  const cat = CATEGORY_MAP[category];

  const warnings = useMemo(() => {
    const out: string[] = [];
    const hay = `${title} ${body} ${lookingFor} ${contact}`;
    for (const re of SENSITIVE) {
      if (re.test(hay)) out.push('That looks like an ID number, passport number or bank detail. Remove it before posting.');
    }
    if (/\b(urgent|emergency|अति जरुरी)\b/i.test(title) && kind !== 'ask') {
      out.push('Only asks can be marked urgent.');
    }
    if (body.length > 0 && body.length < 20) out.push('A little more detail helps neighbours respond.');
    return [...new Set(out)];
  }, [title, body, lookingFor, contact, kind]);

  const errors = {
    title: title.trim().length < 8 ? 'At least 8 characters.' : '',
    body: body.trim().length < 20 ? 'At least 20 characters so neighbours understand.' : '',
  };
  const valid = !errors.title && !errors.body && Boolean(place);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, body: true });
    if (!valid || !place) return;

    const created = createPost({
      kind,
      category,
      title,
      body,
      place,
      ward: ward ? Number(ward) : undefined,
      lookingFor: lookingFor || undefined,
      contact: contact || undefined,
      urgent: kind === 'ask' ? urgent : false,
    });
    notify(kind === 'post' ? 'Notice posted to this browser' : `Your ${kind} is live on this device`, 'ok');
    navigate(`/post/${created.id}`);
  };

  return (
    <div className="wrap wrap--narrow">
      <PageHead
        eyebrow="Create"
        title="Post something"
        lede="Stored in this browser only. Share the link to send it to a neighbour."
      />

      <form className="stack" onSubmit={submit}>
        <section className="card card--pad stack">
          <fieldset style={{ border: 0, padding: 0 }}>
            <legend className="field__label" style={{ marginBottom: 'var(--sp-3)' }}>
              What kind of post is this?
            </legend>
            <div className="grid grid--3">
              {KIND_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className="tile"
                  aria-pressed={kind === tab.value}
                  onClick={() => setKind(tab.value)}
                  style={{
                    borderColor: kind === tab.value ? 'var(--pine-500)' : undefined,
                    background: kind === tab.value ? 'var(--pine-50)' : undefined,
                    textAlign: 'left',
                  }}
                >
                  <span className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="tile__title">{tab.label}</span>
                    {kind === tab.value && <IconCheck size={16} />}
                  </span>
                  <span className="tile__text">{tab.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card card--pad stack">
          <h2 style={{ fontSize: 'var(--step-1)' }}>Where</h2>
          {place ? (
            <>
              <p className="row row--wrap" style={{ gap: 'var(--sp-2)' }}>
                <Badge tone="help">{labelFor(place, settings.lang, true).full}</Badge>
                <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
                  Everything under this local level sees the post.
                </span>
              </p>
              <div className="field" style={{ maxWidth: 220 }}>
                <label htmlFor="ward" className="field__label">
                  Ward number <span className="field__hint">(optional)</span>
                </label>
                <input
                  id="ward"
                  className="input"
                  type="number"
                  min={1}
                  max={lgWardCount(place.lgId)}
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. 5"
                />
                <span className="field__hint">
                  This local level has {lgWardCount(place.lgId)} wards. Ward helps neighbours nearby find you.
                </span>
              </div>
              <p style={{ fontSize: 'var(--step--1)' }}>
                <Link to="/settings" style={{ color: 'var(--pine-600)' }}>
                  Change your area in Settings
                </Link>
              </p>
            </>
          ) : (
            <LocationPicker
              onPicked={() => notify('Area set — you can post now', 'ok')}
              label="Choose your local level before posting"
            />
          )}
        </section>

        <section className="card card--pad stack">
          <div className="field">
            <label htmlFor="cat" className="field__label">
              Category <span className="field__req">*</span>
            </label>
            <select id="cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {settings.lang === 'ne' ? c.labelNp : c.label} — {c.hint}
                </option>
              ))}
            </select>
            <span className="field__hint">{cat.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="title" className="field__label">
              Title <span className="field__req">*</span>
            </label>
            <input
              id="title"
              className="input"
              value={title}
              maxLength={LIMITS.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              aria-invalid={Boolean(touched.title && errors.title)}
              placeholder="Say what and where, in one line"
              required
            />
            <div className="row row--between">
              {touched.title && errors.title ? (
                <span className="field__error">{errors.title}</span>
              ) : (
                <span className="field__hint">No phone numbers in the title.</span>
              )}
              <span className="char-count">
                {title.length}/{LIMITS.title}
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="body" className="field__label">
              Details <span className="field__req">*</span>
            </label>
            <textarea
              id="body"
              className="textarea"
              value={body}
              maxLength={LIMITS.body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, body: true }))}
              aria-invalid={Boolean(touched.body && errors.body)}
              placeholder="What is happening, when, and what you need or can offer."
              required
            />
            <div className="row row--between">
              {touched.body && errors.body ? (
                <span className="field__error">{errors.body}</span>
              ) : (
                <span className="field__hint">Plain text. Line breaks are kept.</span>
              )}
              <span className="char-count">
                {body.length}/{LIMITS.body}
              </span>
            </div>
          </div>

          {kind !== 'post' && (
            <div className="field">
              <label htmlFor="looking" className="field__label">
                {kind === 'ask' ? 'What exactly do you need?' : 'What exactly can you offer?'}
              </label>
              <input
                id="looking"
                className="input"
                value={lookingFor}
                maxLength={LIMITS.lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder={kind === 'ask' ? 'A tutor for grade 8, evenings' : 'Evening and Sunday electrical work'}
              />
              <span className="field__hint">One specific line makes it far easier for a neighbour to say yes.</span>
            </div>
          )}

          {kind === 'ask' && (
            <label className="check">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
              <span>
                This needs help <strong>right now</strong>
                <span className="field__hint" style={{ display: 'block' }}>
                  Urgent asks float to the top. For a real emergency dial {SERVICES.find((s) => s.id === 'police')?.national}
                  {' '}or {SERVICES.find((s) => s.id === 'ambulance')?.national} instead.
                </span>
              </span>
            </label>
          )}

          <div className="field">
            <label htmlFor="contact" className="field__label">
              How can people reach you?
            </label>
            <input
              id="contact"
              className="input"
              value={contact}
              maxLength={LIMITS.contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Reply here in the app"
            />
            <span className="field__hint">
              Say &ldquo;reply in the app&rdquo; rather than posting a number publicly.
            </span>
          </div>
        </section>

        {warnings.map((w) => (
          <Notice key={w} tone="warn" icon={<IconAlert size={16} />}>
            {w}
          </Notice>
        ))}

        <Notice tone="info" icon={<IconShield size={16} />}>
          Your post is saved in this browser on this device. There is no account and no central database, so
          nobody is notified unless you share the link.
        </Notice>

        <div className="row row--wrap">
          <Button type="submit" size="lg" disabled={!valid}>
            <IconCheck size={16} /> {kind === 'ask' ? 'Post my ask' : kind === 'offer' ? 'Post my offer' : 'Post notice'}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Ward count for the selected local level, used to bound the ward input. */
function lgWardCount(lgId: number): number {
  return getLocalLevel(lgId)?.wards ?? 19;
}
