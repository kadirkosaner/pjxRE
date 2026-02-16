# Bugünkü Plan: Fotogram + Number Swap

**Tarih:** 15 Şubat 2025  
**Amaç:** Faz 1 (Number swap) ve Faz 2 (Fotogram) temelini bugün atmak.

---

## Özet – Öncelik Sırası

1. **Number swap veri modeli kararı** (Fotogram DM’den önce şart)
2. **Number swap UI / akış** (numara ver/al – basit senaryo)
3. **Fotogram Feed (2.1)** – Gallery’den paylaşım
4. **Fotogram like/takipçi/yorum (2.2)** – Basit formül + state
5. **Fotogram DM (2.3)** – Numara swap ile bağlantı (contact promoted)

---

## A. Number Swap (Faz 1)

### A.1 Veri Modeli Kararı (1.1)

**Seçenek A – Ayrı map (önerilen):**
- `$phoneContactPromoted = { "anon_dm_123": "charId_promoted_1", ... }`
- Key = Fotogram DM id (anon hesap)
- Value = Messages/Calls’ta kullanılacak gerçek `charId`
- Numara verince: `<<phonePromoteContact dmId charId>>` → map’e ekler + `$phoneContactsUnlocked.push(charId)` (veya zaten Messages key = charId)

**Seçenek B – Anon ID = conversation key:**
- `$phoneConversations["anon_dm_123"]` kalır; sadece “gerçek contact” olarak işaretlenir
- setup.characterDefs’te anon ID için sahte giriş (isim, avatar)

**Karar:** Bugün Seçenek A ile gidelim. Daha temiz; anon DM geçmişi ayrı kalır, numara verilince Messages’ta yeni konuşma başlar.

**Yapılacak:**
- [ ] `phone_system_data_and_technical.md` §7’ye kararı yaz
- [ ] `<<phonePromoteContact dmId charId>>` widget (numara verince çağrılacak) – Fotogram DM’e bağlanacak

### A.2 UI / Akış (1.2)

**Senaryo 1 – Tanıdık karakterle numara swap (zaten var):**
- `<<phoneUnlockContact charId>>` zaten mevcut
- Passage’da “Numara değiş” → `<<phoneUnlockContact "dinerManager">>` gibi
- Kişi `$phoneContactsUnlocked`’a eklenir, Messages’ta görünür

**Senaryo 2 – Test tetikleyicisi:**
- Basit bir passage veya debug butonu ile “X ile numara değiştir” akışı
- Örn. `<<link "Numara değiş">><<phoneUnlockContact "dinerManager">><<replace ...>><</link>>`

**Yapılacak:**
- [ ] En az bir passage’da “numara ver/al” tetikleyicisi ekle (test için)
- [ ] Contacts app’te “numara verilmiş” kişilerin `$phoneContactsUnlocked`’tan geldiğini doğrula
- [ ] (Opsiyonel) “Numara ver” / “Numara al” UI butonları – Contacts veya Messages’ta

**Milestone:** Numara swap tek senaryoda çalışıyor; kişi rehberde ve Messages’ta gerçek contact olarak görünüyor.

---

## B. Fotogram (Faz 2)

### B.1 Feed (2.1)

**Veri:** `$phoneFotogramPosts` zaten init. Yapı (data doc’tan):

```javascript
// FotogramPost: { id, galleryId, time, quality?, type?, likes, comments }
// galleryId = Gallery item id. Gallery yapısı: photos[category][], videos[category][]
// Gallery item: { id, path, quality, category (normal/cute/hot/spicy), ... }
```

**Zorluk:** Gallery `photos.normal`, `photos.cute` vb. kategori bazlı; bir item’ı bulmak için `id` + `kind` + `category` lazım. `phoneFotogramPost` widget’ta galleryId ile arama yapılacak – tüm kategoriler taranacak.

**Widget:** `<<phoneFotogramPost galleryId kind category>>` veya sadece `<<phoneFotogramPost "itemId">>` – itemId ile tüm gallery taranır.

**Yapılacak:**
- [ ] `<<phoneFotogramPost itemId>>` widget (PhoneWidgets.twee)
  - Gallery’de item bul (photos/videos tüm kategorilerde)
  - `$phoneFotogramPosts.push({ id, galleryId: itemId, time, quality, type, likes: 0, followers: 0, comments: [] })`
  - Trim/limit kontrolü (örn. son 50 post)
- [ ] Fotogram UI (phone-fotogram.js): placeholder’dan çık
  - “My Posts” listesi: `$phoneFotogramPosts` render
  - “Share from Gallery” butonu → Gallery picker aç (mevcut openGalleryFolder mantığına benzer)
  - Gallery’de item seçilince `phoneFotogramPost(itemId)` çağır (JS’ten `Engine.wiki('<<phoneFotogramPost "' + id + '">>')` veya persistPhoneChanges + re-render)

**Milestone:** Post atılabiliyor; feed’de görünüyor; quality kullanılıyor.

### B.2 Like / Takipçi / Yorum (2.2)

