# Souvenirs : objets personnalisés par IA

Site statique + 2 fonctions Netlify. Le client décrit un souvenir, choisit un style et un objet, voit l'aperçu, puis envoie une demande de commande.

- `index.html`, `style.css`, `app.js` : le site (sans dépendance, thème clair/sombre, mobile).
- `functions/generate.js` : génération d'image. Définir `IMAGE_API_URL` et `IMAGE_API_KEY` ; adapter l'extraction de l'image dans la réponse.
- `functions/order.js` : réception des commandes (à relier à e-mail / base de données / paiement).

Sans clé d'API, le site passe en **mode démonstration** (illustration abstraite locale).

Test local : `cd souvenirs && python3 -m http.server 8000` (les fonctions nécessitent `netlify dev`).
