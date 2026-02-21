/* ==========================================
   PHONE MESSAGES APP - Conversation list, thread, actions
========================================== */

function pushPhoneMessage(charId, from, text, imagePath) {
    if (!PhoneAPI || !charId) return;
    var v = PhoneAPI.State.variables;
    if (!v.phoneConversations) v.phoneConversations = {};
    if (!v.phoneConversations[charId]) v.phoneConversations[charId] = [];
    var t = v.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    var msg = { from: from, text: text || '', time: time, read: from === 'player' };
    if (imagePath) msg.image = imagePath;
    v.phoneConversations[charId].push(msg);
    var arr = v.phoneConversations[charId];
    if (arr.length > 100) arr.splice(0, arr.length - 100);
    if (imagePath && from !== 'player' && typeof window.phoneGalleryAddItem === 'function') {
        window.phoneGalleryAddItem(imagePath, { category: 'received', from: from });
    }
}

function markConversationReadInState(charId, vars) {
    if (!charId || !vars || !vars.phoneConversations || !vars.phoneConversations[charId]) return;
    vars.phoneConversations[charId].forEach(function (m) { m.read = true; });
}

function getMessagesThreadHtml(charId, vars) {
    cleanupExpiredMeetups(vars);
    var conv = (vars.phoneConversations && vars.phoneConversations[charId]) || [];
    var contactAvatar = typeof getPhoneContactAvatar === 'function' ? getPhoneContactAvatar(charId, vars) : '';
    var contactName = typeof getPhoneContactName === 'function' ? getPhoneContactName(charId, vars) : '';
    var initial = (contactName && contactName.length) ? contactName.charAt(0).toUpperCase() : '?';
    var avatarHtml = (contactAvatar && String(contactAvatar).trim())
        ? '<img src="' + escapeHtml(contactAvatar) + '" alt="" class="phone-msg-avatar">'
        : '<span class="phone-msg-avatar phone-msg-avatar-placeholder">' + escapeHtml(initial) + '</span>';
    var playerAvatar = (vars.characters && vars.characters.player && vars.characters.player.avatar) ? String(vars.characters.player.avatar).trim() : '';
    if (!playerAvatar && typeof setup !== 'undefined' && setup.imageProfile) playerAvatar = String(setup.imageProfile).trim();
    var playerAvatarHtml = (playerAvatar)
        ? '<img src="' + escapeHtml(playerAvatar) + '" alt="" class="phone-msg-avatar">'
        : '<span class="phone-msg-avatar phone-msg-avatar-placeholder">P</span>';
    var bubbleList = [];
    conv.forEach(function (m) {
        var isPlayer = m.from === 'player';
        var rowClass = 'phone-msg-message' + (isPlayer ? ' me' : '');
        var bubbleClass = 'phone-msg-bubble' + (isPlayer ? ' me' : '');
        if (m.image) {
            var row = '<div class="' + rowClass + '">';
            if (!isPlayer) row += avatarHtml;
            row += '<div class="' + bubbleClass + '"><div class="phone-msg-bubble-text"><span class="phone-msg-image-wrap"><img src="' + escapeHtml(m.image) + '" alt=""></span></div></div>';
            if (isPlayer) row += playerAvatarHtml;
            row += '</div>';
            bubbleList.push(row);
        }
        if (m.text) {
            var row = '<div class="' + rowClass + '">';
            if (!isPlayer) row += avatarHtml;
            row += '<div class="' + bubbleClass + '"><div class="phone-msg-bubble-text">' + escapeHtml(m.text) + '</div></div>';
            if (isPlayer) row += playerAvatarHtml;
            row += '</div>';
            bubbleList.push(row);
        }
    });
    var bubbles = bubbleList.join('');
    var canWhere = canAskWhereAreYou(charId, vars);
    var canTalk = getAvailableTalkTopics(charId, vars).length > 0;
    var meetupInProgress = !!(phoneViewState.meetup && phoneViewState.meetup.charId === charId);
    var canMeetup = canShowMeetupButton(charId, vars) && !hasMeetupTodayWithChar(charId, vars) && !meetupInProgress;
    var talkBtn = canTalk ? '<button type="button" class="phone-topic-btn" id="phone-talk-btn">Talk</button>' : '';
    var meetupBtn = canMeetup ? '<button type="button" class="phone-topic-btn" id="phone-meetup-btn">Plan meetup</button>' : '';
    var whereBtn = canWhere ? '<button type="button" class="phone-topic-btn" id="phone-where-btn">Where are you?</button>' : '';
    var composeButtons = talkBtn + meetupBtn + whereBtn;
    var compose = (!meetupInProgress && composeButtons)
        ? ('<div class="phone-thread-compose phone-thread-actions">' + composeButtons + '</div>')
        : '';
    var meetupInline = '';
    if (phoneViewState.meetup && phoneViewState.meetup.charId === charId) {
        if (phoneViewState.meetup.step === 'pick_time') meetupInline = getMeetupInlineTimeOptionsHtml(charId, vars);
        else if (phoneViewState.meetup.step === 'pick_place') meetupInline = getMeetupInlinePlaceOptionsHtml(charId, vars);
    }
    return '<div class="phone-messages-thread" data-char-id="' + charId + '"><div class="phone-thread-bubbles">' + bubbles + '</div>' + meetupInline + compose + '</div>';
}

