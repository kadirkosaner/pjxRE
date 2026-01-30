# Passage & Stat Sistemi – Detaylı Rapor

Bu rapor: passage akışları, hangi passage’da ne yapıldığı, hangi stat’ların kazanıldığı/kaybedildiği ve dengenin nasıl kurulduğunu özetler.

---

## 1. GENEL YAPI

### 1.1 Passage Klasör Yapısı

| Klasör | İçerik |
|--------|--------|
| **0 - System** | Init, Widgets (Time, Stats, Activity), karakter tanımları |
| **1 - Prologue** | Başlangıç, prolog |
| **2 - Locations** | Lokasyon sayfaları (fhKitchen, fhLivingroom, fhCouch vb.) |
| **3- Interactions** | Karakter bazlı **Talk** passage’ları (Father, Mother, Brother) |
| **4 - Actions** | Lokasyon bazlı aksiyonlar (eatFood, watchTV, eatWithFamily vb.) |
| **5 - QuestSystem** | Quest passage’ları |

### 1.2 İki Ana Sistem

1. **Karakter Action Sistemi**  
   Lokasyonda karakter varsa → `showLocationChars` → “Talk” butonu → `*Talk*` passage (örn. `motherTalkKitchen`).  
   Günlük limit: **günde 1 kez** (dailyLimit: true, `logDailyActivity`).

2. **Lokasyon Action Sistemi**  
   Lokasyon sayfasındaki butonlar (Eat Food, Watch TV, Eat with Family vb.) → doğrudan ilgili passage.  
   Karakter schedule’ına göre “kim varsa” mantığı kullanılır; daily limit bazı aksiyonlarda quest/meal ile çakışabilir.

---

## 2. KARAKTER TALK SİSTEMİ

### 2.1 Akış

```
Lokasyon (fhKitchen, fhLivingroom vb.)
  → <<showLocationChars "fhKitchen">>
  → Karakter orada mı? (schedule + updateCharacterLocations)
  → setup.characterActions[charId][location] listesi
  → dailyLimit kontrolü (JS: dailyActivityLog)
  → "Talk" butonu görünür
  → Tıklanınca: motherTalkKitchen / fatherTalkLivingRoom / brotherTalkBedroom vb.
```

**Geri dönüş:** Tüm talk passage’ları sonunda `<<btn "Back" "CharacterInteraction" "secondary">>` ile `CharacterInteraction` passage’ına döner (oradan tekrar lokasyona).

### 2.2 Talk Passage’ları ve Gittikleri Yer

| Karakter | Lokasyon | Passage adı | Tetikleyen |
|----------|----------|-------------|------------|
| **Mother** | fhKitchen | motherTalkKitchen | characterActions.mother.fhKitchen → Talk |
| | fhLivingroom | motherTalkLivingRoom | characterActions.mother.fhLivingroom → Talk |
| | fhBackyard | motherTalkBackyard | characterActions.mother.fhBackyard → Talk |
| | fhParentsRoom | motherTalkParentsRoom | characterActions.mother.fhParentsRoom → Talk (fatherNotPresent) |
| **Father** | fhKitchen | fatherTalkKitchen | characterActions.father.fhKitchen → Talk |
| | fhLivingroom | fatherTalkLivingRoom | characterActions.father.fhLivingroom → Talk |
| | fhBackyard | fatherTalkBackyard | characterActions.father.fhBackyard → Talk |
| | fhGarage | fatherTalkGarage | characterActions.father.fhGarage → Talk |
| **Brother** | fhGuestRoom (Brother Room) | brotherTalkBedroom | characterActions.brother.fhBrotherRoom → Talk |
| | fhKitchen | brotherTalkKitchen | characterActions.brother.fhKitchen → Talk |
| | fhLivingroom | brotherTalkLivingRoom | characterActions.brother.fhLivingroom → Talk |
| | fhBackyard | brotherTalkBackyard | characterActions.brother.fhBackyard → Talk |

Father’da **fhParentsRoom** için tanımlı Talk yok; sadece Mother’da var (baba yokken).

---

## 3. TALK PASSAGE’LARINDA STAT KAZANIMI

Tüm karakter talk passage’larında ortak yapı:

- `<<advanceTime 15>>` → 15 dakika ilerler.
- `<<loseStat "energy" 5>>` → Oyuncu enerji -5.
- Topic’ten gelen değerler: `_topic.friendship`, `_topic.trust`, `_topic.love`.
- `<<gainStat "friendship" _topic.friendship "mother">>` (veya father/brother).
- `<<gainStat "trust" _topic.trust "mother">>` (varsa).
- `<<gainStat "love" _topic.love "mother">>` (varsa).
- `<<recalculateStats>>` çağrılır.

### 3.1 Topic Stat Aralıkları (Tier Bazlı)

**Mother (CommonTopics.twee):**

