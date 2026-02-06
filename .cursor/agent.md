# PRACTICAL FERMI - Cursor Cheatsheet & Sistem Raporu

> **Proje:** Hayat Simülasyonu / Visual Novel (Yetişkin)
> **Motor:** SugarCube 2 (Twine)
> **Dil:** JavaScript + Twee + Vanilla CSS
> **Build:** npm yok, SugarCube Compiler ile .twee → HTML

---

## 1. PROJE MİMARİSİ

```
practical-fermi/
├── assets/system/               ← Tüm CSS + JS modülleri
│   ├── config.js                ← Modül yükleme sırası tanımı
│   ├── css/ (43 dosya)          ← Modüler vanilla CSS
│   └── js/  (22 dosya)          ← Modüler vanilla JS
│
├── passages/ (287 .twee dosya)  ← Oyun içeriği (hikaye, lokasyon, karakter)
│   ├── 0 - System/             ← Init, Widget, Wardrobe tanımları
│   ├── 1 - Prologue/           ← Oyun başlangıcı (19 dosya)
│   ├── 2 - Locations/          ← Harita lokasyonları (100+ dosya)
│   ├── 3 - Interactions/       ← NPC diyalog ağaçları
│   ├── 4 - Actions/            ← Oyuncu aktiviteleri
│   ├── 5 - QuestSystem/        ← Görev tanım & passage'ları
│   ├── 6 - Scripts/            ← Yardımcı scriptler
│   └── 7 - Others/             ← Diğer
│
├── 1Developer/                  ← Geliştirici dokümanları
├── SysReport.md                 ← Türkçe sistem raporu
└── clothes.xlsx                 ← Kıyafet veritabanı
```

---

## 2. MODÜL YÜKLENMe SİSTEMİ

### Akış
```
:storyready event → storyJavaScript.js
  → config.js yüklenir
  → CSS yüklenir (base → layout → ui → screens → systems → utils)
  → JS yüklenir (utils → ui → modal → system)
  → Her modül {ModuleName}Init(API) ile başlatılır
  → :passagerender tetiklenir
  → SugarCube UIBar kaldırılır (custom UI kullanılıyor)
```

### API Injection Pattern
Her JS modülü bu pattern'i kullanır:
```javascript
window.ModuleNameInit = function(API) {
    // API objeleri:
    // API.State    → SugarCube State (variables, passage)
    // API.Engine   → SugarCube Engine (play, show)
    // API.$        → jQuery
    // API.setup    → setup namespace (config verileri)
    // API.Macro    → Macro sistemi
    // API.Wikifier → Twee parser
    // API.Story    → Story API
    // API.Dialog   → SugarCube Dialog
    // API.Save     → Save sistemi
    // API.Config   → SugarCube Config

    window.ModuleNameSystem = {
        // public API
    };
};
```

### config.js → Modül Listesi

**CSS Modülleri (43 dosya):**
| Kategori | Dosyalar | Yol |
|----------|----------|-----|
| base | variables, reset, icons | `css/base/` |
| layout | structure, topbar, rightbar, mainmenu | `css/layout/` |
| ui | buttons, modals, dialog, tabs, forms, navigation, settings, toggle, dropdown | `css/ui/` |
| screens | welcome, startscreen, gamesetup, prologue | `css/screens/` |
| systems | phone, map, wardrobe, shopping, inventory, relations, stats, journal, quest, profile, character, saveload, alarm | `css/systems/` |
| utils | debug, notifications, tooltips, animations, utilities, media | `css/utils/` |

**JS Modülleri (22 dosya):**
| Kategori | Dosyalar | Yol |
|----------|----------|-----|
| utils | modal, tooltip, notification, accordion | `js/utils/` |
| ui | layout, topbar, rightbar, phone, map, startscreen, mainmenu, debug, toggle, dropdown | `js/ui/` |
| modal | saveload, settings, stats, relations, character, journal | `js/modal/` |
| system | wardrobe, location, shopping | `js/system/` |

---

## 3. TWEE / SUGARCUBE SÖZDİZİMİ

### Passage Tanımı
```twee
:: PassageName [tag1 tag2]
İçerik buraya yazılır.

<<if $variable>>
  Koşullu içerik
<</if>>
```

