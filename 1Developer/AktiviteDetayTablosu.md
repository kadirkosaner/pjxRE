# Aktivite detay tablosu — sadece enerji **harcayan** aktiviteler

Doğrudan kodda **enerji düşüşü** olanlar (`loseStat "energy"`, TV’deki enerji maliyeti, kitap okuma enerji maliyeti, iş vardiyası vb.).  
Enerji kazandıran veya Δ enerji = 0 olan satırlar bu tabloda **yok**.

**Not:** `advanceTime` **normal** modda tam saat geçince ek **pasif −5/saat** (relax değilse) ayrıca uygulanabilir.

| Aktivite | Stat kazanç | Stat kayıp | Δ Enerji | Enerji kontrolü | Relax |
|----------|-------------|------------|----------|-----------------|-------|
| District hub – Walk | mood: `max(1,⌊8×dk/60⌋)` | stress: `max(1,⌊6×dk/60⌋)` | **−**`max(1,⌊10×dk/60⌋)` | Evet: başlamak için **Δ+10** (`requireMinEnergy`, `btnPicker`) | Evet |
| District hub – Phone | mood: `max(1,⌊12×dk/60⌋)` | stress: `max(1,⌊4×dk/60⌋)` | **−**`max(1,⌊8×dk/60⌋)` | Evet: **Δ+10** | Evet |
| District hub – Watch | mood: `max(1,⌊6×dk/60⌋)` | stress: `max(1,⌊8×dk/60⌋)` | **−**`max(1,⌊10×dk/60⌋)` | Evet: **Δ+10** | Evet |
| Mall – Window Shopping | mood +6 | stress −3 | **−5** | Evet: min **10** | Evet |
| Park – Walk | mood +5 | stress −12 | **−5** | Hayır | Hayır (15 dk) |
| Park – Jog | cardio +2†, lowerBody +1† | stress −15 | **−20** | Evet: `activityButton` min **20** | Hayır (45 dk) |
| Park – Yoga | — (skill) | stress −10 | **−15** | Evet: min **15** | Hayır (45 dk) |
| Ev – TV | mood (süre ölçekli) | stress (süre ölçekli) | **−5** … **−11** (15 dk→5; her ek 15 dk +2; max 11) | Hayır | Evet |
| Ev – Yoga solo | — | stress −10 | **−15** | Evet: min **15** | Hayır (30 dk) |
| Ev – Yoga (mom) | friendship (anne) +2 | stress −15 | **−15** | Evet: min **15** | Hayır (30 dk) |
| Ev – Dance | — | stress −15 | **−20** | Evet: min **20** | Hayır (30 dk) |
| Ev – Kardeşle oyun | mood +15 | stress −10 | **−10** | Evet: min **10** | Hayır (30 dk) |
| Ev – PC oyun (solo) | mood +10 | stress −10 | **−5** | Evet: min **5** | Hayır (30 dk) |
| Ev – PC video | mood +15 | stress −12 | **−5** | Evet: min **5** | Hayır (45 dk) |
| Okuma – kitap | focus, mood, statPool, skill (meta) | stress | **−**`round(dk×0.2)`; enerji sonrası en az **10** | Zeka/odak min. (meta) | Evet |
| İş – Ruby bulaşıkçı (vardiya) | — | energy, mood, hygiene; stress **artar** | **−30 × (vardiya_saati/4)** | Evet (vardiya + picker) | Hayır |

† Jog: `gainStat …` cap 20.

---

## Hub enerji (dk = seçilen dakika)

- Walk: `max(1, round(10 * dk / 60))`  
- Phone: `max(1, round(8 * dk / 60))`  
- Watch: `max(1, round(10 * dk / 60))`  
- Başlamak için: **yukarıdaki + 10**

---

Tam liste (kazanç dahil) için: [`AktiviteOzeti.md`](AktiviteOzeti.md)
