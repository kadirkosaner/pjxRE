# Interaction System Revamp — Tasarım Dökümanı

> **Durum:** Tasarım aşaması
> **Bağımlılıklar:** Mevcut `showActions` macro, `gainCharacterStat` widget, `CharacterInteraction.twee`
> **Etkilenen dosyalar:** storyJavaScript.js, CharacterWidgets.twee, StatCalculator.twee, relations.js, charInfoCard

---

## 1. Temel Kural

**Sistem global ve uniform.** Her NPC için aynı kurallar geçerlidir. Karakter bazlı istisna yoktur. Aile dahil tüm karakterler için love, friendship, lust, trust statları level'lanır. İçeriğin var olup olmadığı sistemi kısıtlamaz — o yazım meselesidir. Sistem sadece altyapıyı sağlar.

```
Şu an:     [Talk] [Give Phone Number] [Leave]

Hedef:
  Lv.1     [Talk] [Leave]
  Lv.2     [Talk] [Flirt] [Leave]
  Lv.3     [Talk] [Flirt] [Touch] [Leave]
  Lv.4+    [Talk] [Flirt] [Touch] [Intimate] [Leave]
```

---

## 2. Relationship Level Sistemi

### 2.1 Veri Yapısı

`$characters[charId].stats` objesine level alanları eklenir. Tüm karakterler için aynı yapı:

```js
// MEVCUT
stats: { love: 0, friendship: 0, lust: 0, trust: 0 }

// YENİ — her stat için ayrı level, hepsi 1'den başlar
stats: {
  love: 0,        loveLevel: 1,
  friendship: 0,  friendshipLevel: 1,
  lust: 0,        lustLevel: 1,
  trust: 0,       trustLevel: 1
}
```

### 2.2 Level-Up Mekanik

`gainCharacterStat` widget'ı güncellenir:

- Stat `levelUpThreshold`'a ulaştığında → ilgili Level +1 artar
- Stat **0'a sıfırlanır**, bar yeniden dolmaya başlar, overflow taşımaz
- Level-up notification gösterilir

**Threshold, karakter config'inden stat bazında okunur** (`levelUpThresholds`). Tanımlanmamış stat için varsayılan `100` kullanılır.

```js
// Her karakter tanımına eklenir — tüm statlar opsiyonel, eksik olanlar 100 varsayılan alır
levelUpThresholds: {
  friendship: 50,   // bu karakter için friendship her 50 puanda level atlar
  love: 30,
  lust: 55,
  trust: 100        // belirtilmese de 100 olur, yazmak zorunlu değil
}
```

```
Örnek — Tom (friendship threshold: 50):
  friendship: 45, friendshipLevel: 1
  → gainCharacterStat "tom" "friendship" 10
  → friendship: 0, friendshipLevel: 2   ← 45+10=55 → 50'yi geçti, sıfırla + level++
  → Notification: "Tom ile Friendship → Level 2!"

Örnek — Lily (friendship threshold: 100, default):
  friendship: 95, friendshipLevel: 1
  → gainCharacterStat "lily" "friendship" 10
  → friendship: 0, friendshipLevel: 2   ← 95+10=105 → 100'ü geçti, sıfırla + level++
```

Her karakterin `maxLevels` değeri vardır — ilerleyen update'lerde karakter bazında güncellenir. Şu an tüm karakterler için varsayılan değer `5` olarak başlar.

```js
maxLevels: {
  friendship: 5,   // varsayılan, update'lerle değişir
  love: 5,
  lust: 5,
  trust: 5
}
```

Bir stat `maxLevel`'ına ulaştığında bar dolup **MAX** gösterir, daha fazla kazanım o stata eklenmez.

### 2.3 Level Karşılıkları (Tüm NPC'ler için)

| Level | Friendship | Lust | Love | Trust |
|---|---|---|---|---|
| 1 | Tanışma, yüzeysel konular | Yok | Sempati | Nötr |
| 2 | Kişisel konular, flirt açılır | Çekim, hafif dokunuşlar | Sıcaklık | Güven |
| 3 | Sırlar, derin konuşmalar | Arzu, daha fiziksel | Bağlılık | Sır ortaklığı |
| 4 | Yakın arkadaşlık | Yoğun çekim | Aşk | Mutlak güven |
| 5+ | İlerideki içerikler | ... | ... | ... |

---

## 3. Katmanlı Interaction Menüsü

### 3.1 Action Kategorileri

