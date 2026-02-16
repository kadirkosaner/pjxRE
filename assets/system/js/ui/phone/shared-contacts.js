/* ==========================================
   PHONE SHARED CONTACTS - Contact list, block
========================================== */

function getPhoneContactName(charId, vars) {
    if (!charId) return '';
    return getPhoneContactFullName(charId, vars);
}

function getPhoneContact(charId, vars) {
    if (!charId) return null;
    var setupObj = getStorySetupObj();
    var def = (setupObj && setupObj.characterDefs && setupObj.characterDefs[charId]) ? setupObj.characterDefs[charId] : null;
    if (!def && vars && vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[charId]) {
        def = vars.phoneGeneratedContacts[charId];
    }
    var stateChar = (vars && vars.characters && vars.characters[charId]) ? vars.characters[charId] : null;
    if (!def && !stateChar) return null;
    return Object.assign({}, def || {}, stateChar || {});
}

function getPhoneContactFullName(charId, vars) {
    if (!charId) return '';
    var c = getPhoneContact(charId, vars);
    if (!c) return charId;
    var first = c.firstName || c.name || '';
    var last = c.lastName || '';
    if (first && last) return first + ' ' + last;
    if (first) return first;
    return charId;
}

function getPhoneContactAvatar(charId, vars) {
    if (!charId) return '';
    var c = getPhoneContact(charId, vars);
    return (c && c.avatar) ? c.avatar : '';
}

function getContacts(vars) {
    var setupObj = getStorySetupObj();
    var family = (setupObj.phoneContactsFamily && setupObj.phoneContactsFamily.length) ? setupObj.phoneContactsFamily : ['mother', 'father', 'brother'];
    var unlocked = vars.phoneContactsUnlocked || [];
    var blocked = vars.phoneBlocked || [];
    var blockedSet = {};
    blocked.forEach(function (id) { blockedSet[id] = true; });
    var seen = {};
    var out = [];
    family.forEach(function (id) { if (!blockedSet[id] && !seen[id]) { seen[id] = true; out.push(id); } });
    unlocked.forEach(function (id) { if (!blockedSet[id] && !seen[id]) { seen[id] = true; out.push(id); } });
    return out;
}

function isFamilyContact(charId, vars) {
    var setupObj = getStorySetupObj();
    var family = (setupObj.phoneContactsFamily && setupObj.phoneContactsFamily.length) ? setupObj.phoneContactsFamily : ['mother', 'father', 'brother'];
    return family.indexOf(charId) !== -1;
}

function getContactListHtml(vars) {
    var contacts = getContacts(vars);
    if (contacts.length === 0) {
        return '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No contacts</p><p class="phone-app-placeholder-sub">Family and anyone you swap numbers with will appear here.</p></div>';
    }
    var list = contacts.map(function (charId) {
        var avatar = getPhoneContactAvatar(charId, vars);
        var fullName = getPhoneContactFullName(charId, vars);
        var img = avatar ? '<img src="' + avatar + '" alt="" class="phone-contact-avatar">' : '<div class="phone-contact-avatar phone-contact-avatar-placeholder"></div>';
        return '<div class="phone-conv-item phone-contact-pick phone-contact-row" data-char-id="' + charId + '">' + img + '<div class="phone-conv-name">' + escapeHtml(fullName) + '</div></div>';
    }).join('');
    return '<div class="phone-messages-list phone-contact-list phone-contact-list-centered">' + list + '</div>';
}

function getContactListHtmlForContacts(vars) {
    var contacts = getContacts(vars);
    if (contacts.length === 0) {
        return '<div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No contacts</p><p class="phone-app-placeholder-sub">Family and anyone you swap numbers with will appear here.</p></div>';
    }
    var list = contacts.map(function (charId) {
        var avatar = getPhoneContactAvatar(charId, vars);
        var fullName = getPhoneContactFullName(charId, vars);
        var img = avatar ? '<img src="' + avatar + '" alt="" class="phone-contact-avatar">' : '<div class="phone-contact-avatar phone-contact-avatar-placeholder"></div>';
        var blockBtn = !isFamilyContact(charId, vars)
            ? '<button type="button" class="phone-contact-block-btn" data-char-id="' + charId + '" aria-label="Block"><span class="icon icon-block icon-18"></span></button>'
            : '';
        return '<div class="phone-conv-item phone-contact-row" data-char-id="' + charId + '">' + img + '<div class="phone-conv-name">' + escapeHtml(fullName) + '</div>' + blockBtn + '</div>';
    }).join('');
    return '<div class="phone-messages-list phone-contact-list phone-contact-list-contacts">' + list + '</div>';
}

function blockPhoneContact(charId, vars) {
    if (!vars.phoneContactsUnlocked) vars.phoneContactsUnlocked = [];
    if (!vars.phoneBlocked) vars.phoneBlocked = [];
    if (!vars.phoneFotogramRandomSwapIds) vars.phoneFotogramRandomSwapIds = [];
    var idx = vars.phoneContactsUnlocked.indexOf(charId);
    if (idx !== -1) vars.phoneContactsUnlocked.splice(idx, 1);
    if (vars.phoneBlocked.indexOf(charId) === -1) vars.phoneBlocked.push(charId);
    if (vars.phoneConversations && vars.phoneConversations[charId]) delete vars.phoneConversations[charId];
    var generatedDef = vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[charId] ? vars.phoneGeneratedContacts[charId] : null;
    if (generatedDef && generatedDef.generatedFromPhone && vars.characters && vars.characters[charId]) {
        vars.characters[charId].firstMet = null;
    }
    var fgIdx = vars.phoneFotogramRandomSwapIds.indexOf(charId);
    if (fgIdx !== -1) vars.phoneFotogramRandomSwapIds.splice(fgIdx, 1);
    persistPhoneChanges();
}

function showBlockConfirmModal(name, message, onConfirm) {
    if (!PhoneAPI) return;
    var title = 'Block ' + name + '?';
    var content = '<div class="confirmation-content"><div class="confirmation-icon"><span class="icon icon-block icon-24"></span></div><div class="confirmation-message">' + escapeHtml(message) + '</div><div class="confirmation-actions"><button class="btn" id="block-confirm-no">No</button><button class="btn btn-danger" id="block-confirm-yes">Yes</button></div></div>';
    var modalHTML = '<div class="overlay overlay-dark modal-overlay active" id="phone-block-confirm-overlay"><div class="modal" style="width: 500px; max-width: 90vw;"><div class="modal-header"><span class="modal-title">' + escapeHtml(title) + '</span><button class="close-btn" id="block-confirm-close"><span class="icon icon-close icon-18"></span></button></div><div class="modal-content">' + content + '</div></div></div>';
    PhoneAPI.$('body').append(modalHTML);
    var closeFn = function () { PhoneAPI.$('#phone-block-confirm-overlay').remove(); };
    PhoneAPI.$('#block-confirm-yes').on('click', function () { if (onConfirm) onConfirm(); closeFn(); });
    PhoneAPI.$('#block-confirm-no, #block-confirm-close').on('click', closeFn);
    PhoneAPI.$('#phone-block-confirm-overlay').on('click', function (e) { if (e.target === this) closeFn(); });
}
