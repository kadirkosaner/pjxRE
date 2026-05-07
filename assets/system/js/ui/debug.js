let DebugAPI = null;
let activeDebugTab = 'vars';

const DIANA_DEBUG_PASSAGES = [
    { id: 'arrival', order: 1, title: 'Diana Arrival', passage: 'dinerWork_event_dianaArrival', note: 'Ruby\'s shift exit', type: 'preQuest' },
    { id: 'kitchen', order: 2, title: 'Kitchen Gossip', passage: 'dinerWork_event_dianaKitchen', note: 'Kitchen door scene', type: 'preQuest' },
    { id: 'nightThoughts', order: 3, title: 'Night Thoughts', passage: 'dinerWork_event_nightThoughts', note: 'Bedroom follow-up', type: 'nightThoughts' },
    { id: 'emmaGossip', order: 4, title: 'Emma Gossip', passage: 'emmaTalkDinerRubys_dianaGossip', note: 'Talk to Emma', type: 'emmaGossip' },
    { id: 'sofiaGossip', order: 5, title: 'Sofia Gossip', passage: 'sofiaTalkDinerRubys_dianaGossip', note: 'Talk to Sofia', type: 'sofiaGossip' },
    { id: 'beautyThoughts', order: 6, title: 'Beauty Thoughts', passage: 'fhBedroom_event_beautyThoughts', note: 'Mirror moment', questStage: 1 },
    { id: 'beautySearch', order: 7, title: 'Beauty Search', passage: 'brotherComputer_beautySearch', note: 'Brother PC', questStage: 2 },
    { id: 'motherTalk', order: 8, title: 'Talk to Mom', passage: 'fhParentsRoom_event_motherTalk', note: 'Parents room', questStage: 3 },
    { id: 'hallAfterMom', order: 9, title: 'Hall After Mom', passage: 'fhParentsHall_afterMotherTalk', note: 'Bridge to dad scene', questStage: 4 },
    { id: 'askDad', order: 10, title: 'Ask Dad for Money', passage: 'fhLivingRoom_event_askDadMoney', note: 'Living room scene', questStage: 4 },
    { id: 'mallVisit', order: 11, title: 'Mall Visit', passage: 'mall_event_beautyVisit', note: 'Mall entry', questStage: 5 },
    { id: 'mallWindow', order: 12, title: 'Mall Window', passage: 'mall_event_beautyVisit_window', note: 'Window browsing', questStage: 5 },
    { id: 'mallLuxury', order: 13, title: 'Luxury Store', passage: 'mall_event_beautyVisit_luxuryStore', note: 'Inside boutique', questStage: 5 },
    { id: 'mallClerk', order: 14, title: 'Clerk Scene', passage: 'mall_event_beautyVisit_clerk', note: 'Store humiliation', questStage: 5 },
    { id: 'mallAftermath', order: 15, title: 'Mall Aftermath', passage: 'fhBedroom_event_mallAftermath', note: 'Back in bedroom', questStage: 6 },
    { id: 'walletChance', order: 16, title: 'Wallet Chance', passage: 'fhUpperstairs_event_walletChance', note: 'Late-night temptation', questStage: 7 },
    { id: 'stealDad', order: 17, title: 'Steal Dad', passage: 'fhLivingRoom_event_stealDad', note: 'Take the money', questStage: 7 }
];

