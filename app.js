// Cadence — offline player for your own music files.
// Everything (library, playlists, audio) is stored on this device; nothing is uploaded.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const fmt = s => {
  if (!isFinite(s) || s == null || s < 0) return '–:––';
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
const hue = str => { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; };
const shuffleArr = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const AUDIO_EXT = /\.(mp3|m4a|m4b|aac|flac|wav|ogg|oga|opus|weba)$/i;
const isDesktop = () => matchMedia('(min-width: 769px)').matches;

/* ---------------- icons ---------------- */
const stroke = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const fill = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ${extra}>${d}</svg>`;
const NEXT = '<path d="M5 5.2v13.6a.8.8 0 0 0 1.25.66L16 13v5.5a1 1 0 0 0 2 0v-13a1 1 0 0 0-2 0V11L6.25 4.54A.8.8 0 0 0 5 5.2z"/>';
const ICONS = {
  play: fill('<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/>'),
  pause: fill('<rect x="5.5" y="4" width="4.5" height="16" rx="1.2"/><rect x="14" y="4" width="4.5" height="16" rx="1.2"/>'),
  next: fill(NEXT),
  prev: fill(NEXT, 'style="transform:scaleX(-1)"'),
  shuffle: stroke('<path d="M3 7h3.5c2 0 3.3 1 4.4 2.6l2.2 4.8c1.1 1.6 2.4 2.6 4.4 2.6H21M3 17h3.5c1.4 0 2.5-.5 3.4-1.4M21 7h-3.5c-1.4 0-2.5.5-3.4 1.4M18 4l3 3-3 3M18 14l3 3-3 3"/>'),
  repeat: stroke('<path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3"/>'),
  repeat1: stroke('<path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3M11 10.5l1.5-1v5"/>'),
  heart: stroke('<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.7 3.6 4.5 7 4.5c2 0 3.6 1 5 2.9 1.4-1.9 3-2.9 5-2.9 3.4 0 5.5 3.2 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"/>'),
  home: stroke('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  search: stroke('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
  library: stroke('<path d="M4 4v16M9 4v16M14 5l5 15"/>'),
  plus: stroke('<path d="M12 5v14M5 12h14"/>'),
  dots: fill('<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>'),
  queue: stroke('<path d="M3 6h13M3 12h13M3 18h8"/><path d="M17 14v6l5-3z" fill="currentColor"/>'),
  volume: stroke('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>'),
  down: stroke('<path d="m6 9 6 6 6-6"/>'),
  settings: stroke('<path d="M4 6h8M20 6h-2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2.2"/><circle cx="9" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>'),
  list: stroke('<path d="M3 6h18M3 12h18M3 18h12"/>'),
  note: stroke('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  trash: stroke('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  folder: stroke('<path d="M3 6a1 1 0 0 1 1-1h5l2 2.500h9a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>'),
  file: stroke('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5"/>'),
  user: stroke('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.600-6 8-6s8 2 8 6"/>'),
  disc: stroke('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.500"/>'),
  x: stroke('<path d="M6 6l12 12M18 6 6 18"/>'),
  mic: stroke('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  radio: stroke('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l9-5M15 12h3M15 16h3"/><circle cx="8.500" cy="14" r="2.500"/>'),
  globe: stroke('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/>'),
  check: stroke('<path d="M5 12.500l4.500 4.500L19 7.500"/>'),
  grip: fill('<circle cx="9" cy="6" r="1.600"/><circle cx="15" cy="6" r="1.600"/><circle cx="9" cy="12" r="1.600"/><circle cx="15" cy="12" r="1.600"/><circle cx="9" cy="18" r="1.600"/><circle cx="15" cy="18" r="1.600"/>'),
  tag: stroke('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.500"/>'),
  spark: stroke('<path d="M12 3l2.200 5.800L20 11l-5.800 2.200L12 19l-2.200-5.800L4 11l5.800-2.200z"/>'),
  car: stroke('<path d="M4 16v-3l2-5.500A2 2 0 0 1 7.900 6h8.200a2 2 0 0 1 1.900 1.500L20 13v3M4 16h16M4 16v2.500M20 16v2.500M3.500 12.500h17"/><circle cx="7.500" cy="14.500" r="1"/><circle cx="16.500" cy="14.500" r="1"/>'),
  chart: stroke('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'),
  out: stroke('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  yt: stroke('<rect x="2.500" y="5" width="19" height="14" rx="4"/><path d="M10 9.500v5l4.500-2.500z" fill="currentColor"/>'),
  share: stroke('<circle cx="18" cy="5" r="2.500"/><circle cx="6" cy="12" r="2.500"/><circle cx="18" cy="19" r="2.500"/><path d="M8.200 10.900l7.600-4.600M8.200 13.100l7.600 4.600"/>'),
  moon: stroke('<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>'),
  up: stroke('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  dn: stroke('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  text: stroke('<path d="M4 6h16M4 11h12M4 16h16M4 21h8"/>'),
  clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  save: stroke('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
  edit: stroke('<path d="M4 20h4L19 9l-4-4L4 16zM13.500 6.500l4 4"/>'),
};
const ic = n => ICONS[n] || '';

/* ---------------- IndexedDB ---------------- */
let db;
const openDB = () => new Promise((res, rej) => {
  const r = indexedDB.open('cadence', 1);
  r.onupgradeneeded = () => {
    const d = r.result;
    d.createObjectStore('tracks', { keyPath: 'id' });
    d.createObjectStore('files');      // id -> Blob (copied) or FileSystemFileHandle (linked folder)
    d.createObjectStore('art');        // artId -> Blob thumbnail
    d.createObjectStore('playlists', { keyPath: 'id' });
    d.createObjectStore('kv');
  };
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const rq = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const store = (s, mode) => db.transaction(s, mode).objectStore(s);
const idb = {
  get: (s, k) => rq(store(s).get(k)),
  all: s => rq(store(s).getAll()),
  keys: s => rq(store(s).getAllKeys()),
  put: (s, v, k) => rq(store(s, 'readwrite').put(v, k)),
  del: (s, k) => rq(store(s, 'readwrite').delete(k)),
  clear: s => rq(store(s, 'readwrite').clear()),
};

/* ---------------- state ---------------- */
const S = {
  tracks: new Map(), albums: new Map(), artists: new Map(), playlists: [],
  artUrls: new Map(), folders: [],
  queue: [], qIndex: -1, baseQueue: null, shuffle: false, repeat: 'off',
  loadedId: null, resumeAt: 0, sort: 'title', q: '',
  remote: new Map(), pods: [], stations: [], dl: {}, epos: {}, podQ: '', podGenre: '', radQ: '', ia: [], iaQ: '', iaSet: 'live',
  hide: { folders: [], minSecs: 0 }, shownList: [],
  radCC: null, radTag: '', yt: { key: '', clientId: '' }, ytSaved: [], ytQ: '', ytList: [], ytIdx: -1, volume: 1, hist: [], saved: {}, sel: new Set(), theme: { mode: 'dark', accent: '#ff7a59' }, statP: 30,
  fx: { eq: false, preset: 'Flat', bands: [0, 0, 0, 0, 0], xfade: 0, gapless: matchMedia('(hover: hover)').matches, level: false, rate: 1, skipSilence: false },
};
// A queue entry is either a library track or a remote item (podcast episode / radio station).
const T = id => S.tracks.get(id) || S.remote.get(id);
const has = id => S.tracks.has(id) || S.remote.has(id);
const rowsOf = id => $$('.row').filter(r => r.dataset.id === id);
// Each theme sets the whole palette; the accent can still be changed on top of it.
// ---- version and links (bump APP_VERSION together with VERSION in sw.js and ?v= in index.html) ----
const APP_VERSION = 29;
const LINKS = {
  feedback: '',   // Google Form for "Send feedback" (button hidden until set)
  donate: '',     // PayPal.me link for "Support the app" (button hidden until set)
};
const RELEASES = [
  { v: 29, date: '2026-11-12', notes: ['Share playlists as a link: the songs your friend has play from their own library, the rest open on YouTube Music'] },
  { v: 28, date: '2026-11-12', notes: ['Song radio: start from any song (⋯ → Song radio) or artist (Radio button) for an endless mix of similar music from your library'] },
  { v: 27, date: '2026-11-12', notes: ['Folder view: browse your music the way it is stored (Library → Folders)', 'Hide folders, and clips under 30 seconds, 1 or 2 minutes, from your library (Settings → Hide songs)'] },
  { v: 26, date: '2026-11-12', notes: ['Version number and this What’s new page', 'Updates now install with one tap on Restart, or by themselves when you open the app', 'Send feedback and Support the app buttons in Settings'] },
  { v: 25, date: '2026-11-12', notes: ['Top 50 podcast charts for 19 categories, for your country'] },
  { v: 24, date: '2026-11-11', notes: ['Linked folders: every song is added at once; names, lengths and covers are filled in afterwards in the background'] },
  { v: 22, date: '2026-11-11', notes: ['Fixed a blank screen on start with Match album art on', 'A recovery screen if the app ever fails to start'] },
  { v: 20, date: '2026-11-11', notes: ['Eight themes and a Match album art colour option'] },
  { v: 18, date: '2026-11-11', notes: ['The phone’s Back button closes the screen in front instead of the app'] },
];
const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
function showWhatsNew() {
  const d = $('#lyr'); lyrLive = null; $('.lrc', d).hidden = true; $('pre', d).hidden = false;
  $('h3', d).textContent = 'What’s new';
  $('pre', d).textContent = RELEASES.map(r => `Version ${r.v} · ${fmtDate(r.date)}\n${r.notes.map(n => '• ' + n).join('\n')}`).join('\n\n');
  $('.lyr-src', d).textContent = `You have version ${APP_VERSION}.`;
  d.showModal(); $('pre', d).scrollTop = 0;
}
const THEMES = {
  dark:     { name: 'Midnight', tone: 'dark',  bg: '#0e0e12', panel: '#15151b', raised: '#1d1d25', accent: '#ff7a59' },
  oled:     { name: 'Pure black', tone: 'dark', bg: '#000000', panel: '#0b0b0b', raised: '#161616', accent: '#5b9dff' },
  ocean:    { name: 'Ocean',    tone: 'dark',  bg: '#07131f', panel: '#0c1d2e', raised: '#12283d', accent: '#4cc9f0' },
  forest:   { name: 'Forest',   tone: 'dark',  bg: '#0b1410', panel: '#111e18', raised: '#182920', accent: '#7bd389' },
  sunset:   { name: 'Sunset',   tone: 'dark',  bg: '#1a0f1f', panel: '#24142b', raised: '#301a38', accent: '#ff8a5b' },
  neon:     { name: 'Neon',     tone: 'dark',  bg: '#0a0618', panel: '#120b26', raised: '#1a1036', accent: '#ff2fd6' },
  light:    { name: 'Daylight', tone: 'light', bg: '#f5f4f0', panel: '#eceae5', raised: '#e1dfd9', accent: '#e8633f' },
  vinyl:    { name: 'Vinyl',    tone: 'light', bg: '#f3e9d8', panel: '#eadcc4', raised: '#e0cfb2', accent: '#b5541c' },
};
const ACCENTS = { Coral: '#ff7a59', Blue: '#5b9dff', Sky: '#4cc9f0', Green: '#3ddc97', Purple: '#a98bfa', Pink: '#ff6fae', Magenta: '#ff2fd6', Gold: '#f5b942', Rust: '#b5541c' };
const artTint = new Map();
// Pull a lively colour out of a cover, for the "Match album art" option.
async function tintFrom(url) {
  if (artTint.has(url)) return artTint.get(url);
  let hex = null;
  try {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = url; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 24, 24);
    const d = g.getImageData(0, 0, 24, 24).data; let best = null, score = -1;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, gg = d[i + 1] / 255, bb = d[i + 2] / 255, mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb), l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
      const sc = sat * (1 - Math.abs(l - 0.5) * 1.6); if (sc > score) { score = sc; best = [r, gg, bb, mx, mn, sat]; }
    }
    if (best && score > 0.08) {
      const [r, gg, bb, mx, mn] = best; let h = 0;
      if (mx !== mn) { const dd = mx - mn; h = mx === r ? ((gg - bb) / dd + (gg < bb ? 6 : 0)) : mx === gg ? (bb - r) / dd + 2 : (r - gg) / dd + 4; h *= 60; }
      hex = `hsl(${Math.round(h)} 78% ${THEMES[S.theme.mode]?.tone === 'light' ? 40 : 62}%)`;
    }
  } catch { /* a cover from a site that doesn't allow this: keep the theme colour */ }
  artTint.set(url, hex); return hex;
}
let tintFor = null;
function applyTheme() {
  const r = document.documentElement, th = THEMES[S.theme.mode] || THEMES.dark;
  r.dataset.theme = S.theme.mode; r.dataset.tone = th.tone; r.style.setProperty('--accent', S.theme.accent);
  $('meta[name=theme-color]').content = th.bg;
  try { localStorage.setItem('cadence-theme', JSON.stringify(S.theme)); } catch {}
  tintFor = null; if (S.theme.auto && appReady) syncTint();
}
let appReady = false;
function syncTint() {
  if (!S.theme.auto || !appReady) return;
  const t = current(), url = t && S.artUrls.get(t.artId);
  if (url === tintFor) return; tintFor = url;
  if (!url) return document.documentElement.style.setProperty('--accent', S.theme.accent);
  tintFrom(url).then(c => { if (tintFor === url) document.documentElement.style.setProperty('--accent', c || S.theme.accent); });
}
try { const saved = JSON.parse(localStorage.getItem('cadence-theme')); if (THEMES[saved?.mode] && /^#[0-9a-f]{6}$/i.test(saved.accent)) S.theme = { auto: false, ...saved }; } catch {}
applyTheme();
let audio = $('#audio');   // the element currently in charge; see the playback section
const view = $('#view');
const current = () => T(S.queue[S.qIndex]);
const playing = () => !!S.loadedId && !audio.paused;

// Songs in hidden folders, or shorter than the chosen length, stay in the app but are left out of
// the library, search, mixes and shuffle.
const folderKey = t => t.folderId && t.path ? `${t.folderId}|${t.path}` : null;
function isHidden(t) {
  if (S.hide.minSecs && t.duration && t.duration < S.hide.minSecs) return true;
  const k = folderKey(t); return !!k && S.hide.folders.some(h => k.startsWith(h));
}
const shown = () => S.shownList;
function rebuild() {
  S.albums = new Map(); S.artists = new Map();
  S.shownList = [...S.tracks.values()].filter(t => !isHidden(t));
  for (const t of S.shownList) {
    let al = S.albums.get(t.albumKey);
    if (!al) S.albums.set(t.albumKey, al = { key: t.albumKey, name: t.album || 'Unknown album', artist: t.albumArtist || t.artist || 'Unknown artist', year: t.year, artId: t.artId, tracks: [], addedAt: 0 });
    al.tracks.push(t); al.addedAt = Math.max(al.addedAt, t.addedAt);
    if (!S.artUrls.has(al.artId) && S.artUrls.has(t.artId)) al.artId = t.artId;
    const name = t.albumArtist || t.artist || 'Unknown artist';
    let ar = S.artists.get(norm(name));
    if (!ar) S.artists.set(norm(name), ar = { key: norm(name), name, tracks: [], artId: null });
    ar.tracks.push(t);
    if (!ar.artId && S.artUrls.has(t.artId)) ar.artId = t.artId;
  }
  const byTrack = (a, b) => (a.discNo || 1) - (b.discNo || 1) || (a.trackNo || 999) - (b.trackNo || 999) || a.title.localeCompare(b.title);
  for (const al of S.albums.values()) al.tracks.sort(byTrack);
}

const SORTS = {
  title: (a, b) => a.title.localeCompare(b.title),
  artist: (a, b) => (a.artist || '').localeCompare(b.artist || '') || (a.album || '').localeCompare(b.album || '') || (a.trackNo || 0) - (b.trackNo || 0),
  album: (a, b) => (a.album || '').localeCompare(b.album || '') || (a.discNo || 1) - (b.discNo || 1) || (a.trackNo || 0) - (b.trackNo || 0),
  recent: (a, b) => b.addedAt - a.addedAt,
};
const allSongIds = () => [...shown()].sort(SORTS[S.sort] || SORTS.title).map(t => t.id);

/* ---------------- small UI helpers ---------------- */
let toastTimer;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function artStyle(artId, seed) {
  const u = S.artUrls.get(artId);
  if (u) return `background-image:url('${u}')`;
  const h = hue(seed || artId || '');
  return `background:linear-gradient(135deg,hsl(${h} 45% 34%),hsl(${(h + 50) % 360} 50% 18%))`;
}
const artDiv = (artId, seed, cls = '', icon = 'note') =>
  `<div class="art ${cls}" style="${artStyle(artId, seed)}">${S.artUrls.has(artId) ? '' : ic(icon)}</div>`;
function setArt(el, t) {
  el.style.cssText = t ? artStyle(t.artId, t.album || t.title) : 'background:var(--raised)';
  el.innerHTML = t && S.artUrls.has(t.artId) ? '' : ic('note');
}

let lastPointer = null;
function openMenu(items, ev, title) {
  items = items.filter(Boolean);
  if (ev) lastPointer = { clientX: ev.clientX, clientY: ev.clientY };
  const m = $('#menu');
  m.innerHTML = (title ? `<div class="menu-title">${esc(title)}</div>` : '') +
    items.map((it, i) => `<button data-mi="${i}" class="${it.danger ? 'danger' : ''}">${ic(it.icon)}<span>${esc(it.label)}</span></button>`).join('');
  m._items = items; m.hidden = false; $('#backdrop').hidden = false; overlayOpened();
  m.style.left = m.style.top = '';
  if (isDesktop() && lastPointer) {
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(8, Math.min(lastPointer.clientX, innerWidth - r.width - 8)) + 'px';
    m.style.top = Math.max(8, Math.min(lastPointer.clientY, innerHeight - r.height - 8)) + 'px';
  }
}
function closeMenu() { if ($('#menu').hidden) return; $('#menu').hidden = true; $('#backdrop').hidden = true; overlayClosed(); }
$('#backdrop').addEventListener('click', closeMenu);
$('#menu').addEventListener('click', e => {
  const b = e.target.closest('[data-mi]'); if (!b) return;
  const it = $('#menu')._items[+b.dataset.mi]; closeMenu(); it.fn();
});

function ask({ title, text = '', input = null, ok = 'OK', danger = false }) {
  const d = $('#dlg'), inp = $('input', d), okBtn = $('button[value=ok]', d);
  $('h3', d).textContent = title; $('p', d).textContent = text; $('p', d).hidden = !text;
  inp.hidden = input === null; inp.value = input || ''; inp.required = input !== null;
  okBtn.textContent = ok; okBtn.classList.toggle('danger', danger);
  d.returnValue = 'cancel';
  d.showModal(); if (input !== null) { inp.focus(); inp.select(); }
  return new Promise(res => d.addEventListener('close', () => {
    res(d.returnValue === 'ok' ? (input !== null ? inp.value.trim() : true) : null);
  }, { once: true }));
}

/* ---------------- importing ---------------- */
let importing = false;
function setBanner(html) { const b = $('#banner'); b.hidden = !html; b.innerHTML = html || ''; }

// Best guess at a song's details from where it sits: ".../Artist/Album/03 Title.mp3" or "Artist - Title.mp3".
function namesFromPath(path) {
  const parts = path.split('/'), file = parts.pop(), fb = fallbackTags(file);
  const folder = parts.at(-1) || '', up = parts.at(-2) || '';
  const generic = /^(music|songs|mp3s?|audio|downloads?|various|misc|new folder|unknown.*|disc ?\d+|cd ?\d+)$/i;
  const album = generic.test(folder) ? '' : folder.replace(/\s*[\[(](disc|cd) ?\d+[\])]\s*$/i, '').trim();
  const artist = fb.artist || (up && !generic.test(up) && !/^(rock|pop|jazz|country|dance|classical|hip ?hop|rap|folk|irish|soul|blues|reggae|metal|indie)( ?\d+)?$/i.test(up) ? up : '');
  const no = /^(\d{1,3})[\s.\-_]/.exec(file.replace(/^\d-(?=\d)/, ''));
  return { title: fb.title, artist, album, trackNo: no ? +no[1] : null };
}
function fallbackTags(name) {
  const base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const m = base.match(/^(?:\d{1,3}[\s.\-]+)?(.+?)\s+-\s+(.+)$/);
  return m ? { artist: m[1].trim(), title: m[2].trim() } : { title: base.replace(/^\d{1,3}[\s.\-]+/, '') || base };
}
async function makeThumb(pic) {
  const blob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
  try {
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, 512 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(b => r(b || blob), 'image/jpeg', 0.86));
  } catch { return blob; }
}

// items: [{ file }] (copied into the app) or [{ handle, folderId }] (linked, read in place)
// Imports run several files at a time, keep the screen awake, and can be interrupted at any
// point: every song is saved as soon as it is read, and a linked folder carries on where it stopped.
// Tags and covers sit at the start of almost every music file, so read just that part: reading
// whole files is slow on phone storage. Files whose tags are elsewhere fall back to a full read.
async function readTags(mm, file, quick = false) {
  const opts = { skipPostHeaders: true, duration: false };
  const HEAD = quick ? 512 * 1024 : 4 * 1024 * 1024;
  if (file.size <= HEAD || !mm.parseBuffer) return mm.parseBlob(file, opts);
  let buf = new Uint8Array(await file.slice(0, HEAD).arrayBuffer());
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {   // "ID3": a big cover can make the tag longer than that
    const size = ((buf[6] & 127) << 21) | ((buf[7] & 127) << 14) | ((buf[8] & 127) << 7) | (buf[9] & 127);
    if (size + 10 + 65536 > HEAD && size < (quick ? 3e6 : 40e6)) buf = new Uint8Array(await file.slice(0, Math.min(file.size, size + 10 + 65536)).arrayBuffer());
  }
  try {
    const meta = await mm.parseBuffer(buf, { mimeType: file.type || undefined, size: file.size, path: file.name }, opts);
    if (meta.common?.title || meta.common?.artist || meta.format?.container) return meta;
  } catch { /* tags not in the first part (some M4A files): read it all */ }
  if (quick && file.size > 25e6) throw new Error('tags not near the start');
  return mm.parseBlob(file, opts);
}
// No single file may hold up an import: some phone storage never answers for certain files.
const IMPORT_WAIT = { file: 20000, tags: 15000, art: 8000, ...(window.CADENCE_TEST_WAIT || {}) };
const within = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timed out'), { name: 'TimeoutError' })), ms))]);
// Adds songs either from a list of picked files, or straight from a linked folder while it is
// being looked through. Four files are read at a time. Every song is saved the moment it is read,
// and for a folder, each sub-folder is marked done once all of it is in, so if the app is closed,
// the next run skips the finished sub-folders without listing them again.
async function importItems(items, folder = null) {
  if (importing) { toast('An import is already running'); return null; }
  if (!folder && !items.length) { toast('No audio files found'); return { added: 0 }; }
  importing = true;
  navigator.storage?.persist?.().catch(() => {});
  let mm = null;
  try { mm = await import('./vendor/music-metadata.js'); } catch (e) { console.warn('tag reader unavailable', e); }
  const all = [...S.tracks.values()];
  const seen = new Set(all.map(t => `${t.fileName}|${t.size}`));
  // Files already taken from a linked folder are recognised by their place in it, without opening them again.
  const knownPath = new Set(all.filter(t => t.folderId && t.path).map(t => `${t.folderId}|${t.path}`));
  const legacy = new Map();   // songs linked before places in the folder were recorded
  for (const t of all) if (t.folderId && !t.path) { const k = `${t.folderId}|${t.fileName}`; (legacy.get(k) || legacy.set(k, []).get(k)).push(t); }
  const artBusy = new Set(), unreadable = [];
  let added = 0, skipped = 0, failed = 0, done = 0, found = 0, stop = false, full = false, lastDraw = 0, lastName = 0, walking = true;   // until the folder walk or the file list has handed everything over

  let lock = null;
  const keepAwake = async () => { try { if (importing && !document.hidden) lock = await navigator.wakeLock?.request('screen'); } catch {} };
  document.addEventListener('visibilitychange', keepAwake); keepAwake();
  setBanner(`<span id="imp-text">${folder ? `Adding music from “${esc(folder.name)}”…` : 'Adding music…'}</span><div class="bar"><i></i></div><button class="btn" id="imp-stop">Stop</button><span class="muted imp-file" id="imp-file"></span><span class="muted" style="flex-basis:100%;font-size:12px">You can keep using the app. If you close it, it carries on from here next time.</span>`);
  $('#imp-stop').onclick = () => { stop = true; wake(); };
  const progress = () => {
    const txt = $('#imp-text'); if (txt) txt.textContent = walking ? `Adding music… ${done} done · ${found} found so far` : `Adding music… ${done} / ${found}`;
    const bar = $('#banner .bar i'); if (bar) bar.style.width = (found ? done / found * 100 : 0) + '%';
  };

  // work queue shared by the folder walk (or the file list) and the four readers
  const queue = []; let waiters = [];
  const wake = () => { const w = waiters; waiters = []; w.forEach(r => r()); };
  const push = it => { queue.push(it); found++; wake(); };
  const take = async () => {
    for (;;) {
      if (stop) { while (queue.length) queue.shift().resolve?.(); return null; }
      if (queue.length) return queue.shift();
      if (!walking) return null;
      await new Promise(r => waiters.push(r));
    }
  };

  const one = async it => {
    const label = it.path || it.file?.name || it.handle?.name || '';
    try {
      if (it.path && it.handle) {   // a song from an older import of this folder: claim it by name without opening the file
        const olds = legacy.get(`${it.folderId}|${it.handle.name}`)?.filter(t => !t.path);
        if (olds?.length === 1) { olds[0].path = it.path; await idb.put('tracks', olds[0]); skipped++; return; }
      }
      if (it.path && it.handle && !legacy.has(`${it.folderId}|${it.handle.name}`)) {
        // Linked folder: add the song at once, named from its file and folder names. The details
        // inside the file are read later in the background, because opening files can be very slow.
        const n = namesFromPath(it.path), id = uid();
        const albumKey = `${norm(n.artist)}::${norm(n.album)}`;
        const t = { id, title: n.title, artist: n.artist, albumArtist: '', album: n.album, albumKey, artId: n.album ? albumKey : `t::${id}`,
          year: null, trackNo: n.trackNo, discNo: null, genre: '', duration: null, fileName: it.handle.name, size: null, linked: true,
          folderId: it.folderId, path: it.path, addedAt: Date.now(), liked: 0, plays: 0, lastPlayed: 0, tagsPending: true };
        await idb.put('files', it.handle, id); await idb.put('tracks', t);
        S.tracks.set(id, t); added++; return;
      }
      if (Date.now() - lastName > 400) { lastName = Date.now(); const el = $('#imp-file'); if (el) el.textContent = 'Reading ' + label; }
      let file;
      try { file = it.file || await within(it.handle.getFile(), IMPORT_WAIT.file); }
      catch (e) { unreadable.push(label); console.warn('could not open', label, e); failed++; return; }
      if (!(AUDIO_EXT.test(file.name) || file.type.startsWith('audio/'))) return;
      if (it.path) {
        const old = legacy.get(`${it.folderId}|${file.name}`)?.find(t => (t.size == null || t.size === file.size) && !t.path);   // size is unknown until the details pass has read the file
        if (old) { old.path = it.path; await idb.put('tracks', old); skipped++; return; }
      }
      const sig = `${file.name}|${file.size}`;
      if (seen.has(sig)) { skipped++; return; }
      seen.add(sig);
      let c = {}, f = {};
      // Tags that take too long to read are skipped; the song is still added, named from its file name.
      if (mm) { try { const meta = await within(readTags(mm, file), IMPORT_WAIT.tags); c = meta.common || {}; f = meta.format || {}; } catch (e) { if (e?.name === 'TimeoutError') console.warn('tags timed out', label); } }
      const fb = fallbackTags(file.name);
      const id = uid();
      const artist = c.artist || fb.artist || '';
      const albumArtist = c.albumartist || '';
      const album = c.album || '';
      const albumKey = `${norm(albumArtist || artist)}::${norm(album)}`;
      const t = {
        id, title: c.title || fb.title, artist, albumArtist, album, albumKey,
        artId: album ? albumKey : `t::${id}`,
        year: c.year || null, trackNo: c.track?.no || null, discNo: c.disk?.no || null,
        genre: c.genre?.[0] || '', duration: f.duration || null,
        fileName: file.name, size: file.size, linked: !!it.handle, folderId: it.folderId || null, path: it.path || null,
        addedAt: Date.now(), liked: 0, plays: 0, lastPlayed: 0,
      };
      await idb.put('files', it.handle || file, id);
      if (c.picture?.length && !S.artUrls.has(t.artId) && !artBusy.has(t.artId)) {
        artBusy.add(t.artId);
        try {
          const thumb = await within(makeThumb(c.picture[0]), IMPORT_WAIT.art);
          await idb.put('art', thumb, t.artId);
          S.artUrls.set(t.artId, URL.createObjectURL(thumb));
        } catch (e) { artBusy.delete(t.artId); console.warn('cover skipped', label, e); }
      }
      await idb.put('tracks', t);
      S.tracks.set(id, t); added++;
    } catch (e) {
      console.warn('import failed', e);
      if (e?.name === 'QuotaExceededError') { full = stop = true; wake(); } else failed++;
    } finally {
      done++; it.resolve?.(); progress();
      if (added && Date.now() - lastDraw > 4000 && view.scrollTop < 10 && ['home', 'library'].includes(page())) { lastDraw = Date.now(); rebuild(); route(); }
    }
  };
  const readers = Array.from({ length: 4 }, async () => { for (let it; (it = await take());) await one(it); });

  let finished = !folder, walkFailed = false;
  if (folder) {
    const doneDirs = new Set(folder.doneDirs || []);
    let lastSave = 0;
    const saveProgress = async force => { if (force || Date.now() - lastSave > 3000) { lastSave = Date.now(); folder.doneDirs = [...doneDirs]; await saveFolders(); } };
    const walk = async (dir, prefix) => {
      if (stop) return false;
      if (doneDirs.has(prefix)) return true;   // finished on an earlier run: not even listed again
      const files = [], subs = [];
      for await (const h of dir.values()) { if (stop) return false; if (h.kind === 'file') { if (AUDIO_EXT.test(h.name)) files.push(h); } else subs.push(h); }
      const waits = [];
      for (const h of files) {
        const path = prefix + h.name;
        if (knownPath.has(`${folder.id}|${path}`)) { skipped++; continue; }
        waits.push(new Promise(res => push({ handle: h, path, folderId: folder.id, resolve: res })));
      }
      for (const sd of subs) if (!await walk(sd, prefix + sd.name + '/')) return false;
      await Promise.all(waits);
      if (stop) return false;
      for (const sd of subs) doneDirs.delete(prefix + sd.name + '/');   // the parent now covers them
      doneDirs.add(prefix); await saveProgress();
      return true;
    };
    try { finished = await walk(folder.handle, ''); }
    catch (e) { console.warn('folder walk', e); walkFailed = true; }
    walking = false; wake();
  } else {
    for (const it of items) push(it);
    walking = false; wake();
  }
  await Promise.all(readers);

  importing = false; setBanner('');
  document.removeEventListener('visibilitychange', keepAwake); try { await lock?.release(); } catch {}
  if (folder && (finished || (stop && !full))) { folder.pending = false; folder.doneDirs = []; await saveFolders(); }   // done, or stopped on purpose
  rebuild(); route();
  if (walkFailed) toast("Couldn't finish reading that folder. It carries on next time you open the app.");
  if (unreadable.length) {
    ask({ title: `${unreadable.length} file${unreadable.length === 1 ? '' : 's'} could not be opened`, text: `Your phone or computer didn't hand ${unreadable.length === 1 ? 'this file' : 'these files'} over, so ${unreadable.length === 1 ? 'it was' : 'they were'} skipped. This usually means a file is damaged, still downloading, or stored online only. Everything else was added. ${unreadable.slice(0, 8).join(' · ')}${unreadable.length > 8 ? ` and ${unreadable.length - 8} more` : ''}`, ok: 'OK' });
  }
  if (!walkFailed) toast(full ? `Storage is full — stopped after ${added} songs` : added ? `Added ${added} song${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} already in library` : ''}`
    : skipped ? (folder ? 'Everything in that folder is already in your library' : 'Those songs are already in your library') : failed ? 'Could not read those files' : 'No audio files found');
  checkFolderAccess();
  setTimeout(tagPass, 500);
  return { added, stopped: stop };
}

const saveFolders = () => idb.put('kv', S.folders, 'folders').catch(() => {});
async function scanFolder(folder) {
  if (importing) return toast('An import is already running');
  folder.pending = true; await saveFolders();   // stays set until the whole folder is in, so an interrupted run resumes
  await importItems(null, folder);
}
async function addFolder() {
  if (!window.showDirectoryPicker) return $('#dir-input').click();
  let handle;
  try { handle = await showDirectoryPicker({ mode: 'read', id: 'music' }); } catch { return; }
  for (const f of S.folders) if (await f.handle.isSameEntry(handle)) { if (!f.pending) f.doneDirs = []; return scanFolder(f); }
  const folder = { id: uid(), name: handle.name, handle };
  S.folders.push(folder); await saveFolders();
  await scanFolder(folder);
}
async function checkFolderAccess() {
  if (importing || tagging) return;
  for (const f of S.folders) {
    if (await f.handle.queryPermission({ mode: 'read' }) !== 'granted') {
      const unfinished = S.folders.some(x => x.pending);
      setBanner(`<span style="flex:1">${unfinished ? 'Reconnect your music folder to carry on adding your music.' : 'Your linked music folder needs permission again to play.'} Choose “Allow on every visit” if your browser offers it, and you won't be asked again.</span><button class="btn primary" data-act="reconnect">Reconnect</button>`);
      return false;
    }
  }
  if ($('#banner [data-act=reconnect]')) setBanner('');
  return true;
}
// Carry on with any folder whose scan was cut short (app closed, phone slept, tab reloaded).
let tagging = false, tagStop = false;
async function tagPass() {
  if (tagging || importing) return;
  const todo = [...S.tracks.values()].filter(t => t.tagsPending).sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0) || a.addedAt - b.addedAt);
  if (!todo.length) return;
  for (const f of S.folders) if (await f.handle.queryPermission({ mode: 'read' }) !== 'granted') return;   // asked for again via Reconnect
  tagging = true; tagStop = false;
  let mm = null; try { mm = await import('./vendor/music-metadata.js'); } catch { tagging = false; return; }
  const total = todo.length, unreadable = []; let done = 0, slowOpen = 0, slowRead = 0, next = 0, lastDraw = 0, cur = null, curAt = 0;
  setBanner(`<span id="tag-text">Reading song details…</span><div class="bar"><i></i></div><button class="btn" id="tag-stop">Pause</button><span class="muted imp-file" id="tag-file"></span><span class="muted" style="flex-basis:100%;font-size:12px">All your songs are in and playable. This fills in proper names and covers; you can use the app as normal.</span>`);
  $('#tag-stop').onclick = () => { tagStop = true; };
  const tick = setInterval(() => {
    const el = $('#tag-file'); if (el && cur) el.textContent = `Reading ${cur} · ${Math.round((performance.now() - curAt) / 1000)}s` + (slowOpen + slowRead ? ` · slow files skipped: ${slowOpen} wouldn't open, ${slowRead} too slow to read` : '');
  }, 1000);
  const one = async t => {
    cur = t.path || t.fileName; curAt = performance.now();
    try {
      let file;
      try { file = await within(getFile(t.id), IMPORT_WAIT.file); }
      catch (e) { if (e?.name === 'NotAllowedError') { tagStop = true; return 'retry'; } slowOpen++; unreadable.push(t.path || t.fileName); return; }
      t.size = file.size;
      let meta;
      try { meta = await within(readTags(mm, file, true), IMPORT_WAIT.tags); } catch { slowRead++; return; }
      const c = meta.common || {}, f = meta.format || {};
      if (c.title) t.title = c.title;
      if (c.artist) t.artist = c.artist;
      if (c.albumartist) t.albumArtist = c.albumartist;
      if (c.album) t.album = c.album;
      t.year = c.year || t.year; t.trackNo = c.track?.no || t.trackNo; t.discNo = c.disk?.no || null; t.genre = c.genre?.[0] || t.genre; t.duration = f.duration || t.duration;
      t.albumKey = `${norm(t.albumArtist || t.artist)}::${norm(t.album)}`;
      const artId = t.album ? t.albumKey : `t::${t.id}`;
      if (c.picture?.length && !S.artUrls.has(artId)) {
        try { const thumb = await within(makeThumb(c.picture[0]), IMPORT_WAIT.art); await idb.put('art', thumb, artId); S.artUrls.set(artId, URL.createObjectURL(thumb)); } catch {}
      }
      t.artId = artId;
    } finally {
      if (t.tagsPending && !tagStop) { delete t.tagsPending; await idb.put('tracks', t).catch(() => {}); }
      done++;
      const tx = $('#tag-text'); if (tx) tx.textContent = `Reading song details… ${done} / ${total}`;
      const bar = $('#banner .bar i'); if (bar) bar.style.width = (done / total * 100) + '%';
      if (Date.now() - lastDraw > 5000 && view.scrollTop < 10 && ['home', 'library', 'artist', 'album'].includes(page())) { lastDraw = Date.now(); rebuild(); rerender(); }
    }
  };
  await Promise.all(Array.from({ length: 6 }, async () => { while (!tagStop && !importing && next < total) await one(todo[next++]); }));
  clearInterval(tick); tagging = false;
  if ($('#tag-text')) setBanner('');
  rebuild(); rerender(); syncPlayer();
  if (!tagStop && !importing) {
    toast(`Song details read${slowOpen + slowRead ? ` · ${slowOpen + slowRead} files kept their file names` : ''}`);
    if (unreadable.length) ask({ title: `${unreadable.length} file${unreadable.length === 1 ? '' : 's'} could not be opened`, text: `These stay in your library under their file names, but may not play. This usually means a file is damaged, still downloading, or stored online only. ${unreadable.slice(0, 8).join(' · ')}${unreadable.length > 8 ? ` and ${unreadable.length - 8} more` : ''}`, ok: 'OK' });
  }
  checkFolderAccess();
}
async function resumePending() {
  for (const f of S.folders) {
    if (!f.pending || importing) continue;
    if (await f.handle.queryPermission({ mode: 'read' }) !== 'granted') continue;
    toast('Carrying on adding your music…');
    await scanFolder(f);
  }
  tagPass();
}
$('#file-input').addEventListener('change', e => { const fs = [...e.target.files]; e.target.value = ''; importItems(fs.map(file => ({ file }))); });
$('#dir-input').addEventListener('change', e => { const fs = [...e.target.files].filter(f => AUDIO_EXT.test(f.name)); e.target.value = ''; importItems(fs.map(file => ({ file }))); });

