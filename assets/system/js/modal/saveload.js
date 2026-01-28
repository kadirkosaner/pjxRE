// SaveLoadAPI will be stored on window to prevent duplicate declarations  
window.SaveLoadAPI = window.SaveLoadAPI || null;

// Initialize
window.SaveloadInit = function (API) {
    window.SaveLoadAPI = API;
    console.log('[SaveLoad] Module initialized - custom save/load ready');

    // Auto-save on passage navigation (except Start passage)
    $(document).on(':passageend', function () {
        const currentPassage = API.State.passage;

        // Don't auto-save on Start (startscreen) or initial passages
        if (currentPassage && currentPassage !== 'Start') {
            try {
                // Generate auto-save title: autosave_DD:MM:YYYY_HH:MM
                const now = new Date();
                const day = now.getDate().toString().padStart(2, '0');
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const autoSaveTitle = `autosave_${day}:${month}:${year}_${hours}:${minutes}`;
                
                // Save with metadata containing title
                API.Save.slots.save(0, null, { saveTitle: autoSaveTitle });
                console.log('[SaveLoad] Auto-saved to slot 0 with title:', autoSaveTitle);
            } catch (error) {
                console.error('[SaveLoad] Auto-save failed:', error);
            }
        }
    });
};

// Open custom save/load modal
window.openCustomSaveLoad = function () {
    const API = window.SaveLoadAPI;
    if (!API) return;

    // Remove existing overlay if any
    $('#saveload-overlay').remove();

    // Create modal HTML
    const html = `
        <div id="saveload-overlay" class="overlay overlay-dark">
            <div class="modal saveload-modal">
                <div class="modal-header">
                    <span class="modal-title">Save / Load Game</span>
                    <button class="close-btn" id="saveload-close">
                        <span class="icon icon-close icon-18"></span>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="saveload-grid" id="saveload-grid">
                        <!-- Slots will be rendered here -->
                    </div>
                    <div class="disk-actions">
                        <button id="save-to-disk" class="disk-btn">
                            <span class="icon icon-save icon-16"></span>
                            <span>Save to Disk</span>
                        </button>
                        <button id="load-from-disk" class="disk-btn">
                            <span class="icon icon-upload icon-16"></span>
                            <span>Load from Disk</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    API.$('body').append(html);

    // Render save slots
    renderSaveSlots();

    // Show overlay
    $('#saveload-overlay').addClass('active');

    // Close button event
    $('#saveload-close').on('click', closeCustomSaveLoad);

    // Disk save/load buttons
    $('#save-to-disk').on('click', saveToDisk);
    $('#load-from-disk').on('click', loadFromDisk);

    // Click outside to close
    $('#saveload-overlay').on('click', function (e) {
        if (e.target === this) {
            closeCustomSaveLoad();
        }
    });
};

// Close modal
window.closeCustomSaveLoad = function () {
    $('#saveload-overlay').removeClass('active');
    setTimeout(() => {
        $('#saveload-overlay').remove();
    }, 300);
};

// Render all save slots
function renderSaveSlots() {
    const API = window.SaveLoadAPI;
    if (!API) return;

    const $grid = $('#saveload-grid');
    $grid.empty();

    // Render 8 slots (0-7)
    for (let i = 0; i < 8; i++) {
        const slotHtml = renderSlot(i);
        $grid.append(slotHtml);
    }

    // Attach event listeners
    attachSlotEvents();
}

// Render single slot
function renderSlot(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return '';

    const hasSave = API.Save.slots.has(slotId);
    const isAutoSave = slotId === 0;

    if (hasSave) {
        // Get save data
        const saveData = API.Save.slots.get(slotId);
        
        // Try to get title from metadata, then title, then passage title
        const saveTitle = saveData.metadata?.saveTitle || saveData.title || 'Unknown';
        const saveDate = new Date(saveData.date);
        const dateStr = formatDate(saveDate);

        return `
            <div class="save-slot" data-slot="${slotId}">
                <div class="save-preview">
                    ${isAutoSave ? '<div class="auto-save-badge">AUTO SAVE</div>' : ''}
                    ${!isAutoSave ? `<button class="save-delete-btn" data-slot="${slotId}" title="Delete save">
                        <span>DELETE</span>
                    </button>` : ''}
                    <div class="save-slot-number">Slot ${slotId}</div>
                </div>
                <div class="save-metadata">
                    <div class="save-title">${saveTitle}</div>
                    <div class="save-date">${dateStr}</div>
                </div>
                <div class="save-actions">
                    <button class="save-btn save-btn-load" data-slot="${slotId}">
                        <span class="icon icon-play icon-16"></span>
                        <span>Load</span>
                    </button>
                    <button class="save-btn save-btn-export" data-slot="${slotId}">
                        <span class="icon icon-save icon-16"></span>
                        <span>Export</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        // Empty slot
        return `
            <div class="save-slot save-slot-empty" data-slot="${slotId}">
                <div class="save-preview-empty">
                    <span class="icon icon-save icon-48"></span>
                    <div class="save-slot-number">Slot ${slotId}</div>
                    ${isAutoSave ? '<div class="empty-label">Auto Save Slot</div>' : '<div class="empty-label">Empty Slot</div>'}
                </div>
                <div class="save-actions">
                    <button class="save-btn save-btn-save" data-slot="${slotId}">
                        <span class="icon icon-save icon-16"></span>
                        <span>Save Here</span>
                    </button>
                </div>
            </div>
        `;
    }
}

