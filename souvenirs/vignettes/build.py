#!/usr/bin/env python3
"""Génère les vignettes SVG (style carte ancienne douce) et la planche ../vignettes.html.
Usage : python3 build.py
Chaque forme est tracée une seule fois (defs), puis dessinée en trois couches : fond papier
(masque ce qui est derrière), lavis d'aquarelle décalé, trait d'encre légèrement tremblé."""
import pathlib

INK = '#5a432b'
S, R, T, O, C, B, SK = '#8fae7e', '#d98f8f', '#6f9fa6', '#d9a441', '#fbf3dc', '#b07a4a', '#ecc88a'
HERE = pathlib.Path(__file__).parent


class Sheet:
    def __init__(self, name):
        self.name, self.defs, self.body, self.n = name, [], [], 0

    def add(self, geom, wash=None, ink=True, sw=1.8, op=.62, solid=None, stroke=None, ink_op=1, paper=None):
        self.n += 1
        i = f'{self.name}-{self.n}'
        self.defs.append(geom.replace('/>', f' id="{i}"/>'))
        use = lambda extra: f'<use href="#{i}" {extra}/>'
        if paper if paper is not None else wash:
            self.body.append(use('fill="var(--paper,#f4e8c8)" stroke="none" filter="url(#hand)"'))
        if wash:
            self.body.append(use(f'fill="{wash}" fill-opacity="{op}" stroke="none" transform="translate(1.8 1.6)" filter="url(#wash)"'))
        if solid:
            self.body.append(use(f'fill="{solid}" stroke="none" filter="url(#hand)"'))
        if stroke:
            self.body.append(use(f'fill="none" stroke="{stroke}" stroke-width="{sw}" filter="url(#hand)"'))
        if ink:
            self.body.append(use(f'fill="none" stroke="{INK}" stroke-width="{sw}" stroke-opacity="{ink_op}" stroke-linecap="round" stroke-linejoin="round" filter="url(#hand)"'))

    def path(self, d, **k): self.add(f'<path d="{d}"/>', **k)
    def circle(self, x, y, r, **k): self.add(f'<circle cx="{x}" cy="{y}" r="{r}"/>', **k)
    def ellipse(self, x, y, rx, ry, **k): self.add(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"/>', **k)
    def ground(self, cx, cy, rx, ry, color): self.ellipse(cx, cy, rx, ry, wash=color, ink=False, op=.35, paper=False)
    def star(self, x, y, r, color=O):
        self.path(f'M{x} {y-r}Q{x} {y} {x+r} {y}Q{x} {y} {x} {y+r}Q{x} {y} {x-r} {y}Q{x} {y} {x} {y-r}Z', wash=color, sw=1.1, op=.8)

    def svg(self):
        defs = ('<filter id="hand" filterUnits="userSpaceOnUse" x="-20" y="-20" width="280" height="280"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>'
                '<filter id="wash" filterUnits="userSpaceOnUse" x="-20" y="-20" width="280" height="280"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" result="d"/><feGaussianBlur in="d" stdDeviation=".7"/></filter>')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="{self.name}">'
                f'<defs>{defs}{"".join(self.defs)}</defs>{"".join(self.body)}</svg>')


def cradle():
    s = Sheet('berceau')
    s.ground(120, 200, 78, 9, O)
    s.path('M40 184Q120 214 200 184', sw=3.2, ink_op=.9)
    s.path('M72 168L67 191M168 168L173 191', sw=2.2)
    s.path('M50 118H190Q186 176 120 180Q54 176 50 118Z', wash=O)
    s.path('M52 138Q120 150 188 138', sw=1, ink_op=.6)
    s.path('M58 158Q120 170 182 158', sw=1, ink_op=.6)
    s.path('M50 118Q48 66 104 64L106 118Z', wash=B)
    s.path('M64 116Q64 86 104 80M80 116Q82 98 106 92', sw=1, ink_op=.6)
    s.ellipse(132, 112, 22, 8, wash=C)
    s.circle(124, 104, 11, wash=C)
    s.path('M119 104q2 2.4 4 0M127 104q2 2.4 4 0', sw=1.2)
    s.path('M112 116Q152 100 190 116L188 140Q150 128 112 140Z', wash=R)
    for x, y in ((130, 122), (150, 118), (170, 122)): s.circle(x, y, 2.4, wash=C, sw=.9)
    s.path('M186 44A22 22 0 1 0 204 82A17 17 0 0 1 186 44Z', wash=O, op=.85)
    for x, y, r in ((150, 38, 7), (60, 48, 6), (208, 112, 5), (34, 96, 4)): s.star(x, y, r)
    return s


