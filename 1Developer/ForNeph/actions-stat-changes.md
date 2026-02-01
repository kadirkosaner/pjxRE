# Aksiyonlarda Stat Değişimleri (Detay)

Oyuncu karakterinin yaptığı her aksiyonda hangi statların nasıl değiştiği.

**Kısaltmalar:** F = friendship, T = trust, L = love, Lust = lust (karakter stat’ları). Süre: dakika. `advanceTime` = oyun saati ilerler (saat geçince TimeWidgets’tan ek: hunger +5, thirst +10, bladder +8, hygiene -5, energy -5 / saat).

---

## 1. Karakter etkileşimleri (Talk / Ask)

### Talk – Mother (Kitchen, Livingroom, Backyard, ParentsRoom)

| Stat | Değişim |
|------|--------|
| **Süre** | +15 dk |
| **energy** | -5 |
| **mood** | +3 |
| **Mother: F / T / L / Lust** | Topic’e göre (CommonTopics + talk-topics-reference.md) |

---

### Talk – Father (Kitchen, Livingroom, Backyard, Garage)

| Stat | Değişim |
|------|--------|
| **Süre** | +15 dk |
| **energy** | -5 |
| **mood** | +3 (Kitchen, Livingroom); **+5** Backyard (fresh air); **+3** Garage (bonding) |
| **Father: F / T / L / Lust** | Topic’e göre (CommonTopics + talk-topics-reference.md) |

---

### Talk – Brother (Bedroom, Kitchen, Livingroom, Backyard)

| Stat | Değişim |
|------|--------|
| **Süre** | +15 dk |
| **energy** | -5 |
| **mood** | +3 |
| **Brother: F / T / L / Lust** | Topic’e göre (CommonTopics + talk-topics-reference.md) |

---

### Marcus – Talk (storeCorner)

| Stat | Değişim |
|------|--------|
| **Süre** | — |
| **Stat** | Kodda açık gainStat/loseStat yok. |

---

### Marcus – Ask About the City (storeCorner)

| Stat | Değişim |
|------|--------|
| **Süre** | — |
| **Stat** | Kodda açık gainStat/loseStat yok. (Gereksinim: friendship ≥ 10) |

---

## 2. Mutfak (Kitchen)

### Eat Food

| Stat | Değişim |
|------|--------|
| **Süre** | +20 dk |
| **hunger** | -50 |
| **thirst** | -100 |
| **energy** | +5 |
| **stress** | -5 |

---

### Drink Water

| Stat | Değişim |
|------|--------|
| **Süre** | +5 dk |
| **thirst** | -100 |

---

### Eat with Family

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **hunger** | 0’a sıfırlanır |
| **thirst** | 0’a sıfırlanır |
| **bladder** | +15 |
| **energy** | +30 |
| **stress** | -10 |
| **mood** | +5 |
| **health** | +5 |
| **Mutfaktaki her aile üyesi** | +2 friendship, +1 love (karakter stat’ları) |

---

## 3. Koltuk (fhCouch)

### Nap (runNap – Livingroom)

| Stat | Değişim |
|------|--------|
| **Süre** | $selectedDuration (15/30/45/60 dk) |
| **stress** | -10 |
| **energy** | +15 |
| **Koşul** | energy ≤ 50 (yoksa uyuyamaz) |

---

### Watch TV

| Stat | Değişim |
|------|--------|
| **Süre** | $selectedDuration (15/30/45/60 dk) |
| **stress** | -20 |
| **mood** | +10 |
| **energy** | Süreye göre: 15 dk → -5, 30 dk → -7, 45 dk → -9, 60 dk → -11 |
| **Kiminle izlendiğine göre (karakter stat’ları):** | |
| Alone | — |
| Mom | Mother friendship +2 |
| Dad | Father F/T/L (sports topic’ten, tier + phase’e göre) |
| Brother | Brother friendship +2 |
| Mom & Dad | Mother +1 F, Father +1 F |
| Family (üçü) | Mother +1 F, Father +1 F, Brother +1 F |

---

## 4. Yatak (fhBed – Bedroom)

### Sleep

| Stat | Değişim |
|------|--------|
| **Süre** | Varsayılan 8 saat (480 dk); alarm varsa alarm’a kadar |
| **energy** | + (100 × süre/480), yani tam 8 saat = +100 |
| **stress** | - (50 × süre/480), yani tam 8 saat = -50 |
| **Koşul** | energy ≤ 30 (yoksa uyuyamaz) |

---

### Nap (runNap – Bedroom)

