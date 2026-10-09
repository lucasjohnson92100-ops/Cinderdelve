import json,sys,statistics as st
rows=[json.loads(l) for l in open(sys.argv[1]) if l.startswith('{')]
agg={}
for r in rows:
    for c,w in r['W'].items():
        c=int(c)
        if w['sec']<20: continue
        agg.setdefault(c,[]).append(w)
print('parties',len(rows),'| morts',sum(r['dead'] for r in rows))
print('vague | degats | duree | ennemis max | tues | niveau | duree boss')
for c in sorted(agg):
    ws=agg[c]; f=lambda k: round(st.mean(w[k] for w in ws))
    print(f'  {c+1}   |  {f("dmg"):4d}  | {f("sec"):4d}s | {f("maxEn"):3d} | {f("kills"):5d} | {f("lvl"):3d} | {f("bossSec"):3d}s')
