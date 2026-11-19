import { runSyntheticWorker } from './index.js';

const controller = new AbortController();
process.on('SIGTERM', () => controller.abort());
process.on('SIGINT', () => controller.abort());

runSyntheticWorker({
  once: process.env.BDA_WORKER_ONCE === '1',
  signal: controller.signal,
})
  .then((handled) => {
    process.stdout.write('synthetic worker finished: ' + handled + ' claimed job(s)\n');
  })
  .catch(() => {
    // Fail closed without echoing credentials or connection strings to logs.
    process.stderr.write('synthetic worker failed; check isolated CI diagnostics\n');
    process.exitCode = 1;
  });
