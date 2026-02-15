# 📸 Phone Camera & Gallery System - Complete Implementation Roadmap

## 📊 Project Status

### ✅ COMPLETED (100%)

#### 1. State System

**File:** `passages/0 - System/Init/variablesPhoneGallery.twee`

```twee
:: variablesPhoneGallery [init nobr]
<<set $phoneGallery = {
	photos: {
		normal: [],
		cute: [],
		hot: [],
		spicy: [],
		received: []
	},
	videos: {
		normal: [],
		cute: [],
		hot: [],
		spicy: [],
		received: []
	}
}>>
```

**Data Structure:**

```javascript
// Each media item:
{
  id: 'media_1234567890_abc123',
  timestamp: {
    day: 14,
    month: 2,
    year: 2026,
    hour: 14,
    minute: 30
  },
  location: 'home',      // location ID where taken
  quality: 78,           // 1-100 score
  from: 'player'         // 'player' or charId
}
```

---

#### 2. Camera UI

**File:** `assets/system/js/ui/phone/phone-camera.js`

**Features:**

- ✅ 2 sections (Selfies/Videos)
- ✅ 8 buttons (4 selfie + 4 video)
- ✅ Stat requirements:
  - Normal: Always available
  - Cute: looks >= 20
  - Hot: beauty >= 40 && lust >= 20
  - Spicy: beauty >= 60 && lust >= 40
- ✅ Locked tooltips: "You don't meet the requirements"

**Button IDs:**

- Selfies: `phone-camera-normal`, `phone-camera-cute`, `phone-camera-hot`, `phone-camera-spicy`
- Videos: `phone-camera-video-normal`, `phone-camera-video-cute`, `phone-camera-video-hot`, `phone-camera-video-spicy`

---

#### 3. Camera Functions

**File:** `assets/system/js/ui/phone/phone-camera.js`

**Functions:**

##### `calculateMediaQuality(player, type)`

```javascript
// Quality formula (1-100):
// - Normal: beauty * 0.4 + looks * 0.3 + base 40
// - Cute: looks * 0.5 + beauty * 0.3 + base 40
// - Hot: beauty * 0.4 + lust * 0.2 + looks * 0.2 + base 40
// - Spicy: beauty * 0.3 + lust * 0.3 + exhibitionism * 0.2 + base 40
// ± 10% random variation
```

##### `window.phoneTakeSelfie(type)`

```javascript
// 1. Get stats from State.variables
// 2. Calculate quality
// 3. Create photo object
// 4. Add to $phoneGallery.photos[type]
// 5. Persist changes
// 6. Show notification: "Selfie taken! Quality: 75/100"
```

##### `window.phoneRecordVideo(type)`

```javascript
// Same as phoneTakeSelfie but for videos
// Adds to $phoneGallery.videos[type]
```

---

#### 4. Event Handlers

**File:** `assets/system/js/ui/phone/index.js`

**Location:** Inside `createPhoneOverlay()` function

```javascript
// Selfie buttons
$("#phone-overlay").on("click", "#phone-camera-normal", function () {
  if (typeof window.phoneTakeSelfie === "function") {
    window.phoneTakeSelfie("normal");
  }
});
// ... same for cute, hot, spicy

// Video buttons
$("#phone-overlay").on("click", "#phone-camera-video-normal", function () {
  if (typeof window.phoneRecordVideo === "function") {
    window.phoneRecordVideo("normal");
  }
});
// ... same for cute, hot, spicy
```

---

#### 5. CSS

**File:** `assets/system/css/systems/phone-camera.css`

**Added to config:** `config.js` → `systems: ["phone-camera"]`

**Key styles:**

- `.phone-camera-section` - Section wrapper
- `.phone-camera-section-title` - "SELFIES" / "VIDEOS" headers
- `.phone-topic-btn.btn-locked` - Locked button styling
- Vertical alignment and spacing

---

## 🎯 TODO: PHASE 1 - Gallery UI & Display

### File: `assets/system/js/ui/phone/phone-gallery.js`

Currently has placeholder. Need to implement full gallery.

#### Task 1.1: Gallery Render Function

**Replace placeholder with:**

