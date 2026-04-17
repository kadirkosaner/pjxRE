# Changelog

## Oynanış ve Yaşam

- Eski Kasaba'da çevreyi gezdiğinizde bazen kitapçıyı keşfedebilirsiniz.
- Yemek yeme ve kahve içme eylemlerinin enerji ve açlık değerleri yeniden dengelendi.
- Uyku sistemi iyileştirildi: Erken uyandığınızda seçtiğiniz süre tamamlanana kadar veya alarm kuruluysa alarm çalana kadar yeniden uyuyabilirsiniz. Enerji seviyesi tam dolmadıysa Snooze seçeneği kullanılabilir.
- İhtiyaç simülasyonları (açlık, susuzluk vb.) kapalıyken artık ilgili gereksiz bildirimler çıkmıyor; kurulum akışı düzeltildi.

## Etkileşimler ve Konuşmalar

- Konuşma ekranlarında Geri davranışı artık ayarlardan seçilebiliyor: dilerseniz konuşmadan sonra konuşma menüsünde kalabilir, dilerseniz bulunduğunuz pasaja dönebilirsiniz.
- Marcus konuşmaları günün saatine göre düzenlendi; 15 yeni varyasyon eklendi.
- Lily konuşmaları günün saatine göre düzenlendi; 16 yeni varyasyon eklendi.

## İş Sistemi

- İş sistemi kapsamlı şekilde yenilendi: disiplin, terfi, maaş ve patron görüşmeleri artık daha tutarlı ve olay odaklı çalışıyor.
- Strike sistemi kaldırılıp Work Trust sistemine geçildi. İş performansına göre güven puanı düşer/yükselir; kritik eşiklerde patron görüşmesi zorunlu olur.
- Artık patronla konuşmadan anlık işten çıkarılma yok. İşten çıkarılma kararı görüşme/event üzerinden ilerler.
- Terfiler otomatik verilmiyor; uygun olduğunuzda "promotion pending" durumuna düşersiniz ve patron onayı gerekir.
- Eksik vardiya günleri (0/8, 4/8, 6/8) için ertesi iş gününde patron görüşmesi tetiklenir; diyaloglar güven bandına göre farklılaşır.
- Haftalık maaş sistemi yenilendi: otomatik pazartesi ödemesi kaldırıldı. Haftalık ödeme zarf olayı ile ilk uygun iş gününde teslim edilir.
- Kesinti indirimi (trust indirimi) sistemi eklendi ve yeniden dengelendi: güven puanına göre kesintilerde indirim uygulanır.
- İş sistemi skill kazanımları yeniden dengelendi: erken oyunda akıcı, orta-geç oyunda daha yavaş ilerler; soft-cap sistemi eklendi.

## Arayüz ve Navigasyon

- Ayarlar menüsünde kapalı bırakılan seçeneklerin davranışı gözden geçirildi; oyun akışı sadeleştirildi.
- Yeni quest alındığında üst çubuktaki Journal sekmesinde kırmızı bildirim noktası gösteriliyor.
- Work sekmesi güncellendi: patron görüşmesi/terfi bekleme durumları ve trust bilgisi daha görünür hale getirildi; sekmede kırmızı bildirim noktası eklendi.
- Ruby's Diner içi gezinme sadeleştirildi: iç lokasyon nav düzeni standartlaştırıldı, gereksiz geçişler temizlendi.
- Telefona işe gelmeme mazereti sistemi eklendi. Patron numarası üzerinden dürüst/yalan mesaj seçenekleri, saat kısıtı ve uygunluk kuralları ile çalışır.

## Teknik ve Kayıt Uyumluluğu

- Eski kayıtlar için save migration güncellendi; yeni iş değişkenleri ve ilgili telefon/iş durumları güvenli şekilde devralınır.