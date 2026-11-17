// BlueDotAtlas Task 008 — browser test for real Chromium.
// Requires: npm install --no-save playwright@1.56.1; npx playwright install chromium.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const root=process.cwd(), out=resolve(root,'.tmp-ui-kit-qa');
mkdirSync(out,{recursive:true});
const html=readFileSync(resolve(root,'design/ui-kit-v01/index.html'),'utf8');
const css=readFileSync(resolve(root,'design/ui-kit-v01/ui-kit.css'),'utf8');
const colors=readFileSync(resolve(root,'packages/ui/tokens/colors.ts'),'utf8');
const ui=readFileSync(resolve(root,'packages/ui/tokens/ui.ts'),'utf8');
for(const path of ['assets/brand/logo/logo-dark.svg','assets/brand/logo/logo-light.svg',
 'assets/brand/thumbnails/mockups/ocean-currents.svg','assets/brand/thumbnails/mockups/changing-ice.svg',
 'assets/brand/thumbnails/mockups/storm-from-space.svg']){
 if(!existsSync(resolve(root,path)))throw new Error('Missing approved original asset: '+path);
}
for(const [name,expected] of [
 ['--page: #071522', 'dark background'], ['--page: #F7FBFF', 'light background'],
 ['--primary: #19B7F4','dark CTA'],['--primary: #026E9E','light CTA'],
 ['--border-control: #667E91','light field border'],
 ['--border-control: #6D92A9','dark field border']
]) if(!css.includes(name))throw new Error('Missing approved color mirror '+expected);
for(const word of ['deepSea: "#021934"','blueDotDark: "#19B7F4"','primary: "#026E9E"'])
 if(!colors.includes(word))throw new Error('Approved source palette mismatch '+word);
for(const component of ['Buttons','Inputs','Status badges','Cards','Stepper','Brand colors'])
 if(!html.includes(component))throw new Error('Component specimen missing '+component);
for(const t of ['galleryRatio: "16 / 9"', 'minHeight: "44px"', 'mobile: "640px"'])
 if(!ui.includes(t))throw new Error('UI token missing '+t);
if(html.includes('unsplash.com'))throw new Error('Unapproved external images');
if(!html.includes('../../assets/brand/logo/logo-dark.svg') || !html.includes('../../assets/brand/logo/logo-light.svg'))
 throw new Error('Not using official original SVG logos');

const contentType={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.js':'text/javascript'};
const server=createServer((request,res)=>{
 try {
   const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
   const safe=resolve(root,'.'+pathname);
   if (!safe.startsWith(root+'/') || !existsSync(safe)) { res.writeHead(404); res.end('Not found'); return; }
   const bytes=readFileSync(safe);
   res.writeHead(200,{'Content-Type':contentType[extname(safe)]||'application/octet-stream'});res.end(bytes);
 } catch(e){res.writeHead(500);res.end('Server error');}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const port=server.address().port;
const url='http://127.0.0.1:'+port+'/design/ui-kit-v01/index.html';
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const width of [1440,960,375]){
   const page=await browser.newPage({viewport:{width,height:950},deviceScaleFactor:1,reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push('JS: '+e.message));
   page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
   await page.goto(url,{waitUntil:'networkidle'});
   for(const theme of ['dark','light']){
     if((await page.getAttribute('html','data-theme'))!==theme)await page.click('#theme-toggle');
     for(const view of ['public','admin']){
       await page.click('#tab-'+view);
       await page.locator('#view-'+view).waitFor({state:'visible'});
       const metrics=await page.evaluate(()=>{
         const imgs=[...document.images].filter(x=>x.offsetParent!==null);
         return {
           docWidth:document.documentElement.scrollWidth,
           clientWidth:document.documentElement.clientWidth,
           active:[...document.querySelectorAll('[role="tab"]')].filter(t=>t.getAttribute('aria-selected')==='true').map(t=>t.id),
           imgs:imgs.map(x=>({src:x.getAttribute('src'),loaded:x.complete&&x.naturalWidth>0})),
           primary:getComputedStyle(document.querySelector('.button-primary')).backgroundColor,
         };
       });
       const passed=metrics.docWidth<=metrics.clientWidth+1 &&
         metrics.imgs.every(x=>x.loaded) &&
         metrics.active.length===1 && metrics.active[0]==='tab-'+view;
       results.push({width,theme,view,passed,metrics});
       await page.screenshot({path:resolve(out,'ui-kit-'+view+'-'+theme+'-'+width+'.png'),fullPage:true});
       console.log((passed?'PASS':'FAIL')+' '+width+'px '+theme+' '+view+': width='+metrics.docWidth+'/'+metrics.clientWidth+' imgs='+metrics.imgs.length);
       if(!passed)console.error(JSON.stringify(metrics));
     }
   }
   await page.focus('#tab-public');await page.keyboard.press('ArrowRight');
   const keyboard=await page.evaluate(()=>document.activeElement?.id==='tab-admin'&&document.getElementById('view-admin').hidden===false);
   if(!keyboard)errors.push('Tab keyboard arrow navigation failed');
   await page.click('#tab-public');await page.click('[data-filter="ocean"]');
   const visible=await page.locator('[data-topic]:visible').count();
   if(visible!==1)errors.push('Filter not functional, visible='+visible);
   await page.click('[data-filter="all"]');
   const gallery=await page.locator('[data-topic]:visible').count();
   if(gallery!==3)errors.push('Filter reset failed, visible='+gallery);
   // Use keyboard modality: :focus-visible intentionally does not light up after a mouse click.
   await page.keyboard.press('Tab');
   await page.focus('#theme-toggle');
   if(!await page.evaluate(()=>getComputedStyle(document.querySelector('#theme-toggle')).outlineStyle!=='none'))
     errors.push('Focus ring not visible');
   if(errors.length)throw new Error(width+'px browser errors:\n'+errors.join('\n'));
   await page.close();
 }
} finally {
 await browser.close();await new Promise(ok=>server.close(ok));
}
writeFileSync(resolve(out,'results.json'),JSON.stringify({task:'008',status:'DESIGN DRAFT',results},null,2));
const failures=results.filter(x=>!x.passed);
console.log('SUMMARY '+(results.length-failures.length)+'/'+results.length+' responsive UI preview checks PASS');
if(failures.length)process.exitCode=1;
