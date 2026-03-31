# Anlatı yapısı — detaylı inceleme raporu

Bu belge, önceki **iç ses / `thought` taramasından ayrı** olarak; **anlatı mimarisi, ton, zaman, ritim ve tutarlılık** açısından projeyi değerlendirir.

**Önemli sınır:** Tüm `.twee` dosyaları satır satır okunmadı. Yöntem: belirli **temsilî örnekler** (Prologue “present day”, ilk iş günü, park yürüyüşü, kuyruk sahnesi, `talkDatabase` yapısı, Diana hattı bilgisi) + klasör kapsamı bilgisi. Sonuçlar **istatistiksel kesinlik** iddiası taşımaz; **editoryal teşhis** niteliğindedir.

---

## 1. Anlatı katmanları (oyunda birbirinden farklı “modlar”)

Projede fiilen **birden fazla anlatı modu** üst üste duruyor. Bu kötü değil; ama “tek kalem” beklentisi varsa bilinçli olarak ayrıştırılmalı.

| Mod | Örnek konum | Özellik | Diana / iç ses kuralı |
|-----|-------------|---------|------------------------|
| **A — Sinematik prologue** | `12 - newHome`, `13 - prologueBedroom`, vb. | Kısa `<<narrative>>` döngüleri, duyu detayı, bazen parça cümle (“This is it.”) | İç ses az; `NightEnd` parça tonu **bilinçli istisna** olabilir |
| **B — Diyalog ekonomisi** | `EmmaTopicsCommonLevel1.twee` vb. | Tek satır sahne beat’i + hızlı NPC/oyuncu diyaloğu | İç ses yok; konuşma = yüksek ses |
| **C — Prosedürel / aktivite** | `parkWalk.twee` (`_walkText` string’leri) | Rastgele varyant, genelde sakin, açıklayıcı | İç ses yok; metin **şablon** gibi |
| **D — Görev sahnesi** | `quest_find_job_career_services_queue.twee` | Uzun ardışık `<<narrative>>`, bekletme hissi | “lost in thought” anlatı içinde — aşağıda not |
| **E — Dram olay (Diana)** | `dinerWork_event_*`, `fhBedroom_*`, `brotherComputer_beautySearch` | Narrative + işaretli iç ses (`I`) | Senin **referans sistemin** |

**Sonuç:** Metinler “aynı kalemden” değil; **farklı işlevler için farklı register** kullanılıyor. Bu tutarlı bir *tasarım kararı* olabilir; tekilleştirmek istersek **mod başına stil rehberi** gerekir (aşağıda).

---

## 2. Bakış açısı (POV) ve zaman

### 2.1 Anlatıcı (`<<narrative>>`)

- **Oyuncuya anlatımda *you* kullanılabilir** — kısıt “sadece dış üçüncü şahıs” değil; bu IF’de normaldir.
- **Present day** zinciri (ör. `5` araba → `12–18`): tutarlılık için çoğunlukla **you**.
- **Flashback sayfaları** (6–10 vb.): genelde **you** veya üçüncü şahıs özet — “şimdi” ile kopuş bilinçli olabilir.

### 2.2 Zaman (tense)

- Prologue “bugün” akışı: çoğunlukla **present** veya **hafif geçmiş** karışımı; sahneye göre değişir.
- Diana PC araması (`brotherComputer_beautySearch`): **şimdiki zaman** (o an) — olay zinciriyle uyum için doğru seçim.
- İlk iş günü açılışı: kısa, **present** odaklı — iyi.
- **Risk:** Aynı gün / aynı lokasyonda bir dosya geçmiş, diğeri şimdiki kalırsa oyuncu alt metin fark eder. **Çözüm:** lokasyon veya “flashback mi şimdi mi” etiketiyle pasaj başına tek zaman seçmek.

### 2.3 “Düşünce” anlatı içinde

Örnek: `quest_find_job_career_services_queue.twee` — *“You zone out a bit, lost in thought. Thinking about the apartment…”*  

Bu **dış anlatı** ile **içerik** sınırında: teknik olarak `<<narrative>>` ama okuyucu için iç monolog.  

**Seçenekler:**

