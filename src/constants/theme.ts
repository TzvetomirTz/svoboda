// Tokens from the Svoboda brand book (design system artifact "Svoboda").

export const colors = {
  light: {
    /** Logo, headings and body text on paper or surface. */
    ink: '#0A0A0A',
    /** Page and app background. */
    paper: '#FFFFFF',
    /** Panels, message input, code blocks. Use instead of shadows. */
    surface: '#F3F3F1',
    /** 1px hairlines and dividers. Never text, never the only border of a control. */
    line: '#E2E2DE',
    /** Secondary text: timestamps, captions, helper text. */
    muted: '#5C5C58',
    /** The single Swiss red, in small doses: active tab, focus ring, index numbers, scan line. */
    signal: '#E30613',
    /** Destructive actions and errors, always with text. */
    alert: '#C8102E',
    /** Pale alert behind a destructive button while it is held. Alert text on it stays above 4.5:1. */
    alertTint: '#FAE7EA',
  },
  dark: {
    ink: '#F2F2F0',
    paper: '#0A0A0A',
    surface: '#161616',
    line: '#2B2B2B',
    muted: '#A3A3A0',
    signal: '#FF4A4A',
    alert: '#FF6B6B',
    alertTint: '#311A1A',
  },
} as const;

export type ColorName = keyof (typeof colors)['light'];

export const fonts = {
  inter: {
    400: 'Inter_400Regular',
    500: 'Inter_500Medium',
    600: 'Inter_600SemiBold',
    700: 'Inter_700Bold',
    800: 'Inter_800ExtraBold',
  },
  /** Only for key fingerprints, always grouped in fours. */
  mono: 'IBMPlexMono_400Regular',
} as const;

export const typography = {
  /** The wordmark "Svoboda." on the splash: Inter ExtraBold, tight tracking. Always ink on paper or paper on ink. */
  wordmark: { fontSize: 56, lineHeight: 56, fontWeight: '800', letterSpacing: -2.8 },
  /** Screen titles: Send, Receive, Contacts. One per screen, followed by a 2px ink rule. */
  display: { fontSize: 56, lineHeight: 52, fontWeight: '700', letterSpacing: -2.52 },
  /** Onboarding and confirmation headlines. */
  heading: { fontSize: 32, lineHeight: 36, fontWeight: '700', letterSpacing: -0.64 },
  /** Selected contact in pickers, names in lists. */
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.4 },
  /** Explanations and the decrypted message. */
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  /** Helper text, usually in muted. */
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  /** Key fingerprints, always in groups of four. */
  code: { fontFamily: fonts.mono, fontSize: 14, lineHeight: 20 },
  /** Small mono meta lines: the splash footer, version and build info. Usually in muted. */
  caption: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
  /** Uppercase field labels above every input and picker. */
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.88, textTransform: 'uppercase' },
} as const;

export const spacing = {
  /** Gaps inside a control: icon to label. */
  1: 4,
  /** Between related items: lines in a list row, chips. */
  2: 8,
  /** Default padding of panels, inputs and list rows. */
  4: 16,
  /** Between sections on a screen. */
  8: 32,
  /** Distance of bottom-anchored meta lines from the screen edge, such as the splash footer. */
  12: 48,
  /** Page margins on wide screens; clear space around the wordmark at large sizes. */
  16: 64,
} as const;

export const radius = {
  /** The default. Panels, blocks, images and dividers are square. */
  none: 0,
  /** Interactive controls only: buttons, inputs, toggles. */
  sm: 4,
  /** Only the Send/Receive switch and the round plus button. */
  pill: 999,
} as const;

export const layout = {
  /** Side margins on a 390px phone. */
  margin: 20,
  /** Height of primary and secondary buttons. */
  buttonHeight: 56,
  /** Rules under screen titles and field underlines. */
  rule: 2,
  /** Hairline dividers in `line`. */
  hairline: 1,
} as const;