// drag & drop (desktop)
let dragDepth = 0;
addEventListener('dragenter', e => { if (e.dataTransfer?.types.includes('Files')) { dragDepth++; document.body.classList.add('dragging'); } });
addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', async e => {
  e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
  const entries = [...(e.dataTransfer?.items || [])].map(i => i.webkitGetAsEntry?.()).filter(Boolean);
  const files = [];
  const collect = async en => {
    if (en.isFile) { if (AUDIO_EXT.test(en.name)) files.push(await new Promise((r, j) => en.file(r, j))); return; }
    const rd = en.createReader();
    for (;;) { const batch = await new Promise((r, j) => rd.readEntries(r, j)); if (!batch.length) break; for (const b of batch) await collect(b); }
  };
  for (const en of entries) await collect(en).catch(() => {});
  importItems(files.map(file => ({ file })));
});

/* ---------------- playback ---------------- */
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
// Three audio elements. A and B take turns, so the next song can be opened ahead of time
// (gapless) or blended in (crossfade); when sound effects are on, A and B are wired through
// Web Audio. C is never wired: it plays internet streams, which servers rarely allow to be
// processed (a wired cross-origin stream plays as silence).
const elA = audio, elB = new Audio(), elC = new Audio();
const ELS = [elA, elB, elC];
elB.preload = elC.preload = 'auto';
const onAudio = (ev, fn) => ELS.forEach(el => el.addEventListener(ev, e => { if (e.target === audio) fn(e); }));
Object.defineProperty(window, 'player', { get: () => audio, configurable: true });   // the active element, for debugging

let unlocked = false, loadToken = 0, errStreak = 0;
let prepared = null, preparing = false, fadingEl = null, logged = false;
// Mobile browsers only allow audio started by a tap. Prime the elements on the first tap so
// later plays (which happen after async storage reads, or on auto-advance) are allowed.
document.addEventListener('click', () => {
  if (unlocked) return; unlocked = true;
  for (const el of ELS) if (!el.getAttribute('src')) { el.src = SILENCE; el.play().catch(() => {}); }
  if (wantGraph()) ensureGraph();
}, true);

// --- sound effects (equalizer, silence skipping) ---
const EQ_FREQS = [60, 230, 910, 3600, 14000], EQ_LABELS = ['Bass', 'Low mid', 'Mid', 'High mid', 'Treble'];
const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0], 'Bass boost': [7, 4, 0, 0, 0], 'Treble boost': [0, 0, 0, 3, 6], Rock: [5, 2, -1, 2, 4], Pop: [-1, 2, 4, 2, -1],
  Jazz: [3, 1, 0, 2, 3], Classical: [4, 2, 0, 1, 3], Dance: [6, 3, 0, 1, 4], 'Spoken word': [-3, 0, 3, 4, 1],
};
let ac = null, eqNodes = [], preGain = null, analyser = null;
const wantGraph = () => S.fx.eq || S.fx.skipSilence;
function ensureGraph() {
  if (ac) { ac.resume?.().catch(() => {}); return true; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    preGain = ac.createGain();
    eqNodes = EQ_FREQS.map((f, i) => { const n = ac.createBiquadFilter(); n.type = i === 0 ? 'lowshelf' : i === EQ_FREQS.length - 1 ? 'highshelf' : 'peaking'; n.frequency.value = f; n.Q.value = 1; return n; });
    analyser = ac.createAnalyser(); analyser.fftSize = 1024;
    for (const el of [elA, elB]) ac.createMediaElementSource(el).connect(preGain);
    [preGain, ...eqNodes, analyser].reduce((a, b) => (a.connect(b), b)).connect(ac.destination);
    applyEq(); ac.resume?.().catch(() => {});
    // A stream already playing on a wired element would go silent, so move it to the unwired one.
    const t = current();
    if (S.loadedId && t?.url && audio !== elC && !audio._blob) { const at = t.live ? 0 : audio.currentTime, was = !audio.paused; loadCurrent(was, at); }
    return true;
  } catch (e) { console.warn('sound effects unavailable', e); ac = null; return false; }
}
function applyEq() {
  if (!ac) return;
  eqNodes.forEach((n, i) => { n.gain.value = S.fx.eq ? S.fx.bands[i] : 0; });
  preGain.gain.value = S.fx.eq ? Math.pow(10, -Math.max(0, ...S.fx.bands) / 20) : 1;   // headroom so boosts don't distort
}
const saveFx = () => idb.put('kv', S.fx, 'fx').catch(() => {});
let quietSince = 0, skipping = false;
setInterval(() => {
  const t = current();
  const active = S.fx.skipSilence && ac && audio !== elC && t?.kind === 'episode' && S.loadedId && !audio.paused;
  if (active) {
    const buf = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(buf);
    let sum = 0; for (const v of buf) sum += v * v;
    if (Math.sqrt(sum / buf.length) < 0.004) quietSince ||= performance.now(); else quietSince = 0;
  } else quietSince = 0;
  const want = !!quietSince && performance.now() - quietSince > 450;
  if (want !== skipping) { skipping = want; audio.playbackRate = want ? 4 : rateFor(t); }
}, 120);

// --- volume: master × fade × per-song levelling ---
const rateFor = t => t?.kind === 'episode' ? S.fx.rate : 1;
function applyVol(el) { el.volume = Math.max(0, Math.min(1, S.volume * (el._fade ?? 1) * (S.fx.level && el._item?.gain ? el._item.gain : 1))); }
function ramp(el, from, to, secs, done) {
  clearInterval(el._ramp); const t0 = performance.now();
  el._ramp = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / (secs * 1000));
    el._fade = from + (to - from) * k; applyVol(el);
    if (k >= 1) { clearInterval(el._ramp); el._ramp = null; done?.(); }
  }, 40);
}
function stopEl(el) {
  clearInterval(el._ramp); el._ramp = null; el._fade = 1;
  if (fadingEl === el) fadingEl = null;
  el.pause();
  if (el._url) { if (el._blob) URL.revokeObjectURL(el._url); el._url = null; el._blob = false; el.removeAttribute('src'); el.load(); }
}
function chooseEl(local, avoid) {
  const c = ac && !local ? [elC] : [elA, elB];
  if (!avoid && c.includes(audio) && audio !== fadingEl) return audio;
  return c.find(e => e !== avoid && e !== fadingEl) || c.find(e => e !== avoid) || null;
}
// Measure how loud a song is (once), so loud songs can be turned down to match quiet ones.
async function analyseGain(t) {
  if (t.gain != null || t.url || t.size > 30e6 || (t.duration || 0) > 720) return;
  try {
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const pcm = await new Ctx(1, 1, 8000).decodeAudioData(await (await getFile(t.id)).arrayBuffer());
    const d = pcm.getChannelData(0); let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 2) { sum += d[i] * d[i]; n++; }
    const db = 10 * Math.log10(sum / Math.max(1, n) || 1e-9);
    t.gain = Math.pow(10, Math.max(-12, Math.min(0, -18 - db)) / 20);
  } catch (e) { console.warn('volume levelling', e); t.gain = 1; }
  if (S.tracks.has(t.id)) idb.put('tracks', t);
  const el = ELS.find(e => e._item === t);
  if (el && !el._ramp) { const from = el.volume; applyVol(el); const to = el.volume; el.volume = from; smoothVol(el, from, to); }
}
function smoothVol(el, from, to) { const t0 = performance.now(); const id = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 800); if (!el._ramp) el.volume = from + (to - from) * k; if (k >= 1) clearInterval(id); }, 40); }

async function getFile(id) {
  const f = await idb.get('files', id);
  if (!f) throw new Error('missing');
  if (typeof f.getFile !== 'function') return f;
  if (await f.queryPermission({ mode: 'read' }) !== 'granted') {
    checkFolderAccess();
    const e = new Error('permission'); e.name = 'NotAllowedError'; throw e;
  }
  return f.getFile();
}
const sourceFile = t => t.url ? idb.get('files', t.id).catch(() => null) : getFile(t.id);
function dropPrepared() { if (prepared) { const p = prepared; prepared = null; if (p.el !== audio) stopEl(p.el); } }
// Open the next song on the idle element a few seconds early, so the hand-over is instant.
async function prepareNext(ni) {
  const id = S.queue[ni], t = T(id); if (!t || preparing) return;
  preparing = true;
  try {
    const file = await sourceFile(t);
    if (S.queue[nextIndex()] !== id || prepared || (!file && !navigator.onLine)) return;
    const el = chooseEl(!!file, audio);
    if (!el || el === audio || el === fadingEl) return;
    stopEl(el);
    el._item = t; el._blob = !!file; el._url = file ? URL.createObjectURL(file) : t.url;
    el.src = el._url; el.load();
    prepared = { id, el };
  } catch { /* fall back to a normal load */ } finally { preparing = false; }
}
const nextIndex = () => S.qIndex < S.queue.length - 1 ? S.qIndex + 1 : S.repeat === 'all' && S.queue.length > 1 ? 0 : -1;

// fade > 0 blends the new song in over that many seconds while the old one fades out.
async function loadCurrent(autoplay = true, startAt = 0, fade = 0) {
  const t = current(); if (!t) return;
  const token = ++loadToken, old = audio;
  topUpRadio();
  S.resumeAt = 0; logged = false;
  syncPlayer(); saveState();
  let el = null;
  try {
    if (prepared?.id === t.id) { el = prepared.el; prepared = null; }
    else {
      dropPrepared();
      const file = await sourceFile(t);
      if (token !== loadToken) return;
      if (t.url && !file && !navigator.onLine) { S.loadedId = null; stopEl(old); syncPlayer(); return toast('You are offline — this needs the internet'); }
      el = chooseEl(!!file, null) || elA;
      stopEl(el);
      el._item = t; el._blob = !!file; el._url = file ? URL.createObjectURL(file) : t.url;
      el.src = el._url;
    }
    if (el !== old) { if (fade && S.loadedId && !old.paused) { fadingEl = old; ramp(old, old._fade ?? 1, 0, fade, () => stopEl(old)); } else stopEl(old); }
    audio = el; el._fade = fade ? 0 : 1; applyVol(el);
    if (!startAt && t.kind === 'episode' && S.epos[t.id] > 5) startAt = S.epos[t.id];
    S.loadedId = t.id;
    el.defaultPlaybackRate = el.playbackRate = rateFor(t);
    if (startAt) { if (el.readyState >= 1) el.currentTime = startAt; else el.addEventListener('loadedmetadata', () => { el.currentTime = startAt; }, { once: true }); }
    syncPlayer();
    if (autoplay) { ac?.resume?.().catch(() => {}); await el.play(); el._resumeUntil = performance.now() + 2000; if (fade) ramp(el, 0, 1, fade); }
    errStreak = 0;
  } catch (e) {
    if (el) { clearInterval(el._ramp); el._ramp = null; el._fade = 1; applyVol(el); }
    if (token !== loadToken || e?.name === 'AbortError') return;
    if (e?.name === 'NotAllowedError') { toast(t.linked ? 'Reconnect your music folder to play' : 'Tap play to start'); syncPlayer(); return; }
    playbackFailed(t);
  }
}
function playbackFailed(t) {
  toast(t.live ? `“${t.title}” isn't broadcasting right now` : `Can't play “${t.title}”`);
  S.loadedId = null;
  if (++errStreak < 4 && S.qIndex < S.queue.length - 1) { S.qIndex++; loadCurrent(true); } else syncPlayer();
}
// State checks (audio.error / audio.ended) ignore stale events left over from the priming clip.
onAudio('error', () => { const t = current(); if (S.loadedId && t && audio.error) playbackFailed(t); });

