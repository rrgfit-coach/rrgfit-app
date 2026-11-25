'use strict';
const KEY='rrgfit.v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const today=()=>new Date().toISOString().slice(0,10);
const SERV=['Boxeo','K1','Muay Thai','Funcional','Fuerza / GAP','Movilidad','Online'];
const EXS={Boxeo:['Sombra 3x3 min','Jab-cruzado en saco','Trabajo de manoplas','Defensa y esquivas','Combinaciones al saco'],'Muay Thai':['Patada baja','Rodillazos en saco','Clinch','Patada frontal (teep)','Manoplas thai'],K1:['Combinaciones K1','Patadas altas','Guardia y desplazamientos','Saco 5x3 min'],Funcional:['Burpees','Kettlebell swing','Plancha','Zancadas','Remo con banda','Saltos al cajón'],Fuerza:['Sentadilla','Peso muerto rumano','Hip thrust','Press de banca','Dominadas asistidas','Press militar','Puente de glúteo'],Movilidad:['Movilidad de cadera','Estiramiento isquios','Movilidad de hombros','Gato-camello']};
function seed(){const mk=(name,cat,items)=>({id:uid(),name,cat,items:items.map(n=>({n,s:3,r:'10',note:''}))});
return{settings:{wa:'34636497426',name:'Raquel'},clients:[],sessions:[],routines:[
mk('Boxeo iniciación','Boxeo',['Sombra 3x3 min','Jab-cruzado en saco','Defensa y esquivas']),
mk('Muay Thai base','Muay Thai',['Patada baja','Rodillazos en saco','Patada frontal (teep)']),
mk('Funcional cuerpo completo','Funcional',['Burpees','Kettlebell swing','Zancadas','Plancha']),
mk('Fuerza GAP','Fuerza / GAP',['Hip thrust','Sentadilla','Peso muerto rumano','Puente de glúteo']),
mk('Movilidad suave','Movilidad',['Movilidad de cadera','Movilidad de hombros','Gato-camello'])]}}
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!S||!S.clients)S=seed();
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const toast=m=>{const t=$('#toast');t.textContent=m;t.className='on';setTimeout(()=>t.className='',1800)};
const cl=id=>S.clients.find(c=>c.id===id);
const fdate=d=>d?new Date(d).toLocaleString('es-ES',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
const daysAgo=d=>d?Math.floor((Date.now()-new Date(d))/864e5):999;
const b64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))));
const go=h=>{location.hash=h};
const nav=[['','🏠','Inicio'],['clientes','👥','Clientes'],['rutinas','🏋️','Rutinas'],['agenda','📅','Agenda'],['ajustes','⚙️','Ajustes']];
let filt='todos',q='';

function bonoBar(c){if(!c.bono||!c.bono.total)return'';const left=c.bono.total-c.bono.used;return`<div class="mut">Bono: quedan ${left} de ${c.bono.total}</div><div class="bono"><i style="width:${Math.max(0,left)/c.bono.total*100}%"></i></div>`}
function chart(pts,key,unit){pts=pts.filter(p=>p[key]);if(pts.length<2)return`<div class="mut">Añade al menos 2 registros para ver la gráfica.</div>`;
const v=pts.map(p=>+p[key]),mn=Math.min(...v),mx=Math.max(...v),r=(mx-mn)||1;
const xy=pts.map((p,i)=>[10+i*(300/(pts.length-1)),100-(p[key]-mn)/r*80]);
return`<svg class="chart" viewBox="0 0 320 120"><polyline fill="none" stroke="#e5173f" stroke-width="3" points="${xy.map(a=>a.join(',')).join(' ')}"/>${xy.map((a,i)=>`<circle cx="${a[0]}" cy="${a[1]}" r="4" fill="#fff"/>`).join('')}<text x="10" y="116" fill="#9a9aa3" font-size="10">${mn} ${unit}</text><text x="250" y="14" fill="#9a9aa3" font-size="10">${mx} ${unit}</text></svg>`}

