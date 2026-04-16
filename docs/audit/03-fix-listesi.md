# Fix Listesi — Copy-Paste Talimatları

Her madde bağımsız uygulanabilir. Öncelik sırası: 🔴 → 🟠 → 🟡.

---

## 🔴 #1 — Quest DB init (KRİTİK)

### `passages/5 - QuestSystem/System/QuestDatabase_Base.twee`

**Satır 8** — `<<endscript>>` → `<</script>>`

```diff
  <<script>>
  setup.quests = {};
- <<endscript>>
+ <</script>>
```

### `passages/5 - QuestSystem/System/QuestDatabase_Main.twee`

**Son satırda** aynı düzeltme. Dosyanın sonundaki `<<endscript>>` → `<</script>>`.

> **Not:** SugarCube 2'de `<<script>>` makrosunun kapanış sözdizimi **kesinlikle** `<</script>>`. `<<endscript>>` SugarCube 1 kalıntısıdır, çalışmaz.

---

## 🟠 #2–#10 — Eksik `<</nobr>>`

`<<nobr>>` açılışı varsa `<</nobr>>` ile kapatılmalı. Widget içinde kullanımlar:

```
<<widget "foo">><<nobr>>
    ...
<</nobr>><</widget>>    <-- DOĞRU
```

Projede tutarsızlık var — bazı widget'lar doğru kapanmış (örn. `phoneUnlockContact`, satır 81-88), bazılarında eksik.

### #2 — `passages/0 - System/Widgets/PhoneWidgets.twee`

9 widget'ta eksik. Her birinde `<</widget>>`'dan hemen öncesine `<</nobr>>` eklenecek.

| Widget | Satır | Değişiklik |
|--------|-------|-----------|
| `phoneSendMessage` | 54 | `<</widget>>` → `<</nobr>><</widget>>` |
| `phoneMarkConversationRead` | 61 | aynı |
| `phoneStartConversation` | 72 | aynı |
| `phoneEnsureTopics` | 79 | aynı |
| `phoneWhereAreYou` | 108 | aynı |
| `phoneCallLog` | 124 | aynı |
| `phoneCreateAppointment` | 137 | aynı |
| `phoneCancelAppointment` | 143 | aynı |
| `completeMeetupAppointment` | 362 | aynı |

**Sanity kontrolü (bash):**

```bash
cd "/home/user/pjxRE/passages/0 - System/Widgets"
grep -c "<<nobr>>" PhoneWidgets.twee     # açılış sayısı
grep -c "<</nobr>>" PhoneWidgets.twee    # kapanış sayısı (eşit olmalı, şu an 19 vs 10)
```

### #3 — `passages/2 - Locations/oldTown/dinerRubys/dinerRubysBathroom.twee`

EOF'ta `<</nobr>>` eksik. Son satıra ekle.

### #4 — `passages/2 - Locations/oldTown/dinerRubys/dinerRubysDressingRoom.twee`

Aynı — EOF'ta `<</nobr>>` eksik.

### #5 — `passages/2 - Locations/oldTown/dinerRubys/dinerRubysKitchen.twee`

Aynı.

### #6 — `passages/2 - Locations/oldTown/dinerRubys/dinerRubysManagerOffice.twee`

Aynı.

### #7 — `passages/4 - Actions/maplewood/sunsetPark/parkWC.twee`

Aynı — EOF'ta `<</nobr>>` eksik.

### #8 — DEBUG flag

`assets/system/js/ui/phone/index.js`, **satır 5:**

```diff
- if (typeof window.DEBUG_PHONE_SWAP === 'undefined') window.DEBUG_PHONE_SWAP = true;
+ if (typeof window.DEBUG_PHONE_SWAP === 'undefined') window.DEBUG_PHONE_SWAP = false;
```

Geliştirirken konsoldan `window.DEBUG_PHONE_SWAP = true` yazarak açabilirsin.

---

## 🟡 #9 — Windows-path (orta öncelik)

`Automation/FalNanoBanana2/config.json` içinde hardcoded `/c:/Users/devne/...` path'leri varsa environment variable veya relative path'e çevir:

```json
{
  "base_path": "${PROJECT_ROOT}/assets/content"
}
```

Python tarafında `os.environ.get("PROJECT_ROOT", os.getcwd())` kullan.

---

## Doğrulama — Tümü tamamlandığında

```bash
cd /home/user/pjxRE

# 1. <<endscript>> artık olmamalı
grep -rn "<<endscript>>" passages/
# → hiçbir sonuç çıkmamalı

# 2. PhoneWidgets nobr dengesi
grep -c "<<nobr>>" "passages/0 - System/Widgets/PhoneWidgets.twee"
grep -c "<</nobr>>" "passages/0 - System/Widgets/PhoneWidgets.twee"
# → her iki sayı eşit olmalı (19 = 19)

# 3. DEBUG flag default
grep "DEBUG_PHONE_SWAP" assets/system/js/ui/phone/index.js
# → "= false" görmeli

# 4. Oyunu Twine/tweego ile build et, prologue'tan başlat:
#    welcomePage → settingsPage → prologuePage → earlyYears ...
#    Konsolda hata olmamalı. Quest DB kontrolü:
#    devtools > console > State.variables.activeQuests
```

---

## Uygulama Sırası Önerisi

1. Önce #1 (quest DB) — oyun prologue sonrası bu olmadan çökmeye başlayabilir
2. Sonra #2 (PhoneWidgets) — telefon açıldığında whitespace bug'ları
3. #3–#7 (lokasyon dosyaları) — batch halinde tek commit
4. #8 (DEBUG) — release öncesi
5. #9 (Windows path) — automation pipeline kullanmadan önce

Her bir fix grubunu ayrı commit'e böl; bir şey kırılırsa revert kolay olsun.
