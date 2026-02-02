# Passage, Decay, Item, Skill/Stat ve Widget Tarama Raporu

Bu belge tüm passage’lar, decay olayları, item kullanımları, skill/stat sistemi, widget’lar ve Init sayfalarının detaylı taramasını içerir.

---

## 1. INIT SAYFALARI (Özet ve Detay)

### 1.1 `passages/0 - System/Init/`

| Dosya | Amaç |
|-------|------|
| **variablesBase.twee** | Oyun bilgisi (setup.gameName, gameVersion), UI visibility ($hideTopbar, $hideRightbar…), topbar/rightbar notification değişkenleri ($notificationEnergy, $notificationFace…), $daily (yogaDone, danceDone, jogDone), $alarm, $flags, $importantDates, setup.schoolCalendar (tatil dönemleri). |
| **variablesTime.twee** | $timeSys (year, month, day, hour, minute, weekday), $timeConfig (monthNames, monthDays, weekdayNames, periods). $timeSysYear backward compatibility. |
| **variablesSettings.twee** | $gameSettings: trackHunger/Thirst/Bladder, trackCalories, hygieneRequirement, hairGrowth, hairMessiness, bodyHairGrowth, makeupWearOff, bodyDegradation, **hairCareDecay, faceCareDecay, dentalCareDecay**, skillDecay, relationshipDecay. videoSettings (script). $contentPreferences (14 içerik kategorisi). |
| **variablesMap.twee** | setup.mapRegions (id, mapImage, desc, color, x, y), setup.mapLocations (structureType, category, residents, taxiCost, x, y), setup.locationHours (open/close/region veya open24h), $taxiBaseFare, setup.imageMap. |
| **variablesNavigation.twee** | setup.navCards (name, passage), setup.locations (parent, type). Travel time: room↔room 1 dk, building 5 dk, district 15 dk. setup.getDistrict, setup.getBuilding, setup.getTravelTime. |
| **variablesPeople.twee** | $characters = {}, setup.relationGroups, setup.schedules, setup.characterActions. |
| **variablesDiscovery.twee** | $discovered* (her lokasyon için true/false). Başlangıçta sadece FamilyHouse ve iç odalar discovered; maplewood mahalle ve diğer bölgeler false. |
| **variablesImage.twee** | setup.imageProfile, setup.playerAppearanceImages (saç/bust/hip/body type path’leri). |
| **variablesImageLocation.twee** | setup.locationImages: tüm lokasyonlar için arka plan resim path’leri (121 lokasyon). |
| **DurationPresets.twee** | setup.durationPresets: tvDuration, gamingDuration, readingDuration, sleepDuration, napDuration, shortActivity, mediumActivity, workoutDuration, yogaDuration, showerDuration, bathDuration. |
| **ReputationInit.twee** | setup.regionConnections, setup.reputationCategories, setup.reputationTiers, setup.regionInfo, $reputation (bölge×kategori skorları), $globalReputation. |
| **ItemDatabase.twee** | setup.items: consumables (energy_drink, coffee, sandwich, water_bottle, chocolate_bar, apple, beer), gifts (flowers_roses, chocolate_box, teddy_bear), academic (notebook, math_textbook), tools (headphones, umbrella), **cosmetics** (makeup_kit, portable_makeup, perfume, skincare_set). Her item: id, name, category, usageType (direct/passage/passive), desc, price, image, effects, hasTooltip. **Kullanım sayacı (20 kullanım) yok; tarak, diş macunu, saç/vücut kremi yok.** |
| **characters/charPlayer.twee** | $player (firstName, eyeColor, hairColor…), $appearance (hairLengthCm, tanLevel, makeupLevel, hairMessiness, nailPolish, hairStyle, bodyHair, **hairCare, faceCare, dentalCare**), $plasticSurgery, $bodyChanges, $body (height, weight, bust, waist, hips, muscleMass, bodyFat, appeal, bmi, bodyType), $energy, $mood, $hygiene, $health, $stress, $arousal, para (moneyEarn/Spend/Balance, bank…), $hunger/$thirst/$bladder, mental/social/physical stats, $beauty, $looks, $clothingScore, $corruption, $painTolerance, $exhibitionism, $obedience, $sexual (skills, virginity, counts…), $skills (mental, social, physical, creative, technical, practical), $statMultipliers, $skillMultipliers, $skillUsageTracking (decay için), $inventory = [], $shoppingCart = [], $wardrobe. |
| **characters/charMother.twee** | Anne karakter verisi (schedule, relationship vb.). |
| **characters/charFather.twee** | Baba karakter verisi. |
| **characters/charBrother.twee** | Kardeş karakter verisi. |
| **characters/charMarcus[CornerShop].twee** | Marcus (dükkan) karakter verisi. |