def steps():
    s = Sheet('premiers-pas')
    s.ground(120, 202, 82, 8, T)
    for x, y in ((34, 196), (54, 176), (34, 154)):
        s.ellipse(x, y, 6.5, 10, wash=R, sw=1.3)
        for dx, dy, r in ((-5, -14, 2.3), (-1.5, -16, 2.3), (2, -15.5, 2.3), (5.5, -12.5, 2)): s.circle(x + dx, y + dy, r, wash=R, sw=1.1)
    for cx in (100, 152):
        s.circle(cx, 178, 13, wash=O)
        s.circle(cx, 178, 3.2, sw=1.2)
        s.path(f'M{cx} 166V190M{cx-12} 178H{cx+12}M{cx-8.5} 169.5L{cx+8.5} 186.5M{cx+8.5} 169.5L{cx-8.5} 186.5', sw=.9, ink_op=.7)
    s.path('M92 128Q70 118 74 100Q88 106 98 120Z', wash=O)
    s.ellipse(122, 132, 38, 26, wash='#e8c05a')
    s.path('M100 132Q118 114 142 130Q124 148 100 132Z', wash=B, op=.5)
    s.circle(158, 100, 18, wash='#e8c05a')
    s.path('M172 95Q192 96 192 104Q178 111 171 106Z', wash=R)
    s.circle(150, 105, 3.6, wash=R, ink=False, op=.5, paper=False)
    s.circle(161, 95, 2.2, solid=INK, ink=False)
    s.path('M153 83Q150 74 158 76M159 82Q161 72 167 77', sw=1.4)
    s.path('M88 154H164Q170 154 170 160V162Q170 168 164 168H88Q82 168 82 162V160Q82 154 88 154Z', wash=T)
    s.path('M170 163Q210 160 214 126', sw=1.2)
    s.circle(214, 121, 5, sw=1.3)
    return s


def ship():
    s = Sheet('voilier')
    s.ellipse(120, 190, 100, 17, wash=T, ink=False, op=.4, paper=False)
    s.path('M52 146H190Q184 176 158 184H88Q60 176 52 146Z', wash='#c99356')
    s.path('M57 158H186', sw=1.1, ink_op=.7)
    for x, y in ((84, 167), (104, 170), (124, 171), (144, 170), (164, 166)): s.circle(x, y, 3, wash=C, sw=1.1)
    s.path('M52 146V128H80V146', wash=O)
    s.path('M100 50V148M146 34V148', sw=2.4)
    s.path('M100 50L56 128M146 34L190 146', sw=.8, ink_op=.6)
    s.path('M102 56Q134 72 102 98Z', wash=C)
    s.path('M102 102Q142 122 102 142Z', wash=R)
    s.path('M148 40Q182 56 148 84Z', wash=C)
    s.path('M148 88Q188 112 148 140Z', wash=R)
    s.path('M146 34V20L166 27L146 32Z', wash=T)
    s.path('M190 150L224 134', sw=2)
    s.path('M26 188Q40 178 54 188T82 188T110 188T138 188T166 188T194 188T222 188', sw=1.6)
    s.path('M10 202Q24 194 38 202T66 202T94 202T122 202T150 202T178 202T206 202T234 202', sw=1.3, ink_op=.7)
    s.path('M40 38L45 52L60 56L45 60L40 74L35 60L20 56L35 52Z', wash=O)
    s.circle(40, 56, 19, sw=.8, ink_op=.7)
    s.path('M168 24Q174 15 180 24Q186 15 192 24', sw=1.5)
    s.path('M202 52Q206 46 210 52Q214 46 218 52', sw=1.3)
    return s


