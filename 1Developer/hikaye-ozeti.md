# Hikaye Ozeti

Bu dosya, oyunun hikaye tasiyan `*.twee` dosyalarini hizli okumak icin hazirlandi.

Kapsam:
- Ozellikle `passages/1 - Prologue`
- Quest agaci (`passages/5 - QuestSystem`)
- Story-bearing event passage'lari (`passages/4 - Actions/events`)
- Gerekli oldugu yerde tekil interaction passage'lari

Disarida birakilanlar:
- `talkDatabase` dosyalari
- Mekanik agirlikli widget / utility passage'lari
- Tekrar eden, hikaye ilerletmeyen gunluk aksiyonlar

## 1. Ana Cizgi

Oyunun erken hikaye omurgasi su:

1. Aile yeni bir sehre tasinir.
2. Prologue boyunca karakterin cocukluktan bugune gelen aile, beden, ilgi, bagimsizlik ve arzu ekseni kurulur.
3. Prologue sonrasi ilk gunlerde karakter yeni mahalleye, eve ve ailedeki yeni duzene alismaya calisir.
4. Ilk quest zinciri alisveris, tasinma krizi ve aile yemekleriyle "yeni hayat" temasini sabitler.
5. Sonra iki ana rota acilir:
   - Sehir / bilgisayar / is bulma rotasi
   - Ruby's Diner uzerinden Diana guzellik / fark edilme rotasi
6. Diana hatti, "gorunurluk", "emek", "bakim", "para", "dikkat cekmek" ve "kim olmak istedigin" sorularina doner.

## 2. Prologue Olay Akisi

Kaynak dosyalar:
- `passages/1 - Prologue/5 - prologuePage.twee`
- `passages/1 - Prologue/6 - earlyYears.twee`
- `passages/1 - Prologue/7 - childhoodYears.twee`
- `passages/1 - Prologue/8 - formativeYears.twee`
- `passages/1 - Prologue/9 - adolescentYears.twee`
- `passages/1 - Prologue/10 - comingofAge.twee`
- `passages/1 - Prologue/11 - newhomeEnter.twee`
- `passages/1 - Prologue/12 - newHome.twee`
- `passages/1 - Prologue/13 - prologueBedroom.twee`
- `passages/1 - Prologue/14 - prologueDownstairsAsk.twee`
- `passages/1 - Prologue/15 - prologueEvening.twee`
- `passages/1 - Prologue/16 - prologueDinner.twee`
- `passages/1 - Prologue/17 - prologueNightEnd.twee`
- `passages/1 - Prologue/18 - nextDayMorning.twee`

### Present-day hook

`prologuePage.twee`:
- Karakter, ailesiyle yeni sehri dogru araba yolculugundadir.
- Anne universite basvurularini gundeme getirir; karakter kararsizdir.
- Baba tasinmanin pratik tarafindadir.
- Kardes arkada uyur; aile sessiz ama gergindir.
- Sehre yaklastikca gecmise donen flashback zinciri baslar.

### Yas donemleri

`earlyYears.twee`:
- Kardesin dogumuyla birlikte ilginin bolunmesi ilk kez hissedilir.
- Baba tarafindan "sadece sana ait" bir jest onem kazanir.
- Karakter "abla" rolune yerlesmeye baslar.

`childhoodYears.twee`:
- Okul, karakterin dunyasini genisletir.
- Anne ve babanin farkli destek bicimleri kurulur.
- Karakter daha sonra kardesin okul korkusunu yatistiran kisi olur.

`formativeYears.twee`:
- Ortaokul donemiyle beklenti, sorumluluk ve hayal kirikligi artar.
- Anne daha fazla gorev verir.
- Baba ise is yuzunden uzaklasir.
- Karakter ilk kez bunu dillendirir; aile ici onarma sahnesi olur.

