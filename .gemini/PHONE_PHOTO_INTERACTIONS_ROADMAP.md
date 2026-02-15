# 💬 Phone Photo Interactions & Talk System Roadmap

This document outlines the expansion of the Phone System to include dynamic, **interactive**, and **explicit** interactions based on photos/videos sent to characters, specifically focusing on "sexting" mechanics.

## 🎯 Objectives

1. **Interactive Sexting:** Conversations shouldn't end after sending a photo; they should branch based on the content.
2. **Explicit Reactions:** Characters react differently to Normal vs. Spicy content based on their Corruption/Lust levels.
3. **Solicited vs. Unsolicited:** Different mechanics for requested nudes vs. random ones.

---

## 🏗️ Implementation Phase

### 1. Photo Requests (New Topic Type)

**File:** `passages/0 - System/Init/variablesPhoneTopics.twee`

Define explicit requests that unlock at higher tiers.

```twee
/* Example: Father asking for a "Spicy" photo (High Lust) */
<<set setup.phoneMessageTopics.father.request_spicy_1 = {
    category: "lust",
    tier: 3,
    title: "Show me...",
    content: "I can't sleep. Can you send me something... naughty? Just for me.",
    replies: [
        "You're bad, daddy... check this out using the attach button.",
        "I don't think that's a good idea.",
        "Only if you pay for it ;)"
    ],
    // Helper to identify this needs a specific photo type
    requirement: "photo_spicy",
    cooldown: 48
}>>
```

### 2. Interactive Sexting Flows (Branching)

Instead of a single reaction, sending a Spicy/Hot photo should trigger a mini-event (conversation chain).

**File:** `assets/system/js/ui/phone/phone-messages.js` (Logic)

#### Scenario: Unsolicited "Spicy" Photo to Brother

_Player sends a Spicy nude from the gallery._

**Logic Flow:**

1. **Check Requirements:** Is Brother's corruption > 50?
   - **NO:** "WTF is this? Did you send this by mistake? I'm deleting this." (Relationship -5)
   - **YES:** dynamic reaction below.

2. **Reaction (High Lust):**
   - **Brother:** "Holy shit... is that really you? You look so fucking hot."
   - **System:** _Unlocks dialogue choices for the player:_
     - A) "Like what you see? There's more where that came from." (Increases Lust)
     - B) "Oops, wrong person! 😳" (Teasing)
     - C) "Don't show anyone."

3. **Follow-up (If A selected):**
   - **Brother:** "I'm hard already. Come to my room? Or send a video?"
   - **System:** _Unlocks "Spicy Video" request or "Go to Room" quest._

### 3. Handling Explicit Reactions (Code Structure)

Extend `handleMediaReaction` to support branching dialogue.

```javascript
/* Logic inside message system when player sends photo */
function handleMediaReaction(charId, mediaType, quality, category) {
  let reaction = "";
  let nextTopicId = null; // Unlocks a specific follow-up topic
  const char = vars.characters[charId];
  const lust = char.stats.lust || 0;
  const corruption = char.stats.corruption || 0;

  // --- HOT / SPICY CONTENT ---
  if (category === "hot" || category === "spicy") {
    if (lust < 30) {
      // Negative / Shocked
      reaction = "Whoa, what is this?? You shouldn't be sending these.";
      nextTopicId = "scold_player";
    } else if (lust >= 30 && lust < 60) {
      // Intrigued / Aroused
      reaction = "Damn... 😳 I didn't know you could look like that.";
      nextTopicId = "sexting_soft_start";
    } else {
      // Explicit / Hungry (High Lust)
      const explicitLines = [
        "Fuck, you're making me so hard right now.",
        "I want to ruin that pretty body of yours.",
        "Save that look for when I come over.",
      ];
      reaction =
        explicitLines[Math.floor(Math.random() * explicitLines.length)];

      // Generate bonus stat gain
      const lustGain = category === "spicy" ? 10 : 5;
      // applyStats(charId, { lust: lustGain });

      // Unlock "Sexting" chain
      nextTopicId = "sexting_hardcore_continue";
    }
  }
  // --- CUTE / NORMAL ---
  else {
    reaction = "Cute pic!";
  }

  // Send the reaction and unlock the next step in conversation
  setTimeout(() => {
    pushPhoneMessage(charId, charId, reaction);
    if (nextTopicId) {
      // Unlock a temporary topic so player can reply instantly
      unlockTemporaryTopic(charId, nextTopicId);
    }
  }, 2000);
}
```

### 4. Explicit Topics Examples

these should be added to `variablesPhoneTopics.twee`.

#### `sexting_hardcore_continue` (Unlocked after positive reaction)

```javascript
<<set setup.phoneMessageTopics.father.sexting_hardcore_continue = {
    category: "lust",
    tier: 0, // Hidden/Special
    title: "Reply...",
    content: "...", // Placeholder since it's a reply
    replies: [
        {
            text: "Imagine what I could do with my mouth...",
            reaction: "I'm imagining it. Don't tease me unless you mean it.",
            lust: 5
        },
        {
            text: "Just a taste. Want to see more?",
            reaction: "Send a video. Now.",
            unlock_request: "request_video_spicy"
        }
    ]
}>>
```

---

## 📝 Integration Steps

1.  **Modify `phone-messages.js`**:
    - Implement `unlockTemporaryTopic(charId, topicId)` to allow instant replies without waiting for tiers/cooldowns.
    - Update `pushPhoneMessage` to enforce attached media requirements.

2.  **Content Writing**:
    - Write 3-4 variations of reactions for each character (Father, Brother, etc.) for each Lust level (Low, Mid, High).
    - Create "Sexting Chains" (Dialogue Trees) for successful photo exchanges.

3.  **Visual Feedback**:
    - When a character "likes" a photo (Lust gain), add a subtle "💦" or "❤️" animation over the message.
