# Ruby's Diner — Menü & Asset Listesi

**Lokasyon:** Old Town · Klasik Amerikan diner, günlük ve rahat (lüks değil).  
**Fiyat bandı:** Restoran yemek $8–15, içecekler standart (economyCheatsheet uyumlu).  
**Not:** Restoranda su ücretsizdir.

---

## 1. Gerçekçi diner menüsü önerisi

Aşağıdaki liste, “gerçek bir diner” hissi için önerilen yemek + içecek setidir. İstediğin satırları seçip veritabanına ekleyebilirsin; **DB’de var** / **Eklenecek** ayrımı ile işaretledim.

---

## 2. Yemekler (Dishes)

### 2.1 Önerilen diner yemekleri (tek liste)

| id | Ad | Fiyat | Açıklama (desc) | DB’de? |
|----|-----|-------|------------------|--------|
| `soup_of_day` | Soup of the Day | $8 | Chef's daily selection. | Var |
| `house_salad` | House Salad | $8 | Fresh greens with vinaigrette. | Var |
| `diner_burger` | Ruby's Classic Burger | $10 | Beef patty, lettuce, tomato, fries on the side. | Eklenecek |
| `grilled_cheese` | Grilled Cheese | $8 | Toasted cheese sandwich, side of tomato soup. | Eklenecek |
| `pancakes` | Short Stack Pancakes | $9 | Fluffy pancakes with butter and syrup. | Eklenecek |
| `club_sandwich` | Club Sandwich | $11 | Triple-decker, turkey, bacon, lettuce, tomato. | Eklenecek |
| `mac_cheese` | Mac & Cheese | $8 | Creamy macaroni and cheese, comfort classic. | Eklenecek |
| `eggs_bacon` | Eggs & Bacon | $9 | Two eggs any style, crispy bacon, toast. | Eklenecek |
| `pasta_carbonara` | Pasta Carbonara | $12 | Creamy bacon and parmesan. | Var |
| `grilled_salmon` | Grilled Salmon | $14 | Atlantic salmon with herbs. | Var (opsiyonel) |
| `steak_frites` | Steak & Frites | $15 | Grilled ribeye with fries. | Var (opsiyonel) |

**Diner hissi için özet:**  
Hafif (soup, salad) + klasik diner (burger, grilled cheese, pancakes, club, mac & cheese, eggs & bacon) + birkaç “günün yemeği” (pasta, salmon, steak). İstersen salmon/steak’i çıkarıp tamamen diner’a çekebilirsin.

### 2.2 Şu an oyundaki menü (dinerRubys)

- **Yemek:** `house_salad`, `soup_of_day`, `pasta_carbonara`  
- **İçecek:** `water`, `coffee`, `iced_tea`, `soda`

Yeni yemekleri ekledikten sonra `restaurantMenus.dinerRubys.foods` dizisine id’leri eklemen yeterli.

---

## 3. İçecekler (Drinks)

Hepsi diner’a uygun; değişiklik önerisi yok.

| id | Ad | Fiyat | Açıklama |
|----|-----|-------|----------|
| `water` | Water | **Ücretsiz** | Still or sparkling. Complimentary. |
| `coffee` | Coffee | $2.50 | Freshly brewed. |
| `iced_tea` | Iced Tea | $3.50 | Refreshing and cold. |
| `soda` | Soda | $2.50 | Cola, lemon-lime, or root beer. |
| `fresh_juice` | Fresh Juice | $5 | Seasonal fruit juice. |

*Ruby's menüsünde şu an: water, coffee, iced_tea, soda.*

---

## 4. Görsel promptları (koyulacak / üretilecek görseller)

**Kalite hedefi:** Referans görsellerdeki gibi — fotorealist, tek odak, temiz kompozisyon, profesyonel ürün fotoğrafı. **Tüm görseller aynı açı: 45° (yandan hafif açılı), üstten değil — yemekler derinlik ve hacim kazansın.** Beyaz arka plan, yumuşak gölge, eşit ışık; soğuk ürünlerde kondansasyon, sıcak ürünlerde hafif buhar. Metin yok; oyun kartı/ikon için tek obje.

### 4.1 Yemekler

- **House Salad** `house_salad`  
  `Photorealistic product photo of a small plate of fresh green salad with vinaigrette, crisp lettuce and visible dressing, single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even bright lighting, soft shadow on clean white background. Appetizing, wholesome. No text. 1:1`

