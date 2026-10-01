import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { BoardPage } from '@/pages/BoardPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NewPostPage } from '@/pages/NewPostPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { ProfilePage, AboutPage } from '@/pages/ProfilePage';
import { NotFoundPage, ErrorPage } from '@/pages/NotFoundPage';

/** Catches render errors so a bad post cannot blank the whole app. */
class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NEIBOURLY render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) return <ErrorPage />;
    return this.props.children;
  }
}

export function App() {
  return (
    <Boundary>
      <StoreProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="ask" element={<BoardPage kind="ask" />} />
            <Route path="offer" element={<BoardPage kind="offer" />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="new" element={<NewPostPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />

            {/* Board-relative detail links keep the board context in the URL. */}
            <Route path="ask/:id" element={<PostDetailPage />} />
            <Route path="offer/:id" element={<PostDetailPage />} />
            <Route path="community/:id" element={<PostDetailPage />} />
            <Route path="post/:id" element={<PostDetailPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StoreProvider>
    </Boundary>
  );
}
