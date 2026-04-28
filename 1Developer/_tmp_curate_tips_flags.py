import re
from pathlib import Path

root = Path('c:/Users/devne/projects/pjx')
inp = root / '1Developer' / 'all-flags.md'
out = root / '1Developer' / 'tips-uygun-flagler.md'

line_re = re.compile(r'^- `([^`]+)`\s+—\s+(.+)$')
path_re = re.compile(r'`([^`]+)`')

def token_match(name_lower, token):
    # camelCase/snake-safe boundary-ish check
    return re.search(rf'(^|_|\b){re.escape(token)}($|_|\b)', name_lower) is not None

rows = []
for ln in inp.read_text(encoding='utf-8', errors='ignore').splitlines():
    m = line_re.match(ln)
    if not m:
        continue
    flag = m.group(1)
    refs = [p for p in path_re.findall(m.group(2))]
    rows.append((flag, refs))

by_flag = {}
for flag, refs in rows:
    if '.' in flag:
        continue
    if flag not in by_flag:
        by_flag[flag] = set()
    by_flag[flag].update(refs)

negative_patterns = [
    'debug','ui','widget','modal','warning','cooldown','cache','tmp','temp','return','origin','context','entry','selected','picker','memory',
    'hospitaldebt','admission','collapse','energy','health','hunger','thirst','hygiene','mood','arousal','money','bank','alarm','phone',
    'mirror','weekly','hour','minute','weekday','weekend','rightbar','ambient','metabolic'
]

priority = []
secondary = []

for flag, refs in sorted(by_flag.items(), key=lambda x: x[0].lower()):
    low = flag.lower()
    if low.startswith('$_'):
        continue
    if any(n in low for n in negative_patterns):
        continue

    gameplay_ref = any(
        ('passages/5 - QuestSystem/' in r) or
        ('passages/3- Interactions/' in r) or
        ('passages/4 - Actions/' in r) or
        ('passages/2 - Locations/' in r)
        for r in refs
    )

    is_priority = (
        ('quest' in low) or ('discovered' in low) or ('ending' in low) or ('unlocked' in low) or
        ('completed' in low) or ('_done' in low) or ('done_' in low) or ('intro' in low) or ('first' in low)
    )

    # word-like checks for short tokens
    if token_match(low, 'met') or token_match(low, 'seen'):
        is_priority = True

    if not is_priority and not gameplay_ref:
        continue

    item = (flag, sorted(refs))
    if is_priority:
        priority.append(item)
    else:
        secondary.append(item)

lines = []
lines.append('# Tips Icin Uygun Flagler (Nihai Ayiklama)')
lines.append('')
lines.append('Kaynak: `1Developer/all-flags.md` (base flaglar)')
lines.append('Amac: oyuncuya ilerleme/icerik durumunu gostermek icin uygun flagler')
lines.append('')
lines.append(f'Birincil liste: **{len(priority)}**')
lines.append(f'Ikincil liste: **{len(secondary)}**')
lines.append('')
lines.append('## 1) Birincil (Tips modalda direkt kullan)')
lines.append('')
for flag, refs in priority:
    sample = ', '.join(f'`{r}`' for r in refs[:2])
    lines.append(f'- `{flag}` - {sample}')

lines.append('')
lines.append('## 2) Ikincil (Ihtiyaca gore ekle)')
lines.append('')
for flag, refs in secondary:
    sample = ', '.join(f'`{r}`' for r in refs[:2])
    lines.append(f'- `{flag}` - {sample}')

lines.append('')
lines.append('## 3) Onerilen tips kategorileri')
lines.append('')
lines.append('- Quest progress: `quest*`, `$quests`, `$questState`, `$currentQuest`')
lines.append('- Discoveries: `discovered*`')
lines.append('- Character/contact unlock: `*met*`, `*unlocked*`, `$phoneContactsUnlocked`')
lines.append('- Story milestones: `*intro*`, `*first*`, `*completed*`, `*ending*`')

out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote: {out}')
print(f'Priority: {len(priority)} | Secondary: {len(secondary)}')
