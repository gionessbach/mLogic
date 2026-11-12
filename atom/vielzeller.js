// mAtom – Vielzeller: Aufbau-Ebenen E6/E7 (Bauanleitung v2).
// Wird vor dem Haupt-Skript geladen; das Haupt-Skript ruft VZ.init() auf.
// Nutzt dessen globale Helfer erst zur Laufzeit ($, lade, sichere, zeige, zeigeKarten, schalteFrei, endeZeigen, startScreen …).
'use strict';
window.VZ=(function(){
// ---------- Hilfen ----------
const rngV=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
const inSil=(S,x,y)=>S.polys.some(p=>inPoly(x,y,p))&&!S.holes.some(h=>inPoly(x,y,h));
const ellipse=(cx,cy,rx,ry,n=18)=>[...Array(n)].map((_,k)=>[cx+Math.cos(k/n*6.283)*rx,cy+Math.sin(k/n*6.283)*ry]);
const blatt=(x,y,dir,len)=>[[x,y-.03],[x+dir*len*.45,y-.085],[x+dir*len,y-.08],[x+dir*len*.75,y-.02],[x,y+.03]];
const fmt=v=>(Math.round(v*10)/10).toLocaleString('de-DE');
const pts=P=>P.map(p=>(p[0]*1000).toFixed(1)+','+(p[1]*1000).toFixed(1)).join(' ');
function centroid(P){let a=0,cx=0,cy=0;for(let i=0;i<P.length;i++){const[x0,y0]=P[i],[x1,y1]=P[(i+1)%P.length],f=x0*y1-x1*y0;a+=f;cx+=(x0+x1)*f;cy+=(y0+y1)*f}return a?[cx/(3*a),cy/(3*a)]:P[0]}

// ---------- Silhouetten (Normkoordinaten 0–1, y nach unten) ----------
const SIL={
 // Vase mit Hohlraum, Öffnung (Osculum) oben; Wand ca. 3 Zellen dick
 schwamm:{polys:[[[.33,.10],[.30,.22],[.25,.36],[.22,.50],[.23,.64],[.27,.76],[.34,.86],[.42,.91],[.50,.93],[.58,.91],[.66,.86],[.73,.76],[.77,.64],[.78,.50],[.75,.36],[.70,.22],[.67,.10]]],
  holes:[[[.43,.0],[.42,.20],[.39,.36],[.37,.50],[.38,.62],[.42,.71],[.50,.74],[.58,.71],[.62,.62],[.63,.50],[.61,.36],[.58,.20],[.57,.0]]],
  teil:(x,y)=>y>.53?1:2,start:[.5,.87]},
 moos:{polys:[[[.47,.20],[.53,.20],[.54,.71],[.46,.71]],ellipse(.5,.2,.09,.06),blatt(.47,.36,-1,.17),blatt(.47,.52,-1,.19),blatt(.53,.44,1,.18),blatt(.53,.60,1,.17),blatt(.47,.66,-1,.12),[[.36,.70],[.64,.70],[.60,.92],[.40,.92]]],
  holes:[],teil:(x,y)=>y>.46?1:2,start:[.5,.70],boden:.70},
 pilz:{polys:[[[.05,.16],[.95,.16],[.95,.92],[.05,.92]]],holes:[],teil:(x,y)=>y>.58?1:2,start:[.5,.58],boden:.58}
};

// ---------- Raster ----------
// Tiere: Voronoi-Mosaik aus gejitterten Punkten (Lloyd), Punkte außerhalb begrenzen die Zellen am Rand
function clip(P,L,mx,my,nx,ny,j){const o=[],ol=[],n=P.length,sd=p=>(p[0]-mx)*nx+(p[1]-my)*ny;
 for(let k=0;k<n;k++){const A=P[k],B=P[(k+1)%n],a=sd(A),b=sd(B),I=()=>{const t=a/(a-b);return[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]};
  if(a<=0){o.push(A);ol.push(L[k]);if(b>0){o.push(I());ol.push(j)}}else if(b<=0){o.push(I());ol.push(L[k])}}
 return[o,ol]}
function voro(S,d){const out=[];S.forEach((s,i)=>{if(!s.in)return;let P=[[s.x-2*d,s.y-2*d],[s.x+2*d,s.y-2*d],[s.x+2*d,s.y+2*d],[s.x-2*d,s.y+2*d]],L=[-1,-1,-1,-1];
  S.forEach((t,j)=>{if(j===i)return;const dx=t.x-s.x,dy=t.y-s.y;if(dx*dx+dy*dy>9*d*d)return;[P,L]=clip(P,L,(s.x+t.x)/2,(s.y+t.y)/2,dx,dy,j)});out.push({i,poly:P,lab:L})});return out}
function mosaik(sil,d,seed){const r=rngV(seed),S=[];let row=0;
 for(let y=-.06;y<=1.06;y+=d*.87,row++)for(let x=-.06+(row%2?d/2:0);x<=1.06;x+=d){const px=x+(r()-.5)*d*.5,py=y+(r()-.5)*d*.5;
  S.push({x:px,y:py,in:inSil(sil,px,py),hole:sil.holes.some(h=>inPoly(px,py,h))})}
 let C;for(let it=0;it<3;it++){C=voro(S,d);if(it<2)C.forEach(c=>{const[cx,cy]=centroid(c.poly);if(inSil(sil,cx,cy)){S[c.i].x=cx;S[c.i].y=cy}})}
 const idx=new Map();C.forEach((c,k)=>idx.set(c.i,k));
 return C.map(c=>{const s=S[c.i],nb=new Set(),z={};
  c.lab.forEach((j,e)=>{const P=c.poly[e],Q=c.poly[(e+1)%c.poly.length];if(Math.hypot(P[0]-Q[0],P[1]-Q[1])<d*.15)return;
   if(j<0){z.aussen=1;return}const t=S[j];if(t.in)nb.add(idx.get(j));else if(t.hole)z.innen=1;else z.aussen=1});
  return{x:s.x,y:s.y,poly:c.poly,nb:[...nb],zone:z}})}
// Pflanzen: gleichmäßige Sechsecke
function hexgit(sil,r){const U=[],dx=Math.sqrt(3)*r;let row=0;
 for(let y=r;y<1;y+=1.5*r,row++)for(let x=r+(row%2?dx/2:0);x<1;x+=dx)if(inSil(sil,x,y))
  U.push({x,y,poly:[...Array(6)].map((_,k)=>{const a=(30+60*k)*Math.PI/180;return[x+Math.cos(a)*r*.93,y+Math.sin(a)*r*.93]}),zone:{}});
 U.forEach((u,i)=>{u.nb=[];U.forEach((v,j)=>{if(i!==j&&Math.hypot(u.x-v.x,u.y-v.y)<dx*1.1)u.nb.push(j)});if(u.nb.length<6)u.zone.rand=1});return U}
// Pilze: Dreiecks-Knotengitter, jede Kante = eine Hyphenzelle
function hyphen(sil,a){const N=[];let row=0;
 for(let y=sil.boden-Math.ceil((sil.boden-.06)/(a*.866))*a*.866;y<.98;y+=a*.866,row++)for(let x=.06+(row%2?a/2:0);x<.97;x+=a)if(inSil(sil,x,y))N.push([x,y]);
 const U=[],ne=N.map(()=>[]);
 for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++)if(Math.hypot(N[i][0]-N[j][0],N[i][1]-N[j][1])<a*1.05){
  ne[i].push(U.length);ne[j].push(U.length);U.push({x:(N[i][0]+N[j][0])/2,y:(N[i][1]+N[j][1])/2,seg:[N[i],N[j]],kn:[i,j],zone:{}})}
 U.forEach((u,k)=>{u.nb=[...new Set([...ne[u.kn[0]],...ne[u.kn[1]]])].filter(x=>x!==k)});return{U,N,ne}}
const RASTER={};
function raster(form,silId){const key=form+silId;if(RASTER[key])return RASTER[key];const sil=SIL[silId];let U,N=null,ne=null,gr;
 if(form==='mosaik'){U=mosaik(sil,.072,7);gr=.072}else if(form==='hex'){U=hexgit(sil,.03);gr=.052}else{({U,N,ne}=hyphen(sil,.075));gr=.075}
 U.forEach(u=>{u.ab=sil.teil(u.x,u.y);if(sil.boden!=null){if(u.y>sil.boden)u.zone.unter=1;else u.zone.ober=1}});
 const[sx,sy]=sil.start,nah=arr=>arr.reduce((b,p,i)=>{const d=Math.hypot(p[0]-sx,p[1]-sy);return d<b[0]?[d,i]:b},[9,-1])[1];
 if(N){const k=nah(N);ne[k].forEach(i=>U[i].seed=1);U.spore=N[k]}else U[nah(U.map(u=>[u.x,u.y]))].seed=1;
 U.gr=gr;U.N=N;return RASTER[key]=U}

// ---------- Inhalte ----------
const WERTE={ernaehrung:'Ernährung',versorgung:'Versorgung',schutz:'Schutz',stuetze:'Stütze',energie:'Energie',wasser:'Wasser',halt:'Halt',nahrung:'Nahrung',ausbreitung:'Ausbreitung'};
const NUR={innen:'nur an der Innenseite',aussen:'nur an der Außenseite',ober:'nur oberirdisch',unter:'nur im Boden'};
const anz=(V,f)=>V.U.reduce((n,u,i)=>n+(f(u,V.bel[i],i)?1:0),0);
const REICHE={
 tiere:{name:'Tier',form:'mosaik',farbe:'#6EC1F0',e6:{titel:'Spezialisierte Zellen',ziel:'Schwamm',sil:'schwamm',werte:['ernaehrung','versorgung','schutz','stuetze'],
  zellen:[
   {id:'deck',n:'Deckzelle',l:'Pinakozyte',c:'#6EC1F0',k:2,w:{schutz:1},info:'Schutz +1'},
   {id:'kragen',n:'Kragengeißelzelle',l:'Choanozyte',c:'#5DD39E',k:3,w:{ernaehrung:1},nur:'innen',info:'Ernährung +1 · nur innen'},
   {id:'pore',n:'Porenzelle',l:'Porozyte',c:'#F2E36B',k:2,w:{versorgung:1},info:'Versorgung +1 · Wasser strömt ein'},
   {id:'amoeb',n:'Amöbozyte',l:'Wanderzelle',c:'#FFA552',k:3,w:{versorgung:1,stuetze:1},info:'Versorgung +1 · Stütze +1 (Skelettnadeln)'}],
  versorgung:{quellen:['pore','amoeb'],max:2,txt:'höchstens 2 Felder von einer Poren- oder Wanderzelle'},
  abschnitte:[
   {name:'Fuß und Becher',check:[
     {t:'Außenseite unten: Deck- oder Porenzellen',f:V=>[anz(V,(u,t)=>u.zone.aussen&&u.ab===1&&(t==='deck'||t==='pore')),anz(V,u=>u.zone.aussen&&u.ab===1)]},
     {t:'mindestens 4 Porenzellen',f:V=>[anz(V,(u,t)=>t==='pore'),4]},
     {t:'Innenseite: mindestens 6 Kragengeißelzellen',f:V=>[anz(V,(u,t)=>t==='kragen'),6]}],
    probe:{id:'filtern',name:'Wasser filtern',txt:'Wasser strömt durch die Poren, die Kragengeißelzellen fischen Nahrung heraus.',ziele:{ernaehrung:6,versorgung:5}},
    ereignisse:['mangel','ruhig']},
   {name:'Wand bis zur Öffnung',check:[
     {t:'Wand bis zur Öffnung geschlossen (ganze Außenseite)',f:V=>[anz(V,(u,t)=>u.zone.aussen&&(t==='deck'||t==='pore')),anz(V,u=>u.zone.aussen)]},
     {t:'Jede Zelle versorgt (höchstens 2 Felder von Poren- oder Wanderzelle)',f:V=>[V.unv.size?0:1,1],ja:1}],
    probe:{id:'wachsen',name:'Wachsen',txt:'Der Schwamm wird größer – Skelettnadeln stützen, Deckzellen schützen.',ziele:{stuetze:3,schutz:18}},
    ereignisse:['kaelte','uv','stroemung','ruhig']}],
  auto:V=>{const m={},au=[],inn=[];V.U.forEach((u,i)=>{if(u.ab>V.ab)return;if(u.zone.aussen)au.push(i);else if(u.zone.innen&&!V.bel[i])inn.push(i)});
   inn.sort((a,b)=>V.U[b].y-V.U[a].y).slice(0,Math.max(0,(ziele().ernaehrung||0)-anz(V,(u,t)=>t==='kragen'))).forEach(i=>m[i]='kragen');
   au.sort((a,b)=>Math.atan2(V.U[a].y-.5,V.U[a].x-.5)-Math.atan2(V.U[b].y-.5,V.U[b].x-.5));
   const np=Math.max(4,Math.round(au.length/5));au.forEach((i,k)=>m[i]=k%Math.ceil(au.length/np)===0?'pore':'deck');return m}},
  e7:null},
 pflanzen:{name:'Pflanze',form:'hex',farbe:'#5DD39E',e6:{titel:'Erste Landpflanze',ziel:'Moos',sil:'moos',werte:['energie','wasser','halt','schutz'],
  zellen:[
   {id:'chlor',n:'Assimilationszelle',l:'Chlorenchym',c:'#5DD39E',k:2,w:{energie:1},nur:'ober',info:'Energie +1 · nur oberirdisch'},
   {id:'epi',n:'Epidermis',l:'Abschlussgewebe',c:'#F2E36B',k:2,w:{schutz:1},info:'Schutz +1 (Verdunstungsschutz)'},
   {id:'rhiz',n:'Rhizoid',l:'Haftfaden',c:'#FF7A6B',k:2,w:{halt:1,wasser:.5},nur:'unter',info:'Halt +1, Wasser +0,5 · nur im Boden'},
   {id:'speicher',n:'Speicherzelle',l:'Parenchym',c:'#FFA552',k:1,w:{wasser:.5},info:'Wasser +0,5'}],
  versorgung:{quellen:['rhiz','speicher'],max:3,txt:'höchstens 3 Felder von Wasser (Rhizoid oder Speicher)'},
  abschnitte:[{name:'Stämmchen und Boden',check:[],probe:null},{name:'Blättchen',check:[],probe:null}]},e7:null},
 pilze:{name:'Pilz',form:'hyphen',farbe:'#FFA552',e6:{titel:'Myzel',ziel:'Schimmelpilz',sil:'pilz',werte:['nahrung','versorgung','ausbreitung','schutz'],
  zellen:[
   {id:'naehr',n:'Nährhyphe',l:'im Substrat',c:'#5DD39E',k:1,w:{nahrung:1},nur:'unter',info:'Nahrung +1 · nur im Substrat'},
   {id:'trans',n:'Transporthyphe',l:'Leitung',c:'#FFA552',k:2,w:{versorgung:1},info:'Versorgung +1'},
   {id:'luft',n:'Lufthyphe',l:'mit Sporenträger',c:'#A98BF0',k:3,w:{ausbreitung:1},nur:'ober',info:'Ausbreitung +1 · nur über dem Substrat'},
   {id:'dunkel',n:'Schutzhyphe',l:'dunkel (Melanin)',c:'#FF7A6B',k:2,w:{schutz:1},info:'Schutz +1'}],
  versorgung:{quellen:['trans'],max:3,nurFuer:['naehr'],txt:'jede Nährhyphe höchstens 3 Kanten von einer Transporthyphe'},
  abschnitte:[{name:'Myzel im Substrat',check:[],probe:null},{name:'Luftraum',check:[],probe:null}]},e7:null}
};
const EREIGNISSE={
 kaelte:{n:'Kälte',w:'schutz',p:2},stroemung:{n:'Strömung',w:'stuetze',p:2},mangel:{n:'Nährstoffmangel',w:'ernaehrung',p:2},
 uv:{n:'UV-Strahlung',w:'schutz',p:1},ruhig:{n:'Ruhige Zeit',w:null,p:0}};
const SCHWAMM={id:'schwamm',name:'Schwamm',xp:250,stufe:3,form:'schwamm',c:'#F2E36B',weg:'Vielzeller-Tier ohne echte Gewebe (Ebene 6)',
 fakten:['Die einfachsten Tiere – ohne Nerven und Muskeln.','Filtern Nahrung aus dem Wasser, das durch ihre Poren strömt.','Zerteilte Schwämme können sich aus einzelnen Zellen neu zusammensetzen.']};

// ---------- Zustand ----------
let V=null;
const reichAus=run=>run.reich||(run.wand==='cellulose'?'pflanzen':run.wand==='chitin'?'pilze':'tiere');
const cfgE=()=>REICHE[V.reich]['e'+V.e];
const typ=id=>cfgE().zellen.find(z=>z.id===id);
const abs=()=>cfgE().abschnitte[V.ab-1];
function starte(e,run){run=run||lade('run',null);const reich=reichAus(run);run.reich=reich;run.ebene=e;
 const rk=REICHE[reich],c=rk['e'+e],U=raster(rk.form,c.sil),a=run.aufbau&&run.aufbau.e===e?run.aufbau:null;
 const stabMax=3+(run.vzStab||0);
 V={run,reich,e,U,ab:a?a.ab:1,budget:a?a.budget:(run.vzBudget||70),typ:c.zellen[0].id,bel:U.map((_,i)=>a&&a.bel[i]||null),
  stab:a?a.stab:stabMax,stabMax,fehl:a?a.fehl:false,probe:false,unv:new Set()};
 if(!a){run.aufbau=null}sichere('run',run);
 baueBrett();malPalette();aktualisiere();zeige('vz');hinweis(V.ab===1?'Tippe auf das gelb markierte Startfeld – deine Zellen wachsen von dort aus.':'')}
function speichere(){V.run.aufbau={e:V.e,ab:V.ab,budget:V.budget,bel:V.bel,stab:V.stab,fehl:V.fehl};sichere('run',V.run)}
function ereignis(){const A=abs();if(!A.ereignisse)return null;const r=rngV((V.run.seed|0)+V.e*31+V.ab*7)();return EREIGNISSE[A.ereignisse[Math.floor(r*A.ereignisse.length)]]}
function ziele(){const A=abs();if(!A.probe)return{};const z={...A.probe.ziele},ev=ereignis();if(ev&&ev.w&&z[ev.w]!=null)z[ev.w]+=ev.p;return z}
// Versorgung: BFS über belegte Zellen von den Quellen aus
function rechne(){const c=cfgE(),vs=c.versorgung,dist=new Array(V.U.length).fill(Infinity),q=[];V.unv=new Set();
 if(vs){V.bel.forEach((t,i)=>{if(t&&vs.quellen.includes(t)){dist[i]=0;q.push(i)}});
  for(let h=0;h<q.length;h++){const i=q[h];for(const j of V.U[i].nb)if(V.bel[j]&&dist[j]>dist[i]+1){dist[j]=dist[i]+1;q.push(j)}}
  V.bel.forEach((t,i)=>{if(t&&dist[i]>vs.max&&(!vs.nurFuer||vs.nurFuer.includes(t)))V.unv.add(i)})}
 const w={};c.werte.forEach(k=>w[k]=0);V.bel.forEach((t,i)=>{if(!t||V.unv.has(i))return;const T=typ(t);for(const k in T.w)w[k]=(w[k]||0)+T.w[k]});
 V.w=w;V.checks=abs().check.map(ch=>{const[ist,soll]=ch.f(V);return{t:ch.t,ist,soll,ok:ist>=soll,ja:ch.ja}});
 V.bereit=!!abs().probe&&V.checks.every(c=>c.ok)}
const belegbar=i=>{const u=V.U[i];return u.seed||u.nb.some(j=>V.bel[j])};
function verbunden(ohne){const B=V.bel.map((t,i)=>t&&i!==ohne);const st=[];B.forEach((b,i)=>{if(b&&V.U[i].seed)st.push(i)});
 const seen=new Set(st);for(let h=0;h<st.length;h++)for(const j of V.U[st[h]].nb)if(B[j]&&!seen.has(j)){seen.add(j);st.push(j)}
 return B.every((b,i)=>!b||seen.has(i))}
function setze(i,t){const u=V.U[i],T=typ(t);
 if(V.bel[i])return'belegt';
 if(u.ab>V.ab)return hinweis('Dieser Teil wird in Abschnitt '+u.ab+' frei.');
 if(!belegbar(i))return hinweis('Zellen wachsen nur an schon vorhandene Zellen an.');
 if(T.nur&&!u.zone[T.nur])return hinweis(T.n+': '+NUR[T.nur]+'.');
 if(V.budget<T.k)return hinweis('Zu wenig Biomasse – entferne Zellen (50 % zurück) oder schaff die Lebensprobe.');
 V.bel[i]=t;V.budget-=T.k;return true}
function entferne(i){if(!V.bel[i])return false;if(!verbunden(i))return hinweis('Das würde deinen Körper zerteilen.');
 V.budget+=typ(V.bel[i]).k/2;V.bel[i]=null;return true}

// ---------- Darstellung ----------
let hT=0;function hinweis(t){const h=$('vzHint');h.textContent=t||'';h.classList.toggle('on',!!t);clearTimeout(hT);if(t)hT=setTimeout(()=>h.classList.remove('on'),3200);return false}
function baueBrett(){const c=cfgE(),sil=SIL[c.sil],U=V.U;let s='';
 if(sil.boden!=null)s+=`<rect x="0" y="${sil.boden*1000}" width="1000" height="${(1-sil.boden)*1000}" fill="#2E2A24"/><line x1="0" y1="${sil.boden*1000}" x2="1000" y2="${sil.boden*1000}" stroke="#5A5955" stroke-width="4" stroke-dasharray="14 10"/>`;
 sil.holes.forEach(h=>s+=`<polygon points="${pts(h)}" fill="#22303A"/>`);
 if(c.sil==='schwamm')s+='<text x="500" y="40" fill="#6EC1F0" font-size="26" text-anchor="middle" opacity=".7">Öffnung (Osculum)</text><text x="500" y="420" fill="#6EC1F0" font-size="24" text-anchor="middle" opacity=".55">Hohlraum</text>';
 s+='<g id="vzZ">'+U.map((u,i)=>u.seg?`<line data-i="${i}" x1="${u.seg[0][0]*1000}" y1="${u.seg[0][1]*1000}" x2="${u.seg[1][0]*1000}" y2="${u.seg[1][1]*1000}" stroke-linecap="round"/>`
  :`<polygon data-i="${i}" points="${pts(u.poly)}" stroke-linejoin="round"/>`).join('')+'</g>';
 if(U.N)s+='<g fill="#5A5955">'+U.N.map(n=>`<circle cx="${n[0]*1000}" cy="${n[1]*1000}" r="5"/>`).join('')+`</g><circle cx="${U.spore[0]*1000}" cy="${U.spore[1]*1000}" r="13" fill="#FDD602"/>`;
 s+='<g id="vzMark" pointer-events="none"></g><g id="vzFx" pointer-events="none"></g>';
 $('vzSvg').innerHTML=s}
function malZellen(){const U=V.U,hy=!!U.N;let mk='';
 $('vzZ').querySelectorAll('[data-i]').forEach(el=>{const i=+el.dataset.i,u=U[i],t=V.bel[i],zu=u.ab>V.ab,frei=!t&&!zu&&belegbar(i);
  const T=t&&typ(t),z=u.zone;
  if(hy){el.setAttribute('stroke',t?T.c:frei?'#8A8984':'#3A3A38');el.setAttribute('stroke-width',t?16:frei?6:4);el.setAttribute('opacity',zu?.35:1)}
  else{el.setAttribute('fill',t?T.c:frei?'#45443F':'#31312F');el.setAttribute('opacity',zu?.3:1);
   el.setAttribute('stroke',t?'#262625':z.aussen&&V.reich==='tiere'?'#3E6A84':z.innen?'#3B7258':'#3A3A38');el.setAttribute('stroke-width',t?3:z.aussen||z.innen?5:3)}
  if(V.unv.has(i))mk+=`<circle cx="${u.x*1000}" cy="${u.y*1000}" r="15" fill="#262625"/><text x="${u.x*1000}" y="${u.y*1000+8}" font-size="24" font-weight="700" text-anchor="middle" fill="#FF9B8F">!</text>`;
  else if(u.seed&&!t&&!hy)mk+=`<circle cx="${u.x*1000}" cy="${u.y*1000}" r="11" fill="none" stroke="#FDD602" stroke-width="5"/>`});
 $('vzMark').innerHTML=mk}
function malPalette(){$('vzPal').innerHTML=cfgE().zellen.map(z=>`<button class="vzT" data-t="${z.id}"><i style="background:${z.c}"></i><span><b>${z.n}</b><small>${z.l} · ${z.info}</small></span><em>${z.k}</em></button>`).join('');
 $('vzPal').querySelectorAll('.vzT').forEach(b=>b.onclick=()=>{V.typ=b.dataset.t;malPaletteWahl()});malPaletteWahl()}
function malPaletteWahl(){$('vzPal').querySelectorAll('.vzT').forEach(b=>{b.classList.toggle('on',b.dataset.t===V.typ);b.classList.toggle('teuer',typ(b.dataset.t).k>V.budget)})}
function malKopf(){const rk=REICHE[V.reich],c=cfgE(),run=V.run;
 $('vzTitel').textContent='Ebene '+V.e+' · '+c.titel+' · Abschnitt '+V.ab+'/2'+(run.test?' · TEST':'');
 $('vzBT').textContent=fmt(V.budget);$('vzBB').style.width=Math.min(100,V.budget)+'%';
 $('vzStab').innerHTML=[...Array(V.stabMax)].map((_,k)=>`<i class="${k<V.stab?'':'off'}"></i>`).join('');
 const W=typeof WAENDE!=='undefined'?WAENDE.find(w=>w.id===run.wand):null;
 $('vzWeg').innerHTML=[W?'Wand: '+W.name:'',run.mito?'Mitochondrium':'',run.chloro?'Chloroplast':'','Vielzeller: '+rk.name,'Ziel: '+c.ziel].filter(Boolean).map(t=>`<span class="chip">${t}</span>`).join('')}
function balkenHTML(anim){const z=ziele(),c=cfgE();
 return c.werte.map(k=>{const v=anim?anim[k]:V.w[k],ziel=z[k],max=Math.max(4,(ziel||0)*1.4,V.w[k]*1.1),st=V.erg&&ziel!=null?(V.w[k]>=ziel?' ok':' nein'):'';
  return `<div class="vzW${st}"><div class="lb"><span>${WERTE[k]}</span><b>${fmt(v)}${ziel!=null?' / '+ziel:''}</b></div><div class="bar"><i style="width:${v/max*100}%;transition:none"></i>${ziel!=null?`<u style="left:${ziel/max*100}%"></u>`:''}</div></div>`}).join('')}
function malPanel(){const A=abs(),ev=ereignis();
 $('vzCheck').innerHTML=`<div class="kl">Abschnitt ${V.ab}: ${A.name}</div>`+(A.check.length?V.checks.map(c=>`<div class="vzC${c.ok?' ok':''}"><i>${c.ok?'✓':''}</i><span>${c.t}</span>${c.ja?'':`<b>${Math.min(c.ist,c.soll)}/${c.soll}</b>`}</div>`).join(''):'<div class="vzC"><span>Checkliste und Lebensprobe für dieses Reich folgen im nächsten Bauschritt. Du kannst schon bauen.</span></div>');
 const vs=cfgE().versorgung;$('vzVers').textContent=vs?'Versorgung: '+vs.txt+' – sonst „!“ (zählt nicht).':'';
 $('vzEv').innerHTML=A.probe?`<div class="kl">Lebensprobe</div><b>${A.probe.name}</b><small>${A.probe.txt}</small>`+(ev?`<div class="vzEk"><span class="kl">Ereignis</span><b>${ev.n}</b><small>${ev.w?WERTE[ev.w]+'-Ziel +'+ev.p:'keine Erhöhung'}</small></div>`:''):'';
 $('vzBal').innerHTML=balkenHTML();
 const b=$('vzGo');b.disabled=!V.bereit||V.probe;b.textContent=V.probe?'Lebensprobe läuft …':'Lebensprobe starten'}
function aktualisiere(){rechne();malKopf();malZellen();malPanel();malPaletteWahl()}

// ---------- Bedienung: tippen oder überwischen ----------
function einheitBei(ev){const svg=$('vzSvg'),p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse()),x=q.x/1000,y=q.y/1000;
 let b=-1,bd=V.U.gr*(V.U.N?.45:.75);V.U.forEach((u,i)=>{const d=Math.hypot(u.x-x,u.y-y);if(d<bd){bd=d;b=i}});return b}