```
KATEGORI     UNLOCK KOŞULU            ÖRNEK EYLEMLER
──────────────────────────────────────────────────────
Talk         Hep açık                 Chat, Ask about..., Discuss
Flirt        friendshipLevel >= 2     Compliment, Tease, Playful remark
Touch        lustLevel >= 2           Touch arm, Hug, Hold hand
Intimate     lustLevel >= 3           (içerik bağımlı)
Special      flag + corruption/wp     Vince PC, gizli eylemler
```

Hangi kategorinin hangi interaction'ları içerdiği tamamen yazım sırasında belirlenir. Sistem sadece kategorinin görünüp görünmeyeceğine karar verir.

### 3.2 showActions Macro — Yeni Requirement Tipleri

`storyJavaScript.js` → `showActions` macro'suna eklenir:

```js
// MEVCUT — sadece karakter stat'ı
requirements: { friendship: 15 }

// YENİ — desteklenen tüm tipler
requirements: {
  friendshipLevel: 2,     // karakter friendship level check
  lustLevel: 2,           // karakter lust level check
  loveLevel: 2,           // karakter love level check
  trustLevel: 2,          // karakter trust level check
  corruption: 1,          // player $corruption check
  willpower: 20,          // player $willpower check
  flag: "flagIsmi",       // $flags.flagIsmi === true check
  friendship: 15,         // raw stat check (geriye dönük uyum korunur)
  lust: 30,               // raw stat check
}
```

Check sırası:
1. `dailyLimit` → bugün yapıldı mı?
2. `timeWindow` → saat uygun mu?
3. `flag` → gerekli flag var mı?
4. `corruption` / `willpower` → player stat yeterli mi?
5. `friendshipLevel` / `lustLevel` / `loveLevel` / `trustLevel` → level yeterli mi?
6. `friendship` / `lust` (raw) → geriye dönük uyum için
7. `minPlayerEnergy` → enerji yeterli mi?

### 3.3 Locked Buton Mesajları

```
"Requires: Friendship Level 2"
"Requires: Lust Level 2"
"Requires Corruption 1"
"Already done today"
"Need 10 energy"
```

`showWhenLocked: false` olan action'lar tamamen gizlenir — kilit ikonu bile çıkmaz. Bu özellikle corruption/flag ile açılan gizli eylemler için kullanılır (Vince PC gibi).

---

## 4. Talk Sistemi — Level Entegrasyonu

### 4.1 Mevcut Durum

`brotherTalkLivingRoom.twee` gibi dosyalar raw friendship değerine göre tier seçiyor:
```
friendship < 40  → tier1
friendship 40–70 → tier2
friendship > 70  → tier3
```

### 4.2 Yeni Yapı

Mevcut raw tier sistemi kaldırılmaz. `friendshipLevel` ile **doğrudan eşleştirilir**:

```
friendshipLevel 1 → tier1
friendshipLevel 2 → tier2
friendshipLevel 3 → tier3
```

Yeni talk dosyaları doğrudan `$characters[charId].stats.friendshipLevel` kontrolü yapar. Eski dosyalar olduğu gibi çalışmaya devam eder — refactor gerekmez.

### 4.3 Kazanım Hızları

| Eylem | Friendship | Lust | Trust | Not |
|---|---|---|---|---|
| Normal talk (Lv.1) | +3–5 | 0 | +1 | Yavaş |
| Personal topic (Lv.2) | +6–8 | 0 | +3 | Orta |
| Deep topic (Lv.3) | +8–12 | +2 | +5 | Hızlı |
| Flirt (kabul) | +2 | +8–12 | +1 | Lust odaklı |
| Flirt (red) | −3 | +3 | −5 | Risk var |
| Compliment görünüm | +1 | +5–8 | 0 | Lust odaklı |
| Touch (kabul) | +3 | +15 | +2 | Yüksek lust |
| Touch (red) | −5 | +5 | −10 | Yüksek risk |

---

## 5. UI Güncellemeleri

### 5.1 charInfoCard — Level Gösterimi

Mevcut: `Love: 12 | Friendship: 45 | Lust: 0 | Trust: 60` (düz sayı)

Yeni:
```
Friendship  ████████░░  Lv.2 · 45/50    ← threshold karaktere göre değişir
Love        ██░░░░░░░░  Lv.1 · 12/30
Lust        ░░░░░░░░░░  Lv.1 · 0/55
Trust       ██████░░░░  Lv.1 · 60/100
```

Bar genişliği `stat / levelUpThresholds[stat]` oranıyla hesaplanır.

`CharacterWidgets.twee` → `charInfoCard` widget güncellenir. Accordion yapısı korunur.

### 5.2 Relations Modal