const SHOWER_DEBUG_PASSAGES = [
    { id: 'fatherDoor', order: 1, title: 'Father Door', passage: 'showerEncounter', note: 'Parents bath door scene', target: 'father', returnLoc: 'fhParentsRoom', variant: 'door' },
    { id: 'fatherFirst', order: 2, title: 'Father First Peek', passage: 'showerEncounter_peek_Father_first', note: 'First-time peek scene', target: 'father', returnLoc: 'fhParentsRoom', variant: 'first' },
    { id: 'fatherPeek', order: 3, title: 'Father Repeat Peek', passage: 'showerEncounter_peek_Father', note: 'Repeat peek scene', target: 'father', returnLoc: 'fhParentsRoom', variant: 'repeat' },
    { id: 'fatherContinue', order: 4, title: 'Father Continue', passage: 'showerEncounter_peek_Father_continue', note: 'Keep watching follow-up', target: 'father', returnLoc: 'fhParentsRoom', variant: 'continue' },
    { id: 'motherDoor', order: 5, title: 'Mother Door', passage: 'showerEncounter', note: 'Parents bath door scene', target: 'mother', returnLoc: 'fhParentsRoom', variant: 'door' },
    { id: 'motherFirst', order: 6, title: 'Mother First Peek', passage: 'showerEncounter_peek_Mother_first', note: 'First-time peek scene', target: 'mother', returnLoc: 'fhParentsRoom', variant: 'first' },
    { id: 'motherPeek', order: 7, title: 'Mother Repeat Peek', passage: 'showerEncounter_peek_Mother', note: 'Repeat peek scene', target: 'mother', returnLoc: 'fhParentsRoom', variant: 'repeat' },
    { id: 'motherContinue', order: 8, title: 'Mother Continue', passage: 'showerEncounter_peek_Mother_continue', note: 'Keep watching follow-up', target: 'mother', returnLoc: 'fhParentsRoom', variant: 'continue' },
    { id: 'brotherDoor', order: 9, title: 'Brother Door', passage: 'showerEncounter', note: 'Upstairs bath door scene', target: 'brother', returnLoc: 'fhUpperstairs', variant: 'door' },
    { id: 'brotherFirst', order: 10, title: 'Brother First Peek', passage: 'showerEncounter_peek_Brother_first', note: 'First-time peek scene', target: 'brother', returnLoc: 'fhUpperstairs', variant: 'first' },
    { id: 'brotherPeek', order: 11, title: 'Brother Repeat Peek', passage: 'showerEncounter_peek_Brother', note: 'Repeat peek scene', target: 'brother', returnLoc: 'fhUpperstairs', variant: 'repeat' },
    { id: 'brotherContinue', order: 12, title: 'Brother Continue', passage: 'showerEncounter_peek_Brother_continue', note: 'Keep watching follow-up', target: 'brother', returnLoc: 'fhUpperstairs', variant: 'continue' }
];

// Initialize
window.DebugInit = function(API) {
    DebugAPI = API;
    createDebugPanel();
    createDebugButton();
};

// Create debug button
function createDebugButton() {
    if (!DebugAPI) return;
    
    // Remove old button if exists
    $('#debug-btn').remove();
    
    const html = `
        <button class="debug-btn" id="debug-btn">
            <span class="icon icon-bug icon-20"></span>
        </button>
    `;
    
    DebugAPI.$('body').append(html);
    
    $('#debug-btn').on('click', function() {
        openDebugPanel();
    });
}

