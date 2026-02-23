# WARDROBE CREATOR AGENT — FINAL MASTER FILE
*Tek dosya. Başka hiçbir dosyaya bakma. storeAdult dahil değil.*

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

| Alan | Değer |
|------|-------|
| Tier bandı | T0–T3 |
| Default tier | T0:%19 · T1:%32 · T2:%32 · T3:%14 · T4:%3 |
| Quality | Common ağırlıklı, az Rare |
| exposureLevel max | 4 |
| sexinessScore max | 3 |
| reqCorruption override | YOK |
| Fiyat | $8–$70 (tops/bottoms) · $25–$90 (dress) · $3–$35 (panty) |
| Primary style tags | `casual` (T0–T2) · `cute` (T2–T3) |
| Yasak tags | erotic, lewd, slutty, bimbo, daring, revealing |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T0–T3 |
| Default tier | T0:%16 · T1:%41 · T2:%33 · T3:%10 |
| Quality | Common–Rare |
| exposureLevel max | 5 |
| sexinessScore max | 3 |
| reqCorruption override | YOK |
| Fiyat | $25–$120 (apparel) · $45–$140 (shoes) |
| Primary style tags | `sporty` (her zaman) |
| Yasak tags | erotic, lewd, slutty, bimbo, daring, revealing, elegant, formal, sexy |
| Shoes | running · training · slides · court — reqHeelsSkill YOK |

**🏪 STORE IDENTITY — Nike/Adidas**
Performans önce. Technical detail, contrast panel. Monocolor → mutlaka teknik özellik.

**Variety Rules:**
- En az 1 color-block
- En az 1 mesh panel / ventilation detail
- En az 1 stripe / logo-placement
- Monocolor → zip pocket, bonded seam veya reflective piping

**Tipik örnekler:** Color-block running jacket · mesh panel sports bra · side-stripe leggings · compression tights with gradient · zip-up track jacket · court sneaker · embossed slides

---

#### `storeShoeA` — StepUp Footwear
**Referans:** Deichmann / Payless | **Segment:** Budget–Mid Casual Shoes

| Alan | Değer |
|------|-------|
| Tier bandı | T0–T2 |
| Default tier | T0:%29 · T1:%43 · T2:%28 |
| Quality | Common–Rare |
| reqHeelsSkill | 0–1 max |
| reqCorruption override | YOK |
| Fiyat | $20–$90 |
| Primary style tags | `casual` |

**🏪 STORE IDENTITY — Deichmann/Payless**
Her gün giyilebilir, fonksiyonel. Renk varyasyonu yüksek.

**Tipik örnekler:** Platform chunky sneaker · floral canvas flat · leopard print loafer · metallic ballet flat · color-block sandal · chelsea boot · espadrille wedge

---

### MALL — Second Floor

---

#### `storeClothingB` — VERA Mode
**Referans:** Zara / Mango | **Segment:** Mid Trendy

| Alan | Değer |
|------|-------|
| Tier bandı | T2–T4 |
| Default tier | T2:%30 · T3:%40 · T4:%20 |
| Quality | Rare ağırlıklı |
| exposureLevel max | 7 |
| sexinessScore max | 6 |
| reqCorruption override | YOK (exposure 7 → formül: 4) |
| Fiyat | $50–$160 |
| Primary style tags | `casual` (T2) · `cute` (T2–T3) · `sexy` (T3–T4) · `revealing` (T4) |
| Yasak tags | erotic, lewd, slutty, bimbo, sporty |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T3–T4 |
| Default tier | T3:%50 · T4:%50 |
| Quality | Rare–Premium |
| exposureLevel max | 6 |
| sexinessScore max | 5 |
| reqCorruption override | YOK |
| Fiyat | $100–$220 |
| Primary style tags | `elegant` · `professional` · `formal` (T3–T4) |
| Yasak tags | casual, sporty, erotic, lewd, slutty, bimbo, daring |
| npcAppeal | professional + elite NPC yüksek |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T2–T4 |
| Default tier | T2:%30 · T3:%50 · T4:%20 |
| Quality | Rare ağırlıklı |
| exposureLevel max | 7 |
| sexinessScore max | 7 |
| reqCorruption override | T3: **2** · T4: **4** |
| Fiyat | $15–$80 (lingerie) · $20–$55 (bikini/socks) |
| Primary style tags | `cute` (T2) · `sexy` (T3) · `revealing` (T4) |
| Yasak tags | erotic, lewd, slutty, bimbo, sporty, casual |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T3–T5 |
| Default tier | T3:%30 · T4:%40 · T5:%30 |
| Quality | Rare–Premium |
| exposureLevel max | 10 |
| sexinessScore max | 10 |
| reqCorruption override | T3: **4** · T4: **6** · T5: **8** |
| Fiyat | $35–$150 |
| Primary style tags | `sexy` (T3) · `revealing`+`daring` (T4) · `erotic`+`lewd`+`slutty` (T5) |
| Yasak tags | casual, sporty, bimbo |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T2–T4 |
| Default tier | T2:%30 · T3:%50 · T4:%20 |
| Quality | Rare–Premium |
| exposureLevel | 0 |
| sexinessScore | 0 |
| reqCorruption override | YOK |
| Fiyat | $50–$280 |
| Primary style tags | `professional` (T3–T4) · `elegant` (T4) · `casual` (T2) |
| npcAppeal | professional + elite yüksek |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T2–T4 |
| Default tier | T2:%40 · T3:%40 · T4:%20 |
| Quality | Common–Premium |
| exposureLevel | 0 |
| sexinessScore | 0–2 |
| reqCorruption override | YOK |
| Fiyat | Bölüm 4.2'ye göre |
| Primary style tags | `casual` (T2) · `elegant` (T3–T4) |
| Uyarı | "diamond" item isminde geçmez — crystal/zirconia/sterling/gold-plated kullan |

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

