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
const blatt=(x,y,dir,len)=>[[x,y-.045],[x+dir*len*.45,y-.11],[x+dir*len,y-.1],[x+dir*len*.8,y-.01],[x,y+.045]];
const fmt=v=>(Math.round(v*10)/10).toLocaleString('de-DE');
const pts=P=>P.map(p=>(p[0]*1000).toFixed(1)+','+(p[1]*1000).toFixed(1)).join(' ');
function centroid(P){let a=0,cx=0,cy=0;for(let i=0;i<P.length;i++){const[x0,y0]=P[i],[x1,y1]=P[(i+1)%P.length],f=x0*y1-x1*y0;a+=f;cx+=(x0+x1)*f;cy+=(y0+y1)*f}return a?[cx/(3*a),cy/(3*a)]:P[0]}

// ---------- Silhouetten (Normkoordinaten 0–1, y nach unten) ----------
const SIL={
 // Vase mit Hohlraum, Öffnung (Osculum) oben; Wand ca. 3 Zellen dick
 schwamm:{polys:[[[.33,.10],[.30,.22],[.25,.36],[.22,.50],[.23,.64],[.27,.76],[.34,.86],[.42,.91],[.50,.93],[.58,.91],[.66,.86],[.73,.76],[.77,.64],[.78,.50],[.75,.36],[.70,.22],[.67,.10]]],
  holes:[[[.43,.0],[.42,.20],[.39,.36],[.37,.50],[.38,.62],[.42,.71],[.50,.74],[.58,.71],[.62,.62],[.63,.50],[.61,.36],[.58,.20],[.57,.0]]],
  teil:(x,y)=>y>.53?1:2,start:[.5,.87]},
 moos:{polys:[[[.455,.18],[.545,.18],[.55,.71],[.45,.71]],ellipse(.5,.17,.11,.07),blatt(.46,.34,-1,.24),blatt(.46,.52,-1,.26),blatt(.54,.43,1,.25),blatt(.54,.61,1,.22),[[.32,.70],[.68,.70],[.62,.93],[.38,.93]]],
  holes:[],teil:(x,y)=>y>.38?1:2,start:[.5,.70],boden:.70},
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
 if(form==='mosaik'){U=mosaik(sil,.072,7);gr=.072}else if(form==='hex'){U=hexgit(sil,.027);gr=.047}else{({U,N,ne}=hyphen(sil,.075));gr=.075}
 U.forEach(u=>{u.ab=sil.teil(u.x,u.y);if(sil.boden!=null){if(u.y>sil.boden)u.zone.unter=1;else u.zone.ober=1}});
 const[sx,sy]=sil.start,nah=arr=>arr.reduce((b,p,i)=>{const d=Math.hypot(p[0]-sx,p[1]-sy);return d<b[0]?[d,i]:b},[9,-1])[1];
 if(N){const k=nah(N);ne[k].forEach(i=>U[i].seed=1);U.spore=N[k]}else U[nah(U.map(u=>[u.x,u.y]))].seed=1;
 U.gr=gr;U.N=N;return RASTER[key]=U}

