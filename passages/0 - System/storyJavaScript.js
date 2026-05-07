(function () {
    if (typeof Macro === 'undefined' || typeof TempState === 'undefined') {
        return;
    }

    var widgetMacro = Macro.get('widget');
    if (widgetMacro && !widgetMacro.__pjxEarlyExitPatched) {
        var originalWidgetHandler = widgetMacro.handler;

        widgetMacro.handler = function () {
            if (!this.args || this.args.length === 0) {
                return originalWidgetHandler.apply(this, arguments);
            }
            var widgetName = this.args[0];
            var result = originalWidgetHandler.apply(this, arguments);

            var created = Macro.get(widgetName);
            if (created && created.isWidget && !created.__pjxEarlyExitWrapped) {
                var innerHandler = created.handler;
                created.handler = function () {
                    var stack = TempState._pjxWidgetStack = TempState._pjxWidgetStack || [];
                    var entry = { exited: false };
                    stack.push(entry);
                    try {
                        return innerHandler.apply(this, arguments);
                    } finally {
                        stack.pop();
                        /* Consume our custom break signal so it doesn't leak into
                           the caller's Wikifier. Only clear value 3 (our marker);
                           1 and 2 belong to <<continue>>/<<break>>. */
                        if (entry.exited && TempState.break === 3) {
                            TempState.break = null;
                        }
                    }
                };
                created.__pjxEarlyExitWrapped = true;
            }
            return result;
        };
        widgetMacro.__pjxEarlyExitPatched = true;
    }

    var returnMacro = Macro.get('return');
    if (returnMacro && !returnMacro.__pjxEarlyExitPatched) {
        var originalReturnHandler = returnMacro.handler;

        returnMacro.handler = function () {
            /* Only intercept bare <<return>> (no args) named "return" (not "back")
               that is being evaluated inside a widget body. */
            if (this.name === 'return' && (!this.args || this.args.length === 0)) {
                var stack = TempState._pjxWidgetStack;
                if (stack && stack.length) {
                    var inWidget = typeof this.contextSome === 'function'
                        ? this.contextSome(function (ctx) { return ctx.self && ctx.self.isWidget; })
                        : true;
                    if (inWidget) {
                        stack[stack.length - 1].exited = true;
                        /* Non-null signal halts the current Wikifier loop; we use
                           a custom value so <<for>> loops won't consume it. */
                        TempState.break = 3;
                        return;
                    }
                }
            }
            return originalReturnHandler.apply(this, arguments);
        };
        returnMacro.__pjxEarlyExitPatched = true;
    }
})();

/* ================== External Loader =================== */
$(document).one(':storyready', async function () {
    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`link[href="${url}"]`)) {
                return resolve();
            }
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
            document.head.appendChild(link);
        });
    }

    function loadJS(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                return resolve();
            }
            const script = document.createElement("script");
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
            document.head.appendChild(script);
        });
    }

    function getInitFunctionName(moduleName) {
        if (moduleName === 'phone/index') return 'PhoneInit';
        return moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Init';
    }

    const API = {
        State: State,
        Engine: Engine,
        Window: Window,
        Dialog: Dialog,
        Save: Save,
        Config: Config,
        $: $,
        setup: setup,
        Macro: Macro,
        Story: Story,
        Wikifier: Wikifier
    };

    try {
        await loadJS("assets/system/config.js");
        const cssBase = "assets/system/css/";

        for (const module of window.SystemCSS.base) {
            try { await loadCSS(`${cssBase}base/${module}.css`); } catch (e) { }
        }
        for (const module of window.SystemCSS.layout) {
            try { await loadCSS(`${cssBase}layout/${module}.css`); } catch (e) { }
        }
        for (const module of window.SystemCSS.ui) {
            try { await loadCSS(`${cssBase}ui/${module}.css`); } catch (e) { }
        }
        for (const module of window.SystemCSS.screens) {
            try { await loadCSS(`${cssBase}screens/${module}.css`); } catch (e) { }
        }
        for (const module of window.SystemCSS.systems) {
            try { await loadCSS(`${cssBase}systems/${module}.css`); } catch (e) { }
        }
        for (const module of window.SystemCSS.utils) {
            try { await loadCSS(`${cssBase}utils/${module}.css`); } catch (e) { }
        }
        const allModules = [];
        for (const module of window.SystemModules.utils) {
            await loadJS(`assets/system/js/utils/${module}.js`);
            allModules.push(module);
        }
        for (const module of window.SystemModules.ui) {
            await loadJS(`assets/system/js/ui/${module}.js`);
            allModules.push(module);
        }
        for (const module of window.SystemModules.modal) {
            await loadJS(`assets/system/js/modal/${module}.js`);
            allModules.push(module);
        }
        for (const module of window.SystemModules.system) {
            await loadJS(`assets/system/js/system/${module}.js`);
            allModules.push(module);
        }
        allModules.forEach(moduleName => {
            const initFn = getInitFunctionName(moduleName);
            if (window[initFn]) {
                window[initFn](API);
            }
        });
        if (typeof window.syncNavCardMotionClass === 'function') {
            window.syncNavCardMotionClass();
        }
        if (typeof window.syncNavCardLayoutClass === 'function') {
            window.syncNavCardLayoutClass();
        }
        if (typeof Engine !== 'undefined' && typeof Engine.show === 'function') {
            setTimeout(() => Engine.show(), 50);
        }
        $(document).trigger(':passagerender');
        if (typeof UIBar !== 'undefined') UIBar.destroy();
        $('#ui-bar').remove();
        $(document.head).find('#style-ui-bar').remove();

    } catch (error) {
        /* loader failed */
    }
});

/* ================== Nav cards (<<navMenu>> / <<navCard>>) — Display setting =================== */
window.navCardAnimationsEnabled = function () {
    try {
        var vs = typeof State !== 'undefined' && State.variables && State.variables.videoSettings;
        if (vs && vs.navCardLayout === 'vertical') return false;
        var raw = vs && vs.navCardAnimations;
        if (raw === false || raw === 'false' || raw === 0) return false;
        return true;
    } catch (e) {
        return true;
    }
};

window.navCardLayoutMode = function () {
    try {
        var vs = typeof State !== 'undefined' && State.variables && State.variables.videoSettings;
        return vs && vs.navCardLayout === 'vertical' ? 'vertical' : 'horizontal';
    } catch (e) {
        return 'horizontal';
    }
};

window.syncNavCardLayoutClass = function () {
    try {
        var mode = window.navCardLayoutMode();
        var isVertical = mode === 'vertical';
        if (document.body) {
            document.body.classList.toggle('nav-layout-vertical', isVertical);
            document.body.classList.toggle('nav-layout-horizontal', !isVertical);
        }
        if (document.documentElement) {
            document.documentElement.classList.toggle('nav-layout-vertical', isVertical);
            document.documentElement.classList.toggle('nav-layout-horizontal', !isVertical);
        }
        var accordions = document.querySelectorAll('.accordion-container.nav-breakout');
        for (var i = 0; i < accordions.length; i++) {
            accordions[i].classList.toggle('nav-layout-vertical', isVertical);
            accordions[i].classList.toggle('nav-layout-horizontal', !isVertical);
        }
    } catch (e) { /* ignore */ }
};

/* ================== Save Version Registry =================== */
setup.CURRENT_SAVE_VERSION = 1;

setup.saveVersions = [];

setup.getSaveVersionLabel = function (v) {
    if (v === 0) return '0.1';
    for (var i = 0; i < setup.saveVersions.length; i++) {
        if (setup.saveVersions[i].version === v && setup.saveVersions[i].versionLabel) {
            return setup.saveVersions[i].versionLabel;
        }
    }
    return '0.' + (v + 1);
};

/* ================== Save Version Migration =================== */
window.runSaveVersion = function () {
    try {
        var V = State.variables;

        if (V.saveVersion == null) {
            V.saveVersion = 0;
        }

        var target = setup.CURRENT_SAVE_VERSION;

        if (V.saveVersion >= target) {
            return { migrated: false, from: V.saveVersion, to: V.saveVersion };
        }

        var startVersion = V.saveVersion;
        var results = [];

        for (var v = startVersion + 1; v <= target; v++) {
            var passageName = 'SaveMigration_v' + v;
            var el = document.querySelector('tw-passagedata[name="' + passageName + '"]');

            if (!el) {
                results.push({ version: v, status: 'missing' });
                break;
            }

            try {
                var content = el.textContent;
                if (content && content.trim()) {
                    var frag = document.createElement('div');
                    new Wikifier(frag, content);
                    var errs = frag.querySelectorAll('.error');
                    if (errs.length > 0) {
                        results.push({ version: v, status: 'error', message: errs[0].textContent });
                        break;
                    }
                }
                V.saveVersion = v;
                results.push({ version: v, status: 'ok' });
            } catch (e) {
                results.push({ version: v, status: 'error', message: e.message || String(e) });
                break;
            }
        }

        var logEntry = {
            from: startVersion,
            to: V.saveVersion,
            date: new Date().toISOString(),
            results: results
        };

        if (!Array.isArray(V.migrationLog)) {
            V.migrationLog = [];
        }
        V.migrationLog.push(logEntry);

        return {
            migrated: true,
            from: startVersion,
            to: V.saveVersion,
            target: target,
            results: results,
            hasErrors: results.some(function (r) { return r.status !== 'ok'; })
        };
    } catch (e) {
        return { migrated: false, error: e.message || String(e) };
    }
};

window.runSaveVersionInits = window.runSaveVersion;

/* ================== Character prop helper (NPC static from setup.characterDefs, core from $characters) =================== */
/** Returns merged character object (static from setup.characterDefs + state from $characters) for UI/JS. */
setup.getCharacter = function (id) {
    if (!id) return null;
    const def = setup.characterDefs && setup.characterDefs[id];
    const state = State.variables.characters && State.variables.characters[id];
    if (!def && !state) return null;
    return Object.assign({}, def || {}, state || {});
};

/* ================== Character relationship (setup.characterDefs[].relationship or $characters[].relationship) =================== */
/** Returns relationship object for a character: { status, partnerLabel?, hasChildren? }. status: "single" | "dating" | "serious" | "married" | "divorced". Reads from defs or from $characters (e.g. family). */
setup.getCharacterRelationship = function (charId) {
    const def = setup.characterDefs && setup.characterDefs[charId];
    const state = State.variables.characters && State.variables.characters[charId];
    if (def && def.relationship) return def.relationship;
    if (state && state.relationship) return state.relationship;
    return {};
};

/** True if character has the given relationship status. */
setup.hasRelationshipStatus = function (charId, status) {
    const rel = setup.getCharacterRelationship(charId);
    return rel.status === status;
};

/** Short label for UI/dialogue: "Married", "Single", "Has a girlfriend", "Divorced", etc. */
setup.relationshipLabel = function (charId) {
    const rel = setup.getCharacterRelationship(charId);
    if (!rel || !rel.status) return "Single";
    var s = rel.status;
    if (s === "married") return "Married";
    if (s === "divorced") return "Divorced";
    if (s === "single") return "Single";
    if (s === "serious" && rel.partnerLabel) return "Has a " + rel.partnerLabel;
    if (s === "dating" && rel.partnerLabel) return "Has a " + rel.partnerLabel;
    if (s === "serious") return "In a serious relationship";
    if (s === "dating") return "Dating";
    return "Single";
};

/* ================== Phone badge (derived – phone_system_data_and_technical.md §9) =================== */
/** Unread message count; computed from $phoneConversations. */
window.phoneUnreadCount = function () {
    if (!State || !State.variables || !State.variables.phoneConversations) return 0;
    const conv = State.variables.phoneConversations;
    let n = 0;
    Object.keys(conv).forEach(function (charId) {
        (conv[charId] || []).forEach(function (m) {
            if (m.from !== 'player' && m.read === false) n++;
        });
    });
    return n;
};

/** Unread Fotogram DM thread count (comments excluded from badge logic). */
window.phoneUnreadFotogramDmThreads = function (varsArg) {
    var v = varsArg || (State && State.variables ? State.variables : null);
    if (!v || !Array.isArray(v.phoneFotogramDMs)) return 0;
    var dms = v.phoneFotogramDMs;
    var unreadThreads = 0;
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
        if (hasUnread) unreadThreads++;
    }
    return unreadThreads;
};
/** Stats used for phone topics (must match topic-system.js). */
var PHONE_TOPIC_STAT_KEYS = ["friendship", "love", "lust"];

/** Check if a phone message topic is unlocked (friendship/love/lust tier + requiredStats, plus legacy requirements). */
window.phoneTopicUnlocked = function (charId, topic, vars) {
    if (!topic) return false;
    var char = vars && vars.characters && vars.characters[charId];
    if (!char || !char.stats) return false;

    /* Category + tier: character stat for this topic's category must be >= topic.tier */
    if (topic.category && PHONE_TOPIC_STAT_KEYS.indexOf(topic.category) !== -1) {
        var statVal = char.stats[topic.category] != null ? Number(char.stats[topic.category]) : 0;
        var tier = topic.tier != null ? Number(topic.tier) : 0;
        if (statVal < tier) return false;
    }

    /* requiredStats: each listed stat must meet the minimum */
    if (topic.requiredStats && typeof topic.requiredStats === "object") {
        for (var key in topic.requiredStats) {
            if (!Object.prototype.hasOwnProperty.call(topic.requiredStats, key)) continue;
            if (PHONE_TOPIC_STAT_KEYS.indexOf(key) === -1) continue;
            var need = Number(topic.requiredStats[key]);
            var have = char.stats[key] != null ? Number(char.stats[key]) : 0;
            if (have < need) return false;
        }
    }

    /* Legacy: topic.requirements.flag and topic.requirements.minLove */
    var req = topic.requirements;
    if (req && typeof req === "object") {
        if (req.flag && !(vars.flags && vars.flags[req.flag])) return false;
        if (req.minLove != null && (char.stats.love || 0) < req.minLove) return false;
    }
    return true;
};


/** Return array of unlocked topics for a character. Data only from setup.phoneMessageTopics set in variablesPhoneTopics.twee (passage source). */
window.phoneGetUnlockedTopics = function (charId, vars) {
    var storySetup = (typeof setup !== 'undefined') ? setup : (window.setup || {});
    if (!storySetup.phoneMessageTopics) storySetup.phoneMessageTopics = {};
    var topics = storySetup.phoneMessageTopics[charId] || [];
    return topics.filter(function (t) { return window.phoneTopicUnlocked(charId, t, vars); });
};

