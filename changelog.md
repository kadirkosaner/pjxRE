# Changelog

## Öne Çıkanlar

- Sunset Park'taki Lily hattı genişletildi; koşudan Iron Works Gym'e uzanan yeni bir görev akışı eklendi.
- İş sistemi büyük güncelleme aldı: Work Trust, patron karar süreçleri, terfi ve haftalık ödeme akışları yeniden düzenlendi.
- Kritik sağlık/hastane akışı güçlendirildi; çöküşten toparlanmaya kadar süreç daha tutarlı ve ücretli tedavi sistemiyle daha anlamlı.
- Journal, Work ve görev yönlendirme (tip) tarafında görünürlük artırıldı; oyuncu ilerlemesi daha net takip ediliyor.

## İş Sistemi

- İş sistemi kapsamlı biçimde yeniden dengelendi (disiplin, terfi, maaş, patron görüşmeleri).
- Strike sistemi kaldırıldı; Work Trust ilerleyişiyle performansınız sonuçlara daha net yansıyor.
- Uyarı ve işten çıkarılma süreçleri daha olay odaklı hale getirildi, ani kopuşlar azaltıldı.
- Terfi ve haftalık ödeme akışında düzenlemeler yapıldı; kesinti tarafı da yeniden ayarlandı.
- İş kaynaklı skill kazanımları erken oyunda daha akıcı, ilerleyen aşamada daha kontrollü ilerler.

## Arayüz ve Navigasyon

- Ayarlar ve temel UI akışı sadeleştirildi.
- Ayna/makyaj ekranı yeniden düzenlendi; bilgi yoğunluğu azaltılıp kullanım kolaylığı artırıldı.
- Journal ve Work sekmelerine görev/durum bildirimleri eklendi.
- Journal görev detaylarında kısa yönlendirme için `tip` satırı desteği geldi.
- Ruby's Diner içi geçişler daha tutarlı hale getirildi.
- Patron iletişimi için telefon ve yüz yüze diyalog akışlarına yeni seçenekler eklendi.
- Lokasyon navigasyon kartları için yeni bir düzen seçeneği eklendi: Ayarlar > Gameplay > Navigation'dan Horizontal veya Vertical tercih edilebiliyor.

## Oynanış ve Yaşam

- Eski Kasaba'da çevreyi gezdiğinizde bazen kitapçıyı keşfedebilirsiniz.
- Yemek yeme ve kahve içme eylemlerinin enerji ve açlık değerleri yeniden dengelendi.
- Uyku sistemi iyileştirildi; erken uyanma sonrası akış daha doğal ilerliyor.
- İhtiyaç simülasyonu kapalıyken gereksiz bildirimler temizlendi.
- Makyaj bozulması saatlik düzene alındı; yüz temizleme tarafı daha net sonuç veriyor.
- Pratik Makyaj kazanımı ve ayna tarafındaki ilerleme geri bildirimleri düzenlendi.
- Sunset Park'ta Lily ile koşu içeriği genişletildi.
- Lily hattında Iron Works Gym'e uzanan yeni bir görev zinciri eklendi.
- Oyun akışında düzenlemeler yapıldı.

## Etkileşimler ve Konuşmalar

- Konuşma ekranlarında Geri davranışı artık ayarlardan seçilebiliyor.
- Marcus konuşmaları günün saatine göre düzenlendi; 15 yeni varyasyon eklendi.
- Lily konuşmaları günün saatine göre düzenlendi; 16 yeni varyasyon eklendi.

## Bayılma ve Çöküş İyileştirmeleri

- Energy Collapse sonrası ihtiyaç değerleri güvenli seviyeye çekilerek döngü sorunları azaltıldı.
- Düşük sağlıkta bazı sahnelerde oluşan tekrar-bayılma problemleri giderildi.
- Hastane geçişlerinde geri navigasyon davranışı iyileştirildi.

## Hata Düzeltmeleri

- Bildirim sisteminde bazı durumlarda görülen hataya karşı güvenli fallback eklendi.
- Bu hatanın zaman ilerletme akışını bozup sahneleri kilitlemesine neden olan zincir etkiler giderildi.
- Widget içi `<<return>>` kullanımından kaynaklı kritik navigasyon/akış hatası düzeltildi.

## Teknik ve Kayıt Uyumluluğu

- Eski kayıtlar için save migration güncellendi; yeni iş değişkenleri ve ilgili telefon/iş durumları güvenli şekilde devralınır.
- Yüz yüze yalan sistemi için yeni kayıt alanları eklendi (patron görüşmesi yalan denemesi, sonuç ve uygulanan kesinti); eski kayıtlar otomatik olarak güncellenir.
