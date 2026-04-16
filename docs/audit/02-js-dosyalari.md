# JS Dosyaları — Modül Modül Rapor

**Toplam:** 41 JS dosyası (`assets/system/js/`) + Automation Python script'leri.

Load order: `assets/system/config.js` → `utils → ui → modal → system`.

---

## `utils/` — Base helpers (5 dosya)

### `jobSchedule.js`
Off-days / work-days lookup table. Topbar ve takvim tarafından kullanılır.

- **Global:** `window.jobSchedule`
- **Kullanım:** Topbar'da "iş günü mü?" kontrolü
- **Sorun:** Yok

### `modal.js`
Merkezi modal oluşturma sistemi. Overlay + tab yönetimi.

- **Global:** `window.Modal.create(options)`, `window.ModalTabSystem`
- **Kullanım:** `character.js`, `journal.js`, `saveload.js`, `settings.js`, `stats.js` hepsi bunu kullanıyor
- **Sorun:** Yok (iyi tasarlanmış)

### `tooltip.js`
Bilgi ikonlarına tooltip ekleyen jQuery plugin.

- **Global:** `$.fn.initTooltips()`
- **Sorun:** Yok

### `notification.js`
Toast bildirimleri.

- **Global:** `window.notify(text, type)`
- **Sorun:** Yok

### `accordion.js`
Collapsible bölüm binder'ı.

- **Sorun:** Yok

---

## `ui/` — Render-driven UI (25+ dosya, phone subsystem dahil)

### `layout.js`
Passage içeriğini `.page-wrapper` ile sarmalar. `:passagerender` hook'u.

- **Sorun:** Yok

### `topbar.js`
Üst nav: saat, bildirim rozetleri, karakter linki.

- **Sorun:** Yok

### `rightbar.js`
Sağ kenar: profil + stats + telefon + harita önizleme.

- **Sorun:** Yok

### `mainmenu.js`
Sol kayar panel (Save/Load, Settings, Help, Credits).

- **Sorun:** Yok

### `map.js`
Harita overlay + lokasyon hiyerarşisi.

- **Global:** `window.MapAPI`
- **Kompleksite:** Orta-yüksek (hiyerarşi mantığı)
- **Sorun:** Yok

### `startscreen.js`
Başlangıç ekranı handler'ı (yaş kapısı).

- **Sorun:** Yok

### `debug.js`
Dev floating panel.

