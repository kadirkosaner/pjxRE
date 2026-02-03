/* ================== External Loader =================== */
$(document).one(':storyready', async function () {
    // Helper functions
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

    // Convert module name to Init function name
    // 'tooltip' -> 'TooltipInit'
    function getInitFunctionName(moduleName) {
        return moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Init';
    }

    // API object
    const API = {
        State: State,
        Engine: Engine,
        Window: Window,
        Dialog: Dialog,
        Save: Save,

        // Load CSS - MODULAR STRUCTURE
        // All styles are now split into modular files

        Config: Config,
        $: $,
        setup: setup,
        Macro: Macro
    };

    try {
        // Load config first to get module definitions
        await loadJS("assets/system/config.js");

        // Load CSS - MODULAR STRUCTURE
        // All styles are now split into modular files

        const cssBase = "assets/system/css/";

        // Base - Variables, reset (MUST load first)
        for (const module of window.SystemCSS.base) {
            try { await loadCSS(`${cssBase}base/${module}.css`); } catch (e) { }
        }

        // Layout - Structure, topbar, rightbar
        for (const module of window.SystemCSS.layout) {
            try { await loadCSS(`${cssBase}layout/${module}.css`); } catch (e) { }
        }

        // UI - Buttons, modals, tabs, forms
        for (const module of window.SystemCSS.ui) {
            try { await loadCSS(`${cssBase}ui/${module}.css`); } catch (e) { }
        }

        // Screens - Welcome, startscreen, gamesetup
        for (const module of window.SystemCSS.screens) {
            try { await loadCSS(`${cssBase}screens/${module}.css`); } catch (e) { }
        }

        // Systems - Phone, map, wardrobe, relations, etc.
        for (const module of window.SystemCSS.systems) {
            try { await loadCSS(`${cssBase}systems/${module}.css`); } catch (e) { }
        }

        // Utils - Notifications, tooltips, animations (load last)
        for (const module of window.SystemCSS.utils) {
            try { await loadCSS(`${cssBase}utils/${module}.css`); } catch (e) { }
        }

        // Collect all module names for auto-init
        const allModules = [];

        // Load utils first (base systems)
        for (const module of window.SystemModules.utils) {
            await loadJS(`assets/system/js/utils/${module}.js`);
            allModules.push(module);
        }

        // Load UI modules
        for (const module of window.SystemModules.ui) {
            await loadJS(`assets/system/js/ui/${module}.js`);
            allModules.push(module);
        }

        // Load modal modules
        for (const module of window.SystemModules.modal) {
            await loadJS(`assets/system/js/modal/${module}.js`);
            allModules.push(module);
        }

        // Load system modules
        for (const module of window.SystemModules.system) {
            await loadJS(`assets/system/js/system/${module}.js`);
            allModules.push(module);
        }

        // Auto-initialize all modules
        allModules.forEach(moduleName => {
            const initFn = getInitFunctionName(moduleName);
            if (window[initFn]) {
                console.log(`[Loader] Initializing: ${initFn}`);
                window[initFn](API);
            }
        });

        // Monitor loading state
        console.log("[Loader] All modules loaded and initialized.");

        // Force re-render of the current passage now that macros are available
        // This fixes the race condition where passage renders before external JS loads
        if (typeof Engine !== 'undefined' && typeof Engine.show === 'function') {
            setTimeout(() => Engine.show(), 50);
        }

        // Trigger initial render event listeners
        $(document).trigger(':passagerender');

        // Destroy UIBar completely - remove element and CSS
        if (typeof UIBar !== 'undefined') UIBar.destroy();
        $('#ui-bar').remove();
        $(document.head).find('#style-ui-bar').remove();

        // Ortalama artık CSS ile yapılıyor (layout.js + structure.css)
        // #passages zaten right: var(--rightbar-width) ile rightbar için yer bırakıyor
    } catch (error) {
        console.error("[Loader] Error:", error);
    }
});

