# PJX — Proje Özeti (Altyapı, Modüller, İçerik)

Twine / SugarCube hikâyesi; UI ve oyun mantığının büyük kısmı `assets/system` altında **kategorize JS + CSS** modülleri ve `passages/0 - System/storyJavaScript.js` içindeki **makrolar** ile bağlanır. Bu dosya: modül listeleri, dosya yolları ve passage tarafı içerik envanterini içerir.

---

## 1. Modüllerin yüklenmesi

- **Tek doğruluk kaynağı:** `assets/system/config.js` içinde `window.SystemModules` (JS) ve `window.SystemCSS` (CSS) dizileri. Sıra yorumlarda “load order matters” diye işaretli.
- **Çalışma anı:** `PJX.html` ve `passages/0 - System/storyJavaScript.js` içinde aynı mantıkla döngüler var: önce CSS kategorileri (`base` → `layout` → `ui` → `screens` → `systems` → `utils`), sonra JS (`utils` → `ui` → `modal` → `system`). Her isim şu kalıba çözülür:
  - JS: `assets/system/js/` + kategori yolu + `.js` (örn. `ui/phone/index` → `assets/system/js/ui/phone/index.js`)
  - CSS: `assets/system/css/` + kategori yolu + `.css`

Yeni özellik eklerken genelde hem `config.js`’e kayıt hem ilgili klasörde dosya gerekir.

---

## 2. JavaScript modülleri (`SystemModules`)

Dosya kökü: `assets/system/js/`.

### 2.1 `utils` (önce yüklenir)

| Config adı | Dosya | Kısa rol |
|------------|--------|----------|
| `modal` | `utils/modal.js` | ModalTabSystem tabanlı modal altyapısı |
| `tooltip` | `utils/tooltip.js` | Tooltip yardımcıları |
| `notification` | `utils/notification.js` | Toast / `showNotification` |
| `accordion` | `utils/accordion.js` | Akordeon / olay bağlama |

### 2.2 `ui`

| Config adı | Dosya | Kısa rol |
|------------|--------|----------|
| `layout` | `ui/layout.js` | Passage sarmalayıcı, sayfa düzeni |
| `topbar` | `ui/topbar.js` | Üst çubuk |
| `rightbar` | `ui/rightbar.js` | Sağ şerit (profil, telefon kısayolu vb.) |
| `phone/utils` … `phone/index` | `ui/phone/*.js` | Telefon mockup: mesaj, rehber, takvim, Fotogram, DM, Finder, konu başlıkları, kamera, galeri, ana giriş |
| `map` | `ui/map.js` | Harita katmanı (rightbar ile entegre) |
| `startscreen` | `ui/startscreen.js` | Başlangıç ekranı |
| `mainmenu` | `ui/mainmenu.js` | Ana menü paneli |
| `debug` | `ui/debug.js` | Yüzen debug paneli |
| `toggle` | `ui/toggle.js` | Özel toggle bileşeni |
| `dropdown` | `ui/dropdown.js` | Özel açılır menü |

### 2.3 `modal` (`Modal.create` tabanlı pencereler)

| Config adı | Dosya | Kısa rol |
|------------|--------|----------|
| `saveload` | `modal/saveload.js` | Kayıt / yükle |
| `settings` | `modal/settings.js` | Ayarlar sekmeleri |
| `stats` | `modal/stats.js` | İstatistik sekmeleri |
| `relations` | `modal/relations.js` | İlişkiler |
| `character` | `modal/character.js` | Karakter kartı sekmeleri |
| `journal` | `modal/journal.js` | Günlük (quest / keşif uyumu) |

### 2.4 `system` (oyun özellikleri, passage makroları ile konuşur)

| Config adı | Dosya | Kısa rol |
|------------|--------|----------|
| `wardrobe` | `system/wardrobe.js` | `<<wardrobe>>` makro handler |
| `location` | `system/location.js` | Konum arka planı / görsel |
| `shopping` | `system/shopping.js` | `<<shop>>`, sepet, ödeme |
| `restaurant` | `system/restaurant.js` | `<<restaurant>>`, menü |
| `reading` | `system/reading.js` | `<<readingScreen>>`, okuma akışı |

---

## 3. CSS modülleri (`SystemCSS`)

Dosya kökü: `assets/system/css/`. İsimler `config.js` içindeki sırayla yüklenir.

### 3.1 `base`

`variables.css`, `reset.css`, `icons.css` — tasarım değişkenleri, sıfırlama, ikon maskeleri.

### 3.2 `layout`

`structure.css`, `topbar.css`, `rightbar.css`, `mainmenu.css` — iskelet, üst/sağ çubuk, menü.

### 3.3 `ui`

`buttons.css`, `modals.css`, `dialog.css`, `tabs.css`, `forms.css`, `navigation.css`, `settings.css`, `toggle.css`, `dropdown.css`.

### 3.4 `screens`

`welcome.css`, `startscreen.css`, `gamesetup.css`, `prologue.css` — tam ekran / akış ekranları.

### 3.5 `systems`

