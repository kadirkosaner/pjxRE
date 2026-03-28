/**
 * Reading System Module
 * Renders the reading UI – item selection (All/Books/Magazines tabs),
 * duration picker, and Start Reading action.
 * Architecture and CSS class names mirror shopping.js / shopping.css.
 */

let ReadingAPI = null;
let readingContainer = null;
let readingCurrentTab = 'all'; // 'all' | 'books' | 'magazines' | 'finished'
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

// ============================================
// READING SPEED HELPERS  (mirrors setup.calcReadingSpeed)
// ============================================

function calcReadingSpeed() {
    var vars = getState().variables;
    var INT  = vars.intelligence || 0;
    var FOCUS = vars.focus       || 0;
    var WIL  = vars.willpower   || 0;
    return 1 + (INT * 0.004) + (FOCUS * 0.003) + (WIL * 0.002);
}

/** Returns estimated reading time in minutes (rounded to nearest 15, min 15) */
function calcEstimatedTime(pages) {
    var speed = calcReadingSpeed();
    return Math.max(15, Math.round((pages / speed) / 15) * 15);
}

/** Returns estimated pages read in a given duration (minutes) */
function calcEstimatedPages(durationMinutes) {
    return Math.max(1, Math.floor(durationMinutes * calcReadingSpeed()));
}

