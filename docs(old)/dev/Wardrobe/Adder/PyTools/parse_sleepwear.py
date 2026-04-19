# -*- coding: utf-8 -*-
import json
from pathlib import Path

base = Path('1Developer/Wardrobe/Prompts/12 - Sleepwear (Done)')
files = sorted(base.glob('*.md'))
all_items = []
store_ids = {'storeClothingA': [], 'storeClothingB': [], 'storeLingerieA': [], 'storeLingerieB': [], 'storeClothingC': []}
seen_ids = set()

for f in files:
    try:
        text = f.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        text = f.read_text(encoding='cp1252')
    pos = 0
    while True:
        start = text.find('"id": "sleep_', pos)
        if start == -1:
            break
        obj_start = text.rfind('{', 0, start)
        if obj_start == -1 or start - obj_start > 80:
            pos = start + 1
            continue
        depth = 0
        end = -1
        for i in range(obj_start, min(obj_start + 1200, len(text))):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    end = i
                    break
        if end == -1:
            pos = start + 1
            continue
        snippet = text[obj_start:end + 1]
        try:
            obj = json.loads(snippet)
            if isinstance(obj, dict) and obj.get('slot') == 'sleepwear' and obj.get('id', '').startswith('sleep_'):
                obj.pop('reqHeelsSkill', None)
                oid = obj['id']
                if oid in seen_ids:
                    pos = end + 1
                    continue
                seen_ids.add(oid)
                store = obj.get('store', '')
                if store in store_ids:
                    store_ids[store].append(oid)
                all_items.append(obj)
            else:
                for v in obj.values():
                    if isinstance(v, dict) and v.get('slot') == 'sleepwear' and v.get('id', '').startswith('sleep_'):
                        v.pop('reqHeelsSkill', None)
                        oid = v['id']
                        if oid in seen_ids:
                            break
                        seen_ids.add(oid)
                        store = v.get('store', '')
                        if store in store_ids:
                            store_ids[store].append(oid)
                        all_items.append(v)
                        break
        except json.JSONDecodeError:
            pass
        pos = end + 1

print('Total sleepwear:', len(all_items))
for s, ids in store_ids.items():
    print(s, len(ids))

def js(obj):
    return json.dumps(obj, ensure_ascii=False)

out = []
for i, o in enumerate(all_items):
    out.append('  ' + js(o) + (',' if i < len(all_items) - 1 else ''))
Path('sleepwear_db_lines.txt').write_text('\n'.join(out), encoding='utf-8')
for store, ids in store_ids.items():
    Path(f'sleepwear_ids_{store}.txt').write_text('\n'.join(ids), encoding='utf-8')
print('Wrote sleepwear_db_lines.txt and sleepwear_ids_*.txt')
