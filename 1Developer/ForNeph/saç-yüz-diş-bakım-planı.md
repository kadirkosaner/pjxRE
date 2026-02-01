# Hair, Face & Dental Care – Planning

This document is for **design / planning** only. Impact on beauty and looks, visual use, and actions will be refined together.

---

## 0. Vision (summary)

- **Time-based:** Values **drop** without care; they **rise** with care. All update over time (daily/hourly decay + action gains).
- **Hair:** Hair care routine at beauty parlor / hair dresser; at-home cream/event. After shower / bed → messy → **daily brushing needed**.
- **Face:** Beauty parlor treatments + at-home skincare creams → **over time**: acne / dull → silky look.
- **Teeth:** No care → **yellowing** etc.; care → improves.
- **Notifications:** When level drops or threshold is crossed (e.g. “Your hair is messy”, “Your skin looks tired”, “Teeth are yellowing”).
- **UI:** **Appearance**-related **icon** on top bar; click opens **Appearance** tab: **Hair / Face / Teeth** separately, **level-based visuals** (and text).

---

## 1. Current state (short summary)

| Concept | What exists now |
|--------|------------------|
| **Looks** | `0.3×beauty + 0.3×body.appeal + 0.2×hygiene + 0.2×clothingScore` (0–100) |
| **Beauty** | Starts at 0, can rise via item/event; 30% of looks |
| **Hygiene** | 0–100; shower, wash face raise it; 20% of looks |
| **Hair** | Length (hairLengthCm), messiness (hairMessiness), style; shower = hair washed |
| **Face** | Only “Wash Face” action → hygiene +10; Skincare Set item exists, no routine/stat |
| **Teeth** | None |

---

## 2. Goal: Three care areas

- **Hair care** – Beyond shower; look (shine, brushing, product) + beauty/looks effect  
- **Face care** – Wash Face + skincare routine; skin look + beauty/looks effect  
- **Dental care** – New; mouth/breath/smile + beauty/looks effect  

All:
- Representable visually (text / later assets).
- Meaningfully tied to **beauty** and **looks** formula.

---

## 3. Design options

### 3.1 Stat structure

**Option A – Single “care” score (grooming)**  
- `$appearance.grooming` 0–100: hair + face + teeth in one.  
- Pro: Simple, one number.  
- Con: Which area is low is unclear; separate actions feel abstract.

**Option B – Three separate stats**  
- `$appearance.hairCare` (0–100)  
- `$appearance.faceCare` or `$appearance.skincare` (0–100)  
- `$appearance.dentalCare` (0–100)  
- For looks/beauty: use average or weighted sum.  
- Pro: Clear which care is lacking; actions target the right stat.  
- Con: More variables.

**Option C – Integrated with existing hygiene**  
- Teeth = share of hygiene or separate “oral hygiene”.  
- Face = Wash Face + Skincare Set → hygiene and/or beauty.  
- Hair = use hairMessiness “inverted” (low = good care); optional extra “hairCare”.  
- Pro: Fewer new formulas.  
- Con: Hygiene is generic; hard to separate “bad teeth but clean body”.

**Recommendation:** **Option B** – Three separate stats. Text and visuals can say “hair good / face good / teeth good” separately; weights can be tuned later.

---

### 3.2 Time-based update (decay + care)

- **Without care:** hairCare / faceCare / dentalCare **drop** (daily or hourly decay; configurable).
- **With care:** Relevant stat **rises**; long-term look improves (face: acne → silky; teeth: yellowing → fresh).
- **Hair:** After shower / bed **messiness** rises (existing hairMessiness); **daily brushing** (or care routine) needed; otherwise hairCare drops.
- **Face:** At-home cream + parlor treatments → **over time** skin improves; neglect = acne / dull; care = silky.
- **Teeth:** Neglect = **yellowing**; brushing / care = improves.

All changes **time-based**; steady routine matters more than one-off spikes.

---

### 3.3 Actions (aligned with vision)

| Care | Where | Action | Effect (design) |
|------|-------|--------|------------------|
| **Hair** | Home (bathroom / mirror) | Brush / hair care | hairCare +, hairMessiness − |
| **Hair** | Home | Apply cream (hair mask / care cream) | hairCare + (event) |
| **Hair** | Beauty parlor / Hair dresser | Hair care routine | hairCare + (large gain) |
| **Hair** | Shower (existing) | — | hygiene 100; hair washed → hairCare slight + or “base” only |
| **Face** | Home | Wash face (existing) | hygiene +10; faceCare small + |
| **Face** | Home | Skincare creams (Skincare Set etc.) | faceCare +; **over time** acne → silky |
| **Face** | Beauty parlor | Face treatments | faceCare + (large gain) |
| **Teeth** | Home (bathroom) | Brush teeth | dentalCare +; yellowing decreases |
| **Teeth** | Optional | Mouthwash / floss | dentalCare extra + |

---

### 3.4 Notifications

- **When threshold is crossed** (e.g. hairCare / faceCare / dentalCare drops below a level):
  - Top bar or system notification: *“Your hair is messy, don’t forget to brush.”* / *“Your skin looks tired.”* / *“Your teeth are starting to yellow.”*