// Create debug panel
function createDebugPanel() {
    if (!DebugAPI) return;
    
    // Remove old panel if exists
    $('#debug-panel, #debug-overlay').remove();
    
    // Create debug panel HTML
    const html = `
        <div class="overlay overlay-medium debug-overlay" id="debug-overlay"></div>
        <div class="debug-panel" id="debug-panel">
            <div class="debug-header">
                <span class="debug-title">Debug Console</span>
                <button class="close-btn" id="debug-close">
                    <span class="icon icon-close icon-18"></span>
                </button>
            </div>
            
            <div class="debug-content">
                <div class="debug-tabs">
                    <button class="debug-tab active" type="button" data-debug-tab="vars">Variables</button>
                    <button class="debug-tab" type="button" data-debug-tab="inventory">Inventory</button>
                    <button class="debug-tab" type="button" data-debug-tab="diana">Diana Go To</button>
                    <button class="debug-tab" type="button" data-debug-tab="shower">Shower Go To</button>
                    <button class="debug-tab" type="button" data-debug-tab="versions">Versions</button>
                </div>

                <div class="debug-tab-panel active" data-debug-panel="vars">
                    <div class="debug-row">
                        <label class="debug-label">Variable</label>
                        <input type="text" class="debug-input" id="debug-variable" placeholder="playerHealth">
                    </div>
                    
                    <div class="debug-row">
                        <label class="debug-label">Operation</label>
                        <select class="debug-select" id="debug-operation">
                            <option value="=">=</option>
                            <option value="+=">+=</option>
                            <option value="-=">-=</option>
                        </select>
                    </div>
                    
                    <div class="debug-row">
                        <label class="debug-label">Value</label>
                        <input type="text" class="debug-input" id="debug-value" placeholder="100">
                    </div>
                    
                    <div class="debug-row">
                        <button class="debug-apply-btn" id="debug-apply" type="button">Apply</button>
                    </div>
                    
                    <div class="debug-result" id="debug-result"></div>
                </div>

                <div class="debug-tab-panel" data-debug-panel="inventory">
                    <div class="debug-section-title">Add to inventory</div>
                    <div class="debug-row">
                        <label class="debug-label">Item ID</label>
                        <input type="text" class="debug-input" id="debug-item-id" placeholder="comb">
                    </div>
                    <div class="debug-row">
                        <label class="debug-label">Quantity</label>
                        <input type="number" class="debug-input" id="debug-item-qty" placeholder="1" min="1" value="1">
                    </div>
                    <div class="debug-row">
                        <button class="debug-apply-btn" id="debug-add-item" type="button">Add item</button>
                    </div>
                    <div class="debug-result" id="debug-item-result"></div>

                    <div class="debug-section-title" style="margin-top:0.75rem;">Add money</div>
                    <div class="debug-row">
                        <label class="debug-label">Amount</label>
                        <input type="number" class="debug-input" id="debug-money-amount" placeholder="100" min="0.01" step="0.01" value="100">
                    </div>
                    <div class="debug-row">
                        <button class="debug-apply-btn" id="debug-add-money" type="button">Add money</button>
                    </div>
                    <div class="debug-result" id="debug-money-result"></div>
                </div>

                <div class="debug-tab-panel" data-debug-panel="diana">
                    <div class="debug-section-title">Something Different Arc</div>
                    <div class="debug-helper-text">Ordered jump list for Diana scenes. Each button also syncs the related quest stage.</div>
                    <div class="debug-goto-grid">
                        ${getDianaDebugButtonsHtml()}
                    </div>
                    <div class="debug-result" id="debug-goto-result"></div>
                </div>

                <div class="debug-tab-panel" data-debug-panel="shower">
                    <div class="debug-section-title">Shower Encounter Arc</div>
                    <div class="debug-helper-text">Direct jumps for the bathroom door, first peek, repeat peek, and continue scenes. Minimum corruption/lust requirements are auto-filled.</div>
                    <div class="debug-goto-grid">
                        ${getShowerDebugButtonsHtml()}
                    </div>
                    <div class="debug-result" id="debug-shower-result"></div>
                </div>

                <div class="debug-tab-panel" data-debug-panel="versions">
                    ${getVersionsTabHtml()}
                </div>
            </div>
        </div>
    `;
    
    // Insert to page
    DebugAPI.$('body').append(html);
    
    // Close events
    $('#debug-close, #debug-overlay').on('click', function() {
        closeDebugPanel();
    });

    $('[data-debug-tab]').on('click', function() {
        setActiveDebugTab($(this).data('debugTab'));
    });
    
    // Apply button
    $('#debug-apply').on('click', function() {
        applyDebugChange();
    });
    
    // Add to inventory button
    $('#debug-add-item').on('click', function() {
        addItemToInventory();
    });

    $('#debug-add-money').on('click', function() {
        addMoneyToBalance();
    });

    $('.debug-goto-btn').on('click', function() {
        goToDianaPassage($(this).data('passageId'));
    });

    $('.debug-shower-btn').on('click', function() {
        goToShowerPassage($(this).data('showerId'));
    });

    $('#debug-run-migrations').on('click', function() {
        runDebugMigrations();
    });

    $('#debug-force-version').on('click', function() {
        forceDebugVersion();
    });

    $('#debug-force-version-input').on('keypress', function(e) {
        if (e.which === 13) forceDebugVersion();
    });

    // Enter key support
    $('#debug-variable, #debug-value').on('keypress', function(e) {
        if (e.which === 13) {
            applyDebugChange();
        }
    });

    setActiveDebugTab(activeDebugTab);
}