/** Location display name from setup.navCards (variablesNavigation.twee). Used by phone "Where are you?" reply. */
window.getLocationName = function (locId) {
    if (!locId) return 'home';
    var s = (typeof setup !== 'undefined' && setup.navCards) ? setup : (window.setup || {});
    var card = s.navCards && s.navCards[locId];
    return (card && card.name) ? card.name : locId;
};

/** Global discovery key helper - standardized pattern: "discovered" + CapitalizedLocationId */
window.getDiscoveryKey = function (locationId) {
    if (!locationId) return null;
    return 'discovered' + locationId.charAt(0).toUpperCase() + locationId.slice(1);
};


/** Notification stub for phone events (future: toast notifications) */
window.notifyPhone = function (message) {
    // TODO: Implement toast notification system
    void message;
};


/** Total phone badge (Messages + Fotogram + Finder). */
window.phoneTotalBadge = function () {
    if (!State || !State.variables) return 0;
    const v = State.variables;
    const messages = window.phoneUnreadCount ? window.phoneUnreadCount() : 0;
    const fotogram = window.phoneUnreadFotogramDmThreads ? window.phoneUnreadFotogramDmThreads(v) : 0;
    const finder = (v.phoneNotifications && v.phoneNotifications.finder && v.phoneNotifications.finder.length) ? v.phoneNotifications.finder.length : 0;
    return messages + fotogram + finder;
};

function normalizeQuestScenePassageTitle(passageTitle) {
    if (passageTitle != null && passageTitle !== '') return String(passageTitle);
    if (typeof State !== 'undefined' && State && State.passage) return String(State.passage);
    return '';
}

function getQuestSceneStageId(vars, questId) {
    const questState = vars && vars.questState && vars.questState.active && vars.questState.active[questId];
    const questDef = setup && setup.quests && setup.quests[questId];
    if (!questState || !questDef || !Array.isArray(questDef.stages)) return null;
    const stage = questDef.stages[questState.stage];
    return stage && stage.id ? stage.id : null;
}

function legacyQuestSceneDetection(passageTitle) {
    const t = normalizeQuestScenePassageTitle(passageTitle);
    if (!t) return false;
    if (t.startsWith('quest_')) return true;
    if (/^fhBedroom_event_/.test(t)) return true;
    if (/^fhParentsRoom_event_/.test(t)) return true;
    if (/^fhLivingRoom_event_/.test(t)) return true;
    if (t === 'dinerWork_event_nightThoughts' || /^dinerWork_event_diana/.test(t)) return true;
    try {
        if (typeof tags === 'function') {
            const tagList = tags(t);
            if (Array.isArray(tagList) && (tagList.includes('quest-scene') || tagList.includes('quest_scene'))) return true;
        }
    } catch (e1) { /* ignore */ }
    try {
        const StoryRef = typeof Story !== 'undefined' ? Story : (typeof SugarCube !== 'undefined' ? SugarCube.Story : null);
        if (StoryRef && typeof StoryRef.has === 'function' && StoryRef.has(t)) {
            const p = StoryRef.get(t);
            if (p && Array.isArray(p.tags) && (p.tags.includes('quest-scene') || p.tags.includes('quest_scene'))) return true;
        }
    } catch (e2) { /* ignore */ }
    return false;
}

window.QuestSceneNav = (function () {
    const suppressState = {
        hubPassage: null
    };

    const sceneRegistry = {
        fhBedroom_event_mallAftermath: {
            sceneId: 'sd_after_mall',
            hubPassage: 'fhBedroom',
            backTarget: 'fhUpperstairs',
            skipHubOnBack: true
        },
        dinerWork_event_nightThoughts: {
            sceneId: 'diana_night_thoughts',
            hubPassage: 'fhBedroom',
            backTarget: 'fhUpperstairs',
            skipHubOnBack: true
        },
        quest_vince_day3_family_reflection: {
            sceneId: 'vince_day3_family_reflection',
            hubPassage: 'fhBedroom',
            backTarget: 'fhUpperstairs',
            skipHubOnBack: true
        },
        fhBedroom_event_beautyThoughts: {
            sceneId: 'sd_beauty_thoughts',
            hubPassage: 'fhBedroom',
            backTarget: 'fhUpperstairs',
            skipHubOnBack: true
        },
        fhParentsRoom_event_motherTalk: {
            sceneId: 'sd_talk_mom',
            hubPassage: 'fhParentsRoom',
            backTarget: 'fhDownstairs',
            skipHubOnBack: true
        },
        fhUpperstairs_event_walletChance: {
            sceneId: 'sd_wallet_chance',
            hubPassage: 'fhUpperstairs',
            backTarget: 'fhBedroom',
            skipHubOnBack: true
        },
        brotherComputer_beautySearch: {
            sceneId: 'sd_beauty_search',
            hubPassage: 'fhBrotherRoom',
            backTarget: 'fhBrotherRoom'
        },
        fhLivingRoom_event_askDadMoney: {
            sceneId: 'sd_ask_dad',
            hubPassage: 'fhLivingroom',
            backTarget: 'fhLivingroom'
        },
        fhLivingRoom_event_stealDad: {
            sceneId: 'sd_steal_dad',
            hubPassage: 'fhLivingroom',
            backTarget: 'fhLivingroom'
        },
        fhLivingRoom_event_closeWallet: {
            sceneId: 'sd_close_wallet',
            hubPassage: 'fhLivingroom',
            backTarget: 'fhLivingroom'
        },
        dinerWork_event_dianaArrival: {
            sceneId: 'diana_arrival',
            hubPassage: 'dinerRubys',
            backTarget: 'dinerRubys'
        },
        dinerWork_event_dianaKitchen: {
            sceneId: 'diana_kitchen',
            hubPassage: 'dinerRubys',
            backTarget: 'dinerRubys'
        },
        mall_event_beautyVisit: {
            sceneId: 'sd_mall_visit',
            hubPassage: 'mall',
            backTarget: 'mall'
        },
        mall_event_beautyVisit_window: {
            sceneId: 'sd_mall_window',
            hubPassage: 'mall',
            backTarget: 'mall'
        },
        mall_event_beautyVisit_luxuryStore: {
            sceneId: 'sd_mall_store',
            hubPassage: 'mall',
            backTarget: 'mall'
        },
        mall_event_beautyVisit_clerk: {
            sceneId: 'sd_mall_clerk',
            hubPassage: 'mall',
            backTarget: 'mall'
        }
    };

    const hubResolvers = {
        fhBedroom(vars) {
            if (getQuestSceneStageId(vars, 'something_different') === 'after_mall') {
                return { passage: 'fhBedroom_event_mallAftermath' };
            }
            if (!!(vars.flags && vars.flags.dianaEventShown) && !(vars.flags && vars.flags.dianaThoughtsShown)) {
                return { passage: 'dinerWork_event_nightThoughts' };
            }
            if (
                getQuestSceneStageId(vars, 'vince_day3_family') === 'bedroom_alone' &&
                !(vars.flags && vars.flags.vinceDay3FamilyBedroomDone)
            ) {
                return { passage: 'quest_vince_day3_family_reflection' };
            }
            if (getQuestSceneStageId(vars, 'something_different') === 'mirror_moment') {
                return { passage: 'fhBedroom_event_beautyThoughts' };
            }
            return null;
        },
        fhUpperstairs(vars) {
            if (
                getQuestSceneStageId(vars, 'something_different') === 'find_money' &&
                vars.timeSys && vars.timeSys.hour >= 23 && vars.timeSys.hour < 24
            ) {
                return { passage: 'fhUpperstairs_event_walletChance' };
            }
            return null;
        },
        fhParentsRoom(vars) {
            const stageId = getQuestSceneStageId(vars, 'something_different');
            const questState = vars.questState && vars.questState.active && vars.questState.active.something_different;
            const mother = vars.characters && vars.characters.mother;
            if (
                stageId === 'talk_mom' &&
                mother && mother.currentLocation === 'fhParentsRoom' &&
                vars.timeSys && vars.timeSys.hour >= 23 && vars.timeSys.hour < 24 &&
                questState && questState.triggeredStage !== questState.stage
            ) {
                return {
                    passage: 'fhParentsRoom_event_motherTalk',
                    beforeEnter(currentVars) {
                        if (currentVars.questState && currentVars.questState.active && currentVars.questState.active.something_different) {
                            currentVars.questState.active.something_different.triggeredStage =
                                currentVars.questState.active.something_different.stage;
                        }
                    }
                };
            }
            return null;
        }
    };

    function getState(state) {
        if (state) return state;
        if (typeof State !== 'undefined' && State) return State;
        return null;
    }

    function getSceneMeta(passageTitle) {
        const t = normalizeQuestScenePassageTitle(passageTitle);
        return t ? (sceneRegistry[t] || null) : null;
    }

    function getFallbackBackTarget(location) {
        const loc = location != null ? String(location) : '';
        if (loc === 'fhBedroom') return 'fhUpperstairs';
        if (loc === 'fhParentsRoom') return 'fhDownstairs';
        if (loc === 'dinerRubys') return 'dinerRubys';
        if (loc === 'mall') return 'mall';
        if (loc === 'fhUpperstairs') return 'fhBedroom';
        if (loc === 'fhLivingroom') return 'fhLivingroom';
        if (loc === 'fhDownstairs') return 'fhDownstairs';
        if (loc === 'fhBrotherRoomPC') return 'fhBrotherRoom';
        return null;
    }

    function getCurrentIndex(state) {
        return state.activeIndex ?? state.index ?? 0;
    }

    function getPreviousTitle(state, idx) {
        if (!(idx > 0) || !state.history) return '';
        const prev = state.history[idx - 1];
        return normalizeQuestScenePassageTitle(prev && (prev.title ?? prev.passage));
    }

    function getHistoryTitle(state, idx) {
        if (!(idx >= 0) || !state.history) return '';
        const item = state.history[idx];
        return normalizeQuestScenePassageTitle(item && (item.title ?? item.passage));
    }

    function setSuppressHubAutoScene(hubPassage) {
        suppressState.hubPassage = hubPassage || null;
    }

    function consumeSuppressHubAutoScene(hubPassage) {
        if (!hubPassage || suppressState.hubPassage !== hubPassage) return false;
        suppressState.hubPassage = null;
        return true;
    }

    function getEngine(engine) {
        if (engine) return engine;
        if (typeof Engine !== 'undefined' && Engine) return Engine;
        if (typeof SugarCube !== 'undefined' && SugarCube.Engine) return SugarCube.Engine;
        return null;
    }

    function isScenePassage(passageTitle) {
        return !!getSceneMeta(passageTitle) || legacyQuestSceneDetection(passageTitle);
    }

    function getBackTarget(passageTitle, location) {
        const meta = getSceneMeta(passageTitle);
        if (meta && meta.backTarget) return meta.backTarget;
        return getFallbackBackTarget(location);
    }

    function isTimeBackEnabled(state) {
        const St = getState(state);
        if (!St) return false;
        const idx = getCurrentIndex(St);
        const previousTitle = getPreviousTitle(St, idx);
        const canBackToStart = idx > 0 && previousTitle !== 'Start';
        if (canBackToStart) return true;
        const backTarget = getBackTarget(St.passage, St.variables && St.variables.location);
        return !!(isScenePassage(St.passage) && backTarget && (idx === 0 || previousTitle === 'Start'));
    }

    function backFromCurrentScene(state, engine) {
        const St = getState(state);
        const Eng = getEngine(engine);
        if (!St || !Eng || typeof Eng.backward !== 'function') return false;

        const meta = getSceneMeta(St.passage);
        if (!meta || !meta.backTarget) return false;

        const idx = getCurrentIndex(St);
        const previousTitle = getPreviousTitle(St, idx);

        if (idx === 0 || previousTitle === 'Start') {
            window.__navigatingBackwardFromUI = true;
            if (typeof Eng.play === 'function') Eng.play(meta.backTarget);
            return true;
        }

        if (
            meta.skipHubOnBack &&
            previousTitle === meta.hubPassage &&
            idx >= 2 &&
            getHistoryTitle(St, idx - 2) === meta.backTarget
        ) {
            window.__navigatingBackwardFromUI = true;
            setSuppressHubAutoScene(meta.hubPassage);
            Eng.backward();
            Eng.backward();
            return true;
        }

        if (meta.skipHubOnBack && previousTitle === meta.hubPassage) {
            window.__navigatingBackwardFromUI = true;
            setSuppressHubAutoScene(meta.hubPassage);
            Eng.backward();
            if (typeof Eng.play === 'function') {
                setTimeout(function () {
                    const currentEngine = getEngine();
                    if (currentEngine && typeof currentEngine.play === 'function') {
                        currentEngine.play(meta.backTarget);
                    }
                }, 0);
            }
            return true;
        }

        return false;
    }

    function resolveHubAutoScene(hubPassage, vars) {
        const resolver = hubResolvers[hubPassage];
        if (typeof resolver !== 'function') return null;
        return resolver(vars || {}) || null;
    }

    function scheduleHubAutoScene(hubPassage) {
        setTimeout(function () {
            const St = getState();
            if (!St || St.passage !== hubPassage) return;
            if (St.variables && St.variables._navigatingBackward) return;
            if (consumeSuppressHubAutoScene(hubPassage)) return;

            const resolved = resolveHubAutoScene(hubPassage, St.variables || {});
            if (!resolved || !resolved.passage) return;
            if (typeof resolved.beforeEnter === 'function') {
                resolved.beforeEnter(St.variables || {});
            }

            const Eng = getEngine();
            if (Eng && typeof Eng.play === 'function') {
                Eng.play(resolved.passage);
            }
        }, 0);
    }

    return {
        getSceneMeta,
        isScenePassage,
        getBackTarget,
        isTimeBackEnabled,
        backFromCurrentScene,
        resolveHubAutoScene,
        scheduleHubAutoScene,
        setSuppressHubAutoScene,
        consumeSuppressHubAutoScene
    };
}());

/**
 * Quest / cinematic scene detection: registry first, then legacy tag/name fallback.
 * Used for hide-nav, navMenu skip, pending quest prompts injection, topbar back shortcut.
 */
window.isQuestScenePassage = function (passageTitle) {
    if (window.QuestSceneNav && typeof window.QuestSceneNav.isScenePassage === 'function') {
        return window.QuestSceneNav.isScenePassage(passageTitle);
    }
    return legacyQuestSceneDetection(passageTitle);
};

/**
 * Back target for quest scenes and related cinematic locations.
 * Kept as compatibility wrapper while callers migrate to QuestSceneNav directly.
 */
window.getQuestSceneHubPassage = function (passageTitle, location) {
    if (window.QuestSceneNav && typeof window.QuestSceneNav.getBackTarget === 'function') {
        return window.QuestSceneNav.getBackTarget(passageTitle, location);
    }
    return getFallbackBackTarget(location);
};

