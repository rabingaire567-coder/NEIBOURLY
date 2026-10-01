import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'clay' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    icon && 'btn--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={cls} {...rest} />;
}

export function Card({
  children,
  className = '',
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return <As className={`card ${className}`}>{children}</As>;
}

export function Badge({
  children,
  tone = 'neutral',
  title,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'ask' | 'offer' | 'notice' | 'help' | 'urgent' | 'open' | 'resolved' | 'cat';
  title?: string;
}) {
  return (
    <span className={`badge${tone === 'neutral' ? '' : ` badge--${tone}`}`} title={title}>
      {children}
    </span>
  );
}

export function Notice({
  tone = 'info',
  icon,
  title,
  style,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'ok';
  icon?: ReactNode;
  title?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`notice notice--${tone}`} style={style} role={tone === 'danger' ? 'alert' : undefined}>
      {icon}
      <div className="stack stack--sm">
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Empty({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon && <div className="empty__icon">{icon}</div>}
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = '', style }: { className?: string; style?: object }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />;
}

export function PostSkeleton() {
  return (
    <div className="post" aria-hidden>
      <Skeleton style={{ width: 40, height: 40, borderRadius: '50%' }} />
      <div className="grow">
        <Skeleton className="skeleton--text" style={{ width: '30%' }} />
        <Skeleton className="skeleton--title" />
        <Skeleton className="skeleton--text" style={{ width: '95%' }} />
        <Skeleton className="skeleton--text" style={{ width: '70%' }} />
        <Skeleton className="skeleton--text" style={{ width: '30%', marginTop: 12 }} />
      </div>
    </div>
  );
}

export function Section({
  id,
  title,
  text,
  eyebrow,
  action,
  tint,
  children,
}: {
  id?: string;
  title?: string;
  text?: string;
  eyebrow?: string;
  action?: ReactNode;
  tint?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`section${tint ? ' section--tint' : ''}`}>
      <div className="wrap">
        {(title || action) && (
          <div className="section__head">
            <div>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2 className="section__title">{title}</h2>}
              {text && <p className="section__text">{text}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

/** Focus trap + Escape-to-close + scroll lock for dialogs and drawers. */
export function useDismissable(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
      previous?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}
