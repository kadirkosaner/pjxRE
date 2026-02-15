# 📱 Phone Topics Structure - Extended for Photo Interactions

**File:** `passages/0 - System/Init/variablesPhoneTopics.twee`

---

## 🔧 Current Structure (Basic)

```javascript
setup.phoneMessageTopics.mother = [
  {
    id: "topic_id",
    label: "Display Name",
    category: "friendship" | "love" | "lust",
    tier: 1, // Friendship tier requirement
    timeAdvance: 30, // Minutes passed
    statGain: { friendship: 2 },
    message: "Text sent by player",
    replies: ["Reply option 1", "Reply option 2"],
  },
];
```

### Visual Fields (Current):

- `imageType: "receiver"` → Character sends image to player
- `imageType: "sender"` → Player sends image (static path from `images: []`)
- `images: ["path1.webp", "path2.webp"]` → Static image pool

**Problem:** No gallery integration, no dynamic attachment requirement.

---

## 🎯 Extended Structure (Roadmap Compatible)

### 1. **Attachment Required Topics**

For topics where the player MUST attach a photo from gallery:

```javascript
{
    id: "mother_request_cute_selfie",
    label: "Send me a cute selfie",
    category: "love",
    tier: 2,
    message: "Can you send me a cute selfie? I miss seeing your smile.",

    // NEW: Require gallery attachment
    attachmentRequired: "cute",  // 'normal' | 'cute' | 'hot' | 'spicy'

    replies: [
        "Sure mom, one sec!",
        "Maybe later...",
        "I'm not feeling photogenic today"
    ]
}
```

**Logic in `phone-messages.js`:**

```javascript
if (topic.attachmentRequired) {
  // Instead of sending text directly, open gallery picker
  openGalleryPickerForMessage(charId, topic.attachmentRequired);
}
```

---

### 2. **Structured Replies (Branching)**

For topics with multiple outcomes based on player choice:

```javascript
{
    id: "mother_sexting_continue_hot",
    label: "Reply...",
    category: "lust",
    tier: 0,  // Hidden (unlocked via photo reaction)
    hidden: true,
    message: "",  // No initial message (player picks reply)

    // NEW: Structured replies with reactions and unlocks
    replies: [
        {
            text: "Like what you see? 😉",
            reaction: "Oh my... you're such a tease.",
            statGain: { lust: 5, love: 2 },
            nextTopic: null
        },
        {
            text: "Want to see more?",
            reaction: "I shouldn't... but yes.",
            statGain: { lust: 8, corruption: 2 },
            nextTopic: "mother_request_spicy_video"
        },
        {
            text: "Just for you, mom ❤️",
            reaction: "You're making me feel things I shouldn't...",
            statGain: { lust: 10, love: 5 },
            nextTopic: "mother_sexting_escalate"
        }
    ]
}
```

**Logic in `phone-messages.js`:**

```javascript
if (reply.reaction) {
  // Character sends this specific reaction
  pushPhoneMessage(charId, charId, reply.reaction);
}
if (reply.statGain) {
  // Apply stat changes
  for (let stat in reply.statGain) {
    vars.characters[charId].stats[stat] += reply.statGain[stat];
  }
}
if (reply.nextTopic) {
  // Unlock next topic (temporary or permanent)
  unlockTemporaryTopic(charId, reply.nextTopic);
}
```

---

### 3. **Photo Request with Context**

Character asks for specific photo type:

```javascript
{
    id: "mother_request_spicy_bedroom",
    label: "Show me how you look...",
    category: "lust",
    tier: 3,
    message: "I can't stop thinking about you... can you send me something more... intimate?",

    // NEW: Specific attachment requirement + context
    attachmentRequired: "spicy",
    attachmentContext: "safe",  // Only bedroom/safe photos accepted

    replies: [
        {
            text: "Okay mom... just for you.",
            reaction: "Oh god... you're so beautiful. I'm touching myself.",
            statGain: { lust: 15, corruption: 5 }
        },
        {
            text: "This is too much...",
            reaction: "I understand. I'm sorry for asking.",
            statGain: { lust: -5 }
        }
    ]
}
```

---

### 4. **Temporary/Hidden Topics (Sexting Chains)**

Topics unlocked ONLY via reactions or previous replies:

```javascript
{
    id: "mother_sexting_public_nudes",
    label: "About that photo...",
    category: "lust",
    tier: 0,
    hidden: true,  // Not visible in normal topic list
    temporary: true,  // Expires after 24 hours if not used

    message: "",
    replies: [
        {
            text: "You liked it? Want more?",
            reaction: "Yes... but be careful. What if someone saw you?",
            statGain: { lust: 10 },
            nextTopic: "mother_request_public_video"
        },
        {
            text: "It was a one-time thing.",
            reaction: "I understand. But I'll keep dreaming about it.",
            statGain: { lust: 5 }
        }
    ]
}
```

**Unlocked via:**

```javascript
// In handleMediaReaction (phone-messages.js)
if (category === "spicy" && isPublic && lust >= 60) {
  unlockTemporaryTopic("mother", "mother_sexting_public_nudes");
}
```

---

## 📝 Implementation Checklist

### In `variablesPhoneTopics.twee`:

- [ ] Add `attachmentRequired` field to photo request topics
- [ ] Add `hidden: true` and `tier: 0` to temporary topics
- [ ] Convert simple string `replies` to object arrays with `{text, reaction, statGain, nextTopic}`

### In `phone-messages.js`:

- [ ] Check `topic.attachmentRequired` before sending
- [ ] Implement `unlockTemporaryTopic(charId, topicId)`
- [ ] Handle structured replies (apply statGain, trigger nextTopic)
- [ ] Filter out `hidden: true` topics from normal list
- [ ] Clean up expired temporary topics (older than 24h)

### In `phone-camera.js` / `phone-gallery.js`:

- [ ] Pass `requiredCategory` to gallery picker
- [ ] Filter gallery items by category when attachmentRequired is set
- [ ] Show only compatible photos (e.g., only "spicy" + "safe" for bedroom request)

---

## 🎯 Next: Example Topics for Mother

See: `PHONE_TOPICS_MOTHER_EXAMPLES.md`
