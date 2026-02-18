/* ==========================================
   PHONE FOTOGRAM APP - Feed, Post, My Posts
   Data: $phoneFotogramPosts, $phoneFollowers, $phoneLastFotogramPostDate
========================================== */

/* Ensure this script can read Twine setup in every runtime context. */
if (typeof setup === 'undefined') {
    var setup = (typeof window !== 'undefined' && window.setup)
        ? window.setup
        : (typeof window !== 'undefined' && window.SugarCube && window.SugarCube.setup)
            ? window.SugarCube.setup
            : (typeof window !== 'undefined' && window.parent && window.parent.setup)
                ? window.parent.setup
                : undefined;
}

function getFotogramSetupNumber(key) {
    if (typeof setup === 'undefined') return null;
    var raw = setup[key];
    var num = Number(raw);
    if (!Number.isFinite(num)) return null;
    return num;
}

function getFotogramSetupArray(key) {
    if (typeof setup === 'undefined') return null;
    var arr = setup[key];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr;
}

function getMissingFotogramSetupKeys() {
    var missing = [];
    var requireNumber = function (key, mustBePositive) {
        var n = getFotogramSetupNumber(key);
        if (!Number.isFinite(n)) { missing.push(key); return; }
        if (mustBePositive && n <= 0) missing.push(key);
    };
    var requireArray = function (key) {
        if (!getFotogramSetupArray(key)) missing.push(key);
    };
    var requireObject = function (key) {
        if (typeof setup === 'undefined' || !setup[key] || typeof setup[key] !== 'object') missing.push(key);
    };

    requireArray('fotogramNotPostableFlags');
    requireNumber('fotogramCommentLikeRatio', true);
    requireNumber('fotogramPostCooldownDefaultDays', true);
    requireNumber('fotogramPostCooldownMinDays', true);
    requireNumber('fotogramPostCooldownMaxDays', true);
    requireNumber('fotogramHourlyWindowHours', true);
    requireNumber('fotogramHourlyShare', true);
    requireNumber('fotogramDailyShare', true);
    requireNumber('fotogramActiveDaysMin', true);
    requireNumber('fotogramActiveDaysMax', true);
    requireArray('fotogramAnonNames');
    requireArray('fotogramDMEncouragingMessages');
    requireArray('fotogramDMEncouragingReplyMessages');
    requireArray('fotogramCommentNames');
    requireObject('fotogramCommentTemplates');
    requireArray('fotogramAnonSkinTones');
    requireNumber('fotogramDmAgeMin', true);
    requireNumber('fotogramDmAgeMax', true);
    requireNumber('fotogramDmMaleWeight', true);
    requireNumber('fotogramDmFemaleWeight', true);
    requireNumber('fotogramDmMinConfidenceInteractive', true);
    requireNumber('fotogramDmMinCorruptionSwap', true);
    requireArray('fotogramDMScenarioTypes');
    requireObject('fotogramDMScenarioWeightsByFlag');
    requireObject('fotogramDMScenarioOpeners');
    requireObject('fotogramDMScenarioFlows');
    requireArray('fotogramDMQuickReplies');
    requireObject('fotogramDMPhotoPool');

    return missing;
}

function validateFotogramSetup(vars, options) {
    options = options || {};
    var missing = getMissingFotogramSetupKeys();
    var signature = missing.join('|');
    if (options.logOnce && vars) {
        if (vars._phoneFotogramSetupMissingSig !== signature) {
            vars._phoneFotogramSetupMissingSig = signature;
            if (missing.length) console.warn('[Fotogram setup] Missing keys:', missing);
        }
    } else if (options.logAlways && missing.length) {
        console.warn('[Fotogram setup] Missing keys:', missing);
    }
    return { ok: missing.length === 0, missing: missing };
}

/**
 * Check if a gallery item can be posted to Fotogram (Instagram-style: no topless/nude).
 * @param {object} item - Gallery item { flags: string[], from: string }
 * @returns {boolean}
 */
function isFotogramPostable(item) {
    if (!item) return false;
    if (item.from !== 'player') return false;
    var notPostableFlags = getFotogramSetupArray('fotogramNotPostableFlags');
    if (!notPostableFlags) return false;
    var flags = item.flags || [];
    for (var i = 0; i < notPostableFlags.length; i++) {
        if (flags.indexOf(notPostableFlags[i]) >= 0) return false;
    }
    return true;
}

/**
 * Find existing post for same path (for quality upgrade check).
 * @param {object} vars - State.variables
 * @param {string} path - item path
 * @returns {object|null} Post or null
 */
function normalizePathForCompare(p) {
    return (p || '').replace(/\\/g, '/').toLowerCase().trim();
}

function getMediaPoolEntryByPath(kind, category, path) {
    var pools = null;
    if (typeof PhoneAPI !== 'undefined' && PhoneAPI.setup && PhoneAPI.setup.phoneMediaPools) pools = PhoneAPI.setup.phoneMediaPools;
    else if (typeof setup !== 'undefined' && setup.phoneMediaPools) pools = setup.phoneMediaPools;
    if (!pools || !kind || !category || !path || !pools[kind] || !pools[kind][category]) return null;
    var pathNorm = normalizePathForCompare(path);
    var slotLists = [];
    var cat = pools[kind][category];
    if (Array.isArray(cat.safe)) slotLists.push(cat.safe);
    if (Array.isArray(cat.public)) slotLists.push(cat.public);
    for (var s = 0; s < slotLists.length; s++) {
        for (var i = 0; i < slotLists[s].length; i++) {
            var entry = slotLists[s][i];
            if (!entry || !entry.path) continue;
            if (normalizePathForCompare(entry.path) === pathNorm) return entry;
        }
    }
    return null;
}

function getFotogramPostForPath(vars, path) {
    var posts = vars.phoneFotogramPosts || [];
    var pathNorm = normalizePathForCompare(path);
    for (var i = 0; i < posts.length; i++) {
        if (normalizePathForCompare(posts[i].path) === pathNorm) return posts[i];
    }
    return null;
}

/**
 * Check if player can post (cooldown).
 * @param {object} vars - State.variables
 * @returns {{ canPost: boolean, daysLeft: number }}
 */
function getFotogramPostCooldown(vars) {
    var last = vars.phoneLastFotogramPostDate;
    if (!last) return { canPost: true, daysLeft: 0 };
    if (!vars.phoneFotogramCooldownDays || vars.phoneFotogramCooldownDays < 1) {
        var minCd = getFotogramSetupNumber('fotogramPostCooldownMinDays');
        var maxCd = getFotogramSetupNumber('fotogramPostCooldownMaxDays');
        if (!Number.isFinite(minCd) || !Number.isFinite(maxCd)) return { canPost: true, daysLeft: 0 };
        if (maxCd < minCd) maxCd = minCd;
        vars.phoneFotogramCooldownDays = Math.floor(Math.random() * (maxCd - minCd + 1)) + minCd;
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    }
    var ts = vars.timeSys || {};
    var y1 = ts.year || 0, m1 = (ts.month || 1) - 1, d1 = ts.day || 1;
    var y2 = last.year || 0, m2 = (last.month || 1) - 1, d2 = last.day || 1;
    var nowDate = new Date(y1, m1, d1).getTime();
    var lastDate = new Date(y2, m2, d2).getTime();
    var daysSince = Math.floor((nowDate - lastDate) / (24 * 60 * 60 * 1000));
    if (daysSince < 0) daysSince = 0;
    var cooldownDays = Number(vars.phoneFotogramCooldownDays);
    if (!Number.isFinite(cooldownDays) || cooldownDays < 1) {
        cooldownDays = getFotogramSetupNumber('fotogramPostCooldownDefaultDays');
        if (!Number.isFinite(cooldownDays) || cooldownDays < 1) return { canPost: true, daysLeft: 0 };
    }
    var daysLeft = Math.max(0, cooldownDays - daysSince);
    return { canPost: daysLeft === 0, daysLeft: daysLeft };
}

/**
 * Get gallery items that can be posted (player's, postable flags, not received).
 */
function getFotogramPostableItems(vars) {
    var gallery = vars.phoneGallery || { photos: {}, videos: {} };
    var out = [];
    var cats = ['normal', 'cute', 'hot', 'spicy'];
    var kinds = ['photos', 'videos'];
    for (var k = 0; k < kinds.length; k++) {
        for (var c = 0; c < cats.length; c++) {
            var list = gallery[kinds[k]] && gallery[kinds[k]][cats[c]];
            if (!Array.isArray(list)) continue;
            for (var i = 0; i < list.length; i++) {
                var it = list[i];
                if (it.from !== 'player') continue;
                if (!isFotogramPostable(it)) continue;
                var existing = getFotogramPostForPath(vars, (it.path || '').trim());
                var quality = (it.quality != null) ? Number(it.quality) : 0;
                var canPost = true;
                var upgrade = false;
                if (existing) {
                    var oldQ = (existing.quality != null) ? Number(existing.quality) : 0;
                    if (quality <= oldQ) continue; // already posted at same/better quality: hide from share list
                    upgrade = true;
                }
                out.push({ item: it, category: cats[c], kind: (kinds[k] === 'videos' ? 'video' : 'photo'), canPost: canPost, upgrade: upgrade });
            }
        }
    }
    return out;
}

function getAssetUrl(path) {
    return (typeof window.getPhoneAssetUrl === 'function') ? window.getPhoneAssetUrl(path) : (path || '');
}

function getMediaKindFromPath(path) {
    var p = String(path || '').toLowerCase();
    if (p.endsWith('.mp4') || p.endsWith('.webm') || p.endsWith('.ogg')) return 'video';
    return 'photo';
}

function isLikelyMediaPath(value) {
    var p = String(value || '').trim().toLowerCase();
    if (!p) return false;
    return (
        p.indexOf('assets/') === 0 &&
        (p.endsWith('.webp') || p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.gif') || p.endsWith('.mp4') || p.endsWith('.webm') || p.endsWith('.ogg'))
    );
}

function getFotogramDateKey(timeObj) {
    if (!timeObj) return 0;
    return (Number(timeObj.year) || 0) * 10000 + (Number(timeObj.month) || 0) * 100 + (Number(timeObj.day) || 0);
}

function getFotogramQualityMultiplier(quality) {
    var q = Math.max(0, Number(quality) || 0);
    if (q < 20) return 1;
    if (q < 40) return 10;
    if (q < 60) return 100;
    return 1000;
}

function createEngagementPlanForQuality(quality, likesFloor, followersFloor) {
    var q = Math.max(0, Number(quality) || 0);
    var baseLikes = Math.floor(q * 0.9) + Math.floor(Math.random() * 26) + 12;
    var qualityMultiplier = getFotogramQualityMultiplier(q);
    var likesBase = baseLikes * qualityMultiplier;
    var maxLikesTotal = Math.max(Number(likesFloor) || 0, likesBase);
    var followersBase = Math.floor(maxLikesTotal * (0.1 + Math.random() * 0.08));
    var maxFollowersTotal = Math.max(Number(followersFloor) || 0, followersBase);
    var commentRatio = getFotogramSetupNumber('fotogramCommentLikeRatio');
    if (!Number.isFinite(commentRatio) || commentRatio <= 0) return null;
    var maxCommentsTotal = Math.max(1, Math.floor(maxLikesTotal * commentRatio));
    var activeMin = getFotogramSetupNumber('fotogramActiveDaysMin');
    var activeMax = getFotogramSetupNumber('fotogramActiveDaysMax');
    if (!Number.isFinite(activeMin) || !Number.isFinite(activeMax)) return null;
    if (activeMax < activeMin) activeMax = activeMin;
    var activeDays = Math.floor(Math.random() * (activeMax - activeMin + 1)) + activeMin;
    return {
        maxLikesTotal: maxLikesTotal,
        maxFollowersTotal: maxFollowersTotal,
        maxCommentsTotal: maxCommentsTotal,
        activeDays: activeDays,
        hourlyHoursProcessed: 0,
        dailyDaysProcessed: 0
    };
}

function createFotogramPostFromGallery(vars, itemId, replaceMode) {
    if (!vars) return { ok: false, reason: 'NO_STATE' };
    if (!vars.phoneFotogramPosts) vars.phoneFotogramPosts = [];
    var gallery = vars.phoneGallery || { photos: {}, videos: {} };
    if (typeof findGalleryItemById !== 'function') return { ok: false, reason: 'NO_GALLERY_HELPER' };
    var found = findGalleryItemById(gallery, itemId);
    if (!found || !found.item) return { ok: false, reason: 'ITEM_NOT_FOUND' };
    var item = found.item;
    if (item.from !== 'player') return { ok: false, reason: 'NOT_PLAYER_MEDIA' };
    if (typeof isFotogramPostable === 'function' && !isFotogramPostable(item)) return { ok: false, reason: 'NOT_POSTABLE' };

    var path = (item.path || '').trim();
    if (!path) return { ok: false, reason: 'NO_PATH' };
    var quality = (item.quality != null) ? Number(item.quality) : 0;
    var cooldown = getFotogramPostCooldown(vars);
    if (!cooldown.canPost) return { ok: false, reason: 'COOLDOWN', daysLeft: cooldown.daysLeft };
    var posts = vars.phoneFotogramPosts;
    var existing = getFotogramPostForPath(vars, path);
    var existingIdx = existing ? posts.indexOf(existing) : -1;

    if (existingIdx >= 0) {
        if (!replaceMode) return { ok: false, reason: 'DUPLICATE_POST' };
        if (quality <= (posts[existingIdx].quality || 0)) return { ok: false, reason: 'NOT_UPGRADE' };
        posts.splice(existingIdx, 1);
    }

    var postId = 'fpost_' + Date.now();
    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    var postFlags = (item.flags && item.flags.length) ? item.flags.slice() : [];
    var plan = createEngagementPlanForQuality(quality, 0, 0);
    if (!plan) return { ok: false, reason: 'MISSING_FOTOGRAM_SETUP' };
    posts.push({
        id: postId,
        galleryItemId: itemId,
        path: path,
        mediaKind: (found.kind === 'video') ? 'video' : 'photo',
        category: found.category,
        quality: quality,
        flags: postFlags,
        time: time,
        likes: 0,
        followersGained: 0,
        comments: [],
        dmIds: [],
        engagementPlan: plan
    });
    vars.phoneLastFotogramPostDate = time;
    var minCd = getFotogramSetupNumber('fotogramPostCooldownMinDays');
    var maxCd = getFotogramSetupNumber('fotogramPostCooldownMaxDays');
    if (!Number.isFinite(minCd) || !Number.isFinite(maxCd)) return { ok: false, reason: 'MISSING_FOTOGRAM_SETUP' };
    if (maxCd < minCd) maxCd = minCd;
    vars.phoneFotogramCooldownDays = Math.floor(Math.random() * (maxCd - minCd + 1)) + minCd;
    if (posts.length > 50) posts.splice(0, posts.length - 50);
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof window.updatePhoneBadges === 'function') window.updatePhoneBadges();
    return { ok: true, replaced: existingIdx >= 0, postId: postId };
}

function phoneCreateFotogramPost(itemId, replaceMode) {
    var vars = (typeof State !== 'undefined' && State.variables)
        ? State.variables
        : (typeof window !== 'undefined' && window.PhoneAPI && window.PhoneAPI.State && window.PhoneAPI.State.variables)
            ? window.PhoneAPI.State.variables
            : null;
    return createFotogramPostFromGallery(vars, itemId, !!replaceMode);
}

/**
 * Render Fotogram app: My Posts + Share from Gallery
 */
