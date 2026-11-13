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
const halbEll=(cx,cy,rx,ry,n=20)=>[...Array(n+1)].map((_,k)=>[cx-rx*Math.cos(k/n*Math.PI),cy-ry*Math.sin(k/n*Math.PI)]);
const TENT=[.24,.38,.62,.76].map((x0,k)=>{const L=[],R=[];for(let y=.45;y<=.93;y+=.035){const x=x0+Math.sin(y*14+k)*.025*(y-.45)/.5;L.push([x-.04,y]);R.unshift([x+.04,y])}return[...L,...R]});
const band=(x0,y0,x1,y1,w)=>{const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy),nx=-dy/l*w/2,ny=dx/l*w/2,P=(f,s)=>[x0+dx*f+nx*s,y0+dy*f+ny*s];
 return[P(0,.7),P(.3,1),P(.65,1),P(.85,.6),P(1,0),P(.85,-.6),P(.65,-1),P(.3,-1),P(0,-.7)]};
const WEDEL=[band(.45,.47,.17,.28,.15),band(.55,.47,.83,.28,.15),band(.5,.40,.5,.12,.15)];
let RNODES=[];
const SIL={
 // Vase mit Hohlraum, Öffnung (Osculum) oben; Wand ca. 3 Zellen dick
 schwamm:{polys:[[[.33,.10],[.30,.22],[.25,.36],[.22,.50],[.23,.64],[.27,.76],[.34,.86],[.42,.91],[.50,.93],[.58,.91],[.66,.86],[.73,.76],[.77,.64],[.78,.50],[.75,.36],[.70,.22],[.67,.10]]],
  holes:[[[.43,.0],[.42,.20],[.39,.36],[.37,.50],[.38,.62],[.42,.71],[.50,.74],[.58,.71],[.62,.62],[.63,.50],[.61,.36],[.58,.20],[.57,.0]]],
  teil:(x,y)=>y>.53?1:2,start:[.5,.87]},
 moos:{polys:[[[.455,.18],[.545,.18],[.55,.71],[.45,.71]],ellipse(.5,.17,.11,.07),blatt(.46,.34,-1,.24),blatt(.46,.52,-1,.26),blatt(.54,.43,1,.25),blatt(.54,.61,1,.22),[[.32,.70],[.68,.70],[.62,.93],[.38,.93]]],
  holes:[],teil:(x,y)=>y>.38?1:2,start:[.5,.70],boden:.70},
 pilz:{polys:[[[.05,.16],[.95,.16],[.95,.92],[.05,.92]]],holes:[],teil:(x,y)=>y>.58?1:2,start:[.5,.58],boden:.58},
 // Qualle: Schirm im Querschnitt (außen Ektoderm, Mitte Mesogloea, innen Entoderm um den Gastralraum), Mundrohr, 4 Tentakel
 qualle:{polys:[halbEll(.5,.48,.37,.34),[[.43,.47],[.57,.47],[.555,.63],[.445,.63]],...TENT],
  holes:[halbEll(.5,.40,.21,.11),[[.485,.38],[.515,.38],[.515,.68],[.485,.68]]],
  d:.056,teil:(x,y)=>TENT.some(t=>inPoly(x,y,t))&&y>.5?2:1,start:[.5,.15],
  zonen:(u,x,y)=>{const k=TENT.findIndex(t=>inPoly(x,y,t));if(k>=0&&y>.5)u.zone.tent=k+1;else u.zone.schirm=1}},
 // Farn: Wurzeln im Boden, Spross, 3 Wedel
 farn:{polys:[[[.455,.40],[.545,.40],[.55,.76],[.45,.76]],[[.30,.74],[.70,.74],[.64,.95],[.36,.95]],...WEDEL],holes:[],
  teil:(x,y)=>WEDEL.some(w=>inPoly(x,y,w))?2:1,start:[.5,.74],boden:.74,
  zonen:(u,x,y)=>{const k=WEDEL.findIndex(w=>inPoly(x,y,w));if(k>=0)u.zone.wedel=k+1}},
 // Fliegenpilz: Boden mit Myzel und Baumwurzel, Stiel, Hut
 fliegenpilz:{polys:[[[.05,.62],[.95,.62],[.95,.94],[.05,.94]],[[.40,.30],[.60,.30],[.60,.63],[.40,.63]],halbEll(.5,.38,.33,.22)],holes:[],
  teil:(x,y)=>y>.39?1:2,start:[.5,.62],boden:.62,
  zonen:(u,x,y)=>{if(y<=.39){if(y<.31)u.zone.haut=1;else u.zone.lam=1}else if(y<.62)u.zone.stiel=1;
   if(u.kn&&u.kn.some(k=>{const n=RNODES[k];return n&&n[0]>.8&&n[1]>.72}))u.zone.wurzel=1}}
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
 if(form==='mosaik'){gr=sil.d||.072;U=mosaik(sil,gr,7)}else if(form==='hex'){U=hexgit(sil,.027);gr=.047}else{({U,N,ne}=hyphen(sil,.075));gr=.075}
 RNODES=N||[];U.forEach(u=>{u.ab=sil.teil(u.x,u.y);if(sil.zonen)sil.zonen(u,u.x,u.y);if(form==='mosaik'&&!u.zone.aussen&&!u.zone.innen)u.zone.mitte=1;if(sil.boden!=null){if(u.y>sil.boden)u.zone.unter=1;else u.zone.ober=1}});
 const[sx,sy]=sil.start,nah=arr=>arr.reduce((b,p,i)=>{const d=Math.hypot(p[0]-sx,p[1]-sy);return d<b[0]?[d,i]:b},[9,-1])[1];
 if(N){const k=nah(N);ne[k].forEach(i=>U[i].seed=1);U.spore=N[k]}else U[nah(U.map(u=>[u.x,u.y]))].seed=1;
 U.gr=gr;U.N=N;return RASTER[key]=U}

