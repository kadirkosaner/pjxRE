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
let isClothingShop = false;   // True if any item is clothing
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
            console.log(`[Shopping DEBUG] Checking item: ${questItem.itemId}, item.location: "${questItem.location}", current locationId: "${locationId}"`);
            if (!questItem.location || questItem.location === locationId) {
                // Check if objective already completed
                const completed = state.objectives?.[questItem.objectiveId] || false;
                if (!completed) {
                    // Get item data from questItems database
                    const itemData = questItemsDb.find(i => i.id === questItem.itemId);
                    
                    if (itemData) {
                        console.log(`[Shopping DEBUG] Adding quest item: ${itemData.name} (location match: ${questItem.location === locationId})`);
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
                    } else {
                        console.warn(`[Shopping] Quest item not found in database: ${questItem.itemId}`);
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
    return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Get balances
function getCashBalance() {
    return getState().variables.cashBalance || 0;
}

function getBankBalance() {
    return getState().variables.bankBalance || 0;
}

// Check if player already owns a clothing item
function ownsClothingItem(itemId) {
    const wardrobe = getState().variables.wardrobe;
    if (!wardrobe || !wardrobe.owned) return false;
    return wardrobe.owned.includes(itemId);
}

// Category labels for display
const categoryLabels = {
    tops: 'Tops',
    bottoms: 'Bottoms',
    dresses: 'Dresses',
    shoes: 'Shoes',
    socks: 'Socks',
    earrings: 'Earrings',
    necklaces: 'Necklaces',
    bracelets: 'Bracelets',
    bras: 'Bras',
    panties: 'Panties'
};

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
        console.warn('[Shopping] Item not found:', itemId);
        return;
    }

    // Ensure cart exists
    if (!S.variables.shoppingCart) {
        S.variables.shoppingCart = [];
    }
    
    const cart = S.variables.shoppingCart;
    const existing = cart.find(c => c.id === itemId);
    
    if (existing) {
        // For clothing or quest items, limit to 1 per purchase
        if (item._isClothing || item._isQuestItem) {
            showToast('You already have this item in your cart!');
            return;
        }
        existing.quantity++;
    } else {
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
        category: shopCurrentCategory
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
    const total = getCartTotal();
    
    console.log('[Shopping] Checkout Cash. Total:', total, 'Balance:', S.variables.cashBalance);
    
    if (total <= 0 || S.variables.cashBalance < total) {
        showToast('Insufficient cash!');
        return false;
    }
    
    // Spend cash
    S.variables.moneySpend += total;
    S.variables.cashBalance = S.variables.moneyEarn - S.variables.moneySpend;
    
    console.log('[Shopping] New Balance:', S.variables.cashBalance);
    
    // Add items to inventory
    addCartToInventory();
    
    // Clear cart
    S.variables.shoppingCart = [];
    
    // Save state before reloading
    saveShopState();
    
    // Reload passage to save history moment (User Request)
    const engine = getEngine();
    if (engine) {
        console.log('[Shopping] Reloading passage via Engine to save history...');
        engine.play(getState().passage);
    } else {
        console.warn('[Shopping] Engine not found, falling back to renderAll (No history save!)');
        renderAll(); 
    }
    
    return true;
}

function checkoutCard() {
    const S = getState();
    const total = getCartTotal();
    
    console.log('[Shopping] Checkout Card. Total:', total, 'Bank:', S.variables.bankBalance);
    
    if (total <= 0 || S.variables.bankBalance < total) {
        showToast('Insufficient bank balance!');
        return false;
    }
    
    // Spend from bank
    S.variables.bankSpend += total;
    S.variables.bankBalance = S.variables.bankDeposit - S.variables.bankSpend - S.variables.bankWithdraw;
    
    console.log('[Shopping] New Bank Balance:', S.variables.bankBalance);
    
    // Add items to inventory
    addCartToInventory();
    
    // Clear cart
    S.variables.shoppingCart = [];
    
    // Save state before reloading
    saveShopState();
    
    // Reload passage to save history moment
    const engine = getEngine();
    if (engine) {
        console.log('[Shopping] Reloading passage via Engine to save history...');
        engine.play(getState().passage);
    } else {
        console.warn('[Shopping] Engine not found, falling back to renderAll (No history save!)');
        renderAll();
    }
    
    return true;
}

function addCartToInventory() {
    const S = getState();
    const cart = S.variables.shoppingCart || [];
    
    // Ensure inventory exists
    if (!S.variables.inventory) {
        S.variables.inventory = [];
    }
    
    // Ensure wardrobe exists
    if (!S.variables.wardrobe) {
        S.variables.wardrobe = { owned: [], equipped: {}, outfits: [null, null, null, null] };
    }
    if (!S.variables.wardrobe.owned) {
        S.variables.wardrobe.owned = [];
    }
    
    const inventory = S.variables.inventory;
    const wardrobeOwned = S.variables.wardrobe.owned;
    
    console.log('[Shopping] Processing cart:', cart);
    
    cart.forEach(cartItem => {
        // Check if it's a quest item (special handling) - use stored metadata
        if (cartItem._isQuestItem || cartItem.id.startsWith('quest_')) {
            const questId = cartItem._questId;
            const objectiveId = cartItem._objectiveId;
            
            if (!questId || !objectiveId) {
                console.warn(`[Shopping] Quest item missing IDs: ${cartItem.id}`);
                return;
            }
            
            // Complete the objective
            if (S.variables.questState?.active?.[questId]) {
                S.variables.questState.active[questId].objectives[objectiveId] = true;
                console.log(`[Shopping] Quest objective completed: ${questId} -> ${objectiveId}`);
                
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
                            console.log(`[Shopping] All objectives complete, advancing quest ${questId}`);
                            // Use $.wiki to call the macro
                            if (typeof $ !== 'undefined' && $.wiki) {
                                $.wiki(`<<advanceQuestStage "${questId}">>`);
                            }
                        }
                    }
                }
            } else {
                console.warn(`[Shopping] Quest not active: ${questId}`);
            }
            return; // Don't add quest items to inventory
        }
        
        const item = getItemById(cartItem.id);
        
        if (!item) {
            console.warn(`[Shopping] Item not found: ${cartItem.id}`);
            return;
        }
        
        // Check if it's clothing
        if (item._isClothing) {
            // Add to wardrobe.owned (clothing doesn't stack, just add if not owned)
            if (!wardrobeOwned.includes(cartItem.id)) {
                wardrobeOwned.push(cartItem.id);
                console.log(`[Shopping] Added clothing to wardrobe: ${cartItem.id}`);
            } else {
                console.log(`[Shopping] Already own clothing: ${cartItem.id}`);
            }
        } else {
            // Add to regular inventory (stackable); cosmetics with maxUses add quantity * maxUses
            const qty = item.maxUses ? cartItem.quantity * item.maxUses : cartItem.quantity;
            const existing = inventory.find(i => i.id === cartItem.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                inventory.push({ id: cartItem.id, quantity: qty });
            }
            console.log(`[Shopping] Added item to inventory: ${cartItem.id} x${qty}`);
        }
    });
    
    console.log('[Shopping] Wardrobe owned after:', wardrobeOwned);
    console.log('[Shopping] Inventory after:', inventory);
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
    const tabsContainer = shopContainer?.querySelector('.category-tabs');
    if (!tabsContainer || !isClothingShop) {
        if (tabsContainer) tabsContainer.style.display = 'none';
        return;
    }
    
    tabsContainer.style.display = 'flex';
    
    // Build tabs HTML - "All" + each category
    let html = `<button class="category-tab ${shopCurrentCategory === 'all' ? 'active' : ''}" data-category="all">All</button>`;
    
    shopCategories.forEach(cat => {
        const label = categoryLabels[cat] || cat;
        const active = shopCurrentCategory === cat ? 'active' : '';
        html += `<button class="category-tab ${active}" data-category="${cat}">${label}</button>`;
    });
    
    tabsContainer.innerHTML = html;
    
    // Bind click events
    tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            shopCurrentCategory = tab.dataset.category;
            saveShopState(); // Save state on tab change
            renderCategoryTabs();
            renderProducts();
        });
    });
}

