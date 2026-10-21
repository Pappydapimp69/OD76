// B165 Colosseum look and gamepad pass. The arena is neon and the ranch is pastel; the Colosseum gets its own
// "iron and ember" look: a torchlit stone bowl at dusk, sand floor, silhouette crowd, bronze and iron plates, serif type,
// sparks and short shakes on big hits, and war drums instead of the ranch tune. Shake follows the device's
// reduced-motion preference (Brain comfort lessons: keep shake short; always give a way out).
// Gamepad: Select no longer opens the Bag mid-fight (it froze the fight behind a sheet); Start pauses (P on keyboard,
// a ❚❚ button on touch) with Resume / Leave; prompts name the buttons of the device you last used.
const B165={sky0:'#07060a',sky1:'#2c130d',stone:'#2b2420',stone2:'#3a302a',sand:'#9a764c',sandDark:'#3b2a1c',bronze:'#b8863b',bronzeHi:'#e2b866',ember:'#ff6a1f',blood:'#b3202d',bone:'#eadfc8',steel:'#8fa9b6',ink:'#120c0a'};
B163_COLOURS[3]='#e58cff'; // was a yellow too close to Pip's
const B165_SERIF="Georgia,'Times New Roman',serif";
function reduceMotionB165(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}}

// ---- input device and labels ----
let inputDevB165=(()=>{try{return matchMedia('(pointer:coarse)').matches?'touch':'keys'}catch(_){return'keys'}})();
window.addEventListener('keydown',e=>{inputDevB165='keys';if(colB163.active&&!e.repeat&&(e.key==='p'||e.key==='P'))ranchWorldB100.b165PauseTap=true},true);
window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')inputDevB165='touch';else if(e.pointerType==='mouse')inputDevB165='keys'},true);
const B165_LABELS={focus:{pad:'A',keys:'Space',touch:'FOCUS'},ascend:{pad:'X',keys:'X',touch:'ASCEND'},guard:{pad:'B',keys:'B',touch:'GUARD'},pause:{pad:'Start',keys:'P',touch:'❚❚'}};
function btnB165(cmd){return B165_LABELS[cmd][inputDevB165]}
function pressB165(cmd){return`${inputDevB165==='touch'?'Tap':'Press'} ${btnB165(cmd)}`}
function coachLineB165(){return`${btnB165('focus')} Focus, ${btnB165('ascend')} Ascend at 70% HEAT, hold ${btnB165('guard')} Guard, ${btnB165('pause')} pauses`}
const ranchInputBeforeB165=ranchInputB100;
ranchInputB100=function(...a){const p=firstPadB165();if(p&&(p.buttons?.some((b,i)=>i<16&&(b.pressed||b.value>.5))||p.axes?.some(v=>Math.abs(v)>.5)))inputDevB165='pad';return ranchInputBeforeB165(...a)};
function firstPadB165(){for(const p of navigator.getGamepads?navigator.getGamepads():[])if(p&&p.connected)return p;return null}
function padHeldB165(p,i){return!!(p?.buttons?.[i]?.pressed||p?.buttons?.[i]?.value>.5)}
Object.defineProperty(B164_STEPS[0],'say',{get:()=>`${pressB165('focus')} to Focus: Pip's next 3 shots home in.`});
Object.defineProperty(B164_STEPS[1],'say',{get:()=>`HEAT is past 70%. ${pressB165('ascend')} to Ascend!`});
Object.defineProperty(B164_STEPS[2],'say',{get:()=>`Sprout is Ascending! Hold ${btnB165('guard')} to Guard.`});

