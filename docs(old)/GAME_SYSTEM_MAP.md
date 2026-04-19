# PJX — Kapsamlı Mimari Seçilim ve Sistem Röntgeni (Gerçek X-Ray)

> "Tam bir röntgen mi?" Evet, işte projenin **kod bazında** anatomisi. Hangi dosyanın nereden geldiği, hangi lokasyonda hangi karakterin olduğu, saatlerin nasıl işlediği ve tüm CSS/JS/Twee modüllerinin ağacı.

---

## 📁 1. Dizin ve Dosya Mimarisi Özeti

- **Toplam Sistem:** 62 (11 Twee + 19 JS modülü aktive ediliyor + 32 base-css dosyası)
- **Twee Dosyaları:** ~183 adet (`passages/` altında kategorize edilmiş)
- **Passage & Widget Sayısı:** 118 Passage, 33 Widget.

### Ana Klasörlerin Görevleri:

- **`0 - System`**: Oyun motoru. Başlangıç değişkenleri (`Init`), zaman/lokasyon mantıkları, UI widget'ları (wardrobe, shop vb). Javascript'ler (`storyJavaScript.js` - ~2132 satır).
- **`1 - Prologue`**: Hikayenin ilk başladığı, arkaplanın (backstory) anlatıldığı geçiş ekranları.
- **`2 - Locations`**: Mekânların Twee dosyaları. Binalar, odalar.
- **`3 - Interactions`**: Karakterlerle etkileşim (`CharacterInteraction.twee`). Burada `talkDatabase` dosyaları ile konuşma motoru bulunur.
- **`4 - Actions`**: Eylemler. Örneğin aynaya bakmak, uyumak, banyo yapmak (`Mirror`, `Bath`, `Sleep`).
- **`5 - QuestSystem`**: Görev tanımlarının bulunduğu dizin (Görev V2 Motoru).
- **`assets/system/`**: Tüm UI'ı oluşturan CSS ve bağımsız JS modüllerinin (özel bildirimler, telefon arayüzü, modal sekmeler) klasörü. `config.js` ile SugarCube oyun motoruna inject edilirler.

---

## 🕒 2. Motorun Çalışma Döngüsü (Core Loop)

Oyuncunun tıklamaları şu sırayla oyunu işletir:

1. **Navigasyon (Zaman İlerler):** `<<advanceTime X>>` tetiklenir (Örn: Başka odaya geçişte 1-5 dk).
2. **`updateTimedEvents` (JS):** Zaman ilerleyince bu arka plan scripti çalışır. Saati, tarihi, haftanın gününü (`setup.schoolCalendar`) ve gece/gündüz dönemlerini (Morning, Afternoon vb.) belirler. İhtiyaçları (Energy, Hunger) yavaşça düşürür.
3. **`updateCharacterLocations` (Twee/JS):** Saate göre `setup.characterDefs` taranır. "Saat 07:00, Baba mutfakta kahvaltı yapıyor olmalı. Anne banyoda olmalı." Buna göre `$characters.father.currentLocation = "fhKitchen"` şeklinde güncellenir.
4. **Mekân Kontrolü:** Gidilen yerin açık olup olmadığı sınanır (`setup.locationHours`).
5. **Render:** Odaya girilir. `CharacterInteraction.twee` odadaki karakterleri gösterir. Arayüz JS modülleri (Topbar, Rightbar) render edilerek ekrandaki istatistik iconlarını günceller.

---

## 💬 3. Karakterler ve Konuşma (Talk) Veritabanı Röntgeni

Oyunun hikaye ilerlemesi ağırlıklı olarak **Diyalog Motoruna (Talk Database)** dayanır.

### Karakterler ve Veritabanı Klasörleri

Tüm konuşmalar `passages/3- Interactions/` altında tutulur.

- **FamilyHouse (Aile Bireyleri)**
  - **Mother:** `MotherTopicsLevel1.twee`, `MotherTopicsLevel2.twee`.
  - **Father:** `FatherTopicsPreWorkLevel1.twee`, `FatherTopicsPostWorkLevel1.twee`, `FatherTopicsPostWorkLevel2.twee` (Konular iş öncesi ve sonrası olarak ikiye ayrılmış).
  - **Brother:** `BrotherTopicsSchoolLevel1.twee`, `BrotherTopicsSchoolLevel2.twee`, `BrotherTopicsVacationLevel1.twee`, `BrotherTopicsVacationLevel2.twee` (Okul zamanı ve tatil zamanı olarak ayrılmış).
  - _NOT: Her konuşma dosyası karakterin içinde bulunduğu odaya ve zamana (`fhKitchen_school_morning` vb.) göre parçalara (Topic'lere) ayrılır._

- **Old Town (Kasaba)**
  - **Tom (Diner Clerk):** `TomTopicsLevel1.twee` (Sadece Rubi's Diner'da geçerlidir).
  - _Tüccarlar / Yan NPC'ler:_ `parkRunnerLilyTalk.twee`, `shopClerkTalk.twee` (Kısa konuşma sistemleri kullanır, büyük database'e bağlı değillerdir).

### Nasıl Seçiliyor? (Randomisation Algoritması)

