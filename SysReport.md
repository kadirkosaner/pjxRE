# OYUN SİSTEMİ TAM RAPORU

## 1. STAT YAPISI

### A) PLAYER (OYUNCU) STATLARI

#### Günlük/Temel Statlar
| Stat | Başlangıç | Min-Max | Açıklama |
|------|-----------|---------|----------|
| `$energy` | 100 | 0-150 | Enerji (max fitness'a göre değişir) |
| `$energyMax` | 100 | 80-150 | `80 + (fitness × 0.2)` |
| `$mood` | 100 | 0-100 | Ruh hali |
| `$health` | 100 | 0-100 | Sağlık |
| `$stress` | 0 | 0-100 | Stres (düşük = iyi) |
| `$arousal` | 0 | 0-100 | Uyarılma |
| `$hygiene` | 100 | 0-100 | Hijyen |

#### İhtiyaç Statları (Opsiyonel - Settings'ten açılır)
| Stat | Başlangıç | Min-Max | Açıklama |
|------|-----------|---------|----------|
| `$hunger` | 0 | 0-100 | Açlık (yüksek = kötü) |
| `$thirst` | 0 | 0-100 | Susuzluk (yüksek = kötü) |
| `$bladder` | 0 | 0-100 | Mesane (yüksek = kötü) |

#### Mental Statlar
| Stat | Başlangıç | Min-Max |
|------|-----------|---------|
| `$intelligence` | 0 | 0-100 |
| `$focus` | 0 | 0-100 |
| `$creativity` | 0 | 0-100 |
| `$willpower` | 0 | 0-100 |

#### Sosyal Statlar
| Stat | Başlangıç | Min-Max | Hesaplama |
|------|-----------|---------|-----------|
| `$charisma` | 0 | 0-100 | Doğrudan |
| `$confidence` | 0 | 0-100 | `(charisma × 0.5) + (looks × 0.3)` |

#### Fiziksel/Fitness Statları
| Stat | Başlangıç | Min-Max |
|------|-----------|---------|
| `$upperBody` | 0 | 0-100 |
| `$core` | 0 | 0-100 |
| `$lowerBody` | 0 | 0-100 |
| `$cardio` | 0 | 0-100 |
| `$fitness` | 0 | 0-100 | `(upper + core + lower + cardio) / 4` |

#### Görünüm Statları
| Stat | Başlangıç | Min-Max | Hesaplama |
|------|-----------|---------|-----------|
| `$beauty` | 0 | 0-100 | Doğrudan |
| `$clothingScore` | 0 | 0-100 | Kıyafet sisteminden |
| `$looks` | 0 | 0-100 | `beauty×0.3 + bodyAppeal×0.3 + hygiene×0.2 + clothing×0.2` |

#### Özel Statlar
| Stat | Başlangıç | Min-Max | Açıklama |
|------|-----------|---------|----------|
| `$corruption` | 0 | 0-100 | Yozlaşma |
| `$painTolerance` | 0 | 0-100 | Ağrı toleransı |
| `$exhibitionism` | 0 | 0-100 | Teşhircilik |
| `$obedience` | 0 | -100 to 100 | Dominant ↔ Submissive |

#### Sexual Statlar
| Stat | Açıklama |
|------|----------|
| `$sexual.sensitivity` | 0-100 |
| `$sexual.experience` | Kümülatif |
| `$sexual.virginity.*` | vaginal, anal, oral tracking |
| `$sexual.stretch.*` | vaginal, anal |
| `$sexual.skills.*` | oral, deepthroat, handjob, riding, anal, foreplay, seduction, teasing |

---

### B) KARAKTER İLİŞKİ STATLARI

Her karakter için 4 stat (0-100 arası):

| Karakter | Friendship | Trust | Love | Lust |
|----------|------------|-------|------|------|
| Mother (Sarah) | 50 | 50 | 30 | 0 |
| Father (Robert) | 50 | 40 | 25 | 0 |
| Brother (Jake) | 45 | 50 | 20 | 0 |

**Tier Sistemi:**
| Tier | Friendship Aralığı | Açıklama |
|------|---------------------|----------|
| Tier 1 | 0-39 | Mesafeli, kısa cevaplar |
| Tier 2 | 40-69 | Yakın, samimi |
| Tier 3 | 70-100 | Çok yakın, duygusal/romantik |

---

### C) SKILL KATEGORİLERİ

```
$skills = {
    mental: { research, problemSolving, analysis },
    social: { conversation, persuasion, networking },
    physical: { dance, yoga, basketball, volleyball, football, swimming },
    creative: { art, music, writing },
    technical: { programming, hacking, electronics, gaming },
    practical: { cooking, cleaning, driving, finance, mechanics, gardening }
}
```

---

## 2. ZAMAN SİSTEMİ VE STAT DEĞİŞİMLERİ

### Zaman Dilimleri
| Period | Saat Aralığı |
|--------|--------------|
| Morning | 06:00 - 12:00 |
| Afternoon | 12:00 - 18:00 |
| Evening | 18:00 - 22:00 |
| Night | 22:00 - 06:00 |

### Saat Başı Kayıplar (advanceTime widget'ı ile)
Her saat geçtiğinde otomatik olarak uygulanır:

| Stat | Değişim/saat | Açıklama |
|------|--------------|----------|
| Hunger | +5 | Açlık artar |
| Thirst | +10 | Susuzluk artar |
| Bladder | +8 | Mesane dolar |
| Hygiene | -5 | Hijyen düşer |
| Energy | -5 | Enerji düşer |

### Kritik Seviye Cezaları

#### Açlık Cezaları (Hunger)
| Seviye | Energy | Mood | Health |
|--------|--------|------|--------|
| ≥90 | -20 | -15 | -10 |
| ≥60 | -10 | -5 | - |

#### Susuzluk Cezaları (Thirst)
| Seviye | Energy | Focus | Health |
|--------|--------|-------|--------|
| ≥90 | -15 | -20 | -5 |
| ≥60 | -5 | -10 | - |

#### Mesane Cezaları (Bladder)
| Seviye | Stress | Mood |
|--------|--------|------|
| ≥100 | +10 | -10 |
| ≥80 | +5 | - |

#### Hijyen Cezaları (Hygiene)
| Seviye | Mood | Charisma |
|--------|------|----------|
| ≤10 | -10 | -10 |
| ≤30 | - | -5 |

### Topbar Bildirim Eşikleri
| Stat | Uyarı Koşulu |
|------|--------------|
| Energy | ≤ %30 of energyMax |
| Health | ≤ 30 |
| Mood | ≤ 30 |
| Arousal | ≥ 70 |
| Bladder | ≥ 70 |
| Thirst | ≥ 70 |
| Hunger | ≥ 70 |

---

## 3. AKTİVİTE STAT KAZANIMLARI

### A) BEDROOM (Yatak Odası)

#### Sleep (Uyku)
| Parametre | Değer |
|-----------|-------|
| **Süre** | 8 saat (veya alarm'a kadar) |
| **Koşul** | Energy ≤ 30 olmalı |
| **Energy Kazanımı** | +100 × (süre/480) |
| **Stress Kaybı** | -50 × (süre/480) |

> Örnek: 6 saat uyursan → +75 Energy, -37.5 Stress

#### Nap (Şekerleme)
| Parametre | Değer |
|-----------|-------|
| **Süre** | Değişken |
| **Stress** | -10 |
| **Energy** | +15 |

---

### B) LIVINGROOM (Oturma Odası)

#### Watch TV
| Parametre | Değer |
|-----------|-------|
| **Süre** | Değişken (seçilen) |
| **Stress** | -20 |
| **Energy** | -5 |

**Companion Bonusları:**
| Kimle | Friendship Kazanımı |
|-------|---------------------|
| Alone | - |
| Mom | +2 mother |
| Dad | Topic DB'den (sports konusu) |
| Brother | +2 brother |
| Mom+Dad | +1 each |
| Family | +1 each |

#### Dance (Dans)
| Parametre | Değer |
|-----------|-------|
| **Süre** | 30 dk |
| **Energy** | -20 |
| **Stress** | -15 |
| **Skill** | Dance +5 |
| **Günlük Limit** | 1 kez |

**Skill→Stat Dönüşümü (×0.25):**
| Stat | Kazanım |
|------|---------|
| Cardio | +1.25 |
| Core | +1.25 |
| LowerBody | +0.5 |

#### Yoga (Solo - Evde)
| Parametre | Değer |
|-----------|-------|
| **Süre** | 30 dk |
| **Energy** | -15 |
| **Stress** | -10 |
| **Skill** | Yoga +5 |
| **Günlük Limit** | 1 kez |

**Skill→Stat Dönüşümü (×0.25):**
| Stat | Kazanım |
|------|---------|
| Core | +1.25 |
| LowerBody | +1.25 |

#### Yoga with Mom
| Parametre | Değer |
|-----------|-------|
| **Koşul** | Mother friendship ≥35 |
| **Süre** | 30 dk |
| **Energy** | -15 |
| **Stress** | -15 |
| **Skill** | Yoga +5 |
| **Mother Friendship** | +2 |

---

### C) KITCHEN (Mutfak)

#### Eat Food
| Parametre | Değer |
|-----------|-------|
| **Süre** | 20 dk |
| **Hunger** | -50 |
| **Thirst** | -100 |
| **Energy** | +5 |
| **Stress** | -5 |

#### Drink Water
| Parametre | Değer |
|-----------|-------|
| **Süre** | 5 dk |
| **Thirst** | -100 |

#### Eat with Family (Aile ile Yemek)
| Parametre | Değer |
|-----------|-------|
| **Koşul** | Yemek saati (7-8, 12-13, 18-19) + en az 1 aile üyesi mutfakta |
| **Süre** | 30 dk |
| **Hunger** | -50 |
| **Thirst** | -80 |
| **Energy** | +10 |
| **Stress** | -10 |
| **İlişki** | Oradaki her karakter: friendship +2, love +1 |
| **Günlük** | Öğün başı 1 kez ($familyMeals.breakfast/lunch/dinner) |

---

### D) BATHROOM (Banyo)

#### Shower/Bath
| Parametre | Değer |
|-----------|-------|
| **Süre** | 20 dk |
| **Hygiene** | +100 |
| **Energy** | +5 |
| **Stress** | -10 |

#### Use Toilet
| Parametre | Değer |
|-----------|-------|
| **Süre** | 5 dk |
| **Bladder** | -100 |

#### Wash Face
| Parametre | Değer |
|-----------|-------|
| **Süre** | 5 dk |
| **Hygiene** | +10 |

---

### E) PARK (Sunset Park)

#### Park Yoga
| Parametre | Değer |
|-----------|-------|
| **Süre** | 45 dk |
| **Energy** | -15 |
| **Stress** | -20 |
| **Skill** | Yoga +7 |
| **Günlük Limit** | 1 kez |

**Skill→Stat Dönüşümü (×0.25):**
| Stat | Kazanım |
|------|---------|
| Core | +1.75 |
| LowerBody | +1.75 |

> Park yoga evdekinden %40 daha etkili! (+7 vs +5)

#### Park Jogging
| Parametre | Değer |
|-----------|-------|
| **Süre** | 45 dk |
| **Energy** | -20 |
| **Stress** | -15 |
| **Cardio** | +6 (doğrudan stat) |
| **LowerBody** | +4 (doğrudan stat) |
| **Calorie** | -300 |
| **Günlük Limit** | 1 kez |

#### Park Bench
| Parametre | Değer |
|-----------|-------|
| **Süre** | Değişken |
| **Stress** | -5 |

---

## 4. INTERACTION (ETKİLEŞİM) STAT KAZANIMLARI

### Genel Talk Yapısı
Tüm talk etkileşimleri:
- **Süre:** 15 dk
- **Energy:** -5
- **Günlük Limit:** 1 kez (lokasyon başına)

---

### A) MOTHER INTERACTIONS

**Not:** Şu an sadece **Talk** aksiyonu aktif. Diğer aksiyonlar (Help Cook, Coffee, Flirt, Hug, Yoga Together, Garden) kaldırıldı.

#### Lokasyonlar ve Aksiyonlar
| Lokasyon | Aksiyonlar |
|----------|------------|
| Kitchen | Talk |
| Living Room | Talk |
| Backyard | Talk |
| **Parents Room** | Talk (sadece baba orada değilken: fatherNotPresent) |

#### Aksiyon Koşulları
| Aksiyon | Koşul | Günlük Limit |
|---------|-------|----------------|
| Talk | - | 1 kez / lokasyon |

#### Topic Database (CommonTopics.twee – phase yok)
| Konu | Lokasyonlar | Tier1 F/T/L | Tier2 F/T/L | Tier3 F/T/L |
|------|-------------|-------------|-------------|-------------|
| cooking | Kitchen | 1-2/1/0 | 3/2/1 | 4/3/2-3 |
| homelife | Kitchen, Living | 1-2/1/0 | 3/2/1 | 4/3/2-3 |
| family | Living | 2/1/0 | 3/2-3/1-2 | 4/4/3 |
| daughter | Kitchen, Living, Parents Room | 1-2/1/0 | 3/2/2 | 4/3/3-4 |
| health | Living, Backyard | 1-2/1/0 | 3/2/1-2 | 4/3/2-3 |
| books | Living, Backyard, Parents Room | 1-2/1/0 | 3/2/1 | 4/3/2-3 |
| marriage | Living (T2-3), Parents Room (T2-3) | - | 3/3/1 | 4/4/2 |
| garden | Backyard | 1-2/1/0 | 3/2/1-2 | 4/3/3-4 |
| memories | Kitchen, Living, Backyard | 2/1/0 | 3/2/1-2 | 4/3/3-4 |
| appearance | Living, Parents Room (T2-3) | - | 3/2-3/1 | 4/3/2-4 |
| touch | Kitchen, Living, Parents Room (T2-3) | - | 3/2/2 | 4/3/3-4 |
| secrets | Living, Parents Room (T3) | - | - | 4/4/3-4 |
| desires | Parents Room (T3) | - | - | 4/4/4-5 |
| confession | Living, Parents Room (T3) | - | - | 4/4/4-5 |

**Ortalama Tier Kazancı (yaklaşık):**
| Tier | Friendship | Trust | Love |
|------|------------|-------|------|
| Tier 1 | 1-2 | 1 | 0 |
| Tier 2 | 3 | 2 | 1-2 |
| Tier 3 | 4 | 3 | 2-4 |

---

### B) FATHER INTERACTIONS

**Not:** Şu an sadece **Talk** aksiyonu aktif. Coffee, Hug, Help with Car, Say Goodnight kaldırıldı.

#### Lokasyonlar ve Aksiyonlar
| Lokasyon | Aksiyonlar |
|----------|------------|
| Kitchen | Talk |
| Living Room | Talk |
| Backyard | Talk |
| Garage | Talk |

#### Aksiyon Koşulları
| Aksiyon | Koşul | Günlük Limit |
|---------|-------|----------------|
| Talk | - | 1 kez / lokasyon |

#### Phase Sistemi
| Phase | Koşul | Açıklama |
|-------|-------|----------|
| preWork | Tarih < fatherWorkStart | İşe başlamadan önce, evde |
| postWork | Tarih ≥ fatherWorkStart | İşe başladıktan sonra |

#### Common Topics (Her iki phase'de geçerli)
| Konu | Lokasyon | Tier1 F/T/L | Tier2 F/T/L | Tier3 F/T/L |
|------|----------|-------------|-------------|-------------|
| advice | Backyard(T1), Living(T2-3) | 1-2/1-2/0 | 3/2-3/0-1 | 4-5/3-5/2-3 |
| car | Garage | 1-2/0-1/0 | 3/2-3/0-1 | 4-5/3-4/2-3 |
| future | Living | 1-2/1/0 | 3/2/0-1 | 4-5/4/2-3 |
| hobbies | Garage(T1), Living(T2-3) | 1-2/0/0 | 3/2-3/0-1 | 4-5/3-4/2-3 |
| marriage | Kitchen(T1), Living(T2-3) | 1-2/0-1/0 | 3/2/0-1 | 4-5/3-4/2-3 |
| memories | Living | 1-2/0/0 | 3/2-3/1-2 | 5/4/3 |
| sports | Living | 1/0/0 | 3/2/0-1 | 4-5/3-4/2-3 |

> Not: Her topic'te 3-5 farklı diyalog varyasyonu var (random seçilir)

---

### C) BROTHER INTERACTIONS

**Not:** Şu an sadece **Talk** aksiyonu aktif. Play Video Games, Late Night Chat, Midnight Snack kaldırıldı.

#### Lokasyonlar ve Aksiyonlar
| Lokasyon | Aksiyonlar |
|----------|------------|
| His Bedroom (fhBrotherRoom / Guest Room) | Talk |
| Kitchen | Talk |
| Living Room | Talk |
| Backyard | Talk |

#### Aksiyon Koşulları
| Aksiyon | Koşul | Günlük Limit |
|---------|-------|----------------|
| Talk | - | 1 kez / lokasyon |

#### Phase Sistemi
| Phase | Koşul | Açıklama |
|-------|-------|----------|
| school | Okul döneminde | Stresli, meşgul |
| vacation | Tatil döneminde | Rahat, sürekli evde |

#### School Phase Topics
| Konu | Tier1 F/T/L | Tier2 F/T/L | Tier3 F/T/L |
|------|-------------|-------------|-------------|
| gaming | 1/1/0 | 3/2/0 | 4/3/3 |
| school_life | 1/0/0 | 3/2/1 | 5/4/3 |
| sleep | 1/0/0 | 3/2/0 | 4/3/4 |
| hobbies | 2/0/0 | 3/2/0 | 4/4/3 |
| sibling | 1/0/0 | 3/2/1 | 5/4/4 |
| future | 1/1/0 | 3/3/0 | 5/4/4 |
| movies_shows | 1/0/0 | 3/2/0 | 4/3/3 |
| outside_friends | 1/0/0 | 3/2/0 | 4/3/3 |
| being_home | 2/0/0 | 3/3/1 | 5/4/4 |
| dating | 1/0/0 | 4/3/2 | 5/5/5(6) |

**Ortalama Tier Kazancı (School):**
| Tier | Friendship | Trust | Love |
|------|------------|-------|------|
| Tier 1 | 1.2 | 0.2 | 0 |
| Tier 2 | 3.1 | 2.3 | 0.4 |
| Tier 3 | 4.5 | 3.7 | 3.6 |

#### Vacation Phase Topics
Benzer konular ama farklı diyaloglar ve biraz farklı değerler.

---

## 5. SKILL→STAT DÖNÜŞÜM SİSTEMİ

### Physical Skills → Fitness Stats
Her physical skill kazanımı, ilgili fitness stat'larına %25 bonus verir:

| Skill | Cardio | Core | LowerBody | UpperBody |
|-------|--------|------|-----------|-----------|
| Dance | ×0.25 | ×0.25 | ×0.10 | - |
| Yoga | - | ×0.25 | ×0.25 | - |
| Basketball | ×0.25 | - | ×0.25 | ×0.10 |
| Volleyball | ×0.25 | ×0.10 | - | ×0.25 |
| Football | ×0.25 | - | ×0.25 | ×0.10 |
| Swimming | ×0.25 | ×0.125 | ×0.125 | ×0.125 |

> Örnek: Dance +5 skill → Cardio +1.25, Core +1.25, LowerBody +0.5

### Category → Mental/Social Stats
Her skill kategorisi ilgili ana stat'a %10 bonus verir:

| Skill Category | Bonus Stat | Multiplier |
|----------------|------------|------------|
| Mental | Intelligence | ×0.10 |
| Social | Charisma | ×0.10 |
| Creative | Creativity | ×0.10 |
| Technical | Focus | ×0.10 |
| Practical | Willpower | ×0.10 |

> Örnek: Cooking +10 skill (practical) → Willpower +1

---

## 6. KARAKTER SCHEDULE (Program) SİSTEMİ

### Mother Schedule
#### Weekday
| Saat | Lokasyon | Status |
|------|----------|--------|
| 00:00 | Parents Room | sleeping |
| 06:20 | Parents Bath | showering |
| 06:50 | Parents Room | available |
| 07:00 | Kitchen | available (Breakfast) |
| 07:30 | Living Room | available |
| 12:30 | Kitchen | available (Lunch) |
| 18:30 | Kitchen | available (Dinner) |
| 19:30 | Living Room | available |
| 23:00 | Parents Room | available |

### Father Schedule (PreWork)
#### Weekday
| Saat | Lokasyon | Status |
|------|----------|--------|
| 00:00 | Parents Room | sleeping |
| 06:00 | Parents Bath | showering |
| 06:20 | Parents Room | available |
| 07:00 | Kitchen | available (Breakfast) |
| 10:00 | Garage | available |
| 12:30 | Kitchen | available (Lunch) |
| 13:00 | Backyard | available |
| 14:00 | Garage | available |
| 17:00 | Living Room | available |
| 18:30 | Kitchen | available (Dinner) |
| 19:30 | Living Room | available |
| 23:00 | Parents Room | available |

### Father Schedule (PostWork)
#### Weekday
| Saat | Lokasyon | Status |
|------|----------|--------|
| 08:00 | work | busy |
| 18:30 | Kitchen | available (Dinner) |
| 19:30 | Garage | available |
| 20:00 | Living Room | available |

### Brother Schedule (School)
#### Weekday
| Saat | Lokasyon | Status |
|------|----------|--------|
| 00:00 | Guest Room | sleeping |
| 06:50 | Upper Bath | showering |
| 07:00 | Kitchen | available (Breakfast) |
| 08:00 | school | busy |
| 15:00 | Guest Room | available |
| 17:00 | Living Room | available |
| 18:30 | Kitchen | available (Dinner) |
| 19:30 | Guest Room | available |
| 23:00 | Guest Room | sleeping |

### Brother Schedule (Vacation)
Daha geç yatar, gece oyun oynar (00:00-02:00 available)

---

## 7. MULTIPLIER (ÇARPAN) SİSTEMİ

### Stat Multipliers
Prologue trait'lerinden gelen çarpanlar:

```javascript
$statMultipliers = {
    intelligence: 1.0,
    focus: 1.0,
    creativity: 1.0,
    willpower: 1.0,
    charisma: 1.0,
    fitness: 1.0,      // Tüm body part stat'larına uygulanır
    upperBody: 1.0,
    core: 1.0,
    lowerBody: 1.0,
    cardio: 1.0,
    beauty: 1.0,
    corruption: 1.0,
    obedience: 1.0,
    sensitivity: 1.0,  // Sexual skill'lere uygulanır
    painTolerance: 1.0,
    exhibitionism: 1.0
}
```

### Skill Category Multipliers
```javascript
$skillMultipliers = {
    mental: 1.0,
    social: 1.0,
    physical: 1.0,
    creative: 1.0,
    technical: 1.0,
    practical: 1.0
}
```

---

## 8. DENGE ANALİZİ

### A) Günlük Enerji Dengesi

#### Tipik Gün Senaryosu (16 saat uyanık):
| Kaynak | Değer |
|--------|-------|
| Başlangıç (uyku sonrası) | +100 |
| 16 saat geçişi | -80 (16×5) |
| Aktiviteler (ortalama) | -30 ila -60 |
| Yemek (3 öğün) | +15 (3×5) |
| **Net Değişim** | ~-60 ila -90 |
| **Gün Sonu Enerji** | ~10-40 |

> ✅ Dengeli: Günün sonunda enerji 10-40 civarı kalır, uyku için uygun (≤30 gerekli).

### B) Stress Yönetimi

| Aktivite | Stress Değişimi |
|----------|-----------------|
| Sleep (8h) | -50 |
| TV | -20 |
| Park Yoga | -20 |
| Dance | -15 |
| Jogging | -15 |
| Shower | -10 |
| Yoga (Home) | -10 |
| Nap | -10 |
| Eat | -5 |
| Bladder full | +10 |
| Park Bench | -5 |

> ✅ Dengeli: Günde 1-2 aktivite stress'i 0'da tutar.

### C) İhtiyaç Yönetimi (16 saat uyanık)

| İhtiyaç | Artış/Gün | Çözüm | Yeterli mi? |
|---------|-----------|-------|-------------|
| Hunger | +80 (16×5) | Eat: -50 | 2 öğün yeterli |
| Thirst | +160 (16×10) | Drink: -100, Eat: -100 | 2-3 içecek yeterli |
| Bladder | +128 (16×8) | Toilet: -100 | 2 kez yeterli |
| Hygiene | -80 (16×5) | Shower: +100 | 1 kez yeterli |

### D) Karakter İlişki Hızı

#### Tier Geçiş Süresi (Sadece Talk ile):
| Karakter | Başlangıç | Tier1→Tier2 (40) | Tier2→Tier3 (70) |
|----------|-----------|------------------|------------------|
| Mother | F:50 | Zaten Tier2 | ~10 gün |
| Father | F:50 | Zaten Tier2 | ~10 gün |
| Brother | F:45 | Zaten Tier2 | ~8 gün |

> Hesaplama: Günde 1 talk × ortalama +3 friendship (Tier2'de)

#### Hızlandırıcılar:
- Watch TV together: +1-2 friendship ekstra
- Özel aktiviteler (Coffee, Yoga, Help Cook, etc.): Topic DB'den ekstra kazanç

### E) Fitness Gelişimi

#### Örnek: Cardio 0→50
| Aktivite | Günlük Kazanç | Tahmini Süre |
|----------|---------------|--------------|
| Jogging | +6 | ~8 gün |
| Dance | +1.25 | ~40 gün |
| Swimming | +1.25 | ~40 gün |

> ⚠️ Park aktiviteleri (yoga +7, jog +6) evdekilerden (+5) daha verimli!

---

## 9. GÜNLÜK LİMİTLER VE RESET

### Günlük Limitli Aktiviteler
```javascript
$daily = {
    yogaDone: false,   // Günde 1 kez
    danceDone: false,  // Günde 1 kez
    jogDone: false     // Günde 1 kez
}
```

### Karakter Etkileşim Limitleri
- Her lokasyonda her karakter ile günde 1 kez talk
- Özel aksiyonlar (Coffee, Hug, etc.) günde 1 kez

### Günlük Reset (advanceDay)
- Tüm `$daily` flagleri false olur
- `$dailyCalorieIntake` sıfırlanır
- `$dailyExercise` sıfırlanır
- Family meal flagleri resetlenir
- Skill decay uygulanır (eğer açıksa)

---

## 10. EKSİKLER VE GELİŞTİRME ALANLARI

### Mevcut Eksiklikler:

1. **Lokasyon Çeşitliliği:**
   - Downtown, Mall, University etc. için action yok
   - Sadece Family House ve Sunset Park aktif

2. **NPC Çeşitliliği:**
   - Sadece 4 karakter tanımlı (Family + Marcus)
   - Diğer bölgelerde etkileşim yok

3. **Skill Kullanımı:**
   - Technical, Practical, Creative skill'ler aktif kullanılmıyor
   - Sadece Dance, Yoga, Gaming mekanikleri var

4. **Para Sistemi:**
   - Tanımlı ama kullanılmıyor ($cashBalance, $bankBalance)
   - Alışveriş mekaniği eksik

5. **Quest Sistemi:**
   - Temel yapı var ama içerik az

### Potansiyel Denge İyileştirmeleri:

1. **Energy Management:**
   - TV (-5) çok ucuz, Dance (-20) çok pahalı
   - Arada aktiviteler gerekebilir

2. **Skill Progression:**
   - Home vs Park farkı çok büyük (+5 vs +7 = %40)
   - Bazı skill'ler hiç kazanılmıyor

3. **Relationship Speed:**
   - Brother en hızlı (love değerleri yüksek)
   - Father en yavaş (trust değerleri düşük)

---

## 11. DOSYA REFERANSLARI

### System Dosyaları
| Sistem | Dosya Yolu |
|--------|------------|
| Player Stats | `passages/0 - System/Init/characters/charPlayer.twee` |
| Mother | `passages/0 - System/Init/characters/charMother.twee` |
| Father | `passages/0 - System/Init/characters/charFather.twee` |
| Brother | `passages/0 - System/Init/characters/charBrother.twee` |
| Stat Calculator | `passages/0 - System/Widgets/StatCalculator.twee` |
| Needs System | `passages/0 - System/Widgets/NeedsSystem.twee` |
| Time System | `passages/0 - System/Widgets/TimeWidgets.twee` |

### Interaction Dosyaları
| Karakter | Dosya Yolu |
|----------|------------|
| Brother Common Topics | `passages/3- Interactions/FamilyHouse/Brother/talkDatabase/CommonTopics.twee` |
| Brother School Topics | `passages/3- Interactions/FamilyHouse/Brother/talkDatabase/SchoolTopics.twee` |
| Brother Vacation Topics | `passages/3- Interactions/FamilyHouse/Brother/talkDatabase/VacationTopics.twee` |
| Father Common Topics | `passages/3- Interactions/FamilyHouse/Father/talkDatabase/CommonTopics.twee` |
| Father PreWork Topics | `passages/3- Interactions/FamilyHouse/Father/talkDatabase/PreWorkTopics.twee` |
| Father PostWork Topics | `passages/3- Interactions/FamilyHouse/Father/talkDatabase/PostWorkTopics.twee` |
| Mother Topics | `passages/3- Interactions/FamilyHouse/Mother/talkDatabase/CommonTopics.twee` |

### Action Dosyaları
| Aktivite | Dosya Yolu |
|----------|------------|
| Sleep | `passages/4 - Actions/maplewood/familyHouse/Bedroom/sleep.twee` |
| Dance | `passages/4 - Actions/maplewood/familyHouse/Livingroom/runDance.twee` |
| Watch TV | `passages/4 - Actions/maplewood/familyHouse/Livingroom/watchTV.twee` |
| Yoga (Home) | `passages/4 - Actions/maplewood/familyHouse/Livingroom/runYogaSolo.twee` |
| Eat Food | `passages/4 - Actions/maplewood/familyHouse/Kitchen/eatFood.twee` |
| Shower | `passages/4 - Actions/maplewood/familyHouse/Bathroom/useBath.twee` |
| Park Yoga | `passages/4 - Actions/maplewood/sunsetPark/parkYoga.twee` |
| Park Jog | `passages/4 - Actions/maplewood/sunsetPark/parkJog.twee` |

---

## 12. RAPOR İNCELEME NOTU (Güncelleme)

Bu bölüm raporun kodla karşılaştırılıp güncellendiği değişiklikleri özetler.

### Yapılan Düzeltmeler
| Bölüm | Eski | Yeni / Not |
|-------|------|-------------|
| Park Bench | Stress -10 | **-5** (kod: `parkBench.twee` loseStat stress 5) |
| Yoga with Mom | Stress -10 | **-15** (kod: `runYogaMom.twee`) |
| Kitchen | Eat Food, Drink Water | **Eat with Family** eklendi (süre 30 dk, hunger/thirst/energy/stress + oradaki her karakter friendship +2, love +1) |
| Mother Interactions | Talk + Help Cook, Coffee, Flirt, Hug, Yoga, Garden | **Sadece Talk** (diğerleri kaldırıldı). **Parents Room** eklendi (Talk, fatherNotPresent) |
| Mother Topic DB | 10 konu (daily_routine, memories, …) | **CommonTopics.twee** – 14 konu: cooking, homelife, family, daughter, health, books, marriage, garden, memories, appearance, touch, secrets, desires, confession. (Compliments kaldırıldı; flirt ile yapılacak.) Phase yok. |
| Father Interactions | Talk + Coffee, Hug, Car, Say Goodnight | **Sadece Talk** (Coffee, Hug, Help with Car, Say Goodnight kaldırıldı). Parents Room aksiyonu yok. |
| Brother Interactions | Talk + Play Games, Late Chat, Midnight Snack | **Sadece Talk** (diğerleri kaldırıldı) |
| Dosya referansları | BrotherTalkTopicsDatabase, MotherTalkTopicsDatabase | **Brother:** talkDatabase/CommonTopics, SchoolTopics, VacationTopics. **Mother:** talkDatabase/CommonTopics.twee |
| Stress tablosu | - | **Park Bench -5** eklendi |

### Raporla Uyumlu Kalan Başlıca Noktalar
- Player/Karakter stat yapısı, zaman dilimleri, saat başı kayıplar, kritik seviye cezaları, topbar eşikleri.
- Watch TV (süre, stress -20, energy -5, companion bonusları).
- Sleep, Nap, Dance, Yoga (Solo/Mom), Eat Food, Drink Water, Bathroom, Park aktiviteleri değerleri (Park Bench dışında).
- Father phase (preWork/postWork), Brother phase (school/vacation), topic listeleri (Father/Brother eski topic isimleri referans olarak kalabilir).
- Skill→Stat dönüşümü, schedule tabloları, multiplier, denge analizi, günlük limitler, advanceDay reset.
- System/Init/Widgets dosya yolları.

### Ek Referans
- **Passage akışı ve stat detayı** için: `1Developer/ForNeph/passage_system_report.md`

---

*Bu rapor oyunun tüm stat sistemini, kazanımları, kayıpları ve dengeyi kapsamlı şekilde özetlemektedir.*