function bindeBrett(){const svg=$('vzSvg');let mode=null,pid=null,last=-1;
 const tun=i=>{if(i<0||i===last)return;last=i;let r;
  if(mode===null)mode=V.bel[i]?'weg':'setzen';
  if(mode==='weg')r=entferne(i);else r=setze(i,V.typ);
  if(r===true)aktualisiere()};
 svg.addEventListener('pointerdown',ev=>{if(!V||V.probe)return;ev.preventDefault();pid=ev.pointerId;svg.setPointerCapture(pid);mode=null;last=-1;tun(einheitBei(ev))});
 svg.addEventListener('pointermove',ev=>{if(ev.pointerId!==pid||!V)return;tun(einheitBei(ev))});
 const ende=ev=>{if(ev.pointerId!==pid)return;pid=null;if(V&&V.bel.some(Boolean))speichere()};
 svg.addEventListener('pointerup',ende);svg.addEventListener('pointercancel',ende)}

// ---------- Lebensprobe ----------
function probe(){if(!V.bereit||V.probe)return;V.probe=true;V.erg=false;malPanel();const A=abs(),dauer=7000,t0=performance.now(),fx=$('vzFx');
 const W=V.w,z=ziele(),U=V.U,poren=U.map((u,i)=>i).filter(i=>V.bel[i]==='pore'),amoeb=U.map((u,i)=>i).filter(i=>V.bel[i]==='amoeb');
 const teil=[...Array(36)].map((_,k)=>({k,src:poren.length?poren[k%poren.length]:0,off:Math.random()}));
 const schritt=now=>{const t=Math.min(1,(now-t0)/dauer);let s='';
  if(A.probe.id==='filtern'){teil.forEach(p=>{let f=((t*3+p.off)%1);const u=U[p.src],ax=u.x+(u.x-.5)*.5,ay=u.y,bx=.5,by=.55,cx=.5,cy=-.02;
    const x=f<.4?ax+(u.x-ax)*f/.4:f<.7?u.x+(bx-u.x)*(f-.4)/.3:bx+(cx-bx)*(f-.7)/.3,y=f<.4?ay+(u.y-ay)*f/.4:f<.7?u.y+(by-u.y)*(f-.4)/.3:by+(cy-by)*(f-.7)/.3;
    s+=`<circle cx="${x*1000}" cy="${y*1000}" r="7" fill="#6EC1F0" opacity=".85"/>`})}
  else if(A.probe.id==='wachsen'){amoeb.forEach((i,k)=>{const u=U[i],a=k*1.7+t*2,l=40*Math.min(1,t*1.5);
    s+=`<line x1="${u.x*1000-Math.cos(a)*l}" y1="${u.y*1000-Math.sin(a)*l}" x2="${u.x*1000+Math.cos(a)*l}" y2="${u.y*1000+Math.sin(a)*l}" stroke="#F2F1EC" stroke-width="4" stroke-linecap="round"/>`});
   $('vzZ').setAttribute('transform',`translate(500 600) scale(${1+.03*Math.sin(t*Math.PI*4)}) translate(-500 -600)`)}
  fx.innerHTML=s;
  const e=Math.min(1,t/.75),k=1-Math.pow(1-e,3),an={};for(const x in W)an[x]=W[x]*k;$('vzBal').innerHTML=balkenHTML(an);
  if(t<1)requestAnimationFrame(schritt);else{fx.innerHTML='';$('vzZ').removeAttribute('transform');ergebnis(z)}};
 if(V._sofort)ergebnis(z);else requestAnimationFrame(schritt)}
