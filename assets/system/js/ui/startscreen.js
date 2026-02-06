let StartScreenAPI = null;

// Initialize
window.StartscreenInit = function (API) {
    StartScreenAPI = API;

    // Check after a short delay to ensure passage is ready
    setTimeout(checkCurrentPassage, 100);
};

// Check current passage for startscreen tag
function checkCurrentPassage() {
    if (!StartScreenAPI) return;

    // Read tags from DOM
    const tagsAttr = $('.passage').attr('data-tags');

    if (tagsAttr && tagsAttr.includes('startscreen')) {
        handleStartScreen(true);
    }
}

// Check and handle start screen on every passage
$(document).on(':passagestart', function (ev) {
    if (!StartScreenAPI) return;

    const passage = ev.passage;
    if (!passage) return;

    // Skip if we just loaded from a save (prevent reopening)
    if (window._skipStartScreenCheck) {
        console.log('[StartScreen] Skipping startscreen check due to save load');
        window._skipStartScreenCheck = false;
        return;
    }

    // Check tags
    if (passage.tags && passage.tags.includes('startscreen')) {
        handleStartScreen(true);
    } else {
        handleStartScreen(false);
    }
});

// Handle start screen visibility
window.handleStartScreen = function handleStartScreen(isStartScreen) {
    if (!StartScreenAPI) return;

    const $body = StartScreenAPI.$('body');

    if (isStartScreen) {
        // Add startscreen class to body
        $body.addClass('startscreen-active');

        // Hide/destroy other UI elements
        $('.top-bar-wrapper').remove();
        $('.right-bar').remove();
        $('.map-overlay').remove();
        $('#phone-overlay').remove();

        // Create start screen container if not exists
        if ($('#startscreen-container').length === 0) {
            createStartScreenContainer();
        }

    } else {
        // Remove startscreen class
        $body.removeClass('startscreen-active');

        // Remove start screen container
        $('#startscreen-container').remove();
    }
};

// Create start screen container
function createStartScreenContainer() {
    if (!StartScreenAPI) return;

    const vars = StartScreenAPI.State.variables;
    const setup = StartScreenAPI.setup || window.setup || {};
    const gameName = setup.gameName || vars.gameName || 'Game Title';
    const gameVersion = setup.gameVersion || vars.gameVersion || 'v1.0';

    const html = `
        <div id="startscreen-container">
            <div class="startscreen-content">
                <div class="startscreen-logo">
                    <h1 class="startscreen-title">${gameName}</h1>
                    <p class="startscreen-version">${gameVersion}</p>
                </div>
                
                <div class="startscreen-actions">
                    <button class="startscreen-btn startscreen-btn-primary" onclick="window.startscreenContinue()">
                        <span class="icon icon-play icon-18"></span>
                        <span>Continue</span>
                    </button>
                    <button class="startscreen-btn" onclick="window.startscreenNewGame()">
                        <span class="icon icon-restart icon-18"></span>
                        <span>New Game</span>
                    </button>
                    <button class="startscreen-btn" onclick="window.startscreenLoad()">
                        <span class="icon icon-save icon-18"></span>
                        <span>Load Game</span>
                    </button>
                </div>
                
                <div class="startscreen-footer">
                    <p>Select an option to begin</p>
                </div>
            </div>
        </div>
    `;

    StartScreenAPI.$('body').append(html);
    
    // Check if saves exist and disable Continue button if not
    checkAndUpdateContinueButton();
}

// Check saves and update Continue button state
function checkAndUpdateContinueButton() {
    if (!StartScreenAPI) return;
    
    let hasSaves = false;
    
    // Check regular save slots
    for (let i = 0; i < StartScreenAPI.Save.slots.length; i++) {
        if (StartScreenAPI.Save.slots.has(i)) {
            hasSaves = true;
            break;
        }
    }
    
    // Check autosave if no regular saves
    if (!hasSaves && StartScreenAPI.Save.autosave.has()) {
        hasSaves = true;
    }
    
    const $continueBtn = $('.startscreen-btn-primary');
    
    if (!hasSaves) {
        // No saves - disable and style the button
        $continueBtn.prop('disabled', true);
        $continueBtn.addClass('disabled');
        $continueBtn.css('opacity', '0.3');
        $continueBtn.css('cursor', 'not-allowed');
    } else {
        // Has saves - ensure button is enabled
        $continueBtn.prop('disabled', false);
        $continueBtn.removeClass('disabled');
        $continueBtn.css('opacity', '1');
        $continueBtn.css('cursor', 'pointer');
    }
}

// Startscreen button actions
window.startscreenContinue = function () {
    if (!StartScreenAPI) return;

    // Prevent multiple clicks
    if (window._startscreenProcessing) return;
    window._startscreenProcessing = true;

    console.log('[StartScreen] Continue clicked');

    // Check if there are any saves (SugarCube 2 - proper method)
    let hasSaves = false;
    let mostRecentSlot = -1;
    let mostRecentDate = 0;

    for (let i = 0; i < StartScreenAPI.Save.slots.length; i++) {
        if (StartScreenAPI.Save.slots.has(i)) {
            hasSaves = true;
            const slotData = StartScreenAPI.Save.slots.get(i);
            if (slotData && slotData.date > mostRecentDate) {
                mostRecentDate = slotData.date;
                mostRecentSlot = i;
            }
        }
    }

    console.log('[StartScreen] Has saves:', hasSaves);

    if (hasSaves && mostRecentSlot >= 0) {
        console.log('[StartScreen] Loading most recent save from slot:', mostRecentSlot);

        // CRITICAL: Remove StartScreen UI first
        handleStartScreen(false);

        // Load save
        StartScreenAPI.Save.slots.load(mostRecentSlot);

        // Force render to prevent black screen (Fix for continue)
        if (StartScreenAPI.Engine && StartScreenAPI.Engine.show) {
            StartScreenAPI.Engine.show();
        }

        window._startscreenProcessing = false;
    } else {
        // No saves, start new game
        console.log('[StartScreen] No saves found, starting new game');
        window._startscreenProcessing = false;
        window.startscreenNewGame();
    }
};

window.startscreenNewGame = function () {
    if (!StartScreenAPI) return;

    // Prevent multiple clicks
    if (window._startscreenProcessing) return;
    window._startscreenProcessing = true;

    console.log('[StartScreen] New Game clicked');
    console.log('[StartScreen] Current passage:', StartScreenAPI.State.passage);

    // CRITICAL: Remove StartScreen UI first (body class + container)
    // This must happen BEFORE Engine.play so GameStart renders in clean state
    handleStartScreen(false);

    // Navigate to GameStart - UI will recreate automatically via :passagerender
    console.log('[StartScreen] Calling Engine.play("GameStart")...');
    StartScreenAPI.Engine.play('GameStart');
    console.log('[StartScreen] Engine.play returned, current passage:', StartScreenAPI.State.passage);

    window._startscreenProcessing = false;
};

window.startscreenLoad = function () {
    if (!StartScreenAPI) return;

    // Prevent multiple clicks
    if (window._startscreenProcessing) return;
    window._startscreenProcessing = true;

    console.log('[StartScreen] Load clicked');

    // Open custom save/load screen
    if (window.openCustomSaveLoad) {
        window.openCustomSaveLoad();
    } else {
        console.error('[StartScreen] openCustomSaveLoad not available');
    }
    window._startscreenProcessing = false;
};
