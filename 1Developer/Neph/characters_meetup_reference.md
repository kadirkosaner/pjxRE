# Character List & Meetup Schedule Reference

All characters from `passages/0 - System/Init/characters/` with their schedules, locations, and meetup availability per period.

---

## Character Overview

| Char ID | Name | Occupation | Location | Phone Contact | Meetup Capable |
|---------|------|------------|----------|---------------|----------------|
| brother | Jake Taylor | High School Student | Family House | Yes (family) | Yes |
| mother | Sarah Taylor | House Wife | Family House | Yes (family) | Yes |
| father | Robert Taylor | Software Engineer | Family House | Yes (family) | Yes |
| parkRunnerLily | Lily Morgan | Fitness Enthusiast | Sunset Park | No (swap) | No (jogging) |
| shopClerkMarcus | Marcus Johnson | Shop Clerk | Quick Mart | No (swap) | No |
| dinerWaitress1 | Emma Walsh | Waitress | Ruby's Diner | No | No |
| dinerWaitress2 | Sofia Chen | Waitress | Ruby's Diner | No | No |
| dinerWaitress3 | Jake Rivera | Waiter | Ruby's Diner | No | No |
| dinerManager | Vince Ruby | Owner/Manager | Ruby's Diner | No | No |
| dinerDishwasher | Mike Torres | Dishwasher | Ruby's Diner | No | No |
| dinerChef | James Holt | Chef | Ruby's Diner | No | No |
| dinerClerk | Tom Reese | Front Clerk | Ruby's Diner | No | No |
| townHallReceptionist | Janet Morrison | Receptionist | Town Hall | No | No |
| careerClerk | Sandra Wilson | Career Counselor | Town Hall | No | No |

---

## 1. BROTHER (Jake Taylor)

**File:** `maplewood/Family/charBrother.twee`  
**Periods:** `school` | `vacation` (via setup.schoolCalendar.vacations)

### School – Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhBrotherRoom | sleeping | - |
| 6 | 50 | fhUpperBath | showering | - |
| 7 | - | fhKitchen | available | - |
| 7 | 30 | fhBrotherRoom | available | - |
| 8 | - | school | busy | - |
| 15 | - | fhBrotherRoom | available | ✓ |
| 17 | - | fhLivingroom | available | ✓ |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhBrotherRoom | available | ✓ |
| 20 | - | fhBrotherRoom | available | ✓ |
| 23 | - | fhBrotherRoom | sleeping | - |

### School – Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhBrotherRoom | sleeping | - |
| 8 | - | fhUpperBath | showering | - |
| 8 | 15 | fhBrotherRoom | available | - |
| 8 | 30 | fhKitchen | available | - |
| 9 | 30 | fhBrotherRoom | available | - |
| 11 | - | fhLivingroom | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | 30 | fhBrotherRoom | available | - |
| 14 | - | fhLivingroom | available | ✓ |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhBrotherRoom | available | ✓ |
| 20 | - | fhBrotherRoom | available | ✓ |
| 23 | - | fhBrotherRoom | sleeping | - |

### Vacation – Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhBrotherRoom | available | - |
| 2 | - | fhBrotherRoom | sleeping | - |
| 6 | 50 | fhUpperBath | showering | - |
| 7 | - | fhKitchen | available | - |
| 7 | 30 | fhBrotherRoom | available | - |
| 10 | - | fhLivingroom | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | - | fhBrotherRoom | available | - |
| 15 | - | fhBackyard | available | ✓ |
| 16 | - | fhLivingroom | available | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhBackyard | available | ✓ |
| 20 | 30 | fhBrotherRoom | available | - |
| 23 | - | fhBrotherRoom | available | - |

### Vacation – Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhBrotherRoom | available | - |
| 2 | - | fhBrotherRoom | sleeping | - |
| 8 | - | fhUpperBath | showering | - |
| 8 | 15 | fhBrotherRoom | available | - |
| 8 | 30 | fhKitchen | available | - |
| 9 | 30 | fhBrotherRoom | available | - |
| 11 | - | fhLivingroom | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | 30 | fhBrotherRoom | available | - |
| 15 | - | fhBackyard | available | ✓ |
| 16 | - | fhLivingroom | available | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhBackyard | available | ✓ |
| 20 | 30 | fhBrotherRoom | available | - |
| 23 | - | fhBrotherRoom | available | - |

**Meetup Locations (phone):** fhLivingroom, fhBrotherRoom, fhBackyard (vacation only)  
**Note:** Family house locations (fh*) are not in setup.phoneMeetupLocationIds – meetup places come from navCards (sunsetPark, dinerRubys, etc.). Brother’s meetup: true slots are for *at-home* availability; phone meetups use public spots.

---

## 2. MOTHER (Sarah Taylor)

**File:** `maplewood/Family/charMother.twee`  
**Periods:** Single schedule (no school/vacation phase)

### Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 6 | 20 | fhParentsBath | showering | - |
| 6 | 50 | fhParentsRoom | available | - |
| 7 | - | fhKitchen | available | - |
| 7 | 30 | fhLivingroom | available | - |
| 9 | - | fhLivingroom | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | - | fhKitchen | available | ✓ |
| 14 | - | fhKitchen | available | ✓ |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

### Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 7 | 20 | fhParentsBath | showering | - |
| 7 | 50 | fhParentsRoom | available | - |
| 8 | 30 | fhKitchen | available | - |
| 9 | 30 | fhLivingroom | available | - |
| 10 | - | fhLivingroom | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | 30 | fhKitchen | available | ✓ |
| 14 | - | fhKitchen | available | ✓ |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

---

## 3. FATHER (Robert Taylor)

