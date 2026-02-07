# A NEW HEARTH - Ekonomi Oran/Orantı Referans Tablosu
# Gerçekçi Dolar Ölçeği (Ölçek A)

> Bu dosya gelecekte yeni iş, item, kıyafet, mağaza eklerken fiyat/maaş/oran belirlemek için kullanılır.
> İmplementasyon detayı yoktur. Sadece "ne kadar olmalı?" sorusuna cevap verir.

---

## 1. MEVCUT ANCHOR FİYATLAR (Referans Noktaları)

```
Bu fiyatlar oyundaki sabit referans noktalarıdır. Yeni her şey bunlara göre oranlanır.

YEMEK/İÇECEK                 BAKIM                         KIYAFETler
━━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━━━━━            ━━━━━━━━━━━━━━━━━━━
Apple:        $0.75            Toothpaste:    $3.50/30       Socks:          $3
Water:        $1.00            Wet Wipes:     $4.00/30       Panties:        $5
Chocolate:    $1.50            Comb:          $5 (sınırsız)  T-shirt:        $8
Coffee:       $2.50            Hair Cream:    $8.00/30       Bra:           $15-18
Energy Drink: $3.50            Face Cream:    $8.00/30       Leggings:      $18
Sandwich:     $5.50            Makeup Kit:    $25/30         Sandals:       $20
                               Portable MU:   $35/30         Pajama:        $22
KITAP/DERGİ                    Perfume:       $40/30         Sneakers:     $28-35
━━━━━━━━━━━━━━━━━━━            Skincare Set:  $45/30         Jeans:         $30
Magazine:     $3.50                                          Dress:         $35
Math Book:    $15              ARAÇ
Psychology:   $18              ━━━━━━━━━━━━━━━━━━━            TAKI
                               Umbrella:      $12            ━━━━━━━━━━━━━━━━━━━
                                                             Bracelet:     $10-55
                                                             Earrings:     $12-65
                                                             Necklace:    $15-120
```

---

## 2. YENİ İTEM EKLEME ORAN TABLOSU

### 2.1 Yiyecek & İçecek

```
TIER            FIYAT           $/STAT            ÖRNEKLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ucuz atıştırma  $0.50-1.50      ~$0.05-0.10/stat  Apple, Water, Chocolate
Standart        $2.00-4.00      ~$0.10-0.15/stat  Coffee, Energy Drink
Doyurucu        $4.00-8.00      ~$0.12-0.18/stat  Sandwich, Burger(yeni)
Restoran yemek  $8.00-15.00     ~$0.15-0.20/stat  Steak, Pasta(yeni)
Lüks yemek      $15.00-30.00    ~$0.20-0.30/stat  Fine dining(yeni)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Pahalı yemek = daha fazla stat ama birim başına daha pahalı.
       Evde yemek bedava (hunger -50, energy +30) → dışarı yemek bundan pahalı olmalı ama ek bonusları olmalı.
```

### 2.2 Bakım & Kozmetik (maxUses: 30)

```
TIER            FIYAT/30        $/KULLANIM        ÖRNEKLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Temel bakım     $3-8            $0.10-0.27        Toothpaste, Wipes
Orta bakım      $8-15           $0.27-0.50        Hair/Face Cream
Güzellik        $20-35          $0.67-1.17        Makeup Kit, Portable MU
Premium         $35-50          $1.17-1.67        Perfume, Skincare Set
Lüks (gelecek)  $50-80          $1.67-2.67        Designer Perfume, Spa Kit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Günlük bakım maliyeti maaşın %2-5'ini geçmemeli.
       Bulaşıkçı ($28/gün) → max $1.40/gün bakım
       Garson ($45/gün ort.) → max $2.25/gün bakım
```

### 2.3 Kitap & Eğitim

```
TIER            FIYAT           SKILL/KİTAP       ÖRNEKLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dergi           $3-5            +1-3 skill        Fashion Weekly
Giriş kitap     $12-18          +5-8 skill        Math Basics, Psychology
Orta kitap      $18-30          +8-12 skill       (gelecek)
İleri kitap     $30-50          +12-18 skill      (gelecek)
Kurs/Sertifika  $80-150         +20-30 skill      (gelecek, iş gereksinimi)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: $3-5 per skill point. Pahalı kitap = daha yoğun skill ama $/skill oranı sabit kalmalı.
```

### 2.4 Araç & Ekipman

