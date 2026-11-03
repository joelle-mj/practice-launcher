// node tuner/test.js : pitch detector on synthetic sines + headless Chrome page load (no console errors, fake mic start/stop).
const fs=require('fs'),vm=require('vm'),path=require('path'); const H=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const js=[...H.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]; const ctx={window:{},module:{}}; vm.runInNewContext(js+';this.SA=StudioAudio',ctx); const A=ctx.SA;
const sr=44100; const sine=(f,n=4096,amp=0.5)=>{ const b=new Float32Array(n); for(let i=0;i<n;i++) b[i]=amp*Math.sin(2*Math.PI*f*i/sr)+0.15*amp*Math.sin(4*Math.PI*f*i/sr); return b; };
for(const [n,f] of [['G3',196],['D4',293.66],['A4',440],['E5',659.26]]){ const p=A.detectPitch(sine(f),sr); const c=p&&A.centsFrom(p.freq,f);
  ok(p&&Math.abs(c)<3,n+' '+f+' Hz detected as '+(p?p.freq.toFixed(2):'null')+' Hz'); const i=A.noteInfo(p.freq,440); ok(i.name+i.octave===n.replace(/\d/,'')+n.slice(-1)&&Math.abs(i.cents)<=3,n+' named '+i.name+i.octave+' '+i.cents+'c'); }
{ const i=A.noteInfo(440*Math.pow(2,12/1200),440); ok(i.name==='A'&&i.cents===12,'A4 +12 cents reads +12'); }
{ const p=A.detectPitch(sine(446.1),sr), i=A.noteInfo(p.freq,440); ok(Math.abs(i.cents-24)<=2,'446.1 Hz is ~+24c sharp ('+i.cents+')'); }
{ const i=A.noteInfo(445,445); ok(i.name==='A'&&i.cents===0,'A4=445 reference shifts'); }
ok(A.detectPitch(new Float32Array(4096),sr)===null,'silence returns null');
ok(A.nearestString(198,440).name==='G'&&A.nearestString(655,440).name==='E','nearest string');
ok(!/(src|href)="(https?:)?\/\//.test(H),'no external/absolute URLs (relative paths only)');
const PW='/workspace/tools/node_modules/playwright';
(async()=>{ if(!fs.existsSync(PW)){ console.log('SKIP browser test (no playwright)'); return done(); }
  const {chromium}=require(PW); const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage(), errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.addInitScript(()=>{ window.LIVE=0; const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); navigator.mediaDevices.getUserMedia=c=>g(c).then(s=>{ window.CONS=c; window.STREAM=s; return s; }); });
  await p.goto('file://'+path.join(__dirname,'index.html')); await p.waitForTimeout(500);
  ok(await p.$$eval('.strings button',x=>x.length)===4,'G D A E buttons');
  await p.click('#stA'); ok(await p.getAttribute('#stA','class')==='play','tap A plays reference'); await p.click('#stA');
  await p.click('#listen'); await p.waitForTimeout(800);
  const c=await p.evaluate(()=>window.CONS&&window.CONS.audio); ok(c&&c.echoCancellation===false&&c.noiseSuppression===false&&c.autoGainControl===false,'mic opened with processing off');
  ok(await p.evaluate(()=>STREAM.getTracks()[0].readyState==='live'),'mic live while listening');
  await p.evaluate(()=>tunerShow({name:'A',octave:4,cents:3,freq:440.8,string:{name:'A'}})); ok(/ok/.test(await p.getAttribute('#face','class'))&&/\+3/.test(await p.textContent('#cents')),'within 5c: green face, +3c');
  await p.evaluate(()=>tunerShow({name:'A',octave:4,cents:-30,freq:432.4,string:{name:'A'}})); ok(/off/.test(await p.getAttribute('#face','class')),'-30c: orange face');
  await p.click('#stop'); ok(await p.evaluate(()=>STREAM.getTracks().every(t=>t.readyState==='ended')),'Stop releases the microphone');
  const p2=await b.newPage(); await p2.addInitScript(()=>{ navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error('denied'),{name:'NotAllowedError'})); });
  await p2.goto('file://'+path.join(__dirname,'index.html')); await p2.click('#listen'); await p2.waitForTimeout(200); ok(/Settings/.test(await p2.textContent('#msg')),'friendly message when permission denied');
  ok(errs.length===0,'no console errors '+errs.join('; ')); await b.close(); done(); })();
function done(){ console.log(fails?'RESULT: '+fails+' FAILED':'RESULT: ALL PASS'); process.exit(fails?1:0); }