function buildReadingTooltipHTML(entry) {
    var lines = [];
    var meta = entry.meta;
    if (meta.type === 'magazine') {
        lines.push('<div class="tooltip-effect" style="opacity:0.6;font-size:0.72rem">Single Use</div>');
        if (meta.gainOnComplete && (meta.gainType || (meta.gainTypeOptions && meta.gainTypeOptions.length))) {
            var statLabel = (meta.gainTypeOptions && meta.gainTypeOptions.length)
                ? meta.gainTypeOptions.join(' / ')
                : meta.gainType;
            lines.push('<div class="tooltip-effect">+' + meta.gainOnComplete + ' ' + statLabel + '</div>');
        }
        if (meta.skillOnComplete && meta.skillOnComplete.skill) {
            var sc = meta.skillOnComplete;
            lines.push('<div class="tooltip-effect">+' + sc.amount + ' ' + sc.skill + ' skill</div>');
        }
    } else {
        if (meta.statPool && meta.statPool.length > 0) {
            var poolLabel = meta.statPool.map(function(s) {
                return s.charAt(0).toUpperCase() + s.slice(1);
            }).join(', ');
            lines.push('<div class="tooltip-effect tooltip-reading-stat">' + poolLabel + '</div>');
        }
        if (meta.skillOnRead && meta.skillOnRead.length > 0) {
            var skillLabel = meta.skillOnRead.map(function(sr) {
                return sr.skill.charAt(0).toUpperCase() + sr.skill.slice(1);
            }).join(', ');
            lines.push('<div class="tooltip-effect tooltip-reading-skill">' + skillLabel + '</div>');
        }
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
    var finishedBooks = [];

    for (var i = 0; i < inv.length; i++) {
        var item = inv[i];
        if (!item || !item.id) continue;
        var meta = setupObj.getReadingItem ? setupObj.getReadingItem(item.id) : null;
        if (!meta) continue;
        var itemDef = findReadingItemDef(item.id) || {};
        if (meta.type === 'book' && readFinished.indexOf(item.id) >= 0) {
            var p = meta.pages || 0;
            finishedBooks.push({
                id: item.id,
                type: 'book',
                name: meta.name || itemDef.name || item.id,
                pages: p,
                pagesRead: p,
                isFinished: true,
                image: itemDef.image || '',
                desc: itemDef.desc || '',
                meta: meta
            });
            continue;
        }
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

    return { books: books, mags: mags, all: books.concat(mags), finishedBooks: finishedBooks };
}

/** Resolve a library entry whether in-progress or finished. */
function getReadingEntryById(id) {
    if (!id) return null;
    var e = getReadingEntries();
    var hit = e.all.find(function(x) { return x.id === id; });
    if (hit) return hit;
    return e.finishedBooks.find(function(x) { return x.id === id; }) || null;
}

/** Unlocked / readable first, stat-locked books last; stable order within each group. */
function sortReadingPoolUnlockFirst(pool) {
    if (!pool || pool.length < 2) return pool;
    var vars = getState().variables;
    function meetsReq(meta) {
        if (!meta || !meta.requires) return true;
        var req = meta.requires;
        if (req.intelligence && (vars.intelligence || 0) < req.intelligence) return false;
        if (req.focus && (vars.focus || 0) < req.focus) return false;
        return true;
    }
    function lockedBook(entry) {
        return entry.type === 'book' && entry.meta && entry.meta.requires && !meetsReq(entry.meta);
    }
    var tagged = pool.map(function(entry, idx) { return { entry: entry, idx: idx }; });
    tagged.sort(function(a, b) {
        var la = lockedBook(a.entry) ? 1 : 0;
        var lb = lockedBook(b.entry) ? 1 : 0;
        if (la !== lb) return la - lb;
        return a.idx - b.idx;
    });
    return tagged.map(function(t) { return t.entry; });
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
        var t = saved.tab || 'all';
        if (t !== 'all' && t !== 'books' && t !== 'magazines' && t !== 'finished') t = 'all';
        readingCurrentTab = t;
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
        { id: 'magazines', label: 'Magazines (' + entries.mags.length + ')' },
        { id: 'finished',  label: 'Finished (' + entries.finishedBooks.length + ')' }
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
                    : readingCurrentTab === 'finished' ? ent.finishedBooks
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
    var pool = readingCurrentTab === 'books' ? entries.books.slice()
        : readingCurrentTab === 'magazines' ? entries.mags.slice()
        : readingCurrentTab === 'finished' ? entries.finishedBooks.slice()
        : entries.all.slice();

    if (readingCurrentTab === 'all' || readingCurrentTab === 'books') {
        pool = sortReadingPoolUnlockFirst(pool);
    }

    if (pool.length === 0) {
        grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--color-text-tertiary);font-style:italic;">No items in this category.</div>';
        return;
    }

    var vars = getState().variables;

    function meetsRequirements(meta) {
        if (!meta.requires) return true;
        var req = meta.requires;
        if (req.intelligence && (vars.intelligence || 0) < req.intelligence) return false;
        if (req.focus && (vars.focus || 0) < req.focus) return false;
        return true;
    }

    function buildRequiresLabel(meta) {
        if (!meta.requires) return '';
        var parts = [];
        if (meta.requires.intelligence) parts.push('Intelligence ' + meta.requires.intelligence);
        if (meta.requires.focus) parts.push('Focus ' + meta.requires.focus);
        return parts.join(', ');
    }

    grid.innerHTML = pool.map(function(entry) {
        var isSelected = entry.id === readingSelectedId;
        var finished = !!entry.isFinished;
        var locked = !finished && entry.type === 'book' && !meetsRequirements(entry.meta);
        var tooltipHtml = buildReadingTooltipHTML(entry);
        var progressLabel = finished
            ? 'Finished'
            : (entry.type === 'book'
                ? (entry.pagesRead + ' / ' + entry.pages + ' pages')
                : 'Single use');
        var typeLabel = entry.type === 'book' ? 'Book' : 'Magazine';

        var lockOverlay = '';
        if (locked) {
            var reqLabel = buildRequiresLabel(entry.meta);
            lockOverlay = '<div class="reading-lock-overlay"><span class="reading-lock-req">Requires ' + reqLabel + '</span></div>';
        }

        return [
            '<div class="product-card reading-card' + (finished ? ' reading-finished' : '') + (isSelected && !locked ? ' reading-selected' : '') + (locked ? ' reading-locked' : '') + '" data-item-id="' + entry.id + '" data-locked="' + (locked ? '1' : '0') + '" data-finished="' + (finished ? '1' : '0') + '">',
                '<div class="product-info-icon">i</div>',
                '<div class="product-tooltip">' + tooltipHtml + '</div>',
                '<div class="product-image reading-image">',
                    entry.image
                        ? '<img src="' + entry.image + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">'
                        : '',
                    lockOverlay,
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
            if (card.dataset.locked === '1') return;
            if (card.dataset.finished === '1') {
                var fid = card.dataset.itemId;
                readingSelectedId = readingSelectedId === fid ? null : fid;
                saveReadingState();
                renderReadingCards();
                renderReadingPanel();
                return;
            }
            var id = card.dataset.itemId;
            readingSelectedId = readingSelectedId === id ? null : id;

            // Auto-select optimal duration for near-completion books
            if (readingSelectedId) {
                var selEntry = getReadingEntryById(readingSelectedId);
                if (selEntry && selEntry.type === 'book' && !selEntry.isFinished) {
                    var remPages = (selEntry.pages || 0) - (selEntry.pagesRead || 0);
                    var spd = calcReadingSpeed();
                    var minsNeed = remPages / spd;
                    var dOpts = [15, 30, 45, 60];
                    for (var di2 = 0; di2 < dOpts.length; di2++) {
                        if (dOpts[di2] >= minsNeed) {
                            readingDurationChoice = dOpts[di2];
                            break;
                        }
                    }
                }
            }

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
        { value: 15, label: '15 min' },
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
        { value: 60, label: '1 hour' }
    ];

    // Energy helpers — declared first so they're available throughout
    var currentEnergy = getState().variables.energy || 0;
    function energyCostFor(mins) { return Math.round(mins * 0.2); }
    function canAffordDuration(mins) { return currentEnergy - energyCostFor(mins) >= 10; }

    var canRead = !!readingSelectedId;
    var selectionHtml = '';
    var isMagazine = false;
    var estimatedTime = 0;

    // Book daily limit check (120 min = 2 hours) — soft: still lets player start, passage shows narrative
    var bookDailyLimit = 120;
    var bookMinutesRead = (getState().variables.daily && getState().variables.daily.bookMinutesRead) || 0;
    var bookLimitReached = bookMinutesRead >= bookDailyLimit;

    // Near-completion: will the chosen duration finish the book?
    var bookWillFinish = false;
    var bookMinToFinish = null; // smallest dur option that finishes the book (or null if can't in one session)

    if (readingSelectedId) {
        var entry = getReadingEntryById(readingSelectedId);
        if (entry) {
            var isFinishedBook = !!entry.isFinished;
            isMagazine = entry.type === 'magazine';
            if (isMagazine) {
                estimatedTime = calcEstimatedTime(entry.pages || 36);
            }

            // Near-completion calc for books
            if (!isMagazine && !isFinishedBook) {
                var remaining = (entry.pages || 0) - (entry.pagesRead || 0);
                var speed = calcReadingSpeed();
                var minsNeeded = remaining / speed; // exact minutes to finish

                // Find smallest standard duration that covers remaining pages
                for (var di = 0; di < durOptions.length; di++) {
                    if (durOptions[di].value >= minsNeeded) {
                        bookMinToFinish = durOptions[di].value;
                        break;
                    }
                }
                // If current selection covers remaining, book will finish this session
                bookWillFinish = remaining <= calcEstimatedPages(readingDurationChoice);
            }

            var progressLine = '';
            if (isFinishedBook) {
                progressLine = '<div class="reading-selected-progress">Finished &mdash; ' + entry.pages + ' / ' + entry.pages + ' pages</div>' +
                    '<div class="reading-selected-progress reading-finished-hint">This book is already complete.</div>';
                canRead = false;
            } else if (!isMagazine && bookLimitReached) {
                // Soft warning — button still works, passage will show the limit narrative
                progressLine = '<div class="reading-selected-progress reading-daily-limit-note">You\'ve already read 2 hours today — but go ahead if you want.</div>';
            } else if (isMagazine) {
                var magEnergyOk = canAffordDuration(estimatedTime);
                var magEnergyNote = magEnergyOk ? '' : '<div class="reading-selected-progress reading-energy-warn">Not enough energy</div>';
                progressLine = '<div class="reading-selected-progress reading-single-use">Single use</div>' +
                    '<div class="reading-selected-progress reading-est-time">Estimated ' + estimatedTime + ' minutes to read</div>' +
                    magEnergyNote;
            } else {
                var estPages = calcEstimatedPages(readingDurationChoice);
                var remaining2 = (entry.pages || 0) - (entry.pagesRead || 0);
                estPages = Math.min(estPages, remaining2);
                var remainNote = bookWillFinish
                    ? '<div class="reading-selected-progress reading-finish-note">This session will finish the book!</div>'
                    : '<div class="reading-selected-progress">' + remaining2 + ' pages left</div>';
                progressLine = '<div class="reading-selected-progress">' + entry.pagesRead + ' / ' + entry.pages + ' pages &mdash; ~' + estPages + ' this session</div>' + remainNote;
            }

            selectionHtml = [
                '<div class="reading-selected-item">',
                    entry.image ? '<img class="reading-selected-img" src="' + entry.image + '" alt="' + entry.name + '" onerror="this.style.display=\'none\'">' : '',
                    '<div class="reading-selected-info">',
                        '<div class="reading-selected-name">' + entry.name + '</div>',
                        '<div class="reading-selected-type">' + (isMagazine ? 'Magazine' : 'Book') + '</div>',
                        progressLine,
                    '</div>',
                '</div>'
            ].join('');
        }
    } else {
        selectionHtml = '<div class="reading-empty-hint">Select a book or magazine to begin reading.</div>';
    }

    // Duration section: only for in-progress books
    var durSectionHtml = '';
    var sel = readingSelectedId ? getReadingEntryById(readingSelectedId) : null;
    var showBookDuration = sel && sel.type === 'book' && !sel.isFinished;

    // Clamp current choice if it's beyond the finish threshold
    if (showBookDuration && bookMinToFinish !== null && readingDurationChoice > bookMinToFinish) {
        readingDurationChoice = bookMinToFinish;
    }
    if (showBookDuration) {
        var durHtml = durOptions.map(function(opt) {
            var affordable = canAffordDuration(opt.value);
            var selRemaining = (sel.pages || 0) - (sel.pagesRead || 0);
            var pagesThisSession = Math.min(calcEstimatedPages(opt.value), selRemaining);
            var willFinishThis = pagesThisSession >= selRemaining;

            // Disable durations ABOVE the minimum-finish option (no point reading longer)
            var beyondFinish = bookMinToFinish !== null && opt.value > bookMinToFinish;

            var isDisabled = !affordable || beyondFinish;
            var activeClass = readingDurationChoice === opt.value ? ' active' : '';
            var lockedClass = !affordable ? ' dur-energy-locked' : (beyondFinish ? ' dur-beyond-finish' : '');
            var disabledAttr = isDisabled ? ' disabled' : '';
            var finishClass = (willFinishThis && !beyondFinish && affordable) ? ' dur-finish' : '';
            var energyTooltip = !affordable ? '<span class="dur-energy-tooltip">Not enough energy</span>' : '';
            var beyondTooltip = beyondFinish ? '<span class="dur-energy-tooltip">Book finishes at ' + bookMinToFinish + ' min</span>' : '';
            var finishBadge = (willFinishThis && !beyondFinish && affordable) ? '<span class="dur-finish-badge">Finish</span>' : '';

            return '<button class="reading-dur-btn' + activeClass + lockedClass + finishClass + '"' + disabledAttr + ' data-dur="' + opt.value + '">' +
                opt.label + finishBadge + energyTooltip + beyondTooltip +
            '</button>';
        }).join('');
        durSectionHtml = [
            '<div class="reading-dur-section">',
                '<div class="reading-dur-label">DURATION</div>',
                '<div class="reading-dur-options">' + durHtml + '</div>',
            '</div>'
        ].join('');
    }

    // Magazine: block if not enough energy
    if (isMagazine && estimatedTime > 0 && !canAffordDuration(estimatedTime)) {
        canRead = false;
    }

    var startLabel = (sel && sel.isFinished) ? 'Finished' : (bookWillFinish ? 'Finish Book' : 'Start Reading');

    panel.innerHTML = [
        selectionHtml,
        durSectionHtml,
        '<div class="reading-actions">',
            '<button class="reading-start-btn' + (canRead ? '' : ' disabled') + '"' + (canRead ? '' : ' disabled') + '>' + startLabel + '</button>',
        '</div>'
    ].join('');

    panel.querySelectorAll('.reading-dur-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.disabled || btn.classList.contains('dur-beyond-finish')) return;
            readingDurationChoice = parseInt(btn.dataset.dur, 10);
            saveReadingState();
            panel.querySelectorAll('.reading-dur-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            // Re-render to update estimated pages
            renderReadingPanel();
        });
    });

    var startBtn = panel.querySelector('.reading-start-btn');
    if (startBtn && canRead) {
        startBtn.addEventListener('click', function() {
            var S = getState();
            S.variables.readSelectedItem = readingSelectedId;
            // Magazine: use calculated estimated time; Book: use chosen duration
            S.variables.readDurationChoice = isMagazine ? estimatedTime : readingDurationChoice;
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
