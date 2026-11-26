// Scene-Director V1 render plan (Roadmap 057/058, with 055 infographic build):
// pure functions that turn a validated scene document into a sequential,
// memory-bounded FFmpeg plan. No I/O here; scripts/render-scene-v1.mjs executes it.
import assert from 'node:assert/strict';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const r3 = (v) => Number(v.toFixed(3));

/**
 * Flatten scenes to shots with absolute timing. A transition belongs to the
 * start of the incoming shot and does not lengthen the film: its first N
 * frames blend with N extra "tail" frames of the previous shot.
 */
export function timeline(doc) {
  const shots = doc.scenes.flatMap((scene) => scene.shots.map((shot) => ({ ...shot, beat: scene.beat })));
  let start = 0;
  const out = shots.map((shot) => {
    const item = { ...shot, start, frames: shot.duration.frames };
    start += item.frames;
    return item;
  });
  assert.equal(start, doc.durationFrames, 'shots must add up to durationFrames');
  out.forEach((shot, i) => {
    const next = out[i + 1];
    shot.tail = next && next.transitionIn.type !== 'cut' ? next.transitionIn.frames : 0;
    shot.renderFrames = shot.frames + shot.tail;
  });
  return out;
}

/** Body/blend segments that tile the film exactly once. */
export function segments(shots) {
  const parts = [];
  shots.forEach((shot, i) => {
    const lead = i > 0 && shot.transitionIn.type !== 'cut' ? shot.transitionIn.frames : 0;
    if (lead) {
      parts.push({
        kind: 'blend', type: shot.transitionIn.type, frames: lead,
        from: i - 1, fromOffset: shots[i - 1].frames, to: i, toOffset: 0,
      });
    }
    parts.push({ kind: 'body', shot: i, offset: lead, frames: shot.frames - lead });
  });
  const total = parts.reduce((sum, p) => sum + p.frames, 0);
  assert.equal(total, shots.reduce((sum, s) => sum + s.frames, 0));
  return parts;
}

/** zoompan expressions for camera instructions over n frames (per-frame, on video). */
export function cameraFilter(animation, n) {
  const a = animation ?? { type: 'none', fromScale: 1, toScale: 1 };
  const last = Math.max(1, n - 1);
  const z0 = a.fromScale ?? 1;
  const z1 = a.toScale ?? 1;
  let z = '1';
  let x = 'iw/2-(iw/zoom/2)';
  const y = 'ih/2-(ih/zoom/2)';
  const ease = `(0.5-0.5*cos(PI*on/${last}))`;
  if (['push_in', 'pull_out', 'ken_burns'].includes(a.type)) z = `${z0}+(${r3(z1 - z0)})*${ease}`;
  if (a.type === 'pan_right' || a.type === 'pan_left' || a.type === 'ken_burns') {
    z = z === '1' ? String(Math.max(z0, 1.05)) : z;
    const dir = a.type === 'pan_left' ? `(1-${ease})` : ease;
    x = `(iw-iw/zoom)*${dir}`;
  }
  if (z === '1' && a.type !== 'none' && a.type !== 'diagram_build') z = '1';
  // Upscale x2 first so sub-pixel zoompan moves stay smooth (no jitter).
  return `scale=${W * 2}:${H * 2}:flags=bicubic,zoompan=z='${z}':x='${x}':y='${y}':d=1:s=${W}x${H}:fps=${FPS}`;
}

