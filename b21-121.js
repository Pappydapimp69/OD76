// B117 Refinery slots (shipped inside B117). The Heart Refinery refines several batches at once: 2 slots at
// level 1, a 3rd at level 5 and a 4th at level 10. Each running batch keeps its own start (stored as an offset
// from startedAt, which stays the earliest start so older code and saves still read it). Waiting batches take a
// slot the moment one frees up; loads and upgrades fill free slots at once.
function refinerySlotsB117f(lv=ranchB99?.refinery?.level){const l=clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX);return 2+(l>=5?1:0)+(l>=10?1:0)}
function refineStartsB117f(f,now){
  if(!f.queue)return[];
  const base=f.startedAt||now,lag=Array.isArray(f.lag)?f.lag.filter(x=>Number.isFinite(x)&&x>=0):[];
  const starts=lag.length?lag.slice(0,f.queue).map(l=>base+l):[base];
  return starts;
}
function storeStartsB117f(f,starts){
  if(!starts.length||!f.queue){f.startedAt=0;f.lag=[];return}
  starts.sort((a,b)=>a-b);f.startedAt=starts[0];f.lag=starts.map(s=>s-starts[0]);
}
tickRefineryB102=function(now=Date.now(),roll=Math.random){
  const f=ranchB99.refinery;let done=0;
  if(f.startedAt>now)f.startedAt=now;
  const k=refinerySlotsB117f(f.level),T=refineSecondsB102(f.level)*1000,starts=refineStartsB117f(f,now);
  while(starts.length<Math.min(k,f.queue))starts.push(now); // a load or an upgrade opened a slot just now
  while(starts.length){
    let i=0;for(let j=1;j<starts.length;j++)if(starts[j]<starts[i])i=j;
    const end=starts[i]+T;if(now<end)break;
    starts.splice(i,1);f.queue--;f.trayStones++;if(roll()<B102_DUST_CHANCE)f.trayDust++;done++;
    if(f.queue>starts.length)starts.push(end);
  }
  storeStartsB117f(f,starts);
  if(done)saveRanchB99();
  return done;
};
const loadHeartsBeforeB117f=loadHeartsB102;
loadHeartsB102=function(batches,now=Date.now()){const n=loadHeartsBeforeB117f(batches,now);if(n){tickRefineryB102(now);saveRanchB99()}return n};
const upgradeRefineryBeforeB117f=upgradeRefineryB102;
upgradeRefineryB102=function(now=Date.now()){const ok=upgradeRefineryBeforeB117f(now);if(ok){tickRefineryB102(now);saveRanchB99()}return ok};
// When every loaded batch will be done, simulated slot by slot.
function refineAllLeftB117f(now=Date.now()){
  const f=ranchB99.refinery;if(!f.queue)return 0;
  const T=refineSecondsB102(f.level)*1000,starts=refineStartsB117f(f,now);let waiting=f.queue-starts.length,last=now;
  while(starts.length){let i=0;for(let j=1;j<starts.length;j++)if(starts[j]<starts[i])i=j;const end=starts[i]+T;starts.splice(i,1);last=Math.max(last,end);if(waiting>0){waiting--;starts.push(end)}}
  return Math.max(0,last-now);
}
refineryGateTextB107=function(now=Date.now()){
  tickRefineryB102(now);
  const f=ranchB99.refinery,tray=f.trayStones||f.trayDust?`Tray ready: ◆ ${f.trayStones}${f.trayDust?` · ✧ ${f.trayDust}`:''}.`:'';
  if(!f.queue)return tray?`Heart Refinery: idle. ${tray}`:'';
  return`Heart Refinery: next ◆ in ${clockB102(refineLeftB102(now))}${f.queue>1?` · ${f.queue} batches, all done in ${clockB102(refineAllLeftB117f(now))}`:''}.${tray?' '+tray:''}`;
};
const sanitizeEconomyBeforeB117f=sanitizeEconomyB102;
sanitizeEconomyB102=function(r,raw){
  const out=sanitizeEconomyBeforeB117f(r,raw),lag=raw?.refinery?.lag;
  out.refinery.lag=Array.isArray(lag)?lag.filter(x=>Number.isFinite(x)&&x>=0).slice(0,4):[];return out;
};
ranchB99=loadRanchB99();syncCapsB102();
const refinerySheetBeforeB117f=refinerySheetB102;
refinerySheetB102=function(...a){
  const r=refinerySheetBeforeB117f(...a),f=ranchB99.refinery,p=$('ranchSheetB100')?.querySelector('p'),k=refinerySlotsB117f(f.level);
  if(p)p.textContent+=` ${k} slots refine at once${k<4?` (${k<3?'3 at level 5, ':''}4 at level 10)`:''}.${f.queue>1?` All done in ${clockB102(refineAllLeftB117f())}.`:''}`;
  return r;
};
