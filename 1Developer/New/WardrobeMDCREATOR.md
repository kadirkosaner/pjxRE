# Wardrobe Catalog Creation Guide
## For AI Agents — Item Catalog MD Generation

---

# 1. FOLDER STRUCTURE

```
shopMd/
├── tops/
│   ├── tops-northline-apparel.md
│   ├── tops-vera-mode.md
│   ├── tops-fifth-avenue-wear.md
│   ├── tops-fastbreak-athletics.md        ← if store sells this category
│   ├── tops-maison-elise.md               ← Hillcrest
│   ├── tops-eros-boutique.md              ← Red Light
│   └── ...
├── bottoms/
│   ├── bottoms-northline-apparel.md
│   ├── bottoms-vera-mode.md
│   └── ...
├── dresses/
│   └── ...
├── shoes/
│   └── ...
├── coats/
│   └── ...
├── socks/
│   └── ...
├── bras/
│   └── ...
├── panties/
│   └── ...
├── sleepwear/
│   └── ...
├── bodysuits/
│   └── ...
├── garter/
│   └── ...
├── bags/
│   └── ...
├── jewelry/
│   └── ...
└── WARDROBE-CATALOG-GUIDE.md  ← (this file)
```

**File naming:** `{category}-{store-name-kebab-case}.md`
**One file per store per category.** Never mix stores in one file.

---

# 2. STORE DEFINITIONS

## 2A. Mall — Metro Shopping Center (Ground Floor)

| Store ID | Store Name | Segment | Real-World Equivalent | Quality | Looks Range | Price Range | Character | Categories Sold |
|---|---|---|---|---|---|---|---|---|
| `storeClothingA` | **Northline Apparel** | Entry | H&M / Primark | Common | 2–4 | $8–30 | Basics queen. Every color, every cut. Cotton, jersey, denim. Wide color palette but simple. Largest selection, cheapest prices. | tops, bottoms, dresses, coats, panties |
| `storeShoeA` | **StepUp Footwear** | Entry/Mid | Deichmann / Aldo | Common + Rare | 2–5 | $20–65 | Everyday footwear. Sneakers, flats, basic heels. | shoes |
| `storeSports` | **FastBreak Athletics** | Performance | Nike / Adidas | Common | 2–4 | $15–50 | Performance gear. Sports bras, leggings, athletic shoes. Sporty outerwear: windbreaker, track jacket, running jacket. | tops, bottoms, shoes, bras, socks, coats |

## 2B. Mall — Metro Shopping Center (Second Floor)

| Store ID | Store Name | Segment | Real-World Equivalent | Quality | Looks Range | Price Range | Character | Categories Sold |
|---|---|---|---|---|---|---|---|---|
| `storeClothingB` | **VERA Mode** | Mid | Zara / Mango | Common + Rare | 3–6 | $25–70 | Trend-focused. Cutout, one-shoulder, tied, asymmetric. Satin-like, ribbed knit, faux leather. "Cheap luxury" feel. Widest tier spread. | tops, bottoms, dresses, coats, sleepwear |
| `storeClothingC` | **Fifth Avenue Wear** | Upper-Mall | COS / & Other Stories | Rare | 5–7 | $55–120 | Refined, minimal, quality-focused. Silk-like, fine knit, structured. Less variety but every piece is "good". Bridge to Hillcrest but NOT designer. | tops, bottoms, dresses, coats |
| `storeLingerieA` | **Silk & Lace** | Mid Lingerie | Victoria's Secret | Common + Rare | 3–5 | $15–45 | Mid lingerie. Matching sets, everyday to date night. | bras, panties, sleepwear, socks (stockings, tights, stay-ups, basic black/gray) |
| `storeLingerieB` | **Intimate Secrets** | Premium Lingerie | Agent Provocateur (lite) | Rare | 5–7 | $40–90 | Premium lingerie. Provocative, detailed, high quality. | bras, panties, bodysuits, sleepwear, garter |
| `storeBags` | **Luxe Leather** | Accessories | Coach / Kate Spade | Common + Rare | 3–6 | $30–120 | Bags only. Work, night, casual variety. | bags |
| `storeJewelry` | **Diamond Dreams** | Accessories | Pandora / Swarovski | Common + Rare | 3–6 | $15–80 | All jewelry categories. | earrings, necklaces, bracelets, rings |

## 2C. Hillcrest Boutiques District

| Store ID | Store Name | Segment | Real-World Equivalent | Quality | Looks Range | Price Range | Character | Categories Sold |
|---|---|---|---|---|---|---|---|---|
| `boutiqueA` | **Maison Élise** | Designer Entry | Sandro / Maje | Rare + Premium | 6–8 | $120–300 | French-inspired contemporary designer. Structured silhouettes, quality fabrics, understated luxury. First "real" designer store player discovers. Elegant but with occasional bold pieces. | tops, bottoms, dresses, coats |
| `boutiqueB` | **Aurum Couture** | Designer Mid | MaxMara / Theory | Premium | 7–9 | $250–500 | Power dressing meets sensuality. Tailored perfection, luxurious materials (cashmere, silk, leather). Items that make a statement. Higher tier items than Maison Élise. | tops, bottoms, dresses, coats |
| `boutiqueC` | **Bellucci Milano** | Designer Premium | Dolce & Gabbana / Versace (lite) | Premium | 8–10 | $400–800+ | Italian luxury maximalism. Bold prints, daring cuts, show-stopping pieces. The most expensive and looks-boosting items in the game. Highest tier spread including erotic. | tops, bottoms, dresses, coats, bodysuits |

## 2D. Red Light District

| Store ID | Store Name | Segment | Real-World Equivalent | Quality | Looks Range | Price Range | Character | Categories Sold |
|---|---|---|---|---|---|---|---|---|
| `storeAdult` | **Eros Boutique** | Adult/Erotic | Sex shop / Fetish store | Rare | 5–8 | $30–150 | The only store selling Tier 5 (erotic) and Tier 6 (lewd) items. Fetish wear, barely-there outfits, provocative costumes. Items here are about exhibitionism and corruption, not just confidence. | tops, bottoms, dresses, bodysuits, bras, panties, shoes, special |

## 2E. Adding New Stores

When adding a NEW store not listed above, you MUST define these properties before creating any item catalogs:

