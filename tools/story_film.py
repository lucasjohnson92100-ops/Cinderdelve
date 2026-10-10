"""Film d'animation (motion comic) de 30 s qui raconte l'histoire de Cinderdelve.
Usage : python3 tools/story_film.py <dossier-de-sortie>   -> <dossier>/cinderdelve-histoire.mp4
Utilise les illustrations de build/img et la musique de build/music (ffmpeg requis)."""
import math, os, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; os.makedirs(OUT + '/f', exist_ok=True)
W, H, FPS, DUR = 1280, 720, 30, 30.0
IMG = lambda n: Image.open(f'{ROOT}/build/img/{n}.webp').convert('RGBA')
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
FI = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
font = lambda f, s: ImageFont.truetype(f, s)
rnd = random.Random(7)

A = {n: IMG(n) for n in ['bd_ferme', 'big_boucher', 'bd_cages', 'bd_poule', 'big_cocotte', 'sq_land', 'l_grandboucher',
                         'h_cochon', 'h_meuh', 'h_canard', 'h_taureau', 'h_lapin', 'h_oie', 'l_hachoir']}

def ease(k): k = max(0.0, min(1.0, k)); return k * k * (3 - 2 * k)
def eout(k): k = max(0.0, min(1.0, k)); return 1 - (1 - k) ** 3

def cover(im, z=1.0, fx=0.5, fy=0.5, dx=0, dy=0):
    iw, ih = im.size; s = max(W / iw, H / ih) * z; cw, ch = W / s, H / s
    x0 = min(max(fx * iw - cw / 2, 0), iw - cw); y0 = min(max(fy * ih - ch / 2, 0), ih - ch)
    x0 += dx / s; y0 += dy / s
    return im.transform((W, H), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BILINEAR).convert('RGB')

VIG = Image.new('L', (W, H), 0)
_v = np.zeros((H, W), np.float32); yy, xx = np.mgrid[0:H, 0:W]
_v = np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.66)) ** 2, 0, 1) ** 1.6
VIG = Image.fromarray((_v * 230).astype(np.uint8))
def vignette(fr, amt=1.0):
    blk = Image.new('RGB', (W, H), (8, 2, 4)); m = VIG if amt == 1 else VIG.point(lambda v: int(v * amt))
    return Image.composite(blk, fr, m)

def tint(fr, col, a): return Image.blend(fr, Image.new('RGB', (W, H), col), a)

EMB = [(rnd.random() * W, rnd.random() * H, 0.4 + rnd.random(), rnd.random() * 6.28, 1 + rnd.random() * 2.5) for _ in range(90)]
def embers(fr, t, n=90, col=(255, 150, 50), speed=60):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, sp, ph, r in EMB[:n]:
        yy2 = (y - t * speed * sp) % (H + 40) - 20; xx2 = x + math.sin(t * 1.3 + ph) * 18
        a = int(140 + 110 * math.sin(t * 5 + ph * 3))
        d.ellipse((xx2 - r, yy2 - r, xx2 + r, yy2 + r), fill=col + (max(0, a),))
    glow = lay.filter(ImageFilter.GaussianBlur(3))
    fr = fr.convert('RGBA'); fr.alpha_composite(glow); fr.alpha_composite(lay); return fr.convert('RGB')

def caption(fr, txt, k, y=None, size=36, fnt=FI, cx=None):
    """encadré de BD avec effet machine à écrire (k : 0..1 de progression du texte)"""
    if k <= 0: return fr
    F = font(fnt, size); n = max(1, int(len(txt) * min(1, k * 1.6))); shown = txt[:n]
    d0 = ImageDraw.Draw(fr); tw = d0.textlength(txt, font=F); bw, bh = tw + 56, size + 34
    x0 = (W - bw) / 2 if cx is None else cx - bw / 2; y0 = H - bh - 34 if y is None else y
    a = min(1, k * 5)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rectangle((x0 + 7, y0 + 8, x0 + bw + 7, y0 + bh + 8), fill=(0, 0, 0, int(160 * a)))
    d.rectangle((x0, y0, x0 + bw, y0 + bh), fill=(250, 232, 190, int(245 * a)), outline=(20, 10, 10, int(255 * a)), width=4)
    d.text((x0 + 28, y0 + 14), shown, font=F, fill=(40, 14, 10, int(255 * a)))
    fr = fr.convert('RGBA'); fr.alpha_composite(lay); return fr.convert('RGB')