/* ================== Fullscreen Layout Detection =================== */
$(document).on(':passagerender', function () {
    const vars = State.variables;
    const topbarHidden = vars.hideTopbar === true ||
        (vars.hideTopbarNav === true && vars.hideTopbarTimebox === true && vars.hideTopbarNotifications === true);
    const rightbarHidden = vars.hideRightbar === true;
    if (topbarHidden && rightbarHidden) {
        $('body').addClass('fullscreen-layout');
    } else {
        $('body').removeClass('fullscreen-layout');
    }
    if (window.isQuestScenePassage(State.passage) || tags().includes('hide-nav')) {
        $('body').addClass('hide-nav');
    } else {
        $('body').removeClass('hide-nav');
    }
    if (!window.isQuestScenePassage(State.passage) && State.variables.pendingQuestPrompts?.length > 0) {
        const $passage = $('#passages .passage');
        const $narrative = $passage.find('.narrative').last();
        const $btnCenter = $passage.find('.btn-center').first();

        if ($narrative.length) {
            $.wiki('<<questPrompts>>');
            $narrative.after($('.quest-prompts-container').detach());
        } else if ($btnCenter.length) {
            $.wiki('<<questPrompts>>');
            $btnCenter.before($('.quest-prompts-container').detach());
        } else {
            $.wiki('<<questPrompts>>');
            $passage.append($('.quest-prompts-container').detach());
        }
    }
});
/* ================== QUEST SYSTEM V2 =================== */
function getQuestPeriod(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

function checkQuestTriggers(triggers, vars, currentLoc, currentHour, currentPeriod) {
    if (!triggers) return { met: true, blocking: null };
    if (triggers.location && triggers.location !== currentLoc) {
        return { met: false, blocking: 'location' };
    }
    if (triggers.time?.period && triggers.time.period !== currentPeriod) {
        return { met: false, blocking: 'time' };
    }
    if (triggers.time?.hour) {
        const [minH, maxH] = triggers.time.hour;
        if (currentHour < minH || currentHour >= maxH) {
            return { met: false, blocking: 'time' };
        }
    }
    // Check timeRange (business hours, etc.)
    if (triggers.timeRange) {
        const { min, max } = triggers.timeRange;
        if (currentHour < min || currentHour >= max) {
            return { met: false, blocking: 'time' };
        }
    }
    if (triggers.character) {
        const char = vars.characters?.[triggers.character.id];
        if (!char) return { met: false, blocking: 'character' };
        if (char.currentLocation !== currentLoc) {
            return { met: false, blocking: 'character' };
        }
        if (triggers.character.status && char.currentStatus !== triggers.character.status) {
            return { met: false, blocking: 'character_status' };
        }
    }
    if (triggers.flag && !vars[triggers.flag]) {
        return { met: false, blocking: 'flag' };
    }

    return { met: true, blocking: null };
}

function checkQuestRequirements(reqs, vars) {
    if (!reqs) return { met: true, missing: [] };

    const missing = [];
    if (reqs.flags) {
        for (const flag of reqs.flags) {
            /* Check both top-level vars and $flags object (game stores flags in $flags.xxx) */
            if (!vars[flag] && !(vars.flags && vars.flags[flag])) missing.push({ type: 'flag', name: flag });
        }
    }
    if (reqs.quests) {
        for (const qid of reqs.quests) {
            if (!vars.questState?.completed?.includes(qid)) {
                missing.push({ type: 'quest', name: qid });
            }
        }
    }
    if (reqs.relationships) {
        for (const [charId, stats] of Object.entries(reqs.relationships)) {
            for (const [stat, min] of Object.entries(stats)) {
                const current = vars.characters?.[charId]?.stats?.[stat] || 0;
                if (current < min) {
                    missing.push({ type: 'relationship', char: charId, stat, required: min, current });
                }
            }
        }
    }
    if (reqs.stats) {
        for (const [stat, min] of Object.entries(reqs.stats)) {
            const current = vars.player?.[stat] || 0;
            if (current < min) {
                missing.push({ type: 'stat', stat, required: min, current });
            }
        }
    }

    return { met: missing.length === 0, missing };
}

/* Set in :passagerender, read in :passagedisplay (after :passageend clears _navigatingBackward) */
let _deferredLocationClosedCheckSkip = false;

/* -------------------- QUEST LEGACY SUPPORT -------------------- */
$(document).on(':passagerender', function () {
    _deferredLocationClosedCheckSkip = !!(State.variables && State.variables._navigatingBackward);

    if (Macro.has("questCheck")) $.wiki("<<questCheck>>");
    $.wiki("<<updateTimedEvents>>");
});

/* Closed-location kick must run after the passage is actually displayed; :passagerender + setTimeout(0)
   can still run before the first paint, so the player never sees activity scenes (e.g. park bench) before Engine.play(region). */
$(document).on(':passagedisplay', function () {
    const skipLocationCloseBecauseHistoryBack = _deferredLocationClosedCheckSkip;
    _deferredLocationClosedCheckSkip = false;

    /* Check if current location is closed – move player outside (e.g. mall at 22:00).
       Next tick after display so nav-card Engine.play still wins over advanceTime's goto from same tick. */
    setTimeout(function () {
        const vars = State.variables;
        if (skipLocationCloseBecauseHistoryBack) return;
        const loc = vars.location;
        if (!loc) return;
        const hours = setup.locationHours && setup.locationHours[loc];
        if (!hours || hours.open24h) return;
        /* Activity scenes use passage names (e.g. parkBench) while $location stays the hub id (sunsetPark).
           Only run the closed-kick on hub passages where passage name === location id (e.g. after "Stand Up"). */
        const passage = State.passage;
        if (passage && passage !== loc) return;
        if (window.isLocationOpen && window.isLocationOpen(loc)) return;
        const region = hours.region || "downTown";
        const locName = (setup.navCards && setup.navCards[loc]?.name) || loc;
        if (window.showNotification) {
            window.showNotification({ type: "warning", message: locName + " is now closed. You've been moved outside." });
        }
        vars.location = region;
        /* Second arg true = do not push a new history moment. Otherwise Stand Up → hub → kick adds two steps
           and backward lands on hub before the activity; player should go from region back to the event first. */
        Engine.play(region, true);
    }, 0);
});

/* -------------------- QUEST PROMPTS -------------------- */
/* Usage: <<questPrompts>> or <<questPrompts "charId">> */
Macro.add('questPrompts', {
    handler: function () {
        const vars = State.variables;
        const charFilter = this.args[0] || null;
        const currentLoc = vars.location || '';
        const currentHour = vars.timeSys?.hour || 12;
        const currentPeriod = getQuestPeriod(currentHour);
        const prompts = [];
        if (!vars.questState?.active || !setup.quests) return;

        for (const [qid, state] of Object.entries(vars.questState.active)) {
            const quest = setup.quests[qid];
            if (!quest || !quest.stages) continue;

            const stage = quest.stages[state.stage];
            if (!stage || !stage.forceScene || !stage.passage) continue;
            if (state.triggeredStage === state.stage) continue;

            // Check location requirement first - if not in right location, skip entirely
            if (stage.triggers?.location && stage.triggers.location !== currentLoc) {
                continue;
            }

            // Now check other triggers (time, character, etc.) for locked state
            // Create a copy of triggers without location since we already checked it
            const nonLocationTriggers = stage.triggers ? { ...stage.triggers, location: undefined } : null;
            const triggerResult = checkQuestTriggers(
                nonLocationTriggers, vars, currentLoc, currentHour, currentPeriod
            );

            const reqResult = checkQuestRequirements(stage.requirements, vars);
            if (!reqResult.met) continue;
            if (quest.mealType) {
                const isBreakfast = currentHour >= 7 && currentHour < 8;
                const isLunch = currentHour >= 12 && currentHour < 13;
                const isDinner = currentHour >= 18 && currentHour < 19;

                let inMealTime = false;
                if (quest.mealType === 'breakfast' && isBreakfast) inMealTime = true;
                if (quest.mealType === 'lunch' && isLunch) inMealTime = true;
                if (quest.mealType === 'dinner' && isDinner) inMealTime = true;

                if (!inMealTime) continue;
            }
            const triggerChar = stage.triggers?.character?.id || null;
            const triggerType = triggerChar ? 'character' : 'location';
            if (charFilter) {
                if (triggerChar !== charFilter) continue;
            } else {
                if (triggerType !== 'location') continue;
            }

            prompts.push({
                questId: qid,
                stageId: stage.id,
                buttonText: stage.buttonText || stage.title,
                passage: stage.passage,
                locked: !triggerResult.met,
                lockedText: stage.lockedText || 'Not available right now'
            });
        }

        if (prompts.length === 0) return;

        const container = $('<div>').addClass('location-actions');

        prompts.forEach(prompt => {
            if (prompt.locked) {
                // Render locked button
                const lockedBtn = $('<span>')
                    .addClass('link-internal btn-style btn-default locked')
                    .attr('data-tooltip', prompt.lockedText)
                    .html('<i class="icon icon-lock icon-12"></i> ' + prompt.buttonText);
                container.append(lockedBtn);
            } else {
                // Render active button
                const btn = $('<a>')
                    .addClass('link-internal btn-style action-btn btn-quest')
                    .attr('data-passage', prompt.passage)
                    .text(prompt.buttonText)
                    .ariaClick({ namespace: '.quest-prompt', one: true }, function () {
                        if (vars.questState?.active?.[prompt.questId]) {
                            vars.questState.active[prompt.questId].triggeredStage =
                                vars.questState.active[prompt.questId].stage;
                        }
                        Engine.play(prompt.passage);
                    });
                container.append(btn);
            }
        });

        $(this.output).append(container);
    }
});

/* -------------------- START QUEST MACRO -------------------- */
Macro.add('startQuest', {
    handler: function () {
        const qid = this.args[0];
        if (!qid) return this.error('startQuest requires quest ID');

        const quest = setup.quests?.[qid];
        if (!quest) return this.error(`Quest "${qid}" not found in setup.quests`);

        const vars = State.variables;
        if (!vars.questState) {
            vars.questState = { active: {}, completed: [], failed: [], daily: {}, completedDates: {} };
        }
        if (vars.questState.active[qid]) {
            return;
        }
        if (vars.questState.completed.includes(qid)) {
            return;
        }
        const reqResult = checkQuestRequirements(quest.requirements, vars);
        if (!reqResult.met) {
            return;
        }
        vars.questState.active[qid] = {
            stage: 0,
            objectives: {},
            triggeredStage: -1,
            startDate: `${vars.timeSys?.day || 1}/${vars.timeSys?.month || 1}/${vars.timeSys?.year || 2025}`
        };
        if (vars.questAdvancesFromPassage && vars.questAdvancesFromPassage[qid]) delete vars.questAdvancesFromPassage[qid];
        if (vars.questMaxAdvancesFromPassage && vars.questMaxAdvancesFromPassage[qid]) delete vars.questMaxAdvancesFromPassage[qid];
        if (window.showNotification) {
            window.showNotification({
                type: 'quest',
                message: `New Quest: ${quest.title}`,
                duration: 4000,
                position: 'rightbar-left'
            });
        }
        vars.showJournalQuestNotify = true;
        if (typeof window.rebuildTopbar === 'function') {
            requestAnimationFrame(function () {
                window.rebuildTopbar();
            });
        }
    }
});

/* -------------------- ADVANCE QUEST STAGE MACRO -------------------- */
/* Allow multiple advances from the same passage; block only on F5/re-render by
   capping advances per (quest, passage) when we leave the passage. */
Macro.add('advanceQuestStage', {
    handler: function () {
        const qid = this.args[0];
        if (!qid) return this.error('advanceQuestStage requires quest ID');

        const vars = State.variables;
        const state = vars.questState?.active?.[qid];
        const quest = setup.quests?.[qid];

        if (!state || !quest) {
            return;
        }

        const passage = State.passage;
        if (!vars.questAdvancesFromPassage) vars.questAdvancesFromPassage = {};
        if (!vars.questAdvancesFromPassage[qid]) vars.questAdvancesFromPassage[qid] = {};
        const count = (vars.questAdvancesFromPassage[qid][passage] || 0);
        const maxFromPassage = vars.questMaxAdvancesFromPassage?.[qid]?.[passage];
        /* Skip if we already did all advances this passage allows (e.g. after F5 re-run). */
        if (maxFromPassage != null && count >= maxFromPassage) return;
        vars.questAdvancesFromPassage[qid][passage] = count + 1;

        state.stage++;
        state.objectives = {};
        state.triggeredStage = -1;
        if (state.stage >= quest.stages.length) {
            $.wiki(`<<completeQuest "${qid}">>`);
        } else {
            const newStage = quest.stages[state.stage];
            if (window.showNotification) {
                window.showNotification({
                    type: 'quest',
                    message: `Quest Updated: ${newStage.title}`,
                    duration: 3000,
                    position: 'rightbar-left'
                });
            }
        }
    }
});

/* -------------------- COMPLETE OBJECTIVE MACRO -------------------- */
Macro.add('completeObjective', {
    handler: function () {
        const qid = this.args[0];
        const objId = this.args[1];
        if (!qid || !objId) return this.error('completeObjective requires quest ID and objective ID');

        const vars = State.variables;
        const state = vars.questState?.active?.[qid];
        const quest = setup.quests?.[qid];

        if (!state || !quest) return;
        const stage = quest.stages[state.stage];
        if (!stage?.objectives) return;
        if (state.objectives[objId]) return;
        state.objectives[objId] = true;
        const obj = stage.objectives.find(o => o.id === objId);
        if (obj && window.showNotification) {
            window.showNotification({
                type: 'success',
                message: `✓ ${obj.text}`,
                duration: 2500
            });
        }

        const allComplete = stage.objectives.every(o => state.objectives[o.id]);
        const anyComplete = stage.objectives.some(o => state.objectives[o.id]);

        if (stage.completeWhen === 'allObjectives' && allComplete) {
            $.wiki(`<<advanceQuestStage "${qid}">>`);
        } else if (stage.completeWhen === 'anyObjective' && anyComplete) {
            $.wiki(`<<advanceQuestStage "${qid}">>`);
        }
    }
});

/* -------------------- COMPLETE QUEST MACRO -------------------- */
Macro.add('completeQuest', {
    handler: function () {
        const qid = this.args[0];
        if (!qid) return this.error('completeQuest requires quest ID');

        const vars = State.variables;
        const quest = setup.quests?.[qid];

        if (!vars.questState?.active?.[qid] || !quest) return;
        delete vars.questState.active[qid];
        if (vars.questAdvancesFromPassage && vars.questAdvancesFromPassage[qid]) delete vars.questAdvancesFromPassage[qid];
        if (vars.questMaxAdvancesFromPassage && vars.questMaxAdvancesFromPassage[qid]) delete vars.questMaxAdvancesFromPassage[qid];
        if (!vars.questState.completed) vars.questState.completed = [];
        vars.questState.completed.push(qid);
        /* Store completion date for delayed quest scheduling */
        if (!vars.questState.completedDates) vars.questState.completedDates = {};
        const ts = vars.timeSys;
        vars.questState.completedDates[qid] = (ts?.year || 0) * 10000 + (ts?.month || 0) * 100 + (ts?.day || 0);
        const rewards = quest.onComplete;
        if (rewards) {
            if (rewards.relationships) {
                for (const [charId, gains] of Object.entries(rewards.relationships)) {
                    if (!vars.characters?.[charId]) continue;
                    for (const [stat, value] of Object.entries(gains)) {
                        vars.characters[charId].stats[stat] =
                            (vars.characters[charId].stats[stat] || 0) + value;
                    }
                }
            }
            if (rewards.stats) {
                for (const [stat, value] of Object.entries(rewards.stats)) {
                    vars.player[stat] = (vars.player[stat] || 0) + value;
                }
                if (Macro.has('recalculateStats')) {
                    $.wiki('<<recalculateStats>>');
                }
            }
            if (rewards.money) {
                vars.money = (vars.money || 0) + rewards.money;
            }
            if (rewards.flags) {
                for (const flag of rewards.flags) {
                    vars[flag] = true;
                }
            }
            const msg = rewards.notification || `Quest Complete: ${quest.title}`;
            if (window.showNotification) {
                window.showNotification({
                    type: 'quest',
                    message: msg,
                    duration: 4000,
                    position: 'rightbar-left'
                });
            }

            // Chain next quest(s) - supports both string and array
            if (rewards.nextQuest) {
                if (Array.isArray(rewards.nextQuest)) {
                    // Multiple quests
                    for (const nextQid of rewards.nextQuest) {
                        $.wiki(`<<startQuest "${nextQid}">>`);
                    }
                } else {
                    // Single quest
                    $.wiki(`<<startQuest "${rewards.nextQuest}">>`);
                }
            }


        }
    }
});

/* -------------------- GET QUEST HINT MACRO -------------------- */
Macro.add('getQuestHint', {
    handler: function () {
        const qid = this.args[0];
        const vars = State.variables;
        const quest = setup.quests?.[qid];
        const state = vars.questState?.active?.[qid];

        if (!quest || !state) {
            State.temporary.questHint = '';
            return;
        }

        const stage = quest.stages[state.stage];
        let hint = '';

        if (stage?.triggers) {
            if (stage.triggers.location) {
                hint = `Go to ${stage.triggers.location}`;
            }
            if (stage.triggers.time?.period) {
                hint += ` during ${stage.triggers.time.period}`;
            }
            if (stage.triggers.character) {
                const charName = vars.characters?.[stage.triggers.character.id]?.name?.split(' ')[0] || stage.triggers.character.id;
                hint += `. Find ${charName} there`;
            }
        }

        State.temporary.questHint = hint;
    }
});

/* ================== btn Macro =================== */
/* Usage: <<btn "Text" "passage" "style">> or <<btn "Text" "passage" "style" minEnergy>> or <<btn "Text" "" "locked" "tooltip">> */
Macro.add('btn', {
    tags: null,
    handler: function () {
        if (this.args.length < 1) {
            return this.error('btn macro requires at least 1 argument: text');
        }

        const text = this.args[0];
        const passage = this.args[1];
        const style = this.args[2] ? this.args[2].toLowerCase() : 'default';
        const minEnergy = this.args[3] !== undefined ? parseInt(this.args[3], 10) : 0;
        const payload = this.payload[0].contents;

        const energy = parseInt(State.variables.energy || 0, 10);
        const lockedByEnergy = minEnergy > 0 && energy < minEnergy;
        const lockedByStyle = style === 'locked';

        if (lockedByStyle) {
            const tooltip = (typeof this.args[3] === 'string' ? this.args[3] : '') || 'Locked';
            const span = $('<span>')
                .addClass('link-internal btn-style locked')
                .attr('data-tooltip', tooltip)
                .html('<span class="icon icon-lock icon-12"></span> ' + text)
                .appendTo(this.output);
            span.addClass('btn-default');
            return;
        }

        const locked = lockedByEnergy;

        if (locked) {
            const tooltip = 'Need ' + minEnergy + ' energy';
            const span = $('<span>')
                .addClass('link-internal btn-style locked')
                .attr('data-tooltip', tooltip)
                .html('<span class="icon icon-lock icon-12"></span> ' + text)
                .appendTo(this.output);
            if (style.includes(' ')) {
                span.addClass(style);
            } else {
                span.addClass('btn-' + style);
            }
            return;
        }

        const link = $('<a>')
            .addClass('link-internal')
            .addClass('btn-style')
            .attr('tabindex', '0')
            .appendTo(this.output);

        if (typeof text === 'string' && /<[^>]+>/.test(text)) {
            link.wiki(text);
        } else {
            link.text(text);
        }

        if (style.includes(' ')) {
            link.addClass(style);
        } else {
            link.addClass('btn-' + style);
        }

        if (passage) {
            link.attr('data-passage', passage);
        }

        link.ariaClick({
            namespace: '.macros',
            one: true
        }, function () {
            if (payload.trim()) $.wiki(payload);
            if (passage) {
                Engine.play(passage);
            }
            // Refresh topbar/rightbar even if we stayed in the same passage
            $(document).trigger(':passagerender');
        });
    }
});

/* Hub ambient: drain = max(1, round(drainPerHour * minutes / 60)); requireMin = drain + 10. Rates tunable in setup.hubAmbientEnergyDrainPerHour. */
setup.hubAmbientEnergyNotEnoughMsg = 'Dont have enough energy';
setup.hubAmbientEnergyDrainPerHour = Object.assign(
    { walk: 10, phone: 8, watch: 10 },
    setup.hubAmbientEnergyDrainPerHour || {}
);
setup.hubAmbientEnergyActDrain = function (key, mins) {
    const h = setup.hubAmbientEnergyDrainPerHour[key];
    if (h == null) return 1;
    const defM = key === 'phone' ? 10 : 15;
    const m = parseInt(mins, 10);
    const mm = !isNaN(m) && m > 0 ? m : defM;
    return Math.max(1, Math.round((h * mm) / 60));
};
/** Mood gain per hour of hub ambient (used by district hub passages). */
setup.hubAmbientMoodGainPerHour = Object.assign(
    { walk: 8, phone: 8, watch: 6 },
    setup.hubAmbientMoodGainPerHour || {}
);
/** Insufficient-day job logic: add deltaDays to y/m/d. weekday = Date.getDay (0=Sun), matches $timeSys.weekday. */
setup.jobDateAddDays = function (y, m, d, deltaDays) {
    const dt = new Date(y, m - 1, d + deltaDays);
    return {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        day: dt.getDate(),
        weekday: dt.getDay()
    };
};
setup.hubAmbientEnergyForMins = {
    walk(mins) {
        return setup.hubAmbientEnergyActDrain('walk', mins) + 10;
    },
    phone(mins) {
        return setup.hubAmbientEnergyActDrain('phone', mins) + 10;
    },
    watch(mins) {
        return setup.hubAmbientEnergyActDrain('watch', mins) + 10;
    },
    /* Living room TV: matches watchTV.twee — base 2, +1 per extra 15m, max 6; +10 to start */
    tvWatch(mins) {
        const m = parseInt(mins, 10) || 15;
        let cost = 2;
        if (m > 15) {
            cost = 2 + Math.floor((m - 15) / 15) * 1;
            cost = Math.min(6, cost);
        }
        return cost + 10;
    }
};

/* ================== btnPicker Macro =================== */
/* Usage: <<btnPicker "Text" "passage" "presetName">> | 4th: style | 5th: minEnergy (number) OR hub key "walk"|"phone"|"watch"|"tvWatch" for duration-based energy (setup.hubAmbientEnergyForMins). Presets: DurationPresets.twee */
Macro.add('btnPicker', {
    handler: function () {
        if (this.args.length < 3) {
            return this.error('btnPicker requires: text, passage, presetName');
        }

        const text = this.args[0];
        const passage = this.args[1];
        const presetName = this.args[2];
        const style = this.args[3] ? this.args[3].toLowerCase() : 'default';
        const energyArg = this.args[4];
        let staticMinEnergy = 0;
        let dynamicEnergyKey = null;
        if (energyArg !== undefined && energyArg !== null && energyArg !== '') {
            if (
                typeof energyArg === 'string' &&
                setup.hubAmbientEnergyForMins &&
                typeof setup.hubAmbientEnergyForMins[energyArg] === 'function'
            ) {
                dynamicEnergyKey = energyArg;
            } else {
                staticMinEnergy = parseInt(energyArg, 10) || 0;
            }
        }

        const energy = parseInt(State.variables.energy || 0, 10);
        const staticLocked = !dynamicEnergyKey && staticMinEnergy > 0 && energy < staticMinEnergy;

        if (staticLocked) {
            const tooltip = 'Need ' + staticMinEnergy + ' energy';
            const span = $('<span>')
                .addClass('link-internal btn-style locked')
                .attr('data-tooltip', tooltip)
                .attr('data-tooltip-type', 'locked')
                .html('<span class="icon icon-lock icon-12"></span> ' + text)
                .appendTo(this.output);
            if (style.includes(' ')) {
                span.addClass(style);
            } else {
                span.addClass('btn-' + style);
            }
            return;
        }

        const preset = setup.durationPresets[presetName];
        if (!preset) return this.error(`Preset "${presetName}" not found in setup.durationPresets`);
        if (!State.variables.pickerMemory) {
            State.variables.pickerMemory = {};
        }
        const remembered = State.variables.pickerMemory[presetName];
        let selectedValue = remembered !== undefined ? remembered : preset[0].value;
        const getLabel = (val) => {
            const found = preset.find(p => p.value === val);
            return found ? found.label : preset[0].label;
        };

        const requiredEnergyForSelection = () => {
            if (dynamicEnergyKey && setup.hubAmbientEnergyForMins[dynamicEnergyKey]) {
                return setup.hubAmbientEnergyForMins[dynamicEnergyKey](selectedValue);
            }
            return staticMinEnergy;
        };

        const hubEnergyMsg = setup.hubAmbientEnergyNotEnoughMsg || 'Dont have enought energy';

        const wrapper = $('<div>')
            .addClass('btn-picker-split')
            .appendTo(this.output);
        const btn = $('<a>')
            .addClass('link-internal btn-style btn-' + style + ' btn-picker-main')
            .attr('tabindex', '0')
            .text(text)
            .appendTo(wrapper);
        const trigger = $('<a>')
            .addClass('btn-picker-trigger')
            .html('<span class="picker-value">' + getLabel(selectedValue) + '</span> <span class="icon icon-chevron-down icon-12"></span>')
            .appendTo(wrapper);
        const dropdown = $('<div>')
            .addClass('btn-picker-dropdown')
            .appendTo(wrapper);

        function closeDropdownCompletely() {
            dropdown.removeClass('open');
            wrapper.removeClass('open');
            $('body').removeClass('btn-picker-open');
            moveDropdownBackToWrapper();
        }

        const refreshAffordableOptions = () => {
            if (!dynamicEnergyKey || !setup.hubAmbientEnergyForMins[dynamicEnergyKey]) return;
            const en = parseInt(State.variables.energy || 0, 10);
            const fn = setup.hubAmbientEnergyForMins[dynamicEnergyKey];
            dropdown.find('.btn-picker-option').each(function () {
                const v = parseInt($(this).attr('data-value'), 10);
                const req = fn(v);
                $(this).toggleClass('option-unaffordable', req > 0 && en < req);
            });
        };

        const refreshMainBtnEnergyLock = () => {
            const need = requiredEnergyForSelection();
            const en = parseInt(State.variables.energy || 0, 10);
            const low = need > 0 && en < need;
            btn.toggleClass('locked', low);
            btn.attr('aria-disabled', low ? 'true' : 'false');
            if (dynamicEnergyKey) {
                wrapper.toggleClass('btn-picker-split-energy-locked', low);
                if (low) {
                    btn.html('<span class="icon icon-lock icon-12"></span> ' + text);
                    btn.attr('data-tooltip', hubEnergyMsg);
                    btn.attr('data-tooltip-type', 'locked');
                    wrapper.attr('data-tooltip', hubEnergyMsg);
                    wrapper.attr('data-tooltip-type', 'locked');
                    trigger.attr('data-tooltip', hubEnergyMsg);
                    trigger.attr('data-tooltip-type', 'locked');
                } else {
                    btn.text(text);
                    btn.removeAttr('data-tooltip');
                    btn.removeAttr('data-tooltip-type');
                    wrapper.removeAttr('data-tooltip');
                    wrapper.removeAttr('data-tooltip-type');
                    trigger.removeAttr('data-tooltip');
                    trigger.removeAttr('data-tooltip-type');
                }
                refreshAffordableOptions();
            } else {
                wrapper.removeClass('btn-picker-split-energy-locked');
                wrapper.removeAttr('data-tooltip');
                wrapper.removeAttr('data-tooltip-type');
                if (low) {
                    btn.html('<span class="icon icon-lock icon-12"></span> ' + text);
                    btn.attr('data-tooltip', 'Need ' + need + ' energy');
                    btn.attr('data-tooltip-type', 'locked');
                } else {
                    btn.text(text);
                    btn.removeAttr('data-tooltip');
                    btn.removeAttr('data-tooltip-type');
                }
            }
        };
        refreshMainBtnEnergyLock();

        const energyRenderNs =
            dynamicEnergyKey && presetName && passage
                ? 'btnPickerHub.' + presetName + '.' + passage.replace(/[^a-zA-Z0-9]/g, '_')
                : null;
        if (energyRenderNs) {
            $(document)
                .off(':passagerender.' + energyRenderNs)
                .on(':passagerender.' + energyRenderNs, function () {
                    refreshMainBtnEnergyLock();
                });
        }

        preset.forEach(option => {
            const optionBtn = $('<a>')
                .addClass('btn-picker-option')
                .text(option.label)
                .attr('data-value', option.value)
                .appendTo(dropdown);

            if (option.value === selectedValue) {
                optionBtn.addClass('selected');
            }

            optionBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (dynamicEnergyKey && setup.hubAmbientEnergyForMins[dynamicEnergyKey]) {
                    const oVal = parseInt($(this).attr('data-value'), 10);
                    const req = setup.hubAmbientEnergyForMins[dynamicEnergyKey](oVal);
                    const enNow = parseInt(State.variables.energy || 0, 10);
                    if (req > 0 && enNow < req) {
                        return;
                    }
                }

                selectedValue = option.value;
                State.variables.pickerMemory[presetName] = selectedValue;
                trigger.find('.picker-value').text(option.label);

                dropdown.find('.btn-picker-option').removeClass('selected');
                $(this).addClass('selected');
                closeDropdownCompletely();
                refreshMainBtnEnergyLock();
            });
        });
        if (dynamicEnergyKey) {
            refreshMainBtnEnergyLock();
        }
        function positionDropdownInPortal() {
            const triggerEl = trigger[0];
            const dropEl = dropdown[0];
            if (!triggerEl || !dropEl) return;
            const rect = triggerEl.getBoundingClientRect();
            const w = dropEl.offsetWidth || 120;
            dropdown.css({
                position: 'fixed',
                top: (rect.bottom + 4) + 'px',
                left: (rect.right - w) + 'px',
                right: 'auto',
                zIndex: '10000'
            });
        }

        const scrollNamespace = 'scroll.btnPickerPortal' + presetName;

        function moveDropdownToBody() {
            dropdown.addClass('btn-picker-dropdown-portal');
            $(document.body).append(dropdown);
            requestAnimationFrame(positionDropdownInPortal);
            $(document).on(scrollNamespace, function () {
                if (dropdown.hasClass('btn-picker-dropdown-portal')) {
                    requestAnimationFrame(positionDropdownInPortal);
                }
            });
            $('#passages').on(scrollNamespace, function () {
                if (dropdown.hasClass('btn-picker-dropdown-portal')) {
                    requestAnimationFrame(positionDropdownInPortal);
                }
            });
        }

        function moveDropdownBackToWrapper() {
            if (!dropdown.hasClass('btn-picker-dropdown-portal')) return;
            $(document).off(scrollNamespace);
            $('#passages').off(scrollNamespace);
            dropdown.removeClass('btn-picker-dropdown-portal').css({ position: '', top: '', left: '', right: '', zIndex: '' });
            if (wrapper[0].isConnected) {
                wrapper.append(dropdown);
            } else {
                dropdown.remove();
            }
        }

        trigger.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrapper.toggleClass('open');
            dropdown.toggleClass('open');

            if (dropdown.hasClass('open')) {
                $('body').addClass('btn-picker-open');
                moveDropdownToBody();
                refreshAffordableOptions();
            } else {
                $('body').removeClass('btn-picker-open');
                moveDropdownBackToWrapper();
            }
        });
        btn.on('click', function (e) {
            e.preventDefault();
            if (btn.hasClass('locked')) return;
            const need = requiredEnergyForSelection();
            const en = parseInt(State.variables.energy || 0, 10);
            if (need > 0 && en < need) return;
            State.variables.selectedDuration = selectedValue;
            Engine.play(passage);
        });
        $(document).on('click.btnPicker' + presetName, function (e) {
            const inWrapper = wrapper.is(e.target) || wrapper.has(e.target).length > 0;
            const inDropdown = dropdown.is(e.target) || dropdown.has(e.target).length > 0;
            if (!inWrapper && !inDropdown) {
                dropdown.removeClass('open');
                wrapper.removeClass('open');
                $('body').removeClass('btn-picker-open');
                moveDropdownBackToWrapper();
            }
        });
        $(document).one(':passagestart', function () {
            $(document).off('click.btnPicker' + presetName);
            if (energyRenderNs) {
                $(document).off(':passagerender.' + energyRenderNs);
            }
            $('body').removeClass('btn-picker-open');
            moveDropdownBackToWrapper();
        });
    }
});