| Tier | Friendship | Trust | Love | Not |
|------|------------|-------|------|-----|
| Tier 1 | 1–2 | 1 | 0 | Düşük yakınlık |
| Tier 2 | 3 | 2 | 1–2 | Orta |
| Tier 3 | 4 | 3 | 2–4 | Yüksek, intimate topic’ler |

**Father / Brother:**  
Benzer mantık; Father’da preWork/postWork, Brother’da school/vacation phase’e göre farklı topic pool’ları var. Değerler genelde friendship 1–4, trust 1–3, love 0–4 bandında.

### 3.2 Ek Stat (Sadece Belirli Passage’larda)

| Passage | Ek stat |
|---------|---------|
| fatherTalkGarage | `<<gainStat "mood" 3>>` (garage bonding) |
| fatherTalkBackyard | `<<gainStat "mood" 5>>` (fresh air) |

Diğer talk passage’larında sadece energy -5 + topic stat’ları uygulanır.

### 3.3 Denge (Talk)

- **Enerji:** Her talk -5 energy. 15 dakika geçiyor; `advanceTime` içinde saat geçerse ek -5/hour energy (TimeWidgets).
- **İlişki:** Tier yükseldikçe topic başına friendship/trust/love artıyor; günde lokasyon başına 1 talk ile sınırlı.
- **Günlük limit:** Her (karakter, lokasyon) için “talk” günde 1 kez (dailyLimit + logDailyActivity).

---

## 4. LOKASYON BAZLI PASSAGE’LAR (KITCHEN, LIVING ROOM)

### 4.1 Kitchen

| Buton / Widget | Passage | Zaman | Player stat | Karakter stat |
|----------------|---------|--------|-------------|----------------|
| **Eat Food** | eatFood | +20 dk | hunger -50, thirst -100, energy +5, stress -5 | — |
| **Drink Water** | drinkWater | +5 dk | thirst -100 | — |
| **Eat with Family** (showFamilyMealBtn) | eatWithFamily | +30 dk | hunger -50, thirst -80, energy +10, stress -10 | Oradaki her karakter: friendship +2, love +1 (doğrudan `$characters[_member].stats`) |

**Eat with Family koşulları:**

- Yemek saati: Breakfast 7–8, Lunch 12–13, Dinner 18–19 (FamilyMealsWidgets’ta 1 saatlik pencere).
- En az bir aile üyesi mutfakta (`fhKitchen`).
- O öğün için henüz yemek yenmemiş (`$familyMeals.breakfast/lunch/dinner`).
- Aktif quest’te aynı öğün varsa quest passage’ına yönlendirilebilir.

### 4.2 Living Room – Couch & TV

**fhCouch** sayfasında `<<couchActions>>` (CouchWidgets):

- O anda salonda kim var? (_presentFamily: Mom, Dad, Brother)
- Buna göre tek buton:
  - Kimse yok: “Watch TV” → `$watchingWith = "alone"`.
  - 1 kişi: “Watch TV with Mom/Dad/Brother” → `$watchingWith = "mom"|"dad"|"brother"`.
  - 2+ kişi: “Watch TV with Family” → `$watchingWith = "family"`.

**watchTV** passage’ı:

- Süre: `$selectedDuration` (btnPicker ile seçilir; tvDuration preset’leri kullanılır).
- **Ortak:** `advanceTime($selectedDuration)`, stress -20, energy -5.
- **$watchingWith’e göre:**

| $watchingWith | İçerik | Karakter stat |
|---------------|--------|----------------|
| alone | Sabah/akşam 2’şer varyasyon metin + görsel | — |
| mom | 4 varyasyon | mother: friendship +2 |
| dad | Father **sports** topic (talkDatabase) | father: topic’ten friendship/trust/love |
| brother | 7 varyasyon | brother: friendship +2 |
| momdad | 4 varyasyon | mother +1, father +1 friendship |
| family | 5 varyasyon | mother, father, brother hepsi +1 friendship |

Dad ile TV = Father’ın sports topic’leri (preWork/postWork + tier) kullanılır; stat kazanımı topic’e göre.

---

## 5. DİĞER AKSİYON PASSAGE’LARI (ÖZET)

| Passage | Konum | Zaman | Stat değişimi |
|---------|--------|--------|----------------|
| **parkBench** | Sunset Park | +30 dk | stress -5 |
| **parkYoga** | Sunset Park | +45 dk | energy -15, stress -20 |
| **parkJog** | Sunset Park | +45 dk | energy -20, stress -15, cardio +6, lowerBody +4 |
| **runNap** (Livingroom) | fhCouch | $selectedDuration | stress -10, energy +15 |
| **runDance** | fhLivingroom | +30 dk | energy -20, stress -15 |
| **runYogaMom** | fhLivingroom | +30 dk | energy -15, stress -15, mother friendship +2 |
| **runYogaSolo** | fhLivingroom / fhBackyard | +30 dk | energy -15, stress -10 |
| **washFace** | Bathroom | +5 dk | hygiene +10, energy +2 |
| **useToilet** | Bathroom | +5 dk | bladder -100, hygiene -5 |
| **useBath** | Bathroom | +20 dk | hygiene +100, energy +5, stress -10 |
| **runNap** (Bedroom) | fhBedroom | $selectedDuration | stress/_energy formüle göre |
| **sleep** | fhBedroom | Uyku süresi | energy kazanımı, stress azalması |

