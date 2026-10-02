
// B125 Ranch and arena. (1) Chopping a tree or cutting a shrub has a 10% chance to drop a fatigue snack for the
// bag (Sunny Acorn −10, Dewberry −5). (2) Scent Hunt grows with Heart Sense: more sparkles, wider spread, drift,
// fading sparkles and decoys. (3) Ranch Pip shows his trained levels: Swift sets his speed, Heart Sense his
// pickup reach and antenna glow, Star Power a sparkle trail, Guardian Glow an aura. (4) The arena's look climbs
// from today's (E) through five maps by rank and stage. Every new layer draws inside the backdrop pass, under
// every sprite, and stays in a dark band so the player, Pip, enemies, shots and pickups stay readable.

// ---- 1. chop drops ----
const B125_DROP_CHANCE=.1;
B104_ITEMS.acorn={name:'Sunny Acorn',icon:'🌰',fatigue:10,snack:true,price:0,sell:0};
B104_ITEMS.dewberry={name:'Dewberry',icon:'🫐',fatigue:5,snack:true,price:0,sell:0};
let dropRollB125=()=>Math.random();
let dropToastB125=null;
const clearObstacleBeforeB125=clearObstacleB106;
clearObstacleB106=function(id){
  const o=obstacleB106(id),ok=clearObstacleBeforeB125(id);
  if(ok&&o&&dropRollB125()<B125_DROP_CHANCE){
    const k=o.tree?'acorn':'dewberry',it=B104_ITEMS[k];addItemB104(k,1);saveRanchB99();
    dropToastB125={t:1.4,text:`Found a ${it.name}! ${it.icon} (−${it.fatigue} fatigue, in the bag)`};
  }
  return ok;
};
// Snacks have no food value; feeding one only lowers fatigue (and still plays Pip's eating moment).
const feedBeforeB125=feedB104;
feedB104=function(id){
  const it=itemInfoB104(id);if(!it?.snack)return feedBeforeB125(id);
  if(itemCountB104(id)<1)return null;
  addItemB104(id,-1);ranchB99.fatigue=Math.max(0,ranchB99.fatigue-it.fatigue);saveRanchB99();
  careDoneB116e={kind:'feed',icon:it.icon};return it;
};
// Pip's care menu lists the snacks with the other food ("Feed …" so the eating moment wraps them too).
const pipSheetBeforeB125=pipSheetB104;
pipSheetB104=function(...a){
  const open=openSheetB100;
  openSheetB100=function(title,text,options){
    if(title==='Pip'){
      const add=[];for(const id of ['acorn','dewberry'])if(itemCountB104(id)){const it=B104_ITEMS[id];
        add.push({label:`Feed ${it.icon} ${it.name} ×${itemCountB104(id)} · −${it.fatigue} fatigue`,run:()=>{feedB104(id);ranchWorldB100.pip.happy=2;burstHeartsB100(ranchWorldB100.pip.x,ranchWorldB100.pip.y,3);renderRanchHudB100();ranchToastB100(`Pip munches the ${it.name}. Fatigue −${it.fatigue}.`)}})}
      const i=options.findIndex(o=>o.label==='Close');options.splice(i<0?options.length:i,0,...add);
    }
    return open(title,text,options);
  };
  try{return pipSheetBeforeB125(...a)}finally{openSheetB100=open}
};