function ergebnis(z){V.erg=true;$('vzBal').innerHTML=balkenHTML();const fehlt=Object.keys(z).filter(k=>V.w[k]<z[k]),A=abs();
 if(!fehlt.length){V.budget+=30;
  zeigeRes('Bestanden!',`„${A.probe.name}“ geschafft. +30 Biomasse.`+(V.ab===1?' Jetzt wird der Rest der Silhouette frei.':''),V.ab===1?'Weiter zu Abschnitt 2':'Ebene abschließen',()=>{
   V.probe=false;V.erg=false;if(V.ab===1){V.ab=2;speichere();aktualisiere();hinweis('Abschnitt 2: '+abs().name)}else ebeneFertig()})}
 else{V.stab--;V.fehl=true;const txt=fehlt.map(k=>WERTE[k]+': '+fmt(z[k]-V.w[k])+' fehl'+(z[k]-V.w[k]===1?'t':'en')).join(' · ');
  if(V.stab<=0)return zeigeRes('Nicht bestanden',txt+'. Die Stabilität ist auf 0 gefallen.','Lauf beenden',gescheitert);
  speichere();zeigeRes('Nicht bestanden',txt+'. −1 Stabilität – bau nach und versuch es noch einmal.','Zurück zum Bauen',()=>{V.probe=false;V.erg=false;aktualisiere()})}
 malKopf()}
