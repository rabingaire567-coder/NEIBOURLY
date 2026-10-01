import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { labelFor } from '@/lib/geo';
import {
  IconBook,
  IconCompass,
  IconGift,
  IconHand,
  IconHome,
  IconLayers,
  IconLogo,
  IconMegaphone,
  IconMenu,
  IconMoon,
  IconPin,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSparkle,
  IconSun,
  IconClose,
} from './Icons';
import { Button } from './ui';

interface NavItem {
  to: string;
  labelKey: string;
  fallback: string;
  Icon: typeof IconHome;
}

const NAV: NavItem[] = [
  { to: '/', labelKey: 'nav.home', fallback: 'Home', Icon: IconHome },
  { to: '/ask', labelKey: 'nav.ask', fallback: 'Ask', Icon: IconHand },
  { to: '/offer', labelKey: 'nav.offer', fallback: 'Offer', Icon: IconGift },
  { to: '/discover', labelKey: 'nav.discover', fallback: 'Discover', Icon: IconCompass },
  { to: '/community', labelKey: 'nav.community', fallback: 'Community', Icon: IconMegaphone },
  { to: '/assistant', labelKey: 'nav.assistant', fallback: 'Assistant', Icon: IconSparkle },
];

const SECONDARY: NavItem[] = [
  { to: '/explore', labelKey: 'nav.explore', fallback: 'Explore', Icon: IconLayers },
  { to: '/services', labelKey: 'nav.services', fallback: 'Services', Icon: IconBook },
  { to: '/settings', labelKey: 'nav.settings', fallback: 'Settings', Icon: IconSettings },
];

export function Navbar() {
  const { t, settings, dispatch, profile } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setDrawer(false), [location.pathname]);

  useEffect(() => {
    if (!drawer) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [drawer]);

  const toggleTheme = () =>
    dispatch({
      type: 'settings/patch',
      patch: { theme: settings.theme === 'dark' ? 'light' : 'dark' },
    });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/discover?q=${encodeURIComponent(q)}`);
  };

  const placeLabel = settings.scope ? labelFor(settings.scope, settings.lang, true).short : null;

  return (
    <>
      <header className="nav">
        <div className="wrap wrap--wide nav__inner">
          <Link to="/" className="brand" aria-label="NEIBOURLY home">
            <IconLogo className="brand__mark" />
            <span className="brand__name">NEIBOURLY</span>
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {NAV.map(({ to, fallback, Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} className="nav__link">
                <span className="row" style={{ gap: '0.35rem' }}>
                  <Icon size={15} />
                  {t(fallback === 'Home' ? 'nav.home' : `nav.${to.slice(1)}`) || fallback}
                </span>
              </NavLink>
            ))}
          </nav>

          <form className="nav__search" role="search" onSubmit={onSearch}>
            <IconSearch size={15} className="nav__search-icon" />
            <label htmlFor="global-search" className="sr-only">
              Search posts and places
            </label>
            <input
              id="global-search"
              className="input"
              type="search"
              placeholder="Search asks, offers, places"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="nav__actions">
            {profile.name ? (
              <Link to="/profile" className="btn btn--secondary btn--sm" title={profile.name}>
                {profile.name.split(/\s+/)[0]}
              </Link>
            ) : (
              <Link to="/profile" className="btn btn--secondary btn--sm">
                Sign in
              </Link>
            )}
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={settings.theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
            >
              {settings.theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>
            <button
              type="button"
              className="icon-btn nav__menu-btn"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
            >
              <IconMenu size={19} />
            </button>
          </div>
        </div>
        {placeLabel && (
          <div className="wrap wrap--wide row" style={{ paddingBottom: 6, gap: 6, fontSize: 'var(--step--1)', color: 'var(--ink-500)' }}>
            <IconPin size={13} />
            Showing nearby: <strong style={{ color: 'var(--ink-700)' }}>{placeLabel}</strong>
            <Link to="/settings" className="btn btn--ghost btn--sm" style={{ height: 22, paddingInline: 6 }}>
              Change
            </Link>
          </div>
        )}
      </header>

      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="drawer__scrim" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div className="drawer__panel">
            <div className="drawer__head">
              <span className="brand">
                <IconLogo size={26} />
                <span className="brand__name" style={{ fontSize: 'var(--step-0)' }}>
                  NEIBOURLY
                </span>
              </span>
              <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                <IconClose size={18} />
              </button>
            </div>
            <div className="drawer__body">
              {[...NAV, ...SECONDARY].map(({ to, fallback, Icon }) => (
                <NavLink key={to} to={to} end={to === '/'} className="drawer__link">
                  <Icon size={17} />
                  {t(`nav.${to === '/' ? 'home' : to.slice(1)}`) || fallback}
                </NavLink>
              ))}
            </div>
            <div className="drawer__foot">
              <Button variant="primary" block onClick={() => navigate('/new')}>
                Post something
              </Button>
              <Button variant="secondary" block onClick={toggleTheme}>
                {settings.theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TabBar() {
  const items = useMemo(
    () => [
      { to: '/', Icon: IconHome, label: 'Home' },
      { to: '/discover', Icon: IconCompass, label: 'Discover' },
      { to: '/new', Icon: IconPlus, label: 'Post', fab: true },
      { to: '/community', Icon: IconMegaphone, label: 'Community' },
      { to: '/assistant', Icon: IconSparkle, label: 'Assistant' },
    ],
    [],
  );

  return (
    <nav className="tabbar" aria-label="Primary">
      {items.map(({ to, Icon, label, fab }) =>
        fab ? (
          <NavLink key={to} to={to} className="tabbar__fab" aria-label="Create a post">
            <span>
              <Icon size={22} />
            </span>
          </NavLink>
        ) : (
          <NavLink key={to} to={to} end={to === '/'} className="tabbar__link">
            <Icon size={20} />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((tst) => (
        <div key={tst.id} className={`toast${tst.tone !== 'default' ? ` toast--${tst.tone}` : ''}`}>
          <span className="grow">{tst.message}</span>
        </div>
      ))}
    </div>
  );
}
