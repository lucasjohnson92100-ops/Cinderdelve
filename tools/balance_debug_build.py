import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
hook = ('window.__d = { get state() { return state; }, get p() { return p; }, get g() { return g; }, get mode() { return mode; }, '
        'enemies: function () { return enemies; }, gems: function () { return gems; }, input: input, farmUse: farmUse, useUlt: useUlt, '
        'gen: function (id) { state.survMapTheme = id; genSurvivalArena(); }, '
        'sim: function (dt) { update(dt / 1000); step(dt); }, legGain: legGain, LEGENDS: LEGENDS, setHero: function (id) { state.variant = id; heroTraitInit(); }, HERO_TRAITS: HERO_TRAITS, spawnSurvivalBoss: spawnSurvivalBoss, survSkillTier: survSkillTier, loop: loop, setHeroFull: function (id) { var vi = SURV_VARIANTS[id]; state.variant = id; if (HERO.setAnimal) HERO.setAnimal(vi.base, FARM.frames(id)); heroTraitInit(); }, mk: mk, push: function (e) { enemies.push(e); }, openLevelUp: openLevelUp, SURV_VARIANTS: SURV_VARIANTS, unlockAlert: unlockAlert, view: view, get lastDir() { return lastDir; } };')
assert s.count('/*DBG*/') == 1
open(dst, 'w', encoding='utf-8').write(s.replace('/*DBG*/', hook))