function playContext(ids, i = 0, keepRadio = false) {
  if (!keepRadio) S.radio = null;
  ids = ids.filter(has); if (!ids.length) return;
  i = Math.max(0, Math.min(i, ids.length - 1));
  S.baseQueue = [...ids];
  if (S.shuffle) { const first = ids[i]; const rest = ids.filter((_, j) => j !== i); S.queue = [first, ...shuffleArr(rest)]; S.qIndex = 0; }
  else { S.queue = [...ids]; S.qIndex = i; }
  loadCurrent(true);
}
/* ---------------- song radio ---------------- */
// Builds an endless queue of songs like the one you start from, using only your own library:
// same artist, genre, era and folder, and songs you tend to play around it.
function radioPicks(seed, n, exclude) {
  const hist = S.hist, near = new Map();
  // songs played within 30 minutes either side of a play of the seed
  for (let i = 0; i < hist.length; i++) if (hist[i].i === seed.id) {
    for (let j = Math.max(0, i - 15); j < Math.min(hist.length, i + 16); j++) if (j !== i && Math.abs(hist[j].a - hist[i].a) < 1800e3) near.set(hist[j].i, (near.get(hist[j].i) || 0) + 1);
  }
  const g = norm(seed.genre), ar = norm(seed.albumArtist || seed.artist), dir = (seed.path || '').replace(/[^/]*$/, ''), up = dir.replace(/[^/]*\/$/, '');
  const scored = [];
  for (const t of shown()) {
    if (t.id === seed.id || exclude.has(t.id)) continue;
    let sc = Math.random() * 2;
    const tar = norm(t.albumArtist || t.artist);
    if (ar && tar === ar) sc += 5;
    if (g && norm(t.genre) === g) sc += 4;
    if (seed.year && t.year) { const d = Math.abs(seed.year - t.year); sc += d <= 3 ? 2 : d <= 7 ? 1 : 0; }
    if (dir && t.path && t.folderId === seed.folderId) { if (t.path.startsWith(dir)) sc += 2.5; else if (up && t.path.startsWith(up)) sc += 1.5; }
    sc += Math.min(6, (near.get(t.id) || 0) * 2);
    if (t.liked) sc += 1;
    scored.push([sc, t]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  const pool = scored.slice(0, Math.max(n * 4, 60)).map(x => x[1]), out = [], perArtist = new Map();
  let lastArtist = norm(seed.artist);
  // take from the best matches, without long runs of one artist
  while (out.length < n && pool.length) {
    let k = pool.findIndex(t => { const a = norm(t.artist); return a !== lastArtist && (perArtist.get(a) || 0) < Math.max(3, n * 0.3); });
    if (k < 0) k = 0;
    const [t] = pool.splice(k, 1); out.push(t.id); const a = norm(t.artist); perArtist.set(a, (perArtist.get(a) || 0) + 1); lastArtist = a;
  }
  return out;
}
function startRadio(seedId) {
  const seed = S.tracks.get(seedId); if (!seed) return;
  const ids = [seed.id, ...radioPicks(seed, 30, new Set())];
  if (ids.length < 2) return toast('Add more music to make a radio from this song');
  S.shuffle = false; S.radio = { seed: seed.id, title: seed.title };
  playContext(ids, 0, true);
  toast(`Song radio: ${seed.title}`);
  if (page() === 'queue') rerender();
}
// keep a radio going: top the queue up as it runs low
function topUpRadio() {
  if (!S.radio || S.queue.length - S.qIndex > 5) return;
  const seed = S.tracks.get(S.radio.seed); if (!seed) return;
  const more = radioPicks(seed, 20, new Set(S.queue.slice(-150)));
  if (more.length) { S.queue.push(...more); if (S.baseQueue) S.baseQueue.push(...more); saveState(); if (page() === 'queue') rerender(); }
}
function shufflePlay(ids) { if (!ids.length) return; S.shuffle = true; playContext(ids, Math.floor(Math.random() * ids.length)); }
function toggle() {
  if (!S.loadedId) {
    if (current()) loadCurrent(true, S.resumeAt);
    else if (S.tracks.size) playContext(allSongIds(), 0);
    return;
  }
  if (audio.paused) { ac?.resume?.().catch(() => {}); audio.play().catch(() => {}); } else pauseNow();
}
function next(auto = false) {
  if (auto && S.repeat === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  if (S.qIndex < S.queue.length - 1) { S.qIndex++; loadCurrent(true); }
  else if (S.repeat !== 'off' && S.queue.length) { S.qIndex = 0; loadCurrent(true); }
  else if (auto) { S.qIndex = 0; loadCurrent(false); }
}
function prev() {
  if (!S.queue.length) return;
  if (audio.currentTime > 3 || S.qIndex === 0) { audio.currentTime = 0; return; }
  S.qIndex--; loadCurrent(true);
}
function seekBy(secs) { if (S.loadedId && isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration - 1, audio.currentTime + secs)); }
function toggleShuffle() {
  S.shuffle = !S.shuffle;
  const cur = S.queue[S.qIndex];
  if (S.shuffle) S.queue = [...S.queue.slice(0, S.qIndex + 1), ...shuffleArr(S.queue.slice(S.qIndex + 1))];
  else if (S.baseQueue) { const i = S.baseQueue.indexOf(cur); if (i >= 0) { S.queue = [...S.baseQueue]; S.qIndex = i; } }
  dropPrepared(); syncPlayer(); saveState(); if (page() === 'queue') route();
}
function cycleRepeat() { S.repeat = { off: 'all', all: 'one', one: 'off' }[S.repeat]; syncPlayer(); saveState(); }
function enqueue(ids, nextUp) {
  ids = ids.filter(has); if (!ids.length) return;
  if (!S.queue.length) { S.queue = [...ids]; S.qIndex = 0; S.baseQueue = [...ids]; loadCurrent(false); }
  else if (nextUp) { S.queue.splice(S.qIndex + 1, 0, ...ids); dropPrepared(); }
  else S.queue.push(...ids);
  toast(nextUp ? 'Playing next' : 'Added to queue'); saveState(); if (page() === 'queue') route();
}

onAudio('ended', () => {
  if (!S.loadedId || !audio.ended) return;
  if (current()?.kind === 'episode') { delete S.epos[current().id]; idb.put('kv', S.epos, 'epos').catch(() => {}); }
  if (sleepEOT) {
    setSleep(0, true); toast('Sleep timer ended');
    if (S.qIndex < S.queue.length - 1) { S.qIndex++; loadCurrent(false); } else syncPlayer();
    return;
  }
  next(true);
});
let countedLoad = 0;
onAudio('play', () => {
  try { ytPlayer?.pauseVideo?.(); } catch {}
  const t = current();
  if (S.loadedId && t && !t.url && countedLoad !== loadToken) { countedLoad = loadToken; t.plays = (t.plays || 0) + 1; t.lastPlayed = Date.now(); idb.put('tracks', t);
    if (onlineOK() && !coverJob && !S.artUrls.has(t.artId) && !coverTried.has(t.artId)) findCoverOnline(t).catch(e => console.warn('cover lookup', e));
    if (S.fx.level && t.gain == null) setTimeout(() => analyseGain(t), 1500);
  }
  syncPlayer();
});
// Right after a song starts, the browser can pause it again by itself (a leftover from the
// priming clip on the first tap). Nobody asked for that pause, so carry on playing.
function pauseNow() { audio._resumeUntil = 0; audio.pause(); }
onAudio('pause', () => {
  if (audio._resumeUntil > performance.now() && !audio.ended && S.loadedId) { audio._resumeUntil = 0; audio.play().catch(() => {}); return; }
  if (fadingEl) stopEl(fadingEl); syncPlayer();
});
onAudio('loadedmetadata', () => {
  const t = current();
  if (S.loadedId && t && isFinite(audio.duration) && Math.abs((t.duration || 0) - audio.duration) > 1) {
    t.duration = audio.duration; if (!t.url) idb.put('tracks', t);
    rowsOf(t.id).forEach(r => { $('.row-dur', r).textContent = fmt(t.duration); });
  }
  syncTime();
});
let seeking = false, lastSave = 0;
function syncTime() {
  const t = current();
  const cur = S.loadedId ? audio.currentTime : S.resumeAt;
  const dur = (S.loadedId && isFinite(audio.duration) ? audio.duration : t?.duration) || 0;
  const p = dur ? Math.min(100, cur / dur * 100) : 0;
  if (!seeking) $$('.seek').forEach(s => { s.value = p * 10; s.style.setProperty('--p', p + '%'); });
  $$('.t-cur').forEach(e => e.textContent = fmt(cur));
  $$('.t-dur').forEach(e => e.textContent = t?.live ? 'LIVE' : fmt(dur));
  $('#mini-progress i').style.width = p + '%';
  if ('mediaSession' in navigator && S.loadedId && dur && isFinite(dur)) {
    try { navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(cur, dur), playbackRate: audio.playbackRate || 1 }); } catch {}
  }
}
// Near the end of a song: open the next one early (gapless) and, if set, blend into it (crossfade).
function maybeTransition() {
  const t = current(), d = audio.duration, x = S.fx.xfade;
  if (!t || t.live || t.kind === 'episode' || !isFinite(d) || audio.paused || !(S.fx.gapless || x > 0) || S.repeat === 'one' || sleepEOT) return;
  const ni = nextIndex(), nt = ni < 0 ? null : T(S.queue[ni]);
  if (!nt || nt.live || nt.kind === 'episode') return;
  const left = d - audio.currentTime;
  if (left < x + 8 && !prepared) prepareNext(ni);
  if (x > 0 && d > x * 3 && left <= x && prepared?.id === nt.id) { S.qIndex = ni; loadCurrent(true, 0, x); }
}
onAudio('timeupdate', () => {
  if (!S.loadedId) return;
  syncTime();
  const t = current();
  if (t && !logged && !t.live && audio.currentTime >= Math.min(30, (audio.duration || 60) / 2)) { logged = true; logPlay(t); }
  if (sleepAt && Date.now() >= sleepAt) { pauseNow(); setSleep(0, true); toast('Sleep timer ended'); }
  maybeTransition(); syncLyrics();
  if (Date.now() - lastSave > 5000) saveState();
});
// Listening history, for the stats page.
let histTimer;
function logPlay(t) {
  S.hist.push({ a: Date.now(), i: t.id, t: t.title, r: t.artist || '', d: Math.round(t.duration || audio.duration || 0), k: t.kind || 'song' });
  if (S.hist.length > 30000) S.hist.splice(0, S.hist.length - 30000);
  clearTimeout(histTimer); histTimer = setTimeout(() => idb.put('kv', S.hist, 'hist').catch(() => {}), 1000);
}
$$('.seek').forEach(s => {
  s.addEventListener('input', () => { seeking = true; s.style.setProperty('--p', s.value / 10 + '%'); });
  s.addEventListener('change', () => {
    const t = current(); const dur = (S.loadedId && isFinite(audio.duration) ? audio.duration : t?.duration) || 0;
    const pos = s.value / 1000 * dur;
    if (S.loadedId) audio.currentTime = pos; else S.resumeAt = pos;
    seeking = false; syncTime();
  });
});
const vol = $('#vol');
vol.addEventListener('input', () => { S.volume = +vol.value; ELS.forEach(applyVol); vol.style.setProperty('--p', vol.value * 100 + '%'); saveState(); });

function syncPlayer() {
  const t = current(), on = playing();
  $('#player').classList.toggle('idle', !t);
  document.body.classList.toggle('pod', t?.kind === 'episode');
  $('#p-title').textContent = t ? t.title : 'Nothing playing';
  $('#p-artist').textContent = t ? (t.artist || 'Unknown artist') : '';
  { const tip = !t ? '' : !t.url ? `See all songs by ${t.artist || 'this artist'}` : t.kind === 'episode' ? 'Go to this podcast' : t.kind === 'ia' ? 'Go to this recording' : 'Go to radio'; for (const el of [$('#p-artist'), $('#np-artist')]) el.setAttribute('aria-label', tip); }
  $('#np-title').textContent = t ? t.title : '';
  $('#np-artist').textContent = t ? (t.artist || 'Unknown artist') : '';
  $('#car-title').textContent = t ? t.title : 'Nothing playing'; $('#car-artist').textContent = t ? (t.artist || 'Unknown artist') : '';
  setArt($('#p-art'), t); setArt($('#np-art'), t);
  const u = t && S.artUrls.get(t.artId);
  $('#np-bg').style.backgroundImage = u ? `url('${u}')` : 'none';
  syncTint();
  $$('.pp').forEach(b => { b.innerHTML = ic(on ? 'pause' : 'play'); b.setAttribute('aria-label', on ? 'Pause' : 'Play'); });
  $$('.b-shuffle').forEach(b => { b.classList.toggle('on', S.shuffle); b.setAttribute('aria-label', S.shuffle ? 'Shuffle is on' : 'Shuffle is off'); });
  $$('.b-repeat').forEach(b => { b.classList.toggle('on', S.repeat !== 'off'); b.innerHTML = ic(S.repeat === 'one' ? 'repeat1' : 'repeat'); b.setAttribute('aria-label', { off: 'Repeat is off', all: 'Repeating the whole queue', one: 'Repeating this song' }[S.repeat]); });
  $$('.cur-like').forEach(b => { b.classList.toggle('on', !!t?.liked); b.setAttribute('aria-label', t?.liked ? 'Remove from liked songs' : 'Add to liked songs'); });
  document.title = t && on ? `${t.title} · ${t.artist || 'Cadence'}` : 'Cadence';
  markPlaying(); syncTime();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = t ? new MediaMetadata({
      title: t.title, artist: t.artist || '', album: t.album || '',
      artwork: u ? [{ src: u, sizes: '512x512', type: 'image/jpeg' }] : [],
    }) : null;
    navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }
}
function markPlaying() {
  const id = S.queue[S.qIndex];
  $$('.row.playing').forEach(r => r.classList.remove('playing'));
  if (id) rowsOf(id).forEach(r => { if (!r.closest('.tracklist')?._ctx.queueOffset) r.classList.add('playing'); });
}
if ('mediaSession' in navigator) {
  const set = (a, fn) => { try { navigator.mediaSession.setActionHandler(a, fn); } catch {} };
  set('play', () => toggle()); set('pause', () => pauseNow());
  set('previoustrack', prev); set('nexttrack', () => next());
  set('seekto', d => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
  set('seekbackward', d => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
  set('seekforward', d => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
}

let saveTimer;
function saveState() {
  lastSave = Date.now();
  clearTimeout(saveTimer);
  const cur = current();
  if (cur?.kind === 'episode' && S.loadedId === cur.id && audio.currentTime > 5) { S.epos[cur.id] = audio.currentTime; idb.put('kv', S.epos, 'epos').catch(() => {}); }
  saveTimer = setTimeout(() => idb.put('kv', {
    remote: [...new Set(S.queue)].filter(id => S.remote.has(id)).map(id => S.remote.get(id)),
    queue: S.queue, qIndex: S.qIndex, baseQueue: S.baseQueue, shuffle: S.shuffle, repeat: S.repeat, radio: S.radio,
    volume: S.volume, position: S.loadedId ? audio.currentTime : S.resumeAt, sort: S.sort,
  }, 'state').catch(() => {}), 300);
}
addEventListener('pagehide', saveState);

/* ---------------- library mutations ---------------- */
async function toggleLike(id) {
  if (S.remote.get(id)?.kind === 'station') return toggleStation(S.remote.get(id));
  const t = T(id); if (!t) return;
  t.liked = t.liked ? 0 : Date.now();
  if (t.url) await keep(t); else await idb.put('tracks', t);
  rowsOf(id).forEach(r => { const b = $('.like', r); b.classList.toggle('on', !!t.liked); b.setAttribute('aria-label', t.liked ? 'Remove from liked songs' : 'Add to liked songs'); });
  syncPlayer(); if (page() === 'liked') route();
}
// Online items (episodes, stations, archive tracks) that are liked or in a playlist are kept here so they survive restarts.
async function keep(item) { S.saved[item.id] = item; await idb.put('kv', S.saved, 'saved').catch(() => {}); }
const likedItems = () => [...shown(), ...S.remote.values()].filter(t => t.liked && t.kind !== 'station').sort((a, b) => b.liked - a.liked);
const playlistIds = p => p.smart ? smartIds(p) : p.trackIds.filter(has);
async function newPlaylist(withIds = []) {
  const name = await ask({ title: 'New playlist', input: `My playlist #${S.playlists.length + 1}`, ok: 'Create' });
  if (!name) return null;
  const p = { id: uid(), name, trackIds: [...withIds], createdAt: Date.now() };
  for (const id of withIds) if (S.remote.has(id)) await keep(S.remote.get(id));
  S.playlists.push(p); await idb.put('playlists', p); renderSidePlaylists();
  if (withIds.length) toast(`Added to ${name}`); else location.hash = `#/playlist/${p.id}`;
  if (page() === 'playlists') route();
  return p;
}
async function addToPlaylist(p, ids) {
  const fresh = ids.filter(id => !p.trackIds.includes(id));
  if (!fresh.length) return toast('Already in that playlist');
  for (const id of fresh) if (S.remote.has(id)) await keep(S.remote.get(id));
  p.trackIds.push(...fresh); await idb.put('playlists', p); toast(`Added to ${p.name}`);
}
function pickPlaylist(ids) {
  openMenu([
    { label: 'New playlist', icon: 'plus', fn: () => newPlaylist(ids) },
    ...S.playlists.filter(p => !p.smart).map(p => ({ label: p.name, icon: 'list', fn: () => addToPlaylist(p, ids) })),
  ], null, 'Add to playlist');
}
async function deleteTracks(ids) {
  const set = new Set(ids);
  const curId = S.queue[S.qIndex];
  for (const id of ids) { S.tracks.delete(id); await idb.del('tracks', id); await idb.del('files', id); }
  for (const p of S.playlists) { const n = p.trackIds.filter(i => !set.has(i)); if (n.length !== p.trackIds.length) { p.trackIds = n; await idb.put('playlists', p); } }
  if (set.has(curId)) { audio.pause(); audio.removeAttribute('src'); S.loadedId = null; S.queue = []; S.qIndex = -1; S.baseQueue = null; }
  else { S.queue = S.queue.filter(i => !set.has(i)); S.qIndex = S.queue.indexOf(curId); if (S.baseQueue) S.baseQueue = S.baseQueue.filter(i => !set.has(i)); }
  rebuild(); saveState(); syncPlayer(); route();
}

function trackMenu(t, ev, ctx = {}) {
  if (t.url) return remoteMenu(t, ev, ctx);
  const pl = ctx.playlistId && S.playlists.find(p => p.id === ctx.playlistId);
  openMenu([
    { label: 'Song radio', icon: 'radio', fn: () => { closeNP(); startRadio(t.id); } },
    { label: 'Play next', icon: 'next', fn: () => enqueue([t.id], true) },
    { label: 'Add to queue', icon: 'queue', fn: () => enqueue([t.id], false) },
    { label: 'Add to playlist', icon: 'plus', fn: () => pickPlaylist([t.id]) },
    { label: t.liked ? 'Remove from liked songs' : 'Like', icon: 'heart', fn: () => toggleLike(t.id) },
    { label: 'Download the file', icon: 'save', fn: () => exportTracks([t.id]) },
    !ctx.np && { label: 'Select', icon: 'check', fn: () => toggleSel(t.id) },
    t.album && { label: 'Go to album', icon: 'disc', fn: () => nav(`#/album/${encodeURIComponent(t.albumKey)}`) },
    { label: 'Go to artist', icon: 'user', fn: () => nav(`#/artist/${encodeURIComponent(norm(t.albumArtist || t.artist || 'Unknown artist'))}`) },
    ctx.np && { label: sleepLabel(), icon: 'moon', fn: () => sleepMenu() },
    ctx.np && { label: 'Equalizer and sound', icon: 'settings', fn: () => nav('#/settings') },
    { label: 'Lyrics', icon: 'text', fn: () => showLyrics(t) },
    !S.artUrls.has(t.artId) && { label: 'Find cover online', icon: 'disc', fn: async () => {
      if (!navigator.onLine) return toast('Connect to the internet to look up covers');
      if (!(t.albumArtist || t.artist)) return toast('Add the artist name first (Edit info)');
      toast('Looking for a cover…');
      try { toast(await findCoverOnline(t) ? 'Cover added' : 'No matching cover found'); } catch { toast('The cover service could not be reached'); }
    } },
    { label: 'Edit info', icon: 'edit', fn: () => editInfo(t) },
    pl && ctx.i > 0 && { label: 'Move up', icon: 'up', fn: () => movePl(pl, ctx.i, -1) },
    pl && ctx.i != null && ctx.i < viewIds.length - 1 && { label: 'Move down', icon: 'dn', fn: () => movePl(pl, ctx.i, 1) },
    ctx.queueOffset && ctx.i > 0 && { label: 'Move up', icon: 'up', fn: () => moveQ(ctx.queueOffset + ctx.i, -1) },
    ctx.queueOffset && ctx.i != null && ctx.queueOffset + ctx.i < S.queue.length - 1 && { label: 'Move down', icon: 'dn', fn: () => moveQ(ctx.queueOffset + ctx.i, 1) },
    pl && { label: 'Remove from this playlist', icon: 'x', fn: async () => { pl.trackIds = pl.trackIds.filter(i => i !== t.id); await idb.put('playlists', pl); rerender(); } },
    ctx.queueOffset && ctx.i != null && { label: 'Remove from queue', icon: 'x', fn: () => { S.queue.splice(ctx.queueOffset + ctx.i, 1); saveState(); rerender(); } },
    { label: 'Delete from library', icon: 'trash', danger: true, fn: async () => {
      if (await ask({ title: 'Delete from library?', text: t.linked ? `“${t.title}” will be removed from Cadence. The file in your folder is not touched.` : `“${t.title}” will be removed from this device's Cadence library.`, ok: 'Delete', danger: true })) deleteTracks([t.id]);
    } },
  ], ev, `${t.title} · ${t.artist || 'Unknown artist'}`);
}

/* ---------------- sleep timer ---------------- */
let sleepAt = 0, sleepEOT = false, sleepTimer = null;
const sleepLabel = () => sleepEOT ? 'Sleep timer · end of song' : sleepAt ? `Sleep timer · ${Math.max(1, Math.ceil((sleepAt - Date.now()) / 60000))} min left` : 'Sleep timer';
function setSleep(min, quiet) {
  clearTimeout(sleepTimer); sleepTimer = null; sleepAt = 0; sleepEOT = false;
  if (min === 'eot') { sleepEOT = true; toast('Stopping after this song'); }
  else if (min) {
    sleepAt = Date.now() + min * 60000;
    sleepTimer = setTimeout(() => { pauseNow(); setSleep(0, true); toast('Sleep timer ended'); }, min * 60000);
    toast(`Stopping in ${min} minutes`);
  } else if (!quiet) toast('Sleep timer off');
  if (page() === 'queue') rerender();
}
function sleepMenu(e) {
  openMenu([
    ...[5, 15, 30, 45, 60, 90].map(m => ({ label: `${m} minutes`, icon: 'clock', fn: () => setSleep(m) })),
    { label: 'End of this song', icon: 'note', fn: () => setSleep('eot') },
    (sleepAt || sleepEOT) && { label: 'Turn off timer', icon: 'x', danger: true, fn: () => setSleep(0) },
  ], e, sleepLabel());
}

/* ---------------- online lookup: missing covers + lyrics ---------------- */
// Only the song's title / artist / album are sent. Results are saved on the device for offline use.
const onlineOK = () => S.online !== false && navigator.onLine;
const cleanTitle = s => String(s || '').replace(/\s*[(\[][^)\]]*(official|video|audio|lyric|remaster|explicit|\bhd\b|\bhq\b)[^)\]]*[)\]]/gi, '').replace(/\s+(ft|feat)\.? .*$/i, '').trim();
async function fetchJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
const sameArtist = (a, b) => { a = norm(a).replace(/^the /, ''); b = norm(b).replace(/^the /, ''); return !!a && !!b && (a.includes(b) || b.includes(a)); };

// Returns { plain, synced } — synced is LRC text with a time on every line, when the service has it.
async function findLyricsOnline(t) {
  const q = new URLSearchParams({ track_name: cleanTitle(t.title) });
  if (t.artist) q.set('artist_name', t.artist);
  const list = await fetchJSON('https://lrclib.net/api/search?' + q);
  const c = list.filter(x => (x.plainLyrics || x.syncedLyrics) && (!t.artist || sameArtist(x.artistName, t.artist)));
  if (!c.length) return list.some(x => x.instrumental) ? { plain: 'This song is instrumental.', synced: '' } : null;
  const off = x => t.duration ? Math.abs((x.duration || 0) - t.duration) : 0;
  c.sort((x, y) => off(x) - off(y));
  // Timed lyrics only line up when they were made for a recording of the same length.
  const timed = c.find(x => x.syncedLyrics && off(x) < 4);
  const best = timed || c[0];
  return { plain: best.plainLyrics || best.syncedLyrics.replace(/^\[[^\]]*\]\s?/gm, ''), synced: timed ? timed.syncedLyrics : '' };
}
const parseLrc = text => String(text || '').split('\n').map(l => { const m = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/.exec(l.trim()); return m ? { t: +m[1] * 60 + +m[2], text: m[3] } : null; }).filter(Boolean);

async function artistBio(name) {
  const key = 'bio:' + norm(name);
  let c = await idb.get('kv', key).catch(() => null);
  if (c && (c.text || Date.now() - c.at < 30 * 864e5)) return c.text ? c : null;
  if (!onlineOK()) return null;
  // Ask for the pages this artist would be filed under, most specific first. Redirects are followed.
  const titles = [`${name} (band)`, `${name} (musician)`, `${name} (singer)`, `${name} (rapper)`, name];
  const p = new URLSearchParams({ action: 'query', titles: titles.join('|'), redirects: 1, prop: 'extracts|description|info|pageprops', ppprop: 'disambiguation', inprop: 'url', exintro: 1, explaintext: 1, exsentences: 4, exlimit: 'max', format: 'json', origin: '*' });
  const d = await fetchJSON('https://en.wikipedia.org/w/api.php?' + p);
  const music = /\b(band|singer|musician|rapper|songwriter|duo|trio|group|composer|dj|producer|vocalist|guitarist|pianist|orchestra|ensemble)\b/i;
  // Only accept a page that is about music, so a namesake (a town, a film, a footballer) is never shown.
  const pages = Object.values(d.query?.pages || {}).filter(pg => pg.extract && !pg.pageprops && music.test(`${pg.description || ''} ${pg.extract.slice(0, 400)}`));
  const hit = pages.find(pg => /\((band|musician|singer|rapper)\)$/i.test(pg.title)) || pages[0];
  c = hit?.extract ? { text: hit.extract.trim(), url: hit.fullurl, at: Date.now() } : { at: Date.now() };
  idb.put('kv', c, key).catch(() => {});
  return c.text ? c : null;
}
let lastCoverCall = 0;
const coverTried = new Set();
async function coverSearch(term, entity) {
  // The catalogue allows roughly 20 searches a minute, so space them out.
  const wait = lastCoverCall + 3200 - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCoverCall = Date.now();
  return (await fetchJSON('https://itunes.apple.com/search?' + new URLSearchParams({ term, entity, media: 'music', limit: 8 }))).results || [];
}
async function findCoverOnline(t) {
  const artist = t.albumArtist || t.artist;
  if (!artist || S.artUrls.has(t.artId)) return false;
  coverTried.add(t.artId);
  let hit = null;
  if (t.album) hit = (await coverSearch(`${artist} ${t.album}`, 'album')).find(r => sameArtist(r.artistName, artist) && r.artworkUrl100);
  if (!hit) hit = (await coverSearch(`${artist} ${cleanTitle(t.title)}`, 'song')).find(r => sameArtist(r.artistName, artist) && r.artworkUrl100);
  if (!hit) return false;
  const res = await fetch(hit.artworkUrl100.replace(/\d+x\d+bb/, '600x600bb'));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const img = await res.blob();
  const thumb = await makeThumb({ data: await img.arrayBuffer(), format: img.type });
  await idb.put('art', thumb, t.artId);
  S.artUrls.set(t.artId, URL.createObjectURL(thumb));
  rebuild(); if (!importing) rerender(); syncPlayer();
  return true;
}
let coverJob = false;
async function findAllCovers() {
  if (coverJob || importing) return;
  if (!navigator.onLine) return toast('Connect to the internet to look up covers');
  const seen = new Set(), todo = [];
  for (const t of S.tracks.values()) if (!S.artUrls.has(t.artId) && !seen.has(t.artId) && (t.albumArtist || t.artist)) { seen.add(t.artId); todo.push(t); }
  if (!todo.length) return toast('No covers are missing');
  coverJob = true; let found = 0, stop = false;
  for (let i = 0; i < todo.length && !stop; i++) {
    setBanner(`<span>Looking up covers… ${i + 1} / ${todo.length} · ${found} found</span><div class="bar"><i style="width:${(i + 1) / todo.length * 100}%"></i></div><button class="btn" id="cov-stop">Stop</button>`);
    $('#cov-stop').onclick = () => { stop = true; };
    try { if (await findCoverOnline(todo[i])) found++; } catch (e) { console.warn('cover lookup', e); }
  }
  coverJob = false; setBanner('');
  toast(`Found ${found} of ${todo.length} missing cover${todo.length === 1 ? '' : 's'}`);
}

