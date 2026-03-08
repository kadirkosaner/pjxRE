# PJX — Oynanabilir Alan ve İçerik Haritası (Mevcut Durum)

> "Gerçekte oyunu başlattığımda ne yapabiliyorum? Nereye gidebiliyorum?"
> Bu belge, kodlanmış ve **şu an aktif olarak çalışıp girilebilen** tüm içeriklerin haritasıdır.

---

## 📍 1. Başlangıçta Açık Olan Yerler (Day 1)

Oyun başladığında haritanın %90'ı kilitlidir (Discovery flag: `false`). İlk gün sadece **Maplewood (Mahalle)** aktiftir.

### 🏠 Family House (Aile Evi)

Evin tüm odaları kilitli değildir ve zaman/takvim döngüsüne göre çalışır:

- **My Bedroom:** Uyumak (`advanceTime`), Ayna (`MirrorRoutine` - saç/makyaj), Wardrobe (`Sınır testleri çalışan giyinme`), Bilgisayar (Browser ve iş arama).
- **Upper / Down Bathroom:** Banyo yapmak (Energy/Mood artışı), Aynaya bakmak. Karakterler meşgulse `showerEncounter` kapıları tetiklenir (Şu an placeholder text).
- **Kitchen & Livingroom:** Ailenin toplandığı ana merkezler. Sabahları mutfakta, akşamları salonda TV izlerken bulunurlar. TV izleme ve Yemek yeme eylemleri çalışır.
- **Brother's / Parents' Room:** Kardeş ve Ebeveynlerin kendi odaları.

### 🌳 Maplewood Sokakları

- **Sunset Park:** Jogging eylemi çalışır (Fitness artar, Energy düşer). Lily ile tanışma / sohbet burada rastgele tetiklenir.
- **Corner Shop (Bakkal):** Alışveriş yapılabilir. Günlük gıda ve basit eşyalar satılır. Kasiyer talk sistemi mevcuttur.

---

## 🏃‍♂️ 2. Ana Görev Serisi (Çalışan Quest Zinciri)

Oyuncu evde amaçsızca dolaşmaması için birbirine bağlanan bir başlangıç hikayesi (Quest V2) aktiftir:

1. **First Shopping (İlk Alışveriş):**
   - _Görev:_ Prologue sonrası Bakkala (`storeCorner`) git. Süt ve Ekmek al.
   - _Ödül:_ Kasada Şehir Haritası (`City Map`) bulunur.
2. **Moving Troubles (Taşınma Sıkıntıları):**
   - _Görev:_ Eve dönerken garip sesler duyarsın. Mutfağa gidip Anneye eşyaları ver, sonra Babayla salonda konuş (Kötü haber). Odana çekil.
3. **New Beginnings (Yeni Başlangıçlar):**
   - _Görev:_ Saat 18:00'da Mutfakta aile ile akşam yemeğine katıl.
   - _Ödül:_ Harçlık (100$) ve yeni hedefler.
4. **Use Computer (Araştırma):**
   - _Görev:_ Kardeşin odasına girip onun bilgisayarından Şehir İlçelerini öğen (_Old Town ve Civic Center haritada belirginleşir_). Abinden azar işit ve kalk.
5. **Find a Job (İş Bulma):**
   - _Görev 1:_ Mahalle Bakkalına iş sor (Reddedil).
   - _Görev 2:_ Eski Kasaba'ya (`Old Town`) git. 09:00-17:00 arası `Town Hall` Kariyer merkezine girip sıraya gir.
   - _Görev 3:_ Memurun bulduğu adrese (`Ruby's Diner`) saat 10:00-22:00 arası gidip Tom'la görüş.
   - _Görev 4:_ 18:00'da evde aileye işini anlat. Onay alıp Diner'da bulaşıkçı olarak işe başla!
6. **Yan Görev - Go To Mall:**
   - Lily'nin yönlendirmesiyle Downtown'a git ve Mall (AVM)'yi keşfet.

_Not: Görevler UI yönlendirmeleri (`<<questPrompts>>`) ile tamamen tıkır tıkır çalışmaktadır._

---

## ☕ 3. Açılan Şehir Merkezleri ve Etkileşimler

Görevler ilerledikçe haritada şu mekanlar **tıklanabilir ve gezilebilir** hale gelir:

### 🏛️ Old Town (Eski Kasaba)

- **Town Hall (Belediye):** Gündüzleri Kariyer/İş bulma işlemlerinin yapıldığı merkez.
- **Ruby's Diner:** Tom'un çalıştığı mekan.
  - _İçerik:_ Yemek yenebilir (`restaurant` modülü aktif, menüden yemek/içecek seçilir).
  - _Etkileşim:_ Tom (Kasiyer/Garson) ile Talk Database V1 üzerinden konuşulabilir ve hikaye öğrenilir. İşe girildiyse çalışılabilir (`JobSystem` aktif).

### 🌆 Downtown & Mall (Şehir Merkezi ve AVM)

- Şehrin ana alışveriş bölgesidir. AVM içi mağazalar tıklandığında açılır.
- **Aktif Mağazalar:** `StoreClothingA` (Elbiseler), `StoreSports` (Spor Giyim), `StoreBoutique` vb.
- _Eylem:_ Paramız yettiğince kıyafet alınır. Alınan kıyafetler Wardrobe sistemine eklenir. `shopping` modülü UI sepetiyle tam olarak çalışır.

---

## 🗣️ 4. Kiminle, Ne Konuşabiliyorum? (Çalışan Diyaloglar)

Hazırda konuşmaya basınca dönen metinlerin listesi:

- **Mother (Anne):** Mutfak (Sabah ve Akşam) ile Salonda (TV başı) konuşma setleri tamamlanmıştır. Friendship level 1 ve 2 seviyeleri hazırdır.
- **Father (Baba):** İş stresi ve finansal konular ağırlıklı. Sabah işe gitmeden ve akşam işten gelince (Level 1 ve 2).
- **Brother (Jake):** Oyunun en dolu karakteri. Okul dönemi ile tatil dönemi diyalogları ayrıdır. Sabah asabiyeti, öğleden sonra oyun seansları ve zoraki akşam sohbetleri (Level 1 ve 2).
- **Tom (Diner):** Müşteri-Garson dinamiğinde Level 1 konuşmaları.
- **Yan Karakterler:** Parkta koşucu Lily ve bakkal kasiyeri ile (Loop eden mini diyaloglar).

---

## 📱 5. Telefonda Neler Yapabiliyorum?

- **Kamera / Selfie:** Odanın içinde veya Dışarıdayken (Ayrı kategorilerde) Selfie çekilebiliyor. Çekilen bu resimler "Phone Gallery" ye kaydediliyor.
- **Mesajlar:** Hikayenin başında eski dostlardan veya bankadan gelen Flavor (Renk) SMS'leri var. Okundu işaretlenebiliyor.
- **Fotogram / Finder:** Altyapısı ve arayüzü çizilmiş fakat organik olarak post atma / NPC eşleşip mesajlaşma şu an placeholder (yer tutucu) seviyesindedir.

---

## 🛑 6. Şu An "Girilip De Bir Şey Yapılamayan" / "Duvar" Olan Yerler

1. Odanızdayken `Arousal` barı dolsa bile, bunu giderecek (Mastürbasyon) solosu henüz eklenmemiştir. Sadece `Bildirim (Kalp İkonu)` yanar.
2. Aile üyelerinin banyo sahnelerine (Shower Encounter - Corruption) denk gelindiğinde ekranda kırmızı metinle "Açıldı" yazar fakat sahnenin kendisi boştur.
3. Dünyadaki Red Light Center, University District ve Marina gibi yerlerin Twee haritaları çizilmiş, butona basılarak eklenebilir durumda bekliyor ama şu anki temel Quest Line oyuncuyu oraya daha yönlendirmemektedir (Discovery: False).
4. `<<sexScene>>` cinsel eylem motoru şu an kodların arasında hazır beklemektedir fakat onu tetikleyecek _Lust Level 3_ konuşmaları (Phase 3) hiçbir karakterde yazılmamıştır.

---

**Özü:** Oyun **Mekanik** ve **UI** olarak tam bir Life Sim'dir ve kusursuz çalışır (Uyuma, yeme, alışveriş, işe girme ve aileyle ilk 2 seviye sohbet etme döngüsü sorunsuzdur). Oyun hikayesi Bulaşıkçı olarak işe girdiğiniz 3-4. Güne kadar kesintisiz akmaktadır.
