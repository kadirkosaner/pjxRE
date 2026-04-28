import re
from pathlib import Path
from collections import defaultdict

root = Path('c:/Users/devne/projects/pjx')
passages = root / 'passages'
out = root / '1Developer' / 'tips-random-event-flagleri.md'

# Files likely related to random/encounter/event content
file_keywords = [
    'event', 'encounter', 'jog', 'park', 'meetup', 'talkdatabase', 'bush', 'work_event'
]

# capture <<set $flags.xxx = true>> and similar
flag_assign_re = re.compile(r"<<\s*set\s+(\$flags\.[A-Za-z_][A-Za-z0-9_]*)\s*(?:=|to)\s*([^>]+)>>", re.IGNORECASE)
# capture other progression-y story vars
var_assign_re = re.compile(r"<<\s*set\s+(\$[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?)\s*(?:=|to)\s*([^>]+)>>", re.IGNORECASE)
# random gate hints
random_re = re.compile(r"random\(|State\.random\(", re.IGNORECASE)

special_hits = defaultdict(list)
var_hits = defaultdict(list)
random_files = set()

for f in passages.rglob('*.twee'):
    rel = str(f.relative_to(root)).replace('\\','/')
    rel_low = rel.lower()

    if not any(k in rel_low for k in file_keywords):
        continue

    try:
        lines = f.read_text(encoding='utf-8', errors='ignore').splitlines()
    except Exception:
        continue

    has_random = False
    for i, line in enumerate(lines, start=1):
        if random_re.search(line):
            has_random = True

        m = flag_assign_re.search(line)
        if m:
            flag = m.group(1)
            expr = m.group(2).strip()
            special_hits[flag].append((rel, i, expr))

        m2 = var_assign_re.search(line)
        if m2:
            var = m2.group(1)
            expr = m2.group(2).strip()
            # keep only event-relevant vars, not generic stats/time vars
            low = var.lower()
            if low.startswith('$flags.'):
                continue
            if any(t in low for t in ['quest', 'discovered', 'known', 'firstmet', 'unlocked', 'met', 'event', 'encounter']):
                var_hits[var].append((rel, i, expr))

    if has_random:
        random_files.add(rel)

# manual highlight for your example flow
highlight_files = [
    'passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogTogether.twee',
    'passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogInviteEvent.twee',
    'passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogMeetMiaEvent.twee'
]

lines = []
lines.append('# Tips Icin Random Event Flagleri')
lines.append('')
lines.append('Odak: quest sonrasi acilan randomize event/encounter akislari (Mia tanisma, park jog vb.)')
lines.append('')
lines.append(f'Taranan random/event odakli dosya: **{len(special_hits) + len(var_hits)} flag adayina ait referans**')
lines.append('')

lines.append('## 1) Mia + Park Jog akisi (oncelikli takip)')
lines.append('')
lines.append('- ` $flags.lilyJogInviteSeen` -> jog daveti sahnesi goruldu')
lines.append('- ` $flags.lilyJogUnlocked` -> Lily ile birlikte jog aksiyonu acildi')
lines.append('- ` $flags.lilyJogMiaMeetTriggered` -> Mia tanisma eventi tetiklendi')
lines.append('- ` $characters.neighborMia.known` -> Mia artik taniniyor')
lines.append('- ` $characters.neighborMia.firstMet` -> ilk tanisma tarihi')
lines.append('- ` $flags.lilyGymQuestOffered` -> jog sonrasi gym quest teklifi verildi')
lines.append('')
lines.append('Referans dosyalar:')
for hf in highlight_files:
    lines.append(f'- `{hf}`')

lines.append('')
lines.append('## 2) Random/Event flag adaylari (`$flags.*`)')
lines.append('')
if not special_hits:
    lines.append('- _Bulunamadi_')
else:
    for flag in sorted(special_hits.keys(), key=str.lower):
        uses = special_hits[flag]
        sample = ', '.join(f'`{u[0]}`' for u in uses[:2])
        lines.append(f'- `{flag}` - {sample}')

lines.append('')
lines.append('## 3) Event progression icin yardimci story varlar')
lines.append('')
if not var_hits:
    lines.append('- _Bulunamadi_')
else:
    for var in sorted(var_hits.keys(), key=str.lower):
        uses = var_hits[var]
        sample = ', '.join(f'`{u[0]}`' for u in uses[:2])
        lines.append(f'- `{var}` - {sample}')

lines.append('')
lines.append('## 4) Random gate olan dosyalar (kontrol listesi)')
lines.append('')
for rf in sorted(random_files):
    lines.append(f'- `{rf}`')

out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote: {out}')
print(f'$flags.*: {len(special_hits)} | helper vars: {len(var_hits)} | random files: {len(random_files)}')
