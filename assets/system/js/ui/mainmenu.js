let MainMenuAPI = null;

// Initialize
window.MainmenuInit = function (API) {
    MainMenuAPI = API;
    createMainMenu();
};

// Create main menu
function createMainMenu() {
    if (!MainMenuAPI) return;

    // Remove old menu if exists
    $('#main-menu, #main-menu-overlay').remove();

    // Create main menu HTML
    const html = `
            <div class="overlay overlay-medium main-menu-overlay" id="main-menu-overlay"></div>
            <div class="main-menu" id="main-menu">
                <div class="main-menu-header">
                    <span class="main-menu-title">Menu</span>
                    <button class="close-btn" id="main-menu-close">
                        <span class="icon icon-close icon-18"></span>
                    </button>
                </div>
                
                <div class="main-menu-content">
                    <div class="menu-item" data-action="save">
                        <span class="menu-icon">
                            <span class="icon icon-save icon-24"></span>
                        </span>
                        <span class="menu-text">Save & Load Game</span>
                    </div>
                    <div class="menu-item" data-action="settings">
                        <span class="menu-icon">
                            <span class="icon icon-settings icon-24"></span>
                        </span>
                        <span class="menu-text">Settings</span>
                    </div>
                    <div class="menu-item" data-action="restart">
                        <span class="menu-icon">
                            <span class="icon icon-restart icon-24"></span>
                        </span>
                        <span class="menu-text">Restart</span>
                    </div>
                    <div class="menu-item" data-action="help">
                        <span class="menu-icon">
                            <span class="icon icon-info icon-24"></span>
                        </span>
                        <span class="menu-text">Help</span>
                    </div>
                    <div class="menu-item" data-action="report-bug">
                        <span class="menu-icon">
                            <span class="icon icon-bug icon-24"></span>
                        </span>
                        <span class="menu-text">Report Bug</span>
                    </div>
                    <div class="menu-item" data-action="patreon">
                        <span class="menu-icon">
                            <span class="icon icon-patreon icon-24"></span>
                        </span>
                        <span class="menu-text">Patreon</span>
                    </div>
                    <div class="menu-item" data-action="subscribestar">
                        <span class="menu-icon">
                            <span class="icon icon-subscribestar icon-24"></span>
                        </span>
                        <span class="menu-text">SubscribeStar</span>
                    </div>
                </div>
            </div>
        `;

    // Insert to page
    MainMenuAPI.$('body').append(html);

    // Close button event
    $('#main-menu-close, #main-menu-overlay').on('click', function () {
        closeMainMenu();
    });

    // Menu item events
    $('.menu-item').on('click', function () {
        const action = MainMenuAPI.$(this).data('action');
        handleMenuAction(action);
    });
}

// Open main menu
window.openMainMenu = function () {
    $('#main-menu').addClass('open');
    $('#main-menu-overlay').addClass('active');
};

// Close main menu
function closeMainMenu() {
    $('#main-menu').removeClass('open');
    $('#main-menu-overlay').removeClass('active');
}

// Handle menu actions
function handleMenuAction(action) {
    if (!MainMenuAPI) return;

    switch (action) {
        case 'save':
            if (window.openCustomSaveLoad) {
                window.openCustomSaveLoad();
            } else {
            }
            closeMainMenu();
            break;
        case 'settings':
            if (window.SettingsSystem) {
                window.SettingsSystem.open();
            } else {
                MainMenuAPI.UI.settings();
            }
            closeMainMenu();
            break;
        case 'help':
            if (window.HelpSystem) {
                window.HelpSystem.open();
            }
            closeMainMenu();
            break;
        case 'unstick-bedroom':
            closeMainMenu();
            {
                const Eng = MainMenuAPI.Engine || (typeof Engine !== 'undefined' ? Engine : null);
                if (Eng && typeof Eng.play === 'function') {
                    Eng.play('fhBedroom');
                }
            }
            break;
        case 'restart':
            // Use window.ModalTabSystem if available, otherwise fallback
            if (window.ModalTabSystem && window.ModalTabSystem.confirm) {
                window.ModalTabSystem.confirm(
                    'Restart Game',
                    'Are you sure you want to restart?<br>All unsaved progress will be lost.',
                    function () {
                        // Restart logic
                        if (MainMenuAPI && MainMenuAPI.Engine) {
                            MainMenuAPI.Engine.restart();
                        } else {
                            window.location.reload();
                        }
                    }
                );
            } else {
                MainMenuAPI.UI.restart();
            }
            break;
        case 'report-bug':
            window.open('https://discord.gg/y598bANqJ3', '_blank');
            closeMainMenu();
            break;
        case 'subscribestar':
            window.open('https://subscribestar.adult/neph93', '_blank');
            closeMainMenu();
            break;
        case 'website':
            window.open('https://.com', '_blank');
            closeMainMenu();
            break;
        case 'patreon':
            window.open('https://www.patreon.com/cw/Neph93', '_blank');
            closeMainMenu();
            break;
    }
}