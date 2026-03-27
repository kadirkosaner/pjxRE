/**
 * Reading System Module
 * Renders the reading UI – item selection (All/Books/Magazines tabs),
 * duration picker, and Start Reading action.
 * Architecture and CSS class names mirror shopping.js / shopping.css.
 */

let ReadingAPI = null;
let readingContainer = null;
let readingCurrentTab = 'all'; // 'all' | 'books' | 'magazines'
let readingSelectedId = null;
let readingDurationChoice = 15;
let readingReturnPassage = null;

// ============================================
// HELPERS
// ============================================

function getSetup() {
    if (typeof window !== 'undefined' && window.setup) return window.setup;
    if (typeof SugarCube !== 'undefined' && SugarCube.setup) return SugarCube.setup;
    if (typeof setup !== 'undefined') return setup;
    return {};
}

function getState() {
    if (typeof window !== 'undefined' && window.State) return window.State;
    if (typeof SugarCube !== 'undefined' && SugarCube.State) return SugarCube.State;
    if (typeof State !== 'undefined') return State;
    return { variables: {} };
}

function getEngine() {
    if (typeof window !== 'undefined' && window.Engine) return window.Engine;
    if (typeof SugarCube !== 'undefined' && SugarCube.Engine) return SugarCube.Engine;
    if (typeof Engine !== 'undefined') return Engine;
    return null;
}

function findReadingItemDef(id) {
    const items = getSetup().items || {};
    for (const cat of Object.keys(items)) {
        const found = (items[cat] || []).find(function(i) { return i.id === id; });
        if (found) return found;
    }
    return null;
}

function buildReadingTooltipHTML(entry) {
    var lines = [];
    var meta = entry.meta;
    if (meta.type === 'magazine') {
        lines.push('<div class="tooltip-effect">Mood +5 / Stress &minus;5</div>');
        if (meta.gainOnComplete && (meta.gainType || (meta.gainTypeOptions && meta.gainTypeOptions.length))) {
            var statLabel = (meta.gainTypeOptions && meta.gainTypeOptions.length)
                ? meta.gainTypeOptions.join('/')
                : meta.gainType;
            lines.push('<div class="tooltip-effect">+' + meta.gainOnComplete + ' ' + statLabel + '</div>');
        }
        if (meta.skillOnComplete && meta.skillOnComplete.skill) {
            var sc = meta.skillOnComplete;
            lines.push('<div class="tooltip-effect">+' + sc.amount + ' ' + sc.skill + ' skill</div>');
        }
    } else {
        if (meta.gainType && meta.gainValue) {
            lines.push('<div class="tooltip-effect">' + meta.gainType.charAt(0).toUpperCase() + meta.gainType.slice(1) + ' +' + meta.gainValue + ' total</div>');
        }
        lines.push('<div class="tooltip-effect">Focus +0.05 per page</div>');
    }

    return [
        '<div class="tooltip-title">' + entry.name + '</div>',
        entry.desc ? '<div class="tooltip-desc">' + entry.desc + '</div>' : '',
        '<div class="tooltip-divider"></div>',
        lines.join('')
    ].join('');
}

function getReadingEntries() {
    var S = getState();
    var sv = S.variables;
    var setupObj = getSetup();
    var inv = sv.inventory || [];
    var readFinished = sv.readFinished || [];
    var readProgress = sv.readProgress || {};
    var books = [];
    var mags = [];

    for (var i = 0; i < inv.length; i++) {
        var item = inv[i];
        if (!item || !item.id) continue;
        var meta = setupObj.getReadingItem ? setupObj.getReadingItem(item.id) : null;
        if (!meta) continue;
        if (meta.type === 'book' && readFinished.indexOf(item.id) >= 0) continue;
        var itemDef = findReadingItemDef(item.id) || {};
        var pagesRead = readProgress[item.id] || 0;
        var entry = {
            id: item.id,
            type: meta.type,
            name: meta.name || itemDef.name || item.id,
            pages: meta.pages || 0,
            pagesRead: pagesRead,
            image: itemDef.image || '',
            desc: itemDef.desc || '',
            meta: meta
        };
        if (meta.type === 'book') books.push(entry);
        else mags.push(entry);
    }

    return { books: books, mags: mags, all: books.concat(mags) };
}

// ============================================
// STATE PERSISTENCE
// ============================================

function saveReadingState() {
    var S = getState();
    S.variables._readingState = {
        returnPassage: readingReturnPassage,
        tab: readingCurrentTab,
        selectedId: readingSelectedId,
        duration: readingDurationChoice
    };
}

