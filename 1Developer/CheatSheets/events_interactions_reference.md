# Events & Interactions Reference

> Auto-generated from codebase scan. Lists all accessible events, character interactions, location activities, and adult content.

---

## Table of Contents

1. [Quest System](#quest-system)
2. [Character Interactions](#character-interactions)
3. [Location Activities](#location-activities)
4. [Work Events](#work-events)
5. [Random / Environmental Events](#random--environmental-events)
6. [Adult Content](#adult-content)

---

## Quest System

### Main Quests

| Quest ID | Title | Stages | Unlock Condition |
|----------|-------|--------|------------------|
| `find_job` | Find a Job | 12 | Quest `new_beginnings` complete |
| `something_different` | Something Different | 9 | Flag `dianaGossipUnlocked` |

#### `find_job` — Stage Flow

```
start_job_search → check_corner_shop → check_civic_center → enter_town_hall →
find_career_services → wait_in_queue → meet_with_clerk → ruby_diner_offer →
ruby_diner_interview → family_dinner_18 → family_dinner_dishes → accept_job
```

**Files:** `passages/5 - QuestSystem/Quests/findJob/quest_find_job_*.twee`
**Characters:** Player, family (dinner), Vince (manager interview)

#### `something_different` — Stage Flow

```
talk_to_girls → mirror_moment → research → talk_mom → ask_dad →
visit_mall → after_mall → find_money
```

**Files:** `passages/4 - Actions/events/oldtown/RubysDiner/diana/*.twee`
**Characters:** Emma, Sofia (gossip triggers), Mother, Father, Brother (PC), Mall clerk

| Stage | Passage | Location | Trigger |
|-------|---------|----------|---------|
| `talk_to_girls` | `emmaTalkDinerRubys_dianaGossip` / `sofiaTalkDinerRubys_dianaGossip` | Ruby's Diner | Talk to Emma & Sofia (objectives) |
| `mirror_moment` | `fhBedroom_event_beautyThoughts` | Bedroom | `forceScene`, auto-trigger |
| `research` | `brotherComputer_beautySearch` | Brother's PC | `forceScene`, auto-trigger |
| `talk_mom` | `fhParentsRoom_event_motherTalk` | Parents' Room | `forceScene`, time 23:00–24:00 |
| `ask_dad` | `fhLivingRoom_event_askDadMoney` | Living Room | Linked from `fhParentsHall_afterMotherTalk` |
| `visit_mall` | `mall_event_beautyVisit` | Mall | `forceScene`, auto-trigger |
| `after_mall` | `fhBedroom_event_mallAftermath` | Bedroom | `forceScene`, auto-trigger |
| `find_money` | `fhUpperstairs_event_walletChance` | Upstairs | Hour 23:00–23:59 |

---

### Tutorial Quests

| Quest ID | Title | Stages | Unlock Condition |
|----------|-------|--------|------------------|
| `first_shopping` | First Shopping | 2 | Flag `prologue_complete` |
| `moving_troubles` | Moving Troubles | 4 | Quest `first_shopping` complete |
| `new_beginnings` | New Beginnings | 1 | Quest `moving_troubles` complete |
| `use_computer` | Use Brother's Computer | 4 | Quest `new_beginnings` complete |

#### `first_shopping` — Stages
- `go_to_shop` — Go to corner shop
- `map_discovery` — Discover the map system

#### `moving_troubles` — Stages
- `walking_home` — Walk home through Maplewood
- `talk_to_mother` — Talk to mother in kitchen
- `fathers_news` — Father delivers bad news
- `go_to_room` — Go to bedroom (emotional scene)

#### `new_beginnings` — Stages
- `family_dinner` — Family dinner at kitchen (meal time 18:00–19:00)

#### `use_computer` — Stages
- `start_computer` — Use brother's PC
- `browse_districts` — Browse district map online
- `check_career_center` — Check career center info
- `brother_interrupts` — Brother interrupts

---

### Side Quests

| Quest ID | Title | Stages | Unlock Condition |
|----------|-------|--------|------------------|
| `go_to_mall` | Go to Mall | 2 | None |
| `check_old_town` | Check Old Town | 1 | Flag `mom_suggested_mall` |

---

## Character Interactions

### Family — Mother

| Type | Passage(s) | Location | Requirements |
|------|-----------|----------|--------------|
| Talk | `motherTalkKitchen` | Kitchen | Daily limit, energy ≥ 5 |
| Talk | `motherTalkLivingRoom` | Living Room | Daily limit, energy ≥ 5 |
| Talk | `motherTalkBackyard` | Backyard | Daily limit, energy ≥ 5 |
| Talk | `motherTalkParentsRoom` | Parents' Room | Daily limit, energy ≥ 5 |
| Watch TV | `watchTV` (mom variant) | Living Room | Mom present |
| Yoga | `runYogaMom` / `runYoga` | Living Room | Mom present, sporty outfit (2pc), yoga mat, energy ≥ 15 |
| Eat Together | `eatWithFamily` | Kitchen | Meal time window, family member present |
| Shower Encounter | `showerEncounter` → peek chain | Bathroom | Mom showering status (see [Adult](#adult-content)) |

**Talk Topics:** `MotherTopicsLevel1.twee`, `MotherTopicsLevel2.twee` — friendship tier gated

---

### Family — Father

| Type | Passage(s) | Location | Requirements |
|------|-----------|----------|--------------|
| Talk | `fatherTalkKitchen` | Kitchen | Daily limit, energy ≥ 5 |
| Talk | `fatherTalkLivingRoom` | Living Room | Daily limit, energy ≥ 5 |
| Talk | `fatherTalkBackyard` | Backyard | Daily limit, energy ≥ 5 |
| Talk | `fatherTalkGarage` | Garage | Daily limit, energy ≥ 5 |
| Watch TV | `watchTV` (dad variant) | Living Room | Dad present |
| Eat Together | `eatWithFamily` | Kitchen | Meal time window, family member present |
| Shower Encounter | `showerEncounter` → peek chain | Bathroom | Dad showering status (see [Adult](#adult-content)) |

**Talk Topics:** `FatherTopicsPreWorkLevel1.twee`, `FatherTopicsPostWorkLevel1.twee`, `FatherTopicsPostWorkLevel2.twee`

**Note:** `fatherTalkParentsRoom.twee` exists but is NOT listed in `setup.characterActions.father` — currently unreachable via normal UI.

---

### Family — Brother

| Type | Passage(s) | Location | Requirements |
|------|-----------|----------|--------------|
| Talk | `brotherTalkBedroom` | Bedroom | Daily limit, energy ≥ 5, phase/time/friendship gated topics |
| Talk | `brotherTalkKitchen` | Kitchen | Daily limit, energy ≥ 5 |
| Talk | `brotherTalkLivingRoom` | Living Room | Daily limit, energy ≥ 5 |
| Talk | `brotherTalkBackyard` | Backyard | Daily limit, energy ≥ 5 |
| Watch TV | `watchTV` (brother variant) | Living Room | Brother present |
| Eat Together | `eatWithFamily` | Kitchen | Meal time window, family member present |
| Shower Encounter | `showerEncounter` → peek chain | Bathroom | Brother showering status (see [Adult](#adult-content)) |

**Talk Topics:** School phase (`BrotherTopicsSchoolLevel1/2.twee`) vs Vacation phase (`BrotherTopicsVacationLevel1/2.twee`) — time slot + friendship level gated. Some topics grant lust.

---

### Ruby's Diner — Staff

| Character | ID | Passage | Requirements | Notes |
|-----------|----|---------|--------------|-------|
| Emma | `dinerWaitress1` | `emmaTalkDinerRubys` | Daily talk, energy | Common + DishwasherOnBreak + DishwasherDone topic pools |
| Sofia | `dinerWaitress2` | `sofiaTalkDinerRubys` | Daily talk, energy | Has Diana gossip variant |
| Jake | `dinerWaitress3` | `jakeTalkDinerRubys` | Daily talk, energy | **Possible broken link:** action says `jakeTalkDiner` but file is `jakeTalkDinerRubys` |
| James | `dinerChef` | `jamesTalkDinerRubys` | Daily talk, energy | Chef topics |
| Mike | `dinerDishwasher` | `mikeTalkDinerRubys` | Daily talk, energy | Dishwasher coworker |
| Tom | `dinerClerk` | `tomTalkDinerRubys` | `jobHoursTodayMin: 1` | Hidden if not worked today |
| Vince | `dinerManager` | `vinceTalkDinerRubys` | `jobHoursTodayMin: 1` | Manager, hidden if not worked today |

**Gossip Interactions:**
- `emmaTalkDinerRubys_dianaGossip` — Flag: `dianaGossipUnlocked` && !`emmaGossipDone`
- `sofiaTalkDinerRubys_dianaGossip` — Flag: `sofiaGossipUnlocked` && !`sofiaGossipDone`

---

### Maplewood — Other NPCs

| Character | ID | Passage | Location | Requirements |
|-----------|----|---------|----------|--------------|
| Marcus | `shopClerkMarcus` | `shopClerkTalk` | Corner Shop | Listed in characterActions |
| Lily | `parkRunnerLily` | `parkBench_firstEncounter` | Sunset Park (bench) | First bench sit triggers intro |

**Lily Follow-up:**
- Phone number swap: `PhoneSwap_Generic` — requires friendship ≥ 15
- `parkRunnerLilyTalk.twee` exists but may be unwired from normal actions

---

### Phone / Meetup System

| Type | Passage | Trigger |
|------|---------|---------|
| Meetup Hub | `Meetup.twee` | Pending phone appointment + time window + location match |
| Generic Chat | `Meetup_Generic_Chat` | Any character meetup |
| Diner Eat | `Meetup_Diner_Eat` | Meetup at diner |
| Park Walk | `Meetup_Park_Walk` | Meetup at park |
| Park Bench | `Meetup_Park_Bench` | Meetup at park bench |

---

## Location Activities

### Family House

| Activity | Passage | Location | Requirements |
|----------|---------|----------|--------------|
| Sleep | `sleep_prep` → `sleep` | Bedroom | Choose 6–9 hours |
| Nap | `runNap` | Bedroom / Couch | 15–60 min, energy-gated |
| Set Alarm | `setAlarm` | Bedroom | — |
| Yoga (solo) | `runYogaSolo` | Living Room / Backyard | Sporty outfit (2pc), yoga mat, energy ≥ 15 |
| Yoga (with Mom) | `runYoga` / `runYogaMom` | Living Room | Mom present + same as solo |
| Dance | `runDance` | Living Room | Energy ≥ 20 |
| Watch TV | `watchTV` | Living Room | Alone or with family member |
| Read | `readBtn` → Reading UI | Living Room (couch) | Book/magazine in inventory |
| Use Toilet | `useToilet` | Bathroom | — |
| Wash Face | `washFace` | Bathroom | — |
| Shower | `useBath` | Bathroom | — |
| Mirror (Grooming) | `Mirror` | Bathroom | — |
| Eat with Family | `eatWithFamily` | Kitchen | Meal windows (7-8, 12-13, 18-19) |
| Eat Food | `eatFood` | Kitchen | Food in inventory |
| Drink Water | `drinkWater` | Kitchen | — |
| Drink Coffee | `drinkCoffee` | Kitchen | — |
| Brother's PC | `brotherComputerMenu` | Brother's Room | Browse / Watch Video / Play Game |
| Backyard Rest | `backyardRest` | Backyard | — |

### Sunset Park

| Activity | Passage | Requirements |
|----------|---------|--------------|
| Walk | `parkWalk` | — (may trigger random encounters) |
| Bench (sit) | `parkBench` → `parkBench_rest` | — |
| Bench (first encounter) | `parkBench_firstEncounter` | First visit flag |
| Jog | `parkJog` | Energy, sporty outfit |
| Yoga | `parkYoga` | Sporty outfit, yoga mat |
| Rest | `parkRest` | — |
| Park WC | `parkWC` | — |

### Ruby's Diner (Non-Work)

| Activity | Passage | Requirements |
|----------|---------|--------------|
| Storage: Free Meal | `dinerRubysStorage_freeMeal` | Access to storage |
| Storage: Coffee | `dinerRubysStorage_coffee` | Access to storage |
| Storage: Rest | `dinerRubysStorage_rest` | Access to storage |

### Global

| Activity | System | Notes |
|----------|--------|-------|
| Restaurant | `restaurant.js` | Order 1 food + 1 drink, pay cash/card |
| Reading | `reading.js` | Books (multi-session) / Magazines (single-use) |
| Shopping | `shopping.js` | Buy clothes at shops/mall |
| Mirror / Grooming | `Mirror.twee` + mirror passages | Comb, creams, dental, makeup, routine |
| Inventory Use | Direct item use | Consumables (food, drinks, energy drinks) |

---

## Work Events

### Ruby's Diner — First Day Chain

Triggered on first work shift (`$jobState.firstWorkDayEventShown = false`).

| # | Passage ID | Description |
|---|-----------|-------------|
| 1 | `dinerFirstdayJob_firstWorkDayEvent` | Arrival at diner |
| 2 | `dinerFirstdayJob_dressingRoom` | Find the dressing room |
| 3 | `dinerFirstdayJob_gettingDressed` | Get into uniform |
| 4 | `dinerFirstdayJob_wardrobe` | Wardrobe selection |
| 5 | `dinerFirstdayJob_emmaEncounter` | Meet Emma |
| 6 | `dinerFirstdayJob_backToFront` | Return to front |
| 7 | `dinerFirstdayJob_kitchen` | Tour the kitchen |
| 8 | `dinerFirstdayJob_front` | Front area |
| 9 | `dinerFirstdayJob_dishwasher` | Start dishwashing |

### Ruby's Diner — Dishwashing Shift Events

Random events during dishwashing shifts. Driven by `RubysDishwashWork.twee` with random rolls and daily caps.

| Event | Passage | Trigger | Daily Cap |
|-------|---------|---------|-----------|
| Rush Surge | `dinerWork_event_rushSurge` | Neutral roll | `$daily.dishwashRushSurgeToday` |
| → Push Through | `dinerWork_event_rushSurge_pushThrough` | Player choice | — |
| → Ask for Help | `dinerWork_event_rushSurge_askHelp` | Player choice | — |
| Vince Check | `dinerWork_event_vinceCheck` | Random | `$daily.dishwashVinceCheckToday` |
| Broken Dish | `dinerWork_event_broken` | Accident pool | — |
| Clog | `dinerWork_event_clog` | Accident pool | — |
| Burn | `dinerWork_event_burn` | Accident pool, skill ≤ 15 | — |
| Emma Water | `dinerWork_event_emmaWater` | Positive pool, Emma friendship + low energy | — |
| James Snack | `dinerWork_event_jamesSnack` | Positive pool, James friendship + low energy | — |
| Sofia Chat | `dinerWork_event_sofiaChat` | Positive pool, Sofia friendship | — |
| Mike Help | `dinerWork_event_mikeHelp` | Positive pool, friendship + rush hours | — |
| Tom Chat | `dinerWork_event_tomChat` | Positive pool, friendship + non-rush hours | — |

**Post-shift:** `RubysDishwashWork_afterMini.twee` — may trigger Diana arrival event if conditions met.

### Ruby's Diner — Diana Arrival

| Passage | Trigger |
|---------|---------|
| `dinerWork_event_dianaArrival` | Employment day ≥ 3, completed required hours, `!$flags.dianaEventShown` |
| `dinerWork_event_dianaKitchen` | Linked from Diana arrival (kitchen gossip) |
| `dinerWork_event_nightThoughts` | Bedroom, `$flags.dianaEventShown && !$flags.dianaThoughtsShown` |

### Ruby's Diner — Boss Office

| Passage | Trigger |
|---------|---------|
| `jobBossOfficeCall_ruby` | Job system — warnings / discipline / firing |

---

## Random / Environmental Events

| Event | Location | Passage | Trigger |
|-------|----------|---------|---------|
| Park Bush Encounter | Sunset Park (walk) | `parkWalk_bushEncounter` | Random during `parkWalk`, requires `$contentPreferences.publicExhibition` |
| Park Bush Watch | Sunset Park | `parkWalk_bushWatch` | Follow-up choice from bush encounter |
| Bathroom Occupied | Any bathroom | `bathroomEntry` widget | NPC showering at same bathroom location |
| Sleep Naked Confirm | Bedroom | `sleep_naked_bathroom_confirm` | Player state check |

---

## Adult Content

### Summary

All adult content is gated behind `$contentPreferences` toggles set during prologue.

### Shower Encounters (Family)

**Gate:** `$contentPreferences.incest` + `.maleSexual` or `.femaleSexual`
**Additional:** Corruption ≥ 2, Lust level ≥ 2, Lust value ≥ 5

| Character | Entry | Peek Passages | Content |
|-----------|-------|---------------|---------|
| Mother | `showerEncounter_Mother` → `showerEncounter` | `showerEncounter_peek_Mother_first`, `showerEncounter_peek_Mother_repeat`, `showerEncounter_peek_Mother_continue` | Voyeur video; femaleSexual gate |
| Father | `showerEncounter_Father` → `showerEncounter` | `showerEncounter_peek_Father_first`, `showerEncounter_peek_Father_repeat`, `showerEncounter_peek_Father_continue` | Voyeur video; maleSexual gate |
| Brother | `showerEncounter_Brother` → `showerEncounter` | `showerEncounter_peek_Brother_first`, `showerEncounter_peek_Brother_repeat`, `showerEncounter_peek_Brother_continue` | Voyeur video; maleSexual gate |

**Files:** `passages/4 - Actions/maplewood/familyHouse/Bathroom/`

---

### Park Bush Encounter

**Gate:** `$contentPreferences.publicExhibition`

| Passage | Content |
|---------|---------|
| `parkWalk_bushEncounter` | Random encounter during park walk — witness explicit scene (anonymous NPCs). Sets 1-5 random variants. Arousal +5 |
| `parkWalk_bushWatch` | Continue watching choice — explicit video content |

**Files:** `passages/4 - Actions/maplewood/sunsetPark/`

---

### Toilet Scene

**Gate:** `$contentPreferences.watersports`

| Passage | Content |
|---------|---------|
| `useToilet` | Toilet use — variant content when watersports enabled |

---

### Brother Talk Topics (Mild)

Some brother talk topics grant **lust** stat changes. Not explicit scenes but romantic/suggestive undertone.

- `BrotherTopicsSchoolLevel1/2.twee`
- `BrotherTopicsVacationLevel1/2.twee`

---

### Diana Arrival (Suggestive)

**No content preference gate.** Narrative + images only (no sex widgets).

| Passage | Content |
|---------|---------|
| `dinerWork_event_dianaArrival` | Diana in revealing dress, Vince kisses/touches her — suggestive GIF, workplace tension |

---

### Sexual Widget Usage

The following widgets are **defined** but have **no invocations** in current passages:

| Widget | Purpose | Status |
|--------|---------|--------|
| `<<sexScene>>` | Full auto-tracked sex scene | **Not yet used** |
| `<<sexAct>>` | Manual sex scene (no auto-narrative) | **Not yet used** |
| `<<handjob>>` | Handjob tracking | **Not yet used** |
| `<<isVirgin>>` | Virginity check | **Not yet used** |

These are infrastructure for future content.

---

### Content Preference Flags

Defined in `variablesSettings.twee`, configured in prologue:

| Flag | Description | Currently Used in Passages |
|------|-------------|---------------------------|
| `maleSexual` | Male sexual content | Yes — shower peek (father/brother) |
| `femaleSexual` | Female sexual content | Yes — shower peek (mother) |
| `incest` | Incest content | Yes — all family shower peeks |
| `publicExhibition` | Public/exhibition content | Yes — park bush encounter |
| `watersports` | Watersports content | Yes — toilet scene |
| `futaTrans` | Futa/trans content | Defined only, not yet used |
| `ntr` | NTR content | Defined only, not yet used |
| `pregnancy` | Pregnancy content | Defined only, not yet used |
| `bdsm` | BDSM content | Defined only, not yet used |
| `nonConsensual` | Non-consensual content | Defined only, not yet used |
| `lactation` | Lactation content | Defined only, not yet used |
| `feet` | Feet content | Defined only, not yet used |
| `scat` | Scat content | Defined only, not yet used |
| `goreViolence` | Gore/violence content | Defined only, not yet used |
| `ageplay` | Ageplay content | Defined only, not yet used |

---

## Known Issues

| Issue | Details |
|-------|---------|
| Jake talk link mismatch | `setup.characterActions` says `jakeTalkDiner` but file declares `:: jakeTalkDinerRubys` |
| Father parents room unreachable | `fatherTalkParentsRoom.twee` exists but not in `setup.characterActions.father` |
| Lily talk possibly unwired | `parkRunnerLilyTalk.twee` exists but no reference found in character actions |
