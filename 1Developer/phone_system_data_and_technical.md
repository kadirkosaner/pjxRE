# Phone System – Veri Modeli ve Teknik Arayüz (Alt Sistemler)

Bu doküman **tüm telefon alt sistemlerinin** veri yapıları ve teknik sözleşmelerini tanımlar. UI veya içerik yazılmadan önce bu modele göre implementasyon yapılır; sonradan uyumsuzluk yaşanmaması hedeflenir.

**İlişkili belgeler:** `phone_system_vision.md` (oyun tasarımı), `phone_system_foundation.md` (genel altyapı), `phone_system_roadmap.md` (aşamalı plan).

---

## 0. Genel İlkeler

- **Tek kaynak:** Badge ve sayılar hiçbir yerde elle tutulmaz; her zaman state’ten türetilir (hesaplanan fonksiyon / helper).
- **Yazma sadece widget/macro:** Passage’lar veya JS doğrudan `$phone*` state’ine yazmaz; tüm güncellemeler tanımlı widget/macro üzerinden yapılır.
- **Okuma:** UI (JS) state’i okur; Twee passage’lar widget içinde state okur. Ortak helper’lar (unread sayısı vb.) hem Twee hem JS’te kullanılabilir şekilde tanımlanır.
- **Save uyumluluğu:** Tüm state kayıtla saklanır; boyut ve performans için limit/trim kuralları bu dokümanda belirtilir.

---

## 1. Messages (Konuşmalar)

### 1.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneConversations` | `Object.<string, Array<Message>>` | Key = `charId` (veya anon ID, bkz. §7). Value = o konuşmadaki mesaj listesi (kronolojik). |
| **Message** | | |
| `from` | `"player"` \| string | `"player"` = oyuncu gönderdi; string = NPC/hesap `charId`. |
| `text` | string | Mesaj metni. |
| `time` | `{ day, month, year?, hour, minute }` | Oyun zamanı snapshot (save için). |
| `read` | boolean | Oyuncu bu mesajı “görüntüledi” mi? Sadece `from !== "player"` mesajlarda anlamlı; badge türetilirken `read === false` sayılır. |

**Limit / trim (zorunlu):**
- Konuşma başına mesaj üst limiti: **N** (örn. 100). Yeni mesaj eklenirken listede son N mesaj kalacak şekilde eski mesajlar **trim** edilir (baştan silinir).
- Alternatif: Toplam konuşma sayısı veya toplam mesaj sayısı üst limiti. Karar roadmap Faz 0’da netleşir; implementasyon bu kurala uyar.

**Okunmamış sayı (türetilmiş):**
- `phoneUnreadCount()` = toplam `$phoneConversations` içinde `read === false` olan mesaj sayısı. Elle tutulan `$notificationPhoneMessages` kullanılmaz.

### 1.2 Setup (sadece okuma) ve rehber (contact list)

| Alan | Açıklama |
|------|----------|
| `setup.characterDefs[charId]` | name, avatar vb. (mevcut). Messages’ta gösterim için kullanılır. |
| `setup.phoneContactsFamily` | `Array<string>`. Başta numarası açık olan kişiler (örn. anne, baba, kardeş). Varsayılan: `["mother", "father", "brother"]`. New message / New call listesi = family + `$phoneContactsUnlocked`. |
| `$phoneContactsUnlocked` | `Array<string>`. Oyuncu numara swap ettiği kişiler (kayıtla saklanır). `<<phoneUnlockContact charId>>` ile eklenir. |
| `$phoneWhereAskedLast` | `Object.<charId, {day, month, year}>`. "Where are you?" günde bir kez cevaplanır; aynı gün tekrar sorulursa cevap kısıtlanır. |
| `setup.phoneMessageTopics` | `Object.<charId, Array<Topic>>`. Talk konuları; **sadece passage’dan** gelir. `variablesPhoneTopics.twee` passage’ında tanımlanır; oyun başında yüklemek için `variablesBase.twee` sonunda `<<domInclude "variablesPhoneTopics">>` kullanılır (ve/veya passage’a `[init]` tag’i verilir). JS’te konu listesi `phoneGetUnlockedTopics(charId, vars)` ile okunur; yazma yok. |

