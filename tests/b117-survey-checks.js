// B117 Playtest survey: an in-game survey at the ranch that fills most answers from tracked play stats.
function runSurveyChecksB117(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const nav=navigator,had={clipboard:Object.getOwnPropertyDescriptor(nav,'clipboard'),share:Object.getOwnPropertyDescriptor(nav,'share')};
  const stub=(k,v)=>Object.defineProperty(nav,k,{value:v,configurable:true,writable:true});
  const unstub=()=>{for(const k of ['clipboard','share']){if(had[k])Object.defineProperty(nav,k,had[k]);else delete nav[k]}};
  const test=(name,fn)=>{try{keys.clear();closeSurveyB117();fresh();reset();resetStatsB117();clearDraftB117();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear();closeSurveyB117();unstub()}};
  const w=()=>ranchWorldB100,m=()=>$('ranchSurveyB117'),shown=()=>!m().classList.contains('hidden');
  const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
  const runFor=sec=>{for(let i=0;i<Math.ceil(sec/.05);i++)updateRanchB100(.05)};
  const arena=()=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.heat=0;S.overType='beam';S.overLevels={beam:1};
    enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=s=>{for(let t=0;t<s-1e-8;t+=1/60)update(Math.min(1/60,s-t))};
  const foe=(x=160,y=0)=>{const e={type:'chaser',x,y,r:12,hp:1,maxHp:1,dead:false,age:0,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const toGate=stage=>{S.run=true;S.stage=stage;S.b115Stage=stage;S.runHearts=10;S.heartCurrency=10;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
  const reload=()=>{statsB117=loadStatsB117();return statsB117};
  const openFromBag=()=>{openRanchB99();bagSheetB104();const i=w().sheet.options.findIndex(o=>o.label==='📝 Playtest survey');assert(i>=0,'survey missing from the bag');focusSheetB100(i);press();};
  const pick=(k,v)=>{const r=[...m().querySelectorAll(`[name="b117-${k}"]`)].find(x=>x.value===v);r.click();return r};
  const checked=k=>m().querySelector(`[name="b117-${k}"]:checked`)?.value;
  const type=(k,v)=>{const el=m().querySelector('#b117-'+k);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};
  fresh();reset();

  test('B117 play stats accumulate from real game calls and survive a reload',()=>{
    fresh({fatigue:0,hunger:100,hygiene:100});startBattleTestB99();assert(S.run&&statsB117.runs===1&&statsB117.stage>=1,'battle test not counted');
    arena();S.overUnlocked.add('storm');S.overLevels.storm=1;
    S.heat=30;foe();assert(triggerOverdrive()&&S.over>0,'Beam did not fire');triggerOverdrive();step(1);
    assert(statsB117.skills.beam.n===1&&statsB117.skills.beam.sec>.5,'beam use/seconds: '+JSON.stringify(statsB117.skills.beam));
    const arenaSec=statsB117.arena;assert(arenaSec>=.99&&statsB117.play>=arenaSec,'arena time '+arenaSec);
    S.b39Paused=true;S.run=false;step(1);assert(statsB117.arena===arenaSec,'pause counted as arena time');
    arena();for(let i=0;i<12;i++)hitEnemy(foe(),99,'player');assert(statsB117.chain===12&&statsB117.tier===2,'chain '+statsB117.chain+'/'+statsB117.tier);
    arena();S.stage=6;step(.1);assert(statsB117.stage===6,'stage not tracked');
    ranchB99.fatigue=99;toGate(6);assert(statsB117.blocks===1,'gate block not counted');openRanchGateB99();assert(statsB117.blocks===1,'one block counted twice');
    arena();S.heartCurrency=4;finish(true);finish(true);assert(statsB117.deaths===1,'deaths '+statsB117.deaths);
    fresh({hearts:500,stones:500,starStones:99,fatigue:0});addItemB104('pellets',1);addItemB104('soap',1);
    assert(feedB104('pellets')&&washB104(),'care failed');assert(payDrillB100('speed'),'drill failed');ranchB99.drillCounts.speed=10;assert(upgradeStationB102('speed'),'upgrade failed');
    assert(statsB117.feeds===1&&statsB117.washes===1&&statsB117.drills===1&&statsB117.upgrades===1,'ranch counts '+JSON.stringify(statsB117));
    openRanchB99();runFor(2);assert(statsB117.ranch>=1.99,'ranch time '+statsB117.ranch);
    saveStatsB117();const before=JSON.stringify(statsB117);statsB117=null;const s=reload();
    assert(JSON.stringify(s)===before,'reload lost stats');assert(JSON.parse(localStorage.getItem('od76-playtest-b117')).v===1,'save not versioned');
    localStorage.setItem('od76-playtest-b117','{bad json');assert(reload().runs===0,'corrupt save not reset');
    localStorage.setItem('od76-playtest-b117',JSON.stringify({v:99,runs:5}));assert(reload().runs===0,'wrong version read');
  });
  test('B117 time saves on its own every few seconds and stops while the page is hidden',()=>{
    openRanchB99();runFor(6);assert(JSON.parse(localStorage.getItem('od76-playtest-b117')).ranch>=5,'ranch time never saved');
    const d=Object.getOwnPropertyDescriptor(Document.prototype,'hidden');Object.defineProperty(document,'hidden',{value:true,configurable:true});
    try{const t=statsB117.play;runFor(1);assert(statsB117.play===t,'hidden page counted')}finally{delete document.hidden;if(d)assert(document.hidden===false,'hidden stub stuck')}
  });
  test('B117 the most-used skill is the one activated most',()=>{
    assert(topSkillB117()===null,'skill before any use');
    statsB117.skills={beam:{n:4,sec:30},storm:{n:9,sec:5},nova:{n:9,sec:2}};
    assert(topSkillB117().id==='storm'&&topSkillB117().name==='Thunderstorm'&&topSkillB117().n===9,'wrong top skill');
    statsB117.skills.beam.n=10;assert(topSkillB117().id==='beam','max not picked');
  });
  test('B117 the bag opens the survey, which blocks the ranch until Escape closes it',()=>{
    openFromBag();assert(surveyOpenB117()&&shown()&&!w().sheet,'survey not open');
    const px=w().px,py=w().py;keys.add('d');keys.add('s');runFor(.3);keys.delete('d');keys.delete('s');assert(w().px===px&&w().py===py,'player moved');
    press();bagSheetB104();toggleBagB110();assert(!w().sheet&&!nearestInteractB100(),'a menu opened under the survey');
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true}));assert(!keys.has('w'),'typing reached the game');
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(!surveyOpenB117()&&!shown(),'Escape did not close');
    keys.add('d');runFor(.2);keys.delete('d');assert(w().px>px,'ranch still locked');
    openSurveyB117();m().querySelector('[data-b117="close"]').click();assert(!surveyOpenB117(),'close button failed');
    openSurveyB117();leaveRanchB100();assert(!surveyOpenB117(),'survey stayed open after leaving the ranch');
  });
  test('B117 the auto-filled summary states the tracked numbers in words',()=>{
    fresh({rankUnlocked:2});Object.assign(statsB117,{play:47*60,arena:30*60,runs:9,stage:8,chain:17,tier:2,deaths:3,skills:{storm:{n:31,sec:90},beam:{n:2,sec:8}}});
    openRanchB99();openSurveyB117();const sum=$('b117Summary').textContent;
    for(const bit of ['Played 47 min','9 battle tests','reached stage 8','rank C unlocked','most-used skill Thunderstorm (31 uses)','best chain 2x 17'])assert(sum.includes(bit),`summary missing "${bit}": ${sum}`);
    assert($('b117Detail').textContent.includes('1.1 skill uses per arena minute')&&$('b117Detail').textContent.includes('3 falls'),'detail: '+$('b117Detail').textContent);
    assert(m().querySelector('#b117-skillWhy').value.startsWith('Thunderstorm'),'skill prompt missing');
  });
  test('B117 unreached stage brackets and a short chain are pre-selected',()=>{
    statsB117.stage=5;statsB117.chain=2;openRanchB99();openSurveyB117();
    assert(checked('diff13')===undefined&&checked('diff46')===undefined&&checked('diff7')==="Didn't reach",'brackets: '+[checked('diff13'),checked('diff46'),checked('diff7')]);
    assert(checked('chain')==="Didn't notice",'short chain not pre-selected');closeSurveyB117();
    statsB117.stage=2;statsB117.chain=3;openSurveyB117();
    assert(checked('diff46')==="Didn't reach"&&checked('diff7')==="Didn't reach"&&checked('chain')===undefined,'pre-selections wrong for stage 2 / chain 3');
  });
  test('B117 the report carries the build stamp, stats and answers',()=>{
    Object.assign(statsB117,{runs:4,stage:6,chain:12,tier:2,skills:{nova:{n:7,sec:20}}});openRanchB99();openSurveyB117();
    type('name','Sam');pick('fun','4');pick('again','Yes');type('best','Ricochet storm on stage 5');
    const r=reportB117();
    for(const bit of [$('od76BuildStamp').textContent.trim(),'Battle tests: 4','Highest stage: 6','Most-used skill: Nova (7 uses)','Best chain: 2x 12','Name: Sam','Fun (1-5): 4','Play next build: Yes','Best moment: Ricochet storm on stage 5','Stage 7+: Didn\'t reach'])assert(r.includes(bit),`report missing "${bit}"`);
  });
  test('B117 Copy answers uses the clipboard, and falls back to selected text without it',()=>{
    openRanchB99();openSurveyB117();type('name','Kit');const box=$('b117CopyBox');
    let got=null;stub('clipboard',{writeText:t=>{got=t;return Promise.resolve()}});
    m().querySelector('[data-b117="copy"]').click();assert(got&&got.includes('Name: Kit')&&got.includes('-- From play --'),'clipboard not written');assert(box.hidden,'fallback shown on success');
    stub('clipboard',undefined);m().querySelector('[data-b117="copy"]').click();
    assert(!box.hidden&&box.value.includes('Name: Kit')&&$('b117Status').textContent.includes('selected'),'no manual-copy fallback');
    stub('clipboard',{writeText:()=>{throw Error('denied')}});box.hidden=true;m().querySelector('[data-b117="copy"]').click();assert(!box.hidden,'throwing clipboard not handled');
  });
  test('B117 Share shows only when the browser can share',()=>{
    openRanchB99();delete nav.share;openSurveyB117();assert(!m().querySelector('[data-b117="share"]'),'share shown without navigator.share');closeSurveyB117();
    let got=null;stub('share',d=>{got=d;return Promise.resolve()});openSurveyB117();m().querySelector('[data-b117="share"]').click();
    assert(got&&got.title&&got.text.includes('-- Answers --'),'share not called with the report');
  });
  test('B117 an unsent draft restores on reopen, and Clear draft empties it',()=>{
    statsB117.stage=2;openRanchB99();openSurveyB117();type('bugs','Bag overlaps HUD');pick('diff46','Too hard');pick('needs','Annoying');closeSurveyB117();
    openSurveyB117();assert(m().querySelector('#b117-bugs').value==='Bag overlaps HUD'&&checked('diff46')==='Too hard'&&checked('needs')==='Annoying','draft lost');
    m().querySelector('[data-b117="clear"]').click();assert(surveyOpenB117()&&m().querySelector('#b117-bugs').value===''&&checked('diff46')==="Didn't reach"&&!checked('needs'),'clear draft failed');
    closeSurveyB117();openSurveyB117();assert(m().querySelector('#b117-bugs').value==='','cleared draft came back');
  });
  resetStatsB117();clearDraftB117();fresh();reset();
  return out;
}