// Open debug panel
function openDebugPanel() {
    setActiveDebugTab(activeDebugTab);
    $('#debug-panel').addClass('open');
    $('#debug-overlay').addClass('active');
}

// Close debug panel
function closeDebugPanel() {
    $('#debug-panel').removeClass('open');
    $('#debug-overlay').removeClass('active');
}

function getDianaDebugButtonsHtml() {
    return DIANA_DEBUG_PASSAGES.map(function(entry) {
        return `
            <button class="debug-goto-btn" type="button" data-passage-id="${entry.id}">
                <span class="debug-goto-order">${entry.order}</span>
                <span class="debug-goto-copy">
                    <span class="debug-goto-title">${entry.title}</span>
                    <span class="debug-goto-note">${entry.note}</span>
                </span>
            </button>
        `;
    }).join('');
}

function getShowerDebugButtonsHtml() {
    return SHOWER_DEBUG_PASSAGES.map(function(entry) {
        return `
            <button class="debug-goto-btn debug-shower-btn" type="button" data-shower-id="${entry.id}">
                <span class="debug-goto-order">${entry.order}</span>
                <span class="debug-goto-copy">
                    <span class="debug-goto-title">${entry.title}</span>
                    <span class="debug-goto-note">${entry.note}</span>
                </span>
            </button>
        `;
    }).join('');
}

function setActiveDebugTab(tabId) {
    activeDebugTab = tabId || 'vars';

    $('[data-debug-tab]').removeClass('active');
    $(`[data-debug-tab="${activeDebugTab}"]`).addClass('active');

    $('[data-debug-panel]').removeClass('active');
    $(`[data-debug-panel="${activeDebugTab}"]`).addClass('active');
}

function ensureQuestState(vars) {
    if (!vars.questState) {
        vars.questState = {
            active: {},
            completed: [],
            failed: [],
            daily: {}
        };
    }

    if (!vars.questState.active) vars.questState.active = {};
    if (!Array.isArray(vars.questState.completed)) vars.questState.completed = [];
    if (!Array.isArray(vars.questState.failed)) vars.questState.failed = [];
}

function resetSomethingDifferentTracking(vars) {
    if (vars.questAdvancesFromPassage?.something_different) {
        delete vars.questAdvancesFromPassage.something_different;
    }

    if (vars.questMaxAdvancesFromPassage?.something_different) {
        delete vars.questMaxAdvancesFromPassage.something_different;
    }
}

function clearSomethingDifferentState(vars) {
    ensureQuestState(vars);
    delete vars.questState.active.something_different;
    vars.questState.completed = vars.questState.completed.filter(function(qid) {
        return qid !== 'something_different';
    });
    vars.questState.failed = vars.questState.failed.filter(function(qid) {
        return qid !== 'something_different';
    });
    vars.something_different_done = false;
    resetSomethingDifferentTracking(vars);
}

function setSomethingDifferentStage(vars, stageIndex) {
    ensureQuestState(vars);

    vars.questState.completed = vars.questState.completed.filter(function(qid) {
        return qid !== 'something_different';
    });
    vars.questState.failed = vars.questState.failed.filter(function(qid) {
        return qid !== 'something_different';
    });

    vars.questState.active.something_different = {
        stage: stageIndex,
        objectives: {},
        triggeredStage: -1,
        startDate: `${vars.timeSys?.day || 1}/${vars.timeSys?.month || 1}/${vars.timeSys?.year || 2025}`
    };

    vars.something_different_done = false;
    resetSomethingDifferentTracking(vars);
}

