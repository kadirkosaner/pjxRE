# Phone System – Roadmap

Bu dosya telefon ve sosyal sistemin **aşamalı uygulama planı**.  
**Referanslar:** Vizyon: `phone_system_vision.md` · Altyapı: `phone_system_foundation.md` · **Veri modeli + teknik arayüz:** `phone_system_data_and_technical.md` (alt sistemler, state şekilleri, widget imzaları).

---

## Genel ilke

- **Önce foundation (Messages + badge + UI) tam oturmalı;** sonra Fotogram, Gallery, Calls.
- Her faz bitmeden sonrakine geçme; arada gerçek oyunda test et.
- Karar gerektiren noktalar (contact promoted, okundu semantiği, mesaj trim) **ilgili fazdan önce** netleştirilmeli.

---

## Faz 0 – Hazırlık ve kararlar

**Amaç:** Veri modeli ve teknik tercihler net olsun; ileride geri dönüş maliyeti azalsın.

| # | Yapılacak | Not |
|---|-----------|-----|
| 0.1 | **Mesaj limit / trim stratejisi** kararı | Konuşma başına veya toplam üst limit; eski mesajları trim (son N mesaj) veya sadece limit. Save boyutu ve migration için önemli. |
| 0.2 | **Fotogram / Finder “okundu” semantiği** kararı | Tek tek drain (açınca listeden çıkar) mı, toplu “clear all” mı? Veri modeli buna göre şekillenir. |
| 0.3 | **Contact promoted (anon → charId)** taslağı | Fotogram DM’den numara verince kişi Messages’ta gerçek contact olacak. Anon ID’nin `charId`’ye nasıl eşleneceği ve eşleşmenin nerede tutulacağı (`$phoneContacts` map vs. `$phoneConversations` key) **Fotogram DM yazılmadan önce** kararlaştırılacak. Detay: foundation §5. |

**Çıktı:** Karar notları `phone_system_data_and_technical.md` içindeki ilgili bölümlere (mesaj trim N, okundu semantiği, contact promoted seçeneği) işlenmiş; Faz 1’e geçilebilir.

---

## Faz 1 – Messages foundation (tek kaynak + badge + UI)

**Amaç:** Mesajlaşma, badge ve Messages ekranı tek kaynaktan çalışsın; oyunda test edilebilir olsun.

| # | Yapılacak | Referans |
|---|-----------|-----------|
| 1.1 | `$phoneConversations = {}` init; (trim/limit varsa) helper veya widget içinde uygula. | Foundation §2.1, §6 |
| 1.2 | Okunmamış mesaj sayısı hesaplayan helper (Twee widget veya JS). | Foundation §2.2, §8 tablo 2 |
| 1.3 | Widget: `<<phoneReceiveMessage charId "Metin">>` (+ isteğe bağlı `notifyPhone`). | Foundation §3.1 |
| 1.4 | Widget: `<<phoneMarkConversationRead charId>>`. | Foundation §3.3 |
| 1.5 | Widget: `<<phoneSendMessage charId "Metin">>`. | Foundation §3.2 |
| 1.6 | Widget: `<<phoneStartConversation charId>>` (veya ilk mesajlı varyant). | Foundation §3.4 |
| 1.7 | Phone + rightbar: Badge’i `$phoneConversations` üzerinden hesapla; `$notificationPhoneMessages` vb. kullanma. | Foundation §4, §8 tablo 7 |
| 1.8 | Messages UI: Konuşma listesi + konuşma detayı; detay açılınca `phoneMarkConversationRead` + **UI refresh** (Engine.play veya DOM update). | Foundation §5, §6 |
| 1.9 | (İsteğe bağlı) `notifyPhone` sadece `phoneReceiveMessage` içinden. | Foundation §3.5, §8 tablo 9 |

**Milestone:** Oyunda bir NPC’den mesaj alınabiliyor, Messages’ta listeleniyor, konuşma açılınca okundu işaretleniyor ve badge düşüyor. Yeni konuşma başlatılabiliyor.

---

## Faz 2 – Gallery + Camera

**Amaç:** Foto çekme (havuzdan seçim) ve Gallery’e kayıt; paylaşım hedefleri (Fotogram / Finder / Messages) için veri hazır.

