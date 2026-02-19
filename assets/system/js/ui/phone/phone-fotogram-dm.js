/* =============================================================================
   FOTOGRAM INTERACTIVE DM ENGINE
   Heat-based reactive system

   FLOW:
   bootstrap → anon opener
   → player sees 3 contextual choices (CACHED — no re-shuffle)
   → picks one → heat changes
   → anon REACTS to player choice first
   → if photo triggered → photo submenu
   → anon sends next message based on new heat
   → repeat

   HEAT RANGES:
   0-30  cold  → chat, compliments
   31-55 warm  → photo hints, flirt
   56-80 hot   → direct photo request, explicit messages
   81+   fire  → pushes for number, full explicit

   PERSONAS: naive / lustful / pervy (male) | flirty / wild (female)

   CHANGELOG v2:
   - FIX: Choice caching — fdmResolveChoices now saves shuffle result to state.
     UI render and processFotogramChoice use the same array.
   - FIX: Reaction system — Anon reacts to player choice first,
     then sends new heat-based message.
   - FIX: Number request — heat > 80 alone does not trigger number UI,
     only msg.type === 'number_request' triggers it.
   - FIX: Bootstrap race condition — dm is added to array first, then bootstrap.
   - FIX: Anti-repeat buffer 8 → 12.
============================================================================= */

/* ── UTILS ───────────────────────────────────────────────────────────── */

function fdmClamp(n, lo, hi) {
    var v = Number(n);
    return !Number.isFinite(v) ? lo : v < lo ? lo : v > hi ? hi : v;
}

function fdmPick(arr) {
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function fdmWPick(arr) {
    if (!Array.isArray(arr) || !arr.length) return null;
    var total = 0, i;
    for (i = 0; i < arr.length; i++) total += (Number(arr[i].weight) || 1);
    var r = Math.random() * total, cum = 0;
    for (i = 0; i < arr.length; i++) {
        cum += (Number(arr[i].weight) || 1);
        if (r <= cum) return arr[i];
    }
    return arr[arr.length - 1];
}

function fdmAPick(arr, recent) {
    if (!Array.isArray(arr) || !arr.length) return null;
    var rec = Array.isArray(recent) ? recent : [];
    var filtered = arr.filter(function(e) {
        return rec.indexOf(String(e.text || e)) === -1;
    });
    var pool = filtered.length ? filtered : arr;
    var p = fdmWPick(pool);
    if (p) {
        rec.push(String(p.text || p));
        if (rec.length > 12) rec.shift();   /* v2: 8 → 12 anti-repeat buffer */
    }
    return p;
}

function fdmNormAtt(e) {
    if (!e) return null;
    if (typeof e === 'string') return { path: e, kind: 'photo' };
    return e.path ? { path: e.path, kind: e.kind || 'photo' } : null;
}

var FDM_EXPLICIT_TAG_RE = /^\[(EXPLICIT_[0-9]+)(?::[^\]]*)?\]$/i;
var FDM_POOL_TAG_RE = /^\[POOL:([a-z0-9_]+)\]$/i;
var FDM_PHOTO_SEND_TAG_RE = /^\[\s*send photo\s*\]$/i;

var FDM_RUNTIME_TEXT_FALLBACK = {
    generic: [
        "wasn't expecting that",
        "that got really direct",
        "this is moving a bit fast"
    ]
};

var FDM_PHOTO_SEND_TEXTS = [
    "I'll send a photo"
];

var FDM_SEXUAL_ATTACHMENT_CATS = { cock: true, cum: true, female_masturbation: true };
var FDM_QUESTION_RE = /(\?|(^|\s)(what|why|how|which)\b)/i;

function fdmPersonaTextPool(persona, key) {
    var conf = (typeof setup !== 'undefined' && setup.fdmRuntimeTextPools) ? setup.fdmRuntimeTextPools : null;
    if (conf && conf[persona] && Array.isArray(conf[persona][key]) && conf[persona][key].length) {
        return conf[persona][key];
    }
    if (conf && conf.generic && Array.isArray(conf.generic[key]) && conf.generic[key].length) {
        return conf.generic[key];
    }
    if (key === 'explicit') {
        return FDM_RUNTIME_TEXT_FALLBACK[persona] || FDM_RUNTIME_TEXT_FALLBACK.generic;
    }
    if (key === 'photo_send') {
        return FDM_PHOTO_SEND_TEXTS;
    }
    return [];
}

function fdmNormalizeChoiceText(text, persona) {
    var t = String(text || '').trim();
    if (!t) return '...';
    if (FDM_PHOTO_SEND_TAG_RE.test(t)) {
        var playerSend = (typeof setup !== 'undefined' && setup.fdmPlayerPhotoSendTexts && setup.fdmPlayerPhotoSendTexts.length)
            ? setup.fdmPlayerPhotoSendTexts : null;
        if (playerSend && playerSend.length) return String(fdmPick(playerSend));
        var sendPool = fdmPersonaTextPool(persona || 'generic', 'photo_send');
        return String(fdmPick(sendPool) || 'I\'ll send a photo');
    }
    return t;
}

function fdmBuildBridgeReaction(choiceText, delta) {
    var t = String(choiceText || '').trim().toLowerCase();
    if (!t) return null;
    var isQuestion = FDM_QUESTION_RE.test(t);
    /* Question-like player replies already get a full anon turn right after.
       Avoid filler micro-messages such as "actually / let me explain". */
    if (isQuestion) return null;
    if (delta <= -10) return fdmPick(["okay, I won't push", "got it, backing off", "alright, I'll drop it"]);
    return null;
}

function fdmUseLegacyReactionPools() {
    if (typeof setup !== 'undefined' && setup.fdmUseLegacyReactionPools != null) {
        return !!setup.fdmUseLegacyReactionPools;
    }
    return false;
}

function fdmExplicitRenderMode() {
    if (typeof setup !== 'undefined' && setup.fdmExplicitRenderMode) {
        return String(setup.fdmExplicitRenderMode).toLowerCase();
    }
    return 'placeholder';
}

/* Returns possible resolved texts for an entry (for [POOL:key] returns pool array; else [text]). */
function fdmGetPossibleResolvedTexts(entry) {
    if (!entry) return [];
    var txt = String((entry && entry.text) || entry || '').trim();
    if (!txt) return [];
    var poolMatch = txt.match(FDM_POOL_TAG_RE);
    if (poolMatch) {
        var key = String(poolMatch[1] || '').trim();
        var arr = (typeof setup !== 'undefined' && setup.fdmMessagePools && setup.fdmMessagePools[key]) ? setup.fdmMessagePools[key] : null;
        if (Array.isArray(arr) && arr.length) return arr.map(function(s) { return String(s || '').trim(); }).filter(Boolean);
    }
    return [txt];
}

function fdmPickNoImmediateRepeat(arr, recent, lastText) {
    if (!Array.isArray(arr) || !arr.length) return null;
    var last = String(lastText || '').trim();
    if (!last) return fdmAPick(arr, recent);
    var filtered = arr.filter(function(e) {
        var txt = String((e && e.text) || e || '').trim();
        return txt !== last;
    });
    return fdmAPick(filtered.length ? filtered : arr, recent);
}

/* Filter pool: exclude entries whose possible resolved texts are in recentAnon (avoids same message twice). */
function fdmFilterPoolByRecentResolved(pool, state) {
    if (!Array.isArray(pool) || !pool.length) return pool;
    var recent = state && state.recentAnon ? state.recentAnon : [];
    if (!recent.length) return pool;
    var set = {};
    for (var ri = 0; ri < recent.length; ri++) set[String(recent[ri] || '').trim()] = true;
    var out = pool.filter(function(e) {
        var possible = fdmGetPossibleResolvedTexts(e);
        for (var pi = 0; pi < possible.length; pi++) {
            if (set[possible[pi]]) return false;
        }
        return true;
    });
    return out.length ? out : pool;
}

function fdmIsExplicitTaggedEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;
    return FDM_EXPLICIT_TAG_RE.test(String(entry.text || '').trim());
}

function fdmIsPressureType(type) {
    var t = String(type || '').toLowerCase();
    return t === 'photo_hint' || t === 'photo_request' || t === 'number_request' || t === 'explicit' || t === 'cock_opener';
}

function fdmEntryText(entry) {
    if (!entry) return '';
    if (typeof entry === 'string') return String(entry).trim();
    return String(entry.text || '').trim();
}

function fdmFilterPoolByUsage(pool, state) {
    if (!Array.isArray(pool) || !pool.length) return pool;
    var usage = (state && state.anonMsgUseCount) ? state.anonMsgUseCount : {};
    var pressured = Number(state && state.pressureDebt || 0) > 0 || Number(state && state.photoCooldownTurns || 0) > 0;
    var filtered = pool.filter(function(e) {
        var key = fdmEntryText(e);
        if (!key) return true;
        var type = e && typeof e === 'object' ? String(e.type || '') : '';
        var used = Number(usage[key] || 0);
        var cap = fdmIsPressureType(type) ? (pressured ? 1 : 2) : 1;
        return used < cap;
    });
    return filtered;
}

function fdmMarkAnonMsgUsed(state, msg) {
    if (!state || !msg) return;
    var key = fdmEntryText(msg);
    if (!key) return;
    if (!state.anonMsgUseCount || typeof state.anonMsgUseCount !== 'object') state.anonMsgUseCount = {};
    state.anonMsgUseCount[key] = Number(state.anonMsgUseCount[key] || 0) + 1;
}