**Önemli:** Oyun ayarlarındaki decay toggles (hairCareDecay, faceCareDecay, dentalCareDecay, skillDecay, relationshipDecay) burada tanımlı; widget’lar bu bayraklara bakıyor.

---

## 2. DECAY OLAYLARI

### 2.1 Günlük tetikleyici: `<<advanceDay>>` (TimeWidgets.twee)

- **Çağrı yeri:** `<<advanceTime>>` içinde saat 24’ü geçince `<<advanceDay _days>>`.
- **Yaptıkları:**
  - Tarih ilerlemesi (day, weekday, month, year).
  - **Skill decay:** `$gameSettings.skillDecay` ise `<<applySkillDecay>>`.
  - **Kalori/kilo:** `$gameSettings.trackCalories` ise `<<updateWeight>>`, `$dailyCalorieIntake = 0`.
  - `$dailyExercise = 0`, `<<resetFamilyMeals>>`.
  - **Günlük aktivite sıfırlama:** `$daily.yogaDone`, `$daily.danceDone`, `$daily.jogDone` = false.
  - **Appearance:** `<<dailyAppearanceUpdate>>` (_days kez).

### 2.2 `<<dailyAppearanceUpdate>>` (systemWidgets.twee)

- **Çağrı yeri:** Sadece `<<advanceDay>>` içinde.
- **Yaptıkları (hepsi $gameSettings’e bağlı):**
  - **hairGrowth:** `$appearance.hairLengthCm += 0.04`.
  - **hairMessiness:** `$appearance.hairMessiness = min(100, +15)`.
  - **bodyHairGrowth:** legs/pubic/armpits +5 (max 100).
  - **makeupWearOff:** `$appearance.makeupLevel = max(0, -20)`.
  - **hairCareDecay:** `$appearance.hairCare = max(0, (hairCare||100) - 4)`.
  - **faceCareDecay:** `$appearance.faceCare = max(0, (faceCare||100) - 4)`.
  - **dentalCareDecay:** `$appearance.dentalCare = max(0, (dentalCare||100) - 4)`.

### 2.3 `<<applySkillDecay>>` (SkillDecay.twee)

- **Çağrı yeri:** `<<advanceDay>>` içinde ($gameSettings.skillDecay).
- **Mantık:** Kategori bazlı “kaç günde -1” (mental/technical 10, social/creative 7, physical/practical 5). Son kullanım `$skillUsageTracking[category][skillName]` (gün numarası). 7 günden az süre geçtiyse decay yok. Süre geçtiyse seviyeye göre çarpan (düşük seviye daha hızlı decay). Eşik aşılırsa puan düşürülüyor, notifyWarning.
- **Kullanım kaydı:** `<<gainSkill>>` içinde `<<trackSkillUsage category skillName>>` çağrılıyor.

### 2.4 Haftalık / diğer

- **weeklyBodyUpdate** (systemWidgets.twee): bodyDegradation ise `$body.muscleMass -= 0.5` (min 20). **Not:** Bu widget tanımlı ama `<<advanceDay>>` veya başka yerde çağrılıp çağrılmadığı kodda görülmedi; ileride haftalık ilerleme varsa bağlanabilir.
- **updateWeight** (BodySystem.twee): `<<advanceDay>>` içinde (trackCalories). Günlük kalori dengesine göre kilo artış/azalış, bodyFat/muscleMass güncellemesi, recalculateBodyType.

**Özet:** Decay zinciri: **advanceTime** → saat 24+ → **advanceDay** → skillDecay → applySkillDecay; trackCalories → updateWeight; **dailyAppearanceUpdate** (saç/face/diş care -4, makeup -20, hair growth/messiness, body hair).

---

## 3. ITEM KULLANIMLARI

### 3.1 Envanter ve mağaza