```
Store ID:           {unique camelCase identifier}
Store Name:         {display name}
Location:           {district/area in game world}
Segment:            {market position}
Real-World Equiv:   {1-2 real brands for reference}
Quality:            {Common | Rare | Common + Rare | Rare + Premium | Premium}
Looks Range:        {min}–{max}
Price Range:        ${min}–${max}
Max Tier:           {0-6}
Character:          {2-3 sentences describing the store's personality}
Categories Sold:    {comma-separated list}
```

Add the definition to the appropriate section (2A-2D) or create a new section (2F, 2G...) in this guide before generating catalogs.

---

# 3. TIER SYSTEM — REQUIREMENT TAGS

This is the core progression system. Every clothing item gets ONE tier tag (or none for Tier 0).

| Tier | Tag | reqConfidence | reqCorruption | reqExhibitionism | What's Visible | Real-Life Test |
|---|---|---|---|---|---|---|
| **0** | *(no tag)* | 0 | 0 | 0 | Nothing exposed | "Can you wear this to visit your mom?" → Yes |
| **1** | `mild` | 20 | 0 | 0 | Slight skin: arms, shoulders, a sliver of midriff | "Would some offices have a problem?" → Maybe |
| **2** | `revealing` | 40 | 0 | 0 | Noticeable skin: legs, back, cleavage | "Do people stare on the street?" → Yes |
| **3** | `daring` | 55 | 2 | 0 | Very exposed: deep cuts, very short | "Do friends say 'you're brave'?" → Yes |
| **4** | `bold` | 70 | 3 | 0 | Fabric underneath visible / underwear-like | "Does it look like you're barely wearing anything?" → Yes |
| **5** | `erotic` | 80 | 6 | 20 | Could be underwear | "Is this actually lingerie?" → Yes |
| **6** | `lewd` | 90 | 7 | 40 | Less than underwear | "Is this even clothing?" → Barely |

### TIER EXAMPLES BY CATEGORY

**Tops:**
| Tier | Examples |
|---|---|
| 0 | Hoodie, turtleneck, button-up, basic tee, cardigan, sweater, polo |
| 1 mild | Crop top (slight midriff), off-shoulder, thin-strap tank, fitted tee, racerback |
| 2 revealing | Deep V cami, backless top, low-cut blouse, sports bra as top |
| 3 daring | Halter backless, side cutout, extreme deep V, micro crop |
| 4 bold | Mesh/sheer top, underboob crop, corset, bustier, see-through blouse |
| 5 erotic | Lingerie-as-outerwear, nipple-visible sheer, bralette-only |
| 6 lewd | Pasties, open-cup top, fully transparent with nothing underneath |

**Bottoms:**
| Tier | Examples |
|---|---|
| 0 | Jeans, trousers, wide-leg pants, midi skirt, maxi skirt, knee-length shorts |
| 1 mild | Above-knee skirt, shorter shorts, capri, denim skirt (knee-length) |
| 2 revealing | Short shorts, above-knee skirt, bike shorts, tennis skirt |
| 3 daring | Mini skirt, very short shorts, low-rise showing hip bones |
| 4 bold | Micro mini, sheer/mesh skirt, ultra low-rise |
| 5 erotic | Thong-visible skirt, garter skirt, crotchless-hint |
| 6 lewd | Basically a belt, fully sheer, open-front |

**Dresses:**
| Tier | Examples |
|---|---|
| 0 | Midi dress, maxi dress, shirt dress, A-line, sweater dress |
| 1 mild | Above-knee dress, sleeveless dress, slight décolletage |
| 2 revealing | Short dress, deep V dress, backless midi, slit dress |
| 3 daring | Mini dress, extreme plunge, cutout dress, backless mini |
| 4 bold | Micro mini dress, sheer/mesh dress, barely-there straps |
| 5 erotic | Lingerie-dress, see-through dress, open-side |
| 6 lewd | Barely a dress, strategic coverage only |

**Coats (outerwear):**
| Tier | Examples |
|---|---|
| 0 | Trench, pea coat, wool coat, parka, puffer, duffle, classic full-length — full coverage, nothing exposed. **Sporty:** windbreaker, track jacket, running jacket, lightweight hooded jacket (FastBreak). |
| 1 mild | Fitted coat, cropped coat, open collar showing neck/chest when worn open |
| 2 revealing | Belted coat hugging waist/hips, shorter coat showing more leg, wrap coat with deeper V when open |
| 3 daring | Very fitted/cinched coat, cropped coat showing midriff when open, deep open front |
| 4 bold | Cape-like, one-shoulder coat, very short bolero-style, statement open front (rare for coats) |

**Lingerie (Bras/Panties/Bodysuits):**
| Tier | Examples |
|---|---|
| 0 | Cotton bra, basic brief, full-coverage sports bra |
| 1 mild | Lace-trim bra, bikini panty, wireless bralette |
| 2 revealing | Push-up bra, lace thong, sheer-panel bodysuit |
| 3 daring | Demi-cup bra, g-string, cutout bodysuit |
| 4 bold | Quarter-cup bra, crotchless hint panty, strappy harness bodysuit |
| 5 erotic | Open-cup bra, crotchless panty, sheer full bodysuit |
| 6 lewd | Nipple-frame bra, string-only, open crotch bodysuit |

### STORE TIER LIMITS

| Store | Location | Max Tier | Tier Distribution Character |
|---|---|---|---|
| **Northline Apparel** | Mall | **3** (1-2 items only) | ~60% T0, ~28% T1, ~10% T2, ~2% T3. Basics-heavy. |
| **VERA Mode** | Mall | **4** (3 items only) | ~27% T0, ~27% T1, ~25% T2, ~15% T3, ~6% T4. Widest spread. |
| **Fifth Avenue Wear** | Mall | **4** (3 items only) | ~37% T0, ~16% T1, ~26% T2, ~13% T3, ~8% T4. Tasteful. |
| **FastBreak Athletics** | Mall | **2** (limited) | ~70% T0, ~25% T1, ~5% T2. Performance focus. |
| **Silk & Lace** | Mall | **4** | Lingerie-specific. Mostly T1-T3. |
| **Intimate Secrets** | Mall | **5** | Premium lingerie. Up to erotic. |
| **Maison Élise** | Hillcrest | **4** | ~30% T0, ~25% T1, ~25% T2, ~15% T3, ~5% T4. Designer but mostly tasteful. |
| **Aurum Couture** | Hillcrest | **5** | ~20% T0, ~20% T1, ~25% T2, ~20% T3, ~10% T4, ~5% T5. Power + sensuality. |
| **Bellucci Milano** | Hillcrest | **5** | ~15% T0, ~15% T1, ~20% T2, ~25% T3, ~15% T4, ~10% T5. Bold Italian luxury. |
| **Eros Boutique** | Red Light | **6** | ~0% T0, ~0% T1, ~5% T2, ~15% T3, ~25% T4, ~35% T5, ~20% T6. Almost everything is Tier 4+. |

