"""Dump setup.items from passages/0 - System/Init/ItemDatabase.twee to docs/item-database-dump.md."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "passages/0 - System/Init/ItemDatabase.twee"
OUT = ROOT / "docs" / "item-database-dump.md"


def strip_js_comments(s: str) -> str:
    lines = []
    for line in s.splitlines():
        if "//" in line:
            in_str = False
            quote = None
            i = 0
            cut = len(line)
            while i < len(line):
                ch = line[i]
                if not in_str and ch == "/" and i + 1 < len(line) and line[i + 1] == "/":
                    cut = i
                    break
                if ch in "\"'":
                    if not in_str:
                        in_str, quote = True, ch
                    elif ch == quote and line[i - 1] != "\\":
                        in_str = False
                        quote = None
                i += 1
            line = line[:cut].rstrip()
        lines.append(line)
    return "\n".join(lines)


def strip_block_comments(s: str) -> str:
    return re.sub(r"/\*[\s\S]*?\*/", "", s)


def quote_js_keys(s: str) -> str:
    s = re.sub(r"(?<=[{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'"\1":', s)
    return s


def remove_trailing_commas(s: str) -> str:
    return re.sub(r",(\s*[\]}])", r"\1", s)


def extract_items_object(text: str) -> str:
    m = re.search(
        r"<<set\s+setup\.items\s*=\s*(\{[\s\S]*\})\s*>>",
        text,
    )
    if not m:
        raise SystemExit("Could not find <<set setup.items = { ... }>> in ItemDatabase.twee")
    return m.group(1)


def effects_cell(effects: object) -> str:
    if not effects:
        return ""
    return json.dumps(effects, ensure_ascii=False).replace("|", "\\|")


def main() -> None:
    raw = SRC.read_text(encoding="utf-8")
    blob = extract_items_object(raw)
    blob = strip_block_comments(blob)
    blob = strip_js_comments(blob)
    blob = quote_js_keys(blob)
    blob = remove_trailing_commas(blob)
    try:
        data = json.loads(blob)
    except json.JSONDecodeError as e:
        raise SystemExit(f"JSON parse failed after transforms: {e}") from e

    cols = [
        "id",
        "name",
        "category",
        "usageType",
        "price",
        "maxUses",
        "singleInventory",
        "hasTooltip",
        "effects",
        "desc",
        "image",
    ]

    out: list[str] = []
    out.append("# Item database dökümü")
    out.append("")
    out.append(
        "Otomatik üretildi: `passages/0 - System/Init/ItemDatabase.twee` içindeki "
        "`setup.items` (`scripts/dump_item_database_md.py`)."
    )
    out.append("")
    out.append("## Alan özeti")
    out.append("")
    out.append("- **usageType**: `direct` | `passage` | `passive`")
    out.append("- **effects**: `[{ stat, value, type, duration? }]` — boş array pasif eşya")
    out.append("- **maxUses**: satın alındığında envanterdeki kullanım adedi (yoksa sınırsız)")
    out.append("- **singleInventory**: `true` ise oyunda yalnızca bir adet")
    out.append("")

    total = 0
    for section in data:
        items = data[section]
        if not isinstance(items, list):
            continue
        total += len(items)
        out.append(f"## {section} ({len(items)} kayıt)")
        out.append("")
        out.append("| " + " | ".join(cols) + " |")
        out.append("|" + "|".join(["---"] * len(cols)) + "|")
        for it in sorted(items, key=lambda x: (str(x.get("name") or ""), str(x.get("id") or ""))):
            cells = []
            for c in cols:
                v = it.get(c, "")
                if c == "effects":
                    cells.append(effects_cell(v))
                elif isinstance(v, str):
                    cells.append(v.replace("|", "\\|").replace("\n", " "))
                elif isinstance(v, bool):
                    cells.append("True" if v else "False")
                elif v is None:
                    cells.append("")
                else:
                    cells.append(str(v))
            out.append("| " + " | ".join(cells) + " |")
        out.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} — {total} items in {len(data)} sections")


if __name__ == "__main__":
    main()
