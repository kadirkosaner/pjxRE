# Aktivite özeti (stat, skill, enerji, relax)

**Sadece enerji harcayan aktiviteler (tablo):** bkz. [`AktiviteDetayTablosu.md`](AktiviteDetayTablosu.md)

Projede `passages/4 - Actions` ve iş sistemi (`JobWidgets` / `7 - Work`) tarafındaki **oyun döngüsüne giren** ana aktivitelerin özeti.  
Tam otomatik tarama: `<<advanceTime>>` ve/veya `<<gainStat>>` / `<<loseStat>>` / `<<gainSkill>>` içeren çok sayıda pasaj daha var (tek seferlik event, hikâye); burada menüden seçilen rutinler önceliklidir.

**Sütunlar**

| Sütun | Anlamı |
|--------|--------|
| **Stat kazanç / kayıp** | `gainStat` / `loseStat` veya TV-bank gibi `queueStatChange` ile yapılanlar |
| **Skill** | Doğrudan `<<gainSkill>>` veya okuma/dergi meta verisi |
| **Enerji kontrolü** | `requireMinEnergy`, `btn` minEnergy, `activityButton minStat:energy`, iş vardiyası maliyeti, hub `btnPicker` |
| **Relax** | `<<advanceTime … "relax">>` kullanılıyor mu |

---

## Ana aktiviteler

| Aktivite | Stat kazanç | Stat kayıp | Skill | Enerji kontrolü | Relax |
|----------|-------------|------------|-------|-----------------|-------|
| District hub – Walk | mood | stress, energy (süreye göre) | — | Evet (`requireMinEnergy` + süre; `btnPicker`) | Evet |
| District hub – Phone | mood | stress, energy | — | Evet (aynı) | Evet |
| District hub – Watch people | mood | stress, energy | — | Evet (aynı) | Evet |
| Mall – Window Shopping | mood | stress, energy (−5) | — | Evet (min 10) | Evet |
| Park – Walk | mood | stress, energy | — | Hayır (pasajda kapı yok) | Hayır |
| Park – Jog | cardio, lowerBody | stress, energy | running+ | Evet (`activityButton` min 20) | Hayır |
| Park – Yoga | — | stress, energy | yoga+ | Evet (`activityButton` min 15) | Hayır |
| Park – Bench rest | mood, energy | stress | — | Hayır | Evet |
| Park – Rest (çimen) | mood, energy | stress | — | Hayır | Evet |
| Park – Bench ilk karşılaşma | mood, energy | stress | — | Hayır | Hayır |
| Ev – TV izle | mood | stress, energy (süreyle ölçekli) | friendship (kiminle/konuya göre) | Hayır | Evet |
| Ev – Backyard rest | mood, energy | stress | — | Hayır | Evet |
| Ev – Nap | energy, mood | stress | — | `activityButton` max energy 50 | Evet |
| Ev – Sleep | energy, health | stress | — | Hayır | Hayır |
| Ev – Bath | energy, health, hygiene, mood | stress | — | Hayır | Evet |
| Ev – Wash face | energy, hygiene | — | — | Hayır | Hayır |
| Ev – Toilet | — | bladder, hygiene | — | Hayır | Hayır |
| Ev – Yoga solo | — | stress, energy | yoga+ | Evet (`activityButton` min 15) | Hayır |
| Ev – Yoga (mom) | friendship | stress, energy | yoga+ | Evet (`activityButton` min 15) | Hayır |
| Ev – Dance | — | stress, energy | dance+ | Evet (`activityButton` min 20) | Hayır |
| Ev – Kardeşle oyun | mood | stress, energy | gaming+ | Evet (`requireMinEnergy` 10) | Hayır |
| Ev – PC oyun | mood | stress, energy | gaming+ | Evet (`requireMinEnergy` 5) | Hayır |
| Ev – PC video | mood | stress, energy | — | Evet (`requireMinEnergy` 5) | Hayır |
| Ev – PC browse | mood | stress | — | Hayır | Hayır |
| Ev – Çamaşır yıkama | — | — | cleaning+ | Hayır | Hayır |
| Ev – Yemek / aileyle yemek / içecekler | energy, health, mood (vb.) | hunger, thirst, stress… | — | Hayır | Hayır |
| Ruby – Depo dinlenme | energy, mood | stress | — | Hayır | Evet |
| Ruby – Depo kahve / ücretsiz yemek | energy (+); ücretsiz: health, mood | thirst / hunger, stress… | — | Hayır | Hayır |
| Okuma (`readExecute`) | Kitap: meta `statPool`’dan 1–2 stat; dergi: odak/mood kuralları | stress | Kitap/dergi meta (skill cap vb.) | Kitap: intelligence/focus min şartları; genel enerji kapısı yok | Evet |
| Ayna (tarak, krem, makyaj vb.) | Çoğunlukla `$appearance` | — | makeup vb. item meta | `activityButton` item şartı; enerji kapısı yok | Hayır |
| İş vardiyası (`jobExecuteShift`) | — | energy, mood, hygiene; stress **artar** | `setup.jobs[…].skillGainsPer4Hours` | Evet (vardiya enerji maliyeti + picker filtre) | Hayır |

---

## Ek notlar

- **Hub:** Başlangıç için enerji eşiği yaklaşık **tahmini maliyet + 10**; gerçek düşüş süreye ve `hubAmbientEnergyDrainPerHour` ile bağlı.
- **TV:** 15 dk → enerji −5; daha uzun sürelerde ölçeklenir (üst sınır 11).
- **İş:** `<<advanceTime>>` **relax kullanmaz**; maliyetler `statCostsPer4Hours` ile vardiya süresine göre ölçeklenir.

---

*İstersen `4 - Actions` içindeki tüm ilgili pasajlar için ham liste (passage adı + relax + requireMinEnergy + stat regex özeti) ayrıca üretilebilir.*
