function runFocusedChecksB143(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();openRanchB99()};
 test('B143 the bag lists one row per tool and item with count and use',()=>{
  fresh();ranchB99.tools.axe=true;addItemB104('pellets',3);addItemB104('acorn',2);bagSheetB104();
  const rows=[...document.querySelectorAll('#bagListB143 li')].map(li=>li.textContent);
  assert($('ranchSheetB100').querySelector('p')===null||!$('ranchSheetB100').querySelector('p').textContent.includes('×'),'old text block still shown');
  assert(rows.some(r=>r.includes('Axe')&&r.includes('Tool')),'axe row: '+rows);
  assert(rows.some(r=>r.includes('Pip Pellets')&&r.includes('×3')&&r.includes('Food +25')),'pellets row: '+rows);
  assert(rows.some(r=>r.includes('Sunny Acorn')&&r.includes('×2')&&r.includes('−10 fatigue')),'acorn row: '+rows);
 });
 test('B143 an empty bag says so',()=>{fresh({tools:{}});ranchB99.items={};bagSheetB104();assert($('bagListB143')?.textContent.includes('Empty'),'empty text')});
 return out;
}
