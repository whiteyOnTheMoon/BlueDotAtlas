import { setTimeout as delay } from 'node:timers/promises';
import { runPilotFilm046Once } from './film-046.js';

const controller = new AbortController();
process.on('SIGTERM', () => controller.abort());
process.on('SIGINT', () => controller.abort());

async function main() {
  if (process.env.BDA_RENDER_046_VPS_PILOT_FILM === 'TRUE') {
    // One bounded queue consumer for private pilot film jobs; one job at a time.
    while (!controller.signal.aborted) {
      await runPilotFilm046Once(controller.signal).catch((error: unknown) => {
        process.stderr.write('046 film worker cycle failed: ' + String(error) + '\n');
      });
      if (!controller.signal.aborted) {
        await delay(5000, undefined, { signal: controller.signal }).catch(() => {});
      }
    }
    return;
  }
  const jobId = await runPilotFilm046Once(controller.signal);
  process.stdout.write(
    jobId ? '046 private pilot film job completed\n' : '046 no completed film job\n',
  );
  if (!jobId) process.exitCode = 1;
}

main().catch(() => {
  process.stderr.write('046 private pilot film worker refused or failed\n');
  process.exitCode = 1;
});
