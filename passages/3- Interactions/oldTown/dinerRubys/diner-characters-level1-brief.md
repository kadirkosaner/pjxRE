# Ruby's Diner — Dialogue Generation Brief

## Instructions for the Agent

Before generating any dialogue, you **must** determine two things:

### Step 1: Which phase?

Ask or check:

> **Does the player currently have the dishwasher job at Ruby's Diner?**

| Player job status                               | Phase to use |
| ----------------------------------------------- | ------------ |
| **No job / job ended** (visiting as a customer) | `common`     |
| **Currently working as dishwasher**             | `working`    |

> These are separate dialogue databases. Do not mix them.

---

### Step 3: Natural, Slice-of-Life Conversational Style

> **Are these generic AI "Greetings, adventurer!" style lines? NO.**

- **Crucial Rule:** These must feel like **genuine, natural, everyday chit-chat (slice-of-life)**.
- Do NOT use robotic or overly formal "Hello, how may I serve you today?" lines unless it's a specific performative choice by Vince.
- Start conversations in the middle of a thought, a complaint about the diner, an observation about the weather, or a quick "Hey, how's it going."
- The characters are human beings standing on their feet for 8 hours. Reflect their exhaustion, boredom, or sleaziness **naturally**.

> **What is the current friendship level with this character?**

Currently only **Level 1** dialogues are being written.

Level 1 means:

- The player and the character **know each other by face** but are **not friends**.
- Interactions are short, standing (ayaküstü), and low-intimacy.
- No personal secrets, no deep conversations, no free food or drinks.

---

## Character Profiles

### 1. Emma (Waitress — `dinerWaitress1`)

**Core Personality:** Competent, perpetually overworked, and professionally detached. Not unkind, just busy.
**Tone:** Brisk, dry, efficient.

#### Phase: `common` (Player is NOT working a shift)

Emma treats the player as a regular customer. Her goal is to check if they need something and get back on the floor.

| Time slot | Topic keys                                     |
| --------- | ---------------------------------------------- |
| Morning   | `prep_work`, `vince`, `observation`            |
| Afternoon | `work_rush`, `sofia`, `advice`                 |
| Evening   | `closing_up`, `trouble_customers`, `smalltalk` |

**Rules:** Short, passing conversation. She ends every exchange by returning to work. **Never offers free food.**

#### Phase: `working.onBreak` (Player is MID-SHIFT as dishwasher)

Emma sees the player as a coworker who should probably be working.

| Time slot | Topic keys                                            |
| --------- | ----------------------------------------------------- |
| Morning   | `dish_backlog`, `james_orders`, `her_section`         |
| Afternoon | `lunch_rush_dishes`, `sofia_useless`, `stack_check`   |
| Evening   | `closing_dishes`, `vince_complaining`, `end_of_shift` |

**Rules:** She is brisk, hands off information, and expects the player to head back to the dish pit soon.

#### Phase: `working.done` (Player has FINISHED 8-hour shift)

Emma acknowledges the shift is over. She is slightly more relaxed but still distant (Level 1).

| Time slot | Topic keys                                              |
| --------- | ------------------------------------------------------- |
| Morning   | `early_finish`, `morning_survivor`, `quiet_kitchen`     |
| Afternoon | `post_rush_relief`, `leftover_mess`, `goodbye`          |
| Evening   | `shared_exhaustion`, `closing_duties`, `tomorrow_shift` |

**Rules:** A brief nod to surviving the shift. A bit of coworker solidarity, but no deep hanging out.

---

### 2. Sofia (Waitress — `dinerWaitress2`)

**Core Personality:** Self-absorbed, lazy, and mildly sardonic. The diner is an obstacle.
**Tone:** Bored, vague, low-energy sarcasm.

#### Phase: `common` (Player is NOT working a shift)

Sofia sees the player as a customer (= potential work). She tries to avoid taking responsibility.

| Time slot | Topic keys                               |
| --------- | ---------------------------------------- |
| Morning   | `distracted`, `complaints`, `gossip`     |
| Afternoon | `lazy`, `lunch_drama`, `vince_annoyance` |
| Evening   | `phone`, `vince`, `tips`                 |

**Rules:** Her attention is elsewhere. She tries to redirect work to Emma. **No free food.**

