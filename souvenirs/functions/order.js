// Fonction Netlify : POST /api/order. Pour l'instant, la demande est seulement journalisée ;
// ajoutez l'envoi d'e-mail ou l'écriture en base (et le paiement) ici.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  try {
    const { name, email, address, qty, product, story, caption } = JSON.parse(event.body || '{}');
    if (!name || !email || !address) return { statusCode: 400, body: 'Missing fields' };
    console.log('ORDER', JSON.stringify({ name, email, address, qty, product, story, caption }));
    return { statusCode: 200, body: '{"ok":true}' };
  } catch {
    return { statusCode: 400, body: 'Bad JSON' };
  }
};
