# Emma Talk Scenes — Prompt Refactor Rules

### Target Model: Nano Banana Pro 2

### Purpose: Stabil multi-character prompts + populated diner scenes

This document describes how to refactor the existing **Emma Talk Scenes prompt file**.

The goal is to improve:

- Character separation (Player vs Emma)
- Scene stability in Nano Banana
- Consistent environment population
- Prevention of clothing mix-ups
- More believable diner scenes

The refactor should **preserve all scene IDs and mechanics**, but restructure prompts.

---

# GLOBAL PROMPT STRUCTURE

Every prompt must follow this structure:

Nano Banana Pro 2 Style

Scene:
Characters:
Background extras:
Action:
Lighting:
Gaze:

--ar 16:9

Do not keep old linear sentence prompts.

---

# CHARACTER DEFINITIONS

These must always be separated clearly.

### Player (Visitor)

Player (customer, male):
casual civilian clothes,
plain t-shirt,
blue jeans,
sneakers

### Player (Dishwasher)

Player (dishwasher worker):
faded black t-shirt,
black pants,
thick black waterproof rubber apron

### Emma

Emma (waitress):
ruby red short-sleeve fitted blouse,
black pencil skirt above the knee,
white waist apron tied at the back

If the apron is removed during the scene:

Emma (waitress, apron removed):
ruby red short-sleeve fitted blouse,
black pencil skirt above the knee

---

# BACKGROUND EXTRAS RULES

### dinerInterior scenes

Add:

Background extras:
several diner customers sitting in booths,
a couple drinking coffee,
a trucker sitting at the counter,
another waitress moving through the diner

---

### dinerKitchen scenes

Add:

Background extras:
cook working at the grill,
another dishwasher stacking plates,
tickets hanging on the rail

---

### dinerStorage scenes

Add:

Background extras:
quiet backroom atmosphere,
stacked crates and supplies,
no customers present

---

# SCENE STRUCTURE RULE

Old prompts look like this:

"Cinematic two-shot medium framing, retro 1950s American diner interior..."

These must be rewritten using the structure below.

Example transformation:

OLD:

Cinematic two-shot medium framing, retro 1950s American diner interior. Player stands nearby in casual civilian clothes (plain t-shirt, blue jeans, and sneakers). Emma passes by with a stack of menus...

NEW:

Nano Banana Pro 2 Style

Scene:
retro 1950s American diner interior,
chrome counter,
vinyl booths,
1950s diner atmosphere

Characters:

Player (customer, male):
plain t-shirt,
blue jeans,
sneakers

Emma (waitress):
ruby red short-sleeve fitted blouse,
black pencil skirt above the knee,
white waist apron tied at the back

Background extras:
several diner customers sitting in booths,
a couple drinking coffee,
a trucker sitting at the counter,
another waitress moving through the diner

Action:
Emma passes by with a stack of menus,
tucking a strand of hair behind her ear.

Player stands nearby watching her.

Lighting:
soft morning daylight through the diner windows

Gaze:
Player looking at Emma,
Emma looking toward a distant table.

--ar 16:9

---

# ACTION RULES

Action should describe:

• Emma's movement  
• Player position  
• Interaction context

Avoid writing actions as long cinematic sentences.

Prefer short action lines.

Example:

Action:
Emma wipes down a booth table with one hand while balancing a tray of empty mugs.

Player sits in the booth watching the table being cleaned.

---

# GAZE RULES

Gaze must always specify **both characters**.

Example:

Gaze:
Player looking at Emma,
Emma looking toward the kitchen door.

Never omit gaze direction.

---

# LIGHTING RULES

Lighting must reflect scene time:

Morning scenes:

Lighting:
soft morning diner light

Afternoon scenes:

Lighting:
warm afternoon sunlight

Kitchen scenes:

Lighting:
harsh kitchen fluorescent light

Storage scenes:

Lighting:
dim storage room light

---

# IMPORTANT STABILITY RULES

Always follow these:

1. Characters must always be defined in separate blocks.
2. Player clothing must never appear inside Emma's block.
3. Emma uniform must never appear inside Player block.
4. Background extras must exist in dinerInterior scenes.
5. Storage scenes must remain empty of customers.
6. Do not merge characters into one sentence.

---

# FINAL OUTPUT FORMAT

Each scene must end exactly like this:

--ar 16:9

Do not remove existing IDs.

Example:

ID: emmaFrontMorning-1  
Mekan: dinerInterior  
Prompt:  
(rewritten structured prompt)

---

# END OF RULESET
