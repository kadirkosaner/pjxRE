# Masturbate Plan (v0.1.5)

## Goal
- Gece uykuya geciste, yuksek arousal durumunda karakterin "uyuyamama" hissini sahneye cevirmek.
- Oyuncuyu zorlamadan, telefondan merak/arama akisina baglanan bir mini gece olayi kurmak.
- Ileride daha buyuk masturbate sistemine temel state verisini biriktirmek.

## Core Trigger
- Ana kosul:
  - `$stats.arousal >= 70` (veya projede kullanilan dogru degisken)
  - oyuncu **sadece** `fhBedroom` yatak / uyku butonundan uyumayi baslatmis olmali (baska lokasyonlarda bu akis yok).
- **Ilk kez** (`arousal >= 70` + uyku denemesi + henuz oynanmadi): **"Uyuyamiyorum"** lineer olay zinciri (Fiddit/Quorara + Devam) **bir kerelik** oynar; bittiginde masturbasyon unlock flag set edilir.
- Sonraki kezlerde (unlock sonrasi veya zincir tamamlandiktan sonra ayni save'de tekrar `70+` uyku): dogrudan **Uyku gate** + **Try to sleep** dongusu (asagida); uzun "ilk uyuyamama" hikayesi **tekrarlanmaz** (istersen ileride "kisaltilmis tekrar" eklenebilir).
- Guvenlik kosullari:
  - Gunde en fazla 1 kez tetiklensin (uygunsa)
  - Ayni gece tekrar etmesin (uygunsa)
  - Prologue/tutorial gibi istenmeyen fazlarda kapali olsun
- Flag ornegi: `$flags.cantSleepIntroPlayed` veya `$flags.firstCantSleepStoryDone` (implementasyonda tek isim).

## High-Level Flow
1. Oyuncu uyumayi dener.
2. Sistem kontrol eder: arousal yuksekse "uyuyamiyorum" gecesi devreye girer.
3. Kisa narrative + inner voice:
   - "Icimde bir his var"
   - "Zihnim kapanmiyor"
4. Karakter telefona uzanir, fake sosyal/soru platformlarini gezer:
   - `Fiddit` (Reddit benzeri)
   - `Quorara` (Quora benzeri)
5. Ilk tetik zinciri **lineer** oynar: arka arkaya passage'lar, arada sadece **Devam** butonu (oyuncu sahneyi atlama secenegi yok; ilerleme zorunlu).
6. Zincir bittikten sonra **masturbasyon aksiyonu** oyuna acilir (flag veya unlock state).
7. Sahne kapanis:
   - kisa duygu durumu update'i
   - normal uyku akisina geri donus (veya gecikmeli uyku)

## Akis ve Masturbasyon Kilidi (Tasarim Karari)

### Gece / ilk masturbasyon sahne zinciri
- Tetiklenince ilgili metinler **sirayla** oynar; parcalar arasinda yalnizca **Devam** (veya esdeger tek CTA) vardir.
- Oyuncu bu zinciri **atlayamaz** veya dallanamaz; hikaye akisi sabitlenir (v0.1.5 icin bilincli karar).
- Zincir tamamlaninca bir flag set edilir, ornegin: `$flags.masturbationUnlocked` veya `$sexual.masturbationUnlocked` (implementasyonda net isim).

### Masturbasyon aksiyonu (oyunda kullanim kosulu)
- Masturbasyon secenegi / aksiyonu **yalnizca** `fhBedroom` yatak UI'sinda gorunur (simdilik tek yer; ileride ornegin banyo/duş opsiyonel).
- Masturbasyon sonrasi **arousal her zaman tam dusus** (ornegin sifira clamp veya tanimli minimum; "yarim doz" yok).
- Kosullar:
  - Gece zinciri tamamlanmis olmali: `$flags.masturbationUnlocked` (veya secilen flag) `true`
  - `($corruption || 0) >= 1` (v0.1.5: corruption 1 ve uzeri)
  - `$location === "fhBedroom"` (veya projede yatak odasi icin kullanilan tam deger)
  - `arousal >= 70` (projede hangi degisken kullaniliyorsa ayni)
- Zincir henuz tamamlanmadiysa masturbasyon aksiyonu **kapali** kalir (veya gri/disabled + kisa ipucu metni).

### Not
- Gece tetigi (uyku + yuksek arousal) ile masturbasyon aksiyonunun arousal esigi ayni sayida tutulabilir; ileride masturbasyon icin farkli esik istersen ayri degisken tanimlanir.

## Uyku Gate (Yuksek Arousal) ve "Try to Sleep"

### UI girisi (`fhBedroom` yatak butonu)
- `Try to sleep` sahnesi, uyku gate ve (ilk kez) **Uyuyamiyorum** zinciri yalnizca **`fhBedroom`** passage'indaki yatak / uyku **butonundan** tetiklenir.
- `arousal < 70` ise dogrudan normal uyku akisi.
- `arousal >= 70` ise:
  - Ilk kez: once **Uyuyamiyorum** lineer zincir (bitince masturbasyon unlock).
  - Sonraki: **gate** (`%33` aninda uyku) veya **Try to sleep** dongusu.

### Kosul
- Oyuncu **uyumayi dener** (`sleep` / yatak aksiyonu) ve `arousal >= 70` ise normal uyku **otomatik gecmez**; once gate passage devreye girer.

### Davranis
- **3'te 1** (`random(1, 3) === 1` veya `%33`) ihtimalle karakter **dogrudan uyuyabilir**: gate atlanir, standart uyku akisi calisir (zaman/enerji vb. normal kurallar).
- **3'te 2** ihtimalde **uyuyamaz**: `Try to sleep` (veya Turkce etiket: "Uyumayi dene") sahnesi acilir.

### Try to Sleep sahnesi (tekrarlanabilir dongu)
- Her **Tekrar dene** tikinda:
  - `<<advanceTime 15>>` (15 dakika oyun zamani).
  - Sonra `%33` ile uyku basarisi: basariliysa normal uyku passage; basarisizsa `Try to sleep` metni (kisa varyasyonla) devam.
- **Zorunlu uyku (grind onleyici):** Bu gece `Try to sleep` uzerinden harcanan toplam sure **60 dakikayi** (`4 x 15`) gectiyse, bir sonraki uyku denemesinde **%100** normal uyku (zar yok); oyuncu mutlaka uyur.
  - Sayac ornegi: `$trySleepMinutesThisNight` veya `trySleepAttemptsThisNight` (4 deneme = 60 dk); gece degisince sifirlanir.
- **Masturbasyon yap:** unlock + corruption + `fhBedroom` + arousal kosullari; sonrasinda arousal **tam dusus** ile normal uyku akisina donulebilir.
- Masturbasyon henuz unlock degilse **Masturbasyon yap** butonu gorunmez; sadece **Tekrar dene** (ve 60 dk sonra garanti uyku).

### Ilk "Uyuyamiyorum" zinciri ile iliski (net kural)
- **Ilk** `70+` + `fhBedroom` uyku: sadece **Uzun lineer zincir** oynar; bu sirada `Try to sleep` acilmaz.
- Zincir bitince flag + masturbasyon unlock; bundan sonraki `70+` uyku girislerinde: **gate / Try to sleep** (yukaridaki kurallar).

### Test notlari
- `arousal < 70` iken uyku: gate yok, normal uyku.
- `fhBedroom` disinda uyku butonu: bu plan devreye girmemeli.
- Ilk `70+` uyku: uzun zincir bir kez; ikinci kez: gate / try to sleep.
- `Try to sleep` 4 deneme (60 dk) sonrasi: bir sonraki denemede garanti uyku.
- Masturbasyon sonrasi arousal tam dusus dogrulamasi.

## SSS / Notlar (taslak tartisma ozeti)
- **(Eski madde 5 - porn):** Kodda `vanilla`, `anal` vb. kategoriler hala veri yapisinda durabilir; v0.1.5'te UI ve unlock **handjob/blowjob** ile sinirlidir. Ileride vanilla acilinca migration ve `_nextMap` tekrar genisletilir; su an "ilgisiz" degil, sadece **kapali ozellik**.
- **(Eski madde 6 - tekrar):** Ayni gun cok porno izleyince metin tekrari `passages/.../pornWatchRender_repeatable.twee` icindeki uzun `switch` bloklarindan kaynaklanabilir; ayri konu, uyku/masturbasyon planindan bagimsiz.

## Fake Platform Content Blocks
- `Fiddit`:
  - anonim itiraf postlari
  - "normal mi?" temali basliklar
  - kisa yorum zinciri
- `Quorara`:
  - "Bu hissi neden yasiyorum?" sorulari
  - daha "aciklayici" cevap tonu
  - merak/utanma dengesine oynayan metin

## Data Model (Initial)
- `$nightRestlessEventDayKey` : son tetiklenen gun key
- `$nightRestlessEventSeenCount` : toplam gorulme sayisi
- `$nightRestlessSource` : ne tetikledi (simdilik `highArousal`)
- `$phone.fakeFeedSeen.fiddit` / `$phone.fakeFeedSeen.quorara`
- `$flags.nightRestlessUnlocked` (ileri asamalar icin)
- `$flags.masturbationUnlocked` (veya `$sexual.masturbationUnlocked`): gece zinciri tamamlaninca `true`; masturbasyon aksiyonunun UI/gate kosulu ile birlikte kullanilir.

## Suggested Variable Rules
- Gun key:
  - `($timeSys.year * 10000) + ($timeSys.month * 100) + $timeSys.day`
- Tekrar engeli:
  - Eger `nightRestlessEventDayKey === dateKey` ise ayni gun tekrar tetikleme
- Soft scaling:
  - Ilk gorus daha uzun
  - Sonraki gorusler kisaltilmis repeatable versiyon

## Passage / Widget Structure (Suggested)
- New passages:
  - `sleepGate_highArousal` (Bedroom uyku butonundan; `%33` / `Try to sleep` yonlendirmesi)
  - `tryToSleep` (15 dk dongusu; `Tekrar dene` / `Masturbasyon yap`)
  - `nightRestless_highArousal_intro`
  - `nightRestless_phoneFeed`
  - `nightRestless_phoneFeed_fiddit`
  - `nightRestless_phoneFeed_quorara`
  - `nightRestless_resolution`
- Optional widget:
  - `<<triggerNightRestlessIfNeeded>>`
  - Uyku aksiyonu oncesi tek noktadan kontrol

## Stats/Time Effects (v0.1.5 Light)
- Onerilen hafif etkiler:
  - `+stress` kucuk artis (zihin daginik)
  - `-energy` ek maliyet (uyku gecikmesi)
  - istege bagli cok kucuk `-arousal` veya sabit birak
- Zaman:
  - +15 / +25 dakika ek gece gecikmesi

## UX Notes
- Oyuncuya "cezalandirici" degil "durum odakli" his ver.
- Metin tonu:
  - merak + huzursuzluk + kendini gozlemleme
  - asiri uzun paragraf yerine kisa ritimli bloklar
- CTA metinleri net olsun:
  - Zincir icinde: tek buton **Devam** (lineer akis).
  - Zincir sonrasi / genel: "Uyku", "Masturbasyon" (kosullar saglaninca) gibi net etiketler.

## Scope for v0.1.5
- Dahil:
  - tek trigger (`arousal >= 70`)
  - tek gece olayi
  - 2 fake feed kolu (Fiddit + Quorara)
  - basic repeat protection
- Haric:
  - yakalanma sistemi entegrasyonu
  - cok asamali branching sonuclar
  - relation/quest baglantilari

## Quick Implementation Order
1. Degiskenleri init + migration'a ekle.
2. **Bedroom** uyku butonundan giris: uykuya giris noktasina **arousal >= 70 gate** bagla: once `%33` uyku roll, degilse `Try to sleep` passage.
3. `Try to sleep` passage: her denemede `+15 dk`, butonlar `Tekrar dene` / `Masturbasyon yap` (unlock + kosullar).
4. Ilk masturbasyon lineer zincir tetik mantigi ile gate dongusunu tek kuralla hizala (cakisma yok).
5. Intro + phone feed passage'larini yaz (zincir icin).
6. Fiddit/Quorara mikro iceriklerini ekle.
7. Resolution + normal uykuya donus.
8. Repeat guard ve time/stat etkilerini ayarla.
9. Test:
   - arousal 69 -> gate yok, normal uyku
   - arousal 70+ -> cok denemede 15 dk birikimi + `%33` uyku dagilimi
   - ayni gun night event tekrar guard (varsa)

### Integration Note (Current Codebase)
- Gate kontrolu **`sleep.twee` icinde gec uygulanmamalidir**; `sleep.twee` normal uyku hesaplarini ve `advanceTime` adimini calistirir.
- Tetik noktasi, `fhBed -> sleep_prep` akisinda **uykuya girmeden once** olmalidir (gerekirse `sleepGate_highArousal` ara passage'i).
- Onerilen sira:
  - `fhBed` -> `sleep_prep`
  - eger `arousal >= 70` ise `sleepGate_highArousal` / `tryToSleep`
  - degilse normal `sleep`
- Eger teknik sebeple `sleep.twee` icinde kontrol yapilacaksa, dosyanin en basinda erken `goto` ile gate'e sapilmali; normal uyku hesaplarina girilmemelidir.

## Scene Draft (Long Form, TR)

### Part 1 - Gece ve Arastirma

Oda zifiri karanlik. Yorgansin ama uyku bir turlu gelmiyor.

Bir saga, bir sola donuyorsun. Yastigin serin tarafini bulup yuzunu bastiriyorsun, birkac dakika sonra yine ayni huzursuzluk geri geliyor. Kalbin gerektiginden hizli. Bacaklarinin arasinda inatci bir sicaklik var; bastirsan da, toplasan da dagilmiyor.

Nefesini saymayi deniyorsun.
Bir...
Iki...
Uc...

Dorduncude zihnine yine gun icinde gordugun sahneler doluyor. Ekran isigi, sesler, yarim kalan kareler. Dudaklarini isiriyorsun.

"Niye boyle oldum ben?"

Yaklasik yirmi dakika sonra pes ediyorsun. Gozlerini acip komodindeki telefona uzaniyorsun. Ekran yuzunu aydinlatinca gozlerini kisiyorsun ama kapatmiyorsun.

Once amacsizca dolasiyorsun. Bildirimlere bakip cikiyorsun. Sonra parmaklarin arama cubugunda duruyor.

Ne yazacagini bilmiyorsun.

Sonunda su kelimeler dokuluyor:
- "gece uyuyamama vucutta huzursuzluk"
- "asiri istek normal mi"
- "neden geceleri daha kotu hissediyorum"

Sonuclar hizla akiyor.

Fiddit'te anonim basliklar, Quorara'da uzun cevaplar. Bircok kisi benzer seyler yasadigini yazmis. Kimisi "rahatlamam gerekince geciyor" diyor. Kimisi kelimeyi acikca yaziyor:

Masturbasyon.

Ekrana birkac saniye sabit bakiyorsun. Hem cekiniyorsun hem merak artiyor.

Yeni arama aciyorsun:
- "masturbasyon nedir"
- "ilk kez masturbasyon nasil yapilir"
- "kizlarda ilk sefer normal mi"

Okudukca utanma tamamen gitmiyor ama panik biraz azalıyor. Bazi metinler sakince ayni seyi soyluyor: "kendini zorlama", "acirsa dur", "acele etme".

Sayfanin altinda bir oneri beliriyor:
"Beginner girls - first time masturbation, slow and gentle"

Derin bir nefes aliyorsun. Sesi en kisiga indiriyorsun.
Ve videoyu aciyorsun.

### Part 2 - Esik ve Ilk Deneyim

Video bekledigin gibi cikmiyor.

Ne abarti var ne de acele. Sakin bir ses su cumleyi kuruyor:
"Kendine nazik ol. Bu bir yaris degil."

Bu ton icindeki gerginligi biraz geri cekiyor. Telefonu kenara koyuyorsun. Oda yine karanlik, bu kez sessizlik daha az tehditkar.

Yavasca yorganin altinda ellerini hareket ettiriyorsun. Once duruyorsun.

"Belki de yapmamaliyim..."

Ama bedenindeki o inatci gerilim hala orada.

Tekrar deniyorsun. Daha dikkatli, daha yavas.

Ilk anlar yabanci geliyor. Sonra nefesin degisiyor. Omuzlarindaki sertlik yumusuyor. Karninin altinda dalga dalga buyuyen bir baski olusuyor; hem urkutucu hem cekici.

Bir yandan utaniyorsun, bir yandan geri donmek istemiyorsun.

Ritim kendiliginden oturmaya basliyor. Dusunceler azaliyor. Bedenin tek tek cevap vermeye basliyor. Kalbin kulaklarinda atiyor.

"Ne oluyor bana?"

Sonra bir kirilma ani geliyor.
Kisa. Yogun. Sarsici.

Butun bedeninden gecen bir dalga gibi. Nefesin bir an dagiliyor, kaslarin gerilip birakiyor. Yastigi daha sikı tutuyorsun; sesini degil, kendini dengelemek icin.

Yogunluk yavas yavas geri cekiliyor.

Uzun bir sure kipirdamadan yatıyorsun. Nefesin parcali, sonra daha duzenli. Yuzun sicak, zihnin bulanik, ama o baski ilk kez dagilmis gibi.

Telefonu yana itiyorsun. Ekran kapali.

Oda ayni oda, tavan ayni tavan.
Ama icinde bir sey degismis.

Utanc, saskinlik ve rahatlama ayni yerde duruyor. En baskin cumle ise tek bir sey:

"Ilk defa yaptim."

Yorgunluk sonunda bedenine iniyor. Düsunceler seyrelip uzaklasiyor.
Ve fark etmeden uykuya daliyorsun.
