function runFocusedChecksB169(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const open=()=>{ranchB99.fatigue=12;ranchB99.rankUnlocked=1;colSaveB163.tutorial=true;colosseumSheetB164();return $('ranchSheetB100')};
 test('B169 the Colosseum sheet is labelled rows, not a paragraph',()=>{
  const el=open(),p=el.querySelector('p.b169');assert(p,'no structured body');
  const labels=[...p.querySelectorAll('.b169Label')].map(x=>x.textContent);
  for(const l of ['Cost','Prize','Coach','Guard','Ascension','Arena skills','Trophies'])assert(labels.includes(l),'missing '+l+': '+labels.join(','));
  assert(!/single elimination|% slower|% less|% harder/.test(p.textContent),'old paragraph or percentages still shown: '+p.textContent);
  assert(p.querySelectorAll('.b169Bar').length===2,'progress bars');closeSheetB100();
 });
 test('B169 values are live: fatigue, clears, skills, trophies',()=>{
  const saved={...ranchB99.cleared},asc={...ascB133};ranchB99.cleared={};const s=B106_OBSTACLES.filter(o=>!o.tree).slice(0,5);s.forEach(o=>ranchB99.cleared[o.id]=true);ascB133.nova=3;
  const t=open().textContent;assert(/fatigue a fight\s*Pip 12\//.test(t)&&/5\/60/.test(t)&&/Nova ✦3/.test(t)&&/🏆 \d/.test(t),t);closeSheetB100();
  ranchB99.cleared=saved;Object.assign(ascB133,asc);
 });
 test('B169 bracket buttons say rank, prize and best run plainly',()=>{
  colSaveB163.best.E=2;colSaveB163.wins.E=0;let b=[...open().querySelectorAll('button')].map(x=>x.textContent);assert(b.includes('Rank E · prizes ×1 · best: 2 wins')&&b.includes('Rank D · prizes ×1.2'),b.join('|'));closeSheetB100();
  colSaveB163.wins.E=1;b=[...open().querySelectorAll('button')].map(x=>x.textContent);assert(b.includes('Rank E · prizes ×1 · 🏆 ×1'),b.join('|'));closeSheetB100();
  colSaveB163.best.E=0;colSaveB163.wins.E=0;
  [...open().querySelectorAll('button')].find(x=>/Rank E/.test(x.textContent)).click();assert(colB163.active&&colB163.br.rank===0,'button does not start rank E');colB163={active:false};document.body.classList.remove('colB163');
 });
 test('B169 other sheets are untouched',()=>{openSheetB100('Arena gate','Battle test text.',[{label:'OK',quiet:true}]);const p=$('ranchSheetB100').querySelector('p');assert(!p.classList.contains('b169')&&p.textContent==='Battle test text.','changed');closeSheetB100()});
 return out;
}
