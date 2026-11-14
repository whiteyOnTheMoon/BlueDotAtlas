// BlueDotAtlas — separate canonical 2.3s INTRO and 2.2s OUTRO MP4 proofs.
// Original logo-dark.svg is loaded unchanged and only its visual reveal/opacity/position animate.
// This proof uses an original abstract contour background, not geospatial or observational imagery.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";

const root=process.cwd(), out=resolve(root,".tmp-motion-logo-clips");
mkdirSync(out,{recursive:true});
const paths={
 "/motion":{path:"assets/brand/motion/logo-intro-outro.html",type:"text/html; charset=utf-8"},
 "/assets/brand/logo/logo-dark.svg":{path:"assets/brand/logo/logo-dark.svg",type:"image/svg+xml"},
 "/fonts/inter-regular.woff2":{path:".tmp-fonts/Inter-Regular.woff2",type:"font/woff2"},
 "/fonts/inter-semibold.woff2":{path:".tmp-fonts/Inter-SemiBold.woff2",type:"font/woff2"},
};
const logoSource=readFileSync(resolve(root,paths["/assets/brand/logo/logo-dark.svg"].path),"utf8");
if(!logoSource.includes('blue-dot-atlas-contour-v1')||
   !logoSource.includes('The Planet Has a Story.')||
   !logoSource.includes('BlueDotAtlas'))throw new Error("Wrong canonical logo source");
const web=createServer((req,res)=>{
 const pathname=new URL(req.url,"http://127.0.0.1").pathname;
 const entry=paths[pathname];
 if(!entry){res.writeHead(404);res.end("not found");return;}
 res.writeHead(200,{"Content-Type":entry.type,"Cache-Control":"no-store"});res.end(readFileSync(resolve(root,entry.path)));
});
await new Promise(r=>web.listen(0,"127.0.0.1",r));
const port=web.address().port, browser=await chromium.launch({headless:true});
const clips=[{id:"intro",duration:2.3,frames:69,name:"BlueDotAtlas_Intro_2s.mp4"},
             {id:"outro",duration:2.2,frames:66,name:"BlueDotAtlas_Outro_2s.mp4"}];
const qa={task:"007",brandAssetsUnchanged:true,format:"1920x1080 H.264 30fps yuv420p, no audio",
  clipReviewStatus:"USER REVIEW PENDING",clips:[]};
try {
 for(const clip of clips){
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",x=>errors.push(String(x)));
  page.on("response",r=>{if(!r.ok())errors.push("HTTP "+r.status()+" "+r.url());});
  await page.goto("http://127.0.0.1:"+port+"/motion?clip="+clip.id,{waitUntil:"load"});
  const check=await page.evaluate(async()=>{
   await window.logoReady;
   const svg=document.querySelector("#brand svg");
   const families=[...document.fonts].filter(x=>x.status==="loaded").map(x=>({name:x.family,weight:x.weight}));
   return {logoLoaded:!!svg&&svg.querySelectorAll("path").length===3&&
       svg.querySelector("g#blue-dot-atlas-contour-v1")!==null &&
       [...svg.querySelectorAll("text")].some(x=>x.textContent==="BlueDotAtlas"),
     fontsLoaded:families.some(x=>x.name==="Inter"&&x.weight==="400")&&families.some(x=>x.name==="Inter"&&x.weight==="600 900"),
     data:window.logoClipSpec,
     actualBounds:(()=>{const r=svg.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})(),
     hasExtraOverlays:!!document.querySelector("#lowerThird, #mapMarker, #source")};
  });
  if(!check.logoLoaded||!check.fontsLoaded)
   throw new Error("Original SVG and licensed Inter fonts did not load for "+clip.id+": "+JSON.stringify(check));
  if(check.hasExtraOverlays)throw new Error("Short logo clips must not contain lower thirds/maps/source cards");
  const mid=await page.evaluate(x=>window.setLogoTime(x.time,x.id),{time:clip.id==="intro"?1.50:.80,id:clip.id});
  const tail=await page.evaluate(x=>window.setLogoTime(x.time,x.id),
                              {time:clip.duration-.02,id:clip.id});
  if(mid.alpha<.96||mid.wipe<.99||tail.alpha>.05)
   throw new Error("Logo timing/reveal incorrect: "+JSON.stringify({clip,mid,tail}));
  const output=join(out,clip.name);
  const proc=spawn("ffmpeg",["-hide_banner","-loglevel","error","-y",
   "-f","image2pipe","-vcodec","png","-framerate","30","-i","pipe:0",
   "-c:v","libx264","-preset","veryfast","-crf","20",
   "-pix_fmt","yuv420p","-movflags","+faststart","-an",output],
   {stdio:["pipe","ignore","pipe"]});
  let stderr="";proc.stderr.on("data",chunk=>stderr+=String(chunk));
  const samples=clip.id==="intro"?[[20,"icon-reveal"],[45,"logo-complete"]]:
                                 [[10,"outro-reveal"],[35,"outro-hold"]];
  for(let frame=0;frame<clip.frames;frame++){
   await page.evaluate(([time,which])=>window.setLogoTime(time,which),[frame/30,clip.id]);
   const png=await page.screenshot({type:"png",animations:"disabled"});
   const sample=samples.find(x=>x[0]===frame);
   if(sample)writeFileSync(join(out,clip.id+"-"+sample[1]+".png"),png);
   if(!proc.stdin.write(png))await once(proc.stdin,"drain");
  }
  proc.stdin.end();
  const [status]=await once(proc,"close");
  if(status!==0)throw new Error("ffmpeg exit "+status+": "+stderr);
  const probe=JSON.parse(execFileSync("ffprobe",
   ["-v","error","-select_streams","v:0",
    "-show_entries","stream=width,height,r_frame_rate,codec_name,nb_frames,pix_fmt",
    "-show_entries","format=duration,size","-of","json",output],{encoding:"utf8"}));
  const stream=probe.streams[0];
  if(stream.width!==1920||stream.height!==1080||stream.r_frame_rate!=="30/1"||
    stream.codec_name!=="h264"||stream.pix_fmt!=="yuv420p"||
    Math.abs(Number(probe.format.duration)-clip.duration)>.035||
    Number(stream.nb_frames)!==clip.frames)throw new Error("Wrong MP4: "+JSON.stringify(probe));
  if(errors.length)throw new Error("Browser response errors: "+errors.join(" | "));
  qa.clips.push({name:clip.name,duration:Number(probe.format.duration),frames:clip.frames,
    codec:stream.codec_name,dimensions:"1920x1080",logoLoaded:true,visualState:{mid,tail},
    fileBytes:Number(probe.format.size),approvedInterFontsLoaded:check.fontsLoaded,qa:"PASS"});
  console.log("PASS "+clip.id+" "+probe.format.duration+"s "+clip.frames+
    " frames H264 1920x1080, exact official inline SVG and real Inter fonts, no overlays.");
  await page.close();
 }
}finally{
 await browser.close();
 await new Promise(r=>web.close(r));
}
writeFileSync(join(out,"logo-clips-007-qa.json"),JSON.stringify(qa,null,2)+"\n");
console.log("SUMMARY "+qa.clips.filter(x=>x.qa==="PASS").length+"/2 separated logo clips PASS");
