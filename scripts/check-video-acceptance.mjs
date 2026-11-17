// BlueDotAtlas Roadmap 011: documentation QA, NOT an actual film test.
import { readFileSync, existsSync } from 'node:fs';
const text=readFileSync('docs/quality/video-acceptance.md','utf8');
const lines=text.split('\n');
let total=0,passed=0;
function check(label,ok){
 total++;if(ok)passed++;
 console.log((ok?'PASS':'FAIL')+' '+label);
}
check('Owner-approved criteria DEC-027; no actual film tested',text.includes('VERBINDLICH FREIGEGEBEN')&&text.includes('DEC-027')&&text.includes('Wir führen noch keinen echten Filmtest'));
for(const area of ['Technische Ausgabe','filmische Dynamik','Quellenbelege','Lizenzstatus','Sprache','Ton','Bedienbarkeit'])
 check('Roadmap area: '+area,text.toLowerCase().includes(area.toLowerCase()));
check('P60 and LONG profiles distinct',text.includes('P60')&&text.includes('LONG')&&text.includes('55–65s'));
const matrix=lines.filter(l=>/^\| \*\*V\d{2}\*\* \|/.test(l));
check('Exactly 18 matrix criteria',matrix.length===18);
for(let n=1;n<=18;n++){
 const id='V'+String(n).padStart(2,'0');
 const found=matrix.filter(l=>l.includes('**'+id+'**'));
 check(id+' unique matrix entry',found.length===1&&found[0].split('|').length>=7);
}
for(const status of ['PASS','FAIL','BLOCKED','N/A'])
 check('Defined status '+status,text.includes('**'+status+'**'));
check('Fail and blocking reject film',text.includes('NICHT BESTANDEN')&&text.includes('NICHT ABNAHMEFÄHIG'));
check('Human reviewer and evidence',text.includes('manuelle Entscheidung')&&text.includes('Nachweis')&&text.includes('Reviewer'));
check('0.3 second / 9 frame transitions',text.includes('0,3 Sekunden = 9 Frames')&&text.includes('stumme 6s-Outro'));
check('Original video assets and PRD exist',[
 'assets/brand/motion/final/BlueDotAtlas Intro.mp4',
 'assets/brand/motion/final/BlueDotAtlas_Outro.mp4',
 'docs/product/prd-v01.md'
].every(x=>existsSync(x)));
check('18 reviewer form placeholders',Array.from({length:18},(_,i)=>'- V'+String(i+1).padStart(2,'0')+': PASS|FAIL|BLOCKED|N/A, Nachweis').every(x=>text.includes(x)));
check('Only V18 P60 N/A explicitly allowed',text.includes('N/A nur bei P60 zulässig')&&text.includes('P60 optional / LONG Pflicht'));
check('Pilot and long-film separated',text.includes('60s-Pilot')&&text.includes('Langfilm')&&text.includes('8–10 Minuten'));
check('Does not claim a produced film',text.includes('kein reales Video')&&text.includes('keinen echten Filmtest'));
check('Owner explicitly approved 18 criteria and 55–65s P60',text.includes('- [x] Nutzer hat **die 18 Qualitätskriterien sowie das P60-Toleranzfenster 55–65 Sekunden ausdrücklich freigegeben**')&&text.includes('55–65 Sekunden verbindlich vom Nutzer freigegeben'));
console.log('SUMMARY '+passed+'/'+total+' DOCUMENT TESTS PASS');
if(passed!==total)process.exitCode=1;