### 1.3 Widget / macro arayüzü

| İmza | Okur | Yazar | Açıklama |
|------|------|--------|----------|
| `<<phoneReceiveMessage charId "text">>` | `$timeSys` | `$phoneConversations[charId]` | NPC’den mesaj ekler. Konuşma yoksa `[]` oluşturur; trim kuralı uygulanır. İsteğe bağlı: `notifyPhone(...)`. |
| `<<phoneSendMessage charId "text">>` | `$timeSys` | `$phoneConversations[charId]` | Oyuncu mesajı ekler; `read: true`. Trim uygulanır. |
| `<<phoneMarkConversationRead charId>>` | `$phoneConversations[charId]` | Aynı dizideki her mesajda `read: true` | Konuşma açıldığında çağrılır. |
| `<<phoneStartConversation charId>>` | - | `$phoneConversations[charId] = []` (yoksa) | Boş konuşma açar. İsteğe bağlı: `<<phoneStartConversation charId "ilk mesaj">>` → start + send. |
| `<<phoneUnlockContact charId>>` | - | `$phoneContactsUnlocked` | Oyuncu bu kişiyle numara değiştirdiğinde çağrılır; charId rehbere eklenir (tekrar eklenmez). |

### 1.4 Helper (Twee veya JS)

- **`phoneUnreadCount()`** (veya Twee’de `<<phoneUnreadCount>>`): `$phoneConversations` üzerinden döner; parametre yok. JS’te `State.variables.phoneConversations` kullanılır.

---

## 2. Gallery

### 2.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneGallery` | `Array<GalleryItem>` | Oyuncunun çektiği tüm fotoğraflar (kronolojik; en yeni isteğe bağlı sonda). |
| **GalleryItem** | | |
| `id` | string | Benzersiz ID (örn. `"gal_" + Date.now()` veya uuid). Paylaşım ve silme için referans. |
| `assetPath` | string | Görsel asset yolu (örn. `"assets/content/phone/photos/selfie_01.webp"`). |
| `type` | string | Foto tipi: `"sexy_selfie"` \| `"daily"` \| `"location"` \| … (içerik/yorum havuzu için kullanılır). |
| `time` | `{ day, month, hour, minute }` | Çekim anı (opsiyonel). |

**Limit:** Gallery öğe sayısı üst limiti (örn. 200). Aşılınca en eski silinir veya yeni çekim reddedilir (karar Faz 0’da).

### 2.2 Widget / macro

| İmza | Okur | Yazar | Açıklama |
|------|------|--------|----------|
| `<<phoneGalleryAdd assetPath type>>` | - | `$phoneGallery` | Yeni foto ekler (Camera’dan çağrılır). Limit kontrolü burada. |
| `<<phoneGalleryRemove id>>` | - | `$phoneGallery` | Öğe siler (ileride “sil” aksiyonu). |

**Paylaşım:** Gallery’den bir `id` seçilip hedefe gönderilir; bu aksiyonlar **Fotogram / Finder / Messages** alt sistemlerinde tanımlı widget’lara gider (örn. `<<phoneFotogramPost galleryId>>`, `<<phoneSendPhotoTo charId galleryId>>`). Gallery sadece depo; paylaşım ilgili uygulamanın state’ini günceller.

---

## 3. Camera (Foto havuzu)

### 3.1 Veri modeli (setup – sadece okuma)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `setup.phonePhotoPool` | `Array<PhotoPoolEntry>` veya kategoriye göre gruplu | Çekilebilecek foto listesi. Her öğe: `{ assetPath, type, conditions? }`. |
| **conditions** (opsiyonel) | `{ location?: string[], minLooks?: number, tags?: string[] }` | Bu fotoyun seçilebilmesi için gerekli koşullar. Yoksa tüm havuzdan random. |