function loadReadingState() {
    var saved = getState().variables._readingState;
    if (saved) {
        readingReturnPassage = saved.returnPassage || readingReturnPassage;
        readingCurrentTab = saved.tab || 'all';
        readingSelectedId = saved.selectedId || null;
        readingDurationChoice = saved.duration || 15;
        return true;
    }
    return false;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderReadingTabs() {
    var tabsEl = readingContainer && readingContainer.querySelector('.reading-tabs');
    if (!tabsEl) return;
    var entries = getReadingEntries();
    var tabs = [
        { id: 'all',       label: 'All (' + entries.all.length + ')' },
        { id: 'books',     label: 'Books (' + entries.books.length + ')' },
        { id: 'magazines', label: 'Magazines (' + entries.mags.length + ')' }
    ];
    tabsEl.innerHTML = tabs.map(function(t) {
        return '<button class="category-tab' + (readingCurrentTab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join('');
    tabsEl.querySelectorAll('.category-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            readingCurrentTab = btn.dataset.tab;
            if (readingSelectedId) {
                var ent = getReadingEntries();
                var pool = readingCurrentTab === 'books' ? ent.books
                    : readingCurrentTab === 'magazines' ? ent.mags
                    : ent.all;
                if (!pool.find(function(e) { return e.id === readingSelectedId; })) {
                    readingSelectedId = null;
                }
            }
            saveReadingState();
            renderReadingTabs();
            renderReadingCards();
            renderReadingPanel();
        });
    });
}

function renderReadingCards() {
    var grid = readingContainer && readingContainer.querySelector('.products-grid');
    if (!grid) return;
    var entries = getReadingEntries();
    var pool = readingCurrentTab === 'books' ? entries.books
        : readingCurrentTab === 'magazines' ? entries.mags
        : entries.all;

    if (pool.length === 0) {
        grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--color-text-tertiary);font-style:italic;">No items in this category.</div>';
        return;
    }

    grid.innerHTML = pool.map(function(entry) {
        var isSelected = entry.id === readingSelectedId;
        var tooltipHtml = buildReadingTooltipHTML(entry);
        var progressLabel = entry.type === 'book'
            ? (entry.pagesRead + ' / ' + entry.pages + ' pages')
            : 'Single-use issue';
        var typeLabel = entry.type === 'book' ? 'Book' : 'Magazine';

        return [
            '<div class="product-card reading-card' + (isSelected ? ' reading-selected' : '') + '" data-item-id="' + entry.id + '">',
                '<div class="product-info-icon">i</div>',
                '<div class="product-tooltip">' + tooltipHtml + '</div>',
                '<div class="product-image reading-image">',
                    entry.image
                        ? '<img src="' + entry.image + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">'
                        : '',
                '</div>',
                '<div class="product-info">',
                    '<div class="product-name">' + entry.name + '</div>',
                    '<div class="reading-card-meta">' + progressLabel + '</div>',
                    '<div class="reading-card-type">' + typeLabel + '</div>',
                '</div>',
            '</div>'
        ].join('');
    }).join('');

    grid.querySelectorAll('.reading-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var id = card.dataset.itemId;
            readingSelectedId = readingSelectedId === id ? null : id;
            saveReadingState();
            renderReadingCards();
            renderReadingPanel();
        });
    });
}

