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

function getPhoneCameraDailyConfig() {
    var enabled = (typeof setup !== 'undefined' && setup.phoneCameraDailyEnabled !== undefined) ? !!setup.phoneCameraDailyEnabled : true;
    var photoLimit = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.phoneCameraDailyPhotoLimit))) ? Number(setup.phoneCameraDailyPhotoLimit) : 1;
    var videoLimit = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.phoneCameraDailyVideoLimit))) ? Number(setup.phoneCameraDailyVideoLimit) : 1;
    return {
        enabled: enabled,
        photoLimit: Math.max(0, Math.floor(photoLimit)),
        videoLimit: Math.max(0, Math.floor(videoLimit))
    };
}

function getPhoneCameraDateKey(vars) {
    var ts = (vars && vars.timeSys) ? vars.timeSys : {};
    return (Number(ts.year) || 0) * 10000 + (Number(ts.month) || 0) * 100 + (Number(ts.day) || 0);
}

function ensurePhoneCameraDailyState(vars) {
    if (!vars.phoneCameraDaily || typeof vars.phoneCameraDaily !== 'object') {
        vars.phoneCameraDaily = { dateKey: 0, photosTaken: 0, videosTaken: 0 };
    }
    var key = getPhoneCameraDateKey(vars);
    if ((Number(vars.phoneCameraDaily.dateKey) || 0) !== key) {
        vars.phoneCameraDaily.dateKey = key;
        vars.phoneCameraDaily.photosTaken = 0;
        vars.phoneCameraDaily.videosTaken = 0;
    }
    return vars.phoneCameraDaily;
}

function isPhoneCameraDailyBypassed(vars) {
    return !!((vars && vars.phoneCameraDailyBypass === true) || (typeof setup !== 'undefined' && setup.phoneCameraDailyBypass === true));
}

function canUsePhoneCameraToday(vars, kind) {
    var cfg = getPhoneCameraDailyConfig();
    if (!cfg.enabled || isPhoneCameraDailyBypassed(vars)) return { ok: true, reason: '' };
    var daily = ensurePhoneCameraDailyState(vars);
    var isVideo = kind === 'video';
    var current = isVideo ? (Number(daily.videosTaken) || 0) : (Number(daily.photosTaken) || 0);
    var limit = isVideo ? cfg.videoLimit : cfg.photoLimit;
    if (limit <= 0) return { ok: false, reason: 'Camera disabled for this media today.' };
    if (current >= limit) {
        return { ok: false, reason: isVideo ? 'You already recorded video today.' : 'You already took photo today.' };
    }
    return { ok: true, reason: '' };
}

