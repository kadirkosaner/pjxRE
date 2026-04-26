// settings.js
(function () {
    var VIDEO_SETTINGS_DEFAULTS = {
        autoplaySet: true,
        loopSet: true,
        masterVolume: 100,
        videoVolume: 100,
        navCardAnimations: true,
        navCardLayout: 'horizontal'
    };

    function mergeVideoSettings(vars) {
        return Object.assign({}, VIDEO_SETTINGS_DEFAULTS, vars.videoSettings || {});
    }

window.SettingsInit = function (API) {
    window.SettingsSystem = {
        API: API,

        // Open settings modal
        open: function () {
            const vars = this.API.State.variables;
            const settings = mergeVideoSettings(vars);
            const navLayoutValue = settings.navCardLayout === 'vertical' ? 'vertical' : 'horizontal';
            const navAnimationsActive = navLayoutValue === 'vertical' ? false : settings.navCardAnimations !== false;

            // Content settings data
            const contentSettings = [
                { key: 'maleSexual', label: 'Male Sexual Content', desc: 'Scenes with men' },
                { key: 'femaleSexual', label: 'Female Sexual Content', desc: 'Scenes with women' },
                { key: 'futaTrans', label: 'Trans/Futa Content', desc: 'Characters with both characteristics' },
                { key: 'pregnancy', label: 'Pregnancy Content', desc: 'Risk of getting pregnant' },
                { key: 'incest', label: 'Incest Content', desc: 'Family relations' },
                { key: 'ntr', label: 'NTR / Cheating', desc: 'Betrayal content' },
                { key: 'bdsm', label: 'BDSM Content', desc: 'Bondage and dominance' },
                { key: 'nonConsensual', label: 'Non-Consensual Content', desc: 'Forced interactions' },
                { key: 'publicExhibition', label: 'Public Exhibition', desc: 'Being seen in public' },
                { key: 'lactation', label: 'Lactation Content', desc: 'Breast milk production' },
                { key: 'feet', label: 'Foot Fetish', desc: 'Focus on feet' },
                { key: 'watersports', label: 'Watersports', desc: 'Urine related content' },
                { key: 'scat', label: 'Scat Content', desc: 'Feces related content' },
                { key: 'goreViolence', label: 'Gore / Violence', desc: 'Blood and injury' },
                { key: 'ageplay', label: 'Ageplay', desc: 'Age difference dynamics' }
            ];

            // Generate content controls HTML
            const contentControlsHTML = contentSettings.map(s => `
                <div class="settings-control">
                    <div class="settings-control-info">
                        <div class="settings-control-label">${s.label}</div>
                        <div class="settings-control-desc">${s.desc}</div>
                    </div>
                    <button class="setting-toggle-btn ${vars.contentPreferences?.[s.key] !== false ? 'active' : ''}" 
                            data-setting="${s.key}"
                            data-category="content">
                        ${vars.contentPreferences?.[s.key] !== false ? 'ON' : 'OFF'}
                    </button>
                </div>
            `).join('');

            this.API.Modal.create({
                id: 'settings-modal',
                title: 'Settings',
                width: '800px',
                tabs: [
                    {
                        id: 'general',
                        label: 'General',
                        content: `
                            <div class="tab-content-inner">
                                <h3>Content Preferences</h3>
                                <div class="settings-list">
                                    ${contentControlsHTML}
                                </div>
                            </div>
                        `
                    },
                    {
                        id: 'gameplay',
                        label: 'Gameplay',
                        content: `
                            <div class="tab-content-inner">
                                <h3>Navigation</h3>
                                <div class="settings-list">
                                    <div class="settings-control settings-control-select">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Navigation Card Layout</div>
                                            <div class="settings-control-desc">Choose a style for the navigation cards.</div>
                                        </div>
                                        <div class="setting-picker" data-setting="navCardLayout" data-category="video-picker">
                                            <button class="setting-picker-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
                                                <span class="setting-picker-value">${navLayoutValue === 'vertical' ? 'Vertical' : 'Horizontal'}</span>
                                            </button>
                                            <div class="setting-picker-menu" role="listbox" aria-label="Navigation card layout">
                                                <button class="setting-picker-option ${navLayoutValue === 'horizontal' ? 'active' : ''}" type="button" data-value="horizontal">Horizontal</button>
                                                <button class="setting-picker-option ${navLayoutValue === 'vertical' ? 'active' : ''}" type="button" data-value="vertical">Vertical</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="settings-control nav-animations-setting" ${navLayoutValue === 'vertical' ? 'style="display:none;"' : ''}>
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Navigation Card Animations</div>
                                            <div class="settings-control-desc">Enable hover expand animations on navigation cards.</div>
                                        </div>
                                        <button class="setting-toggle-btn ${navAnimationsActive ? 'active' : ''}"
                                                data-setting="navCardAnimations">
                                            ${navAnimationsActive ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                    <div class="settings-control settings-control-select">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Interaction Back Destination</div>
                                            <div class="settings-control-desc">Choose where Back leads after interactions.</div>
                                        </div>
                                        <div class="setting-picker" data-setting="talkBackToMainPassage" data-category="game-picker">
                                            <button class="setting-picker-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
                                                <span class="setting-picker-value">${(vars.gameSettings && vars.gameSettings.talkBackToMainPassage) ? 'Location' : 'Interaction Menu'}</span>
                                            </button>
                                            <div class="setting-picker-menu" role="listbox" aria-label="Interaction back destination">
                                                <button class="setting-picker-option ${(vars.gameSettings && vars.gameSettings.talkBackToMainPassage) ? '' : 'active'}" type="button" data-value="characterInteraction">Interaction Menu</button>
                                                <button class="setting-picker-option ${(vars.gameSettings && vars.gameSettings.talkBackToMainPassage) ? 'active' : ''}" type="button" data-value="locationPassage">Location</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h3 style="margin-top: 2rem;">Mini-Games</h3>
                                <div class="settings-list">
                                    <div class="settings-control">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Gym Mini-Game</div>
                                        </div>
                                        <button class="setting-toggle-btn ${(vars.gameSettings && vars.gameSettings.gymMiniGameEnabled !== false) ? 'active' : ''}"
                                                data-setting="gymMiniGameEnabled"
                                                data-category="game">
                                            ${(vars.gameSettings && vars.gameSettings.gymMiniGameEnabled !== false) ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        id: 'display',
                        label: 'Display',
                        content: `
                            <div class="tab-content-inner">
                                <h3>Video Settings</h3>
                                <div class="settings-list">
                                    <div class="settings-control">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Video Autoplay</div>
                                            <div class="settings-control-desc">Automatically play videos in passages</div>
                                        </div>
                                        <button class="setting-toggle-btn ${settings.autoplaySet ? 'active' : ''}" 
                                                data-setting="autoplaySet">
                                            ${settings.autoplaySet ? 'ON' : 'OFF'}
                                        </button>
                                    </div>

                                    <div class="settings-control">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Video Loop</div>
                                            <div class="settings-control-desc">Automatically repeat videos when they end</div>
                                        </div>
                                        <button class="setting-toggle-btn ${settings.loopSet ? 'active' : ''}" 
                                                data-setting="loopSet">
                                            ${settings.loopSet ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>

                                <h3 style="margin-top: 2rem;">Volume Settings</h3>
                                <div class="settings-list">
                                    <div class="volume-control-wrapper">
                                        <div class="volume-control-header">
                                            <div class="volume-control-info">
                                                <div class="volume-control-label">Master Volume</div>
                                                <div class="volume-control-desc">Global volume for all sounds</div>
                                            </div>
                                            <span class="volume-value" data-volume="masterVolume">${settings.masterVolume !== undefined ? settings.masterVolume : 100}%</span>
                                        </div>
                                        <div class="custom-slider-container" data-slider="masterVolume">
                                            <div class="custom-slider-track">
                                                <div class="custom-slider-fill" style="width: ${settings.masterVolume !== undefined ? settings.masterVolume : 100}%;"></div>
                                                <div class="custom-slider-thumb" style="left: ${settings.masterVolume !== undefined ? settings.masterVolume : 100}%;">
                                                    <div class="custom-slider-tooltip">${settings.masterVolume !== undefined ? settings.masterVolume : 100}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="volume-control-wrapper">
                                        <div class="volume-control-header">
                                            <div class="volume-control-info">
                                                <div class="volume-control-label">Video Volume</div>
                                                <div class="volume-control-desc">Volume for video playback only</div>
                                            </div>
                                            <span class="volume-value" data-volume="videoVolume">${settings.videoVolume !== undefined ? settings.videoVolume : 100}%</span>
                                        </div>
                                        <div class="custom-slider-container" data-slider="videoVolume">
                                            <div class="custom-slider-track">
                                                <div class="custom-slider-fill" style="width: ${settings.videoVolume !== undefined ? settings.videoVolume : 100}%;"></div>
                                                <div class="custom-slider-thumb" style="left: ${settings.videoVolume !== undefined ? settings.videoVolume : 100}%;">
                                                    <div class="custom-slider-tooltip">${settings.videoVolume !== undefined ? settings.videoVolume : 100}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                    }
                ]
            });

            setTimeout(() => {
                this.initEvents();
            }, 100);
        },

        initEvents: function () {
            const self = this;

            $(document).off('click.settings-toggle', '.setting-toggle-btn');
            $(document).on('click.settings-toggle', '.setting-toggle-btn', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if ($(this).is(':disabled')) {
                    return;
                }
                const key = $(this).data('setting');
                self.toggleSetting(key);
            });
            $(document).off('click.settings-picker', '.setting-picker-btn');
            $(document).on('click.settings-picker', '.setting-picker-btn', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.togglePicker($(this).closest('.setting-picker'));
            });

            $(document).off('click.settings-picker-option', '.setting-picker-option');
            $(document).on('click.settings-picker-option', '.setting-picker-option', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const $option = $(this);
                const $picker = $option.closest('.setting-picker');
                const key = $picker.data('setting');
                const category = $picker.data('category');
                const value = $option.data('value');
                self.updatePickerSetting($picker, key, category, value);
            });

            $(document).off('click.settings-picker-close');
            $(document).on('click.settings-picker-close', function () {
                self.closeAllPickers();
            });

            this.initCustomSliders();

        },

        initCustomSliders: function () {
            const self = this;

            $('.custom-slider-container').each(function () {
                const container = $(this);
                const sliderKey = container.data('slider');
                const track = container.find('.custom-slider-track');
                const fill = container.find('.custom-slider-fill');
                const thumb = container.find('.custom-slider-thumb');
                const tooltip = container.find('.custom-slider-tooltip');

                let isDragging = false;

                const updateSlider = (clientX) => {
                    const trackRect = track[0].getBoundingClientRect();
                    const trackWidth = trackRect.width;
                    let position = clientX - trackRect.left;

                    position = Math.max(0, Math.min(position, trackWidth));
                    const percentage = Math.round((position / trackWidth) * 100);

                    fill.css('width', percentage + '%');
                    thumb.css('left', percentage + '%');
                    tooltip.text(percentage + '%');

                    self.updateVolume(sliderKey, percentage);
                };

                track.on('mousedown', function (e) {
                    if (e.target === thumb[0] || thumb.has(e.target).length) return;
                    updateSlider(e.clientX);
                    isDragging = true;
                    thumb.addClass('dragging');
                });

                thumb.on('mousedown', function (e) {
                    e.preventDefault();
                    isDragging = true;
                    thumb.addClass('dragging');
                });

                $(document).on('mousemove.slider-' + sliderKey, function (e) {
                    if (!isDragging) return;
                    updateSlider(e.clientX);
                });

                $(document).on('mouseup.slider-' + sliderKey, function () {
                    if (isDragging) {
                        isDragging = false;
                        thumb.removeClass('dragging');
                    }
                });
            });
        },

        toggleSetting: function (key) {

            const vars = this.API.State.variables;
            const btn = $(`.setting-toggle-btn[data-setting="${key}"]`);
            const category = btn.data('category');
            
            if (category === 'content') {
                if (!vars.contentPreferences) {
                    vars.contentPreferences = { incest: true, romantic: true, sexual: true, gore: true, violence: true, scat: false };
                }
                
                const settings = vars.contentPreferences;
                
                settings[key] = !settings[key];
                
                if (btn.length) {
                    const isActive = settings[key];
                    btn.toggleClass('active', isActive);
                    btn.text(isActive ? 'ON' : 'OFF');
                }
                
            } else if (category === 'game') {
                if (!vars.gameSettings || typeof vars.gameSettings !== 'object') {
                    vars.gameSettings = {};
                }

                const settings = vars.gameSettings;
                settings[key] = !settings[key];

                if (btn.length) {
                    const isActive = settings[key];
                    btn.toggleClass('active', isActive);
                    btn.text(isActive ? 'ON' : 'OFF');
                }
            } else {
                vars.videoSettings = mergeVideoSettings(vars);
                const settings = vars.videoSettings;

                settings[key] = !settings[key];

                if (btn.length) {
                    const isActive = settings[key];
                    btn.toggleClass('active', isActive);
                    btn.text(isActive ? 'ON' : 'OFF');
                }

                if (key === 'navCardAnimations' && typeof window.syncNavCardMotionClass === 'function') {
                    window.syncNavCardMotionClass();
                }
                if ((key === 'navCardAnimations' || key === 'navCardLayout') && typeof window.syncNavCardLayoutClass === 'function') {
                    window.syncNavCardLayoutClass();
                }
                
            }
        },

        togglePicker: function ($picker) {
            const isOpen = $picker.hasClass('open');
            this.closeAllPickers();
            if (!isOpen) {
                $picker.addClass('open');
                $picker.find('.setting-picker-btn').attr('aria-expanded', 'true');
            }
        },

        closeAllPickers: function () {
            $('.setting-picker.open').removeClass('open').find('.setting-picker-btn').attr('aria-expanded', 'false');
        },

        updatePickerSetting: function ($picker, key, category, value) {
            const vars = this.API.State.variables;
            if (category === 'game-picker') {
                if (!vars.gameSettings || typeof vars.gameSettings !== 'object') {
                    vars.gameSettings = {};
                }
                if (key === 'talkBackToMainPassage') {
                    vars.gameSettings.talkBackToMainPassage = value === 'locationPassage';
                }
                const label = value === 'locationPassage' ? 'Location' : 'Interaction Menu';
                $picker.find('.setting-picker-value').text(label);
                $picker.find('.setting-picker-option').removeClass('active');
                $picker.find(`.setting-picker-option[data-value="${value}"]`).addClass('active');
                this.closeAllPickers();
            } else if (category === 'video-picker') {
                vars.videoSettings = mergeVideoSettings(vars);
                if (key === 'navCardLayout') {
                    vars.videoSettings.navCardLayout = value === 'vertical' ? 'vertical' : 'horizontal';
                    if (vars.videoSettings.navCardLayout === 'vertical') {
                        vars.videoSettings.navCardAnimations = false;
                    }
                }
                const label = value === 'vertical' ? 'Vertical' : 'Horizontal';
                $picker.find('.setting-picker-value').text(label);
                $picker.find('.setting-picker-option').removeClass('active');
                $picker.find(`.setting-picker-option[data-value="${value}"]`).addClass('active');
                this.refreshNavCardControls();
                this.closeAllPickers();

                /* Apply layout classes directly so CSS takes effect immediately, independent of helpers */
                if (key === 'navCardLayout') {
                    const isVertical = value === 'vertical';
                    document.body.classList.toggle('nav-layout-vertical', isVertical);
                    document.body.classList.toggle('nav-layout-horizontal', !isVertical);
                    document.documentElement.classList.toggle('nav-layout-vertical', isVertical);
                    document.documentElement.classList.toggle('nav-layout-horizontal', !isVertical);
                    document.querySelectorAll('.accordion-container.nav-breakout').forEach(function (el) {
                        el.classList.toggle('nav-layout-vertical', isVertical);
                        el.classList.toggle('nav-layout-horizontal', !isVertical);
                    });
                }

                if (typeof window.syncNavCardMotionClass === 'function') {
                    window.syncNavCardMotionClass();
                }
                if (typeof window.syncNavCardLayoutClass === 'function') {
                    window.syncNavCardLayoutClass();
                }
            }
        },

        refreshNavCardControls: function () {
            const vars = this.API.State.variables;
            vars.videoSettings = mergeVideoSettings(vars);
            const settings = vars.videoSettings;
            const isVertical = settings.navCardLayout === 'vertical';
            const navAnimationsActive = !isVertical && settings.navCardAnimations !== false;
            const $row = $('.nav-animations-setting');
            if ($row.length) {
                $row.toggle(!isVertical);
            }
            const $btn = $('.setting-toggle-btn[data-setting="navCardAnimations"]');
            if ($btn.length) {
                $btn.toggleClass('active', navAnimationsActive);
                $btn.text(navAnimationsActive ? 'ON' : 'OFF');
            }
        },

        updateVolume: function (key, value) {

            const vars = this.API.State.variables;
            vars.videoSettings = mergeVideoSettings(vars);

            const settings = vars.videoSettings;
            settings[key] = value;

            $(`.volume-value[data-volume="${key}"]`).text(value + '%');

        }
    };
};
})();