function zeigeRes(t,p,knopf,weiter){const R=$('vzRes');R.innerHTML=`<div class="card"><h2>${t}</h2><p>${p}</p><div class="row"><span></span><button class="btn pri">${knopf}</button></div></div>`;
 R.classList.add('on');R.querySelector('button').onclick=()=>{R.classList.remove('on');weiter()}}
function ebeneFertig(){const run=V.run,xp=V.e===6?50:70,bonus=V.fehl?0:Math.round(xp/2);
 run.xpLauf.push({label:'Ebene '+V.e+' geschafft',xp,bonus:0});if(bonus)run.xpLauf.push({label:'Erstversuch-Bonus (+50 %)',xp:bonus,bonus:0});
 if(!run.test)sichere('xp',lade('xp',0)+xp+bonus);
 run.vzStab=bonus?1:0;run.vzBudget=V.budget+30;run.aufbau=null;const nx='w'+V.e;run.ebene=nx;sichere('run',run);
 const n=V.bel.filter(Boolean).length;$('eExtra').innerHTML=`<div class="kl">Gebaut</div><div style="font-size:18px"><b>${n}</b> Zellen · Rest-Biomasse <b>${fmt(V.budget)}</b></div>`;
 V=null;endeZeigen(true,run,'Ebene '+(nx==='w6'?6:7)+' geschafft!',bonus?'Alle Lebensproben im ersten Versuch – Bonus-XP und +1 Stabilität in der nächsten Ebene.':'Dein Vielzeller hat alle Lebensproben bestanden.',nx)}