// ---------- Inhalte ----------
const WERTE={bewegung:'Bewegung',reizleitung:'Reizleitung',abwehr:'Abwehr',transport:'Transport %',ernaehrung:'Ernährung',versorgung:'Versorgung',schutz:'Schutz',stuetze:'Stütze',energie:'Energie',wasser:'Wasser',halt:'Halt',nahrung:'Nahrung',ausbreitung:'Ausbreitung'};
const NUR={tent:'nur in den Tentakeln',mitte:'nur in der Mittelschicht',schirm:'nur im Schirm',wedel:'nur im Wedel',stiel:'nur im Stiel',haut:'nur auf der Hut-Oberseite',lam:'nur unter dem Hut',innen:'nur an der Innenseite',aussen:'nur an der Außenseite',ober:'nur oberirdisch',unter:'nur im Boden'};
const SCHUTZ_MOOS=28;
const substrat=V=>{const N=V.U.N,b=SIL.pilz.boden,bed=new Set();V.U.forEach((u,i)=>{if(V.bel[i])u.kn.forEach(k=>bed.add(k))});let a=0,g=0;N.forEach((n,k)=>{if(n[1]>b+1e-6){g++;if(bed.has(k))a++}});return[a,g]};
const idxW=(V,f)=>V.U.map((u,i)=>i).filter(i=>f(V.U[i],V.bel[i],i));
function strang(V,t,start){const T=[].concat(t),q=idxW(V,(u,b)=>T.includes(b)&&start(u)),seen=new Set(q);for(let h=0;h<q.length;h++)for(const j of V.U[q[h]].nb)if(T.includes(V.bel[j])&&!seen.has(j)){seen.add(j);q.push(j)}return seen}
// Pfad über freie Felder (ok) von Startzellen bis zu einer Zielzelle
function weg(V,von,ziel,ok){const U=V.U,prev=new Map(),q=[...von];von.forEach(i=>prev.set(i,-1));
 for(let h=0;h<q.length;h++){const i=q[h];if(ziel(i)&&prev.get(i)!==-1){const P=[];let k=i;while(k>=0&&prev.get(k)!==-1){P.unshift(k);k=prev.get(k)}return P}
  for(const j of U[i].nb)if(!prev.has(j)&&ok(j)){prev.set(j,i);q.push(j)}}return[]}
