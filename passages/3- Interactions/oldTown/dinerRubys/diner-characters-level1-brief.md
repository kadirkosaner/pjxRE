# Ruby's Diner — Level 1 Dialogue Brief

## Room-Based System

Characters move between rooms on a schedule. Dialogue must reflect **where** you find them.

### Rooms

| Room | ID | Description |
|------|----|-------------|
| Front | `dinerRubys` | Dining area, register, booths. Public space. |
| Kitchen | `dinerRubysKitchen` | Grill, dishwasher station, stainless steel. Hot, loud, busy. |
| Storage | `dinerRubysStorage` | Shelves of supplies + a small break corner with a stool and coffee machine. |
| Manager Office | `dinerRubysManagerOffice` | Vince's desk, paperwork, window overlooking the diner. |

### Context Key Format

```
[roomId]_[phase]_[timeSlot]
```

Example: `dinerRubysKitchen_workingOnBreak_afternoon`

---

## Phases

| Phase | Player State | Room Access | Tone |
|-------|-------------|-------------|------|
| `common` | No job at diner | Front only | Acquaintance visiting. Two people chatting. |
| `working` | Clocked in, actively working | All rooms | Quick exchange while busy. Player shouldn't linger. |
| `workingOnBreak` | Clocked in, on break | All rooms | Coworker mode. Relaxed, candid. |
| `workingDone` | Shift completed (8+ hours) | All rooms | Off the clock. Winding down. |

> **These four databases are completely separate. Never mix them.**

---

## Character Schedules

| Character | Front | Kitchen | Storage | Office |
|-----------|-------|---------|---------|--------|
| James (Chef) | 18–19 | 11–14, 15–18, 19–21 | 14–15 | — |
| Mike (Dishwasher) | — | 7–10, 11–15 | 10–11 | — |
| Tom (Clerk) | 10–13, 14–18 | — | 13–14 | — |
| Emma (Waitress) | 10–13, 14–16, 17–18 | 16–17 | 13–14 | — |
| Sofia (Waitress) | 12–15, 16–20 | — | 15–16 | — |
| Jake (Waiter) | 14–17, 18–22 | — | 17–18 | — |
| Vince (Manager) | 12–14, 17–19 | 16–17 | — | 10–12, 14–16, 19–22 |

---

## Dialogue Rules

### Core Rule

**These are real people. They are not waiting for the player.**

The character was already doing something. The player interrupted them. Dialogue must start mid-action.

### DO

- Character is mid-task when player arrives
- Conversations can end abruptly or trail off
- Specific details: not "the coffee machine" but "that coffee machine is leaking again"
- Subtext over text: Vince's creepiness comes from behavior, not words
- Silence and short answers are natural
- Room affects what the character is doing (kitchen = cooking/plating, storage = resting/smoking, front = serving/cleaning)

### DON'T

- Long monologues or punchline-driven sentences
- Saying everything explicitly — "I like you", "You're a good worker"
- Clean endings for every conversation
- Making the player sound too witty — player talks like a normal person
- Mentioning orders, tables, or menus in `common` phase

### Player Dialogue

```
NPC: 4–8 words
Player: 5–10 words
```

Good:
- "Didn't know they had you back here."
- "Looks like it's been a long day."
- "This machine looks ancient."

Bad (too short): "Yeah." / "Hm." / "Maybe."
Bad (too long): "I was just passing through and noticed people working so I thought I'd stop by."

### Silence

Sometimes the player says nothing. This is natural.

```
Emma: You need something?
Player: ...
Emma: Alright. Busy anyway.
```

Use rarely but effectively.

---

## Character Profiles

### James — Chef (`dinerChef`)

**Personality:** Focused, no-nonsense, takes pride in his work. Married with kids.
**Tone:** Direct, short, doesn't waste words. Occasionally dry humor.

**Room behavior:**
- **Kitchen:** In his element. Cooking, plating, barking at timing. Talks while working, never stops moving. Respects competence.
- **Storage (break):** Rare quiet moment. Might eat standing up, check his phone, stretch his back. More relaxed, might mention family.
- **Front:** Unusual for him. Checking on something, grabbing a supply, or stretching his legs. Brief and purposeful.

**Common topics:** cooking, the kitchen, family mentions, equipment
**Working topics:** order flow, kitchen rhythm, food quality, player's work
**Break topics:** tired back, kids, quick smoke, the quiet

---

### Mike — Dishwasher (`dinerDishwasher`)

**Personality:** Laid-back, young, easygoing. Doesn't take things too seriously.
**Tone:** Casual, sometimes lazy, but friendly.

