# Mall Shops ↔ Wardrobe Twee – Karşılaştırma ve Denetim Raporu

**Tarih:** Şubat 2025  
**Kapsam:** Tüm mall mağaza twee dosyaları × WardrobeSys twee dosyaları

---

## 1. Mağaza Bazında Satılan Item Listesi

| Mağaza | Passage | Item Sayısı | Item ID'ler |
|--------|---------|-------------|-------------|
| **Northline Apparel** | storeClothingA | 16 | tee_basic_white_cotton, crop_tee_black_relaxed, crop_tee_white, top_offshoulder_striped, top_wrap_vneck_cream, hoodie_oversize_gray, jeans_slim_blue_highrise, pant_black, leggings_black_basic, skirt_mini_denim, dress_sundress_floral, dress_midi_shirtdress, dress_elegant, bra_basic_black_cotton, panty_brief_cotton_black |
| **VERA Mode** | storeClothingB | 17 | blazer_cropped_black, blazer_cropped_singlebreast_black, blazer_cropped_singlebreast_navy, blouse_silk_like_cream, crop_shoulder, crop_sweater_knit_oatmeal, top_cutout_side_white, top_wrap_vneck, vest_fauxleather_black, pants_paperbag_beige, pant_wide_cream, skirt_mini_black_aline, skirt_mini_plaid, skirt_mini_plaid_scotch_red, dress_midi_wrap_floral, jumpsuit_wideleg_black |
| **Fifth Avenue** | storeClothingC | 12 | coat_wool_blend_black, coat_soft_cream, trench_coat_khaki, blazer_structured_navy, blouse_printed_floral, trousers_suit_navy, trousers_wideleg_navy, skirt_pencil_midi_black, dress_cocktail_black, dress_maxi_flowing, dress_midi_silk_blend_navy, dress_back_cutout_lbd |
| **StepUp Footwear** | storeShoeA | 10 | sneakers_white_lowtop, sneakers_black_canvas, sneakers_platform_white, flats_ballet_black, sandals_flat_strap, boots_ankle_black, heels_block_nude, loafers_black_basic, socks_ankle_white, socks_ankle_black |
| **Stiletto Studio** | storeShoeB | 10 | heels_stiletto_black, heels_stiletto_nude, boots_knehigh_black, boots_knehigh_brown, heels_maryjane_black, sandals_stiletto_nude, loafers_leather_horsebit, pumps_satin_black, ankle_boots_suede_tan, heels_block_metallic |
| **Luxe Leather** | storeBags | 8 | handbag_tote_leather_black, handbag_tote_canvas, backpack_leather_brown, crossbody_small_chain, clutch_evening_gold, clutch_evening_silver, wristlet_clutch, bucket_bag_tan |
| **Diamond Dreams** | storeJewelry | 11 | earrings_hoop_gold, earrings_stud_pearl, earrings_dangle_crystal, necklace_choker_velvet_drop, necklace_choker_velvet_halfmoon, necklace_pendant_silver, necklace_layer_gold, bracelet_bangle_silver, bracelet_charm, ring_stack_gold, ring_statement_crystal |
| **Silk & Lace** | storeLingerieA | 10 | bra_bralette_lace_black, bra_demi_black, bra_lace_ivory, bra_matching_rose, bra_tshirt_nude, panty_boyshort_charcoal, panty_hipster_lace_nude, panty_matching_rose, thong_lace_black, slip_satin_black |
| **Intimate Secrets** | storeLingerieB | 13 | bra_lace_black_matching, bra_lace_red_matching, bra_strappy_silver, panty_lace_black_matching, panty_lace_red_matching, panty_strappy_silver, babydoll_lace_black, chemise_silk_champagne, robe_sheer_lace_trim, garter_belt_black, bodysuit_lace_black, bodysuit_silk_cream, teddy_lace_black |
| **FastBreak Athletics** | storeSports | 20 | yoga_mat, tank_racerback_white, tank_top_mesh_black, tank_top_mesh_charcoal, crop_sports_tee_navy, tank_top_cutout_white, bra_sports_black, bra_sports_gray, bra_crop_top_pink, bra_sports_low_support_white, bra_sports_strappy, leggings_high_waist_navy, leggings_high_cut_black, shorts_running_black, shorts_yoga_gray, short_thong_back_black, short_mesh_see_through_gray, sneakers_trail_runners, socks_crew_white, socks_crew_black |

---

## 2. KRİTİK: Shop’ta Var Ama Wardrobe’da Farklı ID / Eksik