// ---------- Inhalte ----------
const WERTE={ernaehrung:'Ernährung',versorgung:'Versorgung',schutz:'Schutz',stuetze:'Stütze',energie:'Energie',wasser:'Wasser',halt:'Halt',nahrung:'Nahrung',ausbreitung:'Ausbreitung'};
const NUR={innen:'nur an der Innenseite',aussen:'nur an der Außenseite',ober:'nur oberirdisch',unter:'nur im Boden'};
const SCHUTZ_MOOS=28;
const substrat=V=>{const N=V.U.N,b=SIL.pilz.boden,bed=new Set();V.U.forEach((u,i)=>{if(V.bel[i])u.kn.forEach(k=>bed.add(k))});let a=0,g=0;N.forEach((n,k)=>{if(n[1]>b+1e-6){g++;if(bed.has(k))a++}});return[a,g]};
const anz=(V,f)=>V.U.reduce((n,u,i)=>n+(f(u,V.bel[i],i)?1:0),0);
const REICHE={
 tiere:{name:'Tier',form:'mosaik',farbe:'#6EC1F0',e6:{titel:'Spezialisierte Zellen',ziel:'Schwamm',sil:'schwamm',werte:['ernaehrung','versorgung','schutz','stuetze'],
  zellen:[
   {id:'deck',n:'Deckzelle',l:'Pinakozyte',c:'#6EC1F0',k:2,w:{schutz:1},info:'Schutz +1'},
   {id:'kragen',n:'Kragengeißelzelle',l:'Choanozyte',c:'#5DD39E',k:3,w:{ernaehrung:1},nur:'innen',info:'Ernährung +1 · nur innen'},
   {id:'pore',n:'Porenzelle',l:'Porozyte',c:'#F2E36B',k:2,w:{versorgung:1},info:'Versorgung +1 · Wasser strömt ein'},
   {id:'amoeb',n:'Amöbozyte',l:'Wanderzelle',c:'#FFA552',k:3,w:{versorgung:1,stuetze:1},info:'Versorgung +1 · Stütze +1 (Skelettnadeln)'}],
  autoQuelle:'amoeb',autoFill:'deck',
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
  autoQuelle:'speicher',autoFill:'speicher',
  abschnitte:[
   {name:'Stämmchen und Boden',check:[
     {t:'mindestens 8 Assimilationszellen',f:V=>[anz(V,(u,t)=>t==='chlor'),8]},
     {t:'mindestens 3 Rhizoide im Boden',f:V=>[anz(V,(u,t)=>t==='rhiz'),3]}],
    probe:{id:'fotosynthese',name:'Fotosynthese',txt:'Die Sonne scheint auf das Moos – die Assimilationszellen bilden Zucker.',ziele:{energie:8}},
    ereignisse:['mangel','konkurrenz','ruhig']},
   {name:'Blättchen',check:[
     {t:'Außenrand der Blättchen aus Epidermis',f:V=>[anz(V,(u,t)=>u.zone.rand&&u.zone.ober&&u.ab===2&&t==='epi'),anz(V,u=>u.zone.rand&&u.zone.ober&&u.ab===2)]},
     {t:'Jede Zelle nah am Wasser (höchstens 3 Felder von Rhizoid oder Speicher)',f:V=>[V.unv.size?0:1,1],ja:1}],
    probe:{id:'trocken',name:'Trockenphase',txt:'Wochenlang kein Regen – Wasservorrat und Verdunstungsschutz entscheiden.',ziele:{wasser:4,schutz:SCHUTZ_MOOS}},
    ereignisse:['trocken','uv','kaelte','ruhig']}],
  auto:V=>{const m={},U=V.U,[sx,sy]=SIL.moos.start,d=i=>Math.hypot(U[i].x-sx,U[i].y-sy),frei=i=>!V.bel[i];
   if(V.ab===1){const unter=U.map((u,i)=>i).filter(i=>U[i].zone.unter&&frei(i)).sort((a,b)=>d(a)-d(b)),ober=U.map((u,i)=>i).filter(i=>U[i].zone.ober&&U[i].ab===1&&frei(i)).sort((a,b)=>d(a)-d(b));
    unter.slice(0,4).forEach(i=>m[i]='rhiz');ober.slice(0,ziele().energie||8).forEach(i=>m[i]='chlor')}
   else U.forEach((u,i)=>{if(u.zone.rand&&u.zone.ober&&u.ab===2)m[i]='epi'});return m}},e7:null},
 pilze:{name:'Pilz',form:'hyphen',farbe:'#FFA552',e6:{titel:'Myzel',ziel:'Schimmelpilz',sil:'pilz',werte:['nahrung','versorgung','ausbreitung','schutz'],
  zellen:[
   {id:'naehr',n:'Nährhyphe',l:'im Substrat',c:'#5DD39E',k:1,w:{nahrung:1},nur:'unter',info:'Nahrung +1 · nur im Substrat'},
   {id:'trans',n:'Transporthyphe',l:'Leitung',c:'#FFA552',k:2,w:{versorgung:1},info:'Versorgung +1'},
   {id:'luft',n:'Lufthyphe',l:'mit Sporenträger',c:'#A98BF0',k:3,w:{ausbreitung:1},nur:'ober',info:'Ausbreitung +1 · nur über dem Substrat'},
   {id:'dunkel',n:'Schutzhyphe',l:'dunkel (Melanin)',c:'#FF7A6B',k:2,w:{schutz:1},info:'Schutz +1'}],
  versorgung:{quellen:['trans'],max:3,nurFuer:['naehr'],txt:'jede Nährhyphe höchstens 3 Kanten von einer Transporthyphe'},
  autoQuelle:'trans',autoFill:'trans',
  abschnitte:[
   {name:'Myzel im Substrat',check:[
     {t:'Geflecht über mindestens die Hälfte des Substrats',f:V=>{const[a,b]=substrat(V);return[a,Math.ceil(b/2)]}},
     {t:'Jede Nährhyphe versorgt (höchstens 3 Kanten von einer Transporthyphe)',f:V=>[V.unv.size?0:1,1],ja:1}],
    probe:{id:'zersetzen',name:'Zersetzen',txt:'Die Nährhyphen lösen das Substrat auf, Transporthyphen verteilen die Nahrung.',ziele:{nahrung:20,versorgung:5}},
    ereignisse:['mangel','ruhig']},
   {name:'Luftraum',check:[
     {t:'mindestens 4 Sporenträger in der Luft',f:V=>[anz(V,(u,t)=>t==='luft'),4]}],
    probe:{id:'sporen',name:'Sporen streuen',txt:'Die Sporenträger geben Sporen in die Luft ab – dunkle Hyphen schützen vor Licht und Austrocknen.',ziele:{ausbreitung:5,schutz:5}},
    ereignisse:['konkurrenz','uv','kaelte','trocken','ruhig']}],
  auto:V=>{const m={},U=V.U,N=U.N,b=SIL.pilz.boden;
   if(V.ab===1){const ziel=Math.ceil(substrat(V)[1]*.55),k0=N.indexOf(U.spore),seen=new Set([k0]),q=[k0],kante=new Map();
    U.forEach((u,i)=>{for(const k of u.kn){if(!kante.has(k))kante.set(k,[]);kante.get(k).push(i)}});let n=0;
    for(let h=0;h<q.length&&n<ziel;h++)for(const i of kante.get(q[h])){const o=U[i].kn[0]===q[h]?U[i].kn[1]:U[i].kn[0];
     if(seen.has(o)||N[o][1]<=b)continue;seen.add(o);q.push(o);m[i]=V.bel[i]||'naehr';n++;if(n>=ziel)break}}
   else[.3,.43,.57,.7].forEach(x=>{let bi=-1,bd=9;U.forEach((u,i)=>{if(!u.zone.ober||V.bel[i]||m[i])return;const dd=Math.hypot(u.x-x,u.y-.47);if(dd<bd){bd=dd;bi=i}});if(bi>=0)m[bi]='luft'});
   return m}},e7:null}
};
const EREIGNISSE={
 kaelte:{n:'Kälte',w:['schutz'],p:2},stroemung:{n:'Strömung',w:['stuetze','halt'],p:2},trocken:{n:'Trockenheit',w:['wasser','schutz'],p:2},
 mangel:{n:'Nährstoffmangel',w:['ernaehrung','nahrung','energie'],p:2},uv:{n:'UV-Strahlung',w:['schutz'],p:1},
 konkurrenz:{n:'Konkurrenz',w:['ausbreitung','energie'],p:2},sturm:{n:'Sturm',w:['halt'],p:2},ruhig:{n:'Ruhige Zeit',w:[],p:0}};
