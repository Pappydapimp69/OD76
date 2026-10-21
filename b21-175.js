// B163 Colosseum: rival-Pip gladiator brackets at the Arena gate (docs/B163-colosseum.md). Pip fights one rival at a time
// in a ring and the player only coaches: A = Focus (next 3 shots home), X = Ascend (70% HEAT), B held = Guard. Eight
// Pips per bracket, fold-seeded so the top two meet only in the final. Fatigue is paid per fight; brackets pay Heart
// Stones and never unlock ranks (the Colosseum is a side mode; ranks gate it, not the other way round).
// Stats form a counter loop instead of one power axis: Star Power's big hits punch through Guardian Glow's flat armour,
// armour shrugs off Swift Pip's many small hits, and Swift's dodge makes big slow hits miss. Heart Sense fills HEAT.
const B163_KEY='od76-colosseum-b163',B163_V=1,B163_DT=1/60,B163_CLOCK=60,B163_FIGHT_FATIGUE=.04,B163_CATCH_BREATH=.08;
const B163_STATS=['range','speed','power','guard'];
const B163_T={hp:16,arm:1.8,ds:.5,dp:2,cap:.75,gh:2.5,pierce:.7,sense:.07,vary:.35,aim:.5,ascR:.15,leech:1.6}; // tuned by seeded sweeps: Power>Guard>Swift>Power at levels 16-80
const B163_BUDGET=[4,12,24,40,60,84];  // ranch levels summed over the four stats, for a rank's middle rival
const B163_SPREAD=[1.15,1.1,1.05,1,.95,.9,.85];
const B163_PRIZE=[1,2,4];              // Heart Stones for winning the quarter-final, semi-final and final
const B163_ARCH=[
 {id:'striker',w:{range:1,speed:2,power:4,guard:1},ai:'aggro',line:'hits hard and never waits'},
 {id:'wall',w:{range:1,speed:1,power:2,guard:4},ai:'patient',line:'lets you tire yourself out'},
 {id:'dart',w:{range:1,speed:4,power:2,guard:1},ai:'sly',line:'strikes when your guard breaks'},
 {id:'seeker',w:{range:4,speed:2,power:1,guard:1},ai:'sly',line:'builds HEAT and ascends often'},
 {id:'even',w:{range:1,speed:1,power:1,guard:1},ai:'patient',line:'has no weak side'}
];
const B163_NAMES=[
 ['Pebble','Mochi','Sprout','Bean','Tuft','Dot','Wisp'],
 ['Clover','Biscuit','Fizz','Juniper','Pogo','Sorrel','Taffy'],
 ['Cinder','Marlowe','Quill','Rune','Sable','Thistle','Vesper'],
 ['Aurora','Brigand','Cobalt','Dynamo','Ember','Falcon','Garnet'],
 ['Halcyon','Ironleaf','Jubilee','Kestrel','Lumen','Monarch','Nimbus'],
 ['Oberon','Paragon','Quasar','Regalia','Solstice','Titan','Zenith']
];
const B163_COLOURS=['#ff8fb8','#8fd3ff','#b6f28f','#ffcf6e','#c9a2ff','#ff9f7a','#7ff0d8'];

// ---- save ----
function blankColB163(){const r={};for(const k of B108_RANKS)r[k.id]=0;return{v:B163_V,seed:1,wins:{...r},best:{...r}}}
function loadColB163(){
 const c=blankColB163();
 try{const v=JSON.parse(localStorage.getItem(B163_KEY)||'null');if(v&&typeof v==='object'){
  const n=(x,hi)=>{const k=Math.floor(Number(x));return Number.isFinite(k)?clamp(k,0,hi):0};
  c.seed=Math.max(1,n(v.seed,2147483647));for(const k in c.wins){c.wins[k]=n(v.wins?.[k],1e6);c.best[k]=n(v.best?.[k],3)}}}catch(_){}
 return c;
}
function saveColB163(){try{localStorage.setItem(B163_KEY,JSON.stringify(colSaveB163))}catch(_){}}
let colSaveB163=loadColB163();
function trophiesB163(){return Object.values(colSaveB163.wins).filter(n=>n>0).length}