// Fliegenpilz: Scheingewebe-Stiel = dichte Knoten (≥ 4 Hyphen) vom Boden bis zur Hut-Höhe
function stielOk(V){const N=V.U.N,D=k=>V.dicht.get(k)>=4,adj=new Map();V.U.forEach((u,i)=>{if(V.bel[i]&&D(u.kn[0])&&D(u.kn[1]))u.kn.forEach((k,j)=>{if(!adj.has(k))adj.set(k,[]);adj.get(k).push(u.kn[1-j])})});
 const q=[...adj.keys()].filter(k=>N[k][1]>=.55),seen=new Set(q);for(let h=0;h<q.length;h++){if(N[q[h]][1]<=.43)return true;for(const o of adj.get(q[h])||[])if(!seen.has(o)){seen.add(o);q.push(o)}}return false}
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
  e7:{bonus:130,titel:'Echte Gewebe',ziel:'Qualle',sil:'qualle',werte:['ernaehrung','schutz','bewegung','reizleitung','abwehr'],autoFill:'nerv',
  zellen:[
   {id:'epi',n:'Epithel',l:'Ektoderm, außen',c:'#6EC1F0',k:2,w:{schutz:1},nur:'aussen',info:'Schutz +1 · nur außen'},
   {id:'darm',n:'Darm-Epithel',l:'Entoderm, innen',c:'#5DD39E',k:2,w:{ernaehrung:1},nur:'innen',info:'Ernährung +1 · nur am Gastralraum'},
   {id:'meso',n:'Mesogloea',l:'Gallerte',c:'#FFA552',k:1,w:{},nur:'mitte',info:'Stütze für Muskeln · nur Mittelschicht'},
   {id:'muskel',n:'Muskel',l:'Epithelmuskelzellen',c:'#FF7A6B',k:3,w:{bewegung:1},nur:'mitte',bed:['meso','nerv'],info:'Bewegung +1 · neben Mesogloea und Nerv'},
   {id:'nerv',n:'Nervennetz',l:'ohne Gehirn',c:'#A98BF0',k:3,w:{reizleitung:1},info:'Reizleitung +1 · zählt auch als Außenhülle'},
   {id:'nessel',n:'Nesselzellen',l:'Cniden',c:'#F2E36B',k:3,w:{abwehr:1},nur:'tent',info:'Abwehr +1 · nur in Tentakeln'}],
  abschnitte:[
   {name:'Schirm',check:[
     {t:'Außenhülle des Schirms aus Epithel (oder Nervennetz)',f:V=>[anz(V,(u,t)=>u.zone.aussen&&u.zone.schirm&&!u.zone.innen&&(t==='epi'||t==='nerv')),anz(V,u=>u.zone.aussen&&u.zone.schirm&&!u.zone.innen)]},
     {t:'Gastralraum ringsum aus Darm-Epithel',f:V=>[anz(V,(u,t)=>u.zone.innen&&u.zone.schirm&&t==='darm'),anz(V,u=>u.zone.innen&&u.zone.schirm)]},
     {t:'mindestens 3 Muskeln, jeder neben Mesogloea und Nerv',f:V=>[anz(V,(u,t,i)=>t==='muskel'&&!V.unv.has(i)),3]}],
    probe:{id:'schwimmen',name:'Schwimmen',txt:'Der Schirm zieht sich zusammen und stößt Wasser aus – das Nervennetz gibt den Takt.',ziele:{bewegung:3,reizleitung:6}},
    ereignisse:['wellen','ruhig']},
   {name:'Tentakel',check:[
     {t:'jede Tentakel mindestens 3 Nesselzellen',f:V=>{let n=0;for(let k=1;k<=4;k++)if(anz(V,(u,t)=>u.zone.tent===k&&t==='nessel')>=3)n++;return[n,4]}},
     {t:'Nervennetz verbindet alle Tentakel mit dem Schirm',f:V=>{const S=strang(V,'nerv',u=>u.zone.schirm);let n=0;for(let k=1;k<=4;k++)if([...S].some(i=>V.U[i].zone.tent===k))n++;return[n,4]}}],
    probe:{id:'beute',name:'Beute fangen',txt:'Kleine Krebse schwimmen vorbei – die Nesselzellen schießen, der Darm verdaut.',ziele:{abwehr:12,ernaehrung:22}},
    ereignisse:['beute','mangel','ruhig']}],
  auto:V=>{const m={},U=V.U,frei=i=>!V.bel[i]&&!m[i];
   if(V.ab===1){U.forEach((u,i)=>{if(!frei(i)||u.ab>1)return;if(u.zone.innen&&u.zone.schirm)m[i]='darm';else if(u.zone.aussen&&u.zone.schirm)m[i]=u.y>.44?'nerv':'epi'});
    let n=anz(V,(u,t)=>t==='muskel');for(const i of idxW(V,u=>u.zone.mitte&&u.zone.schirm)){if(n>=(ziele().bewegung||3))break;if(!frei(i))continue;
     const hat=t=>U[i].nb.some(j=>V.bel[j]===t||m[j]===t),mz=hat('meso')?null:U[i].nb.find(j=>U[j].zone.mitte&&frei(j));if(!hat('meso')&&mz==null)continue;
     const nz=hat('nerv')?null:U[i].nb.find(j=>j!==mz&&!V.bel[j]&&(!m[j]||m[j]==='epi')&&!U[j].zone.innen);if(!hat('nerv')&&nz==null)continue;
     m[i]='muskel';if(mz!=null)m[mz]='meso';if(nz!=null)m[nz]='nerv';n++}}
   else for(let k=1;k<=4;k++){const T=idxW(V,u=>u.zone.tent===k).sort((a,b)=>U[a].y-U[b].y);if(frei(T[0]))m[T[0]]='nerv';T.slice(1,4).forEach(i=>{if(frei(i))m[i]='nessel'})}
   return m}}},
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
   else U.forEach((u,i)=>{if(u.zone.rand&&u.zone.ober&&u.ab===2)m[i]='epi'});return m}},e7:{bonus:140,titel:'Leitgewebe',ziel:'Farn',sil:'farn',werte:['energie','wasser','halt','schutz','transport'],autoFill:'fest',
  zellen:[
   {id:'chlor',n:'Chlorenchym',l:'Blattgewebe',c:'#5DD39E',k:2,w:{energie:1},nur:'wedel',info:'Energie +1 · nur im Wedel'},
   {id:'epi',n:'Epidermis',l:'Abschlussgewebe',c:'#F2E36B',k:2,w:{schutz:1},info:'Schutz +1'},
   {id:'xylem',n:'Xylem',l:'Wasserleitung',c:'#6EC1F0',k:3,w:{},info:'Leitbündel mit Phloem nebeneinander'},
   {id:'phloem',n:'Phloem',l:'Zuckerleitung',c:'#FFA552',k:3,w:{},info:'Leitbündel mit Xylem nebeneinander'},
   {id:'fest',n:'Festigungsgewebe',l:'Sklerenchym',c:'#A98BF0',k:2,w:{halt:1},info:'Halt +1'},
   {id:'wurzel',n:'Wurzelgewebe',l:'echte Wurzel',c:'#FF7A6B',k:2,w:{wasser:1,halt:.5},nur:'unter',info:'Wasser +1, Halt +0,5 · nur im Boden'}],
  versorgung:{buendel:true,max:2,txt:'höchstens 2 Felder von einem Leitbündel (Xylem neben Phloem)'},
  abschnitte:[
   {name:'Wurzel und Spross',check:[
     {t:'Xylem und Phloem durchgehend von der Wurzel bis zum Wedel-Ansatz',f:V=>{const o=t=>[...strang(V,t,u=>u.zone.unter)].some(i=>V.U[i].y<.5)?1:0;return[o('xylem')+o('phloem'),2]}},
     {t:'mindestens 6 Wurzelgewebe',f:V=>[anz(V,(u,t)=>t==='wurzel'),6]}],
    probe:{id:'hoch',name:'Hoch wachsen',txt:'Der Farn reckt sich zum Licht – Festigungsgewebe hält, das Leitgewebe versorgt alles.',ziele:{halt:6,transport:90}},
    ereignisse:['sturm','ruhig']},
   {name:'Wedel',check:[
     {t:'Leitbündel (Xylem neben Phloem) reicht von der Wurzel in jeden Wedel',f:V=>{const L=strang(V,['xylem','phloem'],u=>u.zone.unter);let n=0;for(let k=1;k<=3;k++)if([...L].some(i=>V.U[i].zone.wedel===k&&V.U[i].nb.some(j=>L.has(j)&&V.bel[j]!==V.bel[i])))n++;return[n,3]}},
     {t:'jeder Wedel mindestens 4 Chlorenchym',f:V=>{let n=0;for(let k=1;k<=3;k++)if(anz(V,(u,t)=>u.zone.wedel===k&&t==='chlor')>=4)n++;return[n,3]}},
     {t:'mindestens ein Drittel des Wedel-Rands aus Epidermis',f:V=>[anz(V,(u,t)=>u.zone.wedel&&u.zone.rand&&t==='epi'),Math.ceil(anz(V,u=>u.zone.wedel&&u.zone.rand)/3)]}],
    probe:{id:'sommer',name:'Sommer',txt:'Lange, helle Tage: Die Wedel bilden Zucker, die Wurzeln müssen genug Wasser nachliefern.',ziele:{energie:12,wasser:6}},
    ereignisse:['trocken','konkurrenz','mangel','ruhig']}],
  auto:V=>{const m={},U=V.U,frei=i=>!V.bel[i]&&!m[i]&&U[i].ab<=V.ab,setz=(P,t)=>P.forEach(i=>m[i]=t);
   if(V.ab===1){const s0=U.findIndex(u=>u.seed),top=i=>U[i].y<.5&&!U[i].zone.wedel;if(V.bel[s0])return m;
    const p0=U[s0].nb.filter(frei).sort((a,b)=>Math.abs(U[a].y-U[s0].y)-Math.abs(U[b].y-U[s0].y))[0];m[s0]='xylem';m[p0]='phloem';
    setz(weg(V,[s0],top,frei),'xylem');setz(weg(V,[p0],top,frei),'phloem');
    const dB=i=>Math.min(Math.hypot(U[i].x-U[s0].x,U[i].y-U[s0].y),Math.hypot(U[i].x-U[p0].x,U[i].y-U[p0].y));idxW(V,u=>u.zone.unter).filter(frei).sort((a,b)=>dB(a)-dB(b)).slice(0,7).forEach(i=>m[i]='wurzel')}
   else for(let k=1;k<=3;k++){const xs=idxW(V,(u,t,i)=>t==='xylem'||m[i]==='xylem'),W=idxW(V,u=>u.zone.wedel===k&&!u.zone.rand);
    const tip=W.sort((a,b)=>Math.hypot(U[b].x-.5,U[b].y-.47)-Math.hypot(U[a].x-.5,U[a].y-.47))[0];
    const xp=weg(V,xs,i=>i===tip,frei);setz(xp,'xylem');const end=xp.length?xp[xp.length-1]:tip;
    xp.forEach(i=>{if(!U[i].nb.some(j=>V.bel[j]==='phloem'||m[j]==='phloem')){const f=U[i].nb.find(frei);if(f!=null)m[f]='phloem'}});
    const dP=i=>Math.min(...xp.map(j=>Math.hypot(U[i].x-U[j].x,U[i].y-U[j].y)));
    idxW(V,u=>u.zone.wedel===k).filter(frei).sort((a,b)=>dP(a)-dP(b)).slice(0,5).forEach(i=>m[i]='chlor');
    const R=idxW(V,u=>u.zone.wedel===k&&u.zone.rand).sort((a,b)=>dP(a)-dP(b));R.slice(0,Math.ceil(R.length/3)+1).forEach(i=>{if(frei(i))m[i]='epi'})}
   return m}}},
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
   return m}},e7:{bonus:75,titel:'Fruchtkörper',ziel:'Fliegenpilz',sil:'fliegenpilz',werte:['nahrung','versorgung','halt','ausbreitung','schutz'],autoQuelle:'trans',autoFill:'trans',
  zellen:[
   {id:'myzel',n:'Myzel-Hyphe',l:'im Boden',c:'#5DD39E',k:1,w:{nahrung:1},nur:'unter',info:'Nahrung +1 · nur im Boden'},
   {id:'stiel',n:'Stiel-Hyphe',l:'dicht verflochten',c:'#F2E36B',k:2,w:{halt:1},nur:'stiel',dicht:1,info:'Halt +1 · nur als Scheingewebe (Knoten mit 4 Hyphen)'},
   {id:'haut',n:'Huthaut',l:'Oberseite',c:'#FF7A6B',k:2,w:{schutz:1},nur:'haut',info:'Schutz +1 · nur oben am Hut'},
   {id:'lam',n:'Lamellen-Hyphe',l:'mit Sporen',c:'#A98BF0',k:3,w:{ausbreitung:1},nur:'lam',info:'Ausbreitung +1 · nur unter dem Hut'},
   {id:'trans',n:'Transporthyphe',l:'Leitung',c:'#FFA552',k:2,w:{versorgung:1},info:'Versorgung +1'}],
  abschnitte:[
   {name:'Myzel und Stiel',check:[
     {t:'Stiel als Scheingewebe vom Boden bis zur Hut-Höhe',f:V=>[stielOk(V)?1:0,1],ja:1},
     {t:'Myzel berührt die Baumwurzel (Mykorrhiza)',f:V=>[anz(V,(u,t)=>t&&u.zone.wurzel)?1:0,1],ja:1}],
    probe:{id:'tragen',name:'Fruchtkörper tragen',txt:'Der Stiel schiebt sich aus dem Boden und muss den Hut tragen.',ziele:{halt:12,versorgung:3}},
    ereignisse:['sturm','ruhig']},
   {name:'Hut',check:[
     {t:'Huthaut deckt mindestens 60 % der Hut-Oberseite',f:V=>[anz(V,(u,t)=>t==='haut'),Math.ceil(anz(V,u=>u.zone.haut)*.6)]},
     {t:'Lamellen unter mindestens der Hälfte des Huts',f:V=>[anz(V,(u,t)=>t==='lam'),Math.ceil(anz(V,u=>u.zone.lam)*.5)]}],
    probe:{id:'fallen',name:'Sporen fallen',txt:'Unter dem Hut rieseln Millionen Sporen heraus, die Huthaut schützt vor Regen.',ziele:{ausbreitung:10,schutz:14}},
    ereignisse:['konkurrenz','uv','kaelte','trocken','ruhig']}],
  auto:V=>{const m={},U=V.U,frei=i=>!V.bel[i]&&!m[i]&&U[i].ab<=V.ab;
   if(V.ab===1){idxW(V,u=>u.zone.stiel).filter(frei).forEach(i=>m[i]='stiel');
    const st=idxW(V,u=>u.seed);weg(V,st,i=>U[i].zone.wurzel,i=>frei(i)&&U[i].zone.unter).forEach(i=>m[i]='myzel')}
   else{const d=i=>Math.hypot(U[i].x-.5,U[i].y-.4),H=idxW(V,u=>u.zone.haut).sort((a,b)=>d(a)-d(b)),L=idxW(V,u=>u.zone.lam).sort((a,b)=>d(a)-d(b));
    L.slice(0,Math.ceil(L.length*.5)+1).forEach(i=>m[i]='lam');H.slice(0,Math.ceil(H.length*.6)+1).forEach(i=>m[i]='haut')}
   return m}}}
};
const EREIGNISSE={
 kaelte:{n:'Kälte',w:['schutz'],p:2},stroemung:{n:'Strömung',w:['stuetze','halt'],p:2},trocken:{n:'Trockenheit',w:['wasser','schutz'],p:2},
 mangel:{n:'Nährstoffmangel',w:['ernaehrung','nahrung','energie'],p:2},uv:{n:'UV-Strahlung',w:['schutz'],p:1},
 konkurrenz:{n:'Konkurrenz',w:['ausbreitung','energie'],p:2},sturm:{n:'Sturm',w:['halt'],p:2},wellen:{n:'Starke Wellen',w:['bewegung'],p:1},beute:{n:'Flinke Beute',w:['abwehr'],p:2},ruhig:{n:'Ruhige Zeit',w:[],p:0}};