function phoneRenderFotogramApp(vars) {
    var setupCheck = validateFotogramSetup(vars, { logOnce: true });
    var posts = vars.phoneFotogramPosts || [];
    var followers = vars.phoneFollowers || 0;
    var cooldown = getFotogramPostCooldown(vars);
    var postableItems = getFotogramPostableItems(vars);
    var totalLikes = 0;
    var totalComments = 0;
    for (var pti = 0; pti < posts.length; pti++) {
        totalLikes += Number(posts[pti] && posts[pti].likes) || 0;
        totalComments += Array.isArray(posts[pti] && posts[pti].comments) ? posts[pti].comments.length : 0;
    }

    var html = '<div class="phone-fotogram-app">';
    if (!setupCheck.ok) {
        html += '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">Fotogram setup is incomplete</p><p class="phone-app-placeholder-sub">Missing: ' + escapeHtmlFg(setupCheck.missing.join(', ')) + '</p></div>';
    }
    html += '<div class="phone-fotogram-content">';

    var fgView = (typeof phoneViewState !== 'undefined' && phoneViewState && phoneViewState.fotogramSub) ? phoneViewState : (window.phoneFotogramViewState = window.phoneFotogramViewState || { fotogramSub: 'feed', fotogramPostDetail: null });
    var sub = fgView.fotogramSub || 'feed';
    if (sub === 'share') {
        html += '<div class="phone-fotogram-share">';
        var sharePreview = fgView.fotogramSharePreview;
        if (sharePreview && sharePreview.itemId) {
            var previewItem = null;
            for (var pi = 0; pi < postableItems.length; pi++) {
                if (postableItems[pi].item && postableItems[pi].item.id === sharePreview.itemId) {
                    previewItem = postableItems[pi];
                    break;
                }
            }
            if (!previewItem) {
                fgView.fotogramSharePreview = null;
            } else {
                var item = previewItem.item;
                var itemPath = (item.path || '').trim();
                var itemSrc = itemPath ? getAssetUrl(itemPath) : '';
                var itemQuality = (item.quality != null) ? Number(item.quality) : 0;
                var mediaLabel = previewItem.kind === 'video' ? 'Video' : 'Photo';
                var poolKind = previewItem.kind === 'video' ? 'videos' : 'photos';
                var poolEntry = getMediaPoolEntryByPath(poolKind, previewItem.category, itemPath);
                var desc = item.fotogramDesc || item.desc || (poolEntry && (poolEntry.desc || poolEntry.description)) || '';
                var infoTip = 'Type: ' + mediaLabel + '\nQuality: ' + itemQuality + '/100' + (desc ? ('\n' + desc) : '');
                var safeIdPreview = (item.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                html += '<div class="phone-fotogram-preview">';
                html += '<div class="phone-fotogram-preview-media">';
                html += '<button type="button" class="phone-fotogram-preview-info overlay" data-tooltip="' + escapeHtmlFg(infoTip) + '"><span class="icon icon-info icon-16"></span></button>';
                if (previewItem.kind === 'video') {
                    var autoplaySet = !!(vars && vars.videoSettings && vars.videoSettings.autoplaySet !== undefined ? vars.videoSettings.autoplaySet : true);
                    var loopSet = !!(vars && vars.videoSettings && vars.videoSettings.loopSet !== undefined ? vars.videoSettings.loopSet : true);
                    html += itemPath
                        ? '<div class="video-container phone-fotogram-preview-video-container" data-autoplay="' + (autoplaySet ? '1' : '0') + '" data-loop="' + (loopSet ? '1' : '0') + '">' +
                            '<video src="' + (itemSrc || itemPath).replace(/"/g, '&quot;') + '" playsinline></video>' +
                            '<div class="play-overlay"><div class="video-play-btn"><span class="icon icon-play"></span></div></div>' +
                          '</div>'
                        : '<div class="phone-gallery-thumb-placeholder">Video</div>';
                } else {
                    html += itemPath ? '<img src="' + (itemSrc || itemPath).replace(/"/g, '&quot;') + '" alt="" loading="lazy">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>';
                }
                html += '</div>';
                html += '<div class="phone-fotogram-preview-actions">';
                html += '<button type="button" class="phone-fotogram-preview-btn secondary" id="phone-fotogram-preview-back">Back</button>';
                html += '<button type="button" class="phone-fotogram-preview-btn primary" id="phone-fotogram-preview-share" data-id="' + safeIdPreview + '" data-upgrade="' + (sharePreview.upgrade ? 'true' : 'false') + '">Share</button>';
                html += '</div></div>';
            }
        }
        if (!sharePreview || !sharePreview.itemId || !fgView.fotogramSharePreview) {
            if (postableItems.length === 0) {
            html += '<div class="phone-app-placeholder">';
            html += '<p class="phone-app-placeholder-text">No postable photos</p>';
            html += '<p class="phone-app-placeholder-sub">Take selfies or improve quality.</p>';
            html += '</div>';
            } else {
            html += '<div class="phone-fotogram-share-title">Share from Gallery</div>';
            html += '<div class="phone-fotogram-picker">';
            for (var j = 0; j < postableItems.length; j++) {
                var p = postableItems[j];
                var it = p.item;
                var path = (it.path || '').trim();
                var src = path ? getAssetUrl(path) : '';
                var safePath = (path || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                var safeId = (it.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                var q = (it.quality != null) ? it.quality : 0;
                var upgradeNote = p.upgrade ? ' data-upgrade="true"' : '';
                var mediaBadge = (p.kind === 'video') ? 'V' : 'P';
                html += '<div class="phone-fotogram-pick-cell' + (p.canPost ? '' : ' disabled') + '" data-id="' + safeId + '" data-path="' + safePath + '" data-quality="' + q + '"' + upgradeNote + '>';
                if (p.kind === 'video') {
                    html += path
                        ? '<video src="' + (src || path).replace(/"/g, '&quot;') + '" muted preload="metadata"></video>'
                        : '<div class="phone-gallery-thumb-placeholder">Video</div>';
                } else {
                    html += path ? '<img src="' + (src || path).replace(/"/g, '&quot;') + '" alt="" loading="lazy">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>';
                }
                html += '<span class="phone-fotogram-media-badge">' + mediaBadge + '</span>';
                html += '<span class="phone-fotogram-pick-q">' + q + '</span>';
                html += '</div>';
            }
            html += '</div>';
            if (!cooldown.canPost) {
                html += '<div class="phone-fotogram-share-overlay">';
                html += '<div class="phone-fotogram-share-overlay-text">You posted recently. You need to wait <strong>' + cooldown.daysLeft + ' day(s)</strong> before posting again.</div>';
                html += '</div>';
            }
            }
        }
        html += '</div>';
    } else if (sub === 'profile') {
        html += '<div class="phone-fotogram-profile">';
        var playerChar = (vars && vars.characters && vars.characters.player) ? vars.characters.player : (vars && vars.player) || {};
        var playerFirst = playerChar.firstName || playerChar.name || 'player';
        var playerLast = playerChar.lastName || playerChar.lastname || '';
        var profileDisplayName = (playerFirst + (playerLast ? (' ' + playerLast) : '')).trim();
        var profileHandle = (playerFirst + (playerLast || '')).toLowerCase().replace(/\s+/g, '');
        var profileImg = (playerChar.avatar && String(playerChar.avatar).trim()) || ((typeof setup !== 'undefined' && setup.imageProfile) ? String(setup.imageProfile).trim() : '');
        html += '<div class="phone-fotogram-profile-card">';
        html += '<div class="phone-fotogram-profile-head">';
        if (profileImg) {
            var profileImgSrc = getAssetUrl(profileImg);
            html += '<span class="phone-fotogram-profile-avatar phone-fotogram-profile-avatar-img" aria-hidden="true"><img src="' + escapeHtmlFg(profileImgSrc || profileImg) + '" alt=""></span>';
        } else {
            html += '<span class="phone-fotogram-profile-avatar" aria-hidden="true">' + escapeHtmlFg((playerFirst || 'P').charAt(0).toUpperCase()) + '</span>';
        }
        html += '<div class="phone-fotogram-profile-id">';
        html += '<div class="phone-fotogram-profile-name">' + escapeHtmlFg(profileDisplayName || 'Player') + '</div>';
        html += '<div class="phone-fotogram-profile-handle">@' + escapeHtmlFg(profileHandle || 'player') + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="phone-fotogram-profile-stats">';
        html += '<span class="phone-fotogram-stat"><strong>' + formatFotogramCount(posts.length) + '</strong> posts</span>';
        html += '<span class="phone-fotogram-stat"><strong>' + formatFotogramCount(followers) + '</strong> followers</span>';
        html += '</div>';
        html += '<div class="phone-fotogram-profile-totals">';
        html += '<span class="phone-fotogram-profile-total"><strong>' + formatFotogramCount(totalLikes) + '</strong> total likes</span>';
        html += '<span class="phone-fotogram-profile-total"><strong>' + formatFotogramCount(totalComments) + '</strong> total comments</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    } else if (sub === 'dm') {
        html += '<div class="phone-fotogram-dm">';
        var dmThread = fgView.fotogramDmThread;
        if (dmThread) {
            html += typeof phoneRenderFotogramDmThread === 'function' ? phoneRenderFotogramDmThread(dmThread) : '';
        } else {
            html += typeof phoneRenderFotogramDmList === 'function' ? phoneRenderFotogramDmList() : '<div class="phone-fotogram-dm-empty">No DMs yet.</div>';
        }
        html += '</div>';
    } else {
        var detailPostId = fgView.fotogramPostDetail;
        if (detailPostId) {
            var detailPost = getPostById(vars, detailPostId);
            if (!detailPost) {
                fgView.fotogramPostDetail = null;
            } else {
                var dPath = (detailPost.path || '').trim();
                var dSrc = dPath ? getAssetUrl(dPath) : '';
                var detailAutoplaySet = !!(vars && vars.videoSettings && vars.videoSettings.autoplaySet !== undefined ? vars.videoSettings.autoplaySet : true);
                var detailLoopSet = !!(vars && vars.videoSettings && vars.videoSettings.loopSet !== undefined ? vars.videoSettings.loopSet : true);
                var detailComments = Array.isArray(detailPost.comments) ? detailPost.comments : [];
                html += '<div class="phone-fotogram-post-detail">';
                html += '<div class="phone-fotogram-post-card detail">';
                if ((detailPost.mediaKind || 'photo') === 'video') {
                    html += dPath
                        ? '<div class="video-container phone-fotogram-post-video-container" data-autoplay="' + (detailAutoplaySet ? '1' : '0') + '" data-loop="' + (detailLoopSet ? '1' : '0') + '">' +
                            '<video src="' + (dSrc || dPath).replace(/"/g, '&quot;') + '" playsinline muted></video>' +
                            '<div class="play-overlay"><div class="video-play-btn"><span class="icon icon-play"></span></div></div>' +
                          '</div>'
                        : '<div class="phone-gallery-thumb-placeholder">Video</div>';
                } else {
                    html += dPath ? '<img src="' + (dSrc || dPath).replace(/"/g, '&quot;') + '" alt="">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>';
                }
                html += '<div class="phone-fotogram-post-meta">';
                html += '<span class="phone-fotogram-likes">' + formatFotogramCount(detailPost.likes || 0) + ' likes</span>';
                html += '<span class="phone-fotogram-comments-count">' + formatFotogramCount(detailComments.length) + ' comments</span>';
                html += '<span class="phone-fotogram-post-q">Q:' + (detailPost.quality || 0) + '</span>';
                html += '</div>';
                html += '</div>';
                html += '<div class="phone-fotogram-detail-comments-panel">';
                html += '<div class="phone-fotogram-comments detail">';
                if (detailComments.length === 0) {
                    html += '<div class="phone-fotogram-comment-empty">No comments yet.</div>';
                } else {
                    for (var dci = 0; dci < detailComments.length; dci++) {
                        var dcm = detailComments[dci];
                        var dcmUser = 'User';
                        var dcmText = '';
                        if (typeof dcm === 'string') {
                            dcmText = dcm;
                        } else if (dcm && typeof dcm === 'object') {
                            dcmUser = dcm.user || 'User';
                            dcmText = dcm.text || '';
                        }
                        if (!dcmText) continue;
                        html += '<div class="phone-fotogram-comment-block"><div class="phone-fotogram-comment instagram">';
                        html += renderFotogramAvatar(dcmUser, null, 'comment');
                        html += '<div class="phone-fotogram-comment-content">';
                        html += '<div class="phone-fotogram-comment-user">' + escapeHtmlFg(dcmUser) + '</div>';
                        html += '<div class="phone-fotogram-comment-text">' + escapeHtmlFg(dcmText) + '</div>';
                        html += '</div></div></div>';
                    }
                }
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
        }
        if (!fgView.fotogramPostDetail) {
            html += '<div class="phone-fotogram-posts">';
            if (posts.length === 0) {
                html += '<div class="phone-app-placeholder">';
                html += '<p class="phone-app-placeholder-text">No posts yet</p>';
                html += '<p class="phone-app-placeholder-sub">Share a photo from Gallery to get started.</p>';
                html += '</div>';
            } else {
                var feedAutoplaySet = !!(vars && vars.videoSettings && vars.videoSettings.autoplaySet !== undefined ? vars.videoSettings.autoplaySet : true);
                var feedLoopSet = !!(vars && vars.videoSettings && vars.videoSettings.loopSet !== undefined ? vars.videoSettings.loopSet : true);
                for (var k = posts.length - 1; k >= 0; k--) {
                    var post = posts[k];
                    var pPath = (post.path || '').trim();
                    var pSrc = pPath ? getAssetUrl(pPath) : '';
                    var safePostId = (post.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    html += '<div class="phone-fotogram-post-card" data-post-id="' + safePostId + '">';
                    if ((post.mediaKind || 'photo') === 'video') {
                        html += pPath
                            ? '<div class="video-container phone-fotogram-post-video-container" data-autoplay="' + (feedAutoplaySet ? '1' : '0') + '" data-loop="' + (feedLoopSet ? '1' : '0') + '">' +
                                '<video src="' + (pSrc || pPath).replace(/"/g, '&quot;') + '" playsinline muted></video>' +
                                '<div class="play-overlay"><div class="video-play-btn"><span class="icon icon-play"></span></div></div>' +
                              '</div>'
                            : '<div class="phone-gallery-thumb-placeholder">Video</div>';
                    } else {
                        html += pPath ? '<img src="' + (pSrc || pPath).replace(/"/g, '&quot;') + '" alt="">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>';
                    }
                    html += '<div class="phone-fotogram-post-meta">';
                    html += '<span class="phone-fotogram-likes">' + formatFotogramCount(post.likes || 0) + ' likes</span>';
                    var comments = Array.isArray(post.comments) ? post.comments : [];
                    html += '<span class="phone-fotogram-comments-count">' + formatFotogramCount(comments.length) + ' comments</span>';
                    html += '<span class="phone-fotogram-post-q">Q:' + (post.quality || 0) + '</span>';
                    html += '</div>';
                    html += '</div>';
                }
            }
            html += '</div>';
        }
    }

    html += '</div>';
    html += '<nav class="phone-fotogram-tabs">';
    html += '<button type="button" class="phone-fotogram-tab' + (sub === 'feed' ? ' active' : '') + '" data-tab="feed" aria-label="Feed"><span class="icon icon-home icon-22"></span></button>';
    var shareDisabled = false;
    html += '<button type="button" class="phone-fotogram-tab' + (sub === 'share' ? ' active' : '') + (shareDisabled ? ' disabled' : '') + '" id="phone-fotogram-share-btn" data-tab="share" aria-label="Share"' + (shareDisabled ? ' disabled' : '') + '><span class="icon icon-plus icon-22"></span></button>';
    html += '<button type="button" class="phone-fotogram-tab' + (sub === 'profile' ? ' active' : '') + '" data-tab="profile" aria-label="Profile"><span class="icon icon-user icon-22"></span></button>';
    var unreadDmCount = getUnreadFotogramDmCount(vars);
    html += '<button type="button" class="phone-fotogram-tab' + (sub === 'dm' ? ' active' : '') + '" data-tab="dm" aria-label="Messages"><span class="icon icon-message icon-22"></span>' + (unreadDmCount > 0 ? '<span class="phone-fotogram-tab-badge">' + (unreadDmCount > 99 ? '99+' : unreadDmCount) + '</span>' : '') + '</button>';
    html += '</nav>';

    html += '</div>';
    return html;
}

window.initFotogramPreviewVideoPlayer = function (vars) {
    if (typeof $ === 'undefined') return;
    var $view = $('#phone-app-view-content');
    if (!$view.length) return;
    var $container = $view.find('.phone-fotogram-preview-video-container').first();
    if (!$container.length) return;
    var $video = $container.find('video').first();
    var $overlay = $container.find('.play-overlay').first();
    if (!$video.length) return;
    var videoEl = $video[0];
    var loopEnabled = $container.attr('data-loop') === '1';
    var autoplayEnabled = $container.attr('data-autoplay') === '1';
    videoEl.loop = loopEnabled;
    if (vars && vars.videoSettings) {
        var master = vars.videoSettings.masterVolume !== undefined ? Number(vars.videoSettings.masterVolume) : 100;
        var videoVol = vars.videoSettings.videoVolume !== undefined ? Number(vars.videoSettings.videoVolume) : 100;
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
};

window.initFotogramFeedVideoPlayers = function (vars) {
    if (typeof $ === 'undefined') return;
    var $view = $('#phone-app-view-content');
    if (!$view.length) return;
    $view.find('.phone-fotogram-post-video-container').each(function () {
        var $container = $(this);
        var $video = $container.find('video').first();
        var $overlay = $container.find('.play-overlay').first();
        if (!$video.length) return;
        var videoEl = $video[0];
        var loopEnabled = $container.attr('data-loop') === '1';
        var autoplayEnabled = $container.attr('data-autoplay') === '1';
        videoEl.loop = loopEnabled;
        videoEl.muted = true;
        videoEl.defaultMuted = true;
        videoEl.volume = 0;
        $container.off('click.phoneFgFeed').on('click.phoneFgFeed', function () {
            if (videoEl.paused) videoEl.play();
            else videoEl.pause();
        });
        $video.off('play.phoneFgFeed playing.phoneFgFeed').on('play.phoneFgFeed playing.phoneFgFeed', function () {
            $overlay.addClass('hidden');
        });
        $video.off('pause.phoneFgFeed ended.phoneFgFeed').on('pause.phoneFgFeed ended.phoneFgFeed', function () {
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
    });
};

window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.fotogram = {
    render: function (vars) {
        var viewState = (typeof phoneViewState !== 'undefined' && phoneViewState) ? phoneViewState : (window.phoneFotogramViewState = window.phoneFotogramViewState || { fotogramSub: 'feed', fotogramPostDetail: null });
        if (!viewState.fotogramSub) viewState.fotogramSub = 'feed';
        return phoneRenderFotogramApp(vars || (PhoneAPI && PhoneAPI.State && PhoneAPI.State.variables) || {});
    }
};

function ensureFotogramEngagementPlan(vars, post) {
    var likesNow = Number(post.likes) || 0;
    var followersNow = Number(post.followersGained) || 0;
    if (!post.engagementPlan || typeof post.engagementPlan !== 'object') {
        post.engagementPlan = createEngagementPlanForQuality(post.quality, likesNow + 5, followersNow + 1);
        if (!post.engagementPlan) return null;
    }
    var plan = post.engagementPlan;
    if (plan.maxLikesTotal == null || plan.maxFollowersTotal == null || plan.maxCommentsTotal == null) {
        var patched = createEngagementPlanForQuality(post.quality, likesNow + 5, followersNow + 1);
        plan.maxLikesTotal = patched.maxLikesTotal;
        plan.maxFollowersTotal = patched.maxFollowersTotal;
        plan.maxCommentsTotal = patched.maxCommentsTotal;
        if (plan.activeDays == null) plan.activeDays = patched.activeDays;
    }
    if (plan.maxLikesTotal < likesNow) plan.maxLikesTotal = likesNow;
    if (plan.maxFollowersTotal < followersNow) plan.maxFollowersTotal = followersNow;
    if (plan.maxCommentsTotal == null || plan.maxCommentsTotal < 0) {
        var cr = getFotogramSetupNumber('fotogramCommentLikeRatio');
        if (!Number.isFinite(cr) || cr <= 0) return null;
        plan.maxCommentsTotal = Math.max(1, Math.floor((plan.maxLikesTotal || 0) * cr));
    }
    if (plan.activeDays == null || plan.activeDays < 1) {
        var activeMin = getFotogramSetupNumber('fotogramActiveDaysMin');
        var activeMax = getFotogramSetupNumber('fotogramActiveDaysMax');
        if (!Number.isFinite(activeMin) || !Number.isFinite(activeMax)) return null;
        if (activeMax < activeMin) activeMax = activeMin;
        plan.activeDays = Math.floor(Math.random() * (activeMax - activeMin + 1)) + activeMin;
    }
    if (plan.hourlyHoursProcessed == null) plan.hourlyHoursProcessed = 0;
    if (plan.dailyDaysProcessed == null) plan.dailyDaysProcessed = 0;
    return plan;
}

function resolveLowQualityDmTargetCount(post) {
    if (!post) return 1;
    if (post.lowQualityDmTargetCount !== 1 && post.lowQualityDmTargetCount !== 2) {
        post.lowQualityDmTargetCount = (Math.random() < 0.5) ? 1 : 2;
    }
    return post.lowQualityDmTargetCount;
}

function getFotogramDmPolicy(vars, post) {
    var followersTotal = Math.max(0, Number(vars && vars.phoneFollowers) || 0);
    var quality = Math.max(0, Number(post && post.quality) || 0);
    if (quality < 50) {
        if (followersTotal < 100) return { targetCount: 0, interactive: false };
        return { targetCount: resolveLowQualityDmTargetCount(post), interactive: false };
    }
    if (followersTotal < 1000) return { targetCount: 0, interactive: true };
    if (followersTotal >= 5000) return { targetCount: 3, interactive: true };
    if (followersTotal >= 3000) return { targetCount: 2, interactive: true };
    return { targetCount: 1, interactive: true };
}

function applyPostEngagementDelta(vars, post, likesAdd, followersAdd, phase) {
    var likesDelta = Math.max(0, Number(likesAdd) || 0);
    var followersDelta = Math.max(0, Number(followersAdd) || 0);
    if (likesDelta <= 0 && followersDelta <= 0) return false;
    var plan = ensureFotogramEngagementPlan(vars, post);
    if (!plan) return false;
    post.likes = (post.likes || 0) + likesDelta;
    post.followersGained = (post.followersGained || 0) + followersDelta;
    vars.phoneFollowers = (vars.phoneFollowers || 0) + followersDelta;
    if (!Array.isArray(post.comments)) post.comments = [];
    var commentsNow = post.comments.length;
    var commentRatio = getFotogramSetupNumber('fotogramCommentLikeRatio');
    if (!Number.isFinite(commentRatio) || commentRatio <= 0) return false;
    var commentsCap = Math.max(commentsNow, Math.floor((post.likes || 0) * commentRatio), Number(plan.maxCommentsTotal) || 0);
    var commentsRemainingGlobal = Math.max(0, commentsCap - commentsNow);
    var hourlyShare = getFotogramSetupNumber('fotogramHourlyShare');
    var dailyShare = getFotogramSetupNumber('fotogramDailyShare');
    if (!Number.isFinite(hourlyShare) || !Number.isFinite(dailyShare)) return false;
    var phaseShare = (phase === 'hourly') ? hourlyShare : dailyShare;
    var phaseCommentTarget = Math.floor(commentsCap * phaseShare);
    var phaseCommentsGiven = (phase === 'hourly')
        ? Math.min(commentsNow, phaseCommentTarget)
        : Math.max(0, commentsNow - Math.floor(commentsCap * hourlyShare));
    var phaseCommentsRemaining = Math.max(0, phaseCommentTarget - phaseCommentsGiven);
    var commentRollBase = likesDelta + (followersDelta * 2);
    var generatedComments = Math.max(0, Math.min(3, Math.floor(commentRollBase / 12)));
    if (generatedComments > commentsRemainingGlobal) generatedComments = commentsRemainingGlobal;
    if (generatedComments > phaseCommentsRemaining) generatedComments = phaseCommentsRemaining;
    if (generatedComments > 0) {
        for (var c = 0; c < generatedComments; c++) {
            var createdComment = createFotogramCommentForPost(vars, post);
            if (createdComment) post.comments.push(createdComment);
        }
        if (post.comments.length > 100) post.comments.splice(0, post.comments.length - 100);
        addFotogramNotification(vars, 'comment', post.id);
    }
    if (!post.dmIds) post.dmIds = [];
    var dmPolicy = getFotogramDmPolicy(vars, post);
    if (dmPolicy.targetCount > post.dmIds.length) {
        var dm = createFotogramDM(vars, post, { interactive: dmPolicy.interactive });
        if (dm) {
            post.dmIds.push(dm.id);
            addFotogramNotification(vars, 'dm', dm.id);
        }
    }
    return true;
}

function updateFotogramEngagementHourly(vars, hoursPassed) {
    var posts = vars.phoneFotogramPosts || [];
    var countHours = Math.max(0, Math.floor(Number(hoursPassed) || 0));
    if (posts.length === 0 || countHours <= 0) return;
    var modified = false;
    var hourWeights = [0.5, 0.3, 0.2];
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        var plan = ensureFotogramEngagementPlan(vars, post);
        if (!plan) continue;
        var hourlyWindowHours = getFotogramSetupNumber('fotogramHourlyWindowHours');
        var hourlyShare = getFotogramSetupNumber('fotogramHourlyShare');
        if (!Number.isFinite(hourlyWindowHours) || !Number.isFinite(hourlyShare)) continue;
        if (plan.hourlyHoursProcessed >= hourlyWindowHours) continue;
        var hourlyLikesTarget = Math.floor(plan.maxLikesTotal * hourlyShare);
        var hourlyFollowersTarget = Math.floor(plan.maxFollowersTotal * hourlyShare);
        var likesGiven = Math.min(Number(post.likes) || 0, hourlyLikesTarget);
        var followersGiven = Math.min(Number(post.followersGained) || 0, hourlyFollowersTarget);
        var hoursLeft = hourlyWindowHours - plan.hourlyHoursProcessed;
        var processNow = Math.min(countHours, hoursLeft);
        for (var h = 0; h < processNow; h++) {
            var step = plan.hourlyHoursProcessed;
            var likesRemaining = Math.max(0, hourlyLikesTarget - likesGiven);
            var followersRemaining = Math.max(0, hourlyFollowersTarget - followersGiven);
            if (likesRemaining <= 0 && followersRemaining <= 0) {
                plan.hourlyHoursProcessed++;
                continue;
            }
            var isLastHour = step >= hourlyWindowHours - 1;
            var weight = hourWeights[step] || 0;
            var likesAdd = isLastHour ? likesRemaining : Math.max(0, Math.floor(hourlyLikesTarget * weight));
            var followersAdd = isLastHour ? followersRemaining : Math.max(0, Math.floor(hourlyFollowersTarget * weight));
            if (likesAdd > likesRemaining) likesAdd = likesRemaining;
            if (followersAdd > followersRemaining) followersAdd = followersRemaining;
            if (applyPostEngagementDelta(vars, post, likesAdd, followersAdd, 'hourly')) modified = true;
            likesGiven += likesAdd;
            followersGiven += followersAdd;
            plan.hourlyHoursProcessed++;
        }
    }
    if (modified && typeof persistPhoneChanges === 'function') persistPhoneChanges();
}

/**
 * Daily tail engagement:
 * - First 3 hours share 40% (handled in updateFotogramEngagementHourly)
 * - Remaining random 3-5 days share 60%
 * Called from <<updateFotogramEngagement>> in advanceDay.
 */
function updateFotogramEngagement(vars) {
    var posts = vars.phoneFotogramPosts || [];
    if (posts.length === 0) return;
    var modified = false;
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        var plan = ensureFotogramEngagementPlan(vars, post);
        if (!plan) continue;
        var dailyShare = getFotogramSetupNumber('fotogramDailyShare');
        var hourlyShare = getFotogramSetupNumber('fotogramHourlyShare');
        if (!Number.isFinite(dailyShare) || !Number.isFinite(hourlyShare)) continue;
        if (plan.dailyDaysProcessed >= plan.activeDays) continue;
        var dailyLikesTarget = Math.max(0, Math.floor(plan.maxLikesTotal * dailyShare));
        var dailyFollowersTarget = Math.max(0, Math.floor(plan.maxFollowersTotal * dailyShare));
        var dailyLikesGiven = Math.max(0, (Number(post.likes) || 0) - Math.floor(plan.maxLikesTotal * hourlyShare));
        var dailyFollowersGiven = Math.max(0, (Number(post.followersGained) || 0) - Math.floor(plan.maxFollowersTotal * hourlyShare));
        var daysLeft = Math.max(1, plan.activeDays - plan.dailyDaysProcessed);
        var likesRemaining = Math.max(0, dailyLikesTarget - dailyLikesGiven);
        var followersRemaining = Math.max(0, dailyFollowersTarget - dailyFollowersGiven);
        if (likesRemaining <= 0 && followersRemaining <= 0) {
            plan.dailyDaysProcessed++;
            continue;
        }
        var likesAdd = Math.max(0, Math.floor(likesRemaining / daysLeft));
        var followersAdd = Math.max(0, Math.floor(followersRemaining / daysLeft));
        if (daysLeft === 1) {
            likesAdd = likesRemaining;
            followersAdd = followersRemaining;
        } else {
            likesAdd += Math.floor(Math.random() * 3);
            followersAdd += Math.floor(Math.random() * 2);
            if (likesAdd > likesRemaining) likesAdd = likesRemaining;
            if (followersAdd > followersRemaining) followersAdd = followersRemaining;
        }
        if (applyPostEngagementDelta(vars, post, likesAdd, followersAdd, 'daily')) modified = true;
        plan.dailyDaysProcessed++;
    }
    if (modified && typeof persistPhoneChanges === 'function') persistPhoneChanges();
}

function getPostById(vars, postId) {
    var posts = vars.phoneFotogramPosts || [];
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === postId) return posts[i];
    }
    return null;
}

function pickMessageForFlags(byFlag) {
    if (!byFlag || typeof byFlag !== 'object') return null;
    var flags = ['spicy', 'bikini', 'risky', 'hips', 'ass', 'boobs', 'hot', 'teasing', 'default'];
    for (var f = 0; f < flags.length; f++) {
        var arr = byFlag[flags[f]];
        if (Array.isArray(arr) && arr.length > 0) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }
    return null;
}

function getBestFlagMatch(postFlags) {
    var order = ['spicy', 'bikini', 'risky', 'hips', 'ass', 'boobs', 'hot', 'teasing'];
    for (var i = 0; i < order.length; i++) {
        if (postFlags && postFlags.indexOf(order[i]) >= 0) return order[i];
    }
    return 'default';
}

/**
 * Pick one item from pool: prefer indices not yet used; when all used, reset and pick random.
 * Reduces back-to-back repeats when pool is large.
 * @param {object} vars - State.variables (will store used indices under storageKey)
 * @param {string} storageKey - e.g. 'phoneFotogramCommentUsedNameIndices'
 * @param {Array} poolArray - full pool of options
 * @returns {*} one element from poolArray, or null if pool empty
 */
function pickFromPoolWithUnusedPreference(vars, storageKey, poolArray) {
    if (!poolArray || !Array.isArray(poolArray) || poolArray.length === 0) return null;
    if (!vars) return poolArray[Math.floor(Math.random() * poolArray.length)];
    var used = vars[storageKey];
    if (!Array.isArray(used)) used = [];
    var unusedIndices = [];
    for (var i = 0; i < poolArray.length; i++) {
        if (used.indexOf(i) < 0) unusedIndices.push(i);
    }
    if (unusedIndices.length === 0) {
        used = [];
        for (i = 0; i < poolArray.length; i++) unusedIndices.push(i);
    }
    var idx = unusedIndices[Math.floor(Math.random() * unusedIndices.length)];
    used.push(idx);
    vars[storageKey] = used;
    return poolArray[idx];
}

function getFotogramDmVarietyConfig() {
    var cfg = (typeof setup !== 'undefined' && setup && typeof setup === 'object') ? setup : {};
    var num = function (key, fallback) {
        var v = Number(cfg[key]);
        return Number.isFinite(v) ? v : fallback;
    };
    var earlyPools = Array.isArray(cfg.fotogramDMAttachmentPoolsEarly) && cfg.fotogramDMAttachmentPoolsEarly.length
        ? cfg.fotogramDMAttachmentPoolsEarly.slice()
        : ['spicy'];
    var midPools = Array.isArray(cfg.fotogramDMAttachmentPoolsMid) && cfg.fotogramDMAttachmentPoolsMid.length
        ? cfg.fotogramDMAttachmentPoolsMid.slice()
        : ['spicy', 'sexting', 'cock', 'cum', 'female_masturbation'];
    var latePools = Array.isArray(cfg.fotogramDMAttachmentPoolsLate) && cfg.fotogramDMAttachmentPoolsLate.length
        ? cfg.fotogramDMAttachmentPoolsLate.slice()
        : ['sexting', 'spicy', 'cock', 'cum', 'female_masturbation'];
    return {
        recentScenarioWindow: Math.max(1, Math.floor(num('fotogramDmScenarioRecentWindow', 4))),
        recentScenarioPenalty: Math.max(0, Math.min(0.95, num('fotogramDmScenarioRecentPenalty', 0.55))),
        textRecentWindow: Math.max(2, Math.floor(num('fotogramDmNodeTextRecentWindow', 8))),
        textStrictTurns: Math.max(0, Math.floor(num('fotogramDmNodeTextStrictTurns', 2))),
        attachmentRecentWindow: Math.max(1, Math.floor(num('fotogramDmAttachmentRecentWindow', 6))),
        stageHeatMid: Math.max(1, Math.floor(num('fotogramDmAttachmentStageHeatMid', 3))),
        stageHeatLate: Math.max(1, Math.floor(num('fotogramDmAttachmentStageHeatLate', 6))),
        stageTrustLate: Math.max(0, Math.floor(num('fotogramDmAttachmentStageTrustLate', 3))),
        attachmentPoolsEarly: earlyPools,
        attachmentPoolsMid: midPools,
        attachmentPoolsLate: latePools,
        dynamicAttachmentChanceEarly: Math.max(0, Math.min(1, num('fotogramDmDynamicAttachmentChanceEarly', 0.08))),
        dynamicAttachmentChanceMid: Math.max(0, Math.min(1, num('fotogramDmDynamicAttachmentChanceMid', 0.18))),
        dynamicAttachmentChanceLate: Math.max(0, Math.min(1, num('fotogramDmDynamicAttachmentChanceLate', 0.32)))
    };
}

function getFotogramDmPersonaWeights() {
    var cfg = (typeof setup !== 'undefined' && setup && typeof setup === 'object') ? setup : {};
    var weights = (cfg.fotogramDMPersonaWeights && typeof cfg.fotogramDMPersonaWeights === 'object')
        ? cfg.fotogramDMPersonaWeights
        : { dominant: 35, playful: 30, manipulative: 15, soft: 20 };
    return {
        dominant: Math.max(0, Number(weights.dominant) || 0),
        playful: Math.max(0, Number(weights.playful) || 0),
        manipulative: Math.max(0, Number(weights.manipulative) || 0),
        soft: Math.max(0, Number(weights.soft) || 0)
    };
}

function getFotogramDmMediaBehaviorWeights() {
    var cfg = (typeof setup !== 'undefined' && setup && typeof setup === 'object') ? setup : {};
    var weights = (cfg.fotogramDMMediaBehaviorWeights && typeof cfg.fotogramDMMediaBehaviorWeights === 'object')
        ? cfg.fotogramDMMediaBehaviorWeights
        : { text_only: 35, media_only: 20, mixed: 45 };
    return {
        text_only: Math.max(0, Number(weights.text_only) || 0),
        media_only: Math.max(0, Number(weights.media_only) || 0),
        mixed: Math.max(0, Number(weights.mixed) || 0)
    };
}

function pickWeightedKey(weightObj, fallbackKey) {
    if (!weightObj || typeof weightObj !== 'object') return fallbackKey || null;
    var keys = Object.keys(weightObj);
    var rows = [];
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var w = Number(weightObj[k]);
        if (!Number.isFinite(w) || w <= 0) continue;
        rows.push({ key: k, weight: w });
        total += w;
    }
    if (!rows.length || total <= 0) return fallbackKey || null;
    var roll = Math.random() * total;
    var acc = 0;
    for (i = 0; i < rows.length; i++) {
        acc += rows[i].weight;
        if (roll < acc) return rows[i].key;
    }
    return rows[rows.length - 1].key;
}

function pickFotogramDmPersonaType() {
    return pickWeightedKey(getFotogramDmPersonaWeights(), 'playful') || 'playful';
}

function pickFotogramDmMediaBehavior() {
    return pickWeightedKey(getFotogramDmMediaBehaviorWeights(), 'mixed') || 'mixed';
}

function pickFromPoolWithRecentIndexCooldown(vars, storageKey, poolArray, recentWindow) {
    if (!Array.isArray(poolArray) || poolArray.length === 0) return null;
    if (!vars) return poolArray[Math.floor(Math.random() * poolArray.length)];
    var recent = vars[storageKey];
    if (!Array.isArray(recent)) recent = [];
    var blocked = {};
    for (var i = 0; i < recent.length; i++) blocked[recent[i]] = true;
    var candidates = [];
    for (i = 0; i < poolArray.length; i++) {
        if (!blocked[i]) candidates.push(i);
    }
    if (!candidates.length) {
        for (i = 0; i < poolArray.length; i++) candidates.push(i);
    }
    var idx = candidates[Math.floor(Math.random() * candidates.length)];
    recent.push(idx);
    var keep = Math.max(1, Math.floor(recentWindow || 6));
    if (recent.length > keep) recent = recent.slice(recent.length - keep);
    vars[storageKey] = recent;
    return poolArray[idx];
}

function createFotogramCommentForPost(vars, post) {
    var postFlags = (post && post.flags) ? post.flags : [];
    var flagKey = getBestFlagMatch(postFlags);
    var templates = (typeof setup !== 'undefined' && setup.fotogramCommentTemplates && typeof setup.fotogramCommentTemplates === 'object')
        ? setup.fotogramCommentTemplates
        : null;
    if (!templates) return null;
    var byFlag = templates[flagKey];
    if (!Array.isArray(byFlag) || byFlag.length === 0) byFlag = templates.default;
    if (!Array.isArray(byFlag) || byFlag.length === 0) return null;
    var authorPool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramCommentNames) && setup.fotogramCommentNames.length)
        ? setup.fotogramCommentNames
        : null;
    if (!Array.isArray(authorPool) || authorPool.length === 0) return null;
    var author = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramCommentUsedNameIndices', authorPool) || authorPool[Math.floor(Math.random() * authorPool.length)])
        : (authorPool[Math.floor(Math.random() * authorPool.length)]);
    var textKey = 'phoneFotogramCommentUsedText_' + flagKey;
    var text = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, textKey, byFlag) || byFlag[Math.floor(Math.random() * byFlag.length)])
        : (byFlag[Math.floor(Math.random() * byFlag.length)]);
    author = author || 'user';
    text = text || 'Nice!';
    var t = vars && vars.timeSys ? vars.timeSys : {};
    return {
        id: 'fgc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        user: author,
        text: text,
        time: { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute }
    };
}

function getFotogramDmAgeRange() {
    var ageMin = getFotogramSetupNumber('fotogramDmAgeMin');
    var ageMax = getFotogramSetupNumber('fotogramDmAgeMax');
    if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) return null;
    if (ageMax < ageMin) { var t = ageMax; ageMax = ageMin; ageMin = t; }
    return { min: ageMin, max: ageMax };
}

function getFotogramDmThresholds() {
    var minConfidence = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMinConfidenceInteractive)))
        ? Number(setup.fotogramDmMinConfidenceInteractive)
        : null;
    var minCorruptionSwap = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMinCorruptionSwap)))
        ? Number(setup.fotogramDmMinCorruptionSwap)
        : null;
    if (!Number.isFinite(minConfidence) || !Number.isFinite(minCorruptionSwap)) return null;
    return {
        minConfidenceInteractive: Math.max(0, minConfidence),
        minCorruptionSwap: Math.max(0, minCorruptionSwap)
    };
}

