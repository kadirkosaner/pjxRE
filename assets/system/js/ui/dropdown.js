window.DropdownInit = function (API) {
    const { State, Macro } = API;

    function parseVarPath(varRef) {
        if (typeof varRef !== 'string') return null;

        const s = varRef.trim();
        const sigil = s[0];
        if (sigil !== '$' && sigil !== '_') return null;

        const raw = s.slice(1);
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
      Usage: <<uiDropdown "$alarm.weekdayHour" _hours>>
    */
    Macro.add('uiDropdown', {
        handler: function () {
            if (this.args.length < 2) {
                return this.error('uiDropdown requires 2 arguments: variable name and options array');
            }

            const varName = this.args[0];
            const options = this.args[1];

            if (!Array.isArray(options)) {
                return this.error('uiDropdown: second argument must be an array');
            }

            const parsed = parseVarPath(varName);
            if (!parsed) {
                return this.error('uiDropdown: first argument must be a string variable reference like "$var" or "$obj.prop"');
            }

            const { root, parts } = parsed;

            const getValue = () => getByPath(root, parts);
            const setValue = (val) => setByPath(root, parts, val);

            let currentValue = getValue();

            const items = options.map(opt => {
                if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                    return {
                        label: opt.label ?? String(opt.value),
                        value: opt.value,
                        disabled: !!opt.disabled,
                        tooltip: opt.tooltip || ''
                    };
                }
                return { label: String(opt), value: opt, disabled: false, tooltip: '' };
            });

            let currentItem = items.find(i => i.value === currentValue);
            if (!currentItem && items.length > 0) {
                currentItem = items[0];
                setValue(currentItem.value);
            } else if (!currentItem) {
                currentItem = { label: 'Select', value: null };
            }

            const $wrapper = $('<div>')
                .addClass('ui-dropdown-wrapper')
                .attr('tabindex', '0')
                .appendTo(this.output);

            const $trigger = $('<div>')
                .addClass('ui-dropdown-trigger')
                .appendTo($wrapper);

            const $triggerLabel = $('<span>')
                .addClass('ui-dropdown-value')
                .text(currentItem.label)
                .appendTo($trigger);

            $('<span>')
                .addClass('ui-dropdown-icon icon icon-chevron-down')
                .appendTo($trigger);

            const $menu = $('<ul>')
                .addClass('ui-dropdown-menu')
                .appendTo($wrapper);

            items.forEach(item => {
                const $li = $('<li>')
                    .addClass('ui-dropdown-item')
                    .text(item.label)
                    .data('value', item.value)
                    .data('disabled', item.disabled)
                    .appendTo($menu);

                if (item.disabled) {
                    $li.addClass('disabled');
                    if (item.tooltip) $li.attr('title', item.tooltip);
                }
                if (item.value === currentItem.value) {
                    $li.addClass('selected');
                }

                $li.on('click', function (e) {
                    e.stopPropagation();
                    if ($(this).data('disabled')) return;

                    const newVal = $(this).data('value');
                    setValue(newVal);

                    $triggerLabel.text(item.label);
                    $menu.find('.selected').removeClass('selected');
                    $(this).addClass('selected');

                    closeMenu();
                });
            });

            const openMenu = () => {
                $menu.addClass('show');
                $trigger.addClass('active');
                $wrapper.addClass('open');
            };

            const closeMenu = () => {
                $menu.removeClass('show');
                $trigger.removeClass('active');
                $wrapper.removeClass('open');
                $wrapper.blur();
            };

            $trigger.on('click', function (e) {
                e.stopPropagation();
                if ($menu.hasClass('show')) closeMenu();
                else {
                    $('.ui-dropdown-menu.show').removeClass('show');
                    $('.ui-dropdown-trigger.active').removeClass('active');
                    openMenu();
                }
            });

            $(document).on('click.uiDropdown', function (e) {
                if (!$wrapper.is(e.target) && $wrapper.has(e.target).length === 0) {
                    closeMenu();
                }
            });
        }
    });

    console.log('[UI] Dropdown Macros Initialized');
};