// Attach event listeners to slot buttons
function attachSlotEvents() {
    // Load buttons
    $('.save-btn-load').on('click', function () {
        const slotId = parseInt($(this).data('slot'));
        loadFromSlot(slotId);
    });

    // Save buttons
    $('.save-btn-save').on('click', function () {
        const slotId = parseInt($(this).data('slot'));
        saveToSlot(slotId);
    });

    // Export buttons
    $('.save-btn-export').on('click', function () {
        const slotId = parseInt($(this).data('slot'));
        exportSlot(slotId);
    });

    // Delete buttons (X button in corner)
    $('.save-delete-btn').on('click', function () {
        const slotId = parseInt($(this).data('slot'));
        deleteSlot(slotId);
    });
}

// Save to slot
function saveToSlot(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Saving to slot:', slotId);

    // Show modal to ask for save title
    if (!window.ModalTabSystem) {
        alert('Modal system not available');
        return;
    }

    // Create input modal
    const inputHTML = `
        <div class="save-title-input-container">
            <label for="save-title-input">Enter a name for this save:</label>
            <input type="text" id="save-title-input" class="save-title-input" 
                   value="Save ${slotId}" maxlength="50" />
        </div>
    `;

    const modalHTML = `
        <div class="overlay overlay-dark modal-overlay active" id="save-title-overlay">
            <div class="modal" style="width: 400px; max-width: 90vw;">
                <div class="modal-header">
                    <span class="modal-title">Save Game</span>
                    <button class="close-btn" id="save-title-close">
                        <span class="icon icon-close icon-18"></span>
                    </button>
                </div>
                <div class="modal-content">
                    ${inputHTML}
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="save-title-cancel">Cancel</button>
                        <button class="btn btn-primary" id="save-title-confirm">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    API.$('body').append(modalHTML);

    // Focus input
    setTimeout(() => $('#save-title-input').focus().select(), 100);

    const performSave = function() {
        const saveTitle = $('#save-title-input').val().trim() || `Save ${slotId}`;
        
        try {
            // Pass title as metadata object
            API.Save.slots.save(slotId, null, { saveTitle: saveTitle });
            console.log('[SaveLoad] Saved to slot', slotId, 'with title:', saveTitle);

            // Close modal
            $('#save-title-overlay').remove();

            // Re-render slots to show new save
            renderSaveSlots();
        } catch (error) {
            console.error('[SaveLoad] Save failed:', error);
            alert('Save failed: ' + error.message);
        }
    };

    const closeModal = function() {
        $('#save-title-overlay').remove();
    };

    $('#save-title-confirm').on('click', performSave);
    $('#save-title-cancel').on('click', closeModal);
    $('#save-title-close').on('click', closeModal);
    
    // Enter key to save
    $('#save-title-input').on('keypress', function(e) {
        if (e.which === 13) performSave();
    });

    // Click outside to close
    $('#save-title-overlay').on('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Load from slot
function loadFromSlot(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Loading from slot:', slotId);

    try {
        API.Save.slots.load(slotId);
        console.log('[SaveLoad] Load successful');

        // Close modal
        closeCustomSaveLoad();

        // Close StartScreen if active (needed when loading from startscreen)
        if (window.handleStartScreen) {
            window.handleStartScreen(false);
            console.log('[SaveLoad] StartScreen closed');
        }

        // Force render passage to fix black screen
        if (API.Engine && API.Engine.show) {
            API.Engine.show();
            console.log('[SaveLoad] Engine.show() called');
        }
    } catch (error) {
        console.error('[SaveLoad] Load failed:', error);
        alert('Load failed: ' + error.message);
    }
}

// Delete slot
function deleteSlot(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return;

    // Show custom confirmation modal
    showDeleteConfirmation(slotId);
}

// Format date for display
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Show delete confirmation modal
function showDeleteConfirmation(slotId) {
    const API = window.SaveLoadAPI;
    if (!API || !window.ModalTabSystem) return;

    window.ModalTabSystem.confirm(
        'Delete Save',
        `Are you sure you want to delete save slot ${slotId}? This action cannot be undone.`,
        () => performDelete(slotId), // onConfirm
        null, // onCancel
        'danger' // type
    );
}

// Perform actual delete
function performDelete(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Deleting slot:', slotId);

    try {
        API.Save.slots.delete(slotId);
        console.log('[SaveLoad] Delete successful');

        // Re-render slots
        renderSaveSlots();
    } catch (error) {
        console.error('[SaveLoad] Delete failed:', error);
        alert('Delete failed: ' + error.message);
    }
}

// Export individual slot to disk
function exportSlot(slotId) {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Exporting slot:', slotId);

    try {
        // Debug: Show all localStorage keys to find the correct format
        console.log('[SaveLoad] All localStorage keys:', Object.keys(localStorage));
        
        const storyId = typeof Story !== 'undefined' ? Story.domId : 'pjx';
        
        // SugarCube stores saves in TWO keys: data and info
        const dataKey = `${storyId}.save.slot.data:${slotId}`;
        const infoKey = `${storyId}.save.slot.info:${slotId}`;
        
        const rawData = localStorage.getItem(dataKey);
        const rawInfo = localStorage.getItem(infoKey);
        
        if (!rawData) {
            console.error('[SaveLoad] Slot data not found:', dataKey);
            alert('Slot is empty');
            return;
        }
        
        console.log('[SaveLoad] Retrieved from localStorage');
        console.log('[SaveLoad] Data key:', dataKey);
        console.log('[SaveLoad] Info key:', infoKey);
        
        // Decompress data (UTF16)
        let stateData;
        try {
            const decompressed = LZString.decompressFromUTF16(rawData);
            if (decompressed) {
                stateData = JSON.parse(decompressed);
                console.log('[SaveLoad] Decompressed data using UTF16');
            } else {
                throw new Error('Data decompression failed');
            }
        } catch (e) {
            console.error('[SaveLoad] Data decompression failed:', e);
            throw new Error('Could not decompress save data');
        }
        
        // Decompress info (UTF16)
        let infoData = {};
        if (rawInfo) {
            try {
                const decompressedInfo = LZString.decompressFromUTF16(rawInfo);
                if (decompressedInfo) {
                    infoData = JSON.parse(decompressedInfo);
                    console.log('[SaveLoad] Decompressed info using UTF16');
                }
            } catch (e) {
                console.warn('[SaveLoad] Info decompression failed, using defaults:', e);
            }
        }
        
        // Combine into full save format and extract passage from delta
        const fullSaveData = {
            ...infoData,  // type, desc, date, metadata, id
            ...stateData  // state object with delta
        };
        
        // Extract passage from modern SugarCube delta format
        if (fullSaveData.state?.delta && fullSaveData.state.index !== undefined) {
            const currentDelta = fullSaveData.state.delta[fullSaveData.state.index];
            if (currentDelta?.title && Array.isArray(currentDelta.title)) {
                // title[1] contains the passage name in delta format
                fullSaveData.passage = currentDelta.title[1];
                console.log('[SaveLoad] Extracted passage from delta:', fullSaveData.passage);
            }
        }
        
        console.log('[SaveLoad] Combined save data keys:', Object.keys(fullSaveData));
        console.log('[SaveLoad] Full save data:', fullSaveData);

        // Get save title for filename
        const saveTitle = fullSaveData.metadata?.saveTitle || fullSaveData.title || `save_slot_${slotId}`;
        const sanitizedTitle = saveTitle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

        // Re-compress for export (already in correct format)
        const compressed = LZString.compressToBase64(JSON.stringify(fullSaveData));
        console.log('[SaveLoad] Save data serialized and compressed');

        // Create download
        const blob = new Blob([compressed], { type: 'text/plain;charset=UTF-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizedTitle}.save`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('[SaveLoad] Export successful');
    } catch (error) {
        console.error('[SaveLoad] Export failed:', error);
        alert('Failed to export save: ' + error.message);
    }
}

