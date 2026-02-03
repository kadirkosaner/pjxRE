/**
 * Wardrobe System Module
 * Renders the wardrobe UI and handles clothing management
 */

let WardrobeAPI = null;
let currentCategory = 'tops';
let selectedItem = null;
let wardrobeContainer = null;

// Category to slot mapping
const categoryToSlot = {
    tops: 'top',
    bottoms: 'bottom',
    dresses: 'dress',
    shoes: 'shoes',
    socks: 'socks',
    earrings: 'earrings',
    necklaces: 'necklace',
    bracelets: 'bracelet',
    bras: 'bra',
    panties: 'panty',
    sleepwear: 'sleepwear'
};

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const STYLE_TAGS = ['cute', 'elegant', 'professional', 'sexy', 'slutty', 'bimbo'];


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

function initializePlayerWardrobe() {
    const S = getState();
    if (!S || !S.variables || !S.variables.wardrobe) {
        console.warn('[Wardrobe] initializePlayerWardrobe: State or $wardrobe not ready');
        return;
    }
    const wardrobe = S.variables.wardrobe;
    
    const setupObj = getSetup();
    const clothingData = setupObj.clothingData || {};
    const owned = [];
    
    const catKeys = Object.keys(clothingData);
    console.log('[Wardrobe] initializePlayerWardrobe called. ClothingData categories:', catKeys);
    
    if (catKeys.length === 0) {
        console.warn('[Wardrobe] initializePlayerWardrobe: No clothing data found in setup.clothingData!');
        return;
    }
    
    catKeys.forEach(category => {
        const items = clothingData[category] || [];
        console.log(`[Wardrobe] - Category "${category}": ${items.length} items`);
        items.forEach(item => {
            if (item.startOwned && !owned.includes(item.id)) {
                owned.push(item.id);
            }
        });
    });

    // Only populate owned if it's truly empty
    if (!wardrobe.owned || wardrobe.owned.length === 0) {
        wardrobe.owned = owned;
        console.log('[Wardrobe] Owned was empty, populated with:', owned.length, 'items');
    } else {
        console.log('[Wardrobe] Owned already set, preserving:', wardrobe.owned.length, 'items');
    }

    // NEVER touch equipped - it's set in CharacterInit
    console.log('[Wardrobe] Equipped items preserved from init:', Object.keys(wardrobe.equipped).length, 'slots');
    
    if (!wardrobe.outfits || !Array.isArray(wardrobe.outfits)) {
        wardrobe.outfits = [null, null, null, null];
    }
    
    return owned.length;
}

getSetup().initializePlayerWardrobe = initializePlayerWardrobe;

function ownsClothing(itemId) {
    if (!WardrobeAPI) return false;
    return WardrobeAPI.State.variables.wardrobe?.owned?.includes(itemId) || false;
}

function getClothingById(itemId) {
    if (!itemId) return null;
    const clothingData = getSetup().clothingData || {};
    
    for (const category of Object.keys(clothingData)) {
        const items = clothingData[category] || [];
        const item = items.find(i => i.id == itemId); 
        
        if (item) {
             return item;
        }
    }
    
    return null;
}

function getEquippedItem(slot) {
    if (!WardrobeAPI) return null;
    const itemId = WardrobeAPI.State.variables.wardrobe?.equipped?.[slot];
    if (!itemId) return null;
    return getClothingById(itemId);
}

function calculateTotalLooks() {
    if (!WardrobeAPI) return 0;
    const equipped = WardrobeAPI.State.variables.wardrobe?.equipped || {};
    let total = 0;
    Object.values(equipped).forEach(itemId => {
        const item = getClothingById(itemId);
        if (item) total += item.looks || 0;
    });
    return total;
}

