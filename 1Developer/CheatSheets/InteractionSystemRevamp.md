# Interaction System Revamp — Tasarım Dökümanı

> **Durum:** Tasarım aşaması
> **Bağımlılıklar:** Mevcut `showActions` macro, `gainCharacterStat` widget, `CharacterInteraction.twee`
> **Etkilenen dosyalar:** storyJavaScript.js, CharacterWidgets.twee, StatCalculator.twee, relations.js, charInfoCard

---

## 1. Genel Vizyon

Mevcut sistem karaktere yaklaşınca tek düz bir eylem listesi sunuyor. Hedef: ilişki derinliğine göre katmanlanan, her seviyede yeni kapılar açan, karakter başına özelleştirilebilir bir interaction sistemi.

```
Şu an:     [Talk] [Give Phone Number] [Leave]

Hedef:
  Lv.1     [Talk] [Leave]
  Lv.2     [Talk] [Flirt] [Leave]
  Lv.3     [Talk] [Flirt] [Touch] [Leave]
```

---

## 2. Relationship Level Sistemi

### 2.1 Veri Yapısı Değişikliği

`$characters[charId].stats` objesine level alanları eklenir:

```js
// MEVCUT
stats: { love: 0, friendship: 0, lust: 0, trust: 0 }

// YENİ
stats: {
  love: 0,        loveLevel: 1,
  friendship: 0,  friendshipLevel: 1,
  lust: 0,        lustLevel: 1,
  trust: 0,       trustLevel: 1
}
```

### 2.2 Level-Up Mekanik

`gainCharacterStat` widget'ı güncellenir:

- Stat 100'e ulaştığında → ilgili `Level` +1 artar
- Stat sıfırlanır (bar yeniden dolmaya başlar)
- Level-up notification gösterilir: `"Friendship with Tom → Level 2!"`
- Karakter tanımındaki `maxLevels` değerine göre tavan uygulanır

```
friendship: 95 → gainCharacterStat +10 → friendship: 5, friendshipLevel: 2
```

### 2.3 Karakter Başına Max Level

Her karakter tanımına `maxLevels` eklenir:

```js
// charTom tanımı örneği
maxLevels: {
  friendship: 3,   // Tom ile derin arkadaşlık olabilir
  trust: 4,
  lust: 0,         // 0 = bu path hiç açılmaz
  love: 0
}
```

| Karakter | Friendship Max | Lust Max | Love Max | Not |
|---|---|---|---|---|
| Lily | 5 | 4 | 5 | Tam romantik path |
| Tom (Clerk) | 3 | 0 | 0 | Arkadaş/mentor, sex yok |
| Sofia | 3 | 2 | 1 | Erkek arkadaş engeli var |
| Emma | 4 | 4 | 2 | Açık kişilik, hızlı lust |
| Mike (Dish) | 2 | 0 | 0 | Yüzeysel iş arkadaşı |
| Vince | 1 | 0 | 0 | Friendship path yok, ayrı eksen |
| Anne/Baba/Kardeş | 5 | 0 | 5 | Family love, lust path yok |

### 2.4 Özel Eksenler

Bazı karakterler standart friendship/lust yerine farklı eksenlerle ilerler:

**Vince — Power Dynamic:**
```
trust → "compliance" eksenine dönüşür
corruption gereksinimleri ön plana çıkar
"friendship" yükseltmek mümkün değil, sadece trust/compliance
```

---

## 3. Katmanlı Interaction Menüsü

### 3.1 Action Kategorileri

```
KATEGORI        UNLOCK KOŞULU           ÖRNEK EYLEMLER
─────────────────────────────────────────────────────
Talk            Hep açık                Chat, Ask about..., Discuss
Flirt           friendshipLevel >= 2    Compliment, Tease, Playful comment
Touch           lustLevel >= 2          Touch arm, Hug, ...
Intimate        lustLevel >= 3          ... (karakter bağımlı)
Special         Karakter özel flag      Vince: "Check his PC" (corruption 1)
```

### 3.2 showActions Macro Güncellemesi

`storyJavaScript.js` → `showActions` macro'suna yeni requirement tipleri eklenir:

```js
// MEVCUT requirements sadece karakter stat'larına bakıyor
requirements: { friendship: 15 }   // raw stat check

// YENİ - level check desteği
requirements: {
  friendshipLevel: 2,              // level check
  lustLevel: 1,                    // level check
  corruption: 1,                   // player corruption check
  willpower: 20,                   // player willpower check
  flag: "vince_pc_seen"            // flag check
}
```

Check sırası:
1. `dailyLimit` → bugün yapıldı mı?
2. `timeWindow` → saat uygun mu?
3. `flag` → gerekli flag var mı?
4. `corruption` / `willpower` → player stat yeterli mi?
5. `friendshipLevel` / `lustLevel` → level yeterli mi?
6. `friendship` / `lust` (raw) → raw stat yeterli mi?
7. `minPlayerEnergy` → enerji yeterli mi?

### 3.3 Locked Buton Davranışı

Mevcut sistem locked butonları gösteriyor (kilit ikonu + tooltip). Bu korunur ama level lock için farklı mesaj:

```
Kilitlerin mesajları:
  "Requires: Friendship Level 2"     → level eksik
  "Requires: Lust Level 2"           → level eksik
  "Requires Corruption 1"            → corruption eksik
  "Already done today"               → günlük limit
  "Need 10 energy"                   → enerji eksik
```

Seçenek: Level-locked eylemler tamamen **gizlenebilir** (locked göstermek yerine). Karakter başına `showLockedActions: false` ile kontrol edilir.

---

## 4. Talk Sistemi Entegrasyonu

### 4.1 Mevcut Durum

`brotherTalkLivingRoom.twee` gibi dosyalar friendship raw değerine göre tier belirliyor:
```
friendship < 40 → tier1
friendship 40-70 → tier2
friendship > 70 → tier3
```

### 4.2 Yeni Durum

Raw tier sistemi kaldırılmaz, `friendshipLevel` ile **eşleştirilir**:

```
friendshipLevel 1 → tier1 (friendship 0-100 arası)
friendshipLevel 2 → tier2 (daha kişisel konular)
friendshipLevel 3 → tier3 (mahrem, derin konular)
```

Bu sayede:
- Eski talk dosyaları çalışmaya devam eder
- Yeni dosyalar doğrudan level kontrolü yapar
- Level atlamak anında yeni konuşma içeriği açar

### 4.3 Talk Kazanım Hızları

| Eylem | Friendship | Lust | Trust | Not |
|---|---|---|---|---|
| Normal talk (tier1) | +3–5 | 0 | +1 | Yavaş |
| Personal topic (tier2) | +6–8 | 0 | +3 | Orta |
| Deep topic (tier3) | +8–12 | +2 | +5 | Hızlı |
| Flirt (kabul) | +2 | +8–12 | +1 | Lust odaklı |
| Flirt (red) | −3 | +3 | −5 | Risk var |
| Compliment görünüm | +1 | +5–8 | 0 | Lust odaklı |
| Touch (kabul) | +3 | +15 | +2 | Yüksek lust |
| Touch (red) | −5 | +5 | −10 | Yüksek risk |

---

## 5. CharacterInteraction.twee Güncellemesi

### 5.1 charInfoCard'a Level Gösterimi

Mevcut card: Love / Friendship / Lust / Trust (raw sayı)

Yeni card:
```
Friendship  ████████░░  Lv.2 · 45/100
Love        ░░░░░░░░░░  Lv.1 · 12/100
Lust        ░░░░░░░░░░  Lv.1 · 0/100
Trust       ██████░░░░  Lv.1 · 60/100
```

Şu anki `charInfoCard` widget'ı güncellenir — aynı accordion yapısı korunur, stat kutuları genişletilir.

### 5.2 Interaction Hub Yapısı

`CharacterInteraction.twee` temelde değişmez, `showActions` zaten her şeyi handle ediyor. Tek değişiklik: `charInfoCard` widget'ının level bilgisini göstermesi.

---

## 6. Relations Modal Güncellemesi

`assets/system/js/modal/relations.js` → bar render kısmı güncellenir:

```
Şu an:   Friendship: [████████░░] 80 / 100

Yeni:    Friendship Lv.2: [████████░░] 80 / 100
                           ↑ sonraki level için
```