| # | Yapılacak | Not |
|---|-----------|-----|
| 2.1 | **Foto havuzu** tanımı: stat’e göre (lokasyon, outfit, looks, mood) hangi asset’lerin seçilebileceği; her foto için tip (sexy selfie, günlük, mekân vb.). | Vision §2 |
| 2.2 | State: `$phoneGallery = []` (veya benzeri) – her öğe `{ id, assetPath, type, time? }`. | Vision §2, §3 |
| 2.3 | Camera ekranı: “Take a photo” → stat’e uygun havuzdan random seçim → tip atama → Gallery’e push. | Vision §2 |
| 2.4 | Gallery ekranı: Tüm fotoğraflar listesi; (Faz 3–4’te) “Fotogram’da paylaş / Finder’a ekle / X’e gönder” aksiyonları bağlanacak. | Vision §3 |

**Milestone:** Foto çekilebiliyor, Gallery’de görünüyor. Paylaşım butonları henüz tek uygulama (Messages’a gönder) veya placeholder olabilir.

---

## Faz 3 – Fotogram (feed, yorum, DM, aile event’leri)

**Ön koşul:** Faz 0.3 (contact promoted) kararı verilmiş olmalı.

| # | Yapılacak | Not |
|---|-----------|-----|
| 3.1 | Veri: `$phoneNotifications.fotogram` (veya ayrı feed/post yapısı); Fotogram “okundu” semantiği Faz 0.2’ye göre. | Foundation §6, §7 |
| 3.2 | **Feed:** Shuffle mantığı; oyuncu postları + (isteğe bağlı) NPC/random postlar. Foto + video (hazır asset). | Vision §4 |
| 3.3 | **Yorumlar:** Post paylaşılınca içeriğe (tip) + looks/mekân vb. göre yorum havuzu; aile event’leri (spicy foto → anne/baba/kardeş oyun içi yorum). | Vision §4 |
| 3.4 | **DM:** Anon/hesap havuzu; uygunsuz/çarpıcı mesajlar; ton seçenekleri (kısa cevap, flört, sert red, engelle) + karşı cevap akışı. | Vision §4 |
| 3.5 | **Contact promoted:** Numara verince o kişi Messages/Calls’ta gerçek contact; Faz 0.3’teki veri modeli uygulanır. | Foundation §5, Vision §4 |
| 3.6 | Badge: Fotogram bildirim sayısı `$phoneNotifications.fotogram` (veya seçilen model) üzerinden türetilir. | Foundation §7 |

**Milestone:** Post atılabiliyor, feed’de görünüyor, yorum/DM geliyor; numara verince Messages’ta konuşma açılabiliyor. Aile event’leri en az bir örnekle çalışıyor.

---

## Faz 4 – Finder + Calls + Fame / dünya tepkisi

| # | Yapılacak | Not |
|---|-----------|-----|
| 4.1 | **Finder:** Profil / eşleşme ekranı; Gallery’den foto ekleme; (isteğe bağlı) DM veya randevu ile Messages/Calls’a bağlantı. Badge = notifications.finder. | Vision §8 tablo |
| 4.2 | **Calls:** Arama listesi (rehber / Messages’taki kişiler); arama + randevu oluşturma (tarih/saat/lokasyon → event tetikleyici). | Vision §7 |
| 4.3 | **Fame / reputation:** Takipçi + reputation eşikleri; `$fameEvents` (veya benzeri) – hangi eşik event’leri oynandı tracker’ı. | Vision §5, §9 |
| 4.4 | **Dünya tepkisi:** Eşik event’leri (agency yazması, tanınma “sen o kız mısın?”, günlük hayatta tanınma); tetikleyicilerin lokasyon / zaman / flag’e bağlanması. | Vision §5, §9 |

**Milestone:** Finder ve Calls kullanılabiliyor; fame eşiğine gelince en az bir “dünya tepkisi” event’i tetikleniyor ve tekrar oynanmıyor.

---

## Özet zaman çizelgesi (mantıksal sıra)

```
Faz 0 (kararlar) → Faz 1 (Messages foundation) → [oyunda test]
    → Faz 2 (Gallery + Camera) → [oyunda test]
    → Faz 3 (Fotogram; 0.3 kararı sonrası) → [oyunda test]
    → Faz 4 (Finder + Calls + Fame)
```

**Risk:** Kapsam büyük; Faz 1 tam oturmadan Faz 2’ye geçmemek. Fotogram DM’e başlamadan önce contact promoted kararı (Faz 0.3) mutlaka netleşmeli.