function canUseInteractiveFotogramDm(vars) {
    var thresholds = getFotogramDmThresholds();
    if (!thresholds) return false;
    var confidence = Number(vars && vars.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    return confidence >= thresholds.minConfidenceInteractive;
}

function canUseSwapInFotogramDm(vars) {
    var thresholds = getFotogramDmThresholds();
    if (!thresholds) return false;
    var corruption = Number(vars && vars.corruption);
    if (!Number.isFinite(corruption)) corruption = 0;
    return corruption >= thresholds.minCorruptionSwap;
}

function normalizeGenderLabel(raw) {
    var v = String(raw || '').toLowerCase();
    if (v === 'male' || v === 'm') return 'Male';
    if (v === 'female' || v === 'f') return 'Female';
    return 'Unknown';
}

function pickFotogramDmProfile(vars, charId) {
    var profile = { gender: 'Unknown', age: null };
    var currentYear = (vars && vars.timeSys && Number(vars.timeSys.year)) || 2024;
    var ageRange = getFotogramDmAgeRange();
    if (!ageRange) return { gender: 'Unknown', age: null };
    var def = null;
    if (charId && typeof setup !== 'undefined' && setup.characterDefs && setup.characterDefs[charId]) {
        def = setup.characterDefs[charId];
    }
    if (def && def.gender) profile.gender = normalizeGenderLabel(def.gender);
    if (def && def.birthYear && Number.isFinite(Number(def.birthYear))) {
        var knownAge = currentYear - Number(def.birthYear);
        if (knownAge >= ageRange.min && knownAge <= ageRange.max) profile.age = knownAge;
    }
    if (profile.gender === 'Unknown') {
        var maleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMaleWeight)))
            ? Number(setup.fotogramDmMaleWeight)
            : null;
        var femaleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmFemaleWeight)))
            ? Number(setup.fotogramDmFemaleWeight)
            : null;
        if (!Number.isFinite(maleW) || maleW < 0) return { gender: 'Unknown', age: null };
        if (!Number.isFinite(femaleW) || femaleW < 0) return { gender: 'Unknown', age: null };
        var totalW = maleW + femaleW;
        if (totalW <= 0) return { gender: 'Unknown', age: null };
        var picked = Math.random() < (maleW / totalW) ? 'male' : 'female';
        profile.gender = normalizeGenderLabel(picked);
    }
    if (!Number.isFinite(Number(profile.age)) || Number(profile.age) < ageRange.min || Number(profile.age) > ageRange.max) {
        profile.age = ageRange.min + Math.floor(Math.random() * (ageRange.max - ageRange.min + 1));
    }
    return { gender: profile.gender, age: Number(profile.age) };
}