function fdmInferAttachmentCategory(state, explicitId) {
    var persona = (state && state.persona) ? state.persona : 'naive';
    var heat = Number(state && state.heat) || 0;
    if (persona === 'flirty') {
        return heat >= 70 ? 'sexting' : 'spicy';
    }
    if (persona === 'wild') {
        return heat >= 70 ? 'female_masturbation' : 'sexting';
    }
    if (persona === 'pervy') {
        return (heat >= 75 || explicitId === 'EXPLICIT_26') ? 'cum' : 'cock';
    }
    if (persona === 'lustful') return heat >= 65 ? 'cock' : 'spicy';
    if (persona === 'naive') return heat >= 75 ? 'cock' : 'spicy';
    return 'spicy';
}

function fdmShouldInferAttachment(entry) {
    if (!entry || typeof entry !== 'object') return false;
    var t = String(entry.type || '').toLowerCase();
    return t === 'explicit' || t === 'cock_opener';
}

function fdmNormalizeAttachmentCategory(category, state, entry) {
    var cat = String(category || '').trim();
    if (!cat) return '';
    var persona = (state && state.persona) ? state.persona : 'naive';
    var heat = Number(state && state.heat) || 0;
    var t = String((entry && entry.type) || '').toLowerCase();

    if (persona === 'naive' && FDM_SEXUAL_ATTACHMENT_CATS[cat]) {
        if (t === 'explicit' && heat >= 90) return 'spicy';
        return '';
    }
    return cat;
}

function fdmResolveTaggedText(entryText, state) {
    var raw = String(entryText || '').trim();
    if (!raw) return { text: '...' };
    var poolMatch = raw.match(FDM_POOL_TAG_RE);
    if (poolMatch) {
        var key = String(poolMatch[1] || '').trim();
        var arr = (typeof setup !== 'undefined' && setup.fdmMessagePools && setup.fdmMessagePools[key]) ? setup.fdmMessagePools[key] : null;
        if (Array.isArray(arr) && arr.length) {
            return { text: String(fdmPick(arr) || arr[0]) };
        }
        return { text: raw };
    }
    var match = raw.match(FDM_EXPLICIT_TAG_RE);
    if (!match) return { text: raw };
    var persona = (state && state.persona) ? state.persona : 'generic';
    var explicitId = String(match[1] || '').toUpperCase();
    if (fdmExplicitRenderMode() === 'placeholder') {
        return {
            text: '[' + persona + '_' + explicitId.toLowerCase() + ']',
            explicitId: explicitId,
            wasExplicitTag: true
        };
    }
    var pool = fdmPersonaTextPool(persona, 'explicit');
    return {
        text: String(fdmPick(pool) || fdmPick(FDM_RUNTIME_TEXT_FALLBACK.generic) || 'bunu beklemiyordum'),
        explicitId: explicitId,
        wasExplicitTag: true
    };
}

function fdmMakeForcedCloseMsg(state) {
    var p = (state && state.persona) ? state.persona : 'generic';
    var closePool = fdmGetMsgPool(p, 'close');
    var picked = Array.isArray(closePool) && closePool.length ? fdmPick(closePool) : null;
    var obj = (picked && typeof picked === 'object') ? Object.assign({}, picked) : { text: "Okay, let's leave it here." };
    obj.type = 'close';
    obj.forceEnd = true;
    return obj;
}

function fdmBuildMsgFromPoolEntry(entry, state, dm) {
    if (!entry) return null;
    var obj = (typeof entry === 'string') ? { text: entry } : entry;
    var resolved = fdmResolveTaggedText(obj.text, state);
    var text = String(resolved.text || '...');
    var category = obj.attachmentCategory || null;
    if (!category && resolved.wasExplicitTag && fdmShouldInferAttachment(obj)) {
        category = fdmInferAttachmentCategory(state, resolved.explicitId);
    }
    category = fdmNormalizeAttachmentCategory(category, state, obj);
    var att = null;
    if (category) {
        var opts = fdmGetAnonMedia(category, dm);
        if (opts.length) att = fdmPick(opts);
    }
    return { text: text, attachment: att };
}

function fdmTime(vars) {
    var t = (vars && vars.timeSys) ? vars.timeSys : {};
    return { day: t.day||1, month: t.month||1, year: t.year||1, hour: t.hour||12, minute: t.minute||0 };
}

function fdmStat(vars, key) {
    if (!vars) return 0;
    if (vars[key] != null) return Number(vars[key]) || 0;
    if (vars.player && vars.player[key] != null) return Number(vars.player[key]) || 0;
    return 0;
}

/* ── HEAT HELPERS ────────────────────────────────────────────────────── */

function fdmHeatRange(heat) {
    if (heat <= 30) return 'cold';
    if (heat <= 55) return 'warm';
    if (heat <= 80) return 'hot';
    return 'fire';
}

/* Close reason → finisher pool key. Uses photo sent + heat to pick a reason-based finisher. */
function fdmGetFinisherPoolKey(s, cause) {
    if (cause === 'number_rejected') return 'close';
    if (cause === 'max_turns') return 'finisher_max_turns';
    if (cause === 'bored') {
        var hadPhoto = Number(s.playerPhotoCount || 0) >= 1;
        return hadPhoto ? 'finisher_bored_photo' : 'finisher_bored_no_photo';
    }
    return 'close';
}

/* ── DATA ACCESS ─────────────────────────────────────────────────────── */

function fdmPersonaCfg(persona) {
    var d = (typeof setup !== 'undefined' && setup.fdmPersonas) ? setup.fdmPersonas : {};
    return d[persona] || { startHeat: 20, heatMult: 1.0, persistence: 3, gender: 'male' };
}

function fdmGetMsgPool(persona, range) {
    var d = (typeof setup !== 'undefined' && setup.fdmMsgPools) ? setup.fdmMsgPools : {};
    var p = d[persona];
    if (!p) return [];
    return Array.isArray(p[range]) ? p[range] : [];
}

function fdmGetChoicePool(msgType, heat) {
    var d = (typeof setup !== 'undefined' && setup.fdmChoicePools) ? setup.fdmChoicePools : {};
    if (!d[msgType]) return null;
    /* Try heat-specific pool first, fallback to default */
    var range = fdmHeatRange(heat);
    if (d[msgType][range]) return d[msgType][range];
    if (d[msgType].default) return d[msgType].default;
    return null;
}

function fdmGetAnonMedia(cat, dm) {
    var pool = (typeof setup !== 'undefined' && setup.fotogramDMPhotoPool) ? setup.fotogramDMPhotoPool : {};
    if (!pool[cat]) return [];
    var c = pool[cat];
    var tone = (dm && dm.skinTone) ? dm.skinTone : 'white';
    var gender = (dm && dm.interactiveProfile && dm.interactiveProfile.gender) ? dm.interactiveProfile.gender : 'male';
    var entries = [];
    if (Array.isArray(c)) entries = c.slice();
    else if (c[gender] && Array.isArray(c[gender][tone])) entries = c[gender][tone].slice();
    else if (c[gender] && Array.isArray(c[gender])) entries = c[gender].slice();
    else if (c[tone] && Array.isArray(c[tone])) entries = c[tone].slice();
    if (!entries.length && c[gender] && c[gender].white && Array.isArray(c[gender].white)) entries = c[gender].white.slice();
    return entries.map(fdmNormAtt).filter(function(x) { return x && x.path; });
}

function fdmGetPlayerPhoto(style) {
    var pool = (typeof setup !== 'undefined' && setup.fdmPlayerPhotos) ? setup.fdmPlayerPhotos : {};
    return Array.isArray(pool[style]) ? fdmNormAtt(fdmPick(pool[style])) : null;
}

/* ── STAT GATES ──────────────────────────────────────────────────────── */

var FDM_PHOTO_GATES = {
    normal: { cor: 0, con: 0 },
    sexy:   { cor: 2, con: 60 },
    nude:   { cor: 3, con: 0 },
    ass:    { cor: 2, con: 50 },
    boobs:  { cor: 2, con: 40 },
    pussy:  { cor: 3, con: 0 }
};

function fdmPhotoAllowed(vars, style) {
    var g = FDM_PHOTO_GATES[style];
    if (!g) return false;
    return fdmStat(vars, 'corruption') >= g.cor && fdmStat(vars, 'confidence') >= g.con;
}

function fdmNumberAllowed(vars) {
    return fdmStat(vars, 'corruption') >= 3;
}

/* ── STATE ───────────────────────────────────────────────────────────── */

function fdmMakeState(dm) {
    var persona = (dm && dm.interactiveProfile && dm.interactiveProfile.persona)
        ? dm.interactiveProfile.persona : 'lustful';
    var cfg = fdmPersonaCfg(persona);
    return {
        persona:        persona,
        gender:         String(cfg.gender || 'male'),
        heat:           fdmClamp(cfg.startHeat || 20, 0, 100),
        heatMult:       Number(cfg.heatMult != null ? cfg.heatMult : 1.0),
        persistence:    Number(cfg.persistence != null ? cfg.persistence : 3),
        turn:           0,
        lastMsgType:    'opener',
        lastMsgChoices: null,
        lastAnonText:   '',
        currentChoices: null,    /* v2: cached resolved choices for UI consistency */
        awaitingPhoto:  false,
        ended:          false,
        numberAsked:    false,
        numberRejected: false,
        photoCooldownTurns: 0,
        lastPlayerDelta: 0,
        pushbackStreak: 0,
        pressureDebt:   0,
        lastPressureTurn: -99,
        anonMsgUseCount: {},
        recentAnonTypes: [],
        recentAnon:     [],
        recentPlayer:   [],
        playerPhotoCount: 0
    };
}

