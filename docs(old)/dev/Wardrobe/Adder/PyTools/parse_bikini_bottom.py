# -*- coding: utf-8 -*-
import json
from pathlib import Path

base = Path('1Developer/Wardrobe/Prompts/15 - BikiniBottom (Done)')
files = sorted(base.glob('*.md'))
all_items = []
store_ids = {'storeSwim': [], 'storeClothingA': []}
seen_ids = set()

for f in files:
    try:
        text = f.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        text = f.read_text(encoding='cp1252')
    pos = 0
    while True:
        start = text.find('"id": "bikini_bot_', pos)
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
            if isinstance(obj, dict) and obj.get('slot') == 'bikiniBottom' and obj.get('id', '').startswith('bikini_bot_'):
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
                    if isinstance(v, dict) and v.get('slot') == 'bikiniBottom' and v.get('id', '').startswith('bikini_bot_'):
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

print('Total bikini bottoms:', len(all_items))
for s, ids in store_ids.items():
    print(s, len(ids))

def js(obj):
    return json.dumps(obj, ensure_ascii=False)

out = []
for i, o in enumerate(all_items):
    out.append('  ' + js(o) + (',' if i < len(all_items) - 1 else ''))
Path('bikini_bottom_db_lines.txt').write_text('\n'.join(out), encoding='utf-8')
for store, ids in store_ids.items():
    Path(f'bikini_bottom_ids_{store}.txt').write_text('\n'.join(ids), encoding='utf-8')
print('Wrote bikini_bottom_db_lines.txt and bikini_bottom_ids_*.txt')
