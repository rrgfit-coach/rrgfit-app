'use strict';
const SB_URL='https://vyjaohlwpzebeamdscyr.supabase.co';
const SB_KEY='sb_publishable_v7TX17F0Rf0gTc6XGrFGRQ_K2W_-xKY';
const SITE='https://rrgfit-coach.github.io/rrgfit-app/';
const POLICY_V='2026-11-26';
const sb=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID();
const today=()=>new Date().toISOString().slice(0,10);
const RCAT=['Boxeo','K1','Muay Thai','Fuerza funcional','Movilidad','Online'];const rcat=c=>(['Funcional','Fuerza','Fuerza / GAP','GAP'].includes(c)?'Fuerza funcional':c);
const SERV=RCAT;
const dmeta=(items,k)=>{const e=(items||[]).find(x=>(x.d||1)===k&&(x.dn||x.sm))||{};return{t:e.dn||'',sm:!!e.sm}};
function dmSet(k,key,v){window._r.items.forEach(e=>{if((e.d||1)===k){if(key==='t')e.dn=v;else e.sm=v}});if(key==='sm')rerender()}
function newItem(o){const k=window._rd||1;const m=dmeta(window._r.items,k);return Object.assign({d:k,s:3,r:'10',rest:'',load:'',note:''},m.t?{dn:m.t}:{},m.sm?{sm:true}:{},o)}
const EXS={Boxeo:['Sombra 3x3 min','Jab-cruzado en saco','Trabajo de manoplas','Defensa y esquivas','Combinaciones al saco'],'Muay Thai':['Patada baja','Rodillazos en saco','Clinch','Patada frontal (teep)','Manoplas thai'],K1:['Combinaciones K1','Patadas altas','Guardia y desplazamientos','Saco 5x3 min'],Funcional:['Burpees','Kettlebell swing','Plancha','Zancadas','Remo con banda','Saltos al cajón'],Fuerza:['Sentadilla','Peso muerto rumano','Hip thrust','Press de banca','Dominadas asistidas','Press militar','Puente de glúteo'],Movilidad:['Movilidad de cadera','Movilidad de hombros','Gato-camello']};
const SEED=[['Boxeo iniciación','Boxeo',['Sombra 3x3 min','Jab-cruzado en saco','Defensa y esquivas']],['Muay Thai base','Muay Thai',['Patada baja','Rodillazos en saco','Patada frontal (teep)']],['Funcional cuerpo completo','Funcional',['Burpees','Kettlebell swing','Zancadas','Plancha']],['Fuerza GAP','Fuerza / GAP',['Hip thrust','Sentadilla','Peso muerto rumano','Puente de glúteo']],['Movilidad suave','Movilidad',['Movilidad de cadera','Movilidad de hombros','Gato-camello']]];
let MYD=[],MYW=[];let S={settings:{},clients:[],sessions:[],routines:[]};
let ME=null,ROLE=null,MYC=null,MYS=[],AUTHVIEW='login',RECOVERY=false;
// ---- sincronización con la nube (entrenadora)
let snap={clients:{},priv:{},routines:{},sessions:{},settings:''},dirty=false,saving=false,timer=null;
const j=o=>JSON.stringify(o);
const rowClient=c=>{const r={id:c.id,name:c.name,phone:c.phone||null,email:c.email||null,origin:c.origin||'propio',active:c.active!==false,data:{goal:c.goal||'',bono:c.bono||{total:0,used:0},measures:c.measures||[],tracking:!!c.tracking,nut:c.nut||(c.tracking?'3m':''),routines:c.routines||[],lastContact:c.lastContact||null,created:c.created||today(),wa:S.settings.wa||'',t:S.settings.name||''}};r.user_id=c.user_id||null;return r};
const rowPriv=c=>({client_id:c.id,data:{injuries:c.injuries||'',logs:c.logs||[]}});
const rowRoutine=r=>({id:r.id,name:r.name,cat:r.cat||null,items:r.items||[]});
const rowSess=s=>({id:s.id,client_id:s.clientId,dt:s.dt,service:s.service||null,done:!!s.done});
function setStatus(t,c){const e=$('#sub');if(e&&ROLE==='trainer'){e.textContent=t;e.style.color=c||''}}
function save(){dirty=true;setStatus('Guardando…');clearTimeout(timer);timer=setTimeout(flush,500)}
async function flush(){if(saving||ROLE!=='trainer'){return}saving=true;dirty=false;
try{
 const sets=j(S.settings);
 if(sets!==snap.settings){const{error}=await sb.from('trainers').update({settings:S.settings}).eq('user_id',ME.id);if(error)throw error;snap.settings=sets}
 const plan=[['clients',S.clients.map(rowClient),'id'],['client_private',S.clients.map(rowPriv),'client_id','priv'],['routines',S.routines.map(rowRoutine),'id'],['sessions',S.sessions.map(rowSess),'id']];
 for(const[tbl,rows,key,sk]of plan){const k=sk||tbl;const old=snap[k];const cur={};rows.forEach(r=>cur[r[key]]=j(r));
  const up=rows.filter(r=>old[r[key]]!==cur[r[key]]);
  if(up.length){const{error}=await sb.from(tbl).upsert(up,{onConflict:key});if(error)throw error;up.forEach(r=>old[r[key]]=cur[r[key]])}
 }
 for(const[tbl,k,key]of[['sessions','sessions','id'],['routines','routines','id'],['clients','clients','id']]){const ids=new Set((tbl==='clients'?S.clients:tbl==='routines'?S.routines:S.sessions).map(x=>x.id));
  const gone=Object.keys(snap[k]).filter(id=>!ids.has(id));
  if(gone.length){const{error}=await sb.from(tbl).delete().in('id',gone);if(error)throw error;gone.forEach(id=>{delete snap[k][id];if(k==='clients')delete snap.priv[id]})}}
 setStatus('Guardado ✓');
}catch(e){console.error(e);dirty=true;setStatus('Sin conexión, reintentando…','#e8731a');setTimeout(()=>{if(dirty)flush()},5000)}
saving=false;if(dirty&&!timer)flush()}
async function loadTrainer(){
 const[a,b,c,d,t]=await Promise.all([sb.from('clients').select('*').order('created_at'),sb.from('client_private').select('*'),sb.from('routines').select('*'),sb.from('sessions').select('*'),sb.from('trainers').select('settings').eq('user_id',ME.id).single()]);
 for(const r of[a,b,c,d,t])if(r.error)throw r.error;
 const pv={};b.data.forEach(p=>pv[p.client_id]=p.data||{});
 S.settings=t.data.settings||{};
 S.clients=a.data.map(r=>{const x=r.data||{},p=pv[r.id]||{};return{id:r.id,user_id:r.user_id,name:r.name,phone:r.phone,email:r.email,origin:r.origin,active:r.active,consent_at:r.consent_at,goal:x.goal,bono:x.bono||{total:0,used:0},measures:x.measures||[],tracking:!!x.tracking,nut:x.nut||(x.tracking?'3m':''),routines:x.routines||[],lastContact:x.lastContact,created:x.created||(r.created_at||'').slice(0,10),injuries:p.injuries||'',logs:p.logs||[]}});
 S.routines=c.data.map(r=>({id:r.id,name:r.name,cat:r.cat,items:r.items||[]}));
 S.sessions=d.data.map(r=>({id:r.id,clientId:r.client_id,dt:r.dt,service:rcat(r.service),done:r.done}));
 snap={clients:{},priv:{},routines:{},sessions:{},settings:j(S.settings)};
 S.clients.forEach(x=>{snap.clients[x.id]=j(rowClient(x));snap.priv[x.id]=j(rowPriv(x))});S.routines.forEach(x=>snap.routines[x.id]=j(rowRoutine(x)));S.sessions.forEach(x=>snap.sessions[x.id]=j(rowSess(x)));
 if(!S.routines.length&&!S.clients.length){S.routines=SEED.map(([name,cat,items])=>({id:uid(),name,cat,items:items.map(n=>({n,s:3,r:'10',note:''}))}));save()}
}
async function loadClient(){
 const[a,b,dd,ww]=await Promise.all([sb.from('clients').select('*').eq('user_id',ME.id).maybeSingle(),sb.from('sessions').select('*'),sb.from('diets').select('id,title,d,body,file_name').order('d',{ascending:false}),sb.from('weight_logs').select('*').order('d',{ascending:false})]);
 if(a.error)throw a.error;MYC=a.data;MYS=(b.data||[]);MYD=(dd.data||[]);MYW=(ww.data||[]);
}
async function boot(){
 const{data}=await sb.auth.getSession();
 if(!data.session){ME=null;ROLE=null;return render()}
 ME=data.session.user;
 try{const t=await sb.from('trainers').select('user_id').eq('user_id',ME.id).maybeSingle();
  if(t.data){ROLE='trainer';await loadTrainer()}else{ROLE='client';await loadClient()}
 }catch(e){console.error(e);toast('No se pudieron cargar los datos')}
 render()}