**Key Principle:** The tier distribution defines the store's personality. A store with 60% Tier 0 feels safe and basic. A store with 35% Tier 5 feels dangerous and provocative. Match the distribution to the store's character.

---

# 4. QUALITY & LOOKS SYSTEM

## Quality Tiers

| Quality | Color Code | Where Found |
|---|---|---|
| **Common** | `#9ca3af` (gray) | Northline, FastBreak, VERA (lower items), Silk & Lace (lower items) |
| **Rare** | `#3b82f6` (blue) | VERA (upper), Fifth Avenue, Intimate Secrets, Maison Élise (lower), Eros Boutique |
| **Premium** | `#a855f7` (purple) | Maison Élise (upper), Aurum Couture, Bellucci Milano |

## Looks Assignment Rules

Looks = how much the item contributes to the player's appearance score.

### Mall Stores

| Store | Quality | Looks Range | Assignment Guide |
|---|---|---|---|
| **Northline** | Common | 2–4 | Basic/boring = 2, Standard = 3, Nice detail = 4 |
| **VERA** | Common | 3–4 | Standard = 3, Trendy = 4 |
| **VERA** | Rare | 5–6 | Good design = 5, Standout = 6 |
| **Fifth Avenue** | Rare | 5–7 | Good = 5, Great = 6, Exceptional = 7 |
| **FastBreak** | Common | 2–4 | Basic = 2, Standard = 3, Performance = 4 |
| **Silk & Lace** | Common | 3–4 | Basic = 3, Pretty = 4 |
| **Silk & Lace** | Rare | 4–5 | Nice = 4, Beautiful = 5 |
| **Intimate Secrets** | Rare | 5–7 | Quality = 5, Stunning = 6, Exquisite = 7 |
| **Luxe Leather** | Common | 3–4 | Functional = 3, Stylish = 4 |
| **Luxe Leather** | Rare | 5–6 | Quality = 5, Statement = 6 |
| **Diamond Dreams** | Common | 3–4 | Simple = 3, Cute = 4 |
| **Diamond Dreams** | Rare | 5–6 | Elegant = 5, Eye-catching = 6 |

### Hillcrest Boutiques

| Store | Quality | Looks Range | Assignment Guide |
|---|---|---|---|
| **Maison Élise** | Rare | 6–7 | Well-designed = 6, Beautiful = 7 |
| **Maison Élise** | Premium | 7–8 | Stunning = 7, Exquisite = 8 |
| **Aurum Couture** | Premium | 7–9 | Luxurious = 7, Remarkable = 8, Breathtaking = 9 |
| **Bellucci Milano** | Premium | 8–10 | Show-stopping = 8, Extraordinary = 9, Masterpiece = 10 |

### Red Light District

| Store | Quality | Looks Range | Assignment Guide |
|---|---|---|---|
| **Eros Boutique** | Rare | 5–8 | Basic provocative = 5, Seductive = 6, Irresistible = 7, Fantasy = 8 |

### Looks Balance Rules

1. **Never exceed store max.** Each store has a hard ceiling.
2. **Average should sit in the middle of the range.** Northline avg ~3, VERA avg ~4.5, Fifth Ave avg ~6, Maison Élise avg ~7, Aurum avg ~8, Bellucci avg ~9.
3. **Higher tier ≠ higher looks automatically.** A Tier 0 cashmere sweater (Fifth Ave, looks 6) beats a Tier 3 micro crop (VERA, looks 5). Quality ≠ sexiness.
4. **Tier 4+ (bold/erotic/lewd) items should have high looks** within their store range — they are statement pieces.
5. **Hoodies/sweatshirts are always low looks** (2-3) regardless of store.
6. **Hillcrest items must feel like a clear upgrade.** The lowest Hillcrest looks (6) should match or exceed the highest mall looks (7). Player must feel the difference.
7. **Eros Boutique looks are high** because provocative outfits attract attention — they just require corruption/exhibitionism to unlock.

---

# 5. TAG SYSTEM

Each item gets tags from TWO categories:

## A. Tier Tag (max ONE per item)

`mild`, `revealing`, `daring`, `bold`, `erotic`, `lewd`
- Tier 0 items get NO tier tag.
- An item can only have ONE tier tag.
- The tier tag automatically sets reqConfidence, reqCorruption, and reqExhibitionism via the game's widget system. You do NOT need to set these manually.

## B. Context Tags (occasion/setting — multiple allowed)

Used for filtering, outfit matching, and quests (e.g. "wear something elegant to the dinner"). These do NOT trigger requirements.

| Tag | When to Use | Store Affinity |
|---|---|---|
| `casual` | Everyday, relaxed, informal | All stores |
| `elegant` | Refined, polished, sophisticated | VERA, Fifth Ave, Maison Élise, Aurum |
| `work` | Office/professional appropriate | Northline, VERA, Fifth Ave |
| `date` | Romantic setting appropriate | VERA, Fifth Ave, Hillcrest |
| `party` | Nightclub/party appropriate | VERA, Fifth Ave, Hillcrest, Eros |
| `evening` | Formal evening event | Fifth Ave, Hillcrest |
| `sport` | Athletic/performance | FastBreak |
| `formal` | Very formal (gala, wedding) | Fifth Ave, Hillcrest |
| `luxury` | High-end designer feel | Hillcrest only |
| `fetish` | Fetish/kink aesthetic | Eros Boutique only |
| `costume` | Costume/roleplay | Eros Boutique only |

## C. Style/Personality Tags (multiple allowed)

These drive the **wardrobe "Overall Style"** in the UI (topbar). Use at least one per item when it fits.

