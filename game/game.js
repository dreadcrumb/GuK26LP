(function(){
'use strict';
const SP = window.GAME_SPR;
const QD = window.GAME_QD;
// Eigene Fragen aus dem Lernportal als Fach "Meine Fragen" ergänzen (gleicher Browser-Speicher wie das Portal)
try{ const MY=JSON.parse(localStorage.getItem('lernportal-guk-my')||'null'); const mine=[];
  if(MY&&MY.q) Object.keys(MY.q).forEach(id=>(MY.q[id]||[]).forEach(x=>{ if(x.del||x.y||!x.o||x.o.length<3) return;
    const r=x.o.filter(o=>o[1]), w=x.o.filter(o=>!o[1]).map(o=>o[0]); if(r.length!==1||w.length<2) return;
    const s=QD.subjects.find(z=>z.id===id);
    mine.push({q:x.q,r:r[0][0],w,e:x.e||'',s:'Meine Frage · '+(s?s.name:'')+' · Kapitel '+((x.k||0)+1)}); }));
  if(mine.length){ QD.subjects.push({id:'meine',name:'Meine Fragen (aus dem Lernteil)'}); QD.q.meine=mine; } }catch(e){}
const W=844, H=390, RUNX=170;
const LANES=[[188,232],[232,280],[280,332],[332,390]];
const FLOOR=LANES.map(l=>l[1]-8);
const DK='#2B2A33';
const COLS=[['#FF7A9A','#FFE3EC'],['#FFC233','#FFF3CC'],['#3FCB9B','#DDF8EE'],['#5AB8F0','#E0F3FF']];
const THEMES=[['nacht','Nachtdienst'],['aufgang','Frühdienst'],['untergang','Spätdienst']];
const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem('aad2-'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('aad2-'+k,JSON.stringify(v));}catch(e){}}};

/* ---------- Bilder ---------- */
const IMG={}; let loaded=0; const names=Object.keys(SP);
names.forEach(n=>{ const im=new Image(); im.onload=()=>{loaded++; if(loaded===names.length) ready();}; im.onerror=()=>{loaded++; if(loaded===names.length) ready();};
  im.src=URL.createObjectURL(new Blob([SP[n].svg],{type:'image/svg+xml'})); IMG[n]=im; });
const BK={}; let BKR=0;
function rres(){ return Math.min(3,Math.max(1,SC*DPR)); }
function bimg(n){ const R=rres(); if(Math.abs(R-BKR)>0.01){ for(const k in BK) delete BK[k]; BKR=R; } const c0=BK[n]; if(c0) return c0; const im=IMG[n], s=SP[n]; if(!im||!im.complete||!im.naturalWidth) return null;
  const big=n.startsWith('bg_')||n.startsWith('fl_')||n==='map_bg'; const k=big?R:Math.min(3.5,R*1.25); const c=document.createElement('canvas'); c.width=Math.max(1,Math.ceil(s.w*k)); c.height=Math.max(1,Math.ceil(s.h*k));
  try{ c.getContext('2d').drawImage(im,0,0,c.width,c.height); }catch(e){ return im; } BK[n]=c; return c; }
function purgeBK(keep){ for(const k in BK){ if((k.startsWith('bg_')||k.startsWith('fl_'))&&!k.startsWith('bg_'+keep+'_')&&k!=='fl_'+keep) delete BK[k]; } }
function prebake(st){ purgeBK(st); ['nacht','aufgang','untergang'].forEach(t=>bimg('bg_'+st+'_'+t)); bimg('fl_'+st); Object.keys(SP).forEach(n=>{ if(!n.startsWith('bg_')&&!n.startsWith('fl_')&&n!=='map_bg') bimg(n); }); }
function spr(n,x,y,a){ const s=SP[n]; const im=bimg(n)||IMG[n]; if(!im) return; ctx.globalAlpha=a==null?1:a; ctx.drawImage(im,x-s.ax,y-s.ay,s.w,s.h); ctx.globalAlpha=1; }

/* ---------- Canvas & Skalierung ---------- */
const cv=$('#cv'), wrap=$('#wrap'), stage=$('#stage'); let ctx=cv.getContext('2d');
/* Mrs. Smith vor der Fragenleiste: eigene Ebene über #qbar */
const cvTop=$('#cvTop'), tctx=cvTop.getContext('2d'), QB=$('#qbar'); let topDirty=false;
function smithOnTop(){ return !QB.hidden && !document.querySelector('#wrap .ov:not([hidden])'); }
function clearTop(){ if(!topDirty) return; tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,cvTop.width,cvTop.height); topDirty=false; }
let SC=1, DPR=1;
function fit(){
  const vw=window.innerWidth, vh=window.innerHeight;
  SC=Math.min(vw/W, vh/H); DPR=Math.min(2,window.devicePixelRatio||1); DPR=Math.max(0.75,Math.min(DPR,Math.sqrt(3.0e6/(W*SC*H*SC))));
  stage.style.width=(W*SC)+'px'; stage.style.height=(H*SC)+'px';
  wrap.style.transform='scale('+SC+')';
  cv.width=Math.round(W*SC*DPR); cv.height=Math.round(H*SC*DPR); cvTop.width=cv.width; cvTop.height=cv.height; topDirty=false;
  $('#rot').hidden=!(vh>vw*1.1 && vw<700) || store.get('rotok',false);
}
window.addEventListener('resize',fit);

/* ---------- Audio ---------- */
let AC=null, sfxOn=store.get('sfx',true), musOn=store.get('mus',true), musT=0, musStep=0;
function audio(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; } } if(AC&&AC.state==='suspended') AC.resume().catch(()=>{}); if(AC&&musOn&&!LOFI.playing) LOFI.start(AC); }
function tone(f,d,type,vol,when){ if(!AC) return; const t=AC.currentTime+(when||0); const o=AC.createOscillator(), g=AC.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.12,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+0.02); }
function sfx(k){ if(!sfxOn||!AC) return;
  if(k==='apple'){ tone(988,0.09,'triangle',0.09); tone(1319,0.12,'triangle',0.07,0.05); }
  else if(k==='ok'){ [659,784,988,1319].forEach((f,i)=>tone(f,0.18,'triangle',0.1,i*0.07)); }
  else if(k==='bad'){ tone(330,0.22,'square',0.05); tone(247,0.3,'square',0.05,0.12); }
  else if(k==='bump'){ tone(140,0.15,'sine',0.14); }
  else if(k==='jump'){ tone(520,0.12,'sine',0.07); tone(780,0.1,'sine',0.05,0.05); }
  else if(k==='lane'){ tone(700,0.05,'sine',0.04); }
  else if(k==='coin'){ tone(880,0.06,'triangle',0.05); tone(1175,0.08,'triangle',0.04,0.04); }
  else if(k==='gate'){ [523,659,784].forEach((f,i)=>tone(f,0.14,'triangle',0.07,i*0.06)); }
  else if(k==='heart'){ tone(784,0.12,'sine',0.08); tone(1047,0.18,'sine',0.08,0.08); }
}
function music(){}

/* ---------- Fragen ---------- */
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
/* Fragen-Rotation: zuletzt gestellte Fragen nach hinten */
const GSEENK='aad-seen-v1'; let GSEEN={}; try{ GSEEN=JSON.parse(localStorage.getItem(GSEENK)||'{}')||{}; }catch(e){ GSEEN={}; }
function ghash(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(36); }
function gkey(q){ return (q.sid||'')+':'+ghash((q.q||'')+'|'+(q.r||'')); }
function gMark(q){ if(!q) return; GSEEN[gkey(q)]=Date.now(); try{ localStorage.setItem(GSEENK,JSON.stringify(GSEEN)); }catch(e){} }
function gFresh(L){ return shuffle(L.slice()).map((q,i)=>[q,GSEEN[gkey(q)]||0,i]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).map(x=>x[0]); }
/* Varianten-Abstand: inhaltsgleiche Fragen (gleiche Gruppe g oder gleiche Antwort) frühestens nach 10 anderen */
function gKeys(q){ const sid=q.sid||''; const k=(q.g||[]).map(x=>sid+':'+x); k.push(sid+':r:'+String(q.r||'').toLowerCase().replace(/[^a-zäöüß0-9]+/g,' ').trim()); return k; }
let GREC=[];
function gRecent(q){ GREC.push(gKeys(q)); if(GREC.length>10) GREC.shift(); }
function gClash(q){ const ks=gKeys(q); return GREC.some(r=>r.some(k=>ks.includes(k))); }
function gPick(P){ const A=gFresh(P); const F=A.filter(q=>!gClash(q)); const L=F.length?F:A; const k=Math.max(1,Math.ceil(L.length*0.25)); const q=L[Math.floor(Math.random()*k)]; if(q) gRecent(q); return q; }
function gVariantFirst(L){ const used=new Set(), a=[], b=[]; L.forEach(q=>{ const ks=gKeys(q); if(ks.some(k=>used.has(k))) b.push(q); else { ks.forEach(k=>used.add(k)); a.push(q); } }); return a.concat(b); }
function gSpace(list){ const rest=list.slice(), out=[], last={}, cnt={}; const KS=new Map(); rest.forEach(p=>{ const ks=gKeys(p); KS.set(p,ks); ks.forEach(k=>cnt[k]=(cnt[k]||0)+1); });
  const maxc=Math.max(1,...Object.values(cnt)); const gap=Math.min(10,Math.max(2,Math.floor(list.length/maxc)));
  while(rest.length){ let pick=-1,press=-1,alt=0,best=-1;
    for(let i=0,W=Math.min(rest.length,300);i<W;i++){ const ks=KS.get(rest[i]); let age=Infinity, pr=0; for(const k of ks){ if(last[k]!=null) age=Math.min(age,out.length-last[k]); pr=Math.max(pr,cnt[k]); }
      if(age>=gap){ if(pr>press){ press=pr; pick=i; } } else if(age>best){ best=age; alt=i; } }
    if(pick<0) pick=alt; const p=rest.splice(pick,1)[0]; KS.get(p).forEach(k=>{ last[k]=out.length; cnt[k]--; }); out.push(p); }
  return out; }
function pool(sel){ const ids=sel==='alle'?QD.subjects.map(s=>s.id):[sel]; const out=[]; ids.forEach(id=>(QD.q[id]||[]).forEach(q=>out.push(Object.assign({sid:id},q)))); return out; }
function subjName(id){ const s=QD.subjects.find(x=>x.id===id); return s?(id==='fremd'?'Medizinische Begriffe':s.name):''; }

/* ---------- Gegenstände & Figuren ---------- */
const OBST=[{k:'iv',h:38,lv:1,n:'Infusionsständer'},{k:'wet',h:30,lv:1,n:'Nass-Schild'},{k:'bed',h:40,lv:1,n:'Bett'},
  {k:'cart',h:42,lv:2,n:'Wäschewagen',roll:1},{k:'wheel',h:44,lv:2,n:'Rollstuhl',roll:1},{k:'o2',h:56,lv:3,n:'Sauerstoffflasche'},{k:'medcart',h:64,lv:3,n:'Medikamentenwagen',roll:1},
  {k:'boxes',h:50,lv:4,n:'Kartonstapel'},{k:'bin',h:36,lv:4,n:'Abwurfbehälter'},{k:'rollator',h:44,lv:5,n:'Rollator',roll:1},
  {k:'mikroskop',h:52,lv:2,n:'Mikroskop'},{k:'defi',h:60,lv:3,n:'Defibrillator',roll:1},{k:'ekg',h:70,lv:3,n:'EKG-Monitor',roll:1},{k:'torso',h:72,lv:4,n:'Anatomie-Torso'},{k:'wortblock',h:66,lv:4,n:'Wortbausteine'},{k:'skelett',h:118,lv:5,n:'Skelett',tall:1}];
const OH={}; OBST.forEach(o=>OH[o.k]=o.h); Object.assign(OH,{germ:34,toy:40,pills:46,oillamp:30,books:40}); const TALL={skelett:1};
const ONAME={germ:'Keim',toy:'Bauklötze',pills:'Pillendose',oillamp:'Öllampe',books:'Bücherstapel'};
const STATION={
  alle:{name:'Klinikum',obs:[],npc:[],mus:{title:'Nachtschicht',bpm:76,tr:0,lead:null,cut:1,crackle:1,keys:'rhodes',drums:'boom'}},
  hyg:{name:'Hygiene-Labor',obs:['germ','wet','bin','mikroskop'],npc:['brokkoli','aubergine','banane','orange'],mus:{title:'Saubere Sache',bpm:84,tr:2,lead:'box',cut:1.15,crackle:0.5,keys:'kalimba',arp:1,drums:'rim',swing:0.15,amb:'bubbles'}},
  kl1:{name:'Interne Station',obs:['iv','o2','bed','ekg','defi'],npc:['aubergine','karotte','birne','paprika','ananas'],mus:{title:'Herzschlag',bpm:72,tr:0,lead:'ep',cut:1,crackle:0.9,keys:'rhodes',drums:'halftime',minor:1,amb:'monitor'}},
  pgk:{name:'Pflegestation',obs:['bed','rollator','wheel'],npc:['pflaume','zitrone','birne','brokkoli','orange','tomate'],mus:{title:'Sanfte Lagerung',bpm:74,tr:-2,lead:'flute',cut:0.95,crackle:0.9,keys:'guitar',drums:'brush',swing:0.25}},
  pharma:{name:'Klinik-Apotheke',obs:['pills','medcart','bin','mikroskop'],npc:['kiwi','aubergine','traube','paprika'],mus:{title:'Pillen-Pause',bpm:80,tr:5,lead:'box',cut:1.05,crackle:0.8,keys:'piano',drums:'shuffle',bassk:'walk'}},
  paed:{name:'Kinderstation',obs:['toy','wet','cart'],npc:['erdbeere','erdbeere','karotte','orange'],mus:{title:'Bunte Bausteine',bpm:90,tr:4,lead:'box',cut:1.25,crackle:0.4,keys:'kalimba',arp:1,drums:'boom',swing:0.2,amb:'chime'}},
  recht:{name:'Rechts-Bibliothek',obs:['books','boxes','wortblock'],npc:['aubergine','brokkoli','ananas','banane'],mus:{title:'Paragraph 1997',bpm:86,tr:-3,lead:'ep',cut:0.9,crackle:1.3,keys:'piano',drums:'boom',swing:0.4,minor:1,bassk:'walk',wob:12}},
  gesch:{name:'Altes Lazarett',obs:['oillamp','bed','books','skelett'],npc:['pflaume','traube','brokkoli','tomate'],mus:{title:'Lampe der Nacht',bpm:66,tr:-5,lead:'flute',cut:0.75,crackle:2.2,keys:'organ',drums:'brush',minor:1,amb:'rain',wob:14}},
  psych:{name:'Ruheraum',obs:['books','wet'],npc:['traube','kiwi','birne','heidelbeere','heidelbeere'],mus:{title:'Tief durchatmen',bpm:62,tr:-4,lead:'ep',cut:0.7,crackle:0.6,keys:'rhodes',drums:'soft',amb:'rain',wob:5}},
  paedsoz:{name:'Seminarraum',obs:['books','boxes','toy','wortblock'],npc:['brokkoli','erdbeere','orange'],mus:{title:'Pausenhof',bpm:82,tr:3,lead:'flute',cut:1.1,crackle:0.6,keys:'guitar',drums:'shuffle',amb:'birds'}},
  meine:{name:'Dienstzimmer',obs:['books','boxes','wortblock','pills'],npc:['orange','brokkoli','ananas'],mus:{title:'Eigene Notizen',bpm:78,tr:2,lead:'box',cut:1.0,crackle:1,keys:'piano',drums:'halftime',amb:'rain',swing:0.3}},
  fremd:{name:'Bibliothek der Begriffe',obs:['wortblock','skelett','torso','ekg','mikroskop','defi'],npc:['aubergine','karotte','ananas','brokkoli','tomate','paprika'],mus:{title:'Wortbausteine',bpm:80,tr:1,lead:'ep',cut:1,crackle:0.9,keys:'vibes',drums:'rim',bassk:'walk',swing:0.3}}};
