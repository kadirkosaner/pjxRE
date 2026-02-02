# Makeup System – Full Spec (English in-game)

**All in-game strings, style names, variable values, and UI text: English.**

---

## 1. Current Looks Formula (from codebase)

**Beauty (0–100):**
- `fitness × 0.28` + `body.appeal×2 × 0.25` + `faceCare × 0.20` + `hairCare × 0.15` + `dentalCare × 0.12`
- Penalty: face+dental sum < 25 → beauty × 0.12; < 50 → beauty × 0.40

**Looks (0–100) – after makeup integration:**
```
looks = beauty × 0.50  +  hygiene × 0.10  +  clothingScore × 0.20  +  makeup × 0.20
```
- Source: `StatCalculator.twee` (recalculateStats), `systemWidgets.twee` (calculateLooks fallback)
- Confidence: `charisma×0.5 + looks×0.3`
- **makeup** = 0–100 score from $makeup (state/style/quality); see §3.

---

## 2. Makeup System – All Parts

### 2.1 Items
| Item | Id | Use |
|------|-----|-----|
| Makeup kit (existing) | `makeup_kit` | Apply makeup at mirror; 1 use = 1 application; style chosen on screen. |
| Portable makeup (existing) | `portable_makeup` | Same as makeup_kit at mirror (optional: allow both). |
| Wet wipes (new) | `wet_wipes` | Remove makeup only: set state to "off", no bonus. |

### 2.2 Variables (all English)
| Variable | Type | Description |
|----------|------|-------------|
| `$makeup.style` | 1–5 | Current style: 1=Light, 2=Medium, 3=Heavy, 4=Slutty, 5=Bimbo. 0 = no makeup. |
| `$makeup.state` | string | "fresh" \| "smeared" \| "off" |
| `$makeup.quality` | 0–100 | When < 50 → counts as smeared for looks and notification. Decays over time/events. |
| `$skills.practical.makeup` | 0–100 | Makeup skill: tier unlock + quality floor at apply + skill gain cap per style. |

**Initial state:** `$makeup = { state: "off", style: 0, quality: 0 }`. Init in variablesBase or charPlayer.

**Smeared notification:** Shown in **StatCalculator** (recalculateStats), same pattern as Mood Low / Energy Low: use temporary `$_makeupSmearedWarningShown`. When makeup is on and (quality < 50 or state "smeared"), if `!$_makeupSmearedWarningShown` then `window.notifyWarning("Your makeup has smeared.")` and set `$_makeupSmearedWarningShown = true`. When quality ≥ 50 or state "off", set `$_makeupSmearedWarningShown = false`. No `$makeup.smearedNotificationShown` — StatNotifications is for stat-change toasts; this one-off warning lives in StatCalculator like Mood/Energy.

**Migration:** Existing `$appearance.makeupLevel` and `$gameSettings.makeupWearOff` in dailyAppearanceUpdate will be replaced by new logic: decay `$makeup.quality` when state ≠ "off", and use `$makeup` for looks.

### 2.3 Style names (English, for UI and passages)
| style | Display name |
|-------|----------------|
| 1 | Light |
| 2 | Medium |
| 3 | Heavy |
| 4 | Slutty |
| 5 | Bimbo |

### 2.4 Unlock by corruption
| Style | Unlock at corruption |
|-------|----------------------|
| 1 – Light | 1 |
| 2 – Medium | 3 |
| 3 – Heavy | 4 |
| 4 – Slutty | 5 |
| 5 – Bimbo | 5 |

No extra condition for Bimbo.

### 2.5 Skill tier (which style can be applied)
| Skill range | Unlocked styles |
|-------------|------------------|
| 0–20 | 1 (Light) only |
| 20–40 | 2 (Medium) |
| 40–75 | 3 (Heavy) |
| 75–100 | 4 (Slutty), 5 (Bimbo) |

**Skill gain cap per style:** Doing a style only raises skill up to that tier’s max (Light→20, Medium→40, Heavy→75, Slutty/Bimbo→100). To progress further, player must use a higher style.

**Skill gain per application:** e.g. +1 or +2 to `$skills.practical.makeup` (capped by tier above). Define exact amount in implementation.

### 2.6 Quality at apply (Option B)
- **Formula:** `quality = 50 + (skill * 0.5)` → skill 0 ⇒ 50, skill 100 ⇒ 100. Floor 50 so applied makeup is never immediately smeared.
- **Smeared** only when quality later drops below 50 (time/events) or state set manually to "smeared".

### 2.7 Fresh / Smeared / Off
- **Fresh:** state "fresh" and quality ≥ 50 → full makeup bonus.
- **Smeared:** state "smeared" or quality < 50 → half bonus (or fixed low value).
- **Off:** state "off" (wet wipes or event) → bonus 0.
- **Manual control:** Passages can set `$makeup.state = "smeared"` or `"off"`, `$makeup.quality = 30`, etc.
- **Smeared notification:** In StatCalculator (recalculateStats): when makeup on and quality < 50 (or state smeared), if `!$_makeupSmearedWarningShown` then `notifyWarning("Your makeup has smeared.")` and `$_makeupSmearedWarningShown = true`; when quality ≥ 50 or state "off", set `$_makeupSmearedWarningShown = false`. Same pattern as Mood Low / Energy Low; no extra $ variable.

