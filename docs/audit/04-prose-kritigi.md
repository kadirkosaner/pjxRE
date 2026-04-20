# Prose Kritiği — LLM İmzalı Metin Denetimi

**Amaç:** Oyunun anlatı (narrative) ve diyalog (dialog) metinlerinde AI-generated prose kalıplarının tespiti. Bu audit **sistem/widget/init/database dosyalarını kapsamaz** — sadece oyuncuya okunan metin.

**Tarama kapsamı:**
- `passages/1 - Prologue/` — 19 dosya
- `passages/2 - Locations/` — location açıklamaları
- `passages/3- Interactions/` — tüm dialog dosyaları (~66 dosya)
- `passages/4 - Actions/` — aktivite/event narrative (~112 dosya)
- `passages/5 - QuestSystem/Quests/` — quest scene'leri (`System/` hariç)
- `passages/7 - Work/` — shift narrative

**Hariç tutulanlar:** `0 - System/*`, `variables*.twee`, `*Database*.twee`, `*Widgets*.twee`, `storyJavaScript.js`, `5 - QuestSystem/System/*`.

---

## 🔴 Özet Bulgu

| Pattern | Toplam match | Dosya sayısı |
|---------|--------------|--------------|
| Em-dash (`—`) | **948** | 140 dosya |
| "For a moment" opener | 8 | 8 dosya |
| Body clichés (every muscle/edges of vision/vb.) | 7 | 4 dosya |
| "All at once" / "Something stirs" | 9 | 9 dosya |
| Antithesis tik ("not quite X", "less Y almost Z") | 11 | 9 dosya |
| Abstract reflection ("that ability", "your foundation") | 4 | 2 dosya |
| Meditation voice ("breathe in, breathe out") | 2 | 2 dosya |

**Kirlenme dağılımı:** Prologue ve Family Dialog Databases **açık ara en kirli** kısımlar. Ruby's Diner NPC dialogları daha temiz. Action/event dosyaları karışık.

---

## 1. Em-Dash Abartısı (Pattern #1) — 948 eşleşme

Em-dash LLM'in en belirgin imzası. Bir insan yazarı tüm romanda 20-50 tane kullanır. Burada 140 dosyada **948** tane var.

### En kötü dosyalar (em-dash sayısı):

| # | Dosya | Count |
|---|-------|-------|
| 1 | `3- Interactions/FamilyHouse/Father/talkDatabase/FatherTopicsPostWorkLevel2.twee` | **71** |
| 2 | `3- Interactions/FamilyHouse/Brother/talkDatabase/BrotherTopicsVacationLevel1.twee` | **65** |
| 3 | `3- Interactions/FamilyHouse/Brother/talkDatabase/BrotherTopicsVacationLevel2.twee` | **65** |
| 4 | `3- Interactions/FamilyHouse/Father/talkDatabase/FatherTopicsPreWorkLevel1.twee` | **64** |
| 5 | `3- Interactions/FamilyHouse/Mother/talkDatabase/MotherTopicsLevel2.twee` | **63** |
| 6 | `3- Interactions/FamilyHouse/Father/talkDatabase/FatherTopicsPostWorkLevel1.twee` | **54** |
| 7 | `3- Interactions/FamilyHouse/Brother/talkDatabase/BrotherTopicsSchoolLevel2.twee` | **40** |
| 8 | `3- Interactions/FamilyHouse/Brother/talkDatabase/BrotherTopicsSchoolLevel1.twee` | **31** |
| 9 | `3- Interactions/FamilyHouse/Mother/talkDatabase/MotherTopicsLevel1.twee` | **28** |
| 10 | `1 - Prologue/9 - adolescentYears.twee` | **10** |

**Önemli nuance:** Family dialog database dosyaları uzun (2000+ satır, onlarca topic). Mutlak sayı yüksek ama **yoğunluk** nispeten düşük. Asıl sorun Prologue — 250 satırlık dosyada 10 em-dash = agresif yoğunluk.

### Prologue em-dash yoğunluk skoru:

| Dosya | Em-dash | ~Satır | Yoğunluk |
|-------|---------|--------|----------|
| `9 - adolescentYears.twee` | 10 | 240 | 🔴 Çok yüksek |
| `8 - formativeYears.twee` | 9 | 180 | 🔴 Çok yüksek |
| `7 - childhoodYears.twee` | 6 | 150 | 🟠 Yüksek |
| `12 - newHome.twee` | 5 | 120 | 🟠 Yüksek |
| `13 - prologueBedroom.twee` | 5 | 100 | 🟠 Yüksek |
| `11 - newhomeEnter.twee` | 5 | 150 | 🟡 Orta |
| `10 - comingofAge.twee` | 16 | 220 | 🔴 En yüksek |
| `5 - prologuePage.twee` | 4 | 80 | 🟡 Orta |

