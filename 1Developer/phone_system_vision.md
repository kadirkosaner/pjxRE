# Phone System – Oyun İçi Vizyon (Fotogram, Gallery, Calls, Fame)

Bu dokümanda telefonun oyundaki rolü, uygulamaların birbirine ve oyun dünyasına bağlantısı, aile/anon/DM/fame tetikleyicileri tek yerde toplanıyor. Altyapı detayı için `phone_system_foundation.md` kullanılacak.

---

## 1. Genel Mantık

- **Telefon** = içerik (foto/video) + sosyal etkileşim (yorum, DM, arama) + **aksiyon tetikleyici** (event, randevu, buluşma).
- **Fotogram gibi uygulamalar dünyaya bağlı:** Sadece uygulama içinde kalmakla kalmaz; **oyun dünyasında** bir yerde dolaşırken, bir lokasyondayken veya bir NPC ile etkileşimde **event tetiklenebilir** (tanınma, tepki, konuşma). Yani telefon içeriği ile dünya tepkisi sürekli bağlantılı.
- **Camera** → foto havuzundan stat’e uygun seçim → **Gallery**’e kayıt → Gallery’den **Fotogram / Finder / Messages**’a paylaşım.
- **Fotogram** = feed (shuffle), yorumlar, DM; aile event’leri ve anon/hesap havuzundan gelen mesajlar.
- **Fame + reputation** = belli eşiklerde yeni aksiyonlar açılır (numara verme, buluşma, özel foto gönderme).
- **Calls** = arama + randevu oluşturma.

---

## 2. Camera → Foto havuzu → Gallery

- **Take a photo:** Oyundaki anlık stat’lara göre (lokasyon, outfit, looks, mood, “ne yapıyorsun” vb.) bir **foto havuzu**ndan (hazır asset’ler) **random** bir foto seçilir.
- Seçilen fotoşa bir **tip/değer** atanır (örn. “sexy selfie”, “günlük”, “mekân”). Bu değer hem Gallery’de etiket hem paylaşım sonrası yorum/DM havuzunu besler.
- Foto **Gallery**’e kaydedilir. Gallery = oyuncunun çektiği tüm fotoğrafların listesi.
- **Paylaşım:** Gallery’den tek bir foto seçilir → **Fotogram** (feed’e post), **Finder** (profile/ Matching’e) veya **Messages** (belirli bir kişiye özel gönderim) hedeflerinden birine atanır.

Yani Camera gerçek zamanlı “çekim” değil; stat’lara uygun hazır foto + etiket → Gallery → sonra istediğin uygulamaya/kişiye gönderme.

---

## 3. Gallery

- Tüm çekilen fotoğraflar burada listelenir (küçük önizleme + tip/değer).
- Her fotoğraf için aksiyon: **Fotogram’da paylaş**, **Finder’a ekle**, **Messages’ta X kişisine gönder** (özel foto).
- İleride: silme, favorileme vb. eklenebilir.

---

## 4. Fotogram (Instagram mantığı)

**Feed (shuffle):**
- Senin postların + (isteğe bağlı) takip ettiklerin / random hesapların postları.
- Foto + video; hazır videolar “sanki Instagram’da dolaşıyoruz” hissi için kullanılır.
- **Feed’de bir foto görmek bile** (özellikle takip ettiklerimizden) **event tetikleyebilir** (sahne, diyalog, tepki).

**Yorumlar:**
- Senin postlarına gelen yorumlar: **içeriğe göre** (foto tipi: sexy selfie, mekân, vb.) + **looks / mekân** vb. stat’lara göre havuzdan veya kurallara göre üretilir.
- **Aile bireyleri (anne, baba, kardeş):** Event’lerle **oyun içinde** senin postların hakkında yorum yapabilir; bu **tetikleyici** (konuşma, tartışma, uyarı, flag).

**DM (Direct Message):**
- **Havuz:** Anon hesaplar veya isimli hesaplar; **uygunsuz** veya **çarpıcı** mesajlar atabilir.
- **Cevap tonları:** Kısa cevap / flört / sert red / engelle (ve benzeri). Her ton için **hazır cevap metinleri** yazılır; karşı taraftan **cevaplar gelir** (metin veya tepki), böylece mini konuşma akışı oluşur.
- DM’den **numara verme:** Belli koşullarda (fame, reputation, seçim) oyuncu telefon numarasını verebilir → o kişi **Messages** ve **Calls**’ta gerçek bir konuşma / arama / randevu hedefi olur.

---

## 5. Fame + Reputation = Dünyayı değiştiren tetikleyici

- **Takipçi sayısı** ve **reputation** belli eşiklere gelince:
  - **Aksiyon kilitleri** açılır: numara verme, buluşma ayarlama, özel foto gönderme vb.
  - Asıl önemlisi: **dünya tepki verir** – yaptıklarımızın **doğal sonucu** olarak yeni durumlar ortaya çıkar.

