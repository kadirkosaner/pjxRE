# Twee Dosyaları — Klasör Klasör Rapor

**Toplam:** 481 `.twee` dosyası, 8 ana klasörde.

Her bölüm: klasör amacı + önemli dosyalar + varsa sorun notu.

---

## `0 - System/` — Çekirdek (93 dosya)

Oyunun başlamasından önce yüklenen init kodu, widget tanımları ve migration'lar. Bu klasördeki dosyalar passage tag'lerine göre (ör. `[widget]`, `[init]`) erken yüklenir.

### `Init/`

| Dosya | İçerik |
|-------|--------|
| `variablesBase.twee` | `$money`, `$timeSys`, `$character`, `$stats`, `$needs`, temel global'ler |
| `variablesTime.twee` | `$timeSys` init, `$scheduleQueue` |
| `variablesPeople.twee` | `$characters`, `$relationships` iskeletleri |
| `variablesDiscovery.twee` | `$discovered` — harita keşif flag'leri |
| `variablesImage.twee` / `variablesImageLocation.twee` | Görsel path lookup tabloları |
| `variablesMap.twee` | `setup.navCards` — harita düğüm tanımları |
| `variablesNavigation.twee` | Fast travel / passage links |
| `variablesSettings.twee` | Kullanıcı ayarları default'ları |
| `variablesCharGenerator.twee` | Random NPC generator seed data |
| `ItemDatabase.twee` | `setup.items` — tüm itemler |
| `JobDatabase.twee` | `setup.jobs` (`ruby_dishwasher` vb.) |
| `ReadingDatabase.twee` / `ReadingSystem.twee` | Kitap/magazin veritabanı + okuma motoru |
| `RestaurantDatabase.twee` | `setup.restaurants` (menü, fiyat) |
| `ReputationInit.twee` | `$reputation` init |
| `DurationPresets.twee` | Preset süre sabitleri |
| `SaveVersion.twee` | `$saveVersion` tag — migration için |
| `characters/charPlayer.twee` | Oyuncu karakter init |
| `characters/{district}/char{Name}.twee` | Per-NPC init |
| `phone/*.twee` | Telefon içeriği (fotogram, topics, gallery) |

**Sorun:** Yok (yapı sağlam, isimlendirme tutarlı).

### `Widgets/` — 25 widget dosyası

| Dosya | Amaç | Kompleksite |
|-------|------|-------------|
| `TimeWidgets.twee` | `<<advanceTime>>` ve schedule hook'ları | 🟡 63 `<<if>>` |
| `StatCalculator.twee` | Derived stat hesabı | 🟡 58 `<<if>>` |
| `StatNotifications.twee` | Stat değişim toast'ları | Normal |
| `wardrobeWidget.twee` | Outfit/slot logic | 🟡 82 `<<if>>` — en kompleks |
| `NeedsSystem.twee` | Açlık/susuzluk decay + restore | Normal |
| `PhoneWidgets.twee` | 19 widget (message/call/appointment/fotogram) | 🟠 **9 widget'ta kapanmamış `<<nobr>>`** |
| `JobWidgets.twee` | Shift execution, wage, exp | Normal |
| `QuestWidgets.twee` | `<<questPrompts>>`, stage advance | Normal |
| `CharacterWidgets.twee` | Schedule lookup, relation update | Normal |
| `ActivityWidgets.twee` + `ActivityButtonWidget.twee` | Aktivite seçimi + UI | Normal |
| `MoneyWidgets.twee` | Para gain/spend + log | Normal |
| `ClothingCheckWidgets.twee` | Giyim slot kontrolleri | Normal |
| `ShopWidgets.twee` / `RestaurantWidgets.twee` | Cart, checkout | Normal |
| `ReadWidgets.twee` | Okuma session | Normal |
| `MirrorWidgets.twee` | Ayna self-check UI | Normal |
| `ComputerWidget.twee` | Bilgisayar UI | Normal |
| `SexualWidgets.twee` | `<<sexScene>>`, `<<sexAct>>` | ⚠️ Trigger yok (Level 3 yazılmamış) |
| `RelationshipDecay.twee` + `SkillDecay.twee` | Günlük decay | Normal |
| `ReputationWidgets.twee` | Reputation update | Normal |
| `HubAmbientWidgets.twee` | Hub'da arka plan olaylar | Normal |
| `BodySystem.twee` | Beden metrik hesapları | Normal |
| `CharGenerateWidget.twee` | Random NPC üretimi | Normal |
| `systemWidgets.twee` | Genel helper widget'lar | Normal |

