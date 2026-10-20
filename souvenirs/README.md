# La route du temps

Maquette d'une affiche illustrée : une route relie une date de début à une date de fin, et chaque souvenir est dessiné le long du chemin. Style visé : carte ancienne douce.

- `index.html` : page unique (HTML, CSS, JS) avec le parcours en 6 étapes (occasion, pour qui, dates, format, souvenirs, style et commande) et l'aperçu de l'affiche en direct.
- `functions/order.js` : réception des commandes (à relier à e-mail, base de données et paiement).

Les dessins de l'affiche sont les vignettes de `vignettes/` (11 pour l'instant : naissance, premiers pas, voyage, mariage, animal, maison, anniversaire, diplôme, concert, amour, école). `python3 vignettes/build.py` régénère les fichiers SVG, la planche `vignettes.html` et la copie des dessins dans `index.html` (entre les repères `VIGNETTES:BEGIN/END`). Pour ajouter un dessin : une fonction dans `build.py`, puis relancer le script. La génération par IA reste à tester pour les événements sur mesure.

Capacité selon le format (un souvenir tous les 58 unités de route, 1 cm = 20 unités, donc textes et dessins gardent la même taille réelle) :
21 × 30 cm : 4 souvenirs · 30 × 40 cm : 7 · 50 × 70 cm : 18. Le format est choisi avant les souvenirs ; le calcul est dans `maxEvents()`.

Personnalisation par souvenir : chaque souvenir peut être détaillé par des questions (communes : qui, où, ambiance, détail à ne pas oublier ; propres au dessin : par exemple nom et pelage de l'animal, destination et transport, parfum du gâteau). Les réponses servent à deux choses : recolorer le dessin dans l'aperçu (`recolor()`), et rédiger un brief + un texte (`brief()`) transmis à l'illustrateur ou au modèle d'images, dont le résultat est relu avant impression. Les questions sont dans `SPECIFIC` et `COMMON` (`index.html`).

Les textes et les dates sont écrits par le code, jamais par une IA d'images.

Test local : `cd souvenirs && python3 -m http.server 8000`.
