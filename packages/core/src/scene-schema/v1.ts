/**
 * Roadmap 049 – Scene-Director contract, version 1.
 *
 * A typed, validatable description of a BlueDotAtlas film: narration segments,
 * scenes (story beats), shots, asset/data/source references, animation
 * instructions, durations and transitions. Pure data + validation; it renders
 * nothing and grants no rights or publication.
 *
 * Time is measured in integer frames at the document's fixed frame rate.
 */
import { z } from 'zod';

export const SCENE_SCHEMA_VERSION = 1 as const;

const id = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/, 'ids start with a letter; letters, digits, _ and - only');
const frames = z.number().int('frames must be whole numbers').nonnegative();
const positiveFrames = z.number().int('frames must be whole numbers').positive();
const relativePath = z
  .string()
  .min(1)
  .max(240)
  .refine(
    (p) => !p.startsWith('/') && !p.split('/').includes('..') && !p.includes('\\'),
    'asset paths must be relative and must not contain ".."',
  );
const sha256 = z.string().regex(/^[a-f0-9]{64}$/, 'sha256 must be 64 lowercase hex characters');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dates use YYYY-MM-DD');

/** Story beats: the operator's V2 arc (048) plus brand frame and pauses. */
export const storyBeats = [
  'intro',
  'arrival',
  'context',
  'news',
  'meaning',
  'future',
  'takeaway',
  'pause',
  'outro',
] as const;

/** Visual kinds of a shot; alternation rules (050/052) work on these. */
export const shotKinds = [
  'brand_intro',
  'brand_outro',
  'footage_fullscreen',
  'footage_with_overlay',
  'breathing_video',
  'infographic',
  'map',
  'text_card',
] as const;

export const transitionTypes = ['cut', 'crossfade', 'dip_to_black', 'dip_to_white'] as const;
export const animationTypes = [
  'none',
  'push_in',
  'pull_out',
  'pan_left',
  'pan_right',
  'ken_burns',
  'diagram_build',
] as const;
export const overlayStyles = ['info_box', 'lower_third', 'source_credit', 'title'] as const;
export const assetKinds = [
  'footage',
  'still',
  'brand',
  'music',
  'voice',
  'map',
  'graphic',
] as const;
export const rightsStatuses = ['unreviewed', 'cleared', 'blocked', 'rejected'] as const;
export const sourceKinds = ['web', 'dataset', 'paper', 'agency_release'] as const;

export const SourceRef = z.strictObject({
  id,
  kind: z.enum(sourceKinds),
  publisher: z.string().min(1).max(120),
  title: z.string().min(1).max(240),
  url: z.url({ protocol: /^https$/, error: 'sources must be https URLs' }),
  checkedAt: isoDate,
});

export const AssetRef = z.strictObject({
  id,
  kind: z.enum(assetKinds),
  path: relativePath.optional(),
  sha256: sha256.optional(),
  rightsStatus: z.enum(rightsStatuses),
  credit: z.string().max(200).optional(),
  sourceIds: z.array(id).default([]),
});

export const DataRef = z.strictObject({
  id,
  sourceId: id,
  description: z.string().min(1).max(240),
  value: z.number().finite().optional(),
  unit: z.string().max(40).optional(),
});

export const Duration = z.strictObject({ frames: positiveFrames });

export const Transition = z
  .strictObject({
    type: z.enum(transitionTypes),
    frames: frames.max(60, 'transitions are at most 60 frames (2 s)'),
  })
  .refine((t) => (t.type === 'cut') === (t.frames === 0), {
    message: 'a cut has 0 frames; every other transition needs 1–60 frames',
    path: ['frames'],
  });

export const AnimationInstruction = z.strictObject({
  type: z.enum(animationTypes),
  /** Scale factor at start/end (push/pull/ken burns); 1 = no zoom. */
  fromScale: z.number().min(1).max(1.5).default(1),
  toScale: z.number().min(1).max(1.5).default(1),
  easing: z.enum(['linear', 'ease_in_out', 'ease_out']).default('ease_in_out'),
});