def big_text(fr, txt, k, size=96, y=None, col=(255, 210, 90), stroke=(30, 6, 4), rot=-3, x=None, glow=False):
    if k <= 0: return fr
    F = font(FB, size); d0 = ImageDraw.Draw(fr); tw = d0.textlength(txt, font=F)
    sc = 1 + 0.6 * (1 - eout(k * 2.5)); pad = 30
    lay = Image.new('RGBA', (int(tw + pad * 2), size + pad * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.text((pad, pad - size * 0.1), txt, font=F, fill=col + (255,), stroke_width=7, stroke_fill=stroke + (255,))
    lay = lay.resize((max(1, int(lay.width * sc)), max(1, int(lay.height * sc))), Image.BILINEAR).rotate(rot, expand=True, resample=Image.BICUBIC)
    a = min(1, k * 4); lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
    y = (H - lay.height) / 2 if y is None else y - lay.height / 2
    px = (W - lay.width) / 2 if x is None else x - lay.width / 2
    fr = fr.convert('RGBA')
    if glow:
        g = Image.new('RGBA', lay.size, (255, 120, 30, 0)); g.putalpha(lay.getchannel('A')); g = g.filter(ImageFilter.GaussianBlur(18)); fr.alpha_composite(g, (int(px), int(y)))
    fr.alpha_composite(lay, (int(px), int(y))); return fr.convert('RGB')

def paste_cut(fr, im, h, cx, by, a=1.0, glow=None):
    s = h / im.height; c = im.resize((max(1, int(im.width * s)), int(h)), Image.LANCZOS)
    fr = fr.convert('RGBA')
    if glow:
        g = Image.new('RGBA', c.size, glow + (0,)); g.putalpha(c.getchannel('A').point(lambda v: int(v * 0.85 * a)))
        g = g.filter(ImageFilter.GaussianBlur(14)); fr.alpha_composite(g, (int(cx - c.width / 2), int(by - c.height)))
    if a < 1: c.putalpha(c.getchannel('A').point(lambda v: int(v * a)))
    fr.alpha_composite(c, (int(cx - c.width / 2), int(by - c.height))); return fr.convert('RGB')

RAYS = Image.new('RGB', (1800, 1800), (90, 8, 10)); _d = ImageDraw.Draw(RAYS)
for i in range(24):
    a0, a1 = i * 15, i * 15 + 7.5; _d.pieslice((0, 0, 1800, 1800), a0, a1, fill=(150, 24, 16))
RAYS = RAYS.filter(ImageFilter.GaussianBlur(2))
def rays_bg(t, col=None):
    r = RAYS.rotate(t * 12, resample=Image.BILINEAR); r = r.crop(((1800 - W) // 2, (1800 - H) // 2, (1800 + W) // 2, (1800 + H) // 2))
    return vignette(r, 1.0)

def shake(fr, amp, t):
    if amp <= 0: return fr
    ox, oy = int(math.sin(t * 91) * amp), int(math.cos(t * 77) * amp)
    return fr.transform((W, H), Image.AFFINE, (1, 0, -ox, 0, 1, -oy), Image.BILINEAR)

def flash(fr, col, a): return tint(fr, col, max(0, min(1, a))) if a > 0 else fr

HEROES = [('h_cochon', 'GÉNÉRAL BOUDIN'), ('h_meuh', 'COLONEL ENTRECÔTE'), ('h_canard', 'AMIRAL PÉKIN'), ('h_taureau', 'EL TORO'), ('h_lapin', 'CAPORAL GIBELOTTE')]

def frame(t):
    if t < 4.2:  # 1. la ferme paisible
        k = t / 4.2; fr = cover(A['bd_ferme'], 1.08 + 0.12 * k, 0.5, 0.62)
        fr = ImageEnhance.Brightness(fr).enhance(min(1, t / 0.8)); fr = vignette(fr, 0.7)
        fr = caption(fr, 'Il était une fois une ferme paisible…', (t - 0.5) / 2.2)
        if t > 3.9: fr = flash(fr, (255, 40, 20), (t - 3.9) / 0.3)
        return fr
    if t < 8.6:  # 2. le Grand Boucher
        lt = t - 4.2; k = lt / 4.4
        fr = cover(A['big_boucher'], 1.0 + 0.45 * ease(k), 0.5, 0.28 - 0.08 * ease(k))
        fr = embers(fr, t, 90, (255, 140, 40), 90); fr = vignette(fr, 1.0)
        fr = flash(fr, (255, 60, 30), 1 - lt / 0.35)
        fr = caption(fr, 'Puis le Grand Boucher est arrivé.', (lt - 0.6) / 1.8)
        fr = shake(fr, 7 * max(0, 1 - lt / 0.6), t)
        if t > 8.3: fr = flash(fr, (0, 0, 0), (t - 8.3) / 0.3)
        return fr
    if t < 12.6:  # 3. les cages
        lt = t - 8.6; k = lt / 4.0
        fr = cover(A['bd_cages'], 1.25 - 0.1 * k, 0.5, 0.25 + 0.5 * ease(k))
        fl = 0.85 + 0.15 * math.sin(t * 23) * math.sin(t * 7)  # ampoule qui grésille
        fr = ImageEnhance.Brightness(fr).enhance(fl * min(1, lt / 0.4)); fr = vignette(fr, 1.0)
        fr = caption(fr, 'Il a mis les animaux en cage… pour les cuisiner.', (lt - 0.4) / 2.0)
        if t > 12.3: fr = flash(fr, (0, 0, 0), (t - 12.3) / 0.3)
        return fr
    if t < 16.4:  # 4. la poule brise ses barreaux
        lt = t - 12.6; snap = 14.9
        z = 1.05 + 0.25 * ease(lt / 2.3) if t < snap else 1.3 - 0.2 * eout((t - snap) / 0.5)
        fr = cover(A['bd_poule'], z, 0.55, 0.42)
        fr = ImageEnhance.Brightness(fr).enhance(min(1, lt / 0.4)); fr = vignette(fr, 0.9)
        fr = caption(fr, 'Mais une poule a brisé ses barreaux…', (lt - 0.3) / 1.8)
        if t >= snap:
            fr = embers(fr, t * 3, 60, (255, 230, 160), 260); fr = flash(fr, (255, 255, 240), 1 - (t - snap) / 0.35)
            fr = shake(fr, 14 * max(0, 1 - (t - snap) / 0.7), t)
        if t > 16.1: fr = flash(fr, (255, 120, 40), (t - 16.1) / 0.3)
        return fr
    if t < 20.0:  # 5. Captain Cocotte
        lt = t - 16.4; fr = rays_bg(t); fr = embers(fr, t, 90, (255, 170, 60), 120)
        rise = eout(lt / 0.7); fr = paste_cut(fr, A['big_cocotte'], 700, W * 0.32, H + 30 + 400 * (1 - rise), glow=(255, 150, 40))
        fr = big_text(fr, 'CAPTAIN', (lt - 0.5) / 1.0, 76, H * 0.34, rot=-4, x=W * 0.72)
        fr = big_text(fr, 'COCOTTE !', (lt - 0.75) / 1.0, 104, H * 0.5, rot=-4, x=W * 0.72)
        fr = fr if lt < 0.75 else fr
        fr = caption(fr, 'Elle a pris les armes.', (lt - 1.3) / 1.2, y=H * 0.68, cx=W * 0.72)
        fr = flash(fr, (255, 255, 255), 1 - lt / 0.25); fr = shake(fr, 9 * max(0, 1 - lt / 0.5), t)
        return fr
    if t < 24.4:  # 6. libère la basse-cour (enchaînement de héros)
        lt = t - 20.0; i = min(len(HEROES) - 1, int(lt / 0.8)); st = lt - i * 0.8
        fr = rays_bg(t * 1.5); fr = tint(fr, (20, 40, 90), 0.25 if i % 2 else 0.0)
        side = -1 if i % 2 else 1
        fr = paste_cut(fr, A[HEROES[i][0]], 620, W / 2 + side * 260 - side * 120 * eout(st / 0.3), H + 10, glow=(255, 210, 120))
        fr = big_text(fr, HEROES[i][1], st / 0.4, 54, H * 0.18, rot=-2 * side)
        fr = big_text(fr, 'LIBÈRE LA BASSE-COUR', 1, 44, H * 0.9, col=(255, 240, 210), rot=0)
        fr = flash(fr, (255, 255, 255), 0.7 - st / 0.12)
        return fr
    if t < 27.2:  # 7. l'armée en marche
        lt = t - 24.4; fr = cover(A['sq_land'], 1.35 - 0.25 * eout(lt / 2.5), 0.5, 0.55)
        fr = embers(fr, t, 70, (255, 120, 40), 80); fr = vignette(fr, 0.9)
        fr = big_text(fr, 'PLUS JAMAIS AU MENU !', (lt - 0.3) / 0.9, 78, H * 0.82, rot=-3)
        fr = flash(fr, (255, 255, 255), 0.8 - lt / 0.2); fr = shake(fr, 6 * max(0, 1 - lt / 0.5), t)
        if t > 26.9: fr = flash(fr, (0, 0, 0), (t - 26.9) / 0.3)
        return fr
    # 8. logo
    lt = t - 27.2; fr = Image.new('RGB', (W, H), (10, 3, 5)); fr = embers(fr, t, 60, (255, 130, 40), 50)
    fr = big_text(fr, 'CINDERDELVE', lt / 0.8, 120, H * 0.42, col=(255, 160, 60), rot=0, glow=True)
    if lt > 0.6:
        F = font(FB, 30); d = ImageDraw.Draw(fr); a = min(1, (lt - 0.6) / 0.5)
        for txt, y, f, c in (('PLUMES ET SANG', H * 0.56, F, (230, 190, 120)), ('Gratuit · dans ton navigateur · johnsgone.itch.io/cinderdelve', H * 0.85, font(FB, 24), (240, 225, 200))):
            tw = d.textlength(txt, font=f); d.text(((W - tw) / 2, y), txt, font=f, fill=tuple(int(v * a) for v in c))
    return fr

N = int(DUR * FPS)
for i in range(N):
    frame(i / FPS).save(f'{OUT}/f/{i:04d}.jpg', quality=92)

# --- son : musique du menu puis musique du boss, impacts synthétisés sur les moments forts ---
SR = 44100
def boom(dur=0.9, f0=90, f1=35, noise=0.5):
    n = int(SR * dur); tt = np.arange(n) / SR; f = f0 * (f1 / f0) ** (tt / dur)
    env = np.exp(-tt * 5); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env
    s += noise * np.random.default_rng(1).standard_normal(n) * np.exp(-tt * 18)
    return s
def clang(dur=0.7):
    n = int(SR * dur); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * fq * tt) for fq in (523, 1311, 2240, 3170)) * np.exp(-tt * 7) * 0.35
fx = np.zeros(int(SR * DUR))
def put(s, at, g=1.0): i = int(at * SR); j = min(len(fx), i + len(s)); fx[i:j] += s[:j - i] * g
put(boom(1.2), 4.2, 0.9); put(clang(), 14.9, 0.8); put(boom(0.8, 140, 50), 14.9, 0.7); put(boom(1.0), 16.4, 0.9)
for k in range(len(HEROES)): put(boom(0.35, 160, 80, 0.3), 20.0 + k * 0.8, 0.45)
put(boom(1.2), 24.4, 0.9); put(boom(1.6, 70, 30), 27.2, 0.8)
fx = np.clip(fx / max(1e-6, np.abs(fx).max()) * 0.8, -1, 1)
with wave.open(f'{OUT}/fx.wav', 'w') as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((fx * 32767).astype(np.int16).tobytes())
M = f'{ROOT}/build/music'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', f'{OUT}/f/%04d.jpg',
                '-i', f'{M}/menu.mp3', '-i', f'{M}/boss.mp3', '-i', f'{OUT}/fx.wav', '-filter_complex',
                '[1:a]atrim=0:4.4,afade=t=in:d=0.6,afade=t=out:st=3.8:d=0.6,volume=0.8[a1];'
                '[2:a]atrim=0:26,adelay=4200|4200,afade=t=in:st=4.2:d=0.3,afade=t=out:st=28:d=2,volume=0.8[a2];'
                '[3:a]volume=1.1[a3];[a1][a2][a3]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]',
                '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '160k', '-t', str(DUR), '-movflags', '+faststart', f'{OUT}/cinderdelve-histoire.mp4'], check=True)
print('ok', f'{OUT}/cinderdelve-histoire.mp4')