Level 0 (max'a ulaşmış, max level) → bar dolup "MAX" gösterir.

---

## 7. Karakter Action Tanımları — Örnek Yapı

`storyJavaScript.js` içinde `setup.characterActions` güncellemesi:

```js
setup.characterActions = {

  // TOM (Clerk)
  dinerClerk: {
    dinerRubys: [
      { id: "talk",    label: "Talk",    passage: "tomTalk",    minPlayerEnergy: 5 },
      { id: "flirt",   label: "Flirt",   passage: "tomFlirt",
        requirements: { friendshipLevel: 2 },
        tags: ["flirt"] },
      // Lust path yok — maxLevels.lust: 0
    ]
  },

  // LILY
  lily: {
    sunsetPark: [
      { id: "talk",    label: "Talk",    passage: "lilyTalk",   minPlayerEnergy: 5 },
      { id: "jog",     label: "Jog Together", passage: "lilyJog",
        requirements: { friendshipLevel: 2 } },
      { id: "flirt",   label: "Flirt",   passage: "lilyFlirt",
        requirements: { friendshipLevel: 2 }, tags: ["flirt"] },
      { id: "touch",   label: "...",     passage: "lilyTouch",
        requirements: { lustLevel: 2 }, tags: ["adult"] },
    ]
  },

  // VINCE — özel eksen, friendship yok
  dinerManager: {
    dinerRubys: [
      { id: "report",  label: "Report to Vince", passage: "vinceReport" },
      { id: "pcSnoop", label: "Check his PC",    passage: "vince_pc_snoop",
        requirements: { flag: "vince_pc_seen", corruption: 1 },
        showWhenLocked: false },   // gizli kalır, hint bile yok
    ],
    dinerOffice: [
      { id: "pcSnoop", label: "Browse his PC",   passage: "vince_pc_snoop",
        requirements: { flag: "vince_pc_seen", corruption: 1 },
        showWhenLocked: false },
    ]
  }
};
```

---

## 8. Uygulama Sırası

### Faz 1 — Altyapı (önce bunlar)
1. `gainCharacterStat` widget'ına level-up mantığı ekle
2. Tüm karakter init dosyalarına `xLevel: 1` alanları ekle
3. `showActions` macro'suna `friendshipLevel`, `lustLevel`, `corruption`, `flag` requirement desteği ekle
4. `charInfoCard` widget'ına level gösterimi ekle
5. `relations.js` modal'a level satırı ekle

### Faz 2 — Karakter Tanımları
6. Tüm karakterlere `maxLevels` tanımla
7. `setup.characterActions` içinde flirt/touch/intimate kategorilerini ekle (şimdilik passage'lar placeholder)

### Faz 3 — İçerik (karakter odaklı yazım)
8. Her karakter için flirt passage'ları yaz
9. Talk topic'lerine level-bazlı içerik ekle
10. Vince/özel karakter path'lerini yaz

---

## 9. Önemli Kararlar

| Konu | Karar | Sebep |
|---|---|---|
| Raw stat check'ler kaldırılsın mı? | **Hayır** | Geriye dönük uyum, eski içerik çalışmaya devam eder |
| Locked buton gösterilsin mi? | **Karakter bazlı** | `showWhenLocked` flag ile kontrol |
| Level sıfırlanıyor mu (Lv.1→100→Lv.2→0 mı)? | **Evet** | RPG tarzı, her level yeni bar |
| Aile için lust level açılsın mı? | **Hayır** | maxLevels.lust: 0 |
| Level-up anında event tetiklenebilir mi? | **Evet** | onLevelUp flag + notification, ileride event hook eklenebilir |

---

## 10. Glossary

| Terim | Açıklama |
|---|---|
| `friendshipLevel` | Friendship stat'ının kaçıncı turunda olduğu (1'den başlar) |
| `maxLevels` | Karakterin o stat'ta ulaşabileceği max level |
| `showWhenLocked` | false → buton tamamen gizlenir; true → kilit ikonu ile gösterilir |
| `onLevelUp` | Level atladığında tetiklenecek event/flag |
| Power Dynamic | Friendship/Lust yerine trust+corruption ekseninde ilerleyen özel path (Vince) |