| Alan | Değer |
|------|-------|
| Tier bandı | T2–T5 |
| Default tier | T2:%25 · T3:%42 · T4:%25 · T5:%8 |
| Quality | Rare–Premium |
| reqHeelsSkill | 5cm→1 · 8cm→2 · 10cm→3 · 12cm+→4 |
| reqCorruption override | T5 (12cm+ extreme): **4** |
| Fiyat | $55–$200 |
| Primary style tags | `cute` (T2) · `elegant` (T3) · `sexy` (T4) · `daring` (T5) |
| Zorunlu tags | `heels` (her zaman) |

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

*Sadece outerwear. Premium–Luxury. Az item, yüksek fiyat.*

---

#### `boutiqueA` — Maison Élise | T4–T5 | $150–$500

| Alan | Değer |
|------|-------|
| Default tier | T4:%60 · T5:%40 |
| Quality | Premium–Luxury |
| reqCorruption override | YOK |
| Primary style tags | `elegant` · `formal` (T4) · `elegant`+`slutty` (T5 açık parçalar) |

**🏪** Celine/The Row: Sessiz lüks. Monokromatik palet. T5 = "elegant ama provocative" — backless gown, deep plunge luxury dress gibi. Bu parçalar `slutty` tag alır çünkü "zarif ama çok açık" estetiği taşır.

---

#### `boutiqueB` — Aurum Couture | T3–T5 | $200–$600

| Alan | Değer |
|------|-------|
| Default tier | T3:%20 · T4:%50 · T5:%30 |
| Quality | Premium–Luxury |
| reqCorruption override | YOK |
| Primary style tags | `elegant` · `formal` (T3–T4) · `elegant`+`slutty` (T5) |

**🏪** Alexander McQueen (wearable): Bold yapısal kesim. T5 = architectural backless, extreme cut-out luxury.

---

#### `boutiqueC` — Bellucci Milano | T3–T5 | $180–$550

| Alan | Değer |
|------|-------|
| Default tier | T3:%20 · T4:%50 · T5:%30 |
| Quality | Premium–Luxury |
| reqCorruption override | YOK |
| Primary style tags | `elegant` · `formal` (T3–T4) · `elegant`+`slutty` (T5) |

**🏪** Versace/Max Mara: İtalyan craftsmanship, zengin kumaş. T5 = bold Italian luxury with revealing cuts.

---

## BÖLÜM 4 — EKONOMİ TABLOSU

### 4.1 Kıyafet Fiyat Aralıkları

