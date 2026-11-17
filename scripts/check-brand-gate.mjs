// BlueDotAtlas Brand Gate 009 — browser QA of the genuine original-asset review board.
// Not a motion production test or a simulation of scientifically observed data.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root=process.cwd(), resultsDir=resolve(root,'.tmp-brand-gate-qa');
mkdirSync(resultsDir,{recursive:true});
const boardPath='design/brand-gate-v01/index.html';
const framePath='design/brand-gate-v01/storyboard-1080p.svg';
const board=readFileSync(resolve(root,boardPath),'utf8');
const frame=readFileSync(resolve(root,framePath),'utf8');
const kit=readFileSync(resolve(root,'docs/brand/brand-kit-v01.md'),'utf8');
const required=[
 'assets/brand/logo/logo-dark.svg','assets/brand/logo/logo-light.svg',
 'assets/brand/thumbnails/template.svg','assets/brand/thumbnails/mockups/ocean-currents.svg',
 'assets/brand/thumbnails/mockups/changing-ice.svg','assets/brand/thumbnails/mockups/storm-from-space.svg',
 'assets/brand/motion/final/BlueDotAtlas Intro.mp4','assets/brand/motion/final/BlueDotAtlas_Outro.mp4',
 'packages/ui/tokens/colors.ts','docs/brand/brand-brief.md','design/ui-kit-v01/index.html'
];
for(const path of required){if(!existsSync(resolve(root,path)))throw new Error('Missing reviewed original: '+path);}
if(!frame.includes('viewBox="0 0 1920 1080"')||!frame.includes('width="1920" height="1080"'))throw new Error('Storyboard frame must be exact 1920x1080.');
if(!frame.includes('ILLUSTRATION ONLY')||!frame.includes('NO MEASURED OR SATELLITE DATA'))throw new Error('Storyboard illustration disclaimer missing.');
if(!board.includes('../../assets/brand/logo/logo-dark.svg')||!board.includes('../../assets/brand/logo/logo-light.svg'))
 throw new Error('Missing original logo references in review board.');
for(const section of ['Logo','Colors','Typography','Thumbnail','Voice Character','Motion Assets','Storyboard']){
 if(!board.includes(section))throw new Error('Brand gate review section missing: '+section);
}
for(const evidence of ['DEC-024','0,3s','10-Sekunden','nicht als offizielles Intro']) {
 if(!kit.includes(evidence))throw new Error('Missing document evidence: '+evidence);
}
const mime={'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.css':'text/css','.mp4':'video/mp4'};
const server=createServer((req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(root,'.'+pathname);
  if(!file.startsWith(root+'/')||!existsSync(file)){res.writeHead(404);res.end('missing');return;}
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'text/plain'});
  res.end(readFileSync(file));
 }catch(e){res.writeHead(500);res.end('error');}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
let errors=[], checks=[];
try{
 for(const width of [1440,960,375]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  page.on('pageerror',err=>errors.push('JS '+err.message));
  page.on('response',response=>{
   if(response.status()>=400)errors.push(response.status()+' '+response.url());
  });
  await page.goto('http://127.0.0.1:'+port+'/'+boardPath,{waitUntil:'networkidle'});
  const result=await page.evaluate(()=>{
   return {clientWidth:document.documentElement.clientWidth,
      documentWidth:document.documentElement.scrollWidth,
      images:[...document.images].map(img=>({alt:img.alt,src:img.getAttribute('src'),complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight})),
      headings:[...document.querySelectorAll('h2')].map(h=>h.textContent),
      links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))};
  });
  const broken=result.links.filter(url=>url.startsWith('http:')||url.startsWith('https:'));
  if(broken.length)errors.push('external links are not included in this local brand board: '+broken.join(','));
  for(const url of result.links.filter(x=>!x.startsWith('#')&&!x.startsWith('http'))){
   const path=resolve(root,'design/brand-gate-v01',decodeURIComponent(url));
   if(!existsSync(path))errors.push('broken relative link: '+url);
  }
  const passed=result.documentWidth<=result.clientWidth+1&&result.images.every(x=>x.complete&&x.naturalWidth>0);
  if(!passed)errors.push('bad responsive board at '+width+': '+JSON.stringify(result).slice(0,700));
  console.log((passed?'PASS':'FAIL')+' brand board '+width+'px, images '+result.images.length+', layout '+result.documentWidth+'/'+result.clientWidth);
  checks.push({width,passed,images:result.images.length});
  await page.screenshot({path:resolve(resultsDir,'brand-gate-'+width+'.png'),fullPage:true});
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:'+port+'/'+framePath,{waitUntil:'networkidle'});
 const dims=await page.evaluate(()=>{
   const svg=document.querySelector('svg');
   return {svg:!!svg,viewBox:svg?.getAttribute('viewBox'),width:svg?.getAttribute('width'),height:svg?.getAttribute('height'),
    disclaimer:document.body?.textContent?.includes('ILLUSTRATION ONLY')||svg?.textContent?.includes('ILLUSTRATION ONLY')};
 });
 const framePassed=dims.svg&&dims.viewBox==='0 0 1920 1080'&&dims.width==='1920'&&dims.height==='1080'&&dims.disclaimer;
 if(!framePassed)errors.push('incorrect 1920p SVG DOM: '+JSON.stringify(dims));
 checks.push({type:'storyboard-1920x1080',passed:framePassed,dims});
 await page.screenshot({path:resolve(resultsDir,'storyboard-1920x1080.png')});
 console.log((framePassed?'PASS':'FAIL')+' storyboard full HD: '+JSON.stringify(dims));
 await page.close();
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
writeFileSync(resolve(resultsDir,'report.json'),JSON.stringify({task:'009',draft:true,checks,errors},null,2));
console.log('SUMMARY '+checks.filter(x=>x.passed).length+'/'+checks.length+' preview checks PASS');
if(errors.length){console.error('ERRORS: '+errors.join('\n'));process.exitCode=1;}
