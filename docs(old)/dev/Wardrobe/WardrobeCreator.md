# WARDROBE CREATOR AGENT — FINAL MASTER FILE

_Tek dosya. Başka hiçbir dosyaya bakma. storeAdult dahil değil._

**Görsel Motor:** imagePrompt'lar **Grok (xAI)** üzerinden görsel üretmek için optimize edilmiştir.

**Kullanım:** `Creator ile [Kategori] yarat — [StoreID] — [Adet]`

---

## BÖLÜM 1 — KOMUT FORMATINI OKU

```
Kategori      → tops | bottoms | dress | coats | shoes | bags | jewellery |
                bikiniTop | bikiniBottom | swimsuit | bra | panty |
                bodysuit | garter | sleepwear | socks
StoreID       → Bölüm 3'teki mağaza listesinden biri
Adet          → kaç item üretilecek
Tier dağılımı → belirtilmezse mağazanın default dağılımını kullan
```

**Komut gelince sırayla:**

1. Bölüm 2 — stat sistemi (zorunlu oku)
2. Bölüm 3 — mağaza kuralları + STORE IDENTITY
3. Bölüm 6 — tier + gating tablosu
4. Bölüm 7 — tag sistemi (zorunlu oku)
5. Bölüm 8 — kategori & materyal havuzları
6. Bölüm 9 — renk rotasyonu
7. Bölüm 10 — pipeline çalıştır, JSON üret

---

## BÖLÜM 2 — STAT SİSTEMİ (ZORUNLU)

### 2.1 Confidence — Türetilmiş

```
$confidence = (charisma × 0.5) + (looks × 0.3)   clamp 0–100

Gerçekçi eşikler:
  Oyun başı  → confidence ~10–15
  Erken oyun → confidence ~20–30
  Orta oyun  → confidence ~35–50
  Geç oyun   → confidence ~55–65
  Maksimum   → confidence ~80
```

**reqConfidence MAX 78 olmalı — 80 üstü üretme, oyuncu erişemez.**

### 2.2 Looks — Türetilmiş

```
$looks = beauty×0.50 + hygiene×0.10 + clothingScore×0.20 + makeup×0.20
```

### 2.3 Corruption — 0–10, 2'şer kademe

```
0  → Temiz, masum
2  → Hafif meraklı, ilk sınır zorlamalar
4  → Gevşemiş sınırlar, cesur seçimler
6  → Belirgin corruption, açıkça sınır dışı
8  → İleri seviye
10 → Tam corrupted
```

Referans: corruption ≥ 2 → underwear ile dışarı. corruption ≥ 5 → çıplak çıkabilir.

### 2.4 Formüller

```
reqConfidence    = (exposure × 7) + (sexiness × 3)   clamp 0–100, MAX 78
reqExhibitionism = max(0, exposure − 3) × 6
reqCorruption    = exposure 7–8 → 4 | exposure 9–10 → 6   (override yoksa)
```

---

## BÖLÜM 3 — MAĞAZA KURALLARI + STORE IDENTITY

> **TEMEL KURAL:** Düz solid renkli basic itemlar bir batch'in max **%40'ı**. Kalan **%60** desen, texture, detay, grafik veya özel kesim içerir.

---

### MALL — Ground Floor

---

#### `storeClothingA` — Northline Apparel

**Referans:** H&M / Primark | **Segment:** Budget Entry

| Alan                   | Değer                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tier bandı             | T0–T3                                                                                                                              |
| Default tier           | T0:%19 · T1:%32 · T2:%32 · T3:%14 · T4:%3                                                                                          |
| Quality                | Common ağırlıklı, az Rare                                                                                                          |
| exposureLevel max      | 4                                                                                                                                  |
| sexinessScore max      | 3                                                                                                                                  |
| reqCorruption override | YOK                                                                                                                                |
| Fiyat                  | $8–$70 (tops/bottoms) · $25–$90 (dress) · $3–$35 (panty) · $5–$10 (bra) · $3–$8 (socks) · $12–$20 (bodysuit) · $15–$25 (sleepwear) |
| Primary style tags     | `casual` (T0–T2) · `cute` (T2–T3)                                                                                                  |
| Yasak tags             | erotic, lewd, slutty, bimbo, daring, revealing                                                                                     |
| Yeni kategoriler       | Bra (basic sports-bra, bralette) · Socks (ankle, crew, no-show) · Bodysuit (basic scoop, round-neck)                               |

**🏪 STORE IDENTITY — H&M/Primark**
Ucuz ama eğlenceli. Sezona göre renk patlaması. Trend baskılar ile basic karışımı.