### Temel SugarCube Macro'ları
```twee
<<set $variable to value>>          ← Değişken ata
<<if $condition>>...<</if>>         ← Koşul
<<elseif>>...<</elseif>>            ← Else-if
<<else>>...<</else>>                ← Else
<<for _i range 0, 5>>...<</for>>   ← Döngü
<<link "Text" "Passage">>...<</link>> ← Link
<<goto "PassageName">>              ← Passage'a git
<<include "PassageName">>           ← Passage içeriğini dahil et
<<widget "widgetName">>...<</widget>> ← Widget tanımla
<<widgetName>>                       ← Widget çağır
```

### Değişken Erişimi
```twee
$variable          ← Kalıcı (save'e dahil)
_temporary         ← Geçici (passage geçişinde silinir)
setup.configData   ← Sabit config (save'e dahil değil)
```

---

## 4. CUSTOM MACRO'LAR (storyJavaScript.js)

### `<<btn>>` - Buton
```twee
<<btn "Buton Metni" "HedefPassage" "style" minEnergy>>
  <<set $someVar to true>>
<</btn>>
```
- **style:** default, primary, danger, success, warning, quest, veya CSS renk adı
- **minEnergy:** Opsiyonel, yetersiz enerji → kilitli buton
- **Gövde:** Tıklandığında çalışan Twee kodu

### `<<btnPicker>>` - Süreli Buton (Dropdown ile)
```twee
<<btnPicker "Aktivite Adı" "HedefPassage" "presetName" "style" minEnergy>>
```
- **presetName:** `setup.durationPresets` içindeki preset adı
- Kullanıcı süre seçer → `$selectedDuration` değişkenine yazılır
- `$pickerMemory[presetName]` ile son seçim hatırlanır

### `<<dialog>>` - Diyalog Balonu
```twee
<<dialog "charId">>
  Karakter konuşma metni burada.
  (aksiyon parantez içinde otomatik stil alır)
<</dialog>>
```
- `$characters[charId]` objesinden avatar, isim, renk çeker
- Player tipi → sadece firstName gösterir

### `<<narrative>>` - Anlatı Bloğu
```twee
<<narrative "Lokasyon İsmi">>
  Anlatı metni burada.
<</narrative>>
```

### `<<thought>>` - İç Ses
```twee
<<thought>>
  Karakter düşünce metni.
<</thought>>
```

### `<<vid>>` - Video Oynatıcı
```twee
<<vid "path/to/video.mp4" "80%" false>>
```
- Arg 1: Video URL
- Arg 2: Genişlik (%, px, 0-1 oran)
- Arg 3: Manuel kontroller (true/false)
- `$videoSettings` ile otomatik ses/loop/autoplay

### `<<image>>` - Resim
```twee
<<image "path/to/image.jpg" "60%">>
```

### `<<notify>>` - Toast Bildirim
```twee
<<notify "success" "Mesaj metni" 3000>>
```
- Tipler: success, error, warning, info, quest

### `<<wardrobe>>` - Kıyafet Sistemi
```twee
<<wardrobe>>
```
- Async yükleme: `window.wardrobeModule.macroHandler` bekler
- Tüm kıyafet UI'ı JS tarafında render edilir

### `<<shop>>` - Mağaza
```twee
<<shop "Mağaza Adı" "shopType" itemIds "backPassage">>
```
- `itemIds`: Ürün ID array'i
- `backPassage`: Geri dönüş passage'ı

### `<<showActions>>` - Karakter Eylemleri
```twee
<<showActions "charId" "location">>
```
- `setup.characterActions[charId][location]` → eylem listesi
- Zaman penceresi, günlük limit, stat gereksinimleri kontrol eder

### `<<navMenu>>` / `<<navCard>>` - Navigasyon Kartları
```twee
<<navMenu>>
  <<navCard "cardId" "PassageName" "image.jpg">>
  <<navCard "mall" "MallEntrance">>
<</navMenu>>
```
- `setup.navCards[cardId]` veritabanından bilgi çeker
- `setup.locationHours[cardId]` → açık/kapalı kontrolü
- `$discovered{CardId}` → keşfedilmemiş kartlar gizlenir
- Seyahat süresi otomatik hesaplanır

