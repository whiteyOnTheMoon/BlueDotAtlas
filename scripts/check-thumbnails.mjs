// BlueDotAtlas M00/006 — check real fonts, 16:9 thumbnail bounds at 1280/320/160.
// Run via .github/workflows/thumbnail-check.yml.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=process.cwd();
const tmp=resolve(root,'.tmp-thumbnail-results');mkdirSync(tmp,{recursive:true});
const items=['ocean-currents','changing-ice','storm-from-space'];
const needed=['Inter-Regular.woff2','Inter-SemiBold.woff2','SpaceGrotesk-variable.woff2'];
for (const file of needed){
 const p=resolve(root,'.tmp-fonts',file);
 if(!existsSync(p)||readFileSync(p).subarray(0,4).toString('ascii')!=='wOF2')throw new Error('Invalid font '+file);
}
const server=createServer((req,res)=>{
 const k=decodeURIComponent(new URL(req.url,'http://localhost').pathname).split('/').pop();
 if(!needed.includes(k)){res.writeHead(404);res.end('not found');return;}
 const contents=readFileSync(resolve(root,'.tmp-fonts',k));
 res.writeHead(200,{'Content-Type':'font/woff2','Access-Control-Allow-Origin':'*'});res.end(contents);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const item of items){
  const source=readFileSync(resolve(root,'assets/brand/thumbnails/mockups/'+item+'.svg'),'utf8');
  if(!source.includes('viewBox="0 0 1280 720"'))throw new Error(item+': wrong canvas');
  if(!source.includes('NOT OBSERVATIONAL DATA'))throw new Error(item+': missing illustration notice');
  const svg=source.replace(/^<\?xml[^>]*>\s*/, '');
  for(const width of [1280,320,160]){
   const height=Math.round(width*720/1280);
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('response',r=>{if(r.url().endsWith('.woff2')&&!r.ok())errors.push('font load '+r.status());});
   const html=`<!doctype html><html lang="en"><head><meta charset="utf-8">
   <style>
     @font-face{font-family:'Space Grotesk';src:url('http://127.0.0.1:${port}/SpaceGrotesk-variable.woff2') format('woff2');font-weight:300 700}
     @font-face{font-family:'Inter';src:url('http://127.0.0.1:${port}/Inter-Regular.woff2') format('woff2');font-weight:400}
     @font-face{font-family:'Inter';src:url('http://127.0.0.1:${port}/Inter-SemiBold.woff2') format('woff2');font-weight:600 700}
     html,body{margin:0;background:#071522;width:${width}px;height:${height}px;overflow:hidden}
     svg{display:block;width:${width}px!important;height:${height}px!important}
   </style></head><body>${svg}</body></html>`;
   await page.goto('http://127.0.0.1:'+port+'/Inter-Regular.woff2').catch(()=>{}); // warm local font endpoint
   await page.setContent(html,{waitUntil:'load'});
   const check=await page.evaluate(async()=>{
     await Promise.all([document.fonts.load('700 94px "Space Grotesk"'),document.fonts.load('700 20px Inter'),document.fonts.load('400 15px Inter')]);
     await document.fonts.ready;
     const families=[...document.fonts].filter(x=>x.status==='loaded').map(x=>({family:x.family,weight:x.weight}));
     const loaded={space:families.some(x=>x.family==='Space Grotesk'),inter:families.some(x=>x.family==='Inter')};
     const svg=document.querySelector('svg');
     const texts=[...svg.querySelectorAll('text')].map(el=>{
       const b=el.getBBox();return {value:el.textContent,x:+b.x.toFixed(1),y:+b.y.toFixed(1),right:+(b.x+b.width).toFixed(1),bottom:+(b.y+b.height).toFixed(1),size:el.getAttribute('font-size')};
     });
     const title=texts.filter(t=>t.size==='94');
     return {loaded,texts,title,pixelWidth:svg.getBoundingClientRect().width};
   });
   const titlesFit=check.title.length>=2&&check.title.every(t=>t.x>=60&&t.right<=1216&&t.y>=120&&t.bottom<=650);
   const allFit=check.texts.every(t=>t.x>=0&&t.y>=0&&t.right<=1280&&t.bottom<=720);
   const passed=errors.length===0&&check.loaded.space&&check.loaded.inter&&titlesFit&&allFit;
   const out={item,width,height,passed,errors,titlesFit,allFit,loaded:check.loaded,titleRects:check.title};
   results.push(out);
   await page.screenshot({path:resolve(tmp,item+'-'+width+'.png')});
   console.log(`${passed?'PASS':'FAIL'} ${item} ${width}x${height} fonts=${JSON.stringify(check.loaded)} titlesFit=${titlesFit} allFit=${allFit} errors=${errors.length}`);
   if(!passed)console.log(JSON.stringify({out,allTexts:check.texts},null,2));
   await page.close();
  }
 }
}finally{
 await browser.close();await new Promise(r=>server.close(r));
}
const passed=results.filter(x=>x.passed).length;
writeFileSync(resolve(tmp,'report.json'),JSON.stringify({task:'006',passed,total:results.length,results},null,2));
console.log(`SUMMARY ${passed}/${results.length} thumbnail render/bounds checks PASS`);
if(passed!==results.length)process.exitCode=1;
