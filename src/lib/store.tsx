import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { SEED_POSTS } from '@/data/seed';
import { CATEGORY_KEYWORDS } from '@/data/categories';
import { nearbySort } from '@/lib/geo';
import type { PlaceInput } from '@/lib/geo';
import { clearAll, readJson, storageKey, uid, writeJson } from '@/lib/storage';
import { translator } from '@/lib/i18n';
import type { T } from '@/lib/i18n';
import type {
  CategoryId,
  Post,
  PostKind,
  Reply,
  SavedItem,
  Toast,
  AppSettings,
  Profile,
} from '@/types';

/* ==========================================================================
   State
   ========================================================================== */

interface State {
  posts: Post[];
  settings: AppSettings;
  profile: Profile;
  saved: SavedItem[];
  seenIntro: boolean;
}

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'post/add'; post: Post }
  | { type: 'post/remove'; id: string }
  | { type: 'post/toggleVote'; id: string }
  | { type: 'post/reply'; id: string; reply: Reply }
  | { type: 'post/markResolved'; id: string }
  | { type: 'settings/patch'; patch: Partial<AppSettings> }
  | { type: 'profile/patch'; patch: Partial<Profile> }
  | { type: 'saved/add'; item: SavedItem }
  | { type: 'saved/remove'; key: string }
  | { type: 'seenIntro' }
  | { type: 'reset' };

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  lang: 'en',
  scope: null,
  radiusKm: 25,
  showUrgentOnly: false,
  reduceMotion: false,
  denseCards: false,
};

const DEFAULT_PROFILE: Profile = {
  name: '',
  area: '',
  place: null,
  interests: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state };
    case 'post/add':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'post/remove':
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) };
    case 'post/toggleVote':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id
            ? { ...p, reacted: !p.reacted, votes: Math.max(0, p.votes + (p.reacted ? -1 : 1)) }
            : p,
        ),
      };
    case 'post/reply':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id ? { ...p, replies: [...(p.replies ?? []), action.reply] } : p,
        ),
      };
    case 'post/markResolved':
      return { ...state, posts: state.posts.map((p) => (p.id === action.id ? { ...p, reacted: true } : p)) };
    case 'settings/patch':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'profile/patch':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'saved/add':
      return { ...state, saved: [action.item, ...state.saved.filter((s) => s.key !== action.item.key)] };
    case 'saved/remove':
      return { ...state, saved: state.saved.filter((s) => s.key !== action.key) };
    case 'seenIntro':
      return { ...state, seenIntro: true };
    case 'reset':
      return { ...state, posts: SEED_POSTS, saved: [], settings: DEFAULT_SETTINGS, profile: DEFAULT_PROFILE };
    default:
      return state;
  }
}

/* ==========================================================================
   Store
   ========================================================================== */

export interface FeedFilters {
  kind?: PostKind | 'all';
  categories?: CategoryId[];
  query?: string;
  scope?: PlaceInput | null;
  radiusKm?: number;
  urgentOnly?: boolean;
}

interface StoreValue extends State {
  t: T;
  dispatch: (a: Action) => void;
  toasts: Toast[];
  notify: (message: string, tone?: Toast['tone']) => void;
  createPost: (input: NewPostInput) => Post;
  deletePost: (id: string) => void;
  toggleVote: (id: string) => void;
  reply: (id: string, body: string) => void;
  toggleSaved: (item: SavedItem) => void;
  isSaved: (key: string) => boolean;
  setScope: (place: PlaceInput | null) => void;
  clearData: () => void;
  /** Posts from this browser plus the demo seed, newest first. */
  allPosts: Post[];
  myPosts: Post[];
  filterPosts: (f: FeedFilters) => Post[];
  findPost: (id: string) => Post | undefined;
  counts: Record<'ask' | 'offer' | 'post', number>;
}

export interface NewPostInput {
  kind: PostKind;
  category: CategoryId;
  title: string;
  body: string;
  place: PlaceInput;
  ward?: number;
  lookingFor?: string;
  contact?: string;
  urgent?: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    posts: SEED_POSTS,
    settings: DEFAULT_SETTINGS,
    profile: DEFAULT_PROFILE,
    saved: [],
    seenIntro: false,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const hydrated = useRef(false);

  // Hydrate from localStorage once, before first paint of real content.
  useEffect(() => {
    const userPosts = readJson<Post[]>('posts', []);
    const reactionIds = new Set(readJson<string[]>('reactions', []));
    dispatch({
      type: 'hydrate',
      state: {
        posts: [...userPosts, ...SEED_POSTS].map((p) => ({
          ...p,
          reacted: p.demo ? reactionIds.has(p.id) : undefined,
        })),
        settings: { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>('settings', {}) },
        profile: { ...DEFAULT_PROFILE, ...readJson<Partial<Profile>>('profile', {}) },
        saved: readJson<SavedItem[]>('saved', []),
        seenIntro: readJson<boolean>('seen-intro', false),
      },
    });
    hydrated.current = true;
  }, []);

