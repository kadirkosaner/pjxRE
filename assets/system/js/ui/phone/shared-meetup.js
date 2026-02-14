/* ==========================================
   PHONE SHARED MEETUP - Schedule, locations, appointments
========================================== */

function cleanupExpiredMeetups(vars) {
    var ts = vars.timeSys || {};
    var nowMinutes = (ts.hour || 0) * 60 + (ts.minute || 0);
    var currentDate = (ts.year || 0) * 10000 + (ts.month || 0) * 100 + (ts.day || 0);
    var changed = false;
    (vars.phoneAppointments || []).forEach(function (a) {
        if (!a || a.status !== 'pending' || !a.time) return;
        var aptDate = ((a.time.year || ts.year || 0) * 10000) + ((a.time.month || 0) * 100) + (a.time.day || 0);
        var aptMinutes = (a.time.hour || 0) * 60 + (a.time.minute || 0);
        if (aptDate < currentDate || (aptDate === currentDate && nowMinutes >= (aptMinutes + 15))) {
            a.status = 'cancelled';
            changed = true;
        }
    });
    return changed;
}

function hasPendingMeetupToday(vars) {
    var ts = vars.timeSys || {};
    var currentDate = (ts.year || 0) * 10000 + (ts.month || 0) * 100 + (ts.day || 0);
    return (vars.phoneAppointments || []).some(function (a) {
        if (!a || a.status !== 'pending' || !a.time) return false;
        var aptDate = ((a.time.year || ts.year || 0) * 10000) + ((a.time.month || 0) * 100) + (a.time.day || 0);
        return aptDate === currentDate;
    });
}

function hasMeetupTodayWithChar(charId, vars) {
    var ts = vars.timeSys || {};
    var currentDate = (ts.year || 0) * 10000 + (ts.month || 0) * 100 + (ts.day || 0);
    return (vars.phoneAppointments || []).some(function (a) {
        if (!a || !a.time || a.charId !== charId) return false;
        var aptDate = ((a.time.year || ts.year || 0) * 10000) + ((a.time.month || 0) * 100) + (a.time.day || 0);
        return aptDate === currentDate;
    });
}

function createMeetupAppointment(charId, placeId, placeName, hour, minute, vars, dateInfo) {
    if (!vars.phoneAppointments) vars.phoneAppointments = [];
    var t = vars.timeSys || {};
    var d = dateInfo || { day: t.day, month: t.month, year: t.year };
    vars.phoneAppointments.push({
        id: 'apt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        charId: charId,
        time: { day: d.day, month: d.month, year: d.year, hour: hour, minute: minute },
        location: placeId,
        locationName: placeName || placeId,
        type: 'meetup',
        status: 'pending'
    });
}

function canShowMeetupButton(charId, vars) {
    var c = vars.characters && vars.characters[charId];
    var friendship = c && c.stats ? (c.stats.friendship || 0) : 0;
    if (friendship < 20) return false;
    return getMeetupTimeOptions(charId, vars).length > 0;
}

function getMeetupLocations(vars) {
    var setupObj = getStorySetupObj();
    var out = [];
    var seen = {};
    var ids = [];
    if (setupObj.navCards) {
        Object.keys(setupObj.navCards).forEach(function (id) {
            if (setupObj.navCards[id] && setupObj.navCards[id].meetup === true && ids.indexOf(id) === -1) ids.push(id);
        });
    }
    if (window.setup && window.setup.navCards) {
        Object.keys(window.setup.navCards).forEach(function (id) {
            if (window.setup.navCards[id] && window.setup.navCards[id].meetup === true && ids.indexOf(id) === -1) ids.push(id);
        });
    }
    ids.forEach(function (id) {
        if (seen[id]) return;
        if (!isDiscoveredLocation(id, vars)) return;
        seen[id] = true;
        var nav = (setupObj.navCards && setupObj.navCards[id]) || (window.setup && window.setup.navCards && window.setup.navCards[id]);
        var name = (nav && nav.name) ? nav.name : id;
        out.push({ id: id, name: name });
    });
    return out;
}

