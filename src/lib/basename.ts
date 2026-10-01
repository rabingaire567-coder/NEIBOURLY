/**
 * The app is served from a sub-path on GitHub Pages (/NEIBOURLY/), so the router
 * must strip that prefix from every URL it matches.
 */

/**
 * Works out where the site is mounted.
 *
 * The <base> tag written by scripts/build-404.mjs is authoritative, because it is
 * the one element that reflects the mount point in both index.html and the
 * 404.html fallback. When it is absent (the dev server, or a host that does not
 * use the fallback) the mount is inferred from the script URL instead.
 */
export function resolveBasename(doc: Document = document, origin = 'https://example.test'): string {
  const baseHref = doc.querySelector('base')?.getAttribute('href');
  if (baseHref) {
    try {
      const { pathname } = new URL(baseHref, origin);
      return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    } catch {
      /* malformed <base>, fall through to the script URL */
    }
  }

  const script = doc.querySelector<HTMLScriptElement>('script[src*="/assets/"]');
  if (script?.src) {
    const mount = new URL('./', script.src).pathname.replace(/assets\/$/, '');
    return mount === '/' ? '' : mount.slice(0, -1);
  }

  return '';
}
