/**
 * LayoutManager
 * - Wraps passage content in .passage-content div
 * - Centers content based on timebox position
 * - Skips fullscreen-centered, wardrobe-active, shop-active, restaurant-active pages
 */

window.LayoutInit = function(API) {
    
    function syncNavCardMotionClass() {
        try {
            if (!document.body) return;
            var animationsOn = typeof window.navCardAnimationsEnabled === 'function'
                ? window.navCardAnimationsEnabled()
                : true;
            var isVerticalLayout = typeof window.navCardLayoutMode === 'function'
                ? window.navCardLayoutMode() === 'vertical'
                : false;
            /* Vertical layout defines its own static rules; do NOT apply the horizontal
               static-strip class (nav-accordion-static) when vertical, otherwise the
               100px-wide strip rules win over the vertical 4-per-row grid. */
            var staticGrid = !animationsOn && !isVerticalLayout;
            document.body.classList.toggle('nav-cards-no-motion', staticGrid);
            document.documentElement.classList.toggle('nav-cards-no-motion', staticGrid);
            document.body.classList.toggle('nav-layout-vertical', isVerticalLayout);
            document.body.classList.toggle('nav-layout-horizontal', !isVerticalLayout);
            document.documentElement.classList.toggle('nav-layout-vertical', isVerticalLayout);
            document.documentElement.classList.toggle('nav-layout-horizontal', !isVerticalLayout);
            /* Class on the real <<navMenu>> container — does not depend on body timing */
            var accordions = document.querySelectorAll('.accordion-container.nav-breakout');
            for (var i = 0; i < accordions.length; i++) {
                accordions[i].classList.toggle('nav-accordion-static', staticGrid);
                accordions[i].classList.toggle('nav-layout-vertical', isVerticalLayout);
                accordions[i].classList.toggle('nav-layout-horizontal', !isVerticalLayout);
            }
        } catch (e) { /* ignore */ }
    }
    window.syncNavCardMotionClass = syncNavCardMotionClass;

    // Body classes that should skip layout processing (full-width / fullscreen)
    var skipClasses = ['fullscreen-centered', 'wardrobe-active', 'shop-active', 'restaurant-active'];
    
    function shouldSkip() {
        for (var i = 0; i < skipClasses.length; i++) {
            if (document.body.classList.contains(skipClasses[i])) return true;
        }
        return false;
    }
    
    function wrapContent() {
        if (shouldSkip()) return;
        
        var passage = document.querySelector('#passages .passage');
        if (!passage) return;
        if (passage.querySelector('.passage-content')) return;
        
        var navmenu = passage.querySelector('.navmenu-wrapper');
        if (navmenu) navmenu.remove();
        
        var content = document.createElement('div');
        content.className = 'passage-content';
        
        while (passage.firstChild) {
            content.appendChild(passage.firstChild);
        }
        
        passage.appendChild(content);
        if (navmenu) passage.appendChild(navmenu);
    }
    
    function centerContent() {
        if (shouldSkip()) return;
        
        var content = document.querySelector('.passage-content');
        if (!content) return;
        
        // Reset transform
        content.style.transform = '';
        
        var timebox = document.querySelector('.timebox');
        
        // No timebox = no centering
        if (!timebox) return;
        
        // Center based on timebox
        var tbRect = timebox.getBoundingClientRect();
        var targetCenter = tbRect.left + tbRect.width / 2;
        
        var cRect = content.getBoundingClientRect();
        var cCenter = cRect.left + cRect.width / 2;
        var offset = targetCenter - cCenter;
        
        content.style.transform = 'translateX(' + offset + 'px)';
    }
    
    function applyLayout() {
        syncNavCardMotionClass();
        wrapContent();
        centerContent();
    }
    
    // Passage render
    $(document).on(':passagerender', function() {
        requestAnimationFrame(applyLayout);
    });
    
    // After passage fully loaded
    $(document).on(':passageend', function() {
        requestAnimationFrame(function() {
            requestAnimationFrame(applyLayout);
        });
    });
    
    // After hard reset / initial load
    $(document).one(':storyready', function() {
        requestAnimationFrame(applyLayout);
    });
    
    // Watch for body class changes (wardrobe/shop exit)
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                // Skip class removed, apply layout
                if (!shouldSkip()) {
                    setTimeout(function() {
                        requestAnimationFrame(applyLayout);
                    }, 50);
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Resize handler
    $(window).on('resize', function() {
        requestAnimationFrame(centerContent);
    });
};
