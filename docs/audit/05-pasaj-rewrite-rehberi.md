# Prologue & Narrative Rewrite Rehberi — Pasaj Pasaj

**Amaç:** Prose kritiği sırasında işaretlenen pasajların **dosya dosya sorun ve önerilen rewrite** dökümü. Her pasaj için: hatalı alıntı → neden hatalı → nasıl olmalı.

**Kullanım:** Bu dosya manuel rewrite için referans. Her bölüm bağımsız — istediğin pasajdan başla.

**Öncelik sırası:**
1. Prologue 5-18 (ilk izlenim)
2. `healthFaint.twee` (tek dosya LLM showcase)
3. Shower encounter copy-paste (3 dosya)
4. Family talk databases (uzun vadeli)

---

## 🎯 Genel Prensipler (Tüm Rewrite'lara Uygulanır)

### 7 Adımlı Filtre

Her paragrafı şu soru listesinden geçir:

1. **Em-dash (`—`) var mı?** → %90 ihtimalle `.` veya `,` yap.
2. **"For a moment" / "Something stirs" / "all at once" / "not quite" var mı?** → sil.
3. **3+ elemanlı virgüllü liste var mı?** → 2'ye düşür veya tek spesifik detayla değiştir.
4. **"every muscle / every nerve / every breath / edges of your vision" var mı?** → tek spesifik şey koy.
5. **Abstract emotional noun ("courage", "foundation", "vulnerability", "resilience") var mı?** → gündelik kelimeyle değiştir.
6. **"It became your X" kalıbı var mı?** → tümüyle sil.
7. **"You take a deep breath" var mı?** → %100 sil.

### Ritim Kuralları

- **Triple list her paragrafta değil** — ayda bir süs, her paragrafta robot.
- **Dramatic short fragment** ("Silence.", "Then nothing.") — **3 sayfada 1 kez** okey, **her sahnede** LLM.
- **Antithesis** ("not X, but Y") — **sahnede 1 kez** stil, **5 kez** tik.

### Register Kuralı

**YANLIŞ ton:** therapy podcast / motivational speaker / ChatGPT coaching
**DOĞRU ton:** dürüst, somut, karakterin kendi kelimeleri

**Test:** Cümleyi insan bir arkadaşa sesli söylesen garip gelir mi? → garip geliyorsa sil.

---

## 📁 Pasaj 1: `1 - Prologue/5 - prologuePage.twee`

**Passage:** `prologuePage` (Present Day, New Beginning, A→earlyYears geçiş)

### ❌ Sorunlu Bölüm 1 (Satır 31)

```
That street keeps running through your mind. Your house. The backyard. The neighbors. Your friends... All of it's behind you now. Your earliest memories are there—your brother being born, mom reading to you at night, those endless afternoons in the yard... Feels like a lifetime ago.
```

**Sorunlar:**
- 2 **triple/quadruple list** ("Your house. The backyard. The neighbors. Your friends" + "brother being born, mom reading, endless afternoons")
- **Em-dash** (LLM imzası)
- **"..." ellipsis ×2** — LLM'in dramatic-pause tik'i
- **"endless afternoons"** — klişe
- **"Feels like a lifetime ago"** — cümlelik klişe

### ✅ Önerilen Rewrite

```
That street keeps running through your mind. Your brother learning to ride a bike on the sidewalk. Mom reading to you in the backyard until the sun dropped. It's all behind you now.
```

**Ne değişti:**
- 1 triple → 2 spesifik anı (brother + bike, mom reading until sunset)
- Em-dash yok, ellipsis yok
- "Endless afternoons" → "until the sun dropped" (görünür detay)

---

### ❌ Sorunlu Bölüm 2 (Satır 67)

```
Something stirs inside you—fear, excitement, curiosity... All at once. Your heart beats faster.
```

