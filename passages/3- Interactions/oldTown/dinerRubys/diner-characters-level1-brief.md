## Phase Sistemi

Oyuncunun dinerla ilişkisi üç durumdan birine girer:

│
├── Job YOK → common topics  
│ (Tanıdık biri olarak uğramış, sadece sohbet)

└── Job VAR (dishwasher)  
 │
├── Günlük saat < 8 → working.onBreak topics  
 │ (Shift devam ediyor, oyuncu molada)

    └── Günlük saat = 8 → working.done topics
        (Shift bitti, oyuncu ne müşteri ne işçi)

> **Bu üç database birbirinden tamamen ayrıdır. Karıştırma.**

---

# Diyalog Tonu — En Önemli Kural

**Bunlar gerçek insanlar. Sahnede bekleyen NPC değil.**

Karakter oyuncuyu beklemiyordu. Zaten bir şey yapıyordu. Oyuncu onu böldü.

---

## YAPMA

❌ Uzun açıklamalar, punch line'a kurulu cümleler  
❌ Her şeyi açıkça söylemek — "Seni takip ediyorum", "İyi bir işçisin"  
❌ Her diyaloğu temiz bir kapanışla bitirmek  
❌ Oyuncu repliklerini çok zekice yazmak — oyuncu sıradan konuşur  
❌ `common` phase'de sipariş almak, masa göstermek, menüden bahsetmek

---

## YAP

✅ Karakter zaten bir şey yapıyor, oyuncu onu bölüyor  
✅ Konuşma yarım kalabilir, bitmeyebilir  
✅ Spesifik detaylar: "kahve makinesi" değil, "o kahve makinesi yine sızdırıyor"  
✅ Subtext: Vince'in rahatsızlığı kelimelerden değil, davranıştan gelir  
✅ Sessizlik ve kısa cevaplar gerçekçidir

---

# Oyuncu Diyalog Kuralları (CRITICAL)

Oyuncu **tek kelimelik cevap veren boş bir karakter gibi görünmemeli**, ama aynı zamanda konuşmayı domine etmemelidir.

İyi denge:

```

NPC: 4–8 kelime
Player: 5–10 kelime

```

Oyuncu genellikle:

- kısa ama **tam bir cümle**
- gündelik konuşma
- bazen soru
- nadiren iki cümle

### İyi Player Replikleri

```

"Bunu değiştirmeyi hiç düşündüler mi?"
"Geçerken içeri bakayım dedim."
"Bugün baya yoğun görünüyor."
"Bu makine çok eski duruyor."
"Ben de öyle tahmin etmiştim."

```

### Çok Kötü (çok kısa)

```

"Hm."
"Evet."
"Belki."

```

### Çok Kötü (çok uzun)

```

"Ben aslında buradan geçerken içeride çalışan insanları
görüp merak ettiğim için uğradım."

```

### En Doğal Uzunluk

```

5–10 kelime

```

---

# Sessizlik Kullanımı

Bazen oyuncu **hiç cevap vermez**.

Bu çok doğal bir konuşma ritmidir.

Örnek:

Emma: Bir şeye mi uğradın?  
Player: ...  
Emma: Tamam. Yoğunum zaten.

Sessizlik **nadiren kullanılmalı**, ama gerçekçilik yaratır.

---

# Phase Açıklamaları

## `common`

Oyuncunun işi yok. Tanıdığı insanlara uğramış, ayaküstü sohbet ediyor.  
**Eski iş arkadaşı gibi düşün**.

- Emma onu tanıdık biri olarak görür, ama işi var
- Sofia onu dikkat dağıtıcı olarak görür
- Vince onu tanıdık biri olarak görür, fazla ilgili davranır

> CRITICAL: Sipariş yok, masa yok, menü yok.

Sadece iki insan konuşuyor.

---

## `working.onBreak`

Oyuncunun shifti devam ediyor, molada.  
Karakterler onu **coworker** olarak görür.

Emma  
→ hızlı konuşur, iş bilgisini paylaşır

Sofia  
→ oyuncuya iş yıkmaya çalışır

Vince  
→ patron gibi hover eder

---

## `working.done`

8 saat doldu.

Oyuncu artık **off the clock**.

Emma  
→ coworker dayanışması

Sofia  
→ oyuncunun gidebilmesine imrenir

Vince  
→ daha kişisel davranır ama deniable

---

# Karakter Profilleri

## Emma (`dinerWaitress1`)

Kişilik  
Yetkin, sürekli yorgun, profesyonel.

Ton  
Kısa, kuru, direkt.

Emma konuşurken genellikle **aynı anda çalışır**.

---

## Sofia (`dinerWaitress2`)

Kişilik  
Kendine odaklı, tembel, hafif alaycı.

Ton  
Sıkılmış.

Sofia çoğu zaman **telefonuna bakar veya bir şey yapmıyordur**.

---

## Vince (`dinerManager`)

Kişilik  
Performatif işadamı.

Ton  
Fazla düzgün, hafif küçümseyici.

---

### Vince'in creepiness kuralı

Vince asla şunu söylemez:

```

"Senden hoşlanıyorum."

```

Onun yerine:

- fazla yakın durur
- biraz uzun bakar
- gereksiz kişisel soru sorar

Creepiness **davranıştan gelir**.

---

# Diyalog Formatı

```twee
{
    text: `<<set _img = "assets/content/scenes/interactions/[karakter]/level1/[karakter][Morning|Afternoon|Evening]-" + random(1,3) + ".webp">>
<<image _img "100%">>
<<narrative>>[Sahne yönü — kısa]<</narrative>>

<<dialog "[dialogTag]">>[Karakter konuşur]<</dialog>>
<<dialog "player">>[Oyuncu cevap verir]<</dialog>>
<<dialog "[dialogTag]">>[Karakter]<</dialog>>
<<dialog "player">>[Oyuncu]<</dialog>>
<<dialog "[dialogTag]">>[Karakter kapanış]<</dialog>>`,

    friendship: [1 veya 2],
    trust: [0 veya 1]
}
```

Dialog tag'leri

```
dinerWaitress1
dinerWaitress2
dinerManager
```

---

# Variant Kuralları

Her topic için:

```
3 variant
```

Her variant:

```
minimum 4 exchange
```

Level 1 özellikleri:

- kısa
- ayaküstü
- düşük intimacy

---

# Friendship / Trust — Level 1

```
friendship: 1 → tanıdık
friendship: 2 → hafif pozitif

trust: 0 → güven yok
trust: 1 → küçük güven jesti
```

Level 1'de çoğu interaction:

```
friendship: 1
trust: 0
```

```

```
