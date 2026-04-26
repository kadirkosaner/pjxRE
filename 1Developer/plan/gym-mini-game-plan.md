# Gym Mini Game - Tam Uygulama Plani

Bu dokuman, gym lokasyonu icin gunluk bolge antrenmani + mini game sistemini mevcut proje altyapisina uygun sekilde tanimlar.

## 1) Hedef

- `gym` lokasyonunda her bolge icin gunluk antrenman aksiyonu olsun.
- Her antrenman mini game ile oynanabilsin.
- Mini game ayarlardan acilip kapatilabilsin.
- Mini game kapaliyken "hizli antrenman" fallback'i calissin.
- Denge bozulmadan stat progresyonu saglansin.

## 2) Mevcut Altyapiyla Uyum

Projedeki mevcut sistemler bu yapiyi destekliyor:

- Fizik statlari hazir: `upperBody`, `core`, `lowerBody`, `cardio`, `fitness`.
- Turetilmis stat mantigi var: `fitness = ortalama(4 fizik stati)` — `StatCalculator.twee`.
- Gunluk reset sistemi var: `$daily.*` alanlari gun degisince sifirlaniyor — `TimeWidgets.twee`.
- Aktivite buton sistemi var: `activityButton` ile `minStat`, `item`, `outfit`, daily lock.
- Stat/skill kazanim widget'lari var: `gainStat`, `gainSkill`, `recalculateStats`.
- Save migration sistemi var: `storyJavaScript.js` icerisinde `setup.CURRENT_SAVE_VERSION = 1`, `SaveMigration_v{N}.twee` pasajlari ile eski saveler guncelleniyor.
- Referans aktiviteler: `parkJog.twee` (cardio/lowerBody + running skill), `parkYoga.twee` (skill-only) — gym odul degerleri bu tempoya uygun olmali.

**Dikkat:** Asagidaki alanlar mevcut savelerde bulunmaz ve uyumluluk gerektiriyor:

- `gameSettings.gymMiniGameEnabled`
- `$daily.gymUpperDone`, `gymCoreDone`, `gymLowerDone`, `gymCardioDone`
- `$skills.physical.gym` (varsa)
- `$gymMG` gecici state objesi

## 3) Kapsam (MVP)

MVP'de 4 adet gym aktivitesi:

- Ust vucut antrenmani
- Core antrenmani
- Alt vucut antrenmani
- Cardio antrenmani

Her biri:

- Gunde 1 kez yapilabilir.
- Enerji kosulu ister.
- Sure ilerletir.
- Stres azaltir.
- Mini game sonucuna gore stat verir.

## 4) Ayarlar (Mini Game Ac/Kapa)

### Yeni ayar alani

- `gameSettings.gymMiniGameEnabled` (boolean)
- Varsayilan: `true`

### Davranis

- `true`: oyuncu mini game oynar, sonuc performansa gore degisir.
- `false`: mini game ekrani atlanir, standart "hizli antrenman" sonucu verilir.

### Kapali mod denge karari

- Mini game kapaliyken odul, `3/5 basari` kabul edilerek verilir (orta kazanim).
- Neden: oyuncu akistan kopmaz ama en iyi odul mini game performansina bagli kalir.

## 5) Gunluk Takip (Daily Flags)

`$daily` icine eklenecek alanlar:

- `gymUpperDone: false`
- `gymCoreDone: false`
- `gymLowerDone: false`
- `gymCardioDone: false`

Gunluk reset noktasinda (Time reset akisi) bu alanlar tekrar `false` olur.

## 6) Gym Ekran Akisi

`gym` pasajinda 4 aktivite butonu:

- Ust Vucut
- Core
- Alt Vucut
- Cardio

Butonlar `activityButton` sistemi ile:

- min enerji kontrolu
- daily lock
- tooltip hata mesaji

Gym ekraninda bilgilendirme satiri:

- `Mini Game: Acik` veya
- `Mini Game: Kapali (Hizli Antrenman)`

## 6b) Ilk Kez Tutorial Modali

### Tetiklenme

- Oyuncu **ilk kez herhangi bir gym antrenman butonuna** tikladiginda gosterilir.
- Kontrol: `<<if ndef $flags.gymMiniGameTutorialSeen>>` — ayri bir passage veya inline blok olarak uygulanabilir.
- Goruldukten sonra `<<set $flags.gymMiniGameTutorialSeen = true>>` ile kalici olarak kapatilir.