/* ---------------- lyrics, editing, reordering ---------------- */
let lyrLive = null;   // { id, lines, at } while timed lyrics are on screen
async function showLyrics(t) {
  const d = $('#lyr'), pre = $('pre', d), box = $('.lrc', d), src = $('.lyr-src', d), head = `${t.title} · ${t.artist || 'Unknown artist'}`;
  $('h3', d).textContent = head; pre.hidden = false; box.hidden = true; lyrLive = null;
  pre.textContent = 'Looking for lyrics…'; src.textContent = '';
  d.showModal(); pre.scrollTop = 0;
  let plain = '', lines = [], from = '';
  if (!t.url) try {
    const mm = await import('./vendor/music-metadata.js');
    const ly = (await mm.parseBlob(await getFile(t.id), { skipCovers: true })).common.lyrics || [];
    plain = ly.map(l => typeof l === 'string' ? l : (l.text || (l.syncText || []).map(x => x.text).join('\n'))).filter(Boolean).join('\n\n').trim();
    const st = ly.find(l => l?.syncText?.length > 3 && l.syncText.some(x => x.timestamp > 0));
    lines = st ? st.syncText.map(x => ({ t: (x.timestamp || 0) / 1000, text: x.text })) : parseLrc(plain);
    if (lines.length > 3) plain = plain.replace(/^\[[^\]]*\]\s?/gm, ''); else lines = [];
  } catch (e) { console.warn('lyrics', e); }
  const saved = 'Lyrics from LRCLIB, saved for offline use';
  if (!plain) {
    const c = await idb.get('kv', 'lyr:' + t.id).catch(() => null);
    if (c) { plain = typeof c === 'string' ? c : c.plain || ''; lines = parseLrc(c.synced); from = saved; }
  }
  let note = 'No lyrics found for this song. If the title or artist looks wrong, fix it with Edit info and the search runs again.';
  if (!plain) {
    if (S.online === false) note = 'No lyrics are saved inside this file. Turn on online lookups in Settings to search for them.';
    else if (!navigator.onLine) note = 'No lyrics are saved for this song yet. Connect to the internet and open this again to look them up.';
    else try {
      const r = await findLyricsOnline(t);
      if (r) { plain = r.plain; lines = parseLrc(r.synced); from = saved; idb.put('kv', r, 'lyr:' + t.id).catch(() => {}); }
    } catch (e) { console.warn('lyrics lookup', e); note = 'The lyrics service could not be reached. Try again later.'; }
  }
  if ($('h3', d).textContent !== head || !d.open) return;   // closed, or another song was opened meanwhile
  if (lines.length > 3) {
    box.innerHTML = lines.map((l, i) => `<p data-i="${i}">${esc(l.text) || '♪'}</p>`).join('');
    box.hidden = false; pre.hidden = true; box.scrollTop = 0;
    lyrLive = { id: t.id, lines, at: -2 };
    src.textContent = `${from ? from + '. ' : ''}The lines follow the song — click one to jump there.`;
    syncLyrics();
  } else { pre.textContent = plain || note; src.textContent = from; pre.scrollTop = 0; }
}
function syncLyrics() {
  if (!lyrLive || S.loadedId !== lyrLive.id) return;
  const now = audio.currentTime + 0.25, L = lyrLive.lines;
  let i = -1; for (let k = 0; k < L.length && L[k].t <= now; k++) i = k;
  if (i === lyrLive.at) return;
  lyrLive.at = i;
  const box = $('#lyr .lrc'); $('.now', box)?.classList.remove('now');
  const el = box.children[i];
  if (el) { el.classList.add('now'); box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' }); }
}
$('#lyr').addEventListener('close', () => { lyrLive = null; });
$('#lyr .lrc').addEventListener('click', e => {
  const p = e.target.closest('p'); if (!p || !lyrLive) return;
  if (S.loadedId === lyrLive.id) { audio.currentTime = lyrLive.lines[+p.dataset.i].t; syncLyrics(); } else toast('Play this song to jump around in it');
});
async function editInfo(t) {
  const d = $('#edit'), f = $('form', d).elements;
  for (const k of ['title', 'artist', 'album', 'albumArtist']) f[k].value = t[k] || '';
  f.trackNo.value = t.trackNo || ''; f.genre.value = t.genre || ''; f.year.value = t.year || '';
  $('.edit-cands', d).innerHTML = '';
  d.returnValue = 'cancel'; d.showModal(); f.title.focus();
  await new Promise(r => d.addEventListener('close', r, { once: true }));
  if (d.returnValue !== 'ok') return;
  const oldArt = t.artId, before = `${t.title}|${t.artist}|${t.album}`;
  t.title = f.title.value.trim() || t.title;
  for (const k of ['artist', 'album', 'albumArtist']) t[k] = f[k].value.trim();
  t.trackNo = +f.trackNo.value || null; t.genre = f.genre.value.trim(); t.year = +f.year.value || null;
  t.albumKey = `${norm(t.albumArtist || t.artist)}::${norm(t.album)}`;
  t.artId = t.album ? t.albumKey : `t::${t.id}`;
  if (t.artId !== oldArt && !S.artUrls.has(t.artId)) {
    const b = await idb.get('art', oldArt);
    if (b) { await idb.put('art', b, t.artId); S.artUrls.set(t.artId, URL.createObjectURL(b)); }
  }
  await idb.put('tracks', t);
  rebuild();
  if (page() === 'album' && !S.albums.has(decodeURIComponent(location.hash.split('/')[2] || ''))) location.hash = `#/album/${encodeURIComponent(t.albumKey)}`;
  else rerender();
  syncPlayer();
  // New details can make a cover or lyrics findable, so look again.
  const changed = before !== `${t.title}|${t.artist}|${t.album}`;
  if (changed) { coverTried.delete(t.artId); idb.del('kv', 'lyr:' + t.id).catch(() => {}); }
  if (!onlineOK() || !(changed || !S.artUrls.has(t.artId))) return toast('Saved');
  toast('Saved — looking for the cover and lyrics…');
  const [cover, lyrics] = await Promise.all([
    S.artUrls.has(t.artId) ? null : findCoverOnline(t).catch(() => false),
    findLyricsOnline(t).then(text => { if (text) idb.put('kv', text, 'lyr:' + t.id); return !!text; }).catch(() => false),
  ]);
  toast([cover === null ? null : cover ? 'Cover found' : 'No cover found', lyrics ? 'lyrics found' : 'no lyrics found'].filter(Boolean).join(' · '));
}
// "Look up online" in the edit box: suggest artist / album for the typed title.
async function lookupInfo(el, e) {
  e?.preventDefault();
  const d = $('#edit'), f = $('form', d).elements, box = $('.edit-cands', d);
  const title = cleanTitle(f.title.value);
  if (!title) return;
  if (!navigator.onLine) { box.textContent = 'Connect to the internet to look this up.'; return; }
  box.textContent = 'Searching…';
  try {
    const q = new URLSearchParams({ track_name: title }); if (f.artist.value.trim()) q.set('artist_name', f.artist.value.trim());
    const seen = new Set();
    const list = (await fetchJSON('https://lrclib.net/api/search?' + q))
      .filter(x => x.trackName && x.artistName)
      .sort((a, b) => (norm(b.trackName) === norm(title)) - (norm(a.trackName) === norm(title)))
      .filter(x => { const k = norm(x.artistName + '|' + (x.albumName || '')); return !seen.has(k) && seen.add(k); }).slice(0, 6);
    if (!list.length) { box.textContent = 'Nothing found for that title. Check the spelling, or type the artist yourself.'; return; }
    box.innerHTML = '<div class="muted">Pick the right one:</div>' + list.map((x, i) => `<button type="button" class="cand" data-i="${i}"><b>${esc(x.trackName)}</b> — ${esc(x.artistName)}${x.albumName ? ` <span class="muted">· ${esc(x.albumName)}</span>` : ''}</button>`).join('');
    box.onclick = ev => {
      const b = ev.target.closest('.cand'); if (!b) return;
      const x = list[+b.dataset.i];
      f.title.value = x.trackName; f.artist.value = x.artistName; if (x.albumName && x.albumName !== x.trackName) f.album.value = x.albumName;
      box.innerHTML = '<div class="muted">Filled in. Press Save to keep it and fetch the cover and lyrics.</div>';
    };
  } catch { box.textContent = 'The lookup service could not be reached. Try again later.'; }
}
async function movePl(p, i, d) {
  const ids = p.trackIds.filter(has);
  [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
  p.trackIds = ids; await idb.put('playlists', p); rerender();
}
function moveQ(i, d) { [S.queue[i], S.queue[i + d]] = [S.queue[i + d], S.queue[i]]; saveState(); rerender(); }

/* ---------------- backup: carry playlists + likes between devices ---------------- */
const sigOf = t => `${t.fileName}|${t.size}`;
function exportBackup() {
  const data = {
    app: 'cadence', version: 1, exportedAt: new Date().toISOString(),
    playlists: S.playlists.map(p => ({ name: p.name, smart: p.smart, tracks: p.trackIds.map(i => S.tracks.get(i)).filter(Boolean).map(sigOf) })),
    liked: [...S.tracks.values()].filter(t => t.liked).sort((a, b) => a.liked - b.liked).map(sigOf),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
  a.download = `cadence-backup-${data.exportedAt.slice(0, 10)}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  toast('Backup file saved to your downloads');
}
async function importBackup(file) {
  let d = null;
  try { d = JSON.parse(await file.text()); } catch {}
  if (!d || d.app !== 'cadence' || !Array.isArray(d.playlists)) return toast("That isn't a Cadence backup file");
  const bySig = new Map([...S.tracks.values()].map(t => [sigOf(t), t]));
  const missing = new Set(); let pls = 0, likes = 0;
  for (const bp of d.playlists) {
    const name = String(bp.name || 'Playlist').slice(0, 80);
    let p = S.playlists.find(x => x.name === name);
    if (!p) { p = { id: uid(), name, trackIds: [], createdAt: Date.now() + pls }; if (bp.smart && SMART[bp.smart.type]) p.smart = { type: bp.smart.type, value: String(bp.smart.value || '').slice(0, 60), liked: !!bp.smart.liked }; S.playlists.push(p); }
    for (const sig of bp.tracks || []) {
      const t = bySig.get(sig);
      if (!t) missing.add(sig); else if (!p.trackIds.includes(t.id)) p.trackIds.push(t.id);
    }
    await idb.put('playlists', p); pls++;
  }
  for (const sig of d.liked || []) {
    const t = bySig.get(sig);
    if (!t) missing.add(sig); else if (!t.liked) { t.liked = Date.now() + likes; await idb.put('tracks', t); likes++; }
  }
  renderSidePlaylists(); rerender(); syncPlayer();
  ask({ title: 'Backup restored', text: `${pls} playlist${pls === 1 ? '' : 's'} and ${likes} new like${likes === 1 ? '' : 's'} restored.` + (missing.size ? ` ${missing.size} song${missing.size === 1 ? ' is' : 's are'} not on this device and ${missing.size === 1 ? 'was' : 'were'} skipped — add the same files here, then restore again.` : '') });
}

/* ---------------- automatic playlists ---------------- */
const MIXES = {
  recent: { name: 'Recently added', icon: 'clock', bg: '#2a6f97,#1b3a4b', ids: () => [...shown()].sort((a, b) => b.addedAt - a.addedAt || a.title.localeCompare(b.title)).slice(0, 100).map(t => t.id) },
  top: { name: 'Most played', icon: 'note', bg: '#7b2cbf,#3c096c', ids: () => [...shown()].filter(t => t.plays).sort((a, b) => b.plays - a.plays).slice(0, 100).map(t => t.id) },
  never: { name: 'Never played', icon: 'spark', bg: '#b5651d,#5c2d0c', ids: () => [...shown()].filter(t => !t.plays).sort(SORTS.artist).slice(0, 200).map(t => t.id) },
  forgotten: { name: 'Forgotten favourites', icon: 'heart', bg: '#9d174d,#4a0d28', ids: () => [...shown()].filter(t => t.liked && Date.now() - (t.lastPlayed || 0) > 90 * 864e5).sort((a, b) => (a.lastPlayed || 0) - (b.lastPlayed || 0)).slice(0, 200).map(t => t.id) },
  history: { name: 'Recently played', icon: 'repeat', bg: '#2d6a4f,#1b4332', ids: () => [...shown()].filter(t => t.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 100).map(t => t.id) },
};

/* ---------------- online: free podcasts + live radio ---------------- */
const safeUrl = u => /^https:\/\//i.test(u || '') ? u.replace(/['"\\()\s<>]/g, c => '%' + c.charCodeAt(0).toString(16)) : '';
function reg(item) { S.remote.set(item.id, item); const u = safeUrl(item.art); if (u) S.artUrls.set(item.artId, u); return item; }
const CC = (() => { for (const l of navigator.languages || [navigator.language || '']) { const m = /-([A-Za-z]{2})\b/.exec(l); if (m) return m[1].toUpperCase(); } return 'US'; })();
const offlineNote = what => `<div class="empty">${navigator.onLine ? `Couldn't reach the ${what} directory. Try again in a moment.` : `You're offline. Connect to the internet to browse ${what}.`}</div>`;
const searchForm = (kind, value, placeholder) => `<form class="inline-search" data-form="${kind}"><label class="searchbox">${ic('search')}<input name="q" type="search" placeholder="${placeholder}" value="${esc(value)}" autocomplete="off" aria-label="${placeholder}"></label><button class="btn">Search</button></form>`;
const onlineChips = tab => `<div class="chips"><a class="chip ${tab === 'podcasts' ? 'active' : ''}" href="#/online/podcasts">Podcasts</a><a class="chip ${tab === 'radio' ? 'active' : ''}" href="#/online/radio">Radio</a><a class="chip ${tab === 'music' ? 'active' : ''}" href="#/online/music">Free music</a><a class="chip ${tab === 'youtube' ? 'active' : ''}" href="#/online/youtube">YouTube</a></div>`;

// --- podcasts (Apple's public podcast directory; shows are streamed from their own hosts) ---
const podFrom = r => ({ id: String(r.collectionId), name: r.collectionName, author: r.artistName, art: r.artworkUrl600 || r.artworkUrl100 });
const podCard = p => `<a class="card" data-pod="${esc(p.id)}" href="#/podcast/${encodeURIComponent(p.id)}">${safeUrl(p.art) ? `<div class="art" style="background-image:url('${safeUrl(p.art)}')"></div>` : artDiv(null, p.name, '', 'mic')}<div class="card-title">${esc(p.name)}</div><div class="card-sub">${esc(p.author || '')}</div></a>`;
const podMem = new Map(), podSearchMem = new Map();
// Apple's podcast categories, each with its own top-50 chart per country.
const POD_GENRES = [['', 'All'], ['1303', 'Comedy'], ['1489', 'News'], ['1488', 'True Crime'], ['1545', 'Sports'], ['1324', 'Society & Culture'],
  ['1487', 'History'], ['1321', 'Business'], ['1512', 'Health & Fitness'], ['1309', 'TV & Film'], ['1310', 'Music'], ['1533', 'Science'],
  ['1318', 'Technology'], ['1304', 'Education'], ['1301', 'Arts'], ['1502', 'Leisure'], ['1305', 'Kids & Family'], ['1483', 'Fiction'],
  ['1314', 'Religion & Spirituality'], ['1511', 'Government']];
const chartMem = new Map();
async function loadTopPods(genre = '') {
  const key = `chart:${CC}:${genre}`;
  const mem = chartMem.get(key); if (mem && Date.now() - mem.at < 3 * 3600e3) return mem.list;
  try {
    const d = await fetchJSON(`https://itunes.apple.com/${CC.toLowerCase()}/rss/toppodcasts/limit=50${genre ? `/genre=${genre}` : ''}/json`);
    const list = (d.feed?.entry || []).map(e => ({ id: e.id?.attributes?.['im:id'], name: e['im:name']?.label, author: e['im:artist']?.label, art: e['im:image']?.at(-1)?.label })).filter(p => p.id && p.name);
    if (!list.length) throw new Error('empty chart');
    const v = { at: Date.now(), list }; chartMem.set(key, v); idb.put('kv', v, key).catch(() => {});
    return list;
  } catch (e) {
    const saved = await idb.get('kv', key).catch(() => null);   // last chart seen, for offline use
    if (saved?.list?.length) { chartMem.set(key, saved); return saved.list; }
    throw e;
  }
}
const rankCard = (p, i) => podCard(p).replace('<a class="card"', `<a class="card ranked" data-rank="${i + 1}"`);
async function searchPods(q) {
  if (podSearchMem.has(q)) return podSearchMem.get(q);
  const d = await fetchJSON('https://itunes.apple.com/search?' + new URLSearchParams({ term: q, media: 'podcast', entity: 'podcast', limit: 30 }));
  const r = (d.results || []).filter(x => x.collectionId && x.collectionName).map(podFrom);
  podSearchMem.set(q, r); return r;
}
const hashStr = str => { let h = 5381; for (const c of String(str)) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };
// Read a podcast straight from its RSS feed. Works for any show whose host lets web apps read the feed.
async function loadFeed(url) {
  const res = await fetch(url); if (!res.ok) throw new Error('HTTP ' + res.status);
  const doc = new DOMParser().parseFromString(await res.text(), 'text/xml'), ch = doc.querySelector('channel');
  if (!ch) throw new Error('not a podcast feed');
  const kid = (el, name, itunes) => [...el.children].find(c => c.localName === name && (itunes ? c.prefix === 'itunes' : !c.prefix));
  const txt = (el, name, itunes) => kid(el, name, itunes)?.textContent?.trim() || '';
  const id = 'rss:' + url;
  const pod = { id, name: txt(ch, 'title') || url, author: txt(ch, 'author', true), art: kid(ch, 'image', true)?.getAttribute('href') || kid(ch, 'image')?.querySelector('url')?.textContent?.trim() || '', feed: url };
  const eps = [...ch.children].filter(c => c.localName === 'item').map(it => {
    const u = (kid(it, 'enclosure')?.getAttribute('url') || '').replace(/^http:/i, 'https:');
    if (!/^https:\/\//i.test(u)) return null;
    const d = new Date(txt(it, 'pubDate')), okDate = !isNaN(d);
    return {
      id: `ep:r${hashStr(url)}:${hashStr(txt(it, 'guid') || u)}`, kind: 'episode', podId: id, date: okDate ? d.toISOString() : '',
      title: txt(it, 'title') || 'Untitled episode', artist: pod.name, album: okDate ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      url: u, duration: iaSecs(txt(it, 'duration', true)), art: pod.art, artId: 'r:pod:' + id, desc: txt(it, 'description').replace(/<[^>]+>/g, '').slice(0, 3000),
    };
  }).filter(Boolean).sort((a, b) => (b.date > a.date) - (b.date < a.date)).slice(0, 300);
  return { at: Date.now(), pod, eps };
}
async function addFeed() {
  const url = (await ask({ title: 'Add a podcast by its feed address', text: 'Paste the show\'s RSS feed address. Most podcast websites list it as “RSS” or “Feed”.', input: 'https://', ok: 'Add' }) || '').trim();
  if (!url) return;
  if (!/^https:\/\/\S+\.\S+/i.test(url)) return toast('That doesn\'t look like a feed address (it should start with https://)');
  if (!navigator.onLine) return toast('Connect to the internet to add a podcast');
  toast('Reading the feed…');
  try {
    const data = await loadFeed(url);
    if (!data.eps.length) throw new Error('no episodes');
    for (const e of data.eps) reg(S.saved[e.id] || S.dl[e.id] || e);
    podMem.set(data.pod.id, data); await idb.put('kv', data, 'pod:' + data.pod.id);
    if (!S.pods.some(p => p.id === data.pod.id)) { S.pods.push({ ...data.pod, seen: data.eps[0].date }); await idb.put('kv', S.pods, 'pods'); }
    location.hash = `#/podcast/${encodeURIComponent(data.pod.id)}`;
  } catch (e) {
    console.warn('feed', e);
    ask({ title: 'Couldn\'t add that feed', text: 'Either the address isn\'t a podcast feed, or the show\'s host doesn\'t let web apps read it directly. Try searching for the show by name instead.', ok: 'OK' });
  }
}
async function loadPodcast(id, maxAge = 30 * 60000) {
  let data = podMem.get(id) || await idb.get('kv', 'pod:' + id).catch(() => null);
  if (navigator.onLine && (!data || Date.now() - data.at > maxAge)) {
    try {
      if (id.startsWith('rss:')) data = await loadFeed(id.slice(4));
      else {
      const d = await fetchJSON('https://itunes.apple.com/lookup?' + new URLSearchParams({ id, media: 'podcast', entity: 'podcastEpisode', limit: 200 }));
      const head = (d.results || []).find(r => r.kind === 'podcast');
      if (!head) throw new Error('not found');
      const pod = podFrom(head);
      const eps = d.results.filter(r => r.kind === 'podcast-episode' && r.episodeUrl).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).map(r => ({
        id: 'ep:' + r.trackId, kind: 'episode', podId: pod.id, date: r.releaseDate || '', title: r.trackName, artist: pod.name,
        album: r.releaseDate ? new Date(r.releaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        url: r.episodeUrl, duration: r.trackTimeMillis ? r.trackTimeMillis / 1000 : null, art: pod.art, artId: 'r:pod:' + pod.id,
        desc: String(r.description || r.shortDescription || '').slice(0, 3000),
      }));
      data = { at: Date.now(), pod, eps };
      }
      idb.put('kv', data, 'pod:' + id).catch(() => {});
    } catch (e) { if (!data) throw e; }
  }
  if (!data) throw new Error('offline');
  for (const e of data.eps) reg(S.saved[e.id] || S.dl[e.id] || e);
  podMem.set(id, data); return data;
}
function drawPodcast({ pod, eps }) {
  viewIds = eps.map(e => e.id); S.curPod = pod;
  const mine = S.pods.find(p => p.id === pod.id), following = !!mine;
  if (mine && eps[0]?.date && mine.seen !== eps[0].date) { mine.seen = eps[0].date; idb.put('kv', S.pods, 'pods').catch(() => {}); }   // opening the show clears its New badge
  setView(`<div class="hero">${safeUrl(pod.art) ? `<div class="art" style="background-image:url('${safeUrl(pod.art)}')"></div>` : artDiv(null, pod.name, '', 'mic')}<div class="hero-text"><div class="kind">Podcast</div><h1>${esc(pod.name)}</h1>
    <div class="muted">${esc(pod.author || '')} · ${eps.length} episode${eps.length === 1 ? '' : 's'}</div>
    <div class="hero-actions"><button class="btn primary" data-act="play-view">${ic('play')}Play latest</button><button class="btn" data-act="follow-pod">${ic(following ? 'check' : 'plus')}${following ? 'Following' : 'Follow'}</button></div></div></div>`,
    eps.length ? trackList(viewIds) : '<div class="empty">No playable episodes were found for this show.</div>');
}
async function podcastsView() {
  const here = location.hash, dls = Object.values(S.dl).filter(x => x.kind === 'episode');
  viewIds = dls.map(e => e.id);
  setView('<h1>Online</h1>', onlineChips('podcasts'), searchForm('pod', S.podQ, 'Search free podcasts'), `<div class="hero-actions" style="margin:0 0 8px"><button class="btn" data-act="add-feed" aria-label="Add any podcast using its RSS feed address">${ic('plus')}Add by feed address</button></div>`, '<div id="pod-results"></div>',
    S.pods.length ? `<h2>Your podcasts</h2><div class="grid">${S.pods.map(podCard).join('')}</div>` : '',
    dls.length ? '<h2>Downloaded episodes</h2>' : '', dls.length ? trackList(viewIds) : null, '<div id="pod-top"></div>');
  const fill = (sel, html) => { const el = $(sel); if (el && location.hash === here) el.innerHTML = html; };
  // Check followed shows for episodes newer than the last one seen, and badge them.
  (async () => {
    let changed = false;
    for (const pod of S.pods.slice(0, 12)) {
      try {
        const newest = (await loadPodcast(pod.id, 3 * 3600e3)).eps[0]?.date;
        if (!newest) continue;
        if (!pod.seen) { pod.seen = newest; changed = true; }
        else if (newest > pod.seen && location.hash === here) { const c = $$('#view .card[data-pod]').find(x => x.dataset.pod === pod.id); if (c && !$('.badge', c)) c.insertAdjacentHTML('beforeend', '<span class="badge">New</span>'); }
      } catch { /* offline or directory busy: try again next visit */ }
    }
    if (changed) idb.put('kv', S.pods, 'pods').catch(() => {});
  })();
  if (S.podQ) {
    fill('#pod-results', '<p class="muted">Searching…</p>');
    try { const r = await searchPods(S.podQ); fill('#pod-results', r.length ? `<h2>Results for “${esc(S.podQ)}”</h2><div class="grid">${r.map(podCard).join('')}</div>` : `<div class="empty">No podcasts match “${esc(S.podQ)}”.</div>`); }
    catch { fill('#pod-results', offlineNote('podcast')); }
  } else {
    const g = S.podGenre, label = POD_GENRES.find(x => x[0] === g)?.[1] || 'All';
    const chips = `<div class="chips pod-genres">${POD_GENRES.map(([id, n]) => `<button class="chip ${id === g ? 'active' : ''}" data-act="pod-genre" data-g="${id}">${esc(n)}</button>`).join('')}</div>`;
    const head = `<h2>Top 50${g ? ` in ${esc(label)}` : ''}</h2><p class="muted" style="margin:-6px 0 10px">The most popular podcasts in ${esc(regionName || 'your country')} right now, from Apple's charts.</p>`;
    fill('#pod-top', head + chips + '<p class="muted">Loading the chart…</p>');
    try { const top = await loadTopPods(g); fill('#pod-top', head + chips + (top.length ? `<div class="grid">${top.map(rankCard).join('')}</div>` : '<div class="empty">No chart for this category right now.</div>')); }
    catch { fill('#pod-top', head + chips + (navigator.onLine ? '<div class="empty">Couldn\'t load this chart. Try again in a moment.</div>' : offlineNote('podcast'))); }
  }
}
async function downloadEp(t) {
  if (S.dl[t.id]) return toast('Already downloaded');
  if (!navigator.onLine) return toast('Connect to the internet to download');
  toast('Downloading…');
  try {
    const r = await fetch(t.url); if (!r.ok) throw new Error('HTTP ' + r.status);
    await idb.put('files', await r.blob(), t.id);
    S.dl[t.id] = t; await idb.put('kv', S.dl, 'dl');
    toast('Downloaded — plays offline now');
    if (['online', 'podcast', 'archive'].includes(page())) rerender();
  } catch (e) {
    toast(e?.name === 'QuotaExceededError' ? 'Storage is full' : "This one can't be downloaded into a web app. You can still stream it.");
  }
}
async function removeDl(t) { await idb.del('files', t.id); delete S.dl[t.id]; await idb.put('kv', S.dl, 'dl'); toast('Download removed'); if (['online', 'podcast', 'archive'].includes(page())) rerender(); }

// --- radio (Radio Browser community directory) ---
const RB = ['de1', 'de2', 'fi1', 'nl1', 'at1'].map(h => `https://${h}.api.radio-browser.info`);
let rbBase = null; const radMem = new Map();
async function rb(path) {
  for (const base of rbBase ? [rbBase, ...RB.filter(b => b !== rbBase)] : RB) {
    try { const d = await fetchJSON(base + path); rbBase = base; return d; } catch {}
  }
  throw new Error('radio directory unreachable');
}
const regionName = (() => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(CC) || ''; } catch { return ''; } })();
const hlsOK = !!audio.canPlayType('application/vnd.apple.mpegurl');
async function radioList(q) {
  const cc = S.radCC ?? CC, tag = S.radTag;
  const key = q ? 'q:' + q : `@${cc}|${tag}`; if (radMem.has(key)) return radMem.get(key);
  const p = new URLSearchParams({ limit: 150, hidebroken: 'true', order: 'clickcount', reverse: 'true', is_https: 'true' });
  if (q) p.set('name', q); else { if (cc) p.set('countrycode', cc); if (tag) p.set('tag', tag); }
  const seen = new Set();
  const list = (await rb('/json/stations/search?' + p)).filter(r => r.stationuuid && (!r.hls || hlsOK) && /^https:/i.test(r.url_resolved || '')).map(r => ({
    id: 'st:' + r.stationuuid, kind: 'station', live: true, title: String(r.name || '').trim().slice(0, 120),
    artist: [r.country, ...String(r.tags || '').split(',').slice(0, 2)].map(x => String(x).trim()).filter(Boolean).join(' · ') || 'Radio',
    album: 'Live radio', url: r.url_resolved, art: r.favicon, artId: 'r:st:' + r.stationuuid,
  })).filter(st => st.title && !seen.has(norm(st.title)) && seen.add(norm(st.title)));
  if (q) {
    // The directory matches anywhere in the name, so put real name matches first and keyword-stuffed names last.
    const n = norm(q), words = new RegExp('(^|[^a-z0-9])' + n.replace(/[^a-z0-9 ]/g, ''));
    const score = st => { const t = norm(st.title); return (t.startsWith(n) ? 0 : words.test(t) ? 1 : 2) + (st.title.length > 60 ? 3 : 0) + (st.artist.startsWith(regionName) ? 0 : 0.5); };
    list.sort((a, b) => score(a) - score(b));
  }
  radMem.set(key, list); return list;
}
async function toggleStation(t) {
  if (t.liked) { t.liked = 0; S.stations = S.stations.filter(x => x.id !== t.id); } else { t.liked = Date.now(); S.stations.push(t); }
  await idb.put('kv', S.stations, 'stations');
  toast(t.liked ? 'Added to favourite stations' : 'Removed from favourites');
  if (S.saved[t.id]) keep(t);
  syncPlayer(); if (page() === 'online' || page() === 'queue') rerender();
}
function radioCountryOptions() {
  const cur = S.radCC ?? CC, list = rbCountries || [{ cc: cur, name: regionName || cur }].filter(c => c.cc);
  return `<option value="" ${cur === '' ? 'selected' : ''}>Worldwide</option>` + list.map(c => `<option value="${esc(c.cc)}" ${c.cc === cur ? 'selected' : ''}>${esc(c.name)}${c.n ? ` (${c.n})` : ''}</option>`).join('');
}
const RADIO_TAGS = ['pop', 'rock', 'news', 'talk', 'sports', 'hits', 'dance', 'classical', 'jazz', 'country', 'folk', 'oldies', '80s', '90s', 'chillout'];
let rbCountries = null;
async function radioCountries() {
  if (rbCountries) return rbCountries;
  let list = await idb.get('kv', 'rbCountries').catch(() => null);
  if (!list) {
    list = (await rb('/json/countries?order=name&hidebroken=true')).filter(c => c.iso_3166_1 && c.name && c.stationcount > 0).map(c => ({ cc: c.iso_3166_1.toUpperCase(), name: c.name, n: c.stationcount }));
    idb.put('kv', list, 'rbCountries').catch(() => {});
  }
  return rbCountries = list;
}
const saveRadioPrefs = () => idb.put('kv', { cc: S.radCC, tag: S.radTag }, 'radioPrefs').catch(() => {});
async function addStation() {
  const url = (await ask({ title: 'Add a station by its address', text: 'Paste the station\'s stream address. Station websites often list it as “stream URL” or “listen link”.', input: 'https://', ok: 'Next' }) || '').trim();
  if (!url) return;
  if (!/^https:\/\/\S+\.\S+/i.test(url)) return toast('The address must start with https://');
  let host = 'My station'; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  const name = await ask({ title: 'Name this station', input: host, ok: 'Add' }); if (!name) return;
  const h = hashStr(url), id = 'st:custom:' + h;
  if (S.stations.some(x => x.id === id)) return toast('That station is already in your favourites');
  S.stations.push(reg({ id, kind: 'station', live: true, title: name, artist: 'Added by you', album: 'Live radio', url, art: '', artId: 'r:st:custom:' + h, liked: Date.now() }));
  await idb.put('kv', S.stations, 'stations'); toast('Station added to your favourites'); rerender();
}
view.addEventListener('change', async e => {
  if (e.target.dataset.set === 'minSecs') { S.hide.minSecs = +e.target.value; await idb.put('kv', S.hide, 'hide'); rebuild(); rerender(); toast(S.hide.minSecs ? 'Short clips hidden' : 'All lengths shown'); return; }
  if (e.target.id === 'rad-cc') { S.radCC = e.target.value; saveRadioPrefs(); rerender(); } });
async function radioView() {
  const here = location.hash, favs = S.stations.map(x => x.id);
  setView('<h1>Online</h1>', onlineChips('radio'), searchForm('rad', S.radQ, 'Search radio stations by name'),
    favs.length ? '<h2>Favourite stations</h2>' : '', favs.length ? trackList(favs) : null,
    `<div class="hero-actions" style="margin:0 0 8px"><select id="rad-cc" aria-label="Country">${radioCountryOptions()}</select><button class="btn" data-act="add-station" aria-label="Add any station using its stream address">${ic('plus')}Add by address</button></div>
     <div class="chips"><button class="chip ${S.radTag ? '' : 'active'}" data-act="rad-tag" data-tag="">All</button>${RADIO_TAGS.map(t => `<button class="chip ${S.radTag === t ? 'active' : ''}" data-act="rad-tag" data-tag="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
     <h2>${S.radQ ? `Stations matching “${esc(S.radQ)}”` : 'Most popular'}</h2>`, '<div id="rad-list"><p class="muted">Loading stations…</p></div>');
  radioCountries().then(() => { const sel = $('#rad-cc'); if (sel && location.hash === here && sel.options.length < 5) sel.innerHTML = radioCountryOptions(); }).catch(() => {});
  let node;
  try {
    const list = (await radioList(S.radQ)).map(st => S.remote.get(st.id)?.liked ? S.remote.get(st.id) : reg(st));
    node = list.length ? trackList(list.map(x => x.id)) : Object.assign(document.createElement('div'), { className: 'empty', textContent: 'No stations found.' });
  } catch { node = Object.assign(document.createElement('div'), { innerHTML: offlineNote('radio station') }); }
  if (location.hash === here && $('#rad-list')) $('#rad-list').replaceWith(node);
  markPlaying();
}
// --- free music (Internet Archive: live concerts, netlabels, old records) ---
const IA_SETS = [
  ['live', 'Live concerts', 'collection:etree'],
  ['netlabels', 'Netlabel albums', 'collection:netlabels'],
  ['78s', '78rpm records', 'collection:78rpm'],
  ['all', 'All audio', 'mediatype:(audio OR etree)'],
];
const iaMem = new Map(), iaListMem = new Map();
const iaOne = v => Array.isArray(v) ? v[0] : v;
const iaCard = a => `<a class="card" href="#/archive/${encodeURIComponent(a.id)}"><div class="art" style="background-image:url('https://archive.org/services/img/${encodeURIComponent(a.id)}')"></div><div class="card-title">${esc(a.name)}</div><div class="card-sub">${esc([a.artist, a.year].filter(Boolean).join(' · '))}</div></a>`;
async function iaSearch(q, set) {
  const base = (IA_SETS.find(x => x[0] === set) || IA_SETS[0])[2];
  const key = set + '|' + q; if (iaListMem.has(key)) return iaListMem.get(key);
  const words = q.replace(/[()\[\]{}:"\\^~\/]/g, ' ').trim();
  const run = async query => {
    const p = new URLSearchParams({ q: query, rows: 48, output: 'json' });
    for (const f of ['identifier', 'title', 'creator', 'year']) p.append('fl[]', f);
    p.append('sort[]', q ? 'downloads desc' : 'week desc');
    const d = await fetchJSON('https://archive.org/advancedsearch.php?' + p);
    return (d.response?.docs || []).filter(x => x.identifier).map(x => ({ id: x.identifier, name: String(iaOne(x.title) || x.identifier), artist: String(iaOne(x.creator) || ''), year: x.year || '' }));
  };
  const scope = `${base} AND mediatype:(audio OR etree)`;
  // Match the title or artist first; only fall back to descriptions when that finds nothing.
  let list = words ? await run(`(title:(${words}) OR creator:(${words})) AND ${scope}`) : await run(scope);
  if (words && !list.length) list = await run(`(${words}) AND ${scope}`);
  iaListMem.set(key, list); return list;
}
const iaSecs = v => { if (!v) return null; const p = String(v).split(':').map(Number); return p.some(isNaN) ? null : p.reduce((a, b) => a * 60 + b, 0); };
async function loadAlbum(id) {
  let data = iaMem.get(id) || await idb.get('kv', 'ia:' + id).catch(() => null);
  if (!data) {
    const d = await fetchJSON('https://archive.org/metadata/' + encodeURIComponent(id));
    const m = d.metadata; if (!m) throw new Error('not found');
    const album = { id, name: String(iaOne(m.title) || id), artist: String(iaOne(m.creator) || ''), year: String(iaOne(m.year) || iaOne(m.date) || '').slice(0, 4) };
    // One playable version of each track: prefer MP3 (small, plays everywhere), then Ogg, then FLAC.
    const files = d.files || [];
    const pick = [/^VBR MP3$/i, /MP3/i, /Ogg Vorbis/i, /^Flac$/i, /^(24bit )?Flac$/i].map(re => files.filter(f => re.test(f.format || '') && !/_sample\./.test(f.name))).find(l => l.length) || [];
    const tracks = pick.map((f, i) => ({
      id: `ia:${id}/${f.name}`, kind: 'ia', iaId: id, title: String(f.title || f.name.replace(/\.[^.]+$/, '').split('/').pop()),
      artist: String(f.creator || album.artist || 'Unknown artist'), album: album.name, trackNo: parseInt(f.track) || i + 1, duration: iaSecs(f.length),
      url: `https://archive.org/download/${encodeURIComponent(id)}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
      art: `https://archive.org/services/img/${encodeURIComponent(id)}`, artId: 'r:ia:' + id,
    })).sort((a, b) => a.trackNo - b.trackNo);
    if (!tracks.length) throw new Error('no audio');
    data = { album, tracks };
    if (S.ia.some(a => a.id === id)) idb.put('kv', data, 'ia:' + id).catch(() => {});
  }
  for (const t of data.tracks) reg(S.saved[t.id] || S.dl[t.id] || t);
  iaMem.set(id, data); return data;
}
function drawAlbum({ album, tracks }) {
  viewIds = tracks.map(t => t.id); S.curAlbum = album;
  const saved = S.ia.some(a => a.id === album.id);
  setView(`<div class="hero"><div class="art" style="background-image:url('https://archive.org/services/img/${encodeURIComponent(album.id)}')"></div><div class="hero-text"><div class="kind">Internet Archive</div><h1>${esc(album.name)}</h1>
    <div class="muted">${esc([album.artist, album.year].filter(Boolean).join(' · '))} · ${total(tracks)}</div>
    ${heroActions(`<button class="btn" data-act="save-album">${ic(saved ? 'check' : 'plus')}${saved ? 'Saved' : 'Save'}</button><button class="icon-btn" data-act="album-dl" aria-label="Download every track for offline">${ic('save')}</button>`)}</div></div>`,
    trackList(viewIds, { numbered: true }));
}
async function archiveView() {
  const here = location.hash, dls = Object.values(S.dl).filter(x => x.kind === 'ia');
  viewIds = dls.map(t => t.id);
  setView('<h1>Online</h1>', onlineChips('music'), searchForm('ia', S.iaQ, 'Search free music and live recordings'),
    `<div class="chips">${IA_SETS.map(([k, label]) => `<button class="chip ${S.iaSet === k ? 'active' : ''}" data-act="ia-set" data-set="${k}">${label}</button>`).join('')}</div>`,
    S.ia.length ? `<h2>Saved</h2><div class="grid">${S.ia.map(iaCard).join('')}</div>` : '',
    dls.length ? '<h2>Downloaded tracks</h2>' : '', dls.length ? trackList(viewIds) : null,
    `<h2>${S.iaQ ? `Results for “${esc(S.iaQ)}”` : 'Popular this week'}</h2>`, '<div id="ia-list"><p class="muted">Loading…</p></div>',
    '<p class="muted" style="font-size:13px;margin-top:24px">Free recordings shared on the Internet Archive (archive.org): fan-taped concerts that bands allow, netlabel releases and old records. It is not a catalogue of chart music.</p>');
  let html;
  try { const list = await iaSearch(S.iaQ, S.iaSet); html = list.length ? `<div class="grid">${list.map(iaCard).join('')}</div>` : '<div class="empty">Nothing found. Try another search or category.</div>'; }
  catch { html = offlineNote('free music'); }
  if (location.hash === here && $('#ia-list')) $('#ia-list').innerHTML = html;
}

