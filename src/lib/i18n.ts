import type { Lang } from '@/types';

type Dict = Record<string, string>;

/** Interface strings. Anything shown inside post content stays as authored. */
const STRINGS: Record<Lang, Dict> = {
  en: {
    'nav.ask': 'Ask',
    'nav.offer': 'Offer',
    'nav.discover': 'Discover',
    'nav.community': 'Community',
    'nav.assistant': 'Assistant',
    'nav.services': 'Services',
    'nav.explore': 'Explore',
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.close': 'Close',

    'action.post': 'Post',
    'action.share': 'Share',
    'action.help': 'I can help',
    'action.respond': 'Respond',
    'action.clearFilters': 'Clear filters',
    'action.loadMore': 'Load more',
    'action.signIn': 'Sign in',
    'action.readMore': 'Read more',
    'action.back': 'Back',

    'filter.nearby': 'Nearby',
    'filter.category': 'Category',
    'filter.distance': 'Distance',
    'filter.within': 'Within',
    'filter.all': 'All',

    'post.demo': 'Demo',
    'post.votes': 'Helpful',
    'post.replies': 'replies',
    'post.by': 'by',

    'place.choose': 'Choose your area',
    'place.set': 'Set area',
    'place.changed': 'Area updated',

    'empty.noPosts': 'Nothing here yet',
    'empty.noPostsText': 'Be the first to post in this area.',
    'empty.noResults': 'No results',
    'empty.noResultsText': 'Try a different word, or clear your filters.',
  },
  ne: {
    'nav.ask': 'सहयोग माग्नुहोस्',
    'nav.offer': 'सहयोग दिनुहोस्',
    'nav.discover': 'खोज्नुहोस्',
    'nav.community': 'समुदाय',
    'nav.assistant': 'सहायक',
    'nav.services': 'सेवाहरू',
    'nav.explore': 'अध्ययन',
    'nav.home': 'गृहपृष्ठ',
    'nav.menu': 'मेनु',
    'nav.close': 'बन्द गर्नुहोस्',

    'action.post': 'पोस्ट गर्नुहोस्',
    'action.share': 'साझा गर्नुहोस्',
    'action.help': 'सहयोग गर्न सक्छु',
    'action.respond': 'जवाफ दिनुहोस्',
    'action.clearFilters': 'फिल्टर हटाउनुहोस्',
    'action.loadMore': 'थप हेर्नुहोस्',
    'action.signIn': 'साइन इन',
    'action.readMore': 'पूरा पढ्नुहोस्',
    'action.back': 'पछाडि',

    'filter.nearby': 'नजिकै',
    'filter.category': 'श्रेणी',
    'filter.distance': 'दूरी',
    'filter.within': 'भित्र',
    'filter.all': 'सबै',

    'post.demo': 'डेमो',
    'post.votes': 'उपयोगी',
    'post.replies': 'जवाफ',
    'post.by': 'द्वारा',

    'place.choose': 'आफ्नो क्षेत्र छान्नुहोस्',
    'place.set': 'क्षेत्र सेट गर्नुहोस्',
    'place.changed': 'क्षेत्र अद्यावधिक भयो',

    'empty.noPosts': 'अहिलेसम्म केही छैन',
    'empty.noPostsText': 'यस क्षेत्रमा पहिलो पोस्ट गर्नुहोस्।',
    'empty.noResults': 'कुनै नतिजा छैन',
    'empty.noResultsText': 'अर्को शब्द प्रयास गर्नुहोस् वा फिल्टर हटाउनुहोस्।',
  },
};

export function translator(lang: Lang) {
  return (key: keyof typeof STRINGS.en | string): string => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}

export type T = ReturnType<typeof translator>;
