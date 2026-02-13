// stats.js - Redesigned 2-Tab Accordion Layout v2
window.StatsInit = function (API) {
    window.StatsSystem = {
        API: API,

        // ============================================
        // HELPERS
        // ============================================
        
        // Helper: Create a single stat row with bar and info icon
        createStatRow: function(label, value, max = 100, color = '#ec4899', description = '') {
            const percentage = Math.min(100, (value / max) * 100);
            return `
                <div class="stat-row">
                    <div class="stat-label-container">
                        <span class="stat-label">${label}</span>
                        ${description ? `<i class="icon icon-info stat-info-icon" data-tooltip="${description}"></i>` : ''}
                    </div>
                    <div class="stat-bar-wrapper">
                        <div class="stat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                    </div>
                    <div class="stat-value-text">${Math.round(value)}/${max}</div>
                </div>
            `;
        },

        // Helper: Create level display (for corruption)
        createLevelRow: function(label, level, maxLevel = 10, color = '#9333ea', description = '') {
            return `
                <div class="stat-row">
                    <div class="stat-label-container">
                        <span class="stat-label">${label}</span>
                        ${description ? `<i class="icon icon-info stat-info-icon" data-tooltip="${description}"></i>` : ''}
                    </div>
                    <div class="stat-level-display" style="color: ${color};">
                        Level ${Math.round(level)} / ${maxLevel}
                    </div>
                </div>
            `;
        },

        // Helper: Create bidirectional bar (-100 to +100, centered at 0)
        createBidirectionalRow: function(label, value, color = '#6366f1', description = '') {
            // Value is -100 to +100, we show bar from center
            const percentage = Math.abs(value) / 2; // 0-50% each side
            const isPositive = value >= 0;
            const leftLabel = 'Defiant';
            const rightLabel = 'Obedient';
            return `
                <div class="stat-row bidirectional">
                    <div class="stat-label-container">
                        <span class="stat-label">${label}</span>
                        ${description ? `<i class="icon icon-info stat-info-icon" data-tooltip="${description}"></i>` : ''}
                    </div>
                    <div class="stat-bar-bidirectional">
                        <span class="bidir-label left">${leftLabel}</span>
                        <div class="bidir-bar-wrapper">
                            <div class="bidir-bar-left" style="width: ${isPositive ? 0 : percentage}%; background: #ef4444;"></div>
                            <div class="bidir-center"></div>
                            <div class="bidir-bar-right" style="width: ${isPositive ? percentage : 0}%; background: ${color};"></div>
                        </div>
                        <span class="bidir-label right">${rightLabel}</span>
                    </div>
                </div>
            `;
        },

        // Helper: Create an accordion group
        createAccordion: function(id, title, icon, content) {
            return `
                <div class="stat-group" id="stat-group-${id}">
                    <div class="stat-group-header" onclick="$(this).parent().toggleClass('expanded')">
                        <div class="stat-group-icon"><i class="icon icon-${icon}"></i></div>
                        <div class="stat-group-title">${title}</div>
                        <i class="icon icon-chevron-down stat-group-toggle"></i>
                    </div>
                    <div class="stat-group-content">
                        ${content}
                    </div>
                </div>
            `;
        },

        // ============================================
        // WORK TAB
        // ============================================
        renderWorkTab: function(vars) {
            const job = vars.job;
            const jobState = vars.jobState || {};
            const setup = this.API?.setup || window.setup || {};
            const jobs = setup.jobs || {};
            const timeConfig = vars.timeConfig || { weekdayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };

            if (!job || !job.id || !jobs[job.id]) {
                return `
                    <div class="stats-view work-tab">
                        <div class="work-panel work-panel-full">
                            <div class="work-empty">
                                <span class="stat-label">No job</span>
                                <p class="work-empty-desc">You are not currently employed.</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            const def = jobs[job.id];
            const tier = Math.min(job.tier || 1, def.tierMax || 6);
            const reqs = def.tierExperienceRequirements || [0, 50, 120, 200, 320, 500];
            const currentXP = jobState.jobExperience || 0;
            const xpForCurrent = reqs[tier - 1] || 0;
            const xpForNext = tier >= (def.tierMax || 6) ? xpForCurrent : (reqs[tier] || 0);
            const xpInTier = currentXP - xpForCurrent;
            const xpNeeded = xpForNext - xpForCurrent;
            const xpPct = xpNeeded <= 0 ? 100 : Math.min(100, (xpInTier / xpNeeded) * 100);

            const wageByTier = def.wageByTier || [];
            const wage = (wageByTier[tier - 1] != null) ? wageByTier[tier - 1] : (def.wagePerHour || 0);
            const payDayWeekday = def.payDayWeekday != null ? def.payDayWeekday : 1;
            const payDayName = timeConfig.weekdayNames[payDayWeekday] || 'Monday';

            const gross = jobState.weeklyEarnings || 0;
            const deductions = jobState.weeklyDeductions || 0;
            const net = Math.max(0, gross - deductions);

            const requiredHoursPerDay = def.requiredHoursPerDay != null ? def.requiredHoursPerDay : 8;
            const hoursToday = jobState.hoursToday || 0;
            const hoursTodayPct = requiredHoursPerDay <= 0 ? 100 : Math.min(100, (hoursToday / requiredHoursPerDay) * 100);

            return `
                <div class="stats-view work-tab">
                    <div class="work-layout">
                        <div class="work-panel work-panel-job">
                            <div class="work-row">
                                <span class="stat-label">Work place</span>
                                <span class="work-value">${def.workplaceName || job.id}</span>
                            </div>
                            <div class="work-row">
                                <span class="stat-label">Job</span>
                                <span class="work-value">${def.position || def.name || ''} <span class="work-tier">Tier ${tier}</span></span>
                            </div>
                            <div class="work-row">
                                <span class="stat-label">Wage</span>
                                <span class="work-value">$${wage}/hr</span>
                            </div>
                            <div class="work-field-xp work-field-hours">
                                <span class="stat-label">Hours today</span>
                                <div class="work-xp-row">
                                    <div class="stat-bar-wrapper work-xp-bar">
                                        <div class="stat-bar-fill" style="width: ${hoursTodayPct}%; background: var(--color-accent);"></div>
                                    </div>
                                    <span class="work-xp-text">${hoursToday} / ${requiredHoursPerDay} h</span>
                                </div>
                            </div>
                            <div class="work-field-xp">
                                <span class="stat-label">Work experience</span>
                                <div class="work-xp-row">
                                    <div class="stat-bar-wrapper work-xp-bar">
                                        <div class="stat-bar-fill" style="width: ${xpPct}%; background: var(--color-accent);"></div>
                                    </div>
                                    <span class="work-xp-text">${Math.round(xpInTier)} / ${xpNeeded || '—'} XP</span>
                                </div>
                            </div>
                        </div>
                        <div class="work-panel work-panel-salary">
                            <div class="work-salary-title">This week salary</div>
                            <div class="work-row">
                                <span class="stat-label">Salary</span>
                                <span class="work-value">$${(gross).toFixed(2)}</span>
                            </div>
                            <div class="work-row">
                                <span class="stat-label">Deductions</span>
                                <span class="work-value">$${(deductions).toFixed(2)}</span>
                            </div>
                            <div class="work-row work-salary-total">
                                <span class="stat-label">Net</span>
                                <span class="work-value">$${(net).toFixed(2)}</span>
                            </div>
                            <div class="work-row work-payday">
                                <span class="stat-label">Pay day</span>
                                <span class="work-value">${payDayName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        // ============================================
        // MODAL RENDER
        // ============================================
        
        open: function () {
            const vars = this.API.State.variables;
            const settings = vars.gameSettings || {};
            
            // Calculate derived stats
            // Used pre-calculated values from StatCalculator widgets
            const fitness = vars.fitness || Math.round((vars.upperBody + vars.core + vars.lowerBody + vars.cardio) / 4);
            const looks = vars.looks || 0;

            this.API.Modal.create({
                id: 'stats-modal',
                title: 'Stats & Skills',
                width: '1000px', // Wider implementation as per CSS
                tabs: [
                    // ====================== TAB 1: STATS ======================
                    {
                        id: 'stats',
                        label: 'Stats',
                        content: `
                            <div class="stats-view">
                                ${this.createAccordion('vital', 'Vital Signs', 'health', `
                                    ${this.createStatRow('Energy', vars.energy, vars.energyMax, '#eab308', 'Action points available for the day.')}
                                    ${this.createStatRow('Health', vars.health, 100, '#ef4444', 'Physical wellbeing and resistance to illness.')}
                                    ${this.createStatRow('Mood', vars.mood, 100, '#10b981', 'Mental stability and overall happiness.')}
                                    ${this.createStatRow('Stress', vars.stress || 0, 100, '#dc2626', 'Mental strain. High stress affects mood and health.')}
                                    ${this.createStatRow('Arousal', vars.arousal, 100, '#d946ef', 'Sexual excitement level.')}
                                    ${this.createStatRow('Hygiene', vars.hygiene, 100, '#3b82f6', 'Cleanliness level. Affects social interactions.')}
                                    ${settings.trackHunger ? this.createStatRow('Hunger', vars.hunger, 100, '#9a3412', 'Food requirement. High values mean starvation.') : ''}
                                    ${settings.trackThirst ? this.createStatRow('Thirst', vars.thirst, 100, '#0ea5e9', 'Hydration level. affects fatigue.') : ''}
                                    ${settings.trackBladder ? this.createStatRow('Bladder', vars.bladder, 100, '#eab308', 'Bathroom urgency.') : ''}
                                    <div style="text-align: center; font-weight: bold; margin-top: 1rem; color: var(--color-text-highlight);">
                                        Calorie Balance : ${vars.dailyCalorieIntake || 0} / ${(vars.basalMetabolicRate || 2000) + (vars.dailyExercise || 0)}
                                    </div>
                                `)}

                                ${this.createAccordion('physical', 'Physical Stats', 'physical', `
                                    ${this.createStatRow('Fitness', fitness, 100, '#f97316', 'Overall physical condition standard.')}
                                    ${this.createStatRow('Upper Body', vars.upperBody, 100, '#fdba74', 'Arm, chest and back muscle development.')}
                                    ${this.createStatRow('Core', vars.core, 100, '#fdba74', 'Abs and lower back strength.')}
                                    ${this.createStatRow('Lower Body', vars.lowerBody, 100, '#fdba74', 'Leg, calf and glute strength.')}
                                    ${this.createStatRow('Cardio', vars.cardio, 100, '#fdba74', 'Stamina, lung capacity and endurance.')}
                                `)}

                                ${this.createAccordion('mental', 'Mental & Social', 'brain', `
                                    ${this.createStatRow('Intelligence', vars.intelligence, 100, '#8b5cf6', 'Problem solving capabilities and learning speed.')}
                                    ${this.createStatRow('Focus', vars.focus, 100, '#a78bfa', 'Ability to concentrate on tasks without error.')}
                                    ${this.createStatRow('Creativity', vars.creativity, 100, '#a78bfa', 'Artistic ability and expressive talent.')}
                                    ${this.createStatRow('Willpower', vars.willpower, 100, '#a78bfa', 'Mental resilience against stress and temptation.')}
                                    ${this.createStatRow('Charisma', vars.charisma, 100, '#db2777', 'Social influence, charm and persuasion.')}
                                    ${this.createStatRow('Confidence', vars.confidence, 100, '#f472b6', 'Self-assurance and ability to handle pressure.')}
                                    ${this.createStatRow('Beauty', vars.beauty || 0, 100, '#ec4899', 'Natural physical attractiveness.')}
                                    ${this.createStatRow('Looks', looks, 100, '#f472b6', 'Overall cosmetic attractiveness combining body and style.')}
                                `)}

                                ${this.createAccordion('special', 'Special Stats', 'shield', `
                                    ${this.createBidirectionalRow('Obedience', vars.obedience || 0, '#6366f1', 'Tendency to follow or resist commands.')}
                                    ${this.createStatRow('Exhibitionism', vars.exhibitionism || 0, 100, '#f43f5e', 'Comfort with public exposure.')}
                                    ${this.createStatRow('Pain Tolerance', vars.painTolerance || 0, 100, '#dc2626', 'Ability to endure physical pain.')}
                                `)}
                            </div>
                        `
                    },
                    // ====================== TAB 2: SKILLS ======================
                    {
                        id: 'skills',
                        label: 'Skills',
                        content: `
                            <div class="stats-view">
                                ${this.createAccordion('mental_skills', 'Mental Skills', 'brain', `
                                    ${this.createStatRow('Research', vars.skills.mental?.research || 0, 100, '#8b5cf6', 'Information gathering.')}
                                    ${this.createStatRow('Problem Solving', vars.skills.mental?.problemSolving || 0, 100, '#8b5cf6', 'Logical solutions.')}
                                    ${this.createStatRow('Analysis', vars.skills.mental?.analysis || 0, 100, '#8b5cf6', 'Data interpretation.')}
                                `)}

                                ${this.createAccordion('social_skills', 'Social Skills', 'users', `
                                    ${this.createStatRow('Conversation', vars.skills.social?.conversation || 0, 100, '#db2777', 'Chatting and small talk.')}
                                    ${this.createStatRow('Persuasion', vars.skills.social?.persuasion || 0, 100, '#db2777', 'Convincing others.')}
                                    ${this.createStatRow('Networking', vars.skills.social?.networking || 0, 100, '#db2777', 'Building connections.')}
                                `)}

                                ${this.createAccordion('physical_skills', 'Physical Skills', 'physical', `
                                    ${this.createStatRow('Basketball', vars.skills.physical?.basketball || 0, 100, '#f97316', 'Court sports proficiency.')}
                                    ${this.createStatRow('Volleyball', vars.skills.physical?.volleyball || 0, 100, '#f97316', 'Net sports proficiency.')}
                                    ${this.createStatRow('Football', vars.skills.physical?.football || 0, 100, '#f97316', 'Field sports proficiency.')}
                                    ${this.createStatRow('Swimming', vars.skills.physical?.swimming || 0, 100, '#f97316', 'Aquatic endurance.')}
                                    ${this.createStatRow('Dance', vars.skills.physical?.dance || 0, 20, '#f97316', 'Rhythmic movement.')}
                                    ${this.createStatRow('Running', vars.skills.physical?.running || 0, 20, '#f97316', 'Endurance and pace.')}
                                    ${this.createStatRow('Yoga', vars.skills.physical?.yoga || 0, 100, '#f97316', 'Flexibility and balance.')}
                                `)}

                                ${this.createAccordion('creative_skills', 'Creative Skills', 'star', `
                                    ${this.createStatRow('Art', vars.skills.creative?.art || 0, 100, '#10b981', 'Drawing and painting.')}
                                    ${this.createStatRow('Music', vars.skills.creative?.music || 0, 100, '#10b981', 'Playing instruments.')}
                                    ${this.createStatRow('Writing', vars.skills.creative?.writing || 0, 100, '#10b981', 'Storytelling and composition.')}
                                `)}

                                ${this.createAccordion('tech_skills', 'Technical Skills', 'drill', `
                                    ${this.createStatRow('Programming', vars.skills.technical?.programming || 0, 100, '#3b82f6', 'Coding ability.')}
                                    ${this.createStatRow('Hacking', vars.skills.technical?.hacking || 0, 100, '#3b82f6', 'System intrusion.')}
                                    ${this.createStatRow('Electronics', vars.skills.technical?.electronics || 0, 100, '#3b82f6', 'Hardware repair.')}
                                    ${this.createStatRow('Gaming', vars.skills.technical?.gaming || 0, 100, '#3b82f6', 'Gaming proficiency.')}
                                `)}

                                ${this.createAccordion('practical_skills', 'Practical Skills', 'check-circle', `
                                    ${this.createStatRow('Cooking', vars.skills.practical?.cooking || 0, 100, '#f97316', 'Meal preparation quality.')}
                                    ${this.createStatRow('Cleaning', vars.skills.practical?.cleaning || 0, 100, '#f97316', 'Housekeeping efficiency.')}
                                    ${this.createStatRow('Driving', vars.skills.practical?.driving || 0, 100, '#f97316', 'Vehicle control.')}
                                    ${this.createStatRow('Finance', vars.skills.practical?.finance || 0, 100, '#f97316', 'Money management.')}
                                    ${this.createStatRow('Mechanics', vars.skills.practical?.mechanics || 0, 100, '#f97316', 'Vehicle and machine repair.')}
                                    ${this.createStatRow('Gardening', vars.skills.practical?.gardening || 0, 100, '#f97316', 'Plant care and botany.')}
                                    ${this.createStatRow('Makeup', vars.skills.practical?.makeup || 0, 100, '#f97316', 'Makeup application quality. Unlocks higher style tiers at mirror.')}
                                `)}

                                ${this.createAccordion('sexual', 'Sexual Proficiency', 'heart', `
                                    ${this.createStatRow('Oral', vars.sexual?.skills?.oral || 0, 100, '#f43f5e', 'Skill in giving oral pleasure.')}
                                    ${this.createStatRow('Deepthroat', vars.sexual?.skills?.deepthroat || 0, 100, '#f43f5e', 'Throat training.')}
                                    ${this.createStatRow('Handjob', vars.sexual?.skills?.handjob || 0, 100, '#f43f5e', 'Manual stimulation technique.')}
                                    ${this.createStatRow('Riding', vars.sexual?.skills?.riding || 0, 100, '#f43f5e', 'Top position expertise.')}
                                    ${this.createStatRow('Anal', vars.sexual?.skills?.anal || 0, 100, '#f43f5e', 'Anal play adaptation.')}
                                    ${this.createStatRow('Foreplay', vars.sexual?.skills?.foreplay || 0, 100, '#f472b6', 'Building intimacy and excitement.')}
                                    ${this.createStatRow('Teasing', vars.sexual?.skills?.teasing || 0, 100, '#f472b6', 'Playful sexual provocation.')}
                                    ${this.createStatRow('Seduction', vars.sexual?.skills?.seduction || 0, 100, '#8b5cf6', 'Ability to arouse others.')}
                                `)}
                            </div>
                        `
                    },
                    // ====================== TAB 3: WORK ======================
                    {
                        id: 'work',
                        label: 'Work',
                        content: this.renderWorkTab(vars)
                    }
                ]
            });

            // Initialize tooltips explicitly using standard system
            // We use a slight delay to ensure the modal content is rendered in the DOM
            setTimeout(function() {
                if (window.initTooltips) {
                    window.initTooltips();
                    console.log('[Stats] Tooltips initialized via global system');
                } else {
                    console.warn('[Stats] window.initTooltips not found');
                }
            }, 300);
        }
    };
};
