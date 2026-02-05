# Oyun Yapısı ve Passage Raporu

Bu doküman, oyundaki tüm passage dosyalarının, karakter etkileşimlerinin ve oyuncu aksiyonlarının detaylı bir özetini içerir.

---

## İçindekiler

1. [Genel Klasör Yapısı](#genel-klasör-yapısı)
2. [0 - System (Sistem Dosyaları)](#0---system-sistem-dosyaları)
3. [1 - Prologue (Giriş Sahneleri)](#1---prologue-giriş-sahneleri)
4. [2 - Locations (Lokasyonlar)](#2---locations-lokasyonlar)
5. [3 - Interactions (Karakter Etkileşimleri)](#3---interactions-karakter-etkileşimleri)
6. [4 - Actions (Oyuncu Aksiyonları)](#4---actions-oyuncu-aksiyonları)
7. [5 - Quest System (Görev Sistemi)](#5---quest-system-görev-sistemi)
8. [6 - Scripts (Yardımcı Scriptler)](#6---scripts-yardımcı-scriptler)
9. [7 - Others (Diğer)](#7---others-diğer)
10. [Karakter Etkileşimleri Özeti](#karakter-etkileşimleri-özeti)
11. [Oyuncu Aksiyonları Özeti](#oyuncu-aksiyonları-özeti)

---

## Genel Klasör Yapısı

```
passages/
├── 0 - System/          (17+ dosya) - Sistem ve widget dosyaları
├── 1 - Prologue/        (19 dosya)  - Oyun girişi ve karakter oluşturma
├── 2 - Locations/       (127 dosya) - Tüm lokasyon tanımları
├── 3 - Interactions/    (35+ dosya) - Karakter etkileşim sahneleri
├── 4 - Actions/         (20+ dosya) - Oyuncu aktiviteleri
├── 5 - QuestSystem/     (12 dosya)  - Görev sistemi
├── 6 - Scripts/         (1 dosya)   - Yardımcı fonksiyonlar
└── 7 - Others/          (1 dosya)   - Diğer dosyalar
```

---

## 0 - System (Sistem Dosyaları)

Oyunun temel sistemlerini, değişkenlerini ve widget'larını içerir.

### Init Klasörü - Başlangıç Değişkenleri

| Dosya | Açıklama |
|-------|----------|
| `variablesBase.twee` | Temel oyun değişkenleri: UI görünürlük ayarları, bildirimler, günlük takip, alarm sistemi, bayraklar |
| `variablesTime.twee` | Zaman sistemi: Yıl, ay, gün, saat, dakika, hafta günü tanımları (Başlangıç: 15 Ağustos 2025) |
| `variablesMap.twee` | Harita bölgeleri, lokasyon koordinatları, çalışma saatleri, taksi maliyetleri |
| `variablesNavigation.twee` | Navigasyon sistemi: Lokasyon isimleri, hiyerarşi, seyahat süresi hesaplamaları |
| `variablesImageLocation.twee` | 121 lokasyon için arka plan görüntü yolları |
| `variablesImage.twee` | Oyuncu görünüm görselleri: Saç, göğüs, kalça, vücut tipi |
| `variablesDiscovery.twee` | Lokasyon keşif bayrakları |
| `variablesPeople.twee` | Karakter konteynerleri ve ilişki grupları |
| `variablesSettings.twee` | Oyun ayarları: Simülasyon anahtarları, içerik tercihleri |
| `DurationPresets.twee` | Aktivite süre seçenekleri: TV, uyku, egzersiz, hijyen |
| `ItemDatabase.twee` | Satın alınabilir öğeler: Tüketilebilirler, hediyeler, araçlar, kozmetikler |
| `ReputationInit.twee` | İtibar sistemi: Bölge bağlantıları, seviyeler, kategoriler |

### Init/Characters - Karakter Tanımları

| Dosya | Karakter | Açıklama |
|-------|----------|----------|
| `charPlayer.twee` | Oyuncu | Tüm başlangıç verileri: İstatistikler, beceriler, görünüm, envanter, gardırop |
| `charFather.twee` | Baba (Robert Taylor) | Program, lokasyon bazlı eylemler, preWork/postWork fazları |
| `charMother.twee` | Anne (Sarah Taylor) | Program, yoga ve bahçe aktiviteleri, romantik etkileşimler |
| `charBrother.twee` | Kardeş (Jake Taylor) | Okul/tatil programları, gece aktiviteleri |
| `charMarcus[CornerShop].twee` | Marcus (Tezgahtar) | Dükkan saatleri, şehir bilgisi verme |

### Widgets Klasörü - Widget'lar

| Dosya | Açıklama |
|-------|----------|
| `TimeWidgets.twee` | Zaman ilerletme, gün ilerletme, karakter lokasyon güncelleme |
| `StatCalculator.twee` | İstatistik hesaplama, kazanç/kayıp işlemleri, beceri sistemi |
| `StatNotifications.twee` | Bildirim kuyruğu, renk kodlu bildirimler |
| `MoneyWidgets.twee` | Para sistemi: Nakit, banka, yatırma/çekme |
| `NeedsSystem.twee` | Biyolojik ihtiyaçlar: Açlık, susuzluk, mesane, hijyen, kalori |
| `BodySystem.twee` | Vücut sistemi: Kilo, BMI, vücut tipi hesaplamaları |
| `SkillDecay.twee` | Beceri azalma sistemi (7 günlük koruma süresi) |
| `ActivityWidgets.twee` | Günlük aktivite takibi: Yoga, dans, park aktiviteleri |
| `ActivityButtonWidget.twee` | Aktivite butonları için birleşik kontrol sistemi |
| `ClothingCheckWidgets.twee` | Giyim stili ve görünüm skoru kontrolü |
| `SexualWidgets.twee` | Cinsel sahneler için otomatik takip sistemi |
| `ShopWidgets.twee` | Alışveriş sistemi: Sepet, ödeme, envanter yönetimi |
| `ReputationWidgets.twee` | İtibar kazanma/kaybetme, söylenti yayılması |
| `wardrobeWidget.twee` | Gardırop kontrolleri, çıplaklık kontrolü |
| `systemWidgets.twee` | Vücut ölçüleri, çekicilik hesaplama, lokasyon keşfi |

### WardrobeSys Klasörü - Gardırop Sistemi

| Dosya | Açıklama |
|-------|----------|
| `wardrobeConfig.twee` | Kategori tanımları, slot eşlemeleri, kalite renkleri |
| `wardrobePlayerState.twee` | Oyuncu gardırop durumu, giyili öğeler |
| `wardrobeTops.twee` | Üst giyim veritabanı |
| `wardrobeBottoms.twee` | Alt giyim veritabanı |
| `wardrobeDresses.twee` | Elbise veritabanı |
| `wardrobeBras.twee` | Sütyen veritabanı |
| `wardrobePanties.twee` | Külot veritabanı |
| `wardrobeSocks.twee` | Çorap veritabanı |
| `wardrobeShoes.twee` | Ayakkabı veritabanı |
| `wardrobeSleepwear.twee` | Pijama veritabanı |
| `wardrobeBracelet.twee` | Bilezik aksesuarları |
| `wardrobeNecklace.twee` | Kolye aksesuarları |
| `wardrobeEarrings.twee` | Küpe aksesuarları |

---

## 1 - Prologue (Giriş Sahneleri)

Oyunun başlangıç akışı ve karakter oluşturma sistemi.

| Dosya | Açıklama |
|-------|----------|
| `1 - Start[startscreen].twee` | Ana başlangıç ekranı |
| `2 - GameStart.twee` | Yaş doğrulama modalı ve hoş geldin sayfası (18+ uyarısı) |
| `3 - settingsPage.twee` | Karakter oluşturma: İsim, vücut özellikleri, simülasyon ayarları, içerik tercihleri |
| `4 - confirmationPage.twee` | Seçimleri gözden geçirme ve onaylama sayfası |
| `5 - prologuePage.twee` | Prologue başlangıcı: Yolculuk sahnesi ve anılara geçiş |
| `6 - earlyYears.twee` | 0-5 yaş anı seçimi (+15% Focus/Fitness/Intelligence/Charisma) |
| `7 - childhoodYears.twee` | 6-9 yaş anı seçimi (+15% Willpower/Creativity/Intelligence/Charisma) |
| `8 - formativeYears.twee` | 10-12 yaş anı seçimi (+15% Fitness/Intelligence/Physical/Creative Skills) |
| `9 - adolescentYears.twee` | 13-15 yaş anı seçimi (+15% Beauty/Social/Technical Skills/Willpower) |
| `10 - comingofAge.twee` | 16-17 yaş anı seçimi (+15% Beauty/Charisma/Practical/Physical Skills) |
| `11 - newhomeEnter.twee` | Şehre varış sahnesi, anı özeti gösterimi |
| `12 - newHome.twee` | Eve giriş, ailenin keşfi |
| `13 - prologueBedroom.twee` | Oyuncunun odasına giriş, eksik bavul farkındalığı |
| `14 - prologueDownstairsAsk.twee` | Bavul hakkında ebeveynlerle konuşma |
| `15 - prologueEvening.twee` | İlk akşam: Pizza siparişi ve aile birlikteliği |
| `16 - prologueDinner.twee` | İlk akşam yemeği: Aile sohbeti, gelecek planları |
| `17 - prologueNightEnd.twee` | İlk gecenin sonu: Oyuncunun düşünceleri |
| `18 - nextDayMorning.twee` | Ertesi sabah: Ana oyuna geçiş, UI aktifleştirme, ilk görev başlatma |
| `skipPrologue.twee` | Prologue atlama seçeneği: Hızlı karakter oluşturma |

---

## 2 - Locations (Lokasyonlar)

Oyundaki tüm mekanların tanımları. **127 lokasyon dosyası** bulunmaktadır.

### Ana Bölgeler

| Bölge | Açıklama | Alt Lokasyonlar |
|-------|----------|-----------------|
| **Downtown** | Şehir merkezi | AVM, gökdelenler, gece kulübü, restoranlar |
| **Hillcrest** | Zengin mahalle | Golf kulübü, butikler, lüks restoran, şarap barı |
| **Maplewood** | Sakin yerleşim | Aile evi, kilise, köşe dükkanı, Sunset Park |
| **Marina Bay** | Sahil bölgesi | Plaj, marina, iskele, plaj barı/kulübü |
| **Old Town** | Tarihi merkez | Belediye, lise, hastane, kütüphane, polis |
| **Red Light Center** | Yetişkin eğlence | Striptiz kulübü, masaj salonu, yetişkin mağaza |
| **Southside** | İşçi sınıfı | Apartmanlar, çamaşırhane, rehin dükkanı |
| **Suburbs** | Banliyö | Çete bölgesi, motel, crack evi |
| **University District** | Üniversite | Kampüs, yurtlar, öğrenci barı, kütüphane |

### Maplewood - Aile Evi Detayları

| Lokasyon | Dosya | Açıklama |
|----------|-------|----------|
| Alt Kat | `fhDownstairs.twee` | Alt kat navigasyonu |
| Üst Kat | `fhUpperstairs.twee` | Üst kat navigasyonu |
| Yatak Odası | `fhBedroom.twee` | Ana karakter odası |
| Kardeş Odası | `fhBrotherRoom.twee` | Jake'in odası |
| Ebeveyn Odası | `fhParentsRoom.twee` | Anne-baba odası |
| Oturma Odası | `fhLivingroom.twee` | Yoga, dans, TV etkileşimleri |
| Mutfak | `fhKitchen.twee` | Yemek ve su içme |
| Garaj | `fhGarage.twee` | Araba çalışması |
| Arka Bahçe | `fhBackyard.twee` | Bahçıvanlık |
| Alt Banyo | `fhDownbath.twee` | Alt kat banyosu |
| Üst Banyo | `fhUpperBath.twee` | Üst kat banyosu |
| Ebeveyn Banyosu | `fhParentsBath.twee` | Ebeveyn banyosu |
| Gardırop | `fhWardrobe.twee` | Kıyafet değiştirme |
| Kanepe | `fhCouch.twee` | TV izleme menüsü |

### Downtown - Alışveriş Merkezi

| Kat | Mağazalar |
|-----|-----------|
| Zemin Kat | Giyim A, Kozmetik, Elektronik, Ayakkabı A, Spor |
| İkinci Kat | Çanta, Giyim B/C, Mücevher, İç Çamaşırı A/B, Ayakkabı B |
| Üçüncü Kat | Yemek alanı, Güzellik salonu, Sinema |

### Downtown - Skyline (Gökdelenler)

| Kule | İçerik |
|------|--------|
| Tower A | Rekreasyon merkezi, basketbol, voleybol, spor salonu |
| Tower B | Banka |
| Tower C | Lüks otel, caz kulübü, çatı restoranı, rooftop lounge |

---

## 3 - Interactions (Karakter Etkileşimleri)

Karakterlerle yapılabilecek tüm etkileşim sahneleri.

### Baba (Father) Etkileşimleri

| Dosya | Etkileşim | Lokasyon | Açıklama |
|-------|-----------|----------|----------|
| `fatherTalkKitchen.twee` | Konuşma | Mutfak | Finance, health, marriage, work konuları |
| `fatherTalkLivingRoom.twee` | Konuşma | Oturma Odası | Advice, future, health, hobbies, marriage, memories, sports, work |
| `fatherTalkGarage.twee` | Konuşma | Garaj | Car, hobbies, finances, health, marriage, sports, work |
| `fatherTalkBackyard.twee` | Konuşma | Arka Bahçe | Advice konusu (sadece T1) |
| `fatherCarWork.twee` | Araba Çalışması | Garaj | Mechanics skill kazandırır, topic database'den CAR konuları |
| `fatherCoffeeTogether.twee` | Kahve İçme | Mutfak | Sabah aktivitesi, topic database'den finance konuları |
| `fatherHug.twee` | Sarılma | Mutfak | Friendship seviyesine göre 3 varyant |
| `fatherWatchSports.twee` | Spor İzleme | Oturma Odası | Topic database'den SPORTS konuları (Watch TV ile entegre) |
| `parentsRoomEvening.twee` | İyi Geceler | Ebeveyn Odası | Akşam ziyareti, ebeveyn durumuna göre varyantlar |
| `showerEncounter_Father.twee` | Duş Karşılaşması | Ebeveyn Banyosu | Corruption seviyesine göre içerik |

**Topic Veritabanları:**
- `CommonTopics.twee`: 7 ortak konu (advice, car, future, hobbies, marriage, memories, sports)
- `PreWorkTopics.twee`: 3 iş öncesi konu (work, finance, health)
- `PostWorkTopics.twee`: 10 iş sonrası konu (yorgunluk ve stres temaları)

### Anne (Mother) Etkileşimleri

| Dosya | Etkileşim | Lokasyon | Açıklama |
|-------|-----------|----------|----------|
| `motherTalkKitchen.twee` | Konuşma | Mutfak | Tüm konulardan rastgele seçim |
| `motherTalkLivingRoom.twee` | Konuşma | Oturma Odası | Tüm konulardan rastgele seçim |
| `motherTalkBackyard.twee` | Konuşma | Arka Bahçe | Outdoor konular: hobbies, youth, health, future, memories, news |
| `motherCoffeeTogether.twee` | Kahve İçme | Mutfak | Friendship seviyesine göre 3 varyant |
| `motherHelpCook.twee` | Yemek Yardımı | Mutfak | Cooking skill kazandırır |
| `motherHugKitchen.twee` | Sarılma | Mutfak | Friendship seviyesine göre 3 varyant |
| `motherGardenTogether.twee` | Bahçıvanlık | Arka Bahçe | Gardening skill kazandırır |
| `motherFlirtKitchen.twee` | Flört | Mutfak | Love/lust stat, awareness artırır |
| `showerEncounter_Mother.twee` | Duş Karşılaşması | Ebeveyn Banyosu | Corruption seviyesine göre içerik |

**Topic Veritabanı:**
- `MotherTalkTopicsDatabase.twee`: 10 konu (daily_routine, memories, hobbies, marriage, youth, news, social, cooking, health, future)

### Kardeş (Brother) Etkileşimleri

| Dosya | Etkileşim | Lokasyon | Açıklama |
|-------|-----------|----------|----------|
| `brotherTalkKitchen.twee` | Konuşma | Mutfak | Sibling, future konuları |
| `brotherTalkLivingRoom.twee` | Konuşma | Oturma Odası | Movies_shows, outside_friends konuları |
| `brotherTalkBedroom.twee` | Konuşma | Kardeş Odası | Gaming, school_life, sleep, hobbies |
| `brotherTalkBackyard.twee` | Konuşma | Arka Bahçe | Being_home, dating konuları |
| `brotherPlayGames.twee` | Oyun Oynama | Kardeş Odası | Gaming skill kazandırır |
| `brotherMidnightSnack.twee` | Gece Atıştırma | Mutfak | Gece yarısı aktivitesi |
| `BrotherLateNightChat.twee` | Gece Sohbeti | Kardeş Odası | Geç saatlerde derin sohbet |
| `showerEncounter_Brother.twee` | Duş Karşılaşması | Banyo | Corruption seviyesine göre içerik |

**Topic Veritabanı:**
- `BrotherTalkTopicsDatabase.twee`: 10 konu x 3 tier x 2 faz (school/vacation)

### Diğer Karakter Etkileşimleri

| Dosya | Karakter | Açıklama |
|-------|----------|----------|
| `shopClerkTalk.twee` | Marcus | Köşe dükkanı sohbeti |
| `shopClerkAskCity.twee` | Marcus | Şehir hakkında bilgi alma |

---

## 4 - Actions (Oyuncu Aksiyonları)

Oyuncunun yapabileceği tüm aktiviteler.

### Banyo Aksiyonları

| Dosya | Aksiyon | Süre | Etkiler |
|-------|---------|------|---------|
| `useBath.twee` | Duş Alma | Değişken | Hijyen MAX, enerji +, stres - |
| `useToilet.twee` | Tuvalet | 5 dk | Mesane boşaltma, hijyen - |
| `washFace.twee` | Yüz Yıkama | 5 dk | Hijyen +, enerji + |

### Yatak Odası Aksiyonları

| Dosya | Aksiyon | Süre | Etkiler |
|-------|---------|------|---------|
| `sleep.twee` | Uyuma | 8 saat (veya alarm) | Enerji MAX, stres - |
| `runNap.twee` | Kısa Uyku | 15-60 dk | Enerji +, stres - |
| `setAlarm.twee` | Alarm Kurma | - | Hafta içi/sonu ayrı ayar |
| `fhBed.twee` | Yatak Menüsü | - | Uyku seçenekleri |

### Mutfak Aksiyonları

| Dosya | Aksiyon | Süre | Etkiler |
|-------|---------|------|---------|
| `drinkWater.twee` | Su İçme | 2 dk | Susuzluk MAX |
| `eatFood.twee` | Yemek Yeme | 15 dk | Açlık +, enerji +, stres - |
| `eatWithFamily.twee` | Aile Yemeği | 30 dk | Açlık +, aile dostluk + |

### Oturma Odası Aksiyonları

| Dosya | Aksiyon | Süre | Etkiler |
|-------|---------|------|---------|
| `watchTV.twee` | TV İzleme | Seçilebilir | Stres -, aile ile izlemede dostluk + |
| `nap.twee` | Koltukta Uyku | 60 dk | Enerji +, stres - |
| `runYoga.twee` | Yoga Menüsü | - | Spor kıyafeti ve mat kontrolü |
| `runYogaSolo.twee` | Yalnız Yoga | 30 dk | Enerji -, stres -, yoga skill + |
| `runYogaMom.twee` | Anne ile Yoga | 30 dk | Dostluk +, yoga skill + |
| `runDance.twee` | Dans | 30 dk | Enerji -, stres -, dans skill + |
| `fhCouch.twee` | Kanepe Menüsü | - | TV ve uyku seçenekleri |

### Park Aksiyonları (Sunset Park)

| Dosya | Aksiyon | Süre | Etkiler |
|-------|---------|------|---------|
| `parkBench.twee` | Bankta Oturma | 30 dk | Stres - |
| `parkJog.twee` | Koşu | 45 dk | Enerji -, stres -, kardiyovasküler + |
| `parkYoga.twee` | Açık Hava Yoga | 45 dk | Enerji -, stres -, yoga skill + |

### Widget Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `BathroomWidgets.twee` | Banyo giriş kontrolü (duş eden varsa) |
| `bedWidgets.twee` | Yatak aktivite butonları |
| `CouchWidgets.twee` | TV izleme seçenekleri (kiminle?) |
| `FamilyMealsWidgets.twee` | Aile yemeği zamanları (7-8, 12-13, 18-19) |

---

## 5 - Quest System (Görev Sistemi)

### Sistem Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `QuestDatabase_Base.twee` | Görev yapısı tanımları |
| `QuestDatabase_Main.twee` | Ana hikaye görevleri veritabanı |
| `QuestItems.twee` | Görev öğeleri (süt, ekmek vb.) |
| `QuestState.twee` | Görev durumu takibi |
| `QuestWidgets.twee` | Yardımcı widget'lar |
| `variablesQuests.twee` | Temel görev değişkenleri |

### Mevcut Görevler

| Görev | Sahneler | Açıklama |
|-------|----------|----------|
| **First Shopping** | `quest_first_shopping_map_scene.twee` | İlk alışveriş, Marcus ile tanışma, harita keşfi |
| **Moving Troubles** | 4 sahne | Taşınma sorunları: Park keşfi → Anne ile konuşma → Baba kötü haber → Oda sahnesi |
| **New Beginnings** | `quest_new_beginnings_dinner.twee` | Aile yemeği, para alma, iş arama kararı |

---

## 6 - Scripts (Yardımcı Scriptler)

| Dosya | Açıklama |
|-------|----------|
| `PlayerAppearanceHelper.twee` | Oyuncu görünüm görselleri için dinamik yardımcı fonksiyonlar (saç, göğüs, kalça, vücut tipi) |

---

## 7 - Others (Diğer)

| Dosya | Açıklama |
|-------|----------|
| `fastTravelTaxi.twee` | Taksi hızlı seyahat sistemi: Para kontrolü, ücret kesimi, varış noktası |

---

## Karakter Etkileşimleri Özeti

### Baba (Robert Taylor)
- **Lokasyonlar:** Mutfak, Oturma Odası, Garaj, Arka Bahçe, Ebeveyn Odası, Ebeveyn Banyosu
- **Etkileşimler:**
  - 🗣️ Konuşma (4 lokasyonda)
  - ☕ Kahve İçme (sabah 6-9)
  - 🚗 Araba Çalışması (friendship 35+)
  - 🤗 Sarılma (friendship 40+)
  - 📺 Spor İzleme (Watch TV ile entegre)
  - 🌙 İyi Geceler (akşam 23+)
  - 🚿 Duş Karşılaşması (corruption bazlı)
- **Fazlar:** PreWork (iş öncesi) / PostWork (iş sonrası)
- **Topic Sayısı:** 7 ortak + 3 preWork + 10 postWork = 20 konu

### Anne (Sarah Taylor)
- **Lokasyonlar:** Mutfak, Oturma Odası, Arka Bahçe, Ebeveyn Banyosu
- **Etkileşimler:**
  - 🗣️ Konuşma (3 lokasyonda)
  - ☕ Kahve İçme
  - 🍳 Yemek Yardımı
  - 🤗 Sarılma
  - 🌷 Bahçıvanlık
  - 💕 Flört (corruption bazlı)
  - 🧘 Yoga Birlikte (friendship 30+)
  - 🚿 Duş Karşılaşması
- **Topic Sayısı:** 10 konu

### Kardeş (Jake Taylor)
- **Lokasyonlar:** Mutfak, Oturma Odası, Kardeş Odası, Arka Bahçe, Banyo
- **Etkileşimler:**
  - 🗣️ Konuşma (4 lokasyonda)
  - 🎮 Oyun Oynama
  - 🌙 Gece Sohbeti
  - 🍕 Gece Atıştırma
  - 🚿 Duş Karşılaşması
- **Fazlar:** School (okul dönemi) / Vacation (tatil)
- **Topic Sayısı:** 10 konu

### Marcus (Köşe Dükkanı Çalışanı)
- **Lokasyon:** Maplewood Köşe Dükkanı
- **Etkileşimler:**
  - 🗣️ Sohbet
  - 🗺️ Şehir Hakkında Bilgi Alma

---

## Oyuncu Aksiyonları Özeti

### Temel İhtiyaçlar
| Aksiyon | Lokasyon | Etki |
|---------|----------|------|
| Su İçme | Mutfak | Susuzluk giderme |
| Yemek Yeme | Mutfak | Açlık giderme |
| Aile Yemeği | Mutfak | Açlık + aile bağı |
| Tuvalet | Banyo | Mesane boşaltma |
| Duş Alma | Banyo | Hijyen |
| Yüz Yıkama | Banyo | Hızlı hijyen |

### Dinlenme
| Aksiyon | Lokasyon | Etki |
|---------|----------|------|
| Uyuma | Yatak | Tam enerji yenileme |
| Kısa Uyku | Yatak/Koltuk | Kısmi enerji |
| TV İzleme | Oturma Odası | Stres azaltma |
| Bankta Oturma | Park | Stres azaltma |

### Egzersiz ve Beceriler
| Aksiyon | Lokasyon | Skill |
|---------|----------|-------|
| Yoga | Oturma Odası/Park | yoga |
| Dans | Oturma Odası | dance |
| Koşu | Park | cardiovascular, lowerBody |
| Araba Çalışması | Garaj | mechanics |
| Bahçıvanlık | Arka Bahçe | gardening |
| Yemek Yardımı | Mutfak | cooking |
| Oyun Oynama | Kardeş Odası | gaming |

### Sosyal
| Aksiyon | Kişi | Etki |
|---------|------|------|
| Konuşma | Tüm aile | friendship, trust, love |
| Sarılma | Anne/Baba | friendship, love |
| Kahve İçme | Anne/Baba | friendship |
| Flört | Anne | love, lust, awareness |

---

## Tier Sistemi (Friendship Seviyeleri)

Tüm karakter etkileşimleri 3 tier'a ayrılır:

| Tier | Friendship | İçerik Tipi |
|------|------------|-------------|
| Tier 1 | 0-39 | Mesafeli, resmi, tanışma |
| Tier 2 | 40-69 | Samimi, rahat, açık |
| Tier 3 | 70+ | Çok yakın, duygusal, intim |

---

## Faz Sistemi

### Baba Fazları
- **PreWork:** Baba henüz yeni işe başlamamış (iş arama, hazırlık, endişe temaları)
- **PostWork:** Baba işe başlamış (iş stresi, yorgunluk, zaman kısıtlaması temaları)

### Kardeş Fazları
- **School:** Okul dönemi (okul temalı konular, kısıtlı zaman)
- **Vacation:** Tatil dönemi (serbest zaman, eğlence temaları)

---

*Bu doküman otomatik olarak oluşturulmuştur. Son güncelleme: Ocak 2026*
