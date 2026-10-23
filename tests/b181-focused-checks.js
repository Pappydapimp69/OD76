function runFocusedChecksB181(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 for(const r of B108_RANKS){colSaveB163.wins[r.id]=0;spentB180[r.id]=0}
 colSaveB163.wins.D=3;spentB180.D=1;colSaveB163.wins.E=1;
 test('B181 the Trophies tile counts trophies to spend',()=>{const h=colosseumBodyB169();assert(/🏆 3 to spend/.test(h)&&/2 ranks won boost Ascension/.test(h),h.match(/Trophies.{0,200}/)?.[0])});
 test('B181 bracket buttons show won and to-spend per rank',()=>{assert(bracketLabelB169(1)==='Rank D · prizes ×'+B108_RANKS[1].reward+' · 🏆 3 won · 2 to spend',bracketLabelB169(1));assert(!/to spend/.test(bracketLabelB169(2)),'C')});
 return out;
}
