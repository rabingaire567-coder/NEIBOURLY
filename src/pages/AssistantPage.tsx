import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { ask, apiKeyStored, renderMarkdown, saveApiKey } from '@/lib/ai';
import { SUGGESTIONS } from '@/lib/knowledge';
import { Button, Badge, Notice } from '@/components/ui';
import { PageHead } from '@/components/Route';
import { uid } from '@/lib/storage';
import { addressLine } from '@/lib/geo';
import {
  IconAlert,
  IconArrowRight,
  IconInfo,
  IconKey,
  IconSend,
  IconShield,
} from '@/components/Icons';
import type { AssistantMessage, AssistantStatus } from '@/types';

const GREETING: AssistantMessage = {
  id: 'greeting',
  role: 'assistant',
  text:
    "I am the NEIBOURLY assistant. I can help with emergency numbers, paperwork, water and roads, and what is posted near you.\n\nI answer from NEIBOURLY's own reference data and the official sites it links to. I am not a government official, and for anything about your specific ward I will point you to the ward office and its published citizen charter.",
  origin: 'offline',
  createdAt: new Date().toISOString(),
};

export function AssistantPage() {
  const { settings, allPosts, profile, notify } = useStore();
  const [messages, setMessages] = useState<AssistantMessage[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [warning, setWarning] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Assistant · NEIBOURLY';
  }, []);

  useEffect(() => setHasKey(Boolean(apiKeyStored())), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, status]);

  const place = profile.place ?? settings.scope;

  const ctx = useMemo(
    () => ({
      place,
      posts: allPosts.filter((p) => !p.demo).slice(0, 12).length ? allPosts.filter((p) => !p.demo) : allPosts.slice(0, 8),
    }),
    [place, allPosts],
  );

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || status === 'thinking') return;

    const userMsg: AssistantMessage = {
      id: uid('m'),
      role: 'user',
      text: q,
      createdAt: new Date().toISOString(),
    };
    const history = messages;
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setStatus('thinking');
    setWarning(null);

    try {
      const res = await ask(q, { question: q, history, ctx });
      setMessages((m) => [
        ...m,
        {
          id: uid('m'),
          role: 'assistant',
          text: res.text,
          sources: res.sources,
          origin: res.origin,
          createdAt: new Date().toISOString(),
        },
      ]);
      if (res.warning) setWarning(res.warning);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: uid('m'),
          role: 'assistant',
          text: 'I could not reach the assistant service. Nothing was sent anywhere. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
      setStatus('idle');
      notify(err instanceof Error ? err.message : 'Assistant failed', 'danger');
      return;
    }
    setStatus('idle');
  };

  const saveKey = () => {
    saveApiKey(keyInput);
    setHasKey(Boolean(apiKeyStored()));
    setShowKey(false);
    setKeyInput('');
    setWarning(null);
    notify('API key saved in this browser only', 'ok');
  };

  return (
    <div className="wrap wrap--narrow">
      <PageHead
        eyebrow="Grounded in official sources"
        title="Assistant"
        lede={
          place
            ? `Answers use your selected area: ${addressLine(place)}.`
            : 'Set your area in Settings and answers become specific to your local level.'
        }
        actions={
          <>
            {hasKey ? (
              <>
                <Badge tone="open">Gemini key saved</Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    saveApiKey('');
                    setHasKey(false);
                    setWarning(null);
                    notify('API key removed from this browser', 'ok');
                  }}
                >
                  Remove key
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setShowKey(true)}>
                <IconKey size={14} /> Add API key
              </Button>
            )}
          </>
        }
      />

      {showKey && (
        <div className="card card--pad stack" style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="field">
            <label htmlFor="apikey" className="field__label">
              Your Google AI Studio API key
            </label>
            <input
              id="apikey"
              className="input"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIza…"
              autoComplete="off"
            />
            <span className="field__hint">
              Stored in this browser only and sent straight to Google's own endpoint from your browser. It is never
              uploaded to NEIBOURLY and never committed to the repository.
            </span>
          </div>
          <div className="row row--wrap">
            <Button onClick={saveKey} disabled={keyInput.trim().length < 10}>
              Save key
            </Button>
            <a
              className="btn btn--secondary"
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a free key <IconArrowRight size={15} />
            </a>
            <Button variant="ghost" onClick={() => setShowKey(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {warning && (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Notice tone="warn" icon={<IconAlert size={16} />}>
            {warning}
          </Notice>
        </div>
      )}

      <div className="chat" style={{ marginBottom: 'var(--sp-4)' }}>
        {messages.map((m) => (
          <div key={m.id} className={`msg msg--${m.role}`}>
            <span className="msg__role">{m.role === 'user' ? 'You' : 'Assistant'}</span>
            <div
              className="msg__body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
            />
            {m.origin && (
              <div className="row" style={{ gap: '0.4rem', marginTop: '0.4rem' }}>
                <Badge tone={m.origin === 'cloud' ? 'help' : 'neutral'}>
                  {m.origin === 'cloud' ? 'Gemini' : 'Offline reference'}
                </Badge>
              </div>
            )}
            {m.sources && m.sources.length > 0 && (
              <div className="msg__sources">
                <p>Sources</p>
                <ul style={{ paddingLeft: '1.1rem', margin: '0.35rem 0 0' }}>
                  {m.sources.map((s) => (
                    <li key={s.href ?? s.label}>
                      {s.href ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                          {s.label}
                        </a>
                      ) : (
                        s.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {status === 'thinking' && (
          <div className="msg msg--bot">
            <span className="msg__role">Assistant</span>
            <span className="typing" aria-label="Thinking">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <div className="suggestions" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
        <form
          className="chat-input__box"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <label htmlFor="chat" className="sr-only">
            Ask the assistant
          </label>
          <textarea
            id="chat"
            className="chat-input__textarea"
            value={draft}
            rows={1}
            placeholder="Ask about services, paperwork or what is near you…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          <Button type="submit" disabled={!draft.trim() || status === 'thinking'} icon aria-label="Send">
            <IconSend size={17} />
          </Button>
        </form>
      </div>

      <aside className="panel" style={{ marginTop: 'var(--sp-6)' }}>
        <p className="row" style={{ gap: '0.4rem', fontWeight: 600 }}>
          <IconShield size={16} /> What this assistant will and will not do
        </p>
        <ul style={{ paddingLeft: '1.1rem', marginTop: 'var(--sp-2)', display: 'grid', gap: 'var(--sp-2)', color: 'var(--ink-600)' }}>
          <li>It answers from NEIBOURLY's reference data and the official sites it links to. It does not browse.</li>
          <li>It never invents a phone number, fee or opening time. If it does not know, it says so.</li>
          <li>It will not ask for or repeat a national ID number, passport number, bank details or a precise address.</li>
          <li>
            It is not a government official. Your ward office and its published{' '}
            <Link to="/services">citizen charter</Link> are the authority.
          </li>
        </ul>
        <p className="row" style={{ gap: '0.4rem', marginTop: 'var(--sp-3)', fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
          <IconInfo size={14} />
          Without an API key every question is answered locally by the offline reference, so the assistant works with
          no connection.
        </p>
      </aside>
    </div>
  );
}
