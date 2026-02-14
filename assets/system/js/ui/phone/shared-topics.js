/* ==========================================
   PHONE SHARED TOPICS - Talk topics, Where are you cooldown
========================================== */

function canAskWhereAreYou(charId, vars) {
    var last = (vars.phoneWhereAskedLast && vars.phoneWhereAskedLast[charId]) || null;
    if (!last) return true;
    var t = vars.timeSys || {};
    if (t.day !== last.day || t.month !== last.month || (t.year && last.year && t.year !== last.year)) return true;
    var nowMin = (t.hour || 0) * 60 + (t.minute || 0);
    var lastMin = (last.hour || 0) * 60 + (last.minute || 0);
    var diff = nowMin - lastMin;
    if (diff < 0) diff += 24 * 60;
    return diff >= 30;
}

function minutesUntilWhereCooldown(charId, vars) {
    var last = (vars.phoneWhereAskedLast && vars.phoneWhereAskedLast[charId]) || null;
    if (!last) return 0;
    var t = vars.timeSys || {};
    if (t.day !== last.day || t.month !== last.month) return 0;
    var nowMin = (t.hour || 0) * 60 + (t.minute || 0);
    var lastMin = (last.hour || 0) * 60 + (last.minute || 0);
    var diff = nowMin - lastMin;
    if (diff < 0) diff += 24 * 60;
    return diff >= 30 ? 0 : 30 - diff;
}

function canUseTalkTopicToday(charId, topicId, vars) {
    var lastByChar = (vars.phoneTalkAskedLast && vars.phoneTalkAskedLast[charId]) || null;
    var last = (lastByChar && lastByChar[topicId]) || null;
    if (!last) return true;
    var t = vars.timeSys || {};
    return (t.day !== last.day) || (t.month !== last.month) || ((t.year || 0) !== (last.year || 0));
}

function getAvailableTalkTopics(charId, vars) {
    var topics = (typeof window.phoneGetUnlockedTopics === 'function') ? window.phoneGetUnlockedTopics(charId, vars) : [];
    return topics.filter(function (t) { return canUseTalkTopicToday(charId, t.id, vars); });
}

function markTalkTopicUsedToday(charId, topicId, vars) {
    if (!vars.phoneTalkAskedLast) vars.phoneTalkAskedLast = {};
    if (!vars.phoneTalkAskedLast[charId]) vars.phoneTalkAskedLast[charId] = {};
    var t = vars.timeSys || {};
    vars.phoneTalkAskedLast[charId][topicId] = { day: t.day, month: t.month, year: t.year };
}

function ensureTalkTopicsLoaded() {
    var setupObj = (typeof setup !== 'undefined') ? setup : (window.setup || {});
    if (setupObj.phoneMessageTopics && Object.keys(setupObj.phoneMessageTopics).length > 0) return true;
    if (typeof Engine !== 'undefined' && Engine.wiki) {
        Engine.wiki('<<phoneEnsureTopics>>');
    }
    setupObj = (typeof setup !== 'undefined') ? setup : (window.setup || {});
    if (setupObj.phoneMessageTopics && Object.keys(setupObj.phoneMessageTopics).length > 0) return true;
    var el = document.querySelector('tw-passagedata[name="variablesPhoneTopics"]');
    if (!el) {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('tw-passagedata[name]'));
        el = nodes.filter(function (n) {
            var nm = (n.getAttribute('name') || '').toLowerCase();
            return nm.indexOf('variablesphonetopics') !== -1;
        })[0] || null;
    }
    if (el && typeof Wikifier !== 'undefined') {
        var content = el.textContent || '';
        try {
            if (typeof Wikifier.wikifyEval === 'function') {
                Wikifier.wikifyEval(content);
            } else {
                new Wikifier(document.createDocumentFragment(), content);
            }
        } catch (e) { }
    }
    setupObj = (typeof setup !== 'undefined') ? setup : (window.setup || {});
    return !!(setupObj.phoneMessageTopics && Object.keys(setupObj.phoneMessageTopics).length > 0);
}

function getTopicListHtml(charId, vars) {
    var topics = getAvailableTalkTopics(charId, vars);
    var name = getPhoneContactFullName(charId, vars);
    if (topics.length === 0) {
        return '<div class="phone-messages-thread" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a topic</div><div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No topics available</p><p class="phone-app-placeholder-sub">More topics unlock as your relationship grows.</p></div></div>';
    }
    var list = topics.map(function (t) {
        return '<div class="phone-topic-item" data-topic-id="' + escapeHtml(t.id) + '"><div class="phone-topic-label">' + escapeHtml(t.label || t.id) + '</div></div>';
    }).join('');
    return '<div class="phone-messages-thread phone-topic-list-view" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a topic</div><div class="phone-messages-list phone-topic-list">' + list + '</div></div>';
}
