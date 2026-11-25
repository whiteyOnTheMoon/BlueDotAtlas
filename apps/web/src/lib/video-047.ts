import { Readable } from 'node:stream';
import { NextResponse, type NextRequest } from 'next/server';
import { RENDER_046_FILM_MANIFEST, RENDER_046_MANIFEST } from '@bluedotatlas/db/queue-046';
import { parseApiUuid } from '@bluedotatlas/db/api';
import { LocalStorage } from '@bluedotatlas/storage';
import { adminGate, databaseAction, methodDenied, problem, result } from './api-v1';
import { render046Enabled } from './render-046';

/**
 * Roadmap 047: protected admin preview, original download and technical
 * metadata of privately stored 046 renders. Read-only; never publishes.
 */
export function videoPreviewEnabled() {
  return render046Enabled('pilot_film') || render046Enabled('synthetic');
}

async function openVideoStorage(): Promise<LocalStorage> {
  if (
    process.env.BDA_RENDER_046_VPS_PILOT_FILM === 'TRUE' ||
    process.env.BDA_RENDER_046_VPS_SYNTHETIC === 'TRUE'
  ) {
    return LocalStorage.openRender046VpsReadRoot('/bda-media');
  }
  const root = process.env.BDA_046_TEST_STORAGE_ROOT;
  if (!root) throw new Error('047 test storage root missing');
  return LocalStorage.openIsolatedTestRoot(root);
}

type VideoRow = {
  id: string;
  title: string;
  status: string;
  durationMs: number | null;
  renderedAt: Date;
  sha256: string;
  rightsStatus: string;
  storageKey: string;
  kind: string;
  profile: string;
};

const VIDEO_SQL = `
  SELECT vd.id, vd.title, vd.status, vd.duration_ms AS "durationMs",
         vd.updated_at AS "renderedAt", a.checksum_sha256 AS "sha256",
         a.rights_status AS "rightsStatus", a.storage_key AS "storageKey",
         r.manifest->>'kind' AS kind, r.manifest->>'profile' AS profile
  FROM videos vd
  JOIN artifacts a ON a.id = vd.final_artifact_id
  JOIN render_jobs r ON r.video_id = vd.id AND r.status = 'succeeded'
  JOIN video_projects p ON p.id = vd.project_id
  WHERE vd.deleted_at IS NULL AND a.deleted_at IS NULL AND p.deleted_at IS NULL
    AND r.deleted_at IS NULL AND a.storage_key LIKE 'rendered/jobs/%'
    AND (r.manifest = $2::jsonb OR r.manifest = $3::jsonb)`;
const manifests = [JSON.stringify(RENDER_046_MANIFEST), JSON.stringify(RENDER_046_FILM_MANIFEST)];

export async function getProjectVideos(request: NextRequest, params: Promise<{ id: string }>) {
  const denied = await adminGate();
  if (denied) return denied;
  if (!videoPreviewEnabled()) {
    return problem(403, 'preview_not_authorized', 'Video preview is disabled');
  }
  if (request.nextUrl.searchParams.size) {
    return problem(400, 'invalid_input', 'Unexpected query parameters');
  }
  let projectId: string;
  try {
    projectId = parseApiUuid((await params).id);
  } catch {
    return problem(400, 'invalid_input', 'Invalid project identifier');
  }
  return databaseAction(async (connection) => {
    const rows = await connection.pool.query<VideoRow>(
      VIDEO_SQL + ' AND vd.project_id = $1::uuid ORDER BY vd.updated_at DESC, vd.id DESC LIMIT 10',
      [projectId, ...manifests],
    );
    const storage = await openVideoStorage();
    const items = [];
    for (const row of rows.rows) {
      let sizeBytes: number | null = null;
      try {
        const opened = await storage.openForStreaming(row.storageKey);
        sizeBytes = opened.size;
        await opened.close();
      } catch {
        sizeBytes = null; // listed, but marked unavailable
      }
      items.push({
        id: row.id,
        title: row.title,
        kind: row.kind,
        profile: row.profile,
        status: row.status,
        published: false,
        rightsStatus: row.rightsStatus,
        durationMs: row.durationMs,
        sizeBytes,
        sha256: row.sha256,
        renderedAt: row.renderedAt,
        available: sizeBytes !== null,
        mediaUrl: '/api/v1/videos/' + row.id + '/file',
        downloadUrl: '/api/v1/videos/' + row.id + '/file?download=1',
      });
    }
    return result({ items });
  });
}

/** Single `bytes=` range, RFC 9110; returns null for unsatisfiable or multi-range. */
export function parseByteRange(
  header: string | null,
  size: number,
): { start: number; end: number } | 'none' | null {
  if (!header) return 'none';
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === '' && match[2] === '') || size <= 0) return null;
  let start: number;
  let end: number;
  if (match[1] === '') {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    return null;
  }
  return { start, end };
}

export async function getVideoFile(request: NextRequest, params: Promise<{ id: string }>) {
  const denied = await adminGate();
  if (denied) return denied;
  if (!videoPreviewEnabled()) {
    return problem(403, 'preview_not_authorized', 'Video preview is disabled');
  }
  const query = request.nextUrl.searchParams;
  const download = query.get('download') === '1';
  if ([...query.keys()].some((key) => key !== 'download') || (query.size && !download)) {
    return problem(400, 'invalid_input', 'Only download=1 is accepted');
  }
  let videoId: string;
  try {
    videoId = parseApiUuid((await params).id);
  } catch {
    return problem(400, 'invalid_input', 'Invalid video identifier');
  }
  return databaseAction(async (connection) => {
    const rows = await connection.pool.query<VideoRow>(
      VIDEO_SQL + ' AND vd.id = $1::uuid LIMIT 1',
      [videoId, ...manifests],
    );
    const row = rows.rows[0];
    if (!row) return problem(404, 'not_found', 'Video not found');
    const storage = await openVideoStorage();
    let opened;
    try {
      opened = await storage.openForStreaming(row.storageKey);
    } catch {
      return problem(404, 'not_found', 'Video file unavailable');
    }
    const range = parseByteRange(request.headers.get('range'), opened.size);
    const headers: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition':
        (download ? 'attachment' : 'inline') + `; filename="bluedotatlas-${row.id}.mp4"`,
      ETag: `"${row.sha256}"`,
    };
    if (range === null) {
      await opened.close();
      return new NextResponse(null, {
        status: 416,
        headers: { ...headers, 'Content-Range': `bytes */${opened.size}` },
      });
    }
    const { start, end } = range === 'none' ? { start: 0, end: opened.size - 1 } : range;
    headers['Content-Length'] = String(end - start + 1);
    if (range !== 'none') headers['Content-Range'] = `bytes ${start}-${end}/${opened.size}`;
    if (request.method === 'HEAD') {
      await opened.close();
      return new NextResponse(null, { status: range === 'none' ? 200 : 206, headers });
    }
    const body = Readable.toWeb(opened.stream(start, end) as Readable) as ReadableStream;
    return new NextResponse(body, { status: range === 'none' ? 200 : 206, headers });
  });
}

export function readOnlyVideo047(request: NextRequest) {
  return methodDenied(request, 'GET, HEAD');
}