function getOverallStyle() {
    if (!WardrobeAPI) return { text: 'Normal', color: '#22c55e' };
    const equipped = WardrobeAPI.State.variables.wardrobe?.equipped || {};
    let styleCounts = {};
    
    Object.values(equipped).forEach(itemId => {
        const item = getClothingById(itemId);
        if (item && item.tags) {
            item.tags.forEach(tag => {
                if (STYLE_TAGS.includes(tag)) {
                    styleCounts[tag] = (styleCounts[tag] || 0) + 1;
                }
            });
        }
    });
    
    let dominant = 'normal';
    let max = 0;
    Object.entries(styleCounts).forEach(([style, count]) => {
        if (count > max) {
            max = count;
            dominant = style;
        }
    });

    const colors = {
        'cute': '#ec4899', 
        'elegant': '#a855f7', 
        'professional': '#3b82f6',
        'sexy': '#f97316', 
        'slutty': '#ef4444', 
        'bimbo': '#ec4899'
    };
    
    return { 
        text: dominant.charAt(0).toUpperCase() + dominant.slice(1), 
        color: colors[dominant] || '#22c55e' 
    };
}

// ============================================
// REQUIREMENT CHECKS
// ============================================

function checkRequirements(item) {
    if (!item || !item.tags) {
        return { allowed: true };
    }
    
    const S = getState();
    
    if (!S.temporary) S.temporary = {};
    S.temporary.wardrobeItemToCheck = item;
    
    // Find Wikifier
    const WikifierClass = window.Wikifier || (typeof SugarCube !== 'undefined' && SugarCube.Wikifier);
    
    if (!WikifierClass) {
        console.error('[Wardrobe] Wikifier not available!');
        return { allowed: true };
    }
    
    // Call widget
    new WikifierClass(null, "<<checkClothingRequirements>>");
    
    const result = S.temporary.wardrobeCheckResult;
    
    // Cleanup
    delete S.temporary.wardrobeItemToCheck;
    delete S.temporary.wardrobeCheckResult;
    
    console.log(`[Wardrobe] checkRequirements for "${item.id}":`, result);
    
    return result || { allowed: true };
}

function checkCommandoRequirement(slot) {
    if (slot !== 'panty' && slot !== 'bra') return { allowed: true };

    const S = getState();
    
    if (!S.temporary) S.temporary = {};
    S.temporary.wardrobeSlotToCheck = slot;
    
    const WikifierClass = window.Wikifier || (typeof SugarCube !== 'undefined' && SugarCube.Wikifier);
    
    if (!WikifierClass) {
        console.error('[Wardrobe] Wikifier not available!');
        return { allowed: true };
    }
    
    // Call widget
    new WikifierClass(null, "<<checkCommandoRequirement>>");
    
    const result = S.temporary.wardrobeCheckResult;
    
    // Cleanup
    delete S.temporary.wardrobeSlotToCheck;
    delete S.temporary.wardrobeCheckResult;
    
    console.log(`[Wardrobe] checkCommandoRequirement for "${slot}":`, result);
    
    return result || { allowed: true };
}


// ============================================
// INTERNAL FUNCTIONS
// ============================================

function getCategoryItems(categoryId) {
    return getSetup().clothingData?.[categoryId] || [];
}

function _w_getItemById(itemId) {
    return getClothingById(itemId);
}

function ownsItem(itemId) {
    return ownsClothing(itemId);
}

function equipItem(itemId) {
    if (!WardrobeAPI) return;
    const item = _w_getItemById(itemId);
    if (!item || !ownsItem(itemId)) return;

    console.log(`[Wardrobe] equipItem called for "${itemId}"`);

    const req = checkRequirements(item);
    console.log(`[Wardrobe] equipItem requirement check result:`, req);
    
    if (!req.allowed) {
        console.log(`[Wardrobe] equipItem BLOCKED: ${req.reason}`);
        showToast(req.reason);
        return;
    }

    const slot = categoryToSlot[currentCategory] || null;
    if (!slot) return;

    const wardrobe = WardrobeAPI.State.variables.wardrobe;

    if (slot === 'dress') {
        delete wardrobe.equipped.top;
        delete wardrobe.equipped.bottom;
    }
    if (slot === 'top' || slot === 'bottom') {
        delete wardrobe.equipped.dress;
    }

    wardrobe.equipped[slot] = itemId;
    selectedItem = item;
    showToast(`Equipped: ${item.name}`);
    
    if (window.Wikifier) new Wikifier(null, "<<recalculateStats>><<updateCaption>><<updateClothesNotification>>");
    if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
    
    _w_renderAll();
}

