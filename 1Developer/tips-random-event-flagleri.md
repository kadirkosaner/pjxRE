# Tips Icin Random Event Flagleri

Odak: quest sonrasi acilan randomize event/encounter akislari (Mia tanisma, park jog vb.)

Taranan random/event odakli dosya: **18 flag adayina ait referans**

## 1) Mia + Park Jog akisi (oncelikli takip)

- ` $flags.lilyJogInviteSeen` -> jog daveti sahnesi goruldu
- ` $flags.lilyJogUnlocked` -> Lily ile birlikte jog aksiyonu acildi
- ` $flags.lilyJogMiaMeetTriggered` -> Mia tanisma eventi tetiklendi
- ` $characters.neighborMia.known` -> Mia artik taniniyor
- ` $characters.neighborMia.firstMet` -> ilk tanisma tarihi
- ` $flags.lilyGymQuestOffered` -> jog sonrasi gym quest teklifi verildi

Referans dosyalar:
- `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogTogether.twee`
- `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogInviteEvent.twee`
- `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogMeetMiaEvent.twee`

## 2) Random/Event flag adaylari (`$flags.*`)

- `$flags.brotherShowerPeekFirstSeen` - `passages/4 - Actions/maplewood/familyHouse/Bathroom/Brother/showerEncounter_peek_Brother_first.twee`
- `$flags.bushSet` - `passages/4 - Actions/maplewood/sunsetPark/parkWalk_bushEncounter.twee`
- `$flags.dianaEventShown` - `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_dianaArrival.twee`
- `$flags.dianaGossipUnlocked` - `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_dianaArrival.twee`, `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_nightThoughts.twee`
- `$flags.dianaThoughtsShown` - `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_nightThoughts.twee`
- `$flags.fatherShowerPeekFirstSeen` - `passages/4 - Actions/maplewood/familyHouse/Bathroom/Father/showerEncounter_peek_Father_first.twee`
- `$flags.firstWorkDayWalkEvent` - `passages/4 - Actions/events/maplewood/event_maplewood_firstWorkDayWalkHome.twee`, `passages/4 - Actions/events/oldtown/RubysDiner/firstdayJob/09 - dinerFirstdayJob_dishwasher.twee`
- `$flags.firstWorkDayWalkHome` - `passages/4 - Actions/events/maplewood/event_maplewood_firstWorkDayWalkHome.twee`, `passages/4 - Actions/events/maplewood/familyHouse/event_fhLivingroom_firstWorkDayFamily_great.twee`
- `$flags.lilyGymQuestOffered` - `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogGymQuestEvent.twee`
- `$flags.lilyJogInviteSeen` - `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogInviteEvent.twee`
- `$flags.lilyJogMiaMeetTriggered` - `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogMeetMiaEvent.twee`
- `$flags.lilyJogUnlocked` - `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogInviteEvent.twee`
- `$flags.motherShowerPeekFirstSeen` - `passages/4 - Actions/maplewood/familyHouse/Bathroom/Mother/showerEncounter_peek_Mother_first.twee`
- `$flags.parkBenchFirstEncounter` - `passages/4 - Actions/maplewood/sunsetPark/parkBench_firstEncounter.twee`
- `$flags.vinceDay3FamilyOpen` - `passages/5 - QuestSystem/Quests/vinceDay3/dinerWork_event_vinceInspection_day3.twee`

## 3) Event progression icin yardimci story varlar

- `$jobState.firstWorkDayEventShown` - `passages/4 - Actions/events/oldtown/RubysDiner/firstdayJob/09 - dinerFirstdayJob_dishwasher.twee`
- `$showerEncounterReturnLoc` - `passages/3- Interactions/FamilyHouse/Brother/showerEncounter_Brother.twee`, `passages/3- Interactions/FamilyHouse/Father/showerEncounter_Father.twee`
- `$showerEncounterTarget` - `passages/3- Interactions/FamilyHouse/Brother/showerEncounter_Brother.twee`, `passages/3- Interactions/FamilyHouse/Father/showerEncounter_Father.twee`

## 4) Random gate olan dosyalar (kontrol listesi)

- `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyJogTogether.twee`
- `passages/3- Interactions/Maplewood/SunsetPark/Lilly/parkRunnerLilyTalk.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/dinerRubysStorage_coffee.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/dinerRubysStorage_freeMeal.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Brother/showerEncounter_peek_Brother.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Brother/showerEncounter_peek_Brother_continue.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Father/showerEncounter_peek_Father.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Father/showerEncounter_peek_Father_continue.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Mother/showerEncounter_peek_Mother.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/Mother/showerEncounter_peek_Mother_continue.twee`
- `passages/4 - Actions/maplewood/familyHouse/Bathroom/showerEncounter.twee`
- `passages/4 - Actions/maplewood/familyHouse/Downstairs/fhDownstairs_event_parentsThinWalls.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkBench_firstEncounter.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkBench_rest.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkJog.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkRest.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkWalk.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkWalk_bushEncounter.twee`
- `passages/4 - Actions/maplewood/sunsetPark/parkYoga.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_broken.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_burn.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_clog.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_emmaWater.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_jamesSnack.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_mikeHelp.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_rushSurge.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_rushSurge_askHelp.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_sofiaChat.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_tomChat.twee`
- `passages/7 - Work/RubysDiner/Dishwashing/dinerWork_event_vinceCheck.twee`