function stOf(sel){ return STATION[sel]?sel:'alle'; }
function applyStation(sel){ const st=STATION[stOf(sel)]; LOFI.setStyle(st.mus); }
const NPC={
  aubergine:{n:'Dr. Aubergine',v:70,doc:1,say:['Kurze Frage zur Visite!','Moment, eine Frage an Sie!','Visite! Sind Sie bereit?']},
  karotte:{n:'Dr. Karotte',v:60,doc:1,say:['Ich hätte da eine Frage …','Schnell, bevor die OP beginnt!','Fünfzehn Sekunden – los geht’s!']},
  ananas:{n:'Dr. Ananas',v:66,doc:1,say:['Oberärztinnen-Visite!','Na, Fachbegriffe gelernt?','Richtig = ein Leben geschenkt!']},
  banane:{n:'Frau Banane',v:30,say:['Vorsicht, frisch gewischt!','Nicht ausrutschen!','Hier glänzt alles!']},
  tomate:{n:'Herr Tomate',v:12,say:['Mein Gips juckt so …','Die Krücke ist mein neuer Freund.','Unterschreibst du auf meinem Gips?']},
  heidelbeere:{n:'Frau Heidelbeere',v:18,say:['Heute ist ein schwerer Tag …','Mein Kissen tröstet mich.','Danke, dass du zuhörst.']},
  orange:{n:'Schwester Orange',v:54,say:['Ich mess schnell den Blutdruck!','Übergabe um halb!','Hast du die Pflegedoku?']},
  paprika:{n:'Herr Paprika',v:26,say:['Mein Blutzucker ist 98!','Insulin vor dem Essen.','Darf ich ein Stück Kuchen?']},
  brokkoli:{n:'Pfleger Brokkoli',v:50,say:['Übergabe in 10 Minuten!','Hände schon desinfiziert?','Ich hol schnell das RR-Gerät.']},
  birne:{n:'Frau Birne',v:14,say:['Mir ist ein bisschen schwindelig …','Die Infusion tropft so langsam.','Darf ich schon allein aufstehen?']},
  zitrone:{n:'Herr Zitrone',v:36,say:['Wann gibt es Mittagessen?','Ich fahr zur Physio!','Mein Zimmer ist die 312.']},
  pflaume:{n:'Frau Pflaume',v:10,say:['Drei Tage nach der Knie-OP!','Schritt für Schritt!','Morgen üb ich Stiegensteigen.']},
  traube:{n:'Herr Traube',v:8,say:['Ich zittere so … der Entzug ist hart.','Danke, dass ihr für mich da seid.','Ein warmer Tee hilft ein bisschen.']},
  kiwi:{n:'Frau Kiwi',v:24,say:['Tag 5 ohne Zigarette!','Das Nikotinpflaster hilft mir.','Ich schaff das – rauchfrei!']},
  erdbeere:{n:'die kleine Erdbeere',v:44,say:['Bekomm ich ein Pflaster?','Mein Teddy ist auch krank!','Pikst das?']}};
const NPCK=Object.keys(NPC);
function unlocked(){ return OBST.filter(o=>o.lv<=(G.level||1)); }
function pickObs(){ const so=(STATION[G.st]||STATION.alle).obs.filter(k=>!TALL[k]||(G.level||1)>=3||G.st==='fremd'); if(so.length&&Math.random()<0.4){ const k=so[Math.floor(Math.random()*so.length)]; return OBST.find(o=>o.k===k)||{k,h:OH[k]}; } const u=unlocked(); const fresh=u.filter(o=>o.lv===(G.level||1)&&o.lv>1); if(G.st==='fremd'&&Math.random()<0.5){ const hard=OBST.filter(o=>o.lv>=2); return hard[Math.floor(Math.random()*hard.length)]; } const pool=fresh.length&&Math.random()<0.45?fresh:u; return pool[Math.floor(Math.random()*pool.length)]; }
function spawnChaser(){ const sn=(STATION[G.st]||STATION.alle).npc.filter(k=>!NPC[k].doc&&NPC[k].v>=30); const k=Math.random()<0.5||!sn.length?'brokkoli':sn[Math.floor(Math.random()*sn.length)]; G.lastChase=G.t; OBJ.push({t:'chase',k,x:-70,lane:G.lane,lt:0,age:0}); pop(NPC[k].n+' kommt!','Er will dir eine Frage stellen','#C2185B'); sfx('lane'); }
function spawnDoc(){ const D=['aubergine','karotte','ananas'], k=D[Math.floor(Math.random()*3)], c=NPC[k]; OBJ.push({t:'npc',k,x:W+70,lane:Math.floor(Math.random()*4),v:c.v,say:c.say[Math.floor(Math.random()*c.say.length)],ph:Math.random()*6}); }
function spawnNpc(){ const sn=(STATION[G.st]||STATION.alle).npc; const sn2=sn.filter(k=>!NPC[k].doc), all=NPCK.filter(k=>!NPC[k].doc); const k=sn2.length&&Math.random()<0.6?sn2[Math.floor(Math.random()*sn2.length)]:all[Math.floor(Math.random()*all.length)], c=NPC[k]; OBJ.push({t:'npc',k,x:W+70,lane:Math.floor(Math.random()*4),v:c.v,say:c.say[Math.floor(Math.random()*c.say.length)],ph:Math.random()*6}); const o=OBJ[OBJ.length-1]; if(canMark()&&Math.random()<0.6){ o.task=true; o.say='Ich hab eine Aufgabe für dich – lauf in mich rein!'; } }

/* ---------- Spielzustand ---------- */
const G={state:'menu'};
let OBJ=[], PART=[], POP=[];
function newGame(mode,sel){
  mode=mode||MENU.mode; sel=sel||MENU.subj; $('#mapUi').hidden=true;
  G.mode=mode; G.sel=sel; G.st=stOf(sel); G.state='play'; applyStation(sel); prebake(G.st);
  G.speed0=MENU.tempo==='normal'?285:215; G.speed=G.speed0; G.t=0; G.dist=0; G.bgx=0; G.flx=0;
  G.lane=1; G.ly=FLOOR[1]; G.jump=0; G.vy=0; G.x=RUNX; G.jumps=0; G.jt=0; G.spin=0; G.sq=0; G.level=1; G.nudge=0; G.pose='run'; G.poseT=0; G.anim=0; G.inv=0;
  G.hearts=3; G.apples=0; G.nextLife=100; G.eatT=0; G.slow=1; G.score=0; G.streak=0; G.best=store.get('best-'+mode+'-'+sel,0);
  G.qList=mode==='lern'?gSpace(shuffle(gVariantFirst(gFresh(pool(sel))).slice(0,MENU.count||9999))):[]; GREC=[]; G.qi=0; G.qPhase='free'; G.freeLen=900; G.sinceQ=0; G.cur=null; G.right=0; G.wrong=[]; G.done=false;
  G.nextSpawn=320; G.tod=store.get('tod',0)*50;
  OBJ=[]; PART=[]; POP=[]; G.cel=null; G.crown=false; G.lastChase=null; G.visit=null; $('#visite').hidden=true; G.task=null; $('#task').hidden=true; G.taskN=Math.floor(Math.random()*3); G.lastTask=-10; G.taskCount=0; G.taskOk=0; G.visitN=0; G.visitOk=0;
  G.docTotal=3+Math.floor(Math.random()*6); G.docLeft=G.docTotal; { const est=Math.max(8000,G.qList.length*2800); G.docEvery=Math.min(7000,est/(G.docTotal+1)); G.nextDoc=G.docEvery*(0.5+Math.random()*0.4); }
  try{ document.activeElement&&document.activeElement.blur(); }catch(e){}
  setTimeout(()=>pop(STATION[G.st].name,'Musik: „'+STATION[G.st].mus.title+'“','#5A4BD1'),300);
  hideAll(); $('#hud').hidden=false; $('#ctrl').hidden=false; setQbar(null); hud(true);
  last=performance.now();
}
function laneFree(){ return [0,1,2,3]; }
function spawnPattern(){ const lv=G.level||1, fr=G.st==='fremd'; const kinds=['combo','wall','roll']; if(lv>=3||fr) kinds.push('tall','tall'); const k=kinds[Math.floor(Math.random()*kinds.length)]; const ln=Math.floor(Math.random()*4); const short=()=>{ let o; do{ o=pickObs(); }while(TALL[o.k]); return o.k; };
  if(k==='combo'){ OBJ.push({t:'obs',k:short(),x:W+60,lane:ln},{t:'obs',k:short(),x:W+60+110,lane:ln}); OBJ.push({t:'apple',x:W+115,lane:ln}); G.nextSpawn=G.dist+420; }
  else if(k==='wall'){ for(let i=0;i<4;i++){ if(i===ln) { for(let j=0;j<3;j++) OBJ.push({t:'apple',x:W+20+j*44,lane:i}); } else OBJ.push({t:'obs',k:short(),x:W+60,lane:i}); } G.nextSpawn=G.dist+400; if(!G.seenWall){ G.seenWall=1; pop('Engstelle!','Nur eine Bahn ist frei','#5A4BD1'); } }
  else if(k==='roll'){ const l2=(ln+1)%4; OBJ.push({t:'obs',k:'defi',x:W+60,lane:ln,v:70},{t:'obs',k:'ekg',x:W+150,lane:l2,v:60}); G.nextSpawn=G.dist+380; }
  else { OBJ.push({t:'obs',k:'skelett',x:W+60,lane:ln}); const l2=(ln+2)%4; OBJ.push({t:'obs',k:short(),x:W+60,lane:l2}); for(let j=0;j<3;j++) OBJ.push({t:'apple',x:W+150+j*44,lane:ln}); G.nextSpawn=G.dist+420; if(!G.seenTall){ G.seenTall=1; pop('Skelett voraus!','2× springen = Doppelsprung','#5A4BD1'); } }
}
function spawnFree(){
  const lv=G.level||1; const pPat=0.1+Math.min(0.3,0.06*(lv-1))+(G.st==='fremd'?0.2:0); if(Math.random()<pPat){ spawnPattern(); return; }
  const r=Math.random(); const dens=Math.max(0.5,0.9-0.06*(lv-1)); const pNpc=Math.min(0.42,0.28+0.04*(lv-1));
  const obsAt=(ln,x)=>{ const ob=pickObs(); OBJ.push({t:'obs',k:ob.k,x,lane:ln,v:(ob.roll&&lv>=3&&Math.random()<0.35)?70:0}); };
  if(r<0.24){ const ln=Math.floor(Math.random()*4), n=3+Math.floor(Math.random()*3); for(let i=0;i<n;i++) OBJ.push({t:'apple',x:W+40+i*46,lane:ln}); obsAt((ln+1+Math.floor(Math.random()*3))%4,W+80+Math.random()*80); G.nextSpawn=G.dist+(n*46+140+Math.random()*100)*dens; }
  else if(r<0.24+pNpc&&!OBJ.some(o=>o.t==='npc'&&o.x>W-180)){ spawnNpc(); if(Math.random()<0.45){ spawnNpc(); const a=OBJ[OBJ.length-2], b=OBJ[OBJ.length-1]; if(b.lane===a.lane) b.lane=(a.lane+2)%4; b.x+=90; if(a.task&&b.task){ b.task=false; b.say=NPC[b.k].say[0]; } }
    if(Math.random()<0.5){ const used=OBJ.slice(-2).map(o=>o.lane); const fl=[0,1,2,3].filter(l=>!used.includes(l)); obsAt(fl[Math.floor(Math.random()*fl.length)],W+140); }
    G.nextSpawn=G.dist+(220+Math.random()*100)*dens; }
  else if(r<0.9){ const ln=Math.floor(Math.random()*4); obsAt(ln,W+60); if(Math.random()<0.45) obsAt((ln+1+Math.floor(Math.random()*2))%4,W+60+110+Math.random()*60);
    const ln2=(ln+3)%4; OBJ.push({t:'apple',x:W+60,lane:ln2}); G.nextSpawn=G.dist+(220+Math.random()*130)*dens; }
  else if(G.mode==='lern' && G.hearts<3 && Math.random()<0.5){ OBJ.push({t:'heart',x:W+40,lane:Math.floor(Math.random()*4)}); G.nextSpawn=G.dist+200; }
  else { const a=Math.floor(Math.random()*4), b=(a+2)%4; obsAt(a,W+60); obsAt(b,W+60); G.nextSpawn=G.dist+(260+Math.random()*120)*dens; }
}
function startQuestion(){
  const q=G.qList[G.qi]; if(!q){ finish(); return; } gMark(q);
  const wr=shuffle(q.w.slice()).slice(0,3);
  let opts=shuffle([{t:q.r,ok:true}].concat(wr.map(t=>({t,ok:false}))));
  if(opts.length===3){ const bl=Math.floor(Math.random()*4); opts.splice(bl,0,{t:'',blocked:true}); }
  const len=q.q.length+opts.reduce((s,o)=>s+o.t.length,0);
  const gap=Math.max(1250,Math.min(2400,980+len*7.5))*(G.speed/215);
  const gate={t:'gate',x:W+80,q,n:G.qi+1}; const ans={t:'ans',x:W+80+gap,q,opts,n:G.qi+1};
  OBJ.push(gate,ans); G.qPhase='approach'; G.cur={q,opts,gate,ans};
  for(let i=0;i<4;i++) if(Math.random()<0.5) OBJ.push({t:'apple',x:W+80+gap*0.45+i*20,lane:i});
  // auch auf dem Weg zur Antwort: Figuren & Hindernisse (letzte 480 px vor den Antworten bleiben frei)
  const lv=G.level||1, sn=(STATION[G.st]||STATION.alle).npc.filter(k=>!NPC[k].doc), pool2=sn.length?sn:NPCK.filter(k=>!NPC[k].doc);
  for(let x=W+80+260; x<W+80+gap-480; x+=Math.max(170,270-lv*12)+Math.random()*90){
    if(Math.abs(x-(W+80+gap*0.45))<60) continue; const ln=Math.floor(Math.random()*4);
    if(Math.random()<0.4){ const k=pool2[Math.floor(Math.random()*pool2.length)], c=NPC[k]; OBJ.push({t:'npc',k,x,lane:ln,v:Math.min(c.v,30),say:c.say[Math.floor(Math.random()*c.say.length)],ph:Math.random()*6}); }
    else { let ob; do{ ob=pickObs(); }while(TALL[ob.k]&&lv<3&&G.st!=='fremd'); OBJ.push({t:'obs',k:ob.k,x,lane:ln,v:0}); if(lv>=2&&Math.random()<0.3){ let o2; do{ o2=pickObs(); }while(TALL[o2.k]); OBJ.push({t:'obs',k:o2.k,x:x+20,lane:(ln+2)%4,v:0}); } }
  }
}
function evaluate(a){
  const opts=a.opts; const ln=G.lane; const o=opts[ln];
  const ok=!!(o&&o.ok);
  const rightIdx=opts.findIndex(x=>x.ok);
  G.qi++; G.qPhase='feedback'; G.fbT=G.mode==='lern'?(ok?1.2:2.6):1.2; a.result={ln,ok,rightIdx};
  if(ok){ G.right++; G.streak++; const p=10+(G.streak>=3?5:0); G.score+=p; G.pose='cheer'; G.poseT=0.9; sfx('ok'); burst(G.x+30,G.ly-60,'#FFD54A',26); celebrate(G.streak);
    pop('Richtig!','+'+p+(G.streak>=3?' · Serie ×'+G.streak:''),'#1E9E70'); setQbar(a.q,{ok:true,right:opts[rightIdx]},opts,rightIdx);
  } else if(o&&o.blocked){ G.streak=0; G.crown=false; const jumped=G.jump>=30; G.wrong.push({q:a.q,your:'übersprungen (Bett „Belegt“)'});
    if(jumped){ pop('Übersprungen','Kein Leben weg · Richtig: '+'ABCD'[rightIdx],'#5A4BD1'); sfx('lane'); }
    else { G.apples=Math.max(0,G.apples-3); G.pose='dizzy'; G.poseT=0.7; sfx('bump'); pop('Autsch, belegt!','−3 Äpfel · Richtig: '+'ABCD'[rightIdx],'#7A5300'); }
    setQbar(a.q,{ok:false,right:opts[rightIdx],letter:'ABCD'[rightIdx]},opts,rightIdx);
  } else { G.streak=0; G.crown=false; G.hearts=Math.max(0,G.hearts-1); G.pose='dizzy'; G.poseT=1.1; sfx('bad'); G.wrong.push({q:a.q,your:o&&o.t?o.t:(o&&o.blocked?'Bett (Belegt)':'–')});
    pop('Hoppla!','Richtig: '+'ABCD'[rightIdx],'#C2185B'); setQbar(a.q,{ok:false,right:opts[rightIdx],letter:'ABCD'[rightIdx]},opts,rightIdx); }
  hud(true);
}
function celebrate(n){ const k=n===3?1:n===5?2:(n>=10&&n%5===0)?3:0; if(!k) return; G.cel={k,t:0,dur:[0,1.5,1.7,2.8][k]};
  if(k===1){ pop('Dreierserie!','Hüpf-Jubel!','#FF3D6E'); [784,988,1175].forEach((f,i)=>tone(f,0.14,'triangle',0.08,0.15+i*0.1)); }
  if(k===2){ pop('Fünferserie!','Salto mit Sternenkranz!','#5A4BD1'); [659,784,988,1319,1568].forEach((f,i)=>tone(f,0.16,'triangle',0.08,0.1+i*0.08)); }
  if(k===3){ G.crown=true; pop(n+'er-Serie!!','Crocs-Party mit Krone!','#E8A400'); [523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,0.18,'triangle',0.09,0.1+i*0.09)); } }