function fdmGetDM(vars, id) {
    var dms = (vars && vars.phoneFotogramDMs) ? vars.phoneFotogramDMs : [];
    for (var i = 0; i < dms.length; i++) {
        if (dms[i] && dms[i].id === id) return dms[i];
    }
    return null;
}

function fdmAddMsg(dm, from, text, att, vars) {
    if (!dm.messages) dm.messages = [];
    dm.messages.push({
        from: from, text: text || '', time: fdmTime(vars),
        read: from === 'me', attachment: att || null
    });
    if (dm.messages.length > 100) dm.messages.splice(0, dm.messages.length - 100);
}

/* ── ANON MESSAGE RESOLUTION ─────────────────────────────────────────── */

function fdmResolveAnonMsg(state, dm) {
    var range = fdmHeatRange(state.heat);

    if (Number(state.pressureDebt || 0) >= 7 && Number(state.pushbackStreak || 0) >= 2 && Number(state.lastPlayerDelta || 0) <= 0) {
        return fdmMakeForcedCloseMsg(state);
    }

    /* If heat is fire and number not yet asked → 50% number, 50% hot; and not before turn 5 (avoid too fast escalation) */
    var turnEarly = Number(state.turn || 0);
    if (state.heat > 80 && !state.numberAsked && !state.numberRejected && turnEarly >= 5) {
        var numPool = fdmGetMsgPool(state.persona, 'number');
        var hotPool = fdmGetMsgPool(state.persona, 'hot');
        var goNumber = numPool.length && (hotPool.length === 0 || Math.random() < 0.5);
        if (goNumber && numPool.length) {
            var np = fdmPickNoImmediateRepeat(numPool, state.recentAnon, state.lastAnonText);
            if (np) {
                state.numberAsked = true;
                return np;
            }
        }
    }

    var safeRange = range;
    if (state.numberRejected && safeRange === 'fire') safeRange = 'hot';
    var pool = fdmGetMsgPool(state.persona, safeRange);
    if (!pool.length) return null;

    /* Avoid repeating same (resolved) message — filter by recentAnon */
    pool = fdmFilterPoolByRecentResolved(pool, state);

    /* After player just sent a photo and anon reacted: next message must not be another dick pic or "send more" — allow chat or number so convo can progress. */
    if (state.justReceivedPlayerPhoto) {
        state.justReceivedPlayerPhoto = false;
        var allowAfterPhoto = function(e) {
            if (!e || typeof e !== 'object') return false;
            var t = String(e.type || '').toLowerCase();
            if (t === 'photo_hint' || t === 'photo_request' || t === 'explicit' || t === 'cock_opener') return false;
            var att = e.attachmentCategory || (e.attachment && e.attachment.category);
            if (att === 'cock' || att === 'cum') return false;
            return true;
        };
        pool = pool.filter(allowAfterPhoto);
        if (!pool.length) {
            var coldPool = fdmGetMsgPool(state.persona, 'cold');
            var hotPool = fdmGetMsgPool(state.persona, 'hot');
            var firePool = fdmGetMsgPool(state.persona, 'fire');
            var chatOnly = coldPool.filter(allowAfterPhoto).concat(hotPool.filter(allowAfterPhoto)).concat(firePool.filter(allowAfterPhoto));
            if (chatOnly.length) pool = fdmFilterPoolByRecentResolved(chatOnly, state);
        }
    }

    /* After bridge: chat only (no explicit/photo request), real cool-down */
    if (state.afterBridgeThisTurn) {
        state.afterBridgeThisTurn = false;
        var coldPool = fdmGetMsgPool(state.persona, 'cold');
        var warmPool = fdmGetMsgPool(state.persona, 'warm');
        var onlyChat = function(e) {
            var t = e && typeof e === 'object' ? String(e.type || '') : '';
            return t === 'chat' || t === '';
        };
        var coolPool = coldPool.filter(onlyChat);
        coolPool = coolPool.concat(warmPool.filter(onlyChat));
        if (coolPool.length) {
            pool = fdmFilterPoolByRecentResolved(coolPool, state);
        }
    }

    /* Female persona: "send one more" only after player has sent at least one photo */
    var pPhotoCount = Number(state.playerPhotoCount || 0);
    if ((state.persona === 'wild' || state.persona === 'flirty') && pPhotoCount < 1) {
        pool = pool.filter(function(e) { return !(e && e.oneMoreRequest === true); });
        if (!pool.length) pool = fdmGetMsgPool(state.persona, safeRange).slice();
        pool = fdmFilterPoolByRecentResolved(pool, state);
    }

    /* firstReplyOnly: "at least you replied" etc. only right after opener */
    var lastTypeForFilter = String(state.lastMsgType || '');
    if (safeRange === 'cold') {
        if (lastTypeForFilter === 'opener') {
            var firstOnly = pool.filter(function(e) { return e && e.firstReplyOnly === true; });
            if (firstOnly.length) pool = firstOnly;
        } else {
            pool = pool.filter(function(e) { return !(e && e.firstReplyOnly === true); });
            if (!pool.length) pool = fdmGetMsgPool(state.persona, 'cold').slice();
        }
    }

    /* Escalation: fire / heavy explicit only after enough turns (avoid vulgar too fast) */
    var turn = Number(state.turn || 0);
    if (safeRange === 'fire' && turn < 5) {
        var hotPool = fdmGetMsgPool(state.persona, 'hot');
        if (hotPool.length) { safeRange = 'hot'; pool = fdmFilterPoolByRecentResolved(hotPool, state); }
    }

    if (state.numberRejected) {
        pool = pool.filter(function(e) {
            return !(e && typeof e === 'object' && String(e.type || '') === 'number_request');
        });
        if (!pool.length) return null;
    }

    /* If number already requested, don't repeat same request (number_request msgs in fire/hot) */
    if (state.numberAsked) {
        pool = pool.filter(function(e) {
            return !(e && typeof e === 'object' && String(e.type || '') === 'number_request');
        });
        if (!pool.length) return null;
    }

    /* If player recently pushed back, block pressure lines until debt is paid down. */
    if (Number(state.pressureDebt || 0) > 0) {
        var debtSafePool = pool.filter(function(e) {
            var tDebt = e && typeof e === 'object' ? String(e.type || '') : '';
            return !fdmIsPressureType(tDebt);
        });
        if (debtSafePool.length) {
            pool = debtSafePool;
        } else if (Number(state.pushbackStreak || 0) >= 2) {
            return fdmMakeForcedCloseMsg(state);
        }
    }

    /* After player pushback/rejection, cool down pressure topics for a few anon turns. */
    if (state.photoCooldownTurns > 0) {
        var cooledPool = pool.filter(function(e) {
            var t = e && typeof e === 'object' ? String(e.type || '') : '';
            return !fdmIsPressureType(t);
        });
        if (cooledPool.length) {
            pool = cooledPool;
        } else {
            /* Hard fallback: when current range has only pressure lines, step down to chat/cold. */
            var coldPool = fdmGetMsgPool(state.persona, 'cold');
            var coldSafe = coldPool.filter(function(e) {
                var t2 = e && typeof e === 'object' ? String(e.type || '') : '';
                return !fdmIsPressureType(t2) && !fdmIsExplicitTaggedEntry(e);
            });
            if (coldSafe.length) pool = coldSafe;
            else if (Number(state.pushbackStreak || 0) >= 2) return fdmMakeForcedCloseMsg(state);
        }
    }

    /* Throttle pressure cadence: don't allow pressure type too frequently. */
    if (state.turn - Number(state.lastPressureTurn || -99) < 3) {
        var cadenceSafe = pool.filter(function(e) {
            var tCad = e && typeof e === 'object' ? String(e.type || '') : '';
            return !fdmIsPressureType(tCad);
        });
        if (cadenceSafe.length) pool = cadenceSafe;
    }

    /* Keep explicit placeholders out of low/mid heat to avoid abrupt tone jumps. */
    if (state.heat < 58) {
        var nonExplicitPool = pool.filter(function(e) { return !fdmIsExplicitTaggedEntry(e); });
        if (nonExplicitPool.length) pool = nonExplicitPool;
    }

    /* Keep thread continuity: if possible, continue with same message type */
    var lastType = String(state.lastMsgType || '');
    if (lastType && lastType !== 'opener') {
        var allowSameType = true;
        if (fdmIsPressureType(lastType) && Number(state.lastPlayerDelta || 0) <= 0) {
            allowSameType = false;
        }
        if (fdmIsPressureType(lastType) && (Number(state.pressureDebt || 0) > 0 || state.photoCooldownTurns > 0)) {
            allowSameType = false;
        }
        if (!allowSameType) {
            return fdmPickNoImmediateRepeat(pool, state.recentAnon, state.lastAnonText);
        }
        var sameTypePool = pool.filter(function(e) {
            return e && typeof e === 'object' && String(e.type || '') === lastType;
        });
        if (sameTypePool.length) {
            var sameTypePick = fdmPickNoImmediateRepeat(sameTypePool, state.recentAnon, state.lastAnonText);
            if (sameTypePick) return sameTypePick;
        }
    }

    if (Number(state.pressureDebt || 0) >= 4) {
        var nonPressure = pool.filter(function(e) {
            var tDebt2 = e && typeof e === 'object' ? String(e.type || '') : '';
            return !fdmIsPressureType(tDebt2);
        });
        if (nonPressure.length) pool = nonPressure;
        else if (Number(state.pushbackStreak || 0) >= 2) return fdmMakeForcedCloseMsg(state);
    }

    pool = fdmFilterPoolByUsage(pool, state);

    if (!pool.length) {
        var escalation = { cold:'warm', warm:'hot', hot:'fire' };
        var nextRange = escalation[safeRange];
        if (nextRange) {
            var escPool = fdmGetMsgPool(state.persona, nextRange);
            escPool = fdmFilterPoolByUsage(escPool, state);
            if (escPool.length) {
                return fdmPickNoImmediateRepeat(escPool, state.recentAnon, state.lastAnonText);
            }
        }
        return fdmMakeForcedCloseMsg(state);
    }

    return fdmPickNoImmediateRepeat(pool, state.recentAnon, state.lastAnonText);
}