**Variety Rules (bir batch'te hepsi olmalı):**

- En az 1 grafik/baskılı item (slogan tee, graphic print)
- En az 1 çizgili veya ekoseli (stripe, plaid, gingham)
- En az 1 çiçekli veya geometrik (floral, ditsy, abstract, polka dot)
- En az 1 texture'lı solid (ribbed knit, waffle, broderie — düz jersey değil)

**Tipik örnekler:** Breton çizgili tee · oversized slogan hoodie · floral mini dress · acid wash denim · ribbed knit coord · gingham crop top · tie-dye tee · faux leather mini skirt · tropical print blouse · color-block windbreaker

---

#### `storeSports` — FastBreak Athletics

**Referans:** Nike / Adidas | **Segment:** Sports & Performance

| Alan                   | Değer                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| Tier bandı             | T0–T3                                                                 |
| Default tier           | T0:%16 · T1:%41 · T2:%33 · T3:%10                                     |
| Quality                | Common–Rare                                                           |
| exposureLevel max      | 5                                                                     |
| sexinessScore max      | 3                                                                     |
| reqCorruption override | YOK                                                                   |
| Fiyat                  | $25–$120 (apparel) · $45–$140 (shoes)                                 |
| Primary style tags     | `sporty` (her zaman)                                                  |
| Yasak tags             | erotic, lewd, slutty, bimbo, daring, revealing, elegant, formal, sexy |
| Shoes                  | running · training · slides · court — reqHeelsSkill YOK               |

**🏪 STORE IDENTITY — Nike/Adidas**
Performans önce. Technical detail, contrast panel. Monocolor → mutlaka teknik özellik.

**Variety Rules:**

- En az 1 color-block
- En az 1 mesh panel / ventilation detail
- En az 1 stripe / logo-placement
- Monocolor → zip pocket, bonded seam veya reflective piping

**Tipik örnekler:** Color-block running jacket · mesh panel sports bra · side-stripe leggings · compression tights with gradient · zip-up track jacket · court sneaker · embossed slides

---

#### `storeSwim` — Aqua Lane

**Referans:** Triangl / Seafolly / Speedo | **Segment:** Swimwear Specialist

| Alan                   | Değer                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Tier bandı             | T1–T4                                                        |
| Default tier           | T1:%20 · T2:%37 · T3:%33 · T4:%10                            |
| Quality                | Common–Rare–Premium                                          |
| exposureLevel max      | 7 (Swimsuit) · 8 (BikiniTop/Bottom)                          |
| sexinessScore max      | 6                                                            |
| reqCorruption override | T3+: YOK (plaj kıyafeti normaldir)                           |
| Fiyat                  | $15–$45 (Basic) · $40–$90 (Rare) · $85–$150 (Premium)        |
| Primary style tags     | `sporty` (T1) · `cute` (T2) · `sexy` (T3) · `revealing` (T4) |
| Yasak tags             | erotic, lewd, slutty, bimbo, elegant, formal                 |
| Kategoriler            | BikiniTop · BikiniBottom · Swimsuit (one-piece)              |

**🏪 STORE IDENTITY — Triangl/Seafolly**
Sahil/resort. Geometrik desenler, tropical prints, sporty bold renkler, çizgiler. Cut-out details, tie-side, halter straps.

**Variety Rules:**

- En az 1 geometric/abstract print
- En az 1 tropical/floral print
- En az 1 solid + hardware/tie detail
- En az 1 sporty/athletic style
- BikiniTop–BikiniBottom eşleşen setler: same print/color, mix-match seçeneği
- Swimsuit: en az 1 cut-out detail · 1 halter style · 1 sporty back

**Tipik örnekler:** Triangle bikini (geometric neon) · halter one-piece (deep plunge) · tie-side hipster bottom · sporty racerback swimsuit · tropical print bandeau bikini · ruched side-tie bottom · underwire bikini top (stripes)

---

#### `storeShoeA` — StepUp Footwear

**Referans:** Deichmann / Payless | **Segment:** Budget–Mid Casual Shoes

| Alan                   | Değer                    |
| ---------------------- | ------------------------ |
| Tier bandı             | T0–T2                    |
| Default tier           | T0:%29 · T1:%43 · T2:%28 |
| Quality                | Common–Rare              |
| reqHeelsSkill          | 0–1 max                  |
| reqCorruption override | YOK                      |
| Fiyat                  | $20–$90                  |
| Primary style tags     | `casual`                 |

**🏪 STORE IDENTITY — Deichmann/Payless**
Her gün giyilebilir, fonksiyonel. Renk varyasyonu yüksek.

**Tipik örnekler:** Platform chunky sneaker · floral canvas flat · leopard print loafer · metallic ballet flat · color-block sandal · chelsea boot · espadrille wedge

---

### MALL — Second Floor

---

#### `storeClothingB` — VERA Mode

**Referans:** Zara / Mango | **Segment:** Mid Trendy

| Alan                   | Değer                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Tier bandı             | T2–T4                                                              |
| Default tier           | T2:%30 · T3:%40 · T4:%20                                           |
| Quality                | Rare ağırlıklı                                                     |
| exposureLevel max      | 7                                                                  |
| sexinessScore max      | 6                                                                  |
| reqCorruption override | YOK (exposure 7 → formül: 4)                                       |
| Fiyat                  | $50–$160 (tops/bottoms/dress) · $25–$50 (bodysuit)                 |
| Primary style tags     | `casual` (T2) · `cute` (T2–T3) · `sexy` (T3–T4) · `revealing` (T4) |
| Yasak tags             | erotic, lewd, slutty, bimbo, sporty                                |
| Yeni kategoriler       | Bodysuit (casual-chic: wrap, V-neck, saten/jersey)                 |

**🏪 STORE IDENTITY — Zara/Mango**
Runway'den ilham. "Ucuz lüks." Saten görünümü, kesim detayları.

**Variety Rules:**

- En az 1 saten/saten-görünümlü item
- En az 1 yapısal detay (asymmetric hem, cut-out, wrap)
- En az 1 animal print veya abstract desen
- En az 1 monokromatik/tonal look

**Tipik örnekler:** Satin slip dress · wrap midi skirt (leopard) · structured blazer · asymmetric hem blouse · ruched bodycon · abstract brushstroke print · cut-out knit top · faux leather trench

---

#### `storeClothingC` — Fifth Avenue Wear

**Referans:** BCBG / Karen Millen | **Segment:** Aspirational Mid-Premium

| Alan                   | Değer                                               |
| ---------------------- | --------------------------------------------------- |
| Tier bandı             | T3–T4                                               |
| Default tier           | T3:%50 · T4:%50                                     |
| Quality                | Rare–Premium                                        |
| exposureLevel max      | 6                                                   |
| sexinessScore max      | 5                                                   |
| reqCorruption override | YOK                                                 |
| Fiyat                  | $100–$220                                           |
| Primary style tags     | `elegant` · `professional` · `formal` (T3–T4)       |
| Yasak tags             | casual, sporty, erotic, lewd, slutty, bimbo, daring |
| npcAppeal              | professional + elite NPC yüksek                     |

**🏪 STORE IDENTITY — BCBG/Karen Millen**
"Güçlü ama zarif." Structured silhouette, rich ve deep renkler.

**Variety Rules:**

- En az 1 structural item (tailored blazer, pencil skirt)
- En az 1 evening-ready (crepe midi, satin detail)
- Desenler subtle: jacquard, fine stripe, lace overlay

**Tipik örnekler:** Double-breasted blazer (deep charcoal) · crepe pencil skirt (ivory) · lace-panel bodycon · tailored wide-leg trousers (rich burgundy) · jacquard midi skirt · structured coat

---

#### `storeLingerieA` — Silk & Lace

**Referans:** Victoria's Secret (romantic) | **Segment:** Mid Lingerie

| Alan                   | Değer                                        |
| ---------------------- | -------------------------------------------- |
| Tier bandı             | T2–T4                                        |
| Default tier           | T2:%30 · T3:%50 · T4:%20                     |
| Quality                | Rare ağırlıklı                               |
| exposureLevel max      | 7                                            |
| sexinessScore max      | 7                                            |
| reqCorruption override | T3: **2** · T4: **4**                        |
| Fiyat                  | $15–$80 (lingerie) · $20–$55 (bikini/socks)  |
| Primary style tags     | `cute` (T2) · `sexy` (T3) · `revealing` (T4) |
| Yasak tags             | erotic, lewd, slutty, bimbo, sporty, casual  |

**🏪 STORE IDENTITY — VS Romantic**
Pastel ve kırmızı/pembe palet, lace overlay, bow detail, satin ribbon, floral print.

**Variety Rules:**

- En az 1 lace-heavy item
- En az 1 floral/ditsy print
- En az 1 bow/ribbon detail
- Solid → satin/silk-feel materyal

**Tipik örnekler:** Blush lace bralette with bow · floral satin chemise · ivory lace-trim bikini · red satin balconette · dusty rose high-waist brief · ribbon-tie thong · satin sleep shorts

---

#### `storeLingerieB` — Intimate Secrets

**Referans:** Agent Provocateur (lite) | **Segment:** Premium Lingerie

| Alan                   | Değer                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| Tier bandı             | T3–T5                                                                   |
| Default tier           | T3:%30 · T4:%40 · T5:%30                                                |
| Quality                | Rare–Premium                                                            |
| exposureLevel max      | 10                                                                      |
| sexinessScore max      | 10                                                                      |
| reqCorruption override | T3: **4** · T4: **6** · T5: **8**                                       |
| Fiyat                  | $35–$150                                                                |
| Primary style tags     | `sexy` (T3) · `revealing`+`daring` (T4) · `erotic`+`lewd`+`slutty` (T5) |
| Yasak tags             | casual, sporty, bimbo                                                   |

**🏪 STORE IDENTITY — Agent Provocateur**
Koyu, editorial, provokatif. Siyah dominant. Strappy hardware, mesh, barely-there.

**Variety Rules:**

- En az 1 strappy/harness detail
- En az 1 mesh/sheer panel
- En az 1 cut-out
- Desen: leopard, snake, subtle lace texture

**Tipik örnekler:** Black strappy mesh bodysuit · deep emerald plunge bra · snake print brief · sheer balconette · cut-out thong with O-ring · barely-there triangle bikini · harness garter belt · fishnet thigh-high · vinyl-look brief

---

#### `storeBags` — Luxe Leather

**Referans:** Coach / Kate Spade | **Segment:** Bags Only

| Alan                   | Değer                                                   |
| ---------------------- | ------------------------------------------------------- |
| Tier bandı             | T2–T4                                                   |
| Default tier           | T2:%30 · T3:%50 · T4:%20                                |
| Quality                | Rare–Premium                                            |
| exposureLevel          | 0                                                       |
| sexinessScore          | 0                                                       |
| reqCorruption override | YOK                                                     |
| Fiyat                  | $50–$280                                                |
| Primary style tags     | `professional` (T3–T4) · `elegant` (T4) · `casual` (T2) |
| npcAppeal              | professional + elite yüksek                             |

**🏪 STORE IDENTITY — Coach/Kate Spade**
Hero piece hissi. Hardware detay. Klasik nötr + seasonal pop rengi.

**Variety Rules:**

- En az 1 structured top-handle
- En az 1 crossbody/chain strap
- En az 1 clutch/evening bag
- Renk: nötr + en az 1 bold
- Her bag'de hardware detayı belirtilmeli

**Tipik örnekler:** Pebbled tote (camel, gold hardware) · mini crossbody chain (deep cherry) · patent clutch with turn-lock · bucket bag (sandy tan) · suede shoulder (forest green) · quilted chain shoulder (cream)

---

#### `storeJewelry` — Diamond Dreams

**Referans:** Pandora / Swarovski | **Segment:** Jewelry Only

| Alan                   | Değer                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| Tier bandı             | T2–T4                                                                        |
| Default tier           | T2:%40 · T3:%40 · T4:%20                                                     |
| Quality                | Common–Premium                                                               |
| exposureLevel          | 0                                                                            |
| sexinessScore          | 0–2                                                                          |
| reqCorruption override | YOK                                                                          |
| Fiyat                  | Bölüm 4.2'ye göre                                                            |
| Primary style tags     | `casual` (T2) · `elegant` (T3–T4)                                            |
| Uyarı                  | "diamond" item isminde geçmez — crystal/zirconia/sterling/gold-plated kullan |

**🏪 STORE IDENTITY — Pandora/Swarovski**
Gift-worthy. Charm, delicate layering, crystal accent.

**Variety Rules:**

- Farklı metal tonları
- En az 1 crystal/stone accent
- En az 1 delicate/minimalist + 1 statement/chunky
- Motifler: celestial, floral, geometric, heart, snake chain, initial

---

#### `storeShoeB` — Stiletto Studio

**Referans:** Aldo / Steve Madden | **Segment:** Heels Only

| Alan                   | Değer                                                      |
| ---------------------- | ---------------------------------------------------------- |
| Tier bandı             | T2–T5                                                      |
| Default tier           | T2:%25 · T3:%42 · T4:%25 · T5:%8                           |
| Quality                | Rare–Premium                                               |
| reqHeelsSkill          | 5cm→1 · 8cm→2 · 10cm→3 · 12cm+→4                           |
| reqCorruption override | T5 (12cm+ extreme): **4**                                  |
| Fiyat                  | $55–$200                                                   |
| Primary style tags     | `cute` (T2) · `elegant` (T3) · `sexy` (T4) · `daring` (T5) |
| Zorunlu tags           | `heels` (her zaman)                                        |

**🏪 STORE IDENTITY — Aldo/Steve Madden**
Fashion-forward. Statement piece. Metallic, animal print, sculptural heel.

**Variety Rules:**

- En az 1 metallic/iridescent
- En az 1 animal print
- En az 1 ankle-strap/strappy sandal
- En az 1 sculptural heel
- Solid → detay (bow, crystal, knot, toe cap, buckle)

---

### HİLLCREST — Fifth Street (Boutiques)

_Outerwear + Shoes. Premium–Luxury. Az item, yüksek fiyat._

---

#### `boutiqueA` — Maison Élise | T4–T5 | $150–$500

| Alan                   | Değer                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Default tier           | T4:%60 · T5:%40                                                   |
| Quality                | Premium–Luxury                                                    |
| reqCorruption override | YOK                                                               |
| Primary style tags     | `elegant` · `formal` (T4) · `elegant`+`slutty` (T5 açık parçalar) |
| Shoes                  | Minimal pump, sleek mule · 8–10cm · reqHeelsSkill 2–3 · $160–$400 |

**🏪** Celine/The Row: Sessiz lüks. Monokromatik palet. T5 = "elegant ama provocative" — backless gown, deep plunge luxury dress gibi. Bu parçalar `slutty` tag alır çünkü "zarif ama çok açık" estetiği taşır.
**Shoes:** Sleek, minimal silhouette. Monokromatik veya tonal nötr. Hiçbir detay gereğinden fazla değil — clean lines, matte leather, pointed toe.

---

#### `boutiqueB` — Aurum Couture | T3–T5 | $200–$600

| Alan                   | Değer                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| Default tier           | T3:%20 · T4:%50 · T5:%30                                            |
| Quality                | Premium–Luxury                                                      |
| reqCorruption override | YOK                                                                 |
| Primary style tags     | `elegant` · `formal` (T3–T4) · `elegant`+`slutty` (T5)              |
| Shoes                  | Sculptural heel, platform · 10–12cm · reqHeelsSkill 3–4 · $200–$500 |

**🏪** Alexander McQueen (wearable): Bold yapısal kesim. T5 = architectural backless, extreme cut-out luxury.
**Shoes:** Statement sculptural heel, bold platform. Structural detail, metallic accent veya geometric heel shape.

---

#### `boutiqueC` — Bellucci Milano | T3–T5 | $180–$550

| Alan                   | Değer                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| Default tier           | T3:%20 · T4:%50 · T5:%30                                                      |
| Quality                | Premium–Luxury                                                                |
| reqCorruption override | YOK                                                                           |
| Primary style tags     | `elegant` · `formal` (T3–T4) · `elegant`+`slutty` (T5)                        |
| Shoes                  | Italian leather pump, strappy sandal · 8–12cm · reqHeelsSkill 2–4 · $180–$450 |

**🏪** Versace/Max Mara: İtalyan craftsmanship, zengin kumaş. T5 = bold Italian luxury with revealing cuts.
**Shoes:** Rich Italian leather, warm tones (cognac, deep wine, gold hardware). Strappy sandal veya classic pointed pump.

---

## BÖLÜM 4 — EKONOMİ TABLOSU

### 4.1 Kıyafet Fiyat Aralıkları

| Kategori      | Common  | Rare     | Premium   | Luxury    |
| ------------- | ------- | -------- | --------- | --------- |
| Tops          | $8–$15  | $50–$70  | $100–$140 | $150–$220 |
| Bottoms       | $15–$30 | $60–$90  | $110–$160 | $170–$280 |
| Dress         | $25–$40 | $70–$120 | $130–$200 | $200–$350 |
| Coats         | $30–$50 | $80–$130 | $140–$220 | $220–$400 |
| Bra           | $5–$10  | $18–$30  | $35–$60   | $60–$100  |
| Panty         | $3–$8   | $15–$25  | $30–$50   | $50–$90   |
| Bodysuit      | $12–$20 | $25–$50  | $55–$90   | $90–$150  |
| Sleepwear     | $15–$25 | $35–$55  | $60–$90   | —         |
| Socks/Hosiery | $3–$8   | $10–$20  | $20–$35   | —         |
| Garter        | $8–$15  | $20–$40  | $45–$80   | —         |
| Bikini Top    | $5–$12  | $20–$40  | $45–$75   | —         |
| Bikini Bottom | $5–$12  | $20–$40  | $45–$75   | —         |
| Swimsuit      | $15–$30 | $40–$70  | $75–$120  | —         |
| Shoes         | $20–$35 | $55–$90  | $100–$160 | $160–$280 |
| Bags          | —       | $50–$120 | $120–$220 | $220–$400 |

### 4.2 Takı Fiyat Aralıkları

| Kategori | Common  | Rare     | Premium   | Luxury    |
| -------- | ------- | -------- | --------- | --------- |
| Earrings | $10–$20 | $50–$80  | $100–$180 | $200–$400 |
| Necklace | $12–$25 | $60–$120 | $130–$250 | $250–$500 |
| Bracelet | $8–$15  | $40–$60  | $80–$150  | $150–$300 |
| Ring     | $15–$30 | $60–$100 | $120–$250 | $250–$600 |

### 4.3 baseLooks × Quality

| Quality | Tek slot | 2-slot (dress/bodysuit/swimsuit) |
| ------- | -------- | -------------------------------- |
| Common  | 1–3      | 2–5                              |
| Rare    | 3–5      | 5–8                              |
| Premium | 5–8      | 7–10                             |
| Luxury  | 7–10     | 9–12                             |

---

## BÖLÜM 5 — TAM ENVANTER TABLOSU

### 5.1 Mağaza × Slot Matrisi

| Mağaza           | Tops    | Bot     | Dress  | Coat   | Bra    | Panty  | Sleep  | Socks  | Body   | Garter | Bags   | Jewelry | Shoes  | BikTop | BikBot | Swim   | **TOP** |
| ---------------- | ------- | ------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- | ------ | ------ | ------ | ------ | ------- |
| Northline        | 34      | 41      | 15     | 7      | 10     | 13     | 7      | 6      | 4      | —      | —      | —       | —      | 2      | 2      | 2      | **143** |
| VERA Mode        | 29      | 27      | 20     | 5      | —      | —      | 11     | —      | 4      | —      | —      | —       | —      | —      | —      | —      | **96**  |
| Fifth Avenue     | 19      | 23      | 9      | 5      | —      | —      | 4      | —      | —      | —      | —      | —       | —      | —      | —      | —      | **60**  |
| FastBreak        | 11      | 15      | —      | 5      | 7      | —      | —      | 5      | —      | —      | —      | —       | 18     | —      | —      | —      | **61**  |
| **Aqua Lane**    | —       | —       | —      | —      | —      | —      | —      | —      | —      | —      | —      | —       | —      | 14     | 14     | 10     | **38**  |
| Silk & Lace      | —       | —       | —      | —      | 19     | 16     | 6      | 11     | —      | —      | —      | —       | —      | —      | —      | —      | **52**  |
| Intimate Secrets | —       | —       | —      | —      | 15     | 11     | 5      | 6      | 18     | 12     | —      | —       | —      | —      | —      | —      | **67**  |
| Luxe Leather     | —       | —       | —      | —      | —      | —      | —      | —      | —      | —      | 35     | —       | —      | —      | —      | —      | **35**  |
| Diamond Dreams   | —       | —       | —      | —      | —      | —      | —      | —      | —      | —      | —      | 45      | —      | —      | —      | —      | **45**  |
| StepUp           | —       | —       | —      | —      | —      | —      | —      | —      | —      | —      | —      | —       | 28     | —      | —      | —      | **28**  |
| Stiletto         | —       | —       | —      | —      | —      | —      | —      | —      | —      | —      | —      | —       | 24     | —      | —      | —      | **24**  |
| Maison Élise     | 8       | 7       | 6      | 4      | —      | —      | —      | —      | —      | —      | —      | —       | 5      | —      | —      | —      | **30**  |
| Aurum Couture    | 7       | 6       | 8      | 4      | —      | —      | —      | —      | —      | —      | —      | —       | 5      | —      | —      | —      | **30**  |
| Bellucci Milano  | 7       | 6       | 7      | 3      | —      | —      | —      | —      | —      | —      | —      | —       | 4      | —      | —      | —      | **27**  |
| **TOPLAM**       | **115** | **125** | **65** | **33** | **51** | **40** | **33** | **28** | **26** | **12** | **35** | **45**  | **84** | **16** | **16** | **12** | **736** |

### 5.2 Mağaza × Tier Dağılımı

| Mağaza           | T0     | T1      | T2      | T3      | T4      | T5     | **TOP** |
| ---------------- | ------ | ------- | ------- | ------- | ------- | ------ | ------- |
| Northline        | 25     | 46      | 46      | 22      | 4       | —      | **143** |
| VERA Mode        | —      | 12      | 30      | 37      | 17      | —      | **96**  |
| Fifth Avenue     | —      | —       | 12      | 30      | 18      | —      | **60**  |
| FastBreak        | 10     | 25      | 20      | 6       | —       | —      | **61**  |
| **Aqua Lane**    | —      | 8       | 14      | 13      | 3       | —      | **38**  |
| Silk & Lace      | —      | 12      | 28      | 28      | 12      | —      | **80**  |
| Intimate Secrets | —      | —       | —       | 25      | 38      | 27     | **90**  |
| Luxe Leather     | —      | 6       | 14      | 11      | 4       | —      | **35**  |
| Diamond Dreams   | —      | 10      | 18      | 13      | 4       | —      | **45**  |
| StepUp           | 8      | 12      | 8       | —       | —       | —      | **28**  |
| Stiletto         | —      | —       | 6       | 10      | 6       | 2      | **24**  |
| Maison Élise     | —      | —       | —       | 5       | 16      | 9      | **30**  |
| Aurum Couture    | —      | —       | —       | 6       | 16      | 8      | **30**  |
| Bellucci Milano  | —      | —       | —       | 6       | 14      | 7      | **27**  |
| **TİER TOP**     | **43** | **131** | **196** | **212** | **156** | **53** | **787** |

---

## BÖLÜM 6 — TİER + GATING SİSTEMİ

### 6.1 Tier Tanımları

```
tierScore = exposureLevel × 0.7 + sexinessScore × 0.3

T0 → exposure=0, sexiness=0   Sıfır ten. Kısa veya uzun kol OK. Diz altı. Göbek kapalı. Dekolte yok.
T1 → tierScore 0.1–2.0        Minimal ten. Boyun, bilek. Bacak kapalı, göbek kapalı.
T2 → tierScore 2.1–4.0        Hafif şekil. Diz hizası, dar pantolon, vücut hattı.
T3 → tierScore 4.1–6.0        Diz üstü, hafif dekolte, omuz, ince bel.
T4 → tierScore 6.1–8.0        Bacak, crop, mini, açık sırt, belirgin şekil.
T5 → tierScore 8.1–10.0       Maximum ten. Derin dekolte, sheer, barely-there, backless.
```

### 6.2 Gating Tablosu

| Tier | reqConfidence | reqExhibitionism | reqCorruption (formül) | reqCorruption (override)               |
| ---- | ------------- | ---------------- | ---------------------- | -------------------------------------- |
| T0   | 0             | 0                | 0                      | 0                                      |
| T1   | ~5–20         | 0                | 0                      | 0                                      |
| T2   | ~15–35        | 0–6              | 0                      | 0                                      |
| T3   | ~30–50        | 6–18             | 0                      | S&L: **2** · IS: **4**                 |
| T4   | ~50–68        | 18–30            | 4 (exp 7–8)            | S&L: **4** · IS: **6** · StilT5: **4** |
| T5   | ~65–78        | 24–42            | 6 (exp 9–10)           | IS: **8** · Boutique T5: formüle göre  |

**Override alan mağaza/tier kombinasyonları:**

- `storeLingerieA` T3 → `reqCorruption: 2`
- `storeLingerieA` T4 → `reqCorruption: 4`
- `storeLingerieB` T3 → `reqCorruption: 4`
- `storeLingerieB` T4 → `reqCorruption: 6`
- `storeLingerieB` T5 → `reqCorruption: 8`
- `storeShoeB` T5 (12cm+) → `reqCorruption: 4`

Override yoksa formülü kullan. Override varsa item JSON'a `reqCorruption` field ekle.

---

## BÖLÜM 7 — TAG SİSTEMİ (ZORUNLU)

### 7.1 Geçerli Style Tag Listesi

Oyun motoru **sadece bu tag'leri tanır** (`getOutfitStyleSummary` + `checkOutfitStyle`):

```
casual · sporty · business · professional · formal · elegant ·
cute · sexy · revealing · daring · erotic · lewd · slutty · bimbo
```

**Bu liste dışında hiçbir style tag üretme.** `romantic`, `feminine`, `sensual`, `bold`, `athletic`, `trend`, `tailored` gibi tag'ler sistemde işlenmez.

### 7.2 Flavor Tag'leri (style değil, sadece filtre/bilgi)

Bunlar `checkOutfitStyle`'da işlenmez ama item'ın özelliklerini tanımlar:

```
heels · bikini · swimsuit · lingerie · sleepwear · athletic ·
lace · satin · sheer · strappy · minimal · classic · date · work
```

### 7.3 Tier × Primary Style Tag Mapping

| Tier | Primary style tag                       | Örnekler                                      |
| ---- | --------------------------------------- | --------------------------------------------- |
| T0   | `casual`                                | Uzun kol tee, regular jeans, basic coat       |
| T1   | `casual`                                | Basic tops, regular pants, sneakers           |
| T2   | `casual` · `cute`                       | Mild shape, diz hizası, light styling         |
| T3   | `cute` · `elegant` · `sexy`             | Diz üstü, hafif dekolte, omuz (mağazaya göre) |
| T4   | `sexy` · `revealing` · `daring`         | Bacak, crop, mini, açık sırt                  |
| T5   | `daring` · `erotic` · `lewd` · `slutty` | Maximum ten, barely-there                     |

### 7.4 Mağaza → Style Tag Matrisi

| Mağaza           | T0       | T1       | T2                       | T3                       | T4                            | T5                 |
| ---------------- | -------- | -------- | ------------------------ | ------------------------ | ----------------------------- | ------------------ |
| Northline        | `casual` | `casual` | `casual`,`cute`          | `cute`                   | `cute`,`sexy`                 | —                  |
| FastBreak        | `sporty` | `sporty` | `sporty`                 | `sporty`                 | —                             | —                  |
| StepUp           | `casual` | `casual` | `casual`,`cute`          | —                        | —                             | —                  |
| VERA Mode        | —        | `casual` | `casual`,`cute`          | `cute`,`sexy`            | `sexy`,`revealing`            | —                  |
| Fifth Ave        | —        | —        | `elegant`,`professional` | `elegant`,`formal`       | `elegant`,`formal`            | —                  |
| Silk & Lace      | —        | `cute`   | `cute`,`sexy`            | `sexy`                   | `revealing`                   | —                  |
| Intimate Secrets | —        | —        | —                        | `sexy`,`daring`          | `revealing`,`daring`,`erotic` | `lewd`,`slutty`    |
| Luxe Leather     | —        | `casual` | `casual`,`professional`  | `professional`,`elegant` | `elegant`                     | —                  |
| Diamond Dreams   | —        | `casual` | `casual`,`elegant`       | `elegant`                | `elegant`                     | —                  |
| Stiletto         | —        | —        | `cute`                   | `elegant`,`sexy`         | `sexy`,`daring`               | `daring`,`slutty`  |
| Boutiques        | —        | —        | —                        | `elegant`,`formal`       | `elegant`,`formal`            | `elegant`,`slutty` |

### 7.5 `slutty` Tag Kuralı

`slutty` sadece şu durumlarda kullanılır:

1. **Intimate Secrets T5** — barely-there, maximum revealing lingerie
2. **Stiletto Studio T5** — extreme heel (12cm+), platform stiletto
3. **Boutique T5** — "elegant ama provocative" parçalar (backless luxury gown, deep plunge couture dress, extreme cut-out)

**`bimbo` tag → storeAdult'a özel, bu dosyada kullanılmaz.**

---

## BÖLÜM 8 — KATEGORİ & MATERYAL HAVUZLARI

### Silhouette Havuzları

| Kategori      | Seçenekler                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tops          | fitted · oversized · cropped · draped · wrap · off-shoulder · cold-shoulder · boxy · longline · asymmetric · corset-style · tie-front                                          |
| Bottoms       | straight-leg · wide-leg · slim · A-line skirt · pencil skirt · mini skirt · midi skirt · flared · cargo · shorts-relaxed · shorts-fitted · tailored · pleated · paperbag-waist |
| Dress         | bodycon · wrap · A-line · midi-flared · maxi · slip · shirt-dress · mini · fit-and-flare · asymmetric-hem · corset-bodice · backless                                           |
| Coats         | trench · oversized-cocoon · belted · double-breasted · longline-minimalist · blazer-coat · faux-fur · wrap-coat · duster · puffer                                              |
| Shoes         | pump · stiletto · mule · strappy-sandal · ankle-strap · platform · wedge · chunky-sneaker · running · slide · flat · loafer · chelsea-boot · ankle-boot                        |
| Bags          | tote · mini-crossbody · clutch · shoulder-bag · bucket · hobo · structured-top-handle · belt-bag · saddle                                                                      |
| Jewellery     | delicate-chain · chunky-statement · stud · hoop · drop · cuff · tennis-chain · solitaire · signet · ear-cuff                                                                   |
| Bra           | balconette · plunge · bralette · push-up · bandeau · sports-bra                                                                                                                |
| Panty         | brief · bikini-cut · hipster · thong · high-waist · cheeky                                                                                                                     |
| Bodysuit      | scoop · deep-V · halter · long-sleeve · mesh-panel · lace-overlay                                                                                                              |
| Garter        | classic-6-strap · 4-strap · suspender-belt · garter-skirt                                                                                                                      |
| Sleepwear     | babydoll · chemise · satin-set · shorts-set · robe · nightgown · cami-set                                                                                                      |
| Socks         | ankle · crew · knee-high · thigh-high · fishnet · lace-top · no-show                                                                                                           |
| Bikini Top    | triangle · bandeau · underwire · halter · sporty-crop · tie-side · ruffled                                                                                                     |
| Bikini Bottom | brief · high-waist · cheeky · thong · tie-side · ruched                                                                                                                        |
| Swimsuit      | one-piece · cut-out · halter · strappy-back · plunge · high-neck                                                                                                               |

### Materyal Havuzları

| Kategori           | Materyaller                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Tops               | ribbed knit · linen · cotton jersey · chiffon · satin · velvet · mesh · broderie anglaise · bamboo · poplin · waffle knit |
| Bottoms            | denim · twill · cotton drill · linen-blend · satin · velvet · faux leather · jersey knit · ponte · crepe                  |
| Dress              | crepe · chiffon · satin · linen · cotton voile · velvet · jersey · mesh · broderie                                        |
| Coats              | wool-blend · cashmere-blend · faux-suede · technical-nylon · tweed · faux-fur · cotton-canvas · bouclé · faux leather     |
| Shoes              | faux leather · suede · patent faux leather · mesh · synthetic · canvas · metallic · croco-emboss                          |
| Bags               | pebbled faux leather · smooth vegan leather · suede · canvas · raffia · nylon · patent · woven straw · croco-emboss       |
| Jewellery          | sterling silver · gold vermeil · rose gold · brass · stainless steel · resin · enamel · crystal-set                       |
| Bra/Panty/Bodysuit | satin · lace · mesh · microfiber · cotton · stretch velvet · sheer nylon                                                  |
| Garter             | lace · satin · stretch velvet · mesh · PVC                                                                                |
| Sleepwear          | satin · chiffon · cotton · silk-blend · lace-trim · jersey                                                                |
| Socks              | cotton · nylon · lace · fishnet · spandex-blend · velvet                                                                  |
| Bikini/Swimsuit    | matte lycra · ribbed lycra · crinkle fabric · printed nylon · terry cloth · metallic lycra                                |

---

## BÖLÜM 9 — RENK ROTASYON SİSTEMİ

| #   | Aile           | Örnekler                                       |
| --- | -------------- | ---------------------------------------------- |
| 1   | Neutral-Light  | white, ivory, cream, off-white                 |
| 2   | Neutral-Dark   | black, charcoal, graphite, jet                 |
| 3   | Grey           | light grey, heather grey, slate, ash           |
| 4   | Navy/Deep Blue | navy, midnight blue, cobalt, royal blue        |
| 5   | Denim Blue     | light denim, dark wash, acid wash              |
| 6   | Red/Burgundy   | red, crimson, wine, burgundy, cherry           |
| 7   | Pink           | blush, dusty rose, hot pink, mauve, fuchsia    |
| 8   | Orange/Rust    | burnt orange, rust, terracotta, amber          |
| 9   | Yellow/Gold    | lemon, mustard, golden, canary                 |
| 10  | Green          | olive, sage, forest, emerald, mint             |
| 11  | Purple         | lavender, plum, violet, lilac                  |
| 12  | Brown/Camel    | camel, tan, khaki, chocolate, mocha, taupe     |
| 13  | Teal/Cyan      | teal, turquoise, aqua                          |
| 14  | Print/Multi    | floral, geometric, stripe, plaid, animal print |
| 15  | Metallic       | silver, gold, rose gold, bronze, iridescent    |
| 16  | Sheer/Tonal    | sheer black, sheer white, nude                 |

**KURAL: Aynı batch'te bir aileden max 2 item. 2/2 = KAPALI.**

**Tonal zorunluluğu:**

| ❌     | ✅                      |
| ------ | ----------------------- |
| white  | soft ivory white        |
| black  | deep matte black        |
| red    | rich crimson red        |
| pink   | dusty muted pink        |
| green  | deep forest green       |
| grey   | cool heather grey       |
| blue   | dark navy blue          |
| beige  | warm sandy beige        |
| orange | burnt terracotta orange |

---

## BÖLÜM 10 — ITEM SCHEMA

```json
{
  "id": "snake_case_benzersiz",
  "name": "Tonal Renkli Açıklayıcı İsim",
  "brand": "Mağaza Adı",
  "desc": "1–2 cümle. Materyal, kesim, desen/detay. Marka adı geçmez.",
  "image": "assets/content/clothing/{category}/{BrandFolder}/{RecordID}.webp",
  "store": "storeID",
  "slot": "top|bottom|dress|coat|shoes|bag|earrings|necklace|bracelet|ring|bra|panty|bodysuit|sleepwear|socks|garter",
  "silhouette": "...",
  "baseLooks": 0,
  "price": 0,
  "quality": "Common|Rare|Premium|Luxury",
  "warmth": 0,
  "sexinessScore": 0,
  "exposureLevel": 0,
  "durability": 100,
  "reqCorruption": 0,
  "reqHeelsSkill": 0,
  "matchSet": null,
  "tags": ["style_tag_from_list", "flavor_tag"],
  "npcAppeal": {},
  "shopAvailable": true,
  "startOwned": false,
  "imagePrompt": "..."
}
```

### 10.1 Field Kuralları

**`reqCorruption`** — her item'da bulunur, default `0`.
Override listesi için Bölüm 6.2'ye bak. Override varsa o değeri yaz, yoksa `0`.

**`reqHeelsSkill`** — sadece `slot: "shoes"` olan itemlarda anlamlıdır.
Diğer tüm slotlarda `0` yaz.

| Topuk yüksekliği   | reqHeelsSkill |
| ------------------ | ------------- |
| Topuksuz / flat    | 0             |
| ~5cm (kitten, low) | 1             |
| ~8cm (mid heel)    | 2             |
| ~10cm (high heel)  | 3             |
| 12cm+ (extreme)    | 4             |

**`matchSet`** — lingerie ve bikini setlerinde parçaları birbirine bağlar.
Aynı setten üretilen bra + panty + garter + socks aynı `matchSet` string'ini paylaşır.
Set üyesi olmayan itemlarda `null` yaz.

Kural: Bir seti oluşturan itemlar aynı batch'te birlikte üretilmeli — ayrı batch'lerde parçalar kaybolur.

**`matchSet` naming:** `{mağazaKısa}{SetRenk}{SetDetay}Set`
Örnekler: `"silkBlushRibbonSet"` · `"intimateSnakeMeshSet"` · `"fastBreakNavyMeshSet"` · `"silkCoralFloralSet"`

### 10.2 Diğer Notlar

- `image` RecordID = JSON key camelCase (örn. `topBrettonStripeNavy`) — snake_case id değil
- `tags`: style tag Bölüm 7.1 listesinden + flavor tag Bölüm 7.2'den
- reqConfidence **78 üstü üretme** — widget runtime'da hesaplar, schema'da yok
- Bikini: `bikini` flavor tag zorunlu + slot = bra veya panty
- Swimsuit: `swimsuit` flavor tag zorunlu + slot = bodysuit
- **`imagePrompt` JSON'a yazılmaz** — ayrı Görsel Üretim Bloğuna gider (§10.3)

---

### 10.3 Çıktı Formatı (ZORUNLU)

Her item şu yapıda verilir — JSON, Görünüm ve Prompt **birlikte, item başına**:

```
── Item [No] ─────────────────────────────────────────────────
{
  "kayıtID": {
    "id": "...",
    "name": "...",
    "brand": "...",
    "desc": "...",
    "image": "assets/content/clothing/[slot]/[Brand]/[kayıtID].webp",
    "store": "...",
    "slot": "...",
    "silhouette": "...",
    "baseLooks": 0,
    "price": 0,
    "quality": "...",
    "warmth": 0,
    "sexinessScore": 0,
    "exposureLevel": 0,
    "durability": 100,
    "reqCorruption": 0,
    "reqHeelsSkill": 0,
    "matchSet": null,
    "tags": [],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false
  }
}

** Item [No] ** :
** KayıtID ** : kayıtID
** Görünüm ** : [Türkçe, 2–3 cümle. Renk + materyal + silhouette + öne çıkan detay.
            Eşleşen kıyafet varsa son cümlede belirt.]
** Prompt **   :
1:1. Headless anonymous model, [...]
──────────────────────────────────────────────────────────────
```

**Görünüm Kuralları:**

- **Türkçe** yazılır
- 2–3 cümle maksimum
- Renk + materyal + silhouette + öne çıkan detay sırası
- Pairing varsa son cümlede belirt
- Teknik jargon değil, sade ve anlaşılır

**Örnek (tam format):**

```
── Item 1 ─────────────────────────────────────────────────────
{
  "garterSilkRoseSatin4Strap": {
    "id": "garter_silk_rose_satin_4_strap",
    "name": "Dusty Rose Satin 4-Strap Garter Belt",
    "brand": "Silk & Lace",
    "desc": "Dusty rose satin 4-strap garter belt with scalloped lace waistband trim, center-front bow, and gold-tone suspender clips.",
    "image": "assets/content/clothing/garter/SilkAndLace/garterSilkRoseSatin4Strap.webp",
    "store": "storeLingerieA",
    "slot": "garter",
    "silhouette": "classic-4-strap",
    "baseLooks": 4,
    "price": 42,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 6,
    "exposureLevel": 6,
    "durability": 100,
    "reqCorruption": 3,
    "reqHeelsSkill": 0,
    "matchSet": "silkRoseDustySet",
    "tags": ["sexy", "lingerie", "lace"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false
  }
}

** Item 1 ** :
** KayıtID ** : garterSilkRoseSatin4Strap
** Görünüm ** : Pudra pembesi saten jartiyer kemeri. Tarak desenli dantel bel
                bandı, ortada küçük saten fiyonk ve dört altın rengi çorap askısı.
                Askılar boşta sarkıyor, çorap takılı değil.
** Prompt **   :
1:1. Headless anonymous model, absolutely no face, no head, no hair visible.
Framed from waist to thighs, garter belt with simple thong only, no stockings
attached, suspender straps hanging free. A young fit woman with full hips wearing
a dusty rose satin 4-strap garter belt with scalloped lace waistband trim and
center-front satin bow, gold-tone suspender clips hanging free, wearing a simple
dusty rose thong underneath. Front three-quarter view, weight on one leg, slight
hip tilt. Professional catalog lighting, neutral diffuse white light, flat solid
pure white background only. Sharp focus on the lace waistband and suspender clip
detail. Romantic. Consistent natural skin tone, no yellow tint. Photorealistic,
high resolution. No face, no head, no hair visible in the frame.
───────────────────────────────────────────────────────────────
```

### 10.4 "DB'ye Geç" Komutu

Kullanıcı `DB'ye geç` dediğinde agent şunu yapar:

```
1. Üretilen tüm item'ların JSON'larını toplar
2. Her JSON'u ilgili store dosyasına ekler:
   → Slot'a göre: sugarcube_passages/Wardrobe/[store].twee
   → Format: <<set $clothing.kayıtID = { ... }>>
3. Kaydedilen item sayısını raporlar:
   "✅ X item DB'ye eklendi → [store].twee"
```

> `imagePrompt` **DB'ye yazılmaz** — sadece Görsel Üretim (Grok) için kullanılır.

---

## BÖLÜM 11 — GÖRSEL PROMPT PIPELINE

**12 adım — sırayla — tek paragraf.**

> **ÖNEMLİ:** AI görsel motoru promptın **ilk cümlelerine** öncelik verir. Bu yüzden "no face" ve framing talimatı **2. sırada** yer alır.

```
1.  Aspect ratio
2.  Framing + No-face talimatı (ZORUNLU İLK SIRADA)
3.  Body description
4.  Wearing: tonal renk + materyal + silhouette + DESEN/DETAY (zorunlu)
5.  Openness phrase (exposure ≥ 5 ise zorunlu)
6.  Pairing
7.  Pose
8.  Lighting + Background (sabit)
9.  Focus
10. Mood token
11. Skin tone (sabit)
12. Kapanış (sabit)
```

### 11.1 Aspect Ratio

| Kategori                                                                                                                                                                  | Ratio |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Tüm kategoriler (Tops · Bottoms · Dress · Coats · Shoes · Bags · Jewellery · Bra · Panty · Bodysuit · Garter · Sleepwear · Socks · Bikini Top · Bikini Bottom · Swimsuit) | 1:1   |

> ⚠️ **Promptun başında her zaman `1:1.` yaz.** Ayrıca Grok UI'da da **Square (1:1)** seç — ikisi birlikte olmazsa letterbox / siyah kenar çıkabilir.

### 11.2 Body Description

| exposure + sexiness ort. | Body                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ≤ 3                      | `A young fit woman`                                                                                                                                                                                                                                          |
| 4–6                      | Tops/Coats/Bra/BikiniTop → `A young fit woman with a perky bust` · Bottoms/Panty/BikiniBottom/Garter → `A young fit woman with full hips and a rounded butt` · Dress/Bodysuit/Swimsuit/Sleepwear → `A young fit woman with a slim waist and feminine curves` |
| ≥ 7                      | Yukarıdaki slot bazlı, güçlü ifadeyle                                                                                                                                                                                                                        |

> ❌ "voluptuous" yasak. Bags/Jewellery → her zaman neutral.

### 11.3 Wearing — Detay Zorunlu

| Tür        | Ekleme                                                   |
| ---------- | -------------------------------------------------------- |
| Print      | "with [floral/stripe/geometric/animal] print throughout" |
| Grafik     | "featuring graphic [slogan/print] on the front"          |
| Texture    | "with visible [ribbed/waffle/broderie] texture"          |
| Kesim      | "with [asymmetric/wrap/tie-front/cut-out] detail"        |
| Hardware   | "with [gold/silver] [chain/ring/buckle] detail"          |
| Renk combo | "in color-block [renk1] and [renk2]"                     |

### 11.4 Openness Phrases

| exposureLevel | Ekle                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| 1–2           | (hiçbir şey)                                                                    |
| 3–4           | subtle silhouette definition                                                    |
| 5–6           | waist visible · light silhouette emphasis                                       |
| 7–8           | showing cleavage / exposing lower back / high-cut leg                           |
| 9–10          | deep V showing cleavage · backless · sheer panel · very high-cut · bare midriff |

### 11.5 Mood Token

| sexinessScore | Mood                             |
| ------------- | -------------------------------- |
| 1–3           | refined / casual / cozy / clean  |
| 4–6           | stylish / confident / polished   |
| 7–8           | sensual / alluring / bold        |
| 9–10          | provocative / daring / seductive |

### 11.6 Kategori Framing + Pairing

| Kategori                    | Pairing           | Frame                                                                                                                                                                      | Model üzerinde                                                                                           |
| --------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Tops**                    | **YOK**           | **Garment-only close-up: from just above neckline to just below item hem. NO legs, NO feet, NO shoes, NO lower-body clothing visible. Frame tightly around the top only.** | Sadece çekilen top. Alt kıyafet veya ayakkabı promptta asla belirtilmez. Alt vücut framede yok.          |
| **Bottoms (pants)**         | üst: pool-B       | **waist to feet including shoes, entire bottom fully visible**                                                                                                             | Çekilen bottom + pool-B üstlük + düz ayakkabı. Paça/hem kesilmez.                                        |
| **Bottoms (shorts/skirts)** | üst: pool-B       | **waist to below hem, entire bottom fully visible, no cropping**                                                                                                           | Çekilen bottom + pool-B üstlük. Etek/şort hem'i tamamen framede.                                         |
| **Dress**                   | yok               | **neck to feet, entire dress + shoes visible, no cropping**                                                                                                                | Sadece çekilen dress + uygun ayakkabı. Alt/üst yok.                                                      |
| **Coats**                   | pool-C            | **neck to hem, full coat visible, no cropping**                                                                                                                            | Çekilen coat + pool-C altlık+üstlük. Mantonun en alt noktası tamamen framede.                            |
| **Shoes**                   | dark fitted jeans | **floor to mid-calf, entire shoe fully visible, no cropping**                                                                                                              | Çekilen ayakkabı + koyu fitted jeans. Ayakkabının tüm detayları net.                                     |
| **Bags**                    | pool-C            | **bag prominently centered, entire bag fully visible**                                                                                                                     | Pool-C outfit + çekilen çanta, çanta elde veya omuzda. Çantanın tamamı kesim olmadan görünür.            |
| **Jewellery**               | close-up §11.9    | alan'a göre                                                                                                                                                                | Sadece ilgili vücut bölgesi + takı. Başka kıyafet minimal/yok.                                           |
| **Bra**                     | yok               | **waist to above shoulders, entire bra fully visible, no cropping**                                                                                                        | **Sadece çekilen bra.** Askı uçları dahil bütün bra görünür. Çıplak karın görünür.                       |
| **Panty**                   | yok               | **upper thigh to navel, entire panty fully visible, no cropping**                                                                                                          | **Sadece çekilen panty.** Bel bandı üstü ve bacak kesim noktaları tamamen framede. Çıplak karın görünür. |
| **Bodysuit**                | yok               | **neck to feet, full bodysuit visible, no cropping**                                                                                                                       | **Sadece çekilen bodysuit.** Tüm vücut boyunca bodysuit görünür, kesim yok.                              |
| **Garter**                  | yok               | **waist to mid-thigh, entire garter fully visible, straps hanging free**                                                                                                   | **Çekilen garter + basit thong/bikini-cut panty.** Tüm askılar ve bel bandı kesim olmadan görünür.       |
| **Sleepwear**               | yok               | **neck to feet, full sleepwear visible, no cropping**                                                                                                                      | **Sadece çekilen sleepwear.** En alt hem'e kadar kesim olmadan görünür.                                  |
| **Socks**                   | bare leg          | **floor to above sock topband, entire sock fully visible, no shoes**                                                                                                       | **Sadece çekilen çorap + çıplak bacak.** Çorabın üst bandı tamamen framede. Ayakkabı yok.                |
| **Bikini Top**              | yok               | **upper torso to above waist, entire bikini top fully visible, no cropping**                                                                                               | **Sadece çekilen bikini top.** Tüm cups, straps ve tie-ends tam görünür.                                 |
| **Bikini Bottom**           | yok               | **upper thigh to navel, entire bikini bottom fully visible, no cropping**                                                                                                  | **Sadece çekilen bikini bottom.** Bel bandı ve bacak kesim noktaları tamamen framede.                    |
| **Swimsuit**                | yok               | **neck to feet, full swimsuit visible, no cropping**                                                                                                                       | **Sadece çekilen swimsuit.** Başka kıyafet yok, tamamı görünür.                                          |

**Pool-A:** dark fitted jeans · charcoal wide-leg trousers · high-waist black pants · straight-leg navy trousers · slim indigo jeans · pleated midi skirt · black culottes · cropped ankle jeans · olive cargo pants · cigarette pants

**Pool-B:** simple white fitted tee · grey fitted tee · black fitted tee · white blouse · striped Breton top · neutral fitted tank

**Pool-C:** white tee + dark jeans · grey tee + charcoal trousers · white blouse + navy trousers · black tee + slim black pants

### 11.7 Pose Havuzu (batch içinde tekrar etme)

```
front three-quarter view, weight on one leg, slight hip tilt          ← EN SIK — default
front three-quarter view, one knee slightly bent, dynamic stance
three-quarter view, weight on back leg, subtle body twist
three-quarter view, one knee bent, shoulders angled away from camera
rear three-quarter view, one hip pushed back, head tilted down        ← backless / garter / arka detay
rear three-quarter view, relaxed stance, slight lean to one side      ← arka detayı göster
relaxed standing, slight side angle, one foot toward camera
front view, one leg slightly bent, casual stance
catalog pose, feet shoulder-width apart, slight body angle
```

**ZORUNLU ORAN KURALI:**

- Her batch'te **minimum %60 three-quarter** poz (front three-quarter + rear three-quarter + three-quarter)
- Düz front view ve catalog pose toplamı **max %40**
- Backless / garter / derin sırt detaylı itemlarda rear three-quarter **zorunlu**
- Aynı poz aynı batch içinde tekrar edilemez

### 11.8 Sabit Bloklar

> **Seksilik Notu (T3+):** exposureLevel ≥ 5 olan itemlarda vücut diline `alluring, confident posture` eklenir. Tier ne kadar yüksekse poz o kadar sensual — T0–T2 clean/neutral, T3 confident, T4+ alluring/sensual.

**Lighting + Background:**

```
Pure solid white background only. Background is bright white #FFFFFF, not gray, not off-white, not cream. No backdrop edges, no paper roll, no studio equipment, no physical set elements visible. White floor blending into white background, no floor line visible. Zero shadows, zero vignette, zero color bleed. Balanced diffuse studio lighting.
```

**Skin Tone:**

```
Neutral evenly lit skin tone, fair-to-medium, no warm color cast, no tanning filter, no yellow tint, no orange undertones.
```

**Kapanış:**

```
Photorealistic, high resolution. No face, no head visible in the frame.
```

### 11.8b Standart Model Tanımı

Tüm promptlarda tek evrensel tanım:

```
A young slim fit woman with classic 90-60-90 hourglass proportions, slim waist, high perky C-cup bust, and full hips, wearing...
```

> `perky` → Grok'a yüksek/dik göğüs şeklini söyler, sarkıklık olmaz. `high perky C-cup` spesifik ve tutarlı sonuç verir.

### 11.8a Framing + No-Face Blok (Promptın İLK CÜMLESİNDEN SONRA gelir)

Bu blok aspect ratio’dan hemen sonra, body description’dan ÖNCE yazılır:

```
Model's eyes and face above the top of the frame, not visible in shot. Chin, lips, and neck may be visible at top of frame. {FRAME_RULE}.
```

**{FRAME_RULE} örnekleri:**

| Kategori        | Frame Rule                                                                                                                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bags            | `Square 1:1, full model and bag both visible, bag prominently centered and entirely in frame, model wearing simple white fitted tee and dark jeans, generous breathing room on all sides, no cropping`                                                                                 |
| Bikini Top      | `Square 1:1, full model width visible, ONLY bikini top in frame — from just below chin to just below bikini band (lower ribcage), no hips, no bikini bottom, no lower body, no cropping`                                                                                               |
| Bodysuit        | `Square 1:1, full model width including both arms visible, entire bodysuit from neck to upper thigh in frame, generous breathing room on all sides, no cropping`                                                                                                                       |
| Bottoms (pants) | `Square 1:1, full model width including both arms visible, entire bottom from waist to feet including shoes in frame, generous breathing room on all sides, no cropping at edges`                                                                                                      |
| Bottoms (skirt) | `Square 1:1, full model width including both arms visible, entire skirt from waist to hem in frame, generous breathing room on all sides, no cropping`                                                                                                                                 |
| Bra             | `Square 1:1, full model width visible, ONLY bra in frame — from just below chin to just below bra band (lower ribcage), no hips, no panty, no lower body, no cropping`                                                                                                                 |
| Coats           | `Square 1:1, full model width including both arms visible, entire coat from neck to hem in frame, generous breathing room on all sides, no cropping`                                                                                                                                   |
| Dress           | `Square 1:1, full model width including both arms fully visible, entire dress from neck to just below hem plus legs and feet visible, generous breathing room on all sides, slightly zoomed out so model occupies ~75% of frame height, no part of the dress or arms cropped at edges` |
| Sleepwear       | `Square 1:1, full model width including both arms visible, entire sleepwear from neck to hem in frame, generous breathing room on all sides, no cropping`                                                                                                                              |
| Swimsuit        | `Square 1:1, full model width including both arms visible, entire swimsuit from neck to feet in frame, generous breathing room on all sides, no cropping`                                                                                                                              |
| Tops            | `Square 1:1, full model width including both arms visible, entire garment from neck to just below item hem fully in frame, generous breathing room on all sides, no legs, no feet, no lower body, no cropping`                                                                         |

### 11.9 Jewellery Template

```
1:1. Close-up of {TAKIM} worn by a young fit woman; {ALAN} visible, professional jewelry photography, clean minimal. Soft even lighting, isolated on pure white background, sharp focus on the {type}. Photorealistic, high resolution. No face, no head visible.
```

| Slot     | Alan                 |
| -------- | -------------------- |
| necklace | neck and collarbones |
| earrings | ear and jaw          |
| bracelet | wrist and hand       |
| ring     | hand and fingers     |

### 11.10 Shoes Heel Geometry

```
5cm   → minimal heel lift, natural ankle angle
8cm   → moderate heel elevation, slight calf engagement
10cm  → clear heel extension, elongated leg line
12cm+ → strong heel elevation, defined arch posture
```

---

## BÖLÜM 12 — LİNGERİE SET KOMPOZİSYONLARI

### 12.1 Set Tipleri

Lingerie üretim komutu geldiğinde agent **item sayısı değil set sayısı** alır.
Her set kendi `matchSet` string'ini paylaşan parçalar olarak üretilir.

**Komut formatı:**

```
Creator ile LingerieSet yarat — [StoreID] — [SetTipi] — [SetAdedi]
```

| SetTipi | Parçalar                     | Item / set |
| ------- | ---------------------------- | ---------- |
| `duo`   | bra + panty                  | 2          |
| `trio`  | bra + panty + socks          | 3          |
| `full`  | bra + panty + socks + garter | 4          |

**Mağaza hedefleri:**

| Mağaza           | duo | trio | full | Toplam set | Toplam item       |
| ---------------- | --- | ---- | ---- | ---------- | ----------------- |
| Silk & Lace      | 7   | 4    | 6    | 17         | 14+12+24 = **50** |
| Intimate Secrets | 7   | 4    | 6    | 17         | 14+12+24 = **50** |

### 12.2 Set İçi Kurallar

**Zorunlu uyum:**

- Tüm parçalar aynı `matchSet` string'i
- Tüm parçalar aynı renk ailesi (tonal varyasyon OK, farklı aile HAYIR)
- Tüm parçalar aynı ana materyal tonu (satin set → hepsi satin · lace → hepsi lace · mesh → hepsi mesh)
- Tüm parçalar aynı tier
- Tüm parçalar aynı reqCorruption

**Socks kuralı:**

- Her zaman thigh-high veya lace-top — kısa çorap set'e girmez
- Materyal setle uyumlu: lace set → lace-top · satin set → satin-sheen · mesh set → fishnet

**Garter kuralı:**

- Setin ana detayını devam ettirir (lace → lace garter · strappy → harness garter)
- Tier bra ile aynı veya bir üstü

### 12.3 Üretim Sırası

1. Bra → ana parça, tonu/materyali/detayı belirler
2. Panty → aynı desen/materyal/renk, farklı silhouette
3. Socks → trio/full ise, materyal sete uyarla
4. Garter → full ise, strappy veya lace devam

Her parçanın `imagePrompt`'u bağımsız çekim. `desc`'te `"part of the [matchSet] set"` referansı verilir.

### 12.4 Batch Renk Dağılımı

17 set üretilirken renk rotasyon kuralı **set bazında** uygulanır:

- Her renk ailesinden max 2 set (item değil set)
- Duo → lighter tier ağırlıklı · Trio → orta · Full → heavier tier ağırlıklı

**`matchSet` naming:** `{mağazaKısa}{SetRenk}{AnaDetay}Set`
Örnekler: `"silkBlushRibbonSet"` · `"silkCoralFloralSet"` · `"intimateBlackMeshSet"` · `"intimateSnakeHarnessSet"`

---

## BÖLÜM 13 — KALİTE KONTROLÜ

| Kontrol                        | Pass koşulu                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Tonal renk                     | name + desc + prompt içinde                                                    |
| Renk ailesi cap                | batch'te aynı aileden max 2                                                    |
| Anti-duplicate                 | silhouette + colorFamily + material + cut — batch'te 2 item aynı 4'ü taşıyamaz |
| Mağaza variety                 | STORE IDENTITY variety rules uygulandı                                         |
| Solid oranı                    | batch'te max %40 plain solid                                                   |
| tierScore                      | mağaza tier bandı içinde                                                       |
| T0 kuralları                   | bacak kapalı · göbek kapalı · dekolte yok                                      |
| baseLooks                      | Bölüm 4.3'e uygun                                                              |
| Fiyat                          | Bölüm 3 mağaza + Bölüm 4.1'e uygun                                             |
| exposureLevel                  | mağaza max'ı aşmıyor                                                           |
| reqConfidence                  | **MAX 78** — schema'da yok, widget hesaplar                                    |
| reqCorruption                  | **her item'da var**, default 0 — override Bölüm 6.2                            |
| reqHeelsSkill                  | shoes'da topuk yüksekliğine göre 0–4 · diğer slotlarda 0                       |
| matchSet                       | set parçalarında aynı string · tekil itemlarda null                            |
| matchSet renk uyumu            | set içinde tüm parçalar aynı renk ailesi                                       |
| matchSet materyal uyumu        | set içinde tüm parçalar aynı ana materyal                                      |
| matchSet batch                 | setin tüm parçaları aynı batch'te                                              |
| LingerieSet komut              | duo=2item · trio=3item · full=4item / set                                      |
| Style tags                     | **sadece** Bölüm 7.1 listesinden                                               |
| `slutty` kullanımı             | sadece IS T5 · Stiletto T5 · Boutique T5                                       |
| `bimbo` kullanımı              | bu dosyada YOK                                                                 |
| Body description               | doğru slot + ortalama                                                          |
| Openness phrase                | exposure ≥ 5 ise var                                                           |
| Wearing detayı                 | print/texture/hardware/cut belirtilmiş                                         |
| Frame                          | §11.6 kategoriye özel                                                          |
| Pose                           | batch içinde tekrar yok                                                        |
| Pairing                        | batch içinde tekrar yok                                                        |
| Skin tone                      | mevcut                                                                         |
| Kapanış                        | son satır                                                                      |
| Bikini tag                     | flavor tag `bikini` zorunlu                                                    |
| Swimsuit tag                   | flavor tag `swimsuit` zorunlu                                                  |
| **Tier × Exposure dağılım**    | **§15.1 — T3 içinde exp 4/5/6 dengeli, T4 içinde 7/8 dengeli**                 |
| **baseLooks spread**           | **§15.1 — Aynı Quality bandında aynı baseLooks tekrar yok**                    |
| **Silhouette kotası**          | **§15.2 — 10+ batch içinde kategori bazlı silhouette yüzde limitleri**         |
| **Pattern diversity**          | **§15.3 — %40 solid / %20 textured / %20 print / %20 structural**              |
| **Global renk dağılımı**       | **§15.4 — %30 neutral / %30 pop / %20 earthy / %20 mixed**                     |
| **Heels yükseklik dağılımı**   | **§15.5 — 5cm:%30 · 8cm:%40 · 10cm:%20 · 12cm+:%10**                           |
| **MatchSet üretim stratejisi** | **§15.6 — %40 duo / %30 trio / %30 full · yarım set yasak**                    |
| **Anti-duplicate eşik**        | **§15.7 — 4 özellikten 3'ü aynı → ENGEL**                                      |
| **Luxury density**             | **§15.8 — Luxury max %8 global · Premium max %20**                             |
| **Batch ölçek rehberi**        | **§15.9 — Batch boyutuna göre önerilen tier/renk/silhouette dağılımı**         |

---

## BÖLÜM 14 — ÖRNEK ÇIKTILAR

### Örnek 1 — Northline Apparel, Tops, T1

```json
{
  "topBrettonStripeNavyWhite": {
    "id": "top_bretton_stripe_navy_white",
    "name": "Navy & White Breton Stripe Fitted Tee",
    "brand": "Northline Apparel",
    "desc": "A classic navy blue and soft white horizontal Breton stripe fitted cotton jersey tee with a round neckline, short sleeves, and clean even stripe pattern throughout.",
    "image": "assets/content/clothing/tops/NorthlineApparel/topBrettonStripeNavyWhite.webp",
    "store": "storeClothingA",
    "slot": "top",
    "silhouette": "fitted",
    "baseLooks": 3,
    "price": 14,
    "quality": "Common",
    "warmth": 2,
    "sexinessScore": 1,
    "exposureLevel": 1,
    "durability": 100,
    "reqCorruption": 0,
    "reqHeelsSkill": 0,
    "matchSet": null,
    "tags": ["casual", "classic"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from neck to hips, entire top visible. A young fit woman wearing a navy blue and soft white horizontal Breton stripe fitted cotton jersey tee with short sleeves and round neckline, featuring classic even horizontal stripe pattern throughout, paired with dark fitted jeans. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the stripe pattern and fabric fit. Casual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

### Örnek 2 — Intimate Secrets, Bra, T4 (corruption override)

```json
{
  "braIntimateStrappyMeshEmerald": {
    "id": "bra_intimate_strappy_mesh_emerald",
    "name": "Deep Emerald Strappy Mesh Plunge Bra",
    "brand": "Intimate Secrets",
    "desc": "A deep jewel-toned emerald green sheer mesh plunge bra with adjustable strappy detail across the cups and gold O-ring hardware accents at the center.",
    "image": "assets/content/clothing/bra/IntimateSecrets/braIntimateStrappyMeshEmerald.webp",
    "store": "storeLingerieB",
    "slot": "bra",
    "silhouette": "plunge",
    "baseLooks": 5,
    "price": 68,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 7,
    "exposureLevel": 7,
    "durability": 100,
    "reqCorruption": 6,
    "reqHeelsSkill": 0,
    "matchSet": null,
    "tags": ["revealing", "daring", "lingerie", "strappy"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to neck, only bra visible, no other clothing. A young fit woman with a perky bust wearing a deep jewel-toned emerald green sheer mesh plunge bra with adjustable strappy detail across the cups and gold O-ring hardware accents, showing cleavage through the sheer mesh panel, with strappy back detail visible. Rear three-quarter view to show back strapping. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the strappy hardware and emerald mesh texture. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

### Örnek 3 — Boutique T5, Dress (slutty tag)

```json
{
  "dressAuBaccklessCouturePlum": {
    "id": "dress_au_backless_couture_plum",
    "name": "Deep Plum Backless Architectural Couture Gown",
    "brand": "Aurum Couture",
    "desc": "A deep plum structured crepe floor-length gown with an architectural sculptural shoulder, extreme open back from nape to waist, and a clean minimal front silhouette.",
    "image": "assets/content/clothing/dress/AurumCouture/dressAuBaccklessCouturePlum.webp",
    "store": "boutiqueB",
    "slot": "dress",
    "silhouette": "backless",
    "baseLooks": 10,
    "price": 480,
    "quality": "Luxury",
    "warmth": 1,
    "sexinessScore": 8,
    "exposureLevel": 8,
    "durability": 100,
    "reqCorruption": 4,
    "reqHeelsSkill": 0,
    "matchSet": null,
    "tags": ["elegant", "slutty", "formal", "date"],
    "npcAppeal": { "elite": 15, "professional": 8 },
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Full body visible from neck to feet, entire dress and shoes must be in frame, do not crop any part of the garment. A young fit woman with a slim waist and feminine curves wearing a deep plum structured crepe floor-length gown with architectural sculptural shoulder detail and extreme open back from nape to waist, exposing lower back entirely. Rear three-quarter view to show the backless construction and sculptural back silhouette. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the backless construction and crepe drape. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

### Örnek 4 — Silk & Lace, matchSet (bra + panty seti) + Stiletto ayakkabı (reqHeelsSkill)

**Bu örnekte:** Aynı setin iki parçası aynı `matchSet` değerini paylaşıyor. Ayrı üretilselerdi birbirini bulamazlardı.

```json
{
  "braSilkBlushRibbonBralette": {
    "id": "bra_silk_blush_ribbon_bralette",
    "name": "Dusty Blush Satin Ribbon-Tie Bralette",
    "brand": "Silk & Lace",
    "desc": "A soft dusty blush satin bralette with delicate ribbon-tie front detail, lace-trim band, and adjustable spaghetti straps.",
    "image": "assets/content/clothing/bra/SilkAndLace/braSilkBlushRibbonBralette.webp",
    "store": "storeLingerieA",
    "slot": "bra",
    "silhouette": "bralette",
    "baseLooks": 4,
    "price": 32,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 5,
    "exposureLevel": 5,
    "durability": 100,
    "reqCorruption": 2,
    "reqHeelsSkill": 0,
    "matchSet": "silkBlushRibbonSet",
    "tags": ["sexy", "lingerie", "lace"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to neck, only bra visible, no other clothing. A young fit woman with a perky bust wearing a soft dusty blush satin bralette with delicate ribbon-tie front detail and lace-trim band, bare midriff visible. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the ribbon-tie detail and satin sheen. Stylish. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  },

  "pantySilkBlushRibbonHighWaist": {
    "id": "panty_silk_blush_ribbon_high_waist",
    "name": "Dusty Blush Satin High-Waist Brief",
    "brand": "Silk & Lace",
    "desc": "Matching high-waist brief in soft dusty blush satin with a delicate lace waistband trim and a subtle ribbon detail at the center front.",
    "image": "assets/content/clothing/panty/SilkAndLace/pantySilkBlushRibbonHighWaist.webp",
    "store": "storeLingerieA",
    "slot": "panty",
    "silhouette": "high-waist",
    "baseLooks": 4,
    "price": 24,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 5,
    "exposureLevel": 5,
    "durability": 100,
    "reqCorruption": 2,
    "reqHeelsSkill": 0,
    "matchSet": "silkBlushRibbonSet",
    "tags": ["sexy", "lingerie", "lace"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to thighs, only panty visible, no other clothing. A young fit woman with full hips and a rounded butt wearing a soft dusty blush satin high-waist brief with delicate lace waistband trim and ribbon detail at center front, bare midriff visible. Catalog pose, feet shoulder-width apart. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the high-waist cut and lace waistband. Stylish. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

**Stiletto örneği — `reqHeelsSkill` kullanımı:**

```json
{
  "shoeStilLeoPrintAnkleStrap10cm": {
    "id": "shoe_stil_leo_print_ankle_strap_10cm",
    "name": "Leopard Print Ankle-Strap Stiletto (10cm)",
    "brand": "Stiletto Studio",
    "desc": "A bold leopard print faux suede ankle-strap stiletto with a 10cm heel, pointed toe, and a thin gold-buckle ankle closure.",
    "image": "assets/content/clothing/shoes/StilettoStudio/shoeStilLeoPrintAnkleStrap10cm.webp",
    "store": "storeShoeB",
    "slot": "shoes",
    "silhouette": "ankle-strap",
    "baseLooks": 6,
    "price": 98,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 6,
    "exposureLevel": 6,
    "durability": 100,
    "reqCorruption": 0,
    "reqHeelsSkill": 3,
    "matchSet": null,
    "tags": ["sexy", "heels", "date"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from floor to mid-calf, sharp focus on shoe. A young fit woman wearing a bold leopard print faux suede ankle-strap stiletto with pointed toe and thin gold-buckle ankle closure, 10cm heel, paired with dark fitted jeans. Angled stance, one foot slightly ahead. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the shoe design and leopard print pattern detail. Confident. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

### Örnek 5 — Intimate Secrets, LingerieSet full (bra + panty + socks + garter)

**Komut:** `Creator ile LingerieSet yarat — storeLingerieB — full — 1`
**Üretilen:** 4 item, hepsi `matchSet: "intimateBlackMeshSet"`, T4

```json
{
  "braIntimateBlackMeshStrappy": {
    "id": "bra_intimate_black_mesh_strappy",
    "name": "Deep Matte Black Strappy Mesh Balconette Bra",
    "brand": "Intimate Secrets",
    "desc": "Deep matte black sheer mesh balconette bra with adjustable strappy cage detail across the cups and matte O-ring hardware. Part of the intimateBlackMeshSet.",
    "image": "assets/content/clothing/bra/IntimateSecrets/braIntimateBlackMeshStrappy.webp",
    "store": "storeLingerieB",
    "slot": "bra",
    "silhouette": "balconette",
    "baseLooks": 5,
    "price": 72,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 7,
    "exposureLevel": 7,
    "durability": 100,
    "reqCorruption": 6,
    "reqHeelsSkill": 0,
    "matchSet": "intimateBlackMeshSet",
    "tags": ["revealing", "daring", "lingerie", "strappy"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to neck, only bra visible, no other clothing. A young fit woman with a perky bust wearing a deep matte black sheer mesh balconette bra with adjustable strappy cage detail across the cups and matte O-ring hardware accents, showing cleavage through the sheer mesh, bare midriff visible. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the strappy cage detail and mesh texture. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  },

  "pantyIntimateBlackMeshCheeky": {
    "id": "panty_intimate_black_mesh_cheeky",
    "name": "Deep Matte Black Mesh Cheeky Brief",
    "brand": "Intimate Secrets",
    "desc": "Matching deep matte black sheer mesh cheeky brief with thin elastic waistband and subtle O-ring side hardware detail. Part of the intimateBlackMeshSet.",
    "image": "assets/content/clothing/panty/IntimateSecrets/pantyIntimateBlackMeshCheeky.webp",
    "store": "storeLingerieB",
    "slot": "panty",
    "silhouette": "cheeky",
    "baseLooks": 5,
    "price": 48,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 7,
    "exposureLevel": 7,
    "durability": 100,
    "reqCorruption": 6,
    "reqHeelsSkill": 0,
    "matchSet": "intimateBlackMeshSet",
    "tags": ["revealing", "daring", "lingerie"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to thighs, only panty visible, no other clothing. A young fit woman with full hips and a rounded butt wearing a deep matte black sheer mesh cheeky brief with thin elastic waistband and O-ring side hardware detail, high-cut leg visible, bare midriff visible. Rear three-quarter view to show cheeky cut. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the mesh texture and cheeky silhouette. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  },

  "socksIntimateBlackFishnetThighHigh": {
    "id": "socks_intimate_black_fishnet_thigh_high",
    "name": "Deep Matte Black Fishnet Thigh-High Stockings",
    "brand": "Intimate Secrets",
    "desc": "Deep matte black fishnet thigh-high stockings with a wide elasticated lace top band, coordinating with the intimateBlackMeshSet.",
    "image": "assets/content/clothing/socks/IntimateSecrets/socksIntimateBlackFishnetThighHigh.webp",
    "store": "storeLingerieB",
    "slot": "socks",
    "silhouette": "thigh-high",
    "baseLooks": 4,
    "price": 28,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 6,
    "exposureLevel": 6,
    "durability": 100,
    "reqCorruption": 6,
    "reqHeelsSkill": 0,
    "matchSet": "intimateBlackMeshSet",
    "tags": ["revealing", "daring", "lingerie"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from floor to thighs, only stockings and bare legs visible, no shoes. A young fit woman with full hips wearing deep matte black fishnet thigh-high stockings with a wide elasticated lace top band, bare thigh visible above the lace band. Front three-quarter view, weight on one leg. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the fishnet texture and lace-top band. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  },

  "garterIntimateBlackMeshHarness": {
    "id": "garter_intimate_black_mesh_harness",
    "name": "Deep Matte Black Mesh Harness Garter Belt",
    "brand": "Intimate Secrets",
    "desc": "Deep matte black sheer mesh 6-strap garter belt with adjustable harness-style waistband, matte metal hardware, and six suspender clips with rubber tips. Part of the intimateBlackMeshSet.",
    "image": "assets/content/clothing/garter/IntimateSecrets/garterIntimateBlackMeshHarness.webp",
    "store": "storeLingerieB",
    "slot": "garter",
    "silhouette": "classic-6-strap",
    "baseLooks": 5,
    "price": 65,
    "quality": "Rare",
    "warmth": 0,
    "sexinessScore": 8,
    "exposureLevel": 8,
    "durability": 100,
    "reqCorruption": 6,
    "reqHeelsSkill": 0,
    "matchSet": "intimateBlackMeshSet",
    "tags": ["daring", "erotic", "lingerie", "strappy"],
    "npcAppeal": {},
    "shopAvailable": true,
    "startOwned": false,
    "imagePrompt": "1:1. Headless anonymous model, absolutely no face, no head, no hair visible. Framed from waist to thighs, garter belt with simple thong only, no stockings attached, suspender straps hanging free. A young fit woman with full hips wearing a deep matte black sheer mesh 6-strap harness garter belt with adjustable waistband and matte metal hardware, wearing a simple black thong underneath, suspender straps hanging free without stockings. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Sharp focus on the harness structure and strap arrangement. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. Photorealistic, high resolution. No face, no head, no hair visible in the frame."
  }
}
```

---

## BÖLÜM 15 — MAKRO ÜRETİM VE KOTA MATRİSİ (ZORUNLU KOLEKSİYON DENGESİ)

**DİKKAT:** Agent, üretim yaparken sadece tekil item kurallarını değil, aşağıdaki **batch ve koleksiyon dağılım kotalarını** da uygulamak zorundadır. Aksi belirtilmediği sürece her çoklu üretimde (batch) bu oranlar korunmalıdır.

---

### 15.1 Kategori İçi Tier & Exposure Dağılımı

Tier yığılmasını önlemek için bir kategori (örn. Tops) üretilirken tüm tier'lar mağazanın bandı içinde eşit veya piramit şeklinde dağıtılmalıdır.

**Exposure Bias Kontrolü (T3 ve T4 için):**

| Tier | Exposure havuzu | Kural                          |
| ---- | --------------- | ------------------------------ |
| T3   | 4, 5, 6         | Dengeli dağıt — hepsi 6 olamaz |
| T4   | 7, 8            | Dengeli dağıt — hepsi 8 olamaz |
| T5   | 9, 10           | Dengeli dağıt                  |

**Exposure Micro-Grid (Matematiksel Hedefler):**

T3 içinde 10 item üretiliyorsa exposure dağılımı:

| Exposure | T3 Oran | Açıklama                                          |
| -------- | ------- | ------------------------------------------------- |
| 4        | %30     | Conservative — kapalı ama form belirten           |
| 5        | %40     | Orta — hafif açıklık (kısa kol, V-yaka, diz üstü) |
| 6        | %30     | Açık — crop, deep-V, backless, sheer hint         |

T4 içinde 10 item üretiliyorsa:

| Exposure | T4 Oran | Açıklama                |
| -------- | ------- | ----------------------- |
| 7        | %60     | Revealing ama kontrollü |
| 8        | %40     | Daring — çok açık       |

T5 içinde:

| Exposure | T5 Oran | Açıklama          |
| -------- | ------- | ----------------- |
| 9        | %60     | Extreme revealing |
| 10       | %40     | Maximum exposure  |

**Kategori Bazlı Crop/Plunge/Mini Yoğunluğu:**

| Kategori         | T3 içinde max crop/mini oranı | T4 içinde max   |
| ---------------- | ----------------------------- | --------------- |
| Tops             | Max %40 cropped               | Max %50 cropped |
| Bottoms          | Max %30 mini                  | Max %50 mini    |
| Dress            | Max %30 mini dress            | Max %40 mini    |
| Bra              | Max %30 plunge                | Max %50 plunge  |
| Lingerie (genel) | Max %20 sheer                 | Max %40 sheer   |

**BaseLooks Spread:**
Aynı kalitedeki (Quality) itemlar aynı baseLooks değerini alamaz. Örneğin Rare (3–5) bandında 3 item üretiliyorsa, biri 3, biri 4, biri 5 olmalıdır.

---

### 15.2 Silhouette (Silüet) Kotaları (10+ Batch'ler için)

Yapay zekanın sürekli aynı kesimleri (bias) üretmesini engellemek için silüetler şu kotalara uymak zorundadır:

| Kategori    | Kota                                                                           |
| ----------- | ------------------------------------------------------------------------------ |
| **Tops**    | Max %30 cropped · Min %20 oversized/relaxed · Min %30 fitted/tailored          |
| **Bottoms** | Max %30 mini/short · Min %40 full-length (pants/jeans/maxi) · Max %20 wide-leg |
| **Dress**   | Max %30 bodycon · Min %20 A-line/fit-and-flare · Max %20 slip/strappy          |
| **Coats**   | Max %20 puffer · Min %40 structured (trench/blazer/tailored)                   |

> 10'dan az batch üretiminde kotalar hedef olarak uygulanır, zorunlu değildir.

---

### 15.3 Desen, Doku ve Detay Yoğunluğu (Pattern Diversity)

Bölüm 3'teki "%40 Solid kuralı"nın alt kırılımı şu şekilde uygulanmalıdır:

| Dilim             | Oran | Açıklama                                                                           |
| ----------------- | ---- | ---------------------------------------------------------------------------------- |
| Solid (Düz Renk)  | %40  | Temel basic parçalar                                                               |
| Textured Solid    | %20  | Düz renk ama belirgin doku (ribbed, waffle, cable knit, broderie, embossed)        |
| Print/Pattern     | %20  | Floral, animal print, stripe, plaid, geometric                                     |
| Structural Detail | %20  | Renk/desen değil, kesim detayı (asymmetric, cut-out, hardware, contrast stitching) |

---

### 15.4 Global Renk Dağılım Matrisi

Bölüm 9’daki “Aileden max 2” kuralı **batch-level** kontrol sağlar. Bu bölüm ise **koleksiyon geneli** (tüm batch’lar üst üste) zorunlu renk dengesini tanımlar.

**Batch İçi Hedefler (10+ item batch):**

| Dilim          | Oran | Aileler                                               |
| -------------- | ---- | ----------------------------------------------------- |
| Neutral Core   | %30  | Siyah, beyaz, gri, navy, camel                        |
| Pop/Seasonal   | %30  | Kırmızı, pembe, sarı, yeşil, mor, turuncu vs.         |
| Tonal/Earthy   | %20  | Rust, olive, taupe, mocha, dusty rose                 |
| Mixed/Metallic | %20  | İkili renkler (color-block), baskılar veya metalikler |

**Global Koleksiyon Renk Limitleri (tüm batch’lar kümülatif):**

Bir mağazanın toplam envanterinde tek bir renk ailesinin max payı:

| Renk Ailesi  | Max Global Oran | Örnek (137 itemlık Northline için) |
| ------------ | --------------- | ---------------------------------- |
| Siyah/Dark   | **max %18**     | max ~25 item                       |
| Beyaz/Cream  | **max %12**     | max ~16 item                       |
| Navy/Blue    | **max %12**     | max ~16 item                       |
| Red/Burgundy | **max %10**     | max ~14 item                       |
| Pink/Blush   | **max %10**     | max ~14 item                       |
| Green        | **max %8**      | max ~11 item                       |
| Diğer tekil  | **max %6**      | max ~8 item                        |

> Agent §16.4 kümülatif tarama yaparken bu limitleri kontrol eder. Limit aşılmışsa o renk ailesinden yeni item üretilmez.

**Renk Dengesi Formulü:**

```
Renk skew = max_renk_orani - min_renk_orani
Skew > %12 → UYARI — eksik renk ailesine yönel
Skew > %20 → ENGEL — fazla olan aileden üretme
```

---

### 15.5 Heels (Ayakkabı) Yükseklik Dağılımı

`storeShoeA`, `storeShoeB` ve `FastBreak` gibi mağazalar için `reqHeelsSkill` dengesi:

- T0–T2 (Sneakers/Flats): Her zaman `reqHeelsSkill: 0`
- Topuklu ayakkabı üretimli (Stiletto vb.) bir batch içinde zorunlu dağılım:

| Yükseklik        | Oran | reqHeelsSkill | Tier kısıtı  |
| ---------------- | ---- | ------------- | ------------ |
| 5cm (Low/Kitten) | %30  | 1             | T2+          |
| 8cm (Mid)        | %40  | 2             | T2+          |
| 10cm (High)      | %20  | 3             | T3+          |
| 12cm+ (Extreme)  | %10  | 4             | Sadece T4/T5 |

---

### 15.6 MatchSet (Lingerie/Bikini) Üretim Stratejisi

Setler mağaza hedeflerine göre üretilirken, rastgele değil şu dağılımda üretilir:

| Set Tipi | Oran | Parça / set                      |
| -------- | ---- | -------------------------------- |
| Duo      | %40  | 2 (bra + panty)                  |
| Trio     | %30  | 3 (bra + panty + socks)          |
| Full     | %30  | 4 (bra + panty + socks + garter) |

**Kesin kurallar:**

- Bir setin tüm parçaları **kesinlikle aynı batch içinde** üretilmeli ve tek bir JSON yanıtında verilmelidir.
- Yarım set bırakılamaz.
- Batch item sayısı hesabında set parçaları ayrı ayrı sayılır (1 full set = 4 item).

---

### 15.7 Anti-Duplicate Benzerlik Eşiği

Bölüm 13'teki `silhouette + colorFamily + material + cut` dörtlüsünün detaylandırılmış versiyonu:

| Durum    | Sonuç                               |
| -------- | ----------------------------------- |
| 4/4 aynı | ❌ KESİN ENGEL — üretilmez          |
| 3/4 aynı | ❌ ENGEL — farklılaştır veya üretme |
| 2/4 aynı | ✅ Kabul — normal çeşitlilik        |
| 1/4 aynı | ✅ Kabul                            |

**Örnekler:**

- `fitted + black + satin + round-neck` = A item → `fitted + black + satin + V-neck` = **3/4 → ENGEL**
- `fitted + black + satin + round-neck` = A item → `oversized + black + satin + round-neck` = **3/4 → ENGEL**
- `fitted + black + satin + round-neck` = A item → `oversized + red + satin + round-neck` = **2/4 → OK**

Bu kural **batch içinde** geçerlidir. Farklı batch'ler birbirinden bağımsızdır.

---

### 15.8 Luxury Density Kontrolü

Bir mağazanın toplam envanterinde quality dağılımı dengesiz olmamalıdır.

**Global Sabit Oranlar (ÇOKLU MAĞAZA DİKKAT):**

| Quality | Tüm koleksiyon hedefi (743 item) | Yaklaşık adet |
| ------- | -------------------------------- | ------------- |
| Common  | %25–30                           | ~190–225      |
| Rare    | %40–45                           | ~300–335      |
| Premium | %18–22                           | ~135–165      |
| Luxury  | %5–8                             | ~37–60        |

**Segment Bazlı Kesin Limitler:**

| Mağaza segment                               | Common | Rare   | Premium | Luxury                    |
| -------------------------------------------- | ------ | ------ | ------- | ------------------------- |
| **Budget** (Northline, StepUp, FastBreak)    | %50–60 | %30–40 | %5–10   | **%0** (Luxury üretilmez) |
| **Mid** (VERA, Stiletto, S&L, Luxe, Diamond) | %15–25 | %45–55 | %15–25  | **max %5**                |
| **Premium** (Fifth Ave, Intimate Secrets)    | %0–10  | %30–40 | %35–45  | **max %15**               |
| **Luxury** (Boutique A/B/C)                  | **%0** | %0–10  | %50–60  | **%30–40**                |

> Agent §16.4 kümülatif taramada `_meta.qualityBreakdown` toplanarak kontrol edilir. Segment limiti aşılıyorsa o quality’den üretilmez.

**Luxury Yoğunluk Formülü:**

```
Luxury ratio = toplam_luxury / toplam_item
Ratio > %8 (global) → ENGEL — Luxury üretme
Ratio > segment_max → ENGEL — o mağazada Luxury üretme
```

---

### 15.9 Batch Ölçek Rehberi

Farklı batch büyüklüklerine göre önerilen minimum çeşitlilik hedefleri:

| Batch Size | Min Tier çeşidi        | Min Renk ailesi | Min Silhouette çeşidi      | Pattern diversity     |
| ---------- | ---------------------- | --------------- | -------------------------- | --------------------- |
| 3–5 item   | 2 farklı tier          | 3 farklı aile   | 3 farklı silhouette        | En az 2 dilim (§15.3) |
| 6–10 item  | 3 farklı tier          | 5 farklı aile   | 5 farklı silhouette        | En az 3 dilim         |
| 11–20 item | Mağaza bandının tamamı | 7 farklı aile   | 7 farklı silhouette        | 4 dilim (tam uygula)  |
| 20+ item   | Mağaza bandının tamamı | 10+ farklı aile | Kategori havuzunun %50'si+ | 4 dilim (tam uygula)  |

> Batch size ≤ 5 ise §15.2 silhouette kotaları hedef olarak uygulanır, zorunlu değildir.
> Batch size > 10 ise tüm §15 kuralları **zorunludur**.

---

---

## BÖLÜM 16 — ÇIKTI YÖNETİMİ VE KÜMÜLATİF ÜRETİM

### 16.1 Çıktı Klasör Yapısı

Tüm üretim çıktıları aşağıdaki klasör yapısına kaydedilir:

```
1Developer/Wardrobe/Prompts/
├── 01 - Tops/
├── 02 - Bottoms/
├── 03 - Dress/
├── 04 - Coats/
├── 05 - Shoes/
├── 06 - Bags/
├── 07 - Jewellery/
├── 08 - Bra/
├── 09 - Panty/
├── 10 - Bodysuit/
├── 11 - Garter/
├── 12 - Sleepwear/
├── 13 - Socks/
├── 14 - BikiniTop/
├── 15 - BikiniBottom/
└── 16 - Swimsuit/
```

> **Lingerie/Bikini setleri** ayrı klasöre girmez. Her parça kendi slot klasörüne kaydedilir:
> bra → `08 - Bra/` · panty → `09 - Panty/` · socks → `13 - Socks/` · garter → `11 - Garter/`
> Parçalar `matchSet` field'ı ile birbirine bağlıdır.

### 16.2 Dosya Adlandırma Kuralı

Her batch bir JSON dosyası olarak kaydedilir:

```
{StoreID}_{BatchNo}.json
```

**Örnekler:**

- `storeClothingA_batch01.json`
- `storeLingerieB_batch02.json`
- `boutiqueA_batch01.json`

**BatchNo** otomatik artırılır — aynı mağaza için ikinci batch → `_batch02`.

**Lingerie Set Üretiminde Kayıt:**
Set üretildiğinde her parça kendi kategori klasörüne kaydedilir. Örneğin `full` set (bra + panty + socks + garter) → 4 ayrı klasördeki dosyaya eklenir. Tüm parçalarda aynı `matchSet` string'i bulunur, böylece agent herhangi bir klasörü tararken `matchSet` üzerinden setin diğer parçalarını bulabilir.

### 16.3 Dosya İçeriği Formatı

Her çıktı dosyası şu yapıda olmalıdır:

```json
{
  "_meta": {
    "store": "storeClothingA",
    "category": "tops",
    "batchNo": 1,
    "itemCount": 10,
    "date": "2026-02-23",
    "tierBreakdown": { "T0": 2, "T1": 3, "T2": 3, "T3": 2 },
    "colorFamilies": ["Neutral-Dark", "Red/Burgundy", "Green", "Pink", "Denim Blue"],
    "silhouettes": ["fitted", "oversized", "cropped", "wrap", "boxy"],
    "qualityBreakdown": { "Common": 4, "Rare": 5, "Premium": 1 }
  },
  "items": {
    "topBrettonStripeNavy": { ... },
    "topOversizedSloganCharcoal": { ... }
  }
}
```

`_meta` bloğu agent'ın sonraki üretimlerde hızlı tarama yapmasını sağlar.

### 16.4 Kümülatif Üretim Kuralları (ZORUNLU)

Agent yeni bir batch üretmeden **önce** şu adımları izler:

**Adım 1 — Mevcut envanter taraması:**

- İlgili kategori klasörünü oku (örn. `08 - Bra/` altındaki tüm JSON dosyaları)
- Her dosyadaki `_meta` bloğunu oku
- Mevcut itemların `id`, `silhouette`, `colorFamily`, `material`, `tier` bilgilerini topla

**Adım 2 — Kümülatif denge kontrolü:**

- §15.7 Anti-Duplicate eşiğini **tüm mevcut itemlara karşı** uygula (sadece batch içi değil)
- Global renk ve silhouette dağılımını kontrol et — zaten fazla olan renk/silhouette'i yeni batch'te azalt
- Mağazanın Bölüm 5'teki toplam hedefine kalan item sayısını hesapla

**Adım 3 — Yeni batch üret:**

- Eksik olan tier/renk/silhouette yönünde ağırlık ver
- Batch'i üret, kalite kontrolünü (§13 + §15) uygula

**Adım 4 — Kaydet:**

- Çıktıyı ilgili kategori klasörüne doğru dosya adıyla kaydet

### 16.5 Kümülatif Kontrol Tablosu

Agent tarama yaparken şu tabloyu doldurup raporlamalıdır:

```
📊 Mevcut Envanter Raporu — [Kategori] — [Mağaza]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hedef toplam  : XX item (Bölüm 5'ten)
Mevcut        : XX item (YY batch)
Kalan         : XX item

Tier dağılımı : T0: X/hedef · T1: X/hedef · T2: X/hedef · ...
Renk dengesi  : [fazla] Neutral-Dark (5) · [eksik] Green (0) · ...
Silhouette    : [fazla] fitted (6) · [eksik] wrap (0) · ...
Quality       : Common: X · Rare: X · Premium: X · Luxury: X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Bu batch'te önerilen: [tier/renk/silhouette yönlendirmesi]
```

### 16.6 Birden Fazla Kategoriyi Bağlama

Agent aynı mağaza için birden fazla kategori ürettiğinde (örn. Northline tops + bottoms), ayrı dosyalara kaydeder ama **mağaza genelindeki** renk ve quality dengesini tüm kategori dosyalarından kontrol eder.

**Mağaza-çapraz tarama:**

- Aynı mağazanın tüm kategori klasörlerindeki JSON dosyaları okunur
- `_meta.store` alanı eşleşen dosyalar filtrelenir
- Global renk ve quality limitleri bu toplama karşı uygulanır

### 16.7 Prompt Kopyalama ve Referans

Üretilen dosyalardaki her item'ın `imagePrompt` alanı doğrudan görsel üretim aracına (Flux, DALL-E, vb.) copy-paste edilebilir formattadır.

**Hızlı prompt çekme komutu:**

```
Prompts/08 - Bra/ altındaki [storeID] dosyalarından tüm imagePrompt'ları listele
```

Agent bu komutu aldığında ilgili dosyaları okur ve sadece `imagePrompt` değerlerini sırayla çıktılar — her birinin yanında `id` ve `name` bilgisi ile.

---

---

## BÖLÜM 17 — OTOMATİK BATCH YÖNETİM SİSTEMİ

### 17.1 Toplu Üretim Komutu

Standart komut: `Creator ile [Kategori] yarat — [StoreID] — [Adet]`

**Toplu komut:** `Tüm [Kategori] üret`

Bu komut verildiğinde agent şu adımları otomatik uygular:

### 17.2 Otomatik Batch Pipeline

```
ADIM 1 — Mağaza Listesi Al
  → Bölüm 5.1'den o kategoriye sahip tüm mağazaları çek
  → Mağaza sırasını Bölüm 5.1 tablo sırasına göre uygula

ADIM 2 — Mevcut Envanter Tara
  → Prompts/XX - Kategori/ klasöründeki tüm JSON dosyalarını oku
  → _meta bloklarından mevcut item sayısını topla
  → Kalan item sayısını hesapla (hedef - mevcut)

ADIM 3 — Batch Döngüsü Başlat
  → Her mağaza için:
    → Kalan item sayısını 10'ar batch'lere böl
    → Son batch kalan kadar (≤10) olabilir
    → Her batch için:
      a. Mevcut envanteri oku (§16.4 Adım 1)
      b. Kümülatif denge kontrolü yap (§16.4 Adım 2)
      c. Batch üret (§16.4 Adım 3)
      d. Kaydet (§16.4 Adım 4)
      e. Envanter raporu güncelle (§17.3)
      f. Sonraki batch'e geç

ADIM 4 — Mağaza Tamamlandı
  → Mağaza tamamlanınca sonraki mağazaya geç
  → Tüm mağazalar bitince final raporu çıkar
```

### 17.3 Batch Sonrası Envanter Raporu

Her batch kaydedildikten sonra agent şu raporu çıkarır:

```
📊 [KATEGORİ] Envanter Raporu — Batch X/Y tamamlandı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hedef    : XX item │ Üretilen: XX/XX │ Kalan: XX
İlerleme : ████████████░░░░░░░░ %60

Mağaza bazlı:
  [store1]  XX/XX ✅ tamamlandı
  [store2]  XX/XX ⏳ devam ediyor (batch X/Y)
  [store3]  0/XX  ⬜ sırada

Renk dağılımı (kümülatif):
  [renk : adet (%oran) ✅/⚠️/❌]

Tier dağılımı:
  T0: X │ T1: X │ T2: X │ T3: X │ T4: X │ T5: X

Quality:
  Common: X │ Rare: X │ Premium: X │ Luxury: X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Sonraki: [storeID] batch X (X item)
```

### 17.4 Mağaza Üretim Sırası (Tüm Kategoriler İçin)

Agent, mağaza sırasını Bölüm 5.1 tablo sırasına göre uygular:

```
1.  Northline        (storeClothingA)
2.  VERA Mode        (storeClothingB)
3.  Fifth Avenue     (storeClothingC)
4.  FastBreak        (storeSports)
5.  Silk & Lace      (storeLingerieA)
6.  Intimate Secrets (storeLingerieB)
7.  Luxe Leather     (storeBags)
8.  Diamond Dreams   (storeJewelry)
9.  StepUp           (storeShoeA)
10. Stiletto         (storeShoeB)
11. Maison Élise     (boutiqueA)
12. Aurum Couture    (boutiqueB)
13. Bellucci Milano  (boutiqueC)
```

> Bir mağazada o kategori yoksa (Bölüm 5.1'de "—") → atla.

### 17.5 Batch Boyutu Kuralları

| Kalan item | Batch boyutu    | Açıklama                  |
| ---------- | --------------- | ------------------------- |
| ≤ 10       | kalan kadar     | Son batch, kalan ne ise o |
| 11–20      | 10 + kalan      | 2 batch                   |
| 21–30      | 10 + 10 + kalan | 3 batch                   |
| 30+        | 10'ar batch'ler | Sıralı                    |

### 17.6 Hata Kurtarma

Batch üretimi sırasında hata olursa:

- **JSON parse hatası:** Aynı batch'i yeniden üret, önceki (hatalı) çıktıyı kaydetme
- **Kural ihlali (§13/§15):** İhlal eden item'ı düzelt veya farklılaştır, batch'i tamamla
- **Konuşma kesilirse:** Sonraki konuşmada agent `Prompts/XX/` klasörünü tarar → kaldığı yerden devam eder (kümülatif sistem sayesinde)

### 17.7 Kategori Üretim Sıra Önerisi

Tüm koleksiyonu sıfırdan üretirken önerilen sıra:

```
Sıra  Kategori       Toplam    ~Batch    Neden bu sırada
────────────────────────────────────────────────────────────
1.    Tops           115       ~12       En büyük kategori, renk paleti burada oturur
2.    Bottoms        125       ~13       Tops ile renk dengesi sağlanır
3.    Dress           65        ~7       Tek slot, pairing yok, bağımsız
4.    Coats           33        ~4       Az, hızlı biter
5.    Shoes           84        ~9       Boutique shoes dahil
6.    Bra             51        ~6       Lingerie bloğu başlar
7.    Panty           40        ~4       Bra ile renk/materyal uyumu kontrol
8.    Bodysuit        26        ~3
9.    Sleepwear       33        ~4
10.   Socks           28        ~3
11.   Garter          12        ~2       En az item, hızlı biter
12.   Bags            35        ~4       Aksesuar bloğu
13.   Jewellery       45        ~5       4 alt slot, dikkatli üretim
14.   BikiniTop       18        ~2       Swimwear bloğu
15.   BikiniBottom    18        ~2       BikiniTop ile renk uyumu kontrol
16.   Swimsuit        15        ~2       Son kategori
────────────────────────────────────────────────────────────
TOPLAM: 743 item │ ~82 batch │ Batch başına ~10 item
```

### 17.8 Duraklatma ve Devam

Agent, her mağaza tamamlandığında otomatik olarak devam eder. Kullanıcı isterse:

- **Durakla:** `dur` veya `bekle` diyerek batch döngüsünü durdurabilir
- **Devam:** `devam` diyerek kaldığı yerden sürdürür
- **Atla:** `[storeID] atla` diyerek bir mağazayı atlayabilir
- **Kontrol:** `envanter raporu` diyerek anlık durum görebilir

---

_Bu dosya finaldir. storeAdult dahil değil. Başka dosyaya bakma._
