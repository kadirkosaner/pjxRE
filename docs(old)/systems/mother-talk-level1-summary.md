# Mother Talk System — Level 1 Content Summary

## Sistem Mimarisi

```
Talk tetiklenir → friendshipLevel okunur → level1 topic havuzu
    ↓
location + timeSlot → contextKey (örn: "fhKitchen_morning")
    ↓
randomTopic → randomVariation → <<print _topic.text>>
    ↓
gainCharacterStat (friendship / trust / love)
```

## Stat Kazanımları

| Stat       | Min | Max | Notlar                   |
| ---------- | --- | --- | ------------------------ |
| friendship | +1  | +2  | Her diyalogda az kazanım |
| trust      | +1  | +2  | Samimi anlarda           |
| love       | +1  | +2  | Nadiren, özel bağlam     |
| energy     | -5  | -5  | Her talk'ta sabit        |
| mood       | +3  | +3  | Her talk'ta sabit        |

---

## 10 Context — Topic & İçerik Özeti

### 🍳 Kitchen — Morning

| Topic       | İçerik                                           |
| ----------- | ------------------------------------------------ |
| `coffee`    | Kahve bekleme, uykusuzluk, yeni ev sesleri       |
| `breakfast` | Yumurta/tost yapımı, market listesi, ayakta yeme |
| `smalltalk` | Isıtma sorunu, hava, garaj kapısı gürültüsü      |

### 🍳 Kitchen — Afternoon

| Topic       | İçerik                                             |
| ----------- | -------------------------------------------------- |
| `leftovers` | "Yemedin mi?" baskısı, yalnız yemek, fazla pişirme |
| `chores`    | Işık bırakma, sallanayan raf, geri dönüşüm         |
| `errand`    | Market alışverişi, çay molası, tahıl kutusu        |

### 🍳 Kitchen — Evening

| Topic    | İçerik                                                    |
| -------- | --------------------------------------------------------- |
| `dinner` | Sofra kurma, sos tatma, makarna süzme                     |
| `family` | Baba geç kalıyor, "ne yaptın bugün", Jake hakkında endişe |
| `help`   | Tencere gözleme, birlikte bulaşık, zeytinyağı arama       |

---

### 🛋️ Living Room — Morning

| Topic      | İçerik                                          |
| ---------- | ----------------------------------------------- |
| `news`     | Haber izleme, yağmur haberi, "nasılsın?" sorusu |
| `laundry`  | Çamaşır katlama, kayıp çorap, giysileri götürme |
| `newHouse` | Gece sesleri, kanepenin yeri, fotoğraf asmak    |

### 🛋️ Living Room — Afternoon

| Topic     | İçerik                                              |
| --------- | --------------------------------------------------- |
| `reading` | Kötü ama bırakamadığı kitap, uyuyakalmak, bitti mi? |
| `tv`      | Berbat dizi, birlikte sinir olmak, sessizlik        |
| `task`    | Ev listesi, toz almak, duvara çivi çakmak           |

### 🛋️ Living Room — Evening

| Topic      | İçerik                                                   |
| ---------- | -------------------------------------------------------- |
| `unwind`   | Film seçimi, listenin 2'sini halletti, papatya çayı      |
| `checkIn`  | "Gerçekten nasılsın?", ağır hissediyorum, kapıda dikilme |
| `endOfDay` | Geç yatma uyarısı, arka kapı kilidi, bardak toplama      |

---

### 🌿 Backyard — Morning

| Topic         | İçerik                                                  |
| ------------- | ------------------------------------------------------- |
| `garden`      | Çok yıllık bitki planı, yabani ot temizleme, su miktarı |
| `coffee`      | Bahçede sessiz kahve, güneş depolamak, kuş sesi         |
| `quietMoment` | Hiçbir şey yapmamak, anı takdir etmek, birlikte oturmak |

### 🌿 Backyard — Afternoon

| Topic         | İçerik                                                   |
| ------------- | -------------------------------------------------------- |
| `watering`    | Toprağı okumak, sulama görevi vermek, büyük kova önerisi |
| `resting`     | Bahçe kitabı uykusu, sıcak oturma, arıyı izlemek         |
| `observation` | Budama felsefesi, lavanta kıskançlığı, gölge köşesi      |

---

### 🛏️ Parents Room — Morning

| Topic          | İçerik                                                            |
| -------------- | ----------------------------------------------------------------- |
| `gettingReady` | Aynada fırçalama, bluz seçimi, yatak toplama dersi                |
| `lost`         | Kayıp gözlük, çantasında telefon, kullanılmayan anahtar           |
| `bedMaking`    | Birlikte yatak yapma, pazartesi çarşaf günü, 30 yıllık alışkanlık |

### 🛏️ Parents Room — Evening

| Topic        | İçerik                                                        |
| ------------ | ------------------------------------------------------------- |
| `tired`      | Ayak ağrısı, "iyi yorgunluk", pijamada kontrol                |
| `goodnight`  | Kitap okurken, lamba kapanırken, "burada olduğumuza sevindim" |
| `reflection` | Eski mahalle özlemi, paketlenmemiş kutu, sabah yanılgısı      |

---

## Slot Fallback Kuralları

| Lokasyon    | morning | afternoon  | evening      |
| ----------- | ------- | ---------- | ------------ |
| Kitchen     | ✅      | ✅         | ✅           |
| LivingRoom  | ✅      | ✅         | ✅           |
| Backyard    | ✅      | ✅         | ⬅️ afternoon |
| ParentsRoom | ✅      | ⬅️ evening | ✅           |

---

## Dosya Listesi

| Dosya                        | Durum                      |
| ---------------------------- | -------------------------- |
| `MotherTopicsLevel1.twee`    | ✅ Tamamlandı (90 diyalog) |
| `motherTalkKitchen.twee`     | ✅ Yeniden yazıldı         |
| `motherTalkLivingRoom.twee`  | ✅ Yeniden yazıldı         |
| `motherTalkBackyard.twee`    | ✅ Yeniden yazıldı         |
| `motherTalkParentsRoom.twee` | ✅ Yeniden yazıldı         |
| `MotherTopicsLevel2.twee`    | ⏳ v0.2'de yazılacak       |