/* ================== jobWorkPicker Macro =================== */
/* Usage: <<jobWorkPicker "Work" "jobWorkExecute">>
   Uses $jobAvailableShifts (from jobSetAvailableShifts) — schedule, energy (cost+10), tracked needs < 50 */
Macro.add('jobWorkPicker', {
    handler: function () {
        if (this.args.length < 2) {
            return this.error('jobWorkPicker requires: text, passage');
        }
        const text = this.args[0];
        const passage = this.args[1];
        const style = this.args[2] ? this.args[2].toLowerCase() : 'default';

        const available = State.variables.jobAvailableShifts || []; /* hours: 2,4,6,8 */
        const preset = setup.durationPresets && setup.durationPresets.jobShiftDuration;
        if (!preset) return this.error('jobShiftDuration preset not found');

        const options = preset.filter(p => available.includes(p.value / 60));
        const presetName = 'jobShiftDuration';

        if (options.length === 0) {
            const lockHint = State.variables.jobWorkNeedsBlock
                ? 'Eat, drink, or use the bathroom first (needs too high)'
                : 'Not enough energy or no shifts available';
            const span = $('<span>')
                .addClass('link-internal btn-style locked')
                .attr('data-tooltip', lockHint)
                .html('<span class="icon icon-lock icon-12"></span> ' + text)
                .appendTo(this.output)
                .addClass('btn-' + style);
            return;
        }

        if (!State.variables.pickerMemory) State.variables.pickerMemory = {};
        let selectedValue = State.variables.pickerMemory[presetName];
        if (!options.some(p => p.value === selectedValue)) selectedValue = options[0].value;
        State.variables.pickerMemory[presetName] = selectedValue;

        const getLabel = (val) => {
            const found = preset.find(p => p.value === val);
            return found ? found.label : options[0].label;
        };

        const wrapper = $('<div>').addClass('btn-picker-split').appendTo(this.output);
        const btn = $('<a>').addClass('link-internal btn-style btn-' + style + ' btn-picker-main')
            .attr('tabindex', '0').text(text).appendTo(wrapper);
        const trigger = $('<a>').addClass('btn-picker-trigger')
            .html('<span class="picker-value">' + getLabel(selectedValue) + '</span> <span class="icon icon-chevron-down icon-12"></span>')
            .appendTo(wrapper);
        const dropdown = $('<div>').addClass('btn-picker-dropdown').appendTo(wrapper);

        options.forEach(option => {
            const optionBtn = $('<a>').addClass('btn-picker-option')
                .text(option.label).attr('data-value', option.value).appendTo(dropdown);
            if (option.value === selectedValue) optionBtn.addClass('selected');
            optionBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectedValue = option.value;
                State.variables.pickerMemory[presetName] = selectedValue;
                trigger.find('.picker-value').text(option.label);
                dropdown.find('.btn-picker-option').removeClass('selected');
                $(this).addClass('selected');
                dropdown.removeClass('open');
                wrapper.removeClass('open');
                $('body').removeClass('btn-picker-open');
                moveDropdownBackToWrapper();
            });
        });

        function moveDropdownBackToWrapper() {
            if (!dropdown.hasClass('btn-picker-dropdown-portal')) return;
            $(document).off(scrollNamespace);
            $('#passages').off(scrollNamespace);
            dropdown.removeClass('btn-picker-dropdown-portal').css({ position: '', top: '', left: '', right: '', zIndex: '' });
            if (wrapper[0].isConnected) wrapper.append(dropdown);
        }
        const scrollNamespace = 'scroll.btnPickerPortal' + presetName + 'Job';

        function positionDropdownInPortal() {
            const triggerEl = trigger[0];
            const dropEl = dropdown[0];
            if (!triggerEl || !dropEl) return;
            const rect = triggerEl.getBoundingClientRect();
            const w = dropEl.offsetWidth || 120;
            dropdown.css({ position: 'fixed', top: (rect.bottom + 4) + 'px', left: (rect.right - w) + 'px', right: 'auto', zIndex: '10000' });
        }
        function moveDropdownToBody() {
            dropdown.addClass('btn-picker-dropdown-portal');
            $(document.body).append(dropdown);
            requestAnimationFrame(positionDropdownInPortal);
            $(document).on(scrollNamespace, () => { if (dropdown.hasClass('btn-picker-dropdown-portal')) requestAnimationFrame(positionDropdownInPortal); });
            $('#passages').on(scrollNamespace, () => { if (dropdown.hasClass('btn-picker-dropdown-portal')) requestAnimationFrame(positionDropdownInPortal); });
        }

        trigger.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrapper.toggleClass('open');
            dropdown.toggleClass('open');
            if (dropdown.hasClass('open')) {
                $('body').addClass('btn-picker-open');
                moveDropdownToBody();
            } else {
                $('body').removeClass('btn-picker-open');
                moveDropdownBackToWrapper();
            }
        });
        btn.on('click', function (e) {
            e.preventDefault();
            State.variables.selectedDuration = selectedValue;
            Engine.play(passage);
        });
        $(document).on('click.jobWorkPicker' + presetName, function (e) {
            const inWrapper = wrapper.is(e.target) || wrapper.has(e.target).length > 0;
            const inDropdown = dropdown.is(e.target) || dropdown.has(e.target).length > 0;
            if (!inWrapper && !inDropdown) {
                dropdown.removeClass('open');
                wrapper.removeClass('open');
                $('body').removeClass('btn-picker-open');
                moveDropdownBackToWrapper();
            }
        });
        $(document).one(':passagestart', function () {
            $(document).off('click.jobWorkPicker' + presetName);
            $('body').removeClass('btn-picker-open');
            moveDropdownBackToWrapper();
        });
    }
});

