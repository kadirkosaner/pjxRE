/* ==========================================
   PHONE CAMERA MODULE - NEW FEATURE
   Camera app for taking selfies/videos
========================================== */

/** Default Exhibitionism needed to use camera in "forbidden" locations (per-location override via navCards[].cameraExhibitionismMin) */
var CAMERA_FORBIDDEN_EXHIBITIONISM_DEFAULT = 50;

/**
 * Get effective camera location: "safe" | "public" | "forbidden" | "never".
 * - never: camera never allowed (no override).
 * - forbidden: not allowed unless exhibitionism >= cameraExhibitionismMin, then "public".
 * @param {string} locationId - Current $location
 * @param {object} vars - State.variables (need exhibitionism)
 * @returns {{ effective: string, isBlocked: boolean, isNever: boolean, requiredExhibitionism: number }}
 */
function getEffectiveCameraLocation(locationId, vars) {
    var navCards = (typeof PhoneAPI !== 'undefined' && PhoneAPI.setup && PhoneAPI.setup.navCards) ? PhoneAPI.setup.navCards : (typeof setup !== 'undefined' && setup.navCards ? setup.navCards : null);
    var nav = navCards && locationId ? navCards[locationId] : null;
    var loc = nav && nav.cameraLoc ? nav.cameraLoc : 'public';
    var exhibitionism = (vars && vars.exhibitionism) || 0;
    var required = (nav && nav.cameraExhibitionismMin != null) ? nav.cameraExhibitionismMin : CAMERA_FORBIDDEN_EXHIBITIONISM_DEFAULT;

    if (loc === 'never') {
        return { effective: 'never', isBlocked: true, isNever: true, requiredExhibitionism: 0 };
    }
    if (loc === 'forbidden') {
        if (exhibitionism >= required) {
            return { effective: 'public', isBlocked: false, isNever: false, requiredExhibitionism: required };
        }
        return { effective: 'forbidden', isBlocked: true, isNever: false, requiredExhibitionism: required };
    }
    return { effective: loc, isBlocked: false, isNever: false, requiredExhibitionism: 0 };
}

/**
 * Check if Hot/Spicy can be taken (corruption + location). Assumes location is not blocked (forbidden/never).
 * @param {string} type - 'hot' or 'spicy'
 * @param {object} vars - State.variables
 * @returns {boolean}
 */
function canTakeHotSpicyByCorruption(type, vars) {
    var locInfo = getEffectiveCameraLocation((vars && vars.location) || '', vars);
    if (locInfo.isBlocked) return false;
    var corruption = (vars && vars.corruption != null) ? parseInt(vars.corruption, 10) : 0;
    var isSafe = locInfo.effective === 'safe';
    if (type === 'hot') return (isSafe && corruption >= 2) || (!isSafe && corruption >= 3);
    if (type === 'spicy') return (isSafe && corruption >= 4) || (!isSafe && corruption >= 5);
    return false;
}

/**
 * Render camera app UI
 * @param {object} vars - State.variables
 * @param {object} [opts] - optional: { locationId: string } from phone index (uses PhoneAPI.State)
 * @returns {string} HTML content
 */