Telefon (`phone.css`, `phone-camera.css`, `phone-gallery.css`, `phone-fotogram.css`), `map.css`, `wardrobe.css`, `shopping.css`, `restaurant.css`, `inventory.css`, `relations.css`, `stats.css`, `journal.css`, `quest.css`, `profile.css`, `character.css`, `character-appearance.css`, `character-outfit.css`, `saveload.css`, `alarm.css`, `read.css`.

### 3.6 `utils`

`debug.css`, `notifications.css`, `tooltips.css`, `animations.css`, `utilities.css`, `media.css`.

### 3.7 Repo’da config dışı CSS

`assets/system/css/systems/location-nav.css` dosyası vardır; `config.js` içindeki `SystemCSS` listesinde görünmüyor — ya unutulmuş ya da başka bir yolla ekleniyor; yeni stil eklerken çakışmayı kontrol et.

---

## 4. Story tarafı: `storyJavaScript.js` makroları

Dosya: `passages/0 - System/storyJavaScript.js`. Seçilmiş makrolar:

| Makro | Görev özeti |
|--------|----------------|
| `questPrompts` | Aktif quest’e göre ipucu / prompt UI |
| `startQuest` | `setup.quests[id]` ile quest başlatma, gereksinim kontrolü |
| `advanceQuestStage` | Aşama ilerletme (passage başına çoklu ilerleme sınırları ile) |
| `completeObjective` / `completeQuest` | Hedef ve görev tamamlama |
| `getQuestHint` | İpucu metni |
| `btn` / `btnPicker` | Standart buton ve seçim UI |
| `jobWorkPicker` | İş vardiyası seçimi |
| `wardrobe` / `shop` / `readingScreen` / `restaurant` | İlgili system JS modüllerine köprü |
| `dialog` | Diyalog kutusu |
| `narrative` / `thought` | Anlatı / iç ses stilleri |
| `vid` / `image` | Medya yerleştirme |
| `showActions` | `setup.characterActions[char][loc]` → filtrelenmiş aksiyon butonları |
| `navMenu` | Navigasyon menüsü |
| `notify` | Bildirim kısayolu |
| `domInclude` | DOM parçası dahil etme |

Quest tam mantığı (gereksinimler, `forceScene`, item hedefleri) bu dosyada + `QuestDatabase_*.twee` şemasında.

---

## 5. İçerik hacmi (sayılar, repoya göre)

| Ne sayıldı | Adet | Not |
|------------|------|-----|
| Tüm `passages/**/*.twee` | **431** | Ana hikâye + sistem + gardırop DB satırları |
| `2 - Locations/**/*.twee` | **136** | Oyuncunun gezebildiği yerlerin passage dosyaları |
| `setup.navCards` anahtarları | **139** | `variablesNavigation.twee` — görünen isim, `meetup`, `cameraLoc`, bazen `passage` alias |
| `setup.locationImages` anahtarları | **139** | `variablesImageLocation.twee` — arka plan `.webp` yolu (dosya başındaki “121” yorumu güncel değil) |
| `setup.locations` hiyerarşi girişleri | **137** | parent + `type` (district / building / room …) |
| `1 - Prologue` | **18** | Yaş öyküsü, yeni ev, akşam/yemek, ertesi sabah |
| `3- Interactions` | **64+** | Diyalog + `talkDatabase` konu kütüphaneleri |
| `4 - Actions` (tümü) | **85+** | Rutin eylemler + `events/` |
| `4 - Actions/events` | **25** | Ruby’s Diner odaklı senaryolar |
| `5 - QuestSystem` (Quests altı) | **~30** | Zorunlu görev sahneleri |
| `7 - Work` | **4** | Bulaşıkhane iş akışı + küçük ara sahneler |

**136 passage vs 139 nav/görsel:** Aynı fiziksel yer için birden fazla kart vardır (ör. `mallBathroomFromGround` / `FromSecond` / `FromThird` hepsi `mallBathroom` passage’ına gider). Bazı bölgelerin harita/görsel tanımı vardır ama henüz ayrı `2 - Locations` dosyası yoktur (ileride doldurulacak iskelet).

---

## 6. Lokasyonlar — derin envanter

### 6.1 Bölge başına `.twee` dosya sayısı (`2 - Locations`)

| Klasör (bölge) | `.twee` sayısı |
|----------------|----------------|
| downTown | 39 |
| oldTown | 22 |
| maplewood | 18 |
| hillcrest | 13 |
| redLightCenter | 11 |
| marinaBay | 9 |
| universityDistrict | 9 |
| suburbs | 8 |
| southside | 7 |
| **Toplam** | **136** |

### 6.2 `variablesImageLocation.twee` — görsel envanter (bölge yorumları)

Dosya, her konum id’si için `assets/content/locations/.../*.webp` yolu tutar. Yorum bloklarındaki planlanan dağılım (metin dosyasındaki başlıklar):