const evWert=ev=>{const A=abs();return ev&&A.probe?ev.w.find(k=>A.probe.ziele[k]!=null)||null:null};
const NEU=[{id:'moos',name:'Moos',xp:250,stufe:3,form:'moos',c:'#5DD39E',weg:'Vielzeller-Pflanze ohne Leitgewebe (Ebene 6)',
 fakten:['Hat keine echten Wurzeln, nur Rhizoide zum Festhalten.','Nimmt Wasser über die ganze Oberfläche auf.','Vermehrt sich über Sporen und braucht Wasser zur Befruchtung.']},
 {id:'schimmel',name:'Schimmelpilz',xp:250,stufe:3,form:'schimmel',c:'#A98BF0',weg:'Vielzeller-Pilz ohne Fruchtkörper (Ebene 6)',
 fakten:['Ein Geflecht aus Hyphen, das Myzel.','Seine Sporen schweben überall in der Luft.','Aus dem Schimmelpilz Penicillium stammt das Antibiotikum Penicillin.']}];
NEU.push({id:'qualle',name:'Qualle',xp:500,stufe:4,form:'qualle',c:'#A98BF0',weg:'Tier mit zwei Keimblättern (Ebene 7)',
 fakten:['Zwei Gewebeschichten mit Gallerte (Mesogloea) dazwischen.','Ein Nervennetz steuert den Schirm – ein Gehirn hat sie nicht.','Fängt Beute mit Nesselzellen und besteht zum größten Teil aus Wasser.']},
 {id:'farn',name:'Farn',xp:500,stufe:4,form:'farn',c:'#5DD39E',weg:'Pflanze mit Leitgewebe (Ebene 7)',
 fakten:['Leitgewebe (Xylem und Phloem) erlaubt höheres Wachstum.','Die Sporen sitzen unter den Wedeln.','Farnwälder der Urzeit wurden zu Steinkohle.']},
 {id:'fliegenpilz',name:'Fliegenpilz',xp:500,stufe:4,form:'fliegenpilz',c:'#FF7A6B',weg:'Pilz mit Fruchtkörper (Ebene 7)',
 fakten:['Der sichtbare Pilz ist nur der Fruchtkörper – das Myzel lebt im Boden.','Lebt in Partnerschaft mit Birken und Fichten (Mykorrhiza).','Giftig – nicht essen!']});
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
 V={run,reich,e,U,ab:a?a.ab:1,budget:a?a.budget:(run.vzBudget||70)+(c.bonus||0),typ:c.zellen[0].id,bel:U.map((_,i)=>a&&a.bel[i]||null),
  stab:a?a.stab:stabMax,stabMax,fehl:a?a.fehl:false,probe:false,unv:new Set()};
 if(!a){run.aufbau=null}sichere('run',run);
 baueBrett();malPalette();aktualisiere();zeige('vz');hinweis(V.ab===1?'Tippe auf das gelb markierte Startfeld – deine Zellen wachsen von dort aus.':'')}