- **Soup of the Day** `soup_of_day`  
  `Photorealistic product photo of a bowl of soup, daily special style, visible steam rising slightly. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Cozy, fresh. No text. 1:1`

- **Ruby's Classic Burger** `diner_burger`  
  `Photorealistic product photo of a classic burger with beef patty, lettuce, tomato, on a plate with fries on the side. Single subject, centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Appetizing, diner-quality. No text. 1:1`

- **Grilled Cheese** `grilled_cheese`  
  `Photorealistic product photo of a grilled cheese sandwich on a white plate, golden toasted surface, melted cheese visible at edges. Optional small bowl of tomato soup beside it. Single subject. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Comfort food, inviting. No text. 1:1`

- **Short Stack Pancakes** `pancakes`  
  `Photorealistic product photo of a short stack of fluffy pancakes with butter and syrup on a plate. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Breakfast, cozy, appetizing. No text. 1:1`

- **Club Sandwich** `club_sandwich`  
  `Photorealistic product photo of a triple-decker club sandwich with turkey, bacon, lettuce, tomato, toothpick, on plate with fries or side. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Clean presentation. No text. 1:1`

- **Mac & Cheese** `mac_cheese`  
  `Photorealistic product photo of creamy macaroni and cheese in a white bowl or plate, visible cheese texture, single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Comfort food, appetizing. No text. 1:1`

- **Eggs & Bacon** `eggs_bacon`  
  `Photorealistic product photo of two eggs any style with crispy bacon and toast on a white plate. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Breakfast, fresh, diner-style. No text. 1:1`

- **Pasta Carbonara** `pasta_carbonara`  
  `Photorealistic product photo of a plate of creamy pasta carbonara with bacon bits, single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Appetizing, restaurant-quality. No text. 1:1`

- **Grilled Salmon** `grilled_salmon`  
  `Photorealistic product photo of a grilled salmon fillet with herbs on a white plate, simple presentation. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Fresh, clean. No text. 1:1`

- **Steak & Frites** `steak_frites`  
  `Photorealistic product photo of grilled steak with fries on a white plate. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Casual diner quality, appetizing. No text. 1:1`

### 4.2 İçecekler

- **Water** `water`  
  `Photorealistic product photo of a tall glass of still water, clear, full. Optional fine condensation on glass. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even bright lighting, soft shadow on stark white background. Fresh, minimal, premium. No text. 1:1`

- **Coffee** `coffee`  
  `Photorealistic product photo of a diner-style mug of coffee, optional light steam. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even warm lighting, soft shadow on clean white background. Cozy, inviting. No text. 1:1`

- **Iced Tea** `iced_tea`  
  `Photorealistic product photo of a glass of iced tea with lemon slice, condensation droplets on glass, cold and refreshing. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even bright lighting, soft shadow on stark white background. No text. 1:1`

- **Soda** `soda`  
  `Photorealistic product photo of a glass of soda with ice, condensation on glass. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even bright lighting, soft shadow on stark white background. Refreshing, clean. No text. 1:1`

- **Fresh Juice** `fresh_juice`  
  `Photorealistic product photo of a glass of fresh fruit juice, natural color, optional condensation. Single subject centered. 45° angle from the side, slight perspective so food has depth, not flat top-down. Even bright lighting, soft shadow on clean white background. Fresh, natural. No text. 1:1`

---

## 5. Teknik notlar

- **Effect alanları:** Her yemek/içecek için `hunger`, `thirst`, `energy`, `mood`, `focus` vb. `RestaurantDatabase.twee` içinde tanımlı. Yeni yemeklerde benzer aralıklar kullan (örn. doyurucu yemek hunger -40 ile -55, energy +10 ile +20).
- **Görsel yolu:** `assets/content/items/consumables/` — dosya adı örn. `diner_burger.webp`, `grilled_cheese.webp`.
- **Yeni yemek eklemek:** Bu md’deki satırı al → `RestaurantDatabase.twee` → `setup.restaurantDishes.foods` içine obje ekle → `setup.restaurantMenus.dinerRubys.foods` dizisine id ekle.

Bu listeye bakıp hangi yemekleri oyuna alacağına karar verebilirsin; gerçekçi diner hissi için burger, grilled cheese, pancakes, club, mac & cheese, eggs & bacon özellikle güçlü seçenekler.
