
// B115a Spawn ease: past the opening stages, spawn pressure climbs half as fast as before.
// Measured at rank E: 1.38 spawns/s, cap 11, flat through stages 1-3 (waves 1-9); B108's tier then lifts it
// to 2.00, 2.67 and 3.38/s over stages 4-6. Past the run's opening tier (1 + rank offset), spawns per second
// and the bonus-spawn chance now climb half as far above their opening values. The opening tier keeps the
// untouched spawner; HP, speed, caps, wave goals and rank offsets still read difficulty() and the B108 tier.
const B115_SPAWN_EASE=.5;
const spawnLogicBeforeB115=spawnLogic;
const spawnGapB115=d=>clamp(.68/d,.24,.74);
function openingTierB115(){return 1+runRankB108().offset}
function tierDifficultyB115(t){const w=1+(t-1)*3;return .88+Math.min(1.1,(w-1)*.12)+(t>=5?.16+Math.min(.34,(t-5)*.045):0)}
function spawnPaceB115(){
 const t0=openingTierB115(),d0=tierDifficultyB115(t0),d=difficulty(),ease=(open,now)=>open+(now-open)*B115_SPAWN_EASE;
 return{gap:1/ease(1/spawnGapB115(d0),1/spawnGapB115(d)),bonus:ease(t0>1?.075*d0:0,.075*d)};
}
spawnLogic=function(dt){
 if(difficultyStageB63()<=openingTierB115())return spawnLogicBeforeB115(dt);
 if(S.waveState!=="active"||S.bossActive||S.waveKills>=S.waveGoal)return;
 S.spawn-=dt;if(S.spawn>0)return;
 if(enemies.filter(e=>!e.dead).length>=enemyCap()){S.spawn=.18;return}
 const pace=spawnPaceB115();S.spawn=pace.gap*rr(.82,1.12);
 spawnEnemy(chooseSpawn());
 if(rnd()<pace.bonus&&enemies.filter(e=>!e.dead).length<enemyCap())spawnEnemy(rnd()<.64?"chaser":"charger");
};
