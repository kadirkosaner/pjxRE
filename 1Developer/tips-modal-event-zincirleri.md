# Tips Modal Event Zincirleri (Sıradakiler Yukarıda)

Bu dokuman, Tips modalini "ilerideki eventler ustte, tamamlananlar altta ve ustu cizili" mantigiyla kurmak icin hazirlandi.

## 1) Modal Siralama Kurali

- **Ust liste (onumuzdekiler):** Su an acilabilir ya da bir sonraki net adim olan maddeler.
- **Alt liste (yapilanlar):** Flag/quest tamamlandiysa en alta inen ve ustu cizilen maddeler.
- Markdown gosterim ornegi:
  - `- Lily ile ilk tanisma (Sunset Park Bench)` -> tamamlandiysa `- ~~Lily ile ilk tanisma (Sunset Park Bench)~~`

Onerilen mantik:

1. Her event maddesinin bir `doneIf` kosulu olsun (flag veya quest complete).
2. `doneIf = false` olanlari "Upcoming" listesine, `true` olanlari "Completed" listesine koy.
3. Completed listesini modalin altinda goster.

---

## 2) Ana Zincirler (Senin Istedigin Format)

### A) Mall Acilisi (Lily Hatti)

- **[1]** Sunset Park'ta bench event tetiklenir (Lily parkta olunca).
  - `doneIf`: `$flags.parkBenchFirstEncounter`
- **[2]** Lily ile tanisma olur ve `go_to_mall` baslar.
  - `doneIf`: `$questState.active.go_to_mall` veya `$go_to_mall_done`
- **[3]** Downtown ilk sahne.
  - `doneIf`: `$flags.firstDowntownVisit`
- **[4]** Mall'a ilk giris sahnesi.
  - `doneIf`: `$flags.firstMallVisit`
- **[5]** Quest kapanisi.
  - `doneIf`: `$go_to_mall_done`

Saat/yer notlari:
- `mall` acik saat: **10:00 - 22:00**
- `sunsetPark` acik saat: **06:00 - 22:00**

---

### B) Lily Jog + Mia Acilisi + Gym Acilisi

- **[1]** Lily ile konusup jog davetini ac.
  - Kosul: `friendship >= 20`, invite daha once gorulmedi.
  - `doneIf`: `$flags.lilyJogInviteSeen && $flags.lilyJogUnlocked`
- **[2]** Lily ile "Jog together" yap.
  - Kosul: `energy >= 25`, sporty outfit + relationship kosullari.
- **[3]** Mia tanisma eventi (jog sirasinda random 1/3).
  - `doneIf`: `$flags.lilyJogMiaMeetTriggered` veya `$characters.neighborMia.known`
- **[4]** Lily gym teklif eventi.
  - Kosul: jog sonrasi `friendship > 40`, `cardio > 20`, `lowerBody > 10`, teklif edilmemis olmali.
  - `doneIf`: `$flags.lilyGymQuestOffered` veya `$questState.active.lily_gym_intro`
- **[5]** Gym'e gidip resepsiyon konusmasini bitir.
  - `doneIf`: `$lily_gym_intro_done` veya `$flags.lilyGymReceptionTalked`

Saat/yer notlari:
- Lily schedule (genel):
  - Hafta ici: park agirlikli sabah/aksam, sonra gym.
  - Hafta sonu: park daha erken, gym daha erken.
- Gym saatleri: **08:00 - 22:00**

---

### C) Brother Porn Zinciri -> Masturbation Unlock

- **[1]** Brother PC browse sirasinda ilk porn kesfi.
  - Kosul: corruption >= 1, random tetik.
  - `doneIf`: `$flags.brotherPornFirstSeen`
- **[2]** Ikinci merak zinciri (phase2) gun gun ilerler.
  - Kosul: ayni gun bir kez; adim adim birikir.
  - `progress`: `$brotherPornPhase2Step`
- **[3]** 4. adimda "look/watch porn" kalici acilir.
  - `doneIf`: `$flags.brotherPornSecondPeek && $flags.brotherPornLookButtonUnlocked`
- **[4]** HotHub izleme ilk tamam.
  - `doneIf`: `$flags.pornWatchFirstDone` (veya `$flags.brotherPornWatchFirstDone`)
- **[5]** Tekrarlanan izleme aliskanlik etkisi.
  - `doneIf`: `$flags.privateContentHabit`
- **[6]** Gece yuksek arousal uykusuzluk eventi (ilk kez).
  - Kosul: uyumaya giderken `arousal >= 70` ve `firstCantSleepStoryDone` false.
  - `doneIf`: `$flags.firstCantSleepStoryDone`
- **[7]** Masturbation unlock.
  - `doneIf`: `$flags.masturbationUnlocked && $flags.nightRestlessUnlocked`

Ek notlar:
- Bed'de Masturbate butonu icin: `masturbationUnlocked` + `corruption >= 1` + `arousal >= 70`.
- Brother PC kullanimi, kardes odadayken engelleniyor (`currentLocation === "fhBrotherRoom"`).

---

## 3) Diger Gizli / Yari-Gizli Zincirler (Eklenebilir)

