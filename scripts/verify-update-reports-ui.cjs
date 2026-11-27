const assert=require('node:assert/strict');
const esbuild=require('esbuild');
const React=require('react');const {act,create}=require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const pkg='com.devicecontrol.milofive',uid='10000000-0000-4000-8000-000000000002';
const version={package_name:pkg,version_code:183,version_name:'1.0.183',published:true,source:'catalogue',users:1,reporters:1,sessions:2,downloads:1,installers:1,upgrades:1,published_at:'2026-11-26T00:00:00Z',first_report_at:null,last_report_at:null,release_notes:'یادداشت نسخه'};
const user={user_id:uid,full_name:'کاربر آزمایشی',email:'test@example.test',sessions:2,downloads:1,installers:1,upgrades:1,first_report_at:'2026-11-26T00:00:00Z',last_report_at:'2026-11-26T00:00:00Z',latest_observed_code:183};
globalThis.__updateUI={calls:[],mode:'normal',session:'ready',resolve:null};
const state=globalThis.__updateUI;
state.resolve=(name,args)=>{
 state.calls.push({name,args});
 if(state.mode==='missing')return {data:null,error:{code:'PGRST202'}};
 if(name==='admin_update_versions')return {data:{rows:state.mode==='empty'?[]:[{...version,version_code:args.p_offset?182:183}],total:state.mode==='empty'?0:51,started_at:'2026-11-26T00:00:00Z'}};
 if(name==='admin_update_version_users')return {data:{rows:[user],total:1}};
 if(name==='admin_update_legacy_users')return {data:{rows:[{...user,app_version:'1.0.180',platform:'android',last_seen_at:'2026-11-26T00:00:00Z'}],total:1}};
 if(name==='admin_update_user_events')return {data:{rows:[{event_id:'event-a',event_kind:'session',occurred_at:'2026-11-26T00:00:00Z',received_at:'2026-11-26T00:00:00Z',previous_code:null}],total:1}};
 throw Error(name);
};
(async()=>{
 const mocks={
  'react-native':`export const View='View',Pressable='Pressable',ActivityIndicator='ActivityIndicator';export const StyleSheet={create:x=>x};`,
  '@/components/LocalizedText':`export const LocalizedText='Text',LocalizedTextInput='TextInput';`,
  'lucide-react-native':`export const Search='Search',X='X';`,
  '@/lib/educationAdmin':`export const adminClient=()=>({rpc:async(name,args)=>globalThis.__updateUI.resolve(name,args)});`,
  '@/lib/errors':`export const readableSupabaseError=()=> 'خطای سرور';`,
  '../store':`import {useEffect,useRef,useState} from 'react';export function useAdminQuery(key,fetcher){const [data,setData]=useState(null),[error,setError]=useState(null),[loading,setLoading]=useState(false),[tick,setTick]=useState(0);const ref=useRef(fetcher);ref.current=fetcher;useEffect(()=>{if(globalThis.__updateUI.session!=='ready')return;let active=true;setLoading(true);ref.current().then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[key,tick]);return {data,error,loading,refresh:()=>setTick(n=>n+1)}}`,
 };
 const b=await esbuild.build({stdin:{contents:`export {UpdateReportsScreen as Screen} from './features/admin/screens/UpdateReports';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,external:['react','react/jsx-runtime'],jsx:'automatic',plugins:[{name:'boundaries',setup(b){b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path]}));}}]});
 const m={exports:{}};new Function('module','exports','require',b.outputFiles[0].text)(m,m.exports,require);
 const text=v=>v.root.findAllByType('Text').map(n=>n.children.filter(x=>typeof x==='string').join(''));
 const button=(v,label)=>{const n=v.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')===label));assert.ok(n,label);return n};
 let view;const mount=async()=>{await act(async()=>{view=create(React.createElement(m.exports.Screen))})};const press=async(label)=>{await act(async()=>button(view,label).props.onPress())};
 try{
  await mount();assert.ok(text(view).includes('کاربران دارای نشست ثبت‌شده'));assert.ok(text(view).some(t=>t.includes('گذشتهٔ ثبت‌نشده نامشخص')));
  await press('صفحهٔ بعد');assert.equal(state.calls.at(-1).args.p_offset,50);
  await press('کاربران و جزئیات این نسخه');assert.equal(state.calls.at(-1).args.p_version_code,182);assert.equal(state.calls.at(-1).args.p_package_name,pkg);
  assert.ok(text(view).some(t=>t.includes('نصب موفق نیست')));assert.ok(text(view).includes('کاربر آزمایشی'));
  await press('دیدن زمان و نوع رویدادهای این کاربر');assert.equal(state.calls.at(-1).args.p_user_id,uid);assert.ok(text(view).some(t=>t.includes('زمان اعلام‌شدهٔ دستگاه')));
  await act(async()=>view.root.findByType('TextInput').props.onChangeText('test'));
  await press('جست‌وجوی کاربران این نسخه');assert.equal(state.calls.at(-1).args.p_search,'test');assert.ok(!text(view).includes('event-a'),'search resets selected user detail');
  await press('آخرین اطلاعات قبلی کاربران');assert.ok(text(view).some(t=>t.includes('دفعات استفادهٔ گذشته: نامشخص')));
  assert.equal(state.calls.at(-1).name,'admin_update_legacy_users');
  await act(async()=>view.unmount());view=null;
  state.mode='missing';await mount();assert.ok(text(view).some(t=>t.includes('SETUP-UPDATE-REPORTS-ONCE.sql')));assert.ok(!text(view).includes('نشست‌های گزارش‌شده'));
  await act(async()=>view.unmount());view=null;
  state.mode='empty';await mount();assert.ok(text(view).includes('هنوز نسخه‌ای در گزارش موجود نیست'));await act(async()=>view.unmount());view=null;
  state.mode='normal';state.session='signed-out';const before=state.calls.length;await mount();assert.equal(state.calls.length,before,'signed-out admin view does not call RPC');
 }finally{if(view)await act(async()=>view.unmount())}
 console.log('PASS admin update reporting UI: real screen/widgets/API, pagination, version/user/event drill-down, search reset, legacy unknowns, setup errors, empty state, signed-out gate. Native views and session boundary simulated.');
})().catch(e=>{console.error(e);process.exitCode=1});
