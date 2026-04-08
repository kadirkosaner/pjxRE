# Stat kazanımı ve kaybı — kaynak özeti

Bu belge, Twine/SugarCube hikayesinde oyuncu ve karakter istatistiklerini **artıran veya azaltan** mekanizmaları listeler. Kod tabanı taramasına dayanır (Nisan 2026).

---

## 1. Merkezi API (`passages/0 - System/Widgets/StatCalculator.twee`)

| Widget | Ne yapar |
|--------|----------|
| `<<gainStat>>` | Oyuncu statına (veya 3. argümanda karakter ID’si verilirse `gainCharacterStat` ile) çarpanlı kazanç. Fitness statlarında `statMultipliers` ve `fitness` çarpanı uygulanır. İsteğe bağlı maxCap (sayısal 3. argüman). |
| `<<loseStat>>` | Oyuncu statından düşürür (0–100); karakter için `loseCharacterStat`. |
| `<<gainSkill>>` / `<<loseSkill>>` | Yetenek puanı; `loseSkill` şu an yalnızca widget tanımı, passage kullanımı yok. |
| `<<gainCharacterStat>>` / `<<loseCharacterStat>>` | NPC `characters[id].stats` (friendship, trust, love, lust, seviye sistemi). |
| `<<gainSexualSkill>>` | `sexual.skills` ve `sexual.experience` (ana vitallerden ayrı). |
| `<<applyTrait>>` | `statMultipliers` / `skillMultipliers` çarpanları (doğrudan stat sayısı değil). |

**`gainSkill` → dolaylı stat (fiziksel):** Skill kazancının %25’i ilgili beden statlarına (`dance`, `yoga`, `basketball`, `volleyball`, `football`, `swimming` için farklı dağılım).

**`gainSkill` → dolaylı stat (kategori):** mental → intelligence %10; social → charisma %10; creative → creativity %10; technical → focus %10; practical → willpower %10 (skill kazancının yüzdesi).

---

## 2. Zaman sistemi (`TimeWidgets.twee` — `<<advanceTime>>`)

Saat geçince (60 dakika rollover), **her geçen saat için** döngüde:

- `<<increaseHunger 5>>`, `<<increaseThirst 5>>`, `<<increaseBladder 8>>`, `<<decreaseHygiene 5>>`
- Uyku değilse ve mod `"relax"` değilse: `<<loseStat "energy" 5>>`

`advanceTime` sonunda `<<recalculateStats>>` çağrılır.

### Gün atlama (`advanceDay`)

- `trackHunger` açıksa: uyku ile geçen gün başına `<<increaseHunger 30>>` (döngü)
- `skillDecay` açıksa: `<<applySkillDecay>>`
- `trackCalories` açıksa: `<<updateWeight>>` (ağırlık / yağ / kas — bkz. Bölüm 8)
- Günlük flag sıfırlamaları (`$daily.*`)

---

## 3. İhtiyaç sistemi (`NeedsSystem.twee`)

Doğrudan `$hunger`, `$thirst`, `$bladder`, `$hygiene` (ve bildirim kuyruğu) değişir; eşiklerde **ceza**:

| Tetikleyici | Etki (uyku/relax dışında) |
|-------------|---------------------------|
| `increaseHunger` — açlık ≥ 90 | energy −20, mood −15, health −10 |
| `increaseHunger` — açlık ≥ 60 | energy −10, mood −5 |
| `increaseThirst` — susuzluk ≥ 90 | energy −15, focus −20, health −5 |
| `increaseThirst` — susuzluk ≥ 60 | energy −5, focus −10 |
| `increaseBladder` — ≥ 100 | stress +10, mood −10 |
| `increaseBladder` — ≥ 80 | stress +5 |
| `decreaseHygiene` — hijyen ≤ 10 | mood −10 |

**Widget’lar**

- `<<eatFood calories hungerReduction>>` — kalori günlük toplama, açlık azaltma (`trackHunger` ise)
- `<<burnCalories>>` — tanımlı; projede passage çağrısı bulunamadı
- `<<decreaseArousal>>` — uyarılma düşürür; tanımlı, passage kullanımı yok

---

## 4. Yetenek çürümesi (`SkillDecay.twee`)

- Günlük: `<<applySkillDecay>>` — 7 günden fazla kullanılmayan yeteneklerde, eşiğe göre skill puanı düşer (doğrudan `$skills`).

---

## 5. İş sistemi (`JobWidgets.twee` — vardiya)

- `statCostsPer4Hours`: energy, mood → `loseStat`; stress → `$stress` doğrudan artar; hygiene → `loseStat`
- `skillGainsPer4Hours`: `<<gainSkill>>`
- İş XP ve kazanç ayrı değişkenler

---

## 6. Sosyal / günlük aktivite (`ActivityWidgets.twee`)

- `logDailyActivity` içinde `talk` aksiyonu: `<<gainSkill "social" "conversation">>` (0.5–1.5 arası rastgele adım)

---

