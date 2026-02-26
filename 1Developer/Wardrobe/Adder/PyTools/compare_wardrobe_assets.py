# -*- coding: utf-8 -*-
"""Compare wardrobe DB image paths with assets/content/clothing (excluding bottom/bottoms)."""
import re
from pathlib import Path

wardrobe_dir = Path("passages/0 - System/WardrobeSys")
assets_base = Path("assets/content/clothing")
EXCLUDE_CATS = {"bottom", "bottoms"}  # exclude from both missing and extra
batch_prompts_dir = Path("1Developer/Wardrobe/Prompts")

# 1) Collect all image paths from DB (excluding bottom/bottoms)
db_paths = set()
for f in wardrobe_dir.glob("wardrobe*.twee"):
    if "Config" in f.name or "PlayerState" in f.name or "Special" in f.name:
        continue
    text = f.read_text(encoding="utf-8")
    for m in re.finditer(r'(?:"image"|image)\s*:\s*"(assets/content/clothing/[^"]+\.webp)"', text):
        path = m.group(1)
        rel = path.replace("assets/content/clothing/", "")
        parts = rel.split("/")
        if len(parts) >= 2:
            cat, sub, fname = parts[0], parts[1], parts[-1]
        else:
            cat, sub, fname = parts[0], "", parts[0]
        if cat.lower() in EXCLUDE_CATS:
            continue
        db_paths.add((cat, sub, fname))

# 2) Walk assets
asset_paths = set()
if assets_base.exists():
    for cat_dir in assets_base.iterdir():
        if not cat_dir.is_dir() or cat_dir.name.lower() in EXCLUDE_CATS:
            continue
        cat = cat_dir.name
        for sub_dir in cat_dir.iterdir():
            if sub_dir.is_dir():
                for f in sub_dir.glob("*.webp"):
                    asset_paths.add((cat, sub_dir.name, f.name))
            elif sub_dir.suffix == ".webp":
                asset_paths.add((cat, "", sub_dir.name))

def norm_cat_for_match(cat):
    c = cat.lower()
    if c == "coat":
        return "coats"
    return c

def coat_fname_variants(fname):
    """coats/FastBreak: coatX.webp ve coatsX.webp aynı sayılır."""
    if fname.startswith("coats") and len(fname) > 5:
        return [fname, "coat" + fname[5:]]
    if fname.startswith("coat") and not fname.startswith("coats") and len(fname) > 4:
        return [fname, "coats" + fname[4:]]
    return [fname]

# garter/socks/sleepwear: PascalCase vs snake_case, "IntimateSecrets" vs "Intimate Secrets"
LOOSE_MATCH_CATS = {"garter", "socks", "sleepwear"}
def norm_sub(s):
    return s.lower().replace(" ", "") if s else ""
def norm_fname_loose(f):
    return f.lower().replace("_", "").replace(".webp", "")

# Garter batch'lerden eklenecek sayılıyor; bu path'leri raporda EKSİK/FAZLA gösterme
batch_garter_keys = set()
for batch_dir in [batch_prompts_dir / "11 - Garter (Done)"]:
    if not batch_dir.exists():
        continue
    for bf in batch_dir.glob("*.md"):
        for m in re.finditer(r'"image":\s*"(assets/content/clothing/garter/[^"]+\.webp)"', bf.read_text(encoding="utf-8")):
            rel = m.group(1).replace("assets/content/clothing/", "")
            parts = rel.split("/")
            if len(parts) >= 3:
                cat, sub, fname = parts[0], parts[1], parts[-1]
                batch_garter_keys.add(("garter", norm_sub(sub), fname))
                batch_garter_keys.add(("garter", norm_sub(sub), norm_fname_loose(fname)))

def asset_key(cat, sub, fname):
    return (norm_cat_for_match(cat), sub.lower(), fname)

