function runFocusedChecksB170(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fakeCtx={createBuffer:(c,n,r)=>{const d=[...Array(c)].map(()=>new Float32Array(n));return{numberOfChannels:c,length:n,sampleRate:r,getChannelData:i=>d[i]}}};
 test('B170 the vendored sound engine DSP loads with its exports',()=>{
  for(const k of ['FDNReverb','CreatureVoice','FootstepSynth','Noise','Biquad','CREATURES','ZONES'])assert(SoundEngineDSP[k],'missing '+k);
  const rv=new SoundEngineDSP.FDNReverb(16000,B170_ZONE),o=[0,0];let e=0;for(let i=0;i<16000;i++){rv.process(i?0:1,o);e+=o[0]*o[0]+o[1]*o[1]}assert(e>.1&&e<10,'reverb energy '+e);
 });
 test('B170 every sound in the bank renders, non-silent and normalized, in budgeted slices',()=>{
  const ctxBefore=audioCtx,busBefore=connectBusB170;audioCtx=fakeCtx;connectBusB170=()=>{};
  try{
   const A=colAudioB170;A.bufs={};A.ready=false;A.jobs=jobsB170(16000);let frames=0;
   while(A.jobs&&frames<5000){pumpB170(4);frames++}
   assert(A.ready&&frames>20,'rendered in '+frames+' frames (should be sliced)');
   for(const k of ['ir','thud','thudHeavy','step','pipCry','pipFall','rivalCry0','rivalCry1','rivalFall','cheer','gasp','bed']){const b=A.bufs[k];assert(b,'missing '+k);let pk=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]))}assert(pk>.05&&pk<=1,k+' peak '+pk)}
   assert(A.bufs.bed.numberOfChannels===2&&A.bufs.cheer.numberOfChannels===2,'crowd not stereo');
  }finally{audioCtx=ctxBefore;connectBusB170=busBefore;colAudioB170.bufs={};colAudioB170.ready=false;colAudioB170.jobs=null}
 });
 test('B170 without audio nothing plays and cheers fall back to the old tones',()=>{
  assert(playB170('cheer')===false,'played with no bus');let old=0;const t=tone;tone=()=>{old++};const en=S.audioEnabled;S.audioEnabled=true;
  try{cheerB163(1)}finally{tone=t;S.audioEnabled=en}
 });
 test('B170 sound never changes a fight',()=>{
  const ev={name:'p',stats:{range:5,speed:5,power:5,guard:5},asc:1,ai:'patient'};
  const a=runFightB163(ev,ev,7);colAudioB170.hp=[0,0];const b=runFightB163(ev,ev,7);assert(a.winner===b.winner&&a.t===b.t,'differs');
  startColosseumB163(0);for(let i=0;i<400&&colB163.active;i++)update(1/60);colB163={active:false};document.body.classList.remove('colB163');closeSheetB100();
 });
 return out;
}