/* ================== Dynamic Button Styles =================== */
$(document).one(':storyready', function () {
    const generateButtonStyles = () => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        let cssRules = '';
        const allProps = [];
        for (let i = 0; i < styles.length; i++) {
            const prop = styles[i];
            if (prop.startsWith('--color-')) allProps.push(prop);
        }
        const colorVars = allProps.filter(prop =>
            !prop.includes('-bg-') &&
            !prop.includes('-border-') &&
            !prop.includes('-text-')
        );

        colorVars.forEach(varName => {
            const colorName = varName.replace('--color-', '');
            const colorValue = `var(${varName})`;

            cssRules += `
            .passage a.btn-${colorName},
            .btn-${colorName} {
                background: transparent !important;
                border-color: ${colorValue} !important;
                color: ${colorValue} !important;
            }

            .passage a.btn-${colorName}:hover,
            .btn-${colorName}:hover {
                background: ${colorValue} !important;
                border-color: ${colorValue} !important;
                color: #fff !important;
                transform: translateY(-1px);
            }
            `;
        });

        // Inject dynamic styles
        const existingStyle = document.getElementById('dynamic-button-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleTag = document.createElement('style');
        styleTag.id = 'dynamic-button-styles';
        styleTag.textContent = cssRules;
        document.head.appendChild(styleTag);
    };

    // Wait for CSS to fully load
    setTimeout(generateButtonStyles, 100);
});

