# NEIBOURLY

A Nepal-first community board for reciprocal help. Ask for something your
neighbours can do, offer something you can do, and find both ranked by how close
they are to you.

**Live site:** <https://rabingaire567-coder.github.io/NEIBOURLY/>

---

## What it is

NEIBOURLY is a bilingual (English / नेपाली), offline-first static web app. There is
no account system and no server database. Everything a visitor creates is stored in
that visitor's own browser.

| Area | What it does |
| --- | --- |
| **Ask** | Requests for tutoring, work, tools, blood, transport, help |
| **Offer** | Skills, goods, time, free help, items to give away |
| **Discover** | Ask + Offer mixed, sorted by distance and freshness |
| **Community** | Notices, events, lost and found, alerts |
| **Explore** | All 7 provinces, 77 districts, 753 local levels, 6,743 wards |
| **Services** | Verified public services with the official source linked |
| **Assistant** | Offline reference answers, optionally grounded with Gemini |

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check, bundle, and write `404.html` / `200.html` / `.nojekyll` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc` only |
| `npm run lint` | oxlint over `src`, `server`, `scripts` |
| `npm test` | Vitest suite (48 tests) |
| `npm run server` | Optional Node host with a Gemini proxy |
| `npm run zip` | Write `../NEIBOURLY.zip` |

Requires Node 20 or newer. On Windows, use `npm.cmd` if PowerShell blocks
`npm.ps1`.

---

## Data and provenance

### Administrative structure

| Level | Count |
| --- | --- |
| Provinces | 7 |
| Districts | 77 |
| Local levels | 753 |
| — Metropolitan cities | 6 |
| — Sub-metropolitan cities | 11 |
| — Municipalities | 276 |
| — Rural municipalities | 460 |
| Wards | 6,743 |

Names, local level types, ward counts and official websites come from
[`data-de-nepal`](https://www.npmjs.com/package/data-de-nepal) (MIT), which mirrors
the Local Government Resource Management System listing of the Ministry of Local
Government. `npm test` asserts these totals so a bad regeneration fails the build
rather than shipping quietly.

### Coordinates

Centroids are computed from
[DDGN high-resolution administrative boundary polygons](https://data.gov.np/).
They are **area-weighted representative points**, used only to rank "nearby". They
are not addresses and are never shown as a location a person lives at.

One local level (`Bardiya / Basgadhi Municipality`) has no derivable centroid
because its published boundary is not usable as a polygon. Distance ranking falls
back to the district centroid for that one unit, so the feature keeps working.

### Emergency and civic references

Every service in `src/data/services.ts` links to its official source rather than
restating a procedure that can change:

- Nepal Police emergency contacts — <https://nepalpolice.gov.np/stations/emergency-contacts/>
- Nagarik App — <https://nagarikapp.gov.np/>
- LGRMS local government directory — <https://lgrms.gov.np/>

Shortcodes: police **100**, fire **101**, ambulance **102**, traffic **103**,
child helpline **1098**, women's helpline **1145**, armed police **1114**, civil
registration **1147**. Tests fail if a service ever quotes a number outside that
published set.

### Demo content

`src/data/seed.ts` ships illustrative posts. Every one is marked `demo: true` and
renders a demo badge, so it can never be mistaken for a real neighbour. Names,
contacts and vote counts are invented.

---

## AI setup

NEIBOURLY works fully offline with no key. The assistant answers from a built-in
reference covering emergency numbers, paperwork, water/roads/garbage, your selected
local level, and what is posted near you.

To enable Gemini, get a free key from
[Google AI Studio](https://aistudio.google.com/apikey) and paste it into
**Settings → Assistant**. The key:

- is stored in your browser only,
- is sent from your browser directly to Google's endpoint,
- is never part of the app build, and
- can be removed at any time.

### Optional server proxy

If you would rather not paste a key into a browser, run your own host:

```bash
$env:GEMINI_API_KEY = "your-key"
npm run build
npm run server      # http://localhost:8787
```

This serves `dist/` and proxies `POST /api/gemini`. It is entirely optional and is
not deployed with the GitHub Pages site.

### Constraints given to the model

- Only NEIBOURLY's reference data, your selected area and your nearby posts are
  provided. It cannot browse.
- Instructed never to invent a phone number, fee, opening time or procedure.
- Instructed to point you to the ward office and its published citizen charter for
  anything local.
- Instructed never to request or repeat national ID numbers, passport numbers,
  bank details or a precise address.
- If the key is invalid or rate-limited, the offline answer is shown instead of an
  error.

---

## Privacy and safety

- No accounts, no backend, no analytics, no tracking.
- Local data lives under the `neibourly:v1` localStorage namespace.
- **Settings → Privacy → Clear local data** removes every owned key exactly.
- App text is rendered with an escaping Markdown renderer; model output is escaped
  before any HTML insertion.

Safety rules are surfaced in the post composer, Profile and Settings rather than
buried: never post a national ID number, passport number, bank details or a full
home address; keep phone numbers out of titles and use in-app replies; meet in
public.

---

## Accessibility

- Skip-to-content link, visible focus rings, labelled controls.
- Full keyboard support, including a focus-trapped dialog with Escape handling.
- `aria-live` regions for search results, toasts and assistant replies.
- Respects `prefers-reduced-motion`, and offers an explicit reduce-motion setting.
- Contrast designed for AA in light and dark themes.

---

## Deploying to GitHub Pages

`.github/workflows/pages.yml` builds and publishes on every push to `main`.

Deep links work because the build copies the SPA entry to `404.html` and `200.html`,
and `vite.config.ts` sets `base: './'` so assets resolve under a project sub-path.

---

## Project layout

```
src/
  components/   Icons, ui primitives, Navbar, PostCard, LocationPicker, GeoTotals
  data/         nepal-geo.ts (generated), categories, services, seed
  layouts/      AppLayout
  lib/          store, storage, geo, i18n, format, ai, knowledge
  pages/        Home, Ask/Offer board, Community, Discover, PostDetail,
                NewPost, Assistant, Services, Explore, Settings, Profile, About
  styles/       tokens, base, components
  test/         geo, storage, data and assistant suites
scripts/        build-404.mjs, make-zip.mjs
server/         index.js (optional Gemini proxy + static host)
```

---

## What this is not

NEIBOURLY is not a government body, not a bank, not an ambulance service and not a
legal adviser. It is a community project. Where it points you to an office, that
office is the authority.

## Licence

MIT — see [LICENSE](LICENSE).

The generated administrative data is derived from MIT-licensed sources credited in
`src/data/nepal-geo.ts`. Official names and ward counts are facts about Nepal's
local government structure.
