export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'ne';

/** What a post is. Drives routing, filters and the Ask/Offer/Community split. */
export type PostKind = 'ask' | 'offer' | 'post';

export type CategoryId =
  | 'education'
  | 'health'
  | 'documents'
  | 'emergency'
  | 'lostfound'
  | 'transport'
  | 'jobs'
  | 'skills'
  | 'volunteer'
  | 'civic'
  | 'events'
  | 'market';

export interface Category {
  id: CategoryId;
  /** English label. */
  label: string;
  /** Nepali label - shown when the interface is in Nepali. */
  labelNp: string;
  icon: string;
  /** One line explaining when to use this category. */
  hint: string;
}

export interface Place {
  provinceId: number;
  districtId: number;
  lgId: number;
  ward?: number;
}

export type PlaceInput = Place;

export interface Author {
  name: string;
  /** Initials shown in the avatar. */
  initials: string;
  ward?: number;
  /** Free-text neighbourhood or landmark, never a precise address. */
  area?: string;
}

export interface Post {
  id: string;
  kind: PostKind;
  category: CategoryId;
  title: string;
  /** Devanagari title, shown in Nepali mode. */
  titleNp?: string;
  body: string;
  place: Place;
  author: Author;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO date the post stops being relevant, e.g. an event. */
  endsAt?: string;
  /** Open call for help. Only meaningful for `ask` and `offer`. */
  lookingFor?: string;
  contact?: string;
  /** Marked by the author as needing help right now. */
  urgent?: boolean;
  /** Community votes. Seeded values are clearly labelled demo numbers. */
  votes: number;
  /** Set when the user reacted from this browser. */
  reacted?: boolean;
  /** True for the bundled demo seed, false for anything the user created. */
  demo: boolean;
  /** Replies, seeded in demo data. */
  replies?: Reply[];
}

export interface Reply {
  id: string;
  author: Author;
  body: string;
  createdAt: string;
  demo: boolean;
}

export type Urgency = 'normal' | 'urgent' | 'critical';

export interface ServiceItem {
  id: string;
  name: string;
  nameNp?: string;
  category: string;
  /** Government or institutional source, shown as the provenance line. */
  source: string;
  sourceUrl?: string;
  note: string;
  /** Nationwide shortcode, when one exists. */
  national?: string;
}

export interface AppSettings {
  theme: Theme;
  lang: Lang;
  /** Only show posts inside this area when set. */
  scope: Place | null;
  radiusKm: number;
  showUrgentOnly: boolean;
  reduceMotion: boolean;
  denseCards: boolean;
}

export interface Profile {
  name: string;
  area: string;
  ward?: number;
  place: Place | null;
  /** Categories the person cares about, used to rank their feed. */
  interests: CategoryId[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
  read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  tone: 'default' | 'ok' | 'danger';
}

export type AssistantRole = 'user' | 'assistant';

export interface AssistantSource {
  label: string;
  href?: string;
}

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  text: string;
  /** Present on assistant messages only. */
  sources?: AssistantSource[];
  /** 'cloud' when Gemini answered, 'offline' for the local knowledge base. */
  origin?: 'cloud' | 'offline';
  createdAt: string;
}

export type AssistantStatus = 'idle' | 'thinking' | 'error';

export interface SavedItem {
  key: string;
  label: string;
  href: string;
  createdAt: string;
}