Bu passage’lar karakter talk sisteminden bağımsız; lokasyon/aktivite bazlı.

---

## 6. ZAMAN VE ENERJİ DENGESİ

### 6.1 advanceTime (TimeWidgets)

- Her **geçen saat** için:
  - hunger +5, thirst +10, bladder +8, hygiene -5, energy -5.
- Saat 24’ü geçince gün ilerler (`advanceDay`), lokasyonlar güncellenir (`updateCharacterLocations`).
- Sonunda `recalculateStats` çağrılır.

### 6.2 recalculateStats (StatCalculator)

- Türetilmiş stat’lar güncellenir (fitness, looks, confidence, energyMax vb.).
- Tüm stat’lar clamp edilir (0–100 veya max değerler).
- Enerji/mood vb. için uyarı bayrakları set edilir.

### 6.3 Talk Dengesi

- Bir talk: 15 dk + 5 energy kaybı.
- Gün içinde saat geçtikçe zaten energy/hour düşüyor; talk ek -5 getiriyor.
- Kazanç: sadece ilişki (friendship/trust/love). Player stat’ı olarak sadece energy düşüyor.

---

## 7. GÜNLÜK LİMİT VE AKTİVİTE

- **logDailyActivity "mother" "talk":**  
  `$dailyActivityLog["mother_talk_"+$timeSysDay] = true`  
  Aynı gün aynı karakter için “talk” tekrar yapılamaz (JS tarafında dailyLimit ile buton gizlenir).
- **checkDailyActivity:** Aynı key ile daha önce yapıldı mı diye bakılır.
- Reset: Gün değişince (advanceDay) yeni gün için key değiştiği için tekrar 1 talk hakkı olur.  
  (resetFamilyMeals gibi ayrı bir “daily reset” widget’ı talk için yok; gün değişimi yeterli.)

---

## 8. ÖZET TABLO – NEREDE NE YAPILIYOR, HANGİ STAT

| Nerede | Passage / Aksiyon | Zaman | Energy | Stress | Hunger/Thirst | İlişki (karakter) |
|--------|-------------------|--------|--------|--------|------------------|-------------------|
| Karakter Talk (tümü) | mother/father/brotherTalk* | +15 dk | -5 | — | — | Topic’e göre F/T/L |
| Father Garage | fatherTalkGarage | +15 dk | -5 | — | — | Topic + mood +3 |
| Father Backyard | fatherTalkBackyard | +15 dk | -5 | — | — | Topic + mood +5 |
| Kitchen | eatFood | +20 dk | +5 | -5 | hunger -50, thirst -100 | — |
| Kitchen | drinkWater | +5 dk | — | — | thirst -100 | — |
| Kitchen | eatWithFamily | +30 dk | +10 | -10 | hunger -50, thirst -80 | Herkes +2 F, +1 L |
| Couch | watchTV (alone) | $duration | -5 | -20 | — | — |
| Couch | watchTV (mom/brother) | $duration | -5 | -20 | — | +2 F (ilgili karakter) |
| Couch | watchTV (dad) | $duration | -5 | -20 | — | Topic (sports) F/T/L |
| Couch | watchTV (family) | $duration | -5 | -20 | — | Hepsi +1 F |
| Park | parkYoga | +45 dk | -15 | -20 | — | — |
| Park | parkJog | +45 dk | -20 | -15 | — | — |
| Living room | runNap | $duration | +15 | -10 | — | — |
| Living room | runYogaMom | +30 dk | -15 | -15 | — | mother +2 F |

F = friendship, T = trust, L = love. “Topic” = ilgili karakterin talkDatabase’indeki topic’ten gelen değerler.

---

## 9. BAĞIMLILIKLAR

- **Talk passage’ları:**  
  `setup.motherTalkTopics`, `setup.fatherTalkTopics`, `setup.brotherTalkTopics` (talkDatabase .twee’lerden yüklenmiş olmalı).
- **watchTV (dad):**  
  `setup.fatherTalkTopics.common.sports` veya `postWork.sports` + tier.
- **Eat with Family:**  
  `$familyMeals`, `$location`, `$characters.*.currentLocation`, `updateCharacterLocations`.
- **showFamilyMealBtn:**  
  Meal time, `$familyMeals`, `$location`, quest mealType (opsiyonel).
- **Talk butonunun görünmesi:**  
  `setup.characterActions`, `updateCharacterLocations`, `dailyLimit` + `dailyActivityLog` (JS).

Bu rapor, passage’ların nerede ne yaptığını, hangi stat’ları verdiğini ve dengenin nasıl kurulduğunu tek dokümanda toplar. Güncelleme yaptıkça bu dosyayı güncelleyebilirsin.
