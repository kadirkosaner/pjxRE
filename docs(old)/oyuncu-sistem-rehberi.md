# All That Glitters: Sistem Rehberi

Bu oyun her seyi en bastan acik veren bir sandbox degil. Hikaye ilerledikce yeni yerler, yeni insanlar, yeni aktiviteler ve yeni secenekler acilir. Oyunun pek cok sistemi birbiriyle baglantili calisir; bu da bazen "neden bu secenek yok?" veya "neden karakterim zorlanmaya basladi?" sorularini dogurur. Bu rehber, oyunun temel sistemlerini oyuncu gozuyle kisa ama net sekilde anlatmak icin hazirlandi.

## Oyunun Temel Fikri

Karakteriniz sadece secim yapan biri degil; zamani, bedeni, enerjisi, dis gorunusu, iliskileri ve gunluk rutini olan biri. Bu yuzden oyunda:

- Her yer en bastan acik degildir.
- Her karakter en bastan tanidik degildir.
- Her kiyafet her an giyilemez.
- Her aktivite her durumda yapilamaz.
- Zaman gecirmek bazen bedel yaratir.

Kisacasi oyun, "sec ve gec" mantigindan cok "durumu yonet ve buna gore ilerle" mantigiyla calisir.

## Discovery Sistemi: Her Yer En Bastan Acik Degil

Haritadaki ve oyundaki tum bolgeler, dukkanlar ve alt mekanlar oyunun basinda otomatik olarak acik olmaz. Bircok lokasyon:

- hikaye ilerleyince,
- bir karakter seni yonlendirince,
- bir quest acilinca,
- ya da oraya ilk kez gittiginde

kesfedilmis hale gelir.

Bu sistemin amaci oyunu daha yonlendirilmis, daha anlamli ve daha "merak uyandiran" bir akisla oynatmak. Haritada bir yeri goremiyorsan ya da bir alt bolge acilmadiysa, bu genelde bug degil; o yer henuz kesfedilmemistir.

Oyuncu icin pratik sonuc:

- Yeni bir bolge duyduysan ama haritada yoksa, once hikaye veya quest akisini takip et.
- Bazi mekanlar ana bolge icinde sonradan acilir.
- "Gidemiyorum" hissi bazen enerji veya saatten degil, discovery durumundan kaynaklanir.

## Tanisma ve Karakter Acilimi

Oyundaki herkes en bastan "tam erisimli" degildir. Bir karakteri:

- henuz tanimiyor olabilirsin,
- o an bulundugu yerde olmayabilir,
- mesgul veya uyuyor olabilir,
- ya da hikaye olarak henuz aktif olmayabilir.

Bir karakteri tanimak ve onunla duzenli etkilesime girmek, yeni diyaloglari ve bazen yeni olaylari acar. Bu yuzden karakter sisteminde iki farkli mantik vardir:

- `known`: karakterin artik tanidik biri olmasi
- `available`: karakterin o anda uygun durumda ve uygun mekanda olmasi

Bu ikisi ayni sey degildir. Birini taniyor olman, onu her an bulabilecegin anlamina gelmez.

## Her Seyin Bir Bedeli Var: Ceza ve Sonuc Mantigi

Oyunda pek cok sey "ucretsiz" degildir. Ceza sistemi tek bir ekrandan gelen tek bir sistem degil; farkli katmanlardan gelir:

- Zaman gecer.
- Enerji azalir.
- Ihtiyaclar artar.
- Dikkatsiz ilerlersen saglik veya mod duser.
- Yanlis durumda kalirsan bazi aksiyonlar kapanir.

Bu sistemin en temel amaci, gunu planlamani gerektirmektir. Oyun senden sadece secim istemez; ritim yonetmeni de ister.

Ozellikle dikkat edilmesi gerekenler:

- Enerji cok dusukse bazi aksiyonlar yapilamaz.
- Enerji sifira yaklasirsa karakter bayilabilir veya coker.
- Saglik kritik seviyeye inerse ayri bir ceza akisi devreye girebilir.
- Saat cok ilerlediyse bazi mekanlar kapanir.

Yani bazen sorun "bu secenek bugli" degil, "karakterin bu secenegi su an kaldiramiyor" olabilir.

## Time Sistemi: Oyun Surekli Akmiyor, Dakika Dakika Ilerliyor

Oyundaki zaman sistemi cok onemlidir. Konusmalar, aktiviteler, eventler, dinlenme, yemek, calisma ve yolculuk zaman tuketir.

Bu su anlama gelir:

- Saat ilerledikce karakterlerin konumu degisebilir.
- Bazi eventler sadece belli saatlerde tetiklenir.
- Bazi mekanlar kapanir.
- Gun degisince gunluk sistemler sifirlanir veya guncellenir.

