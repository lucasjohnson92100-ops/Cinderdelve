# La route du temps

Maquette d'une affiche illustrée : une route relie une date de début à une date de fin, et chaque souvenir est dessiné le long du chemin. Style visé : carte ancienne douce.

- `index.html` : page unique (HTML, CSS, JS) avec le parcours en 6 étapes (occasion, pour qui, dates, format, souvenirs, style et commande) et l'aperçu de l'affiche en direct.
- `functions/order.js` : réception des commandes (à relier à e-mail, base de données et paiement).

Les petits dessins sont provisoires (tracés en SVG dans le code). Les illustrations définitives viendront d'une bibliothèque dessinée dans le même style ; la génération par IA reste à tester pour les événements sur mesure.

Capacité selon le format (un souvenir tous les 52 unités de route, 1 cm = 20 unités, donc les textes gardent la même taille réelle) :
21 × 30 cm : 5 souvenirs · 30 × 40 cm : 9 · 50 × 70 cm : 20. Le format est choisi avant les souvenirs ; le calcul est dans `maxEvents()`.

Les textes et les dates sont écrits par le code, jamais par une IA d'images.

Test local : `cd souvenirs && python3 -m http.server 8000`.
