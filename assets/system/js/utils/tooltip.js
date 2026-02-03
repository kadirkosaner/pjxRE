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
            
            // Handle success (green) tooltip
            if ($el.attr('data-tooltip-type') === 'success') {
                $globalTooltip.addClass('success-tooltip').removeClass('locked-tooltip');
            } else if ($el.hasClass('locked') || $el.hasClass('disabled') || $el.attr('data-allowed') === 'false') {
                $globalTooltip.addClass('locked-tooltip').removeClass('success-tooltip');
            } else {
                $globalTooltip.removeClass('locked-tooltip success-tooltip');
            }
            
            $globalTooltip.css({
                'top': (rect.bottom + 8) + 'px',
                'left': (rect.left + rect.width / 2) + 'px'
            });
            
            $globalTooltip.addClass('active');
        });
        
        $el.on('mouseleave.tooltip', function() {
            $globalTooltip.removeClass('active');
        });
    });
};