// Vérifie le moteur de combat : node ligne-de-front/test_core.js
const fs = require('fs');
const src = fs.readFileSync(process.argv[2] || __dirname + '/index.html', 'utf8');
const core = src.split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E = new Function(core + ';return {newBattle,playCard,endTurn,targetsFor,isPlayable,units,CARDS,START_DECK,deploy,genPlan,genMap,battleCfg};')();
let bad = 0;
const check = (n, got, exp) => { if (got !== exp) { bad++; console.log('ÉCHEC', n, 'obtenu', got, 'attendu', exp); } };
const mk = (level = 0, officers = []) => E.newBattle({ level, deck: E.START_DECK.slice(), hq: 30, hqMax: 30, officers }, () => 0.5);

let S = mk();
check('main de 5 cartes', S.hand.length, 5); check('3 de ravitaillement', S.supply, 3);
S.hand = ['inf']; S.plan = [];
check('déploiement valide', E.playCard(S, 0, { lane: 0 }) !== null, true);
check('coût payé', S.supply, 2);
check('unité posée en tête', S.lanes[0].me[0].name, 'Fantassin');
check('unité fraîche', S.lanes[0].me[0].fresh, true);

// une unité fraîche n'attaque pas, puis attaque le tour suivant (QG ennemi vide : -2 PV)
S.plan = []; S.hand = []; E.endTurn(S);
check('fraîche : pas de dégât au QG', S.hq.en, 12);
S.plan = []; E.endTurn(S);
check('2e tour : le fantassin frappe le QG', S.hq.en, 10);

// blindage : 3 d'attaque contre blindage 2 = 1 dégât ; l'Antichar perce
S = mk(); S.plan = []; const tank = E.deploy(S, 'en', 1, 'panzer'); tank.fresh = false;
const g = E.deploy(S, 'me', 1, 'bazooka'); g.fresh = false;
S.hand = []; E.endTurn(S);
check('l’Antichar ignore le blindage (6-3)', tank.hp, 3);

// ordre ciblé et fumigène
S = mk(); S.plan = []; const f = E.deploy(S, 'en', 0, 'rifle'); S.hand = ['artillery', 'smoke']; S.supply = 3;
check('artillerie ciblable', E.targetsFor(S, 'artillery').length, 1);
E.playCard(S, 0, { uid: f.uid });
check('soldat tué (4 dégâts)', E.units(S, 'en').length, 0);
const f2 = E.deploy(S, 'en', 2, 'gren'); f2.fresh = false; S.hand = ['smoke'];
E.playCard(S, 0, { lane: 2 }); E.endTurn(S);
check('fumigène : le QG ne subit rien', S.hq.me, 30);

// victoire : QG ennemi à 1 PV, une unité non-fraîche en ligne libre
S = mk(); S.plan = []; S.hq.en = 1; const w = E.deploy(S, 'me', 0, 'inf'); w.fresh = false; S.hand = [];
E.endTurn(S); check('victoire', S.over, 'win');
// plan : les niveaux avancés annoncent des arrivées
S = mk(3); check('boss : char lourd pré-déployé', E.units(S, 'en').some(u => u.name === 'Char lourd'), true);

// objectifs : tenir N tours, éliminer N unités
const base = { deck: E.START_DECK.slice(), hq: 30, hqMax: 30, officers: [] };
S = E.newBattle(base, () => 0.5, E.battleCfg({ type: 'battle', levelIdx: 0, layer: 1, obj: { type: 'hold', n: 3 } }));
check('tenir : QG ennemi hors d’atteinte', S.hq.en > 1000, true);
for (let i = 0; i < 3; i++) { S.plan = []; E.endTurn(S); }
check('tenir 3 tours = victoire', S.over, 'win');
S = E.newBattle(base, () => 0.5, E.battleCfg({ type: 'battle', levelIdx: 0, layer: 1, obj: { type: 'kills', n: 2 } }));
S.plan = []; S.hand = ['artillery', 'artillery']; S.supply = 4;
const k1 = E.deploy(S, 'en', 0, 'rifle'), k2 = E.deploy(S, 'en', 1, 'rifle');
E.playCard(S, 0, { uid: k1.uid }); check('1 unité éliminée, pas fini', S.over, null);
E.playCard(S, 0, { uid: k2.uid }); check('2 unités éliminées = victoire', S.over, 'win');
// carte : toutes les cases sont accessibles et chaque étape a une suite
for (let k = 0; k < 500; k++) {
  const L = E.genMap();
  L.forEach((layer, l) => layer.forEach((n, j) => {
    if (l < L.length - 1 && !n.next.length) { bad++; console.log('ÉCHEC étape sans suite', n.id); }
    if (l > 0 && !L[l - 1].some(p => p.next.includes(j))) { bad++; console.log('ÉCHEC étape inaccessible', n.id); }
  }));
  if (L[4][0].type !== 'boss' || L[8][0].type !== 'boss') { bad++; console.log('ÉCHEC boss absents'); }
}
console.log(bad ? bad + ' échec(s)' : 'tests OK');
process.exit(bad ? 1 : 0);
