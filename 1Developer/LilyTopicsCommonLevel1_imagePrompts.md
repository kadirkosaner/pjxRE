# Lily — Sunset Park (ComfyUI + Star node · Nano Banana Pro 2 · 16:9)

## Star node — giriş sırası (DOĞRU sıra)

| Giriş | Dosya | Karakter | Fiziksel özellikler |
|-------|-------|----------|----------------------|
| **image 1** | `parkMorning.webp` / `parkMidtime.webp` / `parkLateDay.webp` | location plate | — |
| **image 2** | `player.png` | **Player** | long wavy dark brunette hair down, green eyes, makeup, glamorous look, fair skin |
| **image 3** | `lilyMorgan.webp` | **Lilly** | dirty blonde hair in a low ponytail, no makeup, athletic/sporty look, tan |

---

## 🎯 Prompt stratejisi — neden önceki sürümler bozuktu

**Problem:** Önceki prompt'lar sadece "beside her / next to her" gibi muğlak konumlar kullanıyordu. Model bu durumda:
- Pathway'i görmezden gelip karakterleri çimenliğe koyuyordu
- İki karakteri üst üste / çok yakın yerleştiriyordu
- Arkaplan elementleriyle (bank, lamba, oyun alanı) hiç etkileşim kurmuyordu

**Çözüm:** Her prompt artık park plate'inin gerçek elementlerini kullanıyor:
- **The paved pathway** (beton yürüyüş yolu) — karakterler her zaman yol üzerinde
- **The wooden bench on the left** — oturma/stretching sahneleri için
- **The lamp post on the right** — akşam sahneleri için
- **The playground in the background** — sahne derinliği için
- **Sol / sağ ayrımı** — iki karakter asla üst üste binmesin

---

## 🌅 Sabah · `sunsetPark_common_morning`

Location: `parkMorning.webp`

---

### `cooldown_pond`

**`sunsetPark_common_morning_cooldown_pond_1`**
```
16:9 wide cinematic. Use image 1 exactly as the background — the same paved pathway, wooden bench on the left, playground visible in the mid-background, lamp post on the right, residential houses and trees in the distance. The player (from image 2, long dark brunette wavy hair down, casual street clothes, glamorous look) stands on the RIGHT side of the frame, on the paved pathway, about 2 meters apart from Lilly, body turned toward Lilly, talking. Lilly (from image 3, dirty blonde hair in a low ponytail, athletic wear, sporty look) stands on the LEFT side of the frame, next to the wooden bench, her right leg extended back in a calf stretch against the bench seat. Both women are clearly visible, not overlapping, fully on/near the pathway. Soft morning light, long shadows on the pavement.
```

**`sunsetPark_common_morning_cooldown_pond_2`**
```
16:9 medium-wide cinematic. Background is image 1 — paved pathway curving to the right, bench on left, playground mid-background. Both women are ON the paved pathway, walking along it side by side, moving toward camera. Lilly (image 3, blonde ponytail, athletic wear, small towel around her neck dabbing sweat, post-run) is on the LEFT. The player (image 2, brunette hair down, casual everyday clothes) is on the RIGHT, walking beside her, mid-conversation. Both fully visible on the pathway, not on the grass. Clear gap between them, no overlap. Cool morning light.
```

---

### `mall_tip_followup`

**`sunsetPark_common_morning_mall_tip_followup_1`**
```
16:9 medium cinematic. Background is image 1 — they are standing ON the paved pathway near the wooden bench on the left. Lilly (image 3, blonde ponytail, athletic wear, post-workout flush) is on the LEFT side of the frame, drinking from a metal water bottle, head tilted back slightly. The player (image 2, brunette wavy hair down, casual street clothes, glamorous look) is on the RIGHT side of the frame, facing Lilly at conversational distance on the pathway, listening. Both women clearly visible on the paved path, not merged, not on grass. Morning light.
```