**Dünyanın tepkisi (ucu açık, örnekler):**
- **Agency yazacak** – Belli bir fame/reputation’da bir ajans (DM veya mesajla) ulaşır; iş teklifi, anlaşma, fırsat.
- **OnlyFans benzeri platform** – İleride böyle bir platform açıldığında insanlar “sen o kız değil misin?” diye tanıyacak; tanınma, tepki, yeni event’ler.
- **Günlük hayatta tanınma** – Sokakta, işte, okulda “Fotogram’dan gördüm seni” diyenler; diyalog, flört, rahatsızlık vb.
- **Aile / çevre** – Ünlülük arttıkça ailenin veya tanıdıkların tepkisi değişir; konuşmalar, event’ler.

**Tasarım ilkesi:** Her yaptığımızın bir **sonucu** olması. Fame sadece “sayı + kilit” değil; **dünyanın bize nasıl davrandığını** değiştiren bir güç. Tetiklenen şeyler sabit bir liste değil; **doğal dünyayı etkileyen**, ileride yeni senaryolarla genişletilebilecek **açık uçlu** bir sistem.

**Fame event’lerin tekrar tetiklenmemesi:** Belli eşik event’leri (agency yazması, tanınma sahnesi vb.) bir kez oynandıktan sonra tekrar ateşlenmemeli. Bunun için **hangi eşik event’lerinin zaten oynandığını** tutan bir state şart – örn. `$fameEvents = { agencyContacted: true, recognizedAtMall: true, ... }` veya `$fameEventsFired = [ "10k", "50k", "agency" ]`. Bu tracker’ı tasarımın başında planlamak gerekir; sahneleri yazdıktan sonra “neden iki kez tetiklendi?” debug’ı zorlaşır.

---

## 6. Messages (genişletilmiş)

- **Kaynaklar:** NPC’ler (quest, hikaye) + **Fotogram/Finder’dan gelen kişiler** (numara verdikten sonra).
- Bu kişilerle: yazışma, **özel foto gönderme** (Gallery’den seç), **arama** (Calls’a bağlı), **buluşma ayarlama**.
- DM’deki “numara ver” akışı burada **gerçek bir konuşma** (Messages + Calls) ile birleşir.

---

## 7. Calls

- **Arama:** Listelenen kişileri (rehber / Messages’taki kişiler) arayabilme.
- **Randevu:** Arama veya mesajlaşma sırasında **buluşma ayarlama** (tarih/saat/lokasyon); bu da oyun içi event veya passage tetikleyebilir.

---

## 8. Özet tablo (akış)

| Bileşen | Rol |
|--------|-----|
| **Camera** | Stat’e uygun foto havuzundan seçim → tip atama → Gallery’e kayıt. |
| **Gallery** | Tüm fotoğraflar; Fotogram / Finder / Messages’a paylaşım veya özel gönderim. |
| **Fotogram** | Feed (foto/video, shuffle), yorumlar (içerik + looks/mekân), aile event yorumları, DM (anon/hesap havuzu, ton seçenekleri, numara verme). |
| **Finder** | Profile / eşleşme; Gallery’den foto ekleme; ileride DM veya randevu ile Messages/Calls’a bağlanabilir. |
| **Messages** | NPC + numara verilen kişiler; yazışma, özel foto, arama, randevu. |
| **Calls** | Arama + randevu oluşturma. |
| **Fame / reputation** | Eşiklerde aksiyon açılır + **dünya tepki verir** (agency, tanınma, OnlyFans-benzeri “sen o kız mısın?”, günlük hayatta tanınma; ucu açık). |

---

## 9. Tetikleyici özeti

- **Spicy foto paylaşımı** → Aile event’leri (yorum, konuşma, tepki).
- **Feed’de foto görme** (takip ettiklerimizden) → Event tetiklenebilir.
- **DM (uygunsuz / çarpıcı)** → Ton seçimi (kısa/flört/red/engelle) → Karşı cevap → İsteğe numara verme → Messages/Calls’a taşınma.
- **Fame + reputation eşiği** → Hem aksiyon kilidi (randevu, özel foto vb.) hem **dünyanın tepkisi**: agency yazması, platformda/gerçek hayatta tanınma (“sen o kız değil misin?”), aile/çevre tepkisi. **Her yaptığımızın bir sonucu olması** – tetiklenen şeyler doğal dünyayı etkiler, ucu açık.

Bu vizyon, altyapı tasarımında (veri yapıları, widget’lar, event koşulları) referans alınacak; uygulama sırası ve teknik detay `phone_system_foundation.md` ile uyumlu gidecek.