```javascript
function phoneRenderGalleryApp(vars) {
  const gallery = vars.phoneGallery || { photos: {}, videos: {} };

  // Count totals
  const photoCount = Object.values(gallery.photos).flat().length;
  const videoCount = Object.values(gallery.videos).flat().length;
  const receivedCount =
    (gallery.photos.received?.length || 0) +
    (gallery.videos.received?.length || 0);
  const totalCount = photoCount + videoCount;

  // Get current filter (from phoneViewState or default to 'all')
  const currentFilter = window.phoneViewState?.galleryFilter || "all";

  // Build tabs
  let tabsHtml = '<div class="gallery-tabs">';
  tabsHtml +=
    '<button class="gallery-tab' +
    (currentFilter === "all" ? " active" : "") +
    '" data-filter="all">All (' +
    totalCount +
    ")</button>";
  tabsHtml +=
    '<button class="gallery-tab' +
    (currentFilter === "photos" ? " active" : "") +
    '" data-filter="photos">Selfies (' +
    photoCount +
    ")</button>";
  tabsHtml +=
    '<button class="gallery-tab' +
    (currentFilter === "videos" ? " active" : "") +
    '" data-filter="videos">Videos (' +
    videoCount +
    ")</button>";
  tabsHtml +=
    '<button class="gallery-tab' +
    (currentFilter === "received" ? " active" : "") +
    '" data-filter="received">Received (' +
    receivedCount +
    ")</button>";
  tabsHtml += "</div>";

  // Get filtered items
  let items = [];

  if (currentFilter === "all") {
    // All photos and videos
    Object.values(gallery.photos)
      .flat()
      .forEach((item) => {
        items.push({ ...item, mediaType: "photo" });
      });
    Object.values(gallery.videos)
      .flat()
      .forEach((item) => {
        items.push({ ...item, mediaType: "video" });
      });
  } else if (currentFilter === "photos") {
    // All photos only
    Object.values(gallery.photos)
      .flat()
      .forEach((item) => {
        items.push({ ...item, mediaType: "photo" });
      });
  } else if (currentFilter === "videos") {
    // All videos only
    Object.values(gallery.videos)
      .flat()
      .forEach((item) => {
        items.push({ ...item, mediaType: "video" });
      });
  } else if (currentFilter === "received") {
    // Only received items
    (gallery.photos.received || []).forEach((item) => {
      items.push({ ...item, mediaType: "photo" });
    });
    (gallery.videos.received || []).forEach((item) => {
      items.push({ ...item, mediaType: "video" });
    });
  }

  // Sort by date (newest first)
  items.sort((a, b) => {
    const aTime =
      a.timestamp.day * 1440 + a.timestamp.hour * 60 + a.timestamp.minute;
    const bTime =
      b.timestamp.day * 1440 + b.timestamp.hour * 60 + b.timestamp.minute;
    return bTime - aTime;
  });

  // Build grid
  let gridHtml = '<div class="gallery-grid">';

  if (items.length === 0) {
    // Empty state
    gridHtml += '<div class="gallery-empty">';
    gridHtml += '<div class="gallery-empty-icon">📷</div>';
    gridHtml += '<div class="gallery-empty-text">No media yet</div>';
    gridHtml +=
      '<div class="gallery-empty-sub">Take some selfies or videos!</div>';
    gridHtml += "</div>";
  } else {
    // Grid items
    items.forEach((item) => {
      const icon = item.mediaType === "photo" ? "📷" : "🎥";
      const qualityClass =
        item.quality >= 70 ? "high" : item.quality >= 40 ? "medium" : "low";

      gridHtml += '<div class="gallery-item" data-media-id="' + item.id + '">';
      gridHtml += '<div class="gallery-thumbnail">' + icon + "</div>";
      gridHtml +=
        '<div class="gallery-quality ' +
        qualityClass +
        '">' +
        item.quality +
        "</div>";
      gridHtml += "</div>";
    });
  }

  gridHtml += "</div>";

  return '<div class="phone-gallery-view">' + tabsHtml + gridHtml + "</div>";
}
```

---

#### Task 1.2: Gallery Event Handlers

**Add to:** `assets/system/js/ui/phone/index.js` → `createPhoneOverlay()` function