**Kritik sorun:** `PhoneWidgets.twee` — `docs/audit/00-ozet.md` #2.

### `Migrations/`
Save migration widget'ları. `$saveVersion` < current olduğunda `:storyready`'de çalışır.

### `WardrobeSys/`
Wardrobe mekanik alt sistemi (item tanımları, outfit preset'leri).

### `storyJavaScript.js`
Twee içinde `script.js` tagged passage — `assets/system/js/` dosyalarını asenkron yükler (`window.SystemModules` ve `window.SystemCSS`'i okur).

---

## `1 - Prologue/` — İntro (19 dosya)

Linear story: welcome gate → character creation → 4 yıl anı → yeni ev → prologue bedroom.

| Dosya | Passage / Amaç |
|-------|----------------|
| `1 - Start[startscreen].twee` | Start screen (muhtemelen placeholder) |
| `2 - GameStart.twee` | `welcomePage` — yaş doğrulama modal |
| `3 - settingsPage.twee` | `settingsPage` — karakter oluşturma |
| `4 - confirmationPage.twee` | Seçim onayı |
| `5 - prologuePage.twee` | Backstory girişi |
| `6 - earlyYears.twee` → `9 - adolescentYears.twee` | 4 yaşam dönemi |
| `10 - comingofAge.twee` | Reşit olma |
| `11 - newhomeEnter.twee` → `14 - prologueDownstairsAsk.twee` | Yeni eve yerleşme |
| `15-17` | İlk akşam/yemek/gece |
| `18 - nextDayMorning.twee` | Prologue bitişi, free play başlar |
| `skipPrologue.twee` | Test için tüm intro'yu atlar |

**Sorun:** Yok.

---

## `2 - Locations/` — Mekanlar (112 dosya)

9 ilçe, her biri kendi alt klasöründe. Her ilçe için bir hub passage + sub-location'lar.

| İlçe | Durum |
|------|-------|
| `maplewood/` | 🟢 Dolu (ev, aile, park, corner shop) |
| `oldTown/` | 🟢 Dolu (Ruby's Diner aktif iş yeri, townhall) |
| `downTown/` | 🟡 Kısmi (mall var, başka az) |
| `suburbs/` | 🟡 Kısmi |
| `southside/` | 🔴 Boş/stub |
| `hillcrest/` | 🔴 Boş/stub |
| `marinaBay/` | 🔴 Boş/stub |
| `universityDistrict/` | 🔴 Boş/stub |
| `redLightCenter/` | 🔴 Locked early-game, boş |

**Sorun:** 5 dosyada kapanmamış `<<nobr>>` — hepsi `oldTown/dinerRubys/` veya `maplewood/sunsetPark/` altında. Detay: `docs/audit/03-fix-listesi.md` #3-#7.

---

## `3- Interactions/` — Diyalog (66 dosya)

| Klasör | İçerik |
|--------|--------|
| `CharacterInteraction.twee` | Ortak dialog wrapper |
| `FamilyHouse/` | Anne, Baba, Kardeş Level 1-2 talk'lar |
| `Maplewood/` | Maplewood NPC'leri |
| `oldTown/` | Diner 7 NPC (Emma, Jake, James, Mike, Sofia, Tom, Vince) Level 1 |
| `Meetup/` | Randevu/buluşma sahneleri |
| `Phone/` | Telefon çağrısı/mesaj scene'leri |

**Sorun:** Level 3 (sexual) diyaloglar hiçbir karakter için yazılmamış — `<<sexScene>>` aktif ama tetikleyici yok.

---

## `4 - Actions/` — Aktiviteler (112 dosya)

Lokasyon bazlı eylemler: shower, yoga, TV, yemek, vb.

| Klasör | İçerik |
|--------|--------|
| `global/` | Her yerde yapılabilenler (tuvalet, şarj, telefon) |
| `maplewood/` | Ev aktiviteleri (bedroom, bathroom, kitchen, yoga, ayna) |
| `downTown/` | Mall aktiviteleri |
| `events/` | Tetiklenmeli rastgele olaylar |

**Sorun:** 1 dosyada kapanmamış `<<nobr>>` — `maplewood/sunsetPark/parkWC.twee`.

---

## `5 - QuestSystem/` — Quest motoru (38 dosya)

### `System/`

| Dosya | İçerik | Sorun |
|-------|--------|-------|
| `QuestDatabase_Base.twee` | `setup.quests = {}` init | 🔴 `<<endscript>>` yerine `<</script>>` olmalı |
| `QuestDatabase_Main.twee` | Tüm quest tanımları (büyük nesne) | 🔴 Aynı hata son satırda + 🟡 kompleksite hotspot |
| `QuestItems.twee` | Quest-özel itemler | Normal |
| `QuestState.twee` | State helper'ları | Normal |
| `QuestWidgets.twee` | Stage advance, objective check | Normal |
| `variablesQuests.twee` | `$activeQuests`, `$questState`, `$completedQuests` | Normal |

### `Quests/`

| Quest | Durum |
|-------|-------|
| `newBeginnings/` | 🟢 Aktif (prologue sonrası) |
| `movingTroubles/` | 🟢 Aktif |
| `findJob/` | 🟢 Aktif (Ruby's Diner'a bağlı) |
| `gotoOldtown/` | 🟢 Aktif |
| `useComputer/` | 🟢 Aktif |
| `vinceDay3/` | 🟡 Kısmi |

**Kritik sorun:** `<<endscript>>` — detay `docs/audit/03-fix-listesi.md` #1.

---

## `6 - Scripts/` — (1 dosya)

| Dosya | İçerik |
|-------|--------|
| `PlayerAppearanceHelper.twee` | `getHairImage()`, `getBustImage()` gibi image lookup helper'ları. `setup.playerAppearanceImages` okur |

**Sorun:** Yok.

---

## `7 - Work/` — İş shift'leri (14 dosya)

| Klasör | İçerik |
|--------|--------|
| `RubysDiner/` | Dishwasher/waitress/manager shift passage'ları |

**Sorun:** Yok. (Başka iş yeri henüz yok.)

---

## `8 - Others/` — (1 dosya)

| Dosya | İçerik |
|-------|--------|
| `fastTravelTaxi.twee` | Taksi ile hızlı seyahat (para + zaman maliyeti) |

**Sorun:** Yok.

---

## Sorunların Konsolide Listesi

🔴 **Kritik (2):**
- `5 - QuestSystem/System/QuestDatabase_Base.twee:8` — `<<endscript>>`
- `5 - QuestSystem/System/QuestDatabase_Main.twee` (son satır) — aynı

🟠 **Yüksek (6 dosya, 14 yer):**
- `0 - System/Widgets/PhoneWidgets.twee` (9 widget) — eksik `<</nobr>>`
- `2 - Locations/oldTown/dinerRubys/dinerRubys{Bathroom,DressingRoom,Kitchen,ManagerOffice}.twee` — eksik `<</nobr>>`
- `4 - Actions/maplewood/sunsetPark/parkWC.twee` — eksik `<</nobr>>`

🟡 **Kompleksite hotspot'ları:**
- `0 - System/Widgets/{TimeWidgets,StatCalculator,wardrobeWidget}.twee` — bakım zor

⚠️ **İçerik eksikliği (bug değil, roadmap):**
- Level 3 diyaloglar hiç yok
- 5 ilçe boş

Fix talimatları: `03-fix-listesi.md`.