### 2.8 Quality decay
- **Where:** In `dailyAppearanceUpdate` (same place as current makeup wear-off). When `$makeup.state !== "off"`, decrease `$makeup.quality` (e.g. -15 or -20 per day). If quality < 50 after decay, treat as smeared (and notification on next stat calc if not yet shown).
- **Optional:** Decay amount skill-based (higher skill = slower decay).
- **Remove:** Old block that did `$appearance.makeupLevel -= 20`; replace with new `$makeup.quality` decay. New looks formula uses `$makeup` only.

### 2.9 Character panel (optional)
- Show makeup status in character modal: e.g. "Makeup: Fresh / Smeared / Off" and "Style: Light" (or current style name). Only if implementation includes it.

---

## 3. Looks Integration

**New formula (makeup as direct 20% component):**
```
looks = beauty×0.50 + hygiene×0.10 + clothingScore×0.20 + makeup×0.20
```
Capped 0–100. Replaces previous formula in `recalculateStats`.

**Makeup score (0–100) – exact math**

1. **Style base (max score for that style):**
   - style 1 → 20, style 2 → 40, style 3 → 60, style 4 → 80, style 5 → 100  
   - Formula: `styleBase = style × 20` (style 1–5)

2. **If state is "off" (or no makeup):**
   - `makeupScore = 0`

3. **If state is "fresh" and quality ≥ 50:**
   - `makeupScore = styleBase` (full value: 20, 40, 60, 80, or 100)

4. **If state is "smeared" or quality < 50 (makeup on but damaged):**
   - `makeupScore = styleBase × (quality / 100)`  
   - quality 0 → 0, quality 50 → half of styleBase, quality 100 → full styleBase (but then we’d treat as fresh; so in practice smeared = quality scaling)

5. **Edge:** If state is "fresh" but quality < 50 (e.g. decay just crossed), treat as smeared: use `styleBase × (quality / 100)`.

**Single formula (implementation):**
```
styleBase = (style >= 1 && style <= 5) ? (style * 20) : 0
if state === "off" or style === 0:  makeupScore = 0
else if quality >= 50 and state === "fresh":  makeupScore = styleBase
else:  makeupScore = round(styleBase * (quality / 100))   // smeared or damaged
```
Clamp makeupScore to 0–100.

**Style → styleBase (max):**
| Style | styleBase |
|-------|-----------|
| 1 – Light | 20 |
| 2 – Medium | 40 |
| 3 – Heavy | 60 |
| 4 – Slutty | 80 |
| 5 – Bimbo | 100 |

Examples: Off → 0. Fresh Bimbo (quality 100) → 100 → looks +20. Smeared Bimbo (quality 40) → 40 → looks +8. Fresh Light (quality 80) → 20 → looks +4.

**Implementation:** In recalculateStats, compute `_makeupScore` from $makeup (state, style, quality) as above, then:
```
$looks = Math.max(0, Math.min(100, Math.round(_beauty*0.50 + ($hygiene||0)*0.10 + ($clothingScore||0)*0.20 + _makeupScore*0.20)))
```
Confidence already uses `$looks`, so it will reflect makeup automatically.

---

## 4. Flow Summary

1. **Apply makeup:** Mirror → Makeup area → require makeup_kit (or portable_makeup) 1 use → list styles unlocked by corruption → filter by skill tier → player picks style → consume 1 use, set quality = 50 + (skill×0.5), state = "fresh", style = chosen, increase skill (cap by tier).
2. **Remove makeup:** Wet wipes → state = "off", style/quality unused for looks, bonus 0.
3. **Stat calc:** Every recalculateStats: compute makeup score 0–100 from state/style/quality; looks = beauty×0.50 + hygiene×0.10 + clothingScore×0.20 + makeup×0.20, capped 0–100. Smeared toast: same block as Mood/Energy — if makeup on and (quality < 50 or state "smeared") and !$_makeupSmearedWarningShown then notifyWarning("Your makeup has smeared.") and $_makeupSmearedWarningShown = true; else if quality ≥ 50 or state "off" then $_makeupSmearedWarningShown = false.
4. **Events/Passages:** Set `$makeup.quality`, `$makeup.state` for manual control (e.g. crying scene → quality 30 or state "smeared").

---

## 5. Passage / entry names (English)

- Mirror entry to makeup: e.g. "Makeup" button → passage `mirrorMakeup` (style selection).
- After choosing style: `mirrorMakeupApply` (consume kit, set quality/state/style, skill gain, advance time, return to Mirror or mirrorMakeup).
- Remove makeup: `mirrorMakeupRemove` (wet wipes, set state "off", return).

---

## 6. Checklist – nothing missing

- [x] Items: makeup_kit, portable_makeup (optional), wet_wipes (new).
- [x] Variables: $makeup.style, .state, .quality; $skills.practical.makeup; init and migration from makeupLevel.
- [x] All copy and style names in English.
- [x] Corruption unlocks (1,3,4,5,5).
- [x] Skill tiers and per-style skill cap.
- [x] Quality at apply (floor 50), decay in dailyAppearanceUpdate, manual set in passages.
- [x] Smeared notification: StatCalculator, $_makeupSmearedWarningShown (like Mood/Energy), no $makeup flag.
- [x] Looks formula: beauty×0.50 + hygiene×0.10 + clothingScore×0.20 + makeup×0.20, capped 0–100; makeup score 0–100 from state/style/quality.
- [x] Passage names and flow (mirrorMakeup, mirrorMakeupApply, mirrorMakeupRemove).