// --- YouTube, through YouTube's official embedded player (videos stay on YouTube, with its adverts) ---
let ytPlayer = null, ytPlayerReady = false, ytPending = null, ytReady = null, ytToken = '', ytResults = null, ytHead = '';
const loadScript = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error('blocked')); document.head.append(el); });
const ytApiReady = () => ytReady ||= new Promise((res, rej) => {
  if (window.YT?.Player) return res();
  window.onYouTubeIframeAPIReady = res;
  loadScript('https://www.youtube.com/iframe_api').catch(e => { ytReady = null; rej(e); });
});
function parseYT(text) {
  try {
    const u = new URL(text.trim());
    if (!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(u.hostname)) return null;
    const list = u.searchParams.get('list');
    let v = u.searchParams.get('v');
    if (/youtu\.be$/i.test(u.hostname)) v = u.pathname.slice(1);
    const m = /^\/(shorts|embed|live)\/([\w-]{11})/.exec(u.pathname); if (m) v = m[2];
    if (v && /^[\w-]{11}$/.test(v)) return { v, list: /^[\w-]+$/.test(list || '') ? list : null };
    if (list && /^[\w-]+$/.test(list)) return { list };
  } catch {}
  return null;
}
const unEntity = text => { const el = document.createElement('textarea'); el.innerHTML = String(text || ''); return el.value; };
async function ytApi(path, params, withAccount) {
  const u = new URL('https://www.googleapis.com/youtube/v3/' + path);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const headers = {};
  if (withAccount) headers.Authorization = 'Bearer ' + ytToken; else u.searchParams.set('key', S.yt.key);
  const r = await fetch(u, { headers }), d = await r.json().catch(() => ({}));
  if (r.ok) return d;
  const why = `${d.error?.errors?.[0]?.reason || ''} ${d.error?.message || ''}`;
  if (r.status === 401) ytToken = '';
  throw new Error(/quota/i.test(why) ? "Today's free YouTube allowance is used up. It resets overnight." : r.status === 401 ? 'Your YouTube connection expired. Connect again.'
    : /key|credential/i.test(why) ? "YouTube didn't accept that key. Check it in Settings." : 'YouTube returned an error. Try again later.');
}
const ytSavedHas = id => S.ytSaved.some(x => x.id === id);
function ytList(items) {
  const el = document.createElement('div'); el.className = 'ytlist'; el._items = items;
  el.innerHTML = items.map((v, i) => `<div class="row yt-row" data-act="yt-play" data-i="${i}" data-yt="${esc(v.id)}">
    <div class="row-art"><div class="art" style="${safeUrl(v.thumb) ? `background-image:url('${safeUrl(v.thumb)}')` : ''}">${safeUrl(v.thumb) ? '' : ic('yt')}</div></div>
    <div class="row-main"><div class="row-title">${esc(v.title)}</div><div class="row-sub">${esc(v.channel || 'YouTube')}</div></div>
    <div class="row-album"></div>
    <button class="icon-btn like ${ytSavedHas(v.id) ? 'on' : ''}" data-act="yt-save" aria-label="${ytSavedHas(v.id) ? 'Remove from saved' : 'Save for later'}">${ic('heart')}</button>
    <div class="row-dur"></div><span></span></div>`).join('');
  return el;
}
function ytMark() { const cur = S.ytList[S.ytIdx]?.id, open = !$('#yt').hidden; $$('.yt-row').forEach(r => r.classList.toggle('playing', open && !!cur && r.dataset.yt === cur)); }
async function ytStart(items, i) {
  if (!navigator.onLine) return toast('YouTube needs an internet connection');
  try { await ytApiReady(); } catch { return toast("Couldn't load the YouTube player"); }
  S.ytList = items; S.ytIdx = i;
  const it = items[i]; if (!it) return;
  if (S.loadedId && !audio.paused) pauseNow();
  $('#yt').hidden = false; $('#yt-title').textContent = it.title || 'YouTube';
  $('#yt-open').href = it.list ? `https://music.youtube.com/playlist?list=${encodeURIComponent(it.list)}` : `https://music.youtube.com/watch?v=${encodeURIComponent(it.id)}`;
  if (!ytPlayer) {
    ytPlayer = new YT.Player('yt-frame', {
      host: S.yt.signedIn ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com', width: '100%', height: '100%', videoId: it.list ? undefined : it.id,
      playerVars: it.list ? { listType: 'playlist', list: it.list, autoplay: 1, playsinline: 1, origin: location.origin } : { autoplay: 1, playsinline: 1, rel: 0, origin: location.origin },
      events: { onReady: () => { ytPlayerReady = true; if (ytPending) { const p = ytPending; ytPending = null; ytLoad(p); } }, onStateChange: ytState, onError: e => { toast([101, 150, 153].includes(e?.data) ? "The owner doesn't allow this one to play inside other apps. Use the arrow to open it in YouTube Music." : "YouTube couldn't play that one. Use the arrow to open it in YouTube Music."); if (S.ytIdx < S.ytList.length - 1) ytNext(); } },
    });
  } else if (ytPlayerReady) ytLoad(it); else ytPending = it;
  ytMark();
}
function ytLoad(it) { if (it.list) ytPlayer.loadPlaylist({ list: it.list }); else ytPlayer.loadVideoById(it.id); }
function ytNext() { if (S.ytIdx < S.ytList.length - 1 && !S.ytList[S.ytIdx]?.list) ytStart(S.ytList, S.ytIdx + 1); }
function ytState(e) {
  if (e.data === 1) {
    if (S.loadedId && !audio.paused) pauseNow();
    const d = ytPlayer.getVideoData?.(), it = S.ytList[S.ytIdx];
    if (d?.title) {
      $('#yt-title').textContent = d.title;
      if (it && !it.list && it.id === d.video_id && it.title !== d.title) {   // a pasted link has no title until it plays
        it.title = d.title; it.channel = d.author || it.channel;
        if (ytSavedHas(it.id)) idb.put('kv', S.ytSaved, 'ytSaved').catch(() => {});
        $$('.yt-row').filter(r => r.dataset.yt === it.id).forEach(r => { $('.row-title', r).textContent = it.title; $('.row-sub', r).textContent = it.channel || 'YouTube'; });
      }
    }
  } else if (e.data === 0) ytNext();
}
// The player is built once, so changing how it signs in means building it again.
function ytReset() {
  try { ytPlayer?.destroy?.(); } catch {}
  ytPlayer = null; ytPlayerReady = false; ytPending = null;
  $('.yt-box').innerHTML = '<div id="yt-frame"></div>'; $('#yt').hidden = true; ytMark();
}
function ytClose() { try { ytPlayer?.stopVideo?.(); } catch {} $('#yt').hidden = true; ytMark(); }
async function ytSubmit(q) {
  const link = parseYT(q);
  if (link) {
    S.ytQ = '';
    if (link.v) { ytResults = [{ id: link.v, title: 'YouTube video', channel: '', thumb: `https://i.ytimg.com/vi/${link.v}/mqdefault.jpg` }]; ytHead = 'From your link'; rerender(); return ytStart(ytResults, 0); }
    rerender(); return ytStart([{ list: link.list, title: 'YouTube playlist' }], 0);
  }
  S.ytQ = q;
  if (!q) { ytResults = null; return rerender(); }
  if (!S.yt.key) return toast('To search by name, add a YouTube key in Settings. Pasting a link works without one.');
  try {
    const d = await ytApi('search', { part: 'snippet', type: 'video', videoCategoryId: '10', maxResults: 25, q });
    ytResults = (d.items || []).filter(x => x.id?.videoId).map(x => ({ id: x.id.videoId, title: unEntity(x.snippet?.title), channel: unEntity(x.snippet?.channelTitle), thumb: x.snippet?.thumbnails?.medium?.url }));
    ytHead = `Results for “${q}”`;
  } catch (e) { toast(e.message); }
  rerender();
}
async function ytConnect() {
  try { if (!window.google?.accounts?.oauth2) await loadScript('https://accounts.google.com/gsi/client'); } catch { return toast("Couldn't load Google sign-in"); }
  google.accounts.oauth2.initTokenClient({
    client_id: S.yt.clientId, scope: 'https://www.googleapis.com/auth/youtube.readonly',
    callback: r => {
      if (!r.access_token) return toast('Google sign-in was cancelled');
      ytToken = r.access_token; setTimeout(() => { ytToken = ''; }, ((r.expires_in || 3600) - 60) * 1000);
      if (page() === 'online') rerender();
    },
    error_callback: () => toast('Google sign-in was cancelled'),
  }).requestAccessToken();
}
async function ytOpenPlaylist(id, name) {
  try {
    const d = await ytApi('playlistItems', { part: 'snippet', playlistId: id, maxResults: 50 }, true);
    ytResults = (d.items || []).filter(x => x.snippet?.resourceId?.videoId && x.snippet.title !== 'Deleted video' && x.snippet.title !== 'Private video')
      .map(x => ({ id: x.snippet.resourceId.videoId, title: x.snippet.title, channel: (x.snippet.videoOwnerChannelTitle || '').replace(/ - Topic$/, ''), thumb: x.snippet.thumbnails?.medium?.url }));
    ytHead = name; rerender(); view.scrollTop = 0;
  } catch (e) { toast(e.message); if (!ytToken) rerender(); }
}
async function youtubeView() {
  const here = location.hash;
  setView('<h1>Online</h1>', onlineChips('youtube'), searchForm('yt', S.ytQ, S.yt.key ? 'Search YouTube, or paste a YouTube link' : 'Paste a YouTube link'),
    S.yt.key ? '' : '<p class="muted">Paste the address of a YouTube or YouTube Music song or playlist to play it here. To search by name, add a free YouTube key in <a href="#/settings" style="color:var(--accent)">Settings</a>.</p>',
    ytResults ? `<h2>${esc(ytHead)}</h2>` : '', ytResults ? (ytResults.length ? ytList(ytResults) : '<div class="empty">Nothing found.</div>') : null,
    S.yt.clientId ? '<h2>My YouTube account</h2>' + (ytToken ? '<div id="yt-pl" class="grid"><p class="muted">Loading your playlists…</p></div>' : `<div class="hero-actions"><button class="btn" data-act="yt-connect">${ic('user')}Connect my account</button></div>`) : '',
    S.ytSaved.length ? '<h2>Saved</h2>' : '', S.ytSaved.length ? ytList(S.ytSaved) : null,
    `<p class="muted" style="font-size:13px;margin-top:24px">This plays through YouTube's own player${S.yt.signedIn ? ', using the YouTube account signed in to this browser' : ", with YouTube's adverts. YouTube Premium members can remove them in Settings"}. It needs an internet connection, and stops when the screen locks or you switch apps.</p>`);
  ytMark();
  if (ytToken && S.yt.clientId) try {
    const d = await ytApi('playlists', { part: 'snippet,contentDetails', mine: 'true', maxResults: 50 }, true);
    const card = (id, name, sub, thumb) => `<button class="card" style="text-align:left" data-act="yt-open-pl" data-id="${esc(id)}" data-name="${esc(name)}"><div class="art" style="${safeUrl(thumb) ? `background-image:url('${safeUrl(thumb)}')` : 'background:linear-gradient(135deg,#c4302b,#5c1512)'}">${safeUrl(thumb) ? '' : ic('heart')}</div><div class="card-title">${esc(name)}</div><div class="card-sub">${esc(sub)}</div></button>`;
    const html = card('LL', 'Liked videos', 'Includes songs liked in YouTube Music', '') + (d.items || []).map(x => card(x.id, x.snippet?.title || 'Playlist', `${x.contentDetails?.itemCount ?? ''} videos`, x.snippet?.thumbnails?.medium?.url)).join('');
    if (location.hash === here && $('#yt-pl')) $('#yt-pl').innerHTML = html;
  } catch (e) { if (location.hash === here && $('#yt-pl')) $('#yt-pl').innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
}
const YT_HELP = `Pasting YouTube links needs no setup. These two optional items come from Google, are free, and stay on this device.

1. SEARCH BY NAME — a YouTube API key
 • Go to console.cloud.google.com and sign in with your Google account.
 • Create a project (any name, for example "Cadence").
 • Open "APIs & Services" → "Library", find "YouTube Data API v3" and press Enable.
 • Open "APIs & Services" → "Credentials" → "Create credentials" → "API key".
 • Copy the key into the first box here and press Save.
 The free allowance is about 100 searches a day.

2. YOUR OWN PLAYLISTS AND LIKES — a Google client ID
 • In the same project open "OAuth consent screen" (it may be called "Google Auth Platform"). Choose External, fill in the app name and your email, and add your own Google address under "Test users".
 • Open "Credentials" → "Create credentials" → "OAuth client ID" → type "Web application".
 • Under "Authorised JavaScript origins" add:  ${location.origin}
 • Copy the client ID (it ends in .apps.googleusercontent.com) into the second box and press Save.
 • On the YouTube page press "Connect my account". Google will warn that the app is unverified; that is expected for a personal project — choose Continue.

Google renames these screens from time to time, so a label may differ slightly from the above.`;

function remoteMenu(t, ev, ctx = {}) {
  const ep = t.kind === 'episode', ia = t.kind === 'ia';
  openMenu([
    { label: 'Play next', icon: 'next', fn: () => enqueue([t.id], true) },
    { label: 'Add to queue', icon: 'queue', fn: () => enqueue([t.id], false) },
    (ep || ia) && !S.dl[t.id] && { label: 'Download for offline', icon: 'save', fn: () => downloadEp(t) },
    (ep || ia) && S.dl[t.id] && { label: 'Remove download', icon: 'x', fn: () => removeDl(t) },
    ep && t.desc && { label: 'About this episode', icon: 'text', fn: () => { const d = $('#lyr'); lyrLive = null; $('.lrc', d).hidden = true; $('pre', d).hidden = false; $('h3', d).textContent = t.title; $('pre', d).textContent = t.desc.replace(/<[^>]+>/g, ''); $('.lyr-src', d).textContent = `${t.artist} · ${t.album}`; d.showModal(); $('pre', d).scrollTop = 0; } },
    ep && S.epos[t.id] && { label: 'Start from the beginning', icon: 'prev', fn: () => { delete S.epos[t.id]; idb.put('kv', S.epos, 'epos'); if (S.loadedId === t.id) audio.currentTime = 0; else rerender(); } },
    ep && { label: 'Go to podcast', icon: 'mic', fn: () => nav(`#/podcast/${encodeURIComponent(t.podId)}`) },
    ia && { label: 'Go to album', icon: 'disc', fn: () => nav(`#/archive/${encodeURIComponent(t.iaId)}`) },
    { label: 'Add to playlist', icon: 'plus', fn: () => pickPlaylist([t.id]) },
    t.kind !== 'station' && { label: t.liked ? 'Remove from liked songs' : 'Like', icon: 'heart', fn: () => toggleLike(t.id) },
    { label: 'Select', icon: 'check', fn: () => toggleSel(t.id) },
    t.kind === 'station' && { label: t.liked ? 'Remove from favourite stations' : 'Add to favourite stations', icon: 'heart', fn: () => toggleStation(t) },
    ctx.np && { label: sleepLabel(), icon: 'moon', fn: () => sleepMenu() },
    ctx.np && ep && { label: `Playback speed: ${S.fx.rate}×`, icon: 'clock', fn: () => openMenu([0.75, 1, 1.25, 1.5, 1.75, 2].map(r => ({ label: `${r}×${r === S.fx.rate ? '  ✓' : ''}`, fn: () => setRate(r) })), null, 'Podcast speed') },
    ctx.queueOffset && ctx.i != null && { label: 'Remove from queue', icon: 'x', fn: () => { S.queue.splice(ctx.queueOffset + ctx.i, 1); saveState(); rerender(); } },
  ], ev, `${t.title} · ${t.artist}`);
}
view.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const q = f.elements.q.value.trim();
  if (f.dataset.form === 'yt') return ytSubmit(q);
  if (f.dataset.form === 'pod') S.podQ = q; else if (f.dataset.form === 'ia') S.iaQ = q; else S.radQ = q;
  route();
});