function celUpdate(dt){ const c=G.cel; if(!c) return; const p0=c.t; c.t+=dt;
  if(c.k===1){ [0,0.45,0.9].forEach(x=>{ if(p0<x&&c.t>=x) burst(G.x,G.ly-30,'#FF9EB5',10); }); }
  if(c.k===3){ for(let i=0;i<6;i++){ const x=i*0.4; if(p0<x&&c.t>=x) burst(120+Math.random()*600,60+Math.random()*120,['#FFD54A','#FF5A5F','#7FD3F5','#9EE6C4'][i%4],28); } }
  if(c.t>=c.dur) G.cel=null; }
function drawCrown(x,y,s){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); sticker(()=>{ ctx.beginPath(); ctx.moveTo(-18,8); ctx.lineTo(-20,-10); ctx.lineTo(-9,0); ctx.lineTo(0,-14); ctx.lineTo(9,0); ctx.lineTo(20,-10); ctx.lineTo(18,8); ctx.closePath(); },'#FFD54A',2.4);
  [[-20,-10],[0,-14],[20,-10]].forEach(([a,b])=>{ ctx.beginPath(); ctx.arc(a,b,3,0,Math.PI*2); ctx.fillStyle='#FF5A5F'; ctx.fill(); ctx.strokeStyle=DK; ctx.lineWidth=1.4; ctx.stroke(); }); ctx.restore(); }
function finish(){ G.done=true; G.state='result'; showResult(); }
function burst(x,y,c,n){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=80+Math.random()*180; PART.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:0.9+Math.random()*0.5,c:[c,'#FF9EB5','#7FD3F5','#FFFFFF'][i%4],s:3+Math.random()*4,star:i%3===0}); } }
function pop(a,b,c){ POP.push({a,b,c,t:0}); }

/* ---------- Eingabe ---------- */
function laneUp(){ if(G.state==='map'){ mapFloor(1); return; } if(G.state!=='play') return; if(G.lane>0){ G.lane--; G.pose=(G.pose==='dizzy'||G.pose==='eat')?G.pose:'switch'; G.poseT=Math.max(G.poseT,0.22); sfx('lane'); } }
function laneDown(){ if(G.state==='map'){ mapFloor(-1); return; } if(G.state!=='play') return; if(G.lane<3){ G.lane++; G.pose=(G.pose==='dizzy'||G.pose==='eat')?G.pose:'switch'; G.poseT=Math.max(G.poseT,0.22); sfx('lane'); } }
function jump(){ if(G.state==='map'){ mapEnter(); return; } if(G.state!=='play') return;
  if(G.jump<=0.5){ G.vy=Math.min(520,Math.sqrt(2*1250*Math.min(108,G.ly-80))); G.jump=0.01; G.jumps=1; G.jt=0; G.spin=0; G.sq=0.12; sfx('jump'); burst(G.x,G.ly-6,'#FFFFFF',8); }
  else if(G.jumps===1){ G.vy=Math.min(430,Math.sqrt(2*1250*Math.max(20,Math.min(150,G.ly-70)-G.jump))); G.jumps=2; G.spin=1; G.jt=0; sfx('jump'); tone(990,0.12,'triangle',0.06,0.04); burst(G.x,G.ly-G.jump-40,'#FFD54A',14); pop('Doppelsprung!','','#5A4BD1'); } }
const KEY={l:false,r:false};
function setMove(dir,on){ if(dir<0) KEY.l=on; else KEY.r=on; }
document.addEventListener('keyup',e=>{ if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') setMove(-1,false); if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') setMove(1,false); });
window.addEventListener('blur',()=>{ KEY.l=KEY.r=false; });
document.addEventListener('keydown',e=>{
  if(G.state==='map'){ if(M.card){ if(e.key==='Escape'){ e.preventDefault(); closeCard(); } return; }
    const k=e.key; if(k==='ArrowLeft'||k==='a'||k==='A'){ e.preventDefault(); setMove(-1,true); } else if(k==='ArrowRight'||k==='d'||k==='D'){ e.preventDefault(); setMove(1,true); }
    else if(k==='ArrowUp'||k==='w'||k==='W'){ e.preventDefault(); mapFloor(1); } else if(k==='ArrowDown'||k==='s'||k==='S'){ e.preventDefault(); mapFloor(-1); }
    else if(k===' '||k==='Enter'){ e.preventDefault(); if(!e.repeat) mapEnter(); } else if(k==='m'||k==='M'){ toggleMusic(); } else if(k==='t'||k==='T'){ toggleSfx(); } else if(k==='Escape'){ leaveMap(); showMenu(); }
    return; }
  if(G.state!=='play'&&G.state!=='pause') return;
  if(G.task&&G.state==='play'){ if(!G.task.res){ if(G.task.kind==='tf'&&(e.key==='1'||e.key==='2')){ e.preventDefault(); checkTask(false,e.key==='1'?1:0); return; } if(e.key==='Enter'&&G.task.kind!=='tf'){ const cb=$('#tBody .tcheck'); if(cb&&!cb.disabled){ e.preventDefault(); checkTask(false); } return; } } if(e.key!=='p'&&e.key!=='P'&&e.key!=='Escape'&&e.key!=='m'&&e.key!=='M'&&e.key!=='t'&&e.key!=='T') return; }
  if(G.visit&&G.state==='play'){ const m={'1':0,'2':1,'3':2,'4':3,'a':0,'b':1,'c':2,'d':3,'A':0,'B':1,'C':2,'D':3}; if(e.key in m){ e.preventDefault(); answerVisit(m[e.key]); return; } if(e.key!=='p'&&e.key!=='P'&&e.key!=='Escape'&&e.key!=='m'&&e.key!=='M'&&e.key!=='t'&&e.key!=='T'){ return; } }
  if(e.key==='t'||e.key==='T'){ e.preventDefault(); toggleSfx(); return; }
  if(G.state==='play'){
    if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){ e.preventDefault(); laneUp(); }
    else if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){ e.preventDefault(); laneDown(); }
    else if(e.key===' '){ e.preventDefault(); if(!e.repeat) jump(); }
    else if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){ e.preventDefault(); setMove(-1,true); }
    else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){ e.preventDefault(); setMove(1,true); }
    else if(e.key==='m'||e.key==='M'){ e.preventDefault(); toggleMusic(); }
    else if(e.key==='p'||e.key==='P'||e.key==='Escape'){ e.preventDefault(); pause(); }
  } else if(G.state==='pause'&&(e.key==='p'||e.key==='P'||e.key==='Escape')){ e.preventDefault(); resume(); }
});
let sw=null;
cv.addEventListener('pointerdown',e=>{ sw={x:e.clientX,y:e.clientY,t:performance.now()}; });
cv.addEventListener('pointerup',e=>{ if(G.state==='map'){ sw=null; mapPointer(e); return; } if(!sw) return; const dx=e.clientX-sw.x, dy=e.clientY-sw.y; const dist=Math.hypot(dx,dy);
  if(dist<18){ jump(); } else if(Math.abs(dy)>Math.abs(dx)){ dy<0?laneUp():laneDown(); } else { G.nudge+=dx>0?90:-90; } sw=null; });
cv.addEventListener('pointercancel',()=>{ sw=null; });
cv.addEventListener('touchmove',e=>{ if(G.state==='play') e.preventDefault(); },{passive:false});
$('#bUp').addEventListener('click',laneUp); $('#bDn').addEventListener('click',laneDown); $('#bJump').addEventListener('click',jump);
[['#bL',-1],['#bR',1]].forEach(([s,d])=>{ const b=$(s); b.addEventListener('pointerdown',e=>{ e.preventDefault(); setMove(d,true); }); ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>setMove(d,false))); });
function toggleMusic(){ musOn=!musOn; store.set('mus',musOn); audio(); if(AC){ musOn?LOFI.start(AC):LOFI.stop(); } syncMenu(); syncMusBtn(); }
function syncMusBtn(){ const s=$('#bSfx'); if(s){ s.setAttribute('aria-pressed',String(sfxOn)); s.setAttribute('aria-label',sfxOn?'Toneffekte ausschalten':'Toneffekte einschalten'); s.classList.toggle('off',!sfxOn); } ['#kSfx','#kMus'].forEach((id,i)=>{ const e=$(id); if(!e) return; const on=i?musOn:sfxOn; e.setAttribute('aria-pressed',String(on)); e.classList.toggle('off',!on); e.setAttribute('aria-label',(i?'Musik ':'Toneffekte ')+(on?'ausschalten':'einschalten')); });
  const b=$('#bMus'); if(!b) return; b.setAttribute('aria-pressed',String(musOn)); b.setAttribute('aria-label',musOn?'Musik ausschalten':'Musik einschalten'); b.classList.toggle('off',!musOn); }
$('#bMus').addEventListener('click',toggleMusic);
$('#bPause').addEventListener('click',()=>G.state==='play'?pause():resume());
function pause(){ if(G.state!=='play') return; G.state='pause'; $('#pauseOv').hidden=false; $('#ctrl').hidden=true; LOFI.duck(true); musInfo(); }
function resume(){ if(G.state!=='pause') return; G.state='play'; $('#pauseOv').hidden=true; $('#ctrl').hidden=false; LOFI.duck(false); last=performance.now(); try{ document.activeElement&&document.activeElement.blur(); }catch(e){} }
$('#pResume').addEventListener('click',resume);
$('#pMenu').addEventListener('click',()=>{ G.state='menu'; G.fromMap?showMap():showMenu(); });
function musInfo(){ const i=LOFI.info(); const txt=musOn&&LOFI.playing?('♫ „'+i.title+'“ · Teil '+i.pi+'/3 · '+i.time+' / '+i.total):'♫ „'+LOFI.title+'“ · '+(musOn?'startet mit dem Spiel':'Musik ist aus'); document.querySelectorAll('.musinfo').forEach(e=>e.textContent=txt); }
setInterval(()=>{ if(G.state!=='play') musInfo(); },1000);


/* ---------- Visite: Ärzt:innen fragen, 5 Sekunden ---------- */
const VLIM=15;
function startVisit(o){
  const P=pool(G.sel||MENU.subj); if(!P.length){ o.asked=true; return; }
  const q=gPick(P); gMark(q);
  const opts=shuffle([{t:q.r,ok:true}].concat(shuffle(q.w.slice()).slice(0,3).map(x=>({t:x,ok:false}))));
  o.v=0; G.visit={o,q,opts,t:VLIM,res:null,fb:0}; KEY.l=KEY.r=false;
  const c=NPC[o.k]; $('#vImg').src=IMG['c_'+o.k].src; $('#vImg').alt=c.n; $('#vName').textContent=c.n+' fragt:'; $('#vQ').textContent=q.q; { const vs=$('#vSrc'); if(vs){ vs.textContent=srcTxt(q); vs.hidden=!q.s; } }
  $('#vOpts').innerHTML=opts.map((x,i)=>'<button type="button" class="vopt" data-vi="'+i+'"><i style="background:'+COLS[i][0]+'">'+'ABCD'[i]+'</i><span>'+esc(x.t)+'</span></button>').join('');
  $('#vRule').textContent=G.mode==='lern'?VLIM+' Sekunden · richtig = +1 Leben · falsch = −1 Leben':VLIM+' Sekunden · richtig = +10 Äpfel · falsch = −5 Äpfel'; $('#vName').textContent=c.n+' fragt (Visite '+(G.visitN+1)+' / '+G.docTotal+'):'; $('#vFb').textContent=''; $('#vFb').className='vfb'; $('#visite').hidden=false; $('#ctrl').hidden=true;
  sfxOn&&AC&&[880,988].forEach((f,i)=>tone(f,0.12,'sine',0.07,i*0.12));
  setTimeout(()=>{ const b=document.querySelector('#vOpts .vopt'); if(b) try{ b.focus({preventScroll:true}); }catch(e){} },50);
}
function visitTick(dt){ const v=G.visit;
  if(!v.res){ const before=Math.ceil(v.t); v.t-=dt; const now=Math.max(0,Math.ceil(v.t)); $('#vBar').style.width=Math.max(0,v.t/VLIM*100)+'%'; $('#vSec').textContent=now; $('#vBar').style.background=v.t<4?'#FF5A5F':v.t<VLIM/2?'#FFC233':'#3FCB9B';
    if(now<before&&now>0&&sfxOn&&AC) tone(now<=3?660:520,0.06,'square',0.03); if(v.t<=0) answerVisit(-1); }
  else { v.fb-=dt; if(v.fb<=0) endVisit(); } }
