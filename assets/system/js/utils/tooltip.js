let TooltipAPI = null;
let $globalTooltip = null;

// Initialize
window.TooltipInit = function(API) {
    TooltipAPI = API;
    
    createGlobalTooltip();
    
    // Auto-initialize on passage render
    TooltipAPI.$(document).on(':passagerender', function() {
        setTimeout(function() {
            window.initTooltips();
        }, 100);
    });

    // Hide tooltip on passage navigation
    TooltipAPI.$(document).on(':passageinit', function() {
        if (window.hideTooltip) window.hideTooltip();
    });
};

// Create global tooltip popup (one-time)
function createGlobalTooltip() {
    if (!TooltipAPI) return;
    
    $globalTooltip = TooltipAPI.$('<span class="tooltip-popup"></span>');
    TooltipAPI.$('body').append($globalTooltip);
}

// Global tooltip initialization function
window.initTooltips = function() {
    if (!TooltipAPI || !$globalTooltip) return;
    
    TooltipAPI.$('[data-tooltip], [data-outfit-tooltip]').each(function() {
        const $el = TooltipAPI.$(this);
        
        // Skip if already initialized
        if ($el.data('tooltip-ready')) {
            return;
        }
        
        $el.data('tooltip-ready', true);
        
        $el.on('mouseenter.tooltip', function() {
            const tooltipText = $el.attr('data-tooltip') || $el.attr('data-outfit-tooltip');
            if (!tooltipText) return;

            const rect = this.getBoundingClientRect();
            
            $globalTooltip.text(tooltipText);
            
            // Handle success (green) vs locked (red bg / white text — same as .btn-style.locked, action-btn.locked)
            if ($el.attr('data-tooltip-type') === 'success') {
                $globalTooltip.addClass('success-tooltip').removeClass('locked-tooltip');
            } else if (
                $el.attr('data-tooltip-type') === 'locked' ||
                $el.hasClass('locked') ||
                $el.hasClass('disabled') ||
                $el.hasClass('location-closed') ||
                $el.attr('data-allowed') === 'false' ||
                ($el.hasClass('btn-picker-split-energy-locked') && $el.attr('data-tooltip'))
            ) {
                $globalTooltip.addClass('locked-tooltip').removeClass('success-tooltip');
            } else {
                $globalTooltip.removeClass('locked-tooltip success-tooltip');
            }
            
            // Default: below element
            $globalTooltip.removeClass('above');
            $globalTooltip.css({
                top:  (rect.bottom + 8) + 'px',
                left: (rect.left + rect.width / 2) + 'px'
            });
            $globalTooltip.addClass('active');

            // Flip above if tooltip overflows viewport bottom
            const tipRect = $globalTooltip[0].getBoundingClientRect();
            if (tipRect.bottom > window.innerHeight - 8) {
                $globalTooltip.addClass('above');
                $globalTooltip.css('top', (rect.top - tipRect.height - 8) + 'px');
            }
        });
        
        $el.on('mouseleave.tooltip', function() {
            $globalTooltip.removeClass('active');
        });
    });
};