// ---- deterministic random: fights use their own sfc32 stream, so cosmetic rolls (Math.random) can't change a result ----
function rngB163(seed){
 let a=0x9e3779b9,b=0x243f6a88,c=0xb7e15162,d=seed>>>0;
 const f=()=>{a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=c<<21|c>>>11;c=c+t|0;return(t>>>0)/4294967296};
 for(let i=0;i<12;i++)f();return f;
}

// ---- entrants ----
function pipEntrantB163(){const s=ranchB99.stats;return{name:'Pip',pip:true,colour:'#ffe58f',ai:'patient',asc:Math.min(5,trophiesB163()),stats:{range:s.range|0,speed:s.speed|0,power:s.power|0,guard:s.guard|0}}}
function rivalB163(rank,i){
 const arch=B163_ARCH[(i+rank)%B163_ARCH.length],budget=Math.round(B163_BUDGET[rank]*B163_SPREAD[i]),wsum=B163_STATS.reduce((s,k)=>s+arch.w[k],0),stats={};
 // Largest remainder, so small rank-E budgets still spread across stats.
 let left=budget;for(const k of B163_STATS){stats[k]=Math.floor(budget*arch.w[k]/wsum);left-=stats[k]}
 const order=[...B163_STATS].sort((x,y)=>(budget*arch.w[y]/wsum%1)-(budget*arch.w[x]/wsum%1)||arch.w[y]-arch.w[x]);
 for(let i=0;left>0;i++,left--)stats[order[i%4]]++;
 return{name:B163_NAMES[rank][i],colour:B163_COLOURS[i],arch:arch.id,line:arch.line,ai:arch.ai,asc:rank,stats};
}
function totalB163(e){return B163_STATS.reduce((s,k)=>s+(e.stats[k]||0),0)}

// ---- bracket: fold seeding, seeds by stat total (Pip loses ties so rivals keep their spots) ----
const B163_FOLD=[0,7,3,4,1,6,2,5]; // round-one order by seed index: 1v8, 4v5, 2v7, 3v6
function bracketB163(rank,seed){
 const entrants=[pipEntrantB163()];for(let i=0;i<7;i++)entrants.push(rivalB163(rank,i));
 const seeds=entrants.map((e,i)=>i).sort((a,b)=>totalB163(entrants[b])-totalB163(entrants[a])||(entrants[a].pip?1:entrants[b].pip?-1:a-b));
 seeds.forEach((e,s)=>entrants[e].seed=s+1);
 return{rank,seed,entrants,round:0,slots:B163_FOLD.map(s=>seeds[s]),results:[],won:0,out:false,champion:false};
}
function pairsB163(br){const p=[];for(let i=0;i<br.slots.length;i+=2)p.push([br.slots[i],br.slots[i+1]]);return p}
function pipPairB163(br){return pairsB163(br).find(p=>br.entrants[p[0]].pip||br.entrants[p[1]].pip)||null}

