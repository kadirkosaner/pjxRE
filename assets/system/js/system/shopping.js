/**
 * Shopping System Module
 * Renders the shop UI and handles cart/checkout
 */

let ShopAPI = null;
let shopContainer = null;
let currentShopItems = [];
let currentShopName = 'Shop';
let currentShopType = 'Store';
let returnPassage = null;
let shopCurrentCategory = 'all';  // For clothing category filter
let shopShowPurchasableOnly = false;  // Toggle: show only items player can buy (meets confidence etc.)
let isClothingShop = false;   // True if any item is clothing
let isReadingShop = false;    // Bookstore: reading items from both books + magazines arrays → Books / Mags tabs
let shopCategories = [];      // Available categories in this shop

// ============================================
// HELPER FUNCTIONS
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

function moneyRoundSafe(value) {
    if (typeof window.roundMoney === 'function') return window.roundMoney(value);
    var n = Number(value);
    if (!Number.isFinite(n)) n = 0;
    return Math.round(n * 100) / 100;
}

function moneyFormatSafe(value) {
    if (typeof window.formatMoney === 'function') return window.formatMoney(value);
    return moneyRoundSafe(value).toFixed(2);
}

/** Prerequisite line for book tooltips (full stat names, no abbreviations). */
function buildShopReadingRequiresLabel(meta) {
    if (!meta || !meta.requires) return '';
    const parts = [];
    if (meta.requires.intelligence) parts.push('Intelligence ' + meta.requires.intelligence);
    if (meta.requires.focus) parts.push('Focus ' + meta.requires.focus);
    return parts.join(', ');
}

function meetsShopReadingBookRequirements(meta) {
    if (!meta || meta.type !== 'book' || !meta.requires) return true;
    const vars = getState().variables;
    const req = meta.requires;
    if (req.intelligence && (vars.intelligence || 0) < req.intelligence) return false;
    if (req.focus && (vars.focus || 0) < req.focus) return false;
    return true;
}

