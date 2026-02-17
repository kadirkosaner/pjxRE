# Phone Walkthrough + F12 Helper Codes

Bu dokuman phone sistemi icin hizli test ve debug rehberidir.
Odak: "hangi sahne ne acar", "hangi text nerede", "hangi foto/video nereden gelir".

---

## 0) F12 Basic Bootstrap

Konsolda once bunu calistir. Sonraki snippet'ler bunu kullanir.

```js
window.__phoneVars = function () {
  return (typeof State !== "undefined" && State.variables)
    ? State.variables
    : (typeof SugarCube !== "undefined" && SugarCube.State && SugarCube.State.variables)
      ? SugarCube.State.variables
      : (window.PhoneAPI && PhoneAPI.State && PhoneAPI.State.variables)
        ? PhoneAPI.State.variables
        : null;
};
```

---

## 1) Phone Overlay ve App Acma

### 1.1 Phone'u ac

```js
if (typeof window.openPhoneOverlay === "function") window.openPhoneOverlay();
```

### 1.2 Direkt Fotogram tabina git (UI click simulasyonu)

```js
const openApp = (action) => {
  const btn = document.querySelector(`#phone-overlay .phone-app[data-action="${action}"]`);
  if (btn) btn.click();
};
openApp("fotogram");
```

### 1.3 Fotogram alt tab ac (feed/share/profile/dm)

```js
const openFgTab = (tab) => {
  const btn = document.querySelector(`#phone-overlay .phone-fotogram-tab[data-tab="${tab}"]`);
  if (btn) btn.click();
};
openFgTab("dm"); // "feed" | "share" | "profile" | "dm"
```

---

## 2) Setup Kontrol (en kritik)

```js
if (typeof window.phoneDebugFotogramSetup === "function") {
  console.log(window.phoneDebugFotogramSetup());
}
```

Beklenen:

```js
{ ok: true, missing: [] }
```

---

## 3) Foto/Video Ekleme ve Post Testi

### 3.1 Galeriye test media ekle

```js
window.phoneGalleryAddItem?.("assets/content/phone/gallery/photos/normal/normalSelfie1.webp", {
  kind: "photos",
  category: "spicy",
  quality: 100,
  from: "player",
  flags: ["spicy", "risky"]
});
```

Video:

```js
window.phoneGalleryAddItem?.("assets/content/phone/gallery/videos/normal/normalVideo1.mp4", {
  kind: "videos",
  category: "spicy",
  quality: 100,
  from: "player",
  flags: ["spicy", "risky"]
});
```

### 3.2 Son eklenen media ile Fotogram post at

```js
const v = window.__phoneVars();
const list = (v.phoneGallery?.photos?.spicy || []);
const last = list[list.length - 1];
if (last && window.phoneCreateFotogramPost) {
  console.log(window.phoneCreateFotogramPost(last.id, false));
}
```

---

## 4) Engagement, Comment, DM Hizlandirma

### 4.1 Saatlik engagement tetikle

```js
const v = window.__phoneVars();
window.updateFotogramEngagementHourly?.(v, 3); // 3 saat
```

### 4.2 Gunluk engagement tetikle

```js
const v = window.__phoneVars();
window.updateFotogramEngagement?.(v);
```

---

## 5) DM Scenario Walkthrough

### 5.1 Aktif DM'leri listele

```js
const v = window.__phoneVars();
console.table((v.phoneFotogramDMs || []).map(dm => ({
  id: dm.id,
  anon: dm.anonName,
  scenario: dm.scenarioType,
  node: dm.flowState?.currentNode,
  choices: (dm.flowState?.currentChoices || []).map(c => c.key).join(", ")
})));
```

### 5.2 Belirli DM'ye reply gonder (debug)

```js
const v = window.__phoneVars();
const dm = (v.phoneFotogramDMs || []).find(x => x.isInteractive && !x.blocked);
if (dm) {
  const key = dm.flowState?.currentChoices?.[0]?.key;
  if (key) window.processFotogramDMReply?.(v, dm.id, key);
}
```

### 5.3 Scenario node haritasi incele

```js
console.log(Object.keys(setup.fotogramDMScenarioFlows || {})); // pickup_open, praise_open, dickpic_open
console.log(Object.keys(setup.fotogramDMScenarioFlows?.dickpic_open?.nodes || {}));
```

---

## 6) "Hangi Text Nerede?"

- DM scenario text ve secimler:
  - `passages/0 - System/Init/phone/fotogramDMInteractive.twee`
  - `setup.fotogramDMScenarioFlows`
- DM opener text:
  - ayni dosyada `setup.fotogramDMScenarioOpeners`
- Legacy/non-interactive DM text:
  - `passages/0 - System/Init/phone/fotogramDMs.twee`
- Comment text:
  - `passages/0 - System/Init/phone/fotogramComments.twee`

Hizli bakis:

```js
console.log(setup.fotogramDMScenarioOpeners);
console.log(setup.fotogramDMScenarioFlows?.pickup_open?.nodes?.pickup_start);
console.log((setup.fotogramDMEncouragingMessages || []).slice(0, 5));
console.log((setup.fotogramCommentTemplates?.spicy || []).slice(0, 5));
```

---

## 7) "Hangi Foto/Video Nerede?"

### 7.1 Topic imagePool kaynaklari

- `setup.phonePhotos`
- Dosya: `passages/0 - System/Init/phone/variablesPhonePhotos.twee`

### 7.2 DM attachment kaynaklari (spicy/sexting/default)

- `setup.fotogramDMPhotoPool`
- Dosya: `passages/0 - System/Init/phone/variablesPhonePhotos.twee`

Hizli bakis:

```js
console.log(setup.phonePhotos);
console.log(setup.fotogramDMPhotoPool);
console.log(setup.fotogramDMPhotoPool?.sexting?.tan);
```

---

## 8) Spicy vs Sexting

- `spicy`: daha soft lewd pool
- `sexting`: daha ileri pool (video da dusurebilir)
- Node bazinda hangi pool kullanilir:
  - `attachment: { pool: "spicy" }`
  - `attachment: { pool: "sexting" }`
  - `randomAttachment: { chance: 0.55, pools: ["sexting","spicy"] }`

---

## 9) Siklikla Lazim Olan F12 Kisa Kodlar

### Followers arttir

```js
const v = window.__phoneVars();
v.phoneFollowers = (Number(v.phoneFollowers) || 0) + 5000;
console.log("followers:", v.phoneFollowers);
```

### Cooldown sifirla

```js
const v = window.__phoneVars();
v.phoneLastFotogramPostDate = null;
v.phoneFotogramCooldownDays = 0;
```

### DM list temizleme (sadece test)

```js
const v = window.__phoneVars();
v.phoneFotogramDMs = [];
console.log("DMs cleared");
```

---

## 10) Notlar

- Eski thread mesajlari gecmiste kalir; yeni text degisiklikleri yeni DM'lerde net gorunur.
- `setup` degisiklikleri icin save + reload tavsiye edilir.
- Debug kodlari test amaclidir, release gameplay icin kullanilmaz.
