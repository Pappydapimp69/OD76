// B170 Colosseum sound from the sound engine (b21-181.js, vendored from Pappydapimp69/sound-engine). Everything is
// synthesized once, offline, from the engine's DSP classes, in small slices across frames on the first Colosseum visit
// (no audio files, no worklets), then played as buffers through OD76's own mixer:
//   - stone-bowl reverb: the engine's 8-line FDN rendered to an impulse response, fed by the drums and every ring sound
//   - crowd: a looping bed of many synthesized voices whose level follows the crowd's roar, plus cheers and gasps
//   - Pip and rival cries on Ascend and at the knockout (creature voices; Pip is small and bright, rivals deeper)
//   - sand: hit thuds (heavier when Ascended) and light footsteps from the engine's Hertz-contact footstep model
// Until a sound has rendered, B163-B165's tone cues stand in, so nothing is silent while the bank fills.
const B170_FS=16000,B170_CRY_FS=22050,B170_ZONE={size:1.6,t60Low:2.2,t60High:1.1}; // a big open stone bowl: long lows, darker highs
const colAudioB170={bufs:{},jobs:null,job:null,ready:false,bus:null,bed:null,bedGain:null,musicSend:null,last:{},seen:0,fight:null,hp:[0,0],step:[0,0]};
// A job renders `seconds` of audio sample by sample, a slice at a time inside a per-frame budget, so no frame stalls
// (the full bank is several seconds of DSP on a phone). gen(i) returns a mono sample or writes [l,r] into o.
function jobB170(name,seconds,fs,stereo,setup,post){return{name,fs,n:Math.round(seconds*fs),i:0,stereo,setup,post,ch:null,gen:null}}
function sliceB170(j,deadline){
 if(!j.gen){j.ch=j.stereo?[new Float32Array(j.n),new Float32Array(j.n)]:[new Float32Array(j.n)];j.gen=j.setup(j.fs)}
 const o=[0,0],L=j.ch[0],R=j.ch[1];
 while(j.i<j.n){const end=Math.min(j.n,j.i+256);for(;j.i<end;j.i++){if(j.stereo){j.gen(j.i,o);L[j.i]=o[0];R[j.i]=o[1]}else L[j.i]=j.gen(j.i)}if(performance.now()>deadline)return false}
 return true;
}
function normB170(r,peak=.9){let m=0;for(const ch of r.ch)for(let i=0;i<ch.length;i++)m=Math.max(m,Math.abs(ch[i]));if(m>0){const k=peak/m;for(const ch of r.ch)for(let i=0;i<ch.length;i++)ch[i]*=k}return r}
function fadeB170(r,inS=.004,outS=.08){for(const ch of r.ch){const n=ch.length,a=Math.round(inS*r.fs),b=Math.round(outS*r.fs);for(let i=0;i<a&&i<n;i++)ch[i]*=i/a;for(let i=0;i<b&&i<n;i++)ch[n-1-i]*=i/b}return r}
function loopB170(r,xf=.5){ // crossfade the tail into the head so the bed loops without a seam
 const m=Math.round(xf*r.fs);for(const ch of r.ch){const n=ch.length;for(let i=0;i<m;i++){const u=i/m;ch[i]=ch[i]*Math.sin(u*Math.PI/2)+ch[n-m+i]*Math.cos(u*Math.PI/2)}}
 return{fs:r.fs,ch:r.ch.map(ch=>ch.slice(0,ch.length-m))};
}
function crowdSetupB170(seconds,{voices,start,dur,repeat=false,f0,rise,amp,seed,murmur=0}){
 // Many small voices, each with its own tract size, pan and timing, summed to a stereo crowd.
 return fs=>{
  const D=SoundEngineDSP,rnd=new D.Noise(seed),vs=[];
  for(let v=0;v<voices;v++){
   const cv=new D.CreatureVoice(fs,{tract:.13+rnd.uniform()*.2,sac:.1,seed:seed+v*7}),pan=rnd.bipolar()*.85,calls=[];
   for(let t=start(rnd);t<seconds-.1;){const d=dur(rnd),a=f0(rnd);calls.push({at:Math.round(t*fs),o:{mode:'open',duration:Math.min(d,seconds-t),f0:a,f0End:a*rise(rnd),amp:amp*(.6+.4*rnd.uniform()),roughness:.2+.3*rnd.uniform(),breath:.35,jitter:.5}});if(!repeat)break;t+=d*(.6+.9*rnd.uniform())+start(rnd)*.5}
   vs.push({cv,gl:Math.sqrt((1-pan)/2),gr:Math.sqrt((1+pan)/2),calls,k:0});
  }
  const nz=new D.Noise(seed+99),bp=new D.Biquad(fs).bandpass(520,.7),bp2=new D.Biquad(fs).bandpass(1400,1.2);
  return(i,o)=>{let l=0,r=0;for(const v of vs){while(v.k<v.calls.length&&v.calls[v.k].at===i)v.cv.call(v.calls[v.k++].o);if(!v.cv.active&&v.k>=v.calls.length)continue;const s=v.cv.process();l+=s*v.gl;r+=s*v.gr}
   if(murmur){const m=(bp.process(nz.bipolar())+.5*bp2.process(nz.bipolar()))*murmur;l+=m;r+=m*.95}o[0]=l;o[1]=r};
 };
}
function crySetupB170(tract,f0,f1,dur,seed,breath=.2,rough=.25){return fs=>{const v=new SoundEngineDSP.CreatureVoice(fs,{tract,sac:.08,seed});v.call({mode:'open',duration:dur,f0,f0End:f1,amp:.9,roughness:rough,breath,jitter:.3});return()=>v.process()}}
function thudSetupB170(mass,speed,seed){return fs=>{const f=new SoundEngineDSP.FootstepSynth(fs,seed);f.step({mass,speed,surface:'sand'});return()=>f.process()}}
function irSetupB170(){return fs=>{const rv=new SoundEngineDSP.FDNReverb(fs,B170_ZONE);return(i,o)=>rv.process(i===0?1:0,o)}} // at the context's rate: a ConvolverNode needs it
function jobsB170(ctxRate){
 const shot=(name,sec,setup,peak=.9,out=.08,fs=B170_FS)=>jobB170(name,sec,fs,false,setup,r=>fadeB170(normB170(r,peak),.001,out));
 const crowd=(name,sec,opts,post)=>jobB170(name,sec,B170_FS,true,crowdSetupB170(sec,opts),post);
 return[
  jobB170('ir',B170_ZONE.t60Low*1.1,ctxRate,true,irSetupB170(),r=>r),
  shot('thud',.3,thudSetupB170(30,5,11),.9,.08),
  shot('thudHeavy',.4,thudSetupB170(140,8,12),.9,.12),
  shot('step',.18,thudSetupB170(4,3,13),.6,.04),
  shot('pipCry',.7,crySetupB170(.11,330,560,.55,21,.15,.15),.9,.08,B170_CRY_FS),
  shot('pipFall',1.05,crySetupB170(.11,420,170,.9,22,.45,.3),.9,.08,B170_CRY_FS),
  shot('rivalCry0',.75,crySetupB170(.17,220,360,.6,23,.2,.35),.9,.08,B170_CRY_FS),
  shot('rivalCry1',.8,crySetupB170(.2,190,320,.65,24,.25,.45),.9,.08,B170_CRY_FS),
  shot('rivalFall',1.15,crySetupB170(.18,300,120,1,25,.5,.4),.9,.08,B170_CRY_FS),
  crowd('cheer',2.6,{voices:16,start:r=>r.uniform()*.25,dur:r=>1.3+r.uniform(),f0:r=>180+r.uniform()*170,rise:r=>1.2+r.uniform()*.3,amp:.8,seed:31,murmur:.25},r=>fadeB170(normB170(r),.01,.6)),
  crowd('gasp',1.3,{voices:12,start:r=>r.uniform()*.12,dur:r=>.5+r.uniform()*.4,f0:r=>220+r.uniform()*120,rise:r=>.6+r.uniform()*.15,amp:.6,seed:41},r=>fadeB170(normB170(r),.01,.4)),
  crowd('bed',6.5,{voices:12,repeat:true,start:r=>r.uniform()*1.4,dur:r=>.4+r.uniform()*.7,f0:r=>150+r.uniform()*160,rise:r=>.8+r.uniform()*.5,amp:.35,seed:51,murmur:.9},r=>normB170(loopB170(r),.8)),
 ];
}
function pumpB170(budgetMs=6){ // render within a small time budget per frame
 const A=colAudioB170;if(!A.jobs)return;const deadline=performance.now()+budgetMs;
 while(A.jobs.length&&performance.now()<deadline){const j=A.jobs[0];let done=false;try{done=sliceB170(j,deadline)}catch(e){A.jobs.shift();A.bufs[j.name]=null;continue}
  if(done){A.jobs.shift();try{A.bufs[j.name]=toBufferB170(j.post({fs:j.fs,ch:j.ch}))}catch(_){A.bufs[j.name]=null}if(j.name==='ir')connectBusB170()}}
 if(!A.jobs.length){A.jobs=null;A.ready=true}
}
function toBufferB170(r){const b=audioCtx.createBuffer(r.ch.length,r.ch[0].length,r.fs);r.ch.forEach((c,i)=>b.getChannelData(i).set(c));return b}
function audioOkB170(){return typeof ensureAudio==='function'&&ensureAudio()&&audioEngine&&audioCtx}
function startAudioB170(){const A=colAudioB170;if(!audioOkB170()||A.ready||A.jobs)return;A.jobs=jobsB170(audioCtx.sampleRate)}
function connectBusB170(){
 const A=colAudioB170;if(A.bus||!A.bufs.ir||!audioOkB170())return;
 const ctx=audioCtx,e=audioEngine;
 A.bus=ctx.createGain();A.bus.gain.value=1;A.bus.connect(e.sfx);           // dry ring sounds share the game's sfx chain
 A.verb=ctx.createConvolver();A.verb.normalize=false;A.verb.buffer=A.bufs.ir;
 A.wet=ctx.createGain();A.wet.gain.value=.55;A.verb.connect(A.wet);A.wet.connect(e.master);
 A.send=ctx.createGain();A.send.gain.value=1;A.send.connect(A.verb);
}
function playB170(name,{gain=1,pan=0,wet=.35,rate=1}={}){
 const A=colAudioB170,b=A.bufs[name];if(!b||!A.bus||!S?.audioEnabled)return false;
 const ctx=audioCtx,src=ctx.createBufferSource(),g=ctx.createGain(),p=ctx.createStereoPanner();
 src.buffer=b;src.playbackRate.value=rate;g.gain.value=gain;p.pan.value=clamp(pan,-1,1);
 src.connect(g);g.connect(p);p.connect(A.bus);if(wet>0){const w=ctx.createGain();w.gain.value=wet;p.connect(w);w.connect(A.send)}
 src.start();return true;
}
function bedB170(on,level){
 const A=colAudioB170;if(!A.bus)return;const ctx=audioCtx;
 if(on&&!A.bed&&A.bufs.bed&&S?.audioEnabled){A.bed=ctx.createBufferSource();A.bed.buffer=A.bufs.bed;A.bed.loop=true;A.bedGain=ctx.createGain();A.bedGain.gain.value=0;A.bed.connect(A.bedGain);A.bedGain.connect(A.bus);const w=ctx.createGain();w.gain.value=.4;A.bedGain.connect(w);w.connect(A.send);A.bed.start()}
 if(A.bed){A.bedGain.gain.setTargetAtTime(on&&S?.audioEnabled?level:0,ctx.currentTime,on?.25:.6);if(!on){const b=A.bed;A.bed=null;setTimeout(()=>{try{b.stop()}catch(_){}},2500)}}
 // the war drums ring in the bowl too
 if(on&&!A.musicSend&&audioEngine?.music){A.musicSend=ctx.createGain();A.musicSend.gain.value=.35;audioEngine.music.connect(A.musicSend);A.musicSend.connect(A.send)}
 if(!on&&A.musicSend){try{audioEngine.music.disconnect(A.musicSend)}catch(_){}A.musicSend=null}
}
function panB170(fi){const f=colB163.fight;if(!f||typeof ringB165!=='function')return 0;const g=ringB165(),p=fighterPosB165(fi,g);return clamp((p.x-g.cx)/(g.rx||1),-1,1)*.7}