function phoneRenderCameraApp(vars, opts) {
    var locationId = (opts && opts.locationId != null && opts.locationId !== '') ? opts.locationId
        : (function () {
            var raw = (vars && vars.location) || (typeof PhoneAPI !== 'undefined' && PhoneAPI.State && (PhoneAPI.State.variables && PhoneAPI.State.variables.location || PhoneAPI.State.passage)) || (typeof State !== 'undefined' && State.passage) || '';
            return (raw.indexOf('/') >= 0 || raw.indexOf('\\') >= 0) ? raw.split(/[/\\]/).pop() : raw;
        })();
    var locInfo = getEffectiveCameraLocation(locationId, vars);
    // Unlock by corruption + location. Normal/Cute not affected by forbidden/never.
    var corruption = (vars && vars.corruption != null) ? parseInt(vars.corruption, 10) : 0;
    var isSafe = locInfo.effective === 'safe';
    var dataLocAttrs = ' data-camera-location-id="' + (locationId || '').replace(/"/g, '&quot;') + '" data-camera-loc="' + (locInfo.effective || '').replace(/"/g, '&quot;') + '"';
    var hotSpicyAllowedByLocation = !locInfo.isBlocked;

    // Cute: Corruption 1+ (anywhere)
    var canCute = corruption >= 1;
    // Hot: Safe = Corruption 2+, Public = Corruption 3+ (and location not forbidden/never)
    var canHot = hotSpicyAllowedByLocation && ((isSafe && corruption >= 2) || (!isSafe && corruption >= 3));
    // Spicy: Safe = Corruption 4+, Public = Corruption 5+ (and location not forbidden/never)
    var canSpicy = hotSpicyAllowedByLocation && ((isSafe && corruption >= 4) || (!isSafe && corruption >= 5));

    // Tooltips when locked: location check in order → safe, public, forbidden, never
    var cuteTooltip = "Requires Corruption Level 1";
    var hotTooltip, spicyTooltip;
    if (isSafe) {
        hotTooltip = corruption >= 2 ? "" : "Requires Corruption Level 2";
        spicyTooltip = corruption >= 4 ? "" : "Requires Corruption Level 4";
    } else if (locInfo.effective === "public") {
        hotTooltip = corruption >= 3 ? "" : "Requires Corruption Level 3";
        spicyTooltip = corruption >= 5 ? "" : "Requires Corruption Level 5";
    } else if (locInfo.isBlocked && !locInfo.isNever) {
        // forbidden
        hotTooltip = "Requires Exhibitionism " + locInfo.requiredExhibitionism + "+";
        spicyTooltip = hotTooltip;
    } else {
        // never
        hotTooltip = "Not allowed here.";
        spicyTooltip = "Not allowed here.";
    }

    // SELFIE SECTION (data attrs for debug: inspect element to see locationId and effective loc)
    let selfieHtml = '<div class="phone-camera-section"' + dataLocAttrs + '>';
    selfieHtml += '<div class="phone-camera-section-title">Selfies</div>';
    selfieHtml += '<div class="phone-thread-actions">';
    
    // Normal - always available
    selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-normal">Normal</button>';
    
    // Cute - Corruption 1+
    if (canCute) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-cute">Cute</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + cuteTooltip.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    }
    
    // Hot - Corruption 2 safe / 3 public + location allowed
    if (canHot) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-hot">Hot</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (hotTooltip || "Requires Corruption Level 2").replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    }
    
    // Spicy - Corruption 4 safe / 5 public + location allowed
    if (canSpicy) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-spicy">Spicy</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (spicyTooltip || "Requires Corruption Level 4").replace(/"/g, '&quot;') + '" disabled>Spicy</button>';
    }
    
    selfieHtml += '</div></div>';
    
    // VIDEO SECTION
    let videoHtml = '<div class="phone-camera-section">';
    videoHtml += '<div class="phone-camera-section-title">Videos</div>';
    videoHtml += '<div class="phone-thread-actions">';
    
    // Normal - always available
    videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-normal">Normal</button>';
    
    // Cute - Corruption 1+
    if (canCute) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-cute">Cute</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + cuteTooltip.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    }
    
    // Hot - Corruption 2 safe / 3 public + location allowed
    if (canHot) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-hot">Hot</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (hotTooltip || "Requires Corruption Level 2").replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    }
    
    // Spicy - Corruption 4 safe / 5 public + location allowed
    if (canSpicy) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-spicy">Spicy</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (spicyTooltip || "Requires Corruption Level 4").replace(/"/g, '&quot;') + '" disabled>Spicy</button>';
    }
    
    videoHtml += '</div></div>';
    
    return '<div class="phone-messages-thread">' +
        selfieHtml +
        videoHtml +
        '</div>';
};

/**
 * Calculate media quality from stats only (no base): Beauty + Looks + Confidence; Hot/Spicy add Exhibitionism.
 * Weights sum to 1 so max score ≈ 100 when all stats 100.
 * @param {object} vars - State.variables (beauty, looks, confidence, exhibitionism)
 * @param {string} type - 'normal', 'cute', 'hot', 'spicy'
 * @returns {number} Quality score 1-100
 */
function calculateMediaQuality(vars, type) {
    var beauty = (vars && vars.beauty) || 0;
    var looks = (vars && vars.looks) || 0;
    var confidence = (vars && vars.confidence) || 0;
    var exhibitionism = (vars && vars.exhibitionism) || 0;
    
    var score = 0;
    switch (type) {
        case 'normal':
            score = (beauty * 0.40) + (looks * 0.40) + (confidence * 0.20);
            break;
        case 'cute':
            score = (beauty * 0.40) + (looks * 0.40) + (confidence * 0.20);
            break;
        case 'hot':
            score = (beauty * 0.35) + (looks * 0.30) + (confidence * 0.15) + (exhibitionism * 0.20);
            break;
        case 'spicy':
            score = (beauty * 0.30) + (looks * 0.25) + (confidence * 0.15) + (exhibitionism * 0.30);
            break;
        default:
            score = (beauty * 0.35) + (looks * 0.35) + (confidence * 0.20);
    }
    
    var variation = (Math.random() - 0.5) * 20;
    score += variation;
    
    return Math.max(1, Math.min(100, Math.round(score)));
}

