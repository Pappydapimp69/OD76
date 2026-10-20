function runFocusedChecksB162(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B162 erase removes OD76 saves, keeps settings and other sites',()=>{
  for(const k of ['overdrive76_ranch_v1','overdrive76_pip_v2','od76-ascension-b133','od76_movement_settings_v1','other_site_key'])localStorage.setItem(k,'1');
  eraseProgressB162();
  assert(!localStorage.getItem('overdrive76_ranch_v1')&&!localStorage.getItem('overdrive76_pip_v2')&&!localStorage.getItem('od76-ascension-b133'),'save left');
  assert(localStorage.getItem('od76_movement_settings_v1')==='1'&&localStorage.getItem('other_site_key')==='1','removed too much');
  saveRanchB99();assert(!localStorage.getItem('overdrive76_ranch_v1'),'a later save (pagehide) wrote the ranch back');
 });
 test('B162 the launch screen has the button right after Start, and one tap only arms it',()=>{
  const b=$('eraseB162');assert(b&&$('begin').nextElementSibling===b,'missing');b.click();assert(b.classList.contains('armed'),'one tap did not arm');
 });
 return out;
}