| Kategori | Common | Rare | Premium | Luxury |
|----------|--------|------|---------|--------|
| Tops | $8–$15 | $50–$70 | $100–$140 | $150–$220 |
| Bottoms | $15–$30 | $60–$90 | $110–$160 | $170–$280 |
| Dress | $25–$40 | $70–$120 | $130–$200 | $200–$350 |
| Coats | $30–$50 | $80–$130 | $140–$220 | $220–$400 |
| Bra | $5–$10 | $18–$30 | $35–$60 | $60–$100 |
| Panty | $3–$8 | $15–$25 | $30–$50 | $50–$90 |
| Bodysuit | $12–$20 | $25–$50 | $55–$90 | $90–$150 |
| Sleepwear | $15–$25 | $35–$55 | $60–$90 | — |
| Socks/Hosiery | $3–$8 | $10–$20 | $20–$35 | — |
| Garter | $8–$15 | $20–$40 | $45–$80 | — |
| Bikini Top | $5–$12 | $20–$40 | $45–$75 | — |
| Bikini Bottom | $5–$12 | $20–$40 | $45–$75 | — |
| Swimsuit | $15–$30 | $40–$70 | $75–$120 | — |
| Shoes | $20–$35 | $55–$90 | $100–$160 | $160–$280 |
| Bags | — | $50–$120 | $120–$220 | $220–$400 |

### 4.2 Takı Fiyat Aralıkları

| Kategori | Common | Rare | Premium | Luxury |
|----------|--------|------|---------|--------|
| Earrings | $10–$20 | $50–$80 | $100–$180 | $200–$400 |
| Necklace | $12–$25 | $60–$120 | $130–$250 | $250–$500 |
| Bracelet | $8–$15 | $40–$60 | $80–$150 | $150–$300 |
| Ring | $15–$30 | $60–$100 | $120–$250 | $250–$600 |

### 4.3 baseLooks × Quality

| Quality | Tek slot | 2-slot (dress/bodysuit/swimsuit) |
|---------|----------|----------------------------------|
| Common | 1–3 | 2–5 |
| Rare | 3–5 | 5–8 |
| Premium | 5–8 | 7–10 |
| Luxury | 7–10 | 9–12 |

---

## BÖLÜM 5 — TAM ENVANTER TABLOSU

### 5.1 Mağaza × Slot Matrisi

| Mağaza | Tops | Bot | Dress | Coat | Bra | Panty | Sleep | Socks | Body | Garter | Bags | Jewelry | Shoes | BikTop | BikBot | Swim | **TOP** |
|--------|------|-----|-------|------|-----|-------|-------|-------|------|--------|------|---------|-------|--------|--------|------|---------|
| Northline | 34 | 41 | 9 | 7 | — | 13 | 4 | — | — | — | — | — | — | — | — | — | **108** |
| VERA Mode | 29 | 27 | 14 | 5 | — | — | 8 | — | — | — | — | — | — | — | — | — | **83** |
| Fifth Avenue | 19 | 23 | 9 | 5 | — | — | 4 | — | — | — | — | — | — | — | — | — | **60** |
| FastBreak | 11 | 15 | — | 5 | 7 | — | — | 5 | — | — | — | — | 18 | — | — | — | **61** |
| Silk & Lace | — | — | — | — | 19 | 16 | 6 | 11 | — | — | — | — | — | 7 | 7 | 4 | **70** |
| Intimate Secrets | — | — | — | — | 15 | 11 | 5 | 6 | 18 | 12 | — | — | — | 6 | 6 | 3 | **82** |
| Luxe Leather | — | — | — | — | — | — | — | — | — | — | 27 | — | — | — | — | — | **27** |
| Diamond Dreams | — | — | — | — | — | — | — | — | — | — | — | 33 | — | — | — | — | **33** |
| StepUp | — | — | — | — | — | — | — | — | — | — | — | — | 28 | — | — | — | **28** |
| Stiletto | — | — | — | — | — | — | — | — | — | — | — | — | 24 | — | — | — | **24** |
| Maison Élise | 8 | 7 | 6 | 4 | — | — | — | — | — | — | — | — | — | — | — | — | **25** |
| Aurum Couture | 7 | 6 | 8 | 4 | — | — | — | — | — | — | — | — | — | — | — | — | **25** |
| Bellucci Milano | 7 | 6 | 7 | 3 | — | — | — | — | — | — | — | — | — | — | — | — | **23** |
| **TOPLAM** | **115** | **125** | **53** | **33** | **41** | **40** | **27** | **22** | **18** | **12** | **27** | **33** | **70** | **13** | **13** | **7** | **649** |

### 5.2 Mağaza × Tier Dağılımı

