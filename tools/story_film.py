"""Film d'animation de 30 s qui raconte l'histoire de Cinderdelve (animation procédurale à partir des illustrations du jeu :
déformations de chaleur, feu, parallaxe, personnages détourés animés avec ressort, étincelles, éclats de barreaux, etc.).
Usage : python3 tools/story_film.py <dossier-de-sortie>   -> <dossier>/cinderdelve-histoire.mp4   (ffmpeg, numpy, opencv, Pillow)"""
import math, os, subprocess, sys, wave
from multiprocessing import Pool
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; os.makedirs(OUT + '/f', exist_ok=True)
W, H, FPS, DUR = 1280, 720, 30, 30.0
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
font = lambda s: ImageFont.truetype(FB, s)
def load(n, rgba=False):
    im = Image.open(f'{ROOT}/build/img/{n}.webp').convert('RGBA' if rgba else 'RGB'); return np.array(im)
BG = {n: load(n) for n in ['bd_ferme', 'big_boucher', 'bd_cages', 'bd_poule', 'sq_land']}
CUT = {n: load(n, True) for n in ['big_cocotte', 'h_cocotte', 'h_cochon', 'h_meuh', 'h_canard', 'h_taureau', 'h_lapin']}
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
clamp = lambda k: max(0.0, min(1.0, k))
ease = lambda k: clamp(k) ** 2 * (3 - 2 * clamp(k))
eout = lambda k: 1 - (1 - clamp(k)) ** 3
spring = lambda k: 0.0 if k <= 0 else 1 - math.exp(-6.5 * k) * math.cos(15 * k)

