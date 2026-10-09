// ===== Config =====
const DEFAULT_LAT = -20.88, DEFAULT_LON = 55.45;
const MIN_ELEV = 10;
const HOURS_WINDOW = 72;

let observer = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
let passes = [];
let selectedIndex = -1;
let nextPass = null;
let currentTLE = null;

// ===== Utils =====
const $ = s => document.querySelector(s);
const fmtTime = d => new Date(d).toLocaleTimeString('fr-FR',
  { timeZone:'Indian/Reunion', hour:'2-digit', minute:'2-digit' });
const fmtDate = d => new Date(d).toLocaleDateString('fr-FR',
  { timeZone:'Indian/Reunion', day:'2-digit', month:'2-digit' });

function azToDir(az){
  const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  return dirs[Math.round(az/22.5)%16];
}

// ===== Chargement TLE =====
async function loadTLE(){
  const r = await fetch('data/tle.json', { cache:'no-store' });
  if(!r.ok) throw new Error('TLE introuvable — vérifiez l\'Action GitHub');
  return r.json();
}

// ===== Calcul des passages =====
function computePasses(tle){
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  const now = new Date();
  const end = new Date(now.getTime() + HOURS_WINDOW*3600*1000);
  const obsGd = { longitude: observer.lon*Math.PI/180, latitude: observer.lat*Math.PI/180, height: 0.05 };

  const result = [];
  let step = 30;
  let t = new Date(now);
  let inPass = false, pass = null;

  while(t < end){
    const pos = satellite.propagate(satrec, t);
    if(pos.position){
      const gmst = satellite.gstime(t);
      const ecf = satellite.eciToEcf(pos.position, gmst);
      const look = satellite.ecfToLookAngles(obsGd, ecf);
      const elev = look.elevation*180/Math.PI;
      const az = (look.azimuth*180/Math.PI + 360) % 360;
      const range = look.rangeSat;

      if(elev >= MIN_ELEV){
        if(!inPass){
          inPass = true;
          pass = { aos:{time:t.toISOString(),azimuthDeg:az}, tca:null, los:null, maxElev:-90 };
        }
        if(elev > pass.maxElev){
          pass.maxElev = elev;
          pass.tca = { time:t.toISOString(), azimuthDeg:az, elevationDeg:elev, rangeKm:range };
        }
      } else if(inPass){
        inPass = false;
        pass.los = { time:t.toISOString(), azimuthDeg:az };
        pass.durationSeconds = (new Date(pass.los.time) - new Date(pass.aos.time))/1000;
        pass.visible = isVisible(satrec, pass.tca.time, obsGd);
        result.push(pass);
      }
    }
    t = new Date(t.getTime() + step*1000);
  }
  return result;
}

function isVisible(satrec, timeISO, obsGd){
  const t = new Date(timeISO);
  const pos = satellite.propagate(satrec, t);
  if(!pos.position) return false;
  const sunEci = sunPosition(t);
  const dot = pos.position.x*sunEci.x + pos.position.y*sunEci.y + pos.position.z*sunEci.z;
  const issLit = dot < 0;
  const gmst = satellite.gstime(t);
  const sunEcf = satellite.eciToEcf(sunEci, gmst);
  const sunLook = satellite.ecfToLookAngles(obsGd, sunEcf);
  const sunElev = sunLook.elevation*180/Math.PI;
  const obsDark = sunElev < -6;
  return issLit && obsDark;
}

function sunPosition(date){
  const jd = date/86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474*n) % 360;
  const g = ((357.528 + 0.9856003*n) % 360) * Math.PI/180;
  const lambda = (L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g)) * Math.PI/180;
  const eps = 23.439*Math.PI/180;
  const r = 1.00014 - 0.01671*Math.cos(g) - 0.00014*Math.cos(2*g);
  const AU = 149597870.7;
  return {
    x: r*AU*Math.cos(lambda),
    y: r*AU*Math.cos(eps)*Math.sin(lambda),
    z: r*AU*Math.sin(eps)*Math.sin(lambda)
  };
}

