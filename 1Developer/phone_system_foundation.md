# Phone System – Altyapı Tasarımı (Sıfırdan)

Mevcut UI (rightbar telefon mockup, overlay, uygulama ekranları) korunur. Bildirimler, badge sayıları ve konuşmalar **tek kaynaklı, widget tabanlı** bir yapıya taşınır.

---

## 1. Sorun (Mevcut Durum)

- **Badge / sayılar:** `$notificationPhoneCount`, `$notificationPhoneMessages`, `$notificationPhoneFotogram`, `$notificationPhoneFinder` elle set ediliyor; kimin ne zaman artırıp azaltacağı belirsiz, senkron kolay bozuluyor.
- **Konuşmalar:** Henüz veri yapısı yok; mesaj gelince nereye yazılacağı, okundu nasıl işaretleneceği tanımlı değil.
- **Bildirim (toast):** `notifyPhone("mesaj")` var ama “ne zaman gösterilir” ve “hangi olayla badge artar” bağlantısı yok.
- **Yeni konuşma:** Oyuncu veya NPC tarafı başlatma akışı tanımlı değil.

Bu yüzden **tek kaynak (state) + tüm güncellemelerin widget’lardan geçmesi** hedefleniyor.

---

## 2. Veri Modeli (Tek Kaynak)

### 2.1 State (kayıtla birlikte saklanan)

```javascript
// Konuşmalar: charId → mesaj listesi
$phoneConversations = {
  "dinerManager": [
    { from: "dinerManager", text: "Yarın erken gel.", time: { day: 12, month: 2, hour: 18, minute: 30 }, read: false },
    { from: "player", text: "Tamam.", time: { ... }, read: true }
  ]
}

// İsteğe bağlı: uygulama bazlı “bildirim kuyruğu” (Fotogram/Finder için genişletilebilir)
$phoneNotifications = {
  messages: [],   // { id, charId, text, time } – sadece okunmamış özet; veya badge sadece conversations'dan türetilir
  fotogram: [],   // { id, type, ... }
  finder: []      // { id, type, ... }
}
```

**Tercih (basit tutmak için):**

- **Messages:** Sadece `$phoneConversations`. Okunmamış = konuşmadaki `read: false` olan mesajlar. Ayrı `$phoneNotifications.messages` tutmaya gerek yok.
- **Fotogram / Finder:** İleride benzer şekilde `$phoneNotifications.fotogram` / `$phoneNotifications.finder` listesi tanımlanabilir; badge = liste uzunluğu.

### 2.2 Badge sayıları (türetilmiş, elle sayı tutulmaz)

- **Messages:** `phoneUnreadMessages()` = tüm `$phoneConversations` içinde `read === false` olan mesaj sayısı.
- **Fotogram:** `$phoneNotifications.fotogram.length` (veya ileride benzeri).
- **Finder:** `$phoneNotifications.finder.length`.
- **Rightbar toplam:** `phoneUnreadMessages() + fotogram.length + finder.length` (veya sadece Messages için `phoneUnreadMessages()`).

Böylece **tek kaynak** = konuşmalar + (ileride) notifications; badge’ler hep bu veriden hesaplanır, elle `$notificationPhoneMessages++` yapılmaz.

### 2.3 Setup (sadece okuma)

- `setup.characterDefs[charId]` – isim, avatar (zaten var).
- İsteğe bağlı: `setup.phoneContacts` – telefonda görünebilecek karakter ID’leri (rehber / “yeni konuşma” listesi için). Yoksa sadece `$phoneConversations` key’leri kullanılır.

---

## 3. Widget’lar (Tüm Güncellemeler Buradan)

Passage’lar doğrudan `$phoneConversations` veya badge sayılarını yazmaz; hep widget/macro kullanır.

### 3.1 `<<phoneReceiveMessage charId "Metin">>`

- **Ne yapar:** NPC’den oyuncuya bir mesaj ekler.
- **Veri:** `$phoneConversations[charId]` yoksa `[]` oluşturur; `{ from: charId, text: "Metin", time: $timeSys’ten snapshot, read: false }` push eder.
- **Bildirim:** İsteğe bağlı `notifyPhone("X: Metin önizlemesi")` (veya sadece “Yeni mesaj”).
- **Badge:** Hiçbir sayıyı elle artırmaz; UI her açıldığında `phoneUnreadMessages()` ile okunmamış sayıyı alır.

Kullanım: `<<phoneReceiveMessage "dinerManager" "Yarın erken gel.">>`

### 3.2 `<<phoneSendMessage charId "Metin">>`

- **Ne yapar:** Oyuncudan NPC’ye mesaj gönderir (konuşma varsa ekler, yoksa oluşturur).
- **Veri:** `$phoneConversations[charId]` içine `{ from: "player", text: "Metin", time: ..., read: true }` push eder.
- **Badge:** Değiştirmez (oyuncu kendi mesajını “okundu” kabul eder).