/** Overlay SVG (1920x1080, transparent) per 050 style rules. */
export function overlaySvg(overlay) {
  const text = esc(overlay.text);
  const body = {
    info_box:
      `<rect x="96" y="760" width="${Math.min(1500, 120 + overlay.text.length * 21)}" height="124" rx="14" fill="#021934" opacity="0.82"/>` +
      `<rect x="96" y="760" width="8" height="124" fill="#37d6c4"/>` +
      `<text x="132" y="836" font-size="40" fill="#f2f9ff" font-family="DejaVu Sans">${text}</text>`,
    lower_third:
      `<rect x="96" y="860" width="1100" height="96" rx="12" fill="#021934" opacity="0.8"/>` +
      `<text x="128" y="922" font-size="38" fill="#f2f9ff" font-family="DejaVu Sans">${text}</text>`,
    source_credit:
      `<text x="1824" y="1020" text-anchor="end" font-size="28" fill="#f2f9ff" opacity="0.9" font-family="DejaVu Sans" ` +
      `stroke="#021934" stroke-width="5" paint-order="stroke">${text}</text>`,
    title:
      `<text x="960" y="560" text-anchor="middle" font-size="76" font-weight="bold" fill="#f2f9ff" font-family="DejaVu Sans" ` +
      `stroke="#021934" stroke-width="8" paint-order="stroke">${text}</text>`,
  }[overlay.style];
  assert.ok(body, 'unknown overlay style ' + overlay.style);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

/** Alpha fade (8–12 frames) in/out of one overlay inside its shot. */
export function overlayFade(overlay) {
  const fade = Math.min(10, Math.floor((overlay.endFrame - overlay.startFrame) / 3));
  const st = r3(overlay.startFrame / FPS);
  const en = r3((overlay.endFrame - fade) / FPS);
  const d = r3(fade / FPS);
  return {
    fadeFrames: fade,
    filter: `format=rgba,fade=t=in:st=${st}:d=${d}:alpha=1,fade=t=out:st=${en}:d=${d}:alpha=1`,
    enable: `between(n,${overlay.startFrame},${overlay.endFrame - 1})`,
  };
}

/**
 * 055 "diagram_build" infographic: animated bars for the DataRefs referenced
 * by the shot's overlays; values grow in narration order with ease-out.
 * Qualitative chrome only; every number comes from a sourced DataRef.
 */
export function infographicSvg(shot, dataRefs, frame) {
  const refs = shot.overlays.flatMap((o) => o.dataRefIds ?? []).map((id) => dataRefs.get(id)).filter(Boolean);
  const n = shot.frames;
  const p = Math.min(1, frame / Math.max(1, Math.round(n * 0.6)));
  const ease = 1 - (1 - p) ** 3;
  const bars = refs
    .map((ref, i) => {
      const y = 420 + i * 190;
      const w = r3(1100 * ease);
      const shown = ref.value === undefined ? '' : (ref.value * ease).toFixed(ref.value % 1 ? 1 : 0);
      return (
        `<text x="240" y="${y - 24}" font-size="34" fill="#9fdff0" font-family="DejaVu Sans">${esc(ref.description.slice(0, 90))}</text>` +
        `<rect x="240" y="${y}" width="1100" height="64" rx="10" fill="#0e2942"/>` +
        `<rect x="240" y="${y}" width="${w}" height="64" rx="10" fill="#ffc178"/>` +
        `<text x="${r3(260 + w)}" y="${y + 48}" font-size="48" font-weight="bold" fill="#f2f9ff" font-family="DejaVu Sans">${esc(shown)} ${esc(ref.unit ?? '')}</text>`
      );
    })
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#071522"/><stop offset="1" stop-color="#0e2942"/></linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#g)"/>` +
    `<text x="240" y="250" font-size="30" fill="#37d6c4" font-family="DejaVu Sans">BLUEDOTATLAS / DATA</text>` +
    bars +
    `</svg>`
  );
}

/** Blend expression for an N-frame transition between A (outgoing) and B (incoming). */
export function blendExpr(type, n) {
  const k = `((N+1)/${n})`;
  if (type === 'crossfade') return `A*(1-${k})+B*${k}`;
  const black = type === 'dip_to_white' ? 255 : 0;
  // First half fades A to black/white, second half fades B in from it.
  return `if(lt(${k},0.5),A*(1-2*${k})+${black}*2*${k},B*(2*${k}-1)+${black}*(2-2*${k}))`;
}

/** Which parts still need shot i (062 resume planning). Pure. */
export function shotsStillNeeded(parts, done) {
  const need = new Set();
  parts.forEach((part, k) => {
    if (done.has(k)) return;
    if (part.kind === 'body') need.add(part.shot);
    else { need.add(part.from); need.add(part.to); }
  });
  return need;
}
