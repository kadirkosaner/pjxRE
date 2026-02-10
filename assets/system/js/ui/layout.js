/**
 * LayoutManager
 * - Wraps passage content in .passage-content div
 * - Centers content based on timebox position
 * - Skips fullscreen-centered, wardrobe-active, shop-active, restaurant-active pages
 */

window.LayoutInit = function(API) {
    
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
