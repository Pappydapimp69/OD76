// B164 Colosseum building + tutorial. The Colosseum leaves the Arena gate menu and becomes its own building on the
// ranch, south-west of Pip's bed. It shows from the start, boarded up with a sign naming the unlock (rank D, i.e.
// clear stage 5 at rank E), so the goal is visible before it's reachable. Opening plays a short reveal once.
// First visit offers a sparring tutorial against Sprout (B166: twelve lessons, explanation cards plus drills). Each step is marked done by
// Pip's own command use (f.a), never the rival's, so the step can't be satisfied by the wrong side. No fatigue, no
// prize; skippable, and replayable from the Colosseum sheet.
const B164_STATION={id:'colosseum',x:480,y:1270,name:'Colosseum',r:120};
B100_STATIONS.push(B164_STATION);
// B163's loader keeps only seed/wins/best; read the B164 flags from the same save.
try{const raw=JSON.parse(localStorage.getItem(B163_KEY)||'null');colSaveB163.tutorial=!!raw?.tutorial;colSaveB163.revealed=!!raw?.revealed}catch(_){colSaveB163.tutorial=false;colSaveB163.revealed=false}
function colosseumOpenB164(){return(ranchB99.rankUnlocked|0)>=1}

// ---- Arena gate goes back to battle tests only ----
const interactBeforeB164=interactStationB100;
interactStationB100=function(st){
 if(st.id==='colosseum')return colosseumStationB164();
 if(st.id!=='gate')return interactBeforeB164(st);
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){if(title==='Arena gate'&&Array.isArray(options))options=options.filter(o=>!/^Colosseum/.test(o.label));return open(title,text,options,...rest)};
 try{return interactBeforeB164(st)}finally{openSheetB100=open}
};
const nearestBeforeB164=nearestInteractB100;
nearestInteractB100=function(){const n=nearestBeforeB164();if(n?.st?.id==='colosseum')n.label=colosseumOpenB164()?'Colosseum':'Locked';return n};

function colosseumStationB164(){
 if(!colosseumOpenB164()){
  const r=B108_RANKS[0].id,n=B108_RANKS[1].id;
  openSheetB100('Colosseum 🔒',`Rival Pips fight here in eight-Pip brackets. It opens when Pip unlocks rank ${n}: clear stage ${B108_RANK_UNLOCK_STAGE} at rank ${r} in a battle test at the Arena gate.`,[{label:'OK',quiet:true}]);return;
 }
 if(!colSaveB163.tutorial){
  openSheetB100('Colosseum ⚔','First time here? A short sparring match with Sprout teaches the three coaching commands. No fatigue, no prize.',[
   {label:'Start the tutorial',run:startTutorialB164},
   {label:'Skip it',run:()=>{colSaveB163.tutorial=true;saveColB163();colosseumSheetB164()}},
   {label:'Not now',quiet:true}]);return;
 }
 colosseumSheetB164();
}
function colosseumSheetB164(){
 if(!arenaReadyB114()){openSheetB100('Colosseum ⚔',`Pip is too tired to fight (fatigue ${ranchB99.fatigue}; he needs ${B114_ARENA_MAX_FATIGUE} or less). Rest him at his bed. You can still practise with Sprout.`,[{label:'Practise with Sprout',run:startTutorialB164},{label:'OK',quiet:true}]);return}
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){const o=[...options],q=o.findIndex(x=>x.quiet);o.splice(q<0?o.length:q,0,{label:'Practise with Sprout (tutorial)',run:startTutorialB164});return open(title,text,o,...rest)};
 try{return colosseumSheetB163()}finally{openSheetB100=open}
}

// ---- reveal, once ----
const updateRanchBeforeB164=updateRanchB100;
updateRanchB100=function(dt,...a){
 const r=updateRanchBeforeB164(dt,...a),w=ranchWorldB100;
 if(w.active&&!w.sheet&&!w.game&&colosseumOpenB164()&&!colSaveB163.revealed){
  colSaveB163.revealed=true;saveColB163();w.b164Reveal=3;
  burstHeartsB100(B164_STATION.x,B164_STATION.y-60,14);cheerB163(1);
  ranchToastB100('The Colosseum is open! Find it south-west of Pip\'s bed. ⚔',6);
 }
 if(w.b164Reveal>0)w.b164Reveal=Math.max(0,w.b164Reveal-dt);
 return r;
};

