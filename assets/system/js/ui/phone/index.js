/* ==========================================
   PHONE INDEX - Main entry, overlay, events
========================================== */

var PhoneAPI = null;
var phoneViewState = { app: null, sub: 'list', threadCharId: null, pickerFor: null, meetup: null, calendarOffset: 0 };

window.PhoneInit = function (API) {
    PhoneAPI = API;
};

function getAppContent(action, vars) {
    var app = window.PhoneApps && window.PhoneApps[action];
    if (app && typeof app.render === 'function') {
        return app.render(vars);
    }
    if (action === 'camera' && typeof window.phoneRenderCameraApp === 'function') {
        return window.phoneRenderCameraApp(vars);
    }
    if (action === 'gallery' && typeof window.phoneRenderGalleryApp === 'function') {
        return window.phoneRenderGalleryApp(vars);
    }
    return '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">Coming soon</p><p class="phone-app-placeholder-sub">This app is not available yet.</p></div>';
}

function updatePhoneBadges() {
    if (!PhoneAPI) return;
    var v = PhoneAPI.State.variables;
    var msgCount = (typeof window.phoneUnreadCount === 'function') ? window.phoneUnreadCount() : 0;
    var fotogramCount = (v.phoneNotifications && v.phoneNotifications.fotogram) ? v.phoneNotifications.fotogram.length : 0;
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
    var total = (typeof window.phoneTotalBadge === 'function') ? window.phoneTotalBadge() : 0;
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
    var $view = $('#phone-app-view');
    var $title = $('#phone-app-view-title');
    var $content = $('#phone-app-view-content');
    if (!$view.length || !$title.length || !$content.length) return;
    $title.text(PHONE_APP_NAMES[action] || action);
    $content.html(getAppContent(action, vars));
    $view.show();
    $('#phone-overlay .phone-home').hide();
}

function hideAppView() {
    $('#phone-app-view').hide();
    $('#phone-overlay .phone-home').show();
}

function handleAppClick(action) {
    if (!action) return;
    showAppView(action);
}

window.openPhoneOverlay = function () {
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
    var notificationFotogram = (vars.phoneNotifications && vars.phoneNotifications.fotogram) ? vars.phoneNotifications.fotogram.length : 0;
    var notificationFinder = (vars.phoneNotifications && vars.phoneNotifications.finder) ? vars.phoneNotifications.finder.length : 0;
    var apps = [
        { name: 'Camera', icon: 'assets/content/phone/apps/icon_camera.webp', action: 'camera', badge: 0 },
        { name: 'Contacts', icon: 'assets/content/phone/apps/icon_calls.webp', action: 'contacts', badge: 0 },
        { name: 'Messages', icon: 'assets/content/phone/apps/icon_messages.webp', action: 'messages', badge: notificationMessages },
        { name: 'Gallery', icon: 'assets/content/phone/apps/icon_gallery.webp', action: 'gallery', badge: 0 },
        { name: 'Calendar', icon: 'assets/content/phone/apps/icon_calendar.webp', action: 'calendar', badge: 0 },
        { name: 'Fotogram', icon: 'assets/content/phone/apps/icon_fotogram.webp', action: 'fotogram', badge: notificationFotogram },
        { name: 'Finder', icon: 'assets/content/phone/apps/icon_finder.webp', action: 'finder', badge: notificationFinder }
    ];
    var appsHtml = apps.map(function(app) {
        return '<div class="phone-app" data-action="' + app.action + '"><div class="phone-app-icon"><img src="' + app.icon + '" alt="' + app.name + '">' + (app.badge > 0 ? '<span class="phone-app-badge">' + (app.badge > 99 ? '99+' : app.badge) + '</span>' : '') + '</div><div class="phone-app-name">' + app.name + '</div></div>';
    }).join('');
    var html = '<div class="overlay overlay-dark phone-overlay" id="phone-overlay"><div class="phone-device"><div class="phone-device-header"><div class="phone-device-notch"><div class="notch-camera"></div><div class="notch-speaker"></div><div class="notch-sensor"></div></div><span class="status-time">' + timeSysHour + ':' + timeSysMinute + '</span></div><div class="phone-device-screen"><div class="phone-home"><div class="phone-apps-container"><div class="phone-apps-grid">' + appsHtml + '</div></div><div class="phone-action-area"><button type="button" class="phone-close-btn" id="phone-close">Put the phone down</button></div></div><div class="phone-app-view" id="phone-app-view" style="display: none;"><div class="phone-app-view-header"><button type="button" class="phone-app-back" id="phone-app-back" aria-label="Back"><span class="icon icon-chevron-left icon-24"></span></button><span class="phone-app-view-title" id="phone-app-view-title"></span></div><div class="phone-app-view-content" id="phone-app-view-content"></div></div></div><div class="phone-device-home-indicator"></div></div></div>';
    PhoneAPI.$('body').append(html);

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
        if (phoneViewState.app && phoneViewState.sub === 'topics') {
            phoneViewState.sub = 'thread';
            var charId = phoneViewState.threadCharId;
            $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
            $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
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
        pushPhoneMessage(charId, 'player', topic.message || '');
        if (typeof Engine !== 'undefined' && Engine.wiki) Engine.wiki('<<updateCharacterLocations>>');
        var ch = vars.characters && vars.characters[charId];
        var status = (ch && ch.currentStatus) || '';
        var availableNow = status !== 'sleeping' && status !== 'showering';
        if (availableNow) {
            if (topic.reply) pushPhoneMessage(charId, charId, topic.reply);
            markTalkTopicUsedToday(charId, topicId, vars);
        } else {
            pushPhoneMessage(charId, charId, 'You waited for a while. No reply... probably not available right now.');
        }
        markConversationReadInState(charId, vars);
        persistPhoneChanges();
        phoneViewState.sub = 'thread';
        $('#phone-app-view-title').text(getPhoneContactFullName(charId, vars));
        $('#phone-app-view-content').html(getMessagesThreadHtml(charId, vars));
        updatePhoneBadges();
    });
}

$(document).on(':passagerender', function () {
    if (!PhoneAPI) return;
    $('#phone-overlay').remove();
    createPhoneOverlay();
});