| Tag | When to Use |
|---|---|
| `casual` | Relaxed, everyday vibe |
| `cute` | Sweet, playful, feminine |
| `elegant` | Refined, polished |
| `professional` | Office-appropriate, put-together |
| `sexy` | Flattering, alluring |
| `sporty` | Athletic, active |
| `slutty` | Provocative, attention-seeking |
| `work` | Work/office appropriate (context + style) |

### Tag Assignment Rules

1. **Every item must have a `**Tags:**` line** with at least one tag (tier tag and/or context/style tags).
2. **Tier 0 items** usually get: `casual` and/or `work` and/or `elegant`, plus one style tag if it fits (`professional`, `cute`, etc.).
3. **Tier 1-2 items** usually get: `casual`, `date`, sometimes `elegant`, plus style (`cute`, `sexy` as appropriate).
4. **Tier 3-4 items** usually get: `date`, `party`, sometimes `evening`, plus style (`sexy`, `slutty` as appropriate).
5. **Tier 5-6 items** usually get: `party`, `evening`, `fetish`, plus style (`slutty`, `sexy` as appropriate).
6. An item typically has **2–4 tags** total (1 tier if not T0 + 1–2 context + 0–1 style). Don't over-tag.
7. `work` tag should ONLY appear on Tier 0 items (and very rarely Tier 1).
8. `luxury` tag is ONLY for Hillcrest items.
9. `fetish` and `costume` tags are ONLY for Eros Boutique items.

---

# 6. ITEM PROPERTIES

Every item in the MD catalog must have these fields:

```
**Item ID:** {category}_{descriptor}_{color/variant}
**Mağaza:** {storeId}
**Tags:** {comma-separated: tier + context + style — see Section 5}
**Looks:** {number}
**Quality:** {Common|Rare|Premium}     ← Only if store has mixed quality
**KayıtID:** {camelCase ID}

**Prompt:**
{AI image generation prompt}
```
**Coats:** Her coat item’da ek alan **Warmth:** 0–5 (sıcak tutma). Bkz. §10 Coats — Sıcak tutma (Warmth).

**Tags:** Required. Use tier tag (if not Tier 0) + 1–2 context tags (e.g. `casual`, `work`, `date`) + 0–1 style tag (e.g. `cozy`, `minimalist`, `cute`) when it fits. Example: `**Tags:** casual, elegant, cozy`

### Item ID Convention

Format: `{type}_{variant}_{color}`

Examples:
- `tshirt_crew_white`
- `crop_oneshoulder_white`
- `blazer_structured_black`
- `jeans_skinny_dark`
- `skirt_mini_black`
- `dress_midi_floral`

Rules:
- All lowercase
- Underscore separated
- Color or distinguishing feature as last segment
- **Must be globally unique across ALL stores and ALL categories**
- Prefix with store hint if duplicate risk: `vera_crop_tied_black` vs `north_crop_tied_black`
- Hillcrest items can prefix with brand hint: `elise_blazer_silk_navy`, `aurum_dress_structured_black`
- Eros items can prefix with `eros_`: `eros_harness_top_black`

### KayıtID Convention

CamelCase version of the Item ID:
- `tshirt_crew_white` → `tshirtCrewWhite`
- `elise_blazer_silk_navy` → `eliseBlazerSilkNavy`

### Quality Field Rules

Include the **Quality** field ONLY when the store sells mixed qualities. Omit when the store has a single quality.

| Store | Quality Situation | Quality Field |
|---|---|---|
| Northline Apparel | Always Common | **OMIT** |
| VERA Mode | Mixed (Common + Rare) | **ALWAYS INCLUDE** |
| Fifth Avenue Wear | Always Rare | **OMIT** |
| FastBreak Athletics | Always Common | **OMIT** |
| Silk & Lace | Mixed (Common + Rare) | **ALWAYS INCLUDE** |
| Intimate Secrets | Always Rare | **OMIT** |
| Luxe Leather | Mixed (Common + Rare) | **ALWAYS INCLUDE** |
| Diamond Dreams | Mixed (Common + Rare) | **ALWAYS INCLUDE** |
| Maison Élise | Mixed (Rare + Premium) | **ALWAYS INCLUDE** |
| Aurum Couture | Always Premium | **OMIT** |
| Bellucci Milano | Always Premium | **OMIT** |
| Eros Boutique | Always Rare | **OMIT** |

---

# 6.5. VARIETY & DIFFERENTIATION — Avoid Similarity

**Problem:** Yeni eklemelerde sürekli aynı tarz (aynı silüet, aynı kesim) veya aynı renkler (hep siyah, lacivert, bordo) tekrarlanırsa mağazalar ve itemlar birbirine çok benzer hale geliyor.

**Kurallar (yeni item eklerken veya revize ederken):**

1. **Aynı mağaza içinde çeşitlilik**
   - Aynı tier'da **silüet/kesim tekrarından kaçın.** Örn: Zaten 3 "deep V bodycon" varsa dördüncüyü ekleme; farklı bir kesim seç (ör. halter, tek omuz, wrap, slip).
   - **Renk dağıt:** Aynı dosyada siyah/lacivert/bordo sayısı fazlaysa yeni item'da farklı renk kullan (ör. camel, krem, yeşil, bordö, kırmızı, desen).
   - Alt kategoride (örn. "short dress") benzer iki item varsa biri farklı kumaş/desen/aksesuar ile ayrışmalı.

2. **Mağazalar arası ayrışma**
   - **Northline:** Basics, geniş renk paleti, pamuk/jersey/denim; "her renk, her kesim" ama sade. VERA veya Fifth'teki gibi saten/silk yoğunluğu yapma.
   - **VERA Mode:** Trend kesimler (cutout, one-shoulder, asymmetric), saten görünüm, faux leather, desen — ama her item "cutout + siyah" olmasın; renk ve kesim çeşitliliği koru.
   - **Fifth Avenue:** Refined, minimal, kaliteli kumaş; daha az çeşit ama her parça "farklı" hissettirmeli. Sadece "midi pencil + siyah/lacivert" tekrarına düşme.
   - Aynı kategoride (örn. dresses) **üç mağazada da aynı "formül"** (örn. hep short deep V black) olmasın; mağaza karakterine göre kesim/renk/fiyat farkı net olsun.

