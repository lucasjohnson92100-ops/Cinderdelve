# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez des groupes d'unités sur trois lignes de front, vous les fusionnez par couleur et vous avancez sur une carte de campagne jusqu'au quartier général final.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Règles en bref

- **Paquet de départ fixe : 11 cartes** = 6 armée de terre, 3 marine, 2 armée de l'air.
- **Un seul front** de 4 places par camp. Le groupe de gauche (1re ligne) reçoit les tirs. Vous choisissez de poser un groupe en 1re ligne ou en renfort, et vous pouvez en passer un en 1re ligne plus tard.
- **Deux zones de soutien** de 2 places : la mer et l'air. Navires et avions tirent de loin pendant quelques tours et ne peuvent pas être touchés.
- **Chaque carte est un groupe** : par exemple 10 tireurs (10 tirs de 1), 3 spiders (3 tirs de 3, contournent) ou 1 blindé (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs.
- **Quatre couleurs** : jaune (+1 dégât par tir), rouge (+50 % d'effectif), vert (+50 % de PV), noir (perce 1 blindage, agit dès l'arrivée).
- **Fusion** : deux groupes du même type et de couleurs différentes forment un groupe à deux couleurs (jaune + rouge = orange, etc.).
  - en main : deux cartes fusionnent et ne coûtent qu'une carte ;
  - sur le front : un groupe déployé peut fusionner avec un autre dès le tour suivant son arrivée.
- **Annuler** : le bouton « Annuler » défait les dernières actions du tour (pose, fusion, changement de place).
- **Butin de guerre** : après chaque bataille, du butin ($) à dépenser à l'intendance.
- **Jokers** : 16 cartes à effet permanent (5 au maximum), achetées ou gagnées en campagne.
- **Entraînement** : améliorer une carte jusqu'au niveau 3. On peut aussi acheter de nouvelles cartes ou en retirer.
- L'ennemi annonce renforts et obus un tour à l'avance.
- **Carte** : 9 étapes à embranchements (bataille, élite, boss, camp, dépôt, état-major). Objectifs : détruire le QG, tenir la position, éliminer des unités.

## Sons

Les bruitages sont synthétisés par le navigateur (Web Audio), sans fichier audio : tirs (fusil, mitrailleuse, sniper), canons, obus et interception, bombes, explosions, coups au QG, déploiements terre, mer et air, fusion de cartes, butin, achats, entraînement, victoire et défaite. Le bouton « Son » en haut à droite coupe tout et mémorise le choix. Le son ne démarre qu'après le premier clic (règle des navigateurs).

## Structure

- `index.html` : le jeu complet (HTML, CSS et JS dans un seul fichier).
  - bloc `// ==CORE==` : moteur (cartes, couleurs, fusion, combat, carte, équilibrage), sans accès au DOM ;
  - bloc `// ==SPRITES==` : personnages, navires, avions et icônes en SVG ;
  - bloc `// ==AUDIO==` : les bruitages ;
  - reste du script : l'interface.
- `test_core.js` : tests du moteur (`node test_core.js`).
- `sim.js` : simulation d'une campagne avec un bot qui achète en boutique (`node sim.js 300`).

## Pistes

- Musique d'ambiance.
- Sauvegarde de la campagne en cours.
- Plus de types d'unités, de couleurs mixtes aux effets propres, d'officiers et d'ennemis.
