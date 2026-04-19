"""One-off: dump setup.clothingData from wardrobe*.twee to docs/wardrobe-database-dump.md"""
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WARDROBE_DIR = ROOT / "passages/0 - System/WardrobeSys"
OUT = ROOT / "docs" / "wardrobe-database-dump.md"


def _quote_js_style_keys(s: str) -> str:
    """Twee bazı satırlarda `{ id: \"x\"` gibi tırnaksız anahtar kullanıyor; json için anahtarları tırnakla."""
    return re.sub(r"(?<=[{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'"\1":', s)


def extract_arrays(text: str):
    # Greedy: son `]>>` e kadar (içerikte `]` string dışı nadirdir)
    for m in re.finditer(
        r"setup\.clothingData\.([a-zA-Z0-9_]+)\s*=\s*(\[[\s\S]*\])\s*>>",
        text,
    ):
        key, arr_s = m.group(1), m.group(2)
        arr_s = _quote_js_style_keys(arr_s)
        try:
            arr = json.loads(arr_s)
        except json.JSONDecodeError as e:
            print("JSONDecodeError", key, e)
            continue
        yield key, arr


def fmt_val(v):
    if v is None:
        return ""
    if isinstance(v, (list, dict)):
        return json.dumps(v, ensure_ascii=False)
    return str(v)


def main():
    files = sorted(WARDROBE_DIR.glob("wardrobe*.twee"))
    all_rows = []
    for fp in files:
        text = fp.read_text(encoding="utf-8")
        for cat, arr in extract_arrays(text):
            for item in arr:
                if not isinstance(item, dict):
                    continue
                row = dict(item)
                row["_source"] = fp.name
                row["_category"] = cat
                all_rows.append(row)

    by_cat: dict[str, list] = defaultdict(list)
    for r in all_rows:
        by_cat[r["_category"]].append(r)

    out = []
    out.append("# Wardrobe veritabanı dökümü")
    out.append("")
    out.append(
        "Otomatik üretildi: `passages/0 - System/WardrobeSys/wardrobe*.twee` içindeki "
        "`setup.clothingData.*` dizilerinden (`scripts/dump_wardrobe_md.py`)."
    )
    out.append("")
    out.append("## Kolon özeti")
    out.append("")
    out.append("- **price**: Mağaza fiyatı")
    out.append(
        "- **baseLooks**, **warmth**, **sexinessScore**, **exposureLevel**, **durability**: "
        "Eşya istatistikleri"
    )
    out.append(
        "- **reqCorruption**, **reqConfidence**, **reqExhibitionism**, **reqHeelsSkill**: "
        "Giyim önkoşulları"
    )
    out.append("- **shopAvailable** / **startOwned**: Mağaza / başlangıç sahipliği")
    out.append("- **npcAppeal**: JSON nesnesi (ör. `{\"elite\": 2}`)")
    out.append("- **_source**: Kaynak `.twee` dosyası")
    out.append(
        "- **desc**: Tabloda ~160 karakterden uzun metinler kısaltılır (tam metin ilgili `.twee` satırında)."
    )
    out.append("")

    subcols = [
        "id",
        "name",
        "brand",
        "store",
        "price",
        "quality",
        "slot",
        "silhouette",
        "baseLooks",
        "warmth",
        "sexinessScore",
        "exposureLevel",
        "durability",
        "reqCorruption",
        "reqConfidence",
        "reqExhibitionism",
        "reqHeelsSkill",
        "shopAvailable",
        "startOwned",
        "tags",
        "npcAppeal",
        "matchSet",
        "desc",
        "_source",
    ]

    for cat in sorted(by_cat.keys()):
        rows = by_cat[cat]
        out.append(f"## {cat} ({len(rows)} kayıt)")
        out.append("")
        extra_keys = set()
        for row in rows:
            for k in row:
                if k not in ("_category",) and k not in subcols:
                    extra_keys.add(k)
        cols = [c for c in subcols if any(c in row for row in rows)]
        cols.extend(sorted(extra_keys))
        out.append("| " + " | ".join(cols) + " |")
        out.append("|" + "|".join(["---"] * len(cols)) + "|")
        for r in sorted(rows, key=lambda x: (str(x.get("store") or ""), str(x.get("name") or ""))):
            cells = []
            for c in cols:
                v = r.get(c, "")
                if c == "tags" and isinstance(v, list):
                    cells.append(", ".join(str(x) for x in v))
                elif c == "desc" and isinstance(v, str) and len(v) > 160:
                    cells.append((v[:157] + "…").replace("|", "\\|").replace("\n", " "))
                else:
                    cells.append(fmt_val(v).replace("|", "\\|").replace("\n", " "))
            out.append("| " + " | ".join(cells) + " |")
        out.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} — {len(all_rows)} items, {len(by_cat)} categories")


if __name__ == "__main__":
    main()
