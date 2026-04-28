Sistemle karşılaştırılmış ve mevcut değişken adlarıyla düzeltilmiş plan.
Hedef: stat-gated unlock + tier progression + repeatable ambient events.

## 1) Attention Score (Gerçek sistemle uyumlu)

Notlar:
- Projede `appearance.makeupLevel` yok; gerçek model `$makeup.state/style/quality`.
- Projede global `$exposureLevel` yok; kıyafet item'larında `exposureLevel` ve `sexinessScore` var.
- Confidence zaten `recalculateStats` içinde `charisma + looks` üzerinden türetiliyor.

Önerilen kompozit skor:

```
_makeupScore = ($makeup.state !== "off" && $makeup.style > 0)
    ? Math.round(($makeup.style * 20) * (($makeup.quality || 0) / 100))
    : 0

_outfitExposure = equipped item'ların exposureLevel toplamı      // 0-40 tipik
_outfitSexiness = equipped item'ların sexinessScore toplamı      // 0-25 tipik

_attentionScore = ($looks * 0.45)
                + ($beauty * 0.20)
                + (_makeupScore * 0.15)
                + (_outfitExposure * 0.10)
                + (_outfitSexiness * 0.10)
```

Trigger chance:

```
_baseChance = Math.max(0, Math.min(0.30, (_attentionScore - 30) / 100))
```

Özet:
- 30 altı: 0%
- 50: ~20%
- 60+: cap yaklaşır

Confidence rolü:
- `_attentionScore`: event tetiklenme olasılığı
- `$confidence`: aynı event'in duygusal sonucu (stress/mood/arousal dağılımı)

## 2) EVENT 1 — After-Shower Body Inspection (Tier)

`useBath` sonunda çağrılacak tier-aware ambient check.

Tier gate:
- Tier 1: `$fitness >= 12 && $confidence >= 20`
- Tier 2: `$lowerBody >= 18 || $core >= 16`
- Tier 3: `$fitness >= 28 && $confidence >= 45`

First-time sahneler:
- `mirrorAfterShower_firstNotice`
- `mirrorAfterShower_progressNotice`
- `mirrorAfterShower_ownership`

Flagler:
- `$flags.bodyAwarenessTier1`
- `$flags.bodyAwarenessTier2`
- `$flags.bodyAwarenessTier3`

V1 denge (decay sistemine uygun daha güvenli):
- Tier1 first: arousal `+3`, mood `+1`
- Tier2 first: arousal `+5`, mood `+1`
- Tier3 first: arousal `+7`, mood `+2`

Ambient pool (unlock sonrası repeatable):
- Tier1 varyantları: `+1~2`
- Tier2 varyantları: `+2~3`
- Tier3 varyantları: `+3~4`

## 3) EVENT 2 — Brother PC Escalation

3 fazlı yapı korunur; değerler V1 için dengelenir.

### Faz 1 (first discovery)
- Gate: brother PC aksiyonu içinde `%8`, `!$flags.brotherPornFirstSeen`
- Sonuç: `$flags.brotherPornFirstSeen = true`
- Etki: arousal `+4`, stress `+2`

### Faz 2 (curiosity)
- Gate: `$flags.brotherPornFirstSeen && $confidence >= 30`
- Ek cooldown: son 3 günde tetiklenmemiş
- Seçim:
  - Kapat: arousal `+2`
  - Kısa bak: arousal `+6`, `$flags.brotherPornSecondPeek = true`

### Faz 3 (deliberate repeatable)
- Gate: `$flags.brotherPornSecondPeek && $confidence >= 40`
- Ek koşul: kardeş evde değil (schedule check)
- Süre: 15-30 dk
- Etki: arousal `+10~16`, stress `+1`
- Cooldown: 2 gün

Future arc hook:
- tekrar sayısı eşiğinde `$flags.privateContentHabit = true`

## 4) EVENT 3 — Random Street Attention

Mevcut kodda `navTransition` yoksa, merkezi geçiş noktası olarak `navCard`/district geçiş akışına hook eklenmeli.

Trigger:

```
<<calculateAttentionScore>>
<<if State.random() < _baseChance>>
    <<arousalAttentionEvent>>
<</if>>
```

Confidence split:
- Low (`<30`): arousal `+2`, stress `+2`
- Mid (`30-60`): arousal `+3`, mood `+1`
- High (`>60`): arousal `+4`, mood `+2`

V1 variant havuzu:
- `stranger_passing_couple`
- `bus_stop_double_take`
- `construction_workers`

## 5) Outfit/Exposure Hesabı (Yeni tablo yazmaya gerek yok)

Yeni `setup.outfitAttractive` tablosu zorunlu değil.
Önce mevcut clothing data alanlarını kullan:
- `sexinessScore`
- `exposureLevel`
- `tags` (fallback için)

Helper önerisi:
- `setup.getOutfitAttentionComponents()` -> `{ exposure, sexiness }`
- equipped slotlardan toplar (`top`, `bottom`, `dress`, `shoes`, `bodysuit`, `bra`, `panty`)

## 6) Cooldown ve tekrar kuralları

- Mirror after-shower ambient: 24 saat
- Brother PC Faz 2 retry: 3 gün
- Brother PC Faz 3 session: 2 gün
- Street attention: 60 dk
- Aynı variant tekrar: 24 saat

## 7) Settings ve migration

Önerilen ayarlar:
- `$gameSettings.arousalAmbient`
- `$gameSettings.attentionFromStrangers`
- `$gameSettings.tabooContent`

Migration:
- Yeni flagler ve günlük/cooldown alanları için `SaveMigration_v1.twee` içinde `ndef` guard ile default set.

## 8) Uygulama sırası (güncel)

Hafta 1 (Foundation):
1. `calculateAttentionScore` widget
2. `arousalAttentionEvent` + 3 variant
3. Hook: nav akışındaki tek merkez noktaya ekleme

Hafta 2 (Mirror tier):
4. 3 adet first-time mirror passage
5. Tier ambient pool (en az 2'şer varyant)
6. `useBath` sonuna tier check çağrısı

Hafta 3 (Brother PC):
7. Faz 1/2/3 zinciri
8. Cooldown + repeat kontrolü
9. Habit flag ve future arc hook