**Room behavior:**
- **Kitchen:** At the sink, loading the machine, scrubbing pans. Headphones in one ear. Might be humming or spacing out.
- **Storage (break):** Sitting on a crate, scrolling phone, drinking something. Most relaxed version of himself.

**Common topics:** (Mike is rarely at front — minimal common topics)
**Working topics:** dishes, the machine, kitchen chaos, what people leave on plates
**Break topics:** music, plans after work, boredom, phone stuff

---

### Tom — Front Clerk (`dinerClerk`)

**Personality:** Reliable, kind, been here years. Vince's right hand. Has a girlfriend.
**Tone:** Warm, steady, conversational without being pushy.

**Room behavior:**
- **Front:** Behind the register. Greeting people, handling payments, keeping things running. Calm center of the storm.
- **Storage (break):** Coffee in hand, sitting on the stool. Talks about normal life stuff. Might mention his girlfriend.

**Common topics:** neighborhood, regulars, the diner's history, small talk
**Working topics:** register, customer flow, Vince's mood, daily rhythm
**Break topics:** girlfriend, weekend plans, coffee, something he read

---

### Emma — Waitress (`dinerWaitress1`)

**Personality:** Competent, always tired, professional. Been here a while and shows it.
**Tone:** Short, dry, direct. Works while talking.

**Room behavior:**
- **Front:** Moving between tables, carrying plates, wiping down. Always multitasking. Talks in fragments between tasks.
- **Kitchen:** Picking up orders, checking tickets. Focused, quick. Might complain about a table.
- **Storage (break):** Leaning against the wall, eyes closed for a second. Most human version. Might let guard down slightly.

**Common topics:** being tired, the rush, Sofia's laziness, closing time
**Working topics:** table complaints, order confusion, tips, coworker dynamics
**Break topics:** feet hurting, needing vacation, venting about a customer

---

### Sofia — Waitress (`dinerWaitress2`)

**Personality:** Self-centered, lazy, slightly aloof. Has a boyfriend.
**Tone:** Bored, distracted, on her phone.

**Room behavior:**
- **Front:** Doing the minimum. Might be leaning on the counter, checking her phone between tables. Occasionally serves when forced.
- **Storage (break):** On her phone. Texting boyfriend. Complaining about work. Most animated when talking about herself.

**Common topics:** her boyfriend, wanting to leave, boredom, gossip
**Working topics:** dodging work, customer complaints, phone, nails
**Break topics:** boyfriend drama, social media, plans for after work, complaining

---

### Jake — Waiter (`dinerWaitress3`)

**Personality:** Easygoing, social, younger energy. Single.
**Tone:** Friendly, casual, sometimes joking.

**Room behavior:**
- **Front:** Working the floor with energy. More social than the others. Chats with customers, cracks small jokes.
- **Storage (break):** Relaxing, might be eating something. Talks about people, plans, gym.

**Common topics:** sports, weekend, people-watching, light humor
**Working topics:** funny customers, tips, table dynamics, Sofia doing nothing
**Break topics:** gym, dating, food, what he's doing later

---

### Vince — Manager (`dinerManager`)

**Personality:** Performative businessman. Divorced. Overly smooth, subtly controlling. Slightly creepy through behavior, never words.
**Tone:** Too polished, slightly condescending. Likes being in charge.

**Room behavior:**
- **Front:** Walking the floor like he owns it (he does). Checking on everything, making small adjustments. Performs authority.
- **Kitchen:** Inspecting, criticizing, hovering. Staff tenses up. Quick visit, not welcome.
- **Office:** Behind his desk. Most honest version — tired, looking at numbers, slightly vulnerable when alone. Drops the performance a little.

**Vince's creepiness rule:** He NEVER says anything explicit. Instead:
- Stands slightly too close
- Looks a beat too long
- Asks unnecessarily personal questions
- Uses diminutives or pet names casually
- Offers help that feels like a test

**Common topics:** the business, expansion plans, his divorce (veiled), player's appearance
**Working topics:** performance review tone, hovering, "suggestions", checking up
**Break topics (office):** paperwork complaints, personal questions, the "real" Vince
**Kitchen topics:** inspecting food, criticizing speed, micro-managing

---

## Required Context Keys

### Per Character × Phase

**James:**
- Common: `dinerRubys_common_evening` (only at front 18–19)
- WorkingOnBreak: `dinerRubysKitchen_workingOnBreak_[morning|afternoon]`, `dinerRubysStorage_workingOnBreak_afternoon`, `dinerRubys_workingOnBreak_evening`
- WorkingDone: `dinerRubysKitchen_workingDone_[morning|afternoon|evening]`, `dinerRubysStorage_workingDone_afternoon`, `dinerRubys_workingDone_evening`