/* ================== Fullscreen Layout Detection =================== */
// When topbar and rightbar are hidden, center the page content
$(document).on(':passagerender', function () {
    const vars = State.variables;

    // Check if both topbar content and rightbar are hidden
    const topbarHidden = vars.hideTopbar === true ||
        (vars.hideTopbarNav === true && vars.hideTopbarTimebox === true && vars.hideTopbarNotifications === true);
    const rightbarHidden = vars.hideRightbar === true;

    // Fullscreen Layout
    if (topbarHidden && rightbarHidden) {
        $('body').addClass('fullscreen-layout');
    } else {
        $('body').removeClass('fullscreen-layout');
    }

    // Auto-suppress Navigation in Quest Scenes or Explicit Tag
    if (State.passage.startsWith('quest_') || tags().includes('hide-nav')) {
        $('body').addClass('hide-nav');
    } else {
        $('body').removeClass('hide-nav');
    }

    // Auto-inject Quest Prompts if any are pending
    // Only inject in non-quest passages (quest scenes handle their own flow)
    if (!State.passage.startsWith('quest_') && State.variables.pendingQuestPrompts?.length > 0) {
        const $passage = $('#passages .passage');

        // Try to inject after .narrative, otherwise at the end before .btn-center
        const $narrative = $passage.find('.narrative').last();
        const $btnCenter = $passage.find('.btn-center').first();

        if ($narrative.length) {
            // Inject after the last narrative block
            const promptHtml = $('<div class="quest-prompts-inject"></div>');
            $.wiki('<<questPrompts>>');
            $narrative.after($('.quest-prompts-container').detach());
        } else if ($btnCenter.length) {
            // Inject before button container
            $.wiki('<<questPrompts>>');
            $btnCenter.before($('.quest-prompts-container').detach());
        } else {
            // Fallback: append to passage
            $.wiki('<<questPrompts>>');
            $passage.append($('.quest-prompts-container').detach());
        }
    }
});
/* ================== QUEST SYSTEM V2 =================== */
// Complete quest management with automatic triggers, cinematic scenes, and rewards