/** Tooltip label: camelCase id → spaced words (e.g. problemSolving → Problem Solving). Mirrors reading.js. */
function formatReadingStatOrSkillId(id) {
    if (id == null || id === '') return '';
    const spaced = String(id).replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Full product-tooltip inner HTML for books/magazines — same info as Read screen (ReadingDatabase).
 * @param {{ lockedBook?: boolean }} [opts]
 */
function buildShopReadingTooltipHTML(item, meta, opts) {
    if (!item || !meta) return '';
    opts = opts || {};
    const lines = [];
    if (meta.type === 'book') {
        if (meta.pages) {
            lines.push('<div class="tooltip-reading-meta">' + meta.pages + ' pages</div>');
        }
        const reqLabel = buildShopReadingRequiresLabel(meta);
        if (reqLabel) {
            lines.push('<div class="tooltip-reading-req">Requires ' + reqLabel + '</div>');
        }
        if (meta.statPool && meta.statPool.length > 0) {
            const poolLabel = meta.statPool.map(formatReadingStatOrSkillId).join(', ');
            lines.push('<div class="tooltip-effect tooltip-reading-stat">' + poolLabel + '</div>');
        }
        if (meta.skillOnRead && meta.skillOnRead.length > 0) {
            const skillLabel = meta.skillOnRead.map(function(sr) {
                return formatReadingStatOrSkillId(sr.skill);
            }).join(', ');
            lines.push('<div class="tooltip-effect tooltip-reading-skill">' + skillLabel + '</div>');
        }
    } else if (meta.type === 'magazine') {
        lines.push('<div class="tooltip-reading-meta tooltip-reading-single">Single use</div>');
        if (meta.gainOnComplete && (meta.gainType || (meta.gainTypeOptions && meta.gainTypeOptions.length))) {
            const statLabel = (meta.gainTypeOptions && meta.gainTypeOptions.length)
                ? meta.gainTypeOptions.map(formatReadingStatOrSkillId).join(' / ')
                : formatReadingStatOrSkillId(meta.gainType);
            lines.push('<div class="tooltip-effect tooltip-reading-stat">+' + meta.gainOnComplete + ' ' + statLabel + '</div>');
        }
        if (meta.skillOnComplete && meta.skillOnComplete.skill) {
            const sc = meta.skillOnComplete;
            lines.push('<div class="tooltip-effect tooltip-reading-skill">+' + sc.amount + ' ' + formatReadingStatOrSkillId(sc.skill) + ' skill</div>');
        }
    }
    if (lines.length === 0) return '';
    if (meta.type === 'book' && opts.lockedBook && meta.requires) {
        lines.push('<div class="tooltip-requirement">Your stats are not high enough to purchase this book yet.</div>');
    }
    return [
        '<div class="tooltip-title">' + item.name + '</div>',
        item.desc ? '<div class="tooltip-desc">' + item.desc + '</div>' : '',
        '<div class="tooltip-divider"></div>',
        lines.join('')
    ].join('');
}

// Get item from setup.items OR setup.clothingData by ID
// Returns item with _isClothing and _category flags, or null
function getItemById(itemId) {
    const setupObj = getSetup();
    
    // First search regular items
    const items = setupObj.items || {};
    for (const category of Object.keys(items)) {
        const found = items[category].find(i => i.id === itemId);
        if (found) {
            found._isClothing = false;
            found._category = category;
            return found;
        }
    }
    
    // Then search clothing data
    const clothingData = setupObj.clothingData || {};
    for (const category of Object.keys(clothingData)) {
        const found = clothingData[category].find(i => i.id === itemId);
        if (found) {
            found._isClothing = true;
            found._category = category;
            return found;
        }
    }
    
    return null;
}

// Get items by array of IDs
function getItemsByIds(itemIds) {
    return itemIds.map(id => getItemById(id)).filter(i => i !== null);
}

// Get quest items for current location
// These are items that appear in shops when a quest requires them
function getQuestItemsForLocation(locationId) {
    const S = getState();
    const setupObj = getSetup();
    const questItems = [];
    
    // Check active quests
    const questState = S.variables.questState;
    const quests = setupObj.quests;
    const questItemsDb = setupObj.items?.questItems || [];
    
    if (!questState?.active || !quests) return questItems;
    
    for (const [qid, state] of Object.entries(questState.active)) {
        const quest = quests[qid];
        if (!quest?.stages) continue;
        
        const stage = quest.stages[state.stage];
        if (!stage?.items) continue;
        
        // Check items for this location
        stage.items.forEach(questItem => {
            if (!questItem.location || questItem.location === locationId) {
                // Check if objective already completed
                const completed = state.objectives?.[questItem.objectiveId] || false;
                if (!completed) {
                    // Get item data from questItems database
                    const itemData = questItemsDb.find(i => i.id === questItem.itemId);
                    
                    if (itemData) {
                        questItems.push({
                            id: `quest_${qid}_${questItem.objectiveId}`,
                            name: itemData.name,
                            price: itemData.price || 0,
                            image: itemData.image || 'assets/images/items/quest_item.png',
                            desc: itemData.desc || `Quest item for ${quest.title}`,
                            _isClothing: false,
                            _category: 'quest',
                            _isQuestItem: true,
                            _questId: qid,
                            _objectiveId: questItem.objectiveId,
                            _originalItemId: questItem.itemId,
                            hasTooltip: itemData.hasTooltip
                        });
                    }
                }
            }
        });
    }
    
    return questItems;
}

// Get cart from state
function getCart() {
    return getState().variables.shoppingCart || [];
}

// Get cart total
function getCartTotal() {
    const total = getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return moneyRoundSafe(total);
}

// Get balances
function getCashBalance() {
    return getState().variables.cashBalance || 0;
}

function getBankBalance() {
    return getState().variables.bankBalance || 0;
}

// Check if player has item in inventory (non-clothing)
function ownsInventoryItem(itemId) {
    const inventory = getState().variables.inventory;
    if (!inventory || !Array.isArray(inventory)) return false;
    const entry = inventory.find(i => i.id === itemId);
    return entry && (entry.quantity || 0) > 0;
}

/** One physical unit in inventory, one per cart line; hide in shop when owned. Equipment/tools, or ItemDatabase singleInventory. */
function isUniqueInventoryShopItem(item) {
    if (!item || item._isClothing || item._isQuestItem) return false;
    if (item.category === 'equipment' || item.category === 'tool') return true;
    return item.singleInventory === true;
}

/** Fix saves / UI that allowed qty > 1 for unique-inventory shop items in cart. */
function normalizeUniqueCartQuantities() {
    const cart = getState().variables.shoppingCart;
    if (!cart || !Array.isArray(cart)) return;
    cart.forEach(entry => {
        const item = getItemById(entry.id) || (currentShopItems && currentShopItems.find(i => i.id === entry.id));
        if (item && isUniqueInventoryShopItem(item) && entry.quantity > 1) {
            entry.quantity = 1;
        }
    });
}

// Check if player already owns a clothing item
function ownsClothingItem(itemId) {
    const wardrobe = getState().variables.wardrobe;
    if (!wardrobe || !wardrobe.owned) return false;
    return wardrobe.owned.includes(itemId);
}

// Category labels for display (clothing tabs)
const categoryLabels = {
    tops: 'Tops',
    bottoms: 'Bottoms',
    dresses: 'Dresses',
    shoes: 'Shoes',
    socks: 'Socks',
    coats: 'Coats',
    bags: 'Bags',
    earrings: 'Earrings',
    necklaces: 'Necklaces',
    bracelets: 'Bracelets',
    rings: 'Rings',
    bras: 'Bras',
    panties: 'Panties',
    bodysuits: 'Bodysuits',
    swimsuits: 'Swimsuits',
    bikiniTops: 'Bikini Tops',
    bikiniBottoms: 'Bikini Bottoms',
    sleepwear: 'Sleepwear',
    garter: 'Garter',
    special: 'Special',
    equipment: 'Equipment'
};

// Display order for category tabs (only categories present in shop will show)
const categoryTabOrder = ['coats', 'tops', 'bottoms', 'dresses', 'bags', 'shoes', 'socks', 'bodysuits', 'swimsuits', 'bikiniTops', 'bikiniBottoms', 'bras', 'panties', 'sleepwear', 'garter', 'earrings', 'necklaces', 'bracelets', 'rings', 'special', 'equipment'];

// Check if player can wear a clothing item (stat requirements - mirrors wardrobe checkClothingRequirements)
function canWearClothingItem(item) {
    if (!item || !item._isClothing) return { allowed: true, reason: '' };
    const S = getState();
    let reqConf = 0, reqExh = 0, reqCorr = 0;
    const tags = item.tags || [];

    // Baseline from new scores, fallback to legacy tags if missing
    let exposure = typeof item.exposureLevel === 'number' ? item.exposureLevel : null;
    let sexiness = typeof item.sexinessScore === 'number' ? item.sexinessScore : null;
    if (exposure == null || sexiness == null) {
        let tagExposure = 0;
        let tagSexiness = 0;
        if (tags.includes('mild')) { tagExposure = Math.max(tagExposure, 2); tagSexiness = Math.max(tagSexiness, 2); }
        if (tags.includes('revealing')) { tagExposure = Math.max(tagExposure, 4); tagSexiness = Math.max(tagSexiness, 4); }
        if (tags.includes('daring')) { tagExposure = Math.max(tagExposure, 6); tagSexiness = Math.max(tagSexiness, 5); }
        if (tags.includes('bold')) { tagExposure = Math.max(tagExposure, 8); tagSexiness = Math.max(tagSexiness, 7); }
        if (tags.includes('erotic')) { tagExposure = Math.max(tagExposure, 9); tagSexiness = Math.max(tagSexiness, 8); }
        if (tags.includes('lewd')) { tagExposure = Math.max(tagExposure, 10); tagSexiness = Math.max(tagSexiness, 9); }
        if (exposure == null) exposure = tagExposure;
        if (sexiness == null) sexiness = tagSexiness;
    }

    reqConf = Math.max(0, Math.min(100, (exposure * 7) + (sexiness * 3)));
    reqExh = Math.max(0, (exposure - 3) * 6);
    reqCorr = exposure >= 7 ? (exposure - 4) : 0;

    // Item-specific overrides still win
    if (item.reqConfidence != null) reqConf = item.reqConfidence;
    if (item.reqExhibitionism != null) reqExh = item.reqExhibitionism;
    if (item.reqCorruption != null) reqCorr = item.reqCorruption;

    const conf = S.variables.confidence ?? 0;
    const exh = S.variables.exhibitionism ?? 0;
    const corr = S.variables.corruption ?? 0;
    const heelsSkill = (S.variables.skills && S.variables.skills.physical && S.variables.skills.physical.heels) ? S.variables.skills.physical.heels : 0;
    const missing = [];
    if (conf < reqConf) missing.push(`${reqConf} Confidence`);
    if (exh < reqExh) missing.push(`${reqExh} Exhibitionism`);
    if (corr < reqCorr) missing.push(`${reqCorr} Corruption`);
    if (item.reqHeelsSkill != null && heelsSkill < item.reqHeelsSkill) missing.push(`${item.reqHeelsSkill} Heels skill`);
    if (missing.length) return { allowed: false, reason: 'Requires ' + missing.join(', ') };
    return { allowed: true, reason: '' };
}

/** Clothing stat-gate or reading book stat-gate — used for grid sort and card render. */
function getShopProductLockState(item) {
    const isClothing = item._isClothing;
    const wearCheck = isClothing ? canWearClothingItem(item) : { allowed: true, reason: '' };
    const setupObj = getSetup();
    const readMeta = item.category === 'reading' && typeof setupObj.getReadingItem === 'function'
        ? setupObj.getReadingItem(item.id)
        : null;
    const readingBookLocked = !!(readMeta && readMeta.type === 'book' && readMeta.requires && !meetsShopReadingBookRequirements(readMeta));
    const isLocked = (isClothing && !wearCheck.allowed) || readingBookLocked;
    return { isLocked, isClothing, wearCheck, readingBookLocked, readMeta };
}

// ============================================
// CART OPERATIONS
// ============================================

function addToCart(itemId) {
    const S = getState();
    
    // First try normal item lookup
    let item = getItemById(itemId);
    
    // If not found, check currentShopItems (for quest items)
    if (!item && currentShopItems) {
        item = currentShopItems.find(i => i.id === itemId);
    }
    
    if (!item) {
        return;
    }

    if (item.category === 'reading') {
        const setupObj = getSetup();
        if (typeof setupObj.getReadingItem === 'function') {
            const rMeta = setupObj.getReadingItem(itemId);
            if (rMeta && !meetsShopReadingBookRequirements(rMeta)) {
                showToast('Your stats are not high enough to purchase this book yet.');
                return;
            }
        }
    }

    // Ensure cart exists
    if (!S.variables.shoppingCart) {
        S.variables.shoppingCart = [];
    }
    
    const cart = S.variables.shoppingCart;
    const existing = cart.find(c => c.id === itemId);
    
    if (existing) {
        // For clothing, quest items, or unique equipment/tools, limit to 1 per cart line
        if (item._isClothing || item._isQuestItem || isUniqueInventoryShopItem(item)) {
            showToast('You already have this item in your cart!');
            return;
        }
        existing.quantity++;
    } else {
        if (isUniqueInventoryShopItem(item) && ownsInventoryItem(itemId)) {
            showToast('You already own this item.');
            return;
        }
        // Clothing: block purchase if player doesn't meet stat requirements
        if (item._isClothing) {
            const wearCheck = canWearClothingItem(item);
            if (!wearCheck.allowed) {
                showToast(wearCheck.reason);
                return;
            }
        }
        // Store quest item metadata in cart for reliable checkout processing
        const cartEntry = { 
            id: itemId, 
            quantity: 1, 
            price: item.price 
        };
        
        // If it's a quest item, store the IDs for checkout
        if (item._isQuestItem) {
            cartEntry._isQuestItem = true;
            cartEntry._questId = item._questId;
            cartEntry._objectiveId = item._objectiveId;
        }
        
        cart.push(cartEntry);
    }
    
    showToast(`Added: ${item.name}`);
    renderCart();
}

function updateCartQty(itemId, delta) {
    const S = getState();
    const cart = S.variables.shoppingCart;
    const idx = cart.findIndex(c => c.id === itemId);
    
    if (idx === -1) return;
    
    cart[idx].quantity += delta;

    const lineItem = getItemById(itemId) || (currentShopItems && currentShopItems.find(i => i.id === itemId));
    if (lineItem && isUniqueInventoryShopItem(lineItem) && cart[idx].quantity > 1) {
        cart[idx].quantity = 1;
    }
    
    if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }
    
    renderCart();
}

