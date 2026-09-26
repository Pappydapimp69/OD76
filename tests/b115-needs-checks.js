function runNeedsChecksB115(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
  const at=id=>{const st=stationB100(id);ranchWorldB100.px=st.x;ranchWorldB100.py=st.y+20;ranchWorldB100.pip.x=st.x+400;ranchWorldB100.pip.y=st.y};
  test('B115 sleeping costs exactly 15 hunger and 15 hygiene',()=>{
    fresh({hunger:80,hygiene:80,fatigue:70});restB99();
    assert(ranchB99.hunger===65&&ranchB99.hygiene===65&&ranchB99.fatigue===10&&ranchB99.week===2,'rest drain wrong: '+ranchB99.hunger+'/'+ranchB99.hygiene);
    const saved=loadRanchB99();assert(saved.hunger===65&&saved.hygiene===65,'rest drain not saved');
    fresh({stones:10,hunger:80,hygiene:80});soloDrillB100('power',0);assert(ranchB99.hunger===80-B104_WEEK_HUNGER&&ranchB99.hygiene===80-B104_WEEK_DIRT.drill,'drill week drain changed');
  });
  test('B115 a starving, filthy Pip still sleeps and his needs stop at 0',()=>{
    fresh({hunger:10,hygiene:5,fatigue:90});openRanchB99();at('home');press();
    const w=ranchWorldB100;assert(w.sheet&&w.sheet.options[0].label==='Rest a week'&&$('ranchSheetB100').textContent.includes('always sleep'),'bed sheet did not offer rest');
    press();assert(ranchB99.hunger===0&&ranchB99.hygiene===0,'needs went below 0 or did not drop');
    assert(ranchB99.fatigue===30&&ranchB99.week===2&&w.pip.state==='sleep','Pip did not sleep');
    restB99();assert(ranchB99.hunger===0&&ranchB99.hygiene===0&&ranchB99.fatigue===0&&ranchB99.week===3,'second rest at 0 needs failed');
  });
  test('B115 week hooks still run when Pip sleeps',()=>{
    fresh({areas:{garden:false,kitchen:false,orchard:true}});restB99();assert(!ranchB99.orchard.apples&&ranchB99.orchard.weeks===1,'orchard week hook skipped');
    restB99();assert(ranchB99.orchard.apples===B105_ORCHARD_APPLES,'orchard did not fruit on rest');
  });
  test('B115 the arena gate opens at 0 hunger and 0 hygiene when Pip is rested',()=>{
    fresh({hunger:0,hygiene:0,fatigue:B114_ARENA_MAX_FATIGUE});openRanchB99();at('gate');press();
    assert(ranchWorldB100.sheet&&!$('ranchSheetB100').textContent.includes('too tired')&&ranchWorldB100.sheet.options.length>1,'gate blocked on needs');
    press();assert(S.run&&!ranchWorldB100.active,'run did not start at 0 needs');
  });
  fresh();reset();
  return out;
}