# ---------- outils d'image ----------
def cam(img, z=1.0, fx=0.5, fy=0.5, dx=0.0, dy=0.0, rot=0.0):
    ih, iw = img.shape[:2]; s = max(W / iw, H / ih) * z
    M = cv2.getRotationMatrix2D((W / 2, H / 2), rot, 1.0); A = np.array([[s, 0, W / 2 - s * fx * iw + dx], [0, s, H / 2 - s * fy * ih + dy], [0, 0, 1]])
    M3 = np.vstack([M, [0, 0, 1]]) @ A
    return cv2.warpAffine(img, M3[:2], (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def remap(img, dx, dy):
    return cv2.remap(img, XX + dx, YY + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def heat(img, t, amp=5.0, mask=None, f=0.05, sp=8.0):
    dx = amp * np.sin(YY * f + t * sp) * np.sin(XX * 0.011 + t * 1.7); dy = 0.5 * amp * np.sin(XX * 0.035 + t * sp * 0.7)
    if mask is not None: dx *= mask; dy *= mask
    return remap(img, dx, dy)

_vy = np.clip(((XX - W / 2) / (W * 0.62)) ** 2 + ((YY - H / 2) / (H * 0.66)) ** 2, 0, 1) ** 1.6
def vignette(img, amt=1.0):
    k = (1 - _vy * 0.9 * amt)[..., None]; return (img * k + np.array([8, 2, 4]) * (1 - k)).astype(np.uint8)

def add(img, layer, g=1.0): return np.clip(img.astype(np.int16) + (layer.astype(np.float32) * g).astype(np.int16), 0, 255).astype(np.uint8)
def bright(img, k): return np.clip(img.astype(np.float32) * k, 0, 255).astype(np.uint8)
def tint(img, col, a): return (img.astype(np.float32) * (1 - a) + np.array(col, np.float32) * a).astype(np.uint8)
def shake(img, amp, t):
    if amp <= 0.2: return img
    M = np.float32([[1, 0, math.sin(t * 91) * amp], [0, 1, math.cos(t * 77) * amp]]); return cv2.warpAffine(img, M, (W, H), borderMode=cv2.BORDER_REFLECT)

# ---------- feu procédural ----------
rng = np.random.default_rng(3)
def _noise(h, w):
    n = np.zeros((h, w), np.float32)
    for o in range(5):
        s = 2 ** (o + 2); a = rng.random((h // s + 2, w // s + 2)).astype(np.float32); n += cv2.resize(a, (w, h), interpolation=cv2.INTER_CUBIC) / 2 ** o
    return (n - n.min()) / (n.max() - n.min())
NZ = _noise(1024, W)
LUT = np.zeros((256, 3), np.float32)
for i in range(256):
    v = i / 255; LUT[i] = [min(255, v * 2.6 * 255), min(255, max(0, (v - 0.25) * 2.0) * 255), min(255, max(0, (v - 0.65) * 2.8) * 255)]
def fire(img, t, h=300, power=1.0, speed=260, side=False):
    off = int(t * speed) % 512; tile = NZ[off:off + h + 1, :][:h]; 
    if tile.shape[0] < h: tile = np.vstack([tile, NZ[:h - tile.shape[0]]])
    g = (np.linspace(1, 0, h)[:, None]) ** 1.3
    wob = np.sin(np.arange(W)[None, :] * 0.03 + t * 3) * 0.12
    v = np.clip((tile * 1.25 - 0.18 + wob) * g * 1.7 * power, 0, 1)
    layer = np.zeros((H, W, 3), np.uint8); col = LUT[(v * 255).astype(np.uint8)]; layer[H - h:] = col[::-1]
    layer = cv2.GaussianBlur(layer, (0, 0), 2.2)
    return add(img, layer, 1.0)

def embers(img, t, n=80, col=(255, 150, 50), speed=90, size=1.0, seed=1):
    r = np.random.default_rng(seed); lay = np.zeros((H, W, 3), np.uint8)
    for i in range(n):
        x, y, sp, ph, rr = r.random() * W, r.random() * H, 0.5 + r.random(), r.random() * 6.28, (1 + r.random() * 2.5) * size
        yy = (y - t * speed * sp) % (H + 40) - 20; xx = x + math.sin(t * 1.3 + ph) * 22
        a = 0.45 + 0.55 * math.sin(t * 5 + ph * 3) ** 2
        cv2.circle(lay, (int(xx), int(yy)), max(1, int(rr)), tuple(int(c * a) for c in col[::-1][::-1]), -1, cv2.LINE_AA)
    return add(img, add(cv2.GaussianBlur(lay, (0, 0), 4), lay), 1.0)

def glow(img, cx, cy, r, col, a):
    k = np.exp(-(((XX - cx) ** 2 + (YY - cy) ** 2) / (2 * r * r)))[..., None]; return add(img, (k * np.array(col, np.float32) * a))

# ---------- personnages détourés ----------
def place(img, cut, cx, by, h, rot=0.0, sx=1.0, sy=1.0, a=1.0, gl=None, gl_a=0.8):
    ih, iw = cut.shape[:2]; s = h / ih
    A = np.array([[s * sx, 0, -iw / 2 * s * sx], [0, s * sy, -ih * s * sy], [0, 0, 1]])
    R = np.vstack([cv2.getRotationMatrix2D((0, 0), -rot, 1.0), [0, 0, 1]]); T = np.array([[1, 0, cx], [0, 1, by], [0, 0, 1]])
    M = (T @ R @ A)[:2]
    c = cut.astype(np.float32); c[..., :3] *= c[..., 3:4] / 255.0
    w = cv2.warpAffine(c, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    al = (w[..., 3:4] / 255.0) * a; out = img.astype(np.float32)
    if gl is not None:
        g = cv2.GaussianBlur(w[..., 3], (0, 0), 16)[..., None] / 255.0; out = out + g * np.array(gl, np.float32) * gl_a * a
    out = out * (1 - al) + w[..., :3] * a
    return np.clip(out, 0, 255).astype(np.uint8)

RAYS = np.zeros((1800, 1800, 3), np.uint8)
for i in range(24):
    cv2.ellipse(RAYS, (900, 900), (900, 900), 0, i * 15, i * 15 + 7.5, (24, 16, 150), -1)
RAYS = cv2.GaussianBlur(RAYS + np.array([10, 8, 90], np.uint8), (0, 0), 2)
def rays_bg(t, sp=14, hue=None):
    M = cv2.getRotationMatrix2D((900, 900), t * sp, 1.0); r = cv2.warpAffine(RAYS, M, (1800, 1800))
    r = r[(1800 - H) // 2:(1800 + H) // 2, (1800 - W) // 2:(1800 + W) // 2][..., ::-1].copy()
    if hue: r = tint(r, hue, 0.3)
    return vignette(r)

def speed_lines(img, t, k, col=(255, 255, 255)):
    if k <= 0: return img
    lay = np.zeros((H, W, 3), np.uint8); r = np.random.default_rng(int(t * 30))
    for i in range(40):
        a = r.random() * 6.283; r0 = 250 + r.random() * 200; r1 = r0 + 300 + r.random() * 300
        cv2.line(lay, (int(W / 2 + math.cos(a) * r0), int(H / 2 + math.sin(a) * r0)), (int(W / 2 + math.cos(a) * r1), int(H / 2 + math.sin(a) * r1)), tuple(int(c * 0.8 * k) for c in col), 2, cv2.LINE_AA)
    return add(img, lay)

def ring(img, cx, cy, k, col=(255, 255, 255), maxr=700, th=10):
    if not 0 < k < 1: return img
    lay = np.zeros((H, W, 3), np.uint8); cv2.circle(lay, (int(cx), int(cy)), int(maxr * eout(k)), tuple(int(c * (1 - k)) for c in col), int(th * (1 - k)) + 1, cv2.LINE_AA)
    return add(img, cv2.GaussianBlur(lay, (0, 0), 3))

def flash(img, col, a): return tint(img, col, clamp(a)) if a > 0 else img

# ---------- texte ----------
def P(img): return Image.fromarray(img)
def caption(fr, txt, k, y=None, cx=None, size=36):
    if k <= 0: return fr
    F = font(size); n = max(1, int(len(txt) * min(1, k * 1.6))); d0 = ImageDraw.Draw(fr); tw = d0.textlength(txt, font=F); bw, bh = tw + 56, size + 34
    x0 = (W - bw) / 2 if cx is None else cx - bw / 2; y0 = H - bh - 34 if y is None else y; a = min(1, k * 5)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rectangle((x0 + 7, y0 + 8, x0 + bw + 7, y0 + bh + 8), fill=(0, 0, 0, int(160 * a)))
    d.rectangle((x0, y0, x0 + bw, y0 + bh), fill=(250, 232, 190, int(245 * a)), outline=(20, 10, 10, int(255 * a)), width=4)
    d.text((x0 + 28, y0 + 14), txt[:n], font=F, fill=(40, 14, 10, int(255 * a)))
    fr = fr.convert('RGBA'); fr.alpha_composite(lay); return fr.convert('RGB')

def big_text(fr, txt, k, size=96, y=None, x=None, col=(255, 210, 90), stroke=(30, 6, 4), rot=-3, glow_=False):
    if k <= 0: return fr
    F = font(size); tw = ImageDraw.Draw(fr).textlength(txt, font=F); pad = 30; sc = 1 + 0.7 * (1 - eout(k * 2.5))
    lay = Image.new('RGBA', (int(tw + pad * 2), size + pad * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.text((pad, pad - size * 0.1), txt, font=F, fill=col + (255,), stroke_width=7, stroke_fill=stroke + (255,))
    lay = lay.resize((max(1, int(lay.width * sc)), max(1, int(lay.height * sc))), Image.BILINEAR).rotate(rot, expand=True, resample=Image.BICUBIC)
    a = min(1, k * 4); lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
    yy = (H - lay.height) / 2 if y is None else y - lay.height / 2; px = (W - lay.width) / 2 if x is None else x - lay.width / 2
    fr = fr.convert('RGBA')
    if glow_:
        g = Image.new('RGBA', lay.size, (255, 120, 30, 0)); g.putalpha(lay.getchannel('A')); fr.alpha_composite(g.filter(ImageFilter.GaussianBlur(18)), (int(px), int(yy)))
    fr.alpha_composite(lay, (int(px), int(yy))); return fr.convert('RGB')

# ---------- scènes ----------
def find_red(img, box):
    x0, y0, x1, y1 = [int(v) for v in box]; s = img[y0:y1, x0:x1].astype(np.int16); m = (s[..., 0] > 200) & (s[..., 1] < 70) & (s[..., 2] < 70)
    ys, xs = np.nonzero(m); return (x0 + xs.mean(), y0 + ys.mean()) if len(xs) > 20 else (img.shape[1] * 0.5, img.shape[0] * 0.4)
bh_, bw_ = BG['big_boucher'].shape[:2]
EYES = [find_red(BG['big_boucher'], (bw_ * 0.30, bh_ * 0.28, bw_ * 0.50, bh_ * 0.52)), find_red(BG['big_boucher'], (bw_ * 0.50, bh_ * 0.28, bw_ * 0.70, bh_ * 0.52))]

def s1(t):  # ferme paisible : vent, nuages, rayons, oiseaux, pollen
    k = t / 4.2; z = 1.1 + 0.12 * k
    img = cam(BG['bd_ferme'], z, 0.5, 0.6, dx=-30 * k)
    wind = np.clip((YY / H - 0.45) * 2.2, 0, 1) ** 1.5; img = remap(img, 4 * np.sin(XX * 0.03 + t * 2.4) * wind, 1.5 * np.sin(XX * 0.05 + t * 3) * wind)
    lay = np.zeros((H, W, 3), np.uint8)
    for i in range(7):  # nuages qui dérivent
        cx = (i * 260 + t * 22 * (1 + i % 3 * 0.3)) % (W + 400) - 200; cy = 60 + (i * 83) % 190
        cv2.ellipse(lay, (int(cx), cy), (170, 34), 0, 0, 360, (60, 55, 50), -1)
    img = add(img, cv2.GaussianBlur(lay, (0, 0), 28), 0.8)
    sx, sy = W * 0.34, H * 0.18; ray = np.zeros((H, W, 3), np.float32)
    ang = np.arctan2(YY - sy, XX - sx); dist = np.hypot(XX - sx, YY - sy)
    ray = (np.clip(np.sin(ang * 14 + t * 0.6) * 0.5 + 0.5, 0, 1) ** 3 * np.exp(-dist / 700) * (0.8 + 0.2 * math.sin(t * 2)))[..., None] * np.array([90, 70, 30], np.float32)
    img = add(img, ray); img = glow(img, sx, sy, 160, (150, 110, 40), 0.5)
    lay = np.zeros((H, W, 3), np.uint8)
    for b in range(3):  # oiseaux
        bx = (t * (120 + b * 30) + b * 400) % (W + 200) - 100; by = 120 + b * 45 + math.sin(t * 3 + b) * 12; wing = math.sin(t * 14 + b) * 9
        cv2.polylines(lay, [np.array([[bx - 12, by + wing], [bx, by], [bx + 12, by + wing]], np.int32)], False, (255, 255, 255), 2, cv2.LINE_AA)
    img = add(img, lay, 0.5)
    img = embers(img, t, 50, (255, 240, 170), -30, 0.8, seed=5)
    img = bright(img, min(1, t / 0.8)); img = vignette(img, 0.6)
    fr = caption(P(img), 'Il était une fois une ferme paisible…', (t - 0.5) / 2.2)
    a = np.array(fr)
    if t > 3.9: a = flash(a, (255, 40, 20), (t - 3.9) / 0.3)
    return a

def s2(t):  # le Boucher : souffle, chaleur, feu, yeux rouges
    lt = t - 4.2; k = lt / 4.4
    z = 1.0 + 0.45 * ease(k) + 0.012 * math.sin(lt * 2.4)
    img = cam(BG['big_boucher'], z, 0.5, 0.3 - 0.08 * ease(k))
    m = np.clip(np.abs(XX - W / 2) / (W * 0.35), 0.15, 1.0) * np.clip((YY / H), 0.25, 1.0)
    img = heat(img, t, 7, m)
    img = fire(img, t, 200, 0.8)
    for ex, ey in EYES:  # yeux qui pulsent
        sx_ = W / 2 + (ex - bw_ / 2) * max(W / bw_, H / bh_) * z; sy_ = H / 2 + (ey - bh_ * (0.3 - 0.08 * ease(k))) * max(W / bw_, H / bh_) * z
        img = glow(img, sx_, sy_, 36 + 10 * math.sin(lt * 7), (255, 40, 20), 0.8 + 0.4 * math.sin(lt * 9))
    img = embers(img, t, 90, (255, 140, 40), 130, 1.2, seed=2); img = bright(img, 0.92 + 0.08 * math.sin(t * 17) * math.sin(t * 5))
    img = vignette(img, 1.0); img = flash(img, (255, 60, 30), 1 - lt / 0.35)
    img = shake(img, 8 * max(0, 1 - lt / 0.6) + 1.2, t)
    a = np.array(caption(P(img), 'Puis le Grand Boucher est arrivé.', (lt - 0.6) / 1.8))
    return flash(a, (0, 0, 0), (t - 8.3) / 0.3) if t > 8.3 else a

def s3(t):  # les cages : ampoule qui se balance, cages qui s'agitent
    lt = t - 8.6; k = lt / 4.0
    base = cam(BG['bd_cages'], 1.22 - 0.08 * k, 0.5, 0.25 + 0.5 * ease(k))
    out = base.copy(); r = np.random.default_rng(int(lt * 12))
    for qx, qy, ph in [(0.02, 0.1, 0.0), (0.52, 0.1, 1.7), (0.02, 0.52, 3.1), (0.52, 0.52, 4.6)]:  # chaque cage tremble par à-coups
        burst = max(0, math.sin(lt * 3.1 + ph)) ** 6; ox = (r.random() - 0.5) * 14 * burst; oy = (r.random() - 0.5) * 9 * burst
        sc = 1 + 0.012 * math.sin(lt * 4 + ph)
        x0, y0, x1, y1 = int(qx * W), int(qy * H * 1.05), int((qx + 0.46) * W), int((qy + 0.43) * H * 1.05)
        M = np.float32([[sc, 0, ox + (1 - sc) * (x0 + x1) / 2], [0, sc, oy + (1 - sc) * (y0 + y1) / 2]]); sh = cv2.warpAffine(base, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        mk = np.zeros((H, W), np.float32); mk[y0:y1, x0:x1] = 1; mk = cv2.GaussianBlur(mk, (0, 0), 14)[..., None]
        out = (out * (1 - mk) + sh * mk).astype(np.uint8)
    bx = W / 2 + math.sin(lt * 2.3) * 90; img = bright(out, 0.45)
    flick = 0.8 + 0.2 * math.sin(lt * 23) * math.sin(lt * 7.3)
    lamp = np.exp(-(((XX - bx) ** 2) / (2 * 330 ** 2) + ((YY - 40) ** 2) / (2 * 520 ** 2)))[..., None]
    img = np.clip(out.astype(np.float32) * (0.30 + 1.0 * lamp * flick), 0, 255).astype(np.uint8)
    img = glow(img, bx, 30, 70, (255, 220, 140), 0.8 * flick); img = vignette(img, 1.0); img = bright(img, min(1, lt / 0.4))
    a = np.array(caption(P(img), 'Il a mis les animaux en cage… pour les cuisiner.', (lt - 0.4) / 2.0))
    return flash(a, (0, 0, 0), (t - 12.3) / 0.3) if t > 12.3 else a

def s4(t):  # la poule brise ses barreaux
    lt = t - 12.6; snap = 14.9; since = t - snap
    if t < snap:
        z = 1.05 + 0.25 * ease(lt / 2.3); rat = (lt / 2.3) ** 2
        img = cam(BG['bd_poule'], z, 0.55, 0.42, dx=math.sin(lt * 60) * 5 * rat, dy=math.cos(lt * 53) * 4 * rat)
        img = heat(img, t, 2 + 6 * rat, None, 0.09, 30)
        img = glow(img, W * 0.5, H * 0.45, 260, (200, 40, 20), 0.35 + 0.25 * math.sin(lt * 9))
    else:
        img = cam(BG['bd_poule'], 1.3 - 0.15 * eout(since / 0.6), 0.55, 0.42); img = bright(img, max(0.25, 1 - since * 1.2))
        img = glow(img, W / 2, H * 0.5, 380, (255, 220, 150), max(0, 1 - since * 1.4))
        img = ring(img, W / 2, H * 0.5, since / 0.6, (255, 240, 200), 900, 18)
        r = np.random.default_rng(11)
        for i in range(9):  # éclats de barreaux
            ang = r.random() * 6.283; v = 500 + r.random() * 600; ln = 90 + r.random() * 90; rot = r.random() * 6.283 + since * (6 + r.random() * 10)
            px = W / 2 + math.cos(ang) * v * since; py = H * 0.5 + math.sin(ang) * v * since + 380 * since * since
            dx_, dy_ = math.cos(rot) * ln / 2, math.sin(rot) * ln / 2
            cv2.line(img, (int(px - dx_), int(py - dy_)), (int(px + dx_), int(py + dy_)), (120, 50, 40), 9, cv2.LINE_AA); cv2.line(img, (int(px - dx_), int(py - dy_)), (int(px + dx_), int(py + dy_)), (215, 160, 120), 3, cv2.LINE_AA)
        kk = since / 0.7; img = place(img, CUT['h_cocotte'], W / 2, H * 0.98 + 120 * (1 - eout(kk)), 380 + 380 * eout(kk), rot=(1 - eout(kk)) * -10, sx=1 + 0.25 * (1 - spring(kk)) * 0 + 0.15 * max(0, 1 - kk * 3), gl=(255, 200, 100))
        img = speed_lines(img, t, max(0, 1 - since / 0.8)); img = embers(img, t * 3, 70, (255, 230, 160), 300, 1.1, seed=8)
    img = vignette(img, 0.9); img = shake(img, 16 * max(0, 1 - since / 0.7) if t >= snap else 0, t)
    img = flash(img, (255, 255, 240), 1 - since / 0.3) if t >= snap else img
    a = np.array(caption(P(img), 'Mais une poule a brisé ses barreaux…', (lt - 0.3) / 1.8))
    return flash(a, (255, 120, 40), (t - 16.1) / 0.3) if t > 16.1 else a

def s5(t):  # Captain Cocotte
    lt = t - 16.4; img = rays_bg(t, 16); img = embers(img, t, 80, (255, 170, 60), 140, 1.1, seed=4)
    img = glow(img, W * 0.32, H * 0.55, 330, (255, 110, 30), 0.5 + 0.2 * math.sin(lt * 5))
    k = lt / 0.9; sp = spring(k); dyb = 620 * (1 - clamp(sp)) if sp < 1 else 0
    bob = math.sin(lt * 4.5) * 7; br = 1 + 0.018 * math.sin(lt * 5.2)
    img = place(img, CUT['big_cocotte'], W * 0.32 + math.sin(lt * 2.2) * 8, H + 34 + dyb + bob, 700 * (0.55 + 0.45 * min(sp, 1.15)), rot=math.sin(lt * 2.6) * 2.2, sx=1 / br, sy=br, gl=(255, 150, 40))
    img = speed_lines(img, t, max(0, 1 - lt / 0.6)); img = ring(img, W * 0.32, H * 0.6, lt / 0.7, (255, 220, 160), 1000, 14)
    fr = P(img); fr = big_text(fr, 'CAPTAIN', (lt - 0.5) / 1.0, 76, H * 0.34, W * 0.72, rot=-4); fr = big_text(fr, 'COCOTTE !', (lt - 0.75) / 1.0, 104, H * 0.5, W * 0.72, rot=-4)
    fr = caption(fr, 'Elle a pris les armes.', (lt - 1.3) / 1.2, y=H * 0.68, cx=W * 0.72)
    a = np.array(fr); a = flash(a, (255, 255, 255), 1 - lt / 0.25); return shake(a, 10 * max(0, 1 - lt / 0.5), t)

HEROES = [('h_cochon', 'GÉNÉRAL BOUDIN'), ('h_meuh', 'COLONEL ENTRECÔTE'), ('h_canard', 'AMIRAL PÉKIN'), ('h_taureau', 'EL TORO'), ('h_lapin', 'CAPORAL GIBELOTTE')]
def s6(t):  # les héros jaillissent un à un
    lt = t - 20.0; i = min(len(HEROES) - 1, int(lt / 0.8)); st = lt - i * 0.8; side = -1 if i % 2 else 1
    img = rays_bg(t * 1.5, 18, (20, 40, 120) if i % 2 else None); img = embers(img, t, 60, (255, 200, 90), 160, 1.0, seed=6 + i)
    k = st / 0.5; sp = spring(k); land = clamp(k)
    x = W / 2 + side * 250 + side * 420 * (1 - sp); sq = 1 + 0.22 * max(0, math.sin(clamp((st - 0.28) / 0.25) * math.pi)) * (1 if st > 0.28 else 0)
    bob = math.sin(st * 9) * 6 * land
    img = place(img, CUT[HEROES[i][0]], x, H + 12 + bob, 640, rot=side * (1 - clamp(sp)) * 12, sx=1 / sq if sq > 1 else 1, sy=sq, gl=(255, 210, 120))
    img = ring(img, W / 2 + side * 250, H * 0.8, (st - 0.28) / 0.45, (255, 230, 170), 600, 12) if st > 0.28 else img
    img = speed_lines(img, t, max(0, 0.8 - st / 0.25))
    fr = P(img); fr = big_text(fr, HEROES[i][1], st / 0.4, 54, H * 0.18, rot=-2 * side)
    fr = big_text(fr, 'LIBÈRE LA BASSE-COUR', 1, 44, H * 0.9, col=(255, 240, 210), rot=0)
    return flash(np.array(fr), (255, 255, 255), 0.7 - st / 0.12)

def s7(t):  # l'armée marche : rebonds par bandes, poussière, torches
    lt = t - 24.4; src = cam(BG['sq_land'], 1.3 - 0.2 * eout(lt / 2.5), 0.5, 0.55, dx=-20 * lt)
    amp = 5 + 3 * math.sin(lt * 2); dy = np.zeros((H, W), np.float32)
    phase = (XX / W) * 15.0; dy = amp * np.abs(np.sin(lt * 7.5 + phase)) * (0.35 + 0.65 * (YY / H))
    img = remap(src, 0 * XX, dy)
    img = glow(img, W * 0.72, H * 0.1, 220 + 20 * math.sin(lt * 4), (255, 60, 30), 0.35)
    lay = np.zeros((H, W, 3), np.uint8); r = np.random.default_rng(int(lt * 20))
    for i in range(28):
        cv2.circle(lay, (int(r.random() * W), int(H * 0.93 + r.random() * 20)), int(18 + r.random() * 26), (55, 45, 40), -1)
    img = add(img, cv2.GaussianBlur(lay, (0, 0), 20), 0.9); img = embers(img, t, 70, (255, 120, 40), 90, 1.1, seed=9); img = vignette(img, 0.9)
    img = flash(img, (255, 255, 255), 0.8 - lt / 0.2); img = shake(img, 6 * max(0, 1 - lt / 0.5) + 1.5 * (1 - 0), t)
    a = np.array(big_text(P(img), 'PLUS JAMAIS AU MENU !', (lt - 0.3) / 0.9, 78, H * 0.82, rot=-3))
    return flash(a, (0, 0, 0), (t - 26.9) / 0.3) if t > 26.9 else a

def s8(t):  # logo : lettres qui tombent, feu
    lt = t - 27.2; img = np.zeros((H, W, 3), np.uint8); img[:] = (10, 3, 5)
    img = fire(img, t, 130, 0.5); img = embers(img, t, 70, (255, 130, 40), 70, 1.0, seed=3)
    fr = P(img); d = ImageDraw.Draw(fr); F = font(124); word = 'CINDERDELVE'; tw = [d.textlength(c, font=F) for c in word]; tot = sum(tw); x0 = (W - tot) / 2
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    for i, c in enumerate(word):
        k = (lt - i * 0.06) / 0.5
        if k > 0:
            yy = H * 0.34 - 360 * (1 - clamp(spring(k))) if k < 1.6 else H * 0.34
            ld.text((x0 + sum(tw[:i]), yy), c, font=F, fill=(255, 165, 60, 255), stroke_width=6, stroke_fill=(40, 8, 4, 255))
    g = lay.filter(ImageFilter.GaussianBlur(18)); g = Image.eval(g, lambda v: v)
    fr = fr.convert('RGBA'); fr.alpha_composite(g); fr.alpha_composite(lay); fr = fr.convert('RGB'); d = ImageDraw.Draw(fr)
    if lt > 1.0:
        a = min(1, (lt - 1.0) / 0.5)
        for txt, y, f, c in (('PLUMES ET SANG', H * 0.58, font(30), (230, 190, 120)), ('Gratuit · dans ton navigateur · johnsgone.itch.io/cinderdelve', H * 0.85, font(24), (240, 225, 200))):
            tw_ = d.textlength(txt, font=f); d.text(((W - tw_) / 2, y), txt, font=f, fill=tuple(int(v * a) for v in c))
    return np.array(fr)

def frame(i):
    t = i / FPS
    f = s1 if t < 4.2 else s2 if t < 8.6 else s3 if t < 12.6 else s4 if t < 16.4 else s5 if t < 20.0 else s6 if t < 24.4 else s7 if t < 27.2 else s8
    Image.fromarray(f(t)).save(f'{OUT}/f/{i:04d}.jpg', quality=92); return i

if __name__ == '__main__':
    N = int(DUR * FPS)
    with Pool(4) as p: list(p.imap_unordered(frame, range(N), chunksize=8))
    SR = 44100
    def boom(dur=0.9, f0=90, f1=35, noise=0.5):
        n = int(SR * dur); tt = np.arange(n) / SR; fq = f0 * (f1 / f0) ** (tt / dur)
        return np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-tt * 5) + noise * np.random.default_rng(1).standard_normal(n) * np.exp(-tt * 18)
    def clang(dur=0.7):
        n = int(SR * dur); tt = np.arange(n) / SR; return sum(np.sin(2 * np.pi * fq * tt) for fq in (523, 1311, 2240, 3170)) * np.exp(-tt * 7) * 0.35
    def whoosh(dur=0.5):
        n = int(SR * dur); tt = np.arange(n) / SR; z = np.random.default_rng(2).standard_normal(n); return np.convolve(z, np.ones(60) / 60, 'same') * np.sin(np.pi * tt / dur) * 2.0
    fx = np.zeros(int(SR * DUR))
    def put(s, at, g=1.0): a = int(at * SR); b = min(len(fx), a + len(s)); fx[a:b] += s[:b - a] * g
    put(boom(1.2), 4.2, 0.9); put(whoosh(0.8), 3.6, 0.5); put(clang(), 14.9, 0.8); put(boom(0.8, 140, 50), 14.9, 0.7); put(boom(1.0), 16.4, 0.9); put(whoosh(), 16.0, 0.5)
    for k in range(len(HEROES)): put(whoosh(0.3), 20.0 + k * 0.8, 0.5); put(boom(0.35, 160, 80, 0.3), 20.28 + k * 0.8, 0.45)
    put(boom(1.2), 24.4, 0.9); put(boom(1.6, 70, 30), 27.2, 0.8)
    fx = np.clip(fx / max(1e-6, np.abs(fx).max()) * 0.8, -1, 1)
    with wave.open(f'{OUT}/fx.wav', 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((fx * 32767).astype(np.int16).tobytes())
    M = f'{ROOT}/build/music'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', f'{OUT}/f/%04d.jpg', '-i', f'{M}/menu.mp3', '-i', f'{M}/boss.mp3', '-i', f'{OUT}/fx.wav', '-filter_complex',
                    '[1:a]atrim=0:4.4,afade=t=in:d=0.6,afade=t=out:st=3.8:d=0.6,volume=0.8[a1];[2:a]atrim=0:26,adelay=4200|4200,afade=t=in:st=4.2:d=0.3,afade=t=out:st=28:d=2,volume=0.8[a2];'
                    '[3:a]volume=1.1[a3];[a1][a2][a3]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '160k', '-t', str(DUR), '-movflags', '+faststart', f'{OUT}/cinderdelve-histoire.mp4'], check=True)
    print('ok', f'{OUT}/cinderdelve-histoire.mp4')
