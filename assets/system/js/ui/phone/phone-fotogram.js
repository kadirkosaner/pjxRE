/* ==========================================
   PHONE FOTOGRAM APP - Feed, Post, My Posts
   Data: $phoneFotogramPosts, $phoneFollowers, $phoneLastFotogramPostDate
========================================== */

var FOTOGRAM_POST_COOLDOWN_DAYS = 3;
var FOTOGRAM_NOT_POSTABLE_FLAGS = ['topless', 'nude', 'explicit'];
var FOTOGRAM_ANON_NAMES = ['Anonymous Fan', 'Secret Admirer', 'Curious Follower', 'Unknown User'];
var FOTOGRAM_DM_FIRST_MSGS = ['Love your latest post!', 'Hey, nice photo!', 'You look amazing!', 'Great content!'];
var FOTOGRAM_HOURLY_WINDOW_HOURS = 3;
var FOTOGRAM_HOURLY_SHARE = 0.4;
var FOTOGRAM_DAILY_SHARE = 0.6;
var FOTOGRAM_ACTIVE_DAYS_MIN = 3;
var FOTOGRAM_ACTIVE_DAYS_MAX = 5;
var FOTOGRAM_COMMENT_NAMES_FALLBACK = ['moonvibe', 'wildpeach', 'nocturna'];
var FOTOGRAM_COMMENT_TEMPLATES_FALLBACK = { default: ['Looking great!', 'Nice!'] };

/**
 * Check if a gallery item can be posted to Fotogram (Instagram-style: no topless/nude).
 * @param {object} item - Gallery item { flags: string[], from: string }
 * @returns {boolean}
 */
