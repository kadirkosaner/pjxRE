# -*- coding: utf-8 -*-
import json
from pathlib import Path

base = Path('1Developer/Wardrobe/Prompts/05 - Shoes (Done)')
files = sorted(base.glob('*.md'))
all_items = []
store_ids = {'storeShoeA': [], 'storeShoeB': [], 'storeSports': []}
seen_ids = set()

for f in files:
    text = f.read_text(encoding='utf-8')
    pos = 0
    while True:
        start = text.find('"id": "shoes_', pos)
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
            if isinstance(obj, dict) and obj.get('slot') == 'shoes' and obj.get('id', '').startswith('shoes_'):
                obj.pop('reqHeelsSkill', None)
                oid = obj['id']
                if oid in seen_ids:
                    suffix = {'storeShoeB': '_stiletto', 'storeSports': '_sports'}.get(obj.get('store'), '_alt')
                    obj['id'] = oid + suffix
                seen_ids.add(obj['id'])
                store = obj.get('store', '')
                if store in store_ids:
                    store_ids[store].append(obj['id'])
                all_items.append(obj)
            else:
                for v in obj.values():
                    if isinstance(v, dict) and v.get('slot') == 'shoes' and v.get('id', '').startswith('shoes_'):
                        v.pop('reqHeelsSkill', None)
                        oid = v['id']
                        if oid in seen_ids:
                            suffix = {'storeShoeB': '_stiletto', 'storeSports': '_sports'}.get(v.get('store'), '_alt')
                            v['id'] = oid + suffix
                        seen_ids.add(v['id'])
                        store = v.get('store', '')
                        if store in store_ids:
                            store_ids[store].append(v['id'])
                        all_items.append(v)
                        break
        except json.JSONDecodeError:
            pass
        pos = end + 1

print('Total:', len(all_items))
for s, ids in store_ids.items():
    print(s, len(ids))

def js(obj):
    return json.dumps(obj, ensure_ascii=False)

out = []
for i, o in enumerate(all_items):
    out.append('  ' + js(o) + (',' if i < len(all_items) - 1 else ''))
Path('shoes_db_lines.txt').write_text('\n'.join(out), encoding='utf-8')

for store, ids in store_ids.items():
    Path(f'shoes_ids_{store}.txt').write_text('\n'.join(ids), encoding='utf-8')

print('Wrote shoes_db_lines.txt and shoes_ids_*.txt')
