#!/usr/bin/env python3
"""Remplit le service worker (build/sw.js) avant publication de la version installable (PWA).
Usage : python3 tools/stamp_sw.py [dossier=build] [version=<sha git ou date>]
 - __BUILD__  : version du jeu (change à chaque publication => le joueur reçoit « Nouvelle version disponible »)
 - __ASSETS__ : empreinte des images/musiques (inchangée => elles ne sont pas retéléchargées)
 - __FILES__  : liste des images/musiques à garder pour le mode hors ligne"""
import hashlib, json, os, subprocess, sys, time
d = sys.argv[1] if len(sys.argv) > 1 else 'build'
ver = sys.argv[2] if len(sys.argv) > 2 else (os.environ.get('GITHUB_SHA') or os.environ.get('COMMIT_REF') or os.environ.get('CF_PAGES_COMMIT_SHA') or os.environ.get('WORKERS_CI_COMMIT_SHA') or '')
if not ver:
    try: ver = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    except Exception: ver = time.strftime('%Y%m%d%H%M%S')
files = sorted(os.path.relpath(os.path.join(r, f), d).replace(os.sep, '/') for sub in ('img', 'music', 'video') for r, _, fs in os.walk(os.path.join(d, sub)) for f in fs)
h = hashlib.sha1()
for f in files:
    h.update(f.encode()); h.update(open(os.path.join(d, f), 'rb').read())
p = os.path.join(d, 'sw.js'); s = open(p, encoding='utf-8').read()
if '__BUILD__' not in s: sys.exit('sw.js est déjà rempli (ou modèle absent)')
s = s.replace('__BUILD__', ver[:10]).replace('__ASSETS__', h.hexdigest()[:12]).replace('__FILES__', json.dumps(files))
open(p, 'w', encoding='utf-8').write(s)
print('sw.js : version', ver[:10], '·', len(files), 'fichiers hors ligne')
