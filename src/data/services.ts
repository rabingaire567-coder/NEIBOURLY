import type { ServiceItem } from '@/types';

/**
 * Public services reference.
 *
 * Every entry is a nationwide, publicly published service. Shortcodes are the
 * figures published by Nepal Police (nepalpolice.gov.np emergency contacts and
 * Nepal Police Academy helpline lists) plus Nepal's national child helpline.
 * NEIBOURLY links out to the official source instead of restating procedures
 * that change - always confirm at the ward office before acting.
 *
 * This is reference data, not demo data: see README "Data and provenance".
 */
export const SERVICES: ServiceItem[] = [
  {
    id: 'police',
    name: 'Police control room',
    nameNp: 'प्रहरी नियन्त्रण कक्ष',
    category: 'Emergency',
    national: '100',
    source: 'Nepal Police',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'General emergencies, theft, violence, public disturbance.',
  },
  {
    id: 'traffic',
    name: 'Traffic police',
    nameNp: 'ट्राफिक प्रहरी',
    category: 'Emergency',
    national: '103',
    source: 'Nepal Police',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Road accidents, traffic disputes, lane and parking violations.',
  },
  {
    id: 'fire',
    name: 'Fire brigade',
    nameNp: 'दमकल',
    category: 'Emergency',
    national: '101',
    source: 'Nepal Police',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Fire, gas leak and rescue calls routed through the control room.',
  },
  {
    id: 'ambulance',
    name: 'Ambulance support',
    nameNp: 'एम्बुलेन्स सहयोग',
    category: 'Emergency',
    national: '102',
    source: 'Nepal Police',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Free ambulance dispatch request. Private ambulances also operate.',
  },
  {
    id: 'child',
    name: 'Child helpline',
    nameNp: 'बालबालिका हेल्पलाइन',
    category: 'Emergency',
    national: '1098',
    source: 'Nepal Police emergency list / national child helpline',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Children at risk, child labour, trafficking and abuse reports.',
  },
  {
    id: 'women',
    name: 'Women helpline',
    nameNp: 'महिला हेल्पलाइन',
    category: 'Emergency',
    national: '1145',
    source: 'Nepal Police emergency list',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Violence against women, harassment, immediate safety support.',
  },
  {
    id: 'armed-police',
    name: 'Armed Police Force',
    nameNp: 'सशस्त्र प्रहरी बल',
    category: 'Emergency',
    national: '1114',
    source: 'Nepal Police emergency list',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'Security support for offices, events and public buildings.',
  },
  {
    id: 'nid',
    name: 'National ID and civil registration',
    nameNp: 'राष्ट्रिय परिचयपत्र तथा जन्मदर्ता विभाग',
    category: 'Documents',
    national: '1147',
    source: 'Nepal Police emergency list',
    sourceUrl: 'https://nepalpolice.gov.np/stations/emergency-contacts/',
    note: 'National identity card and birth / death registration support.',
  },
  {
    id: 'nagarik-app',
    name: 'Nagarik App',
    nameNp: 'नागरिक एप',
    category: 'Documents',
    source: 'Ministry of Home Affairs, Nepal',
    sourceUrl: 'https://nagarikapp.gov.np/',
    note: 'Official app for online services, application status and public complaints.',
  },
  {
    id: 'lgrms',
    name: 'Local government directory',
    nameNp: 'स्थानीय सरकार निर्देशिका',
    category: 'Civic',
    source: 'Local Government Resource Management System, Ministry of Local Government',
    sourceUrl: 'https://lgrms.gov.np/',
    note: 'Official website of your local level, including ward and citizen charter pages.',
  },
  {
    id: 'ward-office',
    name: 'Ward citizen charter (वडापत्र)',
    nameNp: 'नागरिक वडापत्र',
    category: 'Civic',
    source: 'Good Governance (Management and Operation) Act 2064 - citizen charters',
    sourceUrl: 'https://lgrms.gov.np/',
    note: 'Every public body must publish service times, fees and the grievance officer.',
  },
];

/** Short, stable help text used by the AI fallback and the help page. */
export const SERVICE_TIPS: Record<string, string> = {
  documents:
    'Most paperwork in Nepal starts at the ward office: get the ward recommendation first, then the district office for citizenship and national ID. The citizen charter published by each office lists the fee, the documents you must carry and the officer responsible.',
  civic:
    'For water supply, roads, street lights, drainage and garbage, the first stop is your ward office. Escalate to the rural municipality or municipality if the ward does not respond within the time given in the citizen charter.',
  emergency:
    'Police control room 100 works nationwide and is free. For fire dial 101, for an ambulance dial 102, for traffic accidents dial 103.',
  health:
    'For a health problem, start at your local health post or the nearest primary health centre. Hospitals come second. If someone needs blood, check the Red Cross blood bank in your district.',
  education:
    'For school and college admissions, scholarship forms and exam results, the school or campus administration office is the official source. NEIBOURLY can help you find a tutor near you, but the school confirms fees and seats.',
};

/** Official national portals worth linking, kept minimal and verifiable. */
export const OFFICIAL_LINKS = [
  { label: 'Nagarik App', url: 'https://nagarikapp.gov.np/', note: 'Official citizen services app' },
  { label: 'Local Government Resource Management System', url: 'https://lgrms.gov.np/', note: 'Official local level websites and citizen charters' },
  { label: 'Nepal Police', url: 'https://nepalpolice.gov.np/', note: 'Station directory and emergency contacts' },
  { label: 'Ministry of Local Government', url: 'https://moha.gov.np/', note: 'Local government ministry' },
  { label: 'Department of Immigration', url: 'https://immigration.gov.np/', note: 'Passport and visa services' },
  { label: 'Nepal Electricity Authority', url: 'https://www.nea.gov.np/', note: 'Power connection and outage information' },
];