**Seçim mantığı:** Anlık state (`$location`, `$looks` veya ilgili stat, outfit tag’leri vb.) ile `conditions` eşleşen havuzdan **random** bir foto seçilir; `type` atanır; `<<phoneGalleryAdd assetPath type>>` çağrılır.

### 3.2 Widget / macro

| İmza | Okur | Yazar | Açıklama |
|------|------|--------|----------|
| `<<phoneTakePhoto>>` | `$location`, stat’lar, `setup.phonePhotoPool` | `$phoneGallery` (GalleryAdd ile) | Havuzdan uygun foto seçer, Gallery’e ekler. Sonuç (assetPath, type) isteğe bağlı bir değişkene yazılabilir (UI’da göstermek için). |

---

## 4. Fotogram (Feed, post, yorum, DM, bildirim)

### 4.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneFotogramPosts` | `Array<FotogramPost>` | Oyuncunun Fotogram’da paylaştığı postlar (feed’de “benim postlarım” + yorum/DM tetikleyicisi). |
| **FotogramPost** | | |
| `id` | string | Benzersiz post ID. |
| `galleryId` | string | Gallery’deki foto referansı. |
| `time` | `{ day, month, hour, minute }` | Paylaşım zamanı. |
| `comments` | `Array<{ id, fromId, text, time }>` | Bu posta gelen yorumlar. `fromId` = anon ID veya charId (aile için). |
| `$phoneFotogramDMs` | `Array<FotogramDM>` | Fotogram DM kutusu (anon/hesap ile konuşmalar). Numara verilmeden önce burada. |
| **FotogramDM** | | |
| `id` | string | Konuşma ID (anon hesap ID’si veya benzersiz). |
| `messages` | `Array<{ from: "player"|"them", text, time }>` | Mesaj listesi. |
| `promotedToCharId` | string \| null | Numara verildiyse bu konuşma Messages’taki hangi `charId` ile eşleşti (bkz. §7). |
| `$phoneNotifications.fotogram` | `Array<FotogramNotification>` | Bildirim kuyruğu (beğeni, yorum, DM özeti). Badge = length. Okundu semantiği: tek tek drain veya toplu clear (Faz 0 kararı). |
| **FotogramNotification** | | |
| `id` | string | |
| `type` | `"like"` \| `"comment"` \| `"dm"` | |
| `postId?` \| `dmId?` | string | İlgili post veya DM. |
| `read` | boolean | (Eğer “drain” değilse “read” işaretleme kullanılacaksa.) |

**Limit:** Post sayısı, DM konuşma sayısı, notification kuyruğu üst limiti (opsiyonel; trim/clear kuralı).

### 4.2 Widget / macro (özet)

| İmza | Okur | Yazar | Açıklama |
|------|------|--------|----------|
| `<<phoneFotogramPost galleryId>>` | `$phoneGallery`, `$timeSys` | `$phoneFotogramPosts` | Gallery’deki foto ile post oluşturur. |
| `<<phoneFotogramAddComment postId fromId "text">>` | - | İlgili post’un `comments` | Yorum ekler (NPC/anon/aile). |
| `<<phoneFotogramNotify type ...>>` | - | `$phoneNotifications.fotogram` | Bildirim kuyruğuna ekler; isteğe bağlı `notifyPhone`. |
| `<<phoneFotogramDMSend dmId "text">>` | - | `$phoneFotogramDMs` | Oyuncu DM yanıtı gönderir. |
| `<<phoneFotogramDMReceive dmId "text">>` | - | Aynı + notifications | Karşı taraftan mesaj gelir. |
| Fotogram “okundu” | - | `$phoneNotifications.fotogram` | Tek tek drain (öğe silinir) veya toplu clear / read: true (Faz 0 kararına göre). |

---

## 5. Finder

### 5.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneFinderProfile` | `{ galleryIds: string[], bio?: string }` | Oyuncunun Finder profilindeki foto referansları ve kısa bio. |
| `$phoneFinderMatches` | `Array<{ id, name?, avatar?, lastMessage? }>` | Eşleşen kişiler (anon veya charId). İleride randevu/Calls ile bağlanabilir. |
| `$phoneNotifications.finder` | `Array<FinderNotification>` | Eşleşme, mesaj vb. bildirimleri. Badge = length. Okundu: Fotogram ile aynı karar (drain vs. clear). |