function renderReadingPanel() {
    var panel = readingContainer && readingContainer.querySelector('.reading-panel-body');
    if (!panel) return;

    var durOptions = [
        { value: 15,  label: '15 min' },
        { value: 30,  label: '30 min' },
        { value: 60,  label: '1 hour' },
        { value: 120, label: '2 hours' }
    ];

    var selectionHtml = '';
    if (readingSelectedId) {
        var entries = getReadingEntries();
        var entry = entries.all.find(function(e) { return e.id === readingSelectedId; });
        if (entry) {
            selectionHtml = [
                '<div class="reading-selected-item">',
                    entry.image ? '<img class="reading-selected-img" src="' + entry.image + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">' : '',
                    '<div class="reading-selected-info">',
                        '<div class="reading-selected-name">' + entry.name + '</div>',
                        '<div class="reading-selected-type">' + (entry.type === 'book' ? 'Book' : 'Magazine') + '</div>',
                        entry.type === 'book'
                            ? '<div class="reading-selected-progress">' + entry.pagesRead + ' / ' + entry.pages + ' pages</div>'
                            : '<div class="reading-selected-progress">Single-use</div>',
                    '</div>',
                '</div>'
            ].join('');
        }
    } else {
        selectionHtml = '<div class="reading-empty-hint">Select a book or magazine to begin reading.</div>';
    }

    var durHtml = durOptions.map(function(opt) {
        return '<button class="reading-dur-btn' + (readingDurationChoice === opt.value ? ' active' : '') + '" data-dur="' + opt.value + '">' + opt.label + '</button>';
    }).join('');

    var canRead = !!readingSelectedId;

    panel.innerHTML = [
        selectionHtml,
        '<div class="reading-dur-section">',
            '<div class="reading-dur-label">DURATION</div>',
            '<div class="reading-dur-options">' + durHtml + '</div>',
        '</div>',
        '<div class="reading-actions">',
            '<button class="reading-start-btn' + (canRead ? '' : ' disabled') + '"' + (canRead ? '' : ' disabled') + '>Start Reading</button>',
        '</div>'
    ].join('');

    panel.querySelectorAll('.reading-dur-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            readingDurationChoice = parseInt(btn.dataset.dur, 10);
            saveReadingState();
            panel.querySelectorAll('.reading-dur-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    });

    var startBtn = panel.querySelector('.reading-start-btn');
    if (startBtn && canRead) {
        startBtn.addEventListener('click', function() {
            var S = getState();
            S.variables.readSelectedItem = readingSelectedId;
            S.variables.readDurationChoice = readingDurationChoice;
            document.body.classList.remove('reading-active');
            cleanupReadingSession();
            var eng = getEngine();
            if (eng) eng.play('readExecute');
        });
    }
}

function renderReadingAll() {
    renderReadingTabs();
    renderReadingCards();
    renderReadingPanel();
}

// ============================================
// HTML TEMPLATE  (mirrors shop HTML structure)
// ============================================

function createReadingHTML() {
    return [
        '<div class="reading-container">',
            '<div class="reading-header shop-header">',
                '<a href="#" class="reading-back-link back-link">',
                    '<i class="icon icon-chevron-left"></i> Back',
                '</a>',
                '<div class="reading-title shop-title">Reading</div>',
                '<div></div>',
            '</div>',
            '<div class="reading-main shop-main">',
                '<div class="reading-products products-section">',
                    '<div class="reading-section-header shop-section-header">',
                        '<span class="reading-name shop-name">My Library</span>',
                        '<span class="reading-badge shop-type">Books &amp; Magazines</span>',
                    '</div>',
                    '<div class="reading-tabs shop-tabs-row" style="margin-bottom:var(--spacing-md)"></div>',
                    '<div class="products-grid reading-grid"></div>',
                '</div>',
                '<div class="reading-panel cart-panel">',
                    '<div class="reading-panel-header cart-header">',
                        '<span class="cart-title">SELECTED</span>',
                    '</div>',
                    '<div class="reading-panel-body cart-items"></div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
}

// ============================================
// SESSION CLEANUP
// ============================================

function cleanupReadingSession() {
    var S = getState();
    delete S.variables._readingState;
    console.log('[Reading] Session ended, state cleared.');
}

// ============================================
// MACRO HANDLER
// ============================================

function readingMacroHandler(output, backPassage) {
    var S = getState();
    var saved = S.variables._readingState;
    var isReload = !!saved;

    if (!isReload) {
        readingCurrentTab = 'all';
        readingSelectedId = null;
        readingDurationChoice = S.variables.readDurationChoice || 15;
        readingReturnPassage = backPassage
            || S.variables.readReturnPassage
            || S.variables.location
            || 'Start';
        saveReadingState();
    } else {
        loadReadingState();
    }

    var $wrapper = $(document.createElement('div'));
    $wrapper.addClass('reading-wrapper shop-wrapper');
    $wrapper.html(createReadingHTML());
    $wrapper.appendTo(output);

    readingContainer = $wrapper.find('.reading-container')[0];
    document.body.classList.add('reading-active');

    renderReadingAll();
    setTimeout(function() { renderReadingAll(); }, 0);

    // Back link in header
    $wrapper.find('.reading-back-link').on('click', function(e) {
        e.preventDefault();
        document.body.classList.remove('reading-active');
        cleanupReadingSession();
        var eng = getEngine();
        if (eng) eng.play(readingReturnPassage || 'Start');
    });

    console.log('[Reading] Macro rendered. Tab:', readingCurrentTab, 'Return:', readingReturnPassage);
}

// ============================================
// INIT
// ============================================

function ReadingInit(API) {
    console.log('[Reading] ReadingInit called');
    ReadingAPI = API;
}

window.ReadingInit = ReadingInit;
window.readingModule = {
    macroHandler: readingMacroHandler
};