| Mağaza | T0 | T1 | T2 | T3 | T4 | T5 | **TOP** |
|--------|----|----|----|----|----|----|---------|
| Northline | 20 | 35 | 35 | 15 | 3 | — | **108** |
| VERA Mode | — | 10 | 25 | 33 | 15 | — | **83** |
| Fifth Avenue | — | — | 12 | 30 | 18 | — | **60** |
| FastBreak | 10 | 25 | 20 | 6 | — | — | **61** |
| Silk & Lace | — | 10 | 25 | 25 | 10 | — | **70** |
| Intimate Secrets | — | — | — | 22 | 35 | 25 | **82** |
| Luxe Leather | — | 5 | 12 | 8 | 2 | — | **27** |
| Diamond Dreams | — | 8 | 13 | 10 | 2 | — | **33** |
| StepUp | 8 | 12 | 8 | — | — | — | **28** |
| Stiletto | — | — | 6 | 10 | 6 | 2 | **24** |
| Maison Élise | — | — | — | 5 | 13 | 7 | **25** |
| Aurum Couture | — | — | — | 5 | 13 | 7 | **25** |
| Bellucci Milano | — | — | — | 5 | 12 | 6 | **23** |
| **TİER TOP** | **38** | **105** | **156** | **174** | **99** | **77** | **649** |

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

| Tier | reqConfidence | reqExhibitionism | reqCorruption (formül) | reqCorruption (override) |
|------|--------------|-----------------|----------------------|--------------------------|
| T0 | 0 | 0 | 0 | 0 |
| T1 | ~5–20 | 0 | 0 | 0 |
| T2 | ~15–35 | 0–6 | 0 | 0 |
| T3 | ~30–50 | 6–18 | 0 | S&L: **2** · IS: **4** |
| T4 | ~50–68 | 18–30 | 4 (exp 7–8) | S&L: **4** · IS: **6** · StilT5: **4** |
| T5 | ~65–78 | 24–42 | 6 (exp 9–10) | IS: **8** · Boutique T5: formüle göre |

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

| Tier | Primary style tag | Örnekler |
|------|------------------|----------|
| T0 | `casual` | Uzun kol tee, regular jeans, basic coat |
| T1 | `casual` | Basic tops, regular pants, sneakers |
| T2 | `casual` · `cute` | Mild shape, diz hizası, light styling |
| T3 | `cute` · `elegant` · `sexy` | Diz üstü, hafif dekolte, omuz (mağazaya göre) |
| T4 | `sexy` · `revealing` · `daring` | Bacak, crop, mini, açık sırt |
| T5 | `daring` · `erotic` · `lewd` · `slutty` | Maximum ten, barely-there |

### 7.4 Mağaza → Style Tag Matrisi

| Mağaza | T0 | T1 | T2 | T3 | T4 | T5 |
|--------|----|----|----|----|----|----|
| Northline | `casual` | `casual` | `casual`,`cute` | `cute` | `cute`,`sexy` | — |
| FastBreak | `sporty` | `sporty` | `sporty` | `sporty` | — | — |
| StepUp | `casual` | `casual` | `casual`,`cute` | — | — | — |
| VERA Mode | — | `casual` | `casual`,`cute` | `cute`,`sexy` | `sexy`,`revealing` | — |
| Fifth Ave | — | — | `elegant`,`professional` | `elegant`,`formal` | `elegant`,`formal` | — |
| Silk & Lace | — | `cute` | `cute`,`sexy` | `sexy` | `revealing` | — |
| Intimate Secrets | — | — | — | `sexy`,`daring` | `revealing`,`daring`,`erotic` | `lewd`,`slutty` |
| Luxe Leather | — | `casual` | `casual`,`professional` | `professional`,`elegant` | `elegant` | — |
| Diamond Dreams | — | `casual` | `casual`,`elegant` | `elegant` | `elegant` | — |
| Stiletto | — | — | `cute` | `elegant`,`sexy` | `sexy`,`daring` | `daring`,`slutty` |
| Boutiques | — | — | — | `elegant`,`formal` | `elegant`,`formal` | `elegant`,`slutty` |

### 7.5 `slutty` Tag Kuralı

`slutty` sadece şu durumlarda kullanılır:
1. **Intimate Secrets T5** — barely-there, maximum revealing lingerie
2. **Stiletto Studio T5** — extreme heel (12cm+), platform stiletto
3. **Boutique T5** — "elegant ama provocative" parçalar (backless luxury gown, deep plunge couture dress, extreme cut-out)

**`bimbo` tag → storeAdult'a özel, bu dosyada kullanılmaz.**

---

## BÖLÜM 8 — KATEGORİ & MATERYAL HAVUZLARI

### Silhouette Havuzları