`adolescentYears.twee`:
- Beden, gorunus, disaridan nasil algilandigin meselesi on plana cikar.
- Anne korumaci ve kontrolcu olabilir.
- Baba bazen dengeleyici olur.
- Parti / izin / ergenlik gerilimi kurulur.
- Ilk romantik / cinsel merak ekseni belirginlesir.

`comingofAge.twee`:
- Ailenin yeni sehre tasinma karari aile toplantisiyla netlesir.
- Tasinmanin kaynagi babanin yeni is firsatidir.
- Kardes de en az karakter kadar korkmustur.
- Karakter artik cocukluktan cikmis, arzu ve bagimsizlikla daha acik temas kuran bir esige gelmistir.

### Yeni ev ve ilk gunler

`newhomeEnter.twee` ve `newHome.twee`:
- Aile Maplewood'daki yeni eve varir.
- Sehir buyuk, yabanci ve imkan dolu hissettirir.
- Ev yeni ama tam yerlesilmemistir.

`prologueBedroom.twee`:
- Karakter kendi odasina girer.
- Ama kiyafetlerin geldigi buyuk valiz yoktur.

`prologueDownstairsAsk.twee`:
- Valizin ancak ertesi gun gelecegi ogrenilir.

`prologueEvening.twee`, `prologueDinner.twee`, `prologueNightEnd.twee`:
- Ilk aile aksami, pizza, ilk yeni ev yemegi, babanin ertesi gunki gorusmesi, kardesin okul kaydi ve annenin ev toparlama cizgisi kurulur.
- Anne daha yumusak; baba daha gorev odakli; kardes uyum saglamaya calisan taraftadir.
- Gece sahnesi kayip, yalnizlik ve umut hissini birlikte verir.

`nextDayMorning.twee`:
- Ertesi sabah aile dagilir: baba ve kardes disari gider, karakter anneyle evde kalir.
- Anne karakteri corner shop'a yollar.
- Prologue burada bitip ana oyuna aktarir.

### Prologue'un tematik yukleri

Prologue sunlari erkenden kurar:
- Karakterin "gorulmek" ve "kendi yerini bulmak" ihtiyaci
- Anneyle yakin ama zaman zaman baskili / ogut veren iliski
- Baba ile daha dolayli, bazen uzak ama agirligi olan iliski
- Kardesle rekabetten dayanismaya kayan bag
- Kucuk kasabadan sehre gecis
- Universite / gelecek / kim olacagim sorusu

## 3. Quest Agaci: Hikaye Sirasiyla

Ana kaynak:
- `passages/5 - QuestSystem/System/QuestDatabase_Main.twee`

Destekleyici quest scene dosyalari:
- `passages/5 - QuestSystem/Quests/...`

### 3.1. `first_shopping`

Dosyalar:
- `passages/5 - QuestSystem/Quests/movingTroubles/quest_first_shopping_map_scene.twee`

Ozet:
- Karakter ilk gorev olarak corner shop'a gider.
- Alisveris basit bir tutorial gibi baslar.
- Ama burada sehir haritasi / yeni sehri kesfetme duygusu da acilir.
- Marcus ile tanisma, "artik disari dunya var" hissini sabitler.

### 3.2. `moving_troubles`

Dosyalar:
- `quest_moving_troubles_sounds.twee`
- `quest_moving_troubles_mother_talk.twee`
- `quest_moving_troubles_father_news.twee`
- `quest_moving_troubles_room_scene.twee`

Ozet:
- Eve donus yolu sadece "eve donus" olmaz; karakter yeni cevreyi fark eder.
- Mutfakta anneyle bulusma sonrasi babanin kotu haberi gelir.
- Tasinma aracindaki esyalarin kaybi / hasari yeni hayatin daha da zorlasacagini gosterir.
- Karakterin yalniz kalma ihtiyaci ve odasina cekilmesi duygusal bir gecis yaratir.

### 3.3. `new_beginnings`

Dosya:
- `quest_new_beginnings_dinner.twee`

