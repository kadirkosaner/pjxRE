// relations.js
window.RelationsInit = function (API) {
    window.RelationsSystem = {
        API: API,
        currentView: 'list',
        currentCharacter: null,

        // Open relations modal
        open: function () {
            const vars = this.API.State.variables;

            // Build content
            const listContent = this.buildListView(vars);
            const detailContent = this.buildDetailView();

            // Tutorial Banner HTML
            const tutorialBanner = vars.showRelationTutorial === true ? `
                <div class="map-tutorial-banner" id="relations-tutorial-banner">
                    <div class="tutorial-content">
                        <div class="tutorial-text">
                            <div class="tutorial-title">Relations & Contacts</div>
                            <div class="tutorial-desc">
                                As you meet new people, they will appear here. You can track your friendship, love, and other relationships from this screen.
                            </div>
                        </div>
                        <button class="tutorial-close-btn" id="relations-tutorial-close">Got it</button>
                    </div>
                </div>
            ` : '';

            this.API.Modal.create({
                id: 'relations-modal',
                title: 'Relations',
                width: '1100px',
                tabs: [{
                    id: 'main',
                    label: '',
                    content: `
                        <div class="tab-content-inner" style="padding: 0;">
                            ${tutorialBanner}
                            <div id="relations-list-view" class="relations-view">${listContent}</div>
                            <div id="relations-detail-view" class="relations-view" style="display: none;">${detailContent}</div>
                        </div>
                    `
                }]
            });

            this.attachEvents();
        },

        // Build list view HTML
        // Locations (oldTown, downtown...) auto from setup.locations (parent === null). Click location → expands to show places. Click place → expands to show members.
        buildListView: function (vars) {
            const setup = this.API.setup || (typeof window !== 'undefined' && window.setup);
            const locations = setup.locations || {};
            const navCards = setup.navCards || {};
            const relationPlaces = (setup && setup.relationPlaces) || [];
            const relationDynamicGroups = (setup && setup.relationDynamicGroups) || {};
            const fotogramCfg = relationDynamicGroups.fotogram || {};
            const characters = vars.characters || {};
            const setupDefs = (setup && setup.characterDefs) ? setup.characterDefs : {};

            const getChar = (id) => {
                if (!id) return null;
                const def = setupDefs[id] || null;
                const gen = (vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[id]) ? vars.phoneGeneratedContacts[id] : null;
                const stateChar = characters[id] || null;
                if (!def && !gen && !stateChar) return null;
                return Object.assign({}, def || {}, gen || {}, stateChar || {});
            };
            const isKnown = (id) => { const c = getChar(id); return c && c.known === true; };
            const getDisplayName = (char, fallbackId) => {
                if (!char) return fallbackId || 'Unknown';
                const full = [char.firstName, char.lastName].filter(Boolean).join(' ').trim();
                return full || char.name || fallbackId || 'Unknown';
            };

            // Districts = locations with parent === null (auto from setup.locations)
            const districtIds = Object.keys(locations)
                .filter(id => locations[id].parent === null)
                .sort((a, b) => {
                    const nameA = (navCards[a] && navCards[a].name) || a;
                    const nameB = (navCards[b] && navCards[b].name) || b;
                    return nameA.localeCompare(nameB);
                });
            const getLocationName = (id) => (navCards[id] && navCards[id].name) ? navCards[id].name : id;

            let html = '<div class="relations-list-container">';

            districtIds.forEach(locationId => {
                const placesForLocation = relationPlaces.filter(p => p.locationId === locationId);
                const placesWithKnown = placesForLocation.map(place => {
                    const knownMembers = (place.members || []).filter(isKnown);
                    return { place, knownMembers };
                }).filter(p => p.knownMembers.length > 0);

                if (placesWithKnown.length === 0) return;

                const locationName = getLocationName(locationId);
                html += `
                    <div class="relations-group" id="relations-group-${locationId}">
                        <div class="relations-group-header" onclick="window.RelationsSystem.toggleGroup('${locationId}')">
                            <span class="relations-group-name">${locationName}</span>
                            <span class="relations-collapse-icon">▼</span>
                        </div>
                        <div class="relations-group-places">
                `;

                placesWithKnown.forEach(({ place, knownMembers }) => {
                    const placeKey = `${locationId}-${place.placeId}`;
                    html += `
                        <div class="relations-place" id="relations-place-${placeKey}">
                            <div class="relations-place-header" onclick="window.RelationsSystem.togglePlace('${placeKey}')">
                                <span class="relations-place-name">${place.name}</span>
                                <span class="relations-place-count">${knownMembers.length} ${knownMembers.length === 1 ? 'member' : 'members'}</span>
                                <span class="relations-collapse-icon relations-place-icon">▼</span>
                            </div>
                            <div class="relations-place-grid-wrap">
                                <div class="relations-grid">
                    `;
                    knownMembers.forEach(charId => {
                        const char = getChar(charId);
                        if (!char) return;
                        const displayName = getDisplayName(char, charId);
                        html += `
                            <div class="relations-card" onclick="window.RelationsSystem.showDetail('${charId}')">
                                <div class="relations-avatar">
                                    <img src="${char.avatar || 'assets/images/default-avatar.jpg'}" alt="${displayName}">
                                </div>
                                <div class="relations-card-name">${displayName}</div>
                            </div>
                        `;
                    });
                    html += `
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            const unlocked = vars.phoneContactsUnlocked || [];
            const fgPool = Array.isArray(vars.phoneFotogramRandomSwapIds) ? vars.phoneFotogramRandomSwapIds : [];
            const fgMax = (typeof window.PHONE_FOTOGRAM_RANDOM_SWAP_MAX !== 'undefined' && Number.isFinite(window.PHONE_FOTOGRAM_RANDOM_SWAP_MAX)) ? window.PHONE_FOTOGRAM_RANDOM_SWAP_MAX : 10;
            const fotogramMembers = fgPool.filter(id => {
                const def = vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[id];
                const c = getChar(id);
                return !!(def && def.generatedFromPhone && unlocked.indexOf(id) !== -1 && c && c.firstMet);
            }).slice(0, fgMax);
            if (fotogramMembers.length > 0) {
                html += `
                    <div class="relations-group" id="relations-group-fotogram">
                        <div class="relations-group-header" onclick="window.RelationsSystem.toggleGroup('fotogram')">
                            <span class="relations-group-name">${fotogramCfg.groupName || 'Fotogram'}</span>
                            <span class="relations-collapse-icon">▼</span>
                        </div>
                        <div class="relations-group-places">
                            <div class="relations-place expanded" id="relations-place-fotogram-online">
                                <div class="relations-place-grid-wrap">
                                    <div class="relations-grid">
                `;
                fotogramMembers.forEach(charId => {
                    const char = getChar(charId);
                    if (!char) return;
                    const displayName = getDisplayName(char, charId);
                    html += `
                            <div class="relations-card" onclick="window.RelationsSystem.showDetail('${charId}')">
                                <div class="relations-avatar">
                                    <img src="${char.avatar || 'assets/images/default-avatar.jpg'}" alt="${displayName}">
                                </div>
                                <div class="relations-card-name">${displayName}</div>
                            </div>
                    `;
                });
                html += `
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += '</div>';

            return html;
        },

        // Build detail view HTML
        buildDetailView: function () {
            return `
                <div class="relations-detail-container">
                    <div class="relations-detail-header">
                        <button class="back-btn" onclick="window.RelationsSystem.showList()">
                            <span class="icon icon-chevron-left icon-16"></span>
                        </button>
                        <div class="relations-detail-title">Character Details</div>
                    </div>
                    
                    <div class="relations-profile">
                        <div class="relations-profile-avatar">
                            <img id="relations-detail-avatar" src="" alt="">
                        </div>
                        <div class="relations-profile-info">
                            <div class="relations-profile-name" id="relations-detail-name"></div>
                            <div class="relations-profile-meta">
                                <span id="relations-detail-age"></span>
                                <span>•</span>
                                <span id="relations-detail-gender"></span>
                                <span>•</span>
                                <span id="relations-detail-occupation"></span>
                            </div>
                            <div class="relations-profile-location">
                                <span id="relations-detail-location"></span>
                            </div>
                            <div class="relations-profile-status-row">
                                <div class="relations-profile-status">
                                    <span class="relations-profile-status-label">Status:</span>
                                    <span class="relations-profile-status-value" id="relations-detail-status"></span>
                                </div>
                                <div class="relations-profile-firstmet">
                                    <span class="relations-profile-firstmet-label">First Met:</span>
                                    <span class="relations-profile-firstmet-value" id="relations-detail-firstmet"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="relations-stats-section">
                        <div class="relations-stats-header">Relationship Stats</div>
                        <div class="relations-stats">
                            <div class="relations-stat-item">
                                <div class="relations-stat-header">
                                    <span class="relations-stat-label">
                                        <span class="icon icon-heart icon-14"></span>
                                        Love
                                    </span>
                                    <span class="relations-stat-value">
                                        <span id="relations-love-level" class="relations-stat-level">—</span>
                                        · <span id="relations-love-value">0</span> / <span id="relations-love-max">100</span>
                                    </span>
                                </div>
                                <div class="relations-stat-bar">
                                    <div class="relations-stat-fill" id="relations-love-fill" style="width: 0%; background: #ec4899;"></div>
                                </div>
                            </div>

                            <div class="relations-stat-item">
                                <div class="relations-stat-header">
                                    <span class="relations-stat-label">
                                        <span class="icon icon-handshake icon-14"></span>
                                        Friendship
                                    </span>
                                    <span class="relations-stat-value">
                                        <span id="relations-friendship-level" class="relations-stat-level">—</span>
                                        · <span id="relations-friendship-value">0</span> / <span id="relations-friendship-max">100</span>
                                    </span>
                                </div>
                                <div class="relations-stat-bar">
                                    <div class="relations-stat-fill" id="relations-friendship-fill" style="width: 0%; background: #3b82f6;"></div>
                                </div>
                            </div>

                            <div class="relations-stat-item">
                                <div class="relations-stat-header">
                                    <span class="relations-stat-label">
                                        <span class="icon icon-arousal icon-14"></span>
                                        Lust
                                    </span>
                                    <span class="relations-stat-value">
                                        <span id="relations-lust-level" class="relations-stat-level">—</span>
                                        · <span id="relations-lust-value">0</span> / <span id="relations-lust-max">100</span>
                                    </span>
                                </div>
                                <div class="relations-stat-bar">
                                    <div class="relations-stat-fill" id="relations-lust-fill" style="width: 0%; background: #ef4444;"></div>
                                </div>
                            </div>

                            <div class="relations-stat-item">
                                <div class="relations-stat-header">
                                    <span class="relations-stat-label">
                                        <span class="icon icon-shield icon-14"></span>
                                        Trust
                                    </span>
                                    <span class="relations-stat-value">
                                        <span id="relations-trust-level" class="relations-stat-level">—</span>
                                        · <span id="relations-trust-value">0</span> / <span id="relations-trust-max">100</span>
                                    </span>
                                </div>
                                <div class="relations-stat-bar">
                                    <div class="relations-stat-fill" id="relations-trust-fill" style="width: 0%; background: #10b981;"></div>
                                </div>
                            </div>
                            
                            <div class="relations-stat-item">
                                <div class="relations-stat-header">
                                    <span class="relations-stat-label">
                                        <span class="icon icon-eye icon-14"></span>
                                        Awareness
                                    </span>
                                    <span class="relations-stat-value">
                                        <span id="relations-perception-tier" style="font-weight: 600;">Innocent</span>
                                    </span>
                                </div>
                                <div class="relations-stat-bar">
                                    <div class="relations-stat-fill" id="relations-awareness-fill" style="width: 0%; background: #4ade80;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="relations-info-section">
                        <div class="relations-info-header">Schedule</div>
                        <div class="relations-info-content" id="relations-info-content">
                            <p class="relations-schedule-empty">No schedule data available.</p>
                        </div>
                    </div>
                </div>
            `;
        },

        escapeHtml: function (text) {
            if (text == null) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },

        getScheduleLocationLabel: function (locationId, setup) {
            if (locationId == null || locationId === '') return null;
            if (typeof window.getLocationName === 'function') {
                return window.getLocationName(locationId);
            }
            const nav = (setup && setup.navCards) ? setup.navCards[locationId] : null;
            return (nav && nav.name) ? nav.name : String(locationId);
        },

        formatScheduleTime: function (hour, minute) {
            const h = Number(hour);
            const m = Number(minute) || 0;
            if (h === 24 && m === 0) return '24:00';
            const hh = String(Math.min(23, Math.max(0, h || 0))).padStart(2, '0');
            const mm = String(Math.min(59, Math.max(0, m))).padStart(2, '0');
            return hh + ':' + mm;
        },

        slotStartTotalMinutes: function (slot) {
            if (!slot) return 0;
            return (Number(slot.hour) || 0) * 60 + (Number(slot.minute) || 0);
        },

        getNextSlotForRange: function (slots, index) {
            if (!slots || !slots.length) return null;
            if (index < slots.length - 1) return slots[index + 1];
            return slots[0];
        },

        formatRangeEndLabel: function (nextSlot, startSlot, index, length) {
            if (!nextSlot) return '24:00';
            const nh = Number(nextSlot.hour) || 0;
            const nm = Number(nextSlot.minute) || 0;
            const startMin = this.slotStartTotalMinutes(startSlot);
            const nextMin = this.slotStartTotalMinutes(nextSlot);
            const isLast = index === length - 1;
            if (isLast && nextMin <= startMin) {
                if (nh === 0 && nm === 0) return '24:00';
            }
            return this.formatScheduleTime(nh, nm);
        },

        humanizeScheduleStatus: function (status) {
            if (!status) return '—';
            const map = {
                break: 'On break',
                busy: 'Busy',
                sleeping: 'Sleeping',
                showering: 'Showering',
                available: 'Around',
                trainer: 'Training floor',
                reception: 'Front desk'
            };
            const s = String(status).toLowerCase();
            if (map[s]) return map[s];
            return String(status).charAt(0).toUpperCase() + String(status).slice(1);
        },

        isUnavailableScheduleSlot: function (slot) {
            if (!slot) return true;
            if (slot.location) return false;
            return String(slot.status || '').toLowerCase() === 'unavailable';
        },

        describeScheduleSlot: function (slot, setup) {
            const loc = slot && slot.location;
            if (loc) {
                return this.getScheduleLocationLabel(loc, setup);
            }
            return this.humanizeScheduleStatus(slot && slot.status);
        },

        getActiveSchedulePhaseKey: function (characterId, vars, setup) {
            const ts = vars && vars.timeSys;
            if (characterId === 'father') {
                if (ts) {
                    const currentDate = ts.year * 10000 + ts.month * 100 + ts.day;
                    const imp = vars.importantDates && vars.importantDates.fatherWorkStart;
                    if (imp && imp.year != null && imp.month != null && imp.day != null) {
                        const workDate = imp.year * 10000 + imp.month * 100 + imp.day;
                        return currentDate >= workDate ? 'postWork' : 'preWork';
                    }
                }
                return 'preWork';
            }
            if (characterId === 'brother') {
                const cal = setup && setup.schoolCalendar && setup.schoolCalendar.vacations;
                if (ts && cal && cal.length) {
                    const monthDay = ts.month * 100 + ts.day;
                    let isVacation = false;
                    for (let v = 0; v < cal.length; v++) {
                        const vac = cal[v];
                        const startMD = vac.startMonth * 100 + vac.startDay;
                        const endMD = vac.endMonth * 100 + vac.endDay;
                        if (startMD <= endMD) {
                            if (monthDay >= startMD && monthDay <= endMD) isVacation = true;
                        } else {
                            if (monthDay >= startMD || monthDay <= endMD) isVacation = true;
                        }
                    }
                    return isVacation ? 'vacation' : 'school';
                }
                return 'school';
            }
            return null;
        },

        isFlatCharacterSchedule: function (sched) {
            return sched && Array.isArray(sched.weekday);
        },

        buildScheduleColumnTable: function (slots, setup) {
            if (!slots || !slots.length) {
                return '<p class="relations-schedule-empty">—</p>';
            }
            const n = slots.length;
            const segments = [];
            for (let i = 0; i < n; i++) {
                const slot = slots[i];
                if (this.isUnavailableScheduleSlot(slot)) continue;
                const next = this.getNextSlotForRange(slots, i);
                const startStr = this.formatScheduleTime(slot.hour, slot.minute);
                const endStr = this.formatRangeEndLabel(next, slot, i, n);
                const place = this.describeScheduleSlot(slot, setup);
                const last = segments.length ? segments[segments.length - 1] : null;
                if (last && last.place === place && last.endStr === startStr) {
                    last.endStr = endStr;
                } else {
                    segments.push({ startStr: startStr, endStr: endStr, place: place });
                }
            }
            if (!segments.length) {
                return '<p class="relations-schedule-empty">—</p>';
            }
            let rows = '';
            for (let j = 0; j < segments.length; j++) {
                const seg = segments[j];
                const rangeStr = seg.startStr + ' - ' + seg.endStr;
                rows += '<tr><td class="relations-schedule-time">' + this.escapeHtml(rangeStr) + '</td><td class="relations-schedule-place">' + this.escapeHtml(seg.place) + '</td></tr>';
            }
            return '<table class="relations-schedule-table"><tbody>' + rows + '</tbody></table>';
        },

        buildSchedulePhaseHtml: function (phaseData, setup) {
            const weekday = phaseData.weekday || [];
            const weekend = phaseData.weekend || [];
            return '<div class="relations-schedule-columns">' +
                '<div class="relations-schedule-col">' +
                '<div class="relations-schedule-col-title">Weekdays</div>' +
                this.buildScheduleColumnTable(weekday, setup) +
                '</div>' +
                '<div class="relations-schedule-col">' +
                '<div class="relations-schedule-col-title">Weekend</div>' +
                this.buildScheduleColumnTable(weekend, setup) +
                '</div>' +
                '</div>';
        },

        buildCharacterScheduleHtml: function (characterId, char, setup, vars) {
            if (char && char.generatedFromPhone) {
                return '<p class="relations-schedule-empty">No routine schedule for online contacts.</p>';
            }
            const schedules = (setup && setup.schedules) ? setup.schedules : {};
            const sched = schedules[characterId];
            if (!sched) {
                return '<p class="relations-schedule-empty">No schedule data available.</p>';
            }
            if (this.isFlatCharacterSchedule(sched)) {
                let html = '<div class="relations-schedule-body">';
                html += this.buildSchedulePhaseHtml(sched, setup);
                const sun = sched.sunday;
                if (Array.isArray(sun) && sun.length > 0) {
                    const weekend = sched.weekend || [];
                    if (JSON.stringify(weekend) !== JSON.stringify(sun)) {
                        html += '<div class="relations-schedule-phase relations-schedule-sunday-block">';
                        html += '<div class="relations-schedule-phase-title">' + this.escapeHtml('Sunday') + '</div>';
                        html += '<div class="relations-schedule-sunday-table-wrap">' + this.buildScheduleColumnTable(sun, setup) + '</div>';
                        html += '</div>';
                    }
                }
                html += '</div>';
                return html;
            }
            const activePhase = this.getActiveSchedulePhaseKey(characterId, vars, setup);
            if (activePhase && sched[activePhase] && typeof sched[activePhase] === 'object' && Array.isArray(sched[activePhase].weekday)) {
                return '<div class="relations-schedule-body">' +
                    '<div class="relations-schedule-phase">' +
                    this.buildSchedulePhaseHtml(sched[activePhase], setup) +
                    '</div></div>';
            }
            const phaseKeys = Object.keys(sched).filter(function (k) {
                const v = sched[k];
                return v && typeof v === 'object' && Array.isArray(v.weekday);
            });
            if (phaseKeys.length === 0) {
                return '<p class="relations-schedule-empty">No schedule data available.</p>';
            }
            let html = '<div class="relations-schedule-body">';
            for (let p = 0; p < phaseKeys.length; p++) {
                html += '<div class="relations-schedule-phase">' + this.buildSchedulePhaseHtml(sched[phaseKeys[p]], setup) + '</div>';
            }
            html += '</div>';
            return html;
        },

        // Attach events
        attachEvents: function () {
            const vars = this.API.State.variables;

            // Tutorial close button
            this.API.$('#relations-tutorial-close').on('click', () => {
                this.API.$('#relations-tutorial-banner').fadeOut(300);
                // Also remove dotted notification from topbar immediately
                $('.relations-notification-dot').fadeOut(300);
                vars.showRelationTutorial = false;
            });
            
            // Other events are handled via onclick attributes in HTML
        },

        // Toggle location (district)
        toggleGroup: function (locationId) {
            this.API.$('#relations-group-' + locationId).toggleClass('expanded');
        },

        // Toggle place (e.g. Ruby's Diner) inside a location
        togglePlace: function (placeKey) {
            this.API.$('#relations-place-' + placeKey).toggleClass('expanded');
        },

        // Show detail view
        showDetail: function (characterId) {
            const vars = this.API.State.variables;
            const setup = this.API.setup || (typeof window !== 'undefined' && window.setup);
            const setupDefs = (setup && setup.characterDefs) ? setup.characterDefs : {};
            const baseChar = setupDefs[characterId] || null;
            const generatedChar = (vars.phoneGeneratedContacts && vars.phoneGeneratedContacts[characterId]) ? vars.phoneGeneratedContacts[characterId] : null;
            const stateChar = (vars.characters || {})[characterId] || null;
            const char = (baseChar || generatedChar || stateChar) ? Object.assign({}, baseChar || {}, generatedChar || {}, stateChar || {}) : null;

            if (!char) return;

            this.currentCharacter = characterId;

            // Calculate age dynamically from timeSysYear
            const currentYear = (vars.timeSys && Number(vars.timeSys.year)) || vars.timeSysYear || 2024;
            const ageText = (char.birthYear && Number.isFinite(Number(char.birthYear)))
                ? ((currentYear - Number(char.birthYear)) + ' years old')
                : 'Unknown age';
            const rawGender = String(char.gender || '').toLowerCase();
            const genderText = rawGender === 'male'
                ? 'Male'
                : (rawGender === 'female' ? 'Female' : 'Unknown');
            const fullName = [char.firstName, char.lastName].filter(Boolean).join(' ') || char.name || characterId || 'Unknown';
            const occupationText = char.occupation || (char.generatedFromPhone ? 'Online Contact' : 'Unknown');
            const locationText = char.location || (char.generatedFromPhone ? 'Fotogram' : 'Unknown');
            const statusText = char.status || (char.generatedFromPhone ? 'Swapped on Fotogram' : 'Unknown');
            const firstMetText = char.firstMet || 'Unknown';

            // Update detail view
            this.API.$('#relations-detail-avatar').attr('src', char.avatar || 'assets/images/default-avatar.jpg');
            this.API.$('#relations-detail-name').text(fullName);
            this.API.$('#relations-detail-age').text(ageText);
            this.API.$('#relations-detail-gender').text(genderText);
            this.API.$('#relations-detail-occupation').text(occupationText);
            this.API.$('#relations-detail-location').text(locationText);
            this.API.$('#relations-detail-status').text(statusText);
            this.API.$('#relations-detail-firstmet').text(firstMetText);

            // Schedule (setup.schedules) — weekdays vs weekend columns
            const scheduleHtml = this.buildCharacterScheduleHtml(characterId, char, setup, vars);
            this.API.$('#relations-info-content').html(scheduleHtml);

            // Update stats — always 0/100. versionCaps enforce gameplay limits elsewhere.
            const stats = char.stats || { love: 0, loveLevel: 1, friendship: 0, friendshipLevel: 1, lust: 0, lustLevel: 1, trust: 0, trustLevel: 1 };

            const loveLevel   = stats.loveLevel       || 1;
            const friendLevel = stats.friendshipLevel || 1;
            const lustLevel   = stats.lustLevel       || 1;
            const trustLevel  = stats.trustLevel      || 1;

            this.API.$('#relations-love-level').text('Level ' + loveLevel);
            this.API.$('#relations-love-value').text(stats.love || 0);
            this.API.$('#relations-love-max').text(100);
            this.API.$('#relations-love-fill').css('width', Math.min(100, stats.love || 0) + '%');

            this.API.$('#relations-friendship-level').text('Level ' + friendLevel);
            this.API.$('#relations-friendship-value').text(stats.friendship || 0);
            this.API.$('#relations-friendship-max').text(100);
            this.API.$('#relations-friendship-fill').css('width', Math.min(100, stats.friendship || 0) + '%');

            this.API.$('#relations-lust-level').text('Level ' + lustLevel);
            this.API.$('#relations-lust-value').text(stats.lust || 0);
            this.API.$('#relations-lust-max').text(100);
            this.API.$('#relations-lust-fill').css('width', Math.min(100, stats.lust || 0) + '%');

            this.API.$('#relations-trust-level').text('Level ' + trustLevel);
            this.API.$('#relations-trust-value').text(stats.trust || 0);
            this.API.$('#relations-trust-max').text(100);
            this.API.$('#relations-trust-fill').css('width', Math.min(100, stats.trust || 0) + '%');

            // Update perception/awareness
            const opinion = char.opinion || { awareness: 0, flags: [] };
            const awareness = opinion.awareness || 0;
            
            // Get tier info
            const opinionTiers = this.API.setup.opinionTiers || [
                { min: 0, max: 10, id: "innocent", name: "Innocent", color: "#4ade80", desc: "Thinks you're a good girl" },
                { min: 11, max: 25, id: "curious", name: "Curious", color: "#60a5fa", desc: "Notices something different" },
                { min: 26, max: 45, id: "suspicious", name: "Suspicious", color: "#fbbf24", desc: "Has some doubts about you" },
                { min: 46, max: 65, id: "aware", name: "Aware", color: "#f59e0b", desc: "Knows you're hiding something" },
                { min: 66, max: 85, id: "knowing", name: "Knowing", color: "#f87171", desc: "Aware of your activities" },
                { min: 86, max: 100, id: "complicit", name: "Complicit", color: "#ef4444", desc: "Fully knows and accepts" }
            ];
            
            let tier = opinionTiers[0];
            for (const t of opinionTiers) {
                if (awareness >= t.min && awareness <= t.max) {
                    tier = t;
                    break;
                }
            }
            
            this.API.$('#relations-awareness-fill').css('width', awareness + '%').css('background', tier.color);
            this.API.$('#relations-perception-tier').text(tier.name).css('color', tier.color);
            this.API.$('#relations-perception-desc').text(tier.desc);

            // Switch views
            this.API.$('#relations-list-view').hide();
            this.API.$('#relations-detail-view').show();
            this.currentView = 'detail';
        },

        // Show list view
        showList: function () {
            this.API.$('#relations-list-view').show();
            this.API.$('#relations-detail-view').hide();
            this.currentView = 'list';
            this.currentCharacter = null;
        }
    };
};