// ---- fight sim ----
function fighterB163(src,side){
 // Diminishing returns: a 10% stat edge is ~5% in the ring, so seeds favour but don't decide (Brain: tier-ceiling tension).
 const e={};for(const k of B163_STATS)e[k]=2+3*Math.sqrt(Math.max(0,src.stats[k]||0));
 const m=(e.range+e.speed+e.power+B163_T.gh*e.guard)/(3+B163_T.gh),hp=Math.round(B163_T.hp*5*(1+.1*m)*(1+.1*m)); // HP grows like even-fight damage, so fight length holds steady
 return{src,side,e,hp,maxHp:hp,heat:0,cd:.5+.2*side,focus:0,focusCd:0,glow:1,guarding:false,broken:0,ascT:0,ascDrain:0,hits:0,shots:0,ang:side?0:Math.PI,cmdUse:{focus:0,ascend:0,guard:0},hpCalled:false};
}
function fightB163(a,b,seed){return{a:fighterB163(a,0),b:fighterB163(b,1),t:0,rng:rngB163(seed),shots:[],done:false,winner:null,events:[]}}
function senseB163(f){return 1+B163_T.sense*f.e.range}
function armourB163(f){return B163_T.arm*f.e.guard}
function shotDamageB163(f,homing){return 5*(1+.1*f.e.power)*(f.ascT>0?1.8+.12*f.src.asc:1)*(homing?1.15:1)}
// Dodge and armour work on stat ratios, so the counter loop holds at every level instead of drifting as numbers grow.
function dodgeB163(att,def){const rs=def.e.speed/(def.e.speed+att.e.speed),rp=att.e.power/(att.e.power+att.e.speed);const ra=att.e.range/(att.e.range+def.e.speed);return clamp(.1+B163_T.ds*(rs-.5)+B163_T.dp*Math.max(0,rp-.5)*rs-B163_T.aim*(ra-.5),.04,B163_T.cap)} // Heart Sense reads the dodge // big slow hits are easy to dodge
function aiCmdB163(me,op,t){
 const c={focus:false,ascend:false,guard:false},k=me.src.ai,low=me.hp<me.maxHp*.3;
 if(me.focusCd<=0&&!op.guarding&&(k==='aggro'||op.hp<op.maxHp*.7||op.broken>0))c.focus=true;
 if(me.heat>=70&&me.ascT<=0){
  if(k==='aggro')c.ascend=true;
  else if(k==='sly')c.ascend=op.broken>0||op.glow<.3||op.hp<op.maxHp*.5||me.heat>=95;
  else c.ascend=!op.guarding;
 }
 if(me.glow>.25&&me.broken<=0&&me.ascT<=0){
  if(op.ascT>0)c.guard=k!=='aggro'||low;
  else if(k==='patient'&&op.focus>0)c.guard=true;
 }
 return c;
}
function stepSideB163(f,me,op,c){
 const sense=senseB163(me);
 me.focusCd=Math.max(0,me.focusCd-B163_DT);me.broken=Math.max(0,me.broken-B163_DT);
 if(c.focus&&me.focusCd<=0){me.focus=3;me.focusCd=4;me.cmdUse.focus++}
 if(c.ascend&&me.heat>=70&&me.ascT<=0){me.ascT=4+.4*me.src.asc+B163_T.ascR*me.e.range;me.ascDrain=me.heat/me.ascT;me.cmdUse.ascend++;f.events.push({t:f.t,kind:'ascend',side:me.side})}
 const wasGuard=me.guarding;
 me.guarding=!!c.guard&&me.broken<=0&&me.glow>0&&me.ascT<=0;
 if(me.guarding&&!wasGuard)me.cmdUse.guard++;
 if(me.guarding){me.glow-=B163_DT/4;if(me.glow<=0){me.glow=0;me.guarding=false;me.broken=3;f.events.push({t:f.t,kind:'break',side:me.side})}}
 else me.glow=Math.min(1,me.glow+B163_DT/5);
 if(me.ascT>0){me.ascT-=B163_DT;me.heat=Math.max(0,me.heat-me.ascDrain*B163_DT);if(me.ascT<=0){me.ascT=0;me.heat=0}}
 else me.heat=Math.min(100,me.heat+B163_DT*1.2*sense);
 me.ang+=B163_DT*(.5+.03*me.e.speed)*(me.side?1:-1);
 if(me.guarding)return;
 me.cd-=B163_DT*(me.ascT>0?1.5:1);
 if(me.cd<=0){
  me.cd+=1.1/(1+.1*me.e.speed); // Swift buys fire rate at the same rate Star Power buys damage
  const homing=me.focus>0;if(homing)me.focus--;
  const hit=homing||f.rng()>=dodgeB163(me,op),roll=f.rng();
  me.shots++;f.shots.push({from:me.side,t:.35,hit,homing,dmg:shotDamageB163(me,homing)*(1-B163_T.vary+2*B163_T.vary*roll),asc:me.ascT>0});
 }
}
function landShotB163(f,s){
 const att=s.from?f.b:f.a,def=s.from?f.a:f.b;if(!s.hit)return;
 // Ascended shots pierce half the armour.
 const rp=att.e.power/(att.e.power+att.e.speed),arm=armourB163(def)*(s.asc?.5:1)*(1-B163_T.pierce*rp);let dmg=s.dmg*s.dmg/(s.dmg+arm);if(def.guarding){dmg*=.25;def.heat=Math.min(100,def.heat+4*senseB163(def))} // Power-heavy Pips punch through armour
 // HEAT follows damage share, not hit count, so many small hits don't ascend more often than a few big ones.
 const share=100*dmg/def.maxHp;
 if(!def.guarding)def.heat=Math.min(100,def.heat+share*senseB163(def));
 def.hp-=dmg;att.hits++;
 // Heart Sense gathers the hearts a hit knocks loose: heals by its share of the attacker's stats.
 att.hp=Math.min(att.maxHp,att.hp+dmg*B163_T.leech*att.e.range/(att.e.range+att.e.speed+att.e.power+att.e.guard));if(att.ascT<=0)att.heat=Math.min(100,att.heat+1.5*share*senseB163(att));
}
function stepFightB163(f,cmdA,cmdB){
 if(f.done)return f;
 const ca=cmdA||aiCmdB163(f.a,f.b,f.t),cb=cmdB||aiCmdB163(f.b,f.a,f.t);
 stepSideB163(f,f.a,f.b,ca);stepSideB163(f,f.b,f.a,cb);
 for(const s of f.shots){s.t-=B163_DT;if(s.t<=0)landShotB163(f,s)}f.shots=f.shots.filter(s=>s.t>0);
 for(const me of [f.a,f.b])if(!me.hpCalled&&me.hp>0&&me.hp<me.maxHp*.25){me.hpCalled=true;f.events.push({t:f.t,kind:'low',side:me.side})}
 f.t+=B163_DT;
 if(f.a.hp<=0||f.b.hp<=0){f.done=true;f.winner=f.a.hp/f.a.maxHp>=f.b.hp/f.b.maxHp?0:1;f.ko=true}
 else if(f.t>=B163_CLOCK){f.done=true;const ra=f.a.hp/f.a.maxHp,rb=f.b.hp/f.b.maxHp;f.winner=Math.abs(ra-rb)>1e-9?(ra>rb?0:1):f.a.hits!==f.b.hits?(f.a.hits>f.b.hits?0:1):(f.rng()<.5?0:1)}
 if(f.done)f.events.push({t:f.t,kind:'end',side:f.winner});
 return f;
}
// Headless fight: both sides on AI unless a coach function supplies side A's commands.
function runFightB163(a,b,seed,coachA){const f=fightB163(a,b,seed);while(!f.done)stepFightB163(f,coachA?coachA(f):null,null);return f}
function playRoundB163(br,pipWon){
 // Pip's fight result comes from the live fight; the other quarter- or semi-finals are simulated on seeds from the bracket's.
 const next=[];pairsB163(br).forEach(([x,y],i)=>{
  const ex=br.entrants[x],ey=br.entrants[y];let w;
  if(ex.pip||ey.pip)w=pipWon?(ex.pip?x:y):(ex.pip?y:x);
  else w=runFightB163(ex,ey,(br.seed*31+br.round*7+i)>>>0).winner?y:x;
  br.results.push({round:br.round,a:x,b:y,w});next.push(w);
 });
 br.slots=next;br.round++;
 if(!pipWon)br.out=true;else{br.won++;if(br.slots.length===1)br.champion=true}
 return br;
}
function prizeB163(br){let n=0;for(let i=0;i<br.won;i++)n+=B163_PRIZE[i];return Math.floor(n*B108_RANKS[br.rank].reward)}
function fightFatigueB163(){return Math.ceil(fatigueMaxB118()*B163_FIGHT_FATIGUE)}