### 5.2 Widget / macro (özet)

| İmza | Açıklama |
|------|----------|
| `<<phoneFinderSetPhoto galleryId>>` | Profile foto ekler (Gallery referansı). |
| `<<phoneFinderNotify type ...>>` | Bildirim kuyruğuna ekler. |

---

## 6. Calls (Arama, randevu)

### 6.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneCallsLog` | `Array<{ charId, time, direction: "in"|"out" }>` | (İsteğe bağlı) Arama geçmişi. |
| `$phoneAppointments` | `Array<Appointment>` | Randevular (buluşma). |
| **Appointment** | | |
| `id` | string | |
| `charId` | string | Kiminle. |
| `time` | `{ day, month, hour, minute }` | |
| `location` | string | Lokasyon ID veya passage. |
| `status` | `"pending"` \| `"done"` \| `"cancelled"` | |

### 6.2 Widget / macro (özet)

| İmza | Açıklama |
|------|----------|
| `<<phoneCall charId>>` | Arama yapar; log’a eklenir; isteğe bağlı passage/event tetikler. |
| `<<phoneCreateAppointment charId location time>>` | Randevu oluşturur. |
| `<<phoneCancelAppointment id>>` | Randevu iptal. |

**Rehber:** Aranabilir kişiler = `setup.phoneContactsFamily` + `$phoneContactsUnlocked` (bkz. §1.2). Contact promoted sonrası eşlenen charId’ler de bu listeye eklenebilir.

---

## 7. Contact promoted (Anon / DM → gerçek contact)

### 7.1 Amaç

Fotogram (veya Finder) DM’den “numara ver” seçilince, o anon/hesap **Messages** ve **Calls**’ta gerçek bir kişi gibi görünmeli (konuşma, arama, randevu). Bunun için **anon ID → charId** eşlemesi ve nerede tutulacağı net olmalı.

### 7.2 Veri modeli (öneri – karar Faz 0’da)

**Seçenek A – Ayrı map:**  
`$phoneContactPromoted = { "anon_dm_123": "charId_promoted_1", ... }`  
- Key = Fotogram DM id (veya anon hesap id).  
- Value = oyunda “gerçek” contact olarak kullanılacak ID. Bu ID ya `setup.characterDefs`’te tanımlı bir NPC, ya da “promoted contact” için özel bir charId (örn. `promoted_1`) olur.  
- Messages’ta konuşma key’i = `charId` (yani promoted sonrası `$phoneConversations["charId_promoted_1"]`).  
- Fotogram DM’deki mesaj geçmişi: ya Messages’a taşınmaz (sadece yeni konuşma başlar), ya da bir kerelik migrate ile `$phoneConversations[charId]`’e kopyalanır (tasarım kararı).

**Seçenek B – Conversations’a doğrudan key:**  
Numara verilince anon ID zaten “geçici charId” gibi kullanılıyorsa, `$phoneConversations["anon_dm_123"]` konuşması kalır; sadece Calls ve “rehber” tarafında bu ID’nin “gerçek arama hedefi” olduğu işaretlenir. Yani anon ID = Messages key olmaya devam eder; `setup.characterDefs`’te anon ID için sahte bir giriş (isim, avatar) tutulur.

**Karar öncesi not:** Hangi model seçilirse seçilsin, **Fotogram DM yazılmadan önce** bu dokümana “Contact promoted: Seçenek A/B, şu alanlar kullanılacak” diye işlenmeli; aksi halde DM implementasyonu sırasında foundation’a geri dönmek gerekir.

---

## 8. Fame / Reputation / Event tracker

### 8.1 Veri modeli