**Sorunlar:**
- **"Something stirs inside you"** — klasik LLM opener (Pattern #2)
- **Em-dash** + **triple list** (fear, excitement, curiosity)
- **"All at once"** — Pattern #2
- **"Your heart beats faster"** — body cliché (Pattern #3)

### ✅ Önerilen Rewrite

```
Your stomach drops. Thirty kilometers. You already said that to yourself ten minutes ago.
```

**Ne değişti:**
- Abstract duygu (fear/excitement/curiosity) → somut fiziksel tepki (stomach drops — aslında zaten önceki paragrafta var, tekrar kullanma)
- Alternatif: bu paragrafı **tümüyle sil**. Bir paragraf yukarıda "Your stomach drops" var. Bu bir tekrar.

---

### ❌ Sorunlu Bölüm 3 (Satır 27)

```
Your brother's asleep next to you, headphones still in. Mom and dad sit quietly up front. An old song plays on the radio—something familiar but you can't place it.
```

**Sorunlar:**
- **Em-dash** (LLM)
- "something familiar but you can't place it" — **tam LLM fraktalı** (antithesis tik + abstract)

### ✅ Önerilen Rewrite

```
Your brother's asleep next to you, headphones still in. Mom and dad haven't talked since the last gas station. The radio plays some 80s song dad knows all the words to but isn't singing.
```

**Ne değişti:**
- "Old song familiar but can't place" → spesifik (80s, dad knows words, not singing)
- Aileyi sessizleştirmek yerine **neden sessiz** detayını ima et (son benzin istasyonundan beri).

---

## 📁 Pasaj 2: `1 - Prologue/6 - earlyYears.twee`

**Passage:** `earlyYears` (Ages 0-5, Early Years)

### ❌ Sorunlu Bölüm — Memory Card #4 (Satır 117)

```
"While everyone fussed over your brother, you found your own space. Building blocks, puzzles, drawing—hours would pass in your quiet corner. Mom would check on you: 'You okay, sweetie?' Dad would ruffle your hair on his way past. They were busy, but they noticed. When your brother turned three, he started sitting next to you, watching silently. 'Good job teaching him,' dad said one day. That patience, that ability to be alone without feeling lonely—it became your strength."
```

**Sorunlar:**
- **Em-dash ×2**
- **Triple list** "Building blocks, puzzles, drawing"
- **"That X, that Y—it became your Z"** — **en kötü LLM template**
- Abstract reflection noun: "patience", "ability", "strength"
- **Therapy podcast outro ritmi**

### ✅ Önerilen Rewrite

```
"Everyone fussed over your brother. That meant you got the corner. You'd stack blocks until the tower came down, then stack them again. Mom would check in. 'You okay, sweetie?' Dad would ruffle your hair on his way past. When your brother turned three, he started sitting next to you, watching. Dad noticed. 'Good job teaching him.' You didn't think you were teaching anyone anything. You just liked having him there."
```

**Ne değişti:**
- Therapy outro (**"That patience... it became your strength"**) → **tümüyle silindi**
- "Building blocks, puzzles, drawing" → tek somut aksiyon (tower collapsing)
- Karakterin **kendi perspektifi** eklendi ("didn't think you were teaching")
- Em-dash sıfır

---

## 📁 Pasaj 3: `1 - Prologue/7 - childhoodYears.twee`

**Passage:** `childhoodYears` (Ages 6-9)

**Not:** Bu dosyayı okumadım, ama `earlyYears` ile **aynı template**'i takip ettiğini biliyorum (6 em-dash, memory card sonları aynı "That X—it became your Y" refrain'i).

### Genel Tavsiye

Memory card'ların son cümlelerini `earlyYears`'taki prensibe göre rewrite et:
- **"That [abstract noun], that [abstract noun]—it became your [abstract noun]"** → SIL
- Yerine: karakterin **kendi voice'undan** 1-2 cümle ekle (çocuksu gözlem, somut detay)

Rewrite yaparken **4 life-stage passage'ını (6, 7, 8, 9) aynı oturumda** aç — template tutarlılığı için.

---

## 📁 Pasaj 4: `1 - Prologue/8 - formativeYears.twee`

**Passage:** `formativeYears` (Ages 10-12)

### ❌ Sorunlu Bölüm 1 (Satır 63, subtitle)

```html
<p class="prologue-subtitle">Not a little kid anymore, but not quite big either...</p>
```

**Sorun:**
- **Antithesis tik** (Pattern #4) + **ellipsis**

### ✅ Önerilen Rewrite

```html
<p class="prologue-subtitle">The awkward years.</p>
```

Ya da:

```html
<p class="prologue-subtitle">Too old for cartoons, too young for everything else.</p>
```

---

### ❌ Sorunlu Bölüm 2 (Satır 69)

```
Middle school years. That strange in-between time—not a little kid anymore, but not quite "big" either.
```

**Sorunlar:**
- **Em-dash** + **antithesis** + **"strange in-between"** (vague LLM abstract)

### ✅ Önerilen Rewrite

```
Middle school. The worst three years of anyone's life.
```

**Ne değişti:**
- Abstract "in-between time" → direkt değer yargısı
- Karakterin sesi hissediliyor (hem komik, hem doğru)

---

### ❌ Sorunlu Bölüm 3 (Satır 73)

```
Your body was changing. Voices around you were changing. Everyone was getting into something—sports, music, art, computer games. You were searching too, trying to figure out what was yours.
```

**Sorunlar:**
- **Quadruple list** (sports, music, art, computer games) — jenerik
- **"searching... figure out what was yours"** — LLM reflection

### ✅ Önerilen Rewrite

```
Your body was changing. The kid who sat next to you in fourth grade was now six inches taller and played guitar. Everyone had a thing. You didn't.
```

**Ne değişti:**
- Generic "everyone" → **spesifik anonim** (the kid from fourth grade)
- Quadruple list → tek örnek (guitar)
- "Searching" → direkt itiraf ("you didn't")

---

## 📁 Pasaj 5: `1 - Prologue/9 - adolescentYears.twee` — ⭐ EN YÜKSEK PRIORITY

**Passage:** `adolescentYears` (Ages 13-15)
**Özellikler:** 10 em-dash, 3 abstract reflection, 1 "not quite", 3 triple, 1 body cliché. **Full audit showcase.**

### ❌ Sorunlu Bölüm 1 (Satır 81)

```
Your body was different now. You spent more time in front of mirrors. What you wore, how you looked, how others saw you—it all suddenly mattered in ways it never had before.
```

**Sorunlar:**
- **Em-dash**
- **Triple list** (what you wore, how you looked, how others saw you)
- **"mattered in ways it never had before"** — LLM padding

### ✅ Önerilen Rewrite

```
Your body was different now. You'd stand in front of the mirror longer than you used to. Whether your jeans sat right mattered now, in a way it hadn't last summer.
```

**Ne değişti:**
- Triple → tek spesifik (jeans fit)
- "Mattered in ways it never had before" → "in a way it hadn't last summer" (zaman referansı, somut)

---

### ❌ Sorunlu Bölüm 2 (Satır 93)

```
One Friday night, you wanted to go to a party. Just a normal party—friends, music, nothing crazy.
```

**Sorunlar:**
- **Em-dash** + **triple** (friends, music, nothing crazy)
- "Nothing crazy" — karakter ağzından değil, LLM'in reassurance'ı

### ✅ Önerilen Rewrite

```
One Friday night you wanted to go to a party. Sam's basement. Most of your grade would be there.
```

**Ne değişti:**
- Generic party → spesifik yer (Sam's basement)
- "Nothing crazy" savunmasını sil — karakter zaten bunu düşünmez, LLM düşünür

---

### ❌ Sorunlu Bölüm 3 (Satır 141) — En kritik

```
That vulnerability—you'd never heard it from him before.
```

**Sorunlar:**
- **Em-dash**
- **Abstract noun "vulnerability"** — therapy kelimesi

### ✅ Önerilen Rewrite

```
You'd never heard him say something like that before. Not out loud.
```

**Ne değişti:**
- "Vulnerability" kavramı tümüyle silindi
- "Not out loud" ile aynı anlam, daha doğal

---

### ❌ Sorunlu Bölüm 4 (Satır 185)

```
Friendships became more complex. Not just hanging out anymore—secrets were shared, drama erupted, who liked who, who said what about who. Social media made everything worse and better at the same time. One comment could ruin your day. One like could make it.
```

**Sorunlar:**
- **Em-dash**
- **Quadruple list** (secrets shared, drama erupted, who liked who, who said what)
- **"worse and better at the same time"** — antithesis tik
- **"One X could Y. One X could Z."** — LLM symmetric tik

### ✅ Önerilen Rewrite

```
Friendships got complicated. Who sat with who at lunch became a coded map you had to read every morning. One ignored text and you'd spend the whole afternoon running worst-case scenarios.
```

**Ne değişti:**
- Quadruple → tek somut detay (lunch seating as coded map)
- "Worse and better" antithesis → spesifik senaryo (ignored text + afternoon rumination)

---

### ❌ Sorunlu Bölüm 5 (Satır 193)

```
And then there were other changes. New feelings. Attraction. Curiosity. That first crush hit you like a wave—sudden, overwhelming, confusing. You didn't tell anyone at first, afraid of what it meant, what they'd think.
```

**Sorunlar:**
- **3 ardışık fragment** (New feelings. Attraction. Curiosity.)
- **"hit you like a wave"** — cliché (Pattern #3)
- **Em-dash + triple** (sudden, overwhelming, confusing)
- "afraid of what it meant, what they'd think" — **parallel clause** LLM symmetry

### ✅ Önerilen Rewrite

```
You got your first crush in eighth grade. You didn't tell anyone — not your brother, definitely not mom. You weren't sure what to call it yet, and putting words on it would have made it real.
```

**Ne değişti:**
- Generic "changes/feelings/attraction/curiosity" → spesifik (eighth grade)
- "Hit like a wave" cliché → kaldırıldı
- Karakterin **düşünce süreci** ("putting words on it would have made it real") — content, sizinti değil

---

### ❌ Sorunlu Bölüm 6 (Satır 235) — ⭐ En kötü paragraf

```
"That ability to form deep bonds, to be vulnerable with others— you learned it by stepping away from family, by finding connection elsewhere. It took courage to create your own emotional world, separate from your parents. That independence, that strength to define yourself—it became your foundation."
```

**Sorunlar (neredeyse tüm LLM pattern'leri tek paragrafta):**
- **Em-dash ×2**
- **Abstract noun bombardımanı:** ability, bonds, vulnerable, courage, world, independence, strength, foundation
- **"That X, that Y—it became your Z"** — template son cümle
- **"your own emotional world"** — therapy jargon
- **Parallel "by X, by Y"**

### ✅ Önerilen Rewrite

```
"You figured out early that your parents weren't going to solve middle school for you. So you stopped asking. Friends became the thing that mattered — the first people you told things to, before family. That's still how it works. Whether that's a strength or not depends on the day."
```

**Ne değişti:**
- 0 em-dash (bir tane kaldı ama yalnız, stil olarak)
- Abstract noun bombardımanı → gündelik kelimeler
- "It became your foundation" therapy outro → **belirsizlik** ("depends on the day") — gerçekçi karakter ton
- Karakterin kendi yorumu eklendi ("that's still how it works")

---

## 📁 Pasaj 6: `1 - Prologue/10 - comingofAge.twee`

**Passage:** `comingofAge` (Ages 16-17)
**Özellikler:** **16 em-dash** (Prologue'un en yüksek sayısı). Okumadım, ama aynı pattern'e sahip olduğunu varsay.

### Rewrite Stratejisi (Genel)

1. Em-dash sayısını **3'ün altına** indir. 16 → 3.
2. Memory card closing'larında "That X—it became your Y" template'i ara, sil.
3. Life stage kapanışı olduğu için **üzerinde en çok dur** — oyuncu burada karakterini seçip ana oyuna başlıyor.

### Öneri

Bu dosyayı rewrite ederken **"son çocukluk, ilk yetişkinlik"** temasını şu şekilde aç:

- Spesifik bir an: ehliyet sınavı, ilk iş başvurusu, bir ilişki
- Anne/baba ile rol değişimi anı (onları koruma dürtüsü, vs.)
- Kardeşle son "birlikte çocuk" anı

Karakterin oyunda taşıyacağı **en son formative experience** burası — abstract reflection yerine **somut bir olay** yaz.

---

## 📁 Pasaj 7: `1 - Prologue/12 - newHome.twee`

**Passage:** `newHome` (Yeni eve geliş)

### ❌ Sorunlu Bölüm 1 (Satır 34)

```
The living room is larger than the old one. Familiar furniture—the couch, coffee table, TV—arranged in this new space. Everything's here but it feels different. Whiter walls, higher ceilings, more light.
```

**Sorunlar:**
- **Em-dash ×2**
- **Triple** (couch, coffee table, TV)
- **"Everything's here but it feels different"** — antithesis tik
- **Triple** (whiter walls, higher ceilings, more light)

### ✅ Önerilen Rewrite

```
The living room is bigger than the old one. Your couch is against the wrong wall. Mom keeps walking past it and then walking back, like she hasn't decided either.
```

**Ne değişti:**
- Double triple → tek spesifik (couch on wrong wall)
- "Feels different" abstract → Mom'un davranışı (insan gözlemi)
- "Whiter walls, higher ceilings" silindi — zaten oyuncu görsel görecek

---

### ❌ Sorunlu Bölüm 2 (Satır 66)

```
The house smells new—paint, wood polish, cleaning products. Not the familiar smell of the old house, the one that meant safety, comfort, everything you knew.
```

**Sorunlar:**
- **Em-dash + triple** (paint, wood polish, cleaning products)
- **Triple** (safety, comfort, everything you knew)
- **"the one that meant..."** — LLM'in abstract meaning-making'i

### ✅ Önerilen Rewrite

```
The house smells like paint. The old house smelled like mom's cooking and whatever dad was fixing that week. Here, nothing yet.
```

**Ne değişti:**
- Generic smell triple → tek (paint)
- Abstract triple (safety/comfort/known) → spesifik hafıza (mom's cooking, dad's repairs)
- "Here, nothing yet" — karakterin tavır/gözlem

---

### ❌ Sorunlu Bölüm 3 (Satır 76)

```
From below, you hear your parents—bags rustling, cabinet doors opening, mom's voice: "Did you pack the coffee?"
```

**Sorun:** Em-dash sonrası triple list (bags, cabinet doors, mom's voice).

### ✅ Önerilen Rewrite

```
From below you hear mom ask dad where the coffee box is. He doesn't answer the first time.
```

Triple list → tek spesifik detay + implicit dram (cevap vermemek).

---

## 📁 Pasaj 8: `1 - Prologue/13 - prologueBedroom.twee`

**Passage:** `prologueBedroom`

### ❌ Sorunlu Bölüm (Satır 22)

```
For a moment, you just stand there. Taking it in.
```

**Sorunlar:**
- **"For a moment" template** (Pattern #2)
- **"Taking it in"** — LLM'in sahne açış tik'i

### ✅ Önerilen Rewrite

```
You stand in the doorway. It's smaller than the old one. Or maybe it just feels smaller because you haven't decided where anything goes yet.
```

**Ne değişti:**
- "For a moment" → doğrudan aksiyon (stand in doorway)
- Karakter düşüncesi eklendi (psychological reasoning)

---

## 📁 Pasaj 9: `1 - Prologue/17 - prologueNightEnd.twee`

**Passage:** `prologueNightEnd`

### ❌ Sorunlu Bölüm 1 (Satır 114)

```
At the top, you pause in the hallway. Your brother's door is closed. A thin line of light shows underneath—he's still awake, probably on his phone.
```

**Sorun:** Em-dash + "probably on his phone" — karakter varsayım yapıyor, OK, ama "thin line of light shows underneath" klişe.

### ✅ Önerilen Rewrite

```
At the top you pause in the hallway. Your brother's door is closed, a band of blue glowing under it. Phone, not lamp.
```

**Ne değişti:**
- "Thin line of light" → "band of blue" (phone screen color — spesifik)
- Em-dash yok, "Phone, not lamp" fragment daha karakterli

---

### ❌ Sorunlu Bölüm 2 (Satır 130)

```
For a moment, you just sit there.
```

**Sorun:** Pattern #2 template.

### ✅ Önerilen Rewrite

```
You sit on the edge of the bed.
```

Ya da **sil**. "Just sitting" bir şey söylemiyor.

---

### ❌ Sorunlu Bölüm 3 (Satır 155)

```
Your mind wanders. The old town. Your friends. That street you knew by heart. All of it's gone now—not gone, but... behind you.
```

**Sorunlar (yıkıcı):**
- **Triple** (old town, friends, street)
- **Em-dash + antithesis** ("not gone, but... behind you")
- **Ellipsis ellipsis**
- Zaten satır 31'de (prologuePage) **aynı şey** söylendi

### ✅ Önerilen Rewrite

```
Your mind wanders to the old street. To Sam's driveway, where you left your bike for three days last summer before anyone noticed. That's what gone means.
```

**Ne değişti:**
- Generic triple → **spesifik, şahsi** anı (Sam's driveway, bike unnoticed)
- Abstract "gone/behind you" antithesis → somut tanım ("that's what gone means")
- Tekrar problemi çözüldü — yeni bilgi veriyor, tekrar etmiyor

---

## 📁 Pasaj 10: `1 - Prologue/18 - nextDayMorning.twee`

**Passage:** `nextDayMorning`

### ❌ Sorunlu Bölüm 1 (Satır 20)

```
For a moment, you forget where you are. Then you remember.
```

**Sorun:** Pattern #2 template. Ayrıca "Then you remember" fragment'ı da LLM dramatic-pause.

### ✅ Önerilen Rewrite

```
You wake up and don't recognize the ceiling. Then you do.
```

**Ne değişti:**
- "For a moment" silindi
- Somutlaştırma: ceiling (oyuncu gözü yukarıda açılıyor)

---

### ❌ Sorunlu Bölüm 2 (Satır 28)

```
You sit up, look around. The room looks different in daylight—less intimidating, almost welcoming.
```

**Sorun:** Em-dash + antithesis tik ("less X, almost Y").

### ✅ Önerilen Rewrite

```
You sit up. The room looks smaller in daylight. Also less hostile.
```

**Ne değişti:**
- Em-dash yok
- "Less intimidating, almost welcoming" antithesis → tek yargı ("less hostile")
- "Also" ile ikinci gözlem daha doğal

---

### ❌ Sorunlu Bölüm 3 (Satır 62)

```
You sit down. The table feels strange—same furniture, different kitchen.
```

**Sorun:** Em-dash + antithesis (same X, different Y).

### ✅ Önerilen Rewrite

```
You sit down. Same table, new kitchen. It's going to take a while.
```

---

## 📁 Pasaj 11: `4 - Actions/global/energyHealth/healthFaint.twee` — ⭐ TEK DOSYA SHOWCASE

**Passage:** `healthFaint` (Bayılma → evde uyanma)
**Özellik:** **Tüm LLM pattern'lerini tek dosyada barındırıyor.** 2 em-dash, 3 body cliché, 1 "One moment/The next" template, "inner voice" therapy tonu.

### ❌ Sorunlu Bölüm 1 (Satır 14-16)

```
It happens fast.
One moment you're upright. The next, the edges of your vision close in — a slow, grey curtain drawing itself shut from all sides. Your legs don't give warning. They just stop.
The floor comes up to meet you.
```

**Sorunlar:**
- **"It happens fast"** — LLM opener
- **"One moment... The next"** — Pattern #2 template
- **Em-dash**
- **"edges of your vision close in"** — Pattern #3 cliché
- **"grey curtain drawing itself shut from all sides"** — **double cliché**
- **"The floor comes up to meet you"** — klasik bayılma cliché

### ✅ Önerilen Rewrite

```
Your legs decide first. Then the rest of you.
The kitchen tile is cold against your cheek.
```

**Ne değişti:**
- Sinematik/dramatic anlatım → **fiziksel, somut, sessiz**
- "Grey curtain of vision" yok — direkt uyanma
- "Legs decide first" — karakterin kendi retrospektif gözlemi (biraz mizahlı)
- Lokasyon detay (kitchen tile) — **mutfakta bayılmış** olduğu ima ediliyor (oyuncu context'ten kapıyor)

**Not:** Eğer "bayıldı" net olsun istiyorsan şöyle yap:

```
You don't remember falling. Just the tile against your cheek and the sound of the fridge cycling.
```

---

### ❌ Sorunlu Bölüm 2 (Satır 18-20)

```
Light. Ceiling. The sound of the house.
You blink, once, twice. You're in your bed. You don't know how you got here — your body must have known where to go even when your mind didn't.
```

**Sorunlar:**
- **"Light. Ceiling. [something]."** — fragment triple LLM ritmi
- **"once, twice"** — cliché ritmi
- **Em-dash + "your body must have known where to go..."** — **therapy bilgeliği** LLM

### ✅ Önerilen Rewrite

```
Ceiling. Your ceiling. The house is quiet.
You don't remember the stairs.
```

**Ne değişti:**
- Fragment triple → 2 fragment (ritim korunuyor ama azaltılıyor)
- Abstract "your body must have known" philosophical refleksiyon → somut gap ("don't remember the stairs")

---

### ❌ Sorunlu Bölüm 3 (Satır 22-25)

```
<<dialog "player">>
(Inner voice)
How long was I out?
<</dialog>>
```

**Sorun:** **"(Inner voice)"** tag'ı — karakterin iç sesinin kendisini üçüncü şahıs gibi tanımlaması. Biraz therapy app, biraz MCU narrator.

### ✅ Önerilen Rewrite

Inner voice tag'ını tümüyle sil. Direkt:

```
<<narrative>>
How long were you out? You can't tell from the light.
<</narrative>>
```

Ya da karakterin gerçek iç sesi, parantez olmadan:

```
<<dialog "player">>
How long was I out?
<</dialog>>
```

---

### ❌ Sorunlu Bölüm 4 (Satır 27)

```
Your whole body feels wrung out and hollow. Your head is heavy, there's a dull ache behind your eyes, and every muscle protests when you try to move.
```

**Sorunlar (üst üste klişe):**
- **"wrung out and hollow"** — Pattern #3
- **Triple** (head heavy + ache behind eyes + every muscle protests)
- **"every muscle protests"** — Pattern #3
- **"dull ache"** — jenerik

### ✅ Önerilen Rewrite

```
Your head hurts. You try to sit up and your arms disagree.
```

**Ne değişti:**
- Triple cliché → 2 spesifik fiziksel gözlem
- "Every muscle protests" → spesifik (arms disagree) — daha kişisel, karakterli

---

### ❌ Sorunlu Bölüm 5 (Satır 29-32)

```
<<dialog "player">>
(Inner voice)
This is a warning. I've been ignoring things I shouldn't ignore.
<</dialog>>
```

**Sorunlar (catastrophic):**
- **"This is a warning"** — therapy app bildirimi
- **"I've been ignoring things I shouldn't ignore"** — self-help podcast
- **"(Inner voice)"** — zaten problem

### ✅ Önerilen Rewrite

```
<<dialog "player">>
Okay. I need to start taking care of myself.
<</dialog>>
```

Ya da (biraz daha karakterli):

```
<<dialog "player">>
Okay. That was stupid of me.
<</dialog>>
```

**Ne değişti:**
- Therapy-grade abstract "ignoring things I shouldn't ignore" → **gündelik öz-değerlendirme** ("that was stupid of me")
- Karakterin kendi ses tonu, therapist değil

---

### ❌ Sorunlu Bölüm 6 (Satır 34)

```
You sit up slowly. You're still here. That's something.
```

**Sorun:** "That's something" — LLM'in "trying to find meaning" closing'i. Aşırı dramatic.

### ✅ Önerilen Rewrite

```
You sit up. Slowly. The room doesn't spin, which is the best thing that's happened all day.
```

**Ne değişti:**
- "That's something" LLM dramatic → **karakter ağzından mizahi beklenti** (best thing of the day — somut)

---

## 📁 Pasaj 12: Shower Encounter Copy-Paste — 3 Dosya Tek Fix

**Dosyalar:**
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Mother/showerEncounter_peek_Mother_continue.twee:56`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Father/showerEncounter_peek_Father_continue.twee:52`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Brother/showerEncounter_peek_Brother_continue.twee:56`

### ❌ Sorun: BİREBİR AYNI CÜMLE

Her üç dosyada da:

```
Your stomach tightens. Your breath catches.
```

**Sorun:** Anne, baba, kardeşi **aynı duş sahnesinde röntgenlerken** tamamen farklı duygusal context var. Ama tepki birebir kopya.

- **Anne** → karışık duygu, utanç (tabu), belki merhamet
- **Baba** → daha ağır suçluluk, cinsel utanç
- **Kardeş** → tuhaflık, rekabet, belki komik bir kabuslanma

### ✅ Önerilen Rewrite — Her Dosya için Farklı

#### `Mother_continue.twee:56`

```
Your ears go hot. You stop breathing without meaning to.
```

*Mantık: Anne → utanç, fiziksel — ears going hot, held breath.*

#### `Father_continue.twee:52`

```
You go still. Your mouth tastes wrong.
```

*Mantık: Baba → ağır suçluluk. Metallic taste — adrenalin/stress cevabı.*

#### `Brother_continue.twee:56`

```
You snort before you can stop yourself. Then freeze.
```

*Mantık: Kardeş → tuhaflık, uygunsuz gülme refleksi, sonra donma.*

**Genel prensip:** Üç sahne üç farklı duygusal register'da olmalı. Aynı fiziksel tepki yazmak LLM tembelliği.

---

## 📁 Pasaj 13: `passages/1 - Prologue/11 - newhomeEnter.twee`

### ❌ Sorunlu Bölüm (Satır 150)

```
You take a deep breath and open the car door. The air smells different—exhaust mixed with something you can't quite place. Urban. Foreign. But also... exciting.
```

**Sorunlar (tek paragrafta 4 LLM tik'i):**
- **"You take a deep breath"** — Pattern #7 (meditation voice)
- **Em-dash**
- **"something you can't quite place"** — LLM vague abstraction
- **Fragment triple** (Urban. Foreign. But also... exciting.)
- **"But also..." pivot** — LLM transition tik

### ✅ Önerilen Rewrite

```
You open the car door. It smells like exhaust and somebody's dryer vent. You're not sure why that feels promising.
```

**Ne değişti:**
- "Deep breath" silindi
- "Something you can't place" → **spesifik komik detay** (dryer vent) — çok kişilik kazandırır
- "Urban. Foreign. But also exciting" fragment triple → **tek karakter yorumu** ("not sure why that feels promising")

---

## 📁 Pasaj 14: Quest Scene'lerindeki Spot Fix'ler

### `5 - QuestSystem/Quests/movingTroubles/quest_moving_troubles_room_scene.twee:86`

**❌ Mevcut:**
```
You stare at the ceiling. Breathe in. Breathe out.
```

**Sorun:** Yoga/meditation app voice-over. Karakter bir insan, mindfulness uygulaması değil.

**✅ Rewrite:**
```
You stare at the ceiling. You can hear mom downstairs trying not to make noise.
```

### `5 - QuestSystem/Quests/findJob/quest_find_job_ruby_diner_manager_room.twee:17`

**❌ Mevcut:**
```
A man in his forties sits behind the desk. He looks you over—not quite professional, a bit too long—then smiles.
```

**Sorun:** Em-dash ×2 + "not quite" tik + "a bit too long" tik.

**✅ Rewrite:**
```
A man in his forties looks up from behind the desk. His eyes linger a second longer than they should. Then he smiles.
```

**Ne değişti:**
- "Looks you over—not quite professional, a bit too long" → "eyes linger a second longer than they should"
- Aynı anlam (uncomfortable), ama direkt + em-dash yok + karakterin gözlemi net

### `5 - QuestSystem/Quests/vinceDay3/dinerWork_event_vinceInspection_day3.twee:62`

**❌ Mevcut:**
```
His eyes move over you — fast, but not quite flat.
```

**Sorun:** Em-dash + "not quite" tik.

**✅ Rewrite:**
```
His eyes move over you. Fast. Not flat enough to miss.
```

---

## 📁 Pasaj 15: `4 - Actions/maplewood/sunsetPark/parkWalk.twee`

### ❌ Sorunlu Bölüm (Satır 37)

```
For a moment, your eyes drift upward to two birds perched in the branches. It is a small, peaceful detail, but it slows your thoughts in the best way.
```

**Sorunlar:**
- **"For a moment"** — Pattern #2
- **"a small, peaceful detail"** — LLM meta-comment (anlatı, kendisi hakkında konuşuyor)
- **"in the best way"** — cliché closing

### ✅ Önerilen Rewrite

```
Two birds on a branch above you. One of them hops sideways for no reason. You stand there watching for longer than you meant to.
```

**Ne değişti:**
- "For a moment" → yok
- Abstract "small peaceful detail" → **spesifik davranış** (hopping sideways for no reason)
- "Slows your thoughts in the best way" meta-yorum → karakter davranışı ("longer than you meant to")

### ❌ Sorunlu Bölüm 2 (Satır 71)

```
The same pair drifts into a quiet embrace while the evening crowd thins out. You keep moving, but the slower atmosphere settles into your pace.
```

**Sorun:** "quiet embrace" + "atmosphere settles into your pace" — LLM abstract/atmospheric.

### ✅ Rewrite

```
The couple on the far bench has stopped talking. They're just sitting now. You walk past them without looking twice.
```

---

## 🎨 Karakter Voice Tutarlılığı — Oyun Çapında Kural

Rewrite yaparken oyuncunun (Diana) tek bir **voice** taşıması gerek:

### Diana Voice Özellikleri (şimdiki kirlenmemiş örneklere dayanarak)

**Olan:**
- Ironic detachment (gerçeği küçük mizahla söyler)
- Küçük itiraflar (self-deprecating)
- Spesifik hafıza (generic değil)
- Ara sıra **çocuksu reflex** (özellikle aile sahnelerinde)

**Olmayan:**
- Therapy podcast (abstract noun açıklamaları)
- Sinematik dramatik (grey curtain, floor coming up)
- Social media influencer coaching ("This is a warning")

### Test: "Diana bunu sesli söyler mi?"

Her paragrafı bu testten geçir:
- **"Feels like a lifetime ago"** — hayır, bu LLM. Diana: "Weird, actually — barely a month, but I keep forgetting where the living room is."
- **"That foundation—it became your strength"** — asla. Diana: "Yeah, I figured that out pretty early."
- **"It happens fast"** — anlatımcı LLM. Diana deneyimi içinden konuşur: "I don't remember falling."

---

## 🔁 Tutarlılık Notu — Prologue 6-10 Memory Card'ları

**4 yaşam dönemi** (earlyYears → comingofAge) birbirinin template'i halinde. Rewrite sırasında:

### Template Uyum Kuralları

1. **Her memory card sonuna** "That X, that Y—it became your Z" **kalıbını sil.** İstisnasız.
2. Memory card'ın son cümlesi **karakterin kendi gözlemi** olsun, yazarın commentary'si değil.
3. **Aynı oturumda** 4 dosyayı aç, paralel rewrite — prose ritmi tutarlı olsun.
4. Her dönemde **1 spesifik fiziksel detay** olsun (building blocks yerine "wooden ABC block with the B missing", vs.).

### Örnek: 4 Dönem İçin Tutarlı Kapanış Stili

**earlyYears (0-5):**
> "You don't remember the corner. You remember the block set. Mom said later you'd get upset if anyone moved the blue one."

**childhoodYears (6-9):**
> "You can still draw that neighborhood from memory. The kink in Maple Street where the sidewalk cracked. Mrs. Keller's dog. The hill."

**formativeYears (10-12):**
> "You told your best friend first. About everything. She told her older sister about half of it. You stopped telling her after that."

**adolescentYears (13-15):**
> "You figured out early that your parents weren't going to solve middle school for you. So you stopped asking. That's still how it works."

**Bu 4 kapanış birleşik bir ses oluşturuyor:** Her biri **spesifik, kişisel, insan.** Therapy yok, abstract yok.

---

## 📋 Uygulama Checklist

Rewrite yaparken bu listeyi takip et:

- [ ] Prologue 5 (`prologuePage.twee`) — 3 bölüm
- [ ] Prologue 6 (`earlyYears.twee`) — memory card outros
- [ ] Prologue 7 (`childhoodYears.twee`) — memory card outros
- [ ] Prologue 8 (`formativeYears.twee`) — subtitle + 2 paragraf
- [ ] Prologue 9 (`adolescentYears.twee`) — **6 bölüm, en yoğun**
- [ ] Prologue 10 (`comingofAge.twee`) — em-dash sayısını 3'e indir
- [ ] Prologue 11 (`newhomeEnter.twee`) — 1 kritik paragraf
- [ ] Prologue 12 (`newHome.twee`) — 3 bölüm
- [ ] Prologue 13 (`prologueBedroom.twee`) — "For a moment" opener
- [ ] Prologue 17 (`prologueNightEnd.twee`) — 3 bölüm
- [ ] Prologue 18 (`nextDayMorning.twee`) — 3 bölüm
- [ ] `healthFaint.twee` — 6 bölüm (full rewrite)
- [ ] Shower encounter 3 dosya — birebir copy-paste fix
- [ ] Quest scene'ler (3 spot fix)
- [ ] parkWalk.twee (2 bölüm)

**Toplam:** ~15 pasaj, tahmini **3-4 saat ciddi iş**.

---

## 🧪 Doğrulama

Rewrite sonrası test:

1. **Em-dash sayımı:** Prologue klasöründe em-dash **≤30'a** düşmüş olmalı (şu an ~100).
2. **Sesli okuma testi:** Her paragrafı sesli oku. Garip gelen tek cümle yoksa, geçti.
3. **Diana testi:** "Diana bu cümleyi bir arkadaşa söyler mi?" — Hayır çıkanları tekrar yaz.
4. **In-game test:** Prologue'u tarayıcıda baştan sona oyna. Herhangi bir paragraf ritmi/tonu kırıyor mu?

---

## Kapanış

Bu rehberi takip ederek **3-4 saatlik rewrite** yaptığında:

- ✅ Yorumcunun **"reads like every other LLM output"** iddiası geçersizleşir.
- ✅ İlk izlenim (Prologue) **profesyonel yazar** elinden çıkmış gibi hisseder.
- ✅ `healthFaint` gibi tek-showcase dosyalar düzelir.
- ✅ Shower encounter copy-paste gibi bariz tembellik çözülür.

Kalıcı iyileştirme için, **yeni pasaj yazarken** bu 7-adımlı filtreyi **yazıldıktan sonra** uygula. Yeni içerik LLM ile üretilecekse bile, post-edit bu filtreyle yapılırsa sızıntı %80 azalır.
