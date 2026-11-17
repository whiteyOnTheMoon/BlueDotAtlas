/**
 * BlueDotAtlas UI-Kit V0.1 — Roadmap 008, DRAFT for owner review.
 * These are DESIGN/UI tokens, not new brand colors.
 * Color source of truth: packages/ui/tokens/colors.ts (task 004).
 *
 * Values below can be reused unchanged by future public-site/admin React components.
 * Do not import SVG logo paths or attempt to recreate the logo here.
 */
export const uiTokens = {
  font: {
    body: '"Inter", system-ui, -apple-system, sans-serif',
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    size: { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", heading: "clamp(1.75rem, 3vw, 3rem)", hero: "clamp(2.5rem, 5vw, 5rem)" },
    lineHeight: { compact: 1.2, body: 1.55 },
  },
  space: { 0: "0", 1: "0.25rem", 2: "0.5rem", 3: "0.75rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 8: "2rem", 10: "2.5rem", 12: "3rem", 16: "4rem" },
  radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", pill: "999px" },
  borderWidth: { thin: "1px", focus: "3px" },
  control: { minHeight: "44px", compactHeight: "40px", paddingInline: "1.125rem", inputPadding: "0.875rem" },
  card: { padding: "1.25rem", galleryRatio: "16 / 9", minWidth: "230px" },
  layout: { maxWidth: "1360px", mobileGutter: "1rem", desktopGutter: "2rem", sidebar: "244px" },
  breakpoints: { mobile: "640px", tablet: "960px" },
  motion: { short: "120ms", standard: "180ms", reduced: "0ms" },
  shadow: { raised: "0 18px 56px rgba(0, 10, 27, 0.15)" },
  status: {
    // States require text/shape labels; never color alone.
    draft: { label: "Draft", meaning: "Not approved for publication" },
    review: { label: "In review", meaning: "Awaiting editorial approval" },
    ready: { label: "Ready", meaning: "Eligible for manual review; not automatically published" },
    published: { label: "Published", meaning: "Visible publicly after explicit publication" },
  },
} as const;

export type UIMode = "dark" | "light";
export type UIStatus = keyof typeof uiTokens.status;