### `<<domInclude>>` - DOM'dan Passage Dahil Et
```twee
<<domInclude "PassageName">>
```
- Story API yerine direkt DOM'dan `tw-passagedata` okur

---

## 5. QUEST SİSTEMİ V2

### Quest Tanımı (setup.quests)
```javascript
setup.quests = {
    "questId": {
        title: "Quest Başlığı",
        description: "Açıklama",
        requirements: {
            flags: ["flagName"],
            quests: ["prerequisiteQuestId"],
            relationships: { charId: { friendship: 40 } },
            stats: { charisma: 30 }
        },
        stages: [
            {
                id: "stage_0",
                title: "Aşama Başlığı",
                passage: "quest_passage_name",
                buttonText: "Buton Metni",
                lockedText: "Kilitli mesaj",
                forceScene: true,
                triggers: {
                    location: "locationId",
                    time: { period: "morning", hour: [8, 12] },
                    timeRange: { min: 9, max: 17 },
                    character: { id: "charId", status: "working" },
                    flag: "flagName"
                },
                requirements: { /* aynı format */ },
                objectives: [
                    { id: "obj_1", text: "Hedef açıklaması" }
                ],
                completeWhen: "allObjectives" // veya "anyObjective"
            }
        ],
        onComplete: {
            relationships: { charId: { friendship: 10 } },
            stats: { charisma: 5 },
            money: 500,
            flags: ["questCompletedFlag"],
            notification: "Tebrikler!",
            nextQuest: "nextQuestId" // veya ["quest1", "quest2"]
        }
    }
};
```

### Quest Macro'ları
```twee
<<startQuest "questId">>           ← Quest başlat
<<advanceQuestStage "questId">>    ← Sonraki aşamaya geç
<<completeObjective "questId" "objectiveId">> ← Hedef tamamla
<<completeQuest "questId">>        ← Quest bitir
<<getQuestHint "questId">>         ← İpucu al → _questHint
<<questPrompts>>                   ← Lokasyondaki quest butonlarını göster
<<questPrompts "charId">>          ← Karaktere özel quest butonları
```

### Quest State ($questState)
```javascript
$questState = {
    active: {
        "questId": {
            stage: 0,
            objectives: { "obj_1": true },
            triggeredStage: -1,
            startDate: "1/1/2025"
        }
    },
    completed: ["questId1", "questId2"],
    failed: [],
    daily: {}
}
```

---

## 6. KARAKTER SİSTEMİ

### Karakter Tanımı ($characters)
```javascript
$characters = {
    "player": {
        type: "player",
        firstName: "...", lastName: "...",
        avatar: "path/to/avatar.jpg",
        color: "#ec4899",
        stats: { /* player stats $player'da */ }
    },
    "mother": {
        type: "family",
        firstName: "Elena", lastName: "...",
        avatar: "...", color: "#a855f7",
        status: "Home",
        currentLocation: "familyHouse",
        schedule: { /* saatlik konum/durum */ },
        stats: {
            friendship: 50,
            trust: 40,
            love: 30,
            lust: 0
        }
    }
};
```

### İlişki Tier Sistemi
| Tier | Friendship | Davranış |
|------|-----------|----------|
| 1 | 0-39 | Mesafeli, kısa cevaplar |
| 2 | 40-69 | Samimi, rahat konuşma |
| 3 | 70-100 | Çok yakın, duygusal/romantik |

### Aktif Karakterler
- **Player** → Oyuncu karakteri
- **Mother (Elena)** → Aile, schedule bazlı
- **Father** → Aile, preWork/postWork fazları
- **Brother** → Aile, school/vacation fazları
- **Marcus** → Corner Shop tezgahtar
- **Career Clerk** → Town Hall NPC
- **Receptionist** → Town Hall NPC

---

## 7. STAT SİSTEMİ

### Oyuncu Ana Statları ($player veya $ direkt)
```
$energy      → Enerji (0-100)
$health      → Sağlık (0-100)
$mood        → Moral (0-100)
$stress      → Stres (0-100)
$arousal     → Uyarılma (0-100)
$hygiene     → Hijyen (0-100)
```

### İhtiyaç Sistemi
```
$hunger      → Açlık (0-100, yüksek = kötü)
$thirst      → Susuzluk (0-100, yüksek = kötü)
$bladder     → Mesane (0-100, yüksek = kötü)
```

