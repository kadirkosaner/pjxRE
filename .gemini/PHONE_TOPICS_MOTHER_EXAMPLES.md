# 📱 Phone Topics - Mother Examples (Photo Interactions)

**Add these to:** `passages/0 - System/Init/variablesPhoneTopics.twee`  
**Character:** `setup.phoneMessageTopics.mother`

---

## 🎯 Example 1: Simple Photo Request (Cute Selfie)

```twee
{
    id: "mother_request_cute_selfie_1",
    label: "Send me a selfie",
    category: "love",
    tier: 2,
    timeAdvance: 15,
    message: "Hi sweetie! Can you send me a quick selfie? I miss seeing your beautiful face.",

    // NEW: Attachment required from gallery
    attachmentRequired: "cute",

    replies: [
        "Sure mom, one sec!",
        "I'm not wearing makeup right now...",
        "Maybe later, I'm busy"
    ]
}
```

**Behavior:**

- When player selects this topic, instead of sending text directly, gallery picker opens
- Only "cute" and "normal" photos are selectable
- After sending, character reacts based on photo quality

---

## 🎯 Example 2: Structured Reply (After Hot Photo)

```twee
{
    id: "mother_sexting_soft_start",
    label: "Reply to mom...",
    category: "lust",
    tier: 0,
    hidden: true,  // Unlocked only after sending hot photo
    message: "",

    replies: [
        {
            text: "Glad you liked it 😊",
            reaction: "You look so good, honey. I can't stop looking at it.",
            statGain: { lust: 3, love: 2 }
        },
        {
            text: "Want to see more?",
            reaction: "I... I shouldn't say yes. But I do.",
            statGain: { lust: 8, corruption: 2 },
            nextTopic: "mother_request_bedroom_spicy"
        },
        {
            text: "It was just a nice photo, mom.",
            reaction: "Of course, sweetie. You just looked beautiful.",
            statGain: { love: 1 }
        }
    ]
}
```

**Unlocked by:**

```javascript
// In handleMediaReaction (when mother receives hot photo):
if (lust >= 30 && lust < 60 && category === "hot") {
  unlockTemporaryTopic("mother", "mother_sexting_soft_start");
}
```

---

## 🎯 Example 3: Spicy Request (High Lust)

```twee
{
    id: "mother_request_bedroom_spicy",
    label: "Show me more...",
    category: "lust",
    tier: 0,
    hidden: true,
    message: "I know this is wrong... but can you send me something more intimate? Just for me?",

    attachmentRequired: "spicy",
    attachmentContext: "safe",  // Only bedroom/safe location photos

    replies: [
        {
            text: "Anything for you, mom ❤️",
            reaction: "Oh god... you're perfect. I'm so wet right now.",
            statGain: { lust: 20, corruption: 10, love: 5 },
            nextTopic: "mother_sexting_hardcore_continue"
        },
        {
            text: "This is too much, mom.",
            reaction: "You're right. I'm sorry, I shouldn't have asked.",
            statGain: { lust: -10, love: -2 }
        }
    ]
}
```

---

## 🎯 Example 4: Hardcore Sexting Chain

```twee
{
    id: "mother_sexting_hardcore_continue",
    label: "Continue...",
    category: "lust",
    tier: 0,
    hidden: true,
    temporary: true,  // Expires in 24h
    message: "",

    replies: [
        {
            text: "Imagine what I could do with my tongue...",
            reaction: "Don't say things like that... you're making me lose control.",
            statGain: { lust: 15, corruption: 5 },
            nextTopic: "mother_request_video_spicy"
        },
        {
            text: "Touch yourself thinking of me.",
            reaction: "I already am... god, this is so wrong but feels so right.",
            statGain: { lust: 20, corruption: 10 }
        },
        {
            text: "We should stop before this goes too far.",
            reaction: "You're right... but I don't want to stop.",
            statGain: { lust: 5 }
        }
    ]
}
```

---

## 🎯 Example 5: Public Photo Reaction Chain

```twee
{
    id: "mother_sexting_public_nudes",
    label: "About that risky photo...",
    category: "lust",
    tier: 0,
    hidden: true,
    temporary: true,
    message: "",

    replies: [
        {
            text: "You liked seeing me take risks?",
            reaction: "I did... but what if someone saw you? That's dangerous.",
            statGain: { lust: 10, exhibitionism: 5 },
            nextTopic: "mother_request_public_video"
        },
        {
            text: "It was just a one-time thing.",
            reaction: "Good. I was worried. But... it was incredibly hot.",
            statGain: { lust: 5, love: 2 }
        },
        {
            text: "I'll do it again if you want.",
            reaction: "No! It's too risky. But god... the thought of it...",
            statGain: { lust: 15, corruption: 5 }
        }
    ]
}
```

**Unlocked by:**

```javascript
// In handleMediaReaction (when mother receives public spicy):
if (lust >= 60 && category === "spicy" && flags.includes("public")) {
  unlockTemporaryTopic("mother", "mother_sexting_public_nudes");
}
```

---

## 🎯 Example 6: Video Request (Escalation)

```twee
{
    id: "mother_request_video_spicy",
    label: "I need more...",
    category: "lust",
    tier: 0,
    hidden: true,
    message: "Photos aren't enough anymore. Can you send me a video?",

    attachmentRequired: "spicy",
    attachmentType: "video",  // Only videos

    replies: [
        {
            text: "Just for you, mom. Watch this.",
            reaction: "Oh fuck... I can't stop watching. You're so fucking sexy.",
            statGain: { lust: 30, corruption: 15, love: 10 },
            nextTopic: "mother_meetup_bedroom"
        },
        {
            text: "That's too much for me.",
            reaction: "I understand. I'm sorry for pushing.",
            statGain: { lust: -5 }
        }
    ]
}
```

---

## 📝 Implementation Notes

### Where to Add in `variablesPhoneTopics.twee`:

```twee
:: variablesPhoneTopics [init nobr]
<<set setup.phoneMessageTopics = {
    mother: [
        // ... existing topics ...

        // NEW: Photo interaction topics
        {
            id: "mother_request_cute_selfie_1",
            // ... copy from Example 1 ...
        },
        {
            id: "mother_sexting_soft_start",
            // ... copy from Example 2 ...
        },
        // ... etc
    ],

    father: [ /* ... */ ],
    brother: [ /* ... */ ]
}>>
```

### Topic Flow Example:

1. **Tier 2+:** Player sees "Send me a selfie" topic
2. **Player selects:** Gallery picker opens (only cute/normal)
3. **Player sends:** Photo → Mom reacts based on quality
4. **If quality > 70:** "You look beautiful!" (+3 love)
5. **Later:** Player unlocks "hot" in camera
6. **Player sends hot photo:** Mom reacts: "Damn... 😳" → Unlocks `mother_sexting_soft_start`
7. **Player picks "Want to see more?":** Mom replies: "I do..." → Unlocks `mother_request_bedroom_spicy`
8. **Chain continues...**

---

## 🎯 Next Steps

1. Add these topics to `variablesPhoneTopics.twee`
2. Implement `unlockTemporaryTopic()` in `phone-messages.js`
3. Add attachment requirement handling in topic selection
4. Test the flow: selfie → reaction → sexting chain