#### Phase: `working.onBreak` (Player is MID-SHIFT as dishwasher)

Sofia sees the player as someone to dump tasks onto or hide with.

| Time slot | Topic keys                                          |
| --------- | --------------------------------------------------- |
| Morning   | `task_dumping`, `vince_monitoring`, `fake_busy`     |
| Afternoon | `hiding_from_rush`, `tip_gossip`, `section_swap`    |
| Evening   | `early_exit_plan`, `end_shift_count`, `vince_drama` |

**Rules:** She talks to the player only when she needs something or wants to avoid Vince.

#### Phase: `working.done` (Player has FINISHED 8-hour shift)

Sofia is jealous that the player gets to leave while she might still be stuck there.

| Time slot | Topic keys                                      |
| --------- | ----------------------------------------------- |
| Morning   | `jealous_exit`, `stay_with_me`, `lucky_you`     |
| Afternoon | `abandonment`, `vince_watch`, `freedom`         |
| Evening   | `leaving_me_here`, `cleaning_complaints`, `bye` |

**Rules:** Dismissive envy. She complains that the player gets to leave.

---

### 3. Vince (Manager/Owner — `dinerManager`)

**Core Personality:** Performative businessman. Always selling something with an unsettling undercurrent.
**Tone:** Overly smooth, subtly patronizing. Words are deniable ("just good business"), but delivery creates discomfort.

#### Phase: `common` (Player is NOT working a shift)

Vince sees the player as a customer. Schmoozes with a slightly too attentive gaze.

| Time slot | Topic keys                     |
| --------- | ------------------------------ |
| Morning   | `schmooze`, `staff`, `coffee`  |
| Afternoon | `upsell`, `stress`, `regulars` |
| Evening   | `money`, `flirting`, `closing` |

**Rules:** Compliments feel a bit too personal. **Never genuinely offers free things**, always a pitch.

#### Phase: `working.onBreak` (Player is MID-SHIFT as dishwasher)

Vince is the boss checking in. He hovers and watches.

| Time slot | Topic keys                                        |
| --------- | ------------------------------------------------- |
| Morning   | `break_timing`, `cost_lecture`, `watching`        |
| Afternoon | `dish_speed`, `soap_cost`, `compliment_creep`     |
| Evening   | `closing_count`, `alone_in_kitchen`, `time_check` |

**Rules:** Uses his authority to hover near the player. Feedback is half about the job, half observation.

#### Phase: `working.done` (Player has FINISHED 8-hour shift)

The player is off the clock, giving Vince an excuse to treat them slightly more like a 'guest' again, but with creepy undertones.

| Time slot | Topic keys                                    |
| --------- | --------------------------------------------- |
| Morning   | `off_the_clock`, `good_worker`, `stay_awhile` |
| Afternoon | `sit_down`, `shift_review`, `drink_offer`     |
| Evening   | `late_night`, `ride_offer`, `alone_time`      |

**Rules:** Once the player is off the clock, his offers (to sit, a ride) become more pointed but still deniable.

---

## Dialogue Format (Twee / SugarCube)

```twee
{
    text: `<<set _img = "assets/content/scenes/interactions/[character]/level1/[character][TimeOfDay]-" + random(1,3) + ".webp">>
<<image _img "100%">>
<<narrative>>[Stage direction — short, present tense, what is the character physically doing when the player approaches]<</narrative>>
<<dialog "[dialogTag]">>[Character's opening line]<</dialog>>
<<dialog "player">>[Player's short, neutral response]<</dialog>>
<<dialog "[dialogTag]">>[Character's closing line — ends the exchange, character moves on]<</dialog>>`,
    friendship: [1 or 2],
    trust: [0 or 1]
}
```

**Dialog tags:** `"dinerWaitress1"` (Emma) · `"dinerWaitress2"` (Sofia) · `"dinerManager"` (Vince)

**Image path format:** `[character][Morning|Afternoon|Evening]-` + `random(1,3)` + `.webp`

---

## Variants per topic

Each topic key needs **3 dialogue variants** (different each time player clicks).

Each variant = 3-turn exchange (character opens → player responds → character closes).

Keep all exchanges under 4 lines total. Level 1 = short.