function clearCart() {
    getState().variables.shoppingCart = [];
    renderCart();
}

// ============================================
// STATE MANAGEMENT (PERSISTENCE)
// ============================================

function saveShopState() {
    const S = getState();
    S.variables._shopState = {
        name: currentShopName,
        type: currentShopType,
        itemIds: currentShopItems.map(i => i.id),
        returnPassage: returnPassage,
        category: shopCurrentCategory,
        showPurchasableOnly: shopShowPurchasableOnly
    };
}

function loadShopState() {
    const S = getState();
    const saved = S.variables._shopState;
    if (saved) {
        currentShopName = saved.name;
        currentShopType = saved.type;
        currentShopItems = getItemsByIds(saved.itemIds);
        returnPassage = saved.returnPassage;
        shopCurrentCategory = saved.category || 'all';
        shopShowPurchasableOnly = !!saved.showPurchasableOnly;
        return true;
    }
    return false;
}

// ============================================
// CHECKOUT OPERATIONS
// ============================================

function getEngine() {
    if (typeof window !== 'undefined' && window.Engine) return window.Engine;
    if (typeof SugarCube !== 'undefined' && SugarCube.Engine) return SugarCube.Engine;
    if (typeof Engine !== 'undefined') return Engine;
    return null;
}

function checkoutCash() {
    const S = getState();
    normalizeUniqueCartQuantities();
    const total = moneyRoundSafe(getCartTotal());

    if (total <= 0 || S.variables.cashBalance < total) {
        showToast('Insufficient cash!');
        return false;
    }
    
    // Spend cash
    S.variables.moneySpend = moneyRoundSafe((S.variables.moneySpend || 0) + total);
    S.variables.cashBalance = moneyRoundSafe((S.variables.moneyEarn || 0) - S.variables.moneySpend);

    // Add items to inventory
    addCartToInventory();
    
    // Clear cart
    S.variables.shoppingCart = [];
    
    // Save state before reloading
    saveShopState();
    
    // Reload passage to save history moment (User Request)
    const engine = getEngine();
    if (engine) {
        engine.play(getState().passage);
    } else {
        renderAll();
    }

    return true;
}