> **Migration notu:** `$flags` projedeki lazy-init patterni ile (`$flags = $flags || {}`) calisiyor. Bu nedenle eski savelerde `$flags.gymMiniGameTutorialSeen` dogal olarak `ndef` olur ve tutorial otomatik tetiklenir — ek migration kodu gerekmez.

### Icerik

Tutorial modali oyuncuya su bilgileri verir:

```
┌─────────────────────────────────────────┐
│  🏋 Gym Workout — How It Works          │
├─────────────────────────────────────────┤
│                                         │
│  Each workout has 4 quick rounds.       │
│                                         │
│  ⏱  A 5-second timer counts down.      │
│                                         │
│  Tap the icon that matches              │
│  the muscle group you're training!      │
│                                         │
│  💪 Upper Body  🔥 Core                │
│  🦵 Lower Body  💨 Cardio              │
│                                         │
│  ✅ Hit all 4 rounds → +2.0 skill      │
│  ❌ Miss or timeout → no skill gained  │
│      for that round                     │
│                                         │
│          [ Got it! Let's go! ]          │
└─────────────────────────────────────────┘
```

### Teknik Uygulama

Iki yontem:

- **A) Passage yontemi (onerilir):** `gymWorkoutTutorial` adli ayri bir passage. Action pasajlari `gymMiniGameTutorialSeen` kontrolunu yapar, gorulmemisse bu passage'a yonlendirir, bittikten sonra mini game'e devam eder.
- **B) Inline blok:** Her action pasajinda `<<if ndef $flags.gymMiniGameTutorialSeen>>` kontrolu + HTML modal blogu. Daha az temiz ama dosya sayisi az.

MVP icin A onerilir.

### Akis

```
[Gym Butonu Tiklanir]
        ↓
gymMiniGameTutorialSeen ndef?
    ↓ evet                  ↓ hayir
gymWorkoutTutorial      gymMiniGameStart
passage goster              (direkt)
        ↓
  "Got it!" buton
        ↓
$flags.gymMiniGameTutorialSeen = true
        ↓
gymMiniGameStart
```

---

## 7) Mini Game Tasarimi

### Konsept

Antrenman zone'una gore **o zone'u simgeleyen ikonu** bulmak. Hareket ismi ezber gerektirmiyor; gorsele odakli, sezgisel.

### Ekran Duzeni

```
┌──────────────────────────────────────┐
│  ████████████░░░░  4s               │  ← uste timer cubugu
│                                      │
│  "Focus on your upper body!"         │  ← aktif zone'a gore sabit prompt
│                                      │
│  [LB] [CRD] [UB] [CORE] [LB]       │  ← her zaman 5 buton
│                                      │     1 dogru (UB), 4 yanlis
│  Faz: 2 / 4   Skill: +0.5           │  ← altta ilerleme
└──────────────────────────────────────┘
```

### Oynanis Kurallari