Oyuncu `Talk` düğmesine bastığında;

1. Kod, Karakterin o an bulunduğu odaya bakar (`$location`).
2. Zamanın `morning, afternoon, evening` mi olduğuna bakar.
3. Oyuncu ile karakter arasındaki mevcut Friendship / Trust levelini hesaplar.
4. `setup.xxxTopics` objesinde _(Örn: `setup.brotherTopics.school.level1.fhKitchen_school_morning`)_ tanımlı konuşmaları tarayıp henüz tüketilmeyenlerden rastgele birini seçer ve ekrana basar. Stat hediyesini (Örn: `friendship + 1`) verir.

---

## 👗 4. Kıyafet Sınırları ve Corruption Kapıları (Wardrobe & Adult Gate)

`0 - System/Widgets/wardrobeWidget.twee` ile hesaplanan karmaşık bir stat sınır sistemi vardır.

- **Kıyafet Parametreleri:** Her kıyafetin bir `exposureLevel`'ı ve tagleri (`mild`, `revealing`, `bold`, `lewd`) vardır.
- **Denetçiler:**
  - `$confidence` (Özgüven) yüksek exposure için gereklidir.
  - `$exhibitionism` (Teşhircilik) de açık saçık giyinmek, hatta sütyensiz (braless) veya iç çamaşırsız çıkmak için hesaplanır.
  - `$corruption` Level Sistemidir. İç çamaşırıyla odadan çıkmak için **Level 2**, çıplak çıkmak için **Level 5** istenir.

---

## 📱 5. Telefon İşletim Sistemi (Mini OS)

SugarCube motoru üzerinde neredeyse tam kapsamlı çalışan bir işletim sistemi kodlanmıştır.

- **Veri Yeri:** `variablesBase.twee` ($phoneConversations, $phoneFollowers vb)
- **Modüller (`assets/system/js/ui/phone`):**
  - **Mesajlar (`phone-messages.js`):** NPC karakterler SMS atabilir (topic-system üzerinden unlock olur). Oyuncunun okuyup okumadığını sayar ($phoneUnreadCount).
  - **Fotogram (`phone-fotogram.js`):** Gerçek bir statü platformudur. Kendini fotoğraf çekip atarak statünü büyütürsün, yorumlar ve DM'ler gelir (`$phoneFotogramDMs`).
  - **Finder (`phone-finder.js`):** Gece / gündüz eşleşmeleri ile haritada görülmeyen ama buluşulabilen yeni NPC'ler atar.
  - **Kamera (`phone-camera.js`):** Günlük kullanım kotası ile fotoğraf çeker ve galeriye kaydeder. Cinsel/yarı-çıplak selfie'ler corruption statlarını destekler.

---

## 🌍 6. Harita, Çevre ve "Keşif" İlerleyişi

Haritadaki yerler başlangıçta yoktur. Motor `getDiscoveryKey(locationId)` kodu ile `$discoveredX` değişkenlerini kontrol eder.

- **Maplewood:** Başlangıç yeri. Aile evi (`FamilyHouse`), Park (`SunsetPark`), Mahalle Bakkalı (`CornerShop`).
- **Old Town:** Şehrin eski ve sakin yüzü. Diner, küçük kafeler.
- **Downtown / Tower:** İş, büyük alışveriş merkezleri (`StoreClothingA` vb).
- **Diğer Bölgeler:** `Marina Bay`, `Hillcrest`, `University District` vs. (Sistemde kodlanmış ama oyunda henüz içi tam doldurulmamış bekleyen kapılar).

`setup.quests` üzerinden görev tetiklendikçe bu "Alan" değişkenleri `true` olur ve harita büyür.

---

## 🔥 7. Adult/Tahrik "Arousal" Metrikleri ve Özel Sahneler

- **`$arousal`:** Gün içinde atılan selfie, dışarıda giyilen açık kıyafet, evdeki röntgencilik faaliyetleri ile bu bar artar.
- **`SexualWidgets.twee`:** Sahneleri kodlamak için tamamen modüler bir formül oluşturulmuştur.
  - Twee içinde `<<sexScene "vaginal" "brother">>` veya `<<sexAct "oral" "giver">>` yazıldığında otomatik olarak sahneler oynatılır, cinsel beceriler (`seduction`, `handjob` vs. `$sexual.skills` ağacına) kaydedilir.
- **Aksiyon Flagleri:** Oyun `$firsts` ağacında her karakter için ilklerini saklar (`firstKiss`, `firstOral` vs). Bu değişkenler hikaye (Linear Route) ilerlemesi sağlandığı an tetiklenir.

---

## 🎯 Sonuç Özeti

Bu oyun iki farklı ritimde çalışır:

1. **Zaman-Program Simülasyonu:** Arkaplanda sürekli dönen bir saatin ve karakterlerin mesai saatlerinin olduğu gerçekçi dünya.
2. **Text-Adventure Flörtü:** Doğru saatte doğru odada bulunup, "Talk" sisteminde friendship ve ardından lust kasarak, son evrede "özel sahne" kilidini (`<<sexScene>>`) açmaya dayalı okuma odaklı görsel roman (visual novel) katmanı.