function markPhoneCameraUsed(vars, kind) {
    var cfg = getPhoneCameraDailyConfig();
    if (!cfg.enabled || isPhoneCameraDailyBypassed(vars)) return;
    var daily = ensurePhoneCameraDailyState(vars);
    if (kind === 'video') daily.videosTaken = (Number(daily.videosTaken) || 0) + 1;
    else daily.photosTaken = (Number(daily.photosTaken) || 0) + 1;
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
    var selfieDailyGate = canUsePhoneCameraToday(vars, 'photo');
    var videoDailyGate = canUsePhoneCameraToday(vars, 'video');

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
    if (selfieDailyGate.ok) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-normal">Normal</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + selfieDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Normal</button>';
    }
    
    // Cute - Corruption 1+
    if (selfieDailyGate.ok && canCute) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-cute">Cute</button>';
    } else if (!selfieDailyGate.ok) {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + selfieDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + cuteTooltip.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    }
    
    // Hot - Corruption 2 safe / 3 public + location allowed
    if (selfieDailyGate.ok && canHot) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-hot">Hot</button>';
    } else if (!selfieDailyGate.ok) {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + selfieDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (hotTooltip || "Requires Corruption Level 2").replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    }
    
    // Spicy - Corruption 4 safe / 5 public + location allowed
    if (selfieDailyGate.ok && canSpicy) {
        selfieHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-spicy">Spicy</button>';
    } else if (!selfieDailyGate.ok) {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + selfieDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Spicy</button>';
    } else {
        selfieHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (spicyTooltip || "Requires Corruption Level 4").replace(/"/g, '&quot;') + '" disabled>Spicy</button>';
    }
    
    selfieHtml += '</div></div>';
    
    // VIDEO SECTION
    let videoHtml = '<div class="phone-camera-section">';
    videoHtml += '<div class="phone-camera-section-title">Videos</div>';
    videoHtml += '<div class="phone-thread-actions">';
    
    // Normal - always available
    if (videoDailyGate.ok) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-normal">Normal</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + videoDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Normal</button>';
    }
    
    // Cute - Corruption 1+
    if (videoDailyGate.ok && canCute) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-cute">Cute</button>';
    } else if (!videoDailyGate.ok) {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + videoDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + cuteTooltip.replace(/"/g, '&quot;') + '" disabled>Cute</button>';
    }
    
    // Hot - Corruption 2 safe / 3 public + location allowed
    if (videoDailyGate.ok && canHot) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-hot">Hot</button>';
    } else if (!videoDailyGate.ok) {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + videoDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    } else {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + (hotTooltip || "Requires Corruption Level 2").replace(/"/g, '&quot;') + '" disabled>Hot</button>';
    }
    
    // Spicy - Corruption 4 safe / 5 public + location allowed
    if (videoDailyGate.ok && canSpicy) {
        videoHtml += '<button type="button" class="phone-topic-btn" id="phone-camera-video-spicy">Spicy</button>';
    } else if (!videoDailyGate.ok) {
        videoHtml += '<button type="button" class="phone-topic-btn btn-locked" data-tooltip="' + videoDailyGate.reason.replace(/"/g, '&quot;') + '" disabled>Spicy</button>';
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
 * Check if player meets conditions for a media pool entry.
 * conditions: { fitness?: number, outfitStyle?: string, outfitMinItems?: number, location?: string|string[] }
 * @param {object} item - Pool entry { path, tags?, flags?, conditions? }
 * @param {object} vars - State.variables
 * @returns {boolean}
 */
function meetsMediaConditions(item, vars) {
    var cond = item && item.conditions;
    if (!cond || typeof cond !== 'object') return true;

    if (cond.fitness != null) {
        var fitness = (vars && vars.fitness != null) ? Number(vars.fitness) : 0;
        if (fitness < Number(cond.fitness)) return false;
    }

    if (cond.outfitStyle) {
        var style = String(cond.outfitStyle);
        var minItems = (cond.outfitMinItems != null) ? Number(cond.outfitMinItems) : 1;
        var styleCount = 0;
        var wardrobe = (vars && vars.wardrobe && vars.wardrobe.equipped) ? vars.wardrobe.equipped : {};
        var getClothing = (typeof setup !== 'undefined' && setup.getClothingById) ? setup.getClothingById : (typeof PhoneAPI !== 'undefined' && PhoneAPI.setup && PhoneAPI.setup.getClothingById) ? PhoneAPI.setup.getClothingById : null;
        if (getClothing) {
            var slots = ['top', 'bottom', 'dress', 'shoes', 'bra', 'underwear', 'socks'];
            for (var i = 0; i < slots.length; i++) {
                var slotId = wardrobe[slots[i]];
                if (!slotId) continue;
                var clothing = getClothing(slotId);
                if (clothing && Array.isArray(clothing.tags) && clothing.tags.indexOf(style) >= 0) {
                    styleCount++;
                }
            }
        }
        if (styleCount < minItems) return false;
    }

    if (cond.location != null) {
        var loc = (vars && vars.location) ? String(vars.location) : '';
        var locId = loc.indexOf('/') >= 0 || loc.indexOf('\\') >= 0 ? loc.split(/[/\\]/).pop() : loc;
        var required = Array.isArray(cond.location) ? cond.location : [cond.location];
        var match = false;
        for (var j = 0; j < required.length; j++) {
            if (locId === String(required[j]) || loc.indexOf(String(required[j])) >= 0) {
                match = true;
                break;
            }
        }
        if (!match) return false;
    }

    return true;
}

/**
 * Get pool from setup.phoneMediaPools (Twee). Each item: { path, tags?, conditions? }.
 * conditions: { fitness?: number, outfitStyle?: string, outfitMinItems?: number, location?: string|string[] }
 * @param {string} mediaKind - 'photos' | 'videos'
 * @param {string} type - 'normal' | 'cute' | 'hot' | 'spicy'
 * @param {boolean} isSafe - safe location (bedroom) vs public
 * @param {object} vars - State.variables (for stat/outfit/location checks)
 * @param {string[]} [contextTags] - optional; only items with at least one of these tags (empty = use all)
 * @param {number} [targetQuality] - candidate priority check against existing gallery quality
 * @returns {string} path or ''
 */
function getMediaPathFromPool(mediaKind, type, isSafe, vars, contextTags, targetQuality) {
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
    var conditioned = candidates.filter(function (item) { return meetsMediaConditions(item, vars || {}); });
    if (conditioned.length > 0) candidates = conditioned;
    var chosenPool = candidates;
    var qualityNum = Number(targetQuality);
    if (!isNaN(qualityNum) && vars && vars.phoneGallery && vars.phoneGallery[mediaKind] && Array.isArray(vars.phoneGallery[mediaKind][type])) {
        var existingList = vars.phoneGallery[mediaKind][type];
        var preferred = candidates.filter(function (entry) {
            if (!entry || !entry.path) return false;
            var bestExisting = -1;
            for (var ei = 0; ei < existingList.length; ei++) {
                var ex = existingList[ei];
                if (!ex || !ex.path) continue;
                if (String(ex.path).trim() !== String(entry.path).trim()) continue;
                var exQ = (ex.quality != null) ? Number(ex.quality) : 0;
                if (exQ > bestExisting) bestExisting = exQ;
            }
            return bestExisting < qualityNum;
        });
        if (preferred.length > 0) {
            // 3/1 ratio: 75% prefer candidate pool, 25% full pool random
            chosenPool = (Math.random() < 0.75) ? preferred : candidates;
        }
    }
    var idx = Math.floor(Math.random() * chosenPool.length);
    var chosen = chosenPool[idx];
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
 * Show full-screen preview after capturing media. Uses main app header (Back + title).
 * Back button closes preview and returns to camera.
 * @param {object} media - { path, quality, mediaKind? }
 */
function phoneShowCapturePreview(media) {
    var $view = typeof $ !== 'undefined' && $('#phone-app-view').length ? $('#phone-app-view') : null;
    if (!$view || !media) return;
    var stateVars = (typeof State !== 'undefined' && State.variables) ? State.variables : null;
    var path = (media.path && String(media.path).trim()) ? media.path : '';
    var quality = (media.quality != null) ? Number(media.quality) : 0;
    var qualityText = 'Quality: ' + quality + '/100';
    var isVideo = (media.mediaKind === 'video') || (/\.mp4$/i.test(path) || /\.webm$/i.test(path));
    var mediaHtml;
    if (path) {
        var src = getPhoneAssetUrl(path);
        var safeSrc = (src || path).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        if (isVideo) {
            var autoplaySet = !!(stateVars && stateVars.videoSettings && stateVars.videoSettings.autoplaySet !== undefined ? stateVars.videoSettings.autoplaySet : true);
            var loopSet = !!(stateVars && stateVars.videoSettings && stateVars.videoSettings.loopSet !== undefined ? stateVars.videoSettings.loopSet : true);
            mediaHtml = '<div class="video-container phone-camera-video-container" data-autoplay="' + (autoplaySet ? '1' : '0') + '" data-loop="' + (loopSet ? '1' : '0') + '">' +
                '<video class="phone-camera-preview-img" src="' + safeSrc + '" playsinline></video>' +
                '<div class="play-overlay"><div class="video-play-btn"><span class="icon icon-play"></span></div></div>' +
                '</div>';
        } else {
            mediaHtml = '<img class="phone-camera-preview-img" src="' + safeSrc + '" alt="Selfie" onerror="this.onerror=null;this.style.display=\'none\';var p=document.createElement(\'div\');p.className=\'phone-camera-preview-placeholder\';p.textContent=\'No image\';this.parentNode.appendChild(p);">';
        }
    } else {
        mediaHtml = '<div class="phone-camera-preview-placeholder">No ' + (isVideo ? 'video' : 'image') + '</div>';
    }
    var html = '<div class="phone-camera-preview-overlay">' +
        '<div class="phone-camera-preview-media">' + mediaHtml + '</div>' +
        '<div class="phone-camera-preview-score">' + qualityText + '</div>' +
        '</div>';
    $view.find('.phone-camera-preview-overlay').remove();
    $view.append(html);
    if (isVideo) {
        var $container = $view.find('.phone-camera-video-container').first();
        var $video = $container.find('video').first();
        var $overlay = $container.find('.play-overlay').first();
        if ($video.length) {
            var videoEl = $video[0];
            var loopEnabled = $container.attr('data-loop') === '1';
            var autoplayEnabled = $container.attr('data-autoplay') === '1';
            videoEl.loop = loopEnabled;
            if (stateVars && stateVars.videoSettings) {
                var master = stateVars.videoSettings.masterVolume !== undefined ? Number(stateVars.videoSettings.masterVolume) : 100;
                var videoVol = stateVars.videoSettings.videoVolume !== undefined ? Number(stateVars.videoSettings.videoVolume) : 100;
                videoEl.volume = Math.max(0, Math.min(1, (master * videoVol) / 10000));
            }
            $container.off('click.phoneVid').on('click.phoneVid', function () {
                if (videoEl.paused) videoEl.play();
                else videoEl.pause();
            });
            $video.off('play.phoneVid playing.phoneVid').on('play.phoneVid playing.phoneVid', function () {
                $overlay.addClass('hidden');
            });
            $video.off('pause.phoneVid ended.phoneVid').on('pause.phoneVid ended.phoneVid', function () {
                if (!videoEl.ended || loopEnabled) $overlay.removeClass('hidden');
            });
            if (autoplayEnabled) {
                var playPromise = videoEl.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () { $overlay.removeClass('hidden'); });
                }
            } else {
                $overlay.removeClass('hidden');
            }
        }
    }
    if (typeof $ !== 'undefined' && $('#phone-app-view-title').length) {
        $('#phone-app-view-title').text(isVideo ? 'Video' : 'Photo');
    }
}

/**
 * Take a selfie and add to gallery
 * @param {string} type - 'normal', 'cute', 'hot', 'spicy'
 */
window.phoneTakeSelfie = function(type) {
    if (!PhoneAPI) return;
    const vars = PhoneAPI.State.variables;
    var dailyGate = canUsePhoneCameraToday(vars, 'photo');
    if (!dailyGate.ok) {
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<notify>>' + dailyGate.reason + '<</notify>>');
        return;
    }
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
    var path = getMediaPathFromPool('photos', type, isSafe, vars, contextTags, quality) || '';
    
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
    markPhoneCameraUsed(vars, 'photo');
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();

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
    var dailyGate = canUsePhoneCameraToday(vars, 'video');
    if (!dailyGate.ok) {
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<notify>>' + dailyGate.reason + '<</notify>>');
        return;
    }
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
    var path = getMediaPathFromPool('videos', type, isSafe, vars, contextTags, quality) || '';
    const video = {
        id: generateMediaId(),
        path: path,
        mediaKind: 'video',
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
    markPhoneCameraUsed(vars, 'video');
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    
    var list = vars.phoneGallery.videos[type];
    if (!Array.isArray(list)) list = vars.phoneGallery.videos[type] = [];
    var samePathIndex = -1;
    if (path) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].path === path) { samePathIndex = i; break; }
        }
    }
    if (samePathIndex >= 0) {
        var existing = list[samePathIndex];
        if (quality > (existing.quality || 0)) {
            list[samePathIndex] = video;
            persistPhoneChanges();
            phoneShowCapturePreview(video);
            if (typeof window.notifySuccess === 'function') {
                window.notifySuccess('You recorded a better quality video!');
            }
            return video;
        }
        phoneShowCapturePreview(video);
        if (typeof window.notifyWarning === 'function') {
            window.notifyWarning('You already have a better version of this video.');
        }
        return video;
    }

    list.push(video);
    persistPhoneChanges();
    phoneShowCapturePreview(video);
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