### Saatlik Decay (Her saat otomatik)
```
Energy   -5
Hunger   +5
Thirst   +10
Bladder  +8
Hygiene  -5
```

### Hesaplanmış Statlar (StatCalculator widget)
```
$fitness    = (upperBody + core + lowerBody + cardio) / 4
$looks      = beauty×0.3 + bodyAppeal×0.3 + hygiene×0.2 + clothing×0.2
$confidence = charisma×0.5 + looks×0.3
```

### Skill Kategorileri (30+ skill)
| Kategori | Örnekler |
|----------|----------|
| Mental | willpower, intelligence, concentration |
| Social | charisma, persuasion, flirting |
| Physical | dance, yoga, swimming, martial arts |
| Creative | cooking, drawing, music |
| Technical | computers, electronics |
| Practical | housework, gardening |

### Skill → Stat Dönüşümü
```
Fiziksel skill +5 → İlgili fitness statına ×0.25 (+1.25)
Skill kategorisi → İlgili mental/social stat ×0.10
```

---

## 8. ZAMAN SİSTEMİ

### Değişkenler
```javascript
$timeSys = {
    year: 2025,
    month: 6,
    day: 1,
    hour: 8,
    minute: 0,
    currentPeriod: "morning"
}
```

### Zaman Dilimleri
| Dilim | Saat Aralığı |
|-------|-------------|
| morning | 06:00 - 12:00 |
| afternoon | 12:00 - 18:00 |
| evening | 18:00 - 22:00 |
| night | 22:00 - 06:00 |

### Zaman İlerleme
```twee
<<advanceTime dakika>>
```
- Saatlik decay otomatik tetiklenir
- Karakter schedule'ları güncellenir

---

## 9. AKTİVİTE SİSTEMİ

### Aktivite Yapısı
```javascript
// setup.characterActions[charId][location] formatında
{
    id: "talk",
    label: "Talk",
    passage: "TalkPassage",
    minPlayerEnergy: 5,
    dailyLimit: true,
    timeWindow: [
        { startHour: 8, endHour: 22 }
    ],
    requirements: { friendship: 20 },
    tags: ["social"]  // contentPreferences ile filtrelenir
}
```

### Örnek Aktiviteler ve Stat Değişimleri
| Aktivite | Süre | Enerji | Stres | Skill | Özel |
|----------|------|--------|-------|-------|------|
| Sleep | 8h | +100 | -50 | - | energy ≤ 30 gerekli |
| Dance | 30m | -20 | -15 | +5 dance | 1×/gün, +1.25 cardio/core |
| Park Yoga | 45m | -15 | -20 | +7 yoga | +1.75 core/lowerBody |
| Eat Food | 20m | +5 | -5 | - | -50 hunger, -100 thirst |
| Talk | 15m | -5 | - | - | 1×/lokasyon/gün, F/T/L gain |
| Shower | 15m | - | -10 | - | +50 hygiene |
| Watch TV | 30m | -5 | -20 | - | mood +10 |

### Duration Presets (DurationPresets.twee)
```javascript
setup.durationPresets = {
    "sleepDuration": [
        { label: "6 hours", value: 360 },
        { label: "8 hours", value: 480 },
        { label: "10 hours", value: 600 }
    ],
    "exerciseDuration": [
        { label: "15 min", value: 15 },
        { label: "30 min", value: 30 },
        { label: "45 min", value: 45 }
    ]
};
```

---

## 10. KIYAFET SİSTEMİ (Wardrobe)

### Kategori Dosyaları (0 - System/WardrobeSys/)
| Dosya | Kategoriler |
|-------|------------|
| wardrobeTops.twee | T-shirt, Blouse, Tank Top, Sweater |
| wardrobeBottoms.twee | Jeans, Skirt, Shorts, Leggings |
| wardrobeDresses.twee | Casual Dress, Evening Dress |
| wardrobeBras.twee | Bra tipleri |
| wardrobeUnderwear.twee | Underwear tipleri |
| wardrobeSocks.twee | Çorap tipleri |
| wardrobeShoes.twee | Ayakkabı tipleri |
| wardrobeAccessories.twee | Aksesuarlar |
| wardrobePlayerState.twee | Oyuncu giysi durumu |
| wardrobeConfig.twee | Sistem konfigürasyonu |

