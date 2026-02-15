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
    var bubbleList = [];
    conv.forEach(function (m) {
        var isPlayer = m.from === 'player';
        var bubbleClass = 'phone-msg-bubble ' + (isPlayer ? 'phone-msg-sent' : 'phone-msg-received');
        if (m.image) {
            bubbleList.push('<div class="' + bubbleClass + '"><div class="phone-msg-image"><img src="' + escapeHtml(m.image) + '" alt=""></div></div>');
        }
        if (m.text) {
            bubbleList.push('<div class="' + bubbleClass + '"><div class="phone-msg-text">' + escapeHtml(m.text) + '</div></div>');
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
    var choiceInline = '';
    if (phoneViewState.pendingTopicChoice && phoneViewState.pendingTopicChoice.charId === charId && phoneViewState.pendingTopicChoice.choiceTurn && phoneViewState.pendingTopicChoice.choiceTurn.options) {
        var opts = phoneViewState.pendingTopicChoice.choiceTurn.options;
        var gallery = vars.phoneGallery;
        var hasSpicy = !!(gallery && gallery.photos && Array.isArray(gallery.photos.spicy) && gallery.photos.spicy.length > 0);
        var visible = opts.map(function (o, i) { return { opt: o, idx: i }; }).filter(function (x) {
            return !x.opt.requiresSpicyPhoto || hasSpicy;
        });
        choiceInline = '<div class="phone-thread-choices">' + visible.map(function (x) {
            var label = (x.opt.label != null && x.opt.label !== '') ? x.opt.label : ('Option ' + (x.idx + 1));
            return '<button type="button" class="phone-topic-choice-btn" data-option-index="' + x.idx + '">' + escapeHtml(label) + '</button>';
        }).join('') + '</div>';
    }
    return '<div class="phone-messages-thread" data-char-id="' + charId + '"><div class="phone-thread-bubbles">' + bubbles + '</div>' + meetupInline + choiceInline + compose + '</div>';
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
