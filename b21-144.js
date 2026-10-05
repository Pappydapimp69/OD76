// B127 meteor hotfix: one final checkpoint authority owns all three independent rolls.
// The kill wrapper installed by B30 resolves this function at call time.
checkKillMilestoneDropB30=function(){
 if(!S||S.end)return;
 if(!Number.isFinite(S.b30LastKillMilestone))S.b30LastKillMilestone=0;
 while(S.kills>=S.b30LastKillMilestone+B45_EXPLORATION_KILL_INTERVAL){
  S.b30LastKillMilestone+=B45_EXPLORATION_KILL_INTERVAL;
  rollExplorationDropB30();
  if(heartStoneRollB106()<B106_STONE_CHANCE)spawnHeartStoneB106();
  if(starDustRollB126()<B126_DUST_DROP_CHANCE)spawnStarDustB126();
 }
};