// ---- 2. Scent Hunt by Heart Sense level ----
const B125_SCENT_TIERS=[
  {min:0,total:5,time:12,spread:230,drift:0,fade:0,decoys:0},
  {min:3,total:6,time:12,spread:280,drift:18,fade:0,decoys:0},
  {min:6,total:7,time:13,spread:330,drift:18,fade:4,decoys:0},
  {min:9,total:8,time:13,spread:380,drift:18,fade:4,decoys:2},
  {min:12,total:9,time:14,spread:430,drift:34,fade:4,decoys:3}
];
const B125_DECOY_PENALTY=1.5;
function scentTierB125(lv=ranchB99.stats.range){let t=B125_SCENT_TIERS[0];for(const x of B125_SCENT_TIERS)if((lv||0)>=x.min)t=x;return t}
function scentSpotB125(st,spread){const a=Math.random()*Math.PI*2,d=110+Math.random()*(spread-110);return{x:clamp(st.x+Math.cos(a)*d,60,B100_WORLD.w-60),y:clamp(st.y+Math.sin(a)*d,60,B100_WORLD.h-60)}}
function scentHowB125(t){return`Walk over the scent sparkles with Pip. Get ${t.total-1} of ${t.total} in ${t.time}s.${t.drift?' They drift.':''}${t.fade?` Unclaimed ones move after ${t.fade}s.`:''}${t.decoys?` Grey ✿ are decoys: −${B125_DECOY_PENALTY}s.`:''}`}
const startGameBeforeB125=startGameB100;
startGameB100=function(kind,...a){
  if(kind!=='range')return startGameBeforeB125(kind,...a);
  const t=scentTierB125(),how=B100_GAMES.range.how;B100_GAMES.range.how=scentHowB125(t);
  let ok;try{ok=startGameBeforeB125(kind,...a)}finally{B100_GAMES.range.how=how}
  const g=ranchWorldB100.game;if(!ok||!g||g.type!=='collect')return ok;
  const st=stationB100('range');g.b125=t;g.total=t.total;g.need=t.total-1;g.time=t.time;
  const mk=decoy=>{const p=scentSpotB125(st,t.spread),a=Math.random()*Math.PI*2;return{...p,got:false,decoy,age:0,vx:Math.cos(a)*t.drift,vy:Math.sin(a)*t.drift}};
  g.sparks=[];for(let i=0;i<t.total;i++)g.sparks.push(mk(false));
  g.decoys=[];for(let i=0;i<t.decoys;i++)g.decoys.push(mk(true));
  return ok;
};
function pipReachB125(){return Math.min(50,22+2*(ranchB99.stats.range||0))}
const gameInputBeforeB125=gameInputB100;
gameInputB100=function(g,dt,actPressed,actHeld){
  if(g?.type!=='collect'||!g.b125)return gameInputBeforeB125(g,dt,actPressed,actHeld);
  g.t+=dt;g.cool=Math.max(0,g.cool-dt);g.flash=Math.max(0,g.flash-dt);g.time-=dt;
  const w=ranchWorldB100,t=g.b125,st=stationB100('range'),reach=pipReachB125();
  const move=s=>{s.age+=dt;if(!t.drift)return;s.x+=s.vx*dt;s.y+=s.vy*dt;
    if(s.x<60||s.x>B100_WORLD.w-60)s.vx*=-1;if(s.y<60||s.y>B100_WORLD.h-60)s.vy*=-1;
    if(hyp(s.x-st.x,s.y-st.y)>t.spread){const a=Math.atan2(st.y-s.y,st.x-s.x);s.vx=Math.cos(a)*t.drift;s.vy=Math.sin(a)*t.drift}};
  for(const s of g.sparks){if(s.got)continue;move(s);
    if(t.fade&&s.age>=t.fade){Object.assign(s,scentSpotB125(st,t.spread));s.age=0;continue}
    if(hyp(s.x-w.px,s.y-w.py)<30||hyp(s.x-w.pip.x,s.y-w.pip.y)<reach){s.got=true;g.hits++;burstHeartsB100(s.x,s.y,2)}}
  for(const d of g.decoys||[]){move(d);
    if(hyp(d.x-w.px,d.y-w.py)<30){g.time-=B125_DECOY_PENALTY;g.flash=.45;g.flashOk=false;Object.assign(d,scentSpotB125(st,t.spread));d.age=0;ranchToastB100(`Decoy! −${B125_DECOY_PENALTY}s`,1.2)}}
  g.attempts=g.hits;
  if(g.hits>=g.total||g.time<=0)finishGameB100();
};