function isFotogramPostable(item) {
    if (!item) return false;
    if (item.from !== 'player') return false;
    var flags = item.flags || [];
    for (var i = 0; i < FOTOGRAM_NOT_POSTABLE_FLAGS.length; i++) {
        if (flags.indexOf(FOTOGRAM_NOT_POSTABLE_FLAGS[i]) >= 0) return false;
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
        var minCd = (typeof setup !== 'undefined' && setup.fotogramPostCooldownMinDays) ? Number(setup.fotogramPostCooldownMinDays) : 2;
        var maxCd = (typeof setup !== 'undefined' && setup.fotogramPostCooldownMaxDays) ? Number(setup.fotogramPostCooldownMaxDays) : 4;
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
    var cooldownDays = Number(vars.phoneFotogramCooldownDays) || FOTOGRAM_POST_COOLDOWN_DAYS;
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
    var commentRatio = (typeof setup !== 'undefined' && Number(setup.fotogramCommentLikeRatio) > 0) ? Number(setup.fotogramCommentLikeRatio) : 0.08;
    var maxCommentsTotal = Math.max(1, Math.floor(maxLikesTotal * commentRatio));
    var activeDays = Math.floor(Math.random() * (FOTOGRAM_ACTIVE_DAYS_MAX - FOTOGRAM_ACTIVE_DAYS_MIN + 1)) + FOTOGRAM_ACTIVE_DAYS_MIN;
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
    var minCd = (typeof setup !== 'undefined' && setup.fotogramPostCooldownMinDays) ? Number(setup.fotogramPostCooldownMinDays) : 2;
    var maxCd = (typeof setup !== 'undefined' && setup.fotogramPostCooldownMaxDays) ? Number(setup.fotogramPostCooldownMaxDays) : 4;
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
    html += '<button type="button" class="phone-fotogram-tab' + (sub === 'dm' ? ' active' : '') + '" data-tab="dm" aria-label="Messages"><span class="icon icon-message icon-22"></span></button>';
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
        var cr = (typeof setup !== 'undefined' && Number(setup.fotogramCommentLikeRatio) > 0) ? Number(setup.fotogramCommentLikeRatio) : 0.08;
        plan.maxCommentsTotal = Math.max(1, Math.floor((plan.maxLikesTotal || 0) * cr));
    }
    if (plan.activeDays == null || plan.activeDays < 1) {
        plan.activeDays = Math.floor(Math.random() * (FOTOGRAM_ACTIVE_DAYS_MAX - FOTOGRAM_ACTIVE_DAYS_MIN + 1)) + FOTOGRAM_ACTIVE_DAYS_MIN;
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
    post.likes = (post.likes || 0) + likesDelta;
    post.followersGained = (post.followersGained || 0) + followersDelta;
    vars.phoneFollowers = (vars.phoneFollowers || 0) + followersDelta;
    if (!Array.isArray(post.comments)) post.comments = [];
    var commentsNow = post.comments.length;
    var commentRatio = (typeof setup !== 'undefined' && Number(setup.fotogramCommentLikeRatio) > 0) ? Number(setup.fotogramCommentLikeRatio) : 0.08;
    var commentsCap = Math.max(commentsNow, Math.floor((post.likes || 0) * commentRatio), Number(plan.maxCommentsTotal) || 0);
    var commentsRemainingGlobal = Math.max(0, commentsCap - commentsNow);
    var phaseShare = (phase === 'hourly') ? FOTOGRAM_HOURLY_SHARE : FOTOGRAM_DAILY_SHARE;
    var phaseCommentTarget = Math.floor(commentsCap * phaseShare);
    var phaseCommentsGiven = (phase === 'hourly')
        ? Math.min(commentsNow, phaseCommentTarget)
        : Math.max(0, commentsNow - Math.floor(commentsCap * FOTOGRAM_HOURLY_SHARE));
    var phaseCommentsRemaining = Math.max(0, phaseCommentTarget - phaseCommentsGiven);
    var commentRollBase = likesDelta + (followersDelta * 2);
    var generatedComments = Math.max(0, Math.min(3, Math.floor(commentRollBase / 12)));
    if (generatedComments > commentsRemainingGlobal) generatedComments = commentsRemainingGlobal;
    if (generatedComments > phaseCommentsRemaining) generatedComments = phaseCommentsRemaining;
    if (generatedComments > 0) {
        for (var c = 0; c < generatedComments; c++) {
            post.comments.push(createFotogramCommentForPost(vars, post));
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
        if (plan.hourlyHoursProcessed >= FOTOGRAM_HOURLY_WINDOW_HOURS) continue;
        var hourlyLikesTarget = Math.floor(plan.maxLikesTotal * FOTOGRAM_HOURLY_SHARE);
        var hourlyFollowersTarget = Math.floor(plan.maxFollowersTotal * FOTOGRAM_HOURLY_SHARE);
        var likesGiven = Math.min(Number(post.likes) || 0, hourlyLikesTarget);
        var followersGiven = Math.min(Number(post.followersGained) || 0, hourlyFollowersTarget);
        var hoursLeft = FOTOGRAM_HOURLY_WINDOW_HOURS - plan.hourlyHoursProcessed;
        var processNow = Math.min(countHours, hoursLeft);
        for (var h = 0; h < processNow; h++) {
            var step = plan.hourlyHoursProcessed;
            var likesRemaining = Math.max(0, hourlyLikesTarget - likesGiven);
            var followersRemaining = Math.max(0, hourlyFollowersTarget - followersGiven);
            if (likesRemaining <= 0 && followersRemaining <= 0) {
                plan.hourlyHoursProcessed++;
                continue;
            }
            var isLastHour = step >= FOTOGRAM_HOURLY_WINDOW_HOURS - 1;
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
        if (plan.dailyDaysProcessed >= plan.activeDays) continue;
        var dailyLikesTarget = Math.max(0, Math.floor(plan.maxLikesTotal * FOTOGRAM_DAILY_SHARE));
        var dailyFollowersTarget = Math.max(0, Math.floor(plan.maxFollowersTotal * FOTOGRAM_DAILY_SHARE));
        var dailyLikesGiven = Math.max(0, (Number(post.likes) || 0) - Math.floor(plan.maxLikesTotal * FOTOGRAM_HOURLY_SHARE));
        var dailyFollowersGiven = Math.max(0, (Number(post.followersGained) || 0) - Math.floor(plan.maxFollowersTotal * FOTOGRAM_HOURLY_SHARE));
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
    var templates = (typeof setup !== 'undefined' && setup.fotogramCommentTemplates) ? setup.fotogramCommentTemplates : FOTOGRAM_COMMENT_TEMPLATES_FALLBACK;
    var byFlag = templates[flagKey];
    if (!Array.isArray(byFlag) || byFlag.length === 0) byFlag = templates.default;
    if (!Array.isArray(byFlag) || byFlag.length === 0) byFlag = FOTOGRAM_COMMENT_TEMPLATES_FALLBACK.default;
    var authorPool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramCommentNames) && setup.fotogramCommentNames.length)
        ? setup.fotogramCommentNames
        : FOTOGRAM_COMMENT_NAMES_FALLBACK;
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
    var cfg = (typeof setup !== 'undefined' && setup.charGenerator) ? setup.charGenerator : {};
    var ageMin = Number(cfg.ageMin);
    var ageMax = Number(cfg.ageMax);
    if (!Number.isFinite(ageMin)) ageMin = 18;
    if (!Number.isFinite(ageMax)) ageMax = 60;
    if (ageMax < ageMin) { var t = ageMax; ageMax = ageMin; ageMin = t; }
    return { min: ageMin, max: ageMax };
}

function getFotogramDmThresholds() {
    var minConfidence = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMinConfidenceInteractive)))
        ? Number(setup.fotogramDmMinConfidenceInteractive)
        : 30;
    var minCorruptionSwap = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMinCorruptionSwap)))
        ? Number(setup.fotogramDmMinCorruptionSwap)
        : 2;
    return {
        minConfidenceInteractive: Math.max(0, minConfidence),
        minCorruptionSwap: Math.max(0, minCorruptionSwap)
    };
}

