// settings.js
(function () {
    var VIDEO_SETTINGS_DEFAULTS = {
        autoplaySet: true,
        loopSet: true,
        masterVolume: 100,
        videoVolume: 100,
        navCardAnimations: true
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

                                <h3 style="margin-top: 2rem;">Navigation</h3>
                                <div class="settings-list">
                                    <div class="settings-control">
                                        <div class="settings-control-info">
                                            <div class="settings-control-label">Navigation cards animation</div>
                                            <div class="settings-control-desc">Accordion hover expand.</div>
                                        </div>
                                        <button class="setting-toggle-btn ${settings.navCardAnimations !== false ? 'active' : ''}" 
                                                data-setting="navCardAnimations">
                                            ${settings.navCardAnimations !== false ? 'ON' : 'OFF'}
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
                const key = $(this).data('setting');
                self.toggleSetting(key);
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