function vInicio(){const n=new Date();const day=today();
const ts=S.sessions.filter(s=>s.dt.slice(0,10)===day&&!s.done).sort((a,b)=>a.dt.localeCompare(b.dt));
const cold=S.clients.filter(c=>c.active!==false&&daysAgo(c.lastContact||c.created)>=7);
const low=S.clients.filter(c=>c.active!==false&&c.bono&&c.bono.total&&c.bono.total-c.bono.used<=1);
const act=S.clients.filter(c=>c.active!==false).length;
return`<h2>Hola, ${esc(S.settings.name||'')} 💪</h2>
<div class="stats"><div class="card"><div class="big">${act}</div><div class="mut">clientes activos</div></div><div class="card"><div class="big">${ts.length}</div><div class="mut">sesiones hoy</div></div><div class="card"><div class="big">${low.length}</div><div class="mut">bonos por acabar</div></div></div>
<h3>Sesiones de hoy</h3>${ts.length?ts.map(s=>{const c=cl(s.clientId);return`<div class="card row"><div><b>${esc(c?c.name:'?')}</b><div class="mut">${fdate(s.dt)} · ${esc(s.service)}</div></div><button class="btn sm" onclick="doneS('${s.id}')">Hecha ✓</button></div>`}).join(''):'<div class="empty">Nada para hoy. Añade sesiones en Agenda.</div>'}
<h3>Llevan días sin contacto</h3>${cold.length?cold.map(c=>`<div class="card click row" onclick="go('#/cliente/${c.id}')"><div><b>${esc(c.name)}</b><div class="mut">${daysAgo(c.lastContact||c.created)} días</div></div>${c.phone?`<a class="btn wa sm" onclick="event.stopPropagation();contacted('${c.id}')" href="https://wa.me/${waNum(c.phone)}" target="_blank">WhatsApp</a>`:''}</div>`).join(''):'<div class="empty">Todos al día 👌</div>'}
<h3>Bonos a punto de acabarse</h3>${low.length?low.map(c=>`<div class="card click" onclick="go('#/cliente/${c.id}')"><b>${esc(c.name)}</b>${bonoBar(c)}</div>`).join(''):'<div class="empty">Ninguno</div>'}`}
const waNum=p=>{p=String(p).replace(/[^\d]/g,'');return p.length===9?'34'+p:p};
function contacted(id){const c=cl(id);c.lastContact=today();save()}
function doneS(id){const s=S.sessions.find(x=>x.id===id);s.done=true;const c=cl(s.clientId);if(c){if(c.bono&&c.bono.total)c.bono.used++;c.lastContact=today();c.logs=c.logs||[];c.logs.unshift({d:today(),t:'Sesión de '+s.service})}save();toast('Sesión hecha');render()}

