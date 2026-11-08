/* Optional Supabase integration. Offline prototype does not pretend to authenticate users. */
const CLOUD_CONFIG={url:'',anonKey:''}; // public project settings loaded by config.js
let cloudClient=null;
async function initCloud(){
 if(!CLOUD_CONFIG.url||!CLOUD_CONFIG.anonKey){console.info('Lokaler Demomodus: Supabase nicht konfiguriert');return;}
 if(!window.supabase){console.warn('Supabase JS not loaded');return}
 cloudClient=window.supabase.createClient(CLOUD_CONFIG.url,CLOUD_CONFIG.anonKey);
 const {data:{session}}=await cloudClient.auth.getSession();
 if(!session){showLogin();return}
 if(!/^[^@\s]+@dielichtgestalter\.de$/i.test(session.user.email||'')){await cloudClient.auth.signOut();showLogin();return}
 await cloudLoad();
}
function showLogin(){document.getElementById('app').innerHTML=`<div class="panel" style="max-width:460px;margin:60px auto"><h2>Die Lichtgestalter · Login</h2><p>Nur geschäftliche E-Mail-Adressen @dielichtgestalter.de.</p><input id="loginMail" type="email" placeholder="name@dielichtgestalter.de"><input id="loginPass" type="password" placeholder="Passwort" style="margin:10px 0"><button onclick="cloudSignIn(false)">Anmelden</button></div>`;document.getElementById('nav').innerHTML=''}
async function cloudSignIn(signup){let email=document.getElementById('loginMail').value.trim().toLowerCase(),password=document.getElementById('loginPass').value;if(!/^[^@\s]+@dielichtgestalter\.de$/.test(email))return alert('Nur @dielichtgestalter.de ist erlaubt.');if(password.length<8)return alert('Mindestens 8 Zeichen.');let {error}=signup?await cloudClient.auth.signUp({email,password}):await cloudClient.auth.signInWithPassword({email,password});if(error)return alert(error.message);if(signup)return alert('Registrierung ist deaktiviert. Bitte Admin um Einladung bitten.');await cloudLoad()}
async function cloudLoad(){let {data,error}=await cloudClient.from('workspace').select('payload').eq('id',1).maybeSingle();if(error)return alert(error.message);if(data?.payload && Array.isArray(data.payload.customers)){state=data.payload;localSave()}render();}
async function cloudSave(){if(!cloudClient)return;let {error}=await cloudClient.from('workspace').upsert({id:1,payload:state,updated_at:new Date().toISOString()});if(error)alert('Cloud-Speicherung fehlgeschlagen: '+error.message)}
const localSave=save;save=function(){localSave();if(cloudClient)cloudSave()};
initCloud();
