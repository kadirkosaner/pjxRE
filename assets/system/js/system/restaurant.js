/**
 * Restaurant System
 * 3 columns: Foods | Drinks | Order & Pay
 * Single order: 1 food (optional) + 1 drink (optional). Pay → apply effects. No inventory.
 * All variable names prefixed to avoid conflict with shopping.js (e.g. restaurantReturnPassage).
 */

var RestaurantAPI = null;
var restaurantContainer = null;
var restaurantMenuId = null;
var restaurantName = '';
var restaurantFoods = [];
var restaurantDrinks = [];
var restaurantSelectedFood = null;
var restaurantSelectedDrink = null;
var restaurantReturnPassage = null;

function restaurantGetSetup() {
    if (typeof window !== 'undefined' && window.setup) return window.setup;
    if (typeof SugarCube !== 'undefined' && SugarCube.setup) return SugarCube.setup;
    if (typeof setup !== 'undefined') return setup;
    return {};
}

function restaurantGetState() {
    if (typeof window !== 'undefined' && window.State) return window.State;
    if (typeof SugarCube !== 'undefined' && SugarCube.State) return SugarCube.State;
    if (typeof State !== 'undefined') return State;
    return { variables: {} };
}

function restaurantGetEngine() {
    if (typeof window !== 'undefined' && window.Engine) return window.Engine;
    if (typeof SugarCube !== 'undefined' && SugarCube.Engine) return SugarCube.Engine;
    if (typeof Engine !== 'undefined') return Engine;
    return null;
}

function restaurantGetDish(type, id) {
    var dishes = restaurantGetSetup().restaurantDishes;
    if (!dishes) return null;
    var list = type === 'food' ? dishes.foods : dishes.drinks;
    if (!list) return null;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
    }
    return null;
}

function restaurantGetMenu(menuId) {
    var menus = restaurantGetSetup().restaurantMenus;
    return menus && menus[menuId] ? menus[menuId] : null;
}

var restaurantStatLabels = { hunger: 'Hunger', thirst: 'Thirst', energy: 'Energy', mood: 'Mood' };

function restaurantFormatEffects(dish) {
    if (!dish || !dish.effects || !dish.effects.length) return '';
    var parts = [];
    for (var i = 0; i < dish.effects.length; i++) {
        var e = dish.effects[i];
        if (e.type !== 'instant' || !e.stat) continue;
        var label = restaurantStatLabels[e.stat] || e.stat;
        var v = e.value;
        var s = (v > 0 ? '+' : '') + v + ' ' + label;
        parts.push(s);
    }
    return parts.join(', ');
}

function restaurantOrderTotal() {
    var total = 0;
    if (restaurantSelectedFood) {
        var d = restaurantGetDish('food', restaurantSelectedFood);
        if (d) total += d.price;
    }
    if (restaurantSelectedDrink) {
        d = restaurantGetDish('drink', restaurantSelectedDrink);
        if (d) total += d.price;
    }
    return total;
}

function restaurantApplyEffects(dish) {
    if (!dish || !dish.effects || !dish.effects.length) return;
    var S = restaurantGetState();
    for (var i = 0; i < dish.effects.length; i++) {
        var e = dish.effects[i];
        if (e.type === 'instant' && e.stat && S.variables[e.stat] !== undefined) {
            S.variables[e.stat] = (S.variables[e.stat] || 0) + (e.value || 0);
        }
    }
}

function restaurantPayCash() {
    var total = restaurantOrderTotal();
    if (total <= 0) { restaurantToast('Select something first.'); return; }
    var S = restaurantGetState();
    if ((S.variables.cashBalance || 0) < total) { restaurantToast('Not enough cash.'); return; }
    S.variables.moneySpend = (S.variables.moneySpend || 0) + total;
    S.variables.cashBalance = (S.variables.moneyEarn || 0) - (S.variables.moneySpend || 0);
    if (restaurantSelectedFood) {
        var d = restaurantGetDish('food', restaurantSelectedFood);
        if (d) restaurantApplyEffects(d);
    }
    if (restaurantSelectedDrink) {
        d = restaurantGetDish('drink', restaurantSelectedDrink);
        if (d) restaurantApplyEffects(d);
    }
    restaurantSelectedFood = null;
    restaurantSelectedDrink = null;
    S.variables.restaurantReturnPassage = restaurantReturnPassage;
    if (typeof $ !== 'undefined' && $.wiki) { $.wiki('<<recalculateStats>>'); }
    $(document).trigger(':passagerender');
    document.body.classList.remove('restaurant-active');
    var Eng = restaurantGetEngine();
    if (Eng && Eng.play) Eng.play('restaurantEating');
}