function normalizeFotogramDmToneGender(rawGender) {
    var g = String(rawGender || '').toLowerCase();
    if (g === 'female' || g === 'f') return 'female';
    if (g === 'male' || g === 'm') return 'male';
    return null;
}

function getFotogramDmScenarioTypes() {
    if (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMScenarioTypes) && setup.fotogramDMScenarioTypes.length) {
        return setup.fotogramDMScenarioTypes.slice();
    }
    return [];
}

function getFotogramDmScenarioWeights(flagKey) {
    var cfg = (typeof setup !== 'undefined' && setup.fotogramDMScenarioWeightsByFlag && typeof setup.fotogramDMScenarioWeightsByFlag === 'object')
        ? setup.fotogramDMScenarioWeightsByFlag
        : null;
    var w = (cfg && cfg[flagKey] && typeof cfg[flagKey] === 'object')
        ? cfg[flagKey]
        : (cfg && cfg.default && typeof cfg.default === 'object')
            ? cfg.default
            : null;
    if (w) return w;
    return null;
}

function pickFotogramDmScenarioType(flagKey, vars) {
    var types = getFotogramDmScenarioTypes();
    if (!types.length) return null;
    var weights = getFotogramDmScenarioWeights(flagKey);
    if (!weights || typeof weights !== 'object') return null;
    var varietyCfg = getFotogramDmVarietyConfig();
    var recentKey = 'phoneFotogramRecentScenarioTypes';
    var recent = (vars && Array.isArray(vars[recentKey])) ? vars[recentKey] : [];
    var recentMap = {};
    for (var ri = 0; ri < recent.length; ri++) recentMap[String(recent[ri])] = true;
    var total = 0;
    var rows = [];
    for (var i = 0; i < types.length; i++) {
        var key = types[i];
        var weight = Number(weights && weights[key]);
        if (!Number.isFinite(weight) || weight <= 0) continue;
        if (recentMap[String(key)]) {
            weight = weight * (1 - varietyCfg.recentScenarioPenalty);
        }
        if (weight <= 0) continue;
        total += weight;
        rows.push({ key: key, weight: weight });
    }
    if (total <= 0 || rows.length === 0) {
        return null;
    }
    var roll = Math.random() * total;
    var acc = 0;
    for (var r = 0; r < rows.length; r++) {
        acc += rows[r].weight;
        if (roll < acc) {
            if (vars) {
                var updated = Array.isArray(vars[recentKey]) ? vars[recentKey].slice() : [];
                updated.push(rows[r].key);
                if (updated.length > varietyCfg.recentScenarioWindow) {
                    updated = updated.slice(updated.length - varietyCfg.recentScenarioWindow);
                }
                vars[recentKey] = updated;
            }
            return rows[r].key;
        }
    }
    var chosen = rows[rows.length - 1].key;
    if (vars) {
        var tail = Array.isArray(vars[recentKey]) ? vars[recentKey].slice() : [];
        tail.push(chosen);
        if (tail.length > varietyCfg.recentScenarioWindow) tail = tail.slice(tail.length - varietyCfg.recentScenarioWindow);
        vars[recentKey] = tail;
    }
    return chosen;
}

function getFotogramScenarioOpenerPool(flagKey, scenarioType, toneGender, anonType) {
    var cfg = (typeof setup !== 'undefined' && setup.fotogramDMScenarioOpeners && typeof setup.fotogramDMScenarioOpeners === 'object')
        ? setup.fotogramDMScenarioOpeners
        : null;
    if (!cfg) return null;
    var cfgLayer = (anonType && cfg.byType && typeof cfg.byType[anonType] === 'object') ? cfg.byType[anonType] : cfg;
    var byFlag = (cfgLayer[flagKey] && typeof cfgLayer[flagKey] === 'object') ? cfgLayer[flagKey] : cfgLayer.default;
    if (!byFlag || typeof byFlag !== 'object') return null;
    var byScenario = (byFlag[scenarioType] && typeof byFlag[scenarioType] === 'object') ? byFlag[scenarioType] : byFlag.default;
    if (!byScenario) return null;
    if (Array.isArray(byScenario) && byScenario.length) return byScenario;
    if (typeof byScenario !== 'object') return null;
    var toneKey = toneGender === 'female' ? 'female' : 'male';
    var pool = (Array.isArray(byScenario[toneKey]) && byScenario[toneKey].length)
        ? byScenario[toneKey]
        : (Array.isArray(byScenario.default) && byScenario.default.length)
            ? byScenario.default
            : (Array.isArray(byScenario.any) && byScenario.any.length)
                ? byScenario.any
                : null;
    return pool;
}

function pickFotogramScenarioFirstMessage(vars, flagKey, scenarioType, toneGender, anonType) {
    var pool = getFotogramScenarioOpenerPool(flagKey, scenarioType, toneGender, anonType);
    if (!Array.isArray(pool) || pool.length === 0) return null;
    var useKey = 'phoneFotogramDMUsedScenarioFirstMsg_' + String(flagKey || 'default') + '_' + String(scenarioType || 'default') + '_' + String(toneGender || 'male') + '_' + String(anonType || '');
    return (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, useKey, pool) || pool[Math.floor(Math.random() * pool.length)])
        : pool[Math.floor(Math.random() * pool.length)];
}

function generateFotogramDmId(existingDms) {
    var dms = Array.isArray(existingDms) ? existingDms : [];
    var used = {};
    for (var i = 0; i < dms.length; i++) {
        if (dms[i] && dms[i].id) used[String(dms[i].id)] = true;
    }
    var candidate = null;
    var tries = 0;
    do {
        candidate = 'fotodm_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        tries++;
    } while (used[candidate] && tries < 20);
    return candidate;
}

