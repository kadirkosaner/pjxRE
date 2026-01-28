window.AccordionInit = function (API) {
    const $ = API.$;

    window.AccordionSystem = {
        API: API,
        
        init: function() {
            console.log('[AccordionSystem] Initializing...');
            this.attachEvents();
        },

        attachEvents: function() {
            // Remove any existing bindings to avoid duplicates
            $(document).off('click.accordion');
            $(document).off('click.settingToggle');

            // Bind accordion header clicks
            $(document).on('click.accordion', '.setup-accordion-header', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const $header = $(this);
                const $item = $header.closest('.setup-accordion-item');
                
                // Toggle active state
                $item.toggleClass('active');
            });

            // Bind toggle button clicks
            $(document).on('click.settingToggle', '.setting-toggle-btn', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).toggleClass('active');
                $(this).text($(this).hasClass('active') ? 'ON' : 'OFF');
            });

            console.log('[AccordionSystem] Events attached');
        }
    };

    // Initialize immediately
    window.AccordionSystem.init();
};
