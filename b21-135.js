
// B125 patch 5: a Nova makes a few stars, not one per enemy hit: 2 + Nova level (Lv1 3 … Lv5 7, the largest
// pattern), taken from the struck enemies nearest the player. Later waves of the same release only fill the
// slots left. Damage is unchanged.
function novaStarCapB129(){return 2+clamp(Math.floor(overLevel('nova')||1),1,5)}
const addNovaStarsBeforeB129=addNovaStarsB120;
addNovaStarsB120=function(hit){
  const f=novaConstellationB120;if(!f)return;
  const left=novaStarCapB129()-f.nodes.length;if(left<=0)return;
  const fresh=hit.filter(e=>!f.nodes.some(n=>n.enemy===e)).sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y));
  return addNovaStarsBeforeB129(fresh.slice(0,left));
};
