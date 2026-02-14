/* ==========================================
   PHONE MESSAGES APP - Conversation list, thread, actions
========================================== */

function pushPhoneMessage(charId, from, text) {
    if (!PhoneAPI || !charId) return;
    var v = PhoneAPI.State.variables;
    if (!v.phoneConversations) v.phoneConversations = {};
    if (!v.phoneConversations[charId]) v.phoneConversations[charId] = [];
    var t = v.timeSys || {};
    var time = { day: t.day, month: t.month, year: t.year, hour: t.hour, minute: t.minute };
    v.phoneConversations[charId].push({ from: from, text: text, time: time, read: from === 'player' });
    var arr = v.phoneConversations[charId];
    if (arr.length > 100) arr.splice(0, arr.length - 100);
}

function markConversationReadInState(charId, vars) {
    if (!charId || !vars || !vars.phoneConversations || !vars.phoneConversations[charId]) return;
    vars.phoneConversations[charId].forEach(function (m) { m.read = true; });
}

function getMessagesThreadHtml(charId, vars) {
    cleanupExpiredMeetups(vars);
    var conv = (vars.phoneConversations && vars.phoneConversations[charId]) || [];
    var bubbles = conv.map(function (m) {
        var isPlayer = m.from === 'player';
        var timeStr = m.time ? formatPhoneTime(m.time) : '';
        var safeText = escapeHtml(m.text || '');
        return '<div class="phone-msg-bubble ' + (isPlayer ? 'phone-msg-sent' : 'phone-msg-received') + '"><div class="phone-msg-text">' + safeText + '</div><div class="phone-msg-time">' + timeStr + '</div></div>';
    }).join('');
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