### Verbatim örnekler — em-dash ritmi

**`1 - Prologue/9 - adolescentYears.twee:235`** (tek paragrafta 2 em-dash + 3 "That X" anaforu):
> "That ability to form deep bonds, to be vulnerable with others**—** you learned it by stepping away from family, by finding connection elsewhere. It took courage to create your own emotional world, separate from your parents. That independence, that strength to define yourself**—**it became your foundation."

**`1 - Prologue/6 - earlyYears.twee:117`** (aynı kalıp):
> "Building blocks, puzzles, drawing**—**hours would pass in your quiet corner. Mom would check on you... That patience, that ability to be alone without feeling lonely**—**it became your strength."

Bu iki dosya **aynı template**'tan çıkmış. "That X, that Y—it became your Z" — birebir LLM refrain.

**`1 - Prologue/5 - prologuePage.twee:27`** (em-dash + triple list):
> "An old song plays on the radio**—**something familiar but you can't place it."

**`1 - Prologue/12 - newHome.twee:34`** (virgüllü triple + em-dash):
> "Familiar furniture**—**the couch, coffee table, TV**—**arranged in this new space."

**`1 - Prologue/18 - nextDayMorning.twee:28`** (em-dash + antithesis tik):
> "The room looks different in daylight**—**less intimidating, almost welcoming."

**`5 - QuestSystem/Quests/findJob/quest_find_job_ruby_diner_manager_room.twee:17`** (em-dash + "not quite"):
> "He looks you over**—**not quite professional, a bit too long**—**then smiles."

**`5 - QuestSystem/Quests/vinceDay3/dinerWork_event_vinceInspection_day3.twee:62`**:
> "His eyes move over you **—** fast, but not quite flat."

→ Son 2 örnek aynı karakter beta'sı (somewhat-sketchy-man). Aynı ritim, aynı "not quite" tik. Tek elden çıktığı belli.

---

## 2. Template Scene-Opener (Pattern #2) — 8 eşleşme

LLM'in sahne geçişi boilerplate'i. İkisinin arasındaki mesafe bile template kokar.

| Dosya | Satır | Metin |
|-------|-------|-------|
| `1 - Prologue/18 - nextDayMorning.twee` | 20 | "For a moment, you forget where you are. Then you remember." |
| `1 - Prologue/13 - prologueBedroom.twee` | 22 | "For a moment, you just stand there. Taking it in." |
| `1 - Prologue/17 - prologueNightEnd.twee` | 130 | "For a moment, you just sit there." |
| `4 - Actions/maplewood/sunsetPark/parkWalk.twee` | 37 | "For a moment, your eyes drift upward to two birds..." |
| `4 - Actions/events/oldtown/RubysDiner/diana/mall_event_beautyVisit_window.twee` | 33 | "For a moment your eyes slide away from the display..." |
| `3- Interactions/oldTown/dinerRubys/Sofia/sofiaTalkDinerRubys_dianaGossip.twee` | 72 | "Sofia paused. For a moment it looked like she was going to say something." |
| `5 - QuestSystem/Quests/useComputer/quest_use_computer_01_start.twee` | 20 | "For a moment, I wonder what's in those folders." |
| `5 - QuestSystem/Quests/gotoOldtown/quest_go_to_mall_downtown_first.twee` | 33 | "For a moment you think of the park." |

Bunlardan **5'i "For a moment, you [passive verb]..."** kalıbında. Aynı template. "You just stand/sit there" ikisi art arda.

**Önerilen:** Hepsi silinebilir. Paragraftan çıkarınca cümle bir şey kaybetmez. Bu tik LLM'in sayfa uzatma hilesi.

### Ek: "One moment / The next" kalıbı

**`4 - Actions/global/energyHealth/healthFaint.twee:15`**:
> "**One moment** you're upright. **The next**, the edges of your vision close in..."

Klasik dramatic LLM geçişi. Burada bayılma sahnesi için kullanılmış, tek örnek — ama eğer daha fazla sahne aynı template'e düşerse alarm.

---