// Sheets: Colosseum ones get the iron look and device-correct button names.
const openSheetBeforeB165=openSheetB100;
openSheetB100=function(title,text,options,...rest){
 const col=colB163.active||/^(Colosseum|Paused)|next$/.test(title);
 if(col&&typeof text==='string')text=text.replace('A Focus, X Ascend at 70% HEAT, hold B Guard',coachLineB165());
 const r=openSheetBeforeB165(title,text,options,...rest);
 $('ranchSheetB100')?.classList.toggle('b165',col);
 return r;
};
// Select opens the Bag at the ranch; during a Colosseum fight that sheet would freeze the fight behind it.
const toggleBagBeforeB165=toggleBagB110;
toggleBagB110=function(...a){if(colB163.active)return;return toggleBagBeforeB165(...a)};

// ---- pause ----
function pauseColB165(){
 const c=colB163;if(!c.active||c.phase==='paused')return;
 c.resume=c.phase;c.phase='paused';
 openSheetB100('Paused','The fight is frozen.',[
  {label:'Resume',run:resumeColB165},
  {label:c.tutorial?'Leave the tutorial':'Leave the bracket (counts as a loss)',quiet:true,run:leaveColB165}]);
}
function resumeColB165(){const c=colB163;if(c.phase!=='paused')return;closeSheetB100();c.phase=c.resume||'fight';c.acc=0;ranchWorldB100.prevAct=true}
function leaveColB165(){
 const c=colB163;closeSheetB100();
 if(c.tutorial){colB163={active:false};document.body.classList.remove('colB163');for(const id of ['ranchActB100','ranchPipBtnB109','ranchGuardB163'])$(id)?.classList.remove('on','b164Pulse','b165Ready');ranchWorldB100.prevAct=true;return}
 if(c.resume!=='after'&&!c.br.out&&!c.br.champion)playRoundB163(c.br,false);
 endColosseumB163();
}
const updateColBeforeB165=updateColB163;
updateColB163=function(dt){
 const c=colB163,w=ranchWorldB100,p=firstPadB165();
 const start=padHeldB165(p,9),startPressed=start&&!w.b165PrevStart;w.b165PrevStart=start;
 const tap=!!w.b165PauseTap;w.b165PauseTap=false;
 if(c.phase==='paused'){
  const inp=ranchInputB100();
  if(startPressed||tap||inp.backPressed){resumeColB165();return}
  if(w.sheet){if(inp.navPressed)focusSheetB100(w.sheet.focus+inp.navPressed);if(inp.actPressed)chooseSheetB100(w.sheet.focus)}
  return;
 }
 if((startPressed||tap)&&(c.phase==='fight'||c.phase==='intro')){pauseColB165();return}
 updateColBeforeB165(dt);
 if(!colB163.active)return;
 const act=$('ranchActB100'),xb=$('ranchPipBtnB109'),gb=$('ranchGuardB163'),f=colB163.fight,ready=!!f&&f.a.heat>=70&&f.a.ascT<=0;
 if(act&&act.classList.contains('on'))act.textContent='◎ FOCUS';
 if(xb&&xb.classList.contains('on')){xb.textContent='✦ ASCEND';xb.classList.toggle('b165Ready',ready)}
 if(gb)gb.textContent='⛨ GUARD';
 const pb=$('ranchPauseB165');if(pb)pb.classList.toggle('on',colB163.phase==='fight'||colB163.phase==='intro');
};

