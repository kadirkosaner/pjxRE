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
        Macro: Macro
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
                console.log(`[Loader] Initializing: ${initFn}`);
                window[initFn](API);
            }
        });
        console.log("[Loader] All modules loaded and initialized.");
        if (typeof Engine !== 'undefined' && typeof Engine.show === 'function') {
            setTimeout(() => Engine.show(), 50);
        }
        $(document).trigger(':passagerender');
        if (typeof UIBar !== 'undefined') UIBar.destroy();
        $('#ui-bar').remove();
        $(document.head).find('#style-ui-bar').remove();

    } catch (error) {
        console.error("[Loader] Error:", error);
    }
});

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
    if (State.passage.startsWith('quest_') || tags().includes('hide-nav')) {
        $('body').addClass('hide-nav');
    } else {
        $('body').removeClass('hide-nav');
    }
    if (!State.passage.startsWith('quest_') && State.variables.pendingQuestPrompts?.length > 0) {
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
            if (!vars[flag]) missing.push({ type: 'flag', name: flag });
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

/* -------------------- QUEST LEGACY SUPPORT -------------------- */
$(document).on(':passagerender', function () {
    if (Macro.has("questCheck")) $.wiki("<<questCheck>>");
    $.wiki("<<updateTimedEvents>>");
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
            vars.questState = { active: {}, completed: [], failed: [], daily: {} };
        }
        if (vars.questState.active[qid]) {
            console.log(`[Quest V2] Quest "${qid}" already active`);
            return;
        }
        if (vars.questState.completed.includes(qid)) {
            console.log(`[Quest V2] Quest "${qid}" already completed`);
            return;
        }
        const reqResult = checkQuestRequirements(quest.requirements, vars);
        if (!reqResult.met) {
            console.log(`[Quest V2] Cannot start "${qid}" - missing requirements:`, reqResult.missing);
            return;
        }
        vars.questState.active[qid] = {
            stage: 0,
            objectives: {},
            triggeredStage: -1,
            startDate: `${vars.timeSys?.day || 1}/${vars.timeSys?.month || 1}/${vars.timeSys?.year || 2025}`
        };
        if (window.showNotification) {
            window.showNotification({
                type: 'quest',
                message: `New Quest: ${quest.title}`,
                duration: 4000,
                position: 'rightbar-left'
            });
        }

        console.log(`[Quest V2] Started: ${quest.title}`);
    }
});

/* -------------------- ADVANCE QUEST STAGE MACRO -------------------- */
Macro.add('advanceQuestStage', {
    handler: function () {
        const qid = this.args[0];
        if (!qid) return this.error('advanceQuestStage requires quest ID');

        const vars = State.variables;
        const state = vars.questState?.active?.[qid];
        const quest = setup.quests?.[qid];

        if (!state || !quest) {
            console.log(`[Quest V2] Cannot advance - quest "${qid}" not found or not active`);
            return;
        }

        state.stage++;
        state.objectives = {};
        state.triggeredStage = -1;
        console.log(`[Quest V2] Advanced "${qid}" to stage ${state.stage}`);
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

        console.log(`[Quest V2] Completed objective "${objId}" for quest "${qid}"`);
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
        if (!vars.questState.completed) vars.questState.completed = [];
        vars.questState.completed.push(qid);
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

        console.log(`[Quest V2] Completed: ${quest.title}`);
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
/* Usage: <<btn "Text" "passage" "style">> or <<btn "Text" "passage" "style" minEnergy>> */
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
        const locked = minEnergy > 0 && energy < minEnergy;

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
            .text(text)
            .appendTo(this.output);

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
        });
    }
});

/* ================== btnPicker Macro =================== */
/* Usage: <<btnPicker "Text" "passage" "presetName">> or add 4th style, 5th minEnergy. Presets in DurationPresets.twee */
Macro.add('btnPicker', {
    handler: function () {
        if (this.args.length < 3) {
            return this.error('btnPicker requires: text, passage, presetName');
        }

        const text = this.args[0];
        const passage = this.args[1];
        const presetName = this.args[2];
        const style = this.args[3] ? this.args[3].toLowerCase() : 'default';
        const minEnergy = this.args[4] !== undefined ? parseInt(this.args[4], 10) : 0;

        const energy = parseInt(State.variables.energy || 0, 10);
        const locked = minEnergy > 0 && energy < minEnergy;

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

        console.log('[ButtonStyles] Generated button classes:', colorVars.map(v => '.btn-' + v.replace('--color-', '')));
    };

    // Wait for CSS to fully load
    setTimeout(generateButtonStyles, 100);
});