sb.auth.onAuthStateChange((ev,s)=>{if(ev==='PASSWORD_RECOVERY'){RECOVERY=true;render()}});
async function doLogin(){const email=$('#l_e').value.trim(),password=$('#l_p').value;if(!email||!password)return toast('Pon tu email y contraseña');
 const{error}=await sb.auth.signInWithPassword({email,password});if(error)return toast('Email o contraseña incorrectos');boot()}
async function doForgot(){const email=$('#l_e').value.trim();if(!email)return toast('Escribe tu email arriba');
 const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:SITE});toast(error?'No se pudo enviar el email':'Te hemos enviado un email para cambiar la contraseña')}
async function doNewPass(){const p=$('#np').value;if(p.length<8)return toast('Mínimo 8 caracteres');const{error}=await sb.auth.updateUser({password:p});if(error)return toast('No se pudo cambiar');RECOVERY=false;history.replaceState(null,'',location.pathname);toast('Contraseña cambiada');boot()}
async function logout(){await sb.auth.signOut();ME=null;ROLE=null;MYC=null;S={settings:{},clients:[],sessions:[],routines:[]};render()}
const toast=m=>{const t=$('#toast');t.textContent=m;t.className='on';setTimeout(()=>t.className='',2200)};
const cl=id=>S.clients.find(c=>c.id===id);
const fdate=d=>d?new Date(d).toLocaleString('es-ES',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
const daysAgo=d=>d?Math.floor((Date.now()-new Date(d))/864e5):999;
const go=h=>{location.hash=h};
const nav=[['','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>','Inicio'],['clientes','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6z"/><circle cx="17" cy="9" r="2.5"/></svg>','Clientes'],['rutinas','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2 9h3v6H2zM19 9h3v6h-3zM5 7h3v10H5zM16 7h3v10h-3zM8 11h8v2H8z"/></svg>','Rutinas'],['agenda','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 5h16v16H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h16v2H4zM8 2h2v5H8zM14 2h2v5h-2z"/></svg>','Agenda'],['ejercicios','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="4.5" r="2.5"/><path d="M11 8h2l1 5 3 1-.5 2-4-1-1.5 6h-2l1.5-7-2-1.5L7 15l-1-1.5L9 9z"/></svg>','Ejercicios'],['ajustes','<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4z"/></svg>','Ajustes']];
let filt='todos',q='';
function bonoBar(c){if(!c.bono||!c.bono.total)return'';const left=c.bono.total-c.bono.used;return`<div class="mut">Bono: quedan ${left} de ${c.bono.total}</div><div class="bono"><i style="width:${Math.max(0,left)/c.bono.total*100}%"></i></div>`}
function chart(pts,key,unit){pts=pts.filter(p=>p[key]);if(pts.length<2)return`<div class="mut">Añade al menos 2 registros para ver la gráfica.</div>`;
const v=pts.map(p=>+p[key]),mn=Math.min(...v),mx=Math.max(...v),r=(mx-mn)||1;
const xy=pts.map((p,i)=>[10+i*(300/(pts.length-1)),100-(p[key]-mn)/r*80]);
return`<svg class="chart" viewBox="0 0 320 120"><polyline fill="none" stroke="#e8731a" stroke-width="3" points="${xy.map(a=>a.join(',')).join(' ')}"/>${xy.map((a,i)=>`<circle cx="${a[0]}" cy="${a[1]}" r="4" fill="#fff"/>`).join('')}<text x="10" y="116" fill="#9a9aa3" font-size="10">${mn} ${unit}</text><text x="250" y="14" fill="#9a9aa3" font-size="10">${mx} ${unit}</text></svg>`}

function vInicio(){const n=new Date();const day=today();
const ts=S.sessions.filter(s=>s.dt.slice(0,10)===day&&!s.done).sort((a,b)=>a.dt.localeCompare(b.dt));
const cold=S.clients.filter(c=>c.active!==false&&daysAgo(c.lastContact||c.created)>=7);
const low=S.clients.filter(c=>c.active!==false&&c.bono&&c.bono.total&&c.bono.total-c.bono.used<=1);
const act=S.clients.filter(c=>c.active!==false).length;
return`<div class="hero"><img src="logo.png" alt="RRG Personal Trainer"></div><h2>Hola, ${esc(S.settings.name||'')} 💪</h2>
<div class="stats"><div class="card"><div class="big">${act}</div><div class="mut">clientes activos</div></div><div class="card"><div class="big">${ts.length}</div><div class="mut">sesiones hoy</div></div><div class="card"><div class="big">${low.length}</div><div class="mut">bonos por acabar</div></div></div>
<h3>Sesiones de hoy</h3>${ts.length?ts.map(s=>{const c=cl(s.clientId);return`<div class="card row"><div><b>${esc(c?c.name:'?')}</b><div class="mut">${fdate(s.dt)} · ${esc(s.service)}</div></div><button class="btn sm" onclick="doneS('${s.id}')">Hecha ✓</button></div>`}).join(''):'<div class="empty">Nada para hoy. Añade sesiones en Agenda.</div>'}
<h3>Llevan días sin contacto</h3>${cold.length?cold.map(c=>`<div class="card click row" onclick="go('#/cliente/${c.id}')"><div><b>${esc(c.name)}</b><div class="mut">${daysAgo(c.lastContact||c.created)} días</div></div>${c.phone?`<a class="btn wa sm" onclick="event.stopPropagation();contacted('${c.id}')" href="https://wa.me/${waNum(c.phone)}" target="_blank">WhatsApp</a>`:''}</div>`).join(''):'<div class="empty">Todos al día 👌</div>'}
<h3>Bonos a punto de acabarse</h3>${low.length?low.map(c=>`<div class="card click" onclick="go('#/cliente/${c.id}')"><b>${esc(c.name)}</b>${bonoBar(c)}</div>`).join(''):'<div class="empty">Ninguno</div>'}`}
const waNum=p=>{p=String(p).replace(/[^\d]/g,'');return p.length===9?'34'+p:p};
function contacted(id){const c=cl(id);c.lastContact=today();save()}
function doneS(id){const s=S.sessions.find(x=>x.id===id);s.done=true;const c=cl(s.clientId);if(c){if(c.bono&&c.bono.total)c.bono.used++;c.lastContact=today();c.logs=c.logs||[];c.logs.unshift({d:today(),t:'Sesión de '+s.service})}save();toast('Sesión hecha');render()}

function vClientes(){let l=S.clients.filter(c=>(filt==='todos'||(filt==='activos'&&c.active!==false)||(filt==='vivofacil'&&c.origin==='vivofacil')||(filt==='propio'&&c.origin!=='vivofacil'))&&c.name.toLowerCase().includes(q.toLowerCase()));
return`<h2>Clientes</h2><input id="q" placeholder="Buscar cliente…" value="${esc(q)}" oninput="q=this.value;renderKeep()">
${S.clients.some(c=>c.tracking)?'<button class="btn ghost sm" onclick="go(\'#/seguimiento\')">Ver seguimiento nutricional</button>':''}<div class="chips">${['todos','activos','vivofacil','propio'].map(f=>`<button class="chip ${filt===f?'on':''}" onclick="filt='${f}';render()">${f==='vivofacil'?'Vivofácil':f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div>
${l.length?l.map(c=>`<div class="card click" onclick="go('#/cliente/${c.id}')"><div class="row"><b>${esc(c.name)}</b><span>${c.origin==='vivofacil'?'<span class="tag red">Vivofácil</span>':''}${c.active===false?'<span class="tag">inactivo</span>':''}</span></div><div class="mut">${esc(c.goal||'Sin objetivo')}</div>${bonoBar(c)}</div>`).join(''):'<div class="empty">Aún no hay clientes. Pulsa + para añadir el primero.</div>'}
<button class="btn fab" onclick="go('#/cliente/nuevo')">+</button>`}
function renderKeep(){const p=$('#q').selectionStart;render();const e=$('#q');e.focus();e.setSelectionRange(p,p)}

function vFicha(id){const nw=id==='nuevo';const c=nw?{id:uid(),name:'',origin:'propio',active:true,created:today(),tracking:false,measures:[],logs:[],routines:[],bono:{total:0,used:0}}:cl(id);if(!c)return'<div class="empty">No existe</div>';
window._c=c;window._nw=nw;
const nxt=S.sessions.filter(s=>s.clientId===c.id&&!s.done&&s.dt>=new Date().toISOString().slice(0,16)).sort((a,b)=>a.dt.localeCompare(b.dt))[0];
return`<button class="btn ghost sm" onclick="go('#/clientes')">← Clientes</button><h2>${nw?'Nuevo cliente':esc(c.name)}</h2>
<div class="card"><label>Nombre</label><input id="f_name" value="${esc(c.name)}">
<div class="g2"><div><label>Teléfono (WhatsApp)</label><input id="f_phone" inputmode="tel" value="${esc(c.phone||'')}"></div><div><label>Origen</label><select id="f_origin"><option value="propio" ${c.origin!=='vivofacil'?'selected':''}>Propio</option><option value="vivofacil" ${c.origin==='vivofacil'?'selected':''}>Vivofácil</option></select></div></div>
<label>Objetivo</label><textarea id="f_goal" rows="4" placeholder="Objetivo del cliente. Es el texto de la primera página del PDF (puedes escribir varios párrafos; si lo dejas vacío sale el texto estándar).">${esc(c.goal||'')}</textarea>
<label>Lesiones / notas médicas</label><textarea id="f_inj" rows="2">${esc(c.injuries||'')}</textarea>
<div class="g2"><div><label>Bono: sesiones totales</label><input id="f_bt" type="number" min="0" value="${c.bono.total||0}"></div><div><label>Sesiones usadas</label><input id="f_bu" type="number" min="0" value="${c.bono.used||0}"></div></div>
<label><input type="checkbox" id="f_act" style="width:auto" ${c.active!==false?'checked':''}> Cliente activo</label><br><label>Asesoramiento nutricional</label><select id="f_nut"><option value="" ${!c.nut?'selected':''}>Ninguno</option><option value="1m" ${c.nut==='1m'?'selected':''}>Dieta de 1 mes (sin seguimiento)</option><option value="3m" ${c.nut==='3m'?'selected':''}>Seguimiento nutricional trimestral (el cliente anota su peso y medidas)</option></select><br>
<button class="btn" onclick="saveC(${nw})">Guardar</button> ${nw?'':`<button class="btn del" onclick="delC('${c.id}')">Borrar</button>`}</div>
${nw?'':`
${c.tracking?`<h3>Seguimiento nutricional</h3><div class="card"><div id="wchart">${chart([...c.measures].sort((a,b)=>a.d.localeCompare(b.d)),'w','kg')}</div>
<div class="g2" style="margin-top:8px"><div><label>Peso (kg)</label><input id="m_w" type="number" step="0.1"></div><div><label>Cintura (cm)</label><input id="m_c" type="number" step="0.5"></div></div>
<button class="btn sm" onclick="addM()">Añadir registro</button>
${[...c.measures].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,6).map(m=>`<div class="ex mut">${m.d}: ${m.w||'–'} kg · cintura ${m.c||'–'} cm</div>`).join('')}</div>`:''}
<div id="wlogs"></div>
<h3>Rutinas asignadas</h3>${c.routines.length>1?'<button class="btn ghost sm" onclick="pdfR(\'all\')">PDF con todas las rutinas juntas</button>':''}${c.routines.map((r,i)=>`<div class="card"><div class="row"><b>${esc(r.name)}</b><span><button class="btn ghost sm" onclick="pdfR(${i})">PDF</button> <button class="btn del sm" onclick="unassign(${i})">Quitar</button></span></div>${r.items.map(e=>`<div class="ex">${exLink(e)} <span class="mut">· ${e.s}x${esc(e.r)} ${esc(e.note||'')}</span></div>`).join('')}</div>`).join('')||'<div class="empty">Sin rutinas</div>'}
<div class="card"><label>Asignar rutina</label><select id="as">${S.routines.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('')}</select><button class="btn sm" onclick="assign()">Asignar</button></div>
<h3>Notas de sesión</h3><div class="card"><textarea id="n_t" rows="2" placeholder="Cómo fue la sesión…"></textarea><button class="btn sm" onclick="addN()">Guardar nota</button>
${(c.logs||[]).map(l=>`<div class="ex"><span class="mut">${l.d}</span> ${esc(l.t)}</div>`).join('')}</div>
<h3>Dietas</h3><div id="dietas"><div class="empty">Cargando…</div></div>
${accesoCard(c)}`}`+(nw?'':(setTimeout(()=>{loadDiets(c.id);loadWL(c)},0),''))}
function saveC(nw){const c=window._c;c.name=$('#f_name').value.trim();if(!c.name)return toast('Pon un nombre');c.phone=$('#f_phone').value.trim();c.origin=$('#f_origin').value;c.goal=$('#f_goal').value;c.injuries=$('#f_inj').value;c.bono={total:+$('#f_bt').value||0,used:+$('#f_bu').value||0};c.active=$('#f_act').checked;c.nut=$('#f_nut').value;c.tracking=c.nut==='3m';if(nw)S.clients.push(c);save();toast('Guardado');go('#/cliente/'+c.id);render()}
function delC(id){if(!confirm('¿Borrar este cliente y sus datos?'))return;S.clients=S.clients.filter(c=>c.id!==id);S.sessions=S.sessions.filter(s=>s.clientId!==id);save();go('#/clientes')}
function addM(){const c=window._c;const w=$('#m_w').value,k=$('#m_c').value;if(!w&&!k)return;c.measures.push({d:today(),w:w?+w:null,c:k?+k:null});save();render()}
function addN(){const t=$('#n_t').value.trim();if(!t)return;const c=window._c;c.logs=c.logs||[];c.logs.unshift({d:today(),t});c.lastContact=today();save();render()}
function assign(){const r=S.routines.find(x=>x.id===$('#as').value);if(!r)return;window._c.routines.push(JSON.parse(JSON.stringify({name:r.name,items:r.items})));save();toast('Rutina asignada');render()}
function unassign(i){window._c.routines.splice(i,1);save();render()}

function vRutinas(){return`<h2>Rutinas</h2>${S.routines.map(r=>`<div class="card click" onclick="go('#/rutina/${r.id}')"><div class="row"><b>${esc(r.name)}</b><span><span class="tag">${esc(rcat(r.cat)||'')}</span> <button class="btn ghost sm" onclick="event.stopPropagation();dupR('${r.id}')">Duplicar</button></span></div><div class="mut">${r.items.length} ejercicios</div></div>`).join('')||'<div class="empty">Sin rutinas</div>'}<button class="btn fab" onclick="go('#/rutina/nueva')">+</button>`}
function vRutina(id){const nw=id==='nueva';const r=nw?{id:uid(),name:'',cat:'Fuerza funcional',items:[]}:S.routines.find(x=>x.id===id);if(!r)return'<div class="empty">No existe</div>';window._r=JSON.parse(JSON.stringify(r));window._r.cat=rcat(window._r.cat);window._rn=nw;window._rd=1;return rutinaForm()}
function rutinaForm(){loadEX();const r=window._r;const all=[...new Set(Object.values(EXS).flat())];
return`<button class="btn ghost sm" onclick="go('#/rutinas')">← Rutinas</button><h2>${window._rn?'Nueva rutina':'Editar rutina'}</h2>
<div class="card"><label>Nombre</label><input id="r_name" value="${esc(r.name)}" oninput="window._r.name=this.value">
<label>Tipo</label><select id="r_cat" onchange="window._r.cat=this.value">${RCAT.map(s=>`<option ${rcat(r.cat)===s?'selected':''}>${s}</option>`).join('')}</select></div>
<h3>Ejercicios por día</h3>${(()=>{const mx=Math.max(1,window._rd||1,...r.items.map(e=>e.d||1));let o='';for(let k=1;k<=mx;k++){const its=r.items.map((e,i)=>(e.d||1)===k?`<div class="card"><input value="${esc(e.n)}" oninput="window._r.items[${i}].n=this.value"><div class="g2"><div><label>Día</label><select onchange="window._r.items[${i}].d=+this.value;rerender()">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option ${(e.d||1)===n?'selected':''}>${n}</option>`).join('')}</select></div><div><label>Series</label><input type="number" value="${e.s}" oninput="window._r.items[${i}].s=+this.value"></div></div><div class="g2"><div><label>Reps / tiempo</label><input value="${esc(e.r)}" oninput="window._r.items[${i}].r=this.value"></div><div><label>Descanso</label><input value="${esc(e.rest||'')}" placeholder="30''/1'30''" oninput="window._r.items[${i}].rest=this.value"></div></div><label>Peso / carga</label><input value="${esc(e.load||'')}" placeholder="-" oninput="window._r.items[${i}].load=this.value"><input placeholder="Nota (opcional)" value="${esc(e.note||'')}" oninput="window._r.items[${i}].note=this.value"><button class="btn del sm" onclick="window._r.items.splice(${i},1);rerender()">Quitar</button></div>`:'').join('');o+=`<h3>Día ${k}${k===(window._rd||1)?' <span class="tag">añadiendo aquí</span>':` <button class="btn ghost sm" onclick="window._rd=${k};rerender()">Añadir aquí</button>`}</h3><div class="card"><label>Nombre del día (opcional, ej: Full Body)</label><input value="${esc(dmeta(r.items,k).t)}" oninput="dmSet(${k},'t',this.value)"><label class="chk"><input type="checkbox" ${dmeta(r.items,k).sm?'checked':''} onchange="dmSet(${k},'sm',this.checked)"> Solo repeticiones (tipo AMRAP: sin series, descanso ni peso)</label></div>${its||'<div class="mut">Sin ejercicios todavía</div>'}`}return o+`<button class="btn ghost" onclick="window._rd=${mx+1};rerender()">+ Añadir otro día</button>`})()}<div class="card"><label>Añadir ejercicio de la lista</label><input id="pk_q" type="search" placeholder="Buscar (ej: press militar)" oninput="pkSearch(this.value)" autocomplete="off"><div id="pk"></div>
<label>O escribe uno propio</label><input id="ex_n" placeholder="Nombre del ejercicio"><button class="btn sm" onclick="addEx()">Añadir</button></div>
<button class="btn" onclick="saveR()">Guardar rutina</button> ${window._rn?'':`<button class="btn ghost" onclick="dupR()">Duplicar rutina</button> <button class="btn del" onclick="delR()">Borrar</button>`}`}
function rerender(){$('#app').innerHTML=rutinaForm()}
const DEFOBJ='El objetivo principal es mejorar la fuerza y desarrollar la masa muscular, manteniendo un estilo de vida activo y saludable mediante un programa de entrenamiento personalizado, adaptado a su nivel y condición física actual.\nEl programa estará orientado a fortalecer de forma equilibrada todos los grupos musculares, mejorar la movilidad y la condición física general, priorizando una correcta ejecución de los ejercicios y una progresión gradual de las cargas para favorecer el bienestar físico y una mejora continua del rendimiento.';
const OBS=['<u>Prioriza siempre la técnica antes que el peso.</u> Es preferible utilizar menos carga y realizar correctamente el ejercicio que levantar más peso con una técnica inadecuada.','Si aparece <u>dolor intenso, agudo o inusual</u> durante algún ejercicio, <u>detente inmediatamente</u>. No fuerces ningún movimiento que provoque molestias importantes.','Realiza los ejercicios de forma <u>controlada</u>, evitando movimientos bruscos y respetando los tiempos de descanso indicados.'];
function pdfR(i){const trainer=ROLE==='trainer';const c=trainer?window._c:MYC;const rs=trainer?c.routines:((MYC&&MYC.data&&MYC.data.routines)||[]);let r=rs[i];if(i==='all'){let off=0;r={items:[]};rs.forEach(x=>{let m=0;x.items.forEach(e=>{const d=(e.d||1)+off;m=Math.max(m,e.d||1);r.items.push({...e,d})});off+=m})}if(!r)return;
const goal=trainer?(c.goal||''):((MYC.data&&MYC.data.goal)||'');
const days={};r.items.forEach(e=>{const k=e.d||1;(days[k]=days[k]||[]).push(e)});
const tabs=Object.keys(days).sort((x,y)=>x-y).map(k=>{const m=dmeta(days[k],1)&&{t:(days[k].find(e=>e.dn)||{}).dn||'',sm:days[k].some(e=>e.sm)};const nm=e=>`${e.xid?`<a onclick="pvOpen('${esc(e.xid)}')">${esc(e.n)}</a>`:esc(e.n)}${e.note?`<div class="nt">${esc(e.note)}</div>`:''}`;const head=`<h3>TABLA DE EJERCICIOS DÍA ${k}:${m.t?' '+esc(m.t):''}</h3>`;
if(m.sm)return`<div class="pvt">${head}<table><thead><tr><th class="l">EJERCICIO</th><th>REPETICIONES</th></tr></thead><tbody>${days[k].map(e=>`<tr><td class="l">${nm(e)}</td><td>${esc(e.r)}</td></tr>`).join('')}</tbody></table></div>`;
return`<div class="pvt">${head}<table><thead><tr><th class="l">EJERCICIO</th><th>SERIES</th><th>REPS</th><th>DESCANSO</th><th>PESO / CARGA</th></tr></thead><tbody>${days[k].map(e=>`<tr><td class="l">${nm(e)}</td><td>${esc(e.s)}</td><td>${esc(e.r)}</td><td>${esc(e.rest||'')}</td><td>${esc(e.load||'-')}</td></tr>`).join('')}</tbody></table></div>`}).join('');
const blank=Array.from({length:14},()=>'<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('');
const old=$('#pv');if(old)old.remove();const d=document.createElement('div');d.id='pv';
d.innerHTML=`<div class="pvbar"><button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button> <button class="btn ghost" onclick="pvClose()">Cerrar</button></div>
<div class="pvdoc"><table class="pvw"><thead><tr><td class="pvhead">RRG FIT &nbsp;•&nbsp; PLAN DE ENTRENAMIENTO</td></tr></thead><tfoot><tr><td class="pvfoot">@rrg_fit &nbsp;|&nbsp; rrgfit.es &nbsp;|&nbsp; ENTRENAMIENTO PERSONALIZADO</td></tr></tfoot><tbody><tr><td><div class="pvp"><div class="pvtop"><img src="logo.png" alt=""><h1>PLAN DE ENTRENAMIENTO</h1></div>
<p class="pvcl"><b>CLIENTE:</b> <u>${esc(c.name||'')}</u> &nbsp;&nbsp;&nbsp; <b>FECHA:</b> <u>${new Date().toLocaleDateString('es-ES')}</u></p>
<h4>OBJETIVO:</h4>${(goal.trim()||DEFOBJ).split(/\n+/).filter(x=>x.trim()).map(x=>`<p>${esc(x)}</p>`).join('')}
<h4>CALENTAMIENTO ANTES DE CADA ENTRENAMIENTO:</h4><p>Realizar entre 5 y 10 minutos de movilidad articular general antes de comenzar el entrenamiento, preparando progresivamente el cuerpo para los ejercicios.</p><p>Si lo necesitas, puedes pedirme un vídeo del calentamiento general que suelo realizar y te lo enviaré sin problema.</p>
<h4>OBSERVACIONES:</h4><ul>${OBS.map(x=>`<li>${x}</li>`).join('')}</ul></div>
<div class="pvp">${tabs}</div>
<div class="pvp"><h3>REGISTRO DE PROGRESIÓN DE CARGAS</h3><p>Utiliza esta tabla para registrar los pesos utilizados en cada ejercicio y llevar un seguimiento de tu evolución.</p><p>A medida que vayas ganando fuerza y mejorando tu técnica, podrás aumentar progresivamente las cargas.</p><p>Es normal que, al aumentar el peso, tengas que reducir el número de repeticiones. El objetivo será ir recuperando poco a poco las repeticiones que realizabas con la carga anterior y, una vez conseguidas, volver a aumentar el peso.</p><p><b>Ejemplo:</b> Si realizas 15 repeticiones de press de banca con 40 kg, puedes probar a subir a 45 kg y realizar 10-12 repeticiones. Cuando consigas completar nuevamente las 15 repeticiones con 45 kg, podrás valorar otro aumento de peso, aunque inicialmente hagas menos repeticiones.</p><p><b>Recuerda:</b> No tengas prisa por aumentar las cargas. Prioriza siempre una buena técnica, movimientos controlados y una progresión adaptada a tus capacidades, sin provocar dolor. No es necesario subir el peso en todos los entrenamientos.</p>
<table class="pvr"><thead><tr><th>FECHA</th><th class="l">EJERCICIO</th><th>SERIE 1</th><th>SERIE 2</th><th>SERIE 3</th><th>SERIE 4</th></tr></thead><tbody>${blank}</tbody></table></div></td></tr></tbody></table></div>`;
document.body.appendChild(d);document.body.classList.add('pvon');window.scrollTo(0,0)}
function pvClose(){const e=$('#pv');if(e)e.remove();document.body.classList.remove('pvon')}
function pvOpen(id){pvClose();go('#/ejercicio/'+id)}
function exLink(e){return e.xid?`<a class="exl" onclick="go('#/ejercicio/${esc(e.xid)}')">${esc(e.n)} <span class="tag red">ver ▶</span></a>`:esc(e.n)}
function pkSearch(v){const el=$('#pk');if(!window.EX){el.innerHTML='<div class="mut">Cargando lista…</div>';setTimeout(()=>{if(window.EX)pkSearch($('#pk_q').value)},800);return}
const t=nrm(v).split(/\s+/).filter(Boolean);if(!t.length){el.innerHTML='';return}
const l=window.EX.filter(r=>{if(!r._h)r._h=nrm(r[1]+' '+r[2]+' '+r[3].join(' ')+' '+r[4]);return t.every(x=>r._h.includes(x))}).slice(0,8);
el.innerHTML=l.map(r=>`<div class="card row click" onclick="pkAdd('${r[0]}')"><img class="exth" src="${IMG}${r[6]}" alt=""><div style="flex:1;min-width:0"><b>${esc(r[1])}</b><div class="mut">${esc(r[3].join(', '))} · ${esc(r[4])}</div></div><span class="tag red">+</span></div>`).join('')||'<div class="mut">Nada encontrado</div>'}
function pkAdd(id){const r=window.EX.find(x=>x[0]===id);if(!r)return;window._r.items.push(newItem({n:r[1],xid:id}));rerender();toast('Añadido: '+r[1])}
function addEx(){const n=$('#ex_n').value.trim();if(!n)return;window._r.items.push(newItem({n}));rerender()}
function saveR(){if(!window._r.name.trim())return toast('Pon un nombre');const r=window._r;const i=S.routines.findIndex(x=>x.id===r.id);if(i<0)S.routines.push(r);else S.routines[i]=r;save();toast('Guardada');go('#/rutinas')}
function delR(){if(!confirm('¿Borrar la rutina? Las ya asignadas se mantienen.'))return;S.routines=S.routines.filter(x=>x.id!==window._r.id);save();go('#/rutinas')}

let CAL=null;
const pad=n=>String(n).padStart(2,'0');
const lday=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
function calGo(n){CAL.m+=n;if(CAL.m<0){CAL.m=11;CAL.y--}if(CAL.m>11){CAL.m=0;CAL.y++}render()}
function calSel(d){CAL.sel=d;render()}
function calToday(){const n=new Date();CAL={y:n.getFullYear(),m:n.getMonth(),sel:lday(n)};render()}
function vAgenda(){const n=new Date();if(!CAL)CAL={y:n.getFullYear(),m:n.getMonth(),sel:lday(n)};
const up=S.sessions.filter(s=>!s.done&&s.dt>=lday(n)).sort((a,b)=>a.dt.localeCompare(b.dt));
const first=new Date(CAL.y,CAL.m,1),off=(first.getDay()+6)%7,dim=new Date(CAL.y,CAL.m+1,0).getDate(),td=lday(n);
const cnt={};S.sessions.forEach(x=>{const k=x.dt.slice(0,10);cnt[k]=(cnt[k]||0)+1});
const mn=first.toLocaleString('es-ES',{month:'long',year:'numeric'});
let cells=['L','M','X','J','V','S','D'].map(x=>`<div class="cw">${x}</div>`).join('');
for(let i=0;i<off;i++)cells+='<div></div>';
for(let d=1;d<=dim;d++){const k=CAL.y+'-'+pad(CAL.m+1)+'-'+pad(d);const c=cnt[k]||0;cells+=`<button class="cd${k===td?' td':''}${k===CAL.sel?' sel':''}" onclick="calSel('${k}')">${d}${c?`<i>${c}</i>`:''}</button>`}
const ds=S.sessions.filter(x=>x.dt.slice(0,10)===CAL.sel).sort((a,b)=>a.dt.localeCompare(b.dt));
const sd=new Date(CAL.sel+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
const def=CAL.sel+'T'+(CAL.sel===td?pad(Math.min(23,n.getHours()+1))+':00':'10:00');
const sr=s=>{const c=cl(s.clientId);return`<div class="card row"><div><b>${s.dt.slice(11,16)} · ${esc(c?c.name:'?')}</b><div class="mut">${esc(s.service)}${s.done?' · hecha':''}</div></div><div>${s.done?'':`<button class="btn sm" onclick="doneS('${s.id}')">✓</button> `}<button class="btn del sm" onclick="delS('${s.id}')">✕</button></div></div>`};
return`<h2>Agenda</h2><div class="card"><div class="row"><button class="btn ghost sm" onclick="calGo(-1)">‹</button><b>${mn[0].toUpperCase()+mn.slice(1)}</b><button class="btn ghost sm" onclick="calGo(1)">›</button></div><div class="cal">${cells}</div><button class="btn ghost sm" style="margin-top:8px" onclick="calToday()">Hoy</button></div>
<h3>${sd[0].toUpperCase()+sd.slice(1)}</h3>${ds.map(sr).join('')||'<div class="empty">Nada este día</div>'}
<div class="card"><label>Añadir sesión</label><select id="a_c">${S.clients.filter(c=>c.active!==false).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')||'<option value="">(crea un cliente antes)</option>'}</select>
<div class="g2"><div><label>Fecha y hora</label><input id="a_d" type="datetime-local" value="${def}"></div><div><label>Servicio</label><select id="a_s">${SERV.map(s=>`<option>${s}</option>`).join('')}</select></div></div><button class="btn" onclick="addS()">Añadir sesión</button></div>
<h3>Próximas</h3>${up.map(s=>{const c=cl(s.clientId);return`<div class="card row"><div><b>${esc(c?c.name:'?')}</b><div class="mut">${fdate(s.dt)} · ${esc(s.service)}</div></div><div><button class="btn sm" onclick="doneS('${s.id}')">✓</button> <button class="btn del sm" onclick="delS('${s.id}')">✕</button></div></div>`}).join('')||'<div class="empty">Sin sesiones</div>'}`}

const IMG='https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
let EXQ='',EXM='',EXN=60;
const nrm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function loadEX(){if(window.EX||window._exl)return;window._exl=1;const e=document.createElement('script');e.src='ex.js';e.onload=()=>{if(/^#\/ejercicio/.test(location.hash))render(true)};e.onerror=()=>{window._exl=0};document.head.appendChild(e)}
function exFilter(){if(!window.EX)return[];const t=nrm(EXQ).split(/\s+/).filter(Boolean);return window.EX.filter(r=>{if(EXM&&!r[3].includes(EXM))return false;if(!t.length)return true;if(!r._h)r._h=nrm(r[1]+' '+r[2]+' '+r[3].join(' ')+' '+r[4]);return t.every(x=>r._h.includes(x))})}
function exCard(r){return`<div class="card row click" onclick="go('#/ejercicio/${r[0]}')"><img class="exth" loading="lazy" src="${IMG}${r[6]}" alt=""><div style="flex:1;min-width:0"><b>${esc(r[1])}</b><div class="mut">${esc(r[2])}</div><div class="mut">${esc(r[3].join(', '))} · ${esc(r[4])}</div></div></div>`}
function exList(){const l=exFilter();const sh=l.slice(0,EXN);let h='',L='';sh.forEach(r=>{const c=r[1][0].toUpperCase();if(c!==L){L=c;h+=`<h3>${esc(c)}</h3>`}h+=exCard(r)});
if(!window.EX)h='<div class="empty">Cargando ejercicios…</div>';else if(!l.length)h='<div class="empty">No encuentro ese ejercicio. Prueba con otra palabra (por ejemplo "sentadilla" o "press").</div>';
if(l.length>EXN)h+=`<button class="btn ghost" style="width:100%" onclick="EXN+=60;exUp()">Mostrar más (${l.length-EXN})</button>`;
return `<div class="mut" style="margin-bottom:8px">${window.EX?l.length+' ejercicios':''}</div>`+h}
function exUp(){const e=$('#exl');if(e)e.innerHTML=exList()}
function exSearch(v){EXQ=v;EXN=60;exUp()}
function exMus(v){EXM=v;EXN=60;exUp()}
function vEjer(){loadEX();const ms=['abdominales','abductores','aductores','antebrazos','bíceps','cuello','cuádriceps','dorsales','espalda media','gemelos','glúteos','hombros','isquiotibiales','lumbar','pecho','trapecio','tríceps'];
return`<h2>Ejercicios</h2><input id="exq" type="search" placeholder="Buscar ejercicio (ej: press militar)" value="${esc(EXQ)}" oninput="exSearch(this.value)" autocomplete="off"><select onchange="exMus(this.value)"><option value="">Todos los músculos</option>${ms.map(m=>`<option${m===EXM?' selected':''}>${m}</option>`).join('')}</select><div id="exl">${exList()}</div>`}
function vEjerDet(id){loadEX();if(!window.EX)return'<div class="empty">Cargando…</div>';const r=window.EX.find(x=>x[0]===id);if(!r)return'<div class="empty">Ejercicio no encontrado</div><button class="btn ghost" onclick="go(\'#/ejercicios\')">Volver</button>';
return`<button class="btn ghost sm" onclick="history.back()">‹ Volver</button><h2 style="margin-top:12px">${esc(r[1])}</h2><div class="mut">${esc(r[2])}</div>
<div class="exan card"><img src="${IMG}${r[6]}" alt="${esc(r[1])}, posición inicial"><img class="b" src="${IMG}${r[7]}" alt="${esc(r[1])}, posición final"></div>
<div class="card"><span class="tag red">${esc(r[3].join(', '))}</span><span class="tag">${esc(r[4])}</span><span class="tag">${esc(r[5])}</span></div>`}
function addS(){const c=$('#a_c').value,d=$('#a_d').value;if(!c||!d)return toast('Falta cliente o fecha');S.sessions.push({id:uid(),clientId:c,dt:d,service:$('#a_s').value,done:false});if(CAL)CAL.sel=d.slice(0,10);save();toast('Sesión añadida');render()}
function delS(id){S.sessions=S.sessions.filter(s=>s.id!==id);save();render()}
function accesoCard(c){
 if(c.user_id)return`<h3>Acceso a la app</h3><div class="card"><div>✅ Tiene acceso con <b>${esc(c.email||'su email')}</b></div><div class="mut">${c.consent_at?'Ha aceptado la política de privacidad el '+new Date(c.consent_at).toLocaleDateString('es-ES'):'Aún no ha aceptado la política de privacidad (la verá al entrar).'}</div><div class="mut">Si olvida la contraseña, puede pedir una nueva con "¿Olvidaste tu contraseña?" en la pantalla de entrada.</div><br>
${c.phone?`<a class="btn wa" onclick="contacted('${c.id}')" href="https://wa.me/${waNum(c.phone)}" target="_blank">WhatsApp</a> `:''}<button class="btn del" onclick="unlinkAccess('${c.id}')">Quitar acceso</button></div>`;
 return`<h3>Acceso a la app</h3><div class="card"><div class="mut">Crea su usuario y contraseña. Tú se los pasas al cliente; verá sus rutinas, sesiones y bono al momento. Tus notas y lesiones no las ve.</div><br>
<label>Email del cliente</label><input id="ac_e" type="email" inputmode="email" value="${esc(c.email||'')}"><label>Contraseña (mínimo 8 caracteres)</label><input id="ac_p" type="text" autocomplete="off">
<button class="btn" onclick="createAccess('${c.id}')">Crear acceso</button> ${c.phone?`<a class="btn wa" href="https://wa.me/${waNum(c.phone)}" target="_blank">WhatsApp</a>`:''}</div>`}
async function createAccess(id){const c=cl(id);const email=$('#ac_e').value.trim().toLowerCase(),password=$('#ac_p').value;
 if(!/^\S+@\S+\.\S+$/.test(email))return toast('Email no válido');if(password.length<8)return toast('La contraseña necesita 8 caracteres o más');
 const sb2=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const{data,error}=await sb2.auth.signUp({email,password});
 if(error)return toast('No se pudo crear: '+error.message);
 if(!data.user||(data.user.identities&&data.user.identities.length===0))return toast('Ese email ya tiene una cuenta');
 c.user_id=data.user.id;c.email=email;save();toast('Acceso creado');render()}
function unlinkAccess(id){if(!confirm('El cliente dejará de ver sus datos. ¿Quitar acceso?'))return;const c=cl(id);c.user_id=null;save();render()}
function vAjustes(){return`<h2>Ajustes</h2><div class="card"><label>Tu nombre</label><input id="s_n" value="${esc(S.settings.name||'')}"><label>Tu WhatsApp (con prefijo, ej. 34636497426)</label><input id="s_w" inputmode="tel" value="${esc(S.settings.wa||'')}"><button class="btn" onclick="saveSet()">Guardar</button></div>
<h3>Tus datos</h3><div class="card"><div class="mut">Se guardan en la nube (servidores en la UE) y los ves desde cualquier móvil entrando con tu email. Descarga una copia cuando quieras.</div><br><button class="btn" onclick="exportD()">Descargar copia</button></div>
<h3>Cuenta</h3><div class="card"><div class="mut">${esc(ME&&ME.email)}</div><br><button class="btn ghost" onclick="logout()">Cerrar sesión</button> <a class="btn ghost" href="#/privacidad">Política de privacidad</a></div>
<h3>Instalar</h3><div class="card mut">iPhone: Safari → Compartir → Añadir a pantalla de inicio. Android: menú ⋮ → Instalar app.</div>`}
function saveSet(){S.settings.name=$('#s_n').value;S.settings.wa=$('#s_w').value.replace(/[^\d]/g,'');S.clients.forEach(c=>c._t=1);snap.clients={};save();toast('Guardado')}
function exportD(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='rrgfit-copia-'+today()+'.json';a.click()}

const POLICY=`<h2>Política de privacidad</h2><div class="card legal">
<p class="mut">Versión ${POLICY_V}</p>
<h3>Quién es el responsable</h3><p>Raquel Rodríguez Gómez (RRG FIT), NIF 50250597J. Dirección: Antonio Celedonio Lorente nº3, 28600 Madrid. Email de contacto: rrgfit.coach@gmail.com.</p>
<h3>Qué datos tratamos</h3><p>Nombre, teléfono y email; objetivo de entrenamiento; datos de salud y condición física que tú o tu entrenadora anotáis (lesiones, peso, medidas); rutinas asignadas, planes de alimentación (dietas) que tu entrenadora te prepara, sesiones, bonos y notas de seguimiento.</p>
<h3>Para qué</h3><p>Prestar el servicio de entrenamiento personal: preparar y asignar rutinas, gestionar sesiones y bonos y que puedas ver tu plan en la app.</p>
<h3>Base legal</h3><p>La ejecución del servicio que contratas (art. 6.1.b RGPD) y, para los datos de salud, tu consentimiento explícito (art. 9.2.a RGPD), que das al aceptar esta política y puedes retirar cuando quieras.</p>
<h3>Quién ve tus datos</h3><p>Solo tu entrenadora. Tú ves únicamente tus propios datos en la app. Las lesiones y notas médicas las ve solo ella, no se muestran en tu pantalla. Tu dieta la ven solo tú y ella. Para guardar los datos usamos Supabase como proveedor (encargado del tratamiento), con servidores en París (UE). La web se aloja en GitHub Pages, que no recibe tus datos personales. Además, tu entrenadora guarda una copia de seguridad semanal de los datos en una carpeta privada de su cuenta de Google Drive (Google actúa como proveedor de almacenamiento), y conserva las últimas 8 semanas.</p>
<h3>Cuánto tiempo</h3><p>Mientras dure la relación con tu entrenadora. Después, los datos se borran, salvo lo que la ley obligue a conservar.</p>
<h3>Tus derechos</h3><p>Puedes pedir acceso, rectificación, supresión, limitación, oposición y portabilidad de tus datos, y retirar tu consentimiento, escribiendo a rrgfit.coach@gmail.com. En la app puedes descargar tus datos. Si crees que no tratamos bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
</div>`;
function vPolicy(){return`<button class="btn ghost sm" onclick="history.back()">← Volver</button>${POLICY}`}

function vLogin(){if(RECOVERY)return`<div class="hero"><img src="logo.png" alt="RRG"></div><h2>Nueva contraseña</h2><div class="card"><label>Escribe tu nueva contraseña</label><input id="np" type="password" autocomplete="new-password"><button class="btn" onclick="doNewPass()">Guardar</button></div>`;
return`<div class="hero"><img src="logo.png" alt="RRG Personal Trainer"></div><h2>Entrar</h2><div class="card"><label>Email</label><input id="l_e" type="email" inputmode="email" autocomplete="username"><label>Contraseña</label><input id="l_p" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"><button class="btn" onclick="doLogin()">Entrar</button><br><br><a href="#" class="mut" onclick="doForgot();return false">¿Olvidaste tu contraseña?</a></div><p class="mut" style="text-align:center"><a href="#/privacidad" class="mut">Política de privacidad</a></p>`}
function vConsent(){return`<div class="hero"><img src="logo.png" alt="RRG"></div>${POLICY}<div class="card"><label style="text-transform:none;font-size:14px;color:var(--tx)"><input type="checkbox" id="cons" style="width:auto"> He leído la política de privacidad y consiento el tratamiento de mis datos de salud para recibir el servicio.</label><br><br><button class="btn" onclick="acceptPolicy()">Aceptar y entrar</button> <button class="btn ghost" onclick="logout()">Salir</button></div>`}
async function acceptPolicy(){if(!$('#cons').checked)return toast('Marca la casilla para continuar');const{error}=await sb.rpc('accept_privacy',{v:POLICY_V});if(error)return toast('No se pudo guardar');await loadClient();render()}
async function refreshClient(){if(ROLE==='client'&&!document.hidden){try{await loadClient();const act=document.activeElement;if(!act||act.tagName==='BODY')render(true)}catch(e){}}}
function calClient(){const n=new Date();if(!CAL)CAL={y:n.getFullYear(),m:n.getMonth(),sel:lday(n)};const td=lday(n);
const first=new Date(CAL.y,CAL.m,1),off=(first.getDay()+6)%7,dim=new Date(CAL.y,CAL.m+1,0).getDate();
const cnt={};MYS.forEach(x=>{const k=x.dt.slice(0,10);cnt[k]=(cnt[k]||0)+1});
const mn=first.toLocaleString('es-ES',{month:'long',year:'numeric'});
let cells=['L','M','X','J','V','S','D'].map(x=>`<div class="cw">${x}</div>`).join('');
for(let i=0;i<off;i++)cells+='<div></div>';
for(let d=1;d<=dim;d++){const k=CAL.y+'-'+pad(CAL.m+1)+'-'+pad(d);const c=cnt[k]||0;cells+=`<button class="cd${k===td?' td':''}${k===CAL.sel?' sel':''}" onclick="calSel('${k}')">${d}${c?`<i>${c}</i>`:''}</button>`}
const ds=MYS.filter(x=>x.dt.slice(0,10)===CAL.sel).sort((a,b)=>a.dt.localeCompare(b.dt));
const sd=new Date(CAL.sel+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
return`<div class="card"><div class="row"><button class="btn ghost sm" onclick="calGo(-1)">‹</button><b>${mn[0].toUpperCase()+mn.slice(1)}</b><button class="btn ghost sm" onclick="calGo(1)">›</button></div><div class="cal">${cells}</div><button class="btn ghost sm" style="margin-top:8px" onclick="calToday()">Hoy</button></div>
<div class="mut" style="margin:6px 2px">${sd[0].toUpperCase()+sd.slice(1)}</div>${ds.map(x=>`<div class="card"><b>${x.dt.slice(11,16)} · ${esc(x.service||'Sesión')}</b>${x.done?'<div class="mut">Hecha</div>':''}</div>`).join('')||'<div class="empty" style="padding:14px">Sin sesión este día</div>'}`}
function vCliente(){if(!MYC)return`<h2>Hola</h2><div class="card">Tu entrenadora aún no ha vinculado tu cuenta. Escríbele y lo arregla.</div><button class="btn ghost" onclick="logout()">Salir</button>`;
if(MYC.consent_at==null||MYC.consent_version!==POLICY_V)return vConsent();
loadEX();const hh=location.hash.replace(/^#\/?/,'').split('/');if(hh[0]==='ejercicio')return vEjerDet(hh[1]);
const d=MYC.data||{},nx=MYS.filter(s=>!s.done&&s.dt>=new Date().toISOString().slice(0,16)).sort((a,b)=>a.dt.localeCompare(b.dt))[0],b=d.bono||{total:0,used:0};
return`<h2>Hola, ${esc(MYC.name.split(' ')[0])}</h2>
<div class="card"><div class="mut">Próxima sesión</div>${nx?`<div class="big" style="font-size:22px">${fdate(nx.dt)}</div><div class="mut">${esc(nx.service||'')}</div>`:'<div>Aún sin fecha. Escríbeme y la fijamos.</div>'}</div>
${b.total?`<div class="card"><div class="mut">Tu bono</div><b>Te quedan ${Math.max(0,b.total-b.used)} de ${b.total} sesiones</b><div class="bono"><i style="width:${Math.max(0,b.total-b.used)/b.total*100}%"></i></div></div>`:''}
<h3>Tu calendario</h3>${calClient()}
<h3>Tus rutinas</h3>${(d.routines||[]).length>1?'<button class="btn sm" onclick="pdfR(\'all\')">PDF con todas las rutinas juntas</button>':''}${(d.routines||[]).map((r,ri)=>`<div class="card"><div class="row"><b>${esc(r.name)}</b><button class="btn ghost sm" onclick="pdfR(${ri})">PDF / imprimir</button></div>${r.items.map((e,ei)=>`<div class="ex">${exLink(e)}<div class="mut">${(e.d>1||e.dn)?'Día '+(e.d||1)+(e.dn?' ('+esc(e.dn)+')':'')+' · ':''}${e.s} series x ${esc(e.r)}${e.rest?' · descanso '+esc(e.rest):''}${e.load&&e.load!=='-'?' · '+esc(e.load):''} ${esc(e.note||'')}</div>${e.sm?'':xlBox(e,ri,ei)}</div>`).join('')}</div>`).join('')||'<div class="empty">Todavía no tienes rutinas.</div>'}
${MYD.length?`<h3>Mi dieta</h3>${MYD.map(x=>`<div class="card"><div class="row"><b>${esc(x.title)}</b><span class="mut">${new Date(x.d+'T12:00').toLocaleDateString('es-ES')}</span></div>${x.body?`<div style="white-space:pre-wrap;margin-top:6px">${esc(x.body)}</div>`:''}${x.file_name?`<button class="btn sm" style="margin-top:8px" onclick="openDiet('${x.id}')">Ver / descargar PDF</button>`:''}</div>`).join('')}`:''}
${d.tracking?`<h3>Tu seguimiento</h3><div class="card"><div class="mut">Anota tu peso y tu cintura cuando te lo pida tu entrenadora.</div>${chart(mergeM(d.measures,MYW.filter(x=>!x.exercise)).filter(m=>m.w),'w','kg')}<div class="g2" style="margin-top:8px"><div><label>Peso (kg)</label><input id="w_w" type="number" step="0.1" inputmode="decimal"></div>${MEAS.map(([k,l])=>`<div><label>${l} (cm)</label><input id="w_${k}" type="number" step="0.5" inputmode="decimal"></div>`).join('')}</div><label>Fecha</label><input id="w_d" type="date" value="${today()}"><br><br><button class="btn sm" onclick="addWL()">Guardar registro</button>${MYW.filter(x=>!x.exercise).slice(0,8).map(m=>`<div class="ex mut">${fmtL(m)} <a onclick="delWL('${m.id}')" style="color:#e8731a;cursor:pointer">borrar</a></div>`).join('')}</div>`:''}
${d.wa?`<p><a class="btn wa" href="https://wa.me/${d.wa}?text=${encodeURIComponent('Hola '+(d.t||'')+', soy '+MYC.name)}" target="_blank">Escribir a ${esc(d.t||'mi entrenadora')} por WhatsApp</a></p>`:''}
<p><button class="btn ghost sm" onclick="dlMine()">Descargar mis datos</button> <a class="btn ghost sm" href="#/privacidad">Privacidad</a> <button class="btn ghost sm" onclick="logout()">Salir</button></p>`}
function dlMine(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({cliente:MYC,sesiones:MYS},null,1)],{type:'application/json'}));a.download='mis-datos-rrgfit.json';a.click()}

function render(keep){const h=location.hash.replace(/^#\/?/,'');const [p,a]=h.split('/');
const y=window.scrollY;const trainer=ROLE==='trainer';
$('#nav').style.display=trainer&&p!=='privacidad'?'flex':'none';
if(!trainer)$('#sub').textContent=ME?'Tu entrenamiento':'';
const sec=p===''?'':(p==='cliente'?'clientes':p==='rutina'?'rutinas':p==='ejercicio'?'ejercicios':p);
$('#nav').innerHTML=nav.map(n=>`<button class="${sec===n[0]?'on':''}" onclick="go('#/${n[0]}')"><b>${n[1]}</b>${n[2]}</button>`).join('');
let v;if(p==='privacidad')v=vPolicy();else if(!ME||RECOVERY)v=vLogin();else if(ROLE==='client')v=vCliente();else if(ROLE!=='trainer')v='<div class="empty">Cargando…</div>';else if(p==='clientes')v=vClientes();else if(p==='cliente')v=vFicha(a);else if(p==='seguimiento')v=vSeg();else if(p==='rutinas')v=vRutinas();else if(p==='rutina')v=vRutina(a);else if(p==='agenda')v=vAgenda();else if(p==='ejercicios')v=vEjer();else if(p==='ejercicio')v=vEjerDet(a);else if(p==='ajustes')v=vAjustes();else v=vInicio();
$('#app').innerHTML=v;if(keep===true)window.scrollTo(0,y);else window.scrollTo(0,0)}
addEventListener('hashchange',()=>render());
setInterval(refreshClient,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshClient()});
boot();
const APPV='20261125-2000';
async function chkVer(){try{const t=await (await fetch('app.js',{cache:'no-store'})).text();const m=t.match(/const APPV='([^']+)'/);if(m&&m[1]!==APPV){if(sessionStorage.getItem('rv')!==m[1]){sessionStorage.setItem('rv',m[1]);location.reload()}}}catch(e){}}
chkVer();document.addEventListener('visibilitychange',()=>{if(!document.hidden)chkVer()});
if('serviceWorker'in navigator&&location.protocol.startsWith('http')){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{r.update();document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update()})}).catch(()=>{});let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(rl)return;rl=true;location.reload()})}

// ---- dietas
function b64blob(b64,type){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type})}
async function openDiet(id){const{data,error}=await sb.from('diets').select('file_b64,file_name').eq('id',id).single();if(error||!data||!data.file_b64)return toast('No se pudo abrir');const a=document.createElement('a');a.href=URL.createObjectURL(b64blob(data.file_b64,'application/pdf'));a.target='_blank';a.download=data.file_name||'dieta.pdf';document.body.appendChild(a);a.click();a.remove()}
async function loadDiets(cid){const el=$('#dietas');if(!el)return;const{data,error}=await sb.from('diets').select('id,title,d,body,file_name').eq('client_id',cid).order('d',{ascending:false});if(!$('#dietas'))return;if(error){el.innerHTML='<div class="empty">No se pudieron cargar las dietas</div>';return}
 el.innerHTML=(data||[]).map(x=>`<div class="card"><div class="row"><b>${esc(x.title)}</b><span class="mut">${new Date(x.d+'T12:00').toLocaleDateString('es-ES')}</span></div>${x.body?`<div class="mut" style="white-space:pre-wrap">${esc(x.body.slice(0,200))}${x.body.length>200?'…':''}</div>`:''}<div style="margin-top:6px">${x.file_name?`<button class="btn ghost sm" onclick="openDiet('${x.id}')">Ver PDF (${esc(x.file_name)})</button> `:''}<button class="btn del sm" onclick="delDiet('${x.id}','${cid}')">Borrar</button></div></div>`).join('')||'<div class="empty">Sin dietas</div>'
 +`<div class="card"><label>Título</label><input id="d_t" placeholder="Ej: Dieta noviembre"><label>Fecha</label><input id="d_d" type="date" value="${today()}"><label>Texto (opcional)</label><textarea id="d_b" rows="4" placeholder="Puedes escribir la dieta aquí y/o subir un PDF"></textarea><label>PDF (opcional, máx. 3 MB)</label><input id="d_f" type="file" accept="application/pdf"><br><br><button class="btn sm" onclick="addDiet('${cid}')">Subir dieta</button></div>`}
async function addDiet(cid){const t=$('#d_t').value.trim();if(!t)return toast('Pon un título');const b=$('#d_b').value.trim();const f=$('#d_f').files[0];if(!b&&!f)return toast('Escribe el texto o sube un PDF');if(f&&f.size>3*1024*1024)return toast('El PDF pesa más de 3 MB');
 let b64=null,fn=null;if(f){if(f.type!=='application/pdf'&&!/\.pdf$/i.test(f.name))return toast('Solo PDF');b64=await new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=ko;r.readAsDataURL(f)});fn=f.name}
 const{error}=await sb.from('diets').insert({client_id:cid,title:t,d:$('#d_d').value||today(),body:b||null,file_name:fn,file_b64:b64});if(error){console.error(error);return toast('No se pudo guardar')}toast('Dieta subida');loadDiets(cid)}