- Oyuncu belirli bir zone icin antrenman yapiyor (ornegin Upper Body).
- Her fazda ekranin **ustunde 5 saniyelik timer** otomatik baslar.
- Altta **her zaman 5 buton** rastgele siraya dizilir:
  - **1 tanesi dogru** (aktif zone'un ikonu).
  - **4 tanesi yanlis** (diger zone ikonlarindan tekrarla doldurulur).
- Oyuncu dogru zone ikonuna tiklarsa: faz kazanilir, skill eklenir, **otomatik** sonraki faza gecilir.
- Yanlis ikonuna tiklanirsa veya **timer 0'a duserse**: faz kaybedilir, **otomatik** sonraki faza gecilir.
- Her fazda timer sifirllanir ve yeniden baslar; oyuncu hicbir "Next" butonuna basmaz.

### Zone → Ikon Eslemesi

| Zone | SVG Ikon | Aciklama |
|------|----------|----------|
| Upper Body | Dumbbell (barbell) | ust vucut / omuz |
| Core | Bullseye (hedef) | karın / merkez guc |
| Lower Body | Legs (iki bacak) | bacak / alt vucut |
| Cardio | Heartbeat (ECG cizgisi) | nefes / kalp ritmi |

### Yanlis Secenek Havuzu (sabit 4 yanlis)

Her fazda yanlis havuzu: **aktif zone disindaki 3 zone ikonu + 1 tekrar** (toplamda 4 yanlis, 5 buton).

Ornekler:
- Upper Body aktifken: dogru `UB` + yanlis 4 = `[LB] [CRD] [UB] [CORE] [LB]`
- Cardio aktifken: dogru `CRD` + yanlis 4 = `[UB] [CRD] [CORE] [LB] [UB]`

**Tekrar secimi:** 3 zone yetmediginde (3 yanlis zone var, 4 yanlis gerekli) en az kullanilan zone tekrarlanir. Bu sayede her fazda tamamen farkli bir siralamayla 5 buton garantilenir.

### Faz Sayisi ve Skill Modeli

Maksimum skill kazanimi: **2.0**. Iki secenek:

| Secenek | Faz sayisi | Faz basina skill | Max toplam |
|---------|-----------|-----------------|------------|
| **A (onerilir)** | 4 faz | 0.5 | 2.0 |
| B | 8 faz | 0.25 | 2.0 |

**MVP icin 4 faz (A) onerilir** — oyun suresi kisa tutuluyor, her dogru secim hissedilir agirlik tasiyor.

## 8) Odul ve Denge Modeli

### Skill odulu (faz bazli, kademeli)

Her dogru faz anlık `gainSkill` cagiriyor; oyun bitiminde toplam otomatik hesaplanmis oluyor.

| Tamamlanan faz | Toplam skill (4 faz modeli) |
|---------------|---------------------------|
| 4 / 4 | +2.0 (tam) |
| 3 / 4 | +1.5 |
| 2 / 4 | +1.0 |
| 1 / 4 | +0.5 |
| 0 / 4 | +0.0 |

### Stat odulu (tamamlanan faza gore)

Stat odulu, **tamamlanan faz oranina** gore ölceklenir (kesintili 3 kademe):

| Oran | Ana stat | Destek stat |
|------|----------|-------------|
| 3-4 / 4 (tam/iyi) | `+1.0` | `+0.5` |
| 1-2 / 4 (orta) | `+0.5` | `+0.25` |
| 0 / 4 (hic) | `+0.1` | — |

### Bolge -> Stat eslemesi

- Ust vucut: Ana `upperBody`, Destek `core`
- Core: Ana `core`, Destek `lowerBody`
- Alt vucut: Ana `lowerBody`, Destek `cardio`
- Cardio: Ana `cardio`, Destek `lowerBody`

### Kapali mod fallback dengesi

Mini game kapali oldugunda: **2 faz tamamlanmis gibi** kabul edilir.

- Skill: `+1.0`
- Stat: orta kademe (`+0.5` / `+0.25`)

### Sure ve maliyet

- Sure: 45 dakika (park jog/yoga ile uyumlu)
- Enerji: `-15` (cardio `-18` opsiyonel)
- Stres: `-10` / `-15`

## 9) Skill Stratejisi

Iki alternatif:

- A) Mevcut skillleri kullan:
  - Ust/Core/Alt icin `physical` altinda ilgili mevcut skilllerden paylastir.
  - Cardio icin `running` kullan (`$skills.physical.running` — zaten var).
- B) Yeni skill ekle:
  - `skills.physical.gym = 0`
  - Tum gym antrenmanlari buraya isler.

MVP icin A daha hizli; uzun vadede B daha temiz raporlama verir.

**B secilirse save uyumu:** `charPlayer.twee` init'ine eklenmeli **ve** `SaveMigration_v2.twee` icinde eski savelere `<<set $skills.physical.gym = 0>>` yazilmali. Yoksa `gainSkill` widget undefined key'e yazmaya calisabilir.

## 10) Teknik Akis (Yuksek Seviye)

Her gym aktivitesi icin ortak pipeline:

1. Enerji kontrolu (`requireMinEnergy`)
2. Daily lock kontrolu
3. `ndef $flags.gymMiniGameTutorialSeen` kontrolu → `true` ise `gymWorkoutTutorial`'a git, bitince devam
4. `gameSettings.gymMiniGameEnabled` kontrolu
5. Aciksa `gymMiniGameStart`'a git (`$gymMG` zone set edilir)
6. Kapaliysa direkt orta sonuc uygula (2 faz = skill +1.0, stat orta)
7. `advanceTime`, `loseStat`, `gainStat/gainSkill`, `recalculateStats`, `flushNotifications`
8. Sonuc metni + finish butonu

## 11) Dosya Plani

Asagidaki yapida ilerlemek onerilir:

- Gym lokasyon (mevcut — dugme eklenecek):
  - `passages/2 - Locations/downTown/skyline/towerA/recreationCenter/gym.twee`
