import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const url = 'http://127.0.0.1:3116';
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
if (!email || !password || !process.env.BDA_ADMIN_PASSWORD_HASH) throw new Error('Only CI synthetic credentials allowed');
const server = spawn('pnpm', ['--filter','@bluedotatlas/web','start','--hostname','127.0.0.1','--port','3116'], {
  cwd: process.cwd(), env: { ...process.env, NODE_ENV: 'production' },
  stdio: ['ignore','pipe','pipe'],
});
let output = '';
server.stdout.on('data', d => { output = (output + String(d)).slice(-3000); });
server.stderr.on('data', d => { output = (output + String(d)).slice(-3000); });
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Production app failed: ' + output);
    try { if ((await fetch(url + '/admin/login')).status === 200) { ready = true; break; } }
    catch { /* starting */ }
    await delay(500);
  }
  if (!ready) throw new Error('Production app startup failed: ' + output);
  const noCookie = await fetch(url + '/admin', {redirect:'manual'});
  assert.ok([307,308].includes(noCookie.status));
  const forged = await fetch(url + '/api/admin/session', {headers:{Cookie:'__Host-bda-session='+'a'.repeat(43)}});
  assert.equal(forged.status,401);
  const login = await fetch(url + '/api/auth/login',{
    method:'POST',redirect:'manual',
    headers:{origin:url,'content-type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({email,password}),
  });
  assert.equal(login.status,303);
  const setCookie=login.headers.get('set-cookie')??'';
  for(const rule of [/^__Host-bda-session=/,/;\s*HttpOnly/i,/;\s*Secure/i,/;\s*SameSite=Strict/i,/;\s*Path=\//i]) assert.match(setCookie,rule);
  assert.doesNotMatch(setCookie,/;\s*Domain=/i);
  const cookie=setCookie.split(';')[0];
  assert.equal((await fetch(url+'/api/admin/session',{headers:{Cookie:cookie}})).status,200);
  assert.equal((await fetch(url+'/admin',{headers:{Cookie:cookie},redirect:'manual'})).status,200);
  const logout=await fetch(url+'/api/auth/logout',{method:'POST',redirect:'manual',headers:{Cookie:cookie,origin:url}});
  assert.equal(logout.status,303);
  assert.match(logout.headers.get('set-cookie')??'',/Max-Age=0/i);
  assert.equal((await fetch(url+'/api/admin/session',{headers:{Cookie:cookie}})).status,401);
  process.stdout.write('Production authentication PASS: no/fake cookie denied, Secure __Host cookie, DB authorization, logout revocation.\n');
} finally {
  server.kill('SIGTERM');
}
