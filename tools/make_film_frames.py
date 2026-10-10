"""Prépare les images de départ 16:9 (1920x1080) des 6 plans du film, à donner à un générateur image→vidéo. Usage : python3 tools/make_film_frames.py itch/film"""
import os, sys, numpy as np
from PIL import Image, ImageFilter
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080
img = lambda n, m='RGB': Image.open(f'{R}/build/img/{n}.webp').convert(m)
def cover(im, fx=0.5, fy=0.5, z=1.0):
    s = max(W / im.width, H / im.height) * z; cw, ch = W / s, H / s
    x0 = min(max(fx * im.width - cw / 2, 0), im.width - cw); y0 = min(max(fy * im.height - ch / 2, 0), im.height - ch)
    return im.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch))
cover(img('bd_ferme'), 0.5, 0.62).save(f'{OUT}/plan1-ferme.jpg', quality=95)
cover(img('big_boucher'), 0.5, 0.38, 1.0).save(f'{OUT}/plan2-boucher.jpg', quality=95)
cover(img('bd_cages'), 0.5, 0.5).save(f'{OUT}/plan3-cages.jpg', quality=95)
cover(img('bd_poule'), 0.55, 0.45).save(f'{OUT}/plan4-poule.jpg', quality=95)
# plan 5 : Captain Cocotte détouré sur un fond de flammes (celui du Boucher, flouté et assombri)
bg = cover(img('sq_land'), 0.5, 0.45, 1.0).filter(ImageFilter.GaussianBlur(10))
c = img('big_cocotte', 'RGBA'); s = 1000 / c.height; c = c.resize((int(c.width * s), 1000), Image.LANCZOS)
bg = bg.convert('RGBA'); bg.alpha_composite(c, (int(W * 0.5 - c.width / 2), H - 1000 + 20)); bg.convert('RGB').save(f'{OUT}/plan5-cocotte.jpg', quality=95)
cover(img('sq_land'), 0.5, 0.55).save(f'{OUT}/plan6-armee.jpg', quality=95)
print('ok')