| Shop | Shop’taki ID | Wardrobe durumu | Aksiyon |
|------|--------------|------------------|---------|
| **storeSports** | `sneakers_trail_runners` | Wardrobe’da ID: `sneakers_trail_runners_gray_orange` | Shop’u `sneakers_trail_runners_gray_orange` yap veya wardrobe’a `sneakers_trail_runners` alias ekle. Öneri: **storeSports.twee’de ID’yi `sneakers_trail_runners_gray_orange` yap.** |

Bu düzeltme yapılmazsa mağazada satılan item wardrobe’da bulunamaz (satın alınamaz / giyilemez).

---

## 3. Wardrobe’da Var Ama Hiçbir Mall Shop’ta Satılmıyor

Bunlar `shopAvailable: true` olan ama herhangi bir shop’un `_shopItems` listesinde geçmeyen itemlar:

| Kategori | Item ID | Not |
|----------|---------|-----|
| Shoes | sneakers_platform_white | Wardrobe’da FastBreak markalı; master list’e göre storeShoeA’da satılıyor. **storeShoeA’da zaten var** – uyumlu. |
| Shoes | sneakers_trail_runners_gray_orange | Sadece storeSports’ta satılmalı; shop’ta ID yanlış (yukarıda). |

Yani “fazla” item yok; tek tutarsızlık trail runners ID’si.

---

## 4. ShopMd / Master List’te Var Ama Shop veya Wardrobe’da Eksik

| Item ID | Nerede tanımlı | storeClothingA.twee | wardrobe | Aksiyon |
|---------|----------------|---------------------|----------|---------|
| panty_hipster_lace_trim_black | ShopMd storeClothingA, mall-items-master-list | **Yok** | **Yok** | storeClothingA’ya ve wardrobePanties’e eklenmeli. |
| shorts_denim_distressed | ShopMd storeClothingA | Yok | Yok | İstenirse shop + wardrobeBottoms’a eklenebilir. |
| top_wrap_vneck (ShopMd’de storeClothingB) | Master list | – | Var (VERA Mode) | Sadece shop list’te; storeClothingB’de zaten var. |

**Özet:** Eksik olan ve eklenmesi gereken: **panty_hipster_lace_trim_black** (storeClothingA + wardrobePanties).

---

## 5. Wardrobe’da Olmayan “Owned” Referansları (Prologue)

Prologue / skipPrologue’da `owned` listesinde geçen ancak **wardrobe Twee’lerde (dresses, shoes) tanımlı olmayan** ID’ler:

| Item ID | Beklenen kategori | Durum |
|---------|--------------------|--------|
| dress_summer_owned | dresses | Wardrobe dresses’te yok. |
| sandals_owned | shoes | Wardrobe shoes’ta yok. |
| sneakers_flat_owned | shoes | Wardrobe shoes’ta “sneakers_white_owned” var; ID farkı. |
| sneakers_girly_owned | shoes | Wardrobe shoes’ta yok. |

Bu ID’ler oyuncu envanterinde kullanılıyor; wardrobe DB’de karşılığı yoksa giyim sistemi hata verebilir veya item görünmeyebilir. **Öneri:** dress_summer_owned, sandals_owned, sneakers_flat_owned, sneakers_girly_owned için ilgili wardrobe Twee dosyalarında (dresses, shoes) tanım eklenmeli veya prologue owned listesi mevcut wardrobe ID’leriyle senkronize edilmeli.

---

## 6. Değer Tutarsızlıkları (Fiyat / looks / quality) ✅ Uygulandı

Wardrobe-mapping-list referans alınarak aşağıdaki güncellemeler yapıldı.

**StoreShoeA (wardrobeShoes):**
| Item ID | Eski → Yeni (price / looks / tags) |
|---------|-------------------------------------|
| loafers_black_basic | price 45 → 38 |
| heels_block_nude | looks 5→4, price 55→45, tags → ["casual", "elegant"] |

**StoreShoeB (wardrobeShoes):**
| Item ID | Eski → Yeni (price / looks / quality / tags) |
|---------|----------------------------------------------|
| heels_stiletto_black | looks 8→5, tags → ["formal", "elegant"] |
| heels_stiletto_nude | looks 8→5, price 75→72, tags → ["formal", "elegant"] |
| boots_knehigh_black | looks 8→5, tags → ["elegant"] |
| boots_knehigh_brown | looks 7→5, price 160→82, tags → ["elegant"] |
| heels_maryjane_black | looks 5→4, quality Common→Rare, price 60→58, tags → ["elegant"] |
| sandals_stiletto_nude | looks 8→5, price 105→68, tags → ["elegant"] |
| loafers_leather_horsebit | looks 7→4, price 130→65, tags → ["casual", "elegant"] |
| ankle_boots_suede_tan | looks 6→4, price 95→72, tags → ["casual", "elegant"] |
| heels_block_metallic | looks 6→5, price 75→70, tags → ["elegant"] |
| pumps_satin_black | (değişmedi: looks 6, price 80) |

