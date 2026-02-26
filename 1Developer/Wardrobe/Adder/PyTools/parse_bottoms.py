# -*- coding: utf-8 -*-
import re, json
from pathlib import Path

base = Path('1Developer/Wardrobe/Prompts/02 - Bottoms (Done)')
files = sorted(base.glob('*.md'))
all_items = []
store_ids = {'storeClothingA': [], 'storeClothingB': [], 'storeClothingC': [], 'storeSports': []}
seen_ids = set()

for f in files:
    text = f.read_text(encoding='utf-8')
    # Find each inner object: {"id": "bottom_... or {\n"id":
    pos = 0
    while True:
        start = text.find('"id": "bottom_', pos)
        if start == -1:
            break
        # Find the opening brace of this object (go back to find {)
        obj_start = text.rfind('{', 0, start)
        if obj_start == -1 or start - obj_start > 50:
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
            if isinstance(obj, dict) and obj.get('slot') == 'bottom' and obj.get('id', '').startswith('bottom_'):
                obj.pop('reqHeelsSkill', None)
                oid = obj['id']
                if oid in seen_ids:
                    suffix = {'storeClothingB': '_vera', 'storeClothingC': '_fifth', 'storeSports': '_sports'}.get(obj.get('store'), '_alt')
                    obj['id'] = oid + suffix
                seen_ids.add(obj['id'])
                store = obj.get('store', '')
                if store in store_ids:
                    store_ids[store].append(obj['id'])
                all_items.append(obj)
        except json.JSONDecodeError:
            pass
        pos = end + 1

print('Total:', len(all_items))
for s, ids in store_ids.items():
    print(s, len(ids))

# Output JS array entries (one per line) for wardrobeBottoms
def js(obj):
    return json.dumps(obj, ensure_ascii=False)

# Write to file for copy-paste (last line no comma)
out = []
for i, o in enumerate(all_items):
    out.append('  ' + js(o) + (',' if i < len(all_items) - 1 else ''))
Path('bottoms_db_lines.txt').write_text('\n'.join(out), encoding='utf-8')

# Write store ID lists
for store, ids in store_ids.items():
    Path(f'bottoms_ids_{store}.txt').write_text('\n'.join(ids), encoding='utf-8')

print('Wrote bottoms_db_lines.txt and bottoms_ids_*.txt')