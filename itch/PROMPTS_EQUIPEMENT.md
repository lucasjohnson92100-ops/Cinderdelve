# Cinderdelve — prompts des 30 pièces d'équipement

Thème : les animaux de la ferme s'équipent avec ce qu'ils trouvent pour combattre le Grand Boucher.
Six panoplies, de la plus pauvre à la plus prestigieuse :

1. **Jute** : sacs de grain, ficelle de botteleuse
2. **Osier et bois** : paniers, tonneaux, sabots
3. **Fer-blanc** : seaux, arrosoirs, lessiveuse
4. **Cuivre** : casseroles, chaudrons, rivets verdis
5. **Acier volé au Boucher** : cotte de mailles de boucher, crochets, taches rouges
6. **Or de la Ferme céleste** : épis de blé dorés, ailes, gemmes roses

## Comment les générer

Copie le **style commun** au début de chaque prompt, puis ajoute la description de la pièce.

- **Format** : carré 1:1 (1024 × 1024 si possible), fond transparent ou uni.
- **Cadrage** : une seule pièce, centrée, vue de trois quarts, sans personnage.
- **Noms de fichiers** : nomme-les comme indiqué (par exemple `ar_head_1.png`). Je les intègre ensuite directement dans le jeu.

### Style commun (à coller en tête de chaque prompt)

```
Game item icon for a cartoon farm roguelike, single isolated object centered, 3/4 view, bold dark outline, cel-shaded with soft highlights, warm saturated colors, chunky readable silhouette, painterly cartoon style like a mobile RPG inventory icon, no character, no text, plain transparent background, 1:1
```

### Négatif (si l'outil le permet)

```
character, hands, person, animal, text, letters, watermark, frame, border, busy background, photo, realistic
```

---

## 1. Jute (niveau 1)

| Fichier | Pièce | Prompt (après le style commun) |
|---|---|---|
| `ar_head_1.png` | Bonnet de jute | a cap made from a stitched burlap grain sack, rough woven texture, frayed edges, twine tie, small patch |
| `ar_chest_1.png` | Sac de grain | a vest made from a burlap grain sack with arm holes cut out, stenciled faded wheat logo, rope belt |
| `ar_hands_1.png` | Gants de jardinier | worn leather-and-burlap gardening gloves, pair, dirt stains, stitched cuffs |
| `ar_legs_1.png` | Guêtres de jute | burlap leg wraps tied with baling twine, pair, patched knees |
| `ar_feet_1.png` | Chaussons de jute | burlap slippers stuffed with straw, pair, straw sticking out |

## 2. Osier et bois (niveau 2)

| Fichier | Pièce | Prompt |
|---|---|---|
| `ar_head_2.png` | Panier d'osier | an upturned wicker egg basket worn as a helmet, woven willow, leather chin strap |
| `ar_chest_2.png` | Tonneau cerclé | chest armor made from a cut wooden barrel with iron hoops, leather shoulder straps |
| `ar_hands_2.png` | Mitaines d'osier | woven wicker gauntlet mittens, pair, wooden knuckle plates |
| `ar_legs_2.png` | Jambières de vannerie | woven wicker shin guards with wooden slats, pair, leather straps |
| `ar_feet_2.png` | Sabots de bois | carved wooden clogs, pair, painted small flower, straw lining |

## 3. Fer-blanc (niveau 3)

| Fichier | Pièce | Prompt |
|---|---|---|
| `ar_head_3.png` | Seau en fer-blanc | a dented tin milk bucket worn as a knight helmet, eye slit cut out, handle as crest, rivets |
| `ar_chest_3.png` | Plastron de lessiveuse | breastplate hammered from an old tin washtub, ribbed metal, rivets, leather buckles |
| `ar_hands_3.png` | Gants de four en fer-blanc | tin plated oven mitts, pair, quilted fabric with tin plates riveted on |
| `ar_legs_3.png` | Jambières d'arrosoir | shin guards made from flattened tin watering cans, pair, spout-shaped knee caps |
| `ar_feet_3.png` | Bottes en fer-blanc | tin boots made from cans, pair, rivets, slightly dented |

## 4. Cuivre (niveau 4)

| Fichier | Pièce | Prompt |
|---|---|---|
| `ar_head_4.png` | Casserole de cuivre | a polished copper saucepan helmet with the handle as a plume holder, red rooster-feather plume, green verdigris rivets |
| `ar_chest_4.png` | Cuirasse de chaudron | cuirass made from a hammered copper cauldron, shiny copper with verdigris patina, brass buckles, emerald gem |
| `ar_hands_4.png` | Gantelets de cuivre | articulated copper gauntlets, pair, verdigris joints, small emerald gem on the cuff |
| `ar_legs_4.png` | Jambières de chaudron | hammered copper greaves, pair, round knee cops like pot lids, verdigris |
| `ar_feet_4.png` | Bottes de cuivre | copper-plated boots, pair, brass buckles, verdigris details |

## 5. Acier volé au Boucher (niveau 5)

| Fichier | Pièce | Prompt |
|---|---|---|
| `ar_head_5.png` | Heaume du Boucher | menacing dark steel butcher's helm, cleaver-shaped crest, meat hooks as horns, red cloth band, small red gem |
| `ar_chest_5.png` | Tablier de mailles du Boucher | heavy butcher's chainmail apron over dark steel plates, red-stained leather straps, cleaver emblem |
| `ar_hands_5.png` | Gants de mailles du Boucher | dark steel chainmail butcher gloves, pair, red-stained cuffs, small hook spikes |
| `ar_legs_5.png` | Jambières du Boucher | dark steel greaves, pair, chainmail at the knees, red leather straps, hook spikes |
| `ar_feet_5.png` | Bottes ferrées du Boucher | heavy hobnailed dark steel boots, pair, red laces, studded soles |

## 6. Or de la Ferme céleste (niveau 6, légendaire)

| Fichier | Pièce | Prompt |
|---|---|---|
| `ar_head_6.png` | Couronne d'épis d'or | radiant golden helm crowned with golden wheat ears, pink gem, soft holy glow, small white feathers |
| `ar_chest_6.png` | Plastron de la Ferme céleste | ornate golden breastplate engraved with a sunrise over a barn, wheat-ear pauldrons, pink gem, holy glow |
| `ar_hands_6.png` | Gantelets d'épis d'or | golden gauntlets, pair, wheat-ear knuckle spikes, pink gems, glowing |
| `ar_legs_6.png` | Jambières de la Ferme céleste | golden greaves, pair, wheat-ear engravings, small wings on the knees, glowing |
| `ar_feet_6.png` | Bottes ailées d'or | golden winged boots, pair, white feather wings at the ankles, pink gem, glowing |

---

## Astuce

Si ton outil le permet, génère **une planche par panoplie** : 5 objets sur une ligne, même fond, même éclairage. Les couleurs restent alors cohérentes d'une pièce à l'autre. Ajoute en fin de prompt :

```
five separate items in one row with equal spacing: helmet, chest armor, gloves, leg greaves, boots
```

Je découpe ensuite la planche moi-même.
