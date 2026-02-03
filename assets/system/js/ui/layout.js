window.LayoutInit = function(API) {
    
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
    
    function centerContent() {
        var timebox = document.querySelector('.timebox');
        var content = document.querySelector('.passage-content');
        if (!timebox || !content) return;
        
        content.style.transform = '';
        
        var tbRect = timebox.getBoundingClientRect();
        var cRect = content.getBoundingClientRect();
        
        var tbCenter = tbRect.left + tbRect.width / 2;
        var cCenter = cRect.left + cRect.width / 2;
        var offset = tbCenter - cCenter;
        
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