const evWert=ev=>{const A=abs();return ev&&A.probe?ev.w.find(k=>A.probe.ziele[k]!=null)||null:null};
const NEU=[{id:'moos',name:'Moos',xp:250,stufe:3,form:'moos',c:'#5DD39E',weg:'Vielzeller-Pflanze ohne Leitgewebe (Ebene 6)',
 fakten:['Hat keine echten Wurzeln, nur Rhizoide zum Festhalten.','Nimmt Wasser über die ganze Oberfläche auf.','Vermehrt sich über Sporen und braucht Wasser zur Befruchtung.']},
 {id:'schimmel',name:'Schimmelpilz',xp:250,stufe:3,form:'schimmel',c:'#A98BF0',weg:'Vielzeller-Pilz ohne Fruchtkörper (Ebene 6)',
 fakten:['Ein Geflecht aus Hyphen, das Myzel.','Seine Sporen schweben überall in der Luft.','Aus dem Schimmelpilz Penicillium stammt das Antibiotikum Penicillin.']}];
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
function ziele(){const A=abs();if(!A.probe)return{};const z={...A.probe.ziele},ev=ereignis(),k=evWert(ev);if(k)z[k]+=ev.p;return z}
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
 if(sil.boden!=null)s+=`<rect x="-3000" y="${sil.boden*1000}" width="7000" height="4000" fill="#2E2A24"/><line x1="-3000" y1="${sil.boden*1000}" x2="4000" y2="${sil.boden*1000}" stroke="#5A5955" stroke-width="4" stroke-dasharray="14 10"/><text x="20" y="${sil.boden*1000+40}" fill="#B9B8B2" font-size="26" opacity=".7">${c.sil==='pilz'?'Substrat (Laub)':'Boden'}</text><text x="20" y="${sil.boden*1000-18}" fill="#B9B8B2" font-size="26" opacity=".7">${c.sil==='pilz'?'Luft':'Luft und Licht'}</text>`;
 sil.holes.forEach(h=>s+=`<polygon points="${pts(h)}" fill="#22303A"/>`);
 if(c.sil==='schwamm')s+='<text x="500" y="40" fill="#6EC1F0" font-size="26" text-anchor="middle" opacity=".7">Öffnung (Osculum)</text><text x="500" y="420" fill="#6EC1F0" font-size="24" text-anchor="middle" opacity=".55">Hohlraum</text>';
 s+='<g id="vzZ">'+U.map((u,i)=>u.seg?`<line data-i="${i}" x1="${u.seg[0][0]*1000}" y1="${u.seg[0][1]*1000}" x2="${u.seg[1][0]*1000}" y2="${u.seg[1][1]*1000}" stroke-linecap="round"/>`
  :`<polygon data-i="${i}" points="${pts(u.poly)}" stroke-linejoin="round"/>`).join('')+'</g>';
 if(U.N)s+='<g fill="#5A5955">'+U.N.map(n=>`<circle cx="${n[0]*1000}" cy="${n[1]*1000}" r="5"/>`).join('')+`</g><circle cx="${U.spore[0]*1000}" cy="${U.spore[1]*1000}" r="13" fill="#FDD602"/>`;
 s+='<g id="vzMark" pointer-events="none"></g><g id="vzFx" pointer-events="none"></g>';
 $('vzSvg').innerHTML='<g id="vzCam">'+s+'</g>';kamFit()}
