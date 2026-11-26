// Roadmap 061: deterministic ~9.5-minute technical benchmark scene for the VPS.
// Reuses the privately staged V2 pilot assets in long, calm shots (8–20 s),
// every shot kind, camera move, overlay style and transition type the
// Scene-Director renderer supports. A load/stability test, NOT a film for review:
// clips repeat, there is no narration (silent track) and nothing is published.
import { readFileSync } from 'node:fs';

const v2 = JSON.parse(readFileSync(new URL('../docs/pilot/60s-script-v2.scene.json', import.meta.url), 'utf8'));

const push = { type: 'push_in', fromScale: 1, toScale: 1.08, easing: 'ease_in_out' };
const pull = { type: 'pull_out', fromScale: 1.08, toScale: 1, easing: 'ease_in_out' };
const panR = { type: 'pan_right', fromScale: 1.05, toScale: 1.05, easing: 'ease_in_out' };
const panL = { type: 'pan_left', fromScale: 1.05, toScale: 1.05, easing: 'ease_in_out' };
const kenBurns = { type: 'ken_burns', fromScale: 1, toScale: 1.1, easing: 'ease_in_out' };
const build = { type: 'diagram_build', fromScale: 1, toScale: 1, easing: 'ease_out' };

const TRANSITIONS = [
  { type: 'crossfade', frames: 18 }, { type: 'dip_to_black', frames: 12 }, { type: 'crossfade', frames: 24 },
  { type: 'cut', frames: 0 }, { type: 'crossfade', frames: 12 }, { type: 'dip_to_black', frames: 18 },
];
const CHAPTERS = ['context', 'news', 'meaning', 'future', 'pause', 'takeaway'];

const box = (text, frames, sourceIds, dataRefIds = []) => ({ style: 'info_box', text, startFrame: 45, endFrame: frames - 45, sourceIds, dataRefIds });
const credit = (text, frames, sourceIds) => ({ style: 'source_credit', text, startFrame: 30, endFrame: frames - 30, sourceIds });

export function benchScene061() {
  let t = 0;
  const transition = () => TRANSITIONS[t++ % TRANSITIONS.length];
  const shot = (id, kind, frames, assetIds, extra = {}) => ({
    id, kind, duration: { frames }, assetIds, transitionIn: transition(), ...extra,
  });
  const scenes = [{
    id: 'intro', beat: 'intro', title: 'Intro',
    shots: [{ id: 'B000', kind: 'brand_intro', duration: { frames: 75 }, assetIds: ['brand-intro'], transitionIn: { type: 'cut', frames: 0 } }],
  }];
  CHAPTERS.forEach((beat, c) => {
    const p = `C${c + 1}`;
    const shots = [
      shot(`${p}S1`, 'footage_fullscreen', 540, ['P60-VID-001'], { animation: c % 2 ? pull : push }),
      shot(`${p}S2`, 'footage_with_overlay', 540, ['V2-VID-SVS5681-POLO-GPM'], {
        assetInFrame: c * 400, animation: panR,
        overlays: [box('Hurricane Polo seen by GPM (benchmark)', 540, ['nasa-svs-5681'])],
      }),
      shot(`${p}S3`, 'map', 450, ['V2-VID-SVS5683-ELNINO-SSTA'], {
        animation: kenBurns, overlays: [credit('Sea surface temperature anomaly · NASA SVS', 450, ['nasa-svs-5683'])],
      }),
      shot(`${p}S4`, 'breathing_video', 360, ['P60-VID-005'], { animation: c % 2 ? panL : panR }),
      shot(`${p}S5`, 'infographic', 300, [], {
        animation: build, overlays: [box('Hurricane Polo: +90 knots in 24 hours', 300, ['nasa-polo'], ['polo-plus-90kt'])],
      }),
      shot(`${p}S6`, 'footage_with_overlay', 540, ['P60-VID-003'], {
        animation: push, overlays: [credit('NOAA Hurricane Hunter · Helene 2024', 540, ['gfdl-warming'])],
      }),
    ];
    if (c % 2 === 0) {
      shots.splice(3, 0, shot(`${p}S7`, 'footage_with_overlay', 180, ['V2-VID-CIRA-POLO-RI'], {
        animation: push, overlays: [{ style: 'lower_third', text: 'Benchmark: GOES-18 rapid intensification', startFrame: 30, endFrame: 150 }],
      }));
    }
    if (c === CHAPTERS.length - 1) {
      shots.push(shot(`${p}S8`, 'footage_with_overlay', 240, ['P60-VID-005'], {
        assetInFrame: 120, animation: push,
        overlays: [{ style: 'title', text: 'The ocean powers the storm.', startFrame: 30, endFrame: 210 }],
      }));
    }
    scenes.push({ id: `chapter-${c + 1}`, beat, title: `Benchmark chapter ${c + 1}`, shots });
  });
  scenes.push({
    id: 'outro', beat: 'outro', title: 'Outro',
    shots: [{ id: 'B999', kind: 'brand_outro', duration: { frames: 180 }, assetIds: ['brand-outro'], transitionIn: { type: 'crossfade', frames: 9 } }],
  });
  const durationFrames = scenes.reduce((sum, s) => sum + s.shots.reduce((a, sh) => a + sh.duration.frames, 0), 0);
  return {
    schemaVersion: 1, id: 'bench-061-hurricane-9min', title: 'Roadmap 061 VPS benchmark (~9.5 min, technical only)',
    language: 'en', fps: 30, width: 1920, height: 1080, durationFrames,
    sources: v2.sources, assets: v2.assets, dataRefs: v2.dataRefs, scenes, publicationAuthorized: false,
  };
}
