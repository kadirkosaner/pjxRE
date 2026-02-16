# New Klasörü – Wardrobe Mapping Listesi

*`New/` altındaki webp dosyalarının wardrobe sistemi için tag, slot ve değer eşlemesi.*

**Wardrobe template:** `{ id, name, brand, desc, image, looks, quality, tags, price, shopAvailable, startOwned }`

**Global tag referansı:** `clothing-confidence-tiers.md` (crop, short, revealing, daring, bold, erotic, lewd)

---

## Slot → Kategori Haritası

| Slot | setup.clothingData key | WardrobeConfig |
|------|------------------------|----------------|
| top | tops | Tops |
| bottom | bottoms | Bottoms |
| dress | dresses | Dresses |
| shoes | shoes | Shoes |
| socks | socks | Socks |
| coat | coats | Coats |
| bag | bags | Bags |
| earrings | earrings | Earrings |
| necklace | necklaces | Necklaces |
| bracelet | bracelets | Bracelets |
| bra | bras | Bras |
| panty | panties | Panties |
| sleepwear | sleepwear | Sleepwear |
| garter | garter | Garter |
| apron | apron | Apron |

*Not: Ring (yüzük) wardrobe'da slot yok – Jewelry mağazasında item olarak kalabilir veya bracelet'e benzer şekilde eklenebilir.*

---

## 1. storeBags (8 webp) → `bags`

| Webp | Item ID | Tags | looks | quality | price | Not |
|------|---------|------|-------|---------|-------|-----|
| handbagToteLeatherBlack.webp | handbag_tote_leather_black | casual | 4 | Common | 45 | Siyah deri tote |
| handbagToteCanvas.webp | handbag_tote_canvas | casual | 3 | Common | 25 | Canvas tote |
| backpackLeatherBrown.webp | backpack_leather_brown | casual | 4 | Rare | 55 | Kahverengi deri sırt çantası |
| crossbodySmallChain.webp | crossbody_small_chain | casual, elegant | 4 | Common | 35 | Zincir askılı crossbody |
| clutchEveningGold.webp | clutch_evening_gold | formal, elegant | 5 | Rare | 50 | Gece clutcu |
| clutchEveningSilver.webp | clutch_evening_silver | formal, elegant | 5 | Rare | 50 | Gece clutcu (gümüş) |
| wristletClutch.webp | wristlet_clutch | casual, elegant | 3 | Common | 28 | Bilek clutcu |
| bucketBagTan.webp | bucket_bag_tan | casual | 4 | Common | 40 | Ten kova çanta |

*Eksik (storeBags.md'de var, New'da yok): backpack_nylon_black, wallet_bifold_leather, duffel_weekend_gray*

---

## 2. storeClothingA (16 webp)

### tops
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| teeBasicWhiteCotton.webp | tee_basic_white_cotton | casual | 3 | Common | 15 |
| cropTeeBlackRelaxed.webp | crop_tee_black_relaxed | crop, casual | 4 | Common | 22 |
| cropTeeWhite.webp | crop_tee_white | crop, casual | 4 | Common | 20 |
| topOffshoulderStriped.webp | top_offshoulder_striped | crop, casual | 4 | Common | 24 |
| topWrapVneckCream.webp | top_wrap_vneck_cream | casual, elegant | 4 | Common | 26 |
| hoodieOversizeGray.webp | hoodie_oversize_gray | casual | 3 | Common | 28 |

### bottoms
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| jeansSlimBlueHighrise.webp | jeans_slim_blue_highrise | casual | 4 | Common | 35 |
| pantBlack.webp | pant_black | casual | 3 | Common | 30 |
| leggingsBlackBasic.webp | leggings_black_basic | casual | 3 | Common | 20 |
| skirtMiniDenim.webp | skirt_mini_denim | short, casual | 4 | Common | 28 |

### dresses
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| dressSundressFloral.webp | dress_sundress_floral | casual | 4 | Common | 38 |
| dressMidiShirtdress.webp | dress_midi_shirtdress | casual | 4 | Common | 42 |
| dressElegant.webp | dress_elegant | casual, elegant | 5 | Common | 45 |

