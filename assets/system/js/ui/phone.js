let PhoneAPI = null;

// Initialize
window.PhoneInit = function (API) {
    PhoneAPI = API;
};

// Create phone overlay on every passage render
$(document).on(':passagerender', function () {
    if (!PhoneAPI) return;

    // Remove old overlay if exists
    $('#phone-overlay').remove();

    createPhoneOverlay();
});

// Create phone overlay
function createPhoneOverlay() {
    if (!PhoneAPI) return;

    const vars = PhoneAPI.State.variables;

    // Get time from timeSys object and format with leading zeros
    const timeSys = vars.timeSys || { hour: 0, minute: 0 };
    const timeSysHour = timeSys.hour.toString().padStart(2, '0');
    const timeSysMinute = timeSys.minute.toString().padStart(2, '0');

    // Get notification counts
    const notificationMessages = vars.notificationPhoneMessages || 0;
    const notificationFotogram = vars.notificationPhoneFotogram || 0;
    const notificationFinder = vars.notificationPhoneFinder || 0;

    // Phone apps configuration
    const apps = [
        { name: 'Camera', icon: 'assets/content/phone/icon_camera.png', action: 'camera', badge: 0 },
        { name: 'Calls', icon: 'assets/content/phone/icon_calls.png', action: 'calls', badge: 0 },
        { name: 'Messages', icon: 'assets/content/phone/icon_messages.png', action: 'messages', badge: notificationMessages },
        { name: 'Gallery', icon: 'assets/content/phone/icon_gallery.png', action: 'gallery', badge: 0 },
        { name: 'Calendar', icon: 'assets/content/phone/icon_calendar.png', action: 'calendar', badge: 0 },
        { name: 'Fotogram', icon: 'assets/content/phone/icon_fotogram.png', action: 'fotogram', badge: notificationFotogram },
        { name: 'Finder', icon: 'assets/content/phone/icon_finder.png', action: 'finder', badge: notificationFinder }
    ];

    // Render apps
    const appsHtml = apps.map(app => `
        <div class="phone-app" data-action="${app.action}">
            <div class="phone-app-icon">
                <img src="${app.icon}" alt="${app.name}">
                ${app.badge > 0 ? `<span class="phone-app-badge">${app.badge > 99 ? '99+' : app.badge}</span>` : ''}
            </div>
            <div class="phone-app-name">${app.name}</div>
        </div>
    `).join('');

    const html = `
        <div class="overlay overlay-dark phone-overlay" id="phone-overlay">
            <div class="phone-device">
                <div class="phone-device-header">
                    <div class="phone-device-notch">
                        <div class="notch-camera"></div>
                        <div class="notch-speaker"></div>
                        <div class="notch-sensor"></div>
                    </div>
                    <span class="status-time">${timeSysHour}:${timeSysMinute}</span>
                </div>
                
                <div class="phone-device-screen">
                    <div class="phone-apps-container">
                        <div class="phone-apps-grid">
                            ${appsHtml}
                        </div>
                    </div>
                    
                    <div class="phone-action-area">
                        <button class="phone-close-btn" id="phone-close">Put the phone down</button>
                    </div>
                </div>
                
                <div class="phone-device-home-indicator"></div>
            </div>
        </div>
    `;

    PhoneAPI.$('body').append(html);

    // Close events
    $('#phone-close').on('click', function () {
        closePhoneOverlay();
    });

    $('#phone-overlay').on('click', function (e) {
        if ($(e.target).hasClass('phone-overlay')) {
            closePhoneOverlay();
        }
    });

    // App click events
    $('.phone-app').on('click', function () {
        const action = $(this).data('action');
        handleAppClick(action);
    });
}

// Handle app clicks
function handleAppClick(action) {
    console.log(`App clicked: ${action}`);
    // App actions will be implemented later
}

// Open phone overlay
window.openPhoneOverlay = function () {
    $('#phone-overlay').addClass('active');
};

// Close phone overlay
function closePhoneOverlay() {
    $('#phone-overlay').removeClass('active');
}