## 3. Generic Body Clichés (Pattern #3) — 7 eşleşme

Karakter vücudu hakkında spesifik olmayan, her fan fiction'da bulunan klişeler.

### "Breath catches / stomach tightens" — 3 dosyada **birebir aynı** cümle:

| Dosya | Satır | Cümle |
|-------|-------|-------|
| `Bathroom/Mother/showerEncounter_peek_Mother_continue.twee` | 56 | "Your stomach tightens. Your breath catches." |
| `Bathroom/Father/showerEncounter_peek_Father_continue.twee` | 52 | "Your stomach tightens. Your breath catches." |
| `Bathroom/Brother/showerEncounter_peek_Brother_continue.twee` | 56 | "Your stomach tightens. Your breath catches." |

→ **Copy-paste**. Anne, baba, kardeşin duş sahnelerinde farklı duygusal context'ler olması gerekirken **aynı fiziksel tepki** kopyalanmış. Bu LLM'in "yeni scene, aynı şablon" tercihinin kanıtı.

### "Every muscle / edges of vision / grey curtain / wrung out"

**`healthFaint.twee:15,27`** (tek dosyada 3 klişe):
> "...the edges of your vision close in — a slow, **grey curtain** drawing itself shut..."
> "Your whole body feels **wrung out** and hollow... **every muscle** protests when you try to move."

**`EmmaTopicsDishwasherDoneLevel1.twee:177`**:
> "Emma grabs a glass of water... She looks wrung out."

→ "Wrung out" 2 kez. LLM'in "yorgun karakter" default kelime seçimi.

---

## 4. Antithesis Tik'i ("not quite X" / "less Y, almost Z") — 11 eşleşme

LLM'in sahte-derinlik yaratma numarası. "Ne X, ne Y" kurarak karakteri yazar gibi hissetmek.

| Dosya | Satır | Metin |
|-------|-------|-------|
| `1 - Prologue/8 - formativeYears.twee` | 69 | "That strange in-between time—**not a little kid anymore, but not quite 'big' either**." |
| `1 - Prologue/8 - formativeYears.twee` | 63 | "Not a little kid anymore, but not quite big either..." (subtitle) |
| `1 - Prologue/18 - nextDayMorning.twee` | 28 | "**less intimidating, almost welcoming**" |
| `7 - Work/.../dinerWork_event_tomChat.twee` | 20 | "**not quite talking, not quite silent**" |
| `5 - QuestSystem/Quests/vinceDay3/dinerWork_event_vinceInspection_day3.twee` | 62 | "fast, **but not quite flat**" |
| `3- Interactions/FamilyHouse/Mother/talkDatabase/MotherTopicsLevel2.twee` | 665 | "**not quite looking at you, but meaning it completely**" |
| `3- Interactions/FamilyHouse/Mother/talkDatabase/MotherTopicsLevel1.twee` | 131 | "**(not quite convinced)**" |
| `5 - QuestSystem/Quests/findJob/quest_find_job_ruby_diner_manager_room.twee` | 17 | "**not quite professional, a bit too long**" |
| `3- Interactions/oldTown/dinerRubys/Mike/talkDatabase/MikeTopicsCommonLevel1.twee` | 21 | "like he's **not quite sure what to do with it**" |
| `3- Interactions/FamilyHouse/Father/talkDatabase/FatherTopicsPostWorkLevel2.twee` | 736 | "almost asleep but **not quite** — that half-state where things come out more easily" |
| `3- Interactions/FamilyHouse/Brother/talkDatabase/BrotherTopicsSchoolLevel1.twee` | 653 | "near you but **not quite with you**" |

**Gözlem:** "not quite" 11 dosyada geçiyor ama **her seferinde aynı semantic fonksiyon** — "bir şey ama tam da o değil". Dili zenginleştirmiyor, LLM'in default dilbilgisel tik'i.

**Önerilen:** %80'i silinebilir, seyrekleştirilmesi gerek. Bir kullanım iyi, 11 kullanım imza.

---

## 5. Abstract Reflection / Therapy Voice (Pattern #5) — 4 eşleşme ama YIKICI

En kötü LLM imzası. "Hayatın boyunca X oldu... O **foundation**'un oldu." Motivational-speaker tonu.

### Örnekler (tamamı Prologue'da):

**`1 - Prologue/6 - earlyYears.twee:117`** (tek paragrafta 3 abstract noun):
> "That **patience**, that **ability** to be alone without feeling lonely—it became your **strength**."