- Olduğu gibi bırak (sinema voice-over hissi).
- Senin kuralına sıkı bağlanmak istersen: kısa **`<<dialog "player">>` (Inner voice)** ile ayır.

---

## 3. Ritim ve sahne yapısı

### 3.1 Prologue (ör. `newHome`)

- Güçlü yön: **kısa bloklar**, tıklama başına net görüntü/koku/ses.
- Tipik yapı: `narrative` → `dialog` → `narrative` — okunabilir.

### 3.2 `talkDatabase`

- Güçlü yön: **iş yeri ritmi** (hızlı cevaplar, mizah / yorgunluk).
- Zayıf yön (genel): uzun süre aynı kalıp (*narrative tek cümle + 4–5 dialog*) — çeşitlilik için ara sıra **sadece diyalog** veya **sadece beat** varyantı düşünülebilir.

### 3.3 Prosedürel park (`parkWalk.twee`)

- Metinler **iyi huylu, açıklayıcı**; duygusal derinlik düşük (normal — yan aktivite).
- **İnce düzeltme:** `_walkText` içinde `workout-just` gibi **tire/boşluk** ve bazı cümlelerde `It is` (biraz resmi) — kulak taraması yapılabilir.

---

## 4. Ton ve “ses” birliği

| Alan | Ton | Tek kalem riski |
|------|-----|------------------|
| Prologue aile | Sıcak, gözlemci, hafif nostaljik | Düşük (içerik birbirine yakın) |
| Diner small talk | Kurşun, ironi, mesai | Diana dramından **bilinçli sıçrama** |
| Diana hattı | Gergin, cinsellik/güç, iç ses | Referans seviye |
| Kuyruk / bürokrasi | Gerçekçi, hafif bunaltıcı | İyi oturuyor |

**Sonuç:** Ton farklılığı **hata değil**; karakter ve mekâna göre. Sorun, oyuncunun **aynı paragrafta** prologue şiiri ile database şakasını karıştırması değil — **ardışık sahnelerde** kopukluk hissi. Bunu azaltmak için **geçiş cümleleri** (lokasyona girerken tek satır mood) düşünülebilir.

---

## 5. İç ses politikası (yapı + anlatı)

- **Etiketli iç ses** olan dosyalar büyük ölçüde **I** hattına çekildi.
- **Etiketsiz “içerik”** hâlâ `<<narrative>>` içinde gezebilir (kuyruk, bazı quest’ler).
- **Öneri:** “İç monolog ne zaman `<<dialog player>>`, ne zaman narrative?” için **3 satırlık kural** yazın (ör. *duygusal dönüm noktası = dialog; rutin gözlem = narrative*).

---

## 6. Öncelik sıralı iyileştirme listesi (onayına göre iş)

1. **Düşük efor, yüksek görünürlük:** `parkWalk.twee` string’lerinde yazım/boşluk + “It is” → daha konuşma dili.  
2. **Orta:** Quest sahnesinde 1–2 yerde “lost in thought” bloğunu iç sese bölmek **veya** bilinçli olarak narrative’te bırakıp dokümantasyonda işaretlemek.  
3. **Yüksek efor:** `talkDatabase` örneklemesi — rastgele 10 konuşmada **tekrar eden açılış** (*Emma passes by…*) azaltma.  
4. **Sistem dışı:** `0 - System`, `settingsPage` UI metinleri — bu raporda yok; ayrı tur.

---

## 7. Özet cümle

**Hayır:** Tüm twee dosyaları detaylı anlatı açısından tek tek incelenmiş ve “hepsi aynı kalem” değerlendirmesi yapılmış değil.  

**Evet:** Proje **bilerek çok modlu** anlatı kullanıyor; Diana hattı ve iç ses kuralları bu modlardan birini tanımlıyor. **Tek kalem hissi** isteniyorsa bu, makro değişikliğinden çok **ton rehberi + editoryal geçiş + prosedürel metin cilası** işidir.

---

## 8. İlgili dosyalar

- Önceki yapı taraması: `narrative-inner-voice-audit.md`  
- Bu belge: **anlatı derinliği** (POV, zaman, ritim, ton, modlar)

*Son güncelleme: otomatik + örneklemeli audit; tam metin editörlüğü değildir.*
