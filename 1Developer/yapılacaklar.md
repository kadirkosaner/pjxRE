- Numara silindiği zaman karakter tepkileri.

- Profile Pictureyi saçın şekline ve rengine göre yapmak.

- bir gün diner'da vince'nin gün sonunda çıkarken toplantı olacak odayı toparla dediğinde pc'yi açık görüp merak edip pcyi incelerken güvenlik kameralarına yakalanan ve vincenin sapık tarafının keşfi

############################################################################################################################

**v0.1.5 Scope Listesi**


**GYM**
- [ ] Workout aktiviteleri (weights, cardio, yoga)
- [ ] 2 yeni karakter (trainer + düzenli müşteri)
- [ ] Stat gain görsel feedback (upperBody, cardio, core)

---


**Lily Talks**
- [ ] Lilly ile birlikte jog yapma
- [ ] Lilly ile jog yaparken belli bir arkadaşlık seviyesi + fitness değeri varsa gym açılır downtownda.

---

**Old Town Coffee**
- [ ] 1-2 karakter ekle
- [ ] Oturma/okuma/çalışma aktivitesi
- [ ] Conversation skill gain



KARAKTERLER (8 yeni NPC)
│
├── Maplewood / Mahalle
│   ├── Mia Harrison (21) ← Komşu, "open" karakter, yönlendirici
│   │   ├── Elena Harrison (44) ← Mia'nın annesi [future encounter]
│   │   └── Robert Harrison (46) ← Mia'nın babası [future encounter]
│   └── Ethan Clarke (21) ← Erkek romantik ilgi, mahalle keşfinde
│
├── Iron Works Gym (Downtown)
│   ├── Nick Santos (32) ← Trainer, sabah/akşam
│   ├── Kayla Morgan (24) ← Kadın regular, sabah
│   └── Tyler Reed (25) ← Erkek regular, öğleden sonra
│
└── The Daily Grind (Old Town)
    └── Leo Harper (24) ← 1. barista, öğleden sonra/akşam

LOKASYONLAR (2 yeni)
│
├── Mia's House ← Maplewood içinde, FamilyHouse gibi
│   ├── Living Room
│   └── [future: bedrooms, parents' room]
│
└── St. Luke's Hospital ← navCards'da var, aktive edilecek
    └── Hospital Room ← yatış odası


STORY ARCLARI (quest zincirleri)

1. LILY ARC (Sunset Park)
   ├── "Jog Together" – Lily parkta iken koş butonu açılıyor
   ├── Fitness Milestone – cardio ≥ 15 sonrası Lily compliment scene
   │   └── → "Fiziğin değişiyor, sen sporcu tipsin" diyalog
   └── Mahalle Dedikodu – Lily Mia'yı tanıtıyor
       └── → Quest: "Meet the Neighbors" başlıyor

2. MİA ARC (Yeni Komşu)
   ├── İlk Karşılaşma – Maplewood'ta dolaşırken
   ├── Ev Ziyareti – Mia eve davet ediyor
   ├── Aile Tanışması – Elena + Robert sahne
   │   ├── Elena: Sıcak, biraz flörtöz, ev kadını
   │   └── Robert: Rahat, başarılı, yakışıklı
   └── [future: dedikodu, beraber alışveriş, corruption hints]

3. COFFEE SHOP ARC (alternatif açılış)
   ├── Jake (Waiter/dinerWaitress3) iş çıkışı davet ediyor
   │   ├── Tetikleyici: totalDaysWorked ≥ 3, iş bitti
   │   └── Jake ile birlikte The Daily Grind'a gidiliyor
   ├── Zoe tanışması (0.1.5'te var, quest sahnesine bağlanacak)
   └── Leo Harper tanışması ← 2. barista, ayrı vardiya

4. GYM SOCIAL ARC
   ├── Nick Santos ← ilk karşılaşma: check-in masasında
   ├── Kayla Morgan ← cardio makinelerinde tanışma
   └── Tyler Reed ← weights alanında tanışma

5. ETHAN ARC (Romantik İlgi)
   ├── Tetikleyici: Mia arki başladıktan sonra, mahalle walk
   └── İlk karşılaşma sahne
