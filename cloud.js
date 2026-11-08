/* Login-Gate: ohne bestätigte Supabase-Sitzung niemals Verwaltungsansicht freigeben. */
let cloudClient = null;
let cloudReady = false;
const authRoot = document.getElementById('lg-auth-root');
const isCompanyEmail = email => /^[^@\s]+@dielichtgestalter\.de$/i.test(email || '');
function authPanel(html){authRoot.style.display='grid';authRoot.innerHTML='<div class="lg-panel">'+html+'</div>';}
function showLogin(message=''){
  authPanel('<h2>Die Lichtgestalter · Anmeldung</h2><p>Nur eingeladene Mitarbeitende mit @dielichtgestalter.de.</p>'+
    (message?'<p style="color:#b42332">'+escapeLoginText(message)+'</p>':'')+
    '<form id="lg-login-form"><input id="lg-email" type="email" required placeholder="name@dielichtgestalter.de" autocomplete="username"><input id="lg-password" type="password" required placeholder="Passwort" autocomplete="current-password"><button type="submit">Anmelden</button></form>');
  document.getElementById('lg-login-form').addEventListener('submit',async ev=>{ev.preventDefault();const email=document.getElementById('lg-email').value.trim().toLowerCase(),password=document.getElementById('lg-password').value;
    if(!isCompanyEmail(email))return showLogin('Nur Firmenadressen sind zugelassen.');
    const {error}=await cloudClient.auth.signInWithPassword({email,password});if(error)return showLogin(error.message);await verifyAndLoad();});
}
function escapeLoginText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function verifyAndLoad(){
  const {data:{user},error}=await cloudClient.auth.getUser();
  if(error||!user||!isCompanyEmail(user.email)||!user.email_confirmed_at){
    if(user)await cloudClient.auth.signOut();showLogin('Bitte mit einem bestätigten Firmenkonto anmelden.');return;
  }
  const {data,error:loadError}=await cloudClient.from('workspace').select('payload').eq('id',1).maybeSingle();
  if(loadError){authPanel('<h2>Datenbankzugriff nicht möglich</h2><p>'+escapeLoginText(loadError.message)+'</p><button id="lg-retry">Erneut versuchen</button>');document.getElementById('lg-retry').onclick=verifyAndLoad;return;}
  if(data?.payload&&Array.isArray(data.payload.customers))state=data.payload;
  cloudReady=true;
  document.getElementById('cloud-auth-gate').remove();authRoot.style.display='none';
  const logout=document.createElement('button');logout.textContent='Abmelden';logout.className='secondary';logout.onclick=async()=>{cloudReady=false;await cloudClient.auth.signOut();location.reload()};document.querySelector('header .actions')?.appendChild(logout);
  render();
}
async function cloudSave(){
  if(!cloudReady||!cloudClient)return;
  const {error}=await cloudClient.from('workspace').upsert({id:1,payload:state,updated_at:new Date().toISOString()});
  if(error)alert('Cloud-Speicherung fehlgeschlagen: '+error.message);
}
const originalSave=save;
save=function(){if(!cloudReady)return;originalSave();void cloudSave();};
(async function startCloud(){
  if(!CLOUD_CONFIG?.url||!CLOUD_CONFIG?.anonKey){authPanel('<h2>Supabase nicht konfiguriert</h2><p>Bitte in GitHub in der Datei <b>config.js</b> die Project URL und den Publishable Key eintragen. Die App bleibt bis dahin gesperrt.</p>');return;}
  if(!window.supabase){authPanel('<h2>Verbindungsfehler</h2><p>Supabase-Bibliothek konnte nicht geladen werden. Internetverbindung prüfen.</p>');return;}
  try{cloudClient=window.supabase.createClient(CLOUD_CONFIG.url,CLOUD_CONFIG.anonKey);
    const {data:{session}}=await cloudClient.auth.getSession();if(!session){showLogin();return;}await verifyAndLoad();
  }catch(e){authPanel('<h2>Verbindungsfehler</h2><p>'+escapeLoginText(e.message)+'</p>');}
})();