Kisa ornekler:

- Kisa bir konusma 15 dakika surebilir.
- Bir egzersiz 30-45 dakika alabilir.
- Uzun aktiviteler gun icindeki tum planini etkileyebilir.

Oyunun ritmini anlamanin en iyi yolu saat kutusuna dikkat etmektir. "Bir tane daha aktivite yapayim" karari bazen o gunun tamamini degistirir.

## Need Sistemi: Aciklik, Susuzluk, Tuvalet, Hijyen

Karakterin sadece enerjiyle yasamaz. Oyun istege bagli simulation ayarlariyla su ihtiyac sistemlerini takip eder:

- Hunger
- Thirst
- Bladder
- Hygiene

Bu sistemler acikken:

- zaman gectikce artar veya azalir,
- kritik esiklerde baska statlari da bozmaya baslar,
- gunluk aktivitelerde verimini dusurebilir,
- yanlis zamanda seni zor durumda birakabilir.

Bu sistemler kapaliyken, ilgili etkiler de kapanir. Yani oyun bu ayarlari artik sadece "gorunurluk secenegi" gibi degil, gercek gameplay toggles olarak ele alir.

Not:

- `Hygiene Impact` su an icin daha cok `Looks` tarafina etki eder.
- Hijyenin ileride daha bagimsiz ve daha buyuk bir sistem haline gelmesi planlanabilir, ama mevcut durumda ana etkisi gorunus tarafindadir.

## Stat Calculation: Gecedeki Gizli Matematik

Oyunun pek cok gorunen degeri aslinda baska degerlerden turetilir. Ornegin:

- `Fitness`, fiziksel alt statlarin ortalamasindan dogar.
- `Looks`, sadece kiyafetten degil; gorunus, hijyen, kiyafet ve makyaj kombinasyonundan olusur.
- `Confidence`, charisma ve looks gibi katmanlardan beslenir.

Bu yuzden bazen oyuncular su hissi yasayabilir:

"Ben sadece bir sey yaptim ama birkac stat birden degisti."

Bu normaldir. Cunku oyun sadece direkt etkiyi degil, o etkinin turetilmis sonuclarini da hesaplar.

Kisacasi:

- Her artis tek basina yasamaz.
- Bazi statlar zincirleme etki yaratir.
- Gorunmeyen hesaplamalar, gorunen sonucu belirler.

## Wardrobe Sistemi: Sadece Giyinmek Degil, Bir Oynanis Katmani

Wardrobe sistemi oyunun en detayli katmanlarindan biridir. Burada mesele sadece "ustume bir sey giyeyim" degildir.

Kiyafetlerin:

- tarz etiketleri vardir,
- looks katkisi vardir,
- exposure ve sexiness seviyeleri vardir,
- confidence, corruption, exhibitionism veya heels skill gereksinimleri olabilir,
- zamanla kirlenme veya dayaniklilik kaybi yasayabilir.

Bu sistemin oyuncu icin onemli sonuclari:

- Her kiyafet her karakter gelisim seviyesinde kullanilamaz.
- Daha cesur kiyafetler bazen confidence veya corruption ister.
- Bazi kiyafetler sadece gorunus degil, oynanis bariyeri de yaratir.
- Outfit secimi bazi aktiviteleri acabilir veya kapatabilir.

Wardrobe sistemiyle ilgili bilmen gereken incelikler:

- Ciplaklik, sadece ic camasiri, commando gibi durumlar ayri ayri algilanir.
- Kiyafet tarzi, topbar ve gorunus hissini degistirebilir.
- Kiyafetlerin kirlenmesi ve laundry mantigi vardir.
- Kiyafet asinmasi uzun sureli kullanimda etkili olur.
- Heels kullanimiyla bagli bir beceri takibi de vardir.

Yani wardrobe, kozmetik bir menu degil; aktif bir oynanis sistemidir.

## Kiyafet Gereksinimleri Neden Onemli?

Bir kiyafeti satin alabiliyor olman veya uzerine gecirebiliyor olman, onun senin icin uygun oldugu anlamina gelmez. Sistem sunlara bakabilir:

- Confidence
- Exhibitionism
- Corruption
- Heels skill

Bu sayede kiyafet secimi, karakter gelisimiyle bagli kalir. Oyunun mantigi su: karakterin henuz tasiyamayacagi bir gorunusu ucretsiz ve risksiz sekilde vermez.

## Skill Decay ve Relation Decay

Oyunda sadece stat kasmak yoktur; ihmalin de sonuclari olabilir.

### Skill Decay