- **Downtown:** şehir merkezi, AVM (3 kat + mağazalar + tuvalet + 3. kat: food court, güzellik salonu, sinema), skyline ve üç kule (spor salonu, basket/voleybol, banka, otel, caz kulübü, çatı restoran/lounge vb.).
- **Hillcrest:** üst gelir — sanat galerisi, golf kulübü (saha, restoran, spa), Fifth Avenue (şarap barı, butikler, lüks restoran, salon).
- **Maplewood:** mahalle, şapel, köşe market, park + WC, tüm aile evi odaları + `fhBrotherRoomPC` için özel sahne yolu `assets/content/scenes/...`.
- **Marina Bay:** marina, plaj, barlar, kulüp, restoran, iskele, dondurmacı, voleybol.
- **Old Town:** şehir merkezi görseli, civic center altı (belediye, lise, kütüphane, hastane, eczane, polis, posta), Ruby’s Diner alt mekânları, berber, kahve, kitapçı, hırdavat.
- **University District:** kampüs, yurt, frat/sorority, derslik, kütüphane, bar, kafeterya.
- **Southside:** apartman, sokak, çamaşırhane, fabrika, rehin, içki dükkanı.
- **Suburbs:** dış mahalle, motel, çete alanı, graffiti duvarı, crack ev vb.
- **Red Light Center:** sokak, bodrum girişi, neon bar, strip kulübü, glory hole barı, yetişkin dükkanı, motel, masaj, özel odalar.

### 6.3 Navigasyon ve seyahat süresi

`variablesNavigation.twee` içinde:

- **`setup.navCards`:** Oyuncunun gördüğü yer adı (`name`), isteğe bağlı `passage`, `meetup: true` (AVM, diner, kahve), **telefon/kamera kuralları** (`cameraLoc`: `public` | `safe` | `forbidden` | `never` + bazen `cameraExhibitionismMin`).
- **`setup.locations`:** `parent` zinciri ve `type`: `district`, `area`, `building`, `house`, `room`, `subroom`.
- **Seyahat süresi özeti (dosyadaki tablo):** aynı bina içi oda ↔ oda **1 dk**; oda ↔ üst bina **1 dk**; bina ↔ bina **5 dk**; ilçe ↔ ilçe **15 dk**.

---

## 7. Görseller ve medya (nasıl çalışır, dosyalar nerede)

### 7.1 Bu repoda ikili dosyalar

Çalışma kopyasında `assets/content/**` altında `.webp/.png` araması **0 sonuç** verebilir: görseller genelde **ayrı paketlenir**, `.gitignore` / büyük medya deposu ile tutulur. Yine de **tüm yollar Twee ve Init dosyalarında tanımlıdır**; build sırasında aynı klasör yapısı beklenir.

### 7.2 Konum arka planları (full-screen)

1. Lokasyon passage’ı `<<set $location = "fhKitchen">>` (veya eşdeğeri) atar.
2. `assets/system/js/system/location.js` — `:passagerender` / `:passageend` sonrası `setup.locationImages[$location]` yolunu alır.
3. `body::before` üzerine `background-image: url('...')` enjekte eder (`#dynamic-location-bg` style tag).
4. Tanımlar: **`passages/0 - System/Init/variablesImageLocation.twee`** (`setup.locationImages`).

### 7.3 Sahne / olay görselleri (passage içi)

- Makro: **`<<image "path" ...>>`** (`storyJavaScript.js`).
- Örnek yol: `assets/content/scenes/oldtown/rubysDiner/firstday/dinerTomGreeting.webp` (ilk iş günü).
- Quest, prolog, park, aile, diner eventleri bu kalıbı kullanır; yüzlerce benzersiz yol `grep "assets/content/" passages` ile listelenebilir.

### 7.4 Oyuncu görünümü (karakter oluşturma)

**`passages/0 - System/Init/variablesImage.twee`:**

- `setup.imageProfile` — profil görseli.
- `setup.playerAppearanceImages` — saç uzunluğu/dalga tipi, göğüs, kalça, vücut tipi anahtarları; hepsi `assets/content/people/player/body/...webp`.

### 7.5 Gardırop, eşya, menü, TV, telefon

- **`0 - System/WardrobeSys/wardrobe*.twee`:** kıyafet/aksesuar kartlarında çok sayıda `assets/content/people/player/clothes/...` veya eşdeğeri yol.
- **`ItemDatabase.twee`, `RestaurantDatabase.twee`:** ürün/restoran görselleri.
- **`watchTV.twee` vb.:** kanal/kapak görselleri.
- **`variablesPhonePhotos.twee`, `variablesPhoneMediaPools.twee`:** telefon galerisi / havuz görselleri.
- **Harita:** `variablesMap.twee` — bölge görselleri (`assets/content/...`).

---

## 8. Passage klasör mimarisi (özet tablo)

| Klasör | Rol |
|--------|-----|
| **0 - System** | Init, widget’lar, zaman, gardırop DB, telefon, harita, `storyJavaScript.js` |
| **1 - Prologue** | Kurulum + yaşam çizgisi + ilk gece |
| **2 - Locations** | Dünya haritası — yukarıdaki sayılar |
| **3- Interactions** | NPC diyaloğu + konu veritabanları |
| **4 - Actions** | Oyuncu eylemleri + `events/` |
| **5 - QuestSystem** | Quest V2 + sahne passage’ları |
| **7 - Work** | Ruby’s Diner bulaşıkhane işi ve ara eventler |