| Kategori | Seçenekler |
|----------|------------|
| Tops | fitted · oversized · cropped · draped · wrap · off-shoulder · cold-shoulder · boxy · longline · asymmetric · corset-style · tie-front |
| Bottoms | straight-leg · wide-leg · slim · A-line skirt · pencil skirt · mini skirt · midi skirt · flared · cargo · shorts-relaxed · shorts-fitted · tailored · pleated · paperbag-waist |
| Dress | bodycon · wrap · A-line · midi-flared · maxi · slip · shirt-dress · mini · fit-and-flare · asymmetric-hem · corset-bodice · backless |
| Coats | trench · oversized-cocoon · belted · double-breasted · longline-minimalist · blazer-coat · faux-fur · wrap-coat · duster · puffer |
| Shoes | pump · stiletto · mule · strappy-sandal · ankle-strap · platform · wedge · chunky-sneaker · running · slide · flat · loafer · chelsea-boot · ankle-boot |
| Bags | tote · mini-crossbody · clutch · shoulder-bag · bucket · hobo · structured-top-handle · belt-bag · saddle |
| Jewellery | delicate-chain · chunky-statement · stud · hoop · drop · cuff · tennis-chain · solitaire · signet · ear-cuff |
| Bra | balconette · plunge · bralette · push-up · bandeau · sports-bra |
| Panty | brief · bikini-cut · hipster · thong · high-waist · cheeky |
| Bodysuit | scoop · deep-V · halter · long-sleeve · mesh-panel · lace-overlay |
| Garter | classic-6-strap · 4-strap · suspender-belt · garter-skirt |
| Sleepwear | babydoll · chemise · satin-set · shorts-set · robe · nightgown · cami-set |
| Socks | ankle · crew · knee-high · thigh-high · fishnet · lace-top · no-show |
| Bikini Top | triangle · bandeau · underwire · halter · sporty-crop · tie-side · ruffled |
| Bikini Bottom | brief · high-waist · cheeky · thong · tie-side · ruched |
| Swimsuit | one-piece · cut-out · halter · strappy-back · plunge · high-neck |

### Materyal Havuzları

| Kategori | Materyaller |
|----------|-------------|
| Tops | ribbed knit · linen · cotton jersey · chiffon · satin · velvet · mesh · broderie anglaise · bamboo · poplin · waffle knit |
| Bottoms | denim · twill · cotton drill · linen-blend · satin · velvet · faux leather · jersey knit · ponte · crepe |
| Dress | crepe · chiffon · satin · linen · cotton voile · velvet · jersey · mesh · broderie |
| Coats | wool-blend · cashmere-blend · faux-suede · technical-nylon · tweed · faux-fur · cotton-canvas · bouclé · faux leather |
| Shoes | faux leather · suede · patent faux leather · mesh · synthetic · canvas · metallic · croco-emboss |
| Bags | pebbled faux leather · smooth vegan leather · suede · canvas · raffia · nylon · patent · woven straw · croco-emboss |
| Jewellery | sterling silver · gold vermeil · rose gold · brass · stainless steel · resin · enamel · crystal-set |
| Bra/Panty/Bodysuit | satin · lace · mesh · microfiber · cotton · stretch velvet · sheer nylon |
| Garter | lace · satin · stretch velvet · mesh · PVC |
| Sleepwear | satin · chiffon · cotton · silk-blend · lace-trim · jersey |
| Socks | cotton · nylon · lace · fishnet · spandex-blend · velvet |
| Bikini/Swimsuit | matte lycra · ribbed lycra · crinkle fabric · printed nylon · terry cloth · metallic lycra |

---

## BÖLÜM 9 — RENK ROTASYON SİSTEMİ

| # | Aile | Örnekler |
|---|------|----------|
| 1 | Neutral-Light | white, ivory, cream, off-white |
| 2 | Neutral-Dark | black, charcoal, graphite, jet |
| 3 | Grey | light grey, heather grey, slate, ash |
| 4 | Navy/Deep Blue | navy, midnight blue, cobalt, royal blue |
| 5 | Denim Blue | light denim, dark wash, acid wash |
| 6 | Red/Burgundy | red, crimson, wine, burgundy, cherry |
| 7 | Pink | blush, dusty rose, hot pink, mauve, fuchsia |
| 8 | Orange/Rust | burnt orange, rust, terracotta, amber |
| 9 | Yellow/Gold | lemon, mustard, golden, canary |
| 10 | Green | olive, sage, forest, emerald, mint |
| 11 | Purple | lavender, plum, violet, lilac |
| 12 | Brown/Camel | camel, tan, khaki, chocolate, mocha, taupe |
| 13 | Teal/Cyan | teal, turquoise, aqua |
| 14 | Print/Multi | floral, geometric, stripe, plaid, animal print |
| 15 | Metallic | silver, gold, rose gold, bronze, iridescent |
| 16 | Sheer/Tonal | sheer black, sheer white, nude |