/* ── PLAYER CHOICES (v2: cached) ─────────────────────────────────────── */

function fdmResolveChoices(state, forceResolve) {
    /* v2: Return cached choices if available (prevents re-shuffle between render and process) */
    if (!forceResolve && Array.isArray(state.currentChoices) && state.currentChoices.length) {
        return state.currentChoices;
    }

    var resolved;

    /* Per-message choices take priority */
    if (state.lastMsgChoices && state.lastMsgChoices.length) {
        var copy = state.lastMsgChoices.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
        }
        resolved = copy.slice(0, 3);
        /* If player already sent a photo and this is a photo request, offer "I already sent" option */
        var lt = String(state.lastMsgType || '');
        if ((lt === 'photo_request' || lt === 'photo_hint') && Number(state.playerPhotoCount || 0) >= 1 && resolved.length >= 2) {
            resolved[1] = { text: "I already sent. What more do you want?", delta: -2, alreadySent: true };
        }
    } else {
        /* Fallback to type pool */
        var pool = fdmGetChoicePool(state.lastMsgType, state.heat);
        if (!pool || !pool.length) {
            pool = fdmGetChoicePool('generic', state.heat) || [];
        }
        var copy2 = pool.slice();
        for (var i2 = copy2.length - 1; i2 > 0; i2--) {
            var j2 = Math.floor(Math.random() * (i2 + 1));
            var tmp2 = copy2[i2]; copy2[i2] = copy2[j2]; copy2[j2] = tmp2;
        }
        resolved = copy2.slice(0, 3);
    }

    resolved = resolved.map(function(c) {
        var next = Object.assign({}, c);
        next.text = fdmNormalizeChoiceText(next.text, state.persona);
        return next;
    });

    /* v2: Cache the resolved choices */
    state.currentChoices = resolved;
    return resolved;
}

/* ── PHOTO SUBMENU ───────────────────────────────────────────────────── */

function fdmPhotoOptions(vars) {
    var styles = ['normal', 'sexy', 'nude', 'ass', 'boobs', 'pussy'];
    var opts = [];
    for (var i = 0; i < styles.length; i++) {
        var s = styles[i];
        opts.push({ style: s, enabled: fdmPhotoAllowed(vars, s) });
    }
    opts.push({ style: 'hayir', enabled: true, delta: -20 });
    return opts;
}

var PHOTO_DELTAS = { normal: 10, sexy: 30, nude: 40, ass: 38, boobs: 35, pussy: 42 };

/* ── v2: REACTION SYSTEM ─────────────────────────────────────────────── */
/*
   After player choice, anon REACTS first.
   delta > 3  → react_positive
   delta < -3 → react_negative
   else       → react_neutral
   Then new heat-based message follows.
*/

function fdmClassifyChoice(delta) {
    if (delta > 3)  return 'react_positive';
    if (delta < -3) return 'react_negative';
    return 'react_neutral';
}

var FDM_WHY_SEND_RE = /why\s+should\s+I\s+send\s*\??/i;
var FDM_WHAT_DID_YOU_SEND_RE = /what\s+did\s+you\s+send\s*\??/i;

function fdmSendReaction(vars, dm, state, delta, choiceText) {
    var bridge = fdmBuildBridgeReaction(choiceText, delta);
    if (bridge) {
        fdmAddMsg(dm, dm.id, bridge, null, vars);
        state.justSentBridge = true;
        return;
    }
    /* "What did you send?" → answer (I sent my dick / a photo, your turn) */
    if (choiceText && FDM_WHAT_DID_YOU_SEND_RE.test(String(choiceText).trim())) {
        var whatPool = (typeof setup !== 'undefined' && setup.fdmWhatDidYouSendReply) ? setup.fdmWhatDidYouSendReply[state.persona] : null;
        if (!whatPool && setup.fdmWhatDidYouSendReply) whatPool = setup.fdmWhatDidYouSendReply.generic;
        if (Array.isArray(whatPool) && whatPool.length) {
            var line = fdmPick(whatPool);
            if (line) {
                fdmAddMsg(dm, dm.id, String(line), null, vars);
                return;
            }
        }
    }
    /* "Why should I send?" → seductive reply (to satisfy me babe etc.) */
    if (choiceText && FDM_WHY_SEND_RE.test(String(choiceText).trim())) {
        var whyPool = (typeof setup !== 'undefined' && setup.fdmWhySendReply) ? setup.fdmWhySendReply[state.persona] : null;
        if (!whyPool && setup.fdmWhySendReply) whyPool = setup.fdmWhySendReply.generic;
        if (Array.isArray(whyPool) && whyPool.length) {
            var line = fdmPick(whyPool);
            if (line) {
                fdmAddMsg(dm, dm.id, String(line), null, vars);
                return;
            }
        }
    }
    if (!fdmUseLegacyReactionPools()) return;

    var reactType = fdmClassifyChoice(delta);
    var reactPool = fdmGetMsgPool(state.persona, reactType);
    if (!reactPool || !reactPool.length) return;   /* no reaction pool → skip */
    var react = fdmAPick(reactPool, state.recentAnon);
    if (!react) return;
    var built = fdmBuildMsgFromPoolEntry(react, state, dm);
    if (!built) return;
    fdmAddMsg(dm, dm.id, built.text, built.attachment, vars);
}

/* ── MAIN: process player text choice ───────────────────────────────── */

function processFotogramChoice(vars, dmId, choiceIndex) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm || !dm.flowState) return { ok: false };
    var s = dm.flowState;
    if (s.ended) return { ok: false };
    if (s.awaitingPhoto) return { ok: false, reason: 'awaiting_photo' };

    /* v2: Use CACHED choices — same order as what UI rendered */
    var choices = fdmResolveChoices(s);   /* returns cached if available */
    var choice = choices[choiceIndex];
    if (!choice) return { ok: false };

    /* Player message */
    fdmAddMsg(dm, 'me', choice.text, null, vars);

    /* Heat update */
    var rawDelta = Number(choice.delta || 0);
    var delta = rawDelta * s.heatMult;
    s.heat = fdmClamp(s.heat + delta, 0, 100);
    s.lastPlayerDelta = rawDelta;
    if (rawDelta <= 0) s.pushbackStreak = Number(s.pushbackStreak || 0) + 1;
    else s.pushbackStreak = 0;

    if (rawDelta >= 4) {
        s.pressureDebt = Math.max(0, Number(s.pressureDebt || 0) - 2);
    } else if (rawDelta <= -8) {
        s.pressureDebt = Math.min(8, Number(s.pressureDebt || 0) + 2);
    }

    /* v2: Clear cached choices — new turn, new choices */
    s.currentChoices = null;

    /* Player said "I already sent. What more do you want?" — anon replies without pushing, no dick pic next */
    if (choice.alreadySent) {
        var alreadyPool = (typeof setup !== 'undefined' && setup.fdmAlreadySentReply) ? setup.fdmAlreadySentReply[s.persona] : null;
        if (!alreadyPool && setup.fdmAlreadySentReply) alreadyPool = setup.fdmAlreadySentReply.generic;
        if (Array.isArray(alreadyPool) && alreadyPool.length) {
            var alreadyLine = fdmPick(alreadyPool);
            if (alreadyLine) fdmAddMsg(dm, dm.id, String(alreadyLine), null, vars);
        }
        s.justReceivedPlayerPhoto = true;
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        if (window.updatePhoneBadges) window.updatePhoneBadges();
        return fdmDoAnonTurn(vars, dm, s);
    }

    /* Does this choice trigger photo submenu? */
    if (choice.triggersPhoto) {
        s.awaitingPhoto = true;
        /* Queue anon "waiting" reaction */
        var waitPool = fdmGetMsgPool(s.persona, 'waiting');
        if (waitPool && waitPool.length) {
            var wp = fdmAPick(waitPool, s.recentAnon);
            if (wp) {
                var builtWait = fdmBuildMsgFromPoolEntry(wp, s, dm);
                if (builtWait) fdmAddMsg(dm, dm.id, builtWait.text, builtWait.attachment, vars);
            }
        }
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        if (window.updatePhoneBadges) window.updatePhoneBadges();
        return {
            ok: true,
            awaitingPhoto: true,
            photoOptions: fdmPhotoOptions(vars)
        };
    }

    /* Persistence: if choice was rejection */
    if (choice.isRejection) {
        s.photoCooldownTurns = Math.max(Number(s.photoCooldownTurns || 0), 4);
        s.pressureDebt = Math.min(8, Number(s.pressureDebt || 0) + 2);
        s.persistence--;
        if (s.persistence <= 0) {
            var closePool = fdmGetMsgPool(s.persona, 'close');
            var cp = closePool && closePool.length ? fdmAPick(closePool, s.recentAnon) : null;
            if (cp) {
                var builtClose = fdmBuildMsgFromPoolEntry(cp, s, dm);
                if (builtClose) fdmAddMsg(dm, dm.id, builtClose.text, builtClose.attachment, vars);
            }
            s.ended = true;
            if (window.persistPhoneChanges) window.persistPhoneChanges();
            return { ok: true, ended: true };
        }
    } else if (rawDelta <= -8) {
        s.persistence--;
        if (s.persistence <= 0) {
            var closePoolHard = fdmGetMsgPool(s.persona, 'close');
            var cpHard = closePoolHard && closePoolHard.length ? fdmAPick(closePoolHard, s.recentAnon) : null;
            if (cpHard) {
                var builtCloseHard = fdmBuildMsgFromPoolEntry(cpHard, s, dm);
                if (builtCloseHard) fdmAddMsg(dm, dm.id, builtCloseHard.text, builtCloseHard.attachment, vars);
            }
            s.ended = true;
            if (window.persistPhoneChanges) window.persistPhoneChanges();
            return { ok: true, ended: true };
        }
    }

    /* v2: Anon REACTS to player's choice before next message */
    fdmSendReaction(vars, dm, s, rawDelta, choice.text);

    /* After bridge ("got it, backing off"): skip cock reaction, cool the chat */
    var hadBridge = !!s.justSentBridge;
    if (s.justSentBridge) s.justSentBridge = false;
    if (hadBridge) s.afterBridgeThisTurn = true;

    /* After cock opener: send suggestive reaction first — only if they did NOT send a bridge (else skip "got hard thinking of you" + "I sent you send") */
    if (String(s.lastMsgType || '') === 'cock_opener' && !hadBridge) {
        var cockReact = (typeof setup !== 'undefined' && setup.fdmAfterCockOpenerReaction) ? setup.fdmAfterCockOpenerReaction[s.persona] : null;
        if (!cockReact && setup.fdmAfterCockOpenerReaction) cockReact = setup.fdmAfterCockOpenerReaction.generic;
        if (Array.isArray(cockReact) && cockReact.length) {
            var line = fdmPick(cockReact);
            if (line) fdmAddMsg(dm, dm.id, String(line), null, vars);
        }
    }

    /* Anon next message */
    return fdmDoAnonTurn(vars, dm, s);
}

