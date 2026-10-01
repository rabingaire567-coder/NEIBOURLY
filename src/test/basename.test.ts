import { describe, expect, it } from 'vitest';
import { resolveBasename } from '@/lib/basename';

const doc = (html: string, scriptSrc = '') => {
  const d = document.implementation.createHTMLDocument('t');
  d.head.innerHTML = html;
  if (scriptSrc) {
    const s = d.createElement('script');
    s.setAttribute('src', scriptSrc);
    d.head.append(s);
  }
  return d;
};

describe('resolveBasename', () => {
  it('is empty when the app is served from the domain root', () => {
    expect(resolveBasename(doc('<base href="/" />'))).toBe('');
  });

  it('reads a project-page mount from the base tag', () => {
    expect(resolveBasename(doc('<base href="/NEIBOURLY/" />'))).toBe('/NEIBOURLY');
  });

  it('handles a base tag without a trailing slash', () => {
    expect(resolveBasename(doc('<base href="/NEIBOURLY" />'))).toBe('/NEIBOURLY');
  });

  it('falls back to the script URL when there is no base tag', () => {
    const d = doc('', 'https://rabingaire567-coder.github.io/NEIBOURLY/assets/index-abc123.js');
    expect(resolveBasename(d)).toBe('/NEIBOURLY');
  });

  it('returns empty for a root-served script with no base tag', () => {
    const d = doc('', 'https://example.test/assets/index-abc123.js');
    expect(resolveBasename(d)).toBe('');
  });

  it('ignores a malformed base tag instead of throwing', () => {
    const d = doc('', 'https://example.test/NEIBOURLY/assets/index-abc.js');
    d.head.querySelector('base')?.setAttribute('href', 'http://[bad');
    expect(resolveBasename(d)).toBe('/NEIBOURLY');
  });

  it('returns empty when there is nothing to go on', () => {
    expect(resolveBasename(doc(''))).toBe('');
  });
});