function restaurantPayCard() {
    var total = restaurantOrderTotal();
    if (total <= 0) { restaurantToast('Select something first.'); return; }
    var S = restaurantGetState();
    if ((S.variables.bankBalance || 0) < total) { restaurantToast('Insufficient bank balance.'); return; }
    S.variables.bankSpend = (S.variables.bankSpend || 0) + total;
    S.variables.bankBalance = (S.variables.bankDeposit || 0) - (S.variables.bankSpend || 0) - (S.variables.bankWithdraw || 0);
    if (restaurantSelectedFood) {
        var d = restaurantGetDish('food', restaurantSelectedFood);
        if (d) restaurantApplyEffects(d);
    }
    if (restaurantSelectedDrink) {
        d = restaurantGetDish('drink', restaurantSelectedDrink);
        if (d) restaurantApplyEffects(d);
    }
    restaurantSelectedFood = null;
    restaurantSelectedDrink = null;
    S = restaurantGetState();
    S.variables.restaurantReturnPassage = restaurantReturnPassage;
    if (typeof $ !== 'undefined' && $.wiki) { $.wiki('<<recalculateStats>>'); }
    $(document).trigger(':passagerender');
    document.body.classList.remove('restaurant-active');
    var Eng = restaurantGetEngine();
    if (Eng && Eng.play) Eng.play('restaurantEating');
}

function restaurantToast(msg) {
    var el = restaurantContainer ? restaurantContainer.querySelector('.restaurant-toast') : null;
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 2200);
}

function restaurantRenderFoods() {
    var listEl = restaurantContainer ? restaurantContainer.querySelector('.restaurant-foods-list') : null;
    if (!listEl) return;
    if (restaurantFoods.length === 0) {
        listEl.innerHTML = '<div class="restaurant-empty">No dishes today.</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < restaurantFoods.length; i++) {
        var d = restaurantFoods[i];
        var sel = restaurantSelectedFood === d.id ? ' selected' : '';
        html += '<div class="restaurant-dish-card' + sel + '" data-type="food" data-id="' + d.id + '">';
        html += '<div class="restaurant-dish-image"><img src="' + (d.image || '') + '" alt="' + d.name + '" onerror="this.style.display=\'none\'"></div>';
        html += '<div class="restaurant-dish-info"><div class="restaurant-dish-name">' + d.name + '</div><div class="restaurant-dish-price">$' + (typeof d.price === 'number' ? d.price.toFixed(2) : d.price) + '</div>';
        var effectsStr = restaurantFormatEffects(d);
        if (effectsStr) html += '<div class="restaurant-dish-effects">' + effectsStr + '</div>';
        if (d.desc) html += '<div class="restaurant-dish-desc">' + d.desc + '</div>';
        html += '</div><div class="restaurant-dish-select"></div></div>';
    }
    listEl.innerHTML = html;
    listEl.querySelectorAll('.restaurant-dish-card').forEach(function (card) {
        card.addEventListener('click', function () {
            restaurantSelectedFood = restaurantSelectedFood === card.dataset.id ? null : card.dataset.id;
            restaurantRenderAll();
        });
    });
}

function restaurantRenderDrinks() {
    var listEl = restaurantContainer ? restaurantContainer.querySelector('.restaurant-drinks-list') : null;
    if (!listEl) return;
    if (restaurantDrinks.length === 0) {
        listEl.innerHTML = '<div class="restaurant-empty">No drinks today.</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < restaurantDrinks.length; i++) {
        var d = restaurantDrinks[i];
        var sel = restaurantSelectedDrink === d.id ? ' selected' : '';
        html += '<div class="restaurant-dish-card' + sel + '" data-type="drink" data-id="' + d.id + '">';
        html += '<div class="restaurant-dish-image"><img src="' + (d.image || '') + '" alt="' + d.name + '" onerror="this.style.display=\'none\'"></div>';
        html += '<div class="restaurant-dish-info"><div class="restaurant-dish-name">' + d.name + '</div><div class="restaurant-dish-price">$' + (typeof d.price === 'number' ? d.price.toFixed(2) : d.price) + '</div>';
        var effectsStr = restaurantFormatEffects(d);
        if (effectsStr) html += '<div class="restaurant-dish-effects">' + effectsStr + '</div>';
        if (d.desc) html += '<div class="restaurant-dish-desc">' + d.desc + '</div>';
        html += '</div><div class="restaurant-dish-select"></div></div>';
    }
    listEl.innerHTML = html;
    listEl.querySelectorAll('.restaurant-dish-card').forEach(function (card) {
        card.addEventListener('click', function () {
            restaurantSelectedDrink = restaurantSelectedDrink === card.dataset.id ? null : card.dataset.id;
            restaurantRenderAll();
        });
    });
}

