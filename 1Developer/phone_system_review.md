# Telefon Sistemi – Tarama, Eksikler ve Puan

## Bağlam: Oyunun yapısı

Bu oyun **open-world**, **yavaş corrupt**, **yüksek grind** odaklı bir adult game. Telefon **ana sistem değil**; dünya, lokasyonlar, ilişkiler, quest’ler ve grind üzerine kurulu bütünün **bir parçası**. Yani telefon “tüm oyun bunun etrafında” (Mystic Messenger gibi) değil; **tek bir işlev**, yan bir özellik. Bu yüzden Calls / Fotogram / Finder eksikliği veya serbest metin olmaması, oyun türüne göre **beklenen seviyede** kabul edilebilir; puan ve karşılaştırma da bu perspektifle okunmalı.

---

## 1. Tarama Özeti (Ne Var, Ne Yok?)

### ✅ Tam Çalışan / İyi Durumda

| Modül | Durum | Not |
|-------|--------|-----|
| **Messages** | ✅ | Konuşma listesi, thread, mesaj balonları, trim (100 mesaj), okundu/badge, New message → contact pick |
| **Talk topics** | ✅ | friendship/love/lust tier + requiredStats ile açılma, variation + choice, stat gain, time advance, spicy photo picker |
| **Meetup** | ✅ | Zaman seçimi, yer seçimi, randevu oluşturma, takvimle entegre, "Where are you?" |
| **Contacts** | ✅ | Aile + unlock listesi, block, avatar/ism |
| **Camera** | ✅ | Normal/cute/hot/spicy + video, lokasyon havuzu, Gallery’e ekleme, kalite |
| **Gallery** | ✅ | Klasörler (normal/cute/hot/spicy/received), grid, preview, received "From: X" |
| **Calendar** | ✅ | Haftalık görünüm, appointments, timeSys |
| **Badge / bildirim** | ✅ | Mesaj + Fotogram + Finder sayıları tek kaynaktan, rightbar önizleme |
| **State / save** | ✅ | phoneConversations, phoneGallery, phoneAppointments, phoneTalkAskedLast vb. persist; Save.slots.save(0) (deprecated uyarısı var) |
| **Widget’lar** | ✅ | phoneReceiveMessage, phoneSendMessage, phoneMarkConversationRead, phoneStartConversation, GalleryAdd |
| **UX** | ✅ | Thread’de en alta scroll, telefon saati topic sonrası güncelleniyor, :passagerender’da telefon kapanmasın diye flag |

### ⚠️ Eksik / Zayıf Yönler

| Konu | Açıklama |
|------|----------|
| **Calls** | Ayrı bir “Calls” uygulaması yok; ikon “Contacts” olarak kullanılıyor. Arama geçmişi / arama simülasyonu yok. |
| **Fotogram** | Sadece placeholder: "Coming soon". Feed, post, yorum, DM, contact promoted yok. |
| **Finder** | Sadece placeholder: "Coming soon". Eşleşme, profil, mesajlaşma yok. |
| **NPC’den proaktif mesaj** | Passage’lardan `<<phoneReceiveMessage>>` ile mesaj atılabiliyor ama quest/event tetikli otomatik “X’ten mesaj geldi” akışı dokümanda; yaygın kullanım sayısı belirsiz. |
| **Serbest metin yazma** | Oyuncu kendi cümlesini yazamıyor; sadece topic/choice metinleri. Gerçek “mesaj kutusu” yok. |
| **Save API** | `persistPhoneChanges()` içinde `Save.slots.save(0)` kullanılıyor; projede “[DEPRECATED] Save.slots.save()” uyarısı var. Modern save API’ye geçmek gerekiyor. |
| **Debug log’lar** | `index.js` içinde topic işlerken birçok `console.log` (Topic Turn, ATTACHING image vb.) production’da kalıyor. |
| **Twee–JS senkron** | Konuşma açılınca okundu işareti JS tarafında (markConversationReadInState); widget `<<phoneMarkConversationRead>>` passage’lardan çağrılmıyor. Tutarlı; sadece dokümandaki “widget çağrısı + Engine.play” senaryosu ile farklı. |
| **Fotogram/Finder badge** | Badge sayıları `phoneNotifications.fotogram/finder` length’ten; bu uygulamalar placeholder olduğu için içerik yok, bildirim mantığı ileride değişebilir. |
| **Dil / erişilebilirlik** | Metinler çoğunlukla İngilizce (topic’ler, butonlar). i18n veya ekran okuyucu için özel yapı yok. |
| **Mesaj silme / düzenleme** | Mesaj veya konuşma silme, düzenleme yok; sadece trim (son 100). |

### Dokümantasyon ve Mimari

- **Artı:** `phone_system_data_and_technical.md`, roadmap, foundation, vision dokümanları net; veri modeli ve widget imzaları tanımlı.
- **Eksi:** Bazı kararlar (Faz 0: mesaj trim N, Fotogram okundu semantiği, contact promoted) roadmap’te “karar verilecek” diye duruyor; Fotogram/Finder gelince güncellenmeli.

---

## 2. Puan (10 üzerinden)