function checkoutCard() {
    const S = getState();
    normalizeUniqueCartQuantities();
    const total = moneyRoundSafe(getCartTotal());

    if (total <= 0 || S.variables.bankBalance < total) {
        showToast('Insufficient bank balance!');
        return false;
    }
    
    // Spend from bank
    S.variables.bankSpend = moneyRoundSafe((S.variables.bankSpend || 0) + total);
    S.variables.bankBalance = moneyRoundSafe((S.variables.bankDeposit || 0) - S.variables.bankSpend - (S.variables.bankWithdraw || 0));

    // Add items to inventory
    addCartToInventory();

    // Clear cart
    S.variables.shoppingCart = [];

    // Save state before reloading
    saveShopState();

    // Reload passage to save history moment
    const engine = getEngine();
    if (engine) {
        engine.play(getState().passage);
    } else {
        renderAll();
    }
    
    return true;
}

function addCartToInventory() {
    const S = getState();
    normalizeUniqueCartQuantities();
    const cart = S.variables.shoppingCart || [];
    
    // Ensure inventory exists
    if (!S.variables.inventory) {
        S.variables.inventory = [];
    }
    
    // Ensure wardrobe exists
    if (!S.variables.wardrobe) {
        S.variables.wardrobe = { owned: [], equipped: {}, outfits: [null, null, null, null, null] };
    }
    if (!S.variables.wardrobe.owned) {
        S.variables.wardrobe.owned = [];
    }
    
    const inventory = S.variables.inventory;
    const wardrobeOwned = S.variables.wardrobe.owned;

    cart.forEach(cartItem => {
        // Check if it's a quest item (special handling) - use stored metadata
        if (cartItem._isQuestItem || cartItem.id.startsWith('quest_')) {
            const questId = cartItem._questId;
            const objectiveId = cartItem._objectiveId;
            
            if (!questId || !objectiveId) {
                return;
            }

            // Complete the objective
            if (S.variables.questState?.active?.[questId]) {
                S.variables.questState.active[questId].objectives[objectiveId] = true;

                // Show notification
                if (window.showNotification) {
                    window.showNotification({
                        type: 'quest',
                        message: `✓ Quest item acquired!`,
                        duration: 2500,
                        position: 'rightbar-left'
                    });
                }
                
                // Check if all objectives complete for auto-advance
                const setupObj = getSetup();
                const quest = setupObj.quests?.[questId];
                const state = S.variables.questState.active[questId];
                if (quest && state) {
                    const stage = quest.stages[state.stage];
                    if (stage?.objectives && stage.completeWhen === 'allObjectives') {
                        const allComplete = stage.objectives.every(o => state.objectives[o.id]);
                        if (allComplete) {
                            // Use $.wiki to call the macro
                            if (typeof $ !== 'undefined' && $.wiki) {
                                $.wiki(`<<advanceQuestStage "${questId}">>`);
                            }
                        }
                    }
                }
            }
            return; // Don't add quest items to inventory
        }
        
        const item = getItemById(cartItem.id);
        
        if (!item) {
            return;
        }
        
        // Check if it's clothing
        if (item._isClothing) {
            // Add to wardrobe.owned (clothing doesn't stack, just add if not owned)
            if (!wardrobeOwned.includes(cartItem.id)) {
                wardrobeOwned.push(cartItem.id);
            }
        } else {
            // Add to regular inventory (stackable); cosmetics with maxUses add quantity * maxUses
            let qty = item.maxUses ? cartItem.quantity * item.maxUses : cartItem.quantity;
            if (isUniqueInventoryShopItem(item)) {
                qty = Math.min(qty, 1);
            }
            const existing = inventory.find(i => i.id === cartItem.id);
            if (existing) {
                if (isUniqueInventoryShopItem(item)) {
                    existing.quantity = 1;
                } else {
                    existing.quantity += qty;
                }
            } else {
                inventory.push({ id: cartItem.id, quantity: qty });
            }
        }
    });
}