/**
 * Generate unique media ID
 * @returns {string} Unique ID
 */
function generateMediaId() {
    return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get flags array for a taken photo/video by type and location.
 * @param {string} type - 'normal', 'cute', 'hot', 'spicy'
 * @param {string} locationId - Current location ID (e.g. fhBedroom, sunsetPark)
 * @param {boolean} isSafe - Whether location is safe (e.g. only fhBedroom)
 * @returns {string[]} Flags array
 */
function getMediaFlagsForType(type, locationId, isSafe) {
    var flags = [];
    switch (type) {
        case 'normal':
            flags = ['casual', 'clothed'];
            break;
        case 'cute':
            flags = ['cute', 'clothed'];
            break;
        case 'hot':
            flags = ['sexy'];
            if (isSafe) {
                flags.push('lingerie', 'bedroom');
            } else {
                flags.push('public', 'risky');
                if (locationId) flags.push('special{public_' + locationId + '}');
            }
            break;
        case 'spicy':
            flags = ['nude', 'explicit'];
            if (isSafe) {
                flags.push('spread', 'bedroom');
            } else {
                flags.push('public', 'risky');
                if (locationId) flags.push('special{public_' + locationId + '}');
            }
            break;
        default:
            flags = ['casual', 'clothed'];
    }
    return flags;
}

/**
 * Get pool from setup.phoneMediaPools (Twee). Each item: { path, tags? }.
 * @param {string} mediaKind - 'photos' | 'videos'
 * @param {string} type - 'normal' | 'cute' | 'hot' | 'spicy'
 * @param {boolean} isSafe - safe location (bedroom) vs public
 * @param {object} vars - State.variables (for optional stat-based variant later)
 * @param {string[]} [contextTags] - optional; only items with at least one of these tags (empty = use all)
 * @returns {string} path or ''
 */
function getMediaPathFromPool(mediaKind, type, isSafe, vars, contextTags) {
    // Try PhoneAPI.setup first, then fallback to global setup
    var pools = null;
    if (typeof PhoneAPI !== 'undefined' && PhoneAPI.setup && PhoneAPI.setup.phoneMediaPools) {
        pools = PhoneAPI.setup.phoneMediaPools;
    } else if (typeof setup !== 'undefined' && setup.phoneMediaPools) {
        pools = setup.phoneMediaPools;
    }
    
    if (!pools || !pools[mediaKind] || !pools[mediaKind][type]) {
        console.warn('[CAMERA] No media pool found for', mediaKind, type, '- PhoneAPI.setup:', typeof PhoneAPI !== 'undefined' && PhoneAPI.setup ? 'exists' : 'missing');
        return '';
    }
    
    var slot = isSafe ? 'safe' : 'public';
    var list = pools[mediaKind][type][slot];
    if (!Array.isArray(list) || list.length === 0) return '';
    var candidates = list;
    if (contextTags && contextTags.length > 0) {
        candidates = list.filter(function (item) {
            var t = item.tags;
            return Array.isArray(t) && contextTags.some(function (tag) { return t.indexOf(tag) >= 0; });
        });
        if (candidates.length === 0) candidates = list;
    }
    var idx = Math.floor(Math.random() * candidates.length);
    var chosen = candidates[idx];
    return (chosen && chosen.path) ? chosen.path : '';
}

/**
 * Resolve asset path to full URL relative to current document (fixes loading when HTML is in subfolder or Twine Play).
 * @param {string} path - e.g. "assets/content/phone/camera/normal_safe_1.jpg"
 * @returns {string}
 */
function getPhoneAssetUrl(path) {
    if (!path || typeof path !== 'string') return '';
    path = path.trim();
    if (path.indexOf('http') === 0 || path.indexOf('data:') === 0) return path;
    try {
        var base = (typeof document !== 'undefined' && document.location && document.location.href) ? document.location.href : '';
        var lastSlash = base.lastIndexOf('/');
        var baseDir = lastSlash >= 0 ? base.substring(0, lastSlash + 1) : '';
        return baseDir + path.replace(/^\//, '');
    } catch (e) { return path; }
}

/**
 * Show full-screen preview after capturing a selfie. Uses main app header (Back + title).
 * Back button closes preview and returns to camera.
 * @param {object} photo - { path, quality }
 */
function phoneShowCapturePreview(photo) {
    var $view = typeof $ !== 'undefined' && $('#phone-app-view').length ? $('#phone-app-view') : null;
    if (!$view || !photo) return;
    var path = (photo.path && String(photo.path).trim()) ? photo.path : '';
    var quality = (photo.quality != null) ? Number(photo.quality) : 0;
    var qualityText = 'Quality: ' + quality + '/100';
    var imgHtml;
    if (path) {
        var imgSrc = getPhoneAssetUrl(path);
        var safeSrc = (imgSrc || path).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        imgHtml = '<img class="phone-camera-preview-img" src="' + safeSrc + '" alt="Selfie" onerror="this.onerror=null;this.style.display=\'none\';var p=document.createElement(\'div\');p.className=\'phone-camera-preview-placeholder\';p.textContent=\'No image\';this.parentNode.appendChild(p);">';
    } else {
        imgHtml = '<div class="phone-camera-preview-placeholder">No image</div>';
    }
    var html = '<div class="phone-camera-preview-overlay">' +
        '<div class="phone-camera-preview-media">' + imgHtml + '</div>' +
        '<div class="phone-camera-preview-score">' + qualityText + '</div>' +
        '</div>';
    $view.find('.phone-camera-preview-overlay').remove();
    $view.append(html);
    if (typeof $ !== 'undefined' && $('#phone-app-view-title').length) {
        $('#phone-app-view-title').text('Photo');
    }
}

/**
 * Take a selfie and add to gallery
 * @param {string} type - 'normal', 'cute', 'hot', 'spicy'
 */
window.phoneTakeSelfie = function(type) {
    if (!PhoneAPI) return;
    const vars = PhoneAPI.State.variables;
    // Cute requires Corruption 1+
    if (type === 'cute') {
        var corruptionCute = (vars && vars.corruption != null) ? parseInt(vars.corruption, 10) : 0;
        if (corruptionCute < 1) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>Requires Corruption Level 1.<</notify>>');
            }
            return;
        }
    }
    // Forbidden/never only block Hot and Spicy
    if (type === 'hot' || type === 'spicy') {
        var locInfo = getEffectiveCameraLocation(vars.location || '', vars);
        if (locInfo.isBlocked) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>' + (locInfo.isNever ? "You can't take Hot/Spicy photos here." : "Too self-conscious for Hot/Spicy here.") + '<</notify>>');
            }
            return;
        }
        if (!canTakeHotSpicyByCorruption(type, vars)) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>You don\'t meet the requirements for this here.<</notify>>');
            }
            return;
        }
    }
    const timeSys = vars.timeSys || {};
    const location = vars.location || 'unknown';
    var locInfo = getEffectiveCameraLocation(location, vars);
    var isSafe = locInfo.effective === 'safe';
    var locationId = (location && (location.indexOf('/') >= 0 || location.indexOf('\\') >= 0)) ? location.split(/[/\\]/).pop() : (location || '');
    
    const quality = calculateMediaQuality(vars, type);
    var flags = getMediaFlagsForType(type, location, isSafe);
    var contextTags = locationId ? [locationId] : [];
    var path = getMediaPathFromPool('photos', type, isSafe, vars, contextTags) || '';
    
    const photo = {
        id: generateMediaId(),
        path: path,
        flags: flags,
        timestamp: {
            day: timeSys.day,
            month: timeSys.month,
            year: timeSys.year,
            hour: timeSys.hour,
            minute: timeSys.minute
        },
        quality: quality,
        from: 'player'
    };

    var list = vars.phoneGallery.photos[type];
    if (!Array.isArray(list)) list = vars.phoneGallery.photos[type] = [];
    var samePathIndex = -1;
    if (path) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].path === path) { samePathIndex = i; break; }
        }
    }
    if (samePathIndex >= 0) {
        var existing = list[samePathIndex];
        if (quality > (existing.quality || 0)) {
            list[samePathIndex] = photo;
            persistPhoneChanges();
            phoneShowCapturePreview(photo);
            if (typeof window.notifySuccess === 'function') {
                window.notifySuccess('You take best quality photo!');
            }
            return photo;
        }
        phoneShowCapturePreview(photo);
        if (typeof window.notifyWarning === 'function') {
            window.notifyWarning('You already have a better version of this photo.');
        }
        return photo;
    }

    list.push(photo);
    persistPhoneChanges();
    phoneShowCapturePreview(photo);
    return photo;
};