/* ── MAIN: process photo choice ─────────────────────────────────────── */

function processFotogramPhoto(vars, dmId, style) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm || !dm.flowState) return { ok: false };
    var s = dm.flowState;
    if (s.ended || !s.awaitingPhoto) return { ok: false };

    s.awaitingPhoto = false;
    s.currentChoices = null;   /* v2: clear cache */

    if (style === 'hayir') {
        /* Player backed out */
        fdmAddMsg(dm, 'me', 'no, not needed', null, vars);
        s.heat = fdmClamp(s.heat - 20, 0, 100);
        s.lastPlayerDelta = -20;
        s.pushbackStreak = Number(s.pushbackStreak || 0) + 1;
        s.photoCooldownTurns = Math.max(Number(s.photoCooldownTurns || 0), 5);
        s.pressureDebt = Math.min(8, Number(s.pressureDebt || 0) + 3);
        s.persistence--;
        if (s.persistence <= 0) {
            var closePool = fdmGetMsgPool(s.persona, 'close');
            var cp = closePool && closePool.length ? fdmAPick(closePool, s.recentAnon) : null;
            if (cp) {
                var builtClose2 = fdmBuildMsgFromPoolEntry(cp, s, dm);
                if (builtClose2) fdmAddMsg(dm, dm.id, builtClose2.text, builtClose2.attachment, vars);
            }
            s.ended = true;
            if (window.persistPhoneChanges) window.persistPhoneChanges();
            return { ok: true, ended: true };
        }
        /* v2: Reaction for photo rejection */
        fdmSendReaction(vars, dm, s, -20, 'no, not needed');
        return fdmDoAnonTurn(vars, dm, s);
    }

    /* Send player photo — text from player pool (female), not persona */
    var pAtt = fdmGetPlayerPhoto(style);
    var pSendPool = (typeof setup !== 'undefined' && setup.fdmPlayerPhotoSendTexts && setup.fdmPlayerPhotoSendTexts.length)
        ? setup.fdmPlayerPhotoSendTexts : null;
    var pText = (pSendPool && pSendPool.length) ? fdmPick(pSendPool) : 'al';
    fdmAddMsg(dm, 'me', pText, pAtt, vars);

    /* Heat delta */
    var delta = (PHOTO_DELTAS[style] || 10) * s.heatMult;
    s.heat = fdmClamp(s.heat + delta, 0, 100);
    s.lastPlayerDelta = Number(PHOTO_DELTAS[style] || 10);
    s.pushbackStreak = 0;
    s.photoCooldownTurns = 0;
    s.pressureDebt = Math.max(0, Number(s.pressureDebt || 0) - 2);
    s.playerPhotoCount = Number(s.playerPhotoCount || 0) + 1;

    /* Random: satisfied (came) vs want one more. Second photo = higher chance to be satisfied. */
    var chances = (typeof setup !== 'undefined' && setup.fdmPhotoChances) ? setup.fdmPhotoChances : {};
    var satisfiedChance = s.playerPhotoCount >= 2
        ? (Number(chances.satisfiedSecond) >= 0 ? chances.satisfiedSecond : 0.6)
        : (Number(chances.satisfiedFirst) >= 0 ? chances.satisfiedFirst : 0.35);
    var satisfied = Math.random() < satisfiedChance;

    if (satisfied) {
        /* Anon came — thank, say liked you. Random: ask for number or just chat. */
        var askNumberChance = Number(chances.askNumberChance) >= 0 ? chances.askNumberChance : 0.5;
        var askNumber = Math.random() < askNumberChance;
        var satPool = fdmGetMsgPool(s.persona, askNumber ? 'react_photo_satisfied_number' : 'react_photo_satisfied_chat');
        if (satPool && satPool.length) {
            var sp = fdmAPick(satPool, s.recentAnon);
            if (sp) {
                var builtSat = fdmBuildMsgFromPoolEntry(sp, s, dm);
                if (builtSat) fdmAddMsg(dm, dm.id, builtSat.text, builtSat.attachment, vars);
            }
        }
        if (askNumber) {
            s.numberAsked = true;
            s.currentChoices = null;
            if (window.persistPhoneChanges) window.persistPhoneChanges();
            if (window.updatePhoneBadges) window.updatePhoneBadges();
            return { ok: true, numberRequest: true, numberAllowed: fdmNumberAllowed(vars) };
        }
        s.justReceivedPlayerPhoto = true;
        return fdmDoAnonTurn(vars, dm, s);
    }

    /* Not satisfied — no dick pic, just push for one more (text only). */
    var wantMorePool = fdmGetMsgPool(s.persona, 'react_photo_want_more');
    if (wantMorePool && wantMorePool.length) {
        var wm = fdmAPick(wantMorePool, s.recentAnon);
        if (wm) {
            var builtWm = fdmBuildMsgFromPoolEntry(wm, s, dm);
            if (builtWm) fdmAddMsg(dm, dm.id, builtWm.text, builtWm.attachment, vars);
        }
    }
    /* Do not set justReceivedPlayerPhoto — next turn can be photo_request again. */
    return fdmDoAnonTurn(vars, dm, s);
}

/* ── MAIN: process number choice ─────────────────────────────────────── */

function processFotogramNumber(vars, dmId, give) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm || !dm.flowState) return { ok: false };
    var s = dm.flowState;
    if (s.ended) return { ok: false };

    s.currentChoices = null;   /* v2: clear cache */

    if (give) {
        /* Player message: give number (from pool) */
        var giveTexts = (typeof setup !== 'undefined' && Array.isArray(setup.fdmPlayerGiveNumberTexts) && setup.fdmPlayerGiveNumberTexts.length)
            ? setup.fdmPlayerGiveNumberTexts : ['Sure, here\'s my number :)'];
        var playerGiveText = giveTexts[Math.floor(Math.random() * giveTexts.length)];
        fdmAddMsg(dm, 'me', playerGiveText, null, vars);
        /* Anon happy reaction (react_number) */
        var hPool = fdmGetMsgPool(s.persona, 'react_number');
        if (hPool && hPool.length) {
            var hp = fdmAPick(hPool, s.recentAnon);
            if (hp) {
                var builtHappy = fdmBuildMsgFromPoolEntry(hp, s, dm);
                if (builtHappy) fdmAddMsg(dm, dm.id, builtHappy.text, builtHappy.attachment, vars);
            }
        }
        /* Anon sends their number back (swap) */
        if (!s.anonPhoneNumber) {
            s.anonPhoneNumber = '555-' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000);
        }
        var swapPool = fdmGetMsgPool(s.persona, 'anon_send_number');
        if (swapPool && swapPool.length) {
            var swapEntry = fdmAPick(swapPool, s.recentAnon);
            var swapText = (swapEntry && swapEntry.text) ? String(swapEntry.text).replace(/\{anonNumber\}/g, s.anonPhoneNumber) : ('Here\'s mine: ' + s.anonPhoneNumber);
            fdmAddMsg(dm, dm.id, swapText, null, vars);
        }
        s.ended = true;
        /* Promote to contact */
        if (typeof Engine !== 'undefined' && Engine.wiki) {
            Engine.wiki('<<phonePromoteContact "' + dmId + '">>');
        }
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        return { ok: true, ended: true, promoted: true };
    } else {
        fdmAddMsg(dm, 'me', 'lol no', null, vars);
        s.heat = fdmClamp(s.heat - 25, 0, 100);
        s.pushbackStreak = Number(s.pushbackStreak || 0) + 1;
        s.numberAsked = true;
        s.numberRejected = true;
        s.persistence--;
        var rejectKey = fdmGetFinisherPoolKey(s, 'number_rejected');
        var closePool = fdmGetMsgPool(s.persona, rejectKey);
        var cp = closePool && closePool.length ? fdmAPick(closePool, s.recentAnon) : null;
        if (cp) {
            var builtClose3 = fdmBuildMsgFromPoolEntry(cp, s, dm);
            if (builtClose3) fdmAddMsg(dm, dm.id, builtClose3.text, builtClose3.attachment, vars);
        }
        s.ended = true;
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        return { ok: true, ended: true };
    }
}