function getSpicyPhotoPickerHtml(vars) {
    var gallery = vars && vars.phoneGallery;
    var spicy = (gallery && gallery.photos && Array.isArray(gallery.photos.spicy)) ? gallery.photos.spicy : [];
    var getUrl = (typeof getAssetUrl === 'function') ? getAssetUrl : function (p) { return p || ''; };
    if (spicy.length === 0) {
        return '<div class="phone-spicy-pick"><p class="phone-app-placeholder-text">No spicy photos</p><button type="button" class="phone-topic-btn phone-spicy-pick-cancel">Back</button></div>';
    }
    var cells = spicy.map(function (it) {
        var path = (it.path && String(it.path).trim()) ? it.path : '';
        var src = path ? getUrl(path) : '';
        var escapedPath = (path || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        var thumb = path ? '<img class="phone-gallery-thumb-img" src="' + (src || path).replace(/"/g, '&quot;') + '" alt="" loading="lazy">' : '<div class="phone-gallery-thumb-placeholder">Photo</div>';
        return '<div class="phone-gallery-cell phone-spicy-pick-cell" data-path="' + escapedPath + '">' + thumb + '</div>';
    }).join('');
    return '<div class="phone-spicy-pick"><p class="phone-app-placeholder-text">Choose a photo to send</p><div class="phone-gallery-grid phone-spicy-pick-grid">' + cells + '</div><button type="button" class="phone-topic-btn phone-spicy-pick-cancel">Cancel</button></div>';
}

window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.messages = {
    render: function (vars) {
        var conv = vars.phoneConversations || {};
        var charIds = Object.keys(conv).filter(function (id) { return conv[id] && conv[id].length > 0; });
        var newBtn = '<div class="phone-new-action"><button type="button" class="phone-new-btn" id="phone-new-message">New message</button></div>';
        if (charIds.length === 0) {
            return newBtn + '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No conversations yet.</p><p class="phone-app-placeholder-sub">Tap New message to start one.</p></div>';
        }
        var list = charIds.map(function (charId) {
            var msgs = conv[charId];
            var last = msgs[msgs.length - 1];
            var unread = msgs.filter(function (m) { return m.from !== 'player' && m.read === false; }).length;
            var name = getPhoneContactName(charId, vars);
            var preview = (last && last.text) ? (last.text.length > 30 ? last.text.slice(0, 30) + '…' : last.text) : '';
            var timeStr = last && last.time ? formatPhoneTime(last.time) : '';
            var avatar = getPhoneContactAvatar(charId, vars);
            var img = avatar ? '<img src="' + avatar + '" alt="" class="phone-conv-avatar">' : '<div class="phone-conv-avatar phone-conv-avatar-placeholder"></div>';
            return '<div class="phone-conv-item" data-char-id="' + charId + '">' + img + '<div class="phone-conv-content"><div class="phone-conv-name">' + name + '</div><div class="phone-conv-preview">' + preview + '</div><div class="phone-conv-meta">' + timeStr + (unread > 0 ? ' <span class="phone-conv-unread">' + unread + '</span>' : '') + '</div></div></div>';
        }).join('');
        return newBtn + '<div class="phone-messages-list">' + list + '</div>';
    }
};