### bras
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| braBasicBlackCotton.webp | bra_basic_black_cotton | casual | 3 | Common | 18 |

### panties
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| pantyBriefBlackCotton.webp | panty_brief_black_cotton | casual | 3 | Common | 12 |
| pantyHipsterLaceTrimBlack.webp | panty_hipster_lace_trim_black | casual | 4 | Common | 16 |

---

## 3. storeClothingB (16 webp)

### tops
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| blazerCroppedBlack.webp | blazer_cropped_black | casual, elegant | 5 | Rare | 65 |
| blazerCroppedSinglebreastBlack.webp | blazer_cropped_singlebreast_black | casual, elegant | 5 | Rare | 68 |
| blazerCroppedSinglebreastNavy.webp | blazer_cropped_singlebreast_navy | casual, elegant | 5 | Rare | 68 |
| blouseSilkLikeCream.webp | blouse_silk_like_cream | casual, elegant | 5 | Rare | 48 |
| cropShoulder.webp | crop_shoulder | crop, casual | 4 | Common | 32 |
| cropSweaterKnitOatmeal.webp | crop_sweater_knit_oatmeal | crop, casual | 5 | Rare | 45 |
| topCutoutSideWhite.webp | top_cutout_side_white | revealing, casual | 5 | Rare | 42 |
| topWrapVneck.webp | top_wrap_vneck | casual, elegant | 4 | Rare | 40 |
| vestFauxleatherBlack.webp | vest_fauxleather_black | casual | 4 | Rare | 52 |

### bottoms
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| pantsPaperbagBeige.webp | pants_paperbag_beige | casual, elegant | 5 | Rare | 55 |
| pantWideCream.webp | pant_wide_cream | casual, elegant | 4 | Rare | 48 |
| skirtMiniAlineBlack.webp | skirt_mini_black_aline | short, casual, elegant | 5 | Rare | 42 |
| skirtMiniPlaid.webp | skirt_mini_plaid | short, casual | 4 | Rare | 38 |
| skirtMiniPlaidScotchRed.webp | skirt_mini_plaid_scotch_red | short, casual | 4 | Rare | 40 |

### dresses
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| dressMidiWrapFloral.webp | dress_midi_wrap_floral | casual, elegant | 5 | Rare | 62 |
| jumpsuitWidelegBlack.webp | jumpsuit_wideleg_black | casual, elegant | 5 | Rare | 72 |

---

## 4. storeClothingC (12 webp)

### tops
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| blazerStructuredNavy.webp | blazer_structured_navy | formal, elegant | 6 | Premium | 95 |
| blousePrintedFloral.webp | blouse_printed_floral | formal, elegant | 5 | Premium | 65 |

### bottoms
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| trousersSuitNavy.webp | trousers_suit_navy | formal, elegant | 6 | Premium | 85 |
| trousersWidelegNavy.webp | trousers_wideleg_navy | formal, elegant | 6 | Premium | 82 |
| skirtPencilMidiBlack.webp | skirt_pencil_midi_black | formal, elegant | 6 | Premium | 78 |

### dresses
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| dressCocktailBlack.webp | dress_cocktail_black | formal, elegant | 6 | Premium | 110 |
| dressMaxiFlowing.webp | dress_maxi_flowing | formal, elegant | 6 | Premium | 98 |
| dressMidiSilkBlendNavy.webp | dress_midi_silk_blend_navy | formal, elegant | 6 | Premium | 105 |
| dressBackCutoutLbd.webp | dress_back_cutout_lbd | revealing, formal, elegant | 7 | Premium | 115 |

### coats
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| coatWoolBlendBlack.webp | coat_wool_blend_black | formal, elegant | 6 | Premium | 140 |
| coatSoftCream.webp | coat_soft_cream | elegant | 5 | Premium | 125 |
| trenchCoatKhaki.webp | trench_coat_khaki | casual, elegant | 5 | Premium | 118 |

