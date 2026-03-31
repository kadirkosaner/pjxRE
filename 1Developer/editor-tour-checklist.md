# Editör turu — klasör sırası ve ilerleme

**Amaç:** Anlatı, ton, yazım, makro tutarlılığı ve bariz teknik hatalar — **klasör klasör**, onaylı ilerleme.

**Kurallar hatırlatma:**  
- **`<<narrative>>`** = Anlatıcı oyuncuya anlatır; **ikinci şahıs *you* kullanılabilir ve yaygındır** (Twine / IF alışkanlığı).  
- **İç ses** = `<<dialog "player">>` + `(Inner voice)` + karakterin **kendi kendine** konuşması (genelde *I*) — narrative ile karıştırma.  
- **`<<thought>>`** kullanma (içeriği dialog iç sesine taşı).

---

## Önerilen sıra (önce dar, sonra geniş)

| # | Klasör | Dosya ~sayısı | Not | Durum |
|---|--------|----------------|-----|--------|
| 1 | `passages/1 - Prologue` | 18 | Oyuncunun ilk temas; yüksek öncelik | 🔄 **devam** |
| 2 | `passages/2 - Locations` | ~136 | Çoğunlukla 1 paragraf hub metni; hızlı ama çok dosya | 🔄 **FamilyHouse turu yapıldı** |
| 3 | `passages/5 - QuestSystem/Quests` | ~27 | Görev metinleri bir arada | ☐ |
| 4 | `passages/4 - Actions` | ~78 | Olaylar, ayna, uyku, park… alt klasörlerle | ☐ |
| 5 | `passages/3- Interactions` | ~64+ | `talkDatabase` ağır; sona veya alt klasör bazlı | ☐ |
| 6 | `passages/0 - System` (isteğe bağlı) | — | UI / uyarı metinleri; ayrı dil tonu | ☐ |

Durum: `☐` bekliyor · `☑` bitti · yarım bırakıldıysa not düş.

---

## Tur 1 — `2 - Locations` (örneklem + düzeltme)

### Yapılan
- **Dosya:** `maplewood/FamilyHouse/fhParentsRoom.twee`  
  - **Hata:** `<<if>>` bloğu `<</nobr>>` ile kapatılmıştı; passage `<<nobr>>` erken bitiyordu.  
  - **Düzeltme:** `<</if>>` + dosya sonunda `<</nobr>>` eklendi.

### Tur 1b — `FamilyHouse` (14 dosya)

**Yapı / makro**
- **`fhParentsRoom`:** Bozuk `</if>` kaldırıldı; `<<set $location>>` + quest `<<goto fhParentsRoom_event_motherTalk>>` geri yüklendi. Başlık: `Parents' Room`.
- **`fhCouch`, `fhUpperstairs`:** `<<nobr>>` erken kapanıyordu; passage tek `nobr` içinde toplandı.
- **`fhWardrobe`:** Aynı `nobr` düzeltmesi.
- **`fhUpperBath`:** `</nobr>` yanlışlıkla `<<if>>` içindeydi; dosya sonuna alındı.
- **`fhDownbath`:** Parçalı `nobr` tek blokta birleştirildi.
- **`fhBackyard`, `fhLivingroom`:** Üstte erken `</nobr>` + altta ikinci `nobr` vardı; passage tek `<<nobr>>` içinde toplandı.
- **`fhGarage`:** Tutarlılık için `<<nobr>>` eklendi.

**Metin**
- **`fhBedroom`:** Kısa tanıtım daha nötr (“Your room. Posters…”).

### Tipik Locations kalıbı (genel)
- Tek `<<narrative "Başlık">>` + kısa tanıtım — büyük anlatı yok.

### Locations için devam stratejisi
- **A)** Sadece “hub” dosyaları (şehir/mahalle kökü): `maplewood.twee`, `oldTown.twee`, `downTown.twee`, …  
- **B)** Sadece `FamilyHouse` altı  
- **C)** Tüm 136 dosya — otomatik tarama: `<<narrative>>` içeren satırlarda yazım / tire / tekrar

Bir sonraki turda **hangi alt klasör** (A/B/C) seçeceğini işaretle.

---

## Tur 2 — `1 - Prologue` (devam)

### Yapılan (bu oturum)
- **`5 - prologuePage.twee`:** Araba sahnesi **`<<narrative>>` içinde *you*** — `12–18` ile aynı çizgi; anlatıcı oyuncuya *you* ile anlatıyor.
- **Önceki oturum:** `13` iç ses `I need to ask`, `17` iç ses `Maybe I'll be okay`.

### Kontrol edildi, ek değişiklik yok
- **`2 - GameStart`:** `welcomePage` — pazarlama / yaş doğrulama metni (anlatı kuralı dışı sayılabilir).
- **`4 - confirmationPage`:** UI özet kartları.
- **`skipPrologue`:** kart başlıkları + JS (anlatı yok).
- **`1 - Start`:** boş passage (normal).

### Sırada (bir sonraki editör turu)
| Dosya | Not |
|--------|-----|
| `3 - settingsPage.twee` | Çok uzun; UI + açıklama metinleri — ayrı oturum |
| `6`–`10` | Flashback kartları; çoğunlukla zaten `you` — spot check |
| `11` newhomeEnter, `12` newHome | Okundu; `I` sadece diyalog içinde |
| `13–18` | Daha önce cilalandı; tekrar göz gezdirilebilir |

Kontrol listesi (her narrative dosyası için):
- [ ] `<<narrative>>` genelde *you* ile tutarlı mı? (iç monolog narrative’e gömülü değilse)
- [ ] Zaman (present) sahne içi tutarlı mı?
- [ ] `(Inner voice)` ayrı blokta mı?

---

## İlgili belgeler

- `narrative-inner-voice-audit.md` — makro / iç ses envanteri  
- `narrative-deep-audit.md` — anlatı modları ve ton

---

*Checklist’i bu dosyada güncelleyerek ilerleyebilirsin; bir klasör bitince `#` satırındaki durumu `☑` yap.*
