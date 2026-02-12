# Park Bench – First-Time Encounter (Draft)

**Trigger:** İlk kez banka oturulduğunda  
**Karakter:** Lily Morgan (`parkRunnerLily`) – 27, sporcu kıyafetli  
**Konum:** Sunset Park, bank

---

## Sahne Özeti

Oyuncu banka oturur. Yanında spor kıyafetiyle bir kadın ayakkabısının bağcıklarını bağlıyordur. Oyuncu kadını fark eder, özür diler. Konuşma açılır; oyuncu buralarda spor kıyafeti satan yer bulamadığını söyler. Kadın nazikçe cevap verir, maldan aldığını söyler ve kendini tanıtır.

---

## Narrative & Dialogue Script

### Açılış

**Narrative (scene setup):**
> You settle onto the bench, letting out a quiet breath. The park stretches out in front of you – the pond, the trees, the steady flow of joggers and walkers.
>
> A moment later you notice her. A woman in athletic wear – light gray leggings, a fitted top, running shoes – is crouched beside the bench, one foot up on the edge of the seat as she ties her shoelace. Her hair is pulled back in a ponytail. She finishes the knot, pulls her foot down, and catches you looking.
>
> You hadn't meant to stare. You quickly look away, then back – an awkward half-smile. //Sorry.//

**Player:**
> "Sorry, I didn't mean to disturb you."

---

### Karşılık

**Woman:**
> "Oh, no worries at all! You're fine. I was just fixing my laces – one came loose on my last lap."

She straightens up and brushes her hands on her thighs. A friendly smile. She doesn't seem bothered. If anything, she looks like she might be open to talking.

**Player:**
> "Actually… I've been meaning to ask. I'm still new around here and I've been looking for sportswear – you know, something decent for jogging or yoga. I can't seem to find anything in the neighborhood."

**Woman:**
> "Ah, I know exactly what you mean! There's not much around Maplewood for that. I got these from the mall – Skyline Mall, downtown? They have a really good sports store. Decent prices, decent selection. It's a bit of a trip, but worth it if you're serious about working out."

---

### Tanışma

**Player:**
> "That helps, thanks. I'll have to check it out."

**Woman:**
> "You're welcome! Oh – I'm [WOMAN_NAME], by the way. I run here a few times a week. Maybe I'll see you around."

She gives a small wave, warm but not pushy.

**Player:**
> "Nice to meet you. I'm [PLAYER_NAME]. Yeah, maybe you will."

**Woman:**
> "Good luck with the sportswear hunt. And welcome to the neighborhood!"

She stretches her arms overhead, then starts a light jog back toward the path. You watch her go – ponytail swinging, steady rhythm – before settling back against the bench.

---

## Teknik Notlar (Implementation)

- **Flag:** `$events.parkBenchFirstEncounter` veya `$firstBenchEncounter` – ilk oturuşta `true` yapılacak
- **Passage flow:** `parkBench` → `!$firstBenchEncounter` ise `parkBench_firstEncounter` → sonra `parkBench` (normal rest)
- **Character placeholder:** `[WOMAN_NAME]` – character hazırlanınca gerçek isimle değiştirilecek
- **Player name:** `<<print $playerName>>` veya ilgili değişken
- **Mall mention:** `$discoveredMall` veya Skyline Mall keşfi – opsiyonel hint
- **Friendship:** İlk tanışma; `friendship` veya benzeri stat varsa +1–2 verilebilir

---

## Alternatif / Kısa Versiyon

Daha kısa bir akış istersen:

**Player:** "Sorry, didn't mean to disturb."  
**Woman:** "No problem! Just fixing my laces."  
**Player:** "Quick question – where'd you get your sportswear? I've been looking and can't find anything around here."  
**Woman:** "The mall! Skyline Mall, downtown. They have a great sports store."  
**Woman:** "I'm [WOMAN_NAME], by the way. Run here often. Nice to meet you!"  
**Player:** "You too. Thanks!"  

---

*Character hazırlandığında bu metin ilgili .twee passage'a taşınacak.*