// ---- war drums instead of the ranch tune ----
const B165_BPM=96,B165_SIXTEENTH=60/B165_BPM/4;
function colVoiceB165(engine,freq,time,dur,vol,type='sine',cutoff=900,attack=.004,release=.25,pan=0){engine.voice(freq,time,dur,vol,type,pan,cutoff,attack,release,0,engine.music)}
function scheduleColStepB165(engine,n,time){
 const s=n%16,bar=Math.floor(n/16),ph=colB163.phase,full=ph==='fight',soft=ph==='intro'||ph==='after';
 if(s===0){colVoiceB165(engine,MIDI_FREQ(38),time,B165_SIXTEENTH*16,.018,'sawtooth',380,.4,.8);if(bar%2)colVoiceB165(engine,MIDI_FREQ(45),time,B165_SIXTEENTH*16,.012,'sawtooth',420,.4,.8,.2)}
 if(!full&&!soft)return;
 const v=full?1:.55;
 if(s===0||s===3||s===8||s===11){colVoiceB165(engine,55,time,.24,.11*v,'sine',260,.002,.22);colVoiceB165(engine,110,time,.06,.035*v,'triangle',700,.001,.05)}
 if(full&&(s===6||s===14))colVoiceB165(engine,82,time,.16,.06,'sine',400,.002,.14,s===6?-.3:.3);
 if(full&&bar%4===0&&s===0)[50,53,57].forEach((m,i)=>colVoiceB165(engine,MIDI_FREQ(m),time,.5,.011,'sawtooth',1100,.01,.35,[-.25,0,.25][i]));
}
function scheduleColMusicB165(engine,upTo){
 if(!S?.audioEnabled||!engine?.ctx)return 0;
 const now=engine.ctx.currentTime;
 if(!Number.isFinite(engine.b165Next)||engine.b165Next<now-.1){engine.b165Next=now+.06;engine.b165Step=0}
 let count=0;while(engine.b165Next<=upTo){scheduleColStepB165(engine,engine.b165Step,engine.b165Next);engine.b165Step++;engine.b165Next+=B165_SIXTEENTH;count++}
 return count;
}
const scheduleStepBeforeB165=PipAudioEngine.prototype.scheduleStep;
PipAudioEngine.prototype.scheduleStep=function(time){
 if(colB163.active){scheduleColMusicB165(this,time+.05);return}
 this.b165Next=NaN;return scheduleStepBeforeB165.call(this,time);
};

