# Fotogram Interactive DM Rebuild Plan

Bu plan, eski interaktif DM sistemini tamamen temizledikten sonra yeni sistemi sifirdan, kontrollu ve test edilebilir sekilde kurmak icin hazirlandi.

## 0) Hedef ve Sinirlar

- Hedef: Oyuncu secimlerinin DM akisini gercekten degistirdigi, tutarli ve genisletilebilir bir sistem.
- Kapsam: Sadece Fotogram DM (feed/post mekaniginden bagimsiz ama uyumlu).
- Ilke: "Data in Twee, engine in JS." Mesaj/choice icerigi ve davranis kurallari Twee tarafinda, motor JS tarafinda.
- Ilke: Hardcoded fallback yok; gerekli data eksikse kontrollu fail + debug log.

## 1) Mimari Tasarim (V3)

### 1.1 Data katmani (Twee)

- `setup.fotogramDMRuntimeConfig`: runtime textler, UI etiketleri, genel ayarlar.
- `setup.fotogramDMScenarios`: scenario tanimlari (node graph).
- `setup.fotogramDMChoicePools`: secim havuzlari (context + persona + stage bazli).
- `setup.fotogramDMAnonPools`: anon mesaj havuzlari (intent/stage/type bazli).
- `setup.fotogramDMRules`: esik degerler, intent gecis kurallari, risk/agresyon kurallari.

### 1.2 Engine katmani (JS)

- Dosya: `phone-fotogram-dm.js`
- Sorumluluklar:
  - DM state olusturma/yukleme
  - node gecisi
  - choice uygulama + state etkileri
  - intent belirleme (rule-driven)
  - gecerli next node secimi
  - render'e verilecek "current choices + anon response" paketini uretme
  - medya eklerinde tek kaynak olarak `setup.fotogramDMPhotoPool` (variablesPhonePhotos) kullanimi

### 1.3 State modeli (DM bazli)

- `stage`: opener / mid / late / end
- `intent`: neutral / flirty / pushy / swap / explicit / exit
- `metrics`: heat, trust, control, pressure, ghostRisk
- `history`: prevChoiceKey, prevIntent, nodeTrail, recentPools
- `flags`: askedPics, askedNumber, gotExplicit, boundarySet, conversationEnded

### 1.4 Akis prensibi (mesaj + state birlikte)

- Her turde motor sadece node'a bakmaz; hem son anon mesajinin intentine hem de DM'in birikmis state'ine bakar.
- Butonlar (`choices`) su girdilerle dinamik uretilir:
  - mesaj intenti (normal/flirty/pushy/number/pics/boundary-respect)
  - state metrikleri (`heat`, `trust`, `control`, `pressure`, `ghostRisk`)
  - gecmis secim (`prevChoiceKey`) ve kritik flag'ler
- Uygulanan ana dongu:
  - `Anon mesaj + DM state -> uygun button seti -> oyuncu secimi -> state update -> yeni anon cevabi -> yeni button seti`

### 1.5 DM gonderen profil modeli (zorunlu)

- Her DM gonderen icin bir profil objesi bulunur (`setup.fotogramDMProfiles`).
- Minimum alanlar:
  - `type` (number_hunter, getoff, flirty, unsolicited_sender vb)
  - `tone` (male/female/neutral yazim tonu)
  - `displayAge` veya `ageRange`
  - `pushinessBase`, `patience`, `riskTolerance`
  - `goalWeights` (chat/swap/pics/exit)
  - `styleTags` (polite, direct, manipulative, playful vb)
- Profilin etkiledigi katmanlar:
  - opener ve mesaj tonu
  - intent gecis hizi
  - hangi butonlarin hangi kosulda cikacagi
  - boundary'ye verilen tepkinin sertligi/yumusakligi

## 2) Gelistirme Fazlari

## Faz A - Engine iskeleti (MVP)

- [ ] `createInteractiveDmState()` kurulumu
- [ ] `resolveChoiceSet(state, node)` (choice filtrasyonu)
- [ ] `applyChoiceEffects(state, choice)` (metric update)
- [ ] `resolveAnonReply(state)` (intent + pool secimi)
- [ ] `resolveNextNode(state)` (deterministic rule + weighted branch)
- [ ] `processInteractiveReply(dmId, choiceKey)` ana pipeline

**Cikis kriteri:**

