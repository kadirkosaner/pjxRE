# Enerji harcayan etkinlikler (referans)

Oyundaki **sabit** enerji eşikleri ve **enerji kayıpları** ile birlikte öne çıkan **kazançlar** (çoğu `loseStat` / `gainStat` / `gainSkill`; çarpanlar kapalıyken kabaca bu değerler).  
**Min. enerji:** `requireMinEnergy` veya `activityButton` / `minPlayerEnergy` ile başlamadan önce istenen enerji.

### Cap / tavan notasyonu (soft değil)

- **`gainStat` 3. argümanı** ve **`gainSkill` 4. argümanı** (`StatCalculator.twee`): O çağrıda ilgili stat veya yetenek değeri **üst sınıra kadar** artar; “20’den sonra azalarak devam” **yoktur** — tavana gelince bu yolla **artış olmaz** (sert tavan).
- **Kardeş PC gaming (`brotherComputerPlayGame` / `brotherPlayTogether`)**: Bu da **iş sistemi soft-cap’i değil**. Pasaj içinde `gaming` yeteneği eşikte veya üstündeyse **`gainSkill` hiç çalıştırılmaz**; sadece uyarı mesajı gösterilir. Yani bu kaynaktan **ek skill XP gelmez**; başka pasajlardan gaming hâlâ artabilir (genel skill tavanı `gainSkill`’de varsayılan 100).
  - **Solo:** `gaming >= 25` → bu pasajdan skill yok.
  - **Birlikte:** `gaming >= 35` → bu pasajdan skill yok.

Eski “20+ / 35+” ifadesi **yumuşak azalma** anlamına gelmez; “bu eşiğe ulaşınca bu aktiviteyle skill kazanımı kesilir” demektir.

---

## 1. Sunset Park (ve `activityOrigin` park)

| Etkinlik | Pasaj | Min. enerji | Enerji kaybı | Süre | Kazanç / not (özet) |
|----------|-------|-------------:|-------------:|------|----------------------|
| Go for a Jog | `parkJog` | 25 | 15 | 45 dk | Stres −15; cardio +1 (cap 20), lower +1 (cap 10), running +1 (cap 25); günlük `jogDone`; kalori takibi açıksa −300 |
| Do Yoga (park) | `parkYoga` | 25 | 15 | 45 dk | Stres −10; yoga skill +3 (cap 20) → skill’ten core/lower bonusları (`StatCalculator`) |
| Walk (park) | `parkWalk` | 13 | 3 | 15 dk | Stres −12, mood +5; topuklu süre; ~10 enerji/saat |
| Lily — Talk | `parkRunnerLilyTalk` | — (aksiyon min 5) | 5 | 15 dk | Mood +2; konuşmaya göre ilişki statları |
| Lily — Jog together | `parkRunnerLilyJogTogether` | 25 | 15 | 45 dk | Stres −20, mood +4; cardio +1 (25), lower +1 (15), running +1 (35); Lily friendship +2; kalori ops.; gym quest koşulu ayrı |
| Lily — Jog daveti (event) | `parkRunnerLilyJogInviteEvent` | — | 3 | 10 dk | Mood +2, Lily friendship +1 |

**Park bank / dinlenme** (`parkBench_rest`, `parkRest`): enerji **kaybetmez**; enerji kazanımı (ölçekli) + stres vb. — bu dosyada “harcama” listesinde değil.

---

## 2. Ev — salon / oturma odası

| Etkinlik | Pasaj | Min. enerji | Enerji kaybı | Süre | Kazanç / not (özet) |
|----------|-------|-------------:|-------------:|------|----------------------|
| Yoga (solo / arka bahçe) | `runYogaSolo` | 25 | 15 | 30 dk | Stres −15; yoga +1 (cap 20) |
| Yoga menüsü → Anne ile | `runYogaMom` | 25 | 15 | 30 dk | Stres −15; yoga +1 (cap 20); **mother** friendship +2 |
| Dans | `runDance` | 20 | 10 | 30 dk | Stres −15; dance +1 (cap 20) → cardio/core/lower bonusları |
| TV izle | `watchTV` | **dinamik** (aşağıda) | **dinamik** | seçilen dk | Stres/mood ölçekli; annenin vb. ile izlemede friendship |

**TV — enerji:** İlk 15 dk taban **2**; her ekstra 15 dk **+1** (maliyet üst sınır **6**). Başlamak için maliyet **+10** (`btnPicker` `tvWatch`). Pasaj **`[relax]`** + `advanceTime … "relax"` ile saatlik pasif enerji düşümü yok. Örnek: 15 dk → min **12**, kayıp **2**; 60 dk → min **15**, kayıp **5**.

---

## 3. Ev — kardeş odası (bilgisayar / birlikte)