- **Global:** `window.DebugPanel`
- **İçerdikleri:** `DIANA_DEBUG_PASSAGES[]`, `SHOWER_DEBUG_PASSAGES[]` (yazılmamış scene stub'ları)
- **Sorun:** Yok, ama production build'de kapatılmalı (conditional?)

### `dropdown.js`
`<<uiDropdown>>` custom macro.

- **API:** `Macro.add('uiDropdown', {...})` — path parsing + State.temporary.*
- **Sorun:** Yok

### `toggle.js`
`<<uiToggle>>` custom macro.

- **Sorun:** Yok

### `ui/phone/` subsystem

#### `phone/index.js` — ⚠️ KRİTİK SORUN
- **Satır 5:** `if (typeof window.DEBUG_PHONE_SWAP === 'undefined') window.DEBUG_PHONE_SWAP = true;`
- Default `true` — production'da debug logları sızıyor
- **Fix:** `03-fix-listesi.md` #8
- **Global:** `window.PhoneAPI`, `window.phoneViewState` (mutable global object)
- **Minor issue:** `phoneViewState` global mutable — modüler değil; ideal olarak `setup.phone.viewState` altında olmalı

#### `phone/config.js`
Telefon UI sabitleri.

#### `phone/utils.js`
Format helper'ları.

#### `phone/shared-contacts.js` / `phone/shared-meetup.js` / `phone/shared-topics.js`
Ortak UI bileşenleri (contact listesi, meetup picker, topic picker).

#### `phone/phone-messages.js`
Mesaj uygulaması. `$phoneConversations` okur/yazar.

#### `phone/phone-contacts.js`
Kişiler uygulaması.

#### `phone/phone-calendar.js`
Takvim + randevular. `$phoneAppointments` ile çalışır.

#### `phone/phone-fotogram.js` + `phone/phone-fotogram-dm.js`
Instagram-benzeri sosyal medya + DM.

#### `phone/phone-finder.js`
Dating uygulaması.

#### `phone/topic-system.js`
Konu bazlı chat motoru.

#### `phone/phone-camera.js`
Selfie çekme UI.

#### `phone/phone-gallery.js`
Fotoğraf galerisi + klasörler.

**Phone subsystem genel:** Çok modüler, iyi bölünmüş. `requestAnimationFrame()` ve event delegation yoğun kullanılmış.

---

## `modal/` — Modal dialogs (7 dosya)

### `character.js` — ⚠️ HOTSPOT (1023 satır)
Character detail modal: appearance (beden diyagramı + pointer), inventory, outfit.

- **Global:** `window.CharacterInit(vars)`, `window.CharacterSystem`
- **Sorun:**
  - Satır 335-337: zincirli `setTimeout()` ile State.variables sync — race condition riski
  - 163 yerde `.html(template)` — kullanıcı girdisi yok (düşük XSS riski) ama `escapeHtml()` tercih edilebilir
  - Tooltip positioning (satır 948-995) — kompleks transform hesaplamaları, offset bug riski

### `journal.js` (750 satır)
Quest / Records / Milestones / Reputation modal.

- **Global:** `window.JournalInit`, `window.JournalSystem`
- **İyi yön:** `escapeHtml()` helper var, kullanıcı verisi escape ediliyor
- **Sorun:** Yok

### `relations.js` (463 satır)
Karakter ilişkiler grid + detay.

- **Global:** `window.RelationsInit`, `window.RelationsSystem`
- **Minor:** `toggleGroup()`, `togglePlace()`, `showDetail()` onclick HTML'de hardcoded — event delegation daha temiz olurdu
- **İyi yön:** Yaş dinamik hesap (`timeSysYear - birthYear`)

### `saveload.js`
Custom save/load slotları. Slot 0 = auto-save.

- **Global:** `window.SaveLoadAPI`, `window.openCustomSaveLoad`
- **Event:** `:passageend` → auto-save
- **Sorun:** Yok

### `settings.js`
Tablı ayarlar modalı.

- **Sorun:** Yok

### `stats.js`
Stats accordion modal. Bidirectional bar UI.

- **Global:** `window.StatsInit`, `window.StatsSystem`
- **Sorun:** Yok

### `help.js` (1200+ satır)
Help modalı, sidebar layout.

- **Global:** `window.HelpSystem`
- **Sorun:** Yok, sadece büyük

---

## `system/` — Oyun logic (5 dosya)

### `location.js`
Lokasyon arka plan görseli yönetimi.

- **Yaklaşım:** `<style id="dynamic-location-bg">` dinamik inject (satır 29-36)
- **Minor:** CSS variable ile de yapılabilirdi (daha temiz), ama mevcut çalışıyor ve passage geçişinde cleanup var
- **Sorun:** 🟢 Düşük — best practice

### `reading.js`
Kitap/magazin okuma sistemi.

- **State:** `$readProgress`, `$readFinished`
- **Sorun:** Yok

### `restaurant.js`
Restoran menüsü + sipariş + ödeme.

- **Sorun:** Yok

### `shopping.js`
Wardrobe alışverişi.

- **Sorun:** Yok

### `wardrobe.js`
Outfit equip, durability/dirt.

- **API:** `Macro.add('wardrobe', {...})` → `<<wardrobe>>` macro
- **Sorun:** Yok

---

## CSS Modülleri (özet, 50 dosya)

```
base/      variables, reset, icons          (zorunlu ilk)
layout/    structure, topbar, rightbar, mainmenu
ui/        buttons, modals, dialog, tabs, forms, navigation, settings, toggle, dropdown
screens/   welcome, startscreen, gamesetup, prologue
systems/   phone, phone-camera, phone-gallery, phone-fotogram, map, wardrobe, shopping,
           restaurant, inventory, relations, stats, journal, quest, profile, character,
           character-appearance, character-outfit, saveload, alarm, read, help
utils/     debug, notifications, tooltips, animations, utilities, media (en son)
```

`base/variables.css` — `:root` custom properties (renkler, spacing, typography).

**Sorun:** Yok — organize ve modüler.

---

## Automation Pipeline (ayrı scope)

### `Automation/FalNanoBanana2/` — FAL.AI pipeline (~116 MB)

| Script | Amaç |
|--------|------|
| `Generator.py` | Prompt builder + FAL.AI API çağrısı + karakter swap logic |
| `batch_generate.py` | Batch generation loop |
| `GeneratorGemini.py` | Gemini 3.1 Flash alternatifi |
| `config.json` | Karakter/lokasyon mapping + FAL config |

**Character reference:** emma, jake, james, mike, sofia, tom, vince, player  
**Location reference:** dinerInterior, dinerKitchen, dinerStorage, dinerBathroom, dinerCorridor, dinerDressingRoom, dinerManager  
**Prompt templates:** `dinerInterior` (4 kişi), `back_empty` (2 kişi), `back_npc` (3 kişi)  
**Output:** `Jsons/{character}(done)/*.webp`

**Sorun:** 🟡 `config.json` içinde Windows-specific path (`/c:/Users/devne/...`) — portable değil.

### `Automation/ReplicateBulk/` — Replicate.com alternative (~50 KB)

Template config, şu an inactive.

---

## Sorunların Konsolide Listesi (JS)

🟠 **Yüksek:**
- `ui/phone/index.js:5` — `DEBUG_PHONE_SWAP = true` default

🟡 **Orta:**
- `modal/character.js:335-337` — async race condition riski
- `modal/character.js` — 163 yerde `.html()` (low XSS)
- `Automation/FalNanoBanana2/config.json` — Windows path

🟢 **Düşük:**
- `system/location.js:29-36` — dinamik `<style>` inject
- `ui/phone/index.js:8` — global mutable `phoneViewState`
- `modal/relations.js` — inline onclick handler'lar

Fix talimatları: `03-fix-listesi.md` #8 ve #9.
