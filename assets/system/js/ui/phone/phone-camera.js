/* ==========================================
   PHONE CAMERA MODULE - NEW FEATURE
   Camera app for taking selfies/videos
========================================== */

/**
 * Render camera app UI
 * @param {object} vars - State.variables
 * @returns {string} HTML content
 */
function phoneRenderCameraApp(vars) {
    const player = vars.player || {};
    const stats = player.stats || {};
    
    return `
        <div class="phone-camera-app">
            <div class="phone-app-placeholder">
                <p class="phone-app-placeholder-text">Camera</p>
                <p class="phone-app-placeholder-sub">Take selfies and videos</p>
            </div>
            <div class="phone-camera-actions">
                <button type="button" class="phone-action-btn">📷 Normal Selfie</button>
                <button type="button" class="phone-action-btn" ${stats.charm >= 20 ? '' : 'disabled'}>
                    💕 Cute Selfie ${stats.charm >= 20 ? '' : '(Charm 20+)'}
                </button>
                <button type="button" class="phone-action-btn" ${stats.beauty >= 40 ? '' : 'disabled'}>
                    🔥 Hot Selfie ${stats.beauty >= 40 ? '' : '(Beauty 40+)'}
                </button>
                <button type="button" class="phone-action-btn" ${stats.beauty >= 60 ? '' : 'disabled'}>
                    💋 Spicy Selfie ${stats.beauty >= 60 ? '' : '(Beauty 60+)'}
                </button>
            </div>
        </div>
    `;
};

window.phoneRenderCameraApp = phoneRenderCameraApp;
window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.camera = { render: phoneRenderCameraApp };
