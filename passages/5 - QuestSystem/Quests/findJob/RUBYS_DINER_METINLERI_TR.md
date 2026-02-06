# Ruby's Diner – Oyun Metinleri (Türkçe)

Passage’lara yapıştırmak için narrative ve diyalog metinleri. Buton metinleri en altta.

---

## 1. quest_find_job_ruby_diner_entrance (Giriş / Kasa)

**Narrative "Ruby's Diner":**  
İçeri giriyorsun, bir göz atıyorsun. Kırmızı vinil koltuklar, kahve ve yağ kokusu, birkaç müşteri. Career Services’tan aldığın adres kâğıdını sıkıca tutup kasaya doğru yürüyorsun.

**Narrative:**  
Tezgâhta otuzlu yaşlarında bir erkek var—yüzü güler, yıllardır burada çalışıyormuş gibi. Yaklaşınca başını kaldırıyor.

**Dialog dinerClerk:**  
Buyur. Ne alırsın?

**Dialog player:**  
Merhaba. İş için geldim. Garson ilanı? Bunu Career Services’tan aldım.

**Narrative:**  
Kâğıdı uzatıyorsun. Alıyor, bir bakıyor, başını sallıyor.

**Dialog dinerClerk:**  
Ha, onun için gelmişsin. Tamam. Tüm işe alımları patron yapar—seni arkaya götüreyim. Gel.

**Narrative:**  
Tezgâhtan çıkıp seni arkaya götürüyor. Mutfağın yanından geçiyorsun, sonra dar bir koridora açılan bir kapıya geliyorsunuz.

**Dialog dinerClerk:**  
Solda giyinme odası ve depo var. Koridorun sonunda müdürün odası. Sadece çal kapıyı.

**Narrative:**  
Koridoru işaret ediyor, cesaret veren bir bakış atıyor ve ön tarafa geri dönüyor.

**Buton:**  
Müdürün odasına doğru yürü

---

## 2. quest_find_job_ruby_diner_corridor (Koridor / Kapı)

**Narrative "Back corridor" / "Arka koridor":**  
Koridorda yürüyorsun. Solda iki kapı geçiyorsun—biri "Giyinme odası," diğeri "Depo." Sonda tabelasız kapalı bir kapı var. Müdürün odası.

**Narrative:**  
Kapıyı çalıyorsun.

**Dialog dinerManager:**  
Girin.

**Narrative:**  
Kapıyı açıp içeri adım atıyorsun.

**Dialog player:**  
Merhaba. İş başvurusu için geldim. Garson pozisyonu.

**Buton:**  
Ofise gir

---

## 3. quest_find_job_ruby_diner_manager_room (Müdür odası)

**Narrative "Manager's office" / "Müdürün odası":**  
Masanın arkasında kırklı yaşlarında bir adam oturuyor. Seni süzüyor—tam profesyonel değil, biraz fazla uzun—sonra gülümsüyor.

**Dialog dinerManager:**  
Hoş geldin. Otur. Tam masanın önüne, oraya.

**Narrative:**  
Oturuyorsun. O geriye yaslanıp ellerini birleştiriyor.

**Dialog dinerManager:**  
Demek burada çalışmak istiyorsun. Ben Vince. Bu mekânın sahibiyim. Sen?

**Dialog player:**  
<<= $player.firstName>> <<= $player.lastName>>. Yeni taşındım şehre. Deneyimim yok ama çalışkanım.

**Dialog dinerManager:**  
<<= $player.firstName>>. Memnun oldum.

**Narrative:**  
Öyle bir bakıyor ki kollarını kavuşturasın geliyor. Devam etmesini bekliyorsun.

**Dialog dinerManager:**  
Bak, açık konuşayım. Seni garson olarak alamam.

**Dialog player:**  
Peki. Nedenini sorabilir miyim?

**Dialog dinerManager:**  
Hiç aynada kendine baktın mı?

**Narrative:**  
Donuyorsun. Sözler tokat gibi çarpıyor.

**Dialog dinerManager:**  
Yani—biraz dağınık görünüyorsun. Ön tarafta düzgün görünen biri lazım. Müşteriler fark ediyor. O yüzden o pozisyon olmayacak.

**Narrative:**  
Yüzünün yandığını hissediyorsun. Sesini sabit tutuyorsun. Belli etmiyorsun.

**Dialog player:**  
Anladım.

**Narrative:**  
Kalkıp çıkmak üzereyken elini kaldırıyor.

**Dialog dinerManager:**  
Bekle. İstersen bulaşıkçı işi ayarlayabilirim. Arka tarafta. Orada kimse seni görmez. Aynı bina, düzenli mesai. Ne dersin?

**Dialog player:**  
Şey... Daha fazla bilmam lazım. Maaş, mesai. Bir de düşünmem için süre isterim.

**Dialog dinerManager:**  
Tamam. Acele etme. Karar verince gel, beni sor.

**Narrative:**  
Kalkıyorsun. Göğsün sıkışıyor ama toparlanıyorsun. Ofisten çıkıp koridoru geçiyor, tekrar diner’a dönüyorsun. Arkana bakmıyorsun.

**Buton:**  
Ruby's Diner'dan ayrıl