Ozet:
- Aile bir yemek etrafinda yeniden toplanir.
- Para / destek / gunluk duzen tarafinda biraz nefes alma alani acilir.
- Bu quest, "krizden sonra aile ici toparlanma" dugumudur.

### 3.4. `use_computer`

Dosyalar:
- `quest_use_computer_01_start.twee`
- `quest_use_computer_02_district_map.twee`
- `quest_use_computer_03_career_center.twee`
- `quest_use_computer_04_brother_enters.twee`

Ozet:
- Karakter kardesin bilgisayari uzerinden sehri, bolgeleri ve kariyer merkezi gibi seyleri ogrenmeye baslar.
- Bu, hem mekanik olarak harita / sehir bilgisi verir, hem de "disariya cikmadan once kafada sehir kurma" hissi yaratir.
- Kardesin araya girmesi ev icindeki paylasim / sinir hissini de korur.

### 3.5. `find_job`

Dosyalar:
- `quest_find_job_corner_shop.twee`
- `quest_find_job_civic_center.twee`
- `quest_find_job_town_hall_entrance.twee`
- `quest_find_job_town_hall_information.twee`
- `quest_find_job_career_services_queue.twee`
- `quest_find_job_career_services_kiosk.twee`
- `quest_find_job_ruby_diner_offer.twee`
- `quest_find_job_ruby_diner_entrance.twee`
- `quest_find_job_ruby_diner_corridor.twee`
- `quest_find_job_ruby_diner_manager_room.twee`
- `quest_find_job_family_dinner.twee`
- `quest_find_job_family_dinner_dishes.twee`
- `quest_find_job_accept_entrance.twee`
- `quest_find_job_accept_manager.twee`

Ozet:
- Karakter is bulmak zorundadir; bu hem maddi hem kimliksel bir cizgidir.
- Corner shop ve civic center denemeleri, "duzgun yol" arayisini temsil eder.
- Kariyer merkezi kuyruk / kiosk / ofis hattinda yetiskin dunya ile ilk ciddi temas kurulur.
- Ruby's Diner teklifi daha sert, daha kirli ama daha gercek bir secenektir.
- Aile yemegi ve bulasik sonrasi anneye / aileye anlatma boyutu isin sadece "is" olmadigini gosterir.
- Sonunda karakter Ruby's'de dishwashing isini kabul eder.

### 3.6. `go_to_mall`

Dosyalar:
- `quest_go_to_mall_downtown_first.twee`
- `quest_go_to_mall_mall_first.twee`

Ozet:
- Bu, sehri kesfetme ve tuketim / alisveris dunyasina giris icin acilan yan hattir.
- Lily bu hatta kapı acan kisidir.

### 3.7. `check_old_town`

Dosya:
- `quest_check_old_town.twee`

Ozet:
- Old Town tarafini kesfetme hattidir.
- Anne / aile tavsiyesiyle bagli yan bir gezme rotasi gibi calisir.

### 3.8. `something_different`

Ana kaynak:
- `passages/5 - QuestSystem/System/QuestDatabase_Main.twee`

Bu arc, Diana etkisiyle tetiklenen "guzellik / bakim / gorunurluk / para / dikkat" hikayesidir.

Stageler:
1. `talk_to_girls`
2. `mirror_moment`
3. `research`
4. `talk_mom`
5. `ask_dad`
6. `visit_mall`
7. `find_money`

Bu quest'in his ekseni:
- Diana gibi "girince ortam degistiren" biriyle yuzlesme
- Kendine bakmakla fark edilmek arasindaki cizgi
- Bakim ile para arasindaki bag
- Anne ve babadan gelen iki farkli destek modeli
- Ilgi gormek istemek ile kendini riske atmamak arasindaki sinir

## 4. Ruby's Diner ve Diana Hatti

### 4.1. Ilk is gunu zinciri

