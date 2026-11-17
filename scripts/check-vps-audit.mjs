// Roadmap 012: static audit-document and collector-safety checks ONLY.
// Never run scripts/audit-vps.sh in GitHub-hosted CI and pretend it is the VPS.
import {readFileSync,existsSync} from 'node:fs';
const doc=readFileSync('docs/infra/vps-audit.md','utf8');
const collector=readFileSync('scripts/audit-vps.sh','utf8');
let ok=0,total=0;
const test=(label,passed)=>{total++; if(passed)ok++;
 console.log((passed?'PASS':'FAIL')+' '+label);
};
for(const word of ['CPU','RAM','SSD','I/O','OS','Docker','Netzwerk','Bandbreite','Dienste']){
  test('Roadmap inventory category: '+word,doc.includes(word));
}
for(const component of ['Web','DB','Renderer']){
  test('Budget includes '+component,doc.includes(component));
}
test('Doc requires true VPS measurements',doc.includes('echte VPS-Messwerte fehlen')&&doc.includes('NICHT ERHOBEN'));
test('Doc clearly separates 013 render spike',doc.includes('Aufgabe 013')&&doc.includes('kein gemessener VPS-Nachweis'));
test('No fictional capacity budgets prefilled',doc.includes('OFFEN')&&doc.includes('BLOCKED'));
test('No raw passwords or IPs solicited',doc.includes('keine IPs, Hostnamen')&&doc.includes('keine')&&doc.includes('sensible'));
test('Collector is read-only',collector.includes('READ-ONLY')&&collector.includes('target="/"' )&&collector.includes('No sudo'));
test('Collector uses standard Linux resource sources',
  ['/proc/meminfo','/proc/pressure/io','/proc/net/dev','cpu.max','memory.max','docker version','systemctl','df -P'].every(v=>collector.includes(v)));
test('Collector omits IP/MAC/port details',collector.includes('no IP/MAC')&&collector.includes('no port details'));
test('No external network requests or destructive benchmark in executable source',
  !collector.split('\n').filter(line=>!line.trimStart().startsWith('#')).some(line=>
    /(?:^|[;\s])(sudo|curl|wget|dd|fio|mkfs|rm -rf|iperf3|speedtest|apt-get|iptables|docker run)(?:\s|$)/.test(line)));
test('SSH/external access is not assumed',doc.includes('keine Messdaten oder autorisierten SSH-')&&doc.includes('kein') );
test('No invented GitHub CI VPS metrics',doc.includes('GitHub Actions laufen in gehosteten Test-Runnern'));
test('Approval still pending',doc.includes('- [ ] **Messlauf auf dem echten VPS**')&&doc.includes('Aufgabe 012 ist noch NICHT abgenommen'));
test('Expected paths exist',existsSync('scripts/audit-vps.sh')&&existsSync('docs/infra/vps-audit.md'));
console.log('SUMMARY '+ok+'/'+total+' static audit checks PASS (no VPS contacted)');
if(ok!==total)process.exitCode=1;