async function delDiet(id,cid){if(!confirm('¿Borrar esta dieta?'))return;const{error}=await sb.from('diets').delete().eq('id',id);if(error)return toast('No se pudo borrar');loadDiets(cid)}

// ---- seguimiento nutricional
const mergeM=(m,w)=>[...(m||[]).map(x=>({d:x.d,w:x.w,c:x.c})),...(w||[]).map(x=>({d:x.d,w:x.weight,c:x.waist}))].sort((a,b)=>a.d.localeCompare(b.d));
const xk=e=>String(e.n||'').trim().toLowerCase();
const xlLast=e=>MYW.filter(x=>x.exercise&&String(x.exercise).trim().toLowerCase()===xk(e)).sort((a,b)=>b.d.localeCompare(a.d)||String(b.created_at).localeCompare(String(a.created_at)));
function xlBox(e,ri,ei){const L=xlLast(e);const l=L[0];return`<div class="row" style="margin-top:4px;gap:6px"><span class="mut" style="font-size:12px">${l?'Última vez: '+l.weight+' kg ('+new Date(l.d+'T12:00').toLocaleDateString('es-ES')+')':'Sin peso anotado'}</span><span><input id="xl_${ri}_${ei}" type="number" step="0.5" inputmode="decimal" placeholder="kg" style="width:70px"> <button class="btn ghost sm" onclick="addXL(${ri},${ei})">Anotar</button></span></div>`}
async function addXL(ri,ei){const e=((MYC.data||{}).routines||[])[ri].items[ei];const v=$('#xl_'+ri+'_'+ei).value;const n=+v;if(v===''||!(n>0&&n<=500))return toast('Escribe el peso en kg');const{error}=await sb.from('weight_logs').insert({client_id:MYC.id,exercise:String(e.n).trim(),d:today(),weight:n});if(error){console.error(error);return toast('No se pudo guardar')}toast('Peso anotado');await loadClient();render(true)}
const MEAS=[['cintura','Cintura'],['cadera','Cadera'],['gluteo','Glúteo'],['pecho','Pecho'],['brd','Brazo derecho'],['bri','Brazo izquierdo'],['mud','Muslo derecho'],['mui','Muslo izquierdo']];
const gv=(x,k)=>k==='cintura'?x.waist:(x.m||{})[k];
const fmtL=x=>new Date(x.d+'T12:00').toLocaleDateString('es-ES')+': '+[x.weight!=null?'peso '+x.weight+' kg':null,...MEAS.map(([k,l])=>gv(x,k)!=null?l.toLowerCase()+' '+gv(x,k)+' cm':null)].filter(Boolean).join(' · ');
function cmpL(L){const A=[...L].sort((a,b)=>a.d.localeCompare(b.d));if(A.length<2)return'';const f=(k,g)=>{const v=A.filter(x=>g(x)!=null);if(v.length<2)return null;const a=g(v[0]),b=g(v[v.length-1]);return[b,b-a]};
 const rows=[['Peso (kg)',x=>x.weight],...MEAS.map(([k,l])=>[l+' (cm)',x=>gv(x,k)])].map(([l,g])=>{const r=f(l,g);return r?`<div class="ex"><span class="mut">${l}</span> ${r[0]} <span class="mut">(${r[1]>0?'+':''}${r[1].toFixed(1)} desde el primero)</span></div>`:''}).join('');return rows?`<div style="margin:6px 0"><b>Evolución</b>${rows}</div>`:''}
