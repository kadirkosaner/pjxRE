/**
 * LayoutManager
 * 1. Pasaj içeriğini .passage-content ile sarar (navmenu hariç)
 * 2. İçeriği timebox'a göre ortalar
 */

window.LayoutInit = function(API) {
    
    // İçeriği .passage-content ile sar
    function wrapContent() {
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
    
    // Timebox'a göre ortala
    function centerContent() {
        var timebox = document.querySelector('.timebox');
        var content = document.querySelector('.passage-content');
        if (!timebox || !content) return;
        
        // Önce transform'u sıfırla
        content.style.transform = '';
        
        var tbRect = timebox.getBoundingClientRect();
        var cRect = content.getBoundingClientRect();
        
        var tbCenter = tbRect.left + tbRect.width / 2;
        var cCenter = cRect.left + cRect.width / 2;
        var offset = tbCenter - cCenter;
        
        content.style.transform = 'translateX(' + offset + 'px)';
    }
    
    // Her pasajda çalıştır
    $(document).on(':passagerender', function() {
        requestAnimationFrame(function() {
            wrapContent();
            centerContent();
        });
    });
    
    // Resize'da ortala
    $(window).on('resize', function() {
        requestAnimationFrame(centerContent);
    });
};
