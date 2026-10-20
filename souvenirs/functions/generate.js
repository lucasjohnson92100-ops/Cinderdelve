// Fonction Netlify : POST /api/generate  { story, style, seed }  ->  { image: "<url ou data URI>" }
// Branchez ici le fournisseur d'images de votre choix. La clé reste côté serveur (variable IMAGE_API_KEY).
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  const { IMAGE_API_URL, IMAGE_API_KEY } = process.env;
  if (!IMAGE_API_URL || !IMAGE_API_KEY) return { statusCode: 501, body: 'Image API not configured' };

  let story, style, seed;
  try { ({ story, style, seed } = JSON.parse(event.body || '{}')); } catch { return { statusCode: 400, body: 'Bad JSON' }; }
  if (!story || String(story).length > 400) return { statusCode: 400, body: 'Invalid story' };

  const prompt = `Keepsake illustration, ${style || 'illustration'}, centered composition, no text: ${story}`;
  const res = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${IMAGE_API_KEY}` },
    body: JSON.stringify({ prompt, seed, aspect_ratio: '1:1' }),
  });
  if (!res.ok) return { statusCode: 502, body: 'Upstream error' };
  const out = await res.json();
  // Adaptez cette ligne au format de réponse du fournisseur choisi.
  const image = out.image || out.url || out.data?.[0]?.url;
  if (!image) return { statusCode: 502, body: 'No image returned' };
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image }) };
};