// Save to disk (download as file)
// Save to disk (download as file)
function saveToDisk() {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Saving to disk using Save.export(filename)');

    try {
        // Generate filename FIRST
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `game_save_${timestamp}.save`;

        // Call Save.export with the filename.
        // Standard SugarCube Save.export triggers the download internally.
        API.Save.export(filename);
        
        console.log('[SaveLoad] Save.export initiated for:', filename);
        
    } catch (error) {
        console.error('[SaveLoad] Disk save failed:', error);
        alert('Failed to save to disk: ' + error.message);
    }
}

// Load from disk (upload file)
function loadFromDisk() {
    const API = window.SaveLoadAPI;
    if (!API) return;

    console.log('[SaveLoad] Loading from disk');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.save';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        // Make this handler ASYNC to handle potential promises from deserialize
        reader.onload = async function(event) {
            try {
                console.log('[SaveLoad] File read, attempting restore...');
                const saveStr = event.target.result;
                let saveObj;

                // 1. DESERIALIZE/PARSE
                try {
                    // Type 4 is usually plain JSON
                    saveObj = JSON.parse(saveStr);
                } catch (jsonErr) {
                    try {
                        // Type 2/3 is LZString Base64
                        const decompressed = LZString.decompressFromBase64(saveStr);
                        if (decompressed) saveObj = JSON.parse(decompressed);
                    } catch (lzErr) {
                        console.error('Parse failed', jsonErr, lzErr);
                    }
                }

                if (!saveObj) throw new Error('Could not parse save file');
                console.log('[SaveLoad] Parsed object:', saveObj);

                // 2. EXPAND STATE via API.Save.deserialize
                // This is critical for expanding Type 4 'delta' compression.
                // We typically need to pass the parsed OBJECT to deserialize, but some versions rely on specific flags.
                
                let stateToRestore = null;
                
                if (typeof API.Save.deserialize === 'function') {
                    // ATTEMPT 1: Pass the Object
                    try {
                        console.log('[SaveLoad] Attempting API.Save.deserialize(object)...');
                        // Await in case it returns a promise (fix for "in promise" crash)
                        stateToRestore = await API.Save.deserialize(saveObj);
                    } catch (e1) {
                        console.warn('[SaveLoad] Deserialize(object) failed', e1);
                        
                        // ATTEMPT 2: Pass the Raw String (rare but possible in some versions)
                        try {
                            console.log('[SaveLoad] Attempting API.Save.deserialize(string)...');
                            stateToRestore = await API.Save.deserialize(saveStr);
                        } catch (e2) {
                            console.warn('[SaveLoad] Deserialize(string) failed', e2);
                        }
                    }
                }
                
                // Fallback Manual Extraction (if deserialize fails completely)
                if (!stateToRestore) {
                    console.warn('[SaveLoad] All deserialize attempts failed. Using Manual Fallback.');
                    if (saveObj.state && saveObj.id) {
                        // Type 4: Wrapper object containing 'state'
                        stateToRestore = saveObj.state;
                    } else if (saveObj.history || saveObj.delta) {
                        // Type 2/3: The object IS the state
                        stateToRestore = saveObj;
                    }
                }

                if (!stateToRestore) throw new Error('Invalid save structure');

                // 3. RESTORE
                API.State.restore(stateToRestore);
                console.log('[SaveLoad] State restored');

                // 4. NAVIGATION FIX
                let savedPassage = null;

                // Strategy A: Check 'passage' property in extracted state
                if (stateToRestore.passage) savedPassage = stateToRestore.passage;

                // Strategy B: Check history (standard expanded state)
                if (!savedPassage && stateToRestore.history) {
                     const idx = stateToRestore.index !== undefined ? stateToRestore.index : (stateToRestore.history.length - 1);
                     const h = stateToRestore.history[idx];
                     if (h && h.passage) savedPassage = h.passage;
                }
                
                // Strategy C: Check delta (if still compressed/manual)
                if (!savedPassage && stateToRestore.delta) {
                     const idx = stateToRestore.index || (stateToRestore.delta.length - 1);
                     const d = stateToRestore.delta[idx];
                     if (d && d.title) savedPassage = Array.isArray(d.title) ? d.title[1] : d.title;
                }

                // Fallback to current API state if restored
                if (!savedPassage && API.State.passage !== 'Start') {
                    savedPassage = API.State.passage;
                }

                console.log('[SaveLoad] Navigation Target:', savedPassage);

                // UI Cleanup
                closeCustomSaveLoad();
                if (window.handleStartScreen) window.handleStartScreen(false);
                window._skipStartScreenCheck = true;

                // Execute Navigation
                if (savedPassage && savedPassage !== 'Start') {
                    API.Engine.play(savedPassage);
                    console.log('[SaveLoad] Navigated to:', savedPassage);
                } else {
                    console.warn('[SaveLoad] Target is Start or Null, forcing show()');
                    API.Engine.show();
                }

            } catch (error) {
                console.error('[SaveLoad] Load failed:', error);
                alert('Failed to load save: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}
