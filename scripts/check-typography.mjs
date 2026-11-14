// BlueDotAtlas Roadmap M00/005 — reproducible real-font browser legibility check.
// Run via .github/workflows/typography-check.yml. No font files are distributed in the test output.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, extname, normalize, sep } from 'node:path';

const root = process.cwd();
const required = [
  '.tmp-fonts/SpaceGrotesk-variable.woff2',
  '.tmp-fonts/Inter-Regular.woff2',
  '.tmp-fonts/Inter-SemiBold.woff2',
  'assets/brand/fonts/licenses/INTER-OFL.txt',
  'assets/brand/fonts/licenses/SPACE-GROTESK-OFL.txt',
];
for (const p of required) {
  if (!existsSync(resolve(root,p))) throw new Error('Missing licensed font/notice: ' + p);
}
for (const p of required.filter(x=>x.endsWith('.woff2'))) {
  const magic=readFileSync(resolve(root,p)).subarray(0,4).toString('ascii');
  if(magic !== 'wOF2') throw new Error('Not a valid WOFF2 source file: ' + p);
}
const output=resolve(root,'.tmp-typography-results');
mkdirSync(output,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
  try {
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const full=resolve(root,'.'+normalize(path));
    if(!(full===root || full.startsWith(root+sep))) throw new Error('Outside repo');
    const bytes=readFileSync(full);
    res.writeHead(200,{'Content-Type':MIME[extname(full)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(bytes);
  } catch(e) {
    res.writeHead(404,{'Content-Type':'text/plain'});res.end('Missing fixture');
  }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const tests=[];
try {
  for(const cfg of [
    {label:'mobile-375',width:375,height:812,layout:'mobile'},
    {label:'tablet-768',width:768,height:1024,layout:'mobile'},
    {label:'fullhd-1920',width:1920,height:1080,layout:'film'},
  ]) {
    const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.url().endsWith('.woff2') && !r.ok())errors.push('Font HTTP '+r.status()+' '+r.url());});
    await page.goto('http://127.0.0.1:'+port+'/scripts/fixtures/type-readability.html',{waitUntil:'load'});
    await page.evaluate(async layout=>{
      document.querySelector(layout==='mobile'?'#film':'#mobile').style.display='none';
      await Promise.all([
        document.fonts.load('700 72px SpaceGroteskTest'),
        document.fonts.load('600 56px InterTest'),
        document.fonts.load('400 16px InterTest'),
      ]);
      await document.fonts.ready;
    },cfg.layout);
    const evidence=await page.evaluate(layout=>{
      const faces=Array.from(document.fonts).filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight,status:f.status}));
      const loaded={space:faces.some(f=>f.family==='SpaceGroteskTest'),interRegular:faces.some(f=>f.family==='InterTest'&&f.weight==='400'),interSemibold:faces.some(f=>f.family==='InterTest'&&f.weight==='600')};
      const selectors=layout==='film'?['#film .film-meta','#film .film-title','#film .film-caption']:['#mobile .meta','#mobile .headline','#mobile .body','#mobile .card','#mobile .button'];
      const elements=selectors.map(selector=>{
        const el=document.querySelector(selector),r=el.getBoundingClientRect(),style=getComputedStyle(el);
        return {selector,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),font:style.fontFamily,size:style.fontSize,scrollOverflow:el.scrollWidth>el.clientWidth+1,viewportOverflow:r.left<0||r.right>innerWidth+1};
      });
      const title=elements.find(e=>e.selector==='#film .film-title');
      const caption=elements.find(e=>e.selector==='#film .film-caption');
      const safe=layout==='film'?{titleWithin: title.x>=96&&title.y>=54&&title.x+title.w<=1824&&title.y+title.h<=1026,captionWithin:caption.x>=96&&caption.y>=54&&caption.x+caption.w<=1824&&caption.y+caption.h<=1026,titleSeparated:title.y+title.h+40<=caption.y}:null;
      return {loaded,faces,elements,safe,bodyScrollWidth:document.body.scrollWidth,viewportWidth:innerWidth};
    },cfg.layout);
    const pass=errors.length===0&&Object.values(evidence.loaded).every(Boolean)&&evidence.elements.every(e=>!e.scrollOverflow&&!e.viewportOverflow)&&evidence.bodyScrollWidth<=cfg.width+1&&(!evidence.safe||Object.values(evidence.safe).every(Boolean));
    tests.push({viewport:cfg.label,pass,errors,evidence});
    await page.screenshot({path:resolve(output,cfg.label+'.png'),fullPage:false});
    console.log((pass?'PASS':'FAIL')+' '+cfg.label+' fonts='+JSON.stringify(evidence.loaded)+' safe='+JSON.stringify(evidence.safe)+' browserErrors='+errors.length);
    if(!pass)console.log(JSON.stringify(tests[tests.length-1],null,2));
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
const report={project:'BlueDotAtlas',task:'005',status:tests.every(t=>t.pass)?'pass':'fail',tests};
writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2));
console.log('SUMMARY '+tests.filter(t=>t.pass).length+'/'+tests.length+' viewports PASS');
if(report.status!=='pass') process.exitCode=1;
