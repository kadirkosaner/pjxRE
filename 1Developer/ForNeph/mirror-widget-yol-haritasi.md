# Mirror Widget – Yol Haritası (Roadmap)

Bu belge Mirror menüsü, item kullanımı ve stat sistemi için önce neyin yapılması gerektiğini sıralar. Önce **item + stat** altyapısı, sonra **Mirror girişi ve Back davranışı**, en sonda **içerik (pasajlar, rutin, makyaj seviyeleri)** gelir.

---

## 1. Mevcut Durum Özeti

| Alan | Durum |
|------|--------|
| **Mirror pasajları** | `mirrorMakeup`, `mirrorMakeupApply`, `mirrorFaceCare`, `mirrorDentalCare`, `mirrorApplyRoutine` var. **Ana menü pasajı "Mirror" yok.** Tüm Back butonları `"Mirror"` pasajına gidiyor. |
| **Mirror girişi** | Banyo (`fhUpperBath`) vb. yerlerde henüz "Mirror" butonu yok. `<<btn "Mirror">>` ile birden fazla yerden açılacak; **Back = açıldığı lokasyona dönmeli** (location’a göre). |
| **Item sistemi** | `$inventory = [{ id, quantity }]`, `setup.items` (consumables, cosmetics, tools, …). `checkInventoryItem` widget’ı var. Cosmetics’te `makeup_kit`, `portable_makeup`, `skincare_set` var; **tarak, diş macunu, saç bakım kremi, vücut bakım kremi** tanımlı değil. Makyaj kiti “20 kullanımlık” gibi **kullanım sayacı** yok. |
| **Stat sistemi** | `$appearance.hairCare`, `faceCare`, `dentalCare`, `makeupLevel`; `$corruption`; beauty/looks formülü ve decay (saç-yüz-diş planına uygun) mevcut. |
| **Makyaj seviyeleri** | `mirrorMakeup`’ta Light/Medium/High/Slutty/Bimbo corruption 1–5 ile kilitli; kilitli butonlarda tooltip var. **Item tüketimi (makyaj kiti)** henüz yok. |
| **Rutin** | `$mirrorRoutine` ve `mirrorApplyRoutine` var; rutin **ayar ekranı** (hangi aksiyonların rutinde olacağını seçmek) yok. “Rutini uygula” Mirror’a girince tek tuşla çalışacak. |

---

## 2. İstenen Davranış (Kısa)

- **Mirror** birden fazla lokasyondan `<<btn "Mirror">>` (veya `<<mirrorBtn>>`) ile açılsın.
- Açıldığı **lokasyona göre** Back basınca o pasaja dönülsün (örn. banyo → banyo).
- Menü: **Saçlarını Tara** → pasaj, **Makyaj Yap** → (ileride makyaj ağırlığı seçme), **Aksiyonlar**: saç bakımı, diş bakımı, yüz bakımı (mevcut pasajlara yönlendirme).
- **Rutin ekranı**: Ayarlar gibi; yapılacak rutinler seçilir. Mirror’da **Rutini uygula** butonu çıkar.
- **Makyaj**: Hafif / Orta / Yüksek / Slutty / Bimbo; corruption seviyesine göre açılır; **hepsi corruption 1+** (hafif bile corrupt 1 olmadan açılmaz). Kilitli butonlarda yoga tarzı **tooltip (info)** olsun.
- Tüm aksiyonlar **zaman + enerji** harcasın; **item** kullansın (makyaj kiti, tarak, diş macunu, saç bakım kremi, vücut bakım kremi vb.); ilgili **stat** güncellensin.
- **Makyaj kiti**: 20 kullanımlık; kullanım sonrası tüketim (veya sayaç). Diğer itemler de sonradan implemente edilecek.

---

## 3. Yol Örgüsü (Uygulama Sırası)

Önce **item + stat** altyapısı, sonra **Mirror girişi ve Back**, sonra **menü ve pasajlar**, en sonda **item tüketimi ve makyaj ağırlığı** detayı.

### Faz 1: Item Sistemi Hazırlığı

1. **Kullanım sayacı (durable item)**  
   - Makyaj kiti “20 kullanımlık” olacak.  
   - Seçenekler:  
     - **A)** Envanterde `quantity` = kalan kullanım (1 kullanımda `quantity -= 1`; 0 olunca listeden çıkar).  
     - **B)** Envanter öğesine `usesLeft` / `maxUses` alanı eklemek (setup veya inventory item’da).  
   - Karar: Hangi model oyunda kalıcı olacak (sadece makeup_kit mi, yoksa başka “X kullanımlık” itemler de olacak mı)?