function gescheitert(){const run=V.run;V=null;sichere('run',null);$('eExtra').innerHTML='';
 endeZeigen(false,run,'Lauf gescheitert','Die Stabilität ist auf 0 gefallen – deine Kolonie ist zerfallen. Die XP der geschafften Ebenen bleiben dir erhalten.')}

// ---------- Weiche nach Ebene 6 ----------
function zeigeWeiche6(){const run=lade('run',null)||{xpLauf:[]},xp=xpFuer(run),reich=reichAus(run);
 const A={tiere:['schwamm','Schwamm','Echte Gewebe','Zwei Keimblätter, Nerven und Muskeln – Ziel: Qualle'],pflanzen:['moos','Moos','Leitgewebe','Wurzel, Spross und Blatt – Ziel: Farn'],pilze:['schimmel','Schimmelpilz','Fruchtkörper','Stiel und Hut aus Scheingewebe – Ziel: Fliegenpilz']}[reich];
 const g=G_(A[0]);
 zeigeKarten('Weiche · Ende Ebene 6','Wie geht es weiter mit deinem Vielzeller?','Du kannst jetzt sicher abschließen oder weiterbauen – mit echten Geweben wird es anspruchsvoller.',[
  {id:A[0],name:A[1],svg:g?skizze(g):'',weg:g?g.weg:'',folge:'Der Lauf endet: Du schaltest '+(A[0]==='schwamm'?'den':'das')+' '+A[1]+' frei.',kosten:'ab 250 XP ✓',zu:!g},
  {id:'e7',name:A[2],weg:A[3],folge:'Weiter zu Ebene 7.',kosten:'ab 500 XP (du: '+xp+') · Ebene 7 kommt mit dem nächsten Update',zu:true}],
  id=>{if(id!=='e7')schalteFrei(id,run)})}

