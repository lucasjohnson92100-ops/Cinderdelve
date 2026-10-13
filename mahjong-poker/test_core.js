// Vérifie le cœur du jeu (découpe de la main, jokers, score) : node mahjong-poker/test_core.js
const fs = require('fs');
const src = fs.readFileSync(process.argv[2] || __dirname + '/index.html', 'utf8');
const core = src.split('// ==CORE==')[1].split('// ==/CORE==')[0];
const A = new Function(core + ';return {analyze,scoreHand,makeDeck};')();
const T = (s, v, eng = null) => ({ suit: s, v, eng });
const mk = (...a) => a.map(([s, v]) => T(s, v));
let bad = 0;
const check = (name, got, exp) => { if (got !== exp) { bad++; console.log('ÉCHEC', name, 'obtenu', got, 'attendu', exp); } };

const full = mk(['B',1],['B',2],['B',3],['C',4],['C',4],['C',4],['K',7],['K',7],['K',7],['D',1],['D',1],['D',1],['B',9],['B',9]);
let r = A.analyze(full);
check('mahjong complet', r.mahjong, true); check('4 groupes', r.melds.length, 4);

const three = mk(['B',1],['B',2],['B',3],['C',4],['C',5],['C',6],['K',7],['K',7],['K',7],['D',1],['K',2],['C',9],['B',9],['B',5]);
r = A.analyze(three);
check('3 groupes sans pair', r.mahjong, false); check('3 groupes', r.melds.length, 3); check('tuiles inutiles', r.left.length, 5);

// un joker (Dragon blanc) complète le groupe manquant
const wild = mk(['B',1],['B',2],['B',3],['C',4],['C',5],['C',6],['K',7],['K',7],['K',7],['D',1],['D',1],['D',1],['B',9],['D',3]);
r = A.analyze(wild); check('joker pour la paire', r.mahjong, true);
const wild2 = mk(['B',1],['B',3],['C',4],['C',5],['C',6],['K',7],['K',7],['K',7],['D',1],['D',1],['D',1],['B',9],['B',9],['D',3]);
r = A.analyze(wild2); check('joker au milieu d\'une séquence', r.mahjong, true);
// Sans joker, une main vide de groupes reste valide
r = A.analyze(mk(['B',1],['C',3],['K',5],['B',7],['C',9],['D',1]));
check('aucun groupe', r.melds.length, 0);

// Score : Une seule famille avec grande séquence
const fam = mk(['B',1],['B',2],['B',3],['B',4],['B',5],['B',6],['B',7],['B',8],['B',9],['B',9],['B',9],['B',9],['B',5],['B',5]);
const s = A.scoreHand(fam, { levels: {}, relics: [] });
check('Mahjong une famille', s.mahjong, true);
check('fans', s.events.filter(e => e.fan).map(e => e.fan).includes('Une seule famille'), true);
check('grande séquence', s.events.filter(e => e.fan).map(e => e.fan).includes('Grande séquence'), true);
// Score d'une main incomplète : 1 groupe sans paire = (10 + 3×5 + 8) × 2
const one = mk(['B',5],['B',5],['B',5],['C',1],['K',3],['C',8],['D',1]);
const o = A.scoreHand(one, { levels: {}, relics: [] });
check('un brelan de 5', o.total, (10 + 15 + 16) * 2);
console.log(bad ? bad + ' échec(s)' : 'tests OK');
process.exit(bad ? 1 : 0);