function createFotogramDM(vars, post, opts) {
    opts = opts || {};
    var isInteractive = opts.interactive !== false;
    var dms = vars.phoneFotogramDMs || [];
    var anonNames = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramAnonNames) && setup.fotogramAnonNames.length)
        ? setup.fotogramAnonNames
        : null;
    if (!Array.isArray(anonNames) || anonNames.length === 0) return null;
    var byFlag = (typeof setup !== 'undefined' && setup.fotogramDMMessagesByFlag && typeof setup.fotogramDMMessagesByFlag === 'object')
        ? setup.fotogramDMMessagesByFlag
        : null;
    var charConfig = (typeof setup !== 'undefined' && setup.fotogramAnonCharConfig) ? setup.fotogramAnonCharConfig : {};
    var postFlags = post.flags || [];
    var flagKey = getBestFlagMatch(postFlags);
    var charId = null;
    var skinTone;
    var firstMsg;
    var scenarioType = null;
    var pool = (typeof setup !== 'undefined' && setup.fotogramAnonCharPool) ? setup.fotogramAnonCharPool : [];
    if (Array.isArray(pool) && pool.length > 0) {
        charId = pool[Math.floor(Math.random() * pool.length)];
    } else if (pool && typeof pool === 'object' && !Array.isArray(pool)) {
        var keys = Object.keys(pool);
        if (keys.length > 0) charId = pool[keys[Math.floor(Math.random() * keys.length)]];
    }
    var cfg = charId && charConfig[charId] ? charConfig[charId] : null;
    var dmProfile = pickFotogramDmProfile(vars, charId);
    var toneGender = normalizeFotogramDmToneGender(dmProfile.gender) || 'male';
    if (cfg && cfg.skinTone) {
        skinTone = cfg.skinTone;
    } else {
        var skinTones = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramAnonSkinTones) && setup.fotogramAnonSkinTones.length)
            ? setup.fotogramAnonSkinTones
            : null;
        if (!Array.isArray(skinTones) || skinTones.length === 0) return null;
        skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    }
    if (!isInteractive) {
        var encouragingMsgs = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingMessages) && setup.fotogramDMEncouragingMessages.length)
            ? setup.fotogramDMEncouragingMessages
            : null;
        if (!Array.isArray(encouragingMsgs) || encouragingMsgs.length === 0) return null;
        firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedEncouragingIndices', encouragingMsgs) || encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)])
            : (encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)]);
        if (!firstMsg) return null;
        charId = null;
    } else if (cfg && cfg.firstMessagesByFlag && cfg.firstMessagesByFlag[flagKey] && cfg.firstMessagesByFlag[flagKey].length) {
        var charPool = cfg.firstMessagesByFlag[flagKey];
        var charMsgKey = 'phoneFotogramDMUsedFirstMsgChar_' + (charId || '') + '_' + flagKey;
        firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, charMsgKey, charPool) || charPool[Math.floor(Math.random() * charPool.length)])
            : (charPool[Math.floor(Math.random() * charPool.length)]);
    } else {
        scenarioType = pickFotogramDmScenarioType(flagKey, vars);
        var anonType = pickFotogramAnonType(vars);
        firstMsg = pickFotogramScenarioFirstMessage(vars, flagKey, scenarioType, toneGender, anonType);
        if (!firstMsg && byFlag && Array.isArray(byFlag[flagKey]) && byFlag[flagKey].length) {
            var globalMsgKey = 'phoneFotogramDMUsedFirstMsg_' + flagKey;
            firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
                ? (pickFromPoolWithUnusedPreference(vars, globalMsgKey, byFlag[flagKey]) || byFlag[flagKey][Math.floor(Math.random() * byFlag[flagKey].length)])
                : (byFlag[flagKey][Math.floor(Math.random() * byFlag[flagKey].length)]);
        }
        if (!firstMsg) return null;
    }
    var anonName = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedAnonNameIndices', anonNames) || anonNames[Math.floor(Math.random() * anonNames.length)])
        : (anonNames[Math.floor(Math.random() * anonNames.length)]);
    var dmId = generateFotogramDmId(dms);
    var startReplyKeys = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMStartReplyKeys) && setup.fotogramDMStartReplyKeys.length)
        ? setup.fotogramDMStartReplyKeys.slice()
        : [];
    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    var scenarioFlow = (isInteractive && scenarioType) ? getFotogramScenarioFlow(scenarioType) : null;
    if (!scenarioFlow && isInteractive) {
        var fallbackTypes = getFotogramDmScenarioTypes();
        for (var fti = 0; fti < (fallbackTypes || []).length; fti++) {
            scenarioFlow = getFotogramScenarioFlow(fallbackTypes[fti]);
            if (scenarioFlow) { scenarioType = fallbackTypes[fti]; break; }
        }
    }
    var startNode = scenarioFlow ? getFotogramScenarioNode(scenarioFlow, scenarioFlow.startNode) : null;
    var startChoiceSource = startNode ? (startNode.choices || []) : [];
    if (startNode && startNode.choicesByContext && startNode.choicesByContext.receivedDickPic && isInteractive && typeof anonType !== 'undefined' && anonType === 6 && toneGender === 'male') {
        startChoiceSource = startNode.choicesByContext.receivedDickPic;
    }
    var startChoices = startNode ? normalizeFotogramScenarioChoices(startChoiceSource, vars, scenarioFlow ? scenarioFlow.startNode : null, scenarioType) : [];
    var minMsgNew = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMMinTotalMessages)) ? setup.fotogramDMMinTotalMessages : 10;
    if (startChoices.length && 1 + 2 < minMsgNew) {
        startChoices = startChoices.filter(function (c) {
            var n = c.next ? getFotogramScenarioNode(scenarioFlow, c.next) : null;
            return !n || n.endConversation !== true;
        });
    }
    var personaType = isInteractive ? pickFotogramDmPersonaType() : null;
    var mediaBehavior = isInteractive ? pickFotogramDmMediaBehavior() : null;
    var dm = {
        id: dmId,
        postId: post.id,
        anonId: dmId,
        anonName: anonName,
        skinTone: skinTone,
        charId: charId,
        blocked: false,
        messages: [{ from: dmId, text: firstMsg, time: time, read: false }],
        availableReplyKeys: isInteractive ? (startChoices.length ? startChoices.map(function (c) { return c.key; }) : startReplyKeys) : [],
        isInteractive: isInteractive,
        simpleThanksSent: false,
        profileGender: dmProfile.gender,
        profileAge: dmProfile.age,
        toneGender: toneGender,
        personaType: personaType,
        mediaBehavior: mediaBehavior,
        anonType: isInteractive ? (typeof anonType !== 'undefined' ? anonType : pickFotogramAnonType(vars)) : null,
        scenarioType: isInteractive ? (scenarioType || 'legacy') : null,
        flowState: isInteractive ? {
            heat: 1,
            trust: 0,
            control: 0,
            pushiness: (personaType === 'dominant' || personaType === 'manipulative') ? 1 : 0,
            ghostRisk: 0,
            swapOpen: false,
            turn: 0,
            currentNode: scenarioFlow ? scenarioFlow.startNode : null,
            currentChoices: startChoices
        } : null,
        promotedToCharId: null
    };
    if (isInteractive && dm.anonType === 6 && toneGender === 'male' && dm.messages && dm.messages[0]) {
        if (typeof attachFotogramDmPhotoToMessage === 'function') {
            attachFotogramDmPhotoToMessage(dm, cfg, flagKey, { pool: 'cock' }, dm.messages[0], vars);
        }
    }
    dms.push(dm);
    if (dms.length > 50) dms.splice(0, dms.length - 50);
    vars.phoneFotogramDMs = dms;
    if (typeof State !== 'undefined' && State.variables && State.variables === vars) {
        State.variables.phoneFotogramDMs = dms;
    }
    return dm;
}

function addFotogramNotification(vars, type, refId) {
    if (!vars.phoneNotifications) vars.phoneNotifications = { fotogram: [], finder: [] };
    if (!vars.phoneNotifications.fotogram) vars.phoneNotifications.fotogram = [];
    vars.phoneNotifications.fotogram.push({ id: 'fgnotif_' + Date.now(), type: type, refId: refId });
}

function getFotogramDMById(vars, dmId) {
    var dms = vars.phoneFotogramDMs || [];
    for (var i = 0; i < dms.length; i++) {
        if (dms[i].id === dmId) return dms[i];
    }
    return null;
}

function getActiveFotogramDMs(vars) {
    var dms = vars.phoneFotogramDMs || [];
    return dms.filter(function (dm) { return !dm.promotedToCharId && !dm.blocked; });
}

function countUnreadFotogramDmMessages(dm) {
    if (!dm || !Array.isArray(dm.messages)) return 0;
    var count = 0;
    for (var i = 0; i < dm.messages.length; i++) {
        var m = dm.messages[i];
        if (!m) continue;
        if (m.from !== 'me' && m.read !== true) count++;
    }
    return count;
}

function getUnreadFotogramDmCount(vars) {
    var dms = getActiveFotogramDMs(vars);
    var unreadThreads = 0;
    for (var i = 0; i < dms.length; i++) {
        if (countUnreadFotogramDmMessages(dms[i]) > 0) unreadThreads++;
    }
    return unreadThreads;
}

function markFotogramDmAsRead(dm) {
    if (!dm || !Array.isArray(dm.messages)) return false;
    var changed = false;
    for (var i = 0; i < dm.messages.length; i++) {
        var m = dm.messages[i];
        if (!m) continue;
        if (m.from !== 'me' && m.read !== true) {
            m.read = true;
            changed = true;
        }
    }
    return changed;
}

window.markFotogramDmThreadAsRead = function (vars, dmId) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm) return false;
    return markFotogramDmAsRead(dm);
};

function escapeHtmlFg(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatFotogramCount(n) {
    var num = Math.floor(Number(n) || 0);
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(num);
}

function getFotogramAvatarHue(seed) {
    var str = String(seed || 'user');
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 360;
}

function renderFotogramAvatar(name, skinTone, extraClass) {
    var label = String(name || 'User').trim() || 'User';
    var initial = label.charAt(0).toUpperCase();
    var hue = getFotogramAvatarHue(label);
    var cls = extraClass ? (' ' + extraClass) : '';
    var toneAttr = skinTone ? (' data-tone="' + escapeHtmlFg(skinTone) + '"') : '';
    return '<span class="phone-fotogram-avatar' + cls + '"' + toneAttr + ' style="--avatar-h:' + hue + ';"><span class="phone-fotogram-avatar-initial">' + escapeHtmlFg(initial) + '</span></span>';
}

function getFotogramQuickReplies() {
    if (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMQuickReplies) && setup.fotogramDMQuickReplies.length) {
        return setup.fotogramDMQuickReplies;
    }
    return [];
}

function getFotogramEncouragingReplyMessage() {
    var pool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingReplyMessages) && setup.fotogramDMEncouragingReplyMessages.length)
        ? setup.fotogramDMEncouragingReplyMessages
        : null;
    if (!Array.isArray(pool) || pool.length === 0) return '';
    return pool[Math.floor(Math.random() * pool.length)] || '';
}

function getNextFotogramReplyKeys(reply, flagKey) {
    if (!reply) return null;
    if (reply.nextReplyKeysByFlag && typeof reply.nextReplyKeysByFlag === 'object') {
        if (Array.isArray(reply.nextReplyKeysByFlag[flagKey])) return reply.nextReplyKeysByFlag[flagKey].slice();
        if (Array.isArray(reply.nextReplyKeysByFlag.default)) return reply.nextReplyKeysByFlag.default.slice();
    }
    if (Array.isArray(reply.nextReplyKeys)) return reply.nextReplyKeys.slice();
    if (typeof reply.nextReplyKey === 'string' && reply.nextReplyKey) return [reply.nextReplyKey];
    return null;
}

function getFotogramScenarioFlows() {
    return (typeof setup !== 'undefined' && setup.fotogramDMScenarioFlows && typeof setup.fotogramDMScenarioFlows === 'object')
        ? setup.fotogramDMScenarioFlows
        : null;
}

function getFotogramDmRuntimeConfig() {
    return (typeof setup !== 'undefined' && setup && setup.fotogramDMRuntimeConfig && typeof setup.fotogramDMRuntimeConfig === 'object')
        ? setup.fotogramDMRuntimeConfig
        : null;
}

function getFotogramDmRuntimeText(key) {
    var cfg = getFotogramDmRuntimeConfig();
    if (!cfg || !cfg.text || typeof cfg.text !== 'object') return '';
    var val = cfg.text[key];
    return (typeof val === 'string') ? val : '';
}

function getFotogramDmLegacyReplyKeys() {
    var cfg = getFotogramDmRuntimeConfig();
    if (!cfg || !Array.isArray(cfg.legacyReplyKeys)) return [];
    return cfg.legacyReplyKeys.slice();
}

function getFotogramDmSwapKeywordHints() {
    var cfg = getFotogramDmRuntimeConfig();
    if (!cfg || !Array.isArray(cfg.swapKeywordHints)) return [];
    return cfg.swapKeywordHints.map(function (k) { return String(k || '').toLowerCase(); }).filter(Boolean);
}

function hasFotogramScenarioConfigLoaded() {
    var flows = getFotogramScenarioFlows();
    return !!(flows && typeof flows === 'object' && Object.keys(flows).length > 0);
}

function getFotogramScenarioFlow(scenarioType) {
    var flows = getFotogramScenarioFlows();
    if (!flows || !scenarioType || !flows[scenarioType]) return null;
    return flows[scenarioType];
}

function getFotogramScenarioNode(flow, nodeId) {
    if (!flow || !flow.nodes || !nodeId) return null;
    return flow.nodes[nodeId] || null;
}

function pickFotogramAnonType(vars) {
    var weights = (typeof setup !== 'undefined' && setup.fotogramDMAnonTypeWeights && typeof setup.fotogramDMAnonTypeWeights === 'object')
        ? setup.fotogramDMAnonTypeWeights
        : { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
    var recentWindow = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMAnonTypeRecentWindow)) ? Math.max(1, setup.fotogramDMAnonTypeRecentWindow) : 5;
    var recentPenalty = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMAnonTypeRecentPenalty)) ? Math.max(0, Math.min(1, setup.fotogramDMAnonTypeRecentPenalty)) : 0.25;
    var dms = (vars && Array.isArray(vars.phoneFotogramDMs)) ? vars.phoneFotogramDMs : [];
    var recentTypes = [];
    for (var ri = Math.max(0, dms.length - recentWindow); ri < dms.length; ri++) {
        if (dms[ri] && dms[ri].anonType) recentTypes.push(Number(dms[ri].anonType));
    }
    var effectiveWeights = {};
    var types = [1, 2, 3, 4, 5, 6];
    for (var k = 0; k < types.length; k++) {
        var base = Number(weights[types[k]]) || 0;
        var penalty = 1;
        for (var rj = 0; rj < recentTypes.length; rj++) {
            if (recentTypes[rj] === types[k]) penalty *= recentPenalty;
        }
        effectiveWeights[types[k]] = base * penalty;
    }
    var total = 0;
    for (var ti = 0; ti < types.length; ti++) total += effectiveWeights[types[ti]];
    if (total <= 0) return types[Math.floor(Math.random() * types.length)];
    var r = Math.random() * total;
    for (var tj = 0; tj < types.length; tj++) {
        var w = effectiveWeights[types[tj]];
        if (r < w) return types[tj];
        r -= w;
    }
    return types[types.length - 1];
}

function getFotogramScenarioToneText(source, toneGender, flagKey) {
    if (!source) return '';
    var pickFromArray = function (arr) {
        if (!Array.isArray(arr) || arr.length === 0) return '';
        return arr[Math.floor(Math.random() * arr.length)] || '';
    };
    if (typeof source === 'string') return source;
    if (Array.isArray(source)) return pickFromArray(source);
    if (typeof source !== 'object') return '';
    var byFlag = source[flagKey];
    if (byFlag) return getFotogramScenarioToneText(byFlag, toneGender, flagKey);
    if (source[toneGender]) return getFotogramScenarioToneText(source[toneGender], toneGender, flagKey);
    if (source.default) return getFotogramScenarioToneText(source.default, toneGender, flagKey);
    if (source.any) return getFotogramScenarioToneText(source.any, toneGender, flagKey);
    return '';
}

function getFotogramScenarioTonePool(source, toneGender, flagKey) {
    if (!source) return [];
    if (typeof source === 'string') return [source];
    if (Array.isArray(source)) return source.slice();
    if (typeof source !== 'object') return [];
    var byFlag = source[flagKey];
    if (byFlag) return getFotogramScenarioTonePool(byFlag, toneGender, flagKey);
    if (source[toneGender]) return getFotogramScenarioTonePool(source[toneGender], toneGender, flagKey);
    if (source.default) return getFotogramScenarioTonePool(source.default, toneGender, flagKey);
    if (source.any) return getFotogramScenarioTonePool(source.any, toneGender, flagKey);
    return [];
}

function pickFromSimplePool(pool) {
    if (!Array.isArray(pool) || pool.length === 0) return '';
    return String(pool[Math.floor(Math.random() * pool.length)] || '');
}

