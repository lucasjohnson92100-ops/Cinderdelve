#!/usr/bin/env python3
"""Construit une version « un seul fichier » du jeu pour tester dans un artefact Claude.

L'artefact est limité à 16 Mo : on intègre donc images et musiques directement dans le HTML
(en base64), en les recompressant. La version publiée sur itch.io (dossier build/) garde les
fichiers d'origine, en pleine qualité.

Usage : python3 tools/make_artifact.py [sortie.html]
Nécessite Pillow et ffmpeg (libmp3lame).
"""
import base64, io, os, re, subprocess, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "build")
OUT = sys.argv[1] if len(sys.argv) > 1 else "artifact.html"
IMG_Q, IMG_MAX, AUDIO_KBPS, LIMIT = 40, 512, 32, 15_800_000

def b64(mime, data):
    return "data:%s;base64,%s" % (mime, base64.b64encode(data).decode())

def small_image(path):
    im = Image.open(path)
    if max(im.size) > IMG_MAX:
        k = IMG_MAX / max(im.size)
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=IMG_Q, method=6)
    return buf.getvalue()

def small_video(path):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", "scale=640:-2", "-c:v", "libx264", "-crf", "34", "-preset", "slow",
                           "-pix_fmt", "yuv420p", "-movflags", "frag_keyframe+empty_moov", "-f", "mp4", "-"], check=True, stdout=subprocess.PIPE).stdout

def small_jpeg(path):
    im = Image.open(path).convert("RGB"); im = im.resize((640, round(640 * im.height / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=70); return buf.getvalue()

def small_audio(path):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-b:a", "%dk" % AUDIO_KBPS, "-f", "mp3", "-"],
                          check=True, stdout=subprocess.PIPE).stdout

html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
cache = {}
def sub(m):
    rel = m.group(0)
    if rel not in cache:
        path = os.path.join(ROOT, rel)
        if rel.endswith(".mp3"):
            cache[rel] = b64("audio/mpeg", small_audio(path))
        elif rel.endswith(".mp4"):
            cache[rel] = b64("video/mp4", small_video(path))
        elif rel.endswith(".jpg"):
            cache[rel] = b64("image/jpeg", small_jpeg(path))
        else:
            cache[rel] = b64("image/webp", small_image(path))
    return cache[rel]

out = re.sub(r"(?:img|music|video)/[A-Za-z0-9_.-]+\.(?:webp|mp3|mp4|jpg)", sub, html)
data = out.encode("utf-8")
open(OUT, "wb").write(data)
print("%s : %.2f Mo (%d fichiers intégrés)%s" % (OUT, len(data) / 1e6, len(cache), "" if len(data) < LIMIT else "  ⚠ dépasse 16 Mo"))