`assets/system/js/modal/relations.js` → bar render bölümü:

```
Şu an:   Friendship  [████████░░]  80 / 100
Yeni:    Friendship  [████████░░]  Lv.2 · 80/50   ← threshold'u gösterir
```

---

## 6. Örnek Action Tanımları

`storyJavaScript.js` → `setup.characterActions`:

```js
// HERKES İÇİN AYNI YAPI
// İçerik olmayan level'lar için passage placeholder kullanılır

dinerClerk: {   // Tom
  dinerRubys: [
    { id: "talk",  label: "Talk",  passage: "tomTalk", minPlayerEnergy: 5 },
    { id: "flirt", label: "Flirt", passage: "tomFlirt",
      requirements: { friendshipLevel: 2 }, tags: ["flirt"] },
    { id: "touch", label: "Touch", passage: "tomTouch",
      requirements: { lustLevel: 2 }, tags: ["adult"] },
  ]
},

lily: {
  sunsetPark: [
    { id: "talk",  label: "Talk",        passage: "lilyTalk", minPlayerEnergy: 5 },
    { id: "jog",   label: "Jog Together",passage: "lilyJog",
      requirements: { friendshipLevel: 2 } },
    { id: "flirt", label: "Flirt",       passage: "lilyFlirt",
      requirements: { friendshipLevel: 2 }, tags: ["flirt"] },
    { id: "touch", label: "Touch",       passage: "lilyTouch",
      requirements: { lustLevel: 2 }, tags: ["adult"] },
  ]
},

dinerManager: {   // Vince — özel eylemler flag+corruption ile açılır
  dinerRubys: [
    { id: "report", label: "Report to Vince", passage: "vinceReport" },
    { id: "pcSnoop", label: "Browse his PC",  passage: "vince_pc_snoop",
      requirements: { flag: "vince_pc_seen", corruption: 1 },
      showWhenLocked: false },
  ],
  dinerOffice: [
    { id: "pcSnoop", label: "Browse his PC",  passage: "vince_pc_snoop",
      requirements: { flag: "vince_pc_seen", corruption: 1 },
      showWhenLocked: false },
  ]
},

// AİLE — aynı sistem, içerik onlara göre yazılır
mother: {
  fhKitchen: [
    { id: "talk",  label: "Talk",  passage: "motherTalkKitchen", minPlayerEnergy: 5 },
    { id: "flirt", label: "Flirt", passage: "motherFlirt",
      requirements: { friendshipLevel: 3 }, tags: ["flirt"] },
  ]
}
```

---

## 7. Uygulama Sırası

### Faz 1 — Altyapı
1. `gainCharacterStat` widget → level-up mantığı (sıfırlama + level++ + notification)
2. Tüm karakter init dosyaları → `loveLevel: 1, friendshipLevel: 1, lustLevel: 1, trustLevel: 1` ekle
3. `showActions` macro → `friendshipLevel`, `lustLevel`, `loveLevel`, `trustLevel`, `corruption`, `willpower`, `flag` requirement desteği
4. `charInfoCard` widget → level + progress bar gösterimi
5. `relations.js` → level satırı

### Faz 2 — Action Tanımları
6. Tüm karakter init dosyalarına `maxLevels` ekle (varsayılan: hepsi 5)
7. `setup.characterActions` → tüm karakterlere flirt/touch placeholder'ları ekle
8. Locked mesajları güncelle

### Faz 3 — İçerik (karakter odaklı)
8. Diner NPC'leri için talk + flirt passage'ları
9. Lily flirt/touch
10. Aile interaction genişletmesi
11. Vince özel path

---

## 8. Kararlar

| Konu | Karar |
|---|---|
| Her NPC için aynı sistem mi? | **Evet — global, uniform** |
| Aile için lust level? | **Evet — sistem engel koymaz, içerik yazar** |
| Raw stat check'ler kaldırılsın mı? | **Hayır — geriye dönük uyum korunur** |
| Level tavanı var mı? | **Evet — maxLevels ile karakter başına tanımlanır, varsayılan 5, update'lerle güncellenir** |
| Level-up eşiği sabit mi? | **Hayır — `levelUpThresholds` ile karakter+stat bazında ayarlanır, varsayılan 100** |
| Level atlarken stat sıfırlanıyor mu? | **Evet — tam 0'a sıfırlanır, overflow taşımaz** |
| Level-up event tetiklenebilir mi? | **Evet — notification + ileride hook** |
| Gizli eylemler nasıl çalışır? | **showWhenLocked: false + flag/corruption gereksinimi** |