/* ---------------- saving songs out of the app as files ---------------- */
const safeName = n => String(n || 'song').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 180);
async function exportTracks(ids) {
  const ts = [...new Set(ids)].map(id => S.tracks.get(id)).filter(Boolean);
  if (!ts.length) return toast('Only songs in your library can be saved as files');
  if (importing) return toast('Wait for the import to finish first');
  let dir = null;
  // On a computer, several songs go into a folder you pick; otherwise each one arrives as a normal download.
  if (ts.length > 1 && window.showDirectoryPicker && isDesktop()) { try { dir = await showDirectoryPicker({ mode: 'readwrite', id: 'export' }); } catch (e) { if (e?.name === 'AbortError') return; dir = null; } }
  if (!dir && ts.length > 12 && !await ask({ title: `Download ${ts.length} songs?`, text: 'Each song is saved to your Downloads folder as a separate file. Your browser may ask once whether to allow several downloads.', ok: 'Download' })) return;
  let done = 0, failed = 0;
  for (const t of ts) {
    setBanner(`<span>Saving songs… ${done + failed + 1} / ${ts.length}</span><div class="bar"><i style="width:${(done + failed) / ts.length * 100}%"></i></div>`);
    try {
      const file = await getFile(t.id), name = safeName(t.fileName || `${t.artist} - ${t.title}`);
      if (dir) { const w = await (await dir.getFileHandle(name, { create: true })).createWritable(); await w.write(file); await w.close(); }
      else {
        const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name;
        document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
        if (ts.length > 1) await new Promise(r => setTimeout(r, 450));
      }
      done++;
    } catch (e) { console.warn('save file', e); failed++; if (e?.name === 'NotAllowedError' && t.linked) { setBanner(''); return toast('Reconnect your music folder first'); } }
  }
  setBanner('');
  toast(done ? `Saved ${done} song${done === 1 ? '' : 's'} ${dir ? `to “${dir.name}”` : 'to your downloads'}${failed ? ` · ${failed} could not be saved` : ''}` : 'Those songs could not be saved');
}
const saveBtn = `<button class="icon-btn" data-act="export-view" aria-label="Download these songs as files to this device">${ic('save')}</button>`;