2. **Yeni itemler (setup.items)**  
   - **Tarak** (comb): Saç tarama aksiyonunda gerekli.  
   - **Diş macunu** (toothpaste): Diş bakımı aksiyonunda.  
   - **Saç bakım kremi** (hair_care_cream): Saç bakımı (veya tarama ile birlikte).  
   - **Vücut bakım kremi** (body_care_cream): Vücut bakımı (ileride ayrı aksiyon olabilir).  
   - **Makyaj kiti**: Zaten var; 20 kullanım mantığı eklenecek.

3. **Item tüketim yardımcısı**  
   - Passage’larda “X item’ı kullan (1 birim veya 1 kullanım)” diye çağrılabilecek bir widget veya macro (örn. `<<consumeItem "makeup_kit" 1>>` veya `<<useItem "makeup_kit">>`).  
   - `checkInventoryItem` ile önce kontrol, sonra quantity/usesLeft düşme.

Bu faz bitmeden Mirror aksiyonlarına “item gerekli” ve “item tüket” kurallarını eklemek zor olur; önce bu altyapı netleşmeli.

---

### Faz 2: Mirror Girişi ve Back (Lokasyona Göre Dönüş)

1. **Mirror’a giriş noktası**  
   - Her lokasyonda tek bir çağrı: `<<btn "Mirror" "Mirror">>` **ve** gidilmeden önce **dönüş pasajının saklanması**.  
   - Örnek: Banyoda `<<set $mirrorReturnPassage = "fhUpperBath">><<btn "Mirror" "Mirror">><</btn>>` yerine, tek macro ile: `<<mirrorBtn "fhUpperBath">>` veya `<<btn "Mirror" "Mirror">><<set $mirrorReturnPassage = $location>><</btn>>` (eğer $location her zaman mevcut pasaj adıyla doluysa).  
   - **Öneri:** Yeni macro `<<mirrorBtn>>` (veya `<<btn "Mirror" "Mirror">>` içinde otomatik): tıklanınca **mevcut pasaj adını** (örn. `Engine.state.passage`) `$mirrorReturnPassage` (veya `State.temporary.mirrorReturnPassage`) içine yaz; sonra `Mirror` pasajına git. Böylece her lokasyonda sadece `<<mirrorBtn>>` veya `<<btn "Mirror" "Mirror">>` koymak yeterli olur.

2. **"Mirror" ana menü pasajı**  
   - Oluşturulmalı (şu an yok).  
   - İçerik:  
     - Saçlarını Tara → `mirrorCombHair` (veya saç tarama pasajı)  
     - Makyaj Yap → `mirrorMakeup`  
     - Yüz bakımı → `mirrorFaceCare`  
     - Diş bakımı → `mirrorDentalCare`  
     - Rutin Ayarları → `mirrorRoutineSettings` (yeni)  
     - Rutini Uygula → `mirrorApplyRoutine` (rutin boşsa gizle veya devre dışı bırak)  
     - **Back** → `$mirrorReturnPassage` (veya temporary); eğer boşsa varsayılan bir pasaja (örn. banyo veya harita).

3. **Tüm Mirror alt pasajlarında Back**  
   - Şu an hepsi `<<btn "Back" "Mirror">>` kullanıyor; bu kalabilir.  
   - Sadece **Mirror** ana pasajındaki Back, `$mirrorReturnPassage`’a gidecek.

4. **Saç tarama pasajı**  
   - `mirrorApplyRoutine` içinde `combHair` aksiyonu var; **tek başına “Saçlarını Tara”** pasajı yok.  
   - Yeni pasaj: örn. `mirrorCombHair` (veya `mirrorHairCare`); zaman/enerji/hairCare artışı + günlük bir kez; ileride tarak/saç kremi kontrolü.

Bu fazla oyuncu Mirror’ı açıp menüden seçim yapabilir ve Back ile açıldığı yere döner.

---

### Faz 3: Rutin Ayarları Ekranı

1. **Rutin ayar pasajı** (`mirrorRoutineSettings`)  
   - Ayarlar sayfası gibi: hangi aksiyonlar rutinde olsun?  
   - Seçenekler: Saç tara, Makyaj, Yüz bakımı, Diş bakımı (ve ileride vücut bakımı vb.).  
   - `$mirrorRoutine` = ["combHair", "faceCare", "dentalCare", "makeup"] gibi id’lerden oluşan dizi; checkbox veya toggle ile seçilir, kaydedilir.

2. **Mirror menüsünde “Rutini uygula”**  
   - `$mirrorRoutine.length > 0` ise göster.  
   - Tıklanınca `mirrorApplyRoutine`’e git; orada zaten seçili aksiyonlar sırayla (günlük log’a göre) uygulanıyor.  
   - İleride her aksiyon için item kontrolü ve tüketimi burada veya alt pasajlarda yapılacak.

