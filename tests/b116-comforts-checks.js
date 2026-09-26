function runComfortsChecksB116(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
  const runFor=sec=>{for(let i=0;i<Math.ceil(sec/.05);i++)updateRanchB100(.05)};
  const w=()=>ranchWorldB100,opt=p=>w().sheet.options.findIndex(o=>o.label.startsWith(p)),focused=()=>w().sheet.options[w().sheet.focus].label;
  const buy=p=>{const i=opt(p);assert(i>=0,`${p} not on sale`);focusSheetB100(i);press();return i};
  const at=id=>{const st=stationB100(id);w().px=st.x;w().py=st.y+20;w().pip.x=st.x+30;w().pip.y=st.y};
  const nearPip=()=>{w().pip.x=w().px+10;w().pip.y=w().py;w().idle=1};
  const standBy=o=>{const c=stationB100(o.site),d=hyp(o.x-c.x,o.y-c.y);w().px=o.x+(o.x-c.x)/d*(o.r+18);w().py=o.y+(o.y-c.y)/d*(o.r+18)};
  const pressX=()=>{updateRanchB100(.016);w().b109XTap=true;updateRanchB100(.016)};
  // Locked: keys move nothing, A/Select/X/bag open nothing, and no sheet can open.
  const assertLocked=why=>{
    const px=w().px,py=w().py;keys.add('d');keys.add('s');runFor(.3);keys.delete('d');keys.delete('s');assert(w().px===px&&w().py===py,`${why}: player moved`);
    press();bagSheetB104();toggleBagB110();openSheetB100('Test','x',[{label:'OK'}]);pressX();
    assert(!w().sheet&&!w().b109Action&&!nearestInteractB100()&&!$('ranchActB100').classList.contains('on'),`${why}: a menu or action opened`);
  };
  const assertFree=why=>{const px=w().px;keys.add('d');runFor(.2);keys.delete('d');assert(w().px>px,`${why}: still locked`)};
  fresh();reset();
  test('B116 the shop cursor stays on a consumable after buying it',()=>{
    fresh({hearts:200});openRanchB99();stallSheetB104();const i=buy('🥯 Berry Bun');
    assert(itemCountB104('bun')===1&&w().sheet&&w().sheet.focus===i&&focused().startsWith('🥯 Berry Bun'),'cursor jumped after a buy');
    press();assert(itemCountB104('bun')===2&&w().sheet.focus===i,'second buy moved the cursor');
    assert($('ranchSheetB100').querySelectorAll('button')[i].classList.contains('focus'),'focus not drawn');
    ranchB99.hearts=0;press();assert(itemCountB104('bun')===2&&w().sheet.focus===i,'failed buy moved the cursor');closeSheetB100();
  });
  test('B116 buying a one-time tool selects the next item, and the last one selects the previous',()=>{
    fresh({hearts:500});openRanchB99();stallSheetB104();const i=buy('🪓 Axe');
    assert(ranchB99.tools.axe&&opt('🪓 Axe')<0&&w().sheet.focus===i&&focused().startsWith('🌾 Sickle'),'axe did not move to the next item');
    press();assert(ranchB99.tools.sickle&&opt('🌾 Sickle')<0&&focused().startsWith('🫧 Bubble Soap'),'last tool did not move to the previous item');closeSheetB100();
  });
  test('B116 the stall shows owned counts for consumables and nothing at zero',()=>{
    fresh({hearts:100});addItemB104('bun',3);openRanchB99();stallSheetB104();
    const bun=w().sheet.options[opt('🥯 Berry Bun')].label,btn=$('ranchSheetB100').querySelectorAll('button')[opt('🥯 Berry Bun')];
    assert(bun.startsWith('🥯 Berry Bun · ♥ 30 · ×3')&&btn.textContent===bun,`owned count missing: ${bun}`);
    assert(!w().sheet.options.some(o=>/^(🥣|🫧|🪓|🌾)/.test(o.label)&&o.label.includes('×')),'zero or tool count shown');
    buy('🥣 Pip Pellets');assert(focused().startsWith('🥣 Pip Pellets · ♥ 15 · ×1'),'count did not appear after buying');closeSheetB100();
  });
  test('B116 feeding takes 3 seconds, locks movement and actions, then releases with the meter filled',()=>{
    fresh({hunger:20,hearts:100,tools:{axe:true,sickle:true,hoe:false,can:false}});addItemB104('pellets',2);openRanchB99();nearPip();press();
    focusSheetB100(opt('Feed'));press();const c=w().b116eCare;
    assert(c&&c.kind==='feed'&&ranchB99.hunger===45&&itemCountB104('pellets')===1&&!w().sheet,'feeding did not start timed');
    draw();assertLocked('feeding');assert(w().b116eCare===c&&ranchB99.hunger===45&&itemCountB104('pellets')===1,'lock re-fed or ended early');
    runFor(3-c.t-.1);assert(w().b116eCare,'feeding ended before 3s');runFor(.2);
    assert(!w().b116eCare&&w().pip.state==='follow'&&ranchB99.hunger===45,'feeding never released');assertFree('after feeding');draw();
  });
  test('B116 washing takes 3 seconds with bubbles, locks everything, then releases squeaky clean',()=>{
    fresh({hygiene:10});addItemB104('soap',1);openRanchB99();at('tub');press();
    assert(w().sheet&&opt('Wash Pip')>=0,'wash menu missing');focusSheetB100(opt('Wash Pip'));press();
    assert(w().b116eCare?.kind==='wash'&&ranchB99.hygiene===60&&!itemCountB104('soap'),'wash did not start timed');
    runFor(.5);draw();assertLocked('washing');runFor(2.3);assert(!w().b116eCare&&ranchB99.hygiene===60,'wash did not release at 3s');assertFree('after washing');
  });
  test('B116 leaving the ranch mid-care clears the lock and nothing is lost or repeated',()=>{
    fresh({hunger:20});addItemB104('pellets',1);openRanchB99();nearPip();press();focusSheetB100(opt('Feed'));press();
    assert(w().b116eCare,'care not started');runFor(1);leaveRanchB100();assert(!w().b116eCare&&!w().active,'leaving kept the lock');
    openRanchB99();assert(!w().b116eCare,'lock came back');assertFree('after returning');assert(ranchB99.hunger===45&&!itemCountB104('pellets'),'leaving changed the meal');
    fresh({hunger:20});addItemB104('pellets',1);openRanchB99();nearPip();press();focusSheetB100(opt('Feed'));press();reset();assert(!w().b116eCare,'reset kept the lock');
  });
  test('B116 a failed feed or wash never locks',()=>{
    fresh({hygiene:10});addItemB104('soap',1);openRanchB99();at('tub');press();ranchB99.items={};focusSheetB100(opt('Wash Pip'));press();
    assert(!w().b116eCare&&ranchB99.hygiene===10,'empty wash locked');
  });
  test('B116 chop, cut, eating and washing call their sounds and stay silent with audio off',()=>{
    const saved={chop:sfxChopB116e,cut:sfxCutB116e,eat:sfxEatB116e,wash:sfxWashB116e},n={chop:0,fell:0,cut:0,cleared:0,eat:0,wash:0},audio=S.audioEnabled;
    try{
      S.audioEnabled=false;
      sfxChopB116e=f=>{n[f?'fell':'chop']++;return saved.chop(f)};sfxCutB116e=f=>{n[f?'cleared':'cut']++;return saved.cut(f)};
      sfxEatB116e=()=>{n.eat++;return saved.eat()};sfxWashB116e=()=>{n.wash++;return saved.wash()};
      fresh({fatigue:0,tools:{axe:true,sickle:true,hoe:false,can:false}});openRanchB99();
      const tree=B106_OBSTACLES.find(o=>o.tree);standBy(tree);pressX();runFor(B109_APPROACH_MAX+3.2);
      assert(!obstacleStandingB106(tree)&&n.chop>=3&&n.fell===1,`chop sounds ${n.chop}/${n.fell}`);
      const shrub=B106_OBSTACLES.find(o=>!o.tree);standBy(shrub);pressX();runFor(B109_APPROACH_MAX+2.2);
      assert(!obstacleStandingB106(shrub)&&n.cut>=2&&n.cleared===1,`cut sounds ${n.cut}/${n.cleared}`);
      addItemB104('pellets',1);w().px=900;w().py=420;nearPip();w().pip.state='follow';press();focusSheetB100(opt('Feed'));press();assert(n.eat===1,'no eating sound');runFor(3.1);
      addItemB104('soap',1);at('tub');press();focusSheetB100(opt('Wash Pip'));press();assert(n.wash===1,'no wash jingle');runFor(3.1);
      assert(!saved.chop()&&!saved.cut(true)&&!saved.eat()&&!saved.wash(),'audio-off sound played');
    }finally{sfxChopB116e=saved.chop;sfxCutB116e=saved.cut;sfxEatB116e=saved.eat;sfxWashB116e=saved.wash;S.audioEnabled=audio}
  });
  test('B116 ranch sounds synthesize on a running engine, rate-limit repeats and schedule ahead',()=>{
    const ctx0=audioCtx,eng0=audioEngine,audio=S.audioEnabled,calls=[],clock={state:'running',currentTime:5};
    const rec=k=>(...a)=>calls.push({k,time:k==='pop'?a[0]:a[1]});
    try{
      S.audioEnabled=true;audioCtx=clock;audioEngine={ctx:clock,sfx:{},voices:new Set(),b42Installed:true,b42LastSfx:Object.create(null),b42DroppedSfx:0,voice:rec('voice'),fmBell:rec('fmBell'),pop:rec('pop')};
      assert(sfxChopB116e()&&!sfxChopB116e(),'chop not rate-limited');clock.currentTime+=.2;assert(sfxChopB116e()&&sfxChopB116e(true),'chop hit or fall silent');
      assert(sfxCutB116e()&&sfxCutB116e(true),'cut silent');const before=calls.length;
      assert(sfxEatB116e()&&calls.slice(before).some(c=>c.time>clock.currentTime+1),'eating not spread on the audio clock');
      const mid=calls.length;assert(sfxWashB116e()&&calls.slice(mid).filter(c=>c.k==='fmBell').length>=5,'wash jingle missing');
      assert(calls.every(c=>Number.isFinite(c.time)&&c.time>=5),'a note was scheduled in the past');
    }finally{audioCtx=ctx0;audioEngine=eng0;S.audioEnabled=audio}
  });
  fresh();reset();
  return out;
}