export const Overlay = z
  .strictObject({
    style: z.enum(overlayStyles),
    text: z.string().min(1).max(140, 'overlay text is limited to 140 characters'),
    startFrame: frames,
    endFrame: positiveFrames,
    sourceIds: z.array(id).default([]),
    dataRefIds: z.array(id).default([]),
  })
  .refine((o) => o.endFrame > o.startFrame, {
    message: 'overlay endFrame must be after startFrame',
    path: ['endFrame'],
  });

export const Shot = z.strictObject({
  id,
  kind: z.enum(shotKinds),
  duration: Duration,
  assetIds: z.array(id).default([]),
  /** Frame inside the source asset where this shot starts (trim). */
  assetInFrame: frames.default(0),
  overlays: z.array(Overlay).default([]),
  animation: AnimationInstruction.default({
    type: 'none',
    fromScale: 1,
    toScale: 1,
    easing: 'ease_in_out',
  }),
  transitionIn: Transition.default({ type: 'cut', frames: 0 }),
});

export const NarrationSegment = z
  .strictObject({
    id,
    text: z.string().min(1).max(400),
    /** Frames relative to the start of the containing scene. */
    startFrame: frames,
    endFrame: positiveFrames,
    sourceIds: z.array(id).default([]),
  })
  .refine((n) => n.endFrame > n.startFrame, {
    message: 'narration endFrame must be after startFrame',
    path: ['endFrame'],
  });

export const Scene = z.strictObject({
  id,
  beat: z.enum(storyBeats),
  title: z.string().min(1).max(120),
  shots: z.array(Shot).min(1, 'a scene needs at least one shot'),
  narration: z.array(NarrationSegment).default([]),
});

