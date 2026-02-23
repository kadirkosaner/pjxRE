# Quest pasajları: Geçen süre ve stat değişimleri

`<<advanceTime N>>` = **N dakika** ilerler.

---

## first_shopping — First Shopping

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_first_shopping_map_scene | 5 | Marcus: known, firstMet, friendship +5. completeQuest. Discover StoreCorner. |

*(go_to_shop: alışveriş, pasaj yok.)*

---

## moving_troubles — Moving Troubles

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_moving_troubles_sounds | 8 | location, Discover SunsetPark |
| quest_moving_troubles_mother_talk | 10 | advanceStage, location fhKitchen |
| quest_moving_troubles_father_news | 15 | advanceStage, location fhKitchen |
| quest_moving_troubles_room_scene | 0 | completeQuest, location fhBedroom |

---

## new_beginnings — New Beginnings

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_new_beginnings_dinner | 30 | hunger −50, thirst −80, energy +30, stress −10. mother/father/brother: friendship +2, love +1. earnMoney 100. familyMeals.dinner |

---

## use_computer — Use Brother's Computer

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_use_computer_01_start | 5 | — |
| quest_use_computer_02_district_map | 5 | — |
| quest_use_computer_03_career_center | 5 | — |
| quest_use_computer_04_brother_enters | 5 | brother friendship +3 |

---

## find_job — Find a Job

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_find_job_corner_shop | 8 | Marcus friendship +5. Discover OldTown |
| quest_find_job_civic_center | 20 | Discover CivicCenter, TownHall |
| quest_find_job_town_hall_entrance | 5 | advanceStage |
| quest_find_job_town_hall_information | 5 | advanceStage |
| quest_find_job_career_services_queue | 28 | advanceStage |
| quest_find_job_career_services_kiosk | 5 | advanceStage |
| quest_find_job_ruby_diner_offer | 3 | Discover DinerRubys, DinerRubysBathroom |
| quest_find_job_ruby_diner_entrance | 10 | dinerClerk known, firstMet, friendship +2 |
| quest_find_job_ruby_diner_corridor | 5 | dinerManager known |
| quest_find_job_ruby_diner_manager_room | 15 | dinerManager known, firstMet, friendship +2. advanceStage |
| quest_find_job_family_dinner | 30 | hunger=0, thirst=0, bladder +15, energy +30, stress −10, mood +5, health +5 |
| quest_find_job_family_dinner_dishes | 15 | advanceStage, mother friendship +2 |
| quest_find_job_accept_entrance | 10 | advanceStage |
| quest_find_job_accept_manager | 5 | (ayrı branch) |

---

## go_to_mall — Go to Mall

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_go_to_mall_downtown_first | 6 | location downTown, firstDowntownVisit, advanceStage |
| quest_go_to_mall_mall_first | 8 | firstMallVisit, tüm mall discover, completeQuest |

---

## check_old_town — Check Old Town

| Pasaj | Dakika | Değişen |
|-------|--------|---------|
| quest_check_old_town | 10 | Discover Pharmacy, ShopBarber. completeQuest |

---

## Tüm pasajlar tek listede (dakika)

| Pasaj | dk |
|-------|-----|
| quest_first_shopping_map_scene | 5 |
| quest_moving_troubles_sounds | 8 |
| quest_moving_troubles_mother_talk | 10 |
| quest_moving_troubles_father_news | 15 |
| quest_moving_troubles_room_scene | 0 |
| quest_new_beginnings_dinner | 30 |
| quest_use_computer_01_start | 5 |
| quest_use_computer_02_district_map | 5 |
| quest_use_computer_03_career_center | 5 |
| quest_use_computer_04_brother_enters | 5 |
| quest_find_job_corner_shop | 8 |
| quest_find_job_civic_center | 20 |
| quest_find_job_town_hall_entrance | 5 |
| quest_find_job_town_hall_information | 5 |
| quest_find_job_career_services_queue | 28 |
| quest_find_job_career_services_kiosk | 5 |
| quest_find_job_ruby_diner_offer | 3 |
| quest_find_job_ruby_diner_entrance | 10 |
| quest_find_job_ruby_diner_corridor | 5 |
| quest_find_job_ruby_diner_manager_room | 15 |
| quest_find_job_family_dinner | 30 |
| quest_find_job_family_dinner_dishes | 15 |
| quest_find_job_accept_entrance | 10 |
| quest_find_job_accept_manager | 5 |
| quest_go_to_mall_downtown_first | 6 |
| quest_go_to_mall_mall_first | 8 |
| quest_check_old_town | 10 |

**Love/friendship veren pasajlar:** quest_first_shopping_map_scene (Marcus +5), quest_new_beginnings_dinner (anne/baba/kardeş +2/+1, +100₺), quest_use_computer_04_brother_enters (kardeş +3), quest_find_job_corner_shop (Marcus +5), quest_find_job_ruby_diner_entrance (dinerClerk +2), quest_find_job_ruby_diner_manager_room (dinerManager +2), quest_find_job_family_dinner_dishes (mother +2).