function speichere(){V.run.aufbau={e:V.e,ab:V.ab,budget:V.budget,bel:V.bel,stab:V.stab,fehl:V.fehl};sichere('run',V.run)}
function ereignis(){const A=abs();if(!A.ereignisse)return null;const r=rngV((V.run.seed|0)+V.e*31+V.ab*7)();return EREIGNISSE[A.ereignisse[Math.floor(r*A.ereignisse.length)]]}
function ziele(){const A=abs();if(!A.probe)return{};const z={...A.probe.ziele},ev=ereignis(),k=evWert(ev);if(k)z[k]+=ev.p;return z}
// Versorgung: BFS über belegte Zellen von den Quellen aus
function rechne(){const c=cfgE(),vs=c.versorgung,U=V.U,dist=new Array(U.length).fill(Infinity),q=[];V.unv=new Set();V.fehlt=new Map();
 const nbT=(i,t)=>U[i].nb.some(j=>V.bel[j]===t);
 if(vs){V.bel.forEach((t,i)=>{if(t&&(vs.buendel?(t==='xylem'&&nbT(i,'phloem'))||(t==='phloem'&&nbT(i,'xylem')):vs.quellen.includes(t))){dist[i]=0;q.push(i)}});
  for(let h=0;h<q.length;h++){const i=q[h];for(const j of V.U[i].nb)if(V.bel[j]&&dist[j]>dist[i]+1){dist[j]=dist[i]+1;q.push(j)}}
  V.bel.forEach((t,i)=>{if(t&&dist[i]>vs.max&&(!vs.nurFuer||vs.nurFuer.includes(t))){V.unv.add(i);V.fehlt.set(i,c.autoQuelle)}})}
 V.dicht=new Map();V.bel.forEach((t,i)=>{if(t&&U[i].kn)U[i].kn.forEach(k=>V.dicht.set(k,(V.dicht.get(k)||0)+1))});
 V.bel.forEach((t,i)=>{if(!t)return;const T=typ(t);
  if(T.bed){const b=T.bed.find(b=>!nbT(i,b));if(b){V.unv.add(i);V.fehlt.set(i,b)}}
  if(T.dicht&&!U[i].kn.some(k=>V.dicht.get(k)>=4)){V.unv.add(i);V.fehlt.set(i,t)}});
 const w={};c.werte.forEach(k=>w[k]=0);V.bel.forEach((t,i)=>{if(!t||V.unv.has(i))return;const T=typ(t);for(const k in T.w)w[k]=(w[k]||0)+T.w[k]});
 if(c.werte.includes('transport')){const n=V.bel.filter(Boolean).length;w.transport=n?Math.round(100*(n-V.unv.size)/n):0}
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
 if(sil.boden!=null)s+=`<rect x="0" y="${sil.boden*1000}" width="1000" height="${(1-sil.boden)*1000}" fill="#2E2A24"/><line x1="0" y1="${sil.boden*1000}" x2="1000" y2="${sil.boden*1000}" stroke="#5A5955" stroke-width="4" stroke-dasharray="14 10"/><text x="20" y="${sil.boden*1000+40}" fill="#B9B8B2" font-size="26" opacity=".7">${c.sil==='pilz'?'Substrat (Laub)':'Boden'}</text><text x="20" y="${sil.boden*1000-18}" fill="#B9B8B2" font-size="26" opacity=".7">${c.sil==='pilz'?'Luft':'Luft und Licht'}</text>`;
 if(c.sil==='fliegenpilz')s+='<path d="M1000 640 C930 700 900 760 830 800 C880 820 940 790 1000 820 Z" fill="#5A4636"/><text x="985" y="870" fill="#B9B8B2" font-size="24" text-anchor="end" opacity=".8">Baumwurzel</text>';
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
 $('vzEv').innerHTML=A.probe?`<div class="kl">Lebensprobe</div><b>${A.probe.name}</b><small>${A.probe.txt}</small>`+(ev?`<div class="vzEk"><span class="kl">Ereignis</span><b>${ev.n}</b><small>${evWert(ev)?WERTE[evWert(ev)]+'-Ziel +'+ev.p:'keine Erhöhung'}</small></div>`:''):'';
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
const idxTyp=(...T)=>V.U.map((u,i)=>i).filter(i=>T.includes(V.bel[i]));
const lerp=(a,b,f)=>a+(b-a)*f,punkt=(x,y,r,c,o=1)=>`<circle cx="${x*1000}" cy="${y*1000}" r="${r}" fill="${c}" opacity="${o}"/>`;
const strom=(n,t,von,nach,c,r=7,v=2)=>{let s='';if(!nach.length)return s;for(let k=0;k<n;k++){const f=(t*v+k/n)%1,[ax,ay]=von(k),u=V.U[nach[k%nach.length]];s+=punkt(lerp(ax,u.x,f),lerp(ay,u.y,f),r,c,f<.85?.9:(1-f)*6)}return s};
const SZENE={
 fotosynthese:(t)=>`<circle cx="880" cy="110" r="${55+5*Math.sin(t*20)}" fill="#FDD602"/>`+strom(30,t,()=>[.88,.11],idxTyp('chlor'),'#FDD602',6),
 trocken:(t)=>`<rect x="0" y="0" width="1000" height="${SIL.moos.boden*1000}" fill="#FFA552" opacity="${.12+.06*Math.sin(t*12)}"/>`+
  idxTyp('rhiz','speicher').map(i=>punkt(V.U[i].x,V.U[i].y,9*(1-t*.5),'#6EC1F0',.9)).join('')+idxTyp('epi').map(i=>punkt(V.U[i].x,V.U[i].y,6,'#F2F1EC',.5+.4*Math.sin(t*15+i))).join(''),
 zersetzen:(t)=>strom(40,t,k=>[.08+((k*37)%84)/100,.62+((k*13)%28)/100],idxTyp('naehr'),'#C9A36B',6,1.5)+strom(16,t,()=>SIL.pilz.start,idxTyp('trans'),'#FFA552',6,1.2),
 schwimmen:(t)=>{const a=Math.sin(t*Math.PI*6);$('vzZ').setAttribute('transform',`translate(500 300) scale(${1-.05*a} ${1+.05*a}) translate(-500 ${-300-40*t})`);
  let s='';for(let k=0;k<14;k++){const f=(t*2+k/14)%1;s+=punkt(.5+Math.sin(k*2.3)*.12,.65+f*.3,6,'#6EC1F0',1-f)}return s},
 beute:(t)=>{const N=idxTyp('nessel');let s='';N.forEach((i,k)=>{const u=V.U[i],f=(t*1.6+k*.13)%1,sx=u.x<.5?-.05:1.05;s+=punkt(lerp(sx,u.x,f),u.y+Math.sin(f*9+k)*.03,7,'#FFA552',1);
   if(f>.85)s+=`<circle cx="${u.x*1000}" cy="${u.y*1000}" r="${30*(f-.85)/.15}" fill="none" stroke="#F2E36B" stroke-width="4"/>`});return s},
 hoch:(t)=>{$('vzZ').setAttribute('transform',`translate(500 740) scale(1 ${1+.06*Math.sin(t*Math.PI)}) translate(-500 -740)`);
  return strom(24,t,k=>[.5,.9],idxTyp('xylem','phloem'),'#6EC1F0',5,1.5)},
 sommer:(t)=>`<circle cx="880" cy="100" r="${55+5*Math.sin(t*20)}" fill="#FDD602"/>`+strom(30,t,()=>[.88,.1],idxTyp('chlor'),'#FDD602',6)+strom(20,t,k=>[.3+(k%7)*.06,.95],idxTyp('wurzel','xylem'),'#6EC1F0',6,1.2),
 tragen:(t)=>{$('vzZ').setAttribute('transform',`translate(0 ${-14*Math.sin(t*Math.PI)})`);return strom(20,t,()=>[.5,.62],idxTyp('trans','stiel'),'#FFA552',6,1.4)},
 fallen:(t)=>{let s='';idxTyp('lam').forEach((i,k)=>{const u=V.U[i];for(let j=0;j<4;j++){const f=(t*1.4+j/4+k*.07)%1;s+=punkt(u.x+Math.sin(f*6+k)*.02,u.y+f*.35,4,'#A98BF0',1-f)}});return s},
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
 run.vzStab=bonus?1:0;run.vzBudget=V.budget+30;run.aufbau=null;
 if(V.e===7){const id={tiere:'qualle',pflanzen:'farn',pilze:'fliegenpilz'}[V.reich];V=null;return schalteFrei(id,run)}
 const nx='w'+V.e;run.ebene=nx;sichere('run',run);
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
  {id:'e7',name:A[2],weg:A[3],folge:'Weiter zu Ebene 7.',kosten:'ab 500 XP (du: '+xp+')'+(run.test||xp>=500?' ✓':''),zu:!run.test&&xp<500}],
  id=>{if(id!=='e7')return schalteFrei(id,run);run.ebene=7;run.aufbau=null;sichere('run',run);starte(7,run)})}

