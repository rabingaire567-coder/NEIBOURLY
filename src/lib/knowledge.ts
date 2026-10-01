import { SERVICES, SERVICE_TIPS } from '@/data/services';
import { GEO_TOTALS, addressLine, getLocalLevel, labelFor } from '@/lib/geo';
import type { PlaceInput } from '@/lib/geo';
import type { Post } from '@/types';

/**
 * Deterministic offline assistant.
 *
 * This runs with no network and no API key. It answers the questions NEIBOURLY
 * can actually answer from its own reference data - emergency shortcodes, the
 * official sources, what local level the visitor is in, and what is happening
 * nearby - and says plainly when a question needs a person.
 *
 * When the visitor supplies a Gemini key the same intents are still available;
 * see `src/lib/ai.ts`, which uses this module as the grounding context.
 */

export interface OfflineAnswer {
  text: string;
  sources: { label: string; href?: string }[];
  followUp: string[];
}

const SERVICES_BY_ID = new Map(SERVICES.map((s) => [s.id, s]));

const serviceLine = (id: string): string => {
  const s = SERVICES_BY_ID.get(id);
  if (!s) return '';
  return s.national ? `**${s.name}**: dial ${s.national}. ${s.note}` : `**${s.name}**: ${s.note}`;
};

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

const bullets = (items: string[]) => items.filter(Boolean).map((i) => `- ${i}`).join('\n');

const EMERGENCY_STEPS = [
  serviceLine('police'),
  serviceLine('ambulance'),
  serviceLine('fire'),
  'Keep the person still and note the time the problem started.',
  'If you are the one calling, stay on the line and describe the nearest landmark, not a house number.',
];

const DOCUMENT_STEPS = [
  SERVICE_TIPS.documents,
  'Nagarik App (nagarikapp.gov.np) shows application status and accepts complaints for many services.',
  serviceLine('ward-office'),
  serviceLine('nid'),
];

const CIVIC_STEPS = [
  SERVICE_TIPS.civic,
  'Your local level publishes its own citizen charter and contact page: ' +
    'search for your ward on lgrms.gov.np.',
  'Nagarik App is the official channel for submitting a complaint and tracking it.',
];

const HEALTH_STEPS = [
  SERVICE_TIPS.health,
  'For an emergency, ambulance is 102 and police is 100.',
  'Blood donation requests go through the district Red Cross blood bank, not through individuals.',
];

const EDUCATION_STEPS = [
  SERVICE_TIPS.education,
  'For admission, fees and results, the school or campus administration office is the only official source.',
  'NEIBOURLY can help you find a tutor or study partner nearby through the Ask board.',
];

const POSTING_STEPS = [
  'Pick a board: **Ask** when you need something, **Offer** when you can give something.',
  'Choose a category so the right neighbours see it.',
  'Add the area. Ward number helps, and never post a precise address or national ID number.',
  'Posting stays in this browser on this device. To share it, use the Share button and send the link.',
];

const ABOUT_TEXT = [
  'NEIBOURLY is a notice board for your own local level in Nepal, not a national directory.',
  `Every post is attached to a real unit: ${GEO_TOTALS.provinces} provinces, ${GEO_TOTALS.districts} districts, ${GEO_TOTALS.localLevels} local levels, ${GEO_TOTALS.wards} wards.`,
  'Asks and offers are two views of the same board, so a request and a reply to that request sit next to each other.',
  'There is no account and no central database. What you post is stored in this browser, so treat the device as your copy of the board.',
];

const FALLBACK_TEXT = [
  'I can answer this from NEIBOURLY without an internet connection for:',
  bullets([
    'emergency numbers and what to do first',
    'citizenship, passport, national ID and ward paperwork',
    'water, roads, street lights and garbage',
    'which local level you have selected',
    'what is posted near you',
    'how to post an ask or an offer',
  ]),
  'Anything else - medical advice, legal advice, or a specific office\'s current fee - needs a person. Ask at the ward office, or check the official site linked in Services.',
].join('\n\n');

export interface KnowledgeContext {
  place?: PlaceInput | null;
  posts: Post[];
}