// Helper: Get current time period
function getQuestPeriod(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

// Helper: Check if all trigger conditions are met
function checkQuestTriggers(triggers, vars, currentLoc, currentHour, currentPeriod) {
    if (!triggers) return { met: true, blocking: null };

    // Location check
    if (triggers.location && triggers.location !== currentLoc) {
        return { met: false, blocking: 'location' };
    }

    // Time period check
    if (triggers.time?.period && triggers.time.period !== currentPeriod) {
        return { met: false, blocking: 'time' };
    }

    // Hour range check
    if (triggers.time?.hour) {
        const [minH, maxH] = triggers.time.hour;
        if (currentHour < minH || currentHour >= maxH) {
            return { met: false, blocking: 'time' };
        }
    }

    // Character presence check
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

    // Flag check
    if (triggers.flag && !vars[triggers.flag]) {
        return { met: false, blocking: 'flag' };
    }

    return { met: true, blocking: null };
}

// Helper: Check quest requirements (stats, relationships, flags, quests)
function checkQuestRequirements(reqs, vars) {
    if (!reqs) return { met: true, missing: [] };

    const missing = [];

    // Flag requirements
    if (reqs.flags) {
        for (const flag of reqs.flags) {
            if (!vars[flag]) missing.push({ type: 'flag', name: flag });
        }
    }

    // Quest requirements
    if (reqs.quests) {
        for (const qid of reqs.quests) {
            if (!vars.questState?.completed?.includes(qid)) {
                missing.push({ type: 'quest', name: qid });
            }
        }
    }

    // Relationship requirements
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

    // Stat requirements
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
// Legacy support for old questCheck widget (if exists)
$(document).on(':passagerender', function () {
    if (Macro.has("questCheck")) {
        $.wiki("<<questCheck>>");
    }
    // Update Time Event icons (automatic check on every passage load)
    $.wiki("<<updateTimedEvents>>");
});

/* -------------------- QUEST PROMPTS WIDGET -------------------- */
// Renders quest prompts by checking triggers dynamically when macro is called
// Usage: <<questPrompts>>              - shows location-only prompts
//        <<questPrompts "charId">>     - shows prompts for specific character
Macro.add('questPrompts', {
    handler: function () {
        const vars = State.variables;
        const charFilter = this.args[0] || null;  // Optional character ID

        // Get current context
        const currentLoc = vars.location || '';
        const currentHour = vars.timeSys?.hour || 12;
        const currentPeriod = getQuestPeriod(currentHour);

        // Collect matching prompts
        const prompts = [];

        // Check if we have active quests
        if (!vars.questState?.active || !setup.quests) return;

        for (const [qid, state] of Object.entries(vars.questState.active)) {
            const quest = setup.quests[qid];
            if (!quest || !quest.stages) continue;

            const stage = quest.stages[state.stage];
            if (!stage || !stage.forceScene || !stage.passage) continue;

            // Skip if already triggered this stage
            if (state.triggeredStage === state.stage) continue;


            // Check trigger conditions
            const triggerResult = checkQuestTriggers(
                stage.triggers, vars, currentLoc, currentHour, currentPeriod
            );

            if (!triggerResult.met) continue;

            // Check requirements
            const reqResult = checkQuestRequirements(stage.requirements, vars);
            if (!reqResult.met) continue;

            // ===== MEAL TIME VALIDATION =====
            // If quest has mealType, only show during that meal time
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

            // Determine trigger type
            const triggerChar = stage.triggers?.character?.id || null;
            const triggerType = triggerChar ? 'character' : 'location';

            // Filter based on context
            if (charFilter) {
                // Character context: show only prompts for this character
                if (triggerChar !== charFilter) continue;
            } else {
                // Location context: show only location-based prompts
                if (triggerType !== 'location') continue;
            }

            prompts.push({
                questId: qid,
                stageId: stage.id,
                buttonText: stage.buttonText || stage.title,
                passage: stage.passage
            });
        }

        if (prompts.length === 0) return;

        const container = $('<div>').addClass('location-actions');

        prompts.forEach(prompt => {
            // Create button using quest style
            const btn = $('<a>')
                .addClass('link-internal btn-style action-btn btn-quest')
                .attr('data-passage', prompt.passage)
                .text(prompt.buttonText)
                .ariaClick({ namespace: '.quest-prompt', one: true }, function () {
                    // Mark this stage as triggered
                    if (vars.questState?.active?.[prompt.questId]) {
                        vars.questState.active[prompt.questId].triggeredStage =
                            vars.questState.active[prompt.questId].stage;
                    }
                    Engine.play(prompt.passage);
                });

            container.append(btn);
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

        // Initialize questState if needed
        if (!vars.questState) {
            vars.questState = { active: {}, completed: [], failed: [], daily: {} };
        }

        // Already active or completed?
        if (vars.questState.active[qid]) {
            console.log(`[Quest V2] Quest "${qid}" already active`);
            return;
        }
        if (vars.questState.completed.includes(qid)) {
            console.log(`[Quest V2] Quest "${qid}" already completed`);
            return;
        }

        // Check requirements
        const reqResult = checkQuestRequirements(quest.requirements, vars);
        if (!reqResult.met) {
            console.log(`[Quest V2] Cannot start "${qid}" - missing requirements:`, reqResult.missing);
            return;
        }

        // Start the quest
        vars.questState.active[qid] = {
            stage: 0,
            objectives: {},
            triggeredStage: -1,
            startDate: `${vars.timeSys?.day || 1}/${vars.timeSys?.month || 1}/${vars.timeSys?.year || 2025}`
        };

        // Show notification
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
        state.triggeredStage = -1; // Reset trigger flag for new stage

        console.log(`[Quest V2] Advanced "${qid}" to stage ${state.stage}`);

        // Check if quest complete
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

        // Already completed?
        if (state.objectives[objId]) return;

        // Mark objective complete
        state.objectives[objId] = true;

        // Find objective text
        const obj = stage.objectives.find(o => o.id === objId);
        if (obj && window.showNotification) {
            window.showNotification({
                type: 'success',
                message: `✓ ${obj.text}`,
                duration: 2500
            });
        }

        console.log(`[Quest V2] Completed objective "${objId}" for quest "${qid}"`);

        // Check stage completion
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

        // Remove from active
        delete vars.questState.active[qid];

        // Add to completed
        if (!vars.questState.completed) vars.questState.completed = [];
        vars.questState.completed.push(qid);

        // Apply rewards
        const rewards = quest.onComplete;
        if (rewards) {
            // Relationship rewards
            if (rewards.relationships) {
                for (const [charId, gains] of Object.entries(rewards.relationships)) {
                    if (!vars.characters?.[charId]) continue;
                    for (const [stat, value] of Object.entries(gains)) {
                        vars.characters[charId].stats[stat] =
                            (vars.characters[charId].stats[stat] || 0) + value;
                    }
                }
            }

            // Stat rewards
            if (rewards.stats) {
                for (const [stat, value] of Object.entries(rewards.stats)) {
                    vars.player[stat] = (vars.player[stat] || 0) + value;
                }
                if (Macro.has('recalculateStats')) {
                    $.wiki('<<recalculateStats>>');
                }
            }

            // Money
            if (rewards.money) {
                vars.money = (vars.money || 0) + rewards.money;
            }

            // Flags
            if (rewards.flags) {
                for (const flag of rewards.flags) {
                    vars[flag] = true;
                }
            }

            // Notification
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

/* ================== Custom Link Macro =================== */
/* Usage: <<btn "Text" "passage" "style">>optional code<</btn>> */
Macro.add('btn', {
    tags: null,  // Makes this a container macro
    handler: function () {
        if (this.args.length < 1) {
            return this.error('btn macro requires at least 1 argument: text');
        }

        const text = this.args[0];
        const passage = this.args[1]; // Optional
        const style = this.args[2] ? this.args[2].toLowerCase() : 'default';
        const payload = this.payload[0].contents;  // Code inside the macro

        const link = $('<a>')
            .addClass('link-internal')
            .addClass('btn-style')
            .attr('tabindex', '0')
            .text(text)
            .appendTo(this.output);

        if (style.includes(' ')) {
            link.addClass(style); // Add raw classes: "btn-default action-btn"
        } else {
            link.addClass('btn-' + style); // Add prefixed class: "btn-default"
        }

        if (passage) {
            link.attr('data-passage', passage);
        }

        link.ariaClick({
            namespace: '.macros',
            one: true
        }, function () {
            // Run any code inside the macro first
            if (payload.trim()) {
                $.wiki(payload);
            }
            // Then navigate if passage specified
            if (passage) {
                Engine.play(passage);
            }
        });
    }
});

/* ================== Picker Button Macro =================== */
// Duration presets are defined in System/Base/DurationPresets[INIT].twee
// Usage: <<btnPicker "Watch TV" "watchTV" "tvDuration">>
Macro.add('btnPicker', {
    handler: function () {
        if (this.args.length < 3) {
            return this.error('btnPicker requires: text, passage, presetName');
        }

        const text = this.args[0];
        const passage = this.args[1];
        const presetName = this.args[2];
        const style = this.args[3] ? this.args[3].toLowerCase() : 'default';

        const preset = setup.durationPresets[presetName];
        if (!preset) {
            return this.error(`Preset "${presetName}" not found in setup.durationPresets`);
        }

        // Get or initialize remembered selection
        if (!State.variables.pickerMemory) {
            State.variables.pickerMemory = {};
        }

        // Default to first option if not remembered
        const remembered = State.variables.pickerMemory[presetName];
        let selectedValue = remembered !== undefined ? remembered : preset[0].value;

        // Find label for selected value
        const getLabel = (val) => {
            const found = preset.find(p => p.value === val);
            return found ? found.label : preset[0].label;
        };

        // Create wrapper
        const wrapper = $('<div>')
            .addClass('btn-picker-split')
            .appendTo(this.output);

        // Create main button (clickable, goes to passage)
        const btn = $('<a>')
            .addClass('link-internal btn-style btn-' + style + ' btn-picker-main')
            .attr('tabindex', '0')
            .text(text)
            .appendTo(wrapper);

        // Create dropdown trigger (shows current selection)
        const trigger = $('<a>')
            .addClass('btn-picker-trigger')
            .html('<span class="picker-value">' + getLabel(selectedValue) + '</span> <span class="icon icon-chevron-down icon-12"></span>')
            .appendTo(wrapper);

        // Create dropdown
        const dropdown = $('<div>')
            .addClass('btn-picker-dropdown')
            .appendTo(wrapper);

        // Add options
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

                // Update selection
                selectedValue = option.value;
                State.variables.pickerMemory[presetName] = selectedValue;

                // Update trigger display
                trigger.find('.picker-value').text(option.label);

                // Update visual
                dropdown.find('.btn-picker-option').removeClass('selected');
                $(this).addClass('selected');

                // Close dropdown
                dropdown.removeClass('open');
                wrapper.removeClass('open');
                $('body').removeClass('btn-picker-open');
            });
        });

        // Toggle dropdown on trigger click
        trigger.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrapper.toggleClass('open');
            dropdown.toggleClass('open');

            if (dropdown.hasClass('open')) {
                $('body').addClass('btn-picker-open');
            } else {
                $('body').removeClass('btn-picker-open');
            }
        });

        // Main button click - use selected value and navigate
        btn.on('click', function (e) {
            e.preventDefault();
            State.variables.selectedDuration = selectedValue;
            Engine.play(passage);
        });

        // Close on outside click
        $(document).on('click.btnPicker' + presetName, function (e) {
            if (!wrapper.is(e.target) && wrapper.has(e.target).length === 0) {
                dropdown.removeClass('open');
                wrapper.removeClass('open');
                $('body').removeClass('btn-picker-open');
            }
        });

        // Cleanup on passage change
        $(document).one(':passagestart', function () {
            $(document).off('click.btnPicker' + presetName);
            $('body').removeClass('btn-picker-open');
        });
    }
});



/* ================== Dynamic Button Styles =================== */
// Generate button styles from CSS variables
$(document).one(':storyready', function () {
    const generateButtonStyles = () => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        let cssRules = '';

        // Get all CSS custom properties from root
        const allProps = [];
        for (let i = 0; i < styles.length; i++) {
            const prop = styles[i];
            if (prop.startsWith('--color-')) {
                allProps.push(prop);
            }
        }

        // Filter: only pure color variables (exclude bg, border, text)
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

        // Player için sadece firstName, diğerleri için firstName + lastName
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
                const currentHour = vars.timeSysHour || 0;
                const currentMinute = vars.timeSysMinute || 0;
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
            if (action.dailyLimit) {
                vars.dailyActivityLog = vars.dailyActivityLog || {};
                const currentDay = vars.timeSysDay || 0;
                const activityKey = `${charId}_${action.id}_${currentDay}`;

                if (vars.dailyActivityLog[activityKey]) {
                    return; // Hide if already done today
                }
            }

            // Check stat requirements
            const reqs = action.requirements || {};
            let meetsReqs = true;
            let missingReqs = [];

            for (const [stat, value] of Object.entries(reqs)) {
                if ((charStats[stat] || 0) < value) {
                    meetsReqs = false;
                    missingReqs.push(`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`);
                }
            }

            // Create button
            const btn = $('<a>').addClass('btn-style action-btn');

            if (meetsReqs) {
                btn.addClass('available')
                    .text(action.label)
                    .attr('data-passage', action.passage)
                    .ariaClick({ namespace: '.macros', one: true }, function () {
                        Engine.play(action.passage);
                    });
            } else {
                btn.addClass('locked')
                    .html(`<span class="icon icon-lock icon-12"></span> ${action.label}`)
                    .attr('data-tooltip', `Requires: ${missingReqs.join(', ')}`);
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
// Reset scroll position on passage change (both events so it's reliable regardless of engine order)
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
// Ortalama artık layout.js + CSS ile yapılıyor (transform yok)



// Topbar’a göre ortala: timebox DOM’a geldikten sonra (topbar :topbarready tetikler)

$(document).on(':passagerender', resetPassagesScroll);


/* ================== Navigation Card Handlers =================== */

/**
 * Check if a location is currently open
 * @param {string} locationId - The location ID to check
 * @returns {boolean} True if open, false if closed
 */
window.isLocationOpen = function (locationId) {
    const hours = setup.locationHours?.[locationId];

    // Not in list = always open
    if (!hours) return true;

    // 24h flag = always open
    if (hours.open24h) return true;

    const currentHour = State.variables.timeSys?.hour ?? 12;
    const { open, close } = hours;

    // Handle overnight hours (e.g., 22-05)
    if (close < open) {
        return currentHour >= open || currentHour < close;
    }

    // Normal hours
    return currentHour >= open && currentHour < close;
};

// Helper function for Navigation Cards
// Processes <<navCard>> tags and renders navigation menu cards
window.processNavCard = function (tag, $container, passedSetup) {
    // Ensure we have access to setup
    const navSetup = passedSetup || window.setup || {};

    const args = tag.args;
    let cardId = args[0];
    let displayName = args[0];
    let passageName = args[1];
    let imagePath = args[2];

    // === DISCOVERED CHECK ===
    // Check if this card is explicitly hidden via $discoveredCardId = false
    // Format: cardId "fhKitchen" -> check $discoveredFhKitchen (capitalize first letter)
    const capitalizedId = cardId.charAt(0).toUpperCase() + cardId.slice(1);
    const discoveryVar = 'discovered' + capitalizedId;
    const discoveryState = State.variables[discoveryVar];

    // If explicitly set to false, don't render this card
    if (discoveryState === false) {
        console.log(`[Navigation] Card "${cardId}" hidden (${discoveryVar} = false)`);
        return; // Skip this card
    }
    // Note: undefined or true means visible (default visible)

    // Check if ID exists in database (setup.navCards)
    if (navSetup.navCards && navSetup.navCards[cardId]) {
        const dbCard = navSetup.navCards[cardId];
        // Use DB values if not overridden
        displayName = args[1] || dbCard.name;
        passageName = dbCard.passage || cardId; // If passage not in DB, assume ID is passage
        // Image priority: manual arg > $locationImages > navCards DB > placeholder
        imagePath = args[2] || null;
    }
    else {
        // First arg is just display name if 2nd arg exists (Manual Mode)
        if (args.length >= 2) {
            displayName = args[0];
            passageName = args[1];
            imagePath = args[2];
        } else {
            // Fallback: Arg 0 is Passage Name
            passageName = args[0];
        }
    }

    // Image resolution priority:
    // 1. Manual argument (args[2])
    // 2. $locationImages[cardId]
    // 3. setup.navCards[cardId].image
    // 4. Placeholder
    if (!imagePath) {
        const locationImages = setup.locationImages || {};
        if (locationImages[cardId]) {
            imagePath = locationImages[cardId];
        } else if (navSetup.navCards && navSetup.navCards[cardId] && navSetup.navCards[cardId].image) {
            imagePath = navSetup.navCards[cardId].image;
        }
    }

    // Default image if still missing
    if (!imagePath) imagePath = "assets/system/images/placeholder_nav.png";

    // Check location hours
    const hours = setup.locationHours?.[cardId];
    const hasHours = !!hours;
    const isOpen = window.isLocationOpen(cardId);

    // Create status badge (only if location has hours defined)
    let statusBadge = '';
    if (hasHours) {
        const statusClass = isOpen ? 'status-open' : 'status-closed';
        const statusText = isOpen ? 'Open' : 'Closed';
        statusBadge = `<div class="nav-card-status ${statusClass}">${statusText}</div>`;
    }

    // Create Navigation Card HTML
    const $card = $(`
        <div class="nav-card ${hasHours && !isOpen ? 'location-closed' : ''}">
            <img src="${imagePath}" class="card-bg">
            <div class="gradient-overlay"></div>
            ${statusBadge}
            <div class="nav-card-name">${displayName}</div>
        </div>
    `);

    // Click Handler -> Go to Passage (with travel time)
    $card.on('click', function () {
        // Block if location is closed
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
        // Fix: Suppress navigation menu in cinematic quest scenes
        if (State.passage.startsWith('quest_')) {
            return;
        }

        // Add body class for overflow management
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

            // Get current visual position (includes all transforms from parents)
            const rect = $wrapper[0].getBoundingClientRect();

            // Get current margin-left to calculate adjustment
            const currentMarginLeft = parseFloat($wrapper.css('margin-left')) || 0;

            // Calculate margin-left needed to place element at visual x=0
            // Formula: new_margin = current_margin - current_visual_position
            const targetMarginLeft = currentMarginLeft - rect.left;

            // Apply breakout styles
            $wrapper.css({
                'margin-left': `${targetMarginLeft}px`,
                'width': `${availableWidth}px`,
                'max-width': 'none',
                'opacity': '1' // Show after calculation
            });

            // Apply container styles - Restore rounded corners and transparency
            $container.css({
                'width': '100%',
                'overflow': 'hidden',
                'background': 'transparent',
                'border': 'none',
                'box-shadow': 'none',
                'border-radius': '12px'
            });

            // Fix: Explicitly round the outermost cards
            $container.find('.nav-card').first().css({
                'border-top-left-radius': '12px',
                'border-bottom-left-radius': '12px'
            });
            $container.find('.nav-card').last().css({
                'border-top-right-radius': '12px',
                'border-bottom-right-radius': '12px'
            });
        };

        // Initialize positioning
        // We use delays to ensure DOM is settled and passage centering is complete
        setTimeout(positionNavMenu, 10);
        setTimeout(positionNavMenu, 100);
        setTimeout(positionNavMenu, 350); // After passage centering's last timeout (300ms)

        // Update on resize
        const resizeHandler = () => requestAnimationFrame(positionNavMenu);
        window.addEventListener('resize', resizeHandler);

        // Update on sidebar toggle or other layout changes
        const observer = new MutationObserver(positionNavMenu);
        const rightbarEl = document.querySelector('.right-bar');
        if (rightbarEl) observer.observe(rightbarEl, { attributes: true, attributeFilter: ['style', 'class'] });

        // Cleanup
        $(document).one(':passagestart', () => {
            window.removeEventListener('resize', resizeHandler);
            observer.disconnect();
            $('body').removeClass('has-navmenu'); // Remove body class on passage change
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