**`1 - Prologue/9 - adolescentYears.twee:235`** (4 abstract noun + "your foundation"):
> "That **ability** to form deep bonds, to be **vulnerable** with others—you learned it... It took **courage** to create **your own emotional world**... That **independence**, that **strength** to define yourself—it became your **foundation**."

**`1 - Prologue/9 - adolescentYears.twee:141`**:
> "**That vulnerability**—you'd never heard it from him before."

**Problem:** 4 yaşam dönemi (`6 - earlyYears`, `7 - childhoodYears`, `8 - formativeYears`, `9 - adolescentYears`) birbirinin template'i. Her biri aynı **"Mom noticed this. Dad said that. That [trait]—it became your [quality]."** yapısında kapanıyor.

Bu Prologue'un **en yüksek prio rewrite alanı**. Oyuncu 10 dakikada burayı okuyor, ilk izlenim burası.

### Önerilen rewrite (örnek):

**Orijinal:**
> "That ability to form deep bonds—you learned it by stepping away from family. It took courage... That independence, that strength—it became your foundation."

**İnsan eli:**
> "You figured out early that your parents weren't going to save you from middle school. So you stopped asking. Friends became the thing that mattered. That part of you — the part that trusts sideways instead of upward — started there."

İkincisi yarı uzunlukta ve **spesifik** (middle school, stopped asking, trusts sideways). Abstract noun yok, therapy tonu yok.

---

## 6. Triple Parallel Sendromu (Pattern #6)

LLM ritmik yapıyı sever: "X, Y, ve Z". Kullanıcı profilinde gördüğümüz üzere Prologue'da her paragrafta var.

### Prologue örnekleri:

- `5 - prologuePage.twee:31` — "your brother being born, mom reading to you at night, those endless afternoons in the yard"
- `5 - prologuePage.twee:67` — "**fear, excitement, curiosity**... All at once. Your heart beats faster."
- `9 - adolescentYears.twee:185` — "**secrets were shared, drama erupted, who liked who, who said what about who**"
- `9 - adolescentYears.twee:193` — "**sudden, overwhelming, confusing**"
- `9 - adolescentYears.twee:93` — "Just a normal party—**friends, music, nothing crazy**"
- `12 - newHome.twee:66` — "the house smells new—**paint, wood polish, cleaning products**"
- `12 - newHome.twee:34` — "Familiar furniture—**the couch, coffee table, TV**"
- `17 - prologueNightEnd.twee:155` — "**The old town. Your friends. That street you knew by heart.**"
- `8 - formativeYears.twee:73` — "Everyone was getting into something—**sports, music, art, computer games**"

**Yorum:** Triple liste bir süslü yapısıdır — **ayda bir** kullanılırsa ritim verir, **her paragrafta** kullanılırsa robot kokar. Burada ikincisi. Prologue tek başına 10+ triple içeriyor.

**Önerilen:** Her 3. triple'ı 2-element'e indir veya tek spesifik detaya daralt.
- "paint, wood polish, cleaning products" → "paint and something industrial"
- "fear, excitement, curiosity" → "fear, mostly"

---

## 7. Meditation/Self-Help Voice

**`5 - QuestSystem/Quests/movingTroubles/quest_moving_troubles_room_scene.twee:86`:**
> "You stare at the ceiling. **Breathe in. Breathe out.**"

Bir yoga uygulamasının voice-over'ı. Karakter voice değil.

**`1 - Prologue/11 - newhomeEnter.twee:150`:**
> "You **take a deep breath** and open the car door. The air smells different—exhaust mixed with something you can't quite place. **Urban. Foreign. But also... exciting.**"

Tek paragrafta 3 LLM tik'i: "deep breath" + em-dash + üçlü fragment + "..." ellipsis'i + "But also" pivot.

---

## 🔴 En Kirli 10 Dosya (Composite Score)

Em-dash + pattern density kombinasyonu. Rewrite önceliği bu sırayla:

### 1. `1 - Prologue/9 - adolescentYears.twee` — ⭐ HIGHEST PRIORITY
- 10 em-dash, 2 "that X" abstract, 1 "not quite", 3 triple, 1 body cliché ("hit you like a wave")
- **En yoğun LLM imzası** tek dosyada
- 250 satır, tam rewrite mümkün

### 2. `1 - Prologue/6 - earlyYears.twee`
- 9 em-dash, 3 abstract reflection, "it became your strength" closing
- Tüm 4 life-stage passage'ı aynı template → hepsini tek elden rewrite et