function answerVisit(i){ const v=G.visit; if(!v||v.res) return; const ok=i>=0&&v.opts[i]&&v.opts[i].ok; G.visitN++; if(ok) G.visitOk++; G.docLeft=Math.max(0,G.docLeft-1); const ri=v.opts.findIndex(x=>x.ok); v.res={i,ok}; v.fb=ok?1.3:2.6;
  document.querySelectorAll('#vOpts .vopt').forEach((b,k)=>{ b.disabled=true; if(k===ri) b.classList.add('right'); else if(k===i) b.classList.add('wrong'); else b.classList.add('dim'); });
  const c=NPC[v.o.k];
  if(ok){ G.score+=15; G.right++; if(G.mode==='lern'){ G.hearts=Math.min(5,G.hearts+1); $('#vFb').textContent='Sehr gut! +1 Leben geschenkt, +15 Punkte'; pop('+1 Leben','Geschenk von '+c.n,'#FF3D6E'); } else { G.apples+=10; $('#vFb').textContent='Sehr gut! +10 Äpfel, +15 Punkte'; } $('#vFb').className='vfb ok'; sfx('ok'); burst(v.o.x,FLOOR[v.o.lane]-80,'#FFD54A',20); }
  else { const msg=i<0?'Zeit abgelaufen!':'Leider falsch.'; if(G.mode==='lern'){ G.hearts=Math.max(0,G.hearts-1); $('#vFb').textContent=msg+' −1 Leben · Richtig: '+'ABCD'[ri]; } else { G.apples=Math.max(0,G.apples-5); $('#vFb').textContent=msg+' −5 Äpfel · Richtig: '+'ABCD'[ri]; }
    $('#vFb').className='vfb bad'; sfx('bad'); G.wrong.push({q:v.q,your:(i<0?'keine Antwort (Zeit um)':v.opts[i].t)+' · Visite bei '+c.n}); }
  hud(true); }
function endVisit(){ const v=G.visit; G.visit=null; $('#visite').hidden=true; $('#ctrl').hidden=false; v.o.done=true; v.o.v=-20; last=performance.now();
  try{ document.activeElement&&document.activeElement.blur(); }catch(e){}
  if(G.mode==='lern'&&G.hearts<=0) finish(); }
$('#vOpts').addEventListener('click',e=>{ const b=e.target.closest('.vopt'); if(b&&G.visit) answerVisit(+b.dataset.vi); });
/* ---------- Figuren-Aufgaben: Wahr/Falsch · Zuordnen · Reihenfolge ---------- */
const ORDER=[
 {sid:'hyg',t:'Schutzkleidung anlegen – in welcher Reihenfolge?',s:['Schutzkittel','Mund-Nasen-Schutz','Schutzbrille','Handschuhe']},
 {sid:'hyg',t:'Hygienische Händedesinfektion – Ablauf',s:['Desinfektionsmittel in die hohle Hand geben','Handflächen und Handrücken einreiben','Fingerzwischenräume, Daumen und Fingerkuppen einreiben','Einwirkzeit abwarten, bis die Hände trocken sind']},
 {sid:'pgk',t:'Pflegeprozess nach Fiechter & Meier',s:['Informationssammlung','Probleme & Ressourcen erkennen','Pflegeziele festlegen','Maßnahmen planen','Durchführung','Beurteilung (Evaluation)']},
 {sid:'pgk',t:'Blutdruck messen nach Riva-Rocci',s:['Manschette am Oberarm anlegen','Aufpumpen, bis kein Puls mehr tastbar ist (+30 mmHg)','Luft langsam ablassen (2–3 mmHg/s)','Erster Ton = systolisch, Verschwinden = diastolisch']},
 {sid:'kl1',t:'Phasen der Wundheilung',s:['Exsudationsphase','Granulationsphase','Epithelisierungsphase']},
 {sid:'kl1',t:'Weg des Blutes durchs Herz',s:['Rechter Vorhof','Rechte Kammer','Lungenarterie','Linker Vorhof','Linke Kammer','Aorta']},
 {sid:'pharma',t:'Pharmakokinetik (LADME)',s:['Liberation (Freisetzung)','Absorption (Aufnahme)','Distribution (Verteilung)','Metabolismus (Abbau)','Elimination (Ausscheidung)']},
 {sid:'paed',t:'Motorische Entwicklung im 1. Lebensjahr',s:['Kopf halten','Frei sitzen','Krabbeln','Frei gehen']},
 {sid:'paed',t:'Lebensabschnitte – vom jüngsten zum ältesten',s:['Neugeborenes','Säugling','Kleinkind','Schulkind','Jugendliche/r']},
 {sid:'recht',t:'Österreichisches Pflegerecht – zeitliche Reihenfolge',s:['Krankenpflegegesetz (1961)','GuKG (1997)','GuKG-Novelle (2016)']},
 {sid:'gesch',t:'Pflegegeschichte – zeitliche Reihenfolge',s:['Nightingale im Krimkrieg (1854)','Nightingale-Pflegeschule in London (1860)','Gründung des Roten Kreuzes (1863)','Rudolfinerhaus in Wien (1882)']},
 {sid:'psych',t:'Bedürfnispyramide nach Maslow – von unten nach oben',s:['Physiologische Bedürfnisse','Sicherheit','Soziale Bedürfnisse','Wertschätzung','Selbstverwirklichung']},
 {sid:'psych',t:'Sterbephasen nach Kübler-Ross',s:['Nicht-wahrhaben-Wollen','Zorn','Verhandeln','Depression','Zustimmung']},
 {sid:'paedsoz',t:'Entwicklungsstufen nach Erikson (die ersten vier)',s:['Urvertrauen vs. Urmisstrauen','Autonomie vs. Scham & Zweifel','Initiative vs. Schuldgefühl','Werksinn vs. Minderwertigkeit']},
 {sid:'paedsoz',t:'Kognitive Entwicklung nach Piaget',s:['Sensomotorische Stufe','Präoperationale Stufe','Konkret-operationale Stufe','Formal-operationale Stufe']},
 {sid:'fremd',t:'Vom Kleinen zum Großen',s:['Zelle','Gewebe','Organ','Organsystem','Organismus']},
 {sid:'fremd',t:'Weg durch den Verdauungstrakt',s:['Ösophagus','Gaster','Duodenum','Jejunum','Ileum','Colon']}];
const TLIM={tf:10,match:25,order:20};
function canMark(){ return G.mode==='lern'&&G.qPhase==='free'&&!G.task&&!G.visit&&G.t-(G.lastTask==null?-99:G.lastTask)>18&&!OBJ.some(x=>x.task&&!x.done); }
function taskData(kind){ const P=pool(G.sel||MENU.subj);
  if(kind==='order'){ let L=ORDER.filter(o=>o.sid===G.sel); if(!L.length) L=ORDER; const o=L[Math.floor(Math.random()*L.length)]; let s=o.s;
    if(s.length>4){ const keep=new Set(shuffle([...s.keys()]).slice(0,4)); s=s.filter((_,i)=>keep.has(i)); }
    let sh=shuffle(s.slice()); while(sh.join('|')===s.join('|')) sh=shuffle(s.slice()); return {title:o.t,sol:s,items:sh}; }
  if(kind==='match'){ const C=gFresh(P.filter(q=>q.q.length<=110&&q.r.length<=55)); const pick=[], seen=new Set(); for(const q of C){ if(seen.has(q.r)) continue; seen.add(q.r); pick.push(q); if(pick.length===3) break; }
    if(pick.length<3) return null; pick.forEach(gMark); return {pairs:pick, chips:shuffle(pick.map((q,i)=>i))}; }
  if(!P.length) return null; const q=gPick(P); gMark(q); const truth=Math.random()<0.5||!q.w.length; return {q,show:truth?q.r:q.w[Math.floor(Math.random()*q.w.length)],truth}; }
function startTask(o){ const kinds=['tf','match','order']; let kind=kinds[(G.taskN||0)%3], data=taskData(kind); if(!data){ kind='order'; data=taskData('order'); }
  G.taskN=(G.taskN||0)+1; G.lastTask=G.t; G.taskCount=(G.taskCount||0)+1; KEY.l=KEY.r=false;
  G.task={o,kind,data,t:TLIM[kind],lim:TLIM[kind],res:null,fb:0,sel:null};
  const c=NPC[o.k]; $('#tImg').src=IMG['c_'+o.k].src; $('#tImg').alt=c.n; $('#tName').textContent=c.n+' hat eine Aufgabe:';
  $('#tRule').textContent=TLIM[kind]+' Sekunden · richtig = +10 Äpfel & +10 Punkte · falsch kostet nichts';
  const B=$('#tBody'); let h='';
  if(kind==='tf'){ h='<div class="tk">Wahr oder falsch?</div><div class="tq">'+esc(data.q.q)+'</div>'+(data.q.s?'<div class="tsrc">'+esc(srcTxt(data.q))+'</div>':'')+'<div class="tst">Antwort: <b>'+esc(data.show)+'</b></div><div class="tfb"><button type="button" class="vopt tbtn" data-tf="1"><i style="background:#3FCB9B">1</i><span>Wahr</span></button><button type="button" class="vopt tbtn" data-tf="0"><i style="background:#FF5A5F">2</i><span>Falsch</span></button></div>'; }
  else if(kind==='match'){ h='<div class="tk">Zuordnen: zieh jede Antwort zur passenden Frage</div><div class="tm">'+data.pairs.map((q,i)=>'<div class="trow"><span class="tmq">'+esc(q.q)+'</span><span class="tzone" data-z="'+i+'"></span></div>').join('')+'</div><div class="tpool" data-z="pool">'+data.chips.map(i=>'<span class="tchip" data-c="'+i+'">'+esc(data.pairs[i].r)+'</span>').join('')+'</div><button type="button" class="btn tcheck" disabled>Prüfen</button>'; }
  else { h='<div class="tk">Reihenfolge: '+esc(data.title)+'</div><div class="tsub">Ziehen zum Sortieren (oder zwei antippen = tauschen) · oben = zuerst</div><ol class="tord">'+data.items.map(t=>'<li class="titem" data-t="'+esc(t)+'"><i></i><span>'+esc(t)+'</span></li>').join('')+'</ol><button type="button" class="btn tcheck">Prüfen</button>'; }
  B.innerHTML=h; $('#tFb').textContent=''; $('#tFb').className='vfb'; $('#task').hidden=false; $('#ctrl').hidden=true; numberOrder();
  sfxOn&&AC&&[660,880,1100].forEach((f,i)=>tone(f,0.1,'triangle',0.06,i*0.08));
}
function numberOrder(){ document.querySelectorAll('#tBody .titem i').forEach((e,i)=>e.textContent=i+1); }
function taskTick(dt){ const k=G.task; if(!k.res){ const before=Math.ceil(k.t); k.t-=dt; const now=Math.max(0,Math.ceil(k.t)); $('#tBar').style.width=Math.max(0,k.t/k.lim*100)+'%'; $('#tSec').textContent=now; $('#tBar').style.background=k.t<3?'#FF5A5F':k.t<k.lim*0.5?'#FFC233':'#3FCB9B';
    if(now<before&&now>0&&now<=3&&sfxOn&&AC) tone(660,0.06,'square',0.03); if(k.t<=0) checkTask(true); }
  else { k.fb-=dt; if(k.fb<=0) endTask(); } }
function checkTask(timeout,tfAns){ const k=G.task; if(!k||k.res) return; let ok=false; const B=$('#tBody'); let sol='';
  if(k.kind==='tf'){ ok=!timeout&&tfAns===(k.data.truth?1:0); B.querySelectorAll('[data-tf]').forEach(b=>{ b.disabled=true; const v=+b.dataset.tf; if(v===(k.data.truth?1:0)) b.classList.add('right'); else if(v===tfAns) b.classList.add('wrong'); else b.classList.add('dim'); }); if(!k.data.truth) sol='Richtig wäre: '+k.data.q.r; }
  else if(k.kind==='match'){ ok=true; B.querySelectorAll('.tzone').forEach(z=>{ const c=z.querySelector('.tchip'); const good=c&&+c.dataset.c===+z.dataset.z; if(!good){ ok=false; z.classList.add('bad'); z.setAttribute('data-sol',k.data.pairs[+z.dataset.z].r); } else z.classList.add('good'); }); }
  else { const cur=[...B.querySelectorAll('.titem')].map(e=>e.dataset.t); ok=cur.join('|')===k.data.sol.join('|'); B.querySelectorAll('.titem').forEach((e,i)=>e.classList.add(e.dataset.t===k.data.sol[i]?'good':'bad')); if(!ok) sol='Richtig: '+k.data.sol.map((t,i)=>(i+1)+'. '+t).join(' · '); }
  B.querySelectorAll('.tchip,.titem').forEach(e=>e.classList.add('lock')); const cb=B.querySelector('.tcheck'); if(cb) cb.disabled=true;
  k.res={ok}; k.fb=ok?1.5:(k.kind==='tf'?2.6:4.2);
  if(ok){ G.apples+=10; G.score+=10; G.taskOk=(G.taskOk||0)+1; $('#tFb').textContent='Super! +10 Äpfel, +10 Punkte'; $('#tFb').className='vfb ok'; sfx('ok'); burst(G.x+60,G.ly-60,'#FFD54A',18); }
  else { $('#tFb').textContent=(timeout?'Zeit abgelaufen. ':'Nicht ganz. ')+sol; $('#tFb').className='vfb bad'; sfx('bad'); }
  hud(); }
function endTask(){ G.task=null; $('#task').hidden=true; $('#ctrl').hidden=false; last=performance.now(); try{ document.activeElement&&document.activeElement.blur(); }catch(e){} }
// Ziehen & Ablegen (Maus und Finger) + Antippen als Alternative
let TD=null;
$('#tBody').addEventListener('pointerdown',e=>{ const el=e.target.closest('.tchip,.titem'); if(!el||el.classList.contains('lock')||!G.task||G.task.res) return; e.preventDefault(); TD={el,x:e.clientX,y:e.clientY,moved:false,id:e.pointerId}; try{ el.setPointerCapture(e.pointerId); }catch(_){} });
$('#tBody').addEventListener('pointermove',e=>{ if(!TD||e.pointerId!==TD.id) return; const dx=e.clientX-TD.x, dy=e.clientY-TD.y; if(!TD.moved&&Math.hypot(dx,dy)<6) return; TD.moved=true; const el=TD.el; el.classList.add('drag'); el.style.transform='translate('+dx/SC+'px,'+dy/SC+'px)';
  if(el.classList.contains('titem')){ el.style.pointerEvents='none'; const under=document.elementFromPoint(e.clientX,e.clientY); el.style.pointerEvents=''; const tgt=under&&under.closest('.titem'); if(tgt&&tgt!==el){ const list=el.parentNode, items=[...list.children]; const a=items.indexOf(el), b=items.indexOf(tgt); const r0=el.getBoundingClientRect(); if(a<b) list.insertBefore(el,tgt.nextSibling); else list.insertBefore(el,tgt); const r1=el.getBoundingClientRect(); TD.y+=(r1.top-r0.top); el.style.transform='translate('+dx/SC+'px,'+(e.clientY-TD.y)/SC+'px)'; numberOrder(); } } });
function endDrag(e){ if(!TD||e.pointerId!==TD.id) return; const el=TD.el, moved=TD.moved; TD=null; el.classList.remove('drag'); el.style.transform='';
  if(!moved){ tapTask(el); return; }
  if(el.classList.contains('tchip')){ el.style.pointerEvents='none'; const under=document.elementFromPoint(e.clientX,e.clientY); el.style.pointerEvents=''; const z=under&&under.closest('.tzone,.tpool'); if(z) dropChip(el,z); } }
$('#tBody').addEventListener('pointerup',endDrag); $('#tBody').addEventListener('pointercancel',e=>{ if(TD&&TD.el){ TD.el.classList.remove('drag'); TD.el.style.transform=''; } TD=null; });
function dropChip(chip,z){ if(z.classList.contains('tzone')){ const old=z.querySelector('.tchip'); if(old&&old!==chip){ const from=chip.parentNode; from.appendChild(old); } z.appendChild(chip); } else z.appendChild(chip); sfx('lane');
  document.querySelectorAll('#tBody .tchip').forEach(c=>c.classList.remove('sel')); const cb=$('#tBody .tcheck'); if(cb) cb.disabled=[...document.querySelectorAll('#tBody .tzone')].some(z=>!z.querySelector('.tchip')); }
