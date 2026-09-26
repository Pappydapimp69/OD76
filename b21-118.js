// B117 Empty needs tire Pip (shipped inside B117). When a ranch week begins with hunger already at 0, that week
// adds +10 fatigue; the same for cleanliness at 0 (+20 with both). He can still always sleep, the rest just does less.
const B117N_EMPTY_FATIGUE=10;
function emptyNeedsFatigueB117n(){return (ranchB99.hunger<=0?B117N_EMPTY_FATIGUE:0)+(ranchB99.hygiene<=0?B117N_EMPTY_FATIGUE:0)}
const weekPassedBeforeB117n=weekPassedB104;
weekPassedB104=function(kind){
  const add=emptyNeedsFatigueB117n(),r=weekPassedBeforeB117n(kind); // needs as the week begins, before its drain
  if(add>0){ranchB99.fatigue=Math.min(100,ranchB99.fatigue+add);saveRanchB99()}
  return r;
};
const interactBeforeB117n=interactStationB100;
interactStationB100=function(st){
  interactBeforeB117n(st);
  const p=st.id==='home'&&ranchWorldB100.sheet&&$('ranchSheetB100')?.querySelector('p');
  if(p)p.textContent+=` A week that starts with food or clean at 0 adds +${B117N_EMPTY_FATIGUE} fatigue each.`;
};