function unequipSlot(slot) {
    if (!WardrobeAPI) return;
    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    const itemId = wardrobe.equipped[slot];
    
    if (!itemId) return;
    
    const item = _w_getItemById(itemId);
    delete wardrobe.equipped[slot];
    if (item) showToast(`Removed: ${item.name}`);
    
    if (window.Wikifier) new Wikifier(null, "<<recalculateStats>><<updateCaption>><<updateClothesNotification>>");
    if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
    
    _w_renderAll();
}

function showToast(message) {
    const toast = wardrobeContainer?.querySelector('.wardrobe-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

const defaultCategories = [
    { group: "Outerwear", items: [
        { id: "tops", name: "Tops", slot: "top" },
        { id: "bottoms", name: "Bottoms", slot: "bottom" },
        { id: "dresses", name: "Dresses", slot: "dress" },
        { id: "shoes", name: "Shoes", slot: "shoes" },
        { id: "socks", name: "Socks", slot: "socks" }
    ]},
    { group: "Accessories", items: [
        { id: "earrings", name: "Earrings", slot: "earrings" },
        { id: "necklaces", name: "Necklaces", slot: "necklace" },
        { id: "bracelets", name: "Bracelets", slot: "bracelet" }
    ]},
    { group: "Underwear", items: [
        { id: "bras", name: "Bras", slot: "bra" },
        { id: "panties", name: "Panties", slot: "panty" }
    ]}
];

function _w_renderCategories() {
    let root = wardrobeContainer;
    if (!root || !document.body.contains(root)) {
        root = document.querySelector('.wardrobe-container');
        if (root) wardrobeContainer = root;
    }

    const container = root?.querySelector('.categories');
    
    if (!container) {
        console.error('[Wardrobe] renderCategories: .categories element NOT found in DOM!');
        return;
    }

    let categories = getSetup().wardrobeCategories;
    
    if (!categories || categories.length === 0) {
        console.warn('[Wardrobe] Categories missing in setup, using defaults');
        categories = defaultCategories;
    }

    let html = '';

    categories.forEach((group, gi) => {
        html += `<div class="category-group-title">${group.group}</div>`;
        group.items.forEach(cat => {
            const count = getCategoryItems(cat.id).filter(i => ownsItem(i.id)).length;
            const active = cat.id === currentCategory ? 'active' : '';
            html += `
                <div class="category-item ${active}" data-category="${cat.id}">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        });
        if (gi < categories.length - 1) {
            html += '<div class="category-divider"></div>';
        }
    });

    container.innerHTML = html;

    container.querySelectorAll('.category-item').forEach(el => {
        el.addEventListener('click', () => {
            currentCategory = el.dataset.category;
            selectedItem = null;
            _w_renderAll();
        });
    });
}

function renderClothingGrid() {
    if (!WardrobeAPI) return;
    
    let root = wardrobeContainer;
    if (!root || !document.body.contains(root)) {
        root = document.querySelector('.wardrobe-container');
        if (root) wardrobeContainer = root;
    }
    
    const container = root?.querySelector('.clothing-grid');
    const titleEl = root?.querySelector('.panel-title');
    if (!container) return;

    const items = getCategoryItems(currentCategory).filter(i => ownsItem(i.id));
    
    const slot = categoryToSlot[currentCategory] || null;
    const equippedId = WardrobeAPI.State.variables.wardrobe?.equipped?.[slot];

    const categories = getSetup().wardrobeCategories || defaultCategories;
    const catInfo = categories.flatMap(g => g.items).find(c => c.id === currentCategory);
    if (titleEl) titleEl.textContent = catInfo?.name || '';

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-message" style="grid-column: 1 / -1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 100%; text-align: center; color: var(--color-text-tertiary); font-style: italic;"><div>No items found in this category.</div></div>';
        return;
    }

    container.innerHTML = items.map(item => {
        const req = checkRequirements(item);
        const lockedClass = req.allowed ? '' : 'locked';
        const tooltipAttr = req.allowed ? '' : `data-tooltip="${req.reason}"`;
        
        return `
        <div class="clothing-item ${equippedId === item.id ? 'equipped' : ''} ${lockedClass}" 
             data-id="${item.id}" 
             data-allowed="${req.allowed}"
             ${tooltipAttr}>
            <img class="clothing-img" src="${item.image}" alt="${item.name}">
            <span class="clothing-looks">+${item.looks}</span>
            <div class="clothing-quality ${item.quality.toLowerCase()}"></div>
            ${!req.allowed ? '<i class="icon icon-lock lock-icon"></i>' : ''}
        </div>
    `}).join('');

    const elements = container.querySelectorAll('.clothing-item');

    elements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const itemId = el.dataset.id;
            const allowed = el.dataset.allowed === 'true';
            
            console.log(`[Wardrobe] CLICK on item: ${itemId}, allowed: ${allowed}`);
            
            // Locked items: prevent all action
            if (!allowed) {
                console.log('[Wardrobe] Item is LOCKED, action blocked');
                return;
            }
            
            selectedItem = _w_getItemById(itemId);
            renderSelectedInfo();
            
            if (equippedId === itemId) {
                console.log('[Wardrobe] Action: Unequip');
                unequipSlot(slot);
            } else {
                console.log('[Wardrobe] Action: Equip');
                equipItem(itemId);
            }
        });
    });
    
    // Re-initialize tooltips after rendering
    if (window.initTooltips) {
        window.initTooltips();
    }
}

function renderSelectedInfo() {
    const container = wardrobeContainer?.querySelector('.selected-info');
    if (!container) return;

    if (!selectedItem) {
        container.classList.remove('visible');
        return;
    }

    container.classList.add('visible');
    container.querySelector('.selected-img').src = selectedItem.image;
    container.querySelector('.selected-name').textContent = selectedItem.name;
    
    const itemStyles = selectedItem.tags ? selectedItem.tags.filter(t => STYLE_TAGS.includes(t)) : [];
    const styleText = itemStyles.length > 0 ? itemStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : 'Normal';
    
    container.querySelector('#selected-style').textContent = styleText;
    container.querySelector('#selected-style').className = 'style-tag ' + (itemStyles[0] || 'normal');

    const req = checkRequirements(selectedItem);
    const descEl = container.querySelector('.selected-desc');
    if (!req.allowed) {
        descEl.innerHTML = `<span style="color: #ef4444; font-weight: bold;">${req.reason}</span><br>${selectedItem.desc}`;
    } else {
        descEl.textContent = selectedItem.desc;
    }
    
    container.querySelector('.selected-brand').textContent = selectedItem.brand;
    container.querySelector('#selected-quality').textContent = selectedItem.quality;
    container.querySelector('#selected-looks').textContent = '+' + selectedItem.looks;
}

function renderWearingSlots() {
    if (!WardrobeAPI) {
        console.warn('[Wardrobe] WardrobeAPI is null/undefined in renderWearingSlots');
        return;
    }
    const container = wardrobeContainer?.querySelector('.wearing-slots');
    if (!container) return;

    const slotLabels = getSetup().slotLabels || {};
    
    if (!WardrobeAPI.State) {
        console.error('[Wardrobe] WardrobeAPI.State is undefined!', WardrobeAPI);
        return;
    }
    const equipped = WardrobeAPI.State.variables.wardrobe?.equipped || {};

    function renderSlot(slot) {
        const itemId = equipped[slot];
        const item = itemId ? _w_getItemById(itemId) : null;
        
        return `
            <div class="wearing-slot ${!item ? 'empty' : ''}" data-slot="${slot}">
                <div class="wearing-slot-img">${item ? `<img src="${item.image}">` : ''}</div>
                <div class="wearing-slot-info">
                    <div class="wearing-slot-category">${slotLabels[slot] || slot}</div>
                    <div class="wearing-slot-name">${item ? item.name : 'Empty'}</div>
                </div>
                ${item ? `<button class="wearing-slot-remove" data-slot="${slot}">✕</button>` : ''}
            </div>
        `;
    }

    let html = '<div class="slots-section-title">Outerwear</div>';
    html += ['top', 'bottom', 'dress', 'shoes', 'socks'].map(renderSlot).join('');
    html += '<div class="slots-section-title">Accessories</div>';
    html += ['earrings', 'necklace', 'bracelet'].map(renderSlot).join('');
    html += '<div class="slots-section-title">Underwear</div>';
    html += ['bra', 'panty'].map(renderSlot).join('');

    container.innerHTML = html;

    container.querySelectorAll('.wearing-slot:not(.empty)').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('wearing-slot-remove')) return;
            const slot = el.dataset.slot;
            const catId = Object.keys(categoryToSlot).find(k => categoryToSlot[k] === slot);
            if (catId) {
                currentCategory = catId;
                _w_renderAll();
            }
        });
    });

    container.querySelectorAll('.wearing-slot-remove').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            unequipSlot(el.dataset.slot);
        });
    });
}

function renderStats() {
    const totalLooksEl = wardrobeContainer?.querySelector('#total-looks');
    const styleTextEl = wardrobeContainer?.querySelector('#style-text');

    if (totalLooksEl) {
        totalLooksEl.textContent = '+' + calculateTotalLooks();
    }

    if (styleTextEl) {
        const style = getOverallStyle();
        styleTextEl.textContent = style.text;
        styleTextEl.className = 'stat-value ' + style.text.toLowerCase();
    }
}

function checkOutfitRequirements(outfit) {
    if (!outfit || !outfit.equipped) {
        return { allowed: true };
    }
    
    const S = getState();
    const equipped = outfit.equipped;
    
    // Temporarily mock the equipped state to check THIS outfit
    // We need to do this because the widget checks $wardrobe.equipped
    const originalEquipped = S.variables.wardrobe.equipped;
    S.variables.wardrobe.equipped = equipped;
    
    // Check Panty Requirement
    if (!equipped.panty || equipped.panty === '') {
        const pantyReq = checkCommandoRequirement('panty');
        if (!pantyReq.allowed) {
            S.variables.wardrobe.equipped = originalEquipped; // Restore
            return pantyReq;
        }
    }
    
    // Check Bra Requirement
    if (!equipped.bra || equipped.bra === '') {
        const braReq = checkCommandoRequirement('bra');
        if (!braReq.allowed) {
            S.variables.wardrobe.equipped = originalEquipped; // Restore
            return braReq;
        }
    }
    
    // Restore original state
    S.variables.wardrobe.equipped = originalEquipped;
    
    return { allowed: true };
}

function renderOutfits() {
    if (window.hideTooltip) window.hideTooltip();
    if (!WardrobeAPI) return;
    const container = wardrobeContainer?.querySelector('.outfits-grid');
    if (!container) return;

    const outfits = WardrobeAPI.State.variables.wardrobe?.outfits || [];

    container.innerHTML = outfits.map((outfit, i) => {
        if (!outfit) {
            return `<div class="outfit-slot empty" data-index="${i}"><span class="outfit-add">+</span></div>`;
        }
        
        const outfitReq = checkOutfitRequirements(outfit);
        const lockedClass = outfitReq.allowed ? '' : 'locked';
        const wearTooltip = outfitReq.allowed ? '' : `data-tooltip="${outfitReq.reason}"`;
        
        return `
            <div class="outfit-slot ${lockedClass}" data-index="${i}" ${wearTooltip}>
                <button class="outfit-delete" data-index="${i}">✕</button>
                <input type="text" class="outfit-name-input" value="${outfit.name}" size="1" data-index="${i}">
                <div class="outfit-actions">
                    <button class="outfit-btn" data-action="save" data-index="${i}">Save</button>
                    <button class="outfit-btn primary ${lockedClass}" data-action="wear" data-index="${i}" data-allowed="${outfitReq.allowed}" ${wearTooltip}>Wear</button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.outfit-slot.empty').forEach(el => {
        el.addEventListener('click', () => createOutfit(parseInt(el.dataset.index)));
    });

    container.querySelectorAll('.outfit-delete').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteOutfit(parseInt(el.dataset.index));
        });
    });

    container.querySelectorAll('.outfit-name-input').forEach(el => {
        el.addEventListener('change', () => {
            const idx = parseInt(el.dataset.index);
            const wardrobe = WardrobeAPI.State.variables.wardrobe;
            if (wardrobe.outfits[idx]) {
                wardrobe.outfits[idx].name = el.value;
            }
        });
    });

    container.querySelectorAll('.outfit-btn').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            
            if (el.dataset.action === 'save') {
                saveOutfit(idx);
            }
            
            if (el.dataset.action === 'wear') {
                const allowed = el.dataset.allowed === 'true';
                
                if (!allowed) {
                    const outfit = WardrobeAPI.State.variables.wardrobe.outfits[idx];
                    const outfitReq = checkOutfitRequirements(outfit);
                    showToast(outfitReq.reason);
                    return;
                }
                
                wearOutfit(idx);
                
                document.body.classList.remove('wardrobe-active');
                if (WardrobeAPI) {
                    const target = 'fhBedroom';
                    if (target === WardrobeAPI.State.passage) {
                        WardrobeAPI.Engine.display(target, null, "back");
                        if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
                    } else {
                        WardrobeAPI.Engine.play(target);
                    }
                }
            }
        });
    });

    // Re-initialize tooltips
    if (window.initTooltips) {
        window.initTooltips();
    }
}

