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

/**
 * Shared video player init for Fotogram (preview + feed). Options: muted, volumeFromSettings, eventNamespace.
 * @param {jQuery} $container - Container with data-loop, data-autoplay, child video and .play-overlay
 * @param {Object} options - { muted: boolean, volumeFromSettings: boolean, eventNamespace: string }
 * @param {Object} vars - State.variables for videoSettings when volumeFromSettings true
 */
function initPhoneFotogramVideoPlayer($container, options, vars) {
    if (!$container || !$container.length) return;
    var $video = $container.find('video').first();
    var $overlay = $container.find('.play-overlay').first();
    if (!$video.length) return;
    var videoEl = $video[0];
    var opts = options || {};
    var ns = opts.eventNamespace || 'phoneFgVid';
    var loopEnabled = $container.attr('data-loop') === '1';
    var autoplayEnabled = $container.attr('data-autoplay') === '1';
    videoEl.loop = loopEnabled;
    /* Match <<vid>> macro behavior: size container by real video ratio (prevents blank/zero-height boxes). */
    $video.off('loadedmetadata.' + ns).on('loadedmetadata.' + ns, function () {
        var w = videoEl.videoWidth;
        var h = videoEl.videoHeight;
        if (w && h) {
            $container.css('aspect-ratio', w + ' / ' + h);
        }
    });
    if (opts.muted) {
        videoEl.muted = true;
        videoEl.defaultMuted = true;
        videoEl.volume = 0;
    } else if (opts.volumeFromSettings && vars && vars.videoSettings) {
        videoEl.muted = false;
        var master = vars.videoSettings.masterVolume !== undefined ? Number(vars.videoSettings.masterVolume) : 100;
        var videoVol = vars.videoSettings.videoVolume !== undefined ? Number(vars.videoSettings.videoVolume) : 100;
        videoEl.volume = Math.max(0, Math.min(1, (master * videoVol) / 10000));
    }
    $container.off('click.' + ns).on('click.' + ns, function () {
        if (videoEl.paused) videoEl.play();
        else videoEl.pause();
    });
    $video.off('play.' + ns + ' playing.' + ns).on('play.' + ns + ' playing.' + ns, function () {
        $overlay.addClass('hidden');
    });
    $video.off('pause.' + ns + ' ended.' + ns).on('pause.' + ns + ' ended.' + ns, function () {
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

window.initFotogramPreviewVideoPlayer = function (vars) {
    if (typeof $ === 'undefined') return;
    var $view = $('#phone-app-view-content');
    if (!$view.length) return;
    var $container = $view.find('.phone-fotogram-preview-video-container').first();
    initPhoneFotogramVideoPlayer($container, { muted: false, volumeFromSettings: true, eventNamespace: 'phoneVid' }, vars);
};

window.initFotogramFeedVideoPlayers = function (vars) {
    if (typeof $ === 'undefined') return;
    var $view = $('#phone-app-view-content');
    if (!$view.length) return;
    $view.find('.phone-fotogram-post-video-container').each(function () {
        initPhoneFotogramVideoPlayer($(this), { muted: true, volumeFromSettings: false, eventNamespace: 'phoneFgFeed' }, vars);
    });
};

/** Expose shared video player init for use by gallery and other phone UIs. */
window.initPhoneFotogramVideoPlayer = initPhoneFotogramVideoPlayer;

/** Init video players in Fotogram DM thread (same custom player as gallery/feed). */
window.initFotogramDmThreadVideoPlayers = function (vars) {
    var viewEl = document.getElementById('phone-app-view-content');
    if (!viewEl) return;
    var J = (typeof $ !== 'undefined') ? $ : (typeof PhoneAPI !== 'undefined' && PhoneAPI.$) ? PhoneAPI.$ : null;
    if (!J) return;
    var $view = J(viewEl);
    $view.find('.phone-fotogram-dm-video-container').each(function () {
        initPhoneFotogramVideoPlayer(J(this), { muted: false, volumeFromSettings: true, eventNamespace: 'phoneFgDm' }, vars);
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

/* ==========================================
   FOTOGRAM DM (NON-INTERACTIVE ONLY)
   Runtime policy, creation, replies, render
========================================== */
function getFotogramDmPolicy(vars, post) {
    var followersTotal = Math.max(0, Number(vars && vars.phoneFollowers) || 0);
    var quality = Math.max(0, Number(post && post.quality) || 0);
    var interactiveMinFollowers = getFotogramSetupNumber('fotogramDmInteractiveMinFollowers');
    var interactiveMinQuality = getFotogramSetupNumber('fotogramDmInteractiveMinQuality');
    if (!Number.isFinite(interactiveMinFollowers)) interactiveMinFollowers = 100;
    if (!Number.isFinite(interactiveMinQuality)) interactiveMinQuality = 50;
    var shouldUseInteractive = !(followersTotal < interactiveMinFollowers && quality < interactiveMinQuality);
    if (quality < 50) {
        if (followersTotal < 100) return { targetCount: 0, interactive: false };
        return { targetCount: resolveLowQualityDmTargetCount(post), interactive: shouldUseInteractive };
    }
    if (followersTotal < 100) return { targetCount: 0, interactive: false };
    if (followersTotal >= 5000) return { targetCount: 3, interactive: shouldUseInteractive };
    if (followersTotal >= 3000) return { targetCount: 2, interactive: shouldUseInteractive };
    if (followersTotal >= 1000) return { targetCount: 1, interactive: shouldUseInteractive };
    return { targetCount: 1, interactive: shouldUseInteractive };
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
        var dm = createFotogramDM(vars, post);
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

function addFotogramNotification(vars, type, refId) {
    if (!vars.phoneNotifications) vars.phoneNotifications = { fotogram: [], finder: [] };
    if (!vars.phoneNotifications.fotogram) vars.phoneNotifications.fotogram = [];
    vars.phoneNotifications.fotogram.push({ id: 'fgnotif_' + Date.now(), type: type, refId: refId });
}

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

window.updateFotogramEngagement = updateFotogramEngagement;
window.updateFotogramEngagementHourly = updateFotogramEngagementHourly;
window.isFotogramPostable = isFotogramPostable;
window.getFotogramPostForPath = getFotogramPostForPath;
window.phoneCreateFotogramPost = phoneCreateFotogramPost;
window.phoneRenderFotogramApp = phoneRenderFotogramApp;
window.phoneDebugFotogramSetup = function () { return validateFotogramSetup((typeof State !== 'undefined' && State.variables) ? State.variables : null, { logAlways: true }); };
window.getFotogramDmPolicy = getFotogramDmPolicy;
window.getFotogramDmThreadModeForPost = function (vars, post) {
    var policy = getFotogramDmPolicy(vars, post);
    return policy && policy.interactive ? 'interactive' : 'non_interactive';
};