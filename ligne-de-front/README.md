# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez des groupes d'unités dans les secteurs d'un plateau simple (sans déplacement), vous les fusionnez par couleur et vous avancez sur une carte de campagne jusqu'au quartier général final.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Règles en bref

- **Paquet de départ court : 15 cartes** (6 tireurs, 2 jeeps, 1 blindé, 2 destroyers, 1 chasseur, et 3 ordres : barrage, fumigènes, ravitaillement), plus une **doctrine** choisie parmi 3 au début de la campagne, qui ajoute 3 cartes : Blitz (half-track, jeeps, assaut), Artillerie (artillerie, observateurs, reconnaissance), Défense (mitrailleuse, génie, infirmiers), Commandos (2 parachutistes, sabotage) ou Marine (croiseur, sous-marin, débarquement).
- **Renforts** : après chaque victoire, on choisit 1 carte parmi 3 (ou on passe pour garder un paquet court). Les types absents du paquet sortent deux fois plus souvent et portent le badge « Nouveau ». Les autres cartes arrivent aussi par l'intendance et les caisses.
- **Terrains des couleurs** : chaque couleur a un terrain de **force ▲ (+50 % de dégâts)** et un de **faiblesse ▼ (−25 %)**, pour les unités terrestres (attaque et riposte) : jaune ▲ route ▼ forêt ; rouge ▲ champ ▼ rivière ; vert ▲ forêt ▼ route ; noir ▲ village ▼ champ. Une carte fusionnée cumule (jaune + vert en forêt : ×1,25). En glissant une carte, les cases affichent +50 % ou −25 % ; des pastilles en bas de chaque secteur le rappellent.
- **Plus d'attaque à la main : on pose, le jeu calcule.** Le front compte **5 secteurs** (colonnes) : route, champ, forêt (pas de blindés, couvert), village, rivière (pas de véhicules), mer (la côte). Pour chaque secteur, le jeu affiche l'**Attaque ⚔** et la **Défense 🛡** des deux camps (ennemi en haut, vous en bas, bilan au milieu). En fin de tour, chaque secteur se résout, les deux camps en même temps : **Attaque − Défense d'en face = dégâts** (au moins 25 % de l'Attaque passe toujours). Le but : faire tomber le **QG ennemi** à 0.
- **File par ancienneté** : 3 unités terrestres au plus par secteur, numérotées par ordre d'arrivée. Les dégâts frappent d'abord la plus ancienne, puis la suivante, puis le **QG**. Un secteur vide laisse passer toute l'Attaque d'en face. L'ordre **Repli** renvoie une unité en fin de file et la soigne. Votre QG est **fortifié** : il ne subit que 20 % des dégâts qui l'atteignent, mais ses PV vous suivent de bataille en bataille.
- **Attaque d'une unité** : hommes × dégâts par tir (le perçage compte) × terrain de sa couleur ; anti-chars ×2 face à un blindé, génie ×2 face à un fortin. **Défense** : valeur de l'unité, réduite quand elle est entamée, + couvert et retranchement.
- **Appuis** : navires (près de la côte) et avions (partout) ne prennent pas de place dans la file ; un seul appui par secteur, quelques tours. Le **bombardier** frappe aussitôt un secteur ennemi (moitié sur les voisins) ; le **chasseur** annule l'obus visant son secteur.
- **Combinaisons façon Balatro**, par secteur. Attaque : Binôme +0,5, Trio +1, Armes combinées +1, Appui +1, puis Tir guidé ×1,5 et Même couleur ×1,5. Défense : Nid défensif +1, Rempart blindé +1, Soutien sanitaire +0,5, Ligne tenue +0,5, Couverture aérienne ×1,5. Ordres Assaut (Attaque ×1,5) et Contre-attaque (Défense ×1,5). Les **manuels tactiques** montent une combinaison de niveau ; jokers : Clairon, Tenaille, Fanfare, Triade, Général de Fer, Major Radio.
- **Aides à la décision** : bouton 📖 « Lire le plateau » (un secteur annoté, ouvert automatiquement à la première bataille) ; étiquettes Ennemi / Vous ; **★** marque le meilleur secteur pour la carte choisie et la barre de conseil dit pourquoi (QG protégé, dégâts au QG ennemi, combo débloqué) ; **⚠** signale le secteur où l'ennemi va percer ; prévision permanente « si vous finissez le tour maintenant » ; Attaque ⚔ et Défense 🛡 de base sur chaque carte ; au glisser, bilan avant → après et combos gagnés ; décompte de résolution expliqué en mots avec son résultat ; **bilan du tour** (QG, unités détruites, prochain danger).
- **Glisser une carte** sur un secteur affiche son nouveau bilan avant de la lâcher ; toucher un secteur ouvre sa fiche (files, combinaisons, calcul). Le décompte de fin de tour s'anime secteur par secteur (Attaque × Mult, Défense d'en face, dégâts).
- **Progression exponentielle** (comme les blinds de Balatro) : le QG ennemi vaut niveau × 20 × 1,12ⁿ, les unités ennemies ont ×3 PV et se renforcent de 10 % par niveau. L'ennemi tient chaque secteur au départ, comble ses trous en priorité et renforce là où vous êtes faibles. Il annonce ses renforts (silhouettes), ses obus (−X) et ses mines (☠) un tour à l'avance.
- **Sabotage** (8 % du QG ennemi) et **barrage** (42 au départ) suivent la progression ; parachutistes : la Défense ennemie compte moitié contre leur secteur.
- **Ravitaillement** : 5 points par tour (+ bonus permanents, + 1 par village tenu), pour payer les cartes.
- **Réserve** : l'épingle 📌 garde jusqu'à 2 cartes en main pour le tour suivant, et jusqu'à 3 points de ravitaillement non dépensés sont reportés : de quoi préparer un gros coup.
- **Chaque carte est un groupe** : par exemple 10 soldats (10 tirs de 1), 4 jeeps mitrailleuses (4 tirs de 2) ou 1 char (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs. Les cartes affichent l'effectif (soldats, jeeps, avions…) ; le détail est dans la fiche « i ».
- **Ordres** : cartes sans couleur qui ne posent pas d'unité, jouées en plus des déploiements : Barrage d'artillerie, Fumigènes, Ravitaillement, Retranchement, Repli, Assaut, Contre-attaque, Embuscade.
- **Synergies** : Marqué (+2 par tir, artillerie ×2), Élan (+1 par véhicule à élan déjà posé ce tour), Soutien (soins), Transport, pièges (mines, embuscade). Compositions possibles : blitz motorisé, artillerie et observateurs, défense en profondeur, commandos, marine.
- **Défausses** : 3 par bataille ; chacune remplace jusqu'à 5 cartes de la main et donne **+1 ravitaillement** ce tour.
- **Ennemis à mécaniques** : obusiers (artillerie ennemie, à l'arrière, portée 2–3), bunkers retranchés (génie ×3, barrage ×2 contre eux), mines ennemies posées dans vos secteurs (☠ : la prochaine unité posée perd 6 PV, le génie désamorce), annoncées à l'avance.
- **Jokers de composition** : Sergent Intendant (+2 défausses, chacune +1 ravitaillement de plus), Général Éclair (élan ×2), Major Radio (cibles marquées +4), Capitaine Sapeur (pièges +4, génie moins cher), Amiral Lebrun (navires +1 par autre navire), Major Faucon (paras moins chers, sabotage +6), Général de Fer (armes combinées +2), Sergent Ito (ordres −1, le premier ordre du tour pioche 1 carte), Commandant Silva (navires −1).
- **Jokers génériques rééquilibrés** : Capitaine Moreau (+25 % de PV pour l'infanterie seulement), Docteur Meyer (10 % de soins par tour, infirmiers doublés), Lieutenant Dubois ($12).
- **Quatre couleurs** : jaune (+1 dégât par tir), rouge (+50 % d'effectif), vert (+50 % de PV), noir (perce 1 blindage, agit dès l'arrivée).
- **Fusion illimitée** : on fusionne autant de cartes du même type qu'on veut, de couleurs différentes ou non (jaune + rouge = orange ; 3 couleurs = tricolore ; 4 = arc-en-ciel), en main ou, sur la carte, entre groupes voisins dès le tour suivant leur arrivée. Les **soldats et les PV s'additionnent** (10 + 10 + 15 tireurs = 35) et les bonus de couleur valent pour tout le groupe. Une carte fusionnée coûte le prix de ses cartes, moins 1 par fusion.
- **Couleurs libres** : on peut déployer dans un même tour des cartes de couleurs différentes ; c'est le terrain de chaque secteur qui récompense ou pénalise une couleur.
- **Courbe de difficulté** : les snipers arrivent dès la 2e bataille, les obus, panzers et obusiers dès la 3e ; le premier boss est plus abordable.
- **Boss à mécaniques** : chaque campagne tire deux boss parmi trois — Le Mammouth (char lourd, obus guidé annoncé à l'avance), le Train blindé (traverse les secteurs) et la Batterie côtière (fortifiée, à l'arrière, protégée par un bouclier). Le boss final arrive avec une escorte de panzers. **Abattre le boss fait perdre 50 % de ses PV au QG ennemi**, ce qui raccourcit les combats de boss.
- **Événements de campagne** : nœuds « ? » sur la carte (convoi, déserteurs, pont, correspondant de guerre, parachutage, hôpital, espion) avec un choix et ses conséquences (renseignement, ravitaillement, défausses, combat plus dur…).
- **Sauvegarde automatique** : la campagne est enregistrée à chaque écran (carte, bataille, intendance, récompense, événement) ; le bouton **Continuer** de l'écran titre la reprend.
- **Tutoriel guidé** : des bulles accompagnent les deux premières batailles (déploiement, terrains, ordres, défausse, fin de tour) ; on peut les passer.
- **Écran de combat** : il tient entièrement dans l'écran en portrait ; les cartes de la main sont en éventail, toutes visibles sans défiler.
- **Annuler** : défait la dernière action (placement, fusion).
- **Butin de guerre** : après chaque bataille, du butin ($) à dépenser à l'intendance.
- **Intendance façon Balatro** : tout tient sur un écran, sans défilement. Trois étagères de tuiles (recrues et ordres ; jokers et manuels tactiques ; caisses et services). **Toucher** une tuile affiche son détail, **la faire glisser vers la zone d'achat** l'achète (la zone s'illumine, et refuse si le butin manque). Les services (entraîner, ravitaillement, infirmerie, réformer) se touchent directement.
- **Ravitaillement permanent** : +1 par tour (jusqu'à +3) en battant un boss ou à l'intendance ($14, puis $26, puis $38).
- **Jokers** : 23 cartes à effet permanent (5 au maximum), achetées ou gagnées en campagne.
- **Entraînement** : améliorer une carte jusqu'au niveau 3. On peut aussi acheter de nouvelles cartes ou en retirer.
- **Carte de campagne** : 9 étapes à embranchements (bataille, élite, boss, camp, dépôt, état-major). Objectifs : détruire le QG, tenir la position, éliminer des unités.

## Graphismes et animations

- **Sprites peints (IA)** : armée bleue (tireurs, parachutistes, observateurs, infirmiers, génie, mitrailleuse, jeep, blindé, half-track, chasseur de chars, artillerie, reconnaissance, destroyer, croiseur, sous-marin, chasseur, bombardier) et armée rouge (soldats, grenadiers, snipers, mitrailleuse, panzer, char lourd, train blindé, batterie côtière, obusiers, bunker). **Poses animées** : tir des premières files pendant la résolution, chute d'une unité détruite, course d'une infanterie qui arrive. Ils sont détourés depuis une planche générée, avec une animation de repos par famille (respiration de l'infanterie, moteur qui tremble, roulis des navires, vol des avions) et un anneau à la couleur de la carte sous chaque figurine. Les unités sans version peinte gardent leur dessin vectoriel.
- Illustrations peintes (IA) intégrées au fichier : écran titre, décors de combat de chaque terrain (champ, forêt, route, village, rivière, mer, ciel), **forteresse du QG ennemi** quand on le frappe, et **carte d'état-major ancienne** en fond des écrans de doctrine et de renforts.
- Carte de campagne illustrée : de la plage du débarquement (mer, péniches, sable) au bocage en damier, au fleuve que franchit « Le pont », aux forêts, à la ligne fortifiée (dents de dragon, barbelés) et à la capitale ennemie en ruines ; routes de terre courbes, chemin parcouru en bleu, régions nommées sur le bord, jeep « Vous » sur votre position ; en-tête compact qui reste visible en faisant défiler (étape, butin, QG, paquet, jokers).
- Sprites en volume : dégradés partagés (relief, verre des cockpits, acier, mer) ; soldats avec bras, guêtres, gourde, filet de casque et bretelle de fusil ; chars avec barbotin, galets, rouleaux, masque de canon, rivets, antenne et boue ; jeep avec capot, calandre, phare, pare-brise, roue de secours et mitrailleuse sur pivot ; navires avec hublots et vague d'étrave ; avions avec lignes de panneaux et disque d'hélice.
- Illustrations générées par IA, intégrées en WEBP dans le fichier : écran titre (diorama au coucher du soleil), décors des scènes de combat pour le champ, la forêt, la route, le village, la rivière, la mer et le ciel (avions), fond des écrans de victoire et de défaite.

- Direction artistique « table d'état-major » : interface sombre façon métal, panneaux en parchemin, police militaire au pochoir (Black Ops One) pour les titres et boutons, boutons et pièces dorés ; le plateau est une maquette posée dans un cadre en bois, avec herbe texturée et lumière douce ; les unités se tiennent sur des socles de pions colorés ; carte de campagne en parchemin quadrillé.

- Sprites dessinés façon dessin animé avec ombres et reflets : soldats de profil (casque rond pour vous, évasé pour l'ennemi, écharpe à la couleur de la carte), chars avec chenilles, chef de char et fanion, jeep avec mitrailleur, navires avec fumée de cheminée, avions avec hélices qui tournent, parachute qui se balance. L'ennemi regarde vers la gauche.

- Tuiles raccordées : les routes, rivières et ponts se relient à leurs voisins ; plages et écume le long de la mer.
- Curseur animé sur l'unité choisie, portée d'attaque en rouge ; toucher un ennemi montre sa zone de menace. En glissant une carte, les cases bleues affichent +50 % (terrain fort) ou −25 % (terrain faible) ; les unités sur leur terrain fort ou faible portent ▲ ou ▼.
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
- `sim.js` : simulation d'une campagne avec un bot qui pose ses cartes là où le bilan prévu est le meilleur et achète en boutique (`node sim.js 300` ; `ONE=n` trace une bataille ; `HQM=… EHP=… EATK=…` pour tester l'équilibrage). Résultat actuel : environ 24 % de campagnes terminées.

## Pistes

- Musique d'ambiance.
- Sauvegarde de la campagne en cours.
- Plus de types d'unités, de couleurs mixtes aux effets propres, d'officiers et d'ennemis.
