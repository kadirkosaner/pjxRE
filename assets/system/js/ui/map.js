// map.js - Interactive Map System (Overlay Mode)
// Hierarchical navigation: Region → Sub-region → Location
// Pulls name/image/passage from: setup.navCards, setup.locationImages, setup.locations
let MapAPI = null;

window.MapInit = function (API) {
    MapAPI = API;

    window.MapSystem = {
        API: API,
        currentView: 'main',
        currentArea: null,        // Current area being viewed (region or sub-region)
        navigationStack: [],      // Stack for back navigation

        // Helper: Get parent of a location from setup.locations
        getParent: function(locationId) {
            const locations = this.API.setup?.locations || {};
            const loc = locations[locationId];
            return loc?.parent || null;
        },

        // Helper: Get type of a location from setup.locations
        getLocationType: function(locationId) {
            const locations = this.API.setup?.locations || {};
            const loc = locations[locationId];
            return loc?.type || 'room';
        },

        // Helper: Get root region (district) for any location
        getRegionForLocation: function(locationId) {
            const locations = this.API.setup?.locations || {};
            let current = locationId;
            let data = locations[current];
            
            while (data && data.parent) {
                current = data.parent;
                data = locations[current];
            }
            
            return current;
        },

        // Helper: Get direct children of a location from setup.locations
        getChildren: function(parentId) {
            const locations = this.API.setup?.locations || {};
            const children = [];
            
            for (const [id, data] of Object.entries(locations)) {
                if (data.parent === parentId) {
                    children.push(id);
                }
            }
            
            return children;
        },

        // Helper: Check if location is discovered
        isDiscovered: function(locationId) {
            const vars = this.API.State.variables;
            const discoveryVar = 'discovered' + locationId.charAt(0).toUpperCase() + locationId.slice(1);
            return vars[discoveryVar] === true || vars[discoveryVar] === 1;
        },

        // Helper: Check if location has map data (x, y coordinates)
        hasMapData: function(locationId) {
            const mapLocations = this.API.setup?.mapLocations || {};
            return !!mapLocations[locationId];
        },

        // Helper: Get merged region data
        getMergedRegion: function(regionId) {
            const mapRegions = this.API.setup?.mapRegions || [];
            const navCards = this.API.setup?.navCards || {};
            
            const mapData = mapRegions.find(r => r.id === regionId) || {};
            const navData = navCards[regionId] || {};
            
            return {
                id: regionId,
                name: navData.name || regionId,
                image: mapData.mapImage || '',
                passage: navData.passage || regionId,
                desc: mapData.desc || '',
                color: mapData.color || '#3b82f6',
                x: mapData.x || 50,
                y: mapData.y || 50
            };
        },

        // Helper: Get merged location/area data
        getMergedLocation: function(locationId) {
            const mapLocations = this.API.setup?.mapLocations || {};
            const navCards = this.API.setup?.navCards || {};
            const locationImages = this.API.setup?.locationImages || {};
            const locations = this.API.setup?.locations || {};
            
            const mapData = mapLocations[locationId] || {};
            const navData = navCards[locationId] || {};
            const locData = locations[locationId] || {};
            
            return {
                id: locationId,
                name: navData.name || locationId,
                image: locationImages[locationId] || '',
                passage: navData.passage || locationId,
                structureType: mapData.structureType || 'location',
                category: mapData.category || 'public',
                parent: locData.parent || null,
                region: this.getRegionForLocation(locationId),
                x: mapData.x || 50,
                y: mapData.y || 50,
                taxiCost: mapData.taxiCost || 10,
                residents: mapData.residents || []
            };
        },

        // Helper: Check if location is currently open
        isLocationOpen: function(locationId) {
            const vars = this.API.State.variables;
            const currentHour = vars.time?.hour || 12;
            
            const mapLocations = this.API.setup?.mapLocations || {};
            const locationHours = this.API.setup?.locationHours || {};
            const defaultHours = this.API.setup?.defaultHours || {};
            
            const locData = mapLocations[locationId] || {};
            const hoursOverride = locationHours[locationId] || {};
            const category = locData.category || 'public';
            const categoryDefaults = defaultHours[category] || { open: 8, close: 17 };
            
            // Check open24h flag first
            if (hoursOverride.open24h || locData.open24h) {
                return true;
            }
            
            // Get hours (override > mapLocations > default)
            const openHour = hoursOverride.openHour ?? locData.openHour ?? categoryDefaults.open;
            const closeHour = hoursOverride.closeHour ?? locData.closeHour ?? categoryDefaults.close;
            
            // Handle overnight hours (e.g., 22:00 - 05:00)
            if (closeHour < openHour) {
                // Open if current hour is >= open OR < close
                return currentHour >= openHour || currentHour < closeHour;
            } else {
                // Normal hours
                return currentHour >= openHour && currentHour < closeHour;
            }
        },

        // Helper: Get location hours info
        getLocationHours: function(locationId) {
            const mapLocations = this.API.setup?.mapLocations || {};
            const locationHours = this.API.setup?.locationHours || {};
            const defaultHours = this.API.setup?.defaultHours || {};
            
            const locData = mapLocations[locationId] || {};
            const hoursOverride = locationHours[locationId] || {};
            const category = locData.category || 'public';
            const categoryDefaults = defaultHours[category] || { open: 8, close: 17 };
            
            if (hoursOverride.open24h || locData.open24h) {
                return { open24h: true, openHour: 0, closeHour: 24 };
            }
            
            return {
                open24h: false,
                openHour: hoursOverride.openHour ?? locData.openHour ?? categoryDefaults.open,
                closeHour: hoursOverride.closeHour ?? locData.closeHour ?? categoryDefaults.close
            };
        },

        // Initialize listener
        init: function () {
            const self = this;

            $(document).on(':passagerender', function () {
                setTimeout(() => {
                    self.inject();
                }, 50);
            });

            this.attachEvents();
        },

        // Inject map content into the existing overlay
        inject: function () {
            const container = $('.map-full-content');
            if (container.length === 0) return;

            if (container.find('.map-container, .map-region-container').length > 0) return;

            console.log('[MapSystem] Injecting interactive map...');
            this.showMain();
        },

        // Build main city map view
        buildMainView: function (vars) {
            const mapRegions = this.API.setup?.mapRegions || [];
            const imageMap = this.API.setup?.imageMap || '';

            let regionButtons = mapRegions
                .filter(r => this.isDiscovered(r.id))
                .map(r => {
                    const merged = this.getMergedRegion(r.id);
                    return `
                    <button class="map-region-btn" 
                            data-region="${r.id}"
                            style="left: ${r.x}%; top: ${r.y}%;">
                        ${merged.name}
                    </button>
                `;
                }).join('');

            return `
                <div class="map-container">
                    ${imageMap ? `<img src="${imageMap}" class="map-bg-image" alt="City Map">` : ''}
                    ${regionButtons}
                </div>
            `;
        },

        // Build area view (works for regions and sub-regions)
        buildAreaView: function (areaId, isRegion = false) {
            const vars = this.API.State.variables;
            const self = this;
            
            // Get area info (region or location)
            let areaInfo;
            let areaImage;
            let areaColor = '#3b82f6';
            
            if (isRegion) {
                areaInfo = this.getMergedRegion(areaId);
                areaImage = areaInfo.image;
                areaColor = areaInfo.color;
            } else {
                areaInfo = this.getMergedLocation(areaId);
                areaImage = areaInfo.image;
            }

            // Get children that have map data and are discovered
            const children = this.getChildren(areaId);
            const visibleChildren = children.filter(childId => {
                // Must be discovered
                if (!this.isDiscovered(childId)) return false;
                // Must have map coordinates
                if (!this.hasMapData(childId)) return false;
                return true;
            });

            console.log(`[MapSystem] Area ${areaId} has ${visibleChildren.length} visible children:`, visibleChildren);

            // Build location markers for children
            const locationMarkers = visibleChildren.map(childId => {
                const child = this.getMergedLocation(childId);
                const hasChildren = this.getChildren(childId).some(c => this.hasMapData(c));
                
                // If this child has sub-children with map data, it's a sub-region
                const buttonClass = hasChildren ? 'map-subregion-marker' : 'map-location-marker';
                const dataAttr = hasChildren ? 'data-subregion' : 'data-location';
                
                return `
                    <button class="${buttonClass}" 
                         ${dataAttr}="${childId}"
                         style="left: ${child.x}%; top: ${child.y}%;">
                        ${child.name}
                    </button>
                `;
            }).join('');

            // Determine back button behavior
            let backAction, backLabel;
            if (isRegion) {
                backAction = 'back-to-main';
                backLabel = 'Back to Map';
            } else {
                const parent = this.getParent(areaId);
                const parentRegion = this.getRegionForLocation(areaId);
                if (parent === parentRegion) {
                    backAction = 'back-to-region';
                    backLabel = 'Back to ' + this.getMergedRegion(parentRegion).name;
                } else {
                    backAction = 'back-to-parent';
                    backLabel = 'Back';
                }
            }

            return `
                <div class="map-region-view-wrapper">
                    ${areaImage ? `<img src="${areaImage}" class="map-region-image-full" alt="${areaInfo.name}">` : ''}
                    <div class="map-region-header">
                        <button class="map-back-btn" data-action="${backAction}">
                            <span class="icon icon-chevron-left icon-16"></span> ${backLabel}
                        </button>
                        <div class="map-region-info">
                            <div class="map-region-name">${areaInfo.name}</div>
                            <div class="map-region-desc">${areaInfo.desc || ''}</div>
                        </div>
                        <div class="map-taxi-btn" style="visibility: hidden;"></div>
                    </div>
                    <div class="map-region-container" style="--region-color: ${areaColor}">
                        ${locationMarkers || '<div class="map-empty">No locations discovered in this area.</div>'}
                    </div>
                </div>
            `;
        },

        // Build location detail view
        buildLocationView: function (locationId) {
            const vars = this.API.State.variables;
            const characters = vars.characters || {};
            const navCards = this.API.setup?.navCards || {};

            const location = this.getMergedLocation(locationId);
            if (!location.id) return '';

            const region = this.getMergedRegion(location.region);
            const regionName = region.name || '';

            let contentSection = '';

            // Show known people at this location (residents for residence, staff/workers for stores, etc.)
            if (location.residents && location.residents.length > 0) {
                const residentCards = location.residents
                    .filter(charId => {
                        const char = setup.getCharacter ? setup.getCharacter(charId) : characters[charId];
                        return char && char.known === true;
                    })
                    .map(charId => {
                        const char = setup.getCharacter ? setup.getCharacter(charId) : characters[charId];
                        return `
                            <div class="map-resident-card" data-character="${charId}">
                                <div class="resident-avatar">
                                    ${char.avatar ? `<img src="${char.avatar}" alt="${(char.firstName || '') + ' ' + (char.lastName || '')}">` : '👤'}
                                </div>
                                <div class="resident-info">
                                    <div class="resident-name">${(char.firstName || '') + ' ' + (char.lastName || '')}</div>
                                </div>
                            </div>
                        `;
                    }).join('');

                const peopleSectionTitle = location.structureType === 'residence' ? 'Residents' : 'People here';
                contentSection = residentCards ? `
                    <div class="map-section-title">${peopleSectionTitle}</div>
                    <div class="map-residents-list">
                        ${residentCards}
                    </div>
                ` : '';
            }

            // Area/floor structureType - show child locations as store cards
            // Skip for residence structureType - only show residents
            const children = this.getChildren(locationId);
            const locationImages = this.API.setup?.locationImages || {};
            
            if (children.length > 0 && location.structureType !== 'residence') {
                const storeCards = children
                    .filter(childId => this.isDiscovered(childId))
                    .map(childId => {
                        const childNav = navCards[childId] || {};
                        const childName = childNav.name || childId;
                        
                        // Get store image from locationImages
                        const storeImage = locationImages[childId] || '';
                        
                        return `
                            <div class="map-store-card" data-location="${childId}">
                                <div class="store-icon">
                                    ${storeImage ? `<img src="${storeImage}" alt="${childName}">` : '🏪'}
                                </div>
                                <div class="store-info">
                                    <div class="store-name">${childName}</div>
                                </div>
                            </div>
                        `;
                    }).join('');

                if (storeCards) {
                    contentSection += `
                        <div class="map-stores-list">
                            ${storeCards}
                        </div>
                    `;
                }
            }

            if (location.image) {
                console.log(`[MapSystem] Location image path: ${location.image}`);
            }

            const bgImageHtml = location.image ? `
                <div class="map-location-bg" style="background-image: url('${location.image}');"></div>
                <div class="map-location-gradient"></div>
            ` : '';

            // Back button based on parent
            const parent = this.getParent(locationId);
            let backAction = 'back-to-parent';
            
            const contentHtml = `
                <div class="map-location-header">
                    <button class="map-back-btn" data-action="${backAction}">
                        <span class="icon icon-chevron-left icon-16"></span> Back
                    </button>
                    <div class="map-location-info">
                        <div class="map-location-name">${location.name}</div>
                        <div class="map-location-type">${location.structureType === 'residence' ? 'Residence' : location.structureType === 'area' || location.structureType === 'floor' ? 'Area' : location.category} • ${regionName}</div>
                    </div>
                    <div class="map-taxi-btn" style="visibility: hidden;"></div>
                </div>
                
                <div class="map-location-content">
                    ${bgImageHtml}
                    <div class="map-content-scroll">
                        ${contentSection}
                    </div>
                </div>
            `;

            return contentHtml;
        },

        // Update content
        updateContent: function (html) {
            this.API.$('.map-full-content').html(html);
        },

        // Show area (region or sub-region)
        showArea: function (areaId, isRegion = false) {
            // Push current area to stack for back navigation
            if (this.currentArea) {
                this.navigationStack.push({
                    area: this.currentArea,
                    isRegion: this.currentView === 'region'
                });
            }
            
            this.currentArea = areaId;
            const content = this.buildAreaView(areaId, isRegion);
            this.updateContent(content);
            this.currentView = isRegion ? 'region' : 'subregion';
        },

        // Show region (wrapper for showArea)
        showRegion: function (regionId) {
            this.navigationStack = []; // Reset stack when entering from main
            this.showArea(regionId, true);
        },

        // Show sub-region
        showSubregion: function (subregionId) {
            this.showArea(subregionId, false);
        },

        // Show location detail
        showLocation: function (locationId) {
            if (this.currentArea) {
                this.navigationStack.push({
                    area: this.currentArea,
                    isRegion: this.currentView === 'region',
                    viewType: this.currentView  // 'location' = came from store cards, 'subregion'/'region' = came from markers
                });
            }
            
            this.currentArea = locationId;
            const content = this.buildLocationView(locationId);
            this.updateContent(content);
            this.currentView = 'location';
        },

        // Go back
        goBack: function () {
            if (this.navigationStack.length > 0) {
                const prev = this.navigationStack.pop();
                this.currentArea = prev.area;
                let content;
                if (prev.viewType === 'location') {
                    // Came from store cards (e.g. Town Hall from Civic Center) - show location view again
                    content = this.buildLocationView(prev.area);
                    this.currentView = 'location';
                } else {
                    // Came from area markers - show area view
                    content = this.buildAreaView(prev.area, prev.isRegion);
                    this.currentView = prev.isRegion ? 'region' : 'subregion';
                }
                this.updateContent(content);
            } else {
                this.showMain();
            }
        },

        // Show main map
        showMain: function () {
            const vars = this.API.State.variables;
            const content = this.buildMainView(vars);
            this.updateContent(content);
            this.currentView = 'main';
            this.currentArea = null;
            this.navigationStack = [];
        },

        // Attach events
        attachEvents: function () {
            const self = this;
            const $doc = this.API.$(document);

            // Region button click
            $doc.off('click.map-region').on('click.map-region', '.map-region-btn', function () {
                const regionId = self.API.$(this).data('region');
                self.showRegion(regionId);
            });

            // Sub-region marker click
            $doc.off('click.map-subregion').on('click.map-subregion', '.map-subregion-marker', function () {
                const subregionId = self.API.$(this).data('subregion');
                self.showSubregion(subregionId);
            });

            // Location marker click
            $doc.off('click.map-location').on('click.map-location', '.map-location-marker', function () {
                const locationId = self.API.$(this).data('location');
                self.showLocation(locationId);
            });

            // Back buttons
            $doc.off('click.map-back').on('click.map-back', '.map-back-btn', function () {
                const action = self.API.$(this).data('action');
                if (action === 'back-to-main') {
                    self.showMain();
                } else {
                    self.goBack();
                }
            });

            // Resident/People card click - open character interaction
            $doc.off('click.map-resident').on('click.map-resident', '.map-resident-card', function () {
                const charId = self.API.$(this).data('character');
                if (!charId) return;
                self.API.State.variables.interactingChar = charId;
                $('#map-overlay').removeClass('active');
                self.API.Engine.play('CharacterInteraction');
            });

            // Store/location card click - show that location's detail (e.g. Town Hall from Civic Center)
            $doc.off('click.map-store').on('click.map-store', '.map-store-card', function () {
                const locationId = self.API.$(this).data('location');
                if (!locationId) return;
                self.showLocation(locationId);
            });

            // Taxi button
            $doc.off('click.map-taxi').on('click.map-taxi', '.map-taxi-btn', function () {
                const $btn = self.API.$(this);
                const locationId = $btn.data('location');
                const regionId = $btn.data('region');
                const cost = parseInt($btn.data('cost')) || 10;
                const currentLocation = self.API.State.variables.location || '';
                const mapLocations = self.API.setup?.mapLocations || {};
                const mapRegions = self.API.setup?.mapRegions || [];

                if (currentLocation.startsWith('fh')) {
                    if (window.notify) {
                        notify('You need to go outside first!', 'warning');
                    }
                    return;
                }

                const isRegionPassage = mapRegions.some(r => {
                    const merged = self.getMergedRegion(r.id);
                    return merged.passage === currentLocation;
                });
                const isInSubLocation = mapLocations[currentLocation] && !isRegionPassage;
                
                if (isInSubLocation) {
                    const currentLocRegion = self.getRegionForLocation(currentLocation);
                    const region = self.getMergedRegion(currentLocRegion);
                    const regionName = region.name || 'the area';
                    
                    if (window.notify) {
                        notify(`Exit to ${regionName} first before calling a taxi!`, 'warning');
                    }
                    return;
                }

                let targetPassage = null;

                if (locationId) {
                    const location = self.getMergedLocation(locationId);
                    if (location.passage) {
                        targetPassage = location.passage;
                    }
                    
                    if (currentLocation === locationId || currentLocation === targetPassage) {
                        if (window.notify) {
                            notify('You are already here!', 'warning');
                        }
                        return;
                    }
                } else if (regionId) {
                    const region = self.getMergedRegion(regionId);
                    if (region.passage) {
                        targetPassage = region.passage;
                    }
                    
                    const currentLocRegion = self.getRegionForLocation(currentLocation);
                    if (currentLocation === targetPassage || currentLocRegion === regionId) {
                        if (window.notify) {
                            notify('You are already in this area!', 'warning');
                        }
                        return;
                    }
                }

                if (targetPassage) {
                    self.callTaxi(targetPassage, cost);
                } else {
                    console.warn('[MapSystem] No passage found for taxi destination');
                }
            });
        },

        // Call taxi
        callTaxi: function (passage, cost) {
            const vars = this.API.State.variables;
            const money = vars.money || 0;

            if (money < cost) {
                if (window.notify) {
                    notify('Not enough money!', 'error');
                } else {
                    alert('Not enough money! Taxi fare: $' + cost);
                }
                return;
            }

            vars.tempTaxiDestination = passage;
            vars.tempTaxiCost = cost;

            $('#map-overlay').removeClass('active');

            setTimeout(() => {
                this.API.Engine.play('fastTravelTaxi');
            }, 500);
        }
    };

    // Auto-init
    window.MapSystem.init();
};
