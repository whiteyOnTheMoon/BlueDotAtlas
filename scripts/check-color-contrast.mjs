// Zero-dependency WCAG 2.2 color-contrast regression check for design tokens.
// Run: node scripts/check-color-contrast.mjs
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../packages/ui/tokens/colors.ts", import.meta.url), "utf8");

function color(mode, key) {
  const start = source.indexOf(`  ${mode}: {`);
  if (start < 0) throw new Error(`Missing theme: ${mode}`);
  const end = mode === "light" ? source.indexOf("  dark: {", start) : source.length;
  const block = source.slice(start, end);
  const match = block.match(new RegExp(`^    ${key}: "(#[0-9A-Fa-f]{6})"`, "m"));
  if (!match) throw new Error(`Missing token ${mode}.${key}`);
  return match[1];
}

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground, background) {
  const [hi, lo] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const checks = [];
for (const theme of ["light", "dark"]) {
  for (const surface of ["background", "surface"]) {
    checks.push([`${theme} text on ${surface}`, color(theme, "text"), color(theme, surface), 4.5]);
    checks.push([`${theme} muted on ${surface}`, color(theme, "textMuted"), color(theme, surface), 4.5]);
    checks.push([`${theme} control border on ${surface}`, color(theme, "controlBorder"), color(theme, surface), 3]);
  }
  checks.push([`${theme} primary button`, color(theme, "onPrimary"), color(theme, "primary"), 4.5]);
  checks.push([`${theme} accent button`, color(theme, "onAccent"), color(theme, "accent"), 4.5]);
  checks.push([`${theme} focus ring on canvas`, color(theme, "focusRing"), color(theme, "background"), 3]);
}

let failures = 0;
for (const [name, foreground, background, minimum] of checks) {
  const value = contrast(foreground, background);
  const passed = value >= minimum;
  console.log(`${passed ? "PASS" : "FAIL"}: ${name} — ${value.toFixed(2)}:1 (min ${minimum}:1)`);
  if (!passed) failures++;
}
if (failures) {
  console.error(`${failures} contrast check(s) failed`);
  process.exitCode = 1;
} else {
  console.log(`All ${checks.length} contrast checks passed.`);
}