- **$inventory:** `[{ id, quantity }, ...]` (charPlayer). **Kullanım sayacı (maxUses/usesLeft) yok.**
- **$shoppingCart:** `[{ id, quantity, price }, ...]` geçici sepet.
- **setup.items:** ItemDatabase + QuestItems ile genişliyor (questItems: quest_milk, quest_bread). Kategoriler: consumables, gifts, academic, tools, cosmetics, questItems.

### 3.2 Widget’lar (ShopWidgets.twee)

| Widget | Açıklama |
|--------|----------|
| getItem | ID ile setup.items’tan item bulur, _item set eder. |
| getItemsByIds | ID listesi → _shopItems dizisi. |
| addToCart / removeFromCart / updateCartQty | Sepet işlemleri. |
| getCartTotal | _cartTotal. |
| clearCart | Sepeti boşaltır. |
| checkoutCash / checkoutCard | Ödeme; başarılıysa sepettekileri addToInventory, clearCart. |
| addToInventory | id + quantity; zaten varsa quantity artar. |
| removeFromInventory | id + quantity; 0 olunca listeden çıkar (deleteAt). |
| useItem | **Sadece consumable.** Envanterde var mı bakar, _item.category === "consumable" ise effects (instant) uygular, removeFromInventory(id, 1). **Passage/cosmetic item kullanımı yok.** |

### 3.3 Kontrol ve aksiyonlarda kullanım

- **checkInventoryItem** (ClothingCheckWidgets.twee): `<<checkInventoryItem "yoga_mat">>` veya `<<checkInventoryItem "itemId" minQuantity>>`. Sonuç: State.temporary.inventoryCheckResult { allowed, reason, hasItem, currentQuantity }.
- **activityButton:** requirements string’de `item:yoga_mat` ile checkInventoryItem çağrılıyor; allowed değilse kilitli buton + tooltip.
- **Character modal (character.js):** Envanter sekmesi setup.items + $inventory ile listeliyor; usageType === 'direct' ise “Use” butonu, useInventoryItem(itemId) → effects uygulayıp quantity 1 düşürüyor. **Sadece direct/consumable.**

**Eksikler:**  
- Cosmetics/passage item’ların “kullanım”ı (makyaj kiti 1 kullanım, tarak vb.) passage içinde **consume** edilmiyor.  
- 20 kullanımlık makyaj kiti (quantity = kalan kullanım veya ayrı usesLeft) yok.  
- Tarak, diş macunu, saç bakım kremi, vücut bakım kremi setup.items’ta tanımlı değil.

---

## 4. SKILL VE STAT SİSTEMİ

### 4.1 Stat hesaplama (StatCalculator.twee)

- **recalculateStats:**  
  - updateBodyMeasurements, fitness = (upperBody+core+lowerBody+cardio)/4, clothingScore (setup.calculateTotalLooks), health clamp, energyMax (fitness’a göre), calculateBodyAppeal, **beauty** (fitness, body.appeal, faceCare, hairCare, dentalCare; face+dental düşükse ceza), **looks** = beauty×0.55 + hygiene×0.15 + clothingScore×0.30, confidence, tüm stat/need/skill clamp’lar, recalculateBodyType, updateTimedEvents, **topbar notification** (energy, bed, health, mood, arousal, bladder, thirst, hunger, **notificationFace / notificationFaceText** (hair/face/dental < 25)), mood/energy uyarıları.
- **gainStat** ("statName", amount, optional "characterId"): Player stat ise multiplier (statMultipliers, fitness için fitness multiplier), clamp, queueStatChange. Character ise gainCharacterStat.
- **loseStat** ("statName", amount, optional "characterId"): Aynı mantık, character ise loseCharacterStat.
- **gainSkill** (category, skillName, amount): skillMultipliers, clamp 0–100, notifySkillChange, **trackSkillUsage** (decay için). Fiziksel skill’ler için stat bonusu (dance→cardio/core/lowerBody, yoga→core/lowerBody, basketball/volleyball/football/swimming). Mental→intelligence, social→charisma, creative→creativity, technical→focus, practical→willpower (yüzde 10).
- **loseSkill** (category, skillName, amount): Sadece düşürme + notify.
- **gainSexualSkill** (skillName, amount): $sexual.skills, sensitivity multiplier, experience artışı.
- **applyTrait:** Prologue trait; statMultipliers ve skillCategoryMultipliers uygular.
- **getCorruptionLevel:** _corruptionLevel = $corruption.
- **gainCharacterStat / loseCharacterStat:** NPC stat (örn. friendship).
- **getObedienceStatus:** Obedience ile ilgili durum.

