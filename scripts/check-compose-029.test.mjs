import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewCompose } from './check-compose-029.mjs';

const valid = () => ({
  name: 'bluedotatlas-029',
  networks: { edge: {}, private_db: { internal: true } },
  services: {
    db: { networks: { private_db: {} }, mem_limit: 512 * 1024 ** 2, cpus: 0.25, volumes: [{ type: 'volume', target: '/var/lib/postgresql/data' }] },
    web: { networks: { edge: {}, private_db: {} }, mem_limit: 384 * 1024 ** 2, cpus: 0.25, read_only: true,
      ports: [{ host_ip: '127.0.0.1', target: 3000 }], cap_drop: ['ALL'], depends_on: { db: { condition: 'service_healthy' } } },
    worker: { networks: { private_db: {} }, mem_limit: 1024 * 1024 ** 2, cpus: 0.5, read_only: true,
      profiles: ['future-renderer'], cap_drop: ['ALL'] },
    migrate: { networks: { private_db: {} }, profiles: ['maintenance'] },
  },
});

test('valid isolated scaffold is accepted', () => assert.deepEqual(reviewCompose(valid()), []));
test('rejects public DB ports, missing private isolation, public web binding and implicit worker', () => {
  const x = valid();
  x.services.db.ports = [{ host_ip: '0.0.0.0', target: 5432 }];
  x.networks.private_db.internal = false;
  x.services.web.ports[0].host_ip = '0.0.0.0';
  x.services.worker.profiles = [];
  assert.ok(reviewCompose(x).length >= 4);
});
test('rejects unbounded resource growth and host/privileged networking', () => {
  const x = valid();
  x.services.web.mem_limit = 2 * 1024 ** 3;
  x.services.db.cpus = 2;
  x.services.worker.privileged = true;
  x.services.db.network_mode = 'host';
  assert.ok(reviewCompose(x).length >= 4);
});