// ---- 3. ranch Pip reflects his trained levels ----
function pipFollowSpeedB125(){return Math.min(360,200+8*(ranchB99.stats.speed||0))}
function pipHuntSpeedB125(){return 90+4*(ranchB99.stats.speed||0)}
updatePipB100=function(dt){
  const w=ranchWorldB100,p=w.pip;p.happy=Math.max(0,p.happy-dt);
  const tired=ranchB99.fatigue>=B99_TIRED,slow=tired?.6:1;
  let tx=w.px-46*(p.face||1),ty=w.py-10,speed=pipFollowSpeedB125()*slow;
  if(p.state==='drill'||p.state==='sleep'){p.t-=dt;tx=p.tx;ty=p.ty;speed=240;if(p.t<=0)p.state='follow'}
  if(w.game&&w.game.type==='collect'){const s=w.game.sparks.find(q=>!q.got);if(s){tx=s.x;ty=s.y;speed=pipHuntSpeedB125()*slow}}
  const dx=tx-p.x,dy=ty-p.y,d=hyp(dx,dy);
  if(d>4){const m=Math.min(d,speed*dt);p.x+=dx/d*m;p.y+=dy/d*m;if(Math.abs(dx)>2)p.face=dx>0?1:-1}
  const tr=p.b125Trail||(p.b125Trail=[]);tr.push({x:p.x,y:p.y});if(tr.length>14)tr.shift();
};
const drawPipBeforeB125=drawPipB100;
drawPipB100=function(t){
  const w=ranchWorldB100,p=w.pip,s=ranchB99.stats,x=p.x,y=p.y;
  const guard=Math.min(1,(s.guard||0)/12),power=Math.min(1,(s.power||0)/12),sense=Math.min(1,(s.range||0)/12);
  if(power>0)for(const [i,q] of (p.b125Trail||[]).entries()){if(i%2)continue;X.globalAlpha=.12+.4*power*(i/14);X.fillStyle='#ffd36f';X.beginPath();X.arc(q.x+Math.sin(t*6+i)*4,q.y+4,1.2+2.2*power,0,Math.PI*2);X.fill()}
  X.globalAlpha=1;
  if(guard>0){const r=26+10*guard,g=X.createRadialGradient(x,y,6,x,y,r);g.addColorStop(0,'#9ee7ff00');g.addColorStop(.7,`rgba(158,231,255,${(.12+.28*guard).toFixed(2)})`);g.addColorStop(1,'#9ee7ff00');X.fillStyle=g;X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.fill()}
  const out=drawPipBeforeB125(t);
  if(sense>0){X.save();X.globalAlpha=.25+.6*sense;X.fillStyle='#ffc4dd';X.shadowColor='#ffc4dd';X.shadowBlur=4+12*sense;X.beginPath();X.arc(x+2,y-25,3+1.5*sense,0,Math.PI*2);X.fill();X.restore()}
  return out;
};

const updateRanchBeforeB125=updateRanchB100;
updateRanchB100=function(dt){
  const out=updateRanchBeforeB125(dt);
  if(dropToastB125&&(dropToastB125.t-=Math.max(0,Number(dt)||0))<=0){ranchToastB100(dropToastB125.text,3);renderRanchHudB100();dropToastB125=null}
  return out;
};
const drawRanchBeforeB125=drawRanchB100;
drawRanchB100=function(...a){
  const out=drawRanchBeforeB125(...a),w=ranchWorldB100,g=w.game,t=performance.now()/1000;
  if(g?.type==='collect'&&g.decoys?.length){X.save();X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));
    for(const d of g.decoys){const b=Math.sin(t*5+d.x)*3;X.fillStyle='#b9bccf';X.beginPath();X.arc(d.x,d.y+b,11,0,Math.PI*2);X.fill();X.fillStyle='#6f7390';X.font='bold 14px system-ui';X.textAlign='center';X.fillText('✿',d.x,d.y+b+5)}
    X.restore()}
  return out;
};