```javascript
// Gallery: Tab filtering
$("#phone-overlay").on("click", ".gallery-tab", function () {
  const filter = $(this).data("filter");
  if (!window.phoneViewState) window.phoneViewState = {};
  window.phoneViewState.galleryFilter = filter;

  // Re-render gallery
  const vars = PhoneAPI.State.variables;
  $("#phone-app-view-content").html(window.PhoneApps.gallery.render(vars));

  // Re-init tooltips if needed
  if (typeof window.initTooltips === "function") {
    window.initTooltips();
  }
});

// Gallery: Item click (opens preview)
$("#phone-overlay").on("click", ".gallery-item", function () {
  const mediaId = $(this).data("media-id");
  if (typeof window.openGalleryPreview === "function") {
    window.openGalleryPreview(mediaId);
  }
});
```

---

#### Task 1.3: Gallery CSS

**Create file:** `assets/system/css/systems/phone-gallery.css`

**Add to config:** `config.js` → `systems: ["phone-gallery"]`

```css
/* Gallery Tabs */
.gallery-tabs {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.gallery-tab {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gallery-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.gallery-tab.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}

/* Gallery Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.gallery-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.gallery-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  opacity: 0.7;
}

.gallery-quality {
  position: absolute;
  bottom: var(--spacing-xs);
  right: var(--spacing-xs);
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
}

.gallery-quality.high {
  color: #10b981;
}

.gallery-quality.medium {
  color: #f59e0b;
}

.gallery-quality.low {
  color: #ef4444;
}

/* Empty State */
.gallery-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.gallery-empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: var(--spacing-md);
}

.gallery-empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.gallery-empty-sub {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
```

---

## 🎯 TODO: PHASE 2 - Gallery Preview Modal

### Task 2.1: Preview Modal Function

**Add to:** `assets/system/js/ui/phone/phone-gallery.js`

```javascript
/**
 * Open preview modal for media item
 * @param {string} mediaId - Media ID to preview
 */
window.openGalleryPreview = function (mediaId) {
  if (!PhoneAPI) return;
  const vars = PhoneAPI.State.variables;
  const gallery = vars.phoneGallery || { photos: {}, videos: {} };

  // Find item
  let item = null;
  let itemType = "";
  let itemCategory = "";

  // Search in photos
  for (const [cat, items] of Object.entries(gallery.photos)) {
    const found = items.find((i) => i.id === mediaId);
    if (found) {
      item = found;
      itemType = "photo";
      itemCategory = cat;
      break;
    }
  }

  // Search in videos if not found
  if (!item) {
    for (const [cat, items] of Object.entries(gallery.videos)) {
      const found = items.find((i) => i.id === mediaId);
      if (found) {
        item = found;
        itemType = "video";
        itemCategory = cat;
        break;
      }
    }
  }

  if (!item) return;

  // Build modal HTML
  const icon = itemType === "photo" ? "📷" : "🎥";
  const typeLabel = itemType === "photo" ? "Selfie" : "Video";
  const categoryLabel =
    itemCategory.charAt(0).toUpperCase() + itemCategory.slice(1);
  const qualityClass =
    item.quality >= 70 ? "high" : item.quality >= 40 ? "medium" : "low";

  let modalHtml = '<div class="gallery-preview-modal">';

  // Header
  modalHtml += '<div class="preview-header">';
  modalHtml +=
    '<span class="preview-title">' +
    categoryLabel +
    " " +
    typeLabel +
    "</span>";
  modalHtml +=
    '<button class="preview-close" id="gallery-preview-close">×</button>';
  modalHtml += "</div>";

  // Content
  modalHtml += '<div class="preview-content">';
  modalHtml += '<div class="preview-thumbnail">' + icon + "</div>";
  modalHtml += "</div>";

  // Details
  modalHtml += '<div class="preview-details">';
  modalHtml += '<div class="preview-detail">';
  modalHtml += '<span class="preview-detail-label">Quality:</span>';
  modalHtml +=
    '<span class="preview-detail-value ' +
    qualityClass +
    '">' +
    item.quality +
    "/100</span>";
  modalHtml += "</div>";
  modalHtml += '<div class="preview-detail">';
  modalHtml += '<span class="preview-detail-label">Location:</span>';
  modalHtml +=
    '<span class="preview-detail-value">' +
    (item.location || "Unknown") +
    "</span>";
  modalHtml += "</div>";
  modalHtml += '<div class="preview-detail">';
  modalHtml += '<span class="preview-detail-label">Date:</span>';
  modalHtml +=
    '<span class="preview-detail-value">' +
    item.timestamp.month +
    "/" +
    item.timestamp.day +
    "/" +
    item.timestamp.year +
    "</span>";
  modalHtml += "</div>";
  modalHtml += '<div class="preview-detail">';
  modalHtml += '<span class="preview-detail-label">Time:</span>';
  modalHtml +=
    '<span class="preview-detail-value">' +
    item.timestamp.hour +
    ":" +
    (item.timestamp.minute < 10 ? "0" : "") +
    item.timestamp.minute +
    "</span>";
  modalHtml += "</div>";
  modalHtml += "</div>";

  // Actions
  modalHtml += '<div class="preview-actions">';
  modalHtml +=
    '<button class="preview-btn preview-delete" data-media-id="' +
    mediaId +
    '" data-media-type="' +
    itemType +
    '" data-media-category="' +
    itemCategory +
    '">Delete</button>';
  if (item.from === "player") {
    modalHtml +=
      '<button class="preview-btn preview-send" data-media-id="' +
      mediaId +
      '">Send to...</button>';
  }
  modalHtml += "</div>";

  modalHtml += "</div>";

  // Append to phone overlay
  $("#phone-overlay").append(modalHtml);
};

/**
 * Close preview modal
 */
window.closeGalleryPreview = function () {
  $(".gallery-preview-modal").remove();
};

/**
 * Delete media item
 * @param {string} mediaId - Media ID
 * @param {string} mediaType - 'photo' or 'video'
 * @param {string} category - 'normal', 'cute', etc
 */
window.deleteGalleryItem = function (mediaId, mediaType, category) {
  if (!PhoneAPI) return;
  const vars = PhoneAPI.State.variables;

  const collection =
    mediaType === "photo" ? vars.phoneGallery.photos : vars.phoneGallery.videos;
  const items = collection[category];

  if (!items) return;

  const index = items.findIndex((i) => i.id === mediaId);
  if (index !== -1) {
    items.splice(index, 1);
    persistPhoneChanges();

    // Close modal and refresh gallery
    window.closeGalleryPreview();

    // Re-render gallery
    $("#phone-app-view-content").html(window.PhoneApps.gallery.render(vars));

    // Show notification
    if (typeof Engine !== "undefined" && Engine.wiki) {
      Engine.wiki("<<notify>>Item deleted<</notify>>");
    }
  }
};
```