  // Persist the slices a visitor can change, always local.
  useEffect(() => {
    if (!hydrated.current) return;
    writeJson('posts', state.posts.filter((p) => !p.demo));
  }, [state.posts]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeJson('settings', state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeJson('profile', state.profile);
  }, [state.profile]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeJson('saved', state.saved);
  }, [state.saved]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeJson('reactions', state.posts.filter((p) => p.reacted).map((p) => p.id));
  }, [state.posts]);

  // Apply theme and motion preference to the document root.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.settings.theme;
    root.lang = state.settings.lang === 'ne' ? 'ne' : 'en';
    const reduced =
      state.settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.motion = reduced ? 'reduced' : 'full';
  }, [state.settings.theme, state.settings.lang, state.settings.reduceMotion]);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    const id = uid('t');
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const allPosts = state.posts;
  const myPosts = useMemo(() => state.posts.filter((p) => !p.demo), [state.posts]);

  const findPost = useCallback((id: string) => state.posts.find((p) => p.id === id), [state.posts]);

  const counts = useMemo(
    () => ({
      ask: allPosts.filter((p) => p.kind === 'ask' && !p.reacted).length,
      offer: allPosts.filter((p) => p.kind === 'offer' && !p.reacted).length,
      post: allPosts.filter((p) => p.kind === 'post').length,
    }),
    [allPosts],
  );

  const filterPosts = useCallback(
    (f: FeedFilters): Post[] => {
      const q = (f.query ?? '').trim().toLowerCase();
      const scope = f.scope ?? state.settings.scope;
      const radius = f.radiusKm ?? state.settings.radiusKm;
      const urgentOnly = f.urgentOnly ?? state.settings.showUrgentOnly;

      const scored = allPosts.filter((p) => {
        if (f.kind && f.kind !== 'all' && p.kind !== f.kind) return false;
        if (f.categories?.length && !f.categories.includes(p.category)) return false;
        if (urgentOnly && !/urgent|emergency|now|today|आज|तुरुन्ते/i.test(`${p.title} ${p.body}`))
          return false;

        if (q) {
          const hay = [
            p.title,
            p.titleNp ?? '',
            p.body,
            p.author.name,
            p.author.area ?? '',
            p.contact ?? '',
            ...(CATEGORY_KEYWORDS[p.category] ?? []),
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (scope) {
          const { same, km } = nearbySort(scope, p.place);
          if (!same && (km === null || km > radius)) return false;
        }
        return true;
      });

      // Relevance order: same local level, then distance, then newest.
      const origin = scope ?? state.settings.scope ?? null;
      return scored.sort((a, b) => {
        const na = nearbySort(origin, a.place);
        const nb = nearbySort(origin, b.place);
        if (na.same !== nb.same) return na.same ? -1 : 1;
        if (na.km !== nb.km) return (na.km ?? Infinity) - (nb.km ?? Infinity);
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
    },
    [allPosts, state.settings.scope, state.settings.radiusKm, state.settings.showUrgentOnly],
  );

  const createPost = useCallback(
    (input: NewPostInput): Post => {
      const post: Post = {
        id: uid(input.kind === 'post' ? 'n' : input.kind === 'ask' ? 'a' : 'o'),
        kind: input.kind,
        category: input.category,
        title: input.title.trim(),
        body: input.body.trim(),
        place: input.place,
        author: {
          name: state.profile.name.trim() || 'Neighbour',
          initials: '',
          area: state.profile.area.trim() || undefined,
          ward: input.ward ?? state.profile.place?.ward,
        },
        createdAt: new Date().toISOString(),
        votes: 0,
        demo: false,
        ...(input.lookingFor ? { lookingFor: input.lookingFor.trim() } : {}),
        ...(input.contact ? { contact: input.contact.trim() } : {}),
        ...(input.urgent ? { urgent: true } : {}),
        replies: [],
      };
      post.author.initials = initials(post.author.name);
      dispatch({ type: 'post/add', post });
      return post;
    },
    [state.profile],
  );

  const deletePost = useCallback(
    (id: string) => {
      dispatch({ type: 'post/remove', id });
      notify('Post deleted from this browser', 'ok');
    },
    [notify],
  );

  const toggleVote = useCallback((id: string) => dispatch({ type: 'post/toggleVote', id }), []);

  const reply = useCallback(
    (id: string, body: string) => {
      const entry: Reply = {
        id: uid('r'),
        author: {
          name: state.profile.name.trim() || 'Neighbour',
          initials: initials(state.profile.name.trim() || 'Neighbour'),
          ward: state.profile.place?.ward,
          area: state.profile.area.trim() || undefined,
        },
        body: body.trim(),
        createdAt: new Date().toISOString(),
        demo: false,
      };
      dispatch({ type: 'post/reply', id, reply: entry });
      notify('Response added', 'ok');
    },
    [notify, state.profile],
  );

  const toggleSaved = useCallback((item: SavedItem) => {
    const exists = state.saved.some((s) => s.key === item.key);
    if (exists) dispatch({ type: 'saved/remove', key: item.key });
    else dispatch({ type: 'saved/add', item });
  }, [state.saved]);

  const isSaved = useCallback((key: string) => state.saved.some((s) => s.key === key), [state.saved]);

  const setScope = useCallback(
    (place: PlaceInput | null) => {
      dispatch({ type: 'settings/patch', patch: { scope: place } });
      if (place) {
        dispatch({ type: 'profile/patch', patch: { place: { ...place } } });
      }
      notify(place ? 'Your area is set' : 'Area filter cleared', 'ok');
    },
    [notify],
  );

  const clearData = useCallback(() => {
    clearAll();
    dispatch({ type: 'reset' });
    notify('Local data cleared', 'ok');
  }, [notify]);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      t: translator(state.settings.lang),
      dispatch,
      toasts,
      notify,
      createPost,
      deletePost,
      toggleVote,
      reply,
      toggleSaved,
      isSaved,
      setScope,
      clearData,
      allPosts,
      myPosts,
      filterPosts,
      findPost,
      counts,
    }),
    [
      state,
      toasts,
      notify,
      createPost,
      deletePost,
      toggleVote,
      reply,
      toggleSaved,
      isSaved,
      setScope,
      clearData,
      allPosts,
      myPosts,
      filterPosts,
      findPost,
      counts,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export { storageKey };