### 4.2 Needs ve vücut (NeedsSystem, BodySystem)

- **eatFood(calories, hungerReduction):** dailyCalorieIntake+, hunger- (trackHunger).  
- **burnCalories(calories, hungerIncrease):** dailyCalorieIntake-, hunger+.  
- **increaseHunger/Thirst/Bladder:** advanceTime’da saat başı; yüksek değerde energy/mood/health/focus/stress cezaları.  
- **decreaseHygiene:** advanceTime’da saat başı; düşük hijyende mood/charisma cezası.  
- **decreaseArousal:** Zamanla düşüş.  
- **updateWeight:** advanceDay’de; kalori dengesine göre kilo, bodyFat, muscleMass; recalculateBodyType.

**Özet:** Tüm stat/skill güncellemeleri multiplier + clamp ile; beauty/looks faceCare/hairCare/dentalCare’a bağlı; decay skill ve appearance için ayrı (SkillDecay + dailyAppearanceUpdate).

---

## 5. WIDGET LİSTESİ (Çağrıldıkları / Etkileri)

### 5.1 System / Stat / Time

| Widget | Dosya | Kısa açıklama |
|--------|--------|----------------|
| updateBodyMeasurements | systemWidgets | Bust/hip/waist text→cm, bodyType. |
| calculateBodyAppeal | systemWidgets | BMI, WHR, symmetry → $body.appeal. |
| calculateFitness | systemWidgets | fitness = (upper+core+lower+cardio)/4. |
| calculateLooks | systemWidgets | recalculateStats’a yönlendirir veya fallback beauty+looks. |
| dailyAppearanceUpdate | systemWidgets | Saç/face/diş decay, hair growth, messiness, makeup wear, body hair. |
| weeklyBodyUpdate | systemWidgets | bodyDegradation → muscleMass -0.5. |
| calculateEnergyMax | systemWidgets | energyMax = 100 + fitness/4. |
| discover | systemWidgets | discovered* flag + notifySuccess. |
| recalculateStats | StatCalculator | Tüm türetilmiş stat’lar, notification’lar. |
| gainStat, loseStat | StatCalculator | Player/NPC stat artış/azalış. |
| gainSkill, loseSkill | StatCalculator | Skill + trackSkillUsage (decay). |
| gainSexualSkill | StatCalculator | $sexual.skills + experience. |
| applyTrait | StatCalculator | Prologue trait multiplier’ları. |
| getCorruptionLevel | StatCalculator | $corruption. |
| gainCharacterStat, loseCharacterStat | StatCalculator | NPC stat. |
| getObedienceStatus | StatCalculator | Obedience durumu. |
| getPeriod, formatTime, formatDate, getWeekdayName | TimeWidgets | Zaman/periyot. |
| advanceTime | TimeWidgets | Dakika ekler; saat geçince hunger/thirst/bladder/hygiene/energy, advanceDay, updateTimedEvents, updateCharacterLocations, lokasyon kapanış kontrolü, recalculateStats. |
| advanceDay | TimeWidgets | Gün ilerler; skill decay, updateWeight, resetFamilyMeals, daily reset, dailyAppearanceUpdate. |
| setTime, nextPeriod, showTime | TimeWidgets | Zaman set/gösterim. |
| updateTimedEvents, setTimedEvent, clearTimedEvent | TimeWidgets | Alarm/quest zaman ikonu. |
| updateCharacterLocations | TimeWidgets | NPC lokasyonları schedule’a göre günceller. |

### 5.2 Item / Outfit / Activity

| Widget | Dosya | Kısa açıklama |
|--------|--------|----------------|
| checkInventoryItem | ClothingCheckWidgets | Envanterde item var mı, inventoryCheckResult. |
| checkOutfitStyle | ClothingCheckWidgets | Giyim stili + minLooks, outfitCheckResult. |
| showOutfitCheckError | ClothingCheckWidgets | Hata mesajı + Change Clothes / Back. |
| getOutfitStyleSummary | ClothingCheckWidgets | Özet metin. |
| activityButton | ActivityButtonWidget | Metin + hedef passage + requirements (outfit|item|character|minStat|maxStat) + dailyCheck; kilitli buton tooltip. |
| logDailyActivity, checkDailyActivity | ActivityWidgets | Günlük aktivite log. |
| yogaActions, danceActions, parkActions | ActivityWidgets | Lokasyona göre yoga/dans/park butonları. |
| getItem, getItemsByIds | ShopWidgets | Item lookup. |
| addToCart, removeFromCart, updateCartQty, getCartTotal, clearCart | ShopWidgets | Sepet. |
| checkoutCash, checkoutCard | ShopWidgets | Ödeme + addToInventory. |
| addToInventory, removeFromInventory | ShopWidgets | Envanter ekleme/çıkarma. |
| useItem | ShopWidgets | Sadece consumable: effects + remove 1. |

