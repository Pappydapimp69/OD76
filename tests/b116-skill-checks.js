// B116b Skill readout and Beam: threshold meter on the skill button; Beam needs a target and grows with level.
function runSkillChecksB116(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<eps,`${m}: ${a} vs ${b}`);
  const arena=(id='beam',lv=1)=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.heat=0;S.b94Charge=null;S.overType=id;S.overUnlocked.add(id);S.overLevels[id]=lv;
    enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;for(const k of ['start','end','stageUp','pipPauseB39'])$(k)?.classList.add('hidden')};
  const foe=(x=100,y=0)=>{const e={type:'chaser',x,y,r:12,hp:999,maxHp:999,dead:false,age:1,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const btn=()=>$('overdrive'),fill=()=>btn().style.getPropertyValue('--b95fill'),dim=()=>btn().classList.contains('b116dim');
  const readout=(heat,want,wantDim,label)=>{S.heat=heat;updateUI();assert(fill()===want,`${label} ${heat}% fill ${fill()} not ${want}`);assert(dim()===wantDim&&btn().classList.contains('b116solid')===!wantDim,`${label} ${heat}% dim state wrong`)};

  test('B116 skill button fills toward a 25% ignition line and dims only below it',()=>{
    arena('beam');readout(0,'0.0%',true,'Beam');readout(12.5,'50.0%',true,'Beam');readout(25,'100.0%',false,'Beam');readout(60,'100.0%',false,'Beam');
    assert(btn().textContent.includes('HOLD TO FIRE'),'ready text lost');
    S.heat=12.5;update(1/60);assert(dim()&&Math.abs(parseFloat(fill())-50)<.2,'an update frame lost the readout');
    assert(heatReadoutB95().fill===S.heat/100&&$('heatBar').parentElement.style.getPropertyValue('--b95gate')==='25%','top HEAT bar changed');
  });
  test('B116 Ascended Pip button fills toward its 70% ignition line',()=>{
    arena('pip');readout(0,'0.0%',true,'Pip');readout(12.5,'17.9%',true,'Pip');readout(25,'35.7%',true,'Pip');readout(60,'85.7%',true,'Pip');readout(70,'100.0%',false,'Pip');
  });
  test('B116 readout holds while Beam is active and while Nova charges',()=>{
    arena('beam');foe();S.heat=60;assert(triggerOverdrive()&&S.over>0,'Beam did not fire');update(.05);
    assert(btn().classList.contains('active')&&!dim()&&fill()==='100.0%','active Beam above the line is not solid and full');
    S.heat=10;update(.05);assert(S.over>0&&dim()&&Math.abs(parseFloat(fill())-S.heat/25*100)<.1,'active Beam below the line did not dim to progress');
    stopOverdriveB38(false);
    arena('nova');S.heat=36;assert(triggerOverdrive()&&S.b94Charge,'Nova did not charge');tickChargeB94(.25);update(1/60);
    assert(btn().textContent.includes('CHARGING')&&!dim()&&fill()==='100.0%','charging above the line not solid');
    tickChargeB94(1);update(1/60);assert(S.heat<25&&dim()&&Math.abs(parseFloat(fill())-S.heat/25*100)<.1,'charging below the line did not dim');
    stopOverdriveB38(false);
  });
  test('B116 Beam refuses with no enemy in reach and spends nothing',()=>{
    arena('beam');S.heat=60;
    assert(!triggerOverdrive()&&S.over===0&&S.heat===60&&!S.b38OverHeld,'Beam fired at nothing');
    assert(btn().textContent.includes('NO TARGET'),'no refusal feedback: '+btn().textContent);
    const reach=beamReachB116b();foe(reach+20,0);
    assert(!triggerOverdrive()&&S.over===0&&S.heat===60,'Beam fired at an enemy out of reach');
    S.attackCd=999;update(1);assert(!btn().textContent.includes('NO TARGET')&&btn().textContent.includes('HOLD TO FIRE'),'NO TARGET did not clear');
    foe(reach-20,0);assert(triggerOverdrive()&&S.over>0,'Beam refused a target in reach');
    S.attackCd=0;const start=shots.length;attack();assert(shots.slice(start).some(s=>s.source==='player'),'Beam did not shoot the target');
    stopOverdriveB38(false);
  });
  test('B116 Beam volley grows with level: 1, 2, 3, 3, 5 streams at 0.6x to 1.25x',()=>{
    const want=[[1,.6],[2,.8],[3,1],[3,1.12],[5,1.25]];let lastWidth=-1;
    for(let lv=1;lv<=5;lv++){
      arena('beam',lv);foe(100,0);S.heat=80;assert(triggerOverdrive()&&S.over>0,'Lv'+lv+' Beam did not fire');
      S.attackCd=0;shots=[];attackBeforeB116b();const today=shots.filter(s=>s.source==='player');
      S.attackCd=0;shots=[];attack();const beam=shots.filter(s=>s.source==='player'),[count,mult]=want[lv-1];
      assert(beam.length===count,`Lv${lv} streams ${beam.length} not ${count}`);
      for(const s of beam){near(s.power,today[1].power*mult,`Lv${lv} power`);assert(s.pierce===today[1].pierce&&s.life===today[1].life,`Lv${lv} pierce/life changed`)}
      const angles=beam.map(s=>Math.atan2(s.vy,s.vx)),width=Math.max(...angles)-Math.min(...angles);
      assert(width>lastWidth,`Lv${lv} spread did not widen`);lastWidth=width;
      if(lv===3)angles.forEach((a,i)=>near(a,Math.atan2(today[i].vy,today[i].vx),'Lv3 is not today\'s 3-way spread'));
      stopOverdriveB38(false);
    }
  });
  fresh();reset();
  return out;
}
