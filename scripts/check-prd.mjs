// BlueDotAtlas Roadmap 010 — deterministic PRD content/traceability gate.
// This is a static document test, not a running website/renderer test.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const path='docs/product/prd-v01.md';
const root=process.cwd();
const prd=readFileSync(resolve(root,path),'utf8');
const checks=[];
const test=(label,ok)=>{checks.push({label,ok:!!ok});console.log((ok?'PASS':'FAIL')+' '+label);};

test('PRD is an explicitly unapproved DRAFT',/Status: DRAFT/.test(prd)&&/Nutzerfreigabe steht aus/.test(prd));
test('Public library is defined',/Öffentliche Videothek/.test(prd)&&/ausschließlich.*veröffentlichte/.test(prd));
test('Protected single admin defined',/Einzeladmin/.test(prd)&&/Geschütztes Einzeladmin/.test(prd));
const steps=['New Video','News Sources','Discover Topics','Media Library','Script Studio','Voice Studio','Video Production'];
for(let i=0;i<steps.length;i++){
 const code=String(i+1).padStart(2,'0');
 test('Wizard '+code+' '+steps[i],prd.includes('| **'+code+'** | **'+steps[i]+'** |'));
}
test('60-second technical film proof before long film',/60-Sekunden-Pilotfilm/.test(prd)&&/60-Sekunden-Realfilm-Proof/.test(prd));
test('8–10 minute content-qualified target',/8–10 Minuten/.test(prd)&&/bei ausreichender Substanz|nur sofern Thema/.test(prd));
test('Manual publication',/Manuelle.*Freigabe/.test(prd)&&/manuelles.*Publish/.test(prd));
test('Autopublish excluded',/Autopublish/.test(prd)&&/YouTube Data API-Upload \| \*\*Ausgeschlossen V0\.1\*\*/.test(prd));
test('Multiuser excluded',/Mehrere Kanäle, Rollen, Nutzerkonten und Teams \| \*\*Ausgeschlossen V0\.1\*\*/.test(prd));
test('Full editor excluded',/Vollwertiger freier Timeline-\/Drag-and-Drop-Videoeditor \| \*\*Ausgeschlossen V0\.1\*\*/.test(prd));
test('MVP/later/excluded categories',/\*\*MVP\*\*/.test(prd)&&/\*\*Später\*\*/.test(prd)&&/\*\*Ausgeschlossen V0\.1\*\*/.test(prd));
test('No claim of implemented backend',/noch kein produktiver vollständiger End-to-End-Wizard/.test(prd));
test('Original brand video crossfades respected',/0,3s \/ 9 Frames/.test(prd)&&/Original-Intro 2,5s/.test(prd));
test('Links to relevant repo docs actually exist',[
 '../brand/brand-kit-v01.md',
 '../../design/ui-kit-v01/README.md',
 '../../assets/brand/motion/final/BlueDotAtlas%20Intro.mp4',
 '../../assets/brand/motion/final/BlueDotAtlas_Outro.mp4',
 '../../README.md'
].every(uri=>existsSync(resolve(root,dirname(path),decodeURIComponent(uri)))));
test('Owner approval of 010 deliberately pending',/- \[ \] \*\*PRD-V0\.1-Vorschlag durch den Nutzer ausdrücklich abgenommen/.test(prd));
const passed=checks.filter(x=>x.ok).length;
console.log('SUMMARY '+passed+'/'+checks.length+' PRD checks PASS');
if(passed!==checks.length)process.exitCode=1;