### 3. `1 - Prologue/8 - formativeYears.twee`
- 9 em-dash, triple liste × 3, "not quite big either" tik
- Aynı şablon

### 4. `1 - Prologue/10 - comingofAge.twee`
- **16 em-dash** (en yüksek Prologue yoğunluğu)

### 5. `1 - Prologue/7 - childhoodYears.twee`
- 6 em-dash, aynı life-stage template

### 6. `1 - Prologue/17 - prologueNightEnd.twee`
- 2 em-dash, 1 "For a moment" opener, 1 triple, 1 "not gone, but..."
- Prologue kapanışı — ilk izlenim son nokta

### 7. `1 - Prologue/5 - prologuePage.twee`
- 4 em-dash, 2 triple liste, "Something stirs inside you"

### 8. `1 - Prologue/12 - newHome.twee`
- 5 em-dash, 2 triple, "Everything's here but it feels different"

### 9. `4 - Actions/global/energyHealth/healthFaint.twee`
- 2 em-dash ama 3 body cliché + "One moment/The next" template
- **Tek dosya full LLM showcase**

### 10. `3- Interactions/FamilyHouse/Father/talkDatabase/FatherTopicsPostWorkLevel2.twee`
- 71 em-dash (mutlak en yüksek)
- Uzun dosya olduğu için density düşük ama sample'lar dikkat çekici
- Rewrite için 2000 satır — **parçalı yaklaş, en kötü 20 entry'yi seç**

---

## 🟢 Pozitif Notlar — Temiz Dosyalar (Referans)

Bu dosyalar nispeten temiz. Rewrite yaparken bu tonu hedefle:

### 1. `passages/3- Interactions/FamilyHouse/Mother/talkDatabase/MotherTopicsLevel2.twee` (entries)

Em-dash sayısı yüksek ama **çoğu dialog içinde kısa kullanım** (kesintili konuşma). Prose kalitesi iyi:

**Örnek (satır 40-46):**
```
She's making oatmeal — one bowl, then pauses and makes a second without asking.
"You want this with raisins or without?"
"Without. You remembered I hate raisins?"
"You've been hating raisins since you were four. I haven't forgotten."
"Fair enough."
"There are some things a mother does not forget."
```

**Neden iyi:** Spesifik (raisins, age 4), dialogue karakter sesi taşıyor, abstract noun yok, therapy tonu yok. "Making a second bowl without asking" insan gözlemi.

### 2. `passages/4 - Actions/maplewood/familyHouse/Brotherroom/brotherPlayTogether.twee:11`

> "He carries harder than he admits, but when you clutch a round he actually laughs—surprised, not mean. The next match you play looser, talking smack like you've got the rank to back it up."

**Neden iyi:** Gaming slang ("carries", "clutch a round", "talking smack"). Karakter spesifik. Em-dash 1 tane, abartı yok. Senaryo-writer eline en yakın örnek.

### 3. `passages/3- Interactions/oldTown/dinerRubys/Tom/tomTalkDinerRubys.twee`

Ruby's Diner NPC dialogları genel olarak **database'lerden daha temiz** — muhtemelen daha yeni yazıldılar veya farklı prompt ile.

### 4. Diner event passages (`passages/4 - Actions/events/oldtown/RubysDiner/`)

Event passage'ları çoğunlukla aksiyon odaklı, therapy içermiyor. `dinerRubysStorage_freeMeal.twee`, `dinerWork_event_burn.twee` gibi olay bazlı dosyalar LLM prose'undan kaçıyor çünkü **somut aksiyon tarif ediyorlar**.

**Sonuç:** İşyeri/diner prose'u > ev/aile prose'u > Prologue life-stage reflection (en kötü).

---

## Klasör Bazında Yoğunluk Haritası

| Klasör | Dosya | Em-dash | Density |
|--------|-------|---------|---------|
| `1 - Prologue/` | 19 | ~100 | 🔴 Çok yüksek |
| `3- Interactions/FamilyHouse/` | 25 | ~480 | 🔴 Yüksek (uzun dosyalar) |
| `3- Interactions/oldTown/dinerRubys/` | ~30 | ~50 | 🟡 Düşük |
| `4 - Actions/maplewood/familyHouse/` | ~30 | ~40 | 🟡 Düşük |
| `4 - Actions/events/oldtown/` | ~15 | ~30 | 🟢 Temiz |
| `5 - QuestSystem/Quests/` | ~30 | ~35 | 🟡 Düşük |
| `7 - Work/RubysDiner/` | ~14 | ~15 | 🟢 Temiz |

