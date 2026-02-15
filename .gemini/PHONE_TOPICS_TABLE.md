# Phone Topics – Yapı ve Kurallar

Her karakter (mother, father, brother) kendi topic listesine sahip; ortak tablo yok. Aynı şema ve kurallar hepsinde geçerli.

**Kullanılan statlar:** Sadece **friendship**, **love** ve **lust**. `tier` ilgili kategoriyle (category), `requiredStats` ve `statGain` sadece bu üç stat adıyla kullanılır.

---

## Özet

- **Üç topic kategorisi var:** **friendship topic’leri**, **love topic’leri**, **lust topic’leri.** Her topic tam olarak bir kategoriye aittir (`category`).
- **Her topic’ın kendine ait bir tier’ı var.** Açılması için ilgili stat: `char.stats[category] >= topic.tier`.
- **Her topic’ta version alanı var.** İçerik değişince artırılır (örn. `version: 1`).
- **Her topic’ta 2–4 varyasyon olur.** Her varyasyon, 3–5 mesajlı bir konuşma (turns). Topic tıklandığında rastgele bir varyasyon seçilir; sıra: Player → Karakter → Player → Karakter (dönüşümlü).
- **Her konuşmanın açılması için özel stat değerleri gerekir:** ilgili kategoride stat ≥ tier; isteğe bağlı `requiredStats`.

Özetle: friendship / love / lust topic’leri; her biri tier + version; her konuşmada **turns** ile 3–5 mesaj (oyuncu–karakter dönüşümlü); açılma için tier + isteğe bağlı requiredStats.

---

## 1. Topic şeması (her topic’te olan alanlar)

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| **version** | number | ✓ | Topic sürümü (içerik değişince artırılır). |
| **id** | string | ✓ | Benzersiz topic kimliği (o karakter içinde). |
| **label** | string | ✓ | Konu listesinde görünen kısa başlık. |
| **category** | string | ✓ | `friendship` \| `love` \| `lust` |
| **tier** | number | ✓ | Bu kategorideki ana stat seviyesi (0–100). Açılmak için `char.stats[category] >= topic.tier`. |
| **requiredStats** | object | | Ek stat şartları. Sadece `friendship`, `love`, `lust`. |
| **timeAdvance** | number | ✓ | Konuşma sonrası ilerleyen dakika. |
| **statGain** | object | ✓ | Sadece `friendship`, `love`, `lust` kazanımları. |
| **variations** | array | ✓ | **2–4 öğe.** Her öğe bir konuşma (turns): `[ { from, text }, ... ]`. 3–5 mesaj; ilk player, sonra dönüşümlü. Topic kullanılınca rastgele bir varyasyon seçilir. |
| **imageType** | string | | `"sender"` = oyuncu görsel atar, `"receiver"` = karakter görsel atar. |
| **images** | string[] | | Görsel path listesi (imageType varsa; receiver için). |

---

## 2. Kurallar

- **Tier:** Her topic’ın kendi tier’ı vardır; açılması için ilgili kategori stat’ı ≥ tier olmalı.
- **Version:** Her topic’te `version: 1` (veya güncel sürüm) bulunur; metin/şart değişince artırılır.
- **variations:** Her topic’te **2–4 varyasyon** olmalı. Her varyasyon 3–5 mesaj (turns); ilk mesaj player, sonra dönüşümlü. Metinlerde argo/küfür kullanılabilir.
- **Dosya ayrımı:** Mother, Father, Brother topic’leri ayrı Twee dosyalarında: `variablesPhoneTopicsMother.twee`, `variablesPhoneTopicsFather.twee`, `variablesPhoneTopicsBrother.twee`.
- **Açılma şartı:**  
  - Önce `char.stats[category] >= topic.tier` kontrol edilir.  
  - Varsa `topic.requiredStats` içindeki her stat için `char.stats[stat] >= topic.requiredStats[stat]` kontrol edilir; hepsi sağlanmalı.
- Karaktere göre topic listesi ayrı: `setup.phoneMessageTopics.mother`, `setup.phoneMessageTopics.father`, `setup.phoneMessageTopics.brother`.

---

## 3. requiredStats örnekleri

Bazı konuşmaların açılması için tek stat (tier) yetmez; ek stat isteyebilirsin:

| Amaç | requiredStats örneği |
|------|------------------------|
| Önce arkadaşlık, sonra flört | Love topic: `requiredStats: { friendship: 20 }` |
| Hem sevgi hem lust | Lust topic: `requiredStats: { love: 30 }` |
| Çok ileri konuşmalar | `requiredStats: { friendship: 40, love: 20 }` |

Kod tarafında `topic-system.js` içinde `phoneGetTopicsByCategory` bu alanı okuyup tüm şartları kontrol eder.
