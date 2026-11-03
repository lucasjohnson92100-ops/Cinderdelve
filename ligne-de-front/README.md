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
- **Zones Mer et Ciel** : les navires se posent toujours en mer (en bas) et les avions dans le ciel (en haut). Chaque zone est un secteur à part entière (places, score Attaque × Mult, combos Flotte / Escadrille, fortifications Port et Aérodrome) dont la frappe s'ajoute au total. Une zone armée donne en plus « Appui aérien et naval » (+0,5) à chaque secteur terrestre, et un chasseur dans le ciel donne la « Couverture aérienne » (Défense ×1,25) à tous. Quand on pose une main sur un secteur terrestre, ses navires et avions partent automatiquement dans leur zone. Les zones vides ne forment qu'une fine bande.
- **Vos secteurs** : le front compte 4 secteurs terrestres (couloirs) et la côte. Chaque secteur a **3 places au départ** (unités terrestres et appuis ; les ordres n'en prennent pas), affichées sous son nom. Ce qu'on y pose s'y cumule, combos compris.
- **Boutique en packs (façon Balatro)** : quatre packs fermés à l'intendance — Recrues (3 unités), Ordres (3 ordres), État-major (3 jokers), Améliorations (Fortification, Niveau ou Manuel) ; parfois un Méga pack (5 cartes, on en garde 2). On achète, on ouvre, on garde le meilleur : le tirage est aléatoire. Services en dessous (Entraîner, Ravitaillement, QG, Réformer) et « Nouveaux packs » ⟳.
- **Cartes et plateau simplifiés** : plus d'épingles ni de réserve (la main est défaussée en fin de tour, le ravitaillement non dépensé se reporte toujours jusqu'à 3) ; une carte montre son nom, une pastille d'effectif, son illustration, Attaque / Défense / endurance ; une unité sur le plateau montre seulement son effectif et son endurance ; le conseil n'apparaît que quand il y a une action à guider ; « Fin du tour » demande une seconde touche si rien n'a été joué.
- **Plateau pleine hauteur** : le tableau occupe toute la hauteur ; la main se pose par-dessus et se masque (bouton « Main ») ; elle s'abaisse d'elle-même quand on a choisi des cartes pour laisser voir les scores. Bloc de fin de tour compact.
- **Le plateau est la scène** : les secteurs du plateau ont le même visuel que la scène d'assaut (décor peint du terrain, grandes unités aux couleurs de leurs cartes avec effectif et endurance, score Attaque × Mult à droite de chaque bande) et le QG ennemi occupe la colonne de droite en grand ; la scène d'assaut du fin de tour reprend exactement cette géométrie.
- **Scène d'assaut** : avions dans un ciel au-dessus des troupes, engins à l'échelle des fantassins, même taille d'unités dans toutes les bandes.
- **Couleurs visibles** : chaque carte prend la couleur de sa carte (jaune, rouge, verte, noire), et les soldats, chars, avions et navires sont teintés de la même couleur, en main comme sur le plateau.
- **Effectifs** : chaque unité porte son nombre d'hommes ou d'engins ; chaque secteur affiche le total engagé (🪖 infanterie, 🛞 véhicules, ✈ avions, ⚓ navires).
- **Scène d'assaut façon Advance Wars** : en fin de tour, l'écran se coupe en bandes horizontales, une par secteur qui attaque (décor du terrain, troupes en grand, aux couleurs de leurs cartes) ; à droite, la forteresse ennemie peinte avec sa barre de PV. Bande par bande : les troupes avancent et tirent, l'Attaque s'additionne, les combos s'allument, Attaque × Mult claque, la salve frappe le QG (explosion, secousse). Puis « Frappe totale », la riposte du QG sur chaque bande (boucliers de Défense) et les dégâts sur votre QG. Toucher l'écran accélère.
- **Effets peints (IA)** : explosions en 4 images (éclair, boule de feu, souffle, fumée), éclats d'impact, flammes de bouche et souffle des canons, incendies qui s'allument sur la forteresse à mesure que ses PV baissent ; poses de tir peintes pour chars, jeeps, half-tracks, artillerie, chasseurs de chars, avions, bombardiers et destroyers ; QG ennemi en ruines sous la moitié de ses PV (aussi sur le plateau) et effondrement en chaîne d'explosions quand il tombe, avec fumée et drapeau blanc planté sur les ruines (« L'ennemi se rend »).
- **Combat animé (ancien)** : en fin de tour, chaque secteur combat à son tour : chaque unité tire (balles traçantes, éclair de bouche) et ajoute son Attaque, les combos s'allument et font grimper le Mult, le calcul Attaque × Mult claque, puis la salve du secteur file sur le QG ennemi (explosion, secousse, PV qui chutent). Frappe totale en grand, puis riposte : obus ennemis, boucliers de vos secteurs, dégâts sur votre QG. Toucher l'écran accélère.
- **Améliorations** (façon cartes Planète de Balatro) : **Fortifications** par terrain (+1 place dans tous les secteurs de ce terrain, jusqu'à 7) et **Niveaux** par type de cartes (Infanterie, Véhicules, Aviation, Marine : +20 % d'Attaque et de Défense par niveau). Elles s'achètent à l'intendance (prix croissant) ou s'obtiennent en passant une blinde.
- **Fin du tour** : les scores de tous les secteurs **s'additionnent** et frappent le QG ennemi (décompte animé secteur par secteur, puis la frappe totale). Puis l'ennemi riposte d'un seul front : son Attaque − votre **Défense totale** = dégâts sur votre QG (au moins 25 % passe toujours).
- **Usure** : chaque unité a une endurance (infanterie 2 tours, blindés, mitrailleuses, artillerie et navires 3, chasseurs 2) affichée en points sous elle ; elle perd 1 point par tour puis quitte le front. Vert +1, Retranchement +1, Relève +1 au secteur, infirmiers +1 aux voisins. **Repli** renvoie la carte en main.
- **Effets du QG ennemi** (1 en bataille, 2 en élite, celui du boss + 1 ou 2 aux boss) : Bunker (frappe ×0,7 sauf secteurs avec génie ou paras), Division blindée (riposte +30 %, anti-chars ×2), Obusiers (obus annoncé : −1 endurance au secteur, intercepté par fumée ou chasseur), Champs de mines, Tireurs d'élite, Nids de mitrailleuses (infanterie −25 %). Boss : Le Mammouth (seuil de blindage par secteur : concentrez vos forces), Train blindé (un secteur coupé chaque tour), Batterie côtière (navires −50 %, dégâts ÷2 au-dessus de la moitié des PV).
- **Combos** : Attaque (Binôme +0,5, Trio +1, Armes combinées +1, Appui +1, Tir guidé ×1,5, Même couleur ×1,5) et Défense (Nid défensif, Rempart blindé, Soutien sanitaire, Ligne tenue, Couverture aérienne ×1,5). Manuels tactiques et jokers les renforcent.
- **Ordres** : Barrage (+20 Attaque de base dans un secteur), Assaut ×1,5, Contre-attaque (Défense ×1,5), Fumigènes (riposte ÷2, obus perdu), Retranchement, Relève, Repli, Ravitaillement, Débarquement, Sabotage (−8 % au QG). Bombardier : frappe immédiate sur le QG.
- **Objectifs** : détruire le QG, tenir N tours, ou **Frappe décisive** (infliger 30 % de ses PV en un seul tour).
- **Progression exponentielle** : PV du QG ennemi × 1,12 par niveau, riposte +8 % par niveau et +12 % par tour.
- **Aides** : 📖 « Lire le plateau », ★ meilleur secteur pour la carte choisie et pourquoi, alerte quand la riposte dépasse votre Défense, prévision « fin du tour maintenant », bilan avant → après au glisser, bilan de chaque tour.
- **Ravitaillement** : 5 points par tour (+ bonus permanents, + 1 par village tenu), pour payer les cartes.
- **Chaque carte est un groupe** : par exemple 10 soldats (10 tirs de 1), 4 jeeps mitrailleuses (4 tirs de 2) ou 1 char (1 tir de 6, blindage 2). Un groupe qui perd des PV perd des hommes, donc des tirs. Les cartes affichent l'effectif (soldats, jeeps, avions…) ; le détail est dans la fiche « i ».
- **Ordres** : cartes sans couleur qui ne posent pas d'unité, jouées en plus des déploiements : Barrage, Fumigènes, Ravitaillement, Retranchement, Repli, Assaut, Contre-attaque, Embuscade.
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