---

## 9. Karakterler (`Init/characters`)

Oyuncu: `charPlayer.twee`.

| Bölge | Init dosyaları |
|--------|----------------|
| maplewood / Family | `charMother`, `charFather`, `charBrother` |
| maplewood / cornerShop | `charMarcus` |
| maplewood / sunsetPark | `charLily` |
| oldtown / RubysDiner | Diana, Vince, Emma, Sofia, Jake, Tom, Mike, James |
| oldtown / townhall | Resepsiyon, kariyer memuru |

---

## 10. Gardırop sistemi (Wardrobe)

### 10.1 Dosyalar ve veri

| Parça | Dosya / konum |
|--------|----------------|
| Kategori + slot tanımı | `passages/0 - System/WardrobeSys/wardrobeConfig.twee` — `setup.wardrobeCategories`, `setup.slotLabels`, `setup.qualityColors` |
| Oyuncu state | `wardrobePlayerState.twee` — `$wardrobe.equipped`, `owned`, `outfits` (5 slot), `itemState` (kir/dayanıklılık), `wornToday`, `laundryBasket` |
| Kıyafet kayıtları | `setup.clothingData.<kategori>` — 20 `wardrobe*.twee` dosyasında JSON-benzeri nesne dizileri |
| UI + mantık | `assets/system/js/system/wardrobe.js` + `assets/system/css/systems/wardrobe.css` |
| Makro | `<<wardrobe>>` — `storyJavaScript.js`: isteğe bağlı `locationId`, `backPassage`, `noBack`, `jobId` (iş üniforması doğrulaması) |

### 10.2 Kategoriler ve slotlar (`wardrobeConfig.twee`)

- **Dış giyim:** coats → `coat`, tops → `top`, bottoms → `bottom`, dresses → `dress`, shoes, socks.
- **İç / plaj / uyku:** bodysuit, swimsuit, bikini (bra/panty slotları), bra, panty, sleepwear, garter.
- **Aksesuar:** earrings, necklace, bracelet, ring, bags, **apron** (iş önlüğü).
- Her eşya: `id`, `name`, `brand`, `desc`, `image` (`assets/content/clothing/...webp`), `slot`, `silhouette`, `baseLooks`, `price`, `quality` (Common / Rare / Premium), `warmth`, `sexinessScore`, `exposureLevel`, `durability`, `reqCorruption`, `reqConfidence`, `tags`, `store` (hangi mağaza satıyor), `shopAvailable`, `startOwned`, `locationId` (bazı iş/özel kıyafetler).

### 10.3 Eşya sayısı (repoda, `{"id":` satırları)

| Dosya | Kayıt sayısı |
|--------|----------------|
| tops | 97 |
| bottoms | 116 |
| dresses | 52 |
| shoes | 70 |
| coats | 22 |
| socks | 27 |
| bras | 53 |
| panties | 42 |
| sleepwear | 33 |
| bodysuits | 23 |
| swimsuits | 12 |
| bikini tops / bottoms | 16 + 16 |
| bags | 28 |
| garter | 21 |
| bracelet | 11 |
| earrings | 9 |
| rings | 9 |
| necklace | 12 |
| special | 1 |
| **Yaklaşık toplam** | **~670** tanımlı parça |

### 10.4 Çalışma özeti

- Gardırop açıldığında `wardrobe.js` kategorilere göre grid render eder; hover’da tooltip (kalite, looks, sexiness, exposure, kir, dayanıklılık, etiketler, gereksinim engeli).
- **Konum filtresi:** Belirli `locationId` ile açılırsa (ör. diner soyunma) sadece o yere ait + oturumda giyilen parçalar görünür.
- **Zaman:** `TimeWidgets.twee` içindeki `updateWardrobeWear` giyilen dakikayı ve kir birikimini günceller; görünüm/istatistik sistemleri bununla bağlantılıdır.

---

## 11. Telefon sistemi (Phone)

### 11.1 Mimari

- **JS modülleri** (`assets/system/config.js` → `ui/phone/*`): `utils`, `config`, ortak rehber/meetup/konu dosyaları, **Messages**, **Contacts**, **Calendar**, **Fotogram** (+ DM), **Finder**, **topic-system** (mesaj konusu seçimi + etkiler), **Camera**, **Gallery**, ana **`index`** (overlay, olaylar).
- **CSS:** `phone.css`, `phone-camera.css`, `phone-gallery.css`, `phone-fotogram.css`.
- **Story verisi:** `passages/0 - System/Init/variablesBase.twee` (telefon state), `Init/phone/*.twee` (konular, galeri havuzları, Fotogram içerikleri).

### 11.2 Durum değişkenleri (`variablesBase.twee` özeti)