---

### Task 2.2: Preview Event Handlers

**Add to:** `assets/system/js/ui/phone/index.js` → `createPhoneOverlay()`

```javascript
// Gallery Preview: Close
$("#phone-overlay").on("click", "#gallery-preview-close", function () {
  if (typeof window.closeGalleryPreview === "function") {
    window.closeGalleryPreview();
  }
});

// Gallery Preview: Delete
$("#phone-overlay").on("click", ".preview-delete", function () {
  const mediaId = $(this).data("media-id");
  const mediaType = $(this).data("media-type");
  const category = $(this).data("media-category");

  // Confirm deletion
  if (confirm("Delete this item?")) {
    if (typeof window.deleteGalleryItem === "function") {
      window.deleteGalleryItem(mediaId, mediaType, category);
    }
  }
});

// Gallery Preview: Send (TODO: implement picker)
$("#phone-overlay").on("click", ".preview-send", function () {
  const mediaId = $(this).data("media-id");
  // TODO: Open contact picker
  alert("Send to contact - TODO");
});
```

---

### Task 2.3: Preview Modal CSS

**Add to:** `assets/system/css/systems/phone-gallery.css`

```css
/* Preview Modal */
.gallery-preview-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-primary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-close {
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.preview-thumbnail {
  font-size: 6rem;
  opacity: 0.7;
}

.preview-details {
  padding: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-detail {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.preview-detail-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.preview-detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.preview-detail-value.high {
  color: #10b981;
}

.preview-detail-value.medium {
  color: #f59e0b;
}

.preview-detail-value.low {
  color: #ef4444;
}

.preview-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.preview-btn {
  flex: 1;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.preview-delete {
  border-color: #ef4444;
  color: #ef4444;
}

.preview-delete:hover {
  background: rgba(239, 68, 68, 0.15);
}
```

---

## 🎯 TODO: PHASE 3 - Messages Integration

### Task 3.1: Add "Send Photo" Button to Messages

**File:** `assets/system/js/ui/phone/phone-messages.js`

**Location:** In `getMessagesThreadHtml()` function, inside compose section

