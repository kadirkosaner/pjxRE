# Phone System – Aktivasyon Planı

## Mevcut Durum

- **UI:** Rightbar’da telefon mockup var; tıklanınca overlay açılıyor (`openPhoneOverlay`).
- **Overlay:** 7 uygulama ikonu (Camera, Calls, Messages, Gallery, Calendar, Fotogram, Finder). Saat `timeSys`’ten geliyor.
- **Kod:** `assets/system/js/ui/phone.js` – `handleAppClick(action)` sadece `console.log` yapıyor, gerçek aksiyon yok.
- **Bildirim:** `notifyPhone("mesaj")` ve `position: 'phone-area'` çalışıyor.
- **Değişkenler:** `$notificationPhoneCount`, `$notificationPhoneMessages`, `$notificationPhoneFotogram`, `$notificationPhoneFinder`, `$hideRightbarPhone`.

Yani **kabuk hazır**, uygulama tıklamaları ve içerik ekranları yok.

---

## Hedef (Ne “Aktif” Edeceğiz?)

1. Uygulama tıklanınca **anlamlı bir ekran** açılsın (en azından Messages ve Calendar).
2. **Bildirim sayıları** doğru kaynaktan güncellensin (mesajlar, Fotogram, Finder).
3. İleride: NPC mesajlaşma, takvim etkinlikleri, Fotogram/Finder içerikleri.

---

## Önerilen Fazlar

### Faz 1 – MVP (Önce Bunlar)

| Adım | Ne yapılacak | Nerede |
|------|----------------|--------|
| 1.1 | Uygulama tıklanınca **iç ekran gösterme** (tek bir “phone app view” alanı, içerik değişecek) | `phone.js`: `handleAppClick` → overlay içinde ek bir div (örn. `.phone-app-view`) göster; geri butonu ile ana ekrana dön. |
| 1.2 | **Messages:** “No conversations yet” veya basit bir liste (boş da olabilir). Veri: `$phoneConversations = []` veya `setup.phoneContacts`. | Aynı overlay içinde Messages ekranı HTML’i. |
| 1.3 | **Calendar:** Oyun saati/tarihi göster (`$timeSys`). İsteğe bağlı: bugünkü “events” listesi (boş array ile başla). | Aynı overlay içinde Calendar ekranı. |
| 1.4 | **Diğer uygulamalar:** Camera, Calls, Gallery, Fotogram, Finder için “Coming soon” veya aynı placeholder ekran. | `handleAppClick` içinde `action`’a göre farklı içerik div’i doldur. |

**Çıktı:** Telefon açılıyor → uygulama seçiliyor → ekran değişiyor → geri ile ana ekrana dönüyor. Henüz NPC mesajı veya takvim etkinliği eklenmeyebilir.

---

### Faz 2 – Mesajlaşma Altyapısı

| Adım | Ne yapılacak | Nerede |
|------|----------------|--------|
| 2.1 | **Veri yapısı:** Karakter ID’ye göre konuşmalar. Örn. `$phoneConversations = { "charId": [ { from, text, time, read } ] }` veya `setup.phoneMessages` + `$phoneUnread`. | Yeni Init passage veya `variablesBase` / JS config. |
| 2.2 | **Messages ekranı:** Konuşma listesi (karakter adı, son mesaj önizlemesi, okunmamış sayısı). Tıklanınca konuşma detayı (sağ panel veya alt ekran). | `phone.js` içinde Messages view’ı genişlet veya ayrı `phoneMessages.js` modülü. |
| 2.3 | **Bildirim senkronu:** Yeni mesaj gelince `$notificationPhoneMessages++`, rightbar/overlay badge güncellensin. Gerekirse `:passagerender` veya küçük bir `updatePhoneBadges()` çağrısı. | Passage’larda mesaj ekleyen yerlerde değişken artır; phone/rightbar render’da bu değişkeni kullan (zaten var). |

**Çıktı:** En az bir NPC ile “test konuşması” gösterilebilir; badge sayısı artar/azalır.

---

### Faz 3 – Takvim ve Bildirimler

