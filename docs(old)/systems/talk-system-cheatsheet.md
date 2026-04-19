# Talk Sistemi — Karakter Cheatsheet

## Yeni Talk Sistemi Kuralları

| Kural                     | Açıklama                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| **Level sistemi**         | `friendshipLevel` (1–5), `maxLevels` ile versiyona göre cap                 |
| **Version cap**           | `versionCaps` → gerçek stat sınırı (display değil)                          |
| **Lokasyon filtresi**     | Her talk dosyası lokasyona özel topic havuzu oluşturur                      |
| **Zaman filtresi**        | morning (6–12) / afternoon (12–18) / evening (18–22)                        |
| **%40 visual downgrade**  | ❌ KALDIRILDI — tier 3'teyken rastgele tier 1 diyalog gösterme              |
| **Level içi stat düşüşü** | ✅ DESTEKLENIYOR — kötü etkileşimde `loseStat` ile puan düşer, level düşmez |
| **levelUpThresholds**     | Sadece 100'den farklıysa tanımla (default zaten 100)                        |

---

## Aile Karakterleri — v0.1 Başlangıç Değerleri

### 👩 Anne — Sarah Taylor

```javascript
stats:       { friendship: 0, friendshipLevel: 1, love: 0, loveLevel: 1, lust: 0, lustLevel: 1, trust: 0, trustLevel: 1 }
maxLevels:   { friendship: 2, love: 1, lust: 1, trust: 1 }
versionCaps: { friendship: 100, love: 30, trust: 30, lust: 20 }
```

- **Talk lokasyonları:** Kitchen, LivingRoom, Backyard, ParentsRoom
- **Topic dosyası:** `MotherTopicsLevel1.twee`, `MotherTopicsLevel2.twee`
- **Durum:** ✅ Yeni sistem

### 👨 Baba — Robert Taylor

- **Talk lokasyonları:** Kitchen, LivingRoom, Backyard, Garage
- **Faz:** `preWork` / `postWork`
- **Durum:** ⚠️ Henüz eski sistem — `maxLevels: 5`, `versionCaps` yok

### 👦 Kardeş — Jake Taylor

- **Talk lokasyonları:** BrotherRoom, Kitchen, LivingRoom, Backyard
- **Faz:** `school` / `vacation`
- **Durum:** ⚠️ Henüz eski sistem — `maxLevels: 5`, `versionCaps` yok

---

## Yeni NPC Karakteri için Template

```javascript
<<set $characters.npcId = {
    firstName: "İsim",
    stats: {
        love: 0,        loveLevel: 1,
        friendship: 0,  friendshipLevel: 1,   /* Yabancı → 1'den başlar */
        lust: 0,        lustLevel: 1,
        trust: 0,       trustLevel: 1
    },
    maxLevels:   { friendship: 2, love: 1, lust: 1, trust: 1 },
    versionCaps: { friendship: 100, love: 30, trust: 30, lust: 20 },
    ...
}>>
```

### Karakter Tipine Göre Başlangıç Tonu

| Karakter Tipi      | Başlangıç level    | Ton                                                |
| ------------------ | ------------------ | -------------------------------------------------- |
| **Aile**           | friendshipLevel: 1 | Tanışıklık var ama mekanik sıfır — içten ama rutin |
| **Arkadaş/Komşu**  | friendshipLevel: 1 | Biraz daha resmi, nazik                            |
| **Yabancı/Dükkan** | friendshipLevel: 1 | Soğuk, işlemsel                                    |

> Tüm karakterler `friendshipLevel: 1`'den başlar.  
> Aradaki fark **diyalog tonunda** — mekanik aynı.

---

## Level İlerlemesi

| Level | Ton                      | v0.1 durumu              |
| ----- | ------------------------ | ------------------------ |
| **1** | Rutin, kibarca, yüzeysel | ✅ Açık                  |
| **2** | Biraz ısınmış, rahat     | 🔒 maxLevels ile kontrol |
| **3** | Samimi, kişisel paylaşım | 🔒                       |
| **4** | Fiziksel yakınlık doğal  | 🔒                       |
| **5** | Derin bağ                | 🔒                       |

---

## Versiyon Geçiş Komutu

Yeni versiyon açmak için `charXxx.twee`'de sadece şu iki alan güncellenir:

```javascript
// Örnek: v0.2'de friendship level 3, love level 2 açılıyor
maxLevels:   { friendship: 3, love: 2, lust: 1, trust: 2 },
versionCaps: { friendship: 100, love: 60, trust: 60, lust: 20 },
```

---

## Talk Dosyası Adlandırma Kuralı

```
[Char]TopicsLevel[N].twee

MotherTopicsLevel1.twee    ← şu an yazıyoruz
MotherTopicsLevel2.twee    ← v0.2'de
FatherTopicsLevel1.twee    ← baba yenilenince
BrotherTopicsLevel1.twee   ← kardeş yenilenince
LilyTopicsLevel1.twee      ← yeni NPC örneği
```

---

## Talk Passage Kodu Şablonu

```twee
<<silently>>
<<set $location = "fhKitchen">>
<<logDailyActivity "charId" "talk">>
<<set _char = $characters.charId>>
<<set _level = _char.stats.friendshipLevel || 1>>

/* Zaman dilimi */
<<set _hour = $timeSys.hour>>
<<if _hour >= 6 && _hour < 12>>
    <<set _timeSlot = "morning">>
<<elseif _hour >= 12 && _hour < 18>>
    <<set _timeSlot = "afternoon">>
<<else>>
    <<set _timeSlot = "evening">>
<</if>>

/* Topic havuzu */
<<set _pool = setup.charTopics["level" + _level]>>
<<set _topics = _pool.base.slice()>>

/* Lokasyon ekle */
<<if _pool.byLocation["fhKitchen"]>>
    <<set _topics = _topics.concat(_pool.byLocation["fhKitchen"])>>
<</if>>

/* Zaman ekle */
<<if _pool.byTime[_timeSlot]>>
    <<set _topics = _topics.concat(_pool.byTime[_timeSlot])>>
<</if>>

/* Lokasyon+Zaman kesişim */
<<set _locTimeKey = "fhKitchen_" + _timeSlot>>
<<if _pool.byLocTime && _pool.byLocTime[_locTimeKey]>>
    <<set _topics = _topics.concat(_pool.byLocTime[_locTimeKey])>>
<</if>>

<<set _topic = _topics.random()>>
<<advanceTime 15>>
<<loseStat "energy" 5>>
<<gainStat "mood" 3>>
<<if _topic.friendship>><<gainStat "friendship" _topic.friendship "charId">><</if>>
<<if _topic.trust>><<gainStat "trust" _topic.trust "charId">><</if>>
<<if _topic.love>><<gainStat "love" _topic.love "charId">><</if>>
<<recalculateStats>>
<</silently>>
```

---

## Kontrol Listesi

- [x] `charMother.twee` → yeni sistem
- [ ] `charFather.twee` → yenilenecek
- [ ] `charBrother.twee` → yenilenecek
- [ ] `MotherTopicsLevel1.twee` → yazılacak
- [ ] 4x motherTalk passage dosyası → yeniden yazılacak