function applyPersonaLanguageOverlay(vars, dm, text, nodeId) {
    var base = String(text || '').trim();
    if (!base || !dm) return base;
    var persona = String(dm.personaType || 'playful');
    var tone = String(dm.toneGender || 'male');
    var scenario = String(dm.scenarioType || '');
    var addons = (typeof setup !== 'undefined' && setup && setup.fotogramDMPersonaAddons && typeof setup.fotogramDMPersonaAddons === 'object')
        ? setup.fotogramDMPersonaAddons
        : null;

    var personaPool = (addons && Array.isArray(addons[persona]) && addons[persona].length)
        ? addons[persona]
        : [];

    var skipPersonaAddon = (base.length < 45) || (typeof nodeId === 'string' && (
        nodeId.indexOf('chat_min_continuation') >= 0 || nodeId === 'chat_end_soft'
    ));
    var chance = skipPersonaAddon ? 0 : ((persona === 'dominant' || persona === 'manipulative') ? 0.45 : 0.22);
    if (Math.random() < chance) {
        var addon = pickFromSimplePool(personaPool);
        if (addon) base += ' ' + addon;
    }

    // Anatomy language mix: dickpic flow + chat_open types 1,2,6 (getoff, objectifier, unsolicited_sender).
    var anonType = dm.anonType ? Number(dm.anonType) : 0;
    var useExplicit = (scenario === 'dickpic_open') || (scenario === 'chat_open' && (anonType === 1 || anonType === 2 || anonType === 6));
    if (useExplicit) {
        var toneKey = (tone === 'female') ? 'female' : 'male';
        var runtimeCfg = getFotogramDmRuntimeConfig();
        var chanceByTone = (runtimeCfg && runtimeCfg.explicitOverlayChanceByTone && typeof runtimeCfg.explicitOverlayChanceByTone === 'object')
            ? runtimeCfg.explicitOverlayChanceByTone
            : null;
        var explicitMixChance = Number(chanceByTone && chanceByTone[toneKey]);
        if (!Number.isFinite(explicitMixChance)) explicitMixChance = (toneKey === 'female') ? 0.24 : 0.35;
        if (scenario === 'chat_open') explicitMixChance = Math.min(0.5, explicitMixChance * 1.2);
        if (Math.random() < explicitMixChance) {
            var explicitPools = (typeof setup !== 'undefined' && setup && setup.fotogramDMExplicitOverlayPools)
                ? setup.fotogramDMExplicitOverlayPools
                : null;
            var scenarioKey = scenario === 'dickpic_open' ? 'dickpic_open' : 'chat_open';
            var tonePools = (explicitPools && explicitPools[toneKey] && explicitPools[toneKey][scenarioKey])
                ? explicitPools[toneKey][scenarioKey]
                : (explicitPools && explicitPools[toneKey] && explicitPools[toneKey].dickpic_open)
                ? explicitPools[toneKey].dickpic_open
                : null;
            var directPool = (tonePools && Array.isArray(tonePools.direct))
                ? tonePools.direct
                : ['cock', 'dick', 'cum', 'hard'];
            var euphemismPool = (tonePools && Array.isArray(tonePools.euphemism))
                ? tonePools.euphemism
                : ['it', 'this', 'something for you'];
            var mixRoll = Math.random();
            var chosen = mixRoll < 0.45 ? pickFromSimplePool(directPool) : pickFromSimplePool(euphemismPool);
            if (chosen) base += ' ' + chosen;
        }
    }
    return base;
}

function getFotogramIntentFromAnonMessage(dm, anonText, attachmentSpec) {
    var text = String(anonText || '').toLowerCase();
    var anonTypeNum = dm && dm.anonType ? Number(dm.anonType) : 0;
    var poolName = attachmentSpec && attachmentSpec.pool ? String(attachmentSpec.pool).toLowerCase() : '';
    var isExplicitAttachment = poolName === 'cock' || poolName === 'cum';
    var hasExplicitWords = /(cock|dick|cum|nude|nudes|pic|pics|photo|photos|send me something|your turn|fair's fair)/.test(text);
    var asksPics = /(send|share|show).*(pic|pics|photo|photos|nude|nudes)|got any pics|your turn|fair'?s fair|just one pic|send me something/.test(text);
    var asksNumber = /(number|swap|digits|whatsapp|take this to text|text me)/.test(text);
    var pushy = /(come on|not gonna stop|not letting you go|don't leave me hanging|just give it to me|don't be shy|i need more|your loss|your turn|now\.)/.test(text);
    var asksPersonal = /(what do you do|what's your story|what are you into|what do you get up to|\byou\?$)/.test(text);
    if (anonTypeNum === 3 && !asksNumber) asksNumber = /(talk properly|off here)/.test(text);
    if ((anonTypeNum === 1 || anonTypeNum === 2 || anonTypeNum === 6) && !asksPics) {
        asksPics = /(show me|send me|i need more|i showed you mine)/.test(text);
    }
    return {
        explicit: isExplicitAttachment || hasExplicitWords,
        asksPics: asksPics,
        asksNumber: asksNumber,
        pushy: pushy,
        asksPersonal: asksPersonal
    };
}

function resolveFotogramChoiceContextKeys(nodeId, intent, anonTypeNum, prevChoiceKey, flowState) {
    var keys = [];
    var heat = Number(flowState && flowState.heat) || 0;
    var control = Number(flowState && flowState.control) || 0;
    if (intent && intent.explicit) keys.push('receivedExplicitAttachment');
    if (intent && intent.pushy && (intent.asksPics || intent.asksNumber)) keys.push('anonPushingForPicsOrNumber');
    if (intent && intent.asksPics) keys.push('askedAboutPics');
    if (intent && intent.asksNumber) keys.push('askedAboutNumber');
    if (nodeId === 'chat_min_continuation_2' && prevChoiceKey === 'chat_min_deflect' && intent && intent.pushy) {
        keys.push('anonPushedOnPicsDeflect');
    }
    if (control >= 2) keys.push('highControl');
    if (heat >= 3) keys.push('highHeat');
    var dedup = [];
    for (var i = 0; i < keys.length; i++) {
        if (dedup.indexOf(keys[i]) < 0) dedup.push(keys[i]);
    }
    return dedup;
}

function pickFotogramScenarioNodeAnonText(vars, dm, nodeId, anonSource, toneGender, flagKey, nodeForAttachmentPool, prevChoiceKey) {
    var persona = String(dm && dm.personaType ? dm.personaType : 'playful');
    var resolved = anonSource;
    if (anonSource && anonSource.byPrevChoice && prevChoiceKey && anonSource.byPrevChoice[prevChoiceKey]) {
        resolved = anonSource.byPrevChoice[prevChoiceKey];
    }
    if (resolved && resolved.byEffect && dm && dm.flowState) {
        var ghostRisk = Number(dm.flowState.ghostRisk) || 0;
        var effectBlock = ghostRisk >= 2 ? (resolved.byEffect && resolved.byEffect.high) : (resolved.byEffect && resolved.byEffect.low);
        if (effectBlock) resolved = effectBlock;
    }
    var heat = Number(dm && dm.flowState && dm.flowState.heat) || 0;
    var control = Number(dm && dm.flowState && dm.flowState.control) || 0;
    if (resolved && resolved.byEffectControl && dm && dm.flowState && control >= 2) {
        var controlBlock = resolved.byEffectControl.high;
        if (controlBlock) resolved = controlBlock;
    }
    if (resolved && resolved.byEffectHeat && dm && dm.flowState && control < 2 && heat >= 2) {
        var heatBlock = resolved.byEffectHeat.high;
        if (heatBlock) resolved = heatBlock;
    }
    if (resolved && resolved.byType && dm && dm.anonType && resolved.byType[dm.anonType]) {
        resolved = resolved.byType[dm.anonType];
    }
    var pool = [];
    if (resolved && resolved.byPersona && resolved.byPersona[persona]) {
        pool = getFotogramScenarioTonePool(resolved.byPersona[persona], toneGender, flagKey);
    }
    if (!pool.length) {
        pool = getFotogramScenarioTonePool(resolved, toneGender, flagKey);
    }
    var emptyAnonText = getFotogramDmRuntimeText('emptyAnonText');
    if (!pool.length) return emptyAnonText;
    var needIndex = nodeForAttachmentPool && nodeForAttachmentPool.anonAttachmentPool && nodeForAttachmentPool.anonAttachmentPool[toneGender] && Array.isArray(nodeForAttachmentPool.anonAttachmentPool[toneGender]);
    var poolIndices = [];
    var i;
    for (i = 0; i < pool.length; i++) poolIndices.push(i);
    var pickedIndex = -1;
    var pickedText = '';
    if (pool.length === 1) {
        pickedIndex = 0;
        pickedText = String(pool[0] || emptyAnonText);
    } else {
        var cfg = getFotogramDmVarietyConfig();
        var turn = Number(dm && dm.flowState && dm.flowState.turn) || 0;
        var useStrict = turn <= cfg.textStrictTurns;
        var scenarioKey = String((dm && dm.scenarioType) || 'default');
        var nodeKey = String(nodeId || 'node');
        var toneKey = String(toneGender || 'male');
        var personaKey = String(persona || 'playful');
        if (needIndex) {
            var indexKeyStrict = 'phoneFotogramScenarioNodeTextIndexUsed_' + scenarioKey + '_' + nodeKey + '_' + toneKey + '_' + personaKey;
            var indexKeyRecent = 'phoneFotogramScenarioNodeTextIndexRecent_' + scenarioKey + '_' + nodeKey + '_' + toneKey + '_' + personaKey;
            if (useStrict) {
                pickedIndex = pickFromPoolWithUnusedPreference(vars, indexKeyStrict, poolIndices);
            } else {
                pickedIndex = pickFromPoolWithRecentIndexCooldown(vars, indexKeyRecent, poolIndices, cfg.textRecentWindow);
            }
            if (pickedIndex === undefined || pickedIndex === null || pickedIndex < 0) pickedIndex = poolIndices[Math.floor(Math.random() * poolIndices.length)];
            pickedText = String(pool[pickedIndex] || emptyAnonText);
        } else {
            if (useStrict) {
                var strictKey = 'phoneFotogramScenarioNodeTextUsed_' + scenarioKey + '_' + nodeKey + '_' + toneKey + '_' + personaKey;
                pickedText = String(pickFromPoolWithUnusedPreference(vars, strictKey, pool) || pool[Math.floor(Math.random() * pool.length)] || emptyAnonText);
            } else {
                var softKey = 'phoneFotogramScenarioNodeTextRecent_' + scenarioKey + '_' + nodeKey + '_' + toneKey + '_' + personaKey;
                pickedText = String(pickFromPoolWithRecentIndexCooldown(vars, softKey, pool, cfg.textRecentWindow) || pool[Math.floor(Math.random() * pool.length)] || emptyAnonText);
            }
        }
    }
    if (needIndex && pickedIndex >= 0 && nodeForAttachmentPool.anonAttachmentPool[toneGender][pickedIndex]) {
        return { text: pickedText, attachmentPool: String(nodeForAttachmentPool.anonAttachmentPool[toneGender][pickedIndex]) };
    }
    return pickedText || emptyAnonText;
}

function normalizeFotogramScenarioChoices(rawChoices, vars, nodeId, scenarioType) {
    if (!Array.isArray(rawChoices)) return [];
    var varietyCfg = (typeof getFotogramDmVarietyConfig === 'function') ? getFotogramDmVarietyConfig() : {};
    var phraseWindow = Math.max(2, varietyCfg.textRecentWindow || 6);
    return rawChoices.map(function (c, idx) {
        if (!c || typeof c !== 'object') return null;
        var key = c.key || c.id || ('choice_' + idx);
        var text = c.playerText || c.text || c.label || key;
        if (Array.isArray(text) && text.length > 0) {
            if (vars && (nodeId || scenarioType)) {
                var scKey = String(scenarioType || 'default');
                var nKey = String(nodeId || 'node');
                var phraseKey = 'phoneFotogramChoicePhrase_' + scKey + '_' + nKey + '_' + String(key);
                text = (typeof pickFromPoolWithRecentIndexCooldown === 'function')
                    ? (pickFromPoolWithRecentIndexCooldown(vars, phraseKey, text, phraseWindow) || text[Math.floor(Math.random() * text.length)])
                    : text[Math.floor(Math.random() * text.length)];
            } else {
                text = text[Math.floor(Math.random() * text.length)];
            }
        }
        var out = {
            key: String(key),
            playerText: String(text),
            next: c.next || null,
            requiresSwap: c.requiresSwap === true,
            effects: (c.effects && typeof c.effects === 'object') ? c.effects : null
        };
        if (c.playerTextByPersona && typeof c.playerTextByPersona === 'object') {
            out.playerTextByPersona = c.playerTextByPersona;
        }
        return out;
    }).filter(Boolean);
}

function getFotogramChoiceLabel(choice, dm) {
    if (!choice) return '';
    var persona = dm && dm.personaType ? String(dm.personaType) : '';
    if (persona && choice.playerTextByPersona && choice.playerTextByPersona[persona]) {
        return String(choice.playerTextByPersona[persona]).trim() || choice.playerText || choice.key || '';
    }
    return choice.playerText || choice.key || '';
}

function applyFotogramFlowEffects(flowState, effects) {
    if (!flowState || !effects || typeof effects !== 'object') return;
    var keys = ['heat', 'trust', 'control', 'ghostRisk', 'pushiness'];
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (!Number.isFinite(Number(effects[k]))) continue;
        var cur = Number(flowState[k]) || 0;
        flowState[k] = cur + Number(effects[k]);
    }
    if (effects.swapOpen === true) flowState.swapOpen = true;
}

function getFotogramDmAttachmentStage(dm) {
    var cfg = getFotogramDmVarietyConfig();
    var fs = (dm && dm.flowState) ? dm.flowState : {};
    var heat = Number(fs.heat) || 0;
    var trust = Number(fs.trust) || 0;
    if (heat >= cfg.stageHeatLate || trust >= cfg.stageTrustLate) return 'late';
    if (heat >= cfg.stageHeatMid) return 'mid';
    return 'early';
}

function getAllowedAttachmentPoolsForStage(dm) {
    var cfg = getFotogramDmVarietyConfig();
    var tone = (dm && dm.toneGender) ? String(dm.toneGender) : 'male';
    if (dm && dm.scenarioType === 'dickpic_open') {
        if (tone === 'male') return ['cock', 'cum'];
        if (tone === 'female') return ['sexting', 'female_masturbation'];
    }
    var stage = getFotogramDmAttachmentStage(dm);
    var list = (stage === 'late') ? ['spicy', 'sexting'] : (stage === 'mid') ? ['spicy', 'sexting'] : ['spicy'];
    if (tone === 'male') list = list.filter(function (p) { return p !== 'sexting'; });
    var explicitTypes = (dm && dm.anonType) ? [1, 2, 6] : [];
    if (explicitTypes.indexOf(dm.anonType) >= 0 && tone === 'male' && (stage === 'mid' || stage === 'late')) {
        list = list.concat(['cock', 'cum']);
    }
    return list;
}

function getDynamicAttachmentChanceForStage(dm) {
    var cfg = getFotogramDmVarietyConfig();
    var stage = getFotogramDmAttachmentStage(dm);
    if (stage === 'late') return cfg.dynamicAttachmentChanceLate;
    if (stage === 'mid') return cfg.dynamicAttachmentChanceMid;
    return cfg.dynamicAttachmentChanceEarly;
}

function resolveMediaBehaviorAttachmentSpec(dm, attachmentSpec) {
    var behavior = String((dm && dm.mediaBehavior) || 'mixed');
    if (behavior === 'text_only') return null;
    return attachmentSpec;
}

function attachFotogramDmPhotoToMessage(dm, cfg, flagKey, photoSpec, anonMsg, vars) {
    if (!photoSpec || !anonMsg) return;
    var photoFrom = dm.charId || dm.anonId;
    if (typeof photoSpec === 'string') photoSpec = { pool: photoSpec };
    if (photoSpec.path) {
        var mediaKindFromPath = getMediaKindFromPath(photoSpec.path);
        anonMsg.attachment = { path: photoSpec.path, from: photoFrom, kind: mediaKindFromPath };
        if (typeof window.phoneGalleryAddItem === 'function') {
            window.phoneGalleryAddItem(photoSpec.path, { kind: mediaKindFromPath === 'video' ? 'videos' : 'photos', category: 'received', from: photoFrom, quality: 50 });
        }
        return;
    }
    var rawSkin = dm.skinTone || 'white';
    var skinMap = { light: 'white', medium: 'white', dark: 'black', white: 'white', black: 'black' };
    var skinKey = skinMap[rawSkin] || rawSkin;
    if (skinKey !== 'white' && skinKey !== 'black') skinKey = 'white';
    var tone = (dm && dm.toneGender) ? String(dm.toneGender) : 'male';
    var pool = (cfg && cfg.photoPool) ? cfg.photoPool : ((typeof setup !== 'undefined' && setup.fotogramDMPhotoPool) ? setup.fotogramDMPhotoPool : {});
    var poolKey = photoSpec.pool || photoSpec.photoPool || flagKey || 'default';
    var poolEntry = pool[poolKey] || pool[flagKey] || pool.default;
    var genderEntry = (poolEntry && (poolEntry.male || poolEntry.female)) ? (poolEntry[tone] || poolEntry.male || poolEntry.female) : poolEntry;
    var paths = (genderEntry && genderEntry[skinKey]) ? genderEntry[skinKey] : (genderEntry && genderEntry.white) ? genderEntry.white : [];
    if (!Array.isArray(paths) || paths.length === 0) return;
    var recentMediaKey = 'phoneFotogramDmRecentMedia_' + String(dm && dm.id ? dm.id : 'global');
    var rawPick = pickFromPoolWithRecentIndexCooldown(
        vars,
        recentMediaKey,
        paths,
        getFotogramDmVarietyConfig().attachmentRecentWindow
    ) || paths[Math.floor(Math.random() * paths.length)];
    var pickedPath = '';
    var pickedKind = null;
    if (rawPick && typeof rawPick === 'object') {
        pickedPath = rawPick.path || '';
        pickedKind = rawPick.kind || null;
    } else {
        pickedPath = String(rawPick || '');
    }
    if (!pickedPath) return;
    var mediaKind = pickedKind || getMediaKindFromPath(pickedPath);
    anonMsg.attachment = { path: pickedPath, from: photoFrom, kind: mediaKind };
    if (typeof window.phoneGalleryAddItem === 'function') {
        window.phoneGalleryAddItem(pickedPath, { kind: mediaKind === 'video' ? 'videos' : 'photos', category: 'received', from: photoFrom, quality: 50 });
    }
}

function pickFotogramRandomAttachmentSpec(randomAttachment, dm, vars) {
    if (!randomAttachment || typeof randomAttachment !== 'object') return null;
    var chance = Number(randomAttachment.chance);
    if (!Number.isFinite(chance)) chance = 0;
    chance = Math.max(0, Math.min(1, chance));
    var persona = String((dm && dm.personaType) || '');
    if (persona === 'dominant') chance = Math.min(1, chance * 1.15);
    else if (persona === 'manipulative') chance = Math.min(1, chance * 1.1);
    else if (persona === 'soft') chance = Math.max(0, chance * 0.8);
    var behavior = String((dm && dm.mediaBehavior) || 'mixed');
    if (behavior === 'text_only') chance = 0;
    else if (behavior === 'media_only') chance = Math.min(1, chance * 1.25);
    if (Math.random() > chance) return null;

    if (randomAttachment.path || randomAttachment.pool || randomAttachment.photoPool) {
        var directPool = randomAttachment.pool || randomAttachment.photoPool;
        if (!directPool) return randomAttachment;
        var allowedDirect = getAllowedAttachmentPoolsForStage(dm);
        if (allowedDirect.indexOf(String(directPool)) >= 0) return randomAttachment;
        return null;
    }

    if (Array.isArray(randomAttachment.options) && randomAttachment.options.length) {
        var filteredOptions = randomAttachment.options.filter(function (opt) {
            if (!opt || typeof opt !== 'object') return false;
            var p = opt.pool || opt.photoPool;
            if (!p) return true;
            return getAllowedAttachmentPoolsForStage(dm).indexOf(String(p)) >= 0;
        });
        var optionsPool = filteredOptions.length ? filteredOptions : randomAttachment.options;
        var optionKey = 'phoneFotogramScenarioAttachmentOptionRecent_' + String(dm && dm.id ? dm.id : 'global');
        return pickFromPoolWithRecentIndexCooldown(vars, optionKey, optionsPool, getFotogramDmVarietyConfig().attachmentRecentWindow) || null;
    }

    if (Array.isArray(randomAttachment.pools) && randomAttachment.pools.length) {
        var allowed = getAllowedAttachmentPoolsForStage(dm);
        var stagePools = randomAttachment.pools.filter(function (p) { return allowed.indexOf(String(p)) >= 0; });
        var candidatePools = stagePools.length ? stagePools : randomAttachment.pools;
        var pool = pickFromPoolWithRecentIndexCooldown(
            vars,
            'phoneFotogramScenarioAttachmentPoolRecent_' + String(dm && dm.id ? dm.id : 'global'),
            candidatePools,
            getFotogramDmVarietyConfig().attachmentRecentWindow
        ) || candidatePools[Math.floor(Math.random() * candidatePools.length)];
        if (pool) return { pool: pool };
    }
    return null;
}

function ensureFotogramScenarioBootstrap(vars, dm) {
    if (!vars || !dm || dm.isInteractive === false || dm.blocked) return false;
    var hasScenarioChoices = !!(dm.flowState && Array.isArray(dm.flowState.currentChoices) && dm.flowState.currentChoices.length);
    if (hasScenarioChoices && dm.scenarioType && dm.scenarioType !== 'legacy') return false;

    var keys = Array.isArray(dm.availableReplyKeys) ? dm.availableReplyKeys : [];
    var legacyKeys = getFotogramDmLegacyReplyKeys();
    var looksLegacy = keys.length > 0 && keys.every(function (k) { return legacyKeys.indexOf(String(k)) >= 0; });
    var needsBootstrap = (!dm.flowState || !Array.isArray(dm.flowState.currentChoices) || dm.flowState.currentChoices.length === 0 || !dm.scenarioType || dm.scenarioType === 'legacy' || looksLegacy);
    if (!needsBootstrap) return false;
    if (keys.length === 0 && Array.isArray(dm.messages) && dm.messages.length > 2) return false; // likely a naturally finished old thread

    var post = getPostById(vars, dm.postId);
    var postFlags = (post && post.flags) ? post.flags : [];
    var flagKey = getBestFlagMatch(postFlags);
    var scenarioType = pickFotogramDmScenarioType(flagKey, vars);
    if (!scenarioType) {
        var types = getFotogramDmScenarioTypes();
        scenarioType = (types && types.length) ? types[0] : null;
    }
    var flow = getFotogramScenarioFlow(scenarioType);
    if (!flow && scenarioType && scenarioType !== 'chat_open') {
        scenarioType = 'chat_open';
        flow = getFotogramScenarioFlow(scenarioType);
    }
    if (!flow) {
        var allTypes = getFotogramDmScenarioTypes();
        for (var ti = 0; ti < (allTypes || []).length; ti++) {
            flow = getFotogramScenarioFlow(allTypes[ti]);
            if (flow) { scenarioType = allTypes[ti]; break; }
        }
    }
    if (!flow) return false;
    var startNode = getFotogramScenarioNode(flow, flow.startNode);
    var startChoiceSource = (startNode && startNode.choices) ? startNode.choices : [];
    var firstMsg = (dm.messages && dm.messages.length) ? dm.messages[0] : null;
    var firstHasExplicit = firstMsg && firstMsg.attachment && (String(firstMsg.attachment.pool || '').toLowerCase() === 'cock' || String(firstMsg.attachment.pool || '').toLowerCase() === 'cum' || String(firstMsg.attachment.path || '').indexOf('cock') >= 0 || String(firstMsg.attachment.path || '').indexOf('cum') >= 0);
    var anonType6Male = (dm.anonType === 6 || dm.anonType === '6') && (String(dm.toneGender || dm.profileGender || '').toLowerCase() === 'male');
    if (startNode && startNode.choicesByContext && startNode.choicesByContext.receivedDickPic && (firstHasExplicit || anonType6Male)) {
        startChoiceSource = startNode.choicesByContext.receivedDickPic;
    }
    var startChoices = normalizeFotogramScenarioChoices(startChoiceSource, vars, flow.startNode, scenarioType);
    if (startNode && startNode.choicesByFlag && startNode.choicesByFlag[flagKey] && !firstHasExplicit && !anonType6Male) {
        startChoices = startChoices.concat(normalizeFotogramScenarioChoices(startNode.choicesByFlag[flagKey], vars, flow.startNode, scenarioType));
    }
    var minMsgBootstrap = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMMinTotalMessages)) ? setup.fotogramDMMinTotalMessages : 10;
    var msgCount = (dm.messages && dm.messages.length) ? dm.messages.length : 0;
    if (startChoices.length && msgCount + 2 < minMsgBootstrap) {
        startChoices = startChoices.filter(function (c) {
            var n = c.next ? getFotogramScenarioNode(flow, c.next) : null;
            return !n || n.endConversation !== true;
        });
    }
    if (!startChoices.length) return false;

    var fs = (dm.flowState && typeof dm.flowState === 'object') ? dm.flowState : {};
    fs.heat = Number.isFinite(Number(fs.heat)) ? Number(fs.heat) : 1;
    fs.trust = Number.isFinite(Number(fs.trust)) ? Number(fs.trust) : 0;
    fs.control = Number.isFinite(Number(fs.control)) ? Number(fs.control) : 0;
    fs.pushiness = Number.isFinite(Number(fs.pushiness)) ? Number(fs.pushiness) : 0;
    fs.ghostRisk = Number.isFinite(Number(fs.ghostRisk)) ? Number(fs.ghostRisk) : 0;
    fs.swapOpen = fs.swapOpen === true;
    fs.turn = Number.isFinite(Number(fs.turn)) ? Number(fs.turn) : 0;
    fs.currentNode = flow.startNode;
    fs.currentChoices = startChoices;
    dm.flowState = fs;
    dm.scenarioType = scenarioType;
    dm.toneGender = normalizeFotogramDmToneGender(dm.toneGender || dm.profileGender || 'male');
    dm.personaType = dm.personaType || pickFotogramDmPersonaType();
    dm.mediaBehavior = dm.mediaBehavior || pickFotogramDmMediaBehavior();
    dm.anonType = dm.anonType || pickFotogramAnonType(vars);
    dm.availableReplyKeys = startChoices.map(function (c) { return c.key; });
    return true;
}