**Formül (basit başlangıç):**
- Quality 0–100 → like/takipçi/yorum oranı
- Örn: `baseLike = Math.floor(quality * 0.5)` + random 0–20
- Zamanla DM gelme oranı: `(likes + followers*2 + comments*3) / 1000` gibi basit bir fonksiyon

**State:**
- Post başına: `likes`, `comments[]`, (opsiyonel) `followersGained`
- Global: `$phoneFame` veya `$phoneFollowers` (takipçi sayısı) – data doc’ta var

**Yapılacak:**
- [ ] Post oluşturulunca `simulateFotogramEngagement(post)` benzeri – quality’e göre like/yorum sayısı hesapla, post’a yaz
- [ ] `$phoneFame` veya `$phoneFollowers` init (variablesBase’de yoksa ekle)
- [ ] Fotogram UI’da like/yorum sayılarını göster
- [ ] DM gelme oranı formülü – ilk aşamada sadece fonksiyon yaz; DM geldiğinde kullanılacak

### B.3 DM (2.3)

**Bağımlılık:** Number swap (contact promoted) kararı netleşmiş olmalı.

**Veri:** `$phoneFotogramDMs` zaten init. Yapı:

```javascript
// FotogramDM: { id, messages: [...], promotedToCharId: null | charId }
```

**Akış:**
- Post paylaşılınca belirli bir olasılıkla DM gelir (anon hesaptan)
- DM kutusu: anon/hesap ile konuşma
- “Numara ver” seçilince: `<<phonePromoteContact dmId charId>>` → `promotedToCharId = charId`, Messages’ta konuşma başlar

**Yapılacak:**
- [ ] `<<phoneFotogramDMStart postId>>` – post’a gelen ilk DM ile konuşma başlat
- [ ] `<<phoneFotogramDMSend dmId "text">>` / `<<phoneFotogramDMReceive dmId "text">>`
- [ ] DM UI: Fotogram app içinde DM listesi + thread görünümü
- [ ] “Give number” butonu → `<<phonePromoteContact dmId charId>>` + Messages’ta `<<phoneStartConversation charId>>`
- [ ] Anon havuzu: `setup.fotogramAnonPool` veya passage’dan gelen ID’ler

**Milestone:** DM alınabiliyor; numara verilince Messages’ta contact olarak görünüyor.

### B.4 Badge / Bildirim (2.5)

**Mevcut:** `$phoneNotifications.fotogram` length = badge.  
**Eklenecek:** Like, yorum, DM geldiğinde `$phoneNotifications.fotogram.push({ id, type, ... })`  
**Widget:** `<<phoneFotogramNotify type postId|dmId>>` – listeye ekle + `notifyPhone` (opsiyonel)

**Okundu semantiği:** Bugün “tek tek drain” (açınca listeden çıkar) ile başlayalım.

---

## C. Uygulama Sırası (Bugün)

| Sıra | İş | Dosya / Yer |
|------|-----|-------------|
| 1 | Contact promoted kararı (Seçenek A) + dokümana yaz | phone_system_data_and_technical.md |
| 2 | `<<phonePromoteContact dmId charId>>` widget | PhoneWidgets.twee |
| 3 | Numara swap test passage (numara ver – tanıdık char) | Örn. dinerManager veya test passage |
| 4 | `<<phoneFotogramPost itemId>>` widget | PhoneWidgets.twee |
| 5 | Gallery’de item bulma helper (id → { item, kind, category }) | phone-gallery.js veya utils |
| 6 | Fotogram UI: My Posts + Share from Gallery | phone-fotogram.js |
| 7 | Fotogram: like/yorum simülasyonu (quality bazlı) | phone-fotogram.js veya widget |
| 8 | `$phoneFame` / `$phoneFollowers` init | variablesBase.twee |
| 9 | Fotogram bildirim widget `<<phoneFotogramNotify>>` | PhoneWidgets.twee |
| 10 | DM altyapısı (opsiyonel – zaman kalırsa) | phone-fotogram.js, PhoneWidgets.twee |

---

## D. Dikkat Edilecekler

- **Gallery item referansı:** `galleryId` sadece `id` string’i. Item’ı bulmak için `photos` ve `videos` tüm kategorilerde taranmalı. `findGalleryItemById(gallery, id)` benzeri bir fonksiyon yaz.
- **Received foto/video:** Sadece `player` from’lu item’lar paylaşılabilir mi? Roadmap’te “Gallery’den” diyor; received da gallery’de. Karar: Sadece `from === 'player'` (normal/cute/hot/spicy) paylaşılabilir; received paylaşılmaz.
- **persistPhoneChanges:** State değişince `window.persistPhoneChanges && window.persistPhoneChanges()` çağrılmalı (save için).

---

## E. Bugünkü Milestone

- Numara swap tek senaryoda çalışıyor
- Fotogram’da post atılabiliyor (Gallery’den, quality ile)
- Feed’de postlar görünüyor
- Like/yorum sayıları (simüle) gösteriliyor
- (İsteğe bağlı) İlk DM altyapısı hazır
