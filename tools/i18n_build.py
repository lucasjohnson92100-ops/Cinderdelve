#!/usr/bin/env python3
"""Injecte la traduction anglaise dans build/index.html (script <script id="i18n"> placé dans le <head>).
Dictionnaire : tools/i18n/en.json  { "texte français exact": "English text" }.
Usage : python3 tools/i18n_build.py"""
import json, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(f'{R}/tools/i18n/en.json', encoding='utf-8'))
D.update(json.load(open(f'{R}/tools/i18n/en_extra.json', encoding='utf-8')))  # corrections et fragments ajoutés à la main (priorité)
TAG = re.compile(r'(<[^>]+>)')
extra = {}
for fr, en in D.items():  # les textes HTML sont découpés en morceaux de texte (le navigateur les voit séparément)
    if '<' in fr:
        a, b = TAG.split(fr), TAG.split(en)
        if len(a) == len(b) and all((x == y) for x, y in zip(a[1::2], b[1::2])):
            for x, y in zip(a[0::2], b[0::2]):
                if x.strip() and re.search(r'[A-Za-zÀ-ÿ]{2,}', x) and x not in D and x not in extra: extra[x] = y
D = {**extra, **D}
D = {k: v for k, v in D.items() if k != v}
rt = open(f'{R}/tools/i18n/runtime.js', encoding='utf-8').read().replace('__DICT__', json.dumps(D, ensure_ascii=False, separators=(',', ':')))
rt = rt.replace('</script', '<\\/script')
block = '<script id="i18n">\n' + rt + '\n</script>\n'
p = f'{R}/build/index.html'; s = open(p, encoding='utf-8').read()
if '<script id="i18n">' in s:
    s = re.sub(r'<script id="i18n">.*?</script>\n', lambda m: block, s, count=1, flags=re.S)
else:
    s = s.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + block, 1)
open(p, 'w', encoding='utf-8').write(s)
print('traductions :', len(D), 'entrées (dont', len(extra), 'morceaux HTML) ·', round(len(block) / 1024), 'Ko')
