
- dinersRuby Check yap.
- Mirror check.

- Kitap ve İtemlar.
- phone için selfieler ve videoları tamamla.
- lily morgan avatar photo
- Numara silindiği zaman karakter tepkileri.

- wardrobeye bikini swimsuit eklenecek
- Fotogramdaki text düzenlemeleri.
- comment ve dmlerdeki random karakterlere avatarlar gelecek.
- wardrobe revize tam hal !
- Read system için bir kaç kitap ve dergi. Sonrasında brother pc için bir kaç aksiyon tuşu ardından evde randomize oluşan 2-3 event ve park alanına biraz giriş event olarak ve iş tarafına dishwashinge bir kaç event ve main yeni teasing sceneler koymayı düşünüyorum ve iş arkadaşları için talk eventleri koymayı düşünüyorum

############################################################################################################################





- sleep ayarlarına bakılabilinir energy'ye göre uyuma gibi yada uyuma saatini zorunlu yapmak gibi.
- location geçişlerinde enerji harcaması yok !
- Read book kısımlarına yeni düzenlemeler gelebilir üzerine geldiğinde kitabın hoverı içerikte ne olduğu vs vs. ve resimler videolar.
- Profile Pictureyi saçın şekline ve rengine göre yapmak.
- Settings Help sayfası yapılacak.
- Settings Bug Report sayfası yapılacak.





a

window.__phoneVars = function () {
  return (typeof State !== "undefined" && State.variables)
    ? State.variables
    : (typeof SugarCube !== "undefined" && SugarCube.State && SugarCube.State.variables)
      ? SugarCube.State.variables
      : (window.PhoneAPI && PhoneAPI.State && PhoneAPI.State.variables)
        ? PhoneAPI.State.variables
        : null;
};

window.phoneGalleryAddItem?.("assets/content/phone/gallery/photos/normal/normalSelfie1.webp", {
  kind: "photos",
  category: "spicy",
  quality: 100,
  from: "player",
  flags: ["spicy", "risky"]
});

const v = window.__phoneVars();
v.phoneFollowers = (Number(v.phoneFollowers) || 0) + 5000;
console.log("followers:", v.phoneFollowers);

const v = window.__phoneVars();
window.updateFotogramEngagementHourly?.(v, 3); // 3 saat