function tapTask(el){ const k=G.task; if(!k||k.res) return; const prev=k.sel;
  if(el.classList.contains('titem')){ if(prev&&prev!==el&&prev.isConnected){ const list=el.parentNode, a=document.createElement('li'); list.insertBefore(a,el); list.insertBefore(el,prev); list.insertBefore(prev,a); a.remove(); prev.classList.remove('sel'); k.sel=null; numberOrder(); sfx('lane'); } else { document.querySelectorAll('#tBody .titem').forEach(x=>x.classList.remove('sel')); if(prev===el){ k.sel=null; } else { el.classList.add('sel'); k.sel=el; } } return; }
  document.querySelectorAll('#tBody .tchip').forEach(x=>x.classList.remove('sel')); if(prev===el){ k.sel=null; return; } el.classList.add('sel'); k.sel=el; }
$('#tBody').addEventListener('click',e=>{ const k=G.task; if(!k||k.res) return; const tf=e.target.closest('[data-tf]'); if(tf){ checkTask(false,+tf.dataset.tf); return; }
  if(e.target.closest('.tcheck')){ checkTask(false); return; }
  const z=e.target.closest('.tzone,.tpool'); if(z&&k.sel&&k.sel.classList.contains('tchip')&&!e.target.closest('.tchip')){ dropChip(k.sel,z); k.sel=null; } });

function toggleSfx(){ sfxOn=!sfxOn; store.set('sfx',sfxOn); syncMenu(); syncMusBtn(); }
$('#bSfx').addEventListener('click',toggleSfx);

/* ---------- Update ---------- */
let last=performance.now();
function update(dt){
  if(G.task){ taskTick(dt); PART.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=420*dt; p.life-=dt; }); PART=PART.filter(p=>p.life>0); POP.forEach(p=>p.t+=dt); POP=POP.filter(p=>p.t<1.3); return; }
  if(G.visit){ visitTick(dt); PART.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=420*dt; p.life-=dt; }); PART=PART.filter(p=>p.life>0); POP.forEach(p=>p.t+=dt); POP=POP.filter(p=>p.t<1.3); return; }
  G.t+=dt; G.tod+=dt; celUpdate(dt);
  G.speed=G.speed0*Math.min(1.9,1+0.11*((G.level||1)-1)+0.0025*(G.t%40));
  let tgt=1; if(G.eatT>0) tgt=0.75;
  G.slow=(G.slow||1)+(tgt-(G.slow||1))*Math.min(1,dt*2.5);
  const dx=G.speed*G.slow*dt; G.dist+=dx; G.bgx=(G.bgx+dx*0.35)%880; G.flx=(G.flx+dx)%864;
  // Läufer
  const ty=FLOOR[G.lane]; G.ly+= (ty-G.ly)*Math.min(1,dt*14);
  let mv=(KEY.r?1:0)-(KEY.l?1:0); if(G.nudge){ const st=Math.sign(G.nudge)*Math.min(Math.abs(G.nudge),dt*420); G.x+=st; G.nudge-=st; }
  G.x=Math.max(80,Math.min(470,G.x+mv*260*dt));
  if(G.jump>0){ G.jt+=dt; G.vy-=1250*dt; G.jump+=G.vy*dt; if(Math.random()<dt*30) PART.push({x:G.x-14+Math.random()*10,y:G.ly-G.jump-30-Math.random()*30,vx:-120-Math.random()*80,vy:-10,life:0.45,c:['#FFD54A','#FF9EB5','#7FD3F5'][Math.floor(Math.random()*3)],s:3+Math.random()*2,star:true});
    if(G.jump<=0){ G.jump=0; G.vy=0; G.jumps=0; G.sq=0.14; for(let k=0;k<10;k++){ const a=Math.PI+(k/9)*Math.PI; PART.push({x:G.x+Math.cos(a)*14,y:G.ly-2,vx:Math.cos(a)*120,vy:-30-Math.random()*40,life:0.45,c:'#FFFFFF',s:4+Math.random()*3}); } sfx('bump'); } }
  if(G.sq>0) G.sq-=dt;
  const lv=1+Math.floor(G.t/40); if(lv!==G.level){ G.level=lv; const nw=OBST.filter(o=>o.lv===lv).map(o=>o.n); pop('Level '+lv,nw.length?'Neu: '+nw.join(' & '):'Tempo steigt','#5A4BD1'); if(sfxOn&&AC){ [523,659,784,1047].forEach((f,i)=>tone(f,0.14,'square',0.035,i*0.06)); } hud(true); }
  G.anim+=dt*G.speed/26; if(G.poseT>0){ G.poseT-=dt; if(G.poseT<=0) G.pose=G.eatT>0?'eat':'run'; }
  if(G.inv>0) G.inv-=dt;
  if(G.eatT>0){ G.eatT-=dt; if(G.pose!=='eat'&&G.pose!=='dizzy'){ G.pose='eat'; G.poseT=G.eatT; }
    if(Math.random()<dt*10) PART.push({x:G.x+(Math.random()*16-8),y:G.ly-G.jump-70,vx:(Math.random()*2-1)*60,vy:-40-Math.random()*60,life:0.6,c:Math.random()<0.5?'#FFF3D6':'#FF5A5F',s:2+Math.random()*2});
    if(Math.floor(G.eatT*3.3)!==G._crunch){ G._crunch=Math.floor(G.eatT*3.3); if(sfxOn&&AC){ tone(220+Math.random()*60,0.05,'square',0.03); } }
    if(G.eatT<=0.35&&!G.eatGiven){ G.eatGiven=true; if(G.mode==='lern'){ G.hearts=Math.min(5,G.hearts+1); pop('+1 Leben','Lecker, frisch gestärkt!','#FF3D6E'); } else pop('Lecker!','100 Äpfel gefuttert','#FF3D6E'); sfx('heart'); burst(G.x,G.ly-90,'#FF7A9A',18); hud(true); } }
  // Objekte
  OBJ.forEach(o=>{ o.x-=dx+(o.v||0)*dt; });
  OBJ.forEach(o=>{ if(o.t!=='chase'||o.done) return; o.age+=dt; if(o.gone){ o.x-=160*dt; return; } o.x+=dx+95*dt; if(G.qPhase==='approach'||G.qPhase==='asked') o.x=Math.min(o.x,G.x-90);
    if(o.lane!==G.lane){ o.lt+=dt; if(o.lt>0.45){ o.lane+=Math.sign(G.lane-o.lane); o.lt=0; } } else o.lt=0;
    if(o.age>16){ o.gone=true; pop('Entkommen!',NPC[o.k].n+' gibt auf','#5A4BD1'); } });
  for(const o of OBJ){
    if(o.done) continue;
    if(o.t==='apple'&&o.lane===G.lane&&Math.abs(o.x-G.x)<26&&G.jump<46){ o.done=true; G.apples++; G.score+=1; sfx('apple'); burst(o.x,FLOOR[o.lane]-30,'#FF5A5F',6); if(G.apples>=G.nextLife){ G.nextLife+=100; G.eatT=2.0; G.eatGiven=false; G.pose='eat'; G.poseT=2.0; pop('100 Äpfel!','Zeit für einen Snack','#C2185B'); } hud(); }
    else if(o.t==='heart'&&o.lane===G.lane&&Math.abs(o.x-G.x)<26){ o.done=true; G.hearts=Math.min(3,G.hearts+1); sfx('heart'); burst(o.x,FLOOR[o.lane]-30,'#FF7A9A',10); hud(true); }
    else if(o.t==='npc'&&NPC[o.k].doc&&!o.asked&&o.x>G.x&&o.x-G.x<240&&G.qPhase!=='approach'&&G.qPhase!=='asked'){ o.asked=true; startVisit(o); break; }
    else if(o.t==='chase'&&!o.gone&&o.lane===G.lane&&o.x>=G.x-40&&G.jump<70){ o.done=true; startTask(o); break; }
    else if(o.t==='npc'&&o.task&&o.lane===G.lane&&Math.abs(o.x-G.x)<34&&G.jump<70){ o.done=true; o.bumped=true; startTask(o); break; }
    else if(o.t==='npc'&&!(NPC[o.k].doc&&o.asked)&&o.lane===G.lane&&Math.abs(o.x-G.x)<32&&G.jump<70&&G.inv<=0){ o.done=true; o.bumped=true; G.inv=1; G.apples=Math.max(0,G.apples-2); G.pose='dizzy'; G.poseT=0.6; sfx('bump'); pop('Hoppla!','Entschuldigung, '+NPC[o.k].n+'!','#7A5300'); hud(); }
    else if(o.t==='obs'&&o.lane===G.lane&&Math.abs(o.x-G.x)<30&&G.jump<(OH[o.k]||38)&&G.inv<=0){ o.done=true; G.inv=1; G.apples=Math.max(0,G.apples-3); G.pose='dizzy'; G.poseT=0.7; G.streakObs=0; sfx('bump'); pop('Autsch!','−3 Äpfel','#7A5300'); hud(); }
    else if(o.t==='gate'&&o.x<G.x&&!o.passed){ o.passed=true; G.qPhase='asked'; setQbar(o.q,null,G.cur&&G.cur.opts); }
    else if(o.t==='ans'&&o.x<=G.x+4&&!o.result){ evaluate(o); }
  }
  OBJ=OBJ.filter(o=>o.x>-300&&!(o.done&&(o.t==='apple'||o.t==='heart')));
  // Spawns
  if(G.mode==='lern'){
    if(G.qPhase==='free'&&G.sinceQ<G.freeLen-900&&canMark()&&!OBJ.some(o=>o.t==='chase'&&!o.done)&&G.t-(G.lastChase==null?-99:G.lastChase)>28&&Math.random()<dt*0.08){ spawnChaser(); }
    if(G.qPhase==='free'&&G.docLeft>0&&G.dist>=G.nextDoc&&G.sinceQ<G.freeLen-700&&!OBJ.some(o=>o.t==='npc'&&NPC[o.k].doc&&!o.asked)){ spawnDoc(); G.nextDoc=G.dist+G.docEvery*(0.75+Math.random()*0.5); }
    if(G.qPhase==='free'){ G.sinceQ+=dx; if(G.sinceQ>G.freeLen){ G.sinceQ=0; startQuestion(); } else if(G.dist>=G.nextSpawn&&G.sinceQ<G.freeLen-500) spawnFree(); }
    else if(G.qPhase==='feedback'){ G.fbT-=dt; if(G.fbT<=0){ setQbar(null); if(G.hearts<=0||G.qi>=G.qList.length){ finish(); return; } G.qPhase='free'; G.freeLen=900+Math.random()*400; G.nextSpawn=G.dist+120; } }
  } else if(G.dist>=G.nextSpawn) spawnFree();
  // Partikel & Pop-ups
  PART.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=420*dt; p.life-=dt; }); PART=PART.filter(p=>p.life>0);
  POP.forEach(p=>p.t+=dt); POP=POP.filter(p=>p.t<1.3);
  music(dt);
  if(Math.floor(G.t*4)!==G._ht){ G._ht=Math.floor(G.t*4); hud(); }
}

