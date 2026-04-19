# -*- coding: utf-8 -*-
import json
from pathlib import Path

base = Path('1Developer/Wardrobe/Prompts/07 - Jewellery (Done)')
files = sorted(base.glob('*.md'))
all_items = []
by_silhouette = {'necklace': [], 'earrings': [], 'bracelet': [], 'ring': []}
store_ids = []

for f in files:
    text = f.read_text(encoding='utf-8')
    pos = 0
    while True:
        start = text.find('"id": "jewel_', pos)
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
            if isinstance(obj, dict) and obj.get('slot') == 'jewelry' and obj.get('id', '').startswith('jewel_'):
                obj.pop('reqHeelsSkill', None)
                store_ids.append(obj['id'])
                all_items.append(obj)
                sil = obj.get('silhouette', '')
                if sil in by_silhouette:
                    by_silhouette[sil].append(obj)
            else:
                for v in obj.values():
                    if isinstance(v, dict) and v.get('slot') == 'jewelry' and v.get('id', '').startswith('jewel_'):
                        v.pop('reqHeelsSkill', None)
                        store_ids.append(v['id'])
                        all_items.append(v)
                        sil = v.get('silhouette', '')
                        if sil in by_silhouette:
                            by_silhouette[sil].append(v)
                        break
        except json.JSONDecodeError:
            pass
        pos = end + 1

print('Total:', len(all_items))
for sil, items in by_silhouette.items():
    print(sil, len(items))

def js(obj):
    return json.dumps(obj, ensure_ascii=False)

def write_lines(items, path):
    out = []
    for i, o in enumerate(items):
        out.append('  ' + js(o) + (',' if i < len(items) - 1 else ''))
    Path(path).write_text('\n'.join(out), encoding='utf-8')

write_lines(by_silhouette['necklace'], 'jewelry_necklaces_lines.txt')
write_lines(by_silhouette['earrings'], 'jewelry_earrings_lines.txt')
write_lines(by_silhouette['bracelet'], 'jewelry_bracelets_lines.txt')
write_lines(by_silhouette['ring'], 'jewelry_rings_lines.txt')
Path('jewelry_ids_storeJewelry.txt').write_text('\n'.join(store_ids), encoding='utf-8')

print('Wrote jewelry_*_lines.txt and jewelry_ids_storeJewelry.txt')
