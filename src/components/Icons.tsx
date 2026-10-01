import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 18, ...rest }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...rest,
});

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.6V20h14V9.6" />
    <path d="M10 20v-5.5h4V20" />
  </svg>
);

export const IconHand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M11 10.5V4.8a1.5 1.5 0 0 1 3 0v5.7" />
    <path d="M14 11V6.8a1.5 1.5 0 0 1 3 0V14" />
    <path d="M17 11.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.6a5 5 0 0 1-3.8-1.8L4 14.4a1.6 1.6 0 0 1 2.4-2.1L8 13.6" />
  </svg>
);

export const IconGift = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M2.5 7.5h19V11h-19z" />
    <path d="M12 7.5V21" />
    <path d="M12 7.5S10.6 3 8 3a2.2 2.2 0 0 0 0 4.5z" />
    <path d="M12 7.5S13.4 3 16 3a2.2 2.2 0 0 1 0 4.5z" />
  </svg>
);

export const IconMegaphone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l2 5h3l-2-5h1l8 4V6l-8 4H4a1 1 0 0 0-1 1z" />
    <path d="M18 9.5a3.5 3.5 0 0 1 0 5" />
  </svg>
);

export const IconCompass = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </svg>
);

export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" />
    <path d="M18.5 3v3.2M20.1 4.6h-3.2" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

export const IconPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconPinFilled = ({ size = 22, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" {...rest}>
    <path
      d="M12 22s7-6.2 7-11.6A7 7 0 0 0 5 10.4C5 15.8 12 22 12 22z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="10.2" r="2.6" fill="var(--paper)" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.4a3.5 3.5 0 0 1 0 6.2" />
    <path d="M17.5 14.9c2.1.6 3.5 2.5 3.5 5.1" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const IconBookmark = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16L12 16.6 5.5 20.5v-16a1 1 0 0 1 1-1z" />
  </svg>
);

export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconCheckCircle = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.7 2.7L16 9.5" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
  </svg>
);

export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.7 3.9 2.5 18a1 1 0 0 0 .9 1.5h17.2a1 1 0 0 0 .9-1.5L13.3 3.9a1 1 0 0 0-1.8 0z" />
    <path d="M12 9v4.2" />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.2 3.5h3l1.4 3.6-2 1.4a11.5 11.5 0 0 0 5.4 5.4l1.4-2 3.6 1.4v3a1.5 1.5 0 0 1-1.6 1.5C10.4 17.4 6.6 13.6 5.2 6.1A1.5 1.5 0 0 1 6.2 3.5z" />
  </svg>
);

export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
    <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2z" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M17.3 6.7 19 5M5 19l1.7-1.7" />
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.5 3.5 3.8 10.2a.4.4 0 0 0 0 .75l6.7 2.4 2.4 6.7a.4.4 0 0 0 .75 0z" />
    <path d="m10.5 13.3 4.6-4.6" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 4.5 5.8v5.4c0 4.4 3.1 8.2 7.5 9.4 4.4-1.2 7.5-5 7.5-9.4V5.8z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const IconKey = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="12" r="4" />
    <path d="M12 12h9M17.5 12v3.2M20.2 12v2.2" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
    <path d="M15 9V5.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H9" />
  </svg>
);

export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 5.5h17l-6.6 7.6V20l-3.8-2v-4.9z" />
  </svg>
);

export const IconTrend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 17 9 11l3.5 3.5L20 7" />
    <path d="M15.5 7H20v4.5" />
  </svg>
);

export const IconBook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
    <path d="M4 19.5A1.5 1.5 0 0 1 5.5 21H19v-3" />
  </svg>
);

export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 9 4.8-9 4.8-9-4.8z" />
    <path d="m3.4 12.4 8.6 4.6 8.6-4.6" />
    <path d="m3.4 16.9 8.6 4.6 8.6-4.6" />
  </svg>
);

export const IconExternal = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 5h6v6" />
    <path d="m19 5-8.5 8.5" />
    <path d="M18 14.5V18a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H10" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15" />
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
    <path d="M10.5 10v6.5M13.5 10v6.5" />
  </svg>
);

export const IconExternalLink = IconExternal;

export const IconLogo = ({ size = 30, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false" {...rest}>
    <rect width="32" height="32" rx="9" fill="var(--pine-700)" />
    <path
      d="M9 20.5 14 11l3.4 5.1L19.2 14 23 20.5"
      fill="none"
      stroke="var(--pine-100)"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="23" cy="10.4" r="2.5" fill="var(--clay-300)" />
    <path
      d="M11.6 22.5h9.2"
      stroke="var(--gold-300)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