// ---- the iron-and-ember renderer (replaces B163's drawing, keeps its state) ----
function ringB165(){const rx=Math.min(W*.44,H*.62,560),ry=Math.min(rx*(W<H?.85:.56),H*.3);return{cx:W/2,cy:H*.57,rx,ry}} // taller bowl on portrait screens
// Drawing only: the rival circles opposite Pip with a little sway, so the two never bunch up (the sim's angles don't affect results).
function fighterPosB165(fi,g){const f=colB163.fight,a=fi===f.b?f.a.ang+Math.PI+.35*Math.sin(f.t*.8):fi.ang;return{x:g.cx+Math.cos(a)*g.rx*.55,y:g.cy+Math.sin(a)*g.ry*.55}}
function spacingB165(px){try{X.letterSpacing=px}catch(_){}}
function plateB165(x,y,w,h){X.fillStyle='#16110fe8';X.strokeStyle=B165.bronze;X.lineWidth=2;X.beginPath();X.moveTo(x+8,y);X.lineTo(x+w-8,y);X.lineTo(x+w,y+8);X.lineTo(x+w,y+h-8);X.lineTo(x+w-8,y+h);X.lineTo(x+8,y+h);X.lineTo(x,y+h-8);X.lineTo(x,y+8);X.closePath();X.fill();X.stroke()}
function torchB165(x,y,t,i){
 X.fillStyle='#1a1310';X.fillRect(x-3,y,6,34);X.fillStyle=B165.bronze;X.fillRect(x-9,y-4,18,6);
 const fl=Math.sin(t*13+i*2.1)*2+Math.sin(t*23+i)*1.4;
 X.save();X.globalCompositeOperation='lighter';
 const g=X.createRadialGradient(x,y-10,2,x,y-10,90);g.addColorStop(0,'rgba(255,140,50,.35)');g.addColorStop(1,'rgba(255,90,20,0)');X.fillStyle=g;X.beginPath();X.arc(x,y-10,90,0,Math.PI*2);X.fill();
 X.fillStyle='#ff6a1f';X.beginPath();X.ellipse(x,y-12,7,15+fl,0,0,Math.PI*2);X.fill();
 X.fillStyle='#ffd27a';X.beginPath();X.ellipse(x,y-8,3.5,8+fl*.6,0,0,Math.PI*2);X.fill();
 X.restore();
}
function drawPipB165(fi,p,t,face){
 const col=fi.src.colour,r=17;
 X.fillStyle='#0008';X.beginPath();X.ellipse(p.x,p.y+r+4,r*1.1,5,0,0,Math.PI*2);X.fill();
 if(fi.ascT>0){X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(p.x,p.y,4,p.x,p.y,54);g.addColorStop(0,'rgba(255,200,90,.75)');g.addColorStop(.5,'rgba(255,90,20,.35)');g.addColorStop(1,'rgba(255,60,10,0)');X.fillStyle=g;X.beginPath();X.arc(p.x,p.y,54,0,Math.PI*2);X.fill();
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+t*2,h=10+5*Math.sin(t*9+k);X.fillStyle='rgba(255,120,30,.55)';X.beginPath();X.ellipse(p.x+Math.cos(a)*(r+6),p.y+Math.sin(a)*(r+6)-4,4,h,0,0,Math.PI*2);X.fill()}X.restore()}
 X.fillStyle=col;X.strokeStyle=B165.ink;X.lineWidth=3;X.beginPath();X.arc(p.x,p.y,r,0,Math.PI*2);X.fill();X.stroke();
 X.fillStyle='#ffffff30';X.beginPath();X.arc(p.x-5,p.y-6,6,0,Math.PI*2);X.fill();
 X.fillStyle=B165.ink;X.beginPath();X.ellipse(p.x-5+face*2,p.y-2,2.2,3,0,0,Math.PI*2);X.ellipse(p.x+5+face*2,p.y-2,2.2,3,0,0,Math.PI*2);X.fill();
 X.strokeStyle=B165.ink;X.lineWidth=2;X.beginPath();X.moveTo(p.x-8,p.y-8);X.lineTo(p.x-2,p.y-6);X.moveTo(p.x+8,p.y-8);X.lineTo(p.x+2,p.y-6);X.stroke(); // brows: game face
 X.strokeStyle=fi.ascT>0?'#fff2c8':B165.bronzeHi;X.beginPath();X.moveTo(p.x,p.y-r);X.quadraticCurveTo(p.x+5,p.y-r-9,p.x+3,p.y-r-14);X.stroke();
 if(fi.guarding){X.save();X.strokeStyle=B165.bronzeHi;X.globalAlpha=.45+.5*fi.glow;X.lineWidth=6;X.beginPath();X.arc(p.x,p.y,29,face>0?-1.1:Math.PI-1.1,face>0?1.1:Math.PI+1.1);X.stroke();X.lineWidth=2;X.strokeStyle=B165.ink;X.stroke();X.restore()}
 if(fi.focus>0){X.fillStyle=B165.bronzeHi;for(let k=0;k<fi.focus;k++){X.beginPath();X.arc(p.x-8+k*8,p.y+r+15,2.6,0,Math.PI*2);X.fill()}}
 if(fi.broken>0){X.font=`700 11px ${B165_SERIF}`;X.textAlign='center';X.fillStyle='#ff8a8a';X.fillText('GUARD BROKEN',p.x,p.y-r-22)}
}
function barB165(x,y,w,h,frac,a,b){X.fillStyle='#0b0807';X.fillRect(x,y,w,h);const g=X.createLinearGradient(x,0,x+w,0);g.addColorStop(0,a);g.addColorStop(1,b);X.fillStyle=g;X.fillRect(x+1,y+1,Math.max(0,(w-2)*clamp(frac,0,1)),h-2)}
drawColB163=function(){
 const c=colB163,f=c.fight,now=performance.now()/1000,t=now;
 const fx=c.fx||(c.fx={last:now,sparks:[],embers:[],shake:0,flash:0,flashCol:'255,240,210',roar:.3,hpA:f.a.hp,hpB:f.b.hp,ev:0,fight:f,ko:false});
 if(fx.fight!==f){Object.assign(fx,{fight:f,hpA:f.a.hp,hpB:f.b.hp,ev:0,ko:false})}
 const dt=Math.min(.05,Math.max(0,now-fx.last));fx.last=now;
 const g=ringB165(),pa=fighterPosB165(f.a,g),pb=fighterPosB165(f.b,g),still=reduceMotionB165();
 // events -> crowd, flash, shake
 for(;fx.ev<f.events.length;fx.ev++){const e=f.events[fx.ev];if(e.kind==='ascend'){fx.roar=1;fx.flash=.35;fx.flashCol='255,150,60'}else if(e.kind==='low')fx.roar=Math.max(fx.roar,.8);else if(e.kind==='end'){fx.roar=1;fx.flash=1;fx.flashCol='255,240,210';fx.shake=Math.max(fx.shake,.45)}}
 for(const [fi,key,p] of [[f.a,'hpA',pa],[f.b,'hpB',pb]]){const d=fx[key]-fi.hp;if(d>.5){const share=d/fi.maxHp,n=Math.min(14,3+Math.round(share*120));for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,s=60+Math.random()*160;fx.sparks.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,t:.35+Math.random()*.25})}if(share>.04)fx.shake=Math.max(fx.shake,Math.min(.3,share*3))}fx[key]=fi.hp}
 fx.roar=Math.max(.25,fx.roar-dt*.35);fx.flash=Math.max(0,fx.flash-dt*2.2);fx.shake=Math.max(0,fx.shake-dt*2.5);
 X.save();
 if(fx.shake>0&&!still){const m=fx.shake*9;X.translate((Math.random()-.5)*m,(Math.random()-.5)*m)}
 // sky and stands
 let sg=X.createLinearGradient(0,0,0,H);sg.addColorStop(0,B165.sky0);sg.addColorStop(.55,B165.sky1);sg.addColorStop(1,'#120b08');X.fillStyle=sg;X.fillRect(-20,-20,W+40,H+40);
 for(let k=3;k>=1;k--){X.fillStyle=k%2?B165.stone:B165.stone2;X.beginPath();X.ellipse(g.cx,g.cy,g.rx+60+k*48,g.ry+46+k*40,0,0,Math.PI*2);X.fill();
  const n=Math.round((g.rx+60+k*48)/9);X.fillStyle='#0c0908';for(let i=0;i<n;i++){const a=Math.PI+i/(n-1)*Math.PI,bob=Math.sin(t*7+i*1.9+k)*fx.roar*3.5*(still?0:1);const hx=g.cx+Math.cos(a)*(g.rx+40+k*48),hy=g.cy+Math.sin(a)*(g.ry+30+k*40)+bob;X.beginPath();X.arc(hx,hy-6,4.5,0,Math.PI*2);X.fill();X.fillRect(hx-5,hy-2,10,8);if(fx.roar>.7&&(i+k)%5===0){X.fillRect(hx-6,hy-16-bob,2,9)}}}
 // wall and floor
 X.fillStyle='#211a16';X.beginPath();X.ellipse(g.cx,g.cy+8,g.rx+26,g.ry+22,0,0,Math.PI*2);X.fill();
 X.strokeStyle=B165.bronze;X.lineWidth=2;X.beginPath();X.ellipse(g.cx,g.cy+2,g.rx+16,g.ry+13,0,0,Math.PI*2);X.stroke();
 const fg=X.createRadialGradient(g.cx,g.cy-g.ry*.2,10,g.cx,g.cy,g.rx*1.05);fg.addColorStop(0,B165.sand);fg.addColorStop(1,B165.sandDark);X.fillStyle=fg;X.beginPath();X.ellipse(g.cx,g.cy,g.rx,g.ry,0,0,Math.PI*2);X.fill();
 X.strokeStyle='#00000022';X.lineWidth=1;for(let k=1;k<5;k++){X.beginPath();X.ellipse(g.cx,g.cy,g.rx*k/5,g.ry*k/5,0,0,Math.PI*2);X.stroke()}
 X.strokeStyle='#6e3a1f55';X.lineWidth=3;X.beginPath();X.ellipse(g.cx,g.cy,g.rx*.55,g.ry*.55,0,0,Math.PI*2);X.stroke();
 // torches and embers
 const torches=[[-.78,-.62],[.78,-.62],[-.95,.25],[.95,.25]].map(([u,v])=>({x:g.cx+u*(g.rx+20),y:g.cy+v*(g.ry+18)-18}));
 torches.forEach((q,i)=>{torchB165(q.x,q.y,t,i);if(Math.random()<dt*7)fx.embers.push({x:q.x+(Math.random()-.5)*8,y:q.y-18,vx:(Math.random()-.5)*20,vy:-30-Math.random()*40,t:1.2+Math.random()})});
 X.save();X.globalCompositeOperation='lighter';
 for(const e of fx.embers){e.t-=dt;e.x+=e.vx*dt+Math.sin(t*3+e.y*.05)*.3;e.y+=e.vy*dt;X.fillStyle=`rgba(255,${120+Math.round(80*Math.min(1,e.t))},40,${Math.min(1,e.t)*.8})`;X.fillRect(e.x,e.y,2,2)}
 fx.embers=fx.embers.filter(e=>e.t>0).slice(-120);
 // shots
 for(const s of f.shots){const from=s.from?pb:pa,to=s.from?pa:pb,k=1-s.t/.35,k0=Math.max(0,k-.18),arc=q=>s.hit?0:Math.sin(q*Math.PI)*-34;
  const x1=from.x+(to.x-from.x)*k,y1=from.y+(to.y-from.y)*k+arc(k),x0=from.x+(to.x-from.x)*k0,y0=from.y+(to.y-from.y)*k0+arc(k0);
  X.strokeStyle=s.asc?'rgba(255,245,220,.95)':s.homing?'rgba(255,205,110,.95)':'rgba(255,110,40,.9)';X.lineWidth=s.asc?5:3;X.lineCap='round';X.beginPath();X.moveTo(x0,y0);X.lineTo(x1,y1);X.stroke()}
 for(const p of fx.sparks){p.t-=dt;p.vy+=380*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;X.fillStyle=`rgba(255,${150+Math.round(100*p.t)},70,${Math.min(1,p.t*3)})`;X.fillRect(p.x,p.y,3,3)}
 fx.sparks=fx.sparks.filter(p=>p.t>0);
 X.restore();
 drawPipB165(f.a,pa,t,pb.x>pa.x?1:-1);drawPipB165(f.b,pb,t,pa.x>pb.x?1:-1);
 // vignette
 const vg=X.createRadialGradient(W/2,H*.55,Math.min(W,H)*.25,W/2,H*.55,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.78)');X.fillStyle=vg;X.fillRect(-20,-20,W+40,H+40);
 X.restore();
 // HUD: iron plates, bronze medallion clock
 const narrow=W<560,pw=narrow?Math.floor((W-24-74)/2):Math.min(300,W*.3),ph=narrow?62:70,top=12;
 const side=(fi,x,right)=>{plateB165(x,top,pw,ph);X.textAlign=right?'right':'left';X.fillStyle=B165.bone;X.font=`700 ${narrow?12:15}px ${B165_SERIF}`;spacingB165('2px');
  const tx=right?x+pw-10:x+10;X.fillText(`${fi.src.name.toUpperCase()}${fi.src.seed&&!fi.src.pip?`  ·  ${fi.src.seed}`:''}`,tx,top+19);spacingB165('0px');
  const bx=x+10,bw=pw-20;barB165(bx,top+26,bw,12,fi.hp/fi.maxHp,fi.hp<fi.maxHp*.25?'#ff3b3b':'#7a1418','#d8333b');
  barB165(bx,top+41,bw,8,fi.heat/100,'#7a2e0c',fi.heat>=70?'#ffd27a':B165.ember);X.fillStyle=B165.bone;X.fillRect(bx+bw*.7-1,top+39,2,12);
  barB165(bx,top+52,bw,5,fi.glow,'#3c4c55',fi.broken>0?'#ff8a8a':B165.steel);};
 side(f.a,10,false);side(f.b,W-10-pw,true);
 const mx=W/2,my=top+(narrow?30:34),mr=narrow?27:31;
 X.fillStyle='#16110f';X.strokeStyle=B165.bronze;X.lineWidth=3;X.beginPath();X.arc(mx,my,mr,0,Math.PI*2);X.fill();X.stroke();X.strokeStyle='#5a4220';X.lineWidth=1;X.beginPath();X.arc(mx,my,mr-5,0,Math.PI*2);X.stroke();
 X.textAlign='center';X.fillStyle=B165.bone;X.font=`700 ${narrow?20:24}px ${B165_SERIF}`;X.fillText(Math.max(0,Math.ceil(B163_CLOCK-f.t)),mx,my+8);
 X.font=`700 ${narrow?10:12}px ${B165_SERIF}`;spacingB165('3px');X.fillStyle=B165.bronzeHi;const shown=c.phase==='after'||c.phase==='between'?{...c.br,round:c.br.round-1}:c.br; // the bracket has already moved on after a result
 X.fillText((c.br.tutorial?'SPARRING':`${roundNameB163(shown).toUpperCase()} · RANK ${B108_RANKS[c.br.rank].id}`),mx,top+ph+(narrow?30:22));spacingB165('0px');
 if(c.call){const y=top+ph+(narrow?54:48);X.globalAlpha=Math.min(1,c.call.t*2);X.fillStyle='#000000a0';X.fillRect(0,y-20,W,30);X.fillStyle=B165.bronzeHi;X.font=`italic 700 ${narrow?16:20}px ${B165_SERIF}`;X.fillText(c.call.text,W/2,y+1);X.globalAlpha=1}
 const g2=ringB165();
 if(c.phase==='intro'){
  const y=g2.cy;X.fillStyle='#000000c8';X.fillRect(0,y-86,W,172);X.strokeStyle=B165.bronze;X.lineWidth=2;X.beginPath();X.moveTo(W*.12,y-62);X.lineTo(W*.88,y-62);X.moveTo(W*.12,y+64);X.lineTo(W*.88,y+64);X.stroke();
  X.fillStyle=B165.bronzeHi;X.font=`700 ${narrow?12:14}px ${B165_SERIF}`;spacingB165('5px');X.fillText(roundNameB163(c.br).toUpperCase(),W/2,y-38);spacingB165('2px');
  X.fillStyle=B165.bone;X.font=`700 ${narrow?26:38}px ${B165_SERIF}`;X.fillText(`PIP  vs  ${c.opp.name.toUpperCase()}`,W/2,y+2);spacingB165('0px');
  const s=c.opp.stats;X.font=`italic ${narrow?12:15}px ${B165_SERIF}`;X.fillStyle='#cdbf9f';X.fillText(`${c.opp.name} ${c.opp.line}.  ♥${s.range}  ➜${s.speed}  ✦${s.power}  ◇${s.guard}`,W/2,y+28,W-24);
  X.font=`700 ${narrow?11:13}px ${B165_SERIF}`;X.fillStyle=B165.bronzeHi;X.fillText(coachLineB165(),W/2,y+52,W-24);
 }
 if(c.phase==='after'){const won=f.winner===0,y=g2.cy;X.fillStyle='#000000b0';X.fillRect(0,y-44,W,88);X.fillStyle=won?B165.bronzeHi:'#e0474f';X.font=`700 ${narrow?34:48}px ${B165_SERIF}`;spacingB165('8px');X.fillText(won?'VICTORY':'DEFEAT',W/2,y+14);spacingB165('0px');X.font=`italic ${narrow?13:16}px ${B165_SERIF}`;X.fillStyle=B165.bone;X.fillText(won?`${c.opp.name} yields.`:`Pip falls to ${c.opp.name}.`,W/2,y+36)}
 if(c.phase==='paused'){X.fillStyle='#000000a0';X.fillRect(0,0,W,H);X.fillStyle=B165.bone;X.font=`700 ${narrow?30:42}px ${B165_SERIF}`;spacingB165('8px');X.fillText('PAUSED',W/2,H*.32);spacingB165('0px')}
 const tu=c.tutorial;
 if(tu&&c.phase==='fight'){const s=B164_STEPS[tu.step];if(s){const w=Math.min(560,W-24),x=(W-w)/2,y=H-(narrow?250:180);plateB165(x,y,w,58);X.fillStyle=B165.bronzeHi;X.font=`700 ${narrow?11:12}px ${B165_SERIF}`;spacingB165('3px');X.fillText(`LESSON ${Math.min(tu.step+1,3)} OF 3`,W/2,y+18);spacingB165('0px');X.fillStyle=B165.bone;X.font=`${narrow?14:17}px ${B165_SERIF}`;X.fillText(s.say,W/2,y+42,w-20)}}
 if(fx.flash>0){X.fillStyle=`rgba(${fx.flashCol},${fx.flash*.55})`;X.fillRect(0,0,W,H)}
};

