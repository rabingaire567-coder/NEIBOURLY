import type { Category, CategoryId } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'education',
    label: 'Education',
    labelNp: 'शिक्षा',
    icon: 'book',
    hint: 'Tuition, exam help, study materials, admissions',
  },
  {
    id: 'health',
    label: 'Health',
    labelNp: 'स्वास्थ्य',
    icon: 'heart',
    hint: 'Hospitals, clinics, medicines, mental health, blood donors',
  },
  {
    id: 'documents',
    label: 'Documents',
    labelNp: 'कागजात',
    icon: 'doc',
    hint: 'Citizenship, passport, licence, PAN, scholarship forms',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    labelNp: 'आपतकाल',
    icon: 'siren',
    hint: 'Urgent help needed right now',
  },
  {
    id: 'lostfound',
    label: 'Lost & found',
    labelNp: 'हराएको/भेटिएको',
    icon: 'search',
    hint: 'Lost items, stray animals, found belongings',
  },
  {
    id: 'transport',
    label: 'Transport',
    labelNp: 'यातायात',
    icon: 'bus',
    hint: 'Rides, cargo, route and road information',
  },
  {
    id: 'jobs',
    label: 'Work',
    labelNp: 'रोजगारी',
    icon: 'bag',
    hint: 'Jobs, daily wage work, internships, referrals',
  },
  {
    id: 'skills',
    label: 'Skills',
    labelNp: 'सीप',
    icon: 'tool',
    hint: 'Repair, plumbing, electrical, tailoring, driving',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    labelNp: 'स्वयंसेवा',
    icon: 'hand',
    hint: 'Free help, blood donation, community work',
  },
  {
    id: 'civic',
    label: 'Civic',
    labelNp: 'नागरिक',
    icon: 'gov',
    hint: 'Ward office, municipality, complaints, water and roads',
  },
  {
    id: 'events',
    label: 'Events',
    labelNp: 'कार्यक्रम',
    icon: 'calendar',
    hint: 'Festivals, classes, meetings, sports',
  },
  {
    id: 'market',
    label: 'Market',
    labelNp: 'बजार',
    icon: 'tag',
    hint: 'Buying, selling, renting, second-hand',
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const categoryLabel = (id: CategoryId, lang: 'en' | 'ne' = 'en'): string =>
  lang === 'ne' ? CATEGORY_MAP[id].labelNp : CATEGORY_MAP[id].label;

/** Search tokens that a Nepali user would type for each category. */
export const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  education: ['tutor', 'tuition', 'padhai', 'study', 'exam', 'school', 'college', 'scholarship', 'grade', 'subject', 'homework', 'sirsha'],
  health: ['doctor', 'hospital', 'clinic', 'medicine', 'drug', 'blood', 'rakt', 'fever', 'mental', 'vaccine', 'checkup', 'aamale'],
  documents: ['citizenship', 'nagarikta', 'passport', 'licence', 'license', 'pan', 'form', 'kagajat', 'certificate', 'apply', 'renew', 'nagarik app'],
  emergency: ['emergency', 'urgent', 'rescue', 'ambulance', 'aapat', 'help now', 'critical', 'injured', 'accident', 'fire'],
  lostfound: ['lost', 'found', 'haryaeko', 'bhetiyeko', 'missing', 'wallet', 'phone', 'key', 'dog', 'cat', 'bag'],
  transport: ['ride', 'taxi', 'bus', 'cargo', 'taxi', 'path', 'road', 'sadak', 'gaadi', 'driver', 'luggage', 'delivery'],
  jobs: ['job', 'kaam', 'work', 'daily wage', 'rozgaari', 'internship', 'vacancy', 'chance', 'opening'],
  skills: ['repair', 'plumber', 'electric', 'tailor', 'driver', 'carpenter', 'skill', 'sarp', 'repair garne', 'mason'],
  volunteer: ['volunteer', 'free', 'swayamsewa', 'blood donation', 'rakt dan', 'help others', 'seva', 'donate'],
  civic: ['ward', 'municipality', 'palika', 'complaint', 'water', 'pani', 'road', 'tax', 'document', 'office', 'nagarik', 'batti', 'garbage', 'kuthi'],
  events: ['event', 'festival', 'tihar', 'dasain', 'class', 'meeting', 'sports', 'match', 'program', 'yatra', 'concert'],
  market: ['buy', 'sell', 'rent', 'for sale', 'kharid', 'bech', 'kirana', 'price', 'second hand'],
};