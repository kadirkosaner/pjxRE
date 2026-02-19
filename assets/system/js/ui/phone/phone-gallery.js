/* ==========================================
   PHONE GALLERY MODULE - Folders + Grid
   Gallery: folder grid, then media grid per folder
========================================== */

/**
 * Get list of media items for a folder
 * @param {object} gallery - vars.phoneGallery
 * @param {string} folder - 'photos' | 'videos' | 'received'
 * @returns {{ item: object, kind: string, category: string }[]}
 */
function getGalleryItemsForFolder(gallery, folder) {
    if (!gallery || !gallery.photos || !gallery.videos) return [];
    var out = [];
    if (folder === 'photos') {
        ['normal', 'cute', 'hot', 'spicy'].forEach(function (cat) {
            var list = gallery.photos[cat];
            if (Array.isArray(list)) list.forEach(function (item) { out.push({ item: item, kind: 'photo', category: cat }); });
        });
    } else if (folder === 'videos') {
        ['normal', 'cute', 'hot', 'spicy'].forEach(function (cat) {
            var list = gallery.videos[cat];
            if (Array.isArray(list)) list.forEach(function (item) { out.push({ item: item, kind: 'video', category: cat }); });
        });
    } else if (folder === 'received') {
        var pr = gallery.photos.received;
        var vr = gallery.videos.received;
        if (Array.isArray(pr)) pr.forEach(function (item) { out.push({ item: item, kind: 'photo', category: 'received' }); });
        if (Array.isArray(vr)) vr.forEach(function (item) { out.push({ item: item, kind: 'video', category: 'received' }); });
    } else if (folder === 'fotogram_received' || folder === 'fotogram_sended') {
        ensureFotogramGalleryBucket(gallery);
        var dir = folder === 'fotogram_received' ? 'received' : 'sended';
        var fl = gallery.fotogram[dir];
        if (Array.isArray(fl)) {
            fl.forEach(function (item) {
                var kind = item.kind || inferGalleryMediaKind(item.path);
                out.push({ item: item, kind: kind === 'video' ? 'video' : 'photo', category: 'fotogram_' + dir });
            });
        }
    }
    return out;
}

/**
 * Count items per folder (for folder grid labels)
 */
function getGalleryFolderCounts(gallery) {
    if (!gallery || !gallery.photos || !gallery.videos) return { photos: 0, videos: 0, received: 0, fotogram: 0, fotogram_received: 0, fotogram_sended: 0 };
    ensureFotogramGalleryBucket(gallery);
    var photos = 0, videos = 0, received = 0;
    ['normal', 'cute', 'hot', 'spicy'].forEach(function (cat) {
        if (Array.isArray(gallery.photos[cat])) photos += gallery.photos[cat].length;
        if (Array.isArray(gallery.videos[cat])) videos += gallery.videos[cat].length;
    });
    if (Array.isArray(gallery.photos.received)) received += gallery.photos.received.length;
    if (Array.isArray(gallery.videos.received)) received += gallery.videos.received.length;
    var fgReceived = Array.isArray(gallery.fotogram.received) ? gallery.fotogram.received.length : 0;
    var fgSended = Array.isArray(gallery.fotogram.sended) ? gallery.fotogram.sended.length : 0;
    return { photos: photos, videos: videos, received: received, fotogram: fgReceived + fgSended, fotogram_received: fgReceived, fotogram_sended: fgSended };
}

function getAssetUrl(path) {
    return (typeof window.getPhoneAssetUrl === 'function') ? window.getPhoneAssetUrl(path) : (path || '');
}

function inferGalleryMediaKind(path) {
    return /\.mp4$|\.webm$|\.mov$|\.ogg$/i.test(String(path || '')) ? 'video' : 'photo';
}

function ensureFotogramGalleryBucket(gallery) {
    if (!gallery) return;
    if (!gallery.fotogram || typeof gallery.fotogram !== 'object') gallery.fotogram = {};
    if (!Array.isArray(gallery.fotogram.received)) gallery.fotogram.received = [];
    if (!Array.isArray(gallery.fotogram.sended)) gallery.fotogram.sended = [];
}

/**
 * Render gallery app: folder grid or media grid
 * @param {object} vars - State.variables
 * @param {object} opts - { galleryFolder: string | null } from phoneViewState
 * @returns {string} HTML
 */
