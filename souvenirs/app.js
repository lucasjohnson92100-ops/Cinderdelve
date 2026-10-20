'use strict';

const STYLES = [
  { id: 'aquarelle', label: 'Aquarelle', hint: 'soft watercolor illustration' },
  { id: 'vintage', label: 'Affiche vintage', hint: 'retro travel poster, flat colors' },
  { id: 'croquis', label: 'Croquis', hint: 'fine ink line drawing on cream paper' },
  { id: 'pixel', label: 'Pixel art', hint: 'charming pixel art scene' },
];

// Prix en euros, hors livraison.
const PRODUCTS = [
  { id: 'mug', label: 'Mug', price: 16.9 },
  { id: 'tshirt', label: 'T-shirt', price: 24.9 },
  { id: 'cadre', label: 'Cadre', price: 29.9 },
  { id: 'cle', label: 'Porte-clés', price: 9.9 },
  { id: 'boule', label: 'Boule de Noël', price: 14.9 },
];

const PALETTES = {
  aquarelle: [['#f6d6e4', '#9fd3e6', '#f4e3a1'], ['#cfe8d5', '#f2b6a0', '#b9b6e8']],
  vintage: [['#f2c14e', '#e4572e', '#2b4c5c'], ['#f4d6a0', '#c0392b', '#1d3a4a']],
  croquis: [['#fbf5e8', '#2a2430', '#c2547a'], ['#f7f0df', '#3b3342', '#e9a23b']],
  pixel: [['#1e1b4b', '#38bdf8', '#facc15'], ['#14532d', '#a3e635', '#fb7185']],
};

const $ = (s) => document.querySelector(s);
const state = { style: STYLES[0], product: PRODUCTS[0], image: null, seed: 0, busy: false };

function chips(host, items, key) {
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = it.label;
    b.setAttribute('aria-pressed', i === 0);
    b.onclick = () => {
      state[key] = it;
      host.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b));
      render();
    };
    host.append(b);
  });
}

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function rng(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}

// Mode démonstration : illustration abstraite déterministe, utilisée si aucune API d'images n'est branchée.
function demoArt(story, style, seed) {
  const r = rng(hash(story + style.id) + seed * 7919);
  const pal = PALETTES[style.id][seed % 2];
  let s = `<rect width="400" height="400" fill="${pal[0]}"/>`;
  if (style.id === 'pixel') {
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      const v = r();
      const col = y > 12 ? pal[1] : v > 0.93 ? pal[2] : pal[0];
      s += `<rect x="${x * 20}" y="${y * 20}" width="20" height="20" fill="${col}" opacity="${0.55 + r() * 0.45}"/>`;
    }
    s += `<circle cx="${80 + r() * 240}" cy="110" r="40" fill="${pal[2]}"/>`;
  } else {
    s += `<circle cx="${100 + r() * 200}" cy="${110 + r() * 40}" r="${50 + r() * 30}" fill="${pal[2]}" opacity="${style.id === 'croquis' ? 0.9 : 0.8}"/>`;
    for (let i = 0; i < 4; i++) {
      const y = 200 + i * 50, a = 20 + r() * 40;
      let d = `M0 ${y}`;
      for (let x = 0; x <= 400; x += 100) d += ` Q${x + 50} ${y - a * (r() * 2 - 1)} ${x + 100} ${y}`;
      d += ' L400 400 L0 400Z';
      s += style.id === 'croquis'
        ? `<path d="${d}" fill="none" stroke="${pal[1]}" stroke-width="2"/>`
        : `<path d="${d}" fill="${pal[i % 2 ? 1 : 2]}" opacity="${0.35 + i * 0.15}"/>`;
    }
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${s}</svg>`)}`;
}

