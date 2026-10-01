import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/* ==========================================================================
   Routing helpers
   ========================================================================== */

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export interface Crumb {
  label: string;
  to?: string;
}

/** Accessible breadcrumb trail; the last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`}>
          {i > 0 && <span aria-hidden> / </span>}
          {c.to && i < items.length - 1 ? (
            <Link to={c.to}>{c.label}</Link>
          ) : (
            <span aria-current={i === items.length - 1 ? 'page' : undefined}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Route-level error boundary replacement with a retry affordance. */
export function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="wrap wrap--narrow" style={{ paddingBlock: 'var(--sp-16)' }}>
      <p className="eyebrow">Something went wrong</p>
      <h1>This page could not be shown</h1>
      <p style={{ color: 'var(--ink-600)', marginTop: 'var(--sp-3)' }}>{error.message}</p>
      <div className="row" style={{ marginTop: 'var(--sp-6)' }}>
        <button type="button" className="btn" onClick={retry}>
          Try again
        </button>
        <Link className="btn btn--secondary" to="/">
          Go to home
        </Link>
      </div>
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  lede,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="grow">
        {children}
        {eyebrow && <p className="page-head__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lede && <p className="page-head__lede">{lede}</p>}
      </div>
      {actions && <div className="row row--wrap">{actions}</div>}
    </header>
  );
}