**`sunsetPark_common_morning_mall_tip_followup_2`**
```
16:9 wide cinematic. Background is image 1 — paved pathway stretching back toward the playground and lamp post. Lilly (image 3, blonde ponytail, running gear, catching her breath) stands on the LEFT on the pathway, glancing at her smartwatch, other hand on her hip. The player (image 2, brunette hair down, casual clothes) stands on the RIGHT on the pathway, facing Lilly, talking with a small hand gesture. Both women fully on the paved path, clear distance between them, no overlap. Warm low morning light catching Lilly's blonde hair.
```

---

### `running_buddy`

**`sunsetPark_common_morning_running_buddy_1`**
```
16:9 wide cinematic. Background is image 1 — they are standing ON the paved pathway, the path visibly curving into the background toward the playground. Both women face down the trail, seen from a three-quarter back angle. Lilly (image 3, blonde ponytail, full running outfit, warm-up posture, rolling her shoulders) is on the LEFT on the pathway. The player (image 2, brunette hair down, casual everyday clothes) is on the RIGHT on the pathway, next to Lilly but with clear space between them, speaking. Pathway is clearly the ground plane — they are not on grass. Morning light from the left through the trees.
```

**`sunsetPark_common_morning_running_buddy_2`**
```
16:9 medium cinematic. Background is image 1 — they stand near the wooden bench on the left side of the scene, both near the edge where the pathway meets the grass. Lilly (image 3, blonde ponytail, athletic wear, post-run) is on the LEFT, hands on her hips catching her breath, head turned toward something in the distance with an amused smile (imagine ducks on a pond off-frame). The player (image 2, brunette hair down, casual clothes) is on the RIGHT, a step behind Lilly on the pathway, talking. Clear separation between them, both fully visible. Warm morning tones.
```

---

## ☀️ Öğleden sonra · `sunsetPark_common_afternoon`

Location: `parkMidtime.webp`

---

### `midday_heat`

**`sunsetPark_common_afternoon_midday_heat_1`**
```
16:9 cinematic, SIDE-ANGLE shot from the pathway's right edge looking left, camera at eye level. Background is image 1 — the large shade tree dominates the left side, sunlit lawn in the right background. Lilly (image 3, messy ponytail, running gear, a few strands stuck to her forehead, sweaty) stands in profile in the deep shade under the tree, her body angled toward the player, one hand raised in a small casual wave of greeting (NOT toward camera — toward the player). The player (image 2, brunette hair down, casual street clothes) is walking into frame from the right along the pathway, seen in three-quarter back view, her head turned toward Lilly, waving back. The two women are caught mid-greeting, naturally off-axis, neither facing the camera. Dramatic shade-vs-sun contrast. Both clearly visible, separated by a few meters of pathway.
```

**`sunsetPark_common_afternoon_midday_heat_2`**
```
16:9 cinematic, LOW-ANGLE tracking shot from behind and slightly below, camera following the two women as they walk away down the paved pathway. Background is image 1 seen receding — the pathway curving ahead, playground in the distance. Lilly (image 3, blonde ponytail, running top, over-ear headphones resting around her neck) walks on the LEFT side of the path, seen from the back, her head slightly turned toward the player. The player (image 2, brunette hair down, casual everyday clothes) walks on the RIGHT side of the path, also seen from the back, her head turned toward Lilly, mid-conversation. Both seen from behind/three-quarter back, natural walking posture, never facing camera. Dappled light from tree canopy on the pavement ahead of them.
```

---

### `paths_and_pacing`

**`sunsetPark_common_afternoon_paths_and_pacing_1`**
```
16:9 cinematic, OVER-THE-SHOULDER shot from behind the player, looking past her toward Lilly. Background is image 1 — the pathway curving to the right, lamp post visible in the mid-frame. The player (image 2, brunette hair down, casual clothes) is in the RIGHT foreground, seen from behind/over the shoulder, slightly out of focus, her head turned to follow where Lilly points. Lilly (image 3, blonde ponytail, running gear, post-run flush) is in the mid-ground on the pathway, sharp focus, pointing along the curving path with her water bottle, her attention entirely on explaining the route to the player — NOT looking at camera. Natural tour-guide energy, candid framing.
```

