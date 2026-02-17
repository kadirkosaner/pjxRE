/* ==========================================
   PHONE INDEX - Main entry, overlay, events
========================================== */

var PhoneAPI = null;
var phoneViewState = { app: null, sub: 'list', threadCharId: null, pickerFor: null, meetup: null, calendarOffset: 0, galleryFolder: null, fotogramSub: 'feed', fotogramDmThread: null, fotogramSharePreview: null, fotogramPostDetail: null, pendingTopicChoice: null, pendingTopicChoicePhotoPick: null };

window.PhoneInit = function (API) {
    PhoneAPI = API;
};

function getUnreadFotogramDmThreadsCount(vars) {
    if (!vars || !Array.isArray(vars.phoneFotogramDMs)) return 0;
    var dms = vars.phoneFotogramDMs;
    var unread = 0;
    for (var i = 0; i < dms.length; i++) {
        var dm = dms[i];
        if (!dm || dm.blocked || dm.promotedToCharId) continue;
        var msgs = Array.isArray(dm.messages) ? dm.messages : [];
        var hasUnread = false;
        for (var mi = 0; mi < msgs.length; mi++) {
            var m = msgs[mi];
            if (m && m.from !== 'me' && m.read !== true) {
                hasUnread = true;
                break;
            }
        }
        if (hasUnread) unread++;
    }
    return unread;
}

function getAppContent(action, vars) {
    if (action === 'camera' && typeof window.phoneRenderCameraApp === 'function') {
        var rawLoc = (vars && vars.location) || (PhoneAPI && PhoneAPI.State && (PhoneAPI.State.variables && PhoneAPI.State.variables.location || PhoneAPI.State.passage)) || '';
        var locationId = (rawLoc && (rawLoc.indexOf('/') >= 0 || rawLoc.indexOf('\\') >= 0)) ? rawLoc.split(/[/\\]/).pop() : (rawLoc || '');
        return window.phoneRenderCameraApp(vars, { locationId: locationId });
    }
    var app = window.PhoneApps && window.PhoneApps[action];
    if (app && typeof app.render === 'function') {
        return app.render(vars);
    }
    if (action === 'gallery' && typeof window.phoneRenderGalleryApp === 'function') {
        return window.phoneRenderGalleryApp(vars, { galleryFolder: phoneViewState.galleryFolder });
    }
    return '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">Coming soon</p><p class="phone-app-placeholder-sub">This app is not available yet.</p></div>';
}

function updatePhoneBadges() {
    if (!PhoneAPI) return;
    var v = PhoneAPI.State.variables;
    var msgCount = (typeof window.phoneUnreadCount === 'function') ? window.phoneUnreadCount() : 0;
    var fotogramCount = getUnreadFotogramDmThreadsCount(v);
    var finderCount = (v.phoneNotifications && v.phoneNotifications.finder) ? v.phoneNotifications.finder.length : 0;
    var badges = { messages: msgCount, fotogram: fotogramCount, finder: finderCount };
    $('#phone-overlay .phone-app').each(function () {
        var action = $(this).data('action');
        var n = badges[action];
        var $badge = $(this).find('.phone-app-badge');
        if (n > 0) {
            if (!$badge.length) $(this).find('.phone-app-icon').append('<span class="phone-app-badge">' + (n > 99 ? '99+' : n) + '</span>');
            else $badge.text(n > 99 ? '99+' : n);
        } else {
            $badge.remove();
        }
    });
    var total = msgCount + fotogramCount + finderCount;
    var $preview = $('.right-bar .phone-preview');
    if ($preview.length) {
        var html = total > 0
            ? '<div class="message-item"><div class="message-info"><div class="message-name">New Notifications</div></div><div class="message-count">' + (total > 99 ? '99+' : total) + '</div></div>'
            : '<div class="phone-empty"><div class="phone-empty-text">No new notifications</div></div>';
        $preview.html(html);
    }
    $(document).trigger('phoneBadgesUpdated');
}

function showAppView(action) {
    if (!PhoneAPI) return;
    phoneViewState.app = action;
    phoneViewState.sub = 'list';
    phoneViewState.threadCharId = null;
    phoneViewState.pickerFor = null;
    phoneViewState.meetup = null;
    var vars = PhoneAPI.State.variables;
    if (action === 'calendar') phoneViewState.calendarOffset = 0;
    if (action === 'gallery') phoneViewState.galleryFolder = null;
    if (action === 'fotogram') {
        phoneViewState.fotogramSub = 'feed';
        phoneViewState.fotogramDmThread = null;
        phoneViewState.fotogramSharePreview = null;
        phoneViewState.fotogramPostDetail = null;
        // Do not auto-clear Fotogram notifications on open.
    }
    var $view = $('#phone-app-view');
    var $title = $('#phone-app-view-title');
    var $content = $('#phone-app-view-content');
    if (!$view.length || !$title.length || !$content.length) return;
    if (action === 'fotogram' && phoneViewState.fotogramSub === 'dm' && phoneViewState.fotogramDmThread) {
        $title.text('Messages');
    } else if (action === 'fotogram' && phoneViewState.fotogramPostDetail) {
        $title.text('Post');
    } else {
        $title.text(PHONE_APP_NAMES[action] || action);
    }
    $content.html(getAppContent(action, vars));
    if (action === 'fotogram') initFotogramMediaPlayers(vars);
    if (action === 'fotogram' && phoneViewState.fotogramSub === 'dm' && phoneViewState.fotogramDmThread) {
        scrollPhoneThreadToBottom();
    }
    $view.show();
    $('#phone-overlay .phone-home').hide();
    
    // Re-initialize tooltips for new content
    if (typeof window.initTooltips === 'function') {
        window.initTooltips();
    }
}

function hideAppView() {
    $('#phone-app-view').hide();
    $('#phone-overlay .phone-home').show();
}

