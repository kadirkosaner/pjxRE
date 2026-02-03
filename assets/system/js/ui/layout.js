/**
 * LayoutManager
 * - Pasaj içeriğini .passage-content ile sarar
 * - Timebox varsa → timebox'a göre ortala
 * - fullscreen-centered varsa → viewport ortasına göre ortala
 * - Wardrobe/Shopping → ortalama yok
 */

window.LayoutInit = function(API) {
    
    // Layout işlemleri atlanacak body class'ları
    var skipClasses = ['fullscreen-centered', 'wardrobe-active', 'shop-active'];
    
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
        
        // Transform sıfırla
        content.style.transform = '';
        
        var timebox = document.querySelector('.timebox');
        
        // Timebox yoksa ortalama yapma
        if (!timebox) return;
        
        // Timebox'a göre ortala
        var tbRect = timebox.getBoundingClientRect();
        var targetCenter = tbRect.left + tbRect.width / 2;
        
        var cRect = content.getBoundingClientRect();
        var cCenter = cRect.left + cRect.width / 2;
        var offset = targetCenter - cCenter;
        
        content.style.transform = 'translateX(' + offset + 'px)';
    }
    
    $(document).on(':passagerender', function() {
        requestAnimationFrame(function() {
            wrapContent();
            centerContent();
        });
    });
    
    $(window).on('resize', function() {
        requestAnimationFrame(centerContent);
    });
};