// ============================================
// UI HELPERS
// ============================================

function showToast(message) {
    const toast = shopContainer?.querySelector('.shop-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderCategoryTabs() {
    const tabsRow = shopContainer?.querySelector('.shop-tabs-row');
    const tabsContainer = shopContainer?.querySelector('.category-tabs');
    if (!tabsRow || !tabsContainer) return;

    const toggleBtn = tabsRow.querySelector('.shop-owned-toggle');

    if (!isClothingShop && !isReadingShop) {
        tabsRow.style.display = 'none';
        if (toggleBtn) toggleBtn.style.display = '';
        return;
    }

    tabsRow.style.display = 'flex';
    tabsContainer.style.display = 'flex';

    if (isReadingShop && toggleBtn) {
        toggleBtn.style.display = 'none';
    } else if (toggleBtn) {
        toggleBtn.style.display = '';
    }

    let html = '';
    if (isClothingShop) {
        html = `<button type="button" class="category-tab ${shopCurrentCategory === 'all' ? 'active' : ''}" data-category="all">All</button>`;
        shopCategories.forEach(cat => {
            const label = categoryLabels[cat] || cat;
            const active = shopCurrentCategory === cat ? 'active' : '';
            html += `<button type="button" class="category-tab ${active}" data-category="${cat}">${label}</button>`;
        });
    } else if (isReadingShop) {
        const readingTabs = [
            { id: 'all', label: 'All' },
            { id: 'books', label: 'Books' },
            { id: 'magazines', label: 'Magazines' }
        ];
        readingTabs.forEach(t => {
            const active = shopCurrentCategory === t.id ? 'active' : '';
            html += `<button type="button" class="category-tab ${active}" data-category="${t.id}">${t.label}</button>`;
        });
    }

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            shopCurrentCategory = tab.dataset.category;
            saveShopState();
            renderCategoryTabs();
            renderProducts();
        });
    });

    if (isClothingShop && toggleBtn) {
        toggleBtn.classList.toggle('active', shopShowPurchasableOnly);
        toggleBtn.setAttribute('aria-pressed', shopShowPurchasableOnly);
        toggleBtn.replaceWith(toggleBtn.cloneNode(true));
        const newToggle = tabsRow.querySelector('.shop-owned-toggle');
        newToggle.addEventListener('click', () => {
            shopShowPurchasableOnly = !shopShowPurchasableOnly;
            saveShopState();
            renderCategoryTabs();
            renderProducts();
        });
    }
}