// ---- chrome: hide the pastel ranch HUD in the ring, iron buttons, pause button ----
(function installB165(){
 const b=document.createElement('button');b.id='ranchPauseB165';b.type='button';b.textContent='❚❚';b.setAttribute('aria-label','Pause');document.getElementById('app')?.appendChild(b);
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ranchWorldB100.b165PauseTap=true});
 const s=document.createElement('style');s.textContent=`
body.colB163 #ranchHudB100,body.colB163 #ranchToastB100{display:none!important}
body.colB163 #ranchActB100,body.colB163 #ranchPipBtnB109,body.colB163 #ranchGuardB163{background:radial-gradient(circle at 50% 35%,#3a302a,#120d0b);border:3px solid ${B165.bronze};color:${B165.bone};font:700 11px ${B165_SERIF};letter-spacing:1px;box-shadow:0 0 0 2px #000a,0 8px 20px #000c}
body.colB163 #ranchPipBtnB109{color:#9c8e76}
body.colB163 #ranchPipBtnB109.b165Ready{color:#fff2c8;border-color:${B165.ember};box-shadow:0 0 0 2px #000a,0 0 22px #ff6a1faa}
body.colB163 #ranchActB100.b164Pulse,body.colB163 #ranchPipBtnB109.b164Pulse,body.colB163 #ranchGuardB163.b164Pulse{border-color:${B165.bronzeHi}}
#ranchPauseB165{display:none;position:absolute;z-index:12;left:max(14px,env(safe-area-inset-left));top:calc(env(safe-area-inset-top) + 92px);width:46px;height:46px;border-radius:50%;border:2px solid ${B165.bronze};background:#16110fe0;color:${B165.bone};font:700 14px ${B165_SERIF};touch-action:none}
body.colB163 #ranchPauseB165.on{display:block}
#ranchSheetB100.b165{background:linear-gradient(#2b2420,#17110f);color:#d6c8ad;border:2px solid ${B165.bronze};box-shadow:0 14px 40px #000c;font-family:${B165_SERIF}}
#ranchSheetB100.b165 h3{color:${B165.bronzeHi};letter-spacing:3px;text-transform:uppercase;font-family:${B165_SERIF}}
#ranchSheetB100.b165 p{color:#cdbf9f}
#ranchSheetB100.b165 button{background:#3a302a;border:2px solid #6e5531;color:${B165.bone};font-family:${B165_SERIF};letter-spacing:.5px}
#ranchSheetB100.b165 button.focus{border-color:${B165.bronzeHi};background:#4a3a2c;box-shadow:0 0 0 3px #b8863b55}
#ranchSheetB100.b165 button.quiet{background:transparent;color:#a8977a}`;document.head.appendChild(s);
})();
