let HelpAPI = null;

window.HelpInit = function (API) {
    HelpAPI = API;

    window.HelpSystem = {
        API: API,
        activeSection: 'basics',

        sections: [
            { id: 'basics',        label: 'Basics',           icon: 'icon-info' },
            { id: 'needs',         label: 'Need System',      icon: 'icon-lightning' },
            { id: 'stats',         label: 'Stats & Looks',    icon: 'icon-physical' },
            { id: 'body',          label: 'Body & Weight',    icon: 'icon-body' },
            { id: 'skillDecay',    label: 'Skill Decay',      icon: 'icon-brain' },
            { id: 'time',          label: 'Time & Actions',   icon: 'icon-alarm' },
            { id: 'map',           label: 'Map & Travel',     icon: 'icon-map-pin' },
            { id: 'grooming',      label: 'Mirror & Grooming', icon: 'icon-face' },
            { id: 'wardrobe',      label: 'Wardrobe',         icon: 'icon-dress' },
            { id: 'phone',         label: 'Phone',            icon: 'icon-message' },
            { id: 'relationships', label: 'Relationships',    icon: 'icon-heart' },
            { id: 'reputation',    label: 'Reputation',       icon: 'icon-users' },
            { id: 'jobs',          label: 'Jobs & Money',     icon: 'icon-briefcase' },
            { id: 'activities',    label: 'Daily Life',       icon: 'icon-food' },
            { id: 'quests',        label: 'Quests',           icon: 'icon-star' },
            { id: 'settings',      label: 'Game Settings',    icon: 'icon-settings' },
        ],

        content: {
            basics: `
                <div class="help-article">
                    <h2>Welcome to All That Glitters</h2>
                    <p>All That Glitters is a life-simulation visual novel where your choices shape the story. Navigate daily life, build relationships, and discover hidden storylines.</p>

                    <h3>Top Bar</h3>
                    <p>The top bar is your main control center, split into three zones:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-hamburger icon-16"></span> Menu</span>
                            <span class="help-value">Opens the main menu &mdash; save/load, settings, restart, help, and external links.</span>
                        </div>
                    </div>

                    <p class="help-subsection-title">Navigation Links</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Character</span>
                            <span class="help-value">View your character's appearance, body diagram, and equipped outfit.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Relations</span>
                            <span class="help-value">Detailed relationship status with every known character (love, friendship, lust, trust levels).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Stats</span>
                            <span class="help-value">Full stat breakdown &mdash; vitals, skills, needs, and derived values.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Journal</span>
                            <span class="help-value">Active and completed quests with stage objectives and progress.</span>
                        </div>
                    </div>

                    <p class="help-subsection-title">Time & History</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Time Display</span>
                            <span class="help-value">Shows current time (HH:MM), day period, weekday name, and full date.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">&larr; / &rarr; Arrows</span>
                            <span class="help-value">Navigate through your history &mdash; go back to a previous scene or forward again. Does not undo actions.</span>
                        </div>
                    </div>

                    <p class="help-subsection-title">Notification Icons</p>
                    <p>Colored icons appear in the top bar when something needs your attention:</p>
                    <div class="help-needs-grid">
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-lightning icon-18" style="color: #fbbf24;"></span>
                                <span>Energy Low</span>
                            </div>
                            <p>Below 30% of your max energy.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-health icon-18" style="color: #ef4444;"></span>
                                <span>Health Low</span>
                            </div>
                            <p>Health dropped below 30.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-mood icon-18" style="color: #ec4899;"></span>
                                <span>Mood Low</span>
                            </div>
                            <p>Mood dropped below 30.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-food icon-18" style="color: #f97316;"></span>
                                <span>Hungry</span>
                            </div>
                            <p>Hunger at 70 or above.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-thirst icon-18" style="color: #3b82f6;"></span>
                                <span>Thirsty</span>
                            </div>
                            <p>Thirst at 70 or above.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-bladder icon-18" style="color: #facc15;"></span>
                                <span>Bladder Full</span>
                            </div>
                            <p>Bladder at 70 or above.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-arousal icon-18" style="color: #f87171;"></span>
                                <span>Arousal High</span>
                            </div>
                            <p>Arousal at 70 or above.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-face icon-18" style="color: #a78bfa;"></span>
                                <span>Appearance</span>
                            </div>
                            <p>Hair, face, or dental care below 25%.</p>
                        </div>
                    </div>
                    <p>Additional icons may appear for work shifts, school, bed, alarm, clothing issues, and meetups.</p>

                    <h3>Right Bar</h3>
                    <p>The right sidebar shows your character overview at a glance:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Profile</span>
                            <span class="help-value">Your character portrait with grooming indicators (hair combed, makeup applied).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Stats</span>
                            <span class="help-value">Money (hover for cash/bank split), Energy, Health, Mood, Stress, and Arousal values.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Phone</span>
                            <span class="help-value">Phone preview with notification badge. Click to open the full phone overlay.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Map</span>
                            <span class="help-value">Map thumbnail. Click to open the full interactive map for navigation and fast travel.</span>
                        </div>
                    </div>

                    <h3>Saving Your Progress</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Auto-Save</span>
                            <span class="help-value">The game auto-saves on every passage transition to Slot 0.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Manual Save</span>
                            <span class="help-value">Menu &rarr; Save & Load to manage save slots or export/import from disk.</span>
                        </div>
                    </div>

                    <h3>Making Choices</h3>
                    <p>Highlighted pink links represent choices. Click them to advance the story. Some choices may require minimum stats (energy, confidence, etc.), appropriate clothing, or be time-restricted.</p>
                </div>
            `,

            needs: `
                <div class="help-article">
                    <h2>Need System</h2>
                    <p>Your character has several biological needs that change over time. Every in-game hour that passes applies automatic changes to your stats. Ignoring your needs triggers cascading penalties.</p>

                    <h3>Hourly Decay</h3>
                    <p>Each full in-game hour (via actions, travel, or waiting) applies these changes automatically:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-food icon-16"></span> Hunger</span>
                            <span class="help-value"><span class="help-stat-change bad">+5 / hour</span></span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-thirst icon-16"></span> Thirst</span>
                            <span class="help-value"><span class="help-stat-change bad">+5 / hour</span></span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-bladder icon-16"></span> Bladder</span>
                            <span class="help-value"><span class="help-stat-change bad">+8 / hour</span></span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-health icon-16"></span> Hygiene</span>
                            <span class="help-value"><span class="help-stat-change bad">&minus;5 / hour</span></span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-lightning icon-16"></span> Energy</span>
                            <span class="help-value"><span class="help-stat-change bad">&minus;5 / hour</span> <span class="help-note">(paused while sleeping)</span></span>
                        </div>
                    </div>

                    <h3>Threshold Penalties</h3>
                    <p>When a need crosses a critical threshold, additional penalties stack on top of the hourly decay. These penalties are <strong>skipped during sleep</strong>.</p>

                    <div class="help-needs-grid">
                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-food icon-20"></span>
                                <span>Hunger</span>
                            </div>
                            <div class="help-threshold">
                                <div class="help-threshold-row danger">
                                    <span class="help-threshold-label">&ge; 90</span>
                                    <span>Energy &minus;20, Mood &minus;15, Health &minus;10</span>
                                </div>
                                <div class="help-threshold-row warning">
                                    <span class="help-threshold-label">&ge; 60</span>
                                    <span>Energy &minus;10, Mood &minus;5</span>
                                </div>
                            </div>
                        </div>

                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-thirst icon-20"></span>
                                <span>Thirst</span>
                            </div>
                            <div class="help-threshold">
                                <div class="help-threshold-row danger">
                                    <span class="help-threshold-label">&ge; 90</span>
                                    <span>Energy &minus;15, Focus &minus;20, Health &minus;5</span>
                                </div>
                                <div class="help-threshold-row warning">
                                    <span class="help-threshold-label">&ge; 60</span>
                                    <span>Energy &minus;5, Focus &minus;10</span>
                                </div>
                            </div>
                        </div>

                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-bladder icon-20"></span>
                                <span>Bladder</span>
                            </div>
                            <div class="help-threshold">
                                <div class="help-threshold-row danger">
                                    <span class="help-threshold-label">&ge; 100</span>
                                    <span>Stress +10, Mood &minus;10</span>
                                </div>
                                <div class="help-threshold-row warning">
                                    <span class="help-threshold-label">&ge; 80</span>
                                    <span>Stress +5</span>
                                </div>
                            </div>
                        </div>

                        <div class="help-need-card">
                            <div class="help-need-header">
                                <span class="icon icon-health icon-20"></span>
                                <span>Hygiene</span>
                            </div>
                            <div class="help-threshold">
                                <div class="help-threshold-row danger">
                                    <span class="help-threshold-label">&le; 10</span>
                                    <span>Mood &minus;10</span>
                                </div>
                            </div>
                            <p class="help-threshold-note">Low hygiene also reduces your Looks score, affecting how NPCs react to you.</p>
                        </div>
                    </div>

                    <h3>Collapse & Faint</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Energy = 0</span>
                            <span class="help-value">You collapse and are forced to rest. You'll wake up in a safe location.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Health &le; 20</span>
                            <span class="help-value">You faint from poor health. Triggered by cascading hunger/thirst penalties.</span>
                        </div>
                    </div>

                    <h3>Energy Max</h3>
                    <p>Your maximum energy is not fixed at 100 &mdash; it scales with your fitness level:</p>
                    <div class="help-formula">Energy Max = 80 + (Fitness &times; 0.2) <span class="help-note">clamped between 80&ndash;150</span></div>
                    <p>Improve fitness through exercise (yoga, dance, jogging, sports) to unlock more energy capacity.</p>

                    <h3>Notification Icons</h3>
                    <p>The top bar shows warning icons when a stat reaches a critical level:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Energy / Bed</span>
                            <span class="help-value">Appears when energy drops below 30% of your max.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Health / Mood</span>
                            <span class="help-value">Appears when the stat drops below 30.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hunger / Thirst / Bladder</span>
                            <span class="help-value">Appears when the stat reaches 70 or above.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Arousal</span>
                            <span class="help-value">Appears when arousal reaches 70 or above.</span>
                        </div>
                    </div>

                    <div class="help-tip">Mood has no passive hourly decay &mdash; it only changes through need penalties, social interactions, and story events. Keep your needs in check and your mood stays stable.</div>
                </div>
            `,

            stats: `
                <div class="help-article">
                    <h2>Stats & Looks</h2>
                    <p>Your character has derived stats that are calculated from multiple factors. Understanding these formulas helps you optimize your daily routine.</p>

                    <h3>Fitness</h3>
                    <div class="help-formula">Fitness = (Upper Body + Core + Lower Body + Cardio) / 4</div>
                    <p>Improve individual body stats through exercise. Physical skills (yoga, dance, sports) automatically grant stat bonuses at 25% of the skill gain.</p>

                    <h3>Looks</h3>
                    <p>Your overall appearance score that NPCs react to. Composed of multiple factors:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Beauty</span>
                            <span class="help-value"><strong>50%</strong> &mdash; Derived from fitness (28%), body appeal (25%), face care (20%), hair care (15%), dental care (12%).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Clothing</span>
                            <span class="help-value"><strong>20%</strong> &mdash; Your equipped outfit's total look score.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Makeup</span>
                            <span class="help-value"><strong>20%</strong> &mdash; Style level &times; quality. Fresh makeup = full score; smeared = reduced.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hygiene</span>
                            <span class="help-value"><strong>10%</strong> &mdash; Current hygiene level.</span>
                        </div>
                    </div>
                    <div class="help-tip">Face and dental care are critical: if their combined value is below 25, your beauty is multiplied by only 0.12 (88% reduction). Keep up your mirror routine!</div>

                    <h3>Confidence</h3>
                    <div class="help-formula">Confidence = Charisma &times; 0.5 + Looks &times; 0.3 <span class="help-note">clamped 0&ndash;100</span></div>

                    <h3>Skill Categories & Stat Connections</h3>
                    <p>Training skills grants automatic bonuses to related stats:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Physical</span>
                            <span class="help-value">Grants fitness body-part bonuses (25% of skill gain).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Mental</span>
                            <span class="help-value">Grants Intelligence bonus (10% of skill gain).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Social</span>
                            <span class="help-value">Grants Charisma bonus (10% of skill gain).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Creative</span>
                            <span class="help-value">Grants Creativity bonus (10% of skill gain).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Technical</span>
                            <span class="help-value">Grants Focus bonus (10% of skill gain).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Practical</span>
                            <span class="help-value">Grants Willpower bonus (10% of skill gain).</span>
                        </div>
                    </div>

                    <h3>Stat Multipliers</h3>
                    <p>Traits chosen during the prologue apply permanent multipliers to stat gains. A multiplier of 1.2&times; means you gain 20% more from every action. These stack multiplicatively with fitness multipliers for body stats.</p>
                </div>
            `,

            time: `
                <div class="help-article">
                    <h2>Time & Actions</h2>
                    <p>The game runs on a continuous clock. Every action you take advances time by a set number of minutes, and when minutes roll past a full hour, the need system kicks in automatically.</p>

                    <h3>How Time Works</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Time Display</span>
                            <span class="help-value">Current time, day of week, and date are shown in the top bar.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Actions</span>
                            <span class="help-value">Each action advances time (e.g., eating ~30 min, showering ~20 min, traveling varies by distance).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hour Rollover</span>
                            <span class="help-value">When accumulated minutes cross an hour boundary, hunger/thirst/bladder/hygiene/energy all update automatically.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Midnight</span>
                            <span class="help-value">Crossing midnight triggers a new day &mdash; daily trackers reset and overnight hunger (+30) is applied.</span>
                        </div>
                    </div>

                    <h3>Day Periods</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Morning</span>
                            <span class="help-value">06:00 &ndash; 11:59</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Afternoon</span>
                            <span class="help-value">12:00 &ndash; 17:59</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Evening</span>
                            <span class="help-value">18:00 &ndash; 21:59</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Night</span>
                            <span class="help-value">22:00 &ndash; 05:59</span>
                        </div>
                    </div>
                    <p>Some locations close at certain hours. If you're inside a closed location when time advances, you'll be moved outside automatically.</p>

                    <h3>Daily Routines</h3>
                    <p>Set up a morning routine at the mirror &mdash; makeup, hair cream, face cream, dental care. Once confirmed, you can apply the whole routine with one click each day.</p>

                    <h3>Alarm Clock</h3>
                    <p>Set separate alarms for weekdays and weekends from your bedroom. The alarm wakes you at the configured time automatically.</p>
                </div>
            `,

            phone: `
                <div class="help-article">
                    <h2>Phone</h2>
                    <p>Your phone is a central tool for communication, social media, and planning. Access it from the right bar &mdash; the notification badge shows your total unread count.</p>

                    <h3>Apps</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Messages</span>
                            <span class="help-value">Chat with contacts, receive story updates, arrange meetups, and discuss topics. Conversations can advance time.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Contacts</span>
                            <span class="help-value">View unlocked contacts. New contacts appear as you meet characters and progress through the story.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Fotogram</span>
                            <span class="help-value">Social media feed. Post photos, gain followers, and receive DMs. New posts have an engagement spike in the first hours.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Camera</span>
                            <span class="help-value">Take photos and videos for your gallery. Daily limits apply (default: 1 photo + 1 video per day).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Gallery</span>
                            <span class="help-value">Browse your saved photos and videos organized in folders.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Calendar</span>
                            <span class="help-value">Track appointments, scheduled events, and activities.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Finder</span>
                            <span class="help-value">Coming soon &mdash; a dating app feature currently in development.</span>
                        </div>
                    </div>

                    <div class="help-tip">Phone message topics can advance time but do NOT trigger the hourly need decay loop. Only actions that use the main time system (travel, activities) cause need changes.</div>
                </div>
            `,

            relationships: `
                <div class="help-article">
                    <h2>Relationships</h2>
                    <p>Build and manage relationships with the characters around you. Your choices and actions determine how these relationships evolve.</p>

                    <h3>Relationship Stats</h3>
                    <p>Each character has four core relationship stats, each with a <strong>level system</strong>:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-heart icon-16"></span> Love</span>
                            <span class="help-value">Romantic affection. Grows through intimate moments and romantic choices.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-users icon-16"></span> Friendship</span>
                            <span class="help-value">How close you are platonically. Built through conversations, shared activities, and helping each other.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-arousal icon-16"></span> Lust</span>
                            <span class="help-value">Physical attraction. Influenced by your appearance, outfit, and suggestive interactions.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label"><span class="icon icon-shield icon-16"></span> Trust</span>
                            <span class="help-value">How much a character trusts you. Required for deeper story scenes and sensitive choices.</span>
                        </div>
                    </div>

                    <h3>Level System</h3>
                    <p>Each relationship stat has both a <strong>value</strong> (0&ndash;100) and a <strong>level</strong>. When the value reaches the threshold for the current level (default: 100), the stat levels up &mdash; the value resets to 0 and the level increases. Each character can have a different max level (default: 5).</p>
                    <div class="help-tip">Higher levels unlock new dialogue options, scenes, and story paths. At max level, the value still accumulates up to a version cap but won't level up further.</div>

                    <h3>Interactions</h3>
                    <p>Talk to characters at their locations, message them on the phone, or encounter them during events. Each interaction can shift relationship values positively or negatively. The top bar's Relations link shows detailed stats for every known character.</p>
                </div>
            `,

            jobs: `
                <div class="help-article">
                    <h2>Jobs & Money</h2>
                    <p>Earn money through jobs to fund your lifestyle, buy clothes, and unlock new opportunities.</p>

                    <h3>Job System</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Finding Work</span>
                            <span class="help-value">Look for job openings at various locations in town.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Shifts</span>
                            <span class="help-value">Choose shift length (2, 4, 6, or 8 hours) limited by schedule and energy. Each shift advances time and affects your needs.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Daily Cap</span>
                            <span class="help-value">Maximum 8 hours of work per day (configurable per job).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Experience & Tiers</span>
                            <span class="help-value">Gain job experience to unlock higher pay tiers. Each tier has an XP threshold and increased hourly wage.</span>
                        </div>
                    </div>

                    <h3>Pay & Requirements</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Payday</span>
                            <span class="help-value">Wages are processed every <strong>Monday</strong>. Weekly earnings minus deductions go to your bank.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Minimum Hours</span>
                            <span class="help-value">Each job has a minimum weekly hour requirement. Failing to meet it triggers warnings and can get you fired.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Work Notification</span>
                            <span class="help-value">A work icon appears in the top bar when you have a job, haven't met daily hours, and the workplace is open.</span>
                        </div>
                    </div>

                    <h3>Money</h3>
                    <p>Your money is split between <strong>cash</strong> and <strong>bank</strong>. The right bar shows the total &mdash; hover over it to see the breakdown. Spend your earnings at shops, restaurants, and other locations around town.</p>
                </div>
            `,

            quests: `
                <div class="help-article">
                    <h2>Quests</h2>
                    <p>Quests are multi-step story arcs that guide your progression. They range from personal goals to character-specific storylines.</p>

                    <h3>How Quests Work</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Activation</span>
                            <span class="help-value">Quests activate automatically when you meet certain conditions or visit specific locations.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Stages</span>
                            <span class="help-value">Each quest has multiple stages. Complete objectives to advance.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Journal</span>
                            <span class="help-value">Open the Journal from the top bar to review active and completed quests.</span>
                        </div>
                    </div>

                    <div class="help-tip">Quest notifications appear as golden prompts. Pay attention to them for important story progression.</div>
                </div>
            `,

            map: `
                <div class="help-article">
                    <h2>Map & Travel</h2>
                    <p>The interactive map lets you explore the world, check location details, and plan your routes.</p>

                    <h3>Map Structure</h3>
                    <p>The world is organized in a hierarchy. Click into each level to explore deeper:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Regions</span>
                            <span class="help-value">Top-level districts of the town. Each region button opens a detailed area view.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Areas</span>
                            <span class="help-value">Sub-regions within a district. May contain further sub-areas or individual locations.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Locations</span>
                            <span class="help-value">Specific places &mdash; shops, restaurants, homes, parks. Shows known residents and child locations (stores, rooms).</span>
                        </div>
                    </div>
                    <p>Use the back button to navigate up the hierarchy. Location detail views show known characters associated with that place and any shops or sub-locations inside.</p>

                    <h3>Discovery</h3>
                    <p>Not all locations are visible from the start. New places are discovered through story progression, quests, and exploration. Undiscovered locations won't appear on the map or in navigation cards until their discovery flag is triggered.</p>

                    <h3>Travel Time</h3>
                    <p>Moving between locations via navigation cards advances time. The amount depends on distance:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Same Location</span>
                            <span class="help-value"><span class="help-stat-change good">0 min</span></span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Room to Room</span>
                            <span class="help-value"><span class="help-stat-change good">1 min</span> &mdash; Moving within the same building (e.g., bedroom &rarr; kitchen).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Same District</span>
                            <span class="help-value"><span class="help-stat-change bad">5 min</span> &mdash; Walking to a nearby location in the same area.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Different District</span>
                            <span class="help-value"><span class="help-stat-change bad">15 min</span> &mdash; Traveling across town to another district.</span>
                        </div>
                    </div>
                    <div class="help-tip">Travel time feeds into the need system. While a single 5-minute walk won't trigger hourly decay, accumulated minutes from multiple actions will eventually cross the hour boundary and update all needs.</div>

                    <h3>Location Hours</h3>
                    <p>Many locations have operating hours &mdash; shops, restaurants, and workplaces close at night. Some locations support overnight hours (e.g., a bar open from 20:00 to 02:00).</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Closed Badge</span>
                            <span class="help-value">Navigation cards show a "Closed" badge and appear greyed out when the location is outside operating hours.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Auto-Exit</span>
                            <span class="help-value">If time advances while you're inside a closing location, you'll be moved to the nearest outdoor area with a notification.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">24/7 Locations</span>
                            <span class="help-value">Some places (like your home) are always accessible regardless of the time.</span>
                        </div>
                    </div>

                    <h3>Navigation Cards</h3>
                    <p>At each location, available destinations appear as visual cards. Hover to see their full image. Cards can be in different states:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Open</span>
                            <span class="help-value">Click to travel there. Time advances based on distance.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Closed</span>
                            <span class="help-value">Greyed out &mdash; outside operating hours. Clicking shows when it opens.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Locked</span>
                            <span class="help-value">Blocked by outfit requirements, stat gates, or story conditions.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hidden</span>
                            <span class="help-value">Not yet discovered &mdash; doesn't appear in the card list at all.</span>
                        </div>
                    </div>
                </div>
            `,

            wardrobe: `
                <div class="help-article">
                    <h2>Wardrobe</h2>
                    <p>Your outfit directly affects your Looks score, social interactions, and access to locations. The wardrobe system tracks what you wear, how dirty it gets, and its condition over time.</p>

                    <h3>Clothing Slots</h3>
                    <p>Your character has multiple equipment slots. Some items interact with each other:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Main Slots</span>
                            <span class="help-value">Top, Bottom, Shoes, Socks, Coat, Bag</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Underwear</span>
                            <span class="help-value">Bra, Panty, Garter</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Special</span>
                            <span class="help-value">Dress (replaces top + bottom), Bodysuit, Swimsuit, Sleepwear, Apron</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Accessories</span>
                            <span class="help-value">Jewelry slots for additional style points.</span>
                        </div>
                    </div>
                    <div class="help-tip">Equipping a dress automatically unequips your top and bottom. Similarly, a bodysuit or swimsuit replaces your bra and panty.</div>

                    <h3>Clothing Score & Looks</h3>
                    <p>Each clothing item has a base looks value. Your total clothing score is the sum of all equipped items' effective looks, which feeds into the Looks formula (20% weight).</p>

                    <h3>Dirt & Wear System</h3>
                    <p>Clothes get dirty and worn over time while equipped:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Dirt Rate</span>
                            <span class="help-value"><span class="help-stat-change bad">+0.02 / min</span> &mdash; Accumulates while the item is worn (~1.2 per hour).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Looks Penalty</span>
                            <span class="help-value">Effective looks = Base looks &times; (1 &minus; dirt / 150). At dirt 75, you lose 50% of the item's looks.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Laundry</span>
                            <span class="help-value">Items with dirt above 60 are automatically moved to the laundry basket.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Durability</span>
                            <span class="help-value">Items lose durability over time from wear. Extended use degrades them.</span>
                        </div>
                    </div>

                    <h3>Outfit Requirements</h3>
                    <p>Some locations, events, and interactions have clothing requirements:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Exposure</span>
                            <span class="help-value">How much skin your outfit shows. Some places require modest clothing.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Sexiness</span>
                            <span class="help-value">How provocative your outfit appears. Affects NPC reactions and scene availability.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Confidence</span>
                            <span class="help-value">Some outfits require a minimum confidence stat. Dirty or damaged items increase this requirement.</span>
                        </div>
                    </div>

                    <h3>Shopping</h3>
                    <p>Buy new clothes at the mall and shops around town. Items are organized by category with tooltip previews showing looks, exposure, and sexiness values. Some items have stat or confidence requirements before purchase.</p>
                </div>
            `,

            body: `
                <div class="help-article">
                    <h2>Body & Weight</h2>
                    <p>Your character's body changes over time based on diet and exercise. The body system tracks weight, BMI, body fat, muscle mass, and derives a body type from these values.</p>

                    <h3>Weight & Calories</h3>
                    <p>Weight is updated daily based on your net calorie balance (calories eaten minus basal metabolic rate):</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Basal Rate</span>
                            <span class="help-value">Your body burns ~2000 calories per day naturally.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Weight Gain</span>
                            <span class="help-value">Every +2000 net calories &rarr; <span class="help-stat-change bad">+0.3 kg</span>. Stored as body fat.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Weight Loss</span>
                            <span class="help-value">Every &minus;2000 net calories &rarr; <span class="help-stat-change good">&minus;0.3 kg</span>. 70% from fat, 30% from muscle.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Minimum Weight</span>
                            <span class="help-value">Weight cannot drop below 40 kg.</span>
                        </div>
                    </div>
                    <div class="help-tip">Calorie tracking must be enabled in Game Settings for weight to change. Eating at restaurants, consuming snacks, and family meals all contribute to daily calorie intake.</div>

                    <h3>BMI & Body Type</h3>
                    <div class="help-formula">BMI = Weight / (Height in meters)&sup2;</div>
                    <p>Your body type is determined by BMI combined with muscle mass and body proportions:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Slim</span>
                            <span class="help-value">BMI &lt; 18.5</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Normal</span>
                            <span class="help-value">BMI 18.5&ndash;24.9 with low muscle mass</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Athletic</span>
                            <span class="help-value">BMI 18.5&ndash;29.9 with muscle mass &gt; 45 (or &gt; 50 for higher BMI)</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Curvy</span>
                            <span class="help-value">BMI 22&ndash;29.9 with bust &gt; 95 or hips &gt; 100</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Thick</span>
                            <span class="help-value">BMI 25&ndash;29.9 without qualifying proportions</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Chubby</span>
                            <span class="help-value">BMI &ge; 30</span>
                        </div>
                    </div>
                    <div class="help-tip">Body type changes require the "Body Degradation" setting to be enabled. Your body type affects appearance and certain story interactions.</div>
                </div>
            `,

            skillDecay: `
                <div class="help-article">
                    <h2>Skill Decay</h2>
                    <p>Skills you don't practice will gradually deteriorate. The decay system uses a hybrid algorithm based on skill category, skill level, and recent usage.</p>

                    <h3>How It Works</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Usage Protection</span>
                            <span class="help-value">Using a skill resets its decay timer. Skills used within the last <strong>7 days</strong> are fully protected from decay.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Daily Check</span>
                            <span class="help-value">Decay is evaluated once per day (at midnight). Skills at 0 cannot decay further.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Notification</span>
                            <span class="help-value">When a skill decays, you'll see a warning: <em>"Cooking &minus;1 (Decay)"</em></span>
                        </div>
                    </div>

                    <h3>Category Decay Rates</h3>
                    <p>Each skill category has a base decay interval &mdash; the number of days of inactivity before 1 point is lost:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Mental / Technical</span>
                            <span class="help-value"><span class="help-stat-change good">10 days</span> &mdash; slowest decay</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Social / Creative</span>
                            <span class="help-value"><span class="help-stat-change warning">7 days</span> &mdash; moderate decay</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Physical / Practical</span>
                            <span class="help-value"><span class="help-stat-change bad">5 days</span> &mdash; fastest decay</span>
                        </div>
                    </div>

                    <h3>Level Multiplier</h3>
                    <p>Your skill level modifies the base decay rate:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Beginner (0&ndash;30)</span>
                            <span class="help-value">&times;0.7 &mdash; decays <strong>faster</strong> (e.g., 10 &times; 0.7 = 7 days)</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Intermediate (31&ndash;70)</span>
                            <span class="help-value">&times;1.0 &mdash; standard rate</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Expert (71+)</span>
                            <span class="help-value">&times;1.5 &mdash; decays <strong>slower</strong> (e.g., 10 &times; 1.5 = 15 days)</span>
                        </div>
                    </div>
                    <div class="help-tip">Skill decay can be toggled off entirely in Game Settings. If you want to keep a skill sharp, just use it at least once every 7 days.</div>
                </div>
            `,

            grooming: `
                <div class="help-article">
                    <h2>Mirror & Grooming</h2>
                    <p>The mirror is your grooming hub. Access it from any bathroom to maintain your appearance. Neglecting grooming causes daily decay that directly impacts your Looks score.</p>

                    <h3>Mirror Actions</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Comb Hair</span>
                            <span class="help-value">Tidies your hair for the day. Requires a <strong>Comb</strong> in inventory. Resets after sleeping.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Apply Hair Cream</span>
                            <span class="help-value">Prevents hair care decay for the day. Requires <strong>Hair Cream</strong> in inventory.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Face Care</span>
                            <span class="help-value">Prevents face care decay for the day. Requires <strong>Face Cream</strong> in inventory.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Dental Care</span>
                            <span class="help-value">Prevents dental care decay for the day. Requires <strong>Toothpaste</strong> in inventory.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Makeup</span>
                            <span class="help-value">Apply or remove makeup. Requires a <strong>Makeup Kit</strong> or <strong>Portable Makeup</strong> in inventory.</span>
                        </div>
                    </div>

                    <h3>Care Decay</h3>
                    <p>If you skip your daily care routine, each care stat drops by <span class="help-stat-change bad">&minus;4 per day</span>:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Hair Care</span>
                            <span class="help-value">Decays daily unless Hair Cream is applied. Affects 15% of your Beauty score.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Face Care</span>
                            <span class="help-value">Decays daily unless Face Cream is applied. Affects 20% of your Beauty score.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Dental Care</span>
                            <span class="help-value">Decays daily unless Toothpaste is used. Affects 12% of your Beauty score.</span>
                        </div>
                    </div>
                    <div class="help-tip">If combined face + dental care drops below 25, your entire Beauty score is multiplied by just 0.12 &mdash; an 88% reduction. Never skip the basics!</div>

                    <h3>Routine System</h3>
                    <p>Instead of doing each action individually, you can set up a <strong>Morning Routine</strong>:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Configure</span>
                            <span class="help-value">Open Mirror &rarr; Routine Settings to choose which actions to include (comb, hair cream, face cream, dental care, makeup level).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Apply</span>
                            <span class="help-value">Once confirmed, an "Apply Routine" button appears. One click does everything in your routine.</span>
                        </div>
                    </div>

                    <h3>Bathroom</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Use Toilet</span>
                            <span class="help-value">Empties your bladder.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Wash Face</span>
                            <span class="help-value">Quick hygiene boost without a full shower.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Shower</span>
                            <span class="help-value">Full hygiene restore. Removes makeup if wearing any.</span>
                        </div>
                    </div>
                </div>
            `,

            reputation: `
                <div class="help-article">
                    <h2>Reputation</h2>
                    <p>Your reputation tracks how people in different parts of town perceive you. Actions in one area can spread to connected neighborhoods.</p>

                    <h3>Regions</h3>
                    <p>The town is divided into regions, each tracking your reputation independently:</p>
                    <div class="help-needs-grid">
                        <div class="help-need-card">
                            <div class="help-need-header"><span>Home &amp; Maplewood</span></div>
                            <p>Family neighborhood. Connected to Downtown, Old Town, Sunset Park.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header"><span>Downtown &amp; Hillcrest</span></div>
                            <p>Business and upscale areas. Connected to University, Marina Bay, Red Light.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header"><span>Old Town &amp; Southside</span></div>
                            <p>Historic and working-class areas. Connected to Suburbs, University.</p>
                        </div>
                        <div class="help-need-card">
                            <div class="help-need-header"><span>Suburbs &amp; University</span></div>
                            <p>Outskirts and campus. Connected to Southside, Downtown.</p>
                        </div>
                    </div>

                    <h3>Categories</h3>
                    <p>Reputation is tracked across several categories:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label" style="color:#22c55e">Athlete</span>
                            <span class="help-value">Local &mdash; built through sports and fitness activities in that area.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#a855f7">Model</span>
                            <span class="help-value">Global &mdash; modeling work spreads to all regions.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#3b82f6">Social Media</span>
                            <span class="help-value">Global &mdash; online presence is visible everywhere.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#ec4899">Camgirl</span>
                            <span class="help-value">Global &mdash; internet-based, spreads everywhere.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#f59e0b">Stripper</span>
                            <span class="help-value">Local &mdash; reputation stays in nearby areas.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#ef4444">Escort / Porn</span>
                            <span class="help-value">Escort is local; Porn is global.</span>
                        </div>
                    </div>

                    <h3>Rumor Spreading</h3>
                    <p>Local reputation gains <strong>spread to connected regions at 50% strength</strong>. If you gain +10 Stripper reputation in Downtown, connected regions (Maplewood, Hillcrest, Red Light, University) receive +5.</p>

                    <h3>Reputation Tiers</h3>
                    <p>Your overall reputation score in a region determines your tier:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label" style="color:#4ade80">Pure</span>
                            <span class="help-value">0&ndash;12 &mdash; Clean reputation.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#60a5fa">Good Girl</span>
                            <span class="help-value">13&ndash;25</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#f472b6">Flirty</span>
                            <span class="help-value">26&ndash;40</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#fbbf24">Known</span>
                            <span class="help-value">56&ndash;70</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#fb923c">Easy</span>
                            <span class="help-value">71&ndash;85</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label" style="color:#f87171">Slut</span>
                            <span class="help-value">86&ndash;95</span>
                        </div>
                    </div>

                    <h3>Character Opinion</h3>
                    <p>Individual characters also track their own <strong>awareness</strong> of you (0&ndash;100). Certain actions increase awareness (e.g., being caught, visible proof). Characters may set permanent flags like "sawProof" or "caughtSneaking" that affect future interactions.</p>
                </div>
            `,

            activities: `
                <div class="help-article">
                    <h2>Daily Life</h2>
                    <p>Your day is filled with activities that affect your stats, skills, and relationships. Most activities have requirements and daily limits.</p>

                    <h3>Activity Requirements</h3>
                    <p>Activities can require any combination of:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Outfit</span>
                            <span class="help-value">Specific clothing style (e.g., sporty outfit with 2+ pieces for Yoga).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Inventory Item</span>
                            <span class="help-value">Specific item needed (e.g., Yoga Mat for yoga).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Min/Max Stat</span>
                            <span class="help-value">Minimum energy, confidence, or other stats required.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Character Present</span>
                            <span class="help-value">Some activities require another character at the location.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Daily Limit</span>
                            <span class="help-value">Many activities can only be done once per day. The button shows "Already done today" when used.</span>
                        </div>
                    </div>

                    <h3>Sleep & Rest</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Sleep</span>
                            <span class="help-value">Choose 6&ndash;9 hours. Recovers energy (scales with duration), reduces stress, restores health. Hair becomes uncombed.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Nap</span>
                            <span class="help-value">Quick rest: 15, 30, 45, or 60 minutes. Available on bed or couch.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Early Wake</span>
                            <span class="help-value">If your energy fills before the chosen duration, you wake up early automatically.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Alarm</span>
                            <span class="help-value">Set separate weekday/weekend alarms. If alarm is earlier than your full sleep, it wakes you at the set time.</span>
                        </div>
                    </div>
                    <div class="help-formula">Sleep Recovery: Energy = EnergyMax &times; (duration / 480) <span class="help-note">8 hours = full recovery</span></div>

                    <h3>Eating & Restaurants</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Restaurants</span>
                            <span class="help-value">Order 1 food + 1 drink per visit. Each dish has stat effects (hunger, thirst, energy, mood) and a calorie count. Pay with cash or card.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Inventory Food</span>
                            <span class="help-value">Use consumables like sandwiches, energy drinks, or water bottles directly from your inventory anywhere.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Family Meals</span>
                            <span class="help-value">Eat with family during meal windows: Breakfast (7&ndash;8), Lunch (12&ndash;13), Dinner (18&ndash;19). Requires a family member present at your location.</span>
                        </div>
                    </div>

                    <h3>Reading</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Books</span>
                            <span class="help-value">Multi-session reads with page tracking. Grant skill/stat bonuses on completion.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Magazines</span>
                            <span class="help-value">Single-use reads. Grant immediate stat bonuses and are consumed after reading.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Reading Speed</span>
                            <span class="help-value">Based on your mental stats: Speed = 1 + (INT &times; 0.004) + (Focus &times; 0.003) + (Willpower &times; 0.002).</span>
                        </div>
                    </div>

                    <h3>Inventory</h3>
                    <p>Items are organized into categories:</p>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Consumables</span>
                            <span class="help-value">Food, drinks, snacks. Used directly for instant stat effects.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Cosmetics</span>
                            <span class="help-value">Comb, creams, makeup, perfume, wet wipes. Used at the mirror or directly. Some have limited uses per purchase.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Tools</span>
                            <span class="help-value">Umbrella, webcam, laptop. Passive items &mdash; owning them enables features.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Equipment</span>
                            <span class="help-value">Yoga mat and fitness gear. Required for specific activities.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Books &amp; Magazines</span>
                            <span class="help-value">Reading materials. Books track progress; magazines are single-use.</span>
                        </div>
                    </div>
                </div>
            `,

            settings: `
                <div class="help-article">
                    <h2>Game Settings</h2>
                    <p>Many simulation systems can be toggled on or off during the prologue or from the settings menu. This lets you customize the complexity of your playthrough.</p>

                    <h3>Basic Needs</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Track Hunger</span>
                            <span class="help-value">Hunger increases hourly and triggers penalties when high.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Track Thirst</span>
                            <span class="help-value">Thirst increases hourly with focus/energy penalties.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Track Bladder</span>
                            <span class="help-value">Bladder fills over time. Exceeding 100 causes stress.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Track Calories</span>
                            <span class="help-value">Food adds calories; net balance affects weight daily.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hygiene Requirement</span>
                            <span class="help-value">Hygiene decays hourly and impacts Looks when low.</span>
                        </div>
                    </div>

                    <h3>Appearance Changes</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Hair Growth</span>
                            <span class="help-value">Hair length increases over time.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Hair Messiness</span>
                            <span class="help-value">Hair gets messy without combing.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Body Hair Growth</span>
                            <span class="help-value">Body hair grows and may need grooming.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Makeup Wear Off</span>
                            <span class="help-value">Makeup quality degrades over time after application.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Body Degradation</span>
                            <span class="help-value">BMI, body fat, and muscle mass change with diet/exercise.</span>
                        </div>
                    </div>

                    <h3>Care Decay</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Hair Care Decay</span>
                            <span class="help-value">Hair care drops &minus;4/day without hair cream.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Face Care Decay</span>
                            <span class="help-value">Skincare drops &minus;4/day without face cream.</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Dental Care Decay</span>
                            <span class="help-value">Teeth care drops &minus;4/day without toothpaste.</span>
                        </div>
                    </div>

                    <h3>Decay Systems</h3>
                    <div class="help-info-block">
                        <div class="help-info-row">
                            <span class="help-label">Skill Decay</span>
                            <span class="help-value">Unused skills lose points over time (see Skill Decay section for details).</span>
                        </div>
                        <div class="help-info-row">
                            <span class="help-label">Relationship Decay</span>
                            <span class="help-value">Neglected relationships gradually lose value over time.</span>
                        </div>
                    </div>

                    <div class="help-tip">All settings default to ON. Disabling systems simplifies gameplay but removes depth. You can adjust these during the prologue's settings page or from the in-game menu.</div>
                </div>
            `,
        },

        open: function () {
            this.activeSection = 'basics';
            this.render();
        },

        render: function () {
            $('#help-overlay').remove();

            const sidebarItems = this.sections.map(s =>
                `<div class="help-sidebar-item ${s.id === this.activeSection ? 'active' : ''}" data-section="${s.id}">
                    <span class="icon ${s.icon} icon-18"></span>
                    <span>${s.label}</span>
                </div>`
            ).join('');

            const html = `
                <div id="help-overlay" class="overlay overlay-dark modal-overlay active" data-modal="help-modal">
                    <div class="modal help-modal">
                        <div class="modal-header">
                            <div class="modal-title">Help & Guide</div>
                            <button class="close-btn" id="help-close">
                                <span class="icon icon-close icon-18"></span>
                            </button>
                        </div>
                        <div class="help-body">
                            <div class="help-sidebar">
                                ${sidebarItems}
                            </div>
                            <div class="help-content">
                                ${this.content[this.activeSection]}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.API.$('body').append(html);
            this.API.$('body').addClass('modal-open');
            this.attachEvents();
        },

        attachEvents: function () {
            const self = this;

            $('#help-close').on('click', () => self.close());

            $('#help-overlay').on('click', function (e) {
                if ($(e.target).attr('id') === 'help-overlay') {
                    self.close();
                }
            });

            $('.help-sidebar-item').on('click', function () {
                const sectionId = $(this).data('section');
                self.switchSection(sectionId);
            });
        },

        switchSection: function (sectionId) {
            if (!this.content[sectionId]) return;
            this.activeSection = sectionId;

            $('.help-sidebar-item').removeClass('active');
            $(`.help-sidebar-item[data-section="${sectionId}"]`).addClass('active');

            $('.help-content').html(this.content[sectionId]);
        },

        close: function () {
            $('#help-overlay').remove();
            this.API.$('body').removeClass('modal-open');
        }
    };
};