### 5.3 Body / Needs / Money / Reputation / Quest

| Widget | Dosya | Kısa açıklama |
|--------|--------|----------------|
| recalculateBodyType | BodySystem | BMI + muscle → bodyType. |
| updateWeight | BodySystem | advanceDay’de kalori→kilo. |
| eatFood, burnCalories | NeedsSystem | Kalori + açlık. |
| increaseHunger, increaseThirst, increaseBladder | NeedsSystem | İhtiyaç artışı + cezalar. |
| decreaseHygiene, decreaseArousal | NeedsSystem | Hijyen/arousal düşüşü. |
| earnMoney, spendCash, spendCard, depositBank, withdrawBank | MoneyWidgets | Para. |
| canAffordCash, canAffordCard | MoneyWidgets | Yeterlilik. |
| gainReputation, loseReputation, getRegionOverall, getReputationTier | ReputationWidgets | Bölge itibarı. |
| syncGlobalReputation | ReputationWidgets | Global senkron. |
| gainOpinion, loseOpinion, setOpinionFlag, hasOpinionFlag, getOpinionTier | ReputationWidgets | Karakter görüşü. |
| trackSkillUsage | SkillDecay | Son kullanım günü. |
| applySkillDecay | SkillDecay | Günlük skill decay. |
| initNotificationQueue, queueStatChange, flushNotifications | StatNotifications | Bildirim kuyruğu. |
| notifyStatChange, notifySkillChange | StatNotifications | Stat/skill toast. |
| checkClothingRequirements, checkCommandoRequirement | wardrobeWidget | Giyim/corruption. |
| checkBedroomExit | wardrobeWidget | Çıkış kıyafeti. |
| updateClothesNotification | wardrobeWidget | Kıyafet uyarısı. |
| bathroomEntry | BathroomWidgets | Duşta biri var mı; Mirror yok. |
| bedActions | bedWidgets | Yatak aksiyonları. |
| couchActions | CouchWidgets | Koltuk aksiyonları. |
| initFamilyMeals, resetFamilyMeals, showFamilyMealBtn, canEatWithFamily | FamilyMealsWidgets | Aile yemekleri. |
| addLog, addCertificate | QuestWidgets | Quest log/sertifika. |
| sexScene, sexAct, handjob, isVirgin | SexualWidgets | Seks sahne/akt. |

---

## 6. PASSAGE YAPISI (Klasör Bazlı)

### 6.1 0 - System

- **Init:** Yukarıda listelendi (variables*, ItemDatabase, DurationPresets, ReputationInit, characters).
- **Widgets:** Tüm widget dosyaları; passage değil, sistem kodu.
- **WardrobeSys:** wardrobeConfig, wardrobe* (Bottoms, Bras, Dresses, …), wardrobePlayerState.
- **storyJavaScript.js:** Macro’lar (btn, btnPicker, shop, navMenu, navCard, narrative, vb.), action list (yoga tarzı kilitli butonlar), UI event’leri.

### 6.2 1 - Prologue

- Start[startscreen], GameStart (welcomePage), settingsPage, confirmationPage, prologuePage, earlyYears, childhoodYears, formativeYears, adolescentYears, comingofAge, newhomeEnter, newHome, prologueBedroom, prologueDownstairsAsk, prologueEvening, prologueDinner, prologueNightEnd, nextDayMorning, skipPrologue.

### 6.3 2 - Locations