// ---------- Kamera: Zoom und Verschieben ----------
let KAM={z:1,tx:0,ty:0};
function kamSetzen(){const g=$('vzCam');if(g)g.setAttribute('transform',`translate(${KAM.tx} ${KAM.ty}) scale(${KAM.z})`)}
function kamFit(){const U=V.U;let x0=9,y0=9,x1=-9,y1=-9;U.forEach(u=>(u.poly||u.seg).forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}));
 const m=.03,w=(x1-x0+2*m)*1000,h=(y1-y0+2*m)*1000,z=Math.min(1000/w,1000/h);KAM={z,tx:500-(x0+x1)/2*1000*z,ty:500-(y0+y1)/2*1000*z,min:z*.8,max:z*5};kamSetzen()}
const svgPunkt=(cx,cy)=>{const svg=$('vzSvg'),p=svg.createSVGPoint();p.x=cx;p.y=cy;return p.matrixTransform(svg.getScreenCTM().inverse())};
const weltPunkt=(cx,cy)=>{const q=svgPunkt(cx,cy);return{x:(q.x-KAM.tx)/KAM.z,y:(q.y-KAM.ty)/KAM.z}};
function kamZoom(f,cx,cy){const q=cx==null?{x:500,y:500}:svgPunkt(cx,cy),wx=(q.x-KAM.tx)/KAM.z,wy=(q.y-KAM.ty)/KAM.z;
 KAM.z=Math.max(KAM.min,Math.min(KAM.max,KAM.z*f));KAM.tx=q.x-wx*KAM.z;KAM.ty=q.y-wy*KAM.z;kamSetzen()}
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
 $('vzEv').innerHTML=A.probe?`<div class="kl">Lebensprobe</div><b>${A.probe.name}</b><small>${A.probe.txt}</small>`+(ev?`<div class="vzEk"><span class="kl">Ereignis</span><b>${ev.n}</b><small>${evWert(ev)?WERTE[evWert(ev)]+'-Ziel +'+ev.p:'keine Erhöhung'}</small></div>`:''):'';
 $('vzBal').innerHTML=balkenHTML();
 const b=$('vzGo');b.disabled=!V.bereit||V.probe;b.textContent=V.probe?'Lebensprobe läuft …':'Lebensprobe starten'}
