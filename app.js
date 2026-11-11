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
};
const audio = $('#audio');
const view = $('#view');
const current = () => S.tracks.get(S.queue[S.qIndex]);
const playing = () => !!S.loadedId && !audio.paused;

function rebuild() {
  S.albums = new Map(); S.artists = new Map();
  for (const t of S.tracks.values()) {
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
const allSongIds = () => [...S.tracks.values()].sort(SORTS[S.sort] || SORTS.title).map(t => t.id);

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
  m._items = items; m.hidden = false; $('#backdrop').hidden = false;
  m.style.left = m.style.top = '';
  if (isDesktop() && lastPointer) {
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(8, Math.min(lastPointer.clientX, innerWidth - r.width - 8)) + 'px';
    m.style.top = Math.max(8, Math.min(lastPointer.clientY, innerHeight - r.height - 8)) + 'px';
  }
}
function closeMenu() { $('#menu').hidden = true; $('#backdrop').hidden = true; }
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
async function importItems(items) {
  if (importing) return toast('An import is already running');
  if (!items.length) return toast('No audio files found');
  importing = true;
  navigator.storage?.persist?.().catch(() => {});
  let mm = null;
  try { mm = await import('./vendor/music-metadata.js'); } catch (e) { console.warn('tag reader unavailable', e); }
  const seen = new Set([...S.tracks.values()].map(t => `${t.fileName}|${t.size}`));
  let added = 0, skipped = 0, failed = 0, stop = false;
  setBanner(`<span id="imp-text">Adding music…</span><div class="bar"><i></i></div><button class="btn" id="imp-stop">Stop</button>`);
  $('#imp-stop').onclick = () => { stop = true; };

  for (let i = 0; i < items.length && !stop; i++) {
    const it = items[i];
    try {
      const file = it.file || await it.handle.getFile();
      if (!(AUDIO_EXT.test(file.name) || file.type.startsWith('audio/'))) continue;
      const sig = `${file.name}|${file.size}`;
      if (seen.has(sig)) { skipped++; continue; }
      let c = {}, f = {};
      if (mm) { try { const meta = await mm.parseBlob(file); c = meta.common || {}; f = meta.format || {}; } catch { /* untagged or odd file */ } }
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
        fileName: file.name, size: file.size, linked: !!it.handle, folderId: it.folderId || null,
        addedAt: Date.now(), liked: 0, plays: 0, lastPlayed: 0,
      };
      await idb.put('files', it.handle || file, id);
      if (c.picture?.length && !S.artUrls.has(t.artId)) {
        const thumb = await makeThumb(c.picture[0]);
        await idb.put('art', thumb, t.artId);
        S.artUrls.set(t.artId, URL.createObjectURL(thumb));
      }
      await idb.put('tracks', t);
      S.tracks.set(id, t); seen.add(sig); added++;
    } catch (e) {
      console.warn('import failed', e);
      if (e?.name === 'QuotaExceededError') { toast('Storage is full — stopped importing'); break; }
      failed++;
    }
    if (i % 5 === 0 || i === items.length - 1) {
      const txt = $('#imp-text'); if (txt) txt.textContent = `Adding music… ${i + 1} / ${items.length}`;
      const bar = $('#banner .bar i'); if (bar) bar.style.width = ((i + 1) / items.length * 100) + '%';
    }
    if (added && added % 25 === 0 && view.scrollTop < 10) { rebuild(); route(); }
  }
  importing = false; setBanner('');
  rebuild(); route();
  toast(added ? `Added ${added} song${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} already in library` : ''}`
    : skipped ? 'Those songs are already in your library' : failed ? 'Could not read those files' : 'No audio files found');
  checkFolderAccess();
}

async function* walkDir(dir) {
  for await (const h of dir.values()) {
    if (h.kind === 'file') { if (AUDIO_EXT.test(h.name)) yield h; }
    else yield* walkDir(h);
  }
}
async function scanFolder(folder) {
  setBanner(`<span>Scanning “${esc(folder.name)}”…</span>`);
  const items = [];
  try { for await (const h of walkDir(folder.handle)) items.push({ handle: h, folderId: folder.id }); }
  catch (e) { setBanner(''); return toast('Could not read that folder'); }
  setBanner('');
  await importItems(items);
}
async function addFolder() {
  if (!window.showDirectoryPicker) return $('#dir-input').click();
  let handle;
  try { handle = await showDirectoryPicker({ mode: 'read', id: 'music' }); } catch { return; }
  for (const f of S.folders) if (await f.handle.isSameEntry(handle)) return scanFolder(f);
  const folder = { id: uid(), name: handle.name, handle };
  S.folders.push(folder); await idb.put('kv', S.folders, 'folders');
  await scanFolder(folder);
}
async function checkFolderAccess() {
  if (importing) return;
  for (const f of S.folders) {
    if (await f.handle.queryPermission({ mode: 'read' }) !== 'granted') {
      setBanner(`<span style="flex:1">Your linked music folder needs permission again to play.</span><button class="btn primary" data-act="reconnect">Reconnect</button>`);
      return false;
    }
  }
  if ($('#banner [data-act=reconnect]')) setBanner('');
  return true;
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
let unlocked = false, loadToken = 0, curUrl = null, errStreak = 0;
// Mobile browsers only allow audio started by a tap. Prime the element on the first tap so
// later plays (which happen after async storage reads, or on auto-advance) are allowed.
document.addEventListener('click', () => {
  if (unlocked) return; unlocked = true;
  if (!S.loadedId) { audio.src = SILENCE; audio.play().catch(() => {}); }
}, true);

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

async function loadCurrent(autoplay = true, startAt = 0) {
  const t = current(); if (!t) return;
  const token = ++loadToken;
  S.resumeAt = 0;
  syncPlayer(); saveState();
  try {
    const file = await getFile(t.id);
    if (token !== loadToken) return;
    if (curUrl) URL.revokeObjectURL(curUrl);
    curUrl = URL.createObjectURL(file);
    S.loadedId = t.id;
    audio.src = curUrl;
    if (startAt) audio.addEventListener('loadedmetadata', () => { audio.currentTime = startAt; }, { once: true });
    if (autoplay) await audio.play();
    errStreak = 0;
  } catch (e) {
    if (token !== loadToken || e?.name === 'AbortError') return;
    if (e?.name === 'NotAllowedError') { toast(t.linked ? 'Reconnect your music folder to play' : 'Tap play to start'); syncPlayer(); return; }
    playbackFailed(t);
  }
}
function playbackFailed(t) {
  toast(`Can't play “${t.title}”`);
  S.loadedId = null;
  if (++errStreak < 4 && S.qIndex < S.queue.length - 1) { S.qIndex++; loadCurrent(true); } else syncPlayer();
}
// State checks (audio.error / audio.ended) ignore stale events left over from the priming clip.
audio.addEventListener('error', () => { const t = current(); if (S.loadedId && t && audio.error && audio.src === curUrl) playbackFailed(t); });