function getCurrentScheduleForChar(charId, vars, dateInfo) {
    var setupObj = getStorySetupObj();
    var schedules = setupObj.schedules || {};
    var sch = schedules[charId];
    if (!sch) return null;
    var ts = vars.timeSys || {};
    var d = dateInfo || { year: ts.year, month: ts.month, day: ts.day, weekday: ts.weekday };
    var scheduleType = (d.weekday === 0) ? 'sunday' : ((d.weekday === 6) ? 'weekend' : 'weekday');
    var phase = null;
    var curDate = (d.year || 0) * 10000 + (d.month || 0) * 100 + (d.day || 0);
    if (charId === 'father' && vars.importantDates && vars.importantDates.fatherWorkStart) {
        var f = vars.importantDates.fatherWorkStart;
        if (f.year && f.month && f.day) {
            var workDate = (f.year || 0) * 10000 + (f.month || 0) * 100 + (f.day || 0);
            phase = curDate >= workDate ? 'postWork' : 'preWork';
        }
    } else if (charId === 'father' && (sch.preWork || sch.postWork)) {
        phase = sch.postWork ? 'postWork' : 'preWork';
    }
    if (charId === 'brother' && setupObj.schoolCalendar && setupObj.schoolCalendar.vacations) {
        var md = (d.month || 0) * 100 + (d.day || 0);
        var isVac = false;
        (setupObj.schoolCalendar.vacations || []).forEach(function (v) {
            var s = (v.startMonth || 0) * 100 + (v.startDay || 0);
            var e = (v.endMonth || 0) * 100 + (v.endDay || 0);
            if (s <= e) {
                if (md >= s && md <= e) isVac = true;
            } else {
                if (md >= s || md <= e) isVac = true;
            }
        });
        phase = isVac ? 'vacation' : 'school';
    } else if (charId === 'brother' && (sch.school || sch.vacation)) {
        phase = sch.school ? 'school' : 'vacation';
    }
    var daySchedule = null;
    if (phase && sch[phase]) {
        daySchedule = sch[phase][scheduleType] || ((scheduleType === 'sunday') ? sch[phase].weekend : null);
    } else {
        daySchedule = sch[scheduleType] || ((scheduleType === 'sunday') ? sch.weekend : null);
    }
    return daySchedule || null;
}

function getStatusAtMinute(schedule, minuteOfDay) {
    if (!schedule || !schedule.length) return 'busy';
    var cur = schedule[schedule.length - 1];
    for (var i = 0; i < schedule.length; i++) {
        var slot = schedule[i];
        var slotMinute = (slot.hour || 0) * 60 + (slot.minute || 0);
        if (slotMinute <= minuteOfDay) cur = slot;
    }
    return cur && cur.status ? cur.status : 'busy';
}

function isMeetupTimeBlocked(hour, minute, vars, dateInfo) {
    var ts = vars.timeSys || {};
    var d = dateInfo || { day: ts.day, month: ts.month, year: ts.year };
    var candidate = hour * 60 + minute;
    var list = vars.phoneAppointments || [];
    for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (!a || a.status !== 'pending' || !a.time) continue;
        if ((a.time.day !== d.day) || (a.time.month !== d.month) || ((a.time.year || 0) !== (d.year || 0))) continue;
        var existing = (a.time.hour || 0) * 60 + (a.time.minute || 0);
        if (candidate === existing || candidate === (existing + 60)) return true;
    }
    return false;
}

function getMeetupTimeOptions(charId, vars) {
    cleanupExpiredMeetups(vars);
    var ts = vars.timeSys || {};
    var options = [];
    var dates = [getDateWithOffset(ts, 0), getDateWithOffset(ts, 1)];
    for (var d = 0; d < dates.length; d++) {
        var dateInfo = dates[d];
        var schedule = getCurrentScheduleForChar(charId, vars, dateInfo);
        var seen = {};
        var timeCandidates = [];
        if (schedule && schedule.length) {
            schedule.forEach(function (slot) {
                if (!slot || slot.status !== 'available' || slot.meetup !== true) return;
                var h = slot.hour || 0;
                var m = slot.minute || 0;
                var key = String(h) + ':' + String(m);
                if (seen[key]) return;
                seen[key] = true;
                timeCandidates.push({ hour: h, minute: m });
            });
        }
        var nowMin = (ts.hour || 0) * 60 + (ts.minute || 0);
        for (var i = 0; i < timeCandidates.length; i++) {
            var h = timeCandidates[i].hour;
            var m = timeCandidates[i].minute;
            var minuteOfDay = h * 60 + m;
            if (d === 0 && minuteOfDay <= nowMin) continue;
            if (isMeetupTimeBlocked(h, m, vars, dateInfo)) continue;
            options.push({ hour: h, minute: m, day: dateInfo.day, month: dateInfo.month, year: dateInfo.year, dayOffset: d });
        }
        if (options.length) break;
    }
    return options;
}