function restaurantRenderOrder() {
    var total = restaurantOrderTotal();
    var S = restaurantGetState();
    var cash = S.variables.cashBalance != null ? S.variables.cashBalance : 0;
    var bank = S.variables.bankBalance != null ? S.variables.bankBalance : 0;
    var totalEl = restaurantContainer ? restaurantContainer.querySelector('.restaurant-order-total') : null;
    var cashEl = restaurantContainer ? restaurantContainer.querySelector('.balance-cash') : null;
    var bankEl = restaurantContainer ? restaurantContainer.querySelector('.balance-bank') : null;
    var cashBtn = restaurantContainer ? restaurantContainer.querySelector('.restaurant-pay-cash') : null;
    var cardBtn = restaurantContainer ? restaurantContainer.querySelector('.restaurant-pay-card') : null;
    var summaryEl = restaurantContainer ? restaurantContainer.querySelector('.restaurant-order-summary') : null;
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if (cashEl) cashEl.textContent = '$' + cash;
    if (bankEl) bankEl.textContent = '$' + bank;
    if (cashBtn) cashBtn.classList.toggle('disabled', total <= 0 || cash < total);
    if (cardBtn) cardBtn.classList.toggle('disabled', total <= 0 || bank < total);
    var summaryHtml = '';
    if (restaurantSelectedFood) {
        var d = restaurantGetDish('food', restaurantSelectedFood);
        if (d) summaryHtml += '<div class="restaurant-order-line"><span class="restaurant-order-dot restaurant-order-dot-food"></span>' + d.name + ' — $' + (typeof d.price === 'number' ? d.price.toFixed(2) : d.price) + '</div>';
    }
    if (restaurantSelectedDrink) {
        d = restaurantGetDish('drink', restaurantSelectedDrink);
        if (d) summaryHtml += '<div class="restaurant-order-line"><span class="restaurant-order-dot restaurant-order-dot-drink"></span>' + d.name + ' — $' + (typeof d.price === 'number' ? d.price.toFixed(2) : d.price) + '</div>';
    }
    if (!summaryHtml) summaryHtml = '<div class="restaurant-order-placeholder">Pick a dish and a drink</div>';
    if (summaryEl) summaryEl.innerHTML = summaryHtml;
}

function restaurantRenderAll() {
    restaurantRenderFoods();
    restaurantRenderDrinks();
    restaurantRenderOrder();
}

function restaurantCreateHTML() {
    return '<div class="restaurant-container">' +
        '<header class="restaurant-header">' +
        '<a href="#" class="restaurant-back-link" data-passage="' + (restaurantReturnPassage || '') + '"><i class="icon icon-chevron-left"></i> Back</a>' +
        '<h1 class="restaurant-title">' + restaurantName + '</h1>' +
        '<div class="balance-display">' +
        '<div class="balance-item">Cash: <span class="balance-amount balance-cash">$0</span></div>' +
        '<div class="balance-item">Bank: <span class="balance-amount balance-bank">$0</span></div>' +
        '</div></header>' +
        '<div class="restaurant-main">' +
        '<section class="restaurant-column restaurant-column-foods">' +
        '<div class="cart-header"><span class="cart-title">DISHES</span></div>' +
        '<div class="restaurant-foods-list"></div></section>' +
        '<section class="restaurant-column restaurant-column-drinks">' +
        '<div class="cart-header"><span class="cart-title">DRINKS</span></div>' +
        '<div class="restaurant-drinks-list"></div></section>' +
        '<aside class="restaurant-column restaurant-column-order">' +
        '<div class="restaurant-order-panel">' +
        '<div class="cart-header"><span class="cart-title">YOUR ORDER</span></div>' +
        '<div class="restaurant-order-summary"></div>' +
        '<div class="restaurant-order-total-row"><span class="restaurant-order-total-label">Total</span><span class="restaurant-order-total">$0.00</span></div>' +
        '<div class="restaurant-payment-buttons">' +
        '<button type="button" class="restaurant-pay-btn restaurant-pay-cash disabled">Pay with Cash</button>' +
        '<button type="button" class="restaurant-pay-btn restaurant-pay-card disabled">Pay with Card</button>' +
        '</div></div></aside></div></div>' +
        '<div class="restaurant-toast" aria-live="polite"></div>';
}