function aktualisiere(){rechne();malKopf();malZellen();malPanel();malPaletteWahl()}

// ---------- Bedienung: tippen oder überwischen ----------
function einheitBei(ev){const q=weltPunkt(ev.clientX,ev.clientY),x=q.x/1000,y=q.y/1000;
 let b=-1,bd=V.U.gr*(V.U.N?.45:.75);V.U.forEach((u,i)=>{const d=Math.hypot(u.x-x,u.y-y);if(d<bd){bd=d;b=i}});return b}
function bindeBrett(){const svg=$('vzSvg'),P=new Map();let mode=null,pid=null,last=-1,strich=[],t0=0,geste=null,pan=null;
 const tun=i=>{if(i<0||i===last)return;last=i;let r;const vor=V.bel[i],b0=V.budget;
  if(mode===null)mode=V.bel[i]?'weg':'setzen';
  if(mode==='weg')r=entferne(i);else r=setze(i,V.typ);
  if(r===true){strich.push([i,vor,b0]);aktualisiere()}};
 const zurueck=()=>{for(let k=strich.length-1;k>=0;k--){const[i,vor,b0]=strich[k];V.bel[i]=vor;V.budget=b0}strich=[];aktualisiere()};
 const mitte=()=>{const a=[...P.values()];return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1}};
 svg.addEventListener('pointerdown',ev=>{if(!V)return;ev.preventDefault();try{svg.setPointerCapture(ev.pointerId)}catch(e){}P.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(P.size===2){// Zwei Finger: zoomen/verschieben, gerade begonnenen Strich zurücknehmen
   if(pid!=null&&performance.now()-t0<450)zurueck();pid=null;pan=null;const m=mitte(),q=svgPunkt(m.x,m.y);geste={m,z0:KAM.z,wx:(q.x-KAM.tx)/KAM.z,wy:(q.y-KAM.ty)/KAM.z};return}
  if(P.size>2||V.probe)return;const i=einheitBei(ev);
  if(i<0){pan={x:ev.clientX,y:ev.clientY,tx:KAM.tx,ty:KAM.ty};return}// außerhalb des Körpers: verschieben
  pid=ev.pointerId;mode=null;last=-1;strich=[];t0=performance.now();tun(i)});
 svg.addEventListener('pointermove',ev=>{if(!V||!P.has(ev.pointerId))return;P.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(geste&&P.size>=2){const m=mitte(),q=svgPunkt(m.x,m.y);KAM.z=Math.max(KAM.min,Math.min(KAM.max,geste.z0*m.d/geste.m.d));KAM.tx=q.x-geste.wx*KAM.z;KAM.ty=q.y-geste.wy*KAM.z;kamSetzen();return}
  if(pan){const a=svgPunkt(pan.x,pan.y),b=svgPunkt(ev.clientX,ev.clientY);KAM.tx=pan.tx+b.x-a.x;KAM.ty=pan.ty+b.y-a.y;kamSetzen();return}
  if(ev.pointerId===pid)tun(einheitBei(ev))});
 const ende=ev=>{P.delete(ev.pointerId);if(P.size<2)geste=null;if(!P.size)pan=null;if(ev.pointerId!==pid)return;pid=null;strich=[];if(V&&V.bel.some(Boolean))speichere()};
 svg.addEventListener('pointerup',ende);svg.addEventListener('pointercancel',ende);
 svg.addEventListener('wheel',ev=>{if(!V)return;ev.preventDefault();kamZoom(Math.exp(-ev.deltaY*.0015),ev.clientX,ev.clientY)},{passive:false});
 $('vzZin').onclick=()=>kamZoom(1.4);$('vzZout').onclick=()=>kamZoom(1/1.4);$('vzZfit').onclick=kamFit}

