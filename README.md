# Cadence

Offline music player for your own files. Installable web app (PWA) for Windows, Android and iPhone.

- Static site, no build step and no server code: host this folder on any HTTPS host
  (GitHub Pages, Netlify, Cloudflare Pages), open the URL, then install it from the browser.
- Local test: `python -m http.server 8765` in this folder, then open http://localhost:8765
- Music, playlists and likes are stored per device in the browser's storage. Nothing is uploaded.
- `vendor/music-metadata.js` is the bundled tag reader (music-metadata, MIT), built with
  `esbuild entry.js --bundle --format=esm --minify` where entry.js is
  `export { parseBlob } from 'music-metadata';`
