# CSS Klasörü İnceleme Raporu

**Tarih:** 3 Şubat 2025  
**Kapsam:** `assets/system/css/` altındaki tüm CSS dosyaları, config yükleme listesi ve proje içi kullanım.

---

## 1. Mevcut Yapı Özeti

| Klasör   | Dosya sayısı | Config'de yüklenen |
|----------|--------------|--------------------|
| base/    | 3            | 3 (variables, reset, icons) |
| layout/  | 4            | 4 (structure, topbar, rightbar, mainmenu) |
| ui/      | 9            | 9 (buttons, modals, dialog, tabs, forms, navigation, settings, toggle, dropdown) |
| screens/ | 4            | 4 (welcome, startscreen, gamesetup, prologue) |
| systems/ | 15           | 15 (phone, map, wardrobe, shopping, inventory, relations, stats, journal, quest, profile, character, saveload, alarm, read) |
| utils/   | 6            | 6 (debug, notifications, tooltips, animations, utilities, media) |
| **Toplam** | **41**     | **41** |

**Sonuç:** Tüm CSS dosyaları `assets/system/config.js` içindeki `window.SystemCSS` listelerinde tanımlı ve yükleniyor. **Config’te tanımlı olup diskte olmayan veya diskte olup config’te olmayan dosya yok.**

---

## 2. Kullanılmayan Dosyalar

**Bulgu:** Projede **hiçbir CSS dosyası “yüklenmiyor” veya “hiç referans edilmiyor” değil.**  
Yükleme, `storyJavaScript.js` (ve derlenmiş `PJX.html`) içinde `config.js` → `SystemCSS` dizilerine göre dinamik yapılıyor; 41 dosyanın tamamı bu listelerde.

- **Kullanılmayan CSS dosyası:** Yok.
- **Config’te olup klasörde olmayan:** Yok.
- **Klasörde olup config’te olmayan:** Yok.

---

## 3. Tekrarlanan / Çakışan Stiller

### 3.1 Video container ve play overlay (önemli)

**Sorun:** Aynı sınıflar iki farklı dosyada tanımlı:

| Sınıflar           | ui/forms.css      | utils/media.css   |
|--------------------|-------------------|-------------------|
| `.video-container` | Var (satır 7–21)  | Var (satır 6–15)  |
| `.play-overlay`    | Var (satır 28–48) | Var (satır 27–42) |
| `.video-play-btn` | Var (satır 50–74) | Var (satır 45–66) |

**Yükleme sırası:** base → layout → **ui** → screens → systems → **utils**  
Utils en sonda yüklendiği için **şu an geçerli olan** stiller `utils/media.css` içindekiler. `ui/forms.css` içindeki video/play blokları fiilen **eziliyor**, yani tekrar (dead code) sayılır.

**Öneri:**

- Video ve play overlay ile ilgili tüm kuralları **tek yerde** tutun: **utils/media.css** (Video/Image makroları için zaten “media” amacına uygun).
- **ui/forms.css** içindeki `/*#region VIDEO CONTAINER */` bloğunu (yaklaşık satır 6–76) **silin**. Forms.css’te sadece volume, slider, form kontrolleri kalsın.
- forms.css başlık yorumunu güncelleyin: "Video container, volume controls, alarm" → "Volume controls, sliders, form controls" (video kısmı kalktığı için).

Bu sayede tek kaynak (single source of truth) olur ve ileride sadece media.css’i düzenlemeniz yeterli olur.

---

### 3.2 Modal overlay

**Durum:** `ui/modals.css` genel `.modal-overlay` ve `.modal` kurallarını içeriyor. `systems/character.css` içinde de `.modal-overlay` ve `.modal-overlay .modal` (sağda rightbar boşluğu için padding vb.) var.

**Yorum:** Bu bir “tekrar” değil; character modal’a özel **override**. Systems daha sonra yüklendiği için character sayfasına özel layout burada kalabilir. **Taşımaya gerek yok.** İsterseniz ileride modals.css içinde `[data-modal="character-modal"]` ile birleştirilebilir; şu anki ayrım da kabul edilebilir.

---

## 4. Taşınması Gerekenler / Klasör Önerileri

### 4.1 Zorunlu taşıma

- **Yok.** Tüm dosyalar doğru klasörlerde ve config ile uyumlu.

### 4.2 İsteğe bağlı düzenlemeler

1. **Video stilleri (yukarıdaki tekrar)**  
   Taşıma değil, **silme**: forms.css’teki video/play-overlay bloğunun kaldırılması ve tek kaynağın media.css olması.

2. **Modal’a özel system stilleri**  
   character, relations, stats, journal, saveload modallarının stilleri şu an `systems/` altında. İleride “tüm modal stilleri ui’da olsun” derseniz, bu dosyaları `ui/` altına (ör. `ui/modals-character.css` gibi) taşıyıp config’te `layout`/`ui`/`systems` sıralamasına göre yine doğru sırada yükleyebilirsiniz. **Mevcut haliyle bırakmak da mantıklı;** “taşınması gerekli” değil, tercih meselesi.

3. **utils/utilities.css**  
   Flex, gap, padding, text sınıfları burada. Yapı doğru; taşıma önerilmez.

---

## 5. Config Yükleme Sırası (referans)

`storyJavaScript.js` / `PJX.html` içinde sıra şöyle:

1. **base:** variables → reset → icons  
2. **layout:** structure → topbar → rightbar → mainmenu  
3. **ui:** buttons, modals, dialog, tabs, forms, navigation, settings, toggle, dropdown  
4. **screens:** welcome, startscreen, gamesetup, prologue  
5. **systems:** phone, map, wardrobe, shopping, inventory, relations, stats, journal, quest, profile, character, saveload, alarm, read  
6. **utils:** debug, notifications, tooltips, animations, utilities, media  

Bu sıra özellikle variables/reset önce, layout ve ui sonra, systems ve utils en sonda olacak şekilde doğru. Değiştirmenize gerek yok.

---

## 6. Yapılacaklar Özeti

| Öncelik | Yapılacak | Dosya |
|--------|-----------|--------|
| 1      | Video container / play-overlay / video-play-btn kurallarını forms.css’ten kaldır; tek kaynak media.css kalsın. | ui/forms.css |
| 2      | forms.css başlık/region yorumunu video kaldığı için güncelle. | ui/forms.css |
| -      | Kullanılmayan CSS dosyası yok; taşınması zorunlu dosya yok. | - |

Bu rapor, CSS klasörünün tamamı ve config ile proje kullanımına göre hazırlanmıştır. İstersen bir sonraki adımda forms.css’ten hangi satırların silineceğini satır numaralarıyla netleştirip patch halinde yazabilirim.