## 7. Bölge hub’u (yürü / telefon / insan izle)

`districtHub_walkAround.twee`, `districtHub_playPhone.twee`, `districtHub_watchPeople.twee`:  
süreye göre `loseStat "stress"`, `gainStat "mood"`, `loseStat "energy"` (oranlar `HubAmbientWidgets.twee` yorumunda).

---

## 8. Vücut / kilo (`BodySystem.twee`)

- `<<updateWeight>>` — günlük kalori dengesine göre `body.weight`, isteğe bağlı `bodyFat`, `muscleMass` (ayarlar açıksa). Ana “skill stat” listesi değil ame vitallerle ilişkili simülasyon.

---

## 9. `recalculateStats` (`StatCalculator.twee`)

- Türetilmiş: `fitness`, `energyMax`, `looks`, `confidence`, güzellik makyaj/hijyen ile; clamping
- Enerji 0 → `energy_collapse`; sağlık ≤ 20 → `health_faint` (uyku hariç)
- Skill değerleri 0–100 clamp

---

## 10. Okuma (`readExecute.twee`)

- Kitap: `statPool`’dan 1–2 stat, sayfa başına kazanç; ek `focus`; mood/stress; **enerji** doğrudan `$energy` (minimum 10’a clamp)
- Dergi: mood +, stress −; ilk ödül gününde `gainStat` / `gainSkill` (meta veriye bağlı)

---

## 11. TV izleme (`watchTV.twee`)

- Stress/mood/energy: doğrudan `$stress`, `$mood`, `$energy` + `queueStatChange`
- Aile üyeleriyle: `<<gainStat "friendship" … "mother"|"brother"|"father">>` (passage içi dallara göre)

---

## 12. Telefon konu sistemi (`assets/system/js/ui/phone/topic-system.js`)

- `topic.statGain` ile **friendship, love, lust** (sabit dizi `PHONE_TOPIC_STATS`)
- Tier’a göre tavan (20/40/60/100)

---

## 13. Oyuncu — `<<gainStat>>` / `<<loseStat>>` kullanan etkinlikler (gruplu)

Aşağıdaki passage’lar doğrudan bu makroları kullanır (aynı desen tekrarlanan NPC sohbetleri tek satırda özetlenir).

### Etkileşim — enerji −5, mood +2 (diner NPC)

- Jake, James, Tom, Emma, Vince, Sofia, Mike ve benzeri `*TalkDinerRubys.twee` dosyaları

### Etkileşim — enerji −5, mood +3 (aile)

- mother/father/brother çeşitli oda konuşmaları  
- `brotherTalkBackyard`: energy −8, mood +4

### Maplewood / global aktiviteler

- Uyku, şekerleme, nap — energy/stress/health/mood
- Mutfak: yemek, su, kahve, aile yemeği
- Banyo: küvet, yüz yıkama, tuvalet
- Park: yürüyüş, koşu, yoga, bank, çalı sahneleri
- Bilgisayar / oyun / video / kardeş aktiviteleri
- Çamaşır: `gainSkill` cleaning
- AVM penceresi alışverişi
- Diner depo: kahve, ücretsiz yemek, dinlenme
- Meetup: generic chat, park bank / yürüyüş, diner yemek
- Vince quest olayları, yansıma mood kaybı, denetim mood/stress
- enerji çöküşü / bayılma passage’ları

### İş (Ruby’s Diner dishwashing event’leri)

- clog, burn, broken, rush surge, vince check, tom chat, sofia chat, james snack (enerji + eatFood), mike help, ask help, vb.

---

## 14. `<<gainCharacterStat>>` — özet

- Konuşma topic’lerinden: `_topic.friendship|trust|love|lust` (ilgili karakter ID)
- Sabit miktarlar: quest’ler (ör. `quest_find_job_*`, `quest_new_beginnings_dinner`), diner work event’leri, `watchTV` dalları, `brotherPlayTogether`, park bench Lily, gossip passage’ları

---

## 15. `<<eatFood>>` widget çağrıları

- `eatFood.twee` (mutfak), `dinerWork_event_jamesSnack.twee` — açlık/kalori

---

## 16. Doğrudan `$stat` ataması (gainStat dışı)

- `JobWidgets.twee`: vardiya stress maliyeti → `$stress`
- `readExecute.twee`: kitap okurken enerji → `$energy`
- `watchTV.twee`: stress, mood, energy
- İhtiyaç cezaları: `$energy`, `$mood`, `$health`, `$focus`, `$stress` (`NeedsSystem.twee`)

---

## 17. Ayar / veri notu

- `gameSettings.trackHunger`, `trackCalories`, `skillDecay`, `bodyDegradation` birçok yolu açıp kapatır.
- Kitap/dergi meta verileri (`setup.getReadingItem`) stat havuzları ve skill kazançlarını belirler.

---

*Otomatik üretilmiş referanstır; yeni passage eklendikçe `<<gainStat>>` / `<<loseStat>>` / `<<gainSkill>>` için arama ile güncelleyin.*