**KURAL: Aynı batch'te bir aileden max 2 item. 2/2 = KAPALI.**

**Tonal zorunluluğu:**

| ❌ | ✅ |
|----|-----|
| white | soft ivory white |
| black | deep matte black |
| red | rich crimson red |
| pink | dusty muted pink |
| green | deep forest green |
| grey | cool heather grey |
| blue | dark navy blue |
| beige | warm sandy beige |
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

| Topuk yüksekliği | reqHeelsSkill |
|-----------------|---------------|
| Topuksuz / flat | 0 |
| ~5cm (kitten, low) | 1 |
| ~8cm (mid heel) | 2 |
| ~10cm (high heel) | 3 |
| 12cm+ (extreme) | 4 |

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

---

## BÖLÜM 11 — GÖRSEL PROMPT PIPELINE

**11 adım — sırayla — tek paragraf.**

```
1.  Aspect ratio
2.  Body description
3.  Wearing: tonal renk + materyal + silhouette + DESEN/DETAY (zorunlu)
4.  Openness phrase (exposure ≥ 5 ise zorunlu)
5.  Pairing
6.  Pose
7.  Lighting + Background (sabit)
8.  Frame + Focus
9.  Mood token
10. Skin tone (sabit)
11. Kapanış (sabit)
```

### 11.1 Aspect Ratio

| Kategori | Ratio |
|----------|-------|
| Tops · Bottoms · Dress · Coats · Bra · Panty · Bodysuit · Garter · Sleepwear · Bikini Top · Bikini Bottom · Swimsuit | 4:5 |
| Shoes | 4:3 |
| Bags · Jewellery | 1:1 |

### 11.2 Body Description

| exposure + sexiness ort. | Body |
|--------------------------|------|
| ≤ 3 | `A young fit woman` |
| 4–6 | Tops/Coats/Bra/BikiniTop → `A young fit woman with a perky bust` · Bottoms/Panty/BikiniBottom/Garter → `A young fit woman with full hips and a rounded butt` · Dress/Bodysuit/Swimsuit/Sleepwear → `A young fit woman with a slim waist and feminine curves` |
| ≥ 7 | Yukarıdaki slot bazlı, güçlü ifadeyle |

> ❌ "voluptuous" yasak. Bags/Jewellery → her zaman neutral.

### 11.3 Wearing — Detay Zorunlu

| Tür | Ekleme |
|-----|--------|
| Print | "with [floral/stripe/geometric/animal] print throughout" |
| Grafik | "featuring graphic [slogan/print] on the front" |
| Texture | "with visible [ribbed/waffle/broderie] texture" |
| Kesim | "with [asymmetric/wrap/tie-front/cut-out] detail" |
| Hardware | "with [gold/silver] [chain/ring/buckle] detail" |
| Renk combo | "in color-block [renk1] and [renk2]" |

### 11.4 Openness Phrases

| exposureLevel | Ekle |
|--------------|------|
| 1–2 | (hiçbir şey) |
| 3–4 | subtle silhouette definition |
| 5–6 | waist visible · light silhouette emphasis |
| 7–8 | showing cleavage / exposing lower back / high-cut leg |
| 9–10 | deep V showing cleavage · backless · sheer panel · very high-cut · bare midriff |

### 11.5 Mood Token

| sexinessScore | Mood |
|--------------|------|
| 1–3 | refined / casual / cozy / clean |
| 4–6 | stylish / confident / polished |
| 7–8 | sensual / alluring / bold |
| 9–10 | provocative / daring / seductive |

### 11.6 Kategori Framing + Pairing