function canUseInteractiveFotogramDm(vars) {
    var thresholds = getFotogramDmThresholds();
    var confidence = Number(vars && vars.confidence);
    if (!Number.isFinite(confidence)) confidence = 0;
    return confidence >= thresholds.minConfidenceInteractive;
}

function canUseSwapInFotogramDm(vars) {
    var thresholds = getFotogramDmThresholds();
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
        var cfg = (typeof setup !== 'undefined' && setup.charGenerator) ? setup.charGenerator : {};
        var maleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMaleWeight)))
            ? Number(setup.fotogramDmMaleWeight)
            : Number(cfg.maleWeight != null ? cfg.maleWeight : 0.7);
        var femaleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmFemaleWeight)))
            ? Number(setup.fotogramDmFemaleWeight)
            : Number(cfg.femaleWeight != null ? cfg.femaleWeight : 0.3);
        if (!Number.isFinite(maleW) || maleW < 0) maleW = 0.5;
        if (!Number.isFinite(femaleW) || femaleW < 0) femaleW = 0.5;
        var totalW = maleW + femaleW;
        var picked = (totalW <= 0) ? (Math.random() < 0.5 ? 'male' : 'female') : (Math.random() < (maleW / totalW) ? 'male' : 'female');
        profile.gender = normalizeGenderLabel(picked);
    }
    if (!Number.isFinite(Number(profile.age)) || Number(profile.age) < ageRange.min || Number(profile.age) > ageRange.max) {
        profile.age = ageRange.min + Math.floor(Math.random() * (ageRange.max - ageRange.min + 1));
    }
    return { gender: profile.gender, age: Number(profile.age) };
}