function setDianaBaseFlags(vars) {
    if (!vars.flags) vars.flags = {};

    vars.flags.dianaEventShown = true;
    vars.flags.dianaGossipUnlocked = true;
    vars.flags.dianaThoughtsShown = true;
    vars.flags.sofiaGossipUnlocked = true;
    vars.flags.emmaGossipDone = true;
    vars.flags.sofiaGossipDone = true;
}

function setDianaGossipFlags(vars) {
    if (!vars.flags) vars.flags = {};

    vars.flags.dianaEventShown = true;
    vars.flags.dianaGossipUnlocked = true;
    vars.flags.dianaThoughtsShown = true;
    vars.flags.sofiaGossipUnlocked = false;
    vars.flags.emmaGossipDone = false;
    vars.flags.sofiaGossipDone = false;
}

function setDianaPreQuestFlags(vars) {
    if (!vars.flags) vars.flags = {};

    vars.flags.dianaEventShown = true;
    vars.flags.dianaGossipUnlocked = false;
    vars.flags.dianaThoughtsShown = false;
    vars.flags.sofiaGossipUnlocked = false;
    vars.flags.emmaGossipDone = false;
    vars.flags.sofiaGossipDone = false;
}

function prepareDianaPassageState(entry) {
    const vars = DebugAPI.State.variables;

    if (!entry) return;

    if (entry.type === 'preQuest') {
        setDianaPreQuestFlags(vars);
        clearSomethingDifferentState(vars);
        return;
    }

    if (entry.type === 'nightThoughts') {
        setDianaPreQuestFlags(vars);
        clearSomethingDifferentState(vars);
        return;
    }

    if (entry.type === 'emmaGossip') {
        setDianaGossipFlags(vars);
        setSomethingDifferentStage(vars, 0);
        return;
    }

    if (entry.type === 'sofiaGossip') {
        setDianaGossipFlags(vars);
        vars.flags.sofiaGossipUnlocked = true;
        vars.flags.emmaGossipDone = true;
        setSomethingDifferentStage(vars, 0);
        vars.questState.active.something_different.objectives = {
            talkEmma: true
        };
        return;
    }

    setDianaBaseFlags(vars);
    setSomethingDifferentStage(vars, entry.questStage);
}

function goToDianaPassage(passageId) {
    if (!DebugAPI) return;

    const entry = DIANA_DEBUG_PASSAGES.find(function(item) {
        return item.id === passageId;
    });

    if (!entry) {
        showGotoResult('Error: Diana debug passage not found', 'error');
        return;
    }

    const engine = DebugAPI.Engine || window.Engine;
    if (!engine || typeof engine.play !== 'function') {
        showGotoResult('Error: Engine.play is not available', 'error');
        return;
    }

    try {
        prepareDianaPassageState(entry);
        closeDebugPanel();
        engine.play(entry.passage);
    } catch (error) {
        showGotoResult(`Error: ${error.message}`, 'error');
    }
}

function ensureShowerDebugRequirements(vars, entry) {
    if (typeof vars.corruption !== 'number' || vars.corruption < 2) {
        vars.corruption = 2;
    }

    if (!vars.characters || !vars.characters[entry.target]) return;

    const char = vars.characters[entry.target];
    if (!char.stats) char.stats = {};

    if (typeof char.stats.lustLevel !== 'number' || char.stats.lustLevel < 2) {
        char.stats.lustLevel = 2;
    }

    if (typeof char.stats.lust !== 'number' || char.stats.lust < 10) {
        char.stats.lust = 10;
    }
}

function prepareShowerPassageState(entry) {
    if (!DebugAPI) return;

    const vars = DebugAPI.State.variables;
    const temp = DebugAPI.State.temporary || (DebugAPI.State.temporary = {});
    const firstSeenFlagByTarget = {
        father: 'fatherShowerPeekFirstSeen',
        mother: 'motherShowerPeekFirstSeen',
        brother: 'brotherShowerPeekFirstSeen'
    };
    const flagKey = firstSeenFlagByTarget[entry.target];

    if (!vars.flags) vars.flags = {};

    ensureShowerDebugRequirements(vars, entry);

    temp.showerEncounterTarget = entry.target;
    temp.showerEncounterReturnLoc = entry.returnLoc;
    temp.bathroomCheck = {
        someoneShowering: true,
        character: entry.target
    };

    if (flagKey) {
        if (entry.variant === 'first') {
            vars.flags[flagKey] = false;
        } else if (entry.variant === 'repeat' || entry.variant === 'continue') {
            vars.flags[flagKey] = true;
        }
    }
}