- **maplewood:** maplewood, FamilyHouse (fhDownstairs, fhUpperstairs, fhBedroom, fhWardrobe, fhKitchen, fhLivingroom, fhBrotherRoom, fhUpperBath, fhDownbath, fhParentsRoom, fhParentsBath, fhBackyard, fhGarage), BedroomExitGuard, fhCouch, mapleChurch, storeCorner, sunsetPark.
- **downTown:** skyline, mall (floorGround/Second/Third, mağaza pasajları), cityHall, nightClub, restaurantDowntown, towerA/B/C, recreationCenter, gym, courtBasketball/Volleyball, bank, hotel, jazzClub, vb.
- **hillcrest:** hillcrest, galleryArt, golfClub (golfCourse, golfRestaurant, golfSpa), streetFifth (barWine, boutiqueA/B/C, restaurantLuxury, salonBeautyFifth).
- **marinaBay:** marinaBay, marina, beach, pier, beachClub, restaurantBeach, beachBar, beachVolleyball, pierIcecream.
- **oldTown:** oldTown, civicCenter (townHall, highSchool, libraryOldtown, hospital, policeStation, postOffice), pharmacy, dinerRubys, shopBarber, shopCoffeeOldtown, storeBook, storeHardware.
- **universityDistrict:** campus, cafeteriaUni, dormsUni, fratHouse, lectureHall, libraryUni, sororityHouse, studentBar.
- **southside:** apartmentComplex, cornerBlock, laundromat, oldFactory, shopPawn, storeLiquor.
- **suburbs:** apartmentsSuburbs, houseCrack, motelSuburbs, thePit, gangTerritory (dealerCorner, wallGraffiti).
- **redLightCenter:** alleyBack, basementEntrance, clubPrivate, motelRedLight, parlorMassage, roomsPrivate, storeAdult, clubStrip, barNeon, barGloryHole.

### 6.4 3 - Interactions

- FamilyHouse: Mother (motherTalk*, talkDatabase/CommonTopics), Father (fatherTalk*, talkDatabase), Brother (brotherTalk*, talkDatabase, showerEncounter_Brother), Mother/Father showerEncounter_*.

### 6.5 4 - Actions

- **maplewood/familyHouse/Bathroom:** useBath, useToilet, washFace.
- **maplewood/familyHouse/Bedroom:** fhBed, runNap, setAlarm, sleep.
- **maplewood/familyHouse/Kitchen:** drinkWater, eatFood, eatWithFamily.
- **maplewood/familyHouse/Livingroom:** fhCouch, nap, runDance, runYoga, runYogaMom, runYogaSolo, watchTV.
- **maplewood/sunsetPark:** parkBench, parkJog, parkYoga.
- **Mirror (4 - Actions/Mirror/):** mirrorMakeup, mirrorMakeupApply, mirrorFaceCare, mirrorDentalCare, mirrorApplyRoutine. **Ana menü pasajı "Mirror" yok;** tüm Back’ler "Mirror"’a gidiyor. **mirrorCombHair (Saçlarını Tara) pasajı yok.**

### 6.6 5 - QuestSystem

- System: QuestItems[INIT], QuestState, QuestDatabase_Base/Main, QuestWidgets, variablesQuests.
- Quests: movingTroubles (quest_*), newBeginnings (quest_new_beginnings_dinner).

### 6.7 6 - Scripts, 7 - Others

- PlayerAppearanceHelper.twee, fastTravelTaxi.twee vb.

---

## 7. KISA ÖZET TABLO

| Konu | Durum |
|------|--------|
| **Decay** | advanceDay → dailyAppearanceUpdate (hair/face/dental -4, makeup -20, growth, messiness), applySkillDecay (kategori + kullanım takibi). Settings’te hepsi toggle. |
| **Item** | addToInventory/removeFromInventory/useItem (sadece consumable). checkInventoryItem activityButton ve passage’larda kullanılıyor. Cosmetics/passage tüketimi ve “X kullanımlık” item yok. |
| **Skill/Stat** | gainStat/loseStat, gainSkill/loseSkill (trackSkillUsage), recalculateStats (beauty, looks, notificationFace). |
| **Widget’lar** | Yukarıdaki tablolarda; Init’te tanımlı değişkenlerle uyumlu. |
| **Init** | variablesBase/Time/Settings/Map/Navigation/People/Discovery/Image/ImageLocation, ItemDatabase, DurationPresets, ReputationInit, charPlayer (+ diğer karakterler). |
| **Mirror** | Alt pasajlar var; ana "Mirror" menü pasajı ve mirrorCombHair yok; item tüketimi yok. |

Bu rapor, Mirror widget ve item/makyaj genişletmelerini planlarken mevcut decay, item ve stat akışını referans almak için kullanılabilir.