// ---- building ----
const drawStationBeforeB164=drawStationB100;
drawStationB100=function(st,t){
 if(st.id!=='colosseum')return drawStationBeforeB164(st,t);
 const x=st.x,y=st.y,open=colosseumOpenB164(),c=B100_PASTEL,glow=ranchWorldB100.b164Reveal||0;
 if(glow>0){const g=X.createRadialGradient(x,y-40,10,x,y-40,170);g.addColorStop(0,`rgba(255,246,200,${.6*glow/3})`);g.addColorStop(1,'rgba(255,246,200,0)');X.fillStyle=g;X.beginPath();X.arc(x,y-40,170,0,Math.PI*2);X.fill()}
 // round stone wall with arches
 X.fillStyle='#efe3d0';X.beginPath();X.ellipse(x,y-30,110,70,0,0,Math.PI*2);X.fill();
 X.fillStyle='#e2d2ba';X.fillRect(x-110,y-30,220,40);X.beginPath();X.ellipse(x,y+10,110,30,0,0,Math.PI);X.fill();
 X.fillStyle='#d6c3a6';for(let i=-3;i<=3;i++){if(!i)continue;X.beginPath();X.arc(x+i*30,y-6,9,Math.PI,0);X.lineTo(x+i*30+9,y+8);X.lineTo(x+i*30-9,y+8);X.closePath();X.fill()}
 X.fillStyle='#f7efe2';X.beginPath();X.ellipse(x,y-36,84,46,0,0,Math.PI*2);X.fill(); // arena floor seen over the wall
 X.fillStyle=open?c.pink:'#d9cfc2';X.beginPath();X.ellipse(x,y-36,70,36,0,0,Math.PI*2);X.fill();
 // banners
 for(const s of [-1,1]){X.fillStyle='#bba98e';X.fillRect(x+s*96-2,y-110,4,70);X.fillStyle=open?(s<0?c.lilac:c.sky):'#cfc6bb';X.beginPath();X.moveTo(x+s*96+2,y-108);X.lineTo(x+s*96+30*s+2,y-98);X.lineTo(x+s*96+2,y-88);X.closePath();X.fill()}
 // gate
 X.fillStyle=open?'#7a5c8f':'#6b5a4a';X.beginPath();X.arc(x,y+6,22,Math.PI,0);X.lineTo(x+22,y+34);X.lineTo(x-22,y+34);X.closePath();X.fill();
 if(!open){
  X.strokeStyle='#b48a5a';X.lineWidth=7;X.beginPath();X.moveTo(x-28,y-6);X.lineTo(x+28,y+30);X.moveTo(x+28,y-6);X.lineTo(x-28,y+30);X.stroke();
  X.fillStyle='#e8c99a';X.fillRect(x+40,y+18,64,26);X.fillStyle='#8a6a44';X.fillRect(x+70,y+44,4,16);X.fillStyle='#5a4630';X.font='800 11px system-ui';X.textAlign='center';X.fillText(`Rank ${B108_RANKS[1].id}`,x+72,y+35);
 }else{const p=.5+.5*Math.sin(t*3);X.fillStyle=`rgba(255,211,111,${.35+.35*p})`;X.font='900 18px system-ui';X.textAlign='center';X.fillText('⚔',x,y-30)}
 labelB100(x,y-150,'Colosseum',open?'Rival-Pip brackets':`Opens at rank ${B108_RANKS[1].id}`);
};