// ---- live mode ----
let colB163={active:false};
const B163_LINES={
 start:['The crowd is on its feet!','Gates open. Here we go!','Two Pips, one ring!'],
 ascend:['ASCENDED! The ring lights up!','It\'s an Ascension!','HEAT at the brim. Ascend!'],
 low:['One more hit could end it!','Hanging on by a glow!','The crowd gasps!'],
 ko:['DOWN! What a finish!','That\'s the fight!','The crowd erupts!'],
 clock:['Time! The judges count what\'s left.','The bell! It goes to the cards.']
};
function sayB163(kind){const l=B163_LINES[kind];colB163.call={text:l[Math.floor(Math.random()*l.length)],t:2.2};cheerB163(kind==='ko'||kind==='ascend'?1:.5)}
function cheerB163(level){if(!S?.audioEnabled)return;try{const n=Math.round(3+4*level);for(let i=0;i<n;i++)setTimeout(()=>tone(260+Math.random()*420,.09+Math.random()*.08,.006+.006*level,'triangle'),i*45+Math.random()*30)}catch(_){}}
function startColosseumB163(rank){
 if(!arenaReadyB114()){ranchToastB100('Pip is too tired to fight. Let him rest first.');return false}
 colSaveB163.seed=(colSaveB163.seed*1103515245+12345)%2147483647||1;saveColB163();
 const br=bracketB163(rank,colSaveB163.seed);
 colB163={active:true,br,phase:'intro',t:0,hp:null,call:null,prevGuard:false};
 closeSheetB100();document.body.classList.add('colB163');ranchWorldB100.toastT=0;$('ranchToastB100')?.classList.remove('on');
 startPipFightB163();return true;
}
function startPipFightB163(){
 const c=colB163,br=c.br,p=pipPairB163(br),pip=br.entrants[p[0]].pip?p[0]:p[1],op=p[0]===pip?p[1]:p[0];
 ranchB99.fatigue=Math.min(fatigueMaxB118(),ranchB99.fatigue+fightFatigueB163());saveRanchB99();renderRanchHudB100();
 c.fight=fightB163(br.entrants[pip],br.entrants[op],(br.seed+br.round*977)>>>0);
 if(c.hp!=null)c.fight.a.hp=Math.min(c.fight.a.maxHp,c.hp);
 c.phase='intro';c.t=0;c.acc=0;c.seen=0;c.opp=br.entrants[op];
}
function roundNameB163(br){return['Quarter-final','Semi-final','Final'][br.round]||'Final'}
function finishPipFightB163(){
 const c=colB163,f=c.fight,won=f.winner===0;
 c.hp=Math.max(1,Math.round(f.a.hp));
 playRoundB163(c.br,won);
 c.phase='after';c.t=0;
}
function afterFightB163(){
 const c=colB163,br=c.br;
 if(br.out||br.champion)return endColosseumB163();
 if(ranchB99.fatigue>=tiredLineB141()){c.tiredOut=true;return endColosseumB163()}
 const breath=Math.ceil(fatigueMaxB118()*B163_CATCH_BREATH);
 openSheetB100(`${roundNameB163(br)} next`,`Pip has ${c.hp}/${Math.round(c.fight.a.maxHp)} HP and fatigue ${ranchB99.fatigue}/${fatigueMaxB118()}. The next fight costs ${fightFatigueB163()} fatigue. Pick one:`,[
  {label:'Heal Pip to full',run:()=>{colB163.hp=null;startPipFightB163()}},
  {label:`Catch his breath · fatigue −${breath}`,run:()=>{ranchB99.fatigue=Math.max(0,ranchB99.fatigue-breath);saveRanchB99();startPipFightB163()}},
  {label:'Go home now',quiet:true,run:()=>endColosseumB163()}]);
 c.phase='between';
}
function endColosseumB163(){
 const c=colB163,br=c.br,rk=B108_RANKS[br.rank].id,stones=prizeB163(br);
 ranchB99.stones=(ranchB99.stones||0)+stones;saveRanchB99();
 colSaveB163.best[rk]=Math.max(colSaveB163.best[rk],br.won);if(br.champion)colSaveB163.wins[rk]++;saveColB163();
 c.active=false;document.body.classList.remove('colB163');closeSheetB100();
 for(const id of ['ranchActB100','ranchPipBtnB109','ranchGuardB163'])$(id)?.classList.remove('on');
 ranchWorldB100.prevAct=true;renderRanchHudB100();
 const how=br.champion?`Pip is the rank ${rk} champion! 🏆`:c.tiredOut?`Pip was too tired to fight on after ${br.won} win${br.won===1?'':'s'}.`:br.out?`Pip went out in the ${['quarter-final','semi-final','final'][br.round-1]||'final'}.`:`Pip came home after ${br.won} win${br.won===1?'':'s'}.`;
 ranchToastB100(`${how}${stones?` +◆ ${stones} Heart Stones.`:''}`,5);
 colB163={active:false};
}

