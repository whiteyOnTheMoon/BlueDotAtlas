import { realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { Config } from '@remotion/cli/config';

// The normal, existing 038-041 proofs continue to use the tracked brand assets.
const privateDir = process.env.BDA_PILOT_046_PRIVATE_PUBLIC_DIR;
if (privateDir) {
  const expected = path.resolve(homedir(), '.bda-pilot-stage-046');
  if (
    process.env.BDA_PILOT_046_VISUAL_PREVIEW !== 'TRUE' ||
    path.resolve(privateDir) !== expected ||
    realpathSync(expected) !== expected ||
    !statSync(expected).isDirectory() ||
    (statSync(expected).mode & 0o077) !== 0
  ) {
    throw new Error('046 private visual preview requires the isolated operator-owned stage');
  }
  Config.setPublicDir(expected);
} else {
  Config.setPublicDir(path.resolve(process.cwd(), '../../assets'));
}