// ===== Affichage =====
function render(){
  const list = $('#list');
  list.innerHTML = '';
  const showOnlyVisible = $('#visibleOnly').checked;
  const filtered = passes.filter(p => !showOnlyVisible || p.visible);

  if(!filtered.length){
    list.innerHTML = '<p style="color:var(--muted)">Aucun passage correspondant.</p>';
    nextPass = null; tick();
    return;
  }

  filtered.forEach(p => {
    const idx = passes.indexOf(p);
    const el = document.createElement('div');
    el.className = 'card'
      + (p.visible ? ' visible' : '')
      + (p.tca.elevationDeg > 45 ? ' best' : '')
      + (idx === selectedIndex ? ' selected' : '');
    el.innerHTML = `
      <div class="time">
        ${fmtDate(p.aos.time)} · ${fmtTime(p.aos.time)} → ${fmtTime(p.los.time)}
        <span class="badge ${p.visible?'vis':'no'}">${p.visible?'VISIBLE':'non visible'}</span>
      </div>
      <div class="meta">
        Culminaison ${fmtTime(p.tca.time)} · élévation ${p.tca.elevationDeg.toFixed(1)}° ·
        distance ${p.tca.rangeKm.toFixed(0)} km · durée ${p.durationSeconds}s<br>
        Direction : montée ${azToDir(p.aos.azimuthDeg)} (${p.aos.azimuthDeg.toFixed(0)}°) →
        culminaison ${azToDir(p.tca.azimuthDeg)} (${p.tca.azimuthDeg.toFixed(0)}°) →
        descente ${azToDir(p.los.azimuthDeg)} (${p.los.azimuthDeg.toFixed(0)}°)
      </div>`;
    el.onclick = () => { selectedIndex = idx; render(); drawSkyMap(p); };
    list.appendChild(el);
  });

  const now = new Date();
  nextPass = passes.map(p => new Date(p.aos.time)).find(t => t > now) || null;
  tick();
}

