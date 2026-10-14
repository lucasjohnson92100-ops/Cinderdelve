# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez des groupes d'unités sur trois lignes de front, vous les fusionnez par couleur et vous avancez sur une carte de campagne jusqu'au quartier général final.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Règles en bref

- **Paquet de départ fixe : 11 cartes** = 6 armée de terre, 3 marine, 2 armée de l'air.
- **Chaque carte est un groupe** : par exemple 10 tireurs (10 tirs de 1), 3 spiders (3 tirs de 3, contournent la ligne) ou 1 blindé (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs.
- **Marine et air** se posent dans la bande « Mer · Air » de chaque ligne, tirent de loin quelques tours et ne peuvent pas être touchés.
- **Quatre couleurs**, chacune avec un avantage :
  - Jaune : +1 dégât par tir.
  - Rouge : +50 % d'effectif (tirs et PV).
  - Vert : +50 % de PV (marine et air : +1 tour).
  - Noir : perce 1 de blindage et agit dès l'arrivée.
- **Fusion** : deux cartes du même type et de couleurs différentes se fusionnent en une carte à deux couleurs (jaune + rouge = orange, etc.) qui cumule les deux avantages et ne coûte qu'une carte. Les deux cartes reviennent séparées dans la défausse.
- L'ennemi annonce renforts et obus un tour à l'avance.
- **Carte** : 9 étapes à embranchements (bataille, élite, boss, camp, dépôt, état-major). Objectifs : détruire le QG, tenir la position, éliminer des unités.

## Structure

- `index.html` : le jeu complet (HTML, CSS et JS dans un seul fichier).
  - bloc `// ==CORE==` : moteur (cartes, couleurs, fusion, combat, carte, équilibrage), sans accès au DOM ;
  - bloc `// ==SPRITES==` : personnages, navires, avions et icônes en SVG ;
  - reste du script : l'interface.
- `test_core.js` : tests du moteur (`node test_core.js`).
- `sim.js` : simulation d'équilibrage avec un bot (`node sim.js 300`).

## Pistes

- Sons et musique.
- Sauvegarde de la campagne en cours.
- Plus de types d'unités, de couleurs mixtes aux effets propres, d'officiers et d'ennemis.