| Kriter | Puan | Kısa gerekçe |
|--------|------|----------------------|
| **İşlevsellik (ne kadar işliyor)** | 7.5/10 | Messages, Talk, Meetup, Camera, Gallery, Calendar dolu ve oynanabilir; Calls yok, Fotogram/Finder placeholder. |
| **Veri / state tasarımı** | 8/10 | Tek kaynak, trim, badge türetilmiş; Save deprecated uyarısı ve ileride Fotogram/Finder state’leri ek tasarım isteyecek. |
| **Kod kalitesi / sürdürülebilirlik** | 7/10 | Modüler (messages, gallery, camera, topic-system, shared-*), ama topic tarafında çok console.log, bazı sihirli flag’ler (_phoneApplyTopicEffectsActive). |
| **İçerik zenginliği** | 8/10 | Mother/Father/Brother için çok sayıda topic, variation, choice, spicy flow; metin kalitesi iyi. |
| **Kullanıcı deneyimi** | 7.5/10 | Scroll, saat güncellemesi, bildirim formatı düzgün; serbest yazı yok, bazı akışlar (spicy pick, choice) ilk seferde keşfetmek zor olabilir. |
| **Diğer sistemlerle uyum** | 8/10 | Zaman (timeSys), karakter (characters.stats), takvim (phoneAppointments), notification API ile entegre. |

**Genel ortalama: ~7.7/10**  
(Özet: “Güçlü bir temel, Messages/Talk/Meetup/Camera/Gallery gerçekten oynanabilir; Calls/Fotogram/Finder ve save/bakım tarafı eksik.”)

**Bu oyun türünde (open-world, grind, corrupt – telefon ana odak değil):** Aynı puan, "yan bir sistem için fazlasıyla yeterli ve işlevsel" anlamına gelir. Telefonun üzerine tüm oyunu kurmak zorunda olmadığın için 7.7, beklentiye göre **iyi bir seviye**.

---

## 3. Diğer Oyunlarla Karşılaştırma

### Referans türleri

- **Visual novel / dating sim:** Örneğin **Mystic Messenger**, **Love Unholyc**, **Amnesia**, **Collar x Malice** – telefondan mesaj, arama, zamanlı bildirim, bazen minigame.
- **Adult / romance:** **Summertime Saga**, **Being a DIK**, **FreshWomen** – telefondan mesajlaşma, bazen basit “reply A/B/C”, bazen galeri/rota kilidi.

### Karşılaştırma (kısa)

| Özellik | PJX (bu proje) | Örnek: Mystic Messenger / Being a DIK tarzı |
|---------|----------------|-----------------------------------------------|
| Mesajlaşma | ✅ Liste, thread, balon, okundu | ✅ Benzer; bazılarında gerçek zamanlı “şimdi yazıyor” |
| Konu konuşma (Talk) | ✅ Çok topic, tier, choice, stat | ✅/⚠️ Bazılarında sadece senaryo mesajı, bazılarında seçenek + puan |
| Foto gönderme / sexting | ✅ Spicy picker, galeri, balonda foto | ✅ Birçok oyunda var; bazen sadece “gönder” onayı |
| Arama (call) | ❌ Yok | ✅ Birçok VN’de var (ses/ metin arama) |
| Sosyal feed (Fotogram) | ❌ Placeholder | ✅/⚠️ Bazı oyunlarda Instagram benzeri feed + yorum |
| Takvim / randevu | ✅ Meetup, takvim görünümü | ✅ Randevu ve bazen takvim yaygın |
| Zaman ilerlemesi | ✅ Topic’te dakika, telefon saati | ✅ Çoğunda mesaj/aksiyon = zaman |
| Serbest metin | ❌ Sadece hazır cevaplar | ⚠️ Çoğunda da yok; sadece seçenekler |
| Proaktif NPC mesajı | ⚠️ Widget var, tetikleme passage’a bağlı | ✅ Zamanlı / event’te “X yazıyor” çok kullanılır |

**Özet:**  
PJX telefonu, **Being a DIK / Summertime Saga** tarzı “telefonla mesaj + topic + foto + randevu” paketine **oldukça yakın**; **Calls** ve **sosyal feed (Fotogram)** olmaması en büyük fark. **Mystic Messenger** gibi “gerçek zamanlı sohbet simülasyonu” değil, “oyun içi menü telefonu” olarak güçlü. Oyun open-world / grind / corrupt odaklı olduğu için telefon **ana sistem değil**; bu tür oyunlarda telefonun “yan özellik” olarak bu seviyede olması **beklentiye uygun**.

---

## 4. Şu an phone sistemi için yapılması gerekenler (öncelik sırasıyla)

### Hemen (teknik borç / stabilite)

1. **Save API** `Save.slots.save` deprecated ise resmi save API’ye geç; `persistPhoneChanges()` oraya bağla.  
2. **Console.log:** Topic ile ilgili tüm `console.log` satırlarını kaldır veya `if (window.DEBUG_PHONE)` ile sar.  
3. **Calls:** En azından “Arama geçmişi” (phoneCallLog) listesi ve “Ara” butonu (şimdilik metin/placeholder arama) eklenebilir.  
4. **Fotogram / Finder:** Roadmap’e göre içerik ve veri modeli ayrı faz; placeholder kalsın ama badge/notification veri yapısı dokümanda netleşsin.  
5. **NPC proaktif mesaj:** Quest veya lokasyon geçişlerinde `<<phoneReceiveMessage charId "metin">>` kullanımını artır; “X’ten mesaj geldi” hissini güçlendir.  
6. **Dil:** Buton ve sistem metinleri (örn. “Put the phone down”, “New message”, “Choose a photo to send”) için tek yer (i18n veya setup.phoneStrings) düşün.

Bu rapor, mevcut kod ve dokümanlara göre yapılan taramanın özetidir; ileride Fotogram/Finder veya Calls eklendiğinde güncellenebilir.