- **Mesajlaşma:** `$phoneConversations`, `setup.phoneMessageTopics` (karakter id → konu listesi).
- **Sosyal:** `$phoneFotogramPosts`, `$phoneFotogramDMs`, `$phoneFollowers`, tarih/soğuma, `$phoneNotifications` (Fotogram / Finder).
- **Finder (tanışma):** `$phoneFinderProfile`, `$phoneFinderMatches`.
- **Rehber / randevu:** `$phoneContactsUnlocked`, `$phoneAppointments`, `$phoneBlocked`, `$phoneGeneratedContacts`, numara takası ile ilişkili alanlar.
- **Kamera:** günlük foto/video limiti, `$phoneCameraDaily`, bypass bayrakları.
- Diğer: arama günlüğü, ünlülük event listesi, konum/konu “son sorulan” haritaları.

### 11.3 Init içerik dosyaları (`Init/phone/`)

| Dosya | İçerik |
|--------|--------|
| `variablesPhoneTopicsMother.twee` | Anne için SMS konuları: `id`, `label`, `category`, `tier`, `timeAdvance`, `statGain`, çoklu `variations` (diyalog satırları + bazen `choice`) |
| `variablesPhoneTopicsFather.twee` | Baba konuları (aynı şema) |
| `variablesPhoneTopicsBrother.twee` | Kardeş konuları |
| `variablesPhonePhotos.twee` | Galeri / çekim için foto meta ve yollar (çok sayıda `assets/content/...`) |
| `variablesPhoneMediaPools.twee` | Havuzlar (rastgele / kategori) |
| `variablesPhoneGallery.twee` | Klasör / grid yapılandırması |
| `fotogramDMs.twee`, `fotogramComments.twee`, `fotogramDMInteractive.twee` | Fotogram DM ve yorum içerikleri |

### 11.4 Oyun içi davranış (kısa)

- **topic-system.js:** Konu seçilince ilişki istatistiklerine `statGain` uygular; `timeAdvance` dakikası varsa süreyi ilerletir (telefon açıkken state doğrudan güncellenir).
- **showActions:** Bekleyen `phoneAppointments` ile aynı konumdaysa meetup butonu çıkar; `swapNumbers` tek seferlik.
- Telefon, sağ şerit / tam ekran overlay üzerinden; rozet sayıları yorumda belirtildiği gibi çoğunlukla state’ten türetilir.

---

## 12. TalkDatabase — yüz yüze konu içeriği

Bu sistem **telefon SMS konularından ayrıdır**: tam ekran `<<narrative>>` / `<<dialog>>` / `<<image>>` ile çalışan, konum+zaman+bağlama göre seçilen **mini sahneler**.

### 12.1 Veri şeması (genel)

- **Üç seviyeli sözlük:** `setup.<karakter>Topics...` → **bağlam anahtarı** (ör. `fhKitchen_morning`) → **konu adı** (ör. `coffee`) → **dizi**.
- Dizinin her elemanı **tek bir varyasyon**: `{ text: \`...\`, friendship?, trust?, love?, lust? }`. `text` içinde `<<image>>` ve sahne yolu gömülü.
- **IMG MAPPING** yorumları (birçok dosyada): görsel dosya numarası ile konu adı eşlemesi — yazar için referans.

### 12.2 Varyasyon seçim algoritması (kod ile uyumlu)

Oyuncu “konuş” dediğinde passage **tek seferde** şunu yapar:

1. **Saat dilimi:** `morning` (6–12), `afternoon` (12–18), `evening` (18+); diner’da Emma için öğleden sonra üst sınır 17.
2. **Bağlam sözlüğü:** Anne örneği `setup.motherTopics["level" + friendshipLevel][_contextKey]`; bazı odalarda öğleden sonra yoksa **fallback** (ör. `fhParentsRoom` → akşam/sabah havuzuna düşme) — bkz. `motherTalkParentsRoom.twee`, `motherTalkBackyard.twee`.
3. **Rastgele konu:** `_topicKeys = Object.keys(_context)` → `_topicKey = _topicKeys.random()` (SugarCube: nesne anahtarlarından biri).
4. **Rastgele varyasyon:** `_topic = _context[_topicKey].random()` — yani seçilen konu altındaki diziden **tek** eleman.
5. **Uygulama:** `<<print _topic.text>>` + `_topic` içindeki istatistik alanları `gainCharacterStat` ile işlenir; çoğu aile konuşması ayrıca `<<advanceTime 15>>`, enerji/mood değişimi yapar.

**Diner (Emma):** `emmaTalkDinerRubys.twee` — önce **iş fazı** `_phase`: `common` | `dishwasherOnBreak` | `dishwasherDone` (`$job`, `$jobState.hoursToday`, son vardiya saati). Sonra `_ctxKey = $location + "_" + _phase + "_" + _timeSlot` (örn. `dinerRubys_common_morning`). Havuz yoksa `dinerRubys_common_<timeSlot>` fallback. Konu ve varyasyon yine `Object.keys` + `Math.random` ile seçilir (dizi indeksi).

**Özet:** Aynı “Konuş” butonuna her basışta **farklı konu** veya **aynı konunun farklı yazılmış metni** gelebilir; tekrar oynanabilirlik buradan gelir. Tam metin listesi yalnızca ilgili `talkDatabase/*.twee` dosyasında.

### 12.3 Anne — bağlamlar ve konu isimleri (Level 1, IMG MAPPING)