function renderProducts() {
    const grid = shopContainer?.querySelector('.products-grid');
    if (!grid) return;

    // Filter items:
    // 1. shopShowPurchasableOnly: show only items player can buy (meets confidence etc.); otherwise show all
    // 2. Hide already owned clothing (always)
    // 3. Filter by selected category if not "all"
    let itemsToShow = currentShopItems.filter(item => {
        if (item._isClothing && ownsClothingItem(item.id)) return false; // Hide owned clothing
        // Hide non-clothing unique-inventory items when owned
        if (!item._isClothing && isUniqueInventoryShopItem(item) && ownsInventoryItem(item.id)) return false;
        if (shopShowPurchasableOnly) {
            if (item._isClothing) {
                const wearCheck = canWearClothingItem(item);
                if (!wearCheck.allowed) return false; // Hide locked items
            }
            // Non-clothing: always purchasable
        }
        if (shopCurrentCategory !== 'all' && item._category !== shopCurrentCategory) return false;
        return true;
    });

    /* Unlocked / purchasable items first, locked last; stable order within each group. */
    if (itemsToShow.length > 1) {
        const idxMap = new Map();
        currentShopItems.forEach((it, i) => idxMap.set(it.id, i));
        itemsToShow = itemsToShow
            .map(item => ({
                item,
                locked: getShopProductLockState(item).isLocked ? 1 : 0,
                idx: idxMap.get(item.id) ?? 0
            }))
            .sort((a, b) => a.locked - b.locked || a.idx - b.idx)
            .map(x => x.item);
    }

    if (itemsToShow.length === 0) {
        grid.innerHTML = '<div class="empty-message" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; min-height: 200px; width: 100%; text-align: center; color: var(--color-text-tertiary); font-style: italic;">No items available in this category.</div>';
        return;
    }

    grid.innerHTML = itemsToShow.map(item => {
        const hasEffects = item.effects && item.effects.length > 0;
        const hasDesc = item.desc && item.desc.length > 0;
        const { isLocked, isClothing, wearCheck, readingBookLocked, readMeta } = getShopProductLockState(item);
        const readingTooltipInner = readMeta ? buildShopReadingTooltipHTML(item, readMeta, { lockedBook: readingBookLocked }) : '';
        const showTooltip = !!readingTooltipInner || hasEffects || hasDesc || isClothing;
        const sexiness = typeof item.sexinessScore === 'number' ? item.sexinessScore : 0;
        const exposure = typeof item.exposureLevel === 'number' ? item.exposureLevel : 0;

        const standardTooltipBody = `
                    <div class="tooltip-title">${item.name}</div>
                    ${hasDesc ? `<div class="tooltip-desc">${item.desc}</div>` : ''}
                    ${isLocked && isClothing ? `<div class="tooltip-requirement">${wearCheck.reason}</div>` : ''}
                    ${isClothing ? `
                        <div class="tooltip-divider"></div>
                        <div class="tooltip-stats">
                            ${item.quality ? `<div class="tooltip-row"><span class="label">Quality:</span> <span class="value quality-${item.quality.toLowerCase()}">${item.quality}</span></div>` : ''}
                            ${typeof (item.baseLooks ?? item.looks) === 'number' ? `<div class="tooltip-row"><span class="label">Looks:</span> <span class="value looks-value">+${(item.baseLooks ?? item.looks)}</span></div>` : ''}
                            <div class="tooltip-row"><span class="label">Sexiness:</span> <span class="value">${sexiness}</span></div>
                            <div class="tooltip-row"><span class="label">Exposure:</span> <span class="value">${exposure}</span></div>
                            ${item.tags && item.tags.length ? (() => {
                                const tagColors = {
                                    'naked': '#ef4444', 'underwear': '#f97316', 'revealing': '#f59e0b',
                                    'prostitution': '#ef4444', 'bimbo': '#ec4899', 'casual': '#9ca3af',
                                    'formal': '#3b82f6', 'elegant': '#8b5cf6', 'sporty': '#10b981'
                                };
                                const tagsHtml = item.tags.map(tag => {
                                    const color = tagColors[tag.toLowerCase()] || tagColors.casual;
                                    return `<span class="value" style="color: ${color}">${tag}</span>`;
                                }).join('');
                                return `<div class="tooltip-row tags"><span class="label">Tags:</span> ${tagsHtml}</div>`;
                            })() : ''}
                        </div>
                    ` : ''}
                    ${hasEffects ? item.effects.map(e => `<div class="tooltip-effect">${e.value > 0 ? '+' : ''}${e.value} ${e.stat}</div>`).join('') : ''}`;

        return `
        <div class="product-card${isLocked ? ' product-card-locked' : ''}" data-item-id="${item.id}">
            ${showTooltip ? `
                <div class="product-info-icon">i</div>
                <div class="product-tooltip${readingTooltipInner ? ' product-tooltip-reading' : ''}">
                    ${readingTooltipInner || standardTooltipBody}
                </div>
            ` : ''}
            <div class="product-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
            </div>
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-price">$${item.price}</div>
            </div>
            ${isLocked ? `
                <div class="product-locked-tooltip">${readingBookLocked ? ('This book is too heavy for you to read.' ) : ('This clothing is too much for you. ' + wearCheck.reason)}</div>
            ` : `
                <button class="product-add-btn" data-action="add" data-item="${item.id}">
                    <span class="icon icon-plus"></span>
                </button>
            `}
        </div>
    `}).join('');

    // Bind click events
    grid.querySelectorAll('.product-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(btn.dataset.item);
        });
    });
}