async function addWL(){const d=$('#w_d').value||today();const w=$('#w_w').value;if(w&&!(+w>=20&&+w<=400))return toast('Revisa tu peso (kg)');const row={client_id:MYC.id,d,weight:w?+w:null,waist:null,m:{}};let any=!!w;
 for(const[k]of MEAS){const v=$('#w_'+k).value;if(v===''||v==null)continue;const n=+v;if(!(n>=10&&n<=250))return toast('Revisa las medidas (cm)');any=true;if(k==='cintura')row.waist=n;else row.m[k]=n}
 if(!any)return toast('Escribe tu peso o alguna medida');const{error}=await sb.from('weight_logs').insert(row);if(error){console.error(error);return toast('Revisa los valores')}toast('Registro guardado');await loadClient();render(true)}
async function delWL(id){if(!confirm('¿Borrar este registro?'))return;await sb.from('weight_logs').delete().eq('id',id);await loadClient();render(true)}
async function loadWL(c){const el=$('#wlogs');if(!el)return;const{data,error}=await sb.from('weight_logs').select('*').eq('client_id',c.id).order('d',{ascending:false});if(!$('#wlogs'))return;if(error){el.innerHTML='';return}
 const B=(data||[]).filter(x=>!x.exercise),X=(data||[]).filter(x=>x.exercise);let h='';
 if(c.tracking){const ch=$('#wchart');if(ch)ch.innerHTML=chart(mergeM(c.measures,B).filter(m=>m.w),'w','kg');
  h+=`<div class="card"><b>Lo que ha anotado el cliente (peso y medidas)</b>${cmpL(B)}${B.map(m=>`<div class="ex mut">${fmtL(m)}</div>`).join('')||'<div class="empty" style="padding:10px">Todavía no ha anotado nada</div>'}</div>`}
 if(c.routines.length){const g={};X.slice().sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{(g[x.exercise]=g[x.exercise]||[]).push(x)});
  h+=`<h3>Pesos de entrenamiento</h3><div class="card">${Object.keys(g).map(k=>{const a=g[k];return`<div class="ex"><b>${esc(k)}</b> <span class="mut">${a.slice(-4).map(x=>x.weight+' kg ('+new Date(x.d+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'numeric'})+')').join(' → ')}</span></div>`}).join('')||'<div class="empty" style="padding:10px">Todavía no ha anotado pesos de ejercicios</div>'}</div>`}
 el.innerHTML=h}