function renderProducts() {
    const grid = shopContainer?.querySelector('.products-grid');
    if (!grid) return;

    // Filter items:
    // 1. For clothing: hide already owned items
    // 2. Filter by selected category if not "all"
    let itemsToShow = currentShopItems.filter(item => {
        // Hide owned clothing
        if (item._isClothing && ownsClothingItem(item.id)) {
            return false;
        }
        // Filter by category
        if (shopCurrentCategory !== 'all' && item._category !== shopCurrentCategory) {
            return false;
        }
        return true;
    });

    if (itemsToShow.length === 0) {
        grid.innerHTML = '<div class="empty-message">No items available in this category.</div>';
        return;
    }

    grid.innerHTML = itemsToShow.map(item => {
        // Show info icon for items with effects OR description (clothing)
        const hasEffects = item.effects && item.effects.length > 0;
        const hasDesc = item.desc && item.desc.length > 0;
        const isClothing = item._isClothing;
        const showTooltip = hasEffects || hasDesc || isClothing;
        
        return `
        <div class="product-card" data-item-id="${item.id}">
            ${showTooltip ? `
                <div class="product-info-icon">i</div>
                <div class="product-tooltip">
                    <div class="tooltip-title">${item.name}</div>
                    ${hasDesc ? `<div class="tooltip-desc">${item.desc}</div>` : ''}
                    
                    ${isClothing ? `
                        <div class="tooltip-divider"></div>
                        <div class="tooltip-stats">
                            ${item.quality ? `<div class="tooltip-row"><span class="label">Quality:</span> <span class="value quality-${item.quality.toLowerCase()}">${item.quality}</span></div>` : ''}
                            ${item.looks ? `<div class="tooltip-row"><span class="label">Looks:</span> <span class="value looks-value">+${item.looks}</span></div>` : ''}
                            ${item.tags && item.tags.length ? (() => {
                                const tagColors = {
                                    'naked': '#ef4444',       // 1
                                    'underwear': '#f97316',   // 2
                                    'revealing': '#f59e0b',   // 3
                                    'prostitution': '#ef4444',// 4
                                    'bimbo': '#ec4899',       // 5
                                    'casual': '#9ca3af',      // Default gray
                                    'formal': '#3b82f6',
                                    'elegant': '#8b5cf6',
                                    'sporty': '#10b981'
                                };
                                const tagsHtml = item.tags.map(tag => {
                                    const color = tagColors[tag.toLowerCase()] || tagColors.casual;
                                    return `<span class="value" style="color: ${color}">${tag}</span>`;
                                }).join('');
                                return `<div class="tooltip-row tags"><span class="label">Tags:</span> ${tagsHtml}</div>`;
                            })() : ''}
                        </div>
                    ` : ''}
                    
                    ${hasEffects ? item.effects.map(e => `<div class="tooltip-effect">${e.value > 0 ? '+' : ''}${e.value} ${e.stat}</div>`).join('') : ''}
                </div>
            ` : ''}
            <div class="product-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
            </div>
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-price">$${item.price}</div>
            </div>
            <button class="product-add-btn" data-action="add" data-item="${item.id}"><span class="icon icon-plus"></span></button>
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

    const cart = getCart();
    const total = getCartTotal();
    const cash = getCashBalance();
    const bank = getBankBalance();

    // Update count
    if (cartCount) cartCount.textContent = cart.length;

    // Update total
    if (cartTotal) cartTotal.textContent = '$' + total;

    // Update buttons
    if (cashBtn) {
        cashBtn.classList.toggle('disabled', total <= 0 || cash < total);
        cashBtn.querySelector('.pay-balance').textContent = `($${cash} available)`;
    }
    if (cardBtn) {
        cardBtn.classList.toggle('disabled', total <= 0 || bank < total);
        cardBtn.querySelector('.pay-balance').textContent = `($${bank} available)`;
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
        
        return `
            <div class="cart-item ${isQuestItem ? 'quest-item' : ''}" data-item-id="${cartItem.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price} ${(isClothing || isQuestItem) ? '' : `× ${cartItem.quantity}`}</div>
                </div>
                <div class="cart-item-qty">
                    ${(isClothing || isQuestItem) ? 
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
    if (cashEl) cashEl.textContent = '$' + getCashBalance();
    if (bankEl) bankEl.textContent = '$' + getBankBalance();
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
                    <div class="category-tabs"></div>
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
    console.log('[Shopping] Session ended. Cart and state cleared.');
}

// ============================================
// MACRO HANDLER
// ============================================

function shopMacroHandler(output, shopName, shopType, itemIds, backPassage) {
    const S = getState();
    const saved = S.variables._shopState;
    console.log('[Shopping] Macro called. Name:', shopName, 'Saved:', saved);
    
    // Check if we are reloading the same shop
    const isReload = saved && saved.name === (shopName || 'Shop');
    console.log('[Shopping] Is Reload?', isReload);
    
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0 && !isReload) {
        // BRAND NEW shop visit - Initialize state
        console.log('[Shopping] Initializing new shop state.');
        currentShopName = shopName || 'Shop';
        currentShopType = shopType || 'Store';
        currentShopItems = getItemsByIds(itemIds);
        returnPassage = backPassage || getState().variables.location || 'start';
        shopCurrentCategory = 'all';
        
        // Add quest items for this location
        const locationId = S.variables.location || '';
        const questItems = getQuestItemsForLocation(locationId);
        if (questItems.length > 0) {
            console.log('[Shopping] Adding quest items:', questItems.map(i => i.name));
            currentShopItems = [...questItems, ...currentShopItems]; // Quest items first
        }
        
        saveShopState();
    } else {
        // Reloading existing shop OR recovering from F5
        if (loadShopState()) {
            console.log('[Shopping] Restored existing shop state:', currentShopName);
            
            // Re-add quest items (they might have changed)
            const locationId = S.variables.location || '';
            const questItems = getQuestItemsForLocation(locationId);
            // Filter out existing quest items and re-add
            currentShopItems = currentShopItems.filter(i => !i._isQuestItem);
            if (questItems.length > 0) {
                currentShopItems = [...questItems, ...currentShopItems];
            }
        } else if (itemIds && Array.isArray(itemIds)) {
             // Fallback
             console.warn('[Shopping] State load failed, re-initializing from args.');
             currentShopName = shopName || 'Shop';
             currentShopItems = getItemsByIds(itemIds);
             shopCurrentCategory = 'all';
        } else {
            // Failed
            console.warn('[Shopping] No shop state found and no items args.');
            $(output).append('<div class="error">Shop session expired. Please return to the map.</div>');
            return;
        }
    }
    
    // Log current money state to verify persistence
    console.log('[Shopping] Current Balance (Cash):', S.variables.cashBalance);
    
    // Detect if this is a clothing shop and extract categories
    isClothingShop = currentShopItems.some(item => item._isClothing);
    
    if (isClothingShop) {
        // Extract unique categories from items
        const cats = new Set();
        currentShopItems.forEach(item => {
            if (item._category) cats.add(item._category);
        });
        shopCategories = Array.from(cats);
        console.log('[Shopping] Clothing shop detected. Categories:', shopCategories);
    } else {
        shopCategories = [];
    }

    // Create wrapper
    const $wrapper = $(document.createElement('div'));
    $wrapper.addClass('shop-wrapper');
    $wrapper.html(createShopHTML());
    $wrapper.appendTo(output);

    shopContainer = $wrapper.find('.shop-container')[0];

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
    console.log('[Shopping] ShoppingInit called');
    ShopAPI = API;
}

// Export to window for loader auto-init
window.ShoppingInit = ShoppingInit;

// Export to window for macro access
window.shopModule = {
    macroHandler: shopMacroHandler
};
