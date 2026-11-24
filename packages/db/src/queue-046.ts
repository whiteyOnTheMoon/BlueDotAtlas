/** Separate, CI-isolated synthetic 046 render queue. Never a production entrypoint. */
export {
  assertRender046TestEnvironment,
  assertRender046ExecutionEnvironment,
  enqueueRender046,
  claimRender046,
  recoverRender046,
  requeueRender046,
  failRender046,
  cancelRender046,
  finishRender046,
  RENDER_046_MANIFEST,
  RENDER_046_FILM_MANIFEST,
  RENDER_046_FILM_KIND,
  RENDER_046_FILM_ERROR_CODES,
} from './render-046.js';
export type { Render046Claim, Render046Kind, Render046FilmErrorCode } from './render-046.js';
export { heartbeatJob } from './queue-service.js';
export { openDatabase } from './client.js';