/** Answer from reference data only. Never guesses, never invents a number. */
export function answerOffline(question: string, ctx: KnowledgeContext): OfflineAnswer {
  const q = question.toLowerCase().trim();
  const place = ctx.place ?? null;

  if (!q) {
    return { text: 'Ask me a question.', sources: [], followUp: ['Emergency numbers', 'How do I post an ask?'] };
  }

  // Emergency always wins, whatever else is asked.
  if (has(q, 'emergency', 'urgent', 'ambulance', 'police', 'accident', 'fire', 'injur', 'hurt', 'bleed', 'unconscious', 'emergency number', 'आपतकाल', 'एम्बुलेन्स', 'प्रहरी', 'दमकल')) {
    return {
      text: `**First: dial the number.** In an emergency do not wait for a message to be answered.\n\n${bullets(EMERGENCY_STEPS)}\n\n${serviceLine('women')}\n${serviceLine('child')}`,
      sources: [
        { label: 'Nepal Police emergency contacts', href: 'https://nepalpolice.gov.np/stations/emergency-contacts/' },
      ],
      followUp: ['How do I report to a ward office?', 'Where is the nearest hospital?'],
    };
  }

  if (has(q, 'citizen', 'passport', 'licence', 'license', 'pan ', 'national id', 'document', 'form', 'apply', 'certificate', 'scholarship', 'e-learning', 'nagarikta', 'नागरिकता', 'राहदानी', 'कागजात')) {
    return {
      text: `**Where paperwork actually starts**\n\n${bullets(DOCUMENT_STEPS)}`,
      sources: [
        { label: 'Nagarik App', href: 'https://nagarikapp.gov.np/' },
        { label: 'Local Government Resource Management System', href: 'https://lgrms.gov.np/' },
      ],
      followUp: ['How do I complain to my ward?', 'Where do I find my local level website?'],
    };
  }

  if (has(q, 'water', 'road', 'street light', 'garbage', 'waste', 'drain', 'complaint', 'ward office', 'municipality', 'बत्ती', 'पानी', 'सडक', 'फोहोर', 'वडा')) {
    const where = place ? `You have set your area to **${labelFor(place, 'en', true).full}**.` : 'Set your area in Settings for the exact local level contact.';
    return {
      text: `**Who to contact about local services**\n\n${where}\n\n${bullets(CIVIC_STEPS)}`,
      sources: [{ label: 'LGRMS local government directory', href: 'https://lgrms.gov.np/' }],
      followUp: ['How do I post a complaint in my area?', 'What is my local level?'],
    };
  }

  if (has(q, 'health', 'doctor', 'hospital', 'medicine', 'blood', 'fever', 'clinic', 'mental health', 'vaccine', 'स्वास्थ्य', 'अस्पताल', 'रगत')) {
    return {
      text: `**Starting from the closest health post**\n\n${bullets(HEALTH_STEPS)}`,
      sources: [{ label: 'Nepal Police emergency contacts', href: 'https://nepalpolice.gov.np/stations/emergency-contacts/' }],
      followUp: ['Where is the nearest hospital to me?', 'How do I post an ask?'],
    };
  }

  if (has(q, 'school', 'college', 'admission', 'tuition', 'tutor', 'exam', 'study', 'result', 'board', 'शिक्षा', 'फर्म', 'तोकिएको')) {
    return {
      text: `**School and campus questions**\n\n${bullets(EDUCATION_STEPS)}`,
      sources: [{ label: 'Office of the Controller of Examinations', href: 'https://www.oce.gov.np/' }],
      followUp: ['Who is offering tuition near me?', 'How do I post an offer?'],
    };
  }

  if (has(q, 'nearby', 'near me', 'my area', 'what is happening', 'posts', 'kasa', 'छैन', 'छैनन्', 'मेरो ठाउँ')) {
    const lg = place ? getLocalLevel(place.lgId) : undefined;
    const local = ctx.posts.filter((p) => place && p.place.lgId === place.lgId);
    const offers = local.filter((p) => p.kind === 'offer');
    const asks = local.filter((p) => p.kind === 'ask');
    const lines = local.slice(0, 5).map((p) => `- ${p.title} (${p.kind === 'offer' ? 'offer' : p.kind === 'ask' ? 'ask' : 'notice'})`);
    return {
      text: `**${place ? labelFor(place, 'en', true).full : 'No area set'}**\n\n${
        lg
          ? `Local level: ${lg.name}, ${lg.wards} wards.`
          : 'Set your area in Settings so answers can be specific to your local level.'
      }\n\n${
        local.length
          ? `${offers.length} offers and ${asks.length} asks are posted here.\n\n${bullets(lines)}\n\nOpen the Discover tab to see all of them.`
          : 'Nothing is posted in this exact local level yet. Widen the distance filter in Discover, or post the first one.'
      }`,
      sources: [],
      followUp: ['How do I post an ask?', 'Where do I find my ward office?'],
    };
  }

  if (has(q, 'where am i', 'which district', 'which province', 'my location', 'what is my', 'म कहाँ', 'कुन जिल्ला', 'कुन स्थान')) {
    const where = place
      ? addressLine(place)
      : 'You have not set an area yet. Open Settings and choose your local level.';
    const lg = place ? getLocalLevel(place.lgId) : undefined;
    return {
      text: `**Your selected area**\n\n${where}\n\n${
        lg
          ? `${lg.name} is a ${lg.type === 'rural' ? 'rural municipality' : lg.type} with ${lg.wards} wards. Official site: ${lg.site}`
          : 'Choosing a local level also filters the Ask, Offer and Discover boards to that unit and everything under it.'
      }`,
      sources: place && lg ? [{ label: `${lg.name} official website`, href: lg.site }] : [],
      followUp: ['What is posted near me?', 'How do I post an ask?'],
    };
  }

  if (has(q, 'post', 'write', 'create', 'add an ask', 'add an offer', 'how do i use', 'how does this work', 'what is neibourly', 'what is this', 'help me use', 'पोस्ट', 'कसरी')) {
    if (has(q, 'emergency') || has(q, 'urgent')) {
      return {
        text: `**Post an urgent ask**\n\n${bullets(POSTING_STEPS)}\n\nIn a real emergency dial ${SERVICES_BY_ID.get('police')?.national} rather than posting. A post is read by neighbours when they open the app.`,
        sources: [{ label: 'Nepal Police emergency contacts', href: 'https://nepalpolice.gov.np/stations/emergency-contacts/' }],
        followUp: ['What numbers do I call?', 'How do I post an offer?'],
      };
    }
    return {
      text: `**How NEIBOURLY works**\n\n${bullets(ABOUT_TEXT)}\n\n**To post**\n\n${bullets(POSTING_STEPS)}`,
      sources: [{ label: 'LGRMS local government directory', href: 'https://lgrms.gov.np/' }],
      followUp: ['What is my local level?', 'Who is offering help near me?'],
    };
  }

  if (has(q, 'offer', 'i can help', 'give', 'donate', 'दिनुहोस्', 'सहयोग')) {
    return {
      text: `**Posting an offer**\n\n${bullets([
        'Choose **Offer** so people looking for help see it.',
        'Say what you can do, when you are free, and what you charge (or that it is free).',
        'Mention the area or ward. Do not put your phone number in the title.',
        serviceLine('nid'),
      ])}`,
      sources: [{ label: 'LGRMS local government directory', href: 'https://lgrms.gov.np/' }],
      followUp: ['How do I post an ask?', 'Who is asking near me?'],
    };
  }

  if (has(q, 'o2', 'internet', 'wifi', 'network', 'offline', 'install', 'app')) {
    return {
      text: `**Offline and installation**\n\n- NEIBOURLY works without a connection for everything already on screen, including this assistant.\n- Your area, posts and saved items are stored in this browser on this device.\n- The Gemini answer needs a connection and your own free API key; without a key this offline answer is used.\n- To install it, open the browser menu and choose "Add to Home screen".`,
      sources: [{ label: 'Google AI Studio keys', href: 'https://aistudio.google.com/apikey' }],
      followUp: ['How do I add an API key?', 'Where is my data stored?'],
    };
  }

  if (has(q, 'data', 'privacy', 'stored', 'safe', 'account', 'server', 'डाटा', 'गोपनीय')) {
    return {
      text: `**Where your data is**\n\n- Posts, area, profile and saved items are stored in this browser only. NEIBOURLY has no server database and no account.\n- Nothing is uploaded unless you type a Gemini API key and send a question to the assistant.\n- An API key is optional and can be removed at any time in Settings.`,
      sources: [{ label: 'Google AI Studio keys', href: 'https://aistudio.google.com/apikey' }],
      followUp: ['How do I add an API key?', 'How do I clear my data?'],
    };
  }

  return {
    text: FALLBACK_TEXT,
    sources: [],
    followUp: ['What are the emergency numbers?', 'How do I post an ask?', 'What is posted near me?'],
  };
}

/** Starter questions shown before the visitor has typed anything. */
export const SUGGESTIONS = [
  'What are the emergency numbers?',
  'How do I get a citizenship certificate?',
  'Who is offering help near me?',
  'How do I post an ask?',
  'How do I complain to my ward?',
];