| Stat | Değişim |
|------|--------|
| **Süre** | $selectedDuration (15–60 dk) |
| **stress** | -15 |
| **energy** | +20 |
| **Koşul** | energy ≤ 50 |

---

### Set Alarm

| Stat | Değişim |
|------|--------|
| **Süre** | — |
| **Stat** | Yok (sadece alarm ayarı). |

---

## 5. Salon (Livingroom)

### Yoga – Solo (runYogaSolo)

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **energy** | -15 |
| **stress** | -10 |

---

### Yoga – Mom ile (runYoga)

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **energy** | -15 |
| **stress** | -15 |
| **Mother** | friendship +2 |

---

### Dance (runDance)

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **energy** | -20 |
| **stress** | -15 |

---

## 6. Bahçe (fhBackyard)

### Yoga (runYogaSolo)

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **energy** | -15 |
| **stress** | -10 |

(Salon solo yoga ile aynı.)

---

## 7. Banyolar

### Take a Shower – Üst kat (useBath)

| Stat | Değişim |
|------|--------|
| **Süre** | +20 dk |
| **hygiene** | +100 |
| **energy** | +5 |
| **stress** | -10 |

---

### Ebeveyn banyosu (fhParentsBath) – Duş yok

| Stat | Değişim |
|------|--------|
| **Not** | Passage sadece fhParentsBath’ta buton olarak geçiyor; ayrı passage dosyası yok. Muhtemelen useBath ile aynı mantık (hygiene +100, energy +5, stress -10, +20 dk) kullanılabilir. |

---

### Use Toilet

| Stat | Değişim |
|------|--------|
| **Süre** | +5 dk |
| **bladder** | -100 |
| **hygiene** | -5 |

---

### Wash Face

| Stat | Değişim |
|------|--------|
| **Süre** | +5 dk |
| **hygiene** | +10 |
| **energy** | +2 |

---

## 8. Park (sunsetPark)

### Sit on Bench (parkBench)

| Stat | Değişim |
|------|--------|
| **Süre** | +30 dk |
| **stress** | -5 |

---

### Go for a Jog (parkJog)

| Stat | Değişim |
|------|--------|
| **Süre** | +45 dk |
| **energy** | -20 |
| **stress** | -15 |
| **cardio** | +6 |
| **lowerBody** | +4 |

---

### Do Yoga (parkYoga)

| Stat | Değişim |
|------|--------|
| **Süre** | +45 dk |
| **energy** | -15 |
| **stress** | -20 |

---

## Özet tablo (oyuncu stat’ları)

| Aksiyon | Süre | energy | stress | mood | hunger | thirst | bladder | hygiene | health | Diğer |
|---------|------|--------|--------|------|--------|--------|---------|---------|--------|--------|
| Talk (hepsi) | +15 | -5 | — | +3 (+5 Backyard Father, +3 Garage) | — | — | — | — | — | Karakter F/T/L/Lust (topic) |
| Eat Food | +20 | +5 | -5 | — | -50 | -100 | — | — | — | — |
| Drink Water | +5 | — | — | — | — | -100 | — | — | — | — |
| Eat with Family | +30 | +30 | -10 | +5 | 0 | 0 | +15 | — | +5 | Herkes +2F +1L |
| Nap (Couch) | seçim | +15 | -10 | — | — | — | — | — | — | — |
| Nap (Bed) | seçim | +20 | -15 | — | — | — | — | — | — | — |
| Watch TV | seçim | -5~-11 | -20 | +10 | — | — | — | — | — | Kimle: F (karakter) |
| Sleep | ~8h | +100* | -50* | — | — | — | — | — | — | *orantılı |
| Yoga Solo | +30 | -15 | -10 | — | — | — | — | — | — | — |
| Yoga Mom | +30 | -15 | -15 | — | — | — | — | — | — | Mother +2 F |
| Dance | +30 | -20 | -15 | — | — | — | — | — | — | — |
| Shower (useBath) | +20 | +5 | -10 | — | — | — | — | +100 | — | — |
| Toilet | +5 | — | — | — | — | — | -100 | -5 | — | — |
| Wash Face | +5 | +2 | — | — | — | — | — | +10 | — | — |
| Park Bench | +30 | — | -5 | — | — | — | — | — | — | — |
| Park Jog | +45 | -20 | -15 | — | — | — | — | — | — | cardio +6, lowerBody +4 |
| Park Yoga | +45 | -15 | -20 | — | — | — | — | — | — | — |
| Marcus Talk/Ask City | — | — | — | — | — | — | — | — | — | Kodda yok |

---

*Talk topic değerleri (F/T/L/Lust) için: `talk-topics-reference.md` ve ilgili CommonTopics dosyaları.*
