# Ruby's Diner - JSON Prompt Generation Agent Guide

This file defines how JSON prompt files should be generated for character scenes. The same format and rules apply to all characters.

---

## 1. JSON FILE FORMAT (NEW)

The Generator now produces prompts automatically. The JSON file no longer contains long prompt text but only the variable data.

```json
{
  "scene_character": "characterKey",
  "scenes": [
    {
      "id": "uniqueImageId",
      "location": "locationKey",
      "characterAction": "leans on the counter scrolling through her phone",
      "talkingVerb": "chatting with",
      "playerPosition": "stands nearby",
      "playerOutfit": "cream cable-knit sweater and dark wash jeans",
      "lighting": "Warm afternoon light",
      "npcs": ["tom", "emma"],
      "npcActions": { "emma": "serving tables" }
    }
  ]
}
```

### Fields:

- `scene_character`: Character key from config.json.
- `id`: Static image filename from the Twee file.
- `location`: Location key (dinerInterior, dinerKitchen, etc.).
- `characterAction`: Current action of the scene character.
- `talkingVerb`: Either `talking to` or `chatting with`.
- `playerPosition`: Position of the player (`stands nearby`, `sits at a booth facing her`, etc.).
- `playerOutfit`: Current outfit of the player. **REQUIRED** — if left empty, the default work attire from config is used. For `common` phase always provide a unique casual outfit from the pool. For `dishwasherOnBreak` phase use work attire.
- `lighting`: Scene lighting description.
- `npcs`: Keys of other characters appearing in the scene.
- `npcActions`: Special actions for NPCs (optional).

---

## 2. IMAGE REFERENCE ORDER

Generator.py loads image references in the following order:

| Order   | Variable                | Description                       |
| ------- | ----------------------- | --------------------------------- |
| image1  | location                | Location reference image (layout) |
| image2  | scene_character         | Main character (scene character)  |
| image3  | player                  | Player character                  |
| image4+ | `npcs[0]`, `npcs[1]`... | Additional NPCs in order          |

---

## 3. CHARACTER DEFINITIONS

Physical descriptions, roles, and costumes for characters are now automatically pulled from `config.json`. You do not need to write manual costumes in the prompt anymore.

---

## 4. LOCATION-BASED PROMPT TEMPLATES

Location templates are defined within `Generator.py`. The Generator automatically selects the appropriate template (dinerInterior, back_empty, back_npc) based on the chosen location and NPC count.

> **dinerInterior RULE:** This location must always have 2 NPCs, and `npcs[1]` must always be `"tom"` (the clerk at the cash register). `npcs[0]` should be another character (vince/emma/jake) on the diner floor.

---

## 5. PHASE RULES

### common (Player is not an employee, just a visitor)

- **Player Outfit:** Randomized daily/casual clothes (different for each scene).
- **Scene Character:** In standard work attire.
- **Location:** Usually dinerInterior (front).
- **Tone:** Relaxed, casual, no work talk.

### dishwasherOnBreak (Player is a dishwasher, on break)

- **Player Outfit:** Work attire - `faded black t-shirt, black pants, and black bib apron with red Ruby's Diner script`.
- **Scene Character:** In standard work attire.
- **Locations:** dinerKitchen, dinerStorage, dinerInterior (sometimes goes to the front in the evenings).

### dishwasherDone (Player's shift is over)

- **Player Outfit:** ~50-60% work attire, ~40-50% casual clothes (mixed).
- **Scene Character:** In standard work attire (sometimes may have changed in "done" scenes - check Twee).
- **Locations:** dinerKitchen, dinerStorage, dinerInterior.

---

## 6. PLAYER CASUAL OUTFIT POOL

Select a different casual outfit for each scene. Do not repeat. Examples:

- cream cable-knit sweater and dark wash jeans
- white graphic tee and light blue boyfriend jeans
- olive utility jacket over a black tank top and gray jeans
- dusty pink blouse and black straight-leg pants
- heather gray long-sleeve shirt and dark denim shorts
- navy blue henley top and faded blue jeans
- black fitted turtleneck and tan chinos
- maroon cropped cardigan over a white camisole and blue jeans
- light denim shirt and black leggings
- mustard yellow knit sweater and dark skinny jeans
- charcoal zip-up hoodie and olive cargo pants
- white linen button-down and high-waisted khaki pants
- coral sleeveless top and light gray jogger pants
- forest green flannel shirt and black jeans
- lavender oversized sweater and dark bootcut jeans
- tan suede jacket over a white tee and distressed jeans
- burgundy mock-neck top and charcoal slim pants
- striped blue and white breton top and navy cigarette pants
- rust-colored flannel shirt and black skinny jeans
- sage green hoodie and light gray jogger pants
- navy blue bomber jacket and black leggings
- gray zip-up hoodie and dark jogger pants
- white oversized t-shirt and high-waisted black jeans
- denim jacket over a plain black tee and light blue jeans
- camel knit cardigan over a white tee and dark wash jeans
- black cropped hoodie and dark skinny jeans
- loose burgundy sweater and black leggings
- fitted olive green jacket over a white t-shirt and blue jeans
- striped long-sleeve shirt and olive cargo pants
- lavender cropped sweater and high-waisted dark jeans

---

## 7. LIGHTING OPTIONS

### dinerInterior:

| Time      | Options                                                                          |
| --------- | -------------------------------------------------------------------------------- |
| Morning   | Warm morning light, Soft morning light, Early morning light, Morning diner light |
| Afternoon | Warm afternoon light, Afternoon diner light, Bright afternoon light              |
| Evening   | Warm evening light, Evening diner light, Soft evening light                      |

### dinerKitchen:

| Time      | Options                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------- |
| Morning   | Fluorescent kitchen lighting, Warm kitchen morning light, Bright kitchen fluorescent light      |
| Afternoon | Warm afternoon kitchen light, Afternoon kitchen fluorescent light, Calm afternoon kitchen light |
| Evening   | Warm evening kitchen light, Evening kitchen fluorescent light                                   |

### dinerStorage:

- Dim storage room light
- Low storage room lighting

---

## 8. TALKING VERBS AND POSITIONS

### Talking Verbs - Use interchangeably:

- `talking to`
- `chatting with`

### Player Positions - Must include spatial side (left/right/across):

- `who stands on the left side nearby facing him/her`
- `who leans against the counter on the left facing him/her`
- `who sits on a counter stool on the right facing him/her`
- `who stands on the right side beside the counter facing him/her`
- `who sits at a booth on the left facing him/her`
- `who stands in the doorway on the left facing him/her` (for storage/kitchen)
- `who leans against the shelves on the right facing him/her` (for storage)
- `who stands on the left beside him/her facing him/her`
- `who leans against the prep table on the right facing him/her` (for kitchen)
- `who leans against the wall on the left facing him/her`
- `who sits across from him/her at the booth facing him/her`
- `who leans against the opposite wall on the right facing him/her` (for storage)

**RULE:** Every position MUST include a spatial side (left/right/across). Do not use vague positions like "stands nearby" without a side.

---

## 9. STRICT RULES (VIOLATIONS = INVALID OUTPUT)

### DO NOT:

1. **Add extra items to the location.** Do not write things like jukebox, pastry case, stool details, or register details that are not in image1. Only write `matching image1 layout`.
2. **Make characters pose for the camera.** Characters must be looking at each other, not the camera. Always use `facing him/her`.
3. **Stay in the same position.** The player should not just sit or just stand. Use a variety of positions.
4. **Share images.** Each dialogue entry must have a unique image. Do not use the same ID in multiple topics.
5. **Write physical traits.** DO NOT write descriptions like "blue-eyed blonde". Face reference comes from the images. Use only costumes and minimal descriptors (e.g., "brunette young woman", "male chef").
6. **Invent furniture in Storage.** Do not add "stacked crates" or "folding chair". Use general positions.
7. **Change scene character costume.** Work attire is fixed (unless explicitly stated in the "done" phase in Twee).
8. **Leave `playerOutfit` empty in common phase.** Always explicitly set a unique casual outfit — it is directly injected into the prompt and used by the model for costume accuracy.

### DO:

1. **Read the narrative/dialog in Twee for each scene** and extract the action from there.
2. **Use talking poses** - characters are talking and looking at each other.
3. **Provide position variety** - a mix of sitting, standing, and leaning.
4. **Give a unique ID to each dialogue entry.**
5. **Do not repeat casual outfits** - each scene should have a different outfit.
6. **Select lighting description based on time** - morning/afternoon/evening.

---

## 10. IMAGE ID NAMING RULE

Format: `[character][Location][Time]-[number]`

### Location Codes:

- `Front` = dinerInterior
- `Kitchen` = dinerKitchen
- `Storage` = dinerStorage
- `Corridor` = dinerCorridor
- `Dressing` = dinerDressingRoom
- `Manager` = dinerManager

### Time Codes:

- `Morning`
- `Afternoon`
- `Evening`

**All IDs must be UNIQUE across all phases.**

---

## 11. NEW JSON FORMAT EXAMPLES

### dinerInterior (Common Phase):

```json
{
  "id": "sofiaFrontAfternoon-1",
  "location": "dinerInterior",
  "characterAction": "leans on the counter scrolling through her phone",
  "talkingVerb": "chatting with",
  "playerPosition": "stands nearby",
  "playerOutfit": "cream cable-knit sweater and dark wash jeans",
  "lighting": "Warm afternoon light",
  "npcs": ["emma", "tom"],
  "npcActions": { "emma": "serving tables" }
}
```

### dinerKitchen (OnBreak Phase):

```json
{
  "id": "sofiaKitchenMorning-1",
  "location": "dinerKitchen",
  "characterAction": "leans against the prep counter rubbing her temples",
  "talkingVerb": "talking to",
  "playerPosition": "stands nearby",
  "lighting": "Fluorescent kitchen lighting",
  "npcs": ["mike"],
  "npcActions": { "mike": "scrubbing dishes" }
}
```

---

## 12. NEW JSON FIELDS REFERENCE

| Field             | Description                       | Example                                         |
| ----------------- | --------------------------------- | ----------------------------------------------- |
| `characterAction` | What the scene character is doing | `leans on the counter`, `smiles at her phone`   |
| `talkingVerb`     | Conversation action               | `talking to`, `chatting with`                   |
| `playerPosition`  | Position of the player            | `stands nearby`, `sits at a booth facing her`   |
| `playerOutfit`    | Player's outfit                   | A selection from the casual pool or work attire |
| `npcActions`      | Specific actions for NPCs         | `{"emma": "serving tables"}`                    |

---

## 13. ANTI-CONFUSION RULES (CHARACTER IDENTITY)

Since this is image-to-image generation, the model uses reference face images directly. Text descriptions should NOT describe faces — the image handles that. Follow these rules to prevent character duplication and missing characters:

### Player Must Always Appear
- `playerPosition` must always include a **spatial side** (left, right, across) so the model knows WHERE to place the player
- Never use vague positions like "stands nearby" — always say "stands on the left side nearby"
- The player is image3 — if the prompt doesn't clearly reference their position, the model may skip them

### Prevent Character Duplication
- **Do NOT describe character faces** in `characterAction` — faces come from the reference images
- Each character must be in a **different spatial zone**: scene character = center, player = left/right, NPC = behind counter / background
- For dinerInterior: npcs[1] must have a distinct location from the scene character (one at counter, other on floor)

### Spatial Zone Rules by Location

| Location | Scene Char (image2) | Player (image3) | NPC (image4/5) |
|----------|--------------------|-----------------|-----------------|
| dinerInterior | center foreground at counter | left or right side foreground | image4 = diner floor (BOSS/Others), image5 = cash register (TOM) |
| dinerKitchen | center foreground | left or right side | background |
| dinerStorage | center foreground | left or right or doorway | background |
| dinerCorridor | center foreground | left or right side | background |

### Role Truths (Identity)
- **CHARACTER SLOTS:** image4 and image5 are NPCs. For dinerInterior, image5 is ALWAYS the clerk at the register.
- **COSTUMES:** Costumes are the only markers defined in text. Vince wears a Dark Suit (The Boss) or casual. Tom wears a white clerk shirt. Face appearance is derived EXCLUSIVELY from input images. Do NOT describe faces.