function renderCart() {
    const cartItems = shopContainer?.querySelector('.cart-items');
    const cartCount = shopContainer?.querySelector('.cart-count');
    const cartTotal = shopContainer?.querySelector('.cart-total-amount');
    const cashBtn = shopContainer?.querySelector('.pay-btn.cash');
    const cardBtn = shopContainer?.querySelector('.pay-btn.card');
    
    if (!cartItems) return;

    normalizeUniqueCartQuantities();
    const cart = getCart();
    const total = getCartTotal();
    const cash = getCashBalance();
    const bank = getBankBalance();

    // Update count
    if (cartCount) cartCount.textContent = cart.length;

    // Update total
    if (cartTotal) cartTotal.textContent = '$' + moneyFormatSafe(total);

    // Update buttons
    if (cashBtn) {
        cashBtn.classList.toggle('disabled', total <= 0 || cash < total);
        cashBtn.querySelector('.pay-balance').textContent = `($${moneyFormatSafe(cash)} available)`;
    }
    if (cardBtn) {
        cardBtn.classList.toggle('disabled', total <= 0 || bank < total);
        cardBtn.querySelector('.pay-balance').textContent = `($${moneyFormatSafe(bank)} available)`;
    }

    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        return;
    }

    cartItems.innerHTML = cart.map(cartItem => {
        // First try normal item lookup
        let item = getItemById(cartItem.id);
        
        // If not found, check currentShopItems (for quest items)
        if (!item && currentShopItems) {
            item = currentShopItems.find(i => i.id === cartItem.id);
        }
        
        if (!item) return '';
        
        const isClothing = item._isClothing;
        const isQuestItem = item._isQuestItem;
        const singleCartLine = isClothing || isQuestItem || isUniqueInventoryShopItem(item);
        
        return `
            <div class="cart-item ${isQuestItem ? 'quest-item' : ''}" data-item-id="${cartItem.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price} ${singleCartLine ? '' : `× ${cartItem.quantity}`}</div>
                </div>
                <div class="cart-item-qty">
                    ${singleCartLine ? 
                        `<button class="qty-btn" data-action="minus" data-item="${cartItem.id}" title="Remove"><span class="icon icon-close"></span></button>` :
                        `
                        <button class="qty-btn" data-action="minus" data-item="${cartItem.id}">−</button>
                        <span class="qty-value">${cartItem.quantity}</span>
                        <button class="qty-btn" data-action="plus" data-item="${cartItem.id}">+</button>
                        `
                    }
                </div>
            </div>
        `;
    }).join('');

    // Bind qty buttons
    cartItems.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = btn.dataset.action === 'plus' ? 1 : -1;
            updateCartQty(btn.dataset.item, delta);
        });
    });
}

function renderHeader() {
    const nameEl = shopContainer?.querySelector('.shop-name');
    const typeEl = shopContainer?.querySelector('.shop-type');
    const cashEl = shopContainer?.querySelector('.balance-cash');
    const bankEl = shopContainer?.querySelector('.balance-bank');

    if (nameEl) nameEl.textContent = currentShopName;
    if (typeEl) typeEl.textContent = currentShopType;
    if (cashEl) cashEl.textContent = '$' + moneyFormatSafe(getCashBalance());
    if (bankEl) bankEl.textContent = '$' + moneyFormatSafe(getBankBalance());
}

function renderAll() {
    renderHeader();
    renderCategoryTabs();
    renderProducts();
    renderCart();
}

// ============================================
// HTML TEMPLATE
// ============================================

function createShopHTML() {
    return `
        <div class="shop-container">
            <div class="shop-header">
                <a href="#" class="back-link" data-passage="${returnPassage}">
                    <i class="icon icon-chevron-left"></i> Back
                </a>
                <div class="shop-title">${currentShopName}</div>
                <div class="balance-display">
                    <div class="balance-item">Cash: <span class="balance-amount balance-cash">$0</span></div>
                    <div class="balance-item">Bank: <span class="balance-amount balance-bank">$0</span></div>
                </div>
            </div>

            <div class="shop-main">
                <div class="products-section">
                    <div class="shop-section-header">
                        <span class="shop-name">${currentShopName}</span>
                        <span class="shop-type">${currentShopType}</span>
                    </div>
                    <div class="shop-tabs-row">
                        <div class="category-tabs"></div>
                        <button type="button" class="shop-owned-toggle" title="Show only items you can buy (meets requirements)" aria-pressed="false">
                            <span class="toggle-track"><span class="toggle-thumb"></span></span>
                            <span class="toggle-label">Purchasable only</span>
                        </button>
                    </div>
                    <div class="products-grid"></div>
                </div>

                <div class="cart-panel">
                    <div class="cart-header">
                        <span class="cart-title">YOUR CART</span>
                        <span class="cart-count">0</span>
                    </div>
                    <div class="cart-items">
                        <div class="cart-empty">Your cart is empty</div>
                    </div>
                    <div class="cart-summary">
                        <div class="cart-total">
                            <span class="cart-total-label">Total:</span>
                            <span class="cart-total-amount">$0</span>
                        </div>
                        <div class="payment-buttons">
                            <button class="pay-btn cash disabled">
                                Pay with Cash
                                <span class="pay-balance">($0 available)</span>
                            </button>
                            <button class="pay-btn card disabled">
                                Pay with Card
                                <span class="pay-balance">($0 available)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="shop-toast"></div>
    `;
}

// ============================================
// SESSION CLEANUP
// ============================================

function cleanupShopSession() {
    const S = getState();
    // Clear cart on exit
    S.variables.shoppingCart = [];
    // Clear saved state so next entry is fresh
    delete S.variables._shopState;
}

