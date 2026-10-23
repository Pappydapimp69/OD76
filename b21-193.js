// B181 The Colosseum shows trophies you can spend (B180). The Trophies tile counts the trophies waiting to be spent
// (with the ranks won, which still boost Ascension in the ring), each bracket button shows that rank's spendable count,
// and a championship toast says the new trophy is waiting for that rank's arena runs.
function spendableAllB181(){return B108_RANKS.reduce((n,r)=>n+trophiesLeftB180(r.id),0)}
const bodyBeforeB181=colosseumBodyB169;
colosseumBodyB169=function(...a){
 const html=bodyBeforeB181(...a),tro=trophiesB163(),left=spendableAllB181();
 return html.replace(tileB169('Trophies',`🏆 ${tro}`,'boost Ascension here'),tileB169('Trophies',`🏆 ${left} to spend`,`+${B180_USES} skill uses each in that rank's arena · ${tro} rank${tro===1?'':'s'} won boost Ascension here`));
};
const labelBeforeB181=bracketLabelB169;
bracketLabelB169=function(i,...a){
 const r=B108_RANKS[i],wins=colSaveB163.wins[r.id],left=trophiesLeftB180(r.id);
 return wins?`Rank ${r.id} · prizes ×${r.reward} · 🏆 ${wins} won · ${left} to spend`:labelBeforeB181(i,...a);
};
const endBeforeB181=endColosseumB163;
endColosseumB163=function(...a){
 const br=colB163?.br,champ=!!br?.champion,rk=br?B108_RANKS[br.rank].id:'',r=endBeforeB181(...a);
 if(champ)ranchToastB100(`Pip is the rank ${rk} champion! 🏆 +1 rank ${rk} trophy: spend it on the Overdrive page in a rank ${rk} run for +${B180_USES} skill uses (${trophiesLeftB180(rk)} to spend).`,6);
 return r;
};