3. **Yeni item öncesi kontrol**
   - Aynı MD dosyasında **aynı tier + benzer tarz** kaç tane var? 2+ ise yeni ekleme farklı silüet/renk ile yapılsın.
   - Diğer mağazaların aynı kategorideki MD'lerine bak: **aynı isimli/çok benzer** (örn. "backless mini navy") başka mağazada varsa bu mağazada farklı bir şey üret (farklı kesim veya farklı renk).

4. **Renk paleti hatırlatması**
   - Siyah/lacivert/bordo tek başına "elegant" demek değil; **camel, krem, beyaz, gri, kırmızı, yeşil, mavi, desen** de kullan. Her mağazada renk dağılımı o mağazanın karakterine uygun ama tek renge kaymasın.

Bu bölüm ileride revize edilecek; şimdilik yeni eklemelerde **benzer çok olmayacak şekilde** çeşitliliğe dikkat et.

---

### Price Field (Optional)

Price is NOT included in the MD catalog by default — it's assigned during twee conversion based on the store's price range and the item's quality/looks. However, if you want to suggest a specific price, add:

```
**Price:** $XX
```

**Coats — kategoriye özel fiyat:** Montlar dış giyim olduğu için mağazanın genel fiyat aralığından **daha yüksek** kullanılır. Twee dönüşümünde veya MD'de coat için şu aralıklar referans alınır:

| Mağaza | Genel aralık (tops/dresses/bottoms) | Coats fiyat aralığı |
|--------|--------------------------------------|----------------------|
| Northline Apparel | $8–30 | **$28–55** |
| VERA Mode | $25–70 | **$45–95** |
| Fifth Avenue Wear | $55–120 | **$85–155** |
| FastBreak Athletics | $15–50 | **$35–65** |

**Fiyat değeri atama kuralı (coats):** Looks düşük → aralığın altı, looks yüksek → aralığın üstü. VERA’da Common → daha düşük, Rare → daha yüksek. Örnek (item sırasına göre dağılım):

| Mağaza | Item sayısı | Örnek fiyat değerleri ($) |
|--------|-------------|---------------------------|
| Northline | 6 | 28, 32, 36, 42, 48, 55 |
| VERA | 7 | 45, 52, 58, 65, 72, 82, 95 |
| Fifth Avenue | 7 | 85, 92, 100, 108, 118, 132, 155 |
| FastBreak (sporty) | 4 | 35, 42, 52, 65 |

MD’de **Price:** yazacaksan bu değerlerden seç veya aynı mantıkla looks’a göre hesapla. Twee dönüşümünde coat kategorisi bu aralık ve örnek değerlere göre atanacak.

---

# 7. AI IMAGE PROMPT FORMAT

Every item needs a generation prompt. Follow this template:

```
1:1. A young fit woman wearing {DETAILED ITEM DESCRIPTION} paired with {PAIRING}; {CAMERA ANGLE}, professional fashion photography angle; framed from {FRAME START} to shoulders, full top visible, frame starts below nose, face cropped out; {MOOD/STYLE WORD}. Studio lighting, isolated on pure white background, focus on the {ITEM CATEGORY}.
```

### Prompt Variables

| Variable | Standard Value | When to Change |
|---|---|---|
| **Aspect ratio** | `1:1` | Always 1:1 |
| **Model / Body** | See "Body description by tier" below | **Tier 0:** `A young fit woman` — **Tier 1+:** vücut vurgusu (aşağıda); **voluptuous kullanma** — görselde chubby çıkıyor |
| **Bottom pairing** | `dark fitted jeans` | Change per category (see below) |
| **Camera angle** | `front three-quarter view` | `rear three-quarter view` for backless/open-back items |
| **Frame** | `framed from hips to shoulders` | `framed from thighs to shoulders` for long tops/tunics; **Dresses:** `framed from below the chin to the feet` (çene altından ayaklara kadar — tam boy elbise + ayaklar) |
| **Face** | `frame starts below nose, face cropped out` | Omit for Bottoms (frame is feet to waist, face not in frame) |
| **Background** | `isolated on pure white background` | Never change |
| **Focus** | `focus on the top` | Change per category |

### Body description by tier (confidence)

**Tier 0 (reqConf 0):** Kıyafet “herkese uygun” hissi verdiği için model betimlemesi nötr kalır.

- **Model:** `A young fit woman`

**Tier 1 ve üzeri (reqConf 20+):** Daha açık / vurgulu parçalarda görselde kadın vücudu oranları belirgin (göğüs, kalça) olacak şekilde yazılır. Prompt’un başındaki model cümlesi buna göre değişir.

- **Tops / üst beden vurgulu:** `A young fit woman with a perky bust` (voluptuous kullanma — chubby çıkıyor)
- **Bottoms / kalça vurgulu:** `A young fit woman with full hips and rounded butt`
- **Hem üst hem alt vurgulu (dress, bodysuit vb.):** `A young fit woman with a slim waist and feminine curves` (voluptuous kullanma — chubby çıkıyor)

Örnek (Tier 1 top):  
`1:1. A young fit woman with a perky bust wearing a black racerback tank...`

Örnek (Tier 2 bottom):  
`1:1. A young fit woman with full hips and rounded butt wearing high-waist shorts...`

**Kural:** Item’da tier tag’i varsa (`mild`, `revealing`, `daring`, `bold`, `erotic`, `lewd`) veya reqConfidence 20+ ise prompt’ta yukarıdaki vücut betimlemelerinden uygun olanı kullan; Tier 0 item’larda sadece `A young fit woman` kullan. **Asla "voluptuous" yazma** — AI görselde chubby çıkarıyor; fit kalmalı.

### Prompt Pairing by Category