// ---------- Lebensprobe ----------
const idxTyp=(...T)=>V.U.map((u,i)=>i).filter(i=>T.includes(V.bel[i]));
const lerp=(a,b,f)=>a+(b-a)*f,punkt=(x,y,r,c,o=1)=>`<circle cx="${x*1000}" cy="${y*1000}" r="${r}" fill="${c}" opacity="${o}"/>`;
const strom=(n,t,von,nach,c,r=7,v=2)=>{let s='';if(!nach.length)return s;for(let k=0;k<n;k++){const f=(t*v+k/n)%1,[ax,ay]=von(k),u=V.U[nach[k%nach.length]];s+=punkt(lerp(ax,u.x,f),lerp(ay,u.y,f),r,c,f<.85?.9:(1-f)*6)}return s};
const SZENE={
 fotosynthese:(t)=>`<circle cx="880" cy="110" r="${55+5*Math.sin(t*20)}" fill="#FDD602"/>`+strom(30,t,()=>[.88,.11],idxTyp('chlor'),'#FDD602',6),
 trocken:(t)=>`<rect x="0" y="0" width="1000" height="${SIL.moos.boden*1000}" fill="#FFA552" opacity="${.12+.06*Math.sin(t*12)}"/>`+
  idxTyp('rhiz','speicher').map(i=>punkt(V.U[i].x,V.U[i].y,9*(1-t*.5),'#6EC1F0',.9)).join('')+idxTyp('epi').map(i=>punkt(V.U[i].x,V.U[i].y,6,'#F2F1EC',.5+.4*Math.sin(t*15+i))).join(''),
 zersetzen:(t)=>strom(40,t,k=>[.08+((k*37)%84)/100,.62+((k*13)%28)/100],idxTyp('naehr'),'#C9A36B',6,1.5)+strom(16,t,()=>SIL.pilz.start,idxTyp('trans'),'#FFA552',6,1.2),
 sporen:(t)=>{let s='';idxTyp('luft').forEach((i,k)=>{const u=V.U[i];for(let j=0;j<6;j++){const f=(t*1.5+j/6)%1;s+=punkt(u.x+f*.2*Math.sin(j+k),u.y-f*.3,5,'#A98BF0',1-f)}});return s}};
function probe(){if(!V.bereit||V.probe)return;V.probe=true;V.erg=false;malPanel();const A=abs(),dauer=7000,t0=performance.now(),fx=$('vzFx');
 const W=V.w,z=ziele(),U=V.U,poren=U.map((u,i)=>i).filter(i=>V.bel[i]==='pore'),amoeb=U.map((u,i)=>i).filter(i=>V.bel[i]==='amoeb');
 const teil=[...Array(36)].map((_,k)=>({k,src:poren.length?poren[k%poren.length]:0,off:Math.random()}));
 const schritt=now=>{const t=Math.min(1,(now-t0)/dauer);let s='';
  if(A.probe.id==='filtern'){teil.forEach(p=>{let f=((t*3+p.off)%1);const u=U[p.src],ax=u.x+(u.x-.5)*.5,ay=u.y,bx=.5,by=.55,cx=.5,cy=-.02;
    const x=f<.4?ax+(u.x-ax)*f/.4:f<.7?u.x+(bx-u.x)*(f-.4)/.3:bx+(cx-bx)*(f-.7)/.3,y=f<.4?ay+(u.y-ay)*f/.4:f<.7?u.y+(by-u.y)*(f-.4)/.3:by+(cy-by)*(f-.7)/.3;
    s+=`<circle cx="${x*1000}" cy="${y*1000}" r="7" fill="#6EC1F0" opacity=".85"/>`})}
  else if(SZENE[A.probe.id])s=SZENE[A.probe.id](t,U);
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
  {id:A[0],name:A[1],svg:g?skizze(g):'',weg:g?g.weg:'',folge:'Der Lauf endet: Du schaltest '+({schwamm:'den',moos:'das',schimmel:'den'}[A[0]])+' '+A[1]+' frei.',kosten:'ab 250 XP ✓',zu:!g},
  {id:'e7',name:A[2],weg:A[3],folge:'Weiter zu Ebene 7.',kosten:'ab 500 XP (du: '+xp+') · Ebene 7 kommt mit dem nächsten Update',zu:true}],
  id=>{if(id!=='e7')schalteFrei(id,run)})}

