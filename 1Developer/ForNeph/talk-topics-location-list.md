# Talk Topics – Lokasyon Listesi (Father, Mother, Brother)

Her lokasyonda **sadece o lokasyona ait** içerik çıkmalı. Bu dosya hangi topic’in hangi lokasyonda kullanıldığını ve DB’deki içeriğin lokasyonunu gösterir.

---

## MOTHER

### Passage → Kullanılan topic’ler

| Lokasyon      | Passage               | Topic'ler (passage'da yazılan) |
|---------------|------------------------|---------------------------------|
| **Kitchen**   | motherTalkKitchen      | cooking, **homelifeKitchen**, **daughterKitchen**, memoriesKitchen, **touchKitchen** (T2+) – sadece Kitchen |
| **Backyard**  | motherTalkBackyard     | healthBackyard, booksBackyard, garden, memoriesBackyard |
| **Living Room** | motherTalkLivingRoom | homelife, family, daughter, health, books, memories, marriage, appearance, touch (T2+), secrets, confession (T3) |
| **Parents Room** | motherTalkParentsRoom | **daughterParentsroom**, booksParentsroom, marriage, appearance, **touchParentsroom** (T2+), secrets, desires, confession (T3) |

### DB’de topic içeriği (CommonTopics) – hangi lokasyon sahnesi var?

| Topic key | DB'deki içerik lokasyonları | Sadece 1 lokasyon? |
|-----------|-----------------------------|---------------------|
| cooking | Kitchen | ✅ Evet |
| **homelife** | Kitchen + **Livingroom** karışık | ❌ Hayır – Kitchen’da Livingroom çıkabilir |
| family | Livingroom | ✅ Evet |
| **daughter** | Kitchen + **Livingroom** + **Parentsroom** karışık | ❌ Hayır – Kitchen’da başka lokasyon çıkabilir |
| health | Livingroom (düzeltildi) | ✅ Evet |
| healthBackyard | Backyard | ✅ Evet |
| books | Livingroom (düzeltildi) | ✅ Evet |
| booksBackyard | Backyard | ✅ Evet |
| booksParentsroom | Parentsroom | ✅ Evet |
| garden | Backyard | ✅ Evet |
| memories | Livingroom (düzeltildi) | ✅ Evet |
| memoriesKitchen | Kitchen | ✅ Evet |
| memoriesBackyard | Backyard | ✅ Evet |
| marriage | Livingroom + Parentsroom | ⚠️ Living Room & Parents Room’da kullanılıyor – her ikisi de uygun |
| appearance | Livingroom + Parentsroom | ⚠️ Aynı şekilde |
| **touch** | Kitchen + **Livingroom** + **Parentsroom** karışık | ❌ Hayır – Kitchen’da başka lokasyon çıkabilir |
| secrets | Livingroom + Parentsroom | ⚠️ Uygun |
| desires | Parentsroom | ✅ Evet |
| confession | Livingroom + Parentsroom | ⚠️ Uygun |

**Mother – YAPILDI:** Kitchen artık sadece `homelifeKitchen`, `daughterKitchen`, `memoriesKitchen`, `touchKitchen`, `cooking` kullanıyor. Living Room: `homelife`, `daughter`, `touch` (sadece Livingroom içeriği). Parents Room: `daughterParentsroom`, `touchParentsroom`, `booksParentsroom`.

---

## FATHER

### Passage → Kullanılan topic’ler

| Lokasyon      | Passage               | Topic'ler |
|---------------|------------------------|------------|
| **Kitchen**   | fatherTalkKitchen      | finance, health (T2), marriage (T1), work (T2 preWork), finances, health (T2 postWork), marriage (T1,T3 postWork) |
| **Living Room** | fatherTalkLivingRoom | advice (T2+), future, health (T1,T3), hobbies, marriage (T2+), memories, sports, work (T1,T3 preWork); postWork: advice, car, future, health, hobbies, memories, sports, work |
| **Backyard**  | fatherTalkBackyard     | advice (T1 only – PreWork) |
| **Garage**    | fatherTalkGarage       | car, hobbies (T1); postWork: finances (T2), health (T2), marriage (T2), sports (T1), work |

### DB’de topic içeriği (CommonTopics + PreWork + PostWork)

| Topic key | DB'deki içerik lokasyonları | Kitchen’da kullanılıyor mu? | Sorun? |
|-----------|-----------------------------|----------------------------|--------|
| finance | Kitchen (PreWork) | ✅ Evet | ✅ Sadece Kitchen |
| finances | PostWork: Kitchen (T1,T3), **LivingRoom (T2), Garage (T2)** karışık | Kitchen T1,T3 | ❌ Garage’da Livingroom/Kitchen çıkabilir |
| health | PreWork: **Livingroom (T1,T3), Kitchen (T2)** karışık | Kitchen T2 | ❌ Kitchen’da Livingroom çıkabilir |
| marriage | **Kitchen (T1), Livingroom (T2-T3)** | Kitchen T1, T3 postWork | ✅ Kitchen T1 sadece Kitchen; Living Room’da T2–T3 |
| work | PreWork: Livingroom (T1,T3), **Kitchen (T2)** | Kitchen T2 | ✅ Tier2 Kitchen |
| advice | Backyard (T1), Livingroom (T2–T3) | Hayır | Backyard sadece T1 – uygun |
| car | Garage (PreWork); PostWork **Livingroom** (CarLivingroom img) | Hayır | ⚠️ Garage’da PostWork car = Livingroom img kullanılıyor |
| future | Livingroom | Hayır | ✅ |
| hobbies | Garage (T1), Livingroom (T2–T3) | Hayır | Garage T1 sadece Garage; Living Room T2–T3 |
| memories | Livingroom | Hayır | ✅ |
| sports | Livingroom (PreWork); PostWork’te Garage (T1) ama **CarLivingroomTier2** img | Garage T1 postWork | ❌ Garage’da Livingroom sahnesi çıkabilir |