// ---- tutorial ----
// B166: lessons are data. 'info' cards freeze the fight and wait for A (Continue); 'do' lessons are drills that finish
// only on Pip's own state or commands (f.a), never Sprout's. Button names come from btnB165()/pressB165() (B165).
const B164_SPROUT={name:'Sprout',colour:'#b6f28f',line:'is here to help you practise',ai:'patient',asc:0,stats:{range:0,speed:0,power:0,guard:2},tutorial:true};
const B164_STEPS=[
 {kind:'info',title:'Welcome to the Colosseum',get say(){return'You don\'t fight here: you coach. Pip fights on his own with the stats he trained at the ranch. Your three commands decide when he pushes, bursts and blocks.'}},
 {kind:'info',title:'Read the plates',show:'plates',get say(){return'Top plates, Pip on the left. Red is HP. Orange is HEAT: the white notch is 70%, where Pip can Ascend. Blue is Guard stamina. The medallion is the 60-second clock.'}},
 {kind:'do',title:'Focus',btn:'ranchActB100',get say(){return`${pressB165('focus')} to Focus: Pip's next 3 shots home in, can't be dodged and hit 15% harder. It recharges in 4 s.`},
  done:(f,tu)=>f.a.cmdUse.focus>tu.base.focus},
 {kind:'info',title:'Don\'t Focus into a Guard',get say(){return'Hits on a guarding Pip do only a quarter of their damage, so Focus is wasted while the rival\'s shield is up. Save it for when their guard is down.'}},
 {kind:'do',title:'Ascend',btn:'ranchPipBtnB109',get say(){return`HEAT fills as Pip deals and takes damage. It's past 70% now: ${pressB165('ascend')} to Ascend. Harder, faster shots that pierce half the armour, for a few seconds.`},
  each:f=>{if(f.a.ascT<=0)f.a.heat=Math.max(f.a.heat,72)},done:(f,tu)=>f.a.cmdUse.ascend>tu.base.ascend},
 {kind:'do',title:'Guard',btn:'ranchGuardB163',get say(){return`Sprout is Ascending! Hold ${btnB165('guard')} to Guard: blocked hits do a quarter damage and give Pip HEAT.`},
  each:f=>{if(f.a.ascT<=0&&f.b.ascT<=0)f.b.heat=Math.max(f.b.heat,80)},sprout:f=>({ascend:f.a.ascT<=0&&f.b.ascT<=0&&f.b.heat>=70}),
  done:(f,tu)=>{tu.guardT=f.a.guarding&&f.b.ascT>0?tu.guardT+B163_DT:0;return tu.guardT>=.5}},
 {kind:'do',title:'Guard breaks',btn:'ranchGuardB163',get say(){return`Guard drains while held (the blue bar). Keep holding ${btnB165('guard')} until it breaks. A broken guard can't go up again for 3 s.`},
  enter:f=>{f.a.glow=Math.min(f.a.glow,.5);f.a.broken=0},done:f=>f.a.broken>0},
 {kind:'do',title:'Strike the broken guard',btn:'ranchActB100',get say(){return`Sprout is guarding. Wait for its guard to break, then ${pressB165('focus',true)} to strike.`},
  enter:f=>{f.b.glow=Math.min(f.b.glow,.5);f.b.ascT=0;f.b.heat=0;f.a.broken=0},each:f=>{if(f.b.broken>0&&!f.b.b166Opened){f.b.b166Opened=true;f.a.focusCd=0}if(f.b.broken<=0)f.b.b166Opened=false},
  sprout:f=>({guard:f.b.broken<=0}),done:(f,tu)=>f.b.broken>0&&f.a.cmdUse.focus>tu.base.focus},
 {kind:'info',title:'How a fight is won',get say(){return'A knockout ends it. If the clock runs out, the Pip with more of its HP left wins; a tie goes to whoever landed more hits.'}},
 {kind:'info',title:'Training matters',get say(){return'Stats counter each other. Star Power punches through Guardian Glow. Guardian Glow shrugs off Swift Pip\'s small hits. Swift Pip dodges Star Power\'s big ones. Heart Sense heals Pip as he lands hits. Each rival\'s stats show before the fight.'}},
 {kind:'do',title:'Finish it',btn:null,get say(){return'Now knock Sprout out. Use everything you\'ve learned.'},
  enter:f=>{f.b.hp=Math.min(f.b.hp,f.b.maxHp*.35)},noFloor:true,done:f=>f.b.hp<=0},
 {kind:'info',title:'Brackets',get say(){return`A bracket is up to three fights against rival Pips; win all three to be champion. Each fight costs fatigue. Between rounds choose a full heal or a breather. Wins pay Heart Stones. ${btnB165('pause')} pauses.`}}
];
function startTutorialB164(){
 closeSheetB100();
 const pip=pipEntrantB163(),fight=fightB163(pip,{...B164_SPROUT,seed:0},1641);
 colB163={active:true,tutorial:{step:0,t:0,guardT:0,base:{...fight.a.cmdUse},entered:-1},br:{rank:0,round:0,tutorial:true,entrants:[]},opp:B164_SPROUT,fight,phase:'intro',t:0,acc:0,seen:0,call:null};
 document.body.classList.add('colB163');ranchWorldB100.toastT=0;$('ranchToastB100')?.classList.remove('on');
 return true;
}
function lessonB164(){const tu=colB163.tutorial;return tu?B164_STEPS[tu.step]:null}
const roundNameBeforeB164=roundNameB163;
roundNameB163=function(br){return br?.tutorial?'Sparring':roundNameBeforeB164(br)};
const stepFightBeforeB164=stepFightB163;
stepFightB163=function(f,cmdA,cmdB){
 const tu=colB163.active&&colB163.fight===f?colB163.tutorial:null,l=tu&&B164_STEPS[tu.step];
 if(!tu)return stepFightBeforeB164(f,cmdA,cmdB);
 if(l&&tu.entered!==tu.step){tu.entered=tu.step;tu.base={...f.a.cmdUse};tu.guardT=0;l.enter?.(f)}
 l?.each?.(f);
 const r=stepFightBeforeB164(f,cmdA,{focus:false,guard:false,ascend:false,...(l?.sprout?.(f)||{})});
 // Pip never falls and the clock never runs out during the lesson; Sprout only falls in the last drill.
 f.a.hp=Math.max(f.a.hp,f.a.maxHp*.3);if(!l?.noFloor)f.b.hp=Math.max(f.b.hp,f.b.maxHp*.3);f.t=Math.min(f.t,30);f.done=false;f.winner=null;
 if(l?.kind==='do'&&l.done(f,tu))nextStepB164();
 return r;
};
function nextStepB164(){const tu=colB163.tutorial;tu.step++;tu.t=0;uiSoundB136?.('next');if(tu.step>=B164_STEPS.length)finishTutorialB164()}
function finishTutorialB164(){
 colSaveB163.tutorial=true;saveColB163();
 colB163={active:false};document.body.classList.remove('colB163');
 for(const id of ['ranchActB100','ranchPipBtnB109','ranchGuardB163'])$(id)?.classList.remove('on','b164Pulse','b165Ready');
 ranchWorldB100.prevAct=true;
 colosseumSheetB164();
}
const updateColBeforeB164=updateColB163;
updateColB163=function(dt){
 const c=colB163,tu=c.tutorial,l=lessonB164();
 if(tu&&c.phase==='fight'&&l?.kind==='info'){
  // The fight is frozen on an explanation card; A (or the Continue button) moves on.
  const inp=ranchInputB100();tu.t+=dt;
  for(const id of ['ranchActB100','ranchPipBtnB109','ranchGuardB163'])$(id)?.classList.toggle('on',id==='ranchActB100');
  $('ranchActB100')?.classList.add('b164Pulse');
  if(inp.actPressed&&tu.t>.35)nextStepB164();
  return;
 }
 updateColBeforeB164(dt);
 if(!tu||!colB163.active)return;
 tu.t+=dt;
 const want=c.phase==='fight'?lessonB164()?.btn:null;
 for(const id of ['ranchActB100','ranchPipBtnB109','ranchGuardB163'])$(id)?.classList.toggle('b164Pulse',id===want);
};
(function styleB164(){const s=document.createElement('style');s.textContent=`@keyframes b164Pulse{0%,100%{box-shadow:0 0 0 0 #ffd36fcc}50%{box-shadow:0 0 0 12px #ffd36f00}}
#ranchActB100.b164Pulse,#ranchPipBtnB109.b164Pulse,#ranchGuardB163.b164Pulse{animation:b164Pulse 1s infinite;border-color:#ffd36f}`;document.head.appendChild(s)})();