function vClientes(){let l=S.clients.filter(c=>(filt==='todos'||(filt==='activos'&&c.active!==false)||(filt==='vivofacil'&&c.origin==='vivofacil')||(filt==='propio'&&c.origin!=='vivofacil'))&&c.name.toLowerCase().includes(q.toLowerCase()));
return`<h2>Clientes</h2><input id="q" placeholder="Buscar cliente…" value="${esc(q)}" oninput="q=this.value;renderKeep()">
<div class="chips">${['todos','activos','vivofacil','propio'].map(f=>`<button class="chip ${filt===f?'on':''}" onclick="filt='${f}';render()">${f==='vivofacil'?'Vivofácil':f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div>
${l.length?l.map(c=>`<div class="card click" onclick="go('#/cliente/${c.id}')"><div class="row"><b>${esc(c.name)}</b><span>${c.origin==='vivofacil'?'<span class="tag red">Vivofácil</span>':''}${c.active===false?'<span class="tag">inactivo</span>':''}</span></div><div class="mut">${esc(c.goal||'Sin objetivo')}</div>${bonoBar(c)}</div>`).join(''):'<div class="empty">Aún no hay clientes. Pulsa + para añadir el primero.</div>'}
<button class="btn fab" onclick="go('#/cliente/nuevo')">+</button>`}
function renderKeep(){const p=$('#q').selectionStart;render();const e=$('#q');e.focus();e.setSelectionRange(p,p)}

function vFicha(id){const nw=id==='nuevo';const c=nw?{id:uid(),name:'',origin:'propio',active:true,created:today(),measures:[],logs:[],routines:[],bono:{total:0,used:0}}:cl(id);if(!c)return'<div class="empty">No existe</div>';
window._c=c;window._nw=nw;
const nxt=S.sessions.filter(s=>s.clientId===c.id&&!s.done&&s.dt>=new Date().toISOString().slice(0,16)).sort((a,b)=>a.dt.localeCompare(b.dt))[0];
return`<button class="btn ghost sm" onclick="go('#/clientes')">← Clientes</button><h2>${nw?'Nuevo cliente':esc(c.name)}</h2>
<div class="card"><label>Nombre</label><input id="f_name" value="${esc(c.name)}">
<div class="g2"><div><label>Teléfono (WhatsApp)</label><input id="f_phone" inputmode="tel" value="${esc(c.phone||'')}"></div><div><label>Origen</label><select id="f_origin"><option value="propio" ${c.origin!=='vivofacil'?'selected':''}>Propio</option><option value="vivofacil" ${c.origin==='vivofacil'?'selected':''}>Vivofácil</option></select></div></div>
<label>Objetivo</label><input id="f_goal" value="${esc(c.goal||'')}" placeholder="Perder grasa, ganar fuerza…">
<label>Lesiones / notas médicas</label><textarea id="f_inj" rows="2">${esc(c.injuries||'')}</textarea>
<div class="g2"><div><label>Bono: sesiones totales</label><input id="f_bt" type="number" min="0" value="${c.bono.total||0}"></div><div><label>Sesiones usadas</label><input id="f_bu" type="number" min="0" value="${c.bono.used||0}"></div></div>
<label><input type="checkbox" id="f_act" style="width:auto" ${c.active!==false?'checked':''}> Cliente activo</label><br><br>
<button class="btn" onclick="saveC(${nw})">Guardar</button> ${nw?'':`<button class="btn del" onclick="delC('${c.id}')">Borrar</button>`}</div>
${nw?'':`
<h3>Progreso</h3><div class="card">${chart([...c.measures].sort((a,b)=>a.d.localeCompare(b.d)),'w','kg')}
<div class="g2" style="margin-top:8px"><div><label>Peso (kg)</label><input id="m_w" type="number" step="0.1"></div><div><label>Cintura (cm)</label><input id="m_c" type="number" step="0.5"></div></div>
<button class="btn sm" onclick="addM()">Añadir registro</button>
${[...c.measures].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,6).map(m=>`<div class="ex mut">${m.d}: ${m.w||'–'} kg · cintura ${m.c||'–'} cm</div>`).join('')}</div>
<h3>Rutinas asignadas</h3>${c.routines.map((r,i)=>`<div class="card"><div class="row"><b>${esc(r.name)}</b><button class="btn del sm" onclick="unassign(${i})">Quitar</button></div>${r.items.map(e=>`<div class="ex">${esc(e.n)} <span class="mut">· ${e.s}x${esc(e.r)} ${esc(e.note||'')}</span></div>`).join('')}</div>`).join('')||'<div class="empty">Sin rutinas</div>'}
<div class="card"><label>Asignar rutina</label><select id="as">${S.routines.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('')}</select><button class="btn sm" onclick="assign()">Asignar</button></div>
<h3>Notas de sesión</h3><div class="card"><textarea id="n_t" rows="2" placeholder="Cómo fue la sesión…"></textarea><button class="btn sm" onclick="addN()">Guardar nota</button>
${(c.logs||[]).map(l=>`<div class="ex"><span class="mut">${l.d}</span> ${esc(l.t)}</div>`).join('')}</div>
<h3>Para el cliente</h3><div class="card"><div class="mut">Enlace con sus rutinas, próxima sesión, bono y progreso (solo lectura, sin datos médicos).</div><br>
<button class="btn" onclick="share('${c.id}')">Copiar enlace del cliente</button> ${c.phone?`<a class="btn wa" onclick="contacted('${c.id}')" href="https://wa.me/${waNum(c.phone)}" target="_blank">WhatsApp</a>`:''}
${nxt?`<div class="mut" style="margin-top:8px">Próxima sesión: ${fdate(nxt.dt)}</div>`:''}</div>`}`}
function saveC(nw){const c=window._c;c.name=$('#f_name').value.trim();if(!c.name)return toast('Pon un nombre');c.phone=$('#f_phone').value.trim();c.origin=$('#f_origin').value;c.goal=$('#f_goal').value;c.injuries=$('#f_inj').value;c.bono={total:+$('#f_bt').value||0,used:+$('#f_bu').value||0};c.active=$('#f_act').checked;if(nw)S.clients.push(c);save();toast('Guardado');go('#/cliente/'+c.id);render()}
function delC(id){if(!confirm('¿Borrar este cliente y sus datos?'))return;S.clients=S.clients.filter(c=>c.id!==id);S.sessions=S.sessions.filter(s=>s.clientId!==id);save();go('#/clientes')}
function addM(){const c=window._c;const w=$('#m_w').value,k=$('#m_c').value;if(!w&&!k)return;c.measures.push({d:today(),w:w?+w:null,c:k?+k:null});save();render()}
function addN(){const t=$('#n_t').value.trim();if(!t)return;const c=window._c;c.logs=c.logs||[];c.logs.unshift({d:today(),t});c.lastContact=today();save();render()}
function assign(){const r=S.routines.find(x=>x.id===$('#as').value);if(!r)return;window._c.routines.push(JSON.parse(JSON.stringify({name:r.name,items:r.items})));save();toast('Rutina asignada');render()}
function unassign(i){window._c.routines.splice(i,1);save();render()}
function clientData(c){const nx=S.sessions.filter(s=>s.clientId===c.id&&!s.done&&s.dt>=new Date().toISOString().slice(0,16)).sort((a,b)=>a.dt.localeCompare(b.dt))[0];
return{n:c.name,wa:S.settings.wa,t:S.settings.name,r:c.routines,x:nx?nx.dt+'|'+nx.service:'',b:c.bono&&c.bono.total?[c.bono.total,c.bono.used]:null,p:c.measures.filter(m=>m.w).map(m=>({d:m.d,w:m.w}))}}
function share(id){const u=location.origin+location.pathname+'#/c/'+b64(clientData(cl(id)));
if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>toast('Enlace copiado'),()=>prompt('Copia el enlace',u));else prompt('Copia el enlace',u)}

function vRutinas(){return`<h2>Rutinas</h2>${S.routines.map(r=>`<div class="card click" onclick="go('#/rutina/${r.id}')"><div class="row"><b>${esc(r.name)}</b><span class="tag">${esc(r.cat||'')}</span></div><div class="mut">${r.items.length} ejercicios</div></div>`).join('')||'<div class="empty">Sin rutinas</div>'}<button class="btn fab" onclick="go('#/rutina/nueva')">+</button>`}
function vRutina(id){const nw=id==='nueva';const r=nw?{id:uid(),name:'',cat:'Funcional',items:[]}:S.routines.find(x=>x.id===id);if(!r)return'<div class="empty">No existe</div>';window._r=JSON.parse(JSON.stringify(r));window._rn=nw;return rutinaForm()}
function rutinaForm(){const r=window._r;const all=[...new Set(Object.values(EXS).flat())];
return`<button class="btn ghost sm" onclick="go('#/rutinas')">← Rutinas</button><h2>${window._rn?'Nueva rutina':'Editar rutina'}</h2>
<div class="card"><label>Nombre</label><input id="r_name" value="${esc(r.name)}" oninput="window._r.name=this.value">
<label>Tipo</label><select id="r_cat" onchange="window._r.cat=this.value">${SERV.map(s=>`<option ${r.cat===s?'selected':''}>${s}</option>`).join('')}</select></div>
<h3>Ejercicios</h3>${r.items.map((e,i)=>`<div class="card"><input value="${esc(e.n)}" oninput="window._r.items[${i}].n=this.value"><div class="g2"><div><label>Series</label><input type="number" value="${e.s}" oninput="window._r.items[${i}].s=+this.value"></div><div><label>Reps / tiempo</label><input value="${esc(e.r)}" oninput="window._r.items[${i}].r=this.value"></div></div><input placeholder="Nota (opcional)" value="${esc(e.note||'')}" oninput="window._r.items[${i}].note=this.value"><button class="btn del sm" onclick="window._r.items.splice(${i},1);rerender()">Quitar</button></div>`).join('')}
<div class="card"><label>Añadir ejercicio</label><input id="ex_n" list="exl" placeholder="Elige o escribe uno"><datalist id="exl">${all.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><button class="btn sm" onclick="addEx()">Añadir</button></div>
<button class="btn" onclick="saveR()">Guardar rutina</button> ${window._rn?'':`<button class="btn del" onclick="delR()">Borrar</button>`}`}
function rerender(){$('#app').innerHTML=rutinaForm()}
function addEx(){const n=$('#ex_n').value.trim();if(!n)return;window._r.items.push({n,s:3,r:'10',note:''});rerender()}
function saveR(){if(!window._r.name.trim())return toast('Pon un nombre');const r=window._r;const i=S.routines.findIndex(x=>x.id===r.id);if(i<0)S.routines.push(r);else S.routines[i]=r;save();toast('Guardada');go('#/rutinas')}
function delR(){if(!confirm('¿Borrar la rutina? Las ya asignadas se mantienen.'))return;S.routines=S.routines.filter(x=>x.id!==window._r.id);save();go('#/rutinas')}

function vAgenda(){const now=new Date().toISOString().slice(0,16);const up=S.sessions.filter(s=>!s.done).sort((a,b)=>a.dt.localeCompare(b.dt));
const d=new Date(Date.now()+36e5);const def=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
return`<h2>Agenda</h2><div class="card"><label>Cliente</label><select id="a_c">${S.clients.filter(c=>c.active!==false).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')||'<option value="">(crea un cliente antes)</option>'}</select>
<div class="g2"><div><label>Fecha y hora</label><input id="a_d" type="datetime-local" value="${def}"></div><div><label>Servicio</label><select id="a_s">${SERV.map(s=>`<option>${s}</option>`).join('')}</select></div></div><button class="btn" onclick="addS()">Añadir sesión</button></div>
<h3>Próximas</h3>${up.map(s=>{const c=cl(s.clientId);return`<div class="card row"><div><b>${esc(c?c.name:'?')}</b><div class="mut">${fdate(s.dt)} · ${esc(s.service)}</div></div><div><button class="btn sm" onclick="doneS('${s.id}')">✓</button> <button class="btn del sm" onclick="delS('${s.id}')">✕</button></div></div>`}).join('')||'<div class="empty">Sin sesiones</div>'}`}
function addS(){const c=$('#a_c').value,d=$('#a_d').value;if(!c||!d)return toast('Falta cliente o fecha');S.sessions.push({id:uid(),clientId:c,dt:d,service:$('#a_s').value,done:false});save();toast('Sesión añadida');render()}
function delS(id){S.sessions=S.sessions.filter(s=>s.id!==id);save();render()}

function vAjustes(){return`<h2>Ajustes</h2><div class="card"><label>Tu nombre</label><input id="s_n" value="${esc(S.settings.name||'')}"><label>Tu WhatsApp (con prefijo, ej. 34636497426)</label><input id="s_w" inputmode="tel" value="${esc(S.settings.wa||'')}"><button class="btn" onclick="saveSet()">Guardar</button></div>
<h3>Copia de seguridad</h3><div class="card"><div class="mut">Los datos se guardan en este móvil. Haz copia de vez en cuando, sobre todo antes de cambiar de móvil.</div><br><button class="btn" onclick="exportD()">Descargar copia</button><br><br><label>Restaurar copia</label><input type="file" accept=".json" onchange="importD(this)"></div>
<h3>Instalar</h3><div class="card mut">iPhone: Safari → Compartir → Añadir a pantalla de inicio. Android: menú ⋮ → Instalar app.</div>`}
function saveSet(){S.settings.name=$('#s_n').value;S.settings.wa=$('#s_w').value.replace(/[^\d]/g,'');save();toast('Guardado')}
function exportD(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='rrgfit-copia-'+today()+'.json';a.click()}
function importD(i){const f=i.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!d.clients)throw 0;S=d;save();toast('Restaurado');render()}catch(e){toast('Archivo no válido')}})}

function vCliente(data){let d;try{d=unb64(data)}catch(e){return'<div class="empty">Enlace no válido</div>'}
const nx=d.x?d.x.split('|'):null;
return`<h2>Hola, ${esc(d.n)} 👊</h2>
<div class="card"><div class="mut">Próxima sesión</div>${nx?`<div class="big" style="font-size:22px">${fdate(nx[0])}</div><div class="mut">${esc(nx[1])}</div>`:'<div>Aún sin fecha. Escríbeme y la fijamos.</div>'}</div>
${d.b?`<div class="card"><div class="mut">Tu bono</div><b>Te quedan ${d.b[0]-d.b[1]} de ${d.b[0]} sesiones</b><div class="bono"><i style="width:${(d.b[0]-d.b[1])/d.b[0]*100}%"></i></div></div>`:''}
<h3>Tus rutinas</h3>${(d.r||[]).map(r=>`<div class="card"><b>${esc(r.name)}</b>${r.items.map(e=>`<div class="ex">${esc(e.n)}<div class="mut">${e.s} series x ${esc(e.r)} ${esc(e.note||'')}</div></div>`).join('')}</div>`).join('')||'<div class="empty">Todavía no tienes rutinas.</div>'}
<h3>Tu progreso</h3><div class="card">${chart(d.p||[],'w','kg')}</div>
${d.wa?`<p><a class="btn wa" href="https://wa.me/${d.wa}?text=${encodeURIComponent('Hola '+(d.t||'')+', soy '+d.n)}" target="_blank">Escribir a ${esc(d.t||'mi entrenadora')} por WhatsApp</a></p>`:''}`}

function render(){const h=location.hash.replace(/^#\/?/,'');const [p,a]=h.split('/');const cli=p==='c';
document.body.classList.toggle('client',cli);$('#nav').style.display=cli?'none':'flex';$('#sub').textContent=cli?'Tu entrenamiento':'Entrenamiento personal';
const sec=p===''?'':(p==='cliente'?'clientes':p==='rutina'?'rutinas':p);
$('#nav').innerHTML=nav.map(n=>`<button class="${sec===n[0]?'on':''}" onclick="go('#/${n[0]}')"><b>${n[1]}</b>${n[2]}</button>`).join('');
let v;if(cli)v=vCliente(h.slice(2));else if(p==='clientes')v=vClientes();else if(p==='cliente')v=vFicha(a);else if(p==='rutinas')v=vRutinas();else if(p==='rutina')v=vRutina(a);else if(p==='agenda')v=vAgenda();else if(p==='ajustes')v=vAjustes();else v=vInicio();
$('#app').innerHTML=v;if(!cli||true)window.scrollTo(0,0)}
addEventListener('hashchange',render);render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
