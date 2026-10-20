# La route du temps

Maquette d'une affiche illustrée : une route relie une date de début à une date de fin, et chaque souvenir est dessiné le long du chemin. Style visé : carte ancienne douce.

- `index.html` : page unique (HTML, CSS, JS) avec le parcours en 7 étapes (occasion, pour qui, dates, personnages, format, souvenirs, style et commande) et l'aperçu de l'affiche en direct.
- `functions/order.js` : réception des commandes (à relier à e-mail, base de données et paiement).

Les dessins de l'affiche sont les vignettes de `vignettes/` (11 pour l'instant : naissance, premiers pas, voyage, mariage, animal, maison, anniversaire, diplôme, concert, amour, école). `python3 vignettes/build.py` régénère les fichiers SVG, la planche `vignettes.html` et la copie des dessins dans `index.html` (entre les repères `VIGNETTES:BEGIN/END`). Pour ajouter un dessin : une fonction dans `build.py`, puis relancer le script. La génération par IA reste à tester pour les événements sur mesure.

Capacité selon le format (un souvenir tous les 58 unités de route, 1 cm = 20 unités, donc textes et dessins gardent la même taille réelle) :
21 × 30 cm : 4 souvenirs · 30 × 40 cm : 7 · 50 × 70 cm : 18. Le format est choisi avant les souvenirs ; le calcul est dans `maxEvents()`.

Personnalisation par souvenir : chaque souvenir peut être détaillé par des questions (communes : qui, où, ambiance, détail à ne pas oublier ; propres au dessin : par exemple nom et pelage de l'animal, destination et transport, parfum du gâteau). Les réponses servent à deux choses : recolorer le dessin dans l'aperçu (`recolor()`), et rédiger un brief + un texte (`brief()`) transmis à l'illustrateur ou au modèle d'images, dont le résultat est relu avant impression. Les questions sont dans `SPECIFIC` et `COMMON` (`index.html`).

Personnages : étape facultative où chaque personne est décrite une seule fois (prénom, lien, sexe, date de naissance ou tranche d'âge, silhouette, teinte de peau, cheveux, lunettes, barbe, tenue, accessoire…). Un personnage vectoriel se dessine en direct (`personBody()` : silhouette selon l'âge et le sexe, bébé assis, ombres à l'aquarelle, coiffures détaillées), puis peut être ajouté à chaque souvenir (3 au maximum), dessiné à l'âge qu'il avait ce jour-là (`catAt()`). La description part dans le brief (`personDesc()`).

Photos de référence : adultes uniquement, avec case de consentement, 2 photos de 5 Mo au maximum, jamais imprimées. Les photos de personnes de moins de 18 ans sont refusées (`isChild()`) et supprimées si la date de naissance change. Dans la maquette, la photo reste sur l'appareil (aucun envoi). Les textes de politique sont à faire valider (RGPD : consentement, durée de conservation, hébergeur, sous-traitants éventuels). Aucune photo n'est envoyée à un service d'IA.

Modèles par type d'événement (`TPL` dans `index.html`) : Nuit étoilée (naissance : étoiles, nuages, lune, route en pointillés), Deux chemins (couple : deux routes qui se rejoignent, cœurs et fleurs), Les années (anniversaire : bornes des âges placées selon les dates, ballons, guirlande de fanions), Vers le grand jour (mariage : colombes, coins fleuris, arche à l'arrivée), Carte au trésor (autre : sentier pointillé, montagnes, vagues, rose des vents, croix finale). Le modèle suit l'occasion et peut être changé à l'étape Style ; la galerie de l'accueil montre un exemple de chacun.

Animations (motion design) : l'affiche se dessine (route tracée, souvenirs et arbres qui apparaissent quand la route passe, petit cœur voyageur sur l'affiche d'accueil), chaque nouveau souvenir « pousse » sur l'aperçu, transitions orientées entre étapes, frise d'étapes cliquable, retour visuel sur chaque choix, jauges de détails animées, inclinaison de l'affiche sous la souris, apparition au défilement, confettis à la commande. Tout est désactivé si le système demande de réduire les animations.

Les textes et les dates sont écrits par le code, jamais par une IA d'images.

Test local : `cd souvenirs && python3 -m http.server 8000`.
