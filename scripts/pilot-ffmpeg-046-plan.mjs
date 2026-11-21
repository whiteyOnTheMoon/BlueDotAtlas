// 046 private alternative: vector graphics + bounded sequential FFmpeg encoding.
// One final 1800-frame movie; no Chromium/Remotion process during video rendering.
import assert from 'node:assert/strict';
import { PILOT_PRIVATE_046, PILOT_PRIVATE_046_SHOTS, PRIVATE_046_MEDIA, PRIVATE_046_VOICE_PATH } from '../packages/video/src/compositions/pilot-private-046-plan.js';
import { BRAND_SOURCES, VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';
import { SCIENCE_LABELS, scienceStateAt, scienceVaporParticle } from '../packages/video/src/compositions/science-plan.js';

export const FF046 = Object.freeze({width:1920,height:1080,fps:30,frames:1800});
export const SHOTS046 = PILOT_PRIVATE_046_SHOTS;
export const VOICE046 = PRIVATE_046_VOICE_PATH;
const x = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const n = (value) => Number(value.toFixed(3));
const svg = (body) => '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">' + body + '<rect x="1250" y="32" width="620" height="54" fill="#021934" opacity="0.87"/><text x="1270" y="69" font-size="19" fill="#f2f9ff" font-family="DejaVu Sans">PRIVATE NARRATED ROUGH CUT · NOT PUBLISHED</text></svg>';

export function planSegments(shots) {
  assert.ok(Array.isArray(shots) && shots.length>=2 && shots.length<=12);
  const segments=[]; let cursor=0;
  for(let i=0;i<shots.length;i++) {
    const shot=shots[i], prior=shots[i-1], next=shots[i+1];
    assert.match(shot.id,/^S\d\d$/);
    assert.ok(Number.isInteger(shot.from) && Number.isInteger(shot.durationInFrames) && shot.durationInFrames>0);
    const enter=prior?Math.max(0,prior.from+prior.durationInFrames-shot.from):0;
    const leave=next?Math.max(0,shot.from+shot.durationInFrames-next.from):0;
    if(prior && enter===0) assert.equal(shot.from,prior.from+prior.durationInFrames);
    assert.ok(enter+leave<shot.durationInFrames && leave<=9);
    const body={kind:'body',shot:shot.id,offset:enter,frames:shot.durationInFrames-enter-leave,timelineFrom:shot.from+enter};
    assert.equal(body.timelineFrom,cursor);
    segments.push(Object.freeze(body));cursor+=body.frames;
    if(next && leave) {
      segments.push(Object.freeze({kind:'blend',left:shot.id,leftOffset:shot.durationInFrames-leave,right:next.id,rightOffset:0,frames:leave,timelineFrom:cursor}));
      cursor+=leave;
    }
  }
  assert.equal(cursor,shots.at(-1).from+shots.at(-1).durationInFrames);
  return Object.freeze(segments);
}
export const SEGMENTS046 = planSegments(SHOTS046);
assert.deepEqual([VIDEO_PROFILE.width,VIDEO_PROFILE.height,VIDEO_PROFILE.fps,PILOT_PRIVATE_046.frames],[1920,1080,30,1800]);
assert.equal(SEGMENTS046.reduce((sum,s)=>sum+s.frames,0),1800);
assert.deepEqual(SEGMENTS046.filter(s=>s.kind==='blend').map(s=>s.frames),[9,9]);

export function sourceFor(shot) {
  if(shot.kind==='brand_intro') return BRAND_SOURCES.intro;
  if(shot.kind==='brand_outro') return BRAND_SOURCES.outro;
  if(shot.assetId) {
    assert.ok(Object.hasOwn(PRIVATE_046_MEDIA,shot.assetId));
    return PRIVATE_046_MEDIA[shot.assetId];
  }
  return null;
}
export function overlaySvg046(shot) {
  const credit=shot.kind==='footage'
    ? '<rect x="155" y="814" width="1555" height="135" rx="9" fill="#021934" opacity="0.90"/>' +
      '<text x="180" y="866" font-size="34" fill="#f2f9ff" font-family="DejaVu Sans">'+x(shot.caption)+'</text>' +
      '<text x="180" y="916" font-size="23" fill="#d3e6f1" font-family="DejaVu Sans">'+x(shot.credit)+'</text>'
    : '';
  return svg(credit);
}
// Qualitative animation only; progress here is not measured environmental data.
// Reuses the same frame-dependent science state and vapor particle functions.
export function scienceSvg046(shot,frame) {
  assert.ok(shot && shot.kind==='science');
  assert.ok(Number.isInteger(frame) && frame>=0 && frame<shot.durationInFrames);
  if(shot.id==='S07') {
    const progress=Math.min(1,frame/150);
    return svg('<rect width="1920" height="1080" fill="#071522"/><rect y="565" width="1120" height="515" fill="#063b64"/>' +
      '<path d="M1120 565 L1920 495 L1920 1080 L1120 1080 Z" fill="#567a6b"/>' +
      '<path d="M0 580 Q280 535 560 580 T1120 580" stroke="#19b7f4" stroke-width="15" fill="none"/>' +
      '<text x="160" y="174" font-size="68" fill="#f2f9ff" font-family="DejaVu Sans">Ocean energy helps sustain storms</text>' +
      '<text x="160" y="243" font-size="31" fill="#37d6c4" font-family="DejaVu Sans">SCHEMATIC · NOT AN OBSERVATION</text>' +
      '<text x="380" y="824" font-size="40" fill="#f2f9ff" font-family="DejaVu Sans">WARM OCEAN</text>' +
      '<text x="1350" y="824" font-size="40" fill="#f2f9ff" font-family="DejaVu Sans">LAND</text>' +
      '<g opacity="'+n(1-.75*progress)+'" stroke="#37d6c4" stroke-width="19" fill="none"><path d="M515 620 C510 520 605 475 635 382"/><path d="M604 410 L636 363 L672 406"/><path d="M820 620 C821 532 860 490 894 410"/></g>' +
      '<g opacity="'+n(.35+.65*progress)+'" stroke="#ffc178" stroke-width="12" fill="none"><path d="M1270 400 L1520 400" stroke-dasharray="25 20"/><path d="M1450 340 L1530 400 L1450 460"/></g>' +
      '<text x="1230" y="325" fill="#ffc178" font-size="35" font-family="DejaVu Sans">Less heat and moisture supply</text>' +
      '<text x="160" y="955" fill="#f2f9ff" font-size="31" font-family="DejaVu Sans">Storms may weaken. Dangerous impacts can continue.</text>');
  }
  const state=scienceStateAt(frame,shot.durationInFrames);
  const wave=Math.sin(frame/12)*12;
  const particles=Array.from({length:12},(_,i)=>{
    const p=scienceVaporParticle(frame,i,shot.durationInFrames);
    return '<circle cx="'+n(p.x)+'" cy="'+n(p.y)+'" r="'+p.radius+'" fill="#37d6c4" opacity="'+n(p.opacity)+'"/>';
  }).join('');
  const clouds=Array.from({length:7},(_,i)=>
    '<circle cx="'+n(897+Math.sin((frame+i*12)/32)*33)+'" cy="'+n(698-((frame*2.1+i*54)%210))+
    '" r="'+(10+(i%3)*5)+'" stroke="#37d6c4" stroke-width="3" fill="none" opacity="'+n(state.rising*.48)+'"/>').join('');
  const rings=Array.from({length:3},(_,i)=>
    '<circle cx="1458" cy="624" r="'+n(94+i*33+Math.sin(frame/21)*4)+
    '" stroke="#ffc178" stroke-width="6" fill="none" stroke-dasharray="26 36" stroke-dashoffset="'+n(-frame*.9+i*18)+'"/>').join('');
  return svg('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#071522"/><stop offset="1" stop-color="#0e2942"/></linearGradient></defs>' +
    '<rect width="1920" height="1080" fill="url(#sky)"/>' +
    '<text x="160" y="144" font-size="26" fill="#37d6c4" font-family="DejaVu Sans">BLUEDOTATLAS / EARTH SCIENCE</text>' +
    '<text x="160" y="237" font-size="67" fill="#f2f9ff" font-weight="bold" font-family="DejaVu Sans">'+x(SCIENCE_LABELS.heading)+'</text>' +
    '<text x="160" y="289" font-size="27" fill="#37d6c4" font-family="DejaVu Sans">SCHEMATIC · NOT TO SCALE · NOT AN OBSERVATION</text>' +
    '<rect x="160" y="335" width="1600" height="565" rx="30" fill="#0e2942" stroke="#31546d" stroke-width="2"/>' +
    '<path d="M695 384 V868 M1225 384 V868" stroke="#31546d" stroke-dasharray="5 17"/>' +
    '<path d="M160 '+n(741+wave)+' C370 '+n(724-wave)+' 580 '+n(743+wave)+' 790 736 C1000 '+n(725+wave)+
    ' 1250 '+n(744-wave)+' 1450 737 C1600 '+n(730+wave)+' 1710 747 1760 738 L1760 900 L160 900Z" fill="#026e9e" stroke="#19b7f4" stroke-width="6"/>' +
    '<text x="210" y="404" font-size="29" fill="#37d6c4" font-family="DejaVu Sans">01 EVAPORATION</text>' +
    '<text x="755" y="404" font-size="29" fill="#37d6c4" font-family="DejaVu Sans">02 RISING MOIST AIR</text>' +
    '<text x="1270" y="404" font-size="29" fill="#37d6c4" font-family="DejaVu Sans">03 CONDENSATION</text>' +
    '<text x="210" y="451" font-size="23" fill="#f2f9ff" font-family="DejaVu Sans">Water vapor enters the air</text>' +
    '<text x="755" y="451" font-size="23" fill="#f2f9ff" font-family="DejaVu Sans">Moist air rises and cools</text>' +
    '<text x="1270" y="451" font-size="23" fill="#f2f9ff" font-family="DejaVu Sans">Water vapor forms droplets</text>' +
    '<path d="M405 741 C375 632 483 610 451 492" stroke="#37d6c4" stroke-width="13" stroke-dasharray="19 18" stroke-dashoffset="'+n(-frame*1.8)+'" fill="none" opacity="'+n(state.evaporation)+'"/>' +
    '<path d="M906 725 C855 644 952 569 914 492" stroke="#19b7f4" stroke-width="19" stroke-dasharray="80 45" stroke-dashoffset="'+n(-frame*1.6)+'" fill="none" opacity="'+n(state.rising)+'"/>' +
    particles+clouds+
    '<g fill="#f2f9ff" opacity="'+n(state.condensation)+'" transform="translate(1458 624) scale('+
      n(.83+state.condensation*.17)+') translate(-1458 -624)"><ellipse cx="1430" cy="638" rx="170" ry="69"/><circle cx="1367" cy="583" r="75"/><circle cx="1450" cy="552" r="89"/><circle cx="1521" cy="590" r="78"/></g>' +
    '<g opacity="'+n(state.heatRelease)+'">'+rings+'</g>' +
    '<text x="1285" y="745" font-size="27" fill="#ffc178" font-family="DejaVu Sans" opacity="'+n(state.heatRelease)+'">LATENT HEAT RELEASED</text>' +
    '<text x="160" y="951" font-size="26" fill="#f2f9ff" font-family="DejaVu Sans">'+x(SCIENCE_LABELS.caveat)+'</text>' +
    '<text x="1060" y="994" font-size="21" fill="#b4ccdc" font-family="DejaVu Sans">'+x(SCIENCE_LABELS.attribution)+'</text>');
}