**Add after existing buttons:**

```javascript
// Add "Send Media" button if gallery has items
var sendMediaBtn = "";
if (vars.phoneGallery) {
  const photoCount = Object.values(vars.phoneGallery.photos).flat().length;
  const videoCount = Object.values(vars.phoneGallery.videos).flat().length;
  if (photoCount + videoCount > 0) {
    sendMediaBtn =
      '<button type="button" class="phone-topic-btn" id="phone-send-media-btn">Send Photo/Video</button>';
  }
}

// Add to composeButtons
var composeButtons = talkBtn + meetupBtn + whereBtn + sendMediaBtn;
```

---

### Task 3.2: Gallery Picker Modal

**Add to:** `assets/system/js/ui/phone/phone-gallery.js`

```javascript
/**
 * Open gallery picker for sending to contact
 * @param {string} charId - Character ID to send to
 */
window.openGalleryPicker = function (charId) {
  if (!PhoneAPI) return;
  const vars = PhoneAPI.State.variables;
  const gallery = vars.phoneGallery || { photos: {}, videos: {} };

  // Get all player-created items (exclude received)
  let items = [];

  ["normal", "cute", "hot", "spicy"].forEach((cat) => {
    (gallery.photos[cat] || []).forEach((item) => {
      items.push({ ...item, mediaType: "photo", category: cat });
    });
    (gallery.videos[cat] || []).forEach((item) => {
      items.push({ ...item, mediaType: "video", category: cat });
    });
  });

  // Sort by date (newest first)
  items.sort((a, b) => {
    const aTime =
      a.timestamp.day * 1440 + a.timestamp.hour * 60 + a.timestamp.minute;
    const bTime =
      b.timestamp.day * 1440 + b.timestamp.hour * 60 + b.timestamp.minute;
    return bTime - aTime;
  });

  // Build picker modal
  let modalHtml = '<div class="gallery-picker-modal">';

  // Header
  modalHtml += '<div class="picker-header">';
  modalHtml += '<span class="picker-title">Select Photo/Video</span>';
  modalHtml +=
    '<button class="picker-close" id="gallery-picker-close">×</button>';
  modalHtml += "</div>";

  // Grid
  modalHtml += '<div class="picker-grid">';

  if (items.length === 0) {
    modalHtml += '<div class="picker-empty">No media to send</div>';
  } else {
    items.forEach((item) => {
      const icon = item.mediaType === "photo" ? "📷" : "🎥";
      const qualityClass =
        item.quality >= 70 ? "high" : item.quality >= 40 ? "medium" : "low";

      modalHtml +=
        '<div class="picker-item" data-media-id="' +
        item.id +
        '" data-char-id="' +
        charId +
        '">';
      modalHtml += '<div class="picker-thumbnail">' + icon + "</div>";
      modalHtml +=
        '<div class="picker-quality ' +
        qualityClass +
        '">' +
        item.quality +
        "</div>";
      modalHtml += "</div>";
    });
  }

  modalHtml += "</div>";
  modalHtml += "</div>";

  // Append
  $("#phone-overlay").append(modalHtml);
};

/**
 * Close gallery picker
 */
window.closeGalleryPicker = function () {
  $(".gallery-picker-modal").remove();
};

/**
 * Send media to contact
 * @param {string} mediaId - Media ID
 * @param {string} charId - Character ID
 */
window.sendMediaToContact = function (mediaId, charId) {
  if (!PhoneAPI) return;
  const vars = PhoneAPI.State.variables;

  // Find media item
  let item = null;
  const gallery = vars.phoneGallery;

  for (const items of Object.values(gallery.photos)) {
    const found = items.find((i) => i.id === mediaId);
    if (found) {
      item = { ...found, type: "photo" };
      break;
    }
  }

  if (!item) {
    for (const items of Object.values(gallery.videos)) {
      const found = items.find((i) => i.id === mediaId);
      if (found) {
        item = { ...found, type: "video" };
        break;
      }
    }
  }

  if (!item) return;

  // Create message with media
  const messageText =
    "[" +
    (item.type === "photo" ? "📷 Photo" : "🎥 Video") +
    " - Quality: " +
    item.quality +
    "]";

  // Use existing pushPhoneMessage
  if (typeof pushPhoneMessage === "function") {
    pushPhoneMessage("player", charId, messageText, {
      mediaId: mediaId,
      mediaType: item.type,
    });
    persistPhoneChanges();

    // Close picker
    window.closeGalleryPicker();

    // Refresh thread
    phoneViewState.sub = "thread";
    $("#phone-app-view-title").text(getPhoneContactFullName(charId, vars));
    $("#phone-app-view-content").html(getMessagesThreadHtml(charId, vars));
    updatePhoneBadges();

    // Show notification
    if (typeof Engine !== "undefined" && Engine.wiki) {
      Engine.wiki("<<notify>>Media sent!<</notify>>");
    }
  }
};
```