| Adım | Ne yapılacak | Nerede |
|------|----------------|--------|
| 3.1 | **Takvim verisi:** `$phoneCalendarEvents = [ { day, title, passage?, time? } ]` veya `setup.timedEvents` ile entegre. | Init / TimeWidgets (zaten timed events varsa oraya bağla). |
| 3.2 | **Calendar ekranı:** Haftalık/aylık görünüm veya sadece “bugün / bu hafta” listesi. Tıklanınca ilgili passage’a `Engine.play` ile gidilebilir. | phone.js Calendar view. |
| 3.3 | **Fotogram / Finder:** Placeholder’dan çık; basit “feed” veya “map” placeholder. Badge’leri `$notificationFotogram` / `$notificationFinder` ile senkron et. | phone.js + değişkenler. |

**Çıktı:** Takvimde en az bir etkinlik türü görünür; Fotogram/Finder için hazırlık biter.

---

### Faz 4 – İçerik ve Oyun Akışı

| Adım | Ne yapılacak | Nerede |
|------|----------------|--------|
| 4.1 | NPC’lerden mesaj tetikleme (quest, lokasyon, zaman). Örn. “Ruby’den mesaj geldi” → `notifyPhone` + `$notificationPhoneMessages++`. | İlgili passage’lar / quest widget’ları. |
| 4.2 | Oyuncu “yanıt” seçenekleri (çoklu seçim veya sabit yanıtlar). Cevaba göre relationship / flag değişimi. | Messages view + SugarCube State. |
| 4.3 | Foto gönderme / sexting (future_features’daki gibi) – ayrı tasarım gerekir. | Sonraki plan dokümanı. |

---

## Teknik Kararlar

1. **Overlay içinde mi, ayrı passage mı?**  
   **Öneri:** Önce overlay içinde tek sayfa (phone-app-view) ile uygulama ekranları. Geçişler hızlı olur, state aynı sayfada kalır. İleride çok büyürse “Messages” ayrı bir full-screen modal veya passage’a taşınabilir.

2. **Veri nerede?**  
   - **Konuşmalar:** `$phoneConversations` (State) – kayıtla birlikte saklansın.  
   - **Takvim:** `$phoneCalendarEvents` veya mevcut `setup.timedEvents` / alarm yapısına ek alan.  
   - **Kişi listesi:** `setup.phoneContacts` (id, name, avatar, unlockCondition?) veya `setup.characters` ile eşleşen bir liste.

3. **SugarCube entegrasyonu:**  
   - Mesaj ekleme: Passage’da `<<set $phoneConversations[charId].push(...)>>` + `<<run window.notifyPhone("...")>>` + badge artırma.  
   - Takvim etkinliği tıklanınca: JS’ten `Engine.play(passageName)` ile ilgili passage’a git.

4. **Badge güncellemesi:**  
   Rightbar ve phone overlay her `:passagerender`’da yeniden oluşturulduğu için `$notificationPhoneMessages` vb. güncellenince bir sonraki render’da doğru görünür. Ekstra bir “live update” gerekmez; gerekirse `$(document).trigger(':passagerender')` veya sadece phone overlay’i yenileyen küçük bir fonksiyon yazılabilir.

---

## Kısa Özet

| Faz | Odak | Tahmini iş |
|-----|------|------------|
| **1** | Uygulama tıklanınca ekran + Messages/Calendar placeholder | phone.js view değiştirme, basit HTML |
| **2** | Mesajlaşma veri yapısı + konuşma listesi + badge | Init/variables + phone.js Messages view |
| **3** | Takvim verisi + Calendar listesi, Fotogram/Finder placeholder | Time/events + phone.js |
| **4** | NPC mesajları, yanıtlar, oyun akışı | Passage’lar + phone + relations |

İlk adım için somut kod: **Faz 1.1** – `handleAppClick` içinde overlay’e bir “app view” ekleyip, Messages/Calendar/Coming soon içeriğini bu view’da göstermek.

Bu planı onaylarsan bir sonraki adımda Faz 1’i doğrudan `phone.js` ve gerekli HTML/CSS üzerinde uygulayacak değişiklikleri adım adım yazabilirim.
