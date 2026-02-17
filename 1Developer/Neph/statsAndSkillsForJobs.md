# Stat & Skill Referansı – Job Sistemi İçin

> Job sistemi tasarlanırken hangi stat/skill'in nerede kullanılacağının tek referansı.
> Economy cheatsheet ile uyumlu, mevcut `charPlayer` + `StatCalculator` yapısına göre.

---

## 1. MEVCUT STAT YAPISI (Kısa Özet)

### 1.1 Günlük / Kaynak (0–100, yüksek = iyi; stress/arousal/hunger/thirst/bladder = yüksek kötü)

| Değişken    | Açıklama              | Job'da kullanımı                          |
|-------------|----------------------|-------------------------------------------|
| `$energy`   | Enerji               | Vardiya maliyeti (loseStat)               |
| `$energyMax`| Max enerji           | fitness'tan türetiliyor                   |
| `$mood`     | Ruh hali             | Vardiya maliyeti (loseStat)               |
| `$hygiene`  | Hijyen               | Vardiya maliyeti (loseStat)               |
| `$health`   | Sağlık               | Job doğrudan düşürmesin; needs kritikse düşer |
| `$stress`   | Stres (0=iyi)        | Vardiya maliyeti (gainStat = stress artar) |
| `$hunger`   | Açlık                | advanceTime ile saat başı +5 (vardiya süresince otomatik) |
| `$thirst`   | Susuzluk             | advanceTime ile saat başı +5              |
| `$bladder`  | Mesane               | advanceTime ile saat başı +8              |

**Not:** Vardiyada `<<advanceTime _hours*60>>` kullanılırsa hunger/thirst zaten artar (saat başı +5). Ekstra “işe özel hunger/thirst” gerekmez; cheatsheet’teki “4 saat = +20” bu zaman ilerlemesinden gelir.

---

### 1.2 Mental / Sosyal / Fiziksel (0–100, türetilenler var)

| Değişken        | Açıklama        | Türetim / not                              |
|-----------------|-----------------|--------------------------------------------|
| `$intelligence` | Zeka            | Mental skill kullanımında +%10 gain        |
| `$focus`        | Odak            | Technical skill kullanımında +%10 gain      |
| `$creativity`   | Yaratıcılık     | Creative skill kullanımında +%10 gain     |
| `$willpower`    | İrade           | Practical skill kullanımında +%10 gain     |
| `$charisma`     | Karizma         | Bahşiş formülü, sosyal iş gereksinimi     |
| `$confidence`   | Özgüven         | **Türetilen:** charisma×0.5 + looks×0.3    |
| `$upperBody`    | Üst vücut       | Fitness grubu                             |
| `$core`         | Gövde           | Fitness grubu                             |
| `$lowerBody`    | Alt vücut       | Fitness grubu                             |
| `$cardio`       | Kardiyo         | Fitness grubu                             |
| `$fitness`      | Genel fitness   | **Türetilen:** (upperBody+core+lowerBody+cardio)/4 |

---

### 1.3 Görünüm / Looks (0–100)

| Değişken         | Açıklama        | Türetim / not                                      |
|------------------|-----------------|----------------------------------------------------|
| `$beauty`        | Güzellik        | StatCalculator’da: fitness, body.appeal, face/hair/dental care, makeup |
| `$clothingScore` | Kıyafet puanı   | Wardrobe’dan hesaplanır                            |
| `$looks`         | **Genel looks** | **Türetilen:** beauty×0.5 + hygiene×0.1 + clothing×0.2 + makeup×0.2 |

**Job’da:** Bahşiş formülleri `$looks` ve (kuaför için) `$skills.practical.makeup` kullanır. Garson/barista için gereksinim (Vince’in “put together” dediği) `$looks` veya min beauty/clothing ile kontrol edilebilir.

---

## 2. MEVCUT SKILL YAPISI ($skills)

### 2.1 Kategoriler ve skill isimleri (kodda kullanılacak)

| Kategori   | Skill'ler |
|-----------|-----------|
| mental    | research, problemSolving, analysis |
| social    | **conversation**, **persuasion**, networking |
| physical  | dance, yoga, basketball, volleyball, football, swimming |
| creative  | art, music, **writing** |
| technical | programming, hacking, electronics, gaming |
| practical | **cooking**, **cleaning**, driving, **finance**, mechanics, gardening, **makeup** |

**Job ile doğrudan ilgili olanlar bold.**

### 2.2 Economy cheatsheet → oyun skill eşlemesi

Cheatsheet’te geçen “Social”, “Cooking”, “Cleaning” vb. aşağıdaki gibi tek bir convention’a bağlandı:

| Cheatsheet’teki ifade | Oyun karşılığı (skill)        | Açıklama |
|------------------------|------------------------------|----------|
| Social                 | **social.conversation**       | Müşteriyle konuşma (garson, barista, kasiyer, kuaför asistan). İleride persuasion/networking ayrı işlerde kullanılabilir. |
| Cooking                | **practical.cooking**        | Bulaşıkçı sekonder, garson/barista primer/sekonder. |
| Cleaning               | **practical.cleaning**       | Bulaşıkçı primer. |
| Finance                | **practical.finance**        | Kasiyer sekonder. |
| Makeup                 | **practical.makeup**         | Kuaför asistan primer; bahşiş formülünde. |
| Writing                | **creative.writing**         | Freelance yazar primer. |
| Creativity             | **Stat: $creativity**        | Freelance yazar sekonder “Creativity +1” = gainStat creativity. |
| Fitness-related        | **Fitness stat grubu**       | Kişisel antrenör: upperBody, core, lowerBody, cardio’ya gainStat dağıtımı veya tek “fitness” gain. Skill olarak yoga/dance vb. kullanılabilir. |