Bu fazla rutin tek tuşla uygulanabilir ve ayarlanabilir.

---

### Faz 4: Makyaj ve Aksiyonlarda Item + Stat

1. **Makyaj**  
   - `mirrorMakeup`: Corruption kilidi mevcut; kilitli butonlarda **tooltip (Requires: Corruption N)** zaten var (yoga tarzı info).  
   - `mirrorMakeupApply`:  
     - Girmeden önce **makyaj kiti** (veya portable_makeup) kontrolü: `checkInventoryItem`.  
     - Yeterli yoksa mesaj + Back.  
     - Varsa: zaman/enerji/makeupLevel artışı + **item tüketimi** (1 kullanım veya 1 birim).  
   - Makyaj seviyeleri (hafif/orta/yüksek/slutty/bimbo) corruption’a göre açık; her seviyenin kendi **corruption değeri** (görünüm için) ileride ayrıca kullanılabilir; şimdilik sadece kilitleme yeterli.

2. **Saç / Yüz / Diş**  
   - **Saç tara:** Tarak (ve istenirse saç bakım kremi) kontrol + tüketim.  
   - **Diş bakımı:** Diş macunu kontrol + tüketim.  
   - **Yüz bakımı:** Yüz/skincare item (örn. skincare_set veya yeni bir item) kontrol + tüketim.  
   - Hepsi: zaman, enerji, ilgili stat (hairCare, dentalCare, faceCare) güncellemesi; günlük bir kez sınırı (dailyActivityLog) mevcut.

3. **Rutini uygula**  
   - `mirrorApplyRoutine` içinde her aksiyon için gerekli item kontrolü ve tüketimi (combHair → tarak, makeup → makyaj kiti, vb.).  
   - Bir item eksikse o aksiyon atlanır veya rutin başında uyarı verilir; tasarım tercihine bırakılabilir.

Bu fazla tüm Mirror aksiyonları item ve stat ile tutarlı çalışır.

---

### Faz 5: İsteğe Bağlı İyileştirmeler

- **Makyaj kiti 20 kullanım:** Alışverişte “1 makeup_kit = 20 kullanım” olarak satılır; envanterde 20’den 0’a inene kadar kullanılır.  
- **Yeni itemlerin mağazada/loot’ta eklenmesi.**  
- **Bildirimler:** Örn. “Saçların dağınık”, “Dişler sararıyor” (mevcut appearance bildirimleriyle uyumlu).  
- **Rutin uygulandıktan sonra** kısa özet (hangi aksiyonlar yapıldı, ne kadar süre/enerji).

---

## 4. Kısa Özet Tablo

| Öncelik | Ne yapılacak |
|--------|----------------|
| 1 | Item: kullanım sayacı (20 kullanımlık makyaj kiti) + yeni itemler (tarak, diş macunu, saç bakım kremi, vücut bakım kremi) + tüketim widget/macro. |
| 2 | Mirror girişi: dönüş pasajını sakla; `Mirror` ana menü pasajı; Back = lokasyona dönüş; `mirrorCombHair` pasajı. |
| 3 | Rutin ayar pasajı; Mirror menüsünde “Rutini uygula” butonu. |
| 4 | Tüm Mirror aksiyonlarına item kontrolü + tüketim + stat güncellemesi (makyaj, saç, yüz, diş, rutin). |
| 5 | Dengeler, bildirimler, 20 kullanım ve mağaza entegrasyonu. |

---

## 5. Teknik Notlar

- **Dönüş pasajı:** `State.temporary.mirrorReturnPassage` kullanılırsa sadece o oturumda geçerli olur; sayfa yenilenince kaybolur. Birden fazla pasaj geçişinde de temporary bazen temizlenebilir. Bu yüzden **Mirror’a girerken** (ilk tıklamada) dönüş pasajı **hemen** set edilmeli. Kalıcı istersen `$mirrorReturnPassage` kullanılabilir.
- **mirrorBtn macro:** `<<mirrorBtn>>` tek argümansız kullanılırsa, macro içinde `Engine.state.passage` veya `State.passage` ile mevcut pasaj adı alınır; böylece her lokasyonda aynı `<<mirrorBtn>>` kullanılır ve Back her zaman doğru yere gider.
- **Rutin aksiyon id’leri:** `mirrorApplyRoutine` ile uyumlu tutulmalı: `combHair`, `makeup`, `faceCare`, `dentalCare` (ve ileride `bodyCare` vb.).

Bu yol haritasına göre önce **Faz 1 (item sistemi)** netleştirilip uygulanırsa, Mirror tarafındaki tüm “item gerekli / tüket” kuralları temiz şekilde eklenebilir.
