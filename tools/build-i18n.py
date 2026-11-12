#!/usr/bin/env python3
"""Builds i18n/<lang>.json from the translation tables in i18n/*.tsv.

strings-*.tsv: one row per English phrase, a column per language.
patterns.tsv:  templates for text with numbers in it ({n}, {a}, {x}...); keys with a dot are plural forms.
Run from the project folder:  python3 tools/build-i18n.py
"""
import glob, json, os, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'i18n'))
LANGS = ['ga', 'es', 'fr', 'de', 'pl', 'pt', 'it', 'nl']
d = {l: {} for l in LANGS}; seen = {}; bad = 0
for f in sorted(glob.glob('strings-*.tsv')):
    rows = [r.rstrip('\n').split('\t') for r in open(f, encoding='utf-8') if r.strip()]
    if rows[0] != ['en'] + LANGS: sys.exit(f'{f}: header must be en + {LANGS}')
    for i, r in enumerate(rows[1:], 2):
        if len(r) != 9 or not all(x.strip() for x in r): print(f'{f}:{i}: needs 9 filled columns'); bad += 1; continue
        if r[0] in seen: print(f'{f}:{i}: "{r[0]}" already in {seen[r[0]]}'); bad += 1; continue
        seen[r[0]] = f
        for j, l in enumerate(LANGS, 1): d[l][r[0]] = r[j]
p = {l: {} for l in ['en'] + LANGS}
rows = [r.rstrip('\n').split('\t') for r in open('patterns.tsv', encoding='utf-8') if r.strip()]
for r in rows[1:]:
    if len(r) != 10: print(f'patterns.tsv: "{r[0]}" needs 10 columns'); bad += 1; continue
    for j, l in enumerate(['en'] + LANGS, 1):
        if '.' in r[0]: base, cat = r[0].split('.'); p[l].setdefault(base, {})[cat] = r[j]
        else: p[l][r[0]] = r[j]
if bad: sys.exit(f'{bad} problem(s); nothing written')
for l in LANGS:
    with open(f'{l}.json', 'w', encoding='utf-8') as fh: json.dump({'d': d[l], 'p': p[l]}, fh, ensure_ascii=False, separators=(',', ':'))
print(f'{len(seen)} phrases in {len(LANGS)} languages written')
