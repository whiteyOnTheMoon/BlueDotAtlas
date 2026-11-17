// BlueDotAtlas Roadmap M00/007 — reproducible 10s, 1920x1080 motion demo.
// Uses the original approved SVG logo unchanged and OFL licensed real fonts.
// Animation graphics are original abstract contour art, NOT satellite observations.
// Run in CI: node scripts/render-motion-test.mjs
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright';

const root=process.cwd();
const out=resolve(root,'.tmp-motion-results');mkdirSync(out,{recursive:true});
const keys={
  '/motion':{file:'assets/brand/motion/preview.html',mime:'text/html; charset=utf-8'},
  '/assets/brand/logo/logo-dark.svg':{file:'assets/brand/logo/logo-dark.svg',mime:'image/svg+xml'},
  '/fonts/space.woff2':{file:'.tmp-fonts/SpaceGrotesk-variable.woff2',mime:'font/woff2'},
  '/fonts/inter-regular.woff2':{file:'.tmp-fonts/Inter-Regular.woff2',mime:'font/woff2'},
  '/fonts/inter-semibold.woff2':{file:'.tmp-fonts/Inter-SemiBold.woff2',mime:'font/woff2'},
};
for(const [url,k] of Object.entries(keys)){
  const bytes=readFileSync(resolve(root,k.file));
  if(k.mime==='font/woff2' && bytes.subarray(0,4).toString('ascii')!=='wOF2') throw new Error('Not WOFF2: '+k.file);
  if(k.mime==='image/svg+xml'&&!bytes.toString().includes('blue-dot-atlas-contour-v1'))throw new Error('Wrong/unapproved SVG: '+k.file);
}
const server=createServer((req,res)=>{
  const item=keys[new URL(req.url,'http://localhost').pathname];
  if(!item){res.writeHead(404);res.end('not found');return;}
  try{
    const b=readFileSync(resolve(root,item.file));
    res.writeHead(200,{'Content-Type':item.mime,'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});res.end(b);
  }catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const viewport={width:1920,height:1080,deviceScaleFactor:1};
let page;
const errors=[];
const output=join(out,'BlueDotAtlas_007_Motion_Test.mp4');
let qa;
try{
  page=await browser.newPage({viewport});
  page.on('pageerror',err=>errors.push(String(err)));
  page.on('response',resp=>{if(!resp.ok())errors.push(resp.url()+' => HTTP '+resp.status());});
  page.on('requestfailed',req=>errors.push('Failed '+req.url()+': '+req.failure()?.errorText));
  await page.goto('http://127.0.0.1:'+port+'/motion',{waitUntil:'load'});
  const ready=await page.evaluate(async()=>{
    await Promise.all([
      document.fonts.load('700 63px "Space Grotesk Demo"'),
      document.fonts.load('400 26px "Inter Demo"'),
      document.fonts.load('600 26px "Inter Demo"'),
    ]);
    await document.fonts.ready;
    const images=[...document.images];
    await Promise.all(images.map(img=>img.decode()));
    const loaded=[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight}));
    const fonts={
      display:loaded.some(f=>f.family==='Space Grotesk Demo'),
      interRegular:loaded.some(f=>f.family==='Inter Demo'&&f.weight==='400'),
      interSemibold:loaded.some(f=>f.family==='Inter Demo'&&f.weight==='600 700'),
    };
    const overlayBounds=[...document.querySelectorAll('.overlay')].map(el=>{
      const r=el.getBoundingClientRect();
      return {id:el.id,x:r.x,y:r.y,w:r.width,h:r.height,
        areaFraction:+(r.width*r.height/(1920*1080)).toFixed(4),
        inFrame:r.left>=0&&r.top>=0&&r.right<=1920&&r.bottom<=1080};
    });
    return {fonts,loaded,logoLoaded:images.length===2&&images.every(x=>x.complete&&x.naturalWidth>0),
      animationSource:window.motionSpec,overlayBounds};
  });
  if(!Object.values(ready.fonts).every(Boolean))throw new Error('Real OFL font loading incomplete: '+JSON.stringify(ready.fonts));
  if(!ready.logoLoaded)throw new Error('Approved SVG logo image was not loaded (both intro and outro)');
  if(ready.animationSource.seconds!==10||ready.animationSource.fps!==30)throw new Error('Unexpected clip timeline');
  if(ready.overlayBounds.some(b=>!b.inFrame||b.areaFraction>.16))throw new Error('Too-large or offscreen overlay: '+JSON.stringify(ready.overlayBounds));

  // Validate exactly the intended animated elements are visible at time checkpoints.
  const checks=[
    [0.0,  {intro:0,lowerThird:0,mapMarker:0,source:0,outro:0}],
    [1.45, {intro:1,lowerThird:0,mapMarker:0,source:0,outro:0}],
    [4.25, {intro:0,lowerThird:1,mapMarker:1,source:0,outro:0}],
    [7.3,  {intro:0,lowerThird:0,mapMarker:0,source:1,outro:0}],
    [9.2,  {intro:0,lowerThird:0,mapMarker:0,source:0,outro:1}],
  ];
  const checkpoints=[];
  for(const [second,expected] of checks){
    const state=await page.evaluate(t=>window.setMotionTime(t),second);
    const matched=Object.entries(expected).every(([key,target])=>target?state[key]>.90:state[key]<.10);
    checkpoints.push({second,matched,state});
    if(!matched)throw new Error('Timing assertion failed '+JSON.stringify(checkpoints.at(-1)));
  }
  const proc=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe',
    '-vcodec','png','-framerate','30','-i','pipe:0',
    '-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p',
    '-movflags','+faststart','-an',output],{stdio:['pipe','ignore','pipe']});
  let stderr='';proc.stderr.on('data',d=>stderr+=String(d));
  const snapFrames=new Map([[24,'logo-intro'],[126,'location-lower-third'],[219,'source-caption'],[276,'outro']]);
  for(let frame=0;frame<300;frame++){
    await page.evaluate(t=>window.setMotionTime(t),frame/30);
    const png=await page.screenshot({type:'png',animations:'disabled'});
    if(snapFrames.has(frame))writeFileSync(join(out,snapFrames.get(frame)+'.png'),png);
    if(!proc.stdin.write(png))await once(proc.stdin,'drain');
    if(frame%75===0)console.log('Encoded frame '+frame+'/300');
  }
  proc.stdin.end();
  const [code]=await once(proc,'close');
  if(code!==0)throw new Error('FFmpeg encode failed (exit '+code+'): '+stderr);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0',
    '-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames',
    '-show_entries','format=duration,size','-of','json',output],{encoding:'utf8'}));
  const stream=probe.streams[0],duration=Number(probe.format.duration);
  if(stream.codec_name!=='h264'||stream.width!==1920||stream.height!==1080||
    stream.r_frame_rate!=='30/1'||Math.abs(duration-10)>.12){
      throw new Error('Invalid final MP4 stream '+JSON.stringify(probe));
    }
  if(errors.length)throw new Error('Browser errors '+errors.join(' | '));
  qa={task:'007',outcome:'PASS',clip:output,format:{size:'1920x1080',fps:30,durationSeconds:duration,
    codec:stream.codec_name,frames:Number(stream.nb_frames)||300,silent:true},
    originalArt:true,scientificNotice:'ILLUSTRATIVE / NO OBSERVATIONAL DATA',
    realFonts:ready.fonts,logoLoaded:ready.logoLoaded,
    overlayBounds:ready.overlayBounds,timing:checkpoints,sourceSpec:ready.animationSource,
    acceptanceLimit:'This validates a draft animation. User motion review and approval still required.'};
  writeFileSync(join(out,'motion-007-qa.json'),JSON.stringify(qa,null,2)+'\n');
  console.log('PASS motion-007: actual logo, licensed fonts, lower third, source text, map marker, outro; 1920×1080 30fps 10s.');
}finally{
  if(page)await page.close();
  await browser.close();
  await new Promise(r=>server.close(r));
}
