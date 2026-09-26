const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  url: 'http://127.0.0.1:8176/', runScripts: 'outside-only', pretendToBeVisual: true
});
const win = dom.window;
win.requestAnimationFrame = () => 0;
win.cancelAnimationFrame = () => {};
const context = new Proxy({}, {get: (obj, key) => key in obj ? obj[key] :
  key === 'measureText' ? text => ({width: String(text).length * 7}) :
  key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({addColorStop(){}}) : () => {},
set: (obj, key, value) => {obj[key] = value; return true;}});
win.HTMLCanvasElement.prototype.getContext = () => context;
win.HTMLCanvasElement.prototype.setPointerCapture = () => {};
win.HTMLCanvasElement.prototype.releasePointerCapture = () => {};
win.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({x:0,y:0,left:0,top:0,width:1024,height:768,right:1024,bottom:768});
const byNumberB112 = (a, b) => Number(a.match(/\d+/g).pop()) - Number(b.match(/\d+/g).pop());
const files = fs.readdirSync(root).filter(n => /^b21-\d{2,3}\.js$/.test(n)).sort(byNumberB112);
if (files.length !== 120 || files.at(-1) !== 'b21-120.js' || files[98] !== 'b21-99.js') throw Error('B117 module order');
const source = files.map(n => fs.readFileSync(path.join(root, n), 'utf8')).join('');
new vm.Script(source, {filename:'game.js'}).runInContext(dom.getInternalVMContext());
// Browser QA covers CSS. Removing styles keeps repeated state simulations inexpensive in JSDOM.
win.document.querySelectorAll('style').forEach(style => style.remove());
// The stage-end input guard is real-time; checks drive screens synchronously, so it is off except in its own check.
vm.runInContext('stageInputLockMsB117i=0;stageInputLockB117i=0', dom.getInternalVMContext());
new vm.Script(fs.readFileSync(path.join(__dirname, 'partnership-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
const results = vm.runInContext('runPartnershipChecksB59()', dom.getInternalVMContext());
new vm.Script(fs.readFileSync(path.join(__dirname, 'transport-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runTransportChecksB60()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'settings-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runSettingsChecksB61()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'survival-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runSurvivalChecksB63()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'heartfield-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runHeartfieldChecksB74()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'launch-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runLaunchChecksB75()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'feelings-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runFeelingsChecksB76()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'autonomy-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runAutonomyChecks()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'ranch-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runRanchChecksB99()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b115-spawn-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runSpawnChecksB115()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b115-heat-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runHeatChecksB115()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b115-needs-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runNeedsChecksB115()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b115-drills-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runDrillsChecksB115()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b115-toll-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runTollChecksB115()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b116-storm-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runStormChecksB116()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b116-skill-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runSkillChecksB116()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b116-freeze-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runFreezeChecksB116()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b116-appetite-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runAppetiteChecksB116()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b116-comforts-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runComfortsChecksB116()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b117-survey-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runSurveyChecksB117()', dom.getInternalVMContext()));
new vm.Script(fs.readFileSync(path.join(__dirname, 'b117-fix-checks.js'), 'utf8')).runInContext(dom.getInternalVMContext());
results.push(...vm.runInContext('runFixChecksB117()', dom.getInternalVMContext()));
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.error ? ': '+r.error : ''}`);
dom.window.close();
if (results.some(r => !r.ok)) process.exitCode = 1;
else console.log(`${results.length} checks passed against the complete ${files.length}-module game.`);
