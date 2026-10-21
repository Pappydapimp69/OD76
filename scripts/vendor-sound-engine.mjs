// Vendors the pure DSP classes of Pappydapimp69/sound-engine (src/dsp, MIT) into one OD76 runtime module.
// OD76 is a concatenated classic script, so ES imports/exports are stripped and the files are wrapped in one IIFE
// that exposes SoundEngineDSP. No worklets: OD76 renders buffers offline from these classes.
// Usage: node scripts/vendor-sound-engine.mjs <path to sound-engine checkout> [out=b21-181.js]
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {execSync} from 'node:child_process';
const src=process.argv[2];if(!src)throw Error('pass the sound-engine checkout path');
const out=process.argv[3]||'b21-181.js',dir=join(src,'src','dsp');
const files=readdirSync(dir).filter(f=>f.endsWith('.js')&&f!=='index.js');
// One scope per file (module-level names like C collide when merged); imports become lookups on the
// dependency's export object, so each file sees exactly what it imported.
const deps={},body={},exps={},key=f=>'__se_'+f.replace(/\W/g,'_');
for(const f of files){
 const t=readFileSync(join(dir,f),'utf8'),imports=[...t.matchAll(/^import\s*\{([^}]*)\}\s*from\s*['"]\.\/([\w.]+)['"];?\s*$/gm)];
 deps[f]=imports.map(m=>m[2]);
 exps[f]=[...t.matchAll(/^export\s+(?:class|function|const|let)\s+(\w+)/gm)].map(m=>m[1]);
 const head=imports.map(m=>`const {${m[1].split(',').map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/\s+as\s+/,': ')).join(', ')}}=${key(m[2])};`).join('\n');
 body[f]=`const ${key(f)}=(()=>{\n${head}\n${t.replace(/^import[^\n]*\n/gm,'').replace(/^export\s+(?=(class|function|const|let)\b)/gm,'').trim()}\nreturn{${exps[f].join(',')}};\n})();`;
}
const order=[],seen=new Set();const visit=f=>{if(seen.has(f))return;seen.add(f);for(const d of deps[f])visit(d);order.push(f)};files.sort().forEach(visit);
const index=readFileSync(join(dir,'index.js'),'utf8'),names=[],picks=[];
for(const m of index.matchAll(/export\s*\{([^}]*)\}\s*from\s*['"]\.\/([\w.]+)['"]/g))for(const n of m[1].split(',').map(x=>x.trim()).filter(Boolean)){names.push(n);picks.push(`${n}:${key(m[2])}.${n}`)}
let rev='unknown';try{rev=execSync('git rev-parse --short HEAD',{cwd:src}).toString().trim()}catch(_){}
const code=`// B170 Sound engine DSP, vendored from Pappydapimp69/sound-engine@${rev} (src/dsp, MIT) by scripts/vendor-sound-engine.mjs.
// Do not edit by hand: change the sound-engine repo and re-run the script. Exposes SoundEngineDSP.{${names.join(',')}}.
const SoundEngineDSP=(()=>{'use strict';
${order.map(f=>`// ---- ${f} ----\n${body[f]}`).join('\n')}
return{${picks.join(',')}};
})();
`;
writeFileSync(out,code);console.log(`wrote ${out}: ${order.length} files, ${names.length} exports, sound-engine@${rev}`);