def chapel():
    s = Sheet('chapelle')
    s.ground(120, 200, 84, 9, S)
    s.path('M56 188V128H152V188Z', wash='#efdcae')
    s.path('M46 130L104 92L162 130Z', wash=R)
    s.path('M148 188V104H186V188Z', wash='#e9cf9a')
    s.path('M144 106L167 66L190 106Z', wash=T)
    s.path('M167 66V48M159 56H175', sw=2)
    s.path('M160 132V122Q167 111 174 122V132Z', wash=T, op=.8)
    s.path('M153 142h10M171 152h12M153 164h12M173 174h10', sw=.8, ink_op=.55)
    s.circle(104, 116, 9, wash=C)
    s.path('M104 107V125M95 116H113M98 110L110 122M110 110L98 122', sw=.8)
    s.path('M90 188V160Q104 144 118 160V188Z', wash='#a96f4a')
    s.circle(112, 173, 1.8, solid=INK, ink=False)
    for x in (62, 128): s.path(f'M{x} 178V162Q{x+6} 152 {x+12} 162V178Z', wash=T, op=.75)
    s.path('M84 188H124V195H84Z', wash='#d8cfb8')
    for cx, cy in ((92, 40), (116, 40)):
        s.circle(cx, cy, 14, ink=False, stroke='#d4a63b', sw=3.6)
        s.circle(cx, cy, 15.9, sw=.9, ink_op=.8)
        s.circle(cx, cy, 12.1, sw=.9, ink_op=.8)
    s.path('M92 22L97 28L92 34L87 28Z', wash=C, sw=1.1)
    for x, y, c in ((60, 175, R), (68, 171, O), (200, 173, R), (208, 177, O)):
        s.path(f'M{x} 190V{y+4}', sw=1.2)
        s.circle(x, y, 4.5, wash=c, sw=1.1)
    return s


def puppy():
    s = Sheet('chiot')
    s.ground(112, 204, 84, 8, O)
    s.path('M148 186Q182 190 180 152Q176 148 172 156Q170 174 148 176Z', wash=SK)
    s.path('M170 192H214Q210 212 192 212Q174 212 170 192Z', wash=T)
    s.ellipse(192, 192, 22, 4.5, wash=C, sw=1.3)
    for x, y in ((184, 188), (194, 186), (202, 189)): s.circle(x, y, 3, wash=B, sw=1)
    s.circle(40, 194, 14, wash=R)
    s.path('M28 190Q40 198 52 190M32 182Q44 188 50 202', sw=1.2, ink_op=.8)
    s.ellipse(112, 156, 36, 38, wash=SK)
    s.ellipse(112, 162, 17, 26, wash=C, op=.7, ink=False, paper=False)
    s.ellipse(78, 176, 18, 20, wash=SK)
    s.ellipse(146, 176, 18, 20, wash=SK)
    s.path('M98 158V190Q98 197 104 197Q110 197 110 190V158Z', wash=C)
    s.path('M114 158V190Q114 197 120 197Q126 197 126 190V158Z', wash=C)
    s.path('M104 190V196M120 190V196', sw=.9, ink_op=.6)
    s.path('M88 68Q58 72 62 122Q84 124 92 94Z', wash=B)
    s.path('M136 68Q166 72 162 122Q140 124 132 94Z', wash=B)
    s.circle(112, 92, 30, wash=SK)
    s.path('M112 64Q100 80 106 96Q112 90 118 96Q124 80 112 64Z', wash=B, op=.5, ink=False, paper=False)
    s.circle(92, 104, 5, wash=R, op=.45, ink=False, paper=False)
    s.circle(132, 104, 5, wash=R, op=.45, ink=False, paper=False)
    s.ellipse(112, 106, 15, 12, wash=C)
    s.ellipse(112, 99, 5.5, 4, solid=INK, ink=False)
    s.path('M112 103V110M104 112Q112 118 120 112', sw=1.4)
    s.path('M110 114Q106 128 114 130Q122 128 116 114Z', wash=R)
    s.circle(98, 90, 3.3, solid=INK, ink=False)
    s.circle(126, 90, 3.3, solid=INK, ink=False)
    s.circle(99, 89, 1, solid='#fff', ink=False)
    s.circle(127, 89, 1, solid='#fff', ink=False)
    return s