// ---------- Skizzen für Lexikon/Weiche ----------
function skizzeForm(f,c){if(f==='schwamm')return `<path d="M17 8 L15 20 L11 34 L15 46 L28 50 L41 46 L45 34 L41 20 L39 8 L33 8 L34 22 L32 38 L28 40 L24 38 L22 22 L23 8Z" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>${[[16,28],[40,26],[20,42],[36,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="${c}"/>`).join('')}`;
 if(f==='moos')return `<path d="M28 50 V18" stroke="${c}" stroke-width="3"/>${[[28,20,-1],[28,28,1],[28,34,-1],[28,42,1]].map(([x,y,d])=>`<path d="M${x} ${y} q${d*8} -8 ${d*14} -4 q${-d*6} 6 ${-d*14} 4z" fill="${c}"/>`).join('')}<path d="M24 50 l-4 5 M28 50 v6 M32 50 l4 5" stroke="${c}" stroke-width="1.6"/><line x1="10" y1="50" x2="46" y2="50" stroke="#5A5955" stroke-width="2"/>`;
 if(f==='schimmel')return `<path d="M8 44 Q18 36 28 44 T48 44" fill="none" stroke="${c}" stroke-width="2.5"/>${[[14,40],[24,42],[34,40],[42,42]].map(([x,y])=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-18}" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="${y-21}" r="4" fill="${c}"/>`).join('')}<rect x="6" y="46" width="44" height="6" rx="3" fill="#5A5955"/>`;
 if(f==='qualle')return `<path d="M8 28 Q8 8 28 8 Q48 8 48 28 Z" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="2.5"/>${[14,23,33,42].map((x,k)=>`<path d="M${x} 28 q${k%2?3:-3} 8 0 14 q${k%2?-3:3} 6 0 10" fill="none" stroke="${c}" stroke-width="2"/>`).join('')}`;
 if(f==='farn')return `<path d="M28 52 V28" stroke="${c}" stroke-width="2.5"/>${[[28,30,-1],[28,30,1],[28,30,0]].map(([x,y,d])=>`<path d="M${x} ${y} Q${x+d*12} ${y-14} ${x+d*20} ${y-(d?16:24)}" fill="none" stroke="${c}" stroke-width="2.5"/>`).join('')}${[...Array(5)].map((_,k)=>`<line x1="${28-k*3.5}" y1="${27-k*3}" x2="${24-k*3.5}" y2="${31-k*3}" stroke="${c}" stroke-width="2"/><line x1="${28+k*3.5}" y1="${27-k*3}" x2="${32+k*3.5}" y2="${31-k*3}" stroke="${c}" stroke-width="2"/>`).join('')}`;
 if(f==='fliegenpilz')return `<rect x="24" y="26" width="8" height="24" rx="3" fill="#F2F1EC"/><path d="M8 28 Q10 8 28 8 Q46 8 48 28 Z" fill="${c}"/>${[[18,16],[30,13],[38,20],[24,22]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="#F2F1EC"/>`).join('')}`;
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
 [SCHWAMM,...NEU].forEach(g=>{if(!G_(g.id))GESCHOEPFE.push(g)});
 WEITER[6]=()=>starte(6);WEITER[7]=()=>starte(7);WEITER.w6=zeigeWeiche6}
// Testmodus-Knöpfe
function testKnoepfe(){return['tiere','pflanzen','pilze'].map(r=>`<button class="btn" data-e="vz6-${r}">E6 ${REICHE[r].name}</button><button class="btn" data-e="vz7-${r}">E7 ${REICHE[r].name}</button>`).join('')+'<button class="btn" data-e="vzw6-tiere">Weiche E6</button>'}
function test(code){const[,e,reich]=code.match(/^vz(w?6|7)-(\w+)$/);
 const run={seed:(Math.random()*2**31)|0,ebene:e==='w6'?'w6':+e,bonusStab:0,xpLauf:[],test:true,reich,mito:true,chloro:reich==='pflanzen',wand:{tiere:'keine',pflanzen:'cellulose',pilze:'chitin'}[reich],vzBudget:70};
 sichere('run',run);if(e==='w6')zeigeWeiche6();else{if(e==='7')run.vzBudget=40;starte(+e,run)}}
// Test-Hook: erfüllt die Pflichtpunkte des Abschnitts automatisch (nur Tiere E6 vollständig)
function probier(i,t){V.bel[i]=t;rechne();const ok=!V.unv.has(i);V.bel[i]=null;rechne();return ok}
function simAufbau(sofort=true){if(!V)return'kein Aufbau';const c=cfgE();if(!c.auto)return'kein Autopilot';
 const soll=c.auto(V),U=V.U,erlaubt=i=>U[i].ab<=V.ab;
 const pfad=ziel=>{const prev=new Map(),q=[];V.bel.forEach((t,i)=>{if(t){q.push(i);prev.set(i,-1)}});if(!q.length){const s=U.findIndex(u=>u.seed);q.push(s);prev.set(s,-2)}
  for(let h=0;h<q.length;h++){const i=q[h];if(i===ziel)break;for(const j of U[i].nb)if(!prev.has(j)&&erlaubt(j)){prev.set(j,i);q.push(j)}}
  const P=[];let k=ziel;while(k!=null&&k>=0&&!V.bel[k]){P.unshift(k);k=prev.get(k)}return P};
 const[sx,sy]=SIL[c.sil].start,dS=i=>Math.hypot(U[i].x-sx,U[i].y-sy),reihe=new Map();{const q=V.bel.map((t,i)=>t?i:-1).filter(i=>i>=0);if(!q.length)q.push(U.findIndex(u=>u.seed));const seen=new Set(q);
  for(let h=0;h<q.length;h++){reihe.set(q[h],h);for(const j of U[q[h]].nb)if(!seen.has(j)&&(j in soll)){seen.add(j);q.push(j)}}}
 const rang=i=>reihe.has(i)?reihe.get(i):1e4+dS(i)*1e3,ziele=Object.keys(soll).map(Number).sort((a,b)=>rang(a)-rang(b));
 for(const z of ziele){if(V.bel[z])continue;for(const i of pfad(z))if(!V.bel[i])setze(i,soll[i]||c.autoFill)}
 for(let n=0;n<150;n++){rechne();const zl=ziele_();const u=[...V.unv].find(i=>V.fehlt.get(i));let t=null,ort=null;
  if(u!=null){t=V.fehlt.get(u)||c.autoQuelle;const T=typ(t),seen=new Set([u]),q=[u];ort=null;for(let h=0;h<q.length&&ort==null;h++)for(const j of U[q[h]].nb){if(seen.has(j))continue;seen.add(j);q.push(j);if(!V.bel[j]&&erlaubt(j)&&belegbar(j)&&!(j in soll)&&(!T.nur||U[j].zone[T.nur])){ort=j;break}}}
  else{const k=Object.keys(zl).find(k=>V.w[k]<zl[k]);if(!k)break;const T=c.zellen.filter(z=>z.w[k]).sort((a,b)=>!!a.nur-!!b.nur)[0];t=T.id;
   ort=U.findIndex((x,i)=>!V.bel[i]&&erlaubt(i)&&belegbar(i)&&(T.nur?x.zone[T.nur]:!x.zone.aussen)&&probier(i,t))}
  if(ort==null||ort<0||setze(ort,t)!==true)break}
 aktualisiere();speichere();const st=state();if(V.bereit){V._sofort=sofort;probe();V&&(V._sofort=false)}return st}
const ziele_=()=>ziele();
function state(){if(!V)return{screen:document.querySelector('.scr.on').id};return{screen:'vz',reich:V.reich,e:V.e,ab:V.ab,budget:V.budget,stab:V.stab,zellen:V.U.length,
 aussen:V.U.filter(u=>u.zone.aussen).length,innen:V.U.filter(u=>u.zone.innen).length,belegt:V.bel.filter(Boolean).length,unv:V.unv.size,werte:V.w,ziele:ziele(),checks:V.checks.map(c=>c.ok),bereit:V.bereit}}
return{_raster:raster,_auto:()=>cfgE().auto(V),init,testKnoepfe,test,skizzeForm,starte,zeigeWeiche6,simAufbau,state,weiter:()=>{const b=document.querySelector('#vzRes.on button');if(b)b.click();return state()},_V:()=>V}})();
