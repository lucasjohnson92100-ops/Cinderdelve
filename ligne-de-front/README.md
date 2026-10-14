# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez des groupes d'unités dans les secteurs d'un plateau simple (sans déplacement), vous les fusionnez par couleur et vous avancez sur une carte de campagne jusqu'au quartier général final.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Règles en bref

- **Paquet de départ fixe : 40 cartes** (13 tireurs, 5 jeeps mitrailleuses, 4 blindés, 5 destroyers, 3 croiseurs, 3 sous-marins, 3 chasseurs, 2 bombardiers, 2 parachutistes), en quatre couleurs.
- **Un plateau en 5 secteurs** (colonnes), chacun avec son terrain : **route**, **champ**, **forêt** (−30 % de dégâts reçus, pas de blindés), **village** (−30 %, +1 ravitaillement par tour s'il est tenu), **rivière** (pas de véhicules), **mer** (navires, toujours sur un bord). Chaque camp a 2 lignes, le **front** et l'**arrière** ; chaque **QG** est un fort derrière son camp. Les unités ne se déplacent pas, sauf les unités au contact (portée 1) qui avancent seules au front de leur secteur s'il est libre. Batailles courtes : 3 à 6 tours.
- **Terrains des couleurs** : chaque couleur a un terrain de **force ▲ (+50 % de dégâts)** et un de **faiblesse ▼ (−50 %)**, pour les unités terrestres (attaque et riposte) : jaune ▲ route ▼ forêt ; rouge ▲ champ ▼ rivière ; vert ▲ forêt ▼ route ; noir ▲ village ▼ champ. Une carte fusionnée cumule (jaune + vert en forêt : ×1). En glissant une carte, les cases affichent +50 % ou −50 % ; des pastilles en bas de chaque secteur le rappellent.
- **Ravitaillement** : 6 points par tour (+ bonus permanents, + 1 par village tenu), pour payer les cartes.
- **Un tour** : on **glisse une carte de la main sur une case bleue** de ses deux lignes (navires dans le secteur maritime, avions partout). Toucher une carte puis une autre du même type les **fusionne** aussitôt. Pour attaquer, on touche une unité puis l'ennemi cerclé de rouge à portée : la portée se compte en cases (front contre front = 1 ; une jeep ou un char touche aussi les secteurs voisins ou l'arrière d'en face). Le **QG ennemi** se frappe quand le secteur d'en face est vide ; l'ennemi fait de même avec le vôtre, il faut donc garder ses secteurs. Une **scène de combat** montre attaquants et défenseurs et leurs pertes. « Fin du tour » : l'ennemi avance et attaque à son tour.
- **Chaque carte est un groupe** : par exemple 10 soldats (10 tirs de 1), 4 jeeps mitrailleuses (4 tirs de 2) ou 1 char (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs. Les cartes affichent l'effectif (soldats, jeeps, avions…) ; le détail est dans la fiche « i ».
- **Riposte** (comme dans Advance Wars) : un défenseur terrestre qui survit et peut atteindre l'attaquant tire aussitôt avec les hommes qui lui restent. Pas de riposte contre les navires, les avions, les bombes ni sur le QG. Vos unités ripostent aussi aux attaques ennemies.
- **Navires et avions** ne peuvent pas être touchés et restent quelques tours ; ils ne visent pas les QG (sauf le bombardier). Croiseur : portée 2 à 5 ; chasseur : 3 ; bombardier : frappe aérienne immédiate, on glisse la carte sur un ennemi ou le QG ennemi et la zone 3 × 3 est bombardée.
- **Quatre couleurs** : jaune (+1 dégât par tir), rouge (+50 % d'effectif), vert (+50 % de PV), noir (perce 1 blindage, agit dès l'arrivée).
- **Fusion illimitée** : on fusionne autant de cartes du même type qu'on veut, de couleurs différentes ou non (jaune + rouge = orange ; 3 couleurs = tricolore ; 4 = arc-en-ciel), en main ou, sur la carte, entre groupes voisins dès le tour suivant leur arrivée. Les **soldats et les PV s'additionnent** (10 + 10 + 15 tireurs = 35) et les bonus de couleur valent pour tout le groupe. Une carte fusionnée coûte le prix de ses cartes, moins 1 par fusion.
- **Règle des couleurs** : dans un même tour, on ne déploie que des cartes de **même couleur**. Si l'on déploie une carte **fusionnée** (ex. orange = jaune + rouge), on peut y joindre des cartes des couleurs qui la composent (jaune et rouge).
- **Villages** : un secteur village est tenu par le camp qui y a une unité terrestre quand l'autre n'en a pas ; il donne +1 ravitaillement par tour.
- **L'ennemi se montre à l'avance** : silhouettes pour les renforts, case cerclée de rouge pour les obus. Un chasseur intercepte un obus.
- **Écran de combat** : il tient entièrement dans l'écran en portrait ; les cartes de la main sont en éventail, toutes visibles sans défiler.
- **Annuler** : défait la dernière action (placement, fusion).
- **Butin de guerre** : après chaque bataille, du butin ($) à dépenser à l'intendance.
- **Ravitaillement permanent** : +1 par tour (jusqu'à +3) en battant un boss ou à l'intendance ($14, puis $26, puis $38).
- **Jokers** : 16 cartes à effet permanent (5 au maximum), achetées ou gagnées en campagne.
- **Entraînement** : améliorer une carte jusqu'au niveau 3. On peut aussi acheter de nouvelles cartes ou en retirer.
- **Carte de campagne** : 9 étapes à embranchements (bataille, élite, boss, camp, dépôt, état-major). Objectifs : détruire le QG, tenir la position, éliminer des unités.

## Graphismes et animations

- Illustrations générées par IA, intégrées en WEBP dans le fichier : écran titre (diorama au coucher du soleil), décor « village » des scènes de combat, fond des écrans de victoire et de défaite.

- Direction artistique « table d'état-major » : interface sombre façon métal, panneaux en parchemin, police militaire au pochoir (Black Ops One) pour les titres et boutons, boutons et pièces dorés ; le plateau est une maquette posée dans un cadre en bois, avec herbe texturée et lumière douce ; les unités se tiennent sur des socles de pions colorés ; carte de campagne en parchemin quadrillé.

- Sprites dessinés façon dessin animé avec ombres et reflets : soldats de profil (casque rond pour vous, évasé pour l'ennemi, écharpe à la couleur de la carte), chars avec chenilles, chef de char et fanion, jeep avec mitrailleur, navires avec fumée de cheminée, avions avec hélices qui tournent, parachute qui se balance. L'ennemi regarde vers la gauche.

- Tuiles raccordées : les routes, rivières et ponts se relient à leurs voisins ; plages et écume le long de la mer.
- Curseur animé sur l'unité choisie, portée d'attaque en rouge ; toucher un ennemi montre sa zone de menace. En glissant une carte, les cases bleues affichent +50 % (terrain fort) ou −50 % (terrain faible) ; les unités sur leur terrain fort ou faible portent ▲ ou ▼.
- Les unités au contact glissent jusqu'au front de leur secteur ; une ligne pointillée « No man's land » sépare les deux camps ; les unités se grisent quand elles ont fini leur tour, et une bannière annonce chaque tour.
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