---

### Task 3.3: Picker Event Handlers

**Add to:** `assets/system/js/ui/phone/index.js` → `createPhoneOverlay()`

```javascript
// Messages: Send Media button
$("#phone-overlay").on("click", "#phone-send-media-btn", function () {
  const charId = phoneViewState.threadCharId;
  if (charId && typeof window.openGalleryPicker === "function") {
    window.openGalleryPicker(charId);
  }
});

// Gallery Picker: Close
$("#phone-overlay").on("click", "#gallery-picker-close", function () {
  if (typeof window.closeGalleryPicker === "function") {
    window.closeGalleryPicker();
  }
});

// Gallery Picker: Item select
$("#phone-overlay").on("click", ".picker-item", function () {
  const mediaId = $(this).data("media-id");
  const charId = $(this).data("char-id");

  if (typeof window.sendMediaToContact === "function") {
    window.sendMediaToContact(mediaId, charId);
  }
});
```

---

### Task 3.4: Picker CSS

**Add to:** `assets/system/css/systems/phone-gallery.css`

```css
/* Gallery Picker Modal */
.gallery-picker-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-primary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.picker-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.picker-close {
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.picker-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  overflow-y: auto;
}

.picker-item {
  position: relative;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.picker-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.picker-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  opacity: 0.7;
}

.picker-quality {
  position: absolute;
  bottom: var(--spacing-xs);
  right: var(--spacing-xs);
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
}

.picker-quality.high {
  color: #10b981;
}

.picker-quality.medium {
  color: #f59e0b;
}

.picker-quality.low {
  color: #ef4444;
}

.picker-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}
```

---

## 🎯 TODO: PHASE 4 - Polish & Enhancements

### Task 4.1: Camera Flash Animation

**Add to:** `assets/system/js/ui/phone/phone-camera.js`

At the end of `phoneTakeSelfie()` and `phoneRecordVideo()`:

```javascript
// Flash effect
$("#phone-overlay").append('<div class="camera-flash"></div>');
setTimeout(() => {
  $(".camera-flash").remove();
}, 300);
```

**CSS:** `assets/system/css/systems/phone-camera.css`

```css
.camera-flash {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  animation: flash 0.3s ease-out;
}

@keyframes flash {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
```

---

### Task 4.2: Quality-Based Notifications

**Modify in:** `assets/system/js/ui/phone/phone-camera.js`

```javascript
// Replace notification in phoneTakeSelfie and phoneRecordVideo:
let notifType = "notify";
if (quality >= 70) {
  notifType = "notifySuccess"; // Green
} else if (quality < 40) {
  notifType = "notifyError"; // Red
}

const feedbackMsg = "Selfie taken! Quality: " + quality + "/100";
if (typeof Engine !== "undefined" && Engine.wiki) {
  Engine.wiki("<<" + notifType + ">>" + feedbackMsg + "<</" + notifType + ">>");
}
```

---

### Task 4.3: Location-Based Quality Boost

**Modify:** `calculateMediaQuality()` function

```javascript
function calculateMediaQuality(player, type, location) {
  // ... existing code ...

  // Location bonus
  const locationBonus = getLocationBonus(location);
  baseQuality += locationBonus;

  // ... rest of code ...
}

function getLocationBonus(location) {
  // Safe/private locations: no bonus
  const privateLocations = ["home", "bedroom", "bathroom"];
  if (privateLocations.includes(location)) {
    return 0;
  }

  // Semi-public: +5%
  const semiPublic = ["park", "cafe", "library"];
  if (semiPublic.includes(location)) {
    return 5;
  }

  // Public/risky: +10%
  const publicLocations = ["downtown", "mall", "club"];
  if (publicLocations.includes(location)) {
    return 10;
  }

  return 0;
}
```

