/**
 * Copy the built SPA into 404.html (and 200.html) so GitHub Pages serves the app
 * for deep links like /NEIBOURLY/ask/seed-ask-1 instead of its 404 page.
 *
 * The build emits relative asset URLs (`base: './'` in vite.config.ts). Those
 * resolve correctly from the site root but NOT from a deep link, because the
 * browser resolves them against the requested directory. So the fallback gets a
 * <base href> pointing at the deployed site root.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

// Where the site is served from. Override with PAGES_BASE when deploying the
// app to a user/organisation page instead of a project page.
const base = (process.env.PAGES_BASE ?? '/NEIBOURLY/').replace(/\/*$/, '/');

const indexPath = resolve(dist, 'index.html');
if (!existsSync(indexPath)) {
  console.error('build-404: dist/index.html not found. Run the build first.');
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

const baseTag = `<base href="${base}" />`;
// GitHub Pages must not index the fallback document as a page of its own.
const robots = '<meta name="robots" content="noindex" />';

const fallback = html
  .replace(/<base[^>]*>/i, '')
  .replace('</head>', `  ${baseTag}\n  ${robots}\n</head>`);

writeFileSync(resolve(dist, '404.html'), fallback, 'utf8');
writeFileSync(resolve(dist, '200.html'), fallback, 'utf8');

// ".nojekyll" stops GitHub Pages from hiding files that start with an
// underscore. Written here so a fresh clone cannot forget it.
writeFileSync(resolve(dist, '.nojekyll'), '', 'utf8');

console.log(`build-404: wrote 404.html, 200.html and .nojekyll (base ${base})`);
