let DebugAPI = null;

// Initialize
window.DebugInit = function(API) {
    DebugAPI = API;
    createDebugPanel();
    createDebugButton();
};

// Create debug button
function createDebugButton() {
    if (!DebugAPI) return;
    
    // Remove old button if exists
    $('#debug-btn').remove();
    
    const html = `
        <button class="debug-btn" id="debug-btn">
            <span class="icon icon-bug icon-20"></span>
        </button>
    `;
    
    DebugAPI.$('body').append(html);
    
    $('#debug-btn').on('click', function() {
        openDebugPanel();
    });
}

// Create debug panel
function createDebugPanel() {
    if (!DebugAPI) return;
    
    // Remove old panel if exists
    $('#debug-panel, #debug-overlay').remove();
    
    // Create debug panel HTML
    const html = `
        <div class="overlay overlay-medium debug-overlay" id="debug-overlay"></div>
        <div class="debug-panel" id="debug-panel">
            <div class="debug-header">
                <span class="debug-title">Debug Console</span>
                <button class="close-btn" id="debug-close">
                    <span class="icon icon-close icon-18"></span>
                </button>
            </div>
            
            <div class="debug-content">
                <div class="debug-row">
                    <label class="debug-label">Variable</label>
                    <input type="text" class="debug-input" id="debug-variable" placeholder="playerHealth">
                </div>
                
                <div class="debug-row">
                    <label class="debug-label">Operation</label>
                    <select class="debug-select" id="debug-operation">
                        <option value="=">=</option>
                        <option value="+=">+=</option>
                        <option value="-=">-=</option>
                    </select>
                </div>
                
                <div class="debug-row">
                    <label class="debug-label">Value</label>
                    <input type="text" class="debug-input" id="debug-value" placeholder="100">
                </div>
                
                <div class="debug-row">
                    <button class="debug-apply-btn" id="debug-apply">Apply</button>
                </div>
                
                <div class="debug-result" id="debug-result"></div>
                
                <div class="debug-divider"></div>
                <div class="debug-section-title">Add to inventory</div>
                <div class="debug-row">
                    <label class="debug-label">Item ID</label>
                    <input type="text" class="debug-input" id="debug-item-id" placeholder="comb">
                </div>
                <div class="debug-row">
                    <label class="debug-label">Quantity</label>
                    <input type="number" class="debug-input" id="debug-item-qty" placeholder="1" min="1" value="1">
                </div>
                <div class="debug-row">
                    <button class="debug-apply-btn" id="debug-add-item">Add item</button>
                </div>
                <div class="debug-result" id="debug-item-result"></div>
            </div>
        </div>
    `;
    
    // Insert to page
    DebugAPI.$('body').append(html);
    
    // Close events
    $('#debug-close, #debug-overlay').on('click', function() {
        closeDebugPanel();
    });
    
    // Apply button
    $('#debug-apply').on('click', function() {
        applyDebugChange();
    });
    
    // Add to inventory button
    $('#debug-add-item').on('click', function() {
        addItemToInventory();
    });
    
    // Enter key support
    $('#debug-variable, #debug-value').on('keypress', function(e) {
        if (e.which === 13) {
            applyDebugChange();
        }
    });
}

// Open debug panel
function openDebugPanel() {
    $('#debug-panel').addClass('open');
    $('#debug-overlay').addClass('active');
}

// Close debug panel
function closeDebugPanel() {
    $('#debug-panel').removeClass('open');
    $('#debug-overlay').removeClass('active');
}

// Apply debug change
function applyDebugChange() {
    if (!DebugAPI) return;
    
    const variable = $('#debug-variable').val().trim();
    const operation = $('#debug-operation').val();
    const valueStr = $('#debug-value').val().trim();
    
    if (!variable) {
        showDebugResult('Error: Variable name required', 'error');
        return;
    }
    
    if (!valueStr) {
        showDebugResult('Error: Value required', 'error');
        return;
    }
    
    // Parse value
    let value;
    if (valueStr === 'true') {
        value = true;
    } else if (valueStr === 'false') {
        value = false;
    } else if (!isNaN(valueStr)) {
        value = Number(valueStr);
    } else {
        value = valueStr;
    }
    
    const vars = DebugAPI.State.variables;
    
    try {
        // Get nested property value
        const getNestedValue = (obj, path) => {
            const keys = path.split('.');
            let current = obj;
            for (let key of keys) {
                if (current === undefined || current === null) return undefined;
                current = current[key];
            }
            return current;
        };
        
        // Set nested property value
        const setNestedValue = (obj, path, value) => {
            const keys = path.split('.');
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        };
        
        const oldValue = getNestedValue(vars, variable);
        let newValue;
        
        switch(operation) {
            case '=':
                setNestedValue(vars, variable, value);
                newValue = value;
                break;
            case '+=':
                if (typeof oldValue === 'number' && typeof value === 'number') {
                    newValue = oldValue + value;
                    setNestedValue(vars, variable, newValue);
                } else {
                    showDebugResult('Error: += requires numeric values', 'error');
                    return;
                }
                break;
            case '-=':
                if (typeof oldValue === 'number' && typeof value === 'number') {
                    newValue = oldValue - value;
                    setNestedValue(vars, variable, newValue);
                } else {
                    showDebugResult('Error: -= requires numeric values', 'error');
                    return;
                }
                break;
        }
        
        showDebugResult(`Success: ${variable} = ${newValue} (was: ${oldValue})`, 'success');
        
        // Trigger re-render
        $(document).trigger(':passagerender');
        
    } catch (error) {
        showDebugResult(`Error: ${error.message}`, 'error');
    }
}

// Add item to inventory (uses State.variables.inventory)
function addItemToInventory() {
    if (!DebugAPI) return;
    
    const itemId = $('#debug-item-id').val().trim();
    const qtyStr = $('#debug-item-qty').val().trim();
    const qty = Math.max(1, parseInt(qtyStr, 10) || 1);
    
    if (!itemId) {
        showItemResult('Error: Item ID required', 'error');
        return;
    }
    
    const vars = DebugAPI.State.variables;
    if (!vars.inventory) {
        vars.inventory = [];
    }
    
    try {
        const found = vars.inventory.find(function(item) { return item.id === itemId; });
        if (found) {
            found.quantity = (found.quantity || 1) + qty;
        } else {
            vars.inventory.push({ id: itemId, quantity: qty });
        }
        showItemResult('Added: ' + itemId + ' x' + qty, 'success');
        $(document).trigger(':passagerender');
    } catch (error) {
        showItemResult('Error: ' + error.message, 'error');
    }
}

function showItemResult(message, type) {
    const result = $('#debug-item-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    setTimeout(function() {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}

// Show result message
function showDebugResult(message, type) {
    const result = $('#debug-result');
    result.text(message);
    result.removeClass('success error');
    result.addClass(type);
    
    setTimeout(() => {
        result.fadeOut(300, function() {
            $(this).text('').show().removeClass('success error');
        });
    }, 3000);
}