```
TIER            FIYAT           KULLANIM          ÖRNEKLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Basit araç      $5-15           Sınırsız          Comb, Umbrella
Orta araç       $15-40          Sınırsız          Yoga mat, Notebook(gelecek)
Pahalı araç     $40-100         Sınırsız          Gym set, Laptop(gelecek)
Çok pahalı      $100-300        Sınırsız          Telefon, Bisiklet(gelecek)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Araçlar tek seferlik alım, sınırsız kullanım. Fiyat = kaç günde kazanılır ile orantılı.
       1 gün maaş → basit araç. 1 hafta maaş → pahalı araç. 1 ay maaş → çok pahalı.
```

---

## 3. YENİ KIYAFETekleme ORAN TABLOSU

### 3.1 $/Looks Oranı

```
QUALITY         LOOKS     FIYAT          $/LOOKS      BİRİKİM SÜRESİ (garson)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Common          1-6       $3-35          $3-8         < 1 gün
Rare            5-8       $50-120        $10-15       1-3 gün
Premium         7-10      $100-200       $15-20       3-5 gün
Luxury          8-12      $150-350       $20-30       1-2 hafta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.2 Kategori Bazlı Fiyat Aralıkları

```
KATEGORİ        COMMON         RARE           PREMIUM        LUXURY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Üst (top)       $8-15          $50-70         $100-140       $150-220
Alt (bottom)    $15-30         $60-90         $110-160       $170-280
Elbise          $25-40         $70-120        $130-200       $200-350
Ayakkabı        $15-35         $55-85         $100-150       $150-250
İç çamaşırı    $3-8           $15-30         $35-60         $60-100
Çorap           $3-5           $8-15          $15-25         —
Pijama          $15-25         $35-55         $60-90         —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.3 Takı Fiyat Aralıkları

```
KATEGORİ        COMMON         RARE           PREMIUM        LUXURY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Küpe            $10-20         $50-80         $100-180       $200-400
Kolye           $12-25         $60-120        $130-250       $250-500
Bileklik        $8-15          $40-60         $80-150        $150-300
Yüzük           $15-30         $60-100        $120-250       $250-600
Saat            —              $80-150        $150-350       $350-800
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. YENİ İŞ EKLEME ORAN TABLOSU

### 4.1 Maaş Skalası

```
TIER    İŞ TÜRÜ              $/SAAT    GÜNLÜK(4s)   HAFTALIK(5g)   AYLIK(20g)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1       Vasıfsız              $7        $28          $140           $560
2       Giriş seviye          $8-9      $32-36       $160-180       $640-720
3       Deneyimli             $10-12    $40-48       $200-240       $800-960
4       Nitelikli             $13-16    $52-64       $260-320       $1,040-1,280
5       Uzman                 $17-22    $68-88       $340-440       $1,360-1,760
6       Yönetici/Profesyonel  $23-30    $92-120      $460-600       $1,840-2,400
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Her tier bir üstünden ~%25-40 daha az kazanır.
       Tier 1 → hiç gereksinim yok.
       Tier 6 → yüksek skill + deneyim + ilişki gerekir.
```

### 4.2 Bahşiş Oranları (Müşteri Yüzlü İşler)

```
İŞ TÜRÜ              BAZ BAHŞİŞ      MAX BAHŞİŞ      BAHŞİŞ FORMÜLÜ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Garson/Waitress       $5-10           $19             base + charisma/20 + looks/25
Barista               $3-7            $14             base + charisma/25 + looks/30
Kuaför Asist.         $5-12           $22             base + charisma/20 + makeup_skill/20
Bar                   $8-15           $28             base + charisma/15 + looks/20
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Bahşiş = toplam maaşın %15-35'i kadar olmalı.
       Düşük stat → base only. Yüksek stat → base + bonus.
