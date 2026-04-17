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

        // Helper to generate inventory HTML — shows all items with sub-tab filtering
        generateInventoryHtml: function(vars, activeSubTab) {
            activeSubTab = activeSubTab || 'all';
            const inventory = vars.inventory || [];
            const readFinished = vars.readFinished || [];
            const readProgress = vars.readProgress || {};
            const self = this;
            const setupObj = window.setup || {};

            // Build enriched list — sorted: consumables → cosmetics → tools → equipment → reading
            const categoryOrder = { consumable: 0, cosmetic: 1, tool: 2, equipment: 3, reading: 4 };
            const enriched = inventory.map(function(invItem) {
                const item = self.getItemById(invItem.id);
                if (!item) return null;
                return { invItem: invItem, item: item };
            }).filter(Boolean).sort(function(a, b) {
                const oa = categoryOrder[a.item.category] != null ? categoryOrder[a.item.category] : 99;
                const ob = categoryOrder[b.item.category] != null ? categoryOrder[b.item.category] : 99;
                return oa - ob;
            });

            // Tab definitions and filter logic
            const tabDefs = [
                { id: 'all',        label: 'All' },
                { id: 'consumables', label: 'Consumables' },
                { id: 'tools',      label: 'Tools' },
                { id: 'reading',    label: 'Books & Mags' }
            ];

            function filterForTab(tab) {
                return enriched.filter(function(e) {
                    const cat = e.item.category;
                    if (tab === 'all') return true;
                    if (tab === 'consumables') return cat === 'consumable' || cat === 'cosmetic';
                    if (tab === 'tools') return cat === 'tool' || cat === 'equipment';
                    if (tab === 'reading') return cat === 'reading';
                    return true;
                });
            }

            const activeItems = filterForTab(activeSubTab);

            // Sub-tabs HTML
            const tabsHtml = tabDefs.map(function(t) {
                const count = filterForTab(t.id).length;
                const active = activeSubTab === t.id ? ' active' : '';
                return `<button class="inv-subtab${active}" data-subtab="${t.id}">${t.label} <span class="inv-subtab-count">${count}</span></button>`;
            }).join('');

            // Empty state
            if (enriched.length === 0) {
                return `
                    <div class="tab-content-inner inventory-container">
                        <div class="inventory-empty">
                            <div class="inventory-empty-icon">📦</div>
                            <div class="inventory-empty-text">Your inventory is empty</div>
                        </div>
                    </div>
                `;
            }

            // Items HTML
            let itemsHtml = '';
            if (activeItems.length === 0) {
                itemsHtml = `
                    <div class="inventory-empty" style="grid-column:1/-1">
                        <div class="inventory-empty-icon" style="font-size:1.5rem">📦</div>
                        <div class="inventory-empty-text">Nothing in this category</div>
                    </div>`;
            } else {
                itemsHtml = activeItems.map(function(e) {
                    const invItem = e.invItem;
                    const item = e.item;
                    const isReading = item.category === 'reading';
                    const meta = isReading && setupObj.getReadingItem ? setupObj.getReadingItem(item.id) : null;
                    const safeId = String(item.id).replace(/"/g, '&quot;');

                    // Effects tooltip lines + reading status inside tooltip
                    let effectsHtml = '';
                    if (isReading && meta) {
                        const typeLabel = meta.type === 'book' ? 'Book' : 'Magazine';
                        // Status line
                        if (meta.type === 'book') {
                            const isFinished = readFinished.indexOf(item.id) >= 0;
                            const pagesRead = readProgress[item.id] || 0;
                            const statusText = isFinished ? '✓ Finished' : `${pagesRead}/${meta.pages} pages read`;
                            effectsHtml += `<div class="effect-line effect-meta">${typeLabel} &mdash; ${statusText}</div>`;
                        } else {
                            const qty = invItem.quantity || 1;
                            const statusText = qty > 1 ? `${qty}× unread` : 'Unread';
                            effectsHtml += `<div class="effect-line effect-meta">${typeLabel} &mdash; ${statusText}</div>`;
                        }
                        // Stat gain
                        if (meta.gainOnComplete && (meta.gainType || (meta.gainTypeOptions && meta.gainTypeOptions.length))) {
                            const sl = (meta.gainTypeOptions && meta.gainTypeOptions.length) ? meta.gainTypeOptions.join(' / ') : meta.gainType;
                            effectsHtml += `<div class="effect-line effect-stat">+${meta.gainOnComplete} ${sl}</div>`;
                        }
                        // Skill gain
                        if (meta.skillOnComplete && meta.skillOnComplete.skill) {
                            effectsHtml += `<div class="effect-line effect-skill">+${meta.skillOnComplete.amount} ${meta.skillOnComplete.skill} skill</div>`;
                        }
                    } else if (item.effects && item.effects.length > 0) {
                        effectsHtml = item.effects.map(function(ef) {
                            return `<div class="effect-line effect-stat">${self.formatEffect(ef)}</div>`;
                        }).join('');
                    } else {
                        effectsHtml = '<div class="effect-line effect-meta">No effects</div>';
                    }

                    // No badge or status below card title anymore
                    const readingStatusHtml = '';

                    const showUseBtn = !isReading && item.usageType === 'direct';
                    const qtyBadge = !isReading && invItem.quantity > 1
                        ? `<span class="inventory-item-qty">${invItem.quantity}</span>` : '';

                    return `
                        <div class="inventory-item${isReading ? ' inv-reading-item' : ''}" data-item-id="${safeId}">
                            <div class="inventory-item-image${isReading ? ' inv-reading-img' : ''}">
                                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                                ${qtyBadge}
                                <div class="item-info-icon">i</div>
                                <div class="item-effects-tooltip">
                                    <div class="tooltip-title">${item.name}</div>
                                    <div class="tooltip-desc">${item.desc || ''}</div>
                                    <div class="tooltip-effects">${effectsHtml}</div>
                                </div>
                            </div>
                            <div class="inventory-item-info">
                                <div class="inventory-item-name">${item.name}</div>
                                ${readingStatusHtml}
                            </div>
                            ${showUseBtn
                                ? `<button type="button" class="item-use-btn" data-item-id="${safeId}">Use</button>`
                                : '<div class="item-use-placeholder"></div>'
                            }
                        </div>
                    `;
                }).join('');
            }

            return `
                <div class="tab-content-inner inventory-container">
                    <div class="inventory-tab-header">
                        <span class="inventory-tab-title">Inventory</span>
                        <span class="inventory-tab-count">${enriched.length} item${enriched.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="inv-subtabs">${tabsHtml}</div>
                    <div class="inventory-grid">${itemsHtml}</div>
                </div>
            `;
        },

        // Use item from inventory
        useInventoryItem: function(itemId) {
            const self = window.CharacterSystem;
            const item = self.getItemById(itemId);
            if (!item || item.usageType !== 'direct') {
                return;
            }
            
            // Check if in inventory
            const inventory = self.API.State.variables.inventory || [];
            const invIndex = inventory.findIndex(i => i.id === itemId);
            
            if (invIndex === -1 || inventory[invIndex].quantity <= 0) {
                return;
            }
            
            // Stats that should be clamped between 0 and 100
            const CLAMP_STATS = ['energy', 'health', 'mood', 'arousal', 'hunger', 'thirst', 'stress', 'bladder', 'hygiene', 'focus'];
            const gs = self.API.State.variables.gameSettings || {};
            const simOff = {
                hunger: gs.trackHunger === false,
                thirst: gs.trackThirst === false,
                bladder: gs.trackBladder === false,
                hygiene: gs.hygieneRequirement === false
            };
            
            // Prepare SugarCube macros for notification system
            let notificationScript = '<<initNotificationQueue>>';
            
            // Apply instant effects
            item.effects.forEach(effect => {
                if (effect.type === 'instant') {
                    if (simOff[effect.stat]) {
                        return;
                    }
                    let currentVal = Number(self.API.State.variables[effect.stat]);
                    if (Number.isNaN(currentVal)) {
                        currentVal = 0;
                    }
                    const delta = Number(effect.value);
                    const add = Number.isNaN(delta) ? 0 : delta;
                    let newVal = currentVal + add;
                    
                    // Clamp values for standard stats
                    if (CLAMP_STATS.includes(effect.stat)) {
                        newVal = Math.max(0, Math.min(100, newVal));
                    }
                    
                    self.API.State.variables[effect.stat] = newVal;

                    // Add to notification queue (effect.value determines the direction/color in the widget)
                    // Note: queueStatChange expects the raw change amount, not the clamped difference, 
                    // but for accurate notifications we might want to respect the clamped delta if needed.
                    // For now, passing the effect value as per standard behavior.
                    notificationScript += `<<queueStatChange "${effect.stat}" ${add}>>`;
                }
            });
            
            // Remove from inventory (using index to ensure reference update)
            inventory[invIndex].quantity -= 1;
            
            if (inventory[invIndex].quantity <= 0) {
                inventory.splice(invIndex, 1);
            }

            // Trigger the notifications via SugarCube; recalculateStats refreshes notificationHunger / topbar need flags
            notificationScript += '<<flushNotifications>><<recalculateStats>>';
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
            const self = window.CharacterSystem;
            
            // Preserve active sub-tab
            const activeSubTab = $('.modal-overlay[data-modal="character-modal"] .inv-subtab.active').data('subtab') || 'all';
            
            // Ensure we are getting the latest state
            const vars = self.API.State.variables;
            
            // Generate new HTML
            const newHtml = self.generateInventoryHtml(vars, activeSubTab);
            
            // Use character modal-scoped selector first to avoid cross-view collisions.
            const $container = $('.modal-overlay[data-modal="character-modal"] .inventory-container');
            
            if ($container.length > 0) {
                $container.replaceWith(newHtml);
                $('.modal-overlay[data-modal="character-modal"] .modal-content').scrollTop(0);
            } else {
                const $modalContainer = $('.inventory-container');
                if ($modalContainer.length > 0) {
                    $modalContainer.replaceWith(newHtml);
                    $('.modal-overlay[data-modal="character-modal"] .modal-content').scrollTop(0);
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
                        totalLooks += (item.baseLooks ?? item.looks ?? 0);
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
            
            // Order matches setup.wardrobeCategories: Outerwear, Underwear, Accessories, Other
            const outerwearSlots = [
                { id: 'coat', label: 'Coat' },
                { id: 'top', label: 'Top' },
                { id: 'bottom', label: 'Bottom' },
                { id: 'dress', label: 'Dress' },
                { id: 'shoes', label: 'Shoes' },
                { id: 'socks', label: 'Socks' }
            ];

            const accessorySlots = [
                { id: 'earrings', label: 'Earrings' },
                { id: 'necklace', label: 'Necklace' },
                { id: 'bracelet', label: 'Bracelet' },
                { id: 'ring', label: 'Rings' }
            ];

            const bodysuitId = equipped.bodysuit;
            const bodysuitItem = bodysuitId ? self.getClothingItemById(bodysuitId) : null;
            /* Swimsuit still uses shared bra/panty occupancy; bodysuit has its own slot and keeps panty optional. */
            const braId = equipped.bra;
            const pantyId = equipped.panty;
            const braItem = braId ? self.getClothingItemById(braId) : null;
            const isFullBody = braId && pantyId && braId === pantyId && braItem;
            const isSwimsuitOn = isFullBody && braItem.slot === 'swimsuit';
            const isBodysuitOn = bodysuitItem && bodysuitItem.tags && bodysuitItem.tags.includes('bodysuit');
            const underwearSlots = isSwimsuitOn
                ? [{ id: 'bra', label: 'Swimsuit' }, { id: 'sleepwear', label: 'Sleepwear' }, { id: 'garter', label: 'Garter' }]
                : isBodysuitOn
                    ? [{ id: 'bodysuit', label: 'Bodysuit' }, { id: 'panty', label: 'Panties' }, { id: 'sleepwear', label: 'Sleepwear' }, { id: 'garter', label: 'Garter' }]
                    : [
                        { id: 'bra', label: 'Bra' },
                        { id: 'panty', label: 'Panties' },
                        { id: 'sleepwear', label: 'Sleepwear' },
                        { id: 'garter', label: 'Garter' }
                    ];

            const otherSlots = [
                { id: 'bag', label: 'Bag' },
                { id: 'apron', label: 'Apron' }
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
                    const runtime = (item && wardrobe.itemState && wardrobe.itemState[item.id]) ? wardrobe.itemState[item.id] : {};
                    const dirt = Math.max(0, Math.min(100, typeof runtime.dirt === 'number' ? runtime.dirt : 0));
                    const durability = Math.max(0, Math.min(100, typeof runtime.durability === 'number'
                        ? runtime.durability
                        : (item && typeof item.durability === 'number' ? item.durability : 100)));
                    const sexiness = item && typeof item.sexinessScore === 'number' ? item.sexinessScore : 0;
                    const exposure = item && typeof item.exposureLevel === 'number' ? item.exposureLevel : 0;
                    
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
                             <div class="outfit-tooltip" data-item-img="${item.image}" data-item-name="${item.name}">
                                <div class="tooltip-header">${item.name}</div>
                                <div class="tooltip-desc">${item.desc || 'No description.'}</div>
                                <div class="tooltip-stats">
                                    <span class="tooltip-stat-row">
                                        <span class="tooltip-stat-label">Quality:</span>
                                        <span class="tooltip-stat-val quality-${item.quality ? item.quality.toLowerCase() : 'common'}">${item.quality}</span>
                                    </span>
                                    <span class="tooltip-stat-row">
                                        <span class="tooltip-stat-label">Looks:</span>
                                        <span class="tooltip-stat-val" style="color: #ec4899;">+${(item.baseLooks ?? item.looks ?? 0)}</span>
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

            // Outerwear (same order as wardrobe: coats, tops, bottoms, dresses, shoes, socks)
            html += '<div class="outfit-section-header">Outerwear</div>';
            html += renderSlots(outerwearSlots);

            // Underwear
            html += '<div class="outfit-section-header">Underwear</div>';
            html += renderSlots(underwearSlots);

            // Accessories
            html += '<div class="outfit-section-header">Accessories</div>';
            html += renderSlots(accessorySlots);

            // Other (bags, apron – same as wardrobe "Other" group)
            html += '<div class="outfit-section-header">Other</div>';
            html += renderSlots(otherSlots);

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
            
            // Care 0-100 -> level index 0-3 and label (for photos)
            function getCareLevel(val) {
                const v = Number(val) || 0;
                if (v < 25) return { index: 0, label: 'Needs care' };
                if (v < 50) return { index: 1, label: 'Okay' };
                if (v < 75) return { index: 2, label: 'Good' };
                return { index: 3, label: 'Great' };
            }
            // Face: descriptive label for display (not "Needs care")
            function getFaceCareLabel(val) {
                const v = Number(val) || 0;
                if (v < 25) return 'Acne, dull skin';
                if (v < 50) return 'A bit tired';
                if (v < 75) return 'Clear, fresh';
                return 'Glowing';
            }
            // Teeth: descriptive label for display (not "Needs care")
            function getTeethCareLabel(val) {
                const v = Number(val) || 0;
                if (v < 25) return 'Yellow, stained';
                if (v < 50) return 'Slightly discolored';
                if (v < 75) return 'White, clean';
                return 'Bright, perfect';
            }
            // Hair care: condition from hairCare (0-100) – separate from combed status
            function getHairCareLabel(val) {
                const v = Number(val) || 0;
                if (v < 25) return 'Unkempt';
                if (v < 50) return 'Dull';
                if (v < 75) return 'Healthy';
                return 'Shiny';
            }
            function getMakeupDisplay(makeup) {
                const m = makeup || {};
                const state = String(m.state || 'off').toLowerCase();
                const style = Number(m.style || 0);
                const quality = Math.max(0, Math.min(100, Math.round(Number(m.quality || 0))));
                const styleNames = {
                    1: 'Light',
                    2: 'Medium',
                    3: 'Heavy',
                    4: 'Slutty',
                    5: 'Bimbo'
                };
                if (state === 'off' || style < 1 || !styleNames[style]) {
                    return 'Off';
                }
                return `${styleNames[style]} (${quality}%)`;
            }
            
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
            
            // Face (level-based from faceCare 0-100)
            const faceCareLevel = getCareLevel(app.faceCare);
            const faceImg = images['faceCare' + faceCareLevel.index] || "assets/content/people/player/body/face/face_care_" + faceCareLevel.index + ".webp";

            // Teeth (level-based from dentalCare 0-100)
            const teethCareLevel = getCareLevel(app.dentalCare);
            const teethImg = images['teethCare' + teethCareLevel.index] || "assets/content/people/player/body/teeth/teeth_care_" + teethCareLevel.index + ".webp";

            // Hair care level (for image; hair style img stays from player choice)
            const hairCareLevel = getCareLevel(app.hairCare);
            const hairCareImg = images['hairCare' + hairCareLevel.index] || "assets/content/people/player/appearance/hair_care_" + hairCareLevel.index + ".webp";

            // --- Helper for formatting ---
            const getTanText = (level) => {
                if (level === 0) return "Fair";
                if (level < 3) return "Light Tan";
                if (level < 6) return "Tanned";
                return "Dark Tan";
            };

            const outfitHtml = this.generateOutfitHtml(vars);
            const bodyImage = "assets/content/people/player/body/appearanceBody.webp";
            
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

                            <!-- TEETH (Right Side) -> Dot, Line, Label -->
                            <div class="body-pointer pointer-teeth" data-tooltip-target="teeth">
                                <div class="pointer-dot"></div>
                                <div class="pointer-line"></div>
                                <div class="pointer-label">Teeth</div>
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
                                <div class="app-stat-row"><span>Height:</span> <span class="val">${body.height != null ? body.height + 'cm' : '—'}</span></div>
                                <div class="app-stat-row"><span>Weight:</span> <span class="val">${body.weight != null ? body.weight + ' kg' : '—'}</span></div>
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
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${(app.hairCombed === 1) ? 'Combed' : 'Messy'}, ${getHairCareLabel(app.hairCare)}</span></div>
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
                                <div class="app-stat-row"><span>Makeup:</span> <span class="val">${getMakeupDisplay(vars.makeup)}</span></div>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${getFaceCareLabel(app.faceCare)}</span></div>
                            </div>
                        </div>

                        <!-- TEETH -->
                        <div class="app-info-panel" id="info-teeth">
                            <div class="app-info-img">
                                <img src="${teethImg}" alt="Teeth">
                            </div>
                            <div class="app-info-content">
                                <h4>Teeth</h4>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${getTeethCareLabel(app.dentalCare)}</span></div>
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
                                <div class="app-stat-row"><span>Size:</span> <span class="val">${body.waist ?? '—'}cm</span></div>
                                <div class="app-stat-row"><span>Body Fat:</span> <span class="val">${body.bodyFat ?? '—'}%</span></div>
                                <div class="app-stat-row"><span>BMI:</span> <span class="val">${body.bmi ?? 'N/A'}</span></div>
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
                            <div class="app-info-content">
                                <h4>Pussy</h4>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${sexual.virginity?.vaginal?.intact ? 'Virgin' : 'Not Virgin'}</span></div>
                                <div class="app-stat-row"><span>Hair:</span> <span class="val">${app.bodyHair?.pubic > 0 ? 'Natural' : 'Shaved'}</span></div>
                            </div>
                        </div>

                        <!-- ANUS -->
                        <div class="app-info-panel" id="info-anus">
                            <div class="app-info-content">
                                <h4>Anal</h4>
                                <div class="app-stat-row"><span>Status:</span> <span class="val">${sexual.virginity?.anal?.intact ? 'Virgin' : 'Used'}</span></div>
                                <div class="app-stat-row"><span>Capacity:</span> <span class="val">Tight</span></div>
                            </div>
                        </div>
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
                width: '1200px',
                borderRadius: '12px',
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
        <h2 class="profile-name">${vars.characters.player.name} ${vars.characters.player.lastname || ""}</h2>
        <div class="profile-subtitle">${2025 - vars.characters.player.birthYear} Years Old</div>
        <div class="profile-corruption" style="font-size: 0.85rem; color: #9333ea; margin-top: 4px;">Corruption Level ${vars.corruption || 0}</div>
      </div>
    </div>
    <div class="profile-body">
      <div class="profile-section">
        <h3><span class="icon icon-bio"></span> Bio</h3>
        <div class="profile-text">${vars.characters.player.info}</div>
      </div>
      <div class="profile-section">
        <h3><span class="icon icon-personal"></span> Personal History & Traits</h3>
        <div class="history-list" style="margin-bottom: 16px;">${historyHtml}</div>
        <div class="traits-list" id="player-traits-container">${traitsHtml}</div>
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

            const $characterModal = $('.modal-overlay[data-modal="character-modal"]');
            const $modalContent = $characterModal.find('.modal-content');
            const resetScroll = function () { $modalContent.scrollTop(0); };
            resetScroll();
            $characterModal.off('click.characterInventoryTabReset', '.modal-tab[data-tab="inventory"]');
            $characterModal.on('click.characterInventoryTabReset', '.modal-tab[data-tab="inventory"]', function () {
                setTimeout(resetScroll, 0);
                requestAnimationFrame(resetScroll);
            });
            
            // Add interactions for appearance pointers (panels break out of modal via fixed positioning)
            setTimeout(() => {
                const Z_ABOVE_MODAL = 100000;
                function pinPanelToViewport($panel) {
                    if (!$panel.length) return;
                    $panel.addClass('active');
                    requestAnimationFrame(function() {
                        const rect = $panel[0].getBoundingClientRect();
                        $panel.css({
                            position: 'fixed',
                            left: rect.left + 'px',
                            top: rect.top + 'px',
                            width: rect.width + 'px',
                            zIndex: Z_ABOVE_MODAL
                        });
                    });
                }
                function unpinPanel($panel) {
                    if (!$panel.length) return;
                    $panel.removeClass('active').css({ position: '', left: '', top: '', width: '', zIndex: '' });
                }
                $('.body-pointer').hover(
                    function() {
                        const target = $(this).data('tooltip-target');
                        $('.app-info-panel').each(function() { unpinPanel($(this)); });
                        $('.body-pointer').removeClass('active');
                        const $panel = $('#info-' + target);
                        $(this).addClass('active');
                        pinPanelToViewport($panel);
                    },
                    function() {
                        const target = $(this).data('tooltip-target');
                        unpinPanel($('#info-' + target));
                        $(this).removeClass('active');
                    }
                );

                // Outfit Tooltip Logic (Global Fixed Tooltip + Separate Image Preview)
                const $tooltip = $('<div id="global-outfit-tooltip" class="outfit-tooltip"></div>').appendTo('body');
                const $imgPreview = $('<div id="outfit-item-img-preview"><img src="" alt=""></div>').appendTo('body');
                
                $('.outfit-card').hover(
                    function() {
                        const innerTooltip = $(this).find('.outfit-tooltip');
                        if (innerTooltip.length === 0) return;

                        const rect = this.getBoundingClientRect();

                        // --- Info tooltip (right side) ---
                        $tooltip.html(innerTooltip.html());
                        $tooltip.addClass('visible');

                        const tipHeight = $tooltip.outerHeight();
                        const tipWidth = $tooltip.outerWidth();

                        let top = rect.top + (rect.height / 2) - (tipHeight / 2);
                        let left = rect.left - tipWidth - 10;

                        if (top < 8) top = 8;
                        if (top + tipHeight > window.innerHeight - 8) top = window.innerHeight - tipHeight - 8;
                        if (left < 8) left = rect.right + 10;

                        $tooltip.css({ top: top + 'px', left: left + 'px', visibility: 'visible', opacity: 1, transform: 'none' });

                        // --- Image preview (separate div, same height as tooltip, 1:1 ratio) ---
                        const imgSrc = innerTooltip.data('item-img') || '';
                        const imgAlt = innerTooltip.data('item-name') || '';
                        if (imgSrc) {
                            $imgPreview.find('img').attr({ src: imgSrc, alt: imgAlt });
                            // Match tooltip height exactly; width = height for 1:1
                            $imgPreview.css({ width: tipHeight + 'px', height: tipHeight + 'px' });
                            $imgPreview.addClass('visible');

                            let previewLeft = left - tipHeight - 8;
                            let previewTop = top;

                            if (previewLeft < 8) previewLeft = 8;
                            if (previewTop < 8) previewTop = 8;
                            if (previewTop + tipHeight > window.innerHeight - 8) previewTop = window.innerHeight - tipHeight - 8;

                            $imgPreview.css({ top: previewTop + 'px', left: previewLeft + 'px' });
                        }
                    },
                    function() {
                        $tooltip.removeClass('visible').css({ visibility: 'hidden', opacity: 0 });
                        $imgPreview.removeClass('visible');
                    }
                );
                
            }, 100);

            // Delegated click for inventory sub-tabs
            $(document).off('click.characterInventorySubTab', '.modal-overlay[data-modal="character-modal"] .inv-subtab');
            $(document).on('click.characterInventorySubTab', '.modal-overlay[data-modal="character-modal"] .inv-subtab', function (e) {
                e.preventDefault();
                const tab = $(this).data('subtab');
                const vars = window.CharacterSystem.API.State.variables;
                const html = window.CharacterSystem.generateInventoryHtml(vars, tab);
                const $container = $('.modal-overlay[data-modal="character-modal"] .inventory-container');
                if ($container.length) {
                    $container.replaceWith(html);
                }
            });

            // Delegated click for Use button (works after refreshInventoryTab)
            $(document).off('click.characterInventory', '.modal-overlay[data-modal="character-modal"] .item-use-btn');
            $(document).on('click.characterInventory', '.modal-overlay[data-modal="character-modal"] .item-use-btn', function (e) {
                e.preventDefault();
                const itemId = $(this).data('item-id') || $(this).closest('.inventory-item').data('item-id');
                if (itemId && window.CharacterSystem && typeof window.CharacterSystem.useInventoryItem === 'function') {
                    window.CharacterSystem.useInventoryItem(itemId);
                }
            });
        }
    };
};