**Mike:**
- Common: (none — never at front during common access hours)
- WorkingOnBreak: `dinerRubysKitchen_workingOnBreak_morning`, `dinerRubysStorage_workingOnBreak_morning`
- WorkingDone: `dinerRubysKitchen_workingDone_[morning|afternoon]`, `dinerRubysStorage_workingDone_morning`

**Tom:**
- Common: `dinerRubys_common_[morning|afternoon]`
- WorkingOnBreak: `dinerRubys_workingOnBreak_[morning|afternoon]`, `dinerRubysStorage_workingOnBreak_afternoon`
- WorkingDone: `dinerRubys_workingDone_[morning|afternoon]`, `dinerRubysStorage_workingDone_afternoon`

**Emma:**
- Common: `dinerRubys_common_[morning|afternoon]`
- WorkingOnBreak: `dinerRubys_workingOnBreak_[morning|afternoon]`, `dinerRubysKitchen_workingOnBreak_afternoon`, `dinerRubysStorage_workingOnBreak_afternoon`
- WorkingDone: `dinerRubys_workingDone_[morning|afternoon]`, `dinerRubysKitchen_workingDone_afternoon`, `dinerRubysStorage_workingDone_afternoon`

**Sofia:**
- Common: `dinerRubys_common_[afternoon|evening]`
- WorkingOnBreak: `dinerRubys_workingOnBreak_[afternoon|evening]`, `dinerRubysStorage_workingOnBreak_afternoon`
- WorkingDone: `dinerRubys_workingDone_[afternoon|evening]`, `dinerRubysStorage_workingDone_afternoon`

**Jake:**
- Common: `dinerRubys_common_[afternoon|evening]`
- WorkingOnBreak: `dinerRubys_workingOnBreak_[afternoon|evening]`, `dinerRubysStorage_workingOnBreak_evening`
- WorkingDone: `dinerRubys_workingDone_[afternoon|evening]`, `dinerRubysStorage_workingDone_evening`

**Vince:**
- Common: `dinerRubys_common_[afternoon|evening]`
- WorkingOnBreak: `dinerRubys_workingOnBreak_[afternoon|evening]`, `dinerRubysManagerOffice_workingOnBreak_[morning|afternoon|evening]`, `dinerRubysKitchen_workingOnBreak_afternoon`
- WorkingDone: `dinerRubys_workingDone_[afternoon|evening]`, `dinerRubysManagerOffice_workingDone_[morning|afternoon|evening]`, `dinerRubysKitchen_workingDone_afternoon`

---

## Dialogue Format

```twee
{
    text: `<<set _img = "assets/content/scenes/interactions/[character]/level1/[imageName].webp">>
<<image _img "100%">>
<<narrative>>[Scene direction — short, room-specific]<</narrative>>

<<dialog "[dialogTag]">>[Character speaks]<</dialog>>
<<dialog "player">>[Player responds]<</dialog>>
<<dialog "[dialogTag]">>[Character]<</dialog>>
<<dialog "player">>[Player]<</dialog>>`,

    friendship: [1 or 2],
    trust: [0 or 1],
    love: 0,
    lust: 0
}
```

### Dialog Tags

```
dinerChef        — James
dinerDishwasher  — Mike
dinerClerk       — Tom
dinerWaitress1   — Emma
dinerWaitress2   — Sofia
dinerWaitress3   — Jake
dinerManager     — Vince
```

---

## Variant Rules

Per topic: **3 variants**
Per variant: **minimum 4 exchanges**

Level 1 traits:
- Short, casual, surface-level
- Low intimacy
- friendship: 1–2, trust: 0–1, love: 0, lust: 0

---

## Stat Guide — Level 1

```
friendship: 1 → acquaintance acknowledgment
friendship: 2 → slightly warm interaction

trust: 0 → no trust exchanged
trust: 1 → small trust gesture (shared complaint, minor honesty)
```

Most Level 1 interactions: `friendship: 1, trust: 0`

---

## Image Prompt Guide

Each context key group needs a corresponding image prompt. Format:

```
[character][Room][TimeSlot]-[variant].webp
```

Examples:
- `jamesKitchenAfternoon-1.webp`
- `emmaStorageAfternoon-1.webp`
- `vinceFrontEvening-2.webp`
- `tomFrontMorning-1.webp`

Image should show: character + room environment + time-of-day lighting + what they're doing.
