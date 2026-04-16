# Proje Audit — Özet

**Tarih:** 2026-04-16
**Proje:** All That Glitters (SugarCube 2 / Twine)
**Kapsam:** 481 `.twee` + 41 JS + 50 CSS

---

## Durum

| Kategori | Sayı |
|----------|------|
| 🔴 Kritik (oyun bozar) | 2 |
| 🟠 Yüksek (görsel bozulma / debug sızıntısı) | 7 |
| 🟡 Orta (performans / bakım) | 4 |
| 🟢 Düşük (best practice) | 3 |

---

## 🔴 Kritik Sorunlar

Bunlar oyunun düzgün başlatılmasını engelliyor.

### 1. Quest sistemi init edilmiyor

SugarCube 2'de `<<script>>` makrosunun kapanışı `<</script>>` olmak zorunda. Projede `<<endscript>>` kullanılmış — bu SugarCube 1 sözdizimi, SugarCube 2'de hatalıdır.

- `passages/5 - QuestSystem/System/QuestDatabase_Base.twee:8`
- `passages/5 - QuestSystem/System/QuestDatabase_Main.twee` (son satır)

**Etki:** `setup.quests` objesi oluşmaz → tüm quest sistemi çöker.

**Düzeltme:** Bkz. `03-fix-listesi.md` #1.

---

## 🟠 Yüksek Öncelikli

### 2. Kapanmamış `<<nobr>>` makroları (6 dosya)

`<<nobr>>` ile başlayan blok `<</nobr>>` ile kapatılmalı. Kapatılmazsa sonraki passage'lar da etkilenebilir (whitespace/render bozulması).

- `passages/0 - System/Widgets/PhoneWidgets.twee` — **9 widget** içinde eksik (satır 54, 61, 72, 79, 108, 124, 137, 143, 362)
- `passages/2 - Locations/oldTown/dinerRubys/dinerRubysBathroom.twee` (EOF)
- `passages/2 - Locations/oldTown/dinerRubys/dinerRubysDressingRoom.twee` (EOF)
- `passages/2 - Locations/oldTown/dinerRubys/dinerRubysKitchen.twee` (EOF)
- `passages/2 - Locations/oldTown/dinerRubys/dinerRubysManagerOffice.twee` (EOF)
- `passages/4 - Actions/maplewood/sunsetPark/parkWC.twee` (EOF)

**Düzeltme:** Bkz. `03-fix-listesi.md` #2-#7.

### 3. Production'da DEBUG flag açık

- `assets/system/js/ui/phone/index.js:5` → `if (typeof window.DEBUG_PHONE_SWAP === 'undefined') window.DEBUG_PHONE_SWAP = true;`

Default `true`. Konsola `[PhoneSwap]` logları sızıyor. Production build'te `false` olmalı.

**Düzeltme:** Bkz. `03-fix-listesi.md` #8.

---

## 🟡 Orta Öncelikli

### 4. character.js — async state race condition riski
`assets/system/js/modal/character.js:335-337` — zincirli `setTimeout()` + State.variables okuma. Modal kapanıp açılırken yarışma durumu üretebilir. Promise bazlı akışa geçirilmeli.

### 5. character.js — aşırı `.html()` kullanımı (163 yer)
Kullanıcı girdisi yok (düşük XSS riski), ancak best practice olarak `.text()` veya template literal + `escapeHtml()` tercih edilmeli.

### 6. Automation — Windows-specific path
`Automation/FalNanoBanana2/config.json` içinde `/c:/Users/devne/...` gibi hardcoded path'ler. Cross-platform taşınamaz.

### 7. Kompleksite hotspot'ları
- `StatCalculator.twee` — 58 `<<if>>`
- `TimeWidgets.twee` — 63 `<<if>>`
- `wardrobeWidget.twee` — 82 `<<if>>`
- `QuestDatabase_Main.twee` — büyük iç içe nesne

Gelecekte debug zor olacak; testable helper widget'lara bölünmeli.

---

## 🟢 Düşük / Bilgi Amaçlı

### 8. `location.js` — dinamik `<style>` inject
`assets/system/js/system/location.js:29-36` → `<style id="dynamic-location-bg">` DOM'a direkt yazıyor. Passage geçişinde cleanup doğru yapılmış ama CSS variable ile de yapılabilir.

### 9. Global mutable state
`window.phoneViewState` — telefonun sub-app state'i global. Modülerlik açısından `setup.phone.viewState` veya kapalı closure tercih edilebilir.

### 10. Cursor Rules eksikliği
`.cursor/rules/` klasörü yoktu — agent'lar projeyi baştan keşfetmek zorunda. Bu audit ile birlikte oluşturuldu.

---

## Referanslar

- Detaylı dosya-dosya twee raporu: `01-twee-dosyalari.md`
- Detaylı JS modül raporu: `02-js-dosyalari.md`
- Copy-paste düzeltme talimatları: `03-fix-listesi.md`
- Agent navigasyon rehberi: `.cursor/rules/` (6 dosya, İngilizce)
