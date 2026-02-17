# Clothing Confidence Tiers – Global Tag Sistemi

Tüm kıyafetler (sporty, casual, lingerie, formal vb.) için geçerli. Yeni item eklerken bu tabloya göre `tags` veya `reqConfidence` kullan.

## Tag Sistemi (wardrobeWidget – global)

| Tag | Confidence | Exhibitionism | Açıklama |
|-----|------------|---------------|----------|
| (yok) | 0 | 0 | Kapalı parçalar |
| `crop` | 20 | - | Bel/göbek açıkta – crop top, crop tee |
| `short` | 30 | - | Bacak açıkta – shorts, mini etek, hot pants |
| `revealing` | 40 | - | Daha açık – cutout, high-cut, crop bra-top |
| `daring` | 55 | - | Cesur – thong-back, mesh, şeffaf |
| `bold` | 70 | - | Çok cesur – strappy, minimal coverage |
| `erotic` | 75 | 10 | Erotik |
| `lewd` | 85 | 30 | En uç |

## Özel Gereksinim (reqConfidence)

Tag yerine item'a direkt ekle (tag'ları override eder):
```javascript
reqConfidence: 30,
reqExhibitionism: 15,  // opsiyonel
reqCorruption: 10      // opsiyonel
```

## Global Kullanım Örnekleri

| Kategori | Item | Tag |
|----------|------|-----|
| **Tops** | Tam tişört, bluz | - |
| | Crop top, crop tee | `crop` |
| | Cutout bluz, yırtmaçlı | `revealing` |
| **Bottoms** | Pantolon, leggings (tam) | - |
| | Shorts, mini etek | `short` |
| | Thong-back shorts, mesh | `daring` |
| **Bras** | Normal sütyen | - |
| | Strappy, bralette | `bold` |
| **Lingerie** | Klasik takım | - |
| | Body, açık parçalar | `revealing` / `daring` |
| **Dresses** | Midi, maxi | - |
| | Mini dress | `short` |
| | Sırt açık, derin yaka | `revealing` |

## Sıralama (0 → 100)

0 → 20 (crop) → 30 (short) → 40 (revealing) → 55 (daring) → 70 (bold) → 75 (erotic) → 85 (lewd)