/**
 * Record a video and add to gallery
 * @param {string} type - 'normal', 'cute', 'hot', 'spicy'
 */
window.phoneRecordVideo = function(type) {
    if (!PhoneAPI) return;
    const vars = PhoneAPI.State.variables;
    // Cute requires Corruption 1+
    if (type === 'cute') {
        var corruptionCute = (vars && vars.corruption != null) ? parseInt(vars.corruption, 10) : 0;
        if (corruptionCute < 1) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>Requires Corruption Level 1.<</notify>>');
            }
            return;
        }
    }
    // Forbidden/never only block Hot and Spicy; Normal and Cute always allowed
    if (type === 'hot' || type === 'spicy') {
        var locInfo = getEffectiveCameraLocation(vars.location || '', vars);
        if (locInfo.isBlocked) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>' + (locInfo.isNever ? "You can't take Hot/Spicy videos here." : "Too self-conscious for Hot/Spicy here.") + '<</notify>>');
            }
            return;
        }
        if (!canTakeHotSpicyByCorruption(type, vars)) {
            if (typeof Engine !== 'undefined' && Engine.wiki) {
                Engine.wiki('<<notify>>You don\'t meet the requirements for this here.<</notify>>');
            }
            return;
        }
    }
    const timeSys = vars.timeSys || {};
    const location = vars.location || 'unknown';
    var locInfo = getEffectiveCameraLocation(location, vars);
    var isSafe = locInfo.effective === 'safe';
    var locationId = (location && (location.indexOf('/') >= 0 || location.indexOf('\\') >= 0)) ? location.split(/[/\\]/).pop() : (location || '');

    const quality = calculateMediaQuality(vars, type);
    var flags = getMediaFlagsForType(type, location, isSafe);
    var contextTags = locationId ? [locationId] : [];
    var path = getMediaPathFromPool('videos', type, isSafe, vars, contextTags) || '';
    const video = {
        id: generateMediaId(),
        path: path,
        flags: flags,
        timestamp: {
            day: timeSys.day,
            month: timeSys.month,
            year: timeSys.year,
            hour: timeSys.hour,
            minute: timeSys.minute
        },
        quality: quality,
        from: 'player'
    };
    
    vars.phoneGallery.videos[type].push(video);
    
    // Persist changes
    persistPhoneChanges();
    
    // Show feedback
    const feedbackMsg = 'Video recorded! Quality: ' + quality + '/100';
    if (typeof Engine !== 'undefined' && Engine.wiki) {
        Engine.wiki('<<notify>>' + feedbackMsg + '<</notify>>');
    }
    
    return video;
};

