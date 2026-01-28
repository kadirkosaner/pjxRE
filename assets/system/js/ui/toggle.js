window.ToggleInit = function (API) {
    const { State, Macro } = API;

    function parseVarPath(varRef) {
        if (typeof varRef !== 'string') return null;

        const s = varRef.trim();
        const sigil = s[0];
        if (sigil !== '$' && sigil !== '_') return null;

        const raw = s.slice(1); // remove $ or _
        // basic dot path support: alarm.weekdayEnabled
        const parts = raw.split('.').filter(Boolean);

        const root = sigil === '$' ? State.variables : State.temporary;
        return { root, parts };
    }

    function getByPath(root, parts) {
        let cur = root;
        for (const p of parts) {
            if (cur == null) return undefined;
            cur = cur[p];
        }
        return cur;
    }

    function setByPath(root, parts, value) {
        if (!parts.length) return;

        let cur = root;
        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            if (cur[key] == null || typeof cur[key] !== 'object') {
                cur[key] = {};
            }
            cur = cur[key];
        }
        cur[parts[parts.length - 1]] = value;
    }

    /*
        Usage: <<uiToggle "$alarm.weekdayEnabled">>
               <<uiToggle "$someVar" "Label Text">>
    */
    Macro.add('uiToggle', {
        handler: function () {
            if (this.args.length < 1) {
                return this.error('uiToggle requires at least 1 argument: variable name string, e.g. "$alarm.weekdayEnabled"');
            }

            const varName = this.args[0];
            const labelText = this.args[1] || '';

            const parsed = parseVarPath(varName);
            if (!parsed) {
                return this.error('uiToggle: first argument must be a string variable reference like "$var" or "$obj.prop"');
            }

            const { root, parts } = parsed;

            const initialValue = !!getByPath(root, parts);

            const $wrapper = $('<label>')
                .addClass('ui-toggle-wrapper')
                .appendTo(this.output);

            const $input = $('<input>')
                .attr('type', 'checkbox')
                .addClass('ui-toggle-input')
                .prop('checked', initialValue)
                .appendTo($wrapper);

            const $track = $('<div>')
                .addClass('ui-toggle-track')
                .append($('<div>').addClass('ui-toggle-thumb'))
                .appendTo($wrapper);

            if (labelText) {
                $('<span>')
                    .addClass('ui-toggle-label')
                    .text(labelText)
                    .appendTo($wrapper);
            }

            $input.on('change', function () {
                const isChecked = $(this).is(':checked');
                setByPath(root, parts, isChecked);
            });
        }
    });

    console.log('[UI] Toggle Macros Initialized');
};