**`sunsetPark_common_afternoon_paths_and_pacing_2`**
```
16:9 cinematic, HIGH THREE-QUARTER angle from front-right, camera slightly above eye level. Background is image 1 — the paved pathway in the foreground, grass lawn and blurred playground in the mid-background. Lilly (image 3, blonde ponytail, athletic wear) stands on the LEFT on the pathway, profile to three-quarter angle to camera, hands on her hips, head turned toward blurred kids playing on the grass near the playground, then the smile shifts toward the player — NOT facing camera. The player (image 2, brunette hair down, casual clothes) stands on the RIGHT on the pathway in three-quarter view, body angled toward Lilly, speaking to her about something she noticed. Both women engaged with each other, not the camera.
```

---

### `gear_chat`

**`sunsetPark_common_afternoon_gear_chat_1`**
```
16:9 cinematic, INTIMATE PROFILE two-shot, camera at eye level from the right side of the pathway, both women seen in profile facing each other. Background is image 1 — quieter section of the pathway near the bench in the soft blurred background. Lilly (image 3, blonde ponytail, full running outfit) stands on the LEFT in left profile, looking down at her shirt hem, tugging it with both hands to check the fit, brow slightly furrowed in concentration. The player (image 2, brunette hair down, casual street clothes) stands on the RIGHT in right profile, body fully turned toward Lilly, arms crossed casually, watching and listening. Neither woman faces camera — they are in a natural private conversation. Soft green bokeh deep background.
```

---

## 🌇 Akşam · `sunsetPark_common_evening`

Location: `parkLateDay.webp`

**Lilly (image 3) kıyafeti:** Bu bölümde her stem farklı akşam/koşu sonu kombinasyonu — generic “running gear / athletic wear” yok.

---

### `golden_hour`

**`sunsetPark_common_evening_golden_hour_1`**
```
16:9 cinematic, WIDE BACK-VIEW silhouette shot — camera behind both women as they look out toward the sunset. Background is image 1 — setting sun filling the frame ahead, warm amber light flooding the pathway, pond water catching gold at the edge of frame, long shadows stretching back toward camera. Both women stand on the paved pathway, seen from behind in three-quarter back view, silhouetted against the glow. Lilly (image 3, blonde ponytail visible from behind, dark navy long-sleeve quarter-zip with subtle reflective strips on shoulders, charcoal full-length tights) is on the LEFT, one hand on her hip, relaxed. The player (image 2, long dark brunette hair down, casual everyday clothes) is on the RIGHT, her head tilted slightly toward Lilly, mid-conversation. Neither faces camera — both looking toward the sunset. Warm golden rim light edging their silhouettes.
```

**`sunsetPark_common_evening_golden_hour_2`**
```
16:9 cinematic, MEDIUM WIDE two-shot on the paved pathway — same depth plane for both women, neither pushed to background. Lilly (image 3, high ponytail, electric-blue racerback sports bra, unzipped light grey running shell open, black bike shorts, wrist sweatband) on the LEFT third of frame, arms stretched overhead mid-stretch, eyes closed. The player (image 2, brunette hair down, casual clothes) on the RIGHT third, CLOSE beside Lilly (only one step apart), full head-and-torso clearly visible, sharp focus, three-quarter view toward Lilly, small amused smile, mouth mid-sentence. Do not crop the player, do not occlude her behind Lilly’s body, do not vignette her out. Background is image 1 — sunset sky, pond with ducks mid-distance, trees at edges. Golden backlight + soft fill so both faces read.
```

---

### `wind_down`