```

### 4.3 İş Stat Maliyet Oranları

```
İŞ AĞIRLIĞI      ENERGY    MOOD     STRESS   HYGIENE    ÖZEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hafif fiziksel   -30       -5       +10      -10        (Barista, Kasiyer)
Orta fiziksel    -40       -10      +15      -15        (Garson, Resepsiyon)
Ağır fiziksel    -50       -15      +20      -30        (Bulaşıkçı, İnşaat)
Mental           -35       -10      +20      -5         (Freelance, Ofis)
Sosyal           -35       -5       +15      -10        (Satış, Bar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Yüksek maaş = yüksek stat maliyeti.
       Çalışma sonrası oyuncunun en az 2-3 aktivite yapabilecek enerjisi kalmalı.
       4 saatlik vardiyada hunger/thirst +20 (doğal decay: 4 × +5/saat).
```

### 4.4 İş Skill Kazanım Oranları

```
İŞ TÜRÜ              PRİMER SKILL       SEKONDER SKILL      TOPLAM/VARDİYA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bulaşıkçı            Cleaning +3         Cooking +1          4
Garson               Social +2           Cooking +2          4
Barista              Cooking +3          Social +1           4
Kasiyer              Social +2           Finance +1          3
Kuaför Asist.        Makeup +3           Social +1           4
Freelance Yazar      Writing +4          Creativity +1       5
Kişisel Antrenör     Fitness-related +3  Social +2           5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: 4 saatlik vardiyada 3-5 toplam skill point.
       ~1 skill point/saat oranı hedef.
       Ana skill daha yüksek gain, yan skill daha düşük.
```

---

## 5. GENEL DENGE FORMÜLLERI

### 5.1 Birikim Süresi Testi

```
Yeni bir şey eklerken bu testi uygula:

  GÜNLÜK TÜKETIM (yemek, bakım):
    → Bulaşıkçı 1 günde alabilmeli ($28 altı)
    → Garson 1 günde alabilmeli ($45 altı)

  HAFTALIK ALIM (kıyafet, aksesuar):
    → Garson 1 haftada alabilmeli ($200 altı = Common/Rare)
    → Garson 2-3 haftada alabilmeli ($200-600 = Premium)

  AYLIK HEDEF (lüks, ekipman):
    → Garson 1 ayda alabilmeli ($800 altı)
    → Daha yüksek işler gerektirir ($800+ = Luxury)

  UZUN VADELİ (3+ ay):
    → Sadece yüksek tier işlerle ($2,000+)
    → Araba, ev eşyası, vs.
```

### 5.2 Maaş-Item İlişki Tablosu

```
MAAŞ TIER       HAFTALIK      ERİŞEBİLİR KATEGORİ         ALAMAYACAĞI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tier 1 ($140)    $135 net     Common kıyafet, temel bakım    Rare+
Tier 2 ($180)    $175 net     Common + ucuz Rare             Premium+
Tier 3 ($240)    $235 net     Common + Rare                  Luxury
Tier 4 ($320)    $315 net     Common + Rare + Premium        —
Tier 5 ($440)    $435 net     Hepsi dahil Luxury            Sadece çok pahalı
Tier 6 ($600)    $595 net     Her şey                       —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5.3 Yeni Mağaza Fiyat Aralığı Testi

```
Yeni mağaza eklerken:

  UCUZ MAĞAZA (Corner Shop tarzı):
    → En ucuz item: $0.50-1
    → En pahalı item: $15-20
    → Ortalama: $5-8

  ORTA MAĞAZA (Trendy Threads tarzı):
    → En ucuz item: $3-8
    → En pahalı item: $35-60
    → Ortalama: $15-25

  PAHALI MAĞAZA (Sparkle & Shine tarzı):
    → En ucuz item: $10-20
    → En pahalı item: $120-200
    → Ortalama: $40-80

  LÜX MAĞAZA (gelecek):
    → En ucuz item: $50-100
    → En pahalı item: $300-800
    → Ortalama: $150-300
```

---

## 6. QUEST ÖDÜL ORAN TABLOSU

```
QUEST ZORLUK     ÖDÜL ($)       ÖDÜL (ITEM)              REFERANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tutorial/Basit   $10-30         1 Common item             Market quest: $20
Orta             $30-80         1-2 Common item           new_beginnings: $100
Zor              $80-150        1 Rare item               (gelecek)
Çok Zor          $150-300       1 Premium item            (gelecek)
Ana Hikaye       $200-500       Özel item + unlock        (gelecek)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KURAL: Quest ödülü = o aşamadaki 1-3 günlük maaş karşılığı.
       Çok cömert olma — oyuncuyu çalışmaya yönlendirmeli.
```

---

## 7. ÖZET: ALTIN ORANLAR

```
1 saat çalışma         = $7-30 (tier'e göre)
1 günlük bakım         = maaşın %2-5'i
1 Common kıyafet       = 1 günlük maaştan az
1 Rare kıyafet         = 1-3 günlük maaş
1 Premium kıyafet      = 3-5 günlük maaş (= ~1 hafta)
1 Luxury kıyafet       = 1-2 haftalık maaş
1 skill point (kitap)  = $3-5
1 bahşiş               = maaşın %15-35'i
Bakım $/kullanım       = $0.10-1.67
Yemek $/stat           = $0.05-0.30
```

---

*Gelecekte yeni iş, item, kıyafet, mağaza veya quest eklerken bu tablolara bak.*
*Oranlar değişirse bu dosyayı güncelle.*
