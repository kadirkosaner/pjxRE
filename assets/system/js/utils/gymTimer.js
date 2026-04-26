/* Gym Mini-Game Timer
   Simple, decoupled countdown bar.
   Exposes: window.GymTimer.start({ duration, barSel, textSel, onTimeout })
            window.GymTimer.stop()
*/
(function () {
    var state = {
        rafId: null,
        startedAt: 0,
        duration: 5000,
        bar: null,
        txt: null,
        onTimeout: null,
        active: false
    };

    function now() {
        return (window.performance && typeof performance.now === 'function')
            ? performance.now()
            : Date.now();
    }

    function tick() {
        if (!state.active) return;
        var elapsed = now() - state.startedAt;
        var remaining = Math.max(0, state.duration - elapsed);
        var ratio = remaining / state.duration;
        var secsLeft = Math.ceil(remaining / 1000);

        if (state.txt) state.txt.textContent = secsLeft + 's';
        if (state.bar) {
            state.bar.style.width = (ratio * 100).toFixed(2) + '%';
            if (remaining <= 1000) state.bar.style.background = '#ef4444';
        }

        if (remaining <= 0) {
            state.active = false;
            state.rafId = null;
            if (typeof state.onTimeout === 'function') {
                try { state.onTimeout(); } catch (e) { /* noop */ }
            }
            return;
        }

        state.rafId = window.requestAnimationFrame(tick);
    }

    function stop() {
        state.active = false;
        if (state.rafId) {
            window.cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    function start(opts) {
        stop();
        opts = opts || {};

        var barSel = opts.barSel || '#gymMGTimerBar';
        var txtSel = opts.txtSel || '#gymMGTimerText';

        // Pick the LAST matching element (the one just rendered by SugarCube).
        var bars = document.querySelectorAll(barSel);
        var txts = document.querySelectorAll(txtSel);
        state.bar = bars.length ? bars[bars.length - 1] : null;
        state.txt = txts.length ? txts[txts.length - 1] : null;

        state.duration = typeof opts.duration === 'number' ? opts.duration : 5000;
        state.onTimeout = typeof opts.onTimeout === 'function' ? opts.onTimeout : null;

        if (!state.bar) {
            // DOM not ready yet — retry on next frame.
            window.requestAnimationFrame(function () { start(opts); });
            return;
        }

        state.bar.style.transition = 'background 0.3s';
        state.bar.style.width = '100%';
        state.bar.style.background = '#ec4899';
        if (state.txt) state.txt.textContent = Math.ceil(state.duration / 1000) + 's';

        state.active = true;
        state.startedAt = now();
        state.rafId = window.requestAnimationFrame(tick);
    }

    window.GymTimer = {
        start: start,
        stop: stop
    };

    // Auto-stop whenever we leave a passage so the loop never lingers.
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on(':passagestart', function () { stop(); });
    }
})();
