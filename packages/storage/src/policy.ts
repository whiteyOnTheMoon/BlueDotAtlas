/** Roadmap 028: public storage keys are relative and ASCII-only, never host paths. */
export const storageAreas = ['uploads', 'cache', 'temp', 'rendered', 'backups', 'logs'] as const;
export type StorageArea = (typeof storageAreas)[number];
export type WritableArea = 'uploads' | 'cache' | 'temp' | 'rendered';
export type CleanupArea = 'temp' | 'cache';

export const FOLDER_PLAN = Object.freeze([...storageAreas]);
export const STORAGE_BUDGETS = Object.freeze({
  mediaBytes: 20 * 1024 ** 3,
  scratchBytes: 12 * 1024 ** 3,
});
export const MAX_SINGLE_WRITE_BYTES = 512 * 1024 ** 2;
export const MAX_READ_BYTES = 32 * 1024 ** 2;

export type StorageErrorCode =
  | 'invalid_area'
  | 'invalid_key'
  | 'invalid_root'
  | 'unsafe_path'
  | 'file_exists'
  | 'file_too_large'
  | 'storage_budget'
  | 'invalid_limit'
  | 'file_changed'
  | 'not_found';

export class StorageError extends Error {
  constructor(public readonly code: StorageErrorCode) {
    super('Storage operation denied: ' + code);
    this.name = 'StorageError';
  }
}

const segmentPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}$/;
const writableAreas: ReadonlySet<string> = new Set(['uploads', 'cache', 'temp', 'rendered']);
const allowedExtensions: Readonly<Record<WritableArea, ReadonlySet<string>>> = {
  uploads: new Set(['bin', 'mp4', 'webp', 'jpg', 'png', 'wav', 'mp3', 'srt']),
  cache: new Set(['bin', 'dat', 'json', 'mp4', 'webp', 'jpg', 'png', 'wav']),
  temp: new Set(['bin', 'dat', 'json', 'mp4', 'wav', 'png']),
  rendered: new Set(['mp4']),
};

export function assertWritableArea(area: string): asserts area is WritableArea {
  if (!writableAreas.has(area)) throw new StorageError('invalid_area');
}

export function assertCleanupArea(area: string): asserts area is CleanupArea {
  if (area !== 'temp' && area !== 'cache') throw new StorageError('invalid_area');
}

/** Excludes encoded traversal, dotfiles, drive letters, homoglyphs and hidden stage names. */
export function validateObjectKey(area: WritableArea, key: string): string[] {
  if (typeof key !== 'string' || key.length < 5 || key.length > 240) {
    throw new StorageError('invalid_key');
  }
  if (key.includes('\\') || key.includes('%') || key.includes('..') || key.startsWith('/')) {
    throw new StorageError('invalid_key');
  }
  const parts = key.split('/');
  if (parts.length > 4 || parts.some((p) => !segmentPattern.test(p) || p.endsWith('.'))) {
    throw new StorageError('invalid_key');
  }
  const file = parts.at(-1);
  const extension = file?.split('.').at(-1)?.toLowerCase();
  if (!extension || !allowedExtensions[area].has(extension) || file?.startsWith('.')) {
    throw new StorageError('invalid_key');
  }
  return parts;
}

export function parseStorageKey(key: string): { area: WritableArea; parts: string[] } {
  if (typeof key !== 'string' || !key.includes('/')) throw new StorageError('invalid_key');
  const [area, ...rest] = key.split('/');
  assertWritableArea(area ?? '');
  const parts = validateObjectKey(area, rest.join('/'));
  return { area, parts };
}

export function validateLimits(limits: { mediaBytes: number; scratchBytes: number }) {
  for (const [key, value] of Object.entries(limits)) {
    if (
      !['mediaBytes', 'scratchBytes'].includes(key) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > STORAGE_BUDGETS[key as keyof typeof STORAGE_BUDGETS]
    ) {
      throw new StorageError('invalid_limit');
    }
  }
}
