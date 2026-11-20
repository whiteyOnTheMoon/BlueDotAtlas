import path from 'node:path';
import { Config } from '@remotion/cli/config';

// The already-approved source MP4s stay byte-for-byte in repository assets.
Config.setPublicDir(path.resolve(process.cwd(), '../../assets'));