// ---------- Skizzen für Lexikon/Weiche ----------
function skizzeForm(f,c){if(f==='schwamm')return `<path d="M17 8 L15 20 L11 34 L15 46 L28 50 L41 46 L45 34 L41 20 L39 8 L33 8 L34 22 L32 38 L28 40 L24 38 L22 22 L23 8Z" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>${[[16,28],[40,26],[20,42],[36,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="${c}"/>`).join('')}`;
 if(f==='moos')return `<path d="M28 50 V18" stroke="${c}" stroke-width="3"/>${[[28,20,-1],[28,28,1],[28,34,-1],[28,42,1]].map(([x,y,d])=>`<path d="M${x} ${y} q${d*8} -8 ${d*14} -4 q${-d*6} 6 ${-d*14} 4z" fill="${c}"/>`).join('')}<path d="M24 50 l-4 5 M28 50 v6 M32 50 l4 5" stroke="${c}" stroke-width="1.6"/><line x1="10" y1="50" x2="46" y2="50" stroke="#5A5955" stroke-width="2"/>`;
 if(f==='schimmel')return `<path d="M8 44 Q18 36 28 44 T48 44" fill="none" stroke="${c}" stroke-width="2.5"/>${[[14,40],[24,42],[34,40],[42,42]].map(([x,y])=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-18}" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="${y-21}" r="4" fill="${c}"/>`).join('')}<rect x="6" y="46" width="44" height="6" rx="3" fill="#5A5955"/>`;
 return ''}

// ---------- Einhängen ----------
const CSS=`
#vz{flex-direction:column;gap:10px}
#vzWeg{display:flex;gap:6px;flex-wrap:wrap}
.vzMain{flex:1;min-height:0;display:flex;gap:14px}
.vzBrett{position:relative;flex:1;min-width:0;min-height:0;background:var(--s2);border-radius:22px;overflow:hidden}
#vzSvg{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);touch-action:none}
#vzHint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:var(--s1);border:2px solid var(--y);color:var(--fg);border-radius:999px;padding:8px 16px;font-size:15px;display:none;max-width:92%;text-align:center}
#vzHint.on{display:block}
#vzBrett,.vzBrett{touch-action:none}
.vzZoom{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;gap:6px}
.vzZoom button{width:44px;height:44px;border-radius:12px;background:var(--s1);border:2px solid var(--l2);color:var(--fg);font-size:22px;font-weight:700;display:grid;place-items:center}
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
@media (orientation:landscape) and (max-height:600px){#vz{gap:6px}#vzWeg,.vzTipp,#vzVers,.vzT small{display:none}.vzMain{gap:8px}.vzSeite{width:300px;gap:6px}.vzBox{padding:8px;gap:6px}
 .vzT{padding:4px 8px}.vzT i{width:20px;height:20px}#vzGoBox{position:static;box-shadow:none}#vzBal{display:grid!important;grid-template-columns:1fr 1fr;gap:4px 10px!important}
 #vzGo{min-height:42px;font-size:15px}.vzZoom button{width:38px;height:38px}#vz header .mass{width:130px}}
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
 <div class="vzMain"><div class="vzBrett"><svg id="vzSvg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet"></svg><div id="vzHint"></div><div class="vzZoom"><button id="vzZin" aria-label="Heranzoomen">+</button><button id="vzZout" aria-label="Herauszoomen">−</button><button id="vzZfit" aria-label="Ganz zeigen">⤢</button></div><div id="vzRes"></div></div>
  <div class="vzSeite"><div class="vzBox"><div class="kl">Zelltypen · Kosten in Biomasse</div><div id="vzPal"></div><small class="vzTipp" style="color:var(--mut);font-size:12px">Antippen oder überwischen = setzen · belegte Zelle antippen = entfernen (50 % zurück)</small></div>
   <div class="vzBox" id="vzCheck"></div><div class="vzBox" id="vzEv"></div><div class="vzBox" id="vzGoBox"><div id="vzBal" style="display:flex;flex-direction:column;gap:10px"></div><div id="vzVers"></div><button class="btn pri" id="vzGo">Lebensprobe starten</button></div></div></div>
</section>`;
function init(){const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 document.body.insertAdjacentHTML('beforeend',HTML);$('vzLogo').innerHTML=ATOM_SVG.replace(/%/g,36);
 bindeBrett();$('vzGo').onclick=probe;$('vzPause').onclick=()=>{if(!V||V.probe)return;speichere();V=null;startScreen()};
 [SCHWAMM,...NEU].forEach(g=>{if(!G_(g.id))GESCHOEPFE.push(g)});
 WEITER[6]=()=>starte(6);WEITER[7]=()=>starte(7);WEITER.w6=zeigeWeiche6}