function playContext(ids, i = 0) {
  ids = ids.filter(id => S.tracks.has(id)); if (!ids.length) return;
  i = Math.max(0, Math.min(i, ids.length - 1));
  S.baseQueue = [...ids];
  if (S.shuffle) { const first = ids[i]; const rest = ids.filter((_, j) => j !== i); S.queue = [first, ...shuffleArr(rest)]; S.qIndex = 0; }
  else { S.queue = [...ids]; S.qIndex = i; }
  loadCurrent(true);
}
function shufflePlay(ids) { if (!ids.length) return; S.shuffle = true; playContext(ids, Math.floor(Math.random() * ids.length)); }
function toggle() {
  if (!S.loadedId) {
    if (current()) loadCurrent(true, S.resumeAt);
    else if (S.tracks.size) playContext(allSongIds(), 0);
    return;
  }
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
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
function toggleShuffle() {
  S.shuffle = !S.shuffle;
  const cur = S.queue[S.qIndex];
  if (S.shuffle) S.queue = [...S.queue.slice(0, S.qIndex + 1), ...shuffleArr(S.queue.slice(S.qIndex + 1))];
  else if (S.baseQueue) { const i = S.baseQueue.indexOf(cur); if (i >= 0) { S.queue = [...S.baseQueue]; S.qIndex = i; } }
  syncPlayer(); saveState(); if (page() === 'queue') route();
}
function cycleRepeat() { S.repeat = { off: 'all', all: 'one', one: 'off' }[S.repeat]; syncPlayer(); saveState(); }
function enqueue(ids, nextUp) {
  ids = ids.filter(id => S.tracks.has(id)); if (!ids.length) return;
  if (!S.queue.length) { S.queue = [...ids]; S.qIndex = 0; S.baseQueue = [...ids]; loadCurrent(false); }
  else if (nextUp) S.queue.splice(S.qIndex + 1, 0, ...ids);
  else S.queue.push(...ids);
  toast(nextUp ? 'Playing next' : 'Added to queue'); saveState(); if (page() === 'queue') route();
}

audio.addEventListener('ended', () => {
  if (!S.loadedId || !audio.ended) return;
  if (sleepEOT) {
    setSleep(0, true); toast('Sleep timer ended');
    if (S.qIndex < S.queue.length - 1) { S.qIndex++; loadCurrent(false); } else syncPlayer();
    return;
  }
  next(true);
});
let countedLoad = 0;
audio.addEventListener('play', () => {
  const t = current();
  if (S.loadedId && t && countedLoad !== loadToken) { countedLoad = loadToken; t.plays = (t.plays || 0) + 1; t.lastPlayed = Date.now(); idb.put('tracks', t); }
  syncPlayer();
});
audio.addEventListener('pause', syncPlayer);
audio.addEventListener('loadedmetadata', () => {
  const t = current();
  if (S.loadedId && t && isFinite(audio.duration) && Math.abs((t.duration || 0) - audio.duration) > 1) {
    t.duration = audio.duration; idb.put('tracks', t);
    $$(`.row[data-id="${t.id}"] .row-dur`).forEach(el => el.textContent = fmt(t.duration));
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
  $$('.t-dur').forEach(e => e.textContent = fmt(dur));
  $('#mini-progress i').style.width = p + '%';
  if ('mediaSession' in navigator && S.loadedId && dur && isFinite(dur)) {
    try { navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(cur, dur), playbackRate: audio.playbackRate || 1 }); } catch {}
  }
}
audio.addEventListener('timeupdate', () => {
  if (!S.loadedId) return;
  syncTime();
  if (sleepAt && Date.now() >= sleepAt) { audio.pause(); setSleep(0, true); toast('Sleep timer ended'); }
  if (Date.now() - lastSave > 5000) saveState();
});
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
vol.addEventListener('input', () => { audio.volume = +vol.value; vol.style.setProperty('--p', vol.value * 100 + '%'); saveState(); });

function syncPlayer() {
  const t = current(), on = playing();
  $('#player').classList.toggle('idle', !t);
  $('#p-title').textContent = t ? t.title : 'Nothing playing';
  $('#p-artist').textContent = t ? (t.artist || 'Unknown artist') : '';
  $('#np-title').textContent = t ? t.title : '';
  $('#np-artist').textContent = t ? (t.artist || 'Unknown artist') : '';
  setArt($('#p-art'), t); setArt($('#np-art'), t);
  const u = t && S.artUrls.get(t.artId);
  $('#np-bg').style.backgroundImage = u ? `url('${u}')` : 'none';
  $$('.pp').forEach(b => b.innerHTML = ic(on ? 'pause' : 'play'));
  $$('.b-shuffle').forEach(b => b.classList.toggle('on', S.shuffle));
  $$('.b-repeat').forEach(b => { b.classList.toggle('on', S.repeat !== 'off'); b.innerHTML = ic(S.repeat === 'one' ? 'repeat1' : 'repeat'); });
  $$('.cur-like').forEach(b => b.classList.toggle('on', !!t?.liked));
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
  if (id) $$(`.row[data-id="${id}"]`).forEach(r => { if (!r.closest('.tracklist')?._ctx.queueOffset) r.classList.add('playing'); });
}
if ('mediaSession' in navigator) {
  const set = (a, fn) => { try { navigator.mediaSession.setActionHandler(a, fn); } catch {} };
  set('play', () => toggle()); set('pause', () => audio.pause());
  set('previoustrack', prev); set('nexttrack', () => next());
  set('seekto', d => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
  set('seekbackward', d => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
  set('seekforward', d => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
}

let saveTimer;
function saveState() {
  lastSave = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => idb.put('kv', {
    queue: S.queue, qIndex: S.qIndex, baseQueue: S.baseQueue, shuffle: S.shuffle, repeat: S.repeat,
    volume: audio.volume, position: S.loadedId ? audio.currentTime : S.resumeAt, sort: S.sort,
  }, 'state').catch(() => {}), 300);
}
addEventListener('pagehide', saveState);

/* ---------------- library mutations ---------------- */
async function toggleLike(id) {
  const t = S.tracks.get(id); if (!t) return;
  t.liked = t.liked ? 0 : Date.now(); await idb.put('tracks', t);
  $$(`.row[data-id="${id}"] .like`).forEach(b => b.classList.toggle('on', !!t.liked));
  syncPlayer(); if (page() === 'liked') route();
}
async function newPlaylist(withIds = []) {
  const name = await ask({ title: 'New playlist', input: `My playlist #${S.playlists.length + 1}`, ok: 'Create' });
  if (!name) return null;
  const p = { id: uid(), name, trackIds: [...withIds], createdAt: Date.now() };
  S.playlists.push(p); await idb.put('playlists', p); renderSidePlaylists();
  if (withIds.length) toast(`Added to ${name}`); else location.hash = `#/playlist/${p.id}`;
  if (page() === 'playlists') route();
  return p;
}
async function addToPlaylist(p, ids) {
  const fresh = ids.filter(id => !p.trackIds.includes(id));
  if (!fresh.length) return toast('Already in that playlist');
  p.trackIds.push(...fresh); await idb.put('playlists', p); toast(`Added to ${p.name}`);
}
function pickPlaylist(ids) {
  openMenu([
    { label: 'New playlist', icon: 'plus', fn: () => newPlaylist(ids) },
    ...S.playlists.map(p => ({ label: p.name, icon: 'list', fn: () => addToPlaylist(p, ids) })),
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
  const pl = ctx.playlistId && S.playlists.find(p => p.id === ctx.playlistId);
  openMenu([
    { label: 'Play next', icon: 'next', fn: () => enqueue([t.id], true) },
    { label: 'Add to queue', icon: 'queue', fn: () => enqueue([t.id], false) },
    { label: 'Add to playlist', icon: 'plus', fn: () => pickPlaylist([t.id]) },
    { label: t.liked ? 'Remove from liked songs' : 'Like', icon: 'heart', fn: () => toggleLike(t.id) },
    t.album && { label: 'Go to album', icon: 'disc', fn: () => { closeNP(); location.hash = `#/album/${encodeURIComponent(t.albumKey)}`; } },
    { label: 'Go to artist', icon: 'user', fn: () => { closeNP(); location.hash = `#/artist/${encodeURIComponent(norm(t.albumArtist || t.artist || 'Unknown artist'))}`; } },
    ctx.np && { label: sleepLabel(), icon: 'moon', fn: () => sleepMenu() },
    { label: 'Lyrics', icon: 'text', fn: () => showLyrics(t) },
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
    sleepTimer = setTimeout(() => { audio.pause(); setSleep(0, true); toast('Sleep timer ended'); }, min * 60000);
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

/* ---------------- lyrics, editing, reordering ---------------- */
async function showLyrics(t) {
  let text = '';
  try {
    const mm = await import('./vendor/music-metadata.js');
    const meta = await mm.parseBlob(await getFile(t.id), { skipCovers: true });
    text = (meta.common.lyrics || []).map(l => typeof l === 'string' ? l : (l.text || (l.syncText || []).map(x => x.text).join('\n'))).filter(Boolean).join('\n\n');
  } catch (e) { console.warn('lyrics', e); }
  const d = $('#lyr');
  $('h3', d).textContent = `${t.title} · ${t.artist || 'Unknown artist'}`;
  $('pre', d).textContent = text.trim() || 'No lyrics are saved inside this file.';
  d.showModal(); $('pre', d).scrollTop = 0;
}
async function editInfo(t) {
  const d = $('#edit'), f = $('form', d).elements;
  for (const k of ['title', 'artist', 'album', 'albumArtist']) f[k].value = t[k] || '';
  f.trackNo.value = t.trackNo || '';
  d.returnValue = 'cancel'; d.showModal(); f.title.focus();
  await new Promise(r => d.addEventListener('close', r, { once: true }));
  if (d.returnValue !== 'ok') return;
  const oldArt = t.artId;
  t.title = f.title.value.trim() || t.title;
  for (const k of ['artist', 'album', 'albumArtist']) t[k] = f[k].value.trim();
  t.trackNo = +f.trackNo.value || null;
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
  syncPlayer(); toast('Saved');
}
async function movePl(p, i, d) {
  const ids = p.trackIds.filter(id => S.tracks.has(id));
  [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
  p.trackIds = ids; await idb.put('playlists', p); rerender();
}
function moveQ(i, d) { [S.queue[i], S.queue[i + d]] = [S.queue[i + d], S.queue[i]]; saveState(); rerender(); }

/* ---------------- backup: carry playlists + likes between devices ---------------- */
const sigOf = t => `${t.fileName}|${t.size}`;
function exportBackup() {
  const data = {
    app: 'cadence', version: 1, exportedAt: new Date().toISOString(),
    playlists: S.playlists.map(p => ({ name: p.name, tracks: p.trackIds.map(i => S.tracks.get(i)).filter(Boolean).map(sigOf) })),
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
    if (!p) { p = { id: uid(), name, trackIds: [], createdAt: Date.now() + pls }; S.playlists.push(p); }
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
  recent: { name: 'Recently added', icon: 'clock', bg: '#2a6f97,#1b3a4b', ids: () => [...S.tracks.values()].sort((a, b) => b.addedAt - a.addedAt || a.title.localeCompare(b.title)).slice(0, 100).map(t => t.id) },
  top: { name: 'Most played', icon: 'note', bg: '#7b2cbf,#3c096c', ids: () => [...S.tracks.values()].filter(t => t.plays).sort((a, b) => b.plays - a.plays).slice(0, 100).map(t => t.id) },
  history: { name: 'Recently played', icon: 'repeat', bg: '#2d6a4f,#1b4332', ids: () => [...S.tracks.values()].filter(t => t.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 100).map(t => t.id) },
};

/* ---------------- views ---------------- */
function rowHTML(t, i, ctx) {
  const lead = ctx.numbered ? `<div class="row-num">${t.trackNo || i + 1}</div>` : `<div class="row-art">${artDiv(t.artId, t.album || t.title)}</div>`;
  return `<div class="row" data-act="play-row" data-i="${i}" data-id="${t.id}">
    ${lead}
    <div class="row-main"><div class="row-title">${esc(t.title)}</div><div class="row-sub">${esc(t.artist || 'Unknown artist')}</div></div>
    <div class="row-album">${esc(t.album || '')}</div>
    <button class="icon-btn like ${t.liked ? 'on' : ''}" data-act="like" aria-label="Like">${ic('heart')}</button>
    <div class="row-dur">${fmt(t.duration)}</div>
    <button class="icon-btn" data-act="row-menu" aria-label="More options">${ic('dots')}</button>
  </div>`;
}
function trackList(ids, ctx = {}) {
  ids = ids.filter(id => S.tracks.has(id));
  const el = document.createElement('div'); el.className = 'tracklist'; el._ids = ids; el._ctx = ctx;
  const sentinel = document.createElement('div'); el.append(sentinel);
  let n = 0;
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) more(); }, { root: view, rootMargin: '1200px' });
  function more() {
    const end = Math.min(ids.length, n + 200); let html = '';
    for (; n < end; n++) html += rowHTML(S.tracks.get(ids[n]), n, ctx);
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
    const ts = [...S.tracks.values()];
    const recent = ts.filter(t => t.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 8);
    const newest = [...S.albums.values()].sort((a, b) => b.addedAt - a.addedAt).slice(0, 12);
    const top = ts.filter(t => t.plays).sort((a, b) => b.plays - a.plays).slice(0, 10);
    const hr = new Date().getHours();
    viewIds = allSongIds();
    setView(
      `<h1>${hr < 5 ? 'Late night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'}</h1>
       <div class="muted">${total(ts)} in your library</div>${heroActions().replace('Play<', 'Play all<')}`,
      recent.length ? `<h2>Jump back in</h2><div class="tiles">${recent.map(t => `<button class="tile" data-act="play-recent" data-id="${t.id}">${artDiv(t.artId, t.album || t.title)}<span>${esc(t.title)}</span></button>`).join('')}</div>` : '',
      `<h2>Recently added</h2><div class="grid">${newest.map(albumCard).join('')}</div>`,
      top.length ? '<h2>Most played</h2>' : '', top.length ? trackList(top.map(t => t.id)) : null,
    );
  },
  library(tab = 'songs') {
    if (!S.tracks.size) return setView(emptyLib());
    const chips = `<div class="chips">${['songs', 'albums', 'artists'].map(c => `<a class="chip ${c === tab ? 'active' : ''}" href="#/library/${c}">${c[0].toUpperCase() + c.slice(1)}</a>`).join('')}
      ${tab === 'songs' ? `<select id="sort" aria-label="Sort songs">${[['title', 'Title'], ['artist', 'Artist'], ['album', 'Album'], ['recent', 'Recently added']].map(([v, l]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div>`;
    if (tab === 'albums') return setView('<h1>Library</h1>', chips, `<div class="grid">${[...S.albums.values()].sort((a, b) => a.name.localeCompare(b.name)).map(albumCard).join('')}</div>`);
    if (tab === 'artists') return setView('<h1>Library</h1>', chips, `<div class="grid">${[...S.artists.values()].sort((a, b) => a.name.localeCompare(b.name)).map(artistCard).join('')}</div>`);
    viewIds = allSongIds();
    setView('<h1>Library</h1>', chips, trackList(viewIds));
    $('#sort').onchange = e => { S.sort = e.target.value; saveState(); route(); };
  },
  album(key) {
    const al = S.albums.get(key); if (!al) return setView('<div class="empty">Album not found.</div>');
    viewIds = al.tracks.map(t => t.id);
    setView(`<div class="hero">${artDiv(al.artId, al.name, '', 'disc')}<div class="hero-text"><div class="kind">Album</div><h1>${esc(al.name)}</h1>
      <div class="muted"><a href="#/artist/${encodeURIComponent(norm(al.artist))}">${esc(al.artist)}</a>${al.year ? ' · ' + al.year : ''} · ${total(al.tracks)}</div>
      ${heroActions(`<button class="icon-btn" data-act="view-menu" aria-label="More">${ic('dots')}</button>`)}</div></div>`, trackList(viewIds, { numbered: true }));
  },
  artist(key) {
    const ar = S.artists.get(key); if (!ar) return setView('<div class="empty">Artist not found.</div>');
    const albums = [...S.albums.values()].filter(a => norm(a.artist) === key).sort((a, b) => (b.year || 0) - (a.year || 0));
    viewIds = [...ar.tracks].sort(SORTS.album).map(t => t.id);
    setView(`<div class="hero">${artDiv(ar.artId, ar.name, 'round', 'user')}<div class="hero-text"><div class="kind">Artist</div><h1>${esc(ar.name)}</h1>
      <div class="muted">${total(ar.tracks)}</div>${heroActions()}</div></div>`,
      albums.length ? `<h2>Albums</h2><div class="grid">${albums.map(albumCard).join('')}</div>` : '',
      '<h2>Songs</h2>', trackList(viewIds));
  },
  liked() {
    const ts = [...S.tracks.values()].filter(t => t.liked).sort((a, b) => b.liked - a.liked);
    viewIds = ts.map(t => t.id);
    setView(`<div class="hero"><div class="art" style="background:linear-gradient(135deg,#ff7a59,#b3246b)">${ic('heart')}</div><div class="hero-text"><div class="kind">Playlist</div><h1>Liked songs</h1>
      <div class="muted">${total(ts)}</div>${ts.length ? heroActions() : ''}</div></div>`,
      ts.length ? trackList(viewIds) : '<div class="empty">Tap the heart on any song to save it here.</div>');
  },
  playlists() {
    setView(`<h1>Playlists</h1><div class="hero-actions" style="margin-bottom:16px"><button class="btn primary" data-act="new-playlist">${ic('plus')}New playlist</button></div>`,
      `<div class="grid"><a class="card" href="#/liked"><div class="art" style="background:linear-gradient(135deg,#ff7a59,#b3246b)">${ic('heart')}</div><div class="card-title">Liked songs</div><div class="card-sub">${[...S.tracks.values()].filter(t => t.liked).length} songs</div></a>
      ${Object.entries(MIXES).map(([k, m]) => `<a class="card" href="#/mix/${k}"><div class="art" style="background:linear-gradient(135deg,${m.bg})">${ic(m.icon)}</div><div class="card-title">${m.name}</div><div class="card-sub">Automatic</div></a>`).join('')}
      ${S.playlists.map(p => { const first = S.tracks.get(p.trackIds.find(i => S.tracks.has(i))); return `<a class="card" href="#/playlist/${p.id}">${artDiv(first?.artId, p.name, '', 'list')}<div class="card-title">${esc(p.name)}</div><div class="card-sub">${p.trackIds.filter(i => S.tracks.has(i)).length} songs</div></a>`; }).join('')}</div>`);
  },
  playlist(id) {
    const p = S.playlists.find(x => x.id === id); if (!p) return setView('<div class="empty">Playlist not found.</div>');
    viewIds = p.trackIds.filter(i => S.tracks.has(i));
    const ts = viewIds.map(i => S.tracks.get(i));
    setView(`<div class="hero">${artDiv(ts[0]?.artId, p.name, '', 'list')}<div class="hero-text"><div class="kind">Playlist</div><h1>${esc(p.name)}</h1>
      <div class="muted">${total(ts)}</div>${heroActions(`<button class="icon-btn" data-act="playlist-menu" data-id="${p.id}" aria-label="More">${ic('dots')}</button>`)}</div></div>`,
      ts.length ? trackList(viewIds, { playlistId: p.id }) : '<div class="empty">This playlist is empty. Use the ⋯ menu on any song to add it.</div>');
  },
  mix(kind) {
    const m = MIXES[kind]; if (!m) return setView('<div class="empty">Not found.</div>');
    viewIds = m.ids();
    setView(`<div class="hero"><div class="art" style="background:linear-gradient(135deg,${m.bg})">${ic(m.icon)}</div><div class="hero-text"><div class="kind">Automatic playlist</div><h1>${m.name}</h1>
      <div class="muted">${total(viewIds.map(i => S.tracks.get(i)))}</div>${viewIds.length ? heroActions(`<button class="icon-btn" data-act="view-menu" aria-label="More">${ic('dots')}</button>`) : ''}</div></div>`,
      viewIds.length ? trackList(viewIds) : '<div class="empty">Play some music and this fills in by itself.</div>');
  },
  search() {
    const q = norm(S.q.trim());
    if (!q) return setView('<h1>Search</h1><div class="empty">Find songs, albums and artists in your library.</div>');
    const words = q.split(/\s+/);
    const hit = s => words.every(w => s.includes(w));
    const songs = [...S.tracks.values()].filter(t => hit(norm(`${t.title} ${t.artist} ${t.album}`)))
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
    setView(`<h1>Queue</h1><div class="hero-actions"><button class="btn ${sleepAt || sleepEOT ? 'primary' : ''}" data-act="sleep">${ic('moon')}${sleepLabel()}</button></div><h2>Now playing</h2>`, trackList([t.id], { nowRow: true }),
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
        <button class="btn danger" data-act="wipe">${ic('trash')}Delete entire library</button></div>`,
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
  const navKey = { album: 'library', artist: 'library', playlist: 'playlists', mix: 'playlists', liked: isDesktop() ? 'liked' : 'playlists' }[p] || p;
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
  $$('#side-playlists a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === location.hash));
}
function rerender() { const y = view.scrollTop; route(); view.scrollTop = y; }
let lastHash = '';
addEventListener('hashchange', () => {
  const samePage = lastHash.split('/')[1] === page();
  lastHash = location.hash;
  if (page() !== 'search' && S.q) { S.q = ''; $('#q').value = ''; }
  route(); if (!samePage || page() !== 'library') view.scrollTop = 0;
  if (page() === 'search' && !S.q && !isDesktop()) $('#q').focus();
});
$('#q').addEventListener('input', e => { S.q = e.target.value; if (page() !== 'search') location.hash = '#/search'; else route(); });
$('#q').addEventListener('focus', () => { if (page() !== 'search' && !isDesktop()) location.hash = '#/search'; });

function renderSidePlaylists() {
  $('#side-playlists').innerHTML = S.playlists.map(p => `<a href="#/playlist/${p.id}">${ic('list')}<span>${esc(p.name)}</span></a>`).join('');
}
function openNP() { if (current()) $('#np').hidden = false; }
function closeNP() { $('#np').hidden = true; }

/* ---------------- actions ---------------- */
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (page() === 'settings') route(); });

const A = {
  'add-music': (el, e) => openMenu([
    { label: 'Add files', icon: 'file', fn: () => $('#file-input').click() },
    (window.showDirectoryPicker || isDesktop()) && { label: window.showDirectoryPicker ? 'Link a folder' : 'Add a folder', icon: 'folder', fn: addFolder },
  ], e, 'Add music'),
  'add-files': () => $('#file-input').click(),
  'add-folder': addFolder,
  'play-row': el => {
    const list = el.closest('.tracklist'), i = +el.dataset.i;
    if (list._ctx.nowRow) return toggle();
    if (list._ctx.queueOffset) { S.qIndex = list._ctx.queueOffset + i; loadCurrent(true); return route(); }
    if (el.dataset.id === S.loadedId && list._ids[i] === S.queue[S.qIndex]) return toggle();
    playContext(list._ids, i);
  },
  'like': el => toggleLike(el.closest('.row').dataset.id),
  'row-menu': (el, e) => { const row = el.closest('.row'), list = row.closest('.tracklist'); trackMenu(S.tracks.get(row.dataset.id), e, { ...list._ctx, i: +row.dataset.i }); },
  'play-view': () => { S.shuffle = false; playContext(viewIds, 0); },
  'shuffle-view': () => shufflePlay(viewIds),
  'play-album': (el, e) => { e.preventDefault(); const al = S.albums.get(el.dataset.key); if (al) playContext(al.tracks.map(t => t.id), 0); },
  'play-recent': el => playContext([...S.tracks.values()].filter(t => t.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 8).map(t => t.id), $$('.tile').indexOf(el)),
  'view-menu': (el, e) => openMenu([
    { label: 'Play next', icon: 'next', fn: () => enqueue(viewIds, true) },
    { label: 'Add to queue', icon: 'queue', fn: () => enqueue(viewIds, false) },
    { label: 'Add to playlist', icon: 'plus', fn: () => pickPlaylist(viewIds) },
  ], e),
  'playlist-menu': (el, e) => {
    const p = S.playlists.find(x => x.id === el.dataset.id); if (!p) return;
    openMenu([
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
  'export': exportBackup,
  'import-backup': () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => i.files[0] && importBackup(i.files[0]); i.click(); },
  'reconnect': async () => {
    for (const f of S.folders) { try { await f.handle.requestPermission({ mode: 'read' }); } catch {} }
    if (await checkFolderAccess()) toast('Folder reconnected');
  },
  'rescan': async el => {
    const f = S.folders.find(x => x.id === el.dataset.id); if (!f) return;
    try { if (await f.handle.requestPermission({ mode: 'read' }) !== 'granted') return; } catch { return; }
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
  A[el.dataset.act]?.(el, e);
});
document.addEventListener('contextmenu', e => {
  const row = e.target.closest('.row'); if (!row) return;
  e.preventDefault();
  trackMenu(S.tracks.get(row.dataset.id), e, { ...row.closest('.tracklist')._ctx, i: +row.dataset.i });
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input:not([type=range]), textarea, select') || $('#dlg').open) return;
  if (e.key === 'Escape') { if (!$('#menu').hidden) closeMenu(); else closeNP(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight' && e.shiftKey) next();
  else if (e.key === 'ArrowLeft' && e.shiftKey) prev();
  else if (e.key === 'ArrowRight' && S.loadedId) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  else if (e.key === 'ArrowLeft' && S.loadedId) audio.currentTime = Math.max(0, audio.currentTime - 5);
  else if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
});

/* ---------------- boot ---------------- */
async function boot() {
  $$('[data-ic]').forEach(e => e.insertAdjacentHTML('afterbegin', ic(e.dataset.ic)));
  db = await openDB();
  const [tracks, playlists, artKeys, artBlobs, state, folders] = await Promise.all([
    idb.all('tracks'), idb.all('playlists'), idb.keys('art'), idb.all('art'), idb.get('kv', 'state'), idb.get('kv', 'folders'),
  ]);
  for (const t of tracks) S.tracks.set(t.id, t);
  artKeys.forEach((k, i) => S.artUrls.set(k, URL.createObjectURL(artBlobs[i])));
  S.playlists = playlists.sort((a, b) => a.createdAt - b.createdAt);
  S.folders = folders || [];
  if (state) {
    S.queue = (state.queue || []).filter(id => S.tracks.has(id));
    S.qIndex = Math.max(S.queue.length ? 0 : -1, S.queue.indexOf((state.queue || [])[state.qIndex]));
    S.baseQueue = state.baseQueue?.filter(id => S.tracks.has(id)) || null;
    S.shuffle = !!state.shuffle; S.repeat = state.repeat || 'off'; S.sort = state.sort || 'title';
    S.resumeAt = S.queue[S.qIndex] === (state.queue || [])[state.qIndex] ? state.position || 0 : 0;
    if (state.volume != null) audio.volume = state.volume;
  }
  vol.value = audio.volume; vol.style.setProperty('--p', audio.volume * 100 + '%');
  rebuild(); renderSidePlaylists(); syncPlayer();
  lastHash = location.hash; route();
  checkFolderAccess();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
    const hadSW = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadSW) return;
      if (playing()) toast('Update ready — reopen Cadence to get it'); else location.reload();
    });
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('offline support unavailable', e));
  }
}
boot().catch(e => { console.error(e); view.innerHTML = `<div class="empty"><h1>Couldn't start</h1><p>${esc(e.message || e)}</p><p>Private / incognito windows can block the storage this app needs.</p></div>`; });