function phoneRenderGalleryApp(vars, opts) {
    var gallery = vars.phoneGallery || { photos: {}, videos: {} };
    ensureFotogramGalleryBucket(gallery);
    var folder = (opts && opts.galleryFolder) ? opts.galleryFolder : null;

    if (!folder) {
        var counts = getGalleryFolderCounts(gallery);
        var folderLabel = function (key, label) {
            var n = counts[key] || 0;
            return '<div class="phone-gallery-folder" id="phone-gallery-folder-' + key + '" data-folder="' + key + '" role="button" tabindex="0" onclick="typeof window.openGalleryFolder===\'function\'&&window.openGalleryFolder(\'' + key + '\');return false;">' +
                '<div class="phone-gallery-folder-inner">' +
                '<span class="phone-gallery-folder-label">' + label + '</span>' +
                '<span class="phone-gallery-folder-count">' + n + '</span>' +
                '</div></div>';
        };
        return '<div class="phone-gallery-folders">' +
            folderLabel('photos', 'Photos') +
            folderLabel('videos', 'Videos') +
            folderLabel('received', 'Received') +
            folderLabel('fotogram', 'Fotogram') +
            '</div>';
    }

    if (folder === 'fotogram') {
        var fgCounts = getGalleryFolderCounts(gallery);
        var fgLabel = function (key, label) {
            var n = fgCounts[key] || 0;
            return '<div class="phone-gallery-folder" id="phone-gallery-folder-' + key + '" data-folder="' + key + '" role="button" tabindex="0" onclick="typeof window.openGalleryFolder===\'function\'&&window.openGalleryFolder(\'' + key + '\');return false;">' +
                '<div class="phone-gallery-folder-inner">' +
                '<span class="phone-gallery-folder-label">' + label + '</span>' +
                '<span class="phone-gallery-folder-count">' + n + '</span>' +
                '</div></div>';
        };
        return '<div class="phone-gallery-folders">' +
            fgLabel('fotogram_received', 'Received') +
            fgLabel('fotogram_sended', 'Sended') +
            '</div>';
    }

    var items = getGalleryItemsForFolder(gallery, folder);
    if (items.length === 0) {
        return '<div class="phone-gallery-empty">' +
            '<p class="phone-app-placeholder-text">No media</p>' +
            '<p class="phone-app-placeholder-sub">This folder is empty.</p>' +
            '</div>';
    }

    var folderTitles = { photos: 'Photos', videos: 'Videos', received: 'Received', fotogram: 'Fotogram', fotogram_received: 'Fotogram Received', fotogram_sended: 'Fotogram Sended' };
    var title = folderTitles[folder] || folder;
    var cells = items.map(function (entry) {
        var it = entry.item;
        var path = (it.path && String(it.path).trim()) ? it.path : '';
        var src = path ? getAssetUrl(path) : '';
        var isVideo = entry.kind === 'video';
        var thumb = isVideo
            ? (src ? '<video class="phone-gallery-thumb-img" src="' + src.replace(/"/g, '&quot;') + '" muted preload="metadata"></video>' : '<div class="phone-gallery-thumb-placeholder">Video</div>')
            : (path ? '<img class="phone-gallery-thumb-img" src="' + (src || path).replace(/"/g, '&quot;') + '" alt="" loading="lazy">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>');
        var safeId = (it.id || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        var safeCat = (entry.category || '').replace(/'/g, "\\'");
        var repeatCount = Number(it.repeatCount || 1);
        var typeBadge = isVideo ? 'V' : 'P';
        var repeatBadge = repeatCount > 1 ? '<span class="phone-gallery-repeat-badge">' + typeBadge + '</span>' : '';
        return '<div class="phone-gallery-cell" data-id="' + safeId + '" data-kind="' + entry.kind + '" data-category="' + safeCat + '" data-folder="' + folder + '" onclick="typeof window.openGalleryPreview===\'function\'&&window.openGalleryPreview(\'' + safeId + '\',\'' + entry.kind + '\',\'' + safeCat + '\',\'' + folder + '\');return false;">' + thumb + repeatBadge + '</div>';
    }).join('');

    return '<div class="phone-gallery-grid" data-folder="' + folder + '">' + cells + '</div>';
}

/**
 * Find a gallery item by id across all categories (photos + videos).
 * @param {object} gallery - vars.phoneGallery
 * @param {string} id - item id
 * @returns {{ item: object, kind: string, category: string, folder: string } | null}
 */
function findGalleryItemById(gallery, id) {
    if (!gallery || !id) return null;
    ensureFotogramGalleryBucket(gallery);
    var cats = ['normal', 'cute', 'hot', 'spicy', 'received'];
    for (var k = 0; k < cats.length; k++) {
        var list = gallery.photos && gallery.photos[cats[k]];
        if (Array.isArray(list)) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) return { item: list[i], kind: 'photo', category: cats[k], folder: cats[k] === 'received' ? 'received' : 'photos' };
            }
        }
    }
    for (var j = 0; j < cats.length; j++) {
        var vlist = gallery.videos && gallery.videos[cats[j]];
        if (Array.isArray(vlist)) {
            for (var vi = 0; vi < vlist.length; vi++) {
                if (vlist[vi].id === id) return { item: vlist[vi], kind: 'video', category: cats[j], folder: cats[j] === 'received' ? 'received' : 'videos' };
            }
        }
    }
    var dirs = ['received', 'sended'];
    for (var d = 0; d < dirs.length; d++) {
        var dir = dirs[d];
        var flist = gallery.fotogram && gallery.fotogram[dir];
        if (!Array.isArray(flist)) continue;
        for (var fi = 0; fi < flist.length; fi++) {
            if (flist[fi] && flist[fi].id === id) {
                return { item: flist[fi], kind: (flist[fi].kind || inferGalleryMediaKind(flist[fi].path)), category: 'fotogram_' + dir, folder: 'fotogram_' + dir };
            }
        }
    }
    return null;
}

/**
 * Find a gallery item by id in the given folder/category/kind
 */
function findGalleryItem(gallery, id, kind, category, folder) {
    var list = null;
    if (folder === 'received') {
        list = kind === 'photo' ? (gallery.photos && gallery.photos.received) : (gallery.videos && gallery.videos.received);
    } else if (folder === 'fotogram_received' || folder === 'fotogram_sended') {
        ensureFotogramGalleryBucket(gallery);
        list = folder === 'fotogram_received' ? gallery.fotogram.received : gallery.fotogram.sended;
    } else if (folder === 'photos' && gallery.photos) {
        list = gallery.photos[category];
    } else if (folder === 'videos' && gallery.videos) {
        list = gallery.videos[category];
    }
    if (!Array.isArray(list)) return null;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
    }
    return null;
}

/**
 * Open full-screen preview for a gallery item (photo or video). Back closes it.
 * @param {string} id - item id
 * @param {string} kind - 'photo' | 'video'
 * @param {string} category - 'normal' | 'cute' | 'hot' | 'spicy' | 'received'
 * @param {string} folder - 'photos' | 'videos' | 'received'
 */
window.openGalleryPreview = function (id, kind, category, folder) {
    if (!id || typeof PhoneAPI === 'undefined' || !PhoneAPI.State || !PhoneAPI.State.variables) return;
    var vars = PhoneAPI.State.variables;
    var gallery = vars.phoneGallery || { photos: {}, videos: {} };
    var item = findGalleryItem(gallery, id, kind, category, folder);
    if (!item) return;
    var path = (item.path && String(item.path).trim()) ? item.path : '';
    var infoText;
    var counter = Number(item.repeatCount || 1);
    if (folder === 'fotogram_received' || folder === 'fotogram_sended') {
        infoText = 'Type: ' + (kind === 'video' ? 'Video' : 'Photo') + '\nCounter: ' + counter;
    } else if (folder === 'received' && item.from && typeof getPhoneContactFullName === 'function') {
        infoText = 'Type: ' + (kind === 'video' ? 'Video' : 'Photo');
    } else {
        var quality = (item.quality != null) ? Number(item.quality) : 0;
        infoText = 'Type: ' + (kind === 'video' ? 'Video' : 'Photo') + '\nQuality: ' + quality + '/100';
    }
    var src = path ? getAssetUrl(path) : '';
    var safeSrc = (src || path).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var mediaHtml;
    if (kind === 'video') {
        var autoplaySet = !!(vars && vars.videoSettings && vars.videoSettings.autoplaySet !== undefined ? vars.videoSettings.autoplaySet : true);
        var loopSet = !!(vars && vars.videoSettings && vars.videoSettings.loopSet !== undefined ? vars.videoSettings.loopSet : true);
        mediaHtml = path
            ? '<div class="video-container phone-gallery-video-container" data-autoplay="' + (autoplaySet ? '1' : '0') + '" data-loop="' + (loopSet ? '1' : '0') + '">' +
                '<video class="phone-camera-preview-img" src="' + safeSrc + '" playsinline></video>' +
                '<div class="play-overlay"><div class="video-play-btn"><span class="icon icon-play"></span></div></div>' +
              '</div>'
            : '<div class="phone-camera-preview-placeholder">No video</div>';
    } else {
        mediaHtml = path
            ? '<img class="phone-camera-preview-img" src="' + safeSrc + '" alt="">'
            : '<div class="phone-camera-preview-placeholder">No image</div>';
    }
    var html = '<div class="phone-gallery-preview-overlay">' +
        '<div class="phone-camera-preview-media">' +
        '<button type="button" class="phone-gallery-preview-info overlay" data-tooltip="' + (typeof escapeHtml === 'function' ? escapeHtml(infoText || '') : (infoText || '')) + '"><span class="icon icon-info icon-16"></span></button>' +
        mediaHtml +
        '</div>' +
        '</div>';
    var $view = typeof $ !== 'undefined' ? $('#phone-app-view') : null;
    if (!$view || !$view.length) return;
    $view.find('.phone-gallery-preview-overlay').remove();
    $view.append(html);
    if (typeof window.initTooltips === 'function') window.initTooltips();
    if (kind === 'video') {
        var $container = $view.find('.phone-gallery-video-container').first();
        if ($container.length && typeof window.initPhoneFotogramVideoPlayer === 'function') {
            window.initPhoneFotogramVideoPlayer($container, { muted: false, volumeFromSettings: true, eventNamespace: 'phoneVid' }, vars);
        }
    }
    if (typeof $ !== 'undefined' && $('#phone-app-view-title').length) {
        $('#phone-app-view-title').text(kind === 'video' ? 'Video' : 'Photo');
    }
};

if (typeof window.phoneGalleryAddItem !== 'function') {
    window.phoneGalleryAddItem = function (path, opts) {
        if (!path || typeof path !== 'string') return null;
        path = path.trim();
        var vars = (typeof State !== 'undefined' && State.variables)
            ? State.variables
            : (typeof window.PhoneAPI !== 'undefined' && window.PhoneAPI.State && window.PhoneAPI.State.variables)
                ? window.PhoneAPI.State.variables
                : null;
        if (!vars || !vars.phoneGallery) return null;
        opts = opts || {};
        ensureFotogramGalleryBucket(vars.phoneGallery);
        var scope = String(opts.scope || '').toLowerCase();
        if (scope === 'fotogram') {
            var direction = (String(opts.direction || '').toLowerCase() === 'sended') ? 'sended' : 'received';
            var kindFg = (opts.kind === 'video' || opts.kind === 'videos' || inferGalleryMediaKind(path) === 'video') ? 'video' : 'photo';
            var fgList = vars.phoneGallery.fotogram[direction];
            var existingFg = fgList.find(function (el) { return el && el.path === path; });
            if (existingFg) {
                existingFg.repeatCount = Number(existingFg.repeatCount || 1) + 1;
                var now = vars.timeSys || {};
                existingFg.lastSeenAt = { day: now.day, month: now.month, year: now.year, hour: now.hour, minute: now.minute };
                if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
                return existingFg;
            }
            var fgTime = vars.timeSys || {};
            var fgId = (typeof generateMediaId === 'function')
                ? generateMediaId()
                : ('media_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
            var fgItem = {
                id: fgId,
                path: path,
                kind: kindFg,
                repeatCount: 1,
                flags: Array.isArray(opts.flags) ? opts.flags : ['fotogram'],
                timestamp: { day: fgTime.day, month: fgTime.month, year: fgTime.year, hour: fgTime.hour, minute: fgTime.minute },
                quality: (opts.quality != null && opts.quality >= 0 && opts.quality <= 100) ? parseInt(opts.quality, 10) : 50,
                from: (opts.from != null && opts.from !== '') ? opts.from : (direction === 'received' ? 'unknown' : 'player')
            };
            fgList.push(fgItem);
            if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
            return fgItem;
        }
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
        var generatedId = (typeof generateMediaId === 'function')
            ? generateMediaId()
            : ('media_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
        var item = {
            id: generatedId,
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
}

window.phoneRenderGalleryApp = phoneRenderGalleryApp;
window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.gallery = { render: phoneRenderGalleryApp };