function vSeg(){setTimeout(loadSeg,0);return`<button class="btn ghost sm" onclick="go('#/clientes')">← Clientes</button><h2>Seguimiento nutricional</h2><div id="seg"><div class="empty">Cargando…</div></div>`}
async function loadSeg(){const el=$('#seg');if(!el)return;const cs=S.clients.filter(c=>c.tracking);const{data:all,error}=await sb.from('weight_logs').select('*').order('d');const data=(all||[]).filter(x=>!x.exercise);if(!$('#seg'))return;if(error){el.innerHTML='<div class="empty">No se pudo cargar</div>';return}
 const dd=d=>new Date(d+'T12:00').toLocaleDateString('es-ES');
 el.innerHTML=cs.map(c=>{const L=(data||[]).filter(x=>x.client_id===c.id);const W=L.filter(x=>x.weight!=null);const last=L[L.length-1];const days=last?Math.floor((Date.now()-new Date(last.d+'T12:00'))/864e5):null;
 const ch=W.length>1?(W[W.length-1].weight-W[0].weight):null;
 return`<div class="card click" onclick="go('#/cliente/${c.id}')"><div class="row"><b>${esc(c.name)}</b><span class="tag${days==null||days>14?' red':''}">${last?(days===0?'hoy':'hace '+days+' d'):'sin registros'}</span></div><div class="mut">${L.length} registros${W.length?` · último peso ${W[W.length-1].weight} kg (${dd(W[W.length-1].d)})`:''}${ch!=null?` · ${ch>0?'+':''}${ch.toFixed(1)} kg desde el primero`:''}${last&&last.waist!=null?` · cintura ${last.waist} cm`:''}</div></div>`}).join('')||'<div class="empty">Ningún cliente tiene seguimiento nutricional trimestral. Se activa en su ficha.</div>'}

function dupR(id){const src=id?S.routines.find(x=>x.id===id):window._r;if(!src)return;const n=JSON.parse(JSON.stringify(src));n.id=uid();n.name=(src.name||'Rutina').replace(/ \(copia( \d+)?\)$/,'')+' (copia)';S.routines.push(n);save();toast('Duplicada. Edita lo que cambie');go('#/rutina/'+n.id)}