**Father’da düzeltilecek:**  
1. Kitchen T2’de **health** → DB’de health tier2 hem Kitchen hem Livingroom içeriyor; Kitchen passage’da **healthKitchen** kullanılacak (DB’de healthKitchen = sadece Kitchen T2).  
2. Garage postWork: finances, health, marriage, sports, work topic’leri PostWork DB’de çoğunlukla Livingroom img ile karışık; ideal çözüm Garage’a özel key’ler veya sadece Garage içeriği olan topic’leri Garage’da kullanmak.

---

## BROTHER

### Passage → Kullanılan topic’ler

| Lokasyon      | Passage               | Topic'ler |
|---------------|------------------------|------------|
| **Kitchen**   | brotherTalkKitchen     | sibling (T2), future (T1), beingHome (T3), schoolLife/sleep/outsideFriends (school), summerPlans (vacation T1) |
| **Living Room** | brotherTalkLivingRoom | sibling (T1,T3), future (T2,T3), beingHome (T1,T2), movies, memories (T2,T3), schoolLife/summerPlans/qualityTime (phase) |
| **Backyard**  | brotherTalkBackyard    | memories (T1), qualityTime (T2 vacation); fallback sibling |
| **Bedroom**   | brotherTalkBedroom     | gaming, hobbies, attraction, boundaries (T2+), fantasies, confession (T3), sleep (T3 school) |

### DB’de topic içeriği (CommonTopics + School + Vacation)

| Topic key | DB'deki içerik lokasyonları | Not |
|-----------|-----------------------------|-----|
| sibling | Livingroom (T1,T3), **Kitchen (T2)** | Kitchen T2 = Kitchen; Living Room T1,T3 = Livingroom ✅ |
| future | **Kitchen (T1),** Livingroom (T2–T3) | Kitchen T1 = Kitchen ✅ |
| beingHome | Livingroom (T1–T2), **Kitchen (T3)** | Kitchen T3 = Kitchen ✅ |
| memories | **Backyard (T1),** Livingroom (T2–T3) | Backyard T1 = Backyard ✅ |
| movies | Livingroom | ✅ |
| qualityTime | Vacation: Livingroom (T1,T3), **Backyard (T2)** | ✅ |
| schoolLife | Kitchen (T1), Livingroom (T2,T3) | Lokasyona göre tier kullanılıyor ✅ |
| sleep | Kitchen (T2), BrotherRoom (T3) | ✅ |
| outsideFriends | Kitchen (T3) | ✅ |
| summerPlans | Kitchen (T1), Livingroom (T2,T3) | ✅ |
| gaming, hobbies, attraction, boundaries, fantasies, confession | Bedroom/BrotherRoom | ✅ |

Brother’da lokasyon–topic eşleşmesi doğru; topic’ler tier’a göre farklı lokasyonlarda kullanılıyor ve DB’deki içerik lokasyonu passage ile uyumlu.

---

## ÖZET – Yapılan düzeltmeler

1. **Mother – TAMAMLANDI (2. kontrol)**  
   - DB: `homelifeKitchen`, `daughterKitchen`, `daughterParentsroom`, `touchKitchen`, `touchParentsroom` eklendi.  
   - `homelife`, `daughter`, `touch` sadece Livingroom içeriği bırakıldı.  
   - motherTalkKitchen: `homelifeKitchen`, `daughterKitchen`, `memoriesKitchen`, `touchKitchen`, `cooking` (sadece Kitchen).  
   - motherTalkParentsRoom: `daughterParentsroom`, `booksParentsroom`, `touchParentsroom` (+ marriage, appearance, secrets, desires, confession).

2. **Father**  
   - PreWork Kitchen T2 health: DB’de health tier2 zaten sadece Kitchen (topicHealthKitchenTier2). Değişiklik yok.  
   - PostWork Kitchen T2 health: PostWork health topic’i Livingroom img kullanıyor; ileride `healthKitchen` postWork eklenebilir.

3. **Brother**  
   - Lokasyon–topic eşleşmesi doğru; değişiklik yok.

4. **Father Garage / PostWork**  
   - PostWork’te birçok topic Livingroom img kullanıyor; Garage’da sadece Garage istiyorsan ileride lokasyon bazlı key’ler eklenebilir.

Bu liste 2 kez kontrol edilerek güncellenmiş ve Mother talk’lar lokasyona göre düzeltilmiştir.
