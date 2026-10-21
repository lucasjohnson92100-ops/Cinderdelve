#!/usr/bin/env python3
"""Fabrique la version « artefact » (page publiée sur claude.ai) d'une page du site.
L'artefact ajoute lui-même <!doctype>, <html>, <head> et <body> : on ne garde que le titre,
la feuille de police, le style et le contenu.
Usage : python3 build_artifact.py [page.html] [sortie]   (par défaut index.html)"""
import pathlib
import re
import sys

here = pathlib.Path(__file__).parent
src = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
default = 'la-route-du-temps.html' if src == 'index.html' else src
out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else here / '.artifact' / default
html = (here / src).read_text(encoding='utf8')
head = html.split('<head>', 1)[1].split('</head>', 1)[0]
body = html.split('<body>', 1)[1].split('</body>', 1)[0]
head = re.sub(r'\s*<meta charset[^>]*>|\s*<meta name="viewport"[^>]*>', '', head)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(head.strip() + '\n' + body.strip() + '\n', encoding='utf8')
print(out, out.stat().st_size, 'octets')
