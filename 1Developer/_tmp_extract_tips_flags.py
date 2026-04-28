import re
from pathlib import Path
from collections import defaultdict

root = Path('c:/Users/devne/projects/pjx')
passages = root / 'passages'
out = root / '1Developer' / 'tips-uygun-flagler.md'

assign_re = re.compile(r"<<\s*set\s+(\$[A-Za-z_][A-Za-z0-9_]*)\s*(?:=|to)\s*(true|1|'done'|\"done\"|'completed'|\"completed\")\s*>>", re.IGNORECASE)

include_hint_tokens = [
    'quest','story','event','ending','route','chapter','mission','met','meet','seen','unlock','unlocked','intro','first','completed','done',
    'adrian','rachel','lily','nora','mia','ruby','grace','olivia','ava','alex'
]
exclude_tokens = [
    'debug','ui','modal','widget','temp','tmp','warning','cooldown','last','time','hour','minute','weekday','weekend','save','migration','cache',
    'stat','energy','health','hygiene','hunger','thirst','mood','arousal','money','bank','alarm','phone','wardrobe','outfit','makeup'
]

hits = defaultdict(list)

for f in passages.rglob('*.twee'):
    try:
        lines = f.read_text(encoding='utf-8', errors='ignore').splitlines()
    except Exception:
        continue
    rel = str(f.relative_to(root)).replace('\\','/')
    for i, line in enumerate(lines, start=1):
        for m in assign_re.finditer(line):
            flag = m.group(1)
            hits[flag].append((rel, i, m.group(0).strip()))

high, medium, low = [], [], []

for flag, usages in hits.items():
    lowf = flag.lower()
    score = 0

    for t in include_hint_tokens:
        if t in lowf:
            score += 2

    for t in exclude_tokens:
        if t in lowf:
            score -= 2

    for rel, _, _ in usages:
        r = rel.lower()
        if '/5 - questsystem/' in r or '/3- interactions/' in r or '/4 - actions/' in r:
            score += 1
        if '/0 - system/' in r and '/migrations/' in r:
            score -= 2

    if any(x in lowf for x in ['quest_', 'q_', 'ending', 'met', 'unlocked', 'completed', 'done', 'seen']):
        score += 2

    item = (flag, score, usages)
    if score >= 4:
        high.append(item)
    elif score >= 2:
        medium.append(item)
    else:
        low.append(item)

high.sort(key=lambda x: (x[1], x[0].lower()), reverse=True)
medium.sort(key=lambda x: (x[1], x[0].lower()), reverse=True)

lines = []
lines.append('# Tips Icin Uygun Flagler')
lines.append('')
lines.append('Bu liste, <<set $flag = true>> ve 1 atamalari taranarak olusturuldu.')
lines.append('Tips modal icin once Yuksek Oncelik listesini kullanman onerilir.')
lines.append('')
lines.append(f'Yuksek oncelik: **{len(high)}**')
lines.append(f'Orta oncelik: **{len(medium)}**')
lines.append(f'Taranan toplam progression atamasi yapan flag: **{len(hits)}**')
lines.append('')

lines.append('## 1) Yuksek Oncelik (tips icin direkt uygun)')
lines.append('')
if not high:
    lines.append('- _Bulunamadi_')
else:
    for flag, score, usages in high:
        ref = usages[0]
        lines.append(f'- `{flag}` (score: {score}) - `{ref[0]}`')

lines.append('')
lines.append('## 2) Orta Oncelik (manuel gozden gecir)')
lines.append('')
if not medium:
    lines.append('- _Bulunamadi_')
else:
    for flag, score, usages in medium:
        ref = usages[0]
        lines.append(f'- `{flag}` (score: {score}) - `{ref[0]}`')

lines.append('')
lines.append('## 3) Notlar')
lines.append('')
lines.append('- `$_` ile baslayan gecici flagler bu listede yoktur.')
lines.append('- Property yazimlari (`$x.y`) degil, ana flag adlari listelenmistir.')
lines.append('- Sonraki adimda kategorilere ayirip tips modal data yapisina cevirebiliriz.')

out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote: {out}')
print(f'High: {len(high)} | Medium: {len(medium)} | Total: {len(hits)}')
