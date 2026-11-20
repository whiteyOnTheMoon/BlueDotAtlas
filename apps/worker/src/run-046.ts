import { runRender046Once } from './render-046.js';

const controller = new AbortController();
process.on('SIGTERM', () => controller.abort());
process.on('SIGINT', () => controller.abort());

runRender046Once(controller.signal)
  .then((jobId) => {
    process.stdout.write(
      jobId ? '046 original synthetic 1080p queued render completed\n' : '046 no completed job\n',
    );
    if (!jobId) process.exitCode = 1;
  })
  .catch(() => {
    process.stderr.write('046 test-only render refused or failed\n');
    process.exitCode = 1;
  });