| Kategori | Pairing | Frame |
|----------|---------|-------|
| **Tops** | alt: pool-A | shoulders to hips, focus on top |
| **Bottoms (pants)** | üst: pool-B | waist to shoes, full length |
| **Bottoms (shorts/skirts)** | üst: pool-B | waist to knee |
| **Dress** | yok | below chin to feet, full dress + shoes |
| **Coats** | pool-C | shoulders to hem |
| **Shoes** | dark fitted jeans | floor to mid-calf, sharp focus on shoe |
| **Bags** | pool-C | bag prominently centered |
| **Jewellery** | close-up §11.8 | alan'a göre |
| **Bra** | yok/matching panty | waist to shoulders, sadece bra |
| **Panty** | yok/matching bra | waist to thighs, sadece panty |
| **Bodysuit** | yok | thighs to shoulders |
| **Garter** | thigh-high stocking | waist to thighs |
| **Sleepwear** | yok | knees to shoulders |
| **Socks** | bare leg veya jeans | floor to knee/thigh |
| **Bikini Top** | yok | waist to shoulders, sadece bikini top |
| **Bikini Bottom** | yok | waist to thighs, sadece bikini bottom |
| **Swimsuit** | yok | full length |

**Pool-A:** dark fitted jeans · charcoal wide-leg trousers · high-waist black pants · straight-leg navy trousers · slim indigo jeans · pleated midi skirt · black culottes · cropped ankle jeans · olive cargo pants · cigarette pants

**Pool-B:** simple white fitted tee · grey fitted tee · black fitted tee · white blouse · striped Breton top · neutral fitted tank

**Pool-C:** white tee + dark jeans · grey tee + charcoal trousers · white blouse + navy trousers · black tee + slim black pants

### 11.7 Pose Havuzu (batch içinde tekrar etme)

```
front three-quarter view, weight on one leg, slight hip tilt
relaxed standing, slight side angle, one foot pointed toward camera
front view, one leg slightly bent, casual stance
catalog pose, feet shoulder-width apart
three-quarter view, weight on back leg
angled stance, one foot slightly ahead
front view with subtle turn, weight shifted to one hip
three-quarter view, one knee bent, dynamic catalog pose
rear three-quarter view  ← backless / garter için
```

### 11.8 Sabit Bloklar

**Lighting + Background:**
```
Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background.
```

**Skin Tone:**
```
Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration.
```

**Kapanış:**
```
Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution.
```

### 11.9 Jewellery Template

```
1:1. Close-up of {TAKIM} worn by a young fit woman; {ALAN} visible, professional jewelry photography, clean minimal. Soft even lighting, isolated on pure white background, sharp focus on the {type}. Photorealistic, high resolution. No face visible.
```

| Slot | Alan |
|------|------|
| necklace | neck and collarbones |
| earrings | ear and jaw |
| bracelet | wrist and hand |
| ring | hand and fingers |

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

| SetTipi | Parçalar | Item / set |
|---------|----------|------------|
| `duo` | bra + panty | 2 |
| `trio` | bra + panty + socks | 3 |
| `full` | bra + panty + socks + garter | 4 |

**Mağaza hedefleri:**

| Mağaza | duo | trio | full | Toplam set | Toplam item |
|--------|-----|------|------|-----------|-------------|
| Silk & Lace | 7 | 4 | 6 | 17 | 14+12+24 = **50** |
| Intimate Secrets | 7 | 4 | 6 | 17 | 14+12+24 = **50** |

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