function createOutfit(index) {
    if (!WardrobeAPI) return;
    
    if (window.ModalTabSystem && window.ModalTabSystem.prompt) {
        window.ModalTabSystem.prompt(
            'Create Outfit',
            'Enter a name for this outfit:',
            'My Outfit',
            function(name) {
                const wardrobe = WardrobeAPI.State.variables.wardrobe;
                wardrobe.outfits[index] = {
                    name: name,
                    equipped: { ...wardrobe.equipped }
                };
                showToast(`Created: ${name}`);
                renderOutfits();
            }
        );
    } else {
        const name = prompt('Enter outfit name:');
        if (name) {
            const wardrobe = WardrobeAPI.State.variables.wardrobe;
            wardrobe.outfits[index] = {
                name: name,
                equipped: { ...wardrobe.equipped }
            };
            showToast(`Created: ${name}`);
            renderOutfits();
        }
    }
}

function saveOutfit(index) {
    if (!WardrobeAPI) return;
    
    // Explicitly destroy tooltips immediately
    $('.tooltip-popup').removeClass('active');
    
    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    const outfit = wardrobe.outfits[index];
    if (outfit) {
        outfit.equipped = { ...wardrobe.equipped };
        showToast(`Saved: ${outfit.name}`);
        renderOutfits();
    }
}