function getMeetupPlaceListHtml(charId, vars) {
    cleanupExpiredMeetups(vars);
    var places = getMeetupLocations(vars);
    if (!places.length) {
        return '<div class="phone-messages-thread" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a place</div><div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No meetup places available</p><p class="phone-app-placeholder-sub">Discover more public locations first.</p></div></div>';
    }
    var list = places.map(function (p) {
        return '<div class="phone-topic-item phone-meetup-place-item" data-place-id="' + escapeHtml(p.id) + '" data-place-name="' + escapeHtml(p.name) + '"><div class="phone-topic-label">' + escapeHtml(p.name) + '</div></div>';
    }).join('');
    return '<div class="phone-messages-thread phone-topic-list-view" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a place</div><div class="phone-messages-list phone-topic-list">' + list + '</div></div>';
}

function getMeetupTimeListHtml(charId, vars, placeId, placeName) {
    cleanupExpiredMeetups(vars);
    var options = getMeetupTimeOptions(charId, vars);
    if (!options.length) {
        return '<div class="phone-messages-thread" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a time</div><div class="phone-app-placeholder"><p class="phone-app-placeholder-text">No suitable times today</p><p class="phone-app-placeholder-sub">Try another day or character.</p></div></div>';
    }
    var list = options.map(function (o) {
        var hh = String(o.hour).padStart(2, '0');
        var mm = String(o.minute).padStart(2, '0');
        var label = (o.dayOffset > 0 ? 'Tomorrow ' : 'Today ') + hh + ':' + mm;
        return '<div class="phone-topic-item phone-meetup-time-item" data-hour="' + o.hour + '" data-minute="' + o.minute + '" data-day="' + o.day + '" data-month="' + o.month + '" data-year="' + o.year + '" data-day-offset="' + o.dayOffset + '"><div class="phone-topic-label">' + label + '</div></div>';
    }).join('');
    return '<div class="phone-messages-thread phone-topic-list-view" data-char-id="' + charId + '"><div class="phone-thread-name">Pick a time - ' + escapeHtml(placeName || placeId || '') + '</div><div class="phone-messages-list phone-topic-list">' + list + '</div></div>';
}

function getMeetupInlineTimeOptionsHtml(charId, vars) {
    var options = getMeetupTimeOptions(charId, vars);
    if (!options.length) {
        return '<div class="phone-thread-inline-prompt"><p class="phone-app-placeholder-text">No suitable times today</p><p class="phone-app-placeholder-sub">Try another day or character.</p><button type="button" class="phone-topic-btn" id="phone-meetup-cancel-btn">Cancel</button></div>';
    }
    var list = options.map(function (o) {
        var hh = String(o.hour).padStart(2, '0');
        var mm = String(o.minute).padStart(2, '0');
        var label = (o.dayOffset > 0 ? 'Tomorrow ' : 'Today ') + hh + ':' + mm;
        return '<button type="button" class="phone-topic-btn phone-meetup-time-item" data-hour="' + o.hour + '" data-minute="' + o.minute + '" data-day="' + o.day + '" data-month="' + o.month + '" data-year="' + o.year + '" data-day-offset="' + o.dayOffset + '">' + label + '</button>';
    }).join('');
    return '<div class="phone-thread-inline-prompt"><div class="phone-thread-name">Pick a time</div><div class="phone-thread-actions">' + list + '<button type="button" class="phone-topic-btn" id="phone-meetup-cancel-btn">Cancel</button></div></div>';
}

function getMeetupInlinePlaceOptionsHtml(charId, vars) {
    var places = getMeetupLocations(vars);
    if (!places.length) {
        return '<div class="phone-thread-inline-prompt"><p class="phone-app-placeholder-text">No meetup places available</p><p class="phone-app-placeholder-sub">Discover more public locations first.</p><button type="button" class="phone-topic-btn" id="phone-meetup-cancel-btn">Cancel</button></div>';
    }
    var list = places.map(function (p) {
        return '<button type="button" class="phone-topic-btn phone-meetup-place-item" data-place-id="' + escapeHtml(p.id) + '" data-place-name="' + escapeHtml(p.name) + '">' + escapeHtml(p.name) + '</button>';
    }).join('');
    return '<div class="phone-thread-inline-prompt"><div class="phone-thread-name">Pick a place</div><div class="phone-thread-actions">' + list + '<button type="button" class="phone-topic-btn" id="phone-meetup-cancel-btn">Cancel</button></div></div>';
}
