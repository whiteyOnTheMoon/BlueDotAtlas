// Task 012: static validation of operator-supplied VPS audit documentation.
// Never execute the inventory collector on GitHub CI.
import {readFileSync, existsSync} from 'node:fs';
const doc = readFileSync('docs/infra/vps-audit.md','utf8');
const collector = readFileSync('scripts/audit-vps.sh','utf8');
let passed = 0, total = 0;
function test(name, valid) {
  total++;
  if (valid) passed++;
  console.log((valid ? 'PASS ' : 'FAIL ') + name);
}
for (const category of ['CPU', 'RAM', 'Swap', 'ext4', 'I/O', 'Docker', 'Netzwerk', 'SSD']) {
  test('Inventory category ' + category, doc.includes(category));
}
for (const role of ['Web/API','PostgreSQL/DB','Render-Worker']) {
  test('Budget includes '+role, doc.includes(role));
}
test('Initial and final operator snapshots', doc.includes('17.11.') && doc.includes('89G') && doc.includes('24 %'));
test('Four CPUs and RAM documented', doc.includes('4 logische CPUs') && doc.includes('7,8 GiB'));
test('Post-cleanup services counted', doc.includes('43 laufende') && doc.includes('5/5'));
test('Disk reservations and scratch', doc.includes('40G') && doc.includes('20G') && doc.includes('12G'));
test('No false render approval', doc.includes('0 produktive Jobs') && doc.includes('Aufgabe 013'));
test('Unknown provider limits disclosed', doc.includes('Provider') && doc.includes('nicht verifiziert'));
test('Safety and provenance', doc.includes('Betreiber-Terminalmessungen') && doc.includes('keine SSH-Verbindung'));
test('Collector is read-only', collector.includes('READ-ONLY') && collector.includes('No sudo'));
test('Collector uses Linux measurements', ['/proc/meminfo','/proc/pressure/io','df -P','docker version'].every(v=>collector.includes(v)));
test('No secret or network dumps', collector.includes('no IP/MAC') && collector.includes('no port details'));
test('No destructive commands in collector', !collector.split('\n').filter(l=>!l.trimStart().startsWith('#')).some(l=> /(?:^|[;\s])(sudo|curl|wget|dd|fio|mkfs|rm -rf|iperf3|speedtest|apt-get|iptables|docker run)(?:\s|$)/.test(l)));
test('Expected files present', existsSync('scripts/audit-vps.sh') && existsSync('docs/infra/vps-audit.md'));
console.log('SUMMARY '+passed+'/'+total+' static checks PASS (no VPS accessed)');
if (passed !== total) process.exitCode = 1;