function processFotogramScenarioReply(vars, dm, replyKey) {
    if (!dm || !dm.flowState || !dm.scenarioType) return false;
    var flow = getFotogramScenarioFlow(dm.scenarioType);
    if (!flow) return false;
    var currentNodeId = dm.flowState.currentNode || flow.startNode;
    var node = getFotogramScenarioNode(flow, currentNodeId);
    if (!node) return false;
    var choices = normalizeFotogramScenarioChoices(dm.flowState.currentChoices || node.choices || []);
    if (!choices.length) return false;
    var selected = null;
    for (var i = 0; i < choices.length; i++) {
        if (choices[i].key === replyKey) { selected = choices[i]; break; }
    }
    if (!selected) return false;
    if (selected.requiresSwap && !canUseSwapInFotogramDm(vars)) return true;

    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    dm.messages = dm.messages || [];
    dm.messages.push({ from: 'me', text: getFotogramChoiceLabel(selected, dm), time: time, read: true });
    applyFotogramFlowEffects(dm.flowState, selected.effects);
    dm.flowState.turn = (Number(dm.flowState.turn) || 0) + 1;

    if (!selected.next) {
        dm.flowState.currentChoices = [];
        dm.availableReplyKeys = [];
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
        return true;
    }

    var nextNode = getFotogramScenarioNode(flow, selected.next);
    if (!nextNode) {
        dm.flowState.currentChoices = [];
        dm.availableReplyKeys = [];
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
        return true;
    }

    var effectiveNextId = selected.next;
    var minMsg = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMMinTotalMessages)) ? setup.fotogramDMMinTotalMessages : 10;
    var maxMsg = (typeof setup !== 'undefined' && Number.isFinite(setup.fotogramDMMaxTotalMessages)) ? setup.fotogramDMMaxTotalMessages : 22;
    if (nextNode.endConversation === true && dm.messages.length < minMsg - 1) {
        var contNode = getFotogramScenarioNode(flow, 'chat_min_continuation');
        if (contNode) {
            nextNode = contNode;
            effectiveNextId = 'chat_min_continuation';
        }
    }

    var post = getPostById(vars, dm.postId);
    var postFlags = (post && post.flags) ? post.flags : [];
    var flagKey = getBestFlagMatch(postFlags);
    var charConfig = (typeof setup !== 'undefined' && setup.fotogramAnonCharConfig) ? setup.fotogramAnonCharConfig : {};
    var cfg = dm.charId && charConfig[dm.charId] ? charConfig[dm.charId] : null;
    var tone = dm.toneGender || 'male';

    var prevChoiceKey = selected.key || null;
    var anonResult = pickFotogramScenarioNodeAnonText(vars, dm, effectiveNextId, nextNode.anon, tone, flagKey, nextNode, prevChoiceKey);
    var anonText = (typeof anonResult === 'object' && anonResult && anonResult.text != null) ? anonResult.text : String(anonResult || getFotogramDmRuntimeText('emptyAnonText'));
    var attachmentPoolFromText = (typeof anonResult === 'object' && anonResult && anonResult.attachmentPool) ? anonResult.attachmentPool : null;
    anonText = applyPersonaLanguageOverlay(vars, dm, anonText, effectiveNextId);
    var anonMsg = { from: dm.anonId, text: anonText, time: time, read: false };
    var attachmentSpec = nextNode.attachment || pickFotogramRandomAttachmentSpec(nextNode.randomAttachment, dm, vars);
    if (attachmentSpec && typeof attachmentSpec === 'object') {
        var forcedPool = attachmentSpec.pool || attachmentSpec.photoPool;
        if (forcedPool) {
            var allowedPools = getAllowedAttachmentPoolsForStage(dm);
            if (allowedPools.indexOf(String(forcedPool)) < 0) attachmentSpec = null;
        }
    }
    attachmentSpec = resolveMediaBehaviorAttachmentSpec(dm, attachmentSpec);
    if (!attachmentSpec && !nextNode.attachment && !nextNode.randomAttachment) {
        var dynChance = getDynamicAttachmentChanceForStage(dm);
        var behavior = String(dm.mediaBehavior || 'mixed');
        if (behavior === 'media_only') dynChance = Math.min(1, dynChance * 1.6);
        var explicitType = dm.anonType && [1, 2, 6].indexOf(Number(dm.anonType)) >= 0;
        if (explicitType) dynChance = Math.min(0.55, dynChance * 1.8);
        if (Math.random() < dynChance) {
            var dynPool = attachmentPoolFromText || (function () {
                var dynPools = getAllowedAttachmentPoolsForStage(dm);
                return dynPools[Math.floor(Math.random() * dynPools.length)];
            })();
            if (dynPool) attachmentSpec = { pool: dynPool };
        }
    }
    if (!attachmentSpec && attachmentPoolFromText) {
        attachmentSpec = resolveMediaBehaviorAttachmentSpec(dm, { pool: attachmentPoolFromText });
    }
    if (!attachmentSpec && isLikelyMediaPath(anonText)) {
        attachmentSpec = { path: anonText };
        anonMsg.text = '';
    }
    if (attachmentSpec) attachFotogramDmPhotoToMessage(dm, cfg, flagKey, attachmentSpec, anonMsg, vars);
    if (attachmentSpec && String(dm.mediaBehavior || '') === 'media_only') {
        anonMsg.text = '';
    }
    dm.messages.push(anonMsg);

    if (nextNode.flags && nextNode.flags.anonAskedSwap === true) dm.anonAskedSwap = true;
    if (nextNode.flags && nextNode.flags.deletedMessage === true) {
        dm.messages.push({ from: dm.anonId, text: getFotogramDmRuntimeText('deletedMessageText'), time: time, read: false });
    }
    if (nextNode.flags && nextNode.flags.ghosted === true) dm.flowState.ghosted = true;

    dm.flowState.currentNode = effectiveNextId;
    var nextChoiceSource = nextNode.choices || [];
    var anonTypeNum = dm.anonType ? Number(dm.anonType) : 0;
    var intent = getFotogramIntentFromAnonMessage(dm, anonMsg.text || anonText, attachmentSpec);
    dm.flowState.lastAnonIntent = intent;
    var contextKeys = resolveFotogramChoiceContextKeys(effectiveNextId, intent, anonTypeNum, prevChoiceKey, dm.flowState);
    if (nextNode.choicesByContext && typeof nextNode.choicesByContext === 'object') {
        for (var cix = 0; cix < contextKeys.length; cix++) {
            var ck = contextKeys[cix];
            var pool = nextNode.choicesByContext[ck];
            if (Array.isArray(pool) && pool.length) {
                nextChoiceSource = pool;
                break;
            }
        }
    }
    if (anonTypeNum === 3) dm.anonAskedSwap = true;
    var nextChoices = normalizeFotogramScenarioChoices(nextChoiceSource, vars, effectiveNextId, dm.scenarioType);
    if (nextNode.choicesByFlag && nextNode.choicesByFlag[flagKey] && !(intent && intent.explicit)) {
        nextChoices = nextChoices.concat(normalizeFotogramScenarioChoices(nextNode.choicesByFlag[flagKey], vars, effectiveNextId, dm.scenarioType));
    }
    if (dm.messages.length >= maxMsg - 2) {
        nextChoices = nextChoices.filter(function (c) {
            var n = c.next ? getFotogramScenarioNode(flow, c.next) : null;
            return n && n.endConversation === true;
        });
    }
    dm.flowState.currentChoices = nextChoices;
    dm.availableReplyKeys = (dm.flowState.currentChoices || []).map(function (c) { return c.key; });
    if (nextNode.endConversation === true || dm.flowState.ghosted === true) {
        dm.flowState.currentChoices = [];
        dm.availableReplyKeys = [];
    }

    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
    return true;
}

