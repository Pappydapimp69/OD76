function runFocusedChecksB148(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B148 Sound Lab shows each sound\'s mix bonus again',()=>{
  const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');
  assert(/#pipSoundStep \.b58Pairing,#audioStep \.b58Pairing\{display:-webkit-box!important/.test(css),'pairing line still hidden');
  reset();S.run=true;S.stageEnding=true;openStageUpgrade();openPipSoundStepB26();assert([...document.querySelectorAll('#pipSoundGrid .b58Pairing')].length===6&&$('pipSoundGrid').textContent.includes('Faster shield recovery'),'bonus text missing');
 });
 return out;
}