/* ---------- Zeichnen ---------- */
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function sticker(drawPath,fill,lw){ ctx.save(); ctx.lineJoin='round'; drawPath(); ctx.shadowColor='rgba(43,42,51,0.28)'; ctx.shadowOffsetY=3; ctx.shadowBlur=0; ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=(lw||3)+8; ctx.stroke(); ctx.restore(); ctx.save(); drawPath(); ctx.fillStyle=fill; ctx.fill(); ctx.lineWidth=lw||3; ctx.strokeStyle=DK; ctx.lineJoin='round'; ctx.stroke(); ctx.restore(); }
function wrapText(t,maxW,font){ ctx.font=font; const words=t.split(' '); const lines=[]; let cur=''; words.forEach(w=>{ const test=cur?cur+' '+w:w; if(ctx.measureText(test).width>maxW&&cur){ lines.push(cur); cur=w; } else cur=test; }); if(cur) lines.push(cur); return lines; }
function todBlend(){ const seg=50, fade=8; const p=(((G.tod||0)%(seg*3))+seg*3)%(seg*3); const i=Math.floor(p/seg), f=p-i*seg; const a=f>seg-fade?(f-(seg-fade))/fade:0; return {i,j:(i+1)%3,a}; }
function drawBG(){
  const b=todBlend();
  const st=G.state==='menu'?stOf(MENU.subj):(G.st||'alle');
  for(const [k,alpha] of [[b.i,1],[b.j,b.a]]){ if(alpha<=0) continue; const n=THEMES[k][0];
    for(let x=-G.bgx;x<W;x+=880) spr('bg_'+st+'_'+n,x,0,alpha); }
  for(let x=-G.flx;x<W;x+=864) spr('fl_'+st,x,188,1);
}
function drawGate(o){
  const x=o.x; const ga=Math.max(0,Math.min(1,(x-20)/(Math.max(60,G.x)-20))); if(ga<=0) return; ctx.save(); ctx.globalAlpha=ga;
  // Pfosten
  sticker(()=>{ rr(x-8,188,16,202,8); },'#7FD3F5',3);
  // Fäden
  ctx.strokeStyle=DK; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(x-120,0); ctx.lineTo(x-120,64); ctx.moveTo(x+120,0); ctx.lineTo(x+120,64); ctx.stroke();
  const p=new Path2D('M-158 72 q-10 -22 12 -26 q8 -20 30 -12 q60 -14 120 -4 q50 -10 112 2 q22 -6 30 12 q20 6 10 28 v54 q8 22 -14 26 q-60 12 -146 8 q-90 6 -146 -8 q-20 -6 -12 -26z');
  ctx.save(); ctx.translate(x,0); ctx.lineJoin='round';
  ctx.shadowColor='rgba(43,42,51,0.28)'; ctx.shadowOffsetY=3; ctx.shadowBlur=0; ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=11; ctx.stroke(p); ctx.shadowColor='transparent';
  ctx.fillStyle='#FFFFFF'; ctx.fill(p); ctx.lineWidth=3.5; ctx.strokeStyle=DK; ctx.stroke(p); ctx.restore();
  sticker(()=>{ rr(x-92,40,184,26,13); },'#FF7A9A',3);
  ctx.fillStyle='#FFFFFF'; ctx.font='800 13px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('Frage '+o.n+' / '+G.qList.length+' · lauf durch!',x,54);
  let fs, lines; if(o._l){ fs=o._fs; lines=o._l; } else { fs=22; do { lines=wrapText(o.q.q,286,'800 '+fs+'px Gluten, Fredoka, system-ui, sans-serif'); fs--; } while((lines.length>3||lines.length*fs*1.08>74)&&fs>11);
  fs++; o._l=lines; o._fs=fs; } ctx.fillStyle=DK; ctx.font='800 '+fs+'px Gluten, Fredoka, system-ui, sans-serif';
  const lh=fs*1.08, y0=110-(lines.length-1)*lh/2; lines.forEach((l,i)=>ctx.fillText(l,x,y0+i*lh));
  ctx.restore();
}
function drawLaneLetters(){ const c=G.cur; if(!c||!c.ans||c.ans.result||G.qPhase==='feedback') return; const g=c.gate, a=c.ans;
  const x0=Math.max(-40,(g&&!g.done?g.x:-40)+90), x1=Math.min(W+40,a.x-40);
  // Buchstaben als Bodenmarkierung zwischen Frage-Tor und Antworten
  for(let ln=0;ln<4;ln++){ const op=c.opts[ln], y=(LANES[ln][0]+LANES[ln][1])/2+2; const blocked=op&&op.blocked;
    for(const x of [a.x-160,a.x-400]){ if(x<x0||x>W+40) continue; ctx.save(); ctx.globalAlpha=0.55; ctx.fillStyle=blocked?'#B9B3C2':COLS[ln][0]; ctx.beginPath(); ctx.ellipse(x,y,20,13,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=0.9; ctx.fillStyle='#FFFFFF'; ctx.font='800 16px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(blocked?'×':'ABCD'[ln],x,y+1); ctx.restore(); } }
  // feste Bahn-Schilder am rechten Rand
  for(let ln=0;ln<4;ln++){ const op=c.opts[ln], y=(LANES[ln][0]+LANES[ln][1])/2, blocked=op&&op.blocked, on=G.lane===ln, r=on?15:12;
    sticker(()=>{ ctx.beginPath(); ctx.arc(W-22,y,r,0,Math.PI*2); },blocked?'#E6E2EC':COLS[ln][0],2.4);
    ctx.fillStyle=blocked?'#8A8494':'#FFFFFF'; ctx.font='800 '+(on?17:14)+'px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(blocked?'×':'ABCD'[ln],W-22,y+1); }
  ctx.textAlign='left'; }
function drawAnswers(o){
  const t=G.t;
  o.opts.forEach((op,i)=>{
    const fy=FLOOR[i];
    if(op.blocked){ spr('bed',o.x+60,fy); sticker(()=>{ rr(o.x+28,fy-96,64,22,11); },'#FFFFFF',2.6); ctx.fillStyle=DK; ctx.font='800 12px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Belegt',o.x+60,fy-85); return; }
    const res=o.result; let alpha=1; if(res&&i!==res.rightIdx) alpha=0.35;
    const bob=Math.sin(t*3+i)*3; const w=214, h=40, x=o.x, y=fy-52+bob;
    ctx.globalAlpha=0.14*alpha; ctx.fillStyle=DK; ctx.beginPath(); ctx.ellipse(x+w/2,fy,60,7,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=alpha;
    sticker(()=>{ rr(x,y,w,h,20); },COLS[i][1],3);
    sticker(()=>{ ctx.beginPath(); ctx.arc(x+20,y+20,13,0,Math.PI*2); },COLS[i][0],2.6);
    ctx.fillStyle='#FFFFFF'; ctx.font='800 15px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('ABCD'[i],x+20,y+21);
    ctx.fillStyle=DK; ctx.textAlign='left';
    let fs, lines; if(op._l){ fs=op._fs; lines=op._l; } else { fs=15; do { lines=wrapText(op.t,w-48,'700 '+fs+'px Gluten, Fredoka, system-ui, sans-serif'); fs--; } while(lines.length>2&&fs>10); fs++;
    if(lines.length>2) lines=[lines[0],lines.slice(1).join(' ')]; op._l=lines; op._fs=fs; }
    ctx.font='700 '+fs+'px Gluten, Fredoka, system-ui, sans-serif';
    const lh=fs*1.05; lines.forEach((l,k)=>ctx.fillText(l,x+40,y+21+(k-(lines.length-1)/2)*lh));
    if(res&&i===res.rightIdx){ sticker(()=>{ ctx.beginPath(); ctx.arc(x+w-2,y+2,12,0,Math.PI*2); },'#3FCB9B',2.6); ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=3.2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x+w-8,y+2); ctx.lineTo(x+w-4,y+7); ctx.lineTo(x+w+4,y-3); ctx.stroke(); }
    ctx.globalAlpha=1;
  });
}
function drawRunner(){
  if(G.cel&&G.jump<=0){ const c=G.cel, p=c.t/c.dur; let y=G.ly, rot=0, sc=1;
    if(c.k===1){ y-=Math.abs(Math.sin(c.t*Math.PI/0.45))*30; }
    if(c.k===2){ const q=Math.min(1,c.t/0.9); y-=Math.sin(Math.PI*q)*60; rot=-Math.PI*2*q; for(let i=0;i<8;i++){ const a=c.t*4+i*Math.PI/4, r=58; drawStar(G.x+Math.cos(a)*r,G.ly-50+Math.sin(a)*r*0.7,7,i%2?'#FFD54A':'#FF9EB5'); } }
    if(c.k===3){ sc=1+0.35*Math.sin(Math.min(1,p*1.6)*Math.PI*0.5)*(p>0.8?(1-p)/0.2:1); y-=Math.abs(Math.sin(c.t*Math.PI*2.2))*18;
      ctx.save(); ctx.globalAlpha=Math.min(1,c.t*2)*(p>0.85?(1-p)/0.15:1); ['#FF5A5F','#FFC233','#7ED07B','#5AB8F0','#B48CFF'].forEach((col,i)=>{ ctx.beginPath(); ctx.arc(G.x,G.ly+10,120-i*12,Math.PI,0); ctx.lineWidth=12; ctx.strokeStyle=col; ctx.stroke(); }); ctx.restore(); }
    const n=c.k===2&&c.t<0.9?'a_jump':'a_cheer', s=SP[n], im=bimg(n)||IMG[n];
    ctx.globalAlpha=0.16; ctx.fillStyle=DK; ctx.beginPath(); ctx.ellipse(G.x,G.ly+2,26,6,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.save(); ctx.translate(G.x,y-42); ctx.rotate(rot); ctx.scale(sc,sc); if(im) ctx.drawImage(im,-s.ax,42-s.ay,s.w,s.h); if(G.crown) drawCrown(-2,-44,0.9); ctx.restore(); return; }
  drawRunnerBase(); if(G.crown&&G.jump<=0) drawCrown(G.x-2,G.ly-86,0.9);
}
function drawStar(x,y,r,col){ ctx.beginPath(); for(let k=0;k<10;k++){ const rr2=k%2?r*0.45:r, a=-Math.PI/2+k*Math.PI/5; ctx.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2); } ctx.closePath(); ctx.fillStyle=col; ctx.fill(); ctx.strokeStyle=DK; ctx.lineWidth=1.4; ctx.stroke(); }
function drawRunnerBase(){
  let n='a_run'+((Math.floor(G.anim)%2)+1);
  if(G.pose==='switch') n='a_switch'; else if(G.pose==='cheer') n='a_cheer'; else if(G.pose==='dizzy') n='a_dizzy'; else if(G.pose==='eat') n=(Math.floor(G.t*5.5)%2)?'a_eat1':'a_eat2';
  if(G.jump>0&&(G.pose==='run'||G.pose==='switch')) n=G.spin?'a_cheer':'a_jump';
  const bob=(G.pose==='run'&&G.jump<=0)?Math.abs(Math.sin(G.anim*Math.PI))*-3:0;
  ctx.globalAlpha=0.16; ctx.fillStyle=DK; ctx.beginPath(); ctx.ellipse(G.x,G.ly+2,30-Math.min(14,G.jump/8),6,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  const flick=G.inv>0&&Math.floor(G.inv*12)%2===0;
  if(G.jump>0||G.sq>0){ const air=2*540/1250; const p=Math.min(1,G.jt/(G.spin?0.75:air));
    const rot=G.jump>0?(G.spin?-Math.PI*2*p:-Math.PI*2*Math.max(0,Math.min(1,(p-0.12)/0.76))):0;
    const sq=G.sq>0?(1-G.sq*1.6):1, st=G.jump>0&&G.vy>200?1.08:1;
    const s=SP[n], im=bimg(n)||IMG[n]; const cy=G.ly-G.jump-42;
    ctx.save(); ctx.globalAlpha=flick?0.45:1; ctx.translate(G.x,cy); ctx.rotate(rot); ctx.scale(1/Math.sqrt(sq*st),sq*st); if(im) ctx.drawImage(im,-s.ax,42-s.ay,s.w,s.h); ctx.restore(); }
  else spr(n,G.x,G.ly-G.jump+bob,flick?0.45:1);
}
function draw(){
  const top=smithOnTop();
  ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0); ctx.clearRect(0,0,W,H);
  drawBG();
  const gates=OBJ.filter(o=>o.t==='gate');
  drawLaneLetters();
  OBJ.forEach(o=>{ if(o.t==='ans') drawAnswers(o); });
  // nach Bahnen sortiert zeichnen (hinten zuerst)
  for(let ln=0;ln<4;ln++){
    OBJ.forEach(o=>{ if(o.lane!==ln||(o.done&&o.t!=='npc')) return; const fy=FLOOR[ln];
      if(o.t==='apple') spr('apple',o.x,fy-26+Math.sin(G.t*4+o.x*0.05)*2);
      else if(o.t==='heart') spr('heart',o.x,fy-30+Math.sin(G.t*4)*3);
      else if(o.t==='obs') spr(o.k,o.x,fy+(o.v?Math.sin(G.t*20)*0.8:0));
      else if(o.t==='chase'){ const wob=Math.sin(G.t*14); ctx.save(); ctx.translate(o.x,fy-Math.abs(wob)*5); ctx.scale(-1,1); ctx.rotate(-0.08+wob*0.06); spr('c_'+o.k,0,0); ctx.restore();
        const by=fy-122+Math.sin(G.t*6)*3; sticker(()=>{ ctx.beginPath(); ctx.arc(o.x,by,13,0,Math.PI*2); },'#FF9EB5',2.6); ctx.fillStyle=DK; ctx.font='800 17px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',o.x,by+1);
        if(!o.gone){ const t='Warte! Ich hab eine Frage!'; ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; const w=ctx.measureText(t).width+16, bx=Math.max(8,o.x-10), bb=by-20; sticker(()=>{ rr(bx,bb-20,w,22,10); },'#FFFFFF',2); ctx.fillStyle='#C2185B'; ctx.textAlign='left'; ctx.fillText(t,bx+8,bb-9); } ctx.textAlign='left'; }
      else if(o.t==='npc'){ const wob=Math.sin(G.t*7+o.ph); ctx.save(); ctx.translate(o.x,fy); ctx.rotate(wob*0.04); spr('c_'+o.k,0,-Math.abs(wob)*3,o.bumped?0.85:1); ctx.restore(); if(o.task&&!o.done){ const by=fy-122+Math.sin(G.t*5)*3; sticker(()=>{ ctx.beginPath(); ctx.arc(o.x,by,13,0,Math.PI*2); },'#FFD54A',2.6); ctx.fillStyle=DK; ctx.font='800 17px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',o.x,by+1); ctx.textAlign='left'; } } });
    if(!top&&ln===Math.max(0,Math.min(3,Math.round(laneOf(G.ly))))) drawRunner();
  }
  drawBubble();
  gates.forEach(drawGate);
  PART.forEach(p=>{ ctx.globalAlpha=Math.min(1,p.life*1.4); ctx.fillStyle=p.c; ctx.strokeStyle=DK; ctx.lineWidth=1.2;
    if(p.star){ ctx.beginPath(); for(let k=0;k<8;k++){ const r=k%2?p.s*0.45:p.s*1.4, a=k*Math.PI/4; ctx.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill(); ctx.stroke(); } });
  ctx.globalAlpha=1;
  POP.forEach((p,pi)=>{ const k=Math.min(1,p.t*6), y=Math.max(70,G.ly-140-p.t*26-(POP.length-1-pi)*48); ctx.save(); ctx.translate(G.x+70,y); ctx.scale(0.6+0.4*k,0.6+0.4*k); ctx.globalAlpha=p.t>1?1-(p.t-1)/0.3:1;
    ctx.font='800 26px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineJoin='round';
    ctx.lineWidth=8; ctx.strokeStyle='#FFFFFF'; ctx.strokeText(p.a,0,0); ctx.fillStyle=p.c; ctx.fillText(p.a,0,0);
    ctx.font='800 14px Gluten, Fredoka, system-ui, sans-serif'; ctx.lineWidth=6; ctx.strokeText(p.b,0,24); ctx.fillStyle=DK; ctx.fillText(p.b,0,24); ctx.restore(); });
  clearTop(); if(top){ tctx.setTransform(SC*DPR,0,0,SC*DPR,0,0); const m=ctx; ctx=tctx; try{ drawRunner(); } finally{ ctx=m; } topDirty=true; }
}
function drawBubble(){
  let best=null; OBJ.forEach(o=>{ if(o.t==='npc'&&!o.bumped&&o.x>G.x+50&&o.x<W-20&&(!best||o.x<best.x)) best=o; }); if(!best) return;
  const c=NPC[best.k]; const font='700 13px Gluten, Fredoka, system-ui, sans-serif'; if(best._bs!==best.say){ best._bl=wrapText(best.say,170,font); best._bs=best.say; } const lines=best._bl;
  ctx.font=font; let w=Math.max(...lines.map(l=>ctx.measureText(l).width)); ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; w=Math.max(w,ctx.measureText(c.n).width)+22;
  const h=20+lines.length*16; let x=best.x-w/2, y=FLOOR[best.lane]-92-h; x=Math.max(8,Math.min(W-w-8,x)); y=Math.max(60,y);
  sticker(()=>{ rr(x,y,w,h,12); ctx.moveTo(best.x-6,y+h); ctx.lineTo(best.x,y+h+10); ctx.lineTo(best.x+6,y+h); },'#FFFFFF',2.6);
  ctx.fillStyle='#C2185B'; ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText(c.n,x+11,y+6);
  ctx.fillStyle=DK; ctx.font=font; lines.forEach((l,i)=>ctx.fillText(l,x+11,y+21+i*16)); ctx.textBaseline='middle';
}
function laneOf(y){ for(let i=0;i<4;i++) if(Math.abs(y-FLOOR[i])<=26) return i; return y<FLOOR[0]?0:3; }

/* ---------- Schleife ---------- */
function loop(now){ const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; if(G.state==='map'){ clearTop(); mapUpdate(dt); drawMap(); requestAnimationFrame(loop); return; } if(G.state==='play') update(dt); if(G.state==='play'||G.state==='pause'||G.state==='result') draw(); else { clearTop(); drawMenuBG(dt); } requestAnimationFrame(loop); }
let mt=0; function drawMenuBG(dt){ if(!G.speed){ G.speed=120; G.x=RUNX; G.bgx=0; G.flx=0; G.tod=0; G.t=0; G.anim=0; G.lane=1; G.ly=FLOOR[1]; G.jump=0; G.pose='run'; }
  mt+=dt; G.t+=dt; G.tod+=dt*2; G.bgx=(G.bgx+dt*40)%880; G.flx=(G.flx+dt*110)%864; G.anim+=dt*4; ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0); ctx.clearRect(0,0,W,H); drawBG(); }

/* ---------- HUD ---------- */
function hud(full){
  const b=todBlend(); $('#hTod').textContent=THEMES[b.a>0.5?b.j:b.i][1];
  $('#hApples').textContent=G.apples; $('#hScore').textContent=G.score; $('#hStreak').textContent='×'+Math.max(1,G.streak);
  $('#hStreak').parentElement.style.background=G.streak>=3?'#FFD54A':'#FFFFFF';
  if(full){ const hs=$('#hHearts'); hs.hidden=G.mode!=='lern'; hs.querySelectorAll('svg').forEach((s,i)=>{ s.style.display=i<Math.max(3,G.hearts)?'':'none'; s.querySelector('path').setAttribute('fill',i<G.hearts?'#FF5A5F':'#FFFFFF'); });
    $('#hProg').hidden=G.mode!=='lern'; $('#hProg').textContent='Frage '+Math.min(G.qi+1,G.qList.length)+' / '+G.qList.length; $('#hLvl').textContent='Level '+(G.level||1); syncMusBtn(); }
}
function srcIcon(s){ s=s||''; if(/Lernziel/.test(s)) return '🎯 Lernziel'; if(/Altfrage|Altklausur|Prüfungsfragen|Klausurfragen|Moodle|Wiederholung|Multiple_Choice/i.test(s)) return '🦉 Altfrage'; if(/GuKG/.test(s)) return '⚖️ Gesetz'; if(/Skript/.test(s)) return '📘 Skript'; if(/Fachbegriff|Wortbaustein/.test(s)) return '🔤 Begriffe'; if(/Handout/.test(s)) return '📄 Handout'; if(/Folie|Foliensatz|\.pdf|\.pptx/.test(s)) return '📑 Folien'; return '📚 Quelle'; }
function srcTxt(q){ return q&&q.s?srcIcon(q.s)+' · '+q.s:''; }
function setQbar(q,res,opts,ri){ const b=$('#qbar'); if(!q){ b.hidden=true; return; } b.hidden=false;
  $('#qText').textContent=q.q; const qs=$('#qSrc'); if(qs){ qs.textContent=srcTxt(q); qs.hidden=!q.s; } const r=$('#qRes'); const box=$('#qOpts');
  if(opts){ box.hidden=false; box.innerHTML=opts.map((o,i)=>'<span class="qo'+(ri!=null?(i===ri?' right':' dim'):'')+'"><i style="background:'+COLS[i][0]+'">'+'ABCD'[i]+'</i>'+(o.blocked?'<em>Bahn belegt</em>':esc(o.t))+'</span>').join(''); } else box.hidden=true;
  if(res){ r.hidden=false; r.className='qres '+(res.ok?'ok':'bad'); r.textContent=res.ok?'Richtig: '+res.right.t:('Richtig wäre '+res.letter+': '+res.right.t); } else r.hidden=true; }

/* ---------- Klinik-Karte (Freispiel) ---------- */
const MFL=[[280,350],[210,280],[140,210],[70,140]];
const MSUB={alle:'Alle Fächer',hyg:'Hygiene & Mikrobiologie',kl1:'Krankheitslehre 1',pgk:'Pflegerische Grundkompetenzen',pharma:'Pharmakologie',paed:'Pädiatrie',recht:'Berufsrecht (GuKG)',gesch:'Geschichte der Pflege',psych:'Psychologie',paedsoz:'Pädagogik & Soziologie',fremd:'Medizinische Begriffe',meine:'Meine Fragen'};
const MROOMS=[['alle',0,70,170],['paed',0,176,414],['pharma',0,478,792],['kl1',1,70,240],['pgk',1,246,414],['hyg',1,478,792],['psych',2,70,240],['paedsoz',2,246,414],['fremd',2,478,792],['recht',3,70,414],['gesch',3,478,630],['meine',3,636,792]]
  .map(([sid,f,x1,x2])=>({sid,f,x1,x2,dx:sid==='alle'?120:x1>=470?x1+22:x2-22}));
const LIFTX=446, MFLOOR=['Erdgeschoss','1. Stock','2. Stock','3. Stock'];
const M={f:0,x:120,dir:1,moving:false,anim:0,path:[],car:0,ride:null,jump:0,vy:0,near:null,card:null,blink:0};
function mY(f){ return MFL[f][1]-3; }
const MNPC=[['orange',0,260,190,400],['erdbeere',0,640,490,780],['paprika',1,140,80,230],['banane',1,640,490,780],['brokkoli',1,330,260,400],['heidelbeere',2,150,80,230],['tomate',2,330,260,400],['ananas',2,640,490,780],['aubergine',3,240,90,400],['traube',3,560,490,620],['karotte',3,700,650,780],['kiwi',0,300,190,400]]
  .map(([k,f,x,a,b])=>({k,f,x,a,b,d:Math.random()<0.5?1:-1,ph:Math.random()*6,wait:Math.random()*3,si:Math.floor(Math.random()*3),talk:0}));
const MSAY={
  orange:['Der Kaffee im Stationszimmer ist älter als manche Patientenakte.','Zimmer 7 klingelt IMMER genau dann, wenn ich mich hinsetze.','Nachtdienst-Regel Nr. 1: Sag NIE „heute ist es aber ruhig“!','14.000 Schritte heute – nur zwischen Zimmer 3 und 5.','Mein Kuli ist schon wieder weg. Der dritte heute!'],
  erdbeere:['Mein Teddy hat jetzt auch einen Gips. Selbst gemacht!','Ich war tapfer! Nur ein ganz kleines bisschen geweint.','Das Fieberthermometer heißt jetzt Herr Piep.','Wenn ich groß bin, werd ich Pflegerin. Oder Dinosaurier.'],
  paprika:['Ich hab den Kuchen nur angeschaut. Ehrlich. Zweimal.','Mein Blutzucker und ich: eine komplizierte Beziehung.','Die Diätassistentin kennt alle meine Keks-Verstecke.','Insulin vor dem Essen – das Essen ist schuld, wenn’s spät wird!'],
  banane:['Ich wisch seit 6 Uhr – und schon wieder Fußabdrücke!','20 Jahre im Haus: Ich weiß, wo ALLE Kugelschreiber sind.','Nicht ausrutschen! Ich hab grad erst gewischt … schon wieder.','Der Lift und ich, wir reden nicht mehr miteinander.'],
  brokkoli:['Händedesinfektion: 30 Sekunden. Ich zähl mit!','Blutabnahme vorbereitet – leider im falschen Zimmer. Hoppla.','Übergabe: drei Seiten. Zwei davon über Herrn Paprikas Kuchen.','Ich bin grün, weil ich so gesund lebe. Und vom Desinfektionsmittel.'],
  heidelbeere:['Die Atemübung hilft – ich atme jetzt richtig professionell.','Mein Kissen und ich haben heute Fortschritte gemacht.','Im Ruheraum hört man fast die Pflanzen wachsen.','Die Gesprächsrunde war gut. Und es gab Kekse.'],
  tomate:['23 Unterschriften auf meinem Gips – einer hat ein Herz gemalt!','Mit Krücken ist der Weg zum Kaffeeautomaten eine Expedition.','Ich bin über eine Katze gestolpert. Der Katze geht’s super.','Physio sagt: noch zwei Wochen. Mein Gips sagt: Juckreiz.'],
  ananas:['Visite in 5 Minuten! … Also eher in 25.','Ich hab ein Krönchen, bin aber (noch) nicht Chefärztin.','Meine Handschrift kann nur die Apotheke lesen.','Hast du die Laborwerte? Die Kiwi sagt, du hast sie.'],
  aubergine:['Brille gesucht – sie war auf meinem Kopf. Drei Mal.','Stethoskop kalt? Ich hab’s extra in der Tasche gewärmt!','Mein Pieper piept heute öfter als jeder Monitor.','Ich mach Visite seit 6 Uhr. Die Aubergine braucht Kaffee.'],
  traube:['Der Tee hier schmeckt wie Wärme mit Zitrone. Noch einen, bitte!','Tag 4 – und das 1000-Teile-Puzzle ist fertig!','Die Nachtschwester hat mir um 3 Uhr zugehört. Legende.','Schritt für Schritt. Heute: Schritt Nummer vier.'],
  karotte:['Ich bin Chirurg – zuhause schneide ich Brote perfekt gerade.','OP-Haube auf, Musik an: heute läuft Lo-Fi im Saal.','Ich hab im OP nie was vergessen. Außer einmal meinen Kaffee.','Nach 6 Stunden OP schmeckt sogar die Kantinensuppe.'],
  kiwi:['Tag 5 rauchfrei – ich rieche jetzt das Mittagessen. Leider.','Statt Raucherpause mach ich Treppenpause. 3. Stock, zweimal!','Das Nikotinpflaster und ich – wir sind ein Team.','Mein Geld fürs Rauchen spar ich jetzt für Sneaker wie Granny Smiths.']};
const MSAY_ALL=['Angeblich wohnt im Keller vom Alten Lazarett die Ur-Oma aller Bettpfannen.','Wusstest du? Der Lift fährt schneller, wenn man nett „bitte“ sagt.','Die Kantine hat heute Schnitzel – das ganze Haus riecht danach!','Wer hat schon wieder den Rollstuhl im 2. Stock geparkt?','Das Skelett in der Bibliothek heißt übrigens Karl.'];
function sayFor(n){ const a=MSAY[n.k]||NPC[n.k].say; return Math.random()<0.18?MSAY_ALL[Math.floor(Math.random()*MSAY_ALL.length)]:a[(n.si++)%a.length]; }
function mapNpcUpdate(dt){ let talking=MNPC.filter(n=>n.talk>0).length; MNPC.forEach(n=>{ const c=NPC[n.k]; n.ph+=dt*5; const near=!M.ride&&n.f===M.f&&Math.abs(n.x-M.x)<56;
  if(n.cd==null) n.cd=6+Math.random()*30; n.cd-=dt;
  if(near&&!n.wasNear&&talking<1&&(n.nextNear||0)<=performance.now()){ n.line=sayFor(n); n.talk=3.2; talking++; n.nextNear=performance.now()+20000; } n.wasNear=near;
  if(n.cd<=0&&n.talk<=0){ if(talking<1){ n.line=sayFor(n); n.talk=3.2; talking++; } n.cd=22+Math.random()*30; }
  n.talk=Math.max(0,n.talk-dt);
  if(n.talk>0||n.wait>0){ n.wait=Math.max(0,n.wait-dt); if(n.talk>0) return; }
  if(n.wait>0) return;
  n.x+=n.d*Math.max(14,Math.min(34,c.v*0.5))*dt; if(n.x>n.b){ n.x=n.b; n.d=-1; n.wait=1+Math.random()*2; } if(n.x<n.a){ n.x=n.a; n.d=1; n.wait=1+Math.random()*2; } if(Math.random()<dt*0.15) n.wait=1+Math.random()*2; }); }
function drawMapNpcs(){ MNPC.forEach(n=>{ const y=mY(n.f), wob=(n.wait>0||n.talk>0)?0:Math.sin(n.ph); ctx.save(); ctx.globalAlpha=0.14; ctx.fillStyle=DK; ctx.beginPath(); ctx.ellipse(n.x,y-1,11,2.5,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(n.x,y-Math.abs(wob)*1.5); ctx.rotate(wob*0.05); ctx.scale(0.56*(n.d<0?-1:1),0.56); spr('c_'+n.k,0,0); ctx.restore(); }); }
function drawMapTalk(){ MNPC.forEach(n=>{ if(n.talk<=0||!n.line) return; const c=NPC[n.k]; const f='800 9.5px Nunito, system-ui, sans-serif'; const ls=wrapText(n.line,168,f); ctx.font=f; const w=Math.max(...ls.map(l=>ctx.measureText(l).width),ctx.measureText(c.n).width)+18; const h=16+ls.length*12;
  let x=Math.max(70+w/2,Math.min(790-w/2,n.x)), top=mY(n.f)-60-h; const side=top<50; if(side){ x=n.x<430?n.x+w/2+24:n.x-w/2-24; top=mY(n.f)-40-h/2; } ctx.globalAlpha=0.72*Math.min(1,n.talk*2.5);
  sticker(()=>{ rr(x-w/2,top,w,h,10); if(side){ const ex=n.x<430?x-w/2:x+w/2, d=n.x<430?-7:7; ctx.moveTo(ex,top+h/2-5); ctx.lineTo(ex+d,top+h/2); ctx.lineTo(ex,top+h/2+5); } else { ctx.moveTo(n.x-5,top+h); ctx.lineTo(n.x,top+h+7); ctx.lineTo(n.x+5,top+h); } },'#FFFFFF',2);
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#5A4BD1'; ctx.font='800 8.5px Nunito, system-ui, sans-serif'; ctx.globalAlpha=Math.min(1,n.talk*2.5); ctx.fillText(c.n,x,top+9); ctx.fillStyle=DK; ctx.font=f; ls.forEach((l,i)=>ctx.fillText(l,x,top+21+i*12)); ctx.globalAlpha=1; }); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; }
function carY(){ return M.ride?M.ride.y:mY(M.car); }
function roomName(sid){ return sid==='alle'?'Haupteingang':STATION[sid].name; }
function stars(sid){ return store.get('stars-'+sid,0); }
function starTotal(){ return MROOMS.reduce((s,r)=>s+stars(r.sid),0); }
function mapSync(){ $('#kStars').textContent='★ '+starTotal()+' / '+(MROOMS.length*3); const r=M.near; $('#kWhere').textContent=MFLOOR[M.f]+(r?' · '+roomName(r.sid):''); }
function showMap(){
  purgeBK('none'); bimg('map_bg'); Object.keys(SP).forEach(n=>{ if(n.startsWith('c_')||n.startsWith('a_')) bimg(n); });
  hideAll(); $('#hud').hidden=true; $('#qbar').hidden=true; $('#visite').hidden=true; G.visit=null; LOFI.duck(false); G.task=null; $('#task').hidden=true;
  const p=store.get('mappos',null); if(p&&MFL[p.f]){ M.f=p.f; M.x=p.x; } M.car=M.f; M.path=[]; M.ride=null; M.jump=0; KEY.l=KEY.r=false;
  G.state='map'; G.speed=0; applyStation('alle'); musInfo();
  $('#mapUi').hidden=false; $('#mapCard').hidden=true; $('#ctrl').hidden=true; $('#bJump').textContent='Betreten'; mapNear(); mapSync(); last=performance.now();
}
function leaveMap(){ $('#mapUi').hidden=true; $('#mapCard').hidden=true; $('#bJump').textContent='Springen'; }
function mapNear(){ M.near=M.ride?null:(MROOMS.find(r=>r.f===M.f&&Math.abs(M.x-r.dx)<24)||null); }
function goTo(f,x,then){ M.path=[]; if(f!==M.f){ M.path.push({t:'walk',x:LIFTX},{t:'lift',f}); } M.path.push({t:'walk',x}); if(then) M.path.push(then); }
function goRoom(r){ goTo(r.f,r.dx,{t:'enter',r}); }
function mapFloor(d){ if(M.card||M.ride) return; const f=M.f+d; if(f<0||f>3) return; const x=M.x; goTo(f,LIFTX); sfx('lane'); }
function mapEnter(){ if(M.card) return; if(M.near){ openCard(M.near); } else if(M.jump<=0&&!M.ride){ M.vy=330; M.jump=0.01; sfx('jump'); } }
function mapUpdate(dt){
  M.blink+=dt; mapNpcUpdate(dt); if(M.card) { M.moving=false; return; }
  const sp=170; M.moving=false;
  if(KEY.l||KEY.r){ if(!M.ride){ M.path=[]; const d=KEY.r?1:-1; M.x=Math.max(78,Math.min(788,M.x+d*sp*dt)); M.dir=d; M.moving=true; } }
  else if(M.path.length){ const s=M.path[0];
    if(s.t==='walk'){ const d=s.x-M.x; if(Math.abs(d)<=sp*dt){ M.x=s.x; M.path.shift(); } else { M.x+=Math.sign(d)*sp*dt; M.dir=Math.sign(d); M.moving=true; } }
    else if(s.t==='lift'){
      if(!M.ride){ if(M.car!==M.f){ // Lift holen
          M.callY=(M.callY==null?mY(M.car):M.callY); const ty=mY(M.f); const d=ty-M.callY; if(Math.abs(d)<=300*dt){ M.car=M.f; M.callY=null; sfx('coin'); } else M.callY+=Math.sign(d)*300*dt; }
        else { M.ride={y:mY(M.f),to:s.f}; sfx('lane'); } }
      else { const ty=mY(M.ride.to), d=ty-M.ride.y; if(Math.abs(d)<=190*dt){ M.f=M.ride.to; M.car=M.f; M.ride=null; M.path.shift(); sfx('coin'); } else M.ride.y+=Math.sign(d)*190*dt; }
    }
    else if(s.t==='enter'){ M.path.shift(); M.dir=1; openCard(s.r); }
  }
  if(M.jump>0){ M.vy-=1100*dt; M.jump+=M.vy*dt; if(M.jump<=0){ M.jump=0; M.vy=0; } }
  M.anim+=dt*(M.moving?9:2); const prev=M.near; mapNear(); if(prev!==M.near){ mapSync(); if(M.near) sfx('coin'); }
}
function starStr(n){ return '★★★'.slice(0,n)+'☆☆☆'.slice(0,3-n); }
function drawMap(){
  ctx.setTransform(SC*DPR,0,0,SC*DPR,0,0); ctx.clearRect(0,0,W,H);
  spr('map_bg',0,0);
  // Raumschilder
  MROOMS.forEach(r=>{ const top=MFL[r.f][0]; const cx=r.sid==='alle'?(r.x1+r.x2)/2:r.x1>=470?(r.x1+82+r.x2)/2:(r.x1+70+r.dx-16)/2; const name=r.sid==='alle'?'Eingang':STATION[r.sid].name; const sub=MSUB[r.sid]||''; const n=stars(r.sid);
    ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; const tw=ctx.measureText(name).width; ctx.font='700 11px system-ui, sans-serif'; const sw=r.sid==='alle'?0:ctx.measureText('★★★').width+6; ctx.font='800 8.5px Nunito, system-ui, sans-serif'; const subw=ctx.measureText(sub).width;
    const w=Math.max(tw+sw,subw)+16, x=cx-w/2, y=r.sid==='alle'?top+26:top+37, hot=M.near===r, hov=M.hover===r;
    if(hov){ ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle='#FFD54A'; rr(r.x1,top+4,r.x2-r.x1,MFL[r.f][1]-14-top-4,7); ctx.fill(); ctx.restore(); ctx.save(); ctx.strokeStyle='#E8A400'; ctx.lineWidth=3; rr(r.x1,top+4,r.x2-r.x1,MFL[r.f][1]-14-top-4,7); ctx.stroke(); ctx.restore(); }
    if(r.sid==='alle'){ /* Schild über der Tür */ }
    sticker(()=>rr(x,y-15,w,30,10),hot||hov?'#FFD54A':'#FFFFFF',2);
    const lx=x+(w-(tw+sw))/2; ctx.fillStyle=DK; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; ctx.fillText(name,lx,y-6);
    if(sw){ ctx.font='700 11px system-ui, sans-serif'; ctx.fillStyle=n?'#E8A400':'#B9B3C2'; ctx.fillText(starStr(n),lx+tw+6,y-5.5); }
    ctx.font='800 8.5px Nunito, system-ui, sans-serif'; ctx.fillStyle='#5A4BD1'; ctx.textAlign='center'; ctx.fillText(sub,x+w/2,y+7); ctx.textAlign='left';
  });
  drawMapNpcs();
  // Lift-Kabine
  const cy=M.callY!=null?M.callY:carY();
  sticker(()=>rr(424,cy-60,44,58,6),'#FFB3C7',2.6);
  ctx.fillStyle='#FFF6EC'; rr(430,cy-54,32,46,4); ctx.fill(); ctx.strokeStyle=DK; ctx.lineWidth=1.6; ctx.stroke();
  ctx.fillStyle=DK; ctx.font='800 9px system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText(['EG','1','2','3'][M.ride?(M.ride.y<mY(M.ride.to)+1&&M.ride.y>mY(M.ride.to)-1?M.ride.to:M.f):M.car],446,cy-67);
  // Apfel
  const ay=(M.ride?M.ride.y:mY(M.f))-M.jump;
  ctx.save(); ctx.globalAlpha=0.16; ctx.fillStyle=DK; ctx.beginPath(); ctx.ellipse(M.x,(M.ride?M.ride.y:mY(M.f))-1,14,3,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  const pose=M.jump>0?'a_jump':M.moving?(Math.floor(M.anim)%2?'a_run2':'a_run1'):(M.near?'a_wave':'a_switch');
  ctx.save(); ctx.translate(M.x,ay); ctx.scale(0.46*M.dir,0.46); spr(pose,0,0); ctx.restore();
  drawMapTalk();
  // Hinweis an der Tür
  if(M.near&&!M.card){ const r=M.near; const t=(matchMedia('(pointer:coarse)').matches?'Tippen':'Leertaste')+': '+(r.sid==='alle'?'alle Fächer':'betreten'); const by=ay-70+Math.sin(M.blink*4)*2;
    ctx.font='800 11px Gluten, Fredoka, system-ui, sans-serif'; const w=ctx.measureText(t).width+18; sticker(()=>{ rr(M.x-w/2,by-11,w,22,11); },'#FFFFFF',2.2);
    ctx.fillStyle=DK; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(t,M.x,by); }
  ctx.textBaseline='alphabetic'; ctx.textAlign='left';
}
function openCard(r){ M.card=r; M.path=[]; KEY.l=KEY.r=false; store.set('mappos',{f:r.f,x:r.dx}); const sid=r.sid, st=STATION[sid], n=(sid==='alle'?pool('alle'):pool(sid)).length;
  applyStation(sid); musInfo(); sfx('gate');
  $('#kcName').textContent=sid==='alle'?'Haupteingang – alle Fächer':sid==='meine'?'Dienstzimmer – Meine Fragen':st.name;
  $('#kcSub').textContent=sid==='meine'?(n?'Deine selbst erstellten Fragen aus dem Lernteil · '+n+' Fragen':'Noch keine eigenen Fragen – erstell sie im Lernportal mit Häkchen oder Pinsel, dann tauchen sie hier auf.'):(sid==='alle'?'Fragen aus allen Fächern gemischt':subjName(sid))+' · '+n+' Fragen';
  $('#kcMus').textContent='♫ „'+st.mus.title+'“';
  $('#kcStars').innerHTML='<span>'+'★'.repeat(stars(sid))+'</span><span style="color:#D6D1DD">'+'★'.repeat(3-stars(sid))+'</span>'; $('#kcStars').setAttribute('aria-label',stars(sid)+' von 3 Sternen');
  $('#kcBest').textContent='Bestwert: '+store.get('best-lern-'+sid,0)+' Punkte';
  $('#kcLern').disabled=!n; $('#kcLern').textContent='Lernlauf · '+(MENU.count||'alle')+' Fragen';
  $('#kcImg').src=IMG.a_cheer?IMG.a_cheer.src:IMG.a_big.src;
  $('#mapCard').hidden=false; setTimeout(()=>{ try{ $('#kcLern').focus(); }catch(e){} },30);
}
function closeCard(){ M.card=null; $('#mapCard').hidden=true; applyStation('alle'); musInfo(); try{ document.activeElement&&document.activeElement.blur(); }catch(e){} }
function startFromMap(mode){ const r=M.card; if(!r) return; audio(); M.card=null; leaveMap(); G.fromMap=true; newGame(mode,r.sid); }
function mapRoomAt(x,y){ return MROOMS.find(r=>x>=r.x1-2&&x<=r.x2+2&&y>=MFL[r.f][0]&&y<=MFL[r.f][1]); }
function mapLocal(e){ const rc=cv.getBoundingClientRect(); return [(e.clientX-rc.left)/rc.width*W,(e.clientY-rc.top)/rc.height*H]; }
cv.addEventListener('pointermove',e=>{ if(G.state!=='map'||M.card) { if(M.hover){ M.hover=null; cv.style.cursor=''; } return; } const [x,y]=mapLocal(e); M.hover=mapRoomAt(x,y)||null; cv.style.cursor=M.hover?'pointer':''; });
cv.addEventListener('pointerleave',()=>{ M.hover=null; cv.style.cursor=''; });
function mapPointer(e){ const rc=cv.getBoundingClientRect(); const x=(e.clientX-rc.left)/rc.width*W, y=(e.clientY-rc.top)/rc.height*H; if(M.card) return;
  const r=mapRoomAt(x,y); if(r){ M.path=[]; M.ride=null; M.callY=null; M.f=r.f; M.car=r.f; M.x=r.dx; M.dir=1; M.jump=0; mapNear(); mapSync(); burst(r.dx,mY(r.f)-30,'#FFD54A',12); openCard(r); return; }
  const f=MFL.findIndex(([t,b])=>y>=t&&y<=b); if(f>=0&&x>70&&x<795) goTo(f,Math.max(78,Math.min(788,x))); }
$('#kBack').addEventListener('click',()=>{ leaveMap(); showMenu(); });
$('#kcBack').addEventListener('click',closeCard);
$('#kcLern').addEventListener('click',()=>startFromMap('lern'));
$('#kMus').addEventListener('click',toggleMusic); $('#kSfx').addEventListener('click',toggleSfx);

/* ---------- Menü ---------- */
const MENU={mode:(m=>m==='chill'?'lern':m)(store.get('mode','lern')),subj:store.get('subj','alle'),count:store.get('count',10),tempo:store.get('tempo','gemuetlich')};
function buildMenu(){
  const sel=$('#mSubj'); let h='<option value="alle">Alle Fächer zusammen ('+QD.subjects.reduce((s,x)=>s+(QD.q[x.id]||[]).length,0)+')</option>';
  h+='<option value="fremd">Medizinische Begriffe ('+(QD.q.fremd||[]).length+')</option>';
  QD.subjects.filter(s=>s.id!=='fremd').forEach(s=>{ h+='<option value="'+s.id+'">'+s.name+' ('+(QD.q[s.id]||[]).length+')</option>'; });
  sel.innerHTML=h; sel.value=MENU.subj;
  syncMenu();
}
function syncMenu(){
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===MENU.mode)));
  document.querySelectorAll('[data-count]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.count===MENU.count)));
  document.querySelectorAll('[data-tempo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tempo===MENU.tempo)));
  $('#mLern').hidden=false; const km=MENU.mode==='karte'; $('#mSubjRow').hidden=km; $('#mStation').hidden=km; $('#mStart').textContent=km?'Zur Klinik-Karte':"Los geht's!"; $('#mCount').style.display=MENU.mode!=='chill'?'contents':'none';
  $('#mSfx').setAttribute('aria-pressed',String(sfxOn)); $('#mSfx').textContent=sfxOn?'Geräusche an':'Geräusche aus';
  $('#mMus').setAttribute('aria-pressed',String(musOn)); $('#mMus').textContent=musOn?'Musik an':'Musik aus';
  const best=store.get('best-'+MENU.mode+'-'+MENU.subj,0); $('#mBest').textContent=km?('★ '+starTotal()+' / '+(MROOMS.length*3)+' Sterne'):('Bestwert: '+best+' Punkte'); const so=STATION[stOf(MENU.subj)]; $('#mStation').textContent='Station: '+so.name+' · Musik: „'+so.mus.title+'“';
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{ MENU.mode=b.dataset.mode; store.set('mode',MENU.mode); applyStation(MENU.mode==='karte'?'alle':MENU.subj); musInfo(); syncMenu(); }));
document.querySelectorAll('[data-count]').forEach(b=>b.addEventListener('click',()=>{ MENU.count=+b.dataset.count; store.set('count',MENU.count); syncMenu(); }));
document.querySelectorAll('[data-tempo]').forEach(b=>b.addEventListener('click',()=>{ MENU.tempo=b.dataset.tempo; store.set('tempo',MENU.tempo); syncMenu(); }));
$('#mSubj').addEventListener('change',e=>{ MENU.subj=e.target.value; store.set('subj',MENU.subj); applyStation(MENU.subj); syncMenu(); musInfo(); });
$('#mSfx').addEventListener('click',toggleSfx);
$('#mMus').addEventListener('click',toggleMusic);
$('#mStart').addEventListener('click',()=>{ audio(); G.fromMap=false; if(MENU.mode==='karte'){ showMap(); return; } if(MENU.mode==='lern'&&!pool(MENU.subj).length) return; newGame(); });
$('#rotOk').addEventListener('click',()=>{ store.set('rotok',true); $('#rot').hidden=true; });
function hideAll(){ ['#menu','#pauseOv','#result','#mapUi','#mapCard'].forEach(s=>$(s).hidden=true); }
function showMenu(){ G.fromMap=false; G.task=null; $('#task').hidden=true; $('#bJump').textContent='Springen'; LOFI.duck(false); applyStation(MENU.mode==='karte'?'alle':MENU.subj); G.visit=null; $('#visite').hidden=true; hideAll(); $('#menu').hidden=false; $('#hud').hidden=true; $('#ctrl').hidden=true; $('#qbar').hidden=true; G.state='menu'; G.speed=0; syncMenu(); }

/* ---------- Ergebnis ---------- */
function esc(t){ return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function showResult(){
  $('#ctrl').hidden=true; $('#qbar').hidden=true;
  const key='best-'+G.mode+'-'+G.sel; const nb=G.score>G.best; if(nb) store.set(key,G.score);
  const n=G.mode==='lern'?G.qi:0; let stn=0, newSt=false;
  if(G.mode==='lern'&&n>=5){ const q=G.right/n; stn=q>=0.9?3:q>=0.75?2:q>=0.5?1:0; const old=store.get('stars-'+G.sel,0); if(stn>old){ store.set('stars-'+G.sel,stn); newSt=true; } }
  $('#rTitle').textContent=G.mode==='lern'?(G.hearts<=0?'Schicht vorbei!':'Schicht geschafft!'):'Schöne Runde!';
  $('#rStats').innerHTML=(G.mode==='lern'?'<span class="pill">'+G.right+' / '+n+' richtig</span>':'')+'<span class="pill">'+G.score+' Punkte</span><span class="pill">'+G.apples+' Äpfel</span>'+(nb?'<span class="pill gold">Neuer Bestwert!</span>':'<span class="pill">Bestwert '+G.best+'</span>')+(G.mode==='lern'&&n>=5?'<span class="pill'+(newSt?' gold':'')+'" aria-label="'+stn+' von 3 Sternen">'+starStr(stn)+(newSt?' neu!':'')+'</span>':'');
  $('#rStats').innerHTML+=(G.visitN?'<span class="pill">Visiten '+G.visitOk+' / '+G.visitN+'</span>':'')+(G.taskCount?'<span class="pill">Aufgaben '+G.taskOk+' / '+G.taskCount+'</span>':'');
  $('#rMenu').textContent=G.fromMap?'Zur Karte':'Menü';
  $('#rWrong').innerHTML=G.wrong.length?'<h3>Nochmal anschauen</h3>'+G.wrong.map(w=>'<div class="wr"><b>'+esc(w.q.q)+'</b><div class="ok">Richtig: '+esc(w.q.r)+'</div><div class="no">Deine Bahn: '+esc(w.your)+'</div>'+(w.q.e?'<div class="ex">'+esc(w.q.e)+'</div>':'')+(w.q.s?'<div class="src">Quelle: '+esc(srcTxt(w.q))+'</div>':'')+'</div>').join(''):(G.mode==='lern'?'<p class="allok">Alles richtig – super gemacht!</p>':'<p class="allok">Zum Lernen wähl im Menü den Lernlauf.</p>');
  $('#result').hidden=false;
}
$('#rAgain').addEventListener('click',()=>{ audio(); newGame(G.mode,G.sel); });
$('#rMenu').addEventListener('click',()=>G.fromMap?showMap():showMenu());

function ready(){ applyStation(MENU.subj); $('#loading').hidden=true; fit(); buildMenu(); showMenu(); $('#mApple').src=IMG.a_big.src; musInfo(); $('#pApple').src=IMG.a_sleep.src; requestAnimationFrame(loop); }
fit();
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&G.state==='play') pause(); });
})();
