# Changelog

## Oynanış ve Yaşam

- Eski Kasaba'da çevreyi gezdiğinizde bazen kitapçıyı keşfedebilirsiniz.
- Yemek yeme ve kahve içme eylemlerinin enerji ve açlık değerleri yeniden dengelendi.
- Uyku sistemi iyileştirildi: Erken uyandığınızda seçtiğiniz süre tamamlanana kadar veya alarm kuruluysa alarm çalana kadar yeniden uyuyabilirsiniz. Enerji seviyesi tam dolmadıysa Snooze seçeneği kullanılabilir.
- İhtiyaç simülasyonları (açlık, susuzluk vb.) kapalıyken artık ilgili gereksiz bildirimler çıkmıyor; kurulum akışı düzeltildi.
- Makyaj bozulması günlük blok yerine saatlik hesaplanıyor; oyun saatinde tamamlanan her saat için kalite düşer. Makyajın solması (Makeup Fade) ayarı kapalıysa bu bozulma uygulanmaz.
- Yüzünüzü yıkamak veya ıslak mendille makyajı çıkarmak makyajı tamamen kaldırır.
- Ayna ve rutinde makyaj uyguladıkça Pratik Makyaj yeteneği kazanır; ayna üzerinden kazanım üst sınırı 35’tir. Tavana ulaştığınızda rutin bildirimi ve uygulama sonrası anlatı doğru şekilde tetiklenir.

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
- Karakter görünümünde yüz bilgisinde makyaj stili ve tamamlanma yüzdesi gösteriliyor.
- Ayna ekranı yeniden düzenlendi: rutin, vücut bakımı ve makyaj bölümleri dış başlıklarla ayrıldı; makyaj seçenekleri iki satıra bölündü, Geri ve makyajı çıkarma ikincil buton stiliyle sunuluyor; makyaj setiniz yoksa kısa bilgi notu görünür.
- Yeni quest alındığında üst çubuktaki Journal sekmesinde kırmızı bildirim noktası gösteriliyor.
- Work sekmesi güncellendi: patron görüşmesi/terfi bekleme durumları ve trust bilgisi daha görünür hale getirildi; sekmede kırmızı bildirim noktası eklendi.
- Ruby's Diner içi gezinme sadeleştirildi: iç lokasyon nav düzeni standartlaştırıldı, gereksiz geçişler temizlendi.
- Telefona işe gelmeme mazereti sistemi eklendi. Patron numarası üzerinden dürüst/yalan mesaj seçenekleri, saat kısıtı ve uygunluk kuralları ile çalışır.
- Patron görüşmelerinde yüz yüze yalan sistemi eklendi. Eksik vardiya ya da atlanan görüşme sonrası patronun karşısına geçtiğinizde artık iki seçenek sunuluyor: "Take the warning" ile uyarıyı kabul edebilir ya da "Try to explain" ile bir bahane uydurabilirsiniz. Açıklama denemesi Corruption 2 ve Confidence 10 gerektirir.
- Yalan havuzu duruma göre değişir: sabah hiç gelmediyseniz "neden gelmedin" yalanları, erken çıktıysanız "neden erken ayrıldın" yalanları, görüşmeyi kaçırdıysanız ona özel bahaneler rastgele seçilerek sunulur. 
- Yalanın başarı şansı Persuasion, Problem Solving ve Confidence değerlerinizle artar. Başarılı olursanız patron ikna olur ve güven puanınızın bir kısmı geri gelir; başarısız olursanız bu haftanın kesintisine patronun notu eklenir (haftalık zarfta görürsünüz) ve güven puanınız daha da düşer.
- Yalan denediğinizde (başarılı veya başarısız) Persuasion ve Problem Solving yeteneklerinden küçük tecrübe kazanırsınız.
- Journal görev detayında stage açıklamalarının altına isteğe bağlı "tip" satırı desteği eklendi; saat/koşul kritik adımlarda kısa yönlendirme metni gösterilebilir.


## Teknik ve Kayıt Uyumluluğu

- Eski kayıtlar için save migration güncellendi; yeni iş değişkenleri ve ilgili telefon/iş durumları güvenli şekilde devralınır.
- Yüz yüze yalan sistemi için yeni kayıt alanları eklendi (patron görüşmesi yalan denemesi, sonuç ve uygulanan kesinti); eski kayıtlar otomatik olarak güncellenir.