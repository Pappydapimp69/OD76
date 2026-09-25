
// B103 Ranch music: a soft, slow F-major loop while you're at the ranch.
// Runs on its own clock (66 bpm) inside the arena engine's look-ahead, so arena tempo changes never touch it.
const B103_RANCH_BPM=66,B103_EIGHTH=60/B103_RANCH_BPM/2;
const B103_CHORDS=[
 {root:41,notes:[53,57,60,64]}, // Fmaj7
 {root:45,notes:[52,55,57,60]}, // Am7
 {root:46,notes:[50,53,57,58]}, // Bbmaj7
 {root:48,notes:[52,55,60,62]}  // C add9
];
const B103_ARP=[0,2,null,1,3,null,2,null]; // chord-tone index per eighth, null rests
const B103_MELODY=[ // 4 bars × 8 eighths, MIDI or null; plays every other cycle
 72,null,null,69,null,null,67,null,
 69,null,72,null,null,null,null,null,
 74,null,null,72,null,69,null,null,
 67,null,null,null,64,null,null,null
];
function ranchVoiceB103(engine,midi,time,dur,vol,pan=0,cutoff=2400,attack=.02,release=.5,type="sine"){engine.voice(MIDI_FREQ(midi),time,dur,vol,type,pan,cutoff,attack,release,0,engine.music)}
function scheduleRanchEighthB103(engine,n,time){
 const bar=Math.floor(n/8),e=n%8,cycle=Math.floor(bar/4),ch=B103_CHORDS[bar%4];
 if(e===0){
   ch.notes.slice(0,3).forEach((m,i)=>{ranchVoiceB103(engine,m,time,B103_EIGHTH*8+.6,.014,[-.35,0,.35][i],1300,.9,1.3,"sine");ranchVoiceB103(engine,m+12,time,B103_EIGHTH*8,.006,[.3,0,-.3][i],1600,1.1,1.2,"triangle")});
   ranchVoiceB103(engine,ch.root,time,B103_EIGHTH*4,.026,0,500,.06,.9);
 }
 if(e===4)ranchVoiceB103(engine,ch.root+7,time,B103_EIGHTH*4,.018,0,500,.06,.9);
 const a=B103_ARP[e];
 if(a!=null)ranchVoiceB103(engine,ch.notes[a]+12,time,.95,.018,e<4?-.25:.25,2600,.012,.7,"triangle");
 if(cycle%2===1){const m=B103_MELODY[(bar%4)*8+e];if(m!=null)ranchVoiceB103(engine,m,time,1.1,.020,.1,3000,.02,.8,"sine")}
 if(bar%4===3&&e===7)engine.fmBell(MIDI_FREQ(84),time,.9,.008,.4,engine.music);
}
function scheduleRanchMusicB103(engine,upTo){
 if(!S?.audioEnabled||!engine?.ctx)return 0;
 const now=engine.ctx.currentTime;
 if(!Number.isFinite(engine.b103Next)||engine.b103Next<now-.1){engine.b103Next=now+.06;engine.b103Eighth=0}
 let count=0;
 while(engine.b103Next<=upTo){scheduleRanchEighthB103(engine,engine.b103Eighth,engine.b103Next);engine.b103Eighth++;engine.b103Next+=B103_EIGHTH;count++}
 return count;
}
const scheduleStepBeforeB103=PipAudioEngine.prototype.scheduleStep;
PipAudioEngine.prototype.scheduleStep=function(time){
 if(ranchWorldB100.active){scheduleRanchMusicB103(this,time+.05);return}
 this.b103Next=NaN; // restart the ranch loop from the top on the next visit
 return scheduleStepBeforeB103.call(this,time);
};
// The ranch mix is warmer with a touch more echo; arena intensity never brightens it.
const audioSceneBeforeB103=updateAudioSceneB92;
updateAudioSceneB92=function(engine,dt){
 if(!ranchWorldB100.active)return audioSceneBeforeB103(engine,dt);
 if(!engine?.ctx)return 0;
 try{const t=engine.ctx.currentTime;engine.musicTone?.frequency?.setTargetAtTime(3400,t,.4);engine.delayWet?.gain?.setTargetAtTime(.11,t,.4)}catch(_){}
 engine.b92Intensity=0;return 0;
};
const enterRanchBeforeB103=enterRanchB100;
enterRanchB100=function(){enterRanchBeforeB103();if(audioEngine)audioEngine.b103Next=NaN};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}