// ---- input ----
function colInputB163(){
 const w=ranchWorldB100,inp=ranchInputB100();
 let guard=keys.has('Escape')||keys.has('Backspace')||keys.has('b')||keys.has('B')||!!w.colGuardTouch;
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 for(const pad of pads){if(!pad||!pad.connected)continue;guard=guard||!!(pad.buttons?.[1]?.pressed||pad.buttons?.[1]?.value>.5);break}
 return{focus:inp.actPressed,ascend:!!inp.xPressed,guard,inp};
}
function updateColB163(dt){
 const c=colB163,w=ranchWorldB100;
 if(w.toastT>0){w.toastT-=dt;if(w.toastT<=0)$('ranchToastB100').classList.remove('on')}
 if(c.call){c.call.t-=dt;if(c.call.t<=0)c.call=null}
 const act=$('ranchActB100'),xb=$('ranchPipBtnB109'),gb=$('ranchGuardB163');
 if(c.phase==='between'){
  const inp=ranchInputB100();act?.classList.remove('on');xb?.classList.remove('on');gb?.classList.remove('on');
  if(w.sheet){if(inp.navPressed)focusSheetB100(w.sheet.focus+inp.navPressed);if(inp.actPressed)chooseSheetB100(w.sheet.focus)}
  return;
 }
 c.t+=dt;
 if(c.phase==='intro'){ranchInputB100();if(c.t>2.4){c.phase='fight';c.t=0;sayB163('start')}return}
 if(c.phase==='after'){ranchInputB100();if(c.t>2.6)afterFightB163();return}
 const cmd=colInputB163();
 if(act){act.classList.add('on');act.textContent='Focus'}
 if(xb){xb.classList.add('on');xb.textContent=c.fight.a.heat>=70&&c.fight.a.ascT<=0?'Ascend':'X'}
 gb?.classList.add('on');
 const f=c.fight;c.acc=Math.min(.25,(c.acc||0)+dt);
 let first=true;
 while(c.acc>=B163_DT&&!f.done){c.acc-=B163_DT;stepFightB163(f,{focus:first&&cmd.focus,ascend:first&&cmd.ascend,guard:cmd.guard},null);first=false}
 if(cmd.ascend&&f.a.ascT<=0&&f.a.heat<70)uiSoundB136?.('refuse');
 for(;c.seen<f.events.length;c.seen++){const e=f.events[c.seen];if(e.kind==='ascend'){sayB163('ascend');uiSoundB136?.('hold')}else if(e.kind==='low')sayB163('low');else if(e.kind==='end')sayB163(f.ko?'ko':'clock')}
 if(f.done)finishPipFightB163();
}