asset_lookup = set()
asset_norm_lookup = set()
for (cat, sub, fname) in asset_paths:
    ncat = norm_cat_for_match(cat)
    key = (ncat, sub.lower(), fname)
    asset_lookup.add(key)
    if ncat == "coats":
        for v in coat_fname_variants(fname):
            asset_lookup.add((ncat, sub.lower(), v))
    if ncat in LOOSE_MATCH_CATS:
        asset_norm_lookup.add((ncat, norm_sub(sub), norm_fname_loose(fname)))

db_lookup = set()
db_norm_lookup = set()
for (cat, sub, fname) in db_paths:
    ncat = norm_cat_for_match(cat)
    key = (ncat, sub.lower(), fname)
    db_lookup.add(key)
    if ncat == "coats":
        for v in coat_fname_variants(fname):
            db_lookup.add((ncat, sub.lower(), v))
    if ncat in LOOSE_MATCH_CATS:
        db_norm_lookup.add((ncat, norm_sub(sub), norm_fname_loose(fname)))

missing = []
for (cat, sub, fname) in db_paths:
    ncat = norm_cat_for_match(cat)
    if ncat == "garter" and ((ncat, norm_sub(sub), fname) in batch_garter_keys or (ncat, norm_sub(sub), norm_fname_loose(fname)) in batch_garter_keys):
        continue
    key = asset_key(cat, sub, fname)
    if key not in asset_lookup:
        if ncat == "coats":
            if not any((ncat, sub.lower(), v) in asset_lookup for v in coat_fname_variants(fname)):
                missing.append((cat, sub, fname))
        elif ncat in LOOSE_MATCH_CATS and (ncat, norm_sub(sub), norm_fname_loose(fname)) in asset_norm_lookup:
            continue
        elif cat.lower() == "bags" and sub and (norm_cat_for_match("bags"), "", fname) in asset_lookup:
            continue
        else:
            missing.append((cat, sub, fname))

extra = []
for (cat, sub, fname) in asset_paths:
    ncat = norm_cat_for_match(cat)
    if ncat == "garter" and ((ncat, norm_sub(sub), fname) in batch_garter_keys or (ncat, norm_sub(sub), norm_fname_loose(fname)) in batch_garter_keys):
        continue
    key = (ncat, sub.lower(), fname)
    if key not in db_lookup:
        if ncat == "coats" and any((ncat, sub.lower(), v) in db_lookup for v in coat_fname_variants(fname)):
            continue
        if ncat in LOOSE_MATCH_CATS and (ncat, norm_sub(sub), norm_fname_loose(fname)) in db_norm_lookup:
            continue
        extra.append((cat, sub, fname))

def group_by_cat(items):
    d = {}
    for (cat, sub, fname) in sorted(items):
        key = cat + ("/" + sub if sub else "")
        d.setdefault(key, []).append(fname)
    return d

missing_g = group_by_cat(missing)
extra_g = group_by_cat(extra)

out = []
out.append("# Wardrobe DB vs Assets – Eksik ve Fazla Görseller (bottom hariç)\n")
out.append("**Özet:** `bottom` / `bottoms` kategorisi bu rapora dahil değil. Diğer tüm kategoriler karşılaştırıldı.\n")
out.append(f"- **EKSİK:** {len(missing)} dosya")
out.append(f"- **FAZLA:** {len(extra)} dosya\n")
out.append("---\n")
out.append("## EKSİK (DB'de var, asset klasöründe yok)\n")
if missing_g:
    for key in sorted(missing_g.keys()):
        out.append(f"\n### {key}\n")
        for f in sorted(missing_g[key]):
            out.append(f"- `{f}`")
else:
    out.append("\n*Yok.*")
out.append("\n\n## FAZLA (Asset klasöründe var, DB'de yok)\n")
if extra_g:
    for key in sorted(extra_g.keys()):
        out.append(f"\n### {key}\n")
        for f in sorted(extra_g[key]):
            out.append(f"- `{f}`")
else:
    out.append("\n*Yok.*")

Path("1Developer/Wardrobe/AssetDbComparison.md").write_text("\n".join(out), encoding="utf-8")
print("Written 1Developer/Wardrobe/AssetDbComparison.md (bottom excluded)")
print("Missing:", len(missing), "| Extra:", len(extra))