Bu ayar aciksa, uzun sure kullanilmayan beceriler zamanla zayiflayabilir. Sistem:

- becerinin kategorisine,
- seviyesine,
- en son ne zaman kullanildigina

bakar.

Yani her beceri ayni hizda dusmez. Bazi alanlar daha hizli, bazilari daha yavas yipranir.

### Relation Decay

Bu ayar aciksa, uzun sure hic gorusmedigin tanidik karakterlerle arandaki bag soguyabilir. Su anki mantik:

- tanidigin karakterler takip edilir,
- onlari uzun sure gormezsen iliski sogumaya baslar,
- duzenli temas iliskileri daha stabil tutar.

Bu sistemin mesaji basit: iliskiler sadece bir kez kurulup sonsuza kadar sabit kalmaz.

## Body System ve Appearance Katmani

Karakterin fiziksel durumu tek bir sayidan ibaret degildir. Oyun:

- kilo,
- yag ve kas dagilimi,
- body type,
- sac uzamasi,
- sac daginikligi,
- vucut killari,
- makyaj asınmasi,
- hair care / face care / dental care

gibi katmanlari ayri ayri ele alir.

Hepsi ayni anda buyuk, dramatik degisimler yaratmaz. Ama uzun vadede karakterin gorunus hissini biriktirir. Bu katmanlar ozellikle:

- looks hesaplamasina,
- gunluk rutin hissine,
- kendini toparlama ve bakim akisina

etki eder.

Oyunun burada vermek istedigi his sudur: karakter sabit bir kukla degil, zamanla yasayan bir bedendir.

## System Widgets Ne Yapar?

Oyundaki pek cok seyin ortak mantigi "widget" katmaninda yasar. Oyuncu bunu dogrudan gormez ama etkisini hisseder.

Bu ortak sistemler:

- zamani ilerletir,
- ihtiyaclari gunceller,
- statlari yeniden hesaplar,
- gunluk decay veya resetleri calistirir,
- karakter konumlarini degistirir,
- bildirimleri ve ikonlari gunceller.

Bu yuzden bazen tek bir secim, birden fazla alani etkiler. Oyun bunu "tek olay = tek sonuc" mantigiyla degil, "tek olay = bagli sistemlerin beraber calismasi" mantigiyla kurar.

## Oyuncularin En Cok Yasadigi Karisikliklar

### "Neden bu mekan gorunmuyor?"

Cunku henuz kesfedilmemis olabilir.

### "Neden bu karakter burada yok?"

Cunku:

- seni taniyor olmayabilir,
- o saatte o mekanda olmayabilir,
- mesgul olabilir,
- o hikaye akisinda henuz aktif olmayabilir.

### "Neden bu kiyafeti giyemiyorum?"

Muhtemelen confidence, corruption, exhibitionism veya heels skill gereksinimi vardir.

### "Neden bir anda bir suru stat degisti?"

Cunku oyun direkt etkiyi ve turetilmis etkiyi beraber hesaplar.

### "Neden oyun beni cezalandirdi gibi hissediyorum?"

Cunku sistemler birbiriyle baglidir. Enerji, saat, ihtiyac, saglik, kiyafet ve gorunus birlikte calisir.

Bu tasarimin amaci oyuncuyu cezalandirmak degil; gunu ve karakteri yonetmeyi onemli hale getirmektir.

## En Iyi Oynanis Ipuclari

- Her gunu rastgele doldurma; saat, enerji ve ihtiyaclari birlikte dusun.
- Yeni yerler acmak icin hikaye ve quest yonlendirmelerini takip et.
- Wardrobe sistemini hafife alma; kiyafet secimi sadece estetik degil, mekanik deger tasir.
- Kendini toparlama aktivitelerini bos gecme; dusuk enerji ve kotu rutinin zincirleme bedeli olabilir.
- Bir karakteri onemsiyorsan onunla sadece bir kez degil, duzenli olarak etkilesime gir.
- Her kilitli secenek bug degildir; cogu zaman sistem senden once baska bir kosulu tamamlamani bekliyordur.

## Son Soz

All That Glitters, "butun butonlar bastan acik" bir oyun olmaktan cok, zamanla acilan ve oyuncudan durum yonetimi isteyen bir deneyim olarak tasarlandi. Discovery, iliski, wardrobe, zaman, ihtiyaclar ve turetilmis statlar birlikte calistiginda oyun cok daha anlamli hale gelir.

Bir seyin kapali olmasi, gorunmemesi ya da karakterin bir eylemden geri cekilmesi genelde rastgele degil; bir sistemin sana verdigi geri bildirimdir.

Bu oyunda ilerleme sadece yeni sahne gormek degil, sistemleri okumayi ogrenmektir.
