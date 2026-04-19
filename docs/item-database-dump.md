# Item database dökümü

Otomatik üretildi: `passages/0 - System/Init/ItemDatabase.twee` içindeki `setup.items` (`scripts/dump_item_database_md.py`).

## Alan özeti

- **usageType**: `direct` | `passage` | `passive`
- **effects**: `[{ stat, value, type, duration? }]` — boş array pasif eşya
- **maxUses**: satın alındığında envanterdeki kullanım adedi (yoksa sınırsız)
- **singleInventory**: `true` ise oyunda yalnızca bir adet

## consumables (6 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| chocolate_bar | Chocolate Bar | consumable | direct | 1.5 |  |  | True | [{"stat": "hunger", "value": -10, "type": "instant"}, {"stat": "mood", "value": 10, "type": "instant"}] | Sweet chocolate treat. Boosts mood instantly. | assets/content/items/consumables/chocolateBar.webp |
| coffee | Coffee | consumable | direct | 2.5 |  |  | True | [{"stat": "energy", "value": 25, "type": "instant"}, {"stat": "focus", "value": 5, "type": "temporary", "duration": 2}] | Freshly brewed coffee. Helps you stay awake and focused. | assets/content/items/consumables/coffee.webp |
| energy_drink | Energy Drink | consumable | direct | 3.5 |  |  | True | [{"stat": "energy", "value": 30, "type": "instant"}, {"stat": "mood", "value": 5, "type": "temporary", "duration": 2}] | A carbonated beverage that provides an instant energy boost. Popular among students. | assets/content/items/consumables/energyDrink.webp |
| apple | Fresh Apple | consumable | direct | 0.75 |  |  | True | [{"stat": "hunger", "value": -20, "type": "instant"}, {"stat": "health", "value": 2, "type": "instant"}] | A healthy snack option. | assets/content/items/consumables/apple.webp |
| sandwich | Sandwich | consumable | direct | 5.5 |  |  | True | [{"stat": "hunger", "value": -40, "type": "instant"}, {"stat": "energy", "value": 10, "type": "instant"}] | A filling sandwich with fresh ingredients. | assets/content/items/consumables/sandwich.webp |
| water_bottle | Water Bottle | consumable | direct | 1.0 |  |  | True | [{"stat": "thirst", "value": -50, "type": "instant"}] | Pure refreshing water. | assets/content/items/consumables/water.webp |

## tools (3 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| laptop | Laptop | tool | passive | 799.0 |  |  | True |  | Portable laptop for work, study, and entertainment. | assets/content/items/tools/laptop.webp |
| umbrella | Umbrella | tool | passive | 12.0 |  |  | False |  | Keeps you dry during rainy weather. | assets/content/items/tools/umbrella.webp |
| webcam | Webcam | tool | passive | 149.0 |  |  | True |  | HD webcam for video calls and streaming. | assets/content/items/tools/webcamHD.webp |

## equipment (1 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| yoga_mat | Yoga Mat | equipment | passive | 24.0 |  |  | True |  | A non-slip yoga mat for practicing yoga at home or in the park. | assets/content/items/global/yogaMat.webp |

## cosmetics (8 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| comb | Comb | cosmetic | passage | 5.0 |  | True | True |  | A simple comb for brushing your hair. Unlimited use. | assets/content/items/cosmetics/comb.webp |
| face_cream | Face Cream | cosmetic | passage | 15.0 | 30 |  | True |  | Skincare cream for healthy, clear skin. 30 applications per bottle. | assets/content/items/cosmetics/faceCream.webp |
| hair_cream | Hair Cream | cosmetic | passage | 15.0 | 30 |  | True |  | Hair care cream for healthy, shiny hair. 30 applications per bottle. | assets/content/items/cosmetics/hairCream.webp |
| makeup_kit | Makeup Kit | cosmetic | passage | 35.0 | 30 |  | True | [{"stat": "looks", "value": 5, "type": "temporary", "duration": 4}] | Basic cosmetic set for daily use. Use at a mirror. | assets/content/items/cosmetics/makeupKit.webp |
| perfume | Perfume | cosmetic | direct | 60.0 | 30 |  | True | [{"stat": "charisma", "value": 3, "type": "temporary", "duration": 6}] | Designer fragrance that boosts confidence. Can be applied anytime. | assets/content/items/cosmetics/perfume.webp |
| portable_makeup | Portable Makeup | cosmetic | passage | 50.0 | 30 |  | True | [{"stat": "looks", "value": 5, "type": "temporary", "duration": 4}] | Portable makeup set for daily use. Use at a mirror. | assets/content/items/cosmetics/portableMakeup.webp |
| toothpaste | Toothpaste | cosmetic | passage | 5.0 | 30 |  | True |  | Toothpaste for daily dental care. 30 uses per tube. | assets/content/items/cosmetics/toothpaste.webp |
| wet_wipes | Wet Wipes | cosmetic | passage | 6.0 | 30 |  | True |  | Cleansing wipes to remove makeup. | assets/content/items/cosmetics/wetWipes.webp |