**File:** `maplewood/Family/charFather.twee`  
**Periods:** `preWork` | `postWork` (via importantDates.fatherWorkStart)

### PreWork – Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 6 | - | fhParentsBath | showering | - |
| 6 | 20 | fhParentsRoom | available | - |
| 7 | - | fhKitchen | available | - |
| 7 | 30 | fhLivingroom | available | - |
| 10 | - | fhGarage | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | - | fhBackyard | available | - |
| 14 | - | fhGarage | available | ✓ |
| 17 | - | fhLivingroom | available | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

### PreWork – Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 7 | - | fhParentsBath | showering | - |
| 7 | 20 | fhParentsRoom | available | - |
| 8 | 30 | fhKitchen | available | - |
| 9 | 30 | fhLivingroom | available | - |
| 11 | - | fhGarage | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 13 | 30 | fhBackyard | available | - |
| 14 | - | fhGarage | available | ✓ |
| 17 | - | fhLivingroom | available | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

### PostWork – Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 6 | - | fhParentsBath | showering | - |
| 6 | 20 | fhParentsRoom | available | - |
| 7 | - | fhKitchen | available | - |
| 8 | - | work | busy | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhGarage | available | ✓ |
| 20 | - | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

### PostWork – Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | fhParentsRoom | sleeping | - |
| 7 | - | fhParentsBath | showering | - |
| 7 | 20 | fhParentsRoom | available | - |
| 8 | 30 | fhKitchen | available | - |
| 9 | 30 | fhLivingroom | available | - |
| 11 | - | fhGarage | available | ✓ |
| 12 | 30 | fhKitchen | available | - |
| 16 | - | fhLivingroom | available | - |
| 18 | 30 | fhKitchen | available | - |
| 19 | 30 | fhLivingroom | available | ✓ |
| 23 | - | fhParentsRoom | available | - |

---

## 4. PARK RUNNER LILY (Lily Morgan)

**File:** `maplewood/sunsetPark/charLily[SunsetPark].twee`  
**Periods:** weekday | weekend  
**Meetup:** No meetup: true slots (status: jogging)

### Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 7 | - | sunsetPark | jogging | - |
| 9 | - | null | unavailable | - |
| 17 | - | sunsetPark | jogging | - |
| 20 | - | null | unavailable | - |

### Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 8 | - | sunsetPark | jogging | - |
| 12 | - | null | unavailable | - |
| 16 | - | sunsetPark | jogging | - |
| 19 | - | null | unavailable | - |

**Note:** Status is always jogging or unavailable – no meetup: true. To allow meetups, add meetup: true slots when she is available (e.g. after jogging or on free days).

---

## 5. SHOP CLERK MARCUS (Marcus Johnson)

**File:** `maplewood/cornerShop/charMarcus[CornerShop].twee`  
**Periods:** weekday | weekend  
**Meetup:** No meetup slots defined

### Weekday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 9 | - | storeCorner | available | - |
| 22 | - | null | unavailable | - |

### Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 10 | - | storeCorner | available | - |
| 20 | - | null | unavailable | - |

---

## 6. DINER – Emma Walsh (dinerWaitress1)

**File:** `oldtown/RubysDiner/charWaitressEmma[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 10 | - | dinerRubys | available | - |
| 18 | - | null | unavailable | - |

---

## 7. DINER – Sofia Chen (dinerWaitress2)

**File:** `oldtown/RubysDiner/charWaitressSofia[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 12 | - | dinerRubys | available | - |
| 20 | - | null | unavailable | - |

---

## 8. DINER – Jake Rivera (dinerWaitress3)

**File:** `oldtown/RubysDiner/charWaitressJake[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 14 | - | dinerRubys | available | - |
| 22 | - | null | unavailable | - |

---

## 9. DINER – Vince Ruby (dinerManager)

**File:** `oldtown/RubysDiner/charManagerVince[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 10 | - | dinerRubys | available | - |
| 22 | - | null | unavailable | - |

### Sunday
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |

---

## 10. DINER – Mike Torres (dinerDishwasher)

**File:** `oldtown/RubysDiner/charDishMike[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 7 | - | dinerRubys | available | - |
| 15 | - | null | unavailable | - |

---

## 11. DINER – James Holt (dinerChef)

**File:** `oldtown/RubysDiner/charChefJames[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 11 | - | dinerRubys | available | - |
| 21 | - | null | unavailable | - |

---

## 12. DINER – Tom Reese (dinerClerk)

**File:** `oldtown/RubysDiner/charClerkTom[DinerRubys].twee`

### Weekday | Weekend
| Hour | Minute | Location | Status | Meetup |
|------|--------|----------|--------|--------|
| 0 | - | null | unavailable | - |
| 10 | - | dinerRubys | available | - |
| 18 | - | null | unavailable | - |

---

## 13. TOWN HALL – Janet Morrison (townHallReceptionist)

**File:** `oldtown/townhall/charReceptionist[TownHall].twee`  
**Schedule:** None defined – effectively always unavailable.

---

## 14. TOWN HALL – Sandra Wilson (careerClerk)

**File:** `oldtown/townhall/charCareerClerk[TownHall].twee`  
**Schedule:** None defined – effectively always unavailable.

---

## Phone Meetup System Reference

**Meetup locations (navCards with meetup: true):**
- sunsetPark
- dinerRubys
- (plus: restaurantDowntown, nightClub, cityHall, mapleChurch, restaurantBeach, beachClub if discovered)

**Can show meetup button:** Characters with `meetup: true` in schedule and status `available`.  
**Phone contacts:** Family (mother, father, brother) + $phoneContactsUnlocked.  
**Blocked:** $phoneBlocked (excluded from contacts).
