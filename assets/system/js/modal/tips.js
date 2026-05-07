// Tips modal — flag/quest driven progress chains.
// Keeps a single source of truth (CHAINS) so each click rebuilds the modal
// against the live State.variables snapshot (same pattern as character.js).
window.TipsInit = function (API) {
    var $ = API.$;

    /* ----------------------------- helpers ----------------------------- */

    function getVars() {
        if (API && API.State && API.State.variables) return API.State.variables;
        if (typeof State !== 'undefined' && State && State.variables) return State.variables;
        return {};
    }

    function escapeHtml(s) {
        if (s == null || s === '') return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Truthy check that handles both `$foo` and `$flags.foo` save layouts. */
    function flag(v, key) {
        if (!v || !key) return false;
        if (v[key]) return true;
        if (v.flags && v.flags[key]) return true;
        return false;
    }

    function intStat(v, key) {
        var n = parseInt(v && v[key], 10);
        return isNaN(n) ? 0 : n;
    }

    function questActive(v, qid) {
        return !!(v && v.questState && v.questState.active && v.questState.active[qid]);
    }

    function questStage(v, qid) {
        var q = v && v.questState && v.questState.active && v.questState.active[qid];
        return q && typeof q.stage === 'number' ? q.stage : -1;
    }

    function questCompleted(v, qid) {
        var c = v && v.questState && v.questState.completed;
        return Array.isArray(c) && c.indexOf(qid) !== -1;
    }

    function allQuestsCompleted(v) {
        var questDb = (typeof setup !== 'undefined' && setup && setup.quests) ? setup.quests : null;
        if (!questDb) return false;
        var questIds = Object.keys(questDb);
        if (!questIds.length) return false;
        for (var i = 0; i < questIds.length; i++) {
            if (!questCompleted(v, questIds[i])) return false;
        }
        return true;
    }

    function characterKnown(v, charId) {
        return !!(v && v.characters && v.characters[charId] && v.characters[charId].known);
    }

    function charStat(v, charId, statKey) {
        var c = v && v.characters && v.characters[charId];
        if (!c || !c.stats) return 0;
        var n = parseInt(c.stats[statKey], 10);
        return isNaN(n) ? 0 : n;
    }

    /** Content-pref toggle: returns true unless explicitly disabled in settings. */
    function contentPref(v, key) {
        if (!v || !v.contentPreferences) return true;
        return v.contentPreferences[key] !== false;
    }

    /** Requirement factory — keeps step definitions concise. */
    function req(label, met, current) {
        return { label: label, met: met, current: current || null };
    }

    /* --------------------------- chain checks --------------------------- */

    /** Lily intro (bench) — true as soon as the player has met Lily in any way. */
    function lilyIntroDone(v) {
        return (
            flag(v, 'parkBenchFirstEncounter') ||
            characterKnown(v, 'parkRunnerLily') ||
            questActive(v, 'go_to_mall') ||
            questCompleted(v, 'go_to_mall') ||
            flag(v, 'go_to_mall_done') ||
            flag(v, 'firstDowntownVisit') ||
            flag(v, 'firstMallVisit') ||
            flag(v, 'discoveredDownTown') ||
            flag(v, 'discoveredMall')
        );
    }

    function lilyJogUnlocked(v) {
        return flag(v, 'lilyJogInviteSeen') && flag(v, 'lilyJogUnlocked');
    }

    function jogDoneOnce(v) {
        return (
            flag(v, 'lilyJogTogetherDone') ||
            flag(v, 'lilyJogMiaMeetTriggered') ||
            lilyGymOffered(v)
        );
    }

    function lilyGymOffered(v) {
        return (
            questActive(v, 'lily_gym_intro') ||
            questCompleted(v, 'lily_gym_intro') ||
            flag(v, 'lilyGymQuestOffered') ||
            flag(v, 'lily_gym_intro_done')
        );
    }

    function lilyGymVisited(v) {
        return (
            flag(v, 'lily_gym_intro_done') ||
            flag(v, 'lilyGymReceptionTalked') ||
            questCompleted(v, 'lily_gym_intro')
        );
    }

    function miaJogMeetDone(v) {
        return flag(v, 'lilyJogMiaMeetTriggered') || characterKnown(v, 'neighborMia');
    }

    /* ------------------------------ chains ------------------------------ */

    /* Reusable requirement builders */
    function reqCorruption(min) {
        return req(
            'Corruption ' + min + '+',
            function (v) { return intStat(v, 'corruption') >= min; },
            function (v) { return intStat(v, 'corruption'); }
        );
    }

    function reqCharFriendship(charId, charName, min) {
        return req(
            charName + ' friendship ' + min + '+',
            function (v) { return charStat(v, charId, 'friendship') >= min; },
            function (v) { return charStat(v, charId, 'friendship'); }
        );
    }

    function reqStat(statKey, label, min) {
        return req(
            label + ' ' + min + '+',
            function (v) { return intStat(v, statKey) >= min; },
            function (v) { return intStat(v, statKey); }
        );
    }

    function reqCharLust(charId, charName, min) {
        return req(
            charName + ' lust ' + min + '+',
            function (v) { return charStat(v, charId, 'lust') >= min; },
            function (v) { return charStat(v, charId, 'lust'); }
        );
    }

    function reqCharLustLevel(charId, charName, min) {
        return req(
            charName + ' lust level ' + min + '+',
            function (v) { return charStat(v, charId, 'lustLevel') >= min; },
            function (v) { return charStat(v, charId, 'lustLevel'); }
        );
    }

    function reqIncestEnabled() {
        return req(
            'Incest content enabled',
            function (v) { return contentPref(v, 'incest'); }
        );
    }

    function reqJobStateNum(key, label, min) {
        return req(
            label + ' ' + min + '+',
            function (v) {
                var n = parseInt(v && v.jobState && v.jobState[key], 10);
                return !isNaN(n) && n >= min;
            },
            function (v) {
                var n = parseInt(v && v.jobState && v.jobState[key], 10);
                return isNaN(n) ? 0 : n;
            }
        );
    }

    function pornCategoryUnlocked(v, category) {
        var unlocked = v && v.porn && v.porn.categoriesUnlocked;
        return Array.isArray(unlocked) && unlocked.indexOf(category) !== -1;
    }

    function pornCategoryProgress(v, category) {
        var counts = v && v.porn && v.porn.categoryProgressCounts;
        var n = parseInt(counts && counts[category], 10);
        return isNaN(n) ? 0 : n;
    }

    function pornCategoryTarget(v, category, fallbackMin) {
        var targets = v && v.porn && v.porn.categoryTargets;
        var n = parseInt(targets && targets[category], 10);
        if (!isNaN(n) && n > 0) return n;
        return fallbackMin || 0;
    }

    function reqPornProgressDays(category, label, fallbackMin) {
        return req(
            label,
            function (v) {
                if (category === 'handjob' && pornCategoryUnlocked(v, 'blowjob')) return true;
                return pornCategoryProgress(v, category) >= pornCategoryTarget(v, category, fallbackMin);
            },
            null
        );
    }

    /** YYYYMMDD from $timeSys (matches Twee date keys). */
    function ymdFromTimeSys(ts) {
        if (!ts) return 0;
        return (Number(ts.year) || 0) * 10000 + (Number(ts.month) || 0) * 100 + (Number(ts.day) || 0);
    }

    function vinceFamilyCompletedYmd(v) {
        var cd = v && v.questState && v.questState.completedDates;
        var d = cd && cd.vince_day3_family;
        var n = parseInt(d, 10);
        return !isNaN(n) && n > 0 ? n : 0;
    }

    function addCalendarDaysYmd(ymd, daysToAdd) {
        if (!ymd || ymd <= 0) return 0;
        var y = Math.floor(ymd / 10000);
        var m = Math.floor((ymd % 10000) / 100);
        var d = ymd % 100;
        var dt = new Date(y, m - 1, d + daysToAdd);
        return dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();
    }

    function ymdToLocalDate(ymd) {
        var y = Math.floor(ymd / 10000);
        var mo = Math.floor((ymd % 10000) / 100) - 1;
        var d = ymd % 100;
        return new Date(y, mo, d);
    }

    /** Same gate as RubysDishwashWork_afterMini: completion date + 2 calendar days. */
    function dianaCalendarGateOpen(v) {
        var doneYmd = vinceFamilyCompletedYmd(v);
        if (!doneYmd) return false;
        var needOnOrAfter = addCalendarDaysYmd(doneYmd, 2);
        var today = ymdFromTimeSys(v && v.timeSys);
        return today >= needOnOrAfter;
    }

    function dianaCalendarGateCurrent(v) {
        var doneYmd = vinceFamilyCompletedYmd(v);
        if (!doneYmd) return '';
        var needOnOrAfter = addCalendarDaysYmd(doneYmd, 2);
        var today = ymdFromTimeSys(v && v.timeSys);
        if (today >= needOnOrAfter) return 'ready';
        var ms = ymdToLocalDate(needOnOrAfter).getTime() - ymdToLocalDate(today).getTime();
        var left = Math.max(0, Math.round(ms / 86400000));
        return left + ' in-game day(s) left';
    }

    function reqDianaTimingAfterVince() {
        return req(
            '2+ in-game days after Vince\'s family wrap-up',
            function (v) { return dianaCalendarGateOpen(v); },
            function (v) { return dianaCalendarGateCurrent(v); }
        );
    }

    var CHAINS = [
        {
            id: 'mall_lily',
            title: 'Lily & The Mall',
            order: 1,
            steps: [
                {
                    text: 'Sit on the Sunset Park bench. Weekdays 7-9 am or 5-6 pm, weekends 8 am to noon or 4-5 pm.',
                    done: lilyIntroDone,
                },
            ],
        },
        {
            id: 'lily_jog',
            title: 'Jogging with Lily',
            order: 2,
            steps: [
                {
                    text: 'Talk with Lily at Sunset Park during her jogging hours.',
                    requirements: [
                        reqCharFriendship('parkRunnerLily', 'Lily', 20),
                    ],
                    done: lilyJogUnlocked,
                },
                {
                    text: 'Use Jog Together with Lily. While running together, you might run into a new local around Sunset Park.',
                    requirements: [
                        reqStat('energy', 'Energy', 25),
                        reqCharFriendship('parkRunnerLily', 'Lily', 20),
                    ],
                    done: jogDoneOnce,
                },
                {
                    text: 'Keep jogging with Lily until she suggests Iron Works Gym.',
                    requirements: [
                        reqCharFriendship('parkRunnerLily', 'Lily', 30),
                        reqStat('cardio', 'Cardio', 15),
                        reqStat('lowerBody', 'Lower body', 10),
                    ],
                    done: lilyGymOffered,
                },
                {
                    text: 'Visit Iron Works Gym in Apex Tower (Downtown) and talk to the front desk.',
                    done: lilyGymVisited,
                },
            ],
        },
        {
            id: 'lily_mia_jog',
            title: 'Mia Encounter (Jogging)',
            order: 3,
            visible(v) {
                return lilyGymOffered(v) || miaJogMeetDone(v);
            },
            steps: [
                {
                    text: 'Keep using Jog Together with Lily. Mia encounter can trigger randomly after a run.',
                    done: miaJogMeetDone,
                },
            ],
        },
        {
            id: 'brother_pc',
            title: 'Watching Porn',
            order: 4,
            steps: [
                {
                    text: 'Use Brother\u2019s PC while he is out. Browse / Surf and retry on different days.',
                    requirements: [
                        reqCorruption(1),
                    ],
                    done(v) { return flag(v, 'brotherPornFirstSeen'); },
                },
                {
                    text: 'Keep checking his PC on quiet nights until the Watch button shows up in the menu.',
                    requirements: [
                        reqCorruption(1),
                    ],
                    done(v) { return flag(v, 'brotherPornLookButtonUnlocked'); },
                },
                {
                    text: 'Open the adult section from his PC and watch a clip.',
                    done(v) {
                        return flag(v, 'pornWatchFirstDone') || flag(v, 'brotherPornWatchFirstDone');
                    },
                },
                {
                    text: 'To unlock Blowjob, keep watching Handjob for 3-5 in-game days in a row.',
                    requirements: [
                        reqCorruption(1),
                        reqPornProgressDays('handjob', 'Handjob watch days in a row (3-5 needed)', 3),
                    ],
                    done(v) { return pornCategoryUnlocked(v, 'blowjob'); },
                },
            ],
        },
        {
            id: 'masturbation',
            title: 'Bedtime Release',
            order: 5,
            steps: [
                {
                    text: 'Go to bed feeling restless. The night scene fires at sleep time.',
                    requirements: [
                        reqCorruption(1),
                        reqStat('arousal', 'Arousal', 70),
                    ],
                    done(v) { return flag(v, 'masturbationUnlocked'); },
                },
            ],
        },
        {
            id: 'vince_day3',
            title: 'Vince Inspection',
            order: 6,
            visible(v) {
                return !!(v && v.job && v.job.id === 'ruby_dishwasher');
            },
            steps: [
                {
                    text: "Keep taking shifts at Ruby's Diner. Vince's inspection scene pops on your third dishwasher workday.",
                    requirements: [
                        reqJobStateNum('totalDaysWorked', "Ruby workdays logged", 3),
                    ],
                    done(v) {
                        return (
                            flag(v, 'vinceInspectionDay3Shown') ||
                            questActive(v, 'vince_day3_family') ||
                            questCompleted(v, 'vince_day3_family')
                        );
                    },
                },
                {
                    text: 'See Vince\'s inspection through, then tie up the family fallout back home.',
                    done(v) { return questCompleted(v, 'vince_day3_family'); },
                },
            ],
        },
        {
            id: 'diana_arc',
            title: 'Diana at Ruby\'s',
            order: 7,
            visible(v) {
                return !!(v && v.job && v.job.id === 'ruby_dishwasher');
            },
            steps: [
                {
                    text: 'Let the Vince inspection arc finish first, then wait 2 in-game days after the family wrap-up. Diana\'s introduction only opens after that.',
                    requirements: [
                        req(
                            "Vince's family fallout completed",
                            function (v) { return questCompleted(v, 'vince_day3_family'); }
                        ),
                        reqDianaTimingAfterVince(),
                    ],
                    done(v) { return flag(v, 'dianaEventShown'); },
                },
                {
                    text: "After home life settles, stay on the schedule at Ruby's. A couple of in-game days later, finish a full day at the sink—Diana shows up when you clock out.",
                    requirements: [
                        reqDianaTimingAfterVince(),
                        reqJobStateNum('totalDaysWorked', 'Ruby workdays logged', 5),
                        reqJobStateNum('hoursToday', 'Hours today (full day)', 8),
                    ],
                    done(v) { return flag(v, 'dianaEventShown'); },
                },
                {
                    text: 'Play through the late-night bedroom beat to unlock Diana gossip at the diner.',
                    done(v) { return flag(v, 'dianaThoughtsShown') || flag(v, 'dianaGossipUnlocked'); },
                },
            ],
        },
        {
            id: 'jake_coffee_week3',
            title: 'Coffee with Jake',
            order: 8,
            visible(v) {
                if (v && v.job && v.job.id === 'ruby_dishwasher') return true;
                if (flag(v, 'jakeCoffeeInviteWeek3Shown')) return true;
                if (characterKnown(v, 'coffeeBaristaLeo')) return true;
                return false;
            },
            steps: [
                {
                    text: "Keep working full 8h dishwasher shifts at Ruby's Diner. Once you hit your third week with Jake's friendship at 20+, he'll catch you on the way out and invite you for coffee at The Daily Grind in Old Town.",
                    requirements: [
                        reqCharFriendship('dinerWaitress3', 'Jake', 20),
                        reqJobStateNum('totalDaysWorked', 'Diner days worked', 11),
                    ],
                    done(v) {
                        return flag(v, 'jakeCoffeeInviteWeek3Shown') || characterKnown(v, 'coffeeBaristaLeo');
                    },
                },
            ],
        },
        {
            id: 'shower_peeks',
            title: 'Bathroom Glimpses',
            order: 9,
            visible(v) {
                return intStat(v, 'corruption') >= 2;
            },
            steps: [
                {
                    text: "Pass the upstairs hall while your brother showers. The door must be ajar.",
                    requirements: [
                        reqIncestEnabled(),
                        reqCorruption(2),
                        reqCharLustLevel('brother', 'Brother', 2),
                        reqCharLust('brother', 'Brother', 5),
                    ],
                    done(v) { return flag(v, 'brotherShowerPeekFirstSeen'); },
                },
                {
                    text: "Pass the parents' bathroom while mother showers. The door must be ajar.",
                    requirements: [
                        reqIncestEnabled(),
                        reqCorruption(2),
                        reqCharLustLevel('mother', 'Mother', 2),
                        reqCharLust('mother', 'Mother', 5),
                    ],
                    done(v) { return flag(v, 'motherShowerPeekFirstSeen'); },
                },
                {
                    text: "Pass the parents' bathroom while father showers. The door must be ajar.",
                    requirements: [
                        reqIncestEnabled(),
                        reqCorruption(2),
                        reqCharLustLevel('father', 'Father', 2),
                        reqCharLust('father', 'Father', 5),
                    ],
                    done(v) { return flag(v, 'fatherShowerPeekFirstSeen'); },
                },
            ],
        },
    ];

    function visibleChains(v) {
        return CHAINS.slice()
            .filter(function (chain) {
                if (typeof chain.visible !== 'function') return true;
                try { return !!chain.visible(v); } catch (e) { return false; }
            })
            .sort(function (a, b) {
                return (a.order || 0) - (b.order || 0);
            });
    }

    /* ----------------------------- rendering ---------------------------- */

    function renderRequirements(v, requirements) {
        if (!requirements || !requirements.length) return '';
        var items = requirements.map(function (r) {
            var ok = false;
            try { ok = !!r.met(v); } catch (e) { ok = false; }
            var cur = '';
            if (typeof r.current === 'function') {
                try {
                    var c = r.current(v);
                    if (c !== null && c !== undefined && c !== '') {
                        cur = ' <span class="tips-req-current">(' + escapeHtml(String(c)) + ')</span>';
                    }
                } catch (e) { /* ignore */ }
            }
            return (
                '<li class="tips-req-item ' + (ok ? 'met' : 'unmet') + '">' +
                    '<span class="tips-req-icon">' + (ok ? '✓' : '○') + '</span>' +
                    '<span class="tips-req-label">' + escapeHtml(r.label) + cur + '</span>' +
                '</li>'
            );
        }).join('');
        return (
            '<div class="tips-reqs">' +
                '<div class="tips-reqs-label">Needs:</div>' +
                '<ul class="tips-req-list">' + items + '</ul>' +
            '</div>'
        );
    }

    function renderUpcomingCard(v, chain, nextStep) {
        return (
            '<div class="tips-chain-card">' +
                '<div class="chain-header">' +
                    '<strong>' + escapeHtml(chain.title) + '</strong>' +
                '</div>' +
                '<p class="tips-next">' + escapeHtml(nextStep.text) + '</p>' +
                renderRequirements(v, nextStep.requirements) +
            '</div>'
        );
    }

    function renderDoneItem(chain, step) {
        return (
            '<li class="tips-done-item">' +
                '<span class="done-check">✔</span>' +
                '<div class="tips-done-body">' +
                    '<span class="done-chain">' + escapeHtml(chain.title) + '</span>' +
                    '<span class="done-text">' + escapeHtml(step.text) + '</span>' +
                '</div>' +
            '</li>'
        );
    }

    function buildHtml(v) {
        var upcoming = '';
        var done = '';
        var doneCount = 0;

        visibleChains(v).forEach(function (chain) {
            var safeDone = function (step) {
                try { return !!step.done(v); } catch (e) { return false; }
            };
            var nextStep = null;
            for (var i = 0; i < chain.steps.length; i++) {
                if (!safeDone(chain.steps[i])) { nextStep = chain.steps[i]; break; }
            }
            if (nextStep) upcoming += renderUpcomingCard(v, chain, nextStep);

            chain.steps.forEach(function (step) {
                if (safeDone(step)) {
                    done += renderDoneItem(chain, step);
                    doneCount++;
                }
            });
        });

        var intro =
            '<p class="tips-intro">' +
                escapeHtml('Below are useful hints and progress trackers for important activities.') +
                '<br>' +
                escapeHtml('Some sections unlock as you progress through the story and corruption.') +
            '</p>';

        var allContentDone = allQuestsCompleted(v);
        var emptyUpcomingMsg = allContentDone
            ? 'You completed all the content, congratulations!'
            : "You're all caught up for now!";
        var emptyUpcomingClass = allContentDone ? 'tips-empty tips-empty-success' : 'tips-empty';

        var upcomingBlock = upcoming
            ? '<div class="tips-upcoming-list">' + upcoming + '</div>'
            : '<p class="' + emptyUpcomingClass + '">' + escapeHtml(emptyUpcomingMsg) + '</p>';

        var doneBody = done
            ? '<ul class="tips-done-list">' + done + '</ul>'
            : '<p class="tips-empty">' + escapeHtml('No completed steps yet.') + '</p>';

        var doneBlock =
            '<details class="tips-done-accordion">' +
                '<summary class="tips-section-title tips-section-done">' +
                    escapeHtml('Completed') +
                    ' <span class="tips-done-count">(' + doneCount + ')</span>' +
                '</summary>' +
                doneBody +
            '</details>';

        return (
            '<div class="tips-modal-root">' +
                intro +
                '<h4 class="tips-section-title">' + escapeHtml('Next Up') + '</h4>' +
                upcomingBlock +
                doneBlock +
            '</div>'
        );
    }

    /* ------------------------------ system ------------------------------ */

    window.TipsSystem = {
        API: API,

        /** Re-evaluate a chain id against current state — exposed for debugging. */
        debug: function () {
            var v = getVars();
            var snapshot = {
                parkBenchFirstEncounter: flag(v, 'parkBenchFirstEncounter'),
                parkRunnerLilyKnown: characterKnown(v, 'parkRunnerLily'),
                go_to_mall_active: questActive(v, 'go_to_mall'),
                go_to_mall_completed: questCompleted(v, 'go_to_mall'),
                go_to_mall_done: flag(v, 'go_to_mall_done'),
                firstDowntownVisit: flag(v, 'firstDowntownVisit'),
                firstMallVisit: flag(v, 'firstMallVisit'),
                discoveredDownTown: flag(v, 'discoveredDownTown'),
                discoveredMall: flag(v, 'discoveredMall'),
                corruption: intStat(v, 'corruption'),
                lilyIntroDone: lilyIntroDone(v),
            };
            // eslint-disable-next-line no-console
            console.log('[TipsSystem] state snapshot', snapshot, v);
            return snapshot;
        },

        open: function () {
            if (!window.ModalTabSystem || typeof window.ModalTabSystem.create !== 'function') return;
            var v = getVars();
            var html = buildHtml(v);
            window.ModalTabSystem.create({
                id: 'tips-modal',
                title: 'Tips & Progress',
                width: '580px',
                maxHeight: '88vh',
                tabs: [{ id: 'main', label: 'Progress', content: html }],
            });
        },

        /** Refresh content in place if modal is already open. */
        refresh: function () {
            if (!window.ModalTabSystem || window.ModalTabSystem.currentModal !== 'tips-modal') return;
            var v = getVars();
            if (typeof window.ModalTabSystem.updateTabContent === 'function') {
                window.ModalTabSystem.updateTabContent('main', buildHtml(v));
            } else {
                this.open();
            }
        },
    };

    /* ----------------------------- bindings ----------------------------- */

    $('body').off('click.tips', '#topbar-tips-btn');
    $('body').on('click.tips', '#topbar-tips-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.TipsSystem) window.TipsSystem.open();
    });

    // Refresh when state changes while the modal is open.
    $(document).off(':passagerender.tips :passagedisplay.tips');
    $(document).on(':passagerender.tips :passagedisplay.tips', function () {
        if (!window.TipsSystem) return;
        if (!window.ModalTabSystem || window.ModalTabSystem.currentModal !== 'tips-modal') return;
        window.TipsSystem.refresh();
    });
};
