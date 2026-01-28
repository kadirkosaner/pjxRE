/* ================== Location Background System =================== */
// Automatically apply location background to body based on State.variables.location
// Location is cleared when navigating to a NEW passage, but preserved on reload

let LocationAPI = null;
let currentPassageName = null;

function LocationInit(API) {
    LocationAPI = API;
    console.log('[Location] Initializing location background system');

    function updateLocationBackground() {
        if (!LocationAPI) return;

        const location = LocationAPI.State.variables?.location || null;
        const locationImages = LocationAPI.setup?.locationImages || {};

        if (location) {
            document.body.setAttribute('data-location', location);

            // Set dynamic background image if exists in variables
            if (locationImages[location]) {
                const rawPath = locationImages[location];
                // Inline styles on document.body resolve relative to the HTML document (Root),
                // NOT the CSS file. So we do NOT need to backtrack.
                const imagePath = rawPath;

                // FIX: Inject explicit style tag to ensure URL resolves relative to Document
                // Bypasses any issues with CSS variable resolution in external stylesheets
                $('#dynamic-location-bg').remove();
                $(`<style id="dynamic-location-bg">
                    body::before { 
                        background-image: url('${imagePath}') !important; 
                        background-position: center center !important;
                        opacity: 1;
                    }
                </style>`).appendTo('head');
                
                // Keep the data attribute for CSS transitions/logic
                document.body.setAttribute('data-location', location);
                
                console.log(`[Location] Background set to: ${location} (${imagePath})`);
            } else {
                $('#dynamic-location-bg').remove();
                console.log(`[Location] No image found for: ${location}`);
            }
        } else {
            document.body.removeAttribute('data-location');
            $('#dynamic-location-bg').remove();
            console.log('[Location] Background cleared - no location set');
        }
    }

    // Clear location when navigating to a new passage (but not on reload)
    $(document).on(':passagestart', function () {
        if (!LocationAPI) return;

        const newPassageName = LocationAPI.State.passage;

        // If we're navigating to a DIFFERENT passage, clear location
        if (currentPassageName !== null && currentPassageName !== newPassageName) {
            if (LocationAPI.State.variables) {
                LocationAPI.State.variables.location = null;
                console.log('[Location] Cleared for new passage:', newPassageName);
            }
        }

        // Update current passage name
        currentPassageName = newPassageName;
    });

    // Update background after passage renders (after <<set>> commands run)
    $(document).on(':passagerender', function () {
        updateLocationBackground();
    });

    // Double-check after passage is fully done
    $(document).on(':passageend', function () {
        updateLocationBackground();
    });

    console.log('[Location] Event handlers registered');
}

// Export to window for loader auto-init
window.LocationInit = LocationInit;
