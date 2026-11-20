import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAndCheckInputs, syntheticFfmpegArgs } from '../render/preset-1080p.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const QA_DIR=resolve(ROOT,'.tmp-export-045');
const QA_MP4=resolve(QA_DIR,'045-original-synthetic-1080p.mp4');

export function make045SyntheticExport() {
  if(process.env.CI!=='true' || process.env.BDA_EXPORT_045_SYNTHETIC_PROOF!=='TRUE'){
    throw new Error('045 export disabled: explicit isolated CI-only synthetic gate required');
  }
  const preset=readAndCheckInputs();
  mkdirSync(QA_DIR,{recursive:true});
  const args=syntheticFfmpegArgs(preset,QA_MP4);
  execFileSync('ffmpeg',args,{cwd:ROOT,timeout:240000,stdio:'pipe',maxBuffer:3_000_000});
  console.log('045 ORIGINAL 1080p QA ENCODE: MP4 +faststart / H264 1920x1080 30fps yuv420p BT709 / AAC 48kHz stereo / 8s');
  console.log('045 No NASA/NOAA/brand media, real voice, third-party music, VPS or production export.');
  return QA_MP4;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  make045SyntheticExport();
}