| Bağlam anahtarı | Konu anahtarları (her birinin altında çoklu `text` varyantı) |
|-----------------|---------------------------------------------------------------|
| `fhKitchen_morning` | coffee, breakfast, smalltalk |
| `fhKitchen_afternoon` | leftovers, chores, errand |
| `fhKitchen_evening` | dinner, family, help |
| `fhLivingroom_morning` | news, laundry, newHouse |
| `fhLivingroom_afternoon` | reading, tv, task |
| `fhLivingroom_evening` | unwind, checkIn, endOfDay |
| `fhBackyard_morning` | garden, coffee, quietMoment |
| `fhBackyard_afternoon` | watering, resting, observation |
| `fhParentsRoom_morning` | gettingReady, lost, bedMaking |
| `fhParentsRoom_evening` | tired, goodnight, reflection |

**Level 2** (`MotherTopicsLevel2.twee`): Aynı **10 bağlam** (`fhKitchen_morning` … `fhParentsRoom_evening`); ton ve istatistik aralığı dosya başı yorumunda; konu isimleri L1 ile aynı ailede tutarlı (içerik metni daha sıcak / daha uzun varyantlar).

### 12.4 Baba — konu isimleri (IMG MAPPING)

**Pre-work Level 1** (`FatherTopicsPreWorkLevel1.twee`):

| Bağlam | Konular |
|--------|---------|
| `fhKitchen_preWork_morning` | coffee, news, schedule |
| `fhKitchen_preWork_evening` | dinner, family, plans |
| `fhLivingroom_preWork_morning` | news, reading, settling |
| `fhLivingroom_preWork_afternoon` | unpacking, sports, smalltalk |
| `fhLivingroom_preWork_evening` | tv, decompressing, family |
| `fhBackyard_preWork_afternoon` | yardwork, tools, observation |
| `fhGarage_preWork_morning` | project, tools, plans |
| `fhGarage_preWork_afternoon` | carwork, radio, break |
| `fhParentsRoom_preWork_morning` | reading, gettingReady, morning |
| `fhParentsRoom_preWork_evening` | windingDown, quiet, tomorrow |

Passage tarafı `$flags.fatherStartedWork` ile **preWork / postWork** havuzunu seçer; post-work için **Level 1 ve Level 2** dosyalarında ayrı IMG MAPPING tabloları vardır (mutfak sabah/akşam, oturma odası akşam, garaj akşam, ebeveyn odası sabah/akşam; L2’de daha derinlemesine konu adları — dosyadaki yorum satırlarıyla birebir).

### 12.5 Kardeş — faz ve bağlamlar

| Faz | Dosya | Bağlam anahtarları (özet) |
|-----|--------|----------------------------|
| Okul L1 | `BrotherTopicsSchoolLevel1.twee` | `fhKitchen_school_morning/evening`, `fhBrotherRoom_school_afternoon/evening`, `fhLivingroom_school_afternoon/evening` (6 bağlam) |
| Okul L2 | `BrotherTopicsSchoolLevel2.twee` | Aynı yapı, friendshipLevel 2 |
| Tatil L1 | `BrotherTopicsVacationLevel1.twee` | Oda/mutfak/oturma odası + arka bahçe: `fhBrotherRoom_vacation_*`, `fhKitchen_vacation_*`, `fhLivingroom_vacation_*`, `fhBackyard_vacation_*` (8 bağlam) |
| Tatil L2 | `BrotherTopicsVacationLevel2.twee` | Aynı vacation bağlamları, seviye 2 |

Her bağlam altında yine **konu adı → varyant dizisi** (ör. `sluggish`, `rarelyAwake` …); tam isimler ilgili Twee içinde. **Kardeş mutfak:** öğleden sonra için ayrı havuz yoksa `_ctxKey` akşam veya sabah havuzuna **fallback** (`brotherTalkKitchen.twee`). Tatil fazı `$flags.summerBreak` ile seçilir (okul dışı).

### 12.6 Diner — 30 talkDatabase dosyası ve bağlam

Her çalışan için üç veri seti:

| Dosya kalıbı | Oyunda seçim |
|----------------|---------------|
| `*TopicsCommonLevel1` | `_phase === "common"` |
| `*TopicsDishwasherOnBreakLevel1` | Ruby bulaşık işi, gün içi 0–8 saat arası |
| `*TopicsDishwasherDoneLevel1` | Aynı gün 8 saat tamam + son 3 saat içinde |

**Emma Common Level 1 örneği** (`EmmaTopicsCommonLevel1.twee`):

| Bağlam | Konu anahtarları | Örnek varyasyon sayısı (dizi uzunluğu) |
|--------|------------------|----------------------------------------|
| `dinerRubys_common_morning` | tired_morning, the_rush | her biri **3** varyant |
| `dinerRubys_common_afternoon` | sofia_complaint, closing_time | her biri **3** varyant |

Diğer çalışanların dosyalarında bağlam ve konu isimleri aynı mantıkla tanımlı; `friendshipLevel` ilerledikçe `level2` havuzları eklenebilir (Emma’da `level1` görülen yapı).