---

## 5. storeShoeA (10 webp)

### shoes
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| sneakersWhiteLowtop.webp | sneakers_white_lowtop | casual | 3 | Common | 35 |
| sneakersBlackCanvas.webp | sneakers_black_canvas | casual | 3 | Common | 32 |
| sneakersPlatformWhite.webp | sneakers_platform_white | casual | 4 | Common | 42 |
| flatsBalletBlack.webp | flats_ballet_black | casual | 3 | Common | 28 |
| sandalsFlatStrap.webp | sandals_flat_strap | casual | 3 | Common | 25 |
| bootsAnkleBlack.webp | boots_ankle_black | casual | 4 | Common | 48 |
| heelsBlockNude.webp | heels_block_nude | casual, elegant | 4 | Common | 45 |
| loafersBlackBasic.webp | loafers_black_basic | casual | 3 | Common | 38 |

### socks
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| socksAnkleWhite.webp | socks_ankle_white | casual | 2 | Common | 8 |
| socksAnkleBlack.webp | socks_ankle_black | casual | 2 | Common | 8 |

---

## 6. storeShoeB (10 webp) → `shoes`

| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| heelsStilettoBlack.webp | heels_stiletto_black | formal, elegant | 5 | Rare | 75 |
| heelsStilettoNude.webp | heels_stiletto_nude | formal, elegant | 5 | Rare | 72 |
| bootsKnehighBlack.webp | boots_knehigh_black | elegant | 5 | Rare | 85 |
| bootsKnehighBrown.webp | boots_knehigh_brown | elegant | 5 | Rare | 82 |
| heelsMaryjaneBlack.webp | heels_maryjane_black | elegant | 4 | Rare | 58 |
| sandalsStilettoNude.webp | sandals_stiletto_nude | elegant | 5 | Rare | 68 |
| loafersLeatherHorsebit.webp | loafers_leather_horsebit | casual, elegant | 4 | Rare | 65 |
| pumpsSatinBlack.webp | pumps_satin_black | formal, elegant | 6 | Rare | 80 |
| ankleBootsSuedeTan.webp | ankle_boots_suede_tan | casual, elegant | 4 | Rare | 72 |
| heelsBlockMetallic.webp | heels_block_metallic | elegant | 5 | Rare | 70 |

---

## 7. storeJewelry (11 webp)

### earrings
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| earringsHoopGold.webp | earrings_hoop_gold | casual | 3 | Common | 25 |
| earringsStudPearl.webp | earrings_stud_pearl | elegant | 4 | Rare | 35 |
| earringsDangleCrystal.webp | earrings_dangle_crystal | elegant | 4 | Rare | 42 |

### necklaces
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| necklaceChokerVelvetDrop.webp | necklace_choker_velvet_drop | casual | 4 | Common | 28 |
| necklaceChokerVelvetHalfmoon.webp | necklace_choker_velvet_halfmoon | casual | 4 | Common | 30 |
| necklacePendantSilver.webp | necklace_pendant_silver | casual, elegant | 4 | Rare | 38 |
| necklaceLayerGold.webp | necklace_layer_gold | elegant | 4 | Rare | 45 |

### bracelets
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| braceletBangleSilver.webp | bracelet_bangle_silver | casual | 3 | Common | 22 |
| braceletCharm.webp | bracelet_charm | casual | 3 | Common | 28 |

### ring (wardrobe slot YOK – opsiyonel/item)
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| ringStackGold.webp | ring_stack_gold | casual | 3 | Common | 35 |
| ringStatementCrystal.webp | ring_statement_crystal | elegant | 4 | Rare | 45 |

---

## 8. storeLingerieA (11 webp)

### bras
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| braTshirtNude.webp | bra_tshirt_nude | casual | 3 | Common | 22 |
| braDemiBlack.webp | bra_demi_black | casual | 4 | Common | 26 |
| braLaceIvory.webp | bra_lace_ivory | casual | 4 | Rare | 32 |
| braBraletteLaceBlack.webp | bra_bralette_lace_black | casual | 4 | Rare | 35 |
| braMatchingRose.webp | bra_matching_rose | casual | 4 | Rare | 38 |