| Category | Pairing | Focus | Frame |
|---|---|---|---|
| **Tops** | `paired with dark fitted jeans` | `focus on the top` | `hips to shoulders` |
| **Bottoms** | `paired with a simple white fitted tee` | `focus on the bottom` | `framed from hips to feet, full bottom garment visible, frame cuts at waist` ← tops'taki `framed from hips to shoulders, full top visible, frame starts below nose` yapısının tam aynası |
| **Dresses** | No pairing | `focus on the dress` | `framed from below the chin to the feet, full dress visible, shoes/feet in frame` (çene altından ayaklara kadar) |
| **Shoes** | `paired with dark fitted jeans` | `focus on the shoes` | `floor to mid-calf` |
| **Coats** | `over a simple white tee and dark fitted jeans` | `focus on the coat` | `hips to shoulders` or `thighs to shoulders` |
| **Bras** | No pairing or `with matching panty` | `focus on the bra` | `waist to shoulders` |
| **Panties** | No pairing or `with matching bra` | `focus on the panty` | `thighs to waist` |
| **Bodysuits** | No pairing | `focus on the bodysuit` | `thighs to shoulders` |
| **Sleepwear** | No pairing | `focus on the sleepwear` | `thighs to shoulders` or `knees to shoulders` |
| **Bags** | `carried by a young fit woman in a simple white tee and dark fitted jeans` | `focus on the bag` | varies |
| **Jewelry** | Close-up shot, different template (see below) |

### Jewelry Prompt Template

```
1:1. Close-up of {JEWELRY DESCRIPTION} worn by a young fit woman; {AREA} visible, professional jewelry photography; clean minimal. Studio lighting, isolated on pure white background, focus on the {jewelry type}.
```

Areas: `neck and collarbones` (necklaces), `ear` (earrings), `wrist` (bracelets), `hand` (rings)

### Prompt Quality by Store Segment

| Segment | Prompt Style | Material Keywords |
|---|---|---|
| **Entry (Northline, FastBreak)** | Simple, basic | cotton, jersey, denim, polyester, basic knit |
| **Mid (VERA)** | Trendy, fashionable | satin-like, ribbed knit, faux leather, printed, textured |
| **Upper-Mall (Fifth Ave)** | Refined, quality | silk-like, fine knit, structured, tailored, quality fabric |
| **Designer (Hillcrest)** | Luxurious, premium | real silk, cashmere, Italian leather, fine wool, haute construction |
| **Adult (Eros)** | Provocative, fetish | PVC, latex, fishnet, sheer mesh, chain, harness, bondage-inspired |

### Prompt Rules

1. **Describe the actual garment in detail**: material, color, cut, neckline, sleeve type, special features
2. **One mood/style word at the end** before the period: `cozy`, `edgy`, `refined`, etc. **Bottoms:** mood word yok; **11.png standard:** `standing still with hands at hips` + `framed from mid-torso to ankles, bottom garment dominates the frame` + `Studio lighting, isolated on pure white background, focus on the bottom garment.`
3. **Never mention brand names** in prompts
4. **Color must match** the item name/ID
5. **Body description by tier:** Tier 0 → `A young fit woman`. Tier 1+ (confidence 20+) → vücut oranları belirgin: tops için `perky bust`, bottoms için `full hips and rounded butt`, dress/bodysuit için `slim waist and feminine curves`. **Voluptuous kullanma** — AI görselde chubby çıkarıyor; fit kalmalı. Bkz. "Body description by tier" yukarıda.
6. **For revealing items**, describe what's exposed: "showing cleavage", "exposing back", "showing midriff"
7. **For layered items** (blazer over tee, cardigan over cami), describe both layers
8. **For Hillcrest items**, emphasize quality materials and construction details
9. **For Eros items**, emphasize the provocative/fetish aesthetic directly

---

# 8. MD FILE FORMAT

Each store file follows this exact structure:

```markdown
# {Category} Kataloğu — {Store Name} ({storeId})

**Segment:** {Segment description}
**Quality:** {Quality range}
**Looks Aralığı:** {min}–{max}
**Fiyat Aralığı:** ${min}–${max}
**Toplam:** {count} item

**Tier Dağılımı:**
- Tier 0 (serbest): {count}
- Tier 1 (mild): {count}
- Tier 2 (revealing): {count}
- Tier 3 (daring): {count}
- Tier 4 (bold): {count}
- Tier 5 (erotic): {count}       ← include only if store has this tier
- Tier 6 (lewd): {count}         ← include only if store has this tier

---
---

# ═══════════════════════════════════════════
# TIER 0 — Serbest (reqConf 0)
# ═══════════════════════════════════════════

---
---

## {Sub-type Header}

---

**Item ID:** {id}
**Mağaza:** {storeId}
**Tags:** {tags}
**Looks:** {number}
**Quality:** {quality}          ← Only if store has mixed quality
**KayıtID:** {camelCaseId}

**Prompt:**
{prompt text}

---

(... more items ...)

---
---

# ═══════════════════════════════════════════
# TIER 1 — Mild (reqConf 20)
# ═══════════════════════════════════════════

---
---

(... items ...)
```

### Formatting Rules

1. **Double horizontal rules** (`---\n---`) between tier sections
2. **Single horizontal rule** (`---`) between items
3. **Sub-type headers** (`## T-Shirts`, `## Crop Tops`, etc.) within tiers — only in Tier 0 and Tier 1 if many items. Higher tiers usually have fewer items and don't need sub-headers.
4. **Bold field names** with colon: `**Item ID:**`
5. **Empty line** between Prompt label and prompt text
6. Items are grouped by sub-type within each tier
7. **Only include tier sections that have items.** If a store has no Tier 5 or 6, don't include those sections.

---

# 9. CATEGORY-SPECIFIC TARGET COUNTS

## Wardrobe Twee — Güncel sayılar (oyun içi)

Oyun içinde tanımlı item sayıları (`passages/0 - System/WardrobeSys/`):

| Kategori | Dosya | Toplam item |
|----------|-------|-------------|
| **Tops** | `wardrobeTops.twee` | **178** |
| **Bottoms** | `wardrobeBottoms.twee` | **159** |
| **Shoes** | `wardrobeShoes.twee` | **110** |

*Son güncelleme: sayılar wardrobe .twee dosyalarındaki `id:` kayıtlarına göredir.*

---

## Mall Targets