### Illustrations et effets IA (lot 3)
- `art/qg3.webp` : la forteresse ennemie en ruines, drapeau blanc au sommet — fin de l'assaut victorieux (zoom lent) et fond de l'écran « Butin de guerre » et de la victoire finale.
- `art/splash.webp` (gerbes d'eau, 4 images) et `art/flak.webp` (éclats de DCA, 4 images) : la mer et le ciel ont leurs propres impacts pendant l'assaut et la riposte.
- `art/pk_*.webp` : illustrations des 5 packs de l'intendance (reflet métallisé animé) ; un pack acheté se déchire à l'écran avant de révéler ses cartes.

### Défausse en un bouton, unités lourdes renforcées
- Sélection libre façon Balatro : on touche les cartes, puis on les **pose** (toucher un secteur) **ou** on les **défausse** (le bouton « Fin du tour » devient « ⟲ Défausser N » tant qu'une sélection est active ; max 5 cartes, 3 défausses par bataille).
- Engins, avions et navires plus forts et plus chers : Jeeps 3 (Att 16), Blindé 4 (Att 18 / Déf 16), Half-track 4 (10 / 12), Antichar 4 (18), Artillerie 4 (18), Destroyer 3 (16), Croiseur 5 (24), Sous-marin 4 (18), Chasseur 3 (12 / 7), Bombardier 5 (60 directs). Entraînements ajustés.
- Rééquilibrage : `HQ_MULT` 21 (bot ≈ 45–50 % de campagnes terminées).

### Tir naval animé (IA)
- `art/broad.webp` : bordée peinte en 4 images (éclair, souffle, fumée de cordite) à la proue du navire qui tire ; le navire recule et tangue, un remous se forme sous la coque.
- `art/fire_croiseur.webp`, `art/fire_sousmarin.webp` : poses de tir peintes (tourelles en feu ; torpille lancée), recolorées à la couleur de la carte.
- Obus de marine en vraie parabole (traînée de fumée), qui explosent sur le QG.
- `art/torp.webp` + `art/torpboom.webp` : le sous-marin lance ses torpilles au ras de l'eau ; gerbe d'eau et de feu (3 images) au pied du QG.

### Passes aériennes animées (IA)
- Chasseur : piqué, éclairs des mitrailleuses d'aile (`art/wingmuz.webp`), balles traçantes, gerbes d'impacts au sol sur le QG (`art/strafe.webp`, 4 images), puis pose « roquettes » (`art/rkt_chasseur.webp`) et deux roquettes peintes (`art/rocket.webp`) qui explosent.
- Reconnaissance : nouvel avion à aile haute (`art/idle_recon.webp`), photo au flash (`art/fire_recon.webp`, `art/flash.webp`) et réticule rouge qui marque la cible.
- Bombardier : à la pose, il traverse l'écran au-dessus du QG ennemi et largue 4 bombes peintes (`art/bomb.webp`) qui explosent en tapis, avec secousse.

### Engins terrestres animés (IA)
- Chars et chasseurs de chars : recul, onde de choc à la bouche, nuage de poussière des chenilles (`art/dust.webp`, 4 images), obus perforant traçant, gerbe d'étincelles et explosion sur le QG.
- Artillerie : recul appuyé, bouche à feu levée, deux obus en cloche qui soulèvent la terre (`art/earth.webp`, 4 images : éclair, gerbe de terre, colonne de débris, cratère fumant).
- Jeeps et half-tracks : avancée saccadée en mitraillant, traçantes et impacts au sol, petite poussière derrière les roues.

### Animations d'attente
Sur le plateau comme dans la scène d'assaut, chaque unité reste vivante, avec un décalage propre à chacune :
- soldats : respiration et léger balancement ;
- engins et canons : moteur qui tourne (vibration) et bouffées d'échappement à l'arrière ;
- navires : tangage, écume à la ligne de flottaison, fumée de cheminée ;
- avions : vol en ondulant et traînées de vent.
(Désactivées si le système demande de réduire les animations.)

### Animations d'attente peintes (planches 2 × 2 fournies)
Planches de 4 images détourées, mises à la même échelle et alignées (`art/idle_<sprite>.webp`), jouées en boucle (`IDLE` dans le code) et recolorées par couleur de carte : Tireurs, Parachutistes, Observateurs, Infirmiers, Génie, Mitrailleuse, Blindé, Chasseur de chars, Jeeps, Half-track (2 images), Artillerie, Destroyer, Sous-marin, Chasseur, Bombardier, Reconnaissance (2 images). Il manque encore le Croiseur.

### Poses de tir peintes (infanterie de base)
`art/fire_inf.webp` : 4 poses (debout, à genou en visée, tir avec éclair, réarmement) jouées une fois à chaque tir des Tireurs dans la scène d'assaut (`IDLE.inf_fire`, `once`). Même principe pour les autres unités quand leurs planches arrivent.

### Échelle relative des unités
Chaque planche d'animation a un coefficient `sc` (dans `IDLE`) : un soldat fait environ les 3/4 de la hauteur d'un char, une jeep est plus courte qu'un char, l'artillerie et le half-track entre les deux ; les avions et les navires sont agrandis. Plus de véhicules ou de soldats de la même longueur par construction.

### Portraits peints des jokers
`art/jokers/*.webp` (256 px) : Moreau, Dubois, Ashby, Kowalski, Meyer, Ito, Silva, Brandt, Peintre de guerre, Soleil, Braise. Affichés en médaillon rond (`JOKER_ART` / `officerSVG`) partout où le joker apparaît ; les autres jokers gardent leur petit dessin en attendant leur portrait.

### Fonds peints de la scène d'assaut
`art/scene/*.webp` (route, champ, forêt, village, rivière, mer, ciel, + ruines en réserve) : panoramas vus de côté, horizon à mi-hauteur, bande de sol dégagée dans le bas où se tiennent les unités. Cadrage par terrain dans le CSS (`background-position`). Le plateau (hors assaut) garde ses anciens fonds.

### Ambiances de la scène d'assaut
`art/scene/<terrain>_<ambiance>.webp` : jour, crépuscule, pluie, nuit. Choix selon la blinde (`sceneMood`) : jour au début, crépuscule à partir du niveau 6, pluie pour les élites, nuit pour les boss et à partir du niveau 12. Quand une ambiance n'existe pas pour un terrain, la version de jour est utilisée (manquent : route pluie/nuit, champ nuit, forêt crépuscule). Le terrain « ruines » est en réserve (`ruines_*`), non intégré.

### Animations par lieu (infanterie et véhicules)
- Pendant l'avancée et à chaque tir, les unités terrestres soulèvent des effets propres au terrain : poussière (route, champ), boue et feuilles qui tombent (forêt), gravats (village), ronds d'eau (rivière) — plus gros pour les engins.
- Marche : les fantassins avancent en balançant le pas (plus lent en forêt et au village), les engins vibrent plus fort.
- Lumière de l'ambiance sur les unités (crépuscule chaud, pluie terne, nuit sombre) uniquement quand le décor de ce terrain existe dans cette ambiance ; voile de pluie animé sur les décors de pluie.

## Effets de sol peints (pas, roulage, impact)
Planches IA 2×2 détourées (noir ; blanc pour « rivière pas ») et assemblées en bandes de 4 images, intégrées à `VFX` sous `sol_<terrain>_<pas|roulage|impact>` : pas sous l'infanterie qui avance ou tire, nuage de roulage derrière chars, jeeps, half-tracks et artillerie, gerbe d'impact là où tombent les obus. Le village réutilise le « pas » de la route ; sans planche, les effets CSS `.ffx` restent en secours.

### Effets dans leur contexte
- Le contexte est lu sur l'élément touché : terrain du secteur, ou QG ennemi (bâtiment). Sur le QG : boule de feu peinte (`sol_expl`) pour les gros coups, gravats pour l'artillerie, petits éclats de poussière pour les balles d'infanterie — jamais de gerbe d'eau ni d'herbe.
- Pendant l'avance, deux obus ennemis tombent devant les unités avec l'impact du terrain (`shellFall`) ; la riposte frappe avec le terrain de son propre secteur.
- Pas d'empreintes pour les avions et navires d'appui ; plus de bouffée de poussière quand un fantassin tire ; l'artillerie soulève un souffle de poussière au lieu d'un nuage de roulage.
- Pluie (fonds avec ambiance) : route, champ et village passent aux flaques et gerbes d'eau ; nuit et crépuscule assombrissent ou dorent la poussière ; le village grise la poussière de route.

### Avant-plan de terrain (accessoires peints)
`AVANT[terrain]` : 4 accessoires peints par terrain (route : monticules et cailloux ; champ : herbe, trèfle, blé, gazon arraché ; forêt : fougères, racine moussue, feuilles, branche ; village : briques, pavés, tuile, poutre), issus de planches 2×2 détourées. Chaque unité terrestre de l'assaut en reçoit deux devant ses pieds ou ses chenilles (`avantHTML`, classe `.av`), plus petits pour l'infanterie que pour les véhicules, teintés comme les unités selon l'ambiance. Rivière : pas d'accessoires (les soldats sont sur la berge) en attendant les fantassins dans l'eau.

### Animation vidéo des tireurs (Dreamina)
Première unité animée par vidéo IA : clip de 5 s sur fond vert → détourage chroma (`g − max(r,b)`, despill, filigrane masqué) → 24 images d'attente (boucle de 2,8 s choisie là où la pose de départ et d'arrivée coïncident) et 7 images de tir (flash de bouche, 85 ms par image) en bandes `PAINT["me:inf_idle"]` / `PAINT["me:inf_fire_idle"]`, mêmes dimensions de cadre pour que la figurine ne bouge pas au passage attente → tir. Recoloration par couleur de carte inchangée.

### Animations vidéo (Dreamina) : chasseur, croiseur, sous-marin, destroyer, infirmiers
Même chaîne que pour les tireurs (chroma vert → boucle d'attente choisie là où début et fin coïncident, aller-retour si l'écart reste visible) ; seule la phase d'attente de chaque clip est utilisée, les tirs des navires et des avions restent ceux du code (`navalFire`, `airFire`) pour ne pas doubler les effets. Le croiseur reçoit sa première animation d'attente.

### Animations vidéo : parachutistes, mitrailleuse, artillerie, half-track
Parachutistes et mitrailleuse : attente en boucle + séquence de tir (flash de bouche, 85 ms par image, cadre identique à l'attente). Artillerie et half-track : attente seule (leurs tirs restent ceux du code). Échelle plafonnée à 1 pour que la fenêtre ne dépasse pas la case de l'unité.

### Animations vidéo : char, chasseur de chars, jeep, bombardier, avion de reconnaissance
Attente seule (les tirs restent ceux du code). La jeep avait un fond vert terne : détourage par distance à la couleur de fond (médiane des bords) au lieu de la dominance du vert. Bombardier et reconnaissance : la boucle s'arrête avant l'ouverture de la soute et le flash photo.

### Animations vidéo : observateurs, génie
Dernières unités terrestres converties : attente en boucle (observateurs : jumelles, regard qui tourne ; génie : détecteur de mines balayé). Toutes les unités du jeu ont désormais une animation d'attente issue d'une vidéo ; les tirs peints existent pour l'infanterie de base, les parachutistes et la mitrailleuse, les autres tirs restent ceux du code.

### Tirs vidéo branchés (char, chasseur de chars, jeep, half-track, artillerie, destroyer, croiseur, chasseur)
Les clips contiennent le flash, la fumée et le recul : ils sont découpés en planches de tir `PAINT["me:<unité>_fire_idle"]` à la même échelle que l'attente. Comme la fumée dépasse de l'image d'attente, `IDLE[<unité>_fire].ref` donne le cadre de la planche de tir en fractions de l'image d'attente (`base`) : la figurine reste exactement au même endroit et le reste déborde (`overflow: visible`). Le code ne dessine plus le flash, le nuage de roulage, le recul ni l'inclinaison de piqué pour ces unités (test `animate[data-once]`) ; il garde les projectiles, les impacts et les secousses d'écran. Sous-marin, bombardier et reconnaissance gardent leurs effets codés.

### Fantassins dans la rivière
Vidéo Dreamina d'un fantassin dans l'eau (coupé à la taille, ondes autour du buste) : planches `me:inf_eau` (attente, 24 images) et `me:inf_eau_fire` (tir, flash et fumée, cadre plus large positionné par `ref`). Dans un secteur Rivière, les tireurs de la rangée de devant utilisent ces planches (`unitHTML` remplace `inf` par `inf_eau`), la rangée de derrière reste sur la berge avec le sprite normal. Les autres fantassins (paras, observateurs, infirmiers, génie) sont coupés à la taille par un masque avec vaguelettes animées (`.wtr`, `WADE_ON`) ; la mitrailleuse reste sur la berge. Les unités d'un secteur Rivière sont descendues dans la bande d'eau (`.wading`).

### Unités plus grandes sur le plateau
Les jetons d'unités des couloirs passent de 82 % à 96 % de la hauteur du couloir (74 % → 86 % pour les unités d'appui dans un secteur terrestre, 82 % → 96 % pour le ciel et la mer). Tous les types grandissent ensemble : les proportions entre fantassins, véhicules, avions et navires et la taille des couloirs ne changent pas, seule la place perdue au-dessus des figurines est reprise.

### Assaut : un secteur à la fois
`awScene` passe en mode `focus` : un seul secteur occupe toute la scène (unités dimensionnées selon leur nombre, jusqu'à 124 px, panorama du terrain visible en entier). Entre deux secteurs : le précédent glisse vers la gauche, un éclair balaie l'écran (`.aws-wipe`), une bannière « Secteur n / N » annonce le terrain et le suivant arrive de la droite. Les cibles d'impact du QG sont centrées pendant le focus. Avant la frappe totale et la riposte, la scène revient en vue d'ensemble (tous les secteurs s'empilent, comme avant) ; avec un seul secteur, le focus reste jusqu'au bout.

### Fonds ajoutés : route (pluie, nuit) et champ (nuit)
Trois panoramas IA ajoutés (`art/scene/route_pluie|route_nuit|champ_nuit.webp`, variables `--sc-route-pluie`, `--sc-route-nuit`, `--sc-champ-nuit`) : plateau et scène d'assaut les utilisent, l'éclairage d'ambiance s'active pour ces combinaisons. La forêt au crépuscule (`foret_crepuscule.webp`) a été ajoutée ensuite : tous les secteurs ont maintenant un fond pour chacune des 4 ambiances (jour, crépuscule, pluie, nuit), sauf les ambiances qui retombent sur le jour pour route (rien) — plus aucun manque.

### Corrections d'affichage
- Assaut en focus : les unités se posent au niveau du sol du décor (route, pavés), plus au milieu de la scène.
- Intendance : le bouton Son flottant n'est plus affiché, il recouvrait le montant d'argent ($) ; le son reste réglable dans le menu.

### Assaut : unités bien lisibles en focus
- Taille calculée par secteur selon le nombre d'unités et la place du sol dans le décor (`--gt` : route 38 %, champ 34 %, forêt 42 %, village 40 %, rivière 46 % de la hauteur) : plus de rétrécissement dû au secteur le plus chargé.
- Au-delà de 4 unités, la ligne se replie sur deux rangées décalées (profondeur) ; les groupes de fantassins sont agrandis (×1,7) et se chevauchent légèrement, centrés sans déborder (`safe center`).

### Même taille pour tous les soldats
- `squadSVG` : pour les fantassins, chaque soldat est dessiné à l'échelle fixe `FOOT_FIG` (0,6) quel que soit l'effectif du groupe (avant : 1 seul soldat en grand, 2 à 0,74, 3 et plus à 0,58). Seule la largeur du groupe varie ; une seule rangée pose ses pieds au sol, deux rangées sont décalées en profondeur.
- Proportions des sprites peints alignées sur le tireur (taille du casque) : `IDLE.sc` des parachutistes, observateurs, infirmiers, génie, mitrailleuse et fantassin dans l'eau recalés.
- Scène d'assaut : la même taille d'unité pour tous les secteurs terrestres (la plus petite des tailles calculées) ; la rangée du fond se rapproche de celle de devant.
- Observateurs et infirmiers (`UNARMED`) ne tirent plus : ni flash de bouche, ni balles, ni impacts.

### Proportions engins / soldats dans l'assaut
`VEH_K` donne la hauteur de chaque engin en multiple de la taille d'un soldat (char 1,47, chasseur de chars 1,5, half-track 1,9, jeep 1,55, artillerie 1,53) : un char est plus grand qu'un soldat, plus jamais l'inverse. Si un secteur déborde (rangées supplémentaires, unité coupée), toutes les tailles terrestres baissent ensemble par pas de 10 % : les soldats restent identiques d'un secteur à l'autre et tous les pieds restent sur le sol. La rangée du fond d'un groupe de fantassins est rapprochée.

### Boucliers pendant la riposte, QG renforçable
- Riposte : chaque secteur dresse un bouclier (valeur de sa Défense) devant ses unités ; l'obus ennemi vole jusqu'à lui et explose dessus. Sa taille suit la part de la riposte qu'il couvre ; s'il ne suffit pas et que votre QG perd des PV, il se fissure. Un secteur sans Défense prend l'obus sur ses unités.
- Intendance : nouveau service « QG max +10 » (+10 PV max et +10 PV), $5 puis +$3 à chaque achat, 5 fois par campagne (`FORT_AMOUNT`, `MAX_FORTIFY`, `fortifyCost`, `C.hqUp`).

### Fiches de cartes explicites
`CARD_TIPS` : pour chaque carte (17 unités, 11 ordres), un « Quand la jouer » dans sa fiche (bouton ⓘ), et pour les cartes à effet particulier la liste des effets ennemis (`fx`) contre lesquels elles sont précieuses. Dans une bataille, si l'ennemi a l'effet concerné (Bunker, Mammouth, Division blindée, mines, tireurs d'élite, obusiers, nids…), la fiche affiche « ★ Utile dans cette bataille » et la carte en main porte une étoile dorée ; un avertissement ⚠ apparaît quand la carte est pénalisée (navires contre la batterie côtière). Libellés courts des cartes précisés (« Ignore bunker/blindage », « Att. ×2 vs blindés », « 60 dégâts sur le QG »…).

### Portraits de jokers ajoutés : Amiral Vague, Intendant Fort, Sergent Intendant
Générés en 16:9 puis recadrés en carré autour du sujet (`art/jokers/<id>.webp`, `JOKER_ART`). Les 13 derniers portraits (quartier, blitz, radio, sapeur, lebrun, faucon, fer, clairon, tenaille, fanfare, triade, mousse, ombre) sont maintenant en place : tous les jokers ont leur portrait.

### Correctif : fantassins dans la rivière
Les parachutistes, observateurs, infirmiers et le génie dans un secteur Rivière affichaient toute leur planche d'animation en rangée (le masque CSS appliqué pour les couper à la taille faisait perdre le découpage de la fenêtre). La fenêtre est maintenant simplement raccourcie à 78 % de la hauteur de l'image, sans masque.

### Toucher pendant l'assaut
Une touche isolée sur l'écran pendant la résolution ne passe plus l'animation (`fast`) : sur mobile, un doigt posé par mégarde supprimait flashs, fumées et tirs de véhicules. Il faut maintenant un double toucher (deux touches en moins de 0,45 s) pour accélérer.

## Animations d'assaut (synchro et ambiance)
- **Tir → impact** : chaque projectile signale son atterrissage ; le score du secteur, le tremblement du QG et le chiffre de dégâts se déclenchent au vrai impact (pas avant).
- **QG ennemi** : tremblement proportionnel aux dégâts, éclats de gravats, flammes puis fumée de plus en plus épaisse.
- **Mise en scène** : léger zoom sur le secteur qui tire, recul de caméra à la salve, compteur qui tressaute (style Balatro), combos qui s'allument un à un avec un son de plus en plus aigu.
- **Vie des unités** : elles arrivent en file depuis la gauche, les unités fatiguées (dernière endurance) sont ternies et se dissipent à la fin de leur dernier assaut.
- **Ambiance** : éclairs et tonnerre sous la pluie, lueur des tirs au crépuscule et de nuit, poussière en suspension le jour.

## Spécificité des cartes mise en avant
Chaque carte (unités et ordres) a une fiche « Spécificité » dans sa fenêtre de détails : icône et nom court, ce qu'elle fait, un conseil d'usage et ses limites. En main, un badge doré sur l'illustration rappelle la spécificité d'un coup d'œil (Commando, Tir guidé, Élan, Nid défensif…). Les conseils liés à l'ennemi de la bataille en cours (★ / ⚠) restent affichés en dessous.

## Explication à la sélection d'une carte
Dès qu'une carte est touchée dans la main, une bulle apparaît dans la colonne de droite (hors du plateau, au-dessus de « Votre QG ») avec son nom, sa spécificité (pastille dorée) et trois lignes courtes : **Effet**, **Conseil**, **Limite** ; plus une ligne ★ si elle est précieuse contre l'ennemi du combat en cours. Avec plusieurs cartes, la bulle suit la dernière carte touchée. Elle ne bloque pas les touches (on peut viser un secteur à travers).

## Explications des jokers et des doctrines
Toucher une doctrine (choix de départ) ou un joker (récompense) ouvre une fiche avant de confirmer : nom court de la spécificité, effet, **Conseil**, **À savoir**, et pour les doctrines le rôle des 3 cartes fournies. Les mêmes fiches s'affichent dans les jokers possédés (bouton de la barre de jokers) et dans le détail d'un joker en boutique.

## Déblocage des doctrines
Deux doctrines sont disponibles au départ (Défense, Blitz). Chaque campagne gagnée jusqu'au bout (écran « Victoire ! ») en débloque une nouvelle, dans l'ordre : Artillerie, Marine, Commandos. L'écran de choix montre les doctrines verrouillées et la victoire qui les ouvre ; l'écran de victoire annonce la doctrine débloquée. Le compteur est le nombre de victoires déjà enregistré dans la sauvegarde (`wins`), donc les parties déjà gagnées comptent.

Jokers en combat : toucher un joker de la barre en haut à droite ouvre sa fiche (Effet, Conseil, Limite) dans la même bulle que les cartes, dans la colonne de droite ; le retoucher la referme.

Ordres et combos en combat : les ordres (Assaut, Barrage, Fumigènes…) affichent leur fiche dans la bulle de droite dès qu'on les sélectionne, comme les unités. Le bouton « Combos » (en haut à droite, à côté de ⋯) ouvre la liste de tous les combos avec leur bonus actuel (niveau des manuels compris) et leur condition ; ● vert = combo actif quelque part sur le plateau. La liste défile ; le bouton la referme.

Explications allégées : bulles et fiches se limitent à l'essentiel (Effet + Conseil, une phrase chacune) ; la ligne ★/⚠ n'apparaît que si l'ennemi du combat la rend utile. Les limites, les rôles détaillés des cartes de doctrine et les notes annexes des combos ont été retirés.

Explications partout où l'on voit des cartes : une récompense de carte (butin ou dépôt) s'ouvre d'abord dans sa fiche (stats, spécificité, conseil) avec « Prendre cette carte » ; le détail d'une carte en boutique montre la carte et sa fiche côte à côte ; le paquet permet de toucher une carte pour la lire (« Retour au paquet »).

## Mesures d'équilibre (bot, 300-400 parties)
Doctrines : Artillerie 32,8 %, Défense 32,3 %, Marine 31,8 %, Commandos 29,5 %, Blitz 28,5 % de campagnes terminées (écart dans le bruit). Jokers testés en départ (`JOKER=id node sim.js 300`, référence 29-30 %) : Tenaille (64 %), Fer (53 %) et Clairon (49 %) dominaient ; ajustés par de simples chiffres : Tenaille ×1,6 (39 %), Fer +1 (38 %), Clairon +0,5 (34 %). Lebrun +6 par navire. Limites : le bot ne joue pas les builds de niche (Lebrun, Triade, Faucon) comme un humain, et Brandt (+20 PV) n'est pas simulé.

## Installation sur le téléphone (PWA) et hébergement Cloudflare
`index.html` porte maintenant son en-tête complet (doctype, viewport, thème, manifeste). Sur une adresse https, le jeu enregistre un service worker (`sw.js`, index en réseau d'abord, copie hors ligne en secours) et propose « 📲 Installer » à l'écran titre (invite native sur Android/Chrome, consigne « Partager > Sur l'écran d'accueil » sur iPhone). Fichiers : `manifest.webmanifest`, `sw.js`, `icons/` (192, 512, maskable, apple-touch), `_headers` (pas de cache sur index et sw). Déploiement Workers : `wrangler.jsonc` + `.assetsignore` (voir `DEPLOY_CLOUDFLARE.md`).

## Revue des proportions et de l'équilibrage (octobre)
- **Proportions** (scène d'assaut, mesurées en scène réelle) : à taille de fantassin égale, jeeps et half-tracks étaient 25 % trop petits. `VEH_K` : char 1,7 · chasseur de chars 1,8 · half-track 2,0 · jeep 1,7 · artillerie 1,85 · nid de mitrailleuse 2,4. Groupes resserrés (recouvrement 0,6 hauteur d'unité).
- **Stratégies de paquet** (`STRAT=… node sim.js 300`, campagnes terminées par le bot) : mixte 25-30 %, air 28, marine 26, blindés 25, artillerie 24, infanterie 21. Aucune ne domine, aucune n'est morte ; le paquet mixte reste le meilleur.
- **Répartition des troupes** (`PLAN=…`) : étaler à égalité 3 %, un seul secteur 15 %, deux 21 %, trois 25 %, libre 27 %. D'où la page d'aide « Tactique gagnante » : concentrer, mais sur 2 ou 3 secteurs, selon le terrain.
- **Jokers** : voir la section précédente ; Tenaille, Fer et Clairon ajustés.
- Bataillon reste à +2 (un test à +2,5 n'a rien donné de net).

## Durcissement
`HQ_MULT` 21 → 24 (PV du QG ennemi +14 %). Mesure du bot (300 campagnes) : 24 % → 16 % de campagnes terminées ; les 8 premières étapes restent gagnées à 100 %, la difficulté monte à partir de l'étape 9. Essais écartés : `ENEMY_ATK` 0,75 → 0,85 (12 %) et les deux ensemble (6 %), jugés trop durs pour un bot qui joue moins bien qu'un humain.

## Stratégie : la Défense compte jusqu'au bout
Diagnostic (`DIAG=1 node sim.js`) : toutes les défaites du bot venaient d'une Attaque trop faible, jamais d'une Défense insuffisante : avec un plancher de riposte de 25 %, toute Défense au-delà de 75 % de la riposte ne servait à rien. Le plancher passe à **15 %** (`MIN_THROUGH`), et la riposte ennemie monte à **×1,05** (`ENEMY_ATK`) pour garder la difficulté (bot : 17 %). Résultat : chaque point de Défense reste utile jusqu'à 85 % de la riposte, donc l'arbitrage Attaque / Défense est réel. Doctrines (300 campagnes) : Marine 20 %, Blitz 18, Commandos 18, Artillerie 17, Défense 17 : toutes viables. Le conseil du tour dit « Défense au maximum utile : misez tout sur l'Attaque » quand le seuil est atteint.

## Lot de novembre : butins, jokers, 3 secteurs, usure
- **Butins** relevés : victoire 7 / élite 10 / boss 15 (avant 4 / 6 / 9), victoire rapide jusqu'à +3, QG intact +2, intérêts jusqu'à +3 ; bonus de blinde passée `10 + 3 × manche`. Les PV ennemis montent en compensation (`HQ_MULT` 28) : bot ≈ 18 %.
- **Jokers** : emplacements pleins → on peut remplacer un joker (le vendu rapporte la moitié de son prix) à la récompense et à la boutique, ou garder les siens (+$6). Les jokers sont affichés en haut de la carte de campagne et de la scène d'assaut. Vendre Brandt retire son +20 PV.
- **3 secteurs terrestres** par partie (`GW = 4` : 3 terrains + la mer, plus le ciel).
- **Infanterie** : plus d'endurance mais un effectif qui fond (`menNow`) : 10 → 7 → 4 hommes sur 3 tours, Attaque et Défense en proportion ; infirmiers, relève et retranchement rendent de l'effectif. **Engins** : leur nombre ne baisse pas, ils s'usent (`wearLv`) : traces de dégâts puis fumée.
- **Assaut épuré** : plus de flash, de secousse d'écran, de zoom, d'entrée en marche, d'éclairs ni de poussière ; les secteurs se remplacent par un fondu bref et la vue d'ensemble ne rejoue plus l'entrée (c'était la cause des unités qui disparaissaient un instant). Seules les ressources qui attaquent s'animent.
- **Flou des engins** : plus de tremblement continu (`iveh`, `igun`, `vroll`) ni de `will-change` : le rendu des sprites redevient net.

Boutique : **3 packs au hasard** parmi Recrues (ou Méga), Ordres, Améliorations et État-major ; les **services** (Entraîner, Ravitaillement, soin du QG, Réformer, QG max) sont toujours affichés, grisés quand ils ne sont pas utilisables. Le pack État-major reste possible quand les 5 jokers sont pris (on remplace).

## Navires et avions : plus forts, mais sous condition
Appuis (navires, avions, reconnaissance, bombardier) : **+40 % d'Attaque** (`SUPPORT_K`, bombardier inchangé : 60 fixes) et **il faut une infanterie de la même couleur** sur le plateau, ou dans la même main, pour les poser (`needsInf`, `infCover`). La carte porte un cadenas « 🔒 Infanterie » tant que la condition manque ; un appui déjà posé reste en jeu si l'infanterie disparaît. Packs d'État-major : on ne dépasse jamais 5 jokers (remplacement au choix). Mesures du bot (300 campagnes, `HQ_MULT` 22) : mixte 15 %, infanterie 17, aviation 16, marine 10 (le bot aligne mal les couleurs : à confirmer à la main).

Cartes de boutique : plus aucun titre ni texte qui dépasse (nom sur une ligne avec points de suspension et police réduite au-delà de 11 lettres ; bandeau « Ordre · secteur / unité / front / paras » raccourci). Contrôle automatique sur toutes les cartes aux deux tailles d'écran.

## Boutique : lisibilité
Chaque service affiche son effet en une ligne (« Soigne 12 PV », « +10 PV max »…) et, quand il n'est pas utilisable, la raison (« QG au maximum », « Maximum atteint »). Prix en rouge quand il manque du butin ; le soin du QG est entouré en vert et marqué « Conseillé » quand le QG est sous 60 % et qu'on peut le payer. Jokers : portraits touchables (fiche, vente) avec emplacements libres en pointillé ; bouton « Autres packs » plus explicite.

Fond de rivière (jour) régénéré (`art/scene/riviere_jour.webp`, 1100 px, rivière claire avec forêt). Planches d'effets de terrain reçues (cratères sur fond vert, flaques et herbe écrasée sur fond brun) : pas encore branchées.

Décor de sol peint : cratères d'obus (de plus en plus nombreux avec la campagne, 1 de plus en village) et flaques sous la pluie, posés derrière les unités dans les secteurs terrestres hors rivière (`GROUND`, `.gdec`). Planches détourées du fond vert ; l'herbe écrasée n'est pas utilisée (les sprites se touchent).

Cartes en main : plus d'inclinaison, illustration agrandie par type (`ART_SCALE`) et entière, étiquette de spécificité ou « 🔒 Infanterie » placée sous l'image, noms longs réduits, bouton « i » lisible sur les cartes sombres. « Prendre cette carte » ferme la fenêtre. Portraits de jokers des packs agrandis.

Cartes plus belles : cadre double avec reflet intérieur, bandeau de nom, fenêtre d'illustration vitrée (reflet et ombre intérieure), pastilles d'Attaque / Défense sombres et lisibles, pièce de coût dorée, et cadre selon la rareté (argenté pour les rares, doré lumineux pour les très rares : classes `rar1` à `rar3`).

**Main conservée** : les cartes non jouées restent en main d'un tour à l'autre ; la main se complète jusqu'à 7 cartes (8 avec Ashby), avec au moins 3 nouvelles cartes par tour (`startTurn`). Mesure du bot : 14 % de campagnes terminées (contre 6 % avec 6 cartes et 2 nouvelles : les cartes injouables encombraient la main). Une bataille sauvegardée avec un autre nombre de secteurs n'est plus reprise (les avions apparaissaient sur une forêt après le passage à 3 secteurs). Jokers : barre sur une ligne à part sous « Combos ».

Retour au menu : bouton « 🏠 Menu principal » dans le menu « ⋯ » de la bataille et bouton 🏠 sur la carte de campagne ; la partie est sauvegardée et se reprend avec « Reprendre » sur l'accueil.

Illustrations des cartes sur décor peint : chaque unité terrestre apparaît sur le terrain où sa couleur est forte (jaune : route, rouge : champ, vert : forêt, noir : village), les navires sur la mer, les avions dans le ciel (`artBg`) ; sprite en relief et agrandi aussi sur les cartes de boutique et de récompense.

Cartes joker des packs : cadre doré, grand portrait cerclé d'or, nom, pastille de spécificité et effet complet (4 lignes au plus). Textes corrigés : Amiral Triade (Défense ×1,75 au lieu de ×1,25, conforme au moteur), Docteur Meyer (« infirmiers deux fois plus efficaces, unités terrestres un tour de plus »).

Cartes joker des packs : portrait en pleine carte (le haut de la carte est l'illustration), nom, spécificité et effet sur un bandeau sombre en bas, cadre doré.


Écran des doctrines refait : une seule doctrine au départ (Défense) ; Blitz, Artillerie, Marine puis Commandos se débloquent une par campagne gagnée. Les 5 doctrines sont affichées en tuiles sur décor peint, avec leurs 3 cartes ; les verrouillées sont grisées avec le nombre de victoires restant.

Usure des engins, navires et avions : leur nombre ne baisse jamais ; une barre de durée de vie (verte, jaune puis rouge, avec les tours restants) remplace les points, et le sprite s'abîme (teinte plus sombre, brûlures, éraflures, puis fumée et braises quand il reste 1 tour). `wearLv`, `lifeFrac`, `.lifebar`.

Assaut : plus d'affichage des jokers ni de rayures sur les véhicules (l'usure reste visible par la teinte, la fumée et la barre de vie). Multiplicateurs mis en avant : Attaque × Mult en grosses pastilles lumineuses (le Mult pulse et grossit à chaque combo), combos en grandes pastilles qui claquent à l'écran.

## Pack d'entraînement (niveaux par type et couleur)
- Le « Pack Améliorations » devient le **Pack Entraînement** : 6 choix au plus, on en garde 1 (4 niveaux « type + couleur » tirés de votre paquet, 1 fortification, 1 manuel).
- Un niveau d'entraînement s'applique à **un type d'unité et une couleur** (ex. Infanterie rouge, Véhicules verts) : +20 % d'Attaque et de Défense par niveau pour les cartes de ce type portant cette couleur (une carte bicolore profite du meilleur de ses couleurs). Les ids sont de la forme `foot:J`, `veh:V`, `air:R`, `mer:N`.
- Les niveaux obtenus par les événements de carte et les articles de boutique suivent la même règle.

## Multiplicateurs de l'assaut en grand
Plaque « Puissance × Mult » géante à gauche de chaque secteur : tuile Puissance bleue, tuile Mult flamboyante (dégradé animé, halo pulsé), légendes, anneau de choc et agrandissement à chaque hausse ; pastilles de combos plus grosses, celles qui multiplient en orange feu.

## Illustrations des ordres
8 ordres ont maintenant une illustration peinte (`art/orders/*.webp`, intégrée en base64 dans `ORDER_ART`) : Barrage, Fumigènes, Ravitaillement, Repli, Assaut, Relève, Débarquement, Sabotage. Retranchement et Contre-attaque gardent leur icône en attendant leur image (`ordArt()` choisit tout seul).

## Nombre exact sur les cartes, endurance implicite
- Chaque carte d'unité dessine **exactement** son nombre de ressources (2 avions = 2 avions, 6 jeeps = 6 jeeps, 10 soldats = 10 soldats ; `squadSVG(..., exact)`).
- Plus aucune mention d'« endurance » ou de « N tours » dans les cartes, fiches, jokers, ordres, effets ennemis et tutoriel : l'unité s'use, sa barre de solidité le montre (l'infanterie fond). La mécanique reste la même.

## Symboles Attaque / Défense
Nouvelle épée (lame d'acier, garde dorée, éclat) et nouveau bouclier (écu bleu à étoile) ; sur les cartes, l'Attaque est une pastille rouge et la Défense une pastille bleue, avec de gros symboles et des chiffres blancs.

## Ordres expliqués sur la carte, pack Entraînement détaillé
- Chaque carte d'ordre porte sous son image une phrase d'effet (`ORDER_EXPL`) : « +20 Attaque, 1 secteur », « Riposte ennemie ÷2 », « Attaque ×1,5, 1 secteur »…
- Le pack Entraînement s'ouvre en 6 tuiles détaillées : unité colorée du type concerné, niveau (ex. 1 → 2), effet (+20 % Attaque et Défense) et nombre de cartes de votre paquet concernées ; une phrase d'aide rappelle la règle.

## Cartes d'ordre pleine image
L'illustration occupe toute la carte (main, packs, renforts, boutique) : nom en haut sur un voile sombre, effet en bas, cadre doré.