function createFotogramDM(vars, post, opts) {
    opts = opts || {};
    var isInteractive = opts.interactive !== false;
    var dms = vars.phoneFotogramDMs || [];
    var anonNames = (typeof setup !== 'undefined' && setup.fotogramAnonNames) ? setup.fotogramAnonNames : FOTOGRAM_ANON_NAMES;
    var byFlag = (typeof setup !== 'undefined' && setup.fotogramDMMessagesByFlag) ? setup.fotogramDMMessagesByFlag : null;
    var charConfig = (typeof setup !== 'undefined' && setup.fotogramAnonCharConfig) ? setup.fotogramAnonCharConfig : {};
    var postFlags = post.flags || [];
    var flagKey = getBestFlagMatch(postFlags);
    var charId = null;
    var skinTone;
    var firstMsg;
    var pool = (typeof setup !== 'undefined' && setup.fotogramAnonCharPool) ? setup.fotogramAnonCharPool : [];
    if (Array.isArray(pool) && pool.length > 0) {
        charId = pool[Math.floor(Math.random() * pool.length)];
    } else if (pool && typeof pool === 'object' && !Array.isArray(pool)) {
        var keys = Object.keys(pool);
        if (keys.length > 0) charId = pool[keys[Math.floor(Math.random() * keys.length)]];
    }
    var cfg = charId && charConfig[charId] ? charConfig[charId] : null;
    var dmProfile = pickFotogramDmProfile(vars, charId);
    if (cfg && cfg.skinTone) {
        skinTone = cfg.skinTone;
    } else {
        var skinTones = (typeof setup !== 'undefined' && setup.fotogramAnonSkinTones) ? setup.fotogramAnonSkinTones : ['white', 'black', 'tan'];
        skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    }
    if (!isInteractive) {
        var encouragingMsgs = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingMessages) && setup.fotogramDMEncouragingMessages.length)
            ? setup.fotogramDMEncouragingMessages
            : ['Keep it up!'];
        firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedEncouragingIndices', encouragingMsgs) || encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)])
            : (encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)]);
        firstMsg = firstMsg || 'Keep it up!';
        charId = null;
    } else if (cfg && cfg.firstMessagesByFlag && cfg.firstMessagesByFlag[flagKey] && cfg.firstMessagesByFlag[flagKey].length) {
        var charPool = cfg.firstMessagesByFlag[flagKey];
        var charMsgKey = 'phoneFotogramDMUsedFirstMsgChar_' + (charId || '') + '_' + flagKey;
        firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, charMsgKey, charPool) || charPool[Math.floor(Math.random() * charPool.length)])
            : (charPool[Math.floor(Math.random() * charPool.length)]);
    } else if (byFlag && byFlag[flagKey] && byFlag[flagKey].length) {
        var globalMsgKey = 'phoneFotogramDMUsedFirstMsg_' + flagKey;
        firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, globalMsgKey, byFlag[flagKey]) || byFlag[flagKey][Math.floor(Math.random() * byFlag[flagKey].length)])
            : (byFlag[flagKey][Math.floor(Math.random() * byFlag[flagKey].length)]);
    } else {
        firstMsg = 'Hey! Nice post!';
    }
    var anonName = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedAnonNameIndices', anonNames) || anonNames[Math.floor(Math.random() * anonNames.length)])
        : (anonNames[Math.floor(Math.random() * anonNames.length)]);
    var dmId = 'fotodm_' + Date.now();
    var startReplyKeys = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMStartReplyKeys) && setup.fotogramDMStartReplyKeys.length)
        ? setup.fotogramDMStartReplyKeys.slice()
        : ['hi', 'thanks', 'who'];
    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    var dm = {
        id: dmId,
        postId: post.id,
        anonId: dmId,
        anonName: anonName,
        skinTone: skinTone,
        charId: charId,
        blocked: false,
        messages: [{ from: dmId, text: firstMsg, time: time, read: false }],
        availableReplyKeys: isInteractive ? startReplyKeys : [],
        isInteractive: isInteractive,
        simpleThanksSent: false,
        profileGender: dmProfile.gender,
        profileAge: dmProfile.age,
        promotedToCharId: null
    };
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

var FOTOGRAM_DM_REPLIES_FALLBACK = [
    {
        key: 'hi',
        playerText: 'Hi! Thanks for the message!',
        anonReplies: { default: { text: 'Oh you actually replied! That made my day. What are you up to today?' } },
        nextReplyKeys: ['vibe', 'busy']
    },
    {
        key: 'thanks',
        playerText: 'Thanks, that\'s sweet!',
        anonReplies: { default: { text: 'Of course! Just being honest. I\'ll let you get back to it.' } },
        endConversation: true
    },
    {
        key: 'who',
        playerText: 'Who is this?',
        anonReplies: { default: { text: 'Just someone who appreciates your content. We can keep chatting if you want.' } },
        nextReplyKeys: ['hi', 'vibe']
    },
    {
        key: 'vibe',
        playerText: 'Just chilling. You?',
        anonReplies: { default: { text: 'Same here. Want to swap numbers?' } },
        nextReplyKeys: ['swap_yes', 'swap_later']
    },
    {
        key: 'busy',
        playerText: 'Bit busy right now.',
        anonReplies: { default: { text: 'No worries. Text me when you are free.' } },
        endConversation: true
    },
    {
        key: 'swap_yes',
        playerText: 'Yeah, let\'s swap numbers.',
        anonReplies: { default: { text: 'Perfect. Hit "Give number" and I\'ll add you.' } },
        endConversation: true
    },
    {
        key: 'swap_later',
        playerText: 'Maybe later.',
        anonReplies: { default: { text: 'All good. I\'ll be around.' } },
        endConversation: true
    }
];

