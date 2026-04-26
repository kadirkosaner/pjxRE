window.GymTutorialAPI = window.GymTutorialAPI || null;

window.GymTutorialInit = function (API) {
    window.GymTutorialAPI = API;

    // Cleanup safety: remove stale overlay on passage changes.
    $(document).off('.gymTutorial');
    $(document).on(':passagestart.gymTutorial', function () {
        $('#gym-tutorial-overlay').remove();
        API.$('body').removeClass('modal-open');
    });
};

window.openGymTutorialModal = function () {
    var API = window.GymTutorialAPI;
    if (!API || !API.State || !API.Engine) {
        return false;
    }

    API.State.variables.location = 'gym';
    $('#gym-tutorial-overlay').remove();

    var html = `
        <div id="gym-tutorial-overlay" class="overlay overlay-dark modal-overlay active" data-modal="gym-tutorial-modal">
            <div class="modal gym-tutorial-modal">
                <div class="modal-header">
                    <div class="modal-title">Workout Briefing</div>
                    <button class="close-btn" id="gym-tutorial-close">
                        <span class="icon icon-close icon-18"></span>
                    </button>
                </div>
                <div class="modal-content gym-tutorial-content">
                    <p class="gym-tutorial-copy">
                        Focus on your chosen training zone. Each round you'll see <strong>five zone icons</strong>, and only one matches your training. Pick it before the timer runs out.
                    </p>

                    <div class="gym-tutorial-steps">
                        <div class="gym-tutorial-step">
                            <div class="gym-tutorial-step-num">1</div>
                            <div class="gym-tutorial-step-body">
                                <div class="gym-tutorial-step-title">Watch the timer</div>
                                <div class="gym-tutorial-step-desc">You have <strong>5 seconds</strong> each phase.</div>
                            </div>
                        </div>
                        <div class="gym-tutorial-step">
                            <div class="gym-tutorial-step-num">2</div>
                            <div class="gym-tutorial-step-body">
                                <div class="gym-tutorial-step-title">Pick the correct zone</div>
                                <div class="gym-tutorial-step-desc">Five icons appear and only <strong>one</strong> matches your training zone. Tap it fast.</div>
                            </div>
                        </div>
                        <div class="gym-tutorial-step">
                            <div class="gym-tutorial-step-num">3</div>
                            <div class="gym-tutorial-step-body">
                                <div class="gym-tutorial-step-title">Earn stats per phase</div>
                                <div class="gym-tutorial-step-desc">4 phases in total. Each correct phase grants your <strong>main stat</strong> plus a smaller bonus to a related stat (max <strong>+2.0</strong>).</div>
                            </div>
                        </div>
                    </div>

                    <p class="gym-tutorial-note">
                        If you don't want to play the mini-game, you can turn it off from the button below or later from <strong>Settings</strong>. A plain workout always grants <strong>+1.0</strong> main stat and <strong>+0.5</strong> related stat. Playing the mini-game can push this up to <strong>+2.0</strong> main and <strong>+1.0</strong> related on a perfect run.
                    </p>

                    <div class="gym-tutorial-section-label">Training Zones</div>
                    <div class="gym-tutorial-zones-grid">
                        <div class="gym-tutorial-zone-card">
                            <i class="icon icon-upperbody icon-32"></i>
                            <div class="gym-tutorial-zone-body">
                                <div class="gym-tutorial-zone-title">Upper Body</div>
                                <div class="gym-tutorial-zone-desc">Chest, arms, shoulders. Boosts <strong>Upper Body</strong> with bonus to <strong>Core</strong>.</div>
                            </div>
                        </div>
                        <div class="gym-tutorial-zone-card">
                            <i class="icon icon-core icon-32"></i>
                            <div class="gym-tutorial-zone-body">
                                <div class="gym-tutorial-zone-title">Core</div>
                                <div class="gym-tutorial-zone-desc">Abs and midsection. Boosts <strong>Core</strong> with bonus to <strong>Lower Body</strong>.</div>
                            </div>
                        </div>
                        <div class="gym-tutorial-zone-card">
                            <i class="icon icon-lowerbody icon-32"></i>
                            <div class="gym-tutorial-zone-body">
                                <div class="gym-tutorial-zone-title">Lower Body</div>
                                <div class="gym-tutorial-zone-desc">Legs and glutes. Boosts <strong>Lower Body</strong> with bonus to <strong>Cardio</strong>.</div>
                            </div>
                        </div>
                        <div class="gym-tutorial-zone-card">
                            <i class="icon icon-cardio icon-32"></i>
                            <div class="gym-tutorial-zone-body">
                                <div class="gym-tutorial-zone-title">Cardio</div>
                                <div class="gym-tutorial-zone-desc">Endurance and heart. Boosts <strong>Cardio</strong> with bonus to <strong>Lower Body</strong>.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions gym-tutorial-actions">
                    <button class="btn btn-secondary" id="gym-tutorial-disable">Turn Off Mini-Game</button>
                    <button class="btn btn-primary" id="gym-tutorial-start">Start Training</button>
                </div>
            </div>
        </div>
    `;

    API.$('body').append(html);
    API.$('body').addClass('modal-open');

    var closeModal = function () {
        $('#gym-tutorial-overlay').remove();
        API.$('body').removeClass('modal-open');
    };

    var startTraining = function () {
        closeModal();
        API.State.variables.flags = API.State.variables.flags || {};
        API.State.variables.flags.gymMiniGameTutorialSeen = true;
        API.Engine.play('gymMiniGameRound');
    };

    var disableMiniGame = function () {
        closeModal();
        var V = API.State.variables;
        V.flags = V.flags || {};
        V.flags.gymMiniGameTutorialSeen = true;
        V.gameSettings = V.gameSettings || {};
        V.gameSettings.gymMiniGameEnabled = false;
        API.Engine.play('gymMiniGameDisable');
    };

    $('#gym-tutorial-start').on('click', startTraining);
    $('#gym-tutorial-close').on('click', startTraining);
    $('#gym-tutorial-disable').on('click', disableMiniGame);
    return true;
};
