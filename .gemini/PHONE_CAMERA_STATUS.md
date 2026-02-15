# 📸 Phone Camera System - Current Status & Next Steps

**Last Updated:** 2026-02-15 (status sync)

---

## ✅ COMPLETED (What's Working Now)

### 1. Camera UI & Core Functions

- ✅ Camera app render (2 sections: Selfies/Videos)
- ✅ 8 buttons (Normal, Cute, Hot, Spicy × 2)
- ✅ Locked button states with tooltips
- ✅ Corruption-based unlocks (Cute=1+, Hot=2+safe/3+public, Spicy=4+safe/5+public)
- ✅ Location-based restrictions (safe/public/forbidden/never)
- ✅ Exhibitionism check for forbidden locations
- ✅ Event handlers for all camera buttons

### 2. Media Capture System

- ✅ `phoneTakeSelfie(type)` function
- ✅ `phoneRecordVideo(type)` function
- ✅ Quality calculation (Beauty + Looks + Confidence + Exhibitionism)
- ✅ Unique media ID generation
- ✅ Timestamp recording
- ✅ Notification feedback on capture

### 3. State & Data Structure

- ✅ `$phoneGallery` initialization (`[init]` passage)
- ✅ Photos/Videos separated by category (normal/cute/hot/spicy/received)
- ✅ Media item structure:
  ```javascript
  {
    id: string,
    path: string,           // Image/video file path (from pool)
    flags: string[],        // e.g. ['nude', 'public', 'special{public_sunsetPark}']
    timestamp: {...},
    quality: number,
    from: 'player' | charId
  }
  ```

### 4. Flags System

- ✅ `getMediaFlagsForType(type, locationId, isSafe)` implemented
- ✅ Flag generation logic:
  - **Normal:** `['casual', 'clothed']`
  - **Cute:** `['cute', 'clothed']`
  - **Hot (safe):** `['sexy', 'lingerie', 'bedroom']`
  - **Hot (public):** `['sexy', 'public', 'risky', 'special{public_locationId}']`
  - **Spicy (safe):** `['nude', 'explicit', 'spread', 'bedroom']`
  - **Spicy (public):** `['nude', 'explicit', 'public', 'risky', 'special{public_locationId}']`

### 5. Media Pool Integration

- ✅ `getMediaPathFromPool(mediaKind, type, isSafe, vars, contextTags)` in `phone-camera.js`
- ✅ `setup.phoneMediaPools` defined in **`passages/0 - System/Init/variablesPhoneMediaPools.twee`**
- ✅ Structure: `photos` / `videos` → type (normal/cute/hot/spicy) → `safe` / `public` arrays of `{ path, tags? }`
- ✅ Path written to media item on capture; optional `contextTags` for tag-filtered pick (e.g. story moments)

### 6. CSS & Styling

- ✅ `phone-camera.css` with section/button styles
- ✅ Locked button styling
- ✅ Tooltip support
- ✅ Vertical centering

---

## ❌ NOT DONE YET (What's Missing)

### 1. Media Pools — DONE ✅

**File:** `passages/0 - System/Init/variablesPhoneMediaPools.twee` (exists)

- `setup.phoneMediaPools` is defined; structure: `photos`/`videos` → type → `safe`/`public` → array of `{ path, tags? }`.
- Add more entries per slot as needed; use `tags` for special/quest/location variants. Selection: `getMediaPathFromPool()` in `phone-camera.js`; use `contextTags` for tag-filtered pick.

**Optional:** Add real image/video paths and more variants; tag location-specific entries (e.g. `tags: ['sunsetPark']`).

---

### 2. Gallery UI (Phase 1)

**Status:** Placeholder only - needs full implementation

**What to Build:**

- `phoneRenderGalleryApp(vars)` - Full implementation
- Tab system (All/Selfies/Videos/Received)
- Grid display (3 columns)
- Empty state message
- Click to preview
- Filter by category

---

### 3. Gallery Preview Modal (Phase 2)

**Status:** Not started

**What to Build:**

- `openGalleryPreview(mediaId)` function
- Modal overlay with:
  - Preview (show `item.path` image/video)
  - Details (quality, date, location, flags)
  - Actions (Delete, Send to...)
- `closeGalleryPreview()` function
- `deleteGalleryItem(mediaId, type, category)` function

---

### 4. Send to Messages (Phase 3)

**Status:** Not started

**What to Build:**

- `openGalleryPicker(charId)` - Select from gallery to send
- `sendMediaToContact(mediaId, charId)` - Send the media
- Integration with Messages UI (add "Send Photo/Video" button)
- Message bubble display for media

---

### 5. Character Reactions (CRITICAL - The Main Feature)

**Status:** Not started

This is where the **"special" flags** and **context** matter most.

#### How Reactions Should Work:

**File:** `assets/system/js/ui/phone/phone-messages.js`

Create `handlePhotoReaction(charId, photo)` function:

```javascript
function handlePhotoReaction(charId, photo) {
  const char = vars.characters[charId];
  const lust = char.stats.lust || 0;
  const corruption = char.stats.corruption || 0;

  // 1. Check Photo Category (normal/cute/hot/spicy)
  const category = getCategoryFromFlags(photo.flags); // 'spicy' if has 'nude' flag

  // 2. Check Special Context (location-specific)
  const specialFlag = photo.flags.find((f) => f.startsWith("special{"));
  const isPublic = photo.flags.includes("public");

  // 3. Generate Reaction Based on:
  //    - Character's Lust/Corruption
  //    - Photo category
  //    - Special context

  let reaction = "";
  let statGain = {};

  // --- EXAMPLE: SPICY + PUBLIC ---
  if (category === "spicy" && isPublic && specialFlag) {
    const location = specialFlag.match(/special\{public_(.+)\}/)[1]; // e.g., 'sunsetPark'

    if (lust < 30) {
      // Low lust = shocked/negative
      reaction = "What the hell?? You took this in PUBLIC? Are you insane?";
      statGain = { friendship: -5 };
    } else if (lust >= 30 && lust < 60) {
      // Mid lust = intrigued but concerned
      reaction = `Holy shit... you're naked at ${location}? That's crazy... but kinda hot.`;
      statGain = { lust: 5, friendship: 2 };
    } else {
      // High lust = aroused/explicit
      const reactions = [
        `Fuck, you're such a dirty slut. ${location}? I'm rock hard.`,
        `I can't believe you did this. Send the video next time.`,
        `You're going to get caught... and I fucking love it.`,
      ];
      reaction = reactions[Math.floor(Math.random() * reactions.length)];
      statGain = { lust: 15, corruption: 5 };

      // UNLOCK SEXTING CHAIN
      unlockTemporaryTopic(charId, "sexting_public_nudes");
    }
  }

  // --- EXAMPLE: HOT + BEDROOM (safe) ---
  else if (category === "hot" && photo.flags.includes("bedroom")) {
    if (lust >= 40) {
      reaction = "Damn... lingerie looks good on you. Wish I was there.";
      statGain = { lust: 8 };
    } else {
      reaction = "You look nice!";
      statGain = { friendship: 3 };
    }
  }

  // Send reaction after delay
  setTimeout(() => {
    pushPhoneMessage(charId, charId, reaction);
    applyStats(charId, statGain);
  }, 2000);
}
```

#### Why "Special" Flags Matter:

- **Location Context:** A nude at the park (`special{public_sunsetPark}`) is WAY more risky/exciting than a bedroom nude.
- **Character Knowledge:** If the character KNOWS that specific location (e.g., Father knows you go to that park), the reaction can reference it: _"Did anyone see you at the park??"_
- **Progression Gates:** Sending a `special{public_}` nude can unlock:
  - New topics: _"You're getting bold..."_
  - New quests: _"Meet me at that park tonight."_
  - Reputation effects: _"What if someone recognizes you?"_

---

### 6. Sexting Conversation Flows (Phase 5)

**Status:** Planned in roadmap, not implemented

See: `PHONE_PHOTO_INTERACTIONS_ROADMAP.md`

**What to Build:**

- Branching dialogue after sending Hot/Spicy photos
- `unlockTemporaryTopic(charId, topicId)` function
- Explicit sexting topics with multiple reply options
- Follow-up requests (e.g., "Send a video next")

---

## 🎯 PRIORITY ORDER (What to Do Next)

### **IMMEDIATE (Must Do First):**

1. ✅ **Media pools** — `variablesPhoneMediaPools.twee` exists; add paths/variants as needed.
2. ❌ **Implement Gallery UI** (render function + grid)
   - Basic display of captured photos
   - Test that `path` shows in preview

### **HIGH PRIORITY (After Gallery Works):**

3. ✅ **Character Reactions** to photos
   - Basic reaction logic (lust-based)
   - Special flag handling
   - Stat gains

4. ✅ **Send to Messages** integration
   - Gallery picker modal
   - Send function
   - Message display

### **MEDIUM PRIORITY (Polish):**

5. Preview modal (delete, details)
6. Sexting flows (branching dialogues)
7. Photo request topics

---

## 📝 Files Summary

### **Created/Modified:**

- ✅ `passages/0 - System/Init/variablesPhoneGallery.twee`
- ✅ `assets/system/js/ui/phone/phone-camera.js`
- ✅ `assets/system/js/ui/phone/index.js`
- ✅ `assets/system/css/systems/phone-camera.css`
- ✅ `assets/system/config.js` (added phone-camera CSS)

### **Need to Create:**

- ✅ `passages/0 - System/Init/variablesPhoneMediaPools.twee` (done)
- ❌ `assets/system/css/systems/phone-gallery.css`

### **Need to Modify:**

- ❌ `assets/system/js/ui/phone/phone-gallery.js` (implement full UI)
- ❌ `assets/system/js/ui/phone/phone-messages.js` (add reaction handler)

---

## 💡 Key Insights

### Why Flags Matter:

```javascript
// Photo 1: Safe bedroom spicy
{
  flags: ["nude", "explicit", "spread", "bedroom"];
}
// → Reaction: "You look amazing, babe."

// Photo 2: Public park spicy
{
  flags: ["nude", "explicit", "public", "risky", "special{public_sunsetPark}"];
}
// → Reaction: "WTF YOU'RE NAKED AT THE PARK?? 🔥💦"
```

The `special{public_locationId}` flag lets characters react to **WHERE** the photo was taken, not just what's in it.

---

## 🚀 Next Step Action Plan

1. ✅ **Media Pools** — Done (`variablesPhoneMediaPools.twee`). Add more paths/tags as content grows.

2. **Build Gallery Grid** (1 hour) **← YOU ARE HERE**
   - Implement `phoneRenderGalleryApp`
   - Show thumbnails with quality badges
   - Test filtering

3. **Add Reactions** (2 hours)
   - Write `handlePhotoReaction` logic
   - Test with Father/Brother
   - Verify stat gains work

4. **Test Full Flow** (30 min)
   - Capture photo → View in gallery → Send to character → Receive reaction

**Total Estimated Time:** ~4 hours

---

**Next: Implement Gallery UI (phoneRenderGalleryApp + grid).**
