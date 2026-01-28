let TopbarAPI = null;

// Initialize
window.TopbarInit = function (API) {
    TopbarAPI = API;

    // Add modal to TopbarAPI
    TopbarAPI.Modal = window.ModalTabSystem;
};

// Rebuild on every passage render
$(document).on(':passagerender', function () {
    if (!TopbarAPI) return;

    console.log('[Topbar] :passagerender event fired');
    console.log('[Topbar] State.passage:', TopbarAPI.State.passage);

    const vars = TopbarAPI.State.variables;

    // Check if current passage is Start (startscreen) - ALLOW topbar for hamburger menu
    // if (TopbarAPI.State.passage === 'Start') {
    //    console.log('[Topbar] Skipping - Start passage (startscreen)');
    //    $('.top-bar-wrapper').remove();
    //    return;
    // }

    // hideTopbar now only hides the content, hamburger still shows
    // Body class is now set by smart detection below (when Nav+Timebox+Notifications are all hidden)
    const hideTopbarContent = vars.hideTopbar === true;

    console.log('[Topbar] Creating topbar...');

    // Remove only topbar, NOT modals
    $('.top-bar-wrapper').remove();

    const canBack = TopbarAPI.State.activeIndex > 0;
    const canForward = TopbarAPI.State.activeIndex < (TopbarAPI.State.size - 1);

    // Check if previous passage is Start (don't allow backward to StartScreen)
    let previousPassage = null;
    if (TopbarAPI.State.activeIndex > 0) {
        const moments = TopbarAPI.State.history;
        previousPassage = moments[TopbarAPI.State.activeIndex - 1]?.title;
    }
    const canBackToStart = canBack && previousPassage !== 'Start';

    // vars already declared above, use it directly
    const timeSys = vars.timeSys || {};
    const timeConfig = vars.timeConfig || {};

    // Format time
    const hour = (timeSys.hour || 0).toString().padStart(2, '0');
    const minute = (timeSys.minute || 0).toString().padStart(2, '0');
    const timeStr = hour + ':' + minute;

    // Get period
    let period = 'morning';
    if (timeSys.hour >= 6 && timeSys.hour < 12) period = 'morning';
    else if (timeSys.hour >= 12 && timeSys.hour < 18) period = 'afternoon';
    else if (timeSys.hour >= 18 && timeSys.hour < 22) period = 'evening';
    else period = 'night';

    const periodName = timeConfig.periods && timeConfig.periods[period] ? timeConfig.periods[period].name : '';

    // Format date
    const monthNames = timeConfig.monthNames || [];
    const weekdayNames = timeConfig.weekdayNames || [];
    const monthName = monthNames[timeSys.month - 1] || '';
    const weekdayName = weekdayNames[timeSys.weekday] || '';
    const dateStr = timeSys.day + ' ' + monthName + ', ' + timeSys.year;

    const notifications = {
        left: [
            { icon: 'cum', tooltip: 'Cum', show: vars.notificationCum, color: '#e0e0e0' },
            { icon: 'heart', tooltip: 'Relationship', show: vars.notificationHeart, color: '#ec4899' },
            { icon: 'bed', tooltip: 'Sleep', show: vars.notificationBed, color: '#3b82f6' },
            { icon: 'alarm', tooltip: vars.notificationAlarmText || 'Time Event', show: vars.notificationAlarm, color: '#f59e0b' },
            { icon: 'school', tooltip: 'School', show: vars.notificationSchool, color: '#10b981' },
            { icon: 'work', tooltip: 'Work', show: vars.notificationWork, color: '#ef4444' }
        ],
        right: [
            { icon: 'lightning', tooltip: 'Energy Low', show: vars.notificationEnergy, color: '#fbbf24' },
            { icon: 'health', tooltip: 'Health Low', show: vars.notificationHealth, color: '#ef4444' },
            { icon: 'mood', tooltip: 'Mood Low', show: vars.notificationMood, color: '#ec4899' },
            { icon: 'arousal', tooltip: 'Arousal High', show: vars.notificationArousal, color: '#f87171' },
            { icon: 'bladder', tooltip: 'Bladder Full', show: vars.notificationBladder, color: '#facc15' },
            { icon: 'thirst', tooltip: 'Thirsty', show: vars.notificationThirst, color: '#3b82f6' },
            { icon: 'food', tooltip: 'Hungry', show: vars.notificationHunger, color: '#f97316' }
        ]
    };

    const STYLE_TAGS = ['cute', 'elegant', 'professional', 'sexy', 'slutty', 'bimbo'];

    const clothesConfig = {
        1: { icon: 'naked', tooltip: 'You are naked!', color: '#ef4444' },
        2: { icon: 'underwear', tooltip: 'You are only wearing underwear.', color: '#f97316' },
        3: { icon: 'commando', tooltip: 'You are going commando (no underwear).', color: '#f59e0b' },
        // Style-based notifications (4+)
        'cute': { icon: 'dress', tooltip: 'Looking cute today!', color: '#ec4899' },
        'elegant': { icon: 'dress', tooltip: 'Looking elegant.', color: '#a855f7' },
        'professional': { icon: 'dress', tooltip: 'Professional attire.', color: '#3b82f6' },
        'sexy': { icon: 'dress', tooltip: 'Wearing something sexy.', color: '#f97316' },
        'slutty': { icon: 'dress', tooltip: 'Wearing a slutty outfit.', color: '#ef4444' },
        'bimbo': { icon: 'dress', tooltip: 'Full bimbo look!', color: '#ec4899' }
    };

    // Calculate clothes notification dynamically from wardrobe state
    function calculateClothesNotification() {
        const wardrobe = vars.wardrobe;
        if (!wardrobe || !wardrobe.equipped) return { type: 0 };
        
        const equipped = wardrobe.equipped;
        const hasTop = equipped.top && equipped.top !== '';
        const hasBottom = equipped.bottom && equipped.bottom !== '';
        const hasDress = equipped.dress && equipped.dress !== '';
        const hasBra = equipped.bra && equipped.bra !== '';
        const hasPanty = equipped.panty && equipped.panty !== '';
        
        const isFullyDressed = hasDress || (hasTop && hasBottom);
        const hasAnyUnderwear = hasBra || hasPanty;
        const isUnderwearOnly = !isFullyDressed && hasAnyUnderwear;
        const isNude = !isFullyDressed && !hasAnyUnderwear;
        const isCommando = isFullyDressed && !hasAnyUnderwear;
        
        if (isNude) return { type: 1 };
        if (isUnderwearOnly) return { type: 2 };
        if (isCommando) return { type: 3 };
        
        // If fully dressed, check for dominant style
        if (isFullyDressed) {
            const clothingData = window.setup?.clothingData || {};
            let styleCounts = {};
            
            Object.values(equipped).forEach(itemId => {
                if (!itemId) return;
                
                // Find item in clothingData
                let item = null;
                for (const category of Object.keys(clothingData)) {
                    const items = clothingData[category] || [];
                    item = items.find(i => i.id === itemId);
                    if (item) break;
                }
                
                if (item && item.tags) {
                    item.tags.forEach(tag => {
                        if (STYLE_TAGS.includes(tag)) {
                            styleCounts[tag] = (styleCounts[tag] || 0) + 1;
                        }
                    });
                }
            });
            
            // Find dominant style
            let dominant = null;
            let max = 0;
            Object.entries(styleCounts).forEach(([style, count]) => {
                if (count > max) {
                    max = count;
                    dominant = style;
                }
            });
            
            if (dominant) {
                return { type: 'style', style: dominant };
            }
        }
        
        return { type: 0 };
    }

    const clothesResult = calculateClothesNotification();
    console.log('[Topbar Debug] Clothes Result:', clothesResult);
    
    let config = null;
    
    if (clothesResult.type === 'style') {
        config = clothesConfig[clothesResult.style];
        console.log('[Topbar Debug] Selected Style Config:', clothesResult.style, config);
    } else if (clothesResult.type > 0) {
        config = clothesConfig[clothesResult.type];
        console.log('[Topbar Debug] Selected Type Config:', clothesResult.type, config);
    }
    
    if (config) {
        notifications.right.push({
            icon: config.icon,
            tooltip: config.tooltip,
            show: true,
            color: config.color
        });
        console.log('[Topbar Debug] Pushed to notifications.right:', notifications.right);
    } else {
        console.warn('[Topbar Debug] No config found for clothes result!');
    }

    const leftIcons = notifications.left
        .filter(n => n.show === 1 || n.show === true)
        .map(n => `<span class="icon icon-${n.icon} icon-20" data-tooltip="${n.tooltip}" style="color: ${n.color}"></span>`)
        .join('');

    const rightIcons = notifications.right
        .filter(n => n.show === 1 || n.show === true)
        .map(n => `<span class="icon icon-${n.icon} icon-20" data-tooltip="${n.tooltip}" style="color: ${n.color}"></span>`)
        .join('');

    // Modular UI Control - Check what components to hide (preserve layout)
    const hideHamburger = vars.hideTopbarHamburger === true;
    const hideNav = vars.hideTopbarNav === true; // Combined Nav (both left and right)
    const hideTimebox = vars.hideTopbarTimebox === true;
    const hideNotifications = vars.hideTopbarNotifications === true;
    
    // Smart detection: if ALL content is hidden, apply topbar-hidden class for full-screen layout
    const allContentHidden = hideNav && hideTimebox && hideNotifications;
    
    if (allContentHidden) {
        $('body').addClass('topbar-hidden');
    } else {
        $('body').removeClass('topbar-hidden');
    }

    // Build complete HTML with visibility control (layout preserved)
    const html = `
        <div class="top-bar-wrapper">
            <div class="left-section" style="${hideHamburger ? 'visibility: hidden;' : ''}">
                <button class="mainmenu-btn" id="mainmenu-btn">
                    <span class="icon icon-hamburger icon-18"></span>
                </button>
            </div>
            
            <div class="center-section" style="${hideTopbarContent ? 'display: none;' : ''}">
                <div class="navbar-container" style="position: relative;">
                    <div class="navbar-left" style="${hideNav ? 'visibility: hidden;' : ''}">
                        <div class="nav-item" data-action="character">Character</div>
                        <div class="nav-item" data-action="relations" style="position: relative;">
                            Relations
                            ${vars.showRelationTutorial === true ? '<div class="relations-notification-dot"></div>' : ''}
                        </div>
                    </div>
                    
                    <div class="navbar-bottom-left" style="${hideNotifications || !leftIcons ? 'visibility: hidden;' : ''}">
                        ${leftIcons}
                    </div>
                    
                    <div class="timebox" style="${hideTimebox ? 'visibility: hidden;' : ''}">
                        <button class="time-arrow" id="time-back" ${!canBackToStart ? 'disabled' : ''}>
                            <span class="icon icon-chevron-left icon-16"></span>
                        </button>
                        <div class="time-content">
                            <div class="time-line">${timeStr} - ${periodName}</div>
                            <div class="time-line">${weekdayName}</div>
                            <div class="time-line">${dateStr}</div>
                        </div>
                        <button class="time-arrow" id="time-forward" ${!canForward ? 'disabled' : ''}>
                            <span class="icon icon-chevron-right icon-16"></span>
                        </button>
                    </div>
                    
                    <div class="navbar-bottom-right" style="${hideNotifications || !rightIcons ? 'visibility: hidden;' : ''}">
                        ${rightIcons}
                    </div>
                    
                    <div class="navbar-right" style="${hideNav ? 'visibility: hidden;' : ''}">
                        <div class="nav-item" data-action="stats">Stats</div>
                        <div class="nav-item" data-action="journal">Journal</div>
                    </div>
                </div>
            </div>
            
            <div class="right-section"></div>
        </div>
    `;

    TopbarAPI.$('body').prepend(html);

    $('#mainmenu-btn').on('click', () => {
        if (window.openMainMenu) {
            window.openMainMenu();
        } else {
            TopbarAPI.UI.restart();
        }
    });

    $('#time-back').on('click', () => {
        // Check if we can go back and won't land on Start passage
        if (TopbarAPI.State.activeIndex > 0) {
            const moments = TopbarAPI.State.history;
            const previousPassage = moments[TopbarAPI.State.activeIndex - 1]?.title;
            if (previousPassage !== 'Start') {
                TopbarAPI.Engine.backward();
            }
        }
    });

    $('#time-forward').on('click', () => {
        if (TopbarAPI.State.activeIndex < (TopbarAPI.State.size - 1)) {
            TopbarAPI.Engine.forward();
        }
    });

    $('.nav-item').on('click', function () {
        const action = TopbarAPI.$(this).data('action');
        showNavDialog(action);
    });
});

function showNavDialog(action) {
    if (!TopbarAPI) return;

    if (action === 'character') {
        if (window.CharacterSystem) {
            window.CharacterSystem.open();
        } else {
            console.error('[Topbar] CharacterSystem not available');
        }
    } else if (action === 'relations') {
        if (window.RelationsSystem) {
            window.RelationsSystem.open();
        } else {
            console.error('[Topbar] RelationsSystem not available');
        }
    } else if (action === 'stats') {
        if (window.StatsSystem) {
            window.StatsSystem.open();
        } else {
            console.error('[Topbar] StatsSystem not available');
        }
    } else if (action === 'journal') {
        if (window.JournalSystem) {
            window.JournalSystem.open();
        } else {
            console.error('[Topbar] JournalSystem not available');
        }
    }
}