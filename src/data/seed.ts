import { lgList } from '@/lib/geo';
import type { Post } from '@/types';

/**
 * Demo content bundled with the app.
 *
 * Every post below is clearly marked `demo: true` and is rendered with a demo
 * badge, so it can never be mistaken for a real neighbour. Names, contacts and
 * vote counts are invented for illustration. Real usage data comes from people
 * posting in their own browser; there is no server database.
 *
 * Locations point at real local levels so the geography, search and distance
 * ranking behave exactly as they will for a real post.
 */

const NOW = Date.now();
const day = 86_400_000;
const iso = (daysAgo: number, hour = 9) =>
  new Date(NOW - daysAgo * day + (hour - 12) * 3_600_000).toISOString();

/** Spelling in official listings varies ("Kageshwari-Manohara" vs "Kageshwori"). */
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

const LG_INDEX = new Map(lgList.map((l) => [normalise(l.name), l]));

/** Resolve a local level by English name so the seed stays readable. */
function lg(name: string) {
  const found = LG_INDEX.get(normalise(name));
  if (!found) throw new Error(`seed: unknown local level "${name}"`);
  return { provinceId: found.province.id, districtId: found.district.id, lgId: found.id };
}

export const SEED_POSTS: Post[] = [
  {
    id: 'seed-ask-1',
    kind: 'ask',
    category: 'education',
    title: 'Grade 8 maths tuition needed, 3 days a week',
    titleNp: 'कक्षा ८ को गणित कक्षा चाहिन्छ, हप्ताको ३ दिन',
    body: "My daughter is in grade 8 and is struggling with algebra and geometry. I am looking for a tutor who can come to our area twice or three times a week, preferably in the evening. I can pay Rs 400 per hour per student. Nepali medium or English medium both fine, but she needs patient teaching because she is easily discouraged.",
    place: { ...lg('Budhalikantha Municipality'), ward: 4 },
    author: { name: 'Sita Kumari Adhikari', initials: 'SK', ward: 4, area: 'Tamsikhel' },
    createdAt: iso(0, 8),
    lookingFor: 'A patient maths tutor for a grade 8 student, 2-3 evenings a week',
    contact: 'Ask in the app - I reply within a day',
    votes: 3,
    demo: true,
    replies: [
      {
        id: 'seed-reply-1',
        author: { name: 'Ramesh Shrestha', initials: 'RS', ward: 6, area: 'Bungamati' },
        body: 'I teach maths up to grade 10 and I live 15 minutes away. Free trial class this weekend, no charge. Please message here.',
        createdAt: iso(0, 11),
        demo: true,
      },
    ],
  },
  {
    id: 'seed-offer-1',
    kind: 'offer',
    category: 'skills',
    title: 'Electrician available evenings and Sundays, licensed work',
    titleNp: 'बिजुली काम गर्ने इलेक्ट्रिसियन उपलब्ध',
    body: "Twelve years of wiring, switchboard work and fan installation. I do not do illegal connections, and I always give a written estimate before starting. Areas I cover: Kageshwori, Bungamati, Shankheda. Emergency call-out after 6pm for Rs 300. Happy to show ID and my electrical licence at the ward office.",
    place: { ...lg('Kageshwari-Manohara Municipality'), ward: 8 },
    author: { name: 'Bishnu Bahadur Tamang', initials: 'BT', ward: 8, area: 'Bungamati' },
    createdAt: iso(0, 16),
    lookingFor: 'Customers in Kathmandu valley - call or message in the app',
    contact: 'Message in the app',
    votes: 11,
    demo: true,
  },
  {
    id: 'seed-offer-2',
    kind: 'offer',
    category: 'health',
    title: 'O positive blood donor, Lalitpur, can donate on short notice',
    titleNp: 'ओ पजिटिव रगदाता, ललितपुर, सूचनामा दिन सक्छु',
    body: "I am a regular donor at the Red Cross blood bank in Lalitpur and I have a donor card. O positive, weight 72 kg. If someone in Lalitpur needs blood and the bank cannot match, message me and I can reach Patan in 30 minutes. Please message before 9am, I work nights.",
    place: { ...lg('Lalitpur Metropolitan City'), ward: 15 },
    author: { name: 'Anil Maharjan', initials: 'AM', ward: 15, area: 'Gwarko' },
    createdAt: iso(0, 21),
    contact: 'Message in the app - mention ward number',
    votes: 24,
    demo: true,
  },
  {
    id: 'seed-ask-2',
    kind: 'ask',
    category: 'lostfound',
    title: 'Found: childrens school bag with books near Patan Dhoka',
    titleNp: 'पाटन ढोका नजिक बालबालिकाका किताब भएको झोला भेटियो',
    body: "While walking near Patan Dhoka this morning I picked up a school bag with two notebooks, a water bottle and a lunch box. Nothing is missing, I have kept it safe in my shop. If you recognise it, describe the colour and the notebook subjects and I will hand it over at my shop near the bus stop.",
    place: { ...lg('Lalitpur Metropolitan City'), ward: 9 },
    author: { name: 'Gita Maharjan', initials: 'GM', ward: 9, area: 'Patan Dhoka' },
    createdAt: iso(1, 10),
    contact: 'Ask in the app',
    votes: 7,
    demo: true,
  },
  {
    id: 'seed-post-1',
    kind: 'post',
    category: 'civic',
    title: 'Ward office water supply timings changed - read before queuing',
    titleNp: 'वडा कार्यालयको पानी आपूर्तिको समय परिवर्तन',
    body: "The ward office informed residents that piped water supply is now limited to 6am-9am and 5pm-7pm because of the repair works upstream. They posted the notice on the ward notice board. Residents who cannot queue in the morning can fill containers in the evening slot. I am posting this because many people came at 11am today and were sent away. Please check the board yourself, timings can change again.",
    place: { ...lg('Tokha Municipality'), ward: 5 },
    author: { name: 'Bikash Shrestha', initials: 'BS', ward: 5, area: 'Tokha Bazaar' },
    createdAt: iso(1, 15),
    votes: 19,
    demo: true,
    replies: [
      {
        id: 'seed-reply-2',
        author: { name: 'Sunita Lama', initials: 'SL', ward: 5, area: 'Tapeshwor' },
        body: 'Confirmed, same notice is on the board. They are also digging near the tank, so the evening slot may be shorter this week.',
        createdAt: iso(1, 17),
        demo: true,
      },
      {
        id: 'seed-reply-3',
        author: { name: 'Hari Bahadur Karki', initials: 'HK', ward: 6, area: 'Budhanilkantha' },
        body: 'Thanks for posting. Ward office told me the complaint number for people who cannot fill containers at all.',
        createdAt: iso(1, 18),
        demo: true,
      },
    ],
  },
  {
    id: 'seed-offer-3',
    kind: 'offer',
    category: 'documents',
    title: 'Free help filling online forms for scholarships and citizenship',
    titleNp: 'छात्रवृत्ति र नागरिकताका अनलाइन फाराम भर्न निःशुल्क सहयोग',
    body: "I am a graduate student in Boudha. I help students and families fill online forms - scholarship applications, e-learning exam forms, and the first step of citizenship and passport applications. I do not charge, I only ask for 20 minutes of your time and the documents in your hand. Please book a slot in the app, I work mornings and after 6pm. Important: I help you fill forms, the ward office and the district office still decide everything and collect the fees.",
    place: { ...lg('Budhalikantha Municipality'), ward: 3 },
    author: { name: 'Prashant Karki', initials: 'PK', ward: 3, area: 'Boudha' },
    createdAt: iso(2, 10),
    lookingFor: 'Anyone in Kathmandu who needs help with online paperwork',
    contact: 'Book a slot in the app',
    votes: 32,
    demo: true,
  },
  {
    id: 'seed-ask-3',
    kind: 'ask',
    category: 'transport',
    title: 'Cargo from New Baneshwor to Butwal, splitting freight on Friday',
    titleNp: 'नयाँ बानेश्वरबाट बुटवल सामान ढुवाउने, शुक्रबार',
    body: "I am sending three cartons of household goods to my brother in Butwal on Friday morning. The van from New Baneshwor takes Rs 2,500 for the whole load but I only need one carton space. Looking for anyone sending something the same route on Friday who could split the freight. I can carry the other person's box in a taxi instead if it is smaller.",
    place: { ...lg('Kageshwari-Manohara Municipality'), ward: 6 },
    author: { name: 'Deepak Rai', initials: 'DR', ward: 6, area: 'New Baneshwor' },
    createdAt: iso(2, 14),
    lookingFor: 'Someone with van space to Butwal this Friday',
    contact: 'Message in the app',
    votes: 5,
    demo: true,
  },
  {
    id: 'seed-post-2',
    kind: 'post',
    category: 'events',
    title: 'Free sketching class for teenagers, Sundays at the community hall',
    titleNp: 'किशोरका लागि निःशुल्क स्केचिङ कक्षा, आइतबार',
    body: "A local art teacher is running a free sketching class for teenagers 13-18, Sundays 4pm-6pm at the community hall, first floor. Twelve seats. Materials provided. Registration at the hall from 3pm, and please tell the teacher if a teenager cannot pay for a taxi. Started by a neighbour who teaches art for a living; no organisation behind it.",
    place: { ...lg('Kageshwari-Manohara Municipality'), ward: 8 },
    author: { name: 'Nirmala Shakya', initials: 'NS', ward: 8, area: 'Kageshwori' },
    createdAt: iso(3, 11),
    endsAt: iso(-28, 17),
    votes: 41,
    demo: true,
  },
  {
    id: 'seed-ask-4',
    kind: 'ask',
    category: 'emergency',
    title: 'URGENT: need a van tonight to bring my father to hospital',
    titleNp: 'अत्यावश्यक: बाबालाई अस्पताल लैजान आज रात भान टाटो चाहिन्छ',
    body: "My father collapsed at home about an hour ago. He is conscious but cannot walk. I need any van or private ambulance to take him to the nearest hospital with a cardiac facility tonight. I am near Sundhara. Police ambulance 102 is already on the way but I want to know if someone nearby has a vehicle. Please share this, every share helps.",
    place: { ...lg('Kathmandu Metropolitan City'), ward: 16 },
    author: { name: 'Mohan Kumar Rai', initials: 'MR', ward: 16, area: 'Sundhara' },
    createdAt: iso(0, 22),
    contact: 'Urgent - call police 100 or 102 first, then message here',
    urgent: true,
    votes: 63,
    demo: true,
  },
  {
    id: 'seed-offer-4',
    kind: 'offer',
    category: 'skills',
    title: 'Tailoring: school uniforms and alterations, home fitting in Bharatpur',
    titleNp: 'स्कूल युनिफर्म र टाइलिङ, भरतपुरमा घरमै नाप',
    body: "I run a small tailoring shop and I go to customers' homes for measurements in Bharatpur. School uniform stitching, blouse alteration, overlock and zipper replacement. Same-day alteration for trousers and skirts. Prices are the standard local rate; I can stitch from cloth you bring. The shop is beside the main road, ask anyone for my number in the market.",
    place: { ...lg('Bharatpur Metropolitan City'), ward: 10 },
    author: { name: 'Kamala Devi Chaudhary', initials: 'KC', ward: 10, area: 'Bharatpur Bazaar' },
    createdAt: iso(4, 12),
    contact: 'Visit the shop or message in the app',
    votes: 16,
    demo: true,
  },
  {
    id: 'seed-post-3',
    kind: 'post',
    category: 'civic',
    title: 'What the citizen charter actually promises for a birth registration',
    titleNp: 'जन्म दर्ताका लागि वडापत्रले के प्रतिबद्धता गर्छ',
    body: "I read the citizen charter published by my ward and summarised what it commits to for birth registration: application at the ward office with the hospital letter and parents' identity, decision within 15 working days, free of charge, and a named grievance officer. I put the summary here so other parents do not have to queue for a day to learn it. The ward office confirms the final figures - please check the charter yourself before you rely on this.",
    place: { ...lg('Bharatpur Metropolitan City'), ward: 6 },
    author: { name: 'Ramesh Bhattarai', initials: 'RB', ward: 6, area: 'Narayangadh' },
    createdAt: iso(5, 9),
    votes: 58,
    demo: true,
  },
  {
    id: 'seed-offer-5',
    kind: 'offer',
    category: 'jobs',
    title: 'Two daily-wage masonry jobs and one helper, this week',
    titleNp: 'दुई जना दैनिक मजदुरी गारो भइस्क, यस हप्ता',
    body: "A house under construction in Pokhara needs two masons for plastering for five days and one helper for mixing and carrying. Rs 900 per mason per day plus lunch, helper Rs 700. Payment daily at end of the afternoon. Tools are on site, only bring your own trowel and a hat. I am the site contractor and I will show the work agreement tomorrow morning at the office.",
    place: { ...lg('Pokhara Metropolitan City'), ward: 8 },
    author: { name: 'Suresh Gurung', initials: 'SG', ward: 8, area: 'LalPokhari' },
    createdAt: iso(5, 15),
    lookingFor: '2 masons + 1 helper, this week only',
    contact: 'Come to the site, ask for Suresh the contractor',
    votes: 27,
    demo: true,
  },
];

export const DEMO_NOTICE = 'Demo content - names, contacts and numbers are illustrative.';
