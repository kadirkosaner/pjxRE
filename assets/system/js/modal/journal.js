// journal.js - Player Journal System V3
window.JournalInit = function (API) {
  window.JournalSystem = {
    API: API,

    // ============================================
    // HELPERS
    // ============================================

    formatTitle: function (str) {
      return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, function (str) {
          return str.toUpperCase();
        })
        .trim();
    },

    createTimelineItem: function (title, content) {
      if (!content) return "";
      const text =
        typeof content === "object" && content !== null
          ? content.desc || content.name || JSON.stringify(content)
          : content;
      return `
                <div class="timeline-item">
                    <div class="timeline-title">${title}</div>
                    <div class="timeline-content">${text}</div>
                </div>
            `;
    },

    createMilestone: function (key, value) {
      const title = this.formatTitle(key);
      const isUnlocked = value !== null;
      const icon = isUnlocked ? "check" : "lock";
      // Show the actual value if it's a string, otherwise show "Unlocked"
      const status = isUnlocked
        ? typeof value === "string"
          ? value
          : "Unlocked"
        : "Locked";

      return `
                <div class="milestone-card ${isUnlocked ? "unlocked" : ""}">
                    <div class="milestone-icon"><i class="icon icon-${icon}"></i></div>
                    <div class="milestone-details">
                        <div class="milestone-title">${title}</div>
                        <div class="milestone-status">${status}</div>
                    </div>
                </div>
            `;
    },

    createReputationBar: function (label, value) {
      return `
                <div class="reputation-item">
                    <div class="reputation-header">
                        <span>${this.formatTitle(label)}</span>
                        <span>${value}/100</span>
                    </div>
                    <div class="reputation-bar">
                        <div class="reputation-fill" style="width: ${Math.min(
                          100,
                          Math.max(0, value)
                        )}%;"></div>
                    </div>
                </div>
            `;
    },

    // ============================================
    // REPUTATION SYSTEM HELPERS
    // ============================================

    getOverallScore: function(regionData) {
        if (!regionData) return 0;
        let total = 0, count = 0;
        for (const cat in regionData) {
            total += regionData[cat] || 0;
            count++;
        }
        return count > 0 ? Math.round(total / count) : 0;
    },

    getTierInfo: function(score) {
        const tiers = this.API.setup.reputationTiers || [
            { min: 0, max: 12, id: "pure", name: "Pure", color: "#4ade80" },
            { min: 13, max: 25, id: "good", name: "Good Girl", color: "#60a5fa" },
            { min: 26, max: 40, id: "flirty", name: "Flirty", color: "#f472b6" },
            { min: 41, max: 55, id: "normal", name: "Normal", color: "#9ca3af" },
            { min: 56, max: 70, id: "known", name: "Known", color: "#fbbf24" },
            { min: 71, max: 85, id: "easy", name: "Easy", color: "#fb923c" },
            { min: 86, max: 95, id: "slut", name: "Slut", color: "#f87171" },
            { min: 96, max: 100, id: "prostitution", name: "Prostitution", color: "#ff6b6b" }
        ];
        for (const tier of tiers) {
            if (score >= tier.min && score <= tier.max) return tier;
        }
        return tiers[0];
    },

    getCategoryColor: function(catId) {
        const colors = {
            athlete: "#22c55e",
            model: "#a855f7",
            camgirl: "#ec4899",
            stripper: "#f59e0b",
            escort: "#ef4444",
            porn: "#ef4444",
            socialMedia: "#3b82f6"
        };
        return colors[catId] || "#ec4899";
    },

    // Create stat row for reputation category (matches stats.js pattern)
    createRepStatRow: function(label, value, color) {
        const percentage = Math.min(100, Math.max(0, value));
        return `
            <div class="stat-row">
                <div class="stat-label-container">
                    <span class="stat-label">${label}</span>
                </div>
                <div class="stat-bar-wrapper">
                    <div class="stat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
                <div class="stat-value-text">${Math.round(value)}/100</div>
            </div>
        `;
    },

    // Create region accordion using stat-group pattern
    buildRegionAccordion: function(regionId, regionData, isExpanded) {
        const regionInfo = this.API.setup.regionInfo?.[regionId] || { name: this.formatTitle(regionId), subtitle: '' };
        const overall = this.getOverallScore(regionData);
        const tier = this.getTierInfo(overall);
        const categories = this.API.setup.reputationCategories || {
            athlete: { name: "Athlete" },
            model: { name: "Model" },
            camgirl: { name: "Camgirl" },
            stripper: { name: "Stripper" },
            escort: { name: "Escort" },
            porn: { name: "Porn" },
            socialMedia: { name: "Social Media" }
        };

        let catRowsHtml = '';
        for (const catId in categories) {
            const catInfo = categories[catId];
            const value = regionData?.[catId] || 0;
            catRowsHtml += this.createRepStatRow(catInfo.name, value, this.getCategoryColor(catId));
        }

        return `
            <div class="stat-group ${isExpanded ? 'expanded' : ''}" id="rep-group-${regionId}">
                <div class="stat-group-header" onclick="$(this).parent().toggleClass('expanded')">
                    <div class="stat-group-icon"><i class="icon icon-map-pin"></i></div>
                    <div class="stat-group-title">
                        ${regionInfo.name}
                        <span style="font-weight: 400; font-size: 12px; color: var(--color-text-tertiary); margin-left: 8px;">${regionInfo.subtitle}</span>
                    </div>
                    <span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${tier.color}22; color: ${tier.color}; margin-right: 12px;">${tier.name}</span>
                    <span style="font-size: 14px; font-weight: 600; color: var(--color-accent); margin-right: 12px;">${overall}</span>
                    <i class="icon icon-chevron-down stat-group-toggle"></i>
                </div>
                <div class="stat-group-content">
                    ${catRowsHtml}
                </div>
            </div>
        `;
    },

    buildReputationContent: function(vars) {
        const reputation = vars.reputation || {};
        
        // Region order with their discovered variable names
        const regions = [
            { id: 'home', discoveredVar: 'discoveredFamilyHouse' },
            { id: 'maplewood', discoveredVar: 'discoveredMaplewood' },
            { id: 'downtown', discoveredVar: 'discoveredDownTown' },
            { id: 'hillcrest', discoveredVar: 'discoveredHillcrest' },
            { id: 'marinaBay', discoveredVar: 'discoveredMarinaBay' },
            { id: 'oldTown', discoveredVar: 'discoveredOldTown' },
            { id: 'universityDistrict', discoveredVar: 'discoveredUniversityDistrict' },
            { id: 'southside', discoveredVar: 'discoveredSouthside' },
            { id: 'suburbs', discoveredVar: 'discoveredSuburbs' },
            { id: 'redLightCenter', discoveredVar: 'discoveredRedLightCenter' }
        ];
        
        // Default region data for missing regions
        const defaultRegionData = { athlete: 0, model: 0, camgirl: 0, stripper: 0, escort: 0, porn: 0, socialMedia: 0 };
        
        let accordionsHtml = '';
        let firstExpanded = true;
        
        regions.forEach((region) => {
            // Only show if discovered
            if (vars[region.discoveredVar]) {
                const regionData = reputation[region.id] || defaultRegionData;
                accordionsHtml += this.buildRegionAccordion(region.id, regionData, firstExpanded);
                firstExpanded = false;
            }
        });

        if (!accordionsHtml) {
            accordionsHtml = '<p style="color: var(--color-text-tertiary); text-align: center; padding: 40px;">No regions discovered yet.</p>';
        }

        return `
            <div class="stats-view">
                <div class="stats-accordion">
                    ${accordionsHtml}
                </div>
            </div>
        `;
    },

    // New Helper: Record row
    createRecordRow: function (label, value) {
      return `
                <div class="record-stat-row">
                    <span class="record-label">${label}</span>
                    <span class="record-value">${value}</span>
                </div>
            `;
    },

    // New Helper: Record Group
    createRecordGroup: function (title, icon, content) {
      return `
                <div class="record-group">
                    <div class="record-group-title"><i class="icon icon-${icon}"></i> ${title}</div>
                    ${content}
                </div>
            `;
    },

    // Helper: Virginity Status Row (for Intimacy Logs)
    createVirginityRow: function (label, data) {
      const isIntact = data?.intact ?? true;
      if (isIntact) {
        return `
                    <div class="record-stat-row">
                        <span class="record-label">${label}</span>
                        <span class="record-value">Virgin</span>
                    </div>
                `;
      } else {
        const tooltip = `Taken by ${data?.takenByName || "Unknown"}${
          data?.date ? " on " + data.date : ""
        }`;
        return `
                    <div class="record-stat-row">
                        <span class="record-label">${label}</span>
                        <span class="record-value">
                            Taken <i class="icon icon-info virginity-info-icon" data-tooltip="${tooltip}"></i>
                        </span>
                    </div>
                `;
      }
    },

    // ============================================
    // MODAL RENDER
    // ============================================

    open: function () {
      const vars = this.API.State.variables;
      const firsts = vars.firsts || {};
      const reputation = vars.reputation || {};
      const counts = vars.sexual?.counts || {};
      const totalPartners = vars.sexual?.totalPartners || 0;
      const money = vars.money || 0;

      // Quest System V2 Support
      const questState = vars.questState || { active: {}, completed: [] };
      const questDatabase = this.API.setup.quests || {};
      
      const activeQuestIds = Object.keys(questState.active);
      const completedQuestIds = questState.completed || [];
      const allQuestIds = [...activeQuestIds, ...completedQuestIds];

      // Helper: Render compact quest list item
      const renderQuestListItem = (qid, status, index) => {
        const quest = questDatabase[qid];
        if (!quest) return '';
        
        const state = status === 'active' ? questState.active[qid] : null;
        const isSelected = index === 0;
        
        return `
          <div class="quest-list-item ${isSelected ? 'selected' : ''}" 
               data-quest-id="${qid}"
               data-status="${status}">
            <div class="quest-list-icon">
              ${status === 'active' ? '<i class="icon icon-alert"></i>' : '<i class="icon icon-check"></i>'}
            </div>
            <div class="quest-list-content">
              <div class="quest-list-title">${quest.title}</div>
            </div>
          </div>
        `;
      };

      // Helper: Render quest detail panel
      const renderQuestDetail = (qid, status) => {
        const quest = questDatabase[qid];
        if (!quest) return '<div class="quest-detail-placeholder">Quest not found</div>';
        
        const state = status === 'active' ? questState.active[qid] : null;
        const stage = state ? quest.stages?.[state.stage] : null;
        
        // Build objectives HTML
        let objectivesHtml = '';
        if (stage?.objectives) {
          objectivesHtml = `
            <div class="quest-objectives-section">
              <h4>Objectives</h4>
              <div class="quest-objectives">
                ${stage.objectives.map(obj => `
                  <div class="quest-objective ${state.objectives[obj.id] ? 'completed' : ''}">
                    <i class="icon icon-${state.objectives[obj.id] ? 'check' : 'circle'} icon-12"></i>
                    ${obj.text}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        // Build stages history for completed quests
        let stagesHistoryHtml = '';
        if (status === 'completed' && quest.stages) {
          stagesHistoryHtml = `
            <div class="quest-stages-history">
              <h4>Quest Stages</h4>
              ${quest.stages.map((stg, idx) => `
                <div class="quest-stage-item completed">
                  <div class="quest-stage-number">${idx + 1}</div>
                  <div class="quest-stage-info">
                    <div class="quest-stage-title">${stg.title}</div>
                    <div class="quest-stage-desc">${stg.desc || ''}</div>
                  </div>
                  <i class="icon icon-check quest-stage-check"></i>
                </div>
              `).join('')}
            </div>
          `;
        }
        
        // Build stages history for active quests (newest first: 4, 3, 2, 1)
        let activeStagesHistoryHtml = '';
        if (status === 'active' && quest.stages && state) {
          const currentStageIndex = state.stage;
          const stagesSlice = quest.stages.slice(0, currentStageIndex + 1);
          activeStagesHistoryHtml = `
            <div class="quest-stages-history">
              <h4>Quest Progress</h4>
              ${stagesSlice.slice().reverse().map((stg, reversedIdx) => {
                const originalIdx = currentStageIndex - reversedIdx;
                const isCompleted = originalIdx < currentStageIndex;
                const isCurrent = originalIdx === currentStageIndex;
                return `
                  <div class="quest-stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="quest-stage-number">${originalIdx + 1}</div>
                    <div class="quest-stage-info">
                      <div class="quest-stage-title">${stg.title}</div>
                      <div class="quest-stage-desc">${stg.desc || ''}</div>
                    </div>
                    ${isCompleted ? '<i class="icon icon-check quest-stage-check"></i>' : ''}
                    ${isCurrent ? '<i class="icon icon-circle quest-stage-current"></i>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        return `
          <div class="quest-detail-content">
            <div class="quest-detail-header">
              <h2>${quest.title}</h2>
            </div>
            
            ${status === 'active' ? `
              ${activeStagesHistoryHtml}
              
              ${objectivesHtml}
            ` : `
              <div class="quest-completed-info">
                <i class="icon icon-check-circle icon-24"></i>
                <span>Quest Completed</span>
              </div>
              
              ${stagesHistoryHtml}
            `}
          </div>
        `;
      };

      // Generate quest lists HTML for each tab
      // For All tab: active quests first, then completed in reverse order (newest first)
      const allQuestsListHtml = allQuestIds.length > 0
        ? [...activeQuestIds, ...[...completedQuestIds].reverse()].map((qid, i) => {
            const status = activeQuestIds.includes(qid) ? 'active' : 'completed';
            return renderQuestListItem(qid, status, i);
          }).join('')
        : '<div class="quest-list-empty">No quests available</div>';

      const activeQuestsListHtml = activeQuestIds.length > 0
        ? activeQuestIds.map((qid, i) => renderQuestListItem(qid, 'active', i)).join('')
        : '<div class="quest-list-empty">No active quests</div>';

      // Reverse completed quests to show most recent first
      const completedQuestsListHtml = completedQuestIds.length > 0
        ? [...completedQuestIds].reverse().map((qid, i) => renderQuestListItem(qid, 'completed', i)).join('')
        : '<div class="quest-list-empty">No completed quests</div>';

      // Generate detail panel for first quest (default selection)
      let defaultDetailHtml = '<div class="quest-detail-placeholder">Select a quest to view details</div>';
      if (activeQuestIds.length > 0) {
        defaultDetailHtml = renderQuestDetail(activeQuestIds[0], 'active');
      } else if (allQuestIds.length > 0) {
        const firstQid = allQuestIds[0];
        const status = activeQuestIds.includes(firstQid) ? 'active' : 'completed';
        defaultDetailHtml = renderQuestDetail(firstQid, status);
      }

      const questContentHtml = `
        <div class="journal-view" style="height: 100%;">
          <div class="quest-master-detail">
            <!-- LEFT: Quest List with Tabs -->
            <div class="quest-master">
              <div class="quest-tabs">
                <button class="quest-tab active" data-tab="all" data-count="${allQuestIds.length}">
                  All <span class="tab-count">(${allQuestIds.length})</span>
                </button>
                <button class="quest-tab" data-tab="active" data-count="${activeQuestIds.length}">
                  Active <span class="tab-count">(${activeQuestIds.length})</span>
                </button>
                <button class="quest-tab" data-tab="completed" data-count="${completedQuestIds.length}">
                  Completed <span class="tab-count">(${completedQuestIds.length})</span>
                </button>
              </div>
              
              <div class="quest-list-container">
                <div class="quest-list active" data-tab-content="all">
                  ${allQuestsListHtml}
                </div>
                <div class="quest-list" data-tab-content="active">
                  ${activeQuestsListHtml}
                </div>
                <div class="quest-list" data-tab-content="completed">
                  ${completedQuestsListHtml}
                </div>
              </div>
            </div>
            
            <!-- RIGHT: Quest Details -->
            <div class="quest-detail">
              ${defaultDetailHtml}
            </div>
          </div>
        </div>
      `;

      // Store helper functions in window for event handlers
      window.questJournalHelpers = {
        renderQuestDetail: renderQuestDetail,
        questDatabase: questDatabase,
        questState: questState,
        activeQuestIds: activeQuestIds,
        completedQuestIds: completedQuestIds
      };


      // Discovery Log and Certificates (for other tabs)
      const discoveryLog = vars.gameLog || [
        {
          date: "Day 1",
          icon: "map-pin",
          title: "New Beginnings",
          desc: "Arrived at the new house.",
        },
      ];
      const certificates = vars.certificates || [];

      // Reputation Content
      const reputationKeys = Object.keys(reputation);
      const reputationHtml =
        reputationKeys.length > 0
          ? `<div class="reputation-list">${reputationKeys
              .map((key) => this.createReputationBar(key, reputation[key]))
              .join("")}</div>`
          : '<div class="tab-content-inner"><p style="color: var(--color-text-tertiary);">No reputation established yet.</p></div>';

      this.API.Modal.create({
        id: "journal-modal",
        title: "Journal",
        width: "1000px",
        tabs: [
          // ====================== TAB 1: QUESTS ======================
          {
            id: "quests",
            label: "Quests",
            content: questContentHtml,
          },
          // ====================== TAB 2: RECORDS ======================
          {
            id: "records",
            label: "Records",
            content: `
                            <div class="journal-view">
                                <!-- Top Stats -->
                                <div class="records-grid">
                                    <!-- Group 1: Intimacy Logs -->
                                    ${this.createRecordGroup(
                                      "Intimacy Logs",
                                      "heart",
                                      `
                                        ${this.createVirginityRow(
                                          "Oral",
                                          vars.sexual?.virginity?.oral
                                        )}
                                        ${this.createVirginityRow(
                                          "Vaginal",
                                          vars.sexual?.virginity?.vaginal
                                        )}
                                        ${this.createVirginityRow(
                                          "Anal",
                                          vars.sexual?.virginity?.anal
                                        )}
                                        <div style="border-top: 1px solid var(--color-border-secondary); margin: 12px 0;"></div>
                                        ${this.createRecordRow(
                                          "Total Partners",
                                          totalPartners
                                        )}
                                        ${this.createRecordRow(
                                          "Vaginal Sex",
                                          counts.vaginal || 0
                                        )}
                                        ${this.createRecordRow(
                                          "Anal Sex",
                                          counts.anal || 0
                                        )}
                                        ${this.createRecordRow(
                                          "Oral Sex",
                                          counts.oral || 0
                                        )}
                                        ${this.createRecordRow(
                                          "Handjobs Given",
                                          counts.handjob || 0
                                        )}
                                    `
                                    )}

                                    <!-- Group 2: Finances -->
                                    ${this.createRecordGroup(
                                      "Financial & Career",
                                      "briefcase",
                                      `
                                        ${this.createRecordRow(
                                          "Current Funds",
                                          "$" + money
                                        )}
                                        ${this.createRecordRow(
                                          "Lifetime Earnings",
                                          "$" + (vars.lifetimeEarnings || money)
                                        )}
                                        ${this.createRecordRow(
                                          "Career Status",
                                          vars.characters?.player?.occupation ||
                                            "Student"
                                        )}
                                    `
                                    )}

                                    <!-- Group 3: Achievements -->
                                    ${this.createRecordGroup(
                                      "Achievements",
                                      "award",
                                      `
                                        ${this.createRecordRow(
                                          "Competitions Won",
                                          "0"
                                        )}
                                        ${this.createRecordRow(
                                          "Certificates Owned",
                                          certificates.length
                                        )}
                                        ${this.createRecordRow(
                                          "Locations Discovered",
                                          "1"
                                        )}
                                    `
                                    )}
                                </div>

                                <!-- Chronological Log & Certificates -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
                                    
                                    <!-- Certificates Section -->
                                    <div class="record-group">
                                        <div class="record-group-title"><i class="icon icon-file-text"></i> Certificates</div>
                                        ${
                                          certificates.length > 0
                                            ? `
                                            <div class="milestones-grid" style="grid-template-columns: 1fr;">
                                                ${certificates
                                                  .map(
                                                    (c) => `
                                                    <div class="milestone-card unlocked">
                                                        <div class="milestone-icon"><i class="icon icon-check"></i></div>
                                                        <div class="milestone-details">
                                                            <div class="milestone-title">${c.name}</div>
                                                            <div class="milestone-status">Acquired: ${c.date}</div>
                                                        </div>
                                                    </div>
                                                `
                                                  )
                                                  .join("")}
                                            </div>
                                        `
                                            : `
                                            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px; border: 1px dashed var(--color-border-secondary); color: var(--color-text-tertiary); text-align: center;">
                                                No certificates earned yet.
                                            </div>
                                        `
                                        }
                                    </div>

                                    <!-- Entries (Chronological) -->
                                    <div class="record-group">
                                        <div class="record-group-title"><i class="icon icon-bookmark"></i> Entries</div>
                                        <div class="timeline-container" style="max-height: 300px; overflow-y: auto; padding-right: 8px;">
                                            ${discoveryLog
                                              .map(
                                                (log) => `
                                                <div class="timeline-item" style="padding-bottom: 24px;">
                                                    <div class="timeline-title" style="display: flex; justify-content: space-between; font-size: 14px;">
                                                        <span>${log.title}</span>
                                                        <span style="font-weight: 400; opacity: 0.7; font-size: 12px;">${log.date}</span>
                                                    </div>
                                                    <div class="timeline-content" style="padding: 12px;">${log.desc}</div>
                                                </div>
                                            `
                                              )
                                              .join("")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `,
          },
          // ====================== TAB 3: FIRSTS ======================
          {
            id: "milestones",
            label: "Firsts",
            content: `
                            <div class="journal-view">
                                <div class="milestones-grid">
                                    ${Object.keys(firsts)
                                      .map((key) =>
                                        this.createMilestone(key, firsts[key])
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `,
          },
          // ====================== TAB 4: REPUTATION ======================
          {
            id: "reputation",
            label: "Reputation",
            content: this.buildReputationContent(vars),
          },
        ],
      });

      // Initialize tooltips for info icons
      setTimeout(function () {
        if (window.initTooltips) {
          window.initTooltips();
        }
        
        // ========== Quest Journal Event Handlers ==========
        
        // Tab switching
        $(document).off('click.questTab').on('click.questTab', '.quest-tab', function() {
          const tab = $(this).data('tab');
          
          // Update tab active state
          $('.quest-tab').removeClass('active');
          $(this).addClass('active');
          
          // Show corresponding quest list
          $('.quest-list').removeClass('active');
          $(`.quest-list[data-tab-content="${tab}"]`).addClass('active');
          
          // Select first quest in list
          const $firstQuest = $(`.quest-list[data-tab-content="${tab}"] .quest-list-item`).first();
          if ($firstQuest.length > 0) {
            $firstQuest.click();
          } else {
            // Show placeholder if no quests
            $('.quest-detail').html('<div class="quest-detail-placeholder">No quests in this category</div>');
          }
        });
        
        // Quest item selection
        $(document).off('click.questItem').on('click.questItem', '.quest-list-item', function() {
          const qid = $(this).data('quest-id');
          const status = $(this).data('status');
          
          // Update selection state
          $('.quest-list-item').removeClass('selected');
          $(this).addClass('selected');
          
          // Render detail panel
          if (window.questJournalHelpers) {
            const detailHtml = window.questJournalHelpers.renderQuestDetail(qid, status);
            $('.quest-detail').html(detailHtml);
          }
        });
        
      }, 300);
    },
  };
};
