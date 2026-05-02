const COLORES=[
{cod:“135”,nom:“Blanco”,hex:”#f2f2ef”},
{cod:“107”,nom:“Gris”,hex:”#9e9e9e”},
{cod:“303”,nom:“Negro”,hex:”#2b2b2b”},
{cod:“240”,nom:“Wengu\u00E9”,hex:”#4a2e1a”}
];
let uid=0,mods={},res=[],sec=“puertas”,sbOpen=true;
const TIT={
puertas:{t:“Puertas”,s:“Calcul\u00E1 medidas de hojas”},
cajones:{t:“Cajones”,s:“Calcul\u00E1 medidas de frentes”},
resumen:{t:“Resumen”,s:“Lista de cortes guardados”}
};

function irA(n){
document.getElementById(“pantalla-”+sec)?.classList.remove(“on”);
document.getElementById(“nav-”+sec)?.classList.remove(“on”);
sec=n;
document.getElementById(“pantalla-”+n)?.classList.add(“on”);
document.getElementById(“nav-”+n)?.classList.add(“on”);
var t=TIT[n];
document.getElementById(“ptit”).textContent=t.t;
document.getElementById(“psub”).textContent=t.s;
if(n===“resumen”) renderRes();
if(window.innerWidth<640) closeSb();
}
function toggleSb(){sbOpen?closeSb():openSb()}
function openSb(){sbOpen=true;document.getElementById(“sb”).classList.remove(“off”);document.getElementById(“tog”).classList.add(“e”)}
function closeSb(){sbOpen=false;document.getElementById(“sb”).classList.add(“off”);document.getElementById(“tog”).classList.remove(“e”)}
function nv(id){return parseFloat(document.getElementById(id)?.value)||0}
function vv(id){return document.getElementById(id)?.value||””}
function fm(x){return isNaN(x)?”–”:(Math.round(x*100)/100).toLocaleString(“es-AR”)}
function gR(p,id){
var s=document.getElementById(p+“rep”+id);
if(!s)return 1;
if(s.value===“custom”)return Math.max(1,parseInt(document.getElementById(p+“repn”+id)?.value)||1);
return Math.max(1,parseInt(s.value)||1);
}
function opts(lbl){
return Array.from({length:5},(_,i)=>”<option value=’”+(i+1)+”’”+(i===0?” selected”:””)+”>”+(i+1)+” “+lbl+(i>0?“s”:””)+”</option>”).join(””)
+”<option value='custom'>Otro…</option>”;
}

/* ── VALIDACION NUMERICA ─────────────────────────────────── */
function validarNumericos(id){
var card=document.getElementById(“mod-”+id);
if(!card) return false;
var hayError=false;
card.querySelectorAll(“input[type=number]”).forEach(function(inp){
var malo=inp.validity&&inp.validity.badInput;
inp.classList.toggle(“campo-error”,malo);
if(malo) hayError=true;
});
var banner=document.getElementById(“errnum-”+id);
if(banner) banner.classList.toggle(“on”,hayError);
return hayError; // true = hay error
}

function aM(tipo){
uid++;var id=uid;
// Contar cuántos módulos de este tipo ya existen (activos)
var contTipo=Object.values(mods).filter(function(m){return m.tipo===tipo}).length+1;
var nombreBase=tipo===“puerta”?“Puerta “:“Caj\u00F3n “;
mods[id]={id:id,tipo:tipo,nombre:nombreBase+contTipo,calc:null,guardado:false};
var c=document.getElementById(“cont-”+tipo+“s”);
var d=document.createElement(“div”);
d.id=“mod-”+id;d.className=“mc”;
d.innerHTML=tipo===“puerta”?hP(id):hC(id);
c.appendChild(d);
if(tipo===“cajon”){
mods[id].cajones=[{cid:1,alto:””},{cid:2,alto:””},{cid:3,alto:””}];
mods[id].nextCid=4;
rCaj(id);
}
if(tipo===“puerta”){iCD(id);tLuz(id);tCol(id)}
calc(id);
}

function qM(id){
var i=res.findIndex(function(r){return r.modId===id});
if(i>=0)res.splice(i,1);
document.getElementById(“mod-”+id)?.remove();
delete mods[id];
rCar();
if(sec===“resumen”)renderRes();
}

function hP(id){
var o=opts(“espacio”);
return `<div class="mh">
<input type="text" value="${mods[id].nombre}" oninput="mods[${id}].nombre=this.value;syncNombre(${id})" placeholder="Nombre del espacio">
<button class="bx" onclick="qM(${id})">✕</button>

  </div>
  <div class="mb">
    <div id="errnum-${id}" class="errnum-banner">&#x26A0; Solo se permiten valores num&#233;ricos en los campos de medida.</div>
    <div class="row">
      <div class="f"><label>Material</label>
        <select id="pmat${id}" onchange="tCol(${id});ch(${id})">
          <option value="melamina">Melamina</option>
          <option value="paraiso">Para&#237;so</option>
          <option value="guatambu">Guatamb&#250;</option>
          <option value="petiribi">Petiribi</option>
        </select></div>
      <div class="f"><label>Espacios iguales</label>
        <div style="display:flex;gap:5px">
          <select id="prep${id}" onchange="sR('p',${id})" style="flex:1">${o}</select>
          <input type="number" id="prepn${id}" min="1" max="999" value="1" style="width:52px;display:none;padding:8px 5px;border:1.5px solid var(--bo);border-radius:var(--rs);font-size:.87rem" oninput="ch(${id})">
        </div></div>
    </div>
    <div class="cd" id="wc${id}">
      <div class="row o" style="margin-bottom:9px"><div class="f"><label>Color melamina</label>
        <div class="cw">
          <button type="button" class="cb" id="cbtn${id}" onclick="tDrop(${id})">
            <span class="cbc" id="cbc${id}" style="background:#e0e0e0"></span>
            <span class="cbl" id="cbl${id}">Eleg&#237; un color</span>
            <span class="cba">&#x25BC;</span>
          </button>
          <div class="cl" id="cdp${id}"></div>
        </div>
        <input type="hidden" id="ccolor${id}" value="">
      </div></div>
    </div>
    <div class="row">
      <div class="f"><label>Ancho del espacio (cm)</label>
        <div class="cu"><input type="number" id="pa${id}" placeholder="--" min="0" step="0.1" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Alto del espacio (cm)</label>
        <div class="cu"><input type="number" id="ph${id}" placeholder="--" min="0" step="0.1" oninput="ch(${id})"><span class="u">cm</span></div></div>
    </div>
    <div class="row o">
      <div class="f"><label>Cantidad de hojas</label>
        <select id="pcant${id}" onchange="tLuz(${id});ch(${id})">
          <option value="1">1 hoja</option>
          <option value="2" selected>2 hojas</option>
        </select></div>
    </div>
    <input type="hidden" id="pf${id}" value="1">
    <div class="cd" id="wl${id}">
      <div class="row o" style="margin-bottom:9px"><div class="f"><label>Luz entre hojas</label>
        <div class="cu"><input type="number" id="pl${id}" value="0.18" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div>
      </div></div>
    </div>
    <div class="row t">
      <div class="f"><label>Luz marcos laterales</label>
        <div class="cu"><input type="number" id="pll${id}" value="0" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Luz marco superior</label>
        <div class="cu"><input type="number" id="pv${id}" value="0" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Luz marco inferior</label>
        <div class="cu"><input type="number" id="pvi${id}" value="0" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
    </div>
    <div id="rp${id}"></div>
    <div class="btn-bar">
      <button class="bed" id="be${id}" onclick="editarItem(${id})" disabled>&#x270F; Editar</button>
      <button class="bsv" id="bs${id}" onclick="guardar(${id})" disabled>Guardar</button>
    </div>
  </div>`;
}

function hC(id){
var o=opts(“m\u00f3dulo”);
return `<div class="mh">
<input type="text" value="${mods[id].nombre}" oninput="mods[${id}].nombre=this.value;syncNombre(${id})" placeholder="Nombre del m&#243;dulo">
<button class="bx" onclick="qM(${id})">✕</button>

  </div>
  <div class="mb">
    <div id="errnum-${id}" class="errnum-banner">&#x26A0; Solo se permiten valores num&#233;ricos en los campos de medida.</div>
    <div class="row">
      <div class="f"><label>Material</label>
        <select id="cmat${id}" onchange="ch(${id})">
          <option value="melamina">Melamina</option>
          <option value="paraiso">Para&#237;so</option>
          <option value="guatambu">Guatamb&#250;</option>
          <option value="petiribi">Petiribi</option>
        </select></div>
      <div class="f"><label>M&#243;dulos iguales</label>
        <div style="display:flex;gap:5px">
          <select id="crep${id}" onchange="sR('c',${id})" style="flex:1">${o}</select>
          <input type="number" id="crepn${id}" min="1" max="999" value="1" style="width:52px;display:none;padding:8px 5px;border:1.5px solid var(--bo);border-radius:var(--rs);font-size:.87rem" oninput="ch(${id})">
        </div></div>
    </div>
    <div class="row">
      <div class="f"><label>Ancho del espacio (cm)</label>
        <div class="cu"><input type="number" id="ca${id}" placeholder="--" min="0" step="0.1" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Frentes lado a lado</label>
        <input type="number" id="cca${id}" value="1" min="1" oninput="ch(${id})"></div>
    </div>
    <div class="row t">
      <div class="f"><label>Luz entre frentes</label>
        <div class="cu"><input type="number" id="cl${id}" value="0.18" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Luz laterales</label>
        <div class="cu"><input type="number" id="cll${id}" value="0" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
      <div class="f"><label>Luz alto c/u</label>
        <div class="cu"><input type="number" id="cv${id}" value="0.18" min="0" step="0.01" oninput="ch(${id})"><span class="u">cm</span></div></div>
    </div>
    <div class="sp"></div>
    <div class="st"><span>Alto de cada frente</span>
      <button class="btn baz bsm" onclick="addCaj(${id})">&#xFF0B; Caj&#243;n</button></div>
    <div id="fc${id}"></div>
    <div id="rc${id}"></div>
    <div class="btn-bar">
      <button class="bed" id="be${id}" onclick="editarItem(${id})" disabled>&#x270F; Editar</button>
      <button class="bsv" id="bs${id}" onclick="guardar(${id})" disabled>Guardar</button>
    </div>
  </div>`;
}

function ch(id){
validarNumericos(id);
calc(id);
}
function tLuz(id){var c=parseInt(vv(“pcant”+id))||1;document.getElementById(“wl”+id)?.classList.toggle(“on”,c>=2)}
function tCol(id){var m=vv(“pmat”+id);document.getElementById(“wc”+id)?.classList.toggle(“on”,m===“melamina”);uSv(id)}
function sR(p,id){
var s=document.getElementById(p+“rep”+id);
var ni=document.getElementById(p+“repn”+id);
if(ni)ni.style.display=s?.value===“custom”?“block”:“none”;
ch(id);
}

function iCD(id){
var d=document.getElementById(“cdp”+id);if(!d)return;
d.innerHTML=COLORES.map(function(c){
return “<div class="co" id="co-”+id+”-”+c.cod+”" onmousedown="sC(”+id+”,’”+c.cod+”’,’”+c.nom+”’,’”+c.hex+”’)">”
+”<div class="coc" style="background:”+c.hex+”"></div>”
+”<span>”+c.nom+”</span>”
+”<span style="font-size:.67rem;color:var(–gr);margin-left:auto">”+c.cod+”</span>”
+”</div>”;
}).join(””);
}
function tDrop(id){
var d=document.getElementById(“cdp”+id),b=document.getElementById(“cbtn”+id);
if(!d||!b)return;
var op=d.classList.contains(“sh”);
cAD();
if(!op){
var r=b.getBoundingClientRect();
d.style.top=(r.bottom+3)+“px”;d.style.left=r.left+“px”;d.style.width=r.width+“px”;
d.classList.add(“sh”);b.classList.add(“op”);
}
}
function cAD(){
document.querySelectorAll(”.cl”).forEach(function(d){d.classList.remove(“sh”)});
document.querySelectorAll(”.cb”).forEach(function(b){b.classList.remove(“op”)});
}
document.addEventListener(“click”,function(e){if(!e.target.closest(”.cw”))cAD()});
function sC(id,cod,nom,hex){
document.getElementById(“ccolor”+id).value=cod+” \u2013 “+nom;
document.getElementById(“cbc”+id).style.background=hex;
document.getElementById(“cbl”+id).textContent=nom;
document.querySelectorAll(”[id^=‘co-”+id+”-’]”).forEach(function(o){o.classList.remove(“sl”)});
document.getElementById(“co-”+id+”-”+cod)?.classList.add(“sl”);
document.getElementById(“cbtn”+id)?.classList.remove(“er”);
cAD();ch(id);
}

function rCaj(id){
var c=document.getElementById(“fc”+id);if(!c)return;c.innerHTML=””;
(mods[id].cajones||[]).forEach(function(x,i){
var d=document.createElement(“div”);d.className=“cr”;
d.innerHTML=’<label>Caj\u00F3n ‘+(i+1)+’</label>’
+’<div class="cu" style="flex:1">’
+’<input type=“number” id=“ch’+id+’-’+x.cid+’” value=”’+x.alto+’” placeholder=“0” min=“0” step=“0.1”’
+’ oninput=“sCH(’+id+’,’+x.cid+’,this.value)” style=“padding-right:28px”>’
+’<span class="u">cm</span>’
+’</div>’
+(mods[id].cajones.length>1?’<button class="bx" onclick="rCJ('+id+','+x.cid+')" >✕</button>’:””);
c.appendChild(d);
});
calc(id);
}
function addCaj(id){mods[id].cajones.push({cid:mods[id].nextCid++,alto:””});rCaj(id)}
function rCJ(id,cid){mods[id].cajones=mods[id].cajones.filter(function(c){return c.cid!==cid});rCaj(id)}
function sCH(id,cid,val){var c=mods[id].cajones.find(function(x){return x.cid===cid});if(c)c.alto=val;ch(id)}

function calc(id){if(!mods[id])return;mods[id].tipo===“puerta”?cP(id):cC(id);uSv(id)}

function cP(id){
var A=nv(“pa”+id),H=nv(“ph”+id),cols=parseInt(vv(“pcant”+id))||1;
var luz=nv(“pl”+id),lat=nv(“pll”+id),vsup=nv(“pv”+id),vinf=nv(“pvi”+id);
var reps=gR(“p”,id),mat=vv(“pmat”+id),col=vv(“ccolor”+id);
var d=document.getElementById(“rp”+id);if(!d)return;
if(!A&&!H){d.innerHTML=””;mods[id].calc=null;return}
var lA=(cols-1)*luz+2*lat,lH=vsup+vinf;
var aw=A?(A-lA)/cols:null,ah=H?(H-lH):null;
if((aw!==null&&aw<=0)||(ah!==null&&ah<=0)){
d.innerHTML=’<div class="rb e"><div class="rbt" style="color:var(--re)">⚠ Luces superan el espacio</div></div>’;
mods[id].calc=null;return;
}
var med=aw&&ah?fm(aw)+” \u00D7 “+fm(ah)+” cm”:(aw?fm(aw)+” cm ancho”:fm(ah)+” cm alto”);
var frm=(aw?“A:(”+A+(cols>1?”\u2212”+(cols-1)+”\u00D7”+luz:””)+”\u22122\u00D7”+lat+”)\u00F7”+cols+”=”+fm(aw)+”\n”:””)
+(ah?“H:(”+H+”\u2212”+vsup+”\u2212”+vinf+”)=”+fm(ah):””);
d.innerHTML=’<div class="rb"><div class="rbt">Medida de corte</div>’
+’<div class="rbg">’+med+’</div>’
+’<div class="rbf">’+frm.trim()+’</div>’
+’<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px">’
+’<span class="chip">🚪 ‘+cols+’ hoja’+(cols>1?“s”:””)+” \u00D7 “+reps+’ esp.</span>’
+’<span class="chip">🪵 ‘+mat.charAt(0).toUpperCase()+mat.slice(1)+’</span>’
+(col?’<span class="chip">🎨 ‘+col+’</span>’:””)
+’</div></div>’;
var chx=(COLORES.find(function(c){return col.indexOf(c.cod)===0})||{}).hex||””;
mods[id].calc=[{tipo:“Puerta”,nombre:mods[id].nombre,ancho:aw!==null?aw:”–”,alto:ah!==null?ah:”–”,cant:cols,reps:reps,mat:mat,color:col,colorHex:chx}];
}

function cC(id){
var A=nv(“ca”+id),cols=Math.max(1,parseInt(vv(“cca”+id))||1);
var luz=nv(“cl”+id),lat=nv(“cll”+id),vluz=nv(“cv”+id);
var reps=gR(“c”,id),mat=vv(“cmat”+id),cajones=mods[id].cajones||[];
var d=document.getElementById(“rc”+id);if(!d)return;
if(!A&&!cajones.some(function(c){return parseFloat(c.alto)>0})){d.innerHTML=””;mods[id].calc=null;return}
var lA=(cols-1)*luz+2*lat,aw=A?(A-lA)/cols:null;
if(aw!==null&&aw<=0){
d.innerHTML=’<div class="rb e"><div class="rbt" style="color:var(--re)">⚠ Luces superan el espacio</div></div>’;
mods[id].calc=null;return;
}
var pzs=[],rows=aw?’<div class="rr"><span class="rrl">Ancho por frente</span><span class="rrv">’+fm(aw)+’ cm</span></div>’:””;
cajones.forEach(function(c,i){
var h=parseFloat(c.alto)||0;
if(h>0){
var ac=h-2*vluz,ok=ac>0;
rows+=’<div class="rr"><span class="rrl">Caj\u00F3n ‘+(i+1)+”: “+h+”\u22122\u00D7”+vluz+’</span><span class="rrv">’+(ok?fm(ac)+” cm”:”⚠ Error”)+’</span></div>’;
if(ok)pzs.push({tipo:“Caj\u00F3n”,nombre:mods[id].nombre+” \u2013 C”+(i+1),ancho:aw!==null?aw:”–”,alto:ac,cant:cols,reps:reps,mat:mat,color:””,colorHex:””});
}
});
d.innerHTML=’<div class="rb"><div class="rbt">Medidas de corte</div>’
+(aw?’<div class="rbg">’+fm(aw)+’ cm ancho</div>’:””)
+’<div class="rbf">Alto = medida \u2212 2\u00D7’+vluz+’ cm</div>’
+’<div class="rrs">’+rows+’</div>’
+’<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px">’
+’<span class="chip">📦 ‘+pzs.length+’ caj\u00F3n’+(pzs.length!==1?“es”:””)+” \u00D7 “+reps+’ m\u00F3d.</span>’
+’<span class="chip">🪵 ‘+mat.charAt(0).toUpperCase()+mat.slice(1)+’</span>’
+’</div></div>’;
mods[id].calc=pzs.length?pzs:null;
}

function syncNombre(id){
var m=mods[id];if(!m)return;
var ri=res.findIndex(function(r){return r.modId===id});
if(ri>=0){
res[ri].items.forEach(function(p,i){
p.nombre=m.tipo===“puerta”?m.nombre:(m.nombre+” \u2013 C”+(i+1));
});
}
rCar();
if(sec===“resumen”)renderRes();
}

/* ── BLOQUEO / DESBLOQUEO ──────────────────────────────── */
function lockCard(id){
var card=document.getElementById(“mod-”+id);if(!card)return;
card.querySelectorAll(“input,select”).forEach(function(el){el.disabled=true});
var cb=document.getElementById(“cbtn”+id);if(cb)cb.disabled=true;
var cl=document.getElementById(“cdp”+id);if(cl)cl.style.pointerEvents=“none”;
card.classList.add(“locked”);
card.classList.remove(“ed”);
}
function unlockCard(id){
var card=document.getElementById(“mod-”+id);if(!card)return;
card.querySelectorAll(“input,select”).forEach(function(el){el.disabled=false});
var cb=document.getElementById(“cbtn”+id);if(cb)cb.disabled=false;
var cl=document.getElementById(“cdp”+id);if(cl)cl.style.pointerEvents=””;
card.classList.remove(“locked”);
}

function uSv(id){
var bs=document.getElementById(“bs”+id);
var be=document.getElementById(“be”+id);
if(!bs||!be)return;
var m=mods[id];if(!m)return;
var em=m.tipo===“puerta”&&vv(“pmat”+id)===“melamina”;
var hc=!em||vv(“ccolor”+id)!==””;
// Verificar si hay errores numéricos en los campos
var hayErrorNum=false;
var card=document.getElementById(“mod-”+id);
if(card) card.querySelectorAll(“input[type=number]”).forEach(function(inp){
if(inp.validity&&inp.validity.badInput) hayErrorNum=true;
});
var puedeGuardar=!!(m.calc&&hc&&!hayErrorNum);
if(m.guardado){
bs.disabled=true;bs.textContent=“Guardar”;bs.classList.add(“ok”);
be.disabled=false;
} else {
bs.disabled=!puedeGuardar;bs.textContent=“Guardar”;bs.classList.remove(“ok”);
be.disabled=true;
}
var cb=document.getElementById(“cbtn”+id);
if(cb&&em&&!vv(“ccolor”+id)&&m.calc)cb.classList.add(“er”);
else if(cb)cb.classList.remove(“er”);
}

function guardar(id){
var m=mods[id];if(!m||!m.calc)return;
if(m.tipo===“puerta”){m.calc[0].nombre=m.nombre}
else{m.calc.forEach(function(p,i){p.nombre=m.nombre+” \u2013 C”+(i+1)})}
var datos={modId:id,tipo:m.tipo===“puerta”?“Puerta”:“Caj\u00F3n”,items:JSON.parse(JSON.stringify(m.calc))};
var i=res.findIndex(function(r){return r.modId===id});
if(i>=0)res[i]=datos;else res.push(datos);
m.guardado=true;
lockCard(id);
uSv(id);
rCar();
if(sec===“resumen”)renderRes();
}

function editarItem(modId){
var m=mods[modId];if(!m)return;
irA(m.tipo===“puerta”?“puertas”:“cajones”);
setTimeout(function(){
var card=document.getElementById(“mod-”+modId);
if(card){card.classList.add(“ed”);card.scrollIntoView({behavior:“smooth”,block:“center”})}
unlockCard(modId);
m.guardado=false;
uSv(modId);
},150);
}

function vaciar(){
if(!res.length){alert(“El resumen ya est\u00E1 vac\u00EDo.”);return}
if(!window.confirm(”\u00BFSeg\u00FAro que quer\u00E9s borrar el proyecto completo?\n\nEsta acci\u00F3n no se puede deshacer.”))return;
if(!window.confirm(”\u2713\u2713 \u00DAltima confirmaci\u00F3n: \u00BFBorrar todo el proyecto?”))return;
res.length=0;
Object.values(mods).forEach(function(m){m.guardado=false;unlockCard(m.id);uSv(m.id)});
rCar();renderRes();
}

function rCar(){
var ch=document.getElementById(“cchs”),t=document.getElementById(“cct”),bg=document.getElementById(“nbg”);
if(!ch)return;
if(!res.length){
ch.innerHTML=”<span class='cce'>Guard\u00E1 cortes para verlos ac\u00E1 \u2192</span>”;
t.style.display=“none”;bg.style.display=“none”;return;
}
var tp=res.flatMap(function(r){return r.items}).reduce(function(s,p){return s+(p.cant||1)*(p.reps||1)},0);
ch.innerHTML=res.map(function(r){
var p=r.items[0];
var dot=p.colorHex?’<span class="ccd" style="background:'+p.colorHex+'"></span>’:””;
var lbl;
if(r.tipo===“Puerta”){
lbl=(p.ancho!==”–”&&p.alto!==”–”)?fm(p.ancho)+”\u00D7”+fm(p.alto):(p.ancho!==”–”?“A:”+fm(p.ancho):“H:”+fm(p.alto));
} else {
lbl=r.items.length+” caj\u00F3n”+(r.items.length>1?“es”:””);
}
var nm=p.nombre.length>13?p.nombre.slice(0,12)+”\u2026”:p.nombre;
return ‘<span class="cch">’+dot+nm+” \u00B7 “+lbl+”</span>”;
}).join(””);
t.textContent=tp+” pz”;t.style.display=“block”;
bg.textContent=res.length;bg.style.display=“inline-block”;
}

function renderRes(){
var c=document.getElementById(“cont-res”);if(!c)return;
if(!res.length){
c.innerHTML=’<div class="emp"><div class="ei">📋</div><p style="font-weight:700;color:#1a2035;margin-bottom:3px">Resumen vac\u00EDo</p><p>Guard\u00E1 cortes desde Puertas o Cajones.</p></div>’;
return;
}
var todos=res.flatMap(function(r){return r.items});
var tp=todos.reduce(function(s,p){return s+(p.cant||1)*(p.reps||1)},0);
var pu=res.filter(function(r){return r.tipo===“Puerta”}),ca=res.filter(function(r){return r.tipo===“Caj\u00F3n”});
var html=’<div class="totb"><div><div class="totl">Total del proyecto</div>’
+’<div class="totn">’+tp+’ <span style="font-size:.82rem;color:rgba(255,255,255,.5);font-weight:600">piezas</span></div></div>’
+’<div style="text-align:right;font-size:.7rem;color:rgba(255,255,255,.48)">’+pu.length+’ entr. puerta \u00B7 ‘+ca.length+’ entr. caj\u00F3n</div></div>’;
function grp(lista,tit,ic){
if(!lista.length)return””;
var s=’<div class="gl">’+ic+” “+tit+”</div>”;
var num=1;
lista.forEach(function(r){
r.items.forEach(function(p){
var med=(p.ancho!==”–”&&p.alto!==”–”)?fm(p.ancho)+”\u00D7”+fm(p.alto):(p.ancho!==”–”?“A:”+fm(p.ancho):“H:”+fm(p.alto));
var mt=p.mat?p.mat.charAt(0).toUpperCase()+p.mat.slice(1):””;
var dot=p.colorHex?’<span class="rdot" style="background:'+p.colorHex+'"></span>’:””;
var pz=(p.cant||1)*(p.reps||1);
s+=’<div class="ri">’
+’<span class="rin">’+num+’</span>’
+’<span class="rnm" title="'+p.nombre+'">’+p.nombre+’</span>’
+’<span class="rmd">’+med+’ cm</span>’
+’<span class="rmt">’+dot+mt+(p.color?” \u00B7 “+p.color:””)+’</span>’
+’<span class="rpz">’+pz+’ pz</span>’
+’<button class="red" onclick="editarItem('+r.modId+')">✏ Editar</button>’
+’</div>’;
num++;
});
});
return s+’<div class="gg"></div>’;
}
html+=grp(pu,“PUERTAS”,”🚪”)+grp(ca,“CAJONES”,”📦”);
c.innerHTML=html;
}

function compartir(){
var titulo=(document.getElementById(“rtit”)?.value||“Resumen de cortes”).trim();
var todos=res.flatMap(function(r){return r.items});
if(!todos.length){alert(“El resumen est\u00E1 vac\u00EDo. Guard\u00E1 al menos un corte primero.”);return}
var texto=titulo+”\n”+”–”.repeat(16)+”\n\n”;
todos.forEach(function(p,i){
var med=(p.ancho!==”–”&&p.alto!==”–”)?fm(p.ancho)+” x “+fm(p.alto)+” cm”:(p.ancho!==”–”?“Ancho: “+fm(p.ancho)+” cm”:“Alto: “+fm(p.alto)+” cm”);
var pz=(p.cant||1)*(p.reps||1);
texto+=(i+1)+”. “+p.nombre+”\n   Medida: “+med+”\n   Material: “+p.mat+(p.color?” \u00B7 “+p.color:””)+”\n   Piezas: “+pz+”\n\n”;
});
texto+=“Total: “+todos.reduce(function(s,p){return s+(p.cant||1)*(p.reps||1)},0)+” piezas\nGenerado con Carpincho”;
if(navigator.share!==undefined){
navigator.share({title:titulo,text:texto}).catch(function(e){if(e.name!==“AbortError”)copiarCB(texto)});
} else {copiarCB(texto)}
}
function copiarCB(t){
if(navigator.clipboard&&window.isSecureContext){
navigator.clipboard.writeText(t).then(function(){alert(”\u2713 Resumen copiado. Peg\u00E1lo en WhatsApp, mail, etc.”)}).catch(function(){fbCopiar(t)});
} else {fbCopiar(t)}
}
function fbCopiar(t){
var ta=document.createElement(“textarea”);ta.value=t;ta.style.position=“fixed”;ta.style.opacity=“0”;
document.body.appendChild(ta);ta.select();
try{document.execCommand(“copy”);alert(”\u2713 Resumen copiado al portapapeles.”);}
catch(e){alert(“No se pudo copiar.\n\n”+t);}
document.body.removeChild(ta);
}

function descargarHTML(){
var titulo=(document.getElementById(“rtit”)?.value||“Resumen Carpincho”).trim();
var todos=res.flatMap(function(r){return r.items});
if(!todos.length){alert(“El resumen est\u00E1 vac\u00EDo. Guard\u00E1 al menos un corte primero.”);return}
var pu=res.filter(function(r){return r.tipo===“Puerta”}),ca=res.filter(function(r){return r.tipo===“Caj\u00F3n”});
var tp=todos.reduce(function(s,p){return s+(p.cant||1)*(p.reps||1)},0);
var fecha=new Date().toLocaleDateString(“es-AR”);
function grpH(lista,tit,ic){
if(!lista.length)return””;
var n=1;
var rows=lista.flatMap(function(r){return r.items}).map(function(p){
var med=(p.ancho!==”–”&&p.alto!==”–”)?fm(p.ancho)+” x “+fm(p.alto)+” cm”:(p.ancho!==”–”?“A: “+fm(p.ancho)+” cm”:“H: “+fm(p.alto)+” cm”);
var pz=(p.cant||1)*(p.reps||1);
var ds=p.colorHex?“display:inline-block;width:10px;height:10px;border-radius:50%;background:”+p.colorHex+”;border:1px solid rgba(0,0,0,.15);margin-right:4px;vertical-align:middle”:“display:none”;
return “<tr><td style='padding:8px 10px;color:#888;font-size:12px'>”+(n++)+”</td>”
+”<td style='padding:8px 10px;font-weight:700;font-size:13px'>”+p.nombre+”</td>”
+”<td style='padding:8px 10px;font-family:monospace;font-size:15px;font-weight:900;color:#1a3a70'>”+med+”</td>”
+”<td style='padding:8px 10px;font-size:12px;color:#555'><span style='"+ds+"'></span>”+p.mat+(p.color?” \u00B7 “+p.color:””)+”</td>”
+”<td style='padding:8px 10px;text-align:center'><span style='background:#2a5298;color:#fff;border-radius:20px;padding:2px 9px;font-size:12px;font-weight:800'>”+pz+” pz</span></td>”
+”</tr>”;
}).join(””);
return “<h3 style='margin:20px 0 8px;font-size:13px;color:#1a3a70;border-bottom:2px solid #dde2ed;padding-bottom:5px;text-transform:uppercase;letter-spacing:.5px'>”+ic+” “+tit+”</h3>”
+”<table style='width:100%;border-collapse:collapse;font-family:Barlow,sans-serif'>”+rows+”</table>”;
}
var docHtml=”<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'><title>”+titulo+”</title>”
+”<link href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700&display=swap' rel='stylesheet'>”
+”<style>body{font-family:Barlow,sans-serif;padding:24px;max-width:760px;margin:0 auto;background:#f4f5f8;color:#1a2035}table tr:nth-child(even) td{background:#f8f9fc}@media print{body{background:#fff;padding:12px}}</style>”
+”</head><body>”
+”<div style='background:#1a3a70;border-radius:12px;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px'>”
+”<div><div style='font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px'>Carpincho \u00B7 “+fecha+”</div>”
+”<div style='font-family:Barlow Condensed,sans-serif;font-size:1.6rem;font-weight:900;color:#e8b84b'>”+titulo+”</div></div>”
+”<div style='font-family:Barlow Condensed,sans-serif;font-size:2rem;font-weight:900;color:#e8b84b;text-align:right'>”+tp+”<div style='font-size:.8rem;color:rgba(255,255,255,.5);font-weight:600'>piezas totales</div></div>”
+”</div>”
+grpH(pu,“PUERTAS”,”🚪”)+grpH(ca,“CAJONES”,”📦”)
+”<div style='margin-top:24px;font-size:10px;color:#aaa;text-align:center;padding-top:12px;border-top:1px solid #dde2ed'>Generado con Carpincho \u00B7 “+fecha+”</div>”
+”</body></html>”;
try{
var blob=new Blob([docHtml],{type:“text/html;charset=utf-8”});
var url=URL.createObjectURL(blob);
var a=document.createElement(“a”);a.href=url;
a.download=(titulo.replace(/[^a-z0-9]/gi,””).trim().replace(/ +/g,”_”)||“carpincho”)+”.html”;
document.body.appendChild(a);a.click();
setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url)},500);
}catch(e){alert(“No se pudo descargar. Intent\u00E1 desde otro navegador.”)}
}

window.addEventListener(“DOMContentLoaded”,function(){
aM(“puerta”);
aM(“cajon”);
if(window.innerWidth<640)closeSb();
});
