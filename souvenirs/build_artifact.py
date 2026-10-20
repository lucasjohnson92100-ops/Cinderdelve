#!/usr/bin/env python3
"""Fabrique la version « artefact » (page publiée sur claude.ai) à partir de index.html.
L'artefact ajoute lui-même <!doctype>, <html>, <head> et <body> : on ne garde que le titre,
la feuille de police, le style et le contenu. Usage : python3 build_artifact.py [sortie]"""
import pathlib
import re
import sys

here = pathlib.Path(__file__).parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else here / '.artifact' / 'la-route-du-temps.html'
html = (here / 'index.html').read_text(encoding='utf8')
head = html.split('<head>', 1)[1].split('</head>', 1)[0]
body = html.split('<body>', 1)[1].split('</body>', 1)[0]
head = re.sub(r'\s*<meta charset[^>]*>|\s*<meta name="viewport"[^>]*>', '', head)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(head.strip() + '\n' + body.strip() + '\n', encoding='utf8')
print(out, out.stat().st_size, 'octets')