- Gym action pasajlari (yeni):
  - `passages/4 - Actions/downTown/recreationCenter/gym/gymUpper.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/gymCore.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/gymLower.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/gymCardio.twee`
- Mini game pasajlari (yeni):
  - `passages/4 - Actions/downTown/recreationCenter/gym/minigame/gymWorkoutTutorial.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/minigame/gymMiniGameStart.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/minigame/gymMiniGameRound.twee`
  - `passages/4 - Actions/downTown/recreationCenter/gym/minigame/gymMiniGameResult.twee`
- Daily init/reset (mevcut — satirlar eklenecek):
  - `passages/0 - System/Init/variablesBase.twee` — `$daily.gymUpperDone` vb. eklenir
  - `passages/0 - System/Widgets/TimeWidgets.twee` — reset satirlari eklenir
- Settings init (mevcut — satir eklenecek):
  - `passages/0 - System/Init/variablesSettings.twee` — `$gameSettings.gymMiniGameEnabled: true` eklenir
- Settings modal (mevcut — toggle UI eklenecek):
  - `assets/system/js/modal/` altindaki settings dosyasi
- Karakter init (mevcut — skill B secilirse):
  - `passages/0 - System/Init/characters/charPlayer.twee` — `$skills.physical.gym: 0` eklenir
- **Save migration (mevcut sisteme eklenir):**
  - `passages/0 - System/Migrations/SaveMigration_v2.twee` — yeni dosya olusturulur
  - `passages/0 - System/storyJavaScript.js` — `setup.CURRENT_SAVE_VERSION = 2` guncellenir

## 12) Veri Modeli (Mini Game State)

Gecici state alanlari (`$gymMG` — sadece aktif mini game sirasinda yasar, migration gerekmez):