function restaurantMacroHandler(output, menuId, backPassage) {
    var setupObj = restaurantGetSetup();
    var menu = restaurantGetMenu(menuId);
    if (!menu) {
        $(output).append('<div class="restaurant-error">Restaurant menu not found: ' + (menuId || '?') + '</div>');
        return;
    }
    var dishes = setupObj.restaurantDishes;
    if (!dishes || !dishes.foods || !dishes.drinks) {
        $(output).append('<div class="restaurant-error">Restaurant database not loaded.</div>');
        return;
    }
    restaurantMenuId = menuId;
    restaurantName = menu.name || 'Restaurant';
    restaurantFoods = [];
    for (var i = 0; menu.foods && i < menu.foods.length; i++) {
        var fd = restaurantGetDish('food', menu.foods[i]);
        if (fd) restaurantFoods.push(fd);
    }
    restaurantDrinks = [];
    for (i = 0; menu.drinks && i < menu.drinks.length; i++) {
        var dr = restaurantGetDish('drink', menu.drinks[i]);
        if (dr) restaurantDrinks.push(dr);
    }
    restaurantSelectedFood = null;
    restaurantSelectedDrink = null;
    restaurantReturnPassage = backPassage || (menu.back) || (restaurantGetState().variables.location) || menuId || 'start';

    var $wrapper = $(document.createElement('div'));
    $wrapper.addClass('restaurant-wrapper');
    $wrapper.html(restaurantCreateHTML());
    $wrapper.appendTo(output);
    restaurantContainer = $wrapper.find('.restaurant-container')[0];
    document.body.classList.add('restaurant-active');
    restaurantRenderAll();

    $wrapper.find('.restaurant-back-link').on('click', function (e) {
        e.preventDefault();
        document.body.classList.remove('restaurant-active');
        var passage = $(this).data('passage');
        if (passage && RestaurantAPI && RestaurantAPI.Engine) RestaurantAPI.Engine.play(passage);
    });
    $wrapper.find('.restaurant-pay-cash').on('click', function () {
        if (!$(this).hasClass('disabled')) restaurantPayCash();
    });
    $wrapper.find('.restaurant-pay-card').on('click', function () {
        if (!$(this).hasClass('disabled')) restaurantPayCard();
    });
}

function restaurantOpen(menuId, backPassage) {
    var setupObj = restaurantGetSetup();
    var menu = restaurantGetMenu(menuId);
    if (!menu) {
        console.warn('[Restaurant] Menu not found:', menuId);
        return;
    }
    var dishes = setupObj.restaurantDishes;
    if (!dishes || !dishes.foods || !dishes.drinks) {
        console.warn('[Restaurant] Database not loaded.');
        return;
    }
    var back = backPassage || menu.back || restaurantGetState().variables.location || menuId;
    restaurantMenuId = menuId;
    restaurantName = menu.name || 'Restaurant';
    restaurantFoods = [];
    for (var i = 0; menu.foods && i < menu.foods.length; i++) {
        var fd = restaurantGetDish('food', menu.foods[i]);
        if (fd) restaurantFoods.push(fd);
    }
    restaurantDrinks = [];
    for (i = 0; menu.drinks && i < menu.drinks.length; i++) {
        var dr = restaurantGetDish('drink', menu.drinks[i]);
        if (dr) restaurantDrinks.push(dr);
    }
    restaurantSelectedFood = null;
    restaurantSelectedDrink = null;
    restaurantReturnPassage = back;

    var $existing = $('#restaurant-overlay-root');
    if ($existing.length) $existing.remove();

    var $root = $('<div id="restaurant-overlay-root" class="restaurant-overlay-root"></div>');
    $root.html('<div class="restaurant-wrapper">' + restaurantCreateHTML() + '</div>');
    $('body').append($root);
    restaurantContainer = $root.find('.restaurant-container')[0];
    document.body.classList.add('restaurant-active');
    restaurantRenderAll();

    $root.find('.restaurant-back-link').on('click', function (e) {
        e.preventDefault();
        document.body.classList.remove('restaurant-active');
        $('#restaurant-overlay-root').remove();
        var passage = $(this).data('passage');
        if (passage && RestaurantAPI && RestaurantAPI.Engine) RestaurantAPI.Engine.play(passage);
    });
    $root.find('.restaurant-pay-cash').on('click', function () {
        if (!$(this).hasClass('disabled')) restaurantPayCash();
    });
    $root.find('.restaurant-pay-card').on('click', function () {
        if (!$(this).hasClass('disabled')) restaurantPayCard();
    });
}

function RestaurantInit(API) {
    RestaurantAPI = API;
    $(document).on('click', '.restaurant-trigger', function (e) {
        e.preventDefault();
        var menuId = $(this).data('menu');
        var back = $(this).data('back') || menuId;
        if (menuId && window.restaurantModule && window.restaurantModule.open) {
            window.restaurantModule.open(menuId, back);
        }
    });
}
window.RestaurantInit = RestaurantInit;
window.restaurantModule = { macroHandler: restaurantMacroHandler, open: restaurantOpen };