function goToShowerPassage(passageId) {
    if (!DebugAPI) return;

    const entry = SHOWER_DEBUG_PASSAGES.find(function(item) {
        return item.id === passageId;
    });

    if (!entry) {
        showShowerResult('Error: Shower debug passage not found', 'error');
        return;
    }

    const engine = DebugAPI.Engine || window.Engine;
    if (!engine || typeof engine.play !== 'function') {
        showShowerResult('Error: Engine.play is not available', 'error');
        return;
    }

    try {
        prepareShowerPassageState(entry);
        closeDebugPanel();
        engine.play(entry.passage);
    } catch (error) {
        showShowerResult(`Error: ${error.message}`, 'error');
    }
}

// Apply debug change
function applyDebugChange() {
    if (!DebugAPI) return;
    
    const variable = $('#debug-variable').val().trim();
    const operation = $('#debug-operation').val();
    const valueStr = $('#debug-value').val().trim();
    
    if (!variable) {
        showDebugResult('Error: Variable name required', 'error');
        return;
    }
    
    if (!valueStr) {
        showDebugResult('Error: Value required', 'error');
        return;
    }
    
    // Parse value
    let value;
    if (valueStr === 'true') {
        value = true;
    } else if (valueStr === 'false') {
        value = false;
    } else if (!isNaN(valueStr)) {
        value = Number(valueStr);
    } else {
        value = valueStr;
    }
    
    const vars = DebugAPI.State.variables;
    
    try {
        // Get nested property value
        const getNestedValue = (obj, path) => {
            const keys = path.split('.');
            let current = obj;
            for (let key of keys) {
                if (current === undefined || current === null) return undefined;
                current = current[key];
            }
            return current;
        };
        
        // Set nested property value
        const setNestedValue = (obj, path, value) => {
            const keys = path.split('.');
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        };
        
        const oldValue = getNestedValue(vars, variable);
        let newValue;
        
        switch(operation) {
            case '=':
                setNestedValue(vars, variable, value);
                newValue = value;
                break;
            case '+=':
                if (typeof oldValue === 'number' && typeof value === 'number') {
                    newValue = oldValue + value;
                    setNestedValue(vars, variable, newValue);
                } else {
                    showDebugResult('Error: += requires numeric values', 'error');
                    return;
                }
                break;
            case '-=':
                if (typeof oldValue === 'number' && typeof value === 'number') {
                    newValue = oldValue - value;
                    setNestedValue(vars, variable, newValue);
                } else {
                    showDebugResult('Error: -= requires numeric values', 'error');
                    return;
                }
                break;
        }
        
        showDebugResult(`Success: ${variable} = ${newValue} (was: ${oldValue})`, 'success');
        
        // Trigger re-render
        $(document).trigger(':passagerender');
        
    } catch (error) {
        showDebugResult(`Error: ${error.message}`, 'error');
    }
}

// Add item to inventory (uses State.variables.inventory)
function addItemToInventory() {
    if (!DebugAPI) return;
    
    const itemId = $('#debug-item-id').val().trim();
    const qtyStr = $('#debug-item-qty').val().trim();
    const qty = Math.max(1, parseInt(qtyStr, 10) || 1);
    
    if (!itemId) {
        showItemResult('Error: Item ID required', 'error');
        return;
    }
    
    const vars = DebugAPI.State.variables;
    if (!vars.inventory) {
        vars.inventory = [];
    }
    
    try {
        const found = vars.inventory.find(function(item) { return item.id === itemId; });
        if (found) {
            found.quantity = (found.quantity || 1) + qty;
        } else {
            vars.inventory.push({ id: itemId, quantity: qty });
        }
        showItemResult('Added: ' + itemId + ' x' + qty, 'success');
        $(document).trigger(':passagerender');
    } catch (error) {
        showItemResult('Error: ' + error.message, 'error');
    }
}

