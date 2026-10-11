# Deux vidéos animées en boucle — prompts

Deux boucles pour le jeu :
1. **Le duel** : le Grand Boucher face à Captain Cocotte. Pour le 1er écran (en fond, en boucle).
2. **La marche des héros** : plusieurs héros qui avancent, déterminés, comme les Avengers.

Les images de départ sont déjà prêtes dans ce dossier, au style du jeu :

| Vidéo | 16:9 (paysage) | 9:16 (portable) |
|---|---|---|
| Duel Boucher / Cocotte | `start-duel-16x9.jpg` | `start-duel-9x16.jpg` |
| Marche des héros | `start-marche-16x9.jpg` | `start-marche-9x16.jpg` |

> Ces images sont des montages à partir des illustrations du jeu. Le générateur les redessinera à sa façon : c'est normal, garde l'image comme référence de style.

## Comment obtenir une vraie boucle

1. Utilise le mode **image → vidéo avec image de début ET image de fin** (« first frame / last frame », « start & end frame »). Disponible sur Dreamina (Seedance), Kling et Veo.
2. Charge **la même image** comme début et comme fin. La vidéo repart ainsi de son point de départ.
3. Durée : **8 à 10 s** si possible (sinon 5 s). Une boucle courte se voit plus.
4. Demande des mouvements **discrets et répétitifs** (respiration, flammes, vent, braises) et **pas de mouvement de caméra** ou seulement un très léger zoom qui revient.
5. Génère 2 à 3 versions et garde celle dont la **dernière image ressemble le plus à la première**.
6. Envoie-moi le fichier : si la boucle n'est pas parfaite, je la **rends continue** par un fondu enchaîné entre la fin et le début (je m'occupe du montage et de l'intégration dans le jeu).

### Réglages communs
- Format **16:9** pour le paysage, **9:16** pour le portable (génère les deux pour la vidéo 1 si tu peux ; sinon 16:9 d'abord).
- Qualité 720p ou plus. Pas de son nécessaire (je mets la musique du jeu).
- **Negative prompt** (si le champ existe) :
  `text, subtitles, watermark, logo, morphing, deformed faces, extra limbs, realistic photo, 3D render, camera cut, scene change, fast motion, blur`

---

## Vidéo 1 — Le duel : le Grand Boucher vs Captain Cocotte

Image de départ **et** de fin : `start-duel-16x9.jpg` (ou `-9x16.jpg`).

### Prompt (à coller tel quel)

```
Animated 2D comic-book illustration, keep the exact art style and character designs of the reference image. A seamless looping shot of a tense face-off. On the left, the Great Butcher, a huge mustached man in a bloody apron and a tall chef hat, holds two big cleavers; his chest rises and falls slowly as he breathes heavily, his red glowing eyes flicker with rage, he slowly tightens his grip on the cleavers. On the right, Captain Cocotte, a heroic white rooster pirate captain in a blue coat with a tricorn hat, holds his saber raised; his coat and feathers flutter in the heat wind, his yellow eyes burn with determination, he gives a tiny defiant nod and returns to his pose. Behind them a barn and a windmill burn, flames flicker and roar in a looping rhythm, embers and ash drift upward continuously, thick smoke rolls slowly. The camera is locked, with only a very slight slow push-in that returns to the exact starting position. The final frame matches the first frame exactly for a perfect loop. Dramatic red and orange lighting, high contrast.
```

### Variante portable (9:16)
Même prompt, avec l'image `start-duel-9x16.jpg`, et ajoute en fin de prompt :
```
Vertical composition: the Butcher fills the top half, Captain Cocotte stands in the lower half facing up at him.
```

### Si l'outil refuse « première image = dernière image »
Génère un clip de 5 s sans image de fin, puis envoie-le-moi : je fais une **boucle aller-retour** ou un **fondu de raccord** (les flammes et la fumée cachent très bien le raccord).

---

## Vidéo 2 — La marche des héros (« comme les Avengers »)

Image de départ **et** de fin : `start-marche-16x9.jpg` (la ligne de héros du jeu : Meuh, Cochon, Cocotte, Taureau, Lapin, Cheval, Oie… sous une lune rouge).

### Prompt (à coller tel quel)

```
Animated 2D comic-book illustration, keep the exact art style and character designs of the reference image. A seamless looping shot of a team of animal heroes walking side by side toward the camera in slow motion, determined and unstoppable, like a superhero team entrance. The heroes march in place with a confident, heavy walking cycle: boots stomp, capes and coats flutter in the wind, the rooster pirate captain in the center raises his saber slightly with each step, the bull and the pig swing their weapons at their sides, the rabbit ninja and the horse knight stride with fierce looks, the cow and the goose follow in line. Their eyes glow and their expressions are grim and focused. A giant blood-red moon glows behind them, embers and ash blow across the frame, dark smoke and distant burning fires drift slowly in the background, the ground shakes slightly with each stomp and dust puffs rise. The camera slowly dollies backward at a steady pace while the heroes stay at the same size in the frame, so the motion repeats seamlessly. The final frame matches the first frame exactly for a perfect loop. Epic heroic atmosphere, dramatic backlighting, high contrast red and orange palette.
```

### Version portable (9:16) pour cette vidéo
Image de départ **et** de fin : `start-marche-9x16.jpg` (les héros en formation en V, Captain Cocotte au premier plan, sous une lune rouge). Colle le même prompt, avec ce complément à la fin :

```
Vertical composition: the heroes advance in a staggered V formation, Captain Cocotte in the front foreground, the others rising from the smoke behind him, the huge red moon at the top of the frame.
```

---

## Ce que je fais ensuite
- Je récupère tes fichiers, je rends les boucles **parfaitement continues** (fondu de raccord si besoin).
- Vidéo 1 : je la mets sur l'**écran d'ouverture**, avec le titre Cinderdelve et le slogan, en version paysage et portable.
- Vidéo 2 : je peux la placer sur un autre écran (par exemple derrière le choix du héros ou le menu), à toi de dire où.
- Je recompresse pour que le jeu reste léger (la vidéo de l'artefact de test est compressée plus fort que celle d'itch).

## Notes
- Les outils gratuits changent souvent leurs crédits : vérifie avant de te lancer. Voir `README.md` de ce dossier pour la liste et les astuces.
- Je n'ai lancé aucune génération payante : tout se passe chez toi.