**Also update function calls** to pass location:

```javascript
const quality = calculateMediaQuality(vars, type, location);
```

---

---

## 🎯 TODO: PHASE 5 - Talk & Interactions 💬

**Detailed planning moved to separate file due to complexity.**

👉 See: [PHONE_PHOTO_INTERACTIONS_ROADMAP.md](PHONE_PHOTO_INTERACTIONS_ROADMAP.md)

Includes:

- Photo Requests
- Handling Reactions & Stats
- Photo-Specific Topics (Unlocks)

---

## 📋 File Checklist

### Files to Create:

- [ ] `assets/system/css/systems/phone-gallery.css`

### Files to Modify:

- [x] `passages/0 - System/Init/variablesPhoneGallery.twee` (DONE)
- [x] `assets/system/js/ui/phone/phone-camera.js` (DONE)
- [ ] `assets/system/js/ui/phone/phone-gallery.js` (TODO: implement full gallery)
- [ ] `assets/system/js/ui/phone/index.js` (TODO: add gallery handlers)
- [ ] `assets/system/js/ui/phone/phone-messages.js` (TODO: add send media button)
- [x] `assets/system/css/systems/phone-camera.css` (DONE)
- [ ] `assets/system/config.js` (TODO: add phone-gallery.css)

---

## 🚀 Implementation Order

### Priority 1 (MUST HAVE):

1. Gallery UI display (Task 1.1-1.3)
2. Gallery filtering (Task 1.2)
3. Preview modal (Task 2.1-2.3)

### Priority 2 (SHOULD HAVE):

4. Send to messages (Task 3.1-3.4)
5. Delete functionality (included in Task 2.1)

### Priority 3 (NICE TO HAVE):

6. Camera flash animation (Task 4.1)
7. Quality-based notifications (Task 4.2)
8. Location bonuses (Task 4.3)

---

## 🔍 Testing Checklist

### Camera:

- [ ] Open phone → Camera app
- [ ] Click Normal Selfie → Notification shown
- [ ] Check console: `SugarCube.State.variables.phoneGallery.photos.normal` has item
- [ ] Check quality calculation (should be 40-100 range)
- [ ] Test locked buttons (should show tooltip)

### Gallery:

- [ ] Open phone → Gallery app
- [ ] See taken selfie in grid
- [ ] Click tab filters (All/Selfies/Videos)
- [ ] Empty state shows when no media

### Preview:

- [ ] Click gallery item → Preview opens
- [ ] See quality/date/location details
- [ ] Delete button works
- [ ] Close button works

### Messages Integration:

- [ ] Open messages → "Send Photo/Video" button appears
- [ ] Click button → Gallery picker opens
- [ ] Select photo → Sent to contact
- [ ] Message thread shows media indicator

---

## 💡 Known Issues & Future Work

### Current Limitations:

- No actual image display (just emoji placeholders)
- No character replies to sent media
- No reputation/relationship impacts
- No storage limits

### Future Enhancements:

- Character reactions to media (tier-based responses)
- Reputation changes based on media type/quality
- Gallery size limit (50 items max?)
- Auto-delete old low-quality items
- Media unlocks (new types based on stats/story)
- Social media posting (Fotogram integration)

---

## 📝 Notes for Next AI

### Important Context:

1. **SugarCube Variables:** Stats are in `State.variables` directly (e.g., `$beauty`, `$lust`), not nested in `player.stats`
2. **Phone System:** Uses global `PhoneAPI` and `phoneViewState` for state management
3. **Event Delegation:** All phone events use `$('#phone-overlay').on()` delegation
4. **Persistence:** Must call `persistPhoneChanges()` after modifying phone state
5. **Init Tag:** Variable passages MUST have `[init]` tag to load before game

### Code Patterns:

```javascript
// Access stats
const beauty = vars.beauty || 0;

// Phone state
phoneViewState.galleryFilter = 'all';

// Persist
persistPhoneChanges();

// Notifications
Engine.wiki('<<notify>>Message<</notify>>');

// Event delegation
$('#phone-overlay').on('click', '#button-id', function () { ... });
```

### Testing:

Always test with **NEW GAME** after adding `[init]` passages. Old saves won't have new variables!

---

**Last Updated:** 2026-02-14  
**Status:** Camera complete, Gallery UI pending  
**Next Task:** Implement gallery render function (Task 1.1)