// ---------- Skizzen für Lexikon/Weiche ----------
function skizzeForm(f,c){if(f==='schwamm')return `<path d="M17 8 L15 20 L11 34 L15 46 L28 50 L41 46 L45 34 L41 20 L39 8 L33 8 L34 22 L32 38 L28 40 L24 38 L22 22 L23 8Z" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>${[[16,28],[40,26],[20,42],[36,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="${c}"/>`).join('')}`;return ''}

// ---------- Einhängen ----------
const CSS=`
#vz{flex-direction:column;gap:10px}
#vzWeg{display:flex;gap:6px;flex-wrap:wrap}
.vzMain{flex:1;min-height:0;display:flex;gap:14px}
.vzBrett{position:relative;flex:1;min-width:0;min-height:0;background:var(--s2);border-radius:22px;overflow:hidden}
#vzSvg{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);touch-action:none}
#vzHint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:var(--s1);border:2px solid var(--y);color:var(--fg);border-radius:999px;padding:8px 16px;font-size:15px;display:none;max-width:92%;text-align:center}
#vzHint.on{display:block}
#vzRes{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(29,29,28,.55);padding:16px}#vzRes.on{display:flex}
.vzSeite{width:350px;flex:none;display:flex;flex-direction:column;gap:10px;overflow:auto;padding-right:2px}
.vzBox{background:var(--s1);border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:8px}
#vzPal{display:flex;flex-direction:column;gap:6px}
.vzT{display:flex;align-items:center;gap:10px;background:var(--s2);border:2px solid transparent;border-radius:14px;padding:5px 10px;text-align:left}
.vzT i{width:26px;height:26px;border-radius:8px;flex:none}.vzT span{flex:1;display:flex;flex-direction:column;line-height:1.25}
.vzT b{font-size:15px}.vzT small{font-size:12px;color:var(--mut)}.vzT em{font-style:normal;font-weight:700;color:var(--y);font-size:17px}
.vzT.on{border-color:var(--y)}.vzT.teuer em{color:var(--warn2)}
.vzC{display:flex;gap:8px;align-items:flex-start;font-size:14px;color:#DAD9D3}.vzC i{width:20px;height:20px;border-radius:6px;border:2px solid var(--l2);flex:none;font-style:normal;display:grid;place-items:center;font-size:13px;color:var(--bg)}
.vzC.ok i{background:#5DD39E;border-color:#5DD39E}.vzC span{flex:1}.vzC b{color:var(--mut);font-variant-numeric:tabular-nums}
#vzEv b{font-size:17px}#vzEv small{color:var(--mut);font-size:13px}
.vzEk{display:flex;flex-direction:column;gap:2px;border:2px dashed var(--l2);border-radius:12px;padding:8px 10px;margin-top:4px}
.vzW{display:flex;flex-direction:column;gap:4px}.vzW .lb{display:flex;justify-content:space-between;font-size:13px;color:var(--mut)}.vzW .lb b{color:var(--fg)}
.vzW .bar{position:relative;overflow:visible}.vzW .bar u{position:absolute;top:-4px;width:3px;height:18px;background:var(--fg);border-radius:2px;margin-left:-1px}
.vzW.ok .bar u{background:#5DD39E}.vzW.nein .bar u{background:var(--warn)}.vzW.nein .lb b{color:var(--warn2)}
#vzGoBox{position:sticky;bottom:0;box-shadow:0 -10px 18px rgba(38,38,37,.9)}#vzGo{width:100%}#vzGo:disabled{opacity:.4}
#vzVers{font-size:12px;color:var(--mut)}
@media (orientation:portrait){#vz{gap:8px}.vzMain{flex-direction:column;gap:8px}.vzSeite{width:auto;flex:none;max-height:52%;gap:8px}.vzBrett{min-height:0}
 #vzPal{flex-direction:row;overflow-x:auto}.vzT{min-width:150px}.vzT small,.vzTipp,#vzVers{display:none}.vzBox{padding:10px}
 #vzBal{display:grid!important;grid-template-columns:1fr 1fr;gap:6px 14px!important}#vzGo{min-height:46px;font-size:16px}
 #vz header .mass{width:120px}#vz header .tt span{font-size:12px}}
`;
const HTML=`<section id="vz" class="scr">
 <header><div class="logo" id="vzLogo"></div><div class="tt"><b>mAtom</b><span id="vzTitel"></span></div><div class="sp"></div>
  <div class="stab"><span>Stabilität</span><div class="pp" id="vzStab"></div></div>
  <div class="mass"><div class="lb"><span>Biomasse</span><b id="vzBT"></b></div><div class="bar"><i id="vzBB"></i></div></div>
  <button class="ib" id="vzPause" aria-label="Pause und speichern"><svg width="20" height="20" viewBox="0 0 20 20"><rect x="4" y="3" width="4" height="14" fill="#F2F1EC"/><rect x="12" y="3" width="4" height="14" fill="#F2F1EC"/></svg></button></header>
 <div id="vzWeg"></div>
 <div class="vzMain"><div class="vzBrett"><svg id="vzSvg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet"></svg><div id="vzHint"></div><div id="vzRes"></div></div>
  <div class="vzSeite"><div class="vzBox"><div class="kl">Zelltypen · Kosten in Biomasse</div><div id="vzPal"></div><small class="vzTipp" style="color:var(--mut);font-size:12px">Antippen oder überwischen = setzen · belegte Zelle antippen = entfernen (50 % zurück)</small></div>
   <div class="vzBox" id="vzCheck"></div><div class="vzBox" id="vzEv"></div><div class="vzBox" id="vzGoBox"><div id="vzBal" style="display:flex;flex-direction:column;gap:10px"></div><div id="vzVers"></div><button class="btn pri" id="vzGo">Lebensprobe starten</button></div></div></div>
</section>`;
function init(){const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 document.body.insertAdjacentHTML('beforeend',HTML);$('vzLogo').innerHTML=ATOM_SVG.replace(/%/g,36);
 bindeBrett();$('vzGo').onclick=probe;$('vzPause').onclick=()=>{if(!V||V.probe)return;speichere();V=null;startScreen()};
 if(!G_('schwamm'))GESCHOEPFE.push(SCHWAMM);
 WEITER[6]=()=>starte(6);WEITER[7]=()=>starte(7);WEITER.w6=zeigeWeiche6}
// Testmodus-Knöpfe
function testKnoepfe(){return['tiere','pflanzen','pilze'].map(r=>`<button class="btn" data-e="vz6-${r}">E6 ${REICHE[r].name}</button>`).join('')+'<button class="btn" data-e="vzw6-tiere">Weiche E6</button>'}
function test(code){const[,e,reich]=code.match(/^vz(w?6)-(\w+)$/);
 const run={seed:(Math.random()*2**31)|0,ebene:e==='w6'?'w6':6,bonusStab:0,xpLauf:[],test:true,reich,mito:true,chloro:reich==='pflanzen',wand:{tiere:'keine',pflanzen:'cellulose',pilze:'chitin'}[reich],vzBudget:70};
 sichere('run',run);if(e==='w6')zeigeWeiche6();else starte(6,run)}
// Test-Hook: erfüllt die Pflichtpunkte des Abschnitts automatisch (nur Tiere E6 vollständig)
function simAufbau(sofort=true){if(!V)return'kein Aufbau';const c=cfgE();if(!c.auto)return'kein Autopilot für dieses Reich';
 const soll=c.auto(V),U=V.U,erlaubt=i=>U[i].ab<=V.ab;
 const pfad=ziel=>{const prev=new Map(),q=[];V.bel.forEach((t,i)=>{if(t){q.push(i);prev.set(i,-1)}});if(!q.length){const s=U.findIndex(u=>u.seed);q.push(s);prev.set(s,-2)}
  for(let h=0;h<q.length;h++){const i=q[h];if(i===ziel)break;for(const j of U[i].nb)if(!prev.has(j)&&erlaubt(j)){prev.set(j,i);q.push(j)}}
  const P=[];let k=ziel;while(k!=null&&k>=0&&!V.bel[k]){P.unshift(k);k=prev.get(k)}return P};
 const ziele=Object.keys(soll).map(Number).sort((a,b)=>U[b].y-U[a].y);
 for(const z of ziele){if(V.bel[z])continue;for(const i of pfad(z))if(!V.bel[i])setze(i,soll[i]||'deck')}
 for(let n=0;n<80;n++){rechne();const zl=ziele_();const u=[...V.unv][0];let t=null,ort=null;
  if(u!=null){t='amoeb';ort=U[u].nb.find(j=>!V.bel[j]&&erlaubt(j))}
  else{const k=Object.keys(zl).find(k=>V.w[k]<zl[k]);if(!k)break;const T=c.zellen.filter(z=>z.w[k]).sort((a,b)=>!!a.nur-!!b.nur)[0];t=T.id;
   ort=U.findIndex((x,i)=>!V.bel[i]&&erlaubt(i)&&belegbar(i)&&(T.nur?x.zone[T.nur]:!x.zone.aussen))}
  if(ort==null||ort<0||setze(ort,t)!==true)break}
 aktualisiere();speichere();const st=state();if(V.bereit){V._sofort=sofort;probe();V&&(V._sofort=false)}return st}
const ziele_=()=>ziele();
function state(){if(!V)return{screen:document.querySelector('.scr.on').id};return{screen:'vz',reich:V.reich,e:V.e,ab:V.ab,budget:V.budget,stab:V.stab,zellen:V.U.length,
 aussen:V.U.filter(u=>u.zone.aussen).length,innen:V.U.filter(u=>u.zone.innen).length,belegt:V.bel.filter(Boolean).length,unv:V.unv.size,werte:V.w,ziele:ziele(),checks:V.checks.map(c=>c.ok),bereit:V.bereit}}
return{init,testKnoepfe,test,skizzeForm,starte,zeigeWeiche6,simAufbau,state,weiter:()=>{const b=document.querySelector('#vzRes.on button');if(b)b.click();return state()},_V:()=>V}})();