/* ================== WARDROBE MACRO =================== */
// Usage: <<wardrobe>> | <<wardrobe "locationId">> | <<wardrobe "locationId" "backPassage">>
// Optional 3rd: noBack (true/"noBack") = hide back link. Optional 4th: jobId = require job uniform to leave (Wear this outfit).
Macro.add('wardrobe', {
    handler: function () {
        const output = this.output;
        const locationFilter = (this.args && this.args.length) ? this.args[0] : null;
        const backPassage = (this.args && this.args.length > 1) ? this.args[1] : null;
        const noBack = (this.args && this.args.length > 2) ? this.args[2] : null;
        const jobId = (this.args && this.args.length > 3) ? this.args[3] : null;

        // Direct access if already loaded
        if (window.wardrobeModule?.macroHandler) {
            window.wardrobeModule.macroHandler(output, locationFilter, backPassage, noBack, jobId);
            return;
        }

        // Async wait/retry mechanism
        // We MUST create a placeholder in the DOM because 'this.output' is a DocumentFragment 
        // that becomes invalid/empty after the macro returns.
        const $anchor = $('<div class="wardrobe-anchor"><div class="system-loader">Loading Wardrobe System...</div></div>');
        $(output).append($anchor);

        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max

        const checkInterval = setInterval(() => {
            attempts++;
            if (window.wardrobeModule && window.wardrobeModule.macroHandler) {
                clearInterval(checkInterval);

                // Clear loader
                $anchor.empty();

                try {
                    window.wardrobeModule.macroHandler($anchor, locationFilter, backPassage, noBack, jobId);
                } catch (e) {
                    $anchor.html('<div class="error-view">Wardrobe crashed: ' + e.message + '</div>');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                $anchor.html('<div class="error-msg">Error: Wardrobe module failed to load. Please refresh.</div>');
            }
        }, 100);
    }
});

/* ================== SHOP MACRO =================== */
// Usage: <<shop "Shop Name" "Shop Type" itemsArray "backPassage">>
Macro.add('shop', {
    handler: function () {
        const shopName = this.args[0] || 'Shop';
        const shopType = this.args[1] || 'Store';
        const itemIds = this.args[2] || [];
        const backPassage = this.args[3] || null;

        const output = this.output;

        // Direct access if already loaded
        if (window.shopModule?.macroHandler) {
            window.shopModule.macroHandler(output, shopName, shopType, itemIds, backPassage);
            return;
        }

        // Async wait/retry mechanism
        const $anchor = $('<div class="shop-anchor"><div class="system-loader">Loading Shop...</div></div>');
        $(output).append($anchor);

        let attempts = 0;
        const maxAttempts = 50;

        const checkInterval = setInterval(() => {
            attempts++;
            if (window.shopModule && window.shopModule.macroHandler) {
                clearInterval(checkInterval);
                $anchor.empty();

                try {
                    window.shopModule.macroHandler($anchor, shopName, shopType, itemIds, backPassage);
                } catch (e) {
                    $anchor.html('<div class="error-view">Shop crashed: ' + e.message + '</div>');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                $anchor.html('<div class="error-msg">Error: Shop module failed to load. Please refresh.</div>');
            }
        }, 100);
    }
});

/* ================== READING SCREEN MACRO =================== */
// Usage: <<readingScreen "backPassage">>
Macro.add('readingScreen', {
    handler: function () {
        const backPassage = (this.args && this.args.length > 0) ? this.args[0] : null;
        const output = this.output;

        // Direct access if already loaded
        if (window.readingModule && window.readingModule.macroHandler) {
            window.readingModule.macroHandler(output, backPassage);
            return;
        }

        // Async wait/retry – anchor strategy (same as shop/wardrobe)
        const $anchor = $('<div class="reading-anchor"><div class="system-loader">Loading Reading...</div></div>');
        $(output).append($anchor);

        let attempts = 0;
        const maxAttempts = 50;

        const checkInterval = setInterval(function () {
            attempts++;
            if (window.readingModule && window.readingModule.macroHandler) {
                clearInterval(checkInterval);
                $anchor.empty();
                try {
                    window.readingModule.macroHandler($anchor, backPassage);
                } catch (e) {
                    $anchor.html('<div class="error-view">Reading system crashed: ' + e.message + '</div>');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                $anchor.html('<div class="error-msg">Error: Reading module failed to load. Please refresh.</div>');
            }
        }, 100);
    }
});

/* ================== RESTAURANT MACRO =================== */
// Usage: <<restaurant "menuId">> or <<restaurant "menuId" "backPassage">>
Macro.add('restaurant', {
    handler: function () {
        var menuId = this.args[0] || '';
        var backPassage = this.args[1] || null;
        var output = this.output;

        if (window.restaurantModule && window.restaurantModule.macroHandler) {
            window.restaurantModule.macroHandler(output, menuId, backPassage);
            return;
        }

        var $anchor = $('<div class="restaurant-anchor"><div class="system-loader">Loading menu…</div></div>');
        $(output).append($anchor);

        var attempts = 0;
        var maxAttempts = 50;
        var checkInterval = setInterval(function () {
            attempts++;
            if (window.restaurantModule && window.restaurantModule.macroHandler) {
                clearInterval(checkInterval);
                $anchor.empty();
                try {
                    window.restaurantModule.macroHandler($anchor, menuId, backPassage);
                } catch (e) {
                    $anchor.html('<div class="restaurant-error">Restaurant failed to load. Refresh the page.</div>');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                $anchor.html('<div class="restaurant-error">Restaurant module not loaded. Refresh the page.</div>');
            }
        }, 100);
    }
});

/* ================== DIALOG MACROS =================== */
Macro.add('dialog', {
    tags: null,
    handler() {
        if (this.args.length === 0) {
            return this.error('dialog macro requires character ID');
        }

        const charId = this.args[0];
        const vars = State.variables;
        const character = setup.getCharacter ? setup.getCharacter(charId) : vars.characters?.[charId];

        if (!character) {
            return this.error(`Character "${charId}" not found`);
        }

        const content = this.payload[0].contents.trim();
        const type = character.type || 'npc';
        const color = character.color || '#666';

        // Player: firstName only; others: firstName + lastName
        let charName;
        if (type === 'player') {
            charName = vars.player?.firstName || character.firstName || charId;
        } else {
            charName = (character.firstName && character.lastName)
                ? `${character.firstName} ${character.lastName}`
                : (character.name || charId);
        }

        // Append status if available and different from name
        if (character.status && character.status !== charName && type !== 'player') {
            charName = `${charName} <small style="font-style: italic; opacity: 0.8; font-size: 0.7em;">(${character.status})</small>`;
        }

        const wrapper = $('<div>')
            .addClass('dialogue')
            .addClass(type)
            .appendTo(this.output);

        const avatar = $('<div>')
            .addClass('avatar')
            .css('border-color', color)
            .appendTo(wrapper);

        $('<img>')
            .attr('src', character.avatar)
            .attr('alt', charName)
            .appendTo(avatar);

        const card = $('<div>')
            .addClass('card')
            .css('border-color', color)
            .appendTo(wrapper);

        $('<div>')
            .addClass('name')
            .html(charName)
            .css('color', color)
            .appendTo(card);

        // Parse (action) format automatically
        let processedContent = content
            .replace(/\(([^)]+)\)/g, '<span class="action">($1)</span>')
            .replace(/\n\s*\n/g, ' ')  // Remove double line breaks
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();

        $('<div>')
            .addClass('text')
            .wiki(processedContent)
            .appendTo(card);
    }
});

Macro.add('narrative', {
    tags: null,
    handler() {
        const location = this.args.length > 0 ? this.args[0] : null;
        const content = this.payload[0].contents.trim();

        const wrapper = $('<div>')
            .addClass('narrative')
            .appendTo(this.output);

        if (location) {
            $('<div>')
                .addClass('location')
                .text(location)
                .appendTo(wrapper);
        }

        $('<div>')
            .addClass('narrative-text')
            .wiki(content)
            .appendTo(wrapper);
    }
});

Macro.add('thought', {
    tags: null,
    handler() {
        const content = this.payload[0].contents.trim();

        const wrapper = $('<div>')
            .addClass('thought-block')
            .appendTo(this.output);

        const card = $('<div>')
            .addClass('thought-card')
            .appendTo(wrapper);

        $('<div>')
            .addClass('thought-label')
            .text('Inner Voice')
            .appendTo(card);

        $('<div>')
            .addClass('thought-text')
            .wiki(content)
            .appendTo(card);

        $('<div>')
            .addClass('thought-avatar-spacer')
            .appendTo(wrapper);
    }
});

Macro.add('vid', {
    handler() {
        if (this.args.length === 0) {
            return this.error('vid macro requires a source URL');
        }

        const src = this.args[0];

        // Settings based playback (use State.variables.videoSettings)
        const getSetting = (key, def) => {
            if (State.variables && State.variables.videoSettings && State.variables.videoSettings[key] !== undefined) {
                return State.variables.videoSettings[key];
            }
            return def;
        };

        const globalAutoplay = getSetting('autoplaySet', true);
        const globalLoop = getSetting('loopSet', true);

        // Optional scale/width (2nd argument)
        let width = this.args[1] || '100%';
        if (typeof width === 'number') {
            if (width <= 1) width = (width * 100) + '%';
            else width = width + 'px';
        }

        // Optional manual control override (3rd argument)
        const controls = this.args[2] === true;

        const container = $('<div>')
            .addClass('video-container')
            .css('max-width', width)
            .appendTo(this.output);

        const video = $('<video>')
            .attr('src', src)
            .attr('preload', 'metadata')
            .prop('loop', globalLoop)
            .prop('controls', controls)
            .css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                'display': 'block',
                'cursor': 'pointer'
            })
            .appendTo(container);

        video.on('loadedmetadata', function () {
            const w = video[0].videoWidth;
            const h = video[0].videoHeight;
            if (w && h) {
                container.css('aspect-ratio', w + ' / ' + h);
            }
        });

        // Apply volume from settings
        const getVolume = () => {
            if (State.variables && State.variables.videoSettings) {
                const master = State.variables.videoSettings.masterVolume !== undefined ? State.variables.videoSettings.masterVolume : 100;
                const video = State.variables.videoSettings.videoVolume !== undefined ? State.variables.videoSettings.videoVolume : 100;
                return (master * video) / 10000; // Convert to 0.0-1.0 range
            }
            return 1.0;
        };
        video[0].volume = getVolume();
        let autoMutedFallback = false;

        // Add Play Overlay
        const overlay = $('<div>')
            .addClass('play-overlay')
            .append($('<div>').addClass('video-play-btn').append($('<span>').addClass('icon icon-play')))
            .appendTo(container);

        video.attr('playsinline', '');

        // Click to play/pause
        container.on('click', function () {
            if (autoMutedFallback && !video[0].paused && video[0].muted) {
                video[0].muted = false;
                video[0].volume = getVolume();
                autoMutedFallback = false;
                return;
            }

            if (video[0].paused) {
                video[0].play();
            } else {
                video[0].pause();
            }
        });

        // Overlay Visibility Logic
        video.on('play playing', function () {
            overlay.addClass('hidden');
        });

        video.on('pause ended', function () {
            if (!video[0].ended || globalLoop) {
                overlay.removeClass('hidden');
            }
        });

        // Handle Playback based on settings
        const videoEl = video[0];
        const containerEl = container[0];
        const tryPlay = () => {
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (!videoEl.muted) {
                        videoEl.muted = true;
                        autoMutedFallback = true;
                        const mutedPlayPromise = videoEl.play();
                        if (mutedPlayPromise !== undefined) {
                            mutedPlayPromise.catch(() => {
                                overlay.removeClass('hidden');
                            });
                        }
                        return;
                    }
                    overlay.removeClass('hidden');
                });
            }
        };

        if (globalAutoplay) {
            const setupVisibilityPlayback = () => {
                if (!containerEl.isConnected) return;

                if (!('IntersectionObserver' in window)) {
                    tryPlay();
                    return;
                }

                const scrollRoot = document.getElementById('passages') || null;
                let userInitiatedPause = false;

                video.on('pause', function () {
                    if (videoEl._intersectionPause) {
                        videoEl._intersectionPause = false;
                        return;
                    }
                    userInitiatedPause = true;
                });
                video.on('play', function () {
                    userInitiatedPause = false;
                });

                const visibilityObserver = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.target !== containerEl) return;

                        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                            if (!userInitiatedPause && videoEl.paused) {
                                tryPlay();
                            }
                        } else if (!videoEl.paused) {
                            videoEl._intersectionPause = true;
                            videoEl.pause();
                        }
                    });
                }, { root: scrollRoot, threshold: [0, 0.25, 0.5] });

                visibilityObserver.observe(containerEl);

                const cleanup = () => {
                    if (visibilityObserver) {
                        visibilityObserver.disconnect();
                    }
                    $(document).off('.vidMacro' + cleanupId);
                };
                const cleanupId = Date.now() + '_' + Math.floor(Math.random() * 1e6);
                $(document).one(':passagestart.vidMacro' + cleanupId, cleanup);
            };

            setTimeout(setupVisibilityPlayback, 0);
        } else {
            overlay.removeClass('hidden');
        }
    }
});