**`sunsetPark_common_evening_wind_down_1`**
```
16:9 cinematic, CLOSE MEDIUM two-shot, camera slightly off-axis from the front-right. Background is image 1 — blue hour setting in behind them, the lamp post in the right background glowing warm yellow creating soft bokeh. They stand on the paved pathway facing each other, three-quarter angle to camera. Lilly (image 3, blonde ponytail, dusty-rose cropped hoodie with white tank hem peeking out, burgundy high-waist full-length tights, post-run glow) is on the LEFT in three-quarter view, body turned toward the player, one hand absently brushing hair behind her ear, mid-sentence. The player (image 2, brunette hair down, casual street clothes) is on the RIGHT in three-quarter view, turned toward Lilly, listening intently with a slight smile. Both fully engaged with each other, not camera. Intimate end-of-day atmosphere.
```

**`sunsetPark_common_evening_wind_down_2`**
```
16:9 cinematic, LOW ANGLE from near the pathway, camera below eye level looking slightly up. Background is image 1 — wooden bench centered in the frame with the pathway and glowing lamp post behind. Lilly (image 3, blonde ponytail, slouchy heather-grey zip hoodie slipping off one shoulder, black ankle-length tights, visible running socks scrunched at the ankles) sits on the wooden bench in profile, leaning forward with her elbows on her knees, both hands working at untying a running shoe, head bent down focused on the laces — completely absorbed in the task, NOT looking up. The player (image 2, brunette hair down, casual everyday clothes) stands on the RIGHT next to the bench in three-quarter view, one hand in her pocket, looking down at Lilly, saying something casual. Natural candid moment, neither posed for camera. Blue hour with warm lamp bokeh.
```

---

### `invite_back`

**`sunsetPark_common_evening_invite_back_1`**
```
16:9 cinematic, OVER-THE-SHOULDER shot from behind Lilly, looking past her toward the player. Background is image 1 — the pathway with glowing lamp posts receding into the dusk, deep blue sky with last orange traces at the horizon. Lilly (image 3, blonde ponytail, cream lightweight packable windbreaker zipped to the collar, olive compression tights with thin side stripe, slim running waist belt, post-run) is in the LEFT foreground, seen from behind/over the shoulder, slightly out of focus, one arm raised in a natural gesture of suggestion. The player (image 2, brunette hair down, casual clothes) stands facing her in the mid-ground on the pathway, sharp focus, a warm smile forming as she listens to Lilly's invitation, her body language open and considering. The two are caught in a real conversational moment — neither facing camera, attention entirely on each other. Warm lamp glow bokeh behind the player.
```

---

## 📋 Stem listesi

```
sunsetPark_common_morning_cooldown_pond_1
sunsetPark_common_morning_cooldown_pond_2
sunsetPark_common_morning_mall_tip_followup_1
sunsetPark_common_morning_mall_tip_followup_2
sunsetPark_common_morning_running_buddy_1
sunsetPark_common_morning_running_buddy_2
sunsetPark_common_afternoon_midday_heat_1
sunsetPark_common_afternoon_midday_heat_2
sunsetPark_common_afternoon_paths_and_pacing_1
sunsetPark_common_afternoon_paths_and_pacing_2
sunsetPark_common_afternoon_gear_chat_1
sunsetPark_common_evening_golden_hour_1
sunsetPark_common_evening_golden_hour_2
sunsetPark_common_evening_wind_down_1
sunsetPark_common_evening_wind_down_2
sunsetPark_common_evening_invite_back_1
```

---

## 🎯 Sabit kurallar

1. **image 1** = location · **image 2** = player · **image 3** = Lilly (Star node sırası; prompt metninde böyle yaz)
2. **"Background is image 1"** + park öğeleri (pathway, bench, lamp, playground) → plate kullanımı
3. **"ON the paved pathway"** → ikisi de yol üzerinde / yol kenarında, çimenlikte random durmasın
4. **Lilly LEFT, player RIGHT** → kadraj tutarlılığı
5. **Clear gap / no overlap** → üst üste binme yok

**Kimlik kısayolu (image numarasıyla):** image 3 = Lilly (yüz/saç ref; **akşam stem’lerinde kıyafet stem başına değişir**) · image 2 = player (brunette, casual/glam per ref)

---

**Twee source:** `passages/3- Interactions/Maplewood/SunsetPark/Lilly/talkDatabase/LilyTopicsCommonLevel1.twee`