/* ── ANON TURN ───────────────────────────────────────────────────────── */

function fdmDoAnonTurn(vars, dm, s) {
    var cfg = fdmPersonaCfg(s.persona);
    var maxTurns = Number(cfg.maxTurns || 14);
    var boredHeat = Number(cfg.boredHeat || 30);
    var boredTurn = Number(cfg.boredTurn || 8);
    var turn = Number(s.turn || 0);

    var shouldClose = false;
    if (turn >= maxTurns) {
        shouldClose = true;
    } else if (turn >= boredTurn && s.heat < boredHeat) {
        shouldClose = true;
    }

    if (shouldClose) {
        var closeCause = (turn >= maxTurns) ? 'max_turns' : 'bored';
        var finisherKey = fdmGetFinisherPoolKey(s, closeCause);
        var boreClosePool = fdmGetMsgPool(s.persona, finisherKey);
        if (!boreClosePool || !boreClosePool.length) boreClosePool = fdmGetMsgPool(s.persona, 'close');
        var bcp = boreClosePool && boreClosePool.length ? fdmAPick(boreClosePool, s.recentAnon) : null;
        if (bcp) {
            var builtBoreClose = fdmBuildMsgFromPoolEntry(bcp, s, dm);
            if (builtBoreClose) fdmAddMsg(dm, dm.id, builtBoreClose.text, builtBoreClose.attachment, vars);
        }
        s.ended = true;
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        return { ok: true, ended: true };
    }

    var msg = fdmResolveAnonMsg(s, dm);
    if (!msg) {
        /* v2: Force-resolve new choices even if no message */
        fdmResolveChoices(s, true);
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        return { ok: true, choices: s.currentChoices };
    }

    var builtMsg = fdmBuildMsgFromPoolEntry(msg, s, dm);
    var text = builtMsg ? builtMsg.text : String(msg.text || msg || '...');
    var att = builtMsg ? builtMsg.attachment : null;
    fdmAddMsg(dm, dm.id, text, att, vars);
    fdmMarkAnonMsgUsed(s, msg);

    /* Update last msg type for choice resolution */
    if (msg.type) s.lastMsgType = msg.type;
    if (String(msg.type || '') === 'number_request') s.numberAsked = true;
    s.lastMsgChoices = Array.isArray(msg.choices) ? msg.choices : null;
    s.lastAnonText = text;
    s.recentAnon = s.recentAnon || [];
    s.recentAnon.push(text);
    if (s.recentAnon.length > 15) s.recentAnon.shift();
    var mType = String(msg.type || '');
    if (mType) {
        s.recentAnonTypes = Array.isArray(s.recentAnonTypes) ? s.recentAnonTypes : [];
        s.recentAnonTypes.push(mType);
        if (s.recentAnonTypes.length > 8) s.recentAnonTypes.shift();
        if (fdmIsPressureType(mType)) s.lastPressureTurn = Number(s.turn || 0);
    }
    s.turn++;
    if (s.photoCooldownTurns > 0) s.photoCooldownTurns--;

    /* v2: Clear and force-resolve new choices for this message */
    s.currentChoices = null;

    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();

    if (msg.forceEnd === true || String(msg.type || '') === 'close') {
        s.ended = true;
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        return { ok: true, ended: true };
    }

    /* v2 FIX: Only trigger number UI when message type IS number_request */
    /* REMOVED: || s.heat > 80   ← this was forcing number UI for ANY high-heat message */
    if (msg.type === 'number_request') {
        return {
            ok: true,
            numberRequest: true,
            numberAllowed: fdmNumberAllowed(vars)
        };
    }

    /* v2: Force-resolve so choices are cached before UI renders */
    var newChoices = fdmResolveChoices(s, true);

    return {
        ok: true,
        choices: newChoices,
        heat: s.heat,
        awaitingPhoto: s.awaitingPhoto
    };
}

/* ── BOOTSTRAP ───────────────────────────────────────────────────────── */

function bootstrapFotogramDM(vars, dmId) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm) return false;
    if (dm.messages && dm.messages.length > 0) return true;
    if (!dm.flowState) dm.flowState = fdmMakeState(dm);
    dm.messages = [];
    var s = dm.flowState;

    var pool = fdmGetMsgPool(s.persona, 'opener');
    if (!pool.length) return false;
    var p = fdmAPick(pool, s.recentAnon);
    if (!p) return false;

    var builtOpen = fdmBuildMsgFromPoolEntry(p, s, dm);
    var text = builtOpen ? builtOpen.text : String(p.text || p || '...');
    var att = builtOpen ? builtOpen.attachment : null;
    if (p.type) s.lastMsgType = p.type;
    s.lastMsgChoices = Array.isArray(p.choices) ? p.choices : null;

    /* v2: Pre-resolve and cache choices for opener */
    s.currentChoices = null;
    fdmResolveChoices(s, true);

    /* Photo opener: first photo as one message, then text as separate message (two bubbles) */
    if (att) {
        fdmAddMsg(dm, dm.id, '', att, vars);
        if (String(text || '').trim()) fdmAddMsg(dm, dm.id, text.trim(), null, vars);
    } else {
        fdmAddMsg(dm, dm.id, text, null, vars);
    }
    fdmMarkAnonMsgUsed(s, p);
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();
    return true;
}

/* ── GET CURRENT CHOICES ─────────────────────────────────────────────── */

function getFotogramChoices(vars, dmId) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm || !dm.flowState) return { choices: [] };
    var s = dm.flowState;
    if (s.ended) return { ended: true };
    if (s.awaitingPhoto) return { awaitingPhoto: true, photoOptions: fdmPhotoOptions(vars) };
    if (s.numberAsked) return { numberRequest: true, numberAllowed: fdmNumberAllowed(vars) };
    return { choices: fdmResolveChoices(s), heat: s.heat };   /* v2: returns cached */
}

/* ── CREATE ──────────────────────────────────────────────────────────── */

function createFotogramInteractiveDM(vars, profile) {
    if (!vars) return null;
    if (!vars.phoneFotogramDMs) vars.phoneFotogramDMs = [];
    var id = 'fdm_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    var dm = {
        id: id, anonId: id, interactive: true, messages: [],
        interactiveProfile: {
            persona: String(profile.persona || 'lustful'),
            gender:  String(profile.gender  || 'male')
        },
        skinTone:      String(profile.skinTone || 'white'),
        avatar:        String(profile.avatar   || ''),
        profileGender: String(profile.gender   || 'male'),
        blocked: false, promotedToCharId: null, swapIntroSent: false,
        flowState: null
    };
    dm.flowState = fdmMakeState(dm);
    vars.phoneFotogramDMs.push(dm);
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    return dm;
}


/* ── COMPAT: createFotogramDM (called by phone-fotogram.js) ─────────── */
/* Bridges new heat-based system with legacy API */

function normalizeGenderLabel(raw) {
    var v = String(raw || '').toLowerCase();
    if (v === 'male' || v === 'm') return 'Male';
    if (v === 'female' || v === 'f') return 'Female';
    return 'Unknown';
}

function generateFotogramDmId(existingDms) {
    var dms = Array.isArray(existingDms) ? existingDms : [];
    var used = {};
    for (var i = 0; i < dms.length; i++) {
        if (dms[i] && dms[i].id) used[String(dms[i].id)] = true;
    }
    var candidate, tries = 0;
    do {
        candidate = 'fotodm_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        tries++;
    } while (used[candidate] && tries < 20);
    return candidate;
}

function fdmPickPersona(genderKey) {
    var male   = ['naive', 'lustful', 'pervy'];
    var female = ['flirty', 'wild'];
    var pool = (genderKey === 'female') ? female : male;
    return pool[Math.floor(Math.random() * pool.length)];
}

function fdmPickGender() {
    var maleW   = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmMaleWeight)))
        ? Number(setup.fotogramDmMaleWeight) : 0.7;
    var femaleW = (typeof setup !== 'undefined' && Number.isFinite(Number(setup.fotogramDmFemaleWeight)))
        ? Number(setup.fotogramDmFemaleWeight) : 0.3;
    if (maleW < 0) maleW = 0;
    if (femaleW < 0) femaleW = 0;
    var total = maleW + femaleW;
    if (total <= 0) return 'male';
    return Math.random() < (maleW / total) ? 'male' : 'female';
}