function getFotogramQuickReplies() {
    if (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMQuickReplies) && setup.fotogramDMQuickReplies.length) {
        return setup.fotogramDMQuickReplies;
    }
    return FOTOGRAM_DM_REPLIES_FALLBACK;
}

function getFotogramEncouragingReplyMessage() {
    var pool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingReplyMessages) && setup.fotogramDMEncouragingReplyMessages.length)
        ? setup.fotogramDMEncouragingReplyMessages
        : ['Thanks! I appreciate the support.'];
    return pool[Math.floor(Math.random() * pool.length)] || 'Thanks! I appreciate the support.';
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

function processFotogramDMReply(vars, dmId, replyKey) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm || dm.blocked) return;
    if (dm.isInteractive === false) {
        if (replyKey !== 'thanks_auto' || dm.simpleThanksSent === true) return;
        var tSimple = vars.timeSys || {};
        var timeSimple = { day: tSimple.day, month: tSimple.month, year: tSimple.year, hour: tSimple.hour, minute: tSimple.minute };
        dm.messages = dm.messages || [];
        dm.messages.push({ from: 'me', text: getFotogramEncouragingReplyMessage(), time: timeSimple, read: true });
        dm.simpleThanksSent = true;
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        return;
    }
    if (!canUseInteractiveFotogramDm(vars)) return;
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
        anonReply = (cr[flagKey]) ? cr[flagKey] : cr.default || { text: 'Thanks for replying!' };
    } else {
        anonReply = (reply.anonReplies && reply.anonReplies[flagKey]) ? reply.anonReplies[flagKey] : (reply.anonReplies && reply.anonReplies.default) ? reply.anonReplies.default : { text: 'Thanks for replying!' };
    }
    var t = vars.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    dm.messages = dm.messages || [];
    dm.messages.push({ from: 'me', text: reply.playerText, time: time, read: true });
    var anonMsg = { from: dm.anonId, text: anonReply.text, time: time, read: false };
    var photoFrom = dm.charId || dm.anonId;
    if (anonReply.photoPath) {
        anonMsg.attachment = { path: anonReply.photoPath, from: photoFrom };
        if (typeof window.phoneGalleryAddItem === 'function') {
            window.phoneGalleryAddItem(anonReply.photoPath, { category: 'received', from: photoFrom, quality: 50 });
        }
    } else if (anonReply.photoPool) {
        var rawSkin = dm.skinTone || 'tan';
        var skinMap = { light: 'white', medium: 'tan', dark: 'black', white: 'white', black: 'black', tan: 'tan' };
        var skinKey = skinMap[rawSkin] || rawSkin;
        var pool = (cfg && cfg.photoPool) ? cfg.photoPool : ((typeof setup !== 'undefined' && setup.fotogramDMPhotoPool) ? setup.fotogramDMPhotoPool : {});
        var poolEntry = pool[flagKey] || pool.default;
        var paths = (poolEntry && poolEntry[skinKey]) ? poolEntry[skinKey] : (poolEntry && poolEntry.tan) ? poolEntry.tan : [];
        if (Array.isArray(paths) && paths.length > 0) {
            var path = paths[Math.floor(Math.random() * paths.length)];
            anonMsg.attachment = { path: path, from: photoFrom };
            if (typeof window.phoneGalleryAddItem === 'function') {
                window.phoneGalleryAddItem(path, { category: 'received', from: photoFrom, quality: 50 });
            }
        }
    }
    dm.messages.push(anonMsg);
    var anonText = (anonReply.text || '').toLowerCase();
    if (anonText.indexOf('swap') >= 0 || anonText.indexOf('numara') >= 0) dm.anonAskedSwap = true;
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
}

