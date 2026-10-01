import { Link, Outlet } from 'react-router-dom';
import { Navbar, TabBar, Toasts } from '@/components/Navbar';
import { ScrollToTop } from '@/components/Route';
import { useStore } from '@/lib/store';
import { IconLogo } from '@/components/Icons';
import { OFFICIAL_LINKS } from '@/data/services';

export function AppLayout() {
  const { settings } = useStore();

  return (
    <div className="shell">
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="main">
        <Outlet />
      </main>
      <TabBar />
      <Toasts />

      <footer className="footer">
        <div className="wrap">
          <div className="footer__grid">
            <div className="stack">
              <Link to="/" className="brand">
                <IconLogo />
                <span className="brand__name">NEIBOURLY</span>
              </Link>
              <p style={{ color: 'var(--ink-600)', maxWidth: '42ch' }}>
                A Nepal-first community board for reciprocal ask and offer. Built to be bilingual,
                offline-first, and grounded in official sources.
              </p>
              <p style={{ fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
                Language: {settings.lang.toUpperCase()} • Theme: {settings.theme}
              </p>
            </div>
            <div>
              <p className="footer__title">Boards</p>
              <ul className="footer__links">
                <li>
                  <Link to="/ask">Ask</Link>
                </li>
                <li>
                  <Link to="/offer">Offer</Link>
                </li>
                <li>
                  <Link to="/discover">Discover</Link>
                </li>
                <li>
                  <Link to="/community">Community</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="footer__title">Reference</p>
              <ul className="footer__links">
                <li>
                  <Link to="/explore">Explore Nepal</Link>
                </li>
                <li>
                  <Link to="/services">Public services</Link>
                </li>
                <li>
                  <Link to="/assistant">Assistant</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="footer__title">Official links</p>
              <ul className="footer__links">
                {OFFICIAL_LINKS.slice(0, 5).map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2026 NEIBOURLY. All rights reserved. Data and provenance described in README.</p>
            <p>
              <Link to="/">Privacy by design</Link> • <Link to="/">Offline-first</Link> •{' '}
              <a href="https://github.com/rabingaire567-coder/NEIBOURLY" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