### Outfit Scoring
Kıyafet puanı → `$looks` ve `$charisma` statlarına etki eder.

---

## 11. MAĞAZA SİSTEMİ

### Item Database (ItemDatabase.twee)
```javascript
setup.items = {
    "item_id": {
        name: "Item Name",
        price: 50,
        category: "clothing",
        description: "...",
        image: "path/to/image.jpg",
        // ... özellikler
    }
};
```

### Para Sistemi
```
$money        → Nakit
$bankBalance  → Banka hesabı
```

---

## 12. CSS MİMARİSİ

### CSS Variables (variables.css)
```css
:root {
    /* Renkler */
    --color-primary: #ec4899;     /* Ana pembe */
    --color-bg: #0a0a0a;          /* Arka plan */
    --color-text: #e0e0e0;        /* Metin */
    --color-success: #22c55e;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-info: #3b82f6;
    --color-quest: #f59e0b;       /* Quest altın */

    /* Layout */
    --topbar-height: 48px;
    --rightbar-width: 320px;
    --content-max-width: 800px;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}
```

### Z-Index Hiyerarşisi
| Z-Index | Kullanım |
|---------|----------|
| 1 | Temel elemanlar |
| 90 | Rightbar |
| 100 | Dropdown'lar |
| 200 | Overlay'ler |
| 1000-15000 | Modal'lar (stats, character, saveload) |
| 20000 | Prompt dialog'lar |
| 30000 | Notification'lar (en üstte) |

### Önemli CSS Sınıfları
```css
/* Butonlar */
.btn-style              → Temel buton
.btn-default             → Varsayılan stil
.btn-primary             → Ana renk
.btn-danger              → Tehlike (kırmızı)
.btn-success             → Başarı (yeşil)
.btn-quest               → Quest (altın)
.btn-style.locked        → Kilitli buton

/* Layout */
.page-wrapper            → Sayfa sarmalayıcı
.passage                 → Passage içerik alanı
.fullscreen-layout       → Topbar+rightbar gizli
.has-navmenu             → NavMenu aktif

/* Diyalog */
.dialogue                → Diyalog sarmalayıcı
.dialogue .avatar        → Karakter avatarı
.dialogue .card          → Konuşma kartı
.narrative               → Anlatı bloğu
.thought-block           → Düşünce bloğu

/* Navigasyon */
.nav-card                → Navigasyon kartı
.nav-card.location-closed → Kapalı lokasyon
.nav-card-status         → Açık/Kapalı badge

/* Aksiyonlar */
.location-actions        → Aksiyon buton grubu
.action-btn              → Aksiyon butonu
.action-btn.locked       → Kilitli aksiyon
```

---

## 13. PASSAGE ADLANDIRMA KONVANSİYONLARI

### Formatlar
```
Lokasyonlar:    FamilyHouseKitchen, DownTownMall, MallFloorGround
Quest'ler:      quest_find_job_town_hall_entrance
Aksiyonlar:     watchTV, parkYoga, takeShower
Etkileşimler:   MotherTalk, FatherTalkPreWork
Sistem:         SaveVersion, variablesBase, charPlayer
```

### Passage Tag'leri
```
[startscreen]    → Başlangıç ekranı
[hide-nav]       → Navigasyon gizle
[nobr]           → Satır kırma yok
[widget]         → Widget passage'ı
```

### Passage Meta
```twee
:: PassageName [tag1 tag2]
```

---

## 14. SAVE / LOAD SİSTEMİ

### Save Version Migration
```javascript
$saveVersion = 1  // Mevcut save versiyonu
```
- `SaveVersion.twee` passage'ı migration kodu içerir
- `window.runSaveVersion()` → Save yüklendiğinde çalışır
- Eski save'leri yeni formata taşır

### Save/Load API
```javascript
window.SaveLoadAPI = {
    State: State,
    Engine: Engine,
    // ... tüm API
};
```

---

## 15. UI OVERLAY SİSTEMLERİ

### Modal Sistemi
```javascript
window.ModalTabSystem = {
    create(options) {
        // options.title, options.tabs[], options.onClose
    }
};
```

