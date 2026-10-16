# Ligne de Front

Deckbuilder de guerre solo (1944), dans un style cartoon « Advance Wars ».
Vous déployez des groupes d'unités dans les secteurs d'un plateau simple (sans déplacement), vous les jouez en « mains » façon Balatro (plusieurs cartes posées ensemble dans un secteur, score visible avant la pose) et vous enchaînez des « blindes » façon Balatro : 20 à vaincre pour gagner, puis l'infini.

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation). Les polices viennent de Google Fonts.

## Mode paysage

Tout le jeu se joue téléphone couché. En bataille, **votre jeu est à gauche** (les secteurs, puis votre main en dessous) et **la blinde à battre est à droite** (le QG ennemi, ses effets et sa riposte, puis les totaux, votre QG, les conseils et « Fin du tour »). L'écran de campagne montre la manche en cours (4 blindes côte à côte) ; l'intendance range ses étagères à gauche et la zone d'achat à droite. Un téléphone tenu en portrait affiche « Tournez votre téléphone ».

- **Jamais de défilement** : aucun écran ni aucune fenêtre ne défile ni ne se rogne, de 568×320 (iPhone SE couché) à 1280×720. L'aide, le paquet et le guide sont en pages courtes (Précédent / Suivant), l'écran des blindes tient entier, les écrans de choix se compactent selon la hauteur. `node` + Playwright : le test `noscroll` parcourt une trentaine d'écrans sur 8 tailles.
- **Accueil** : le logo, la promesse et les trois points forts à gauche sur l'illustration ; à droite un menu clair. Une campagne en cours s'affiche avec sa progression (20 pastilles), votre QG, le butin, les jokers et le paquet, et un gros bouton « Continuer ». « Nouvelle campagne » demande une seconde touche avant d'effacer la campagne en cours.
- **Campagne en blindes** : un panneau latéral donne la progression (20 pastilles, un ☠ tous les 4), votre QG et vos jokers ; à droite, les 4 blindes de la manche (Petite, Moyenne, Grosse, Boss) avec leur cible de PV, leur objectif et, pour les blindes à venir, le bonus gagné en les passant.
- **Plateau en couloirs** : chaque secteur est un couloir horizontal qui avance vers la blinde. De gauche à droite : le terrain (avec ses couleurs fortes ▲ et faibles ▼ et les marqueurs d'obus, de mines ou de train), vos 3 emplacements d'unités (sprite à gauche, Attaque, Défense et endurance à droite), l'appui, puis le score du couloir qui pointe vers le QG ennemi. Les terrains se distinguent d'un coup d'œil (route sable, champ vert clair, forêt sombre, village, rivière). La main est plus grande.

## Règles en bref

- **Paquet de départ court : 15 cartes** (6 tireurs, 2 jeeps, 1 blindé, 2 destroyers, 1 chasseur, et 3 ordres : barrage, fumigènes, ravitaillement), plus une **doctrine** choisie parmi 3 au début de la campagne, qui ajoute 3 cartes : Blitz (half-track, jeeps, assaut), Artillerie (artillerie, observateurs, reconnaissance), Défense (mitrailleuse, génie, infirmiers), Commandos (2 parachutistes, sabotage) ou Marine (croiseur, sous-marin, débarquement).
- **Renforts** : après chaque victoire, on choisit 1 carte parmi 3 (ou on passe pour garder un paquet court). Les types absents du paquet sortent deux fois plus souvent et portent le badge « Nouveau ». Les autres cartes arrivent aussi par l'intendance et les caisses.
- **Terrains des couleurs** : chaque couleur a un terrain de **force ▲ (+50 % de dégâts)** et un de **faiblesse ▼ (−25 %)**, pour les unités terrestres (attaque et riposte) : jaune ▲ route ▼ forêt ; rouge ▲ champ ▼ rivière ; vert ▲ forêt ▼ route ; noir ▲ village ▼ champ. Une carte fusionnée cumule (jaune + vert en forêt : ×1,25). En glissant une carte, les cases affichent +50 % ou −25 % ; des pastilles en bas de chaque secteur le rappellent.
- **L'ennemi n'est qu'un QG, comme une « blinde » de Balatro** : une grosse barre de PV à faire tomber, une **riposte** annoncée qui grimpe à chaque tour, et des **effets** qui changent la tactique. Seul le joueur a une tactique par secteur.
- **Vos secteurs** : le front compte 4 secteurs terrestres (couloirs) et la côte. Chaque secteur accueille **autant d'unités et d'appuis qu'on veut** (navires près de la côte, avions) ; ils s'y cumulent et leurs combos aussi.
- **Fin du tour** : les scores de tous les secteurs **s'additionnent** et frappent le QG ennemi (décompte animé secteur par secteur, puis la frappe totale). Puis l'ennemi riposte d'un seul front : son Attaque − votre **Défense totale** = dégâts sur votre QG (au moins 25 % passe toujours).
- **Usure** : chaque unité a une endurance (infanterie 2 tours, blindés, mitrailleuses, artillerie et navires 3, chasseurs 2) affichée en points sous elle ; elle perd 1 point par tour puis quitte le front. Vert +1, Retranchement +1, Relève +1 au secteur, infirmiers +1 aux voisins. **Repli** renvoie la carte en main.
- **Effets du QG ennemi** (1 en bataille, 2 en élite, celui du boss + 1 ou 2 aux boss) : Bunker (frappe ×0,7 sauf secteurs avec génie ou paras), Division blindée (riposte +30 %, anti-chars ×2), Artillerie lourde (obus annoncé : −1 endurance au secteur, intercepté par fumée ou chasseur), Champs de mines, Tireurs d'élite, Nids de mitrailleuses (infanterie −25 %). Boss : Le Mammouth (seuil de blindage par secteur : concentrez vos forces), Train blindé (un secteur coupé chaque tour), Batterie côtière (navires −50 %, dégâts ÷2 au-dessus de la moitié des PV).
- **Combos** : Attaque (Binôme +0,5, Trio +1, Armes combinées +1, Appui +1, Tir guidé ×1,5, Même couleur ×1,5) et Défense (Nid défensif, Rempart blindé, Soutien sanitaire, Ligne tenue, Couverture aérienne ×1,5). Manuels tactiques et jokers les renforcent.
- **Ordres** : Barrage (+20 Attaque de base dans un secteur), Assaut ×1,5, Contre-attaque (Défense ×1,5), Fumigènes (riposte ÷2, obus perdu), Retranchement, Relève, Repli, Ravitaillement, Débarquement, Sabotage (−8 % au QG). Bombardier : frappe immédiate sur le QG.
- **Objectifs** : détruire le QG, tenir N tours, ou **Frappe décisive** (infliger 30 % de ses PV en un seul tour).
- **Progression exponentielle** : PV du QG ennemi × 1,12 par niveau, riposte +8 % par niveau et +12 % par tour.
- **Aides** : 📖 « Lire le plateau », ★ meilleur secteur pour la carte choisie et pourquoi, alerte quand la riposte dépasse votre Défense, prévision « fin du tour maintenant », bilan avant → après au glisser, bilan de chaque tour.
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
- **Jouer une main** (comme Balatro) : on touche plusieurs cartes, chaque secteur affiche alors son score après la pose (Attaque × Mult, combos déclenchés qui clignotent, ★ sur le meilleur) ; on touche le secteur (ou on y glisse les cartes) et toute la main s'y pose. Le score du secteur défile et claque. Les ordres sur unité (Retranchement, Repli, Sabotage) se jouent seuls. Il n'y a plus de fusion de cartes. Combos d'effectif : Paire (2 unités), Trio (3–4), Bataillon (5 et plus).
- **Couleurs libres** : on peut déployer dans un même tour des cartes de couleurs différentes ; c'est le terrain de chaque secteur qui récompense ou pénalise une couleur.
- **Courbe de difficulté** : les snipers arrivent dès la 2e bataille, les obus, panzers et obusiers dès la 3e ; le premier boss est plus abordable.
- **Boss à mécaniques** : chaque campagne tire deux boss parmi trois — Le Mammouth (char lourd, obus guidé annoncé à l'avance), le Train blindé (traverse les secteurs) et la Batterie côtière (fortifiée, à l'arrière, protégée par un bouclier). Le boss final arrive avec une escorte de panzers. **Abattre le boss fait perdre 50 % de ses PV au QG ennemi**, ce qui raccourcit les combats de boss.
- **Événements de campagne** : nœuds « ? » sur la carte (convoi, déserteurs, pont, correspondant de guerre, parachutage, hôpital, espion) avec un choix et ses conséquences (renseignement, ravitaillement, défausses, combat plus dur…).
- **Sauvegarde automatique** : la campagne est enregistrée à chaque écran (carte, bataille, intendance, récompense, événement) ; le bouton **Continuer** de l'écran titre la reprend.
- **Tutoriel guidé** : des bulles accompagnent les deux premières batailles (déploiement, terrains, ordres, défausse, fin de tour) ; on peut les passer.
- **Écran de combat** : il tient entièrement dans l'écran en paysage (testé de 667×375 à 1366×1024) ; les cartes de la main sont en éventail, toutes visibles sans défiler.
- **Annuler** : défait la dernière action (pose d'une main, ordre).
- **Butin de guerre** : après chaque bataille, du butin ($) à dépenser à l'intendance.
- **Intendance façon Balatro** : tout tient sur un écran, sans défilement. Trois étagères de tuiles (recrues et ordres ; jokers et manuels tactiques ; caisses et services). **Toucher** une tuile affiche son détail, **la faire glisser vers la zone d'achat** l'achète (la zone s'illumine, et refuse si le butin manque). Les services (entraîner, ravitaillement, infirmerie, réformer) se touchent directement.
- **Ravitaillement permanent** : +1 par tour (jusqu'à +3) en battant un boss ou à l'intendance ($14, puis $26, puis $38).
- **Jokers** : 23 cartes à effet permanent (5 au maximum), achetées ou gagnées en campagne.
- **Entraînement** : améliorer une carte jusqu'au niveau 3. On peut aussi acheter de nouvelles cartes ou en retirer.
- **Blindes** : 4 par manche (Petite, Moyenne, Grosse = élite, Boss), chacune plus forte que la précédente (PV et attaque du QG ennemi croissants). On peut **passer** les trois premières (dès la 3e blinde) pour un **bonus** annoncé — butin, carte au choix, joker, soins ou événement — au prix du butin, du renfort et de l'intendance ; le boss est obligatoire. **20 blindes** (la 20e est le boss final) donnent la victoire ; on peut alors **continuer à l'infini**, avec des blindes de plus en plus fortes et des effets plus nombreux. Objectifs : détruire le QG, tenir la position, frappe décisive.

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
  - bloc `// ==CORE==` : moteur (cartes, couleurs, mains, combat, carte, équilibrage), sans accès au DOM ;
  - bloc `// ==SPRITES==` : personnages, navires, avions et icônes en SVG ;
  - bloc `// ==AUDIO==` : les bruitages ;
  - reste du script : l'interface.
- `test_core.js` : tests du moteur (`node test_core.js`).
- `sim.js` : simulation d'une campagne avec un bot qui pose ses cartes là où le bilan prévu est le meilleur et achète en boutique (`node sim.js 300` ; `ONE=n` trace une bataille ; `HQM=… EATK=… RAMP=… EG=…` pour tester l'équilibrage). Résultat actuel : environ 22 % de campagnes terminées, batailles de 2 à 5 tours.

## Pistes

- Musique d'ambiance.
- Sauvegarde de la campagne en cours.
- Plus de types d'unités, de couleurs mixtes aux effets propres, d'officiers et d'ennemis.

- **Plateau** : le tableau de jeu occupe l'essentiel de l'écran (testé jusqu'à 765×298) ; colonne de droite réduite à la blinde illustrée, aux totaux, à votre QG, au conseil et aux commandes ; menu ⋯ pour le guide, l'aide, le paquet et le son.
