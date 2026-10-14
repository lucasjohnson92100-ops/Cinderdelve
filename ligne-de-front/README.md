# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez et déplacez des groupes d'unités sur une carte de bataille en grille, vous les fusionnez par couleur et vous avancez sur une carte de campagne jusqu'au quartier général final.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Règles en bref

- **Paquet de départ fixe : 40 cartes** (13 tireurs, 5 jeeps mitrailleuses, 4 blindés, 5 destroyers, 3 croiseurs, 3 sous-marins, 3 chasseurs, 2 bombardiers, 2 parachutistes), en quatre couleurs.
- **Une carte de bataille en grille** (6 × 7), façon Advance Wars : chaque QG est un **fort** sur la carte (le vôtre en bas, celui de l'ennemi en haut, au bout de la route). On ne le traverse pas ; on l'attaque depuis une case à portée. Ses dégâts se voient (fissures, fumée, flammes). Terrains : **route** (rapide), **champ** (ralentit les véhicules), **forêt** et **village** (−30 % de dégâts), **rivière** (infranchissable aux véhicules sauf par les **ponts**, à gué pour l'infanterie), **mer** (navires).
- **Le ravitaillement paie tout** : 10 points par tour (+ bonus permanents, + 1 par village tenu). Déployer une carte coûte son prix ; déplacer une unité coûte 1 point par point de mouvement du terrain traversé.
- **Un tour** : on choisit des cartes (règle des couleurs ci-dessous), « Déployer », puis on touche les cases bleues où les poser (les 2 lignes du bas, un village tenu ; navires en mer près du QG ; avions partout). On déplace ensuite les unités en les touchant. Pour attaquer, on touche une unité puis l'ennemi cerclé de rouge à portée (ou le QG ennemi si on en est assez proche) : une **scène de combat** montre les attaquants à gauche, les défenseurs à droite et leurs pertes. Une unité attaque une fois par tour et ne bouge plus après. « Fin du tour » : l'ennemi avance et attaque à son tour (même scène).
- **Chaque carte est un groupe** : par exemple 10 soldats (10 tirs de 1), 4 jeeps mitrailleuses (4 tirs de 2) ou 1 char (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs. Les cartes affichent l'effectif (soldats, jeeps, avions…) ; le détail est dans la fiche « i ».
- **Navires et avions** ne peuvent pas être touchés et restent quelques tours ; ils ont une longue portée (croiseur : 2 à 5 cases, chasseur : 3, bombardier : zone de 3 × 3).
- **Quatre couleurs** : jaune (+1 dégât par tir), rouge (+50 % d'effectif), vert (+50 % de PV), noir (perce 1 blindage, agit dès l'arrivée).
- **Fusion illimitée** : on fusionne autant de cartes du même type qu'on veut, de couleurs différentes ou non (jaune + rouge = orange ; 3 couleurs = tricolore ; 4 = arc-en-ciel), en main ou, sur la carte, entre groupes voisins dès le tour suivant leur arrivée. Les **soldats et les PV s'additionnent** (10 + 10 + 15 tireurs = 35) et les bonus de couleur valent pour tout le groupe. Une carte fusionnée coûte le prix de ses cartes, moins 1 par fusion.
- **Règle des couleurs** : on ne déploie ensemble que des cartes de **même couleur**. Si l'on déploie une carte **fusionnée** (ex. orange = jaune + rouge), on peut y joindre des cartes des couleurs qui la composent (jaune et rouge).
- **Villages** : une unité de terre qui s'y arrête le capture ; chaque village tenu donne +1 ravitaillement par tour et sert de zone de déploiement avancée.
- **L'ennemi se montre à l'avance** : silhouettes en haut de la carte pour les renforts, case cerclée de rouge pour les obus (on peut les esquiver en se déplaçant). Un chasseur intercepte un obus.
- **Écran de combat** : il tient entièrement dans l'écran en portrait ; les cartes de la main sont en éventail, toutes visibles sans défiler.
- **Annuler** : défait la dernière action (placement, déplacement, fusion).
- **Butin de guerre** : après chaque bataille, du butin ($) à dépenser à l'intendance.
- **Ravitaillement permanent** : +1 par tour (jusqu'à +3) en battant un boss ou à l'intendance ($14, puis $26, puis $38).
- **Jokers** : 16 cartes à effet permanent (5 au maximum), achetées ou gagnées en campagne.
- **Entraînement** : améliorer une carte jusqu'au niveau 3. On peut aussi acheter de nouvelles cartes ou en retirer.
- **Carte de campagne** : 9 étapes à embranchements (bataille, élite, boss, camp, dépôt, état-major). Objectifs : détruire le QG, tenir la position, éliminer des unités.

## Graphismes et animations

- Tuiles raccordées : les routes, rivières et ponts se relient à leurs voisins ; plages et écume le long de la mer.
- Curseur animé sur l'unité choisie, cases de déplacement en bleu, portée d'attaque en rouge ; toucher un ennemi montre sa zone de menace.
- Les unités se déplacent case par case (les vôtres comme celles de l'ennemi), se grisent quand elles ont fini leur tour, et une bannière annonce chaque tour.
- Scène de combat façon Advance Wars : écran coupé en deux, chaque camp sur le décor de sa case (champ, forêt, village, route, rivière, mer, ciel, QG) ; chaque figurine tire, et les pertes tombent une à une.
- Tirs visibles sur la carte avant la scène, arrivées propres à chaque type (parachute, avion qui plonge, navire et son sillage, renfort ennemi dans un nuage rouge), cartes inclinables au doigt avec reflet (façon Balatro), pile et compteur ×N sur les cartes fusionnées, jeep qui roule sur la carte de campagne, défilé sur l'écran titre, butin qui défile et pièces qui jaillissent.
- Ambiance : oiseaux, ombres de nuages sur la carte, arbres qui bougent, fumée des villages, drapeaux qui flottent, cartes qui se balancent en main.

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