Modal tipleri:
- **Stats Modal** → Fiziksel, mental, sosyal, özel stat sekmeleri
- **Character Modal** → Karakter etkileşim, ilişki bilgisi
- **Journal Modal** → Quest log, zaman çizelgesi
- **Relations Modal** → İlişki takipçisi, tier gösterimi
- **Save/Load Modal** → Kayıt/yükleme arayüzü
- **Settings Modal** → Gameplay, görünüm, bildirim ayarları

### Phone Overlay
- `window.PhoneSystem` → Telefon arayüzü
- Aramalar, mesajlar, bildirimler

### Map Overlay
- `window.MapSystem` → Harita arayüzü
- Tıklanabilir sakinler ve mağaza kartları
- Lokasyonlar arası navigasyon

---

## 16. BİLDİRİM SİSTEMİ

### JavaScript API
```javascript
window.showNotification({
    type: 'success',      // success, error, warning, info, quest
    message: 'Mesaj',
    duration: 3000,       // ms
    position: 'rightbar-left' // opsiyonel konum
});
```

### Notification Değişkenleri
```javascript
$notificationEnergy    // Enerji bildirimleri aç/kapa
$notificationHealth    // Sağlık
$notificationMood      // Moral
$notificationArousal   // Uyarılma
$notificationBladder   // Mesane
$notificationThirst    // Susuzluk
$notificationHunger    // Açlık
$notificationBed       // Uyku
$notificationAlarm     // Alarm
```

---

## 17. UI GÖRÜNÜRLuK KONTROLLERI

### Topbar
```javascript
$hideTopbar               // Tüm topbar
$hideTopbarHamburger      // Hamburger menü
$hideTopbarNavLeft        // Sol navigasyon
$hideTopbarNavRight       // Sağ navigasyon
$hideTopbarTimebox        // Zaman kutusu
$hideTopbarNotifications  // Bildirimler
```

### Rightbar
```javascript
$hideRightbar             // Tüm rightbar
$hideRightbarGameInfo     // Oyun bilgisi
$hideRightbarProfile      // Profil
$hideRightbarStats        // Stat gösterimi
$hideRightbarPhone        // Telefon
$hideRightbarMap          // Harita
```

### Fullscreen Layout
`$hideTopbar + $hideRightbar` → `body.fullscreen-layout` CSS sınıfı eklenir

---

## 18. OYUN AKIŞI

```
[startscreen] → Start
    ↓
GameStart → settingsPage → confirmationPage → prologuePage
    ↓
Backstory Passages (6-9) → Karakter geçmişi seçimleri
    ↓
Prologue Events (ev tanıtım, akşam yemeği, gece)
    ↓
Day 1 (nextDayMorning) → Ana oyun döngüsü
    ↓
Hub Lokasyonlar ↔ Aktiviteler ↔ NPC Etkileşimleri ↔ Quest'ler
```

### Ana Lokasyonlar
| Bölge | Alt Lokasyonlar |
|-------|----------------|
| Maplewood | Family House (Bedroom, Kitchen, Livingroom, Bathroom, Garden) |
| Downtown | Mall (3 kat), City Hall, Restaurant, Night Club |
| Skyline | Tower A (Gym, Basketball), Tower B (Bank), Tower C |
| Marina Bay | Beach, Pier |
| Old Town | Civic Center (Town Hall) |
| Hillcrest | Golf Club, Fifth Street |
| University District | (planlanan) |
| Suburbs | Gang Territory |

---

## 19. LOKASYON SİSTEMİ

### Lokasyon Saatleri
```javascript
setup.locationHours = {
    "mall": { open: 10, close: 22 },
    "bank": { open: 9, close: 17 },
    "gym": { open: 6, close: 23 },
    "nightclub": { open: 21, close: 4 },
    "park": { open24h: true }
};
```

### Keşif Sistemi
```javascript
$discoveredMall = false      // false → navCard gizli
$discoveredMall = true       // true → navCard görünür
// undefined → varsayılan görünür
```

### Seyahat Süresi
```javascript
setup.getTravelTime(fromLocation, toLocation) → dakika
```

### Lokasyon Görselleri
```javascript
setup.locationImages = {
    "mall": "assets/content/locations/mall.jpg",
    // ...
};
window.LocationSystem → Arka plan resmi yönetimi
```