// ---- drawing ----
function drawFighterB163(fi,x,y,t){
 const col=fi.src.colour,r=16;
 if(fi.ascT>0){const g=X.createRadialGradient(x,y,4,x,y,46);g.addColorStop(0,'#fff6c8');g.addColorStop(1,'#fff6c800');X.fillStyle=g;X.beginPath();X.arc(x,y,46,0,Math.PI*2);X.fill()}
 if(fi.guarding){X.strokeStyle='#9fe3ff';X.lineWidth=4;X.globalAlpha=.5+.4*fi.glow;X.beginPath();X.arc(x,y,28,0,Math.PI*2);X.stroke();X.globalAlpha=1}
 X.fillStyle=col;X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.fill();
 X.fillStyle='#2b2d42';X.beginPath();X.arc(x-5,y-3,2.2,0,Math.PI*2);X.arc(x+5,y-3,2.2,0,Math.PI*2);X.fill();
 X.strokeStyle=fi.ascT>0?'#fff':'#ffd36f';X.lineWidth=2;X.beginPath();X.moveTo(x,y-r);X.quadraticCurveTo(x+5,y-r-9,x+3,y-r-14);X.stroke();
 if(fi.focus>0){X.fillStyle='#ffd36f';X.font='bold 12px system-ui';X.textAlign='center';X.fillText('◎'.repeat(fi.focus),x,y+r+16)}
 if(fi.broken>0){X.fillStyle='#ff9aa6';X.font='bold 11px system-ui';X.textAlign='center';X.fillText('guard broken',x,y-r-20)}
}
function barB163(x,y,w,h,frac,col,bg){X.fillStyle=bg||'#ffffff22';X.fillRect(x,y,w,h);X.fillStyle=col;X.fillRect(x,y,w*clamp(frac,0,1),h)}
function drawColB163(){
 const c=colB163,f=c.fight,t=performance.now()/1000,rk=c.br.rank,hues=['#1a1530','#10233a','#0d2f33','#1c1640','#0f3326','#3a1712'];
 X.save();X.fillStyle=hues[rk]||'#141428';X.fillRect(0,0,W,H);
 const cx=W/2,cy=H*.54,R=Math.min(W,H*1.3)*.34;
 // crowd
 for(let i=0;i<60;i++){const a=i/60*Math.PI*2,b=Math.sin(t*3+i*1.7)*3;X.fillStyle=B163_COLOURS[i%7]+'55';X.beginPath();X.arc(cx+Math.cos(a)*(R+34),cy+Math.sin(a)*(R*.62+30)+b,6,0,Math.PI*2);X.fill()}
 X.fillStyle='#ffffff10';X.beginPath();X.ellipse(cx,cy,R,R*.62,0,0,Math.PI*2);X.fill();
 X.strokeStyle='#ff6fb1';X.lineWidth=4;X.shadowColor='#ff6fb1';X.shadowBlur=14;X.beginPath();X.ellipse(cx,cy,R,R*.62,0,0,Math.PI*2);X.stroke();X.shadowBlur=0;
 const pos=fi=>({x:cx+Math.cos(fi.ang)*R*.55,y:cy+Math.sin(fi.ang)*R*.62*.55});
 const pa=pos(f.a),pb=pos(f.b);
 for(const s of f.shots){const from=s.from?pb:pa,to=s.from?pa:pb,k=1-s.t/.35,mx=from.x+(to.x-from.x)*k,my=from.y+(to.y-from.y)*k+(s.hit?0:Math.sin(k*Math.PI)*-30);
  X.fillStyle=s.asc?'#fff6c8':s.homing?'#ffd36f':s.from?f.b.src.colour:'#ffe58f';X.beginPath();X.arc(mx,my,s.asc?6:4,0,Math.PI*2);X.fill()}
 drawFighterB163(f.a,pa.x,pa.y,t);drawFighterB163(f.b,pb.x,pb.y,t);
 // HUD: names, HP, HEAT (with the 70% ignition mark), glow
 const bw=Math.min(220,W*.38),top=W<700?62:84; // clear of the ranch HUD pill
 const side=(fi,x,align)=>{
  X.textAlign=align;X.fillStyle='#fff';X.font='800 14px system-ui';X.fillText(`${fi.src.name}${fi.src.pip?'':` · seed ${fi.src.seed}`}`,align==='left'?x:x+bw,top-8);
  barB163(x,top,bw,10,fi.hp/fi.maxHp,fi.hp<fi.maxHp*.25?'#ff6f7d':'#7ff0a0');
  barB163(x,top+14,bw,6,fi.heat/100,fi.heat>=70?'#ffd36f':'#ff9f4a');X.fillStyle='#fff';X.fillRect(x+bw*.7-1,top+12,2,10);
  barB163(x,top+24,bw,4,fi.glow,fi.broken>0?'#ff9aa6':'#9fe3ff');
 };
 side(f.a,16,'left');side(f.b,W-16-bw,'right');
 X.textAlign='center';X.fillStyle='#fff';X.font='800 20px system-ui';X.fillText(Math.max(0,Math.ceil(B163_CLOCK-f.t)),W/2,top+14);
 X.font='700 12px system-ui';X.fillStyle='#ffffffaa';X.fillText(`RANK ${B108_RANKS[rk].id} · ${roundNameB163(c.br)}`,W/2,top-8);
 if(c.phase==='intro'){
  X.fillStyle='#000a';X.fillRect(0,cy-70,W,140);X.fillStyle='#fff';X.font='900 26px system-ui';X.fillText(`${roundNameB163(c.br)}: Pip vs ${c.opp.name}`,W/2,cy-22);
  X.font='600 14px system-ui';X.fillStyle='#ffd36f';const s=c.opp.stats;X.fillText(`${c.opp.name} ${c.opp.line}. ♥${s.range} ➜${s.speed} ✦${s.power} ◇${s.guard}`,W/2,cy+6);
  X.fillStyle='#ffffffcc';X.fillText('A Focus · X Ascend at 70% HEAT · hold B Guard',W/2,cy+32);
 }
 if(c.phase==='after'){X.fillStyle='#000a';X.fillRect(0,cy-40,W,80);X.fillStyle=f.winner===0?'#7ff0a0':'#ff9aa6';X.font='900 28px system-ui';X.fillText(f.winner===0?'Pip wins!':`${c.opp.name} wins`,W/2,cy+10)}
 if(c.call){X.globalAlpha=Math.min(1,c.call.t*2);X.fillStyle='#ffd36f';X.font='900 18px system-ui';X.fillText(c.call.text,W/2,top+52);X.globalAlpha=1}
 X.restore();
}