function deleteOutfit(index) {
    if (!WardrobeAPI) return;
    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    const outfit = wardrobe.outfits[index];
    if (!outfit) return;
    
    if (window.ModalTabSystem && window.ModalTabSystem.confirm) {
        window.ModalTabSystem.confirm(
            'Delete Outfit',
            `Are you sure you want to delete "${outfit.name}"?`,
            function() {
                wardrobe.outfits[index] = null;
                showToast('Outfit deleted');
                renderOutfits();
            },
            null,
            'danger'
        );
    } else {
        if (confirm(`Delete "${outfit.name}"?`)) {
            wardrobe.outfits[index] = null;
            showToast('Outfit deleted');
            renderOutfits();
        }
    }
}

function wearOutfit(index) {
    if (!WardrobeAPI) return;
    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    const outfit = wardrobe.outfits[index];
    if (outfit?.equipped) {
        wardrobe.equipped = { ...outfit.equipped };
        showToast(`Wearing: ${outfit.name}`);
        
        if (window.Wikifier) {
            new Wikifier(null, "<<recalculateStats>><<updateCaption>><<updateClothesNotification>>");
        }
        if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
        
        _w_renderAll();
    }
}

function _w_renderAll() {
    if (window.hideTooltip) window.hideTooltip();
    _w_renderCategories();
    renderClothingGrid();
    renderSelectedInfo();
    renderWearingSlots();
    renderStats();
    renderOutfits();
    
    // Update wear button after render
    if (typeof updateWearButton === 'function') {
        updateWearButton();
    }
}

