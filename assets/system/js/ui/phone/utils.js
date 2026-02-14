/* ==========================================
   PHONE UTILS - Shared helpers
========================================== */

function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatPhoneTime(t) {
    if (!t) return '';
    const h = (t.hour != null) ? String(t.hour).padStart(2, '0') : '00';
    const m = (t.minute != null) ? String(t.minute).padStart(2, '0') : '00';
    return h + ':' + m;
}

function persistPhoneChanges() {
    try {
        if (window.Save && Save.autosave && typeof Save.autosave.save === 'function') {
            Save.autosave.save();
            return;
        }
    } catch (e) { }
    try {
        var api = window.SaveLoadAPI;
        if (api && api.Save && api.Save.slots && typeof api.Save.slots.save === 'function') {
            api.Save.slots.save(0);
        }
    } catch (e2) { }
}

function getStorySetupObj() {
    var s = (typeof setup !== 'undefined') ? setup : null;
    var ws = (typeof window !== 'undefined' && window.setup) ? window.setup : null;
    var sugar = (typeof window !== 'undefined' && window.SugarCube && window.SugarCube.setup) ? window.SugarCube.setup : null;
    if (s && s.navCards && Object.keys(s.navCards).length) return s;
    if (ws && ws.navCards && Object.keys(ws.navCards).length) return ws;
    if (sugar && sugar.navCards && Object.keys(sugar.navCards).length) return sugar;
    return s || ws || sugar || {};
}

/** Discovery check using standard pattern: discovered + CapitalizedLocationId */
function isDiscoveredLocation(locationId, vars) {
    if (!locationId) return false;
    var stateVars = (typeof State !== 'undefined' && State.variables) ? State.variables
        : (typeof window !== 'undefined' && window.State && window.State.variables) ? window.State.variables
        : (vars || {});
    var getKey = (typeof window !== 'undefined' && window.getDiscoveryKey) ? window.getDiscoveryKey : null;
    var discoveryKey = getKey ? getKey(locationId) : ('discovered' + locationId.charAt(0).toUpperCase() + locationId.slice(1));
    return stateVars[discoveryKey] === true;
}

function getDateWithOffset(ts, dayOffset) {
    var dt = new Date(ts.year || 2025, (ts.month || 1) - 1, ts.day || 1);
    dt.setDate(dt.getDate() + dayOffset);
    return {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        day: dt.getDate(),
        weekday: dt.getDay()
    };
}

function escapeForWiki(s) {
    if (s == null) return '';
    return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
