// character.js
window.CharacterInit = function (API) {
    window.CharacterSystem = {
        API: API,

        // Helper to generate prologue history HTML
        generateHistoryHtml: function(vars) {
            if (!vars.prologueSelections) {
                return '<div style="color: var(--color-text-tertiary); font-style: italic;">No history recorded yet.</div>';
            }
            
            const sections = [
                { key: 'early', label: 'Early Years (0-5)' },
                { key: 'childhood', label: 'Childhood (6-9)' },
                { key: 'formative', label: 'Growing Up (10-12)' },
                { key: 'adolescent', label: 'Adolescence (13-15)' },
                { key: 'coming', label: 'Coming of Age (16-17)' }
            ];
            
            let html = '';
            sections.forEach(section => {
                const selection = vars.prologueSelections[section.key];
                if (selection) {
                    html += `
                        <div class="history-card" style="border: 1px solid var(--color-border-secondary); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 11px; color: var(--color-text-tertiary); margin-bottom: 4px;">${section.label}</div>
                                    <div style="font-weight: 500; color: var(--color-text-primary);">${selection.title}</div>
                                </div>
                                <div style="font-size: 12px; color: rgba(236, 72, 153, 1); font-weight: 500;">${selection.effect}</div>
                            </div>
                        </div>
                    `;
                }
            });
            
            return html || '<div style="color: var(--color-text-tertiary); font-style: italic;">No history recorded yet.</div>';
        },

        // Helper to generate traits HTML
        generateTraitsHtml: function(traits) {
            if (!traits || traits.length === 0) return '';
            
            return traits.map(trait => `
                <div class="trait-card">
                    <div class="trait-header">
                        <span class="trait-icon-large">
                            <span class="icon ${trait.icon || 'icon-star'}"></span>
                        </span>
                        <h4 class="trait-name">${trait.name}</h4>
                    </div>
                    <p class="trait-description">${trait.description || 'No description available.'}</p>
                    ${trait.effects ? `
                        <div class="trait-effects">
                            <span class="trait-effects-label">Effects:</span>
                            ${Object.entries(trait.effects).map(([key, value]) => 
                                `<span class="trait-effect">${value > 0 ? '+' : ''}${value} ${key.charAt(0).toUpperCase() + key.slice(1)}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        },

        // Helper to get item data from setup.items by ID
        getItemById: function(itemId) {
            const items = this.API.setup?.items || {};
            for (const category of Object.keys(items)) {
                const found = items[category].find(i => i.id === itemId);
                if (found) return found;
            }
            return null;
        },

        // Helper to format effect for display
        formatEffect: function(effect) {
            const statNames = {
                energy: 'Energy',
                mood: 'Mood',
                hunger: 'Hunger',
                thirst: 'Thirst',
                health: 'Health',
                looks: 'Looks',
                charisma: 'Charisma',
                beauty: 'Beauty',
                focus: 'Focus',
                relationship: 'Relationship',
                gymGains: 'Gym Gains',
                studyBonus: 'Study Bonus',
                inhibition: 'Inhibition'
            };
            const name = statNames[effect.stat] || effect.stat;
            const sign = effect.value > 0 ? '+' : '';
            let suffix = '';
            if (effect.type === 'temporary' && effect.duration) {
                suffix = ` (${effect.duration}h)`;
            } else if (effect.type === 'modifier') {
                suffix = ' (modifier)';
            } else if (effect.type === 'gift') {
                suffix = ' (gift)';
            }
            return `${sign}${effect.value} ${name}${suffix}`;
        },

        // Helper to generate inventory HTML
        generateInventoryHtml: function(vars) {
            const inventory = vars.inventory || [];
            
            if (inventory.length === 0) {
                return `
                    <div class="tab-content-inner inventory-container">
                        <div class="inventory-empty">
                            <div style="font-size: 2rem; opacity: 0.3; margin-bottom: 8px;">📦</div>
                            <div style="color: var(--color-text-tertiary);">Your inventory is empty</div>
                        </div>
                    </div>
                `;
            }

            const self = this;
            const itemsHtml = inventory.map(invItem => {
                const item = self.getItemById(invItem.id);
                if (!item) return '';
                
                // Generate effects tooltip content
                let effectsHtml = '';
                if (item.effects && item.effects.length > 0) {
                    effectsHtml = item.effects.map(e => `<div class="effect-line">${self.formatEffect(e)}</div>`).join('');
                } else {
                    effectsHtml = '<div class="effect-line" style="opacity: 0.5;">No effects</div>';
                }
                
                // Show use button only for direct usage items
                const showUseBtn = item.usageType === 'direct';
                
                return `
                    <div class="inventory-item" data-item-id="${item.id}">
                        <div class="item-info-icon">i</div>
                        <div class="item-effects-tooltip">
                            <div class="tooltip-title">${item.name}</div>
                            <div class="tooltip-desc">${item.desc || ''}</div>
                            <div class="tooltip-effects">${effectsHtml}</div>
                        </div>
                        <div class="inventory-item-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                            ${invItem.quantity > 1 ? `<span class="inventory-item-qty">${invItem.quantity}</span>` : ''}
                        </div>
                        <div class="inventory-item-info">
                            <div class="inventory-item-name">${item.name}</div>
                        </div>
                        ${showUseBtn ? `<button class="item-use-btn" onclick="CharacterSystem.useInventoryItem('${item.id}')">Use</button>` : ''}
                    </div>
                `;
            }).join('');

            return `
                <div class="tab-content-inner inventory-container">
                    <div class="inventory-grid">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        },

        // Use item from inventory
        useInventoryItem: function(itemId) {
            const self = window.CharacterSystem;
            const item = self.getItemById(itemId);
            if (!item || item.usageType !== 'direct') {
                console.log('[Inventory] Item not usable:', itemId, item?.usageType);
                return;
            }
            
            // Check if in inventory
            const inventory = self.API.State.variables.inventory || [];
            const invIndex = inventory.findIndex(i => i.id === itemId);
            
            if (invIndex === -1 || inventory[invIndex].quantity <= 0) {
                console.log('[Inventory] Item not in inventory:', itemId);
                return;
            }
            
            console.log('[Inventory] Using item:', item.name);
            
            // Stats that should be clamped between 0 and 100
            const CLAMP_STATS = ['energy', 'health', 'mood', 'arousal', 'hunger', 'thirst', 'stress', 'bladder', 'hygiene', 'focus'];
            
            // Prepare SugarCube macros for notification system
            let notificationScript = '<<initNotificationQueue>>';
            
            // Apply instant effects
            item.effects.forEach(effect => {
                if (effect.type === 'instant') {
                    let currentVal = self.API.State.variables[effect.stat] || 0;
                    let newVal = currentVal + effect.value;
                    
                    // Clamp values for standard stats
                    if (CLAMP_STATS.includes(effect.stat)) {
                        newVal = Math.max(0, Math.min(100, newVal));
                    }
                    
                    self.API.State.variables[effect.stat] = newVal;
                    console.log('[Inventory] Applied effect:', effect.stat, currentVal, '->', newVal);
                    
                    // Add to notification queue (effect.value determines the direction/color in the widget)
                    // Note: queueStatChange expects the raw change amount, not the clamped difference, 
                    // but for accurate notifications we might want to respect the clamped delta if needed.
                    // For now, passing the effect value as per standard behavior.
                    notificationScript += `<<queueStatChange "${effect.stat}" ${effect.value}>>`;
                }
            });
            
            // Remove from inventory (using index to ensure reference update)
            inventory[invIndex].quantity -= 1;
            
            if (inventory[invIndex].quantity <= 0) {
                inventory.splice(invIndex, 1);
                console.log('[Inventory] Item removed from inventory');
            } else {
                console.log('[Inventory] Item quantity decreased to:', inventory[invIndex].quantity);
            }
            
            // Trigger the notifications via SugarCube
            notificationScript += '<<flushNotifications>>';
            console.log('[Inventory] Running notification script');
            $.wiki(notificationScript);
            
            // Update UIBar to show stat changes
            if (typeof UIBar !== 'undefined' && UIBar.update) {
                UIBar.update();
            }
            $(document).trigger(':passagerender');
            
            // Refresh modal content (with delay to ensure state sync)
            setTimeout(() => {
                self.refreshInventoryTab();
            }, 10);
        },

        // Refresh inventory tab content
        refreshInventoryTab: function() {
            console.log('[Inventory] Refreshing tab (jQuery)...');
            const self = window.CharacterSystem;
            
            // Ensure we are getting the latest state
            const vars = self.API.State.variables;
            
            // Generate new HTML
            const newHtml = self.generateInventoryHtml(vars);
            
            // Use jQuery to find and replace the container
            // This is more robust as it handles cross-browser discrepancies and SugarCube's dialog structure
            const $container = $('.inventory-container');
            
            if ($container.length > 0) {
                $container.replaceWith(newHtml);
                console.log('[Inventory] DOM successfully replaced via jQuery');
            } else {
                console.error('[Inventory] Container not found via jQuery');
                // Try finding it within the modal specific context if generic fail
                const $modalContainer = $('#character-modal .inventory-container');
                if ($modalContainer.length > 0) {
                    $modalContainer.replaceWith(newHtml);
                    console.log('[Inventory] DOM replaced using modal ID scope');
                }
            }
        },

        // Helper to get clothing item by ID
        getClothingItemById: function(itemId) {
            if (!itemId) return null;
            const clothingData = this.API.setup?.clothingData || {};
            for (const category of Object.keys(clothingData)) {
                const found = clothingData[category].find(i => i.id == itemId);
                if (found) return found;
            }
            return null;
        },

        // Helper to get overall style
        getOverallStyle: function(equipped) {
            let revealingCount = 0;
            let totalLooks = 0;
            
            if (equipped) {
                Object.values(equipped).forEach(itemId => {
                    const item = this.getClothingItemById(itemId);
                    if (item) {
                        if (item.tags?.includes('revealing') || item.tags?.includes('sexy')) {
                            revealingCount++;
                        }
                        totalLooks += (item.looks || 0);
                    }
                });
            }
            
            let style = { text: 'Normal', color: '#22c55e' };
            if (revealingCount >= 3) style = { text: 'Provocative', color: '#ef4444' };
            else if (revealingCount >= 1) style = { text: 'Revealing', color: '#f59e0b' };
            
            return { style, totalLooks };
        },

        // Generate Outfit HTML
        generateOutfitHtml: function(vars) {
            const wardrobe = vars.wardrobe || {};
            const equipped = wardrobe.equipped || {};
            const self = this;
            
            // Define strict order as per reference image
            const mainSlots = [
                { id: 'top', label: 'Top' },
                { id: 'bottom', label: 'Bottom' },
                { id: 'dress', label: 'Dress' },
                { id: 'shoes', label: 'Shoes' },
                { id: 'socks', label: 'Socks' }
            ];
            
            const accessorySlots = [
                { id: 'earrings', label: 'Earrings' },
                { id: 'necklace', label: 'Necklace' },
                { id: 'bracelet', label: 'Bracelet' }
            ];
            
            const intimateSlots = [
                 { id: 'bra', label: 'Bra' },
                 { id: 'panty', label: 'Panties' }
            ];

            // Calculate Stats First
            const { style, totalLooks } = this.getOverallStyle(equipped);

            let html = '<div class="outfit-column">';
            
            // Top Stats Section (Separated)
            html += `
                <div class="outfit-top-stats">
                    <div class="top-stat-card">
                        <div class="top-stat-label">Style</div>
                        <div class="top-stat-value" style="color: ${style.color}">${style.text}</div>
                    </div>
                    <div class="top-stat-card">
                        <div class="top-stat-label">Looks</div>
                        <div class="top-stat-value" style="color: #ec4899;">${totalLooks}</div>
                    </div>
                </div>
            `;
            
            // Scroll area wrapper
            html += '<div class="outfit-list">';

            // Helper to render a list of slots
            const renderSlots = (slots) => {
                // ... (renderSlots code remains same, implied context)
                let sectionHtml = '';
                slots.forEach(slot => {
                    const itemId = equipped[slot.id];
                    const item = self.getClothingItemById(itemId);
                    
                    sectionHtml += `
                        <div class="outfit-card ${!item ? 'empty' : ''}">
                            <div class="outfit-card-icon">
                                ${item ? `<img src="${item.image}" alt="${item.name}">` : ''}
                            </div>
                            <div class="outfit-card-info">
                                <div class="outfit-card-label">${slot.label}</div>
                                <div class="outfit-card-name">${item ? item.name : 'Empty'}</div>
                            </div>
                            ${item ? '<div class="outfit-status-icon"></div>' : ''}
                            
                            ${item ? `
                             <div class="outfit-tooltip">
                                <div class="tooltip-header">${item.name}</div>
                                <div class="tooltip-desc">${item.desc || 'No description.'}</div>
                                <div class="tooltip-stats">
                                    <span class="tooltip-stat-row">
                                        <span class="tooltip-stat-label">Quality:</span>
                                        <span class="tooltip-stat-val quality-${item.quality ? item.quality.toLowerCase() : 'common'}">${item.quality}</span>
                                    </span>
                                    <span class="tooltip-stat-row">
                                        <span class="tooltip-stat-label">Looks:</span>
                                        <span class="tooltip-stat-val" style="color: #ec4899;">+${item.looks}</span>
                                    </span>
                                </div>
                                ${item.tags && item.tags.length > 0 ? 
                                    `<div class="tooltip-tags">
                                        ${item.tags.map(tag => `<span class="tooltip-tag-pill ${tag.toLowerCase()}">${tag}</span>`).join('')}
                                    </div>` : ''}
                             </div>
                             ` : ''}
                        </div>
                    `;
                });
                return sectionHtml;
            };

            // Main Section
            html += '<div class="outfit-section-header">Outerwear</div>';
            html += renderSlots(mainSlots);
            
            // Accessories Header & Section
            html += '<div class="outfit-section-header">Accessories</div>';
            html += renderSlots(accessorySlots);
            
            // Intimates Header & Section (Optional, keeping it for completeness)
            html += '<div class="outfit-section-header">Intimates</div>';
            html += renderSlots(intimateSlots);

            html += '</div>'; // End outfit-list
            
            html += '</div>';
            return html;
        },

        // Generate Visual Appearance HTML
        generateAppearanceHtml: function(vars) {
            // $player (Game State) vs $characters.player (NPC/Relation State)
            // settingsPage.twee saves to $player, so we should prioritize that.
            const p = vars.player || vars.characters.player || {}; 
            
            const app = vars.appearance || {};
            const body = vars.body || {};
            const sexual = vars.sexual || {}; 
            const setup = window.setup || {}; // Access global setup for images

            // --- Helper to Resolve Images ---
            const images = setup.playerAppearanceImages || {};
            
            // Hips
            const hipKey = "hip" + (p.hipSize || "Medium");
            const hipImg = images[hipKey] || "assets/content/people/player/body/ass/medium.webp";

            // Bust
            const bustSizeClean = (p.bustSize || "C").replace(/\+/g, '');
            const bustKey = "bust" + bustSizeClean;
            const bustImg = images[bustKey] || "assets/content/people/player/body/boobs/c-cup.webp";

            // Body Type
            const bodyTypeKey = "body" + (body.bodyType || "Normal");
            const bodyTypeImg = images[bodyTypeKey] || "assets/content/people/player/body/type/normal.webp";

            // Hair
            const outputHairLength = p.hairLength || "Long";
            const outputHairStyle = p.hairStyle || "Straight";
            const hairKey = "hair" + outputHairLength.replace(/\s+/g, '') + outputHairStyle;
            const hairImg = images[hairKey] || images["hairLongStraight"] || "assets/content/people/player/body/hair/straight/long_straight.webp";
            
            // Face (Placeholder logic as no dynamic face images found in snippet, using generic or makeup)
            // Ideally could select based on eye color or makeup level if assets existed.
            const faceImg = "assets/content/ProfilePlaceholder.png"; // Fallback/Default

            // --- Helper for formatting ---
            const getTanText = (level) => {
                if (level === 0) return "Fair";
                if (level < 3) return "Light Tan";
                if (level < 6) return "Tanned";
                return "Dark Tan";
            };

            const outfitHtml = this.generateOutfitHtml(vars);
            const bodyImage = "assets/content/people/player/body/appearanceBody.png";
            
            return `
                <div class="tab-content-inner appearance-container">
                    <div class="appearance-layout">
                        <!-- Left: Body Silhouette -->
                        <div class="appearance-body-column">
                            <div class="appearance-wrapper">
                                <!-- Body Silhouette -->
                        <div class="body-diagram-container">
                            <img src="${bodyImage}" class="body-diagram-img" alt="Body Appearance">
                            
                            <!-- POINTERS -->
                            
                            <!-- BODY TYPE (Top Center) -> Label Only -->
                            <div class="body-pointer pointer-bodytype" data-tooltip-target="bodytype">
                                <div class="pointer-label">Body Overall</div>
                            </div>
                            
                            <!-- HAIR (Right Side) -> Dot, Line, Label -->
                            <div class="body-pointer pointer-hair" data-tooltip-target="hair">
                                <div class="pointer-dot"></div>
                                <div class="pointer-line"></div>
                                <div class="pointer-label">Hair</div>
                            </div>

                            <!-- FACE (Left Side) -> Label, Line, Dot -->
                            <div class="body-pointer pointer-face" data-tooltip-target="face">
                                <div class="pointer-label">Face</div>
                                <div class="pointer-line"></div>
                                <div class="pointer-dot"></div>
                            </div>
                            
                            <!-- BUST (Left Side) -> Label, Line, Dot -->
                            <div class="body-pointer pointer-bust" data-tooltip-target="bust">
                                <div class="pointer-label">Breasts</div>
                                <div class="pointer-line"></div>
                                <div class="pointer-dot"></div>
                            </div>
                            
                            <!-- WAIST (Right Side) -> Dot, Line, Label -->
                            <div class="body-pointer pointer-waist" data-tooltip-target="waist">
                                <div class="pointer-dot"></div>
                                <div class="pointer-line"></div>
                                <div class="pointer-label">Waist</div>
                            </div>
                            
                            <!-- HIPS (Left Side) -> Label, Line, Dot -->
                            <div class="body-pointer pointer-hips" data-tooltip-target="hips">
                                <div class="pointer-label">Hips</div>
                                <div class="pointer-line"></div>
                                <div class="pointer-dot"></div>
                            </div>

                            <!-- VAGINA (Right Side) -> Dot, Line, Label -->
                            <div class="body-pointer pointer-vagina" data-tooltip-target="vagina">
                                <div class="pointer-dot"></div>
                                <div class="pointer-line"></div>
                                <div class="pointer-label">Vagina</div>
                            </div>

                            <!-- BUTTHOLE (Left Side) -> Label, Line, Dot -->
                            <div class="body-pointer pointer-anus" data-tooltip-target="anus">
                                <div class="pointer-label">Butthole</div>
                                <div class="pointer-line"></div>
                                <div class="pointer-dot"></div>
                            </div>
                        </div>
                        
                        <!-- TOOLTIP INFO PANELS (Card Style with Image) -->
                        
                        <!-- BODY OVERALL (Formerly Body Type) -->
                        <div class="app-info-panel" id="info-bodytype">
                            <div class="app-info-img">
                                <img src="${bodyTypeImg}" alt="Body Overall">
                            </div>
                            <div class="app-info-content">
                                <h4>Body Overall</h4>
                                <div class="app-stat-row"><span>Type:</span> <span class="val">${body.bodyType || 'Normal'}</span></div>
                                <div class="app-stat-row"><span>Height:</span> <span class="val">${body.height}cm</span></div>
                                <div class="app-stat-row"><span>Skin:</span> <span class="val">${getTanText(app.tanLevel)}</span></div>
                                <div class="app-stat-row"><span>Body Hair:</span> <span class="val">${(app.bodyHair?.legs > 0 || app.bodyHair?.armpits > 0) ? 'Natural' : 'Smooth'}</span></div>
                            </div>
                        </div>

                        <!-- HAIR -->
                        <div class="app-info-panel" id="info-hair">
                            <div class="app-info-img">
                                <img src="${hairImg}" alt="Hair">
                            </div>
                            <div class="app-info-content">
                                <h4>Hair Style</h4>
                                <div class="app-stat-row"><span>Color:</span> <span class="val">${p.hairColor}</span></div>
                                <div class="app-stat-row"><span>Style:</span> <span class="val">${p.hairStyle}</span></div>
                                <div class="app-stat-row"><span>Length:</span> <span class="val">${p.hairLength}</span></div>
                            </div>
                        </div>

                        <!-- FACE -->
                        <div class="app-info-panel" id="info-face">
                            <div class="app-info-img">
                                <img src="${faceImg}" alt="Face">
                            </div>
                            <div class="app-info-content">
                                <h4>Face & Makeup</h4>
                                <div class="app-stat-row"><span>Eyes:</span> <span class="val">${p.eyeColor}</span></div>
                                <div class="app-stat-row"><span>Makeup:</span> <span class="val">Level ${app.makeupLevel || 0}</span></div>
                            </div>
                        </div>
                        
                        <!-- BUST -->
                        <div class="app-info-panel" id="info-bust">
                            <div class="app-info-img">
                                <img src="${bustImg}" alt="Bust">
                            </div>
                            <div class="app-info-content">
                                <h4>Breasts</h4>
                                <div class="app-stat-row"><span>Size:</span> <span class="val">${p.bustSize} Cup</span></div>
                            </div>
                        </div>

                        <!-- WAIST -->
                        <div class="app-info-panel" id="info-waist">
                            <!-- Removed visual as requested -->
                            <div class="app-info-content">
                                <h4>Waist & Core</h4>
                                <div class="app-stat-row"><span>Size:</span> <span class="val">${body.waist}cm</span></div>
                                <div class="app-stat-row"><span>Body Fat:</span> <span class="val">${body.bodyFat}%</span></div>
                                <div class="app-stat-row"><span>BMI:</span> <span class="val">${body.bmi || 'N/A'}</span></div>
                            </div>
                        </div>

                        <!-- HIPS -->
                        <div class="app-info-panel" id="info-hips">
                            <div class="app-info-img">
                                <img src="${hipImg}" alt="Hips">
                            </div>
                            <div class="app-info-content">
                                <h4>Hips & Thighs</h4>
                                <div class="app-stat-row"><span>Hip Size:</span> <span class="val">${p.hipSize}</span></div>
                            </div>
                        </div>
                        
                        <!-- VAGINA -->
                        <div class="app-info-panel" id="info-vagina">
                            <div class="app-info-img placeholder-vagina">
                                <span>Intimate Visual</span>
                            </div>
                            <div class="app-info-content">
                                <h4>Pussy</h4>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${sexual.virginity?.vaginal?.intact ? 'Virgin' : 'Not Virgin'}</span></div>
                                <div class="app-stat-row"><span>Hair:</span> <span class="val">${app.bodyHair?.pubic > 0 ? 'Natural' : 'Shaved'}</span></div>
                            </div>
                        </div>

                        <!-- ANUS -->
                        <div class="app-info-panel" id="info-anus">
                            <div class="app-info-img placeholder-anus">
                                <span>Anal Visual</span>
                            </div>
                            <div class="app-info-content">
                                <h4>Anal</h4>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${sexual.virginity?.anal?.intact ? 'Virgin' : 'Used'}</span></div>
                                <div class="app-stat-row"><span>Capacity:</span> <span class="val">Tight</span></div>
                            </div>
                        </div>        </div>
                            </div>
                        </div>
                        
                        <!-- Right: Outfit Display -->
                        ${outfitHtml}
                    </div>
                </div>
            `;
        },

        // Open character modal
        open: function () {
            const vars = this.API.State.variables;
            const historyHtml = this.generateHistoryHtml(vars);
            const traitsHtml = this.generateTraitsHtml(vars.characters.player.traits);
            const appearanceHtml = this.generateAppearanceHtml(vars);

            this.API.Modal.create({
                id: 'character-modal',
                title: 'Character',
                width: '1000px', // Reverted width
                tabs: [
                    {
                        id: 'profile',
                        label: 'Profile',
                        content: `
                            <div class="tab-content-inner profile-container">
                                    <div class="profile-card">
                                    <div class="profile-header">
                                        <div class="profile-avatar-wrapper">
                                            <img src="${vars.characters.player.avatar}" class="profile-avatar" alt="Player Avatar">
                                        </div>
                                        <div class="profile-identity">
                                            <h2 class="profile-name">
                                                ${vars.characters.player.name} ${vars.characters.player.lastname || ""}
                                            </h2>
                                            <div class="profile-subtitle">
                                                ${2025 - vars.characters.player.birthYear} Years Old
                                            </div>
                                            <div class="profile-corruption" style="font-size: 0.85rem; color: #9333ea; margin-top: 4px;">
                                                Corruption Level ${vars.corruption || 0}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="profile-body">
                                        <div class="profile-section">
                                            <h3><span class="icon icon-bio"></span> Bio</h3>
                                            <div class="profile-text">
                                                ${vars.characters.player.info}
                                            </div>
                                        </div>
                                        
                                        <div class="profile-section">
                                            <h3><span class="icon icon-personal"></span> Personal History & Traits</h3>
                                            
                                            <!-- Prologue Memories -->
                                            <div class="history-list" style="margin-bottom: 16px;">
                                                ${historyHtml}
                                            </div>
                                            
                                            <!-- Traits -->
                                            <div class="traits-list" id="player-traits-container">
                                                ${traitsHtml}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        id: 'appearance',
                        label: 'Appearance',
                        content: appearanceHtml
                    },
                    {
                        id: 'inventory',
                        label: 'Inventory',
                        content: this.generateInventoryHtml(vars)
                    }
                ]
            });
            
            // Add interactions for appearance pointers
            setTimeout(() => {
                // Body Pointers Logic
                $('.body-pointer').hover(
                    function() {
                        const target = $(this).data('tooltip-target');
                        // Close any open ones first
                        $('.app-info-panel').removeClass('active');
                        $('.body-pointer').removeClass('active');
                        
                        // Open this one
                        $('#info-' + target).addClass('active');
                        $(this).addClass('active');
                    }, 
                    function() {
                        const target = $(this).data('tooltip-target');
                        $('#info-' + target).removeClass('active');
                        $(this).removeClass('active');
                    }
                );

                // Outfit Tooltip Logic (Global Fixed Tooltip)
                const $tooltip = $('<div id="global-outfit-tooltip" class="outfit-tooltip"></div>').appendTo('body');
                
                $('.outfit-card').hover(
                    function(e) {
                        const content = $(this).data('tooltip-content');
                        const card = $(this).closest('.outfit-card');
                        const rect = this.getBoundingClientRect();
                        
                        // If it's a data-tooltip-content (simple) or needs complex structure?
                        // The generateOutfitHtml is now putting html structures, let's grab the hidden tooltip from inside if specific
                        
                        // Actually, let's use the hidden .outfit-tooltip inside the slot if it exists, clone it, and show it fixed.
                        const innerTooltip = $(this).find('.outfit-tooltip');
                        
                        if (innerTooltip.length > 0) {
                            $tooltip.html(innerTooltip.html());
                            $tooltip.addClass('visible');
                            
                            // Position it to the left of the element
                            const tipHeight = $tooltip.outerHeight();
                            const tipWidth = $tooltip.outerWidth();
                            
                            let top = rect.top + (rect.height / 2) - (tipHeight / 2);
                            let left = rect.left - tipWidth - 10;
                            
                            $tooltip.css({
                                top: top + 'px',
                                left: left + 'px',
                                visibility: 'visible',
                                opacity: 1,
                                transform: 'none' // remove CSS transform since we calculate exact pos
                            });
                        }
                    },
                    function() {
                        $tooltip.removeClass('visible').css({visibility: 'hidden', opacity: 0});
                    }
                );
                
            }, 100);
        }
    };
};