### panties
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| pantyBriefCottonBlack.webp | panty_brief_cotton_black | casual | 3 | Common | 14 |
| pantyHipsterLaceNude.webp | panty_hipster_lace_nude | casual | 4 | Common | 18 |
| pantyBoyshortCharcoal.webp | panty_boyshort_charcoal | casual | 3 | Common | 20 |
| thongLaceBlack.webp | thong_lace_black | revealing | 5 | Rare | 28 |
| pantyMatchingRose.webp | panty_matching_rose | casual | 4 | Rare | 36 |

### sleepwear
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| slipSatinBlack.webp | slip_satin_black | sleepwear, elegant | 5 | Rare | 42 |

---

## 9. storeLingerieB (13 webp)

### bras
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| braLaceBlackMatching.webp | bra_lace_black_matching | revealing, elegant | 5 | Premium | 55 |
| braLaceRedMatching.webp | bra_lace_red_matching | revealing, elegant | 5 | Premium | 55 |
| braStrappySilver.webp | bra_strappy_silver | bold | 6 | Premium | 62 |

### panties
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| pantyLaceBlackMatching.webp | panty_lace_black_matching | revealing, elegant | 5 | Premium | 45 |
| pantyLaceRedMatching.webp | panty_lace_red_matching | revealing, elegant | 5 | Premium | 45 |
| pantyStrappySilver.webp | panty_strappy_silver | bold | 6 | Premium | 50 |

### sleepwear
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| bodysuitLaceBlack.webp | bodysuit_lace_black | revealing | 6 | Premium | 75 |
| bodysuitSilkCream.webp | bodysuit_silk_cream | elegant | 5 | Premium | 68 |
| babydollLaceBlack.webp | babydoll_lace_black | sleepwear, revealing | 6 | Premium | 65 |
| teddyLaceBlack.webp | teddy_lace_black | revealing, daring | 7 | Premium | 72 |
| chemiseSilkChampagne.webp | chemise_silk_champagne | sleepwear, elegant | 5 | Premium | 58 |
| robeSheerLaceTrim.webp | robe_sheer_lace_trim | sleepwear, revealing, elegant | 6 | Premium | 70 |

### garter
| Webp | Item ID | Tags | looks | quality | price |
|------|---------|------|-------|---------|-------|
| garterBeltBlack.webp | garter_belt_black | revealing | 6 | Premium | 55 |

---

## 10. storeElectronics (2 webp)

*Wardrobe’da slot yok – item/cosmetic benzeri. Mall’da satılır ama kıyafet değil.*

| Webp | Item ID | Not |
|------|---------|-----|
| laptop.webp | laptop | Mall item, wardrobe dışı |
| webcamHd.webp | webcam_hd | Mall item, wardrobe dışı |

---

## Özet – Image Path Formatı

```text
assets/content/clothing/{category}/{subcategory}/{filename}.webp
```

Örnek:
- `assets/content/clothing/bags/storeBags/handbagToteLeatherBlack.webp`
- veya mevcut yapıya uygun: `New/storeBags/handbagToteLeatherBlack.webp` → taşındıktan sonra `assets/content/clothing/bags/handbagToteLeatherBlack.webp`

---

## Twee Entegrasyonu İçin

Her kategori için `wardrobeX.twee` dosyasına eklenecek format:

```javascript
{
    id: "item_id_snake_case",
    name: "Display Name",
    brand: "Brand Name",
    desc: "Short description.",
    image: "assets/content/clothing/{cat}/{filename}.webp",
    looks: 4,
    quality: "Common",  // Common | Rare | Premium
    tags: ["casual", "elegant"],
    price: 45.00,
    shopAvailable: true,
    startOwned: false
}
```

---

*Oluşturulma: Şubat 2025 – wardrobeConfig, clothing-confidence-tiers, ShopMd referans alındı.*