function processFotogramDMReply(vars, dmId, replyKey) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm || dm.blocked) return;
    if (dm.isInteractive === false) {
        if (replyKey !== 'thanks_auto' || dm.simpleThanksSent === true) return;
        var simpleReplyText = getFotogramEncouragingReplyMessage();
        if (!simpleReplyText) return;
        var tSimple = vars.timeSys || {};
        var timeSimple = { day: tSimple.day, month: tSimple.month, year: tSimple.year, hour: tSimple.hour, minute: tSimple.minute };
        dm.messages = dm.messages || [];
        dm.messages.push({ from: 'me', text: simpleReplyText, time: timeSimple, read: true });
        dm.simpleThanksSent = true;
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        return;
    }
    if (ensureFotogramScenarioBootstrap(vars, dm)) {
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    }
    if (processFotogramScenarioReply(vars, dm, replyKey)) return;
    if (hasFotogramScenarioConfigLoaded()) {
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
        return;
    }
    // Interactive DMs must run only on scenario flows; disable legacy quick-reply fallback.
    if (replyKey === 'swap_yes' && !canUseSwapInFotogramDm(vars)) return;
    var replies = getFotogramQuickReplies();
    var reply = null;
    for (var r = 0; r < replies.length; r++) {
        if (replies[r].key === replyKey) { reply = replies[r]; break; }
    }
    if (!reply) return;
    var post = getPostById(vars, dm.postId);
    var postFlags = (post && post.flags) ? post.flags : [];
    var flagKey = getBestFlagMatch(postFlags);
    var charConfig = (typeof setup !== 'undefined' && setup.fotogramAnonCharConfig) ? setup.fotogramAnonCharConfig : {};
    var cfg = dm.charId && charConfig[dm.charId] ? charConfig[dm.charId] : null;
    var anonReply;
    if (cfg && cfg.quickReplies && cfg.quickReplies[replyKey]) {
        var cr = cfg.quickReplies[replyKey];
        anonReply = (cr[flagKey]) ? cr[flagKey] : cr.default || { text: getFotogramDmRuntimeText('legacyReplyFallbackText') };
    } else {
        anonReply = (reply.anonReplies && reply.anonReplies[flagKey]) ? reply.anonReplies[flagKey] : (reply.anonReplies && reply.anonReplies.default) ? reply.anonReplies.default : { text: getFotogramDmRuntimeText('legacyReplyFallbackText') };
    }
    var anonTextResolved = (anonReply.textPool && Array.isArray(anonReply.textPool) && anonReply.textPool.length > 0)
        ? anonReply.textPool[Math.floor(Math.random() * anonReply.textPool.length)]
        : (anonReply.text || getFotogramDmRuntimeText('legacyReplyFallbackText'));
    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    dm.messages = dm.messages || [];
    dm.messages.push({ from: 'me', text: reply.playerText, time: time, read: true });
    var anonMsg = { from: dm.anonId, text: anonTextResolved, time: time, read: false };
    if (anonReply.photoPath) {
        attachFotogramDmPhotoToMessage(dm, cfg, flagKey, { path: anonReply.photoPath }, anonMsg, vars);
    } else if (anonReply.photoPool) {
        attachFotogramDmPhotoToMessage(dm, cfg, flagKey, { pool: anonReply.photoPool }, anonMsg, vars);
    } else if (isLikelyMediaPath(anonTextResolved)) {
        attachFotogramDmPhotoToMessage(dm, cfg, flagKey, { path: anonTextResolved }, anonMsg, vars);
        anonMsg.text = '';
    }
    dm.messages.push(anonMsg);
    var anonText = (anonTextResolved || '').toLowerCase();
    var swapHints = getFotogramDmSwapKeywordHints();
    for (var sh = 0; sh < swapHints.length; sh++) {
        if (swapHints[sh] && anonText.indexOf(swapHints[sh]) >= 0) {
            dm.anonAskedSwap = true;
            break;
        }
    }
    if (!Array.isArray(dm.availableReplyKeys) || dm.availableReplyKeys.length === 0) {
        dm.availableReplyKeys = replies.map(function (x) { return x && x.key; }).filter(Boolean);
    }
    var nextReplyKeys = getNextFotogramReplyKeys(reply, flagKey);
    if (Array.isArray(nextReplyKeys)) {
        dm.availableReplyKeys = nextReplyKeys;
    } else {
        dm.availableReplyKeys = dm.availableReplyKeys.filter(function (k) { return k !== replyKey; });
        if (reply.endConversation === true) dm.availableReplyKeys = [];
    }
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
    return;
}

function blockFotogramDM(vars, dmId) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm) return;
    dm.blocked = true;
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
}

function deleteFotogramDM(vars, dmId) {
    if (!vars || !dmId) return false;
    var dms = Array.isArray(vars.phoneFotogramDMs) ? vars.phoneFotogramDMs : [];
    var before = dms.length;
    vars.phoneFotogramDMs = dms.filter(function (dm) { return !(dm && dm.id === dmId); });
    if (vars.phoneNotifications && Array.isArray(vars.phoneNotifications.fotogram)) {
        vars.phoneNotifications.fotogram = vars.phoneNotifications.fotogram.filter(function (n) {
            return !(n && n.type === 'dm' && n.refId === dmId);
        });
    }
    var changed = vars.phoneFotogramDMs.length !== before;
    if (!changed) return false;
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
    return true;
}

function drainFotogramNotifications(vars) {
    if (!vars.phoneNotifications || !vars.phoneNotifications.fotogram) return;
    vars.phoneNotifications.fotogram = [];
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
}

function phoneRenderFotogramDmList() {
    var vars = (typeof State !== 'undefined' && State.variables)
        ? State.variables
        : (typeof PhoneAPI !== 'undefined' && PhoneAPI.State && PhoneAPI.State.variables)
            ? PhoneAPI.State.variables
            : {};
    var dms = getActiveFotogramDMs(vars);
    var html = '<div class="phone-fotogram-dm-list"><div class="phone-fotogram-dm-list-header"></div>';
    if (dms.length === 0) {
        html += '<div class="phone-app-placeholder">';
        html += '<p class="phone-app-placeholder-text">No DMs yet</p>';
        html += '<p class="phone-app-placeholder-sub">Keep posting!</p>';
        html += '</div>';
    } else {
        dms.forEach(function (dm) {
            var preview = '';
            if (dm.messages && dm.messages.length) {
                var last = dm.messages[dm.messages.length - 1];
                preview = escapeHtmlFg(String((last.text || '').slice(0, 40))) + (last.text && last.text.length > 40 ? '…' : '');
            }
            var unread = dm.messages ? dm.messages.some(function (m) { return m.from !== 'me' && !m.read; }) : false;
            html += '<div class="phone-fotogram-dm-row' + (unread ? ' unread' : '') + '" data-dm-id="' + escapeHtmlFg(dm.id) + '">';
            html += '<div class="phone-fotogram-dm-row-avatar">' + renderFotogramAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-list') + '</div>';
            html += '<div class="phone-fotogram-dm-meta">';
            html += '<span class="phone-fotogram-dm-name">' + escapeHtmlFg(dm.anonName || 'Unknown') + '</span>';
            html += '<span class="phone-fotogram-dm-preview">' + preview + '</span>';
            html += '</div>';
            if (unread) html += '<span class="phone-fotogram-dm-unread-dot" aria-hidden="true"></span>';
            html += '</div>';
        });
    }
    html += '</div>';
    return html;
}

function phoneRenderFotogramDmThread(dmId) {
    var vars = (typeof State !== 'undefined' && State.variables)
        ? State.variables
        : (typeof PhoneAPI !== 'undefined' && PhoneAPI.State && PhoneAPI.State.variables)
            ? PhoneAPI.State.variables
            : {};
    var dm = getFotogramDMById(vars, dmId);
    if (!dm) return typeof phoneRenderFotogramDmList === 'function' ? phoneRenderFotogramDmList() : '<div class="phone-fotogram-dm-thread">DM not found.</div>';
    var readChanged = markFotogramDmAsRead(dm);
    if (ensureFotogramScenarioBootstrap(vars, dm)) {
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    }
    if (readChanged) {
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
    }
    var infoGender = normalizeGenderLabel(dm.profileGender);
    var infoAge = Number(dm.profileAge);
    var infoAgeText = (Number.isFinite(infoAge) && infoAge >= 18 && infoAge <= 60) ? infoAge : 'Unknown';
    var infoText = 'Gender: ' + infoGender + '\nAge: ' + infoAgeText;
    var html = '<div class="phone-fotogram-dm-thread"><div class="phone-fotogram-dm-thread-header">' +
        renderFotogramAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-thread') +
        '<span class="phone-fotogram-dm-thread-name">' + escapeHtmlFg(dm.anonName || 'Unknown') + '</span>' +
        '<button type="button" class="phone-fotogram-dm-thread-info" data-tooltip="' + escapeHtmlFg(infoText) + '" aria-label="Profile info"><span class="icon icon-info icon-16"></span></button>' +
        '<button type="button" class="phone-fotogram-dm-thread-delete" data-dm-id="' + escapeHtmlFg(dm.id) + '" aria-label="Delete DM"><span class="icon icon-delete icon-16"></span></button>' +
        '</div><div class="phone-fotogram-dm-messages">';
    (dm.messages || []).forEach(function (m) {
        var isMe = m.from === 'me';
        var bubble = '<div class="phone-fotogram-dm-message' + (isMe ? ' me' : '') + '">';
        if (!isMe) bubble += renderFotogramAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-msg');
        bubble += '<div class="phone-fotogram-dm-bubble' + (isMe ? ' me' : '') + '">';
        if (m.attachment && m.attachment.path) {
            var src = (typeof getAssetUrl === 'function') ? getAssetUrl(m.attachment.path) : m.attachment.path;
            var attKind = m.attachment.kind || getMediaKindFromPath(m.attachment.path);
            if (attKind === 'video') {
                bubble += '<div class="phone-fotogram-dm-attachment"><video src="' + escapeHtmlFg(src || m.attachment.path) + '" controls playsinline preload="metadata"></video></div>';
            } else {
                bubble += '<div class="phone-fotogram-dm-attachment"><img src="' + escapeHtmlFg(src || m.attachment.path) + '" alt="" loading="lazy"></div>';
            }
        } else if (isLikelyMediaPath(m.text)) {
            var autoSrc = (typeof getAssetUrl === 'function') ? getAssetUrl(m.text) : m.text;
            var autoKind = getMediaKindFromPath(m.text);
            if (autoKind === 'video') {
                bubble += '<div class="phone-fotogram-dm-attachment"><video src="' + escapeHtmlFg(autoSrc || m.text) + '" controls playsinline preload="metadata"></video></div>';
            } else {
                bubble += '<div class="phone-fotogram-dm-attachment"><img src="' + escapeHtmlFg(autoSrc || m.text) + '" alt="" loading="lazy"></div>';
            }
        }
        bubble += '<span class="phone-fotogram-dm-bubble-text">' + escapeHtmlFg(isLikelyMediaPath(m.text) ? '' : (m.text || '')) + '</span></div></div>';
        html += bubble;
    });
    var anonAskedSwap = dm.anonAskedSwap === true || (dm.messages || []).some(function (m) {
        if (m.from === 'me') return false;
        var t = (m.text || '').toLowerCase();
        var hints = getFotogramDmSwapKeywordHints();
        for (var i = 0; i < hints.length; i++) {
            if (hints[i] && t.indexOf(hints[i]) >= 0) return true;
        }
        return false;
    });
    html += '</div><div class="phone-fotogram-dm-actions">';
    if (!dm.blocked) {
        if (dm.isInteractive === false) {
            if (dm.simpleThanksSent !== true) {
                html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + escapeHtmlFg(dm.id) + '" data-reply-key="thanks_auto">' + escapeHtmlFg(getFotogramDmRuntimeText('quickReplyButtonText')) + '</button>';
            }
        } else {
            var hasScenarioChoices = dm.flowState && Array.isArray(dm.flowState.currentChoices) && dm.flowState.currentChoices.length > 0;
            if (hasScenarioChoices) {
                var scenarioChoices = normalizeFotogramScenarioChoices(dm.flowState.currentChoices);
                var hasSwapChoice = false;
                scenarioChoices.forEach(function (c) {
                    if (!c) return;
                    if (c.requiresSwap && !canUseSwapInFotogramDm(vars)) return;
                    if (c.requiresSwap) hasSwapChoice = true;
                    html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + escapeHtmlFg(dm.id) + '" data-reply-key="' + escapeHtmlFg(c.key || '') + '">' + escapeHtmlFg(getFotogramChoiceLabel(c, dm)) + '</button>';
                });
                if (anonAskedSwap && !hasSwapChoice && canUseSwapInFotogramDm(vars) && !dm.flowState.ghosted) {
                    html += '<button type="button" class="phone-fotogram-dm-quick promote" data-action="promote" data-dm-id="' + escapeHtmlFg(dm.id) + '">' + escapeHtmlFg(getFotogramDmRuntimeText('giveNumberButtonText')) + '</button>';
                }
            } else if (!hasFotogramScenarioConfigLoaded()) {
                var replies = getFotogramQuickReplies();
                var byKey = {};
                replies.forEach(function (r) { if (r && r.key) byKey[r.key] = r; });
                var startKeys = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMStartReplyKeys) && setup.fotogramDMStartReplyKeys.length)
                    ? setup.fotogramDMStartReplyKeys
                    : getFotogramDmLegacyReplyKeys();
                var keysToShow = Array.isArray(dm.availableReplyKeys) ? dm.availableReplyKeys : startKeys;
                var activeReplies = keysToShow.map(function (k) { return byKey[k]; }).filter(function (r) {
                    if (!r) return false;
                    if (r.key === 'swap_yes' && !canUseSwapInFotogramDm(vars)) return false;
                    return true;
                });
                var hasSwapYesChoice = false;
                activeReplies.forEach(function (r) {
                    if (r && r.key === 'swap_yes') hasSwapYesChoice = true;
                    html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + escapeHtmlFg(dm.id) + '" data-reply-key="' + escapeHtmlFg(r.key || '') + '">' + escapeHtmlFg(r.playerText || r.key) + '</button>';
                });
                if (anonAskedSwap && !hasSwapYesChoice && canUseSwapInFotogramDm(vars)) html += '<button type="button" class="phone-fotogram-dm-quick promote" data-action="promote" data-dm-id="' + escapeHtmlFg(dm.id) + '">' + escapeHtmlFg(getFotogramDmRuntimeText('giveNumberButtonText')) + '</button>';
            } else if (anonAskedSwap && canUseSwapInFotogramDm(vars) && !(dm.flowState && dm.flowState.ghosted)) {
                html += '<button type="button" class="phone-fotogram-dm-quick promote" data-action="promote" data-dm-id="' + escapeHtmlFg(dm.id) + '">' + escapeHtmlFg(getFotogramDmRuntimeText('giveNumberButtonText')) + '</button>';
            }
        }
        html += '<button type="button" class="phone-fotogram-dm-quick block-btn" data-action="block" data-dm-id="' + escapeHtmlFg(dm.id) + '">' + escapeHtmlFg(getFotogramDmRuntimeText('blockButtonText')) + '</button>';
    }
    html += '</div></div>';
    return html;
}

window.updateFotogramEngagement = updateFotogramEngagement;
window.updateFotogramEngagementHourly = updateFotogramEngagementHourly;
window.drainFotogramNotifications = drainFotogramNotifications;
window.processFotogramDMReply = processFotogramDMReply;
window.blockFotogramDM = blockFotogramDM;
window.deleteFotogramDM = deleteFotogramDM;
window.getFotogramDMById = getFotogramDMById;
window.isFotogramPostable = isFotogramPostable;
window.getFotogramPostForPath = getFotogramPostForPath;
window.phoneCreateFotogramPost = phoneCreateFotogramPost;
window.phoneRenderFotogramApp = phoneRenderFotogramApp;
window.phoneDebugFotogramSetup = function () { return validateFotogramSetup((typeof State !== 'undefined' && State.variables) ? State.variables : null, { logAlways: true }); };
