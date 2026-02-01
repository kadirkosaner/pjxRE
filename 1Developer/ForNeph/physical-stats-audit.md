# Physical / Looks Stats – Audit

## Current stats (what exists)

| Stat | Range | Source | Used in |
|------|--------|--------|---------|
| **$body** (bust, hips, waist, weight, height, muscleMass, bodyFat) | various | Settings, BodySystem | body.appeal only |
| **$body.appeal** | 0–50 | calculateBodyAppeal: BMI, WHR, symmetry, muscle/fat; uses **$core** for waist | looks 30% |
| **$upperBody, $core, $lowerBody, $cardio** | 0–100 | Gym, run, yoga, etc. | → fitness only |
| **$fitness** | 0–100 | avg(upperBody, core, lowerBody, cardio) | **energyMax only** – NOT in looks/beauty |
| **$beauty** | 0–100 | Init 0; items/prologue add | looks via “effectiveBeauty” (beauty + care “bonus”) |
| **hairCare, faceCare, dentalCare** | 0–100 | $appearance; decay + future actions | Added as “bonus” to beauty (max +30) |
| **$hygiene** | 0–100 | Shower, wash face, time | looks 20% |
| **$clothingScore** | 0–100 | Wardrobe | looks 20% |
| **$looks** | 0–100 | Derived | confidence 30% |
| **$confidence** | 0–100 | charisma×0.5 + looks×0.3 | UI, checks |

## Current formulas

- **body.appeal** = (BMI + WHR + symmetry + composition) × 0.5 → 0–50. Uses **$core** for effective waist; upperBody, lowerBody, cardio do **not** affect it.
- **fitness** = (upperBody + core + lowerBody + cardio) / 4. Used only for **energyMax**.
- **effectiveBeauty** = min(100, beauty + hairCare×0.1 + faceCare×0.1 + dentalCare×0.1). “Bonus” wording.
- **looks** = effectiveBeauty×0.3 + body.appeal×0.3 + hygiene×0.2 + clothing×0.2.

## What’s wrong / missing

1. **Beauty** is “base + bonus”; should be **one 0–100 “overall body/face attractiveness”** (no separate “bonus”).
2. **Fitness** does **not** affect beauty or looks; fit body should improve attractiveness.
3. **body.appeal** only uses **core** (via waist); other fitness stats don’t affect appearance.
4. **Double-count**: body.appeal and “beauty” (which will include body) both feed looks; need clear single “beauty” that includes body + care + fitness.

## Proposed model (realistic) – IMPLEMENTED

1. **Beauty (0–100)** = character’s overall physical attractiveness. **No base** – fully derived from fitness (highest), body, face/hair/dental care. Starts at 0.
   - Formula:  
     `beauty = min(100, fitness×0.28 + (body.appeal×2)×0.25 + faceCare×0.20 + hairCare×0.15 + dentalCare×0.12)`  
   - Weights: **fitness 28%** (highest), body 25%, face 20%, hair 15%, dental 12%. All 0–100 (body.appeal×2 scales 0–50→0–100).

2. **Looks** = beauty + hygiene + clothing.
   - `looks = clamp(0, 100, round(beauty×0.5 + hygiene×0.25 + clothing×0.25))`.

3. **$beauty** is no longer used in the formula; beauty is 0 at start and fully derived. (If items/prologue used to add to $beauty, they can be reworked to add to fitness, faceCare, etc., or a small base term can be reintroduced later.)
