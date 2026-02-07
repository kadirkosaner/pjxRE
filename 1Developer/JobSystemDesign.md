# Job System – Global Tasarım

> Yapı global; şu an sadece **ruby_dishwasher** tanımlı. İşe geliş saatleri, minimum haftalık süre, haftalık maaş, kesintiler, tier/deneyim ve vardiya mini-event’leri bu dokümanda tanımlı.

---

## 1. JOB DEFINITION SCHEMA

Her iş `setup.jobs[jobId]` altında aşağıdaki yapıda. Skill isimleri `statsAndSkillsForJobs.md` ve economy cheatsheet ile uyumlu.

**Önemli:** Her işin kendi **tier 1–6** ilerlemesi vardır. Tier atlama **workExperience** (jobExperience) ile yapılır. **Terfi (promotesTo)** ayrıdır: başka pozisyona geçiş; o da workExperience + diğer şartlar ister.

### 1.1 Ana şema

```js
{
    id: "ruby_dishwasher",
    name: "Dishwasher",
    workplace: "rubysDiner",
    workplaceName: "Ruby's Diner",
    position: "Dishwasher",

    // --- Tier 1–6 (bu işte kendi ilerlemesi) ---
    tierMax: 6,
    tierExperienceRequirements: [0, 50, 120, 200, 320, 500],
    wageByTier: [7, 8, 9, 10, 11, 12],
    xpPerHour: 5,                    // vardiya başı XP = xpPerHour * shiftHours (4h = 20 XP → tier 2 ≈ 3 vardiya)

    // --- Maaş & vardiya ---
    shiftHoursOptions: [2, 4, 6, 8],
    tips: false,
    maxShiftsPerDay: 1,              // günde en fazla kaç vardiya (1 = günde 1 vardiya)

    // --- Çalışma saatleri (gerçek saat bazlı) ---
    schedule: {
        open: 6,                    // işe gelebileceği en erken saat (06:00)
        close: 22,   // shift end by 22:00; filter: currentHour + shiftHours <= close (22:00’de bitiş düşünülür)
        /* Opsiyonel: belirli vardiya slotları tanımlanabilir:
        slots: [
            { start: 6, end: 10 },   // sabah
            { start: 10, end: 14 },
            { start: 14, end: 18 },
            { start: 18, end: 22 }
        ]
        */
    },

    // --- Minimum zorunluluk (haftalık) ---
    minHoursPerWeek: 8,
    minHoursWarningsBeforeFire: 1,   // 1. hafta uyarı, 2. hafta üst üste yapmazsa iş kaybı

    // --- Vardiya maliyeti (4 saat referans; diğer süreler oranlanır) ---
    statCostsPer4Hours: {
        energy: -50,                 // ağır fiziksel (bulaşıkçı)
        mood: -15,
        stress: 20,
        hygiene: -30
    },

    // --- Skill kazanımı (4 saat referans; süreyle oranlanır) ---
    skillGainsPer4Hours: [
        { category: "practical", skill: "cleaning", amount: 3 },
        { category: "practical", skill: "cooking", amount: 1 }
    ],

    // --- İşe başvuru / işe başlama gereksinimleri ---
    requirements: {
        looks: 0,                   // min $looks (0 = yok)
        skills: {},                 // örn. { "practical.cleaning": 5 }
        friendship: {},             // örn. { "manager_vince": 20 } (ileride)
        flags: []                   // gerekli flag’ler, örn. ["find_job_done"]
    },

    // --- Vardiya başlatmadan önce kontrol (bazı işlerde; dishwasher'da kapalı) ---
    shiftStart: {
        clothingCheck: false,   // true veya { dressCode: "id", minLooks: 35 }
        statCheck: null         // null veya { energy: 25, hygiene: 40, looks: 35 }
    },

    // --- Terfi (başka pozisyona geçiş); her terfi workExperience ister ---
    promotesTo: "ruby_waitress",
    promotionReqs: {
        daysWorked: 14,
        jobExperience: 100,
        looks: 35,
        skills: { "social.conversation": 10 },
        scenePassage: null
    }
}
```

### 1.2 Tier ilerlemesi (aynı iş içinde)

- Oyuncunun bu işteki **mevcut tier** `$job.tier` (1–6) ile tutulur.
- Her vardiya sonunda `$jobState.jobExperience` artar. `jobExperience >= tierExperienceRequirements[tier]` olunca tier yükselir (örn. 50 XP → tier 2).
- Maaş: `wageByTier[$job.tier - 1]`; tanımda yoksa `wagePerHour`.

### 1.3 Kıyafet ve stat kontrolü (altyapı; dishwasher'da kullanılmıyor)

Bazı işler (garson, barista) vardiya başlamadan önce kontrol ister:

- **shiftStart.clothingCheck:** `false` = yok. `true` veya `{ dressCode: "id", minLooks: 35 }` = kıyafet/looks kontrolü.
- **shiftStart.statCheck:** `null` = yok. `{ energy: 25, hygiene: 40, looks: 35 }` = vardiya başlamak için min stat; sağlanmazsa vardiya başlamaz.