- `$gymMG = {`
  - `zone: "upper|core|lower|cardio",`
  - `phase: 0,`         ← mevcut faz (0'dan baslar)
  - `totalPhases: 4,`   ← 4 veya 8 (ayara gore)
  - `skillPerPhase: 0.5,` ← 4 faz → 0.5, 8 faz → 0.25
  - `correct: 0,`       ← tamamlanan faz sayisi
  - `timerDuration: 5,` ← saniye (sabit)
  - `choices: [],`      ← bu fazin 5 zone ikon id'si (1 dogru + 4 yanlis, karistirilmis)
  - `correctChoice: ""` ← aktif zone'un ikon id'si (ornegin "upper")
- `}`

### Faz akisi (passage seviyesi)

1. `gymMiniGameStart` — `$gymMG` init, zone set, ilk faz uret, `gymMiniGameRound`'a git
2. `gymMiniGameRound` — timer JS ile baslatilir, secenekler render edilir
   - Dogru secim: `$gymMG.correct += 1`, `gainSkill skillPerPhase`, sonraki faza
   - Yanlis secim veya timer 0: sonraki faza (skill kazanilmaz)
   - `phase === totalPhases` ise `gymMiniGameResult`'a git
3. `gymMiniGameResult` — toplam `correct` oranina gore stat odulu hesaplanir, `recalculateStats`, `flushNotifications`

### Timer mekanigi

SugarCube'da 5 saniyelik timer icin onerilen yaklasim:

- `PassageReady` ya da inline `<<script>>` ile `setTimeout` / `setInterval` kullan.
- Timer bitince `Engine.play("gymMiniGameRound")` cagrisi yap (timeout secimi).
- Buton tiklamasi oncesinde timer temizlenir (`clearTimeout`).

**Eski save uyumu:** `$gymMG` gecici oldugu icin action pasajlari baslangicinda `<<set $gymMG = {...}>>` ile sifirla; eski savede alan olmamasi sorun olusturmaz.

**`SaveMigration_v2.twee` icerecekleri:**

```twee
<<if $saveVersion lt 2>>
  <<if not $gameSettings.gymMiniGameEnabled>>
    <<set $gameSettings.gymMiniGameEnabled = true>>
  <</if>>
  <<if ndef $daily.gymUpperDone>>
    <<set $daily.gymUpperDone = false>>
    <<set $daily.gymCoreDone  = false>>
    <<set $daily.gymLowerDone = false>>
    <<set $daily.gymCardioDone = false>>
  <</if>>
  /* Skill B secildiyse: */
  <<if ndef $skills.physical.gym>>
    <<set $skills.physical.gym = 0>>
  <</if>>
<</if>>
```

## 13) UI/UX Notlari

### Round ekrani

- **Uste timer**: Geri sayim cubugu veya `5 — 4 — 3 — 2 — 1` sayisal gosterim.
  - Kirmizi renk gecisi son 2 saniyede onerilen.
- **Butonlar**: Sadece zone ikonu (SVG) + altta kisa etiket.
  - Buton sayisi: **her zaman 5** (1 dogru + 4 yanlis). Degismez.
  - 3 yanlis zone oldugu icin 1 zone ikonu fazladan tekrarlanir; bu normaldir.
- **Altta ilerleme satiri**: `Faz: 2 / 4   |   Skill: +1.0`

### Geri bildirim (secim sonrasi)

- Dogru: kisa yesil flash + "Good focus!" metni, hemen sonraki faza gec.
- Yanlis: kisa kirmizi flash + "Wrong zone!" metni, sonraki faza gec.
- Timeout: kirmizi flash + "Too slow!", sonraki faza gec.
- Flash suresi: ~500ms (oyuncuyu bloklamadan).

### Sonuc ekrani

- Tamamlanan faz ozeti: `3 / 4 faz tamamlandi`
- Kazanilan skill: `+1.5`
- Kazanilan statlar: `upperBody +0.5, core +0.25`
- Harcanan enerji ve gecen sure

## 14) Balancing Kurallari (Opsiyonel Gelistirme)

- Ayni gun 2+ gym bolgesi yapilirsa ikinci aktivitede %10 verim dususu.
- Cok dusuk enerjiyle antrenman denemesinde basari olasiligi azaltilabilir.
- Haftalik rutine bonus:
  - Haftada 4+ gym gunu -> kucuk `confidence` bonusu.

MVP icin bu kurallar ertelenebilir.

## 15) Test Plani

Minimum test senaryolari:

- Mini game acik / kapali iki mod da calisiyor mu?
- Her bolge gunde 1 kere kilitleniyor mu?
- Gun degisince kilitler sifirlaniyor mu?
- 5/5, 3/5, 0/5 sonuclarinda dogru stat odulu veriliyor mu?
- Enerji 0'a dusme ve collapse akisiyla cakisiyor mu?
- Bildirimler (stat pop-up / tooltip) dogru mu?

**Tutorial testleri:**

- `$flags.gymMiniGameTutorialSeen` olmayan save'de ilk gym butonu tiklaninca tutorial aciliyor mu?
- "Got it!" sonrasi flag set edilip mini game'e geciliyor mu?
- Ikinci antrenman denemesinde tutorial tekrar cikmiyor mu?
- Mini game kapali modda da tutorial gosteriliyor mu (kapali mod flag'dan bagimsiz)?

**Eski save uyumu testleri:**

- `saveVersion = 0` veya `1` olan bir save yuklendikten sonra migration calisiyor mu?
- Migration sonrasi `gameSettings.gymMiniGameEnabled` dogru sekilde `true` mi?
- Migration sonrasi `$daily.gymUpperDone` vb. `false` olarak var mi?
- Eski savede `$skills.physical.gym` yokken gym antrenmani yapilinca hata olmadi mi?
- Lily gym quest orta safhada devam eden eski save'de gym action'lari cakisiyor mu?

## 16) Fazlama (Roadmap)

- Faz 1: Gym bolge aktiviteleri + mini game toggle + temel odul sistemi
- Faz 2: Hareket havuzunu genisletme, SVG ikon seti, bolgeye ozel varyasyon metinleri
- Faz 3: Haftalik program, NPC gym partner eventleri, quest baglantilari

## 17) Kisa Uygulama Ozet Kararlari

- Mini game toggle: **evet**
- Varsayilan: **acik**
- Kapali mod odul: **2 faz tamamlanmis = skill +1.0, stat orta kademe**
- Gunluk kilit: **bolge bazli**
- Fitness dengesi: **mevcut park/yoga tempoyla uyumlu**
- **Faz modeli: 4 faz × 0.5 skill = max 2.0 skill**
- Timer: **5 saniye / faz**
- Buton sayisi: **her zaman 5** (1 dogru + 4 yanlis, degismez)
- Save migration: **mevcut sisteme SaveMigration_v2 eklenir** (`CURRENT_SAVE_VERSION = 2`)
- Skill stratejisi: **MVP icin A (mevcut skillsler)**, gerekirse B sonra eklenir
- Eski save guard: **her yeni `$gameSettings` / `$daily` anahtarinda `ndef` kontrolu**

