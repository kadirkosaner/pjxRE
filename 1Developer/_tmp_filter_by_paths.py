import re
from pathlib import Path

root = Path('c:/Users/devne/projects/pjx')
inp = root / '1Developer' / 'all-flags.md'
out = root / '1Developer' / 'tips-uygun-flagler.md'

content = inp.read_text(encoding='utf-8', errors='ignore').splitlines()
line_re = re.compile(r'^- `([^`]+)`\s+—\s+(.+)$')
path_re = re.compile(r'`([^`]+)`')

progress_paths = [
    'passages/3- interactions/',
    'passages/4 - actions/',
    'passages/5 - questsystem/',
    'passages/2 - locations/'
]
exclude_paths = [
    'passages/0 - system/widgets/',
    'passages/0 - system/migrations/',
    'passages/0 - system/init/variablesbase.twee'
]

exclude_name_tokens = [
    '.','$_','debug','ui','widget','modal','warning','cooldown','cache','tmp','temp',
    'hour','minute','weekday','weekend','alarm','money','energy','health','hunger',
    'thirst','hygiene','mood','arousal','wardrobe','outfit','makeup','phone','notification'
]

strong_name_tokens = [
    'quest','story','ending','route','chapter','mission','event','met','meet',
    'seen','unlock','unlocked','intro','completed','done','date','talk'
]

selected = []
review = []

for ln in content:
    m = line_re.match(ln)
    if not m:
        continue
    flag = m.group(1)
    refs_part = m.group(2)

    if any(tok in flag.lower() for tok in exclude_name_tokens):
        continue

    refs = [p.lower() for p in path_re.findall(refs_part)]
    if not refs:
        continue

    has_progress_ref = any(any(pp in r for pp in progress_paths) for r in refs)
    only_excluded = all(any(ep in r for ep in exclude_paths) for r in refs)

    if only_excluded:
        continue

    score = 0
    if has_progress_ref:
        score += 2
    if any(tok in flag.lower() for tok in strong_name_tokens):
        score += 2
    if len(refs) >= 3:
        score += 1

    if score >= 3:
        selected.append((flag, refs))
    elif score == 2:
        review.append((flag, refs))

# uniq by flag
seen = set()
selected_u = []
for f, r in sorted(selected, key=lambda x: x[0].lower()):
    if f not in seen:
        seen.add(f)
        selected_u.append((f, r))

review_u = []
for f, r in sorted(review, key=lambda x: x[0].lower()):
    if f not in seen:
        review_u.append((f, r))

lines = []
lines.append('# Tips Icin Uygun Flagler (Ayiklanmis)')
lines.append('')
lines.append('Kaynak: `1Developer/all-flags.md`')
lines.append('Filtre: gameplay dosyalarinda gecen ve sistem/UI agirlikli olmayan flagler')
lines.append('')
lines.append(f'Kesin aday: **{len(selected_u)}**')
lines.append(f'Gozden gecirilecek aday: **{len(review_u)}**')
lines.append('')
lines.append('## 1) Kesin Aday')
lines.append('')
if not selected_u:
    lines.append('- _Bulunamadi_')
else:
    for f, refs in selected_u:
        sample = ', '.join(f'`{x}`' for x in refs[:2])
        lines.append(f'- `{f}` - {sample}')

lines.append('')
lines.append('## 2) Gozden Gecirilecek')
lines.append('')
if not review_u:
    lines.append('- _Bulunamadi_')
else:
    for f, refs in review_u:
        sample = ', '.join(f'`{x}`' for x in refs[:2])
        lines.append(f'- `{f}` - {sample}')

out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote: {out}')
print(f'Selected: {len(selected_u)} | Review: {len(review_u)}')