- 1 scenario, 6-8 node ile bastan sona akabiliyor.
- Oyuncu secimi en az 3 farkli outcome doguruyor (friendly / flirty / hard boundary exit).

## Faz B - Data tasarimi (Twee)

- [ ] Ilk scenario seti:
  - `chat_open_balanced`
  - `chat_open_pushy`
  - `dickpic_open`
- [ ] Her scenario icin node graph ve node-level validation keyleri
- [ ] `byContext` ve `byPrevChoice` kurallari
- [ ] type map: `1..6` davranis karakterizasyonu
- [ ] profil tablosu: `setup.fotogramDMProfiles`

**Cikis kriteri:**

- Tum scenario datasi JS'e dokunmadan degistirilebilir.
- Node'da eksik key varsa fail-fast log veriliyor.

## Faz C - Baski/ikna akislarinin kurulumu

- [ ] Number hunter, getoff, unsolicited sender icin assertive pathler
- [ ] Oyuncu tarafinda "deflect / refuse / hard stop / give in" secenekleri
- [ ] Repeated pressure anti-loop kurali (same ask spam engeli)
- [ ] Boundary ihlalinde zorunlu cool-down veya exit

**Cikis kriteri:**

- "Baski var ama sacmalamiyor" dengesi.
- "No" secimi en gec 1-2 tur icinde akis tonunu degistiriyor.

## Faz D - Icerik cesitliligi ve kalite

- [ ] tekrar engelleme (recent window)
- [ ] kisa/bozuk mesaj korumasi (min quality gate)
- [ ] tone/persona tutarlilik kontrolu

**Cikis kriteri:**

- "Same. Bye." gibi anlamsiz zincirler minimuma inmis.

## Faz E - Test ve telemetry

- [ ] debug passage/macro: tek tikla 100 DM simule et
- [ ] outcome dagilimi raporu (friendly/flirty/exit/pushy)
- [ ] hatali node/pool raporu
- [ ] manual QA checklist

**Cikis kriteri:**

- 100 simulasyonda kritik akıs kirilmasi yok.
- Eksik data oldugunda sessizce degil, acik hata veriyor.

## 3) Teknik Kurallar (Non-negotiable)

- JS fallback metinleri yok.
- "Magic number" yok: tum esikler setup/rules'tan okunur.
- Her choice bir effect veya explicit transition tasir.
- End node'lar acik tanimli olur (`endConversation: true`).
- Bir node'un en az 2 anlamli player secenegi olur (zorunlu tek secenek haric).

## 4) Dosya Duzeni

- `assets/system/js/ui/phone/phone-fotogram-dm.js`
  - Engine + runtime helpers
- `passages/0 - System/Init/phone/fotogramDMs.twee`
  - Runtime text + non-interactive ortak havuzlar
- `passages/0 - System/Init/phone/fotogramDMInteractive.twee` (yeni)
  - Scenario graph + rules + interactive pools
- `passages/0 - System/Init/phone/variablesPhonePhotos.twee`
  - DM attachment kaynaklari (`setup.fotogramDMPhotoPool`) ve topic image poolleri
- `1Developer/Neph/fotogram-dm-flow-design.md`
  - Tasarim notlari / narrative draft

## 5) Ilk Sprint (onerilen)

### Sprint-1 (1-2 gun)

- Engine MVP pipeline
- Tek scenario (`chat_open_balanced`)
- 3 farkli outcome

### Sprint-2 (2-3 gun)

- Pushy type pathleri
- Number/pic pressure branchleri
- boundary handling

### Sprint-3 (1-2 gun)

- quality gates + simulation tools
- content pass + bugfix

## 6) Done Kriteri

- Oyuncu secimi akis sonucunu gozle gorulur sekilde degistiriyor.
- Ayni DM'de anlamsiz/tekrarlayan bos mesaj yok.
- Pushy karakterler dogru yerde baski kuruyor; oyuncu saglam cevap verebiliyor.
- Tum interactive behavior data-driven; yeni scenario eklemek JS degisimi gerektirmiyor.

## 7) Sonraki Adim (hemen baslayalim)

Ilk implementasyon hedefi:

- `chat_open_balanced` icin 8 node'lu minimal graph
- 4 metric (heat, trust, control, pressure)
- 1 strict end path + 2 soft end path

Bu dosya onaylandiginda Faz A'ya gecip engine iskeletini cikaririz.