/* ---------------- sharing playlists as links ---------------- */
// The link carries only song names and artists (plus the public address of any radio station,
// podcast episode or free-music track). The other person's Cadence matches them to their own music.
const b64url = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const pipeBytes = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
async function packShare(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  return window.CompressionStream ? '1' + b64url(await pipeBytes(raw, new CompressionStream('deflate-raw'))) : '0' + b64url(raw);
}
async function unpackShare(code) {
  let bytes = unb64url(code.slice(1));
  if (code[0] === '1') bytes = await pipeBytes(bytes, new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function sharePlaylist(name, ids) {
  const items = ids.map(T).filter(Boolean).slice(0, 500).map(t => t.url
    ? { k: t.kind, t: t.title, a: t.kind === 'station' && t.artist === 'Added by you' ? 'Radio station' : t.artist, u: t.url, ...(t.kind === 'episode' ? { p: t.podId } : t.kind === 'ia' ? { p: t.iaId } : {}) }
    : { t: t.title, a: t.artist || '' });
  if (!items.length) return toast('This playlist is empty');
  const url = `${location.origin}${location.pathname}#/shared/${await packShare({ v: 1, n: name, s: items })}`;
  const text = `${name} — ${items.length} song${items.length === 1 ? '' : 's'}. Open it in Cadence, the free offline music player:`;
  try { if (navigator.share && !isDesktop()) return await navigator.share({ title: name, text, url }); } catch (e) { if (e?.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Link copied — paste it into a message to share the playlist'); }
  catch { ask({ title: 'Copy this link', text: 'Select and copy it, then paste it into a message.', input: url, ok: 'Done' }); }
}
let sharedNow = null;   // the shared playlist being viewed: { name, rows: [{ item, id }] }
function matchShared(items) {
  const exact = new Map(), byTitle = new Map();
  for (const t of shown()) {
    const tk = norm(cleanTitle(t.title)); exact.set(`${tk}|${norm(t.artist)}`, t);
    (byTitle.get(tk) || byTitle.set(tk, []).get(tk)).push(t);
  }
  return items.map(it => {
    if (it.u && /^https:\/\//i.test(it.u)) {   // online items play straight from their address
      const kind = it.k === 'station' || it.k === 'episode' || it.k === 'ia' ? it.k : 'ia', id = (kind === 'station' ? 'st:shared:' : kind === 'episode' ? 'ep:shared:' : 'ia:shared:') + hashStr(it.u);
      const item = S.remote.get(id) || reg({ id, kind, title: String(it.t || 'Untitled').slice(0, 200), artist: String(it.a || '').slice(0, 200), album: kind === 'station' ? 'Live radio' : '', url: it.u, live: kind === 'station', artId: 'r:' + id, ...(kind === 'episode' ? { podId: String(it.p || '') } : kind === 'ia' ? { iaId: String(it.p || '') } : {}) });
      return { it, id: item.id };
    }
    const tk = norm(cleanTitle(it.t)), t = exact.get(`${tk}|${norm(it.a)}`) || (byTitle.get(tk) || []).find(x => !it.a || !x.artist || sameArtist(x.artist, it.a));
    return { it, id: t?.id || null };
  });
}

/* ---------------- selecting several songs ---------------- */
function syncSel() {
  if (S.sel.size && $('#selbar').hidden) overlayOpened(); else if (!S.sel.size && !$('#selbar').hidden) overlayClosed();
  $('#selbar').hidden = !S.sel.size; document.body.classList.toggle('selecting', !!S.sel.size);
  $('#sel-count').textContent = `${S.sel.size} selected`;
  $$('.row').forEach(r => r.classList.toggle('sel', S.sel.has(r.dataset.id)));
}
function toggleSel(id) { S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); syncSel(); }
function clearSel() { if (S.sel.size) { S.sel.clear(); syncSel(); } }

/* ---------------- drag to reorder (playlists and the queue) ---------------- */
let dragging = null;
view.addEventListener('pointerdown', e => {
  const h = e.target.closest('.grip'); if (!h) return;
  const row = h.closest('.row'), list = row.closest('.tracklist');
  e.preventDefault(); h.setPointerCapture(e.pointerId);
  dragging = { row, list, from: $$('.row', list).indexOf(row) }; row.classList.add('dragging');
});
view.addEventListener('pointermove', e => {
  if (!dragging) return;
  const { row, list } = dragging;
  const over = $$('.row', list).find(r => { if (r === row) return false; const b = r.getBoundingClientRect(); return e.clientY >= b.top && e.clientY <= b.bottom; });
  if (over) { const b = over.getBoundingClientRect(); over[e.clientY > b.top + b.height / 2 ? 'after' : 'before'](row); }
  const vb = view.getBoundingClientRect();
  if (e.clientY < vb.top + 60) view.scrollTop -= 14; else if (e.clientY > vb.bottom - 60) view.scrollTop += 14;
});
async function endDrag() {
  if (!dragging) return;
  const { row, list, from } = dragging; dragging = null; row.classList.remove('dragging');
  const to = $$('.row', list).indexOf(row); if (to === from) return;
  const ids = [...list._ids]; ids.splice(to, 0, ...ids.splice(from, 1));
  const ctx = list._ctx, p = ctx.playlistId && S.playlists.find(x => x.id === ctx.playlistId);
  if (p) { p.trackIds = ids; await idb.put('playlists', p); }
  else if (ctx.queueOffset) { S.queue = [...S.queue.slice(0, ctx.queueOffset), ...ids]; dropPrepared(); saveState(); }
  rerender();
}
view.addEventListener('pointerup', endDrag); view.addEventListener('pointercancel', endDrag);
view.addEventListener('click', e => { if (e.target.closest('.grip')) e.stopPropagation(); }, true);

/* ---------------- smart playlists ---------------- */
const SMART = {
  never: ['Never played'], stale: ['Not played for a while', 'Days since it was last played', '90'], recent: ['Recently added', 'Added within this many days', '30'],
  top: ['Most played'], genre: ['Genre', 'Genre contains', ''], artist: ['Artist', 'Artist name contains', ''], decade: ['Decade', 'Decade, for example 1990', '1990'], any: ['All songs'],
};
function smartText(p) {
  const r = p.smart, v = r.value;
  const base = { never: 'Never played', stale: `Not played in ${v} days`, recent: `Added in the last ${v} days`, top: 'Most played', genre: `Genre: ${v}`, artist: `Artist: ${v}`, decade: `${Math.floor((parseInt(v) || 0) / 10) * 10}s`, any: 'All songs' }[r.type] || '';
  return base + (r.liked ? ', liked only' : '');
}
function smartIds(p) {
  const r = p.smart, now = Date.now(), day = 864e5, n = parseFloat(r.value) || 0, v = norm(r.value);
  const test = {
    never: t => !t.plays, stale: t => t.plays > 0 && now - t.lastPlayed > n * day, recent: t => now - t.addedAt < n * day, top: t => t.plays > 0,
    genre: t => !!v && norm(t.genre).includes(v), artist: t => !!v && norm(`${t.artist} ${t.albumArtist}`).includes(v),
    decade: t => !!t.year && Math.floor(t.year / 10) === Math.floor(n / 10),
  }[r.type] || (() => true);
  const order = { top: (a, b) => b.plays - a.plays, recent: (a, b) => b.addedAt - a.addedAt, stale: (a, b) => a.lastPlayed - b.lastPlayed }[r.type] || SORTS.artist;
  return [...shown()].filter(t => test(t) && (!r.liked || t.liked)).sort(order).slice(0, 500).map(t => t.id);
}
async function newSmart() {
  const d = $('#smart'), f = $('form', d).elements;
  f.type.innerHTML = Object.entries(SMART).map(([k, m]) => `<option value="${k}">${m[0]}</option>`).join('');
  const sync = () => { const m = SMART[f.type.value]; $('.smart-val', d).hidden = !m[1]; $('.smart-val span', d).textContent = m[1] || ''; f.value.value = m[2] || ''; if (!f.name.value || Object.values(SMART).some(x => x[0] === f.name.value)) f.name.value = m[0]; };
  f.type.onchange = sync; f.name.value = ''; f.liked.checked = false; sync();
  d.returnValue = 'cancel'; d.showModal();
  await new Promise(r => d.addEventListener('close', r, { once: true }));
  if (d.returnValue !== 'ok') return;
  const p = { id: uid(), name: f.name.value.trim() || SMART[f.type.value][0], trackIds: [], createdAt: Date.now(), smart: { type: f.type.value, value: f.value.value.trim(), liked: f.liked.checked } };
  S.playlists.push(p); await idb.put('playlists', p); renderSidePlaylists(); location.hash = `#/playlist/${p.id}`;
}

/* ---------------- duplicates ---------------- */
function dupGroups() {
  const m = new Map();
  for (const t of S.tracks.values()) { const k = `${norm(cleanTitle(t.title))}|${norm(t.artist)}`; (m.get(k) || m.set(k, []).get(k)).push(t); }
  // Keep the copy that is liked / most played / biggest (usually the best quality) first in each group.
  return [...m.values()].filter(g => g.length > 1).map(g => g.sort((a, b) => (!!b.liked - !!a.liked) || (b.plays || 0) - (a.plays || 0) || b.size - a.size)).sort((a, b) => a[0].title.localeCompare(b[0].title));
}
async function removeDuplicates() {
  const groups = dupGroups(), extra = groups.flatMap(g => g.slice(1));
  if (!extra.length) return;
  if (!await ask({ title: `Remove ${extra.length} extra cop${extra.length === 1 ? 'y' : 'ies'}?`, text: 'The first song in each group is kept, and takes over the play counts, likes and playlist places of the copies. Files in linked folders are not touched.', ok: 'Remove', danger: true })) return;
  const swap = new Map();
  for (const g of groups) {
    const keepT = g[0];
    for (const x of g.slice(1)) { swap.set(x.id, keepT.id); keepT.plays = (keepT.plays || 0) + (x.plays || 0); keepT.liked ||= x.liked; keepT.lastPlayed = Math.max(keepT.lastPlayed || 0, x.lastPlayed || 0); }
    await idb.put('tracks', keepT);
  }
  for (const p of S.playlists) { if (!p.trackIds.some(i => swap.has(i))) continue; p.trackIds = [...new Set(p.trackIds.map(i => swap.get(i) || i))]; await idb.put('playlists', p); }
  await deleteTracks(extra.map(t => t.id));
  toast(`Removed ${extra.length} duplicate${extra.length === 1 ? '' : 's'}`);
}
// Folder view: browse linked folders as they are stored; songs added with "Add files" sit under "Added files".
const folderHref = (fid, prefix) => `#/folder/${encodeURIComponent(fid)}/${encodeURIComponent(prefix)}`;
function folderContents(fid, prefix) {
  const subs = new Map(), songs = [];
  for (const t of S.tracks.values()) {
    if (fid === 'added' ? t.folderId : t.folderId !== fid) continue;
    if (fid !== 'added' && !(t.path || '').startsWith(prefix)) continue;
    const rest = fid === 'added' ? t.fileName : t.path.slice(prefix.length), cut = rest.indexOf('/');
    if (cut < 0) songs.push(t);
    else { const n = rest.slice(0, cut), e = subs.get(n) || subs.set(n, { n: 0, art: null }).get(n); e.n++; if (!e.art && S.artUrls.has(t.artId)) e.art = t.artId; }
  }
  return { subs: [...subs.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })), songs };
}
const folderHiddenBy = (fid, prefix) => S.hide.folders.find(h => `${fid}|${prefix}`.startsWith(h));
const folderRow = (href, name, n, art, hidden) => `<a class="folder-row ${hidden ? 'is-hidden' : ''}" href="${href}">${art ? artDiv(art, name) : `<div class="art folder-ic">${ic('folder')}</div>`}<div class="row-main"><div class="row-title">${esc(name)}</div><div class="row-sub">${n} song${n === 1 ? '' : 's'}${hidden ? ' · Hidden' : ''}</div></div><span class="chev">›</span></a>`;
async function setFolderHidden(key, hide) {
  S.hide.folders = S.hide.folders.filter(h => h !== key && !(hide && h.startsWith(key)));
  if (hide) S.hide.folders.push(key);
  await idb.put('kv', S.hide, 'hide'); rebuild(); rerender(); syncPlayer();
  toast(hide ? 'Folder hidden from your library' : 'Folder shown again');
}
const tagCard = (href, title, n, icon) => `<a class="card" href="${href}">${artDiv(null, title, '', icon)}<div class="card-title">${esc(title)}</div><div class="card-sub">${n} song${n === 1 ? '' : 's'}</div></a>`;
const groupBy = fn => { const m = new Map(); for (const t of shown()) { const k = fn(t); if (k != null && k !== '') (m.get(k) || m.set(k, []).get(k)).push(t); } return m; };
const decadeOf = t => t.year ? Math.floor(t.year / 10) * 10 : null;

/* ---------------- sound settings ---------------- */
const dB = v => `${v > 0 ? '+' : ''}${v} dB`;
const onOff = (key, label, tip) => `<button class="btn ${S.fx[key] ? 'primary' : ''}" data-act="fx-toggle" data-key="${key}" aria-label="${tip}">${label}: ${S.fx[key] ? 'On' : 'Off'}</button>`;
function setRate(r) { S.fx.rate = r; if (current()?.kind === 'episode') audio.defaultPlaybackRate = audio.playbackRate = r; saveFx(); toast(`Podcast speed ${r}×`); if (page() === 'settings') rerender(); }
function soundSettings() {
  const x = S.fx.xfade;
  return `<div class="settings-block"><h2>Sound</h2>
    <div class="hero-actions">${onOff('eq', 'Equalizer', 'Shape the bass, mids and treble of your music')}
      <select data-fx="preset" aria-label="Equalizer preset">${S.fx.preset === 'Custom' ? '<option selected>Custom</option>' : ''}${Object.keys(EQ_PRESETS).map(p => `<option ${p === S.fx.preset ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
    <div class="eq">${EQ_LABELS.map((l, i) => `<label><span>${l}</span><input type="range" min="-12" max="12" step="1" value="${S.fx.bands[i]}" data-fx="band" data-i="${i}" style="--p:${(S.fx.bands[i] + 12) / 24 * 100}%" aria-label="${l}"><b>${dB(S.fx.bands[i])}</b></label>`).join('')}</div>
    <p>The equalizer works on your own music files and downloads. Radio and streamed podcasts play unchanged.</p>
    <div class="eq"><label><span>Crossfade</span><input type="range" min="0" max="12" step="1" value="${x}" data-fx="xfade" style="--p:${x / 12 * 100}%" aria-label="Seconds of overlap between songs"><b>${x ? x + ' s' : 'Off'}</b></label></div>
    <div class="hero-actions">${onOff('gapless', 'Gapless playback', 'Open the next song early so there is no pause between songs')}${onOff('level', 'Even out volume', 'Turn loud songs down so songs play at a similar volume')}</div>
    <h2 style="margin-top:22px">Podcasts</h2>
    <div class="hero-actions"><select data-fx="rate" aria-label="Podcast speed">${[0.75, 1, 1.25, 1.5, 1.75, 2].map(r => `<option value="${r}" ${r === S.fx.rate ? 'selected' : ''}>Speed ${r}×</option>`).join('')}</select>${onOff('skipSilence', 'Skip silences', 'Speed through silent gaps in downloaded episodes')}</div>
    <p>Skipping silences works on downloaded episodes.</p></div>`;
}
view.addEventListener('input', e => {
  const el = e.target.closest('[data-fx]'); if (!el) return;
  const k = el.dataset.fx;
  if (k === 'band') {
    S.fx.bands[+el.dataset.i] = +el.value; S.fx.preset = 'Custom'; S.fx.eq = true;
    el.nextElementSibling.textContent = dB(+el.value); el.style.setProperty('--p', (+el.value + 12) / 24 * 100 + '%');
    ensureGraph(); applyEq();
  } else if (k === 'xfade') {
    S.fx.xfade = +el.value; el.nextElementSibling.textContent = S.fx.xfade ? S.fx.xfade + ' s' : 'Off'; el.style.setProperty('--p', S.fx.xfade / 12 * 100 + '%');
    if (!S.fx.xfade && !S.fx.gapless) dropPrepared();
  } else if (k === 'preset') {
    if (!EQ_PRESETS[el.value]) return;
    S.fx.bands = [...EQ_PRESETS[el.value]]; S.fx.preset = el.value; S.fx.eq = true; ensureGraph(); applyEq(); rerender();
  } else if (k === 'rate') return setRate(+el.value);
  saveFx();
});
view.addEventListener('change', e => { if (e.target.closest('[data-fx=band]')) rerender(); });

/* ---------------- views ---------------- */
function rowHTML(t, i, ctx) {
  const lead = ctx.numbered ? `<div class="row-num">${t.trackNo || i + 1}</div>` : `<div class="row-art">${artDiv(t.artId, t.album || t.title)}</div>`;
  const drag = ctx.playlistId || ctx.queueOffset;
  return `<div class="row ${drag ? 'drag-row' : ''} ${S.sel.has(t.id) ? 'sel' : ''}" data-act="play-row" data-i="${i}" data-id="${esc(t.id)}">
    ${drag ? `<span class="grip" aria-label="Drag to reorder">${ic('grip')}</span>` : ''}${lead}
    <div class="row-main"><div class="row-title">${esc(t.title)}</div><div class="row-sub">${esc(t.kind === 'episode' ? [t.album, S.dl[t.id] && 'Downloaded', S.epos[t.id] && `Resume at ${fmt(S.epos[t.id])}`].filter(Boolean).join(' · ') : (t.artist || 'Unknown artist') + (t.kind === 'ia' && S.dl[t.id] ? ' · Downloaded' : ''))}</div></div>
    <div class="row-album">${esc(t.kind === 'episode' ? t.artist : t.album || '')}</div>
    <button class="icon-btn like ${t.liked ? 'on' : ''}" data-act="like" aria-label="${t.kind === 'station' ? (t.liked ? 'Remove from favourite stations' : 'Add to favourite stations') : t.liked ? 'Remove from liked songs' : 'Add to liked songs'}">${ic('heart')}</button>
    <div class="row-dur">${t.live ? 'LIVE' : fmt(t.duration)}</div>
    <button class="icon-btn" data-act="row-menu" aria-label="More options for this song">${ic('dots')}</button>
  </div>`;
}
function trackList(ids, ctx = {}) {
  ids = ids.filter(has);
  const el = document.createElement('div'); el.className = 'tracklist'; el._ids = ids; el._ctx = ctx;
  const sentinel = document.createElement('div'); el.append(sentinel);
  let n = 0;
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) more(); }, { root: view, rootMargin: '1200px' });
  function more() {
    const end = Math.min(ids.length, n + 200); let html = '';
    for (; n < end; n++) html += rowHTML(T(ids[n]), n, ctx);
    sentinel.insertAdjacentHTML('beforebegin', html);
    if (n >= ids.length) { io.disconnect(); sentinel.remove(); }
    markPlaying();
  }
  more(); if (n < ids.length) io.observe(sentinel);
  return el;
}
const albumCard = al => `<a class="card" href="#/album/${encodeURIComponent(al.key)}">
  ${artDiv(al.artId, al.name, '', 'disc')}
  <div class="card-title">${esc(al.name)}</div><div class="card-sub">${esc(al.artist)}</div>
  <button class="card-play" data-act="play-album" data-key="${esc(al.key)}" aria-label="Play ${esc(al.name)}">${ic('play')}</button></a>`;
const artistCard = ar => `<a class="card artist" href="#/artist/${encodeURIComponent(ar.key)}">
  ${artDiv(ar.artId, ar.name, '', 'user')}
  <div class="card-title">${esc(ar.name)}</div><div class="card-sub">${ar.tracks.length} song${ar.tracks.length === 1 ? '' : 's'}</div></a>`;
const total = ts => { const s = ts.reduce((a, t) => a + (t.duration || 0), 0); const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return `${ts.length} song${ts.length === 1 ? '' : 's'}${s ? ` · ${h ? h + ' hr ' : ''}${m} min` : ''}`; };
const emptyLib = () => `<div class="empty"><h1>Your music, offline</h1>
  <p>Add the music files stored on this device. They stay on the device and play with no internet connection.</p>
  <div class="hero-actions"><button class="btn primary" data-act="add-files">${ic('file')}Add files</button>
  ${isDesktop() ? `<button class="btn" data-act="add-folder">${ic('folder')}Add a folder</button>` : ''}</div>
  <p style="margin-top:18px;font-size:13px">Works with MP3, M4A/AAC, FLAC, WAV, OGG and Opus.</p></div>`;
const heroActions = (extra = '') => `<div class="hero-actions"><button class="btn primary" data-act="play-view">${ic('play')}Play</button><button class="btn" data-act="shuffle-view">${ic('shuffle')}Shuffle</button>${extra}</div>`;

let viewIds = [];   // tracks of the current page, for the Play / Shuffle buttons
function setView(...parts) {
  view.innerHTML = '';
  for (const p of parts) { if (typeof p === 'string') view.insertAdjacentHTML('beforeend', p); else if (p) view.append(p); }
}
const page = () => location.hash.split('/')[1] || 'home';

const VIEWS = {
  home() {
    if (!S.tracks.size) return setView(emptyLib());
    const ts = [...shown()];
    const recent = ts.filter(t => t.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 8);
    const newest = [...S.albums.values()].sort((a, b) => b.addedAt - a.addedAt).slice(0, 12);
    const top = ts.filter(t => t.plays).sort((a, b) => b.plays - a.plays).slice(0, 10);
    const hr = new Date().getHours();
    viewIds = allSongIds();
    setView(
      `<h1>${hr < 5 ? 'Late night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'}</h1>
       <div class="muted">${total(ts)} in your library</div>${heroActions(`<a class="btn" href="#/stats">${ic('chart')}Your stats</a>`).replace('Play<', 'Play all<')}`,
      recent.length ? `<h2>Jump back in</h2><div class="tiles">${recent.map(t => `<button class="tile" data-act="play-recent" data-id="${t.id}">${artDiv(t.artId, t.album || t.title)}<span>${esc(t.title)}</span></button>`).join('')}</div>` : '',
      `<h2>Recently added</h2><div class="grid">${newest.map(albumCard).join('')}</div>`,
      top.length ? '<h2>Most played</h2>' : '', top.length ? trackList(top.map(t => t.id)) : null,
    );
  },
  library(tab = 'songs') {
    if (!S.tracks.size) return setView(emptyLib());
    const chips = `<div class="chips">${['songs', 'albums', 'artists', 'folders', 'genres', 'decades'].map(c => `<a class="chip ${c === tab ? 'active' : ''}" href="#/library/${c}">${c[0].toUpperCase() + c.slice(1)}</a>`).join('')}
      ${tab === 'songs' ? `<select id="sort" aria-label="Sort songs">${[['title', 'Title'], ['artist', 'Artist'], ['album', 'Album'], ['recent', 'Recently added']].map(([v, l]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div>`;
    if (tab === 'albums') return setView('<h1>Library</h1>', chips, `<div class="grid">${[...S.albums.values()].sort((a, b) => a.name.localeCompare(b.name)).map(albumCard).join('')}</div>`);
    if (tab === 'artists') return setView('<h1>Library</h1>', chips, `<div class="grid">${[...S.artists.values()].sort((a, b) => a.name.localeCompare(b.name)).map(artistCard).join('')}</div>`);
    if (tab === 'folders') {
      const roots = S.folders.map(f => ({ href: folderHref(f.id, ''), name: f.name, n: [...S.tracks.values()].filter(t => t.folderId === f.id).length, hidden: !!folderHiddenBy(f.id, '') }));
      const added = [...S.tracks.values()].filter(t => !t.folderId).length;
      if (added) roots.push({ href: folderHref('added', ''), name: 'Added files', n: added });
      return setView('<h1>Library</h1>', chips, roots.length ? `<div class="folders">${roots.map(r => folderRow(r.href, r.name, r.n, null, r.hidden)).join('')}</div>` : '<div class="empty">No folders yet.</div>');
    }
    if (tab === 'genres') { const g = [...groupBy(t => t.genre).entries()].sort((a, b) => a[0].localeCompare(b[0])); return setView('<h1>Library</h1>', chips, g.length ? `<div class="grid">${g.map(([k, ts]) => tagCard(`#/genre/${encodeURIComponent(k)}`, k, ts.length, 'tag')).join('')}</div>` : '<div class="empty">None of your songs has a genre saved. You can add one with ⋯ → Edit info.</div>'); }
    if (tab === 'decades') { const g = [...groupBy(decadeOf).entries()].sort((a, b) => b[0] - a[0]); return setView('<h1>Library</h1>', chips, g.length ? `<div class="grid">${g.map(([k, ts]) => tagCard(`#/decade/${k}`, `${k}s`, ts.length, 'clock')).join('')}</div>` : '<div class="empty">None of your songs has a year saved. You can add one with ⋯ → Edit info.</div>'); }
    viewIds = allSongIds();
    setView('<h1>Library</h1>', chips, trackList(viewIds));
    $('#sort').onchange = e => { S.sort = e.target.value; saveState(); route(); };
  },
  album(key) {
    const al = S.albums.get(key); if (!al) return setView('<div class="empty">Album not found.</div>');
    viewIds = al.tracks.map(t => t.id);
    setView(`<div class="hero">${artDiv(al.artId, al.name, '', 'disc')}<div class="hero-text"><div class="kind">Album</div><h1>${esc(al.name)}</h1>
      <div class="muted"><a href="#/artist/${encodeURIComponent(norm(al.artist))}">${esc(al.artist)}</a>${al.year ? ' · ' + al.year : ''} · ${total(al.tracks)}</div>
      ${heroActions(`<button class="icon-btn" data-act="view-menu" aria-label="More options">${ic('dots')}</button>`)}</div></div>`, trackList(viewIds, { numbered: true }));
  },
  artist(key) {
    const ar = S.artists.get(key); if (!ar) return setView('<div class="empty">Artist not found.</div>');
    const albums = [...S.albums.values()].filter(a => norm(a.artist) === key).sort((a, b) => (b.year || 0) - (a.year || 0));
    viewIds = [...ar.tracks].sort(SORTS.album).map(t => t.id);
    setView(`<div class="hero">${artDiv(ar.artId, ar.name, 'round', 'user')}<div class="hero-text"><div class="kind">Artist</div><h1>${esc(ar.name)}</h1>
      <div class="muted">${total(ar.tracks)}</div>${heroActions(`<button class="btn" data-act="artist-radio" aria-label="Play this artist mixed with similar music from your library">${ic('radio')}Radio</button>` + saveBtn)}</div></div>`, '<div id="bio"></div>',
      albums.length ? `<h2>Albums</h2><div class="grid">${albums.map(albumCard).join('')}</div>` : '',
      '<h2>Songs</h2>', trackList(viewIds));
    const here = location.hash;
    if (ar.name !== 'Unknown artist') artistBio(ar.name).then(b => {
      const el = $('#bio');
      if (b && el && location.hash === here) el.innerHTML = `<p class="bio">${esc(b.text)} <a href="${esc(b.url)}" target="_blank" rel="noopener">Read more on Wikipedia</a></p>`;
    }).catch(e => console.warn('biography', e));
  },
  stats() {
    const P = [[7, 'Last 7 days'], [30, 'Last 30 days'], [365, 'Last year'], [0, 'All time']];
    const since = S.statP ? Date.now() - S.statP * 864e5 : 0, h = S.hist.filter(x => x.a >= since);
    const chips = `<div class="chips">${P.map(([d, l]) => `<button class="chip ${S.statP === d ? 'active' : ''}" data-act="stat-p" data-d="${d}">${l}</button>`).join('')}</div>`;
    viewIds = [];
    if (!h.length) return setView('<h1>Your listening</h1>', chips, `<div class="empty">Nothing played in this period yet. ${S.hist.length ? '' : 'Listening is counted from now on: a song counts once you have heard 30 seconds of it.'}</div>`);
    const count = fn => { const m = new Map(); for (const x of h) { const k = fn(x); if (!k) continue; const e = m.get(k) || m.set(k, { n: 0, x }).get(k); e.n++; } return [...m.values()].sort((a, b) => b.n - a.n); };
    const music = x => x.k !== 'episode';
    const artists = count(x => music(x) && x.r), songs = count(x => music(x) && x.i), shows = count(x => !music(x) && x.r);
    const secs = h.reduce((a, x) => a + (x.d || 0), 0), hrs = secs / 3600;
    const days = count(x => new Date(x.a).toLocaleDateString(undefined, { weekday: 'long' }));
    const bars = (list, label) => `<div class="bars">${list.slice(0, 10).map(e => `<div class="bar-row"><span>${esc(label(e.x))}</span><i><b style="width:${Math.max(4, e.n / list[0].n * 100)}%"></b></i><em>${e.n}</em></div>`).join('')}</div>`;
    const tile = (n, l) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`;
    setView('<h1>Your listening</h1>', chips,
      `<div class="stats">${tile(h.length, 'plays')}${tile(hrs >= 10 ? Math.round(hrs) : hrs >= 1 ? hrs.toFixed(1) : Math.round(secs / 60), hrs >= 1 ? 'hours' : 'minutes')}${tile(songs.length, 'different songs')}${tile(artists.length, 'artists')}</div>`,
      artists.length ? '<h2>Top artists</h2>' + bars(artists, x => x.r) : '',
      songs.length ? '<h2>Top songs</h2>' + bars(songs, x => `${x.t} · ${x.r || 'Unknown artist'}`) : '',
      shows.length ? '<h2>Top podcasts</h2>' + bars(shows, x => x.r) : '',
      `<p class="muted" style="margin-top:20px">You listen most on ${esc(days[0].x && new Date(days[0].x.a).toLocaleDateString(undefined, { weekday: 'long' }))}s. Counting started ${new Date(S.hist[0].a).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`);
  },
  liked() {
    const ts = likedItems();
    viewIds = ts.map(t => t.id);
    setView(`<div class="hero"><div class="art" style="background:linear-gradient(135deg,#ff7a59,#b3246b)">${ic('heart')}</div><div class="hero-text"><div class="kind">Playlist</div><h1>Liked songs</h1>
      <div class="muted">${total(ts)}</div>${ts.length ? heroActions(`<button class="icon-btn" data-act="share-view" data-name="Liked songs" aria-label="Share these songs as a link">${ic('share')}</button>`) : ''}</div></div>`,
      ts.length ? trackList(viewIds) : '<div class="empty">Tap the heart on any song to save it here.</div>');
  },
  playlists() {
    setView(`<h1>Playlists</h1><div class="hero-actions" style="margin-bottom:16px"><button class="btn primary" data-act="new-playlist">${ic('plus')}New playlist</button><button class="btn" data-act="new-smart" aria-label="A playlist that fills itself from a rule">${ic('spark')}New smart playlist</button></div>`,
      `<div class="grid"><a class="card" href="#/liked"><div class="art" style="background:linear-gradient(135deg,#ff7a59,#b3246b)">${ic('heart')}</div><div class="card-title">Liked songs</div><div class="card-sub">${likedItems().length} songs</div></a>
      ${Object.entries(MIXES).map(([k, m]) => `<a class="card" href="#/mix/${k}"><div class="art" style="background:linear-gradient(135deg,${m.bg})">${ic(m.icon)}</div><div class="card-title">${m.name}</div><div class="card-sub">Automatic</div></a>`).join('')}
      ${S.playlists.map(p => { const first = T(playlistIds(p)[0]); return `<a class="card" href="#/playlist/${p.id}">${artDiv(first?.artId, p.name, '', 'list')}<div class="card-title">${esc(p.name)}</div><div class="card-sub">${playlistIds(p).length} songs</div></a>`; }).join('')}</div>`);
  },
  playlist(id) {
    const p = S.playlists.find(x => x.id === id); if (!p) return setView('<div class="empty">Playlist not found.</div>');
    viewIds = playlistIds(p);
    const ts = viewIds.map(T);
    setView(`<div class="hero">${artDiv(ts[0]?.artId, p.name, '', p.smart ? 'spark' : 'list')}<div class="hero-text"><div class="kind">${p.smart ? 'Smart playlist' : 'Playlist'}</div><h1>${esc(p.name)}</h1>
      <div class="muted">${p.smart ? esc(smartText(p)) + ' · ' : ''}${total(ts)}</div>${heroActions(`<button class="icon-btn" data-act="share-view" data-name="${esc(p.name)}" aria-label="Share this playlist as a link">${ic('share')}</button><button class="icon-btn" data-act="playlist-menu" data-id="${p.id}" aria-label="Playlist options">${ic('dots')}</button>`)}</div></div>`,
      ts.length ? trackList(viewIds, p.smart ? {} : { playlistId: p.id }) : `<div class="empty">${p.smart ? 'No songs match this rule yet.' : 'This playlist is empty. Use the ⋯ menu on any song to add it.'}</div>`);
  },
  genre(name) {
    const ts = [...shown()].filter(t => t.genre === name).sort(SORTS.artist); viewIds = ts.map(t => t.id);
    setView(`<div class="hero">${artDiv(null, name, '', 'tag')}<div class="hero-text"><div class="kind">Genre</div><h1>${esc(name)}</h1><div class="muted">${total(ts)}</div>${ts.length ? heroActions() : ''}</div></div>`, trackList(viewIds));
  },
  decade(d) {
    const ts = [...shown()].filter(t => decadeOf(t) === +d).sort((a, b) => a.year - b.year || SORTS.artist(a, b)); viewIds = ts.map(t => t.id);
    setView(`<div class="hero">${artDiv(null, d + 's', '', 'clock')}<div class="hero-text"><div class="kind">Decade</div><h1>${esc(d)}s</h1><div class="muted">${total(ts)}</div>${ts.length ? heroActions() : ''}</div></div>`, trackList(viewIds));
  },
  duplicates() {
    const groups = dupGroups(); viewIds = [];
    if (!groups.length) return setView('<h1>Duplicates</h1><div class="empty">No duplicates found. Songs count as duplicates when the title and artist match.</div>');
    const n = groups.reduce((a, g) => a + g.length - 1, 0);
    setView(`<h1>Duplicates</h1><div class="muted">${groups.length} song${groups.length === 1 ? '' : 's'} with extra copies. The first one in each group is the one that's kept.</div>
      <div class="hero-actions" style="margin-bottom:8px"><button class="btn danger" data-act="dedupe">${ic('trash')}Remove ${n} extra cop${n === 1 ? 'y' : 'ies'}</button></div>`,
      ...groups.flatMap(g => [`<h2>${esc(g[0].title)} <span class="muted" style="font-weight:400">· ${esc(g[0].artist || 'Unknown artist')}</span></h2>`, trackList(g.map(t => t.id))]));
  },
  folder(fid, prefix = '') {
    const root = fid === 'added' ? { name: 'Added files' } : S.folders.find(f => f.id === fid);
    if (!root) return setView('<div class="empty">Folder not found.</div>');
    const { subs, songs } = folderContents(fid, prefix);
    const parts = prefix.split('/').filter(Boolean), name = parts.at(-1) || root.name;
    const crumbs = [`<a href="#/library/folders">Folders</a>`, `<a href="${folderHref(fid, '')}">${esc(root.name)}</a>`, ...parts.map((p, i) => `<a href="${folderHref(fid, parts.slice(0, i + 1).join('/') + '/')}">${esc(p)}</a>`)];
    const hiddenBy = fid !== 'added' && folderHiddenBy(fid, prefix);
    const all = [...S.tracks.values()].filter(t => fid === 'added' ? !t.folderId : t.folderId === fid && (t.path || '').startsWith(prefix));
    viewIds = all.filter(t => hiddenBy || !isHidden(t)).sort((a, b) => (a.path || a.fileName).localeCompare(b.path || b.fileName, undefined, { numeric: true })).map(t => t.id);
    S.curFolder = { fid, prefix, name };
    setView(`<div class="crumbs">${crumbs.join('<span>›</span>')}</div><div class="hero folder-hero"><div class="art folder-ic big">${ic('folder')}</div><div class="hero-text"><div class="kind">Folder</div><h1>${esc(name)}</h1>
      <div class="muted">${all.length} song${all.length === 1 ? '' : 's'}${subs.length ? ` in ${subs.length} folder${subs.length === 1 ? '' : 's'}` : ''}</div>
      ${all.length ? heroActions(fid === 'added' ? '' : `<button class="btn" data-act="folder-hide" aria-label="${hiddenBy ? 'Show this folder in your library again' : 'Leave this folder out of your library, search and shuffle'}">${hiddenBy ? 'Show folder' : 'Hide folder'}</button>`) : ''}</div></div>`,
      hiddenBy ? `<div class="hidden-note">This folder is hidden from your library, search and shuffle${hiddenBy !== `${fid}|${prefix}` ? ' (a folder above it is hidden)' : ''}. Its songs are still here and play from this page.</div>` : '',
      subs.length ? `<div class="folders">${subs.map(([n, e]) => folderRow(folderHref(fid, prefix + n + '/'), n, e.n, e.art, !!folderHiddenBy(fid, prefix + n + '/'))).join('')}</div>` : '',
      songs.length ? `<h2>${subs.length ? 'Songs in this folder' : 'Songs'}</h2>` : '', songs.length ? trackList(songs.sort((a, b) => (a.path || a.fileName).localeCompare(b.path || b.fileName, undefined, { numeric: true })).map(t => t.id), { showHidden: true }) : null);
  },
  async shared(code) {
    let data = null;
    try { data = await unpackShare(code || ''); } catch {}
    if (!data || !Array.isArray(data.s)) return setView('<div class="empty"><h1>This link doesn’t work</h1><p>It may have been cut short when it was copied. Ask for it to be sent again.</p></div>');
    const name = String(data.n || 'Shared playlist').slice(0, 80), rows = matchShared(data.s.slice(0, 500));
    const have = rows.filter(r => r.id), missing = rows.filter(r => !r.id);
    sharedNow = { name, rows }; viewIds = have.map(r => r.id);
    const yt = it => `https://music.youtube.com/search?q=${encodeURIComponent(`${it.t} ${it.a || ''}`.trim())}`;
    setView(`<div class="hero"><div class="art" style="background:linear-gradient(135deg,var(--accent),#3a1530)">${ic('share')}</div><div class="hero-text"><div class="kind">Shared playlist</div><h1>${esc(name)}</h1>
      <div class="muted">${rows.length} song${rows.length === 1 ? '' : 's'} · ${have.length} in your library${missing.length ? ` · ${missing.length} not` : ''}</div>
      ${have.length ? heroActions(`<button class="btn" data-act="save-shared">${ic('plus')}Save as playlist</button>`) : ''}</div></div>`,
      have.length ? `<h2>${missing.length ? 'In your library' : 'Songs'}</h2>` : '', have.length ? trackList(viewIds) : '',
      missing.length ? `<h2>Not in your library</h2><p class="muted" style="margin:-6px 0 8px">${S.tracks.size ? 'Add these to your music to play them here, or listen on YouTube Music.' : 'Add your own music to Cadence and the songs you have will play here. Meanwhile you can listen on YouTube Music.'}</p>
        <div class="missing">${missing.map(r => `<div class="miss-row"><div class="row-main"><div class="row-title">${esc(r.it.t)}</div><div class="row-sub">${esc(r.it.a || 'Unknown artist')}</div></div><a class="btn" href="${esc(yt(r.it))}" target="_blank" rel="noopener" aria-label="Find this song on YouTube Music">${ic('yt')}Listen</a></div>`).join('')}</div>` : '');
  },
  mix(kind) {
    const m = MIXES[kind]; if (!m) return setView('<div class="empty">Not found.</div>');
    viewIds = m.ids();
    setView(`<div class="hero"><div class="art" style="background:linear-gradient(135deg,${m.bg})">${ic(m.icon)}</div><div class="hero-text"><div class="kind">Automatic playlist</div><h1>${m.name}</h1>
      <div class="muted">${total(viewIds.map(i => S.tracks.get(i)))}</div>${viewIds.length ? heroActions(`<button class="icon-btn" data-act="view-menu" aria-label="More options">${ic('dots')}</button>`) : ''}</div></div>`,
      viewIds.length ? trackList(viewIds) : '<div class="empty">Play some music and this fills in by itself.</div>');
  },
  online(tab = 'podcasts') { return tab === 'radio' ? radioView() : tab === 'music' ? archiveView() : tab === 'youtube' ? youtubeView() : podcastsView(); },
  async archive(id) {
    const here = location.hash;
    if (iaMem.has(id)) return drawAlbum(iaMem.get(id));
    setView('<div class="empty">Loading…</div>');
    try { const data = await loadAlbum(id); if (location.hash === here) drawAlbum(data); }
    catch { if (location.hash === here) setView(`<div class="empty"><h1>Can't load this recording</h1><p>${navigator.onLine ? 'The Internet Archive did not answer, or this item has no playable audio.' : 'You are offline. Saved albums and downloads are on the Free music page.'}</p></div>`); }
  },
  async podcast(id) {
    const here = location.hash;
    if (podMem.has(id) && Date.now() - podMem.get(id).at < 30 * 60000) return drawPodcast(podMem.get(id));
    setView('<div class="empty">Loading podcast…</div>');
    try { const data = await loadPodcast(id); if (location.hash === here) drawPodcast(data); }
    catch { if (location.hash === here) setView(`<div class="empty"><h1>Can't load this podcast</h1><p>${navigator.onLine ? 'The podcast directory did not answer. Try again in a moment.' : 'You are offline. Downloaded episodes are on the Podcasts page.'}</p></div>`); }
  },
  search() {
    const q = norm(S.q.trim());
    if (!q) return setView('<h1>Search</h1><div class="empty">Find songs, albums and artists in your library.</div>');
    const words = q.split(/\s+/);
    const hit = s => words.every(w => s.includes(w));
    const songs = [...shown()].filter(t => hit(norm(`${t.title} ${t.artist} ${t.album}`)))
      .sort((a, b) => (norm(b.title).startsWith(q) - norm(a.title).startsWith(q)) || a.title.localeCompare(b.title)).slice(0, 100);
    const albums = [...S.albums.values()].filter(a => hit(norm(`${a.name} ${a.artist}`))).slice(0, 12);
    const artists = [...S.artists.values()].filter(a => hit(a.key)).slice(0, 12);
    viewIds = songs.map(t => t.id);
    if (!songs.length && !albums.length && !artists.length) return setView(`<div class="empty">Nothing in your library matches “${esc(S.q)}”.</div>`);
    setView(artists.length ? `<h2>Artists</h2><div class="grid">${artists.map(artistCard).join('')}</div>` : '',
      albums.length ? `<h2>Albums</h2><div class="grid">${albums.map(albumCard).join('')}</div>` : '',
      songs.length ? '<h2>Songs</h2>' : '', songs.length ? trackList(viewIds) : null);
  },
  queue() {
    const t = current();
    if (!t) return setView('<h1>Queue</h1><div class="empty">Nothing is queued. Play something to get started.</div>');
    const upcoming = S.queue.slice(S.qIndex + 1);
    setView(`<h1>Queue</h1>${S.radio ? `<div class="radio-note">${ic('radio')}<span>Song radio from <b>${esc(S.radio.title)}</b> — it keeps adding similar songs as you listen.</span><button class="btn" data-act="radio-stop">Turn off</button></div>` : ''}<div class="hero-actions"><button class="btn ${sleepAt || sleepEOT ? 'primary' : ''}" data-act="sleep">${ic('moon')}${sleepLabel()}</button></div><h2>Now playing</h2>`, trackList([t.id], { nowRow: true }),
      upcoming.length ? '<h2>Next up</h2>' : '', upcoming.length ? trackList(upcoming, { queueOffset: S.qIndex + 1 }) : null);
  },
  async settings() {
    let usage = '';
    try { const e = await navigator.storage.estimate(); usage = `${(e.usage / 1e9).toFixed(2)} GB used of about ${(e.quota / 1e9).toFixed(0)} GB available to the app`; } catch {}
    if (page() !== 'settings') return;
    const copied = [...S.tracks.values()].filter(t => !t.linked).length;
    setView('<h1>Settings</h1>',
      `<div class="settings-block"><h2>Add music</h2><p>Files you add are copied into the app so they always play offline. On a computer you can instead link a folder, which plays the files where they are without using extra space.</p>
        <div class="hero-actions"><button class="btn primary" data-act="add-files">${ic('file')}Add files</button><button class="btn" data-act="add-folder">${ic('folder')}${window.showDirectoryPicker ? 'Link a folder' : 'Add a folder'}</button></div></div>`,
      S.folders.length ? `<div class="settings-block"><h2>Linked folders</h2>${S.folders.map(f => `<div class="folder">${ic('folder')}<b>${esc(f.name)}</b><button class="btn" data-act="rescan" data-id="${f.id}">Rescan</button><button class="btn danger" data-act="unlink" data-id="${f.id}">Remove</button></div>`).join('')}</div>` : '',
      `<div class="settings-block"><h2>Library</h2><p>${S.tracks.size} songs · ${S.albums.size} albums · ${S.playlists.length} playlists<br>${copied} copied into the app, ${S.tracks.size - copied} linked${usage ? '<br>' + usage : ''}</p>
        <div class="hero-actions"><a class="btn" href="#/duplicates">Find duplicate songs</a><button class="btn danger" data-act="wipe">${ic('trash')}Delete entire library</button></div></div>`,
      `<div class="settings-block"><h2>Hide songs</h2><p>Leave things like voice notes, ringtones and recordings out of your library, search and shuffle. Nothing is deleted, and you can show them again at any time.</p>
        <div class="hero-actions"><select data-set="minSecs" aria-label="Hide short clips">${[[0, 'Show all lengths'], [30, 'Hide clips under 30 seconds'], [60, 'Hide clips under 1 minute'], [120, 'Hide clips under 2 minutes']].map(([v, l]) => `<option value="${v}" ${S.hide.minSecs === v ? 'selected' : ''}>${l}</option>`).join('')}</select><a class="btn" href="#/library/folders">${ic('folder')}Hide a folder</a></div>
        ${S.hide.folders.length ? `<h2 style="margin-top:18px">Hidden folders</h2>${S.hide.folders.map(h => { const [fid, pre] = [h.slice(0, h.indexOf('|')), h.slice(h.indexOf('|') + 1)]; const f = S.folders.find(x => x.id === fid); return `<div class="folder">${ic('folder')}<b>${esc((f?.name || 'Folder') + (pre ? ' / ' + pre.replace(/\/$/, '') : ''))}</b><button class="btn" data-act="unhide" data-key="${esc(h)}">Show</button></div>`; }).join('')}` : ''}
        ${(() => { const n = S.tracks.size - S.shownList.length; return n ? `<p style="margin-top:10px">${n} song${n === 1 ? ' is' : 's are'} hidden.</p>` : ''; })()}</div>`,
      soundSettings(),
      `<div class="settings-block"><h2>Appearance</h2>
        <div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="theme-card ${S.theme.mode === k ? 'on' : ''}" data-act="theme-mode" data-mode="${k}" aria-label="${t.name} theme"><span class="theme-prev" style="background:${t.bg}"><i style="background:${t.panel}"></i><i style="background:${t.raised}"></i><b style="background:${t.accent}"></b></span><span>${t.name}</span></button>`).join('')}</div>
        <h2 style="margin-top:20px">Accent colour</h2>
        <div class="swatches">${Object.entries(ACCENTS).map(([n, c]) => `<button class="swatch ${S.theme.accent === c ? 'on' : ''}" style="background:${c}" data-act="theme-accent" data-c="${c}" aria-label="${n} accent colour"></button>`).join('')}</div>
        <div class="hero-actions" style="margin-top:14px"><button class="btn ${S.theme.auto ? 'primary' : ''}" data-act="theme-auto" aria-label="Tint the app with the colours of the cover that is playing">Match album art: ${S.theme.auto ? 'On' : 'Off'}</button></div></div>`,
      `<div class="settings-block"><h2>About Cadence</h2><p>Version ${APP_VERSION} · ${fmtDate(RELEASES[0].date)}</p>
        <div class="hero-actions"><button class="btn" data-act="whats-new">What’s new</button><button class="btn" data-act="check-update">Check for updates</button>
        ${LINKS.feedback ? `<a class="btn" href="${esc(LINKS.feedback)}" target="_blank" rel="noopener">Send feedback</a>` : ''}
        ${LINKS.donate ? `<a class="btn primary" href="${esc(LINKS.donate)}" target="_blank" rel="noopener">${ic('heart')}Support the app</a>` : ''}
        <a class="btn" href="privacy.html" target="_blank" rel="noopener">Privacy</a></div>
        ${LINKS.donate ? '<p style="margin-top:12px">Cadence is free, with no adverts or tracking. If you enjoy it, a small donation helps keep it going.</p>' : ''}</div>`,
      `<div class="settings-block"><h2>More</h2><div class="hero-actions"><a class="btn" href="#/stats">${ic('chart')}Your listening stats</a><button class="btn" data-act="car-on">${ic('car')}Car mode</button></div></div>`,
      `<div class="settings-block"><h2>YouTube</h2><p>Pasting YouTube links works with no setup. A free key from Google adds search by name, and a client ID adds your own playlists and liked videos.</p>
        <label class="setfield">YouTube API key<input id="yt-key" type="text" value="${esc(S.yt.key)}" autocomplete="off" spellcheck="false" placeholder="Not set"></label>
        <label class="setfield">Google client ID (optional)<input id="yt-cid" type="text" value="${esc(S.yt.clientId)}" autocomplete="off" spellcheck="false" placeholder="Not set"></label>
        <div class="hero-actions"><button class="btn primary" data-act="yt-keys">Save</button><button class="btn" data-act="yt-help">How to get these</button></div>
        <h2 style="margin-top:22px">YouTube Premium</h2><p>If you pay for YouTube Premium, switch this on and sign in to youtube.com in this same browser. Videos played here should then have no adverts. With it on, YouTube can link what you play here to your account, as it does on its own site.</p>
        <div class="hero-actions"><button class="btn ${S.yt.signedIn ? 'primary' : ''}" data-act="yt-signin" aria-label="Let the YouTube player use the YouTube account you are signed in to in this browser">Use my YouTube sign-in: ${S.yt.signedIn ? 'On' : 'Off'}</button><a class="btn" href="https://www.youtube.com/" target="_blank" rel="noopener">Open youtube.com to sign in</a></div></div>`,
      `<div class="settings-block"><h2>Covers and lyrics</h2><p>When a song has no cover or lyrics saved in its file, Cadence can look them up online and keep them on this device for offline use. Only the song's title, artist and album are sent, to Apple's music catalogue (covers) and LRCLIB (lyrics).</p>
        <div class="hero-actions"><button class="btn ${S.online !== false ? 'primary' : ''}" data-act="toggle-online">Online lookups: ${S.online !== false ? 'On' : 'Off'}</button><button class="btn" data-act="find-covers">${ic('disc')}Find all missing covers</button></div></div>`,
      `<div class="settings-block"><h2>Back up and transfer</h2><p>Save your playlists and liked songs to a file. Restore it on another device that has the same music files to get the same playlists there.</p>
        <div class="hero-actions"><button class="btn" data-act="export">${ic('save')}Save backup file</button><button class="btn" data-act="import-backup">${ic('up')}Restore from file</button></div></div>`,
      installEvt ? `<div class="settings-block"><h2>Install</h2><p>Install Cadence as an app with its own window and icon.</p><button class="btn primary" data-act="install">Install app</button></div>` : '',
    );
  },
};

function route() {
  const [, p = 'home', ...rest] = location.hash.split('/');
  const args = rest.map(decodeURIComponent);
  viewIds = [];
  (VIEWS[p] || VIEWS.home)(...args);
  const navKey = { shared: 'playlists', album: 'library', artist: 'library', folder: 'library', genre: 'library', decade: 'library', duplicates: 'settings', stats: 'home', playlist: 'playlists', mix: 'playlists', liked: isDesktop() ? 'liked' : 'playlists' }[p] || p;
  const sub = p === 'online' ? 'online-' + (args[0] || 'podcasts') : p === 'podcast' ? 'online-podcasts' : p === 'archive' ? 'online-music' : null;
  ytMark();
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey || a.dataset.nav === sub || (a.dataset.nav === 'online' && !!sub)));
  $$('#side-playlists a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === location.hash));
}
function rerender() { const y = view.scrollTop; route(); view.scrollTop = y; }
let lastHash = '';
addEventListener('hashchange', () => {
  const samePage = lastHash.split('/')[1] === page();
  lastHash = location.hash;
  if (page() !== 'search' && S.q) { S.q = ''; $('#q').value = ''; }
  clearSel();
  route(); if (!samePage || page() !== 'library') view.scrollTop = 0;
  if (page() === 'search' && !S.q && !isDesktop()) $('#q').focus();
});
$('#q').addEventListener('input', e => { S.q = e.target.value; if (page() !== 'search') location.hash = '#/search'; else route(); });
$('#q').addEventListener('focus', () => { if (page() !== 'search' && !isDesktop()) location.hash = '#/search'; });

function renderSidePlaylists() {
  $('#side-playlists').innerHTML = S.playlists.map(p => `<a href="#/playlist/${p.id}">${ic(p.smart ? 'spark' : 'list')}<span>${esc(p.name)}</span></a>`).join('');
}
let carLock = null;
async function carMode(on) {
  const was = !$('#car').hidden; $('#car').hidden = !on; if (on) closeNP();
  if (on && !was) overlayOpened(); else if (!on && was) overlayClosed();
  try { if (on) carLock = await navigator.wakeLock?.request('screen'); else { await carLock?.release(); carLock = null; } } catch { carLock = null; }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#car').hidden) carMode(true); });
function openNP() { if (current() && $('#np').hidden) { $('#np').hidden = false; overlayOpened(); } }
function closeNP() { if ($('#np').hidden) return; $('#np').hidden = true; overlayClosed(); }

/* ---------------- phone Back button ---------------- */
// While a full-screen layer (Now Playing, car mode, a menu, the selection bar) is open, one extra
// history entry sits on top, so Back closes the layer instead of leaving the app or the page.
const overlayOpen = () => !$('#np').hidden || !$('#car').hidden || !$('#menu').hidden || S.sel.size > 0;
let ignorePop = false;
function overlayOpened() { if (!history.state?.ov) history.pushState({ ov: 1 }, ''); }
function overlayClosed() {
  // Closed by a button: remove the extra entry, unless something else opened or the page moved on meanwhile.
  setTimeout(() => { if (!overlayOpen() && history.state?.ov) { ignorePop = true; history.back(); } }, 0);
}
addEventListener('popstate', () => {
  if (ignorePop) { ignorePop = false; return; }
  if (!overlayOpen()) return;   // an ordinary page change; the hashchange handler takes it
  if (!$('#menu').hidden) closeMenu();
  else if (!$('#car').hidden) carMode(false);
  else if (S.sel.size) clearSel();
  else closeNP();
  if (overlayOpen()) history.pushState({ ov: 1 }, '');   // something is still open underneath
});
// Go to a page from inside a layer: the layer's history entry becomes the new page, so Back
// from there returns to where you were before the layer opened.
function nav(hash) {
  closeNP(); if (!$('#car').hidden) carMode(false);
  if (history.state?.ov) { history.replaceState(null, '', hash); dispatchEvent(new HashChangeEvent('hashchange')); }
  else location.hash = hash;
}

/* ---------------- actions ---------------- */
let installEvt = null, updateReady = false;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (page() === 'settings') route(); });

const A = {
  'add-music': (el, e) => openMenu([
    { label: 'Add files', icon: 'file', fn: () => $('#file-input').click() },
    (window.showDirectoryPicker || isDesktop()) && { label: window.showDirectoryPicker ? 'Link a folder' : 'Add a folder', icon: 'folder', fn: addFolder },
  ], e, 'Add music'),
  'add-files': () => $('#file-input').click(),
  'add-folder': addFolder,
  'play-row': (el, e) => {
    const list = el.closest('.tracklist'), i = +el.dataset.i;
    if (S.sel.size || e.ctrlKey || e.metaKey) return toggleSel(el.dataset.id);
    if (list._ctx.nowRow) return toggle();
    if (list._ctx.queueOffset) { S.qIndex = list._ctx.queueOffset + i; loadCurrent(true); return route(); }
    if (el.dataset.id === S.loadedId && list._ids[i] === S.queue[S.qIndex]) return toggle();
    playContext(list._ids, i);
  },
  'like': el => toggleLike(el.closest('.row').dataset.id),
  'row-menu': (el, e) => { const row = el.closest('.row'), list = row.closest('.tracklist'); trackMenu(T(row.dataset.id), e, { ...list._ctx, i: +row.dataset.i }); },
  'play-view': () => { S.shuffle = false; playContext(viewIds, 0); },
  'shuffle-view': () => shufflePlay(viewIds),
  'play-album': (el, e) => { e.preventDefault(); const al = S.albums.get(el.dataset.key); if (al) playContext(al.tracks.map(t => t.id), 0); },
  // Play the tiles exactly as they are on screen; the recently-played order changes with every song.
  'play-recent': el => { const tiles = $$('.tile', el.parentElement); playContext(tiles.map(x => x.dataset.id), tiles.indexOf(el)); },
  'view-menu': (el, e) => openMenu([
    { label: 'Play next', icon: 'next', fn: () => enqueue(viewIds, true) },
    { label: 'Add to queue', icon: 'queue', fn: () => enqueue(viewIds, false) },
    { label: 'Add to playlist', icon: 'plus', fn: () => pickPlaylist(viewIds) },
    viewIds.some(id => S.tracks.has(id)) && { label: 'Download the files', icon: 'save', fn: () => exportTracks(viewIds) },
  ], e),
  'playlist-menu': (el, e) => {
    const p = S.playlists.find(x => x.id === el.dataset.id); if (!p) return;
    openMenu([
      { label: 'Share playlist', icon: 'share', fn: () => sharePlaylist(p.name, viewIds) },
      { label: 'Add to queue', icon: 'queue', fn: () => enqueue(viewIds, false) },
      { label: 'Rename', icon: 'edit', fn: async () => { const n = await ask({ title: 'Rename playlist', input: p.name, ok: 'Save' }); if (n) { p.name = n; await idb.put('playlists', p); renderSidePlaylists(); route(); } } },
      { label: 'Delete playlist', icon: 'trash', danger: true, fn: async () => {
        if (!await ask({ title: 'Delete playlist?', text: `“${p.name}” will be deleted. The songs stay in your library.`, ok: 'Delete', danger: true })) return;
        S.playlists = S.playlists.filter(x => x !== p); await idb.del('playlists', p.id); renderSidePlaylists(); location.hash = '#/playlists';
      } },
    ], e, p.name);
  },
  'new-playlist': () => newPlaylist(),
  'toggle': toggle, 'next': () => next(), 'prev': prev, 'shuffle': toggleShuffle, 'repeat': cycleRepeat,
  'like-current': () => { const t = current(); if (t) toggleLike(t.id); },
  'open-np': openNP, 'close-np': closeNP,
  'np-menu': (el, e) => { const t = current(); if (t) trackMenu(t, e, { np: true }); },
  'sleep': (el, e) => sleepMenu(e),
  'follow-pod': async () => {
    const pod = S.curPod; if (!pod) return;
    const on = S.pods.some(p => p.id === pod.id);
    S.pods = on ? S.pods.filter(p => p.id !== pod.id) : [...S.pods, { ...pod, seen: podMem.get(pod.id)?.eps[0]?.date || '' }];
    await idb.put('kv', S.pods, 'pods'); toast(on ? 'Unfollowed' : 'Following — find it under Podcasts'); rerender();
  },
  'edit-lookup': lookupInfo,
  'new-smart': newSmart, 'dedupe': removeDuplicates,
  'whats-new': showWhatsNew,
  'share-view': el => sharePlaylist(el.dataset.name || 'Playlist', viewIds),
  'save-shared': async () => {
    const sh = sharedNow; if (!sh) return;
    const ids = sh.rows.filter(r => r.id).map(r => r.id);
    for (const id of ids) if (S.remote.has(id)) await keep(S.remote.get(id));
    let name = sh.name; if (S.playlists.some(p => p.name === name)) name += ' (shared)';
    const p = { id: uid(), name, trackIds: ids, createdAt: Date.now() };
    S.playlists.push(p); await idb.put('playlists', p); renderSidePlaylists();
    toast(`Saved “${name}” with ${ids.length} song${ids.length === 1 ? '' : 's'}`); location.hash = `#/playlist/${p.id}`;
  },
  'artist-radio': () => { const ts = viewIds.map(id => S.tracks.get(id)).filter(Boolean); if (!ts.length) return; const seed = [...ts].sort((a, b) => (b.plays || 0) - (a.plays || 0) || (b.liked || 0) - (a.liked || 0))[0]; startRadio(seed.id); },
  'radio-stop': () => { S.radio = null; saveState(); toast('Radio off: the queue stops at its end'); rerender(); },
  'folder-hide': () => { const c = S.curFolder; if (!c) return; const key = `${c.fid}|${c.prefix}`, by = folderHiddenBy(c.fid, c.prefix); setFolderHidden(by || key, !by); },
  'unhide': el => setFolderHidden(el.dataset.key, false),
  'check-update': async () => {
    toast('Checking for updates…');
    try { const reg = await navigator.serviceWorker?.getRegistration(); await reg?.update(); setTimeout(() => { if (!updateReady) toast(`You have the latest version (${APP_VERSION})`); }, 4000); }
    catch { toast('Couldn’t check right now. Try again when you’re online.'); }
  },
  'restart-update': () => location.reload(),
  'add-feed': addFeed, 'add-station': addStation,
  'yt-play': el => ytStart(el.closest('.ytlist')._items, +el.dataset.i),
  'yt-save': async el => {
    const row = el.closest('.yt-row'), v = row.closest('.ytlist')._items[+row.dataset.i];
    S.ytSaved = ytSavedHas(v.id) ? S.ytSaved.filter(x => x.id !== v.id) : [...S.ytSaved, { ...v }];
    await idb.put('kv', S.ytSaved, 'ytSaved'); toast(ytSavedHas(v.id) ? 'Saved' : 'Removed from saved'); rerender();
  },
  'yt-out': () => { try { ytPlayer?.pauseVideo?.(); } catch {} },
  'yt-close': ytClose, 'yt-connect': ytConnect,
  'yt-open-pl': el => ytOpenPlaylist(el.dataset.id, el.dataset.name),
  'yt-signin': async () => { S.yt.signedIn = !S.yt.signedIn; await idb.put('kv', S.yt, 'yt'); ytReset(); rerender(); toast(S.yt.signedIn ? 'On. Sign in to youtube.com in this browser for it to take effect.' : 'Off'); },
  'yt-keys': async () => { S.yt = { ...S.yt, key: $('#yt-key').value.trim(), clientId: $('#yt-cid').value.trim() }; ytToken = ''; await idb.put('kv', S.yt, 'yt'); toast('Saved'); },
  'yt-help': () => { const d = $('#lyr'); lyrLive = null; $('.lrc', d).hidden = true; $('pre', d).hidden = false; $('h3', d).textContent = 'Setting up YouTube search and your account'; $('pre', d).textContent = YT_HELP; $('.lyr-src', d).textContent = ''; d.showModal(); $('pre', d).scrollTop = 0; },
  'rad-tag': el => { S.radTag = el.dataset.tag; S.radQ = ''; saveRadioPrefs(); rerender(); },
  'car-on': () => carMode(true), 'car-exit': () => carMode(false),
  'stat-p': el => { S.statP = +el.dataset.d; rerender(); },
  'theme-mode': el => { const th = THEMES[el.dataset.mode]; if (!th) return; S.theme.mode = el.dataset.mode; S.theme.accent = th.accent; artTint.clear(); applyTheme(); rerender(); },
  'theme-auto': () => { S.theme.auto = !S.theme.auto; applyTheme(); if (!S.theme.auto) document.documentElement.style.setProperty('--accent', S.theme.accent); rerender(); },
  'theme-accent': el => { S.theme.accent = el.dataset.c; S.theme.auto = false; applyTheme(); rerender(); },
  'export-view': () => exportTracks(viewIds),
  'sel-export': () => { const ids = [...S.sel]; clearSel(); exportTracks(ids); },
  // The artist line under the playing song leads to everything by that artist.
  'go-artist': () => {
    const t = current(); if (!t) return;
    nav(!t.url ? `#/artist/${encodeURIComponent(norm(t.albumArtist || t.artist || 'Unknown artist'))}`
      : t.kind === 'episode' ? `#/podcast/${encodeURIComponent(t.podId)}` : t.kind === 'ia' ? `#/archive/${encodeURIComponent(t.iaId)}` : '#/online/radio');
  },
  'sel-done': clearSel,
  'sel-all': () => { for (const l of $$('.tracklist')) for (const id of l._ids) S.sel.add(id); syncSel(); },
  'sel-next': () => { enqueue([...S.sel], true); clearSel(); },
  'sel-queue': () => { enqueue([...S.sel], false); clearSel(); },
  'sel-playlist': () => { const ids = [...S.sel]; clearSel(); pickPlaylist(ids); },
  'sel-delete': async () => {
    const ids = [...S.sel].filter(id => S.tracks.has(id));
    if (!ids.length) return toast('Only songs in your library can be deleted');
    if (!await ask({ title: `Delete ${ids.length} song${ids.length === 1 ? '' : 's'} from your library?`, text: 'Files in linked folders are not touched.', ok: 'Delete', danger: true })) return;
    clearSel(); deleteTracks(ids);
  },
  'back15': () => seekBy(-15), 'fwd30': () => seekBy(30),
  'fx-toggle': el => {
    const k = el.dataset.key; S.fx[k] = !S.fx[k];
    if (wantGraph()) ensureGraph();
    applyEq();
    if (k === 'level') { ELS.forEach(applyVol); const t = current(); if (S.fx.level && t && !t.url) analyseGain(t); }
    if (k === 'gapless' && !S.fx.gapless && !S.fx.xfade) dropPrepared();
    saveFx(); rerender();
  },
  'ia-set': el => { S.iaSet = el.dataset.set; rerender(); },
  'pod-genre': el => { S.podGenre = el.dataset.g; idb.put('kv', S.podGenre, 'podGenre').catch(() => {}); rerender(); },
  'save-album': async () => {
    const al = S.curAlbum; if (!al) return;
    const on = S.ia.some(a => a.id === al.id);
    S.ia = on ? S.ia.filter(a => a.id !== al.id) : [...S.ia, al];
    await idb.put('kv', S.ia, 'iaSaved');
    if (on) idb.del('kv', 'ia:' + al.id).catch(() => {}); else if (iaMem.has(al.id)) idb.put('kv', iaMem.get(al.id), 'ia:' + al.id).catch(() => {});
    toast(on ? 'Removed from saved' : 'Saved — find it under Free music'); rerender();
  },
  'album-dl': async () => {
    const todo = viewIds.map(T).filter(t => t?.kind === 'ia' && !S.dl[t.id]);
    if (!todo.length) return toast('Everything here is already downloaded');
    if (!navigator.onLine) return toast('Connect to the internet to download');
    let done = 0;
    for (const t of todo) {
      setBanner(`<span>Downloading… ${done + 1} / ${todo.length}</span><div class="bar"><i style="width:${done / todo.length * 100}%"></i></div>`);
      try { const r = await fetch(t.url); if (!r.ok) throw new Error('HTTP ' + r.status); await idb.put('files', await r.blob(), t.id); S.dl[t.id] = t; done++; }
      catch (e) { if (e?.name === 'QuotaExceededError') { toast('Storage is full'); break; } if (!done) break; }
    }
    await idb.put('kv', S.dl, 'dl'); setBanner('');
    toast(done ? `Downloaded ${done} track${done === 1 ? '' : 's'} for offline` : "This recording is stream-only and can't be downloaded");
    if (page() === 'archive') rerender();
  },
  'toggle-online': async () => { S.online = S.online === false; await idb.put('kv', S.online, 'online'); rerender(); },
  'find-covers': findAllCovers,
  'export': exportBackup,
  'import-backup': () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => i.files[0] && importBackup(i.files[0]); i.click(); },
  'reconnect': async () => {
    for (const f of S.folders) { try { await f.handle.requestPermission({ mode: 'read' }); } catch {} }
    if (await checkFolderAccess()) { toast('Folder reconnected'); resumePending(); }
  },
  'rescan': async el => {
    const f = S.folders.find(x => x.id === el.dataset.id); if (!f) return;
    try { if (await f.handle.requestPermission({ mode: 'read' }) !== 'granted') return; } catch { return; }
    if (!f.pending) f.doneDirs = [];
    scanFolder(f);
  },
  'unlink': async el => {
    const f = S.folders.find(x => x.id === el.dataset.id); if (!f) return;
    if (!await ask({ title: 'Remove linked folder?', text: `Songs from “${f.name}” will leave your Cadence library. The files themselves are not touched.`, ok: 'Remove', danger: true })) return;
    S.folders = S.folders.filter(x => x !== f); await idb.put('kv', S.folders, 'folders');
    await deleteTracks([...S.tracks.values()].filter(t => t.folderId === f.id).map(t => t.id));
  },
  'wipe': async () => {
    if (!await ask({ title: 'Delete entire library?', text: 'All songs, playlists and likes will be removed from Cadence on this device. Files in linked folders are not touched.', ok: 'Delete everything', danger: true })) return;
    audio.pause(); audio.removeAttribute('src');
    for (const s of ['tracks', 'files', 'art', 'playlists', 'kv']) await idb.clear(s);
    location.hash = '#/home'; location.reload();
  },
  'install': async () => { if (installEvt) { installEvt.prompt(); installEvt = null; route(); } },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  lastPointer = { clientX: e.clientX, clientY: e.clientY };   // menus opened by this action appear where it was clicked
  A[el.dataset.act]?.(el, e);
});
document.addEventListener('contextmenu', e => {
  const row = e.target.closest('.row'); if (!row || !row.closest('.tracklist')) return;
  e.preventDefault();
  trackMenu(T(row.dataset.id), e, { ...row.closest('.tracklist')._ctx, i: +row.dataset.i });
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input:not([type=range]), textarea, select') || $('#dlg').open) return;
  if (e.key === 'Escape') { if (!$('#menu').hidden) closeMenu(); else if (!$('#car').hidden) carMode(false); else if (S.sel.size) clearSel(); else closeNP(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight' && e.shiftKey) next();
  else if (e.key === 'ArrowLeft' && e.shiftKey) prev();
  else if (e.key === 'ArrowRight' && S.loadedId) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  else if (e.key === 'ArrowLeft' && S.loadedId) audio.currentTime = Math.max(0, audio.currentTime - 5);
  else if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
});

/* ---------------- hover tooltips (mouse only) ---------------- */
const tip = document.createElement('div'); tip.id = 'tip'; tip.setAttribute('role', 'tooltip'); document.body.append(tip);
let tipEl = null, tipTimer = null;
function hideTip() { clearTimeout(tipTimer); tip.classList.remove('show'); }
function showTip(el) {
  const text = el.isConnected && el.getAttribute('aria-label'); if (!text) return;
  tip.textContent = text; tip.classList.add('show');
  const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
  const top = r.top - t.height - 8 < 4 ? r.bottom + 8 : r.top - t.height - 8;
  tip.style.top = top + 'px';
  tip.style.left = Math.max(4, Math.min(innerWidth - t.width - 4, r.left + r.width / 2 - t.width / 2)) + 'px';
}
if (matchMedia('(hover: hover)').matches) {
  document.addEventListener('mouseover', e => {
    const el = e.target.closest?.('[aria-label]:not(input[type=search]):not(select)') || null;
    if (el === tipEl) return;
    hideTip(); tipEl = el;
    if (el) tipTimer = setTimeout(() => showTip(el), 350);
  });
  document.addEventListener('mousedown', hideTip, true);
  document.addEventListener('scroll', hideTip, true);
  document.documentElement.addEventListener('mouseleave', () => { hideTip(); tipEl = null; });
}

/* ---------------- boot ---------------- */
async function boot() {
  $$('[data-ic]').forEach(e => e.insertAdjacentHTML('afterbegin', ic(e.dataset.ic)));
  db = await openDB();
  const [tracks, playlists, artKeys, artBlobs, state, folders] = await Promise.all([
    idb.all('tracks'), idb.all('playlists'), idb.keys('art'), idb.all('art'), idb.get('kv', 'state'), idb.get('kv', 'folders'),
  ]);
  S.online = await idb.get('kv', 'online');
  S.pods = await idb.get('kv', 'pods') || [];
  S.stations = await idb.get('kv', 'stations') || [];
  S.dl = await idb.get('kv', 'dl') || {};
  S.epos = await idb.get('kv', 'epos') || {};
  S.ia = await idb.get('kv', 'iaSaved') || [];
  { const hd = await idb.get('kv', 'hide'); if (hd) S.hide = { folders: Array.isArray(hd.folders) ? hd.folders : [], minSecs: +hd.minSecs || 0 }; }
  S.podGenre = await idb.get('kv', 'podGenre') || '';
  S.hist = await idb.get('kv', 'hist') || [];
  { const fx = await idb.get('kv', 'fx'); if (fx) S.fx = { ...S.fx, ...fx, bands: Array.isArray(fx.bands) && fx.bands.length === 5 ? fx.bands : S.fx.bands }; }
  for (const x of state?.remote || []) reg(x);
  for (const x of Object.values(S.dl)) reg(x);
  for (const x of S.stations) reg(x);
  { const rp = await idb.get('kv', 'radioPrefs'); if (rp) { S.radCC = rp.cc ?? null; S.radTag = rp.tag || ''; } }
  S.yt = { ...S.yt, ...(await idb.get('kv', 'yt') || {}) }; S.ytSaved = await idb.get('kv', 'ytSaved') || [];
  S.saved = await idb.get('kv', 'saved') || {};
  for (const x of Object.values(S.saved)) reg(x);
  for (const t of tracks) S.tracks.set(t.id, t);
  artKeys.forEach((k, i) => S.artUrls.set(k, URL.createObjectURL(artBlobs[i])));
  S.playlists = playlists.sort((a, b) => a.createdAt - b.createdAt);
  S.folders = folders || [];
  if (state) {
    S.queue = (state.queue || []).filter(has);
    S.qIndex = Math.max(S.queue.length ? 0 : -1, S.queue.indexOf((state.queue || [])[state.qIndex]));
    S.baseQueue = state.baseQueue?.filter(has) || null;
    S.shuffle = !!state.shuffle; S.repeat = state.repeat || 'off'; S.radio = state.radio && S.tracks.has(state.radio.seed) ? state.radio : null; S.sort = state.sort || 'title';
    S.resumeAt = S.queue[S.qIndex] === (state.queue || [])[state.qIndex] ? state.position || 0 : 0;
    if (state.volume != null) S.volume = state.volume;
  }
  vol.value = S.volume; vol.style.setProperty('--p', S.volume * 100 + '%'); ELS.forEach(applyVol);
  rebuild(); renderSidePlaylists(); syncPlayer();
  lastHash = location.hash; route();
  checkFolderAccess().then(ok => { if (ok) resumePending(); });
  appReady = true; syncTint(); document.documentElement.dataset.ready = '1';
  try {
    const seen = +localStorage.getItem('cadence-version') || 0;
    if (seen && seen < APP_VERSION) setTimeout(() => toast(`Updated to version ${APP_VERSION} — see What’s new in Settings`), 1500);
    localStorage.setItem('cadence-version', APP_VERSION);
  } catch {}
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
    const hadSW = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadSW) return;
      updateReady = true;
      // Just opened and nothing playing: switch to the new version straight away. Otherwise ask.
      if (performance.now() < 20000 && !playing() && !importing) return location.reload();
      $('#update').hidden = false;
    });
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('offline support unavailable', e));
  }
}
boot().catch(e => { console.error(e); view.innerHTML = `<div class="empty"><h1>Couldn't start</h1><p>${esc(e.message || e)}</p><p>Private / incognito windows can block the storage this app needs.</p></div>`; });