| Alan | Tip | Açıklama |
|------|-----|----------|
| `$phoneFame` veya mevcut stat | number | Takipçi sayısı (veya fame puanı). |
| `$phoneReputation` | number | (İsteğe bağlı) Ayrı reputation. |
| `$phoneFameEventsFired` | `Array<string>` veya `Object.<string, boolean>` | Hangi eşik event’leri zaten tetiklendi. Örn. `["10k", "agency_contact", "recognized_mall"]`. Aynı event tekrar tetiklenmez. |

### 8.2 Teknik sözleşme

- **Eşik kontrolü:** Passage veya event koşulunda “10k takipçi ve agency event’i atılmadıysa” → `$phoneFame >= 10000 && !$phoneFameEventsFired.includes("agency_contact")`.
- **Tetikleme:** Event oynandıktan sonra `<<phoneFameEventFired "agency_contact">>` (veya benzeri widget) çağrılır; `$phoneFameEventsFired` güncellenir.
- **Widget:** `<<phoneFameEventFired eventId>>` → sadece ilgili id’yi listeye ekler (tekrar eklemez).

---

## 9. Badge ve Rightbar toplamı (türetilmiş)

Tüm badge’ler state’ten türetilir; hiçbir yerde elle `$notificationPhone*` artırılmaz.

| Kaynak | Hesaplama |
|--------|-----------|
| Messages | `phoneUnreadCount()` (§1) |
| Fotogram | `$phoneNotifications.fotogram.length` (veya read sayılmazsa benzeri) |
| Finder | `$phoneNotifications.finder.length` |
| Rightbar toplam | Messages + Fotogram + Finder (JS’te her render’da hesaplanır) |

JS (phone.js, rightbar.js): `State.variables.phoneConversations` vb. okuyup yukarıdaki formülleri uygular; mevcut `$notificationPhoneMessages` vb. kaldırılır veya sadece bu hesaplanan değerle doldurulur (tercih: kaldır, doğrudan hesapla).

---

## 10. Init sırası (variablesBase veya PhoneInit)

Aşağıdaki state’ler oyun başında (veya telefon ilk kullanılmadan önce) init edilir; kayıtla saklanır.

```text
$phoneConversations = {}
$phoneGallery = []
$phoneFotogramPosts = []
$phoneFotogramDMs = []
$phoneNotifications = { fotogram: [], finder: [] }
$phoneFinderProfile = { galleryIds: [] }
$phoneFinderMatches = []
$phoneAppointments = []
$phoneFameEventsFired = []
$phoneContactPromoted = {}   // veya seçilen modele göre
$phoneContactsUnlocked = []  // numara swap edilen kişiler (aile setup.phoneContactsFamily'de)
$phoneWhereAskedLast = {}    // Where are you? günde bir (charId -> { day, month, year })
```

(İsteğe bağlı: `$phoneFame`, `$phoneReputation`, `$phoneCallsLog` – eğer ayrı stat kullanılmayacaksa.)

**Mevcut kaldırılacak:** `$notificationPhoneCount`, `$notificationPhoneMessages`, `$notificationPhoneFotogram`, `$notificationPhoneFinder` – badge artık §9’daki gibi türetilir.

---

Bu doküman, roadmap’teki Faz 0 kararları netleştikten sonra son haline getirilir; kararlar aşağıdaki checklist’e işlenir. Uygulama aşamasında tüm widget ve JS kodu bu veri modeli ve arayüzlere uygun yazılır.

---

## 11. Faz 0 karar checklist (netleşince doldurulacak)

| Karar | Seçenekler | Karar (tarih) |
|-------|------------|----------------|
| **Mesaj trim** | Konuşma başına N = ? (örn. 100); sadece son N mesaj saklanır. | |
| **Fotogram/Finder okundu** | Tek tek drain (açınca listeden çıkar) / Toplu “clear all” / Her öğede `read: true` | |
| **Contact promoted** | §7 Seçenek A (ayrı `$phoneContactPromoted` map) / Seçenek B (anon ID = conversation key) | |
| **Gallery üst limit** | Öğe sayısı (örn. 200); aşılınca en eski silinir mi / yeni red mi? | |