Bu sayede her iş tipi için “primer skill”, “sekonder skill” ve (varsa) “stat gain” netleşir.

---

## 3. İŞ TİPİNE GÖRE STAT/SKILL KULLANIMI

### 3.1 Vardiya stat maliyeti (4 saat referans; 2/4/6/8 saat oranlanır)

Cheatsheet’teki “4 saatlik vardiya” değerleri. Süre oranı: `çarpan = saat / 4`.

| İş ağırlığı     | Energy (4s) | Mood (4s) | Stress (4s) | Hygiene (4s) |
|-----------------|-------------|-----------|-------------|--------------|
| Hafif fiziksel  | -30         | -5        | +10         | -10          |
| Orta fiziksel   | -40         | -10       | +15         | -15          |
| Ağır fiziksel   | -50         | -15       | +20         | -30          |
| Mental          | -35         | -10       | +20         | -5           |
| Sosyal          | -35         | -5        | +15         | -10          |

**Uygulama:** 4 saat için tablodaki değerler; 2 saat için ×0.5, 6 saat ×1.5, 8 saat ×2. Widget’ta: `_mult = shiftHours / 4`, sonra `loseStat "energy" (30*_mult)` gibi.

---

### 3.2 Skill kazanımı (4 saat referans; süreyle oranla)

Toplam vardiya başına 3–5 skill; ~1/saat. Süre oranı yine `shiftHours/4`.

| İş              | Primer (4s)              | Sekonder (4s)           | Toplam |
|-----------------|---------------------------|--------------------------|--------|
| Bulaşıkçı       | cleaning +3               | cooking +1               | 4      |
| Garson          | conversation +2           | cooking +2               | 4      |
| Barista         | cooking +3                | conversation +1          | 4      |
| Kasiyer         | conversation +2          | finance +1               | 3      |
| Kuaför asistan  | makeup +3                 | conversation +1         | 4      |
| Freelance yazar | writing +4                | creativity (stat) +1     | 5      |
| Kişisel antrenör| fitness (stat dağıt) +3   | conversation +2         | 5      |

**Kod convention’ı:**

- Primer/sekonder: `<<gainSkill "practical" "cleaning" 3>>`, `<<gainSkill "practical" "cooking" 1>>`.
- “Creativity +1”: `<<gainStat "creativity" 1>>`.
- “Fitness-related +3”: Örneğin cardio +1.5, core +1, lowerBody +0.5 gibi dağıt veya `<<gainStat "cardio" 1>><<gainStat "core" 1>><<gainStat "lowerBody" 1>>`.
- Süre 2/6/8 saat: gain’leri `(shiftHours/4)` ile çarp (yuvarla).

---

### 3.3 Bahşiş formülleri (müşteri yüzlü işler)

Kullanılan stat/skill: `$charisma`, `$looks`, `$skills.practical.makeup`. Cheatsheet formülleri (vardiya başı toplam bahşiş bandı):

| İş              | Baz   | Max  | Formül (fikir) |
|-----------------|-------|------|----------------|
| Garson          | $5–10 | $19  | base + charisma/20 + looks/25 |
| Barista         | $3–7  | $14  | base + charisma/25 + looks/30 |
| Kuaför asistan  | $5–12 | $22  | base + charisma/20 + makeup/20 |
| Bar             | $8–15 | $28  | base + charisma/15 + looks/20 |

**Uygulama:** Vardiya sonunda tek hesaplama: base rastgele veya sabit, bonus = charisma/20 + looks/25 gibi, cap = max. Süre 4 saat dışındaysa bahşişi de `(shiftHours/4)` ile oranla.

---

## 4. İŞ GEREKSİNİMLERİ (Requirements)

İşe başvuru / işe kabul için ileride kullanılabilecek alanlar:

| Tür       | Örnek                    | Oyundaki karşılık |
|-----------|---------------------------|-------------------|
| Skill min | Garson: conversation 10  | `$skills.social.conversation >= 10` |
| Stat min  | Garson: looks 30         | `$looks >= 30` (veya beauty + clothing) |
| Flag      | Dishwasher: find_job quest bitti | `$flags.find_job_done` veya job unlock flag |
| Item/quest| Sertifika                 | Envanter veya flag |

Şimdilik sadece dishwashing quest ile açılıyor; diğer işler “zamanla buton” ile açılacağı için her iş için `unlockCondition` (skill/stat/flag) bu tabloya göre tanımlanabilir.

---

## 5. ÖZET: JOB SİSTEMİ NELERİ KULLANACAK?

- **Stat maliyeti:** `$energy`, `$mood`, `$stress`, `$hygiene` (loseStat/gainStat; stress artıyor).
- **Zaman:** `<<advanceTime shiftHours*60>>` → hunger/thirst/bladder/energy/hygiene saatlik zaten değişir; job ekstra energy/mood/stress/hygiene maliyetini vardiya sonunda uygular.
- **Ücret:** Maaş = saat×$perHour; bahşiş = yukarıdaki formüller (charisma, looks, makeup).
- **Skill kazanımı:** `<<gainSkill category skillName amount>>`, gerekirse `<<gainStat "creativity" n>>` veya fitness dağıtımı.
- **Gereksinim:** İleride skill/stat/flag; şimdilik sadece dishwashing quest flag’i.

Bu doküman, job definition’larda “statCost”, “skillGain”, “tipFormula”, “requirements” alanlarına yazılacak değerlerin tek kaynağı olarak kullanılabilir.
