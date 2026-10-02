// B125 chop drops, Scent Hunt tiers, ranch Pip stats, arena looks.
function runChecksB125(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,tol=1e-6)=>assert(Math.abs(a-b)<tol,`${m}: ${a} vs ${b}`);
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const roll=dropRollB125;
  const test=(name,fn)=>{try{fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{dropRollB125=roll;lookOverrideB125=null;closeSheetB100();ranchWorldB100.game=null}};
  const sheetLabels=()=>(ranchWorldB100.sheet?.options||[]).map(o=>o.label);

  test('B125 clearing a tree or shrub drops its snack 10% of the time; feeding it lowers fatigue only',()=>{
    const tree=B106_OBSTACLES.find(o=>o.tree),shrub=B106_OBSTACLES.find(o=>!o.tree);
    fresh({fatigue:0,tools:{axe:true,sickle:true}});dropRollB125=()=>.05;
    assert(clearObstacleB106(tree.id)&&itemCountB104('acorn')===1,'tree did not drop an acorn');
    assert(clearObstacleB106(shrub.id)&&itemCountB104('dewberry')===1,'shrub did not drop a dewberry');
    fresh({fatigue:0,tools:{axe:true,sickle:true}});dropRollB125=()=>.1;assert(clearObstacleB106(tree.id)&&!itemCountB104('acorn'),'dropped at the 10% line');
    fresh({fatigue:40,hunger:30});addItemB104('acorn',1);addItemB104('dewberry',1);
    pipSheetB104();const labels=sheetLabels();assert(labels.some(l=>/^Feed 🌰 Sunny Acorn ×1 · −10 fatigue/.test(l))&&labels.some(l=>/^Feed 🫐 Dewberry/.test(l)),'snacks missing from Pip menu: '+labels.join(' | '));
    closeSheetB100();assert(feedB104('acorn')&&ranchB99.fatigue===30&&ranchB99.hunger===30&&!itemCountB104('acorn'),'acorn feed wrong');
    assert(feedB104('dewberry')&&ranchB99.fatigue===25,'dewberry feed wrong');assert(!feedB104('dewberry'),'fed a snack you do not have');
  });

  test('B125 Scent Hunt scales with Heart Sense: sparkles, time, spread, drift, fading and decoys',()=>{
    for(const [lv,total,time,decoys] of [[0,5,12,0],[3,6,12,0],[6,7,13,0],[9,8,13,2],[12,9,14,3]]){
      fresh({fatigue:0,stones:99});ranchB99.stats.range=lv;ranchWorldB100.active=true;
      assert(startGameB100('range'),`Lv${lv} game did not start`);const g=ranchWorldB100.game;
      assert(g.total===total&&g.need===total-1&&g.time===time&&g.sparks.length===total&&(g.decoys||[]).length===decoys,`Lv${lv} tier wrong: ${g.total}/${g.need}/${g.time}/${(g.decoys||[]).length}`);
      const st=stationB100('range'),far=Math.max(...g.sparks.map(s=>hyp(s.x-st.x,s.y-st.y)));assert(far<=scentTierB125(lv).spread+1,`Lv${lv} spread too wide`);
      ranchWorldB100.game=null;
    }
    fresh({fatigue:0,stones:99});ranchB99.stats.range=6;startGameB100('range');let g=ranchWorldB100.game;const w=ranchWorldB100;
    w.px=w.py=w.pip.x=w.pip.y=-9999;const s=g.sparks[0],x0=s.x;for(let i=0;i<5*60;i++)gameInputB100(g,1/60,false,false);assert(s.x!==x0||s.age<1,'unclaimed sparkle never moved');
    fresh({fatigue:0,stones:99});ranchB99.stats.range=9;startGameB100('range');g=ranchWorldB100.game;w.pip.x=w.pip.y=-9999;
    for(const o of [...g.sparks,...g.decoys.slice(1)]){o.x=-5000;o.y=-5000;o.vx=o.vy=0}const d=g.decoys[0];w.px=d.x;w.py=d.y;const t0=g.time;gameInputB100(g,1/60,false,false);near(t0-g.time,1/60+B125_DECOY_PENALTY,'decoy penalty',1e-6);
    ranchWorldB100.active=false;
  });

  test('B125 ranch Pip: Swift sets speed, Heart Sense sets Scent reach',()=>{
    fresh({fatigue:0});ranchB99.stats.speed=0;near(pipFollowSpeedB125(),200,'Lv0 speed');ranchB99.stats.speed=10;near(pipFollowSpeedB125(),280,'Lv10 speed');ranchB99.stats.speed=50;near(pipFollowSpeedB125(),360,'speed cap');
    near(pipHuntSpeedB125(),290,'hunt speed');ranchB99.stats.range=0;near(pipReachB125(),22,'Lv0 reach');ranchB99.stats.range=20;near(pipReachB125(),50,'reach cap');
    const w=ranchWorldB100,p=w.pip;ranchB99.stats.speed=10;w.game=null;p.state='follow';p.x=0;p.y=0;w.px=2000;w.py=10;updatePipB100(1);near(p.x,280,'Pip did not move at his trained speed',1);
  });

  test('B125 arena looks follow the per-rank schedule',()=>{
    const q=(r,s)=>lookQualityB125(r,s);
    near(q('E',9),0,'E 9');near(q('E',10),1/11,'E 10');near(q('E',19),10/11,'E 19',1e-9);near(q('E',20),1,'E 20');near(q('E',39),1,'E 39');near(q('E',50),2,'E 50');near(q('E',110),5,'E 110');
    near(q('D',1),0,'D 1');near(q('D',10),1,'D 10');near(q('D',29),1,'D 29');near(q('D',40),2,'D 40');
    near(q('C',10),1,'C 10');near(q('C',20),2,'C 20');near(q('C',30),3,'C 30');near(q('C',40),4,'C 40');
    near(q('A',20),4,'A 20');near(q('A',30),5,'A 30');near(q('S',20),5,'S 20');near(q('S',99),5,'S cap');
    for(const r of Object.keys(B125_LOOK_WINDOWS)){let last=0;for(let s=1;s<=120;s++){const v=q(r,s);assert(v>=last-1e-9,`${r} went down at ${s}`);assert(v-last<=.51,`${r} jumped at ${s}: ${last}→${v}`);last=v}}
  });

  test('B125 every look and every in-between keeps gameplay colours at 3:1 or better against the backdrop',()=>{
    const sprites=[...new Set([...Object.values(BOSS_DATA).map(b=>b.color),'#c99a2e','#e7d7ff','#e8f6ff']),'#7ed8ff','#ff6e8b','#ffd36f','#b388ff','#ff7dd8','#d9c8ff','#ff9fba','#ffe58f','#9ee7ff','#fff0a8','#7be0ae'];
    for(let i=0;i<=50;i++){const q=i/10,bg=backdropPeakB125(q);for(const c of sprites){const r=contrastB125(bg,hexRgbB125(c));assert(r>=3,`q ${q} ${c} contrast ${r.toFixed(2)}`)}}
  });

  test('B125 the look draws only in the arena and never throws at any quality',()=>{
    reset();S.run=true;S.end=false;S.waveState='active';ranchWorldB100.active=false;
    for(const v of [0,.5,1,1.5,2.5,3.5,4.5,5]){lookOverrideB125=v;draw()}
    lookOverrideB125=null;
  });
  test('B125 every boss draws its own look at the top tier without errors',()=>{
    reset();S.run=true;S.end=false;S.waveState='boss';ranchWorldB100.active=false;lookOverrideB125=5;
    for(const k of Object.keys(BOSS_DATA)){enemies=[{type:'boss',bossKey:+k,x:P.x+120,y:P.y,r:30,hp:50,maxHp:50,dead:false,age:1,flash:0}];draw()}
    lookOverrideB125=null;enemies=[];
  });
  test('B125 drills show 👍 rising on success and 👎 falling on failure',()=>{
    const layer=$('drillFxB128');layer.innerHTML='';
    fresh({fatigue:0,stones:99});assert(soloDrillB100('speed',0),'solo drill refused');
    let spans=[...layer.children];assert(spans.length===B128_COUNT&&spans.every(s=>s.textContent==='👍'&&s.className==='up'),'success stream wrong');
    layer.innerHTML='';fresh({fatigue:0,stones:99});assert(soloDrillB100('speed',.9999),'solo drill refused');
    spans=[...layer.children];assert(spans.length===B128_COUNT&&spans.every(s=>s.textContent==='👎'&&s.className==='down'),'failure stream wrong');
    layer.innerHTML='';fresh({fatigue:0,stones:99});ranchWorldB100.active=true;startGameB100('range');const g=ranchWorldB100.game;g.hits=g.need;finishGameB100();
    assert([...layer.children].every(s=>s.textContent==='👍')&&layer.children.length===B128_COUNT,'together win had no 👍');
    layer.innerHTML='';finishGameB100();assert(!layer.children.length,'a finished game fired again');
    ranchWorldB100.active=false;layer.innerHTML='';
  });
  test('B125 a full-charge Nova turns every struck enemy into a star, kills included',()=>{
    reset();S.run=true;S.end=false;S.waveState='active';S.weaponPower=1;W=900;H=600;CAM.x=P.x;CAM.y=P.y;ranchWorldB100.active=false;
    enemies=[0,1,2].map(i=>({type:'chaser',x:P.x+80+i*90,y:P.y+(i%2)*60,r:12,hp:i===0?.5:999,maxHp:999,dead:false,age:1,speed:0}));
    S.b94NovaWaves=[];releaseNovaB94(1,1);for(const w of [...S.b94NovaWaves])fireNovaWaveB94(w);
    assert(enemies[0].dead||enemies[0].hp<=0,'fixture enemy did not die');
    assert(novaConstellationB120&&novaConstellationB120.nodes.length===3,'full Nova made '+(novaConstellationB120?.nodes.length||0)+' stars');
    enemies=[];novaConstellationB120=null;
  });
  return out;
}
