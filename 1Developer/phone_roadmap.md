# Phone sistemi – Yol haritası

Telefon ve sosyal sistemin **sıradaki** aşamaları. Messages, Gallery, Camera, Talk, Meetup, Calendar **tamamlandı**; referans için `phone_system_data_and_technical.md` ve `phone_system_foundation.md` kullanılabilir.

---

## Mevcut durum (tamamlanan)

- **Messages:** Konuşma listesi, thread, badge, widget’lar, Talk topics, Meetup, Calendar.
- **Gallery + Camera:** Foto havuzu, Gallery klasörleri (normal/cute/hot/spicy/received), Camera, Messages’a foto gönderme.

**Sıradaki fazlar:** Faz 1 (Number swap) → Faz 2 (Fotogram).

---

## Faz 1 – Number swap (başlangıç)

**Amaç:** Numara verme/alma ve contact promoted’ın temelini atmak. Anon/hesap → Messages’ta gerçek contact olma akışının başlangıcı.

| # | Yapılacak | Not |
|---|-----------|-----|
| 1.1 | **Veri modeli:** Anon/hesap ID → charId eşlemesi; numara verince kişi Messages ve Calls’ta gerçek contact olarak görünsün. Nerede tutulacağı kararı (örn. `$phoneContacts` map, `$phoneConversations` key). | Fotogram DM’den önce netleşmeli. |
| 1.2 | **UI / akış:** “Numara ver” / “Numara al” başlangıç noktaları. Önce basit senaryolarla (passage veya tek bir tetikleyici) test; ileride Fotogram DM’e bağlanacak. | |

**Milestone:** Numara swap tek bir senaryoda bile çalışıyor; kişi rehberde ve Messages’ta gerçek contact olarak görünüyor.

---

## Faz 2 – Fotogram

**Amaç:** Gallery’den paylaşım; foto **kalitesi** like, takipçi ve yorumu belirliyor; zamanla DM gelme oranı artıyor; karakter cevap verme özgürlüğüne sahip (netleştirilecek); paylaşımlar **reputation** artırıyor ama **yavaş**; takipçi kasmak kolay değil, **no pain no gain**; sistem ileride bir sürü event’e ev sahipliği yapacak.

### Tasarım ilkeleri

- **Kalite:** Paylaşılan foto **Gallery’den** gelir; Gallery’deki **quality** değeri like / takipçi / yorum performansını belirler. Kalite ne kadar yüksekse etkileşim o oranda artar.
- **Like, takipçi, yorum:** Bu metrikler kalite (ve isteğe bağlı içerik tipi) ile oranlanır. Zaman içinde **DM gelme oranı** bu metriklerle artar (ne kadar çok etkileşim, o kadar çok DM ihtimali).
- **Cevap özgürlüğü:** Karakter gelen DM’lere cevap verip vermemekte özgür; cevap verme/vermeme sonuçları ileride netleştirilecek.
- **Reputation:** Paylaşımlar reputation artırır; artış **hızlı değil**. Grind hissi; yavaş yükselme.
- **No pain no gain:** Takipçi kasmak kolay olmayacak; karakter yerinde sayabilir. Süreklilik ve çaba gerekiyor; bu sistem “bedavaya” büyümez.
- **Event evi:** Fotogram ileride birçok event’e tetikleyici ve ev sahibi olacak (aile tepkisi, tanınma, agency, dünya tepkisi vb.).

### Yapılacaklar

| # | Yapılacak | Not |
|---|-----------|-----|
| 2.1 | **Feed:** Gallery’den foto paylaşımı. Her paylaşımda Gallery öğesinin **quality** (ve isteğe bağlı tip) kullanılır. | Mevcut Gallery state’i kullanılır. |
| 2.2 | **Like / takipçi / yorum:** Kalite ve içeriğe göre formül veya havuz; metrikler state’te (takipçi sayısı, post başına like/yorum). Zamanla **DM gelme oranı** bu metriklerle artan bir fonksiyon. | |
| 2.3 | **DM:** Oran like/takipçi/yorum + zamanla; anon/hesap havuzu; cevap verme özgürlüğü (cevap ver / verme, sonuçları netleştirilecek). Numara verince Faz 1 (number swap) ile Messages’ta contact. | |
| 2.4 | **Reputation:** Paylaşımlardan yavaş artış; eşikler ileride event’lerle (dünya tepkisi, fame) bağlanacak. Hızlı yükselme yok. | |
| 2.5 | **Badge / bildirim:** Fotogram okundu semantiği kararı; bildirim sayısı badge’e yansır. | |
| 2.6 | **Event altyapısı:** İleride aile yorumu, tanınma, agency vb. tetikleyicilerin bağlanacağı yer olarak Fotogram; veri yapısı buna göre düşünülmeli. | |

**Milestone:** Post atılabiliyor (Gallery’den, quality ile); like/takipçi/yorum ve DM oranı çalışıyor; reputation yavaş yükseliyor; cevap özgürlüğü ve event tetikleyicileri için zemin hazır.

---

## Sonraki adımlar (Faz 2 sonrası)

- **Finder:** Profil / eşleşme; Gallery’den foto; DM veya randevu ile Messages/Calls’a bağlantı.
- **Calls:** Arama listesi, arama, randevu oluşturma.
- **Fame / dünya tepkisi:** Reputation eşikleri, eşik event’leri (agency, tanınma vb.), tekrar tetiklenmeme tracker’ı.

Bu doküman güncel yol haritasıdır; eski `phone_system_roadmap.md` ve `phone_system_vision.md` bu planla değiştirilmiştir.
