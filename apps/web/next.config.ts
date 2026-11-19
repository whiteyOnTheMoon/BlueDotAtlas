import type { NextConfig } from 'next';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // The DB workspace package lives above apps/web: include it in runtime tracing.
  outputFileTracingRoot: resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
};

export default config;
