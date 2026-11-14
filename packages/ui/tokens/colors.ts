/**
 * BlueDotAtlas Brand / UI color tokens — proposal for Roadmap M00-004.
 *
 * The existing four transparent SVG logo assets are intentionally untouched.
 * Color values are sRGB hex; semantics are kept separate from raw logo inks.
 * Contrast audit: docs/brand/colors.md (WCAG 2.2, 2026-11-14).
 * Status: DRAFT until user approval / PR merge.
 */
export const brandColors = {
  deepSea: "#021934",       // Existing approved light-surface SVG logo ink
  iceWhite: "#F2F9FF",      // Existing approved dark-surface SVG logo ink
  blueDotLight: "#10AAEC",  // Existing approved light-surface logo dot
  blueDotDark: "#19B7F4",   // Existing approved dark-surface logo dot
  glacierAccent: "#37D6C4",
} as const;

export const colorTokens = {
  light: {
    background: "#F7FBFF",
    surface: "#FFFFFF",
    text: "#021934",
    textMuted: "#40566D",
    primary: "#026E9E",
    onPrimary: "#FFFFFF",
    accent: "#37D6C4",
    onAccent: "#021934",
    controlBorder: "#667E91", // Non-text functional controls: >= 3:1
    divider: "#CADDEB",       // Decorative separators only
    focusRing: "#026E9E",
    // Graphic colors for map markers, scientific charts and motion labels.
    data: {
      ocean: "#00739B",
      cryosphere: "#087F74",
      land: "#9B4E04",
      atmosphere: "#6E47B5",
      warning: "#B64B42",
    },
    map: { marker: "#00739B", labelBackground: "#FFFFFF", labelText: "#021934" },
    motion: { title: "#021934", subtitle: "#40566D", highlight: "#00739B" },
  },
  dark: {
    background: "#071522",
    surface: "#0E2942",
    text: "#F2F9FF",
    textMuted: "#B4CCDC",
    primary: "#19B7F4",
    onPrimary: "#021934",
    accent: "#37D6C4",
    onAccent: "#021934",
    controlBorder: "#6D92A9", // Non-text functional controls: >= 3:1
    divider: "#31546D",       // Decorative separators only
    focusRing: "#19B7F4",
    data: {
      ocean: "#19B7F4",
      cryosphere: "#3CDFC2",
      land: "#FFC178",
      atmosphere: "#B9A5F7",
      warning: "#FF9278",
    },
    map: { marker: "#19B7F4", labelBackground: "#0E2942", labelText: "#F2F9FF" },
    motion: { title: "#F2F9FF", subtitle: "#B4CCDC", highlight: "#19B7F4" },
  },
} as const;

export type ColorMode = keyof typeof colorTokens;
export type ThemeColors = (typeof colorTokens)[ColorMode];
