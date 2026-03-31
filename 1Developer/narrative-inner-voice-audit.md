# Narrative / Inner voice — tarama raporu

**İlgili:** Anlatı modları, ton, zaman, ritim için ayrıca **`narrative-deep-audit.md`** (detaylı anlatı incelemesi).

**Kapsam:** `passages/1 - Prologue`, `passages/3- Interactions`, `passages/4 - Actions`, `passages/5 - QuestSystem/Quests` içindeki tüm `.twee` dosyaları (otomatik tarama: `<<thought>>`, `(Inner voice)`).

**Hedef sistem (onaylı):**

| Katman | Şahıs | Makro / not |
|--------|--------|-------------|
| **Anlatıcı (`<<narrative>>`)** | Oyuncuya anlatan ses; **ikinci şahıs *you* kullanılabilir** (standart). İç monolog buraya değil, iç sese. | `<<narrative>>` (ve uygun sahnelerde düz metin) |
| **İç ses** | Birinci şahıs *I / me / my* | `<<dialog "player">>` + `(Inner voice)` |
| **Eski kalıp** | `<<thought>>` kullanma | Varsa → narrative + `<<dialog "player">>` iç ses |

Bu dosya **yalnızca öneri listesidir**; değişiklikler sen onayladıktan sonra uygulanır.

---

## 1. `<<thought>>` durumu

Belirtilen dört kökte **`<<thought>>` eşleşmesi yok** (Diana / gossip / beautySearch dönüşümleri sonrası temiz).

**Aksiyon:** Yok (bu kapsamda).

---

## 2. `(Inner voice)` geçen dosyalar — envanter ve öneri

### 1 - Prologue

| Dosya | Not | Önerilen aksiyon |
|--------|-----|-------------------|
| `13 - prologueBedroom.twee` | 2 iç ses; `I need to ask` zaten uygulandı | **Yok** veya başlık yorumuna voice kuralı ekle |
| `17 - prologueNightEnd.twee` | 4 iç ses; parça ton (`First night…`, `And ahead?`, `Maybe I'll be okay`, `Maybe.`) | **İsteğe bağlı:** kuralı sıkı tutmak istersen hafif *I* (`I'm in a new city…` vb.); **ya da** mevcut parça stilini **bilinçli istisna** olarak dokümantasyonda bırak |

**Diğer prologue dosyaları:** `(Inner voice)` yok (6–12, 14–16, 18, ayarlar, vb.) — bu kuralla çakışan blok tespit edilmedi.

---

### 3 - Interactions

| Dosya | Not | Önerilen aksiyon |
|--------|-----|-------------------|
| `Emma/emmaTalkDinerRubys_dianaGossip.twee` | Kapanış: narrative + `(Inner voice)` | **Yok** (güncel) |
| `Sofia/sofiaTalkDinerRubys_dianaGossip.twee` | Aynı | **Yok** (güncel) |

**`talkDatabase/*.twee` ve diğer konuşmalar:** Çoğunlukla `<<dialog "player">>` = **yüksek sesle söylenen replik**; `(Inner voice)` etiketi yok. Bunlar **iç ses kuralına tabi değil** (NPC’ye konuşma). İleride bir satırın “iç monolog gibi” okunduğu yerler **manuel oyun testi** ile ayıklanabilir.

**Aksiyon (otomatik tarama):** Zorunlu değişiklik yok.

---

### 4 - Actions

| Dosya | Not | Önerilen aksiyon |
|--------|-----|-------------------|
| `events/.../diana/*.twee` (Arrival, Kitchen, Night, beautyThoughts, brotherComputer_beautySearch) | Voice kuralı uygulandı | **Yok** |
| `parkWalk_bushEncounter.twee` | İç seslerde *my / I* | **Yok** (güncel) |
| `parkWalk_bushWatch.twee` | İç ses çoğunlukla *She…* gözlem + bazı *I* | **İsteğe bağlı:** gözlem satırlarına kısa *I* köprüsü (tasarım tercihi) |
| `global/energyHealth/*.twee` (5 dosya) | İç ses *I* ağırlıklı | **Yok** |
| **Diğer ~60+ Actions dosyası** | `(Inner voice)` yok | Sadece `<<narrative>>` / eylem / menü — **tarama dışı bırakıldı** (iç ses eklenecekse ayrı tasarım) |

---

### 5 - QuestSystem/Quests

| Dosya | Not | Önerilen aksiyon |
|--------|-----|-------------------|
| `useComputer/quest_use_computer_01_start.twee` | *I* iç ses | **Yok** (güncel) |
| `useComputer/quest_use_computer_02_district_map.twee` | *I live now* | **Yok** (güncel) |
| `useComputer/quest_use_computer_03_career_center.twee` | *I* iç ses | **Yok** |
| `movingTroubles/quest_moving_troubles_sounds.twee` | 3 iç ses | **Yok** |
| **findJob, gotoOldtown, newBeginnings, …** | `(Inner voice)` yok | Aksiyon yok |

---

## 3. İsteğe bağlı / manuel işler (otomatik bulunamaz)

1. **Prologue yaşam öyküsü sayfaları (5–12, vb.):** Çoğunlukla üçüncü şahıs özet anlatı; sistem “present day” prologue ile aynı değil — **ayrı stil** olarak bırakılabilir.
2. **İlk iş günü / mirror / sleep** gibi uzun narrative pasajlar: İç monolog **eklenmek** istenirse ayrı yazım görevi; mevcut metinde `(Inner voice)` zorunluluğu yok.
3. **`talkDatabase`:** Binlerce satır; sadece “bu aslında düşünce” hissi veren **konuşulan** replikleri oyun içinde işaretle, sonra tek tek ayır.

---

## 4. Onay sonrası yapılabilecek küçük paketler (özet)

| Paket | İçerik | Öncelik |
|--------|--------|---------|
| **A** | `prologueNightEnd`: iç sesleri *I*’a yumuşatma **veya** “parça inner voice istisnası” notu + opsiyonel `<<dialog>>` birleştirme | Düşük |
| **B** | `parkWalk_bushWatch`: gözlem iç seslerine *I* köprüsü | Çok düşük / estetik |
| **C** | Diana + bilgisayar + gossip + bush + energy + quest useComputer + moving: **zaten güncel** — sadece dosya başına tek satırlık `Voice:` yorumu (isteğe bağlı tutarlılık) | Çok düşük |

---

## 5. Tarama istatistiği (özet)

- **Prologue .twee:** 18 dosya  
- **Interactions .twee:** 64 dosya  
- **Actions .twee:** 78 dosya  
- **Quests .twee:** 27 dosya  

**`(Inner voice)` toplam (bu dört kökte):** 18 dosyada dağınık; yukarıdaki tabloda listelendi.

**`<<thought>>` (bu dört kökte):** 0

---

## 6. Onay kutusu

Onaylarsan sırayla uygulanacak paketleri işaretle:

- [ ] **Paket A** — `prologueNightEnd` (iç ses *I* veya istisna dokümantasyonu)  
- [ ] **Paket B** — `parkWalk_bushWatch` iç ses cilası  
- [ ] **Paket C** — Seçili dosyalara `Voice:` başlık yorumu  

*Bu rapor oluşturulma: proje içi audit; içerik onayı sana aittir.*
