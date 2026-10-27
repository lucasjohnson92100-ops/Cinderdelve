# Publier Ligne de Front sur Cloudflare Pages (gratuit)

Le jeu tient dans un seul fichier (`index.html`), les images sont intégrées : rien à compiler.

## Option A : envoi direct (la plus simple, sans GitHub Actions)
1. Compte gratuit sur dash.cloudflare.com.
2. **Workers & Pages → Create → Pages → Upload assets**.
3. Nom du projet : `ligne-de-front`. Glisse un dossier contenant `index.html` (copie de `ligne-de-front/index.html`).
4. **Deploy** : le jeu est en ligne sur `https://ligne-de-front.pages.dev`.
Pour mettre à jour : même écran, **Create deployment**, nouvel `index.html`.

## Option B : automatique depuis GitHub
Le workflow `.github/workflows/ligne-de-front-cloudflare.yml` teste le moteur puis publie.
1. Crée une fois le projet Pages (option A, étapes 1 à 4) pour que le nom existe.
2. Cloudflare : **My Profile → API Tokens → Create Token** (modèle « Edit Cloudflare Workers », ou une permission *Cloudflare Pages: Edit*). Copie le jeton.
3. Relève ton **Account ID** (tableau de bord Cloudflare, colonne de droite de la page d'accueil Workers & Pages).
4. GitHub, dépôt → **Settings → Secrets and variables → Actions** :
   - Secrets : `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
   - Variable (si tu as nommé le projet autrement) : `CF_PAGES_PROJECT`.
5. **Actions → Publier Ligne de Front → Run workflow**.

## Notes
- Limite Cloudflare Pages : 25 Mo par fichier (le jeu fait environ 9,4 Mo) ; bande passante illimitée sur l'offre gratuite.
- Ne mets jamais le jeton dans le code : uniquement dans les Secrets GitHub.
- Domaine personnalisé : projet Pages → **Custom domains**.