// Testmodus-Knöpfe
function testKnoepfe(){return['tiere','pflanzen','pilze'].map(r=>`<button class="btn" data-e="vz6-${r}">E6 ${REICHE[r].name}</button>`).join('')+'<button class="btn" data-e="vzw6-tiere">Weiche E6</button>'}
function test(code){const[,e,reich]=code.match(/^vz(w?6)-(\w+)$/);
 const run={seed:(Math.random()*2**31)|0,ebene:e==='w6'?'w6':6,bonusStab:0,xpLauf:[],test:true,reich,mito:true,chloro:reich==='pflanzen',wand:{tiere:'keine',pflanzen:'cellulose',pilze:'chitin'}[reich],vzBudget:70};
 sichere('run',run);if(e==='w6')zeigeWeiche6();else starte(6,run)}
// Test-Hook: erfüllt die Pflichtpunkte des Abschnitts automatisch (nur Tiere E6 vollständig)
function simAufbau(sofort=true){if(!V)return'kein Aufbau';const c=cfgE();if(!c.auto)return'kein Autopilot';
 const soll=c.auto(V),U=V.U,erlaubt=i=>U[i].ab<=V.ab;
 const pfad=ziel=>{const prev=new Map(),q=[];V.bel.forEach((t,i)=>{if(t){q.push(i);prev.set(i,-1)}});if(!q.length){const s=U.findIndex(u=>u.seed);q.push(s);prev.set(s,-2)}
  for(let h=0;h<q.length;h++){const i=q[h];if(i===ziel)break;for(const j of U[i].nb)if(!prev.has(j)&&erlaubt(j)){prev.set(j,i);q.push(j)}}
  const P=[];let k=ziel;while(k!=null&&k>=0&&!V.bel[k]){P.unshift(k);k=prev.get(k)}return P};
 const[sx,sy]=SIL[c.sil].start,dS=i=>Math.hypot(U[i].x-sx,U[i].y-sy),ziele=Object.keys(soll).map(Number).sort((a,b)=>dS(a)-dS(b));
 for(const z of ziele){if(V.bel[z])continue;for(const i of pfad(z))if(!V.bel[i])setze(i,soll[i]||c.autoFill)}
 for(let n=0;n<150;n++){rechne();const zl=ziele_();const u=[...V.unv][0];let t=null,ort=null;
  if(u!=null){t=c.autoQuelle;const seen=new Set([u]),q=[u];ort=null;for(let h=0;h<q.length&&ort==null;h++)for(const j of U[q[h]].nb){if(seen.has(j))continue;seen.add(j);q.push(j);if(!V.bel[j]&&erlaubt(j)&&belegbar(j)&&!(j in soll)){ort=j;break}}}
  else{const k=Object.keys(zl).find(k=>V.w[k]<zl[k]);if(!k)break;const T=c.zellen.filter(z=>z.w[k]).sort((a,b)=>!!a.nur-!!b.nur)[0];t=T.id;
   ort=U.findIndex((x,i)=>!V.bel[i]&&erlaubt(i)&&belegbar(i)&&(T.nur?x.zone[T.nur]:!x.zone.aussen))}
  if(ort==null||ort<0||setze(ort,t)!==true)break}
 aktualisiere();speichere();const st=state();if(V.bereit){V._sofort=sofort;probe();V&&(V._sofort=false)}return st}
const ziele_=()=>ziele();
function state(){if(!V)return{screen:document.querySelector('.scr.on').id};return{screen:'vz',reich:V.reich,e:V.e,ab:V.ab,budget:V.budget,stab:V.stab,zellen:V.U.length,
 aussen:V.U.filter(u=>u.zone.aussen).length,innen:V.U.filter(u=>u.zone.innen).length,belegt:V.bel.filter(Boolean).length,unv:V.unv.size,werte:V.w,ziele:ziele(),checks:V.checks.map(c=>c.ok),bereit:V.bereit}}
return{init,testKnoepfe,test,skizzeForm,starte,zeigeWeiche6,simAufbau,state,weiter:()=>{const b=document.querySelector('#vzRes.on button');if(b)b.click();return state()},_V:()=>V}})();