### 12.7 Ana talk passage’ları ve özel dallar

- `motherTalkKitchen.twee`, `emmaTalkDinerRubys.twee` vb. yalnızca **seçim mantığını** içerir; asıl metin **talkDatabase** passage’larında kalır.
- **Diana dedikodu:** `*_dianaGossip.twee` — talkDatabase dışı, sabit veya dallı passage akışı.

---

## 13. Sunset Park — aktiviteler, tekrar ve varyasyonlar

Konum passage: `2 - Locations/maplewood/sunsetPark.twee`. Eylemler `4 - Actions/maplewood/sunsetPark/`.

### 13.1 Tek seferlik vs günlük kilit

| Aktivite | Passage | Tekrar |
|----------|---------|--------|
| **Bench — Lily tanışması** | `parkBench.twee` → koşul sağlanırsa `parkBench_firstEncounter` | **Tek sefer:** `$flags.parkBenchFirstEncounter` yok, Lily’nin konumu `sunsetPark` iken tetiklenir; sonra bayrak set edilir. |
| **Koşu** | `parkJog.twee` | **Günde bir:** `<<set $daily.jogDone = true>>`; buton `activityButton` ile `$daily.jogDone` doluysa pasif. |
| **Yoga** | `parkYoga.twee` | **Günde bir:** `$daily.yogaDone`; ayrıca `outfit:sporty`, `item:yoga_mat`, min enerji. |
| **Dinlen (Rest)** | `parkRest.twee` | **Sınırsız** (günlük bayrak yok). |
| **Bank (Lily sonrası)** | `parkBench_rest.twee` | **Sınırsız**; her seferinde rastgele sahne. |
| **Yürüyüş** | `parkWalk.twee` | **Sınırsız**; rastgele yürüyüş metni/video; akşamı **çalı olayı** şartlı. |

### 13.2 `parkBench_rest` — katmanlı rastgele

- Süre: `$selectedDuration` (varsayılan 30 dk) → stres↓, mood↑.
- `_sceneMode = random(1, 2)`:  
  - **Mod 1:** Sade park oturma — `random(1,2)` ile iki video/metin çiftinden biri.  
  - **Mod 2:** Saat dilimine göre (`morning` / `afternoon` / `evening`) çiftlerden biri — her dilimde `random(1,2)` ile 2 alternatif video + metin.

### 13.3 `parkWalk` — yürüyüş varyantları ve çalı

- 15 dk, stres↓, mood↑; `_sceneMode` 1 veya 2.  
- Mod 1: 4 genel yürüyüş (3 park + 1 kuş sahnesi).  
- Mod 2: sabah 2, öğleden sonra **4**, akşam **3** farklı “parkta başkalarını görme” videosu/metni.  
- **Çalı:** Yalnız `_timeSlot === "evening"` iken `random(1,3) === 1` (**yaklaşık 1/3**) → `parkWalk_bushEncounter` include.

### 13.4 `parkWalk_bushEncounter` / `parkWalk_bushWatch`

- `$flags.bushSet = random(1, 5)` → **5 farklı anlatı + giriş videosu** yolu (`encounter/1/` … `5/`).  
- `parkWalk_bushWatch`: aynı `bushSet` ile devam videoları (çoklu `<<vid>>`); `arousal` artışı.

### 13.5 `parkRest`, `parkJog`, `parkYoga`

- **Rest:** metin sabit; video `restingPark1` veya `2` (`random(1,2)`).  
- **Jog:** metin `random(1,3)`; video `jogPark1`–`jogPark4`.  
- **Yoga:** metin `random(1,3)`; video `yogaPark1`–`yogaPark8`.

### 13.6 `parkWC`

- Tuvalet ihtiyacı / konum geçişi (kısa aksiyon; `sunsetWC` nav ile ilişkili).

---

## 14. Diğer etkileşimler (`3- Interactions`)

- **Doğrudan passage (talkDatabase dışı):** `CharacterInteraction`, `PhoneSwap_Generic`, `Meetup_Generic_Chat`, Lily park konuşması vb.
- **Toplam:** yüz yüze konu verisi büyük ölçüde §12’deki **30 talkDatabase** + aile **6** dosyada toplanır; **varyasyonlar** §12.2–12.6’da özetlendi; park döngüleri §13.

---

## 15. Event kataloğu (`4 - Actions/events/oldtown/RubysDiner`)

Aşağıdaki tablo **dosya adı → passage adı (Twee içindeki hedef) → kısa içerik**. Passage adı çoğunlukla dosya adıyla aynıdır (Twee derleyicisi dosya adını passage yapar); `jobBossOfficeCall_ruby` dosyasında açık `:: jobBossOfficeCall_ruby` başlığı vardır.

### 15.1 İş — ilk gün zinciri (`firstdayJob/`)

