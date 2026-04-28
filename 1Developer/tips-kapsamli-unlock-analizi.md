# Tips Icin Kapsamli Unlock Analizi

Bu rapor, oyundaki icerik acilimlarini (mall, district, quest-gated ilerleme, random event tetikleri, tanisma/known akislari) tips modal perspektifiyle ozetler.

## 1) Discovery / Unlock Yapisi

- Discovery cekirdegi: `passages/0 - System/Init/variablesDiscovery.twee`
- `<<discover "X">>` makrosu: `discoveredX = true` set eder.
  - Kaynak: `passages/0 - System/Widgets/systemWidgets.twee`

Kritik unlock kaynaklari:
- Prologue sonrasi corner shop acilisi: `$discoveredStoreCorner`
  - `passages/1 - Prologue/18 - nextDayMorning.twee`
- Mall full unlock paketi (`$discoveredMall`, katlar, store'lar):
  - `passages/5 - QuestSystem/Quests/gotoOldtown/quest_go_to_mall_mall_first.twee`

## 2) Mall Acilma Akisi (Net)

1. Downtown ilk ziyaret gate:
   - Kosul: `go_to_mall` aktif + `!$flags.firstDowntownVisit`
   - Dosya: `passages/2 - Locations/downTown/downTown.twee`
2. Mall ilk ziyaret gate:
   - Kosul: `go_to_mall` stage 1 + `!$flags.firstMallVisit`
   - Dosya: `passages/2 - Locations/downTown/mall.twee`
3. Gercek acilim (unlock'un yazildigi yer):
   - `$flags.firstMallVisit = true`
   - Tum mall discovery flagleri `true`
   - `completeQuest("go_to_mall")`
   - Dosya: `passages/5 - QuestSystem/Quests/gotoOldtown/quest_go_to_mall_mall_first.twee`

## 3) Quest Sonrasi Acilan Icerikler

- `lily_gym_intro`
  - Gym erisim/discovery, Nora-Nick tanisma zinciri
  - `passages/5 - QuestSystem/Quests/lilyGym/quest_lily_gym_frontdesk_intro*.twee`
- `find_job`
  - Diner cast known/firstMet + manager contact unlock
  - `passages/5 - QuestSystem/Quests/findJob/*.twee`
- `vince_day3_family`
  - Acilis: `$flags.vinceDay3FamilyOpen = true`
  - Parca tamam flagleri: Mom/Brother/Father/Bedroom Done
  - `passages/5 - QuestSystem/Quests/vinceDay3/*.twee`

## 4) Random Event Tetik Flagleri (Tips icin ana grup)

- Park:
  - `$flags.parkBenchFirstEncounter`
  - `$flags.bushSet`
- Lily jog zinciri:
  - `$flags.lilyJogInviteSeen`
  - `$flags.lilyJogUnlocked`
  - `$flags.lilyJogMiaMeetTriggered`
  - `$flags.lilyGymQuestOffered`
- Shower peek first-time:
  - `$flags.fatherShowerPeekFirstSeen`
  - `$flags.motherShowerPeekFirstSeen`
  - `$flags.brotherShowerPeekFirstSeen`
- Diner side-event:
  - `$flags.dianaEventShown`
  - `$flags.dianaGossipUnlocked`
  - `$flags.dianaThoughtsShown`

## 5) Character Tanisma / Known Akislari

Tips tarafinda ozellikle takip edilmesi gerekenler:
- `$characters.parkRunnerLily.known`
- `$characters.parkRunnerLily.firstMet`
- `$characters.neighborMia.known`
- `$characters.neighborMia.firstMet`
- `$characters.gymReceptionNora.known`
- `$characters.gymReceptionNora.firstMet`
- `$characters.gymTrainerNick.known`
- `$characters.shopClerkMarcus.known`
- `$characters.shopClerkMarcus.firstMet`
- `$characters.dinerManager.known`

## 6) Tips Modal Icin Cekirdek Flag Paketi (Oneri)

### A) Discovery (18)
- `$discoveredStoreCorner`, `$discoveredSunsetPark`, `$discoveredDownTown`, `$discoveredOldTown`
- `$discoveredCivicCenter`, `$discoveredTownHall`, `$discoveredHospital`, `$discoveredPoliceStation`
- `$discoveredDinerRubys`, `$discoveredMall`, `$discoveredFloorGround`, `$discoveredFloorSecond`, `$discoveredFloorThird`
- `$discoveredStoreSports`, `$discoveredFoodCourtMall`
- `$discoveredGym`, `$discoveredGymMaleLocker`, `$discoveredGymFemaleLocker`

### B) Quest/State (10)
- `$questState.active.go_to_mall`
- `$questState.active.lily_gym_intro`
- `$flags.firstDowntownVisit`
- `$flags.firstMallVisit`
- `$flags.lilyGymReceptionTalked`
- `$flags.vinceDay3FamilyOpen`
- `$flags.vinceDay3FamilyMomDone`
- `$flags.vinceDay3FamilyBrotherDone`
- `$flags.vinceDay3FamilyFatherDone`
- `$flags.vinceDay3FamilyBedroomDone`

### C) Random/Event (12)
- `$flags.parkBenchFirstEncounter`
- `$flags.bushSet`
- `$flags.lilyJogInviteSeen`
- `$flags.lilyJogUnlocked`
- `$flags.lilyJogMiaMeetTriggered`
- `$flags.lilyGymQuestOffered`
- `$flags.fatherShowerPeekFirstSeen`
- `$flags.motherShowerPeekFirstSeen`
- `$flags.brotherShowerPeekFirstSeen`
- `$flags.dianaEventShown`
- `$flags.dianaGossipUnlocked`
- `$flags.dianaThoughtsShown`

### D) Character Meet (10)
- `$characters.parkRunnerLily.known`
- `$characters.parkRunnerLily.firstMet`
- `$characters.neighborMia.known`
- `$characters.neighborMia.firstMet`
- `$characters.shopClerkMarcus.known`
- `$characters.shopClerkMarcus.firstMet`
- `$characters.gymReceptionNora.known`
- `$characters.gymReceptionNora.firstMet`
- `$characters.gymTrainerNick.known`
- `$characters.dinerManager.known`

---

## Not

Tips modalda en azindan su dort blok ayri gorunsun:
- Discovery Progress
- Quest Gates
- Random Encounters
- Character First Meets

Bunu takip ederek oyuncuya "neler acildi / neler eksik" net verilebilir.
