import { setTimeout as delay } from 'node:timers/promises';
import { runRender046Once } from './render-046.js';

const controller = new AbortController();
process.on('SIGTERM', () => controller.abort());
process.on('SIGINT', () => controller.abort());

async function main() {
  if (process.env.BDA_RENDER_046_VPS_SYNTHETIC === 'TRUE') {
    // One bounded queue consumer, not one process per HTTP request.
    while (!controller.signal.aborted) {
      await runRender046Once(controller.signal);
      if (!controller.signal.aborted) {
        await delay(2000, undefined, { signal: controller.signal }).catch(() => {});
      }
    }
    return;
  }

  const jobId = await runRender046Once(controller.signal);
  process.stdout.write(
    jobId ? '046 original synthetic 1080p queued render completed\n' : '046 no completed job\n',
  );
  if (!jobId) process.exitCode = 1;
}

main().catch(() => {
  process.stderr.write('046 bounded synthetic worker refused or failed\n');
  process.exitCode = 1;
});
