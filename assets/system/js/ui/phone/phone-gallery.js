/* ==========================================
   PHONE GALLERY MODULE - NEW FEATURE
   Gallery for viewing and selecting photos/videos
========================================== */

/**
 * Render gallery app UI
 * @param {object} vars - State.variables
 * @returns {string} HTML content
 */
function phoneRenderGalleryApp(vars) {
    const gallery = vars.phoneGallery || { photos: {}, videos: {} };
    
    return `
        <div class="phone-gallery-app">
            <div class="phone-app-placeholder">
                <p class="phone-app-placeholder-text">Gallery</p>
                <p class="phone-app-placeholder-sub">Your photos and videos</p>
            </div>
            <div class="phone-gallery-grid">
                <p>No media yet. Use the Camera app to take your first selfie!</p>
            </div>
        </div>
    `;
};

window.phoneRenderGalleryApp = phoneRenderGalleryApp;
window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.gallery = { render: phoneRenderGalleryApp };