---

## 20. DIYALOG / ETKİLEŞİM SİSTEMİ

### Konuşma Veritabanı Yapısı
```
passages/3 - Interactions/
├── FamilyHouse/
│   ├── Mother/talkDatabase/
│   │   └── CommonTopics.twee (14 konu)
│   ├── Father/talkDatabase/
│   │   ├── CommonTopics.twee
│   │   ├── PreWorkTopics.twee    ← Faz bazlı
│   │   └── PostWorkTopics.twee
│   └── Brother/talkDatabase/
│       ├── CommonTopics.twee
│       ├── SchoolTopics.twee     ← Durum bazlı
│       └── VacationTopics.twee
```

### Tier Bazlı Diyalog
```twee
<<if $characters.mother.stats.friendship >= 70>>
    Tier 3 diyaloğu (çok yakın)
<<elseif $characters.mother.stats.friendship >= 40>>
    Tier 2 diyaloğu (samimi)
<<else>>
    Tier 1 diyaloğu (mesafeli)
<</if>>
```

### Konuşma İlişki Kazanımları
| Tier | Friendship | Trust | Love |
|------|-----------|-------|------|
| 1 | +2 | +1 | 0 |
| 2 | +3 | +2 | +1 |
| 3 | +2 | +3 | +3 |

---

## 21. DOSYA DÜZENLEme REHBERİ

### Yeni Lokasyon Eklemek
1. `passages/2 - Locations/` altına `.twee` dosyası oluştur
2. `setup.navCards` veya `setup.locationImages` güncelle
3. `setup.locationHours` gerekirse ekle
4. NavMenu'ye `<<navCard>>` ekle
5. Keşif değişkeni `$discovered{Name}` başlangıçta ayarla

### Yeni Karakter Eklemek
1. `passages/0 - System/Init/characters/` altına `char{Name}.twee` oluştur
2. `$characters` objesine karakter tanımını ekle
3. Schedule, stats, avatar tanımla
4. Diyalog dosyalarını `passages/3 - Interactions/` altına oluştur
5. `setup.characterActions` ile etkileşimleri tanımla

### Yeni Quest Eklemek
1. `setup.quests` objesine quest tanımı ekle
2. `passages/5 - QuestSystem/Quests/` altına passage dosyaları oluştur
3. Quest'i tetikleyecek mekanizmayı belirle (lokasyon, önceki quest, vb.)
4. `<<startQuest>>` ile başlat

### Yeni Aktivite Eklemek
1. `passages/4 - Actions/` altına passage oluştur
2. `setup.characterActions` veya `setup.durationPresets` güncelle
3. Stat değişimlerini widget ile tanımla
4. Günlük limit gerekirse `$daily` flag'i ekle

### Yeni CSS Modülü Eklemek
1. İlgili `assets/system/css/{kategori}/` altına dosya oluştur
2. `config.js` → `window.SystemCSS.{kategori}` array'ine ekle

### Yeni JS Modülü Eklemek
1. İlgili `assets/system/js/{kategori}/` altına dosya oluştur
2. `window.{ModuleName}Init = function(API) { ... }` pattern'i kullan
3. `config.js` → `window.SystemModules.{kategori}` array'ine ekle

---

## 22. DEBUG & GELİŞTİRME

### Debug Panel
- `debug.js` → Floating debug paneli
- Konsol logları `[Loader]`, `[Quest V2]`, `[SaveVersion]` prefix'li

### Konsol Komutları
```javascript
// State erişimi
State.variables.energy          // Stat oku
State.variables.energy = 100    // Stat değiştir
State.variables.characters.mother.stats.friendship = 70  // İlişki değiştir

// Quest kontrolü
setup.quests                    // Tüm quest tanımları
State.variables.questState      // Aktif/tamamlanmış questler

// Passage navigasyonu
Engine.play("PassageName")      // Passage'a git

// Modül erişimi
window.wardrobeModule           // Wardrobe API
window.shopModule               // Shop API
window.LocationSystem           // Location API
window.ModalTabSystem           // Modal API
```