| Dosya | İçerik özeti |
|--------|----------------|
| `01 - dinerFirstdayJob_firstWorkDayEvent` | Tom ile giriş, karşılama, üniforma için soyunma odasına götürülme; sahne görseli |
| `02 - dinerFirstdayJob_dressingRoom` | Soyunma odası akışı |
| `03 - dinerFirstdayJob_gettingDressed` | Üniforma / hazırlık |
| `04 - dinerFirstdayJob_wardrobe` | İş kıyafeti (üst, alt, önlük) zorunluluğu; geri dönüş yok |
| `05 - dinerFirstdayJob_emmaEncounter` | Emma ile karşılaşma |
| `06 - dinerFirstdayJob_backToFront` | Arkadan öne geçiş |
| `07 - dinerFirstdayJob_kitchen` | Mutfak oryantasyonu |
| `08 - dinerFirstdayJob_front` | Ön tezgâh |
| `09 - dinerFirstdayJob_dishwasher` | Bulaşıkhane |

### 15.2 Depo molaları (iş + istatistik)

| Dosya | Mekân | Özet |
|--------|--------|------|
| `dinerRubysStorage_coffee` | `dinerRubysStorage` | 15 dk; susuzluk↓, enerji↑; rastgele küçük sahne indeksi |
| `dinerRubysStorage_rest` | depo | 30 dk; stres↓, enerji↑, mood↑ |
| `dinerRubysStorage_freeMeal` | depo | Günlük tek kullanımlık ücretsiz yemek; açlık↓ |

### 15.3 İş — patron (`jobBossOfficeCall_ruby`)

| Passage | Özet |
|---------|------|
| `jobBossOfficeCall_ruby` | `dinerRubysManagerOffice`; Pazartesi patron çağrısı, minimum saat uyarısı sayacı, iş verisi tutarlılık kontrolü, diyalog |

### 15.4 Diana / “Something Different” görev hattı (`diana/`)

| Dosya | Başlık (dosya yorumu) | Notlar |
|--------|------------------------|--------|
| `dinerWork_event_dianaArrival` | Diana işe geliş | İşyeri sahnesi |
| `dinerWork_event_dianaKitchen` | Mutfakta Diana | |
| `dinerWork_event_nightThoughts` | Gece düşünceleri | Diana arkı |
| `fhBedroom_event_beautyThoughts` | Ayna / iç monolog | |
| `brotherComputer_beautySearch` | PC’de güzellik araştırması | |
| `fhParentsRoom_event_motherTalk` | Anneyle konuşma | `<<advanceQuestStage "something_different">>` |
| `fhParentsHall_afterMotherTalk` | Koridor — anne sonrası | |
| `fhLivingRoom_event_askDadMoney` | Babadan para isteme | |
| `mall_event_beautyVisit` | AVM giriş, ayakkabı mağazası, fiyat şoku | Bölüm 1 |
| `mall_event_beautyVisit_window` | Vitrin / devam | |
| `mall_event_beautyVisit_luxuryStore` | Lüks mağaza | |
| `mall_event_beautyVisit_clerk` | Satış elemanı etkileşimi | |

---

## 16. İş passage’ları (`7 - Work`)

| Dosya | Rol |
|--------|-----|
| `RubysDiner/Dishwashing/RubysDishwashWork.twee` | Ana bulaşık işi passage’ı |
| `dinerWork_event_broken` | Arıza / kesinti sahnesi |
| `dinerWork_event_jamesSnack` | James ile ara etkileşim |
| `dinerWork_event_emmaWater` | Emma su getirme vb. kısa sahne |

---

## 17. Quest sistemi — veri ve sahne passage’ları

- **Şema:** `QuestDatabase_Base.twee`
- **Tanımlar:** `QuestDatabase_Main.twee` — zincir: `first_shopping` → `moving_troubles` → `new_beginnings` → `use_computer` → `find_job` → `go_to_mall` → `check_old_town` → `something_different`
- **Durum / öğeler:** `QuestState.twee`, `variablesQuests.twee`, `QuestItems.twee`, `QuestWidgets.twee`
- **Sahneler:** `Quests/movingTroubles`, `useComputer`, `findJob`, `newBeginnings`, `gotoOldtown` — çoğu `assets/content/scenes/...` kullanır

---

## 18. Diğer sistem Twee / veri

- **Zaman:** `Widgets/TimeWidgets.twee`
- **Restoran:** `Init/RestaurantDatabase.twee`
- **Temel UI/state:** `Init/variablesBase.twee`
- **Meta:** `setup.gameName`, `setup.gameVersion` (`variablesBase.twee`)

---

## 19. Özet cümle

**PJX**, **431** Twee dosyası, **~670** gardırop parçası, **30** diner **talkDatabase** + aile konu kütüphaneleri (konu başına çoklu **metin varyantı**, `Object.keys` + `.random()` seçimi), **Sunset Park** aktiviteleri (**günlük kilit**, **tek seferlik** Lily, **rastgele** bank/yürüyüş/çalı), modüler **telefon**, **136** lokasyon passage’ı ve **25** Ruby’s Diner **event** dosyası ile tanımlanan bir yaşam simülasyonu + görsel romandır. Görseller repoda olmasa da **boru hattı** tamdır.

---

*Sayılar `passages` ağacı ve `grep` ile üretilmiştir; yeni dosya ekledikçe §5–17 güncellenmeli.*
