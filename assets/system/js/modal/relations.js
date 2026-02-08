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
            const characters = vars.characters || {};

            const getChar = (id) => (setup && setup.getCharacter) ? setup.getCharacter(id) : characters[id];
            const isKnown = (id) => { const c = getChar(id); return c && c.known === true; };

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
                        html += `
                            <div class="relations-card" onclick="window.RelationsSystem.showDetail('${charId}')">
                                <div class="relations-avatar">
                                    <img src="${char.avatar || 'assets/images/default-avatar.jpg'}" alt="${(char.firstName || '') + ' ' + (char.lastName || '')}">
                                </div>
                                <div class="relations-card-name">${(char.firstName || '') + ' ' + (char.lastName || '')}</div>
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
                                    <span class="relations-stat-value"><span id="relations-love-value">0</span> / 100</span>
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
                                    <span class="relations-stat-value"><span id="relations-friendship-value">0</span> / 100</span>
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
                                    <span class="relations-stat-value"><span id="relations-lust-value">0</span> / 100</span>
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
                                    <span class="relations-stat-value"><span id="relations-trust-value">0</span> / 100</span>
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
                        <div class="relations-info-header">Additional Information</div>
                        <div class="relations-info-content" id="relations-info-content">
                            <p>No additional information available.</p>
                        </div>
                    </div>
                </div>
            `;
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
            const char = (setup && setup.getCharacter) ? setup.getCharacter(characterId) : (vars.characters || {})[characterId];

            if (!char) return;

            this.currentCharacter = characterId;

            // Calculate age dynamically from timeSysYear
            const currentYear = vars.timeSysYear || 2024;
            const age = char.birthYear ? (currentYear - char.birthYear) : '???';
            const ageText = age + ' years old';

            // Update detail view
            this.API.$('#relations-detail-avatar').attr('src', char.avatar || 'assets/images/default-avatar.jpg');
            this.API.$('#relations-detail-name').text(char.firstName + ' ' + char.lastName || 'Unknown');
            this.API.$('#relations-detail-age').text(ageText);
            this.API.$('#relations-detail-occupation').text(char.occupation || '???');
            this.API.$('#relations-detail-location').text(char.location || 'Unknown');
            this.API.$('#relations-detail-status').text(char.status || 'Unknown');
            this.API.$('#relations-detail-firstmet').text(char.firstMet || 'Unknown');

            // Update info section
            const infoContent = char.info || '<p>No additional information available.</p>';
            this.API.$('#relations-info-content').html(infoContent);

            // Update stats
            const stats = char.stats || { love: 0, friendship: 0, lust: 0, trust: 0 };

            this.API.$('#relations-love-value').text(stats.love || 0);
            this.API.$('#relations-love-fill').css('width', (stats.love || 0) + '%');

            this.API.$('#relations-friendship-value').text(stats.friendship || 0);
            this.API.$('#relations-friendship-fill').css('width', (stats.friendship || 0) + '%');

            this.API.$('#relations-lust-value').text(stats.lust || 0);
            this.API.$('#relations-lust-fill').css('width', (stats.lust || 0) + '%');

            this.API.$('#relations-trust-value').text(stats.trust || 0);
            this.API.$('#relations-trust-fill').css('width', (stats.trust || 0) + '%');

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