function tick(){
  const el = $('#countdown');
  const info = $('#nextInfo');
  if(!nextPass){ el.textContent='—'; info.textContent=''; return; }
  const diff = nextPass - new Date();
  if(diff <= 0){ render(); return; }
  const h = Math.floor(diff/3600000);
  const m = Math.floor(diff%3600000/60000);
  const s = Math.floor(diff%60000/1000);
  el.textContent = `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
  const p = passes.find(x => new Date(x.aos.time).getTime() === nextPass.getTime());
  if(p){
    info.textContent = `${fmtDate(p.aos.time)} à ${fmtTime(p.aos.time)} · `
      + `élévation max ${p.tca.elevationDeg.toFixed(0)}° · ${p.visible?'✅ visible':'non visible'}`;
  }
  setTimeout(tick, 1000);
}

// ===== Carte du ciel =====
function drawSkyMap(pass){
  const svg = $('#skyMap');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';

  [30,60,90].forEach(elev => {
    const r = 100 * (1 - elev/90);
    const c = document.createElementNS(NS,'circle');
    c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',r);
    c.setAttribute('fill','none'); c.setAttribute('stroke','#243052');
    svg.appendChild(c);
  });
  [0,90,180,270].forEach(az => {
    const a = (az-90)*Math.PI/180;
    const l = document.createElementNS(NS,'line');
    l.setAttribute('x1',0); l.setAttribute('y1',0);
    l.setAttribute('x2',100*Math.cos(a)); l.setAttribute('y2',100*Math.sin(a));
    l.setAttribute('stroke','#243052');
    svg.appendChild(l);
  });

  const satrec = satellite.twoline2satrec(currentTLE.line1, currentTLE.line2);
  const obsGd = { longitude: observer.lon*Math.PI/180, latitude: observer.lat*Math.PI/180, height: 0.05 };
  const t0 = new Date(pass.aos.time), t1 = new Date(pass.los.time);
  const points = [];
  for(let t = t0; t <= t1; t = new Date(t.getTime()+5000)){
    const pos = satellite.propagate(satrec, t);
    if(!pos.position) continue;
    const gmst = satellite.gstime(t);
    const ecf = satellite.eciToEcf(pos.position, gmst);
    const look = satellite.ecfToLookAngles(obsGd, ecf);
    const elev = look.elevation*180/Math.PI;
    const az = (look.azimuth*180/Math.PI + 360) % 360;
    if(elev < 0) continue;
    const r = 100 * (1 - elev/90);
    const a = (az-90)*Math.PI/180;
    points.push([r*Math.cos(a), r*Math.sin(a)]);
  }

  if(points.length){
    const path = document.createElementNS(NS,'polyline');
    path.setAttribute('points', points.map(p=>p.join(',')).join(' '));
    path.setAttribute('fill','none');
    path.setAttribute('stroke', pass.visible ? '#22c55e' : '#3b82f6');
    path.setAttribute('stroke-width','2');
    svg.appendChild(path);

    const dot = document.createElementNS(NS,'circle');
    const r = 100 * (1 - pass.tca.elevationDeg/90);
    const a = (pass.tca.azimuthDeg-90)*Math.PI/180;
    dot.setAttribute('cx', r*Math.cos(a));
    dot.setAttribute('cy', r*Math.sin(a));
    dot.setAttribute('r', 4);
    dot.setAttribute('fill', pass.visible ? '#22c55e' : '#3b82f6');
    svg.appendChild(dot);
  }

  $('#skyMapInfo').textContent =
    `${fmtTime(pass.aos.time)} → ${fmtTime(pass.los.time)} · `
    + `max ${pass.tca.elevationDeg.toFixed(0)}° à ${azToDir(pass.tca.azimuthDeg)}`;
}

// ===== Interactions =====
$('#geoBtn').onclick = () => {
  if(!navigator.geolocation) return alert('Géolocalisation non supportée');
  navigator.geolocation.getCurrentPosition(pos => {
    observer.lat = pos.coords.latitude;
    observer.lon = pos.coords.longitude;
    $('#locationLabel').textContent =
      `Position : ${observer.lat.toFixed(2)}, ${observer.lon.toFixed(2)} (GPS)`;
    refresh();
  }, err => alert('Impossible d\'obtenir la position : ' + err.message));
};

$('#citySearch').addEventListener('change', e => {
  const m = e.target.value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if(!m) return;
  observer.lat = parseFloat(m[1]);
  observer.lon = parseFloat(m[2]);
  $('#locationLabel').textContent =
    `Position : ${observer.lat.toFixed(2)}, ${observer.lon.toFixed(2)}`;
  refresh();
});

$('#visibleOnly').onchange = render;

$('#notifBtn').onclick = () => {
  Notification.requestPermission().then(p => {
    if(p === 'granted') alert('Notifications activées ! Vous serez prévenu 10 min avant chaque passage visible.');
  });
};

setInterval(() => {
  if(Notification.permission !== 'granted' || !nextPass) return;
  const diff = nextPass - new Date();
  if(diff > 0 && diff < 10*60000){
    const p = passes.find(x => new Date(x.aos.time).getTime() === nextPass.getTime());
    if(p && p.visible){
      const key = 'notif_'+nextPass.toISOString();
      if(!sessionStorage.getItem(key)){
        new Notification('🛰️ ISS bientôt visible !', {
          body: `Passage dans ${Math.round(diff/60000)} min · élévation max ${p.tca.elevationDeg.toFixed(0)}°`
        });
        sessionStorage.setItem(key,'1');
      }
    }
  }
}, 30000);

// ===== Init =====
async function refresh(){
  const tle = await loadTLE();
  currentTLE = tle;
  passes = computePasses(tle);
  passes.sort((a,b) => new Date(a.aos.time) - new Date(b.aos.time));
  selectedIndex = -1;
  render();
  $('#skyMap').innerHTML = '';
  $('#skyMapInfo').textContent = 'Sélectionnez un passage ci‑dessous.';
}

refresh().catch(err => {
  $('#list').innerHTML = `<p style="color:#f87171">Erreur : ${err.message}</p>`;
});