// ---- wiring ----
(function installColB163(){
 const b=document.createElement('button');b.id='ranchGuardB163';b.type='button';b.textContent='Guard';document.getElementById('app')?.appendChild(b);
 b.addEventListener('pointerdown',e=>{e.preventDefault();ranchWorldB100.colGuardTouch=true;try{b.setPointerCapture(e.pointerId)}catch(_){}});
 const up=()=>{ranchWorldB100.colGuardTouch=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
 const s=document.createElement('style');s.textContent=`#ranchGuardB163{display:none;position:absolute;z-index:12;right:calc(max(18px,env(safe-area-inset-right)) + 180px);bottom:max(30px,env(safe-area-inset-bottom));width:72px;height:72px;border-radius:50%;border:3px solid #fff;background:#9fe3ff;color:#23465a;font:800 13px system-ui}
body.colB163 #ranchGuardB163.on{display:block}body.colB163 #ranchBagB104{display:none!important}body.colB163 #ranchHudB100 .fat,body.colB163 #ranchHudB100>span:nth-child(3){opacity:.9}`;document.head.appendChild(s);
})();
const updateBeforeB163=update;
update=function(dt){if(colB163.active){updateColB163(dt);return}updateBeforeB163(dt)};
const drawBeforeB163=draw;
draw=function(){if(colB163.active){drawColB163();return}drawBeforeB163()};
// Arena gate: add the Colosseum to the gate sheet whenever battle tests are allowed.
function colosseumSheetB163(){
 const opts=[];
 for(let i=ranchB99.rankUnlocked;i>=0;i--){const r=B108_RANKS[i],best=colSaveB163.best[r.id],wins=colSaveB163.wins[r.id];
  opts.push({label:`Rank ${r.id} bracket · prizes ×${r.reward}${wins?` · 🏆${wins}`:best?` · best ${['','QF','SF','final'][best]} win`:''}`,run:()=>startColosseumB163(i)})}
 opts.push({label:'Not now',quiet:true});
 openSheetB100('Colosseum ⚔',`Eight Pips, single elimination. You coach: A Focus, X Ascend at 70% HEAT, hold B Guard. Each fight costs ${fightFatigueB163()} fatigue; wins pay ◆ ${B163_PRIZE.join(' / ')} Heart Stones × rank. Trophies: ${trophiesB163()} (each makes Pip's Ascension stronger here).`,opts);
}
const interactBeforeB163=interactStationB100;
interactStationB100=function(st){
 if(st.id!=='gate'||!arenaReadyB114())return interactBeforeB163(st);
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Arena gate'&&Array.isArray(options)){const o=[...options],q=o.findIndex(x=>x.quiet&&/^Not yet/.test(x.label));o.splice(q<0?o.length:q,0,{label:'Colosseum ⚔ · rival-Pip brackets',run:colosseumSheetB163});options=o}
  return open(title,text,options,...rest);
 };
 try{return interactBeforeB163(st)}finally{openSheetB100=open}
};
const resetBeforeB163=reset;
reset=function(){if(colB163.active){colB163={active:false};document.body.classList.remove('colB163')}return resetBeforeB163()};