function blockFotogramDM(vars, dmId) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm) return;
    dm.blocked = true;
    if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
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
    var infoGender = normalizeGenderLabel(dm.profileGender);
    var infoAge = Number(dm.profileAge);
    var infoAgeText = (Number.isFinite(infoAge) && infoAge >= 18 && infoAge <= 60) ? infoAge : 'Unknown';
    var infoText = 'Gender: ' + infoGender + '\nAge: ' + infoAgeText;
    var html = '<div class="phone-fotogram-dm-thread"><div class="phone-fotogram-dm-thread-header">' + renderFotogramAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-thread') + '<span class="phone-fotogram-dm-thread-name">' + escapeHtmlFg(dm.anonName || 'Unknown') + '</span><button type="button" class="phone-fotogram-dm-thread-info" data-tooltip="' + escapeHtmlFg(infoText) + '" aria-label="Profile info"><span class="icon icon-info icon-16"></span></button></div><div class="phone-fotogram-dm-messages">';
    (dm.messages || []).forEach(function (m) {
        var isMe = m.from === 'me';
        var bubble = '<div class="phone-fotogram-dm-message' + (isMe ? ' me' : '') + '">';
        if (!isMe) bubble += renderFotogramAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-msg');
        bubble += '<div class="phone-fotogram-dm-bubble' + (isMe ? ' me' : '') + '">';
        if (m.attachment && m.attachment.path) {
            var src = (typeof getAssetUrl === 'function') ? getAssetUrl(m.attachment.path) : m.attachment.path;
            bubble += '<div class="phone-fotogram-dm-attachment"><img src="' + escapeHtmlFg(src || m.attachment.path) + '" alt="" loading="lazy"></div>';
        }
        bubble += '<span class="phone-fotogram-dm-bubble-text">' + escapeHtmlFg(m.text || '') + '</span></div></div>';
        html += bubble;
    });
    var anonAskedSwap = dm.anonAskedSwap === true || (dm.messages || []).some(function (m) {
        if (m.from === 'me') return false;
        var t = (m.text || '').toLowerCase();
        return t.indexOf('swap') >= 0 || t.indexOf('numara') >= 0;
    });
    html += '</div><div class="phone-fotogram-dm-actions">';
    if (!dm.blocked) {
        if (dm.isInteractive === false) {
            if (dm.simpleThanksSent !== true) {
                html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + escapeHtmlFg(dm.id) + '" data-reply-key="thanks_auto">Reply</button>';
            }
        } else {
            if (!canUseInteractiveFotogramDm(vars)) {
                html += '<div class="phone-fotogram-dm-locked-text">You are not open for that yet.</div>';
                html += '<button type="button" class="phone-fotogram-dm-quick block-btn" data-action="block" data-dm-id="' + escapeHtmlFg(dm.id) + '">Block</button>';
                html += '</div></div>';
                return html;
            }
            var replies = getFotogramQuickReplies();
            var byKey = {};
            replies.forEach(function (r) { if (r && r.key) byKey[r.key] = r; });
            var startKeys = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMStartReplyKeys) && setup.fotogramDMStartReplyKeys.length)
                ? setup.fotogramDMStartReplyKeys
                : ['hi', 'thanks', 'who'];
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
            if (anonAskedSwap && !hasSwapYesChoice && canUseSwapInFotogramDm(vars)) html += '<button type="button" class="phone-fotogram-dm-quick promote" data-action="promote" data-dm-id="' + escapeHtmlFg(dm.id) + '">Give number</button>';
        }
        html += '<button type="button" class="phone-fotogram-dm-quick block-btn" data-action="block" data-dm-id="' + escapeHtmlFg(dm.id) + '">Block</button>';
    }
    html += '</div></div>';
    return html;
}

window.updateFotogramEngagement = updateFotogramEngagement;
window.updateFotogramEngagementHourly = updateFotogramEngagementHourly;
window.drainFotogramNotifications = drainFotogramNotifications;
window.processFotogramDMReply = processFotogramDMReply;
window.blockFotogramDM = blockFotogramDM;
window.getFotogramDMById = getFotogramDMById;
window.isFotogramPostable = isFotogramPostable;
window.getFotogramPostForPath = getFotogramPostForPath;
window.phoneCreateFotogramPost = phoneCreateFotogramPost;
window.phoneRenderFotogramApp = phoneRenderFotogramApp;