İleride: seçenekli yanıtlar için `<<phoneSendMessage charId "Metin" "replyId">>` veya ayrı `<<phoneReplyOptions charId>>` gibi genişletilebilir.

### 3.3 `<<phoneMarkConversationRead charId>>`

- **Ne yapar:** O konuşmadaki tüm mesajlarda `read: true` yapar.
- **Ne zaman:** Telefon Messages ekranında konuşma detayı açıldığında (UI’dan veya bir “konuşmayı aç” akışında).

Böylece badge sadece veriden türetildiği için otomatik düşer.

### 3.4 `<<phoneStartConversation charId>>`

- **Ne yapar:** `$phoneConversations[charId]` yoksa `[]` ile oluşturur. İlk mesajı eklemez; sadece “konuşma var” yapar.
- **Kullanım:** Oyuncu “yeni mesaj” ile birini seçtiğinde veya passage’da “X’e yaz” butonuna basıldığında. Sonrasında ilk mesaj `<<phoneSendMessage charId "Merhaba">>` gibi gönderilir.

İsteğe bağlı: `<<phoneStartConversation charId "İlk mesaj metni">>` ile hem konuşma açıp hem ilk mesajı gönderebilir (içerde `phoneSendMessage` mantığını çağırır).

### 3.5 Bildirim (toast) – tutarlı kullanım

- **NPC mesajı:** `<<phoneReceiveMessage>>` içinde (opsiyonel) `notifyPhone(...)` çağrılır; tek yer burası olur.
- **Diğer (Fotogram beğeni, Finder eşleşme vb.):** İleride `<<phoneNotifyFotogram ...>>` / `<<phoneNotifyFinder ...>>` gibi widget’lar aynı mantıkla hem listeye ekler hem `notifyPhone` çağırır.

Böylece “bildirim göstermek” ve “badge’i artırmak” (veri ekleyerek) tek bir widget üzerinden olur.

---

## 4. Badge’leri Kim, Nerede Hesaplar?

- **Twee/State tarafı:** Bir “helper” widget veya SugarCube fonksiyonu: `<<phoneUnreadMessages>>` → sadece okunmamış sayıyı hesaplayıp döner (veya bir `$phoneUnreadCount`’u günceller – ama tercih: her zaman hesapla, ek değişken yok).
- **JS tarafı (rightbar, phone overlay):** State’teki `$phoneConversations` (ve ileride `$phoneNotifications`) okunur; badge sayıları sayılarak hesaplanır. Rightbar’da “toplam” = Messages + Fotogram + Finder.

Mevcut `$notificationPhoneMessages` vb. **kaldırılabilir** veya **sadece “gösterim için”** JS’in hesapladığı değerle doldurulur (passage render sonrası bir hook ile). En temizi: JS her render’da `State.variables.phoneConversations` üzerinden hesaplasın; Twee’de ayrı değişken tutulmasın.

---

## 5. UI Akışı (Kısa)

1. **Rightbar:** Toplam badge = `phoneUnreadMessages()` (+ ileride fotogram/finder). Tıklanınca overlay açılır.
2. **Overlay – Messages:** Konuşma listesi = `$phoneConversations` key’leri; her satırda son mesaj önizlemesi + o konuşmadaki okunmamış sayı (hesaplanmış).
3. **Konuşma satırına tıklanınca:** Konuşma detayı açılır; açılır açılmaz `<<phoneMarkConversationRead charId>>` çağrılır. **Önemli:** JS’ten `$.wiki('<<phoneMarkConversationRead "charId">>')` ile state güncellenir ama SugarCube’da state değişikliği sonrası UI otomatik yenilenmez. Bu çağrıyı kullanan her yerde **Engine.play()** (aynı passage’a) veya **manuel DOM güncellemesi** (badge / liste yeniden çiz) tetiklenmeli; yoksa badge veya liste eski kalır.
4. **Yeni konuşma:** “Yeni mesaj” butonu → (varsa) `setup.phoneContacts` veya konuşması olanlar listesi → seçim → `<<phoneStartConversation charId>>` (+ isteğe bağlı ilk mesaj).

**Vizyon–foundation bağlantısı (contact promoted):** Fotogram DM’den “numara ver” → o kişi Messages ve Calls’ta **gerçek contact** olur. Bunun için veri tarafında bir “contact promoted” geçişi gerekir: anon/hesap ID’si → numara verildikten sonra gerçek bir `charId` veya `$phoneContacts` kaydı ile eşleşmek. Foundation şu an sadece Messages + temel bildirimi kapsıyor; Gallery, Fotogram feed, DM ton sistemi, numara verme → real contact akışının veri modeli ileride eklenecek. Bu akışı zihinde tutup veri yapısını buna göre genişletmek gerekecek.