// Crowd cheers: the engine's crowd when ready, B163's tones until then.
const cheerBeforeB170=cheerB163;
cheerB163=function(level){if(playB170('cheer',{gain:.35+.45*level,wet:.5,rate:.95+Math.random()*.1}))return;return cheerBeforeB170(level)};

function colSoundTickB170(dt){
 const A=colAudioB170,c=colB163,f=c.fight;
 pumpB170();
 const live=c.active&&f;bedB170(!!live&&c.phase!=='paused',live?(c.phase==='paused'?.05:.12+.28*Math.min(1,c.fx?.roar??.4)):0);
 if(!live||!A.bus)return;
 if(A.fight!==f){A.fight=f;A.seen=f.events.length;A.hp=[f.a.hp,f.b.hp];A.step=[0,0]}
 if(c.phase!=='fight')return;
 for(;A.seen<f.events.length;A.seen++){const e=f.events[A.seen],me=e.side?f.b:f.a,op=e.side?f.a:f.b;
  if(e.kind==='ascend')playB170(e.side?`rivalCry${(c.br.round+1)%2}`:'pipCry',{gain:.7,pan:panB170(me),wet:.45,rate:e.side?.95+.1*Math.random():1});
  else if(e.kind==='low'||e.kind==='break')playB170('gasp',{gain:.45,wet:.5});
  else if(e.kind==='end'){const loser=e.side?f.a:f.b;playB170(e.side?'pipFall':'rivalFall',{gain:.7,pan:panB170(loser),wet:.55});playB170('cheer',{gain:.9,wet:.55})}
 }
 const now=performance.now();
 [f.a,f.b].forEach((fi,i)=>{
  const drop=A.hp[i]-fi.hp;A.hp[i]=fi.hp;
  if(drop>fi.maxHp*.004&&now-(A.last['hit'+i]||0)>70){A.last['hit'+i]=now;const att=i?f.a:f.b,heavy=att.ascT>0||drop>fi.maxHp*.05;
   playB170(heavy?'thudHeavy':'thud',{gain:Math.min(.9,.35+drop/fi.maxHp*6),pan:panB170(fi),wet:.3,rate:.9+.2*Math.random()})}
  A.step[i]+=dt*(1.6+.04*fi.e.speed);if(A.step[i]>=1&&!fi.guarding){A.step[i]=0;playB170('step',{gain:.16,pan:panB170(fi),wet:.15,rate:.85+.3*Math.random()})}
 });
}
const updateBeforeB170=update;
update=function(dt){
 if(colB163.active||colAudioB170.bed)colSoundTickB170(dt);
 else if(colAudioB170.jobs)pumpB170(6);
 return updateBeforeB170(dt);
};
// Start rendering at the first sign of the Colosseum: its sheet, a bracket or the tutorial.
for(const fn of ['startColosseumB163','startTutorialB164','colosseumSheetB164']){const before=window[fn]||globalThis[fn];if(typeof before!=='function')continue;
 const wrapped=function(...a){startAudioB170();return before.apply(this,a)};
 if(fn==='startColosseumB163')startColosseumB163=wrapped;else if(fn==='startTutorialB164')startTutorialB164=wrapped;else colosseumSheetB164=wrapped;}