function createWardrobeHTML() {
    return `
        <div class="wardrobe-container">
            <div class="wardrobe-header">
                <a href="#" class="back-link" data-passage="fhBedroom">
                    <i class="icon icon-chevron-left"></i> Bedroom
                </a>
                <div class="wardrobe-title">Wardrobe</div>
                <button class="wear-return-btn" id="wear-return-btn">
                    Wear this outfit <i class="icon icon-chevron-right" style="margin-left: 5px; width: 12px; height: 12px;"></i>
                </button>
            </div>

            <div class="wardrobe-main">
                <div class="categories" id="categories"></div>

                <div class="middle-column">
                    <div class="clothing-panel">
                        <div class="panel-header">
                            <span class="panel-title">Tops</span>
                        </div>
                        <div class="clothing-grid" id="clothing-grid"></div>
                        <div class="selected-info">
                            <div class="selected-header">
                                <div class="selected-thumb"><img class="selected-img" src="" alt=""></div>
                                <div class="selected-details">
                                    <div class="selected-name-row">
                                        <span class="selected-name"></span>
                                        <span class="style-tag" id="selected-style"></span>
                                    </div>
                                    <div class="selected-brand"></div>
                                    <div class="selected-desc"></div>
                                </div>
                            </div>
                            <div class="selected-meta">
                                <span>Quality: <span class="meta-value" id="selected-quality"></span></span>
                                <span>Looks: <span class="meta-value" id="selected-looks"></span></span>
                            </div>
                        </div>
                    </div>

                    <div class="outfits-section">
                        <div class="outfits-title">Quick Outfits</div>
                        <div class="outfits-grid"></div>
                    </div>
                </div>

                <div class="wearing-panel">
                    <div class="wearing-header"><div class="wearing-title">Currently Wearing</div></div>
                    <div class="wearing-slots"></div>
                    <div class="stats-summary">
                        <div class="stat-item">
                            <div class="stat-label">Total Looks</div>
                            <div class="stat-value looks" id="total-looks">+0</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Style</div>
                            <div class="stat-value" id="style-text">Normal</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="wardrobe-toast"></div>
    `;
}