/**
 * Add a photo or video to the gallery from a passage (e.g. story reward, received from character).
 * Called by <<GalleryAdd>> widget or from JS.
 * @param {string} path - Image or video path (e.g. "assets/content/phone/special/quest_photo.webp")
 * @param {object} [opts] - { kind: 'photos'|'videos', category: 'normal'|'cute'|'hot'|'spicy'|'received', quality: number, from: 'player'|charId, flags: string[] }
 * @returns {object|null} Added item or null
 */
window.phoneGalleryAddItem = function (path, opts) {
    if (!path || typeof path !== 'string') return null;
    path = path.trim();
    var vars = (typeof State !== 'undefined' && State.variables) ? State.variables : (typeof window.PhoneAPI !== 'undefined' && window.PhoneAPI.State && window.PhoneAPI.State.variables) ? window.PhoneAPI.State.variables : null;
    if (!vars || !vars.phoneGallery) return null;
    opts = opts || {};
    var kind = (opts.kind === 'videos') ? 'videos' : 'photos';
    var category = opts.category || 'received';
    if (['normal', 'cute', 'hot', 'spicy', 'received'].indexOf(category) < 0) category = 'received';
    var quality = (opts.quality != null && opts.quality >= 0 && opts.quality <= 100) ? parseInt(opts.quality, 10) : 50;
    var from = (opts.from != null && opts.from !== '') ? opts.from : 'player';
    var flags = Array.isArray(opts.flags) ? opts.flags : ['special'];
    var list = vars.phoneGallery[kind][category];
    if (!list) vars.phoneGallery[kind][category] = list = [];
    if (category === 'received') {
        var exists = list.some(function (el) { return el.path === path; });
        if (exists) return null;
    }
    var timeSys = vars.timeSys || {};
    var item = {
        id: generateMediaId(),
        path: path,
        flags: flags,
        timestamp: { day: timeSys.day, month: timeSys.month, year: timeSys.year, hour: timeSys.hour, minute: timeSys.minute },
        quality: quality,
        from: from
    };
    list.push(item);
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    return item;
};

window.phoneRenderCameraApp = phoneRenderCameraApp;
window.getPhoneAssetUrl = getPhoneAssetUrl;
window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.camera = { render: phoneRenderCameraApp };