---

### Bahşişli işler (ileride garson/barista)

`tips: true` olan işlerde ek alan:

```js
tipFormula: {
    baseMin: 5,
    baseMax: 10,
    cap: 19,
    // formül: base + charisma/20 + looks/25 (garson); cap’e kadar
    charismaDivisor: 20,
    looksDivisor: 25
}
```

Gerçekçilik: Sadece müşteri yüzlü pozisyonlarda `tips: true`. Bulaşıkçı, depo vb. bahşiş yok.

---

## 2. OYUNCU JOB STATE ($job, $jobState)

Tek iş kuralı: aynı anda yalnızca bir iş.

### $job (mevcut iş)

```js
$job = {
    id: null,           // "ruby_dishwasher" veya null (işsiz)
    tier: 1,            // bu işte mevcut tier (1–6); workExperience ile yükselir
    startedOn: null     // { year, month, day } işe başlama tarihi (terfi/kesinti için)
}
```

### $jobState (haftalık + deneyim takibi)

```js
$jobState = {
    hoursThisWeek: 0,       // pazartesi 00:00’dan beri çalışılan saat (haftalık sıfırlanır)
    totalDaysWorked: 0,     // bu işte toplam çalışılan gün sayısı (terfi için)
    jobExperience: 0,      // bu işte kazanılan toplam XP (terfi / tier için)
    weeklyEarnings: 0,     // bu hafta kazanılan brüt (maaş + bahşiş); payday’da gösterim için
    weeklyDeductions: 0,   // bu hafta kesintiler (kırık tabak, ceza vb.)
    lastPayWeek: null,
    minHoursWarningCount: 0   // min saat uyarısı sayısı; üst üste minHoursWarningsBeforeFire = iş kaybı
}
```

- Vardiya başlatmadan `shiftsToday < job.maxShiftsPerDay` kontrolü. Haftalık sıfırlama: `advanceDay` veya özel “hafta başı” mantığında `hoursThisWeek` sıfırlanır; `totalDaysWorked` ve `jobExperience` kalıcı.
- **weeklyEarnings:** Her vardiya sonunda `weeklyEarnings += hoursWorked * wageByTier[$job.tier - 1]` (+ varsa bahşiş). Hafta ortasında tier atlarsa her vardiya kendi tier maaşıyla hesaplanıp eklenir; payday'da yeniden hesaplanmaz.

---

## 3. İŞE GELİŞ SAATLERİ (Gerçek saat bazlı)

- Oyuncu iş lokasyonunda (örn. Ruby’s Diner) “Çalış” seçtiğinde:
  - Şu anki saat `$timeSys.hour` job’ın `schedule.open`–`schedule.close` aralığında mı kontrol et.
  - **Shift seçimi:** Sadece `currentHour + shiftHours <= schedule.close` şartını sağlayan vardiya süreleri gösterilir; sığmayanlar gösterilmez (izin verilmez, kısaltma yok). Örn. close=22, 18:00'de 8h seçeneği yok (18+8=26); sadece 2h ve 4h.
- **Minimum süre (minHoursPerWeek):** Hafta sonunda (veya hafta başı kontrolünde) `hoursThisWeek < minHoursPerWeek` ise:
  - **v0.1 yumuşak:** İlk seferde sadece uyarı, `$jobState.minHoursWarningCount++`. Üst üste 2. hafta da yapmazsa (minHoursWarningsBeforeFire dolunca) iş kaybı. Yeni haftada yeterince çalışırsa warningCount sıfırlanabilir (opsiyonel).

---

## 4. JOB EXPERIENCE & TIER ATLAMA

- Her vardiya sonunda **job experience** eklenir: `xp = job.xpPerHour * shiftHours` → `$jobState.jobExperience += xp`. Örn. xpPerHour: 5, 4 saat = 20 XP; tier 2 (50 XP) ≈ 2,5 vardiya (~3 gün).
- **Tier 1–6 (aynı iş içinde):** Her işin kendi tier ilerlemesi vardır. `$jobState.jobExperience >= job.tierExperienceRequirements[tier]` olduğunda `$job.tier` bir artırılır (max 6). Tier atlama için isteğe bağlı özel sahne eklenebilir.
- **Terfi (promotesTo):** Başka pozisyona geçiş (örn. dishwasher → waitress). Şartlar: `promotionReqs` (daysWorked, jobExperience, looks, skills). Terfi için `promotionReqs.scenePassage` varsa sahne oynatılır; sonunda `$job.id = promotesTo`, `$job.tier = 1`, jobExperience/daysWorked sıfırlanır veya yeni pozisyonda devam eder.
- Her iki durumda da **workExperience (jobExperience)** zorunludur: tier atlamak da terfi etmek de deneyim ister.

---

## 5. HAFTALIK MAAŞ & KESİNTİLER (Focus)

### Haftalık sıfırlama ve ödeme zamanlaması