function createFotogramDM(vars, post) {
    if (!vars) return null;
    var dms = vars.phoneFotogramDMs || [];

    /* Anon name */
    var anonNames = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramAnonNames) && setup.fotogramAnonNames.length)
        ? setup.fotogramAnonNames : null;
    if (!anonNames) return null;
    var anonName = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
        ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedAnonNameIndices', anonNames) || anonNames[Math.floor(Math.random() * anonNames.length)])
        : anonNames[Math.floor(Math.random() * anonNames.length)];

    /* Skin tone */
    var skinTones = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramAnonSkinTones) && setup.fotogramAnonSkinTones.length)
        ? setup.fotogramAnonSkinTones : ['white'];
    var skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];

    var dmId   = generateFotogramDmId(dms);
    var gender = fdmPickGender();
    var persona = fdmPickPersona(gender);

    /* Non-interactive fallback */
    var useInteractive = true;
    var followers = Math.max(0, Number(vars && vars.phoneFollowers) || 0);
    var quality   = Math.max(0, Number(post && post.quality) || 0);
    if (followers < 100 && quality < 30) useInteractive = false;

    var dm = {
        id: dmId,
        postId: post && post.id,
        anonId: dmId,
        anonName: anonName,
        skinTone: skinTone,
        charId: null,
        blocked: false,
        messages: [],
        availableReplyKeys: useInteractive ? [] : ['thanks_auto'],
        simpleThanksSent: false,
        profileGender: normalizeGenderLabel(gender),
        profileAge: 18 + Math.floor(Math.random() * 17),
        promotedToCharId: null,
        interactive: useInteractive,
        interactiveProfile: useInteractive ? { persona: persona, gender: gender } : null,
        flowState: null
    };

    if (useInteractive) {
        dm.flowState = fdmMakeState(dm);
        /* v2 FIX: Push dm to array FIRST, then bootstrap.
           Old code tried bootstrap before push → always failed → re-pushed → re-bootstrapped.
           Now it's clean: push once, bootstrap once. */
        dms.push(dm);
        vars.phoneFotogramDMs = dms;
        if (dms.length > 50) dms.splice(0, dms.length - 50);
        if (typeof State !== 'undefined' && State.variables && State.variables === vars) {
            State.variables.phoneFotogramDMs = dms;
        }
        bootstrapFotogramDM(vars, dmId);
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        if (window.updatePhoneBadges) window.updatePhoneBadges();
        return dm;
    } else {
        /* Simple non-interactive: pull from encouraging messages pool */
        var encouragingMsgs = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingMessages) && setup.fotogramDMEncouragingMessages.length)
            ? setup.fotogramDMEncouragingMessages : null;
        if (!encouragingMsgs) return null;
        var firstMsg = (typeof pickFromPoolWithUnusedPreference === 'function' && vars)
            ? (pickFromPoolWithUnusedPreference(vars, 'phoneFotogramDMUsedEncouragingIndices', encouragingMsgs) || encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)])
            : encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)];
        if (!firstMsg) return null;
        dm.messages.push({ from: dmId, text: firstMsg, time: fdmTime(vars), read: false });
    }

    dms.push(dm);
    if (dms.length > 50) dms.splice(0, dms.length - 50);
    vars.phoneFotogramDMs = dms;
    if (typeof State !== 'undefined' && State.variables && State.variables === vars) {
        State.variables.phoneFotogramDMs = dms;
    }
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();
    return dm;
}

function canUseSwapInFotogramDm(vars) {
    return fdmNumberAllowed(vars);
}

function getFotogramDmThreadModeForPost(vars, post) {
    var followers = Math.max(0, Number(vars && vars.phoneFollowers) || 0);
    var quality   = Math.max(0, Number(post && post.quality) || 0);
    if (followers < 100 && quality < 30) return 'non_interactive';
    return 'interactive';
}

/* ── UTILITY FUNCTIONS (used by phone-fotogram.js and UI) ────────────── */

function getActiveFotogramDMs(vars) {
    var dms = (vars && vars.phoneFotogramDMs) || [];
    return dms.filter(function(dm) { return dm && !dm.promotedToCharId && !dm.blocked; });
}

function countUnreadFotogramDmMessages(dm) {
    if (!dm || !Array.isArray(dm.messages)) return 0;
    var count = 0;
    for (var i = 0; i < dm.messages.length; i++) {
        var m = dm.messages[i];
        if (!m) continue;
        if (m.from !== 'me' && m.read !== true) count++;
    }
    return count;
}

function getUnreadFotogramDmCount(vars) {
    var dms = getActiveFotogramDMs(vars);
    var unreadThreads = 0;
    for (var i = 0; i < dms.length; i++) {
        if (countUnreadFotogramDmMessages(dms[i]) > 0) unreadThreads++;
    }
    return unreadThreads;
}

function markFotogramDmAsRead(dm) {
    if (!dm || !Array.isArray(dm.messages)) return false;
    var changed = false;
    for (var i = 0; i < dm.messages.length; i++) {
        var m = dm.messages[i];
        if (!m) continue;
        if (m.from !== 'me' && m.read !== true) {
            m.read = true;
            changed = true;
        }
    }
    return changed;
}

function getFotogramDMById(vars, dmId) {
    return fdmGetDM(vars, dmId);
}


function blockFotogramDM(vars, dmId) {
    var dm = fdmGetDM(vars, dmId);
    if (!dm) return;
    dm.blocked = true;
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();
}

function deleteFotogramDM(vars, dmId) {
    if (!vars || !dmId) return false;
    var dms = Array.isArray(vars.phoneFotogramDMs) ? vars.phoneFotogramDMs : [];
    var before = dms.length;
    vars.phoneFotogramDMs = dms.filter(function(dm) { return !(dm && dm.id === dmId); });
    if (vars.phoneNotifications && Array.isArray(vars.phoneNotifications.fotogram)) {
        vars.phoneNotifications.fotogram = vars.phoneNotifications.fotogram.filter(function(n) {
            return !(n && n.type === 'dm' && n.refId === dmId);
        });
    }
    var changed = vars.phoneFotogramDMs.length !== before;
    if (!changed) return false;
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();
    return true;
}

function drainFotogramNotifications(vars) {
    if (!vars.phoneNotifications || !vars.phoneNotifications.fotogram) return;
    vars.phoneNotifications.fotogram = [];
    if (window.updatePhoneBadges) window.updatePhoneBadges();
}

function processFotogramDMReply(vars, dmId, replyKey) {
    var dm = getFotogramDMById(vars, dmId);
    if (!dm || dm.blocked) return;
    if (dm.interactive && dm.flowState) {
        if (replyKey && replyKey.indexOf('choice_') === 0) {
            var idx = parseInt(replyKey.replace('choice_', ''), 10);
            processFotogramChoice(vars, dmId, idx);
        } else if (replyKey && replyKey.indexOf('photo_') === 0) {
            var style = replyKey.replace('photo_', '');
            processFotogramPhoto(vars, dmId, style);
        } else if (replyKey === 'number_yes') {
            processFotogramNumber(vars, dmId, true);
        } else if (replyKey === 'number_no') {
            processFotogramNumber(vars, dmId, false);
        }
        return;
    }
    if (replyKey !== 'thanks_auto' || dm.simpleThanksSent === true) return;
    var pool = (typeof setup !== 'undefined' && Array.isArray(setup.fotogramDMEncouragingReplyMessages))
        ? setup.fotogramDMEncouragingReplyMessages : [];
    var text = pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
    if (!text) return;
    dm.messages = dm.messages || [];
    dm.messages.push({ from: 'me', text: text, time: fdmTime(vars), read: true });
    dm.simpleThanksSent = true;
    dm.availableReplyKeys = [];
    if (window.persistPhoneChanges) window.persistPhoneChanges();
    if (window.updatePhoneBadges) window.updatePhoneBadges();
}


/* ── RENDER FUNCTIONS ────────────────────────────────────────────────── */