/* ================== WARDROBE MACRO =================== */
Macro.add('wardrobe', {
    handler: function () {
        const output = this.output;

        // Direct access if already loaded
        if (window.wardrobeModule?.macroHandler) {
            window.wardrobeModule.macroHandler(output);
            return;
        }

        // Async wait/retry mechanism
        // We MUST create a placeholder in the DOM because 'this.output' is a DocumentFragment 
        // that becomes invalid/empty after the macro returns.
        const $anchor = $('<div class="wardrobe-anchor"><div class="system-loader">Loading Wardrobe System...</div></div>');
        $(output).append($anchor);

        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max

        console.log('[Wardrobe Macro] Starting wait loop with Anchor strategy...');

        const checkInterval = setInterval(() => {
            attempts++;
            if (window.wardrobeModule && window.wardrobeModule.macroHandler) {
                console.log('[Wardrobe Macro] Module found!', window.wardrobeModule);
                clearInterval(checkInterval);

                // Clear loader
                $anchor.empty();

                try {
                    // Pass the ANCHOR element, not the original output fragment
                    window.wardrobeModule.macroHandler($anchor);
                    console.log('[Wardrobe Macro] Handler executed on Anchor.');
                } catch (e) {
                    console.error('[Wardrobe Macro] Handler CRASH:', e);
                    $anchor.html('<div class="error-view">Wardrobe crashed: ' + e.message + '</div>');
                }
            } else if (attempts >= maxAttempts) {
                console.error('[Wardrobe Macro] Timeout waiting for module.');
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
                    console.error('[Shop Macro] Handler CRASH:', e);
                    $anchor.html('<div class="error-view">Shop crashed: ' + e.message + '</div>');
                }
            } else if (attempts >= maxAttempts) {
                console.error('[Shop Macro] Timeout waiting for module.');
                clearInterval(checkInterval);
                $anchor.html('<div class="error-msg">Error: Shop module failed to load. Please refresh.</div>');
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
        const character = vars.characters?.[charId];

        if (!character) {
            return this.error(`Character "${charId}" not found in $characters`);
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
            .prop('loop', globalLoop)
            .prop('controls', controls)
            .css({
                'width': '100%',
                'display': 'block',
                'cursor': 'pointer'
            })
            .appendTo(container);

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

        // Add Play Overlay
        const overlay = $('<div>')
            .addClass('play-overlay')
            .append($('<div>').addClass('video-play-btn').append($('<span>').addClass('icon icon-play')))
            .appendTo(container);

        video.attr('playsinline', '');

        // Click to play/pause
        container.on('click', function () {
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
        if (globalAutoplay) {
            const playPromise = video[0].play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("[Video] Autoplay blocked, showing play overlay.");
                    overlay.removeClass('hidden');
                });
            }
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

        if (actions.length === 0) {
            $(this.output).append('<p class="no-actions">No actions available here.</p>');
            return;
        }

        const container = $('<div>').addClass('location-actions');
        let visibleActions = 0;

        actions.forEach(action => {
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

            // Check stat requirements (character stats)
            const reqs = action.requirements || {};
            let meetsReqs = true;
            let missingReqs = [];

            for (const [stat, value] of Object.entries(reqs)) {
                if ((charStats[stat] || 0) < value) {
                    meetsReqs = false;
                    missingReqs.push(`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`);
                }
            }

            // Check player energy (e.g. Talk costs 5)
            const minEnergy = action.minPlayerEnergy != null ? action.minPlayerEnergy : 0;
            const playerEnergy = parseInt(vars.energy || 0, 10);
            if (minEnergy > 0 && playerEnergy < minEnergy) {
                meetsReqs = false;
                missingReqs.push('Need ' + minEnergy + ' energy');
            }

            const lockTooltip = missingReqs.length === 1 && missingReqs[0].startsWith('Need ') && missingReqs[0].endsWith(' energy')
                ? missingReqs[0]
                : (missingReqs.length ? 'Requires: ' + missingReqs.join(', ') : '');

            // Create button
            const btn = $('<a>').addClass('btn-style action-btn');

            // Check if done today first (highest priority lock)
            if (isDoneToday) {
                btn.addClass('locked')
                    .html(`<span class="icon icon-lock icon-12"></span> ${action.label}`)
                    .attr('data-tooltip', 'Already done today');
            } else if (meetsReqs) {
                btn.addClass('available')
                    .text(action.label)
                    .attr('data-passage', action.passage)
                    .ariaClick({ namespace: '.macros', one: true }, function () {
                        Engine.play(action.passage);
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
$(document).on(':passageend', resetPassagesScroll);
$(document).on(':passagestart', function () {
    resetPassagesScroll();
    requestAnimationFrame(resetPassagesScroll);
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

window.processNavCard = function (tag, $container, passedSetup) {
    const navSetup = passedSetup || window.setup || {};

    const args = tag.args;
    let cardId = args[0];
    let displayName = args[0];
    let passageName = args[1];
    let imagePath = args[2];
    const capitalizedId = cardId.charAt(0).toUpperCase() + cardId.slice(1);
    const discoveryVar = 'discovered' + capitalizedId;
    if (State.variables[discoveryVar] === false) {
        console.log(`[Navigation] Card "${cardId}" hidden (${discoveryVar} = false)`);
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

        if (passageName) {
            // Calculate travel time
            const currentLocation = State.variables.location || '';
            const travelTime = setup.getTravelTime ? setup.getTravelTime(currentLocation, cardId) : 0;

            // Apply travel time via advanceTime macro
            if (travelTime > 0 && typeof Macro !== 'undefined' && Macro.get('advanceTime')) {
                $.wiki('<<advanceTime ' + travelTime + '>>');
            }

            Engine.play(passageName);
        } else {
            console.error("[Navigation] No passage defined for:", displayName);
        }
    });

    $container.append($card);
};


Macro.add('navMenu', {
    tags: ['navCard'],
    handler: function () {
        if (State.passage.startsWith('quest_')) {
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
                } else {
                    console.error('[Navigation] processNavCard helper not found!');
                }
            }
        });

        // Create a wrapper for the container to handle positioning
        const $wrapper = $('<div class="navmenu-wrapper" style="opacity: 0;"></div>');
        $wrapper.append($container);

        // Append to output (INSIDE the passage, as requested)
        $(this.output).append($wrapper);

        // Position/Size function - Calculates breakout metrics
        const positionNavMenu = () => {
            // Safety check
            if (!$wrapper[0].isConnected) return;

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