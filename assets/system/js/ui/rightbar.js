let RightbarAPI = null;

// Initialize
window.RightbarInit = function (API) {
    RightbarAPI = API;
};

// Rebuild on every passage render
$(document).on(':passagerender', function () {
    if (!RightbarAPI) return;

    const vars = RightbarAPI.State.variables;

    // Check if current passage is Start (startscreen) - skip rightbar creation
    if (RightbarAPI.State.passage === 'Start') {
        $('.right-bar, .map-overlay').remove();
        return;
    }

    // Check State variable for UI control (flexible per-passage control)
    if (vars.hideRightbar === true) {
        return;
    }

    // Remove only rightbar/map-overlay, NOT modal-overlay
    $('.right-bar, .map-overlay').remove();

    const gameName = RightbarAPI.setup?.gameName;
    const gameVersion = RightbarAPI.setup?.gameVersion;
    const imageProfile = RightbarAPI.setup?.imageProfile;
    const imageMap = RightbarAPI.setup?.imageMap;
    const notificationPhoneCount = vars.notificationPhoneCount || 0;

    // Calculate total money (cash + bank)
    const totalMoney = (vars.cashBalance || 0) + (vars.bankBalance || 0);

    // Stats configuration with special handling for Money with tooltip
    const defaultStats = [
        { label: 'Money', value: totalMoney, hasTooltip: true },
        { label: 'Energy', value: vars.energy || 0 },
        { label: 'Health', value: vars.health || 0 },
        { label: 'Mood', value: vars.mood || 0 },
        { label: 'Stress', value: vars.stress || 0 },
        { label: 'Arousal', value: vars.arousal || 0 }
    ];

    const statsHTML = (vars.gameStats || defaultStats).map(stat => {
        if (stat.label === 'Money' && stat.hasTooltip) {
            return `
                <div class="stat-float has-tooltip">
                    <div class="stat-label">
                        ${stat.label}
                        <span class="stat-info-icon">i</span>
                        <div class="stat-tooltip">
                            <div class="stat-tooltip-row">
                                <span>Cash:</span>
                                <span>$${vars.cashBalance || 0}</span>
                            </div>
                            <div class="stat-tooltip-row">
                                <span>Card:</span>
                                <span>$${vars.bankBalance || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                </div>
            `;
        }
        return `
            <div class="stat-float">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `;
    }).join('');

    // Phone preview content
    const phonePreviewContent = notificationPhoneCount > 0 ? `
        <div class="message-item">
            <div class="message-info">
                <div class="message-name">New Notifications</div>
            </div>
            <div class="message-count">${notificationPhoneCount}</div>
        </div>
    ` : `
        <div class="phone-empty">
            <div class="phone-empty-text">No new notifications</div>
        </div>
    `;

    // Modular UI Control - Check what components to hide (preserve layout)
    const hideGameInfo = vars.hideRightbarGameInfo === true;
    const hideProfile = vars.hideRightbarProfile === true;
    const hideStats = vars.hideRightbarStats === true;
    const hidePhone = vars.hideRightbarPhone === true;
    const hideMap = vars.hideRightbarMap === true;

    // Profile status icons (combed/makeup) under profile image
    const combedOn = vars.appearance?.hairCombed === 1;
    const makeupStyle = (vars.makeup && vars.makeup.style >= 1 && vars.makeup.style <= 5) ? vars.makeup.style : 0;
    const makeupStyles = {
        1: { label: 'Light', color: '#94a3b8' },
        2: { label: 'Medium', color: '#f59e0b' },
        3: { label: 'Heavy', color: '#f97316' },
        4: { label: 'Slutty', color: '#ef4444' },
        5: { label: 'Bimbo', color: '#ec4899' }
    };
    const makeupConfig = makeupStyle ? makeupStyles[makeupStyle] : null;
    const profileStatusIcons = `
        <div class="profile-status-icons" style="${hideProfile ? 'visibility: hidden;' : ''}">
            ${combedOn ? `<span class="profile-status-item" data-tooltip="Combed"><span class="icon icon-comb icon-18" style="color: #a78bfa"></span></span>` : ''}
            ${makeupConfig ? `<span class="profile-status-item" data-tooltip="${makeupConfig.label}\u00A0Makeup"><span class="icon icon-makeup icon-18" style="color: ${makeupConfig.color}"></span></span>` : ''}
        </div>
    `;

    // Build complete HTML with visibility control (layout preserved)
    const html = `
        <div class="right-bar">
            <div class="rightbar-section rightbar-top" style="${hideGameInfo ? 'visibility: hidden;' : ''}">
                <div class="game-info">
                    <p class="game-title">${gameName}</p>
                    <p class="game-version">${gameVersion}</p>
                </div>
            </div>
            
            <div class="rightbar-section rightbar-middle">
                <img src="${imageProfile}" class="profile-image" style="${hideProfile || !imageProfile ? 'visibility: hidden;' : ''}">
                ${profileStatusIcons}
                
                <div class="stats-section" style="${hideStats ? 'visibility: hidden;' : ''}">
                    ${statsHTML}
                </div>
            </div>
            
            <div class="rightbar-section rightbar-bottom">
                <div class="phone-section" id="phone-section" style="${hidePhone ? 'visibility: hidden;' : ''}">
                    <div class="preview-container" id="phone-trigger">
                        <div class="preview-content phone-mockup">
                            <div class="phone-notch">
                                <div class="notch-camera"></div>
                                <div class="notch-speaker"></div>
                                <div class="notch-sensor"></div>
                            </div>
                            <div class="phone-screen">
                                <div class="phone-header">Notifications</div>
                                <div class="phone-preview">
                                    ${phonePreviewContent}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="map-section" style="${hideMap ? 'visibility: hidden;' : ''}">
                    <div class="preview-container" id="map-trigger">
                        ${vars.showMapTutorial === true ? '<div class="map-notification-dot"></div>' : ''}
                        <div class="preview-content">
                            ${imageMap ? `<img src="${imageMap}" class="map-image" alt="Map">` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="overlay overlay-dark map-overlay" id="map-overlay">
            <div class="modal map-full">
                <div class="modal-header">
                    <span class="modal-title">City Map</span>
                    <button class="close-btn" id="map-close">
                        <span class="icon icon-close icon-18"></span>
                    </button>
                </div>
                <div class="map-tutorial-banner" id="map-tutorial-banner" style="display: none;">
                    <div class="tutorial-content">
                        <div class="tutorial-text">
                            <div class="tutorial-title">Welcome to your City Map!</div>
                            <div class="tutorial-desc">
                                This map shows all the places you've discovered in the city. 
                                As you explore and visit new locations, they will appear here. 
                                Click on any region to see what's inside!
                            </div>
                        </div>
                        <button class="tutorial-close-btn" id="map-tutorial-close">Got it!</button>
                    </div>
                </div>
                <div class="modal-content map-full-content">
                    ${imageMap ? `<img src="${imageMap}" class="map-image-full" alt="Map">` : ''}
                </div>
            </div>
        </div>
    `;

    // Insert to page
    RightbarAPI.$('body').append(html);

    // Check notification trigger
    if (vars.notificationPush === 1) {
        if (window.notifyPhone) {
            notifyPhone('New Notification');
        }
        vars.notificationPush = 0;
    }

    // Phone trigger events
    $('#phone-trigger').on('click', function () {
        if (window.openPhoneOverlay) {
            openPhoneOverlay();
        }
    });

    // Map trigger events
    $('#map-trigger').on('click', function () {
        $('#map-overlay').addClass('active');
        
        // Show map tutorial banner if flag is set (first time opening)
        if (vars.showMapTutorial === true) {
            $('#map-tutorial-banner').show();
        }
    });

    // Map tutorial close button
    $('#map-tutorial-close').on('click', function () {
        $('#map-tutorial-banner').fadeOut(300);
        $('.map-notification-dot').fadeOut(300);
        vars.showMapTutorial = false;
    });

    $('#map-close').on('click', function () {
        $('#map-overlay').removeClass('active');
    });

    $('#map-overlay').on('click', function (e) {
        if (e.target === this) {
            $(this).removeClass('active');
        }
    });
});