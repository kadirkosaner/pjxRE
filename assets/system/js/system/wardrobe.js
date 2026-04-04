/**
 * Wardrobe System Module
 * Renders the wardrobe UI and handles clothing management
 */

let WardrobeAPI = null;
let currentCategory = 'tops';
let wardrobeContainer = null;
/** When set (e.g. "rubysDiner"), only show session snapshot + items with matching locationId. */
let wardrobeLocationFilter = null;
/** Snapshot of equipped (slot -> itemId) when opening wardrobe with location filter; those + location items stay visible. */
let wardrobeSessionEquipped = null;
/** When set (e.g. from <<wardrobe "id" "passage">>), "Wear this outfit" and back link go here. */
let wardrobeReturnPassage = null;
/** When set (e.g. "ruby_dishwasher"), Wear this outfit only allowed if equipped matches job's requiredOutfit. */
let wardrobeRequiredJobId = null;

function _w_escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _w_escapeAttr(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Hidden markup inside each .clothing-item; cloned to fixed tooltips on hover (same pattern as Character Appearance). */
function buildWardrobeItemTooltipHtml(item) {
    if (!item) return '';
    const req = checkRequirements(item);
    const S = WardrobeAPI ? WardrobeAPI.State : getState();
    const runtime = S?.variables?.wardrobe?.itemState?.[item.id] || {};
    const dirt = Math.max(0, Math.min(100, typeof runtime.dirt === 'number' ? runtime.dirt : 0));
    const durability = Math.max(0, Math.min(100, typeof runtime.durability === 'number'
        ? runtime.durability
        : (typeof item.durability === 'number' ? item.durability : 100)));
    const sexiness = typeof item.sexinessScore === 'number' ? item.sexinessScore : 0;
    const exposure = typeof item.exposureLevel === 'number' ? item.exposureLevel : 0;
    const q = (item.quality ? String(item.quality) : 'Common').toLowerCase();
    const looksVal = formatLooks(getEffectiveLooks(item, item.id));

    /* Same as Character → Appearance outfit tooltip: show every tag (mild, comfortable, crop, etc.), not only STYLE_TAGS */
    const tagsHtml = (item.tags && item.tags.length > 0)
        ? `<div class="tooltip-tags">${item.tags.map(tag => {
            const t = String(tag);
            const cls = t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '') || 'tag';
            return `<span class="tooltip-tag-pill ${cls}">${_w_escapeHtml(t)}</span>`;
        }).join('')}</div>`
        : '';

    const descInner = !req.allowed
        ? `<span style="color: #ef4444; font-weight: bold;">${_w_escapeHtml(req.reason)}</span><br>${_w_escapeHtml(item.desc || 'No description.')}`
        : _w_escapeHtml(item.desc || 'No description.');

    const brandHtml = item.brand
        ? `<div class="wardrobe-tooltip-brand">${_w_escapeHtml(item.brand)}</div>`
        : '';

    return `
    <div class="wardrobe-item-tooltip outfit-tooltip" data-item-img="${_w_escapeAttr(item.image)}" data-item-name="${_w_escapeAttr(item.name)}">
      <div class="tooltip-header">${_w_escapeHtml(item.name)}</div>
      ${brandHtml}
      <div class="tooltip-desc">${descInner}</div>
      <div class="tooltip-stats">
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Quality:</span>
          <span class="tooltip-stat-val quality-${q}">${_w_escapeHtml(item.quality || 'Common')}</span>
        </span>
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Looks:</span>
          <span class="tooltip-stat-val" style="color: #ec4899;">+${_w_escapeHtml(String(looksVal))}</span>
        </span>
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Sexiness:</span>
          <span class="tooltip-stat-val">${sexiness}</span>
        </span>
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Exposure:</span>
          <span class="tooltip-stat-val">${exposure}</span>
        </span>
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Dirtyness:</span>
          <span class="tooltip-stat-val">${dirt.toFixed(1)}%</span>
        </span>
        <span class="tooltip-stat-row">
          <span class="tooltip-stat-label">Durability:</span>
          <span class="tooltip-stat-val">${durability.toFixed(0)}%</span>
        </span>
      </div>
      ${tagsHtml}
    </div>`;
}

function removeWardrobeGlobalTooltips() {
    const t = document.getElementById('global-wardrobe-item-tooltip');
    const i = document.getElementById('wardrobe-item-img-preview');
    if (t) t.remove();
    if (i) i.remove();
}

function hideWardrobeHoverFloaters() {
    const t = document.getElementById('global-wardrobe-item-tooltip');
    const i = document.getElementById('wardrobe-item-img-preview');
    if (t) {
        t.classList.remove('visible');
        t.style.visibility = 'hidden';
        t.style.opacity = '0';
    }
    if (i) i.classList.remove('visible');
}

// Category to slot mapping
const categoryToSlot = {
    tops: 'top',
    bottoms: 'bottom',
    dresses: 'dress',
    shoes: 'shoes',
    socks: 'socks',
    coats: 'coat',
    bags: 'bag',
    earrings: 'earrings',
    necklaces: 'necklace',
    bracelets: 'bracelet',
    rings: 'ring',
    bodysuits: 'bodysuit',
    swimsuits: 'swimsuit',
    bikiniTops: 'bra',
    bikiniBottoms: 'panty',
    bras: 'bra',
    panties: 'panty',
    sleepwear: 'sleepwear',
    garter: 'garter',
    apron: 'apron'
};

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const STYLE_TAGS = ['casual', 'cute', 'elegant', 'professional', 'sexy', 'sporty', 'slutty', 'work'];

/** Slot groups for weighted exposure/sexiness (WARDROBE-MASTER-AGENT-SPEC 3.2). Weights: top 0.4, bottom 0.4, underwear 0.6; sum 1.4 → normalize to 0–10. */
const SLOT_GROUP_TOP = ['top', 'coat', 'dress'];
const SLOT_GROUP_BOTTOM = ['bottom', 'dress'];
const SLOT_GROUP_UNDERWEAR = ['bra', 'panty'];
const SLOT_WEIGHT_TOP = 0.4;
const SLOT_WEIGHT_BOTTOM = 0.4;
const SLOT_WEIGHT_UNDERWEAR = 0.6;
const SLOT_WEIGHT_SUM = SLOT_WEIGHT_TOP + SLOT_WEIGHT_BOTTOM + SLOT_WEIGHT_UNDERWEAR; // 1.4

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

function getWikifierClass() {
    return window.Wikifier || (typeof SugarCube !== 'undefined' && SugarCube.Wikifier) || null;
}

function withTemporaryWardrobeState(options, fn) {
    const S = getState();
    if (!S.temporary) S.temporary = {};

    const temporary = options?.temporary || {};
    const previousTemporary = {};
    const hadTemporaryKey = {};

    Object.keys(temporary).forEach(key => {
        hadTemporaryKey[key] = Object.prototype.hasOwnProperty.call(S.temporary, key);
        previousTemporary[key] = S.temporary[key];
        S.temporary[key] = temporary[key];
    });

    const shouldSwapEquipped = options && Object.prototype.hasOwnProperty.call(options, 'equipped');
    const wardrobe = S?.variables?.wardrobe;
    const previousEquipped = wardrobe?.equipped;

    if (shouldSwapEquipped && wardrobe) {
        wardrobe.equipped = options.equipped;
    }

    try {
        return fn(S);
    } finally {
        Object.keys(temporary).forEach(key => {
            if (hadTemporaryKey[key]) {
                S.temporary[key] = previousTemporary[key];
            } else {
                delete S.temporary[key];
            }
        });

        if (shouldSwapEquipped && wardrobe) {
            wardrobe.equipped = previousEquipped;
        }
    }
}

function initializePlayerWardrobe() {
    const S = getState();
    if (!S || !S.variables || !S.variables.wardrobe) {
        return;
    }
    const wardrobe = S.variables.wardrobe;
    
    const setupObj = getSetup();
    const clothingData = setupObj.clothingData || {};
    const owned = [];
    
    const catKeys = Object.keys(clothingData);

    if (catKeys.length === 0) {
        return;
    }
    
    catKeys.forEach(category => {
        const items = clothingData[category] || [];
        items.forEach(item => {
            if (item.startOwned && !owned.includes(item.id)) {
                owned.push(item.id);
            }
        });
    });

    const validItemIds = new Set();
    catKeys.forEach(category => {
        const items = clothingData[category] || [];
        items.forEach(item => {
            if (item && item.id) validItemIds.add(item.id);
        });
    });

    // Only populate owned if it's truly empty
    if (!wardrobe.owned || wardrobe.owned.length === 0) {
        wardrobe.owned = owned;
    } else {
        wardrobe.owned = wardrobe.owned.filter(id => validItemIds.has(id));
    }

    // Clean equipped/outfits from removed DB item IDs
    wardrobe.equipped = wardrobe.equipped || {};
    const equippedKeys = Object.keys(wardrobe.equipped);
    equippedKeys.forEach(slot => {
        const itemId = wardrobe.equipped[slot];
        if (itemId && !validItemIds.has(itemId)) delete wardrobe.equipped[slot];
    });

    if (!wardrobe.outfits || !Array.isArray(wardrobe.outfits)) {
        wardrobe.outfits = [null, null, null, null];
    }
    wardrobe.outfits = wardrobe.outfits.map(outfit => {
        if (!outfit || !outfit.equipped) return outfit;
        const cleaned = {};
        Object.keys(outfit.equipped).forEach(slot => {
            const itemId = outfit.equipped[slot];
            if (itemId && validItemIds.has(itemId)) cleaned[slot] = itemId;
        });
        return { ...outfit, equipped: cleaned };
    });

    // Runtime fields for new spec
    if (!wardrobe.itemState || typeof wardrobe.itemState !== 'object') wardrobe.itemState = {};
    if (!wardrobe.wornToday || typeof wardrobe.wornToday !== 'object') wardrobe.wornToday = {};
    if (!Array.isArray(wardrobe.laundryBasket)) wardrobe.laundryBasket = [];

    // Also clean runtime maps from removed IDs
    Object.keys(wardrobe.itemState).forEach(id => {
        if (!validItemIds.has(id)) delete wardrobe.itemState[id];
    });
    Object.keys(wardrobe.wornToday).forEach(id => {
        if (!validItemIds.has(id)) delete wardrobe.wornToday[id];
    });
    wardrobe.laundryBasket = wardrobe.laundryBasket.filter(id => validItemIds.has(id));
    
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

/**
 * Effective looks with dirt penalty.
 * baseLooks fallback order: item.baseLooks -> item.looks -> 0
 * dirt fallback: 0 (clean)
 */
function getEffectiveLooks(item, itemId) {
    if (!item) return 0;
    const S = WardrobeAPI ? WardrobeAPI.State : getState();
    const itemState = S?.variables?.wardrobe?.itemState || {};
    const state = itemId ? itemState[itemId] : null;
    const dirtRaw = typeof state?.dirt === 'number' ? state.dirt : 0;
    const dirt = Math.max(0, Math.min(100, dirtRaw));
    const baseLooks = typeof item.baseLooks === 'number'
        ? item.baseLooks
        : (typeof item.looks === 'number' ? item.looks : 0);
    return Math.max(0, baseLooks * (1 - (dirt / 150)));
}

/** Format looks for display: integer when .0, otherwise one decimal (e.g. "1" not "1.0", "1.5" stays "1.5"). */
function formatLooks(value) {
    const n = typeof value === 'number' ? value : 0;
    const rounded = Math.round(n * 10) / 10;
    return (rounded % 1 === 0) ? String(Math.round(rounded)) : rounded.toFixed(1);
}

function calculateTotalLooks() {
    const S = WardrobeAPI ? WardrobeAPI.State : getState();
    const equipped = S?.variables?.wardrobe?.equipped || {};
    let total = 0;
    const seen = new Set();
    Object.values(equipped).forEach(itemId => {
        if (!itemId || seen.has(itemId)) return;
        seen.add(itemId);
        const item = getClothingById(itemId);
        if (item) total += getEffectiveLooks(item, itemId);
    });
    return total;
}

// --------------------------------------------
// Slot-weighted exposure & sexiness (spec 3.2)
// --------------------------------------------

/**
 * Get average exposure (or sexiness) for a slot group. Dress counts in both top and bottom.
 * @param {'top'|'bottom'|'underwear'} slotGroup
 * @param {'exposure'|'sexiness'} field - item.exposureLevel or item.sexinessScore
 * @returns {number} 0–10
 */
function getSlotGroupValue(slotGroup, field) {
    const S = WardrobeAPI ? WardrobeAPI.State : getState();
    const equipped = S?.variables?.wardrobe?.equipped || {};
    const slots = slotGroup === 'top' ? SLOT_GROUP_TOP : slotGroup === 'bottom' ? SLOT_GROUP_BOTTOM : SLOT_GROUP_UNDERWEAR;
    const key = field === 'exposure' ? 'exposureLevel' : 'sexinessScore';
    const seen = new Set(); // dress/body counted once per group; bra+panty same itemId = once
    let sum = 0;
    let count = 0;
    slots.forEach(slot => {
        const itemId = equipped[slot];
        if (!itemId || seen.has(itemId)) return;
        seen.add(itemId);
        const item = getClothingById(itemId);
        if (!item) return;
        const v = item[key];
        if (typeof v === 'number' && v >= 0) {
            sum += v;
            count++;
        }
    });
    return count > 0 ? sum / count : 0;
}

/**
 * Slot-weighted exposure 0–10 (spec 3.2). Used for reqConfidence, reqExhibitionism, reqCorruption, exposure state.
 */
function getWeightedExposure() {
    const top = getSlotGroupValue('top', 'exposure');
    const bottom = getSlotGroupValue('bottom', 'exposure');
    const underwear = getSlotGroupValue('underwear', 'exposure');
    const raw = (top * SLOT_WEIGHT_TOP + bottom * SLOT_WEIGHT_BOTTOM + underwear * SLOT_WEIGHT_UNDERWEAR) / SLOT_WEIGHT_SUM;
    return Math.max(0, Math.min(10, raw));
}

/**
 * Slot-weighted sexiness 0–10 (spec 3.2). Same weights as exposure.
 */
function getWeightedSexiness() {
    const top = getSlotGroupValue('top', 'sexiness');
    const bottom = getSlotGroupValue('bottom', 'sexiness');
    const underwear = getSlotGroupValue('underwear', 'sexiness');
    const raw = (top * SLOT_WEIGHT_TOP + bottom * SLOT_WEIGHT_BOTTOM + underwear * SLOT_WEIGHT_UNDERWEAR) / SLOT_WEIGHT_SUM;
    return Math.max(0, Math.min(10, raw));
}

if (typeof getSetup !== 'undefined' && getSetup()) {
    getSetup().getWeightedExposure = getWeightedExposure;
    getSetup().getWeightedSexiness = getWeightedSexiness;
    getSetup().getSlotGroupValue = getSlotGroupValue;
    getSetup().getEffectiveLooks = getEffectiveLooks;
    getSetup().calculateTotalLooks = calculateTotalLooks;
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
        casual: '#22c55e',
        cute: '#ec4899',
        elegant: '#a855f7',
        professional: '#3b82f6',
        sexy: '#f97316',
        sporty: '#06b6d4',
        slutty: '#ef4444',
        work: '#3b82f6'
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

    const WikifierClass = getWikifierClass();

    if (!WikifierClass) {
        return { allowed: true, reason: 'Requirement check unavailable' };
    }

    return withTemporaryWardrobeState({
        temporary: {
            wardrobeItemToCheck: item,
            wardrobeCheckResult: undefined
        }
    }, (S) => {
        try {
            new WikifierClass(null, "<<checkClothingRequirements>>");
        } catch (error) {
            return { allowed: true, reason: 'Requirement check unavailable' };
        }

        const result = S.temporary.wardrobeCheckResult;
        return result || { allowed: true };
    });
}

function checkCommandoRequirement(slot) {
    if (slot !== 'panty' && slot !== 'bra') return { allowed: true };

    const WikifierClass = getWikifierClass();

    if (!WikifierClass) {
        return { allowed: true, reason: 'Requirement check unavailable' };
    }

    return withTemporaryWardrobeState({
        temporary: {
            wardrobeSlotToCheck: slot,
            wardrobeCheckResult: undefined
        }
    }, (S) => {
        try {
            new WikifierClass(null, "<<checkCommandoRequirement>>");
        } catch (error) {
            return { allowed: true, reason: 'Requirement check unavailable' };
        }

        const result = S.temporary.wardrobeCheckResult;
        return result || { allowed: true };
    });
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

/** True if this itemId is currently equipped in any slot. */
function isEquipped(itemId) {
    if (!WardrobeAPI || !itemId) return false;
    const equipped = WardrobeAPI.State.variables.wardrobe?.equipped || {};
    return Object.values(equipped).indexOf(itemId) !== -1;
}

/**
 * True if item is valid for the given location filter (global locationId).
 * Item can have: locationId: "rubysDiner" or locations: ["rubysDiner", "otherPlace"].
 * @param {Object} item - Clothing item from clothingData
 * @param {string} locationId - e.g. "rubysDiner"
 */
function itemMatchesLocation(item, locationId) {
    if (!locationId) return true;
    if (!item) return false;
    if (item.locationId === locationId) return true;
    if (Array.isArray(item.locations) && item.locations.indexOf(locationId) !== -1) return true;
    return false;
}

/** If wardrobeRequiredJobId is set, check equipped matches job's requiredOutfit. Returns { allowed, reason }. */
function checkJobRequiredOutfit() {
    if (!wardrobeRequiredJobId) return { allowed: true };
    const job = getSetup().jobs?.[wardrobeRequiredJobId];
    const required = job?.shiftStart?.requiredOutfit;
    if (!required || typeof required !== 'object') return { allowed: true };
    const equipped = WardrobeAPI?.State?.variables?.wardrobe?.equipped || {};
    const missing = [];
    for (const [slot, itemId] of Object.entries(required)) {
        if (!itemId) continue;
        if (equipped[slot] !== itemId) missing.push(slot);
    }
    if (missing.length === 0) return { allowed: true };
    const slotNames = { top: 'top', bottom: 'bottom', apron: 'apron' };
    const list = missing.map(s => slotNames[s] || s).join(', ');
    return { allowed: false, reason: 'Work uniform required: wear ' + list + '.' };
}

/** True if itemId is in the snapshot taken when opening wardrobe with location filter. */
function isInSessionSnapshot(itemId) {
    if (!wardrobeSessionEquipped || !itemId) return false;
    return Object.values(wardrobeSessionEquipped).indexOf(itemId) !== -1;
}

/** True if item has bodysuit tag. */
function isBodysuitItem(item) {
    return item && item.tags && Array.isArray(item.tags) && item.tags.includes('bodysuit');
}

/** True if item is swimwear (swimsuit/bikini) and occupies swimsuit slot. */
function isSwimwearItem(item) {
    if (!item) return false;
    const tags = Array.isArray(item.tags) ? item.tags : [];
    return item.slot === 'swimsuit' || tags.includes('swimsuit') || tags.includes('bikini');
}

/**
 * Normalize equipped state for the new bodysuit model:
 * - legacy bodysuit saves (bra===panty===bodysuit) are migrated to bodysuit+top
 * - bodysuit always occupies the top slot
 * - bra cannot coexist with bodysuit
 */
function normalizeEquippedSlots(equipped) {
    if (!equipped || typeof equipped !== 'object') return equipped;

    if (equipped.bra && equipped.panty && equipped.bra === equipped.panty) {
        const combined = _w_getItemById(equipped.bra);
        if (isBodysuitItem(combined)) {
            equipped.bodysuit = equipped.bra;
            delete equipped.bra;
            delete equipped.panty;
        }
    }

    if (equipped.top) {
        const topItem = _w_getItemById(equipped.top);
        if (isBodysuitItem(topItem)) {
            equipped.bodysuit = equipped.top;
        }
    }

    if (equipped.bodysuit) {
        const bodysuitItem = _w_getItemById(equipped.bodysuit);
        if (isBodysuitItem(bodysuitItem)) {
            equipped.top = equipped.bodysuit;
            delete equipped.bra;
        } else {
            delete equipped.bodysuit;
        }
    }

    return equipped;
}

function clearBodysuitOccupancy(wardrobe) {
    if (!wardrobe?.equipped) return;
    const bodysuitId = wardrobe.equipped.bodysuit;
    if (bodysuitId && wardrobe.equipped.top === bodysuitId) {
        delete wardrobe.equipped.top;
    }
    delete wardrobe.equipped.bodysuit;
}

/** True if a bodysuit is currently equipped. */
function isBodysuitEquipped(wardrobe) {
    const itemId = wardrobe?.equipped?.bodysuit;
    if (!itemId) return false;
    const item = _w_getItemById(itemId);
    return isBodysuitItem(item);
}

/** True if a swimsuit/bikini is currently equipped. */
function isSwimwearEquipped(wardrobe) {
    const bra = wardrobe?.equipped?.bra;
    const panty = wardrobe?.equipped?.panty;
    if (!bra || bra !== panty) return false;
    const item = _w_getItemById(bra);
    return isSwimwearItem(item);
}

/** When no location filter: all owned. When filter set: session snapshot (what was on when entering) + location-matching items. */
function filterVisibleItems(items) {
    if (!wardrobeLocationFilter) {
        return items.filter(i => ownsItem(i.id));
    }
    return items.filter(i => ownsItem(i.id) && (isInSessionSnapshot(i.id) || itemMatchesLocation(i, wardrobeLocationFilter)));
}

function equipItem(itemId) {
    if (!WardrobeAPI) return;
    const item = _w_getItemById(itemId);
    if (!item || !ownsItem(itemId)) return;

    const req = checkRequirements(item);

    if (!req.allowed) {
        showToast(req.reason);
        return;
    }

    const slot = categoryToSlot[currentCategory] || null;
    if (!slot) return;

    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    normalizeEquippedSlots(wardrobe.equipped);

    if (slot === 'dress') {
        delete wardrobe.equipped.top;
        delete wardrobe.equipped.bottom;
        clearBodysuitOccupancy(wardrobe);
    }
    if (slot === 'top' || slot === 'bottom') {
        delete wardrobe.equipped.dress;
        if (slot === 'top') {
            clearBodysuitOccupancy(wardrobe);
        }
    }

    /* Bodysuit: occupies top + bra space, keeps panty optional, requires a bottom for valid exit. */
    if (slot === 'bodysuit') {
        delete wardrobe.equipped.swimsuit;
        delete wardrobe.equipped.dress;
        delete wardrobe.equipped.top;
        delete wardrobe.equipped.bra;
        delete wardrobe.equipped.bodysuit;
        wardrobe.equipped.bodysuit = itemId;
        wardrobe.equipped.top = itemId;
    } else if (slot === 'swimsuit') {
        /* Swimsuit occupies BOTH bra and panty slots (same as bodysuit-style occupancy) */
        clearBodysuitOccupancy(wardrobe);
        delete wardrobe.equipped.bra;
        delete wardrobe.equipped.panty;
        delete wardrobe.equipped.swimsuit; // legacy cleanup if old saves had this slot
        wardrobe.equipped.bra = itemId;
        wardrobe.equipped.panty = itemId;
    } else if (slot === 'bra' || slot === 'panty') {
        if (slot === 'bra') {
            clearBodysuitOccupancy(wardrobe);
        }
        /* Equipping bra or panty: clear swimsuit full-body occupancy first */
        const braId = wardrobe.equipped.bra;
        const pantyId = wardrobe.equipped.panty;
        if (braId && braId === pantyId) {
            const combined = _w_getItemById(braId);
            if (isSwimwearItem(combined)) {
                delete wardrobe.equipped.bra;
                delete wardrobe.equipped.panty;
            }
        }
        wardrobe.equipped[slot] = itemId;
    } else {
        wardrobe.equipped[slot] = itemId;
    }
    normalizeEquippedSlots(wardrobe.equipped);
    showToast(`Equipped: ${item.name}`);
    
    if (window.Wikifier) new Wikifier(null, "<<recalculateStats>><<updateCaption>><<updateClothesNotification>>");
    if (typeof UIBar !== 'undefined' && UIBar.update) UIBar.update();
    
    _w_renderAll();
}

function unequipSlot(slot) {
    if (!WardrobeAPI) return;
    const wardrobe = WardrobeAPI.State.variables.wardrobe;
    normalizeEquippedSlots(wardrobe.equipped);
    const itemId = wardrobe.equipped[slot];
    
    if (!itemId) return;
    
    const item = _w_getItemById(itemId);
    /* Bodysuit/swimsuit cleanup keeps the remaining compatible slots intact. */
    if (slot === 'bodysuit') {
        clearBodysuitOccupancy(wardrobe);
    } else if (slot === 'top' && wardrobe.equipped.bodysuit && wardrobe.equipped.bodysuit === itemId) {
        clearBodysuitOccupancy(wardrobe);
    } else if (
        slot === 'swimsuit' ||
        (
            (slot === 'bra' || slot === 'panty') &&
            wardrobe.equipped.bra === wardrobe.equipped.panty &&
            isSwimwearItem(item)
        )
    ) {
        delete wardrobe.equipped.bra;
        delete wardrobe.equipped.panty;
        delete wardrobe.equipped.swimsuit;
    } else {
        delete wardrobe.equipped[slot];
    }
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
        { id: "coats", name: "Coats", slot: "coat" },
        { id: "tops", name: "Tops", slot: "top" },
        { id: "bottoms", name: "Bottoms", slot: "bottom" },
        { id: "dresses", name: "Dresses", slot: "dress" },
        { id: "shoes", name: "Shoes", slot: "shoes" },
        { id: "socks", name: "Socks", slot: "socks" }
    ]},
    { group: "Underwear", items: [
        { id: "bodysuits", name: "Bodysuits", slot: "bodysuit" },
        { id: "bikiniTops", name: "Bikini Tops", slot: "bra" },
        { id: "bikiniBottoms", name: "Bikini Bottoms", slot: "panty" },
        { id: "bras", name: "Bras", slot: "bra" },
        { id: "panties", name: "Panties", slot: "panty" },
        { id: "sleepwear", name: "Sleepwear", slot: "sleepwear" },
        { id: "garter", name: "Garter", slot: "garter" }
    ]},
    { group: "Accessories", items: [
        { id: "earrings", name: "Earrings", slot: "earrings" },
        { id: "necklaces", name: "Necklaces", slot: "necklace" },
        { id: "bracelets", name: "Bracelets", slot: "bracelet" },
        { id: "rings", name: "Rings", slot: "ring" }
    ]},
    { group: "Other", items: [
        { id: "bags", name: "Bags", slot: "bag" },
        { id: "apron", name: "Apron", slot: "apron" }
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
        return;
    }

    let categories = getSetup().wardrobeCategories;

    if (!categories || categories.length === 0) {
        categories = defaultCategories;
    }
    // Apron is already in the "Other" group via wardrobeConfig — no auto-injection needed.

    let html = '';

    categories.forEach((group, gi) => {
        html += `<div class="category-group-title">${group.group}</div>`;
        group.items.forEach(cat => {
            const count = filterVisibleItems(getCategoryItems(cat.id)).length;
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

    const items = filterVisibleItems(getCategoryItems(currentCategory));
    
    const slot = categoryToSlot[currentCategory] || null;
    const equipped = WardrobeAPI.State.variables.wardrobe?.equipped || {};
    /* Bodysuits are stored in bra+panty; use bra for "equipped" check */
    normalizeEquippedSlots(equipped);
    const equippedId = slot === 'bodysuit' ? equipped.bodysuit : equipped[slot];

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
        const qClass = (item.quality ? String(item.quality) : 'common').toLowerCase();

        return `
        <div class="clothing-item ${equippedId === item.id ? 'equipped' : ''} ${lockedClass}" 
             data-id="${item.id}" 
             data-allowed="${req.allowed}"
             ${tooltipAttr}>
            <img class="clothing-img" src="${item.image}" alt="${item.name}">
            <span class="clothing-looks">${formatLooks(getEffectiveLooks(item, item.id))}</span>
            <div class="clothing-quality ${qClass}"></div>
            ${!req.allowed ? '<i class="icon icon-lock lock-icon"></i>' : ''}
            ${buildWardrobeItemTooltipHtml(item)}
        </div>
    `}).join('');

    const elements = container.querySelectorAll('.clothing-item');

    elements.forEach(el => {
        const itemId = el.dataset.id;

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const allowed = el.dataset.allowed === 'true';

            if (!allowed) {
                return;
            }

            if (equippedId === itemId) {
                unequipSlot(slot);
            } else {
                equipItem(itemId);
            }
        });
    });
    
    // Re-initialize tooltips after rendering
    if (window.initTooltips) {
        window.initTooltips();
    }
}

function renderWearingSlots() {
    if (!WardrobeAPI) {
        return;
    }
    const container = wardrobeContainer?.querySelector('.wearing-slots');
    if (!container) return;

    const slotLabels = getSetup().slotLabels || {};
    
    if (!WardrobeAPI.State) {
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

    normalizeEquippedSlots(equipped);
    const bodysuitOn = isBodysuitEquipped(WardrobeAPI.State.variables.wardrobe || {});
    let html = '<div class="slots-section-title">Outerwear</div>';
    const outerwearSlots = bodysuitOn
        ? ['coat', 'bottom', 'dress', 'shoes', 'socks']
        : ['coat', 'top', 'bottom', 'dress', 'shoes', 'socks'];
    html += outerwearSlots.map(renderSlot).join('');
    html += '<div class="slots-section-title">Underwear</div>';
    /* Bodysuit occupies top+bra, but panty remains optional and visible. */
    const wardrobe = WardrobeAPI.State.variables.wardrobe || {};
    const underwearSlots = (() => {
        if (isBodysuitEquipped(wardrobe)) {
            const bodysuitId = wardrobe.equipped.bodysuit;
            const combinedSlot = { slot: 'bodysuit', itemId: bodysuitId };
            return [combinedSlot, { slot: 'panty' }, { slot: 'sleepwear' }, { slot: 'garter' }];
        }
        if (isSwimwearEquipped(wardrobe)) {
            const braId = wardrobe.equipped.bra;
            const combinedSlot = { slot: 'swimsuit', itemId: braId };
            return [combinedSlot, { slot: 'sleepwear' }, { slot: 'garter' }];
        }
        return [{ slot: 'bra' }, { slot: 'panty' }, { slot: 'sleepwear' }, { slot: 'garter' }];
    })();
    html += underwearSlots.map(s => {
        const sid = typeof s === 'object' ? s.slot : s;
        const itemId = typeof s === 'object' && s.itemId !== undefined ? s.itemId : equipped[sid];
        const item = itemId ? _w_getItemById(itemId) : null;
        return `
            <div class="wearing-slot ${!item ? 'empty' : ''}" data-slot="${sid}">
                <div class="wearing-slot-img">${item ? `<img src="${item.image}">` : ''}</div>
                <div class="wearing-slot-info">
                    <div class="wearing-slot-category">${slotLabels[sid] || sid}</div>
                    <div class="wearing-slot-name">${item ? item.name : 'Empty'}</div>
                </div>
                ${item ? `<button class="wearing-slot-remove" data-slot="${sid}">✕</button>` : ''}
            </div>
        `;
    }).join('');
    html += '<div class="slots-section-title">Accessories</div>';
    html += ['earrings', 'necklace', 'bracelet', 'ring'].map(renderSlot).join('');
    html += '<div class="slots-section-title">Other</div>';
    html += ['bag', 'apron'].map(renderSlot).join('');

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
        totalLooksEl.textContent = formatLooks(calculateTotalLooks());
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
    const wardrobe = S?.variables?.wardrobe;
    const equipped = { ...(outfit.equipped || {}) };

    if (!wardrobe) {
        return { allowed: true };
    }

    normalizeEquippedSlots(equipped);

    return withTemporaryWardrobeState({ equipped }, () => {
        if (equipped.bodysuit && (!equipped.bottom || equipped.bottom === '')) {
            return { allowed: false, reason: 'Bodysuits require a bottom before leaving the wardrobe.' };
        }

        // Check Panty Requirement
        if ((!equipped.panty || equipped.panty === '') && !equipped.bodysuit) {
            const pantyReq = checkCommandoRequirement('panty');
            if (!pantyReq.allowed) {
                return pantyReq;
            }
        }

        // Check Bra Requirement
        if ((!equipped.bra || equipped.bra === '') && !equipped.bodysuit) {
            const braReq = checkCommandoRequirement('bra');
            if (!braReq.allowed) {
                return braReq;
            }
        }

        return { allowed: true };
    });
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
        normalizeEquippedSlots(wardrobe.equipped);
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
    hideWardrobeHoverFloaters();
    renderWearingSlots();
    renderStats();
    renderOutfits();
    
    // Update wear button after render
    if (typeof updateWearButton === 'function') {
        updateWearButton();
    }
}

function createWardrobeHTML(backPassage, backLinkText, hideBackLink) {
    backPassage = backPassage || 'fhBedroom';
    backLinkText = backLinkText || 'Bedroom';
    const backLinkHtml = hideBackLink
        ? '<span class="wardrobe-header-back-placeholder" aria-hidden="true"></span>'
        : `<a href="#" class="back-link" data-passage="${backPassage}">
                    <i class="icon icon-chevron-left"></i> ${backLinkText}
                </a>`;
    return `
        <div class="wardrobe-container">
            <div class="wardrobe-header">
                ${backLinkHtml}
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
                            <div class="stat-value looks" id="total-looks">0</div>
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

function wardrobeMacroHandler(output, locationFilter, customBackPassage, noBack, jobId) {
    wardrobeLocationFilter = null;
    wardrobeSessionEquipped = null;
    wardrobeRequiredJobId = jobId || null;
    const hideBackLink = !!(noBack === true || noBack === 'noBack' || noBack === 'true' || noBack === 1);
    const S = getState();

    const setupObj = getSetup();
    const passage = S?.passage || '';
    const locations = setupObj.locations || {};
    const navCards = setupObj.navCards || {};
    const backPassage = customBackPassage || locations[passage]?.parent || 'fhBedroom';
    const backLinkText = navCards[backPassage]?.name || 'Back';
    wardrobeReturnPassage = backPassage;

    const $wrapper = $(document.createElement('div'));
    $wrapper.addClass('wardrobe-wrapper');
    $wrapper.html(createWardrobeHTML(backPassage, backLinkText, hideBackLink));
    $wrapper.appendTo(output);

    wardrobeContainer = $wrapper.find('.wardrobe-container')[0];
    
    document.body.classList.add('wardrobe-active');

    // Force cleanup of any lingering tooltips on load
    $('.tooltip-popup').removeClass('active');

    removeWardrobeGlobalTooltips();
    const $wTooltip = $('<div id="global-wardrobe-item-tooltip" class="outfit-tooltip"></div>').appendTo('body');
    const $wImgPreview = $('<div id="wardrobe-item-img-preview"><img src="" alt=""></div>').appendTo('body');

    $wrapper.off('mouseenter.wardrobeTT mouseleave.wardrobeTT');
    $wrapper.on('mouseenter.wardrobeTT', '.clothing-item', function () {
        const $inner = $(this).find('.wardrobe-item-tooltip');
        if (!$inner.length) return;

        const rect = this.getBoundingClientRect();

        $wTooltip.html($inner.html());
        $wTooltip.addClass('visible');

        const tipH = $wTooltip.outerHeight();
        const tipW = $wTooltip.outerWidth();
        const gap = 10;

        let top = rect.top + (rect.height / 2) - (tipH / 2);
        if (top < 8) top = 8;
        if (top + tipH > window.innerHeight - 8) top = window.innerHeight - tipH - 8;

        const imgSrc = $inner.attr('data-item-img') || '';
        const imgAlt = $inner.attr('data-item-name') || '';
        let tooltipLeft;
        let previewLeft = null;

        if (imgSrc) {
            const imgSize = tipH;
            const stackW = imgSize + gap + tipW;
            const fitsRight = rect.right + stackW <= window.innerWidth - 8;
            const fitsLeft = rect.left - stackW >= 8;

            if (fitsRight) {
                previewLeft = rect.right + gap;
                tooltipLeft = previewLeft + imgSize + gap;
            } else if (fitsLeft) {
                tooltipLeft = rect.left - tipW - gap;
                previewLeft = tooltipLeft - imgSize - gap;
            } else {
                tooltipLeft = Math.min(rect.right + gap, window.innerWidth - tipW - 8);
                previewLeft = Math.max(8, tooltipLeft - imgSize - gap);
            }

            $wImgPreview.find('img').attr({ src: imgSrc, alt: imgAlt });
            $wImgPreview.css({ width: imgSize + 'px', height: imgSize + 'px', top: top + 'px', left: previewLeft + 'px' });
            $wImgPreview.addClass('visible');
        } else {
            tooltipLeft = rect.right + gap;
            if (tooltipLeft + tipW > window.innerWidth - 8) {
                tooltipLeft = rect.left - tipW - gap;
            }
            if (tooltipLeft < 8) tooltipLeft = 8;
        }

        $wTooltip.css({ top: top + 'px', left: tooltipLeft + 'px', visibility: 'visible', opacity: 1, transform: 'none' });
    });
    $wrapper.on('mouseleave.wardrobeTT', '.clothing-item', function () {
        $wTooltip.removeClass('visible').css({ visibility: 'hidden', opacity: 0 });
        $wImgPreview.removeClass('visible');
    });
    
    // Robust cleanup on navigation (removes itself after triggering once)
    $(document).one(':passageinit', function() {
        $('.tooltip-popup').removeClass('active');
        document.body.classList.remove('wardrobe-active');
        removeWardrobeGlobalTooltips();
    });

    const wardrobe = S.variables.wardrobe;
    const clothingData = setupObj.clothingData || {};

    // Capture initial state for "Cancel" functionality (Back button)
    const initialWardrobeState = JSON.parse(JSON.stringify(wardrobe));

    if (wardrobe && (!wardrobe.owned || wardrobe.owned.length === 0)) {
        initializePlayerWardrobe();
    }

    $wrapper.find('.back-link').on('click', function(e) {
        if (hideBackLink) return;
        e.preventDefault();

        removeWardrobeGlobalTooltips();

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
        let req = checkOutfitRequirements(currentOutfit);
        const jobReq = checkJobRequiredOutfit();
        if (jobReq.allowed === false) req = jobReq;
        const $btn = $(wardrobeContainer).find('.wear-return-btn');
        if (!req.allowed) {
            $btn.addClass('disabled');
            $btn.attr('data-outfit-tooltip', req.reason);
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
        let req = checkOutfitRequirements(currentOutfit);
        const jobReq = checkJobRequiredOutfit();
        if (jobReq.allowed === false) req = jobReq;
        if (!req.allowed) {
            showToast(req.reason);
            return;
        }
        
        if (window.Wikifier) new Wikifier(null, "<<recalculateStats>>");
        
        removeWardrobeGlobalTooltips();
        document.body.classList.remove('wardrobe-active');
        if (WardrobeAPI) {
            const target = wardrobeReturnPassage || 'fhBedroom';
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
            /* render failed */
        }
    }, 50);
}

// ============================================
// INIT FUNCTION (called by loader)
// ============================================

function WardrobeInit(API) {
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