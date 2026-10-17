
// B139 Attacks stay on screen. Player and Pip attacks (basic fire, skills, Echoes, sound/burst hits) only target and
// damage enemies whose body is on screen, and their projectiles end at the screen edge. Enemies off screen can't be
// hit until they come into view.
const B139_SOURCES=['player','pip','overdrive','burst','sound'];
function onScreenB139(e){return !!e&&!e.dead&&worldVisible(e.x,e.y,e.r||12)} // any part of the body in view
const nearestBeforeB139=nearestEnemyFrom;
nearestEnemyFrom=function(x,y,range=520){
 let best=null,bestD=range;for(const e of enemies){if(!onScreenB139(e))continue;const d=hyp(x-e.x,y-e.y);if(d<bestD){bestD=d;best=e}}return best;
};
const autoTargetBeforeB139=getAutoTarget;
getAutoTarget=function(...a){
 const t=autoTargetBeforeB139(...a);if(!t||onScreenB139(t))return t;
 const reach=typeof reachB123==='function'?reachB123():S.attackRange;let best=null,bestD=reach;
 for(const e of enemies){if(!onScreenB139(e))continue;const d=hyp(P.x-e.x,P.y-e.y);if(d<bestD){bestD=d;best=e}}return best;
};
const hitEnemyBeforeB139=hitEnemy;
hitEnemy=function(e,power=1,source='player'){
 if(B139_SOURCES.includes(source)&&e&&!e.dead&&!onScreenB139(e))return false;
 return hitEnemyBeforeB139(e,power,source);
};
const updateBeforeB139=update;
update=function(dt){
 const r=updateBeforeB139(dt);
 if(Array.isArray(shots)&&shots.length){for(let i=shots.length-1;i>=0;i--){const s=shots[i];if((s.source==='player'||s.source==='pip')&&!worldVisible(s.x,s.y,4))shots.splice(i,1)}}
 return r;
};