| Category | Total Target | Northline | VERA | Fifth Ave | FastBreak | Silk&Lace | Intimate | Luxe | Diamond | Other |
|---|---|---|---|---|---|---|---|---|---|---|
| **Tops** | 175 | 50 | 55 | 38 | 32 | — | — | — | — | — |
| **Bottoms** | 149 | 43 | 47 | 33 | 26 | — | — | — | — | — |
| **Dresses** | **60** | 19 | 23 | 18 | — | — | — | — | — | — |
| **Coats** | ~24 | 6 | 7 | 7 | 4 | — | — | — | — | — |
| **Shoes** | 110 ✅ | — | — | — | 15 | — | — | — | — | StepUp(38), Stiletto(57) |
| **Socks** | ~18 | — | — | — | 4 | 14 | — | — | — | — |
| **Bras** | ~30-35 | — | — | — | 5 | 12-15 | 12-15 | — | — | — |
| **Panties** | ~25-30 | 4-5 | — | — | — | 10-12 | 10-12 | — | — | — |
| **Sleepwear** | ~12-16 | — | — | — | — | 5-7 | 7-9 | — | — | — |
| **Bodysuits** | ~8-12 | — | — | — | — | — | 8-12 | — | — | — |
| **Garter** | ~4-6 | — | — | — | — | — | 4-6 | — | — | — |
| **Bags** | ~14-18 | — | — | — | — | — | — | 14-18 | — | — |
| **Jewelry** | ~40-50 | — | — | — | — | — | — | — | 40-50 | — |

### Tops DB Snapshot (Variant B — active)

Kaynak: `1Developer/ShopMd/1- tops (malldone)`. FastBreak için kullanılan dosya: `tops-sport-store.md`.

| Mağaza | Dosya | Toplam | T0 | T1 | T2 | T3 | T4 |
|--------|-------|-------:|---:|---:|---:|---:|---:|
| Northline Apparel | `tops-northline-apparel.md` | 50 | 30 | 14 | 5 | 1 | 0 |
| VERA Mode | `tops-vera-mode.md` | 55 | 15 | 15 | 14 | 9 | 2 |
| Fifth Avenue Wear | `tops-fifth-avenue-wear.md` | 38 | 14 | 6 | 10 | 5 | 3 |
| FastBreak Athletics | `tops-sport-store.md` | 32 | 15 | 11 | 5 | 1 | 0 |
| **TOPLAM** | | **175** | **74** | **46** | **34** | **16** | **5** |

### Bottoms DB Snapshot (Mall — tamamlandı)

Kaynak: `1Developer/ShopMd/2- bottoms (malldone)`.

| Mağaza | Dosya | Toplam | T0 | T1 | T2 | T3 | T4 |
|--------|-------|-------:|---:|---:|---:|---:|---:|
| Northline Apparel | `bottoms-northline-apparel.md` | 43 | 26 | 9 | 6 | 2 | 0 |
| VERA Mode | `bottoms-vera-mode.md` | 47 | 11 | 12 | 12 | 8 | 4 |
| Fifth Avenue Wear | `bottoms-fifth-avenue-wear.md` | 33 | 12 | 4 | 9 | 5 | 3 |
| FastBreak Athletics | `bottoms-fastbreak-athletics.md` | 26 | 8 | 6 | 5 | 5 | 2 |
| **TOPLAM** | | **149** | **57** | **31** | **32** | **20** | **9** |

### Dresses DB Snapshot (Mall — tamamlandı)

Kaynak: `1Developer/1-Prompts/ShopMd/3- dresses`.

| Mağaza | Dosya | Toplam | T0 | T1 | T2 | T3 | T4 |
|--------|-------|-------:|---:|---:|---:|---:|---:|
| Northline Apparel | `dresses-northline-apparel.md` | 19 | 11 | 5 | 2 | 1 | 0 |
| VERA Mode | `dresses-vera-mode.md` | 23 | 6 | 6 | 6 | 3 | 2 |
| Fifth Avenue Wear | `dresses-fifth-avenue-wear.md` | 18 | 7 | 3 | 5 | 2 | 1 |
| **TOPLAM** | | **60** | **24** | **14** | **13** | **6** | **3** |

FastBreak Athletics dress satmıyor (tops, bottoms, shoes, bras, socks).

### Coats DB Snapshot (Mall — plan)

Coats satan mağazalar: **Northline Apparel**, **VERA Mode**, **Fifth Avenue Wear**, **FastBreak Athletics** (sadece sportif dış giyim).

| Mağaza | Dosya | Toplam | T0 | T1 | T2 | T3 | T4 | Fiyat aralığı (coats) |
|--------|-------|-------:|---:|---:|---:|---:|---:|---|
| Northline Apparel | `coats-northline-apparel.md` | **6** | 4 | 2 | 0 | 0 | 0 | **$28–55** |
| VERA Mode | `coats-vera-mode.md` | **7** | 2 | 2 | 2 | 1 | 0 | **$45–95** |
| Fifth Avenue Wear | `coats-fifth-avenue-wear.md` | **7** | 3 | 2 | 1 | 1 | 0 | **$85–155** |
| FastBreak Athletics | `coats-fastbreak-athletics.md` | **4** | 4 | 0 | 0 | 0 | 0 | **$35–65** |
| **TOPLAM** | | **24** | **13** | **6** | **3** | **2** | **0** | — |

Coats, mağazanın genel fiyatından **yüksek** (dış giyim = daha fazla kumaş/maliyet). Bkz. §6 Price Field — Coats kategoriye özel fiyat.

- **Northline:** Sadece T0–T1 (max tier 3 ama coat’ta 1–2 item ile sınırlı; basics ağırlık → T0/T1 yeterli). Klasik trenç, parka, puffer, duffle, cropped basic. Fiyat $28–55.
- **VERA Mode:** T0–T3 yayılımı (max 4, “3 items only” üst tier’da). Trend kesimler: fitted, belted, cropped. Fiyat $45–95.
- **Fifth Avenue Wear:** T0–T3. Refined, kaliteli kumaş; belted wrap, structured open coat. Fiyat $85–155.
- **FastBreak Athletics:** Sadece **sportif dış giyim** (hepsi T0): windbreaker, track jacket, running jacket, lightweight hooded jacket. Fiyat $35–65.

## Hillcrest Targets (Future)

| Category | Maison Élise | Aurum Couture | Bellucci Milano | Total |
|---|---|---|---|---|
| **Tops** | 15-20 | 12-15 | 10-12 | ~40-47 |
| **Bottoms** | 12-15 | 10-12 | 8-10 | ~30-37 |
| **Dresses** | 10-12 | 10-12 | 8-10 | ~28-34 |
| **Coats** | 5-7 | 5-6 | 3-5 | ~13-18 |
| **Bodysuits** | — | — | 3-5 | ~3-5 |