**Sonuç:**
- **Prologue** → tek elden full rewrite
- **FamilyHouse talk databases** → parçalı rewrite (önce em-dash'leri azalt, sonra dilde insan ritmini ekle)
- **Ruby's Diner / events / work** → spot-check yeterli, tam rewrite gerekmez

---

## Öncelik Sırası (Editleme İçin)

### Aşama 1 — İlk izlenim (1-2 saat iş)
1. **Prologue 5-18** arası 14 dosya. Özellikle 5, 6, 8, 9, 10, 17, 18.
2. `healthFaint.twee` (tek dosya, %100 LLM showcase).
3. Life-stage template'i 4 dosyada: 6, 7, 8, 9 — **aynı anda yaz, tutarlılık için**.

### Aşama 2 — Kritik aile diyalog (3-4 saat)
4. `MotherTopicsLevel1.twee` — ilk tanıştığın anne topic'leri, ilk 20 entry'yi rewrite et.
5. `FatherTopicsPreWorkLevel1.twee` — aynı mantık.
6. `BrotherTopicsSchoolLevel1.twee` — aynı.

### Aşama 3 — Shower encounter copy-paste (30 dk)
7. Üç `showerEncounter_peek_{Mother,Father,Brother}_continue.twee` dosyasındaki **birebir aynı "Your stomach tightens. Your breath catches."** cümlesini **farklı** duygusal tepkilerle değiştir (anne=utanç, baba=suçluluk, kardeş=komik-tuhaf).

### Aşama 4 — Optional cleanup
8. Level 2 dialogları (daha sonra oyunda gelecek). Level 1'i bitirdikten sonra.

---

## Pratik Rewrite Filtresi

Her paragrafı şu 7 sorudan geçir:

1. **Em-dash var mı?** → 90% ihtimalle `.` veya `,` yap.
2. **"For a moment" / "Something stirs" / "all at once" / "not quite" var mı?** → sil.
3. **3+ elemanlı virgüllü liste var mı?** → 2'ye düşür veya tek spesifik detayla değiştir.
4. **"every muscle / every nerve / every breath" var mı?** → tek spesifik şeye daralt ("sol diz", "arka boyun").
5. **Abstract emotional noun ("courage", "foundation", "vulnerability") var mı?** → gündelik kelimeyle değiştir.
6. **"It became your X" kalıbı var mı?** → tümüyle sil.
7. **"You take a deep breath" var mı?** → %100 sil.

---

## Otomasyon ile Hızlı Temizlik

Manuel rewrite dışında, hızlı bir ilk geçiş script'i:

```bash
# Prologue em-dash → normal dash (dili yarı iyileştirir)
cd "passages/1 - Prologue"
sed -i 's/—/. /g' *.twee       # tehlikeli, önce test et!
```

**Uyarı:** `sed` global replace tehlikeli çünkü dialog içindeki em-dash'leri de silebilir. Manuel editor'de review + search/replace yap. Final kontrol: her dosyada em-dash sayısını 3-5'e indir.

---

## Sonuç (TL;DR)

- **948 em-dash** 140 dosyada — sanat eseri değil, **algoritma artefaktı**.
- **Prologue (19 dosya)** oyunun ilk izlenimini ELE VERİYOR. Rewrite öncelikli.
- **FamilyHouse talk database'leri** (6 büyük dosya) hacim olarak en kirli ama density ölçüldüğünde Prologue kadar kötü değil.
- **Ruby's Diner** NPC dialogları ve event'leri nispeten temiz — referans olarak kullan.
- **Showcase LLM dosyası:** `healthFaint.twee` — tek başına tüm LLM kalıplarını barındırıyor.
- **En büyük problem:** **Prologue'daki life-stage reflection sonları** ("That X, that Y—it became your Z"). Therapy-podcast register'ı.

**Önerilen iş akışı:** Prologue 4 yaşam dönemini tek oturumda rewrite et (ortak template değiştir) → `healthFaint` + shower encounter copy-paste → aile dialog database'lerinde ilk 20 entry.

**Tahmini toplam rewrite süresi (ciddi):** 15-25 saat.
**Minimum "yorumcuyu susturmak için" süre:** 3-4 saat (sadece Prologue + healthFaint).
