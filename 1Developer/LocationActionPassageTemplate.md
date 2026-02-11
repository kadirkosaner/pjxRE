# Location-Based Action Passage Template

Standard structure for all action passages that start from a location and return to a location. Use this when creating or refactoring action passages.

**Reference example:** `passages/4 - Actions/maplewood/familyHouse/Kitchen/drinkCoffee.twee`

---

## Two Variants

| Type | When to use | Return target |
|------|-------------|----------------|
| **Fixed duration** | Single button (e.g. "Coffee", "Drink Water") | Fixed passage (e.g. `fhKitchen`) |
| **Duration picker** | `<<btnPicker>>` with preset (e.g. "Rest", "Watch TV") | `$activityOrigin` (set on location) |

---

## 1. Fixed-Duration Action (e.g. drinkCoffee)

Use when the action has a single, fixed duration and a single return passage.

```
<<nobr>>
<<silently>>
    <<set $location = "PASSAGE_ID">>
    <<gainStat "statName" value>>
    <<loseStat "statName" value>>
    <<flushNotifications>>
    <<advanceTime MINUTES>>
    <<recalculateStats>>
    /* optional: <<run window.notifySuccess("Message")>> */
<</silently>>

<<narrative "Action Title">>
English narrative text. Describe what the player does and how it feels.
<</narrative>>

<<vid "assets/content/scenes/.../file.mp4" "100%">>

<div class="location-actions">
    <<btn "Finish" "PASSAGE_ID">><</btn>>
</div>
<</nobr>>
```

**Rules:**
- **Silently block order:** `$location` → stat changes → `flushNotifications` → `advanceTime` → `recalculateStats`. Optional `notifySuccess` after stats.
- **Language:** All visible text in English (narrative, button labels).
- **Return:** Button goes back to the same location passage (`PASSAGE_ID`).
- **Video:** Use `<<vid "path" "100%">>` or `"60%"` as needed. Path: `assets/content/scenes/maplewood/...` (lowercase `familyHouse` in path).

---

## 2. Duration-Picker Action (e.g. backyardRest, parkRest)

Use when the action is triggered via `<<btnPicker "Label" "thisPassage" "presetName">>` and the return passage is the origin location.

```
<<silently>>
    <<set $location = $activityOrigin>>
    <<set $selectedDuration = $selectedDuration || 30>>
    <<advanceTime $selectedDuration>>
    <<loseStat "stress" value>>
    <<gainStat "mood" value>>
    <<gainStat "energy" value>>
    <<flushNotifications>>
    <<recalculateStats>>
    <<run $(document).trigger(':passagerender')>>
    /* optional: random video */
    <<set _vidNum = random(1, N)>>
    <<set _restVid = "assets/content/scenes/.../file" + _vidNum + ".mp4">>
<</silently>>

<<narrative "Action Title">>
English narrative text.
<</narrative>>

<<vid _restVid "100%">>

<div class="location-actions">
    <<btn "Continue" $location>><</btn>>
</div>
```

**Rules:**
- **Origin:** Caller must set `$activityOrigin` before opening the picker (e.g. in the location passage).
- **Silently block order:** `$location = $activityOrigin` → `$selectedDuration` default → `advanceTime $selectedDuration` → stat changes → `flushNotifications` → `recalculateStats` → `:passagerender` → video path.
- **Return:** Button uses `$location` (same as `$activityOrigin`) so the player returns to where they started.
- **Language:** All visible text in English.

---

## Checklist for Any Location Action

- [ ] `$location` set correctly (fixed passage ID or `$activityOrigin`).
- [ ] `advanceTime` called (fixed number or `$selectedDuration`).
- [ ] Stats updated before `advanceTime`; `flushNotifications` and `recalculateStats` after.
- [ ] `<<narrative "Title">>` with English text.
- [ ] One media block: `<<vid "..." "100%">>` or `<<vid _var "100%">>` (or `<<image>>` if no video).
- [ ] `<div class="location-actions">` with a single return button: "Finish" / "Continue" → correct target.
- [ ] All UI text in English.

---

## Reference: drinkCoffee.twee (canonical fixed-duration)

```twee
<<nobr>>
<<silently>>
    <<set $location = "fhKitchen">>
    <<gainStat "energy" 10>>
    <<loseStat "stress" 5>>
    <<flushNotifications>>
    <<advanceTime 10>>
    <<recalculateStats>>
<</silently>>

<<narrative "Coffee">>
You brew a fresh cup and take a moment at the counter. The warmth in your hands and the familiar smell help you pause. You sip slowly, feeling a little more alert and a bit less wound up.
<</narrative>>

<<vid "assets/content/scenes/maplewood/familyHouse/kitchen/coffee.mp4" "100%">>

<div class="location-actions">
    <<btn "Finish" "fhKitchen">><</btn>>
</div>
<</nobr>>
```

Apply this structure and order to all location-based action passages for consistency.
