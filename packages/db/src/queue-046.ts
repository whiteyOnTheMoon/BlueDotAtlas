/** Separate, CI-isolated synthetic 046 render queue. Never a production entrypoint. */
export {
  assertRender046TestEnvironment,
  enqueueRender046,
  claimRender046,
  recoverRender046,
  requeueRender046,
  failRender046,
  cancelRender046,
  finishRender046,
  RENDER_046_MANIFEST,
} from './render-046.js';
export type { Render046Claim } from './render-046.js';
export { heartbeatJob } from './queue-service.js';
export { openDatabase } from './client.js';