def house():
    s = Sheet('maison')
    s.ground(120, 198, 90, 10, S)
    s.path('M36 192V152H46V192Z', wash=B)
    s.circle(41, 134, 20, wash=S)
    s.circle(24, 150, 13, wash=S)
    s.circle(58, 148, 14, wash=S)
    s.path('M66 190V120H174V190Z', wash='#f3e1b6')
    s.path('M50 124L120 68L190 124Z', wash=R)
    s.path('M92 94q6 5 12 0t12 0t12 0t12 0M74 108q8 5 16 0t16 0t16 0t16 0t16 0t16 0M58 120q8 5 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0', sw=.8, ink_op=.55)
    s.path('M146 100V72H164V108Z', wash=T)
    s.path('M155 66Q146 56 156 48Q166 40 156 30Q150 24 156 18', sw=1.4, ink_op=.7)
    s.path('M165 60Q173 52 165 44', sw=1.2, ink_op=.5)
    s.path('M106 190V156Q120 140 134 156V190Z', wash=T)
    s.circle(128, 172, 1.8, solid=INK, ink=False)
    for x in (78, 142):
        s.path(f'M{x} 134H{x+20}V156H{x}Z', wash='#bcd9dd')
        s.path(f'M{x+10} 134V156M{x} 145H{x+20}', sw=1)
        s.path(f'M{x-6} 134H{x}V156H{x-6}ZM{x+20} 134H{x+26}V156H{x+20}Z', wash=S, sw=1.2)
        s.path(f'M{x-2} 158H{x+22}V164H{x-2}Z', wash=O, sw=1.2)
        for dx in (4, 10, 16): s.circle(x + dx, 156, 2.2, wash=R, sw=.9)
    s.path('M112 190Q108 200 96 211M128 190Q134 200 146 211', sw=1.2, ink_op=.7)
    s.circle(198, 184, 10, wash=S)
    s.circle(210, 188, 8, wash=S)
    s.circle(208, 124, 10, wash=O)
    s.circle(208, 124, 4, wash=C, sw=1.2)
    s.path('M205 134H211V168H205Z', wash=O)
    s.path('M211 158H219V162H211M211 166H217V170H211', sw=1.3)
    return s


VIGNETTES = [(cradle, 'Naissance', 'Berceau, lune et étoiles'), (steps, 'Premiers pas', 'Canard à roulettes et empreintes'),
             (ship, 'Voyage', 'Voilier, rose des vents et mouettes'), (chapel, 'Mariage', 'Chapelle, alliances et fleurs'),
             (puppy, 'Animal', 'Chiot, gamelle et balle'), (house, 'Nouvelle maison', 'Maison, arbre et clé')]

cards = []
for fn, title, sub in VIGNETTES:
    sh = fn()
    svg = sh.svg()
    (HERE / f'{sh.name}.svg').write_text(svg, encoding='utf8')
    cards.append(f'<figure class="card">{svg}<figcaption><b>{title}</b><span>{sub}</span></figcaption></figure>')

page = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Planche de vignettes</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap">
<style>
:root{{--paper:#f4e8c8;--ink:#4a3623;--line:#d9c79c}}
*{{box-sizing:border-box}}
body{{margin:0;background:#efe2bd;color:var(--ink);font:16px/1.5 'IM Fell English','Palatino Linotype',Georgia,serif;padding:28px 18px 40px}}
h1{{font-weight:400;text-align:center;margin:0 0 4px;font-size:clamp(1.6rem,4vw,2.3rem)}}
.lead{{text-align:center;margin:0 auto 26px;max-width:620px;opacity:.8;font-style:italic}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;max-width:900px;margin:auto}}
.card{{margin:0;background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:10px 10px 12px;box-shadow:0 6px 18px rgba(74,54,35,.15);text-align:center}}
.card svg{{display:block;width:100%;height:auto}}
figcaption b{{display:block;font-weight:400;font-size:1.15rem}}
figcaption span{{font-size:.92rem;opacity:.75;font-style:italic}}
.note{{max-width:620px;margin:26px auto 0;text-align:center;font-size:.95rem;opacity:.75}}
</style>
</head>
<body>
<h1>Planche de vignettes</h1>
<p class="lead">Style carte ancienne douce : trait d'encre sépia légèrement tremblé, lavis d'aquarelle décalés, fond transparent.</p>
<main class="grid">{"".join(cards)}</main>
<p class="note">Dessins vectoriels : nets à toutes les tailles, couleurs modifiables, cohérents entre eux. Les fichiers individuels sont dans <code>souvenirs/vignettes/</code>.</p>
</body>
</html>
'''
(HERE.parent / 'vignettes.html').write_text(page, encoding='utf8')
print('ok', len(cards))