### Sık Karşılaşılan Sorunlar
| Sorun | Çözüm |
|-------|-------|
| Modül yüklenmedi | config.js'te modül adı doğru mu kontrol et |
| Passage bulunamadı | Passage adı ve `::` başlığı eşleşiyor mu kontrol et |
| Quest tetiklenmiyor | triggers.location doğru mu, forceScene true mı kontrol et |
| Buton kilitli | minEnergy, requirements, dailyLimit kontrol et |
| CSS uygulanmıyor | config.js'te CSS dosyası listelenmiş mi kontrol et |

---

## 23. ÖNEMLİ DOSYA REFERANSLARI

| Dosya | Satır | İçerik |
|-------|-------|--------|
| `storyJavaScript.js` | 1-106 | Modül loader sistemi |
| `storyJavaScript.js` | 108-141 | Save version migration |
| `storyJavaScript.js` | 179-582 | Quest System V2 (tüm macro'lar) |
| `storyJavaScript.js` | 584-644 | `<<btn>>` macro |
| `storyJavaScript.js` | 646-811 | `<<btnPicker>>` macro |
| `storyJavaScript.js` | 815-870 | Dynamic button styles |
| `storyJavaScript.js` | 872-918 | `<<wardrobe>>` macro |
| `storyJavaScript.js` | 920-963 | `<<shop>>` macro |
| `storyJavaScript.js` | 965-1091 | Dialog macro'ları (dialog, narrative, thought) |
| `storyJavaScript.js` | 1093-1235 | Media macro'ları (vid, image) |
| `storyJavaScript.js` | 1237-1361 | `<<showActions>>` macro |
| `storyJavaScript.js` | 1363-1587 | Navigation (navMenu, navCard, processNavCard) |
| `storyJavaScript.js` | 1590-1630 | Utility macro'lar (notify, domInclude) |
| `config.js` | 1-41 | JS modül listesi |
| `config.js` | 43-107 | CSS modül listesi |

---

## 24. HIZLI BAŞVURU - DEĞIŞKEN TABLOSU

### Oyuncu Verileri
| Değişken | Tip | Açıklama |
|----------|-----|----------|
| `$player` | Object | Oyuncu detay objesi |
| `$energy` | Number | Enerji (0-100) |
| `$health` | Number | Sağlık (0-100) |
| `$mood` | Number | Moral (0-100) |
| `$stress` | Number | Stres (0-100) |
| `$arousal` | Number | Uyarılma (0-100) |
| `$hygiene` | Number | Hijyen (0-100) |
| `$hunger` | Number | Açlık (0-100) |
| `$thirst` | Number | Susuzluk (0-100) |
| `$bladder` | Number | Mesane (0-100) |
| `$money` | Number | Nakit para |
| `$bankBalance` | Number | Banka bakiyesi |
| `$fitness` | Number | Hesaplanmış fitness |
| `$looks` | Number | Hesaplanmış görünüm |
| `$confidence` | Number | Hesaplanmış özgüven |

### Sistem Verileri
| Değişken | Tip | Açıklama |
|----------|-----|----------|
| `$timeSys` | Object | Zaman sistemi |
| `$characters` | Object | Tüm karakter verileri |
| `$questState` | Object | Quest durumları |
| `$location` | String | Mevcut lokasyon ID |
| `$daily` | Object | Günlük aktivite flagleri |
| `$saveVersion` | Number | Save format versiyonu |
| `$pickerMemory` | Object | btnPicker son seçimleri |
| `$selectedDuration` | Number | Son seçilen süre (dakika) |
| `$contentPreferences` | Object | İçerik tercihleri |
| `$videoSettings` | Object | Video ayarları |
| `$dailyActivityLog` | Object | Günlük aktivite logu |

### Setup Verileri (Sabit Config)
| Değişken | Açıklama |
|----------|----------|
| `setup.quests` | Quest tanımları |
| `setup.durationPresets` | Süre preset'leri |
| `setup.items` | Item veritabanı |
| `setup.characterActions` | Karakter eylemleri |
| `setup.navCards` | Navigasyon kart verileri |
| `setup.locationHours` | Lokasyon çalışma saatleri |
| `setup.locationImages` | Lokasyon görselleri |
| `setup.gameName` | Oyun adı ("Deneme") |
| `setup.gameVersion` | Oyun versiyonu ("Beta") |

---

*Son güncelleme: 2026-02-07*