function addMoneyToBalance() {
    if (!DebugAPI) return;

    const amountStr = $('#debug-money-amount').val().trim();
    const amount = parseFloat(amountStr);

    if (!Number.isFinite(amount) || amount <= 0) {
        showMoneyResult('Error: Enter a valid amount greater than 0', 'error');
        return;
    }

    const vars = DebugAPI.State.variables;

    if (!Number.isFinite(vars.moneyEarn)) vars.moneyEarn = 0;
    if (!Number.isFinite(vars.moneySpend)) vars.moneySpend = 0;
    if (!Number.isFinite(vars.cashBalance)) vars.cashBalance = 0;

    try {
        const oldBalance = Number(vars.cashBalance) || 0;
        vars.moneyEarn = Math.round((vars.moneyEarn + amount) * 100) / 100;
        vars.cashBalance = Math.round((vars.moneyEarn - vars.moneySpend) * 100) / 100;
        const added = Math.round((vars.cashBalance - oldBalance) * 100) / 100;

        showMoneyResult(`Added: $${added.toFixed(2)} | New balance: $${vars.cashBalance.toFixed(2)}`, 'success');
        $(document).trigger(':passagerender');
    } catch (error) {
        showMoneyResult('Error: ' + error.message, 'error');
    }
}

function showItemResult(message, type) {
    const result = $('#debug-item-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

function showMoneyResult(message, type) {
    const result = $('#debug-money-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

function showGotoResult(message, type) {
    const result = $('#debug-goto-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

function showShowerResult(message, type) {
    const result = $('#debug-shower-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

function getVersionsTabHtml() {
    if (!DebugAPI) return '<div class="debug-helper-text">Debug API not available.</div>';

    var vars = DebugAPI.State.variables;
    var currentVer = typeof setup !== 'undefined' ? setup.CURRENT_SAVE_VERSION : 0;
    var saveVer = vars.saveVersion != null ? vars.saveVersion : 0;
    var gl = typeof setup !== 'undefined' && setup.getSaveVersionLabel ? setup.getSaveVersionLabel : function(v) { return '0.' + (v + 1); };
    var pending = (typeof saveVer === 'number' && typeof currentVer === 'number' && saveVer < currentVer);

    var statusClass = saveVer === currentVer ? 'version-current' : (pending ? 'version-outdated' : 'version-legacy');
    var statusText = saveVer === currentVer ? '✓ Up to date' : (pending ? '⚠ Outdated' : '? Unknown');

    var html = '';
    html += '<div class="debug-version-status">';
    html += '  <div class="debug-version-row">';
    html += '    <span class="debug-label">Game Version</span>';
    html += '    <span class="debug-version-value">' + gl(currentVer) + '</span>';
    html += '  </div>';
    html += '  <div class="debug-version-row">';
    html += '    <span class="debug-label">Save Version</span>';
    html += '    <span class="debug-version-value save-version-badge ' + statusClass + '">' + gl(saveVer) + ' ' + statusText + '</span>';
    html += '  </div>';
    html += '</div>';

    if (pending) {
        html += '<div class="debug-helper-text">Pending: ' + gl(saveVer + 1) + ' → ' + gl(currentVer) + '</div>';
    }

    html += '<div class="debug-row" style="flex-direction:row; gap:0.5rem;">';
    html += '  <button class="debug-apply-btn" id="debug-run-migrations" type="button" style="flex:1;">Run Migrations</button>';
    html += '</div>';

    html += '<div class="debug-row" style="flex-direction:row; gap:0.5rem; align-items:flex-end;">';
    html += '  <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem;">';
    html += '    <label class="debug-label">Force Version</label>';
    html += '    <input type="number" class="debug-input" id="debug-force-version-input" placeholder="0" min="0" value="' + (typeof saveVer === 'number' ? saveVer : 0) + '">';
    html += '  </div>';
    html += '  <button class="debug-apply-btn" id="debug-force-version" type="button" style="flex:0 0 auto; width:auto; padding:0.75rem 1.5rem;">Set</button>';
    html += '</div>';

    html += '<div class="debug-result" id="debug-version-result"></div>';

    var log = Array.isArray(vars.migrationLog) ? vars.migrationLog : [];
    if (log.length > 0) {
        html += '<div class="debug-section-title" style="margin-top:0.5rem;">Migration Log</div>';
        html += '<div class="debug-migration-log">';
        for (var i = log.length - 1; i >= 0; i--) {
            var entry = log[i];
            var dateStr = entry.date ? new Date(entry.date).toLocaleString() : '—';
            html += '<div class="debug-log-entry">';
            html += '  <div class="debug-log-header">';
            html += '    <span>' + gl(entry.from) + ' → ' + gl(entry.to) + '</span>';
            html += '    <span class="debug-log-date">' + dateStr + '</span>';
            html += '  </div>';
            if (Array.isArray(entry.results)) {
                for (var j = 0; j < entry.results.length; j++) {
                    var r = entry.results[j];
                    var icon = r.status === 'ok' ? '✓' : (r.status === 'error' ? '✗' : '?');
                    var cls = r.status === 'ok' ? 'log-ok' : 'log-error';
                    html += '  <div class="debug-log-step ' + cls + '">';
                    html += '    <span>' + icon + ' ' + gl(r.version) + '</span>';
                    if (r.message) html += ' <span class="debug-log-msg">' + r.message + '</span>';
                    html += '  </div>';
                }
            }
            html += '</div>';
        }
        html += '</div>';
    }

    return html;
}

function runDebugMigrations() {
    if (!DebugAPI) return;

    if (typeof window.runSaveVersion !== 'function') {
        showVersionResult('Error: runSaveVersion not available', 'error');
        return;
    }

    var result = window.runSaveVersion();

    if (!result) {
        showVersionResult('Error: No result returned', 'error');
        return;
    }

    var gl = typeof setup !== 'undefined' && setup.getSaveVersionLabel ? setup.getSaveVersionLabel : function(v) { return '0.' + (v + 1); };

    if (!result.migrated) {
        showVersionResult('Already up to date (' + gl(result.from) + ')', 'success');
        return;
    }

    if (result.hasErrors) {
        showVersionResult('Migration failed. Reached ' + gl(result.to) + ' / ' + gl(result.target), 'error');
    } else {
        var count = result.to - result.from;
        showVersionResult('Migrated ' + gl(result.from) + ' → ' + gl(result.to) + ' (' + count + ' step' + (count > 1 ? 's' : '') + ')', 'success');
    }

    refreshVersionsTab();
}

function forceDebugVersion() {
    if (!DebugAPI) return;

    var val = parseInt($('#debug-force-version-input').val(), 10);
    if (isNaN(val) || val < 0) {
        showVersionResult('Error: Enter a valid version number (≥ 0)', 'error');
        return;
    }

    DebugAPI.State.variables.saveVersion = val;
    showVersionResult('Forced saveVersion = ' + val, 'success');
    refreshVersionsTab();
}

function refreshVersionsTab() {
    var $panel = $('[data-debug-panel="versions"]');
    if ($panel.length) {
        $panel.html(getVersionsTabHtml());

        $('#debug-run-migrations').on('click', function() {
            runDebugMigrations();
        });
        $('#debug-force-version').on('click', function() {
            forceDebugVersion();
        });
        $('#debug-force-version-input').on('keypress', function(e) {
            if (e.which === 13) forceDebugVersion();
        });
    }
}

function showVersionResult(message, type) {
    var result = $('#debug-version-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

// Show result message
function showDebugResult(message, type) {
    const result = $('#debug-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    
    setTimeout(() => {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}