import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const COST = 16384;
const PARALLELISM = 1;
const BLOCK_SIZE = 8;
const HASH_BYTES = 64;
const MAX_MEMORY_BYTES = 64 * 1024 * 1024;

/** Constant-work, memory-hard scrypt; no plaintext credentials persisted. */
async function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      HASH_BYTES,
      { N: COST, r: BLOCK_SIZE, p: PARALLELISM, maxmem: MAX_MEMORY_BYTES },
      (error, hash) => (error ? reject(error) : resolve(hash)),
    );
  });
}

export async function generatePasswordHash(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) {
    throw new Error('Admin password must be between 12 and 256 characters');
  }
  const salt = randomBytes(16);
  const derived = await derive(password, salt);
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELISM}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/** Fail closed on unsupported/modified hash formats and constant-time comparison. */
export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  if (password.length > 256 || !/^scrypt\$16384\$8\$1\$[\da-f]{32}\$[\da-f]{128}$/i.test(encodedHash)) {
    return false;
  }
  const parts = encodedHash.split('$');
  const salt = Buffer.from(parts[4] ?? '', 'hex');
  const expected = Buffer.from(parts[5] ?? '', 'hex');
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, expected);
}