export const SceneDocument = z
  .strictObject({
    schemaVersion: z.literal(SCENE_SCHEMA_VERSION),
    id,
    title: z.string().min(1).max(160),
    language: z.literal('en'),
    fps: z.literal(30),
    width: z.literal(1920),
    height: z.literal(1080),
    durationFrames: positiveFrames,
    sources: z.array(SourceRef).default([]),
    assets: z.array(AssetRef).default([]),
    dataRefs: z.array(DataRef).default([]),
    scenes: z.array(Scene).min(1, 'a film needs at least one scene'),
    publicationAuthorized: z.literal(false),
  })
  .superRefine((doc, ctx) => {
    const issue = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    const unique = (ids: string[], path: string) => {
      const seen = new Set<string>();
      ids.forEach((value, i) => {
        if (seen.has(value)) issue(`duplicate id "${value}"`, [path, i, 'id']);
        seen.add(value);
      });
    };
    unique(
      doc.sources.map((s) => s.id),
      'sources',
    );
    unique(
      doc.assets.map((a) => a.id),
      'assets',
    );
    unique(
      doc.dataRefs.map((d) => d.id),
      'dataRefs',
    );
    unique(
      doc.scenes.map((s) => s.id),
      'scenes',
    );
    const shotIds = new Set<string>();

    const sourceIds = new Set(doc.sources.map((s) => s.id));
    const assets = new Map(doc.assets.map((a) => [a.id, a]));
    const dataIds = new Set(doc.dataRefs.map((d) => d.id));
    const needSources = (ids: string[], path: (string | number)[]) =>
      ids.forEach((sid, i) => {
        if (!sourceIds.has(sid)) issue(`unknown source "${sid}"`, [...path, i]);
      });

    doc.assets.forEach((a, i) => needSources(a.sourceIds, ['assets', i, 'sourceIds']));
    doc.dataRefs.forEach((d, i) => {
      if (!sourceIds.has(d.sourceId)) {
        issue(`unknown source "${d.sourceId}"`, ['dataRefs', i, 'sourceId']);
      }
    });

    let total = 0;
    doc.scenes.forEach((scene, si) => {
      let sceneFrames = 0;
      scene.shots.forEach((shot, hi) => {
        const at = ['scenes', si, 'shots', hi];
        if (shotIds.has(shot.id)) issue(`duplicate shot id "${shot.id}"`, [...at, 'id']);
        shotIds.add(shot.id);
        const length = shot.duration.frames;
        if (shot.transitionIn.frames >= length) {
          issue('transition must be shorter than the shot', [...at, 'transitionIn', 'frames']);
        }
        if (si === 0 && hi === 0 && shot.transitionIn.type !== 'cut') {
          issue('the first shot cannot transition in from nothing', [...at, 'transitionIn']);
        }
        const needsVisualAsset = [
          'brand_intro',
          'brand_outro',
          'footage_fullscreen',
          'footage_with_overlay',
          'breathing_video',
        ].includes(shot.kind);
        if (needsVisualAsset && shot.assetIds.length === 0) {
          issue(`a ${shot.kind} shot needs an asset`, [...at, 'assetIds']);
        }
        if (shot.kind === 'breathing_video' && shot.overlays.length > 0) {
          issue('a breathing_video shot is video only: no overlays', [...at, 'overlays']);
        }
        if (
          shot.kind === 'footage_fullscreen' &&
          shot.overlays.some((o) => o.style === 'info_box')
        ) {
          issue('info boxes belong to footage_with_overlay shots', [...at, 'overlays']);
        }
        shot.assetIds.forEach((aid, ai) => {
          const asset = assets.get(aid);
          if (!asset) issue(`unknown asset "${aid}"`, [...at, 'assetIds', ai]);
          else if (asset.rightsStatus === 'blocked' || asset.rightsStatus === 'rejected') {
            issue(`asset "${aid}" is ${asset.rightsStatus} and cannot be used`, [
              ...at,
              'assetIds',
              ai,
            ]);
          }
        });
        shot.overlays.forEach((overlay, oi) => {
          const op = [...at, 'overlays', oi];
          if (overlay.endFrame > length) issue('overlay ends after its shot', [...op, 'endFrame']);
          needSources(overlay.sourceIds, [...op, 'sourceIds']);
          overlay.dataRefIds.forEach((did, di) => {
            if (!dataIds.has(did))
              issue(`unknown data reference "${did}"`, [...op, 'dataRefIds', di]);
          });
        });
        sceneFrames += length;
      });
      const narration = [...scene.narration].sort((a, b) => a.startFrame - b.startFrame);
      scene.narration.forEach((segment, ni) => {
        const np = ['scenes', si, 'narration', ni];
        if (segment.endFrame > sceneFrames) {
          issue('narration runs past the end of its scene', [...np, 'endFrame']);
        }
        needSources(segment.sourceIds, [...np, 'sourceIds']);
      });
      for (let i = 1; i < narration.length; i++) {
        const prev = narration[i - 1];
        const cur = narration[i];
        if (prev && cur && cur.startFrame < prev.endFrame) {
          issue(`narration "${cur.id}" overlaps "${prev.id}"`, ['scenes', si, 'narration']);
        }
      }
      if (scene.beat === 'pause' && scene.narration.length > 0) {
        issue('a pause scene has no narration', ['scenes', si, 'narration']);
      }
      total += sceneFrames;
    });
    if (total !== doc.durationFrames) {
      issue(`shots add up to ${total} frames but durationFrames is ${doc.durationFrames}`, [
        'durationFrames',
      ]);
    }
  });

export type SceneDocumentV1 = z.infer<typeof SceneDocument>;
export type SceneV1 = z.infer<typeof Scene>;
export type ShotV1 = z.infer<typeof Shot>;

export type SceneValidationResult =
  { ok: true; document: SceneDocumentV1 } | { ok: false; errors: string[] };

/** Validate unknown JSON; errors are human-readable `path: message` lines. */
export function validateSceneDocument(input: unknown): SceneValidationResult {
  const parsed = SceneDocument.safeParse(input);
  if (parsed.success) return { ok: true, document: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map(
      (i) => (i.path.length ? i.path.join('.') : '(document)') + ': ' + i.message,
    ),
  };
}

/** JSON Schema (draft 2020-12) of the input format, for editors and other tools. */
export function sceneDocumentJsonSchema() {
  return z.toJSONSchema(SceneDocument, { io: 'input', unrepresentable: 'any' });
}
