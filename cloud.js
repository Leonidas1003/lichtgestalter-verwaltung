/* v14: Supabase row-per-record, conflict-safe writes. The old workspace is not used. */
let cloudClient=null, cloudReady=false, lgBusy=false, lgQueued=false, lgBlocked=false;
let lgBaseline={customers:{},projects:{},docs:{},settings:{}};
const authRoot=document.getElementById('lg-auth-root');
const lgEmailOk=e=>/^[^@\s]+@dielichtgestalter\.de$/i.test(e||'');
const lgEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lgPanel(html){authRoot.style.display='grid';authRoot.innerHTML='<div class="lg-panel">'+html+'</div>';}
function lgLogin(message=''){
 lgPanel('<h2>Die Lichtgestalter · Anmeldung</h2><p>Nur eingeladene Mitarbeitende.</p>'+(message?'<p style="color:#b42332">'+lgEscape(message)+'</p>':'')+'<form id="lg-login-form"><input id="lg-email" type="email" required placeholder="name@dielichtgestalter.de"><input id="lg-password" type="password" required placeholder="Passwort"><button type="submit">Anmelden</button></form>');
 document.getElementById('lg-login-form').onsubmit=async ev=>{ev.preventDefault();const email=document.getElementById('lg-email').value.trim(),password=document.getElementById('lg-password').value;if(!lgEmailOk(email))return lgLogin('Bitte Firmenadresse verwenden.');const {error}=await cloudClient.auth.signInWithPassword({email,password});if(error)return lgLogin(error.message);await lgLoad();};
}
const lgCopy=x=>JSON.parse(JSON.stringify(x));
function lgIndex(rows){const out={customers:{},projects:{},docs:{},settings:{}};for(const r of rows){if(out[r.kind])out[r.kind][r.id]={version:r.version,data:r.data};}return out;}
function lgStateFrom(rows){const next=load();next.customers=[];next.projects=[];next.docs=[];next.sequences={};for(const r of rows){if(['customers','projects','docs'].includes(r.kind))next[r.kind].push(r.data);else if(r.kind==='settings'&&r.id==='main')next.settings=r.data;}return next;}
async function lgLoad(){
 const {data:{user},error:userError}=await cloudClient.auth.getUser();
 if(userError||!user||!lgEmailOk(user.email)||!user.email_confirmed_at){if(user)await cloudClient.auth.signOut();lgLogin('Bitte mit einem bestätigten Firmenkonto anmelden.');return;}
 const {data,error}=await cloudClient.from('lg_records').select('kind,id,data,version').order('created_at',{ascending:true}).limit(10000);
 if(error){lgPanel('<h2>Datenbank nicht bereit</h2><p>'+lgEscape(error.message)+'</p><p>Bitte zuerst supabase_v14.sql ausführen.</p><button id="lg-retry">Erneut versuchen</button>');document.getElementById('lg-retry').onclick=lgLoad;return;}
 lgBaseline=lgIndex(data||[]);state=lgStateFrom(data||[]);cloudReady=true;lgBlocked=false;
 document.getElementById('cloud-auth-gate')?.remove();authRoot.style.display='none';
 if(!document.getElementById('lg-logout')){const b=document.createElement('button');b.id='lg-logout';b.className='secondary';b.textContent='Abmelden';b.onclick=async()=>{await lgFlush();if(lgBlocked)return;cloudReady=false;await cloudClient.auth.signOut();location.reload();};document.querySelector('header .actions')?.appendChild(b);}
 render();
}
function lgCurrent(){return {customers:Object.fromEntries(state.customers.map(x=>[x.id,x])),projects:Object.fromEntries(state.projects.map(x=>[x.id,x])),docs:Object.fromEntries(state.docs.map(x=>[x.id,x])),settings:{main:state.settings}};}
function lgChanges(){const now=lgCurrent(),out=[];for(const kind of ['customers','projects','docs','settings']){const old=lgBaseline[kind],fresh=now[kind];for(const id of new Set([...Object.keys(old),...Object.keys(fresh)])){const a=old[id],b=fresh[id];if(a&&!b)out.push({kind,id,op:'delete',version:a.version});else if(!a&&b)out.push({kind,id,op:'insert',version:0,data:b});else if(a&&b&&JSON.stringify(a.data)!==JSON.stringify(b))out.push({kind,id,op:'update',version:a.version,data:b});}}return out;}
async function lgFlush(){
 if(!cloudReady||lgBlocked)return;
 if(lgBusy){lgQueued=true;return;}
 lgBusy=true;
 try{
  do{
   lgQueued=false;const changes=lgChanges();if(!changes.length)break;
   const {data,error}=await cloudClient.rpc('lg_apply_changes',{p_changes:changes});
   if(error)throw Error(error.message);
   for(const r of data){if(r.deleted)delete lgBaseline[r.kind][r.id];else lgBaseline[r.kind][r.id]={version:r.version,data:r.data};
     if(r.kind==='docs'&&r.data){const d=state.docs.find(x=>x.id===r.id);if(d&&d.number!==r.data.number)d.number=r.data.number;}
   }
  }while(lgQueued||lgChanges().length);
  render();
 }catch(e){lgBlocked=true;alert('Speichern gestoppt: '+e.message+'\n\nEs wurden möglicherweise Änderungen von einer anderen Person vorgenommen. Bitte den Stand prüfen. Diese Seite nicht blind neu laden; gegebenenfalls vorher JSON-Backup exportieren.');}
 finally{lgBusy=false;}
}
const lgOldSave=save;
save=function(){if(!cloudReady||lgBlocked)return;try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}void lgFlush();};
// Prevent bulk import replacing the collaborative database without a dedicated migration.
importData=function(){alert('Der direkte JSON-Import ist in der Mehrbenutzer-Version gesperrt. Bitte Daten über eine geprüfte Migration importieren.');};
(async()=>{
 const conf=typeof CLOUD_CONFIG!=='undefined'?CLOUD_CONFIG:window.LG_CONFIG&&{url:window.LG_CONFIG.SUPABASE_URL,anonKey:window.LG_CONFIG.SUPABASE_ANON_KEY};
 if(!conf?.url||!conf?.anonKey){lgPanel('<h2>Konfiguration fehlt</h2><p>Bitte die bestehende config.js beibehalten.</p>');return;}
 if(!window.supabase){lgPanel('<h2>Supabase-Bibliothek konnte nicht geladen werden</h2>');return;}
 try{cloudClient=window.supabase.createClient(conf.url,conf.anonKey);const {data:{session}}=await cloudClient.auth.getSession();if(!session)return lgLogin();await lgLoad();}catch(e){lgPanel('<h2>Verbindungsfehler</h2><p>'+lgEscape(e.message)+'</p>');}
})();