## Red Light Targets (Future)

| Category | Eros Boutique |
|---|---|
| **Tops** | 15-20 |
| **Bottoms** | 10-15 |
| **Dresses** | 8-12 |
| **Bodysuits** | 8-12 |
| **Bras** | 6-8 |
| **Panties** | 6-8 |
| **Shoes** | 5-8 |
| **Special/Costumes** | 5-10 |

---

# 10. SPECIAL ITEM PROPERTIES

Some categories have additional properties beyond the standard fields.

## Shoes — Extra Properties

```
**Heel Height:** {number} cm       ← 0, 4, 7, 10, 12
**Platform:** true/false            ← optional, default false
**reqHeelsSkill:** {number}         ← 0-100
**heelsSkillCap:** {number}         ← max skill gain from this item
```

Heel tier mapping:
| cm | Tier Name | reqHeelsSkill Range |
|---|---|---|
| 0 | Flat | 0 |
| 3-5 | Low/Kitten | 0-10 |
| 6-8 | Mid | 15-30 |
| 9-10 | High | 30-50 |
| 11-13 | Very High | 50-80 |

## Lingerie — Matching Sets

When creating bras and panties, note matching sets with:
```
**Set:** {setName}                  ← e.g., "midnight-lace"
```
Both the bra and panty in a set should share the same set name. This enables the outfit system to detect matching underwear for bonus looks.

## Bags — Slot Tag

```
**Slot:** {day|evening|work}        ← bag usage context
```

## Coats — Sıcak tutma (Warmth)

**Future:** Oyun içinde hava/soğuk sistemi kullanılırsa coat’ın ne kadar sıcak tuttuğu bu değerle belirlenir. MD kataloğunda her coat için eklenir.

```
**Warmth:** {0-5}                   ← sıcak tutma değeri (0 = neredeyse yok, 5 = çok sıcak tutar)
```

| Değer | Anlam | Örnek |
|-------|--------|--------|
| 0 | Neredeyse sıcak tutmaz, ince / rüzgar geçirir | Windbreaker, ince track jacket, cropped open jacket |
| 1 | Çok hafif ısı | İnce yağmurluk, lightweight hooded jacket |
| 2 | Hafif ısı | İnce trenç, hafif parka, denim jacket |
| 3 | Orta ısı | Klasik trenç, orta kalınlık pea coat, belted wool blend |
| 4 | İyi sıcak tutar | Kalın wool coat, puffer (ince), duffle |
| 5 | Çok sıcak tutar | Ağır puffer, kalın kürk görünümlü, uzun ağır winter coat |

Sportif (FastBreak) coat’lar çoğunlukla 0–1; Northline/VERA/Fifth’te 1–5 arası dağılır. Twee dönüşümünde bu alan `warmth` veya `sıcakTutma` olarak oyun verisine aktarılacak.

---

# 11. CHECKLIST BEFORE SUBMITTING

Before finalizing any catalog file, verify:

- [ ] **Store is defined** in Section 2 of this guide (if new store, add definition first)
- [ ] **Item count matches** the stated total in header
- [ ] **Tier counts match** the tier distribution in header
- [ ] **Tier distribution matches store character** (refer to Section 3 tier limits)
- [ ] **No duplicate Item IDs** across ALL files globally
- [ ] **Variety & differentiation (Section 6.5):** Aynı mağazada aynı tarz/renk tekrarı az; mağazalar birbirinden ayrışıyor; yeni item eklerken mevcut itemlara bakıldı.
- [ ] **Looks values are within store range** (refer to Section 4)
- [ ] **Average looks** sits in the middle of the store's range
- [ ] **Quality field** included ONLY for mixed-quality stores (refer to Section 6)
- [ ] **Each item has exactly ONE tier tag** (or none for Tier 0)
- [ ] **No tier exceeds store's max tier** (refer to Section 3 tier limits)
- [ ] **Every item has a `**Tags:**` line** (tier + context + style; Section 5)
- [ ] **Style/personality tags** used where they fit (so wardrobe "Overall Style" shows correctly)
- [ ] **`work` tag only on Tier 0** items (rarely Tier 1)
- [ ] **`luxury` tag only on Hillcrest** items
- [ ] **`fetish`/`costume` tag only on Eros** items
- [ ] **Prompts follow the template** exactly (refer to Section 7)
- [ ] **Prompt material keywords match store segment** (cotton for Northline, silk for Hillcrest)
- [ ] **Color in prompt matches** item name
- [ ] **KayıtID is valid camelCase** of Item ID
- [ ] **Higher tiers have fewer items** (pyramid shape within each store)
- [ ] **No Premium quality in mall stores** — Premium is Hillcrest only
- [ ] **Special properties included** if applicable (shoes: heelHeight; lingerie: set; bags: slot; **coats: warmth** 0–5)

---

# 12. IMPORTANT NOTES

1. **The tier tag system is universal.** It works the same way in every store — mall, Hillcrest, Red Light, or any future location. The tag (`mild`, `daring`, `bold`, etc.) automatically sets reqConfidence, reqCorruption, and reqExhibitionism via the game's widget system.
2. **Corruption and Exhibitionism are NOT manually assigned.** They come from the tier tag. You only assign the correct tier tag. Exception: item-specific overrides in twee code for edge cases.
3. **What changes between stores is NOT the tier system but:** quality, looks range, price, material quality, and tier distribution.
4. **Mall = Fast Fashion, Hillcrest = Designer, Red Light = Adult.** A mall Tier 3 (daring) mesh top and a Hillcrest Tier 3 (daring) mesh top have the same stat requirements — but the Hillcrest version has Premium quality, higher looks, and costs 5x more.
5. **The MD catalog is a PLANNING document.** It will be converted to twee code. The MD must contain all information needed for conversion.
6. **This guide applies to ALL stores.** When adding items to any store — existing or new — follow this guide's format, rules, and conventions exactly.
7. **Shoes have additional properties** (`heelHeight`, `platform`, `heelsSkillCap`, `reqHeelsSkill`). Always include them for shoe items.
8. **When creating a new store:** first add its full definition to Section 2 of this guide, then create catalog files.