Dosyalar:
- `passages/4 - Actions/events/oldtown/RubysDiner/firstdayJob/01 - dinerFirstdayJob_firstWorkDayEvent.twee`
- `02 - dinerFirstdayJob_dressingRoom.twee`
- `03 - dinerFirstdayJob_gettingDressed.twee`
- `04 - dinerFirstdayJob_wardrobe.twee`
- `05 - dinerFirstdayJob_emmaEncounter.twee`
- `06 - dinerFirstdayJob_backToFront.twee`
- `07 - dinerFirstdayJob_kitchen.twee`
- `08 - dinerFirstdayJob_front.twee`
- `09 - dinerFirstdayJob_dishwasher.twee`

Ozet:
- Ruby's ilk gun zinciri karakteri mekanla ve rollerle tanistirir.
- Uniform, koridorlar, mutfak, on taraf / arka taraf ayrimi kurulur.
- Emma ilk bakista bir sosyal gerilim / gozlem figuru olarak yerlesir.
- Karakter artik "bu yerde calisan biri" olmustur.

### 4.2. Diana olay zinciri

Dosyalar:
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_dianaArrival.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_dianaKitchen.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/dinerWork_event_nightThoughts.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/fhBedroom_event_beautyThoughts.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/brotherComputer_beautySearch.twee`
- `passages/4 - Actions/events/oldtown/RubysDiner/diana/fhParentsRoom_event_motherTalk.twee`

Bagli interaction dosyalari:
- `passages/3- Interactions/oldTown/dinerRubys/Emma/emmaTalkDinerRubys_dianaGossip.twee`
- `passages/3- Interactions/oldTown/dinerRubys/Sofia/sofiaTalkDinerRubys_dianaGossip.twee`

#### `dinerWork_event_dianaArrival.twee`
- Diana'nin gelisi bir "normal giris" degil, dikkat dagitan bir olaydir.
- Vince'in bakisi ve ortamdaki enerji degisir.
- Karakter, fark edilmenin bir sosyal guc oldugunu disaridan izler.

#### `dinerWork_event_dianaKitchen.twee`
- Karakter mutfaktan / kenardan konusmalari duyar.
- Diana hakkindaki personel dili, karakterin kendine bakisini sertlestirir.
- Burada sadece kiskanclik degil, "kim gorulur / kim gorunmez" sorusu buyur.

#### `dinerWork_event_nightThoughts.twee`
- Gunun sonunda yatak odasinda sindirme gelir.
- Bu passage, olaylari duyguya ceviren ilk gece koprusu gibi calisir.
- `dianaGossipUnlocked` gibi flag'lerle sonraki arc'i acan kapidir.

#### Emma / Sofia gossip passage'lari
- Emma ve Sofia, Diana'yi farkli acilardan okunabilir hale getirir.
- Karakter ilk kez sadece "goruntu" degil, onun yarattigi etkiyi sosyal dilden duyar.

#### `fhBedroom_event_beautyThoughts.twee`
- Bu, arc'in asiri onemli ic kirilma noktasi.
- Karakter aynaya ve gecmise bakar.
- Vince'in cümlesi geri gelir.
- Guzellik, emek, gorunurluk ve eksiklik hissi ilk kez acik bicimde birbirine baglanir.

#### `brotherComputer_beautySearch.twee`
- Karakter somut bilgi aramaya gecer.
- Internet, videolar, yorumlar ve urun sayfalari "bakim" konusunu bir arzu olmaktan cikarip masraflı bir sisteme cevirir.
- Bu passage'in kilit noktasi: karakter sadece "guzel miyim?" diye degil, "bu is emek ve para istiyor" diye dusunmeye baslar.

#### `fhParentsRoom_event_motherTalk.twee`
- Anne hattı bu arc'a sicaklik ve pratiklik getirir.
- Karakter ilk kez anneden dogrudan "bakim" ve "guzellik" uzerine konusur.
- Anne hem sakinlestirir hem ogut verir hem de sinir cizer:
  - Bakim basic olabilir.
  - Guzellik dikkat ceker ama tek basina yetmez.
  - Dikkat cekmek istemek kotu degildir, ama risk ve sinir onemlidir.

### 4.3. Bu noktadan sonra planlanan / questte duran devam

Quest verisinde duran devam passage'lari:
- `fhLivingRoom_event_askDadMoney`
- `mall_event_beautyVisit`
- `fhLivingRoom_event_stealDad`

Bunlarin hikaye mantigi su:
- Anne sahnesi karaktere yon / dil verir.
- Sonraki adim para meselesini babaya tasimak veya tuketim dunyasiyla yuzlesmektir.
- Arc'in daha karanlik ucunda para bulmak icin sinir asimi ihtimali vardir.

## 5. Erken Oyun Icinde Diger Hikaye Tasiyan Sahne Basliklari

### Lily / park / mall acilisi

Ilgili dosyalar:
- `passages/4 - Actions/maplewood/sunsetPark/parkBench_firstEncounter.twee`
- `passages/5 - QuestSystem/Quests/gotoOldtown/quest_go_to_mall_downtown_first.twee`
- `passages/5 - QuestSystem/Quests/gotoOldtown/quest_go_to_mall_mall_first.twee`

Ozet:
- Lily, karakterin yeni sehirdeki ilk "aile disi" yon veren figurlardan biridir.
- Mall hattı, guzellik / tuketim / sehir arzusu icin alternatif bir kapidir.

## 6. Aile Dinamigi Kisa Not

Bu ozet icin `talkDatabase` dosyalari atlandi, ama erken hikayenin omurgasinda su aile enerjileri sabit:

- Anne:
  - Sicak, ilgili, bedensel olarak yakinlasabilen
  - Zaman zaman ogut veren, yon veren, hatta baski kurabilen
  - "Bakim", "duzen", "kendine ozen" tarafini temsil ediyor

- Baba:
  - Is ve sorumluluk tarafindan tanimlaniyor
  - Bazen mesafeli, bazen tek cümleyle agirlik koyan biri
  - Para, izin, hareket alanı ve dunyevi gerceklik tarafinda duruyor

- Kardes:
  - Cocuklukta rekabet, sonra ortaklik
  - Ev icinde hem yuk hem tanidik guven alani

## 7. Su Anki Diana Arc Akisinda "Neredeyiz?"

`fhParentsRoom_event_motherTalk.twee` sonrasinda hikaye duygusal olarak su noktadadir:

- Karakter artik sadece kendi eksigini hisseden biri degil; neye ihtiyaci oldugunu kabaca biliyor.
- Anne bu ihtiyaci hem yumusatmis hem de meşrulastirmis durumda.
- Ama mesele kapanmadi, cunku:
  - para boyutu duruyor
  - babayla konusulmasi gereken taraf duruyor
  - "istemek", "istemeye utanmak", "dikkat cekmek", "risk" basliklari hala acik

Bu yuzden anne sahnesinden sonra gelecek iyi bir kopru passage'i su isi yapmali:
- Annenin sozlerini tekrar etmeden etkisini tasimali
- Para sorununu netlestirmeli
- Babanin sahneye girisini dogal hale getirmeli
- Karakterin babaya gitmesini "quest mecburiyeti" gibi degil, duygusal olarak mantikli gostermeli

## 8. Bu Dosya Nasil Kullanilsin?

Bir sonraki sahneyi dusunurken su sorular faydali:

1. Bu scene hangi duygu boslugunu dolduruyor?
2. Bundan onceki scene neyi cozdü, neyi acik birakti?
3. Yeni scene eski passage'in ritmini kopyaliyor mu?
4. Quest zorladigi icin mi sahne oluyor, yoksa karakter o sahneye gercekten gider mi?

Bu ozetin amaci tam olarak bu sorulari netlestirmek.