- Optional: short message when **improvement** threshold is crossed (*“Your hair looks great.”* etc.).

---

### 3.5 UI: Top bar icon + Appearance tab

- **Top bar:** An **icon** for Appearance (hair/face/teeth or single “look” icon). Click opens **Appearance** panel.
- **Appearance tab (or panel):**
  - **Hair / Face / Teeth** as separate blocks (or sub-tabs).
  - **Level** for each (0–100 or tiers like “Bad / Okay / Good / Great”).
  - **Level-based visuals:** Different asset per stat (e.g. hair: messy / neat / shiny; face: acne / normal / silky; teeth: yellow / normal / white). Placeholder or text first, assets later.
  - Short text: *“Your hair: …”* / *“Your skin: …”* / *“Your teeth: …”* by level.

So the player sees **status** and **result of care** in one place; notifications + icon draw attention.

---

### 3.6 Tying to beauty and looks

**Current looks formula:**  
`looks = 0.3×beauty + 0.3×body.appeal + 0.2×hygiene + 0.2×clothingScore`

**Option 1 – Care as part of hygiene**  
- When computing hygiene: multiply or blend with hair/face/teeth average or “grooming”.  
- Formula still shows single “hygiene”; care is a factor inside.

**Option 2 – Care added to beauty**  
- beauty = “natural beauty” + “care bonus”.  
- Care bonus = (hairCare + faceCare + dentalCare) / 3 × factor (e.g. 0.3) → max +30.  
- So care raises beauty; looks already gets 30% from beauty.

**Option 3 – Fifth component in looks**  
- looks = ... + 0.15×grooming (grooming = average of three care stats).  
- Then slightly lower the other four weights (e.g. beauty 0.25, body 0.25, hygiene 0.15, clothing 0.2, grooming 0.15).  
- Care directly affects “appearance”.

**Recommendation:** **Option 2** – Care as “care bonus” inside **beauty**. So:  
- Beauty = base + item/event + (hair/face/teeth care).  
- Looks keeps same formula and still gets share from beauty; less extra complexity.

**Option 3** can be used if you want grooming directly in looks; then “care = appearance” is clearer.

---

### 3.7 Visual side (text + level visuals)

- **Text:**  
  - Hair: “Your hair is neatly brushed / slightly messy / unkempt” by hairCare / hairMessiness.  
  - Face: “Your skin is clean / tired / well cared for” by faceCare.  
  - Teeth: “Your breath is fresh / mouth care is good / teeth neglected” by dentalCare.  
- **Visual (later):**  
  - Different face/hair/smile assets or overlays by the same stats.  
- **UI:**  
  - Three bars or “Hair / Face / Teeth” labels on character / stats screen.

---

## 4. Points to clarify

1. **Stat:** hairCare / faceCare / dentalCare separate (matches vision).  
2. **Looks formula:** Care as “care bonus” in beauty, or separate grooming component in looks?  
3. **Shower:** Count hair as washed in shower; give hairCare a small + or only brushing/cream/routine raise it?  
4. **Decay rate:** Daily −X (e.g. −3 / −5), or hourly / on wake?  
5. **Notification thresholds:** At what level to warn? (e.g. &lt; 30 “bad”, &lt; 50 “caution”)  
6. **Appearance icon:** Extend existing panel (character/stats) on top bar, or new “Appearance” tab?

---

## 5. Short evaluation

- **Time-based decay + care:** Makes routine meaningful; “did it once, done” vs. ongoing care.  
- **Hair / face / teeth separate:** Clear home and salon actions; three areas can be shown separately in UI.  
- **Face: acne → silky:** Good long-term progression; faceCare tiers (0–25 acne, 25–50 normal, 50–75 good, 75–100 silky) can model it.  
- **Teeth yellowing:** Low dentalCare = “yellowing” text/visual; high = “white/fresh”.  
- **Notifications:** One message per threshold (cooldown or “once per day” to avoid spam).  
- **Top bar icon + Appearance tab:** One place for hair/face/teeth status + level visuals; text/bars first, assets later.

---

## 6. Next steps

**Done (core system):** hairCare / faceCare / dentalCare stats, daily decay (advanceDay → dailyAppearanceUpdate), grooming bonus to beauty (StatCalculator), Simulation Settings → Appearance & Decay: Hair Care Decay / Face Care Decay / Dental Care Decay ON/OFF toggles. Actions and shop items to be added later.

Suggested implementation order (remaining):  
1. **Stat + decay:** hairCare / faceCare / dentalCare init, daily decay (already in dailyAppearanceUpdate).  
2. **Beauty/looks link:** Care bonus added to beauty (done).  
3. **Actions:** At-home brush, cream (hair/face), brush teeth; then salon (beauty parlor / hair dresser) passages.  
4. **Notifications:** Threshold check + top bar / toast message.  
5. **UI:** Top bar icon + Appearance panel (Hair / Face / Teeth, level-based text; visuals later).
