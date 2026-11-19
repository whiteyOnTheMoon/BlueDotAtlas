import { generatePasswordHash } from '../dist/password.js';

let password = '';
for await (const chunk of process.stdin) {
  password += String(chunk);
  if (password.length > 512) throw new Error('Input too long');
}
if (password.endsWith('\n')) password = password.slice(0, -1);
if (password.endsWith('\r')) password = password.slice(0, -1);
if (!password) throw new Error('Read admin password from standard input; not a command argument');
process.stdout.write((await generatePasswordHash(password)) + '\n');