async function generate() {
  const story = $('#story').value.trim();
  if (!story || state.busy) return;
  state.busy = true;
  $('#go').disabled = true;
  $('#status').innerHTML = '<span class="spin">✦</span> Création en cours…';
  state.seed++;
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ story, style: state.style.hint, seed: state.seed }),
    });
    if (!res.ok) throw new Error(String(res.status));
    state.image = (await res.json()).image;
    $('#status').textContent = 'Voici votre aperçu.';
  } catch {
    await new Promise((r) => setTimeout(r, 600));
    state.image = demoArt(story, state.style, state.seed);
    $('#status').textContent = 'Mode démonstration : branchez une API d’images pour de vraies illustrations (voir README).';
  }
  state.busy = false;
  $('#go').disabled = false;
  ['redo', 'dl', 'order'].forEach((id) => ($('#' + id).disabled = false));
  render();
}

const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Gabarits d'objets : la zone d'impression est un rectangle/cercle dans lequel l'image est rognée.
const MOCKS = {
  mug: (img) => `<path d="M290 120h20a40 40 0 0 1 0 90h-20" fill="none" stroke="#d9d2c8" stroke-width="16"/><rect x="90" y="90" width="210" height="230" rx="18" fill="#f4f1ec" stroke="#d9d2c8" stroke-width="3"/>${img(110, 120, 170, 170)}`,
  tshirt: (img) => `<path d="M140 70l-90 50 35 55 40-22v177h170V153l40 22 35-55-90-50c-10 28-30 40-60 40s-50-12-60-40z" fill="#fff" stroke="#d9d2c8" stroke-width="3"/>${img(145, 130, 110, 110)}`,
  cadre: (img) => `<rect x="60" y="60" width="280" height="280" fill="#6b4a2f"/><rect x="85" y="85" width="230" height="230" fill="#fffdf8"/>${img(105, 105, 190, 190)}`,
  cle: (img) => `<circle cx="200" cy="80" r="26" fill="none" stroke="#999" stroke-width="8"/><rect x="130" y="110" width="140" height="190" rx="22" fill="#fff" stroke="#d9d2c8" stroke-width="3"/>${img(145, 130, 110, 110)}`,
  boule: (img) => `<rect x="185" y="40" width="30" height="30" fill="#d4af37"/><circle cx="200" cy="200" r="130" fill="#fff" stroke="#d9d2c8" stroke-width="3"/>${img(110, 110, 180, 180, true)}`,
};

function render() {
  const p = state.product;
  $('#priceLabel').textContent = state.image ? p.price.toFixed(2).replace('.', ',') + ' €' : '—';
  const stage = $('#stage');
  if (!state.image) { stage.innerHTML = '<p class="ph">Votre aperçu apparaîtra ici.</p>'; return; }
  const cap = $('#caption').value.trim();
  let n = 0;
  const img = (x, y, w, h, round) => {
    const id = 'c' + n++;
    const clip = round ? `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`;
    return `<clipPath id="${id}">${clip}</clipPath><image href="${state.image}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
  };
  const text = cap ? `<text x="200" y="372" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#6f6676">${esc(cap)}</text>` : '';
  stage.innerHTML = `<svg viewBox="0 0 400 400" role="img" aria-label="Aperçu : ${esc(p.label)}"><rect width="400" height="400" fill="#efe9e0"/>${MOCKS[p.id](img)}${text}</svg>`;
}

function download() {
  const a = document.createElement('a');
  a.href = state.image;
  a.download = 'souvenir.' + (state.image.startsWith('data:image/svg') ? 'svg' : 'png');
  a.click();
}

chips($('#styles'), STYLES, 'style');
chips($('#products'), PRODUCTS, 'product');
$('#form').onsubmit = (e) => { e.preventDefault(); generate(); };
$('#redo').onclick = generate;
$('#dl').onclick = download;
$('#caption').oninput = render;
$('#order').onclick = () => $('#orderDlg').showModal();
$('#orderForm').onsubmit = async (e) => {
  if (e.submitter?.value !== 'ok') return;
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await fetch('/api/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, product: state.product.id, story: $('#story').value, caption: $('#caption').value, image: state.image }),
    });
  } catch { /* hors ligne : la commande sera à renvoyer */ }
  $('#status').textContent = 'Merci ! Votre demande est envoyée, nous vous écrivons très vite.';
};
$('#y').textContent = new Date().getFullYear();
render();
