# La route du temps

Maquette d'une affiche illustrée : une route relie une date de début à une date de fin, et chaque souvenir est dessiné le long du chemin. Style visé : carte ancienne douce.

- `index.html` : page unique (HTML, CSS, JS) avec le parcours en 5 étapes (occasion, pour qui, dates, souvenirs, style et format) et l'aperçu de l'affiche en direct.
- `functions/order.js` : réception des commandes (à relier à e-mail, base de données et paiement).

Les petits dessins sont provisoires (tracés en SVG dans le code). Les illustrations définitives viendront d'une bibliothèque dessinée dans le même style ; la génération par IA reste à tester pour les événements sur mesure.

Contraintes de composition : 10 souvenirs au maximum, textes et dates écrits par le code, jamais par une IA d'images.

Test local : `cd souvenirs && python3 -m http.server 8000`.