// ============================================
// MACRO HANDLER
// ============================================

function wardrobeMacroHandler(output) {
    console.log('[Wardrobe] SYSTEM v2.5 LOADED (Requirement Fix)');
    
    const $wrapper = $(document.createElement('div'));
    $wrapper.addClass('wardrobe-wrapper');
    $wrapper.html(createWardrobeHTML());
    $wrapper.appendTo(output);

    wardrobeContainer = $wrapper.find('.wardrobe-container')[0];
    
    document.body.classList.add('wardrobe-active');

    // Force cleanup of any lingering tooltips on load
    $('.tooltip-popup').removeClass('active');
    
    // Robust cleanup on navigation (removes itself after triggering once)
    $(document).one(':passageinit', function() {
        $('.tooltip-popup').removeClass('active');
        document.body.classList.remove('wardrobe-active');
    });

    const S = getState();
    const setupObj = getSetup();
    const wardrobe = S.variables.wardrobe;
    const clothingData = setupObj.clothingData || {};

    // Capture initial state for "Cancel" functionality (Back button)
    const initialWardrobeState = JSON.parse(JSON.stringify(wardrobe));

    console.log('[Wardrobe] Stats Check: confidence=' + S.variables.confidence + ', exhibitionism=' + S.variables.exhibitionism);

    if (wardrobe && (!wardrobe.owned || wardrobe.owned.length === 0)) {
        console.log('[Wardrobe] Wardrobe empty or not initialized. Running initializePlayerWardrobe...');
        initializePlayerWardrobe();
    }

    $wrapper.find('.back-link').on('click', function(e) {
        e.preventDefault();
        
        console.log('[Wardrobe] Back clicked. Reverting changes...');

        // Revert to initial state
        const S = getState();
        S.variables.wardrobe = JSON.parse(JSON.stringify(initialWardrobeState));
        
        document.body.classList.remove('wardrobe-active');
        const passage = $(this).data('passage');
        
        if (passage && WardrobeAPI) {
            if (passage === WardrobeAPI.State.passage) {
                WardrobeAPI.Engine.display(passage, null, "back");
            } else {
                WardrobeAPI.Engine.play(passage);
            }
            
            // Ensure UI is updated with the reverted state
            if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
            
            // Recalculate stats based on reverted wardrobe
            if (window.Wikifier) new Wikifier(null, "<<recalculateStats>>");
        }
    });

    // Update wear button state function
    window.updateWearButton = function() {
        const S = getState();
        const wardrobe = S.variables.wardrobe;
        const currentOutfit = { equipped: wardrobe.equipped };
        const outfitReq = checkOutfitRequirements(currentOutfit);
        
        const $btn = $(wardrobeContainer).find('.wear-return-btn');
        
        if (!outfitReq.allowed) {
            $btn.addClass('disabled');
            $btn.attr('data-outfit-tooltip', outfitReq.reason);
        } else {
            $btn.removeClass('disabled');
            $btn.removeAttr('data-outfit-tooltip');
        }
    };

    $wrapper.find('.wear-return-btn').on('click', function(e) {
        e.preventDefault();
        
        const S = getState();
        const wardrobe = S.variables.wardrobe;
        const currentOutfit = { equipped: wardrobe.equipped };
        const outfitReq = checkOutfitRequirements(currentOutfit);
        
        if (!outfitReq.allowed) {
            showToast(outfitReq.reason);
            return;
        }
        
        if (window.Wikifier) new Wikifier(null, "<<recalculateStats>>");
        
        document.body.classList.remove('wardrobe-active');
        if (WardrobeAPI) {
            const target = 'fhBedroom';
            if (target === WardrobeAPI.State.passage) {
                WardrobeAPI.Engine.display(target, null, "back");
                if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
            } else {
                WardrobeAPI.Engine.play(target);
            }
        }
    });

    // Single render call
    setTimeout(() => {
        try {
            _w_renderAll();
            updateWearButton();
        } catch (e) {
            console.error('[Wardrobe] _w_renderAll FAILED:', e);
        }
    }, 50);
}

// ============================================
// INIT FUNCTION (called by loader)
// ============================================

function WardrobeInit(API) {
    console.log('[Wardrobe] WardrobeInit called with API:', API);
    WardrobeAPI = API;
    
    const s = getSetup();
    s.initializePlayerWardrobe = initializePlayerWardrobe;
    s.ownsClothing = ownsClothing;
    s.getClothingById = getClothingById;
    s.getEquippedItem = getEquippedItem;
    s.calculateTotalLooks = calculateTotalLooks;
    s.getOverallStyle = getOverallStyle;
}

window.WardrobeInit = WardrobeInit;

window.wardrobeModule = {
    macroHandler: wardrobeMacroHandler
};