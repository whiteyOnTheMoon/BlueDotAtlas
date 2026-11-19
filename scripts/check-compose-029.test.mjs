import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewCompose } from './check-compose-029.mjs';

const valid = (mode = 'base') => {
  const x = {
    name: 'bluedotatlas',
    networks: { edge: {}, private_db: { internal: true } },
    services: {
      db: { networks: { private_db: {} }, mem_limit: 512 * 1024 ** 2,
        cpus: 0.25, volumes: [{ type: 'volume', target: '/var/lib/postgresql/data' }] },
      web: { networks: { edge: {}, private_db: {} }, mem_limit: 384 * 1024 ** 2,
        cpus: 0.25, read_only: true, cap_drop: ['ALL'],
        depends_on: { db: { condition: 'service_healthy' } } },
      worker: { networks: { private_db: {} }, mem_limit: 1024 * 1024 ** 2,
        cpus: 0.5, read_only: true, profiles: ['future-renderer'], cap_drop: ['ALL'] },
      migrate: { networks: { private_db: {} }, profiles: ['maintenance'] },
    },
  };
  if (mode === 'loopback') {
    x.services.web.ports = [{ host_ip: '127.0.0.1', target: 3000, published: '18029' }];
  }
  if (mode === 'tunnel') {
    x.secrets = { bda_tunnel_token: { file: '/tmp/private-synthetic-token' } };
    x.services.cloudflared = {
      profiles: ['future-tunnel'], user: '1000:1000', networks: { edge: {} },
      mem_limit: 128 * 1024 ** 2, cpus: 0.1, read_only: true,
      cap_drop: ['ALL'], depends_on: { web: { condition: 'service_healthy' } },
      command: ['tunnel', '--no-autoupdate', 'run', '--token-file', '/run/secrets/bda_tunnel_token'],
      secrets: [{ source: 'bda_tunnel_token' }],
      image: 'cloudflare/cloudflared:ci-placeholder',
    };
  }
  return x;
};

test('base Compose has no host ports, internal DB, disabled worker', () => {
  assert.deepEqual(reviewCompose(valid('base'), 'base'), []);
});
test('local-only overlay permits exactly one loopback-only web port', () => {
  assert.deepEqual(reviewCompose(valid('loopback'), 'loopback'), []);
});
test('Cloudflare variant has zero host ports and private token file', () => {
  assert.deepEqual(reviewCompose(valid('tunnel'), 'tunnel'), []);
});
test('rejects public web and DB ports, private network leak, worker startup', () => {
  const x = valid('loopback');
  x.services.db.ports = [{ host_ip: '0.0.0.0', target: 5432 }];
  x.networks.private_db.internal = false;
  x.services.web.ports[0].host_ip = '0.0.0.0';
  x.services.worker.profiles = [];
  assert.ok(reviewCompose(x, 'loopback').length >= 4);
});
test('rejects resource, host networking and privileged Docker access', () => {
  const x = valid('base');
  x.services.web.mem_limit = 2 * 1024 ** 3;
  x.services.db.cpus = 2;
  x.services.worker.privileged = true;
  x.services.db.network_mode = 'host';
  assert.ok(reviewCompose(x, 'base').length >= 4);
});
test('rejects public tunnel origin, direct DB edge, missing token-file and weak caps', () => {
  const x = valid('tunnel');
  x.services.web.ports = [{ host_ip: '127.0.0.1', target: 3000 }];
  x.services.cloudflared.networks.private_db = {};
  x.services.cloudflared.command = ['tunnel', 'run', '--token', 'BAD'];
  x.services.cloudflared.cap_drop = [];
  assert.ok(reviewCompose(x, 'tunnel').length >= 4);
});
test('tunnel file secret must be accessible only under a reviewed nonroot UID:GID', () => {
  const x = valid('tunnel');
  delete x.services.cloudflared.user;
  assert.ok(reviewCompose(x, 'tunnel').some(error => error.includes('nonroot numeric')));
  x.services.cloudflared.user = '0:0';
  assert.ok(reviewCompose(x, 'tunnel').some(error => error.includes('nonroot numeric')));
});

test('tunnel service cannot be implicitly enabled in plain base', () => {
  assert.ok(reviewCompose(valid('tunnel'), 'base').length >= 1);
});