---

## 7. Tag Önerileri (Düzgün Tag’leme) ✅ Uygulandı

Wardrobe-mapping-list ve confidence tier’lara göre aşağıdaki tag güncellemeleri yapıldı:

| Dosya | Item ID | Eski tags | Yeni tags |
|-------|---------|-----------|-----------|
| wardrobeTops | top_wrap_vneck_cream | casual, crop, elegant | **casual, elegant** |
| wardrobeTops | top_cutout_side_white | revealing, casual, sexy | **revealing, casual** |
| wardrobeBottoms | skirt_mini_denim | short, casual, revealing, cute | **short, casual, cute** (revealing kaldırıldı) |
| wardrobeBottoms | skirt_pencil_midi_black | formal, elegant, work, revealing | **formal, elegant, work** (revealing kaldırıldı) |
| wardrobePanties | thong_lace_black | sexy, revealing | **revealing** (fiyat 20→28 mapping’e göre) |

Değiştirilmedi (zaten uygun): bra_sports_low_support_white / bra_sports_strappy (bold), teddy_lace_black (daring), babydoll_lace_black, robe_sheer_lace_trim. **panty_hipster_lace_trim_black** zaten `["casual", "cute"]` ile tanımlı.

---

## 8. Özet – Yapılacaklar

1. **storeSports.twee:** `sneakers_trail_runners` → `sneakers_trail_runners_gray_orange` yap (kritik).
2. **storeClothingA.twee:** `panty_hipster_lace_trim_black` ekle.
3. **wardrobePanties.twee:** `panty_hipster_lace_trim_black` kaydı ekle (Northline Apparel, storeClothingA; image path: pantyHipsterLaceTrimBlack.webp).
4. (Opsiyonel) Prologue owned listesi ile wardrobe’daki dress/shoes ID’lerini eşleştir; eksik dress_summer_owned, sandals_owned, sneakers_flat_owned, sneakers_girly_owned tanımlarını ekle veya referansları güncelle.
5. (Opsiyonel) Fiyat/looks/quality’yi master list ile toplu hizalama.

---

## 9. Eklenebilecek Clothing Listesi (Öneri)

Aşağıdaki itemlar ShopMd / master list’te geçiyor veya mağaza konseptine uygun; henüz shop veya wardrobe’da yok. İstersen sırayla eklenebilir.

### 9.1 StoreClothingA (Northline) – Günlük

| Item ID | Açıklama | Kategori |
|---------|----------|----------|
| shorts_denim_distressed | Yıpranmış denim şort | bottoms |
| (zaten eklenecek) panty_hipster_lace_trim_black | Siyah lace trim hipster | panties |

### 9.2 StoreSports (FastBreak)

| Item ID | Açıklama | Kategori |
|---------|----------|----------|
| sneakers_running_gray | Gri koşu sneaker (master list) | shoes |
| bra_sports_low_support_pink | Pembe düşük destekli spor bralet (master list) | bras |

### 9.3 StoreBags (Luxe Leather) – Master list’te var, shop’ta yok

| Item ID | Açıklama |
|---------|----------|
| backpack_nylon_black | Siyah naylon sırt çantası |
| wallet_bifold_leather | Deri bifold cüzdan |
| duffel_weekend_gray | Gri hafta sonu duffel |

### 9.4 StoreShoeA / StoreShoeB

| Item ID | Açıklama |
|---------|----------|
| (storeShoeA) heels_block_nude fiyat 45’e çekilebilir | Zaten var; sadece fiyat. |

### 9.5 Genel – Yeni fikirler (oyun tonuna göre)

| Item ID (öneri) | Açıklama | Shop |
|-----------------|----------|------|
| top_long_sleeve_thermal | Uzun kollu termal üst | storeClothingA veya Sports |
| skirt_pleated_mini_black | Siyah pileli mini etek | storeClothingB |
| dress_mini_bodycon | Mini bodycon elbise | storeClothingB veya C |
| boots_ankle_suede_black | Siyah süet bilek bot | storeShoeB |
| earrings_hoop_silver | Gümüş halka küpe | storeJewelry |
| necklace_simple_gold | İnce altın kolye | storeJewelry |

---

*Rapor sonu. Kritik düzeltmeler (1–3) uygulandığında mall–wardrobe eşleşmesi tamamlanmış olur.*