## books (21 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| book_from_scratch | From Scratch | reading | passage | 16.99 |  |  | True |  | Kitchen basics, knife skills, and fundamental cooking techniques. | assets/content/items/books/book_from_scratch.webp |
| book_how_to_find_anything | How to Find Anything | reading | passage | 13.99 |  |  | True |  | A beginner's guide to source evaluation, search strategy, and organizing information. | assets/content/items/books/book_how_to_find_anything.webp |
| book_just_talk | Just Talk | reading | passage | 12.99 |  |  | True |  | Foundational small talk and conversation skills for everyday social situations. | assets/content/items/books/book_just_talk.webp |
| book_letters_never_sent | Letters Never Sent | reading | passage | 10.99 |  |  | True |  | A literary fiction about unsent letters and unspoken feelings. | assets/content/items/books/book_letters_never_sent.webp |
| book_level_up | Level Up | reading | passage | 14.99 |  |  | True |  | Game theory basics, resource management, and decision-making under pressure. | assets/content/items/books/book_level_up.webp |
| book_mastering_connection | Mastering Connection | reading | passage | 36.99 |  |  | True |  | Deep listening, authentic presence, and cross-cultural communication. | assets/content/items/books/book_mastering_connection.webp |
| book_mastery_kitchen | Mastery in the Kitchen | reading | passage | 44.99 |  |  | True |  | Flavor science, restaurant-quality execution, and original recipe creation. | assets/content/items/books/book_mastery_kitchen.webp |
| book_mind_unlocked | Mind Unlocked | reading | passage | 39.99 |  |  | True |  | Systems thinking and multi-variable analysis for complex problems. | assets/content/items/books/book_mind_unlocked.webp |
| book_never_back_down | Never Back Down | reading | passage | 22.99 |  |  | True |  | Intermediate negotiation and high-stakes persuasion. | assets/content/items/books/book_never_back_down.webp |
| book_pro_gamer_mindset | Pro Gamer Mindset | reading | passage | 23.99 |  |  | True |  | Competitive psychology, tilt control, and team dynamics. | assets/content/items/books/book_pro_gamer_mindset.webp |
| book_source_and_truth | Source & Truth | reading | passage | 24.99 |  |  | True |  | Media literacy, bias detection, and building a personal research system. | assets/content/items/books/book_source_and_truth.webp |
| book_stillwater | Stillwater | reading | passage | 11.99 |  |  | True |  | A quiet guide to stoic living and present-moment thinking. | assets/content/items/books/book_stillwater.webp |
| book_competitive_edge | The Competitive Edge | reading | passage | 34.99 |  |  | True |  | High-level strategy, opponent modeling, and mastery mindset. | assets/content/items/books/book_competitive_edge.webp |
| book_curious_mind | The Curious Mind | reading | passage | 15.99 |  |  | True |  | Pop science exploring everyday physics, habits, and the edges of knowledge. | assets/content/items/books/book_curious_mind.webp |
| book_information_age | The Information Age | reading | passage | 42.99 |  |  | True |  | Advanced information architecture and analytical frameworks. | assets/content/items/books/book_information_age.webp |
| book_kitchen_manual | The Kitchen Manual | reading | passage | 24.99 |  |  | True |  | Intermediate techniques: braising, emulsification, and pan sauces. | assets/content/items/books/book_kitchen_manual.webp |
| book_lateral_mind | The Lateral Mind | reading | passage | 22.99 |  |  | True |  | Reframing problems and lateral thinking techniques. | assets/content/items/books/book_lateral_mind.webp |
| book_power_of_words | The Power of Words | reading | passage | 38.99 |  |  | True |  | Advanced linguistic strategy and authentic influence. | assets/content/items/books/book_power_of_words.webp |
| book_quiet_pitch | The Quiet Pitch | reading | passage | 14.99 |  |  | True |  | A beginner's guide to persuasion through listening and framing. | assets/content/items/books/book_quiet_pitch.webp |
| book_social_blueprint | The Social Blueprint | reading | passage | 21.99 |  |  | True |  | Intermediate guide to group dynamics and social navigation. | assets/content/items/books/book_social_blueprint.webp |
| book_think_it_through | Think It Through | reading | passage | 13.99 |  |  | True |  | Root cause analysis, brainstorming frameworks, and decision-making for everyday problems. | assets/content/items/books/book_think_it_through.webp |

## magazines (8 kayıt)

| id | name | category | usageType | price | maxUses | singleInventory | hasTooltip | effects | desc | image |
|---|---|---|---|---|---|---|---|---|---|---|
| mag_creative_pulse | Creative Pulse | reading | passage | 3.6 |  |  | True |  | Creative inspiration and visual thinking. Single use. | assets/content/items/magazines/mag_creative_pulse.webp |
| mag_green_corner | Green Corner | reading | passage | 3.0 |  |  | True |  | Beginner plant care and gardening routines. Single use. | assets/content/items/magazines/mag_green_corner.webp |
| mag_home_flavors | Home Flavors | reading | passage | 4.0 |  |  | True |  | Quick recipes and kitchen tricks. Single use. | assets/content/items/magazines/mag_home_flavors.webp |
| mag_inner_drive | Inner Drive | reading | passage | 3.6 |  |  | True |  | Discipline and consistency strategies. Single use. | assets/content/items/magazines/mag_inner_drive.webp |
| mag_makeup_studio | Makeup Studio | reading | passage | 3.75 |  |  | True |  | Makeup techniques for daily looks. Single use. | assets/content/items/magazines/mag_makeup_studio.webp |
| mag_small_talk | Small Talk Weekly | reading | passage | 3.25 |  |  | True |  | Conversation tactics and social flow tips. Single use. | assets/content/items/magazines/mag_small_talk.webp |
| mag_social_edge | Social Edge | reading | passage | 3.75 |  |  | True |  | Persuasion and negotiation style tips. Single use. | assets/content/items/magazines/mag_social_edge.webp |
| mag_think_quick | Think Quick | reading | passage | 3.5 |  |  | True |  | Problem-solving focused issue. Single use. | assets/content/items/magazines/mag_think_quick.webp |