### D) Shower Peek Zinciri (Father/Mother/Brother)

- Kosul paketi:
  - `corruption >= 2`
  - hedef karakterle `lustLevel >= 2`
  - hedef karakterle `lust >= 5`
  - content preferences izinli olmali (incest + ilgili cinsellik toggle)
- First-time flagler:
  - `$flags.fatherShowerPeekFirstSeen`
  - `$flags.motherShowerPeekFirstSeen`
  - `$flags.brotherShowerPeekFirstSeen`

Tips icin iyi bir "gizli event" satiri olur.

---

### E) After Shower Mirror Body-Awareness Tiers

- Tier 1 done: `$flags.bodyAwarenessTier1`
- Tier 2 done: `$flags.bodyAwarenessTier2`
- Tier 3 done: `$flags.bodyAwarenessTier3`

Bu olaylar dus sonrasi aynada stat esiklerine bagli tetiklenir (fitness/confidence ve bazi body stat kosullari).

---

### F) Ilk Is Gunu Eve Yurume Eventi

- Shift sonrasi set edilir: `$flags.firstWorkDayWalkEvent = true`
- Maplewood'a girince event oynar, sonra:
  - `$flags.firstWorkDayWalkEvent = false`
  - `$flags.firstWorkDayWalkHome = true`

Bu da "tek-seferlik gizli gecis eventi" gibi modalde gosterilebilir.

---

### G) Jake Kahve Davet Eventi (Hafta 3)

- **[1]** Ruby's Diner'da bulasikci olarak full 8/8 shift bitir.
  - Kosul: `$job.id === "ruby_dishwasher"`, `($jobState.totalDaysWorked || 0) >= 11`, `(parseFloat($jobState.hoursToday) || 0) >= 8`, Jake (`dinerWaitress3`) friendship `>= 20`, `$flags.jakeCoffeeInviteWeek3Shown` false.
  - Tetiklenen pasaj: `dinerWork_event_jakeCoffeeInvite`.
  - Tetiklendiginde set edilir: `$flags.jakeCoffeeInviteWeek3Shown = true`.
- **[2]** Followup: Jake ile kahveciye git.
  - Auto: `OldTown` ve `ShopCoffeeOldtown` discover edilir, `coffeeBaristaLeo.known = true` ve `firstMet` set edilir.
- **[3]** Gossip + vedalasma sahnesi.
  - `<<advanceTime 60>>`, friendship +4 (Jake), mood +7, stress -6.
  - `doneIf`: `$flags.jakeCoffeeInviteWeek3Shown` veya `$characters.coffeeBaristaLeo.known`.

---

## 4) Modal Icin Hazir "Node" Listesi (Kisa)

Asagidaki node mantigi dogrudan UI'ya baglanabilir:

- `lily_intro_bench` -> done: `$flags.parkBenchFirstEncounter`
- `mall_downtown_first` -> done: `$flags.firstDowntownVisit`
- `mall_first_entry` -> done: `$flags.firstMallVisit`
- `mall_quest_done` -> done: `$go_to_mall_done`
- `lily_jog_unlocked` -> done: `$flags.lilyJogUnlocked`
- `mia_meet` -> done: `$flags.lilyJogMiaMeetTriggered`
- `lily_gym_offer` -> done: `$flags.lilyGymQuestOffered`
- `lily_gym_done` -> done: `$lily_gym_intro_done`
- `brother_porn_first` -> done: `$flags.brotherPornFirstSeen`
- `brother_porn_phase2_done` -> done: `$flags.brotherPornSecondPeek`
- `brother_porn_watch_unlocked` -> done: `$flags.brotherPornLookButtonUnlocked`
- `porn_first_watch` -> done: `$flags.pornWatchFirstDone`
- `private_content_habit` -> done: `$flags.privateContentHabit`
- `night_restless_first` -> done: `$flags.firstCantSleepStoryDone`
- `masturbation_unlocked` -> done: `$flags.masturbationUnlocked`
- `shower_peek_mother_first` -> done: `$flags.motherShowerPeekFirstSeen`
- `shower_peek_father_first` -> done: `$flags.fatherShowerPeekFirstSeen`
- `shower_peek_brother_first` -> done: `$flags.brotherShowerPeekFirstSeen`
- `body_awareness_t1` -> done: `$flags.bodyAwarenessTier1`
- `body_awareness_t2` -> done: `$flags.bodyAwarenessTier2`
- `body_awareness_t3` -> done: `$flags.bodyAwarenessTier3`
- `jake_coffee_week3` -> done: `$flags.jakeCoffeeInviteWeek3Shown` veya `$characters.coffeeBaristaLeo.known`

---

## 5) Kisa Gosterim Ornegi (UI Metni)

Upcoming:
- Lily ile Sunset Park'ta konus (jog davetini ac)
- Lily ile birlikte kos (Mia ile karsilasma sansi)
- Gece uyumadan once arousal'i yuksek tut (ilk restless event)

Completed:
- ~~Lily ile ilk tanisma (bench)~~
- ~~Downtown ilk ziyaret~~
- ~~Mall ilk giris~~
- ~~Brother PC: ilk porn kesfi~~