| Etkinlik | Pasaj | Min. enerji | Enerji kaybı | Süre | Kazanç / not (özet) |
|----------|-------|-------------:|-------------:|------|----------------------|
| Browse | `brotherComputerBrowse` | 15 | 5 | 30 dk | Mood +10, stres −8 |
| Watch video | `brotherComputerWatchVideo` | 17 | 7 | 45 dk | Mood +15, stres −12 |
| Play game (solo) | `brotherComputerPlayGame` | 20 | 10 | 30 dk | Mood +10, stres −10; `gaming < 25` iken **+1** technical.gaming — **≥25 ise skill yok** (uyarı; bu pasajdan sert kesinti) |
| Ask to play (birlikte) | `brotherPlayTogether` | 20 | 10 | 30 dk | Mood +15, stres −10; brother friendship +1; `gaming < 35` iken **+2** — **≥35 ise skill yok** (uyarı; bu pasajdan sert kesinti) |
| Kardeşi izle (oda) | `brotherWatch` | — | 3 | 10 dk | Mood +5 |

---

## 4. AVM / Downtown

| Etkinlik | Pasaj | Min. enerji | Enerji kaybı | Süre | Kazanç / not |
|----------|-------|-------------:|-------------:|------|----------------|
| Window shopping | `mall_windowShopping` | 15 | 5 | — | — |

---

## 5. Semt merkezi — “ambient” (Walk / Phone / People watch)

Süre `btnPicker` ile seçilir. **Kayıp:** `max(1, round(oran × dk/60))` — oranlar `HubAmbientWidgets.twee` / `setup.hubAmbientEnergyDrainPerHour`: **walk 10/saat**, **phone 8/saat**, **watch 10/saat**.  
**Başlamak için:** kayıp + **10** enerji (ör. 15 dk yürüyüş: kayıp 3, min 13).

| Tür | Pasaj | Varsayılan dk | Örnek kayıp (15 dk) | Örnek min başlangıç | Stres / mood (kısa) |
|-----|-------|---------------|---------------------|---------------------|---------------------|
| Walk around | `districtHub_walkAround` | 15 | 3 | 13 | stres −6/saat ölçeği, mood +8/saat |
| Phone | `districtHub_playPhone` | 10 | 2 (8×10/60) | 12 | stres −4/saat, mood **+8**/saat (`setup.hubAmbientMoodGainPerHour.phone`) |
| Watch people | `districtHub_watchPeople` | 15 | 3 | 13 | stres −8/saat, mood +6/saat |

---

## 6. İş vardiyası (Ruby’s Dishwashing örneği)

| Kaynak | Min. enerji (kısa vardiya uyarısı) | Enerji kaybı |
|--------|-----------------------------------:|---------------|
| `jobWorkExecute` / `JobWidgets` | İşe göre (ör. 2 saatlik kısım için hesaplanan) | `JobDatabase`: **−30 enerji / 4 saat** (yani yaklaşık **7.5 / saat**; vardiya süresiyle çarpılır) |

Ek olarak ruh hali, stres, hijyen maliyetleri iş tanımında; skill kazanımı `skillGainsPer4Hours` + soft-cap bantları ile.

---

## 7. İş / özel kısa olaylar (Ruby’s Dishwashing)

| Etkinlik | Pasaj | Enerji kaybı | Not |
|----------|-------|-------------:|-----|
| Rush — push through | `dinerWork_event_rushSurge_pushThrough` | 8 | — |
| Rush — ask help | `dinerWork_event_rushSurge_askHelp` | 5 | — |
| Clog | `dinerWork_event_clog` | 5 | — |

---

## 8. Meetup

| Etkinlik | Pasaj | Enerji kaybı | Süre | Kazanç |
|----------|-------|-------------:|------|--------|
| Park walk (meetup) | `Meetup_Park_Walk` | 5 | 30 dk | Mood +5; ilgili karakter friendship +3 (ham, min değil widget); ~10 enerji/saat |

---

## 9. NPC konuşmaları (özet)

Aşağıdaki gibi birçok “Talk” pasajı **enerji −5** harcar; süre `advanceTime` ile değişir. Tam liste için repoda `loseStat "energy"` araması yapılabilir.

- Örnek: `motherTalkKitchen`, `fatherTalkLivingRoom`, `brotherTalkBackyard`, `shopClerkTalk`, `*_TalkDinerRubys`, vb.

Karakter aksiyonlarında çoğu konuşma **`minPlayerEnergy: 5`** ile listelenir (`storyJavaScript.js` `showActions`).

---

## 10. Pasif zaman akışı (uyanık)

`TimeWidgets.twee`: **Uyku dışı** ve mod **`relax` değilse**, her simüle edilen saat için **enerji −5** (açlık/susuzluk/mesane/hijyen de güncellenir). `relax` aktiviteleri bu döngüde enerji düşümünü tetiklemez (ilgili aktivite kendi enerji satırını uygular).

---

## Enerji **kazanan** veya eşik farklı olanlar (kısa not)

| Etkinlik | Not |
|----------|-----|
| `eatFood` (mutfak) | Enerji **+45** (harcama değil) |
| `parkBench` / `parkRest` | Enerji **kazanımı** |
| `runNap` | Enerji **≤ 50** iken uygun; uyku sonrası enerji kazanımı (yatak/kanepeye göre) |

---

*Son güncelleme: repodaki `passages` ve `HubAmbientWidgets.twee` / `JobDatabase.twee` ile uyumlu üretilmiştir; yeni pasaj eklendikçe grep ile doğrulanması önerilir.*
