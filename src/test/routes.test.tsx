import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { BoardPage } from '@/pages/BoardPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AboutPage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function renderAt(path: string) {
  return renderToStaticMarkup(
    <StoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="ask" element={<BoardPage kind="ask" />} />
            <Route path="offer" element={<BoardPage kind="offer" />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="community/:id" element={<PostDetailPage />} />
            <Route path="post/:id" element={<PostDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </StoreProvider>,
  );
}

const ROUTES = [
  '/',
  '/ask',
  '/offer',
  '/community',
  '/discover',
  '/community/seed-ask-1',
  '/post/seed-offer-1',
  '/services',
  '/explore',
  '/settings',
  '/profile',
  '/about',
  '/this-route-does-not-exist',
];

describe('every route renders without throwing', () => {
  for (const path of ROUTES) {
    it(`renders ${path}`, () => {
      const html = renderAt(path);
      expect(html.length).toBeGreaterThan(200);
      expect(html).toContain('NEIBOURLY');
    });
  }
});

describe('routes show their own content', () => {
  it('home mentions asking and offering', () => {
    const html = renderAt('/');
    expect(html.toLowerCase()).toContain('ask');
    expect(html.toLowerCase()).toContain('offer');
  });

  it('a board page lists a demo post', () => {
    expect(renderAt('/ask')).toContain('Grade 8 maths tuition');
  });

  it('post detail shows the post body', () => {
    expect(renderAt('/community/seed-ask-1')).toContain('patient maths tutor');
  });

  it('an unknown post id does not crash', () => {
    expect(renderAt('/post/does-not-exist')).toContain('NEIBOURLY');
  });

  it('explore reports the audited totals', () => {
    const html = renderAt('/explore');
    expect(html).toContain('753');
    expect(html).toContain('6,743');
  });

  it('services lists the police shortcode', () => {
    expect(renderAt('/services')).toContain('100');
  });

  it('not found page explains itself', () => {
    expect(renderAt('/nope')).toContain('does not exist');
  });
});