// ============================================
// MACRO HANDLER
// ============================================

function shopMacroHandler(output, shopName, shopType, itemIds, backPassage) {
    const S = getState();
    const saved = S.variables._shopState;

    // Check if we are reloading the same shop
    const isReload = saved && saved.name === (shopName || 'Shop');

    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0 && !isReload) {
        // BRAND NEW shop visit - Initialize state
        currentShopName = shopName || 'Shop';
        currentShopType = shopType || 'Store';
        currentShopItems = getItemsByIds(itemIds);
        returnPassage = backPassage || getState().variables.location || 'start';
        shopCurrentCategory = 'all';
        shopShowPurchasableOnly = false;

        // Add quest items for this location
        const locationId = S.variables.location || '';
        const questItems = getQuestItemsForLocation(locationId);
        if (questItems.length > 0) {
            currentShopItems = [...questItems, ...currentShopItems]; // Quest items first
        }

        saveShopState();
    } else {
        // Reloading same shop OR different shop with empty items
        const sameShop = saved && (saved.name === (shopName || 'Shop'));
        if (sameShop && loadShopState()) {
            // Re-add quest items (they might have changed)
            const locationId = S.variables.location || '';
            const questItems = getQuestItemsForLocation(locationId);
            // Filter out existing quest items and re-add
            currentShopItems = currentShopItems.filter(i => !i._isQuestItem);
            if (questItems.length > 0) {
                currentShopItems = [...questItems, ...currentShopItems];
            }
        } else {
            // Different shop or no saved state: init this shop (items may be empty)
            currentShopName = shopName || 'Shop';
            currentShopType = shopType || 'Store';
            currentShopItems = (itemIds && Array.isArray(itemIds)) ? getItemsByIds(itemIds) : [];
            returnPassage = backPassage || S.variables.location || 'start';
            shopCurrentCategory = 'all';
            shopShowPurchasableOnly = false;
            const locationId = S.variables.location || '';
            const questItems = getQuestItemsForLocation(locationId);
            if (questItems.length > 0) {
                currentShopItems = [...questItems, ...currentShopItems];
            }
            saveShopState();
        }
    }

    // Detect if this is a clothing shop and extract categories
    isClothingShop = currentShopItems.some(item => item._isClothing);
    isReadingShop = false;

    if (isClothingShop) {
        // Extract unique categories from items, sorted by display order
        const cats = new Set();
        currentShopItems.forEach(item => {
            if (item._category) cats.add(item._category);
        });
        shopCategories = Array.from(cats).sort((a, b) => {
            const idxA = categoryTabOrder.indexOf(a);
            const idxB = categoryTabOrder.indexOf(b);
            const orderA = idxA === -1 ? 999 : idxA;
            const orderB = idxB === -1 ? 999 : idxB;
            return orderA - orderB;
        });
    } else {
        shopCategories = [];
        const stock = currentShopItems.filter(item => !item._isQuestItem && item.category === 'reading');
        if (stock.length > 0 && stock.length === currentShopItems.filter(i => !i._isQuestItem).length) {
            const hasBooks = stock.some(i => i._category === 'books');
            const hasMags = stock.some(i => i._category === 'magazines');
            isReadingShop = hasBooks && hasMags;
        }
    }

    if (isReadingShop && !['all', 'books', 'magazines'].includes(shopCurrentCategory)) {
        shopCurrentCategory = 'all';
    }
    if (!isReadingShop && (shopCurrentCategory === 'books' || shopCurrentCategory === 'magazines')) {
        shopCurrentCategory = 'all';
    }

    // Create wrapper
    const $wrapper = $(document.createElement('div'));
    $wrapper.addClass('shop-wrapper');
    $wrapper.html(createShopHTML());
    $wrapper.appendTo(output);

    shopContainer = $wrapper.find('.shop-container')[0];
    if (shopContainer) {
        shopContainer.classList.toggle('shop-has-reading-tabs', !!isReadingShop);
    }

    // Add body class for full-width layout (like wardrobe)
    document.body.classList.add('shop-active');
    
    // Render initial content
    renderAll();

    // Bind back link — always navigate to the backPassage (location), never backward
    $wrapper.find('.back-link').on('click', function(e) {
        e.preventDefault();
        cleanupShopSession();
        document.body.classList.remove('shop-active');
        const passage = $(this).data('passage');
        if (passage && ShopAPI && ShopAPI.Engine) {
            ShopAPI.Engine.play(passage);
        }
    });

    // Bind payment buttons
    $wrapper.find('.pay-btn.cash').on('click', function() {
        if (!$(this).hasClass('disabled')) {
            checkoutCash();
        }
    });

    $wrapper.find('.pay-btn.card').on('click', function() {
        if (!$(this).hasClass('disabled')) {
            checkoutCard();
        }
    });

    // Initial render
    setTimeout(() => renderAll(), 0);
}

// ============================================
// INIT FUNCTION
// ============================================

function ShoppingInit(API) {
    ShopAPI = API;
}

// Export to window for loader auto-init
window.ShoppingInit = ShoppingInit;

// Export to window for macro access
window.shopModule = {
    macroHandler: shopMacroHandler
};