- **Pay day = reset day = minHours kontrolü:** Hepsi aynı gün yapılmalı. Öneri: **Pazartesi sabahı (weekday=1)** — sıra: (1) minHours kontrolü → (2) maaş öde → (3) hoursThisWeek sıfırla.
- **payDayWeekday: 1** (Monday; `$timeSys.weekday` 0=Sunday … 6=Saturday). `advanceDay` sonrası `weekday === 1` olduğunda bu işlemler tetiklenir.
- **Hesaplanan haftalık brüt:** `weeklyEarnings` her vardiya sonunda güncellenir: `weeklyEarnings += hoursWorked * wageByTier[$job.tier - 1]` (+ varsa bahşiş). Hafta ortasında tier atlarsa, her vardiya kendi tier'indeki maaşla hesaplanıp eklenir; payday'da yeniden hesaplanmaz.
- **Kesintiler (weeklyDeductions):**
  - Vardiya **mini-event’leri** sırasında oluşan cezalar (kırık tabak, gecikme vb.) anlık değil, **bu haftaki toplam** olarak tutulur; maaş gününde brütten düşülür.
  - İleride: vergi, kıyafet zorunluluğu cezası vb. eklenebilir.
- **Net ödeme:**  
  `netPay = weeklyEarnings - weeklyDeductions` (minimum 0). Bu tutar `$cashBalance` veya `$moneyEarn`’e eklenir.
- **Focus (netlik):** Oyuncuya maaş gününde şu ayrım gösterilmeli:
  - Brüt maaş (saat × ücret)
  - Bahşiş (varsa)
  - Toplam kesintiler (liste veya tek satır)
  - Net alınan tutar  
  Böylece “neden bu kadar düştü?” sorusu cevaplanır; mini-event cezaları haftalık maaştan düşüldüğü için tek yerde toplanmış olur.

---

## 6. VARDİYA İÇİ MİNİ-EVENT’LER

- Vardiya sırasında (2/4/6/8 saatte bir veya birkaç kez) rastgele veya koşullu **mini-event** tetiklenebilir:
  - Örnek: “Tabağı düşürdün, kesinti -$5” → `$jobState.weeklyDeductions += 5`
  - Örnek: “Müdür memnun, bonus +$10” → ayrı bir `weeklyBonuses` veya doğrudan `weeklyEarnings` artışı
- Bu event’ler ayrı passage’lar veya tek bir “shift event” widget’ından seçilebilir; job id’ye göre farklı event havuzları kullanılır.
- Kesintilerin hepsi haftalık maaştan düşüleceği için, vardiya sonunda sadece state güncellenir; nakit anında eksilmez.

---

## 7. ÖZET: ŞU AN SADECE DISHWASHING

- **setup.jobs.ruby_dishwasher:** Tier 1–6 (tierMax, tierExperienceRequirements, wageByTier), `tips: false`, ağır fiziksel stat maliyeti, cleaning + cooking skill gain. `shiftStart: { clothingCheck: false, statCheck: null }` (kıyafet/stat kontrolü yok).
- **$job / $jobState:** Init’te tanımlı; find_job quest bittiğinde `$job.id = "ruby_dishwasher"`, `$job.tier = 1` atanır.
- İşe geliş: `schedule.open/close` (örn. 6–22); vardiya 2/4/6/8 saat seçilebilir; `minHoursPerWeek: 8`.
- Maaş: Haftalık ödeme; kesintiler `weeklyDeductions` ile haftalık maaştan düşülür; özet ekranda brüt / bahşiş / kesinti / net gösterilir.
- Terfi: `promotesTo: "ruby_waitress"`, `promotionReqs` (daysWorked, jobExperience, looks, skills); terfi sahnesi ileride eklenecek.

Bu yapı global kalır; ileride yeni işler ve yeni pozisyonlar aynı şemayla eklenir.

---

## 8. NOTLAR (v0.1 kararları)

- **Haftalık sıfırlama:** Pazartesi (weekday=1). Sıra: minHours kontrol → maaş öde → hoursThisWeek sıfırla. Pay day ve reset aynı gün.
- **Hafta/gün takibi:** `$timeSys.weekday` var (0=Sunday … 6=Saturday); `advanceDay` içinde güncelleniyor. `payDayWeekday: 1` (Monday).
- **minHoursPerWeek:** v0.1’de yumuşak: `minHoursWarningsBeforeFire: 1` → 1. hafta uyarı, 2. hafta üst üste yapmazsa iş kaybı. `$jobState.minHoursWarningCount` takip edilir.
- **XP formülü:** Job tanımında `xpPerHour: 5`. Vardiya başı `xp = xpPerHour * shiftHours` (4h = 20 XP). Tier 2 (50 XP) ≈ 2,5 vardiya (~3 gün).
- **Mini-event’ler:** v0.1 scope’unda değil; basit “çalıştın, maaş aldın”. v0.2’de vardiya içi event’ler ve weeklyDeductions.
- **Günde kaç vardiya:** Job’ta `maxShiftsPerDay: 1`. `$jobState.shiftsToday` her gün sıfırlanır; vardiya başlatmadan `shiftsToday < maxShiftsPerDay` kontrolü. Günde 1 vardiya limiti. **schedule.close:** Only show shift options where currentHour + shiftHours <= close.