| Kontrol | Pass koşulu |
|---------|-------------|
| Tonal renk | name + desc + prompt içinde |
| Renk ailesi cap | batch'te aynı aileden max 2 |
| Anti-duplicate | silhouette + colorFamily + material + cut — batch'te 2 item aynı 4'ü taşıyamaz |
| Mağaza variety | STORE IDENTITY variety rules uygulandı |
| Solid oranı | batch'te max %40 plain solid |
| tierScore | mağaza tier bandı içinde |
| T0 kuralları | bacak kapalı · göbek kapalı · dekolte yok |
| baseLooks | Bölüm 4.3'e uygun |
| Fiyat | Bölüm 3 mağaza + Bölüm 4.1'e uygun |
| exposureLevel | mağaza max'ı aşmıyor |
| reqConfidence | **MAX 78** — schema'da yok, widget hesaplar |
| reqCorruption | **her item'da var**, default 0 — override Bölüm 6.2 |
| reqHeelsSkill | shoes'da topuk yüksekliğine göre 0–4 · diğer slotlarda 0 |
| matchSet | set parçalarında aynı string · tekil itemlarda null |
| matchSet renk uyumu | set içinde tüm parçalar aynı renk ailesi |
| matchSet materyal uyumu | set içinde tüm parçalar aynı ana materyal |
| matchSet batch | setin tüm parçaları aynı batch'te |
| LingerieSet komut | duo=2item · trio=3item · full=4item / set |
| Style tags | **sadece** Bölüm 7.1 listesinden |
| `slutty` kullanımı | sadece IS T5 · Stiletto T5 · Boutique T5 |
| `bimbo` kullanımı | bu dosyada YOK |
| Body description | doğru slot + ortalama |
| Openness phrase | exposure ≥ 5 ise var |
| Wearing detayı | print/texture/hardware/cut belirtilmiş |
| Frame | §11.6 kategoriye özel |
| Pose | batch içinde tekrar yok |
| Pairing | batch içinde tekrar yok |
| Skin tone | mevcut |
| Kapanış | son satır |
| Bikini tag | flavor tag `bikini` zorunlu |
| Swimsuit tag | flavor tag `swimsuit` zorunlu |

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
    "imagePrompt": "4:5. A young fit woman wearing a navy blue and soft white horizontal Breton stripe fitted cotton jersey tee with short sleeves and round neckline, featuring classic even horizontal stripe pattern throughout, paired with dark fitted jeans. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame shoulders to hips, sharp focus on the stripe pattern and fabric fit. Casual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with a perky bust wearing a deep jewel-toned emerald green sheer mesh plunge bra with adjustable strappy detail across the cups and gold O-ring hardware accents, showing cleavage through the sheer mesh panel, with strappy back detail visible. Rear three-quarter view to show back strapping. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to shoulders, sharp focus on the strappy hardware and emerald mesh texture. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with a slim waist and feminine curves wearing a deep plum structured crepe floor-length gown with architectural sculptural shoulder detail and extreme open back from nape to waist, exposing lower back entirely. Rear three-quarter view to show the backless construction and sculptural back silhouette. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame below chin to floor, full gown length visible. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with a perky bust wearing a soft dusty blush satin bralette with delicate ribbon-tie front detail and lace-trim band, waist visible with light silhouette emphasis. No pairing. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to shoulders, sharp focus on the ribbon-tie detail and satin sheen. Stylish. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with full hips and a rounded butt wearing a soft dusty blush satin high-waist brief with delicate lace waistband trim and ribbon detail at center front, waist visible with light silhouette emphasis. No pairing. Catalog pose, feet shoulder-width apart. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to thighs, sharp focus on the high-waist cut and lace waistband. Stylish. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:3. A young fit woman wearing a bold leopard print faux suede ankle-strap stiletto with pointed toe and thin gold-buckle ankle closure, featuring clear heel extension and elongated leg line at 10cm, paired with dark fitted jeans. Angled stance, one foot slightly ahead. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame floor to mid-calf, sharp focus on the shoe design and leopard print pattern detail. Confident. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with a perky bust wearing a deep matte black sheer mesh balconette bra with adjustable strappy cage detail across the cups and matte O-ring hardware accents, showing cleavage through the sheer mesh. No pairing. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to shoulders, sharp focus on the strappy cage detail and mesh texture. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with full hips and a rounded butt wearing a deep matte black sheer mesh cheeky brief with thin elastic waistband and O-ring side hardware detail, high-cut leg visible. No pairing. Rear three-quarter view to show cheeky cut. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to thighs, sharp focus on the mesh texture and cheeky silhouette. Sensual. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with full hips and a rounded butt wearing deep matte black fishnet thigh-high stockings with a wide elasticated lace top band, bare thigh visible above the lace band. No pairing. Front three-quarter view, weight on one leg. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame floor to thighs, sharp focus on the fishnet texture and lace-top band. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
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
    "imagePrompt": "4:5. A young fit woman with full hips and a rounded butt wearing a deep matte black sheer mesh 6-strap harness garter belt with adjustable waistband and matte metal hardware, suspender straps hanging free, showing cleavage through the sheer mesh panel. Thigh-high fishnet stockings attached to suspender clips. Front three-quarter view, weight on one leg, slight hip tilt. Professional catalog lighting, neutral diffuse white light, no warm or yellow gels, flat solid pure white background only, no curtains, no folds, no stands, no equipment, no color bleed from background. Frame waist to thighs, sharp focus on the harness structure and strap arrangement. Alluring. Consistent natural skin tone, no yellow tint, no orange cast, no color artifacts on arms or hands. No yellow skin, no orange tint, no unnatural skin discoloration. Absolutely no face visible, anonymous model from neck down. Photorealistic, high resolution."
  }
}
```

---

*Bu dosya finaldir. storeAdult dahil değil. Başka dosyaya bakma.*