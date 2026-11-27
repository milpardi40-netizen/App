const assert=require('node:assert/strict');
const fs=require('node:fs');
const esbuild=require('esbuild');
const core={exports:{}};
new Function('module','exports',esbuild.transformSync(fs.readFileSync('lib/updateReportingCore.ts','utf8'),{loader:'ts',format:'cjs'}).code)(core,core.exports);
const {createUpdateReporter}=core.exports;
(async()=>{
 let raw=null,owner='alice',online=false,seq=0,now=Date.now(),build={package:'com.devicecontrol.milofive',code:182,name:'1.0.182'};
 const sent=[],deps={read:async()=>raw,write:async v=>{raw=v},user:async()=>owner,build:()=>build,uuid:()=>`id-${++seq}`,now:()=>now,send:async e=>{if(!online)return false;sent.push(e);return true;}};
 const idle=async()=>{for(let i=0;i<5;i++)await new Promise(setImmediate);};
 let reporter=createUpdateReporter(deps);
 await Promise.all([reporter.record('session'),reporter.record('session'),reporter.record('session')]);await idle();
 assert.equal(JSON.parse(raw).events.length,1,'same session, including concurrent auth callbacks, counted once');
 const id=JSON.parse(raw).events[0].id;
 owner='bob';online=true;await reporter.flush();assert.equal(sent.length,0,'never send previous account queued events');
 await reporter.record('session');await idle();assert.equal(sent.length,1);assert.equal(sent[0].owner,'bob');assert.equal(JSON.parse(raw).events[0].id,id);
 owner='alice';reporter=createUpdateReporter(deps);await reporter.flush();assert.equal(sent.at(-1).id,id,'retry preserves idempotency identity');assert.equal(JSON.parse(raw).events.length,0);
 await reporter.record('session');await idle();assert.ok(!sent.some(e=>e.kind==='upgrade_observed'),'first observed build is not declared an upgrade');
 build={...build,code:183,name:'1.0.183'};reporter.newSession();await reporter.record('session');await idle();
 assert.equal(sent.filter(e=>e.kind==='upgrade_observed').length,1);assert.equal(sent.find(e=>e.kind==='upgrade_observed').previous,182);
 await reporter.record('session');await idle();assert.equal(sent.filter(e=>e.kind==='upgrade_observed').length,1);
 reporter.newSession();await reporter.record('session');await idle();assert.equal(sent.filter(e=>e.kind==='upgrade_observed').length,1,'new session does not invent another upgrade');
 owner=null;const before=raw;await reporter.record('session');assert.equal(raw,before,'no account is created or inferred');
 owner='alice';online=false;
 for(let i=0;i<505;i++)await reporter.record('download_verified',build);
 await idle();assert.equal(JSON.parse(raw).events.length,500,'bounded offline queue');
 now+=91*86400000;await reporter.record('download_verified',build);await idle();assert.equal(JSON.parse(raw).events.length,1,'unreportable expired events pruned');
 online=true;await reporter.flush();assert.equal(JSON.parse(raw).events.length,0);
 raw='broken queue';await reporter.record('session');assert.equal(raw,'broken queue','bad storage never corrupts other data or throws to updater');

 // Exercise real native adapter: auth readiness, cold/foreground session boundaries,
 // admin-vs-learner auth, retry after network error and web guard.
 const source=esbuild.transformSync(fs.readFileSync('lib/updateReporting.ts','utf8'),{loader:'ts',format:'cjs'}).code;
 for(const management of [false,true]){
  const disk=new Map(),calls=[];let appState,authCallback,user='account',networkError=false,uuid=0;
  const client={auth:{getSession:async()=>({data:{session:user?{user:{id:user}}:null}}),onAuthStateChange:fn=>{authCallback=fn;return {data:{subscription:{unsubscribe(){calls.push('unsub')}}}}}},rpc:(name,args)=>({abortSignal:async()=>{calls.push({name,args});return {error:networkError?{}:null}}})};
  const otherClient={auth:{getSession:async()=>{throw Error('wrong auth client')}}};
  const deps={'@react-native-async-storage/async-storage':{getItem:async k=>disk.get(k)??null,setItem:async(k,v)=>disk.set(k,v)},'expo-application':{applicationId:build.package,nativeBuildVersion:'183',nativeApplicationVersion:'1.0.183'},'expo-crypto':{randomUUID:()=>`event-${++uuid}`},'react-native':{Platform:{OS:'android'},AppState:{addEventListener:(_name,fn)=>{appState=fn;return {remove(){calls.push('removed')}}}}},'./pairing':{isSupabaseConfigured:()=>true},'./supabase':{supabase:management?otherClient:client},'./features':{MANAGEMENT_BUILD:management},'./educationAdmin':{adminClient:()=>client},'./updateReportingCore':core.exports};
  const m={exports:{}};new Function('module','exports','require',source)(m,m.exports,n=>{assert.ok(n in deps,n);return deps[n]});
  const stop=m.exports.startUpdateUsageReporting();await idle();assert.equal(calls.filter(x=>x.name).length,1);assert.equal(calls.find(x=>x.name).args.p_owner_id,'account');
  appState('background');appState('active');await idle();assert.equal(calls.filter(x=>x.name).length,1,'short background not a new usage');
  const realNow=Date.now;let time=realNow();Date.now=()=>time;
  try{appState('background');time+=31*60000;appState('active');await idle();}finally{Date.now=realNow;}
  assert.equal(calls.filter(x=>x.name).length,2,'30 minute background starts a new session');
  networkError=true;m.exports.reportVerifiedUpdateDownload(build);await idle();assert.equal(JSON.parse(disk.get(core.exports.UPDATE_REPORT_QUEUE_KEY)).events.length,1);
  networkError=false;appState('active');await idle();assert.equal(JSON.parse(disk.get(core.exports.UPDATE_REPORT_QUEUE_KEY)).events.length,0,'foreground retries failed event even in same session');
  stop();assert.ok(calls.includes('unsub')&&calls.includes('removed'));
  deps['react-native'].Platform.OS='web';const count=calls.length;m.exports.startUpdateUsageReporting()();await idle();assert.equal(calls.length,count);
 }
 console.log('PASS update reporter: session dedup, upgrade evidence, account isolation, owner binding, offline retry, bounded queue, expiry, lifecycle, admin auth and web guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});
