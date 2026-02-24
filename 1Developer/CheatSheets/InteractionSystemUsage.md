# Interaction System — Kullanım Rehberi

> Yeni karakter veya interaction yazarken başvurulacak referans.
> Sistem tasarımı için: `InteractionSystemRevamp.md`

---

## 1. Yeni Karakter Eklemek

`storyJavaScript.js` içindeki karakter tanımına şunlar eklenir:

```js
tom: {
  // Stats — hepsi 0'dan başlar, level'lar 1'den
  stats: {
    love: 0,        loveLevel: 1,
    friendship: 0,  friendshipLevel: 1,
    lust: 0,        lustLevel: 1,
    trust: 0,       trustLevel: 1
  },

  // Her stat için her level'ın threshold'u
  // key = mevcut level, value = atlamak için gereken puan
  // Tanımlanmayan level → varsayılan 100
  levelUpThresholds: {
    friendship: { 1: 30, 2: 50, 3: 75, 4: 100 },
    love:       { 1: 25, 2: 40, 3: 60, 4: 100 },
    lust:       { 1: 20, 2: 35, 3: 55, 4: 80  },
    trust:      { 1: 30, 2: 50, 3: 70, 4: 100 }
  },

  // Stat başına maksimum level
  maxLevels: { friendship: 5, love: 5, lust: 5, trust: 5 }
}
```

---

## 2. Interaction Butonları Tanımlamak

`storyJavaScript.js` → `setup.characterActions` içine lokasyon bazında yazılır:

```js
tom: {
  dinerRubys: [
    // Her zaman görünür
    { id: "talk",     label: "Talk",          passage: "tomTalk",     minPlayerEnergy: 5 },

    // friendshipLevel 2 olunca açılır, kilitliyken görünür ("Requires: Friendship Level 2")
    { id: "flirt",    label: "Flirt",         passage: "tomFlirt",    requirements: { friendshipLevel: 2 } },

    // lustLevel 2 olunca açılır
    { id: "touch",    label: "Touch",         passage: "tomTouch",    requirements: { lustLevel: 2 } },

    // Flag + corruption gerektirir, kilitliyken tamamen gizlenir
    { id: "secret",   label: "...",           passage: "tomSecret",
      requirements: { flag: "tom_secret_seen", corruption: 1 },
      showWhenLocked: false },
  ]
},
```

### Requirement Seçenekleri

| Requirement | Kontrol |
|---|---|
| `friendshipLevel: 2` | Karakterin friendshipLevel >= 2 |
| `lustLevel: 2` | Karakterin lustLevel >= 2 |
| `loveLevel: 2` | Karakterin loveLevel >= 2 |
| `trustLevel: 2` | Karakterin trustLevel >= 2 |
| `flag: "isim"` | `$flags.isim === true` |
| `corruption: 1` | Player corruption >= 1 |
| `willpower: 20` | Player willpower >= 20 |
| `minPlayerEnergy: 5` | Player energy >= 5 |
| `dailyLimit: 1` | Bugün kaç kez yapılabilir |
| `friendship: 15` | Raw stat check (eski uyum) |

### showWhenLocked

```js
// Kilitliyken buton görünür, mesaj gösterir (varsayılan)
showWhenLocked: true   →  [Flirt 🔒] "Requires: Friendship Level 2"

// Kilitliyken buton tamamen gizlenir
showWhenLocked: false  →  (hiçbir şey çıkmaz)
```

---

## 3. Talk Script Yazmak (`.twee`)

```twee
:: tomTalk
<<set _fl = $characters.tom.stats.friendshipLevel>>

<<if _fl >= 3>>
  /* Lv3+ — derin konuşma */
  "Seninle gerçekten konuşabiliyorum," diyor Tom.
  <<gainCharacterStat "tom" "friendship" 10>>
  <<gainCharacterStat "tom" "trust" 5>>

<<elseif _fl >= 2>>
  /* Lv2 — kişisel konular */
  Tom bugün nasıl geçtiğini soruyor.
  <<gainCharacterStat "tom" "friendship" 7>>
  <<gainCharacterStat "tom" "trust" 2>>

<<else>>
  /* Lv1 — yüzeysel */
  "Hava çok güzel bugün," diyor Tom.
  <<gainCharacterStat "tom" "friendship" 4>>
<</if>>

[[Geri dön|dinerRubys]]
```

---

## 4. Flirt Script Yazmak

```twee
:: tomFlirt
/* friendshipLevel >= 2 garantili — sistem zaten kontrol etti */

Tom'un gözleri parlıyor.

[[Karşılık ver|tomFlirt_accept]]
[[Geç|dinerRubys]]

:: tomFlirt_accept
<<gainCharacterStat "tom" "lust" 10>>
<<gainCharacterStat "tom" "friendship" 2>>
[[Devam et|dinerRubys]]

:: tomFlirt_reject
<<gainCharacterStat "tom" "friendship" -3>>
<<gainCharacterStat "tom" "trust" -5>>
[[Devam et|dinerRubys]]
```

---

## 5. Puan Vermek

```twee
<<gainCharacterStat "charId" "statName" miktar>>

/* Örnekler */
<<gainCharacterStat "tom" "friendship" 8>>
<<gainCharacterStat "tom" "lust" 12>>
<<gainCharacterStat "tom" "trust" -5>>   ← negatif de olur
```

`gainCharacterStat` otomatik olarak:
- Threshold'a ulaşıldığında level'ı artırır
- Stat'ı 0'a sıfırlar (overflow taşımaz)
- Level-up notification gösterir
- maxLevel'a ulaşıldığında stat'a ekleme yapmaz

---

## 6. Hızlı Başvuru — Kazanım Miktarları

| Eylem | Friendship | Lust | Trust |
|---|---|---|---|
| Normal talk (Lv1) | +3–5 | — | +1 |
| Personal topic (Lv2) | +6–8 | — | +3 |
| Deep topic (Lv3) | +8–12 | +2 | +5 |
| Flirt (kabul) | +2 | +8–12 | +1 |
| Flirt (red) | −3 | +3 | −5 |
| Compliment görünüm | +1 | +5–8 | — |
| Touch (kabul) | +3 | +15 | +2 |
| Touch (red) | −5 | +5 | −10 |