Macro.add('image', {
    handler() {
        if (this.args.length === 0) {
            return this.error('image macro requires a source URL');
        }

        const src = this.args[0];

        // Optional scale/width (2nd argument)
        let width = this.args[1] || '100%';
        if (typeof width === 'number') {
            if (width <= 1) width = (width * 100) + '%';
            else width = width + 'px';
        }

        // Outer wrapper for centering
        const wrapper = $('<div>')
            .css({
                'text-align': 'center',
                'margin': '2rem 0'
            })
            .appendTo(this.output);

        // Inner container with inline-block
        const container = $('<div>')
            .css({
                'display': 'inline-block',
                'max-width': width,
                'border-radius': '12px',
                'overflow': 'hidden',
                'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            })
            .appendTo(wrapper);

        $('<img>')
            .attr('src', src)
            .css({
                'display': 'block',
                'width': '100%',
                'border-radius': '12px'
            })
            .appendTo(container);
    }
});

/* Same rules as <<jobCanAdvanceTier>> — used for Discuss Promotion without waiting for promotionPending. */
window.getJobPromotionEligibility = function (vars) {
    const setupObj = (typeof setup !== 'undefined' && setup) ? setup : (typeof window !== 'undefined' && window.setup) ? window.setup : null;
    if (!setupObj || !vars) return { eligible: false, nextTier: null, targetHints: [] };
    const job = vars.job;
    const jobState = vars.jobState || {};
    if (!job || !job.id || !setupObj.jobs || !setupObj.jobs[job.id]) {
        return { eligible: false, nextTier: null, targetHints: [] };
    }
    const def = setupObj.jobs[job.id];
    const tier = parseInt(job.tier, 10) || 1;
    const maxTier = parseInt(def.tierMax, 10) || 6;
    const next = tier + 1;
    if (next > maxTier) {
        return { eligible: false, nextTier: null, targetHints: [] };
    }
    const rules = def.tierProgressionRules || {};
    const rule = rules[next] || null;
    const targetHints = [];
    const formatReqLabel = function (word) {
        const w = String(word || '');
        const upper = w.toUpperCase();
        if (upper === 'XP' || upper === 'HP' || upper === 'MP') return upper;
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    };

    if (!rule) {
        const reqs = def.tierExperienceRequirements || [];
        const needXp = parseInt(reqs[tier], 10) || 0;
        const haveXp = parseInt(jobState.jobExperience, 10) || 0;
        if (needXp > 0 && haveXp < needXp) {
            targetHints.push(needXp + ' XP');
        }
        return { eligible: targetHints.length === 0, nextTier: next, targetHints: targetHints };
    }

    const haveXpJ = parseInt(jobState.jobExperience, 10) || 0;
    const needXpR = parseInt(rule.jobExperience || 0, 10) || 0;
    if (needXpR > 0 && haveXpJ < needXpR) {
        targetHints.push(needXpR + ' XP');
    }
    if (rule.stats && typeof rule.stats === 'object') {
        Object.entries(rule.stats).forEach(function (entry) {
            const statKey = entry[0];
            const statTarget = Number(entry[1] || 0);
            const statHave = Number(vars[statKey] || 0);
            if (statTarget > 0 && statHave < statTarget) {
                targetHints.push(Math.round(statTarget) + ' ' + formatReqLabel(statKey));
            }
        });
    }
    if (rule.skills && typeof rule.skills === 'object') {
        Object.entries(rule.skills).forEach(function (entry) {
            const skillPath = String(entry[0] || '');
            const skillTarget = Number(entry[1] || 0);
            let node = vars.skills || {};
            const parts = skillPath.replace(/^skills\./, '').split('.');
            for (let i = 0; i < parts.length; i++) {
                if (!node || typeof node !== 'object') { node = null; break; }
                node = node[parts[i]];
            }
            const skillHave = Number(node || 0);
            if (skillTarget > 0 && skillHave < skillTarget) {
                const skillLabel = parts[parts.length - 1] || 'skill';
                targetHints.push(Math.round(skillTarget) + ' ' + formatReqLabel(skillLabel));
            }
        });
    }
    return { eligible: targetHints.length === 0, nextTier: next, targetHints: targetHints };
};

/* ================== CHARACTER INTERACTION MACRO =================== */
Macro.add('showActions', {
    handler: function () {
        if (this.args.length < 2) {
            return this.error('showActions requires characterId and location');
        }

        const charId = this.args[0];
        const location = this.args[1];
        const vars = State.variables;

        // Get character and actions
        const character = vars.characters?.[charId];
        const actions = setup.characterActions?.[charId]?.[location] || [];
        const prefs = vars.contentPreferences || {};
        const charStats = character?.stats || {};

        if (!character) {
            $(this.output).append('<p class="no-actions">Character not found.</p>');
            return;
        }

        const container = $('<div>').addClass('location-actions');
        let visibleActions = 0;

        // Meetup button: show when there's a pending phone meetup for this char at this location, now
        const ts = vars.timeSys || {};
        const currentDate = (ts.year || 0) * 10000 + (ts.month || 0) * 100 + (ts.day || 0);
        const nowMin = (ts.hour || 0) * 60 + (ts.minute || 0);
        const appointments = vars.phoneAppointments || [];
        let meetupPassage = null;
        for (let i = 0; i < appointments.length; i++) {
            const a = appointments[i];
            if (!a || a.status !== 'pending' || !a.time || a.charId !== charId) continue;
            const aptDate = (a.time.year || 0) * 10000 + (a.time.month || 0) * 100 + (a.time.day || 0);
            if (aptDate !== currentDate) continue;
            const aptMin = (a.time.hour || 0) * 60 + (a.time.minute || 0);
            if (nowMin < aptMin || nowMin > aptMin + 30) continue;
            const locMatch = (a.location === location) || (setup.locations && setup.locations[location] && setup.locations[location].parent === a.location);
            if (!locMatch) continue;
            meetupPassage = 'Meetup'; // generic meetup passage
            break;
        }
        if (meetupPassage) {
            const returnLoc = location;
            const meetupBtn = $('<a>').addClass('btn-style action-btn available').text('Meetup')
                .attr('data-passage', meetupPassage)
                .ariaClick({ namespace: '.macros', one: true }, function () {
                    State.variables.interactingChar = charId;
                    State.variables.meetupReturnLocation = returnLoc;
                    State.variables.meetupLocation = returnLoc;
                    State.variables.location = returnLoc;
                    Engine.play(meetupPassage);
                });
            container.append(meetupBtn);
            visibleActions++;
        }

        actions.forEach(action => {
            // Swap numbers: hide if already unlocked (one-time action)
            if (action.id === 'swapNumbers') {
                const unlocked = vars.phoneContactsUnlocked || [];
                /* Source of truth is current interaction character. */
                const targetSwapCharId = charId;
                if (unlocked.includes(targetSwapCharId)) return;
            }

            // Check content tags - if any tag is disabled, hide the action
            const tagBlocked = action.tags && action.tags.some(tag => prefs[tag] === false);
            if (tagBlocked) return;

            // Check time window (if specified)
            if (action.timeWindow) {
                const ts = vars.timeSys;
                const currentHour = (ts && ts.hour != null) ? ts.hour : 0;
                const currentMinute = (ts && ts.minute != null) ? ts.minute : 0;
                const currentTimeInMinutes = (currentHour * 60) + currentMinute;

                let isInWindow = false;
                for (const window of action.timeWindow) {
                    const startMinutes = (window.startHour * 60) + (window.startMinute || 0);
                    const endMinutes = (window.endHour * 60) + (window.endMinute || 0);

                    if (currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes) {
                        isInWindow = true;
                        break;
                    }
                }

                if (!isInWindow) return; // Hide action if outside time window
            }

            // Check daily limit (if specified)
            let isDoneToday = false;
            if (action.dailyLimit) {
                vars.dailyActivityLog = vars.dailyActivityLog || {};
                const ts = vars.timeSys;
                const dateKey = ts ? `${ts.year}-${ts.month}-${ts.day}` : '0';
                const activityKey = `${charId}_${action.id}_${dateKey}`;

                if (vars.dailyActivityLog[activityKey]) {
                    isDoneToday = true;
                }
            }

            // Check requirements
            const reqs = action.requirements || {};
            let meetsReqs = true;
            let missingReqs = [];
            let missingFlagReq = false;

            for (const [req, value] of Object.entries(reqs)) {
                if (req === 'friendshipLevel' || req === 'lustLevel' || req === 'loveLevel' || req === 'trustLevel') {
                    // Level check — charStats.friendshipLevel etc.
                    if ((charStats[req] || 1) < value) {
                        meetsReqs = false;
                        const statName = req.replace('Level', '');
                        missingReqs.push(`${statName.charAt(0).toUpperCase() + statName.slice(1)} Level ${value}`);
                    }
                } else if (req === 'flag') {
                    // Flag check — value is the flag name string
                    const flags = vars.flags || {};
                    if (!flags[value]) {
                        meetsReqs = false;
                        missingFlagReq = true;
                        // Silent — flag failures are typically paired with showWhenLocked: false
                    }
                } else if (req === 'flagNot') {
                    // flagNot check — hides action when flag is true
                    const flags = vars.flags || {};
                    if (flags[value]) {
                        meetsReqs = false;
                        missingFlagReq = true;
                    }
                } else if (req === 'corruption') {
                    if ((vars.corruption || 0) < value) {
                        meetsReqs = false;
                        missingReqs.push(`Corruption ${value}`);
                    }
                } else if (req === 'willpower') {
                    if ((vars.willpower || 0) < value) {
                        meetsReqs = false;
                        missingReqs.push(`Willpower ${value}`);
                    }
                } else if (req === 'jobHoursTodayMin') {
                    const hoursToday = parseFloat(vars.jobState?.hoursToday || 0);
                    if (hoursToday < value) {
                        meetsReqs = false;
                    }
                } else if (req === 'firstWorkDayEventShown') {
                    const shown = !!(vars.jobState && vars.jobState.firstWorkDayEventShown);
                    if (value && !shown) {
                        meetsReqs = false;
                    } else if (value === false && shown) {
                        meetsReqs = false;
                    }
                } else if (req === 'promotionPending') {
                    const pending = !!(vars.jobState && vars.jobState.promotionPending);
                    if (value && !pending) {
                        meetsReqs = false;
                        const jobId = vars.job && vars.job.id ? vars.job.id : null;
                        const jobDef = (jobId && setup.jobs && setup.jobs[jobId]) ? setup.jobs[jobId] : null;
                        const currentTier = parseInt(vars.job && vars.job.tier, 10) || 1;
                        const nextTier = currentTier + 1;
                        const rule = (jobDef && jobDef.tierProgressionRules) ? jobDef.tierProgressionRules[nextTier] : null;
                        const targetHints = [];

                        const formatReqLabel = function (word) {
                            const w = String(word || '');
                            const upper = w.toUpperCase();
                            if (upper === 'XP' || upper === 'HP' || upper === 'MP') return upper;
                            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                        };

                        if (rule) {
                            const xpTarget = parseInt(rule.jobExperience || 0, 10);
                            const xpHave = parseInt(vars.jobState && vars.jobState.jobExperience, 10) || 0;
                            if (xpTarget > 0 && xpHave < xpTarget) {
                                targetHints.push(xpTarget + ' XP');
                            }

                            if (rule.stats && typeof rule.stats === 'object') {
                                Object.entries(rule.stats).forEach(function (entry) {
                                    const statKey = entry[0];
                                    const statTarget = Number(entry[1] || 0);
                                    const statHave = Number(vars[statKey] || 0);
                                    if (statTarget > 0 && statHave < statTarget) {
                                        targetHints.push(Math.round(statTarget) + ' ' + formatReqLabel(statKey));
                                    }
                                });
                            }

                            if (rule.skills && typeof rule.skills === 'object') {
                                Object.entries(rule.skills).forEach(function (entry) {
                                    const skillPath = String(entry[0] || '');
                                    const skillTarget = Number(entry[1] || 0);
                                    let node = vars.skills || {};
                                    const parts = skillPath.replace(/^skills\./, '').split('.');
                                    for (let p = 0; p < parts.length; p++) {
                                        if (!node || typeof node !== 'object') { node = null; break; }
                                        node = node[parts[p]];
                                    }
                                    const skillHave = Number(node || 0);
                                    if (skillTarget > 0 && skillHave < skillTarget) {
                                        const skillLabel = parts[parts.length - 1] || 'skill';
                                        targetHints.push(Math.round(skillTarget) + ' ' + formatReqLabel(skillLabel));
                                    }
                                });
                            }
                        }

                        if (targetHints.length) {
                            missingReqs.push(targetHints.map(function (h) { return 'Need ' + h; }).join(', '));
                        } else if (rule) {
                            missingReqs.push('Meet job XP and skill targets, then use Discuss Promotion with your manager.');
                        } else {
                            missingReqs.push('Promotion requirements not met yet');
                        }
                    } else if (value === false && pending) {
                        meetsReqs = false;
                        missingReqs.push('Complete the current promotion review first');
                    }
                } else if (req === 'promotionEligible') {
                    if (value) {
                        const el = window.getJobPromotionEligibility(vars);
                        if (!el.eligible) {
                            meetsReqs = false;
                            if (el.targetHints.length) {
                                missingReqs.push(el.targetHints.map(function (h) { return 'Need ' + h; }).join(', '));
                            } else {
                                missingReqs.push('Promotion not available for your current job or tier.');
                            }
                        }
                    }
                } else if (req === 'outfit') {
                    // Outfit requirement string format: "sporty 3"
                    const outfitReq = String(value || '').trim();
                    const parts = outfitReq.split(/\s+/);
                    const requiredStyle = parts[0] || '';
                    const minStyleItems = parseInt(parts[1], 10) || 2;
                    let styleCount = 0;

                    if (requiredStyle) {
                        const equipped = (vars.wardrobe && vars.wardrobe.equipped) ? vars.wardrobe.equipped : null;
                        if (equipped && typeof equipped === 'object') {
                            const seenItemIds = new Set();
                            Object.keys(equipped).forEach(function (slot) {
                                const itemId = equipped[slot];
                                if (!itemId || seenItemIds.has(itemId)) return;
                                seenItemIds.add(itemId);
                                const item = (typeof setup.getClothingById === 'function') ? setup.getClothingById(itemId) : null;
                                if (item && Array.isArray(item.tags) && item.tags.includes(requiredStyle)) {
                                    styleCount += 1;
                                }
                            });
                        }

                        if (styleCount < minStyleItems) {
                            meetsReqs = false;
                            missingReqs.push('You need ' + requiredStyle + ' outfit.');
                        }
                    }
                } else if (req === 'item') {
                    // Inventory item requirement, value can be "item_id" or "item_id 2"
                    const itemReq = String(value || '').trim();
                    const itemParts = itemReq.split(/\s+/);
                    const itemId = itemParts[0] || '';
                    const minQty = parseInt(itemParts[1], 10) || 1;

                    if (itemId) {
                        const inventory = Array.isArray(vars.inventory) ? vars.inventory : [];
                        let ownedQty = 0;
                        for (let i = 0; i < inventory.length; i++) {
                            const invItem = inventory[i];
                            if (invItem && invItem.id === itemId) {
                                ownedQty = parseInt(invItem.quantity, 10) || 1;
                                break;
                            }
                        }
                        if (ownedQty < minQty) {
                            meetsReqs = false;
                            missingReqs.push('You need ' + itemId.replace(/_/g, ' ') + '.');
                        }
                    }
                } else if (req === 'minStat') {
                    // Min stat requirement format: "energy 30"
                    const statReq = String(value || '').trim();
                    const statParts = statReq.split(/\s+/);
                    const statName = statParts[0] || '';
                    const minValue = parseInt(statParts[1], 10) || 0;
                    const currentValue = parseInt(vars[statName], 10) || 0;
                    if (statName && minValue > 0 && currentValue < minValue) {
                        meetsReqs = false;
                        missingReqs.push('Need ' + minValue + ' ' + statName);
                    }
                } else if (req === 'maxStat') {
                    // Max stat requirement format: "energy 50"
                    const statReq = String(value || '').trim();
                    const statParts = statReq.split(/\s+/);
                    const statName = statParts[0] || '';
                    const maxValue = parseInt(statParts[1], 10) || 0;
                    const currentValue = parseInt(vars[statName], 10) || 0;
                    if (statName && maxValue > 0 && currentValue > maxValue) {
                        meetsReqs = false;
                        missingReqs.push('Need ' + statName + ' <= ' + maxValue + ' (current: ' + currentValue + ')');
                    }
                } else {
                    // Raw stat check (legacy: friendship, lust, etc.)
                    if ((charStats[req] || 0) < value) {
                        meetsReqs = false;
                        missingReqs.push(`${req.charAt(0).toUpperCase() + req.slice(1)}: ${value}`);
                    }
                }
            }

            // Check player energy
            const minEnergy = action.minPlayerEnergy != null ? action.minPlayerEnergy : 0;
            const playerEnergy = parseInt(vars.energy || 0, 10);
            if (minEnergy > 0 && playerEnergy < minEnergy) {
                meetsReqs = false;
                missingReqs.push('Need ' + minEnergy + ' energy');
            }

            // Hide completely if locked and showWhenLocked is false
            if (!meetsReqs && action.showWhenLocked === false) return;
            // Optional: hide only when a flag-based lock is unmet (unlock gating)
            if (!meetsReqs && action.hideWhenFlagLocked === true && missingFlagReq) return;

            const lockTooltip = missingReqs.length ? missingReqs.join(', ') : '';

            // Create button
            const btn = $('<a>').addClass('btn-style action-btn');
            if (action.questButton) btn.addClass('btn-quest');

            // Check if done today first (highest priority lock)
            if (isDoneToday) {
                btn.addClass('locked')
                    .html(`<span class="icon icon-lock icon-12"></span> ${action.label}`)
                    .attr('data-tooltip', 'Already done today');
            } else if (meetsReqs) {
                const passage = action.passage;
                /* For swap action, never trust external action.charId to avoid stale/mismatched IDs. */
                const swapCharId = charId;
                btn.addClass('available')
                    .text(action.label)
                    .attr('data-passage', passage)
                    .attr('data-swap-char-id', swapCharId)
                    .ariaClick({ namespace: '.macros', one: true }, function () {
                        const id = ($(this).attr('data-swap-char-id')) || swapCharId;
                        State.variables.interactingChar = id;
                        State.variables.phoneSwapTargetCharId = id;
                        Engine.play(passage);
                    });
            } else {
                btn.addClass('locked')
                    .html(`<span class="icon icon-lock icon-12"></span> ${action.label}`)
                    .attr('data-tooltip', lockTooltip);
            }

            container.append(btn);
            visibleActions++;
        });

        if (visibleActions === 0) {
            $(this.output).append('<p class="no-actions">No actions available.</p>');
        } else {
            $(this.output).append(container);
        }
    }
});

/* ================== UI Event Handlers =================== */
function resetPassagesScroll() {
    const passages = document.getElementById('passages');
    if (passages) passages.scrollTop = 0;
}
/* When leaving a passage, seal how many advances that passage may do (so F5 re-run doesn't advance again). */
function sealQuestAdvancesForPassage() {
    const vars = State.variables;
    const passage = State.passage;
    if (!passage || !vars.questAdvancesFromPassage) return;
    if (!vars.questMaxAdvancesFromPassage) vars.questMaxAdvancesFromPassage = {};
    Object.keys(vars.questAdvancesFromPassage).forEach(function (qid) {
        const n = vars.questAdvancesFromPassage[qid][passage];
        if (n == null) return;
        if (!vars.questMaxAdvancesFromPassage[qid]) vars.questMaxAdvancesFromPassage[qid] = {};
        vars.questMaxAdvancesFromPassage[qid][passage] = n;
    });
}
$(document).on(':passageend', function () {
    sealQuestAdvancesForPassage();
    resetPassagesScroll();
    if (State && State.variables) {
        const vars = State.variables;
        /* Passage source re-runs on history back; advanceTime is skipped but other macros can still
           touch state. Restore timeSys from the snapshot taken right after Engine.backward() restored State. */
        if (vars._navigatingBackward && vars._backwardTimeSnapshot) {
            try {
                vars.timeSys = JSON.parse(JSON.stringify(vars._backwardTimeSnapshot));
            } catch (e) { /* ignore */ }
            delete vars._backwardTimeSnapshot;
        }
        vars._navigatingBackward = false;
    }
});
$(document).on(':passagestart', function () {
    resetPassagesScroll();
    requestAnimationFrame(resetPassagesScroll);
    /* After Engine.backward(), restored state replaces variables — set skip flags on the restored moment */
    if (window.__navigatingBackwardFromUI) {
        if (State && State.variables) {
            const vars = State.variables;
            vars._navigatingBackward = true;
            const t = vars.timeSys;
            if (t && typeof t === 'object') {
                try {
                    vars._backwardTimeSnapshot = JSON.parse(JSON.stringify(t));
                } catch (e) {
                    delete vars._backwardTimeSnapshot;
                }
            }
        }
        window.__navigatingBackwardFromUI = false;
    }
});

/* ================== Passage Layout =================== */
$(document).on(':passagerender', resetPassagesScroll);

/* ================== Navigation Card Handlers =================== */
/** @param {string} locationId @returns {boolean} */
window.isLocationOpen = function (locationId) {
    const hours = setup.locationHours?.[locationId];
    if (!hours) return true;
    if (hours.open24h) return true;

    const currentHour = State.variables.timeSys?.hour ?? 12;
    const { open, close } = hours;
    if (close < open) {
        return currentHour >= open || currentHour < close;
    }
    return currentHour >= open && currentHour < close;
};

/* ── Outfit Exit Rules ─────────────────────────────────────────────────────
 * Centralised thresholds for leaving zones in different states of dress.
 * 'indoor'  = moving between rooms inside the house.
 * 'outdoor' = leaving the house into a public area.
 * Add new keys (e.g. 'gym', 'workplace') as needed in the future.
 * ───────────────────────────────────────────────────────────────────────── */
setup.outfitExitRules = {
    indoor: {
        shoesRequired              : false, // no shoes needed inside
        sleepwearSexinessThreshold : 3,   // sexinessScore >= this → "sexy" sleepwear
        sleepwearSexyMinCorr       : 3,   // sexy sleepwear needs corruption ≥ this
        underwearMinCorr           : 3,   // underwear-only needs corruption ≥ this
        nakedMinCorr               : 4,   // naked needs corruption ≥ this
        nakedMinExh                : 0    // no exhibitionism requirement indoors
    },
    outdoor: {
        shoesRequired              : true,  // must have shoes equipped to go outside
        sleepwearSexinessThreshold : 3,
        sleepwearNormalMinCorr     : 2,   // non-sexy sleepwear needs corruption ≥ this
        sleepwearSexyMinCorr       : 4,
        underwearMinCorr           : 4,
        underwearMinExh            : 0,   // no exhibitionism requirement outdoors (underwear)
        nakedMinCorr               : 5,
        nakedMinExh                : 0    // no exhibitionism requirement outdoors (naked)
    }
};

window.processNavCard = function (tag, $container, passedSetup) {
    const navSetup = passedSetup || window.setup || {};

    const args = tag.args;
    let cardId = args[0];
    let displayName = args[0];
    let passageName = args[1];
    let imagePath = args[2];
    const discoveryVar = window.getDiscoveryKey ? window.getDiscoveryKey(cardId) : ('discovered' + cardId.charAt(0).toUpperCase() + cardId.slice(1));
    if (State.variables[discoveryVar] === false) {
        return;
    }
    if (navSetup.navCards && navSetup.navCards[cardId]) {
        const dbCard = navSetup.navCards[cardId];
        displayName = args[1] || dbCard.name;
        passageName = dbCard.passage || cardId;
        imagePath = args[2] || null;
    } else {
        if (args.length >= 2) {
            displayName = args[0];
            passageName = args[1];
            imagePath = args[2];
        } else {
            // Fallback: Arg 0 is Passage Name
            passageName = args[0];
        }
    }
    if (!imagePath) {
        const locationImages = setup.locationImages || {};
        if (locationImages[cardId]) {
            imagePath = locationImages[cardId];
        } else if (navSetup.navCards && navSetup.navCards[cardId] && navSetup.navCards[cardId].image) {
            imagePath = navSetup.navCards[cardId].image;
        }
    }
    if (!imagePath) imagePath = "assets/system/images/placeholder_nav.png";

    /* args[3] = lock message   → card is blocked, greyed out, not clickable */
    /* args[4] = confirm message → card looks normal but asks "are you sure?" before navigating */
    let lockMessage    = (args[3] && typeof args[3] === 'string' && args[3].trim()) ? args[3].trim() : '';
    let confirmMessage = (args[4] && typeof args[4] === 'string' && args[4].trim()) ? args[4].trim() : '';

    /* Auto outfit gate: if navCard has outfitContext defined in setup.navCards,
       run the widget in place and read its output from State.temporary */
    if (!lockMessage && !confirmMessage) {
        const dbCard = navSetup.navCards && navSetup.navCards[cardId];
        const outfitCtx = dbCard && dbCard.outfitContext;
        if (outfitCtx) {
            $.wiki(`<<outfitGateLockCheck "${outfitCtx}">>`);
            lockMessage    = (State.temporary.outfitLockMsg    || '').trim();
            confirmMessage = (State.temporary.outfitConfirmMsg || '').trim();
        }
    }

    if (lockMessage) {
        const $locked = $(`
            <div class="nav-card location-closed" data-tooltip="${lockMessage}" style="cursor:not-allowed;">
                <img src="${imagePath}" class="card-bg">
                <div class="gradient-overlay"></div>
                <div class="nav-card-name"><span class="icon icon-lock icon-12"></span> ${displayName}</div>
            </div>
        `);
        $container.append($locked);
        return;
    }

    const hours = setup.locationHours?.[cardId];
    const hasHours = !!hours;
    const isOpen = window.isLocationOpen(cardId);
    let statusBadge = '';
    if (hasHours) {
        const statusClass = isOpen ? 'status-open' : 'status-closed';
        const statusText = isOpen ? 'Open' : 'Closed';
        statusBadge = `<div class="nav-card-status ${statusClass}">${statusText}</div>`;
    }
    const $card = $(`
        <div class="nav-card ${hasHours && !isOpen ? 'location-closed' : ''}">
            <img src="${imagePath}" class="card-bg">
            <div class="gradient-overlay"></div>
            ${statusBadge}
            <div class="nav-card-name">${displayName}</div>
        </div>
    `);
    $card.on('click', function () {
        if (hasHours && !isOpen) {
            const openHour = hours.open?.toString().padStart(2, '0') || '??';
            if (window.showNotification) {
                window.showNotification({
                    type: 'warning',
                    message: `${displayName} is closed. Opens at ${openHour}:00`
                });
            }
            return;
        }

        /* Outfit confirmation gate — show Yes/No before navigating */
        if (confirmMessage && window.showNotification) {
            window.showNotification({
                type: 'warning',
                message: confirmMessage,
                actions: [
                    {
                        label: 'Yes, leave',
                        passage: passageName
                    },
                    {
                        label: 'Cancel',
                        fn: function () { /* just closes */ }
                    }
                ]
            });
            return;
        }

        if (passageName) {
            // Run setBefore (e.g. mall bathroom: set return floor before going to bathroom - avoids gate in history)
            const dbCard = navSetup.navCards && navSetup.navCards[cardId];
            if (dbCard && dbCard.setBefore) {
                $.wiki('<<set ' + dbCard.setBefore + '>>');
            }

            // Calculate travel time
            const currentLocation = State.variables.location || '';
            const travelTime = setup.getTravelTime ? setup.getTravelTime(currentLocation, cardId) : 0;

            // Apply travel time via advanceTime macro
            if (travelTime > 0 && typeof Macro !== 'undefined' && Macro.get('advanceTime')) {
                $.wiki('<<advanceTime ' + travelTime + '>>');
            }

            // Heels skill: accumulate travel minutes when wearing heels (60 min = +1 skill, capped by shoe tier)
            if (travelTime > 0 && typeof Macro !== 'undefined' && Macro.get('addHeelsTravelMinutes')) {
                $.wiki('<<addHeelsTravelMinutes ' + travelTime + '>>');
            }

            // Street attention ambient check (cooldown + settings gated in widget)
            if (travelTime > 0 && typeof Macro !== 'undefined' && Macro.get('runStreetAttentionCheck')) {
                $.wiki('<<runStreetAttentionCheck>>');
            }

            /* Flush pending notifications before navigating */
            if (Macro.has('flushNotifications')) {
                $.wiki('<<flushNotifications>>');
            }

            /* Ensure stats are fresh before rendering new passage */
            if (Macro.has('recalculateStats')) {
                $.wiki('<<recalculateStats>>');
            }

            Engine.play(passageName);
        }
    });

    $container.append($card);
};


Macro.add('navMenu', {
    tags: ['navCard'],
    handler: function () {
        if (window.isQuestScenePassage(State.passage)) {
            return;
        }
        $('body').addClass('has-navmenu');

        const payload = this.payload;

        // Create Accordion Container
        // We keep 'nav-breakout' class for whatever CSS styling it provides (margins etc)
        // but now it lives inside the passage flow.
        const $container = $('<div class="accordion-container nav-breakout"></div>');

        // Process child tags (<<navCard>>)
        payload.forEach(tag => {
            if (tag.name === 'navCard') {
                if (window.processNavCard) {
                    window.processNavCard(tag, $container, setup);
                }
            }
        });

        const __layoutMode = window.navCardLayoutMode();
        const __isVertical = __layoutMode === 'vertical';
        /* Skip horizontal static-strip class in vertical mode — vertical defines its own layout */
        $container.toggleClass('nav-accordion-static', !window.navCardAnimationsEnabled() && !__isVertical);
        $container.toggleClass('nav-layout-vertical', __isVertical);
        $container.toggleClass('nav-layout-horizontal', !__isVertical);

        // Create a wrapper for the container to handle positioning
        const $wrapper = $('<div class="navmenu-wrapper" style="opacity: 0;"></div>');
        $wrapper.append($container);

        // Append to output (INSIDE the passage, as requested)
        $(this.output).append($wrapper);

        if (typeof window.syncNavCardMotionClass === 'function') {
            window.syncNavCardMotionClass();
        }
        if (typeof window.syncNavCardLayoutClass === 'function') {
            window.syncNavCardLayoutClass();
        }

        // Position/Size function - Calculates breakout metrics
        const positionNavMenu = () => {
            // Safety check
            if (!$wrapper[0].isConnected) return;

            const __vMode = window.navCardLayoutMode();
            const __vIsVertical = __vMode === 'vertical';
            $container.toggleClass('nav-accordion-static', !window.navCardAnimationsEnabled() && !__vIsVertical);
            $container.toggleClass('nav-layout-vertical', __vIsVertical);
            $container.toggleClass('nav-layout-horizontal', !__vIsVertical);

            // FORCE BREAKOUT: Explicitly unconstrain ALL parent containers
            // Hierarchy: #story > #passages > .passage > .navmenu-wrapper
            // Use overflow-x: visible for horizontal breakout, preserve overflow-y for scrolling
            const $passage = $wrapper.closest('.passage');
            if ($passage.length) {
                $passage.css({ 'max-width': 'none', 'width': '100%', 'overflow-x': 'visible' });
            }
            const $passages = $wrapper.closest('#passages');
            if ($passages.length) {
                $passages.css({ 'max-width': 'none', 'width': '100%', 'overflow-x': 'visible' });
            }
            const $story = $wrapper.closest('#story');
            if ($story.length) {
                $story.css({ 'max-width': 'none', 'width': '100%', 'overflow-x': 'visible' });
            }

            // Get rightbar width
            const rightbar = document.querySelector('.right-bar');
            let rightbarWidth = 0;
            if (rightbar && getComputedStyle(rightbar).display !== 'none') {
                rightbarWidth = rightbar.offsetWidth;
            } else {
                const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--rightbar-width');
                if (cssVar) rightbarWidth = parseInt(cssVar) || 0;
            }

            // Available width (Screen - Rightbar)
            const availableWidth = window.innerWidth - rightbarWidth;

            // Apply breakout styles (no margin-left offset; wrapper stays in content flow)
            $wrapper.css({
                'margin-left': '0',
                'width': `${availableWidth}px`,
                'max-width': 'none',
                'opacity': '1', // Show after calculation
                'z-index': '10' // Below btnPicker (99999) to ensure dropdown visibility
            });

            $container.css({
                'width': '100%',
                'overflow': 'hidden',
                'background': 'transparent',
                'border': 'none',
                'box-shadow': 'none',
                'border-radius': '12px',
                'z-index': '1' // Relative to wrapper
            });
            $container.find('.nav-card').first().css({
                'border-top-left-radius': '12px',
                'border-bottom-left-radius': '12px'
            });
            $container.find('.nav-card').last().css({
                'border-top-right-radius': '12px',
                'border-bottom-right-radius': '12px'
            });
        };
        setTimeout(positionNavMenu, 10);
        setTimeout(positionNavMenu, 100);
        setTimeout(positionNavMenu, 350);
        const resizeHandler = () => requestAnimationFrame(positionNavMenu);
        window.addEventListener('resize', resizeHandler);
        const observer = new MutationObserver(positionNavMenu);
        const rightbarEl = document.querySelector('.right-bar');
        if (rightbarEl) observer.observe(rightbarEl, { attributes: true, attributeFilter: ['style', 'class'] });
        $(document).one(':passagestart', () => {
            window.removeEventListener('resize', resizeHandler);
            observer.disconnect();
            $('body').removeClass('has-navmenu');
        });
    }
});


/* ================== NOTIFICATION MACRO =================== */
Macro.add('notify', {
    handler: function () {
        if (this.args.length < 2) {
            return this.error('notify macro requires type and message');
        }

        const type = this.args[0]; // success, error, warning, info
        const message = this.args[1];
        const duration = this.args[2] || 3000;

        if (window.showNotification) {
            window.showNotification({
                type: type,
                message: message,
                duration: duration
            });
        }
    }
});

/* DOM-based include */
Macro.add('domInclude', {
    handler: function () {
        if (this.args.length === 0) {
            return this.error('domInclude requires a passage name');
        }

        var passageName = this.args[0];
        var el = document.querySelector('tw-passagedata[name="' + passageName + '"]');

        if (!el) {
            return this.error('passage "' + passageName + '" does not exist');
        }

        var content = el.textContent;
        if (content && content.trim()) {
            new Wikifier(this.output, content);
        }
    }
});