// ---- 4. arena looks: E (today) → D Dusk Hills → C Crystal Shore → B Night Garden → A Aurora Fields → S Starforge ----
// Windows per rank: [first stage, last stage, look reached the stage after]. Each stage in a window is one equal step.
const B125_LOOK_WINDOWS={
  E:[[10,19,1],[40,49,2],[60,69,3],[80,89,4],[100,109,5]], // E's first window starts at 10 for testing (target 20–29)
  D:[[2,9,1],[30,39,2]],
  C:[[2,9,1],[11,19,2],[21,29,3],[31,39,4]],
  B:[[2,9,1],[11,14,2],[16,19,3],[21,29,4]],
  A:[[2,4,1],[6,9,2],[11,14,3],[16,19,4],[21,29,5]],
  S:[[2,4,2],[6,9,3],[11,14,4],[16,19,5]]
};
const B125_LOOKS=[
  null,
  {name:'Dusk Hills',top:[26,15,36],bot:[52,26,44],accent:[255,154,92],feature:'hills'},
  {name:'Crystal Shore',top:[7,26,36],bot:[12,44,56],accent:[127,227,255],feature:'crystals'},
  {name:'Night Garden',top:[7,11,31],bot:[16,24,58],accent:[197,140,255],feature:'garden'},
  {name:'Aurora Fields',top:[5,15,26],bot:[10,32,48],accent:[94,255,200],feature:'aurora'},
  {name:'Starforge',top:[13,7,18],bot:[36,18,12],accent:[255,207,106],feature:'forge'}
];
const B125_FEATURE_ALPHA=.25; // cap for every backdrop feature: keeps the backdrop in its dark band
let lookOverrideB125=null;
function lookQualityB125(rank=runRankB108()?.id||'E',stage=S?.stage||1){
  if(lookOverrideB125!=null)return lookOverrideB125;
  let q=0;
  for(const [a,b,to] of B125_LOOK_WINDOWS[rank]||B125_LOOK_WINDOWS.E){
    if(stage>b){q=to;continue}
    if(stage>=a)q+=(stage-a+1)/(b-a+2)*(to-q);
    break;
  }
  return clamp(q,0,5);
}
const mixB125=(a,b,f)=>a.map((v,i)=>v+(b[i]-v)*f);
const rgbB125=(c,a=1)=>`rgba(${c.map(v=>Math.round(v)).join(',')},${a})`;
function lookPaletteB125(q){
  const base={top:[5,7,11],bot:[5,7,11],accent:[24,48,82]};let p={...base};
  for(let k=1;k<=5;k++){const f=clamp(q-(k-1),0,1);if(f<=0)break;const L=B125_LOOKS[k];p={top:mixB125(p.top,L.top,f),bot:mixB125(p.bot,L.bot,f),accent:mixB125(p.accent,L.accent,f)}}
  return p;
}
function seededB125(i){const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)}
function drawFeatureB125(kind,alpha,accent,t){
  if(alpha<=0)return;const px=-CAM.x*.18,py=-CAM.y*.18;X.save();X.globalAlpha=alpha;
  if(kind==='hills'){X.fillStyle=rgbB125(accent.map(v=>v*.32));for(let layer=0;layer<2;layer++){X.beginPath();X.moveTo(0,H);for(let x=0;x<=W+40;x+=40){const u=(x-px*(1+layer))/180;X.lineTo(x,H*(.72+layer*.1)-Math.sin(u)*30-Math.sin(u*.37+layer)*24)}X.lineTo(W,H);X.closePath();X.fill()}}
  else if(kind==='crystals'){X.fillStyle=rgbB125(accent.map(v=>v*.5));for(let i=0;i<22;i++){const x=((seededB125(i)*W*1.6+px)%(W*1.6)+W*1.6)%(W*1.6)-W*.3,y=((seededB125(i+50)*H*1.6+py)%(H*1.6)+H*1.6)%(H*1.6)-H*.3,s=8+seededB125(i+9)*14;X.beginPath();X.moveTo(x,y-s*1.6);X.lineTo(x+s*.5,y);X.lineTo(x,y+s*.4);X.lineTo(x-s*.5,y);X.closePath();X.fill()}}
  else if(kind==='garden'){for(let i=0;i<26;i++){const x=((seededB125(i)*W*1.5+px)%(W*1.5)+W*1.5)%(W*1.5)-W*.25,y=((seededB125(i+70)*H*1.5+py)%(H*1.5)+H*1.5)%(H*1.5)-H*.25,f=.5+.5*Math.sin(t*2+i);X.fillStyle=rgbB125(accent,.35+.4*f);X.beginPath();X.arc(x,y,2+f*1.5,0,Math.PI*2);X.fill()}}
  else if(kind==='aurora'){for(let b=0;b<3;b++){const g=X.createLinearGradient(0,0,0,H*.6);g.addColorStop(0,rgbB125(accent,0));g.addColorStop(.5,rgbB125(accent,.5));g.addColorStop(1,rgbB125(accent,0));X.fillStyle=g;X.beginPath();X.moveTo(0,H*.1);for(let x=0;x<=W+30;x+=30)X.lineTo(x,H*(.18+b*.09)+Math.sin(x/140+t*.5+b)*22);X.lineTo(W,H*(.34+b*.09));for(let x=W;x>=0;x-=30)X.lineTo(x,H*(.3+b*.09)+Math.sin(x/160+t*.4+b)*18);X.closePath();X.fill()}}
  else if(kind==='forge'){X.strokeStyle=rgbB125(accent,.6);X.lineWidth=1;X.beginPath();for(let i=0;i<9;i++){const a=t*.05+i*.7,x=W*.5+Math.cos(a)*W*.35*seededB125(i),y=H*.4+Math.sin(a)*H*.3*seededB125(i+3);if(i)X.lineTo(x,y);else X.moveTo(x,y)}X.stroke();
    for(let i=0;i<30;i++){const x=(seededB125(i)*W+t*12*(1+seededB125(i+4)))%W,y=H-((seededB125(i+8)*H+t*20*(.5+seededB125(i+2)))%H);X.fillStyle=rgbB125(accent,.7);X.fillRect(x,y,1.6,1.6)}}
  X.restore();
}
function drawLookB125(q,t){
  if(q<=0)return;const p=lookPaletteB125(q),a=clamp(q,0,1);
  const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,rgbB125(p.top,.9*a));g.addColorStop(1,rgbB125(p.bot,.9*a));X.fillStyle=g;X.fillRect(-30,-30,W+60,H+60);
  const k=Math.floor(q),f=q-k;
  if(k>=1)drawFeatureB125(B125_LOOKS[Math.min(5,k)].feature,B125_FEATURE_ALPHA*(k>=5?1:1-f),p.accent,t);
  if(k<5&&f>0)drawFeatureB125(B125_LOOKS[k+1].feature,B125_FEATURE_ALPHA*f,p.accent,t);
  // stars: density grows with q, slow parallax
  const stars=Math.round(20+16*Math.min(q,5));X.save();X.fillStyle=rgbB125([220,230,255],.25+.05*Math.min(q,5));
  for(let i=0;i<stars;i++){const x=((seededB125(i+200)*W*2-CAM.x*.06)%W+W)%W,y=((seededB125(i+400)*H*2-CAM.y*.06)%H+H)%H;X.fillRect(x,y,1.2,1.2)}X.restore();
  // soft glow under player shots, from q 1.5 (beneath the sprites, never over them)
  const glow=clamp((q-1.5)/1.5,0,1);if(glow>0){X.save();X.globalAlpha=.22*glow;X.fillStyle=rgbB125(p.accent);for(const s of shots){const sx=worldToScreenX(s.x),sy=worldToScreenY(s.y);if(sx<-20||sy<-20||sx>W+20||sy>H+20)continue;X.beginPath();X.arc(sx,sy,s.r+6,0,Math.PI*2);X.fill()}X.restore()}
}
const drawGridBeforeB125=drawGrid;
drawGrid=function(t){
  if(!ranchWorldB100?.active&&S)drawLookB125(lookQualityB125(),t);
  return drawGridBeforeB125(t);
};
// Hit sparks grow a little with the look (up to +40% at S).
const particleBeforeB125=particle;
particle=function(x,y,c,n=8,pow=120){
  if(!S?.run||ranchWorldB100?.active)return particleBeforeB125(x,y,c,n,pow);
  const q=lookQualityB125();return particleBeforeB125(x,y,c,Math.round(n*(1+.08*q)),pow*(1+.04*q));
};
// Readability: WCAG contrast of the brightest backdrop pixel any look can produce against a sprite colour.
function lumB125(c){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])}
function hexRgbB125(h){h=h.replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
function backdropPeakB125(q){const p=lookPaletteB125(q),a=clamp(q,0,1),base=[5,7,11];
  const sky=[p.top,p.bot].map(c=>mixB125(base,c,.9*a)).sort((x,y)=>lumB125(y)-lumB125(x))[0];
  return mixB125(sky,p.accent,B125_FEATURE_ALPHA*.8)}
function contrastB125(a,b){const x=lumB125(a),y=lumB125(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