**Not (karar öncesi):** Şu an bu paragraf fikir olarak doğru ama detay yüzeysel: **anon ID’nin gerçek `charId`’ye nasıl eşleneceği** ve **eşleşmenin nerede tutulacağı** (örn. `$phoneContacts` map’i mi, yoksa `$phoneConversations`’a doğrudan key olarak mı?) belirsiz. “İleride eklenecek” olarak bırakmak makul; ancak **Fotogram DM yazmaya başlamadan önce** bu karar verilmeli. Aksi halde o sistem yazılırken foundation’a geri dönüp veri modelini değiştirmek gerekir.

---

## 6. Teknik Dikkat Noktaları

- **Konuşma boyutu:** `$phoneConversations` üzerinde her render’da dönen `phoneUnreadMessages()` küçük oyun için sorun değil; konuşmalar büyüyünce **save boyutu** ve **performans** etkilenebilir. Mesaj sayısına **üst limit** (konuşma başına veya toplam) veya **eski mesajları trim** eden bir mekanizma (örn. son N mesaj tut) planlamaya değer; yoksa ileride save migration zorlaşır.
- **Fotogram / Finder “okundu” semantiği:** Messages’ta konuşmayı açmak = tüm mesajlar okundu. Fotogram ve Finder’da ise: tek tek item “drain” (açınca listeden çıkar) mı, yoksa toplu “clear all” mı? Bu karar erken verilirse veri modeli (array’den silme vs. `read: true` işaretleme) net oturur; sonra değiştirmek zahmetli olur.

---

## 7. Genişletme (Fotogram / Finder)

- **Fotogram:** `$phoneNotifications.fotogram.push({ id, type: "like"|"comment", ... })`; badge = `fotogram.length`. “Göster”e tıklanınca ilgili öğe listeden çıkarılır veya `read: true` benzeri işaretlenir. (Okundu semantiği: bkz. §6.)
- **Finder:** Aynı mantık; `$phoneNotifications.finder`.
- Her biri için küçük widget’lar: `<<phoneNotifyFotogram type "özet">>`, `<<phoneNotifyFinder ...>>` → listeye ekle + isteğe bağlı `notifyPhone`.

Mevcut `$notificationPhoneFotogram` / `$notificationPhoneFinder` sayıları kaldırılır; sayı her zaman ilgili dizi uzunluğundan türetilir.

---

## 8. Yapılacaklar (Uygulama Sırası)

**Öncelik:** Foundation’ı gerçek oyunda test edebilmek için **badge hesaplama + Messages UI (aşağıdaki 7–8)** mümkün olduğunca **erkene** alınır. Sadece widget yazıp UI olmadan test etmek, state/refresh ile ilgili hataları gizler; UI ile birlikte erken test daha sağlıklı.

| Sıra | İş | Nerede |
|------|-----|--------|
| 1 | Veri: `$phoneConversations = {}` init; mesaj limit/trim stratejisi kararı (bkz. §6). `$phoneNotifications = { fotogram: [], finder: [] }` ileride. | variablesBase veya PhoneInit |
| 2 | Helper: Okunmamış mesaj sayısı hesaplayan fonksiyon (Twee widget veya JS). JS rightbar/phone’da badge’i buradan türetir. | Widgets veya phone.js |
| 3 | Widget: `<<phoneReceiveMessage charId "Metin">>` | Yeni PhoneWidgets.twee veya mevcut System widget |
| 4 | Widget: `<<phoneMarkConversationRead charId>>` | Aynı |
| 5 | Widget: `<<phoneSendMessage charId "Metin">>` | Aynı |
| 6 | Widget: `<<phoneStartConversation charId>>` (veya ilk mesajlı varyant) | Aynı |
| **7** | **Phone/rightbar: Badge’i `$phoneConversations` üzerinden hesapla; `notificationPhoneMessages` vb. kullanma. (Erken yap – test için.)** | phone.js, rightbar.js |
| **8** | **Messages UI: Liste + konuşma detayı; detay açılınca `phoneMarkConversationRead` + UI refresh (Engine.play veya DOM update). (Erken yap – test için.)** | phone.js |
| 9 | İsteğe bağlı: `notifyPhone`’u sadece `phoneReceiveMessage` (ve ileride Fotogram/Finder widget’ları) içinden çağır. | phoneReceiveMessage içi |

Bu sırayla bildirimler, badge ve yeni konuşma tek kaynaklı altyapıya oturur. **Kapsam riski:** Vizyon (Gallery, Fotogram feed, DM ton, Calls, numara verme) büyük; **önce foundation (Messages + badge + UI) tam oturmalı**, sonra Fotogram + Gallery’ye geçmek daha sağlıklı.