function scrollPhoneThreadToBottom() {
    var root = document.getElementById('phone-app-view-content');
    if (!root) return;
    var dmActions = root.querySelector('.phone-fotogram-dm-actions');
    if (dmActions) {
        var focusActions = function () {
            if (typeof dmActions.scrollIntoView === 'function') {
                dmActions.scrollIntoView({ block: 'end', inline: 'nearest' });
            }
        };
        focusActions();
        // Re-focus actions when media finishes loading and changes layout height.
        var mediaNodes = root.querySelectorAll('.phone-fotogram-dm-attachment img, .phone-fotogram-dm-attachment video');
        mediaNodes.forEach(function (el) {
            if (!el || el.dataset.actionsFocusBound === '1') return;
            el.dataset.actionsFocusBound = '1';
            var onReady = function () { focusActions(); };
            if (el.tagName && el.tagName.toLowerCase() === 'img') {
                if (el.complete) focusActions();
                else {
                    el.addEventListener('load', onReady, { once: true });
                    el.addEventListener('error', onReady, { once: true });
                }
            } else {
                var rs = Number(el.readyState) || 0;
                if (rs >= 1) focusActions();
                else {
                    el.addEventListener('loadedmetadata', onReady, { once: true });
                    el.addEventListener('error', onReady, { once: true });
                }
            }
        });
        return;
    }
    var topicList = root.querySelector('.phone-topic-list');
    if (topicList) {
        topicList.scrollTop = 0;
        var firstTopic = topicList.querySelector('.phone-topic-item');
        if (firstTopic && typeof firstTopic.scrollIntoView === 'function') {
            firstTopic.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        return;
    }
    var resolveTarget = function () {
        var dmMessages = root.querySelector('.phone-fotogram-dm-messages');
        var dmContent = root.querySelector('.phone-fotogram-content');
        var threadBubbles = root.querySelector('.phone-thread-bubbles');
        if (dmMessages && dmMessages.scrollHeight > dmMessages.clientHeight + 2) return dmMessages;
        if (dmContent && dmContent.scrollHeight > dmContent.clientHeight + 2) return dmContent;
        if (threadBubbles && threadBubbles.scrollHeight > threadBubbles.clientHeight + 2) return threadBubbles;
        if (dmMessages) return dmMessages;
        if (dmContent) return dmContent;
        if (threadBubbles) return threadBubbles;
        return root;
    };
    var run = function () {
        var t = resolveTarget();
        if (!t) return;
        t.scrollTop = t.scrollHeight;
        var lastThreadMsg = root.querySelector('.phone-thread-bubbles .phone-msg-bubble:last-child');
        if (lastThreadMsg && typeof lastThreadMsg.scrollIntoView === 'function') {
            lastThreadMsg.scrollIntoView({ block: 'end', inline: 'nearest' });
        }
    };
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(run);
    else run();
}

function initFotogramMediaPlayers(vars) {
    if (typeof window.initFotogramFeedVideoPlayers === 'function') {
        window.initFotogramFeedVideoPlayers(vars);
    }
    if (typeof window.initFotogramPreviewVideoPlayer === 'function') {
        window.initFotogramPreviewVideoPlayer(vars);
    }
}

function handleAppClick(action) {
    if (!action) return;
    showAppView(action);
}

window.openGalleryFolder = function (folder) {
    if (!PhoneAPI || !folder) return;
    phoneViewState.galleryFolder = folder;
    var titles = { photos: 'Photos', videos: 'Videos', received: 'Received' };
    var $title = $('#phone-app-view-title');
    var $content = $('#phone-app-view-content');
    if ($title.length) $title.text(titles[folder] || folder);
    if ($content.length && typeof window.phoneRenderGalleryApp === 'function') {
        $content.html(window.phoneRenderGalleryApp(PhoneAPI.State.variables, { galleryFolder: folder }));
    }
};

window.openPhoneOverlay = function () {
    if (!PhoneAPI) return;
    $('#phone-overlay').remove();
    createPhoneOverlay();
    $('#phone-overlay').addClass('active');
};

function closePhoneOverlay() {
    $('#phone-overlay').removeClass('active');
    $(document).trigger('phoneBadgesUpdated');
}

function createPhoneOverlay() {
    if (!PhoneAPI) return;
    var vars = PhoneAPI.State.variables;
    if (cleanupExpiredMeetups(vars)) persistPhoneChanges();
    var timeSys = vars.timeSys || { hour: 0, minute: 0 };
    var timeSysHour = timeSys.hour.toString().padStart(2, '0');
    var timeSysMinute = timeSys.minute.toString().padStart(2, '0');
    var notificationMessages = (typeof window.phoneUnreadCount === 'function') ? window.phoneUnreadCount() : 0;
    var notificationFotogram = getUnreadFotogramDmThreadsCount(vars);
    var notificationFinder = (vars.phoneNotifications && vars.phoneNotifications.finder) ? vars.phoneNotifications.finder.length : 0;
    var apps = [
        { name: 'Camera', icon: 'assets/content/phone/icons/icon_camera.webp', action: 'camera', badge: 0 },
        { name: 'Contacts', icon: 'assets/content/phone/icons/icon_calls.webp', action: 'contacts', badge: 0 },
        { name: 'Messages', icon: 'assets/content/phone/icons/icon_messages.webp', action: 'messages', badge: notificationMessages },
        { name: 'Gallery', icon: 'assets/content/phone/icons/icon_gallery.webp', action: 'gallery', badge: 0 },
        { name: 'Calendar', icon: 'assets/content/phone/icons/icon_calendar.webp', action: 'calendar', badge: 0 },
        { name: 'Fotogram', icon: 'assets/content/phone/icons/icon_fotogram.webp', action: 'fotogram', badge: notificationFotogram },
        { name: 'Finder', icon: 'assets/content/phone/icons/icon_finder.webp', action: 'finder', badge: notificationFinder }
    ];
    var appsHtml = apps.map(function(app) {
        return '<div class="phone-app" data-action="' + app.action + '"><div class="phone-app-icon"><img src="' + app.icon + '" alt="' + app.name + '">' + (app.badge > 0 ? '<span class="phone-app-badge">' + (app.badge > 99 ? '99+' : app.badge) + '</span>' : '') + '</div><div class="phone-app-name">' + app.name + '</div></div>';
    }).join('');
    var html = '<div class="overlay overlay-dark phone-overlay" id="phone-overlay"><div class="phone-device"><div class="phone-device-header"><div class="phone-device-notch"><div class="notch-camera"></div><div class="notch-speaker"></div><div class="notch-sensor"></div></div><span class="status-time">' + timeSysHour + ':' + timeSysMinute + '</span></div><div class="phone-device-screen"><div class="phone-home"><div class="phone-apps-container"><div class="phone-apps-grid">' + appsHtml + '</div></div><div class="phone-action-area"><button type="button" class="phone-close-btn" id="phone-close">Put the phone down</button></div></div><div class="phone-app-view" id="phone-app-view" style="display: none;"><div class="phone-app-view-header"><button type="button" class="phone-app-back" id="phone-app-back" aria-label="Back"><span class="icon icon-chevron-left icon-24"></span></button><span class="phone-app-view-title" id="phone-app-view-title"></span></div><div class="phone-app-view-content" id="phone-app-view-content"></div></div></div><div class="phone-device-home-indicator"></div></div></div>';
    PhoneAPI.$('body').append(html);

    // Re-initialize tooltips for phone overlay content
    if (typeof window.initTooltips === 'function') {
        window.initTooltips();
    }

    $('#phone-overlay').on('click', function (e) {
        var $t = $(e.target);
        if ($t.closest('#phone-close').length || $t.hasClass('phone-close-btn')) {
            e.preventDefault();
            closePhoneOverlay();
        }
    });

    $('.phone-app').on('click', function () {
        handleAppClick($(this).data('action'));
    });

    $('#phone-app-back').on('click', function () {
        if (!PhoneAPI) return;
        var vars = PhoneAPI.State.variables;
        if (phoneViewState.app === 'camera' && $('#phone-app-view').find('.phone-camera-preview-overlay').length) {
            $('#phone-app-view').find('.phone-camera-preview-overlay').remove();
            $('#phone-app-view-title').text(PHONE_APP_NAMES.camera || 'Camera');
            $('#phone-app-view-content').html(getAppContent('camera', vars));
            if (typeof window.initTooltips === 'function') window.initTooltips();
            return;
        }
        if (phoneViewState.app === 'gallery' && $('#phone-app-view').find('.phone-gallery-preview-overlay').length) {
            $('#phone-app-view').find('.phone-gallery-preview-overlay').remove();
            var titles = { photos: 'Photos', videos: 'Videos', received: 'Received' };
            $('#phone-app-view-title').text(titles[phoneViewState.galleryFolder] || phoneViewState.galleryFolder || 'Gallery');
            return;
        }
        if (phoneViewState.app === 'gallery' && phoneViewState.galleryFolder) {
            phoneViewState.galleryFolder = null;
            $('#phone-app-view-title').text(PHONE_APP_NAMES.gallery || 'Gallery');
            $('#phone-app-view-content').html(getAppContent('gallery', vars));
            return;
        }
        if (phoneViewState.app && phoneViewState.sub === 'topics') {
            phoneViewState.sub = 'thread';
            var charId = phoneViewState.threadCharId;
            $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
            $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
            scrollPhoneThreadToBottom();
            updatePhoneBadges();
        } else if (phoneViewState.app && phoneViewState.sub === 'thread') {
            phoneViewState.sub = 'contacts';
            phoneViewState.threadCharId = null;
            phoneViewState.meetup = null;
            if (phoneViewState.pickerFor === 'message') {
                $('#phone-app-view-title').text('New message');
                $('#phone-app-view-content').html(getContactListHtml(vars));
            } else {
                phoneViewState.sub = 'list';
                phoneViewState.pickerFor = null;
                $('#phone-app-view-title').text(PHONE_APP_NAMES[phoneViewState.app] || phoneViewState.app);
                $('#phone-app-view-content').html(getAppContent(phoneViewState.app, vars));
            }
            updatePhoneBadges();
        } else if (phoneViewState.app && phoneViewState.sub === 'contacts') {
            phoneViewState.sub = 'list';
            phoneViewState.pickerFor = null;
            $('#phone-app-view-title').text(PHONE_APP_NAMES[phoneViewState.app] || phoneViewState.app);
            $('#phone-app-view-content').html(getAppContent(phoneViewState.app, vars));
            updatePhoneBadges();
        } else if (phoneViewState.app === 'fotogram') {
            if (phoneViewState.fotogramSub === 'share' && phoneViewState.fotogramSharePreview) {
                phoneViewState.fotogramSharePreview = null;
                $('#phone-app-view-title').text('Share from Gallery');
                $('#phone-app-view-content').html(getAppContent('fotogram', vars));
                initFotogramMediaPlayers(vars);
            } else if (phoneViewState.fotogramSub === 'feed' && phoneViewState.fotogramPostDetail) {
                phoneViewState.fotogramPostDetail = null;
                $('#phone-app-view-title').text(PHONE_APP_NAMES.fotogram || 'Fotogram');
                $('#phone-app-view-content').html(getAppContent('fotogram', vars));
                initFotogramMediaPlayers(vars);
            } else if (phoneViewState.fotogramDmThread) {
                phoneViewState.fotogramDmThread = null;
                $('#phone-app-view-title').text('Messages');
                $('#phone-app-view-content').html(getAppContent('fotogram', vars));
                initFotogramMediaPlayers(vars);
            } else if (phoneViewState.fotogramSub && phoneViewState.fotogramSub !== 'feed') {
                phoneViewState.fotogramSub = 'feed';
                $('#phone-app-view-title').text(PHONE_APP_NAMES.fotogram || 'Fotogram');
                $('#phone-app-view-content').html(getAppContent('fotogram', vars));
                initFotogramMediaPlayers(vars);
            } else {
                hideAppView();
            }
        } else {
            hideAppView();
        }
    });

    $('#phone-overlay').on('click', '#phone-calendar-prev', function () {
        if (!PhoneAPI) return;
        if (phoneViewState.calendarOffset <= 0) return;
        phoneViewState.calendarOffset--;
        $('#phone-app-view-content').html(getAppContent('calendar', PhoneAPI.State.variables));
    });
    $('#phone-overlay').on('click', '#phone-calendar-next', function () {
        if (!PhoneAPI) return;
        if (phoneViewState.calendarOffset >= 9) return;
        phoneViewState.calendarOffset++;
        $('#phone-app-view-content').html(getAppContent('calendar', PhoneAPI.State.variables));
    });

    $('#phone-overlay').on('click', '#phone-new-message', function () {
        if (!PhoneAPI) return;
        phoneViewState.sub = 'contacts';
        phoneViewState.pickerFor = 'message';
        $('#phone-app-view-title').text('New message');
        $('#phone-app-view-content').html(getContactListHtml(PhoneAPI.State.variables));
    });

    $('#phone-overlay').on('click', '.phone-contact-pick', function () {
        var charId = $(this).data('char-id');
        if (!charId || !PhoneAPI) return;
        var vars = PhoneAPI.State.variables;
        var $content = $('#phone-app-view-content');
        if (phoneViewState.pickerFor === 'message') {
            phoneViewState.sub = 'thread';
            phoneViewState.threadCharId = charId;
            phoneViewState.meetup = null;
            markConversationReadInState(charId, vars);
            $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
            $content.html(getMessagesThreadHtml(charId, vars));
            scrollPhoneThreadToBottom();
            updatePhoneBadges();
        } else if (phoneViewState.pickerFor === 'call') {
            if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<phoneCallLog "' + charId + '" "out">>');
            phoneViewState.sub = 'list';
            phoneViewState.pickerFor = null;
            $('#phone-app-view-title').text(PHONE_APP_NAMES.contacts || 'Contacts');
            $content.html(getAppContent('contacts', PhoneAPI.State.variables));
        }
    });

    $('#phone-overlay').on('click', '.phone-contact-block-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var charId = $(this).data('char-id');
        if (!charId || !PhoneAPI) return;
        var vars = PhoneAPI.State.variables;
        var name = getPhoneContactFullName(charId, vars);
        var msg = 'You are blocking this person and deleting their number. If you block them you will not be able to communicate with them again. Telling this person about it could cause problems in your relationship.';
        showBlockConfirmModal(name, msg, function () {
            var v = PhoneAPI.State.variables;
            blockPhoneContact(charId, v);
            $('#phone-app-view-content').html(getAppContent('contacts', v));
            updatePhoneBadges();
        });
    });

    $('#phone-overlay').on('click', '.phone-conv-item:not(.phone-contact-pick)', function () {
        if (phoneViewState.app === 'contacts') return;
        var charId = $(this).data('char-id');
        if (!charId || !PhoneAPI) return;
        phoneViewState.sub = 'thread';
        phoneViewState.threadCharId = charId;
        phoneViewState.meetup = null;
        var vars = PhoneAPI.State.variables;
        markConversationReadInState(charId, vars);
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '#phone-talk-btn', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        ensureTalkTopicsLoaded();
        var vars = PhoneAPI.State.variables;
        phoneViewState.sub = 'topics';
        $('#phone-app-view-title').text('Talk - ' + getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getTopicListHtml(charId, vars));
    });

    $('#phone-overlay').on('click', '#phone-where-btn', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        if (!charId) return;
        var v = PhoneAPI.State.variables;
        var t = v.timeSys || {};
        var today = { day: t.day, month: t.month, year: t.year };
        pushPhoneMessage(charId, 'player', 'Where are you?');
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<updateCharacterLocations>>');
        var ch = v.characters && v.characters[charId];
        var status = (ch && ch.currentStatus) || '';
        if (status !== 'sleeping' && status !== 'showering') {
            var locId = (ch && ch.currentLocation) || '';
            var locName = (typeof window.getLocationName === 'function') ? window.getLocationName(locId) : (locId || 'home');
            pushPhoneMessage(charId, charId, "I'm in the " + locName + ".");
        }
        if (!v.phoneWhereAskedLast) v.phoneWhereAskedLast = {};
        v.phoneWhereAskedLast[charId] = { day: today.day, month: today.month, year: today.year, hour: t.hour, minute: t.minute };
        markConversationReadInState(charId, v);
        persistPhoneChanges();
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, v));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, v));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '#phone-meetup-btn', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        var vars = PhoneAPI.State.variables;
        if (!charId || !canShowMeetupButton(charId, vars)) return;
        if (cleanupExpiredMeetups(vars)) persistPhoneChanges();
        if (hasPendingMeetupToday(vars)) {
            pushPhoneMessage(charId, charId, "You already have a meetup scheduled today.");
            markConversationReadInState(charId, vars);
            persistPhoneChanges();
            $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
            scrollPhoneThreadToBottom();
            updatePhoneBadges();
            return;
        }
        pushPhoneMessage(charId, 'player', 'Are you free today?');
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<updateCharacterLocations>>');
        var ch = vars.characters && vars.characters[charId];
        var status = (ch && ch.currentStatus) || '';
        var isFree = status !== 'busy' && status !== 'sleeping' && status !== 'showering';
        if (!isFree) {
            pushPhoneMessage(charId, charId, "Sorry, I'm busy right now.");
            markConversationReadInState(charId, vars);
            persistPhoneChanges();
            phoneViewState.sub = 'thread';
            $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
            $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
            scrollPhoneThreadToBottom();
            updatePhoneBadges();
            return;
        }
        pushPhoneMessage(charId, charId, "I'm free. What time are you thinking?");
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.meetup = { charId: charId, step: 'pick_time' };
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '.phone-meetup-place-item', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        var vars = PhoneAPI.State.variables;
        var placeId = $(this).data('place-id');
        var placeName = $(this).data('place-name');
        if (!charId || !placeId || !phoneViewState.meetup || phoneViewState.meetup.step !== 'pick_place') return;
        var selHour = phoneViewState.meetup.hour;
        var selMinute = phoneViewState.meetup.minute;
        var selDay = phoneViewState.meetup.day;
        var selMonth = phoneViewState.meetup.month;
        var selYear = phoneViewState.meetup.year;
        if (typeof selHour !== 'number' || typeof selMinute !== 'number') return;
        phoneViewState.meetup.placeId = placeId;
        phoneViewState.meetup.placeName = placeName || placeId;
        var hh = String(selHour).padStart(2, '0');
        var mm = String(selMinute).padStart(2, '0');
        pushPhoneMessage(charId, 'player', "Let's meet at " + phoneViewState.meetup.placeName + ".");
        pushPhoneMessage(charId, charId, 'Perfect. See you at ' + phoneViewState.meetup.placeName + ' at ' + hh + ':' + mm + '.');
        pushPhoneMessage(charId, 'player', 'See you there.');
        createMeetupAppointment(charId, phoneViewState.meetup.placeId, phoneViewState.meetup.placeName, selHour, selMinute, vars, { day: selDay, month: selMonth, year: selYear });
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.meetup = null;
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '.phone-meetup-time-item', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        var vars = PhoneAPI.State.variables;
        if (!charId || !phoneViewState.meetup || phoneViewState.meetup.step !== 'pick_time') return;
        var hour = parseInt($(this).data('hour'), 10);
        var minute = parseInt($(this).data('minute') || 0, 10);
        var day = parseInt($(this).data('day'), 10);
        var month = parseInt($(this).data('month'), 10);
        var year = parseInt($(this).data('year'), 10);
        var dayOffset = parseInt($(this).data('day-offset') || 0, 10);
        if (Number.isNaN(hour) || Number.isNaN(minute)) return;
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return;
        if (isMeetupTimeBlocked(hour, minute, vars, { day: day, month: month, year: year })) return;
        var hh = String(hour).padStart(2, '0');
        var mm = String(minute).padStart(2, '0');
        var whenText = dayOffset > 0 ? ('tomorrow at ' + hh + ':' + mm) : (hh + ':' + mm);
        pushPhoneMessage(charId, 'player', 'How about ' + whenText + '?');
        pushPhoneMessage(charId, charId, "I'm available then. Where should we meet?");
        phoneViewState.meetup.hour = hour;
        phoneViewState.meetup.minute = minute;
        phoneViewState.meetup.day = day;
        phoneViewState.meetup.month = month;
        phoneViewState.meetup.year = year;
        phoneViewState.meetup.step = 'pick_place';
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '#phone-meetup-cancel-btn', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        var vars = PhoneAPI.State.variables;
        if (!charId) return;
        pushPhoneMessage(charId, 'player', "Let's plan it another day.");
        pushPhoneMessage(charId, charId, 'Sure, text me when you are ready.');
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.meetup = null;
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '.phone-topic-item', function () {
        if (!PhoneAPI) return;
        var charId = phoneViewState.threadCharId;
        var topicId = $(this).data('topic-id');
        var vars = PhoneAPI.State.variables;
        var topics = getAvailableTalkTopics(charId, vars);
        var topic = topics.filter(function (t) { return t.id === topicId; })[0];
        if (!topic || !charId) return;
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<updateCharacterLocations>>');
        var ch = vars.characters && vars.characters[charId];
        var status = (ch && ch.currentStatus) || '';
        var availableNow = status !== 'sleeping' && status !== 'showering';
        var turns = topic.turns;
        if (topic.variations && Array.isArray(topic.variations) && topic.variations.length > 0) {
            var vIdx = Math.floor(Math.random() * topic.variations.length);
            turns = topic.variations[vIdx];
        }
        if (turns && Array.isArray(turns) && turns.length > 0) {
            if (availableNow) {
                var choiceHit = false;
                console.log('[Topic] Processing topic:', topicId, 'imagePool:', topic.imagePool, 'imageType:', topic.imageType);
                var topicImage = (typeof window.phonePickRandomImage === 'function' && (topic.imagePool || (topic.images && topic.images.length))) ? window.phonePickRandomImage(topic) : null;
                console.log('[Topic] topicImage selected:', topicImage);
                var topicImageType = topic.imageType || null;
                var photoPushed = false;
                for (var i = 0; i < turns.length; i++) {
                    var turn = turns[i];
                    if (turn && turn.type === 'choice' && turn.options && turn.options.length > 0) {
                        phoneViewState.pendingTopicChoice = { charId: charId, topicId: topicId, topic: topic, choiceTurn: turn, topicImage: topicImage, topicImageType: topicImageType, photoPushed: photoPushed };
                        choiceHit = true;
                        break;
                    }
                    var from = (turn.from === 'player') ? 'player' : charId;
                    var text = turn.text || '';
                    var img = null;
                    console.log('[Topic Turn ' + i + '] from:', from, 'text:', text.substring(0, 30) + '...', 'topicImage:', topicImage, 'photoPushed:', photoPushed, 'topicImageType:', topicImageType);
                    if (topicImage && !photoPushed) {
                        if (topicImageType === 'receiver' && from !== 'player') { 
                            img = topicImage; 
                            photoPushed = true;
                            console.log('[Topic Turn ' + i + '] ATTACHING receiver image:', img);
                        }
                        else if (topicImageType === 'sender' && from === 'player') { 
                            img = topicImage; 
                            photoPushed = true; 
                            console.log('[Topic Turn ' + i + '] ATTACHING sender image:', img);
                        }
                    }
                    console.log('[Topic Turn ' + i + '] Calling pushPhoneMessage with img:', img);
                    if (text || img) pushPhoneMessage(charId, from, text, img);
                }
                if (!choiceHit && typeof window.phoneApplyTopicEffects === 'function') window.phoneApplyTopicEffects(charId, topic, vars);
            } else {
                pushPhoneMessage(charId, 'player', turns[0].text || '');
                pushPhoneMessage(charId, charId, 'You waited for a while. No reply... probably not available right now.');
            }
        } else {
            pushPhoneMessage(charId, 'player', topic.message || '');
            if (availableNow) {
                var reply = (topic.replies && topic.replies.length) ? (typeof window.phonePickRandomReply === 'function' ? window.phonePickRandomReply(topic.replies) : topic.replies[0]) : (topic.reply || '');
                if (reply) pushPhoneMessage(charId, charId, reply);
            } else {
                pushPhoneMessage(charId, charId, 'You waited for a while. No reply... probably not available right now.');
            }
        }
        if (availableNow && !phoneViewState.pendingTopicChoice) markTalkTopicUsedToday(charId, topicId, vars);
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    });

    $('#phone-overlay').on('click', '.phone-topic-choice-btn', function () {
        var pending = phoneViewState.pendingTopicChoice;
        if (!PhoneAPI || !pending || pending.charId !== phoneViewState.threadCharId) return;
        var optIdx = parseInt($(this).data('option-index'), 10);
        var options = pending.choiceTurn && pending.choiceTurn.options;
        if (!options || optIdx < 0 || optIdx >= options.length) return;
        var opt = options[optIdx];
        var vars = PhoneAPI.State.variables;
        if (opt.requiresSpicyPhoto) {
            phoneViewState.pendingTopicChoicePhotoPick = { pending: pending, optionIndex: optIdx };
            $('#phone-app-view-content').html(typeof getSpicyPhotoPickerHtml === 'function' ? getSpicyPhotoPickerHtml(vars) : '');
            return;
        }
        applyTopicChoiceOption(pending, optIdx, null);
    });

    function applyTopicChoiceOption(pending, optIdx, selectedImagePath) {
        if (!PhoneAPI || !pending) return;
        var options = pending.choiceTurn && pending.choiceTurn.options;
        if (!options || optIdx < 0 || optIdx >= options.length) return;
        var opt = options[optIdx];
        var charId = pending.charId;
        var vars = PhoneAPI.State.variables;
        var topicImage = pending.topicImage || null;
        var topicImageType = pending.topicImageType || null;
        var photoPushed = pending.photoPushed || false;
        var attachImgToPlayer = topicImage && !photoPushed && topicImageType === 'sender';
        var playerImg = selectedImagePath || (attachImgToPlayer ? topicImage : null);
        pushPhoneMessage(charId, 'player', opt.playerText || '', playerImg);
        if (attachImgToPlayer || selectedImagePath) photoPushed = true;
        if (opt.then && Array.isArray(opt.then)) {
            opt.then.forEach(function (t) {
                var from = (t.from === 'player') ? 'player' : charId;
                var text = t.text || '';
                var img = null;
                if (topicImage && !photoPushed) {
                    if (topicImageType === 'receiver' && from !== 'player') { img = topicImage; photoPushed = true; }
                    else if (topicImageType === 'sender' && from === 'player') { img = topicImage; photoPushed = true; }
                }
                if (text || img) pushPhoneMessage(charId, from, text, img);
            });
        }
        if (typeof window.phoneApplyTopicEffects === 'function') window.phoneApplyTopicEffects(charId, pending.topic, vars);
        markTalkTopicUsedToday(charId, pending.topicId, vars);
        phoneViewState.pendingTopicChoice = null;
        phoneViewState.pendingTopicChoicePhotoPick = null;
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
        updatePhoneBadges();
    }

    $('#phone-overlay').on('click', '.phone-spicy-pick-cell', function () {
        var pick = phoneViewState.pendingTopicChoicePhotoPick;
        if (!pick || !pick.pending || pick.pending.charId !== phoneViewState.threadCharId) return;
        var path = $(this).data('path');
        if (!path) return;
        applyTopicChoiceOption(pick.pending, pick.optionIndex, path);
    });

    $('#phone-overlay').on('click', '.phone-spicy-pick-cancel', function () {
        if (!phoneViewState.pendingTopicChoicePhotoPick || phoneViewState.threadCharId !== phoneViewState.pendingTopicChoicePhotoPick.pending.charId) return;
        phoneViewState.pendingTopicChoicePhotoPick = null;
        var charId = phoneViewState.threadCharId;
        var vars = PhoneAPI ? PhoneAPI.State.variables : {};
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        scrollPhoneThreadToBottom();
    });

    // Camera: Selfie buttons
    $('#phone-overlay').on('click', '#phone-camera-normal', function () {
        if (typeof window.phoneTakeSelfie === 'function') {
            window.phoneTakeSelfie('normal');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-cute', function () {
        if (typeof window.phoneTakeSelfie === 'function') {
            window.phoneTakeSelfie('cute');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-hot', function () {
        if (typeof window.phoneTakeSelfie === 'function') {
            window.phoneTakeSelfie('hot');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-spicy', function () {
        if (typeof window.phoneTakeSelfie === 'function') {
            window.phoneTakeSelfie('spicy');
        }
    });

    // Camera: Video buttons
    $('#phone-overlay').on('click', '#phone-camera-video-normal', function () {
        if (typeof window.phoneRecordVideo === 'function') {
            window.phoneRecordVideo('normal');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-video-cute', function () {
        if (typeof window.phoneRecordVideo === 'function') {
            window.phoneRecordVideo('cute');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-video-hot', function () {
        if (typeof window.phoneRecordVideo === 'function') {
            window.phoneRecordVideo('hot');
        }
    });
    $('#phone-overlay').on('click', '#phone-camera-video-spicy', function () {
        if (typeof window.phoneRecordVideo === 'function') {
            window.phoneRecordVideo('spicy');
        }
    });

    $('#phone-overlay').on('click', '[id^="phone-gallery-folder-"]', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!PhoneAPI) return;
        var folder = $(this).data('folder') || (this.id ? this.id.replace('phone-gallery-folder-', '') : '');
        if (!folder) return;
        phoneViewState.galleryFolder = folder;
        var titles = { photos: 'Photos', videos: 'Videos', received: 'Received' };
        $('#phone-app-view-title').text(titles[folder] || folder);
        $('#phone-app-view-content').html(getAppContent('gallery', PhoneAPI.State.variables));
    });

    $('#phone-overlay').on('click', '.phone-fotogram-tab:not(.disabled):not([disabled])', function () {
        if (!PhoneAPI) return;
        var tab = $(this).data('tab');
        if (!tab) return;
        phoneViewState.fotogramSub = tab;
        phoneViewState.fotogramDmThread = null;
        phoneViewState.fotogramSharePreview = null;
        phoneViewState.fotogramPostDetail = null;
        var titles = { feed: PHONE_APP_NAMES.fotogram || 'Fotogram', share: 'Share from Gallery', profile: 'Profile', dm: 'Messages' };
        $('#phone-app-view-title').text(titles[tab] || tab);
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        initFotogramMediaPlayers(PhoneAPI.State.variables);
        if (typeof window.initTooltips === 'function') window.initTooltips();
    });

    $('#phone-overlay').on('click', '.phone-fotogram-post-card[data-post-id]', function () {
        if (!PhoneAPI) return;
        if (phoneViewState.fotogramSub !== 'feed') return;
        var postId = $(this).data('post-id');
        if (!postId) return;
        phoneViewState.fotogramPostDetail = postId;
        $('#phone-app-view-title').text('Post');
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        initFotogramMediaPlayers(PhoneAPI.State.variables);
    });

    $('#phone-overlay').on('click', '.phone-fotogram-dm-row', function () {
        if (!PhoneAPI) return;
        var dmId = $(this).data('dm-id');
        if (!dmId) return;
        phoneViewState.fotogramDmThread = dmId;
        $('#phone-app-view-title').text('Messages');
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        scrollPhoneThreadToBottom();
        if (typeof window.initTooltips === 'function') window.initTooltips();
    });

    $('#phone-overlay').on('click', '.phone-fotogram-dm-thread-delete', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!PhoneAPI) return;
        var dmId = $(this).data('dm-id');
        if (!dmId) return;
        var vars = PhoneAPI.State.variables;
        var dm = (typeof getFotogramDMById === 'function') ? getFotogramDMById(vars, dmId) : null;
        var name = dm ? (dm.anonName || 'this thread') : 'this thread';
        var msg = 'Delete this DM thread with ' + name + '? This cannot be undone.';
        var done = function () {
            if (typeof deleteFotogramDM === 'function') deleteFotogramDM(vars, dmId);
            phoneViewState.fotogramDmThread = null;
            $('#phone-app-view-title').text('Messages');
            $('#phone-app-view-content').html(getAppContent('fotogram', vars));
            if (typeof window.initTooltips === 'function') window.initTooltips();
            if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
        };
        if (typeof showPhoneInlineConfirm === 'function') {
            showPhoneInlineConfirm({
                title: 'Delete DM?',
                message: msg,
                iconClass: 'icon-delete',
                confirmKind: 'danger',
                confirmLabel: 'Delete',
                onConfirm: done
            });
        } else if (typeof showBlockConfirmModal === 'function') {
            showBlockConfirmModal('Delete DM', msg, done);
        } else {
            done();
        }
    });

    var $phone = (PhoneAPI && PhoneAPI.$) ? PhoneAPI.$ : $;
    $phone('#phone-overlay').on('click', '.phone-fotogram-dm-quick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!PhoneAPI) return;
        var action = $phone(this).data('action');
        var dmId = $phone(this).data('dm-id');
        var replyKey = $phone(this).data('reply-key');
        if (!dmId) return;
        var vars = PhoneAPI.State.variables;
        if (action === 'promote') {
            var canSwap = (typeof canUseSwapInFotogramDm === 'function') ? canUseSwapInFotogramDm(vars) : true;
            if (!canSwap) {
                if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<notify>>You are not ready to swap numbers yet.<</notify>>');
                return;
            }
            if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<phonePromoteContact "' + dmId + '">>');
            phoneViewState.fotogramDmThread = null;
            $phone('#phone-app-view-title').text('Messages');
            $phone('#phone-app-view-content').html(getAppContent('fotogram', vars));
            if (typeof window.initTooltips === 'function') window.initTooltips();
            if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
        } else if (action === 'block') {
            var dm = (typeof getFotogramDMById === 'function') ? getFotogramDMById(vars, dmId) : null;
            var name = dm ? (dm.anonName || 'this person') : 'this person';
            var msg = 'You will block ' + name + '. They will not be able to message you again.';
            if (typeof showBlockConfirmModal === 'function') {
                showBlockConfirmModal(name, msg, function () {
                    if (typeof blockFotogramDM === 'function') blockFotogramDM(PhoneAPI.State.variables, dmId);
                    phoneViewState.fotogramDmThread = null;
                    $phone('#phone-app-view-title').text('Messages');
                    $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                    if (typeof window.initTooltips === 'function') window.initTooltips();
                    if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
                    if (typeof showNotification === 'function') showNotification({ type: 'info', message: name + ' has been blocked.' });
                });
            } else {
                if (typeof blockFotogramDM === 'function') blockFotogramDM(vars, dmId);
                phoneViewState.fotogramDmThread = null;
                $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                if (typeof window.initTooltips === 'function') window.initTooltips();
            }
        } else if (action === 'reply' && replyKey && typeof processFotogramDMReply === 'function') {
            var dmBeforeReply = (typeof getFotogramDMById === 'function') ? getFotogramDMById(vars, dmId) : null;
            var isSwapReply = (replyKey === 'swap_yes');
            if (!isSwapReply && dmBeforeReply && dmBeforeReply.flowState && Array.isArray(dmBeforeReply.flowState.currentChoices)) {
                for (var ci = 0; ci < dmBeforeReply.flowState.currentChoices.length; ci++) {
                    var ch = dmBeforeReply.flowState.currentChoices[ci];
                    if (!ch) continue;
                    if (String(ch.key || '') === String(replyKey) && ch.requiresSwap === true) {
                        isSwapReply = true;
                        break;
                    }
                }
            }
            processFotogramDMReply(vars, dmId, replyKey);
            if (isSwapReply) {
                vars.phoneFotogramRandomSwapIds = Array.isArray(vars.phoneFotogramRandomSwapIds) ? vars.phoneFotogramRandomSwapIds : [];
                var isActiveFotogramRandom = function (id) {
                    if (!id) return false;
                    var def = vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[id];
                    var st = vars.characters && vars.characters[id];
                    return !!(def && def.generatedFromPhone && st && st.firstMet);
                };
                vars.phoneFotogramRandomSwapIds = vars.phoneFotogramRandomSwapIds.filter(isActiveFotogramRandom).slice(0, 10);
                var canCreateFotogramRandom = function () { return vars.phoneFotogramRandomSwapIds.length < 10; };
                var markFotogramFirstMet = function (id) {
                    if (!id) return;
                    vars.characters = vars.characters || {};
                    if (!vars.characters[id]) return;
                    if (!vars.characters[id].firstMet) {
                        var tsm = vars.timeSys || {};
                        vars.characters[id].firstMet = (tsm.day || 1) + '/' + (tsm.month || 1) + '/' + (tsm.year || 0);
                    }
                };
                var eng = (typeof Engine !== 'undefined' && Engine.wiki) ? Engine : (window.parent && window.parent.Engine && window.parent.Engine.wiki ? window.parent.Engine : null);
                if (eng && eng.wiki) eng.wiki('<<phonePromoteContact "' + dmId + '">>');
                var promotedMap = (PhoneAPI.State && PhoneAPI.State.variables && PhoneAPI.State.variables.phoneContactPromoted) || {};
                var promotedId = promotedMap ? promotedMap[dmId] : null;
                var allDms = (PhoneAPI.State && PhoneAPI.State.variables && PhoneAPI.State.variables.phoneFotogramDMs) || [];
                var dmEntry = null;
                for (var di = 0; di < allDms.length; di++) {
                    if (allDms[di] && allDms[di].id === dmId) { dmEntry = allDms[di]; break; }
                }
                if (!promotedId && dmEntry) {
                    promotedId = dmEntry.promotedToCharId || dmEntry.generatedPromotedCharId || null;
                }
                /* Hard JS path: create contact if macro did not produce one. */
                if (!promotedId && dmEntry) {
                    if (dmEntry.charId) promotedId = dmEntry.charId;
                }
                if (!promotedId && dmEntry) {
                    if (!canCreateFotogramRandom()) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'You can have at most 10 Fotogram swaps.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    var cfg = (typeof setup !== 'undefined' && setup.charGenerator) ? setup.charGenerator : null;
                    if (!cfg) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'Missing charGenerator setup.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    var stp = (typeof setup !== 'undefined' && setup) ? setup : (window.setup || null);
                    var maleNames = Array.isArray(cfg.maleFirstNames) && cfg.maleFirstNames.length ? cfg.maleFirstNames : null;
                    var femaleNames = Array.isArray(cfg.femaleFirstNames) && cfg.femaleFirstNames.length ? cfg.femaleFirstNames : null;
                    var lastNames = Array.isArray(cfg.lastNames) && cfg.lastNames.length ? cfg.lastNames : null;
                    var colors = Array.isArray(cfg.colors) && cfg.colors.length ? cfg.colors : null;
                    if (!maleNames || !femaleNames || !lastNames || !colors) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'Missing charGenerator pools.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    var pickOne = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
                    var currentYear = (vars.timeSys && Number(vars.timeSys.year)) || 2024;
                    var ageMin = Number(cfg.ageMin);
                    var ageMax = Number(cfg.ageMax);
                    if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) {
                        ageMin = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmAgeMin)))
                            ? Number(setup.fotogramDmAgeMin)
                            : ageMin;
                        ageMax = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmAgeMax)))
                            ? Number(setup.fotogramDmAgeMax)
                            : ageMax;
                    }
                    if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'Missing charGenerator age settings.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    if (ageMax < ageMin) { var tmpAge = ageMax; ageMax = ageMin; ageMin = tmpAge; }
                    var maleW = Number(cfg.maleWeight);
                    var femaleW = Number(cfg.femaleWeight);
                    if (!Number.isFinite(maleW) || !Number.isFinite(femaleW)) {
                        maleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMaleWeight)))
                            ? Number(setup.fotogramDmMaleWeight)
                            : maleW;
                        femaleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmFemaleWeight)))
                            ? Number(setup.fotogramDmFemaleWeight)
                            : femaleW;
                    }
                    if (!Number.isFinite(maleW) || maleW < 0 || !Number.isFinite(femaleW) || femaleW < 0) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'Missing charGenerator gender weights.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    var totalW = maleW + femaleW;
                    var dmGender = String((dmEntry && dmEntry.profileGender) || '').toLowerCase();
                    var gender = (dmGender === 'male' || dmGender === 'female')
                        ? dmGender
                        : ((totalW <= 0) ? null : (Math.random() < (maleW / totalW) ? 'male' : 'female'));
                    if (!gender) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({ type: 'warning', message: 'Invalid charGenerator weights.' });
                        }
                        $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                        return;
                    }
                    var firstName = pickOne(gender === 'male' ? maleNames : femaleNames);
                    var lastName = pickOne(lastNames);
                    var dmAge = Number(dmEntry && dmEntry.profileAge);
                    var birthYear = (Number.isFinite(dmAge) && dmAge >= ageMin && dmAge <= ageMax)
                        ? (currentYear - dmAge)
                        : ((currentYear - ageMax) + Math.floor(Math.random() * ((currentYear - ageMin) - (currentYear - ageMax) + 1)));
                    var baseId = (firstName + '_' + lastName).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    if (!baseId) baseId = 'generated_contact';
                    var candidate = baseId;
                    var n = 2;
                    while ((stp && stp.characterDefs && stp.characterDefs[candidate]) || (vars.characters && vars.characters[candidate])) {
                        candidate = baseId + '_' + n;
                        n++;
                    }
                    var fullName = firstName + ' ' + lastName;
                    var def = {
                        id: candidate,
                        name: fullName,
                        firstName: firstName,
                        lastName: lastName,
                        birthYear: birthYear,
                        location: 'Online',
                        avatar: dmEntry.avatar || '',
                        type: 'npc',
                        color: pickOne(colors),
                        status: 'Online Contact',
                        gender: gender,
                        skinTone: dmEntry.skinTone || 'tan',
                        hasSchedule: false,
                        scheduleType: 'none',
                        generatedFromPhone: true,
                        info: '<p>You met this person online and swapped numbers through DMs.</p>'
                    };
                    vars.phoneGeneratedContacts = vars.phoneGeneratedContacts || {};
                    vars.phoneGeneratedContacts[candidate] = def;
                    vars.characters = vars.characters || {};
                    if (!vars.characters[candidate]) {
                        vars.characters[candidate] = {
                            stats: { love: 0, friendship: 25, lust: 0, trust: 5 },
                            opinion: { awareness: 0, flags: [] },
                            firstMet: (vars.timeSys.day || 1) + '/' + (vars.timeSys.month || 1) + '/' + (vars.timeSys.year || 0),
                            known: true,
                            currentLocation: null,
                            currentStatus: null
                        };
                    }
                    if (stp) {
                        stp.characterDefs = stp.characterDefs || {};
                        stp.characterDefs[candidate] = def;
                    }
                    dmEntry.generatedPromotedCharId = candidate;
                    dmEntry.promotedToCharId = candidate;
                    promotedId = candidate;
                }
                if (!promotedId) {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification({ type: 'warning', message: 'Swap failed. Please try again.' });
                    }
                    $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                    return;
                }
                vars.phoneContactPromoted = vars.phoneContactPromoted || {};
                vars.phoneContactPromoted[dmId] = promotedId;
                vars.phoneContactsUnlocked = vars.phoneContactsUnlocked || [];
                if (vars.phoneContactsUnlocked.indexOf(promotedId) === -1) vars.phoneContactsUnlocked.push(promotedId);
                markFotogramFirstMet(promotedId);
                var promotedDef = vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[promotedId];
                if (promotedDef && promotedDef.generatedFromPhone && vars.phoneFotogramRandomSwapIds.indexOf(promotedId) === -1) {
                    if (vars.phoneFotogramRandomSwapIds.length < 10) vars.phoneFotogramRandomSwapIds.push(promotedId);
                }
                vars.phoneConversations = vars.phoneConversations || {};
                if (!vars.phoneConversations[promotedId] && dmEntry) {
                    var buildSwapIntroMessage = function (contactId) {
                        var playerName = (vars.player && vars.player.firstName) ? vars.player.firstName : ((vars.characters && vars.characters.player && vars.characters.player.name) ? vars.characters.player.name : 'Player');
                        var defLocal = (vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[contactId]) || ((typeof setup !== 'undefined' && setup.characterDefs) ? setup.characterDefs[contactId] : null) || {};
                        var first = defLocal.firstName || '';
                        var last = defLocal.lastName || '';
                        var contactName = (first && last) ? (first + ' ' + last) : (defLocal.name || contactId || 'Unknown');
                        var currYear = (vars.timeSys && Number(vars.timeSys.year)) || 2024;
                        var age = (defLocal.birthYear && Number.isFinite(Number(defLocal.birthYear))) ? (currYear - Number(defLocal.birthYear)) : 0;
                        if (!Number.isFinite(age) || age <= 0) age = 25;
                        var pool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramSwapIntroMessages) && setup.fotogramSwapIntroMessages.length)
                            ? setup.fotogramSwapIntroMessages
                            : [];
                        if (!pool.length) return '';
                        var tpl = pool[Math.floor(Math.random() * pool.length)] || '';
                        return String(tpl)
                            .replace(/\{playerName\}/g, playerName)
                            .replace(/\{contactName\}/g, contactName)
                            .replace(/\{age\}/g, String(age));
                    };
                    vars.phoneConversations[promotedId] = [];
                    // Do not migrate old Fotogram DM history into phone Messages.
                    // Keep the Messages thread clean and start with swap intro only.
                    if (!dmEntry.swapIntroSent) {
                        var introText = buildSwapIntroMessage(promotedId);
                        if (introText) {
                        var tNow = vars.timeSys || {};
                        vars.phoneConversations[promotedId].push({
                            from: promotedId,
                            text: introText,
                            time: { day: tNow.day, month: tNow.month, year: tNow.year, hour: tNow.hour, minute: tNow.minute },
                            read: false
                        });
                        dmEntry.swapIntroSent = true;
                        }
                    }
                }
                phoneViewState.fotogramDmThread = null;
                $phone('#phone-app-view-title').text('Messages');
                $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                if (typeof window.initTooltips === 'function') window.initTooltips();
                if (typeof updatePhoneBadges === 'function') updatePhoneBadges();
            } else {
                $phone('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
                if (phoneViewState.fotogramDmThread) scrollPhoneThreadToBottom();
                if (typeof window.initTooltips === 'function') window.initTooltips();
            }
        }
    });

    $('#phone-overlay').on('click', '.phone-fotogram-pick-cell:not(.disabled)', function () {
        if (!PhoneAPI) return;
        var $el = $(this);
        var itemId = $el.data('id');
        var upgrade = $el.data('upgrade') === true;
        if (!itemId) return;
        phoneViewState.fotogramSharePreview = { itemId: itemId, upgrade: upgrade };
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        initFotogramMediaPlayers(PhoneAPI.State.variables);
        if (typeof window.initTooltips === 'function') window.initTooltips();
    });

    $('#phone-overlay').on('click', '#phone-fotogram-preview-back', function () {
        if (!PhoneAPI) return;
        phoneViewState.fotogramSharePreview = null;
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        initFotogramMediaPlayers(PhoneAPI.State.variables);
        if (typeof window.initTooltips === 'function') window.initTooltips();
    });

    $('#phone-overlay').on('click', '#phone-fotogram-preview-share', function () {
        if (!PhoneAPI) return;
        var itemId = $(this).data('id');
        var upgrade = $(this).data('upgrade') === true;
        if (!itemId) return;
        var result = null;
        if (typeof window.phoneCreateFotogramPost === 'function') {
            result = window.phoneCreateFotogramPost(itemId, upgrade);
        } else if (typeof Engine !== 'undefined' && Engine.wiki) {
            Engine.wiki('<<phoneFotogramPost "' + itemId + '"' + (upgrade ? ' true>>' : '>>'));
            result = { ok: true };
        }
        if (!result || !result.ok) {
            var msg = 'Could not post right now.';
            if (result && result.reason === 'COOLDOWN') msg = 'You posted recently. You need to wait ' + (result.daysLeft != null ? (result.daysLeft + ' day(s)') : 'a while') + '.';
            else if (result && result.reason === 'DUPLICATE_POST') msg = 'This photo is already posted.';
            else if (result && result.reason === 'NOT_UPGRADE') msg = 'Only higher quality can replace an old post.';
            if (typeof window.showNotification === 'function') {
                window.showNotification({ type: 'warning', message: msg, duration: 4000 });
            }
            return;
        }
        phoneViewState.fotogramSharePreview = null;
        phoneViewState.fotogramSub = 'feed';
        $('#phone-app-view-title').text(PHONE_APP_NAMES.fotogram || 'Fotogram');
        $('#phone-app-view-content').html(getAppContent('fotogram', PhoneAPI.State.variables));
        initFotogramMediaPlayers(PhoneAPI.State.variables);
        if (typeof persistPhoneChanges === 'function') persistPhoneChanges();
        if (typeof window.updatePhoneBadges === 'function') window.updatePhoneBadges();
        if (typeof window.notifySuccess === 'function') window.notifySuccess('Posted!');
    });
}

$(document).on(':passagerender', function () {
    if (!PhoneAPI) return;
    /* Don't close/recreate phone when refresh was triggered from inside phone (e.g. topic effects, advanceTime) */
    if (window._phoneApplyTopicEffectsActive) return;
    $('#phone-overlay').remove();
    createPhoneOverlay();
});