function fdmEscape(s) {
    return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fdmGetVars() {
    if (typeof State !== 'undefined' && State.variables) return State.variables;
    if (typeof PhoneAPI !== 'undefined' && PhoneAPI.State && PhoneAPI.State.variables) return PhoneAPI.State.variables;
    return {};
}

function phoneRenderFotogramDmList() {
    var vars = fdmGetVars();
    var dms  = getActiveFotogramDMs(vars);
    var esc  = (typeof escapeHtmlFg === 'function') ? escapeHtmlFg : fdmEscape;
    var renderAvatar = (typeof renderFotogramAvatar === 'function') ? renderFotogramAvatar : function(name) {
        return '<span class="phone-fotogram-dm-avatar-fallback">' + esc(name.charAt(0)) + '</span>';
    };

    var html = '<div class="phone-fotogram-dm-list"><div class="phone-fotogram-dm-list-header"></div>';

    if (!dms.length) {
        html += '<div class="phone-app-placeholder">';
        html += '<p class="phone-app-placeholder-text">No DMs yet</p>';
        html += '<p class="phone-app-placeholder-sub">Keep posting!</p>';
        html += '</div>';
    } else {
        dms.forEach(function(dm) {
            var preview = '';
            if (dm.messages && dm.messages.length) {
                var last = dm.messages[dm.messages.length - 1];
                var t = String(last.text || '');
                if (last.attachment && last.attachment.path) t = '📷';
                preview = esc(t.slice(0, 40)) + (t.length > 40 ? '…' : '');
            }
            var unread = dm.messages ? dm.messages.some(function(m) { return m.from !== 'me' && !m.read; }) : false;
            html += '<div class="phone-fotogram-dm-row' + (unread ? ' unread' : '') + '" data-dm-id="' + esc(dm.id) + '">';
            html += '<div class="phone-fotogram-dm-row-avatar">' + renderAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-list') + '</div>';
            html += '<div class="phone-fotogram-dm-meta">';
            html += '<span class="phone-fotogram-dm-name">' + esc(dm.anonName || 'Unknown') + '</span>';
            html += '<span class="phone-fotogram-dm-preview">' + preview + '</span>';
            html += '</div>';
            if (unread) html += '<span class="phone-fotogram-dm-unread-dot" aria-hidden="true"></span>';
            html += '</div>';
        });
    }
    html += '</div>';
    return html;
}

function renderDmActionButtons(dm) {
    var esc = (typeof escapeHtmlFg === 'function') ? escapeHtmlFg : fdmEscape;
    var html = '';
    if (!dm || dm.blocked) return html;

    var blockText = (typeof getFotogramDmRuntimeText === 'function') ? getFotogramDmRuntimeText('blockButtonText') : 'Block';
    if (!blockText) blockText = 'Block';

    if (dm.interactive && dm.flowState && !dm.flowState.ended) {
        var vars = fdmGetVars();
        var state = dm.flowState;

        if (state.awaitingPhoto) {
            /* Photo submenu */
            var photoOpts = fdmPhotoOptions(vars);
            var photoLabels = { normal:'normal', sexy:'sexy', nude:'nude', ass:'ass', boobs:'boobs', pussy:'pussy', hayir:'no' };
            photoOpts.forEach(function(opt) {
                var label = photoLabels[opt.style] || opt.style;
                var disabled = (opt.enabled === false) ? ' disabled' : '';
                html += '<button type="button" class="phone-fotogram-dm-quick photo-btn' + (opt.enabled === false ? ' gated' : '') + '"' + disabled +
                    ' data-action="photo" data-dm-id="' + esc(dm.id) + '" data-style="' + esc(opt.style) + '">' + label + '</button>';
            });
        } else if (state.numberAsked) {
            /* Number request */
            var numAllowed = fdmNumberAllowed(vars);
            html += '<button type="button" class="phone-fotogram-dm-quick number-btn' + (numAllowed ? '' : ' gated') + '"' + (numAllowed ? '' : ' disabled') +
                ' data-action="number" data-dm-id="' + esc(dm.id) + '" data-give="true">give</button>';
            html += '<button type="button" class="phone-fotogram-dm-quick" data-action="number" data-dm-id="' + esc(dm.id) + '" data-give="false">no</button>';
        } else {
            /* v2: Use cached choices — fdmResolveChoices returns cached if available */
            var choices = fdmResolveChoices(state);
            choices.forEach(function(c, i) {
                html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + esc(dm.id) + '" data-reply-key="choice_' + i + '">' + esc(c.text) + '</button>';
            });
        }
    } else if (!dm.interactive) {
        /* Simple non-interactive */
        var quickText = (typeof getFotogramDmRuntimeText === 'function') ? getFotogramDmRuntimeText('quickReplyButtonText') : 'Reply';
        if (!quickText) quickText = 'Reply';
        if (dm.simpleThanksSent !== true) {
            html += '<button type="button" class="phone-fotogram-dm-quick" data-action="reply" data-dm-id="' + esc(dm.id) + '" data-reply-key="thanks_auto">' + esc(quickText) + '</button>';
        }
    }

    html += '<button type="button" class="phone-fotogram-dm-quick block-btn" data-action="block" data-dm-id="' + esc(dm.id) + '">' + esc(blockText) + '</button>';
    return html;
}

function phoneRenderFotogramDmThread(dmId) {
    var vars = fdmGetVars();
    var dm   = getFotogramDMById(vars, dmId);
    var esc  = (typeof escapeHtmlFg === 'function') ? escapeHtmlFg : fdmEscape;
    var renderAvatar = (typeof renderFotogramAvatar === 'function') ? renderFotogramAvatar : function(name) {
        return '<span class="phone-fotogram-dm-avatar-fallback">' + esc(name.charAt(0)) + '</span>';
    };
    var getMediaKind = (typeof getMediaKindFromPath === 'function') ? getMediaKindFromPath : function(p) {
        return /\.mp4$|\.webm$|\.mov$/i.test(p) ? 'video' : 'photo';
    };
    var likelyMedia = (typeof isLikelyMediaPath === 'function') ? isLikelyMediaPath : function(t) {
        return /\.(webp|jpg|jpeg|png|gif|mp4|webm)$/i.test(String(t || ''));
    };
    var getAsset = (typeof getAssetUrl === 'function') ? getAssetUrl : function(p) { return p; };

    if (!dm) return phoneRenderFotogramDmList();

    var readChanged = markFotogramDmAsRead(dm);
    if (readChanged) {
        if (window.persistPhoneChanges) window.persistPhoneChanges();
        if (window.updatePhoneBadges) window.updatePhoneBadges();
    }

    var infoGender  = normalizeGenderLabel(dm.profileGender);
    var infoAge     = Number(dm.profileAge);
    var infoAgeText = (Number.isFinite(infoAge) && infoAge >= 18 && infoAge <= 99) ? infoAge : 'Unknown';
    var modeLabel   = dm.interactive ? 'Interactive' : 'Simple';
    var infoText    = 'Gender: ' + infoGender + '\nAge: ' + infoAgeText + '\nMode: ' + modeLabel;

    var html = '<div class="phone-fotogram-dm-thread">' +
        '<div class="phone-fotogram-dm-thread-header">' +
        renderAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-thread') +
        '<span class="phone-fotogram-dm-thread-name">' + esc(dm.anonName || 'Unknown') + '</span>' +
        '<button type="button" class="phone-fotogram-dm-thread-info" data-tooltip="' + esc(infoText) + '" aria-label="Profile info"><span class="icon icon-info icon-16"></span></button>' +
        '<button type="button" class="phone-fotogram-dm-thread-delete" data-dm-id="' + esc(dm.id) + '" aria-label="Delete DM"><span class="icon icon-delete icon-16"></span></button>' +
        '</div><div class="phone-fotogram-dm-messages">';

    (dm.messages || []).forEach(function(m) {
        var isMe   = m.from === 'me';
        var bubble = '<div class="phone-fotogram-dm-message' + (isMe ? ' me' : '') + '">';
        if (!isMe) bubble += renderAvatar(dm.anonName || 'Unknown', dm.skinTone, 'dm-msg');
        bubble += '<div class="phone-fotogram-dm-bubble' + (isMe ? ' me' : '') + '">';

        if (m.attachment && m.attachment.path) {
            var src     = getAsset(m.attachment.path);
            var attKind = m.attachment.kind || getMediaKind(m.attachment.path);
            if (attKind === 'video') {
                bubble += '<div class="phone-fotogram-dm-attachment"><video src="' + esc(src) + '" controls playsinline preload="metadata"></video></div>';
            } else {
                bubble += '<div class="phone-fotogram-dm-attachment"><img src="' + esc(src) + '" alt="" loading="lazy"></div>';
            }
        } else if (likelyMedia(m.text)) {
            var autoSrc  = getAsset(m.text);
            var autoKind = getMediaKind(m.text);
            if (autoKind === 'video') {
                bubble += '<div class="phone-fotogram-dm-attachment"><video src="' + esc(autoSrc) + '" controls playsinline preload="metadata"></video></div>';
            } else {
                bubble += '<div class="phone-fotogram-dm-attachment"><img src="' + esc(autoSrc) + '" alt="" loading="lazy"></div>';
            }
        }

        bubble += '<span class="phone-fotogram-dm-bubble-text">' + esc(likelyMedia(m.text) ? '' : (m.text || '')) + '</span></div></div>';
        html += bubble;
    });

    html += '</div><div class="phone-fotogram-dm-actions">';
    html += renderDmActionButtons(dm);
    html += '</div></div>';
    return html;
}

/* ── EXPORTS ─────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
    window.createFotogramInteractiveDM  = createFotogramInteractiveDM;
    window.bootstrapFotogramDM          = bootstrapFotogramDM;
    window.getFotogramChoices            = getFotogramChoices;
    window.processFotogramChoice         = processFotogramChoice;
    window.processFotogramPhoto          = processFotogramPhoto;
    window.processFotogramNumber         = processFotogramNumber;
    window.processFotogramDMReply        = processFotogramDMReply;
    window.getActiveFotogramDMs          = getActiveFotogramDMs;
    window.getUnreadFotogramDmCount      = getUnreadFotogramDmCount;
    window.countUnreadFotogramDmMessages = countUnreadFotogramDmMessages;
    window.getFotogramDMById             = getFotogramDMById;
    window.blockFotogramDM               = blockFotogramDM;
    window.deleteFotogramDM              = deleteFotogramDM;
    window.drainFotogramNotifications    = drainFotogramNotifications;
    window.createFotogramDM              = createFotogramDM;
    window.canUseSwapInFotogramDm        = canUseSwapInFotogramDm;
    window.getFotogramDmThreadModeForPost = getFotogramDmThreadModeForPost;
    window.phoneRenderFotogramDmList     = phoneRenderFotogramDmList;
    window.phoneRenderFotogramDmThread   = phoneRenderFotogramDmThread;
    window.renderDmActionButtons         = renderDmActionButtons;
    window.markFotogramDmThreadAsRead    = function(vars, dmId) {
        var dm = fdmGetDM(vars, dmId);
        if (!dm) return false;
        var changed = markFotogramDmAsRead(dm);
        if (changed) {
            if (window.persistPhoneChanges) window.persistPhoneChanges();
            if (window.updatePhoneBadges) window.updatePhoneBadges();
        }
        return changed;
    };
}